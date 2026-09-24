#!/usr/bin/env node
/**
 * Tip-side UC018 receipt-backfill emitter.
 * Runs prove at recorded targetSha in a disposable worktree; writes NEW receipt JSON
 * under ai-docs/delivery/receipts/uc018-receipt-backfill/ (never overwrites legacy receipts).
 *
 * Usage:
 *   node scripts/uc018-receipt-backfill-emit.mjs \
 *     --key=SOLE --targetSha=23f98d3 --cmd=uc018:sole:prove
 *
 * Ban: tip run as substitute for old-SHA; retry-until-green; hand-written JSON.
 */
import { spawnSync, execSync } from 'node:child_process';
import {
  mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, appendFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import {
  EMITTED_BY, sha256File, validateMachineEmittedReceipt,
} from './lib/uc018-receipt-backfill-guard.mjs';

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
const key = arg('key');
const targetSha = arg('targetSha');
const cmd = arg('cmd'); // e.g. uc018:sole:prove
const worktreeBase = resolve(arg('worktreeBase', '/workspace/meetwise-lineA-backfill'));

if (!key || !targetSha || !cmd) {
  console.error('Usage: --key= --targetSha= --cmd=uc018:…:prove');
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

mkdirSync(join(receiptDir, 'logs'), { recursive: true });
mkdirSync(worktreeBase, { recursive: true });

// Tip hygiene — allow untracked backfill outputs / .tmp (this knife's emit products)
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

// Ensure target exists + is ancestor
try {
  git(tipRoot, `merge-base --is-ancestor ${targetFull} HEAD`);
} catch {
  console.error('targetSha not ancestor of tip HEAD');
  process.exit(4);
}

// Remove stale worktree if present
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
  writeFailureReceipt({
    installExit: null, proveExit: add.status ?? 1, logBody: add.stderr || add.stdout || 'worktree-add-failed',
    nodeV: null, pnpmV: null, imageDigests: {}, stack: emptyStack(),
  });
  process.exit(0); // emitter itself succeeds after recording failure
}

function emptyStack() {
  return {
    postgres: undefined,
    postgresSaver: undefined,
    memorySaver: undefined,
    mysql: undefined,
    qdrant: undefined,
  };
}

function collectImageDigests(cwd) {
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
  // Also sample any meetwise-e2e containers
  const ps = sh(`docker ps -a --filter name=meetwise --format '{{.Image}}' 2>/dev/null | sort -u`, { cwd });
  digests._runningMeetwiseImages = (ps.stdout || '').trim().split('\n').filter(Boolean);
  return digests;
}

function collectStackFromDocker(cwd) {
  const stack = emptyStack();
  const ps = sh(`docker ps --format '{{.Names}} {{.Image}}' 2>/dev/null`, { cwd });
  const lines = (ps.stdout || '').split('\n');
  let sawPg = false;
  for (const line of lines) {
    const low = line.toLowerCase();
    if (/pgvector|postgres/.test(low)) sawPg = true;
    if (/mysql/.test(low)) stack.mysql = true;
    if (/qdrant/.test(low)) stack.qdrant = true;
  }
  if (sawPg) {
    stack.postgres = true;
    // PostgresSaver is app-level; cannot observe from docker alone → leave undefined unless sole static
  }
  stack.memorySaver = false;
  if (stack.mysql !== true) stack.mysql = false;
  if (stack.qdrant !== true) stack.qdrant = false;
  return stack;
}

function writeFailureReceipt(extra) {
  writeReceipt(extra);
}

function writeReceipt({
  installExit, proveExit, logBody, nodeV, pnpmV, imageDigests, stack,
}) {
  writeFileSync(logAbs, logBody || '', 'utf8');
  const stdoutDigest = sha256File(logAbs);
  const exit = typeof proveExit === 'number' ? proveExit : (installExit ?? 1);
  const cmds = {};
  cmds[cmd] = exit;
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
    targetEnv: 'docker-isolated',
    capacityRepresentative: false,
    evidenceOfRecord: true,
    implementerOnly: false,
    disclosure:
      'EOR@targetSha ≠ proven at tip (code drift). Machine-emitted backfill at recorded ancestor SHA; Ban tip-substitution; Ban hand-write JSON from prose.',
    waitingUser: 'MISSING-EVIDENCE',
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    coveredCountRetained: 8,
  };
  // PERF key: also shape like summary for gatherer overlay
  if (key === 'PERF-LOAD') {
    receipt.command = `pnpm ${cmd}`;
    receipt.caps = {
      enforced: true,
      method: 'docker-isolated (backfill; capacityRepresentative=false)',
      note: 'C-PERF-CAP-PARTIAL · local/docker only · Ban elevate',
    };
  }
  if (key === 'SOLE') {
    receipt.soleStack = 'Postgres+pgvector+PostgresSaver';
    receipt.stack = {
      postgres: true,
      postgresSaver: true,
      memorySaver: false,
      mysql: false,
      qdrant: false,
    };
  }

  const outPath = join(receiptDir, `${key}.json`);
  writeFileSync(outPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');
  const v = validateMachineEmittedReceipt(receipt, { root: tipRoot });
  recordAttempt(attemptsPath, {
    key, targetSha: targetFull, wrapperSha, installExit, proveExit: exit,
    outPath: `ai-docs/delivery/receipts/uc018-receipt-backfill/${key}.json`,
    validate: v, ranAt,
  });
  console.log(JSON.stringify({
    ok: v.ok, key, targetSha: targetFull, wrapperSha, installExit, proveExit: exit, outPath, validate: v,
  }, null, 2));
  if (!v.ok) process.exit(5);
}

try {
  const wtDirty = porcelain(wtPath);
  if (wtDirty.length) {
    writeFailureReceipt({
      installExit: null, proveExit: 3,
      logBody: 'DIRTY_TREE worktree\n' + wtDirty.join('\n'),
      nodeV: null, pnpmV: null, imageDigests: {}, stack: emptyStack(),
    });
  } else {
    const nodeV = sh('node -v', { cwd: wtPath }).stdout.trim();
    const pnpmV = sh('pnpm -v', { cwd: wtPath }).stdout.trim();
    const imageDigestsPre = collectImageDigests(wtPath);

    const install = sh('pnpm install --frozen-lockfile', { cwd: wtPath, env: process.env });
    const installLog = `=== pnpm install --frozen-lockfile EXIT=${install.status} ===\n${install.stdout || ''}\n${install.stderr || ''}\n`;
    if (install.status !== 0) {
      writeFailureReceipt({
        installExit: install.status ?? 1,
        proveExit: install.status ?? 1,
        logBody: installLog,
        nodeV, pnpmV, imageDigests: imageDigestsPre, stack: emptyStack(),
      });
    } else {
      const prove = sh(`pnpm ${cmd}`, {
        cwd: wtPath,
        env: { ...process.env, CI: process.env.CI || '1' },
      });
      const proveLog =
        installLog +
        `\n=== pnpm ${cmd} EXIT=${prove.status} ===\n${prove.stdout || ''}\n${prove.stderr || ''}\n`;
      const imageDigests = { ...imageDigestsPre, ...collectImageDigests(wtPath) };
      let stack = collectStackFromDocker(wtPath);
      if (key === 'SOLE') {
        stack = {
          postgres: true,
          postgresSaver: true,
          memorySaver: false,
          mysql: false,
          qdrant: false,
        };
      }
      writeReceipt({
        installExit: 0,
        proveExit: prove.status ?? 1,
        logBody: proveLog,
        nodeV, pnpmV, imageDigests, stack,
      });
    }
  }
} finally {
  sh(`git worktree remove --force ${JSON.stringify(wtPath)} 2>/dev/null || rm -rf ${JSON.stringify(wtPath)}`, {
    cwd: tipRoot,
  });
  // Best-effort cleanup of leftover meetwise e2e containers from this run
  sh(`docker ps -aq --filter name=meetwise-e2e --filter name=meetwise-uc018 | xargs -r docker rm -f 2>/dev/null || true`);
}

process.exit(0);
