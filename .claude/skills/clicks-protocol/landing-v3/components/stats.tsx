'use client';

import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface Metrics {
  totalAgents: number;
  tvlUsdc: number;
  currentApyPct: number;
  activeProtocol: string;
}

const FALLBACK: Metrics = {
  totalAgents: 0,
  tvlUsdc: 0,
  currentApyPct: 8,
  activeProtocol: 'morpho',
};

export function Stats() {
  const [metrics, setMetrics] = useState<Metrics>(FALLBACK);

  useEffect(() => {
    fetch('https://api.clicksprotocol.xyz/api/public/metrics')
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .catch(() => {});
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">
              {metrics.totalAgents}
            </div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">Agents Registered</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">
              {metrics.currentApyPct.toFixed(1)}%
            </div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">
              APY ({metrics.activeProtocol === 'morpho' ? 'Morpho' : 'Aave V3'})
            </div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">
              ${metrics.tvlUsdc < 1000 ? metrics.tvlUsdc.toFixed(2) : (metrics.tvlUsdc / 1000).toFixed(1) + 'k'}
            </div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">TVL (USDC)</div>
          </Card>
          <Card className="text-center p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent mb-2 sm:mb-3">0</div>
            <div className="text-text-secondary text-xs sm:text-sm lg:text-base">Lockup Period</div>
          </Card>
        </div>
      </div>
    </section>
  );
}
