// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC8004.sol";

/// @title ClicksReputationMultiplierV1
/// @notice Maps an agent's ERC-8004 reputation to a variable protocol-fee tier.
///         A future SplitterV5 reads `feeBpsFor(agent, agentId)` in place of a
///         hardcoded fee constant, giving reputation-rich agents a lower fee.
///
///         Why trusted attestors?
///         The live Reputation Registry on Base does NOT support wildcard
///         queries — a getSummary() call must enumerate specific client
///         (attestor) addresses. That is deliberate: reputation in ERC-8004
///         is subjective, and each caller picks whose attestations they trust.
///         This contract maintains an owner-managed attestor set and passes
///         it through on every tier query.
///
///         Rules
///         - Fee applies to yield only.
///         - An agent is keyed by the wallet owning its ERC-8004 Identity NFT.
///         - Feedback is aggregated across the trusted attestor set, no tag filter.
///         - If the attestor set is empty, every agent returns FEE_COLD.
///
///         Tier table (avg = summary / count, normalised to bps):
///             cold (no identity, no feedback, or bad avg):  3.00%
///             count < 10:                                   2.50%
///             count >= 10 && avg >= 50%:                    2.00%
///             count >= 50 && avg >= 75%:                    1.50%
///             count >= 100 && avg >= 90%:                   1.00%
///
///         The tier table and constants are immutable. A second version ships as V2.
contract ClicksReputationMultiplierV1 is Ownable {
    // ─── Registries ───────────────────────────────────────────────────────────

    IIdentityRegistry public immutable identity;
    IReputationRegistry public immutable reputation;

    // ─── Trusted attestor set ────────────────────────────────────────────────

    address[] private _trustedAttestors;
    mapping(address => bool) public isTrustedAttestor;

    // ─── Fee tiers (basis points of yield) ────────────────────────────────────

    uint16 public constant FEE_COLD  = 300;
    uint16 public constant FEE_LOW   = 250;
    uint16 public constant FEE_MID   = 200;
    uint16 public constant FEE_HIGH  = 150;
    uint16 public constant FEE_ELITE = 100;

    uint64 public constant COUNT_LOW   = 10;
    uint64 public constant COUNT_HIGH  = 50;
    uint64 public constant COUNT_ELITE = 100;

    uint256 public constant AVG_PASS  = 5_000;
    uint256 public constant AVG_HIGH  = 7_500;
    uint256 public constant AVG_ELITE = 9_000;

    uint8 public constant MAX_DECIMALS = 18;

    // ─── Events ───────────────────────────────────────────────────────────────

    event AttestorAdded(address indexed attestor);
    event AttestorRemoved(address indexed attestor);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAddress();
    error AlreadyTrusted();
    error NotTrusted();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _identity, address _reputation) Ownable(msg.sender) {
        if (_identity == address(0)) revert ZeroAddress();
        if (_reputation == address(0)) revert ZeroAddress();
        identity = IIdentityRegistry(_identity);
        reputation = IReputationRegistry(_reputation);
    }

    // ─── Admin — attestor management ──────────────────────────────────────────

    function addAttestor(address attestor) external onlyOwner {
        if (attestor == address(0)) revert ZeroAddress();
        if (isTrustedAttestor[attestor]) revert AlreadyTrusted();
        isTrustedAttestor[attestor] = true;
        _trustedAttestors.push(attestor);
        emit AttestorAdded(attestor);
    }

    function removeAttestor(address attestor) external onlyOwner {
        if (!isTrustedAttestor[attestor]) revert NotTrusted();
        isTrustedAttestor[attestor] = false;

        uint256 len = _trustedAttestors.length;
        for (uint256 i = 0; i < len; i++) {
            if (_trustedAttestors[i] == attestor) {
                _trustedAttestors[i] = _trustedAttestors[len - 1];
                _trustedAttestors.pop();
                break;
            }
        }
        emit AttestorRemoved(attestor);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function trustedAttestors() external view returns (address[] memory) {
        return _trustedAttestors;
    }

    function trustedAttestorCount() external view returns (uint256) {
        return _trustedAttestors.length;
    }

    /// @notice Fee in basis points applied to yield for `agent`.
    /// @dev Returns FEE_COLD for: zero address, unowned agentId, mismatched
    ///      owner, empty attestor set, or registry revert.
    function feeBpsFor(address agent, uint256 agentId) external view returns (uint16) {
        if (agent == address(0)) return FEE_COLD;
        if (_trustedAttestors.length == 0) return FEE_COLD;

        address owner;
        try identity.ownerOf(agentId) returns (address o) {
            owner = o;
        } catch {
            return FEE_COLD;
        }
        if (owner != agent) return FEE_COLD;

        return _tierFor(agentId);
    }

    /// @notice Raw tier lookup for an agentId. Skips ownership check.
    function feeBpsForAgentId(uint256 agentId) external view returns (uint16) {
        if (_trustedAttestors.length == 0) return FEE_COLD;
        return _tierFor(agentId);
    }

    /// @notice Decomposes the tier decision for UIs and indexers.
    function quote(uint256 agentId)
        external
        view
        returns (uint64 count, uint256 avgBps, uint16 feeBps)
    {
        if (_trustedAttestors.length == 0) {
            return (0, 0, FEE_COLD);
        }
        address[] memory attestors = _trustedAttestors;
        (uint64 c, int128 sv, uint8 dec) = reputation.getSummary(agentId, attestors, "", "");
        count = c;
        avgBps = _averageBps(c, sv, dec);
        feeBps = _tierFromCountAndAvg(c, avgBps);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _tierFor(uint256 agentId) internal view returns (uint16) {
        address[] memory attestors = _trustedAttestors;
        try reputation.getSummary(agentId, attestors, "", "") returns (
            uint64 count,
            int128 summaryValue,
            uint8 decimals
        ) {
            if (count == 0) return FEE_COLD;
            uint256 avg = _averageBps(count, summaryValue, decimals);
            return _tierFromCountAndAvg(count, avg);
        } catch {
            return FEE_COLD;
        }
    }

    function _averageBps(uint64 count, int128 summaryValue, uint8 decimals)
        internal
        pure
        returns (uint256)
    {
        if (count == 0) return 0;
        if (summaryValue <= 0) return 0;

        uint256 sum = uint256(uint128(summaryValue));
        uint8 d = decimals > MAX_DECIMALS ? MAX_DECIMALS : decimals;

        // avgBps = (sum * 10_000) / (count * 10^d)
        uint256 numerator = sum * 10_000;
        uint256 denominator = uint256(count) * (10 ** uint256(d));
        if (denominator == 0) return 0;

        uint256 avg = numerator / denominator;
        if (avg > 10_000) avg = 10_000;
        return avg;
    }

    function _tierFromCountAndAvg(uint64 count, uint256 avgBps) internal pure returns (uint16) {
        if (count == 0) return FEE_COLD;
        if (count < COUNT_LOW) return FEE_LOW;
        if (avgBps < AVG_PASS) return FEE_COLD;
        if (count >= COUNT_ELITE && avgBps >= AVG_ELITE) return FEE_ELITE;
        if (count >= COUNT_HIGH && avgBps >= AVG_HIGH) return FEE_HIGH;
        return FEE_MID;
    }
}
