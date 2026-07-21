#!/bin/bash
# Post next tweet from queue using xurl (which has working auth).
# Supports optional media_path per entry (MP4/GIF/PNG); uploads via xurl,
# then posts with --media-id. Legacy text-only entries still work.
# Supports optional reply_text: posts a follow-up reply (e.g. link) to the
# main tweet immediately after posting. Algo-optimized: links in reply,
# not in main post (preserves dwell time on the main tweet).
#
# Rule #7 reminder: this script is the ONLY actor. Rendering and queue writes
# happen elsewhere (video-pipeline/render.ts + LLM advisor). This script
# never invokes an LLM, and never claims success without a verified ".id".

set -uo pipefail
cd "$(dirname "$0")"

# launchd does not inherit the interactive shell's Homebrew paths. Keep this
# script self-contained so scheduled posts can find node and xurl after upgrades.
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"

QUEUE="queue.json"
LOCK_DIR=".xurl-post.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another xurl-post run is already active; exiting."
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT

if [ ! -f "$QUEUE" ]; then
  echo "Queue file not found"
  exit 1
fi

REPO_ROOT=$(cd .. && pwd)

# Parse head of queue: text + optional media_path + optional reply_text.
read_head() {
  node -e "
  const q = JSON.parse(require('fs').readFileSync('$QUEUE','utf8'));
  if (q.length === 0) { console.log('__EMPTY__'); process.exit(0); }
  const e = q[0];
  process.stdout.write(JSON.stringify({ text: e.text, media_path: e.media_path || '', reply_text: e.reply_text || '' }));
  "
}

HEAD_JSON=$(read_head)
if [ "$HEAD_JSON" = "__EMPTY__" ]; then
  echo "Queue is empty"
  exit 0
fi

TEXT=$(echo "$HEAD_JSON" | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(o.text);")
MEDIA_PATH=$(echo "$HEAD_JSON" | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(o.media_path);")
REPLY_TEXT=$(echo "$HEAD_JSON" | node -e "const o=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(o.reply_text);")

shift_queue_if_head_matches() {
  node - "$QUEUE" "$HEAD_JSON" <<'NODE'
const fs = require('fs');
const [queuePath, headJson] = process.argv.slice(2);
const expected = JSON.parse(headJson);
let q = JSON.parse(fs.readFileSync(queuePath, 'utf8'));

if (q.length === 0) {
  console.log('Queue already empty');
  process.exit(0);
}

const head = q[0];
if (
  head.text !== expected.text ||
  (head.media_path || '') !== (expected.media_path || '') ||
  (head.reply_text || '') !== (expected.reply_text || '')
) {
  console.error('Queue head changed while posting; refusing to shift');
  process.exit(1);
}

q.shift();
fs.writeFileSync(queuePath, JSON.stringify(q, null, 2));
console.log('Remaining in queue:', q.length);
NODE
}


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
  UPLOAD_RESPONSE=""
  UPLOAD_STATUS=1
  for ATTEMPT in 1 2 3 4 5; do
    echo "Media upload attempt $ATTEMPT/5"
    UPLOAD_RESPONSE=$(xurl --app clicks --auth oauth1 media upload "$ABS_PATH" 2>&1)
    UPLOAD_STATUS=$?
    echo "$UPLOAD_RESPONSE"
    if [ $UPLOAD_STATUS -eq 0 ]; then
      break
    fi
    if [ "$ATTEMPT" -lt 5 ]; then
      SLEEP_SECONDS=$((ATTEMPT * ATTEMPT * 15))
      echo "Media upload failed; retrying in ${SLEEP_SECONDS}s"
      sleep "$SLEEP_SECONDS"
    fi
  done

  if [ $UPLOAD_STATUS -ne 0 ]; then
    echo "Media upload failed (exit $UPLOAD_STATUS)"
    exit 1
  fi

  # Extract media id. xurl often prints a coloured status line alongside
  # the JSON blob, so strip ANSI codes and grab the outermost {...} block.
  MEDIA_ID=$(echo "$UPLOAD_RESPONSE" | node -e "
  let raw='';process.stdin.on('data',c=>raw+=c).on('end',()=>{
    try {
      const clean = raw.replace(/\x1b\[[0-9;]*m/g, '');
      const m = clean.match(/\{[\s\S]*\}/);
      if (!m) { process.stdout.write(''); return; }
      const j = JSON.parse(m[0]);
      const id = (j.data && j.data.id) || j.media_id_string || j.media_id || '';
      process.stdout.write(String(id));
    } catch { process.stdout.write(''); }
  });")

  if [ -z "$MEDIA_ID" ]; then
    echo "Could not extract media_id from upload response"
    exit 1
  fi
  echo "Media uploaded: id=$MEDIA_ID"

  # Video uploads return state=pending. X rejects posts referencing
  # a still-processing media. xurl has a native --wait flag that
  # blocks until the upload completes (or fails).
  case "$ABS_PATH" in
    *.mp4|*.mov|*.m4v|*.webm)
      echo "Waiting for media processing..."
      if ! xurl media status --wait "$MEDIA_ID" > /dev/null 2>&1; then
        echo "Media processing did not succeed (status --wait failed)"
        exit 1
      fi
      echo "Media ready."
      ;;
  esac
fi

# Post
if [ -n "$MEDIA_ID" ]; then
  RESULT=$(xurl --app clicks --auth oauth1 post "$TEXT" --media-id "$MEDIA_ID" 2>&1)
else
  RESULT=$(xurl --app clicks --auth oauth1 post "$TEXT" 2>&1)
fi
echo "$RESULT"

# Verify: successful post must return an id
if echo "$RESULT" | grep -q '"id"'; then
  # Extract posted tweet ID for reply
  POST_ID=$(echo "$RESULT" | node -e "
  let raw='';process.stdin.on('data',c=>raw+=c).on('end',()=>{
    try {
      const clean = raw.replace(/\x1b\[[0-9;]*m/g, '');
      const m = clean.match(/\{[\s\S]*\}/);
      if (!m) { process.stdout.write(''); return; }
      const j = JSON.parse(m[0]);
      const id = (j.data && j.data.id) || j.id || '';
      process.stdout.write(String(id));
    } catch { process.stdout.write(''); }
  });")

  # The main tweet is live. Remove it from the queue before any follow-up
  # action, so a reply/network failure cannot repost the same main tweet.
  if ! shift_queue_if_head_matches; then
    echo "Main tweet posted but queue shift failed; manual inspection required"
    exit 1
  fi

  # Post follow-up reply if reply_text is set
  if [ -n "$REPLY_TEXT" ] && [ -n "$POST_ID" ]; then
    echo "Posting reply to $POST_ID..."
    sleep 2  # Brief pause to avoid rate limiting
    REPLY_RESULT=$(xurl --app clicks --auth oauth1 reply "$POST_ID" "$REPLY_TEXT" 2>&1)
    echo "$REPLY_RESULT"
    if echo "$REPLY_RESULT" | grep -q '"id"'; then
      echo "Reply posted successfully."
    else
      echo "Warning: Reply failed (main tweet was posted successfully)"
    fi
  fi
else
  echo "Failed to post"
  exit 1
fi
