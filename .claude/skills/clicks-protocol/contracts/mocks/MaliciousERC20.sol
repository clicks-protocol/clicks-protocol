// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Malicious ERC20 with transfer hooks for reentrancy testing
contract MaliciousERC20 is ERC20 {
    address public reentrancyTarget;
    bool public hookEnabled;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20(name, symbol) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function setReentrancyTarget(address target) external {
        reentrancyTarget = target;
        hookEnabled = true;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        bool success = super.transfer(to, amount);
        
        if (hookEnabled && reentrancyTarget != address(0)) {
            // Call back into target during transfer
            (bool callSuccess,) = reentrancyTarget.call(
                abi.encodeWithSignature("withdrawYield(address,uint256)", msg.sender, 0)
            );
            // Ignore if call fails
        }

        return success;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        bool success = super.transferFrom(from, to, amount);
        
        if (hookEnabled && reentrancyTarget != address(0)) {
            (bool callSuccess,) = reentrancyTarget.call(
                abi.encodeWithSignature("withdrawYield(address,uint256)", from, 0)
            );
        }

        return success;
    }
}
