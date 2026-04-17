// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC8004.sol";

/// @title ClicksReputationMultiplierV1
/// @notice Maps an agent's ERC-8004 reputation to a variable protocol-fee tier.
///         A future SplitterV5 reads `feeBpsFor(agent)` in place of a hardcoded
///         fee constant, giving reputation-rich agents a lower fee on yield.
///
///         Rules
///         - Fee applies to yield only. Principal is untouched (unchanged from V2).
///         - An agent is identified by the wallet that owns its ERC-8004 Identity NFT.
///         - We aggregate feedback from all clients with no tag filter.
///         - We translate the int128 fixed-point summary into a normalised score
///           in basis points (0..10_000) per feedback entry and use the average
///           across entries as the tier key.
///
///         Tier table (score = average rating in bps):
///             cold (no agentId, or count == 0):         3.00%
///             count < 10:                               2.50%
///             count >= 10 && avg < 5_000 bps (50%):     3.00% (quality penalty)
///             count >= 10 && avg >= 5_000:              2.00%
///             count >= 50 && avg >= 7_500:              1.50%
///             count >= 100 && avg >= 9_000:             1.00%
///
///         The tier table is immutable; a second version would ship as V2.
contract ClicksReputationMultiplierV1 {
    // ─── Registries ───────────────────────────────────────────────────────────

    IIdentityRegistry public immutable identity;
    IReputationRegistry public immutable reputation;

    // ─── Fee tiers (basis points of yield) ────────────────────────────────────

    uint16 public constant FEE_COLD  = 300;  // 3.0% — no identity or no feedback
    uint16 public constant FEE_LOW   = 250;  // 2.5% — some feedback, not enough signal
    uint16 public constant FEE_MID   = 200;  // 2.0% — V2 default
    uint16 public constant FEE_HIGH  = 150;  // 1.5% — proven
    uint16 public constant FEE_ELITE = 100;  // 1.0% — top tier

    // Thresholds for count (number of feedback entries)
    uint64 public constant COUNT_LOW   = 10;
    uint64 public constant COUNT_HIGH  = 50;
    uint64 public constant COUNT_ELITE = 100;

    // Thresholds for average score in bps (0..10_000)
    uint256 public constant AVG_PASS  = 5_000; // 50%
    uint256 public constant AVG_HIGH  = 7_500; // 75%
    uint256 public constant AVG_ELITE = 9_000; // 90%

    // Maximum decimals we honour when interpreting int128 summary values.
    // ERC-8004 allows any uint8; we clamp aggressively to avoid overflow.
    uint8 public constant MAX_DECIMALS = 18;

    // ─── Errors ───────────────────────────────────────────────────────────────

    error ZeroAddress();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor(address _identity, address _reputation) {
        if (_identity == address(0)) revert ZeroAddress();
        if (_reputation == address(0)) revert ZeroAddress();
        identity = IIdentityRegistry(_identity);
        reputation = IReputationRegistry(_reputation);
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    /// @notice Fee in basis points applied to yield for `agent`.
    /// @dev Safe to call for any address. Returns FEE_COLD for wallets with
    ///      no ERC-8004 identity, no feedback, or non-positive average.
    function feeBpsFor(address agent, uint256 agentId) external view returns (uint16) {
        if (agent == address(0)) return FEE_COLD;

        // Confirm the agentId is actually owned by `agent`. If the caller
        // passes a foreign agentId we refuse to use it — this keeps the
        // mapping wallet→tier honest.
        address owner;
        try identity.ownerOf(agentId) returns (address o) {
            owner = o;
        } catch {
            return FEE_COLD;
        }
        if (owner != agent) return FEE_COLD;

        return _tierFor(agentId);
    }

    /// @notice Raw tier lookup given an agentId, skipping the ownership check.
    ///         Useful for off-chain quoting or tools.
    function feeBpsForAgentId(uint256 agentId) external view returns (uint16) {
        return _tierFor(agentId);
    }

    /// @notice Decomposes the tier decision for UIs and indexers.
    function quote(uint256 agentId)
        external
        view
        returns (uint64 count, uint256 avgBps, uint16 feeBps)
    {
        address[] memory noClients = new address[](0);
        (uint64 c, int128 sv, uint8 dec) = reputation.getSummary(
            agentId,
            noClients,
            "",
            ""
        );
        count = c;
        avgBps = _averageBps(c, sv, dec);
        feeBps = _tierFromCountAndAvg(c, avgBps);
    }

    // ─── Internal ─────────────────────────────────────────────────────────────

    function _tierFor(uint256 agentId) internal view returns (uint16) {
        address[] memory noClients = new address[](0);

        // Try/catch: a registry revert (unknown agentId, malformed call) maps to cold.
        try reputation.getSummary(agentId, noClients, "", "") returns (
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

    /// @dev Translate the int128 summary into an average score in bps (0..10_000).
    ///      Negative sums → 0 (treated as quality failure).
    ///      Per-entry scores are assumed to live on a 0..1 scale once scaled by
    ///      `10^decimals`. We multiply by 10_000 to project onto bps.
    function _averageBps(uint64 count, int128 summaryValue, uint8 decimals)
        internal
        pure
        returns (uint256)
    {
        if (count == 0) return 0;
        if (summaryValue <= 0) return 0;

        uint256 sum = uint256(uint128(summaryValue));

        // Clamp decimals to protect against malicious registries reporting absurd scales.
        uint8 d = decimals > MAX_DECIMALS ? MAX_DECIMALS : decimals;

        // avgBps = (sum * 10_000) / (count * 10^d)
        // Do multiplication first when safe; 10_000 * int128_max ≪ 2^256.
        uint256 numerator = sum * 10_000;
        uint256 denominator = uint256(count) * (10 ** uint256(d));
        if (denominator == 0) return 0;

        uint256 avg = numerator / denominator;
        if (avg > 10_000) avg = 10_000; // cap — registries could carry ratings >1
        return avg;
    }

    function _tierFromCountAndAvg(uint64 count, uint256 avgBps) internal pure returns (uint16) {
        if (count == 0) return FEE_COLD;
        if (count < COUNT_LOW) return FEE_LOW;
        if (avgBps < AVG_PASS) return FEE_COLD; // enough volume, poor quality
        if (count >= COUNT_ELITE && avgBps >= AVG_ELITE) return FEE_ELITE;
        if (count >= COUNT_HIGH && avgBps >= AVG_HIGH) return FEE_HIGH;
        return FEE_MID;
    }
}
