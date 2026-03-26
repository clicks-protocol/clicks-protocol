/**
 * Clicks Protocol — HTTP MCP Server (Cloudflare Worker)
 *
 * Read-only MCP endpoint exposing 4 tools + 1 resource over Streamable HTTP.
 * No private keys, no write operations.
 *
 * POST /mcp  — MCP JSON-RPC endpoint (Streamable HTTP transport)
 * GET  /mcp  — SSE endpoint for server-initiated notifications
 * GET  /     — Server info (JSON)
 */

import { Interface, parseUnits, formatUnits } from 'ethers';

// ─── Types ────────────────────────────────────────────────────────────────

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// ─── Contract Config ──────────────────────────────────────────────────────

const RPC_URL = 'https://1rpc.io/base';

const ADDRESSES = {
  registry: '0x23bb0Ea69b2BD2e527D5DbA6093155A6E1D0C0a3',
  feeCollector: '0xc47B162D3c456B6C56a3cE6EE89A828CFd34E6bE',
  yieldRouter: '0x053167a233d18E05Bc65a8d5F3F8808782a3EECD',
  splitter: '0xc96C1a566a8ed7A39040a34927fEe952bAB8Ad1D',
  usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  referral: '0x1E5Ab896D3b3A542C5E91852e221b2D849944ccC',
};

const REGISTRY_ABI = [
  'function isRegistered(address agent) external view returns (bool)',
  'function getOperator(address agent) external view returns (address)',
];

const SPLITTER_ABI = [
  'function simulateSplit(uint256 amount, address agent) external view returns (uint256 liquid, uint256 toYield)',
  'function getYieldPct(address agent) external view returns (uint256)',
];

const YIELD_ROUTER_ABI = [
  'function getBestProtocol() external view returns (uint8)',
  'function getAaveAPY() public view returns (uint256)',
  'function getMorphoAPY() public view returns (uint256)',
  'function getTotalBalance() external view returns (uint256)',
  'function agentDeposited(address agent) external view returns (uint256)',
];

const FEE_ABI = [
  'function pendingFees() external view returns (uint256)',
];

const ERC20_ABI = [
  'function balanceOf(address account) external view returns (uint256)',
];

const REFERRAL_ABI = [
  'function getReferralStats(address agent) external view returns (uint32 directCount, uint256 totalEarned, uint256 claimable, address referrer)',
  'function getReferralChain(address agent) external view returns (address[3])',
  'function getTeamBonusYield(address agent) external view returns (uint16)',
];

// ─── Helpers ──────────────────────────────────────────────────────────────

// Raw eth_call via fetch (Workers-compatible, no ethers provider needed)
async function ethCall(to: string, data: string): Promise<string> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to, data }, 'latest'],
    }),
  });
  const json = (await res.json()) as { result?: string; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result || '0x';
}

// Encode a call using ethers Interface (lightweight, no provider)
function encodeCall(abi: string[], fn: string, args: unknown[]): { iface: Interface; data: string } {
  const iface = new Interface(abi);
  const data = iface.encodeFunctionData(fn, args);
  return { iface, data };
}

// Encode + call + decode in one step
async function callContract(to: string, abi: string[], fn: string, args: unknown[] = []): Promise<unknown[]> {
  const { iface, data } = encodeCall(abi, fn, args);
  const result = await ethCall(to, data);
  return iface.decodeFunctionResult(fn, result).toArray();
}

function fmtUSDC(amount: bigint): string {
  return formatUnits(amount, 6);
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

// ─── MCP Tool Definitions ─────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'clicks_get_agent_info',
    description:
      'Get comprehensive info about an AI agent registered with Clicks Protocol: registration status, operator, deposited principal, yield percentage, and USDC balance.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agent_address: {
          type: 'string',
          description: 'Ethereum address of the AI agent',
        },
      },
      required: ['agent_address'],
    },
  },
  {
    name: 'clicks_simulate_split',
    description:
      'Preview how a USDC payment would be split for an agent: how much goes to wallet (liquid) and how much to DeFi yield.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        amount: {
          type: 'string',
          description: 'Payment amount in USDC (e.g. "100" for 100 USDC)',
        },
        agent_address: {
          type: 'string',
          description: 'Ethereum address of the AI agent',
        },
      },
      required: ['amount', 'agent_address'],
    },
  },
  {
    name: 'clicks_get_yield_info',
    description:
      'Get current yield protocol information: active protocol (Aave or Morpho), APYs, total balance, and total deposited across all agents.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'clicks_get_referral_stats',
    description:
      'Get referral network stats for an agent: direct referrals count, total earned from referrals, claimable rewards, and referral chain.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        agent_address: {
          type: 'string',
          description: 'Ethereum address of the AI agent',
        },
      },
      required: ['agent_address'],
    },
  },
];

// ─── MCP Resource Definition ──────────────────────────────────────────────

const RESOURCE_TEMPLATES: never[] = [];

const RESOURCES = [
  {
    uri: 'clicks://info',
    name: 'Clicks Protocol Info',
    description: 'Overview of how Clicks Protocol works, fees, contracts, and referral system.',
    mimeType: 'text/plain',
  },
];

const PROTOCOL_INFO_TEXT = `Clicks Protocol — Autonomous DeFi Yield for AI Agent Treasuries

How it works:
1. Agent receives USDC payment
2. Clicks auto-splits: 80% to wallet, 20% to DeFi yield (Aave V3 or Morpho)
3. Agent earns 7-10% APY on idle treasury automatically
4. Withdraw anytime, no lockup

Fee: 2% on yield only, never on principal.

Referral: Recruit agents → earn 40% (L1), 20% (L2), 10% (L3) of their protocol fee.

Contracts: Base Mainnet (Chain ID 8453)
- ClicksRegistry: ${ADDRESSES.registry}
- ClicksSplitterV3: ${ADDRESSES.splitter}
- ClicksYieldRouter: ${ADDRESSES.yieldRouter}
- ClicksFee: ${ADDRESSES.feeCollector}
- ClicksReferral: ${ADDRESSES.referral}

SDK: npm install @clicks-protocol/sdk
Docs: https://clicksprotocol.xyz/llms.txt`;

// ─── Tool Execution ───────────────────────────────────────────────────────

async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  switch (name) {
    case 'clicks_get_agent_info': {
      const addr = args.agent_address as string;

      const [[isRegistered], [operator], [deposited], [yieldPct], [balance]] = await Promise.all([
        callContract(ADDRESSES.registry, REGISTRY_ABI, 'isRegistered', [addr]),
        callContract(ADDRESSES.registry, REGISTRY_ABI, 'getOperator', [addr]),
        callContract(ADDRESSES.yieldRouter, YIELD_ROUTER_ABI, 'agentDeposited', [addr]),
        callContract(ADDRESSES.splitter, SPLITTER_ABI, 'getYieldPct', [addr]),
        callContract(ADDRESSES.usdc, ERC20_ABI, 'balanceOf', [addr]),
      ]);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                agent: addr,
                isRegistered,
                operator,
                deposited_usdc: fmtUSDC(deposited as bigint),
                yield_pct: Number(yieldPct),
                wallet_balance_usdc: fmtUSDC(balance as bigint),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case 'clicks_simulate_split': {
      const amount = args.amount as string;
      const addr = args.agent_address as string;
      const amountWei = parseUnits(amount, 6);
      const [liquid, toYield] = await callContract(
        ADDRESSES.splitter, SPLITTER_ABI, 'simulateSplit', [amountWei, addr],
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                payment_usdc: amount,
                liquid_usdc: fmtUSDC(liquid as bigint),
                to_yield_usdc: fmtUSDC(toYield as bigint),
                explanation: `${fmtUSDC(liquid as bigint)} USDC goes to agent wallet immediately, ${fmtUSDC(toYield as bigint)} USDC is routed to DeFi yield.`,
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case 'clicks_get_yield_info': {
      // Some calls may revert (e.g. Morpho not configured), handle gracefully
      async function safeCall(to: string, abi: string[], fn: string, args: unknown[] = []): Promise<unknown> {
        try {
          const result = await callContract(to, abi, fn, args);
          return result[0];
        } catch {
          return null;
        }
      }

      const [bestProtocol, aaveAPY, morphoAPY, totalBalance, pendingFees] =
        await Promise.all([
          safeCall(ADDRESSES.yieldRouter, YIELD_ROUTER_ABI, 'getBestProtocol'),
          safeCall(ADDRESSES.yieldRouter, YIELD_ROUTER_ABI, 'getAaveAPY'),
          safeCall(ADDRESSES.yieldRouter, YIELD_ROUTER_ABI, 'getMorphoAPY'),
          safeCall(ADDRESSES.yieldRouter, YIELD_ROUTER_ABI, 'getTotalBalance'),
          safeCall(ADDRESSES.feeCollector, FEE_ABI, 'pendingFees'),
        ]);

      const protocolNames: Record<number, string> = {
        0: 'None',
        1: 'Aave V3',
        2: 'Morpho',
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                active_protocol: bestProtocol !== null ? (protocolNames[Number(bestProtocol)] || 'Unknown') : 'unavailable',
                aave_apy_bps: aaveAPY !== null ? Number(aaveAPY) : 'unavailable',
                morpho_apy_bps: morphoAPY !== null ? Number(morphoAPY) : 'unavailable',
                total_balance_usdc: totalBalance !== null ? fmtUSDC(totalBalance as bigint) : '0.0',
                pending_fees_usdc: pendingFees !== null ? fmtUSDC(pendingFees as bigint) : '0.0',
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    case 'clicks_get_referral_stats': {
      const addr = args.agent_address as string;

      const [stats, chain, [bonusBps]] = await Promise.all([
        callContract(ADDRESSES.referral, REFERRAL_ABI, 'getReferralStats', [addr]),
        callContract(ADDRESSES.referral, REFERRAL_ABI, 'getReferralChain', [addr]),
        callContract(ADDRESSES.referral, REFERRAL_ABI, 'getTeamBonusYield', [addr]),
      ]);

      // getReferralStats returns (uint32 directCount, uint256 totalEarned, uint256 claimable, address referrer)
      const [directCount, totalEarned, claimable, referrer] = stats;
      // getReferralChain returns address[3]
      const chainArr = chain as unknown[];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                agent: addr,
                direct_referrals: Number(directCount),
                total_earned_usdc: fmtUSDC(totalEarned as bigint),
                claimable_usdc: fmtUSDC(claimable as bigint),
                referred_by: referrer,
                referral_chain: {
                  L1: chainArr[0],
                  L2: chainArr[1],
                  L3: chainArr[2],
                },
                team_bonus_bps: Number(bonusBps),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── MCP JSON-RPC Handler ─────────────────────────────────────────────────

const SERVER_INFO = {
  name: 'clicks-protocol',
  version: '0.1.0',
};

const SERVER_CAPABILITIES = {
  tools: {},
  resources: {},
};

async function handleJsonRpc(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
  const id = request.id ?? null;

  // Notifications (no id) don't get responses
  const isNotification = request.id === undefined;

  switch (request.method) {
    // ── Lifecycle ──────────────────────────────────────────────
    case 'initialize': {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-03-26',
          capabilities: SERVER_CAPABILITIES,
          serverInfo: SERVER_INFO,
        },
      };
    }

    case 'notifications/initialized': {
      // Client ack — no response needed
      return null;
    }

    case 'ping': {
      return { jsonrpc: '2.0', id, result: {} };
    }

    // ── Tools ─────────────────────────────────────────────────
    case 'tools/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS },
      };
    }

    case 'tools/call': {
      const params = request.params as { name: string; arguments?: Record<string, unknown> };
      if (!params?.name) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: 'Missing tool name' },
        };
      }

      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: `Unknown tool: ${params.name}` },
        };
      }

      try {
        const result = await executeTool(params.name, params.arguments || {});
        return { jsonrpc: '2.0', id, result };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: `Error: ${msg}` }],
            isError: true,
          },
        };
      }
    }

    // ── Resources ─────────────────────────────────────────────
    case 'resources/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: { resources: RESOURCES },
      };
    }

    case 'resources/templates/list': {
      return {
        jsonrpc: '2.0',
        id,
        result: { resourceTemplates: RESOURCE_TEMPLATES },
      };
    }

    case 'resources/read': {
      const params = request.params as { uri: string };
      if (params?.uri === 'clicks://info') {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            contents: [
              {
                uri: 'clicks://info',
                mimeType: 'text/plain',
                text: PROTOCOL_INFO_TEXT,
              },
            ],
          },
        };
      }
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32602, message: `Unknown resource: ${params?.uri}` },
      };
    }

    // ── Unknown ───────────────────────────────────────────────
    default: {
      if (isNotification) return null;
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${request.method}` },
      };
    }
  }
}

// ─── Worker Entry Point ───────────────────────────────────────────────────

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // GET / — Server info page
    if (url.pathname === '/' && request.method === 'GET') {
      return jsonResponse({
        name: SERVER_INFO.name,
        version: SERVER_INFO.version,
        description: 'Clicks Protocol MCP Server — Read-only tools for querying AI agent yield data on Base.',
        mcp_endpoint: '/mcp',
        transport: 'Streamable HTTP (POST /mcp)',
        tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
        resources: RESOURCES.map((r) => ({ uri: r.uri, name: r.name })),
        docs: 'https://clicksprotocol.xyz/llms.txt',
        source: 'https://github.com/clicks-protocol/clicks-protocol',
      });
    }

    // GET /mcp — SSE stream for server-initiated messages (kept open, no messages for now)
    if (url.pathname === '/mcp' && request.method === 'GET') {
      const accept = request.headers.get('Accept') || '';
      if (accept.includes('text/event-stream')) {
        // Open an SSE stream. For a stateless worker we just send a comment and keep alive.
        // Real sessions would track state; this satisfies the transport spec.
        const body = new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(': connected\n\n'));
            // Worker will close when client disconnects
          },
        });
        return new Response(body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            ...corsHeaders(),
          },
        });
      }
      // Non-SSE GET on /mcp — return info
      return jsonResponse({
        message: 'MCP endpoint. Use POST with JSON-RPC body, or GET with Accept: text/event-stream for SSE.',
      });
    }

    // POST /mcp — MCP JSON-RPC handler
    if (url.pathname === '/mcp' && request.method === 'POST') {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return jsonResponse(
          { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
          400,
        );
      }

      // Handle batch requests
      if (Array.isArray(body)) {
        const responses: JsonRpcResponse[] = [];
        for (const req of body as JsonRpcRequest[]) {
          const res = await handleJsonRpc(req);
          if (res) responses.push(res);
        }
        if (responses.length === 0) {
          return new Response(null, { status: 204, headers: corsHeaders() });
        }
        return jsonResponse(responses);
      }

      // Single request
      const rpcRequest = body as JsonRpcRequest;
      if (!rpcRequest.jsonrpc || rpcRequest.jsonrpc !== '2.0' || !rpcRequest.method) {
        return jsonResponse(
          { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request' } },
          400,
        );
      }

      const response = await handleJsonRpc(rpcRequest);
      if (!response) {
        // Notification processed, no response
        return new Response(null, { status: 204, headers: corsHeaders() });
      }

      return jsonResponse(response);
    }

    // 404 for everything else
    return jsonResponse({ error: 'Not found' }, 404);
  },
} satisfies ExportedHandler;
