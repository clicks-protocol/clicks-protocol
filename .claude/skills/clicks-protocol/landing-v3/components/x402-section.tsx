"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Zap, CheckCircle2, Code2 } from 'lucide-react';

export function X402Section() {
  return (
    <section className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-surface/30 relative fade-in-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Built for the x402 Economy</h2>
          <p className="text-text-secondary text-base sm:text-lg lg:text-xl">
            Native payment infrastructure for autonomous agents
          </p>
        </div>

        <Tabs defaultValue="wallets" className="max-w-4xl mx-auto">
          <TabsList className="w-full mb-6 md:mb-8">
            <TabsTrigger value="wallets">Agentic Wallets</TabsTrigger>
            <TabsTrigger value="protocols">Supported Protocols</TabsTrigger>
            <TabsTrigger value="economy">Economy Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-4">
            <Card>
              <CardContent className="pt-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="mb-3">Base Native</CardTitle>
                    <CardDescription>
                      Built on Coinbase&apos;s L2 for instant, low-cost transactions that
                      scale with your agents.
                    </CardDescription>
                  </div>
                </div>
                <ul className="space-y-3 text-text-secondary ml-20">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>Sub-cent transaction fees</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>Instant settlement (2 seconds)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>EVM-compatible smart contracts</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-4">
            <Card>
              <CardContent className="pt-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="mb-3">x402 Compatible</CardTitle>
                    <CardDescription>
                      Standards-compliant agent payment protocol. Works with any x402
                      agent.
                    </CardDescription>
                  </div>
                </div>
                <ul className="space-y-3 text-text-secondary ml-20">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>Automatic payment routing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>Built-in yield optimization</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>Transparent fee structure</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="economy" className="space-y-4">
            <Card>
              <CardContent className="pt-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Code2 className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="mb-3">One SDK Call</CardTitle>
                    <CardDescription>
                      Simple integration, complex yield strategies handled. Focus on
                      building.
                    </CardDescription>
                  </div>
                </div>
                <ul className="space-y-3 text-text-secondary ml-20">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>TypeScript SDK with full type safety</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>Model Context Protocol (MCP) support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>Comprehensive documentation & examples</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
