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
