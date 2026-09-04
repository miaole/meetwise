/**
 * Automate refactor/test/UI/regression for the Meetwise E2E platform.
 *
 * Commands can run in a loop. AI output is never trusted by default.
 * A passing step is verification, not review. pending_review exits 2.
 * Multi-round writes a new receipt under .tmp. Receipts store no secrets.
 * This process does not load .env. releaseEvidence=false.
 */
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeReviewRecord } from './review-record.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FORBIDDEN_FLAGS = Object.freeze([
  '--trust-ai',
  '--auto-approve',
  '--skip' + '-review',
]);
const ALLOWED_FLAGS = new Set(['--ui', '--regression', '--round', '--receipt-root', '--predecessor']);

export function parseArgs(argv) {
  const flags = new Set();
  const values = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (FORBIDDEN_FLAGS.includes(arg)) {
      throw new Error(`e2e_platform_ai_trust_or_skip_review_forbidden:${arg}`);
    }
    if (arg === '--round' || arg === '--receipt-root' || arg === '--predecessor') {
      const value = argv[i + 1];
      if (typeof value !== 'string' || value.startsWith('--')) throw new Error(`e2e_platform_loop_flag_value_missing:${arg}`);
      values[arg] = value;
      i += 1;
      continue;
    }
    if (arg.startsWith('--')) {
      if (!ALLOWED_FLAGS.has(arg)) throw new Error(`e2e_platform_loop_unknown_flag:${arg}`);
      flags.add(arg);
    } else {
      throw new Error(`e2e_platform_loop_unknown_arg:${arg}`);
    }
  }
  return { flags, values };
}

function runPnpm(name, pnpmArgs, env) {
  return new Promise((resolveRun, reject) => {
    const child = spawn('pnpm', pnpmArgs, { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', (chunk) => process.stdout.write(chunk));
    child.stderr.on('data', (chunk) => process.stderr.write(chunk));
    child.on('error', reject);
    child.on('exit', (code) => resolveRun({ name, exit: code ?? 1 }));
  });
}

function childEnv(env) {
  const next = { PATH: env.PATH ?? process.env.PATH, LANG: env.LANG, LC_ALL: env.LC_ALL, TZ: env.TZ };
  if (env.MODEL_API_KEY) next.MODEL_API_KEY = env.MODEL_API_KEY;
  return next;
}

function stepResult(command, result, requested) {
  if (!requested) return { command, outcome: 'not_requested', exit: null };
  return {
    command,
    outcome: result.exit === 0 ? 'passed' : 'failed',
    exit: result.exit,
  };
}

export function loopExitCode({ requestedFailed, reviewStatus }) {
  if (requestedFailed || reviewStatus === 'rejected') return 1;
  if (reviewStatus === 'pending_review') return 2;
  return 1;
}

export async function runReviewLoop({
  repoRoot = ROOT,
  argv = process.argv.slice(2),
  receiptRoot,
  env = process.env,
  runStep = runPnpm,
} = {}) {
  const { flags, values } = parseArgs(argv);
  const wantUi = flags.has('--ui');
  const wantRegression = flags.has('--regression');
  const round = values['--round'] ? Number(values['--round']) : 1;
  const outputRoot = values['--receipt-root'] ?? receiptRoot ?? join(repoRoot, '.tmp', 'e2e-platform-reviews');
  const predecessorReceiptId = values['--predecessor'] ?? null;
  const startedAt = new Date();
  const runtimeEnv = childEnv(env);
  const runnerKind = runStep === runPnpm ? 'pnpm_spawn' : 'injected_for_proof';

  const refactor = await runStep('refactor', ['e2e-platform:check'], runtimeEnv);
  const test = await runStep('test', ['e2e-platform:prove'], runtimeEnv);

  let ui = { exit: null };
  if (wantUi) {
    if (!runtimeEnv.MODEL_API_KEY) {
      console.error('live_provider_key_missing:MODEL_API_KEY');
      console.error('e2e_platform_loop_ui_not_run: set MODEL_API_KEY or omit --ui. Do not treat this as pass.');
    } else {
      ui = await runStep('ui', ['e2e:ui:isolated'], runtimeEnv);
    }
  }

  let regression = { exit: null };
  if (wantRegression) {
    regression = await runStep('regression', ['regression'], runtimeEnv);
  }

  const steps = {
    refactor: stepResult('pnpm e2e-platform:check', refactor, true),
    test: stepResult('pnpm e2e-platform:prove', test, true),
    ui: wantUi && !runtimeEnv.MODEL_API_KEY
      ? { command: 'pnpm e2e:ui:isolated', outcome: 'not_run', exit: null, skipReason: 'live_provider_key_missing' }
      : stepResult('pnpm e2e:ui:isolated', ui, wantUi),
    regression: stepResult('pnpm regression', regression, wantRegression),
  };

  const requestedFailed = ['refactor', 'test', 'regression'].some((id) => steps[id].outcome === 'failed')
    || (wantUi && (steps.ui.outcome === 'failed' || steps.ui.outcome === 'not_run'));
  const reviewStatus = requestedFailed ? 'rejected' : 'pending_review';
  const finishedAt = new Date();
  const written = await writeReviewRecord({
    repoRoot,
    receiptRoot: outputRoot,
    round,
    predecessorReceiptId,
    reviewStatus,
    aiOutputTrusted: false,
    runnerKind,
    liveE2E: 'not_requested',
    steps,
    startedAt,
    finishedAt,
  });

  const exitCode = loopExitCode({ requestedFailed, reviewStatus });
  console.log(JSON.stringify({
    outcome: requestedFailed ? 'rejected_review_required' : 'steps_recorded_review_required',
    reviewStatus,
    reviewComplete: false,
    aiOutputTrusted: false,
    releaseEvidence: false,
    liveE2E: 'not_requested',
    runnerKind,
    round,
    exitCode,
    receipt: written.relativePath,
    steps: Object.fromEntries(Object.entries(steps).map(([id, step]) => [id, { outcome: step.outcome, exit: step.exit }])),
  }));

  return { ...written, requestedFailed, reviewStatus, steps, exitCode, runnerKind };
}

function isCli(url) {
  const invoked = process.argv[1];
  return Boolean(invoked) && fileURLToPath(url) === resolve(invoked);
}

if (isCli(import.meta.url)) {
  runReviewLoop().then((result) => {
    process.exit(loopExitCode(result));
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
