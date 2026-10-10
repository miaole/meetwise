#!/usr/bin/env node
/**
 * Meetwise HA Nest business-session prove — sticky-truth A write → B read.
 *
 * releaseEvidence=false ALWAYS · haStatus=NOT_HA ALWAYS · claimProductionHA=false
 *
 * Default / without Nest PG overlay:
 *   - Nest auth/session authority is PostgreSQL (@meetwise/db createPool;
 *     gateway_auth_signup / gateway_auth_login; PrincipalGuard user_account).
 *   - Sole stack for HA dual shared overlay is MySQL + Redis only — not Nest PG.
 *   - compose.ha-dual.yml DATABASE_URL is a postgres placeholder (127.0.0.1:1)
 *     so the process can listen for /livez; it is NOT a real DB for session.
 *   - C3 SHARED_OK (Redis hostpath / MySQL marker) ≠ Nest auth/interview session.
 *   → PREREQ_GAP · nestSessionOk=false
 *
 * Authorized Nest PG path (local only; still Not HA):
 *   docker/compose.ha-dual.pg.yml + ha:prepare:nest-pg + bring-up --compose-pg
 *   --prove → POST /auth/signup on A → GET /profile on B with Bearer
 *   On success: nestSessionOk=true + nest-session.OK.json
 *   STILL releaseEvidence=false · haStatus=NOT_HA · ≠ production HA · ≠ ladder C/D green
 *
 * Modes:
 *   (default)           → assess static + optional live probes; GAP EXIT=0 if unproven
 *   --probe             → hit dual /livez + /readyz/api + /auth/login if ports up
 *   --prove             → attempt A→B sticky session (requires Nest PG dual up)
 *   --require-session   → EXIT=1 unless nestSessionOk=true (fail-closed)
 *   --allow-gap         → EXIT=0 even when require-session would fail
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  unlinkSync,
} from 'node:fs';
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const EVIDENCE_DIR =
  process.env.MEETWISE_HA_PROBE_EVIDENCE_DIR ||
  join(ROOT, '.tmp/ha-evidence');
const HOST = process.env.HA_PROBE_HOST ?? '127.0.0.1';
const PORT_A = Number(process.env.HA_PROBE_PORT_A ?? '18787');
const PORT_B = Number(process.env.HA_PROBE_PORT_B ?? '18788');

const argv = process.argv.slice(2);
const wantProbe = argv.includes('--probe');
const wantProve = argv.includes('--prove');
const requireSession =
  argv.includes('--require-session') ||
  process.env.MEETWISE_HA_REQUIRE_SESSION === '1';
const allowGap = argv.includes('--allow-gap');

/** @type {{ step: string; ok: boolean; detail?: string }[]} */
const steps = [];

function note(step, ok, detail) {
  steps.push({ step, ok, detail });
  console.error(
    `[ha:prove:nest-session] ${ok ? 'PASS' : 'GAP'} ${step}${detail ? ` — ${detail}` : ''}`,
  );
}

function printReceipt(fields) {
  const lines = [
    '===== RECEIPT ha:prove:nest-session =====',
    `result: ${fields.result}`,
    `haStatus: NOT_HA`,
    `releaseEvidence: false`,
    `claimProductionHA: false`,
    `nestSessionOk: ${fields.nestSessionOk === true}`,
    `sharedOkPath: ${fields.sharedOkPath ?? 'C3_hostpath_only_if_present'}`,
    `ladder: C3_shared≠Nest_session; nest_session=${fields.nestSessionOk ? 'LOCAL_CLOSED' : 'GAP'}; D=not_open; Not_HA`,
    `requireSession: ${requireSession}`,
    `evidenceDir: ${EVIDENCE_DIR}`,
    `host: ${HOST}`,
    `portA: ${PORT_A}`,
    `portB: ${PORT_B}`,
  ];
  if (fields.gap) lines.push(`gap: ${fields.gap}`);
  if (fields.prereq) lines.push(`prereq: ${fields.prereq}`);
  if (fields.note) lines.push(`note: ${fields.note}`);
  for (const s of steps) {
    lines.push(
      `step: ${s.ok ? 'PASS' : 'GAP'} | ${s.step}${s.detail ? ` | ${s.detail}` : ''}`,
    );
  }
  lines.push('===== END RECEIPT =====');
  console.log(lines.join('\n'));
}

function writeEvidence(name, obj) {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const path = join(EVIDENCE_DIR, name);
  writeFileSync(path, `${JSON.stringify(obj, null, 2)}\n`, 'utf8');
  return path;
}

function request(port, urlPath, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve) => {
    const payload = body == null ? null : Buffer.from(body, 'utf8');
    const req = http.request(
      {
        hostname: HOST,
        port,
        path: urlPath,
        method,
        timeout: 8000,
        headers: {
          ...(payload == null
            ? {}
            : {
                'content-type': 'application/json',
                'content-length': String(payload.length),
              }),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString('utf8'),
          }),
        );
      },
    );
    req.on('error', (err) =>
      resolve({ status: 0, text: err instanceof Error ? err.message : String(err) }),
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, text: 'timeout' });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

function staticAssess() {
  const compose = join(ROOT, 'docker/compose.ha-dual.yml');
  const shared = join(ROOT, 'docker/compose.ha-dual.shared.yml');
  const composePg = join(ROOT, 'docker/compose.ha-dual.pg.yml');
  const principal = join(ROOT, 'packages/db/src/principal.ts');
  const authSvc = join(ROOT, 'apps/api/src/modules/auth/auth.service.ts');
  const guard = join(ROOT, 'apps/api/src/platform/principal.guard.ts');
  const health = join(ROOT, 'apps/api/src/modules/health/health.service.ts');

  note('compose.ha-dual.yml present', existsSync(compose), compose);
  note('compose.ha-dual.shared.yml present', existsSync(shared), shared);
  note(
    'compose.ha-dual.pg.yml present (Nest PG overlay)',
    existsSync(composePg),
    composePg,
  );
  note('packages/db principal present', existsSync(principal), principal);
  note('Nest auth.service present', existsSync(authSvc), authSvc);
  note('PrincipalGuard present', existsSync(guard), guard);

  let placeholderDb = false;
  if (existsSync(compose)) {
    const t = readFileSync(compose, 'utf8');
    placeholderDb =
      /meetwise_ha_dual_placeholder/i.test(t) &&
      /DATABASE_URL:\s*postgresql:\/\//i.test(t);
    note(
      'base DATABASE_URL is postgres placeholder (default /livez-only)',
      placeholderDb,
      placeholderDb
        ? 'compose.ha-dual.yml keeps placeholder @127.0.0.1:1; PG overlay may override'
        : 'compose missing placeholder pin — unexpected',
    );
    note(
      'compose honesty Not HA',
      /releaseEvidence=false|Not HA/i.test(t),
      'compose must stay Not HA',
    );
  }

  let pgOverlayRealDb = false;
  let pgOverlayAuthSecret = false;
  if (existsSync(composePg)) {
    const t = readFileSync(composePg, 'utf8');
    pgOverlayRealDb =
      /meetwise_ha_runtime:.*@(postgres|host\.docker\.internal)/i.test(t);
    pgOverlayAuthSecret = /AUTH_SECRET:\s*meetwise-ha-dual-nest-session/i.test(t);
    note(
      'PG overlay wires real Nest DATABASE_URL + AUTH_SECRET',
      pgOverlayRealDb && pgOverlayAuthSecret,
      pgOverlayRealDb && pgOverlayAuthSecret
        ? 'compose.ha-dual.pg.yml overrides placeholder for Nest session path'
        : 'PG overlay incomplete',
    );
    note(
      'PG overlay honesty Not HA',
      /releaseEvidence=false|Not HA/i.test(t),
      'PG overlay must stay Not HA',
    );
  }

  let postgresOnlyPool = false;
  if (existsSync(principal)) {
    const t = readFileSync(principal, 'utf8');
    postgresOnlyPool =
      /protocol !== 'postgres:'/.test(t) ||
      /database_url_protocol/.test(t);
    note(
      'createPool postgres-only',
      postgresOnlyPool,
      'Nest @meetwise/db refuses non-postgres DATABASE_URL',
    );
  }

  let authNeedsPg = false;
  if (existsSync(authSvc)) {
    const t = readFileSync(authSvc, 'utf8');
    authNeedsPg =
      /gateway_auth_signup/.test(t) && /gateway_auth_login/.test(t);
    note(
      'auth signup/login needs gateway_auth_* (Postgres)',
      authNeedsPg,
      'Nest auth cannot issue session against sole MySQL',
    );
  }

  let guardNeedsPg = false;
  if (existsSync(guard)) {
    const t = readFileSync(guard, 'utf8');
    guardNeedsPg = /user_account/.test(t) && /pwd_epoch/.test(t);
    note(
      'PrincipalGuard session revoke needs user_account (Postgres)',
      guardNeedsPg,
      'cross-instance sticky auth still Postgres-authoritative',
    );
  }

  let readyzNeedsDb = false;
  if (existsSync(health)) {
    const t = readFileSync(health, 'utf8');
    readyzNeedsDb = /apiReady/.test(t) && /SELECT 1/.test(t);
    note(
      '/readyz/api requires DB SELECT 1',
      readyzNeedsDb,
      'placeholder DATABASE_URL → readiness degraded; PG overlay → ready',
    );
  }

  const sharedReceiptA = join(EVIDENCE_DIR, 'shared-state-A-write.json');
  const sharedReceiptB = join(EVIDENCE_DIR, 'shared-state-B-read.json');
  const c3Present =
    existsSync(sharedReceiptA) && existsSync(sharedReceiptB);
  let c3SharedOk = false;
  if (c3Present) {
    try {
      const a = JSON.parse(readFileSync(sharedReceiptA, 'utf8'));
      const b = JSON.parse(readFileSync(sharedReceiptB, 'utf8'));
      c3SharedOk = a.status === 'OK' && b.status === 'OK';
      note(
        'C3 shared receipts on disk (≠ Nest session)',
        c3SharedOk,
        `sharedPath=${a.sharedPath ?? '?'} — still not Nest business session`,
      );
    } catch (err) {
      note(
        'C3 shared receipts on disk (≠ Nest session)',
        false,
        err instanceof Error ? err.message : String(err),
      );
    }
  } else {
    note(
      'C3 shared receipts on disk (≠ Nest session)',
      false,
      'shared-state-A-write/B-read missing — orthogonal to Nest session',
    );
  }

  const prepPath = join(EVIDENCE_DIR, 'nest-pg-prepare.json');
  let nestPgPrepared = false;
  if (existsSync(prepPath)) {
    try {
      const p = JSON.parse(readFileSync(prepPath, 'utf8'));
      nestPgPrepared = p.nestPgReady === true || p.status === 'OK';
    } catch {
      nestPgPrepared = false;
    }
  }
  note(
    'nest-pg-prepare receipt',
    nestPgPrepared,
    nestPgPrepared
      ? prepPath
      : 'missing — run MEETWISE_HA_NEST_PG_AUTHORIZED=1 pnpm ha:prepare:nest-pg',
  );

  const prereqParts = [
    'MEETWISE_HA_NEST_PG_AUTHORIZED=1 + ha:prepare:nest-pg (migrate + runtime login)',
    'MEETWISE_HA_DUAL_AUTHORIZED=1 + ha:dual:bring-up -- --compose-pg',
    'AUTH_SECRET shared across dual Nest (compose.ha-dual.pg.yml)',
    'prove path: POST /auth/signup|login on A → Authorization Bearer GET /profile on B',
  ];

  return {
    placeholderDb,
    postgresOnlyPool,
    authNeedsPg,
    guardNeedsPg,
    readyzNeedsDb,
    c3SharedOk,
    nestPgPrepared,
    pgOverlayPresent: existsSync(composePg),
    pgOverlayRealDb,
    pgOverlayAuthSecret,
    prereq: prereqParts.join(' + '),
    gap:
      'Nest business session A→B unproven without Nest PG dual: sole stack=MySQL+Redis; Nest createPool/auth/PrincipalGuard=Postgres; base compose DATABASE_URL=placeholder; C3 SHARED_OK≠Nest session',
  };
}

async function liveProbe(label, port, expectReady = false) {
  const livez = await request(port, '/livez');
  const readyz = await request(port, '/readyz/api');
  const login = await request(
    port,
    '/auth/login',
    'POST',
    JSON.stringify({
      email: 'ha-nest-session-probe@invalid.local',
      password: 'not-a-real-password-for-ha-probe',
    }),
  );

  const liveOk = livez.status === 200;
  const readyzOk = readyz.status === 200;
  const readyzDegraded =
    readyz.status === 503 ||
    readyz.status === 0 ||
    /degraded/i.test(readyz.text);
  let loginIssuedToken = false;
  try {
    const j = JSON.parse(login.text);
    loginIssuedToken = typeof j?.token === 'string' && j.token.length > 0;
  } catch {
    /* ignore */
  }

  note(`livez ${label}`, liveOk, `port=${port} status=${livez.status}`);
  if (expectReady) {
    note(
      `readyz/api ${label} ready (Nest PG path)`,
      readyzOk,
      `port=${port} status=${readyz.status} body=${readyz.text.slice(0, 80)}`,
    );
  } else {
    note(
      `readyz/api ${label} degraded (expected w/ placeholder DB)`,
      readyzDegraded,
      `port=${port} status=${readyz.status} body=${readyz.text.slice(0, 80)}`,
    );
    note(
      `auth/login ${label} did not issue token (expected w/ placeholder)`,
      !loginIssuedToken,
      `port=${port} status=${login.status} body=${login.text.slice(0, 100)}`,
    );
  }

  writeEvidence(
    label === 'A' ? 'nest-session-A-probe.json' : 'nest-session-B-probe.json',
    {
      status: expectReady && readyzOk ? 'PG_PATH' : 'GAP',
      at: new Date().toISOString(),
      via: label,
      port,
      livez: { status: livez.status, ok: liveOk },
      readyz: {
        status: readyz.status,
        ok: readyzOk,
        degraded: readyzDegraded,
        bodyPrefix: readyz.text.slice(0, 120),
      },
      authLogin: {
        status: login.status,
        issuedToken: loginIssuedToken,
        bodyPrefix: login.text.slice(0, 120),
      },
      nestSessionOk: false,
      haStatus: 'NOT_HA',
      releaseEvidence: false,
      claimProductionHA: false,
      note: expectReady
        ? 'Live Nest PG probe — readyz may be 200; sticky A→B still needs --prove'
        : 'Live Nest probe — /livez may be 200; placeholder DB cannot prove A→B Nest session',
    },
  );
  return { liveOk, readyzOk, readyzDegraded, loginIssuedToken };
}

async function proveSticky(assessed) {
  const expectPg =
    assessed.nestPgPrepared &&
    assessed.pgOverlayPresent &&
    assessed.pgOverlayRealDb;

  const aReady = await liveProbe('A', PORT_A, expectPg);
  const bReady = await liveProbe('B', PORT_B, expectPg);
  note(
    'dual Nest /livez both up for prove',
    aReady.liveOk && bReady.liveOk,
    aReady.liveOk && bReady.liveOk
      ? 'ports up'
      : 'bring-up --compose-pg first',
  );

  if (!(aReady.liveOk && bReady.liveOk)) {
    return {
      nestSessionOk: false,
      gap: 'dual Nest /livez not both up — cannot prove sticky session',
    };
  }

  if (!(aReady.readyzOk && bReady.readyzOk)) {
    note(
      'dual /readyz/api ready for Nest session',
      false,
      'readyz not 200 — Nest PG overlay/migrate missing or DATABASE_URL still placeholder',
    );
    return {
      nestSessionOk: false,
      gap: 'dual /readyz/api not ready — Nest PG path incomplete (placeholder or unmigrated)',
    };
  }

  const suffix = randomBytes(6).toString('hex');
  const email = `ha-nest-session-${suffix}@meetwise.local`;
  const password = `HaNestSess1!${suffix}`;

  const signup = await request(
    PORT_A,
    '/auth/signup',
    'POST',
    JSON.stringify({ email, password, role: 'candidate' }),
  );
  let token = null;
  let userId = null;
  try {
    const j = JSON.parse(signup.text);
    token = typeof j?.token === 'string' ? j.token : null;
    userId = typeof j?.userId === 'string' ? j.userId : null;
  } catch {
    /* ignore */
  }
  const signupOk = signup.status === 200 && Boolean(token) && Boolean(userId);
  note(
    'signup on A issued token',
    signupOk,
    `status=${signup.status} body=${signup.text.slice(0, 120)}`,
  );
  writeEvidence('nest-session-A-signup.json', {
    status: signupOk ? 'OK' : 'FAIL',
    at: new Date().toISOString(),
    port: PORT_A,
    httpStatus: signup.status,
    issuedToken: Boolean(token),
    userId,
    email,
    bodyPrefix: signup.text.slice(0, 160),
    haStatus: 'NOT_HA',
    releaseEvidence: false,
  });

  if (!signupOk) {
    return {
      nestSessionOk: false,
      gap: `signup on A failed status=${signup.status} — Nest PG auth path not usable`,
    };
  }

  const profileB = await request(PORT_B, '/profile', 'GET', null, {
    authorization: `Bearer ${token}`,
  });
  let profileId = null;
  let profileEmail = null;
  try {
    const j = JSON.parse(profileB.text);
    profileId = j?.id ?? null;
    profileEmail = j?.email ?? null;
  } catch {
    /* ignore */
  }
  const stickyOk =
    profileB.status === 200 &&
    profileId === userId &&
    profileEmail === email;
  note(
    'Bearer from A accepted on B GET /profile (sticky)',
    stickyOk,
    `status=${profileB.status} idMatch=${profileId === userId} emailMatch=${profileEmail === email} body=${profileB.text.slice(0, 120)}`,
  );
  writeEvidence('nest-session-B-profile.json', {
    status: stickyOk ? 'OK' : 'FAIL',
    at: new Date().toISOString(),
    port: PORT_B,
    httpStatus: profileB.status,
    expectedUserId: userId,
    gotUserId: profileId,
    expectedEmail: email,
    gotEmail: profileEmail,
    bodyPrefix: profileB.text.slice(0, 160),
    haStatus: 'NOT_HA',
    releaseEvidence: false,
  });

  // Also prove login on A → profile on B (second path).
  const login = await request(
    PORT_A,
    '/auth/login',
    'POST',
    JSON.stringify({ email, password }),
  );
  let loginToken = null;
  try {
    const j = JSON.parse(login.text);
    loginToken = typeof j?.token === 'string' ? j.token : null;
  } catch {
    /* ignore */
  }
  const loginOk = login.status === 200 && Boolean(loginToken);
  note(
    'login on A issued token',
    loginOk,
    `status=${login.status}`,
  );
  let loginSticky = false;
  if (loginOk) {
    const profileB2 = await request(PORT_B, '/profile', 'GET', null, {
      authorization: `Bearer ${loginToken}`,
    });
    loginSticky = profileB2.status === 200;
    note(
      'login token from A accepted on B',
      loginSticky,
      `status=${profileB2.status}`,
    );
  }

  const nestSessionOk = stickyOk && loginOk && loginSticky;
  if (nestSessionOk) {
    writeEvidence('nest-session.OK.json', {
      status: 'OK',
      at: new Date().toISOString(),
      nestSessionOk: true,
      path: 'A_signup_token→B_profile + A_login_token→B_profile',
      userId,
      email,
      portA: PORT_A,
      portB: PORT_B,
      haStatus: 'NOT_HA',
      releaseEvidence: false,
      claimProductionHA: false,
      note:
        'LOCAL Nest session sticky proven via shared Postgres + AUTH_SECRET — STILL Not HA; ≠ production HA; ≠ ladder C/D green; releaseEvidence=false',
    });
    const gapPath = join(EVIDENCE_DIR, 'nest-session.GAP.json');
    if (existsSync(gapPath)) {
      try {
        unlinkSync(gapPath);
      } catch {
        /* ignore */
      }
    }
    note('wrote nest-session.OK.json (removed GAP marker)', true, EVIDENCE_DIR);
  }

  return {
    nestSessionOk,
    gap: nestSessionOk
      ? undefined
      : 'A→B sticky prove incomplete (signup/login/profile mismatch)',
    userId,
    email,
  };
}

async function main() {
  note(
    'honesty banner',
    true,
    'releaseEvidence=false; haStatus=NOT_HA; Nest session prove ≠ C3 SHARED_OK; ≠ production HA',
  );

  const assessed = staticAssess();
  let nestSessionOk = false;
  let dualProbed = false;
  let aLive = false;
  let bLive = false;
  let proveGap = assessed.gap;

  if (wantProve) {
    const proved = await proveSticky(assessed);
    nestSessionOk = proved.nestSessionOk === true;
    dualProbed = true;
    proveGap = proved.gap ?? assessed.gap;
    aLive = true;
    bLive = true;
  } else if (wantProbe) {
    const a = await liveProbe('A', PORT_A, assessed.nestPgPrepared);
    const b = await liveProbe('B', PORT_B, assessed.nestPgPrepared);
    aLive = a.liveOk;
    bLive = b.liveOk;
    dualProbed = true;
    note(
      'dual Nest /livez both up during probe',
      aLive && bLive,
      aLive && bLive
        ? 'probe only — pass --prove after compose-pg to close local Nest session'
        : 'dual not fully up',
    );
  } else {
    note(
      'live prove/probe skipped',
      true,
      'pass --prove after Nest PG dual to close local sticky session; or --probe for receipts',
    );
  }

  // Prefer on-disk OK receipt if already proven this env (re-assess without re-signup).
  const okPath = join(EVIDENCE_DIR, 'nest-session.OK.json');
  if (!nestSessionOk && existsSync(okPath) && !wantProve) {
    try {
      const ok = JSON.parse(readFileSync(okPath, 'utf8'));
      if (ok.nestSessionOk === true && ok.status === 'OK') {
        nestSessionOk = true;
        note(
          'nest-session.OK.json present (prior local prove)',
          true,
          'reusing local OK receipt — still Not HA; releaseEvidence=false',
        );
      }
    } catch {
      /* ignore */
    }
  }

  if (!nestSessionOk) {
    writeEvidence('nest-session.GAP.json', {
      status: 'GAP',
      at: new Date().toISOString(),
      nestSessionOk: false,
      reason: proveGap,
      prereq: assessed.prereq,
      static: {
        placeholderDb: assessed.placeholderDb,
        postgresOnlyPool: assessed.postgresOnlyPool,
        authNeedsPg: assessed.authNeedsPg,
        guardNeedsPg: assessed.guardNeedsPg,
        readyzNeedsDb: assessed.readyzNeedsDb,
        c3SharedOkPresent: assessed.c3SharedOk,
        nestPgPrepared: assessed.nestPgPrepared,
        pgOverlayPresent: assessed.pgOverlayPresent,
      },
      probed: dualProbed
        ? { portA: PORT_A, portB: PORT_B, livezA: aLive, livezB: bLive }
        : null,
      haStatus: 'NOT_HA',
      releaseEvidence: false,
      claimProductionHA: false,
      note:
        'Nest business session still GAP — do not treat C3 SHARED_OK / dual /livez as session closed',
    });
    note('wrote nest-session.GAP.json', true, join(EVIDENCE_DIR, 'nest-session.GAP.json'));
  }

  printReceipt({
    result: nestSessionOk ? 'NEST_SESSION_LOCAL_OK' : 'PREREQ_GAP',
    nestSessionOk,
    sharedOkPath: assessed.c3SharedOk
      ? 'C3_SHARED_OK_present_but_≠_Nest_session'
      : 'C3_absent_or_not_OK',
    gap: nestSessionOk ? undefined : proveGap,
    prereq: nestSessionOk ? undefined : assessed.prereq,
    note: nestSessionOk
      ? 'LOCAL Nest session sticky closed via Postgres sidecar — STILL Not HA; releaseEvidence=false; ≠ production HA; ≠ ladder C/D green; --require-evidence still fail-closed'
      : 'honest Nest session GAP — need Nest PG dual (--compose-pg) + --prove; sole MySQL+Redis cannot back Nest Postgres auth/session; fail-closed with --require-session; Not HA; releaseEvidence=false',
  });

  const exit =
    requireSession && !nestSessionOk && !allowGap ? 1 : 0;
  const flags = [
    wantProve ? ' --prove' : '',
    wantProbe && !wantProve ? ' --probe' : '',
    requireSession ? ' --require-session' : '',
  ].join('');
  console.log(
    `CMD=node ${join(ROOT, 'scripts/ha/prove-nest-session.mjs')}${flags} EXIT=${exit}`,
  );
  process.exit(exit);
}

main().catch((err) => {
  printReceipt({
    result: 'FAIL',
    nestSessionOk: false,
    gap: err instanceof Error ? err.stack ?? err.message : String(err),
    note: 'Not HA; releaseEvidence=false',
  });
  console.log(
    `CMD=node ${join(ROOT, 'scripts/ha/prove-nest-session.mjs')} EXIT=1`,
  );
  process.exit(1);
});
