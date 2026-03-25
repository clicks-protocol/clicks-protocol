#!/usr/bin/env node
/**
 * autoresponder.js — Auto-reply to @ClicksProtocol mentions
 * 
 * Checks for new mentions and replies with contextual responses.
 * Uses OAuth 1.0a for posting (write access required).
 * 
 * Usage:
 *   node autoresponder.js              # Check & reply to new mentions
 *   node autoresponder.js --dry-run    # Check without posting replies
 *   node autoresponder.js --hours 4    # Check last 4 hours
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));
const REPLIED_FILE = join(__dirname, 'replied-mentions.json');

const BEARER = config.bearerToken;
const OAUTH = {
  consumerKey: config.consumerKey || '',
  consumerSecret: config.consumerSecret || '',
  accessToken: config.accessToken || '',
  accessTokenSecret: config.accessTokenSecret || '',
};

const USER_ID = config.userId || '2033251448105115649';

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// --- OAuth 1.0a Signature ---

function percentEncode(str) {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
}

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
  const sortedParams = Object.keys(params).sort().map(k => `${percentEncode(k)}=${percentEncode(params[k])}`).join('&');
  const baseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

function buildOAuthHeader(method, url, extraParams = {}) {
  const oauthParams = {
    oauth_consumer_key: OAUTH.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: OAUTH.accessToken,
    oauth_version: '1.0',
  };

  const allParams = { ...oauthParams, ...extraParams };
  const signature = generateOAuthSignature(method, url, allParams, OAUTH.consumerSecret, OAUTH.accessTokenSecret);
  oauthParams.oauth_signature = signature;

  const headerParts = Object.keys(oauthParams).sort().map(k => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`);
  return `OAuth ${headerParts.join(', ')}`;
}

// --- Response Templates ---

const RESPONSES = {
  question: [
    "Good question! Clicks splits your USDC 80/20: 80% stays liquid, 20% earns 4-8% APY via Aave V3 or Morpho on Base. No lockup. Docs: clicksprotocol.xyz/docs",
    "Clicks is an on-chain yield layer for AI agents. One SDK call, your idle USDC starts earning. Details: clicksprotocol.xyz",
  ],
  positive: [
    "Thanks for the shoutout! 🔥 If you're building agents on Base, check out our SDK: clicksprotocol.xyz/docs/api",
    "Appreciate the mention! We're building autonomous yield for AI agents. Jump in: clicksprotocol.xyz",
  ],
  technical: [
    "npm install @clicks-protocol/sdk\n\nThree lines to start earning yield. Full SDK reference: clicksprotocol.xyz/docs/api",
    "We also have an MCP server with 9 tools for autonomous agent integration: npx @clicks-protocol/mcp-server\n\nDocs: clicksprotocol.xyz/docs",
  ],
  general: [
    "Thanks for mentioning Clicks! We're building autonomous yield for AI agents on Base. Learn more: clicksprotocol.xyz",
    "Appreciate the mention! Clicks gives your agent's idle USDC 4-8% APY with zero lockup. Check it out: clicksprotocol.xyz",
  ],
};

function classifyMention(text) {
  const lower = text.toLowerCase();
  if (lower.includes('?') || lower.includes('how') || lower.includes('what is') || lower.includes('explain')) {
    return 'question';
  }
  if (lower.includes('great') || lower.includes('love') || lower.includes('amazing') || lower.includes('awesome') || lower.includes('cool')) {
    return 'positive';
  }
  if (lower.includes('sdk') || lower.includes('api') || lower.includes('npm') || lower.includes('install') || lower.includes('integrate') || lower.includes('code')) {
    return 'technical';
  }
  return 'general';
}

function pickResponse(category) {
  const options = RESPONSES[category];
  return options[Math.floor(Math.random() * options.length)];
}

// --- API Functions ---

function loadReplied() {
  if (!existsSync(REPLIED_FILE)) return new Set();
  return new Set(JSON.parse(readFileSync(REPLIED_FILE, 'utf-8')));
}

function saveReplied(replied) {
  const arr = [...replied];
  // Keep last 2000
  writeFileSync(REPLIED_FILE, JSON.stringify(arr.slice(-2000), null, 2));
}

async function getMentions(hours) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const params = new URLSearchParams({
    'tweet.fields': 'created_at,author_id,public_metrics,in_reply_to_user_id,conversation_id',
    'user.fields': 'username,name',
    expansions: 'author_id',
    max_results: '50',
    start_time: since,
  });

  const url = `https://api.x.com/2/users/${USER_ID}/mentions?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${BEARER}` },
  });

  if (res.status === 402) {
    log('⚠️ No API credits.');
    return { tweets: [], users: {} };
  }

  if (!res.ok) {
    log(`❌ API Error ${res.status}: ${await res.text()}`);
    return { tweets: [], users: {} };
  }

  const data = await res.json();
  const users = {};
  if (data.includes?.users) {
    for (const u of data.includes.users) {
      users[u.id] = u;
    }
  }

  return { tweets: data.data || [], users };
}

async function postReply(tweetId, text) {
  const url = 'https://api.x.com/2/tweets';
  const body = JSON.stringify({
    text,
    reply: { in_reply_to_tweet_id: tweetId },
  });

  const authHeader = buildOAuthHeader('POST', url);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Reply failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const hoursIdx = args.indexOf('--hours');
  const hours = hoursIdx !== -1 ? parseInt(args[hoursIdx + 1]) || 2 : 2;
  const dryRun = args.includes('--dry-run');

  log(`Checking mentions from last ${hours}h... ${dryRun ? '(DRY RUN)' : ''}`);

  const { tweets, users } = await getMentions(hours);
  const replied = loadReplied();

  let newCount = 0;
  let replyCount = 0;

  for (const tweet of tweets) {
    if (replied.has(tweet.id)) continue;
    newCount++;

    const author = users[tweet.author_id];
    const username = author ? `@${author.username}` : 'unknown';
    const category = classifyMention(tweet.text);
    const response = pickResponse(category);

    log(`\nNew mention from ${username} (${category}):`);
    log(`  "${tweet.text.substring(0, 120)}..."`);
    log(`  Reply: "${response.substring(0, 80)}..."`);

    if (!dryRun) {
      try {
        const result = await postReply(tweet.id, response);
        log(`  ✅ Replied: https://x.com/ClicksProtocol/status/${result.data?.id}`);
        replyCount++;
        // Rate limit: wait 5s between replies
        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        log(`  ❌ Failed: ${err.message}`);
      }
    } else {
      log('  (dry run, not posting)');
    }

    replied.add(tweet.id);
  }

  saveReplied(replied);
  log(`\nDone. ${newCount} new mentions, ${replyCount} replies sent.`);
}

main().catch(err => {
  log(`❌ Error: ${err.message}`);
  process.exit(1);
});
