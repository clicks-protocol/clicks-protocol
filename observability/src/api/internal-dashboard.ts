/**
 * Internal Dashboard API
 *
 * Minimal HTTP server that exposes observability data as JSON endpoints.
 * Not for public use. Run locally for internal monitoring.
 *
 * Endpoints:
 *   GET /api/overview          — KPI summary (agents, TVL, payments, fees, APYs)
 *   GET /api/snapshots         — Protocol state snapshot history
 *   GET /api/events            — Recent chain events
 *   GET /api/payments          — Payment event history
 *   GET /api/mcp-usage         — MCP tool usage rollups
 *   GET /api/daily-metrics     — Daily metrics history
 *   GET /api/public/metrics    — Public metrics JSON (safe for embedding)
 *   GET /api/public/proof.txt  — Machine-readable proof for AI agents
 *   GET /widget                — Embeddable proof card (iframe)
 *   GET /proof                 — Proof widget preview page
 *   GET /api/public/simulate   — Treasury simulator (query params: amount, days, yieldPct)
 *   GET /lab                   — Treasury Lab UI
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { getDb, closeDb } from '../storage/sqlite';
import type { DatabaseLike } from '../storage/sqlite';
import { getPublicMetrics, formatProofText } from './public-metrics';
import { simulateTreasury } from '../core/treasury-lab';

const PORT = Number(process.env.DASHBOARD_PORT || 3847);

function jsonResponse(res: http.ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function getOverview(db: DatabaseLike) {
  const agents = db.prepare('SELECT COUNT(*) as c FROM agent_registrations').get() as Record<string, unknown>;
  const payments = db.prepare('SELECT COUNT(*) as c, COALESCE(SUM(CAST(amount_total_usdc AS INTEGER)),0) as vol FROM payment_events').get() as Record<string, unknown>;
  const snap = db.prepare('SELECT * FROM protocol_state_snapshots ORDER BY id DESC LIMIT 1').get() as Record<string, unknown> | undefined;
  const events = db.prepare('SELECT COUNT(*) as c FROM chain_events').get() as Record<string, unknown>;
  const mcpCalls = db.prepare('SELECT COALESCE(SUM(call_count),0) as c FROM mcp_usage_rollups').get() as Record<string, unknown>;

  return {
    totalAgents: Number(agents?.c ?? 0),
    totalPayments: Number(payments?.c ?? 0),
    totalPaymentVolumeUsdc: Number(payments?.vol ?? 0) / 1e6,
    totalChainEvents: Number(events?.c ?? 0),
    totalMcpCalls: Number(mcpCalls?.c ?? 0),
    tvlUsdc: snap ? Number(snap.tvl_usdc) / 1e6 : 0,
    pendingFeesUsdc: snap ? Number(snap.pending_fees_usdc) / 1e6 : 0,
    totalFeesCollectedUsdc: snap ? Number(snap.total_fees_collected_usdc) / 1e6 : 0,
    activeProtocol: snap ? String(snap.active_protocol) : 'none',
    aaveApyPct: snap ? Number(snap.aave_apy_bps) / 100 : 0,
    morphoApyPct: snap ? Number(snap.morpho_apy_bps) / 100 : 0,
    lastSnapshotAt: snap ? String(snap.captured_at) : null,
    lastBlockNumber: snap ? Number(snap.block_number) : null,
  };
}

function getSnapshots(db: DatabaseLike, limit = 50) {
  return db.prepare('SELECT * FROM protocol_state_snapshots ORDER BY id DESC LIMIT ?').all(limit) as unknown[];
}

function getEvents(db: DatabaseLike, limit = 50) {
  return db.prepare('SELECT * FROM chain_events ORDER BY block_number DESC LIMIT ?').all(limit) as unknown[];
}

function getPayments(db: DatabaseLike, limit = 50) {
  return db.prepare('SELECT * FROM payment_events ORDER BY block_number DESC LIMIT ?').all(limit) as unknown[];
}

function getMcpUsage(db: DatabaseLike) {
  return db.prepare('SELECT * FROM mcp_usage_rollups ORDER BY bucket_start DESC').all() as unknown[];
}

function getDailyMetrics(db: DatabaseLike) {
  return db.prepare('SELECT * FROM daily_metrics ORDER BY day DESC').all() as unknown[];
}

function serveStaticFile(res: http.ServerResponse, relativePath: string, contentType = 'text/html'): void {
  const htmlPath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(htmlPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found: ' + relativePath);
    return;
  }
  res.writeHead(200, { 'Content-Type': contentType, 'Access-Control-Allow-Origin': '*' });
  res.end(fs.readFileSync(htmlPath, 'utf8'));
}

function main(): void {
  const db = getDb();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    const pathname = url.pathname;

    try {
      switch (pathname) {
        case '/':
          serveStaticFile(res, '../../ui/internal-dashboard/index.html');
          break;
        case '/api/overview':
          jsonResponse(res, getOverview(db));
          break;
        case '/api/snapshots':
          jsonResponse(res, getSnapshots(db));
          break;
        case '/api/events':
          jsonResponse(res, getEvents(db));
          break;
        case '/api/payments':
          jsonResponse(res, getPayments(db));
          break;
        case '/api/mcp-usage':
          jsonResponse(res, getMcpUsage(db));
          break;
        case '/api/daily-metrics':
          jsonResponse(res, getDailyMetrics(db));
          break;
        case '/api/public/metrics':
          jsonResponse(res, getPublicMetrics(db));
          break;
        case '/api/public/proof.txt': {
          const metrics = getPublicMetrics(db);
          res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          });
          res.end(formatProofText(metrics));
          break;
        }
        case '/widget':
          serveStaticFile(res, '../../ui/proof-widget/embed.html');
          break;
        case '/proof':
          serveStaticFile(res, '../../ui/proof-widget/index.html');
          break;
        case '/api/public/simulate': {
          const amount = Number(url.searchParams.get('amount'));
          const days = Number(url.searchParams.get('days') || '365');
          const yieldPct = Number(url.searchParams.get('yieldPct') || '20');

          if (!url.searchParams.has('amount') || isNaN(amount) || amount < 1 || amount > 100000000) {
            jsonResponse(res, { error: 'amount is required and must be between 1 and 100000000' }, 400);
            break;
          }
          if (isNaN(days) || days < 1 || days > 1825) {
            jsonResponse(res, { error: 'days must be between 1 and 1825' }, 400);
            break;
          }
          if (isNaN(yieldPct) || yieldPct < 5 || yieldPct > 50) {
            jsonResponse(res, { error: 'yieldPct must be between 5 and 50' }, 400);
            break;
          }

          jsonResponse(res, simulateTreasury(db, { amount, periodDays: days, yieldPct }));
          break;
        }
        case '/lab':
          serveStaticFile(res, '../../ui/treasury-lab/index.html');
          break;
        default:
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
      }
    } catch (err) {
      jsonResponse(res, { error: (err as Error).message }, 500);
    }
  });

  const HOST = process.env.DASHBOARD_HOST || '0.0.0.0';
  server.listen(PORT, HOST, () => {
    console.log(`Clicks Internal Dashboard: http://${HOST}:${PORT}`);
    console.log('Internal:  /api/overview, /api/snapshots, /api/events, /api/payments, /api/mcp-usage, /api/daily-metrics');
    console.log('Public:    /api/public/metrics, /api/public/proof.txt, /api/public/simulate, /widget, /proof, /lab');
  });

  process.on('SIGINT', () => {
    server.close();
    closeDb();
    process.exit(0);
  });
}

main();
