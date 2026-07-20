#!/bin/bash
# Moltbook Crosspost Bot
# Posts the next tweet from queue.json to Moltbook
# Rate limit: 1 post per 2.5 minutes
# Usage: ./moltbook-crosspost.sh [tweet_index]

set -uo pipefail
cd "$(dirname "$0")/.."

QUEUE="bots/moltbook-source.json"
MOLTBOOK_KEY=$(grep MOLTBOOK_API_KEY .env 2>/dev/null | head -1 | cut -d= -f2)
SUBMOLT="agent-treasury"
API="https://www.moltbook.com/api/v1"
STATE_FILE="bots/moltbook-state.json"

if [ -z "$MOLTBOOK_KEY" ]; then
  echo "ERROR: MOLTBOOK_API_KEY not found in .env"
  exit 1
fi

# Get tweet index (default: next unposted)
INDEX="${1:-auto}"

if [ "$INDEX" = "auto" ]; then
  # Read state to find next index
  if [ -f "$STATE_FILE" ]; then
    INDEX=$(node -e "const s=JSON.parse(require('fs').readFileSync('$STATE_FILE','utf8')); console.log(s.nextIndex || 0)")
  else
    INDEX=0
  fi
fi

# Read tweet from queue
TWEET_DATA=$(node -e "
const q = JSON.parse(require('fs').readFileSync('$QUEUE','utf8'));
if ($INDEX >= q.length) { console.log('__DONE__'); process.exit(0); }
const t = q[$INDEX];
process.stdout.write(JSON.stringify({
  text: t.text,
  reply: t.reply_text || ''
}));
")

if [ "$TWEET_DATA" = "__DONE__" ]; then
  echo "Queue empty — all tweets posted to Moltbook"
  exit 0
fi

TITLE=$(echo "$TWEET_DATA" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.text.split('\n')[0].substring(0,300))")
CONTENT=$(echo "$TWEET_DATA" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
let full = d.text;
if (d.reply) full += '\n\n---\n\n' + d.reply;
full += '\n\n---\n\nFollow on X: https://x.com/ClicksProtocol';
console.log(full);
")

echo "Posting tweet #$INDEX to m/$SUBMOLT..."
echo "Title: $TITLE"

# Post to Moltbook — build body via env vars to avoid shell-quoting issues with newlines/apostrophes
BODY_FILE=$(mktemp)
SUBMOLT="$SUBMOLT" TITLE="$TITLE" CONTENT="$CONTENT" node -e "
const fs=require('fs');
fs.writeFileSync(process.argv[1], JSON.stringify({
  submolt_name: process.env.SUBMOLT,
  title: process.env.TITLE,
  content: process.env.CONTENT
}));" "$BODY_FILE"
RESPONSE=$(curl -s -X POST "$API/posts" \
  -H "Authorization: Bearer $MOLTBOOK_KEY" \
  -H "Content-Type: application/json" \
  --data-binary "@$BODY_FILE")
rm -f "$BODY_FILE"

SUCCESS=$(echo "$RESPONSE" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.success || false)")

if [ "$SUCCESS" != "true" ]; then
  echo "ERROR: Post failed"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

# Check for verification challenge
VERIFY_CODE=$(echo "$RESPONSE" | node -e "
const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
const v = d.post?.verification;
if (v) console.log(v.verification_code);
else console.log('none');
")

if [ "$VERIFY_CODE" != "none" ]; then
  echo "Solving verification challenge..."
  
  CHALLENGE=$(echo "$RESPONSE" | node -e "
  const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(d.post.verification.challenge_text);
  ")
  
  # Deobfuscate and solve the math challenge
  ANSWER=$(node -e "
  const raw = process.argv[1];
  // Remove random case, doubled letters, inserted symbols
  const clean = raw.replace(/[^a-zA-Z0-9\s.,+\-*/()]/g, '').toLowerCase();
  // Extract numbers (words to digits)
  const wordMap = {zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
    eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,
    nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,
    hundred:100,thousand:1000};
  
  // Find number words
  const words = clean.split(/\s+/);
  let nums = [];
  let current = 0;
  for (const w of words) {
    if (wordMap[w] !== undefined) {
      if (w === 'hundred') current *= 100;
      else if (w === 'thousand') current *= 1000;
      else if (current > 0 && wordMap[w] < 10) current += wordMap[w];
      else { if (current > 0) nums.push(current); current = wordMap[w]; }
    }
  }
  if (current > 0) nums.push(current);
  
  // Sum them (total force = sum of forces)
  const total = nums.reduce((a,b) => a+b, 0);
  console.log(total.toFixed(2));
  " "$CHALLENGE")
  
  echo "Answer: $ANSWER"
  
  VERIFY_RESPONSE=$(curl -s -X POST "$API/verify" \
    -H "Authorization: Bearer $MOLTBOOK_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"verification_code\":\"$VERIFY_CODE\",\"answer\":\"$ANSWER\"}")
  
  VERIFIED=$(echo "$VERIFY_RESPONSE" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.success || false)")
  
  if [ "$VERIFIED" = "true" ]; then
    echo "Verified and published!"
  else
    echo "Verification failed: $VERIFY_RESPONSE"
  fi
fi

# Update state
NEXT=$((INDEX + 1))
echo "{\"nextIndex\": $NEXT, \"lastPostedAt\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$STATE_FILE"
echo "Done. Next index: $NEXT"
