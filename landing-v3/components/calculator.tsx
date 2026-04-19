"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_BASE = 'https://api.clicksprotocol.xyz';
const FALLBACK_APY = 6;
const PERIODS = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '3Y', days: 1095 },
];

interface SimResult {
  split: { liquid: number; toYield: number };
  projection: {
    dailyYield: number;
    totalYield: number;
    protocolFee: number;
    netYield: number;
    totalReturn: number;
    effectiveApyPct: number;
  };
  protocol: { activeProtocol: string; currentApyPct: number };
}

function localFallback(amount: number, days: number, yieldPct: number): SimResult {
  const toYield = amount * (yieldPct / 100);
  const liquid = amount - toYield;
  const dailyYield = toYield * (FALLBACK_APY / 100 / 365);
  const totalYield = dailyYield * days;
  const protocolFee = totalYield * 0.02;
  const netYield = totalYield - protocolFee;
  const totalReturn = liquid + toYield + netYield;
  const effectiveApyPct = amount > 0 && days > 0 ? (netYield / amount) * (365 / days) * 100 : 0;
  return {
    split: { liquid, toYield },
    projection: { dailyYield, totalYield, protocolFee, netYield, totalReturn, effectiveApyPct },
    protocol: { activeProtocol: 'morpho', currentApyPct: FALLBACK_APY },
  };
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function Calculator() {
  const [amount, setAmount] = useState(10000);
  const [days, setDays] = useState(365);
  const [yieldPct, setYieldPct] = useState(20);
  const [result, setResult] = useState<SimResult>(() => localFallback(10000, 365, 20));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSim = useCallback(async (a: number, d: number, y: number) => {
    if (a < 1 || a > 100000000) {
      setResult(localFallback(a, d, y));
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/public/simulate?amount=${a}&days=${d}&yieldPct=${y}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(localFallback(a, d, y));
    }
  }, []);

  useEffect(() => {
    fetchSim(amount, days, yieldPct);
  }, [days, yieldPct, fetchSim]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = value === '' ? 0 : Math.min(parseInt(value, 10), 100000000);
    const clamped = Math.max(0, numValue);
    setAmount(clamped);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSim(clamped, days, yieldPct), 300);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setYieldPct(val);
  };

  const liquidPct = 100 - yieldPct;
  const { split, projection, protocol } = result;

  return (
    <section className="py-8 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8 relative fade-in-section">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Treasury Lab</h2>
          <p className="text-muted-foreground text-base sm:text-lg lg:text-xl">
            See what $10K of idle USDC could earn
          </p>
        </div>

        <div className="glassmorphism-strong rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-10 hover-glow transition-all duration-300">
          {/* Amount Input */}
          <div className="mb-8">
            <label htmlFor="usdc-amount" className="text-sm text-muted-foreground mb-3 block tracking-wider uppercase">
              USDC Amount
            </label>
            <input
              id="usdc-amount"
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              placeholder="10000"
              className="w-full bg-card border border-border rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-2xl sm:text-3xl font-bold focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Period Buttons */}
          <div className="mb-8">
            <label className="text-sm text-muted-foreground mb-3 block tracking-wider uppercase">
              Period
            </label>
            <div className="flex gap-2 flex-wrap">
              {PERIODS.map((p) => (
                <Button
                  key={p.days}
                  variant="toggle"
                  size="sm"
                  data-state={days === p.days ? 'on' : 'off'}
                  onClick={() => setDays(p.days)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Yield Split Slider */}
          <div className="mb-8">
            <label htmlFor="yield-split-slider" className="text-sm text-muted-foreground mb-3 block tracking-wider uppercase">
              Yield Split
            </label>
            <div className="flex items-center gap-4">
              <input
                id="yield-split-slider"
                type="range"
                min={5}
                max={50}
                step={5}
                value={yieldPct}
                onChange={handleSliderChange}
                aria-label="Yield Split Percentage"
                aria-valuemin={5}
                aria-valuemax={50}
                aria-valuenow={yieldPct}
                aria-valuetext={`${yieldPct} percent earning, ${100 - yieldPct} percent liquid`}
                className="flex-1 accent-accent"
              />
              <span className="text-lg font-bold tabular-nums min-w-[48px] text-right" aria-hidden="true">{yieldPct}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-muted-foreground mb-3">
              <span className="text-accent">Liquid ({liquidPct}%)</span>
              <span className="text-muted-foreground">Earning ({yieldPct}%)</span>
            </div>
            <div className="relative h-3 md:h-4 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute left-0 h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${liquidPct}%`, boxShadow: '0 0 10px rgba(0, 255, 155, 0.5)' }}
              />
              <div
                className="absolute right-0 h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${yieldPct}%`, boxShadow: '0 0 10px rgba(97, 162, 41, 0.5)' }}
              />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <Card className="!bg-card">
              <div className="text-muted-foreground text-sm mb-3 tracking-wider uppercase">Liquid</div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                ${fmtNum(split.liquid)}
              </div>
            </Card>
            <Card className="!bg-card">
              <div className="text-muted-foreground text-sm mb-3 tracking-wider uppercase">To Yield</div>
              <div className="text-3xl sm:text-4xl font-bold text-foreground">
                ${fmtNum(split.toYield)}
              </div>
            </Card>
            <Card className="!bg-card">
              <div className="text-muted-foreground text-sm mb-3 tracking-wider uppercase">Net Earnings</div>
              <div className="text-3xl sm:text-4xl font-bold text-accent">
                ${fmtNum(projection.netYield)}
              </div>
            </Card>
          </div>

          {/* Detail Row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
            <span>Total Return: <span className="font-semibold text-foreground tabular-nums">${fmtNum(projection.totalReturn)} USDC</span></span>
            <span>Effective APY: <span className="font-semibold text-foreground tabular-nums">{projection.effectiveApyPct.toFixed(2)}%</span></span>
            <span>Protocol Fee: <span className="font-semibold text-foreground tabular-nums">${fmtNum(projection.protocolFee)} USDC</span> (2% on yield)</span>
          </div>

          {/* Footer */}
          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <div>Based on current {protocol.activeProtocol} APY: {protocol.currentApyPct.toFixed(2)}%</div>
            <div>
              Effective APY is blended across liquid + yield portion. The yield portion itself earns the full {protocol.currentApyPct.toFixed(2)}% — adjust the Yield Split slider up to 50% to allocate more.
            </div>
            <div>APY varies with market. This is a simulator, not financial advice.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
