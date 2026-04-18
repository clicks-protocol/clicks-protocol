"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, ExternalLink, BookOpen, Shield, Code, FileText, Info, Layers, Home, Rocket } from 'lucide-react';
import { Footer } from '@/components/footer';

const sidebarLinks = [
  { href: '/docs', label: 'Overview', icon: BookOpen },
  { href: '/docs/getting-started', label: 'Getting Started', icon: Rocket },
  { href: '/about', label: 'About', icon: Info },
  { href: '/#how-it-works', label: 'How it Works', icon: Layers, isAnchor: true },
  { href: '/security', label: 'Security', icon: Shield },
  { href: '/whitepaper', label: 'Whitepaper', icon: FileText },
  { href: '/docs/api', label: 'SDK Reference', icon: Code },
  { href: 'https://github.com/clicks-protocol', label: 'GitHub', icon: ExternalLink, external: true },
];

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs = [
    { label: 'Home', href: '/' },
    ...segments.map((seg, i) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 mx-1.5 opacity-50" />}
          {i === crumbs.length - 1 ? (
            <span className="text-text-primary font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-text-primary transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

function Sidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className={mobile ? '' : 'sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto'}>
      {mobile && (
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <Link href="/" className="flex items-center space-x-2" onClick={onClose}>
            <img src="/logo.svg" alt="Clicks" className="h-8 w-auto" />
          </Link>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      <div className="p-4 space-y-1">
        {!mobile && (
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all text-sm mb-3"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        )}
        <div className={!mobile ? 'border-t border-white/10 pt-3' : ''}>
          {sidebarLinks.map((link) => {
            const isActive = link.href === pathname || (link.href === '/docs' && pathname === '/docs');
            const Icon = link.icon;

            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </a>
              );
            }

            if (link.isAnchor) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen relative">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border glassmorphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors mr-2"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="Clicks" className="h-8 sm:h-9 w-auto" />
              </Link>
              <span className="text-text-secondary text-sm hidden sm:inline">/</span>
              <Link href="/docs" className="text-sm font-medium hidden sm:inline hover:text-accent transition-colors">
                Docs
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/clicks-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/clicks-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors text-sm"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-bg-primary border-r border-white/10 overflow-y-auto">
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-white/5">
          <Sidebar />
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 max-w-4xl">
          <Breadcrumbs />
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}
