"use client";

import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { CopyButton } from './copy-button';

export function Hero() {
  return (
    <section className="relative pt-24 sm:pt-32 lg:pt-40 pb-16 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          {/* Left: Message */}
          <div className="parallax" data-speed="0.5">
            <div className="inline-flex items-center px-4 py-2 mb-6 border border-accent/30 rounded-full text-sm text-accent badge-glow">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Built for x402 Economy
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 sm:mb-6 lg:mb-8 pb-2 gradient-text leading-[1.15] sm:leading-[1.2] lg:leading-[1.35] tracking-tight">
              Autonomous Yield for AI&nbsp;Agents
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 lg:mb-12 leading-relaxed max-w-xl">
              Your AI agent&apos;s USDC shouldn&apos;t sit idle. Earn 4–8% APY in one SDK call. No&nbsp;lockup. Built on&nbsp;Base.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10 w-full sm:w-auto">
              <a href="/docs/getting-started" className="w-full sm:w-auto">
                <Button size="lg" className="w-full">Start Earning Yield</Button>
              </a>
              <a href="/docs" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full">
                  Read the Docs
                </Button>
              </a>
            </div>

            {/* Social Proof */}
            <div className="glassmorphism rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider uppercase text-center">
                Integrates with
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  <span className="font-semibold text-lg">Base</span>
                </div>
                <div className="flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-accent rounded-full"></div>
                  <span className="font-semibold text-lg">Morpho</span>
                </div>
                <div className="flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                  <span className="font-semibold text-lg">USDC</span>
                </div>
                <div className="flex items-center space-x-2 opacity-70 hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-blue-700 rounded-full"></div>
                  <span className="font-semibold text-lg">Coinbase</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Code */}
          <div className="parallax" data-speed="0.8">
            <div className="glassmorphism-strong rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 hover-glow transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm text-muted-foreground font-mono">
                    quickstart.js
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Live in 3 lines
                  </p>
                </div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <pre className="bg-background border border-border rounded-lg p-3 sm:p-4 lg:p-6 text-[10px] sm:text-xs lg:text-sm overflow-x-auto whitespace-pre max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <code>
                    <span className="text-accent">import</span>{' '}
                    <span className="text-foreground">{'{ ClicksClient }'}</span>{' '}
                    <span className="text-accent">from</span>{' '}
                    <span className="text-yellow-400">
                      &apos;@clicks-protocol/sdk&apos;
                    </span>
                    <span className="text-foreground">;</span>
                    {'\n\n'}
                    <span className="text-accent">const</span>{' '}
                    <span className="text-foreground">clicks = </span>
                    <span className="text-accent">new</span>{' '}
                    <span className="text-foreground">ClicksClient(signer);</span>
                    {'\n'}
                    <span className="text-accent">await</span>{' '}
                    <span className="text-foreground">clicks.</span>
                    <span className="text-blue-400">quickStart</span>
                    <span className="text-foreground">(</span>
                    <span className="text-yellow-400">&apos;100&apos;</span>
                    <span className="text-foreground">, agentAddress);</span>
                    {'\n\n'}
                    <span className="text-green-400">
                      {`// 80 USDC → agent wallet (instant)`}
                    </span>
                    {'\n'}
                    <span className="text-green-400">
                      {`// 20 USDC → DeFi yield (4-8% APY)`}
                    </span>
                  </code>
                </pre>
                <CopyButton
                  text={`import { ClicksClient } from '@clicks-protocol/sdk';

const clicks = new ClicksClient(signer);
await clicks.quickStart('100', agentAddress);

// 80 USDC → agent wallet (instant)
// 20 USDC → DeFi yield (4-8% APY)`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
