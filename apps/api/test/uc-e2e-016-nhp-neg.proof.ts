/**
 * UC-E2E-016 / 029 · NEG isolated PG/HTTP evidence · NHP-016-NEG-01
 * (REQUEST ai-docs/delivery/harness/nhp-batch-c-REQUEST.md §1 Case 1 · 矩阵 :121 NEG 列)
 *
 * Evidence layer: isolated real PG + real Nest HTTP (createApp+listen(0)+fetch,
 * _neg-harness three-layer shell · uc-e2e-025-nhp-bound-isolated.proof.ts 先例形).
 * Scope: quiz/diagnosis 业务负路径族(传输层 413/畸形 JSON 归 neg-input·互不替代):
 *   PC  = quiz/diagnosis 双口 happy create+begin 202 (对照基面)
 *   N1  = 缺 resume-id → 400 missing_resume_id (quiz :30 / diagnosis :27)
 *   N2  = 不存在 id begin → 404 not_found_or_forbidden (advisory 锁后 fail-closed :39/:36)
 *   N3  = 他人 resume 绑定 → 409 resume_not_found_or_not_ready (:49/:47 · 明钉以「他人 resume」变体行使)
 *   N4  = 预绑壳二次绑定 → 409 quiz/diagnosis_resume_reference_conflict (:57/:56 · 'created' 壳+resume_id/
 *         privacy_epoch 预绑非 NULL 正中 CAS `resume_id IS NULL AND privacy_epoch IS NULL` 守卫 0 行+
 *         零 job 行(幂等 :41-42 不短路)+bind 目标 resume owned∧ingested)
 *   N5  = 零桶用户 begin → 402 insufficient_entitlement + 额度净 0 (TC-E2E-016-no-credit 真行使 :59-65/:58-64)
 *   N6  = 重复 begin → 202 alreadyBegun 同 jobId + 恰 1 job 行 + 额度单扣 (幂等 :41-42/:38-39)
 *   N7  = ready 终态 abandon → 409 cannot_abandon (CAS 不倒退 :79-80/:77-78) + begin→abandon(有预留)→
 *         released:"released" 净账 0 (:81 releaseConsumption 真退) + 零预留子臂('created' 壳未 begin 直
 *         abandon)→ released:"error"(releaseConsumption 无 consumption 行如实返回 error · 期望按真实返回钉死)
 *   N8  = 跨用户 get/events → 404 不泄露 (RLS 0 行 :125/:98 + SSE events null→404)
 *   N1–N8 全程额度净账审计(失败臂零扣零退错)。
 *
 * 前置(经产品路径·非裸 INSERT): POST /privacy/consent(consent_record·逐 principal)+POST /resume 文本摄取
 * (owned∧ingested)。夹具豁免具名(REQUEST §5 枚举内): ①桶种子(entitlement_bucket INSERT·begin 类臂含
 * N7 begin→abandon 有预留子臂·cf1e570b:323 先例形) ④壳行种子含状态钉('created'/'ready'·沿 cf1e570b
 * seedQuiz 先例形)。consent 种子豁免本刀未行使(产品路径即达·如实申明)。
 *
 * Non-substitute: neg-input(传输层)· full.e2e quiz-402(Key blocked 层)· uc001:nhp-neg(interview 口 402
 * 映射族) = 旁证互不替代 · Ban 互借关列。
 *
 * Live-key isolation (uc025 bound-isolated R6 同形): scripts/run-e2e-isolated.mjs credential strip list
 * does NOT include MODEL_API_KEY → this proof deletes MODEL_API_KEY and MODEL_BASE_URL in-process FIRST,
 * then asserts unset before and after boot. Zero provider egress · est live=0.
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · row/NEG gap→case-only
 * 措辞 · EXIT0=case≠covered · coveredCount=8 不变 · Ban 借本收据宣 covered · ⛔push
 *
 *   pnpm uc016:nhp-neg:prove
 *   pnpm -C apps/api prove:uc016-nhp-neg   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot } from './_neg-harness';

const CMD = 'pnpm uc016:nhp-neg:prove';
const CASE_ID = 'NHP-016-NEG-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'PC' | 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7' | 'N8' | 'ISO' | 'SEED';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) {
    failures.push({ cls, name });
    console.log(`FAIL  [${cls}] ${name}`);
  } else {
    console.log(`PASS  [${cls}] ${name}`);
  }
};

// uuid 列面纪律(REQUEST §1 case 1 前置申明): resume.id/resume_quiz.resume_id(0061 起)均 uuid —
// 臂引用必须良构 UUID 字面量(非 UUID → pg 22P02 → 500 非产品 NEG 语义·臂自失效)。
const UUID_WELLFORMED_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type Ledger = { available: number; consumptionRows: number; consumptionReleased: number };

(async () => {
  console.log(`UC-E2E-016/029 ${CASE_ID} isolated PG/HTTP NEG evidence (quiz/diagnosis 业务负路径族)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('Non-substitute: neg-input(413/畸形 JSON) / full.e2e quiz-402 / uc001:nhp-neg(interview 402 族) 互不替代');
  console.log('EXIT0=case≠covered · 行 NEG gap→case-only 措辞 · Ban 借收据宣 covered · est live=0');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // R6 live-key isolation: shell strip list lacks MODEL_API_KEY → in-process self-delete pre-boot,
  // assert unset before and after boot (uc-e2e-025-nhp-bound-isolated.proof.ts:90 同形).
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-boot · shell strip list lacks MODEL_API_KEY)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  const h = await boot();
  const pool = h.pool;
  A('ISO', 'model-key-still-unset-after-boot(no re-import regression)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);
  const dbUrl = String(process.env.DATABASE_URL ?? process.env.PGHOST ?? '');
  const pgPort = String(process.env.PGPORT ?? '');
  A('ISO', 'dynamic-PG-port-present(or DATABASE_URL)', pgPort.length > 0 || /:\d+/.test(dbUrl));

  // 0121 真迁移链重放(夹具面·REVOKE+GRANT 幂等·真相=迁移链): harness sql/01 重建 app_role 会抹
  // 0121 的 pgp_sym_encrypt EXECUTE ACL — 产品路径 POST /resume 全链(blob 加密)在 harness 面行使
  // 所需。零产品码触·零新迁移。
  const mig0121 = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql', import.meta.url)), 'utf8');
  await pool.query(mig0121);
  console.log('PIN   NHP-016-NEG-ISO-0121-REPLAY: harness 面迁移链重放(pgp ACL·真相=迁移链 migrate 全链)');

  const S = Date.now().toString(36).toUpperCase();
  // Principals: A=主对照户(PC/N1/N2/N4/N6/N7/N8 被窥面) · B=零桶户(N5/N8 窥探者) · V=他人 resume 户(N3)
  const PA = `nhp016a_${S}`;
  const PB = `nhp016b_${S}`;
  const PV = `nhp016v_${S}`;

  // 前置(产品路径·非裸 INSERT): consent(POST /privacy/consent) — consent 种子豁免本刀未行使·如实申明。
  const consent = async (principal: string) => {
    const r = await h.post('/privacy/consent', h.U(principal), { purpose: 'resume_processing' });
    A('SEED', `product-path consent ${principal} → 200`, r.status === 200);
    return r;
  };
  // 前置(产品路径): POST /resume 文本摄取 → owned∧ingested(唯一后缀防 dedup)。
  const uploadResume = async (principal: string, tag: string) => {
    const text = `NHP016 resume ${tag} ${S} — senior backend engineer with distributed systems background ${Math.random().toString(36).slice(2)}`;
    const r = await h.post('/resume', h.U(principal), { text });
    if (r.status !== 200 || r.body?.status !== 'ingested') {
      console.log(`SEED_FAIL uploadResume ${principal}/${tag} status=${r.status} body=${JSON.stringify(r.body)}`);
    }
    return r.body as { resumeId: string; status: string };
  };
  // 豁免①(§5 枚举具名·cf1e570b:323 先例形): entitlement_bucket 桶种子 — begin 类臂(PC/N6/N7 有预留子臂)所需。
  const seedBucket = async (principal: string, units: number) => {
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', $2, now() + interval '300 days')`,
      [principal, units],
    );
  };
  // 豁免④(§5 枚举具名·cf1e570b seedQuiz 先例形): 壳行种子含状态钉('created' 预绑/'ready' 终态)。
  const seedQuizShell = async (id: string, owner: string, status: string, resumeId: string | null, epoch: number | null) => {
    await pool.query(
      `INSERT INTO resume_quiz(id, owner_user_id, status, resume_id, privacy_epoch)
       VALUES ($1, $2, $3, $4::uuid, $5)`,
      [id, owner, status, resumeId, epoch],
    );
  };
  const seedDiagnosisShell = async (id: string, owner: string, status: string, resumeId: string | null, epoch: number | null) => {
    await pool.query(
      `INSERT INTO resume_diagnosis(id, owner_user_id, status, resume_id, privacy_epoch)
       VALUES ($1, $2, $3, $4::uuid, $5)`,
      [id, owner, status, resumeId, epoch],
    );
  };

  // 额度净账审计器(N1–N8 全程): available=Σ(units_total−units_reserved−units_consumed) + consumption 行账。
  const ledgerOf = async (principal: string): Promise<Ledger> => {
    const b = await pool.query(
      `SELECT COALESCE(SUM(units_total - units_reserved - units_consumed), 0)::float8 AS avail
         FROM entitlement_bucket WHERE owner_user_id=$1`,
      [principal],
    );
    const c = await pool.query(
      `SELECT count(*)::int AS n, COALESCE(SUM(CASE WHEN status='released' THEN 1 ELSE 0 END), 0)::int AS rel
         FROM entitlement_consumption WHERE owner_user_id=$1`,
      [principal],
    );
    return {
      available: Number(b.rows[0]?.avail ?? 0),
      consumptionRows: Number(c.rows[0]?.n ?? 0),
      consumptionReleased: Number(c.rows[0]?.rel ?? 0),
    };
  };
  const jobCount = async (table: 'quiz_job' | 'diagnosis_job', ownerCol: string, idCol: string, id: string) =>
    Number((await pool.query(
      `SELECT count(*)::int AS n FROM ${table} WHERE ${ownerCol} IS NOT NULL AND ${idCol}=$1`,
      [id],
    )).rows[0]?.n ?? 0);

  // ── Seeds ──────────────────────────────────────────────────────────────
  await consent(PA);
  await consent(PB);
  await consent(PV);
  const resA1 = await uploadResume(PA, 'A1'); // A 的对照/绑定简历(ingested)
  const resA2 = await uploadResume(PA, 'A2'); // A 的第二简历(N4 bind 目标)
  const resV1 = await uploadResume(PV, 'V1'); // V 的简历(他人·N3 变体行使面)
  A('SEED', 'product-path resumes owned∧ingested (A1/A2/V1 · uuid 列面良构)',
    UUID_WELLFORMED_RE.test(String(resA1.resumeId)) && UUID_WELLFORMED_RE.test(String(resA2.resumeId))
    && UUID_WELLFORMED_RE.test(String(resV1.resumeId)));
  await seedBucket(PA, 10.0); // A: PC/N6/N7 有预留臂预算
  // B: 零桶(TC-E2E-016-no-credit 面) — 零 INSERT·如实零桶
  const ledgerA0 = await ledgerOf(PA);
  const ledgerB0 = await ledgerOf(PB);
  A('SEED', 'principal A bucket seeded(10.0) · principal B zero-bucket(as-is)',
    ledgerA0.available === 10.0 && ledgerB0.available === 0);

  const beginQuiz = (quizId: string, principal: string, resumeId?: string) =>
    h.post(`/quiz/${quizId}/begin`, { ...h.U(principal), ...(resumeId !== undefined ? { 'resume-id': resumeId } : {}) }, {});
  const beginDiagnosis = (dgId: string, principal: string, resumeId?: string) =>
    h.post(`/diagnosis/${dgId}/begin`, { ...h.U(principal), ...(resumeId !== undefined ? { 'resume-id': resumeId } : {}) }, {});

  // ── PC: 双口 happy create+begin 202(对照基面) ──
  {
    const cq = await h.post('/quiz', h.U(PA), {});
    A('PC', 'quiz create 200 status=created', cq.status === 200 && cq.body?.status === 'created');
    const cd = await h.post('/diagnosis', h.U(PA), {});
    A('PC', 'diagnosis create 200 status=created', cd.status === 200 && cd.body?.status === 'created');
    const bq = await beginQuiz(String(cq.body?.quizId), PA, String(resA1.resumeId));
    A('PC', 'quiz begin 202 accepted+jobId', bq.status === 202 && bq.body?.accepted === true && typeof bq.body?.jobId === 'string');
    const bd = await beginDiagnosis(String(cd.body?.diagnosisId), PA, String(resA1.resumeId));
    A('PC', 'diagnosis begin 202 accepted+jobId', bd.status === 202 && bd.body?.accepted === true && typeof bd.body?.jobId === 'string');
    const led = await ledgerOf(PA);
    A('PC', 'PC side-effect ledger: exactly -2.0 total (quiz+diagnosis 各预留 1.0)',
      Math.abs(led.available - (ledgerA0.available - 2.0)) < 1e-9 && led.consumptionRows === 2);
  }

  // ── N1: 缺 resume-id → 400 missing_resume_id(双口 :30/:27) ──
  {
    const cq = await h.post('/quiz', h.U(PA), {});
    const cd = await h.post('/diagnosis', h.U(PA), {});
    const before = await ledgerOf(PA);
    const bq = await beginQuiz(String(cq.body?.quizId), PA); // 无 resume-id 头
    const bd = await beginDiagnosis(String(cd.body?.diagnosisId), PA);
    A('N1', 'quiz begin no resume-id → 400 missing_resume_id', bq.status === 400 && bq.body?.error === 'missing_resume_id');
    A('N1', 'diagnosis begin no resume-id → 400 missing_resume_id', bd.status === 400 && bd.body?.error === 'missing_resume_id');
    const after = await ledgerOf(PA);
    A('N1', 'N1 zero-side-effect ledger(net 0 · 失败臂零扣)', after.available === before.available && after.consumptionRows === before.consumptionRows);
  }

  // ── N2: 不存在 id begin → 404 not_found_or_forbidden(advisory 锁后 fail-closed :39/:36) ──
  {
    const ghostQ = `qz_nhp016_ghost_${S}`;
    const ghostD = `dg_nhp016_ghost_${S}`;
    const before = await ledgerOf(PA);
    const bq = await beginQuiz(ghostQ, PA, String(resA1.resumeId));
    const bd = await beginDiagnosis(ghostD, PA, String(resA1.resumeId));
    A('N2', 'quiz begin ghost id → 404 not_found_or_forbidden', bq.status === 404 && bq.body?.error === 'not_found_or_forbidden');
    A('N2', 'diagnosis begin ghost id → 404 not_found_or_forbidden', bd.status === 404 && bd.body?.error === 'not_found_or_forbidden');
    const after = await ledgerOf(PA);
    A('N2', 'N2 zero-side-effect ledger(net 0)', after.available === before.available && after.consumptionRows === before.consumptionRows);
  }

  // ── N3: 他人 resume 绑定 → 409 resume_not_found_or_not_ready(:49/:47 · 他人 owned∧ingested 变体) ──
  {
    const cq = await h.post('/quiz', h.U(PA), {});
    const cd = await h.post('/diagnosis', h.U(PA), {});
    const before = await ledgerOf(PA);
    const bq = await beginQuiz(String(cq.body?.quizId), PA, String(resV1.resumeId)); // V 的 resume — RLS owner 谓词 0 行
    const bd = await beginDiagnosis(String(cd.body?.diagnosisId), PA, String(resV1.resumeId));
    A('N3', 'quiz begin others-resume → 409 resume_not_found_or_not_ready', bq.status === 409 && bq.body?.error === 'resume_not_found_or_not_ready');
    A('N3', 'diagnosis begin others-resume → 409 resume_not_found_or_not_ready', bd.status === 409 && bd.body?.error === 'resume_not_found_or_not_ready');
    const after = await ledgerOf(PA);
    A('N3', 'N3 zero-side-effect ledger(net 0)', after.available === before.available && after.consumptionRows === before.consumptionRows);
    A('N3', 'N3 no job row created(both ports)',
      (await jobCount('quiz_job', 'owner_user_id', 'quiz_id', String(cq.body?.quizId))) === 0
      && (await jobCount('diagnosis_job', 'owner_user_id', 'diagnosis_id', String(cd.body?.diagnosisId))) === 0);
  }

  // ── N4: 预绑壳二次绑定 → 409 *_resume_reference_conflict(:57/:56 · CAS 守卫 0 行) ──
  {
    const qz = `qz_nhp016_n4_${S}`;
    const dg = `dg_nhp016_n4_${S}`;
    // 'created' 壳 + resume_id/privacy_epoch 预绑非 NULL(正中 resume_id IS NULL AND privacy_epoch IS NULL 守卫)
    await seedQuizShell(qz, PA, 'created', String(resA1.resumeId), 1);
    await seedDiagnosisShell(dg, PA, 'created', String(resA1.resumeId), 1);
    const before = await ledgerOf(PA);
    // bind 目标=A2(owned∧ingested·否则 :49/:47 前段 409 先发遮蔽冲突面) — 404 幂等不短路(零 job 行)
    const bq = await beginQuiz(qz, PA, String(resA2.resumeId));
    const bd = await beginDiagnosis(dg, PA, String(resA2.resumeId));
    A('N4', 'quiz pre-bound shell rebind → 409 quiz_resume_reference_conflict', bq.status === 409 && bq.body?.error === 'quiz_resume_reference_conflict');
    A('N4', 'diagnosis pre-bound shell rebind → 409 diagnosis_resume_reference_conflict', bd.status === 409 && bd.body?.error === 'diagnosis_resume_reference_conflict');
    const shellRow = await pool.query('SELECT resume_id::text AS rid, privacy_epoch AS ep FROM resume_quiz WHERE id=$1', [qz]);
    A('N4', 'shell pin unchanged(resume_id/privacy_epoch 原值·CAS 拒写)',
      String(shellRow.rows[0]?.rid) === String(resA1.resumeId) && Number(shellRow.rows[0]?.ep) === 1);
    A('N4', 'shell zero job rows(幂等不短路·零 enqueue)',
      (await jobCount('quiz_job', 'owner_user_id', 'quiz_id', qz)) === 0
      && (await jobCount('diagnosis_job', 'owner_user_id', 'diagnosis_id', dg)) === 0);
    const after = await ledgerOf(PA);
    A('N4', 'N4 zero-side-effect ledger(net 0)', after.available === before.available && after.consumptionRows === before.consumptionRows);
  }

  // ── N5: 零桶用户 begin → 402 insufficient_entitlement + 额度净 0(TC-E2E-016-no-credit 真行使) ──
  {
    const cq = await h.post('/quiz', h.U(PB), {});
    const cd = await h.post('/diagnosis', h.U(PB), {});
    const resB1 = await uploadResume(PB, 'B1'); // B 自有 owned∧ingested resume(N5 前置)
    const before = await ledgerOf(PB);
    const bq = await beginQuiz(String(cq.body?.quizId), PB, String(resB1.resumeId));
    const bd = await beginDiagnosis(String(cd.body?.diagnosisId), PB, String(resB1.resumeId));
    A('N5', 'quiz zero-bucket begin → 402 insufficient_entitlement', bq.status === 402 && bq.body?.error === 'insufficient_entitlement');
    A('N5', 'diagnosis zero-bucket begin → 402 insufficient_entitlement', bd.status === 402 && bd.body?.error === 'insufficient_entitlement');
    const after = await ledgerOf(PB);
    A('N5', 'N5 额度净 0(零桶零扣零 consumption 行)', after.available === 0 && after.consumptionRows === 0 && before.consumptionRows === 0);
    A('N5', 'N5 no job row(预留失败零 enqueue)',
      (await jobCount('quiz_job', 'owner_user_id', 'quiz_id', String(cq.body?.quizId))) === 0
      && (await jobCount('diagnosis_job', 'owner_user_id', 'diagnosis_id', String(cd.body?.diagnosisId))) === 0);
  }

  // ── N6: 重复 begin → 202 alreadyBegun 同 jobId + 恰 1 job 行 + 额度单扣(幂等 :41-42/:38-39) ──
  {
    const cq = await h.post('/quiz', h.U(PA), {});
    const cd = await h.post('/diagnosis', h.U(PA), {});
    const b1q = await beginQuiz(String(cq.body?.quizId), PA, String(resA1.resumeId));
    const b1d = await beginDiagnosis(String(cd.body?.diagnosisId), PA, String(resA1.resumeId));
    const before = await ledgerOf(PA);
    const b2q = await beginQuiz(String(cq.body?.quizId), PA, String(resA1.resumeId));
    const b2d = await beginDiagnosis(String(cd.body?.diagnosisId), PA, String(resA1.resumeId));
    A('N6', 'quiz repeat begin → 202 alreadyBegun same jobId', b2q.status === 202 && b2q.body?.alreadyBegun === true && b2q.body?.jobId === b1q.body?.jobId);
    A('N6', 'diagnosis repeat begin → 202 alreadyBegun same jobId', b2d.status === 202 && b2d.body?.alreadyBegun === true && b2d.body?.jobId === b1d.body?.jobId);
    A('N6', 'exactly 1 job row per port(零双入队)',
      (await jobCount('quiz_job', 'owner_user_id', 'quiz_id', String(cq.body?.quizId))) === 1
      && (await jobCount('diagnosis_job', 'owner_user_id', 'diagnosis_id', String(cd.body?.diagnosisId))) === 1);
    const after = await ledgerOf(PA);
    const consQ = Number((await pool.query(
      "SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2",
      [PA, String(cq.body?.quizId)],
    )).rows[0]?.n ?? 0);
    const consD = Number((await pool.query(
      "SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2",
      [PA, String(cd.body?.diagnosisId)],
    )).rows[0]?.n ?? 0);
    A('N6', 'N6 额度单扣(重复 begin 零二次预留零二次扣·每口恰 1 consumption 行)',
      after.available === before.available && consQ === 1 && consD === 1);
  }

  // ── N7: abandon 族(ready 409 / begin→abandon released / 零预留子臂 released:"error") ──
  {
    // (a) ready 终态后 abandon → 409 cannot_abandon(CAS 不倒退已完成 :79-80/:77-78)
    const readyQ = `qz_nhp016_n7ready_${S}`;
    const readyD = `dg_nhp016_n7ready_${S}`;
    await seedQuizShell(readyQ, PA, 'ready', null, null);
    await seedDiagnosisShell(readyD, PA, 'ready', null, null);
    const a1q = await h.post(`/quiz/${readyQ}/abandon`, h.U(PA), {});
    const a1d = await h.post(`/diagnosis/${readyD}/abandon`, h.U(PA), {});
    A('N7', 'quiz ready-terminal abandon → 409 cannot_abandon', a1q.status === 409 && a1q.body?.error === 'cannot_abandon');
    A('N7', 'diagnosis ready-terminal abandon → 409 cannot_abandon', a1d.status === 409 && a1d.body?.error === 'cannot_abandon');
    const readyRowQ = await pool.query("SELECT status FROM resume_quiz WHERE id=$1", [readyQ]);
    A('N7', 'ready terminal not regressed(status 仍 ready)', String(readyRowQ.rows[0]?.status) === 'ready');

    // (b) begin→abandon(有预留) → released:"released" 退还预留·净账 0(:81 releaseConsumption 真退)
    const cq = await h.post('/quiz', h.U(PA), {});
    const cd = await h.post('/diagnosis', h.U(PA), {});
    await beginQuiz(String(cq.body?.quizId), PA, String(resA1.resumeId));
    await beginDiagnosis(String(cd.body?.diagnosisId), PA, String(resA1.resumeId));
    const reserved = await ledgerOf(PA); // -4.0 vs N7 之前的基线段(quiz+diagnosis 两对)
    const a2q = await h.post(`/quiz/${String(cq.body?.quizId)}/abandon`, h.U(PA), {});
    const a2d = await h.post(`/diagnosis/${String(cd.body?.diagnosisId)}/abandon`, h.U(PA), {});
    A('N7', 'quiz begin→abandon → 200 abandoned released="released"', a2q.status === 200 && a2q.body?.abandoned === true && a2q.body?.released === 'released');
    A('N7', 'diagnosis begin→abandon → 200 abandoned released="released"', a2d.status === 200 && a2d.body?.abandoned === true && a2d.body?.released === 'released');
    const releasedLed = await ledgerOf(PA);
    A('N7', 'N7(b) 净账 0(reserve 1.0×2 → release 1.0×2 · available 回到预留前值+2.0·恰 2 行 released)',
      Math.abs(releasedLed.available - (reserved.available + 2.0)) < 1e-9
      && releasedLed.consumptionReleased === 2);
    const abRowQ = await pool.query("SELECT status FROM resume_quiz WHERE id=$1", [String(cq.body?.quizId)]);
    A('N7', 'abandoned rows terminal status=failed(CAS 终态)', String(abRowQ.rows[0]?.status) === 'failed');

    // (c) 零预留子臂:'created' 壳未经 begin 直 abandon → CAS 成功但 releaseConsumption 无 consumption 行
    //     → released:"error"(如实返回·期望按真实返回钉死·Ban 断言迁就) · 净账 0
    const bareQ = `qz_nhp016_n7bare_${S}`;
    const bareD = `dg_nhp016_n7bare_${S}`;
    await seedQuizShell(bareQ, PA, 'created', null, null);
    await seedDiagnosisShell(bareD, PA, 'created', null, null);
    const beforeBare = await ledgerOf(PA);
    const a3q = await h.post(`/quiz/${bareQ}/abandon`, h.U(PA), {});
    const a3d = await h.post(`/diagnosis/${bareD}/abandon`, h.U(PA), {});
    A('N7', 'quiz bare-shell abandon → 200 released="error"(无 consumption 行如实返回)',
      a3q.status === 200 && a3q.body?.abandoned === true && a3q.body?.released === 'error');
    A('N7', 'diagnosis bare-shell abandon → 200 released="error"',
      a3d.status === 200 && a3d.body?.abandoned === true && a3d.body?.released === 'error');
    const afterBare = await ledgerOf(PA);
    A('N7', 'N7(c) 净账 0(零预留零误退)', afterBare.available === beforeBare.available && afterBare.consumptionRows === beforeBare.consumptionRows);
  }

  // ── N8: 跨用户 get/events → 404 不泄露(RLS 0 行 :125/:98 + SSE events null→404 :60/:58) ──
  {
    const mineQ = await h.post('/quiz', h.U(PA), {});
    const mineD = await h.post('/diagnosis', h.U(PA), {});
    const gq = await h.req('GET', `/quiz/${String(mineQ.body?.quizId)}`, h.U(PB));
    const gd = await h.req('GET', `/diagnosis/${String(mineD.body?.diagnosisId)}`, h.U(PB));
    A('N8', 'cross-user quiz get → 404 not_found_or_forbidden', gq.status === 404 && gq.body?.error === 'not_found_or_forbidden');
    A('N8', 'cross-user diagnosis get → 404 not_found_or_forbidden', gd.status === 404 && gd.body?.error === 'not_found_or_forbidden');
    const eq = await h.req('GET', `/quiz/${String(mineQ.body?.quizId)}/events`, h.U(PB));
    const ed = await h.req('GET', `/diagnosis/${String(mineD.body?.diagnosisId)}/events`, h.U(PB));
    A('N8', 'cross-user quiz events → 404(SSE 取数 null 越权)', eq.status === 404 && eq.body?.error === 'not_found_or_forbidden');
    A('N8', 'cross-user diagnosis events → 404(SSE 取数 null 越权)', ed.status === 404 && ed.body?.error === 'not_found_or_forbidden');
    const ownQ = await h.req('GET', `/quiz/${String(mineQ.body?.quizId)}`, h.U(PA));
    A('N8', 'owner get still visible(404 系越权拒非资源缺失)', ownQ.status === 200 && ownQ.body?.id === mineQ.body?.quizId);
  }

  // ── 全程净账终审计(N1–N8 失败臂零扣零退错) ──
  {
    const finA = await ledgerOf(PA);
    const finB = await ledgerOf(PB);
    const finV = await ledgerOf(PV);
    // A 的净账 = PC(-2.0) + N6(-2.0) + N7(b) 先 -4.0 后全退 = 净 -4.0;N1/N2/N3/N4/N5/N7a/N7c/N8 全零。
    A('N8', '全程净账审计 A(恰 -4.0: PC×2+N6×2·失败臂零扣零退错)', Math.abs(finA.available - (ledgerA0.available - 4.0)) < 1e-9);
    A('N8', '全程净账审计 B/V(零桶零扣·他人户零扰动)', finB.available === 0 && finB.consumptionRows === 0 && finV.available === 0 && finV.consumptionRows === 0);
  }

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  isolated PG+HTTP NEG evidence for quiz/diagnosis 业务负路径族 (PC+N1–N8)`);
    console.log('HTTP_ERROR_PIN  400 missing_resume_id · 404 not_found_or_forbidden · 409 resume_not_found_or_not_ready · 409 *_resume_reference_conflict · 402 insufficient_entitlement · 409 cannot_abandon · released=released|error');
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + real HTTP + real PG(consent/resume 产品路径 · 豁免①桶种子+④壳行种子具名) · 与 neg-input/full.e2e/uc001:nhp-neg 互不替代');
  }
  console.log('ROW_STILL_GAP  UC-E2E-016/029 NEG 列 gap→case-only 措辞. FAULT 已钉(Line Y2) · BOUND partial · ADV blind. coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban self-nail · post dual e2e+privacy still required · actualSpendCny=null');
  console.log(`\nCMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
})().catch((e) => {
  console.error(e);
  console.log(`\nGAP  ${CASE_ID}  harness/runtime failure: ${e?.message ?? e}`);
  console.log(`ATTEMPT_END  iso=${new Date().toISOString()} EXIT=1 (crash)`);
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
});
