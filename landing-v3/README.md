# Clicks Protocol Landing Page v3

Professional enterprise landing page built with Next.js 15 and shadcn/ui component library.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Components:** shadcn/ui (Radix UI)
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Build:** Static Export (SSG)

## Features

### shadcn/ui Components

- **Tabs** → x402 Section (3 tabs: Wallets, Protocols, Economy)
- **Accordion** → How it Works (3 expandable steps)
- **Card** → Stats, Developers, Calculator
- **Button** → CTAs throughout the page

### Design

- Dark theme (#0A0A0B background, #00FF9B accent)
- Glassmorphism effects
- Gradient orbs (animated)
- Cursor glow effect
- Parallax animations
- Fade-in on scroll
- Grid background pattern
- Noise texture overlay

### SEO & Discovery

- Complete meta tags (OpenGraph, Twitter Card)
- Favicons (SVG, PNG, Apple Touch)
- Agent discovery links:
  - `/.well-known/agent.json`
  - `/llms.txt`
  - `/.well-known/x402.json`

## Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
cd out && python3 -m http.server 8891
```

## Project Structure

```
landing-v3/
├── app/
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Main page with all sections
│   └── globals.css      # Global styles + animations
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── accordion.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── tabs.tsx
│   ├── navbar.tsx
│   ├── hero.tsx
│   ├── stats.tsx
│   ├── calculator.tsx
│   ├── how-it-works.tsx
│   ├── x402-section.tsx
│   ├── developers.tsx
│   ├── footer.tsx
│   └── copy-button.tsx
├── lib/
│   └── utils.ts         # cn() helper
└── public/              # Static assets (copy from ../site/)
```

## Deployment

### Cloudflare Pages

1. **Build settings:**
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: 22

2. **Deploy:**
   ```bash
   npm run build
   # Upload `out/` folder to Cloudflare Pages
   ```

### Static Files

Copy from `../site/` to `public/`:
- `favicon.ico`
- `favicon-96x96.png`
- `favicon.svg`
- `apple-touch-icon.png`
- `site.webmanifest`
- `og-image.png`
- `.well-known/agent.json`
- `.well-known/x402.json`
- `llms.txt`

## Differences from v2

### ✅ Added

- **shadcn/ui component library** (enterprise-grade UI)
- **TypeScript** (type safety)
- **Next.js App Router** (modern architecture)
- **Static export** (zero runtime, fast loading)
- **Component-based architecture** (maintainable)

### ⚠️ Removed

- Tailwind CDN → replaced with proper build
- Inline scripts → replaced with React hooks
- Plain HTML → replaced with Next.js

### 🎨 Kept

- All animations (orbs, fade-in, cursor glow, parallax)
- Dark theme design
- All content (copy, sections, links)
- Meta tags & SEO
- Discovery links

## Development

```bash
# Watch mode
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## Production Checklist

- [ ] Copy static files from `../site/public/` to `public/`
- [ ] Update OG image path if needed
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test all links (GitHub, Discord, Docs)
- [ ] Test all animations (orbs, fade-in, parallax)
- [ ] Test yield calculator
- [ ] Test accordion (How it Works)
- [ ] Test tabs (x402 Section)
- [ ] Build and preview locally (`npm run build && cd out && python3 -m http.server 8891`)
- [ ] Deploy to Cloudflare Pages

## Performance

- Static export → no server-side rendering
- Component code-splitting → smaller bundles
- Tailwind CSS purge → minimal CSS
- No external dependencies at runtime
- First Load JS: ~127 kB (excellent for a landing page)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support (uses modern CSS features)

## License

© 2026 Clicks Protocol
