"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // X Pixel: Track SDK install copy as Lead conversion
    if (typeof window !== 'undefined' && (window as any).twq && text.includes('@clicks-protocol/sdk')) {
      (window as any).twq('event', 'tw-rbppe-137mgq', {});
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
      aria-live="polite"
      className="absolute top-2 right-2 bg-white/10 border border-white/20 hover:border-accent/40 text-muted-foreground hover:text-foreground p-2 rounded-md transition-all z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {copied ? <Check className="w-3 h-3 md:w-4 md:h-4 text-accent" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
    </button>
  );
}
