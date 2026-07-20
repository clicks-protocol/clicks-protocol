/**
 * English (canonical) — all user-facing UI strings for the landing.
 *
 * Keep flat-ish structure by component. Non-localized tokens (contract
 * addresses, numbers, brand names) stay inline in the component.
 */

const en = {
  meta: {
    title: 'Clicks Protocol — Agent Commerce Settlement Router',
    description:
      'Settlement routing for AI agents on Base. Route revenue, split payouts, produce receipts, and keep treasury policy programmable.',
  },
  nav: {
    howItWorks: 'How it Works',
    developers: 'Developers',
    github: 'GitHub',
    discord: 'Discord',
    ctaInstallSdk: 'Install SDK',
    about: 'About',
    security: 'Security',
    docs: 'Docs',
  },
  hero: {
    badge: 'Built for agent revenue settlement',
    headline: 'Agent Commerce Settlement\u00A0Router',
    subhead:
      'Route incoming USDC into liquid working capital, yield routing, attribution, and audit-ready receipts. One SDK call. Built on\u00A0Base.',
    ctaPrimary: 'Start Settling Revenue',
    ctaSecondary: 'Read the Docs',
    integratesWith: 'Integrates with',
    codeCaption: 'Live in 3 lines',
    codeCommentLiquid: '// 80 USDC → agent wallet (instant)',
    codeCommentYield: '// 20 USDC → treasury yield route',
  },
  stats: {
    baseMainnet: 'Base Mainnet',
    baseMainnetSub: 'Sub-cent fees · 2s settlement',
    erc8004: 'ERC-8004 Verified',
    erc8004Sub: 'agentId 45074',
    apyLabel: 'Current APY',
    apySubTemplate: '{apy}% on yield portion',
    zeroLockup: 'Zero Lockup',
    zeroLockupSub: 'Withdraw anytime',
  },
  howItWorks: {
    headline: 'How it Works',
    sub: 'Three simple steps to autonomous yield',
    step1Label: 'Step 1',
    step1Title: 'Register Your Agent',
    step1Desc: 'One line. No config. No keys to manage.',
    step2Label: 'Step 2',
    step2Title: 'Receive Payment',
    step2Desc: 'Every payment auto-splits — liquid for ops, yield on the rest.',
    step2CodeComment: '// Automatic 80/20 split on receive',
    step3Label: 'Step 3',
    step3Title: 'Earn Yield',
    step3Desc: 'Earning starts instantly. Pull funds any time.',
    step3CodeComment: '// Variable yield route, zero lockup',
  },
  x402: {
    headline: 'Built for x402 Revenue Settlement',
    sub: 'Post-payment treasury routing for autonomous agents',
    tabWallets: 'Agentic Wallets',
    tabProtocols: 'Settlement Layer',
    tabEconomy: 'Economy Benefits',
    walletsTitle: 'Base Native',
    walletsDesc:
      "Built on Coinbase's L2 for instant, low-cost transactions that scale with your agents.",
    walletsBullet1: 'Sub-cent transaction fees',
    walletsBullet2: 'Instant settlement (2 seconds)',
    walletsBullet3: 'EVM-compatible smart contracts',
    protocolsTitle: 'After x402 Payment',
    protocolsDesc:
      'x402 handles authorization and payment. Clicks routes USDC after receipt.',
    protocolsBullet1: 'Post-payment settlement routing',
    protocolsBullet2: 'Programmable treasury policy',
    protocolsBullet3: 'Receipt-ready accounting',
    economyTitle: 'One SDK Call',
    economyDesc:
      'Simple integration, complex yield strategies handled. Focus on building.',
    economyBullet1: 'TypeScript SDK with full type safety',
    economyBullet2: 'Model Context Protocol (MCP) support',
    economyBullet3: 'Comprehensive documentation & examples',
  },
  erc8004: {
    badge: 'ERC-8004 Trustless Agent',
    headline: 'Identity + Reputation, on-chain',
    sub: 'Clicks is a registered ERC-8004 agent on Base. Our protocol fee scales with reputation — high-trust agents pay less.',
    identityTitle: 'Identity NFT',
    identityDescBefore: 'agentId ',
    identityDescAfter: ', minted on Base mainnet.',
    viewBaseScan: 'View on BaseScan',
    feedbackTitle: 'Live Feedback',
    feedbackDescBefore: 'First Schema-V1-compliant ',
    feedbackDescAfter: ' call confirmed on-chain.',
    viewTx: 'View tx',
    schemaTitle: 'Attestor Schema V1',
    schemaDesc:
      'Public specification for ERC-8004 feedback that Clicks accepts as signal. Value in [0, 10000] with 4 decimals, typed tags, 24h cadence. Attestors who follow it become eligible for the multiplier whitelist.',
    readSchema: 'Read Schema V1',
    seedingStrategy: 'Seeding Strategy',
    agentRegistration: 'agent-registration.json',
  },
  worksWith: {
    headline: 'Works With',
    sub: 'Connect any MCP-compatible client in seconds',
  },
  footer: {
    newsletterHeadline: 'Get the Builder Digest',
    newsletterSub: "Protocol changes, new integrations, and what we're shipping.",
    emailPlaceholder: 'your@email.com',
    emailLabel: 'Email address',
    emailHelp: 'Protocol updates and new integrations. Unsubscribe anytime.',
    subscribeCta: 'Get Updates',
    subscribeSuccess: '✓ Subscribed',
    subscribeError: 'Error',
  },
  langSwitcher: {
    label: 'Language',
  },
};

export default en;
