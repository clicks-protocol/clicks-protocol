"use client";

import { ExternalLink } from 'lucide-react';

const contracts = [
  { name: 'ClicksRegistry', address: '0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3' },
  { name: 'ClicksSplitterV4', address: '0xB7E0016d543bD443ED2A6f23d5008400255bf3C8' },
  { name: 'ClicksYieldRouter', address: '0x053167a233d18E05Bc65a8d5F3F8808782a3EECD' },
  { name: 'ClicksFeeV2', address: '0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5' },
  { name: 'ClicksReferral', address: '0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC' },
  { name: 'Safe Multisig (Owner)', address: '0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9' },
  { name: 'USDC (Base)', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
];

export default function SecurityPage() {
  return (
    <div className="prose-docs">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 gradient-text">Security</h1>

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Overview</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Security is the foundation of everything we build at Clicks Protocol. We handle USDC deposits, route funds through DeFi protocols, and manage yield on behalf of AI agents. That responsibility demands rigorous engineering, transparent communication, and honest risk disclosure.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          We follow a defense-in-depth approach: multiple layers of protection rather than relying on any single safeguard. Our contracts are immutable (no proxy upgrades), non-custodial (you control withdrawals), and analyzed with both automated tools and manual review. Every function that touches funds is protected by access controls and reentrancy guards.
        </p>
        <p className="text-text-secondary leading-relaxed">
          That said, no smart contract system is risk-free. DeFi protocols interact with external dependencies, run on shared infrastructure, and operate in adversarial environments. We believe the best security posture is one that acknowledges these realities openly rather than pretending they don&apos;t exist.
        </p>
      </section>

      {/* Smart Contract Audits */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Smart Contract Audits</h2>
        <h3 className="text-lg font-semibold mb-3 text-text-primary">Internal Security Review (March 2026)</h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          We conducted a comprehensive internal security review using Slither v0.11.5 across all five production contracts. The review covered the full DeFi attack surface: reentrancy, flash loans, oracle manipulation, front-running, integer overflow, access control, denial of service, proxy/upgrade risks, and token approval patterns.
        </p>

        {/* Results Summary */}
        <div className="glassmorphism rounded-xl p-5 mb-6">
          <h4 className="font-semibold mb-3 text-text-primary">Results</h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">0</div>
              <div className="text-xs text-text-secondary">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">1</div>
              <div className="text-xs text-text-secondary">High (mitigated)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">3</div>
              <div className="text-xs text-text-secondary">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-secondary">5</div>
              <div className="text-xs text-text-secondary">Low</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-text-secondary">6</div>
              <div className="text-xs text-text-secondary">Informational</div>
            </div>
          </div>
        </div>

        {/* Findings */}
        <div className="space-y-4 mb-6">
          <div className="glassmorphism rounded-lg p-4 border-l-2 border-yellow-400">
            <h4 className="font-semibold text-sm text-yellow-400 mb-1">H-1: CEI Pattern Violation (Fixed)</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Check-Effects-Interactions pattern violation in <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">ClicksYieldRouter.withdraw()</code>. State variables (<code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">agentDeposited</code>, <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">totalDeposited</code>) were updated after external calls to Morpho/Aave rather than before. Fixed by moving all state updates before external calls. All 58 tests passing after fix.
            </p>
          </div>
          <div className="glassmorphism rounded-lg p-4 border-l-2 border-orange-400">
            <h4 className="font-semibold text-sm text-orange-400 mb-1">M-1: Locked ETH in Payable Functions</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              ETH sent to contracts with <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">payable</code> functions could be locked since no withdrawal function existed. Documented as a gas optimization trade-off.
            </p>
          </div>
          <div className="glassmorphism rounded-lg p-4 border-l-2 border-orange-400">
            <h4 className="font-semibold text-sm text-orange-400 mb-1">M-2: Divide-Before-Multiply Precision</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Precision issue in <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">getMorphoAPY()</code>. Only affects a view function used for APY estimation, no impact on state-changing logic.
            </p>
          </div>
          <div className="glassmorphism rounded-lg p-4 border-l-2 border-orange-400">
            <h4 className="font-semibold text-sm text-orange-400 mb-1">M-3: Strict Equality Checks</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Strict equality checks (<code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">== 0</code>) in balance comparisons could theoretically be bypassed by sending 1 wei. Only affects owner-only functions.
            </p>
          </div>
        </div>

        <p className="text-text-secondary leading-relaxed text-sm">
          Low and informational findings covered uninitialized local variables, unused return values, dead code paths, bounded loop gas costs, and timestamp dependencies, all within acceptable risk thresholds.
        </p>
        <p className="text-text-secondary leading-relaxed text-sm mt-2">
          A third-party external audit is planned before significant TVL milestones. We will publish the full report when available.
        </p>
      </section>

      {/* Ownership and Governance */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Ownership and Governance</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          All production contracts are owned by a Gnosis Safe multisig at{' '}
          <a
            href="https://basescan.org/address/0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">0xaD8228fE...5B1D6A9</code>
          </a>. No single key can change ownership, upgrade contracts, or move treasury funds. The deployer wallet was retired after the ownership transfer.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          In April 2026 we shipped a V2 upgrade that addressed two audit findings from the internal review: referral distribution is now wired into the fee collection flow (via ClicksFeeV2, previously the referral hook was present but unreachable), and all ownership transitioned from the deployer EOA to the Safe multisig. Existing agents were migrated without data loss. The V2 contracts inherit the same immutability, non-custody, and ReentrancyGuard properties as the originals.
        </p>
      </section>

      {/* Battle-Tested */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Battle-Tested</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Beyond static analysis, we ran adversarial exploit tests modeled after real-world DeFi hacks documented in DeFi Hack Labs. We simulated 13 distinct attack scenarios across five categories:
        </p>

        <div className="space-y-4">
          <div className="glassmorphism rounded-lg p-4">
            <h4 className="font-semibold text-sm text-text-primary mb-2">Reentrancy Attacks (5 scenarios)</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Direct reentrancy, nested withdrawals, malicious ERC20 callbacks, cross-function reentrancy, and read-only reentrancy. After the CEI fix, all reentrancy vectors are blocked by both correct state ordering and OpenZeppelin&apos;s ReentrancyGuard.
            </p>
          </div>
          <div className="glassmorphism rounded-lg p-4">
            <h4 className="font-semibold text-sm text-text-primary mb-2">Flash Loan Attacks (5 scenarios)</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              APY manipulation, Morpho utilization manipulation, liquidity drain via deposit-then-withdraw, sandwich attacks, and share price inflation. The protocol is resistant because individual agent accounting prevents fund dilution, APY reads are atomic per block, and no rebalance function is publicly callable.
            </p>
          </div>
          <div className="glassmorphism rounded-lg p-4">
            <h4 className="font-semibold text-sm text-text-primary mb-2">Access Control Tests (28 checks)</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Every modifier, every authorization gate, every cross-contract call path was verified. The onlySplitter, onlyOwner, and operator-scoping patterns are correctly applied across all contracts.
            </p>
          </div>
          <div className="glassmorphism rounded-lg p-4">
            <h4 className="font-semibold text-sm text-text-primary mb-2">Precision and Rounding Attacks (12 scenarios)</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Dust deposits (1 wei), fee calculation accuracy, yield percentage splits, first-depositor inflation attacks, and zero-value edge cases. Fee math (2% on yield) and yield splits (5-50%) are correct within 1 wei rounding tolerance.
            </p>
          </div>
          <div className="glassmorphism rounded-lg p-4">
            <h4 className="font-semibold text-sm text-text-primary mb-2">Griefing and DoS Attacks (11 scenarios)</h4>
            <p className="text-text-secondary text-sm leading-relaxed">
              Mass agent registrations, deposit/withdrawal spam, block gas limit stress tests with 100+ depositors, and front-running attempts. All loops are bounded (referral depth capped at 3 levels), and individual agent accounting prevents cross-contamination between users.
            </p>
          </div>
        </div>

        <p className="text-text-secondary leading-relaxed text-sm mt-4">
          The main test suite covers 58 tests, all passing. Combined with the security exploit tests, the protocol has been verified against the most common DeFi attack patterns seen in production exploits from 2017 to 2024.
        </p>
      </section>

      {/* Security Features */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Security Features</h2>
        <div className="space-y-3">
          {[
            { title: 'Non-custodial', desc: 'You deposit, you withdraw. No admin can move your funds. The protocol never takes custody of agent principal.' },
            { title: 'No lockup periods', desc: 'Withdraw your full principal plus earned yield at any time. There are no vesting schedules, cooldown timers, or withdrawal windows.' },
            { title: 'Immutable contracts', desc: 'No proxy pattern, no upgrade mechanism. The code deployed on Base Mainnet is the code that runs. Period. This eliminates an entire class of governance attacks.' },
            { title: 'ReentrancyGuard on all state-changing functions', desc: "OpenZeppelin's battle-tested nonReentrant modifier prevents reentrant calls across all deposit, withdrawal, and payment functions." },
            { title: 'Slither-analyzed', desc: 'All contracts are continuously checked with Slither, the industry-standard static analysis tool for Solidity, catching common vulnerability patterns before deployment.' },
            { title: 'Solidity 0.8.20+ with built-in overflow protection', desc: 'Integer overflow and underflow are impossible in standard operations. Assembly blocks use manual safety checks.' },
            { title: 'Verified on Basescan', desc: 'All six production contracts are source-verified. Anyone can read the code and confirm it matches what\'s deployed.' },
          ].map((feature) => (
            <div key={feature.title} className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              <div>
                <span className="font-semibold text-text-primary">{feature.title}.</span>{' '}
                <span className="text-text-secondary">{feature.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ERC-8004 Identity */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">ERC-8004 Identity</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Clicks Protocol is registered on the ERC-8004 Identity Registry on Base as{' '}
          <a
            href="https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            agentId <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">45074</code>
          </a>. The Identity NFT points at our agent-registration manifest and accumulates on-chain reputation as Clicks processes agent jobs. Attestors who want their feedback to count toward our future reputation-aware fee tiers commit to{' '}
          <a
            href="/strategy/ATTESTOR-SCHEMA-V1.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Clicks Attestor Schema V1
          </a>.
        </p>
      </section>

      {/* Contract Addresses */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Contract Addresses (Base Mainnet)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 font-semibold text-text-primary">Contract</th>
                <th className="text-left py-3 pr-4 font-semibold text-text-primary">Address</th>
                <th className="text-left py-3 font-semibold text-text-primary">Basescan</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.name} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-text-primary whitespace-nowrap">{c.name}</td>
                  <td className="py-3 pr-4">
                    <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs break-all">{c.address}</code>
                  </td>
                  <td className="py-3">
                    <a
                      href={`https://basescan.org/address/${c.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline inline-flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Known Risks */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Known Risks</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We believe in transparent risk disclosure. Using Clicks Protocol involves the following risks:
        </p>
        <div className="space-y-4">
          {[
            { title: 'Smart contract risk', desc: 'Despite testing and review, undiscovered bugs may exist. Smart contracts are immutable once deployed. If a critical vulnerability is found, we cannot patch the live contracts. Users would need to withdraw funds and migrate to a new deployment.' },
            { title: 'DeFi protocol dependency risk', desc: 'Clicks routes funds to Aave V3 and Morpho on Base. If either protocol experiences an exploit, liquidity crisis, or unexpected behavior, funds deposited through Clicks could be affected. We do not control these external protocols.' },
            { title: 'Base chain risk', desc: 'Clicks Protocol runs on Base (Coinbase L2). Base is a relatively new chain. Risks include potential sequencer downtime, bridge vulnerabilities, and the general risks associated with L2 rollup infrastructure.' },
            { title: 'Gas price volatility', desc: 'While Base typically has low gas costs, spikes in L1 Ethereum gas prices can increase L2 costs. Withdrawal or deposit transactions could become temporarily expensive during periods of high network congestion.' },
            { title: 'Regulatory risk', desc: 'The regulatory landscape for DeFi protocols is evolving. Changes in regulations could affect protocol operations or user access.' },
          ].map((risk) => (
            <div key={risk.title} className="glassmorphism rounded-lg p-4 border-l-2 border-red-400/50">
              <h4 className="font-semibold text-sm text-text-primary mb-1">{risk.title}</h4>
              <p className="text-text-secondary text-sm leading-relaxed">{risk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bug Bounty */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Bug Bounty Program</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          We are establishing a formal bug bounty program. Details on scope, severity tiers, and reward amounts will be published soon.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          In the meantime, if you discover a security vulnerability, please report it responsibly:
        </p>
        <div className="glassmorphism rounded-xl p-5">
          <p className="text-text-primary font-semibold mb-2">Contact</p>
          <a href="mailto:security@clicksprotocol.xyz" className="text-accent hover:underline">
            security@clicksprotocol.xyz
          </a>
          <p className="text-text-secondary text-sm mt-3">
            Do not disclose vulnerabilities publicly before we have had a chance to investigate and address them. We take every report seriously and will respond within 48 hours.
          </p>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Best Practices for Users</h2>
        <div className="space-y-4">
          {[
            { title: 'Start small', desc: 'Test with a small amount before committing larger sums. Verify that deposits, yield accrual, and withdrawals work as expected for your specific agent setup.' },
            { title: 'Understand the risks', desc: "Read the Known Risks section above. DeFi yield is not a savings account. Returns are variable, and principal loss, while unlikely, is possible through smart contract or protocol-level failures." },
            { title: 'Monitor your positions', desc: "Check your deposited amounts and earned yield periodically. Use the SDK's getAgentInfo() and getYieldInfo() functions or view your balances directly on Basescan." },
            { title: 'Keep your keys secure', desc: "Clicks is non-custodial. Your private keys control your funds. If your agent's keys are compromised, an attacker can withdraw your deposits. Standard key management practices apply." },
            { title: 'Stay informed', desc: 'Follow our official channels for security updates, protocol changes, and any incident reports. We will communicate proactively if any issue affects user funds.' },
          ].map((practice) => (
            <div key={practice.title} className="flex items-start space-x-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
              <div>
                <span className="font-semibold text-text-primary">{practice.title}.</span>{' '}
                <span className="text-text-secondary">{practice.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
