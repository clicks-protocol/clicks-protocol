# Security

## Overview

Security is the foundation of everything we build at Clicks Protocol. We handle USDC deposits, route funds through DeFi protocols, and manage yield on behalf of AI agents. That responsibility demands rigorous engineering, transparent communication, and honest risk disclosure.

We follow a defense-in-depth approach: multiple layers of protection rather than relying on any single safeguard. Our contracts are immutable (no proxy upgrades), non-custodial (you control withdrawals), and analyzed with both automated tools and manual review. Every function that touches funds is protected by access controls and reentrancy guards.

That said, no smart contract system is risk-free. DeFi protocols interact with external dependencies, run on shared infrastructure, and operate in adversarial environments. We believe the best security posture is one that acknowledges these realities openly rather than pretending they don't exist.

## Smart Contract Audits

### Internal Security Review (March 2026)

We conducted a comprehensive internal security review using Slither v0.11.5 across all five production contracts. The review covered the full DeFi attack surface: reentrancy, flash loans, oracle manipulation, front-running, integer overflow, access control, denial of service, proxy/upgrade risks, and token approval patterns.

**Results:** 0 Critical vulnerabilities, 1 High-severity finding (mitigated), 3 Medium findings, 5 Low findings, and 6 informational notes.

The High-severity finding (H-1) identified a Check-Effects-Interactions (CEI) pattern violation in `ClicksYieldRouter.withdraw()`. State variables (`agentDeposited`, `totalDeposited`) were updated after external calls to Morpho/Aave rather than before. While our contracts already used OpenZeppelin's `ReentrancyGuard`, the incorrect ordering still violated best practices. We fixed this by moving all state updates before external calls, following the CEI pattern that the Solidity community considers mandatory for safe contract design.

The three Medium findings were: (M-1) ETH sent to contracts with `payable` functions could be locked since no withdrawal function existed, a gas optimization trade-off we documented; (M-2) a divide-before-multiply precision issue in `getMorphoAPY()`, which only affects a view function used for APY estimation and has no impact on state-changing logic; and (M-3) strict equality checks (`== 0`) in balance comparisons that could theoretically be bypassed by sending 1 wei, though this only affects owner-only functions. Low and informational findings covered uninitialized local variables, unused return values, dead code paths, bounded loop gas costs, and timestamp dependencies, all within acceptable risk thresholds.

A third-party external audit is planned before significant TVL milestones. We will publish the full report when available.

## Battle-Tested

Beyond static analysis, we ran adversarial exploit tests modeled after real-world DeFi hacks documented in DeFi Hack Labs. We simulated 13 distinct attack scenarios across five categories:

**Reentrancy attacks** (5 scenarios): Direct reentrancy, nested withdrawals, malicious ERC20 callbacks, cross-function reentrancy, and read-only reentrancy. After the CEI fix described above, all reentrancy vectors are blocked by both correct state ordering and OpenZeppelin's `ReentrancyGuard`.

**Flash loan attacks** (5 scenarios): APY manipulation, Morpho utilization manipulation, liquidity drain via deposit-then-withdraw, sandwich attacks, and share price inflation. The protocol is resistant to all tested flash loan vectors because individual agent accounting prevents fund dilution, APY reads are atomic per block, and no rebalance function is publicly callable.

**Access control tests** (28 checks): Every modifier, every authorization gate, every cross-contract call path was verified. The `onlySplitter`, `onlyOwner`, and operator-scoping patterns are correctly applied across all contracts.

**Precision and rounding attacks** (12 scenarios): Dust deposits (1 wei), fee calculation accuracy, yield percentage splits, first-depositor inflation attacks, and zero-value edge cases. Fee math (2% on yield) and yield splits (5-50%) are correct within 1 wei rounding tolerance.

**Griefing and DoS attacks** (11 scenarios): Mass agent registrations, deposit/withdrawal spam, block gas limit stress tests with 100+ depositors, and front-running attempts. All loops are bounded (referral depth capped at 3 levels), and individual agent accounting prevents cross-contamination between users.

Our main test suite covers 58 tests, all passing. Combined with the security exploit tests, we have verified the protocol against the most common DeFi attack patterns seen in production exploits from 2017 to 2024.

## Security Features

- **Non-custodial.** You deposit, you withdraw. No admin can move your funds. The protocol never takes custody of agent principal.
- **No lockup periods.** Withdraw your full principal plus earned yield at any time. There are no vesting schedules, cooldown timers, or withdrawal windows.
- **Immutable contracts.** No proxy pattern, no upgrade mechanism. The code deployed on Base Mainnet is the code that runs. Period. This eliminates an entire class of governance attacks.
- **ReentrancyGuard on all state-changing functions.** OpenZeppelin's battle-tested `nonReentrant` modifier prevents reentrant calls across all deposit, withdrawal, and payment functions.
- **Slither-analyzed.** All contracts are continuously checked with Slither, the industry-standard static analysis tool for Solidity, catching common vulnerability patterns before deployment.
- **Solidity 0.8.20+ with built-in overflow protection.** Integer overflow and underflow are impossible in standard operations. Assembly blocks use manual safety checks.
- **Verified on Basescan.** All five production contracts are source-verified. Anyone can read the code and confirm it matches what's deployed.

## Known Risks

We believe in transparent risk disclosure. Using Clicks Protocol involves the following risks:

**Smart contract risk.** Despite testing and review, undiscovered bugs may exist. Smart contracts are immutable once deployed. If a critical vulnerability is found, we cannot patch the live contracts. Users would need to withdraw funds and migrate to a new deployment.

**DeFi protocol dependency risk.** Clicks routes funds to Aave V3 and Morpho on Base. If either protocol experiences an exploit, liquidity crisis, or unexpected behavior, funds deposited through Clicks could be affected. We do not control these external protocols.

**Base chain risk.** Clicks Protocol runs on Base (Coinbase L2). Base is a relatively new chain. Risks include potential sequencer downtime, bridge vulnerabilities, and the general risks associated with L2 rollup infrastructure.

**Gas price volatility.** While Base typically has low gas costs, spikes in L1 Ethereum gas prices can increase L2 costs. Withdrawal or deposit transactions could become temporarily expensive during periods of high network congestion.

**Regulatory risk.** The regulatory landscape for DeFi protocols is evolving. Changes in regulations could affect protocol operations or user access.

## Bug Bounty Program

We are establishing a formal bug bounty program. Details on scope, severity tiers, and reward amounts will be published soon.

In the meantime, if you discover a security vulnerability, please report it responsibly:

**Contact:** security@clicksprotocol.xyz

Do not disclose vulnerabilities publicly before we have had a chance to investigate and address them. We take every report seriously and will respond within 48 hours.

## Best Practices for Users

**Start small.** Test with a small amount before committing larger sums. Verify that deposits, yield accrual, and withdrawals work as expected for your specific agent setup.

**Understand the risks.** Read the Known Risks section above. DeFi yield is not a savings account. Returns are variable, and principal loss, while unlikely, is possible through smart contract or protocol-level failures.

**Monitor your positions.** Check your deposited amounts and earned yield periodically. Use the SDK's `getAgentInfo()` and `getYieldInfo()` functions or view your balances directly on Basescan.

**Keep your keys secure.** Clicks is non-custodial. Your private keys control your funds. If your agent's keys are compromised, an attacker can withdraw your deposits. Standard key management practices apply.

**Stay informed.** Follow our official channels for security updates, protocol changes, and any incident reports. We will communicate proactively if any issue affects user funds.
