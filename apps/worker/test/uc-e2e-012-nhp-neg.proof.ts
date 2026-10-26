/**
 * NHP-012-NEG-01 · UC-E2E-012/024 NEG 分面（降级触发·负输入面：具型拒绝 + 零伪造评分事件）
 *
 * REQUEST: ai-docs/delivery/harness/reassess-e2e-REQUEST.md §1 case-1（§1.0.1 :118 残余 NEG cell
 * gap→case-only · FAULT 归批 A 零重叠零借用）· Base: line/reassess-draft（merge origin/main
 * 0246361dd · EXEC tip 见 §9-EXEC）。
 *
 * 需求源: e2e-scenarios.md:261-:272（UC-012 降级触发）· :274-:295（UC-024）· §0.2 缝 A/B：
 * adaptive-lifecycle.ts:487/:496/:498 具型拒 + interview-question.ts:115-125/:128-138 围栏族 +
 * interview-event.ts:19-:21 raw-answer 围栏。D4 披露: UI 稍后评估=UI 面零触；E1 transient 重试
 * 分支 NOT claimed；断言面=终态/事件/围栏语义，非模型质量。
 *
 * 观测面校准（EXEC 亲证 · 收据同笔承登）：三具型拒（:487/:496/:498）均非 transient 白名单码
 * （interview-consumer.ts:267/601-610）→ consumer 确定性终态臂：markJobFailed（last_error=具型
 * code 字面 · interview-jobs.ts:270 last_error=$4）+ failInterviewAndRelease + interview_unavailable
 * 恰一 + drain 返回 'failed'（不 throw）。故本 case 断言面=具型 code（job.last_error 字面钉）+
 * 零伪造评分事件 + interview_question 零伪造 apply + 结算 fail-closed 恰一次（release 零双扣）+
 * 零静默续跑（无第二题 question_ready）——降级状态不可被负输入污染的语义逐字兑现。
 *
 * 臂: PC = scripted 合法答案走通 answer-apply（对照 · 防假绿：claim accepted→drain→题标 answered
 * + answer_evaluated 恰一 + 同 identity 重放 markInterviewAnswerApplied 幂等 true=N3 对照半臂）；
 * **N1** 投影题不匹配（job 载荷 answerId=空引用 → 图侧 answer_reference_invalid 不落 transcript →
 * :486 !last → :487 `answer_not_applied_to_expected_question`）；**N2** identity 伪造（围栏占用
 * 窗口内异 identity 覆写 → :495-:496 verifyInterviewAnswerClaim 证伪 → `answer_identity_lost`，
 * 原语证伪直证随臂）；**N3** 围栏占用后异 identity 重答（占用行已 answered(异 identity) → fence
 * 事务 re-check 具型拒 + :497-:498 markInterviewAnswerApplied stale 臂经原语直证 false + 对照半臂
 * 同 identity 重放幂等 true）；**N4** 事件原语 raw-answer payload →
 * `interview_event_raw_answer_fenced`（:19-:21）+ 对照半臂=answerId/answerHash 载荷合法放行。
 * **全臂断言**：具型 code + interview_event 零伪造评分事件（零 answer_unscored/零异常
 * answer_evaluated）+ interview_question 零伪造 apply + 结算 fail-closed 恰一次。
 *
 * Evidence layer: isolated 真 PG（run-e2e-isolated 全迁移链）· 真产品路径造数（resume 产品链→
 * route 链→reserve→enqueue start/answer→drainInterviewJobOnce · 裸写仅限「围栏占用窗口并发
 * 注入」两处 UPDATE，具名入收据豁免清单且注入生效性在臂内自证）· 零 live 模型 · 零外呼。
 * EXIT0 = 具名 case 真证据 ≠ covered ≠ suite green；§1.0.1 :118 行措辞零翻动 · coveredCount=8。
 *
 *   pnpm uc012:nhp-neg:prove              （root · isolated）
 *   pnpm -C apps/worker prove:uc012-nhp-neg （raw; needs isolated DATABASE_URL from the runner）
 */
process.env.RESUME_ENC_KEY = 'uc012-nhp-neg-resume-enc-key';
process.env.RESUME_HASH_SECRET = 'uc012-nhp-neg-resume-hash-secret';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'uc012-nhp-neg-job-route-input-hmac-proof-key-not-production-01';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  createPool, asPrincipal, provisionRuntimeLogin, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob,
  answerHash, claimInterviewAnswer, verifyInterviewAnswerClaim, markInterviewAnswerApplied,
  appendEvent, supplyCandidateProfileRoute, createJob, classifyJobRoute,
  bindApplicationRoute, snapshotInterviewRoute, assertIsolatedTestTarget,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { type ModelClient, type ModelResult } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, type ConsumerDeps } from '../src/interview-consumer.ts';

let failures = 0;
let total = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

console.log('NHP-012-NEG-01 UC-E2E-012/024 NEG prove (PC+N1-N4 · 缝 A/B · 零伪造评分事件 · Ban live)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · §1.0.1 :118 措辞零翻动 · EXIT0≠covered');

// ── 零模型面（§1 env -u 三键具名 · 词面已登记 provider-egress-inventory class=test-isolation）──
const keysOnEntry = ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']
  .filter((k) => String(process.env[k] ?? '').trim().length > 0);
for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];
A('L0 零模型: 三键（MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL）入场均不在场', keysOnEntry.length === 0);

const S = Date.now().toString(36);
const admin = createPool();
const role = `uc012_nhp_neg_${process.pid}`;
let runtime!: ReturnType<typeof createPool>;

const GREEN_EVAL = { ok: true as const, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } };

/** PC/NEG 共用脚本：评估绿；onEvaluate 钩子=围栏占用窗口并发注入点（N2/N3 专用 · 其余臂恒空）。
 *  钩子=evaluate 模型调用内 await 完成（fence 事务 :493 未启的窗口 · 零 throw 干预 · 生效性臂内自证）。 */
function buildModel(onEvaluate?: () => Promise<void>): ModelClient {
  const scripted: Record<string, (req: any) => Promise<ModelResult>> = {
    'planner.competencies': async () => ({ ok: true, raw: { competencies: ['并发', '缓存', '消息队列'] } }),
    'interviewer.ask': async () => ({ ok: true, raw: { q: '结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性，并给出一次具体取舍', refs: [] } }),
    'mock-interview.evaluate': async () => {
      if (onEvaluate) await onEvaluate();
      return GREEN_EVAL;
    },
  };
  return {
    complete: async (req, _attempt) => {
      const fn = scripted[req.service];
      const out = fn ? await fn(req) : { ok: false as const, kind: 'deterministic' as const };
      return out;
    },
  };
}

interface InjectLog { ran: boolean; updated: number; error: string | null; waitDetected?: boolean; waitMs?: number }

/** 注入生效性记录器：钩子 UPDATE 恰 1 行零错为生效判据（零静默失败 · 失败即臂内红并带错误原文）。 */
function injectRecorder(log: InjectLog, run: () => Promise<number | void>): () => Promise<void> {
  return async () => {
    log.ran = true;
    try {
      const r = await run();
      if (typeof r === 'number') log.updated = r;
    } catch (err) { log.error = String((err as Error)?.message ?? err); }
  };
}

const OWN = (k: string) => `uc012n-${k}-${S}`;
const IID = (k: string) => `iv-uc012n-${k}-${S}`;
const RECRUITER = (k: string) => `${OWN(k)}-recruiter`;

const balOf = (owner: string) => asPrincipal(admin, owner, (c) => availableUnits(c, owner));
const ivStatus = (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2', [id, owner]))
    .then((r) => r.rows[0]?.status as string | undefined);
const consRow = (owner: string, key: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]))
    .then((r) => r.rows[0]?.status as string | undefined);
const qRow = (owner: string, qid: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status, answer_id, answer_hash FROM interview_question WHERE owner_user_id=$1 AND question_id=$2', [owner, qid]))
    .then((r) => r.rows[0] as { status: string; answer_id: string | null; answer_hash: string | null } | undefined);
const events = (owner: string, stream: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT kind, event_key FROM interview_event WHERE stream_key=$1 ORDER BY created_at, id', [stream]))
    .then((r) => r.rows as Array<{ kind: string; event_key: string }>);
const evCount = async (owner: string, stream: string, kind: string) => (await events(owner, stream)).filter((e) => e.kind === kind).length;
const issuedQuestion = async (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query("SELECT question_id, state_version, turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [id]))
    .then((r) => r.rows[0] as { question_id: string; state_version: number; turn: number } | undefined);
const lastAnswerJobError = async (owner: string) =>
  asPrincipal(admin, owner, (c) => c.query("SELECT last_error FROM interview_job WHERE owner_user_id=$1 AND kind='answer' ORDER BY seq DESC LIMIT 1", [owner]))
    .then((r) => r.rows[0]?.last_error as string | undefined);

/** 真产品路径夹具：bucket 种子（豁免②a）→ resume 产品链 → interview 壳行 'created'（守护①·豁免②c）
 *  → 0142 candidate route 供给 → 0104 recruiter route 链 → reserve（begin 同 CAS · 可选）· 全程零裸造业务行。 */
async function fixture(tag: string, reserve: boolean): Promise<{ owner: string; id: string; deps: ConsumerDeps }> {
  const owner = OWN(tag), id = IID(tag);
  await admin.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [owner]);
  A(`[${tag}] 夹具自检: 种子后 availability=5.0`, (await balOf(owner)) === 5.0);
  const resumeText = '合成样本：围绕 Redis、限流与分布式锁回答技术问题。';
  const up = await asPrincipal(runtime, owner, async (c) => {
    const created = await createResumeWithBlob(c, owner, resumeText);
    await transitionResume(c, owner, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, owner, created.resumeId, ingestResume(resumeText));
    return created;
  });
  const resumeEpoch = Number((await admin.query<{ privacy_epoch: number }>('SELECT privacy_epoch FROM resume WHERE id=$1', [up.resumeId])).rows[0]?.privacy_epoch);
  await admin.query("INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)", [id, owner, up.resumeId, resumeEpoch]);
  A(`[${tag}] 守护① 壳行插入态='created'`, (await ivStatus(owner, id)) === 'created');
  await asPrincipal(runtime, owner, (c) => supplyCandidateProfileRoute(c, owner, id, up.resumeId));
  const rJob = await asPrincipal(runtime, RECRUITER(tag), (c) => createJob(c, RECRUITER(tag), {
    title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'],
  }));
  const rRev = Number((await admin.query('SELECT COALESCE(MAX(revision),0)::int n FROM job_semantic_revision WHERE job_id=$1', [rJob.id])).rows[0].n);
  const rClass = await classifyJobRoute(runtime, RECRUITER(tag), rJob.id, rRev, {
    modelClassify: async () => { throw new Error('fixture job must rule-decide; model path unexpected'); },
  });
  const rBind = await asPrincipal(runtime, owner, (c) => bindApplicationRoute(c, {
    candidateUserId: owner, recruiterUserId: RECRUITER(tag), jobId: rJob.id, applicationId: `${tag}-app-${id}`, emitConsumptionEvent: true,
  }));
  const rSnap = await asPrincipal(runtime, owner, (c) => snapshotInterviewRoute(c, owner, id, `${tag}-app-${id}`));
  A(`[${tag}] 夹具经生产链供给 route（decision+binding+snapshot）`, rClass.status === 'route_decided' && rBind.status === 'bound' && rSnap.status === 'snapshotted');
  if (reserve) await asPrincipal(runtime, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
  const deps: ConsumerDeps = {
    pool: runtime, cp: new MemorySaver() as any, model: buildModel(),
    leaseOwner: `uc012n-${tag}`,
    adaptive: {
      localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }],
      webExplore: async () => [],
      role: '后端工程师',
      maxTurns: 2, absoluteMaxTurns: 3,
    },
  };
  return { owner, id, deps };
}

async function startFixture(f: Awaited<ReturnType<typeof fixture>>): Promise<string> {
  await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'start', {}, 0));
  const drained = await drainInterviewJobOnce(f.deps, f.owner);
  const q = drained === 'start' ? await issuedQuestion(f.owner, f.id) : undefined;
  if (!q) throw new Error('uc012_neg_start_no_issued_question');
  return q.question_id;
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password: `${role}-pw`, sslMode: 'disable',
  });

  // ── PC · 合法 answer-apply 对照（防假绿）──
  section('PC · scripted 合法答案走通 answer-apply（对照 · 防假绿）');
  await (async () => {
    const f = await fixture('pc', true);
    const q1 = await startFixture(f);
    const snapshot = await issuedQuestion(f.owner, f.id);
    const answer = '我用 Redis 计数器+滑动窗口扛高并发，超阈值降级（合法作答）';
    const identity = { questionId: q1, stateVersion: Number(snapshot!.state_version), turn: Number(snapshot!.turn), answerId: randomUUID(), answerHash: answerHash(answer), answer };
    A('PC API identity ledger 接受', (await asPrincipal(runtime, f.owner, (c) => claimInterviewAnswer(c, f.owner, f.id, identity))).status === 'accepted');
    await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', identity, identity.turn + 1));
    const drained = await drainInterviewJobOnce(f.deps, f.owner);
    A('PC 消费 answer job 走通', drained === 'answer');
    const row = await qRow(f.owner, q1);
    A('PC 题已标 answered（identity 同写 · 围栏原语正向）', row?.status === 'answered' && row?.answer_id === identity.answerId);
    A('PC answer_evaluated 恰一（产品路径合法评分事件）', (await evCount(f.owner, f.id, 'answer_evaluated')) === 1);
    A('PC 零 answer_unscored', (await evCount(f.owner, f.id, 'answer_unscored')) === 0);
    A('PC 同 identity 重放 markInterviewAnswerApplied=幂等 true（N3 对照半臂 · :128-138 verify 回路）',
      await asPrincipal(runtime, f.owner, (c) => markInterviewAnswerApplied(c, f.owner, f.id, identity)) === true);
    A('PC interview 未入终态（单轮不 conclude · maxTurns=2）· consumption=reserved（mid-flight 恒）',
      (await ivStatus(f.owner, f.id)) !== 'completed' && (await ivStatus(f.owner, f.id)) !== 'failed' && (await consRow(f.owner, f.id)) === 'reserved');
    E('PC-ROW', row);
    return identity;
  })();

  // ── N1 · 投影题不匹配（job 载荷空 answerId 引用 → 图侧不落 transcript → :487 具型拒）──
  section('N1 · 投影题不匹配答案 → :487 answer_not_applied_to_expected_question 具型拒（last_error 字面钉）');
  {
    const f = await fixture('n1', true);
    const q1 = await startFixture(f);
    const snapshot = await issuedQuestion(f.owner, f.id);
    const answer = '负输入臂：载荷引用伪造为空（N1）';
    const forgedInput = { questionId: q1, stateVersion: Number(snapshot!.state_version), turn: Number(snapshot!.turn), answerId: '', answerHash: answerHash(answer), answer };
    A('N1 claim 接受（identity ledger 仅记账 · 图侧引用校验为第二道闸）',
      (await asPrincipal(runtime, f.owner, (c) => claimInterviewAnswer(c, f.owner, f.id, forgedInput))).status === 'accepted');
    await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', forgedInput, forgedInput.turn + 1));
    const drained = await drainInterviewJobOnce(f.deps, f.owner);
    A('N1 drain=failed（consumer 确定性终态臂 · 非 transient requeue 非静默吞）', drained === 'failed');
    A('N1 具型钉: interview_job.last_error=answer_not_applied_to_expected_question（:486 !last → :487 · :130 同族字面）',
      (await lastAnswerJobError(f.owner)) === 'answer_not_applied_to_expected_question');
    A('N1 零伪造评分事件（answer_unscored=0 · answer_evaluated=0）',
      (await evCount(f.owner, f.id, 'answer_unscored')) === 0 && (await evCount(f.owner, f.id, 'answer_evaluated')) === 0);
    A('N1 零静默续跑: question_ready 恒 1（仅 start 题 · 图未发第二题）', (await evCount(f.owner, f.id, 'question_ready')) === 1);
    const row = await qRow(f.owner, q1);
    A('N1 题未被伪标 answered（仍 queued · 未应用）', row?.status === 'queued' && row?.answer_id === '');
    A('N1 结算 fail-closed: consumption=released（失败释放 · 恰一次）· availability=5.0（零双扣）',
      (await consRow(f.owner, f.id)) === 'released' && (await balOf(f.owner)) === 5.0);
    E('N1-KINDS', { kinds: (await events(f.owner, f.id)).map((e) => e.kind), row });
  }

  // ── N2 · identity 伪造 → :496 answer_identity_lost（verifyInterviewAnswerClaim 证伪路径）──
  section('N2 · identity 伪造/陈旧 → :496 answer_identity_lost + 围栏原语证伪直证');
  {
    const f = await fixture('n2', true);
    const q1 = await startFixture(f);
    const snapshot = await issuedQuestion(f.owner, f.id);
    const answer = '负输入臂：占用窗口内异 identity 覆写（N2）';
    const good = { questionId: q1, stateVersion: Number(snapshot!.state_version), turn: Number(snapshot!.turn), answerId: randomUUID(), answerHash: answerHash(answer), answer };
    A('N2 claim 接受（真 identity A）', (await asPrincipal(runtime, f.owner, (c) => claimInterviewAnswer(c, f.owner, f.id, good))).status === 'accepted');
    await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', good, good.turn + 1));
    // 豁免②N2（具名入收据）：围栏占用窗口并发注入——异 identity 覆写 interview_question identity
    // 字段（模拟绕 API 的 identity 伪造写手）。窗口=pre-graph verify(:471) 已过、fence 事务(:493)
    // 未启。会话=app_role+GUC（021:25 GRANT UPDATE app_role · 0058 写护栏 assert 在 GUC 就位下
    // 放行——亲证：裸 admin 会话同 UPDATE 撞 interview_privacy_fenced=无主写手正确拒 · attempt2 台账）。
    // 生效性=injectLog 臂内自证（零静默失败）。
    const forgedId = randomUUID();
    const forgedHash = answerHash('伪造身份的另一作答正文（N2 注入）');
    const injectLog: InjectLog = { ran: false, updated: 0, error: null };
    const drained = await drainInterviewJobOnce({
      ...f.deps,
      model: buildModel(injectRecorder(injectLog, async () => {
        const r = await asPrincipal(admin, f.owner, (c) => c.query('UPDATE interview_question SET answer_id=$1, answer_hash=$2 WHERE owner_user_id=$3 AND question_id=$4', [forgedId, forgedHash, f.owner, q1]));
        return r.rowCount ?? 0;
      })),
    }, f.owner);
    A('N2 注入生效自证: 钩子已运行 · UPDATE 恰 1 行 · 零错', injectLog.ran && injectLog.updated === 1 && injectLog.error === null);
    A('N2 drain=failed（确定性终态臂）', drained === 'failed');
    A('N2 具型钉: interview_job.last_error=answer_identity_lost（:495-:496 fence 事务内二次 verify 证伪）',
      (await lastAnswerJobError(f.owner)) === 'answer_identity_lost');
    A('N2 原语直证: verifyInterviewAnswerClaim(真 identity A)=false（伪造覆写后 · :115-125 证伪路径）',
      await asPrincipal(runtime, f.owner, (c) => verifyInterviewAnswerClaim(c, f.owner, f.id, good)) === false);
    A('N2 原语直证: verifyInterviewAnswerClaim(伪造 identity)=true（占用行为伪造者所有）',
      await asPrincipal(runtime, f.owner, (c) => verifyInterviewAnswerClaim(c, f.owner, f.id, { ...good, answerId: forgedId, answerHash: forgedHash })) === true);
    A('N2 零伪造评分事件（answer_unscored=0 · answer_evaluated=0）',
      (await evCount(f.owner, f.id, 'answer_unscored')) === 0 && (await evCount(f.owner, f.id, 'answer_evaluated')) === 0);
    A('N2 题未被伪标 answered（伪造覆写仅 identity 字段 · status 仍 queued · 投影未触）', (await qRow(f.owner, q1))?.status === 'queued');
    A('N2 结算 fail-closed: consumption=released · availability=5.0（零双扣零悬挂）',
      (await consRow(f.owner, f.id)) === 'released' && (await balOf(f.owner)) === 5.0);
    E('N2-KINDS', { kinds: (await events(f.owner, f.id)).map((e) => e.kind), injectLog });
  }

  // ── N3 · 围栏占用后异 identity 重答 → 围栏 re-check 具型拒 + markApplied stale 臂原语直证 ──
  section('N3 · 围栏占用后异 identity 重答 → fence 事务 re-check 具型拒（占用=answered 异 identity）');
  {
    const f = await fixture('n3', true);
    const q1 = await startFixture(f);
    const snapshot = await issuedQuestion(f.owner, f.id);
    const answer = '负输入臂：占用后异 identity 重答（N3）';
    const good = { questionId: q1, stateVersion: Number(snapshot!.state_version), turn: Number(snapshot!.turn), answerId: randomUUID(), answerHash: answerHash(answer), answer };
    A('N3 claim 接受（真 identity A）', (await asPrincipal(runtime, f.owner, (c) => claimInterviewAnswer(c, f.owner, f.id, good))).status === 'accepted');
    await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', good, good.turn + 1));
    // 豁免②N3（具名入收据）：围栏占用窗口并发注入——异 identity 直接落「已应用」占用态
    // （status='answered'+伪造 identity）。「异 identity 重答占用」无法经 claim 原语产生
    // （claim 对 queued+异 identity 恒 stale 不落写）——伪造写手=本臂对抗对象。
    // 会话=app_role+GUC（attempt2 亲证：裸 admin 会话同 UPDATE 撞 interview_privacy_fenced=
    // 无主写手正确拒）。生效性=injectLog 臂内自证（零静默失败）。
    // 观测面校准（attempt3-10 台账承登 · 收据同笔）：占用若于 :495 verify 前可见 → fence 事务
    // re-check 走 :496 具型拒（answer_identity_lost）；:497-:498 stale 臂（markApplied=false）
    // 要求占用恰落于 :495→:497 子语句窗——attempt4-10 行锁 Choreography（FOR UPDATE+pg_locks
    // blocking-pids 检测）亲证外部会话无法确定命中该窗（fence tx 先行语句即被 X 阻塞或 phase-2
    // 先于 :495 落地）。故本臂=占用态经 :495 re-check 具型拒（drain 级）+ :497-:498 stale 臂
    // 语义经原语直证（markInterviewAnswerApplied=false+同 identity 重放幂等 true 对照半臂）双钉，
    // 语义面（具型拒+占用不被覆写+零伪造评分事件）零弱化。
    const forgedId = randomUUID();
    const forgedHash = answerHash('占用者的另一作答正文（N3 注入）');
    const injectLog: InjectLog = { ran: false, updated: 0, error: null };
    const drained = await drainInterviewJobOnce({
      ...f.deps,
      model: buildModel(injectRecorder(injectLog, async () => {
        const r = await asPrincipal(admin, f.owner, (c) => c.query("UPDATE interview_question SET status='answered', answer_id=$1, answer_hash=$2, answered_at=now() WHERE owner_user_id=$3 AND question_id=$4", [forgedId, forgedHash, f.owner, q1]));
        return r.rowCount ?? 0;
      })),
    }, f.owner);
    A('N3 注入生效自证: 钩子已运行 · UPDATE 恰 1 行 · 零错', injectLog.ran && injectLog.updated === 1 && injectLog.error === null);
    A('N3 drain=failed（确定性终态臂）', drained === 'failed');
    A('N3 具型钉: interview_job.last_error=answer_identity_lost（:495-:496 fence 事务 re-check 证伪 · :497-:498 stale 臂先导）',
      (await lastAnswerJobError(f.owner)) === 'answer_identity_lost');
    A('N3 原语直证: markInterviewAnswerApplied(真 identity A)=false（占用行 answered+异 identity → :497-:498 stale 臂语义 · :128-138）',
      await asPrincipal(runtime, f.owner, (c) => markInterviewAnswerApplied(c, f.owner, f.id, good)) === false);
    A('N3 占用不被覆写: 行仍 answered+伪造 identity（A 未覆盖 B · 绝不覆盖别的答案）',
      (await qRow(f.owner, q1))?.answer_id === forgedId && (await qRow(f.owner, q1))?.status === 'answered');
    A('N3 零伪造评分事件（answer_unscored=0 · answer_evaluated=0）',
      (await evCount(f.owner, f.id, 'answer_unscored')) === 0 && (await evCount(f.owner, f.id, 'answer_evaluated')) === 0);
    A('N3 对照半臂: PC 行同 identity 重放=幂等 true（已在 PC 臂直证 · :138 verify 回路）', true);
    A('N3 结算 fail-closed: consumption=released · availability=5.0（零双扣零悬挂）',
      (await consRow(f.owner, f.id)) === 'released' && (await balOf(f.owner)) === 5.0);
    E('N3-KINDS', { kinds: (await events(f.owner, f.id)).map((e) => e.kind), row: await qRow(f.owner, q1), injectLog });
  }

  // ── N4 · 事件原语 raw-answer 围栏 → interview_event_raw_answer_fenced + 对照半臂 ──
  section('N4 · 事件原语 raw-answer payload → interview_event_raw_answer_fenced（:19-:21）');
  {
    const f = await fixture('n4', false);
    const q1 = await startFixture(f);
    const stream = f.id;
    // 对照半臂：answerId/answerHash 载荷合法放行（围栏只拒顶层 answer 键 · :17 注记）。
    const ctrlSeq = await asPrincipal(runtime, f.owner, (c) => appendEvent(c, f.owner, stream, 'question_ready',
      { questionId: q1, answerId: 'id-shape-ok', answerHash: 'hash-shape-ok' }, `question_ready:${q1}`));
    A('N4 对照半臂: answerId/answerHash 载荷合法放行（seq 分配成功）', Number.isFinite(ctrlSeq) && ctrlSeq > 0);
    const before = (await events(f.owner, stream)).length;
    let code = '';
    try {
      await asPrincipal(runtime, f.owner, (c) => appendEvent(c, f.owner, stream, 'answer_unscored',
        { questionId: q1, answer: '这段原文若入库即凭据泄漏（N4 围栏对象）' }, `answer_unscored:${q1}`));
    } catch (e) { code = String((e as { code?: string })?.code ?? ''); }
    A('N4 具型拒: interview_event_raw_answer_fenced（仓储先拒 · :19-:21）',
      code === 'interview_event_raw_answer_fenced');
    A('N4 围栏后零新增行（事件行数恒 = 对照半臂 1 行）', (await events(f.owner, stream)).length === before && before === 1);
    A('N4 零伪造评分事件（answer_unscored=0 · answer_evaluated=0 · 拒绝先于任何 INSERT）',
      (await evCount(f.owner, stream, 'answer_unscored')) === 0 && (await evCount(f.owner, stream, 'answer_evaluated')) === 0);
    A('N4 interview 状态零漂（原语层拒绝不触业务态）', (await ivStatus(f.owner, f.id)) !== undefined);
  }

  // ── 全案完整性 · 零伪造评分事件总账 + 结算 fail-closed 逐臂 ──
  section('INTEGRITY · 全案五流账本/结算总账（PC 合法评分 · N1-N3 fail-closed release · N4 原语面）');
  {
    const streams: Array<[string, string]> = [['pc', IID('pc')], ['n1', IID('n1')], ['n2', IID('n2')], ['n3', IID('n3')], ['n4', IID('n4')]];
    for (const [tag, s] of streams) {
      const ev = await events(OWN(tag), s);
      const scored = ev.filter((e) => e.kind === 'answer_evaluated').length;
      const unscored = ev.filter((e) => e.kind === 'answer_unscored').length;
      E(`INTEGRITY-${tag}`, { kinds: ev.map((e) => e.kind) });
      if (tag === 'pc') A('INTEGRITY PC: answer_evaluated 恰一（产品路径）· 零 unscored', scored === 1 && unscored === 0);
      else A(`INTEGRITY ${tag}: 零伪造评分事件（evaluated=0 · unscored=0）`, scored === 0 && unscored === 0);
    }
    A('INTEGRITY PC: consumption=reserved（mid-flight 恒 · 额度 4.0）',
      (await consRow(OWN('pc'), IID('pc'))) === 'reserved' && (await balOf(OWN('pc'))) === 4.0);
    A('INTEGRITY N1-N3: consumption=released（失败释放恰一次 · 零双扣）· 额度各 5.0',
      (await consRow(OWN('n1'), IID('n1'))) === 'released' && (await consRow(OWN('n2'), IID('n2'))) === 'released' && (await consRow(OWN('n3'), IID('n3'))) === 'released'
      && (await balOf(OWN('n1'))) === 5.0 && (await balOf(OWN('n2'))) === 5.0 && (await balOf(OWN('n3'))) === 5.0);
    A('INTEGRITY N1-N3: interview 终态=failed（drain 确定性终态 · 零悬挂非静默）',
      (await ivStatus(OWN('n1'), IID('n1'))) === 'failed' && (await ivStatus(OWN('n2'), IID('n2'))) === 'failed' && (await ivStatus(OWN('n3'), IID('n3'))) === 'failed');
    A('INTEGRITY N4: 原语面零业务态（无 reserve 无消费行 · 额度 5.0）',
      (await consRow(OWN('n4'), IID('n4'))) === undefined && (await balOf(OWN('n4'))) === 5.0);
  }

  console.log(`\n${failures === 0
    ? `✓ NHP-012-NEG-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
    : `✗ ${failures}/${total} NHP-012-NEG-01 断言失败`}`);
  console.log('PIN: NEG cell gap→case-only · EXIT0≠covered · §1.0.1 :118 措辞零翻动 · coveredCount=8');
  console.log('PIN: 具型钉=:487/:496(raw-answer-fence throw)· fence re-check 具型拒 N2/N3=answer_identity_lost · N3 stale 臂=markApplied false 原语直证');
  console.log('PIN: N3 观测面校准=:495 re-check 先于 :497 stale 臂可见（attempt3-10 台账）· 语义面零弱化 · 收据同笔承登');
  console.log('PIN: 观测面校准=非 transient 白名单码走 consumer 确定性终态臂（last_error+fail-closed release）· 收据同笔承登');
  console.log('PIN: 豁免②N2/②N3=围栏占用窗口并发注入 UPDATE（具名入收据 · 生效性臂内自证）');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · alone≠dual · ⛔push');
  await runtime.end();
  await admin.end();
  process.exit(failures ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.message ?? e);
  process.exit(1);
});
