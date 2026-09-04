/**
 * Fail-closed target gate for the quiz/diagnosis dual-connection claim proof.
 * Isolation-PG proofs for this slice use remote Postgres only.
 * Local Docker / loopback is forbidden; missing remote config must not start a local database.
 */
export function assertQuizDiagnosisDualClaimRemotePostgres(
  env: Record<string, string | undefined> = process.env,
): void {
  const host = env.PGHOST?.trim();
  if (env.E2E_ISOLATED === '1' || Boolean(env.E2E_TEST_CONTAINER?.trim())
    || host === '127.0.0.1' || host === 'localhost') {
    throw new Error('quiz_diagnosis_dual_claim_prove_forbids_local_docker_db');
  }
  if (env.E2E_CLOUD_ISOLATED !== '1') throw new Error('quiz_diagnosis_dual_claim_prove_requires_remote_postgres');
}
