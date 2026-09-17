/**
 * UC-E2E-033 focused HTTP + DB prove (eval-first · cross-user / role-gate / B-C).
 *
 * Extends neg:auth / neg:interview / neg:bend patterns into a UC-scoped systematic
 * contract: C-cross (interview/resume/commerce/quiz/diagnosis) + B-C + role-gates
 * + A2 no-principal RLS 0-row + privacy export isolation
 * + W1 worker-principal honesty (job-table RLS + source asPrincipal pin; ≠ live worker)
 * + X9 more authz DB/HTTP classes + X10 concurrent burst + X11 leak-body honesty.
 *
 * Existing neg:* / full.e2e B RLS are 旁证 ≠ covered.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-033 covered
 * fixture via run-e2e-isolated → pgvector → green-risk / R5
 *
 *   pnpm uc033:cross-user-authz:prove
 *   pnpm -C apps/api prove:uc033-cross-user-authz   (raw; needs isolated DATABASE_URL)
 *
 * Matrix must stay **partial** when this file's asserts run green.
 * EXIT=0 only when honesty holds (G-GAP pins printed; never claim covered).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot, mkAssert, tokenFor } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc033:cross-user-authz');

console.log('UC-E2E-033 cross-user-authz prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；≠ matrix covered；neg:*/full.e2e RLS=旁证≠covered；fixture=pgvector → green-risk/R5');
console.log('NOTE: 系统化七类未齐 — G-GAP pins missing live-worker/checkpointer-e2e/concurrency-class/full.e2e');
console.log('NOTE: wave#6 advances W1/X9/X10/X11 honesty — still ≠ covered');

const A_ = h.U('userA');
const B_ = h.U('userB');
const REC = h.U('recU');
const RID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const JOB_ID = 'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff';

const is = (r: { status: number; body: any }, code: number, err?: string) =>
  r.status === code && (err === undefined || r.body?.error === err);

/** DB-layer principal client (mirror neg:bend asP) — ROLLBACK read-only. */
const asP = async (uid: string | null, q: string, params: any[] = []) => {
  const c = await h.pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE app_role');
    if (uid !== null) {
      await c.query("SELECT set_config('app.principal_user', $1, true)", [uid]);
    }
    // uid===null → no set_config → current_setting(..., true) = NULL → RLS 0 行 (A2)
    const r = await c.query(q, params);
    await c.query('ROLLBACK');
    return r;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    c.release();
  }
};

const workerSrc = (rel: string) =>
  readFileSync(fileURLToPath(new URL(`../../worker/src/${rel}`, import.meta.url)), 'utf8');

// Seeds beyond _neg-harness: resume + quiz + diagnosis owned by userA (C-cross targets)
await h.pool.query(
  `INSERT INTO resume(id, owner_user_id, status, content_sha, source_kind)
   VALUES ($1::uuid, 'userA', 'ingested', 'sha-uc033-a', 'text')
   ON CONFLICT (id) DO NOTHING`,
  [RID],
);
await h.pool.query(
  `INSERT INTO resume_profile(resume_id, owner_user_id, structured, pii_summary, blocked_count, status)
   VALUES ($1::uuid, 'userA', '{"experience":[{"text":"x"}],"skills":[{"text":"y"}],"facts":[]}'::jsonb,
           '{"phone":0,"email":0,"idcard":0}'::jsonb, 0, 'ok')
   ON CONFLICT (resume_id) DO NOTHING`,
  [RID],
);
await h.pool.query(
  `INSERT INTO resume_quiz(id, owner_user_id, status)
   VALUES ('QZ_UC033','userA','ready') ON CONFLICT (id) DO NOTHING`,
);
await h.pool.query(
  `INSERT INTO resume_diagnosis(id, owner_user_id, status)
   VALUES ('DG_UC033','userA','ready') ON CONFLICT (id) DO NOTHING`,
);

// W1 / X9 seeds: interview_job (worker path surrogate) + notification + career_path
await h.pool.query(
  `INSERT INTO interview_job(id, owner_user_id, interview_id, kind, seq, payload, status)
   VALUES ($1::uuid, 'userA', 'IV_ACT', 'start', 0, '{"wave":"uc033-w1"}'::jsonb, 'queued')
   ON CONFLICT (id) DO NOTHING`,
  [JOB_ID],
);
await h.pool.query(
  `INSERT INTO notification(id, owner_user_id, kind, payload)
   VALUES ('NTF_UC033','userA','report_ready','{"interviewId":"IV_ASMT"}'::jsonb)
   ON CONFLICT (id) DO NOTHING`,
);
await h.pool.query(
  `INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level, milestones)
   VALUES ('CP_UC033','userA','IV_ASMT','mid','L2','[]'::jsonb)
   ON CONFLICT (id) DO NOTHING`,
);

// begin() SELECT needs resume_id / resume_privacy_epoch / application_id (mig 0049/0064).
// _neg-harness baseline schema omits them → bare begin → 500. Additive stubs only for RLS 404 path.
await h.pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text
`);

// ── X1 · C-cross interview (A1) — UC033 contract (neg:interview 旁证 ≠ covered) ──
{
  A('X1 begin 越权 userB→IV_ACT → 404 not_found_or_forbidden',
    is(await h.post('/interview/IV_ACT/begin', { ...B_, 'resume-id': RID }, {}), 404, 'not_found_or_forbidden'));
  A('X1 turn 越权 userB→IV_ACT → 404',
    is(await h.post('/interview/IV_ACT/turn', B_, {
      questionId: 'q-v1-t0-c0', stateVersion: 1, answerId: 'aaaaaaaa-bbbb-4ccc-8ddd-000000000001',
      answerHash: 'a'.repeat(64), turn: 0, answer: 'hijack',
    }), 404, 'not_found_or_forbidden'));
  A('X1 assessment POST 越权 userB→IV_ASMT → 404',
    is(await h.post('/interview/IV_ASMT/assessment', B_, {}), 404, 'not_found_or_forbidden'));
  A('X1 report GET 越权 userB→IV_ASMT → 404',
    (await h.req('GET', '/interview/IV_ASMT/report', B_)).status === 404);
  A('X1 events 越权 userB→IV_ACT → 404 not_found_or_forbidden',
    is(await h.req('GET', '/interview/IV_ACT/events', B_), 404, 'not_found_or_forbidden'));
  A('X1 transcript 越权 userB→IV_ACT → 404',
    (await h.req('GET', '/interview/IV_ACT/transcript', B_)).status === 404);
  A('X1 abandon 越权 userB→IV_ACT → 404',
    is(await h.post('/interview/IV_ACT/abandon', B_, {}), 404, 'not_found_or_forbidden'));
}

// ── X2 · C-cross resume ────────────────────────────────────────────────────
{
  const listB = await h.req('GET', '/resume', B_);
  const idsB = Array.isArray(listB.body?.resumes) ? listB.body.resumes.map((r: any) => r.id) : [];
  A('X2 list userB 不见 userA resume（RLS 过滤）',
    listB.status === 200 && !idsB.includes(RID));

  const listA = await h.req('GET', '/resume', A_);
  const idsA = Array.isArray(listA.body?.resumes) ? listA.body.resumes.map((r: any) => r.id) : [];
  A('X2 list userA 可见己 resume（对照）', listA.status === 200 && idsA.includes(RID));

  A('X2 profile 越权 userB→userA resume → 404 not_found_or_forbidden',
    is(await h.req('GET', `/resume/${RID}/profile`, B_), 404, 'not_found_or_forbidden'));
  A('X2 reparse 越权 userB→userA resume → 404',
    is(await h.post(`/resume/${RID}/reparse`, B_, {}), 404, 'not_found_or_forbidden'));
}

// ── X3 · C-cross commerce ──────────────────────────────────────────────────
{
  A('X3 orders 越权 userB→ORD_A → 404 not_found',
    is(await h.req('GET', '/commerce/orders/ORD_A', B_), 404, 'not_found'));
  A('X3 orders 越权(token) userB→ORD_A → 404',
    (await h.req('GET', '/commerce/orders/ORD_A', { authorization: `Bearer ${tokenFor('userB')}` })).status === 404);
}

// ── X4 · C-cross quiz / diagnosis ──────────────────────────────────────────
{
  A('X4 quiz GET 越权 userB→QZ_UC033 → 404 not_found_or_forbidden',
    is(await h.req('GET', '/quiz/QZ_UC033', B_), 404, 'not_found_or_forbidden'));
  A('X4 quiz begin 越权 userB→QZ_UC033 → 404',
    is(await h.post('/quiz/QZ_UC033/begin', { ...B_, 'resume-id': RID }, {}), 404, 'not_found_or_forbidden'));
  A('X4 diagnosis GET 越权 userB→DG_UC033 → 404 not_found_or_forbidden',
    is(await h.req('GET', '/diagnosis/DG_UC033', B_), 404, 'not_found_or_forbidden'));
  A('X4 diagnosis begin 越权 userB→DG_UC033 → 404',
    is(await h.post('/diagnosis/DG_UC033/begin', { ...B_, 'resume-id': RID }, {}), 404, 'not_found_or_forbidden'));
}

// ── X5 · B-C 跨线 + role-gate recruiter ────────────────────────────────────
{
  A('X5 B→C report: recU 读 IV_ASMT → 404（物理隔离）',
    (await h.req('GET', '/interview/IV_ASMT/report', REC)).status === 404);
  A('X5 B→C events: recU 订 IV_ACT → 404',
    (await h.req('GET', '/interview/IV_ACT/events', REC)).status === 404);
  A('X5 B→C resume profile: recU → 404',
    is(await h.req('GET', `/resume/${RID}/profile`, REC), 404, 'not_found_or_forbidden'));

  const rj = await h.req('GET', '/recruiter/jobs', A_);
  A('X5 role-gate: candidate GET /recruiter/jobs → 403 recruiter_required',
    rj.status === 403 && rj.body?.error === 'recruiter_required');
}

// ── X6 · role-gate admin ───────────────────────────────────────────────────
{
  const au = await h.req('GET', '/admin/users', A_);
  A('X6 role-gate: candidate GET /admin/users → 403 admin_required',
    au.status === 403 && au.body?.error === 'admin_required');
  A('X6 role-gate: recruiter GET /admin/users → 403',
    (await h.req('GET', '/admin/users', REC)).status === 403);
}

// ── X7 · A2 无 principal / 错 principal → DB 0 行 ───────────────────────────
{
  const none = await asP(null, 'SELECT count(*)::int AS n FROM interview WHERE id=$1', ['IV_ACT']);
  A('X7 A2 无 principal set_config → interview 0 行', Number(none.rows[0]?.n) === 0);

  const wrong = await asP('userB', 'SELECT count(*)::int AS n FROM interview WHERE id=$1', ['IV_ACT']);
  A('X7 错 principal userB → IV_ACT 0 行', Number(wrong.rows[0]?.n) === 0);

  const own = await asP('userA', 'SELECT count(*)::int AS n FROM interview WHERE id=$1', ['IV_ACT']);
  A('X7 对照 principal userA → IV_ACT 1 行', Number(own.rows[0]?.n) === 1);

  const resumeWrong = await asP('userB', 'SELECT count(*)::int AS n FROM resume WHERE id=$1::uuid', [RID]);
  A('X7 错 principal → resume 0 行', Number(resumeWrong.rows[0]?.n) === 0);

  const quizWrong = await asP('recU', 'SELECT count(*)::int AS n FROM resume_quiz WHERE id=$1', ['QZ_UC033']);
  A('X7 B 端 principal → C quiz 0 行（A4 DB）', Number(quizWrong.rows[0]?.n) === 0);
}

// ── X8 · privacy export 隔离（导出仅己）────────────────────────────────────
{
  const expB = await h.req('GET', '/privacy/export', B_);
  A('X8 export userB → 200', expB.status === 200);
  const ivs = Array.isArray(expB.body?.interviews) ? expB.body.interviews.map((x: any) => x.id) : ['__fail__'];
  const rsm = Array.isArray(expB.body?.resumes) ? expB.body.resumes.map((x: any) => x.id) : ['__fail__'];
  A('X8 export userB 不含 IV_ACT / IV_ASMT', !ivs.includes('IV_ACT') && !ivs.includes('IV_ASMT'));
  A('X8 export userB 不含 userA resume', !rsm.includes(RID));

  const expA = await h.req('GET', '/privacy/export', A_);
  const ivsA = Array.isArray(expA.body?.interviews) ? expA.body.interviews.map((x: any) => x.id) : [];
  A('X8 对照 export userA 含 IV_ACT', expA.status === 200 && ivsA.includes('IV_ACT'));
}

// ── W1 · worker principal honesty（A3 可证子集 · 无 Key / 无 live worker）──
{
  const jobNone = await asP(null, 'SELECT count(*)::int AS n FROM interview_job WHERE id=$1::uuid', [JOB_ID]);
  A('W1 A3-surrogate 无 principal → interview_job 0 行', Number(jobNone.rows[0]?.n) === 0);

  const jobWrong = await asP('userB', 'SELECT count(*)::int AS n FROM interview_job WHERE id=$1::uuid', [JOB_ID]);
  A('W1 错 principal userB → interview_job 0 行（worker 表 RLS）', Number(jobWrong.rows[0]?.n) === 0);

  const jobOwn = await asP('userA', 'SELECT count(*)::int AS n FROM interview_job WHERE id=$1::uuid', [JOB_ID]);
  A('W1 对照 principal userA → interview_job 1 行', Number(jobOwn.rows[0]?.n) === 1);

  const consumers = [
    'interview-consumer.ts',
    'diagnosis-consumer.ts',
    'quiz-consumer.ts',
    'report-worker.ts',
  ] as const;
  let srcOk = true;
  for (const f of consumers) {
    const txt = workerSrc(f);
    const n = (txt.match(/asPrincipal\(/g) || []).length;
    const ok = n >= 1;
    if (!ok) srcOk = false;
    A(`W1 source pin ${f} wraps asPrincipal (≥1)`, ok);
  }

  const cp = workerSrc('checkpoint-principal.ts');
  A('W1 source pin checkpoint-principal binds owner via withCheckpointAccess',
    /withCheckpointAccess/.test(cp) && /app\.principal_user|set_config|principal/.test(cp));
  A('W1 honesty: deprecated withCheckpointPrincipal rejects (no silent unbound)',
    /checkpoint_access_required/.test(cp) && /deprecated/i.test(cp));
}

// ── X9 · more authz classes（DB + HTTP · 无 Key）────────────────────────────
{
  const evWrong = await asP('userB', 'SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', ['IV_ACT']);
  A('X9 错 principal → interview_event(IV_ACT) 0 行', Number(evWrong.rows[0]?.n) === 0);

  const rptWrong = await asP('userB', 'SELECT count(*)::int AS n FROM ai_report WHERE interview_id=$1', ['IV_ASMT']);
  A('X9 错 principal → ai_report(IV_ASMT) 0 行', Number(rptWrong.rows[0]?.n) === 0);

  const entWrong = await asP('userB', 'SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1', ['userA']);
  A('X9 错 principal → entitlement_bucket(userA) 0 行', Number(entWrong.rows[0]?.n) === 0);

  const ntfWrong = await asP('userB', 'SELECT count(*)::int AS n FROM notification WHERE id=$1', ['NTF_UC033']);
  A('X9 错 principal → notification 0 行', Number(ntfWrong.rows[0]?.n) === 0);

  const cpWrong = await asP('userB', 'SELECT count(*)::int AS n FROM career_path WHERE id=$1', ['CP_UC033']);
  A('X9 错 principal → career_path 0 行', Number(cpWrong.rows[0]?.n) === 0);

  const ntfList = await h.req('GET', '/notifications', B_);
  const ntfIds = Array.isArray(ntfList.body?.notifications)
    ? ntfList.body.notifications.map((n: any) => n.id)
    : ['__fail__'];
  A('X9 HTTP notifications list userB 不见 NTF_UC033',
    ntfList.status === 200 && !ntfIds.includes('NTF_UC033'));

  const cpGet = await h.req('GET', '/interview/IV_ASMT/career-path', B_);
  A('X9 HTTP career-path 越权 userB→IV_ASMT → 404',
    cpGet.status === 404);
}

// ── X10 · concurrent cross-user burst（七类·高并发可证子集 · ≠ 七类齐）────
{
  const paths = [
    () => h.req('GET', '/interview/IV_ACT/report', B_),
    () => h.req('GET', '/interview/IV_ASMT/report', B_),
    () => h.req('GET', '/interview/IV_ACT/events', B_),
    () => h.req('GET', `/resume/${RID}/profile`, B_),
    () => h.req('GET', '/commerce/orders/ORD_A', B_),
    () => h.req('GET', '/quiz/QZ_UC033', B_),
    () => h.req('GET', '/diagnosis/DG_UC033', B_),
    () => h.req('GET', '/interview/IV_ASMT/career-path', B_),
  ];
  // 2× fan-out ≈ 16 parallel 越权 GETs
  const burst = await Promise.all([...paths, ...paths].map((fn) => fn()));
  const all404 = burst.every((r) => r.status === 404);
  A(`X10 concurrent burst ${burst.length}× cross-user GET → all 404 (≠七类齐)`, all404);
}

// ── X11 · cache/trace honesty（404 体不泄露属主 / 内容；全路径仍 GAP）────
{
  const leakTargets = [
    await h.req('GET', '/interview/IV_ASMT/report', B_),
    await h.req('GET', `/resume/${RID}/profile`, B_),
    await h.req('GET', '/commerce/orders/ORD_A', B_),
  ];
  const bodyStr = (r: { body: any }) => JSON.stringify(r.body ?? {});
  const noLeak = leakTargets.every((r) => {
    const s = bodyStr(r);
    return r.status === 404
      && !/userA/.test(s)
      && !/"overall"\s*:/.test(s)
      && !/sha-uc033-a/.test(s)
      && !/ORD_A.*paid|pack_10/.test(s);
  });
  A('X11 404 body 不泄露 owner/内容摘要（cache/trace 全路径仍 GAP）', noLeak);
}

// ── G-GAP · honesty pins（EXIT=0 仅=诚实钉 ≠ covered；七类未齐）────────────
{
  const gaps = [
    'GAP-UC033-WORKER-LIVE: A3 live worker/checkpointer 消费路径带 principal 未进本 HTTP prove（W1=DB job RLS+source asPrincipal 诚实子集 ≠ live e2e）',
    'GAP-UC033-CACHE-TRACE: 缓存键 / trace / 批 job 全路径注入未系统化钉（X11 仅 404 体不泄露子集）',
    'GAP-UC033-SEVEN-CLASS: 系统化七类未齐 — X10 burst≠高并发竞态/复杂跨聚合/逃逸通道专用格齐备',
    'GAP-UC033-FULL-E2E: 未进 e2e:isolated / full.e2e 作为独立 UC033 场景（full.e2e B RLS=旁证≠covered）',
    'GAP-UC033-NEG-CITE: neg:auth/neg:bend/neg:interview/neg:commerce 为旁证层，≠ 本 UC covered',
  ];
  for (const g of gaps) console.log(`PIN   ${g}`);
  A('G-GAP honesty pins printed (EXIT=0≠covered；七类未齐；W1≠WORKER-LIVE闭环)', gaps.length === 5);
}

console.log('\nNOTE: still ≠covered; stay matrix **partial**; cite neg:*/full.e2e RLS as 旁证; never covered');
console.log('NOTE: wave#6 closed §1b W1/X9/X10/X11 partial-ladder steps; live worker / cache-trace / seven-class / full.e2e remain');
await done();
