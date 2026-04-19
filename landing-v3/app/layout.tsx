import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://clicksprotocol.xyz'),
  title: 'Clicks Protocol — Autonomous Yield for AI Agents',
  description:
    "Your AI agent's USDC shouldn't sit idle. Earn 4–8% APY in one SDK call. No lockup. Built on Base.",
  alternates: {
    canonical: '/',
  },
  keywords: [
    'AI agents',
    'yield',
    'USDC',
    'DeFi',
    'Base',
    'autonomous finance',
    'agent commerce',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Clicks Protocol — Autonomous Yield for AI Agents',
    description:
      "Your AI agent's USDC shouldn't sit idle. Earn 4–8% APY in one SDK call. No lockup. Built on Base.",
    url: 'https://clicksprotocol.xyz',
    type: 'website',
    images: [
      {
        url: 'https://clicksprotocol.xyz/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clicks Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clicks Protocol — Autonomous Yield for AI Agents',
    description:
      'Autonomous yield for AI agents. One SDK call. No lockup. Built on Base.',
    images: ['https://clicksprotocol.xyz/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'apple-mobile-web-app-title': 'Clicks Protocol',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Canonical URLs are set per-page via metadata */}
        <link rel="agent" href="/.well-known/agent.json" type="application/json" />
        <link rel="llms" href="/llms.txt" type="text/plain" />
        <link rel="alternate" type="application/json" href="/.well-known/ai-plugin.json" title="ChatGPT Plugin Manifest" />
        <link rel="alternate" type="application/json" href="/.well-known/mcp.json" title="MCP Server Schema" />
        <link rel="alternate" type="application/json" href="/api/openapi.json" title="OpenAPI Specification" />
        <link
          rel="alternate"
          type="application/json"
          href="/.well-known/x402.json"
          title="x402 Discovery Document"
        />
        <link
          rel="alternate"
          type="application/json"
          href="/.well-known/clicks-protocol.json"
          title="Clicks Protocol Specification"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FinancialProduct',
              name: 'Clicks Protocol',
              description:
                'Agent Commerce Settlement Router on Base. Earn 4–8% APY on the yield portion of USDC deposits with zero lockup and a configurable 80/20 split. ERC-8004 Trustless Agent.',
              url: 'https://clicksprotocol.xyz',
              provider: {
                '@type': 'Organization',
                name: 'Clicks Protocol',
                url: 'https://clicksprotocol.xyz',
              },
              category: 'DeFi Yield Protocol',
              feesAndCommissionsSpecification:
                'No deposit/withdrawal fees. Standard Base L2 gas costs apply (~$0.01-0.05/tx).',
              interestRate: {
                '@type': 'QuantitativeValue',
                minValue: 4,
                maxValue: 8,
                unitCode: 'P1',
                description: 'APY (Annual Percentage Yield) on USDC deposits',
              },
              additionalProperty: [
                {
                  '@type': 'PropertyValue',
                  name: 'blockchain',
                  value: 'Base L2 (Coinbase)',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'supported_assets',
                  value: 'USDC',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'lockup_period',
                  value: 'none',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'liquidity_ratio',
                  value: '80% instant withdrawal',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'target_audience',
                  value: 'AI Agents',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'referral_program',
                  value: 'live — 3-level on-chain attribution (40/20/10 %)',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'erc8004_agent_id',
                  value: '45074',
                },
                {
                  '@type': 'PropertyValue',
                  name: 'ownership',
                  value: 'Gnosis Safe multisig 0xaD8228fE91Ef7f900406D3689E21BD29d5B1D6A9',
                },
              ],
            }),
          }}
        />
        {/* Organization Schema (standalone for entity recognition) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Clicks Protocol',
              url: 'https://clicksprotocol.xyz',
              logo: 'https://clicksprotocol.xyz/icon-1024.png',
              description:
                'Agent Commerce Settlement Router on Base. Autonomous USDC yield infrastructure for AI agents. ERC-8004 Trustless Agent agentId 45074.',
              sameAs: [
                'https://github.com/clicks-protocol',
                'https://x.com/ClicksProtocol',
                'https://dev.to/clicksprotocol',
                'https://clicksprotocol.medium.com',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@clicksprotocol.xyz',
                contactType: 'general',
              },
            }),
          }}
        />
        {/* FAQPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is Clicks Protocol?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Clicks Protocol is an agent commerce settlement router on Base. It splits USDC deposits 80/20 by default: 80% stays liquid for payments, 20% earns 4–8% APY (market-dependent) via Aave V3 or Morpho. Non-custodial, no lockup, withdraw anytime. Registered as ERC-8004 agentId 45074.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do I integrate Clicks Protocol?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Install the SDK with npm install @clicks-protocol/sdk, then call clicks.quickStart(amount, agentAddress). For MCP-compatible agents, use npx @clicks-protocol/mcp-server with 10 built-in tools (including clicks_explain for agent-to-agent discovery).',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What are the fees?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '2% fee on yield earned only. Never on principal. No deposit fees, no withdrawal fees. If your agent earns $100 in yield, the fee is $2.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Is Clicks Protocol safe?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: '6 contracts verified on Basescan (Registry, SplitterV4, FeeV2, YieldRouter, Referral, plus Safe multisig owner). 227/227 tests passing. Non-custodial (your keys, your funds). Immutable contracts (no proxy, no admin keys). ReentrancyGuard on all functions. MIT licensed and open source. V2 upgrade (April 2026) wired referral distribution and transferred ownership to Safe multisig 0xaD8228fE...',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can I withdraw anytime?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. No lockup periods, no vesting, no cooldown timers. Withdraw your full principal plus earned yield at any time.',
                  },
                },
              ],
            }),
          }}
        />
        {/* HowTo Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'How to add yield to your AI agent with Clicks Protocol',
              description: 'Integrate autonomous USDC yield into your AI agent in 3 steps using the Clicks Protocol SDK on Base.',
              step: [
                {
                  '@type': 'HowToStep',
                  name: 'Install the SDK',
                  text: 'Run npm install @clicks-protocol/sdk ethers@^6 in your project directory.',
                },
                {
                  '@type': 'HowToStep',
                  name: 'Initialize and QuickStart',
                  text: 'Create a ClicksClient with your signer and call clicks.quickStart(amount, agentAddress). This handles registration, USDC approval, and the 80/20 split automatically.',
                },
                {
                  '@type': 'HowToStep',
                  name: 'Monitor and withdraw',
                  text: 'Use clicks.getAgentYieldBalance(agentAddress) to check earned yield. Call clicks.withdrawYield(agentAddress) to withdraw anytime.',
                },
              ],
            }),
          }}
        />
        {/* X Pixel - Conversion Tracking */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','rbppe');
            `,
          }}
        />
        {/* Base App ID */}
        <meta name="base:app_id" content="69dfad464322f9228ea82e1b" />
      </head>
      <body className={inter.className}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-accent focus:text-accent-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
