/**
 * PRIV01-C · P3 — tenant wiring end-to-end cross-owner NEG prove (live PG).
 *
 * Runs under scripts/run-e2e-isolated.mjs (one-off per-run pgvector container;
 * migrations already applied by the runner's PG-migrate gate). Asserts the
 * wired second-defense layer fails CLOSED across owners — the RLS root stays
 * the FIRST layer; nothing here weakens or replaces it.
 *
 * Faces (all named, fail-closed):
 *   N1  cross-owner list isolation      — user-b listNotifications/unreadCount see 0 of user-a rows
 *   N2  cross-owner single-id read      — user-b SELECT on user-a notification id → 0 rows (404-equivalent, indistinguishable)
 *   N3  cross-owner single-id write     — user-b markNotificationRead(user-a id) → false, EXACTLY ONE attempt (no retry loop), service maps to 404
 *   N4  cross-owner bulk write          — user-b markAllNotificationsRead → 0 marked
 *   N5  RLS WITH CHECK root intact      — user-b INSERT impersonating user-a owner → 42501 (RLS root still fails closed BEHIND the app layer)
 *   N6  positive control (own id)       — user-a markNotificationRead(own id) → true (wiring did not break the happy path)
 *   N7  app-layer helper fail-closed    — requireOwnerUserId('') / buildRequiredOwnerFilter(undefined) throw tenant_owner_user_id_required
 *
 * PREREQ missing (no DATABASE_URL / PG*) → honest non-zero EXIT, recorded as
 * an attempt. Ban weak-assertion-to-green. releaseEvidence=false · Not HA.
 */
import {
  createPool,
  asPrincipal,
  listNotifications,
  unreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  requireOwnerUserId,
  buildRequiredOwnerFilter,
  TenantEnforcementError,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

function code(err: unknown): string {
  return String((err as { code?: string })?.code ?? (err as Error)?.message ?? '');
}

const hasUrl = Boolean(process.env.DATABASE_URL?.trim());
const hasComponents = Boolean(
  process.env.PGHOST && process.env.PGPORT && process.env.PGUSER
  && process.env.PGPASSWORD !== undefined && process.env.PGDATABASE,
);
if (!hasUrl && !hasComponents) {
  console.error('tenant-wiring-neg: PREREQ missing (no DATABASE_URL / PG* target) — honest non-zero EXIT (recorded attempt; Ban weak-assertion-to-green)');
  process.exit(1);
}

const OWNER_A = 'tenant-neg-user-a';
const OWNER_B = 'tenant-neg-user-b';
const ROW_A1 = 'tenant-neg-notif-a1';
const ROW_A2 = 'tenant-neg-notif-a2';

const pool = createPool();
let touched = false;
let envFailed: string | null = null;
try {
  // Fixtures: user-a owns two unread notifications (cross-owner NEG targets).
  // No pre-clean DELETE: the app_role grant on notification is SELECT/INSERT/UPDATE
  // only (attempt1 fixture defect 42501); the container is one-off (--rm), so a
  // fresh DB needs no cleanup and post-run cleanup is best-effort skippable.
  await asPrincipal(pool, OWNER_A, async (c) => {
    await c.query(
      "INSERT INTO notification(id, owner_user_id, kind, payload) VALUES ($1,$2,'tenant_neg_probe','{}'), ($3,$4,'tenant_neg_probe','{}')",
      [ROW_A1, OWNER_A, ROW_A2, OWNER_A],
    );
  });
  touched = true;

  // N1: cross-owner list isolation (wired path — explicit owner predicate + RLS).
  await asPrincipal(pool, OWNER_B, async (c) => {
    const rows = await listNotifications(c, OWNER_B, 100);
    A('N1 cross-owner list isolation: user-b sees none of user-a notifications',
      !rows.some((r) => r.id === ROW_A1 || r.id === ROW_A2), `userBrows=${rows.length}`);
    const n = await unreadCount(c, OWNER_B);
    const nA = await asPrincipal(pool, OWNER_A, (c2) => unreadCount(c2, OWNER_A));
    A('N1b unreadCount scoped: user-b=0 while user-a=2', n === 0 && nA === 2, `userB=${n} userA=${nA}`);
  });

  // N2: cross-owner single-id read → 0 rows (404-equivalent, indistinguishable).
  await asPrincipal(pool, OWNER_B, async (c) => {
    const r = await c.query('SELECT 1 FROM notification WHERE id=$1', [ROW_A1]);
    A('N2 cross-owner single-id read: 0 rows (indistinguishable 404 at API)', r.rowCount === 0, `rowCount=${r.rowCount}`);
  });

  // N3: cross-owner single-id write → false, EXACTLY ONE attempt (fail-closed, no retry).
  {
    let attempts = 0;
    const ok = await asPrincipal(pool, OWNER_B, async (c) => {
      attempts++;
      return markNotificationRead(c, OWNER_B, ROW_A1);
    });
    A('N3 cross-owner single-id write fail-closed: exactly one attempt → false',
      attempts === 1 && ok === false, `attempts=${attempts} result=${ok}`);
    const stillUnread = await asPrincipal(pool, OWNER_A, (c) =>
      c.query('SELECT read FROM notification WHERE id=$1', [ROW_A1]));
    A('N3b user-a row untouched by cross-owner write', stillUnread.rows[0]?.read === false);
  }

  // N4: cross-owner bulk write → 0 marked.
  await asPrincipal(pool, OWNER_B, async (c) => {
    const marked = await markAllNotificationsRead(c, OWNER_B);
    A('N4 cross-owner bulk write: user-b marks 0 of user-a rows', marked === 0, `marked=${marked}`);
  });

  // N5: RLS WITH CHECK root intact — app-layer impersonation insert → 42501.
  {
    let got: string | null = null;
    try {
      await asPrincipal(pool, OWNER_B, async (c) => {
        await c.query("INSERT INTO notification(id, owner_user_id, kind, payload) VALUES ('tenant-neg-impersonate',$1,'tenant_neg_probe','{}')", [OWNER_A]);
      });
      got = 'insert-succeeded';   // would be a CRITICAL second-layer AND root failure
    } catch (e) {
      got = code(e);
    }
    A('N5 RLS root intact: cross-owner impersonating INSERT rejected (42501)', got === '42501', `got=${got}`);
  }

  // N6: positive control — own-id write still works (wiring is behavior-preserving).
  {
    const ok = await asPrincipal(pool, OWNER_A, async (c) => markNotificationRead(c, OWNER_A, ROW_A2));
    A('N6 positive control: user-a own-id markNotificationRead → true', ok === true, `result=${ok}`);
  }

  // N7: app-layer helper fail-closed (E1 entry — missing/blank owner).
  {
    let c1 = '', c2 = '';
    try { requireOwnerUserId(''); } catch (e) { c1 = e instanceof TenantEnforcementError ? e.code : `unexpected:${code(e)}`; }
    try { buildRequiredOwnerFilter(undefined); } catch (e) { c2 = e instanceof TenantEnforcementError ? e.code : `unexpected:${code(e)}`; }
    A('N7 helper fail-closed: blank/missing owner → tenant_owner_user_id_required',
      c1 === 'tenant_owner_user_id_required' && c2 === 'tenant_owner_user_id_required', `blank=${c1} missing=${c2}`);
  }
} catch (e) {
  envFailed = `environment/fixture failure — honest non-zero EXIT (recorded attempt): ${code(e)}`;
} finally {
  await pool.end().catch(() => undefined);
}

if (envFailed) console.error(`tenant-wiring-neg: ${envFailed}`);
console.log(failures === 0 && !envFailed
  ? '\n✓ tenant-wiring cross-owner NEG proof passed (EXIT=0)'
  : `\n✗ tenant-wiring cross-owner NEG proof: ${failures} failure(s)${envFailed ? ' + environment failure' : ''}`);
if (failures > 0 || envFailed) process.exitCode = 1;
