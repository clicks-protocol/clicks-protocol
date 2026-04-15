import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Clicks Protocol — Autonomous Yield for AI Agents',
  description:
    'Your agent holds USDC. Make it earn 4-8% APY while it sits idle. One SDK call. No lockup. Built on Base.',
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
      'Your agent holds USDC. Make it earn 4-8% APY while it sits idle. One SDK call. No lockup. Built on Base.',
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
                'Autonomous yield protocol for AI agents. Earn 4-8% APY on idle USDC with zero lockup on Base L2.',
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
                  value: 'planned for V1.1',
                },
              ],
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
                    text: 'Clicks Protocol is an autonomous yield protocol for AI agents on Base. It splits USDC deposits 80/20: 80% stays liquid for payments, 20% earns 7-13% APY via Morpho. Non-custodial, no lockup, withdraw anytime.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How do I integrate Clicks Protocol?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Install the SDK with npm install @clicks-protocol/sdk, then call clicks.quickStart(amount, agentAddress). For MCP-compatible agents, use npx @clicks-protocol/mcp-server with 9 built-in tools.',
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
                    text: '5 contracts verified on Basescan. 58/58 tests passing. Non-custodial (your keys, your funds). Immutable contracts (no proxy, no admin keys). ReentrancyGuard on all functions. MIT licensed and open source.',
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
