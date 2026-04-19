"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

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

function fmtTvl(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  if (n >= 1) return n.toFixed(2);
  if (n > 0) return n.toFixed(2);
  return '0';
}

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

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">{metrics.totalAgents}</div>
            <div className="text-muted-foreground text-xs sm:text-sm lg:text-base">Registered Agents</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">{fmtTvl(metrics.tvlUsdc)}</div>
            <div className="text-muted-foreground text-xs sm:text-sm lg:text-base">TVL (USDC)</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">{metrics.currentApyPct.toFixed(1)}%</div>
            <div className="text-muted-foreground text-xs sm:text-sm lg:text-base">Current APY</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">0</div>
            <div className="text-muted-foreground text-xs sm:text-sm lg:text-base">Lockup Period</div>
          </Card>
        </div>
      </div>
    </section>
  );
}
