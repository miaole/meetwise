#!/usr/bin/env node
/**
 * Counter-proofs for isolated inherited-env allowlist and :raw fail-closed guard.
 * No database, no docker. Fail-closed: any loose regression turns this red.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildInheritedEnv } from './isolated-inherited-env.mjs';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(SCRIPT_DIR);
const failures = [];
function check(name, cond, detail = '') {
  if (!cond) {
    failures.push(`${name}${detail ? `: ${detail}` : ''}`);
    console.error(`FAIL  ${name}${detail ? `: ${detail}` : ''}`);
  } else {
    console.log(`PASS  ${name}`);
  }
}

const polluted = {
  PATH: '/usr/bin',
  HOME: '/tmp/isolated-env-policy',
  NODE_OPTIONS: '--no-warnings',
  LANG: 'C',
  MODEL_API_KEY: 'sk-test-model',
  MODEL_BACKUP_API_KEY: 'sk-test-backup',
  OPENAI_API_KEY: 'sk-openai',
  OPENAI_BASE_URL: 'https://api.openai.invalid',
  ANTHROPIC_API_KEY: 'sk-ant',
  XAI_API_KEY: 'sk-xai',
  DASHSCOPE_API_KEY: 'sk-dash',
  LANGFUSE_PUBLIC_KEY: 'lf-pub',
  DATABASE_URL: 'postgresql://cloud.example/meetwise',
  GITHUB_TOKEN: 'ghp_test',
  AWS_SECRET_ACCESS_KEY: 'aws-secret',
};

const banned = [
  'MODEL_API_KEY', 'MODEL_BACKUP_API_KEY',
  'OPENAI_API_KEY', 'OPENAI_BASE_URL',
  'ANTHROPIC_API_KEY', 'XAI_API_KEY',
  'DASHSCOPE_API_KEY', 'LANGFUSE_PUBLIC_KEY',
  'DATABASE_URL', 'GITHUB_TOKEN', 'AWS_SECRET_ACCESS_KEY',
];

const isolated = buildInheritedEnv(polluted, 'voice:prove:raw');
check('non-live strips provider and data-plane keys', banned.every((key) => !(key in isolated)), JSON.stringify(Object.keys(isolated).sort()));
check('non-live keeps PATH/HOME/NODE_OPTIONS', isolated.PATH === '/usr/bin' && isolated.HOME === polluted.HOME && isolated.NODE_OPTIONS === '--no-warnings');

const live = buildInheritedEnv(polluted, 'e2e:prove');
check('live E2E keeps MODEL_API_KEY only', live.MODEL_API_KEY === 'sk-test-model');
check('live E2E still strips backup and vendor keys',
  !live.MODEL_BACKUP_API_KEY && !live.OPENAI_API_KEY && !live.ANTHROPIC_API_KEY && !live.XAI_API_KEY && !live.DATABASE_URL && !live.GITHUB_TOKEN);

const scoring = buildInheritedEnv(polluted, 'scoring:eval:raw');
check('scoring:eval:raw keeps MODEL_API_KEY', scoring.MODEL_API_KEY === 'sk-test-model');
check('scoring:eval:raw strips vendor keys', !scoring.OPENAI_API_KEY && !scoring.XAI_API_KEY);

const dir = mkdtempSync(join(tmpdir(), 'isolated-env-mut-'));
const mutPath = join(dir, 'isolated-inherited-env.mjs');
const original = readFileSync(new URL('./isolated-inherited-env.mjs', import.meta.url), 'utf8');
writeFileSync(mutPath, 'export function buildInheritedEnv(sourceEnv) { return { ...sourceEnv }; }\n');
const mut = spawnSync(process.execPath, ['--input-type=module', '-e', `
  import { buildInheritedEnv } from ${JSON.stringify(pathToFileURL(mutPath).href)};
  const env = { PATH: '/usr/bin', MODEL_API_KEY: 'sk-leaked', OPENAI_API_KEY: 'sk-openai' };
  const out = buildInheritedEnv(env, 'voice:prove:raw');
  if (out.MODEL_API_KEY || out.OPENAI_API_KEY) {
    console.error('MUT_LEAK');
    process.exit(2);
  }
`], { encoding: 'utf8' });
check('MUT identity-copy inherited env leaks keys (counter-proof goes red)', mut.status === 2 && /MUT_LEAK/.test(`${mut.stdout}\n${mut.stderr}`), `status=${mut.status} out=${mut.stdout} err=${mut.stderr}`);

const guard = join(ROOT, 'scripts/require-e2e-isolated.mjs');
const bare = spawnSync(process.execPath, [guard], { env: { ...process.env, E2E_ISOLATED: '' }, encoding: 'utf8' });
check('bare :raw guard fail-closed without E2E_ISOLATED', bare.status === 1 && /refuse bare :raw/.test(`${bare.stdout}\n${bare.stderr}`), `status=${bare.status}`);
const ok = spawnSync(process.execPath, [guard, '--', process.execPath, '-e', 'process.exit(0)'], { env: { ...process.env, E2E_ISOLATED: '1' }, encoding: 'utf8' });
check('guard allows child when E2E_ISOLATED=1', ok.status === 0, `status=${ok.status} err=${ok.stderr}`);

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const guardPrefix = 'node scripts/require-e2e-isolated.mjs -- ';
const runnerPrefix = 'node scripts/run-e2e-isolated.mjs';
const rawScripts = Object.entries(pkg.scripts).filter(([name]) => name.includes(':raw'));
const unguarded = rawScripts.filter(([, cmd]) => !cmd.startsWith(guardPrefix) && !cmd.startsWith(runnerPrefix));
check(`every non-runner :raw script goes through require-e2e-isolated (${rawScripts.length} raw)`, unguarded.length === 0, unguarded.map(([n]) => n).join(','));
check('voice:prove:raw and graph:prove:raw are guarded',
  String(pkg.scripts['voice:prove:raw'] ?? '').startsWith(guardPrefix)
  && String(pkg.scripts['graph:prove:raw'] ?? '').startsWith(guardPrefix));

if (failures.length) {
  console.error(`isolated-env-policy:prove FAILED ${failures.length}`);
  process.exit(1);
}
console.log('PASS isolated-env-policy:prove');
