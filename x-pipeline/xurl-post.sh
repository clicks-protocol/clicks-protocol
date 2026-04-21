#!/bin/bash
# Post next tweet from queue using xurl (which has working auth).
# Supports optional media_path per entry (MP4/GIF/PNG); uploads via xurl,
# then posts with --media-id. Legacy text-only entries still work.
#
# Rule #7 reminder: this script is the ONLY actor. Rendering and queue writes
# happen elsewhere (video-pipeline/render.ts + LLM advisor). This script
# never invokes an LLM, and never claims success without a verified ".id".

set -uo pipefail
cd "$(dirname "$0")"

QUEUE="queue.json"
if [ ! -f "$QUEUE" ]; then
  echo "Queue file not found"
  exit 1
fi

REPO_ROOT=$(cd .. && pwd)

# Parse head of queue: text + optional media_path.
read_head() {
  node -e "
  const q = JSON.parse(require('fs').readFileSync('$QUEUE','utf8'));
  if (q.length === 0) { console.log('__EMPTY__'); process.exit(0); }
  const e = q[0];
  process.stdout.write(JSON.stringify({ text: e.text, media_path: e.media_path || '' }));
  "
}

HEAD_JSON=$(read_head)
if [ "$HEAD_JSON" = "__EMPTY__" ]; then
  echo "Queue is empty"
  exit 0
fi

TEXT=$(echo "$HEAD_JSON" | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(o.text);")
MEDIA_PATH=$(echo "$HEAD_JSON" | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(o.media_path);")

MEDIA_ID=""
if [ -n "$MEDIA_PATH" ]; then
  # Resolve path relative to repo root if not absolute
  case "$MEDIA_PATH" in
    /*) ABS_PATH="$MEDIA_PATH" ;;
    *)  ABS_PATH="$REPO_ROOT/$MEDIA_PATH" ;;
  esac

  if [ ! -f "$ABS_PATH" ]; then
    echo "Media file not found: $ABS_PATH"
    exit 1
  fi

  # Basic sanity: X video cap 512MB. Reject above that.
  SIZE_BYTES=$(stat -f%z "$ABS_PATH" 2>/dev/null || stat -c%s "$ABS_PATH")
  if [ "$SIZE_BYTES" -gt 536870912 ]; then
    echo "Media too large ($SIZE_BYTES bytes > 512MB)"
    exit 1
  fi

  echo "Uploading media: $ABS_PATH ($SIZE_BYTES bytes)"
  UPLOAD_RESPONSE=$(xurl media upload "$ABS_PATH" 2>&1)
  UPLOAD_STATUS=$?
  echo "$UPLOAD_RESPONSE"

  if [ $UPLOAD_STATUS -ne 0 ]; then
    echo "Media upload failed (exit $UPLOAD_STATUS)"
    exit 1
  fi

  # Extract media id (xurl returns JSON with { data: { id: "..." } } or { media_id_string })
  MEDIA_ID=$(echo "$UPLOAD_RESPONSE" | node -e "
  let raw='';process.stdin.on('data',c=>raw+=c).on('end',()=>{
    try {
      const j=JSON.parse(raw);
      const id = (j.data && j.data.id) || j.media_id_string || j.media_id || '';
      process.stdout.write(String(id));
    } catch { process.stdout.write(''); }
  });")

  if [ -z "$MEDIA_ID" ]; then
    echo "Could not extract media_id from upload response"
    exit 1
  fi
  echo "Media uploaded: id=$MEDIA_ID"
fi

# Post
if [ -n "$MEDIA_ID" ]; then
  RESULT=$(xurl --app clicks post "$TEXT" --media-id "$MEDIA_ID" 2>&1)
else
  RESULT=$(xurl --app clicks post "$TEXT" 2>&1)
fi
echo "$RESULT"

# Verify: successful post must return an id
if echo "$RESULT" | grep -q '"id"'; then
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
