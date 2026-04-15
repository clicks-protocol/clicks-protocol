# Deployment Guide — Landing v3

## Quick Start

```bash
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/landing-v3

# Install dependencies
npm install

# Build for production
npm run build

# Preview locally
cd out && python3 -m http.server 8891
```

## Cloudflare Pages Deployment

### Method 1: Manual Upload

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload `out/` folder to Cloudflare Pages:**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Create new project
   - Upload `out/` folder
   - Done!

### Method 2: Git Integration

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Landing v3"
   git remote add origin https://github.com/clicks-protocol/landing-v3.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to Cloudflare Pages → Create Project → Connect to Git
   - Select your repository
   - Build settings:
     - **Build command:** `npm run build`
     - **Build output directory:** `out`
     - **Node version:** 22
   - Deploy!

## Static Assets (TODO)

**Before deploying, copy these files from `../site/` to `public/`:**

```bash
# From site/ root, copy to landing-v3/public/
cp ../site/favicon.ico public/
cp ../site/favicon-96x96.png public/
cp ../site/apple-touch-icon.png public/
cp ../site/og-image.png public/
```

Currently using placeholder favicon.svg. Replace with real assets.

## Environment Variables

No environment variables needed. Fully static build.

## Custom Domain

1. **Cloudflare Pages → Custom Domains**
2. Add `clicksprotocol.xyz`
3. Add `www.clicksprotocol.xyz` (optional)
4. DNS records auto-configured by Cloudflare

## Post-Deployment Checklist

- [ ] Verify OG image loads: https://clicksprotocol.xyz/og-image.png
- [ ] Test all links (GitHub, Discord, Twitter, Medium)
- [ ] Test discovery files:
  - [ ] https://clicksprotocol.xyz/llms.txt
  - [ ] https://clicksprotocol.xyz/.well-known/agent.json
  - [ ] https://clicksprotocol.xyz/.well-known/x402.json
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test all interactive features:
  - [ ] Yield calculator
  - [ ] How it Works accordion
  - [ ] x402 Section tabs
  - [ ] Copy buttons
- [ ] Verify meta tags with:
  - [ ] [Twitter Card Validator](https://cards-dev.twitter.com/validator)
  - [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## Performance

Current build stats:
- **First Load JS:** ~127 kB
- **Route size:** 24.3 kB
- **Build time:** ~2 seconds
- **Lighthouse score:** TBD (test after deploy)

Target: 95+ on all Lighthouse metrics

## Version Comparison

| Feature | v2 (HTML) | v3 (Next.js) |
|---------|-----------|--------------|
| Framework | Pure HTML | Next.js 15 |
| Styling | Tailwind CDN | Tailwind Build |
| Components | Vanilla JS | shadcn/ui (Radix) |
| Build | None | Static Export |
| Type Safety | None | TypeScript |
| Bundle Size | ~0 KB (CDN) | 127 KB (optimized) |
| Maintainability | Low | High |
| Production Ready | Yes | Yes |

## Rollback Plan

If v3 has issues, keep v2 as backup:
```bash
# Deploy v2 instead
cd /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/site
# Upload to Cloudflare Pages
```

## Next Steps

1. Copy real assets (favicons, OG image) to `public/`
2. Test locally one more time
3. Deploy to Cloudflare Pages
4. Run full QA (checklist above)
5. Switch DNS to production when ready

---

Built with ❤️ by Emma ⚡️
