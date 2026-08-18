/**
 * Durable control-database ledger for the project-only serial cloud runner.
 *
 * This is not a product migration. It stores no URL, credential, SQL text,
 * user data or child-process output. Every non-terminal attempt has a fence
 * and expiry. A successor may recover it only to clean resources already
 * declared/owned by that attempt; it can never silently execute the suite a
 * second time.
 */
import { createHmac, randomUUID } from 'node:crypto';

export type CloudTestLedgerReceipt = {
  kind: 'cloud_test_serial_receipt';
  runId: string;
  caseId: string;
  status: 'passed' | 'failed' | 'failed_cleanup';
  testOnly: true;
  releaseEvidence: false;
  tlsVerification: 'system-root';
  targetFingerprint: string;
  cleanup: { databaseAbsent: boolean; roleAbsent: boolean };
  failureCode?: string;
};

export type CloudTestOwnedResource = {
  name: string;
  oid?: string;
};

export type CloudTestLedgerStart =
  | { kind: 'execute'; attemptId: string; fenceToken: string }
  | { kind: 'recover'; attemptId: string; fenceToken: string; resourceManifest: Record<string, unknown>; ownedResources: Record<string, CloudTestOwnedResource> }
  | { kind: 'replay'; receipt: CloudTestLedgerReceipt };

type Queryable = {
  query: (sql: string, params?: readonly unknown[]) => Promise<{ rows: Array<Record<string, unknown>>; rowCount?: number | null }>;
};

type LedgerStatus = 'requested' | 'leased' | 'executing' | 'recovering' | 'cleaned' | 'failed' | 'failed_cleanup';

const TERMINAL_STATUSES = new Set<LedgerStatus>(['cleaned', 'failed', 'failed_cleanup']);
const FAILURE_CODE = /^[a-z0-9][a-z0-9_:-]{2,120}$/;
const LEASE_SECONDS = 300;

function failure(code: string): never {
  throw new Error(`cloud_test_serial_ledger_${code}`);
}

function stableJson(value: unknown): string {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (!value || typeof value !== 'object') failure('value_invalid');
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`).join(',')}}`;
}

function receiptMac(receipt: CloudTestLedgerReceipt, hmacKey: string): string {
  return createHmac('sha256', hmacKey).update(stableJson(receipt)).digest('hex');
}

function isResourceMap(value: unknown): value is Record<string, CloudTestOwnedResource> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value as Record<string, unknown>).every((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const resource = item as Record<string, unknown>;
    return typeof resource.name === 'string' && resource.name.length > 0
      && (resource.oid === undefined || (typeof resource.oid === 'string' && /^\d+$/.test(resource.oid)));
  });
}

function isStoredReceipt(value: unknown, runId: string, caseId: string): value is CloudTestLedgerReceipt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  const cleanup = receipt.cleanup;
  const terminal = receipt.status === 'passed' || receipt.status === 'failed' || receipt.status === 'failed_cleanup';
  const failureCode = receipt.failureCode;
  return receipt.kind === 'cloud_test_serial_receipt'
    && receipt.runId === runId
    && receipt.caseId === caseId
    && terminal
    && receipt.testOnly === true
    && receipt.releaseEvidence === false
    && receipt.tlsVerification === 'system-root'
    && typeof receipt.targetFingerprint === 'string' && /^[0-9a-f]{20}$/.test(receipt.targetFingerprint)
    && !!cleanup && typeof cleanup === 'object' && !Array.isArray(cleanup)
    && typeof (cleanup as Record<string, unknown>).databaseAbsent === 'boolean'
    && typeof (cleanup as Record<string, unknown>).roleAbsent === 'boolean'
    && ((receipt.status === 'passed' && failureCode === undefined)
      || (receipt.status !== 'passed' && typeof failureCode === 'string' && FAILURE_CODE.test(failureCode)));
}

function terminalLedgerStatus(receipt: CloudTestLedgerReceipt): LedgerStatus {
  return receipt.status === 'passed' ? 'cleaned' : receipt.status;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asOwnedResources(value: unknown): Record<string, CloudTestOwnedResource> {
  return isResourceMap(value) ? value : {};
}

async function appendEvent(client: Queryable, runId: string, caseId: string, eventType: string, detailDigest?: string): Promise<void> {
  await client.query(
    `INSERT INTO public.meetwise_cloud_test_run_event (run_id, case_id, event_type, detail_digest)
     VALUES ($1, $2, $3, $4)`,
    [runId, caseId, eventType, detailDigest ?? null],
  );
}

async function rollbackQuietly(client: Queryable): Promise<void> {
  await client.query('ROLLBACK').catch(() => {});
}

/** The table is control-plane state, never a test-suite target or business table. */
export async function ensureCloudTestRunLedger(client: Queryable): Promise<void> {
  await client.query('BEGIN');
  try {
    await client.query(`
    CREATE TABLE IF NOT EXISTS public.meetwise_cloud_test_run_ledger (
      run_id text NOT NULL,
      case_id text NOT NULL,
      artifact_digest char(64) NOT NULL,
      status text NOT NULL,
      attempt_id uuid,
      fence_token uuid,
      lease_expires_at timestamptz,
      resource_manifest jsonb NOT NULL,
      owned_resources jsonb NOT NULL DEFAULT '{}'::jsonb,
      failure_code text,
      receipt jsonb,
      receipt_hmac char(64),
      created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      finished_at timestamptz,
      PRIMARY KEY (run_id, case_id)
    )
    `);
    await client.query(`
    ALTER TABLE public.meetwise_cloud_test_run_ledger
      ADD COLUMN IF NOT EXISTS attempt_id uuid,
      ADD COLUMN IF NOT EXISTS fence_token uuid,
      ADD COLUMN IF NOT EXISTS lease_expires_at timestamptz,
      ADD COLUMN IF NOT EXISTS owned_resources jsonb NOT NULL DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS failure_code text
    `);
    // Only names created by an earlier version of this control table are
    // eligible for replacement. Never drop arbitrary table constraints.
    await client.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conrelid = 'public.meetwise_cloud_test_run_ledger'::regclass
           AND conname = 'meetwise_cloud_test_run_ledger_status_check'
      ) THEN
        ALTER TABLE public.meetwise_cloud_test_run_ledger
          DROP CONSTRAINT meetwise_cloud_test_run_ledger_status_check;
      END IF;
    END $$
    `);
    await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
         WHERE conrelid = 'public.meetwise_cloud_test_run_ledger'::regclass
           AND conname = 'meetwise_cloud_test_run_ledger_state_check'
      ) THEN
        ALTER TABLE public.meetwise_cloud_test_run_ledger
          ADD CONSTRAINT meetwise_cloud_test_run_ledger_state_check CHECK (
        status IN ('requested', 'leased', 'executing', 'recovering', 'cleaned', 'failed', 'failed_cleanup')
        AND (
          (status IN ('requested', 'leased', 'executing', 'recovering') AND receipt IS NULL AND receipt_hmac IS NULL AND finished_at IS NULL)
          OR (status IN ('cleaned', 'failed', 'failed_cleanup') AND receipt IS NOT NULL AND receipt_hmac IS NOT NULL AND finished_at IS NOT NULL)
        )
          );
      END IF;
    END $$
    `);
    await client.query(`
    CREATE TABLE IF NOT EXISTS public.meetwise_cloud_test_run_event (
      event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      run_id text NOT NULL,
      case_id text NOT NULL,
      event_type text NOT NULL CHECK (event_type IN ('requested', 'leased', 'executing', 'recovering', 'resource_intended', 'resource_owned', 'cleaned', 'failed', 'failed_cleanup')),
      detail_digest char(64),
      created_at timestamptz NOT NULL DEFAULT clock_timestamp()
    )
    `);
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  }
}

/**
 * The caller still holds the instance advisory lock. The primary key and this
 * transaction are a durable second line of defence: event and state cannot
 * diverge, and only an expired attempt can be fenced for recovery.
 */
export async function beginCloudTestRun(
  client: Queryable,
  input: { runId: string; caseId: string; artifactDigest: string; resourceManifest: Record<string, unknown>; receiptHmacKey: string },
): Promise<CloudTestLedgerStart> {
  if (!/^[0-9a-f]{64}$/.test(input.artifactDigest)) failure('artifact_digest_invalid');
  await ensureCloudTestRunLedger(client);
  await client.query('BEGIN');
  try {
    const inserted = await client.query(
      `INSERT INTO public.meetwise_cloud_test_run_ledger
         (run_id, case_id, artifact_digest, status, resource_manifest)
       VALUES ($1, $2, $3, 'requested', $4::jsonb)
       ON CONFLICT (run_id, case_id) DO NOTHING
       RETURNING run_id`,
      [input.runId, input.caseId, input.artifactDigest, stableJson(input.resourceManifest)],
    );
    if ((inserted.rowCount ?? 0) === 1) await appendEvent(client, input.runId, input.caseId, 'requested');

    const existing = await client.query(
      `SELECT artifact_digest, status, receipt, receipt_hmac, resource_manifest, owned_resources
         FROM public.meetwise_cloud_test_run_ledger
        WHERE run_id = $1 AND case_id = $2
        FOR UPDATE`,
      [input.runId, input.caseId],
    );
    const row = existing.rows[0];
    if (!row || row.artifact_digest !== input.artifactDigest) failure('run_artifact_mismatch');
    const status = row.status as LedgerStatus;
    if (TERMINAL_STATUSES.has(status)) {
      if (!isStoredReceipt(row.receipt, input.runId, input.caseId)
        || typeof row.receipt_hmac !== 'string'
        || receiptMac(row.receipt, input.receiptHmacKey) !== row.receipt_hmac) {
        failure('stored_receipt_invalid');
      }
      await client.query('COMMIT');
      return { kind: 'replay', receipt: row.receipt };
    }

    const attemptId = randomUUID();
    const fenceToken = randomUUID();
    if (status === 'requested') {
      if (Object.keys(asOwnedResources(row.owned_resources)).length !== 0) failure('requested_row_has_owned_resources');
      const leased = await client.query(
        `UPDATE public.meetwise_cloud_test_run_ledger
            SET status = 'leased', attempt_id = $3::uuid, fence_token = $4::uuid,
                lease_expires_at = clock_timestamp() + ($5::int * interval '1 second'), updated_at = clock_timestamp()
          WHERE run_id = $1 AND case_id = $2 AND status = 'requested'
          RETURNING run_id`,
        [input.runId, input.caseId, attemptId, fenceToken, LEASE_SECONDS],
      );
      if ((leased.rowCount ?? 0) !== 1) failure('lease_transition_invalid');
      await appendEvent(client, input.runId, input.caseId, 'leased');
      const executing = await client.query(
        `UPDATE public.meetwise_cloud_test_run_ledger
            SET status = 'executing', updated_at = clock_timestamp()
          WHERE run_id = $1 AND case_id = $2 AND status = 'leased'
            AND attempt_id = $3::uuid AND fence_token = $4::uuid
          RETURNING run_id`,
        [input.runId, input.caseId, attemptId, fenceToken],
      );
      if ((executing.rowCount ?? 0) !== 1) failure('execution_transition_invalid');
      await appendEvent(client, input.runId, input.caseId, 'executing');
      await client.query('COMMIT');
      return { kind: 'execute', attemptId, fenceToken };
    }

    const takeover = await client.query(
      `UPDATE public.meetwise_cloud_test_run_ledger
          SET status = 'recovering', attempt_id = $3::uuid, fence_token = $4::uuid,
              lease_expires_at = clock_timestamp() + ($5::int * interval '1 second'), updated_at = clock_timestamp()
        WHERE run_id = $1 AND case_id = $2
          AND status IN ('leased', 'executing', 'recovering')
          AND lease_expires_at <= clock_timestamp()
        RETURNING resource_manifest, owned_resources`,
      [input.runId, input.caseId, attemptId, fenceToken, LEASE_SECONDS],
    );
    if ((takeover.rowCount ?? 0) !== 1) failure('run_active_or_not_recoverable');
    await appendEvent(client, input.runId, input.caseId, 'recovering');
    await client.query('COMMIT');
    return {
      kind: 'recover',
      attemptId,
      fenceToken,
      resourceManifest: asRecord(takeover.rows[0]?.resource_manifest),
      ownedResources: asOwnedResources(takeover.rows[0]?.owned_resources),
    };
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  }
}

export async function recordCloudTestResourceIntent(
  client: Queryable,
  input: { runId: string; caseId: string; attemptId: string; fenceToken: string; resourceKey: string; name: string },
): Promise<void> {
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(input.resourceKey) || !/^[a-z][a-z0-9_]{2,62}$/.test(input.name)) failure('resource_intent_invalid');
  await client.query('BEGIN');
  try {
    const result = await client.query(
      `UPDATE public.meetwise_cloud_test_run_ledger
          SET resource_manifest = resource_manifest || jsonb_build_object($5::text, jsonb_build_object('name', $6::text)),
              updated_at = clock_timestamp()
        WHERE run_id = $1 AND case_id = $2 AND status = 'executing'
          AND attempt_id = $3::uuid AND fence_token = $4::uuid
        RETURNING run_id`,
      [input.runId, input.caseId, input.attemptId, input.fenceToken, input.resourceKey, input.name],
    );
    if ((result.rowCount ?? 0) !== 1) failure('resource_intent_fence_invalid');
    await appendEvent(client, input.runId, input.caseId, 'resource_intended');
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  }
}

export async function recordCloudTestOwnedResource(
  client: Queryable,
  input: { runId: string; caseId: string; attemptId: string; fenceToken: string; resourceKey: string; name: string; oid: string },
): Promise<void> {
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(input.resourceKey) || !/^[a-z][a-z0-9_]{2,62}$/.test(input.name) || !/^\d+$/.test(input.oid)) {
    failure('resource_owned_invalid');
  }
  await client.query('BEGIN');
  try {
    const result = await client.query(
      `UPDATE public.meetwise_cloud_test_run_ledger
          SET owned_resources = owned_resources || jsonb_build_object($5::text, jsonb_build_object('name', $6::text, 'oid', $7::text)),
              updated_at = clock_timestamp()
        WHERE run_id = $1 AND case_id = $2 AND status = 'executing'
          AND attempt_id = $3::uuid AND fence_token = $4::uuid
        RETURNING run_id`,
      [input.runId, input.caseId, input.attemptId, input.fenceToken, input.resourceKey, input.name, input.oid],
    );
    if ((result.rowCount ?? 0) !== 1) failure('resource_owned_fence_invalid');
    await appendEvent(client, input.runId, input.caseId, 'resource_owned');
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  }
}

/** A terminal receipt can only be committed by the current executing/recovery fence. */
export async function completeCloudTestRun(
  client: Queryable,
  input: { runId: string; caseId: string; attemptId: string; fenceToken: string; receipt: CloudTestLedgerReceipt; receiptHmacKey: string },
): Promise<void> {
  if (!isStoredReceipt(input.receipt, input.runId, input.caseId)) failure('completion_receipt_invalid');
  if (input.receipt.status === 'passed' && (!input.receipt.cleanup.databaseAbsent || !input.receipt.cleanup.roleAbsent)) {
    failure('passed_cleanup_invalid');
  }
  const hmac = receiptMac(input.receipt, input.receiptHmacKey);
  const status = terminalLedgerStatus(input.receipt);
  await client.query('BEGIN');
  try {
    const completed = await client.query(
      `UPDATE public.meetwise_cloud_test_run_ledger
          SET status = $7, receipt = $5::jsonb, receipt_hmac = $6, failure_code = $8,
              updated_at = clock_timestamp(), finished_at = clock_timestamp(), lease_expires_at = NULL
        WHERE run_id = $1 AND case_id = $2 AND status IN ('executing', 'recovering')
          AND attempt_id = $3::uuid AND fence_token = $4::uuid
        RETURNING run_id`,
      [input.runId, input.caseId, input.attemptId, input.fenceToken, stableJson(input.receipt), hmac, status, input.receipt.failureCode ?? null],
    );
    if ((completed.rowCount ?? 0) !== 1) failure('completion_transition_invalid');
    await appendEvent(client, input.runId, input.caseId, status, hmac);
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  }
}
