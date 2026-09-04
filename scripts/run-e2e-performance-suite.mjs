/**
 * 可复现的本地全量 E2E/性能门。
 *
 * 所有会写 DB 的步骤都使用临时隔离 PostgreSQL，或由 proof 自建独占库；真实模型/公开数据集
 * benchmark 因费用、网络和供应商配额不可作为确定性 CI，必须用 `retrieval:benchmark [N]` 单独跑并记录证据。
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { assertNoFakeServiceFlags } from './e2e-fake-service-flags.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const steps = [
  ['web production build', ['-C', 'apps/web', 'build']],
  ['schema migration/deploy evolution', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'migrate:prove']],
  ['HTTP full E2E', ['e2e:isolated']],
  ['browser full E2E', ['e2e:ui:isolated']],
  ['browser stream idempotency and render coalescing', ['web:prove']],
  ['resume extraction and format fail-closed contract', ['resume-extract:prove']],
  ['RAG structural chunk and locator contract', ['rag-chunking:prove']],
  ['API burst performance E2E', ['performance:e2e:isolated']],
  ['API contract/integration', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'api:validate']],
  ['API negative paths', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'neg:all']],
  ['HTTP turn idempotency', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'turn-idempotency:prove']],
  ['long-context pressure', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'stress:prove']],
  ['context window boundary', ['window:prove']],
  ['memory isolation and retention boundary', ['memory:prove']],
  ['single-track voice capability contract', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'voice:prove']],
  ['adaptive graph latency routing', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'adaptive-latency:prove']],
  ['scoring and report integrity', ['exec', 'node', 'scripts/run-e2e-isolated.mjs', 'scoring-integrity:prove']],
  ['scoring non-happy-path fixture', ['scoring-golden:prove']],
  ['pgvector HNSW compatibility proof', ['vectorstore:prove']],
  ['RAG immutable generation', ['rag-generation:prove']],
  ['RAG generic corpus version control', ['rag-corpus-version:prove']],
  ['RAG approved source / least-privilege control plane', ['qbank-control-role:prove']],
  ['RAG cache anti-stampede', ['rag-cache:prove']],
  ['retrieval algorithms and adversarial fixture', ['retrieval:prove']],
  ['RAG adversarial fixture', ['rag:adversarial:fixture:prove']],
  ['research capability policy', ['crag:prove']],
  ['agent skills capability policy', ['agent-skills:prove']],
];

const receiptRoot = join(ROOT, '.tmp', 'e2e-receipts');
const receiptId = `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`;
const partialLogPath = join(receiptRoot, `${receiptId}.partial.log`);
const finalLogPath = join(receiptRoot, `${receiptId}.log`);
const partialReceiptPath = join(receiptRoot, `${receiptId}.partial.json`);
const finalReceiptPath = join(receiptRoot, `${receiptId}.json`);
const outputDigest = createHash('sha256');
let outputBytes = 0;
let logStream;

async function gitHead() {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn('git', ['rev-parse', 'HEAD'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] });
    child.stdout.on('data', (chunk) => { output += String(chunk); });
    child.on('error', () => resolve(null));
    child.on('exit', (code) => resolve(code === 0 && /^[0-9a-f]{40}$/.test(output.trim()) ? output.trim() : null));
  });
}

function record(chunk, stream) {
  const buffer = Buffer.from(chunk);
  outputDigest.update(buffer);
  outputBytes += buffer.byteLength;
  logStream?.write(buffer);
  stream.write(buffer);
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    child.stdout.on('data', (chunk) => record(chunk, process.stdout));
    child.stderr.on('data', (chunk) => record(chunk, process.stderr));
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function main() {
  assertNoFakeServiceFlags(process.env);
  await mkdir(receiptRoot, { recursive: true });
  logStream = createWriteStream(partialLogPath, { flags: 'wx' });
  const started = Date.now();
  const evidence = [];
  let failure = null;
  try {
    for (const [name, args] of steps) {
      console.log(`\n========== ${name} ==========`);
      const stepStarted = Date.now();
      const code = await run(args);
      evidence.push({ name, command: ['pnpm', ...args], exitCode: code, durationMs: Date.now() - stepStarted });
      if (code !== 0) {
        failure = `e2e_performance_suite_failed:${name}:exit=${code}`;
        throw new Error(failure);
      }
    }
  } finally {
    await new Promise((resolve, reject) => logStream.end((error) => error ? reject(error) : resolve()));
    const finishedAt = new Date().toISOString();
    const suiteScript = await readFile(new URL(import.meta.url), 'utf8');
    const receipt = {
      schemaVersion: 1,
      class: 'local_untrusted_e2e_receipt',
      startedAt: new Date(started).toISOString(),
      finishedAt,
      outcome: failure ? 'failed' : 'passed',
      failure,
      gitHead: await gitHead(),
      suiteScriptSha256: createHash('sha256').update(suiteScript, 'utf8').digest('hex'),
      outputLog: { file: finalLogPath.replace(`${ROOT}/`, ''), sha256: outputDigest.digest('hex'), bytes: outputBytes },
      steps: evidence,
      releaseEvidence: false,
    };
    await writeFile(partialReceiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    await rename(partialLogPath, finalLogPath);
    await rename(partialReceiptPath, finalReceiptPath);
    console.log(`LOCAL_E2E_RECEIPT ${finalReceiptPath.replace(`${ROOT}/`, '')}`);
  }
  if (failure) throw new Error(failure);
  console.log(`\n✓ full local E2E/performance suite passed in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main().catch((error) => { console.error(error); process.exit(1); });
