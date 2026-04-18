"use client";

import Link from 'next/link';
import { Shield, Info, Code, ExternalLink, MessageCircle, Mail } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';

const quickStartCode = `import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('1000', agentAddress);
// 800 USDC → liquid (instant access)
// 200 USDC → earning 4-8% APY (withdraw anytime)`;

const cards = [
  {
    title: 'About',
    description: 'Mission, problem, solution, and how Clicks Protocol works for AI agents.',
    href: '/about',
    icon: Info,
  },
  {
    title: 'Security',
    description: 'Audit results, contract addresses, known risks, and bug bounty program.',
    href: '/security',
    icon: Shield,
  },
  {
    title: 'SDK Reference',
    description: 'Installation, methods, parameters, return types, and code examples.',
    href: '/docs/api',
    icon: Code,
  },
  {
    title: 'GitHub',
    description: 'Source code, issues, contributions. MIT licensed.',
    href: 'https://github.com/clicks-protocol',
    icon: ExternalLink,
    external: true,
  },
];

export default function DocsOverview() {
  return (
    <div>
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 gradient-text">
          Clicks Protocol Documentation
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Everything you need to integrate autonomous yield for AI agents. One SDK call. No lockup. Built on Base.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="glassmorphism rounded-xl p-6 hover-glow cursor-pointer h-full">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                    {card.title}
                    {card.external && <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />}
                  </h3>
                  <p className="text-text-secondary text-sm">{card.description}</p>
                </div>
              </div>
            </div>
          );

          if (card.external) {
            return (
              <a key={card.title} href={card.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            );
          }

          return (
            <Link key={card.title} href={card.href}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Quick Start */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <p className="text-text-secondary mb-4">
          Install the SDK and start earning yield in under a minute:
        </p>
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-surface">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
            <span className="text-xs text-text-secondary font-mono">typescript</span>
            <CopyButton text={quickStartCode} />
          </div>
          <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
            <code>{quickStartCode}</code>
          </pre>
        </div>
      </div>

      {/* MCP Integration */}
      <div id="mcp-integration" className="mb-12">
        <h2 className="text-2xl font-bold mb-4">MCP Integration</h2>
        <p className="text-text-secondary mb-6">
          Connect your AI agent to Clicks Protocol via the public MCP server. Copy the config for your client:
        </p>

        <div className="space-y-6">
          {/* Claude Desktop */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Claude Desktop</h3>
            <p className="text-text-secondary text-sm mb-3">
              Add to your <code className="text-accent">claude_desktop_config.json</code>:
            </p>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-surface">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs text-text-secondary font-mono">json</span>
                <CopyButton text={`{
  "mcpServers": {
    "clicks-protocol": {
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}`} />
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
                <code>{`{
  "mcpServers": {
    "clicks-protocol": {
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}`}</code>
              </pre>
            </div>
          </div>

          {/* OpenClaw */}
          <div>
            <h3 className="font-semibold text-lg mb-2">OpenClaw</h3>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-surface">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs text-text-secondary font-mono">bash</span>
                <CopyButton text="openclaw mcp set clicks-protocol --url https://mcp.clicksprotocol.xyz/mcp" />
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
                <code>openclaw mcp set clicks-protocol --url https://mcp.clicksprotocol.xyz/mcp</code>
              </pre>
            </div>
          </div>

          {/* Codex CLI */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Codex CLI</h3>
            <p className="text-text-secondary text-sm mb-3">
              Add to <code className="text-accent">.codex/config.json</code>:
            </p>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-surface">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs text-text-secondary font-mono">json</span>
                <CopyButton text={`{
  "mcpServers": {
    "clicks-protocol": {
      "type": "url",
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}`} />
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
                <code>{`{
  "mcpServers": {
    "clicks-protocol": {
      "type": "url",
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}`}</code>
              </pre>
            </div>
          </div>

          {/* Gemini CLI */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Gemini CLI</h3>
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-surface">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                <span className="text-xs text-text-secondary font-mono">json</span>
                <CopyButton text={`{
  "mcpServers": {
    "clicks-protocol": {
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}`} />
              </div>
              <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
                <code>{`{
  "mcpServers": {
    "clicks-protocol": {
      "url": "https://mcp.clicksprotocol.xyz/mcp"
    }
  }
}`}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Available Tools */}
        <div className="mt-6 glassmorphism rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-3">Available MCP Tools</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-3">
              <code className="text-accent font-mono whitespace-nowrap">get_protocol_stats</code>
              <span className="text-text-secondary">TVL, APY, agent count</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-accent font-mono whitespace-nowrap">get_agent_info</code>
              <span className="text-text-secondary">Check if an agent is registered</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-accent font-mono whitespace-nowrap">get_yield_info</code>
              <span className="text-text-secondary">Yield balance for an agent</span>
            </div>
            <div className="flex items-start gap-3">
              <code className="text-accent font-mono whitespace-nowrap">simulate_yield</code>
              <span className="text-text-secondary">Project earnings over time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="glassmorphism rounded-xl p-6">
        <h3 className="font-semibold text-lg mb-3">Need help?</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://discord.gg/clicks-protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Join our Discord</span>
          </a>
          <a
            href="mailto:hello@clicksprotocol.xyz"
            className="flex items-center space-x-2 text-text-secondary hover:text-accent transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>hello@clicksprotocol.xyz</span>
          </a>
        </div>
      </div>
    </div>
  );
}
