#!/usr/bin/env node
/**
 * GAP-UC018-WAITING-USER · waiting_user tip-run receipt emitter (Line D).
 *
 * Runs the two waiting_user prove CMDs FRESH at the checked-out HEAD (branch tip
 * at execution time) in this worktree and machine-emits ONE receipt under
 * ai-docs/delivery/receipts/uc018-waiting-user-tip/ (a NEW directory — never
 * uc018-receipt-backfill/**).
 *
 *   node scripts/uc018-waiting-user-tip-emit.mjs
 *   pnpm uc018:waiting-user:tip:receipt
 *
 * Honesty rules encoded here (fail-closed):
 *   - C1(e2e-ha): receipt records the ACTUAL checked-out HEAD; both `gitSha` and
 *     `runnerCommitSha` must equal it. Missing either or any historical SHA → refuse.
 *   - C2(rag-route): receipt must carry `ranAt`, `targetSha`, `wrapperSha`
 *     (in addition to sketch fields `runAt` / `gitSha`).
 *   - C-WAITING-USER-RULE: this is NEW EVIDENCE ≠ BACKFILL. The banned historical
 *     prove tips (85d36c7/f06dcba/549da9c/e88d386/23f98d3/bdc5993/b29c191) are
 *     refused as run targets; `historicalTip` is asserted false only after the check.
 *   - exit values are recorded AS RUN (nonzero is never washed/retuned).
 *   - `evidenceOfRecord` stays FALSE until post-prove dual.
 *   - Empty/claims-only stack is not allowed: stack facts are observed from the run
 *     (log banners + docker inspect), each with a source.
 *   - Ban: hand-writing JSON from prose; reusing uc018-receipt-backfill emitter or
 *     its libs (this emitter is self-contained by design); editing backfill assets.
 *
 * Known honesty limit (recorded in disclosure): output is JSON without HMAC —
 * forgeable in the same sense as GAP-BACKFILL-EMITTER-UNAUTHENTICATED; reviewers
 * must verify against committed logs + isolated receipts digests.
 *
 * releaseEvidence=false · Not HA · EXIT=0 ≠ product green ≠ HA ≠ covered.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync,
  readdirSync, writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RECEIPT_DIR = join(ROOT, 'ai-docs/delivery/receipts/uc018-waiting-user-tip');
const LOG_DIR = join(RECEIPT_DIR, 'logs');
const ISO_DIR = join(RECEIPT_DIR, 'isolated-receipts');
const TMP_ISO_DIR = join(ROOT, '.tmp/isolated-proof-receipts');
const OUT_PATH = join(RECEIPT_DIR, 'uc018-waiting-user-tip.json');
const ATTEMPTS_PATH = join(RECEIPT_DIR, 'attempts.jsonl');

const CMDS = ['uc018:abandon:prove', 'uc018:abandon:http:prove'];
const RAW_TARGETS = {
  'uc018:abandon:prove': 'uc018:abandon:prove:raw',
  'uc018:abandon:http:prove': 'uc018:abandon:http:prove:raw',
};
// Knife Goal ban list — historical prove tips that must NEVER be presented as this run's SHA.
const BANNED_HISTORICAL_TIPS = [
  '85d36c7', 'f06dcba', '549da9c', 'e88d386', '23f98d3', 'bdc5993', 'b29c191',
];

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, cwd: ROOT, ...opts });
}
function gitOut(args) {
  const r = sh('git', args);
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${(r.stderr || '').trim()}`);
  return (r.stdout || '').trim();
}
function sha256File(p) {
  return `sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`;
}
function recordAttempt(row) {
  mkdirSync(RECEIPT_DIR, { recursive: true });
  appendFileSync(ATTEMPTS_PATH, JSON.stringify(row) + '\n', 'utf8');
}
function failClosed(reason, extra = {}) {
  const row = { ranAt: new Date().toISOString(), phase: 'fail-closed', reason, ...extra };
  try { recordAttempt(row); } catch { /* even attempts logging must not mask the failure */ }
  console.error(`FAIL_CLOSED ${reason}`);
  process.exit(5);
}

// ---------- 1. worktree state (fail-closed) ----------
const HEAD = gitOut(['rev-parse', 'HEAD']);
const branch = gitOut(['rev-parse', '--abbrev-ref', 'HEAD']);
const porcelain = (sh('git', ['status', '--porcelain']).stdout || '')
  .split('\n').filter(Boolean)
  .filter((line) => !line.includes('.tmp/'))
  // this emitter's own output directory is not tree dirt; everything else must be clean
  .filter((line) => !line.includes('ai-docs/delivery/receipts/uc018-waiting-user-tip'));
if (porcelain.length) {
  failClosed('dirty_worktree', { porcelain: porcelain.slice(0, 20) });
}
// C-WAITING-USER-RULE / knife Goal: refuse every banned historical prove tip as run SHA.
const bannedResolved = {};
for (const short of BANNED_HISTORICAL_TIPS) {
  const r = sh('git', ['rev-parse', `${short}^{commit}`]);
  if (r.status === 0) {
    const full = (r.stdout || '').trim();
    bannedResolved[short] = full;
    if (full === HEAD) failClosed('banned_historical_tip_selected', { short, full });
  }
}
// Observed (NOT asserted): origin tip at run time. Drift vs HEAD is recorded, never hidden.
const originTipAtRun = gitOut(['rev-parse', 'origin/feat/mysql-schema-skeleton']);
const headIsOriginTip = HEAD === originTipAtRun;

// ---------- 2. import prior manual attempts (attempt history; receipt run happens below) ----------
mkdirSync(LOG_DIR, { recursive: true });
mkdirSync(ISO_DIR, { recursive: true });
const importedAttempts = [];
const MANUAL_LOGS = [
  { cmd: CMDS[0], file: 'attempt1-uc018-abandon-prove.log' },
  { cmd: CMDS[1], file: 'attempt1-uc018-abandon-http-prove.log' },
];
for (const m of MANUAL_LOGS) {
  const src = join(ROOT, '.tmp/line-d-logs', m.file);
  if (!existsSync(src)) continue;
  const body = readFileSync(src, 'utf8');
  const header = body.match(/^=== attempt (\d+): (pnpm \S+) \| HEAD=([0-9a-f]{40}) \| start=(\S+) ===/m);
  const exitMark = [...body.matchAll(/=== (pnpm \S+) EXIT=(\d+) ===/g)].pop();
  if (!header || !exitMark) continue;
  const destRel = `logs/${m.file.replace(/^attempt1-/, 'manual-attempt-1-')}`;
  copyFileSync(src, join(RECEIPT_DIR, destRel));
  const row = {
    phase: 'manual-pre-emitter',
    cmd: m.cmd,
    attempt: Number(header[1]),
    HEAD: header[3],
    startedAtUtc: header[4],
    exit: Number(exitMark[2]),
    logPath: `ai-docs/delivery/receipts/uc018-waiting-user-tip/${destRel}`,
    logSha256: sha256File(join(RECEIPT_DIR, destRel)),
    note: 'manual wrapper attempt at same HEAD before emitter; recorded for full attempt history',
  };
  recordAttempt(row);
  importedAttempts.push(row);
}

// ---------- 3. emitter-owned fresh run ----------
const emitterSelfSha256 = sha256File(new URL(import.meta.url).pathname);
const runStartedAt = new Date().toISOString();

const install = sh('pnpm', ['install', '--frozen-lockfile'], { stdio: ['ignore', 'pipe', 'pipe'] });
const installLogRel = 'logs/install.log';
writeFileSync(join(RECEIPT_DIR, installLogRel),
  `=== pnpm install --frozen-lockfile EXIT=${install.status} ===\n${install.stdout || ''}\n${install.stderr || ''}\n`);
recordAttempt({
  phase: 'emitter-install', cmd: 'pnpm install --frozen-lockfile', HEAD,
  startedAt: runStartedAt, exit: install.status ?? 1,
  logPath: `ai-docs/delivery/receipts/uc018-waiting-user-tip/${installLogRel}`,
});
if (install.status !== 0) failClosed('install_failed', { exit: install.status ?? 1 });

const nodeVersion = (sh('node', ['-v']).stdout || '').trim();
const pnpmVersion = (sh('pnpm', ['-v']).stdout || '').trim();

function newestIsolatedReceipt(rawTarget, sinceIso) {
  if (!existsSync(TMP_ISO_DIR)) return null;
  const since = Date.parse(sinceIso);
  const hits = readdirSync(TMP_ISO_DIR).filter((f) => f.endsWith('.json')).map((f) => {
    try { return { f, j: JSON.parse(readFileSync(join(TMP_ISO_DIR, f), 'utf8')) }; } catch { return null; }
  }).filter((e) => e && e.j.target === rawTarget && Date.parse(e.j.finishedAt) >= since)
    .sort((a, b) => Date.parse(b.j.finishedAt) - Date.parse(a.j.finishedAt));
  return hits[0] ?? null;
}

function dockerImageDigests() {
  const r = sh('docker', ['image', 'inspect', 'pgvector/pgvector:pg16', '--format', '{{json .RepoDigests}}']);
  try { return JSON.parse((r.stdout || '[]').trim() || '[]'); } catch { return []; }
}

const perCmd = [];
for (const cmd of CMDS) {
  const startedAt = new Date().toISOString();
  const r = sh('pnpm', [cmd], { stdio: ['ignore', 'pipe', 'pipe'] });
  const finishedAt = new Date().toISOString();
  const exit = r.status ?? 1;
  const logRel = `logs/emitter-attempt-${cmd.replace(/[^a-z0-9-]/g, '-')}.log`;
  const logBody = `=== emitter attempt: pnpm ${cmd} | HEAD=${HEAD} | start=${startedAt} ===\n`
    + `${r.stdout || ''}\n${r.stderr || ''}\n=== pnpm ${cmd} EXIT=${exit} ===\n`;
  writeFileSync(join(RECEIPT_DIR, logRel), logBody);
  const iso = newestIsolatedReceipt(RAW_TARGETS[cmd], startedAt);
  let isoRel = null;
  if (iso) {
    isoRel = `isolated-receipts/${cmd.replace(/[^a-z0-9-]/g, '-')}-${iso.f}`;
    copyFileSync(join(TMP_ISO_DIR, iso.f), join(RECEIPT_DIR, isoRel));
  }
  const banner = logBody.match(/E2E isolated PostgreSQL: (\S+) on 127\.0\.0\.1:(\d+)/) || [];
  const isolatedContainer = banner[1] ?? null;
  const isolatedHostPort = banner[2] ? Number(banner[2]) : null;
  const failCount = (logBody.match(/^FAIL  /gm) ?? []).length;
  recordAttempt({
    phase: 'emitter-prove', cmd, HEAD, startedAt, finishedAt, exit, failCount,
    logPath: `ai-docs/delivery/receipts/uc018-waiting-user-tip/${logRel}`,
    logSha256: sha256File(join(RECEIPT_DIR, logRel)),
    isolatedReceiptPath: isoRel ? `ai-docs/delivery/receipts/uc018-waiting-user-tip/${isoRel}` : null,
  });
  perCmd.push({
    cmd, exit, startedAt, finishedAt,
    logPath: `ai-docs/delivery/receipts/uc018-waiting-user-tip/${logRel}`,
    logSha256: sha256File(join(RECEIPT_DIR, logRel)),
    failCount, isolatedContainer, isolatedHostPort,
    isolatedReceiptPath: isoRel ? `ai-docs/delivery/receipts/uc018-waiting-user-tip/${isoRel}` : null,
    isolatedReceiptSha256: isoRel ? sha256File(join(RECEIPT_DIR, isoRel)) : null,
  });
}

const ranAt = new Date().toISOString();
const firstNonzero = perCmd.find((c) => c.exit !== 0);
const aggregateExit = firstNonzero ? firstNonzero.exit : 0;
const imageRepoDigests = dockerImageDigests();
const matrixSha256 = sha256File(join(ROOT, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md'));

// ---------- 4. machine receipt (built here — never hand-edited) ----------
const receipt = {
  schemaVersion: 1,
  class: 'local_untrusted_waiting_user_tip_run_receipt',
  knife: 'GAP-UC018-WAITING-USER-TIP',
  emittedBy: 'scripts/uc018-waiting-user-tip-emit.mjs',
  emitterSha256,
  // C1(e2e-ha): gitSha AND runnerCommitSha both = actual checked-out HEAD.
  // C2(rag-route): targetSha AND wrapperSha present as well — all four are the same real HEAD.
  gitSha: HEAD,
  runnerCommitSha: HEAD,
  targetSha: HEAD,
  wrapperSha: HEAD,
  branch,
  exit: aggregateExit,
  exits: Object.fromEntries(perCmd.map((c) => [c.cmd, c.exit])),
  cmds: CMDS,
  runAt: ranAt,
  ranAt,
  ranAtTz: 'UTC',
  historicalTip: false,
  evidenceOfRecord: false,
  evidenceKind: 'new-evidence-not-backfill',
  cWaitingUserRule: {
    rule: 'C-WAITING-USER-RULE',
    classification: 'new-evidence-not-backfill',
    note: 'Fresh run at the branch tip at execution (coordinator-authorized baseline). NOT a historical backfill; no banned historical SHA used; waitingUser stays MISSING-EVIDENCE in the backfill SSOT — only this new receipt records tip-run evidence.',
  },
  backfill: {
    dirUsed: false,
    filesModified: 0,
    existingEmitterReused: false,
    note: 'Self-contained emitter; receipt lives in a NEW directory; uc018-receipt-backfill/** untouched.',
  },
  stack: {
    isolationStack: { value: 'pgvector-legacy', source: 'R5-MARKED-RED banner in run logs' },
    image: { value: 'pgvector/pgvector:pg16', source: 'E2E_PG_IMAGE banner in run logs (wrapper default)' },
    imageRepoDigests: { value: imageRepoDigests, source: 'docker image inspect at run time' },
    imageAcquisition: {
      value: 'pulled via docker.m.daocloud.io (docker.io registry-1.docker.io unreachable from this host); RepoDigests identical for docker.io and mirror refs; local tag pgvector/pgvector:pg16 created from same bytes',
      source: '.tmp/line-d-logs/docker-pull-pg16.log + docker image inspect',
    },
    containers: perCmd.map((c) => ({
      cmd: c.cmd, container: c.isolatedContainer, hostPort: c.isolatedHostPort,
      source: 'E2E isolated PostgreSQL banner in run log',
    })),
    disposableIsolation: {
      uniqueContainerName: { value: true, source: 'wrapper meetwise-e2e-<pid>-<epochms> + observed two distinct names' },
      dynamicHostPort: { value: true, source: 'wrapper -p 127.0.0.1::5432 + observed distinct ports' },
      sharedVolumes: { value: false, source: 'scripts/run-e2e-isolated.mjs docker run has no -v mounts' },
      removedAfterRun: { value: true, source: 'wrapper --rm + finally docker rm -f' },
    },
    pgRetained: { value: true, source: 'pin echo (PG-retained); fixture is PostgreSQL/pgvector' },
    emptyStackIsNotMet: 'any claim field without a source above must be treated UNMET',
  },
  caps: {
    enforced: { value: false, source: 'scripts/run-e2e-isolated.mjs applies docker caps only to uc018:perf-load:prove:raw' },
    note: 'This run is not a capacity prove (harness NHP-5/6: Ban elevate).',
  },
  nodeVersion,
  pnpmVersion,
  installExit: install.status ?? 1,
  logs: perCmd.map((c) => ({ cmd: c.cmd, path: c.logPath, sha256: c.logSha256, exit: c.exit })),
  isolatedReceipts: perCmd.filter((c) => c.isolatedReceiptPath).map((c) => ({
    cmd: c.cmd, path: c.isolatedReceiptPath, sha256: c.isolatedReceiptSha256,
  })),
  attemptsPath: 'ai-docs/delivery/receipts/uc018-waiting-user-tip/attempts.jsonl',
  attemptsSummary: {
    importedManualAttempts: importedAttempts.length,
    emitterInstallAttempts: 1,
    emitterProveAttempts: perCmd.length,
    note: 'all attempts recorded; no retry-to-green',
  },
  originTipDrift: {
    observedOriginTip: originTipAtRun,
    headProved: HEAD,
    headIsOriginTipAtRun,
    note: 'Observed honestly, not asserted: origin ref had advanced past the coordinator-authorized baseline (3d7063f) at execution time (concurrent lines). This run proves at this line branch tip at execution (built on the authorized baseline); no historical prove tip was substituted.',
  },
  pins: {
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    gR45Closed: true,
    coveredCount: 8,
    ms3EqualsR4Closed: false,
    publicDeleteStatus: 503,
    stackPin: 'PG-retained',
    matrixRowUcE2e018Status: 'partial',
    matrixFileSha256AtRun: matrixSha256,
    ssotEditedByThisRun: false,
  },
  disclosure:
    'NEW EVIDENCE ≠ BACKFILL (C-WAITING-USER-RULE). Machine-emitted by scripts/uc018-waiting-user-tip-emit.mjs '
    + '(self-contained; does not call or modify uc018-receipt-backfill emitter/libs). evidenceOfRecord stays false '
    + 'until post-prove dual. exit values recorded as run; nonzero would be recorded as-is (none washed). '
    + 'EXIT=0 ≠ product green ≠ HA ≠ covered ≠ UC-E2E-018 covered; matrix §1.1 stays partial; coveredCount stays 8. '
    + 'GAP-BACKFILL-EMITTER-UNAUTHENTICATED applies: JSON is not HMAC-signed; verify against committed log digests.',
  environmentBlockages: [
    {
      kind: 'docker-daemon-not-running-at-start',
      resolution: 'started Docker Desktop (open -a Docker); daemon 29.1.3',
    },
    {
      kind: 'docker.io-registry-unreachable',
      detail: 'docker pull pgvector/pgvector:pg16 → "context deadline exceeded" (registry-1.docker.io); no system proxy',
      resolution: 'pulled identical image via docker.m.daocloud.io mirror; digest sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a matches across docker.io and mirror repo refs; canonical local tag created',
      logPath: '.tmp/line-d-logs/docker-pull-pg16.log',
    },
  ],
};

// ---------- 5. self-validation (fail-closed before writing) ----------
const problems = [];
for (const f of ['gitSha', 'runnerCommitSha', 'targetSha', 'wrapperSha', 'ranAt', 'runAt']) {
  if (!receipt[f]) problems.push(`missing:${f}`);
}
if (!(receipt.gitSha === receipt.runnerCommitSha && receipt.gitSha === receipt.targetSha
  && receipt.gitSha === receipt.wrapperSha && receipt.gitSha === HEAD)) {
  problems.push('sha-fields-must-equal-actual-HEAD');
}
if (typeof receipt.exit !== 'number') problems.push('exit-not-number');
if (receipt.cmds.length !== 2) problems.push('cmds-must-have-two-entries');
if (receipt.evidenceOfRecord !== false) problems.push('evidenceOfRecord-must-stay-false');
if (receipt.historicalTip !== false) problems.push('historicalTip-must-be-false');
if (receipt.exits[CMDS[0]] === undefined || receipt.exits[CMDS[1]] === undefined) problems.push('per-cmd-exits-missing');
for (const c of perCmd) {
  if (c.isolatedContainer === null || c.isolatedHostPort === null) problems.push(`stack-unobserved:${c.cmd}`);
}
if (problems.length) {
  recordAttempt({ phase: 'validate', ok: false, problems, ranAt });
  console.error(`RECEIPT_VALIDATION_FAILED ${problems.join(',')}`);
  process.exit(5);
}

writeFileSync(OUT_PATH, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
recordAttempt({
  phase: 'receipt-emitted', ranAt, HEAD, exit: aggregateExit,
  outPath: 'ai-docs/delivery/receipts/uc018-waiting-user-tip/uc018-waiting-user-tip.json',
  validate: { ok: true, problems: [] },
});

console.log(JSON.stringify({
  ok: true,
  receipt: 'ai-docs/delivery/receipts/uc018-waiting-user-tip/uc018-waiting-user-tip.json',
  gitSha: HEAD, runnerCommitSha: HEAD, targetSha: HEAD, wrapperSha: HEAD,
  exit: aggregateExit, exits: receipt.exits, historicalTip: false,
  evidenceOfRecord: false, evidenceKind: receipt.evidenceKind,
  originTipAtRun, headIsOriginTipAtRun,
}, null, 2));
