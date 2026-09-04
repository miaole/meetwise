/**
 * Fail-closed gate for `pnpm interview-dispatch:prove`.
 *
 * Remote Postgres only (`E2E_CLOUD_ISOLATED=1` + non-local PGHOST).
 * Never starts Docker, compose, or `run-e2e-isolated`.
 * Keep error codes in sync with `assertInterviewDispatchRemotePostgres`
 * in `apps/worker/src/interview-dispatch-fairness.ts`.
 */

const FORBID_LOCAL = 'interview_dispatch_prove_forbids_local_docker_db';
const FORBID_URL = 'interview_dispatch_prove_forbids_database_url';
const REQUIRE_REMOTE = 'interview_dispatch_prove_requires_remote_postgres';

export const INTERVIEW_DISPATCH_REMOTE_ERROR = Object.freeze({
  FORBID_LOCAL,
  FORBID_URL,
  REQUIRE_REMOTE,
});

function forbiddenLocalHost(host) {
  if (!host) return false;
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

export function assertInterviewDispatchRemoteGate(env = process.env) {
  if (env.E2E_ISOLATED === '1' || Boolean(env.E2E_TEST_CONTAINER?.trim())) {
    throw new Error(FORBID_LOCAL);
  }
  if (env.DATABASE_URL?.trim()) {
    throw new Error(FORBID_URL);
  }
  const host = env.PGHOST?.trim();
  if (forbiddenLocalHost(host)) {
    throw new Error(FORBID_LOCAL);
  }
  if (env.E2E_CLOUD_ISOLATED !== '1' || !host) {
    throw new Error(REQUIRE_REMOTE);
  }
}
