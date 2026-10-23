/**
 * Fail-closed target gate for the quiz/diagnosis dual-connection claim proof.
 * Isolation-PG proofs for this slice use remote Postgres only.
 * Local Docker / loopback is forbidden; missing remote config must not start a local database.
 */
function forbiddenQuizDiagnosisDualClaimHost(host: string | undefined): boolean {
  if (!host) return false;
  // Do not compress IPv6. Expanded all-zero form stays distinct from ::1.
  const normalized = host.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase();
  return normalized === 'localhost'
    || normalized === 'postgres'
    || normalized === '::1'
    || normalized === '0:0:0:0:0:0:0:1'
    || normalized === '0.0.0.0'
    || normalized.startsWith('meetwise-postgres')
    || /^127(?:\.\d{1,3}){3}$/.test(normalized)
    || /^::ffff:127(?:\.\d{1,3}){3}$/.test(normalized)
    || /^169\.254(?:\.\d{1,3}){2}$/.test(normalized)
    || /^fe[89ab][0-9a-f]*:/i.test(normalized);
}

export function assertQuizDiagnosisDualClaimRemotePostgres(
  env: Record<string, string | undefined> = process.env,
): void {
  const host = env.PGHOST?.trim();
  if (env.E2E_ISOLATED === '1' || Boolean(env.E2E_TEST_CONTAINER?.trim())
    || forbiddenQuizDiagnosisDualClaimHost(host)) {
    throw new Error('quiz_diagnosis_dual_claim_prove_forbids_local_docker_db');
  }
  if (env.E2E_CLOUD_ISOLATED !== '1') throw new Error('quiz_diagnosis_dual_claim_prove_requires_remote_postgres');
}
