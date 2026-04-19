import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t border-border py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Newsletter */}
        <div className="glassmorphism-strong rounded-xl sm:rounded-2xl p-5 sm:p-8 lg:p-10 mb-8 sm:mb-12 lg:mb-14 text-center max-w-2xl mx-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-3">Get the Builder Digest</h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Protocol changes, new integrations, and what we&apos;re shipping.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('email') as HTMLInputElement;
              const btn = form.querySelector('button') as HTMLButtonElement;
              const email = input?.value;
              if (!email) return;
              btn.textContent = '...';
              btn.disabled = true;
              try {
                const res = await fetch('https://clicks-subscribe.rechnung-613.workers.dev', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email }),
                });
                const data = await res.json();
                input.value = '';
                btn.textContent = '✓ Subscribed';
                setTimeout(() => { btn.textContent = 'Get Updates'; btn.disabled = false; }, 3000);
              } catch {
                btn.textContent = 'Error';
                setTimeout(() => { btn.textContent = 'Get Updates'; btn.disabled = false; }, 3000);
              }
            }}
          >
            <label htmlFor="subscribe-email" className="sr-only">Email address</label>
            <input
              id="subscribe-email"
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              aria-describedby="subscribe-help"
              className="flex-1 bg-card border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-accent transition-colors w-full"
            />
            <span id="subscribe-help" className="sr-only">
              Protocol updates and new integrations. Unsubscribe anytime.
            </span>
            <Button type="submit" size="sm" className="whitespace-nowrap w-full sm:w-auto">
              Get Updates
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10 lg:mb-12">
          <div>
            <h4 className="font-bold mb-5 text-lg">Protocol</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="/about" className="hover:text-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-foreground transition-colors"
                >
                  How it Works
                </a>
              </li>
              <li>
                <a
                  href="/security"
                  className="hover:text-foreground transition-colors"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="/whitepaper"
                  className="hover:text-foreground transition-colors"
                >
                  Whitepaper
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-lg">Developers</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="/docs" className="hover:text-foreground transition-colors">
                  Docs Overview
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/@clicks-protocol/sdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  SDK
                </a>
              </li>
              <li>
                <a
                  href="/docs/api"
                  className="hover:text-foreground transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/clicks-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-lg">Community</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a
                  href="https://discord.gg/clicks-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/ClicksProtocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  X / Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://clicksprotocol.medium.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Medium
                </a>
              </li>
              <li>
                <a
                  href="https://substack.com/@clicksprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Substack
                </a>
              </li>
              <li>
                <a
                  href="https://www.reddit.com/user/clicksprotocol/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Reddit
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@clicksprotocol.xyz"
                  className="hover:text-foreground transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-lg">Resources</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="/llms.txt" className="hover:text-foreground transition-colors">
                  llms.txt
                </a>
              </li>
              <li>
                <a
                  href="/.well-known/agent.json"
                  className="hover:text-foreground transition-colors"
                >
                  agent.json
                </a>
              </li>
              <li>
                <a
                  href="/.well-known/x402.json"
                  className="hover:text-foreground transition-colors"
                >
                  x402.json
                </a>
              </li>
              <li>
                <a
                  href="https://basescan.org/address/0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Contracts
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <img
              src="/icon.svg"
              alt="Clicks"
              className="h-8 w-8"
            />
            <span className="text-muted-foreground">© 2026 Clicks Protocol</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://x.com/ClicksProtocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://discord.gg/clicks-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="https://github.com/clicks-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://clicksprotocol.medium.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
              </svg>
            </a>
            <a
              href="https://substack.com/@clicksprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
              </svg>
            </a>
            <a
              href="https://www.reddit.com/user/clicksprotocol/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 0-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
