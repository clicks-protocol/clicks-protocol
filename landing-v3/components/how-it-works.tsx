"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText, DollarSign, TrendingUp } from 'lucide-react';
import { CopyButton } from './copy-button';
import { getDict, type Locale } from '@/lib/i18n';

export function HowItWorks({ locale = 'en' }: { locale?: Locale }) {
  const t = getDict(locale).howItWorks;
  return (
    <section id="how-it-works" className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-card/30 relative fade-in-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{t.headline}</h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">
            {t.sub}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible defaultValue="step-1">
            <AccordionItem value="step-1">
              <AccordionTrigger>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-accent text-sm font-semibold mb-1 tracking-widest uppercase">
                      {t.step1Label}
                    </div>
                    <div className="text-2xl font-bold">{t.step1Title}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-muted-foreground text-lg mb-6">
                    {t.step1Desc}
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
                      {t.step2Label}
                    </div>
                    <div className="text-2xl font-bold">{t.step2Title}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-muted-foreground text-lg mb-6">
                    {t.step2Desc}
                  </p>
                  <div className="relative">
                    <pre className="bg-background border border-border rounded-xl p-5 text-[10px] sm:text-xs lg:text-sm font-mono overflow-x-auto whitespace-pre max-w-full">
                      <code>
                        <span className="text-green-400">
                          {t.step2CodeComment}
                        </span>
                        {'\n'}
                        <span className="text-foreground">autoSplit: </span>
                        <span className="text-blue-400">true</span>
                      </code>
                    </pre>
                    <CopyButton text={`${t.step2CodeComment}\nautoSplit: true`} />
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
                      {t.step3Label}
                    </div>
                    <div className="text-2xl font-bold">{t.step3Title}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <p className="text-muted-foreground text-lg mb-6">
                    {t.step3Desc}
                  </p>
                  <div className="relative">
                    <pre className="bg-background border border-border rounded-xl p-5 text-[10px] sm:text-xs lg:text-sm font-mono overflow-x-auto whitespace-pre max-w-full">
                      <code>
                        <span className="text-green-400">
                          {t.step3CodeComment}
                        </span>
                        {'\n'}
                        <span className="text-foreground">yield: </span>
                        <span className="text-yellow-400">&apos;morpho&apos;</span>
                      </code>
                    </pre>
                    <CopyButton text={`${t.step3CodeComment}\nyield: 'morpho'`} />
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
