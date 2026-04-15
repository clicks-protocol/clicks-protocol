#!/bin/bash
# Post next tweet from queue using xurl (which has working auth)
cd "$(dirname "$0")"

QUEUE="queue.json"
if [ ! -f "$QUEUE" ]; then
  echo "Queue file not found"
  exit 1
fi

# Get next tweet text
TEXT=$(node -e "
const q = JSON.parse(require('fs').readFileSync('$QUEUE','utf8'));
if (q.length === 0) { console.log('EMPTY'); process.exit(0); }
console.log(q[0].text);
")

if [ "$TEXT" = "EMPTY" ]; then
  echo "Queue is empty"
  exit 0
fi

# Post via xurl
RESULT=$(xurl --app clicks post "$TEXT" 2>&1)
echo "$RESULT"

# Check if successful
if echo "$RESULT" | grep -q '"id"'; then
  # Remove from queue
  node -e "
  const fs = require('fs');
  let q = JSON.parse(fs.readFileSync('$QUEUE','utf8'));
  q.shift();
  fs.writeFileSync('$QUEUE', JSON.stringify(q, null, 2));
  console.log('Remaining in queue:', q.length);
  "
else
  echo "Failed to post"
  exit 1
fi
