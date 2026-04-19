"use client";

import Link from 'next/link';
import { CopyButton } from '@/components/copy-button';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-card my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="prose-docs">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 gradient-text">About Clicks Protocol</h1>

      {/* Mission */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          Clicks Protocol turns idle agent USDC into yield. One call, no config, no human required.
        </p>
      </section>

      {/* The Problem */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">The Problem</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          AI agents are holding billions in USDC. Every x402 payment, every Coinbase Agentic Wallet balance, every agent treasury: USDC sitting idle between transactions. That money isn&apos;t sleeping. It&apos;s working for someone else.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Circle earned over $1.7 billion in revenue in 2023, primarily from interest on USDC reserves. Tether reported $6.2 billion in profit the same year. Combined, stablecoin issuers are capturing north of $12 billion annually from the float that users and agents provide. The agents holding that USDC? They get exactly 0%.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          This isn&apos;t a minor inefficiency. As the agentic economy scales, agent-held USDC will grow from millions to billions. Every dollar an agent holds for x402 payments, API calls, or operational expenses is a dollar generating yield for Circle, not for the agent or its operator.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The tools to fix this exist. DeFi lending protocols on Base offer 4-10% APY on USDC. But integrating with Aave or Morpho directly means writing custom smart contract logic, managing approvals, tracking positions, handling withdrawals, and monitoring APY across protocols. No agent framework does this out of the box. The friction is too high, so the money stays idle.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">The Solution</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Clicks Protocol is an on-chain yield layer for AI agents on Base. It takes every USDC payment an agent receives and automatically splits it: 80% stays liquid in the agent&apos;s wallet for instant use, 20% gets routed into DeFi yield via Aave V3 or Morpho, whichever offers better APY at the time.
        </p>
        <CodeBlock
          code={`const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);
// 80 USDC → liquid, 20 USDC → earning 4-8% APY`}
        />
        <p className="text-muted-foreground leading-relaxed mb-4">
          That&apos;s the entire integration. One SDK call. The protocol handles registration, USDC approval, payment splitting, yield routing, and rebalancing. No dashboard, no configuration, no manual steps.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          There is no lockup. Agents can withdraw principal plus accumulated yield at any time. The yield split is configurable between 5% and 50%, so operators can tune the balance between liquidity and earnings based on their agent&apos;s transaction patterns. The protocol charges a 2% fee on yield only, never on principal. If an agent deposits 1,000 USDC and earns 80 USDC in yield over a year, the protocol takes 1.60 USDC. The agent keeps everything else.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Clicks also includes an MCP server with 9 tools, so AI agents using Claude, Cursor, LangChain, or any MCP-compatible client can discover and use the protocol autonomously. The SDK is available on npm as{' '}
          <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">@clicks-protocol/sdk</code>.
        </p>
      </section>

      {/* Built for the x402 Economy */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Built for the x402 Economy</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The x402 payment protocol lets AI agents pay for API calls and services with USDC over HTTP. Coinbase Agentic Wallets give agents self-custody wallets on Base. Both use the same chain, same USDC contract. Clicks sits on top of both as the yield layer.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The pattern is straightforward: an agent holds USDC for x402 payments. Between transactions, that USDC is idle. Clicks routes 20% of incoming payments into yield automatically, while keeping 80% liquid for instant x402 spending. No extra chain, no bridging, no wrapped tokens. Same Base USDC contract throughout.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          No competing protocol offers this integration. Existing yield products like apyUSD, sUSDu, or USDai don&apos;t have agent SDKs, don&apos;t support autonomous operation, and aren&apos;t designed for the payment patterns of AI agents. Clicks was built specifically for this use case from day one.
        </p>
      </section>

      {/* Security */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Security First</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Clicks Protocol runs on five immutable smart contracts deployed to Base mainnet. No proxy pattern, no upgradability, no admin keys that can change contract logic after deployment. The contracts use OpenZeppelin&apos;s battle-tested libraries, including ReentrancyGuard on all external functions and Ownable for access control.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          A comprehensive security self-audit was conducted using Slither v0.11.5, covering all five production contracts. The audit examined reentrancy, flash loan attacks, oracle manipulation, front-running, integer overflow, access control, denial of service, and token approval vectors. Results: zero critical vulnerabilities. One high-severity pattern issue (CEI ordering in withdraw) was identified and fixed, with all 58 tests passing after the fix. No flash loan risk exists because the protocol uses no price oracles or liquidation logic.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          All contract source code is verified on Basescan. The protocol holds no user funds in its own custody: USDC is either in the agent&apos;s wallet (liquid portion) or deposited in Aave V3/Morpho (yield portion). A third-party audit is planned before significant TVL growth.
        </p>
        <div className="mt-4">
          <Link href="/security" className="text-accent hover:underline text-sm font-medium">
            Read the full Security documentation →
          </Link>
        </div>
      </section>

      {/* Team */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Team</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Clicks Protocol is self-funded and independent. No VC money, no token sale, no governance theatre. The protocol earns revenue through a transparent 2% fee on yield, aligned with the agents it serves: if agents don&apos;t earn, the protocol doesn&apos;t earn.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The codebase is open source under the MIT license. Five production contracts, a TypeScript SDK, an MCP server, and 58 tests. Everything is on{' '}
          <a href="https://github.com/clicks-protocol" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            GitHub
          </a>{' '}
          under the clicks-protocol organization. Contributions are welcome.
        </p>
      </section>

      {/* Get Started */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Get Started</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Install the SDK and start earning yield in under a minute:
        </p>
        <CodeBlock code="npm install @clicks-protocol/sdk ethers@^6" language="bash" />
        <CodeBlock
          code={`import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);`}
        />
        <h3 className="text-lg font-semibold mt-6 mb-3 text-foreground">Resources</h3>
        <ul className="space-y-2">
          <li>
            <Link href="/docs/api" className="text-accent hover:underline">
              SDK Reference
            </Link>
            {' '}<span className="text-muted-foreground">— Methods, parameters, and code examples</span>
          </li>
          <li>
            <a href="https://github.com/clicks-protocol" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              GitHub
            </a>
            {' '}<span className="text-muted-foreground">— Source code, issues, contributions</span>
          </li>
          <li>
            <a href="https://discord.gg/clicks-protocol" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Discord
            </a>
            {' '}<span className="text-muted-foreground">— Developer community</span>
          </li>
          <li>
            <a href="https://www.npmjs.com/package/@clicks-protocol/mcp-server" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              MCP Server
            </a>
            {' '}<span className="text-muted-foreground">— Agent-native tool discovery</span>
          </li>
        </ul>
        <div className="glassmorphism rounded-xl p-5 mt-6">
          <p className="text-muted-foreground">
            Your agent earns USDC. That USDC sits idle. Clicks fixes that.
          </p>
        </div>
      </section>
    </div>
  );
}
