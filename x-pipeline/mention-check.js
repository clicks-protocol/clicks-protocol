#!/usr/bin/env node
/**
 * mention-check.js — Daily Mention Check for @ClicksProtocol
 * 
 * Searches recent tweets mentioning @ClicksProtocol or "clicks protocol".
 * Uses Twitter API v2 GET /2/tweets/search/recent with Bearer Token auth.
 * 
 * Usage:
 *   node mention-check.js            # Check last 24h
 *   node mention-check.js --hours 48 # Check last 48h
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));
const LOG_FILE = join(__dirname, 'mentions-log.json');

const BEARER = config.bearerToken;
const BASE_URL = 'https://api.twitter.com';

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let hours = 24;
  const idx = args.indexOf('--hours');
  if (idx !== -1 && args[idx + 1]) {
    hours = parseInt(args[idx + 1], 10);
    if (isNaN(hours) || hours < 1) hours = 24;
  }
  return { hours };
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRateLimit(url, headers, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, { headers });

    if (res.status === 429) {
      const resetEpoch = res.headers.get('x-rate-limit-reset');
      const waitMs = resetEpoch
        ? (parseInt(resetEpoch, 10) * 1000 - Date.now()) + 1000
        : 60000;
      log(`Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s...`);
      await sleep(Math.max(waitMs, 1000));
      continue;
    }

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body}`);
    }

    return res.json();
  }
  throw new Error('Max retries exceeded due to rate limiting');
}

async function searchMentions(hours) {
  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const query = '(@ClicksProtocol OR "clicks protocol" OR url:clicksprotocol.xyz) -from:ClicksProtocol -is:retweet';

  const params = new URLSearchParams({
    query,
    start_time: startTime,
    max_results: '100',
    'tweet.fields': 'created_at,public_metrics,author_id,conversation_id',
    'user.fields': 'username,name',
    expansions: 'author_id',
  });

  const url = `${BASE_URL}/2/tweets/search/recent?${params}`;
  const headers = { Authorization: `Bearer ${BEARER}` };

  log(`Searching mentions from last ${hours}h...`);
  log(`Query: ${query}`);

  let allTweets = [];
  let allUsers = [];
  let nextToken = null;

  do {
    const pageUrl = nextToken ? `${url}&next_token=${nextToken}` : url;
    const data = await fetchWithRateLimit(pageUrl, headers);

    if (data.data) {
      allTweets.push(...data.data);
    }
    if (data.includes?.users) {
      allUsers.push(...data.includes.users);
    }

    nextToken = data.meta?.next_token || null;
  } while (nextToken);

  return { tweets: allTweets, users: allUsers };
}

function buildResults(tweets, users) {
  const userMap = new Map();
  for (const u of users) {
    userMap.set(u.id, u);
  }

  return tweets.map(t => {
    const author = userMap.get(t.author_id);
    return {
      id: t.id,
      text: t.text,
      author: author ? `@${author.username}` : t.author_id,
      authorName: author?.name || 'Unknown',
      url: author ? `https://x.com/${author.username}/status/${t.id}` : null,
      createdAt: t.created_at,
      metrics: t.public_metrics || {},
    };
  });
}

function appendToLog(results) {
  let existing = [];
  if (existsSync(LOG_FILE)) {
    try {
      existing = JSON.parse(readFileSync(LOG_FILE, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  const entry = {
    checkedAt: new Date().toISOString(),
    count: results.length,
    mentions: results,
  };

  existing.push(entry);
  writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));
  log(`Appended to ${LOG_FILE}`);
}

async function main() {
  try {
    const { hours } = parseArgs();
    const { tweets, users } = await searchMentions(hours);

    if (tweets.length === 0) {
      log(`Found 0 mentions in last ${hours}h`);
      appendToLog([]);
      return;
    }

    const results = buildResults(tweets, users);
    appendToLog(results);

    log(`\nFound ${results.length} mentions in last ${hours}h:\n`);

    for (const r of results) {
      console.log(`  ${r.author} (${r.authorName})`);
      console.log(`  "${r.text.slice(0, 120)}${r.text.length > 120 ? '...' : ''}"`);
      console.log(`  ${r.url}`);
      console.log(`  ${r.createdAt} | ❤️ ${r.metrics.like_count || 0} | 🔁 ${r.metrics.retweet_count || 0} | 💬 ${r.metrics.reply_count || 0}`);
      console.log('');
    }
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
