/**
 * @meetwise/db · DBSB-1 job-queue lifecycle factory (case B: TS-side generic,
 * zero table/migration change).
 *
 * The three queues (interview_job / quiz_job / diagnosis_job) previously
 * carried byte-copied claim/done/failed/renew/sweep five-piece sets.  This
 * factory emits, for every configured queue, SQL that is **character-for-
 * character identical** to the former per-queue literals (whitespace and
 * inline `--` comments included) — asserted by dbsb1-src-boiler.proof.ts P3
 * against snapshots of the pre-convergence literals.  Any template change
 * here must keep that snapshot green or consciously re-baseline it.
 *
 * Queue-specific behavior stays with the caller modules:
 *  - interview keeps its advisory-xact-lock claim serialization, privacy
 *    predicate, zombie-sibling guard, per-owner inflight cap (extra $5 param)
 *    and `payload-'answer'` terminal scrub (configured below, embedded in the
 *    emitted SQL exactly where the former literal had them);
 *  - enqueue/requeue/loads/enumerate are not part of the replicated
 *    five-piece and remain in their owning modules untouched.
 */
import type { PoolClient as Client, QueryResult } from 'pg';

export interface JobQueueLifecycleConfig {
  readonly table: string;
  /** Mirror-exclusion column: a job is not claimed while a sibling of the same logical unit is running. */
  readonly siblingColumn: string;
  readonly leaseSeconds: number;
  readonly maxAttempts: number;
  /** Claim ORDER BY clause, e.g. 'j.created_at ASC'. */
  readonly claimOrder: string;
  /** Claim RETURNING column list. */
  readonly claimReturning: string;
  /** Predicate lines inserted right after `WHERE j.owner_user_id=$1` (must end with '\n' when set). */
  readonly claimOwnerPredicates?: string;
  /** Predicate block inserted right after the mirror-exclusion NOT EXISTS (must end with '\n' when set). */
  readonly claimGuardPredicates?: string;
  /** Extra bind params appended after ($1 owner, $2 leaseOwner, $3 seconds, $4 maxAttempts). */
  readonly claimExtraParams?: (owner: string) => unknown[];
  /** Extra SET items appended to done/failed (e.g. ", payload=payload-'answer'"). */
  readonly terminalScrub?: string;
}

export interface JobQueueSweepResult {
  readonly requeued: number;
  readonly failed: number;
  readonly failedSiblings: string[];
}

export interface JobQueueLifecycle {
  readonly claimNext: (
    c: Client, owner: string, leaseOwner: string, maxAttempts: number, ...extra: unknown[]
  ) => Promise<QueryResult>;
  readonly markDone: (c: Client, owner: string, jobId: string, leaseOwner: string) => Promise<boolean>;
  readonly markFailed: (c: Client, owner: string, jobId: string, leaseOwner: string, error: string) => Promise<boolean>;
  readonly renewLease: (c: Client, owner: string, jobId: string, leaseOwner: string, leaseSeconds: number) => Promise<boolean>;
  readonly sweep: (c: Client, owner: string, maxAttempts: number) => Promise<JobQueueSweepResult>;
}

/** Build the claim/done/failed/renew/sweep five-piece for one queue. */
export function createJobQueueLifecycle(config: JobQueueLifecycleConfig): JobQueueLifecycle {
  const { table, siblingColumn, leaseSeconds, claimOrder, claimReturning } = config;
  const ownerPredicates = config.claimOwnerPredicates ?? '';
  const guardPredicates = config.claimGuardPredicates ?? '';
  const scrub = config.terminalScrub ?? '';

  const claimSql = `UPDATE ${table} SET status='running', lease_owner=$2, lease_expires_at=now()+($3||' seconds')::interval, attempts=attempts+1, version=version+1
       WHERE id = (
         SELECT j.id FROM ${table} j
          WHERE j.owner_user_id=$1
${ownerPredicates}            AND (j.status='queued' OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < $4))
            AND NOT EXISTS (SELECT 1 FROM ${table} r WHERE r.${siblingColumn}=j.${siblingColumn} AND r.status='running' AND r.lease_expires_at >= now())
${guardPredicates}          ORDER BY ${claimOrder} FOR UPDATE SKIP LOCKED LIMIT 1)
     RETURNING ${claimReturning}`;

  const renewSql = `UPDATE ${table} SET lease_expires_at = now() + ($4||' seconds')::interval
       WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`;

  const sweepFailedSql = `UPDATE ${table} SET status='failed', last_error='reaped:worker_died', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts >= $2
     RETURNING ${siblingColumn}`;

  const sweepRequeueSql = `UPDATE ${table} SET status='queued', lease_owner=NULL, version=version+1
       WHERE owner_user_id=$1 AND status='running' AND lease_expires_at < now() AND attempts < $2`;

  return {
    async claimNext(c, owner, leaseOwner, maxAttempts, ...extra) {
      const params = [owner, leaseOwner, String(leaseSeconds), maxAttempts, ...extra];
      return c.query(claimSql, params);
    },
    async markDone(c, owner, jobId, leaseOwner) {
      const r = await c.query(
        `UPDATE ${table} SET status='done', lease_owner=NULL${scrub}, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
        [jobId, owner, leaseOwner]);
      return r.rowCount === 1;
    },
    async markFailed(c, owner, jobId, leaseOwner, error) {
      const r = await c.query(
        `UPDATE ${table} SET status='failed', last_error=$4, lease_owner=NULL${scrub}, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$3`,
        [jobId, owner, leaseOwner, error.slice(0, 500)]);
      return r.rowCount === 1;
    },
    async renewLease(c, owner, jobId, leaseOwner, leaseSecondsOverride) {
      const r = await c.query(renewSql, [jobId, owner, leaseOwner, String(leaseSecondsOverride)]);
      return r.rowCount === 1;
    },
    async sweep(c, owner, maxAttempts) {
      const dead = await c.query(sweepFailedSql, [owner, maxAttempts]);
      const rq = await c.query(sweepRequeueSql, [owner, maxAttempts]);
      return {
        requeued: rq.rowCount ?? 0,
        failed: dead.rowCount ?? 0,
        failedSiblings: dead.rows.map((x) => x[siblingColumn] as string),
      };
    },
  };
}
