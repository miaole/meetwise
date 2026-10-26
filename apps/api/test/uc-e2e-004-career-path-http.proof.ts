/**
 * UC-E2E-004 — career-path 全链路隔离 e2e HTTP prove（主路径 9 臂 + 失败降级 6 臂 · 十五断言臂）
 *
 * REQUEST：ai-docs/delivery/harness/uc004-e2e-REQUEST.md §1.1（@1c5a02600 · pre-exec 双审 rev 后
 * 协调方授权 EXEC 落码）。零模型边界：derive 纯本地（@meetwise/domain deriveCareerPath 纯函数），
 * 全程零 MODEL_API_KEY、零 live 模型端点、零 ai_invocation_trace 写（arm 9 观察面）。
 *
 * 主路径（userA · MAIN 线程）：
 *   arm 1  POST 前 GET → 404 not_found（interview-assessment.ts:94-104 无行抛点 :102 · 行号随手续勘）
 *   arm 2  POST → 200 契约原形 {readiness,level,milestones} ∧ level='mid'（overall=60 纯分数阶梯
 *          career.ts:51-57 阶梯单源/:178-190 · validate.ts:632 先例；milestones 非空数组）
 *   arm 3  ai_graph_run(career-path,MAIN) 恰一行 succeeded ∧ version>=2 ∧ lease_owner IS NULL
 *          （commitSuccess 同事务 active→succeeded interview.service.ts:877-881）
 *   arm 4  career_path 表（owner+interview 维度）恰一行（读真相）
 *   arm 5  GET → 200 同字段（GET 重闸放行 requireCurrentScorableCards interview-assessment.ts:99/:36-39）
 *   arm 6  越权负前置（内嵌主路径叙事·非 NEG 列收据）：userB GET → 404 not_found_or_forbidden
 *          （guard 面 interview.service.ts:67-69 · validate.ts:634 口径升 e2e）
 *   arm 7  409 负前置（内嵌主路径叙事·非 NEG 列收据）：无评估线程 → 409 assessment_required
 *          （interview.service.ts:832）；overall=NULL 线程 → 409 insufficient_evidence
 *          （scoring-honesty.ts:145-147 → 映射 interview.service.ts:838-839）；两 409 线程
 *          ai_graph_run(career-path,该线程) 恰 0 行（评估前置抛点先于 begin :829-843 零写）
 *   arm 8  A1：GET /profile/growth → 200 ∧ body.dimensions.length>=2（deriveGrowth 维度并集
 *          growth.ts:53 dimSet ∪ :86 返回单源；种子 dims2 逐项含数值 score :57 Number.isFinite 收口；
 *          沿 fault prove dims2 形 :212-215）
 *   arm 9  零模型边界：ai_invocation_trace 全表行数 before/after 净变 0（观察面）
 *
 * 失败降级（seam 线程 · MEETWISE_CAREER_PATH_FAIL_THREAD_ID 精确等值 scoping
 * career-path.ts:47-52 / interview.service.ts:52-55 · 同 fault prove :230-232 先例）——
 * 断言集沿 uc-e2e-004-career-path-fault.proof.ts:38-41 七项口径（行号随手续勘：REQUEST §0.3
 * 旧引 :44-46 实为 :38-41）：
 *   arm 10 POST → 500 internal_error 统一信封（实测为准 all-exceptions.filter.ts:39）
 *   arm 11 ai_graph_run(career-path,FAULT) 恰一行 failed ∧ version>=2
 *   arm 12 GET /interview/FAULT/career-path → 404 not_found（interview-assessment.ts:102 · 无失败产物）
 *   arm 13 额度账本（entitlement_bucket/entitlement_consumption/payment_order 三表 before/after
 *          逐行快照）净变 0（career-path 不计费 D1，净变 0 是观察结果非假设；快照时点钉种子后）
 *   arm 14 in-fault 重试：再失败 + run 行 version 递增 + career_path 仍 0 行 + 账本仍净变 0
 *   arm 15 server alive 钉复打主路径线程形：失败臂后 POST /interview/MAIN/career-path → 200 ∧
 *          主线程 run 行仍恰一行 succeeded（begin 复用/接管同 run 行 · version 单调递增；
 *          Ban 健康 ping 顶替）
 *
 * boot 形沿 _neg-harness boot()（真 NestJS 栈 + assertIsolatedTestTarget 隔离 attestation +
 * 删 MODEL_API_KEY/MODEL_BASE_URL）；SCOR 聚合函数在 boot 影子环境缺失 → 窄复刻函数体逐字同
 * 0161 收窄后（practice_eligible 单态 · :33），沿 neg-interview.proof.ts:210-235 先例；种子
 * score_card 满足 aggregateInterviewScores 资格谓词（status='practice_eligible' ∧
 * deterministic_total 数值非空 · 0100_scoring_fact_root.sql:172）。
 *
 * EXIT 契约：全臂 PASS → EXIT 0；任一 FAIL → EXIT 1 如实记录（Ban retry-to-green · Ban 改断言
 * 迁就实测 · Ban 把 EXIT1 记成 flake）。本绿 ≠ covered ≠ A3 closed ≠ 矩阵任何列翻面（翻转只走
 * covered 评估器 + 协调方 nail）。与静态诚实钉 uc004:career-path:prove（EXIT=1 预期绊线）和
 * 运行时故障钉 uc004:career-path-fault:prove 互不替代、口径零触。
 * releaseEvidence=false · Not HA
 *
 *   pnpm uc004:career-path:http:prove
 *   pnpm -C apps/api prove:uc004-career-path-http   (raw; 经 run-e2e-isolated 借壳形)
 */
import { boot, mkAssert } from './_neg-harness';

// FI-3 同款 thread-scoped fail-only seam 键（值 = FAULT 线程 id 精确等值；进程 env 预设，
// 同一进程内非匹配线程零影响——selectCareerPathDerive 精确等值，career-path.ts:47-52）。
const SEAM_ENV_KEY = 'MEETWISE_CAREER_PATH_FAIL_THREAD_ID';
const STAMP = Date.now().toString(36).toUpperCase();
const MAIN = `UC4HTTP_MAIN_${STAMP}`;
const FAULT = `UC4HTTP_FAULT_${STAMP}`;
const NOASMT = `UC4HTTP_NOASMT_${STAMP}`;
const NULLOVR = `UC4HTTP_NULLOVR_${STAMP}`;
process.env[SEAM_ENV_KEY] = FAULT;

const h = await boot();
const { A, done } = mkAssert('uc004:career-path:http');
const U_A = h.U('userA');
const U_B = h.U('userB');

console.log('UC-E2E-004 career-path isolated HTTP prove · releaseEvidence=false · Not HA');
console.log('NOTE: EXIT=0 ≠ UC-E2E-004 covered ≠ A3 closed ≠ 矩阵翻面 · 全臂十五组断言 · Ban retry-to-green');
console.log(`NOTE: seam ${SEAM_ENV_KEY}=${FAULT} 精确等值 scoping · MAIN/NOASMT/NULLOVR 线程零影响`);

// ── boot 影子环境补钉（沿 uc-e2e-002-cross-device-http.proof.ts:36-63 + neg-interview.proof.ts:210-235 先例）──
// 隐私围栏最小镜像（boot() 已装同形镜像；此处重装并钉 GRANT 面——0058 fence 未入影子环境，
// 仅 owner-match 语义，与产品读分层行为面一致）。
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

// SCOR 聚合窄复刻（影子 sql/ 族无 SCOR 面）：函数体逐字同 0161 收窄后单态口径
//（0161_practice_only_read_narrowing.sql:33 亲证），表为窄列复刻（0100 FK 链不入影子环境）。
await h.pool.query(`
CREATE TABLE IF NOT EXISTS question_rubric (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id text NOT NULL,
  competency text NOT NULL
);
CREATE TABLE IF NOT EXISTS score_card (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  rubric_id uuid NOT NULL REFERENCES question_rubric(id),
  deterministic_total numeric NOT NULL DEFAULT 0,
  coverage numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'practice_eligible'
);
CREATE OR REPLACE FUNCTION scoring_aggregate_interview_scores(p_interview_id text)
RETURNS TABLE (eligible_card_count bigint, deterministic_overall numeric, non_scoring_card_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $fn$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_interview_id IS NULL OR length(p_interview_id)=0 THEN
    RAISE EXCEPTION 'scoring_aggregate_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT count(*) FILTER (WHERE c.status = 'practice_eligible')::bigint AS eligible_card_count,
           CASE WHEN count(*) FILTER (WHERE c.status = 'practice_eligible') = 0
                THEN NULL::numeric
                ELSE round(avg(c.deterministic_total) FILTER (WHERE c.status = 'practice_eligible'))
           END AS deterministic_overall,
           count(*) FILTER (WHERE c.status <> 'practice_eligible')::bigint AS non_scoring_card_count
    FROM score_card c
    WHERE c.owner_user_id = principal AND c.interview_id = p_interview_id
      AND c.status NOT IN ('superseded','fenced');
END $fn$;
GRANT EXECUTE ON FUNCTION scoring_aggregate_interview_scores(text) TO app_role;
`);

// ── 种子（superuser 直插 + set_config GUC，同 fault prove :204-226 口径）──
// dims2 形沿 fault prove :212-215：逐项必含数值 score（deriveGrowth 仅收 Number.isFinite 项 growth.ts:57）。
{
  const dims2 = JSON.stringify([
    { dimension: '分布式锁', score: 40, gap: true, evidence: [] },
    { dimension: '消息队列', score: 35, gap: true, evidence: [] },
  ]);
  const c = await h.pool.connect();
  try {
    await c.query(`SELECT set_config('app.principal_user','userA',false)`);
    for (const iv of [MAIN, FAULT, NOASMT, NULLOVR]) {
      await c.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','completed') ON CONFLICT DO NOTHING`, [iv]);
    }
    // MAIN/FAULT：可信任 overall=60（career.ts 纯分数阶梯 ≥50→mid）；NULLOVR：ready 但 overall=NULL
    //（requireTrustedPracticeOverall 对 NULL fail insufficient_evidence · scoring-honesty.ts:145-147）；
    // NOASMT：零 assessment_report 行（409 assessment_required · interview.service.ts:832）。
    for (const iv of [MAIN, FAULT, NULLOVR]) {
      await c.query(
        `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions,overall)
         VALUES ($1,'userA',$2,'ready',$3::jsonb,$4) ON CONFLICT DO NOTHING`,
        [`AR_${iv}`, iv, dims2, iv === NULLOVR ? null : 60]);
    }
    // GET 重闸资格种子：score_card practice_eligible 单态 ∧ deterministic_total 数值非空
    //（0161:33 单态谓词 + 0100:172 数值列）——仅 MAIN 需要（arm 5 GET 200 重闸放行）。
    await c.query(`INSERT INTO question_rubric(id, question_id, competency)
      VALUES ('00000000-0000-4000-8000-00000000c404','q-uc4-main','分布式锁') ON CONFLICT (id) DO NOTHING`);
    await c.query(
      `INSERT INTO score_card(owner_user_id,interview_id,question_id,rubric_id,deterministic_total,coverage,status)
       VALUES ('userA',$1,'q-uc4-main','00000000-0000-4000-8000-00000000c404',60,1,'practice_eligible')`,
      [MAIN]);
    // 额度桶种子（REQUEST §1.1 种子清单 · 影子环境 boot() 已有 userA paid 桶时为零操作）。
    await c.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
      SELECT 'userA','paid',5.0, now()+interval '300 days' WHERE NOT EXISTS
      (SELECT 1 FROM entitlement_bucket WHERE owner_user_id='userA' AND kind='paid')`);
    await c.query(`SELECT set_config('app.principal_user','',false)`);
  } finally { c.release(); }
}

// ── 观察面 helpers（快照/计数同 fault prove :78-89/:101-107/:109-112 口径）──
async function careerGraphRuns(threadId: string): Promise<Array<{ status: string; version: number; leaseOwner: string | null }>> {
  const r = await h.pool.query(
    `SELECT status, version, lease_owner FROM ai_graph_run
      WHERE graph_name='career-path' AND thread_id=$1 ORDER BY version`, [threadId]);
  return r.rows.map((x) => ({ status: String(x.status), version: Number(x.version), leaseOwner: x.lease_owner ?? null }));
}

async function careerRowCount(interviewId: string): Promise<number> {
  const r = await h.pool.query('SELECT count(*)::int AS n FROM career_path WHERE owner_user_id=$1 AND interview_id=$2', ['userA', interviewId]);
  return r.rows[0]!.n;
}

async function traceRowCount(): Promise<number> {
  const r = await h.pool.query('SELECT count(*)::int AS n FROM ai_invocation_trace');
  return r.rows[0]!.n;
}

async function ledgerSnapshot(): Promise<string> {
  const q = async (sql: string) => (await h.pool.query(sql)).rows;
  const [bucket, consumption, orders] = await Promise.all([
    q(`SELECT id::text, owner_user_id, kind, units_total::text, units_reserved::text,
              units_consumed::text, source_order_id, expires_at::text
         FROM entitlement_bucket ORDER BY id`),
    q('SELECT * FROM entitlement_consumption ORDER BY 1'),
    q(`SELECT id, owner_user_id, product_id, amount_cents::text, units::text, status
         FROM payment_order ORDER BY id`),
  ]);
  return JSON.stringify({ bucket, consumption, orders });
}

// 快照时点钉种子后（种子含 entitlement_bucket 条件插入；此点后账本只允许零净变）。
const ledgerAtStart = await ledgerSnapshot();
const traceRowsAtStart = await traceRowCount();

// ═══════════ 主路径（arm 1-9 · MAIN 线程）═══════════

// arm 1 · POST 前 GET → 404 not_found（getCareerPathFor 无行抛点 interview-assessment.ts:102）
{
  const preGet = await h.req('GET', `/interview/${MAIN}/career-path`, U_A);
  A('ARM1-MAIN-PRE-GET-404-NOT_FOUND', preGet.status === 404 && preGet.body?.error === 'not_found');
}

// arm 2 · POST → 200 契约原形 {readiness,level,milestones} ∧ level='mid'（overall=60 → mid）
const mainPost1 = await h.post(`/interview/${MAIN}/career-path`, U_A, {});
{
  const body = mainPost1.body;
  const keys = body && typeof body === 'object' ? Object.keys(body).sort().join(',') : '';
  A('ARM2-MAIN-POST-200-LEVEL-MID-CONTRACT',
    mainPost1.status === 200
    && keys === 'level,milestones,readiness'
    && body?.level === 'mid'
    && typeof body?.readiness === 'string' && body.readiness.length > 0
    && Array.isArray(body?.milestones) && body.milestones.length >= 1);
}

// arm 3 · ai_graph_run(career-path,MAIN) 恰一行 succeeded ∧ version>=2 ∧ lease_owner IS NULL
const mainRunsAfterPost1 = await careerGraphRuns(MAIN);
const mainVersionAfterPost1 = mainRunsAfterPost1[0]?.version ?? 0;
A('ARM3-MAIN-RUN-ONE-SUCCEEDED-VERSION-GTE2-LEASE-NULL',
  mainRunsAfterPost1.length === 1
  && mainRunsAfterPost1[0]!.status === 'succeeded'
  && mainRunsAfterPost1[0]!.version >= 2
  && mainRunsAfterPost1[0]!.leaseOwner === null);

// arm 4 · career_path 表（owner+interview 维度）恰一行（读真相）
A('ARM4-MAIN-CAREER-PATH-ROW-EXACTLY-1', (await careerRowCount(MAIN)) === 1);

// arm 5 · GET → 200 同字段（GET 重闸放行 · 与 POST 体 readiness/level/milestones 逐字段一致）
{
  const getAfter = await h.req('GET', `/interview/${MAIN}/career-path`, U_A);
  const postBody = mainPost1.body;
  A('ARM5-MAIN-GET-200-SAME-FIELDS',
    getAfter.status === 200
    && getAfter.body?.level === postBody?.level
    && getAfter.body?.readiness === postBody?.readiness
    && JSON.stringify(getAfter.body?.milestones) === JSON.stringify(postBody?.milestones));
}

// arm 6 · 越权负前置（内嵌主路径叙事·非 NEG 列收据）：userB GET → 404 not_found_or_forbidden
{
  const crossGet = await h.req('GET', `/interview/${MAIN}/career-path`, U_B);
  A('ARM6-CROSS-OWNER-GET-404-NOT_FOUND_OR_FORBIDDEN',
    crossGet.status === 404 && crossGet.body?.error === 'not_found_or_forbidden');
}

// arm 7 · 409 负前置（内嵌主路径叙事·非 NEG 列收据）+ 两 409 线程 run 行恰 0
{
  const postNoAsmt = await h.post(`/interview/${NOASMT}/career-path`, U_A, {});
  const postNullOvr = await h.post(`/interview/${NULLOVR}/career-path`, U_A, {});
  const noAsmtRuns = await careerGraphRuns(NOASMT);
  const nullOvrRuns = await careerGraphRuns(NULLOVR);
  A('ARM7A-NO-ASSESSMENT-409-ASSESSMENT_REQUIRED',
    postNoAsmt.status === 409 && postNoAsmt.body?.error === 'assessment_required');
  A('ARM7B-NULL-OVERALL-409-INSUFFICIENT_EVIDENCE',
    postNullOvr.status === 409 && postNullOvr.body?.error === 'insufficient_evidence');
  A('ARM7C-409-THREADS-GRAPH-RUN-ZERO-ROWS', noAsmtRuns.length === 0 && nullOvrRuns.length === 0);
}

// arm 8 · A1：GET /profile/growth → 200 ∧ body.dimensions.length >= 2（deriveGrowth 维度并集）
{
  const growth = await h.req('GET', '/profile/growth', U_A);
  A('ARM8-GROWTH-DIMENSIONS-LENGTH-GTE-2',
    growth.status === 200
    && Array.isArray(growth.body?.dimensions)
    && growth.body.dimensions.length >= 2);
}

// arm 9 · 零模型边界：ai_invocation_trace 全表行数 before/after 净变 0（主路径窗 · 观察面）
A('ARM9-ZERO-TRACE-MAIN-PATH-NET-0', (await traceRowCount()) === traceRowsAtStart);

// ═══════════ 失败降级（arm 10-15 · FAULT seam 线程）═══════════

const faultRunsBefore = await careerGraphRuns(FAULT);

// arm 10 · POST → 500 internal_error 统一信封（实测为准）
{
  const faultPost1 = await h.post(`/interview/${FAULT}/career-path`, U_A, {});
  A('ARM10-FAULT-POST-500-INTERNAL_ERROR',
    faultPost1.status === 500 && faultPost1.body?.error === 'internal_error');
}

// arm 11 · ai_graph_run(career-path,FAULT) 恰一行 failed ∧ version>=2
const faultRuns1 = await careerGraphRuns(FAULT);
A('ARM11-FAULT-RUN-ONE-FAILED-VERSION-GTE2',
  faultRunsBefore.length === 0
  && faultRuns1.length === 1
  && faultRuns1[0]!.status === 'failed'
  && faultRuns1[0]!.version >= 2);

// arm 12 · GET /interview/FAULT/career-path → 404 not_found（无失败产物）
{
  const faultGet = await h.req('GET', `/interview/${FAULT}/career-path`, U_A);
  A('ARM12-FAULT-GET-404-NOT_FOUND', faultGet.status === 404 && faultGet.body?.error === 'not_found');
}

// arm 13 · 额度账本三表 before/after 逐行快照净变 0（career-path 不计费 D1 · 观察结果）
A('ARM13-LEDGER-NET-0-AFTER-FAULT', (await ledgerSnapshot()) === ledgerAtStart);

// arm 14 · in-fault 重试：再失败 + version 递增 + career_path 仍 0 行 + 账本仍净变 0
{
  const faultPost2 = await h.post(`/interview/${FAULT}/career-path`, U_A, {});
  const faultRuns2 = await careerGraphRuns(FAULT);
  const faultCareerRows = await careerRowCount(FAULT);
  const ledgerAfterRetry = await ledgerSnapshot();
  A('ARM14-FAULT-RETRY-FAIL-VERSION-INC-NO-HALF-WRITE-LEDGER-NET-0',
    faultPost2.status === 500 && faultPost2.body?.error === 'internal_error'
    && faultRuns2.length === 1 && faultRuns2[0]!.status === 'failed'
    && faultRuns2[0]!.version > faultRuns1[0]!.version
    && faultCareerRows === 0
    && ledgerAfterRetry === ledgerAtStart);
}

// arm 15 · server alive 钉复打主路径线程形：POST /interview/MAIN/career-path → 200 ∧
// 主线程 run 行仍恰一行 succeeded（begin 复用/接管同 run 行 · version 单调递增）
{
  const mainPost2 = await h.post(`/interview/${MAIN}/career-path`, U_A, {});
  const mainRuns2 = await careerGraphRuns(MAIN);
  const mainCareerRows = await careerRowCount(MAIN);
  A('ARM15-SERVER-ALIVE-MAIN-REPLAY-200-RUN-STILL-ONE-SUCCEEDED',
    mainPost2.status === 200 && mainPost2.body?.level === 'mid'
    && mainRuns2.length === 1 && mainRuns2[0]!.status === 'succeeded'
    && mainRuns2[0]!.version > mainVersionAfterPost1
    && mainCareerRows === 1);
}

// 全会话观察收尾（非闸门证据行，沿 fault prove :423 形）：零 trace + 账本零净变如实打印。
const traceRowsAtEnd = await traceRowCount();
console.log(`EVIDENCE ZERO-TRACE ai_invocation_trace rows start=${traceRowsAtStart} end=${traceRowsAtEnd} delta=${traceRowsAtEnd - traceRowsAtStart} (evidence field; child env MODEL_API_KEY/MODEL_BASE_URL deleted by boot())`);
console.log('NOTE EXIT 值不翻任何 SSOT 行 · UC-E2E-004 矩阵列翻面只走 covered 评估器 + 协调方 nail');
console.log('CMD=pnpm uc004:career-path:http:prove');
await done();
