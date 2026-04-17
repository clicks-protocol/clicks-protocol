// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IERC8004.sol";

/// @notice Test-only ERC-8004 Identity Registry — tracks ownerOf per agentId.
contract MockIdentityRegistry is IIdentityRegistry {
    mapping(uint256 => address) private _owners;

    function setOwner(uint256 agentId, address owner) external {
        _owners[agentId] = owner;
    }

    function ownerOf(uint256 agentId) external view override returns (address) {
        address o = _owners[agentId];
        require(o != address(0), "nonexistent");
        return o;
    }

    function balanceOf(address) external pure override returns (uint256) {
        return 0; // not used by the multiplier
    }
}

/// @notice Test-only ERC-8004 Reputation Registry — returns a canned summary
///         per agentId. Ignores the client/tag filter args.
contract MockReputationRegistry is IReputationRegistry {
    struct Summary {
        uint64 count;
        int128 value;
        uint8 decimals;
        bool shouldRevert;
    }

    mapping(uint256 => Summary) public summaries;

    function setSummary(uint256 agentId, uint64 count, int128 value, uint8 decimals) external {
        summaries[agentId] = Summary(count, value, decimals, false);
    }

    function setRevert(uint256 agentId, bool flag) external {
        Summary storage s = summaries[agentId];
        s.shouldRevert = flag;
    }

    function getSummary(
        uint256 agentId,
        address[] calldata,
        string calldata,
        string calldata
    ) external view override returns (uint64 count, int128 summaryValue, uint8 summaryValueDecimals) {
        Summary memory s = summaries[agentId];
        require(!s.shouldRevert, "mock: forced revert");
        return (s.count, s.value, s.decimals);
    }
}
