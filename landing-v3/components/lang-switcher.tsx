"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { LOCALES, type Locale } from '@/lib/i18n';

export function LangSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const active = LOCALES.find((l) => l.code === current) ?? LOCALES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm px-1 py-1"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span>{active.label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-36 rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50"
        >
          {LOCALES.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === current}>
              <Link
                href={l.path}
                onClick={() => setOpen(false)}
                lang={l.htmlLang}
                className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  l.code === current
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                <span>{l.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
