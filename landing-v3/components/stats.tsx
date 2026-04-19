"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Shield, TrendingUp, Unlock, Zap } from 'lucide-react';

interface PublicMetrics {
  totalAgents: number;
  tvlUsdc: number;
  currentApyPct: number;
}

const DEFAULTS: PublicMetrics = {
  totalAgents: 1,
  tvlUsdc: 0,
  currentApyPct: 6,
};

export function Stats() {
  const [metrics, setMetrics] = useState<PublicMetrics>(DEFAULTS);

  useEffect(() => {
    fetch('https://api.clicksprotocol.xyz/api/public/metrics')
      .then((r) => r.json())
      .then((data: PublicMetrics) => {
        if (data && typeof data.totalAgents === 'number') {
          setMetrics(data);
        }
      })
      .catch(() => {});
  }, []);

  const signals = [
    {
      icon: Zap,
      label: 'Base Mainnet',
      sub: 'Sub-cent fees · 2s settlement',
      href: undefined as string | undefined,
    },
    {
      icon: Shield,
      label: 'ERC-8004 Verified',
      sub: 'agentId 45074',
      href: 'https://basescan.org/token/0x8004A169FB4a3325136EB29fA0ceB6D2e539a432?a=45074',
    },
    {
      icon: TrendingUp,
      label: 'Current APY',
      sub: `${metrics.currentApyPct.toFixed(1)}% on yield portion`,
      href: undefined,
    },
    {
      icon: Unlock,
      label: 'Zero Lockup',
      sub: 'Withdraw anytime',
      href: undefined,
    },
  ];

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {signals.map(({ icon: Icon, label, sub, href }) => {
            const content = (
              <Card className="text-center p-4 sm:p-6 flex flex-col items-center gap-2 h-full">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <div className="text-base sm:text-lg font-semibold text-foreground">{label}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{sub}</div>
              </Card>
            );
            return href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg"
              >
                {content}
              </a>
            ) : (
              <div key={label}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
