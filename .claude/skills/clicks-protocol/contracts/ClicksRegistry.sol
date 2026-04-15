// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClicksRegistry
/// @notice Maps AI agents to their human operators
/// @dev Operators register their agents. Permissionless for now — anyone can register.
///      Future: add operator staking or verification layer.
contract ClicksRegistry is Ownable {

    // ─── State ────────────────────────────────────────────────────────────────

    /// @notice Maps agent address → operator address
    mapping(address => address) public agentOperator;

    /// @notice Maps operator → list of their agents
    mapping(address => address[]) public operatorAgents;

    /// @notice Total registered agents
    uint256 public totalAgents;

    // ─── Events ───────────────────────────────────────────────────────────────

    event AgentRegistered(address indexed agent, address indexed operator);
    event AgentDeregistered(address indexed agent, address indexed operator);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAddress();
    error AlreadyRegistered();
    error NotRegistered();
    error NotOperator();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Core Functions ───────────────────────────────────────────────────────

    /// @notice Register an agent under the caller as operator
    /// @param agent Agent wallet address to register
    function registerAgent(address agent) external {
        if (agent == address(0)) revert ZeroAddress();
        if (agentOperator[agent] != address(0)) revert AlreadyRegistered();

        agentOperator[agent] = msg.sender;
        operatorAgents[msg.sender].push(agent);
        unchecked { totalAgents++; }

        emit AgentRegistered(agent, msg.sender);
    }

    /// @notice Deregister an agent (only the operator can deregister)
    /// @param agent Agent wallet address to deregister
    function deregisterAgent(address agent) external {
        address operator = agentOperator[agent];
        if (operator == address(0)) revert NotRegistered();
        if (operator != msg.sender && owner() != msg.sender) revert NotOperator();

        // Linear search + swap-and-pop (O(n) but registerAgent is cheaper)
        address[] storage agents = operatorAgents[operator];
        uint256 len = agents.length;
        uint256 idx;
        for (uint256 i; i < len;) {
            if (agents[i] == agent) { idx = i; break; }
            unchecked { ++i; }
        }
        uint256 lastIdx;
        unchecked { lastIdx = len - 1; }
        if (idx != lastIdx) {
            agents[idx] = agents[lastIdx];
        }
        agents.pop();
        delete agentOperator[agent];
        unchecked { totalAgents--; }

        emit AgentDeregistered(agent, operator);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// @notice Check if an agent is registered
    function isRegistered(address agent) external view returns (bool) {
        return agentOperator[agent] != address(0);
    }

    /// @notice Get operator for an agent
    function getOperator(address agent) external view returns (address) {
        return agentOperator[agent];
    }

    /// @notice Get all agents for an operator
    function getAgents(address operator) external view returns (address[] memory) {
        return operatorAgents[operator];
    }

    /// @notice Get agent count for an operator
    function getAgentCount(address operator) external view returns (uint256) {
        return operatorAgents[operator].length;
    }
}
