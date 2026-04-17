// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal view surface of the ERC-8004 Identity Registry.
///         The registry is an upgradeable ERC-721 where each agent NFT
///         has an `agentId` equal to its tokenId.
interface IIdentityRegistry {
    /// @notice Standard ERC-721 ownership query — agentId is the tokenId.
    function ownerOf(uint256 agentId) external view returns (address);

    /// @notice Standard ERC-721 balance query — total agents owned by `owner`.
    function balanceOf(address owner) external view returns (uint256);
}

/// @notice Minimal view surface of the ERC-8004 Reputation Registry.
///         Reputation is stored as a stream of feedback entries per
///         (agentId, clientAddress) pair. `getSummary` aggregates them
///         into a fixed-point `(count, value, decimals)` tuple.
///
///         Pass `clientAddresses = []` to include feedback from all clients.
///         Pass empty strings for tag1/tag2 to skip tag filtering.
interface IReputationRegistry {
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals);
}
