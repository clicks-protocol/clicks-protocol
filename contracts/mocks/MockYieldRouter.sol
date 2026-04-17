// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @notice Minimal yield router stub for SplitterV5 unit tests.
///         Tracks per-agent principal and returns a canned "received" amount
///         on withdraw so tests can exercise fee-tier logic without a live
///         Aave/Morpho pool.
contract MockYieldRouter {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    mapping(address => uint256) public agentDeposited;
    mapping(address => uint256) public nextWithdrawReturn;

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function deposit(uint256 amount, address agent) external {
        agentDeposited[agent] += amount;
    }

    /// @notice Configure what the next withdraw(principal, agent) returns.
    function setNextWithdrawReturn(address agent, uint256 totalOut) external {
        nextWithdrawReturn[agent] = totalOut;
    }

    function withdraw(uint256 principalRequested, address agent) external returns (uint256) {
        uint256 out = nextWithdrawReturn[agent];
        require(out > 0, "mock: set nextWithdrawReturn first");
        nextWithdrawReturn[agent] = 0;
        agentDeposited[agent] -= principalRequested;
        usdc.safeTransfer(msg.sender, out);
        return out;
    }
}
