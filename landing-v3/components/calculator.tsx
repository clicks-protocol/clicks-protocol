"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';

export function Calculator() {
  const [amount, setAmount] = useState(10000);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = value === '' ? 0 : Math.min(parseInt(value, 10), 100000000);
    setAmount(Math.max(0, numValue));
  };

  const earning = amount * 0.2;
  const liquid = amount * 0.8;
  const dailyYield = (earning * 0.06) / 365;

  return (
    <section className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Calculate Your Yield</h2>
          <p className="text-text-secondary text-base sm:text-lg lg:text-xl">
            See how much your idle USDC could earn
          </p>
        </div>

        <div className="glassmorphism-strong rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-10 hover-glow transition-all duration-300">
          <div className="mb-10">
            <label className="text-sm text-text-secondary mb-3 block tracking-wider uppercase">
              USDC Amount
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              placeholder="10000"
              className="w-full bg-surface border border-border rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-2xl sm:text-3xl font-bold focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-text-secondary mb-3">
              <span className="text-accent">Liquid (80%)</span>
              <span className="text-secondary">Earning (20%)</span>
            </div>
            <div className="relative h-3 md:h-4 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute left-0 h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: '80%', boxShadow: '0 0 10px rgba(0, 255, 155, 0.5)' }}
              />
              <div
                className="absolute right-0 h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: '20%', boxShadow: '0 0 10px rgba(97, 162, 41, 0.5)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="!bg-surface">
              <div className="text-text-secondary text-sm mb-3 tracking-wider uppercase">
                Liquid (80%)
              </div>
              <div className="text-4xl font-bold text-text-primary mb-3">
                ${liquid.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-text-secondary text-sm">Ready for operations</div>
            </Card>
            <Card className="!bg-surface">
              <div className="text-text-secondary text-sm mb-3 tracking-wider uppercase">
                Earning (20%)
              </div>
              <div className="text-4xl font-bold text-accent mb-3">
                ${earning.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </div>
              <div className="text-text-secondary text-sm">4-8% APY via Morpho</div>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/30 rounded-2xl p-8 text-center">
            <div className="text-text-secondary text-sm mb-2 tracking-wider uppercase">
              Estimated Daily Yield (6% APY)
            </div>
            <div className="text-5xl font-bold yield-glow">
              ${dailyYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
