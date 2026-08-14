import assert from 'node:assert/strict';
import {
  beginCloudTestRun,
  completeCloudTestRun,
  recordCloudTestOwnedResource,
  recordCloudTestResourceIntent,
  type CloudTestLedgerReceipt,
} from '../src/cloud-test-run-ledger.ts';

type Row = {
  artifact_digest: string;
  status: string;
  attempt_id?: string;
  fence_token?: string;
  receipt?: unknown;
  receipt_hmac?: string;
  resource_manifest: Record<string, unknown>;
  owned_resources: Record<string, unknown>;
  expired?: boolean;
};

/**
 * Deterministic transaction seam. The real PostgreSQL crash/concurrency suite
 * remains a required cloud gate; this proof checks that the source-level
 * ledger never presents a non-terminal run as a second execution.
 */
class LedgerFixture {
  readonly rows = new Map<string, Row>();
  readonly events: string[] = [];

  async query(sql: string, parameters: readonly unknown[] = []) {
    const normalized = sql.replace(/\s+/g, ' ').trim();
    if (normalized === 'BEGIN' || normalized === 'COMMIT' || normalized === 'ROLLBACK') return { rows: [], rowCount: null };
    if (normalized.startsWith('CREATE TABLE') || normalized.startsWith('ALTER TABLE') || normalized.startsWith('DO $$')) return { rows: [], rowCount: null };
    if (normalized.startsWith('INSERT INTO public.meetwise_cloud_test_run_event')) {
      this.events.push(String(parameters[2]));
      return { rows: [], rowCount: 1 };
    }
    const key = `${String(parameters[0])}:${String(parameters[1])}`;
    if (normalized.startsWith('INSERT INTO public.meetwise_cloud_test_run_ledger')) {
      if (this.rows.has(key)) return { rows: [], rowCount: 0 };
      this.rows.set(key, {
        artifact_digest: String(parameters[2]), status: 'requested',
        resource_manifest: JSON.parse(String(parameters[3])), owned_resources: {},
      });
      return { rows: [{ run_id: parameters[0] }], rowCount: 1 };
    }
    if (normalized.startsWith('SELECT artifact_digest')) {
      const row = this.rows.get(key);
      return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
    }
    if (normalized.startsWith('UPDATE public.meetwise_cloud_test_run_ledger')) {
      const row = this.rows.get(key);
      if (!row) return { rows: [], rowCount: 0 };
      if (normalized.includes("SET status = 'leased'")) {
        if (row.status !== 'requested') return { rows: [], rowCount: 0 };
        row.status = 'leased'; row.attempt_id = String(parameters[2]); row.fence_token = String(parameters[3]);
        return { rows: [{ run_id: parameters[0] }], rowCount: 1 };
      }
      if (normalized.includes("SET status = 'executing'")) {
        if (row.status !== 'leased' || row.attempt_id !== parameters[2] || row.fence_token !== parameters[3]) return { rows: [], rowCount: 0 };
        row.status = 'executing'; return { rows: [{ run_id: parameters[0] }], rowCount: 1 };
      }
      if (normalized.includes("SET status = 'recovering'")) {
        if (!['leased', 'executing', 'recovering'].includes(row.status) || !row.expired) return { rows: [], rowCount: 0 };
        row.status = 'recovering'; row.attempt_id = String(parameters[2]); row.fence_token = String(parameters[3]); row.expired = false;
        return { rows: [{ resource_manifest: row.resource_manifest, owned_resources: row.owned_resources }], rowCount: 1 };
      }
      if (normalized.includes('SET resource_manifest = resource_manifest')) {
        if (row.status !== 'executing' || row.attempt_id !== parameters[2] || row.fence_token !== parameters[3]) return { rows: [], rowCount: 0 };
        row.resource_manifest[String(parameters[4])] = { name: parameters[5] };
        return { rows: [{ run_id: parameters[0] }], rowCount: 1 };
      }
      if (normalized.includes('SET owned_resources = owned_resources')) {
        if (row.status !== 'executing' || row.attempt_id !== parameters[2] || row.fence_token !== parameters[3]) return { rows: [], rowCount: 0 };
        row.owned_resources[String(parameters[4])] = { name: parameters[5], oid: parameters[6] };
        return { rows: [{ run_id: parameters[0] }], rowCount: 1 };
      }
      if (normalized.includes('SET status = $7')) {
        if (!['executing', 'recovering'].includes(row.status) || row.attempt_id !== parameters[2] || row.fence_token !== parameters[3]) return { rows: [], rowCount: 0 };
        row.status = String(parameters[6]); row.receipt = JSON.parse(String(parameters[4])); row.receipt_hmac = String(parameters[5]);
        return { rows: [{ run_id: parameters[0] }], rowCount: 1 };
      }
    }
    throw new Error(`unexpected_ledger_fixture_query:${normalized.slice(0, 80)}`);
  }
}

const fixture = new LedgerFixture();
const input = {
  runId: 'cloudtest-20260812-ledger-a',
  caseId: 'TC-CLOUD-TEST-001-main',
  artifactDigest: 'a'.repeat(64),
  resourceManifest: {
    resourceClass: 'database-local',
    database: { name: 'meetwise_e2e_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
    role: { name: 'mw_e2e_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
  },
  receiptHmacKey: 'test-only-hmac-key-that-is-at-least-32-bytes',
};
const first = await beginCloudTestRun(fixture, input);
assert.equal(first.kind, 'execute');
if (first.kind !== 'execute') throw new Error('expected_execute');
await recordCloudTestResourceIntent(fixture, { ...input, attemptId: first.attemptId, fenceToken: first.fenceToken, resourceKey: 'database', name: 'meetwise_e2e_a' });
await recordCloudTestOwnedResource(fixture, { ...input, attemptId: first.attemptId, fenceToken: first.fenceToken, resourceKey: 'database', name: 'meetwise_e2e_a', oid: '12345' });
const receipt: CloudTestLedgerReceipt = {
  kind: 'cloud_test_serial_receipt', runId: input.runId, caseId: input.caseId, status: 'passed',
  testOnly: true, releaseEvidence: false, tlsVerification: 'system-root', targetFingerprint: 'f'.repeat(20),
  cleanup: { databaseAbsent: true, roleAbsent: true },
};
await completeCloudTestRun(fixture, { ...input, attemptId: first.attemptId, fenceToken: first.fenceToken, receipt });
assert.deepEqual(await beginCloudTestRun(fixture, input), { kind: 'replay', receipt });
assert.equal(fixture.events.filter((event) => event === 'executing').length, 1, 'a completed run is never executed twice');

const crashInput = { ...input, runId: 'cloudtest-20260812-ledger-b' };
const crashed = await beginCloudTestRun(fixture, crashInput);
assert.equal(crashed.kind, 'execute');
if (crashed.kind !== 'execute') throw new Error('expected_execute');
await recordCloudTestResourceIntent(fixture, { ...crashInput, attemptId: crashed.attemptId, fenceToken: crashed.fenceToken, resourceKey: 'role', name: 'mw_e2e_b' });
await recordCloudTestOwnedResource(fixture, { ...crashInput, attemptId: crashed.attemptId, fenceToken: crashed.fenceToken, resourceKey: 'role', name: 'mw_e2e_b', oid: '54321' });
const crashRow = fixture.rows.get(`${crashInput.runId}:${crashInput.caseId}`)!;
crashRow.expired = true;
const recovered = await beginCloudTestRun(fixture, crashInput);
assert.equal(recovered.kind, 'recover', 'an expired execution can only be recovered for cleanup');
if (recovered.kind !== 'recover') throw new Error('expected_recover');
assert.deepEqual(recovered.ownedResources, { role: { name: 'mw_e2e_b', oid: '54321' } });
const failedReceipt: CloudTestLedgerReceipt = {
  kind: 'cloud_test_serial_receipt', runId: crashInput.runId, caseId: crashInput.caseId, status: 'failed',
  testOnly: true, releaseEvidence: false, tlsVerification: 'system-root', targetFingerprint: 'e'.repeat(20),
  cleanup: { databaseAbsent: true, roleAbsent: true }, failureCode: 'runner_interrupted',
};
await completeCloudTestRun(fixture, { ...crashInput, attemptId: recovered.attemptId, fenceToken: recovered.fenceToken, receipt: failedReceipt });
assert.deepEqual(await beginCloudTestRun(fixture, crashInput), { kind: 'replay', receipt: failedReceipt });

// A process may die immediately after the executing transaction commits,
// before it has issued even the first resource-intent statement. The planned
// names committed with that lease make the successor terminal rather than
// looping forever in recovery.
const beforeIntentInput = { ...input, runId: 'cloudtest-20260812-ledger-d' };
const beforeIntent = await beginCloudTestRun(fixture, beforeIntentInput);
assert.equal(beforeIntent.kind, 'execute');
const beforeIntentRow = fixture.rows.get(`${beforeIntentInput.runId}:${beforeIntentInput.caseId}`)!;
beforeIntentRow.expired = true;
const beforeIntentRecovery = await beginCloudTestRun(fixture, beforeIntentInput);
assert.equal(beforeIntentRecovery.kind, 'recover');
if (beforeIntentRecovery.kind !== 'recover') throw new Error('expected_recover');
assert.deepEqual(beforeIntentRecovery.ownedResources, {}, 'no unproven resource is eligible for cleanup');
const beforeIntentReceipt: CloudTestLedgerReceipt = {
  kind: 'cloud_test_serial_receipt', runId: beforeIntentInput.runId, caseId: beforeIntentInput.caseId, status: 'failed',
  testOnly: true, releaseEvidence: false, tlsVerification: 'system-root', targetFingerprint: 'd'.repeat(20),
  cleanup: { databaseAbsent: true, roleAbsent: true }, failureCode: 'expired_attempt_recovered',
};
await completeCloudTestRun(fixture, {
  ...beforeIntentInput, attemptId: beforeIntentRecovery.attemptId, fenceToken: beforeIntentRecovery.fenceToken,
  receipt: beforeIntentReceipt,
});
assert.deepEqual(await beginCloudTestRun(fixture, beforeIntentInput), { kind: 'replay', receipt: beforeIntentReceipt });

const activeInput = { ...input, runId: 'cloudtest-20260812-ledger-c' };
await beginCloudTestRun(fixture, activeInput);
await assert.rejects(beginCloudTestRun(fixture, activeInput), /cloud_test_serial_ledger_run_active_or_not_recoverable/);
await assert.rejects(beginCloudTestRun(fixture, { ...input, artifactDigest: 'b'.repeat(64) }), /cloud_test_serial_ledger_run_artifact_mismatch/);
console.log('✓ cloud run ledger fences attempts, records intent/ownership, replays terminal receipts, and recovers expired attempts only for cleanup');
