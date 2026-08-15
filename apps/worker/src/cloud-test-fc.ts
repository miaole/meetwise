import { CLOUD_TEST_SERIAL_CASES, cloudTestSerialFailure, type CloudTestSerialCase, type CloudTestSerialReceipt, runCloudTestSerial } from './cloud-test-serial.ts';

const RUN_ID = /^[a-z0-9][a-z0-9-]{5,40}$/;
const SECRET_FIELDS = [
  'schemaVersion', 'tlsMode', 'controlDatabaseUrl', 'receiptHmacKey', 'privateCidrs',
  'targetCertificateSha256', 'targetInstanceId', 'targetVpcId', 'allowedCaseId', 'suiteArtifactSha256',
] as const;

export type CloudTestSerialSecret = {
  schemaVersion: 1;
  tlsMode: 'system-root';
  controlDatabaseUrl: string;
  receiptHmacKey: string;
  privateCidrs: string;
  targetCertificateSha256: string;
  targetInstanceId: string;
  targetVpcId: string;
  allowedCaseId: 'TC-CLOUD-TEST-001-main';
  suiteArtifactSha256: string;
};

export type CloudTestFcDeps = {
  loadSecret: () => Promise<string>;
  /**
   * A non-secret function setting may only strengthen the secret's transport
   * policy. It must never be able to downgrade a strict secret.
   */
  tlsModeOverride?: string | undefined;
  runSerial?: (argv: { runId?: string; caseId?: CloudTestSerialCase }, env: NodeJS.ProcessEnv) => Promise<CloudTestSerialReceipt>;
};

function failure(code: string): never {
  throw new Error(`cloud_test_fc_${code}`);
}

function parseEvent(event: unknown): { runId: string; caseId: CloudTestSerialCase } {
  let value: unknown = event;
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) value = Buffer.from(value).toString('utf8');
  if (typeof value === 'string') {
    try { value = JSON.parse(value); }
    catch { return failure('event_invalid'); }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return failure('event_invalid');
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 2 || typeof record.runId !== 'string' || !RUN_ID.test(record.runId)
    || typeof record.caseId !== 'string' || !(CLOUD_TEST_SERIAL_CASES as readonly string[]).includes(record.caseId))
    return failure('event_invalid');
  return { runId: record.runId, caseId: record.caseId as CloudTestSerialCase };
}

export function parseCloudTestSerialSecret(value: string): CloudTestSerialSecret {
  let parsed: unknown;
  try { parsed = JSON.parse(value); }
  catch { return failure('secret_invalid'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return failure('secret_invalid');
  const record = parsed as Record<string, unknown>;
  if (Object.keys(record).length !== SECRET_FIELDS.length || SECRET_FIELDS.some((field) => !(field in record)))
    return failure('secret_schema_invalid');
  if (record.schemaVersion !== 1
    || record.tlsMode !== 'system-root'
    || ['controlDatabaseUrl', 'receiptHmacKey', 'privateCidrs'].some((field) => typeof record[field] !== 'string' || !(record[field] as string).trim()))
    return failure('secret_schema_invalid');
  if (typeof record.targetCertificateSha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(record.targetCertificateSha256)) {
    return failure('secret_schema_invalid');
  }
  if (typeof record.targetInstanceId !== 'string' || typeof record.targetVpcId !== 'string'
    || !/^[a-z0-9][a-z0-9-]{2,127}$/i.test(record.targetInstanceId)
    || !/^[a-z0-9][a-z0-9-]{2,127}$/i.test(record.targetVpcId)
    || record.allowedCaseId !== 'TC-CLOUD-TEST-001-main'
    || typeof record.suiteArtifactSha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(record.suiteArtifactSha256)) {
    return failure('secret_schema_invalid');
  }
  return record as CloudTestSerialSecret;
}

function effectiveTlsMode(secret: CloudTestSerialSecret, override: string | undefined): CloudTestSerialSecret['tlsMode'] {
  if (!override?.trim() || override === 'system-root') return secret.tlsMode;
  return failure('tls_mode_override_invalid');
}

function executorEnvironment(
  invocation: { runId: string; caseId: CloudTestSerialCase },
  secret: CloudTestSerialSecret,
  tlsModeOverride: string | undefined,
): NodeJS.ProcessEnv {
  return {
    CLOUD_TEST_MODE: 'serial-test-only',
    CLOUD_TEST_RUN_ID: invocation.runId,
    CLOUD_TEST_CASE_ID: invocation.caseId,
    CLOUD_TEST_TLS_MODE: effectiveTlsMode(secret, tlsModeOverride),
    CLOUD_TEST_SERIAL_DATABASE_URL: secret.controlDatabaseUrl,
    CLOUD_TEST_RECEIPT_HMAC_KEY: secret.receiptHmacKey,
    CLOUD_TEST_PRIVATE_CIDRS: secret.privateCidrs,
    CLOUD_TEST_TARGET_CERTIFICATE_SHA256: secret.targetCertificateSha256,
    CLOUD_TEST_TARGET_INSTANCE_ID: secret.targetInstanceId,
    CLOUD_TEST_TARGET_VPC_ID: secret.targetVpcId,
    CLOUD_TEST_ALLOWED_CASE_ID: secret.allowedCaseId,
    CLOUD_TEST_SUITE_ARTIFACT_SHA256: secret.suiteArtifactSha256,
  };
}

function failedReceipt(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return message.startsWith('cloud_test_fc_') ? message : cloudTestSerialFailure(error);
}

/**
 * FC accepts only an opaque run and the one registered capability case.
 * Target selection and all credentials remain in private function settings.
 */
export function createCloudTestFcHandler(deps: CloudTestFcDeps) {
  const run = deps.runSerial ?? runCloudTestSerial;
  return async (event: unknown): Promise<string> => {
    try {
      const invocation = parseEvent(event);
      if (invocation.caseId !== 'TC-CLOUD-TEST-001-main') failure('case_requires_resettable_cluster');
      let secret: CloudTestSerialSecret;
      try { secret = parseCloudTestSerialSecret(await deps.loadSecret()); }
      catch (error) {
        if (error instanceof Error && error.message.startsWith('cloud_test_fc_')) throw error;
        return failure('secret_unavailable');
      }
      return JSON.stringify(await run(invocation, executorEnvironment(invocation, secret, deps.tlsModeOverride)));
    } catch (error) {
      return JSON.stringify({ kind: 'cloud_test_serial_receipt', status: 'failed', testOnly: true, releaseEvidence: false, code: failedReceipt(error) });
    }
  };
}
