/**
 * UC-E2E-052 · GAP-UC052-POOL-ROLE-LEAK prove.
 * Real createCheckpointer(..., true) + PrincipalBoundCheckpointPool on real PG.
 * C-CASECOUNT exact ==. Ban SET LOCAL-only wash. Ban hand-made pg.Client pool.
 */
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asPrincipal, createPool, enrollCheckpointThread,
  loadMigrations, provisionRuntimeLogin, runMigrations,
} from '@meetwise/db';
import { createCheckpointer } from '../src/main.ts';
import {
  withCheckpointAccess,
  PrincipalBoundCheckpointPool,
  __setCheckpointPrincipalCleanupOverrideForTest,
  type CheckpointAccess,
} from '../src/checkpoint-principal.ts';

const REQUIRED_CASES = [
  'NHP-POOL-NEG-01',
  'NHP-POOL-FAULT-ABORT',
  'NHP-POOL-FAULT-RESET-DESTROY',
  'HP-POOL-01',
  'C-CASECOUNT',
] as const;

const admin = createPool();
const role = `pool_leak_rt_${process.pid}`;
const password = 'pool-role-leak-password-2026';
let failures = 0;
const seen = new Set<string>();
const caseStatus = new Map<string, string>();
const A = (id: string, ok: boolean, detail = '') => {
  seen.add(id);
  caseStatus.set(id, ok ? 'pass' : 'fail');
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}${detail ? ` · ${detail}` : ''}`);
  if (!ok) failures++;
};

type SessionSnap = {
  pid: number;
  currentUser: string;
  sessionUser: string;
  principal: string | null;
  threadId: string | null;
  epoch: string | null;
};

async function readSession(client: { query: (sql: string) => Promise<{ rows: any[] }> }): Promise<SessionSnap> {
  const r = await client.query(`
    SELECT pg_backend_pid()::int AS pid,
           current_user::text AS current_user,
           session_user::text AS session_user,
           nullif(current_setting('app.principal_user', true), '') AS principal,
           nullif(current_setting('app.checkpoint_thread_id', true), '') AS thread_id,
           nullif(current_setting('app.checkpoint_epoch', true), '') AS epoch
  `);
  const row = r.rows[0];
  return {
    pid: Number(row.pid),
    currentUser: String(row.current_user),
    sessionUser: String(row.session_user),
    principal: row.principal == null ? null : String(row.principal),
    threadId: row.thread_id == null ? null : String(row.thread_id),
    epoch: row.epoch == null ? null : String(row.epoch),
  };
}

function gucsClear(s: SessionSnap): boolean {
  return s.principal == null && s.threadId == null && s.epoch == null;
}

function roleReset(s: SessionSnap): boolean {
  // After RESET ROLE, current_user must equal session_user (login), not leftover app_role
  // from a prior PrincipalBound checkout — unless the login itself is app_role.
  return s.currentUser === s.sessionUser;
}

async function awaitRelease(client: { releaseAsync?: () => Promise<void>; release: (err?: Error | boolean) => void }): Promise<void> {
  if (typeof client.releaseAsync === 'function') await client.releaseAsync();
  else client.release();
}

async function main() {
  await assertIsolatedTestTarget(admin);
  const porcelain = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (porcelain) {
    console.error('C-UNCOMMITTED refuse: dirty worktree\n' + porcelain);
    process.exit(1);
  }
  const gitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(`UC052_POOL_ROLE_LEAK_PROVE gitSha=${gitSha} line=B runnerCommitSha=${gitSha}`);

  await admin.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionRuntimeLogin(admin, { roleName: role, password });

  const port = process.env.PGPORT ?? '54329';
  const connection = `postgresql://${encodeURIComponent(role)}:${encodeURIComponent(password)}@${process.env.PGHOST ?? '127.0.0.1'}:${port}/${encodeURIComponent(process.env.PGDATABASE ?? 'meetwise')}`;

  // Force reuse on the product factory path (createCheckpointer → createPool → PrincipalBound).
  process.env.PGPOOL_MAX = '1';
  const checkpointer = createCheckpointer(connection, true);
  const bound = (checkpointer as any).pool as PrincipalBoundCheckpointPool;
  const underlying = bound.underlyingPool ?? (bound as any).pool;
  if (!underlying?.connect || typeof bound.connect !== 'function') {
    console.error('C-FACTORY refuse: createCheckpointer(...,true) did not yield PrincipalBoundCheckpointPool');
    process.exit(1);
  }
  console.log(`UC052_POOL_FACTORY name=${bound.constructor?.name} maxEnv=${process.env.PGPOOL_MAX}`);

  const ownerA = `pool-leak-a-${process.pid}`;
  const ownerB = `pool-leak-b-${process.pid}`;
  const threadA = `pool-leak-thread-a-${process.pid}`;
  const threadB = `pool-leak-thread-b-${process.pid}`;

  try {
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created'),($3,$4,'created')",
      [threadA, ownerA, threadB, ownerB],
    );
    const runtime = createPool({ user: role, password, max: 1 });
    let accessA: CheckpointAccess;
    let accessB: CheckpointAccess;
    try {
      const enA = await asPrincipal(runtime, ownerA, (c) => enrollCheckpointThread(c, ownerA, threadA));
      const enB = await asPrincipal(runtime, ownerB, (c) => enrollCheckpointThread(c, ownerB, threadB));
      accessA = { owner: ownerA, threadId: enA.threadId, fenceEpoch: enA.fenceEpoch };
      accessB = { owner: ownerB, threadId: enB.threadId, fenceEpoch: enB.fenceEpoch };
    } finally {
      await runtime.end();
    }

    /* ── NHP-POOL-NEG-01: same pid reuse · GUCs+role cleared after release ── */
    {
      const id = 'NHP-POOL-NEG-01';
      let pid1 = -1;
      let after: SessionSnap | null = null;
      await withCheckpointAccess(accessA, async () => {
        const client = await bound.connect();
        try {
          const during = await readSession(client);
          pid1 = during.pid;
          const boundOk = during.currentUser === 'app_role'
            && during.principal === ownerA
            && during.threadId === threadA
            && during.epoch === String(accessA.fenceEpoch);
          if (!boundOk) {
            A(id, false, `during bind failed ${JSON.stringify(during)}`);
            return;
          }
        } finally {
          await awaitRelease(client);
        }
      });
      // Next checkout on the SAME underlying connection (max=1) without PrincipalBound SET.
      const raw = await underlying.connect();
      try {
        after = await readSession(raw);
      } finally {
        raw.release();
      }
      const samePid = after != null && after.pid === pid1;
      const clean = after != null && gucsClear(after) && roleReset(after);
      A(id, samePid && clean,
        `pid1=${pid1} after=${JSON.stringify(after)} samePid=${samePid} clean=${clean}`);
    }

    /* ── NHP-POOL-FAULT-ABORT: mid-txn throw then re-checkout still clean ── */
    {
      const id = 'NHP-POOL-FAULT-ABORT';
      let pid1 = -1;
      await withCheckpointAccess(accessA, async () => {
        const client = await bound.connect();
        try {
          pid1 = (await readSession(client)).pid;
          await client.query('BEGIN');
          await client.query("SELECT set_config('app.principal_user', $1, false)", [`abort-marker-${process.pid}`]);
          throw Object.assign(new Error('pool_leak_mid_txn_abort'), { code: 'pool_leak_mid_txn_abort' });
        } catch (e: any) {
          try { await client.query('ROLLBACK'); } catch { /* ignore */ }
          if (e?.code !== 'pool_leak_mid_txn_abort') throw e;
        } finally {
          await awaitRelease(client);
        }
      });
      const raw = await underlying.connect();
      let after: SessionSnap;
      try {
        after = await readSession(raw);
      } finally {
        raw.release();
      }
      A(id, after.pid === pid1 && gucsClear(after) && roleReset(after),
        `pid1=${pid1} after=${JSON.stringify(after)}`);
    }

    /* ── NHP-POOL-FAULT-RESET-DESTROY: reset failure destroys conn (new pid) ── */
    {
      const id = 'NHP-POOL-FAULT-RESET-DESTROY';
      let pidBefore = -1;
      __setCheckpointPrincipalCleanupOverrideForTest(async () => {
        throw Object.assign(new Error('forced_reset_failure'), { code: 'forced_reset_failure' });
      });
      try {
        await withCheckpointAccess(accessA, async () => {
          const client = await bound.connect();
          try {
            pidBefore = (await readSession(client)).pid;
          } finally {
            await awaitRelease(client);
          }
        });
      } finally {
        __setCheckpointPrincipalCleanupOverrideForTest(undefined);
      }
      // After destroy, next underlying checkout must be a different backend pid.
      const raw = await underlying.connect();
      let after: SessionSnap;
      try {
        after = await readSession(raw);
      } finally {
        raw.release();
      }
      const destroyed = after.pid !== pidBefore && pidBefore > 0;
      A(id, destroyed && gucsClear(after),
        `pidBefore=${pidBefore} afterPid=${after.pid} destroyed=${destroyed}`);
    }

    /* ── HP-POOL-01: happy last · principal B bind works after A cleanup ── */
    {
      const id = 'HP-POOL-01';
      let duringB: SessionSnap | null = null;
      await withCheckpointAccess(accessB, async () => {
        const client = await bound.connect();
        try {
          duringB = await readSession(client);
        } finally {
          await awaitRelease(client);
        }
      });
      const ok = duringB != null
        && duringB.currentUser === 'app_role'
        && duringB.principal === ownerB
        && duringB.threadId === threadB
        && duringB.epoch === String(accessB.fenceEpoch);
      A(id, ok, `duringB=${JSON.stringify(duringB)}`);
    }

    /* ── C-CASECOUNT exact == ── */
    {
      const expectedOthers = REQUIRED_CASES.filter((c) => c !== 'C-CASECOUNT');
      const missing = expectedOthers.filter((c) => !seen.has(c));
      const extra = [...seen].filter((c) => !(expectedOthers as readonly string[]).includes(c));
      A('C-CASECOUNT', missing.length === 0 && extra.length === 0,
        missing.length || extra.length ? `missing=${missing.join(',')} extra=${extra.join(',')}` : 'exact match');
    }

    console.log(JSON.stringify({
      line: 'B',
      knife: 'GAP-UC052-POOL-ROLE-LEAK',
      gitSha,
      runnerCommitSha: gitSha,
      releaseEvidence: false,
      haStatus: 'NOT_HA',
      cases: Object.fromEntries([...caseStatus.entries()]),
      required: REQUIRED_CASES,
      factory: 'createCheckpointer(connection, true) + PGPOOL_MAX=1',
      disclosure: {
        setLocalAlone: 'FAIL — PostgresSaver autocommit pool.query has no txn',
        primaryFix: 'RESET ROLE + clear 3 GUCs on release; destroy on reset failure',
      },
    }));
  } finally {
    await (checkpointer as any).end?.().catch?.(() => undefined);
    await (checkpointer as any).pool?.end?.().catch?.(() => undefined);
    // PrincipalBound end → underlying
    try { await bound.end(); } catch { /* ignore */ }
    await admin.query(`DROP ROLE IF EXISTS ${role}`).catch(() => undefined);
    await admin.end().catch(() => undefined);
  }

  const porcelainAfter = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
  if (porcelainAfter) {
    console.error('C-PORCELAIN-AFTER refuse:\n' + porcelainAfter);
    process.exit(1);
  }

  console.log(failures === 0
    ? '\n✓ UC052 pool-role-leak prove PASS'
    : `\n✗ ${failures} assertion failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
