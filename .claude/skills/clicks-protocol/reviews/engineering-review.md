# Engineering Review - Clicks Protocol Website
Date: 2026-03-18
Reviewer: Engineering Review Agent

## Summary
- Overall Score: 6/10
- Critical Issues: 3
- Major Issues: 8
- Minor Issues: 11
- Suggestions: 7

Solid visual design, decent component structure. But the codebase has real problems: the entire homepage is unnecessarily a client component, accessibility is poor, the mobile nav doesn't work, the newsletter form is non-functional, SEO is actively sabotaged by noindex, and the calculator has no input validation. For a DeFi protocol website that needs to build trust, these gaps matter.

---

## Critical Issues (Must Fix)

1. **Entire homepage is "use client" with raw DOM manipulation** — The `app/page.tsx` uses `useEffect` with `document.createElement`, `document.querySelectorAll`, direct DOM manipulation for cursor glow, parallax, intersection observer, and smooth scroll. This is a React anti-pattern. It defeats SSR/SSG, bloats the client bundle, and creates potential memory leaks. — **Fix:** Extract cursor glow into a tiny standalone `<CursorGlow />` client component. Use CSS `scroll-behavior: smooth` instead of JS. Use a proper React intersection observer hook (`useIntersectionObserver`) or library. Make the page itself a server component that composes small client islands.

2. **Mobile hamburger menu does nothing** — `navbar.tsx` has a `<button className="md:hidden"><Menu /></button>` with no `onClick` handler, no state, no mobile menu panel. On mobile, the only navigation is the logo. Users cannot reach How it Works, Developers, GitHub, Discord, or Get Started. — **Fix:** Add mobile menu state and a slide-out/dropdown menu panel, similar to how the docs layout already implements mobile sidebar.

3. **Newsletter form is completely non-functional** — `footer.tsx` has an email input and Subscribe button inside a `<form>` with no `action`, no `onSubmit`, no API integration. Clicking Subscribe does nothing (or reloads the page on static export). This is worse than not having a form: it makes the product look broken. — **Fix:** Either integrate with a real service (Mailchimp, ConvertKit, Resend) or remove the form entirely until it works. A form that does nothing damages credibility.

---

## Major Issues (Should Fix)

1. **`robots: 'noindex, nofollow'` in layout.tsx metadata** — The site actively tells search engines not to index it. If this is intentional (pre-launch), fine, but it's sitting in production code with no comment or TODO. If someone deploys this and forgets, the site is invisible to Google. — **Fix:** Add a clear comment `// TODO: Remove before launch` or gate it behind an environment variable.

2. **No sitemap.xml or robots.txt** — No `public/sitemap.xml`, no `public/robots.txt`, no Next.js `app/sitemap.ts` or `app/robots.ts`. Combined with noindex, the SEO story is completely absent. — **Fix:** Add `app/sitemap.ts` generating all 7 routes. Add `app/robots.ts` or `public/robots.txt`.

3. **CodeBlock component duplicated across pages** — `about/page.tsx` and `docs/api/page.tsx` both define their own local `CodeBlock` component with identical implementations. — **Fix:** Extract to `components/code-block.tsx` and import.

4. **Calculator accepts 0 and shows $0.00 daily yield with no guidance** — Entering 0 or clearing the input shows all zeros. No minimum amount, no message, no hint. Negative values are prevented by the regex but the UX for edge cases is bare. Also, the calculator hardcodes 6% APY for daily yield but the protocol advertises "4-8%". — **Fix:** Add minimum amount validation (e.g. show a message below $10). Add a note explaining the 6% assumption. Consider a slider for APY range.

5. **Footer links use `<a href>` instead of Next.js `<Link>` for internal routes** — Footer has `<a href="/about">`, `<a href="/security">`, `<a href="/docs">`, `<a href="/docs/api">`, `<a href="/whitepaper">`. These cause full page reloads instead of client-side navigation. — **Fix:** Import and use `next/link` for all internal routes.

6. **Canonical URL is hardcoded only for homepage** — `layout.tsx` has `<link rel="canonical" href="https://clicksprotocol.xyz" />` in the root layout `<head>`. This means every page (/about, /security, /docs, /docs/api) all have the homepage as their canonical URL. This is an SEO disaster: Google sees all pages as duplicates of the homepage. — **Fix:** Remove the hardcoded canonical from root layout. Add per-page metadata with correct canonical URLs, or use a dynamic canonical based on pathname.

7. **Docs layout has its own complete navbar, duplicating root navbar logic** — The docs layout builds its own full `<nav>` with logo, links, GitHub/Discord. The main navbar component is not reused. If nav items change, two places need updating. — **Fix:** Extract shared nav elements or reuse `<Navbar />` with a variant prop.

8. **No error boundaries** — Zero error boundaries anywhere. If the Calculator, CopyButton (clipboard API), or any client component throws, the entire page crashes with a white screen. — **Fix:** Add at least a root `error.tsx` and optionally per-section error boundaries for interactive components.

---

## Minor Issues (Nice to Fix)

1. **Copyright says "© 2025"** — It's 2026. — **Fix:** Update to 2026 or use `new Date().getFullYear()`.

2. **`<img>` tags used instead of `next/image`** — `navbar.tsx`, `hero.tsx`, `docs/layout.tsx`, `footer.tsx` all use `<img src="/logo.svg">`. While `next/image` with `unoptimized: true` in static export doesn't add optimization, using `<Image>` is still better practice for future-proofing and provides lazy loading, width/height enforcement. — **Fix:** Use `next/image` with explicit width/height.

3. **CopyButton uses `navigator.clipboard` without try/catch** — `navigator.clipboard.writeText()` can fail (insecure context, permissions denied). The `async` function has no error handling. — **Fix:** Wrap in try/catch, show error state if clipboard fails.

4. **Parallax effect runs on every mousemove with no throttle** — The parallax handler in `page.tsx` fires on every pixel of mouse movement, querying the DOM for `.parallax` elements each time. — **Fix:** Use `requestAnimationFrame` throttling or CSS `will-change: transform` with a throttled handler.

5. **Smooth scroll handler uses non-null assertion** — `this.getAttribute('href')!` in the smooth scroll code. If `href` is somehow null, this crashes. — **Fix:** Add a null check.

6. **Multiple `"use client"` directives on pages that don't need interactivity** — `about/page.tsx` and `security/page.tsx` are marked `"use client"` but contain zero hooks, no state, no effects. The only client-side thing is `CopyButton` which is already its own client component. — **Fix:** Remove `"use client"` from pages that are purely presentational. Let the client components be client boundaries on their own.

7. **Tailwind content paths include `./pages/**`** — The project uses App Router exclusively. There is no `pages/` directory. Dead config. — **Fix:** Remove `'./pages/**/*.{js,ts,jsx,tsx,mdx}'` from tailwind config content array.

8. **CSS has unused animation classes** — `icon-float` and `logo-pulse` are defined in globals.css but not used anywhere in the codebase. — **Fix:** Remove dead CSS.

9. **`dangerouslySetInnerHTML` for JSON-LD** — While the JSON is constructed from static data (safe), this pattern is flagged in security reviews. — **Fix:** Acceptable for now. Consider using `next/script` with `type="application/ld+json"` or a metadata approach in future Next.js versions.

10. **Hero "Get Started" and "View Documentation" buttons have no `href`/`onClick`** — They render as `<Button>` components but don't link anywhere. They're dead buttons. — **Fix:** Wrap in `<Link>` or add `onClick` handlers.

11. **Inconsistent external link security** — Most external links correctly use `target="_blank" rel="noopener noreferrer"`. But the docs sidebar anchor links (`isAnchor: true`) and some footer internal links don't consistently follow the pattern. The footer social SVG links are correct. — **Fix:** Audit all `<a>` tags with `target="_blank"` to ensure `rel="noopener noreferrer"` is present.

---

## Suggestions (Improvements)

1. **Add `loading.tsx` for docs routes** — The docs layout is complex with sidebar state. A loading skeleton would improve perceived performance during navigation.

2. **Extract integration logos into a data array** — Hero section has hardcoded colored circles for Base, Morpho, USDC, Coinbase. Use real logos/SVGs and map over a data array.

3. **Add `not-found.tsx`** — No custom 404 page exists. Users hitting wrong URLs get the default Next.js 404.

4. **Consider reducing Radix UI dependencies** — Tabs and Accordion from Radix are pulled in for relatively simple UI. For a static marketing site, native HTML `<details>` or CSS-only tabs would reduce bundle size.

5. **Add prefers-reduced-motion media query** — The cursor glow, parallax, floating orbs, and fade-in animations don't respect `prefers-reduced-motion`. Users who have motion sensitivity settings enabled still get all animations.

6. **Whitepaper route mentioned but no page.tsx found** — The sidebar and footer link to `/whitepaper` but no `app/whitepaper/page.tsx` was provided for review. Either it exists and wasn't listed, or it's a dead link.

7. **Consider RSC for data-heavy docs pages** — The API reference and security pages are pure content. Making them server components would reduce client JS significantly.

---

## Architecture Assessment

**Structure: Acceptable but not optimal.**
- App Router is used correctly with nested layouts (root + docs).
- Component split is reasonable: page-level sections (hero, stats, calculator, etc.) + shared UI (button, card, tabs, accordion).
- The `components/ui/` folder follows shadcn/ui conventions.

**Problems:**
- Homepage is one giant client component. Should be a server component composing client islands.
- CodeBlock is duplicated in two page files instead of being a shared component.
- Docs layout reinvents the navbar instead of reusing/extending the main one.
- No shared layout wrapper for non-docs pages (about, security share no common structure like header/footer, they're rendered inside docs layout based on sidebar links, but this isn't obvious from the file structure).
- No `lib/` or `utils/` directory visible (beyond what shadcn provides). Constants like contract addresses are inline in components.

**Recommendation:** Extract contract addresses, link arrays, and navigation items into `lib/constants.ts`. Move CodeBlock to shared components. Convert homepage to server component with client islands.

---

## Performance Assessment

**Bundle Size: 127 KB first load is acceptable** for a marketing site with client-side interactivity. But it could be lower.

**Identified bloat:**
- The entire homepage being a client component means React hydrates the full page tree.
- Parallax effect with per-mousemove DOM queries is wasteful.
- `lucide-react` is tree-shakeable, but importing icons across many files can add up. Currently seems fine.
- CSS animations (orbs, cursor glow) use `position: fixed` with blur filters, which can cause GPU compositing overhead on lower-end devices.
- No image optimization possible with static export + `unoptimized: true`, but SVGs and PNGs in `/public` appear appropriately sized.

**What's good:**
- Static export means no server runtime, pure CDN delivery.
- Tailwind CSS with purging keeps CSS small.
- Google Fonts (Inter) loaded via `next/font` which is optimal.

**Recommendation:** Converting homepage to server component with client islands would reduce hydration cost by ~60-70%.

---

## Security Assessment

**No critical security issues found.** This is a static marketing site, so the attack surface is minimal.

**Checked:**
- ✅ No secrets in frontend code.
- ✅ External links mostly use `rel="noopener noreferrer"`.
- ✅ No user-generated content rendered unsafely.
- ✅ `dangerouslySetInnerHTML` only used for static JSON-LD (acceptable).
- ✅ No API keys, private keys, or sensitive data in source.
- ✅ Contract addresses are public by nature (on-chain data).

**Missing:**
- ❌ No Content Security Policy headers configured. Cloudflare Workers deployment could add CSP headers.
- ❌ No `X-Frame-Options` or `X-Content-Type-Options` headers.
- ❌ Newsletter form has no CSRF protection (moot since it doesn't work, but relevant when it does).
- ❌ CopyButton doesn't validate/sanitize text input (low risk since all copy text is hardcoded).

**Recommendation:** Add security headers via Cloudflare Workers `_headers` file or worker configuration.

---

## Accessibility Assessment

**Poor. Significant gaps.**

1. **No skip-to-content link** — Keyboard users must tab through the entire navbar to reach content.
2. **Mobile menu button has no `aria-label`** — Both in navbar.tsx (`<button className="md:hidden">`) and docs layout.
3. **Calculator input has no `aria-label` or associated `<label>`** — The label text exists but is a `<label>` without `htmlFor` and the input has no `id`.
4. **No `aria-live` regions** — The calculator results update dynamically but screen readers aren't notified.
5. **CopyButton has no `aria-label`** — Screen readers just see a generic button.
6. **Color contrast concerns** — `text-text-secondary` (#71717A) on `bg-bg-primary` (#0A0A0B) gives ~4.2:1 ratio. Passes AA for normal text but fails AAA. For small text (text-xs, text-sm used extensively), this is borderline.
7. **Accordion triggers don't indicate expanded state to AT** — Radix Accordion should handle this, but custom trigger content may interfere.
8. **Interactive elements in Hero section** — The "Integrates with" logos have `hover:opacity-100` but aren't keyboard focusable or interactive, which is fine, but the opacity change on hover suggests interactivity that isn't there.
9. **Footer social icons have no `aria-label`** — SVG icons with no text alternative.

**Recommendation:** Do an `axe-core` or Lighthouse accessibility audit. Fix labels, add skip-to-content, add aria-labels on all icon-only buttons and links.

---

## Mobile/Responsive Assessment

**Approach: Mostly mobile-first with Tailwind breakpoints (sm, md, lg).**

**What works:**
- Text sizing scales well across breakpoints.
- Grid layouts collapse to single column on mobile.
- Code blocks have `overflow-x-auto` for horizontal scrolling.
- Calculator input uses `inputMode="numeric"` for mobile keyboards.
- Fade-in animations are disabled on mobile (< 768px), which is smart.

**What's broken:**
- **Main navbar has NO mobile menu.** This is the critical issue. On mobile, users see a hamburger icon that does nothing.
- Docs layout mobile sidebar works correctly (good).
- Touch targets: Most interactive elements (buttons, links) are adequately sized. The CopyButton (p-2 with w-3/h-3 icons on mobile) is borderline at ~32x32px. Should be 44x44px minimum.
- Hero code block font size at `text-[10px]` on mobile is very small and hard to read.

**Recommendation:** Fix mobile nav (critical). Increase CopyButton touch target. Consider bumping minimum font size in code blocks to 12px.

---

## SEO Assessment

**Actively harmful in current state.**

1. **`robots: 'noindex, nofollow'`** — No page will be indexed. This overrides everything else.
2. **Hardcoded canonical to homepage on all pages** — Even if indexing were enabled, Google would treat all pages as duplicates.
3. **No sitemap.xml** — No way for crawlers to discover pages.
4. **No robots.txt** — No crawl instructions.
5. **No per-page meta descriptions** — About, Security, Docs/API pages use the root layout metadata. Every page has the same title and description.
6. **No per-page Open Graph tags** — Same OG image and description for all routes.

**What's good (when SEO is enabled):**
- ✅ Structured data (JSON-LD FinancialProduct) is well-formed.
- ✅ OG image is specified with correct dimensions.
- ✅ Twitter card configured.
- ✅ `lang="en"` on html tag.
- ✅ Agent discovery files (agent.json, llms.txt, x402.json) are nice touches for AI/agent discoverability.
- ✅ Web manifest present.

**Recommendation:** Before launch: remove noindex, fix canonical URLs, add per-page metadata, add sitemap.ts, add robots.ts. The foundation is there but it's all disabled.
