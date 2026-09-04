/**
 * Post-change regression entrypoint.
 *
 * Required order (flags compose; an omitted lane is not_run, never skip-as-pass):
 *   1. always-on — no provider key, no Docker
 *   2. --core    — walking-skeleton isolated/local proves (Docker / Postgres)
 *   3. --live    — HTTP E2E only (`e2e:isolated`). Browser UI is a separate
 *                  command and needs `pnpm -C apps/web build` first.
 *                  Missing or blank MODEL_API_KEY exits non-zero.
 *
 * Optional static guards listed below are wired only when the matching
 * `package.json` script exists. Required scripts missing from package.json
 * fail closed.
 *
 * releaseEvidence is always false. This script does not replace CI verify.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const LANE_ORDER = Object.freeze(['always-on', 'core', 'live']);
export const KNOWN_FLAGS = Object.freeze(['--core', '--live', '--dry-run']);

export const ALWAYS_ON_REQUIRED = Object.freeze([
  'docs:check',
  'golden-tasks:check',
  'e2e-helpers:prove',
  'e2e-receipt:prove',
  'e2e-runner:prove',
  'arch',
  'api:smoke',
]);

export const OPTIONAL_ALWAYS_ON = Object.freeze([
  'public-text-policy:prove',
  'quality:traceability:prove',
  'provider-egress:prove',
]);

export const CORE_REQUIRED = Object.freeze([
  'db:prove',
  'runtime:prove',
  'graph:prove',
  'pipeline:prove',
  'api:validate',
]);

export const LIVE_REQUIRED = Object.freeze(['e2e:isolated']);

export function parseRegressionArgs(argv) {
  const flags = argv.filter((arg) => arg.startsWith('-'));
  const unknown = flags.filter((flag) => !KNOWN_FLAGS.includes(flag));
  return {
    wantCore: flags.includes('--core'),
    wantLive: flags.includes('--live'),
    dryRun: flags.includes('--dry-run'),
    unknown,
  };
}

export function readPackageScripts(root = ROOT) {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  return pkg.scripts && typeof pkg.scripts === 'object' ? pkg.scripts : {};
}

export function loadDotenvValues(root = ROOT) {
  const values = {};
  const path = resolve(root, '.env');
  if (!existsSync(path)) return values;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return values;
}

export function resolveLiveProviderKey(processEnv = process.env, dotenvValues = {}) {
  const raw = processEnv.MODEL_API_KEY ?? dotenvValues.MODEL_API_KEY;
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return { ok: false, source: null };
  }
  return {
    ok: true,
    source: processEnv.MODEL_API_KEY && processEnv.MODEL_API_KEY.trim() ? 'env' : 'dotenv',
  };
}

export function planRegression({ wantCore, wantLive, scripts }) {
  const missingRequired = [];
  const optionalPresent = [];
  const optionalAbsent = [];
  const alwaysOn = [];

  for (const name of ALWAYS_ON_REQUIRED) {
    if (!scripts[name]) missingRequired.push(name);
    else alwaysOn.push(name);
  }
  for (const name of OPTIONAL_ALWAYS_ON) {
    if (scripts[name]) {
      optionalPresent.push(name);
      alwaysOn.push(name);
    } else {
      optionalAbsent.push(name);
    }
  }

  const core = [];
  if (wantCore) {
    for (const name of CORE_REQUIRED) {
      if (!scripts[name]) missingRequired.push(name);
      else core.push(name);
    }
  }

  const live = [];
  if (wantLive) {
    for (const name of LIVE_REQUIRED) {
      if (!scripts[name]) missingRequired.push(name);
      else live.push(name);
    }
  }

  return {
    alwaysOn,
    core,
    live,
    steps: [...alwaysOn, ...core, ...live],
    optionalPresent,
    optionalAbsent,
    missingRequired,
    releaseEvidence: false,
  };
}

export function summarizeOutcome({ wantCore, wantLive }) {
  if (wantCore && wantLive) return 'passed_always_on_core_and_http_e2e';
  if (wantLive) return 'passed_always_on_and_http_e2e';
  if (wantCore) return 'passed_always_on_and_core';
  return 'passed_always_on';
}

function failClosed(message, code = 1) {
  console.error(message);
  process.exit(code);
}

function run(name, env) {
  return new Promise((resolve, reject) => {
    console.log(`\n========== regression: ${name} ==========`);
    const child = spawn('pnpm', [name], { cwd: ROOT, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      resolve({ name, code: signal ? 1 : (code ?? 1), signal: signal ?? null });
    });
  });
}

export async function main(argv = process.argv.slice(2), processEnv = process.env) {
  const started = Date.now();
  const args = parseRegressionArgs(argv);
  if (args.unknown.length) {
    failClosed(`regression_unknown_flag:${args.unknown.join(',')}`, 2);
  }

  const scripts = readPackageScripts(ROOT);
  const plan = planRegression({
    wantCore: args.wantCore,
    wantLive: args.wantLive,
    scripts,
  });
  if (plan.missingRequired.length) {
    failClosed(`regression_required_script_missing:${plan.missingRequired.join(',')}`);
  }

  const skipDotenv = processEnv.REGRESSION_SKIP_DOTENV === '1';
  const dotenvValues = skipDotenv ? {} : loadDotenvValues(ROOT);
  const liveKey = resolveLiveProviderKey(processEnv, dotenvValues);
  if (args.wantLive && !liveKey.ok) {
    console.error('live_provider_key_missing:MODEL_API_KEY');
    failClosed('regression_live_not_run: set MODEL_API_KEY and rerun `pnpm regression --live`. Do not treat this as pass.');
  }

  if (args.dryRun) {
    console.log(`REGRESSION_PLAN ${JSON.stringify({
      order: LANE_ORDER,
      requested: { alwaysOn: true, core: args.wantCore, live: args.wantLive },
      steps: plan.steps,
      optionalWired: plan.optionalPresent,
      optionalAbsent: plan.optionalAbsent,
      releaseEvidence: false,
      dryRun: true,
    })}`);
    return 0;
  }

  const env = { ...processEnv };
  if (!skipDotenv) {
    for (const [key, value] of Object.entries(dotenvValues)) {
      if (!env[key]) env[key] = value;
    }
  }

  const results = [];
  for (const name of plan.steps) {
    const result = await run(name, env);
    results.push(result);
    if (result.code !== 0) {
      failClosed(`regression_failed:${name}:exit=${result.code}`, result.code);
    }
  }

  if (args.wantLive) {
    console.log('browser UI E2E not included. After `pnpm -C apps/web build`, run `pnpm e2e:ui:isolated` separately.');
  }

  console.log(`\nREGRESSION_SUMMARY ${JSON.stringify({
    outcome: summarizeOutcome({ wantCore: args.wantCore, wantLive: args.wantLive }),
    releaseEvidence: false,
    liveE2E: args.wantLive ? 'http_ran_ui_not_included' : 'not_requested',
    core: args.wantCore ? 'ran' : 'not_requested',
    optionalWired: plan.optionalPresent,
    steps: results,
    durationMs: Date.now() - started,
  })}`);
  if (!args.wantLive) {
    console.log('live HTTP E2E not requested. After interview/API/web/db changes, run `pnpm regression --live` when MODEL_API_KEY is available; otherwise record not_run.');
  }
  if (!args.wantCore) {
    console.log('walking-skeleton core not requested. Use `pnpm regression --core` when Docker/Postgres proves are in scope.');
  }
  return 0;
}

function isDirectInvoke() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(resolve(entry)).href;
}

if (isDirectInvoke()) {
  main().then((code) => {
    if (code) process.exit(code);
  }).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
