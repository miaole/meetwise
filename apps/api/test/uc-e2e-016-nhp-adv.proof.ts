/**
 * UC-E2E-016 / 029 · ADV isolated PG/HTTP evidence · NHP-016-ADV-01
 * (REQUEST ai-docs/delivery/harness/x16-adv-REQUEST.md §1 · 矩阵 :121 ADV 列)
 *
 * Evidence layer: isolated real PG + real Nest HTTP (createApp+listen(0)+fetch,
 * _neg-harness three-layer shell · uc-e2e-025-nhp-bound-isolated.proof.ts 先例形).
 * Scope: quiz/diagnosis 双口同主体状态机/输入对抗六臂族(恒 own-shell own-resume own-principal):
 *   PC  = 双口 happy create+begin(带 target-role)202 对照基面
 *   S1  = 种子 'ready' 终态壳(resume_id NULL·零 job)→ 双口 begin → 409 *_resume_reference_conflict
 *         (CAS status 谓词正中·≠ N4 空值谓词·≠ N2 ghost id)+壳字节零动(status/resume_id/version)
 *   S2  = bare 'created' 壳 abandon(200 released:"error"·批 C N7c 先例形)→ re-begin 死壳复活拒 →
 *         409 *_resume_reference_conflict(status≠'created' 触发·≠ N7 只 abandon 不 re-begin)
 *   S3  = begin#1(R1,'X') 202 → begin#2(R2,'Y') 换载荷 → 202 alreadyBegun 同 jobId(幂等 early-return
 *         先于 resume 查/CAS/enqueue·置换载荷全不达持久面)+DB pin: quiz_job.resume_id=R1+
 *         payload 恰 {"targetRole":"X"}(条件键)+resume_diagnosis.target_role='X'(列持久)+各口恰 1 consumption
 *   S4  = 自弃 abandon→200(status='failed')→ 再 abandon → 409 cannot_abandon(CAS 不倒退·态源=自弃
 *         failed≠N7a worker ready——同码不同态源如实申明)
 *   A1  = 产品路径种 201 壳/口 → list limit 对抗值域 fuzz: '-1'→恰 1(底钳)/'0'→恰 50(Number('0')=0
 *         falsy→50 按码钉)/'abc'→恰 50(NaN→50)/'1e9'→恰 200(顶钳行使·总行>200)+缺省→恰 50+
 *         非空 status 对抗 token → 200 零行零 500(参数化 $1 行使·token 非空——空串 falsy 旁路过滤返全量,
 *         防假红)+表完好复验
 *   A2  = diagnosis target_role 列对抗持久面: 250 字 → 202+列恰 100 字;空白 → 202+列 NULL(两次 begin
 *         不同壳·否则幂等短路)+quiz 口对照: payload 条件键空白→'{}' 现状字节(真 PG 持久面行使)
 *   N   = 全程额度净账审计: PC 双口 −2.0(对照基面)+S3 双口 −2.0+A2 三 begin −3.0·S1/S2/S4/A1 全零扣
 *         零误退·合账 −7.0/consumption 7 行(批 C NEG 枚举式正确形)。
 *
 * r2 席2 P3 履行(025-C2 先例形): 专桶种子 units_total=7.0(≥7.0 SEED 断言)+FIFO-first 证面——
 * 专桶 expires_at 早于 decoy 桶(5.0·400d),产品路径 reserveEntitlement ORDER BY expires_at ASC 恒先抽
 * 专桶;终审计专桶耗尽 0/decoy 原封 5.0=行为级 FIFO-first 行使(非仅种子声明)。
 *
 * 前置(经产品路径·非裸 INSERT): POST /privacy/consent(consent_record)+POST /resume 文本摄取
 * (owned∧ingested·唯一后缀防 dedup)。夹具豁免具名(REQUEST §5 枚举内·枚举完备): ①桶种子
 * (entitlement_bucket INSERT·专桶 7.0+decoy 5.0·cf1e570b:323 先例形)④壳行种子含状态钉(S1 'ready'·
 * 沿批 C N7 seedQuiz/seedDiagnosis 先例形)——S2/S4 'created' 壳与 A1 201×2 壳走产品路径 POST create
 * 非豁免面(比 §5 枚举更严·如实申明)。0121 真迁移链重放承登(批 C R1 同形·harness 面缺 pgp ACL)。
 *
 * Non-substitute: 批 C NEG 7f094eac N1–N8(同 row NEG 列·S1 status 谓词≠N4 空值谓词/S2 re-begin≠N7/
 * S3 换载荷≠N6 同载荷/S4 自弃 failed 态源≠N7a ready 态源/A1 对抗值域≠quiz-list 合法值/A2 列持久面≠
 * ROLE-INPUT in-process)· uc018-H2/adv(interview 口异码异服)· X33 三臂族(跨主体竞态/账本/逃逸+rev2
 * 同主体 A∥A begin 并行 race 子臂=并行竞态格,本刀 S3=串行换载荷幂等短路,reason 级可分互不替代)。
 *
 * Live-key isolation (uc025 bound-isolated R6 同形·批 C NEG 同形): scripts/run-e2e-isolated.mjs
 * credential strip list does NOT include MODEL_API_KEY → this proof deletes MODEL_API_KEY and
 * MODEL_BASE_URL in-process FIRST, then asserts unset before and after boot (egress inventory
 * test-isolation 登记臂·additive 2 条目)。Zero provider egress · est live=0。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · ADV blind 保持+case-only
 * 措辞 · EXIT0=case≠covered · coveredCount=8 不变 · Ban 借本收据宣 covered/升格 · ⛔push
 *
 *   pnpm uc016:nhp-adv:prove
 *   pnpm -C apps/api prove:uc016-nhp-adv   (raw; needs isolated DATABASE_URL)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot } from './_neg-harness';

const CMD = 'pnpm uc016:nhp-adv:prove';
const CASE_ID = 'NHP-016-ADV-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'PC' | 'S1' | 'S2' | 'S3' | 'S4' | 'A1' | 'A2' | 'N' | 'ISO' | 'SEED';
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

// uuid 列面良构纪律(REQUEST §1 前置申明·沿批 C NEG 同形): resume.id/resume_*.resume_id(0061 起)均
// uuid — 臂引用必须良构 UUID 字面量(非 UUID → pg 22P02 → 500 臂自失效)。
const UUID_WELLFORMED_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type Ledger = { available: number; consumptionRows: number; consumptionReleased: number };

(async () => {
  console.log(`UC-E2E-016/029 ${CASE_ID} isolated PG/HTTP ADV evidence (quiz/diagnosis 双口同主体对抗六臂族)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('Non-substitute: 批 C NEG N1–N8 / quiz-list / role-input / uc018 族 / X33 三臂族(含 rev2 A∥A race 子臂) 互不替代');
  console.log('EXIT0=case≠covered · ADV blind 保持+case-only 措辞 · Ban 借收据宣 covered · est live=0');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // R6 live-key isolation: shell strip list lacks MODEL_API_KEY → in-process self-delete pre-boot,
  // assert unset before and after boot (uc-e2e-016-nhp-neg.proof.ts:78 同形).
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

  // 0121 真迁移链重放(夹具面·REVOKE+GRANT 幂等·真相=迁移链·批 C R1 同形): harness sql/01 重建
  // app_role 会抹 0121 的 pgp_sym_encrypt EXECUTE ACL — 产品路径 POST /resume 全链(blob 加密)所需。
  const mig0121 = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql', import.meta.url)), 'utf8');
  await pool.query(mig0121);
  console.log('PIN   NHP-016-ADV-ISO-0121-REPLAY: harness 面迁移链重放(pgp ACL·真相=迁移链 migrate 全链)');

  const S = Date.now().toString(36).toUpperCase();
  // Principal: A=恒同主体对照户(own-shell own-resume own-principal·全臂零跨主体)
  const PA = `nhp016adv_${S}`;

  // 前置(产品路径): consent + resume 摄取。
  const consentR = await h.post('/privacy/consent', h.U(PA), { purpose: 'resume_processing' });
  A('SEED', 'product-path consent A → 200', consentR.status === 200);
  const uploadResume = async (tag: string) => {
    const text = `NHP016ADV resume ${tag} ${S} — senior backend engineer with distributed systems background ${Math.random().toString(36).slice(2)}`;
    const r = await h.post('/resume', h.U(PA), { text });
    if (r.status !== 200 || r.body?.status !== 'ingested') {
      console.log(`SEED_FAIL uploadResume ${tag} status=${r.status} body=${JSON.stringify(r.body)}`);
    }
    return r.body as { resumeId: string; status: string };
  };
  const resA1 = await uploadResume('A1'); // R1: 对照/绑定简历(S1/S2/S3 begin#1/A2)
  const resA2 = await uploadResume('A2'); // R2: S3 换载荷置换面 resume-id(begin#2·owned∧ingested)
  A('SEED', 'product-path resumes owned∧ingested (A1/A2 · uuid 列面良构)',
    UUID_WELLFORMED_RE.test(String(resA1.resumeId)) && UUID_WELLFORMED_RE.test(String(resA2.resumeId)));

  // r2 席2 P3(025-C2 先例形): 豁免①桶种子 — 专桶(7.0·300d·FIFO-first=expires_at 最早)+decoy 桶
  // (5.0·400d·FIFO 后位)——终审计以「专桶耗尽/decoy 原封」证产品路径 FIFO-first 行使。
  const DEDICATED_UNITS = 7.0; // 恰等净账: PC 2.0+S3 2.0+A2 3.0=7.0
  await pool.query(
    `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
     VALUES ($1, 'paid', $2, now() + interval '300 days'),
            ($1, 'paid', 5.0, now() + interval '400 days')`,
    [PA, DEDICATED_UNITS],
  );
  const bucketRows = await pool.query(
    `SELECT id, kind, units_total::float8 AS units_total, expires_at
       FROM entitlement_bucket WHERE owner_user_id=$1 ORDER BY expires_at ASC, id ASC`, [PA]);
  A('SEED', 'dedicated bucket units_total ≥ 7.0 SEED assertion(专桶 025-C2 先例形·恰等 7.0 净账预算)',
    bucketRows.rowCount === 2 && String(bucketRows.rows[0]?.kind) === 'paid'
    && Number(bucketRows.rows[0]?.units_total) >= 7.0);
  A('SEED', 'dedicated bucket is FIFO-first candidate(expires_at 最早·reserveEntitlement ORDER BY 同序·decoy 后位)',
    bucketRows.rowCount === 2
    && new Date(String(bucketRows.rows[0]?.expires_at)).getTime() < new Date(String(bucketRows.rows[1]?.expires_at)).getTime()
    && Number(bucketRows.rows[1]?.units_total) === 5.0);

  // 额度净账审计器(全程·批 C NEG ledgerOf 先例形): available=Σ(units_total−units_reserved−units_consumed)。
  const ledgerOf = async (): Promise<Ledger> => {
    const b = await pool.query(
      `SELECT COALESCE(SUM(units_total - units_reserved - units_consumed), 0)::float8 AS avail
         FROM entitlement_bucket WHERE owner_user_id=$1`, [PA]);
    const c = await pool.query(
      `SELECT count(*)::int AS n, COALESCE(SUM(CASE WHEN status='released' THEN 1 ELSE 0 END), 0)::int AS rel
         FROM entitlement_consumption WHERE owner_user_id=$1`, [PA]);
    return {
      available: Number(b.rows[0]?.avail ?? 0),
      consumptionRows: Number(c.rows[0]?.n ?? 0),
      consumptionReleased: Number(c.rows[0]?.rel ?? 0),
    };
  };
  const ledgerA0 = await ledgerOf();
  A('SEED', 'baseline ledger = 12.0(专桶 7.0+decoy 5.0·零 consumption)',
    Math.abs(ledgerA0.available - 12.0) < 1e-9 && ledgerA0.consumptionRows === 0 && ledgerA0.consumptionReleased === 0);

  const jobCount = async (table: 'quiz_job' | 'diagnosis_job', idCol: string, id: string) =>
    Number((await pool.query(
      `SELECT count(*)::int AS n FROM ${table} WHERE owner_user_id IS NOT NULL AND ${idCol}=$1`, [id],
    )).rows[0]?.n ?? 0);
  const consCountOf = async (idempotencyKey: string) =>
    Number((await pool.query(
      'SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [PA, idempotencyKey],
    )).rows[0]?.n ?? 0);
  // bracket write on index signature(uc025 先例形·零 naming-convention warning——header 键名系
  // HTTP 线协议字面 resume-id/target-role,非 camelCase 域·字面量展开会触 naming 规则)。
  const beginQuiz = (quizId: string, resumeId: string, targetRole?: string) => {
    const headers: Record<string, string> = { ...h.U(PA) };
    headers['resume-id'] = resumeId;
    if (targetRole !== undefined) headers['target-role'] = targetRole;
    return h.post(`/quiz/${quizId}/begin`, headers, {});
  };
  const beginDiagnosis = (dgId: string, resumeId: string, targetRole?: string) => {
    const headers: Record<string, string> = { ...h.U(PA) };
    headers['resume-id'] = resumeId;
    if (targetRole !== undefined) headers['target-role'] = targetRole;
    return h.post(`/diagnosis/${dgId}/begin`, headers, {});
  };
  const createQuiz = async () => h.post('/quiz', h.U(PA), {});
  const createDiagnosis = async () => h.post('/diagnosis', h.U(PA), {});

  // ── PC: 双口 happy create+begin(带 target-role)202 对照基面(批 C PC 同形) ──
  {
    const cq = await createQuiz();
    const cd = await createDiagnosis();
    A('PC', 'quiz create 200 status=created', cq.status === 200 && cq.body?.status === 'created');
    A('PC', 'diagnosis create 200 status=created', cd.status === 200 && cd.body?.status === 'created');
    const bq = await beginQuiz(String(cq.body?.quizId), String(resA1.resumeId), `pcq-${S}`);
    const bd = await beginDiagnosis(String(cd.body?.diagnosisId), String(resA1.resumeId), `pcd-${S}`);
    A('PC', 'quiz begin(带 target-role) 202 accepted+jobId', bq.status === 202 && bq.body?.accepted === true && typeof bq.body?.jobId === 'string');
    A('PC', 'diagnosis begin(带 target-role) 202 accepted+jobId', bd.status === 202 && bd.body?.accepted === true && typeof bd.body?.jobId === 'string');
    const led = await ledgerOf();
    A('PC', 'PC side-effect ledger: exactly -2.0 total(双口各预留 1.0)',
      Math.abs(led.available - (ledgerA0.available - 2.0)) < 1e-9 && led.consumptionRows === 2);
  }

  // ── S1: 种子 'ready' 终态壳 begin 复活拒面(双口·CAS status 谓词正中) ──
  {
    const qz = `qz_nhp016adv_s1_${S}`;
    const dg = `dg_nhp016adv_s1_${S}`;
    // 豁免④(§5 枚举具名·批 C N7 seedQuiz/seedDiagnosis 先例形): 'ready' 终态壳(resume_id NULL·epoch NULL·零 job)。
    await pool.query(
      `INSERT INTO resume_quiz(id, owner_user_id, status, resume_id, privacy_epoch) VALUES ($1,$2,'ready',NULL,NULL)`, [qz, PA]);
    await pool.query(
      `INSERT INTO resume_diagnosis(id, owner_user_id, status, resume_id, privacy_epoch) VALUES ($1,$2,'ready',NULL,NULL)`, [dg, PA]);
    const vQ0 = Number((await pool.query('SELECT version FROM resume_quiz WHERE id=$1', [qz])).rows[0]?.version ?? -1);
    const vD0 = Number((await pool.query('SELECT version FROM resume_diagnosis WHERE id=$1', [dg])).rows[0]?.version ?? -1);
    const before = await ledgerOf();
    // 终态壳 begin: 行在场(:39 过)·零 job(幂等不短路)·resume 查过(:45-49)→ CAS status='created' 0 行(:51-57)。
    const bq = await beginQuiz(qz, String(resA1.resumeId));
    const bd = await beginDiagnosis(dg, String(resA1.resumeId));
    A('S1', 'quiz begin ready-terminal shell → 409 quiz_resume_reference_conflict', bq.status === 409 && bq.body?.error === 'quiz_resume_reference_conflict');
    A('S1', 'diagnosis begin ready-terminal shell → 409 diagnosis_resume_reference_conflict', bd.status === 409 && bd.body?.error === 'diagnosis_resume_reference_conflict');
    const rowQ = await pool.query('SELECT status, resume_id::text AS rid, version FROM resume_quiz WHERE id=$1', [qz]);
    const rowD = await pool.query('SELECT status, resume_id::text AS rid, version FROM resume_diagnosis WHERE id=$1', [dg]);
    A('S1', 'quiz shell bytes zero-delta(status 仍 ready·resume_id 仍 NULL·CAS 拒写)',
      String(rowQ.rows[0]?.status) === 'ready' && rowQ.rows[0]?.rid === null);
    A('S1', 'diagnosis shell bytes zero-delta(status 仍 ready·resume_id 仍 NULL·CAS 拒写)',
      String(rowD.rows[0]?.status) === 'ready' && rowD.rows[0]?.rid === null);
    A('S1', 'shell version zero-delta 双口(version 零动·CAS 0 行不写)',
      Number(rowQ.rows[0]?.version) === vQ0 && Number(rowD.rows[0]?.version) === vD0);
    A('S1', 'S1 zero job rows 双口(零复活零 enqueue)',
      (await jobCount('quiz_job', 'quiz_id', qz)) === 0 && (await jobCount('diagnosis_job', 'diagnosis_id', dg)) === 0);
    const after = await ledgerOf();
    A('S1', 'S1 zero-side-effect ledger(net 0·零扣零误退)',
      after.available === before.available && after.consumptionRows === before.consumptionRows);
  }

  // ── S2: abandon(released:"error")→ re-begin 死壳复活拒面(双口·status≠'created' 谓词触发) ──
  {
    // bare 'created' 壳走产品路径 create(比 §5 豁免枚举更严·非裸 INSERT·如实申明)。
    const cq = await createQuiz();
    const cd = await createDiagnosis();
    const qz = String(cq.body?.quizId);
    const dg = String(cd.body?.diagnosisId);
    const a1q = await h.post(`/quiz/${qz}/abandon`, h.U(PA), {});
    const a1d = await h.post(`/diagnosis/${dg}/abandon`, h.U(PA), {});
    A('S2', 'quiz bare-shell abandon → 200 abandoned released="error"(零预留无 consumption 行如实返回·批 C N7c 先例形)',
      a1q.status === 200 && a1q.body?.abandoned === true && a1q.body?.released === 'error');
    A('S2', 'diagnosis bare-shell abandon → 200 abandoned released="error"',
      a1d.status === 200 && a1d.body?.abandoned === true && a1d.body?.released === 'error');
    // re-begin: 行在场(failed 亦是行)·零 job(幂等不短路)·resume 查过(owned∧ingested)→ CAS status='created' 0 行。
    const bq = await beginQuiz(qz, String(resA1.resumeId));
    const bd = await beginDiagnosis(dg, String(resA1.resumeId));
    A('S2', 'quiz re-begin abandoned dead shell → 409 quiz_resume_reference_conflict', bq.status === 409 && bq.body?.error === 'quiz_resume_reference_conflict');
    A('S2', 'diagnosis re-begin abandoned dead shell → 409 diagnosis_resume_reference_conflict', bd.status === 409 && bd.body?.error === 'diagnosis_resume_reference_conflict');
    const rowQ = await pool.query('SELECT status, resume_id::text AS rid FROM resume_quiz WHERE id=$1', [qz]);
    const rowD = await pool.query('SELECT status, resume_id::text AS rid FROM resume_diagnosis WHERE id=$1', [dg]);
    A('S2', 'quiz dead shell bytes zero-delta(status 仍 failed·resume_id 仍 NULL)',
      String(rowQ.rows[0]?.status) === 'failed' && rowQ.rows[0]?.rid === null);
    A('S2', 'diagnosis dead shell bytes zero-delta(status 仍 failed·resume_id 仍 NULL)',
      String(rowD.rows[0]?.status) === 'failed' && rowD.rows[0]?.rid === null);
    A('S2', 'S2 zero job rows 双口(re-begin 零复活零 enqueue)',
      (await jobCount('quiz_job', 'quiz_id', qz)) === 0 && (await jobCount('diagnosis_job', 'diagnosis_id', dg)) === 0);
    const led = await ledgerOf();
    A('S2', 'S2 zero-side-effect ledger(net 0·abandon 零预留零误退·re-begin 拒面零扣)',
      led.available === ledgerA0.available - 2.0 && led.consumptionRows === 2);
  }

  // ── S3: 幂等载荷置换拒面(双口·early-return 先于 resume 查/CAS/enqueue) ──
  {
    const cq = await createQuiz();
    const cd = await createDiagnosis();
    const qz = String(cq.body?.quizId);
    const dg = String(cd.body?.diagnosisId);
    const before = await ledgerOf();
    const b1q = await beginQuiz(qz, String(resA1.resumeId), 'X');
    const b1d = await beginDiagnosis(dg, String(resA1.resumeId), 'X');
    A('S3', 'quiz begin#1(R1,"X") → 202 accepted+jobId', b1q.status === 202 && b1q.body?.accepted === true && typeof b1q.body?.jobId === 'string');
    A('S3', 'diagnosis begin#1(R1,"X") → 202 accepted+jobId', b1d.status === 202 && b1d.body?.accepted === true && typeof b1d.body?.jobId === 'string');
    // begin#2 换 resume-id(R2)+换 role("Y"): 幂等 early-return(:41-42)先于一切持久面——置换全不达。
    const b2q = await beginQuiz(qz, String(resA2.resumeId), 'Y');
    const b2d = await beginDiagnosis(dg, String(resA2.resumeId), 'Y');
    A('S3', 'quiz begin#2(R2,"Y") → 202 alreadyBegun 同 jobId', b2q.status === 202 && b2q.body?.alreadyBegun === true && b2q.body?.jobId === b1q.body?.jobId);
    A('S3', 'diagnosis begin#2(R2,"Y") → 202 alreadyBegun 同 jobId', b2d.status === 202 && b2d.body?.alreadyBegun === true && b2d.body?.jobId === b1d.body?.jobId);
    const jQ = await pool.query(
      "SELECT resume_id::text AS rid, payload->>'targetRole' AS role, (SELECT count(*)::int FROM jsonb_object_keys(payload)) AS key_count FROM quiz_job WHERE owner_user_id=$1 AND quiz_id=$2", [PA, qz]);
    const jD = await pool.query('SELECT resume_id::text AS rid FROM diagnosis_job WHERE owner_user_id=$1 AND diagnosis_id=$2', [PA, dg]);
    // attempt1 红次修正(批 C/X33「期望按真实钉死」同形): jsonb::text 冒号后带空格,字节串比较按想象码面
    // 误红——改结构化钉死: 恰单键 targetRole='X'+键数=1(条件键原字节语义·强于串比较非谓词迁就)。
    A('S3', 'quiz_job pin: resume_id=R1+payload 恰单键 targetRole="X" 键数=1(条件键原字节·置换载荷零达持久面)',
      jQ.rowCount === 1 && String(jQ.rows[0]?.rid) === String(resA1.resumeId)
      && String(jQ.rows[0]?.role) === 'X' && Number(jQ.rows[0]?.key_count) === 1);
    const dRow = await pool.query('SELECT resume_id::text AS rid, target_role FROM resume_diagnosis WHERE id=$1', [dg]);
    A('S3', 'diagnosis pin: job resume_id=R1+target_role 列恰 "X"(列持久原值·置换零达)',
      jD.rowCount === 1 && String(jD.rows[0]?.rid) === String(resA1.resumeId)
      && String(dRow.rows[0]?.rid) === String(resA1.resumeId) && String(dRow.rows[0]?.target_role) === 'X');
    A('S3', '各口恰 1 consumption 行(置换零二次预留)',
      (await consCountOf(qz)) === 1 && (await consCountOf(dg)) === 1);
    const after = await ledgerOf();
    A('S3', 'S3 ledger: exactly -2.0 total(双口各 −1.0·begin#2 幂等零扣)',
      Math.abs(after.available - (before.available - 2.0)) < 1e-9 && after.consumptionRows === before.consumptionRows + 2);
  }

  // ── S4: 自弃终态二次 abandon 拒面(双口·态源=自弃 failed≠N7a worker ready·如实申明) ──
  {
    const cq = await createQuiz();
    const cd = await createDiagnosis();
    const qz = String(cq.body?.quizId);
    const dg = String(cd.body?.diagnosisId);
    const before = await ledgerOf();
    const a1q = await h.post(`/quiz/${qz}/abandon`, h.U(PA), {});
    const a1d = await h.post(`/diagnosis/${dg}/abandon`, h.U(PA), {});
    A('S4', 'quiz first abandon → 200 abandoned released="error"(bare 壳零预留)',
      a1q.status === 200 && a1q.body?.abandoned === true && a1q.body?.released === 'error');
    A('S4', 'diagnosis first abandon → 200 abandoned released="error"',
      a1d.status === 200 && a1d.body?.abandoned === true && a1d.body?.released === 'error');
    // 再 abandon: CAS status IN ('created','generating') 0 行(status 已 'failed')→ 409 cannot_abandon。
    const a2q = await h.post(`/quiz/${qz}/abandon`, h.U(PA), {});
    const a2d = await h.post(`/diagnosis/${dg}/abandon`, h.U(PA), {});
    A('S4', 'quiz second abandon self-failed terminal → 409 cannot_abandon', a2q.status === 409 && a2q.body?.error === 'cannot_abandon');
    A('S4', 'diagnosis second abandon self-failed terminal → 409 cannot_abandon', a2d.status === 409 && a2d.body?.error === 'cannot_abandon');
    const rowQ = await pool.query('SELECT status FROM resume_quiz WHERE id=$1', [qz]);
    const rowD = await pool.query('SELECT status FROM resume_diagnosis WHERE id=$1', [dg]);
    A('S4', 'S4 terminal not regressed 双口(status 仍 failed·二次零误退)',
      String(rowQ.rows[0]?.status) === 'failed' && String(rowD.rows[0]?.status) === 'failed');
    const after = await ledgerOf();
    A('S4', 'S4 zero-side-effect ledger(net 0·零预留零误退零双退)',
      after.available === before.available && after.consumptionRows === before.consumptionRows);
  }

  // ── A1: list 对抗值域 fuzz(双口·钳制表达式 Number(limit)||50 + max(·,1) + min(·,200)) ──
  {
    // 产品路径种 201 壳/口(非豁免面·如实申明)。PA 全 port 总行数=201+此前各臂壳>200(顶钳行使前提)。
    for (let i = 0; i < 201; i += 1) {
      const cq = await createQuiz();
      const cd = await createDiagnosis();
      if (cq.status !== 200 || cd.status !== 200) { console.log(`SEED_FAIL A1 shell i=${i} q=${cq.status} d=${cd.status}`); }
    }
    const cntQ = Number((await pool.query('SELECT count(*)::int AS n FROM resume_quiz WHERE owner_user_id=$1', [PA])).rows[0]?.n ?? 0);
    const cntD = Number((await pool.query('SELECT count(*)::int AS n FROM resume_diagnosis WHERE owner_user_id=$1', [PA])).rows[0]?.n ?? 0);
    A('A1', 'A1 seeds: 201 shells/port product-path created(quiz/diagnosis)', cntQ >= 201 && cntD >= 201);
    const listQuiz = async (qs?: string) => h.req('GET', `/quiz${qs ?? ''}`, h.U(PA));
    const listDiagnosis = async (qs?: string) => h.req('GET', `/diagnosis${qs ?? ''}`, h.U(PA));
    const qCount = (r: { status: number; body?: { quizzes?: unknown[] } }) =>
      r.status === 200 && Array.isArray(r.body?.quizzes) ? r.body.quizzes.length : -1;
    const dCount = (r: { status: number; body?: { diagnoses?: unknown[] } }) =>
      r.status === 200 && Array.isArray(r.body?.diagnoses) ? r.body.diagnoses.length : -1;
    const rQm1 = await listQuiz('?limit=-1');
    const rDm1 = await listDiagnosis('?limit=-1');
    A('A1', "quiz limit='-1' → 恰 1 行(底钳 max(·,1) 行使)", qCount(rQm1) === 1);
    A('A1', "diagnosis limit='-1' → 恰 1 行(底钳行使)", dCount(rDm1) === 1);
    const rQ0 = await listQuiz('?limit=0');
    const rD0 = await listDiagnosis('?limit=0');
    A('A1', "quiz limit='0' → 恰 50 行(Number('0')=0 falsy→50·按码钉)", qCount(rQ0) === 50);
    A('A1', "diagnosis limit='0' → 恰 50 行(falsy 归一)", dCount(rD0) === 50);
    const rQabc = await listQuiz('?limit=abc');
    const rDabc = await listDiagnosis('?limit=abc');
    A('A1', "quiz limit='abc' → 恰 50 行(NaN→50)", qCount(rQabc) === 50);
    A('A1', "diagnosis limit='abc' → 恰 50 行(NaN→50)", dCount(rDabc) === 50);
    const rQbig = await listQuiz('?limit=1e9');
    const rDbig = await listDiagnosis('?limit=1e9');
    A('A1', "quiz limit='1e9' → 恰 200 行(顶钳 min(·,200) 行使·总行>200)", qCount(rQbig) === 200);
    A('A1', "diagnosis limit='1e9' → 恰 200 行(顶钳行使)", dCount(rDbig) === 200);
    const rQdef = await listQuiz('');
    const rDdef = await listDiagnosis('');
    A('A1', 'quiz 缺省 limit → 恰 50 行', qCount(rQdef) === 50);
    A('A1', 'diagnosis 缺省 limit → 恰 50 行', dCount(rDdef) === 50);
    // 非空对抗 status token(参数化 $1 行使·注入不达 SQL 文面): token 非空——空串 falsy 旁路过滤返全量
    // (quiz.service.ts:101/diagnosis.service.ts:88 truthy 语义·防假红)。
    const TOK = "ready' OR '1'='1";
    const rQtok = await listQuiz(`?status=${encodeURIComponent(TOK)}`);
    const rDtok = await listDiagnosis(`?status=${encodeURIComponent(TOK)}`);
    A('A1', 'quiz status=<非空对抗 token> → 200 零行(零 500·参数化行使)', rQtok.status === 200 && qCount(rQtok) === 0);
    A('A1', 'diagnosis status=<非空对抗 token> → 200 零行(零 500·参数化行使)', rDtok.status === 200 && dCount(rDtok) === 0);
    const rQafter = await listQuiz('');
    const rDafter = await listDiagnosis('');
    A('A1', 'quiz 表完好(token 后缺省 list 仍 200 恰 50 行·零注入残留)', qCount(rQafter) === 50);
    A('A1', 'diagnosis 表完好(token 后缺省 list 仍 200 恰 50 行)', dCount(rDafter) === 50);
    const led = await ledgerOf();
    A('A1', 'A1 zero-side-effect ledger(net 0·list 只读零扣)', led.available === ledgerA0.available - 4.0 && led.consumptionRows === 4);
  }

  // ── A2: diagnosis target_role 列对抗持久面 + quiz 口 payload 条件键对照 ──
  {
    const cd1 = await createDiagnosis();
    const d1 = String(cd1.body?.diagnosisId);
    const ROLE250 = 'abcdefghij'.repeat(25); // 250 字(无首尾空白)
    const ROLE100 = 'abcdefghij'.repeat(10); // 归一化后恰前 100 字
    const b1 = await beginDiagnosis(d1, String(resA1.resumeId), ROLE250);
    A('A2', 'diagnosis begin target-role=250 字 → 202 accepted', b1.status === 202 && b1.body?.accepted === true);
    const col1 = await pool.query('SELECT target_role FROM resume_diagnosis WHERE id=$1', [d1]);
    A('A2', 'diagnosis target_role 列恰 100 字(trim().slice(0,100) 真持久·250→100)', String(col1.rows[0]?.target_role ?? '') === ROLE100);
    // 两次 begin 不同壳(否则幂等短路): D2 空白 role。
    const cd2 = await createDiagnosis();
    const d2 = String(cd2.body?.diagnosisId);
    const b2 = await beginDiagnosis(d2, String(resA1.resumeId), '   ');
    A('A2', 'diagnosis begin target-role=纯空白(不同壳) → 202 accepted', b2.status === 202 && b2.body?.accepted === true);
    const col2 = await pool.query('SELECT target_role FROM resume_diagnosis WHERE id=$1', [d2]);
    A('A2', 'diagnosis target_role 列 NULL(||undefined→?? null 链·真 PG 持久面)', col2.rows[0]?.target_role === null);
    // quiz 口对照: payload 条件键空白→'{}' 现状字节(a56a0da4:22 亲证形·真 PG 持久面行使)。
    const cq1 = await createQuiz();
    const q1 = String(cq1.body?.quizId);
    const b3 = await beginQuiz(q1, String(resA1.resumeId), '   ');
    A('A2', 'quiz begin target-role=纯空白 → 202 accepted(对照臂)', b3.status === 202 && b3.body?.accepted === true);
    const j1 = await pool.query('SELECT payload::text AS payload FROM quiz_job WHERE owner_user_id=$1 AND quiz_id=$2', [PA, q1]);
    A('A2', 'quiz_job payload 恰 {}(条件键空白→现状字节·零键写入)', j1.rowCount === 1 && String(j1.rows[0]?.payload) === '{}');
    const led = await ledgerOf();
    A('A2', 'A2 ledger: exactly -3.0 total(诊断 250 字/诊断空白/quiz 空白对照各 −1.0)',
      Math.abs(led.available - (ledgerA0.available - 7.0)) < 1e-9 && led.consumptionRows === 7);
  }

  // ── N: 全程净账终审计(合账 −7.0/consumption 7 行·批 C NEG 枚举式正确形) ──
  {
    const fin = await ledgerOf();
    // 枚举: PC(−2.0)+S3(−2.0)+A2(−3.0)=−7.0·S1/S2/S4/A1 全零(逐臂已断)。
    A('N', '全程净账审计: available = 12.0−7.0 = 5.0(合账 −7.0·恰等专桶预算)',
      Math.abs(fin.available - 5.0) < 1e-9);
    A('N', 'consumption 恰 7 行(PC 2+S3 2+A2 3)·全 reserved 零 released(零误退零双退)',
      fin.consumptionRows === 7 && fin.consumptionReleased === 0);
    const buckets = await pool.query(
      `SELECT (units_total - units_reserved - units_consumed)::float8 AS avail, expires_at
         FROM entitlement_bucket WHERE owner_user_id=$1 ORDER BY expires_at ASC`, [PA]);
    // r2 席2 P3 行为级 FIFO-first 证面: 专桶(300d·FIFO 首位)耗尽 0·decoy(400d·后位)原封 5.0。
    A('N', 'FIFO-first 行使证面: 专桶 avail=0(耗尽)+decoy avail=5.0(原封未抽·ORDER BY expires_at ASC 行使)',
      Math.abs(Number(buckets.rows[0]?.avail ?? -1)) < 1e-9 && Math.abs(Number(buckets.rows[1]?.avail ?? -1) - 5.0) < 1e-9);
  }

  const attemptEndedAt = new Date().toISOString();
  const exit = failures.length === 0 ? 0 : 1;
  console.log('');
  console.log(`ATTEMPT_END  iso=${attemptEndedAt} EXIT=${exit} total=${total} fail=${failures.length}`);
  if (failures.length) {
    console.log(`GAP  ${CASE_ID}  ${failures.length} assertion(s) failed:`);
    for (const f of failures) console.log(`GAP_DETAIL  [${f.cls}] ${f.name}`);
  } else {
    console.log(`PASS  ${CASE_ID}  isolated PG+HTTP ADV evidence for quiz/diagnosis 双口同主体对抗六臂族 (PC+S1–S4+A1+A2)`);
    console.log('HTTP_ERROR_PIN  409 *_resume_reference_conflict(S1 终态壳/S2 死壳 re-begin) · 409 cannot_abandon(S4 自弃二次) · 202 alreadyBegun 同 jobId(S3 置换) · list limit -1/0/abc/1e9→1/50/50/200 · status token 200 零行 · target_role 250→100/空白→NULL · payload 条件键 {}');
    console.log('EVIDENCE_SHAPE  isolated three-layer shell + real HTTP + real PG(consent/resume 走产品路径 · 豁免①专桶+decoy 桶种子+④S1 ready 壳种子具名) · r2 席2 P3 桶种子 units_total≥7.0 SEED 断言+FIFO-first 行使证面 · 与批 C NEG/quiz-list/role-input/uc018/X33 互不替代');
  }
  console.log('ROW_STILL_BLIND  UC-E2E-016/029 ADV 列 blind 保持+case-only 措辞(NHP-016-ADV-01). coveredCount=8.');
  console.log('NOTE  EXIT0≠covered≠nail≠HA · Ban self-nail · post dual still required · actualSpendCny=null');
  console.log(`\nCMD=${CMD} EXIT=${exit}`);
  process.exit(exit);
})().catch((e) => {
  console.error(e);
  console.log(`\nGAP  ${CASE_ID}  harness/runtime failure: ${e?.message ?? e}`);
  console.log(`ATTEMPT_END  iso=${new Date().toISOString()} EXIT=1 (crash)`);
  console.log(`\nCMD=${CMD} EXIT=1`);
  process.exit(1);
});
