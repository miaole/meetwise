/**
 * UC-018 UI failure backfill re-run · machine wrapper + receipt emitter (Line E).
 *
 * Purpose: honest re-run of `pnpm uc018:ui:prove` at the recorded SHA
 * `e88d386ea946918668d8e073edc7f33521fe33d9` after repairing ONLY the recorded
 * environment blocker (missing `.next` production build — the SHA's own runner
 * `scripts/run-e2e-ui.mjs` deliberately does not build: "本脚本不重新构建").
 * The harness (`ai-docs/delivery/harness/uc018-ui-failure-backfill.md` step 2)
 * allows adding exactly this missing build step without retuning the old exit.
 *
 * What this script does per attempt (all append-only, never retuned):
 *   1. `pnpm install --frozen-lockfile`  (cwd = per-SHA worktree)
 *   2. `pnpm -C apps/web build`          (the disclosed added build step)
 *   3. `pnpm uc018:ui:prove`             (the recorded prove CMD, unmodified)
 *   4. machine-emits: per-attempt logs, one attempts.jsonl line, and a
 *      receipt JSON built ONLY from observed facts (exit codes, git SHA,
 *      tool versions, live docker image inspect, log-parse stack facts,
 *      sha256 log digest). No hand-written JSON from prose.
 *
 * Line A safety: does NOT read or write
 * `ai-docs/delivery/receipts/uc018-receipt-backfill/**`, nor
 * `scripts/uc018-receipt-backfill-emit.mjs`, nor its facts/guard libs.
 * New evidence lands in its own receipt dir; old EXIT=1 receipts stay as-is.
 *
 * Usage:
 *   node scripts/uc018-ui-backfill-rerun.mjs \
 *     --worktree=/path/to/per-sha-worktree \
 *     --receipt-dir=/path/to/ai-docs/delivery/receipts/uc018-ui-backfill-rerun
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync, existsSync, mkdirSync, readFileSync, relative, renameSync, writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const arg = (name, fallback = '') => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const WORKTREE = arg('worktree');
const RECEIPT_DIR = arg('receipt-dir');
if (!WORKTREE || !RECEIPT_DIR || !existsSync(join(WORKTREE, 'package.json'))) {
  console.error('Usage: --worktree=<per-SHA worktree> --receipt-dir=<output dir>');
  process.exit(2);
}

const PROVE_CMD = 'pnpm uc018:ui:prove';
const PG_IMAGE = 'pgvector/pgvector:pg16';
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

// wrapperSha = tip commit of the emitter code that writes the JSON (Line A convention).
const SELF_ROOT = new URL('..', import.meta.url).pathname;
const wrapperSha = spawnSync('git', ['-C', SELF_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).status === 0
  ? spawnSync('git', ['-C', SELF_ROOT, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim()
  : null;
// Receipts are committed: record repo-relative paths (Line A convention), not absolute machine paths.
const relToSelf = (p) => relative(SELF_ROOT, p);

const gitOut = (args) => {
  const r = spawnSync('git', ['-C', WORKTREE, ...args], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
};

function runStep(name, cmd, args, cwd, logPath, extraEnv = {}) {
  const startedAt = new Date();
  const child = spawn(cmd, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const chunks = [];
  child.stdout.on('data', (d) => { chunks.push(d); });
  child.stderr.on('data', (d) => { chunks.push(d); });
  return new Promise((resolve) => {
    child.on('exit', (code) => {
      const buf = Buffer.concat(chunks);
      writeFileSync(logPath, buf);
      resolve({
        name,
        cmd: [cmd, ...args].join(' '),
        cwd,
        exit: code ?? 1,
        startedAt: startedAt.toISOString(),
        finishedAt: new Date().toISOString(),
        logPath,
        logBytes: buf.length,
      });
    });
  });
}

function dockerImageFacts() {
  const r = spawnSync('docker', ['image', 'inspect', PG_IMAGE, '--format', '{{.Id}}\t{{.Architecture}}'], { encoding: 'utf8' });
  if (r.status !== 0) {
    return { imageDigest: 'not-started', started: false, source: 'docker-image-inspect-failed', liveObservation: false, error: (r.stderr || r.stdout || '').trim().slice(0, 300) };
  }
  const [id, arch] = r.stdout.trim().split('\t');
  return {
    imageDigest: id,
    architecture: arch,
    started: null, // decided by log-parse below
    source: 'live-docker-image-inspect',
    liveObservation: true,
  };
}

function logParseFacts(logText) {
  const lines = logText.split('\n');
  const facts = { postgres: null, failureLines: [] };
  lines.forEach((line, i) => {
    if (facts.postgres === null && /E2E isolated PostgreSQL:/.test(line)) {
      facts.postgres = {
        value: true,
        source: 'log-parse',
        line: i + 1,
        regex: 'E2E isolated PostgreSQL:',
        matched: line.trim(),
      };
    }
    if (/E2E_FAILURE /.test(line)) facts.failureLines.push({ line: i + 1, matched: line.trim() });
  });
  return facts;
}

async function main() {
  mkdirSync(join(RECEIPT_DIR, 'logs'), { recursive: true });
  const attemptsPath = join(RECEIPT_DIR, 'attempts.jsonl');

  const priorAttempts = existsSync(attemptsPath)
    ? readFileSync(attemptsPath, 'utf8').split('\n').filter(Boolean).length
    : 0;
  const attemptNo = priorAttempts + 1;

  const targetSha = gitOut(['rev-parse', 'HEAD']);
  const gitDirtyLines = (gitOut(['status', '--porcelain']) ?? '').split('\n').filter(Boolean).length;

  const nodeVersion = spawnSync('node', ['--version'], { encoding: 'utf8' }).stdout.trim();
  const pnpmVersion = spawnSync('pnpm', ['--version'], { cwd: WORKTREE, encoding: 'utf8' }).stdout.trim();
  const startedAt = new Date().toISOString();

  const steps = {};
  // Step 1: frozen-lockfile install at the recorded SHA (lockfile of that SHA, never tip).
  steps.install = await runStep(
    'install',
    'pnpm', ['install', '--frozen-lockfile'],
    WORKTREE,
    join(RECEIPT_DIR, 'logs', `attempt${attemptNo}-install.log`),
  );
  if (steps.install.exit !== 0) {
    const attempt = {
      key: 'UI-rerun', attempt: attemptNo, targetSha, gitDirtyLines,
      nodeVersion, pnpmVersion, startedAt,
      installExit: steps.install.exit, buildExit: null, proveExit: null,
      cmd: PROVE_CMD, outcome: 'install-failed',
      steps,
    };
    appendFileSync(attemptsPath, `${JSON.stringify(attempt)}\n`);
    console.error(`[attempt ${attemptNo}] install EXIT=${steps.install.exit} — recorded, not retuned`);
    process.exit(1);
  }

  // Step 2: the disclosed added build step (harness uc018-ui-failure-backfill.md step 2).
  steps.build = await runStep(
    'build',
    'pnpm', ['-C', 'apps/web', 'build'],
    WORKTREE,
    join(RECEIPT_DIR, 'logs', `attempt${attemptNo}-web-build.log`),
    { NEXT_TELEMETRY_DISABLED: '1' },
  );
  if (steps.build.exit !== 0) {
    const attempt = {
      key: 'UI-rerun', attempt: attemptNo, targetSha, gitDirtyLines, nodeVersion, pnpmVersion, startedAt,
      installExit: 0, buildExit: steps.build.exit, proveExit: null,
      cmd: PROVE_CMD, outcome: 'web-build-failed',
      steps,
    };
    appendFileSync(attemptsPath, `${JSON.stringify(attempt)}\n`);
    console.error(`[attempt ${attemptNo}] web build EXIT=${steps.build.exit} — recorded, not retuned`);
    process.exit(1);
  }

  // Step 3: the recorded prove CMD, unmodified, at the recorded SHA.
  steps.prove = await runStep(
    'prove',
    'pnpm', ['uc018:ui:prove'],
    WORKTREE,
    join(RECEIPT_DIR, 'logs', `attempt${attemptNo}-prove.log`),
  );

  const proveLogBuf = readFileSync(steps.prove.logPath);
  const proveLogText = proveLogBuf.toString('utf8');
  const stdoutDigest = sha256(proveLogBuf);
  const parsed = logParseFacts(proveLogText);
  const img = dockerImageFacts();
  if (parsed.postgres) img.started = true;

  const proveExit = steps.prove.exit;
  const attempt = {
    key: 'UI-rerun',
    attempt: attemptNo,
    targetSha,
    wrapperSha,
    wrapperKind: 'uc018-ui-backfill-rerun.mjs (Line E new emitter; Line A files untouched)',
    installExit: steps.install.exit,
    buildExit: steps.build.exit,
    proveExit,
    cmd: PROVE_CMD,
    addedBuildStep: 'pnpm -C apps/web build (disclosed; the recorded SHA runner lacks it)',
    ranAt: startedAt,
    finishedAt: new Date().toISOString(),
    nodeVersion,
    pnpmVersion,
    logPath: relToSelf(steps.prove.logPath),
    stdoutDigest,
    e2eFailureLines: parsed.failureLines,
    isolatedPostgres: parsed.postgres,
    pgImage: { image: PG_IMAGE, ...img },
    outcome: proveExit === 0 ? 'passed' : 'failed',
  };
  appendFileSync(attemptsPath, `${JSON.stringify(attempt)}\n`);

  // Receipt = last attempt only; full attempt history stays append-only in attempts.jsonl.
  const receipt = {
    knife: 'UC-E2E-018-UI-FAILURE-BACKFILL-RERUN',
    key: 'UI-rerun',
    emittedBy: 'uc018-ui-backfill-rerun.mjs',
    attempt: attemptNo,
    ranAt: startedAt,
    finishedAt: attempt.finishedAt,
    targetSha,
    wrapperSha,
    runnerCommitSha: targetSha,
    gitSha: targetSha,
    worktreeKind: 'independent per-SHA detached worktree',
    cmd: PROVE_CMD,
    exit: proveExit,
    cmds: { 'uc018:ui:prove': proveExit },
    exits: { 'uc018:ui:prove': proveExit },
    installExit: steps.install.exit,
    buildExit: steps.build.exit,
    addedBuildStep: attempt.addedBuildStep,
    logPath: relToSelf(steps.prove.logPath),
    installLogPath: relToSelf(steps.install.logPath),
    buildLogPath: relToSelf(steps.build.logPath),
    stdoutDigest,
    nodeVersion,
    pnpmVersion,
    pgImage: { image: PG_IMAGE, ...img },
    stack: {
      postgres: parsed.postgres ?? { value: 'unobserved', source: 'unobserved' },
      postgresSaver: { value: 'unobserved', source: 'unobserved' },
      memorySaver: { value: 'unobserved', source: 'unobserved' },
      mysql: { value: 'unobserved', source: 'unobserved' },
      qdrant: { value: 'unobserved', source: 'unobserved' },
    },
    targetEnv: parsed.postgres ? 'docker-isolated' : 'unobserved',
    capacityRepresentative: false,
    e2eFailureLines: parsed.failureLines,
    evidenceOfRecord: true,
    implementerOnly: false,
    disclosure:
      'NEW EVIDENCE, not a backfill overwrite: old uc018-receipt-backfill/UI.json (exit=1, web_not_ready) is untouched and stays exit=1. ' +
      'Environment repair = the exact missing `next build` step the recorded SHA runner lacks (harness-sanctioned) + disposable pg container image pulled via registry mirror (digest recorded from live docker inspect). ' +
      'EXIT=0 here ≠ historical exit was 0 ≠ covered ≠ HA ≠ releaseEvidence. All attempts in attempts.jsonl (append-only).',
    waitingUser: proveExit === 0 ? 'POST-PROVE-DUAL' : 'MISSING-EVIDENCE',
    haStatus: 'NOT_HA',
    releaseEvidence: false,
    claimProductionHA: false,
    coveredCountRetained: 8,
    attemptsPath: 'attempts.jsonl',
  };
  const receiptPath = join(RECEIPT_DIR, 'UI-rerun.json');
  const partialPath = `${receiptPath}.partial`;
  writeFileSync(partialPath, `${JSON.stringify(receipt, null, 2)}\n`);
  renameSync(partialPath, receiptPath);

  console.log(`[attempt ${attemptNo}] prove EXIT=${proveExit}`);
  console.log(`receipt=${receiptPath}`);
  console.log(`stdoutDigest=${stdoutDigest}`);
  process.exit(proveExit ?? 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
