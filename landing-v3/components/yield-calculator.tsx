'use client';

import React, { useState, useEffect } from 'react';

interface YieldCalculatorProps {
  className?: string;
}

const YieldCalculator: React.FC<YieldCalculatorProps> = ({ className }) => {
  const [usdcAmount, setUsdcAmount] = useState<number>(10000);
  const [timePeriod, setTimePeriod] = useState<'1m' | '3m' | '6m' | '1y'>('1y');
  const [apy, setApy] = useState<number>(10);
  const [isCustomApy, setIsCustomApy] = useState<boolean>(false);

  // Calculate values
  const liquidAmount = usdcAmount * 0.8;
  const yieldAmount = usdcAmount * 0.2;
  
  // Time factor for APY calculation
  const timeFactors = {
    '1m': 1/12,
    '3m': 3/12,
    '6m': 6/12,
    '1y': 1
  };
  
  const timeFactor = timeFactors[timePeriod];
  const estimatedYield = yieldAmount * (apy / 100) * timeFactor;
  const protocolFee = estimatedYield * 0.02;
  const netYield = estimatedYield - protocolFee;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Handle APY slider change
  const handleApyChange = (value: number) => {
    setApy(value);
    setIsCustomApy(true);
  };

  // Reset to default APY
  const resetApy = () => {
    setApy(10);
    setIsCustomApy(false);
  };

  return (
    <div className={`bg-gradient-to-br from-[#0F0814]/80 to-[#2F0C48]/80 backdrop-blur-xl border border-[#00FF9B]/20 rounded-2xl p-6 shadow-2xl ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Yield Calculator</h2>
        <p className="text-gray-300">See how much your AI agents could earn with idle USDC</p>
      </div>

      {/* USDC Amount Input */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-white font-medium">USDC Amount</label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="100"
              max="100000"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(Math.min(100000, Math.max(100, Number(e.target.value))))}
              className="w-32 bg-[#191020] border border-[#00FF9B]/30 rounded-lg px-3 py-1.5 text-white text-right focus:outline-none focus:ring-2 focus:ring-[#00FF9B]/50"
            />
            <span className="text-gray-300">USDC</span>
          </div>
        </div>
        <input
          type="range"
          min="100"
          max="100000"
          step="100"
          value={usdcAmount}
          onChange={(e) => setUsdcAmount(Number(e.target.value))}
          className="w-full h-2 bg-[#191020] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00FF9B] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
        />
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>100 USDC</span>
          <span>100,000 USDC</span>
        </div>
      </div>

      {/* Time Period Selector */}
      <div className="mb-8">
        <label className="text-white font-medium block mb-3">Time Period</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: '1m', label: '1 Month' },
            { value: '3m', label: '3 Months' },
            { value: '6m', label: '6 Months' },
            { value: '1y', label: '1 Year' }
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setTimePeriod(period.value as any)}
              className={`py-2.5 rounded-lg transition-all ${timePeriod === period.value
                ? 'bg-[#00FF9B] text-[#0F0814] font-semibold'
                : 'bg-[#191020] text-gray-300 hover:bg-[#2F0C48]'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* APY Selector */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <label className="text-white font-medium">APY Range (7-13%)</label>
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-bold ${isCustomApy ? 'text-[#00FF9B]' : 'text-white'}`}>
              {formatPercent(apy)}
            </span>
            {isCustomApy && (
              <button
                onClick={resetApy}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Reset to 10%
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min="7"
            max="13"
            step="0.1"
            value={apy}
            onChange={(e) => handleApyChange(Number(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#00FF9B]"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>7%</span>
            <span>10%</span>
            <span>13%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4 mb-8">
        <div className="bg-[#191020]/50 rounded-xl p-4 border border-[#00FF9B]/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Liquid Amount (80%)</span>
            <span className="text-xl font-bold text-white">{formatCurrency(liquidAmount)}</span>
          </div>
          <div className="text-sm text-gray-400">
            Available instantly for agent payments
          </div>
        </div>

        <div className="bg-[#191020]/50 rounded-xl p-4 border border-[#00FF9B]/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Yield Amount (20%)</span>
            <span className="text-xl font-bold text-white">{formatCurrency(yieldAmount)}</span>
          </div>
          <div className="text-sm text-gray-400">
            Earning yield in Morpho/Aave V3
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#00FF9B]/10 to-[#00FF9B]/5 rounded-xl p-4 border border-[#00FF9B]/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Estimated Earnings</span>
            <span className="text-2xl font-bold text-[#00FF9B]">{formatCurrency(netYield)}</span>
          </div>
          <div className="text-sm text-gray-400">
            After {timePeriod === '1m' ? '1 month' : timePeriod === '3m' ? '3 months' : timePeriod === '6m' ? '6 months' : '1 year'} at {formatPercent(apy)} APY
          </div>
        </div>

        <div className="bg-[#191020]/50 rounded-xl p-4 border border-[#00FF9B]/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Protocol Fee (2% on yield only)</span>
            <span className="text-lg font-bold text-white">{formatCurrency(protocolFee)}</span>
          </div>
          <div className="text-sm text-gray-400">
            Never on principal, only on earned yield
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#0F0814] rounded-xl p-4 border border-[#00FF9B]/30">
        <div className="text-center mb-3">
          <div className="text-sm text-gray-400 mb-1">Total after {timePeriod === '1m' ? '1 month' : timePeriod === '3m' ? '3 months' : timePeriod === '6m' ? '6 months' : '1 year'}</div>
          <div className="text-3xl font-bold text-white">
            {formatCurrency(usdcAmount + netYield)}
          </div>
        </div>
        <div className="text-center text-sm text-gray-400">
          {formatCurrency(usdcAmount)} initial + {formatCurrency(netYield)} yield
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <button className="bg-gradient-to-r from-[#00FF9B] to-[#00CC7A] text-[#0F0814] font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity w-full">
          Get Started with Clicks Protocol
        </button>
        <p className="text-gray-400 text-sm mt-3">
          Non-custodial • No lockup • x402 compatible • Base Mainnet
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>APY range 7-13% based on current Morpho/Aave V3 rates. Calculations are estimates. Protocol fee is 2% on yield only, never on principal.</p>
      </div>
    </div>
  );
};

export default YieldCalculator;