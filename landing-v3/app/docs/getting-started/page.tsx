"use client";

import Link from 'next/link';
import { CopyButton } from '@/components/copy-button';

function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] my-4">
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

export default function GettingStartedPage() {
  return (
    <div className="prose-docs">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 gradient-text">Getting Started</h1>
      <p className="text-text-secondary text-lg mb-8">
        Start earning yield on agent USDC in under a minute. One SDK call, no config, no human required.
      </p>

      {/* Prerequisites */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Prerequisites</h2>
        <div className="space-y-4">
          <div className="glassmorphism rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Node.js</h3>
            <p className="text-text-secondary text-sm mb-2">Node.js 18+ is required.</p>
            <CodeBlock code="node --version" language="bash" />
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Ethers v6</h3>
            <p className="text-text-secondary text-sm mb-2">The SDK uses ethers v6 for blockchain interactions.</p>
            <CodeBlock code="npm install ethers@^6" language="bash" />
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Base RPC</h3>
            <p className="text-text-secondary text-sm mb-2">Clicks Protocol runs on Base mainnet. Use this RPC endpoint:</p>
            <CodeBlock code="https://mainnet.base.org" language="bash" />
            <p className="text-text-secondary text-sm mt-2">
              Or use any Base-compatible RPC provider (Alchemy, Infura, etc.).
            </p>
          </div>
        </div>
      </section>

      {/* Install SDK */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Install SDK</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Install the Clicks Protocol SDK and ethers v6:
        </p>
        <CodeBlock code="npm install @clicks-protocol/sdk ethers@^6" language="bash" />
        <p className="text-text-secondary text-sm mt-2">
          Or with yarn:
        </p>
        <CodeBlock code="yarn add @clicks-protocol/sdk ethers@^6" language="bash" />
      </section>

      {/* Quick Start */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Quick Start (3 Steps)</h2>
        <div className="space-y-6">
          <div className="glassmorphism rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-3 text-text-primary">Step 1: Import and Initialize</h3>
            <p className="text-text-secondary text-sm mb-3">
              Import the SDK and create a ClicksClient instance with a signer.
            </p>
            <CodeBlock code={`import { ClicksClient } from '@clicks-protocol/sdk';

// Create a signer (ethers v6)
const signer = new ethers.Wallet(privateKey, provider);

// Initialize ClicksClient
const clicks = new ClicksClient(signer);`} />
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-3 text-text-primary">Step 2: Quick Start</h3>
            <p className="text-text-secondary text-sm mb-3">
              Call <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">quickStart</code> with an amount and agent address.
            </p>
            <CodeBlock code={`// One-call setup: registers agent, approves USDC, and splits first payment
await clicks.quickStart('1000', agentAddress);

// Result: 800 USDC → liquid (instant access)
//         200 USDC → earning 7-13% APY on Morpho`} />
            <p className="text-text-secondary text-sm mt-3">
              The method automatically splits payments 80% liquid / 20% yield by default.
            </p>
          </div>

          <div className="glassmorphism rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-3 text-text-primary">Step 3: Receive Payments</h3>
            <p className="text-text-secondary text-sm mb-3">
              For subsequent payments, use <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">receivePayment</code>.
            </p>
            <CodeBlock code={`// All future payments are automatically split 80/20
await clicks.receivePayment('500', agentAddress);`} />
            <p className="text-text-secondary text-sm mt-3">
              No additional setup needed. The agent is now earning yield on 20% of all incoming USDC.
            </p>
          </div>
        </div>
      </section>

      {/* MCP Server Setup */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">MCP Server Setup</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          AI agents can discover and use Clicks via Model Context Protocol (MCP). The server provides 9 tools for autonomous operation.
        </p>
        <CodeBlock code="npx @clicks-protocol/mcp-server" language="bash" />
        <p className="text-text-secondary text-sm mt-2 mb-4">
          Or install globally:
        </p>
        <CodeBlock code={`npm install -g @clicks-protocol/mcp-server
CLICKS_PRIVATE_KEY=0x... clicks-mcp`} language="bash" />
        
        <div className="glassmorphism rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-lg mb-3 text-text-primary">Available Tools (9)</h3>
          <ul className="space-y-2 text-text-secondary text-sm">
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_quick_start</code> — One-call setup + first payment</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_receive_payment</code> — Split incoming USDC payment</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_withdraw_yield</code> — Withdraw principal + yield</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_register_agent</code> — Register new agent</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_set_yield_pct</code> — Set custom yield percentage</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_get_agent_info</code> — Agent registration + balance info</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_simulate_split</code> — Preview payment split</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_get_yield_info</code> — Current APY + active protocol</li>
            <li><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks_get_referral_stats</code> — Referral network stats</li>
          </ul>
        </div>
      </section>

      {/* Check Yield Balance */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Check Yield Balance</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Monitor an agent&apos;s yield balance and accumulated earnings.
        </p>
        <CodeBlock code={`// Get agent info including deposited amount
const agentInfo = await clicks.getAgentInfo(agentAddress);
console.log(agentInfo);
// { isRegistered: true, deposited: 200000000n, yieldPct: 20n }

// Get current yield protocol and APY rates
const yieldInfo = await clicks.getYieldInfo();
console.log(yieldInfo);
// { activeProtocol: 'Morpho', morphoAPY: 950, aaveAPY: 700 }`} />
        <p className="text-text-secondary text-sm mt-3">
          The <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">getAgentInfo</code> method works with a provider (no signer needed).
        </p>
      </section>

      {/* Withdraw Yield */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Withdraw Yield</h2>
        <p className="text-text-secondary leading-relaxed mb-4">
          Withdraw principal plus accumulated yield at any time. No lockup period.
        </p>
        <CodeBlock code={`// Withdraw all principal + yield for an agent
await clicks.withdrawYield(agentAddress);`} />
        <p className="text-text-secondary text-sm mt-3">
          The full amount (principal + accrued yield) is returned to the agent&apos;s wallet in USDC.
        </p>
      </section>

      {/* Next Steps */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-text-primary">Next Steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/docs/api" className="glassmorphism rounded-xl p-5 hover-glow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">SDK Reference</h3>
            <p className="text-text-secondary text-sm">
              Complete API reference with all methods, parameters, and code examples.
            </p>
          </Link>

          <Link href="/security" className="glassmorphism rounded-xl p-5 hover-glow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Security</h3>
            <p className="text-text-secondary text-sm">
              Audit results, contract addresses, known risks, and bug bounty program.
            </p>
          </Link>

          <a
            href="https://github.com/clicks-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="glassmorphism rounded-xl p-5 hover-glow cursor-pointer"
          >
            <h3 className="font-semibold text-lg mb-2 text-text-primary">GitHub</h3>
            <p className="text-text-secondary text-sm">
              Source code, issues, contributions. MIT licensed.
            </p>
          </a>

          <a
            href="https://discord.gg/clicks-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="glassmorphism rounded-xl p-5 hover-glow cursor-pointer"
          >
            <h3 className="font-semibold text-lg mb-2 text-text-primary">Discord</h3>
            <p className="text-text-secondary text-sm">
              Developer community, support, and announcements.
            </p>
          </a>
        </div>
      </section>

      {/* Summary */}
      <div className="glassmorphism rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-3 text-text-primary">Summary</h3>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>• Install SDK: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">npm install @clicks-protocol/sdk ethers@^6</code></li>
          <li>• Initialize: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">new ClicksClient(signer)</code></li>
          <li>• Quick start: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks.quickStart(&apos;amount&apos;, agentAddress)</code></li>
          <li>• Default split: 80% liquid, 20% earning 7-13% APY on Morpho</li>
          <li>• Check balance: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks.getAgentInfo(agentAddress)</code></li>
          <li>• Withdraw anytime: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks.withdrawYield(agentAddress)</code></li>
          <li>• MCP server: <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">npx @clicks-protocol/mcp-server</code> (9 tools)</li>
        </ul>
      </div>
    </div>
  );
}
