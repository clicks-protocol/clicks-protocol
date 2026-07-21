#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = join(HERE, 'reports', 'analytics');
const SNAPSHOT_FILE = join(REPORT_DIR, 'snapshots.json');
const USER_ID = '2033251448105115649';
const USERNAME = 'ClicksProtocol';
const XURL = '/opt/homebrew/bin/xurl';

function xurl(path) {
  const raw = execFileSync(XURL, ['--app', 'clicks', '--auth', 'oauth2', path], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

function readSnapshots() {
  try {
    return JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'));
  } catch {
    return { snapshots: [] };
  }
}

function sumTweets(tweets) {
  const totals = {
    posts: tweets.length,
    impressions: 0,
    engagements: 0,
    profileClicks: 0,
    linkClicks: 0,
    likes: 0,
    replies: 0,
    reposts: 0,
    quotes: 0,
    bookmarks: 0,
  };

  for (const tweet of tweets) {
    const pub = tweet.public_metrics || {};
    const own = tweet.organic_metrics || tweet.non_public_metrics || {};
    totals.impressions += own.impression_count ?? pub.impression_count ?? 0;
    totals.engagements += tweet.non_public_metrics?.engagements ?? 0;
    totals.profileClicks += own.user_profile_clicks ?? 0;
    totals.linkClicks += own.url_link_clicks ?? 0;
    totals.likes += pub.like_count ?? 0;
    totals.replies += pub.reply_count ?? 0;
    totals.reposts += pub.retweet_count ?? 0;
    totals.quotes += pub.quote_count ?? 0;
    totals.bookmarks += pub.bookmark_count ?? 0;
  }

  totals.engagementRate = totals.impressions
    ? (totals.engagements / totals.impressions) * 100
    : 0;
  return totals;
}

function score(tweet) {
  const pub = tweet.public_metrics || {};
  const own = tweet.organic_metrics || tweet.non_public_metrics || {};
  const impressions = own.impression_count ?? pub.impression_count ?? 0;
  const engagements = tweet.non_public_metrics?.engagements
    ?? ((pub.like_count ?? 0) + (pub.reply_count ?? 0) + (pub.retweet_count ?? 0) + (pub.quote_count ?? 0));
  return { impressions, engagements };
}

function clean(text, length = 96) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, length);
}

async function main() {
  const now = new Date();
  const since = new Date(now.getTime() - 90 * 86400000).toISOString();
  const tweetFields = 'created_at,public_metrics,non_public_metrics,organic_metrics';
  const base = `/2/users/${USER_ID}/tweets?max_results=100&start_time=${encodeURIComponent(since)}&exclude=retweets&tweet.fields=${tweetFields}`;

  const tweets = [];
  let nextToken = '';
  do {
    const page = xurl(nextToken ? `${base}&pagination_token=${encodeURIComponent(nextToken)}` : base);
    tweets.push(...(page.data || []));
    nextToken = page.meta?.next_token || '';
  } while (nextToken);

  const profile = xurl('/2/users/me?user.fields=created_at,public_metrics,subscription_type,verified,verified_type').data;
  const followersResponse = xurl(`/2/users/${USER_ID}/followers?max_results=100&user.fields=verified,verified_type,subscription_type,username`);
  const followers = followersResponse.data || [];
  const verifiedFollowers = followers.filter((f) => (
    f.verified === true
    || (f.verified_type && f.verified_type !== 'none')
    || (f.subscription_type && f.subscription_type !== 'None')
  )).length;

  const originalPosts = tweets.filter((t) => !String(t.text || '').startsWith('@'));
  const replies = tweets.filter((t) => String(t.text || '').startsWith('@'));
  const allTotals = sumTweets(tweets);
  const originalTotals = sumTweets(originalPosts);
  const replyTotals = sumTweets(replies);

  const winners = [...tweets]
    .sort((a, b) => {
      const aa = score(a);
      const bb = score(b);
      return bb.impressions - aa.impressions || bb.engagements - aa.engagements;
    })
    .slice(0, 5);

  const snapshot = {
    at: now.toISOString(),
    followers: profile.public_metrics?.followers_count ?? followers.length,
    verifiedFollowers,
    following: profile.public_metrics?.following_count ?? 0,
    tweetCount: profile.public_metrics?.tweet_count ?? 0,
    ninetyDay: allTotals,
  };

  mkdirSync(REPORT_DIR, { recursive: true });
  const history = readSnapshots();
  const date = now.toISOString().slice(0, 10);
  history.snapshots = history.snapshots.filter((item) => !String(item.at || '').startsWith(date));
  history.snapshots.push(snapshot);
  history.snapshots = history.snapshots.slice(-180);
  writeFileSync(SNAPSHOT_FILE, JSON.stringify(history, null, 2) + '\n');

  const previous = history.snapshots.at(-2);
  const followerDelta = previous ? snapshot.followers - previous.followers : 0;
  const verifiedDelta = previous ? snapshot.verifiedFollowers - previous.verifiedFollowers : 0;
  const targetDaily = 5_000_000 / 90;
  const currentDaily = allTotals.impressions / 90;

  let report = `# X Analytics: @${USERNAME}\n\n`;
  report += `Stand: ${now.toISOString()}\n\n`;
  report += `## Wachstum\n\n`;
  report += `- Follower: ${snapshot.followers} (${followerDelta >= 0 ? '+' : ''}${followerDelta} seit letzter Messung)\n`;
  report += `- Verifizierte oder Premium-Follower: ${verifiedFollowers} (${verifiedDelta >= 0 ? '+' : ''}${verifiedDelta})\n`;
  report += `- 90-Tage-Impressionen: ${allTotals.impressions.toLocaleString('en-US')}\n`;
  report += `- Erforderlich fuer 5 Mio.: 55,556 pro Tag\n`;
  report += `- Aktueller 90-Tage-Tagesdurchschnitt: ${Math.round(currentDaily).toLocaleString('en-US')}\n`;
  report += `- Zielerreichung Impressionen: ${((allTotals.impressions / 5_000_000) * 100).toFixed(3)} %\n\n`;
  report += `## Inhalte der letzten 90 Tage\n\n`;
  report += `| Typ | Anzahl | Impressionen | Engagements | Profilklicks | Linkklicks | Rate |\n`;
  report += `|---|---:|---:|---:|---:|---:|---:|\n`;
  report += `| Originalposts | ${originalTotals.posts} | ${originalTotals.impressions} | ${originalTotals.engagements} | ${originalTotals.profileClicks} | ${originalTotals.linkClicks} | ${originalTotals.engagementRate.toFixed(2)} % |\n`;
  report += `| Replies | ${replyTotals.posts} | ${replyTotals.impressions} | ${replyTotals.engagements} | ${replyTotals.profileClicks} | ${replyTotals.linkClicks} | ${replyTotals.engagementRate.toFixed(2)} % |\n`;
  report += `| Gesamt | ${allTotals.posts} | ${allTotals.impressions} | ${allTotals.engagements} | ${allTotals.profileClicks} | ${allTotals.linkClicks} | ${allTotals.engagementRate.toFixed(2)} % |\n\n`;
  report += `## Gewinner nach Impressionen\n\n`;
  winners.forEach((tweet, index) => {
    const metrics = score(tweet);
    report += `${index + 1}. ${metrics.impressions} Impressionen, ${metrics.engagements} Engagements: ${clean(tweet.text)}\n`;
    report += `   https://x.com/${USERNAME}/status/${tweet.id}\n`;
  });
  report += `\n## Harte Schwelle\n\n`;
  report += currentDaily >= targetDaily
    ? `Der aktuelle Tagesdurchschnitt liegt auf Zielniveau.\n`
    : `Der aktuelle Tagesdurchschnitt liegt unter dem erforderlichen Niveau. Distribution und zitierbare Formate bleiben der Engpass.\n`;

  const reportPath = join(REPORT_DIR, `${date}.md`);
  writeFileSync(reportPath, report);
  process.stdout.write(report);
}

main().catch((error) => {
  console.error(`X analytics failed: ${error.message}`);
  process.exit(1);
});
