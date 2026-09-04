/**
 * Post-change regression entrypoint.
 *
 * Default: always-on gates that do not need live provider keys.
 * --core : walking-skeleton isolated/local proves (Docker / Postgres as each command requires).
 * --live : HTTP E2E only (`e2e:isolated`). Browser UI is a separate command
 *          and needs `pnpm -C apps/web build` first. Missing MODEL_API_KEY
 *          exits non-zero (never skip-as-pass).
 *
 * releaseEvidence is always false. This script does not replace CI verify.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname;
const args = new Set(process.argv.slice(2));
const wantCore = args.has('--core');
const wantLive = args.has('--live');
const unknown = [...args].filter((flag) => !['--core', '--live'].includes(flag));
if (unknown.length) {
  console.error(`regression_unknown_flag:${unknown.join(',')}`);
  process.exit(2);
}

const ALWAYS_ON = [
  ['docs:check', ['docs:check']],
  ['golden-tasks:check', ['golden-tasks:check']],
  ['e2e-helpers:prove', ['e2e-helpers:prove']],
  ['e2e-receipt:prove', ['e2e-receipt:prove']],
  ['e2e-runner:prove', ['e2e-runner:prove']],
  ['e2e-static-guards:check', ['e2e-static-guards:check']],
  ['e2e-static-guards:prove', ['e2e-static-guards:prove']],
  ['arch', ['arch']],
  ['api:smoke', ['api:smoke']],
];

const CORE = [
  ['db:prove', ['db:prove']],
  ['runtime:prove', ['runtime:prove']],
  ['graph:prove', ['graph:prove']],
  ['pipeline:prove', ['pipeline:prove']],
  ['api:validate', ['api:validate']],
];

function loadEnvFile() {
  const env = { ...process.env };
  const path = `${ROOT}.env`;
  if (!existsSync(path)) return env;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !env[match[1]]) env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

function run(name, pnpmArgs, env = process.env) {
  return new Promise((resolve, reject) => {
    console.log(`\n========== regression: ${name} ==========`);
    const child = spawn('pnpm', pnpmArgs, { cwd: ROOT, env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => resolve({ name, code: code ?? 1 }));
  });
}

async function main() {
  const started = Date.now();
  const results = [];
  for (const [name, pnpmArgs] of ALWAYS_ON) {
    const result = await run(name, pnpmArgs);
    results.push(result);
    if (result.code !== 0) {
      console.error(`regression_failed:${name}:exit=${result.code}`);
      process.exit(result.code);
    }
  }

  if (wantCore) {
    for (const [name, pnpmArgs] of CORE) {
      const result = await run(name, pnpmArgs);
      results.push(result);
      if (result.code !== 0) {
        console.error(`regression_failed:${name}:exit=${result.code}`);
        process.exit(result.code);
      }
    }
  }

  if (wantLive) {
    const env = loadEnvFile();
    if (!env.MODEL_API_KEY) {
      console.error('live_provider_key_missing:MODEL_API_KEY');
      console.error('regression_live_not_run: set MODEL_API_KEY and rerun `pnpm regression --live`. Do not treat this as pass.');
      process.exit(1);
    }
    const result = await run('e2e:isolated', ['e2e:isolated'], env);
    results.push(result);
    if (result.code !== 0) {
      console.error(`regression_failed:e2e:isolated:exit=${result.code}`);
      process.exit(result.code);
    }
    console.log('browser UI E2E not included. After `pnpm -C apps/web build`, run `pnpm e2e:ui:isolated` separately.');
  }

  console.log(`\nREGRESSION_SUMMARY ${JSON.stringify({
    outcome: wantLive ? 'passed_always_on_and_http_e2e' : 'passed_always_on_only',
    releaseEvidence: false,
    liveE2E: wantLive ? 'http_ran_ui_not_included' : 'not_requested',
    core: wantCore,
    steps: results,
    durationMs: Date.now() - started,
  })}`);
  if (!wantLive) {
    console.log('live HTTP E2E not requested. After interview/API/web/db changes, run `pnpm regression --live` when MODEL_API_KEY is available; otherwise record not_run.');
  }
  if (!wantCore) {
    console.log('walking-skeleton core not requested. Use `pnpm regression --core` when Docker/Postgres proves are in scope.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
