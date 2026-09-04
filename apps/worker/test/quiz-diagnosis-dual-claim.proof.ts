/**
 * Deterministic fail-closed gate for HC-GAP-004 (no database).
 * Dual-connection claim proofs must use remote isolation Postgres.
 * Local Docker / loopback is forbidden.
 *   pnpm quiz-dual-claim:unit:prove
 */
import { assertQuizDiagnosisDualClaimRemotePostgres } from '../src/quiz-diagnosis-dual-claim.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

function threw(env: Record<string, string | undefined>, message: string): boolean {
  try {
    assertQuizDiagnosisDualClaimRemotePostgres(env);
    return false;
  } catch (error: unknown) {
    return error instanceof Error && error.message === message;
  }
}

function main() {
  A(
    'TC-WORKER-001-E2-quiz 本地 Docker / loopback 失败关闭',
    threw(
      { E2E_ISOLATED: '1', PGHOST: '127.0.0.1', E2E_TEST_CONTAINER: 'meetwise-e2e-x' },
      'quiz_diagnosis_dual_claim_prove_forbids_local_docker_db',
    ),
  );
  A(
    'E2E_CLOUD_ISOLATED=1 仍拒绝 loopback',
    threw(
      { E2E_CLOUD_ISOLATED: '1', PGHOST: '127.0.0.1' },
      'quiz_diagnosis_dual_claim_prove_forbids_local_docker_db',
    ),
  );
  A(
    'localhost 失败关闭',
    threw(
      { E2E_CLOUD_ISOLATED: '1', PGHOST: 'localhost' },
      'quiz_diagnosis_dual_claim_prove_forbids_local_docker_db',
    ),
  );
  A(
    '缺远程隔离配置失败关闭，不得改起本地库',
    threw({}, 'quiz_diagnosis_dual_claim_prove_requires_remote_postgres'),
  );
  let remoteOk = true;
  try { assertQuizDiagnosisDualClaimRemotePostgres({ E2E_CLOUD_ISOLATED: '1', PGHOST: '10.0.0.8' }); }
  catch { remoteOk = false; }
  A('只接受 E2E_CLOUD_ISOLATED=1 的远程 Postgres 配置', remoteOk);

  console.log(`\n${failures === 0 ? '✓ quiz/diagnosis dual-claim unit proof passed' : `✗ ${failures} failures`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
