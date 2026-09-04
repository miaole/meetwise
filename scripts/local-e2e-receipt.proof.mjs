import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeLocalE2EReceipt, writeLocalIsolatedReceipt } from './local-e2e-receipt.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const temporaryRoot = await mkdtemp(join(tmpdir(), 'meetwise-local-e2e-receipt-'));
let passed = 0;
const test = async (name, fn) => {
  await fn();
  passed++;
  console.log(`PASS local E2E receipt: ${name}`);
};
const rejects = async (fn, code) => {
  await assert.rejects(fn, new RegExp(code));
};
const valid = (overrides = {}) => ({
  repoRoot: ROOT,
  receiptRoot: temporaryRoot,
  target: 'e2e:prove',
  outcome: 'passed',
  exitCode: 0,
  startedAt: new Date('2026-08-09T20:00:00.000Z'),
  finishedAt: new Date('2026-08-09T20:00:01.234Z'),
  assertionCount: 73,
  ...overrides,
});

try {
  await test('正常：原子回执包含退出码、时长、断言数、源码与迁移清单摘要', async () => {
    const { receipt, finalPath } = await writeLocalE2EReceipt(valid());
    const persisted = JSON.parse(await readFile(finalPath, 'utf8'));
    assert.equal(receipt.outcome, 'passed');
    assert.equal(persisted.exitCode, 0);
    assert.equal(persisted.durationMs, 1234);
    assert.equal(persisted.assertionCount, 73);
    assert.equal(persisted.releaseEvidence, false);
    assert.deepEqual(Object.keys(persisted.sourceDigests).sort(), [
      'e2e/full.e2e.ts',
      'e2e/helpers/assert.ts',
      'e2e/helpers/auth.ts',
      'e2e/helpers/classify-failure.ts',
      'e2e/helpers/commerce.ts',
      'e2e/helpers/http.ts',
      'e2e/helpers/interview.ts',
      'e2e/helpers/resume.ts',
      'e2e/helpers/sse.ts',
      'e2e/helpers/voice.ts',
      'e2e/ocr-fixture.ts',
      'scripts/run-e2e-isolated.mjs',
      'scripts/run-e2e.mjs',
    ]);
    assert.ok(Object.values(persisted.sourceDigests).every((digest) => /^sha256:[0-9a-f]{64}$/.test(digest)));
    assert.ok(Number.isInteger(persisted.schemaMigrationManifest.count) && persisted.schemaMigrationManifest.count > 0);
    assert.match(persisted.schemaMigrationManifest.latest, /^\d{4}_.+\.sql$/);
    assert.match(persisted.schemaMigrationManifest.digest, /^sha256:[0-9a-f]{64}$/);
  });

  await test('异常：失败退出码仍保留为失败回执，不伪造成通过', async () => {
    const { receipt } = await writeLocalE2EReceipt(valid({ outcome: 'failed', exitCode: 1, assertionCount: null }));
    assert.equal(receipt.outcome, 'failed');
    assert.equal(receipt.assertionCount, null);
  });

  await test('特殊：同一毫秒的两个运行使用不同文件，不能覆盖旧回执', async () => {
    const first = await writeLocalE2EReceipt(valid());
    const second = await writeLocalE2EReceipt(valid());
    assert.notEqual(first.finalPath, second.finalPath);
  });

  await test('逃逸：调用方提供的原始输出不属于回执 schema，秘密不会持久化', async () => {
    const secret = 'fixture-token-should-never-be-stored';
    const { finalPath } = await writeLocalE2EReceipt({ ...valid(), rawOutput: secret, prompt: secret, answer: secret });
    assert.equal((await readFile(finalPath, 'utf8')).includes(secret), false);
  });

  await test('高并发边界：通过与非零退出码不一致时拒绝写入', async () => {
    await rejects(() => writeLocalE2EReceipt(valid({ outcome: 'passed', exitCode: 1 })), 'outcome_exit_code_mismatch');
  });

  await test('复杂边界：源码摘要覆盖客户端、helpers、编排器和隔离器，迁移清单不为空', async () => {
    const { receipt } = await writeLocalE2EReceipt(valid());
    assert.equal(Object.keys(receipt.sourceDigests).length, 13);
    assert.ok(receipt.schemaMigrationManifest.count >= 1);
  });

  await test('刁钻输入：未知目标、倒流时间与无效断言数均被拒绝', async () => {
    await rejects(() => writeLocalE2EReceipt(valid({ target: 'performance:e2e' })), 'target_invalid');
    await rejects(() => writeLocalE2EReceipt(valid({ finishedAt: new Date('2026-08-09T19:59:59.999Z') })), 'time_invalid');
    await rejects(() => writeLocalE2EReceipt(valid({ assertionCount: -1 })), 'assertion_count_invalid');
    const isolated = await writeLocalIsolatedReceipt({
      repoRoot: ROOT, receiptRoot: temporaryRoot, target: 'privacy-erasure:prove:raw', outcome: 'passed', exitCode: 0,
      startedAt: new Date('2026-08-09T20:00:00.000Z'), finishedAt: new Date('2026-08-09T20:00:01.000Z'),
      sourcePaths: ['scripts/local-e2e-receipt.mjs'],
      proofSummary: { passCount: 3, failCount: 0, failureClass: 'none' },
      embedderReal: false,
    });
    assert.equal(isolated.receipt.class, 'local_untrusted_isolated_proof_receipt');
    assert.equal(isolated.receipt.releaseEvidence, false);
    assert.equal(isolated.receipt.target, 'privacy-erasure:prove:raw');
    assert.equal(isolated.receipt.embedderReal, false);
    assert.deepEqual(isolated.receipt.proofSummary, { passCount: 3, failCount: 0, failureClass: 'none' });
    assert.match(isolated.receipt.sourceDigests['scripts/local-e2e-receipt.mjs'], /^sha256:[0-9a-f]{64}$/);
    await rejects(() => writeLocalIsolatedReceipt({
      repoRoot: ROOT, receiptRoot: temporaryRoot, target: '../escape', outcome: 'passed', exitCode: 0,
      startedAt: new Date('2026-08-09T20:00:00.000Z'), finishedAt: new Date('2026-08-09T20:00:01.000Z'), sourcePaths: ['../x'],
    }), 'local_isolated_receipt_target_invalid');
    await rejects(() => writeLocalIsolatedReceipt({
      repoRoot: ROOT, receiptRoot: temporaryRoot, target: 'privacy-erasure:prove:raw', outcome: 'passed', exitCode: 0,
      startedAt: new Date('2026-08-09T20:00:00.000Z'), finishedAt: new Date('2026-08-09T20:00:01.000Z'), sourcePaths: ['../x'],
    }), 'local_isolated_receipt_source_path_invalid');
    await rejects(() => writeLocalIsolatedReceipt({
      repoRoot: ROOT, receiptRoot: temporaryRoot, target: 'privacy-erasure:prove:raw', outcome: 'failed', exitCode: 1,
      startedAt: new Date('2026-08-09T20:00:00.000Z'), finishedAt: new Date('2026-08-09T20:00:01.000Z'), sourcePaths: ['scripts/local-e2e-receipt.mjs'],
      proofSummary: { passCount: 0, failCount: 1, failureClass: 'privacy_assertion_failed', failedCheckIds: ['raw-user-answer'] },
    }), 'local_isolated_receipt_proof_summary_invalid');
    await rejects(() => writeLocalIsolatedReceipt({
      repoRoot: ROOT, receiptRoot: temporaryRoot, target: 'privacy-erasure:prove:raw', outcome: 'passed', exitCode: 0,
      startedAt: new Date('2026-08-09T20:00:00.000Z'), finishedAt: new Date('2026-08-09T20:00:01.000Z'), sourcePaths: ['scripts/local-e2e-receipt.mjs'],
      embedderReal: 'yes',
    }), 'local_isolated_receipt_embedder_real_invalid');
  });
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log(`PASS local E2E receipt proof: ${passed} scenarios`);
