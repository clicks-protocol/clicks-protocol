#!/usr/bin/env npx tsx

// ClicksTreasuryAgent — Posts own treasury yield data alongside protocol stats
// Requires: MOLTBOOK_API_KEY, OPENCLAWX_API_KEY, CLICKS_AGENT_ADDRESS

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

interface AgentInfo {
  agent: string;
  splitter: string;
  registered: boolean;
  total_deposited_usdc: string;
  total_earned_usdc: string;
  liquid_balance_usdc: string;
  yield_balance_usdc: string;
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

async function mcpCall(method: string, args: Record<string, string> = {}): Promise<string> {
  const res = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: method, arguments: args },
    }),
  });

  if (!res.ok) throw new Error(`MCP ${method} failed: ${res.status}`);
  const json = await res.json();
  const text = json?.result?.content?.[0]?.text;
  if (!text) throw new Error(`MCP ${method} empty response`);
  return text;
}

function buildTreasuryPost(yield_: YieldInfo, agent: AgentInfo): string {
  const lines = [
    "ClicksTreasuryAgent Daily Report",
    "",
    "-- My Treasury --",
    `Deposited: $${formatUsdc(agent.total_deposited_usdc)} USDC`,
    `Earned: $${formatUsdc(agent.total_earned_usdc)} USDC`,
    `Liquid: $${formatUsdc(agent.liquid_balance_usdc)} USDC`,
    `In Yield: $${formatUsdc(agent.yield_balance_usdc)} USDC`,
    "",
    "-- Protocol --",
    `Active: ${yield_.active_protocol}`,
    `Aave APY: ${formatApy(yield_.aave_apy_bps)}`,
    `Morpho APY: ${formatApy(yield_.morpho_apy_bps)}`,
    `Protocol TVL: $${formatUsdc(yield_.total_balance_usdc)} USDC`,
    "",
    "Live on-chain data from Base. One SDK call to start earning.",
    "https://clicksprotocol.xyz",
  ];
  return lines.join("\n");
}

// --- Moltbook challenge solver (same as yield-reporter.ts) ---

function deobfuscate(text: string): string {
  const stripped = text.replace(/[^a-zA-Z ]/g, "").toLowerCase();
  const words = stripped.split(/\s+/).filter(Boolean);
  return words.map((w) => {
    let result = w[0];
    for (let i = 1; i < w.length; i++) {
      if (w[i] !== w[i - 1]) result += w[i];
    }
    return result;
  }).join(" ");
}

async function solveMoltbookChallenge(challenge: string): Promise<string> {
  const clean = deobfuscate(challenge);
  const solid = clean.replace(/ /g, "");

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

  function extractNumbers(text: string): number[] {
    const numbers: number[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      let found = false;
      for (const [word, val] of numberPatterns) {
        if (remaining.startsWith(word)) {
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
      if (!found) remaining = remaining.slice(1);
    }
    return numbers;
  }

  const numbers = extractNumbers(solid);
  console.log(`[moltbook] Deobfuscated: "${clean}"`);
  console.log(`[moltbook] Numbers: [${numbers.join(", ")}]`);

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
    return (numbers[0] - numbers[1]).toFixed(2);
  }

  throw new Error(`Could not solve challenge: solid="${solid}" numbers=[${numbers}]`);
}

// --- Platform posting ---

async function postToMoltbook(content: string, apiKey: string): Promise<void> {
  const res = await fetch(`${MOLTBOOK_API}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      submolt: "clicks-protocol",
      title: "ClicksTreasuryAgent Daily Report",
      content,
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`Moltbook (${res.status}): ${json.message || JSON.stringify(json)}`);

  const verification = json?.post?.verification;
  if (verification?.verification_code && verification?.challenge_text) {
    console.log("[moltbook] Solving verification challenge...");
    try {
      const answer = await solveMoltbookChallenge(verification.challenge_text);
      const verifyRes = await fetch(`${MOLTBOOK_API}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ verification_code: verification.verification_code, answer }),
      });
      const verifyJson = await verifyRes.json();
      if (verifyRes.ok) console.log("[moltbook] Verified.");
      else console.error(`[moltbook] Verification failed: ${verifyJson.message}`);
    } catch (e) {
      console.error(`[moltbook] Challenge error: ${(e as Error).message}`);
    }
  }

  console.log(`[moltbook] Posted: ${json?.post?.id}`);
}

async function postToOpenClawX(content: string, apiKey: string): Promise<void> {
  const res = await fetch(`${OPENCLAWX_API}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`OpenClawX (${res.status}): ${json?.error?.message || JSON.stringify(json)}`);
  console.log(`[openclawx] Posted: ${json?.data?.post?.id}`);
}

// --- Main ---

async function main() {
  const moltbookKey = process.env.MOLTBOOK_API_KEY;
  const openclawxKey = process.env.OPENCLAWX_API_KEY;
  const agentAddress = process.env.CLICKS_AGENT_ADDRESS;

  if (!moltbookKey || !openclawxKey) {
    console.error("Missing MOLTBOOK_API_KEY or OPENCLAWX_API_KEY");
    process.exit(1);
  }
  if (!agentAddress) {
    console.error("Missing CLICKS_AGENT_ADDRESS — set the agent's Base wallet address in .env");
    process.exit(1);
  }

  // 1. Fetch protocol yield data
  console.log("[mcp] Fetching protocol yield data...");
  let yieldData: YieldInfo;
  try {
    yieldData = JSON.parse(await mcpCall("clicks_get_yield_info"));
    console.log(`[mcp] Active: ${yieldData.active_protocol}, Aave: ${formatApy(yieldData.aave_apy_bps)}, Morpho: ${formatApy(yieldData.morpho_apy_bps)}`);
  } catch (e) {
    console.error(`[mcp] Yield data failed: ${(e as Error).message}`);
    process.exit(1);
  }

  // 2. Fetch agent-specific data
  console.log(`[mcp] Fetching agent data for ${agentAddress}...`);
  let agentData: AgentInfo;
  try {
    agentData = JSON.parse(await mcpCall("clicks_get_agent_info", { agent_address: agentAddress }));
    console.log(`[mcp] Registered: ${agentData.registered}, Deposited: $${agentData.total_deposited_usdc}, Earned: $${agentData.total_earned_usdc}`);
  } catch (e) {
    console.error(`[mcp] Agent data failed: ${(e as Error).message}`);
    process.exit(1);
  }

  if (!agentData.registered) {
    console.error("[mcp] Agent is not registered with Clicks Protocol. Run quickStart() first.");
    process.exit(1);
  }

  // 3. Build and post
  const post = buildTreasuryPost(yieldData, agentData);
  console.log("\n--- Post ---");
  console.log(post);
  console.log("--- End ---\n");

  const results = await Promise.allSettled([
    postToMoltbook(post, moltbookKey),
    postToOpenClawX(post, openclawxKey),
  ]);

  for (const r of results) {
    if (r.status === "rejected") console.error(`[error] ${r.reason}`);
  }

  const ok = results.filter((r) => r.status === "fulfilled").length;
  console.log(`\n${ok}/2 platforms posted.`);
}

main();
