#!/bin/bash
# Clicks Protocol — Launch Day Master Script
# Executes all launch steps in order.

set -e

echo "🚀 CLICKS PROTOCOL LAUNCH SEQUENCE"
echo "===================================="
echo ""

# Step 1: npm publish
echo "Step 1/5: npm publish..."
bash "$(dirname "$0")/publish.sh"

# Step 2: Git push (repo should already be public)
echo ""
echo "Step 2/5: Git push..."
cd "$(dirname "$0")/.."
git push origin main

# Step 3: Landing page should be deployed via Cloudflare
echo ""
echo "Step 3/5: Cloudflare Pages deployment..."
echo "→ Verify at: https://clicksprotocol.xyz"
echo "→ Manual: Cloudflare Pages dashboard"

# Step 4: Social media (manual posts)
echo ""
echo "Step 4/5: Social Media..."
echo "→ X Thread: content/x-posts/launch-thread.md"
echo "→ Reddit: content/reddit/ethereum-post.md"
echo "→ HN: content/hn/show-hn.md"
echo "→ LinkedIn: content/linkedin/launch-post.md"

# Step 5: Verify everything
echo ""
echo "Step 5/5: Verification..."
echo "→ npm: https://www.npmjs.com/package/@clicks-protocol/sdk"
echo "→ Site: https://clicksprotocol.xyz"
echo "→ Docs: https://clicksprotocol.xyz/docs/"
echo "→ GitHub: https://github.com/clicks-protocol"
echo ""
echo "===================================="
echo "🎉 LAUNCH COMPLETE"
