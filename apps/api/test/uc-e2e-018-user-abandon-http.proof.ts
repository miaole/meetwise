/**
 * UC-E2E-018 focused HTTP prove (eval-first · real POST /interview/:id/abandon).
 *
 * Extends packages/db A1–A3 integration with the product HTTP abandon mouth.
 * Route exists: interview.controller `@Post(':id/abandon')` → abandonInterviewAndRelease.
 *
 * Seeds reserve via @meetwise/db (same CAS as begin); asserts HTTP response + DB
 * + entitlement net-zero. No MODEL_API_KEY. No UI. full.e2e abandon = separate uc018:abandon:full-e2e:prove.
 *
 * Fixture note: `_neg-harness` does not load migration 0058. This prove installs a
 * **minimal** `interview_privacy_active` / `assert_interview_privacy_active` stub so
 * `guardInterviewPrivacy` can run. Stub ≠ full privacy fence covered.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-018 covered
 * fixture via run-e2e-isolated → pgvector → green-risk / R5
 *
 *   pnpm uc018:abandon:http:prove
 *   pnpm -C apps/api prove:uc018-abandon-http   (raw; needs isolated DATABASE_URL)
 *
 * Matrix stays **partial**. Do NOT claim covered until dual review + remaining gaps closed.
 */
import { asPrincipal, availableUnits, reserveEntitlement } from '@meetwise/db';
import { boot, mkAssert } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc018:abandon:http');

console.log('UC-E2E-018 user-abandon HTTP prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；≠ matrix covered；HTTP mouth only；fixture=pgvector → green-risk/R5');
console.log('NOTE: remaining→covered: UI · sole-stack (waiting_user + FULL-E2E + GRAPH + TTL closed; matrix stays partial)');

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
console.log('PIN   GAP-UC018-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

const A_ = h.U('userA');
const B_ = h.U('userB');
const RID = 'aaaaaaaa-bbbb-4ccc-8ddd-018018018018';
const S = Date.now().toString(36);
const IID = (k: string) => `IV_H018_${k}_${S}`;

const is = (r: { status: number; body: any }, code: number, err?: string) =>
  r.status === code && (err === undefined || r.body?.error === err);

async function ivStatus(id: string): Promise<string | undefined> {
  const r = await h.pool.query('SELECT status FROM interview WHERE id=$1', [id]);
  return r.rows[0]?.status as string | undefined;
}

async function consStatus(owner: string, key: string): Promise<string | undefined> {
  return asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function bal(owner: string): Promise<number> {
  return asPrincipal(h.pool, owner, (c) => availableUnits(c, owner));
}

// begin() may need resume columns on older harness schemas
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
// list/get projection needs job_title_snapshot (mig 0123); _neg-harness sql 未载 → additive stub only.
console.log('PIN   GAP-UC018-LIST-SCHEMA-STUB: job_title_snapshot additive (≠ 0123 snapshot covered)');
await h.pool.query(
  `INSERT INTO resume(id, owner_user_id, status, content_sha, source_kind)
   VALUES ($1::uuid, 'userA', 'ingested', 'sha-uc018-http', 'text')
   ON CONFLICT (id) DO NOTHING`,
  [RID],
);

// ── H1 · active + reserved → HTTP POST abandon → abandoned + released + 额度净变 0 ──
{
  console.log('\n──────── H1 · HTTP active+reserved abandon ────────');
  const id = IID('h1');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  const before = await bal('userA');
  const rsv = await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  A('H1 reserve → reserved', rsv.status === 'reserved');
  A('H1 预留后额度 -1', (await bal('userA')) === before - 1);

  const r = await h.post(`/interview/${id}/abandon`, A_, {});
  A('H1 POST abandon → 200', r.status === 200);
  A('H1 body.abandoned=true', r.body?.abandoned === true);
  A('H1 body.released=released', r.body?.released === 'released');
  A('H1 body.alreadyAbandoned≠true', r.body?.alreadyAbandoned !== true);
  A('H1 interview=abandoned', (await ivStatus(id)) === 'abandoned');
  A('H1 consumption=released', (await consStatus('userA', id)) === 'released');
  A('H1 额度净变 0（回补）', (await bal('userA')) === before);
}

// ── H1-shell · created 无预留 → HTTP abandon → abandoned + noop ──
{
  console.log('\n──────── H1-shell · HTTP created 空壳 abandon ────────');
  const id = IID('shell');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','created')",
    [id],
  );
  const before = await bal('userA');
  const r = await h.post(`/interview/${id}/abandon`, A_, {});
  A('H1-shell POST → 200', r.status === 200);
  A('H1-shell abandoned=true', r.body?.abandoned === true);
  A('H1-shell released=noop', r.body?.released === 'noop');
  A('H1-shell interview=abandoned', (await ivStatus(id)) === 'abandoned');
  A('H1-shell 额度不变', (await bal('userA')) === before);
}

// ── H2 · 二次 abandon 幂等；begin 拒复活 ──
{
  console.log('\n──────── H2 · HTTP 二次 abandon + begin 拒复活 ────────');
  const id = IID('h2');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  const first = await h.post(`/interview/${id}/abandon`, A_, {});
  A('H2 setup abandon → 200', first.status === 200 && first.body?.abandoned === true);
  const afterFirst = await bal('userA');

  const again = await h.post(`/interview/${id}/abandon`, A_, {});
  A('H2 二次 → 200', again.status === 200);
  A('H2 二次 alreadyAbandoned=true', again.body?.alreadyAbandoned === true);
  A('H2 二次 released=noop（不双退）', again.body?.released === 'noop');
  A('H2 额度不二次回补', (await bal('userA')) === afterFirst);
  A('H2 仍 abandoned', (await ivStatus(id)) === 'abandoned');

  const begin = await h.post(`/interview/${id}/begin`, { ...A_, 'resume-id': RID }, {});
  A('H2 begin abandoned → 409 interview_not_active（不可复活）',
    is(begin, 409, 'interview_not_active'));
}

// ── H3 · abandoned 终态可读；create 复用不捡 abandoned ──
{
  console.log('\n──────── H3 · HTTP get/list + create 不复用 abandoned ────────');
  const live = IID('live');
  const dead = IID('dead');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','created'),($2,'userA','active')",
    [live, dead],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', dead, 'mock_interview', 1.0));
  const ab = await h.post(`/interview/${dead}/abandon`, A_, {});
  A('H3 abandon dead → 200', ab.status === 200);
  A('H3 DB dead=abandoned', (await ivStatus(dead)) === 'abandoned');

  const got = await h.req('GET', `/interview/${dead}`, A_);
  A('H3 GET dead → 200 abandoned（终态仍可读）',
    got.status === 200 && got.body?.status === 'abandoned' && got.body?.id === dead);

  const listAbnd = await h.req('GET', '/interview?status=abandoned', A_);
  const abndIds = Array.isArray(listAbnd.body?.interviews)
    ? listAbnd.body.interviews.map((x: any) => x.id as string) : [];
  A('H3 list?status=abandoned → 200', listAbnd.status === 200);
  A('H3 list abandoned 含 dead', abndIds.includes(dead));
  A('H3 list abandoned 不含 live', !abndIds.includes(live));

  // create() 复用「进行中」：绝不捡 abandoned dead（可能复用 harness 其它 open 行，故只钉 ≠ dead）
  const created = await h.post('/interview', A_, {});
  A('H3 create → 200', created.status === 200);
  A('H3 create 不复用 abandoned dead', created.body?.interviewId !== dead);
  A('H3 create 复用进行中（reused 或新开均可，只要 ≠ dead）',
    typeof created.body?.interviewId === 'string' && created.body.interviewId.length > 0);
}

// ── H-waiting-user · waiting_user+reserved → HTTP abandon（UC-E2E-018 主流程 active/waiting_user）──
{
  console.log('\n──────── H-waiting-user · HTTP waiting_user+reserved abandon ────────');
  const id = IID('wu');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','waiting_user')",
    [id],
  );
  const before = await bal('userA');
  const rsv = await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  A('H-waiting-user reserve → reserved', rsv.status === 'reserved');
  A('H-waiting-user 预留后额度 -1', (await bal('userA')) === before - 1);

  const r = await h.post(`/interview/${id}/abandon`, A_, {});
  A('H-waiting-user POST abandon → 200', r.status === 200);
  A('H-waiting-user body.abandoned=true', r.body?.abandoned === true);
  A('H-waiting-user body.released=released', r.body?.released === 'released');
  A('H-waiting-user body.alreadyAbandoned≠true', r.body?.alreadyAbandoned !== true);
  A('H-waiting-user interview=abandoned', (await ivStatus(id)) === 'abandoned');
  A('H-waiting-user consumption=released', (await consStatus('userA', id)) === 'released');
  A('H-waiting-user 额度净变 0（回补）', (await bal('userA')) === before);

  // begin 拒复活（waiting_user→abandoned 后同终态守卫）
  const begin = await h.post(`/interview/${id}/begin`, { ...A_, 'resume-id': RID }, {});
  A('H-waiting-user begin abandoned → 409 interview_not_active',
    is(begin, 409, 'interview_not_active'));
}

// ── H-authz / terminal（产品口守卫；neg:interview 旁证 ≠ 本 UC covered）──
{
  console.log('\n──────── H-authz / terminal ────────');
  const id = IID('own');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','created')",
    [id],
  );
  A('H-authz 越权 userB→userA → 404',
    is(await h.post(`/interview/${id}/abandon`, B_, {}), 404, 'not_found_or_forbidden'));
  A('H-authz 未鉴权 → 401',
    is(await h.post(`/interview/${id}/abandon`, {}, {}), 401));
  A('H-authz 不存在 → 404',
    is(await h.post('/interview/IV_NOPE_018/abandon', A_, {}), 404, 'not_found_or_forbidden'));
  A('H-terminal completed → 409',
    is(await h.post('/interview/IV_DONE/abandon', A_, {}), 409, 'interview_not_active'));
  A('H-terminal failed → 409',
    is(await h.post('/interview/IV_FAIL/abandon', A_, {}), 409, 'interview_not_active'));
}

// ── Honesty pins: still ≠ covered ──
console.log('\n──────── GAP pins (抬 covered 仍缺) ────────');
console.log('CLOSED GAP-UC018-WAITING-USER: abandon CAS = created|active|waiting_user + H-waiting-user prove');
console.log('CLOSED_GAP_UC018_GRAPH: see pnpm uc018:graph:prove；AiGraphRun safely_terminated + 业务事实保全已钉（本 HTTP prove 仍 ≠ graph assert；≠ covered）');
console.log('CLOSED_GAP_UC018_TTL: see pnpm uc018:ttl:prove；本 HTTP prove 仍 ≠ TTL dedicated；UI+sole-stack still gap → matrix partial ≠ covered');
console.log('CLOSED GAP-UC018-FULL-E2E: e2e/full.e2e.ts 显式 abandon TC + pnpm uc018:abandon:full-e2e:prove；CLOSED GAP-UC018-GRAPH: pnpm uc018:graph:prove；CLOSED GAP-UC018-TTL: pnpm uc018:ttl:prove；矩阵仍 partial · ≠ covered · UI/sole-stack 仍开');
A('honesty: HTTP prove 绿 ≠ UC-E2E-018 covered（FULL-E2E+waiting_user+GRAPH+TTL+UI 已关；sole-stack 仍缺 → partial · UI alone ≠ covered）', true);

await done();
