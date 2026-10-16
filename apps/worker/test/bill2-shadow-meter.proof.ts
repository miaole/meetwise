/**
 * billing 战役 P2（BILL2-SHADOW-METER）证明：0179 topic_shadow_meter 影子计量表 + 收尾事务外围
 * fail-soft 钩子 + meter_version='shadow-v1' 增量兑现 + 零扣费零积分零结算负臂。
 *
 * 此测试只能由 `scripts/run-e2e-isolated.mjs` 在完整版本化迁移（0001→0179 全链 applied）后运行。
 * 禁止用 `packages/db/sql/` 影子 schema（影子数据库结构）伪造通过。
 * 零模型真实外呼：scriptedModelClient 假体（bill1-topic-fields.proof 同形）；零生产 DSN/零凭据落盘。
 *
 * 五臂（REQUEST §2-1）：
 *   ① 影子行写入臂：真链场（全链 consumer 驱动：clarify/unscored/出题失败/全 skip）收尾后场级行在场·
 *      五分类正确·meter_version='shadow-v1'；封顶算术与 failed_release 照实语义用**fixture 直写**
 *      （interview 终态+interview_question/interview_event 生产形行+writeTopicShadowMeter 直调·
 *      bill1 ④a recordUsage 直调同形——真链场受 canonical 能力集/early_weak 收口启发式约束，
 *      单场话题数不可确定达 7+，封顶/五分类算术归 db 写入器单ani承重·钩子集成面由真链场证明）。
 *   ② 分布聚合臂：场级 session 行聚合查询（话题数直方图桶+封顶命中判定+Σ vs cap）+成本对两列同行可比
 *      （tokens 合计=ledger 直查一致）。
 *   ③ 幂等臂：崩溃重放零重复（PK 幂等键去重·重放=false 沿 recordUsage 返回形）。
 *   ④ 零扣费负臂（本刀命门）：影子写前后 entitlement_consumption 原值恒等（per_session 结算语义零变·
 *      settled 恒 1.00 非按话题比例）·topic_charge 结算面零触（BILL3 随翻：0172 落地后翻为
 *      「表在场而本刀真链场零结算行」正向重申）·interview 计费列缺省零行为变更（BILL3 随翻同形）·
 *      0046 触发器在场零放松·402/409 零触。
 *   ⑤ fail-soft 臂：影子写注错（REVOKE INSERT）→收尾主链零阻断（事件流与对照场同形·stderr 观测在案）。
 */
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  answerHash, appendEvent, asPrincipal, assertIsolatedTestTarget, claimInterviewAnswer,
  completeIngestion, createPool, createResumeWithBlob, enqueueInterviewJob,
  reserveEntitlement, supplyCandidateProfileRoute, transitionResume,
  writeTopicShadowMeter, SHADOW_METER_VERSION, SHADOW_METER_CAP,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { createHash } from 'node:crypto';
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

const OWNER = `bill2-proof-${process.pid}`;
const RESUME = [
  '工作经历',
  '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。',
  '技能',
  'Redis、限流、分布式锁',
].join('\n');
/** 评分引文（逐字校验要求 quote ⊆ answer）：全部正常作答固定含 Redis。 */
const GOOD_ANSWER = (n: number) => `第 ${n} 轮：我会用 Redis 计数器加滑动窗口限流，超阈值降级保护下游，并压测验证。`;
/** 确定性非作答（<8 有效字符）→ 图侧直派 non_answer → clarify（零模型评分调用）。 */
const NON_ANSWER = '不知道';
/** 跳过语义作答（B 端 lifecycle 全 skip 场同形·unresolved 轨迹零 clarify）。 */
const SKIP_ANSWER = '跳过';
const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

let askSeq = 0;
let evalSeq = 0;
/** 逐场评分脚本（按全局 eval 序号分流）。'exceeds'=100→pivot / 'meets'=50→probe / 'fail'=供应商失败→unscored。 */
let evalScript: (call: number) => 'exceeds' | 'meets' | 'fail' = () => 'exceeds';
/** 出题失败注错：第 N 次 interviewer.ask 模型调用起确定性失败（generation 终态）。null=不注错。 */
let failAskOnCall: number | null = null;

const evalDisposition = (call: number) => {
  const mode = evalScript(call);
  if (mode === 'fail') return { ok: false as const, kind: 'deterministic' as const };
  return { ok: true as const, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: mode, quote: 'Redis' }] } };
};
const scripted = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: PLANNER_DEFAULT_COMPETENCIES } }),
  'interviewer.ask': () => {
    askSeq += 1;
    return { ok: true, raw: { q: `请围绕限流取舍说明做法，并给出第 ${askSeq} 轮验证方法。`, refs: [] } };
  },
  // #52 v6：模型直出 per-criterion 档位；quote 必须是回答原文子串（逐字校验门）。exceeds→100·meets→50。
  'mock-interview.evaluate': () => evalDisposition(++evalSeq),
  'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '能说明限流取舍。' }] } }),
});
/** 出题失败注错=第 N 次模型 ask 起确定性失败（probe=模型调用面·pivot=能力模板零模型调用不受影响）。 */
const model: ModelClient = {
  complete: async (req, attempt, signal) => {
    if (req.service === 'interviewer.ask') {
      askSeq += 1;
      if (failAskOnCall !== null && askSeq >= failAskOnCall) return { ok: false, kind: 'deterministic' };
    }
    return scripted.complete(req, attempt, signal);
  },
};

/** 隐私面最小 interview 行（RLS p_owner 带 interview_privacy_active 谓词·bill1 fixture 同形）。 */
async function createInterviewRow(interviewId: string): Promise<void> {
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',(SELECT id FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1),(SELECT privacy_epoch FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1))",
      [interviewId, OWNER],
    );
  });
}

/** 起一场全链面试（bill1 fixture 同形：route snapshot 生产同链供给 + 权益预留 + start 入队）。 */
async function beginInterview(interviewId: string): Promise<void> {
  await createInterviewRow(interviewId);
  await asPrincipal(pool, OWNER, async (c) => {
    const row = await c.query<{ resume_id: string }>('SELECT resume_id FROM interview WHERE id=$1', [interviewId]);
    await supplyCandidateProfileRoute(c, OWNER, interviewId, row.rows[0]!.resume_id);
    await reserveEntitlement(c, OWNER, interviewId, 'mock_interview', 1);
    await enqueueInterviewJob(c, OWNER, interviewId, 'start', { requestId: `bill2-${interviewId}` }, 0);
  });
}

const deps: ConsumerDeps = {
  pool,
  cp: new MemorySaver() as any,
  model,
  leaseOwner: `bill2-proof-worker-${process.pid}`,
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
async function driveToDone(interviewId: string, answer: (n: number) => string, guard = 30): Promise<string | undefined> {
  let status: string | undefined;
  for (let i = 0; i < guard; i++) {
    const next = await answerCurrent(interviewId, answer(i + 1));
    if (next === undefined) break;
    status = next;
    if (next === 'completed' || next === 'failed') break;
  }
  return status;
}

/** 影子行=收尾事务外围 fail-soft 异步落库——断言统一轮询收敛（上限 5s）。 */
async function waitShadowRow(interviewId: string): Promise<{ session: Record<string, any>; topics: Record<string, any>[] } | undefined> {
  const deadline = Date.now() + 5000;
  for (;;) {
    const out = await asPrincipal(pool, OWNER, async (c) => {
      const session = (await c.query(
        "SELECT * FROM topic_shadow_meter WHERE owner_user_id=$1 AND interview_id=$2 AND row_kind='session'",
        [OWNER, interviewId])).rows[0];
      const topics = (await c.query(
        "SELECT * FROM topic_shadow_meter WHERE owner_user_id=$1 AND interview_id=$2 AND row_kind='topic' ORDER BY topic_id",
        [OWNER, interviewId])).rows;
      return { session, topics };
    });
    if (out.session || Date.now() > deadline) return out.session ? { session: out.session, topics: out.topics } : undefined;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function consumptionOf(interviewId: string): Promise<Record<string, any> | undefined> {
  return (await asPrincipal(pool, OWNER, (c) => c.query(
    'SELECT status,units_requested,units_settled FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, interviewId]))).rows[0];
}

async function eventProfile(interviewId: string): Promise<Record<string, number>> {
  const ev = await asPrincipal(pool, OWNER, (c) => c.query<{ kind: string; n: number }>(
    'SELECT kind, count(*)::int n FROM interview_event WHERE stream_key=$1 GROUP BY kind', [interviewId]));
  return Object.fromEntries(ev.rows.map((r) => [r.kind, Number(r.n)]));
}

/** fixture 直写臂用：铸 1 个「已作答有效」话题（pivot+probe 两行+pivot 有效评分事件）。 */
async function seedValidTopic(interviewId: string, topicId: string, turnBase: number): Promise<void> {
  await asPrincipal(pool, OWNER, async (c) => {
    const pivotId = `${topicId}-pivot`;
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,status) VALUES ($1,$2,$3,$4,$5,'fixture 题面',$6,'pivot','answered')",
      [OWNER, interviewId, pivotId, turnBase + 1, turnBase, topicId]);
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,status) VALUES ($1,$2,$3,$4,$5,'fixture 追问',$6,'probe','answered')",
      [OWNER, interviewId, `${topicId}-probe`, turnBase + 2, turnBase + 1, topicId]);
    await appendEvent(c, OWNER, interviewId, 'answer_evaluated', { questionId: pivotId, outcome: 'answered', score: 80 }, `answer_evaluated:${pivotId}`);
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

  /* ───────── ⓪ 迁移臂：0179 表形/CHECK 负臂 23514/RLS FORCE/只授 SELECT,INSERT ───────── */
  section('⓪ 迁移臂：0179 topic_shadow_meter 表形+CHECK 负臂+RLS FORCE+app_role 仅 SELECT/INSERT');
  const shape = await asPrincipal(pool, OWNER, (c) => c.query<{
    relforcerowsecurity: boolean; pk: string;
  }>(
    `SELECT c.relforcerowsecurity,
            (SELECT pg_get_constraintdef(oid) FROM pg_constraint
              WHERE conrelid='public.topic_shadow_meter'::regclass AND contype='p') AS pk
       FROM pg_class c WHERE c.oid='public.topic_shadow_meter'::regclass`));
  A('0179 → topic_shadow_meter 在场·RLS FORCE·PK(owner_user_id,interview_id,idem_key) 沿 0171 同形',
    shape.rows[0]?.relforcerowsecurity === true
    && String(shape.rows[0]?.pk).includes('owner_user_id')
    && String(shape.rows[0]?.pk).includes('interview_id')
    && String(shape.rows[0]?.pk).includes('idem_key'));
  const checkDefs = await asPrincipal(pool, OWNER, (c) => c.query<{ conname: string; def: string }>(
    "SELECT conname, pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid='public.topic_shadow_meter'::regclass AND contype='c'"));
  const allDefs = checkDefs.rows.map((r) => r.def).join(' | ');
  A('0179 → status 五值 CHECK（counted/counted_capped/waived/skipped/failed_release·§1.3 现行语义照实）',
    ['counted', 'counted_capped', 'waived', 'skipped', 'failed_release'].every((v) => allDefs.includes(`'${v}'`)));
  A('0179 → 命名表级 CHECK 五件在场（idem 一致性/topic status/kind 列/守恒·0170 命名约束形制）',
    ['ck_tsm_topic_id_pair', 'ck_tsm_topic_identity', 'ck_tsm_topic_status_present', 'ck_tsm_kind_columns', 'ck_tsm_session_conservation']
      .every((n) => checkDefs.rows.some((r) => r.conname === n)));
  const grants = await asPrincipal(pool, OWNER, (c) => c.query<{ sel: boolean; ins: boolean; upd: boolean; del: boolean }>(
    `SELECT has_table_privilege('app_role','topic_shadow_meter','SELECT') sel,
            has_table_privilege('app_role','topic_shadow_meter','INSERT') ins,
            has_table_privilege('app_role','topic_shadow_meter','UPDATE') upd,
            has_table_privilege('app_role','topic_shadow_meter','DELETE') del`));
  const g = grants.rows[0];
  A('0179 → app_role 仅授 SELECT/INSERT（UPDATE/DELETE 零授权·影子面只增不改·0171 :36 形制范本）',
    g?.sel === true && g?.ins === true && g?.upd === false && g?.del === false);
  const iidNeg = `bill2-neg-${Date.now()}`;
  await createInterviewRow(iidNeg);
  let badStatus = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO topic_shadow_meter(owner_user_id,interview_id,row_kind,topic_id,idem_key,status,meter_version) VALUES ($1,$2,'topic','t1','t1','counted_settled','shadow-v1')",
      [OWNER, iidNeg]));
  } catch (error) { badStatus = String((error as { code?: string })?.code ?? ''); }
  A('0179 CHECK 负臂：status 第六值 INSERT→23514', badStatus === '23514');
  let badKind = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO topic_shadow_meter(owner_user_id,interview_id,row_kind,topic_id,idem_key,status,meter_version) VALUES ($1,$2,'topic',NULL,'k','counted','shadow-v1')",
      [OWNER, iidNeg]));
  } catch (error) { badKind = String((error as { code?: string })?.code ?? ''); }
  A('0179 CHECK 负臂：topic 行 topic_id NULL→23514（row_kind/topic_id 一致性守卫）', badKind === '23514');
  let badConservation = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO topic_shadow_meter(owner_user_id,interview_id,row_kind,topic_id,idem_key,status,meter_version,topics_total,topics_counted,topics_capped,topics_waived,topics_skipped,topics_failed_release) VALUES ($1,$2,'session',NULL,'session',NULL,'shadow-v1',5,1,0,0,0,0)",
      [OWNER, iidNeg]));
  } catch (error) { badConservation = String((error as { code?: string })?.code ?? ''); }
  A('0179 CHECK 负臂：session 行五分类计数不守恒→23514（数据质量守恒由迁移承重）', badConservation === '23514');
  let updDenied = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE topic_shadow_meter SET status='waived' WHERE owner_user_id=$1", [OWNER]));
  } catch (error) { updDenied = String((error as { code?: string })?.code ?? ''); }
  let delDenied = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      'DELETE FROM topic_shadow_meter WHERE owner_user_id=$1', [OWNER]));
  } catch (error) { delDenied = String((error as { code?: string })?.code ?? ''); }
  A('0179 负臂：app_role UPDATE/DELETE→42501（影子行写后不可篡改·只增不改 live 臂）',
    updDenied === '42501' && delDenied === '42501');

  /* ───────── ①-A 封顶算术臂（fixture 直写：8 话题全有效→6 counted+2 counted_capped·cap_hit） ───────── */
  section('①-A 封顶算术臂：8 话题全有效场→6 counted+2 counted_capped·cap_hit·cap_value=6·meter_version=shadow-v1');
  const iidA = `bill2-a-${Date.now()}`;
  await createInterviewRow(iidA);
  await asPrincipal(pool, OWNER, async (c) => {
    for (let i = 0; i < 8; i++) await seedValidTopic(iidA, `bill2-a-t${i}`, i * 2);
    await c.query("UPDATE interview SET status='completed' WHERE id=$1 AND owner_user_id=$2", [iidA, OWNER]);
  });
  const wroteA = await asPrincipal(pool, OWNER, (c) => writeTopicShadowMeter(c, OWNER, iidA, {}));
  const shadowA = await waitShadowRow(iidA);
  A('A 写入返回 true（首写·recordUsage 返回形）·场级 session 行在场',
    wroteA === true && !!shadowA);
  A('A 封顶算术：topics_total=8·counted=6·capped=2·sum_uncapped=8·cap_hit=true（§11-3 初值 6 命中）',
    !!shadowA && Number(shadowA.session.topics_total) === 8
    && Number(shadowA.session.topics_counted) === 6 && Number(shadowA.session.topics_capped) === 2
    && Number(shadowA.session.sum_uncapped) === 8 && shadowA.session.cap_hit === true);
  A('A 观测列：cap_value=6·meter_version=shadow-v1·五分类守恒·ask_mode 摘要含 pivot+probe·answers/question_count 在场',
    !!shadowA && Number(shadowA.session.cap_value) === SHADOW_METER_CAP
    && shadowA.session.meter_version === SHADOW_METER_VERSION
    && Number(shadowA.session.topics_total) === Number(shadowA.session.topics_counted)
      + Number(shadowA.session.topics_capped) + Number(shadowA.session.topics_waived)
      + Number(shadowA.session.topics_skipped) + Number(shadowA.session.topics_failed_release)
    && shadowA.topics.length === 8
    && shadowA.topics.every((t) => String(t.ask_mode).includes('pivot') && String(t.ask_mode).includes('probe'))
    && Number(shadowA.topics[0]?.answers) === 2 && Number(shadowA.topics[0]?.question_count) === 2);
  A('A 封顶序：rn=前 6 话题（首题 turn 升序）counted·第 7/8 话题 counted_capped（0 分模拟）',
    !!shadowA
    && shadowA.topics.filter((t) => t.status === 'counted').every((t) => Number(t.question_count) === 2)
    && shadowA.topics.filter((t) => t.status === 'counted_capped').length === 2);

  /* ───────── ①-B 真链澄清场（meets→probe·clarify 摘要观测·零封顶） ───────── */
  section('①-B 真链影子行写入臂：clarify 澄清场→全话题 counted·clarify_cause 摘要观测·cap_hit=false');
  const iidB = `bill2-b-${Date.now()}`;
  evalSeq = 0;
  askSeq = 0;
  evalScript = () => 'meets';
  failAskOnCall = null;
  await beginInterview(iidB);
  await interviewDispatchTick(deps);
  await answerCurrent(iidB, NON_ANSWER);   // 非作答 → clarify 重发（零评分调用）
  A('B 非作答 → clarify 重发照常（clarification_needed 恰 1·既有事件面零变）',
    (await eventProfile(iidB))['clarification_needed'] === 1);
  A('B 全链收尾：interview=completed（clarify 后 meets→probe 链至收尾）',
    await driveToDone(iidB, (n) => GOOD_ANSWER(n)) === 'completed');
  const shadowB = await waitShadowRow(iidB);
  A('B session 行（收尾钩子写入）：topics_total≥1·全话题 counted·capped=0·cap_hit=false·sum_uncapped=total',
    !!shadowB && Number(shadowB.session.topics_total) >= 1
    && Number(shadowB.session.topics_counted) === Number(shadowB.session.topics_total)
    && Number(shadowB.session.topics_capped) === 0 && shadowB.session.cap_hit === false
    && Number(shadowB.session.sum_uncapped) === Number(shadowB.session.topics_total));
  A('B 澄清话题行：clarify_cause 摘要=non_answer（0170 双因透传进观测列）·answers/question_count 在场',
    !!shadowB && shadowB.topics.some((t) => String(t.clarify_cause ?? '') === 'non_answer'
      && Number(t.question_count) >= 2 && Number(t.answers) >= 1));

  /* ───────── ①-C failed_release 照实臂（fixture：混合 unscored 收尾臂终态=failed） ───────── */
  section('①-C failed_release 照实臂：failed 终态（无 generation reason=混合 unscored fail+release 臂）→全话题 failed_release');
  const iidC = `bill2-c-${Date.now()}`;
  await createInterviewRow(iidC);
  await asPrincipal(pool, OWNER, async (c) => {
    await seedValidTopic(iidC, `bill2-c-t0`, 0);
    await seedValidTopic(iidC, `bill2-c-t1`, 2);
    await c.query("UPDATE interview SET status='failed' WHERE id=$1 AND owner_user_id=$2", [iidC, OWNER]);
  });
  await asPrincipal(pool, OWNER, (c) => writeTopicShadowMeter(c, OWNER, iidC, {}));
  const shadowC = await waitShadowRow(iidC);
  A('C session 行：topics_total=2·failed_release=2 照实（counted=0·sum_uncapped=0·cap_hit=false）',
    !!shadowC && Number(shadowC.session.topics_total) === 2
    && Number(shadowC.session.topics_failed_release) === 2 && Number(shadowC.session.topics_counted) === 0
    && Number(shadowC.session.sum_uncapped) === 0 && shadowC.session.cap_hit === false);
  A('C 逐话题行全 failed_release（照实反映 fail+release 场的话题分布=P3 改写前实测基线·0046 钉死面零改写）',
    !!shadowC && shadowC.topics.length === 2 && shadowC.topics.every((t) => t.status === 'failed_release'));

  /* ───────── ①-C2 出题失败照收+waived 混合臂（fixture：generation reason 在场） ───────── */
  section('①-C2 出题失败照收+waived 臂：failed 终态+generation reason→有效作答话题 counted（照收）+无有效作答话题 waived+reason');
  const iidC2 = `bill2-c2-${Date.now()}`;
  await createInterviewRow(iidC2);
  await asPrincipal(pool, OWNER, async (c) => {
    await seedValidTopic(iidC2, `bill2-c2-t0`, 0);
    await seedValidTopic(iidC2, `bill2-c2-t1`, 2);
    // 无有效作答话题（pivot 已发行无评分事件——出题失败时该话题 0 分照实）
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,topic_id,ask_mode,status) VALUES ($1,$2,$3,$4,4,'fixture 未答话题',$5,'pivot','answered')",
      [OWNER, iidC2, `bill2-c2-t2-pivot`, 5, `bill2-c2-t2`]);
    await c.query("UPDATE interview SET status='failed' WHERE id=$1 AND owner_user_id=$2", [iidC2, OWNER]);
  });
  await asPrincipal(pool, OWNER, (c) => writeTopicShadowMeter(c, OWNER, iidC2, { generationReason: 'generation_business_invalid' }));
  const shadowC2 = await waitShadowRow(iidC2);
  A('C2 session 行：topics_total=3·counted=2（照收）·waived=1（该话题 0 分）·sum_uncapped=2',
    !!shadowC2 && Number(shadowC2.session.topics_total) === 3
    && Number(shadowC2.session.topics_counted) === 2 && Number(shadowC2.session.topics_waived) === 1
    && Number(shadowC2.session.sum_uncapped) === 2 && shadowC2.session.cap_hit === false);
  A('C2 逐话题行：有效话题 counted·无有效作答话题 waived+reason=generation_*（裁决③ 照收+0 分照实同行并存）',
    !!shadowC2 && shadowC2.topics.length === 3
    && shadowC2.topics.filter((t) => t.status === 'counted').length === 2
    && shadowC2.topics.filter((t) => t.status === 'waived').length === 1
    && String(shadowC2.topics.find((t) => t.status === 'waived')?.reason ?? '').startsWith('generation_'));

  /* ───────── ①-D 真链混合 unscored 场（AG-F 0 分继续→收尾面·unscored 事件在案） ───────── */
  section('①-D 真链混合 unscored 场：首答评分失败→unscored 事件在案·interview=failed（现行收尾语义零变）');
  const iidD = `bill2-d-${Date.now()}`;
  const dFailCall = evalSeq + 1;   // 首答评分失败→unscored（捕获窗口·防闭包读活值）
  evalScript = (call) => (call === dFailCall ? 'fail' : 'exceeds');
  failAskOnCall = null;
  await beginInterview(iidD);
  await interviewDispatchTick(deps);
  const dStatus = await driveToDone(iidD, (n) => GOOD_ANSWER(n));
  const dRow = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [iidD]));
  A('D 收尾：混合 unscored → interview=failed（现行收尾语义零变·unscored 事件在案）',
    dRow.rows[0]?.status === 'failed'
    && (await eventProfile(iidD))['answer_unscored'] === 1
    && (dStatus === 'failed' || dStatus === undefined));
  const shadowD = await waitShadowRow(iidD);
  A('D 影子行在场：收尾钩子照实落行（五分类守恒·meter_version=shadow-v1）',
    !!shadowD && Number(shadowD.session.topics_total) >= 1
    && shadowD.session.meter_version === SHADOW_METER_VERSION
    && Number(shadowD.session.topics_total) === Number(shadowD.session.topics_counted)
      + Number(shadowD.session.topics_capped) + Number(shadowD.session.topics_waived)
      + Number(shadowD.session.topics_skipped) + Number(shadowD.session.topics_failed_release));

  /* ───────── ①-E 真链照收场（已计话题后出题失败→已完成话题 counted·裁决③） ───────── */
  section('①-E 真链照收场：已计话题后 probe 注错→generation 终态·已完成话题 counted（裁决③ 系统原因提前结束=照收）');
  const iidE = `bill2-e-${Date.now()}`;
  const eFirstCall = evalSeq + 1;   // 首答 exceeds 计 1 题·其后 meets→probe 链（捕获窗口·防闭包读活值）
  evalScript = (call) => (call === eFirstCall ? 'exceeds' : 'meets');
  failAskOnCall = 1;   // 第 1 次模型 ask（首话题 probe）注错→generation 终态
  await beginInterview(iidE);
  await interviewDispatchTick(deps);
  const eStatus = await driveToDone(iidE, (n) => GOOD_ANSWER(n));
  const eRow = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [iidE]));
  A('E 收尾：已计话题后出题失败 → interview=failed（generation 终态臂·fail+release）',
    eRow.rows[0]?.status === 'failed' && (eStatus === 'failed' || eStatus === undefined));
  const shadowE = await waitShadowRow(iidE);
  A('E 话题行：已完成话题照收 counted（非 waived 非 failed_release·裁决③ 照收语义）',
    !!shadowE && Number(shadowE.session.topics_counted) >= 1
      && Number(shadowE.session.topics_waived) === 0
      && Number(shadowE.session.topics_failed_release) === 0
      && shadowE.topics.every((t) => t.status === 'counted')
      && shadowE.topics.every((t) => Number(t.answers) >= 1));
  A('E session 行：counted=sum_uncapped≥1（照收入 Σ·cap_hit=false）',
    !!shadowE && Number(shadowE.session.topics_counted) === Number(shadowE.session.sum_uncapped)
    && Number(shadowE.session.sum_uncapped) >= 1 && shadowE.session.cap_hit === false);

  /* ───────── ①-G 真链全 skip 场（skipped·branch-2 no_eligible 零触） ───────── */
  section('①-G 真链全 skip 场：全 skip/unresolved → completed+no_eligible 语义零变·全话题 skipped');
  const iidG = `bill2-g-${Date.now()}`;
  evalScript = () => 'exceeds';
  failAskOnCall = null;
  await beginInterview(iidG);
  await interviewDispatchTick(deps);
  const gStatus = await driveToDone(iidG, () => SKIP_ANSWER);
  const gRow = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [iidG]));
  A('G 收尾：全 skip/unresolved → completed（branch-2 收口语义零变·非 failed）',
    gRow.rows[0]?.status === 'completed' && (gStatus === 'completed' || gStatus === undefined));
  const shadowG = await waitShadowRow(iidG);
  A('G session+话题行：全话题 skipped 照实（跳过 0 分·unscored 臂零触·eligible=0 照收面零变）',
    !!shadowG && Number(shadowG.session.topics_total) >= 1
    && Number(shadowG.session.topics_skipped) === Number(shadowG.session.topics_total)
    && Number(shadowG.session.topics_counted) === 0
    && shadowG.topics.length === Number(shadowG.session.topics_total)
    && shadowG.topics.every((t) => t.status === 'skipped'));

  /* ───────── meter_version 增量兑现臂（0171 预留列「P2 起填」·存量 NULL 零回填） ───────── */
  section('meter_version 兑现臂：0171 归集行 P2 起填 shadow-v1（调用面增量·零回填语句）');
  const metered = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number; unmetered: number }>(
    `SELECT count(*)::int n, count(*) FILTER (WHERE meter_version IS NULL)::int unmetered
       FROM question_usage_ledger WHERE owner_user_id=$1 AND interview_id=$2`, [OWNER, iidB]));
  A('B 场归集行全部 meter_version=shadow-v1（plan/ask/eval 三挂点增量兑现）',
    Number(metered.rows[0]?.n) >= 3 && Number(metered.rows[0]?.unmetered) === 0);

  /* ───────── ② 分布聚合臂（直方图桶+封顶命中+Σ vs cap+成本对） ───────── */
  section('② 分布聚合臂：场级聚合查询——话题数直方图+封顶命中判定+Σ vs cap+tokens 成本对同行可比');
  const histogram = await asPrincipal(pool, OWNER, (c) => c.query<{ topics_total: number; fields: number; cap_hit_fields: number }>(
    `SELECT topics_total, count(*)::int fields, count(*) FILTER (WHERE cap_hit)::int cap_hit_fields
       FROM topic_shadow_meter WHERE owner_user_id=$1 AND row_kind='session'
      GROUP BY topics_total ORDER BY topics_total`, [OWNER]));
  const sessions = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number; cap_hit_n: number; max_total: number }>(
    `SELECT count(*)::int n, count(*) FILTER (WHERE cap_hit)::int cap_hit_n, COALESCE(max(topics_total),0)::int max_total
       FROM topic_shadow_meter WHERE owner_user_id=$1 AND row_kind='session'`, [OWNER]));
  A('直方图桶：恰 7 场 session 行（A/B/C/C2/D/E/G）·最大话题数场=8',
    Number(sessions.rows[0]?.n) === 7 && Number(sessions.rows[0]?.max_total) === 8);
  A('封顶命中判定：cap_hit 场恰 1（仅 8 话题场·§13-4 命中率数据面）',
    Number(sessions.rows[0]?.cap_hit_n) === 1
    && histogram.rows.filter((r) => Number(r.cap_hit_fields) > 0).length === 1);
  const costPairs = await asPrincipal(pool, OWNER, (c) => c.query<{ interview_id: string; input_tokens_sum: number; output_tokens_sum: number; ledger_in: number; ledger_out: number }>(
    `SELECT s.interview_id, s.input_tokens_sum, s.output_tokens_sum,
            COALESCE(l.ledger_in,0) ledger_in, COALESCE(l.ledger_out,0) ledger_out
       FROM topic_shadow_meter s
       LEFT JOIN (SELECT interview_id, sum(input_tokens)::bigint ledger_in, sum(output_tokens)::bigint ledger_out
                    FROM question_usage_ledger WHERE owner_user_id=$1 GROUP BY interview_id) l
         ON l.interview_id = s.interview_id
      WHERE s.owner_user_id=$1 AND s.row_kind='session' ORDER BY s.interview_id`, [OWNER]));
  A('成本对两列同行可比且=ledger 直查一致（tokens 合计逐场恒等·一次聚合双列同出）',
    costPairs.rows.length === 7 && costPairs.rows.every((r) =>
      Number(r.input_tokens_sum) === Number(r.ledger_in) && Number(r.output_tokens_sum) === Number(r.ledger_out)));
  const sumCap = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number; bad: number }>(
    `SELECT count(*)::int n, count(*) FILTER (WHERE sum_uncapped > cap_value AND NOT cap_hit)::int bad
       FROM topic_shadow_meter WHERE owner_user_id=$1 AND row_kind='session'`, [OWNER]));
  A('Σ vs cap 全场自洽：sum_uncapped>cap ⇒ cap_hit（LEAST(Σ,cap) 模拟口径守恒）',
    Number(sumCap.rows[0]?.n) === 7 && Number(sumCap.rows[0]?.bad) === 0);

  /* ───────── ③ 幂等臂（崩溃重放零重复·重放=false） ───────── */
  section('③ 幂等臂：PK 幂等键去重——重放返回 false·行数零增长');
  const beforeReplay = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    'SELECT count(*)::int n FROM topic_shadow_meter WHERE owner_user_id=$1 AND interview_id=$2', [OWNER, iidA]));
  const replay = await asPrincipal(pool, OWNER, (c) =>
    writeTopicShadowMeter(c, OWNER, iidA, {}));
  const afterReplay = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    'SELECT count(*)::int n FROM topic_shadow_meter WHERE owner_user_id=$1 AND interview_id=$2', [OWNER, iidA]));
  A('A 场重放：writeTopicShadowMeter→false（recordUsage :77 返回形）·行数零增长',
    replay === false && Number(beforeReplay.rows[0]?.n) === Number(afterReplay.rows[0]?.n));
  const firstWrite = await asPrincipal(pool, OWNER, (c) =>
    writeTopicShadowMeter(c, OWNER, `bill2-fresh-${Date.now()}`, {}));
  A('零话题行场（无 interview_question 话题行）→零写返回 false（诚实无数据面）', firstWrite === false);

  /* ───────── ④ 零扣费负臂（本刀命门·BILL3 随翻注记：topic_charge/计费列两枚「未落」负臂的前提已由
     P3（0172/0173）兑现落地面翻新为「在场但 per_session 行为零变」正向重申——零扣费铁律本体不变·臂数 44 恒定） ───────── */
  section('④ 零扣费负臂：entitlement_consumption 原值恒等+topic_charge 结算零写+计费列缺省零行为变更+0046 零放松');
  const consumptionAfter = await consumptionOf(iidB);
  await new Promise((resolve) => setTimeout(resolve, 400));   // 影子写（异步）落定后再采一次
  const consumptionFinal = await consumptionOf(iidB);
  A('B 场 entitlement_consumption：completed→confirmed·units_settled=1.00（per_session 既有语义·非按话题比例 r2(1×1/6)）',
    consumptionAfter?.status === 'confirmed' && Number(consumptionAfter?.units_settled) === 1
    && JSON.stringify(consumptionAfter) === JSON.stringify(consumptionFinal));
  const consumptionD = await consumptionOf(iidD);
  const consumptionE = await consumptionOf(iidE);
  A('失败场 released：consumption 终态值域零越界（402/409 分码路径零触·零新错误态·影子写零改）',
    consumptionD?.status === 'released' && Number(consumptionD?.units_settled ?? 0) === 0
    && consumptionE?.status === 'released' && Number(consumptionE?.units_settled ?? 0) === 0);
  // BILL3 随翻（原臂「topic_charge 关系不存在（0172 未落亲证）」的前提由 P3 落地兑现——反转为：
  // 表已落（0172）但 per_session 真链场**零结算行**+消费行原值恒等=「只算不扣→结算面不触 per_session 场」正向重申）。
  const chargePresentAndEmpty = await asPrincipal(pool, OWNER, (c) => c.query<{ present: boolean; ownRows: string }>(
    `SELECT to_regclass('public.topic_charge') IS NOT NULL AS present,
            COALESCE((SELECT count(*)::text FROM topic_charge WHERE owner_user_id=$1), 'n/a') AS "ownRows"`, [OWNER]));
  A('topic_charge 在场（0172 已落·BILL3）而本刀全部真链场零结算行+零扣费（只算不扣铁律在结算落地面仍恒真）',
    chargePresentAndEmpty.rows[0]?.present === true && String(chargePresentAndEmpty.rows[0]?.ownRows) === '0');
  // BILL3 随翻（原臂「计费列全缺」→ 三列在场但缺省 per_session/cap NULL=「零 billing_mode 出手」正向重申）。
  const billingCols = await asPrincipal(pool, OWNER, (c) => c.query<{ perSessionDefaults: boolean }>(
    `SELECT NOT EXISTS (
       SELECT 1 FROM information_schema.columns
        WHERE table_name='interview' AND column_name IN ('billing_mode','billing_cap_units','billing_rule_version')
     ) OR NOT EXISTS (
       SELECT 1 FROM interview WHERE owner_user_id=$1
         AND (billing_mode IS DISTINCT FROM 'per_session' OR billing_cap_units IS NOT NULL OR billing_rule_version IS NOT NULL)
     ) AS "perSessionDefaults"`, [OWNER]));
  A('interview 计费列缺省零行为变更（billing_mode 恒 per_session/cap 与 rule_version 恒 NULL·零 billing_mode 出手）',
    billingCols.rows[0]?.perSessionDefaults === true);
  const trigger0046 = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    "SELECT count(*)::int n FROM pg_trigger WHERE tgname='trg_interview_scoring_completion_integrity'"));
  A('0046 结算完整性触发器在场（零放松·混合 unscored=failed_release 照实=C 臂实证）',
    Number(trigger0046.rows[0]?.n) === 1);

  /* ───────── ⑤ fail-soft 臂（影子写注错→收尾主链零阻断） ───────── */
  section('⑤ fail-soft 臂：REVOKE INSERT 注错→收尾主链零阻断·事件流与对照场同形·stderr 观测在案');
  const shadowErrors: string[] = [];
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const line = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    if (line.includes('topic_shadow_meter_write_failed')) shadowErrors.push(line);
    origConsoleError(...args);
  };
  const iidF = `bill2-f-${Date.now()}`;
  await pool.query('REVOKE INSERT ON topic_shadow_meter FROM app_role');   // 表属主（迁移连接同身份）直授管——注错注入
  try {
    evalScript = () => 'meets';
    failAskOnCall = null;
    await beginInterview(iidF);
    await interviewDispatchTick(deps);
    await answerCurrent(iidF, NON_ANSWER);
    const fStatus = await driveToDone(iidF, (n) => GOOD_ANSWER(n));
    const fRow = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [iidF]));
    const fReport = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
      'SELECT count(*)::int n FROM ai_report WHERE interview_id=$1', [iidF]));
    const deadline = Date.now() + 5000;
    while (shadowErrors.length === 0 && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 50));
    const fShadow = await waitShadowRow(iidF);
    const profileB = await eventProfile(iidB);
    const profileF = await eventProfile(iidF);
    A('F 注错场收尾零阻断：interview=completed·报告照常入队（fail-soft 零业务升级）',
      fRow.rows[0]?.status === 'completed' && (fStatus === 'completed' || fStatus === undefined)
      && Number(fReport.rows[0]?.n) === 1);
    A('F 注错场影子行零写入（写失败即缺席·零部分写零脏数据）', fShadow === undefined);
    A('F 事件流与对照场 B 同形（kind 计数逐键恒等·收尾主链逐位恒等）',
      Object.keys(profileB).sort().join(',') === Object.keys(profileF).sort().join(',')
      && Object.keys(profileB).every((k) => profileB[k] === profileF[k]));
    A('stderr 观测在案：topic_shadow_meter_write_failed 恰被记录（审计面可见性·零静默吞错）',
      shadowErrors.length >= 1 && shadowErrors.every((l) => l.includes(iidF)));
  } finally {
    console.error = origConsoleError;
    await pool.query('GRANT INSERT ON topic_shadow_meter TO app_role');   // 权限复原
  }
  const grantedBack = await asPrincipal(pool, OWNER, (c) => c.query<{ ins: boolean }>(
    "SELECT has_table_privilege('app_role','topic_shadow_meter','INSERT') ins"));
  A('权限复原：GRANT INSERT 回写（注错面零残留）', grantedBack.rows[0]?.ins === true);

  console.log(`\n${failures === 0 ? '✓ bill2-shadow-meter 全部通过' : `✗ ${failures} 失败`}`);
  await pool.end();
  if (failures > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exitCode = 1;
});
