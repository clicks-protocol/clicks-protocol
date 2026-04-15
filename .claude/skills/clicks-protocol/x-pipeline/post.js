import { Client } from '@xdevplatform/xdk';
import fs from 'fs';
import path from 'path';

// Auth config
const client = new Client({
  auth: {
    consumerKey: process.env.X_CONSUMER_KEY || '',
    consumerSecret: process.env.X_CONSUMER_SECRET || '',
    accessToken: process.env.X_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.X_ACCESS_SECRET || '',
  }
});

// Queue file
const QUEUE_FILE = path.join(import.meta.dirname, 'queue.json');
const LOG_FILE = path.join(import.meta.dirname, 'post-log.json');

async function loadQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return [];
  return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
}

function saveQueue(queue) {
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function appendLog(entry) {
  let log = [];
  if (fs.existsSync(LOG_FILE)) {
    log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  }
  log.push(entry);
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

async function postNext() {
  const queue = await loadQueue();
  
  if (queue.length === 0) {
    console.log('Queue is empty. Nothing to post.');
    return;
  }

  const next = queue.shift();
  
  try {
    const response = await client.posts.create({ text: next.text });
    const postId = response.data?.id;
    
    console.log(`✅ Posted: "${next.text.substring(0, 50)}..."`);
    console.log(`   ID: ${postId}`);
    console.log(`   URL: https://x.com/ClicksProtocol/status/${postId}`);

    // Auto-reply with link (x-algorithm: links go in reply, not main tweet)
    if (next.reply_with_link && postId) {
      try {
        await new Promise(r => setTimeout(r, 2000)); // 2s delay
        const replyResponse = await client.posts.create({
          text: next.reply_with_link,
          reply: { in_reply_to_tweet_id: postId },
        });
        const replyId = replyResponse.data?.id;
        console.log(`   ↳ Reply with link posted: ${replyId}`);
      } catch (replyErr) {
        console.error(`   ↳ Reply failed: ${replyErr.message}`);
      }
    }
    
    appendLog({
      postedAt: new Date().toISOString(),
      text: next.text,
      replyWithLink: next.reply_with_link || null,
      postId,
      url: `https://x.com/ClicksProtocol/status/${postId}`,
      day: next.day || null,
      slot: next.slot || null,
    });
    
    saveQueue(queue);
    console.log(`   Remaining in queue: ${queue.length}`);
    
  } catch (err) {
    console.error(`❌ Failed to post: ${err.message}`);
    // Put it back at the front
    queue.unshift(next);
    saveQueue(queue);
    
    appendLog({
      failedAt: new Date().toISOString(),
      text: next.text,
      error: err.message,
    });
  }
}

async function postAll(delayMs = 60000) {
  const queue = await loadQueue();
  console.log(`Posting ${queue.length} tweets with ${delayMs/1000}s delay...`);
  
  for (let i = 0; i < queue.length; i++) {
    await postNext();
    if (i < queue.length - 1) {
      console.log(`Waiting ${delayMs/1000}s...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

// CLI
const cmd = process.argv[2];
if (cmd === 'next') {
  postNext();
} else if (cmd === 'all') {
  const delay = parseInt(process.argv[3]) || 60000;
  postAll(delay);
} else if (cmd === 'status') {
  const queue = await loadQueue();
  let log = [];
  if (fs.existsSync(LOG_FILE)) log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  console.log(`Queue: ${queue.length} tweets pending`);
  console.log(`Posted: ${log.filter(l => l.postId).length} tweets`);
  console.log(`Failed: ${log.filter(l => l.error).length} tweets`);
} else {
  console.log('Usage:');
  console.log('  node post.js next     - Post next tweet from queue');
  console.log('  node post.js all [ms] - Post all with delay (default 60s)');
  console.log('  node post.js status   - Show queue status');
}
