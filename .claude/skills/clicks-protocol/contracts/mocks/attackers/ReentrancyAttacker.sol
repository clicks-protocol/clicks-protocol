// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISplitter {
    function withdrawYield(address agent, uint256 amount) external;
}

interface IRouter {
    function withdraw(uint256 amount, address agent) external returns (uint256);
}

/// @notice Attacker contract that attempts reentrancy via receive() hook
contract ReentrancyAttacker {
    ISplitter public splitter;
    IRouter public router;
    IERC20 public usdc;
    bool public attacking;
    uint256 public attackCount;

    constructor(address _splitter, address _router, address _usdc) {
        splitter = ISplitter(_splitter);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        attacking = true;
        attackCount = 0;
        splitter.withdrawYield(address(this), 0);
    }

    receive() external payable {
        if (attacking && attackCount < 3) {
            attackCount++;
            // Try to re-enter withdrawYield
            splitter.withdrawYield(address(this), 0);
        }
    }

    // Fallback for ERC20 transfers
    fallback() external payable {
        if (attacking && attackCount < 3) {
            attackCount++;
            splitter.withdrawYield(address(this), 0);
        }
    }
}

/// @notice Nested withdrawal attacker
contract NestedWithdrawalAttacker {
    ISplitter public splitter;
    IERC20 public usdc;
    uint256 public depth;

    constructor(address _splitter, address _usdc) {
        splitter = ISplitter(_splitter);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        depth = 0;
        splitter.withdrawYield(address(this), 0);
    }

    receive() external payable {
        if (depth < 5) {
            depth++;
            splitter.withdrawYield(address(this), 0);
        }
    }
}

/// @notice Payment reentrancy attacker
contract PaymentReentrancyAttacker {
    ISplitter public splitter;
    IERC20 public usdc;
    bool public attacking;

    constructor(address _splitter, address _usdc) {
        splitter = ISplitter(_splitter);
        usdc = IERC20(_usdc);
    }

    function attack(uint256 amount) external {
        attacking = true;
        usdc.approve(address(splitter), type(uint256).max);
        // This will be called from the attacker contract which should trigger hooks
        // But since receivePayment uses transferFrom, we need to be the caller
        // So this test might need adjustment
    }

    receive() external payable {
        if (attacking) {
            attacking = false;
            // Try to re-enter receivePayment during payment split
            // (This requires us to be in the middle of a transfer callback)
        }
    }
}

/// @notice Read-only reentrancy attacker
contract ReadOnlyReentrancyAttacker {
    IRouter public router;
    ISplitter public splitter;
    IERC20 public usdc;

    constructor(address _router, address _splitter, address _usdc) {
        router = IRouter(_router);
        splitter = ISplitter(_splitter);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        splitter.withdrawYield(address(this), 0);
    }

    receive() external payable {
        // Try to read balance during state change
        try router.withdraw(0, address(this)) returns (uint256) {
            // If this succeeds, we exploited read-only reentrancy
        } catch {
            // Expected to fail
        }
    }
}

/// @notice Cross-function reentrancy attacker (deposit during withdraw)
contract CrossFunctionReentrancyAttacker {
    ISplitter public splitter;
    IERC20 public usdc;
    bool public attacking;

    constructor(address _splitter, address _usdc) {
        splitter = ISplitter(_splitter);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        attacking = true;
        usdc.approve(address(splitter), type(uint256).max);
        splitter.withdrawYield(address(this), 0);
    }

    receive() external payable {
        if (attacking) {
            attacking = false;
            // Try to deposit while withdrawing
            // (Requires us to have USDC and approval)
        }
    }
}
