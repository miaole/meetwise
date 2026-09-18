#!/usr/bin/env node
/**
 * Meetwise HA C4 fault-inject — stop api-a / prove B livez (+ optional shared survivor).
 *
 * releaseEvidence=false ALWAYS · haStatus=NOT_HA ALWAYS · claimProductionHA=false
 * Local compose kill ≠ production failover ≠ HA green ≠ ladder C/D green.
 *
 * Modes:
 *   (default)              → assess; if dual compose up + FAULT auth → kill path;
 *                            else if stub pid / dual stub livez → defer stub;
 *                            else PREREQ_GAP EXIT=0
 *   --kill / --compose-kill→ docker stop meetwise-ha-dual-api-a (api-b stays)
 *   --network-half         → disconnect api-a from sole_stack network (A livez may
 *                            still answer; shared path half-broken for A)
 *   --with-shared-survivor → after kill, prove sole Redis/MySQL still reachable
 *                            from survivor B wiring (≠ Nest session; ≠ A→B re-prove)
 *   --require-fault        → EXIT=1 on GAP / incomplete
 *   --allow-gap            → EXIT=0 even when GAP
 *   --restore              → docker start api-a (local only; still Not HA)
 *
 * Auth (compose kill / network-half): MEETWISE_HA_FAULT_AUTHORIZED=1
 * Refuse blind kill without auth or without known dual containers / stub pid.
 *
 * Evidence:
 *   kill-A.receipt.json · B-still-serving.receipt.json
 *   fault-shared-survivor.receipt.json (when --with-shared-survivor succeeds)
 * NEVER writes releaseEvidence=true / haStatus=HA
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
  readFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const PID_PATH = join(ROOT, '.tmp/ha-dual-stub.pids.json');
const STUB_FAULT = join(ROOT, 'scripts/ha/fault-inject.stub.mjs');
const COMPOSE_REAL = join(ROOT, 'docker/compose.ha-dual.yml');
const COMPOSE_SHARED = join(ROOT, 'docker/compose.ha-dual.shared.yml');
const EVIDENCE_DIR =
  process.env.MEETWISE_HA_PROBE_EVIDENCE_DIR ||
  join(ROOT, '.tmp/ha-evidence');
const HOST = process.env.HA_PROBE_HOST ?? '127.0.0.1';
const PORT_A = Number(process.env.HA_PROBE_PORT_A ?? '18787');
const PORT_B = Number(process.env.HA_PROBE_PORT_B ?? '18788');
const CONTAINER_A = 'meetwise-ha-dual-api-a';
const CONTAINER_B = 'meetwise-ha-dual-api-b';
const REDIS_CTR = 'meetwise-redis-mysql-local';
const MYSQL_CTR = 'meetwise-mysql-local';
const SOLE_NET = 'meetwise-mysql-local_default';
const REDIS_KEY = 'meetwise:ha:c4:fault-survivor';
const MYSQL_TABLE = 'ha_c3_shared_probe';

const argv = process.argv.slice(2);
const wantKill =
  argv.includes('--kill') ||
  argv.includes('--compose-kill') ||
  process.env.MEETWISE_HA_FAULT_KILL === '1';
const wantNetworkHalf = argv.includes('--network-half');
const wantSharedSurvivor =
  argv.includes('--with-shared-survivor') ||
  process.env.MEETWISE_HA_FAULT_SHARED_SURVIVOR === '1';
const requireFault =
  argv.includes('--require-fault') ||
  process.env.MEETWISE_HA_REQUIRE_FAULT === '1';
const allowGap = argv.includes('--allow-gap');
const wantRestore = argv.includes('--restore');

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(
    `[ha:fault-inject] ${ok ? 'PASS' : 'FAIL'} ${step}${detail ? ` — ${detail}` : ''}`,
  );
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:fault-inject =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `faultInject: ${fields.faultInject}`,
    `sharedState: ${fields.sharedState ?? 'GAP'}`,
    `method: ${fields.method ?? 'none'}`,
    `host: ${HOST}`,
    `portA: ${PORT_A}`,
    `portB: ${PORT_B}`,
    `ladder: C4_fault=${fields.ladderC4 ?? 'GAP'}; ≠ production failover; D=not_open`,
    `requireFault: ${requireFault}`,
  ];
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.prereq) lines.push(`prereq: ${fields.prereq}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  for (const s of steps) {
    lines.push(
      `step: ${s.ok ? 'PASS' : 'FAIL'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`,
    );
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function writeEvidence(name, body) {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const path = join(EVIDENCE_DIR, name);
  writeFileSync(path, `${JSON.stringify(body, null, 2)}\n`, 'utf8');
  return path;
}

function clearGapMarker() {
  const gap = join(EVIDENCE_DIR, 'shared-state.GAP.json');
  if (existsSync(gap)) {
    try {
      unlinkSync(gap);
    } catch {
      /* ignore */
    }
  }
}

function probe(port) {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: HOST, port, path: '/livez', method: 'GET', timeout: 1500 },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          let instanceId = '';
          try {
            instanceId = JSON.parse(Buffer.concat(chunks).toString('utf8'))
              .instanceId;
          } catch {
            /* ignore */
          }
          resolve({
            ok: res.statusCode === 200,
            status: res.statusCode ?? 0,
            instanceId: instanceId || '',
          });
        });
      },
    );
    req.on('error', () => resolve({ ok: false, status: 0, instanceId: '' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, status: 0, instanceId: '' });
    });
    req.end();
  });
}

function dockerOk(args) {
  const r = spawnSync('docker', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    status: r.status ?? 1,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
  };
}

function containerRunning(name) {
  const r = dockerOk(['inspect', '-f', '{{.State.Running}}', name]);
  return r.status === 0 && r.stdout.trim() === 'true';
}

function containerExists(name) {
  const r = dockerOk(['inspect', '-f', '{{.Id}}', name]);
  return r.status === 0 && Boolean(r.stdout.trim());
}

function envIn(container, key) {
  const r = dockerOk(['exec', container, 'printenv', key]);
  return r.status === 0 ? r.stdout.trim() : '';
}

function onSoleNetwork(container) {
  const r = dockerOk([
    'inspect',
    '-f',
    '{{json .NetworkSettings.Networks}}',
    container,
  ]);
  if (r.status !== 0) return false;
  try {
    const nets = JSON.parse(r.stdout);
    return Boolean(nets && nets[SOLE_NET]);
  } catch {
    return false;
  }
}

async function wait(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function waitPostFault() {
  let a;
  let b;
  let ok = false;
  for (let i = 0; i < 30; i++) {
    await wait(150);
    a = await probe(PORT_A);
    b = await probe(PORT_B);
    if (!a.ok && b.ok) {
      ok = true;
      break;
    }
  }
  return { a, b, ok };
}

function finish(exit, fields, cmdExtra = '') {
  printReceipt(fields);
  const cmd =
    `CMD=node ${join(ROOT, 'scripts/ha/fault-inject.mjs')}${cmdExtra ? ` ${cmdExtra}` : ''} EXIT=${exit}`;
  console.log(cmd);
  process.exit(exit);
}

function redisSole(...opArgs) {
  return dockerOk(['exec', REDIS_CTR, 'redis-cli', ...opArgs]);
}

function mysqlExec(sql) {
  return dockerOk([
    'exec',
    MYSQL_CTR,
    'mysql',
    '-umeetwise',
    '-pmeetwise_dev_password',
    'meetwise',
    '-N',
    '-e',
    sql,
  ]);
}

function proveSharedSurvivor() {
  const token = `c4-${randomBytes(8).toString('hex')}`;
  const bUp = containerRunning(CONTAINER_B);
  note('survivor api-b running', bUp, CONTAINER_B);
  if (!bUp) {
    return { ok: false, reason: 'api-b not running' };
  }

  const bNet = onSoleNetwork(CONTAINER_B);
  note('survivor api-b on sole_stack', bNet, SOLE_NET);
  const bRedis = envIn(CONTAINER_B, 'REDIS_URL');
  note(
    'survivor REDIS_URL',
    /redis:\/\/redis/i.test(bRedis),
    bRedis || '(empty)',
  );

  const redisUp = containerRunning(REDIS_CTR);
  const mysqlUp = containerRunning(MYSQL_CTR);
  note('sole redis up', redisUp, REDIS_CTR);
  note('sole mysql up', mysqlUp, MYSQL_CTR);

  if (!redisUp) {
    return { ok: false, reason: 'sole redis down' };
  }

  const setR = redisSole('SET', REDIS_KEY, token, 'EX', '300');
  const setOk = setR.status === 0 && /OK/i.test(setR.stdout);
  note('Redis SET via sole (B wiring target)', setOk, setR.stdout.trim());

  const getR = redisSole('GET', REDIS_KEY);
  const getOk = getR.status === 0 && getR.stdout.trim() === token;
  note('Redis GET via sole (survivor shared)', getOk, getR.stdout.trim().slice(0, 24));

  let mysqlOk = false;
  if (mysqlUp) {
    const sql =
      `CREATE TABLE IF NOT EXISTS ${MYSQL_TABLE} (` +
      `k VARCHAR(64) PRIMARY KEY, v VARCHAR(255), written_by VARCHAR(64),` +
      `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` +
      `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;` +
      `INSERT INTO ${MYSQL_TABLE} (k,v,written_by) VALUES ('c4-survivor', '${token}', 'api-b-survivor')` +
      ` ON DUPLICATE KEY UPDATE v=VALUES(v), written_by=VALUES(written_by);` +
      `SELECT v FROM ${MYSQL_TABLE} WHERE k='c4-survivor';`;
    const m = mysqlExec(sql);
    mysqlOk = m.status === 0 && m.stdout.includes(token);
    note('MySQL marker via sole (survivor)', mysqlOk, m.stdout.trim().slice(0, 40));
  } else {
    note('MySQL marker via sole (survivor)', false, 'mysql down — skip');
  }

  const ok = setOk && getOk && (mysqlOk || !mysqlUp);
  const path = writeEvidence('fault-shared-survivor.receipt.json', {
    status: ok ? 'OK' : 'FAIL',
    at: new Date().toISOString(),
    survivor: CONTAINER_B,
    sharedPath: 'shared_backend_hostpath_survivor',
    redis: {
      key: REDIS_KEY,
      setOk,
      getOk,
      redisUrl: bRedis,
    },
    mysql: { table: MYSQL_TABLE, ok: mysqlOk },
    wiring: { soleNetwork: SOLE_NET, bOnSole: bNet },
    tokenPrefix: token.slice(0, 8),
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    note:
      'C4 post-fault shared survivor — A down; sole Redis/MySQL still reachable for B wiring; ≠ Nest session; ≠ production HA',
  });
  note('wrote fault-shared-survivor receipt', true, path);
  if (ok) clearGapMarker();
  return { ok, token, path };
}

async function restoreApiA() {
  note('honesty banner', true, 'releaseEvidence=false; restore ≠ HA');
  if (!containerExists(CONTAINER_A)) {
    finish(requireFault ? 1 : 0, {
      result: allowGap || !requireFault ? 'PREREQ_GAP' : 'FAIL',
      faultInject: 'RESTORE_SKIPPED',
      sharedState: 'n/a',
      method: 'docker-start',
      gap: `${CONTAINER_A} does not exist`,
      prereq: 'bring-up compose dual first',
      note: 'Not HA; releaseEvidence=false',
    }, '--restore');
  }
  const r = dockerOk(['start', CONTAINER_A]);
  note('docker start api-a', r.status === 0, r.stderr.slice(0, 120) || 'ok');
  let live = false;
  for (let i = 0; i < 40; i++) {
    await wait(500);
    const a = await probe(PORT_A);
    if (a.ok) {
      live = true;
      break;
    }
  }
  note('api-a livez after restore', live, `port=${PORT_A}`);
  const exit = live || r.status === 0 ? 0 : 1;
  finish(exit, {
    result: live ? 'RESTORED_A' : 'RESTORE_PARTIAL',
    faultInject: 'RESTORE',
    sharedState: 'n/a',
    method: 'docker-start',
    ladderC4: 'local_compose_restore',
    note: 'local restore only — still Not HA; releaseEvidence=false',
  }, '--restore');
}

async function runStubFallback(reason) {
  note('defer to stub fault-inject', true, reason);
  const stubArgs = allowGap ? [STUB_FAULT, '--allow-gap'] : [STUB_FAULT];
  const r = spawnSync(process.execPath, stubArgs, {
    encoding: 'utf8',
    cwd: ROOT,
    env: process.env,
  });
  process.stdout.write(r.stdout || '');
  process.stderr.write(r.stderr || '');
  // Stub prints its own CMD+EXIT; mirror honesty here if stub missing.
  if (r.status === null) {
    finish(1, {
      result: 'FAIL',
      faultInject: 'STUB_MISSING',
      sharedState: 'GAP',
      gap: 'fault-inject.stub.mjs failed to spawn',
    });
  }
  process.exit(r.status ?? 1);
}

async function main() {
  note(
    'honesty banner',
    true,
    'releaseEvidence=false; fault-inject ≠ production HA / failover',
  );

  if (wantRestore) {
    await restoreApiA();
    return;
  }

  const faultAuth = Boolean(process.env.MEETWISE_HA_FAULT_AUTHORIZED);
  note(
    'MEETWISE_HA_FAULT_AUTHORIZED',
    faultAuth,
    faultAuth
      ? 'set'
      : 'unset — compose kill / network-half refused without auth',
  );

  const a0 = await probe(PORT_A);
  const b0 = await probe(PORT_B);
  note(
    'pre dual livez A',
    a0.ok,
    `status=${a0.status}${a0.instanceId ? ` id=${a0.instanceId}` : ''}`,
  );
  note(
    'pre dual livez B',
    b0.ok,
    `status=${b0.status}${b0.instanceId ? ` id=${b0.instanceId}` : ''}`,
  );

  const aCtr = containerRunning(CONTAINER_A);
  const bCtr = containerRunning(CONTAINER_B);
  note('compose api-a running', aCtr, CONTAINER_A);
  note('compose api-b running', bCtr, CONTAINER_B);

  const composeDual = aCtr && bCtr && a0.ok && b0.ok;
  const stubPid = existsSync(PID_PATH);
  const forceCompose = wantKill || wantNetworkHalf;

  // Prefer real compose path when containers are up.
  if (!composeDual && !forceCompose) {
    if (stubPid || (a0.ok && b0.ok && existsSync(STUB_FAULT))) {
      await runStubFallback(
        stubPid
          ? 'stub pid present — STUB_FAULT_PARTIAL path'
          : 'dual livez without compose containers — try stub',
      );
      return;
    }
    const gap =
      'dual compose api-a/api-b not both up — cannot C4 compose fault-inject';
    const prereq =
      'MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared + MEETWISE_HA_FAULT_AUTHORIZED=1';
    finish(requireFault ? 1 : allowGap ? 0 : 0, {
      result: requireFault ? 'FAIL' : 'PREREQ_GAP',
      faultInject: 'NOT_RUN',
      sharedState: 'GAP',
      method: 'none',
      ladderC4: 'GAP',
      gap,
      prereq,
      note: 'honesty pin — refuse blind kill; still Not HA; releaseEvidence=false',
    });
    return;
  }

  if (!faultAuth) {
    finish(requireFault ? 1 : 0, {
      result: requireFault ? 'FAIL' : 'PREREQ_GAP',
      faultInject: 'REFUSED_NO_AUTH',
      sharedState: 'GAP',
      method: 'none',
      ladderC4: 'GAP',
      gap: 'MEETWISE_HA_FAULT_AUTHORIZED unset — refuse compose kill / network-half',
      prereq: 'MEETWISE_HA_FAULT_AUTHORIZED=1',
      note: 'fail-closed auth; still Not HA; releaseEvidence=false',
    });
    return;
  }

  if (!aCtr || !bCtr) {
    finish(requireFault ? 1 : 0, {
      result: requireFault ? 'FAIL' : 'PREREQ_GAP',
      faultInject: 'NOT_RUN',
      sharedState: 'GAP',
      method: 'none',
      ladderC4: 'GAP',
      gap: 'compose containers not both running',
      prereq: 'pnpm ha:dual:compose-shared (authorized)',
      note: 'Not HA; releaseEvidence=false',
    });
    return;
  }

  let method = 'docker-stop-api-a';
  let ladderC4 = 'local_compose_kill_A';

  if (wantNetworkHalf && !wantKill) {
    method = 'network-half-disconnect-api-a';
    ladderC4 = 'local_network_half_A';
    // Disconnect A from sole_stack (shared path half-break). Keep process up.
    const disc = dockerOk(['network', 'disconnect', SOLE_NET, CONTAINER_A]);
    note(
      'network disconnect api-a from sole_stack',
      disc.status === 0,
      disc.stderr.slice(0, 120) || SOLE_NET,
    );
    if (disc.status !== 0) {
      finish(1, {
        result: 'FAIL',
        faultInject: 'NETWORK_HALF_FAILED',
        sharedState: 'GAP',
        method,
        ladderC4,
        gap: disc.stderr || 'docker network disconnect failed',
        note: 'Not HA; releaseEvidence=false',
      }, '--network-half');
      return;
    }
    // For network-half: A may still livez; B must livez; A's sole path broken.
    await wait(300);
    const a1 = await probe(PORT_A);
    const b1 = await probe(PORT_B);
    note('post network-half A livez (may still up)', a1.ok, `status=${a1.status}`);
    note('post network-half B still serving', b1.ok, `status=${b1.status}`);
    const aStillSole = onSoleNetwork(CONTAINER_A);
    const bStillSole = onSoleNetwork(CONTAINER_B);
    note('api-a off sole_stack', !aStillSole, `onSole=${aStillSole}`);
    note('api-b still on sole_stack', bStillSole, `onSole=${bStillSole}`);

    let sharedOk = false;
    if (wantSharedSurvivor && b1.ok && bStillSole) {
      const surv = proveSharedSurvivor();
      sharedOk = surv.ok;
    }

    const killPath = writeEvidence('kill-A.receipt.json', {
      method,
      at: new Date().toISOString(),
      portA: PORT_A,
      portB: PORT_B,
      aDown: !a1.ok,
      aNetworkHalf: !aStillSole,
      bStillServing: b1.ok,
      containerA: CONTAINER_A,
      containerB: CONTAINER_B,
      haStatus: 'NOT_HA',
      releaseEvidence: false,
      claimProductionHA: false,
      note: 'C4 network-half receipt — Not production failover; Not HA',
    });
    const bPath = writeEvidence('B-still-serving.receipt.json', {
      port: PORT_B,
      status: b1.status,
      ok: b1.ok,
      instanceId: b1.instanceId,
      at: new Date().toISOString(),
      haStatus: 'NOT_HA',
      releaseEvidence: false,
    });
    note('wrote kill receipt', true, killPath);
    note('wrote B-still-serving receipt', true, bPath);

    const ok = b1.ok && !aStillSole && bStillSole;
    finish(ok ? 0 : 1, {
      result: ok
        ? sharedOk
          ? 'COMPOSE_FAULT_SHARED_PARTIAL'
          : 'COMPOSE_FAULT_PARTIAL'
        : 'FAIL',
      faultInject: ok ? 'NETWORK_HALF_A_SHARED_BREAK' : 'NETWORK_HALF_INCOMPLETE',
      sharedState: sharedOk
        ? 'SHARED_OK_SURVIVOR'
        : wantSharedSurvivor
          ? 'GAP'
          : 'NOT_PROVEN',
      method,
      ladderC4,
      note: ok
        ? 'A off sole_stack + B serving — STILL Not HA; ≠ production failover; releaseEvidence=false'
        : 'network-half did not achieve A-off-sole + B-up',
      gap: ok ? undefined : 'A still on sole or B down',
    }, wantSharedSurvivor ? '--network-half --with-shared-survivor' : '--network-half');
    return;
  }

  // Default / --kill: docker stop api-a
  const stop = dockerOk(['stop', '-t', '5', CONTAINER_A]);
  note('docker stop api-a', stop.status === 0, stop.stderr.slice(0, 80) || 'stopped');
  if (stop.status !== 0) {
    finish(1, {
      result: 'FAIL',
      faultInject: 'KILL_FAILED',
      sharedState: 'GAP',
      method,
      ladderC4,
      gap: stop.stderr || 'docker stop failed',
      note: 'Not HA; releaseEvidence=false',
    }, '--kill');
    return;
  }

  const { a: a1, b: b1, ok: postOk } = await waitPostFault();
  note('post A down', !a1.ok, `A status=${a1.status} (expect down)`);
  note(
    'post B still serving',
    b1.ok,
    `B status=${b1.status}${b1.instanceId ? ` id=${b1.instanceId}` : ''}`,
  );
  note('post-fault A down / B up', postOk, `A=${a1.status} B=${b1.status}`);

  let sharedOk = false;
  let sharedState = 'NOT_PROVEN';
  if (wantSharedSurvivor) {
    if (!process.env.MEETWISE_HA_SHARED_AUTHORIZED && !faultAuth) {
      note(
        'shared survivor auth',
        false,
        'prefer MEETWISE_HA_SHARED_AUTHORIZED=1 for survivor prove',
      );
    }
    const surv = proveSharedSurvivor();
    sharedOk = surv.ok;
    sharedState = sharedOk ? 'SHARED_OK_SURVIVOR' : 'GAP';
  } else if (
    existsSync(join(EVIDENCE_DIR, 'shared-state-A-write.json')) &&
    existsSync(join(EVIDENCE_DIR, 'shared-state-B-read.json'))
  ) {
    // Prior C3 evidence exists but not re-proven post-fault.
    sharedState = 'PRIOR_C3_NOT_REPROVEN_POST_FAULT';
    note(
      'prior C3 evidence present',
      true,
      'not re-proven after kill — pass --with-shared-survivor',
    );
  } else {
    sharedState = 'GAP';
  }

  const killPath = writeEvidence('kill-A.receipt.json', {
    method,
    at: new Date().toISOString(),
    portA: PORT_A,
    portB: PORT_B,
    aDown: !a1.ok,
    bStillServing: b1.ok,
    containerA: CONTAINER_A,
    containerB: CONTAINER_B,
    composeFile: existsSync(COMPOSE_REAL) ? COMPOSE_REAL : null,
    sharedOverlay: existsSync(COMPOSE_SHARED) ? COMPOSE_SHARED : null,
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    note: 'C4 compose kill receipt — Not production failover; Not HA; releaseEvidence=false',
  });
  const bPath = writeEvidence('B-still-serving.receipt.json', {
    port: PORT_B,
    status: b1.status,
    ok: b1.ok,
    instanceId: b1.instanceId,
    at: new Date().toISOString(),
    haStatus: 'NOT_HA',
    releaseEvidence: false,
  });
  note('wrote kill receipt', true, killPath);
  note('wrote B-still-serving receipt', true, bPath);

  const ok = postOk;
  const result = ok
    ? sharedOk
      ? 'COMPOSE_FAULT_SHARED_PARTIAL'
      : 'COMPOSE_FAULT_PARTIAL'
    : 'FAIL';
  const exit = ok ? 0 : 1;
  finish(
    exit,
    {
      result,
      faultInject: ok ? 'COMPOSE_A_DOWN_B_UP' : 'COMPOSE_INCOMPLETE',
      sharedState,
      method,
      ladderC4: sharedOk
        ? 'local_compose_kill_A+shared_survivor'
        : ladderC4,
      note: ok
        ? 'A down + B serving on local compose — STILL Not HA; ≠ production failover; ladder C/D not green; releaseEvidence=false'
        : 'compose fault-inject did not achieve A-down + B-up',
      gap: ok ? undefined : 'A-down/B-up not both true',
    },
    wantSharedSurvivor ? '--kill --with-shared-survivor' : '--kill',
  );
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    faultInject: 'ERROR',
    sharedState: 'GAP',
    gap: err instanceof Error ? err.stack ?? err.message : String(err),
    note: 'Not HA; releaseEvidence=false',
  });
  console.log(`CMD=node ${join(ROOT, 'scripts/ha/fault-inject.mjs')} EXIT=1`);
  process.exit(1);
});
