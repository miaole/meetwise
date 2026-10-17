/** AG-16 残面 proof：旧 checkpoint resume 三面确定性纪实（兼容/版本失配/中断点确定性）。
 *  蓝本=ai-docs/delivery/harness/ag16-resume-proof-REQUEST.md §1-件①（§9-rev4 修正后定稿文本）。
 *  读缝拦截形（checkpoint 世代判据）：拦截 saver 恰对「resume 前目标 checkpoint id」的 getTuple
 *  返回 tuple 剥新代 additive 字段（:366 before 读与 :400/:402 续跑读同指旧世代=两读全拦），
 *  resume 落写新世代后零触直通（:401/:404 snap 读=真新态零过剥），put 零覆写——恰复现真旧
 *  checkpoint 全程语义（沿 adaptive-lifecycle.proof.ts LegacyEmptyMindReadSaver 读缝先例形）。
 *  面1 兼容（四孔径跨两臂）：fresh 臂（resume 形）=stale 守卫+出题方向+plannerSequence 空序；
 *  重放臂（alreadyApplied invoke(null) 形·沿 adaptive-resume.proof.ts:173-203 形① eval-done 坠点
 *  先例）=写卡跳过 operative 门（scoreWriterLeaseOwner 必配+score_request 必 seed 防 no_request
 *  平凡绿+dispositions 在场正对照证写链在 harness 内通）+answer_evaluated payload evidence 缺键。
 *  面2 版本失配：channel_values 顶层整键缺席（topicMainQuestionId/weightedDeficit/concludeReason/
 *  competencyExhaustions=channel 级 default 缺省臂·唯缺键触发）+未知遗留键注入 → 与「无该键」
 *  对照面投影逐字节一致·两遍同形（固定 UUID 入参纪律）。
 *  面3 中断点确定性：裸图双 Command(resume)（双克隆实例各自直驱）——克隆=storage+writes 双 map
 *  双层深拷（浅拷共享内层 map 跨实例串染=恒等假象，附浅拷对照证判别器有牙）；落点恒等+awaitAnswer
 *  首行重放（plan 零重开）+被打断回合 genQuestion 零重执行/ask 零重问。
 *  脚本模型(CI)；MemorySaver 拦截壳；真实 PG 隔离库投影面；unhandledRejection 显式捕面。
 *  pnpm adaptive-legacy-checkpoint:prove */
import { fileURLToPath } from 'node:url';
import { MemorySaver, Command, type LangGraphRunnableConfig } from '@langchain/langgraph';
import {
  createPool, asPrincipal, reserveEntitlement, answerHash, claimInterviewAnswer, loadMigrations, runMigrations,
  submitInterviewAnswer, createScoreRequestForSubmission, SCORING_ISSUE_PRIVACY_EPOCH,
} from '@meetwise/db';
import { scriptedModelClient, type GraphObserver, type GraphNodeObservation, type GraphRunObservation, type ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveInterviewGraph, type AdaptiveDeps, type PendingQuestion, type Turn } from '@meetwise/ai-graphs';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';

// Test-only HMAC key for job route input hashing (same pattern as adaptive-resume.proof.ts; not production).
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'ag16-legacy-job-route-input-hmac-proof-key-not-production-1';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'ag16-legacy';
const CRASH_MSG = 'AG16_CRASH_INJECTED_WORKER_DEATH';
/** 固定 UUID 入参纪律（面2 逐字节一致比较与面3 同源输入）：禁 randomUUID 两遍异值假红。 */
const FRESH_A_ANSWER_ID = '6a160001-0000-4000-8000-00000000a001';
const FRESH_B_ANSWER_ID = '6a160002-0000-4000-8000-00000000b002';
const REPLAY_C_ANSWER_ID = '6a160003-0000-4000-8000-00000000c003';
const REPLAY_D_ANSWER_ID = '6a160004-0000-4000-8000-00000000d004';
const FACE2_ANSWER_ID = '6a160005-0000-4000-8000-00000000e005';
const FACE3_RESUME = Object.freeze({ answerId: '6a160006-0000-4000-8000-00000000f006' });
const ANSWER_WITH_HOOK = '我用 Redis 计数器+滑动窗口扛高并发，超阈值快速失败并降级非核心链路保住下单主路径';
/** 未知遗留键（面2 注入·读侧忽略纪实）与顶层整键剥除集（channel 级 default 缺省臂·唯缺键触发）。 */
const FACE2_LEGACY_KEY = 'legacyV4UnknownField';
const FACE2_CHANNEL_KEYS = ['topicMainQuestionId', 'weightedDeficit', 'concludeReason', 'competencyExhaustions'] as const;
/** 面1 剥字段清单（§9-rev4.1 两臂共用·deficit=weightedDeficit 顶层整键归面2 不入此列）。 */
const PENDING_STRIP_KEYS = ['topicId', 'askMode', 'clarifyCause', 'plannedTurns'] as const;
const TRANSCRIPT_LAST_STRIP_KEYS = ['dispositions', 'evidence'] as const;

type ServedAsk = { ok: true; raw: { q: string; refs: string[] } } | { ok: false; kind: 'deterministic' };
type Row = Record<string, unknown>;

/** 确定性脚本模型：planner 满三条（MIN_COUNT=3 硬闸）·ask 按 askLimit 内放行其后恒族外失败·
 *  评估 fixture exceeds+滑动窗口引文（与 ANSWER_WITH_HOOK 逐字相接=span 复验可过）。 */
const scriptedLifecycleModel = (askLimit: number): ModelClient => {
  let askSeq = 0;
  return scriptedModelClient({
    ['planner.competencies']: () => ({ ok: true, raw: { competencies: ['并发', '缓存', '事务边界'] } }),
    ['interviewer.ask']: (): ServedAsk => {
      askSeq += 1;
      if (askSeq > askLimit) return { ok: false, kind: 'deterministic' };
      return { ok: true, raw: { q: `结合你的限流经历聊聊高并发下怎么兼顾吞吐与一致，并说明第 ${askSeq} 轮验证方法`, refs: [] } };
    },
    ['mock-interview.evaluate']: () => ({ ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } }),
  });
};

/** 模型调用计数壳：断言「evaluate 零重评 / ask 零重问」。 */
const countingModel = (base: ModelClient, counts: Record<string, number>): ModelClient => ({
  async complete(req, attempt) {
    counts[req.service] = (counts[req.service] ?? 0) + 1;
    return base.complete(req, attempt);
  },
});

/** 节点级观测计数：断言「断点续跑非 START 重开 / invoke(null) 恰只补执行待任务」。 */
const nodeCounter = (): { observer: GraphObserver; counts: Record<string, number> } => {
  const counts: Record<string, number> = {};
  const observer: GraphObserver = {
    async runGraph<T>(_input: GraphRunObservation, action: () => Promise<T>): Promise<T> { return action(); },
    async runNode<T>(input: GraphNodeObservation, action: () => T | Promise<T>): Promise<T> {
      counts[input.node] = (counts[input.node] ?? 0) + 1;
      return await action();
    },
  };
  return { observer, counts };
};

/** 读缝拦截面（checkpoint 世代判据形）：恰对 arm 指定的目标 checkpoint id 剥新代 additive 字段后
 *  放行；其余世代零触直通。剥形=对 getTuple 每读新反序列化对象就地改（put=序列化串存储·零持久化
 *  面污染）；put/putWrites 零覆写。 */
type StripPlan = {
  pendingKeys: readonly string[];
  transcriptLastKeys: readonly string[];
  mindToEmptyCompetencies: boolean;
  channelKeys: readonly string[];
  injectLegacyKey?: string;
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  (value !== null && typeof value === 'object' && !Array.isArray(value)) ? value as Record<string, unknown> : null;

class GenerationInterceptSaver extends MemorySaver {
  private targetId: string | null = null;
  private plan: StripPlan | null = null;
  strippedReads = 0;
  arm(targetId: string, plan: StripPlan): void {
    this.targetId = targetId;
    this.plan = plan;
  }
  override async getTuple(config: LangGraphRunnableConfig) {
    const tuple = await super.getTuple(config);
    const checkpointId = (tuple?.checkpoint as { id?: string } | undefined)?.id;
    if (tuple && this.plan && this.targetId !== null && checkpointId === this.targetId) {
      this.strippedReads += 1;
      const values = tuple.checkpoint.channel_values;
      const pending = asRecord(values.pending);
      if (pending) for (const key of this.plan.pendingKeys) delete pending[key];
      if (Array.isArray(values.transcript) && values.transcript.length > 0) {
        const last = asRecord(values.transcript[values.transcript.length - 1]);
        if (last) for (const key of this.plan.transcriptLastKeys) delete last[key];
      }
      const mind = asRecord(values.mind);
      if (this.plan.mindToEmptyCompetencies && mind) mind.competencies = [];
      for (const key of this.plan.channelKeys) delete values[key];
      if (this.plan.injectLegacyKey) values[this.plan.injectLegacyKey] = 'legacy-marker';
    }
    return tuple;
  }
}

type SaverStore = { storage: Record<string, Record<string, Record<string, unknown[]>>> };
/** resume 前目标 checkpoint id=当前 thread 头 checkpoint（storage 插入序末位·start/坠点后的恰一位）。 */
const latestCheckpointId = (saver: MemorySaver, threadId: string): string => {
  const namespaces = (saver as unknown as SaverStore).storage[threadId];
  const ids = Object.keys(namespaces?.[''] ?? {});
  const head = ids[ids.length - 1];
  if (head === undefined) throw new Error('ag16_no_head_checkpoint');
  return head;
};

/** 面3 克隆器：storage+writes 双 map 双层深拷（deep=false 即浅拷对照=共享内层 map 串染判别器）。 */
const deepCopyLayered = (node: unknown, depth: number): unknown => {
  if (depth <= 0 || node === null || typeof node !== 'object') return node;
  if (node instanceof Uint8Array) return new Uint8Array(node);
  if (Array.isArray(node)) return node.map((item) => deepCopyLayered(item, depth - 1));
  const copy: Record<string, unknown> = Object.create(Object.getPrototypeOf(node) as object | null);
  for (const key of Object.keys(node)) copy[key] = deepCopyLayered((node as Record<string, unknown>)[key], depth - 1);
  return copy;
};
const cloneSaverMaps = (source: MemorySaver, deep: boolean): MemorySaver => {
  const out = new MemorySaver();
  const fields = ['storage', 'writes'] as const;
  for (const field of fields) {
    const value = (source as unknown as Record<string, object>)[field];
    if (value === undefined) throw new Error('ag16_saver_map_missing');
    (out as unknown as Record<string, object>)[field] = deep ? (deepCopyLayered(value, 4) as object) : value;
  }
  return out;
};

const seedInterview = async (iid: string) => {
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [iid, OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, iid, 'mock_interview', 1.0));
};

/** F-1 硬前置：沿 interview.proof.ts:252 先例——API submit 事务邻域（同一 asPrincipal 事务）
 *  submitInterviewAnswer+createScoreRequestForSubmission 为 (interview,question,stateVersion)
 *  落在途 score_request。无此 seed 则写卡步 no_request 静默跳过=平凡绿通道。 */
const seedScoreRequest = async (iid: string, questionId: string, stateVersion: number, answer: string, submissionKey: string) => {
  const result = await asPrincipal(pool, OWNER, async (c) => {
    const submitted = await submitInterviewAnswer(c, {
      interviewId: iid, questionId, stateVersion,
      clientSubmissionKey: submissionKey, answer, privacyEpoch: SCORING_ISSUE_PRIVACY_EPOCH,
    });
    return await createScoreRequestForSubmission(c, {
      interviewId: iid, questionId, stateVersion,
      submissionId: submitted.submissionId, artifactId: submitted.artifactId,
      canonicalBodyHmac: submitted.canonicalBodyHmac, privacyEpoch: submitted.privacyEpoch,
    });
  });
  return result.created === true ? result.requestId : null;
};

const eventRows = async (iid: string): Promise<Array<Record<string, unknown>>> => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query(
    'SELECT kind, event_key, payload FROM interview_event WHERE stream_key=$1 ORDER BY seq', [iid],
  ));
  return r.rows as Array<Record<string, unknown>>;
};
const eventCount = async (iid: string, kind: string, eventKey?: string) => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number }>(
    `SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2 ${eventKey ? 'AND event_key=$3' : ''}`,
    eventKey ? [iid, kind, eventKey] : [iid, kind],
  ));
  return Number(r.rows[0]?.n ?? -1);
};
const scoreCardCount = async (iid: string, questionId: string) => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query<{ n: number; total: string | null }>(
    'SELECT count(*)::int n, max(deterministic_total)::text total FROM score_card WHERE interview_id=$1 AND question_id=$2', [iid, questionId],
  ));
  return { rows: Number(r.rows[0]?.n ?? -1), total: r.rows[0]?.total ?? null };
};
const scoreRequestStatus = async (iid: string) => {
  const r = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>(
    `SELECT sr.status FROM score_request sr JOIN issued_question_contract c ON c.id=sr.issued_contract_id
      WHERE sr.interview_id=$1 ORDER BY sr.created_at DESC LIMIT 1`, [iid],
  ));
  return r.rows[0]?.status ?? null;
};
const scalar = async (sql: string, params: unknown[]): Promise<Row | undefined> => {
  const r = await pool.query(sql, params);
  return r.rows[0] as Row | undefined;
};

/** lifecycle deps 组装（cp 可为拦截壳）。 */
const lifecycleDeps = (cp: MemorySaver, iid: string, model: ModelClient, observer?: GraphObserver, leaseOwner?: string): AdaptiveLifecycleDeps => ({
  pool, cp, owner: OWNER, interviewId: iid, model,
  localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [],
  ...(observer ? { graphObserver: observer } : {}),
  ...(leaseOwner !== undefined ? { scoreWriterLeaseOwner: leaseOwner } : {}),
});

/** 直驱图（形① 两段驱动第一段：绕过 lifecycle 投影·模型 seam 注入抛错合成 eval-done 坠点）。 */
const directCrashGraph = (cp: MemorySaver, iid: string, input: { answerId: string; answer: string }, observer: GraphObserver) => {
  const deps = buildAdaptiveDeps({
    pool, owner: OWNER, threadId: iid, model: scriptedLifecycleModel(0),
    competencies: ['并发', '缓存', '事务边界'], resumeProfileAvailable: false,
    localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [],
    graphObserver: observer,
    loadAnswer: async (reference) => {
      if (reference.answerId !== input.answerId)
        throw Object.assign(new Error('answer_artifact_unavailable'), { code: 'answer_artifact_unavailable' });
      return input.answer;
    },
  });
  return buildAdaptiveInterviewGraph(cp, { ...deps, retrieveAndGenerate: async (): Promise<never> => { throw new Error(CRASH_MSG); } });
};

/** 只读检查图（节点永不执行·抛错 seam 即哨兵）：直读同 saver 同 thread 的 checkpoint 形态。 */
const inspectWith = async (saver: MemorySaver, threadId: string): Promise<{ pending: PendingQuestion | null; next: string[]; transcript: Turn[]; stateVersion: number }> => {
  const g = buildAdaptiveInterviewGraph(saver, {
    competencies: [],
    retrieveAndGenerate: async () => { throw new Error('inspect-only'); },
    assess: async () => { throw new Error('inspect-only'); },
    loadAnswer: async () => { throw new Error('inspect-only'); },
  } as AdaptiveDeps);
  const snap = await g.getState({ configurable: { ['thread_id']: threadId } });
  return {
    pending: snap.values.pending ?? null,
    next: [...(snap.next ?? [])],
    transcript: snap.values.transcript ?? [],
    stateVersion: snap.values.stateVersion,
  };
};

/* ══════════ 面3 裸图 deps（零 DB·确定性假体·同源固定输入） ══════════ */
const bareDeps = (counts: Record<string, number>, askLog: string[]): AdaptiveDeps => ({
  competencies: ['并发', '缓存'],
  retrieveAndGenerate: async (competency: string, _difficulty: number, _attempt: number, turn: number) => {
    askLog.push(`${competency}@${turn}`);
    return { question: `face3 请结合 ${competency} 给出第 ${turn + 1} 轮的具体实践取舍与验证方法。`, sources: ['face3://fixture'] };
  },
  assess: async () => ({ status: 'scored' as const, score: 100, evidence: ['face3 证据'], relevant: true, hasHook: false, dispositions: [] }),
  loadAnswer: async (reference) => {
    if (reference.answerId !== FACE3_RESUME.answerId) throw new Error('face3_answer_reference_mismatch');
    return 'face3 固定作答正文（含滑动窗口限流细节）';
  },
  graphObserver: {
    runNode: async <T,>(input: { node: string }, action: () => T | Promise<T>): Promise<T> => {
      counts[input.node] = (counts[input.node] ?? 0) + 1;
      return await action();
    },
  },
});

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',60.0, now()+interval '300 days')", [OWNER]);

  // unexpected rejection 大声退出（durability-async 面·沿 adaptive-resume.proof 同纪律；本刀零坠点注入 put）。
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('✗ unexpected unhandledRejection', reason instanceof Error ? reason.stack : reason);
    process.exit(1);
  });

  // ══════════ 面1 fresh 臂 a：stale 守卫 + 出题方向确定 + 新世代直通正对照 + F-1 写链正对照 ══════════
  console.log('\n──── 面1 fresh 臂 a：pending 四子键剥（resume 形）→ 守卫不坠 identity 保持 + 写链正对照 ────');
  const iidA = `ag16-fresh-a-${Date.now()}`;
  await seedInterview(iidA);
  const modelCountsA: Record<string, number> = {};
  const modelA = countingModel(scriptedLifecycleModel(99), modelCountsA);
  const cpA = new GenerationInterceptSaver();
  const sA = await startAdaptiveInterview(lifecycleDeps(cpA, iidA, modelA), '后端工程师', ['限流改造']);
  A('fresh a phase1:start → 首题 identity', !!sA.questionId && sA.stateVersion === 1);
  const requestA = await seedScoreRequest(iidA, sA.questionId!, 1, ANSWER_WITH_HOOK, `ag16-fresh-a-${sA.questionId}`);
  A('fresh a F-1:score_request 已 seed（在途·封 no_request 平凡绿通道）', requestA !== null
    && (await scoreRequestStatus(iidA)) === 'pending');
  cpA.arm(latestCheckpointId(cpA, iidA), {
    pendingKeys: PENDING_STRIP_KEYS, transcriptLastKeys: [], mindToEmptyCompetencies: false, channelKeys: [],
  });
  const inputA = { questionId: sA.questionId!, stateVersion: sA.stateVersion!, answerId: FRESH_A_ANSWER_ID, answerHash: answerHash(ANSWER_WITH_HOOK), turn: 0, answer: ANSWER_WITH_HOOK };
  A('fresh a:answer identity 被 API/DB ledger 接受', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iidA, inputA))).status === 'accepted');
  const rA = await submitAdaptiveAnswer(lifecycleDeps(cpA, iidA, modelA, undefined, 'ag16-fresh-a-lease'), inputA);
  A('fresh a stale 守卫:零 stale_question 抛·identity 保持·评分 100·推进下一题', rA.score === 100 && !!rA.nextQuestionId && rA.done === false);
  const q2A = rA.nextQuestionId!;
  const q2RowA = await scalar('SELECT competency, topic_id, ask_mode, clarify_cause FROM interview_question WHERE interview_id=$1 AND question_id=$2', [iidA, q2A]);
  A('fresh a 出题方向确定:下一题=planner 序第二位（缓存）', String(q2RowA?.competency ?? '') === '缓存');
  A('fresh a 新世代直通正对照（证零过剥）:q2 persist 行 topic_id=自己·ask_mode=pivot（:430 系）',
    String(q2RowA?.topic_id ?? '') === q2A && String(q2RowA?.ask_mode ?? '') === 'pivot' && q2RowA?.clarify_cause === null);
  const qReadyA = (await eventRows(iidA)).find((row) => row['kind'] === 'question_ready' && ((row['payload'] ?? null) as Row | null)?.questionId === q2A);
  const qReadyPayloadA = (qReadyA?.payload ?? null) as Row | null;
  A('fresh a 新世代直通正对照:question_ready payload 含 plannedTurns 数字（:496 系·拦截形未过剥新世代）',
    typeof qReadyPayloadA?.plannedTurns === 'number' && Number(qReadyPayloadA?.plannedTurns) > 0);
  A('fresh a 世代判据命中:before 读+resume 读同指旧世代（剥≥2 读·新世代零触）', cpA.strippedReads >= 2);
  const cardA = await scoreCardCount(iidA, inputA.questionId);
  A('fresh a F-1 配对正对照:dispositions 在场臂 score_card=1 且总分=100（证写链在 harness 内通）',
    cardA.rows === 1 && Number(cardA.total) === 100);

  // ══════════ 面1 fresh 臂 b：mind.competencies 剥→plannerSequence 空序→确定性 conclude 收口 ══════════
  console.log('\n──── 面1 fresh 臂 b：mind.competencies 剥（空序形）→ 出题方向确定=既有单发收口 ────');
  const iidB = `ag16-fresh-b-${Date.now()}`;
  await seedInterview(iidB);
  const modelCountsB: Record<string, number> = {};
  const modelB = countingModel(scriptedLifecycleModel(99), modelCountsB);
  const cpB = new GenerationInterceptSaver();
  const sB = await startAdaptiveInterview(lifecycleDeps(cpB, iidB, modelB), '后端工程师', ['限流改造']);
  A('fresh b phase1:start → 首题 identity', !!sB.questionId && sB.stateVersion === 1);
  cpB.arm(latestCheckpointId(cpB, iidB), {
    pendingKeys: PENDING_STRIP_KEYS, transcriptLastKeys: [], mindToEmptyCompetencies: true, channelKeys: [],
  });
  const inputB = { questionId: sB.questionId!, stateVersion: sB.stateVersion!, answerId: FRESH_B_ANSWER_ID, answerHash: answerHash(ANSWER_WITH_HOOK), turn: 0, answer: ANSWER_WITH_HOOK };
  A('fresh b:answer identity 被 API/DB ledger 接受', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iidB, inputB))).status === 'accepted');
  const rB = await submitAdaptiveAnswer(lifecycleDeps(cpB, iidB, modelB), inputB);
  A('fresh b plannerSequence 空序（:374-379）:不重建 g=空序→确定性 conclude 收口（done+零第二题+评分在案）',
    rB.done === true && rB.score === 100 && rB.nextQuestionId === undefined && cpB.strippedReads >= 2);
  A('fresh b 出题方向确定:question_ready 恒 1（零换序零第二题）', await eventCount(iidB, 'question_ready') === 1);
  const statusB = (await pool.query('SELECT status FROM interview WHERE id=$1', [iidB])).rows[0] as Row | undefined;
  const reportB = await scalar('SELECT count(*)::int n FROM ai_report WHERE interview_id=$1', [iidB]);
  A('fresh b 收口:eligible=1 臂 interview completed+报告入队舱壁', statusB?.status === 'completed' && Number(reportB?.n ?? -1) === 1);

  // ══════════ 面1 重放臂 c：写卡跳过 operative 门 + :509 伴生条件为真 + F-2 幂等重放 ══════════
  console.log('\n──── 面1 重放臂 c：形① eval-done 坠点→同 identity 重入（invoke(null) 形）→ 世代剥后回合 ────');
  const iidC = `ag16-replay-c-${Date.now()}`;
  await seedInterview(iidC);
  const modelCountsC: Record<string, number> = {};
  const modelC = countingModel(scriptedLifecycleModel(0), modelCountsC);
  const cpC = new GenerationInterceptSaver();
  const dC = lifecycleDeps(cpC, iidC, modelC);
  const sC = await startAdaptiveInterview(dC, '后端工程师', ['限流改造']);
  A('replay c phase1:start → 首题 identity（local qbank 假体供题·模型 ask 零放行=后续臂恒族外失败）',
    !!sC.questionId && (modelCountsC['interviewer.ask'] ?? 0) === 0);
  const inputC = { questionId: sC.questionId!, stateVersion: sC.stateVersion!, answerId: REPLAY_C_ANSWER_ID, answerHash: answerHash(ANSWER_WITH_HOOK), turn: 0, answer: ANSWER_WITH_HOOK };
  A('replay c:answer identity 被 API/DB ledger 接受', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iidC, inputC))).status === 'accepted');
  const crashDriveC = nodeCounter();
  const gC = directCrashGraph(cpC, iidC, inputC, crashDriveC.observer);
  let crashedC: unknown = null;
  try { await gC.invoke(new Command({ resume: { answerId: inputC.answerId } }), { configurable: { ['thread_id']: iidC } }); } catch (e) { crashedC = e; }
  A('replay c 形①:注入抛错坠于 genQuestion（合成 eval-done 坠点·先例 :193-195 同形）', (crashedC instanceof Error) && crashedC.message === CRASH_MSG);
  const fallenC = await inspectWith(cpC, iidC);
  A('replay c 坠点形态:transcript 已含本题答案·next 非空·无 pending interrupt',
    fallenC.transcript[fallenC.transcript.length - 1]?.questionId === inputC.questionId
    && fallenC.next.length > 0 && fallenC.pending === null);
  const requestC = await seedScoreRequest(iidC, inputC.questionId, 1, ANSWER_WITH_HOOK, `ag16-replay-c-${inputC.questionId}`);
  A('replay c F-1:score_request 已 seed（在途·写卡跳过归 :511 空序门非 no_request）', requestC !== null
    && (await scoreRequestStatus(iidC)) === 'pending');
  cpC.arm(latestCheckpointId(cpC, iidC), {
    pendingKeys: PENDING_STRIP_KEYS, transcriptLastKeys: TRANSCRIPT_LAST_STRIP_KEYS, mindToEmptyCompetencies: true, channelKeys: [],
  });
  const replayDriveC = nodeCounter();
  const evalBeforeC = modelCountsC['mock-interview.evaluate'] ?? 0;
  const rC = await submitAdaptiveAnswer(lifecycleDeps(cpC, iidC, modelC, replayDriveC.observer, 'ag16-replay-c-lease'), inputC);
  A('replay c 重入零重评零重执行（evaluate 模型计数不变·plan/evalAnswer 零重执行·恰只补执行 genQuestion）',
    (modelCountsC['mock-interview.evaluate'] ?? 0) === evalBeforeC
    && (replayDriveC.counts['plan'] ?? 0) === 0 && (replayDriveC.counts['evalAnswer'] ?? 0) === 0
    && (replayDriveC.counts['genQuestion'] ?? 0) === 1);
  A('replay c 后臂形态:ask 族外失败→failClosed 终场（done+degraded·:402-404 invoke(null) 不重评）',
    rC.done === true && rC.degraded === true && rC.score === 100 && rC.nextQuestionId === undefined);
  const cardC = await scoreCardCount(iidC, inputC.questionId);
  A('replay c 写卡跳过 operative 门:score_card 行数=0（leaseOwner 必配+request 在途=非短路非 no_request）',
    cardC.rows === 0 && (await scoreRequestStatus(iidC)) === 'pending');
  const evalPayloadC = (await eventRows(iidC)).find((row) => row['kind'] === 'answer_evaluated')?.['payload'] as Row | undefined;
  A('replay c :509 伴生条件为真:last.score=100 number+outcome=answered（非 unscored/clarify）+leaseOwner 已配',
    typeof rC.score === 'number' && evalPayloadC?.outcome === 'answered'
    && typeof evalPayloadC?.score === 'number');
  A('replay c 事件键幂等:answer_evaluated 恰 1 条（answer_evaluated:<qid> 键·:447 形）',
    await eventCount(iidC, 'answer_evaluated', `answer_evaluated:${inputC.questionId}`) === 1);
  const replayAgainC = nodeCounter();
  const rC2 = await submitAdaptiveAnswer(lifecycleDeps(cpC, iidC, modelC, replayAgainC.observer, 'ag16-replay-c-lease'), inputC);
  A('replay c F-2:同 identity 二遍 submit=幂等重放（零 throw·:381 alreadyApplied+:402 elif next 空零 invoke·事件仍恰 1）',
    rC2.score === 100 && rC2.done === true
    && (replayAgainC.counts['genQuestion'] ?? 0) === 0 && (replayAgainC.counts['evalAnswer'] ?? 0) === 0
    && await eventCount(iidC, 'answer_evaluated', `answer_evaluated:${inputC.questionId}`) === 1);
  const statusC = (await pool.query('SELECT status FROM interview WHERE id=$1', [iidC])).rows[0] as Row | undefined;
  const consC = await asPrincipal(pool, OWNER, (c) => c.query<{ status: string }>('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER, iidC]));
  const termC = await eventRows(iidC);
  A('replay c 确定性终态:generation_* 终场（interview failed+预留 released+interview_unavailable:terminal）',
    statusC?.status === 'failed' && consC.rows[0]?.status === 'released'
    && termC.some((row) => row['kind'] === 'interview_unavailable' && row['event_key'] === 'interview_unavailable:terminal'
      && String((((row['payload'] ?? null) as Row | null)?.reason) ?? '').startsWith('generation_')));

  // ══════════ 面1 重放臂 d：answer_evaluated payload evidence 缺键（undefined 不进 JSONB） ══════════
  console.log('\n──── 面1 重放臂 d：evidence 缺键孔径（:443-447 位·fail-closed 错形定稿）────');
  const iidD = `ag16-replay-d-${Date.now()}`;
  await seedInterview(iidD);
  const modelCountsD: Record<string, number> = {};
  const modelD = countingModel(scriptedLifecycleModel(0), modelCountsD);
  const cpD = new GenerationInterceptSaver();
  const dD = lifecycleDeps(cpD, iidD, modelD);
  const sD = await startAdaptiveInterview(dD, '后端工程师', ['限流改造']);
  A('replay d phase1:start → 首题 identity', !!sD.questionId);
  const inputD = { questionId: sD.questionId!, stateVersion: sD.stateVersion!, answerId: REPLAY_D_ANSWER_ID, answerHash: answerHash(ANSWER_WITH_HOOK), turn: 0, answer: ANSWER_WITH_HOOK };
  A('replay d:answer identity 被 API/DB ledger 接受', (await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iidD, inputD))).status === 'accepted');
  const gD = directCrashGraph(cpD, iidD, inputD, nodeCounter().observer);
  let crashedD: unknown = null;
  try { await gD.invoke(new Command({ resume: { answerId: inputD.answerId } }), { configurable: { ['thread_id']: iidD } }); } catch (e) { crashedD = e; }
  A('replay d 形①:坠点合成（transcript 已含本题答案·next 非空·无 pending）',
    (crashedD instanceof Error) && crashedD.message === CRASH_MSG
    && (await inspectWith(cpD, iidD)).pending === null);
  const requestD = await seedScoreRequest(iidD, inputD.questionId, 1, ANSWER_WITH_HOOK, `ag16-replay-d-${inputD.questionId}`);
  A('replay d F-1:score_request 已 seed（在途）', requestD !== null && (await scoreRequestStatus(iidD)) === 'pending');
  cpD.arm(latestCheckpointId(cpD, iidD), {
    pendingKeys: PENDING_STRIP_KEYS, transcriptLastKeys: TRANSCRIPT_LAST_STRIP_KEYS, mindToEmptyCompetencies: true, channelKeys: [],
  });
  const rD = await submitAdaptiveAnswer(lifecycleDeps(cpD, iidD, modelD, undefined, 'ag16-replay-d-lease'), inputD);
  const evalRowD = (await eventRows(iidD)).find((row) => row['kind'] === 'answer_evaluated');
  const evalPayloadD = (evalRowD?.payload ?? null) as Row | null;
  A('replay d evidence 缺键:answer_evaluated payload 零 evidence 键（旧世代剥后回合·undefined 不进 JSONB）',
    evalPayloadD !== null && !('evidence' in evalPayloadD) && evalPayloadD?.questionId === inputD.questionId);
  const cardD = await scoreCardCount(iidD, inputD.questionId);
  A('replay d 同形伴生:score_card 行数=0+request 仍在途（同 replay 驱动形·:511 空序门 operative）',
    cardD.rows === 0 && (await scoreRequestStatus(iidD)) === 'pending' && rD.degraded === true);

  // ══════════ 面2 版本失配：顶层整键缺席+未知遗留键 → 与无该键对照逐字节一致·两遍同形 ══════════
  console.log('\n──── 面2 版本失配：channel_values 缺新代通道键+未知遗留键 → 缺省臂纪实（三臂对照）────');
  const face2Run = async (suffix: string, strip: boolean) => {
    const iid = `ag16-face2-${suffix}-${Date.now()}`;
    await seedInterview(iid);
    const model = scriptedLifecycleModel(99);
    const cp = new GenerationInterceptSaver();
    const s = await startAdaptiveInterview(lifecycleDeps(cp, iid, model), '后端工程师', ['限流改造']);
    if (strip) {
      cp.arm(latestCheckpointId(cp, iid), {
        pendingKeys: [], transcriptLastKeys: [], mindToEmptyCompetencies: false,
        channelKeys: FACE2_CHANNEL_KEYS, injectLegacyKey: FACE2_LEGACY_KEY,
      });
    }
    const input = { questionId: s.questionId!, stateVersion: s.stateVersion!, answerId: FACE2_ANSWER_ID, answerHash: answerHash(ANSWER_WITH_HOOK), turn: 0, answer: ANSWER_WITH_HOOK };
    const claim = await asPrincipal(pool, OWNER, (c) => claimInterviewAnswer(c, OWNER, iid, input));
    if (claim.status !== 'accepted') throw new Error(`face2_${suffix}_claim_${claim.status}`);
    const r = await submitAdaptiveAnswer(lifecycleDeps(cp, iid, model), input);
    const rows = await eventRows(iid);
    return {
      iid, questionId: input.questionId, result: r,
      projection: JSON.stringify(rows.map((row) => [String(row['kind']), String(row['event_key']), JSON.stringify(row['payload'])])),
      semanticProjection: JSON.stringify(
        rows.filter((row) => row['kind'] !== 'generation_started')
          .map((row) => [String(row['kind']), String(row['event_key']), JSON.stringify(row['payload'])]),
      ),
      telemetryCount: rows.filter((row) => row['kind'] === 'generation_started').length,
      questionCount: rows.filter((row) => row['kind'] === 'question_ready').length,
    };
  };
  const face2Stripped = await face2Run('stripped', true);
  const face2Control = await face2Run('control', false);
  const face2StrippedAgain = await face2Run('again', true);
  A('面2 缺键形 resume 确定性推进:评分 100+下一题在场（缺失键走 channel 缺省臂·未知键读侧忽略）',
    face2Stripped.result.score === 100 && !!face2Stripped.result.nextQuestionId && face2Stripped.questionCount === 2);
  A('面2 遥测事件同形:generation_started 恰 1/臂（payload 内嵌 thread identity+墙钟·跨 interview 非同构·单列不计）',
    face2Stripped.telemetryCount === 1 && face2Control.telemetryCount === 1 && face2StrippedAgain.telemetryCount === 1);
  A('面2 与「无该键」对照逐字节一致:语义投影序列（kind+event_key+payload·question_ready/answer_evaluated 等）恒等（固定 UUID 入参纪律）',
    face2Stripped.semanticProjection === face2Control.semanticProjection);
  A('面2 两遍同形:同形二遍语义投影恒等', face2StrippedAgain.semanticProjection === face2Stripped.semanticProjection);
  A('面2 未知遗留键零害:failClosed 零触（degraded 零发射·concluded 未置）',
    face2Stripped.result.done === false && face2Stripped.result.degraded === false);

  // ══════════ 面3 中断点确定性：裸图双 Command(resume)·双克隆实例各自直驱 ══════════
  console.log('\n──── 面3 中断点确定性：storage+writes 双 map 双层深拷 → 裸图双 resume 落点恒等 ────');
  const sourceSaver = new MemorySaver();
  const drive0Counts: Record<string, number> = {};
  const drive0AskLog: string[] = [];
  const gS = buildAdaptiveInterviewGraph(sourceSaver, bareDeps(drive0Counts, drive0AskLog));
  const face3Cfg = { configurable: { ['thread_id']: 'ag16-face3-thread' } };
  await gS.invoke({}, face3Cfg);
  const snapS0 = await inspectWith(sourceSaver, 'ag16-face3-thread');
  const cloneA = cloneSaverMaps(sourceSaver, true);
  const cloneB = cloneSaverMaps(sourceSaver, true);
  const cloneShallow = cloneSaverMaps(sourceSaver, false);
  const snapA0 = await inspectWith(cloneA, 'ag16-face3-thread');
  const snapB0 = await inspectWith(cloneB, 'ag16-face3-thread');
  A('面3 重复 getState 恒等:源与双克隆 pre-resume 形态一致（q1 pending·next=[awaitAnswer]）',
    snapS0.pending !== null && snapA0.pending?.questionId === snapS0.pending.questionId
    && snapB0.pending?.questionId === snapS0.pending.questionId
    && snapA0.next[0] === 'awaitAnswer' && snapB0.next[0] === 'awaitAnswer');
  const countsA: Record<string, number> = {};
  const askLogA: string[] = [];
  const countsB: Record<string, number> = {};
  const askLogB: string[] = [];
  const gA = buildAdaptiveInterviewGraph(cloneA, bareDeps(countsA, askLogA));
  await gA.invoke(new Command({ resume: FACE3_RESUME }), face3Cfg);
  const snapA1 = await inspectWith(cloneA, 'ag16-face3-thread');
  A('面3 深拷隔离证:A 实例 resume 落写零漏进 B（B 仍停 q1 旧世代·浅拷共享内层 map 必串染）',
    snapA1.pending?.questionId !== snapS0.pending?.questionId
    && (await inspectWith(cloneB, 'ag16-face3-thread')).pending?.questionId === snapS0.pending?.questionId);
  const gShallow = buildAdaptiveInterviewGraph(cloneShallow, bareDeps({}, []));
  await gShallow.invoke(new Command({ resume: FACE3_RESUME }), face3Cfg);
  const snapS1 = await inspectWith(sourceSaver, 'ag16-face3-thread');
  A('面3 浅拷对照（判别器有牙）:共享内层 map 的实例 resume 串染回源（S 被 C 推进=q2·恒等假象形态在案）',
    snapS1.pending?.questionId === snapA1.pending?.questionId);
  const gB = buildAdaptiveInterviewGraph(cloneB, bareDeps(countsB, askLogB));
  await gB.invoke(new Command({ resume: FACE3_RESUME }), face3Cfg);
  const snapB1 = await inspectWith(cloneB, 'ag16-face3-thread');
  A('面3 落点恒等:双克隆实例各自 resume 后 next/pending identity/stateVersion/末回合评分全等',
    snapA1.next[0] === 'awaitAnswer' && snapB1.next[0] === 'awaitAnswer'
    && snapA1.pending?.questionId === snapB1.pending?.questionId
    && snapA1.stateVersion === snapB1.stateVersion
    && snapA1.transcript[snapA1.transcript.length - 1]?.score === 100
    && snapB1.transcript[snapB1.transcript.length - 1]?.score === 100);
  A('面3 awaitAnswer 首行重放（节点计数）:plan 零执行（非 START 重开）·awaitAnswer 两代各 1（旧 interrupt 重放+新 interrupt 到达）·evalAnswer/decide/genQuestion 各恰 1',
    (countsA['plan'] ?? 0) === 0 && (countsA['awaitAnswer'] ?? 0) === 2
    && (countsA['evalAnswer'] ?? 0) === 1 && (countsA['decide'] ?? 0) === 1 && (countsA['genQuestion'] ?? 0) === 1
    && (countsB['plan'] ?? 0) === 0 && (countsB['awaitAnswer'] ?? 0) === 2
    && (countsB['evalAnswer'] ?? 0) === 1 && (countsB['decide'] ?? 0) === 1 && (countsB['genQuestion'] ?? 0) === 1);
  A('面3 genQuestion 零重执行/ask 零重问:被打断回合零重问·恰一次新问（出题键同形）',
    JSON.stringify(askLogA) === JSON.stringify(['缓存@1']) && JSON.stringify(askLogB) === JSON.stringify(['缓存@1']));

  console.log(`\n${fail === 0 ? '✓ AG-16 残面:旧 checkpoint resume 三面（fresh/重放/版本失配/中断点确定性）全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e: unknown) => { console.error('✗', e instanceof Error ? e.stack : e); process.exit(1); });
