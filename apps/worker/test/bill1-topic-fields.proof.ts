/**
 * billing 战役 P1（BILL1-TOPIC-FIELDS）证明：0170 interview_question 话题三列 + 0171
 * question_usage_ledger 消耗归集 + clarify_cause 双因透传 + usage_missing='missing' 衔接。
 *
 * 此测试只能由 `scripts/run-e2e-isolated.mjs` 在完整版本化迁移（0001→0171 全链 applied）后运行。
 * 禁止用 `packages/db/sql/` 影子 schema（影子数据库结构）伪造通过。
 * 零模型真实外呼：scriptedModelClient 假体（interview.proof 同形）；上游 usage 行用生产形
 * claim/dispatch/complete 函数铸造（0088 state guard 禁直插）；零生产 DSN/零凭据落盘。
 *
 * 五臂（REQUEST §2-1）：
 *   ① 迁移臂：0170 三列/CHECK 负臂（23514）/partial 索引；0171 PK+RLS FORCE+app_role 仅 SELECT/INSERT（42501 负臂）。
 *   ② topic_id 填充臂：pivot=自己 / probe=主问题 id / clarify=主问题 id+ask_mode='clarify'。
 *   ③ clarify_cause 双因臂：非作答→'non_answer' / 引文核验失败→'quote_unverifiable'（既有 score/relevant 逐位零变负臂）。
 *   ④ usage 账本臂：plan/ask/eval 各落一行·PK 去重·usage_missing→'missing' 映射·失败臂 cause 正确。
 *   ⑤ 旧行兼容臂：存量行（无新列值）topic_id/ask_mode/clarify_cause IS NULL=不按话题计费语义保留。
 */
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  answerHash, asPrincipal, assertIsolatedTestTarget, claimInterviewAnswer, claimModelInvocation,
  completeIngestion, completeModelInvocation, createPool, createResumeWithBlob, enqueueInterviewJob,
  failModelInvocationClaim, markModelInvocationDispatched, recordUsage, reserveEntitlement,
  supplyCandidateProfileRoute, transitionResume,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { createHash } from 'node:crypto';
import { ingestResume } from '@meetwise/domain';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';
import { usageCauseForInvokeError } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER = `bill1-proof-${process.pid}`;
const RESUME = [
  '工作经历',
  '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。',
  '技能',
  'Redis、限流、分布式锁',
].join('\n');
/** 评分引文（逐字校验要求 quote ⊆ answer）：全部正常作答固定含 Redis。 */
const GOOD_ANSWER = (n: number) => `第 ${n} 轮：我会用 Redis 计数器加滑动窗口限流，超阈值降级保护下游，并压测验证。`;
/** 引文核验失败假体：quote 不在答案正文 → business:evidence_quote_not_in_answer → quote_repair_exhausted。 */
const BAD_QUOTE = '本句绝不出现在任何答案正文字样XYZ';
const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

let askSeq = 0;
let evalSeq = 0;
/** 逐面试评分脚本（按全局 eval 序号分流；每场开跑前重置窗口）。 */
let evalScript: (call: number) => 'good' | 'badquote' = () => 'good';
let plannerFail = false;
const model: ModelClient = scriptedModelClient({
  'planner.competencies': () => plannerFail
    ? { ok: false, kind: 'deterministic' }
    : { ok: true, raw: { competencies: ['高并发', '系统设计', '数据库'] } },
  'interviewer.ask': () => ({ ok: true, raw: { q: `请说明高并发限流的取舍，并给出第 ${++askSeq} 轮验证方法。`, refs: [] } }),
  // #52 v6：模型直出 per-criterion 档位；quote 必须是回答原文子串（逐字校验门）。'meets'→确定性 50 分。
  'mock-interview.evaluate': () => {
    const call = ++evalSeq;
    return evalScript(call) === 'badquote'
      ? { ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'meets', quote: BAD_QUOTE }] } }
      : { ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'meets', quote: 'Redis' }] } };
  },
  'report.generate': () => ({ ok: true, raw: { overall: 80, sections: [{ title: '总评', body: '能说明限流取舍。' }] } }),
});

/** 隐私面最小 interview 行（负臂 23514 需 privacy-active interview：RLS p_owner 带 interview_privacy_active 谓词）。 */
async function createInterviewRow(interviewId: string): Promise<void> {
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',(SELECT id FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1),(SELECT privacy_epoch FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1))",
      [interviewId, OWNER],
    );
  });
}

/** 起一场全链面试（interview.proof 同 fixture：route snapshot 生产同链供给 + 权益预留 + start 入队）。 */
async function beginInterview(interviewId: string): Promise<void> {
  await createInterviewRow(interviewId);
  await asPrincipal(pool, OWNER, async (c) => {
    const row = await c.query<{ resume_id: string }>('SELECT resume_id FROM interview WHERE id=$1', [interviewId]);
    await supplyCandidateProfileRoute(c, OWNER, interviewId, row.rows[0]!.resume_id);
    await reserveEntitlement(c, OWNER, interviewId, 'mock_interview', 1);
    await enqueueInterviewJob(c, OWNER, interviewId, 'start', { requestId: `bill1-${interviewId}` }, 0);
  });
}

const deps: ConsumerDeps = {
  pool,
  cp: new MemorySaver() as any,
  model,
  leaseOwner: `bill1-proof-worker-${process.pid}`,
  adaptive: {
    role: '后端工程师',
    maxTurns: 2,
    absoluteMaxTurns: 2,
    localRetrieve: async () => [],
    webExplore: async () => [],
  },
};

/** 驱动一轮作答（API 身份领取 → answer 入队 → 消费拍）；返回面试是否已完成。 */
async function answerCurrent(interviewId: string, answer: string): Promise<boolean> {
  const q = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{
      question_id: string; state_version: number; turn: number;
    }>(
      "SELECT question_id,state_version,turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1",
      [interviewId],
    );
    return rows.rows[0];
  });
  if (!q) return true;
  const input = {
    questionId: q.question_id, stateVersion: Number(q.state_version), turn: Number(q.turn),
    answerId: randomUUID(), answerHash: answerHash(answer), answer,
  };
  const claimed = await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, interviewId, input));
  if (claimed.status !== 'accepted' && claimed.status !== 'replayed') throw new Error(`claim_${claimed.status}`);
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, interviewId, 'answer', input, input.turn + 1));
  await interviewDispatchTick(deps);
  const row = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM interview WHERE id=$1', [interviewId]));
  return row.rows[0]?.status === 'completed';
}

/** recordUsageSoft=审计面异步落库（fail-soft）——账本行断言统一轮询收敛（上限 5s）。 */
async function ledgerCount(interviewId: string, where: string): Promise<number> {
  const deadline = Date.now() + 5000;
  for (;;) {
    const n = await asPrincipal(pool, OWNER, async (c) => {
      const rows = await c.query<{ n: number }>(
        `SELECT count(*)::int n FROM question_usage_ledger WHERE owner_user_id=$1 AND interview_id=$2 AND ${where}`,
        [OWNER, interviewId]);
      return Number(rows.rows[0]?.n);
    });
    if (n > 0 || Date.now() > deadline) return n;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',9.0,now()+interval '30 days')",
      [OWNER],
    );
    const created = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, created.resumeId, ingestResume(RESUME));
  });

  /* ───────── ① 迁移臂（0170 三列 + CHECK 负臂 + partial 索引；0171 PK/RLS/最小授权） ───────── */
  section('① 迁移臂：0170 三列 + CHECK 负臂 23514 + ix_iq_topic；0171 PK/RLS FORCE/只授 SELECT,INSERT');
  const cols = await asPrincipal(pool, OWNER, (c) => c.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_name='interview_question' AND column_name IN ('topic_id','ask_mode','clarify_cause')"));
  A('0170 → interview_question 三列在场(topic_id/ask_mode/clarify_cause)', cols.rowCount === 3);
  const iidNeg = `bill1-neg-${Date.now()}`;
  await createInterviewRow(iidNeg);   // RLS p_owner 含 interview_privacy_active 谓词 → 负臂需 privacy-active interview
  let badAskMode = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,ask_mode) VALUES ($1,$2,'bill1-neg-q1',1,0,'q','followup')",
      [OWNER, iidNeg]));
  } catch (error) { badAskMode = String((error as { code?: string })?.code ?? ''); }
  A('0170 CHECK 负臂：ask_mode 第四值 INSERT→23514', badAskMode === '23514');
  let badCause = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,clarify_cause) VALUES ($1,$2,'bill1-neg-q2',1,0,'q','model_rambled')",
      [OWNER, iidNeg]));
  } catch (error) { badCause = String((error as { code?: string })?.code ?? ''); }
  A('0170 CHECK 负臂：clarify_cause 非空第三值 INSERT→23514', badCause === '23514');
  const idx = await asPrincipal(pool, OWNER, (c) => c.query<{ def: string }>(
    "SELECT pg_get_indexdef(i.indexrelid) def FROM pg_index i JOIN pg_class cl ON cl.oid=i.indexrelid WHERE cl.relname='ix_iq_topic'"));
  A('0170 → ix_iq_topic 在场：列序(owner,interview,topic)+partial 谓词（裁决项①按推荐行使）',
    idx.rowCount === 1
    && /\(owner_user_id, interview_id, topic_id\)/.test(String(idx.rows[0]?.def))
    && /topic_id.*IS NOT NULL/.test(String(idx.rows[0]?.def)));
  const ledgerShape = await asPrincipal(pool, OWNER, (c) => c.query<{
    relforcerowsecurity: boolean; pk: string;
  }>(
    `SELECT c.relforcerowsecurity,
            (SELECT pg_get_constraintdef(oid) FROM pg_constraint
              WHERE conrelid='public.question_usage_ledger'::regclass AND contype='p') AS pk
       FROM pg_class c WHERE c.oid='public.question_usage_ledger'::regclass`));
  A('0171 → question_usage_ledger 在场·RLS FORCE·PK(owner_user_id,invocation_key) 沿 0037 同形',
    ledgerShape.rows[0]?.relforcerowsecurity === true
    && String(ledgerShape.rows[0]?.pk).includes('owner_user_id')
    && String(ledgerShape.rows[0]?.pk).includes('invocation_key'));
  const grants = await asPrincipal(pool, OWNER, (c) => c.query<{
    sel: boolean; ins: boolean; upd: boolean; del: boolean;
  }>(
    `SELECT has_table_privilege('app_role','question_usage_ledger','SELECT') sel,
            has_table_privilege('app_role','question_usage_ledger','INSERT') ins,
            has_table_privilege('app_role','question_usage_ledger','UPDATE') upd,
            has_table_privilege('app_role','question_usage_ledger','DELETE') del`));
  const g = grants.rows[0];
  A('0171 → app_role 仅授 SELECT/INSERT（UPDATE/DELETE 零授权·归集表只增不改）',
    g?.sel === true && g?.ins === true && g?.upd === false && g?.del === false);
  let updDenied = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      "UPDATE question_usage_ledger SET cause='report' WHERE owner_user_id=$1", [OWNER]));
  } catch (error) { updDenied = String((error as { code?: string })?.code ?? ''); }
  let delDenied = '';
  try {
    await asPrincipal(pool, OWNER, (c) => c.query(
      'DELETE FROM question_usage_ledger WHERE owner_user_id=$1', [OWNER]));
  } catch (error) { delDenied = String((error as { code?: string })?.code ?? ''); }
  A('0171 负臂：app_role UPDATE/DELETE→42501（migrate.proof privilege 断言形的 live 臂）',
    updDenied === '42501' && delDenied === '42501');

  /* ───────── ④a recordUsage 归集映射臂（usage_missing='missing' ↔ 0174 打标·§1.4 衔接） ───────── */
  section('④a recordUsage 归集映射臂：usage_missing→missing / provider→provider / estimate→estimate / 缺席→not_applicable / PK 去重 / 跨 owner RLS');
  // 上游行铸造走生产形函数（0088 state guard 禁直插；claim→dispatch→complete/fail=invoke 同链）。
  await asPrincipal(pool, OWNER, async (c) => {
    // 0174 打标行（AG-14 刀 B 折叠产物·本刀只读消费）：complete 携 usageSource='usage_missing'。
    const m1 = await claimModelInvocation(c, { owner: OWNER, idempotencyKey: 'bill1-map-missing', requestDigest: digest('bill1-map-missing'), service: 'bill1.proof', leaseToken: randomUUID(), leaseSeconds: 60 });
    if (m1.action !== 'execute') throw new Error(`claim_missing_${m1.action}`);
    await markModelInvocationDispatched(c, OWNER, 'bill1-map-missing', m1.leaseToken);
    await completeModelInvocation(c, { owner: OWNER, idempotencyKey: 'bill1-map-missing', output: { ok: 1 }, inputTokens: 11, outputTokens: 7, usageSource: 'usage_missing' });
    // 供应商真实 usage 行（usage_source NULL + estimate 在场）。
    const m2 = await claimModelInvocation(c, { owner: OWNER, idempotencyKey: 'bill1-map-provider', requestDigest: digest('bill1-map-provider'), service: 'bill1.proof', estimateInputTokens: 90, leaseToken: randomUUID(), leaseSeconds: 60 });
    if (m2.action !== 'execute') throw new Error(`claim_provider_${m2.action}`);
    await markModelInvocationDispatched(c, OWNER, 'bill1-map-provider', m2.leaseToken);
    await completeModelInvocation(c, { owner: OWNER, idempotencyKey: 'bill1-map-provider', output: { ok: 1 }, inputTokens: 101, outputTokens: 22 });
    // estimate-only 行（派发后失败：input_tokens NULL·estimate 在场）。
    const m3 = await claimModelInvocation(c, { owner: OWNER, idempotencyKey: 'bill1-map-estimate', requestDigest: digest('bill1-map-estimate'), service: 'bill1.proof', estimateInputTokens: 50, leaseToken: randomUUID(), leaseSeconds: 60 });
    if (m3.action !== 'execute') throw new Error(`claim_estimate_${m3.action}`);
    await markModelInvocationDispatched(c, OWNER, 'bill1-map-estimate', m3.leaseToken);
    await failModelInvocationClaim(c, OWNER, 'bill1-map-estimate', m3.leaseToken, 'bill1_proof_dispatch_failure');
  });
  for (const m of [
    { key: 'bill1-map-missing', cause: 'system_score' as const },
    { key: 'bill1-map-provider', cause: 'system_ask' as const },
    { key: 'bill1-map-estimate', cause: 'system_ask' as const },
    { key: 'bill1-map-absent', cause: 'system_plan' as const },
  ]) {
    await asPrincipal(pool, OWNER, async (c) => {
      await recordUsage(c, OWNER, {
        invocationKey: m.key, interviewId: iidNeg, operationId: 'bill1.map.op', cause: m.cause, answerLen: 21,
      });
    });
  }
  const replay = await asPrincipal(pool, OWNER, async (c) => {
    const again = await recordUsage(c, OWNER, {
      invocationKey: 'bill1-map-missing', interviewId: iidNeg, operationId: 'bill1.map.op', cause: 'system_score',
    });
    const rows = await c.query<{ n: number; cause: string; input_tokens: number; usage_source: string }>(
      "SELECT count(*)::int n,cause,(array_agg(input_tokens))[1] input_tokens,(array_agg(usage_source))[1] usage_source FROM question_usage_ledger WHERE owner_user_id=$1 AND invocation_key='bill1-map-missing' GROUP BY cause",
      [OWNER]);
    return { again, row: rows.rows[0] };
  });
  const mapped = await asPrincipal(pool, OWNER, (c) => c.query<{ invocation_key: string; usage_source: string }>(
    "SELECT invocation_key,usage_source FROM question_usage_ledger WHERE owner_user_id=$1 AND invocation_key LIKE 'bill1-map-%'", [OWNER]));
  const mapGet = (k: string) => mapped.rows.find((r) => r.invocation_key === k)?.usage_source;
  A('usage_missing 打标行 → ledger usage_source=\'missing\'（0174 衔接唯一触点）', mapGet('bill1-map-missing') === 'missing');
  A('provider usage 行（usage_source NULL+tokens 在场）→ ledger \'provider\'', mapGet('bill1-map-provider') === 'provider');
  A('estimate-only 行（派发后失败）→ ledger \'estimate\'', mapGet('bill1-map-estimate') === 'estimate');
  A('上游行缺席 → ledger \'not_applicable\'（零外呼臂诚实入账）', mapGet('bill1-map-absent') === 'not_applicable');
  A('同键崩溃重放零重复：PK 冲突忽略（再写返回 false·count=1·cause/token 保首写）',
    replay.again === false && Number(replay.row?.n) === 1 && replay.row?.cause === 'system_score'
    && Number(replay.row?.input_tokens) === 11 && replay.row?.usage_source === 'missing');
  const rlsProbe = await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO question_usage_ledger(owner_user_id,invocation_key,interview_id,operation_id,cause,usage_source) VALUES ($1,'bill1-rls-probe',$2,'op.v1','system_plan','not_applicable')",
      [OWNER, iidNeg]);
    return true;
  });
  const rlsOther = await asPrincipal(pool, `${OWNER}-other`, async (c) => {
    const row = await c.query<{ n: number }>(
      'SELECT count(*)::int n FROM question_usage_ledger WHERE invocation_key=$1', ['bill1-rls-probe']);
    return Number(row.rows[0]?.n);
  });
  A('0171 → 他 owner 经 RLS 读打标行零行（p_owner 隔离 live 臂）', rlsProbe && rlsOther === 0);
  A('失败臂 cause 纯函数映射：MODEL-OP-02 零外呼拒绝族→admission_rejected·余→generation_failed',
    usageCauseForInvokeError('model_circuit_open') === 'admission_rejected'
    && usageCauseForInvokeError('model_circuit_half_open') === 'admission_rejected'
    && usageCauseForInvokeError('model_concurrency_exhausted') === 'admission_rejected'
    && usageCauseForInvokeError('budget_exhausted') === 'admission_rejected'
    && usageCauseForInvokeError('provider_timeout') === 'generation_failed'
    && usageCauseForInvokeError('business:grounded_refs_not_in_facts') === 'generation_failed');

  /* ───────── ② topic_id 填充臂（A：pivot→probe 同话题） ───────── */
  section('② topic_id 填充臂：pivot 主问题=自己 / probe 追问=主问题 id（全链 scripted 假体）');
  const iidA = `bill1-a-${Date.now()}`;
  evalScript = () => 'good';
  plannerFail = false;
  await beginInterview(iidA);
  await interviewDispatchTick(deps);
  const qa1 = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string; topic_id: string; ask_mode: string }>(
      "SELECT question_id,topic_id,ask_mode FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [iidA]);
    return rows.rows[0];
  });
  const mainA = qa1?.question_id ?? '';
  A('A 首题=pivot 且 topic_id=自己 question_id', qa1?.ask_mode === 'pivot' && qa1?.topic_id === mainA);
  await answerCurrent(iidA, GOOD_ANSWER(1));   // meets=50 → confidence 0.5<0.7 → 同能力 probe
  const qa2 = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string; topic_id: string; ask_mode: string }>(
      "SELECT question_id,topic_id,ask_mode FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [iidA]);
    return rows.rows[0];
  });
  A('A 第二题=probe 且 topic_id=主问题 id（继承）',
    qa2?.ask_mode === 'probe' && qa2?.topic_id === mainA && qa2?.question_id !== mainA);
  await answerCurrent(iidA, GOOD_ANSWER(2));
  const planRowA = await ledgerCount(iidA, "invocation_key='" + `${iidA}:plan` + "' AND cause='system_plan'");
  const askRowsA = await ledgerCount(iidA, "cause='system_ask'");
  A('A 账本臂：plan 一行（invocation_key=:plan·cause=system_plan）', planRowA === 1);
  A('A 账本臂：ask 恰一行（probe=fundamental 模型调用；首题 grounded 无事实模板回退=零模型调用零行·既有生产行为）', askRowsA === 1);

  /* ───────── ③ clarify_cause 双因臂（B：non_answer / C：quote_unverifiable + 零变负臂） ───────── */
  section('③ clarify_cause 双因臂：non_answer / quote_unverifiable（既有 score/relevant 逐位零变负臂）');
  const iidB = `bill1-b-${Date.now()}`;
  evalScript = () => 'good';
  await beginInterview(iidB);
  await interviewDispatchTick(deps);
  const qB1 = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string }>(
      "SELECT question_id FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [iidB]);
    return rows.rows[0];
  });
  const mainB = qB1?.question_id ?? '';
  await answerCurrent(iidB, '不知道');   // 确定性非作答（<8 有效字符）→ 图侧直派 non_answer·零模型评分调用
  const qB2 = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string; topic_id: string; ask_mode: string; clarify_cause: string }>(
      "SELECT question_id,topic_id,ask_mode,clarify_cause FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [iidB]);
    return rows.rows[0];
  });
  A('B 澄清重发行：ask_mode=clarify·topic_id=主问题 id·clarify_cause=non_answer',
    qB2?.ask_mode === 'clarify' && qB2?.topic_id === mainB && qB2?.clarify_cause === 'non_answer'
    && qB2?.question_id !== mainB);
  await ledgerCount(iidB, "cause='system_plan'");   // 先等 plan 归集行落位（拍序收敛），再断言 eval 行零
  const bNoEval = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ n: number }>(
      "SELECT count(*)::int n FROM question_usage_ledger WHERE owner_user_id=$1 AND interview_id=$2 AND cause='system_score'",
      [OWNER, iidB]);
    return Number(rows.rows[0]?.n);
  });
  A('B 确定性非作答零模型评分调用（eval 账本行 0=零外呼）', bNoEval === 0);
  const bClarifyEvent = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ payload: Record<string, unknown> }>(
      "SELECT payload FROM interview_event WHERE stream_key=$1 AND kind='clarification_needed' ORDER BY id LIMIT 1", [iidB]);
    return rows.rows[0]?.payload;
  });
  A('B 既有澄清事件面零变：payload 键集恰为既有六键（additive 零泄漏）',
    bClarifyEvent !== undefined
    && Object.keys(bClarifyEvent ?? {}).sort().join(',') === 'competency,hint,question,questionId,stateVersion,turn');
  await answerCurrent(iidB, GOOD_ANSWER(3));

  const iidC = `bill1-c-${Date.now()}`;
  const cFirstEval = evalSeq;
  evalScript = (call) => (call === cFirstEval + 1 ? 'badquote' : 'good');
  await beginInterview(iidC);
  await interviewDispatchTick(deps);
  const qC1 = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string }>(
      "SELECT question_id FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [iidC]);
    return rows.rows[0];
  });
  const mainC = qC1?.question_id ?? '';
  await answerCurrent(iidC, GOOD_ANSWER(4));   // 引文核验失败 → quote_repair_exhausted → 'quote_unverifiable'
  const qC2 = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string; topic_id: string; ask_mode: string; clarify_cause: string }>(
      "SELECT question_id,topic_id,ask_mode,clarify_cause FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [iidC]);
    return rows.rows[0];
  });
  A('C 澄清重发行：clarify_cause=quote_unverifiable·topic_id=主问题 id·ask_mode=clarify',
    qC2?.clarify_cause === 'quote_unverifiable' && qC2?.topic_id === mainC && qC2?.ask_mode === 'clarify');
  await ledgerCount(iidC, "cause='system_score'");
  const cEvalRow = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ cause: string; question_id: string; topic_id: string; usage_source: string }>(
      "SELECT cause,question_id,topic_id,usage_source FROM question_usage_ledger WHERE owner_user_id=$1 AND interview_id=$2 AND cause='system_score' ORDER BY created_at, invocation_key LIMIT 1",
      [OWNER, iidC]);
    return rows.rows[0];
  });
  A('C 评分归集行：cause=system_score·question/topic 维度随 identity 透传',
    cEvalRow?.question_id === mainC && cEvalRow?.topic_id === mainC
    && ['not_applicable', 'provider', 'estimate', 'missing'].includes(String(cEvalRow?.usage_source)));
  await answerCurrent(iidC, GOOD_ANSWER(5));
  const cScored = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ score: number }>(
      "SELECT (payload->>'score')::int score FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' ORDER BY id LIMIT 1", [iidC]);
    return Number(rows.rows[0]?.score);
  });
  A('C 零变负臂：澄清后正常作答仍确定性 50 分（评分语义零变）', cScored === 50);

  /* ───────── ④b 失败臂 + ⑤ 旧行兼容臂 ───────── */
  section('④b 失败臂：plan 调用失败→generation_failed 归集行（面试仍开·优雅降级零变）');
  const iidD = `bill1-d-${Date.now()}`;
  evalScript = () => 'good';
  plannerFail = true;
  await beginInterview(iidD);
  await interviewDispatchTick(deps);
  plannerFail = false;
  await ledgerCount(iidD, "cause='generation_failed'");
  const dPlan = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ cause: string; n: number }>(
      "SELECT cause,count(*)::int n FROM question_usage_ledger WHERE owner_user_id=$1 AND interview_id=$2 AND invocation_key=$3 GROUP BY 1",
      [OWNER, iidD, `${iidD}:plan`]);
    return rows.rows[0];
  });
  A('D plan 失败臂：归集行 cause=generation_failed 恰一行',
    dPlan?.cause === 'generation_failed' && Number(dPlan?.n) === 1);
  const dQ = await asPrincipal(pool, OWNER, async (c) => {
    const rows = await c.query<{ question_id: string; topic_id: string; ask_mode: string }>(
      "SELECT question_id,topic_id,ask_mode FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [iidD]);
    return rows.rows[0];
  });
  A('D 优雅降级零变：默认能力集面试仍开·首题照常 pivot 落话题',
    !!dQ?.question_id && dQ?.ask_mode === 'pivot' && dQ?.topic_id === dQ?.question_id);
  await answerCurrent(iidD, GOOD_ANSWER(6));

  section('⑤ 旧行兼容臂：存量行 topic_id/ask_mode/clarify_cause IS NULL=不按话题计费语义保留');
  const legacy = await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question) VALUES ($1,$2,'bill1-legacy-q1',1,0,'存量行')",
      [OWNER, iidNeg]);
    const rows = await c.query<{ topic_id: string; ask_mode: string; clarify_cause: string }>(
      "SELECT topic_id,ask_mode,clarify_cause FROM interview_question WHERE owner_user_id=$1 AND question_id='bill1-legacy-q1'", [OWNER]);
    return rows.rows[0];
  });
  A('存量行三列恒 NULL（零回填）·identity conflict 检查对 NULL/undefined 恒等（崩溃重放幂等不变）',
    legacy?.topic_id === null && legacy?.ask_mode === null && legacy?.clarify_cause === null);

  console.log(`\n${failures === 0 ? '✓ bill1-topic-fields 全部通过' : `✗ ${failures} 失败`}`);
  await pool.end();
  if (failures > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exitCode = 1;
});
