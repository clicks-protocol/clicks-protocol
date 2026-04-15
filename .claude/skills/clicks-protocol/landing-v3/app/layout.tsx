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
        {/* X (Twitter) Pixel - deferred to not block rendering */}
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','rbppe');
`,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
