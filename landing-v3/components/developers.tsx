import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { CopyButton } from './copy-button';

export function Developers() {
  return (
    <section id="developers" className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">For Developers</h2>
          <p className="text-text-secondary text-base sm:text-lg lg:text-xl">
            Everything you need to integrate Clicks Protocol
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <Card className="glassmorphism-strong">
            <CardContent className="pt-8">
              <div className="text-accent font-bold mb-4 tracking-widest uppercase text-sm">
                SDK
              </div>
              <CardTitle className="mb-4">TypeScript SDK</CardTitle>
              <CardDescription className="mb-8">
                Full-featured SDK with TypeScript support and complete type safety.
              </CardDescription>
              <div className="relative mb-6">
                <pre className="bg-bg-primary border border-border rounded-xl p-3 sm:p-4 lg:p-5 text-[10px] sm:text-xs lg:text-sm font-mono overflow-x-auto whitespace-pre max-w-full">
                  npm install @clicks-protocol/sdk
                </pre>
                <CopyButton text="npm install @clicks-protocol/sdk" />
              </div>
              <a
                href="https://www.npmjs.com/package/@clicks-protocol/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium inline-flex items-center gap-2"
              >
                View on npm
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>

          <Card className="glassmorphism-strong">
            <CardContent className="pt-8">
              <div className="text-accent font-bold mb-4 tracking-widest uppercase text-sm">
                MCP Server
              </div>
              <CardTitle className="mb-4">Model Context Protocol</CardTitle>
              <CardDescription className="mb-8">
                Connect your LLM directly to Clicks for seamless integration.
              </CardDescription>
              <div className="relative mb-6">
                <pre className="bg-bg-primary border border-border rounded-xl p-3 sm:p-4 lg:p-5 text-[10px] sm:text-xs lg:text-sm font-mono overflow-x-auto whitespace-pre max-w-full">
                  npx @clicks-protocol/mcp-server
                </pre>
                <CopyButton text="npx @clicks-protocol/mcp-server" />
              </div>
              <a
                href="/docs"
                className="text-accent hover:underline font-medium inline-flex items-center gap-2"
              >
                Get Started
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>

          <Card className="glassmorphism-strong">
            <CardContent className="pt-8">
              <div className="text-accent font-bold mb-4 tracking-widest uppercase text-sm">
                Smart Contracts
              </div>
              <CardTitle className="mb-4">Verified on Basescan</CardTitle>
              <CardDescription className="mb-8">
                Open source, audited smart contracts. Review and verify.
              </CardDescription>
              <a
                href="https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium inline-flex items-center gap-2"
              >
                View on Basescan
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>

          <Card className="glassmorphism-strong">
            <CardContent className="pt-8">
              <div className="text-accent font-bold mb-4 tracking-widest uppercase text-sm">
                Documentation
              </div>
              <CardTitle className="mb-4">Full API Reference</CardTitle>
              <CardDescription className="mb-8">
                Complete guides, examples, and API documentation.
              </CardDescription>
              <a
                href="/docs"
                className="text-accent hover:underline font-medium inline-flex items-center gap-2"
              >
                Read the Docs
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
