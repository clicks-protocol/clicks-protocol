#!/usr/bin/env node
/**
 * stream.js — Filtered Stream / Keyword Monitor for @ClicksProtocol
 * 
 * Persistent connection delivering real-time tweets matching keywords.
 * Uses Twitter API v2 Filtered Stream with Bearer Token auth.
 * 
 * Usage:
 *   node stream.js start              # Start streaming
 *   node stream.js rules              # Show current rules
 *   node stream.js add "new keyword"  # Add a rule
 *   node stream.js clear              # Delete all rules
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));
const LOG_FILE = join(__dirname, 'stream-log.json');

const BEARER = config.bearerToken;
const BASE_URL = 'https://api.twitter.com';
const RULES_URL = `${BASE_URL}/2/tweets/search/stream/rules`;
const STREAM_URL = `${BASE_URL}/2/tweets/search/stream`;

const DEFAULT_RULES = [
  {
    value: '(x402 OR "agent yield" OR "agent wallet" OR "USDC yield" OR "idle USDC" OR @ClicksProtocol OR "clicks protocol") lang:en -is:retweet',
    tag: 'clicks-protocol-keywords',
  },
];

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function authHeaders(contentType = false) {
  const h = { Authorization: `Bearer ${BEARER}` };
  if (contentType) h['Content-Type'] = 'application/json';
  return h;
}

// --- Rules Management ---

async function getRules() {
  const res = await fetch(RULES_URL, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GET rules failed: HTTP ${res.status} — ${body}`);
  }
  return res.json();
}

async function addRules(rules) {
  const body = JSON.stringify({ add: rules });
  const res = await fetch(RULES_URL, {
    method: 'POST',
    headers: authHeaders(true),
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST rules failed: HTTP ${res.status} — ${text}`);
  }
  return res.json();
}

async function deleteRules(ids) {
  if (!ids || ids.length === 0) return;
  const body = JSON.stringify({ delete: { ids } });
  const res = await fetch(RULES_URL, {
    method: 'POST',
    headers: authHeaders(true),
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DELETE rules failed: HTTP ${res.status} — ${text}`);
  }
  return res.json();
}

async function showRules() {
  const data = await getRules();
  if (!data.data || data.data.length === 0) {
    log('No active rules.');
    return;
  }
  log(`Active rules (${data.data.length}):`);
  for (const rule of data.data) {
    console.log(`  [${rule.id}] ${rule.value} (tag: ${rule.tag || 'none'})`);
  }
}

async function clearRules() {
  const data = await getRules();
  if (!data.data || data.data.length === 0) {
    log('No rules to clear.');
    return;
  }
  const ids = data.data.map(r => r.id);
  await deleteRules(ids);
  log(`Cleared ${ids.length} rules.`);
}

async function addCustomRule(value) {
  const result = await addRules([{ value, tag: 'custom' }]);
  if (result.errors) {
    log(`Error adding rule: ${JSON.stringify(result.errors)}`);
  } else {
    log(`Rule added: "${value}"`);
  }
}

async function ensureDefaultRules() {
  const data = await getRules();
  const existing = data.data || [];

  // Check if default rule already exists
  const hasDefault = existing.some(r => r.tag === 'clicks-protocol-keywords');
  if (hasDefault) {
    log('Default rules already active.');
    return;
  }

  // Clear any existing rules and set defaults
  if (existing.length > 0) {
    const ids = existing.map(r => r.id);
    await deleteRules(ids);
    log(`Cleared ${ids.length} old rules.`);
  }

  const result = await addRules(DEFAULT_RULES);
  if (result.errors) {
    throw new Error(`Failed to set rules: ${JSON.stringify(result.errors)}`);
  }
  log('Default rules set.');
}

// --- Stream ---

function appendToLog(tweet) {
  let existing = [];
  if (existsSync(LOG_FILE)) {
    try {
      existing = JSON.parse(readFileSync(LOG_FILE, 'utf-8'));
    } catch {
      existing = [];
    }
  }
  existing.push(tweet);
  writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));
}

async function startStream() {
  await ensureDefaultRules();

  const params = new URLSearchParams({
    'tweet.fields': 'created_at,public_metrics,author_id',
    'user.fields': 'username,name',
    expansions: 'author_id',
  });

  let backoff = 1000;
  const maxBackoff = 300000; // 5 min

  while (true) {
    try {
      log('Connecting to stream...');

      const res = await fetch(`${STREAM_URL}?${params}`, {
        headers: authHeaders(),
      });

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
        throw new Error(`Stream HTTP ${res.status}: ${body}`);
      }

      log('Stream connected! Listening for tweets...\n');
      backoff = 1000; // Reset backoff on successful connection

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          log('Stream ended.');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue; // Heartbeat (empty line)

          try {
            const data = JSON.parse(trimmed);

            if (data.data) {
              const tweet = data.data;
              const users = data.includes?.users || [];
              const author = users.find(u => u.id === tweet.author_id);
              const username = author ? `@${author.username}` : tweet.author_id;
              const metrics = tweet.public_metrics || {};

              const entry = {
                id: tweet.id,
                text: tweet.text,
                author: username,
                authorName: author?.name || 'Unknown',
                url: author ? `https://x.com/${author.username}/status/${tweet.id}` : null,
                createdAt: tweet.created_at,
                matchingRules: data.matching_rules?.map(r => r.tag) || [],
                receivedAt: new Date().toISOString(),
              };

              appendToLog(entry);

              console.log(`  🐦 ${username} (${entry.authorName})`);
              console.log(`  "${tweet.text.slice(0, 140)}${tweet.text.length > 140 ? '...' : ''}"`);
              console.log(`  ${entry.url || ''}`);
              console.log(`  Rules: ${entry.matchingRules.join(', ')}`);
              console.log('');
            }
          } catch {
            // Non-JSON line, skip
          }
        }
      }
    } catch (err) {
      log(`Stream error: ${err.message}`);
    }

    log(`Reconnecting in ${backoff / 1000}s...`);
    await sleep(backoff);
    backoff = Math.min(backoff * 2, maxBackoff);
  }
}

// --- CLI ---

async function main() {
  const command = process.argv[2] || 'start';

  try {
    switch (command) {
      case 'start':
        await startStream();
        break;
      case 'rules':
        await showRules();
        break;
      case 'add': {
        const value = process.argv[3];
        if (!value) {
          console.error('Usage: node stream.js add "keyword or rule"');
          process.exit(1);
        }
        await addCustomRule(value);
        break;
      }
      case 'clear':
        await clearRules();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('Usage: node stream.js [start|rules|add|clear]');
        process.exit(1);
    }
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
