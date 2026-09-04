/**
 * Fail-closed proofs for the Meetwise E2E directory contract.
 * Planted violations must be non-zero. Empty errors on a planted case is skip-as-pass.
 */
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  ONE_OFF_NARRATIVE_TOKENS,
  checkCoreBoundaries,
  scanHelperSource,
  scanRunnerSource,
} from './core-boundaries.mjs';
import {
  REQUIRED_HELPERS,
  REQUIRED_PLATFORM_FILES,
  REQUIRED_RUNNERS,
  REQUIRED_SCENARIOS,
  checkDirectoryContract,
  checkRequiredPaths,
  inspectE2eLayout,
} from './directory-contract.mjs';
import { loopExitCode, parseArgs, runReviewLoop } from './review-loop.mjs';
import { writeReviewRecord } from './review-record.mjs';
import { FORBIDDEN_TRUST_CLAIMS, checkTrustGuard, scanTrustSource } from './trust-guard.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CHECK = join(ROOT, 'scripts/e2e-platform/check.mjs');
let passed = 0;

const test = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`PASS e2e-platform: ${name}`);
};

const mustFail = (errors, code) => {
  if (!Array.isArray(errors) || errors.length === 0) {
    throw new Error(`e2e_platform_check_skip_as_pass:${code}`);
  }
  assert.ok(errors.some((error) => String(error).includes(code)), `expected ${code} in ${JSON.stringify(errors)}`);
};

const runCheck = (args = [], cwd = ROOT) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [CHECK, ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', reject);
  child.on('exit', (code) => resolve({ code: code ?? 1, stdout, stderr }));
});

const writeTree = async (root, files) => {
  for (const [relPath, body] of Object.entries(files)) {
    const absolute = join(root, relPath);
    await mkdir(dirname(absolute), { recursive: true });
    await writeFile(absolute, body);
  }
};

await test('正：当前仓库目录契约、信任守卫与核心边界均为空错误', async () => {
  const directory = checkDirectoryContract(ROOT);
  const trust = checkTrustGuard(ROOT);
  const boundaries = checkCoreBoundaries(ROOT);
  assert.deepEqual(directory.errors, []);
  assert.deepEqual(trust.errors, []);
  assert.deepEqual(boundaries.errors, []);
  assert.equal(directory.releaseEvidence, false);
  assert.equal(trust.releaseEvidence, false);
  const cli = await runCheck();
  assert.equal(cli.code, 0, cli.stderr);
  assert.match(cli.stdout, /passed_directory_contract_core_boundaries_and_trust/);
  assert.match(cli.stdout, /"releaseEvidence":false/);
  assert.match(cli.stdout, /"aiOutputTrusted":false/);
  assert.ok(REQUIRED_PLATFORM_FILES.length >= 8);
  assert.ok(REQUIRED_PLATFORM_FILES.includes('scripts/e2e-platform/prove.mjs'));
});

await test('异：缺失必列运行器不得当成通过', async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'meetwise-e2e-platform-missing-'));
  try {
    mustFail(checkRequiredPaths(temporaryRoot, REQUIRED_RUNNERS), 'e2e_directory_contract_missing:scripts/run-e2e.mjs');
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

await test('特：允许 README，拒绝 e2e 根下杂文件', async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'meetwise-e2e-platform-extra-'));
  try {
    const e2eRoot = join(temporaryRoot, 'e2e');
    await writeTree(temporaryRoot, {
      'e2e/README.md': '# e2e\n',
      'e2e/full.e2e.ts': 'export {}\n',
      'e2e/ocr-fixture.ts': 'export {}\n',
      'e2e/helpers/http.ts': 'export const BASE = "http://127.0.0.1";\n',
      'e2e/notes.txt': 'out of contract\n',
    });
    const errors = inspectE2eLayout(e2eRoot);
    mustFail(errors, 'e2e_directory_contract_unexpected_e2e_file:e2e/notes.txt');
    assert.equal(errors.some((error) => error.includes('README.md')), false);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

await test('逃：--skip-core-boundaries 仍跑目录契约；未知旗标非零；不能跳过目录契约', async () => {
  const skipped = await runCheck(['--skip-core-boundaries']);
  assert.equal(skipped.code, 0, skipped.stderr);
  assert.match(skipped.stdout, /passed_directory_contract_and_trust/);
  assert.match(skipped.stdout, /"trustGuard":"ran"/);
  const unknown = await runCheck(['--skip-directory-contract']);
  assert.equal(unknown.code, 2);
  assert.match(unknown.stderr, /e2e_platform_unknown_flag:--skip-directory-contract/);
});

await test('并：领域树与 helpers 里的场景文件同时失败，不能只报一个', async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'meetwise-e2e-platform-both-'));
  try {
    const e2eRoot = join(temporaryRoot, 'e2e');
    await writeTree(temporaryRoot, {
      'e2e/full.e2e.ts': 'export {}\n',
      'e2e/helpers/http.ts': 'export {}\n',
      'e2e/helpers/story.e2e.ts': 'export async function main() {}\n',
      'e2e/booking/flow.ts': 'export {}\n',
    });
    const errors = inspectE2eLayout(e2eRoot);
    mustFail(errors, 'e2e_directory_contract_forbidden_domain_tree:e2e/booking');
    mustFail(errors, 'e2e_directory_contract_helper_not_shared_module:e2e/helpers/story.e2e.ts');
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

await test('复：helpers 子目录（抄来的领域树）失败', async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), 'meetwise-e2e-platform-subtree-'));
  try {
    const e2eRoot = join(temporaryRoot, 'e2e');
    await writeTree(temporaryRoot, {
      'e2e/full.e2e.ts': 'export {}\n',
      'e2e/helpers/http.ts': 'export {}\n',
      'e2e/helpers/commerce/orders.ts': 'export {}\n',
    });
    mustFail(inspectE2eLayout(e2eRoot), 'e2e_directory_contract_forbidden_helper_subtree:e2e/helpers/commerce');
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

await test('刁：一次性叙事、场景 main、反向 import 必须被核心边界抓住', async () => {
  const token = ONE_OFF_NARRATIVE_TOKENS[0];
  mustFail(
    scanHelperSource('e2e/helpers/http.ts', `export async function main() {\n  const resume = '${token}';\n}\nimport x from '../full.e2e.ts';\n`),
    'e2e_core_boundaries_helper_has_scenario_main:e2e/helpers/http.ts',
  );
  const helperErrors = scanHelperSource(
    'e2e/helpers/http.ts',
    `import story from '../full.e2e.ts';\nexport const text = '${token}';\n`,
  );
  mustFail(helperErrors, 'e2e_core_boundaries_helper_imports_scenario:e2e/helpers/http.ts');
  mustFail(helperErrors, 'e2e_core_boundaries_helper_one_off_narrative:e2e/helpers/http.ts');
  mustFail(
    scanRunnerSource('scripts/run-e2e.mjs', `const story = '${token}';\n`),
    'e2e_core_boundaries_runner_one_off_narrative:scripts/run-e2e.mjs',
  );
  assert.deepEqual(scanHelperSource('e2e/helpers/http.ts', 'export const BASE = "http://127.0.0.1";\n'), []);
  assert.deepEqual(scanHelperSource('e2e/helpers/e2e-helpers.proof.ts', `const token = '${token}';\n`), []);
  assert.ok(REQUIRED_HELPERS.length >= 8 && REQUIRED_SCENARIOS.length >= 2 && REQUIRED_RUNNERS.length >= 5);
  assert.ok(ONE_OFF_NARRATIVE_TOKENS.length >= 3);
});

const validSteps = () => ({
  refactor: { command: 'pnpm e2e-platform:check', outcome: 'passed', exit: 0 },
  test: { command: 'pnpm e2e-platform:prove', outcome: 'passed', exit: 0 },
  ui: { command: 'pnpm e2e:ui:isolated', outcome: 'not_requested', exit: null },
  regression: { command: 'pnpm regression', outcome: 'not_requested', exit: null },
});

await test('刁：AI 默认信任、密钥字段、覆盖旧回执、状态与步骤不一致一律失败', async () => {
  await mkdir(join(ROOT, '.tmp'), { recursive: true });
  const temporaryRoot = await mkdtemp(join(ROOT, '.tmp', 'e2e-platform-review-'));
  const startedAt = new Date('2026-09-04T03:00:00.000Z');
  const finishedAt = new Date('2026-09-04T03:00:01.000Z');
  try {
    await assert.rejects(
      () => writeReviewRecord({
        repoRoot: ROOT, receiptRoot: temporaryRoot, reviewStatus: 'pending_review',
        runnerKind: 'injected_for_proof', aiOutputTrusted: true, steps: validSteps(), startedAt, finishedAt,
      }),
      /e2e_review_ai_output_trusted_forbidden/,
    );
    await assert.rejects(
      () => writeReviewRecord({
        repoRoot: ROOT, receiptRoot: temporaryRoot, reviewStatus: 'approved',
        runnerKind: 'injected_for_proof', steps: validSteps(), startedAt, finishedAt,
      }),
      /e2e_review_status_invalid:approved/,
    );
    await assert.rejects(
      () => writeReviewRecord({
        repoRoot: ROOT, receiptRoot: temporaryRoot, reviewStatus: 'pending_review',
        runnerKind: 'injected_for_proof', steps: validSteps(), startedAt, finishedAt, token: 'fixture-token',
      }),
      /e2e_review_forbidden_field:token/,
    );
    await assert.rejects(
      () => writeReviewRecord({
        repoRoot: ROOT, receiptRoot: '/tmp/meetwise-e2e-escape', reviewStatus: 'pending_review',
        runnerKind: 'injected_for_proof', steps: validSteps(), startedAt, finishedAt,
      }),
      /e2e_review_receipt_root_outside_tmp/,
    );
    const failedSteps = {
      ...validSteps(),
      test: { command: 'pnpm e2e-platform:prove', outcome: 'failed', exit: 1 },
    };
    await assert.rejects(
      () => writeReviewRecord({
        repoRoot: ROOT, receiptRoot: temporaryRoot, reviewStatus: 'pending_review',
        runnerKind: 'injected_for_proof', steps: failedSteps, startedAt, finishedAt,
      }),
      /e2e_review_status_step_mismatch:pending_review/,
    );
    const first = await writeReviewRecord({
      repoRoot: ROOT, receiptRoot: temporaryRoot, reviewStatus: 'pending_review',
      runnerKind: 'injected_for_proof', steps: validSteps(), startedAt, finishedAt, round: 1,
    });
    assert.equal(first.receipt.aiOutputTrusted, false);
    assert.equal(first.receipt.releaseEvidence, false);
    assert.equal(first.receipt.reviewStatus, 'pending_review');
    assert.equal(first.receipt.liveE2E, 'not_requested');
    assert.equal(first.receipt.runnerKind, 'injected_for_proof');
    const second = await writeReviewRecord({
      repoRoot: ROOT, receiptRoot: temporaryRoot, reviewStatus: 'pending_review',
      runnerKind: 'injected_for_proof', steps: validSteps(), startedAt, finishedAt, round: 2,
      predecessorReceiptId: first.receiptId,
    });
    assert.notEqual(second.finalPath, first.finalPath);
    mustFail(scanTrustSource('scripts/e2e-platform/check.mjs', `const ok = { ${FORBIDDEN_TRUST_CLAIMS[0]} };\n`), 'e2e_trust_guard_forbidden_claim');
    assert.deepEqual(scanTrustSource('scripts/e2e-platform/e2e-platform.proof.mjs', FORBIDDEN_TRUST_CLAIMS[0]), []);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

await test('逃：loop 禁止信任 AI / 跳过审核；--ui 缺 Key 记 not_run 且非零', async () => {
  assert.throws(() => parseArgs(['--trust-ai']), /e2e_platform_ai_trust_or_skip_review_forbidden/);
  assert.throws(() => parseArgs(['--skip-review']), /e2e_platform_ai_trust_or_skip_review_forbidden/);
  assert.throws(() => parseArgs(['--auto-approve']), /e2e_platform_ai_trust_or_skip_review_forbidden/);
  await mkdir(join(ROOT, '.tmp'), { recursive: true });
  const temporaryRoot = await mkdtemp(join(ROOT, '.tmp', 'e2e-platform-loop-'));
  try {
    const fakeRun = async () => ({ exit: 0 });
    const rejected = await runReviewLoop({
      repoRoot: ROOT,
      argv: ['--ui', '--receipt-root', temporaryRoot],
      receiptRoot: temporaryRoot,
      env: { PATH: process.env.PATH },
      runStep: fakeRun,
    });
    assert.equal(rejected.requestedFailed, true);
    assert.equal(rejected.reviewStatus, 'rejected');
    assert.equal(rejected.steps.ui.outcome, 'not_run');
    assert.equal(rejected.steps.ui.skipReason, 'live_provider_key_missing');
    assert.equal(rejected.receipt.aiOutputTrusted, false);
    assert.equal(rejected.runnerKind, 'injected_for_proof');
    assert.equal(loopExitCode(rejected), 1);

    const pending = await runReviewLoop({
      repoRoot: ROOT,
      argv: ['--receipt-root', temporaryRoot, '--round', '2'],
      receiptRoot: temporaryRoot,
      env: { PATH: process.env.PATH },
      runStep: fakeRun,
    });
    assert.equal(pending.reviewStatus, 'pending_review');
    assert.equal(pending.steps.ui.outcome, 'not_requested');
    assert.equal(pending.receipt.liveE2E, 'not_requested');
    assert.equal(loopExitCode(pending), 2);
    assert.notEqual(loopExitCode({ requestedFailed: false, reviewStatus: 'pending_review' }), 0);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

console.log(`PASS e2e-platform proof: ${passed} scenarios; releaseEvidence=false`);
