"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { LangSwitcher } from '@/components/lang-switcher';
import { getDict, type Locale, LOCALES } from '@/lib/i18n';

export function Navbar({ locale = 'en' }: { locale?: Locale }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = getDict(locale).nav;
  const home = LOCALES.find((l) => l.code === locale)?.path ?? '/';

  return (
    <nav aria-label="Primary" className="fixed top-0 w-full z-50 border-b border-border glassmorphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
            <Link href={home}>
              <Image
                src="/logo.svg"
                alt="Clicks Protocol"
                width={160}
                height={40}
                priority
                className="h-8 sm:h-9 lg:h-10 w-auto"
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-center space-x-8 flex-1">
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.howItWorks}
            </a>
            <a
              href="#developers"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.developers}
            </a>
          </div>
          <div className="hidden md:flex items-center justify-end space-x-5 flex-1">
            <LangSwitcher current={locale} />
            <a
              href="https://github.com/clicks-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.github}
            </a>
            <a
              href="https://discord.gg/clicks-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.discord}
            </a>
            <a href="/docs/getting-started">
              <Button size="sm">{t.ctaInstallSdk}</Button>
            </a>
          </div>
          <button
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {t.howItWorks}
            </a>
            <a
              href="#developers"
              onClick={() => setMobileOpen(false)}
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {t.developers}
            </a>
            <a
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {t.about}
            </a>
            <a
              href="/security"
              onClick={() => setMobileOpen(false)}
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {t.security}
            </a>
            <a
              href="/docs"
              onClick={() => setMobileOpen(false)}
              className="block text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {t.docs}
            </a>
            <div className="pt-2 border-t border-border">
              <LangSwitcher current={locale} />
            </div>
            <div className="pt-2 border-t border-border flex items-center space-x-4">
              <a
                href="https://github.com/clicks-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.github}
              </a>
              <a
                href="https://discord.gg/clicks-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.discord}
              </a>
            </div>
            <a href="/docs/getting-started" className="block">
              <Button size="sm" className="w-full">{t.ctaInstallSdk}</Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
