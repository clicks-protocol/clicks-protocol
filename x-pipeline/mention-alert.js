#!/usr/bin/env node
/**
 * mention-alert.js — Mention Check + Telegram Alert
 * 
 * Checks for new @ClicksProtocol mentions and sends Telegram notification.
 * Designed to run as OpenClaw cron job.
 * 
 * Usage:
 *   node mention-alert.js              # Check last 2h, alert via Telegram
 *   node mention-alert.js --hours 24   # Check last 24h
 *   node mention-alert.js --dry-run    # Check without sending Telegram
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));
const SEEN_FILE = join(__dirname, 'seen-mentions.json');

const BEARER = config.bearerToken;
const QUERY = '(@ClicksProtocol OR "clicks protocol" OR url:clicksprotocol.xyz) -from:ClicksProtocol -is:retweet';

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function loadSeen() {
  if (!existsSync(SEEN_FILE)) return new Set();
  const data = JSON.parse(readFileSync(SEEN_FILE, 'utf-8'));
  if (!Array.isArray(data)) return new Set();
  return new Set(data);
}

function saveSeen(seen) {
  writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2));
}

async function searchMentions(hours) {
  const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();
  const params = new URLSearchParams({
    query: QUERY,
    'tweet.fields': 'created_at,author_id,public_metrics',
    'user.fields': 'username,name',
    expansions: 'author_id',
    max_results: '100',
    start_time: since,
  });

  const url = `https://api.x.com/2/tweets/search/recent?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${BEARER}` },
  });

  if (res.status === 402) {
    log('⚠️ No API credits. Purchase credits at console.x.com');
    return { tweets: [], users: {} };
  }

  if (!res.ok) {
    const text = await res.text();
    log(`❌ API Error ${res.status}: ${text}`);
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

function formatTweet(tweet, users) {
  const author = users[tweet.author_id];
  const username = author ? `@${author.username}` : 'unknown';
  const name = author ? author.name : 'Unknown';
  const url = `https://x.com/${author?.username || 'i'}/status/${tweet.id}`;
  const metrics = tweet.public_metrics || {};
  
  return {
    id: tweet.id,
    text: tweet.text,
    author: username,
    name,
    url,
    likes: metrics.like_count || 0,
    retweets: metrics.retweet_count || 0,
    replies: metrics.reply_count || 0,
    created: tweet.created_at,
  };
}

function buildTelegramMessage(mentions) {
  if (mentions.length === 0) return null;

  let msg = `🔔 ${mentions.length} new mention${mentions.length > 1 ? 's' : ''} of @ClicksProtocol:\n\n`;

  for (const m of mentions.slice(0, 5)) {
    const text = m.text.length > 150 ? m.text.substring(0, 147) + '...' : m.text;
    msg += `${m.author} (${m.name}):\n"${text}"\n`;
    msg += `❤️${m.likes} 🔁${m.retweets} 💬${m.replies}\n`;
    msg += `${m.url}\n\n`;
  }

  if (mentions.length > 5) {
    msg += `...and ${mentions.length - 5} more.`;
  }

  return msg;
}

async function main() {
  const args = process.argv.slice(2);
  const hoursIdx = args.indexOf('--hours');
  const hours = hoursIdx !== -1 ? parseInt(args[hoursIdx + 1]) || 2 : 2;
  const dryRun = args.includes('--dry-run');

  log(`Checking mentions from last ${hours}h...`);

  const { tweets, users } = await searchMentions(hours);
  const seen = loadSeen();
  
  const newMentions = [];
  for (const tweet of tweets) {
    if (!seen.has(tweet.id)) {
      newMentions.push(formatTweet(tweet, users));
      seen.add(tweet.id);
    }
  }

  // Keep seen list manageable (last 1000)
  const seenArray = [...seen];
  if (seenArray.length > 1000) {
    saveSeen(new Set(seenArray.slice(-1000)));
  } else {
    saveSeen(seen);
  }

  log(`Found ${tweets.length} total, ${newMentions.length} new`);

  if (newMentions.length === 0) {
    log('No new mentions.');
    return;
  }

  // Print to console
  for (const m of newMentions) {
    console.log(`\n${m.author}: "${m.text.substring(0, 100)}..."`);
    console.log(`  ${m.url}`);
  }

  if (dryRun) {
    log('Dry run, skipping Telegram notification.');
    const msg = buildTelegramMessage(newMentions);
    if (msg) console.log('\n--- Would send to Telegram ---\n' + msg);
    return;
  }

  // Output message for OpenClaw to pick up
  const msg = buildTelegramMessage(newMentions);
  if (msg) {
    // Write to stdout so OpenClaw cron can announce it
    console.log('\n' + msg);
  }
}

main().catch(err => {
  log(`❌ Error: ${err.message}`);
  process.exit(1);
});
