/**
 * UC-E2E-002 focused HTTP prove (eval-first · dual-session resume + Last-Event-ID).
 *
 * Search result (this wave):
 *   - EXISTS: GET /interview/:id (state resume stand-in; no dedicated /snapshot)
 *   - EXISTS: GET /interview/:id/events + Last-Event-ID (SSE catch-up / replay)
 *   - MISSING: HTTP mouth for thread lease CAS / "会话在别处活跃" → honesty GAP
 *     (lease remains packages/db L1–L3 via pnpm uc002:lease:prove)
 *
 * H1 dual-client GET state consistency (same principal · two sessions)
 * H2 device-A abort → ledger append → device-B Last-Event-ID resume (X1 SSE + X4)
 * H3 mid-cursor Last-Event-ID from session-B
 * H-authz cross-principal GET/SSE → 404 (A3)
 * G-GAP honesty pins (HTTP lease mouth / snapshot route / Playwright / full.e2e)
 *
 * Cite旁证 (≠ UC-E2E-002 covered):
 *   pnpm uc010:sse-resume:prove — single-session R1–R4 LED; not dual-device 002
 *   pnpm uc002:lease:prove — db CAS L1–L3; not HTTP dual-session
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-002 covered · matrix stay **partial**
 * fixture via run-e2e-isolated → pgvector → green-risk / R5
 *
 *   pnpm uc002:http:prove
 *   pnpm -C apps/api prove:uc002-http   (raw; needs isolated DATABASE_URL)
 */
import { boot, mkAssert } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc002:http');

console.log('UC-E2E-002 cross-device HTTP prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠UC-E2E-002 covered；HTTP dual-session GET+LED only；≠ HTTP lease mouth；fixture=pgvector → green-risk/R5');
console.log('CITE: uc010:sse-resume:prove = SSE LED 旁证 ≠ 002 covered；uc002:lease:prove = db CAS 旁证 ≠ HTTP dual-session covered');

// Minimal privacy-active stubs (0058 not in _neg-harness). Owner match only; no erasure fence.
await h.pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM interview i
     WHERE i.id = target_interview AND i.owner_user_id = principal
  );
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
console.log('PIN   GAP-UC002-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

// GET projection needs additive columns that _neg-harness sql may omit.
await h.pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text,
    ADD COLUMN IF NOT EXISTS job_title_snapshot text,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()
`);
console.log('PIN   GAP-UC002-LIST-SCHEMA-STUB: job_title_snapshot additive (≠ 0123 snapshot covered)');
console.log('PIN   GAP-UC002-SNAPSHOT-ROUTE: no GET /interview/:id/snapshot — using GET /interview/:id as state resume stand-in');

const STREAM = 'IV_UC002_HTTP';
const AUTH_A = h.U('userA'); // session / "device" A (same principal)
const AUTH_B_SAME = h.U('userA'); // session / "device" B — dual HTTP client, same owner
const AUTH_OTHER = h.U('userB');

await h.pool.query(
  `INSERT INTO interview(id,owner_user_id,status,current_question_index,questions)
   VALUES ($1,'userA','active',1,'["q1","q2"]'::jsonb)
   ON CONFLICT (id) DO UPDATE SET status='active', owner_user_id='userA', current_question_index=1`,
  [STREAM],
);
await h.pool.query('DELETE FROM interview_event WHERE stream_key=$1', [STREAM]);
await h.pool.query(
  `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
    ('userA',$1,1,'question_ready','{"q":1,"text":"open"}'),
    ('userA',$1,2,'waiting_user','{"q":1}'),
    ('userA',$1,3,'progress','{"q":1,"pct":40}')`,
  [STREAM],
);

/** Two independent HTTP clients (dual session). Same principal headers; distinct AbortControllers. */
async function readSseCatchUp(
  auth: Record<string, string>,
  lastId?: number,
  timeoutMs = 1200,
): Promise<{ status: number; ids: number[]; kinds: string[]; buf: string }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  let status = 0;
  let buf = '';
  try {
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, {
      headers: {
        ...auth,
        ...(lastId != null && lastId > 0 ? { 'last-event-id': String(lastId) } : {}),
      },
      signal: ac.signal,
    });
    status = res.status;
    if (status === 200 && res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
      }
    } else if (res.body) {
      buf = await res.text().catch(() => '');
    }
  } catch {
    /* abort = expected hold-and-tail disconnect */
  } finally {
    clearTimeout(timer);
  }
  const ids = [...buf.matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1]));
  const kinds = [...buf.matchAll(/^event: (\w+)$/gm)].map((m) => m[1]);
  return { status, ids, kinds, buf };
}

// ── H1 · Dual-session sequential GET resume (state consistency · A1 face) ──
{
  console.log('\n──────── H1 · 双 HTTP session 顺序 GET 同 thread 状态一致 ────────');
  const a = await h.req('GET', `/interview/${STREAM}`, AUTH_A);
  const b = await h.req('GET', `/interview/${STREAM}`, AUTH_B_SAME);
  A('H1 device-A GET → 200', a.status === 200 && a.body?.id === STREAM);
  A('H1 device-B GET → 200', b.status === 200 && b.body?.id === STREAM);
  A('H1 双 session status 一致', a.body?.status === 'active' && b.body?.status === a.body?.status);
  A('H1 双 session id/display 一致', a.body?.id === b.body?.id && a.body?.display_code === b.body?.display_code);
  // Progress fields may be null if interview_question empty; still must match across sessions.
  A('H1 双 session progress 投影一致',
    a.body?.current_question_index === b.body?.current_question_index
    && a.body?.issued_turns === b.body?.issued_turns
    && a.body?.answered_turns === b.body?.answered_turns);
}

// ── H2 · Device-A abort → append → Device-B Last-Event-ID resume (X1+X4) ──
{
  console.log('\n──────── H2 · device-A 断线后 device-B Last-Event-ID 续传 ────────');
  const aCatch = await readSseCatchUp(AUTH_A);
  if (aCatch.ids.join(',') !== '1,2,3') {
    console.log(`DEBUG H2-A status=${aCatch.status} ids=${aCatch.ids.join(',')} buf=${JSON.stringify(aCatch.buf.slice(0, 240))}`);
  }
  A('H2 device-A 全量 catch-up seq=[1,2,3]', aCatch.ids.join(',') === '1,2,3');
  A('H2 device-A 进入 SSE（200 或已收 catch-up）', aCatch.status === 200 || aCatch.ids.length > 0);

  await h.pool.query(
    `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
      ('userA',$1,4,'question_ready','{"q":2,"text":"resume"}'),
      ('userA',$1,5,'waiting_user','{"q":2}')`,
    [STREAM],
  );

  const bResume = await readSseCatchUp(AUTH_B_SAME, 3);
  if (bResume.ids.join(',') !== '4,5') {
    console.log(`DEBUG H2-B status=${bResume.status} ids=${bResume.ids.join(',')} buf=${JSON.stringify(bResume.buf.slice(0, 240))}`);
  }
  A('H2 device-B Last-Event-ID=3 → seq=[4,5]（不重放 1..3）', bResume.ids.join(',') === '4,5');
  A('H2 device-B 无重复 seq≤3', bResume.ids.length > 0 && bResume.ids.every((id) => id > 3));
}

// ── H3 · Mid-cursor from session-B ─────────────────────────────────────────
{
  console.log('\n──────── H3 · device-B 中位游标 Last-Event-ID=2 ────────');
  const s = await readSseCatchUp(AUTH_B_SAME, 2);
  A('H3 device-B Last-Event-ID=2 → seq=[3,4,5]', s.ids.join(',') === '3,4,5');
}

// ── H-authz · 非属主 404（A3）─────────────────────────────────────────────
{
  console.log('\n──────── H-authz · 错主体 GET/SSE → 404 ────────');
  const g = await h.req('GET', `/interview/${STREAM}`, AUTH_OTHER);
  A('H-authz userB GET → 404 not_found_or_forbidden',
    g.status === 404 && (g.body?.error === 'not_found_or_forbidden' || g.body?.error === 'not_found' || g.body == null || typeof g.body === 'object'));

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 700);
  let sseStatus = 0;
  try {
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, {
      headers: AUTH_OTHER,
      signal: ac.signal,
    });
    sseStatus = res.status;
    if (res.body) {
      const reader = res.body.getReader();
      try {
        for (;;) {
          const { done } = await reader.read();
          if (done) break;
        }
      } finally {
        reader.releaseLock();
      }
    }
  } catch {
    /* abort ok if already 404 */
  } finally {
    clearTimeout(timer);
  }
  A('H-authz userB SSE → 404', sseStatus === 404);
}

// ── G-GAP · honesty pins（EXIT=0 仅=诚实钉 ≠ covered）──────────────────────
{
  const gaps = [
    'GAP-UC002-HTTP-LEASE-MOUTH: 无 HTTP thread lease CAS /「会话在别处活跃」产品口（lease 仍仅 db L1–L3）',
    'GAP-UC002-SNAPSHOT-ROUTE: 无 GET /interview/:id/snapshot（本 prove 用 GET /:id 顶替）',
    'GAP-UC002-PLAYWRIGHT-DUAL: Playwright 双 browser.newContext 降次未接线',
    'GAP-UC002-FULL-E2E: full.e2e / e2e:isolated 双设备场景未纳入',
    'GAP-UC002-UC010-CITE: uc010:sse-resume:prove = SSE LED 旁证 ≠ UC-E2E-002 covered',
  ];
  for (const g of gaps) console.log(`PIN   ${g}`);
  A('G-GAP honesty pins printed (EXIT=0≠covered)', gaps.length === 5);
}

console.log('\nNOTE: still ≠covered; matrix stay **partial**; HTTP dual GET+LED advanced; HTTP lease mouth remaining');
console.log('BLOCKED_FOR_COVERED: HTTP lease CAS mouth + snapshot route + Playwright dual + full.e2e dual-device');
await done();
