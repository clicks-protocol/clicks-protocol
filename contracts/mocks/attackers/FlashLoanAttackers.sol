// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Stub interfaces for attack scenarios
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

interface IMorpho {
    function supply(
        bytes32 marketId,
        uint256 amount,
        uint256 shares,
        address onBehalfOf,
        bytes calldata data
    ) external;
}

interface IRouter {
    function deposit(uint256 amount, address agent) external;
    function withdraw(uint256 amount, address agent) external returns (uint256);
    function getAaveAPY() external view returns (uint256);
    function getMorphoAPY() external view returns (uint256);
}

interface ISplitter {
    function receivePayment(uint256 amount, address agent) external;
    function withdrawYield(address agent, uint256 amount) external;
}

/// @notice Flash loan APY manipulation attacker (stub)
contract FlashLoanAPYAttacker {
    IAavePool public aavePool;
    IMorpho public morpho;
    IRouter public router;
    IERC20 public usdc;

    constructor(address _aave, address _morpho, address _router, address _usdc) {
        aavePool = IAavePool(_aave);
        morpho = IMorpho(_morpho);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        // Attempt: Flash borrow → deposit huge amount to Aave → manipulate APY → profit
        // In practice this would call a real flash loan provider (Aave, Balancer, etc.)
        // Here we just simulate the logic

        uint256 flashAmount = usdc.balanceOf(address(this));
        if (flashAmount == 0) return;

        // Try to manipulate Aave liquidity rate
        usdc.approve(address(aavePool), flashAmount);
        aavePool.supply(address(usdc), flashAmount, address(this), 0);

        // Read APY (now manipulated)
        uint256 apy = router.getAaveAPY();

        // Try to trigger rebalance (but router has no public rebalance function!)
        // So attack fails here

        // Withdraw
        aavePool.withdraw(address(usdc), flashAmount, address(this));
    }
}

/// @notice Flash utilization manipulation attacker
contract FlashUtilizationAttacker {
    IMorpho public morpho;
    IRouter public router;
    IERC20 public usdc;

    constructor(address _morpho, address _router, address _usdc) {
        morpho = IMorpho(_morpho);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        // Manipulate Morpho utilization ratio to fake APY
        // Similar logic to above
    }
}

/// @notice Flash drain attacker
contract FlashDrainAttacker {
    ISplitter public splitter;
    IRouter public router;
    IERC20 public usdc;

    constructor(address _splitter, address _router, address _usdc) {
        splitter = ISplitter(_splitter);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        uint256 amount = usdc.balanceOf(address(this));
        usdc.approve(address(splitter), amount);

        // Flash deposit
        splitter.receivePayment(amount, address(this));

        // Immediate withdraw (should get ≈ same amount back, no profit)
        splitter.withdrawYield(address(this), 0);
    }
}

/// @notice Flash sandwich attacker
contract FlashSandwichAttacker {
    ISplitter public splitter;
    IRouter public router;
    IERC20 public usdc;

    constructor(address _splitter, address _router, address _usdc) {
        splitter = ISplitter(_splitter);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        uint256 amount = usdc.balanceOf(address(this));
        usdc.approve(address(splitter), amount);

        // Sandwich: deposit before victim, withdraw after
        splitter.receivePayment(amount, address(this));
        // (Victim interaction would happen here in real scenario)
        splitter.withdrawYield(address(this), 0);
    }
}

/// @notice Registry flash attacker (mass registration)
contract RegistryFlashAttacker {
    address public registry;

    constructor(address _registry) {
        registry = _registry;
    }

    function attack(uint256 count) external {
        // Try to register many agents quickly
        // (In practice this just tests registry's gas efficiency)
    }
}

/// @notice Oracle manipulation attacker
contract OracleManipulationAttacker {
    IAavePool public aavePool;
    IRouter public router;
    IERC20 public usdc;

    constructor(address _aave, address _router, address _usdc) {
        aavePool = IAavePool(_aave);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        // Flash deposit to Aave to manipulate currentLiquidityRate
        uint256 amount = usdc.balanceOf(address(this));
        usdc.approve(address(aavePool), amount);
        aavePool.supply(address(usdc), amount, address(this), 0);

        // APY read happens atomically, can't persist across blocks
        aavePool.withdraw(address(usdc), amount, address(this));
    }
}

/// @notice Front-run flash attacker
contract FrontRunFlashAttacker {
    ISplitter public splitter;
    IRouter public router;
    IERC20 public usdc;

    constructor(address _splitter, address _router, address _usdc) {
        splitter = ISplitter(_splitter);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        uint256 amount = usdc.balanceOf(address(this));
        usdc.approve(address(splitter), amount);

        // Front-run victim's withdraw by draining protocol first
        splitter.receivePayment(amount, address(this));
        splitter.withdrawYield(address(this), 0);
    }
}

/// @notice Morpho share manipulator
contract MorphoShareManipulator {
    IMorpho public morpho;
    IRouter public router;
    IERC20 public usdc;

    constructor(address _morpho, address _router, address _usdc) {
        morpho = IMorpho(_morpho);
        router = IRouter(_router);
        usdc = IERC20(_usdc);
    }

    function attack() external {
        // Try to inflate totalSupplyShares/totalSupplyAssets ratio
        // To drain other depositors via share price manipulation
    }
}
