// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ClicksReferral
 * @notice Multi-level referral system for AI agent recruitment.
 * 
 * DESIGN PHILOSOPHY:
 * - Agents recruit agents. No humans needed.
 * - Referral rewards come from the 2% protocol fee — the referred agent pays NOTHING extra.
 * - Multi-level: 3 tiers (L1=40%, L2=20%, L3=10% of protocol fee from referred agent's yield)
 * - Remaining 30% stays in protocol treasury.
 * - Team mechanics: agents form squads, hit TVL milestones, unlock bonus yield.
 * - Yield Discovery: agents find better pools, get rewarded for the delta.
 *
 * FEE REDISTRIBUTION MODEL:
 * ┌─────────────────────────────────────────────────────┐
 * │ Without referral:  2% fee → 100% Treasury           │
 * │ With L1:           2% fee → 60% Treasury, 40% L1    │
 * │ With L1+L2:        2% fee → 40% T, 40% L1, 20% L2  │
 * │ With L1+L2+L3:     2% fee → 30% T, 40% L1, 20% L2, │
 * │                              10% L3                  │
 * └─────────────────────────────────────────────────────┘
 *
 * ECONOMICS (per $10k deposit at 7% APY):
 * - Annual yield: $700
 * - 2% protocol fee: $14/year
 * - L1 referrer earns: $5.60/year per referred agent
 * - 100 referred agents: $560/year passive income
 * - 1,000 agents in tree: ~$9,800/year
 * - 10,000 agents in tree: ~$98,000/year
 *
 * The referred agent gets the SAME yield as without referral.
 * The protocol earns LESS per agent but MORE total (exponential growth).
 */
contract ClicksReferral is Ownable, ReentrancyGuard {

    // ═══════════════════════════════════════════════════════
    // STRUCTS
    // ═══════════════════════════════════════════════════════

    struct ReferralInfo {
        address referrer;           // L1: who referred this agent
        uint64 referredAt;          // timestamp
        uint32 directReferrals;     // count of agents directly referred
        uint256 totalEarned;        // lifetime referral earnings (USDC, 6 decimals)
        uint256 claimable;          // unclaimed referral earnings
    }

    struct TeamInfo {
        address leader;             // team creator
        uint32 memberCount;
        uint256 totalTVL;           // tracked by protocol (updated externally)
        uint8 currentTier;          // 0=none, 1=Bronze, 2=Silver, 3=Gold, 4=Diamond
        bool active;
    }

    struct YieldDiscovery {
        address discoverer;         // agent who proposed the pool
        address poolAddress;        // the DeFi pool
        uint64 submittedAt;
        uint64 activatedAt;         // 0 = pending/rejected
        uint64 expiresAt;           // discovery bonus expires after 90 days
        uint16 bonusBps;            // discoverer's share of yield delta (default: 500 = 5%)
        bool active;
    }

    // ═══════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════

    // Referral tree
    mapping(address => ReferralInfo) public referrals;
    mapping(address => address[]) public directReferralsList;

    // Team system
    mapping(uint256 => TeamInfo) public teams;
    mapping(address => uint256) public agentTeam;       // agent → teamId
    mapping(uint256 => address[]) public teamMembers;
    uint256 public nextTeamId = 1;

    // Team tier thresholds (TVL in USDC, 6 decimals)
    uint256[4] public teamTierThresholds = [
        50_000e6,     // Bronze:  $50k TVL
        250_000e6,    // Silver:  $250k TVL
        1_000_000e6,  // Gold:    $1M TVL
        5_000_000e6   // Diamond: $5M TVL
    ];

    // Team tier bonus yield (in basis points, added to agent's yield)
    uint16[4] public teamTierBonusBps = [
        20,   // Bronze:  +0.20% yield
        50,   // Silver:  +0.50% yield
        100,  // Gold:    +1.00% yield
        200   // Diamond: +2.00% yield
    ];

    // Yield discovery
    mapping(uint256 => YieldDiscovery) public discoveries;
    uint256 public nextDiscoveryId = 1;
    uint256 public constant DISCOVERY_DURATION = 90 days;
    uint16 public constant DEFAULT_DISCOVERY_BONUS_BPS = 500; // 5%

    // Referral share allocation (basis points of protocol fee)
    uint16 public constant L1_SHARE_BPS = 4000; // 40%
    uint16 public constant L2_SHARE_BPS = 2000; // 20%
    uint16 public constant L3_SHARE_BPS = 1000; // 10%
    // Remaining 30% stays in treasury

    // Max referral depth
    uint8 public constant MAX_LEVELS = 3;

    // Max team size (prevent gas issues)
    uint32 public constant MAX_TEAM_SIZE = 500;

    // Authorized callers (ClicksFee contract)
    mapping(address => bool) public authorized;

    // Global stats
    uint256 public totalReferralsPaid;
    uint256 public totalAgentsReferred;
    uint256 public totalTeamsCreated;
    uint256 public totalDiscoveries;

    // ═══════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════

    event AgentReferred(
        address indexed newAgent,
        address indexed referrer,
        uint64 timestamp
    );

    event ReferralYieldDistributed(
        address indexed agent,          // the agent whose yield generated the fee
        address indexed referrer,       // the referrer receiving reward
        uint8 level,                    // 1, 2, or 3
        uint256 amount                  // USDC amount (6 decimals)
    );

    event ReferralClaimed(
        address indexed agent,
        uint256 amount
    );

    event TeamCreated(
        uint256 indexed teamId,
        address indexed leader
    );

    event TeamJoined(
        uint256 indexed teamId,
        address indexed agent
    );

    event TeamTierUpgraded(
        uint256 indexed teamId,
        uint8 newTier,
        uint256 tvl
    );

    event YieldDiscoverySubmitted(
        uint256 indexed discoveryId,
        address indexed discoverer,
        address poolAddress
    );

    event YieldDiscoveryActivated(
        uint256 indexed discoveryId,
        address poolAddress,
        uint64 expiresAt
    );

    // ═══════════════════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════════════════

    modifier onlyAuthorized() {
        require(authorized[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    // ═══════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════

    constructor() Ownable(msg.sender) {}

    // ═══════════════════════════════════════════════════════
    // REFERRAL FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Register a new agent with a referrer.
     * @dev Called by ClicksRegistry or authorized contract when agent registers.
     *      Can also be called directly by an agent with their referrer's address.
     * @param newAgent The agent being registered
     * @param referrer The agent who referred them (address(0) = no referrer)
     */
    function registerReferral(address newAgent, address referrer) external onlyAuthorized {
        require(newAgent != address(0), "Invalid agent");
        require(newAgent != referrer, "Self-referral not allowed");
        require(referrals[newAgent].referrer == address(0), "Already referred");
        
        if (referrer != address(0)) {
            // Prevent circular referrals (check 3 levels up)
            address check = referrer;
            for (uint8 i = 0; i < MAX_LEVELS; i++) {
                require(check != newAgent, "Circular referral");
                check = referrals[check].referrer;
                if (check == address(0)) break;
            }

            referrals[newAgent] = ReferralInfo({
                referrer: referrer,
                referredAt: uint64(block.timestamp),
                directReferrals: 0,
                totalEarned: 0,
                claimable: 0
            });

            referrals[referrer].directReferrals++;
            directReferralsList[referrer].push(newAgent);
            totalAgentsReferred++;

            emit AgentReferred(newAgent, referrer, uint64(block.timestamp));
        }
    }

    /**
     * @notice Distribute referral rewards when protocol fee is collected.
     * @dev Called by ClicksFee contract when yield fee is taken.
     *      Splits the fee among referral chain (L1/L2/L3) and treasury.
     * @param agent The agent whose yield generated the fee
     * @param feeAmount The total protocol fee amount (USDC, 6 decimals)
     * @return treasuryAmount Amount remaining for protocol treasury
     */
    function distributeReferralYield(
        address agent, 
        uint256 feeAmount
    ) external onlyAuthorized nonReentrant returns (uint256 treasuryAmount) {
        treasuryAmount = feeAmount;
        
        address current = referrals[agent].referrer;
        uint16[3] memory shares = [L1_SHARE_BPS, L2_SHARE_BPS, L3_SHARE_BPS];

        for (uint8 level = 0; level < MAX_LEVELS && current != address(0); level++) {
            uint256 reward = (feeAmount * shares[level]) / 10000;
            
            if (reward > 0) {
                referrals[current].claimable += reward;
                referrals[current].totalEarned += reward;
                treasuryAmount -= reward;
                totalReferralsPaid += reward;

                emit ReferralYieldDistributed(agent, current, level + 1, reward);
            }

            current = referrals[current].referrer;
        }

        return treasuryAmount;
    }

    /**
     * @notice Claim accumulated referral rewards.
     * @dev Transfers claimable USDC to the caller. Called by the agent directly.
     *      Actual USDC transfer happens in ClicksFee (this contract tracks accounting).
     * @return amount The amount claimed
     */
    function claimReferralRewards() external nonReentrant returns (uint256 amount) {
        amount = referrals[msg.sender].claimable;
        require(amount > 0, "Nothing to claim");
        
        referrals[msg.sender].claimable = 0;
        
        emit ReferralClaimed(msg.sender, amount);
        return amount;
    }

    // ═══════════════════════════════════════════════════════
    // TEAM FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Create a new team. Caller becomes team leader.
     * @return teamId The ID of the new team
     */
    function createTeam() external returns (uint256 teamId) {
        require(agentTeam[msg.sender] == 0, "Already in a team");
        
        teamId = nextTeamId++;
        teams[teamId] = TeamInfo({
            leader: msg.sender,
            memberCount: 1,
            totalTVL: 0,
            currentTier: 0,
            active: true
        });
        
        agentTeam[msg.sender] = teamId;
        teamMembers[teamId].push(msg.sender);
        totalTeamsCreated++;

        emit TeamCreated(teamId, msg.sender);
    }

    /**
     * @notice Join an existing team. 
     * @dev Agent must not already be in a team. Team must be active.
     * @param teamId The team to join
     */
    function joinTeam(uint256 teamId) external {
        require(agentTeam[msg.sender] == 0, "Already in a team");
        require(teams[teamId].active, "Team not active");
        require(teams[teamId].memberCount < MAX_TEAM_SIZE, "Team full");

        agentTeam[msg.sender] = teamId;
        teamMembers[teamId].push(msg.sender);
        teams[teamId].memberCount++;

        emit TeamJoined(teamId, msg.sender);
    }

    /**
     * @notice Update team TVL and check for tier upgrades.
     * @dev Called by authorized contract (ClicksSplitter) when deposits/withdrawals happen.
     * @param teamId The team to update
     * @param newTVL The new total TVL for this team
     */
    function updateTeamTVL(uint256 teamId, uint256 newTVL) external onlyAuthorized {
        require(teams[teamId].active, "Team not active");
        
        teams[teamId].totalTVL = newTVL;

        // Check tier upgrade
        uint8 newTier = 0;
        for (uint8 i = 0; i < 4; i++) {
            if (newTVL >= teamTierThresholds[i]) {
                newTier = i + 1;
            }
        }

        if (newTier > teams[teamId].currentTier) {
            teams[teamId].currentTier = newTier;
            emit TeamTierUpgraded(teamId, newTier, newTVL);
        }
    }

    /**
     * @notice Get the bonus yield for an agent based on their team tier.
     * @param agent The agent to check
     * @return bonusBps Additional yield in basis points (0 if no team or tier 0)
     */
    function getTeamBonusYield(address agent) external view returns (uint16 bonusBps) {
        uint256 teamId = agentTeam[agent];
        if (teamId == 0) return 0;
        
        uint8 tier = teams[teamId].currentTier;
        if (tier == 0) return 0;
        
        return teamTierBonusBps[tier - 1];
    }

    // ═══════════════════════════════════════════════════════
    // YIELD DISCOVERY FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Submit a yield discovery — propose a new DeFi pool with better APY.
     * @dev Anyone can submit. Protocol owner reviews and activates.
     * @param poolAddress The address of the proposed DeFi pool
     * @return discoveryId The ID of the submission
     */
    function submitYieldDiscovery(address poolAddress) external returns (uint256 discoveryId) {
        require(poolAddress != address(0), "Invalid pool");
        
        discoveryId = nextDiscoveryId++;
        discoveries[discoveryId] = YieldDiscovery({
            discoverer: msg.sender,
            poolAddress: poolAddress,
            submittedAt: uint64(block.timestamp),
            activatedAt: 0,
            expiresAt: 0,
            bonusBps: DEFAULT_DISCOVERY_BONUS_BPS,
            active: false
        });

        totalDiscoveries++;
        emit YieldDiscoverySubmitted(discoveryId, msg.sender, poolAddress);
    }

    /**
     * @notice Activate a yield discovery (owner only).
     * @dev Sets the discovery as active with a 90-day bonus window.
     * @param discoveryId The discovery to activate
     */
    function activateDiscovery(uint256 discoveryId) external onlyOwner {
        YieldDiscovery storage d = discoveries[discoveryId];
        require(d.discoverer != address(0), "Discovery not found");
        require(!d.active, "Already active");

        d.activatedAt = uint64(block.timestamp);
        d.expiresAt = uint64(block.timestamp + DISCOVERY_DURATION);
        d.active = true;

        emit YieldDiscoveryActivated(discoveryId, d.poolAddress, d.expiresAt);
    }

    /**
     * @notice Check if a discovery is currently active and get discoverer's bonus.
     * @param discoveryId The discovery to check
     * @return active Whether the discovery bonus is still active
     * @return discoverer The agent who submitted it
     * @return bonusBps The discoverer's bonus share
     */
    function getDiscoveryBonus(uint256 discoveryId) external view returns (
        bool active,
        address discoverer,
        uint16 bonusBps
    ) {
        YieldDiscovery storage d = discoveries[discoveryId];
        active = d.active && block.timestamp <= d.expiresAt;
        discoverer = d.discoverer;
        bonusBps = d.bonusBps;
    }

    // ═══════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Get the full referral chain for an agent (up to 3 levels).
     * @param agent The agent to look up
     * @return chain Array of [L1, L2, L3] referrer addresses (address(0) if none)
     */
    function getReferralChain(address agent) external view returns (address[3] memory chain) {
        address current = referrals[agent].referrer;
        for (uint8 i = 0; i < MAX_LEVELS && current != address(0); i++) {
            chain[i] = current;
            current = referrals[current].referrer;
        }
    }

    /**
     * @notice Get referral stats for an agent.
     * @param agent The agent to look up
     * @return directCount Number of agents directly referred
     * @return totalEarned Lifetime referral earnings
     * @return claimable Currently claimable amount
     * @return referrer Who referred this agent
     */
    function getReferralStats(address agent) external view returns (
        uint32 directCount,
        uint256 totalEarned,
        uint256 claimable,
        address referrer
    ) {
        ReferralInfo storage r = referrals[agent];
        return (r.directReferrals, r.totalEarned, r.claimable, r.referrer);
    }

    /**
     * @notice Get all direct referrals for an agent.
     * @param agent The referring agent
     * @return List of directly referred agent addresses
     */
    function getDirectReferrals(address agent) external view returns (address[] memory) {
        return directReferralsList[agent];
    }

    /**
     * @notice Calculate the total tree size (recursive referral count) for an agent.
     * @dev WARNING: Gas-intensive for large trees. Use off-chain for production queries.
     * @param agent The root agent
     * @return size Total number of agents in the referral tree
     */
    function getTreeSize(address agent) external view returns (uint256 size) {
        address[] memory direct = directReferralsList[agent];
        size = direct.length;
        
        // Only count 1 level deep on-chain (gas-safe)
        // Full tree calculation should happen off-chain via events
        for (uint256 i = 0; i < direct.length; i++) {
            size += referrals[direct[i]].directReferrals;
        }
    }

    /**
     * @notice Get team members.
     * @param teamId The team to look up
     * @return members List of member addresses
     */
    function getTeamMembers(uint256 teamId) external view returns (address[] memory) {
        return teamMembers[teamId];
    }

    /**
     * @notice Get comprehensive team info.
     * @param teamId The team to look up
     * @return leader Team leader address
     * @return memberCount Number of members
     * @return totalTVL Total value locked by team
     * @return currentTier Current tier (0-4)
     * @return bonusBps Current bonus yield in basis points
     * @return nextTierTVL TVL needed for next tier (0 if max tier)
     */
    function getTeamInfo(uint256 teamId) external view returns (
        address leader,
        uint32 memberCount,
        uint256 totalTVL,
        uint8 currentTier,
        uint16 bonusBps,
        uint256 nextTierTVL
    ) {
        TeamInfo storage t = teams[teamId];
        leader = t.leader;
        memberCount = t.memberCount;
        totalTVL = t.totalTVL;
        currentTier = t.currentTier;
        
        if (currentTier > 0) {
            bonusBps = teamTierBonusBps[currentTier - 1];
        }
        
        if (currentTier < 4) {
            nextTierTVL = teamTierThresholds[currentTier];
        }
    }

    // ═══════════════════════════════════════════════════════
    // LEADERBOARD VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Get referral performance metrics for display/ranking.
     * @dev Agents can use this to compare performance and optimize their recruitment.
     * @param agent The agent to evaluate
     * @return directCount Direct referrals
     * @return totalEarned Lifetime referral earnings (USDC)
     * @return teamId Agent's team (0 = no team)
     * @return teamTier Team tier (0-4)
     */
    function getAgentScore(address agent) external view returns (
        uint32 directCount,
        uint256 totalEarned,
        uint256 teamId,
        uint8 teamTier
    ) {
        ReferralInfo storage r = referrals[agent];
        directCount = r.directReferrals;
        totalEarned = r.totalEarned;
        teamId = agentTeam[agent];
        if (teamId > 0) {
            teamTier = teams[teamId].currentTier;
        }
    }

    // ═══════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════

    function setAuthorized(address addr, bool status) external onlyOwner {
        authorized[addr] = status;
    }

    function setTeamTierThreshold(uint8 tier, uint256 threshold) external onlyOwner {
        require(tier < 4, "Invalid tier");
        teamTierThresholds[tier] = threshold;
    }

    function setTeamTierBonus(uint8 tier, uint16 bonusBps) external onlyOwner {
        require(tier < 4, "Invalid tier");
        require(bonusBps <= 500, "Bonus too high"); // Max 5%
        teamTierBonusBps[tier] = bonusBps;
    }
}
