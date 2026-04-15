#!/usr/bin/env npx tsx

const MOLTBOOK_API = "https://www.moltbook.com/api/v1";
const OPENCLAWX_API = "https://openclawx.ai/api/v1";
const MCP_ENDPOINT = "https://mcp.clicksprotocol.xyz/mcp";

interface YieldInfo {
  active_protocol: string;
  aave_apy_bps: number | string;
  morpho_apy_bps: number | string;
  total_balance_usdc: string;
  pending_fees_usdc: string;
}

function formatApy(bps: number | string): string {
  if (typeof bps === "string" || bps === null || bps === undefined) return "N/A";
  return (bps / 100).toFixed(2) + "%";
}

function formatUsdc(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return "N/A";
  return num < 1000
    ? num.toFixed(2)
    : num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildPost(data: YieldInfo): string {
  return [
    "Clicks Protocol Daily Yield Report",
    "",
    `Active: ${data.active_protocol}`,
    `Aave APY: ${formatApy(data.aave_apy_bps)}`,
    `Morpho APY: ${formatApy(data.morpho_apy_bps)}`,
    `Protocol TVL: $${formatUsdc(data.total_balance_usdc)} USDC`,
    `Pending Fees: $${formatUsdc(data.pending_fees_usdc)} USDC`,
    "",
    "Live data from Base mainnet. Query via MCP: npx @clicks-protocol/mcp-server",
    "https://clicksprotocol.xyz",
  ].join("\n");
}

async function fetchYieldData(): Promise<YieldInfo> {
  const res = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "clicks_get_yield_info", arguments: {} },
    }),
  });

  if (!res.ok) throw new Error(`MCP request failed: ${res.status} ${res.statusText}`);

  const json = await res.json();
  const text = json?.result?.content?.[0]?.text;
  if (!text) throw new Error(`MCP response missing content: ${JSON.stringify(json)}`);

  return JSON.parse(text) as YieldInfo;
}

async function solveMoltbookChallenge(challenge: string): Promise<string> {
  // Moltbook obfuscates challenges with random case, doubled letters, and inserted symbols
  // e.g. "lOoBbSsTtEeR^ ClAw- FoRcE] eXerTs^ tWeNtYy FiVe] nEuToNs"
  // Step 1: strip non-alpha, lowercase, dedup consecutive same chars
  function deobfuscate(text: string): string {
    const stripped = text.replace(/[^a-zA-Z ]/g, "").toLowerCase();
    // Dedup consecutive identical characters within each word
    const words = stripped.split(/\s+/).filter(Boolean);
    return words.map((w) => {
      let result = w[0];
      for (let i = 1; i < w.length; i++) {
        if (w[i] !== w[i - 1]) result += w[i];
      }
      return result;
    }).join(" ");
  }

  const clean = deobfuscate(challenge);
  // Also create a no-space version to find fragmented words like "tw en ty" → "twenty"
  const solid = clean.replace(/ /g, "");

  // Ordered longest-first to match "twentyfive" before "twenty" and "five"
  const numberPatterns: [string, number][] = [
    ["twentyone", 21], ["twentytwo", 22], ["twentythree", 23], ["twentyfour", 24],
    ["twentyfive", 25], ["twentysix", 26], ["twentyseven", 27], ["twentyeight", 28],
    ["twentynine", 29], ["thirtyone", 31], ["thirtytwo", 32], ["thirtythree", 33],
    ["thirtyfour", 34], ["thirtyfive", 35], ["thirtysix", 36], ["thirtyseven", 37],
    ["thirtyeight", 38], ["thirtynine", 39], ["fortyone", 41], ["fortytwo", 42],
    ["fortythree", 43], ["fortyfour", 44], ["fortyfive", 45], ["fortysix", 46],
    ["fortyseven", 47], ["fortyeight", 48], ["fortynine", 49],
    ["nineteen", 19], ["nineten", 19], ["eighteen", 18], ["seventeen", 17], ["seventen", 17],
    ["sixteen", 16], ["fiften", 15], ["fifteen", 15], ["fourteen", 14], ["fourten", 14],
    ["thirteen", 13], ["thirten", 13], ["twelve", 12], ["eleven", 11],
    ["twenty", 20], ["thirty", 30], ["forty", 40], ["fifty", 50],
    ["sixty", 60], ["seventy", 70], ["eighty", 80], ["ninety", 90],
    ["hundred", 100], ["thousand", 1000],
    ["ten", 10], ["nine", 9], ["eight", 8], ["seven", 7], ["six", 6],
    ["five", 5], ["four", 4], ["thre", 3], ["three", 3], ["two", 2], ["one", 1], ["zero", 0],
  ];

  // Extract numbers by scanning the solid string for known number words
  function extractNumbers(text: string): number[] {
    const numbers: number[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      let found = false;
      for (const [word, val] of numberPatterns) {
        if (remaining.startsWith(word)) {
          // Compound: e.g. "twentyfive" → if last number is a tens value, add to it
          if (numbers.length > 0 && val < 10 && numbers[numbers.length - 1] % 10 === 0 && numbers[numbers.length - 1] < 100) {
            numbers[numbers.length - 1] += val;
          } else if (val === 100 && numbers.length > 0 && numbers[numbers.length - 1] < 100) {
            numbers[numbers.length - 1] *= 100;
          } else {
            numbers.push(val);
          }
          remaining = remaining.slice(word.length);
          found = true;
          break;
        }
      }
      if (!found) {
        remaining = remaining.slice(1);
      }
    }
    return numbers;
  }

  const numbers = extractNumbers(solid);
  console.log(`[moltbook] Deobfuscated: "${clean}"`);
  console.log(`[moltbook] Solid: "${solid}"`);
  console.log(`[moltbook] Extracted numbers: [${numbers.join(", ")}]`);

  if (numbers.length >= 2) {
    if (solid.includes("reduc") || solid.includes("minus") || solid.includes("subtract") || solid.includes("remaining")) {
      return (numbers[0] - numbers[1]).toFixed(2);
    }
    if (solid.includes("ads") || solid.includes("adds") || solid.includes("plus") || solid.includes("total") || solid.includes("combined") || solid.includes("sum")) {
      return (numbers[0] + numbers[1]).toFixed(2);
    }
    if (solid.includes("times") || solid.includes("multipl")) {
      return (numbers[0] * numbers[1]).toFixed(2);
    }
    if (solid.includes("divid") || solid.includes("ratio")) {
      return (numbers[0] / numbers[1]).toFixed(2);
    }
    // Default: subtraction
    return (numbers[0] - numbers[1]).toFixed(2);
  }

  throw new Error(`Could not solve challenge: "${challenge}" -> solid: "${solid}" -> numbers: [${numbers}]`);
}

async function postToMoltbook(content: string, apiKey: string): Promise<void> {
  const res = await fetch(`${MOLTBOOK_API}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submolt: "clicks-protocol",
      title: "Clicks Protocol Daily Yield Report",
      content,
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`Moltbook post failed (${res.status}): ${json.message || JSON.stringify(json)}`);
  }

  // Handle verification challenge
  const verification = json?.post?.verification;
  if (verification?.verification_code && verification?.challenge_text) {
    console.log("[moltbook] Solving verification challenge...");
    try {
      const answer = await solveMoltbookChallenge(verification.challenge_text);
      console.log(`[moltbook] Challenge answer: ${answer}`);

      const verifyRes = await fetch(`${MOLTBOOK_API}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verification_code: verification.verification_code,
          answer,
        }),
      });

      const verifyJson = await verifyRes.json();
      if (verifyRes.ok) {
        console.log(`[moltbook] Post verified and published.`);
      } else {
        console.error(`[moltbook] Verification failed: ${verifyJson.message || JSON.stringify(verifyJson)}`);
      }
    } catch (e) {
      console.error(`[moltbook] Could not solve challenge: ${(e as Error).message}`);
    }
  }

  const postId = json?.post?.id;
  console.log(`[moltbook] Posted: https://www.moltbook.com/m/clicks-protocol (post ${postId})`);
}

async function postToOpenClawX(content: string, apiKey: string): Promise<void> {
  const res = await fetch(`${OPENCLAWX_API}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`OpenClawX post failed (${res.status}): ${json?.error?.message || JSON.stringify(json)}`);
  }

  const postId = json?.data?.post?.id;
  console.log(`[openclawx] Posted: https://openclawx.ai (post ${postId})`);
}

async function main() {
  const moltbookKey = process.env.MOLTBOOK_API_KEY;
  const openclawxKey = process.env.OPENCLAWX_API_KEY;

  if (!moltbookKey) {
    console.error("Missing MOLTBOOK_API_KEY");
    process.exit(1);
  }
  if (!openclawxKey) {
    console.error("Missing OPENCLAWX_API_KEY");
    process.exit(1);
  }

  // 1. Fetch yield data
  console.log("[mcp] Fetching yield data from Clicks Protocol...");
  let data: YieldInfo;
  try {
    data = await fetchYieldData();
    console.log(`[mcp] Active: ${data.active_protocol}, Aave: ${formatApy(data.aave_apy_bps)}, Morpho: ${formatApy(data.morpho_apy_bps)}, TVL: $${data.total_balance_usdc}`);
  } catch (e) {
    console.error(`[mcp] Failed to fetch yield data: ${(e as Error).message}`);
    console.error("[mcp] No post will be made.");
    process.exit(1);
  }

  // 2. Format post
  const post = buildPost(data);
  console.log("\n--- Post Content ---");
  console.log(post);
  console.log("--- End ---\n");

  // 3. Post to both platforms (independent — one failure doesn't block the other)
  const results = await Promise.allSettled([
    postToMoltbook(post, moltbookKey),
    postToOpenClawX(post, openclawxKey),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error(`[error] ${result.reason}`);
    }
  }

  const failures = results.filter((r) => r.status === "rejected").length;
  if (failures > 0) {
    console.log(`\n${2 - failures}/2 platforms posted successfully.`);
  } else {
    console.log("\nAll posts successful.");
  }
}

main();
