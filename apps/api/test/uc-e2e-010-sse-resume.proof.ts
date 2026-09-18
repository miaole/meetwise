/**
 * UC-E2E-010 focused HTTP prove (eval-first · SSE disconnect → Last-Event-ID resume).
 *
 * Nails A2-style catch-up: abort mid-hold → reconnect with Last-Event-ID=N → only seq>N.
 * Wave #4 advance: **R-mid** mid-interview live hold → live-tail new seq → abort →
 *   disconnect-window append → Last-Event-ID resume (NON-UI HTTP · no MODEL_API_KEY).
 * Seeds interview_event ledger (no worker / no MODEL_API_KEY).
 *
 * Layer cites (≠ this UC covered):
 *   - e2e/helpers/sse.ts (readSseEvents last-event-id header)
 *   - pnpm last-event-id:unit:prove (parser fail-closed)
 *   - pnpm sse-slot:prove (per-principal slot cap)
 *   - apps/web/e2e-ui/stream-window.spec.ts (UI 10k window; ≠ disconnect resume)
 *   - api:validate SSE subset (single-event empty catch-up; ≠ multi-seq disconnect resume)
 *
 * Fixture note: `_neg-harness` does not load migration 0058. This prove installs a
 * **minimal** `interview_privacy_active` / `assert_interview_privacy_active` stub so
 * `guardInterviewPrivacy` can run for SSE catch-up. Stub ≠ full privacy fence covered.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-010 covered
 * fixture via run-e2e-isolated → pgvector → green-risk / R5
 *
 *   pnpm uc010:sse-resume:prove
 *   pnpm -C apps/api prove:uc010-sse-resume   (raw; needs isolated DATABASE_URL)
 *
 * Matrix stays **partial**. Do NOT claim covered / full.e2e.
 */
import { boot, mkAssert } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc010:sse-resume');

console.log('UC-E2E-010 SSE resume prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；≠ matrix covered；cite helpers/sse + last-event-id:unit + sse-slot；fixture=pgvector → green-risk/R5');

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
console.log('PIN   GAP-UC010-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

const STREAM = 'IV_SSE010';
const AUTH_A = h.U('userA');
const AUTH_B = h.U('userB');

await h.pool.query(
  `INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')
   ON CONFLICT (id) DO UPDATE SET status='active', owner_user_id='userA'`,
  [STREAM],
);
await h.pool.query('DELETE FROM interview_event WHERE stream_key=$1', [STREAM]);
await h.pool.query(
  `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
    ('userA',$1,1,'question_ready','{"q":1}'),
    ('userA',$1,2,'waiting_user','{"q":1}'),
    ('userA',$1,3,'progress','{"q":1,"pct":30}')`,
  [STREAM],
);

/** Hold-and-tail: abort after catch-up (same pattern as validate.ts / e2e/helpers/sse.ts). */
async function readSseCatchUp(lastId?: number, timeoutMs = 1200): Promise<{ status: number; ids: number[]; kinds: string[]; buf: string }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  let status = 0;
  let buf = '';
  try {
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, {
      headers: {
        ...AUTH_A,
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


/** Live hold: keep SSE open, optional mid-hold inject, abort once wantIds seen (or maxMs). */
async function readSseLive(opts: {
  lastId?: number;
  wantIds: number[];
  injectAfterMs?: number;
  inject?: () => Promise<void>;
  maxMs?: number;
}): Promise<{ status: number; ids: number[]; kinds: string[]; buf: string }> {
  const ac = new AbortController();
  const maxMs = opts.maxMs ?? 8000;
  const hardTimer = setTimeout(() => ac.abort(), maxMs);
  let status = 0;
  let buf = '';
  let injectStarted = false;
  const maybeInject = () => {
    if (injectStarted || !opts.inject) return;
    injectStarted = true;
    void opts.inject().catch((e) => console.log(`DEBUG R-mid inject err: ${e}`));
  };
  const injectTimer =
    opts.inject && opts.injectAfterMs != null
      ? setTimeout(maybeInject, opts.injectAfterMs)
      : null;
  try {
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, {
      headers: {
        ...AUTH_A,
        ...(opts.lastId != null && opts.lastId > 0 ? { 'last-event-id': String(opts.lastId) } : {}),
      },
      signal: ac.signal,
    });
    status = res.status;
    if (status === 200 && res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const idsNow = [...buf.matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1]));
          if (opts.wantIds.length && opts.wantIds.every((id) => idsNow.includes(id))) {
            ac.abort();
            break;
          }
        }
      } finally {
        try { reader.releaseLock(); } catch { /* already released */ }
      }
    } else if (res.body) {
      buf = await res.text().catch(() => '');
    }
  } catch {
    /* abort = expected mid-interview disconnect or wantIds reached */
  } finally {
    clearTimeout(hardTimer);
    if (injectTimer) clearTimeout(injectTimer);
  }
  const ids = [...buf.matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1]));
  const kinds = [...buf.matchAll(/^event: (\w+)$/gm)].map((m) => m[1]);
  return { status, ids, kinds, buf };
}

// ── R1 · 全量 catch-up 后主动断线（abort）──────────────────────────────────
{
  const s = await readSseCatchUp();
  if (s.ids.join(',') !== '1,2,3') {
    console.log(`DEBUG R1 status=${s.status} ids=${s.ids.join(',')} buf=${JSON.stringify(s.buf.slice(0, 240))}`);
  }
  A('R1 全量重放进入 SSE（200 或已收 catch-up）', s.status === 200 || s.ids.length > 0);
  A('R1 全量重放 seq=[1,2,3]', s.ids.join(',') === '1,2,3');
  A('R1 kinds 含 question_ready/waiting_user/progress', s.kinds.join(',') === 'question_ready,waiting_user,progress');
}

// ── R2 · 断线窗口内账本续写 → Last-Event-ID=3 仅续传 seq>3 ────────────────
{
  await h.pool.query(
    `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
      ('userA',$1,4,'question_ready','{"q":2}'),
      ('userA',$1,5,'waiting_user','{"q":2}')`,
    [STREAM],
  );
  const s = await readSseCatchUp(3);
  if (s.ids.join(',') !== '4,5') {
    console.log(`DEBUG R2 status=${s.status} ids=${s.ids.join(',')} buf=${JSON.stringify(s.buf.slice(0, 240))}`);
  }
  A('R2 断线后重连 Last-Event-ID=3 → seq=[4,5]（不重放 1..3）', s.ids.join(',') === '4,5');
  A('R2 无重复 seq≤3', s.ids.length > 0 && s.ids.every((id) => id > 3));
}

// ── R3 · 中位游标 Last-Event-ID=2 → 仅 seq>2 ───────────────────────────────
{
  const s = await readSseCatchUp(2);
  A('R3 Last-Event-ID=2 → seq=[3,4,5]', s.ids.join(',') === '3,4,5');
}

// ── R4 · 已追上 → 空 catch-up（等 hold ping，证明进了 SSE 而非错误空）──
{
  // Empty catch-up writes no frames; controller sleeps 2s then sends `: ping`.
  // Wait past one poll so abort is not confused with a failed open.
  const s = await readSseCatchUp(5, 2800);
  const sawPing = s.buf.includes(': ping');
  if (!(s.status === 200 && s.ids.length === 0 && sawPing)) {
    console.log(`DEBUG R4 status=${s.status} ids=${s.ids.join(',')} ping=${sawPing} buf=${JSON.stringify(s.buf.slice(0, 240))}`);
  }
  A('R4 Last-Event-ID=5 → SSE 200 + 空 ids + hold ping（已追上，非错误空）',
    s.status === 200 && s.ids.join(',') === '' && sawPing);
}


// ── R-mid · mid-interview live hold → disconnect → LED resume（wave #4）────
// Feasible without MODEL_API_KEY: ledger seed + SSE hold-and-tail poll (2s).
// ≠ full.e2e mid-interview (worker/Key) · ≠ A3 kill+billing · ≠ UI reconnect.
{
  console.log('\n──────── R-mid · mid-interview live-tail → abort → LED resume ────────');
  // Start from caught-up cursor (post R4 ledger = seq 1..5). Hold open; inject mid-hold.
  const live = await readSseLive({
    lastId: 5,
    wantIds: [6, 7],
    injectAfterMs: 400,
    maxMs: 7500,
    inject: async () => {
      await h.pool.query(
        `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
          ('userA',$1,6,'progress','{"q":2,"pct":60,"mid":true}'),
          ('userA',$1,7,'waiting_user','{"q":2,"mid":true}')`,
        [STREAM],
      );
      console.log('PIN   R-mid inject seq=6,7 while SSE held (mid-interview live)');
    },
  });
  if (live.ids.join(',') !== '6,7' && !(live.ids.includes(6) && live.ids.includes(7))) {
    console.log(`DEBUG R-mid-live status=${live.status} ids=${live.ids.join(',')} buf=${JSON.stringify(live.buf.slice(0, 320))}`);
  }
  A('R-mid live hold 收到 mid-interview seq=[6,7]（hold-and-tail，非仅 catch-up）',
    live.ids.includes(6) && live.ids.includes(7) && live.ids.every((id) => id > 5));
  A('R-mid live 无重放 seq≤5', live.ids.length > 0 && live.ids.every((id) => id > 5));

  // Disconnect window: append while client is down.
  await h.pool.query(
    `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
      ('userA',$1,8,'question_ready','{"q":3,"after_disconnect":true}'),
      ('userA',$1,9,'waiting_user','{"q":3}')`,
    [STREAM],
  );
  const resume = await readSseCatchUp(7);
  if (resume.ids.join(',') !== '8,9') {
    console.log(`DEBUG R-mid-resume status=${resume.status} ids=${resume.ids.join(',')} buf=${JSON.stringify(resume.buf.slice(0, 240))}`);
  }
  A('R-mid 断线后 Last-Event-ID=7 → seq=[8,9]（不重放 live 已收 6..7）', resume.ids.join(',') === '8,9');
  A('R-mid resume 无重复 seq≤7', resume.ids.length > 0 && resume.ids.every((id) => id > 7));
}

// ── R-authz · 他人 principal 不可订（RLS / 404）────────────────────────────
{
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 700);
  let status = 0;
  try {
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, {
      headers: AUTH_B,
      signal: ac.signal,
    });
    status = res.status;
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
  A('R-authz userB 越权订阅 → 404', status === 404);
}

// ── G-GAP · honesty pins（EXIT=0 仅=诚实钉 ≠ covered）──────────────────────
{
  const gaps = [
    'GAP-UC010-FULL-E2E: full.e2e / e2e:isolated mid-interview SSE kill→resume 未接线（R-mid=HTTP ledger live-tail ≠ full.e2e）',
    'GAP-UC010-A3-KILL-BILLING: 进程 kill + 无双扣费 / seq 无洞 未在本 prove（需 worker+commerce）',
    'GAP-UC010-UI: Playwright 断线重连 UI 非本切片主路径（stream-window≠断线续传）',
    'GAP-UC010-PRIVACY-0058: _neg-harness 未载 0058；本 prove 仍 minimal stub ≠ fence covered',
    'GAP-UC010-CROSS-REPLICA: 跨副本 SSE 槽 HC-GAP-008；sse-slot:prove 仅进程内',
    'GAP-UC010-LAYER: last-event-id:unit:prove / sse-slot:prove / helpers/sse 为层证明 ≠ UC covered',
  ];
  for (const g of gaps) console.log(`PIN   ${g}`);
  A('G-GAP honesty pins printed (EXIT=0≠covered)', gaps.length === 6);
}

console.log('\nNOTE: still ≠covered; stay matrix **partial**; R-mid advances HTTP mid-interview live-tail only; cite unit/slot/helpers; no full.e2e/A3/UI claim');
await done();
