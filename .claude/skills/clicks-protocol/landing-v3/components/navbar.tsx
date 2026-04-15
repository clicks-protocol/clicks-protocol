"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border glassmorphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
            <Link href="/">
              <img
                src="/logo.svg"
                alt="Clicks"
                className="h-8 sm:h-9 lg:h-10 w-auto"
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-center space-x-8 flex-1">
            <a
              href="#how-it-works"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              How it Works
            </a>
            <a
              href="#developers"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Developers
            </a>
          </div>
          <div className="hidden md:flex items-center justify-end space-x-6 flex-1">
            <a
              href="https://github.com/clicks-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://discord.gg/clicks-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              Discord
            </a>
            <a href="/docs">
              <Button size="sm">Get Started</Button>
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
        <div className="md:hidden border-t border-border bg-bg-primary/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              How it Works
            </a>
            <a
              href="#developers"
              onClick={() => setMobileOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              Developers
            </a>
            <a
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              About
            </a>
            <a
              href="/security"
              onClick={() => setMobileOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              Security
            </a>
            <a
              href="/docs"
              onClick={() => setMobileOpen(false)}
              className="block text-text-secondary hover:text-text-primary transition-colors py-2"
            >
              Docs
            </a>
            <div className="pt-2 border-t border-border flex items-center space-x-4">
              <a
                href="https://github.com/clicks-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/clicks-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                Discord
              </a>
            </div>
            <a href="/docs" className="block">
              <Button size="sm" className="w-full">Get Started</Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
