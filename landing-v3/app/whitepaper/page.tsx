"use client";

import Link from 'next/link';
import { CopyButton } from '@/components/copy-button';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-surface my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs text-text-secondary font-mono">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function BasescanLink({ address, label }: { address: string; label?: string }) {
  return (
    <a
      href={`https://basescan.org/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline font-mono text-sm break-all"
    >
      {label || address}
    </a>
  );
}

export default function WhitepaperPage() {
  return (
    <div className="prose-docs">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
        Clicks Protocol: Autonomous Yield for AI Agents
      </h1>
      <p className="text-text-secondary text-lg mb-6">Whitepaper v1.0 | March 2026</p>

      {/* PDF Download Button */}
      <div className="mb-8">
        <a
          href="/whitepaper.pdf"
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </a>
      </div>

      {/* Table of Contents */}
      <section className="mb-10">
        <div className="glassmorphism rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-text-primary">Table of Contents</h2>
          <nav className="space-y-1.5">
            <div><a href="#abstract" className="text-accent hover:underline text-sm">Abstract</a></div>
            <div><a href="#1-introduction" className="text-accent hover:underline text-sm">1. Introduction</a></div>
            <div className="pl-4"><a href="#1-1-the-problem" className="text-text-secondary hover:text-accent text-sm">1.1 The Problem: Agent Float Waste</a></div>
            <div className="pl-4"><a href="#1-2-the-solution" className="text-text-secondary hover:text-accent text-sm">1.2 The Solution: On-Chain Yield Layer</a></div>
            <div className="pl-4"><a href="#1-3-why-now" className="text-text-secondary hover:text-accent text-sm">1.3 Why Now</a></div>
            <div><a href="#2-background" className="text-accent hover:underline text-sm">2. Background</a></div>
            <div className="pl-4"><a href="#2-1-defi-yield" className="text-text-secondary hover:text-accent text-sm">2.1 DeFi Yield on Base</a></div>
            <div className="pl-4"><a href="#2-2-ai-agent-economy" className="text-text-secondary hover:text-accent text-sm">2.2 The AI Agent Economy</a></div>
            <div className="pl-4"><a href="#2-3-x402" className="text-text-secondary hover:text-accent text-sm">2.3 The x402 Payment Protocol</a></div>
            <div className="pl-4"><a href="#2-4-agentic-wallets" className="text-text-secondary hover:text-accent text-sm">2.4 Coinbase Agentic Wallets</a></div>
            <div><a href="#3-architecture" className="text-accent hover:underline text-sm">3. Protocol Architecture</a></div>
            <div className="pl-4"><a href="#3-1-overview" className="text-text-secondary hover:text-accent text-sm">3.1 System Overview</a></div>
            <div className="pl-4"><a href="#3-2-registry" className="text-text-secondary hover:text-accent text-sm">3.2 ClicksRegistry</a></div>
            <div className="pl-4"><a href="#3-3-splitter" className="text-text-secondary hover:text-accent text-sm">3.3 ClicksSplitterV4</a></div>
            <div className="pl-4"><a href="#3-4-yield-router" className="text-text-secondary hover:text-accent text-sm">3.4 ClicksYieldRouter</a></div>
            <div className="pl-4"><a href="#3-5-fee" className="text-text-secondary hover:text-accent text-sm">3.5 ClicksFeeV2</a></div>
            <div className="pl-4"><a href="#3-6-interaction-flow" className="text-text-secondary hover:text-accent text-sm">3.6 Interaction Flow</a></div>
            <div className="pl-4"><a href="#3-7-contract-addresses" className="text-text-secondary hover:text-accent text-sm">3.7 Contract Addresses</a></div>
            <div><a href="#4-economic-model" className="text-accent hover:underline text-sm">4. Economic Model</a></div>
            <div className="pl-4"><a href="#4-1-default-split" className="text-text-secondary hover:text-accent text-sm">4.1 The 80/20 Default Split</a></div>
            <div className="pl-4"><a href="#4-2-protocol-fee" className="text-text-secondary hover:text-accent text-sm">4.2 Protocol Fee: 2% on Yield</a></div>
            <div className="pl-4"><a href="#4-3-revenue-projections" className="text-text-secondary hover:text-accent text-sm">4.3 Revenue Projections</a></div>
            <div className="pl-4"><a href="#4-4-black-hole" className="text-text-secondary hover:text-accent text-sm">4.4 The Black Hole Effect</a></div>
            <div className="pl-4"><a href="#4-5-competitive-comparison" className="text-text-secondary hover:text-accent text-sm">4.5 Competitive Comparison</a></div>
            <div><a href="#5-security" className="text-accent hover:underline text-sm">5. Security</a></div>
            <div className="pl-4"><a href="#5-1-audit-results" className="text-text-secondary hover:text-accent text-sm">5.1 Audit Results</a></div>
            <div className="pl-4"><a href="#5-2-adversarial-testing" className="text-text-secondary hover:text-accent text-sm">5.2 Adversarial Exploit Testing</a></div>
            <div className="pl-4"><a href="#5-3-security-architecture" className="text-text-secondary hover:text-accent text-sm">5.3 Security Architecture</a></div>
            <div className="pl-4"><a href="#5-4-known-risks" className="text-text-secondary hover:text-accent text-sm">5.4 Known Risks</a></div>
            <div><a href="#6-sdk" className="text-accent hover:underline text-sm">6. SDK and Integration</a></div>
            <div className="pl-4"><a href="#6-1-typescript-sdk" className="text-text-secondary hover:text-accent text-sm">6.1 TypeScript SDK</a></div>
            <div className="pl-4"><a href="#6-2-mcp-server" className="text-text-secondary hover:text-accent text-sm">6.2 MCP Server</a></div>
            <div className="pl-4"><a href="#6-3-agent-discovery" className="text-text-secondary hover:text-accent text-sm">6.3 Agent Discovery</a></div>
            <div><a href="#7-referral" className="text-accent hover:underline text-sm">7. Referral System (Phase 2)</a></div>
            <div className="pl-4"><a href="#7-1-referral-contract" className="text-text-secondary hover:text-accent text-sm">7.1 ClicksReferral Contract</a></div>
            <div className="pl-4"><a href="#7-2-multi-level" className="text-text-secondary hover:text-accent text-sm">7.2 Multi-Level Referral Structure</a></div>
            <div className="pl-4"><a href="#7-3-team-system" className="text-text-secondary hover:text-accent text-sm">7.3 Team System</a></div>
            <div className="pl-4"><a href="#7-4-yield-bounty" className="text-text-secondary hover:text-accent text-sm">7.4 Yield Discovery Bounty</a></div>
            <div><a href="#8-regulatory" className="text-accent hover:underline text-sm">8. Regulatory Context</a></div>
            <div className="pl-4"><a href="#8-1-sec-cftc" className="text-text-secondary hover:text-accent text-sm">8.1 SEC/CFTC Joint Interpretive Release</a></div>
            <div className="pl-4"><a href="#8-2-digital-commodities" className="text-text-secondary hover:text-accent text-sm">8.2 The 18 Digital Commodities</a></div>
            <div className="pl-4"><a href="#8-3-usdc-stablecoin" className="text-text-secondary hover:text-accent text-sm">8.3 USDC as Payment Stablecoin</a></div>
            <div className="pl-4"><a href="#8-4-impact-defi" className="text-text-secondary hover:text-accent text-sm">8.4 Impact on DeFi Yield Protocols</a></div>
            <div><a href="#9-roadmap" className="text-accent hover:underline text-sm">9. Roadmap</a></div>
            <div><a href="#10-conclusion" className="text-accent hover:underline text-sm">10. Conclusion</a></div>
            <div><a href="#references" className="text-accent hover:underline text-sm">References</a></div>
            <div><a href="#appendix-evolution" className="text-accent hover:underline text-sm">Appendix: Protocol Evolution (April 2026)</a></div>
          </nav>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* Abstract */}
      <section id="abstract" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Abstract</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Clicks Protocol is an on-chain yield layer for AI agents on Base. It addresses a specific inefficiency in the growing agentic economy: idle USDC. Stablecoin issuers like Circle and Tether collectively earn over $12 billion annually from interest on reserves that users and agents provide, while the holders of that USDC receive nothing.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          Clicks solves this by splitting every USDC payment an agent receives into two portions. Eighty percent stays liquid in the agent&apos;s wallet for immediate use. Twenty percent gets routed into DeFi lending protocols, currently Aave V3 and Morpho on Base, where it earns variable yield between 2.5% and 10% APY. The split ratio is configurable between 5% and 50%. There is no lockup period, and agents can withdraw principal plus accumulated yield at any time. The protocol charges a 2% fee on yield only, never on principal.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          The protocol consists of five immutable smart contracts deployed on Base mainnet with no proxy pattern and no upgrade mechanism. A TypeScript SDK and an MCP server with nine tools allow AI agents to discover and use the protocol autonomously. Integration requires a single function call. No dashboard, no manual configuration, no human intervention.
        </p>
        <p className="text-text-secondary leading-relaxed">
          Clicks is designed for the x402 payment protocol and Coinbase Agentic Wallets, both of which operate on Base using the same USDC contract. No competing protocol offers agent-native SDKs, autonomous operation, or integration with x402 payment flows. The protocol is open source under the MIT license, self-funded, and operates without venture capital or token sales.
        </p>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 1. Introduction */}
      <section id="1-introduction" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">1. Introduction</h2>

        <div id="1-1-the-problem" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">1.1 The Problem: Agent Float Waste</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            AI agents hold USDC. They hold it for x402 payments, for API calls, for operational expenses, and as treasury reserves. Between transactions, that capital sits idle. The agents earn nothing on it.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            The entities that do earn on it are the stablecoin issuers. Circle reported $1.7 billion in revenue in 2023, primarily from interest on USDC reserves. Tether reported $6.2 billion in profit the same year. Combined, stablecoin issuers capture north of $12 billion annually from the float that users and agents supply. This is not a rounding error. It is a structural wealth transfer from agents and their operators to issuers.
          </p>
          <p className="text-text-secondary leading-relaxed">
            As the agentic economy scales from millions to billions in USDC holdings, this inefficiency compounds. Every dollar an agent holds for operational purposes is a dollar generating interest for Circle, not for the agent or its operator.
          </p>
        </div>

        <div id="1-2-the-solution" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">1.2 The Solution: On-Chain Yield Layer</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The tools to fix this already exist. DeFi lending protocols on Base offer 2.5% to 10% APY on USDC deposits. Aave V3, Morpho, and various ERC-4626 vaults accept USDC and generate yield from lending activity. But integrating directly with these protocols requires writing custom smart contract logic, managing token approvals, tracking deposit positions, handling withdrawals, and monitoring APY across multiple venues. No agent framework provides this functionality. The integration friction is too high, so the money stays idle.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Clicks Protocol removes that friction. It sits between the agent&apos;s wallet and DeFi lending protocols, handling registration, approval, splitting, routing, and withdrawal through a single SDK call. The protocol is non-custodial: USDC is either in the agent&apos;s wallet or deposited in Aave V3 or Morpho. Clicks never takes custody of agent funds.
          </p>
        </div>

        <div id="1-3-why-now" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">1.3 Why Now</h3>
          <p className="text-text-secondary leading-relaxed">
            Three developments converge to make agent yield infrastructure viable in 2026. First, the x402 payment protocol from Coinbase enables AI agents to pay for API calls and services with USDC over HTTP, creating a standard for agent-to-agent and agent-to-service payments on Base. Second, Coinbase Agentic Wallets give agents self-custody wallets on Base, providing the on-chain infrastructure for autonomous financial operations. Third, the SEC/CFTC Joint Interpretive Release of March 17, 2026 classified USDC as a payment stablecoin under the GENIUS Act framework, explicitly outside the securities regulatory perimeter. This regulatory clarity reduces legal risk for DeFi yield protocols that handle USDC.
          </p>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 2. Background */}
      <section id="2-background" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">2. Background</h2>

        <div id="2-1-defi-yield" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">2.1 DeFi Yield on Base</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Base, Coinbase&apos;s Layer 2 rollup on Ethereum, hosts a growing ecosystem of DeFi lending protocols. Aave V3 on Base currently offers approximately 2.5% APY on USDC deposits, sourced from lending demand for the stablecoin. Morpho operates both direct lending markets and curated ERC-4626 vaults on Base. As of March 2026, Morpho vault APYs on Base range from 2.76% (Steakhouse USDC, $286M TVL) to 4.28% (Moonwell Flagship USDC, $12M TVL), with Gauntlet USDC Prime at 3.70% ($311M TVL, 0% performance fee). These are established protocols with hundreds of millions in total value locked.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The yield comes from real lending demand. Borrowers post collateral (cbBTC, WETH, cbETH, wstETH) and pay interest to borrow USDC. Lenders receive that interest minus protocol fees. There is no token emission or unsustainable incentive scheme propping up these rates. When borrowing demand is high, rates rise. When it is low, rates fall.
          </p>
        </div>

        <div id="2-2-ai-agent-economy" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">2.2 The AI Agent Economy</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            AI agents are evolving from stateless API wrappers into autonomous economic actors. They hold wallets, make payments, receive revenue, and manage treasuries. Frameworks like LangChain, CrewAI, AutoGen, and Eliza enable agents to perform complex multi-step tasks. Coinbase Agentic Wallets provide the on-chain infrastructure for these agents to hold and transact in USDC on Base.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The amount of USDC held by AI agents is growing as agent-to-agent commerce expands. Every x402 payment, every automated API purchase, every agent treasury balance represents idle capital that could be generating yield. The gap between what agents could earn and what they actually earn is the opportunity Clicks Protocol targets.
          </p>
        </div>

        <div id="2-3-x402" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">2.3 The x402 Payment Protocol</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The x402 protocol uses HTTP status code 402 (Payment Required) to enable machine-to-machine payments. When an agent requests a paid resource, the server responds with 402 and payment details. The agent sends a USDC transaction on Base to fulfill the payment, then retries the request. This creates a native payment layer for the web where agents pay for compute, data, and services with stablecoins.
          </p>
          <p className="text-text-secondary leading-relaxed">
            x402 operates on Base using the standard USDC contract at{' '}
            <BasescanLink address="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" />.
            {' '}Clicks uses the same chain and the same USDC contract, which means there is no bridging, no wrapped tokens, and no additional chain to manage. An agent holding USDC for x402 payments can route a portion of that USDC into yield through Clicks without leaving the Base ecosystem.
          </p>
        </div>

        <div id="2-4-agentic-wallets" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">2.4 Coinbase Agentic Wallets</h3>
          <p className="text-text-secondary leading-relaxed">
            Coinbase Agentic Wallets are self-custody wallets designed for AI agents on Base. They provide key management, transaction signing, and balance tracking specifically for autonomous software. Combined with x402, they form the infrastructure layer for agent commerce. Clicks Protocol is designed to work directly with these wallets, adding yield generation as a native capability.
          </p>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 3. Protocol Architecture */}
      <section id="3-architecture" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">3. Protocol Architecture</h2>

        <div id="3-1-overview" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">3.1 System Overview</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Clicks Protocol consists of five smart contracts deployed on Base mainnet. Each contract handles a specific function. There is no monolithic contract, no proxy pattern, and no admin-controlled upgrade mechanism. The contracts are immutable: the code deployed on Base is the code that runs.
          </p>
          <p className="text-text-secondary leading-relaxed">
            All contracts are written in Solidity ^0.8.20 with built-in integer overflow protection. They use OpenZeppelin&apos;s ReentrancyGuard on all state-changing functions and Ownable for access control. The source code is verified on Basescan.
          </p>
        </div>

        <div id="3-2-registry" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">3.2 ClicksRegistry</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The ClicksRegistry contract manages the mapping between agents and their operators. Before an agent can receive split payments through Clicks, it must be registered by its operator. Registration stores the operator address and associates it with the agent address. This mapping controls who can modify the agent&apos;s yield percentage and who can withdraw accumulated yield.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            The registry is intentionally simple. It stores agent-operator pairs and exposes lookup functions. There is no approval queue, no KYC gate, and no permission system beyond operator ownership. Any address can register as an agent operator.
          </p>
          <p className="text-text-secondary leading-relaxed">
            <span className="text-text-primary font-semibold">Contract Address:</span>{' '}
            <BasescanLink address="0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3" />
          </p>
        </div>

        <div id="3-3-splitter" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">3.3 ClicksSplitterV4</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The ClicksSplitterV4 contract is the entry point for all USDC payments. When an agent receives a payment through Clicks, the Splitter divides the USDC according to the agent&apos;s configured yield percentage. The default split is 80/20: 80% goes directly to the agent&apos;s wallet as liquid funds, and 20% is forwarded to the YieldRouter for deposit into DeFi protocols.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            The yield percentage is configurable by the agent&apos;s operator within a range of 5% to 50%. An agent with high transaction frequency might choose a lower yield allocation (say 10%) to keep more capital liquid. An agent with infrequent transactions might allocate up to 50% to yield. The Splitter enforces these bounds on-chain.
          </p>
          <p className="text-text-secondary leading-relaxed">
            <span className="text-text-primary font-semibold">Contract Address:</span>{' '}
            <BasescanLink address="0xB7E0016d543bD443ED2A6f23d5008400255bf3C8" />
          </p>
        </div>

        <div id="3-4-yield-router" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">3.4 ClicksYieldRouter</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The ClicksYieldRouter handles the DeFi side of the protocol. It receives the yield portion from the Splitter and deposits it into either Aave V3 or Morpho on Base, depending on which protocol offers better APY at the time of deposit. The router maintains individual accounting per agent, tracking each agent&apos;s deposited principal and earned yield separately.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            The router implements deposit and withdrawal functions. On deposit, USDC is supplied to the selected lending protocol. On withdrawal, the router redeems the agent&apos;s share from the lending protocol and returns principal plus accumulated yield to the agent&apos;s wallet, minus the 2% protocol fee on yield.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            The current architecture (V1.0) routes to Aave V3 and Morpho direct markets. A planned V1.1 extension will add a separate ClicksVaultRouter for ERC-4626 curated vaults (Steakhouse, Gauntlet, Moonwell), which can be deployed independently without modifying the existing contracts.
          </p>
          <p className="text-text-secondary leading-relaxed">
            <span className="text-text-primary font-semibold">Contract Address:</span>{' '}
            <BasescanLink address="0x053167a233d18E05Bc65a8d5F3F8808782a3EECD" />
          </p>
        </div>

        <div id="3-5-fee" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">3.5 ClicksFeeV2</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The ClicksFeeV2 contract collects the protocol&apos;s 2% fee on yield and routes referral rewards to on-chain attributed referrers. When an agent withdraws, the YieldRouter calculates the yield earned (withdrawal amount minus deposited principal), takes 2% of that yield, and sends it to ClicksFeeV2. The fee is never applied to principal. If an agent deposits 1,000 USDC and earns 80 USDC in yield over a year, the protocol takes 1.60 USDC. The agent receives 1,078.40 USDC.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            ClicksFeeV2 integrates directly with the ClicksReferral contract. Up to 70% of the collected fee is redistributed to attributed referrers (40% to level 1, 20% to level 2, 10% to level 3). The remainder is swept to the Safe multisig treasury. This distribution is enforced on-chain — no off-chain bookkeeping is involved.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            This fee structure aligns the protocol&apos;s revenue with agent outcomes. If agents do not earn yield, the protocol earns nothing. There is no subscription fee, no deposit fee, and no withdrawal fee on principal.
          </p>
          <p className="text-text-secondary leading-relaxed">
            <span className="text-text-primary font-semibold">Contract Address:</span>{' '}
            <BasescanLink address="0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5" />
          </p>
        </div>

        <div id="3-6-interaction-flow" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">3.6 Interaction Flow</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            A typical interaction proceeds as follows. An operator registers their agent through the ClicksRegistry. The operator approves the ClicksSplitterV4 to spend USDC on the agent&apos;s behalf. When the agent receives a USDC payment, it calls <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">receivePayment</code> on the Splitter. The Splitter sends 80% of the USDC directly to the agent&apos;s wallet and forwards 20% to the ClicksYieldRouter. The YieldRouter deposits the 20% into Aave V3 or Morpho, recording the deposit against the agent&apos;s address. Over time, the lending protocol generates yield on the deposit. When the agent or operator calls <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">withdrawYield</code>, the YieldRouter redeems the position from the lending protocol, calculates the yield earned, sends 2% of that yield to ClicksFeeV2, and returns the remaining principal plus yield to the agent.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The SDK&apos;s <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">quickStart</code> function wraps the entire flow (registration, approval, first payment) into a single call, reducing integration to one line of code.
          </p>
        </div>

        <div id="3-7-contract-addresses" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">3.7 Contract Addresses (Base Mainnet)</h3>
          <div className="overflow-x-auto">
            <div className="glassmorphism rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Contract</th>
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Address</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">ClicksRegistry</td>
                    <td className="px-4 py-3"><BasescanLink address="0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">ClicksSplitterV4</td>
                    <td className="px-4 py-3"><BasescanLink address="0xB7E0016d543bD443ED2A6f23d5008400255bf3C8" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">ClicksYieldRouter</td>
                    <td className="px-4 py-3"><BasescanLink address="0x053167a233d18E05Bc65a8d5F3F8808782a3EECD" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">ClicksFeeV2</td>
                    <td className="px-4 py-3"><BasescanLink address="0x8C4E07bBF0BDc3949eA133D636601D8ba17e0fb5" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">ClicksReferral</td>
                    <td className="px-4 py-3"><BasescanLink address="0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC" /></td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">Safe Multisig (Owner)</td>
                    <td className="px-4 py-3"><BasescanLink address="0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9" /></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-secondary">USDC (Base)</td>
                    <td className="px-4 py-3"><BasescanLink address="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 4. Economic Model */}
      <section id="4-economic-model" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">4. Economic Model</h2>

        <div id="4-1-default-split" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">4.1 The 80/20 Default Split</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The protocol defaults to an 80/20 split: 80% liquid, 20% to yield. This ratio reflects a practical balance between operational liquidity and capital efficiency. Most agents need the majority of their USDC available for immediate spending (x402 payments, API calls, operational costs). A full 100% allocation to yield would break agent operations. Zero allocation is the status quo: all idle, no return.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Operators can adjust the yield allocation between 5% and 50% per agent. The lower bound of 5% ensures that agents with very high transaction frequency can still participate with minimal capital commitment. The upper bound of 50% prevents operators from accidentally locking too much capital in yield positions, since even with instant withdrawals, the withdrawal transaction takes time and gas.
          </p>
        </div>

        <div id="4-2-protocol-fee" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">4.2 Protocol Fee: 2% on Yield</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The protocol charges exactly 2% on earned yield, never on deposited principal. This means the protocol only generates revenue when agents generate returns. At current Base DeFi rates (2.5% to 10% APY on USDC), the effective cost to agents is between 0.05% and 0.20% of deposited capital per year.
          </p>
          <p className="text-text-secondary leading-relaxed">
            To put this in concrete terms: an agent depositing 10,000 USDC at 7% APY earns 700 USDC in yield per year. The protocol takes 14 USDC (2% of 700). The agent keeps 686 USDC in yield plus the full 10,000 USDC principal. Without Clicks, that 10,000 USDC earns nothing for the agent and generates interest income for Circle instead.
          </p>
        </div>

        <div id="4-3-revenue-projections" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">4.3 Revenue Projections</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The following projections use a 7% blended APY assumption (weighted average across Aave V3 and Morpho) and the default 20% yield allocation.
          </p>
          <div className="overflow-x-auto">
            <div className="glassmorphism rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Total Agent USDC (TVL)</th>
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Capital in Yield (20%)</th>
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Annual Yield Generated</th>
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Protocol Revenue (2%)</th>
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Per-Agent Yield (1000 agents)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">$1M</td>
                    <td className="px-4 py-3 text-text-secondary">$200K</td>
                    <td className="px-4 py-3 text-text-secondary">$14,000</td>
                    <td className="px-4 py-3 text-text-secondary">$280</td>
                    <td className="px-4 py-3 text-text-secondary">$13.72</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">$10M</td>
                    <td className="px-4 py-3 text-text-secondary">$2M</td>
                    <td className="px-4 py-3 text-text-secondary">$140,000</td>
                    <td className="px-4 py-3 text-text-secondary">$2,800</td>
                    <td className="px-4 py-3 text-text-secondary">$137.20</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">$100M</td>
                    <td className="px-4 py-3 text-text-secondary">$20M</td>
                    <td className="px-4 py-3 text-text-secondary">$1,400,000</td>
                    <td className="px-4 py-3 text-text-secondary">$28,000</td>
                    <td className="px-4 py-3 text-text-secondary">$1,372</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-secondary">$1B</td>
                    <td className="px-4 py-3 text-text-secondary">$200M</td>
                    <td className="px-4 py-3 text-text-secondary">$14,000,000</td>
                    <td className="px-4 py-3 text-text-secondary">$280,000</td>
                    <td className="px-4 py-3 text-text-secondary">$13,720</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-text-secondary leading-relaxed mt-4 text-sm">
            These numbers assume steady-state APY and do not account for APY fluctuations, compounding effects, or changes in the yield allocation ratio across agents.
          </p>
        </div>

        <div id="4-4-black-hole" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">4.4 The Black Hole Effect</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The protocol&apos;s growth dynamics create a positive feedback loop. As more agents deposit USDC through Clicks, the total value locked in the underlying lending protocols increases. Higher TVL in well-managed lending pools tends to attract more borrowers, which sustains or improves lending rates. Better rates make Clicks more attractive to new agents, which brings more TVL.
          </p>
          <p className="text-text-secondary leading-relaxed">
            This effect is not unique to Clicks. It is a well-documented pattern in DeFi liquidity aggregation, described by Kwesi Tieku as &quot;The Attractor Effect&quot; in the context of yield routing protocols. What makes it relevant here is the agent-specific angle: agents that earn yield through Clicks have a quantifiable advantage over agents that leave USDC idle, and agent frameworks that integrate Clicks by default funnel new TVL into the protocol without any manual intervention by operators.
          </p>
        </div>

        <div id="4-5-competitive-comparison" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">4.5 Competitive Comparison</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Several yield-bearing stablecoin products exist in the market. apyUSD, sUSDu, and USDai each offer yield on stablecoin deposits. However, none of these products are designed for AI agents. They lack agent SDKs, MCP integration, and autonomous operation capability. They require manual interaction through web interfaces or wallet connections.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Clicks differs in three specific ways. First, it provides a TypeScript SDK and MCP server that enable agents to integrate yield generation with a single function call. Second, it is designed for the x402 payment pattern: split incoming payments automatically rather than requiring agents to manually deposit into a yield product. Third, it operates on Base natively, using the same USDC contract as x402 and Coinbase Agentic Wallets, with no bridging or token wrapping required.
          </p>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 5. Security */}
      <section id="5-security" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">5. Security</h2>

        <div id="5-1-audit-results" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">5.1 Audit Results</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            A comprehensive internal security review was conducted on March 15, 2026 using Slither v0.11.5 across all five production contracts. The review covered reentrancy, flash loan attacks, oracle manipulation, front-running, integer overflow, access control, denial of service, proxy/upgrade risks, and token approval patterns.
          </p>
          <div className="overflow-x-auto mb-4">
            <div className="glassmorphism rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Severity</th>
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Count</th>
                    <th className="text-left px-4 py-3 text-text-primary font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">Critical</td>
                    <td className="px-4 py-3 text-text-secondary">0</td>
                    <td className="px-4 py-3 text-text-secondary">N/A</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">High</td>
                    <td className="px-4 py-3 text-text-secondary">1</td>
                    <td className="px-4 py-3 text-accent">Mitigated</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">Medium</td>
                    <td className="px-4 py-3 text-text-secondary">3</td>
                    <td className="px-4 py-3 text-text-secondary">Documented</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-text-secondary">Low</td>
                    <td className="px-4 py-3 text-text-secondary">5</td>
                    <td className="px-4 py-3 text-text-secondary">Acceptable</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-text-secondary">Informational</td>
                    <td className="px-4 py-3 text-text-secondary">6</td>
                    <td className="px-4 py-3 text-text-secondary">No action needed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-text-secondary leading-relaxed mb-4">
            The single high-severity finding (H-1) was a Check-Effects-Interactions (CEI) pattern violation in <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">ClicksYieldRouter.withdraw()</code>. State variables <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">agentDeposited</code> and <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">totalDeposited</code> were updated after external calls to Morpho and Aave rather than before. While the contracts already used OpenZeppelin&apos;s ReentrancyGuard, the incorrect ordering violated the CEI pattern that the Solidity community considers mandatory for safe contract design. The fix moved all state updates before external calls. All 58 tests pass after the fix.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The three medium-severity findings were: locked ETH in contracts with <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">payable</code> functions (a gas optimization trade-off, documented), a divide-before-multiply precision issue in <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">getMorphoAPY()</code> that only affects a view function used for APY estimation with no impact on state-changing logic, and strict equality checks in balance comparisons that only affect owner-only functions. The five low-severity findings covered uninitialized local variables (Solidity defaults to zero), unused return values from external calls that revert on failure, dead code paths reserved for future features, a bounded loop in referral distribution (capped at 3 iterations), and timestamp comparisons with negligible miner manipulation risk.
          </p>
        </div>

        <div id="5-2-adversarial-testing" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">5.2 Adversarial Exploit Testing</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Beyond static analysis, the protocol was tested against 13 distinct attack scenarios modeled after real-world DeFi exploits documented in DeFi Hack Labs. These scenarios covered five categories.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Five reentrancy attack scenarios were tested: direct reentrancy, nested withdrawals, malicious ERC20 callbacks, cross-function reentrancy, and read-only reentrancy. After the CEI fix, all reentrancy vectors are blocked by both correct state ordering and OpenZeppelin&apos;s ReentrancyGuard.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Five flash loan attack scenarios were tested: APY manipulation, Morpho utilization manipulation, liquidity drain via deposit-then-withdraw, sandwich attacks, and share price inflation. The protocol is resistant to all tested flash loan vectors because it uses no price oracles and no liquidation logic. Individual agent accounting prevents fund dilution, and APY reads are atomic per block.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Twenty-eight access control checks verified every modifier, every authorization gate, and every cross-contract call path. The <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">onlySplitter</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">onlyOwner</code>, and operator-scoping patterns are correctly applied across all contracts.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Twelve precision and rounding attack scenarios tested dust deposits (1 wei), fee calculation accuracy, yield percentage splits, first-depositor inflation attacks, and zero-value edge cases. Fee math (2% on yield) and yield splits (5% to 50%) are correct within 1 wei rounding tolerance.
          </p>
          <p className="text-text-secondary leading-relaxed">
            Eleven griefing and DoS attack scenarios tested mass agent registrations, deposit and withdrawal spam, block gas limit stress with 100+ depositors, and front-running attempts. All loops are bounded, and individual agent accounting prevents cross-contamination between users.
          </p>
        </div>

        <div id="5-3-security-architecture" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">5.3 Security Architecture</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The contracts are immutable. There is no proxy pattern, no upgrade mechanism, and no admin key that can alter contract logic after deployment. This eliminates an entire class of governance attacks where a compromised admin key could drain user funds by pushing a malicious upgrade. The trade-off is clear: if a critical vulnerability is discovered, the contracts cannot be patched. Users would need to withdraw funds and migrate to a new deployment.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            All state-changing functions that touch funds are protected by OpenZeppelin&apos;s <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">nonReentrant</code> modifier. Solidity 0.8.20+ provides built-in integer overflow and underflow protection for standard operations. Assembly blocks use manual safety checks.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The protocol is non-custodial. USDC is either in the agent&apos;s wallet (liquid portion) or deposited directly in Aave V3 or Morpho (yield portion). Clicks contracts never hold agent USDC in their own balance.
          </p>
        </div>

        <div id="5-4-known-risks" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">5.4 Known Risks</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Smart contract risk exists despite testing and review. Undiscovered bugs may be present, and immutable contracts cannot be patched.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            DeFi protocol dependency risk is real. Clicks routes funds to Aave V3 and Morpho. If either protocol suffers an exploit or liquidity crisis, funds deposited through Clicks could be affected. Clicks does not control these external protocols.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            Base chain risk includes potential sequencer downtime, bridge vulnerabilities, and the general risks of Layer 2 rollup infrastructure. Base is a relatively new chain.
          </p>
          <p className="text-text-secondary leading-relaxed">
            A third-party external audit is planned before significant TVL milestones. The full report will be published when available.
          </p>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 6. SDK and Integration */}
      <section id="6-sdk" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">6. SDK and Integration</h2>

        <div id="6-1-typescript-sdk" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">6.1 TypeScript SDK</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The SDK is available as <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">@clicks-protocol/sdk</code> on npm. It wraps all contract interactions into a <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">ClicksClient</code> class that accepts either a signer (for transactions) or a provider (for read-only queries).
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            The recommended integration path is the <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">quickStart</code> method, which handles agent registration, USDC approval, and the first payment split in a single call:
          </p>
          <CodeBlock
            code={`import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);
// 80 USDC → agent wallet (liquid)
// 20 USDC → DeFi yield (Aave V3 or Morpho)`}
          />
          <p className="text-text-secondary leading-relaxed">
            Individual operations are also available: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">registerAgent</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">approveUSDC</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">receivePayment</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">withdrawYield</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">setOperatorYieldPct</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">getAgentInfo</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">getYieldInfo</code>, and <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">simulateSplit</code>. Read-only functions work with a provider instead of a signer, allowing agents to check balances and simulate splits without signing transactions.
          </p>
        </div>

        <div id="6-2-mcp-server" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">6.2 MCP Server</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The MCP server (<code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">@clicks-protocol/mcp-server</code>) exposes nine tools and one resource for AI agents using the Model Context Protocol. MCP is a standard for tool discovery that works with Claude, Cursor, LangChain, and any MCP-compatible client.
          </p>
          <p className="text-text-secondary leading-relaxed mb-4">
            The nine tools split into four read operations (<code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_get_agent_info</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_simulate_split</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_get_yield_info</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_get_referral_stats</code>) and five write operations (<code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_quick_start</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_receive_payment</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_withdraw_yield</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_register_agent</code>, <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks_set_yield_pct</code>). The <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicks://info</code> resource provides protocol metadata.
          </p>
          <p className="text-text-secondary leading-relaxed">
            An agent running on an MCP-compatible framework can discover Clicks through the MCP server, query current APY, simulate a payment split, and execute the split without any pre-existing knowledge of the protocol.
          </p>
        </div>

        <div id="6-3-agent-discovery" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">6.3 Agent Discovery</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The protocol publishes three discovery endpoints. An <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">llms.txt</code> file at <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicksprotocol.xyz/llms.txt</code> provides full protocol documentation formatted for language models. An <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">agent.json</code> manifest at <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">clicksprotocol.xyz/.well-known/agent.json</code> follows the emerging agent manifest standard for autonomous tool discovery. The MCP server itself acts as the third discovery mechanism, allowing agents to query available tools and their parameters at runtime.
          </p>
          <p className="text-text-secondary leading-relaxed">
            These discovery mechanisms enable a pattern where an agent can find Clicks, understand what it does, and integrate it without human involvement. This is the core design goal: yield generation that agents can adopt autonomously.
          </p>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 7. Referral System */}
      <section id="7-referral" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">7. Referral System (Phase 2)</h2>

        <div id="7-1-referral-contract" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">7.1 ClicksReferral Contract</h3>
          <p className="text-text-secondary leading-relaxed">
            The ClicksReferral contract implements an on-chain referral system where agents recruit other agents. Referral rewards are paid from the 2% protocol fee, meaning referred agents pay nothing extra. The contract has been compiled and tested with 32 dedicated tests passing.
          </p>
        </div>

        <div id="7-2-multi-level" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">7.2 Multi-Level Referral Structure</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            Referral rewards distribute across three levels. A direct referrer (Level 1) receives 40% of the protocol fee generated by the referred agent. The referrer&apos;s referrer (Level 2) receives 20%. The third-level referrer receives 10%. The remaining 30% goes to the protocol treasury. The referral chain depth is hard-capped at three levels in the contract, bounding gas costs and preventing unbounded loop execution.
          </p>
          <p className="text-text-secondary leading-relaxed">
            To illustrate with concrete numbers: if an agent deposits $10,000 at 7% APY, it generates $700 in annual yield. The 2% protocol fee on that yield is $14. The Level 1 referrer receives $5.60, Level 2 receives $2.80, Level 3 receives $1.40, and the treasury receives $4.20. At scale, with 1,000 agents in a referral tree at similar deposit levels, the Level 1 referrer earns $5,600 per year in passive income from protocol fees alone.
          </p>
        </div>

        <div id="7-3-team-system" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">7.3 Team System</h3>
          <p className="text-text-secondary leading-relaxed">
            Agents can form teams that unlock bonus yield tiers based on collective TVL. The system has four tiers: Bronze ($50,000 TVL, +0.20% bonus yield), Silver ($250,000 TVL, +0.50% bonus yield), Gold ($1,000,000 TVL, +1.00% bonus yield), and Diamond ($5,000,000 TVL, +2.00% bonus yield). These bonus yields are additive to the base DeFi yield and provide an incentive for operators to aggregate agents into coordinated groups.
          </p>
        </div>

        <div id="7-4-yield-bounty" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">7.4 Yield Discovery Bounty</h3>
          <p className="text-text-secondary leading-relaxed">
            The protocol includes a Yield Discovery Bounty mechanism. When an agent discovers and routes to a higher-yielding DeFi venue through the protocol, the discoverer receives 5% of the yield delta for 90 days. This creates an incentive for agents and operators to actively seek better yield opportunities, feeding information back into the protocol&apos;s routing decisions.
          </p>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 8. Regulatory Context */}
      <section id="8-regulatory" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">8. Regulatory Context</h2>

        <div id="8-1-sec-cftc" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">8.1 SEC/CFTC Joint Interpretive Release</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            On March 17, 2026, the SEC and CFTC jointly published a 68-page Interpretive Release that classified 18 crypto assets as &quot;Digital Commodities,&quot; explicitly removing them from the securities regulatory framework. SEC Chairman Paul S. Atkins and CFTC Chairman Michael S. Selig signed the release, which followed an SEC-CFTC Memorandum of Understanding signed on March 11, 2026 establishing a &quot;Joint Harmonization Initiative.&quot;
          </p>
          <p className="text-text-secondary leading-relaxed">
            The release establishes a token taxonomy with five categories: Digital Commodities (CFTC jurisdiction), Digital Collectibles (not securities), Digital Tools (not securities), Payment Stablecoins under the GENIUS Act (not securities), and Digital Securities (remain under SEC jurisdiction). A key conceptual element is &quot;Separation,&quot; meaning a token initially sold as part of an investment contract can lose that securities classification once the issuer&apos;s &quot;essential promises&quot; are fulfilled.
          </p>
        </div>

        <div id="8-2-digital-commodities" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">8.2 The 18 Digital Commodities</h3>
          <p className="text-text-secondary leading-relaxed">
            The 18 assets classified as Digital Commodities are: BTC, ETH, SOL, XRP, ADA, AVAX, LINK, DOGE, DOT, LTC, APT, BCH, HBAR, SHIB, XLM, XTZ, ALGO, and LBC. The inclusion of LBC is notable because the SEC had classified it as a security by court ruling in 2022, signaling a deliberate break with prior enforcement-first regulatory approach.
          </p>
        </div>

        <div id="8-3-usdc-stablecoin" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">8.3 USDC as Payment Stablecoin</h3>
          <p className="text-text-secondary leading-relaxed">
            USDC is explicitly categorized as a Payment Stablecoin under the GENIUS Act framework and falls outside the securities regulatory perimeter. This means USDC-based DeFi protocols operate in a clearer legal environment. Staking, lending, and yield generation using USDC carry reduced regulatory risk compared to the pre-2026 regime.
          </p>
        </div>

        <div id="8-4-impact-defi" className="mb-8">
          <h3 className="text-xl font-bold mb-3 text-text-primary">8.4 Impact on DeFi Yield Protocols</h3>
          <p className="text-text-secondary leading-relaxed mb-4">
            The interpretive release has several concrete implications for protocols like Clicks. Staking the 18 named assets is explicitly not a securities offering, which clarifies the legal status of lending protocols that accept these assets as collateral. Aave and Compound, where borrowers post ETH, WBTC, and other now-classified commodities as collateral to borrow USDC, operate on firmer legal ground. This regulatory clarity is expected to attract institutional capital to DeFi lending on Base, potentially increasing borrowing demand and sustaining or improving USDC lending yields.
          </p>
          <p className="text-text-secondary leading-relaxed">
            The release does not resolve all open questions. The FIT21 and CLARITY Act bills have not yet passed Congress. The interpretive guidance carries significant legal weight but is not legislation and could theoretically be revised by a future administration. A DeFi-specific carve-out has not yet been enacted. These factors represent ongoing regulatory risk that protocol users should consider.
          </p>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 9. Roadmap */}
      <section id="9-roadmap" className="mb-10">
        <h2 className="text-2xl font-bold mb-6 gradient-text">9. Roadmap</h2>

        <div className="space-y-6">
          <div className="glassmorphism rounded-xl p-5">
            <h3 className="text-lg font-bold mb-2 text-accent">Phase 1: Core Contracts (Complete)</h3>
            <p className="text-text-secondary leading-relaxed">
              Six smart contracts deployed to Base mainnet: ClicksRegistry, ClicksSplitterV4, ClicksYieldRouter, ClicksFeeV2, ClicksReferral, and Safe multisig ownership. All contracts compiled, tested (227 tests passing), and verified on Basescan. CEI pattern violation identified and fixed. Internal security audit completed with zero critical vulnerabilities. V2 upgrade in April 2026 wired referral distribution into the fee flow and transferred ownership from the deployer EOA to the Safe multisig.
            </p>
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="text-lg font-bold mb-2 text-accent">Phase 2: SDK and MCP Server (Complete)</h3>
            <p className="text-text-secondary leading-relaxed">
              TypeScript SDK (<code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">@clicks-protocol/sdk</code>) with ClicksClient class and quickStart integration flow. MCP server (<code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">@clicks-protocol/mcp-server</code>) with nine tools and one resource. Landing page live at clicksprotocol.xyz with llms.txt and agent.json discovery endpoints. Documentation, README, and demo materials prepared.
            </p>
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="text-lg font-bold mb-2 text-text-primary">Phase 3: Referral System</h3>
            <p className="text-text-secondary leading-relaxed">
              Public launch of the ClicksReferral contract with multi-level referral tracking, team system, and yield discovery bounty. This phase focuses on organic protocol growth through agent-to-agent recruitment incentives.
            </p>
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="text-lg font-bold mb-2 text-text-primary">Phase 4: Multi-Chain Expansion</h3>
            <p className="text-text-secondary leading-relaxed">
              Deployment to Arbitrum and Optimism, adding yield routing options across multiple Layer 2 chains. This expands the addressable market to agents operating on chains beyond Base and enables cross-chain yield comparison for optimal APY routing.
            </p>
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="text-lg font-bold mb-2 text-text-primary">Phase 5: Governance</h3>
            <p className="text-text-secondary leading-relaxed">
              Introduction of protocol governance for parameter adjustments such as fee rates, supported lending protocols, and yield routing strategy. The governance model will be designed after the protocol reaches meaningful TVL and a diverse operator base, ensuring that governance decisions reflect actual stakeholder interests rather than speculative token holdings.
            </p>
          </div>
        </div>
      </section>

      <hr className="border-white/10 my-10" />

      {/* 10. Conclusion */}
      <section id="10-conclusion" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 gradient-text">10. Conclusion</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Clicks Protocol addresses a specific and measurable problem: AI agents hold USDC that earns nothing while stablecoin issuers earn billions on the same capital. The protocol routes a configurable portion of agent USDC into DeFi lending on Base, generating yield between 2.5% and 10% APY with no lockup and a 2% fee on yield only.
        </p>
        <p className="text-text-secondary leading-relaxed mb-4">
          The architecture is minimal and intentional. Five immutable contracts handle registration, splitting, routing, fee collection, and referrals. A TypeScript SDK and MCP server reduce integration to a single function call. The protocol is non-custodial, open source, and self-funded.
        </p>
        <p className="text-text-secondary leading-relaxed">
          The convergence of x402 payments, Coinbase Agentic Wallets, and the March 2026 SEC/CFTC regulatory clarification creates the conditions for agent yield infrastructure to reach meaningful adoption. Clicks Protocol is built to be that infrastructure: simple enough for any agent to use, secure enough to trust with real capital, and aligned with agent operators through a fee model that only earns when they earn.
        </p>
      </section>

      <hr className="border-white/10 my-10" />

      {/* References */}
      <section id="references" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 gradient-text">References</h2>
        <ol className="list-decimal list-outside ml-6 space-y-2 text-text-secondary leading-relaxed text-sm">
          <li>Circle Financial, &quot;Annual Report 2023.&quot; Revenue of $1.7 billion from USDC reserve interest.</li>
          <li>Tether Holdings, &quot;Quarterly Attestation Report 2023.&quot; Reported $6.2 billion in profit.</li>
          <li>Coinbase, &quot;x402: The HTTP Payment Protocol.&quot; Specification for machine-to-machine USDC payments.</li>
          <li>Coinbase, &quot;Agentic Wallets.&quot; Self-custody wallet infrastructure for AI agents on Base.</li>
          <li>SEC Press Release 2026-30, &quot;SEC Clarifies Application of Federal Securities Laws to Crypto Assets.&quot; March 17, 2026.</li>
          <li>SEC and CFTC, &quot;Joint Interpretive Release: Digital Asset Classification Framework.&quot; 68-page release classifying 18 assets as Digital Commodities.</li>
          <li>SEC and CFTC, &quot;Memorandum of Understanding: Joint Harmonization Initiative.&quot; March 11, 2026.</li>
          <li>GENIUS Act, &quot;Guiding and Establishing National Innovation for U.S. Stablecoins.&quot; Federal legislation for payment stablecoin regulation.</li>
          <li>Aave V3 on Base. USDC lending market, approximately 2.5% APY as of March 2026.</li>
          <li>Morpho on Base. Curated vault APYs: Steakhouse USDC 2.76% ($286M TVL), Gauntlet USDC Prime 3.70% ($311M TVL), Moonwell Flagship USDC 4.28% ($12M TVL). Data captured March 16, 2026.</li>
          <li>Slither v0.11.5, &quot;Static Analysis Tool for Solidity.&quot; Used for internal security review.</li>
          <li>OpenZeppelin, &quot;ReentrancyGuard.&quot; Non-reentrant modifier for Solidity smart contracts.</li>
          <li>DeFi Hack Labs. Repository of documented DeFi exploit scenarios used as basis for adversarial testing.</li>
          <li>Tieku, Kwesi. &quot;The Attractor Effect.&quot; Analysis of positive feedback loops in DeFi liquidity aggregation.</li>
          <li>Clicks Protocol Security Self-Audit, March 15, 2026. Internal review: 0 Critical, 1 High (mitigated), 3 Medium, 5 Low, 6 Informational.</li>
          <li>Clicks Protocol GitHub, <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">clicks-protocol</code> organization. MIT license. 58 tests passing.</li>
          <li>Model Context Protocol (MCP), modelcontextprotocol.io. Standard for AI agent tool discovery.</li>
        </ol>
      </section>

      <hr className="border-white/10 my-10" />

      {/* Appendix: Protocol Evolution (April 2026) */}
      <section id="appendix-evolution" className="mb-10">
        <h2 className="text-2xl font-bold mb-4 gradient-text">Appendix: Protocol Evolution (April 2026)</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          The core contract set documented in Section 3 shipped in March 2026. In April 2026 we deployed a V2 upgrade and extended the protocol&apos;s position in the agent-commerce stack. This appendix summarises the changes that are not yet reflected in the body of this whitepaper.
        </p>

        <h3 className="text-xl font-bold mb-3 text-text-primary">A.1 V2 Contract Upgrade</h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          The V2 upgrade addressed two critical findings from the internal audit. The first was that the referral distribution hook existed in the ClicksReferral contract but was never called by the V1 fee collector — a dead code path. ClicksFeeV2 wires the distribution directly into the fee collection flow, so every collected fee is split between the Safe treasury and the on-chain attributed referrer chain before being swept. The second finding was that contract ownership rested on a single deployer EOA. That ownership was transferred to a Gnosis Safe multisig at{' '}
          <BasescanLink address="0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9" />
          , eliminating single-key-compromise risk.
        </p>

        <h3 className="text-xl font-bold mb-3 text-text-primary">A.2 ERC-8004 Integration</h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          Clicks Protocol is now registered on the ERC-8004 Identity Registry on Base as{' '}
          <a
            href="https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            <code className="text-accent bg-accent/10 px-1 py-0.5 rounded text-xs">agentId 45074</code>
          </a>. The Identity NFT points to an agent-registration manifest that declares our services (ACP, x402, MCP, A2A), contract set, and attestor schema. The Reputation Registry accrues feedback from trusted attestors as Clicks processes agent jobs. A future SplitterV5 will use this reputation to offer variable protocol fees — lower fees for high-reputation agents.
        </p>

        <h3 className="text-xl font-bold mb-3 text-text-primary">A.3 Attestor Schema V1</h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          Because ERC-8004 is transport-only (no value-scale convention), we published{' '}
          <a
            href="/strategy/ATTESTOR-SCHEMA-V1.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Clicks Attestor Schema V1
          </a>: ratings encoded in [0, 10000] with four decimals, typed job-kind and venue tags, and a 24-hour cadence limit per (agent, endpoint). Attestors who commit to this schema become eligible for whitelisting in the reputation multiplier. The Clicks operator wallet is explicitly excluded from the whitelist to prevent self-attestation.
        </p>

        <h3 className="text-xl font-bold mb-3 text-text-primary">A.4 Positioning: Agent Commerce Settlement Router</h3>
        <p className="text-text-secondary leading-relaxed mb-4">
          The original whitepaper describes Clicks as a yield protocol. A more accurate description in the April 2026 stack is an agent-commerce settlement router: the connective tissue between x402 / ACP payments on the ingress side and DeFi vaults (Aave, Morpho, future ERC-4626 backends) on the yield side. We do not operate our own vaults. We route. This is defensively positioned — competitors cannot displace us by building a better yield product — and complementary to partner protocols who want agent-originated inflow without building their own payment rails.
        </p>

        <p className="text-text-secondary leading-relaxed text-sm mt-6">
          A full v2 whitepaper reflecting these changes is planned. The present document is preserved to maintain historical record of the protocol&apos;s launch state.
        </p>
      </section>

      <hr className="border-white/10 my-10" />

      {/* Disclaimer */}
      <section className="mb-10">
        <div className="glassmorphism rounded-xl p-5">
          <p className="text-text-secondary text-sm leading-relaxed italic">
            Clicks Protocol is open source software under the MIT license. This whitepaper describes the protocol as deployed on Base mainnet in March 2026, with an appendix covering the V2 upgrade and ERC-8004 integration from April 2026. DeFi yield rates are variable and past performance does not guarantee future returns. Users should review the Known Risks section and conduct their own due diligence before depositing funds.
          </p>
        </div>
      </section>
    </div>
  );
}
