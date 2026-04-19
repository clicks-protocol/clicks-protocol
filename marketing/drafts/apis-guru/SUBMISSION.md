# APIs.guru Submission — Clicks Protocol

**Status:** Draft ready · external PR requires user action
**Target repo:** [APIs-guru/openapi-directory](https://github.com/APIs-guru/openapi-directory)

## What this is

The Clicks Protocol OpenAPI spec augmented with APIs.guru's required
`x-*` metadata, packaged so it lands cleanly at the correct path in
their directory tree.

## File to submit

`openapi.json` in this folder. The augmentations on top of our live
`https://clicksprotocol.xyz/api/openapi.json`:

| Field | Value |
|-------|-------|
| `info.x-apisguru-categories` | `["blockchain", "financial"]` |
| `info.x-origin[0]` | `{ format: openapi, version: 3.1.0, url: https://clicksprotocol.xyz/api/openapi.json }` |
| `info.x-providerName` | `clicksprotocol.xyz` |
| `info.x-logo` | `{ url: https://clicksprotocol.xyz/icon-1024.png, backgroundColor: #0A0A0B }` |
| `info.contact.*` | Clicks Protocol / hello@clicksprotocol.xyz |
| `info.license` | MIT with link to our LICENSE |
| `info.termsOfService` | `https://clicksprotocol.xyz/security` |

## Submission Steps

Three steps. Only step 3 needs the browser; steps 1-2 are command-line.

### 1. Fork the repo

On `github.com/APIs-guru/openapi-directory` click **Fork** into the
`clicks-protocol` (or your personal) org.

### 2. Clone + add the file locally

```bash
# somewhere outside this repo
git clone git@github.com:<your-user>/openapi-directory.git
cd openapi-directory
mkdir -p APIs/clicksprotocol.xyz/1.0.0
cp /Users/davidbairaktaridis/.openclaw/workspace/projects/clicks-protocol/marketing/drafts/apis-guru/openapi.json \
   APIs/clicksprotocol.xyz/1.0.0/openapi.json

# Smoke test per their contributing guide
npm install  # first time only
npm test     # validates spec shape

git checkout -b add-clicksprotocol
git add APIs/clicksprotocol.xyz/1.0.0/openapi.json
git commit -m "Add clicksprotocol.xyz 1.0.0"
git push -u origin add-clicksprotocol
```

### 3. Open PR

On the fork's GitHub page, open a PR against `APIs-guru/openapi-directory:main` with this body:

```
Adds Clicks Protocol API 1.0.0.

**About:** Clicks Protocol is an Agent Commerce Settlement Router on Base —
autonomous USDC yield infrastructure for AI agents. ERC-8004 Trustless
Agent (agentId 45074).

- Live spec: https://clicksprotocol.xyz/api/openapi.json
- Landing:   https://clicksprotocol.xyz
- GitHub:    https://github.com/clicks-protocol
- Contact:   hello@clicksprotocol.xyz

Metadata added per CONTRIBUTING.md: x-apisguru-categories, x-origin,
x-providerName, x-logo, contact, license (MIT), termsOfService.

Licensed MIT.
```

## Maintenance

APIs.guru auto-refreshes from `x-origin.url` so once merged, our
weekly updates to `clicksprotocol.xyz/api/openapi.json` flow through
automatically. No re-submission needed for spec iterations.

## If they reject

Check their review comments for:
- Spec validation (OpenAPI 3.1 strict mode) — we use 3.1.0, they
  historically preferred 3.0.x; downgrade if asked.
- `x-providerName` needs to be a verifiable domain. `clicksprotocol.xyz`
  is owned by us — no issue.
- Logo must be https, 512×512 min. Our `/icon-1024.png` covers both.

## Links

- APIs.guru index: https://apis.guru/
- APIs-guru contributing: https://github.com/APIs-guru/openapi-directory/blob/main/CONTRIBUTING.md
- Our live spec: https://clicksprotocol.xyz/api/openapi.json
