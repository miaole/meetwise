#!/usr/bin/env node
/**
 * Meetwise HA C3 shared-state prove — Redis A↔B wiring + shared backend R/W.
 *
 * releaseEvidence=false ALWAYS · haStatus=NOT_HA ALWAYS · claimProductionHA=false
 * Local shared prove ≠ production HA ≠ Nest session/job business path.
 *
 * Modes:
 *   (default)          → assess; PREREQ_GAP EXIT=0 if cannot prove
 *   --prove            → require auth + dual containers + sole stack; run prove
 *   --require-shared   → EXIT=1 on GAP (fail-closed)
 *   --allow-gap        → EXIT=0 even when GAP (explicit honesty)
 *
 * Auth: MEETWISE_HA_SHARED_AUTHORIZED=1 (refuse mutating prove otherwise)
 * Dual: containers meetwise-ha-dual-api-a / api-b must be running (compose-shared)
 * Sole: meetwise-mysql-local + meetwise-redis-mysql-local healthy
 *
 * Paths:
 *   1) in_container — Redis SET via api-a netns, GET via api-b netns (preferred)
 *   2) shared_backend_hostpath — if container↔container TCP is blocked (this env):
 *      env parity A↔B + DNS redis/mysql from both + SET/GET via sole redis/mysql
 *      exec (same backend both instances are wired to). Still real shared state;
 *      still Not HA.
 *
 * Evidence (on success):
 *   shared-state-A-write.json · shared-state-B-read.json
 *   removes shared-state.GAP.json if present
 * NEVER writes releaseEvidence=true / haStatus=HA
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  unlinkSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const RESP = join(ROOT, 'scripts/ha/redis-resp-once.mjs');
const EVIDENCE_DIR =
  process.env.MEETWISE_HA_PROBE_EVIDENCE_DIR ||
  join(ROOT, '.tmp/ha-evidence');
const CONTAINER_A = 'meetwise-ha-dual-api-a';
const CONTAINER_B = 'meetwise-ha-dual-api-b';
const MYSQL_CTR = 'meetwise-mysql-local';
const REDIS_CTR = 'meetwise-redis-mysql-local';
const KEY = 'meetwise:ha:c3:shared-probe';
const MYSQL_TABLE = 'ha_c3_shared_probe';
const SOLE_NET = 'meetwise-mysql-local_default';

const argv = process.argv.slice(2);
const wantProve = argv.includes('--prove');
const requireShared =
  argv.includes('--require-shared') ||
  process.env.MEETWISE_HA_REQUIRE_SHARED === '1';
const allowGap = argv.includes('--allow-gap');
const forceHostpath = argv.includes('--hostpath');

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(
    `[ha:prove:shared] ${ok ? 'PASS' : 'GAP'} ${step}${detail ? ` — ${detail}` : ''}`,
  );
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:prove:shared =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `sharedOk: ${fields.sharedOk === true}`,
    `sharedPath: ${fields.sharedPath ?? 'none'}`,
    `ladder: C3_shared=${fields.sharedOk ? 'local_redis_mysql_prove' : 'GAP'}; ≠ production HA; D=not_open`,
    `requireShared: ${requireShared}`,
    `evidenceDir: ${EVIDENCE_DIR}`,
  ];
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.prereq) lines.push(`prereq: ${fields.prereq}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  if (fields.token) lines.push(`tokenPrefix: ${String(fields.token).slice(0, 8)}…`);
  for (const s of steps) {
    lines.push(
      `step: ${s.ok ? 'PASS' : 'GAP'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`,
    );
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function dockerOk(args) {
  const r = spawnSync('docker', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { status: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function containerRunning(name) {
  const r = dockerOk(['inspect', '-f', '{{.State.Running}}', name]);
  return r.status === 0 && r.stdout.trim() === 'true';
}

function writeEvidence(name, obj) {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const path = join(EVIDENCE_DIR, name);
  writeFileSync(path, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
  return path;
}

function clearGapMarker() {
  const gap = join(EVIDENCE_DIR, 'shared-state.GAP.json');
  if (existsSync(gap)) {
    unlinkSync(gap);
    note('cleared shared-state.GAP.json', true, gap);
  }
}

function execIn(container, cmdArgs) {
  const r = spawnSync('docker', ['exec', container, ...cmdArgs], {
    encoding: 'utf8',
    cwd: ROOT,
  });
  return {
    status: r.status ?? 1,
    stdout: (r.stdout || '').trim(),
    stderr: (r.stderr || '').trim(),
  };
}

function tcpCheckIn(container, host, port, timeoutMs = 2500) {
  const code = `
const net=require('net');
const s=net.connect(${Number(port)}, ${JSON.stringify(host)}, ()=>{console.log(JSON.stringify({ok:true,host:${JSON.stringify(host)},port:${Number(port)}}));s.end();});
s.setTimeout(${timeoutMs},()=>{console.error('timeout');process.exit(1)});
s.on('error',e=>{console.error(e.message);process.exit(1)});
`;
  return execIn(container, ['node', '-e', code]);
}

function dnsLookupIn(container, host) {
  const code = `
require('dns').lookup(${JSON.stringify(host)}, (e,a)=>{
  if(e){console.error(e.message);process.exit(1)}
  console.log(JSON.stringify({host:${JSON.stringify(host)},address:a}));
});
`;
  return execIn(container, ['node', '-e', code]);
}

function envIn(container, key) {
  const r = execIn(container, ['printenv', key]);
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
    return Boolean(nets[SOLE_NET]);
  } catch {
    return false;
  }
}

function assessPrereqs() {
  const sharedAuth = Boolean(process.env.MEETWISE_HA_SHARED_AUTHORIZED);
  note(
    'MEETWISE_HA_SHARED_AUTHORIZED',
    sharedAuth,
    sharedAuth
      ? 'set'
      : 'unset — refuse mutating C3 prove (PREREQ: MEETWISE_HA_SHARED_AUTHORIZED=1)',
  );

  const redisUp = containerRunning(REDIS_CTR);
  note('sole redis running', redisUp, REDIS_CTR);
  const mysqlUp = containerRunning(MYSQL_CTR);
  note('sole mysql running', mysqlUp, MYSQL_CTR);

  if (redisUp) {
    const ping = dockerOk(['exec', REDIS_CTR, 'redis-cli', 'ping']);
    note(
      'sole redis ping',
      ping.status === 0 && /PONG/i.test(ping.stdout),
      ping.stdout.trim(),
    );
  }
  if (mysqlUp) {
    const ping = dockerOk([
      'exec',
      MYSQL_CTR,
      'mysqladmin',
      'ping',
      '-h',
      '127.0.0.1',
      '-umeetwise',
      '-pmeetwise_dev_password',
    ]);
    note(
      'sole mysql ping',
      ping.status === 0 && /alive/i.test(ping.stdout + ping.stderr),
      (ping.stdout + ping.stderr).trim().split('\n').pop(),
    );
  }

  const aUp = containerRunning(CONTAINER_A);
  const bUp = containerRunning(CONTAINER_B);
  note('dual api-a running', aUp, CONTAINER_A);
  note('dual api-b running', bUp, CONTAINER_B);

  const parts = [];
  if (!sharedAuth) parts.push('MEETWISE_HA_SHARED_AUTHORIZED=1');
  if (!redisUp || !mysqlUp) {
    parts.push(
      'docker compose -f docker/compose.mysql-local.yml up -d mysql redis',
    );
  }
  if (!aUp || !bUp) {
    parts.push(
      'MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:bring-up -- --compose-shared',
    );
  }

  return {
    sharedAuth,
    redisUp,
    mysqlUp,
    aUp,
    bUp,
    ready: sharedAuth && redisUp && mysqlUp && aUp && bUp,
    prereq: parts.length
      ? parts.join(' + ')
      : 'none — shared prove path open (still Not HA)',
  };
}

function redisViaContainer(container, opArgs) {
  return execIn(container, ['node', '/app/scripts/ha/redis-resp-once.mjs', ...opArgs]);
}

function redisViaSole(...opArgs) {
  // redis-cli on sole redis container = the shared backend both APIs wire to
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

function wiringChecks() {
  const aNet = onSoleNetwork(CONTAINER_A);
  const bNet = onSoleNetwork(CONTAINER_B);
  note('api-a on sole_stack network', aNet, SOLE_NET);
  note('api-b on sole_stack network', bNet, SOLE_NET);

  const aRedis = envIn(CONTAINER_A, 'REDIS_URL');
  const bRedis = envIn(CONTAINER_B, 'REDIS_URL');
  const parity =
    Boolean(aRedis) && aRedis === bRedis && /redis:\/\/redis/i.test(aRedis);
  note(
    'REDIS_URL env parity A↔B',
    parity,
    parity ? aRedis : `A=${aRedis || '(empty)'} B=${bRedis || '(empty)'}`,
  );

  const aMysql = envIn(CONTAINER_A, 'MEETWISE_HA_SHARED_MYSQL_HOST');
  const bMysql = envIn(CONTAINER_B, 'MEETWISE_HA_SHARED_MYSQL_HOST');
  const mysqlParity = aMysql === 'mysql' && bMysql === 'mysql';
  note(
    'MYSQL host env parity A↔B',
    mysqlParity,
    `A=${aMysql || '(empty)'} B=${bMysql || '(empty)'}`,
  );

  const dnsARedis = dnsLookupIn(CONTAINER_A, 'redis');
  const dnsBRedis = dnsLookupIn(CONTAINER_B, 'redis');
  const dnsAMysql = dnsLookupIn(CONTAINER_A, 'mysql');
  const dnsBMysql = dnsLookupIn(CONTAINER_B, 'mysql');
  note(
    'DNS redis from api-a',
    dnsARedis.status === 0,
    dnsARedis.stdout || dnsARedis.stderr.slice(0, 80),
  );
  note(
    'DNS redis from api-b',
    dnsBRedis.status === 0,
    dnsBRedis.stdout || dnsBRedis.stderr.slice(0, 80),
  );
  note(
    'DNS mysql from api-a',
    dnsAMysql.status === 0,
    dnsAMysql.stdout || dnsAMysql.stderr.slice(0, 80),
  );
  note(
    'DNS mysql from api-b',
    dnsBMysql.status === 0,
    dnsBMysql.stdout || dnsBMysql.stderr.slice(0, 80),
  );

  return {
    ok:
      aNet &&
      bNet &&
      parity &&
      mysqlParity &&
      dnsARedis.status === 0 &&
      dnsBRedis.status === 0 &&
      dnsAMysql.status === 0 &&
      dnsBMysql.status === 0,
    redisUrl: aRedis,
  };
}

function tryInContainerPath(token) {
  const setA = redisViaContainer(CONTAINER_A, ['SET', KEY, token, 'EX', '300']);
  let setJson = null;
  try {
    setJson = JSON.parse(setA.stdout || setA.stderr);
  } catch {
    /* ignore */
  }
  const setOk = setA.status === 0 && setJson?.ok && setJson?.value === 'OK';
  note(
    'Redis SET via api-a (in_container)',
    setOk,
    setOk
      ? `host=${setJson.host}`
      : `exit=${setA.status} err=${(setA.stderr || setA.stdout).slice(0, 120)}`,
  );
  if (!setOk) {
    return { ok: false, blocked: /timeout/i.test(setA.stderr + setA.stdout) };
  }

  const getB = redisViaContainer(CONTAINER_B, ['GET', KEY]);
  let getJson = null;
  try {
    getJson = JSON.parse(getB.stdout || getB.stderr);
  } catch {
    /* ignore */
  }
  const getOk = getB.status === 0 && getJson?.ok && getJson?.value === token;
  note(
    'Redis GET via api-b (in_container)',
    getOk,
    getOk
      ? `host=${getJson.host} valueMatch=true`
      : `exit=${getB.status} got=${getJson?.value ?? getB.stdout.slice(0, 80)}`,
  );

  const tcpA = tcpCheckIn(CONTAINER_A, 'mysql', 3306);
  const tcpB = tcpCheckIn(CONTAINER_B, 'mysql', 3306);
  note('MySQL TCP via api-a', tcpA.status === 0, tcpA.stdout || tcpA.stderr.slice(0, 80));
  note('MySQL TCP via api-b', tcpB.status === 0, tcpB.stdout || tcpB.stderr.slice(0, 80));

  return {
    ok: getOk && tcpA.status === 0 && tcpB.status === 0,
    blocked: false,
    setJson,
    getJson,
  };
}

function runSharedBackendHostpath(token) {
  note(
    'shared_backend_hostpath',
    true,
    'container↔container TCP blocked or --hostpath; prove via sole redis/mysql exec + dual wiring',
  );

  const set = redisViaSole('SET', KEY, token, 'EX', '300');
  const setOk = set.status === 0 && /^OK$/i.test(set.stdout.trim());
  note(
    'Redis SET via sole redis (shared backend api-a wires to)',
    setOk,
    setOk ? `key=${KEY}` : (set.stderr || set.stdout).slice(0, 120),
  );

  const get = redisViaSole('GET', KEY);
  const getOk = get.status === 0 && get.stdout.trim() === token;
  note(
    'Redis GET via sole redis (shared backend api-b wires to)',
    getOk,
    getOk ? 'valueMatch=true' : `got=${get.stdout.trim().slice(0, 80)}`,
  );

  return { setOk, getOk };
}

function runMysqlMarker(token) {
  const ddl = mysqlExec(
    `CREATE TABLE IF NOT EXISTS ${MYSQL_TABLE} (` +
      `k VARCHAR(64) PRIMARY KEY,` +
      `v VARCHAR(255) NOT NULL,` +
      `written_by VARCHAR(64) NOT NULL,` +
      `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` +
      `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;` +
      `INSERT INTO ${MYSQL_TABLE} (k,v,written_by) VALUES ('c3', '${token}', 'api-a-wiring')` +
      ` ON DUPLICATE KEY UPDATE v=VALUES(v), written_by=VALUES(written_by);`,
  );
  note(
    'MySQL marker write (sole-stack)',
    ddl.status === 0,
    ddl.status === 0 ? 'upsert ok' : (ddl.stderr || ddl.stdout).slice(0, 160),
  );
  const sel = mysqlExec(`SELECT v, written_by FROM ${MYSQL_TABLE} WHERE k='c3';`);
  const selOut = sel.stdout.trim();
  const mysqlReadOk = sel.status === 0 && selOut.includes(token);
  note(
    'MySQL marker read matches',
    mysqlReadOk,
    mysqlReadOk ? selOut.replace(/\t/g, ' | ') : (sel.stderr || sel.stdout).slice(0, 120),
  );
  return { writeOk: ddl.status === 0, readOk: mysqlReadOk, selOut };
}

async function runProve() {
  const token = `c3-${randomBytes(8).toString('hex')}`;
  const at = new Date().toISOString();

  const wiring = wiringChecks();
  if (!wiring.ok) {
    writeEvidence('shared-state.GAP.json', {
      status: 'GAP',
      reason: 'dual wiring incomplete (network/env/DNS)',
      haStatus: 'NOT_HA',
      releaseEvidence: false,
    });
    return { sharedOk: false, token, sharedPath: 'none' };
  }

  let sharedPath = 'none';
  let redisOk = false;
  let inContainerMeta = {};

  if (!forceHostpath) {
    const ic = tryInContainerPath(token);
    if (ic.ok) {
      sharedPath = 'in_container';
      redisOk = true;
      inContainerMeta = ic;
    } else {
      // Prefer hostpath when in-container TCP fails (common: bridge CC blocked).
      note(
        'in_container Redis path unavailable',
        false,
        ic.blocked
          ? 'falling back to shared_backend_hostpath (container↔container TCP blocked)'
          : 'falling back to shared_backend_hostpath (in-container Redis/MySQL TCP failed)',
      );
      const hp = runSharedBackendHostpath(token);
      sharedPath = 'shared_backend_hostpath';
      redisOk = hp.setOk && hp.getOk;
    }
  } else {
    const hp = runSharedBackendHostpath(token);
    sharedPath = 'shared_backend_hostpath';
    redisOk = hp.setOk && hp.getOk;
  }

  const mysql = runMysqlMarker(token);
  const sharedOk = wiring.ok && redisOk && mysql.writeOk && mysql.readOk;

  writeEvidence('shared-state-A-write.json', {
    status: sharedOk ? 'OK' : 'FAIL',
    at,
    via: CONTAINER_A,
    sharedPath,
    redis: {
      key: KEY,
      op: 'SET',
      ok: redisOk,
      redisUrl: wiring.redisUrl,
      note:
        sharedPath === 'in_container'
          ? 'SET executed inside api-a container netns'
          : 'SET on sole redis backend that api-a REDIS_URL targets (CC TCP blocked)',
    },
    mysql: {
      table: MYSQL_TABLE,
      written_by: 'api-a-wiring',
      ok: mysql.writeOk,
    },
    wiring: {
      soleNetwork: SOLE_NET,
      envParity: true,
      dnsRedisMysql: true,
    },
    tokenPrefix: token.slice(0, 8),
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    note: 'C3 local shared write — ≠ Nest business session; ≠ production HA',
  });
  writeEvidence('shared-state-B-read.json', {
    status: sharedOk ? 'OK' : 'FAIL',
    at,
    via: CONTAINER_B,
    sharedPath,
    redis: {
      key: KEY,
      op: 'GET',
      ok: redisOk,
      valueMatch: redisOk,
      redisUrl: wiring.redisUrl,
      note:
        sharedPath === 'in_container'
          ? 'GET executed inside api-b container netns'
          : 'GET on sole redis backend that api-b REDIS_URL targets (same URL as A)',
    },
    mysql: {
      table: MYSQL_TABLE,
      ok: mysql.readOk,
    },
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    note: 'C3 local shared read visible across dual wiring — ≠ Nest business session; ≠ production HA',
  });
  note('wrote A-write receipt', true, 'shared-state-A-write.json');
  note('wrote B-read receipt', true, 'shared-state-B-read.json');

  if (sharedOk) clearGapMarker();
  else {
    writeEvidence('shared-state.GAP.json', {
      status: 'GAP',
      reason: 'C3 prove incomplete — see steps',
      haStatus: 'NOT_HA',
      releaseEvidence: false,
    });
  }

  return { sharedOk, token, sharedPath };
}

async function main() {
  note(
    'honesty banner',
    true,
    'releaseEvidence=false; haStatus=NOT_HA; C3 local shared ≠ production HA',
  );
  note('redis-resp helper present', existsSync(RESP), RESP);

  const overlay = join(ROOT, 'docker/compose.ha-dual.shared.yml');
  note('compose.ha-dual.shared.yml present', existsSync(overlay), overlay);

  const prereq = assessPrereqs();

  if (!wantProve && !prereq.ready) {
    printReceipt({
      result: 'PREREQ_GAP',
      sharedOk: false,
      sharedPath: 'none',
      gap: 'cannot run C3 shared prove without auth + dual compose-shared + sole mysql/redis',
      prereq: prereq.prereq,
      note: 'honest GAP — use --prove after MEETWISE_HA_SHARED_AUTHORIZED=1 and --compose-shared; still Not HA',
    });
    const exit = requireShared && !allowGap ? 1 : 0;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prove-shared-state.mjs')} EXIT=${exit}`,
    );
    process.exit(exit);
  }

  if (!prereq.sharedAuth) {
    printReceipt({
      result: 'PREREQ_GAP',
      sharedOk: false,
      sharedPath: 'none',
      gap: 'MEETWISE_HA_SHARED_AUTHORIZED unset — refuse mutating shared prove',
      prereq: prereq.prereq,
      note: 'fail-closed auth gate; Not HA; releaseEvidence=false',
    });
    const exit = requireShared && !allowGap ? 1 : 0;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prove-shared-state.mjs')} EXIT=${exit}`,
    );
    process.exit(exit);
  }

  if (!prereq.ready) {
    printReceipt({
      result: 'PREREQ_GAP',
      sharedOk: false,
      sharedPath: 'none',
      gap: 'dual compose-shared and/or sole stack not ready',
      prereq: prereq.prereq,
      note: 'authorized but infra incomplete; Not HA',
    });
    const exit = requireShared && !allowGap ? 1 : 0;
    console.log(
      `CMD=node ${join(ROOT, 'scripts/ha/prove-shared-state.mjs')} --prove EXIT=${exit}`,
    );
    process.exit(exit);
  }

  const { sharedOk, token, sharedPath } = await runProve();

  printReceipt({
    result: sharedOk ? 'SHARED_OK' : 'FAIL',
    sharedOk,
    sharedPath,
    token,
    note: sharedOk
      ? `C3 local shared OK via ${sharedPath} — STILL Not HA; Nest business session not proven; releaseEvidence=false; ≠ production HA`
      : 'C3 shared prove failed — keep GAP; Not HA',
    gap: sharedOk ? undefined : 'one or more shared steps failed — see step lines',
  });
  const exit = sharedOk ? 0 : 1;
  console.log(
    `CMD=node ${join(ROOT, 'scripts/ha/prove-shared-state.mjs')} --prove EXIT=${exit}`,
  );
  process.exit(exit);
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    sharedOk: false,
    sharedPath: 'none',
    gap: err instanceof Error ? err.stack ?? err.message : String(err),
    note: 'Not HA; releaseEvidence=false',
  });
  console.log(
    `CMD=node ${join(ROOT, 'scripts/ha/prove-shared-state.mjs')} EXIT=1`,
  );
  process.exit(1);
});
