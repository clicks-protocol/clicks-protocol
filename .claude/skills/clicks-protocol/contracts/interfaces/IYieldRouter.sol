// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IYieldRouter
/// @notice Interface for Clicks yield routing adapters
/// @dev Each supported protocol (Aave, Morpho, Ondo) implements this interface
interface IYieldRouter {
    /// @notice Emitted when funds are deposited into this yield source
    event Deposited(address indexed agent, uint256 amount);

    /// @notice Emitted when funds are withdrawn from this yield source
    event Withdrawn(address indexed agent, uint256 amount);

    /// @notice Deposit USDC into the yield source
    /// @param amount Amount of USDC to deposit (6 decimals)
    /// @return shares Shares or aTokens received (protocol-specific)
    function deposit(uint256 amount) external returns (uint256 shares);

    /// @notice Withdraw USDC from the yield source
    /// @param amount Amount of USDC to withdraw (6 decimals)
    /// @return received Actual USDC received (may differ slightly from amount)
    function withdraw(uint256 amount) external returns (uint256 received);

    /// @notice Get current annualized yield rate
    /// @return apy Current APY in basis points (e.g. 900 = 9.00%)
    function getAPY() external view returns (uint256 apy);

    /// @notice Get total USDC balance held by this router for all agents
    /// @return balance Total USDC balance (6 decimals)
    function getTotalBalance() external view returns (uint256 balance);

    /// @notice Get USDC balance for a specific agent
    /// @param agent Address of the agent
    /// @return balance Agent's USDC balance in this yield source (6 decimals)
    function getAgentBalance(address agent) external view returns (uint256 balance);

    /// @notice Address of the underlying protocol pool/vault
    /// @return pool Protocol contract address
    function getProtocolAddress() external view returns (address pool);

    /// @notice Human-readable name of this yield source
    /// @return name e.g. "Aave V3", "Morpho", "Ondo USDY"
    function name() external view returns (string memory);
}
