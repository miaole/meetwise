#!/usr/bin/env node
/**
 * Meetwise HA dual /livez STUB servers — local C2 probe machinery only.
 *
 * releaseEvidence=false · Not HA · STUB_LIVEZ_ONLY ≠ real Nest API ≠ production HA
 *
 * Starts two minimal HTTP servers answering GET /livez (+ /meta) so the
 * multi-instance probe can exercise dual-port livez when real api-a/api-b
 * cannot be brought up in this environment.
 *
 * Usage:
 *   node scripts/ha/dual-livez-stub.mjs              # foreground dual servers
 *   node scripts/ha/dual-livez-stub.mjs --daemon     # background + pid receipt
 *   node scripts/ha/dual-livez-stub.mjs --stop       # stop daemon if pid file
 *
 * Env: HA_PROBE_HOST, HA_PROBE_PORT_A (18787), HA_PROBE_PORT_B (18788)
 */
import { createServer } from 'node:http';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const PID_PATH = join(ROOT, '.tmp/ha-dual-stub.pids.json');
const HOST = process.env.HA_PROBE_HOST ?? '127.0.0.1';
const PORT_A = Number(process.env.HA_PROBE_PORT_A ?? '18787');
const PORT_B = Number(process.env.HA_PROBE_PORT_B ?? '18788');

const wantStop = process.argv.includes('--stop');
const wantDaemon = process.argv.includes('--daemon');
const bOnly = process.argv.includes('--b-only');
const aOnly = process.argv.includes('--a-only');

function banner() {
  console.error(
    '[ha:dual-livez-stub] releaseEvidence=false · haStatus=NOT_HA · mode=STUB_LIVEZ_ONLY · Not production HA',
  );
}

function makeHandler(instanceId) {
  return (req, res) => {
    const url = (req.url ?? '/').split('?')[0];
    if (req.method === 'GET' && url === '/livez') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', instanceId, mode: 'STUB_LIVEZ_ONLY' }));
      return;
    }
    if (req.method === 'GET' && url === '/meta') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          name: 'meetwise-ha-dual-stub',
          instanceId,
          mode: 'STUB_LIVEZ_ONLY',
          releaseEvidence: false,
          claimProductionHA: false,
        }),
      );
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not_found', mode: 'STUB_LIVEZ_ONLY' }));
  };
}

function listen(port, instanceId) {
  return new Promise((resolve, reject) => {
    const server = createServer(makeHandler(instanceId));
    server.on('error', reject);
    server.listen(port, HOST, () => {
      console.error(`[ha:dual-livez-stub] ${instanceId} listening ${HOST}:${port}`);
      resolve(server);
    });
  });
}

function stopDaemon() {
  banner();
  if (!existsSync(PID_PATH)) {
    console.log('result: STOP_NOOP');
    console.log('haStatus: NOT_HA');
    console.log('releaseEvidence: false');
    console.log('note: no pid file; nothing to stop');
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/dual-livez-stub.mjs')} --stop EXIT=0`);
    process.exit(0);
  }
  const meta = JSON.parse(readFileSync(PID_PATH, 'utf8'));
  const pids = [meta.parentPid, meta.pidA, meta.pidB].filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      /* already gone */
    }
  }
  try {
    unlinkSync(PID_PATH);
  } catch {
    /* ignore */
  }
  console.log('result: STOPPED');
  console.log('haStatus: NOT_HA');
  console.log('releaseEvidence: false');
  console.log(`stoppedPids: ${pids.join(',')}`);
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/dual-livez-stub.mjs')} --stop EXIT=0`);
  process.exit(0);
}

async function runForeground() {
  banner();
  const servers = [];
  if (!bOnly) servers.push(await listen(PORT_A, aOnly || bOnly ? 'api-a-stub' : 'api-a-stub'));
  if (!aOnly) {
    const id = bOnly ? 'api-b-stub-survivor' : 'api-b-stub';
    servers.push(await listen(PORT_B, id));
  }
  const shutdown = () => {
    for (const s of servers) s.close();
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  console.log(bOnly ? 'result: STUB_B_ONLY' : aOnly ? 'result: STUB_A_ONLY' : 'result: STUB_LIVE');
  console.log('haStatus: NOT_HA');
  console.log('releaseEvidence: false');
  console.log('claimProductionHA: false');
  console.log(`portA: ${aOnly || !bOnly ? PORT_A : '(none)'}`);
  console.log(`portB: ${bOnly || !aOnly ? PORT_B : '(none)'}`);
  console.log('mode: STUB_LIVEZ_ONLY');
  console.log('note: stub /livez only — ≠ Nest API · ≠ shared-state · ≠ production HA');
  await new Promise(() => {});
}

function runDaemon() {
  banner();
  mkdirSync(dirname(PID_PATH), { recursive: true });
  const childArgs = [fileURLToPath(import.meta.url)];
  if (bOnly) childArgs.push('--b-only');
  if (aOnly) childArgs.push('--a-only');
  const child = spawn(
    process.execPath,
    childArgs,
    {
      detached: true,
      stdio: 'ignore',
      env: process.env,
      cwd: ROOT,
    },
  );
  child.unref();
  const receipt = {
    parentPid: child.pid,
    portA: PORT_A,
    portB: PORT_B,
    host: HOST,
    mode: bOnly ? 'STUB_LIVEZ_ONLY_B' : aOnly ? 'STUB_LIVEZ_ONLY_A' : 'STUB_LIVEZ_ONLY',
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    startedAt: new Date().toISOString(),
  };
  writeFileSync(PID_PATH, JSON.stringify(receipt, null, 2));
  console.log(bOnly || aOnly ? 'result: STUB_DAEMON_PARTIAL' : 'result: STUB_DAEMON');
  console.log('haStatus: NOT_HA');
  console.log('releaseEvidence: false');
  console.log('claimProductionHA: false');
  console.log(`pidFile: ${PID_PATH}`);
  console.log(`parentPid: ${child.pid}`);
  console.log(`portA: ${PORT_A}`);
  console.log(`portB: ${PORT_B}`);
  console.log('mode: STUB_LIVEZ_ONLY');
  console.log('note: stub daemon — dual /livez only; Not HA; releaseEvidence=false');
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/dual-livez-stub.mjs')} --daemon EXIT=0`);
  process.exit(0);
}

if (wantStop) stopDaemon();
else if (wantDaemon) runDaemon();
else {
  runForeground().catch((err) => {
    console.error(err);
    console.log('haStatus: NOT_HA');
    console.log('releaseEvidence: false');
    console.log(`CMD=node ${join(ROOT, 'scripts/ha/dual-livez-stub.mjs')} EXIT=1`);
    process.exit(1);
  });
}
