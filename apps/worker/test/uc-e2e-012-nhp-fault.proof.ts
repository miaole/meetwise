/**
 * NHP-012-FAULT-01 · UC-E2E-012/024 FAULT 分面（单题评估失败→图级降级 + 题级落点 · 面试可继续）
 *
 * REQUEST: ai-docs/delivery/harness/nhp-batch-a-REQUEST.md §1 Row 1 · §9-rev1 R1/R2 + §9-rev2 ④⑤
 * Base: line/nhp-batch-a-draft（merge origin/main ea0fa0a0a · EXEC tip e4589b57f）
 *
 * 需求源: e2e-scenarios.md:261/:274 — E2 单题不可恢复失败 → 题级落点非静默丢弃 + 图级降级提示、
 * 面试可继续；A1 单题失败不中断整场。D1 披露: spec AnswerEval=pending_eval 状态机 ≙ 产品
 * answer_unscored interview_event（append-only · 幂等键 event_key）；断言键全用产品真事件名；
 * UC-024 补评闭环（后台 job→evaluated→CAS 重算）产品未接线 = NOT claimed（Ban 宣称字面已验）。
 *
 * 注入合同（§9-rev1 R2）: 评分缝 = scriptedModelClient 三形；**F1 禁 throw 形**——throw≡unknown
 * （packages/ai-runtime/src/invoke.ts:1024 catch 收敛 externalOutcome:'unknown' →
 * adaptive-interview-service.ts:843 统一 `evaluation_${out.error}`）；F1 改 `kind:'deterministic'`
 * 形 → invoke known-not-executed 臂 → error='deterministic_refusal' → reason=
 * `evaluation_deterministic_refusal` ≠ F2 reason，reason 级互斥。F2 两形（throw /
 * externalOutcome:'unknown'）收敛同一 reason=`evaluation_external_outcome_unknown`（payload 钉）。
 *
 * 臂: PC = 三键全脚本化全绿对照（§9-rev2 ⑤ · planner.competencies/interviewer.ask/
 * mock-interview.evaluate · model-client.ts:164-165 未脚本化默认 deterministic 拒答）+ **F4b**
 * （completed 口径仅 unscored=0 · adaptive-lifecycle.ts:642 谓词 · completed-eligible 断言）；
 * F1 = **非末题**（§9-rev2 ④ · maxTurns=2 注入钉第 1 轮）deterministic 码失败 → answer_unscored
 * 恰一（event_key=answer_unscored:<questionId>）+ 下一题 question_ready 同事务推进（图不中断）；
 * F2a/F2b = 两形收敛同一 reason · 零伪造分数；F3 = 二次 drain 不重发 answer_unscored（幂等键守卫）；
 * F4a = 混合 unscored conclude → failed + 额度 release + assessment_unavailable
 * （payload.reason=evaluation_unscored · event_key=assessment_unavailable:evaluation_unscored）恰一 ·
 * 终态不悬挂（产品法: adaptive-lifecycle.ts:632/:638-641/:672-679 + 0046 触发器
 * interview_completion_requires_all_answers_scored——answer_unscored 在场 ⇒ 禁 completed）；
 * N1-N3 = 额度净账审计（PC 恰一次 settled · F4a 恰一次 release · 中途臂零误退零双扣）。
 *
 * Evidence layer: isolated 真 PG（run-e2e-isolated 全迁移链）· 真产品路径造数（resume→route 链→
 * reserve→enqueue start/answer→drainInterviewJobOnce 消费循环 · Ban 裸 INSERT 绕产品路径）·
 * 零 live 模型 · 零 MODEL_API_KEY · 零外呼。EXIT0 = 具名 case 真证据 ≠ covered ≠ suite green；
 * §1.0.1 :118 行措辞零翻动（行 gap 不动 · FAULT gap→case 仅经 coordinator nail）；coveredCount=8。
 *
 *   pnpm uc012:nhp-fault:prove              （root · isolated）
 *   pnpm -C apps/worker prove:uc012-nhp-fault （raw; needs isolated DATABASE_URL from the runner）
 */
process.env.RESUME_ENC_KEY = 'uc012-nhp-fault-resume-enc-key';
process.env.RESUME_HASH_SECRET = 'uc012-nhp-fault-resume-hash-secret';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'uc012-nhp-fault-job-route-input-hmac-proof-key-not-production-01';
import { MemorySaver } from '@langchain/langgraph';
import { randomUUID } from 'node:crypto';
import {
  createPool, asPrincipal, provisionRuntimeLogin, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob, getReport,
  answerHash, claimInterviewAnswer, supplyCandidateProfileRoute, createJob, classifyJobRoute,
  bindApplicationRoute, snapshotInterviewRoute, assertIsolatedTestTarget,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { scriptedModelClient, type ModelClient, type ModelResult } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, type ConsumerDeps } from '../src/interview-consumer.ts';

let failures = 0;
let total = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

console.log('NHP-012-FAULT-01 UC-E2E-012/024 FAULT prove (PC(含F4b)+F1-F3+F4a+N1-N3 · D1 披露 · Ban live)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · §1.0.1 :118 措辞零翻动 · EXIT0≠covered');

// ── 零模型面（§1 env -u 三键具名）──
const keysOnEntry = ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']
  .filter((k) => String(process.env[k] ?? '').trim().length > 0);
for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];
A('L0 零模型: 三键（MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL）入场均不在场', keysOnEntry.length === 0);

const S = Date.now().toString(36);
const admin = createPool();
const role = `uc012_nhp_fault_${process.pid}`;
let runtime!: ReturnType<typeof createPool>;

/** 注入脚本 shaping：按问句轮标（【第N轮】）键控 · 全键覆盖计数（§9-rev2 ⑤）。 */
type EvalShape = 'green' | 'deterministic' | 'throw' | 'unknown';
// hasHook=true：评分成功但钩子封顶（HOOK_CAP<CONF_ENOUGH）→ 既有 probe 路径出 fundamental/
// scenario 追问（pickKind 奇偶）——追问不经 grounded 模板旁路（consent 门下首问 grounded=固定模板
// 零模型调用，adaptive-consumer 同形）→ ask seam 真实经模型客户端（守护⑤ 全键覆盖可证）。
const GREEN_EVAL = { ok: true as const, raw: { relevant: true, hasHook: true, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } };
const callCounts: Record<string, number> = { 'planner.competencies': 0, 'interviewer.ask': 0, 'mock-interview.evaluate': 0 };

/** scriptedModelClient 的 complete(req) 不透出 vars——问句轮标从 ask 题面进入 evaluate 的 userData；
 *  为键控注入，用包装层把「本轮题面」传给 evaluate 脚本：上一次 ask 的题面即当前评估题。 */
function buildModelWithRoundKey(evalShape: EvalShape, failRound = 1): ModelClient {
  let askSeq = 0;
  // 首问=grounded 模板（consent 门下零模型调用）不经理脚本 → 首轮评估按 round 1 计；
  // 经脚本的追问 ask 依次推进轮标。
  let lastRound = 1;
  const scripted: Record<string, (req: any) => ModelResult> = {
    // planner 硬闸 PLANNER_COMPETENCY_MIN_COUNT=3（#201）——3 条=合法后端计划（adaptive-flow 先例）；
    // <3 条=schema 拒→默认集，会翻覆臂内轮数账。
    'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存', '消息队列'] } }),
    'interviewer.ask': () => {
      lastRound = ++askSeq;
      return { ok: true, raw: { q: `【第${lastRound}轮】结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性，并给出一次具体取舍`, refs: [] } };
    },
    'mock-interview.evaluate': () => {
      const round = lastRound;   // 评估的题 = 最近一次 ask 的题面（图内 assess 紧随 ask）
      if (evalShape === 'green' || round !== failRound) return GREEN_EVAL;
      if (evalShape === 'deterministic') return { ok: false, kind: 'deterministic' };
      if (evalShape === 'unknown') return { ok: false, kind: 'transient', externalOutcome: 'unknown' };
      throw new Error('uc012_fault_injected_evaluate_throw');
    },
  };
  return {
    complete: (req, _attempt) => {
      callCounts[req.service] = (callCounts[req.service] ?? 0) + 1;
      const fn = scripted[req.service];
      const out = fn ? fn(req) : { ok: false as const, kind: 'deterministic' as const };
      return Promise.resolve(out);
    },
  };
}

const OWN = (k: string) => `uc012f-${k}-${S}`;
const IID = (k: string) => `iv-uc012f-${k}-${S}`;
const RECRUITER = (k: string) => `${OWN(k)}-recruiter`;

const balOf = (owner: string) => asPrincipal(admin, owner, (c) => availableUnits(c, owner));
const ivStatus = (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2', [id, owner]))
    .then((r) => r.rows[0]?.status as string | undefined);
const consRow = (owner: string, key: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]))
    .then((r) => r.rows[0]?.status as string | undefined);
const events = (owner: string, stream: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT kind, event_key, payload, created_at FROM interview_event WHERE stream_key=$1 ORDER BY created_at, id', [stream]))
    .then((r) => r.rows as Array<{ kind: string; event_key: string; payload: any }>);
const evCount = async (owner: string, stream: string, kind: string) => (await events(owner, stream)).filter((e) => e.kind === kind).length;
const issuedQuestion = async (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query("SELECT question_id, state_version, turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [id]))
    .then((r) => r.rows[0] as { question_id: string; state_version: number; turn: number } | undefined);

/** 真产品路径夹具：bucket 种子（豁免②a）→ resume 产品链 → interview 壳行 'created'（守护①·豁免②c）
 *  → 0142 candidate route 供给 → 0104 recruiter route 链 → reserve（begin 同 CAS）· 全程零裸造业务行。 */
async function fixture(tag: string, model: ModelClient) {
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
  // 守护① 壳行一律 'created'（ag-f-reroll:105 先例 · Ban 'active' 壳直冲 conclude/abandon）
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
  await asPrincipal(runtime, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
  const deps: ConsumerDeps = {
    pool: runtime, cp: new MemorySaver() as any, model, leaseOwner: `uc012-${tag}`,
    adaptive: {
      localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }],
      webExplore: async () => [],
      role: '后端工程师',
      maxTurns: 2, absoluteMaxTurns: 3,   // 软预算 2 题：F1 非末题注入的前提（§9-rev2 ④）
    },
  };
  return { owner, id, deps };
}

async function startFixture(f: Awaited<ReturnType<typeof fixture>>, tag: string): Promise<void> {
  await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'start', {}, 0));
  const drained = await drainInterviewJobOnce(f.deps, f.owner);
  A(`[${tag}] 消费 start job → 自适应路径`, drained === 'start');
}

async function answerCurrent(f: Awaited<ReturnType<typeof fixture>>, tag: string, round: number): Promise<{ q: { question_id: string; turn: number }; jobDedup?: string; drainResult: string }> {
  const q = await issuedQuestion(f.owner, f.id);
  if (!q) throw new Error(`uc012_${tag}_no_issued_question_r${round}`);
  const answer = `我用 Redis 计数器+滑动窗口扛高并发，超阈值降级（第${round}轮作答）`;
  const input = { questionId: q.question_id, stateVersion: Number(q.state_version), turn: Number(q.turn), answerId: randomUUID(), answerHash: answerHash(answer), answer };
  A(`[${tag}] 第${round}轮 API identity ledger 接受`, (await asPrincipal(runtime, f.owner, (c) => claimInterviewAnswer(c, f.owner, f.id, input))).status === 'accepted');
  const j1 = await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', input, input.turn + 1));
  const drainResult = await drainInterviewJobOnce(f.deps, f.owner);
  return { q, jobDedup: j1, drainResult };
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password: `${role}-pw`, sslMode: 'disable',
  });

  // ── PC · 三键全绿对照 + F4b（completed 口径仅 unscored=0）──
  section('PC · scripted 三键全绿对照（§9-rev2 ⑤）+ F4b completed-eligible（:642 unscored===0 谓词臂）');
  {
    for (const k of Object.keys(callCounts)) callCounts[k] = 0;
    const f = await fixture('pc', buildModelWithRoundKey('green'));
    await startFixture(f, 'pc');
    // 3 能力计划（planner 硬闸 min3）→ coverage conclude 需三轮全绿（绝对杀开关 3=兜底终场）。
    let pcRounds = 0;
    while (pcRounds++ < 5) {
      await answerCurrent(f, 'pc', pcRounds);
      const st = await ivStatus(f.owner, f.id);
      if (st === 'completed' || st === 'failed' || st === 'abandoned') break;
    }
    E('PC-AFTER-LOOP', { rounds: pcRounds, status: await ivStatus(f.owner, f.id) });
    const qTexts = await admin.query('SELECT question_id, turn, question FROM interview_question WHERE interview_id=$1 ORDER BY state_version', [f.id]);
    E('PC-QUESTIONS', qTexts.rows);
    const inv = await admin.query("SELECT service, count(*)::int n FROM ai_model_invocation WHERE owner_user_id=$1 GROUP BY service", [f.owner]);
    E('PC-INVOCATIONS', inv.rows);
    if ((await ivStatus(f.owner, f.id)) !== 'completed') {
      const jobs = await admin.query('SELECT kind, status, attempts, last_error FROM interview_job WHERE owner_user_id=$1 ORDER BY seq', [f.owner]);
      const qs = await admin.query('SELECT question_id, turn, status FROM interview_question WHERE interview_id=$1 ORDER BY state_version', [f.id]);
      E('PC-DIAG', { status: await ivStatus(f.owner, f.id), jobs: jobs.rows, questions: qs.rows, events: (await events(f.owner, f.id)).map((e) => ({ kind: e.kind, key: e.event_key, reason: e.payload?.reason, score: e.payload?.score })) });
    }
    const evs = await events(f.owner, f.id);
    A(`PC 全轮 answer_evaluated（评分绿 · ${pcRounds} 轮）`, evs.filter((e) => e.kind === 'answer_evaluated').length === pcRounds);
    A('PC 零 answer_unscored', evs.filter((e) => e.kind === 'answer_unscored').length === 0);
    A('PC interview=completed', (await ivStatus(f.owner, f.id)) === 'completed');
    A('PC F4b: completed 口径在 unscored=0 下达成（:642 unscored===0 && eligible>0 臂）', evs.filter((e) => e.kind === 'answer_unscored').length === 0 && (await ivStatus(f.owner, f.id)) === 'completed');
    A('PC 消费=confirmed（预留转实扣）', (await consRow(f.owner, f.id)) === 'confirmed');
    A('PC 额度=4.0（净扣 1.0 · 恰一次 settled）', (await balOf(f.owner)) === 4.0);
    A('PC 报告入队走舱壁（queued）', (await asPrincipal(runtime, f.owner, (c) => getReport(c, f.owner, f.id)))!.status === 'queued');
    A('守护⑤ 三图服务键全部被脚本覆盖（planner/ask/evaluate 均真实经模型客户端 · 未脚本化默认拒答未触）',
      callCounts['planner.competencies']! > 0 && callCounts['interviewer.ask']! >= 1 && callCounts['mock-interview.evaluate'] === pcRounds);
    E('PC-CALLS', { ...callCounts });
  }

  // ── F1 · 非末题 deterministic 注入 → answer_unscored 恰一 + 下一题同事务推进（图不中断）──
  section('F1 · 非末题（第1/2轮）deterministic 注入 → 题级落点 + 图级继续（§9-rev2 ④）');
  const f1Handles = await (async () => {
    for (const k of Object.keys(callCounts)) callCounts[k] = 0;
    const f = await fixture('f1', buildModelWithRoundKey('deterministic', 1));
    await startFixture(f, 'f1');
    const q1 = await issuedQuestion(f.owner, f.id);
    A('F1 首题已 issued', !!q1);
    await answerCurrent(f, 'f1', 1);
    const evs = await events(f.owner, f.id);
    const unscored = evs.filter((e) => e.kind === 'answer_unscored');
    A('F1 answer_unscored 恰一（题级落点非静默丢弃）', unscored.length === 1);
    A('F1 event_key=answer_unscored:<questionId>（幂等键 · :526/:535）', unscored[0]?.event_key === `answer_unscored:${q1!.question_id}`);
    A('F1 守护④ receipt 钉: payload.reason=evaluation_deterministic_refusal 字面（invoke deterministic 臂 → :843 evaluation_${out.error}）',
      unscored[0]?.payload?.reason === 'evaluation_deterministic_refusal');
    const q2 = await issuedQuestion(f.owner, f.id);
    A('F1 下一题已 issued（图未中断 · 面试可继续）', !!q2 && q2!.question_id !== q1!.question_id);
    A('F1 下一题 question_ready 落点（:536-537 同事务推进臂）', evs.some((e) => e.kind === 'question_ready' && e.event_key === `question_ready:${q2?.question_id}`));
    A('F1 注入钉非末题: 失败轮(1) < 软预算(2) · 下一题在场', !!q2);
    const st = await ivStatus(f.owner, f.id);
    A('F1 面试未入终态（仍进行中 · 非 completed/failed/abandoned）', st !== 'completed' && st !== 'failed' && st !== 'abandoned');
    A('F1 N3: 中途臂额度仍占用 4.0（零误退）', (await balOf(f.owner)) === 4.0);
    E('F1-UNSKEV', unscored[0]);
    return { f, q2 };
  })();

  // ── F3 · 二次 drain 不重发 answer_unscored（幂等键守卫）──
  section('F3 · 二次 drain 幂等（F1 夹具内）');
  {
    const { f, q2 } = f1Handles;
    const beforeUnscored = await evCount(f.owner, f.id, 'answer_unscored');
    const beforeReady = await evCount(f.owner, f.id, 'question_ready');
    const idle1 = await drainInterviewJobOnce(f.deps, f.owner);
    // 同题同 seq 重复入队 → 队列幂等（同 job）→ 二次 drain 零重放
    const answer = '重复提交探针（幂等键守卫）';
    const q1 = (await events(f.owner, f.id)).find((e) => e.kind === 'answer_unscored')?.payload?.questionId;
    const st1 = await asPrincipal(runtime, f.owner, (c) => c.query('SELECT state_version, turn FROM interview_question WHERE question_id=$1', [q1]));
    const input = { questionId: String(q1), stateVersion: Number(st1.rows[0]?.state_version ?? 0), turn: Number(st1.rows[0]?.turn ?? 0), answerId: randomUUID(), answerHash: answerHash(answer), answer };
    const j1 = await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', input, input.turn + 1));
    const j2 = await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', input, input.turn + 1));
    const idle2 = await drainInterviewJobOnce(f.deps, f.owner);
    A('F3 二次 drain 无待办（idle）', idle1 === 'idle' || idle2 === 'idle');
    A('F3 同题重复入队 → 幂等同一 job（不重复消费）', j1 === j2);
    A('F3 answer_unscored 仍恰一（不重发 · 幂等键 event_key 守卫）', (await evCount(f.owner, f.id, 'answer_unscored')) === beforeUnscored && beforeUnscored === 1);
    A('F3 question_ready 零重放（重排前后恒 2=start 题+推进题 · 无新增）', (await evCount(f.owner, f.id, 'question_ready')) === beforeReady && beforeReady === 2 && !!q2);
    A('F3 额度仍 4.0（零双扣零误退）', (await balOf(f.owner)) === 4.0);
  }

  // ── F2a/F2b · 外部结果未知两形收敛同一 reason · 零伪造分数 ──
  for (const [tag, shape] of [['f2a', 'throw'], ['f2b', 'unknown']] as const) {
    section(`F2 ${tag} · 评分失败 ${shape} 形 → unscored reason=evaluation_external_outcome_unknown（R2 两形收敛）`);
    for (const k of Object.keys(callCounts)) callCounts[k] = 0;
    const f = await fixture(tag, buildModelWithRoundKey(shape, 1));
    await startFixture(f, tag);
    await answerCurrent(f, tag, 1);
    const evs = await events(f.owner, f.id);
    const unscored = evs.filter((e) => e.kind === 'answer_unscored');
    A(`${tag} answer_unscored 恰一`, unscored.length === 1);
    A(`${tag} 守护钉: payload.reason=evaluation_external_outcome_unknown（${shape} 形收敛 · 非 kind 字段）`, unscored[0]?.payload?.reason === 'evaluation_external_outcome_unknown');
    A(`${tag} 零伪造分数: payload 无 score 字段`, !('score' in (unscored[0]?.payload ?? {})));
    A(`${tag} reason 级互斥: ≠ F1 的 evaluation_deterministic_refusal`, unscored[0]?.payload?.reason !== 'evaluation_deterministic_refusal');
    const q2 = await issuedQuestion(f.owner, f.id);
    A(`${tag} 图继续: 下一题 question_ready 已 issued`, !!q2);
  }

  // ── F4a · 混合 unscored conclude → failed + release + assessment_unavailable 恰一 · 终态不悬挂 ──
  section('F4a · 混合 unscored conclude → failed 臂（:672-679 · 0046 触发器钉禁 completed）');
  {
    for (const k of Object.keys(callCounts)) callCounts[k] = 0;
    const f = await fixture('f4a', buildModelWithRoundKey('unknown', 1));
    await startFixture(f, 'f4a');
    // 第1轮 unscored（unknown 形）→ 后续轮全绿；3 能力计划下 conclude 落点=逐答推进至 mind 终场
    // （软预算 2 抬升/绝对杀开关 3 · 混合 unscored 场 conclude 无论 reason 都走 :670-679 fail 臂）。
    let rounds = 0;
    while (rounds++ < 5) {
      await answerCurrent(f, 'f4a', rounds);
      const st = await ivStatus(f.owner, f.id);
      if (st === 'completed' || st === 'failed' || st === 'abandoned') break;
    }
    const evs = await events(f.owner, f.id);
    A('F4a 面试终态=failed（混合 unscored 禁 completed · 0046 触发器结算完整性法）', (await ivStatus(f.owner, f.id)) === 'failed');
    A('F4a assessment_unavailable 恰一', evs.filter((e) => e.kind === 'assessment_unavailable').length === 1);
    A('F4a event_key=assessment_unavailable:evaluation_unscored · payload.reason=evaluation_unscored',
      evs.some((e) => e.kind === 'assessment_unavailable' && e.event_key === 'assessment_unavailable:evaluation_unscored' && e.payload?.reason === 'evaluation_unscored'));
    A('F4a 额度 release: consumption=released', (await consRow(f.owner, f.id)) === 'released');
    A('F4a 额度净变 0: availability=5.0', (await balOf(f.owner)) === 5.0);
    A('F4a 终态不悬挂: 无 queued/running 残留 job', Number((await admin.query("SELECT count(*)::int n FROM interview_job WHERE owner_user_id=$1 AND status IN ('queued','running')", [f.owner])).rows[0].n) === 0);
    A('F4a 终态稳定: 复 drain 后仍 failed', (await drainInterviewJobOnce(f.deps, f.owner)) !== undefined && (await ivStatus(f.owner, f.id)) === 'failed');
  }

  // ── N1-N3 · 额度净账审计（全夹具汇总 · 恰一次语义逐字）──
  section('N1-N3 · 额度净账（PC settled 恰一次 · F4a released 恰一次 · 中途臂占用守恒）');
  {
    const ids = { pc: IID('pc'), f1: IID('f1'), f2a: IID('f2a'), f2b: IID('f2b'), f4a: IID('f4a') };
    const cons = await admin.query(
      `SELECT idempotency_key, status, service_type FROM entitlement_consumption WHERE idempotency_key = ANY($1) ORDER BY idempotency_key`,
      [Object.values(ids)]);
    const rows = cons.rows as Array<{ idempotency_key: string; status: string; service_type: string }>;
    const byk = (k: string) => rows.find((r) => r.idempotency_key === ids[k as keyof typeof ids]);
    A('N1 PC 笔恰一次 confirmed（失败不误标）', byk('pc')?.status === 'confirmed' && byk('pc')?.service_type === 'mock_interview');
    A('N2 F4a 笔恰一次 released（失败释放 · 雙扣零）', byk('f4a')?.status === 'released');
    A('N3 中途三笔（f1/f2a/f2b）仍 reserved（图未终 · 额度守恒零误退）',
      byk('f1')?.status === 'reserved' && byk('f2a')?.status === 'reserved' && byk('f2b')?.status === 'reserved');
    A('N3 全五笔恰一行（无重复预留）', rows.length === 5 && new Set(rows.map((r) => r.idempotency_key)).size === 5);
  }

  console.log(`\n${failures === 0
    ? `✓ NHP-012-FAULT-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
    : `✗ ${failures}/${total} NHP-012-FAULT-01 断言失败`}`);
  console.log('PIN: D1 — spec pending_eval 状态机 ≙ 产品 answer_unscored 事件面（映射披露）· UC-024 补评闭环 NOT claimed');
  console.log('PIN: F1/F2 reason 级互斥 — evaluation_deterministic_refusal ≠ evaluation_external_outcome_unknown（收据字面钉）');
  console.log('PIN: 混合面 completed+照计 需放松 0046 = billing rev 战役 · 本刀如实登记不越界（REQUEST §1 Row 1）');
  console.log('PIN: 旁证族零改动 — adaptive-degrade/ag-f-reroll/bill2-shadow-meter 互不替代（Ban wash）');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · §1.0.1 :118 行措辞零翻动 · EXIT0≠covered');
  await runtime.end();
  await admin.end();
  process.exit(failures ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.message ?? e);
  process.exit(1);
});
