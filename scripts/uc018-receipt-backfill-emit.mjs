#!/usr/bin/env node
/**
 * Tip-side UC018 receipt-backfill emitter.
 * Runs prove at recorded targetSha in a disposable worktree; writes NEW receipt JSON
 * under ai-docs/delivery/receipts/uc018-receipt-backfill/ (never overwrites legacy receipts).
 *
 * Modes:
 *   (default) full worktree prove
 *   --mode=reemit-from-log  rebuild JSON from EXISTING committed log (+ prior digests);
 *                           append attempts.jsonl; do not re-run prove
 *
 * Ban: tip run as substitute for old-SHA; retry-until-green; hand-written JSON;
 *      hardcoded stack facts without source.
 */
import { spawnSync, execSync } from 'node:child_process';
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, appendFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import {
  EMITTED_BY, sha256File, validateMachineEmittedReceipt,
} from './lib/uc018-receipt-backfill-guard.mjs';
import {
  parseStackFromLog,
  buildImageDigests,
  parseTargetEnvFromLog,
  capacityRepresentativeFact,
  STACK_KEYS,
  unobservedFact,
} from './lib/uc018-receipt-backfill-facts.mjs';

function arg(name, def = null) {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p ? p.slice(name.length + 3) : def;
}
function sh(cmd, opts = {}) {
  return spawnSync('bash', ['-lc', cmd], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...opts,
  });
}
function git(tipRoot, args) {
  return execSync(`git ${args}`, { cwd: tipRoot, encoding: 'utf8' }).trim();
}
function porcelain(cwd) {
  const o = sh('git status --porcelain', { cwd });
  return (o.stdout || '').trim().split('\n').filter(Boolean);
}
function recordAttempt(attemptsPath, row) {
  mkdirSync(join(attemptsPath, '..'), { recursive: true });
  appendFileSync(attemptsPath, JSON.stringify(row) + '\n', 'utf8');
}

const tipRoot = resolve(arg('tipRoot', process.cwd()));
const mode = arg('mode', 'prove'); // prove | reemit-from-log
const key = arg('key');
const targetSha = arg('targetSha');
const cmd = arg('cmd'); // e.g. uc018:sole:prove
const worktreeBase = resolve(arg('worktreeBase', '/workspace/meetwise-lineA-backfill'));

if (!key || !targetSha || !cmd) {
  console.error('Usage: --key= --targetSha= --cmd=uc018:…:prove [--mode=prove|reemit-from-log]');
  process.exit(2);
}

const wrapperSha = git(tipRoot, 'rev-parse HEAD');
const targetFull = git(tipRoot, `rev-parse ${targetSha}`);
const ranAt = new Date().toISOString();
const receiptDir = join(tipRoot, 'ai-docs/delivery/receipts/uc018-receipt-backfill');
const logRel = `ai-docs/delivery/receipts/uc018-receipt-backfill/logs/${key}-${targetSha.slice(0, 7)}.log`;
const logAbs = join(tipRoot, logRel);
const attemptsPath = join(receiptDir, 'attempts.jsonl');
const wtPath = join(worktreeBase, targetSha.slice(0, 7));
const outRel = `ai-docs/delivery/receipts/uc018-receipt-backfill/${key}.json`;
const outPath = join(tipRoot, outRel);

mkdirSync(join(receiptDir, 'logs'), { recursive: true });

function emptySourcedStack() {
  const s = {};
  for (const k of STACK_KEYS) s[k] = unobservedFact();
  return s;
}

function buildReceiptBody({
  installExit, proveExit, logBody, nodeV, pnpmV, priorImageDigests,
}) {
  // Always write/overwrite log when logBody provided; reemit keeps existing bytes
  if (logBody != null) {
    writeFileSync(logAbs, logBody, 'utf8');
  }
  if (!existsSync(logAbs)) {
    throw new Error('log-missing:' + logAbs);
  }
  const logText = readFileSync(logAbs, 'utf8');
  const stdoutDigest = sha256File(logAbs);
  const exit = typeof proveExit === 'number' ? proveExit : (installExit ?? 1);
  const cmds = {};
  cmds[cmd] = exit;
  const stack = parseStackFromLog(logText, { logRel });
  const imageDigests = buildImageDigests(logText, priorImageDigests || {}, { logRel });
  const targetEnvFact = parseTargetEnvFromLog(logText, { logRel });
  const capFact = capacityRepresentativeFact();

  const receipt = {
    knife: 'UC-E2E-018-RECEIPT-BACKFILL',
    gap: 'GAP-UC018-RECEIPT-BACKFILL',
    key,
    emittedBy: EMITTED_BY,
    ranAt,
    targetSha: targetFull,
    wrapperSha,
    runnerCommitSha: targetFull,
    gitSha: targetFull,
    cmd: `pnpm ${cmd}`,
    exit,
    cmds,
    exits: { [cmd]: exit },
    installExit: installExit == null ? null : installExit,
    logPath: logRel,
    stdoutDigest,
    nodeVersion: nodeV,
    pnpmVersion: pnpmV,
    imageDigests,
    stack,
    targetEnv: targetEnvFact.value,
    targetEnvSource: targetEnvFact,
    capacityRepresentative: capFact.value,
    capacityRepresentativeSource: capFact,
    evidenceOfRecord: true,
    implementerOnly: false,
    disclosure:
      'EOR@targetSha ≠ proven at tip (code drift). Machine-emitted backfill at recorded ancestor SHA; Ban tip-substitution; Ban hand-write JSON from prose. GAP-BACKFILL-EMITTER-UNAUTHENTICATED: HMAC-free JSON+log digest pair is forgeable.',
    waitingUser: 'MISSING-EVIDENCE',
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    coveredCountRetained: 8,
  };
  if (key === 'PERF-LOAD') {
    receipt.command = `pnpm ${cmd}`;
    receipt.caps = {
      enforced: true,
      method: 'docker-isolated (backfill; capacityRepresentative=false)',
      note: 'C-PERF-CAP-PARTIAL · local/docker only · Ban elevate',
      source: 'policy-C-PERF-CAP-PARTIAL',
    };
  }
  // soleStack only when log-parse produced postgresSaver:true (sourced; not hardcoded)
  if (key === 'SOLE' && stack.postgresSaver?.value === true && stack.postgres?.value === true) {
    receipt.soleStack = {
      value: 'Postgres+pgvector+PostgresSaver',
      source: 'log-parse',
      logFile: logRel,
      note: 'derived from adr-postgres-retained PASS lines; Ban invent without log markers',
    };
  }
  return receipt;
}

function finalizeReceipt(receipt, attemptExtra = {}) {
  writeFileSync(outPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  const v = validateMachineEmittedReceipt(receipt, { root: tipRoot });
  recordAttempt(attemptsPath, {
    key,
    targetSha: targetFull,
    wrapperSha,
    installExit: receipt.installExit,
    proveExit: receipt.exit,
    outPath: outRel,
    validate: v,
    ranAt,
    ...attemptExtra,
  });
  console.log(JSON.stringify({
    ok: v.ok, key, targetSha: targetFull, wrapperSha,
    installExit: receipt.installExit, proveExit: receipt.exit, outPath, validate: v,
    mode,
  }, null, 2));
  if (!v.ok) process.exit(5);
}

// ---------- reemit-from-log (no worktree / no re-prove) ----------
if (mode === 'reemit-from-log') {
  if (!existsSync(logAbs)) {
    console.error('reemit-from-log requires existing log:', logRel);
    process.exit(6);
  }
  let prior = {};
  if (existsSync(outPath)) {
    try { prior = JSON.parse(readFileSync(outPath, 'utf8')); } catch { prior = {}; }
  }
  const proveExit = typeof prior.exit === 'number' ? prior.exit : null;
  if (proveExit == null) {
    // try parse EXIT= from log last prove banner
    const logText = readFileSync(logAbs, 'utf8');
    const m = logText.match(/=== pnpm \S+ EXIT=(\d+) ===/g);
    const last = m && m.length ? m[m.length - 1] : null;
    const em = last && last.match(/EXIT=(\d+)/);
    if (!em) {
      console.error('cannot determine proveExit for reemit');
      process.exit(7);
    }
  }
  const exitResolved = typeof prior.exit === 'number'
    ? prior.exit
    : Number((readFileSync(logAbs, 'utf8').match(/=== pnpm \S+ EXIT=(\d+) ===/g) || [])
      .pop()
      ?.match(/EXIT=(\d+)/)?.[1] ?? 1);

  const receipt = buildReceiptBody({
    installExit: prior.installExit ?? 0,
    proveExit: exitResolved,
    logBody: null, // keep existing log bytes (digest stable)
    nodeV: prior.nodeVersion ?? null,
    pnpmV: prior.pnpmVersion ?? null,
    priorImageDigests: prior.imageDigests || {},
  });
  // Preserve original ranAt from first emit if present; record reemit in attempts
  if (prior.ranAt) receipt.ranAt = prior.ranAt;
  receipt.reemittedAt = ranAt;
  receipt.reemitNote = 'format upgrade: sourced stack + imageDigest fields from committed log; prove not re-run';
  finalizeReceipt(receipt, { phase: 'reemit-from-log', priorExit: prior.exit ?? null });
  process.exit(0);
}

// ---------- full prove mode ----------
mkdirSync(worktreeBase, { recursive: true });

const tipDirty = porcelain(tipRoot).filter((line) => {
  const path = line.replace(/^\?\? /, '').replace(/^[ MADRCU]{1,2} /, '').trim();
  if (path.startsWith('ai-docs/delivery/receipts/uc018-receipt-backfill')) return false;
  if (path.startsWith('.tmp/')) return false;
  return true;
});
if (tipDirty.length) {
  console.error('DIRTY_TREE tip:', tipDirty.slice(0, 20).join('\n'));
  process.exit(3);
}

try {
  git(tipRoot, `merge-base --is-ancestor ${targetFull} HEAD`);
} catch {
  console.error('targetSha not ancestor of tip HEAD');
  process.exit(4);
}

sh(`git worktree remove --force ${JSON.stringify(wtPath)} 2>/dev/null || rm -rf ${JSON.stringify(wtPath)}`, {
  cwd: tipRoot,
});

const add = sh(`git worktree add --detach ${JSON.stringify(wtPath)} ${targetFull}`, { cwd: tipRoot });
if (add.status !== 0) {
  const row = {
    key, targetSha: targetFull, wrapperSha, phase: 'worktree-add',
    exit: add.status ?? 1, stderr: (add.stderr || '').slice(0, 2000), ranAt,
  };
  recordAttempt(attemptsPath, row);
  const receipt = buildReceiptBody({
    installExit: null,
    proveExit: add.status ?? 1,
    logBody: add.stderr || add.stdout || 'worktree-add-failed',
    nodeV: null, pnpmV: null, priorImageDigests: {},
  });
  finalizeReceipt(receipt, { phase: 'worktree-add-fail' });
  process.exit(0);
}

function collectImageDigestsRaw(cwd) {
  const digests = {};
  const images = [
    'pgvector/pgvector:pg16',
    'redis:7-alpine',
    'minio/minio:latest',
    'mailhog/mailhog:v1.0.1',
  ];
  for (const img of images) {
    const r = sh(`docker image inspect ${JSON.stringify(img)} --format '{{json .RepoDigests}}' 2>/dev/null || echo '[]'`, { cwd });
    try {
      digests[img] = JSON.parse((r.stdout || '[]').trim() || '[]');
    } catch {
      digests[img] = [];
    }
  }
  return digests;
}

try {
  const wtDirty = porcelain(wtPath);
  if (wtDirty.length) {
    const receipt = buildReceiptBody({
      installExit: null, proveExit: 3,
      logBody: 'DIRTY_TREE worktree\n' + wtDirty.join('\n'),
      nodeV: null, pnpmV: null, priorImageDigests: {},
    });
    finalizeReceipt(receipt, { phase: 'dirty-worktree' });
  } else {
    const nodeV = sh('node -v', { cwd: wtPath }).stdout.trim();
    const pnpmV = sh('pnpm -v', { cwd: wtPath }).stdout.trim();
    const imageDigestsPre = collectImageDigestsRaw(wtPath);

    const install = sh('pnpm install --frozen-lockfile', { cwd: wtPath, env: process.env });
    const installLog = `=== pnpm install --frozen-lockfile EXIT=${install.status} ===\n${install.stdout || ''}\n${install.stderr || ''}\n`;
    if (install.status !== 0) {
      const receipt = buildReceiptBody({
        installExit: install.status ?? 1,
        proveExit: install.status ?? 1,
        logBody: installLog,
        nodeV, pnpmV, priorImageDigests: imageDigestsPre,
      });
      finalizeReceipt(receipt, { phase: 'install-fail' });
    } else {
      const prove = sh(`pnpm ${cmd}`, {
        cwd: wtPath,
        env: { ...process.env, CI: process.env.CI || '1' },
      });
      const proveLog =
        installLog +
        `\n=== pnpm ${cmd} EXIT=${prove.status} ===\n${prove.stdout || ''}\n${prove.stderr || ''}\n`;
      const imageDigestsRaw = { ...imageDigestsPre, ...collectImageDigestsRaw(wtPath) };
      const receipt = buildReceiptBody({
        installExit: 0,
        proveExit: prove.status ?? 1,
        logBody: proveLog,
        nodeV, pnpmV, priorImageDigests: imageDigestsRaw,
      });
      finalizeReceipt(receipt, { phase: 'prove' });
    }
  }
} finally {
  sh(`git worktree remove --force ${JSON.stringify(wtPath)} 2>/dev/null || rm -rf ${JSON.stringify(wtPath)}`, {
    cwd: tipRoot,
  });
  sh(`docker ps -aq --filter name=meetwise-e2e --filter name=meetwise-uc018 | xargs -r docker rm -f 2>/dev/null || true`);
}

process.exit(0);
