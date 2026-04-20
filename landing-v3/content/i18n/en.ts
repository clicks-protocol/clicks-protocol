/**
 * English (canonical) — all user-facing UI strings for the landing.
 *
 * Keep flat-ish structure by component. Non-localized tokens (contract
 * addresses, numbers, brand names) stay inline in the component.
 */

const en = {
  meta: {
    title: 'Clicks Protocol — Autonomous Yield for AI Agents',
    description:
      "Your AI agent's USDC shouldn't sit idle. Earn 4–8% APY in one SDK call. No lockup. Built on Base.",
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
    badge: 'Built for x402 Economy',
    headline: 'Autonomous Yield for AI\u00A0Agents',
    subhead:
      "Your AI agent's USDC shouldn't sit idle. Earn 4\u20138% APY in one SDK call. No\u00A0lockup. Built on\u00A0Base.",
    ctaPrimary: 'Start Earning Yield',
    ctaSecondary: 'Read the Docs',
    integratesWith: 'Integrates with',
    codeCaption: 'Live in 3 lines',
    codeCommentLiquid: '// 80 USDC → agent wallet (instant)',
    codeCommentYield: '// 20 USDC → DeFi yield (4-8% APY)',
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
    step3CodeComment: '// 4-8% APY, zero lockup',
  },
  x402: {
    headline: 'Built for the x402 Economy',
    sub: 'Native payment infrastructure for autonomous agents',
    tabWallets: 'Agentic Wallets',
    tabProtocols: 'Supported Protocols',
    tabEconomy: 'Economy Benefits',
    walletsTitle: 'Base Native',
    walletsDesc:
      "Built on Coinbase's L2 for instant, low-cost transactions that scale with your agents.",
    walletsBullet1: 'Sub-cent transaction fees',
    walletsBullet2: 'Instant settlement (2 seconds)',
    walletsBullet3: 'EVM-compatible smart contracts',
    protocolsTitle: 'x402 Compatible',
    protocolsDesc:
      'Standards-compliant agent payment protocol. Works with any x402 agent.',
    protocolsBullet1: 'Automatic payment routing',
    protocolsBullet2: 'Built-in yield optimization',
    protocolsBullet3: 'Transparent fee structure',
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
