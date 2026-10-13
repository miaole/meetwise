/**
 * billing 战役 P3（BILL3-SETTLEMENT）证明：0172 topic_charge 话题计费表+interview 计费三列+ck_interview_cap ·
 * 0173 tf_ 触发器改写（per_session 逐字保留+per_topic_capped 方案②）· closeTopic/confirmConsumptionUnits/
 * completeInterviewAndConfirm/abandon/sweep 拆分 · #31 报错（REQUEST §2-1 六臂）。
 *
 * 此测试只能由 `scripts/run-e2e-isolated.mjs` 在完整版本化迁移（0001→0182 全链 applied）后运行。
 * 禁止用 `packages/db/sql/` 影子 schema（影子数据库结构）伪造通过。
 * 零模型真实外呼：scriptedModelClient 假体（bill1/bill2 proof 同形）；零生产 DSN/零凭据落盘；零真实扣费。
 *
 * 六臂（REQUEST §2-1）：
 *   ⓪ 迁移臂：0172 表形（PK/三值 CHECK/units 0..3/表级 settled-units CHECK/rule_version NOT NULL/RLS FORCE/
 *      只授 SELECT,INSERT→42501 负臂）+ interview 三列默认 per_session + ck_interview_cap 四谓词负臂 23514 +
 *      0173 函数现形（per_session 两 RAISE 原文+zero_usage_requires_release+topic_settled_mismatch+round 同式+GRANT）。
 *   ① 结算臂（方案②公式逐值·蓝本 §5 示例重放）：2 话题→r2(1.00×2/6)=0.33 partial_confirmed·尾桶吸收差额守恒；
 *      8 话题→LEAST 截断→1.00 confirmed（封顶臂）；全跳过→waived skipped→Σ=0→released；舍入同式臂（cap=200
 *      →0.005 边界 half-away 双面一致→0.01）。
 *   ② 触发器臂：settled 错值⇒topic_settled_mismatch 23514·counted=0+confirmed⇒zero_usage_requires_release 23514·
 *      per_session 回归原值三臂（0144 现行判定逐字）·failed+partial/abandoned+partial 合法（裁决③ 照收）。
 *   ③ closeTopic 臂：同场双话题并发关闭不越封顶（FOR UPDATE 串行化·cap=1 恰 1 counted+1 capped）+PK 重放幂等
 *      +聚合归一（pivot/probe/clarify 同 topic·clarify 无效不计）+模式闸零写（per_session/无预留场）。
 *   ④ #31 臂：同键不同 units 抛具名错（非 duplicate·409 映射面=begin catch additive·interview:prove 回归覆盖）
 *      ·同键同 units duplicate 原语义。
 *   ⑤ 零行为变更负臂（per_session 缺省全链原值·bill2 零扣费负臂的反转重申）：真链 completed→confirmed 1.00·
 *      abandon 全退·sweep 全退·fail 全退·新行计费列默认值·per_session 场 topic_charge 零写。
 */
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  abandonInterviewAndRelease, answerHash, appendEvent, asPrincipal, assertIsolatedTestTarget, claimInterviewAnswer,
  closeTopic, completeInterviewAndConfirm, confirmConsumptionUnits, createPool, createResumeWithBlob,
  enqueueInterviewJob, failInterviewAndRelease, reserveEntitlement, supplyCandidateProfileRoute,
  sweepExpiredReservations, transitionResume, completeIngestion, availableUnits,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { ingestResume } from '@meetwise/domain';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';
import { PLANNER_DEFAULT_COMPETENCIES } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER = `bill3-proof-${process.pid}`;
const RULE_VERSION = 'topic-v1';
const RESUME = [
  '工作经历',
  '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。',
  '技能',
  'Redis、限流、分布式锁',
].join('\n');
/** 评分引文（逐字校验要求 quote ⊆ answer）：全部正常作答固定含 Redis。 */
const GOOD_ANSWER = (n: number) => `第 ${n} 轮：我会用 Redis 计数器加滑动窗口限流，超阈值降级保护下游，并压测验证。`;
/** 方案②公式（应用侧·与 0173 触发器 round(x::numeric,2) 同式·§0.2-7 正数域 half-away 一致）。 */
const r2 = (n: number) => Math.round(n * 100) / 100;
const settledOf = (requested: number, counted: number, cap: number) => r2(requested * Math.min(counted, cap) / cap);

let askSeq = 0;
let evalSeq = 0;
/** 逐场评分脚本。'exceeds'=100→pivot / 'meets'=50→probe。 */
let evalScript: (call: number) => 'exceeds' | 'meets' = () => 'meets';
const evalDisposition = (call: number) => {
  const mode = evalScript(call);
  return { ok: true as const, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: mode, quote: 'Redis' }] } };
};
const scripted = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: PLANNER_DEFAULT_COMPETENCIES } }),
  'interviewer.ask': () => {
    askSeq += 1;
    return { ok: true, raw: { q: `请围绕限流取舍说明做法，并给出第 ${askSeq} 轮验证方法。`, refs: [] } };
  },
  'mock-interview.evaluate': () => evalDisposition(++evalSeq),
  'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '能说明限流取舍。' }] } }),
});
const model: ModelClient = { complete: (req, attempt, signal) => scripted.complete(req, attempt, signal) };

/** 隐私面最小 interview 行（RLS p_owner 带 interview_privacy_active 谓词·bill1/bill2 fixture 同形）。 */
async function createInterviewRow(interviewId: string): Promise<void> {
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',(SELECT id FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1),(SELECT privacy_epoch FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1))",
      [interviewId, OWNER],
    );
  });
}

/** 起一场真链面试（bill2 fixture 同形：route snapshot 生产同链供给 + 权益预留 + start 入队）。 */
async function beginInterview(interviewId: string): Promise<void> {
  await createInterviewRow(interviewId);
  await asPrincipal(pool, OWNER, async (c) => {
    const row = await c.query<{ resume_id: string }>('SELECT resume_id FROM interview WHERE id=$1', [interviewId]);
    await supplyCandidateProfileRoute(c, OWNER, interviewId, row.rows[0]!.resume_id);
    await reserveEntitlement(c, OWNER, interviewId, 'mock_interview', 1);
    await enqueueInterviewJob(c, OWNER, interviewId, 'start', { requestId: `bill3-${interviewId}` }, 0);
  });
}

/** 起一场 per_topic_capped fixture 场（直写计费行值=flag 载体·本刀 begin 零改·后续刀落 begin 写列）。 */
async function beginCappedSession(interviewId: string, cap: number): Promise<void> {
  await createInterviewRow(interviewId);
  await asPrincipal(pool, OWNER, async (c) => {
    await reserveEntitlement(c, OWNER, interviewId, 'mock_interview', 1);
    await c.query(
      "UPDATE interview SET billing_mode='per_topic_capped', billing_cap_units=$3, billing_rule_version=$4 WHERE id=$1 AND owner_user_id=$2",
      [interviewId, OWNER, cap, RULE_VERSION],
    );
  });
}

const deps: ConsumerDeps = {
  pool,
  cp: new MemorySaver() as any,
  model,
  leaseOwner: `bill3-proof-worker-${process.pid}`,
  adaptive: {
    role: '后端工程师',
    maxTurns: 12,
    absoluteMaxTurns: 12,
    localRetrieve: async () => [],
    webExplore: async () => [],
  },
};

/** 驱动一轮作答（API 身份领取 → answer 入队 → 消费拍）；返回面试终态。 */
async function answerCurrent(interviewId: string, answer: string): Promise<string | undefined> {
  const q = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string; state_version: number; turn: number }>(
      "SELECT question_id,state_version,turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1",
      [interviewId],
    );
    return rows.rows[0];
  });
  if (!q) return undefined;
  const input = {
    questionId: q.question_id, stateVersion: Number(q.state_version), turn: Number(q.turn),
    answerId: randomUUID(), answerHash: answerHash(answer), answer,
  };
  const claimed = await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, interviewId, input));
  if (claimed.status !== 'accepted' && claimed.status !== 'replayed') throw new Error(`claim_${claimed.status}`);
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, interviewId, 'answer', input, input.turn + 1));
  await interviewDispatchTick(deps);
  const row = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [interviewId]));
  return row.rows[0]?.status;
}

/** 驱动到收尾（有 issued 题就继续答·guard 兜底防跑飞）。 */
async function driveToDone(interviewId: string, answer: (n: number) => string, guard = 40): Promise<string | undefined> {
  let status: string | undefined;
  for (let i = 0; i < guard; i++) {
    const next = await answerCurrent(interviewId, answer(i + 1));
    if (next === undefined) break;
    status = next;
    if (next === 'completed' || next === 'failed') break;
  }
  return status;
}

async function consumptionOf(interviewId: string): Promise<Record<string, any> | undefined> {
  return (await asPrincipal(pool, OWNER, (c) => c.query(
    'SELECT status,units_requested,units_settled FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, interviewId]))).rows[0];
}

async function chargesOf(interviewId: string): Promise<Record<string, any>[]> {
  return (await asPrincipal(pool, OWNER, (c) => c.query(
    'SELECT topic_id,answers,units,status,reason,rule_version FROM topic_charge WHERE owner_user_id=$1 AND interview_id=$2 ORDER BY topic_id',
    [OWNER, interviewId]))).rows;
}

async function consumedSum(): Promise<number> {
  const r = await asPrincipal(pool, OWNER, (c) => c.query<{ s: string }>(
    'SELECT COALESCE(SUM(units_consumed),0)::text s FROM entitlement_bucket WHERE owner_user_id=$1', [OWNER]));
  return Number(r.rows[0]?.s ?? 0);
}

/** 直插一条预留行（触发器负臂用·零桶退款参与）。 */
async function seedConsumption(interviewId: string, status: string): Promise<void> {
  await asPrincipal(pool, OWNER, (c) => c.query(
    `INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, allocations, status)
     VALUES ($1,$2,'mock_interview',1.0,'[]',$3) ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING`,
    [OWNER, interviewId, status]));
}

/** 铸一个话题（pivot+probe 两行·validAnswers=true 时 pivot 落有效 answer_evaluated 事件——closeTopic 聚合判据）。 */
async function seedTopic(interviewId: string, topicId: string, turnBase: number, validAnswers = true): Promise<void> {
  await asPrincipal(pool, OWNER, async (c) => {
    const pivotId = `${topicId}-pivot`;
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,status) VALUES ($1,$2,$3,$4,$5,'fixture 题面',$6,'pivot','answered')",
      [OWNER, interviewId, pivotId, turnBase + 1, turnBase, topicId]);
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,status) VALUES ($1,$2,$3,$4,$5,'fixture 追问',$6,'probe','answered')",
      [OWNER, interviewId, `${topicId}-probe`, turnBase + 2, turnBase + 1, topicId]);
    if (validAnswers) {
      await appendEvent(c, OWNER, interviewId, 'answer_evaluated', { questionId: pivotId, outcome: 'answered', score: 80 }, `answer_evaluated:${pivotId}`);
    }
  });
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',30.0,now()+interval '30 days')",
      [OWNER],
    );
    const created = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, created.resumeId, ingestResume(RESUME));
  });

  /* ───────── ⓪ 迁移臂：0172 表形+CHECK 负臂+RLS+0173 函数现形+GRANT ───────── */
  section('⓪ 迁移臂：0172 topic_charge/interview 计费列 + 0173 tf_ 函数现形（真链 0001→0182 applied）');
  const chain = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number; v172: boolean; v173: boolean }>(
    `SELECT count(*)::int n,
            count(*) FILTER (WHERE version LIKE '0172%')::int = 1 AS v172,
            count(*) FILTER (WHERE version LIKE '0173%')::int = 1 AS v173
       FROM schema_migrations`));
  A('隔离库真迁移链全链 applied（182 版本在账·版本键=完整文件名词干）·0172/0173 各恰一行',
    Number(chain.rows[0]?.n) === 182 && chain.rows[0]?.v172 === true && chain.rows[0]?.v173 === true);
  const shape = await asPrincipal(pool, OWNER, (c) => c.query<{ relforcerowsecurity: boolean; pk: string }>(
    `SELECT c.relforcerowsecurity,
            (SELECT pg_get_constraintdef(oid) FROM pg_constraint
              WHERE conrelid='public.topic_charge'::regclass AND contype='p') AS pk
       FROM pg_class c WHERE c.oid='public.topic_charge'::regclass`));
  A('0172 → topic_charge 在场·RLS FORCE·PK(owner_user_id,interview_id,topic_id)（蓝本 §6.3 草案逐字）',
    shape.rows[0]?.relforcerowsecurity === true
    && String(shape.rows[0]?.pk).includes('owner_user_id')
    && String(shape.rows[0]?.pk).includes('interview_id')
    && String(shape.rows[0]?.pk).includes('topic_id'));
  const checkDefs = await asPrincipal(pool, OWNER, (c) => c.query<{ conname: string; def: string }>(
    "SELECT conname, pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid='public.topic_charge'::regclass AND contype='c'"));
  const allDefs = checkDefs.rows.map((r) => r.def).join(' | ');
  A('0172 → status 三值 CHECK（counted/counted_capped/waived·PG 规范化 deparse 形）+表级 settled-units CHECK 命名在场（恒 0 分由负臂④⑤功能承重）',
    ['counted', 'counted_capped', 'waived'].every((v) => allDefs.includes(`'${v}'`))
    && checkDefs.rows.some((r) => r.conname === 'ck_topic_charge_settled_units'));
  const ruleVersionNullable = await asPrincipal(pool, OWNER, (c) => c.query<{ nullable: boolean }>(
    `SELECT is_nullable = 'YES' AS nullable FROM information_schema.columns
      WHERE table_name='topic_charge' AND column_name='rule_version'`));
  A('0172 → rule_version NOT NULL（E4 勘误：仅 rule_version 非空·reason 可空）',
    ruleVersionNullable.rows[0]?.nullable === false
    && (await asPrincipal(pool, OWNER, (c) => c.query<{ nullable: boolean }>(
      `SELECT is_nullable = 'YES' AS nullable FROM information_schema.columns
        WHERE table_name='topic_charge' AND column_name='reason'`))).rows[0]?.nullable === true);
  const billingCols = await asPrincipal(pool, OWNER, (c) => c.query<{ col: string; defval: string | null; nullable: boolean }>(
    `SELECT column_name col, column_default defval, is_nullable = 'YES' nullable FROM information_schema.columns
      WHERE table_name='interview' AND column_name IN ('billing_mode','billing_cap_units','billing_rule_version') ORDER BY column_name`));
  A('0172 → interview 计费三列在场·billing_mode NOT NULL DEFAULT per_session（零行为变更增补行①）',
    billingCols.rows.length === 3
    && billingCols.rows.every((r) => r.col !== 'billing_mode' || (r.nullable === false && String(r.defval).includes('per_session'))));
  const capChecks = await asPrincipal(pool, OWNER, (c) => c.query<{ conname: string }>(
    "SELECT conname FROM pg_constraint WHERE conrelid='public.interview'::regclass AND contype='c' AND conname IN ('ck_interview_cap','ck_interview_billing_mode')"));
  A('0172 → ck_interview_cap+ck_interview_billing_mode 命名约束在场（0170 命名约束形制）',
    capChecks.rows.length === 2);
  const iidDefault = `bill3-def-${Date.now()}`;
  await createInterviewRow(iidDefault);
  const defaultVals = await asPrincipal(pool, OWNER, (c) => c.query<{ billing_mode: string; cap: string | null; rv: string | null }>(
    'SELECT billing_mode, billing_cap_units cap, billing_rule_version rv FROM interview WHERE id=$1 AND owner_user_id=$2', [iidDefault, OWNER]));
  A('0172 → 新行计费列默认值：per_session/cap NULL/rule_version NULL（flag 载体=行值·后续刀 begin 落列）',
    defaultVals.rows[0]?.billing_mode === 'per_session' && defaultVals.rows[0]?.cap === null && defaultVals.rows[0]?.rv === null);
  let badNoRv = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE interview SET billing_mode='per_topic_capped', billing_cap_units=6, billing_rule_version=NULL WHERE id=$1", [iidDefault]));
  } catch (error) { badNoRv = String((error as { code?: string })?.code ?? ''); }
  A('0172 ck_interview_cap 负臂①：per_topic_capped 无 rule_version→23514（LEAST 忽略 NULL 防静默失效）', badNoRv === '23514');
  let badCapZero = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE interview SET billing_mode='per_topic_capped', billing_cap_units=0, billing_rule_version='topic-v1' WHERE id=$1", [iidDefault]));
  } catch (error) { badCapZero = String((error as { code?: string })?.code ?? ''); }
  A('0172 ck_interview_cap 负臂②：per_topic_capped cap=0→23514（cap>0 承重）', badCapZero === '23514');
  let badSessionCap = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE interview SET billing_mode='per_session', billing_cap_units=6, billing_rule_version=NULL WHERE id=$1", [iidDefault]));
  } catch (error) { badSessionCap = String((error as { code?: string })?.code ?? ''); }
  A('0172 ck_interview_cap 负臂③：per_session 携 cap→23514（四谓词互斥面）', badSessionCap === '23514');
  let badWaivedUnits = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO topic_charge(owner_user_id,interview_id,topic_id,answers,units,status,rule_version) VALUES ($1,$2,'t-neg',1,1,'waived','topic-v1')",
      [OWNER, iidDefault]));
  } catch (error) { badWaivedUnits = String((error as { code?: string })?.code ?? ''); }
  A('0172 CHECK 负臂④：waived 携 units=1→23514（非 counted 恒 0 分）', badWaivedUnits === '23514');
  let badUnitsRange = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO topic_charge(owner_user_id,interview_id,topic_id,answers,units,status,rule_version) VALUES ($1,$2,'t-neg',1,4,'counted','topic-v1')",
      [OWNER, iidDefault]));
  } catch (error) { badUnitsRange = String((error as { code?: string })?.code ?? ''); }
  A('0172 CHECK 负臂⑤：units=4→23514（0..3 值域·备选保留默认恒 1）', badUnitsRange === '23514');
  let updDenied = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query('UPDATE topic_charge SET units=2 WHERE owner_user_id=$1', [OWNER]));
  } catch (error) { updDenied = String((error as { code?: string })?.code ?? ''); }
  let delDenied = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query('DELETE FROM topic_charge WHERE owner_user_id=$1', [OWNER]));
  } catch (error) { delDenied = String((error as { code?: string })?.code ?? ''); }
  A('0172 负臂⑥：app_role UPDATE/DELETE→42501（只授 SELECT,INSERT·裁决项①按推荐行使·0171 :36-42 形）',
    updDenied === '42501' && delDenied === '42501');
  const fnDef = await asPrincipal(pool, OWNER, (c) => c.query<{ def: string }>(
    "SELECT pg_get_functiondef('public.tf_interview_consumption_terminal_pair(public.interview, public.interview)'::regprocedure) def"));
  const fn = String(fnDef.rows[0]?.def ?? '');
  A('0173 → tf_ 函数现形：per_session 分支两 RAISE 原文逐字保留+per_topic_capped 分支双具名错+方案② round 同式',
    fn.includes("p_new.billing_mode = 'per_session'")
    && fn.includes('invalid_interview_consumption_pair: completed requires confirmed, got %')
    && fn.includes('invalid_interview_consumption_pair: % requires released, got %')
    && fn.includes('zero_usage_requires_release')
    && fn.includes('topic_settled_mismatch')
    && fn.includes("FILTER (WHERE status='counted')")
    && /round\s*\(\s*requested \* LEAST\(counted, p_new\.billing_cap_units\) \/ p_new\.billing_cap_units,\s*2\)/.test(fn));
  const grantOk = await asPrincipal(pool, OWNER, (c) => c.query<{ ok: boolean }>(
    `SELECT count(*) FILTER (WHERE g.grantee = 0 AND g.privilege_type = 'EXECUTE') > 0 AS ok
       FROM pg_proc p, aclexplode(p.proacl) g
      WHERE p.oid = 'public.tf_interview_consumption_terminal_pair(public.interview, public.interview)'::regprocedure`));
  A('0173 → GRANT EXECUTE TO PUBLIC 语义保留（grantee=0=PUBLIC·CREATE OR REPLACE 不动 ACL·0144 :411 亲证面）',
    grantOk.rows[0]?.ok === true);
  const enforceOuter = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    "SELECT count(*)::int n FROM pg_trigger WHERE tgrelid='public.interview'::regclass AND tgname='trg_interview_consumption_terminal_pair' AND NOT tgisinternal"));
  A('外层触发器零改：trg_interview_consumption_terminal_pair 原位（0020 :62-64 BEFORE INSERT OR UPDATE OF status）',
    Number(enforceOuter.rows[0]?.n) === 1);

  /* ───────── ① 结算臂（方案②公式逐值·蓝本 §5 示例重放） ───────── */
  section('① 结算臂：2 话题→0.33 partial·8 话题封顶→1.00 confirmed·全跳过→released·舍入同式 0.01');
  const iid2 = `bill3-s2-${Date.now()}`;
  await beginCappedSession(iid2, 6);
  for (let i = 0; i < 2; i++) await seedTopic(iid2, `bill3-s2-t${i}`, i * 2);
  const closed2 = await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iid2, 'bill3-s2-t0'));
  await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iid2, 'bill3-s2-t1'));
  const completed2 = await asPrincipal(pool, OWNER, async (c) =>
    completeInterviewAndConfirm(c, OWNER, iid2));
  const con2 = await consumptionOf(iid2);
  A('①-a 蓝本 §5 示例重放：2 话题 counted→settled=r2(1.00×2/6)=0.33·partial_confirmed·interview completed（#229 完成判据=话题结算）',
    closed2.written === true && closed2.status === 'counted'
    && completed2.status === 'completed' && Number(completed2.unitsSettled) === settledOf(1, 2, 6)
    && con2?.status === 'partial_confirmed' && Number(con2.units_settled) === 0.33);
  A('①-a 尾桶吸收差额守恒：Σbucket units_consumed === 0.33（#21 形·不漏分不重分）',
    Math.abs((await consumedSum()) - 0.33) < 1e-9);
  A('①-a topic_charge 行形：counted/units=1/rule_version=topic-v1/answers=1/reason NULL（恒 1 分·三账本之二）',
    (await chargesOf(iid2)).length === 2
    && (await chargesOf(iid2)).every((t) => t.status === 'counted' && Number(t.units) === 1
      && t.rule_version === RULE_VERSION && Number(t.answers) === 1 && t.reason === null));
  const iid8 = `bill3-s8-${Date.now()}`;
  await beginCappedSession(iid8, 6);
  for (let i = 0; i < 8; i++) await seedTopic(iid8, `bill3-s8-t${i}`, i * 2);
  const closedSeq: (string | null)[] = [];
  for (let i = 0; i < 8; i++) {
    const out = await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iid8, `bill3-s8-t${i}`));
    closedSeq.push(out.status);
  }
  const completed8 = await asPrincipal(pool, OWNER, async (c) => completeInterviewAndConfirm(c, OWNER, iid8));
  const con8 = await consumptionOf(iid8);
  A('①-b 封顶臂：8 话题 closeTopic→前 6 counted+第 7/8 counted_capped（LEAST 截断·0 分）',
    closedSeq.filter((s) => s === 'counted').length === 6
    && closedSeq.slice(6).every((s) => s === 'counted_capped'));
  A('①-b 封顶结算：settled=r2(1.00×LEAST(8,6)/6)=1.00·confirmed（触发器 LEAST(6,6) 同式配对通过）',
    completed8.status === 'completed' && Number(completed8.unitsSettled) === settledOf(1, 8, 6)
    && con8?.status === 'confirmed' && Number(con8.units_settled) === 1);
  const iidSkip = `bill3-skip-${Date.now()}`;
  await beginCappedSession(iidSkip, 6);
  await seedTopic(iidSkip, 'bill3-skip-t0', 0, false);
  const closedSkip = await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidSkip, 'bill3-skip-t0'));
  const completedSkip = await asPrincipal(pool, OWNER, async (c) => completeInterviewAndConfirm(c, OWNER, iidSkip));
  const conSkip = await consumptionOf(iidSkip);
  A('①-c 全跳过臂：零有效作答话题→waived+reason=skipped+units=0（裁决项②按推荐行使）→Σ=0→released（「全跳过=0 分则全退」）',
    closedSkip.written === true && closedSkip.status === 'waived'
    && (await chargesOf(iidSkip))[0]?.reason === 'skipped' && Number((await chargesOf(iidSkip))[0]?.units) === 0
    && completedSkip.status === 'completed' && completedSkip.unitsSettled === undefined
    && conSkip?.status === 'released' && Number(conSkip.units_settled ?? 0) === 0);
  A('①-c 全退回池：池守恒不变量 available+reserved+consumed === 30.0（skip 场零消耗·预留 1.00 全额回池）',
    Math.abs((await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER)))
      + Number((await asPrincipal(pool, OWNER, (c) => c.query<{ r: string }>('SELECT COALESCE(SUM(units_reserved),0)::text r FROM entitlement_bucket WHERE owner_user_id=$1', [OWNER]))).rows[0]!.r)
      + (await consumedSum()) - 30.0) < 1e-9);
  const iidRound = `bill3-round-${Date.now()}`;
  await beginCappedSession(iidRound, 200);
  await seedTopic(iidRound, 'bill3-round-t0', 0);
  await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidRound, 'bill3-round-t0'));
  const completedRound = await asPrincipal(pool, OWNER, async (c) => completeInterviewAndConfirm(c, OWNER, iidRound));
  const conRound = await consumptionOf(iidRound);
  A('①-d 舍入同式臂（0.005 边界）：settled=r2(1.00×1/200)=0.01 与触发器 round(0.005::numeric,2)=0.01 双面一致→配对通过',
    completedRound.status === 'completed' && Number(completedRound.unitsSettled) === settledOf(1, 1, 200)
    && conRound?.status === 'partial_confirmed' && Number(conRound.units_settled) === 0.01);

  /* ───────── ② 触发器臂：错值拒×2+per_session 回归三臂+failed/abandoned partial 合法 ───────── */
  section('② 触发器臂：topic_settled_mismatch/zero_usage_requires_release 23514+per_session 原值回归+照收合法面');
  let mismatchErr = '';
  try {
    await asPrincipal(pool, OWNER, async (c) => {
      await c.query("UPDATE entitlement_consumption SET units_settled=0.50 WHERE owner_user_id=$1 AND idempotency_key=$2", [OWNER, iid2]);
      await c.query("UPDATE interview SET status='completed' WHERE id=$1 AND owner_user_id=$2", [iid2, OWNER]);
    });
  } catch (error) { mismatchErr = String((error as { message?: string })?.message ?? ''); }
  A('②-a settled 错值（0.50≠公式 0.33）⇒topic_settled_mismatch 23514（事务回滚·权威值零污染）',
    mismatchErr.includes('topic_settled_mismatch')
    && Number((await consumptionOf(iid2))?.units_settled) === 0.33);
  const iidZero = `bill3-zero-${Date.now()}`;
  await beginCappedSession(iidZero, 6);
  await asPrincipal(pool, OWNER, (c) => c.query(
    "UPDATE entitlement_consumption SET status='confirmed', units_settled=1.0 WHERE owner_user_id=$1 AND idempotency_key=$2", [OWNER, iidZero]));
  let zeroErr = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE interview SET status='completed' WHERE id=$1 AND owner_user_id=$2", [iidZero, OWNER]));
  } catch (error) { zeroErr = String((error as { message?: string })?.message ?? ''); }
  A('②-b counted=0+confirmed⇒zero_usage_requires_release 23514（零已关闭话题必须全退）',
    zeroErr.includes('zero_usage_requires_release'));
  const iidPsC = `bill3-psc-${Date.now()}`;
  await createInterviewRow(iidPsC);
  await seedConsumption(iidPsC, 'reserved');
  let psCompletedErr = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE interview SET status='completed' WHERE id=$1 AND owner_user_id=$2", [iidPsC, OWNER]));
  } catch (error) { psCompletedErr = String((error as { message?: string })?.message ?? ''); }
  A('②-c per_session 回归①：completed+reserved 拒→invalid_interview_consumption_pair 23514（0144 原判定逐字）',
    psCompletedErr.includes('completed requires confirmed'));
  const iidPsA = `bill3-psa-${Date.now()}`;
  await createInterviewRow(iidPsA);
  await seedConsumption(iidPsA, 'confirmed');
  let psAbandonErr = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE interview SET status='abandoned' WHERE id=$1 AND owner_user_id=$2", [iidPsA, OWNER]));
  } catch (error) { psAbandonErr = String((error as { message?: string })?.message ?? ''); }
  A('②-c per_session 回归②：abandoned+confirmed 拒→requires released 23514（原判定逐字）',
    psAbandonErr.includes('requires released'));
  const iidPsF = `bill3-psf-${Date.now()}`;
  await createInterviewRow(iidPsF);
  await seedConsumption(iidPsF, 'reserved');
  let psFailErr = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE interview SET status='failed' WHERE id=$1 AND owner_user_id=$2", [iidPsF, OWNER]));
  } catch (error) { psFailErr = String((error as { message?: string })?.message ?? ''); }
  A('②-c per_session 回归③：failed+reserved 拒→requires released 23514（0144 现行三臂原值）',
    psFailErr.includes('requires released'));
  const iidFail = `bill3-fail-${Date.now()}`;
  await beginCappedSession(iidFail, 6);
  for (let i = 0; i < 2; i++) await seedTopic(iidFail, `bill3-fail-t${i}`, i * 2);
  await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidFail, 'bill3-fail-t0'));
  await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidFail, 'bill3-fail-t1'));
  const failedOut = await asPrincipal(pool, OWNER, async (c) => failInterviewAndRelease(c, OWNER, iidFail));
  const conFail = await consumptionOf(iidFail);
  const failStatus = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [iidFail]));
  A('②-d failed+partial 合法（裁决③ 评分失败照收）：Σ=2>0→部分结算 0.33·interview failed·released 报告值=settled',
    failedOut.status === 'failed' && failedOut.released === 'settled'
    && failStatus.rows[0]?.status === 'failed'
    && conFail?.status === 'partial_confirmed' && Number(conFail.units_settled) === 0.33);
  const iidAb = `bill3-ab-${Date.now()}`;
  await beginCappedSession(iidAb, 6);
  for (let i = 0; i < 2; i++) await seedTopic(iidAb, `bill3-ab-t${i}`, i * 2);
  await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidAb, 'bill3-ab-t0'));
  await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidAb, 'bill3-ab-t1'));
  const abandonedOut = await asPrincipal(pool, OWNER, async (c) => abandonInterviewAndRelease(c, OWNER, iidAb));
  const conAb = await consumptionOf(iidAb);
  const abStatus = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [iidAb]));
  A('②-e abandoned+partial 合法（裁决③ 用户放弃照收）：Σ=2>0→部分结算 0.33·interview abandoned·released 报告值=settled',
    abandonedOut.status === 'abandoned' && abandonedOut.released === 'settled'
    && abStatus.rows[0]?.status === 'abandoned'
    && conAb?.status === 'partial_confirmed' && Number(conAb.units_settled) === 0.33);

  /* ───────── ③ closeTopic 臂：并发封顶串行化+PK 幂等+聚合归一+模式闸零写 ───────── */
  section('③ closeTopic 臂：cap=1 双话题并发恰 1 counted·PK 重放幂等·pivot/probe/clarify 归一聚合·模式闸零写');
  const iidConc = `bill3-conc-${Date.now()}`;
  await beginCappedSession(iidConc, 1);
  await seedTopic(iidConc, 'bill3-conc-t0', 0);
  await seedTopic(iidConc, 'bill3-conc-t1', 2);
  const concurrent = await Promise.all([
    asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidConc, 'bill3-conc-t0')),
    asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidConc, 'bill3-conc-t1')),
  ]);
  const concCharges = await chargesOf(iidConc);
  A('③-a 双话题并发关闭不越封顶：恰 1 counted+1 counted_capped（FOR UPDATE 串行化·Σcounted units=1=cap）',
    concurrent.every((r) => r.written === true)
    && concurrent.filter((r) => r.status === 'counted').length === 1
    && concurrent.filter((r) => r.status === 'counted_capped').length === 1
    && concCharges.filter((t) => t.status === 'counted').length === 1
    && concCharges.reduce((s, t) => s + Number(t.units), 0) === 1);
  const replayOut = await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidConc, 'bill3-conc-t0'));
  A('③-b PK 重放幂等：closeTopic 重放→written=false（ON CONFLICT DO NOTHING·崩溃重放零重复）·行数零增长',
    replayOut.written === false && (await chargesOf(iidConc)).length === 2);
  const iidAgg = `bill3-agg-${Date.now()}`;
  await beginCappedSession(iidAgg, 6);
  await asPrincipal(pool, OWNER, async (c) => {
    // pivot(有效)+probe(有效)+clarify(重发·无事件=无效) 同话题（0170 语义：probe/clarify topic_id=主问题 id）
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,status) VALUES ($1,$2,'agg-pivot',1,0,'fixture 主题', 'agg-t','pivot','answered')",
      [OWNER, iidAgg]);
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,status) VALUES ($1,$2,'agg-probe',2,1,'fixture 追问','agg-t','probe','answered')",
      [OWNER, iidAgg]);
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,clarify_cause,status) VALUES ($1,$2,'agg-clr',3,2,'fixture 澄清','agg-t','clarify','non_answer','answered')",
      [OWNER, iidAgg]);
    await appendEvent(c, OWNER, iidAgg, 'answer_evaluated', { questionId: 'agg-pivot', outcome: 'answered', score: 80 }, 'answer_evaluated:agg-pivot');
    await appendEvent(c, OWNER, iidAgg, 'answer_evaluated', { questionId: 'agg-probe', outcome: 'answered', score: 60 }, 'answer_evaluated:agg-probe');
  });
  const closedAgg = await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidAgg, 'agg-t'));
  const aggRow = (await chargesOf(iidAgg))[0];
  A('③-c 聚合归一：pivot/probe/clarify 同 topic 单行·answers=2（clarify 无评分事件不计有效·0180 聚合判据同族）',
    closedAgg.written === true && (await chargesOf(iidAgg)).length === 1
    && Number(aggRow?.answers) === 2 && aggRow?.status === 'counted');
  const iidGate = `bill3-gate-${Date.now()}`;
  await createInterviewRow(iidGate);
  const gatedOut = await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidGate, 'no-topic'));
  const iidNoRes = `bill3-nores-${Date.now()}`;
  await createInterviewRow(iidNoRes);
  await asPrincipal(pool, OWNER, (c) => c.query(
    "UPDATE interview SET billing_mode='per_topic_capped', billing_cap_units=6, billing_rule_version='topic-v1' WHERE id=$1", [iidNoRes]));
  const noResOut = await asPrincipal(pool, OWNER, (c) => closeTopic(c, OWNER, iidNoRes, 'no-topic'));
  A('③-d 模式闸零写：per_session 场→written=false（零行为变更）；per_topic_capped 无预留行→written=false（零计费落点）',
    gatedOut.written === false && gatedOut.status === null
    && noResOut.written === false && noResOut.status === null);

  /* ───────── ④ #31 臂：同键不同 units 抛具名错·同键同 units duplicate 原语义 ───────── */
  section('④ #31 臂：idempotency_units_mismatch 具名错（非 duplicate）+同键同 units duplicate 原语义');
  const key31 = `bill3-31-${Date.now()}`;
  const first31 = await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, key31, 'mock_interview', 1));
  let mismatch31 = '';
  try {
    await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, key31, 'mock_interview', 0.5));
  } catch (error) { mismatch31 = String((error as { code?: string })?.code ?? ''); }
  const dup31 = await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, key31, 'mock_interview', 1));
  A('④ 同键不同 units→idempotency_units_mismatch 抛错（#31 静默吞撤销·begin catch 409 映射面 additive）；同键同 units→duplicate 原语义',
    first31.status === 'reserved' && mismatch31 === 'idempotency_units_mismatch'
    && dup31.status === 'duplicate');
  const unitsAfter31 = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    'SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, key31]));
  A('④ 零二次预留：同键重放后行数恒 1（幂等保不重扣面零变）', Number(unitsAfter31.rows[0]?.n) === 1);
  const unitsOut = await asPrincipal(pool, OWNER, async (c) => confirmConsumptionUnits(c, OWNER, key31, 0));
  const unitsOver = await asPrincipal(pool, OWNER, async (c) => confirmConsumptionUnits(c, OWNER, key31, 2));
  A('④ confirmConsumptionUnits 边界：units=0→units_out_of_range（零结算走 release 面）·units>预留→units_out_of_range（大声失败）',
    unitsOut.status === 'error' && unitsOut.reason === 'units_out_of_range'
    && unitsOver.status === 'error' && unitsOver.reason === 'units_out_of_range');

  /* ───────── ⑤ 零行为变更负臂（per_session 缺省全链原值·bill2 零扣费负臂的反转重申） ───────── */
  section('⑤ per_session 原值负臂：真链 completed→confirmed 1.00·abandon/sweep/fail 全退·topic_charge 零写');
  const iidLive = `bill3-live-${Date.now()}`;
  evalScript = () => 'meets';
  await beginInterview(iidLive);
  await interviewDispatchTick(deps);
  const liveStatus = await driveToDone(iidLive, (n) => GOOD_ANSWER(n));
  const conLive = await consumptionOf(iidLive);
  A('⑤-a 真链 per_session 完成：interview=completed·settled=1.00 confirmed（按场固定 1 分原值·bill2 ④臂正向重申）',
    liveStatus === 'completed' && conLive?.status === 'confirmed' && Number(conLive.units_settled) === 1);
  A('⑤-a per_session 场 topic_charge 零写（closeTopic 模式闸·明细零断档由后续刀 begin 落列后启用）',
    (await chargesOf(iidLive)).length === 0);
  const iidAbandon = `bill3-abandon-${Date.now()}`;
  await beginInterview(iidAbandon);
  const abandonedPs = await asPrincipal(pool, OWNER, async (c) => abandonInterviewAndRelease(c, OWNER, iidAbandon));
  const conAbandon = await consumptionOf(iidAbandon);
  A('⑤-b per_session 放弃全退：abandonInterviewAndRelease→released 原值·consumption released（裁决③ 仅 capped 面照收）',
    abandonedPs.status === 'abandoned' && abandonedPs.released === 'released'
    && conAbandon?.status === 'released');
  const iidSweep = `bill3-sweep-${Date.now()}`;
  await beginInterview(iidSweep);
  await interviewDispatchTick(deps);
  await asPrincipal(pool, OWNER, (c) => c.query(
    "UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2", [OWNER, iidSweep]));
  const swept = await asPrincipal(pool, OWNER, (c) => sweepExpiredReservations(c, OWNER));
  const conSweep = await consumptionOf(iidSweep);
  A('⑤-c per_session sweep 全退：租约过期 mock_interview 行 Σ=0→release 原值（拆分二选一的 Σ=0 支）',
    swept.swept.some((s) => s.idempotencyKey === iidSweep) && conSweep?.status === 'released');
  const iidFailPs = `bill3-failps-${Date.now()}`;
  await beginInterview(iidFailPs);
  const failedPs = await asPrincipal(pool, OWNER, async (c) => failInterviewAndRelease(c, OWNER, iidFailPs));
  const conFailPs = await consumptionOf(iidFailPs);
  A('⑤-d per_session fail 全退：failInterviewAndRelease→released 原值（评分失败整场全退现行语义零变）',
    failedPs.status === 'failed' && failedPs.released === 'released' && conFailPs?.status === 'released');

  console.log(`\n${failures === 0 ? '✓ bill3-settlement 全部通过' : `✗ ${failures} 失败`}`);
  await pool.end();
  if (failures > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exitCode = 1;
});
