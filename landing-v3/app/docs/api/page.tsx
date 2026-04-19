"use client";

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

function MethodSection({ name, signature, description, params, returns, example }: {
  name: string;
  signature: string;
  description: string;
  params?: { name: string; type: string; desc: string }[];
  returns: string;
  example: string;
}) {
  return (
    <div className="glassmorphism rounded-xl p-5 mb-6">
      <h3 className="text-lg font-semibold text-accent mb-1 font-mono">{name}</h3>
      <code className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded block mb-3 overflow-x-auto">{signature}</code>
      <p className="text-muted-foreground text-sm mb-3">{description}</p>
      {params && params.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Parameters</h4>
          <div className="space-y-1.5">
            {params.map((p) => (
              <div key={p.name} className="flex items-start gap-2 text-sm">
                <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs flex-shrink-0">{p.name}</code>
                <span className="text-muted-foreground text-xs">({p.type})</span>
                <span className="text-muted-foreground text-xs">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1">Returns</h4>
        <p className="text-muted-foreground text-sm">{returns}</p>
      </div>
      <CodeBlock code={example} />
    </div>
  );
}

export default function ApiReferencePage() {
  return (
    <div className="prose-docs">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 gradient-text">SDK Reference</h1>
      <p className="text-muted-foreground text-lg mb-8">
        Complete API reference for <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">@clicks-protocol/sdk</code>.
      </p>

      {/* Installation */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Installation</h2>
        <CodeBlock code="npm install @clicks-protocol/sdk" language="bash" />
        <p className="text-muted-foreground text-sm mb-2">Or with yarn:</p>
        <CodeBlock code="yarn add @clicks-protocol/sdk" language="bash" />
        <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground">Dependencies</h3>
        <CodeBlock code="npm install ethers@^6" language="bash" />
      </section>

      {/* Quick Start */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">Quick Start</h2>
        <CodeBlock code={`import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);
// 800 USDC → liquid (instant access)
// 200 USDC → earning 4-8% APY (withdraw anytime)`} />
        <p className="text-muted-foreground text-sm">
          That&apos;s it. No config. No dashboard. No human required.
        </p>
      </section>

      {/* Methods */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Methods</h2>

        <MethodSection
          name="quickStart"
          signature="quickStart(amount: string, agentAddress: string, referrerAddress?: string): Promise<QuickStartResult>"
          description="One-call setup: registers agent, approves USDC, and splits the first payment. Skips steps already completed."
          params={[
            { name: 'amount', type: 'string', desc: 'USDC amount (human-readable, e.g. "1000")' },
            { name: 'agentAddress', type: 'string', desc: 'Agent wallet address' },
            { name: 'referrerAddress', type: 'string', desc: 'Optional referrer address for referral rewards' },
          ]}
          returns="{ registered: boolean, approved: boolean, paymentSplit: boolean }"
          example={`const result = await clicks.quickStart('100', agentAddress);
// result.registered   → true (skips if already done)
// result.approved     → true (skips if allowance sufficient)
// result.paymentSplit → true

// With referrer (L1=40%, L2=20%, L3=10% of protocol fee)
await clicks.quickStart('1000', agentAddress, referrerAddress);`}
        />

        <MethodSection
          name="registerAgent"
          signature="registerAgent(agentAddress: string): Promise<TransactionReceipt>"
          description="Register a new agent in the Clicks Registry."
          params={[
            { name: 'agentAddress', type: 'string', desc: 'Agent wallet address to register' },
          ]}
          returns="Transaction receipt"
          example={`await clicks.registerAgent(agentAddress);`}
        />

        <MethodSection
          name="approveUSDC"
          signature="approveUSDC(amount: string | 'max'): Promise<TransactionReceipt>"
          description="Approve USDC spending for the Clicks contracts."
          params={[
            { name: 'amount', type: "string | 'max'", desc: 'USDC amount to approve, or "max" for unlimited' },
          ]}
          returns="Transaction receipt"
          example={`// Approve max (recommended)
await clicks.approveUSDC('max');

// Approve specific amount
await clicks.approveUSDC('10000');`}
        />

        <MethodSection
          name="receivePayment"
          signature="receivePayment(amount: string, agentAddress: string): Promise<TransactionReceipt>"
          description="Process an incoming USDC payment. Automatically splits based on the agent's yield percentage (default 80/20)."
          params={[
            { name: 'amount', type: 'string', desc: 'USDC amount (human-readable)' },
            { name: 'agentAddress', type: 'string', desc: 'Agent wallet address' },
          ]}
          returns="Transaction receipt"
          example={`// Auto-splits 80/20
await clicks.receivePayment('500', agentAddress);`}
        />

        <MethodSection
          name="withdrawYield"
          signature="withdrawYield(agentAddress: string): Promise<TransactionReceipt>"
          description="Withdraw all principal plus accumulated yield for an agent."
          params={[
            { name: 'agentAddress', type: 'string', desc: 'Agent wallet address' },
          ]}
          returns="Transaction receipt"
          example={`await clicks.withdrawYield(agentAddress);`}
        />

        <MethodSection
          name="setOperatorYieldPct"
          signature="setOperatorYieldPct(percentage: number): Promise<TransactionReceipt>"
          description="Set a custom yield split percentage (5-50%)."
          params={[
            { name: 'percentage', type: 'number', desc: 'Yield percentage (5-50). E.g. 30 means 30% to yield, 70% liquid.' },
          ]}
          returns="Transaction receipt"
          example={`// 30% to yield, 70% liquid
await clicks.setOperatorYieldPct(30);`}
        />

        <MethodSection
          name="getAgentInfo"
          signature="getAgentInfo(agentAddress: string): Promise<AgentInfo>"
          description="Read-only. Get agent registration status and balance info. Works with provider (no signer needed)."
          params={[
            { name: 'agentAddress', type: 'string', desc: 'Agent wallet address' },
          ]}
          returns="{ isRegistered: boolean, deposited: bigint, yieldPct: bigint }"
          example={`const clicks = new ClicksClient(provider);
const agent = await clicks.getAgentInfo(agentAddress);
// { isRegistered: true, deposited: 1000000n, yieldPct: 20n }`}
        />

        <MethodSection
          name="getYieldInfo"
          signature="getYieldInfo(): Promise<YieldInfo>"
          description="Read-only. Get current APY rates and active yield protocol."
          returns="{ activeProtocol: string, aaveAPY: number, morphoAPY: number, ... }"
          example={`const yieldInfo = await clicks.getYieldInfo();
// { activeProtocol: 'Morpho', aaveAPY: 700, morphoAPY: 950, ... }`}
        />

        <MethodSection
          name="simulateSplit"
          signature="simulateSplit(amount: string, agentAddress: string): Promise<SplitResult>"
          description="Read-only. Preview how a payment would be split without executing a transaction."
          params={[
            { name: 'amount', type: 'string', desc: 'USDC amount to simulate' },
            { name: 'agentAddress', type: 'string', desc: 'Agent wallet address' },
          ]}
          returns="{ liquid: bigint, toYield: bigint }"
          example={`const split = await clicks.simulateSplit('100', agentAddress);
// { liquid: 80000000n, toYield: 20000000n }`}
        />
      </section>

      {/* MCP Server */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-foreground">MCP Server</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          AI agents can discover and use Clicks via{' '}
          <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Model Context Protocol (MCP)
          </a>:
        </p>
        <CodeBlock code="CLICKS_PRIVATE_KEY=0x... npx @clicks-protocol/mcp-server" language="bash" />
        <p className="text-muted-foreground text-sm mb-2">Or install globally:</p>
        <CodeBlock code={`npm install -g @clicks-protocol/mcp-server
CLICKS_PRIVATE_KEY=0x... clicks-mcp`} language="bash" />

        <h3 className="text-lg font-semibold mt-6 mb-4 text-foreground">Available Tools (9)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-4 font-semibold text-foreground">Tool</th>
                <th className="text-left py-3 pr-4 font-semibold text-foreground">Type</th>
                <th className="text-left py-3 font-semibold text-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { tool: 'clicks_quick_start', type: '✍️ write', desc: 'One-call setup + first payment' },
                { tool: 'clicks_receive_payment', type: '✍️ write', desc: 'Split incoming USDC payment' },
                { tool: 'clicks_withdraw_yield', type: '✍️ write', desc: 'Withdraw principal + yield' },
                { tool: 'clicks_register_agent', type: '✍️ write', desc: 'Register new agent' },
                { tool: 'clicks_set_yield_pct', type: '✍️ write', desc: 'Set custom yield percentage' },
                { tool: 'clicks_get_agent_info', type: '📖 read', desc: 'Agent registration + balance info' },
                { tool: 'clicks_simulate_split', type: '📖 read', desc: 'Preview payment split' },
                { tool: 'clicks_get_yield_info', type: '📖 read', desc: 'Current APY + active protocol' },
                { tool: 'clicks_get_referral_stats', type: '📖 read', desc: 'Referral network stats' },
              ].map((row) => (
                <tr key={row.tool} className="border-b border-white/5">
                  <td className="py-3 pr-4">
                    <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">{row.tool}</code>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">{row.type}</td>
                  <td className="py-3 text-muted-foreground">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glassmorphism rounded-lg p-4 mt-4">
          <p className="text-muted-foreground text-sm">
            <span className="font-semibold text-foreground">Resource:</span>{' '}
            <code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded text-xs">clicks://info</code> — full protocol metadata
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            <span className="font-semibold text-foreground">Compatible with:</span> Claude, Cursor, LangChain, CrewAI, and any MCP-compatible client.
          </p>
        </div>
      </section>
    </div>
  );
}
