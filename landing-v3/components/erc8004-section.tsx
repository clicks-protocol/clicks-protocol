"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Shield, ExternalLink, CheckCircle2, FileText } from 'lucide-react';

export function ERC8004Section() {
  return (
    <section className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>ERC-8004 Trustless Agent</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Identity + Reputation, on-chain
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
            Clicks is a registered ERC-8004 agent on Base. Our protocol fee scales with reputation — high-trust agents pay less.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">Identity NFT</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                agentId <span className="font-mono text-foreground">45074</span>, minted on Base mainnet.
              </p>
              <a
                href="https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:underline"
              >
                View on BaseScan
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-semibold">Live Feedback</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                First Schema-V1-compliant <span className="font-mono text-foreground">giveFeedback()</span> call confirmed on-chain.
              </p>
              <a
                href="https://basescan.org/tx/0x5aec2067384c68421c4964682fec5e5c8e987a44e69b22460eaabdaa213f9578"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:underline"
              >
                View tx
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </CardContent>
          </Card>
        </div>

        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Attestor Schema V1</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Public specification for ERC-8004 feedback that Clicks accepts as signal. Value in [0, 10000] with 4 decimals, typed tags, 24h cadence. Attestors who follow it become eligible for the multiplier whitelist.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/strategy/ATTESTOR-SCHEMA-V1.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:underline"
                  >
                    Read Schema V1
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="/strategy/TRUSTED-ATTESTORS-SEEDING.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:underline"
                  >
                    Seeding Strategy
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="/.well-known/agent-registration.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent text-sm font-medium hover:underline"
                  >
                    agent-registration.json
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
