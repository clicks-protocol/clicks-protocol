"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText, DollarSign, TrendingUp } from 'lucide-react';
import { CopyButton } from './copy-button';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-card/30 relative fade-in-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">How it Works</h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">
            Three simple steps to autonomous yield
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="multiple" defaultValue={["step-1", "step-2", "step-3"]}>
            <AccordionItem value="step-1">
              <AccordionTrigger>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-accent text-sm font-semibold mb-1 tracking-widest uppercase">
                      Step 1
                    </div>
                    <div className="text-2xl font-bold">Register Your Agent</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-muted-foreground text-lg mb-6">
                    One line of code to get started. No complex setup.
                  </p>
                  <div className="relative">
                    <pre className="bg-background border border-border rounded-xl p-5 text-[10px] sm:text-xs lg:text-sm font-mono overflow-x-auto whitespace-pre max-w-full">
                      <code>
                        <span className="text-accent">await</span>{' '}
                        <span className="text-foreground">clicks.</span>
                        <span className="text-blue-400">register</span>
                        <span className="text-foreground">();</span>
                      </code>
                    </pre>
                    <CopyButton text="await clicks.register();" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-2">
              <AccordionTrigger>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <DollarSign className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-accent text-sm font-semibold mb-1 tracking-widest uppercase">
                      Step 2
                    </div>
                    <div className="text-2xl font-bold">Receive Payment</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-muted-foreground text-lg mb-6">
                    USDC splits automatically: 80% liquid, 20% earning.
                  </p>
                  <div className="relative">
                    <pre className="bg-background border border-border rounded-xl p-5 text-[10px] sm:text-xs lg:text-sm font-mono overflow-x-auto whitespace-pre max-w-full">
                      <code>
                        <span className="text-green-400">
                          {`// Automatic 80/20 split on receive`}
                        </span>
                        {'\n'}
                        <span className="text-foreground">autoSplit: </span>
                        <span className="text-blue-400">true</span>
                      </code>
                    </pre>
                    <CopyButton text="// Automatic 80/20 split on receive\nautoSplit: true" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="step-3">
              <AccordionTrigger>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <TrendingUp className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-accent text-sm font-semibold mb-1 tracking-widest uppercase">
                      Step 3
                    </div>
                    <div className="text-2xl font-bold">Earn Yield</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-muted-foreground text-lg mb-6">
                    20% works in DeFi earning 4-8% APY. Zero lockup.
                  </p>
                  <div className="relative">
                    <pre className="bg-background border border-border rounded-xl p-5 text-[10px] sm:text-xs lg:text-sm font-mono overflow-x-auto whitespace-pre max-w-full">
                      <code>
                        <span className="text-green-400">
                          {`// 4-8% APY, zero lockup`}
                        </span>
                        {'\n'}
                        <span className="text-foreground">yield: </span>
                        <span className="text-yellow-400">&apos;morpho&apos;</span>
                      </code>
                    </pre>
                    <CopyButton text="// 4-8% APY, zero lockup\nyield: 'morpho'" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
}
