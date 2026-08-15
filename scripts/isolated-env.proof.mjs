// Executed only by run-e2e-isolated.mjs. This proves the child process—not
// merely the parent script text—cannot inherit cloud data-plane credentials.
import { withheldOutputSummary } from './withheld-output.mjs';
const forbidden = [
  'DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'QBANK_CONTROL_DATABASE_URL', 'QBANK_CONTROL_DB_USER', 'QBANK_CONTROL_DB_PASSWORD', 'REDIS_URL', 'RAG_REDIS_URL', 'RAG_REDIS_TEST_URL', 'RAG_QBANK_CACHE_HASH_KEY',
  'OBJECT_STORAGE_ENDPOINT', 'OBJECT_STORAGE_BUCKET', 'OBJECT_STORAGE_ACCESS_KEY', 'OBJECT_STORAGE_SECRET_KEY',
  'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_SECURITY_TOKEN',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN',
  'LANGSMITH_API_KEY',
];
const present = [
  ...forbidden.filter((key) => process.env[key]),
  ...Object.keys(process.env).filter((key) => key.startsWith('LANGFUSE_')),
];
if (process.env.E2E_ISOLATED !== '1' || process.env.PGHOST !== '127.0.0.1' || process.env.DATABASE_SSL_MODE !== 'disable'
  || !process.env.E2E_TEST_CONTAINER || !process.env.E2E_TEST_TARGET_TOKEN || present.length) {
  throw new Error(`isolated_environment_contract_failed:${present.join(',') || 'missing_required_attestation'}`);
}
console.log(`PASS isolated environment: ${forbidden.length} cloud data-plane/tracing variables absent; loopback database attested`);

const unsafeFixtures = [
  '{"token":"fixture-token-123","password":"fixture-password-123"}',
  'authorization: Bearer fixture-bearer-123',
  'postgresql://fixture-user:fixture-password-123@example.test/db',
  '姓名：测试用户；手机号：13800138000',
  'c2VjcmV0LWJhc2U2NC1maXh0dXJl',
];
for (const fixture of unsafeFixtures) {
  const summary = withheldOutputSummary('logs', fixture);
  if (summary.includes(fixture) || /token|password|bearer|postgresql|13800138000|c2VjcmV0/i.test(summary) || !/^logs_bytes=\d+$/.test(summary))
    throw new Error('isolated_diagnostic_raw_output_leak');
}
console.log(`PASS isolated diagnostics: ${unsafeFixtures.length} secret/PII fixtures reduced to byte counts`);
