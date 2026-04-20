"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Zap, CheckCircle2, Code2 } from 'lucide-react';
import { getDict, type Locale } from '@/lib/i18n';

export function X402Section({ locale = 'en' }: { locale?: Locale }) {
  const t = getDict(locale).x402;
  return (
    <section className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-card/30 relative fade-in-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{t.headline}</h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">
            {t.sub}
          </p>
        </div>

        <Tabs defaultValue="wallets" className="max-w-4xl mx-auto">
          <TabsList className="w-full mb-6 md:mb-8">
            <TabsTrigger value="wallets">{t.tabWallets}</TabsTrigger>
            <TabsTrigger value="protocols">{t.tabProtocols}</TabsTrigger>
            <TabsTrigger value="economy">{t.tabEconomy}</TabsTrigger>
          </TabsList>

          <TabsContent value="wallets" className="space-y-4">
            <Card>
              <CardContent className="pt-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="w-7 h-7 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="mb-3">{t.walletsTitle}</CardTitle>
                    <CardDescription>
                      {t.walletsDesc}
                    </CardDescription>
                  </div>
                </div>
                <ul className="space-y-3 text-muted-foreground ml-20">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.walletsBullet1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.walletsBullet2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.walletsBullet3}</span>
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
                    <CardTitle className="mb-3">{t.protocolsTitle}</CardTitle>
                    <CardDescription>
                      {t.protocolsDesc}
                    </CardDescription>
                  </div>
                </div>
                <ul className="space-y-3 text-muted-foreground ml-20">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.protocolsBullet1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.protocolsBullet2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.protocolsBullet3}</span>
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
                    <CardTitle className="mb-3">{t.economyTitle}</CardTitle>
                    <CardDescription>
                      {t.economyDesc}
                    </CardDescription>
                  </div>
                </div>
                <ul className="space-y-3 text-muted-foreground ml-20">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.economyBullet1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.economyBullet2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span>{t.economyBullet3}</span>
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
