#!/usr/bin/env node
/**
 * performance.js — Tweet Performance Report for @ClicksProtocol
 * 
 * Fetches engagement metrics for all posted tweets and generates a report.
 * Uses Twitter API v2 GET /2/users/:id/tweets with Bearer Token auth.
 * 
 * Usage:
 *   node performance.js           # Report for all tweets
 *   node performance.js --days 7  # Only last 7 days
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));
const REPORTS_DIR = join(__dirname, 'reports');

const BEARER = config.bearerToken;
const USER_ID = config.userId;
const BASE_URL = 'https://api.twitter.com';

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let days = null;
  const idx = args.indexOf('--days');
  if (idx !== -1 && args[idx + 1]) {
    days = parseInt(args[idx + 1], 10);
    if (isNaN(days) || days < 1) days = null;
  }
  return { days };
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

async function fetchUserTweets(days) {
  const params = new URLSearchParams({
    max_results: '100',
    'tweet.fields': 'created_at,public_metrics,text',
    exclude: 'retweets,replies',
  });

  if (days) {
    const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    params.set('start_time', startTime);
  }

  const url = `${BASE_URL}/2/users/${USER_ID}/tweets?${params}`;
  const headers = { Authorization: `Bearer ${BEARER}` };

  log(`Fetching tweets${days ? ` from last ${days} days` : ''}...`);

  let allTweets = [];
  let nextToken = null;

  do {
    const pageUrl = nextToken ? `${url}&pagination_token=${nextToken}` : url;
    const data = await fetchWithRateLimit(pageUrl, headers);

    if (data.data) {
      allTweets.push(...data.data);
    }

    nextToken = data.meta?.next_token || null;

    // Respect rate limits between pages
    if (nextToken) await sleep(1000);
  } while (nextToken);

  return allTweets;
}

function calculateMetrics(tweets) {
  let totalImpressions = 0;
  let totalLikes = 0;
  let totalRetweets = 0;
  let totalReplies = 0;
  let totalQuotes = 0;
  let totalBookmarks = 0;

  const enriched = tweets.map(t => {
    const m = t.public_metrics || {};
    const impressions = m.impression_count || 0;
    const likes = m.like_count || 0;
    const retweets = m.retweet_count || 0;
    const replies = m.reply_count || 0;
    const quotes = m.quote_count || 0;
    const bookmarks = m.bookmark_count || 0;

    totalImpressions += impressions;
    totalLikes += likes;
    totalRetweets += retweets;
    totalReplies += replies;
    totalQuotes += quotes;
    totalBookmarks += bookmarks;

    const engagements = likes + retweets + replies + quotes;
    const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : 0;

    return {
      id: t.id,
      text: t.text,
      createdAt: t.created_at,
      impressions,
      likes,
      retweets,
      replies,
      quotes,
      bookmarks,
      engagementRate,
    };
  });

  const totalEngagements = totalLikes + totalRetweets + totalReplies + totalQuotes;
  const avgEngagementRate = totalImpressions > 0
    ? (totalEngagements / totalImpressions) * 100
    : 0;

  return {
    tweets: enriched,
    summary: {
      totalTweets: tweets.length,
      totalImpressions,
      totalLikes,
      totalRetweets,
      totalReplies,
      totalQuotes,
      totalBookmarks,
      avgEngagementRate,
    },
  };
}

function generateReport(metrics, days) {
  const today = new Date().toISOString().slice(0, 10);
  const { summary, tweets } = metrics;

  // Sort by engagement rate descending for top performers
  const sorted = [...tweets].sort((a, b) => {
    // Primary: engagement rate, secondary: impressions
    const scoreA = a.engagementRate * 1000 + a.impressions;
    const scoreB = b.engagementRate * 1000 + b.impressions;
    return scoreB - scoreA;
  });

  const topPerformers = sorted.slice(0, 5);

  // Sort all tweets by date descending for table
  const byDate = [...tweets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let report = `# Tweet Performance Report\n`;
  report += `Date: ${today}\n`;
  report += days ? `Period: Last ${days} days\n` : `Period: All time\n`;
  report += `\n`;

  report += `## Summary\n`;
  report += `- Total Tweets: ${summary.totalTweets}\n`;
  report += `- Total Impressions: ${summary.totalImpressions.toLocaleString()}\n`;
  report += `- Total Likes: ${summary.totalLikes.toLocaleString()}\n`;
  report += `- Total Retweets: ${summary.totalRetweets.toLocaleString()}\n`;
  report += `- Total Replies: ${summary.totalReplies.toLocaleString()}\n`;
  report += `- Total Quotes: ${summary.totalQuotes.toLocaleString()}\n`;
  report += `- Total Bookmarks: ${summary.totalBookmarks.toLocaleString()}\n`;
  report += `- Avg Engagement Rate: ${summary.avgEngagementRate.toFixed(2)}%\n`;
  report += `\n`;

  if (topPerformers.length > 0) {
    report += `## Top Performers\n`;
    for (let i = 0; i < topPerformers.length; i++) {
      const t = topPerformers[i];
      const text = t.text.replace(/\n/g, ' ').slice(0, 80);
      report += `${i + 1}. "${text}${t.text.length > 80 ? '...' : ''}"\n`;
      report += `   ${t.likes} likes, ${t.retweets} RTs, ${t.impressions.toLocaleString()} impressions (${t.engagementRate.toFixed(2)}%)\n`;
      report += `\n`;
    }
  }

  report += `## All Tweets\n\n`;
  report += `| Date | Text (50 chars) | Impressions | Likes | RTs | Replies | Engagement |\n`;
  report += `|------|----------------|-------------|-------|-----|---------|------------|\n`;

  for (const t of byDate) {
    const date = t.createdAt ? t.createdAt.slice(0, 10) : 'N/A';
    const text = t.text.replace(/\n/g, ' ').replace(/\|/g, '\\|').slice(0, 50);
    report += `| ${date} | ${text} | ${t.impressions.toLocaleString()} | ${t.likes} | ${t.retweets} | ${t.replies} | ${t.engagementRate.toFixed(2)}% |\n`;
  }

  return report;
}

async function main() {
  try {
    const { days } = parseArgs();
    const tweets = await fetchUserTweets(days);

    if (tweets.length === 0) {
      log('No tweets found.');
      return;
    }

    log(`Fetched ${tweets.length} tweets.`);

    const metrics = calculateMetrics(tweets);
    const report = generateReport(metrics, days);

    // Save report
    mkdirSync(REPORTS_DIR, { recursive: true });
    const today = new Date().toISOString().slice(0, 10);
    const reportPath = join(REPORTS_DIR, `performance-${today}.md`);
    writeFileSync(reportPath, report);
    log(`Report saved to ${reportPath}`);

    // Print summary to console
    console.log('\n' + report);
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
