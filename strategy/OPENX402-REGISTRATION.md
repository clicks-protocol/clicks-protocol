# OpenX402 Facilitator Registration — Plan

**Status:** Draft 2026-04-25 · No external action without David go.
**Goal:** Register Clicks (and/or our agent identities) with the OpenX402 facilitator at <https://openx402.ai> so that Conway Automatons and other x402-native agents can discover Clicks endpoints permissionlessly.

---

## What we know (verified)

- **Site:** <https://openx402.ai> — Next.js app, hosted on Railway, Cloudflare-fronted.
- **Tagline (verbatim from page metadata):** *"OpenX402 - Permissionless x402 Facilitator. The first permissionless x402 facilitator that any AI or developer can use to build x402 servers, without a login. Supports Base, Solana, and Monad."*
- **Operator handle:** [@openx402](https://x.com/openx402) (Twitter creator meta tag).
- **Operator org:** Conway-Research (web4.ai bundle references `openx402.ai/register` and `openx402.ai/whitelist/<addr>` as their facilitator endpoints).
- **API surface confirmed:**
  - `POST https://openx402.ai/api/register` — returns JSON. Unknown body schema returns `{"error":"Missing required fields"}` (HTTP 500). CORS allows `GET, POST, OPTIONS` from any origin.
  - The web4.ai demo flow shows the spec we have access to: `POST /register` with `{"address": "0x..."}` returning `{"whitelisted": true}` — but the demo path differs (`/register` vs `/api/register`) and our probes show the demo body alone is insufficient. Either (a) more fields needed, (b) signed proof-of-ownership required, (c) demo is illustrative not literal.

## What we don't know

- **Exact required fields** for registration. Probable candidates: signed message proving wallet ownership, service URL, supported chains, supported scheme. The site offers no public API docs we can find.
- **Whether registration is fully permissionless** or gated by some kind of allowlist/manual review.
- **Cost** (if any) — registration could itself be x402-paywalled.
- **What "whitelisted" means** in the response — facilitator-eligible? Service-discoverable? Both?

## Why we don't probe further

Repeatedly POSTing payload variants against an undocumented external API to reverse-engineer the spec is API-scouting behavior. It's also low-yield: even if we guessed correctly, we'd be relying on undocumented behavior that could break. The scalable path is to ask Conway directly.

## Action plan (3 phases)

### Phase 1 — Public-evidence-only readiness (today, no external action)

Deliverables (this PR):
- This document
- [`scripts/openx402-register.ts`](../scripts/openx402-register.ts) — stub script with dry-run-only flow. Posts a configurable JSON body to `POST /api/register` after `--execute` flag. Default: dry-run prints curl-equivalent that David can audit before sending.
- Skill doc reference (already in [`integrations/conway-research-skills/clicks-protocol/SKILL.md`](../integrations/conway-research-skills/clicks-protocol/SKILL.md)) mentions x402 as a venue tag — discoverability via Schema V1 attestations works regardless of openx402 facilitator listing.

### Phase 2 — Get the spec from Conway directly

Channel options, in order of cost:

1. **Public X reply or DM** to [@openx402](https://x.com/openx402) and [@ConwayResearch](https://x.com/ConwayResearch) asking for the registration spec. Friendly, no overhead.
2. **GitHub Discussion** on `Conway-Research/automaton` (4301 ⭐, active) — open thread "OpenX402 facilitator registration spec".
3. **Email** to `root@conway.tech` (per web4.ai footer) — slower but direct.

Optimal: combine 1+3. Public X tweet establishes interest (signals adoption); email gets the spec.

Suggested message:

> Hi — interested in registering Clicks Protocol (settlement router on Base, ERC-8004 agentId 45074) on the OpenX402 facilitator. Tried `POST /api/register` but the body schema isn't documented. Could you point me at the registration spec, or open a public docs page? Happy to write up the integration once I know the wire format. Source: <https://github.com/clicks-protocol/clicks-protocol>.

### Phase 3 — Register once spec is known (David go required)

Once Conway answers:

1. Update `scripts/openx402-register.ts` with the correct body schema.
2. David reviews the planned POST body (including any signed-message field).
3. Run with `--execute`.
4. Verify response, persist `whitelisted` status to `STATUS.md`.

## Decision: which entity to register?

Three candidates, in priority:

| Entity | Pros | Cons |
|--------|------|------|
| **ClicksRegistry contract** `0x23bb…0a3` | Most stable identity, owned by Safe, would never rotate | Contract addresses don't sign; if facilitator requires sig, this won't work |
| **Operator Wallet** `0xf873…b80` | Can sign messages, already widely-published as Clicks Operator | Single key — rotation risk; Hard Rule #1 forbids it as attestor (different role though) |
| **A new dedicated x402-facilitator-signer wallet** | Isolation: no risk to other roles | Adds an address to track + fund |

**Recommendation:** create a new key dedicated to facilitator interactions if the API requires signatures. Otherwise register the contract address directly.

**Hard Rule reminder:** Operator Wallet is forbidden as attestor (Rule #1). Facilitator registration is NOT attestation — different concept — but using a separate signer is cleaner segregation regardless.

## Out of scope (for this PR)

- Building x402-paywalled endpoints on Clicks side (separate task — would be `clicks-x402-server`)
- Listing on facilitators other than OpenX402 (e.g. Coinbase's facilitator, if/when they publish one)
- Auto-discovery: making Clicks endpoints findable from a facilitator query (depends on what `whitelisted: true` actually grants)

## References

- OpenX402 site: <https://openx402.ai>
- Conway-Research org: <https://github.com/Conway-Research>
- web4.ai (the marketing site that references the facilitator): <https://web4.ai>
- x402 spec: <https://github.com/coinbase/x402>
- Clicks Skill for Conway: [`integrations/conway-research-skills/clicks-protocol/SKILL.md`](../integrations/conway-research-skills/clicks-protocol/SKILL.md)
