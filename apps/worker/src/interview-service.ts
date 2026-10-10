/**
 * 面试应用服务（**生产代码**,非 demo）：把模型经 invoke 关口接进各图节点。worker 真跑、api 触发都用它;
 * 模型客户端由**配置注入**(生产默认 openAICompatibleClient 真模型;测试注入 scriptedModelClient;未配置则降级)。
 * 模型输出 schema 是契约,业务校验是第二道闸——双校验、幂等 trace、旁路不可绕,全在 invoke 里。
 */
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { asErr, SCORING_SEED_CRITERION_ID, type DbPool } from '@meetwise/db';
import { invoke, getPrompt, promptedModel, openAICompatibleClient, failoverModel, isTextBackupEnabled, type ModelClient, type ModelCostPolicy } from '@meetwise/ai-runtime';
import { aggregateScores, computeDeterministicTotal, scoreDispositionFromCodeUnitSpan, groundedByFacts, type ScoredCriterionDisposition } from '@meetwise/domain';
import { DIAGNOSIS_SECTION_KINDS, validateReportContent, type GenerateQuestions, type GenerateReport, type GenerateDiagnosis, type QuizItem, type RawDiagnosis, type ReportContent, type InterviewSummary } from '@meetwise/ai-graphs';
import { withGenerationProgress } from './generation-progress.ts';

export const QuizSchema = z.object({ items: z.array(z.object({ q: z.string().min(1).max(2000), refs: z.array(z.string()) })) });   // q 封顶:模型出题理应短,超长=异常输出 → schema 闸拦下并以失败/降级收口
/**
 * #52 v6 评分证据：模型只直出 **criterionId（取自 <data> 量表）+ 判定档位 + 逐字引文**，
 * 绝不出总分（0103 契约：总分由服务端确定性计算）。v5 的自由 0-100 hint 分契约已随
 * D6 过渡桥一并废除（S2 rg 门零残留）。
 */
export const ScoreEvidenceSchema = z.object({
  criterionId: z.string().trim().min(1).max(240),
  disposition: z.enum(['below', 'meets', 'exceeds']),
  quote: z.string().trim().min(1).max(500),
});
export type ScoreEvidence = z.infer<typeof ScoreEvidenceSchema>;
/** 可审计但不保存候选人原文的证据形式：用解密的答案+span+hash 可重验（+v6 档位）。 */
export interface ScoreEvidenceRecord {
  criterionId: string;
  disposition: 'below' | 'meets' | 'exceeds';
  start: number;
  end: number;
  quoteSha256: string;
}

// v6：relevant:答案是否正面回应本题(off-topic/非作答 → false + 全分项 below)。hasHook 是实际
// 图分支信号，不能被 Zod 默认 strip 掉。dispositions 用结构化引文+档位代替不可核实的自由文本与总分。
export const EvalSchema = z.object({
  relevant: z.boolean().optional().default(true),
  hasHook: z.boolean().optional().default(false),
  dispositions: z.array(ScoreEvidenceSchema).min(1).max(6),
}).superRefine((value, ctx) => {
  if (!value.relevant && value.dispositions.some((d) => d.disposition !== 'below')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dispositions'], message: 'irrelevant_dispositions_must_be_below' });
  }
  if (!value.relevant && value.hasHook) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hasHook'], message: 'irrelevant_has_hook_must_be_false' });
  }
  const ids = new Set<string>();
  for (const d of value.dispositions) {
    if (ids.has(d.criterionId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dispositions'], message: 'duplicate_criterion_id' });
      break;
    }
    ids.add(d.criterionId);
  }
});

/** report 模型只负责叙事；overall 由后端对 scores 确定性聚合，不接受模型自行计算。 */
export const ReportSchema = z.object({
  sections: z.array(z.object({ title: z.string().trim().min(1).max(160), body: z.string().trim().min(1).max(6000) })).min(1).max(12),
});

export type ScoredEvaluation = {
  status: 'scored';
  /** 确定性派生 hint（computeDeterministicTotal of 档位×量表权重），非模型输出——v6 起模型不出总分。 */
  score: number; relevant: boolean; hasHook: boolean;
  /** criterionId 列表（weaknesses/追问上下文供料，既有语义）。 */
  evidence: string[];
  /** trace 存储形状（quote 不落盘：span+hash+档位）。 */
  evidenceRecords: ScoreEvidenceRecord[];
  /** 0103 契约证据（utf8_byte span+digest，随图 transcript 供 score-writer；无答案原文）。 */
  dispositions: ScoredCriterionDisposition[];
};
export type UnscoredEvaluation = {
  status: 'unscored'; reason: string; score?: never; relevant?: never; hasHook?: never;
  evidence: []; evidenceRecords: []; dispositions: [];
};
export type EvaluationOutcome = ScoredEvaluation | UnscoredEvaluation;

/** evaluate 期量表分项（v6：<data> 量表供源；种子期=SCORING_SEED_CRITERION_ID 单分项）。 */
export interface EvaluationRubricCriterion { criterionId: string; weight: number }

/** 评分期量表种子（S1 D1 发布侧同款单分项；与 @meetwise/db SCORING_SEED_CRITERION_ID 同源单点）。
 *  多分项 rubric 语料与评分期 DB 读取面（DEFINER）归 EXTREV-4 QBANK-CORPUS 扩项域。 */
export const EVALUATION_SEED_CRITERIA: EvaluationRubricCriterion[] = [{ criterionId: SCORING_SEED_CRITERION_ID, weight: 1 }];

/** 只有引文可以在候选人的本题答案里逐字找到，且 criterionId 必须取自供给量表，证据才能进业务路径。 */
export function validateEvaluationEvidence(
  value: z.infer<typeof EvalSchema>, answer: string,
  criteria: readonly EvaluationRubricCriterion[] = EVALUATION_SEED_CRITERIA,
): string | null {
  const allowed = new Set(criteria.map((c) => c.criterionId));
  const seen = new Set<string>();
  for (const item of value.dispositions) {
    if (!allowed.has(item.criterionId)) return 'criterion_not_in_rubric';
    if (!answer.includes(item.quote)) return 'evidence_quote_not_in_answer';
    const key = `${item.criterionId}\u0000${item.quote}`;
    if (seen.has(key)) return 'duplicate_evidence';
    seen.add(key);
  }
  return null;
}

function quoteDigest(quote: string): string {
  return createHash('sha256').update(quote, 'utf8').digest('hex');
}

/** 模型返回的 quote 只在本次校验时留存于内存；落 trace/cache 前必须替换为可重验 span+hash+档位。 */
function toEvidenceRecord(answer: string, item: ScoreEvidence): ScoreEvidenceRecord {
  const start = answer.indexOf(item.quote);
  return { criterionId: item.criterionId, disposition: item.disposition, start, end: start + item.quote.length, quoteSha256: quoteDigest(item.quote) };
}

function isStoredEvidence(item: unknown): item is ScoreEvidenceRecord {
  return !!item && typeof item === 'object' && 'quoteSha256' in item && 'start' in item && 'end' in item;
}

function persistedEvaluation(value: z.infer<typeof EvalSchema>, answer: string) {
  return {
    ...value,
    dispositions: value.dispositions.map((item) => toEvidenceRecord(answer, item)),
  };
}

/** 同一 turn 的不同答案必须绝不共用一份缓存评分；哈希不向 trace 泄露原答案。 */
export function evaluationIdempotencyKey(baseKey: string, answer: string): string {
  const answerHash = createHash('sha256').update(answer, 'utf8').digest('hex');
  return `${baseKey}:answer:${answerHash}`;
}

/** The current evidence schema is still a stopgap before SCOR-01/02. */
export const EVALUATION_RUBRIC_VERSION = getPrompt('mock-interview.evaluate').version;

export type EvaluationInvokeResult =
  | { status: 'scored'; value: z.infer<typeof EvalSchema>; primaryIdempotencyKey: string }
  | { status: 'quote_repair_exhausted'; error: 'business:evidence_quote_not_in_answer'; primaryIdempotencyKey: string }
  | { status: 'failed'; error: string; primaryIdempotencyKey: string };

export interface EvaluationInvokeInput {
  /** 必须包含业务回合 identity；调用者不允许为 repair 新造 turn。 */
  baseIdempotencyKey: string;
  threadId?: string;
  /** Deletion authorization is independent from trace grouping. */
  privacyInterviewId?: string;
  question: string;
  answer: string;
  model: ModelClient;
  /** v6 量表（criterionId 白名单+权重）；缺省=种子单分项（与发布侧 D1 同源单点）。 */
  criteria?: EvaluationRubricCriterion[];
}

function evaluationModel(model: ModelClient, question: string, answer: string, criteria: readonly EvaluationRubricCriterion[]) {
  const prompt = getPrompt('mock-interview.evaluate');
  return promptedModel(model, prompt.service, { question, answer, criteria, rubricVersion: prompt.version });
}

/**
 * 评分 invoke 的唯一入口。
 *
 * - 首次输出必须通过 EvalSchema + validateEvaluationEvidence；不降低审计标准。
 * - quote 不匹配是已经派发后的业务失败，只能请求候选人同题澄清，不能用 repair key 再调用模型。
 * - 该函数没有事件、权益或能力画像写入；调用方仍只会消费一次 graph assess 结果。
 */
export async function invokeEvaluationOnce(pool: DbPool, owner: string, input: EvaluationInvokeInput): Promise<EvaluationInvokeResult> {
  const primaryIdempotencyKey = evaluationIdempotencyKey(input.baseIdempotencyKey, input.answer);
  const criteria = input.criteria ?? EVALUATION_SEED_CRITERIA;
  // `invoke` 自身使用持久 claim；不再用 advisory transaction 锁包住模型 RPC。
  const primary = await invoke({
    idempotencyKey: primaryIdempotencyKey,
    operation: { id: 'interview.answer-scoring.v1', businessRevision: primaryIdempotencyKey },
    threadId: input.threadId,
    privacyInterviewId: input.privacyInterviewId,
    schema: EvalSchema,
    businessValidate: (v) => validateEvaluationEvidence(v, input.answer, criteria),
    storeOutput: (v) => persistedEvaluation(v, input.answer),
    model: evaluationModel(input.model, input.question, input.answer, criteria),
  }, pool, owner);
  if (!('error' in primary)) return { status: 'scored', value: primary.value, primaryIdempotencyKey };
  if (primary.error === 'business:evidence_quote_not_in_answer')
    return { status: 'quote_repair_exhausted', error: primary.error, primaryIdempotencyKey };
  return { status: 'failed', error: primary.error, primaryIdempotencyKey };
}
/** 简历诊断结构化输出 schema(第一道闸:schema 校验;枚举/区间在此硬性表达)。 */
export const DiagnosisSchema = z.object({
  overall: z.number().min(0).max(100),
  summary: z.string(),
  sections: z.array(z.object({
    kind: z.enum(DIAGNOSIS_SECTION_KINDS),
    title: z.string().min(1),
    score: z.number().min(0).max(100).optional(),
    findings: z.array(z.object({ text: z.string().min(1), refs: z.array(z.string()) })),
  })),
  rewrites: z.array(z.object({ before: z.string(), after: z.string().min(1), refs: z.array(z.string()) })),
});

/** 生产默认模型客户端(真境内模型;未配 MODEL_* 时 openAICompatibleClient 自身降级为 transient)。 */
// MODEL-OP-02：并发限流 + 熔断已从「各适配器各自包一层」收编为 invoke() 内共享权威
// （ai_model_admission_acquire_scoped / ai_model_admission_record_scoped，迁移 0120）。
// 这里绝不再给端点包 rateLimitedModel/circuitBreaker——否则每端点各限各的、共享分区形同虚设，
// 且与 MODEL-OP-03/04 的节点矩阵/单一网关重复。端点只是纯 OpenAI-compatible 传输。
/** 一个模型端点 = 纯传输（无本地限流/熔断；共享准入/断路器在 invoke() 的共享权威层）。 */
function endpoint(cfg: { baseUrl?: string; apiKey?: string; model?: string; costPolicy?: ModelCostPolicy; backup?: boolean } = {}): ModelClient {
  return openAICompatibleClient(cfg);
}
/** 跨供应商 failover（故障转移）链：primary 由受控 profile 指定；备用以「MODEL_BACKUP_API_KEY 已挂载」为启用开关。
 *  endpoint 同样由受控 profile 解析（绝不接受自由 URL）。仅 primary 在派发前已知不可用时才选 backup。
 *  429/超时等已派发结果必须冻结为 unknown，不能把“不确定是否已扣费”误做秒级重发。
 *  不配 backup 则等价单端点（向后兼容）。
 *
 *  MODEL-OP-02 边界（诚实声明）：端点级「熔断打开 → 切 backup」的降级信号已随 per-adapter circuitBreaker
 *  移除——共享断路器现在住在 invoke() 的操作级（decision 非 admitted 直接返回 model_circuit_open /
 *  model_circuit_half_open / model_concurrency_exhausted 等确定性拒绝，不再触发本链 prepare 的降级）。
 *  端点级（per-provider）failover 与「单一网关统一路由」一并延后到 MODEL-OP-04。 */
function withFailover(model?: string, costs: { primary?: ModelCostPolicy; backup?: ModelCostPolicy } = {}, backupModel?: string): ModelClient {
  const primary = endpoint(model ? { model, costPolicy: costs.primary } : { costPolicy: costs.primary });
  // L3 fix: 这里过去直接读 process.env.MODEL_BACKUP_API_KEY 而不 trim，而 isTextBackupEnabled（同仓库
  // text-endpoint-config）用 `?.trim()` 判断——两边对「Key 是否挂载」的语义漂移（例如值含空白时一边启用、
  // 一边不启用）。复用 isTextBackupEnabled 保持单一开关语义，避免主/备路径各判各的。
  if (!isTextBackupEnabled(process.env)) return primary;
  const backup = endpoint({ backup: true, model: backupModel ?? process.env.MODEL_BACKUP_NAME ?? model, costPolicy: costs.backup });
  return failoverModel([primary, backup]);
}
/** 生产默认模型客户端(真境内模型 + 跨供应商 failover;未配 MODEL_* 时 openAICompatibleClient 自身降级为 transient)。 */
export function defaultModelClient(costs: { primary?: ModelCostPolicy; backup?: ModelCostPolicy } = {}): ModelClient { return withFailover(undefined, costs); }
/** 快模型(qwen-turbo 等):**约束性任务**(评分/relevant 判定、能力规划)用它——质量够、明显更快更省。同样带 failover。 */
export function fastModelClient(costs: { primary?: ModelCostPolicy; backup?: ModelCostPolicy } = {}): ModelClient {
  return withFailover(process.env.MODEL_FAST_NAME ?? 'qwen-turbo', costs, process.env.MODEL_FAST_BACKUP_NAME ?? process.env.MODEL_BACKUP_NAME);
}

/** 押题:resume-quiz 图的 generate。经 invoke(双校验:schema + 非空业务校验)+ 图侧 factuality 过滤幻觉。
 *  progressStream(TOKSTREAM 阶段1 · 可选):SSE 流键(=quizId)。传了即以包装层回调发生成进度事件
 *  (generation_started / generation_progress 节流持久写 interview_event);不传=与从前逐字节一致(零回归)。 */
export function quizGenerator(pool: DbPool, owner: string, resumeFacts: string[], idempotencyKey: string, model: ModelClient, progressStream?: string): GenerateQuestions {
  return async (): Promise<QuizItem[]> => {
    const call = async (): Promise<QuizItem[]> => {
      const out = await invoke({
        idempotencyKey, operation: { id: 'interview.quiz-generation.v1', businessRevision: idempotencyKey }, schema: QuizSchema,
        businessValidate: (v) => (v.items.length === 0 ? 'empty_quiz' : v.items.some((it) => !it.q.trim()) ? 'blank_question' : null),
        model: promptedModel(model, 'resume-quiz.generate', { facts: resumeFacts }),
      }, pool, owner);
      if ('error' in out) throw new Error('quiz:' + out.error);
      return out.value.items;
    };
    if (!progressStream) return call();
    return withGenerationProgress(pool, owner, progressStream, {
      jobKind: 'quiz', operationId: 'interview.quiz-generation.v1', attemptKey: idempotencyKey, segments: ['generate'],
    }, () => call());
  };
}

/** 改写建议封顶(防单帧/单串失控,审计 SRE 中危的纵深兜底)。 */
const MAX_REWRITES = 12, MAX_REWRITE_CHARS = 2000;
/** 数字接地闸:被断言文本里出现的每个数字串,必须在锚文本(原句 + 简历事实)里出现过——否则=虚构量化(造假最高发形态)。
 *  只拦阿拉伯数字串(QPS/百分比/年限/团队规模等可确定性检出者);中文数字/专有名词语义虚构属 LLM-judge 层,不在此过度声明。 */
function hasUngroundedNumber(text: string, anchors: string[]): boolean {
  const nums = text.match(/\d+/g);
  if (!nums) return false;
  return nums.some((n) => n.length >= 1 && !anchors.some((a) => a.includes(n)));
}

/**
 * 简历诊断:resume-diagnosis 图的 generate。经 invoke 双校验 + **分层接地业务闸**:
 *   ① schema 校验(枚举/区间)→ ② business validator:非空诊断;改写建议硬闸——
 *      refs 必须非空且接地于简历 facts(否则 fabricated_experience/rewrite_unanchored);
 *      **after 不得引入简历里没有的数字**(fabricated_metric——量化造假是简历虚构最高发、最可确定性检出的形态);
 *      条数/长度封顶(防失控 payload)。任一不过 → 整次诊断走失败路径(绝不交付一份教人编造经历的诊断)。
 * findings 的接地由图侧 validate 节点优雅过滤(亮点/匹配度等正面声明必须引证)。
 * 残留:refs 接地但正文语义虚构非确定性可拦,属 ai-eval/LLM-judge 层——不在此过度声明已解决。
 */
export function diagnosisGenerator(pool: DbPool, owner: string, resumeFacts: string[], role: string | undefined, idempotencyKey: string, model: ModelClient): GenerateDiagnosis {
  return async (): Promise<RawDiagnosis> => {
    const out = await invoke({
      idempotencyKey, operation: { id: 'resume.diagnosis.v1', businessRevision: idempotencyKey }, schema: DiagnosisSchema, service: 'resume-diagnosis.generate',
      businessValidate: (v) => {
        if (v.sections.length === 0) return 'empty_diagnosis';
        // 每条 finding 至少要有文字结论(schema 已保 min(1),此处守 trim 空白)。
        if (v.sections.some((sec) => sec.findings.some((f) => !f.text.trim()))) return 'blank_finding';
        if (v.rewrites.length > MAX_REWRITES) return 'too_many_rewrites';                // 封顶:防失控 payload(SRE 纵深)
        // **虚构经历硬闸(绝不虚构经历)**:改写建议必须锚定真实经历 + 不得编造量化数据。
        for (const r of v.rewrites) {
          if (r.before.length > MAX_REWRITE_CHARS || r.after.length > MAX_REWRITE_CHARS) return 'rewrite_too_long';
          if (r.refs.length === 0) return 'rewrite_unanchored';                          // 无锚=凭空改写
          if (!groundedByFacts(r.refs, resumeFacts)) return 'fabricated_experience';     // 引用了简历里没有的经历=虚构
          if (hasUngroundedNumber(r.after, [r.before, ...resumeFacts])) return 'fabricated_metric';   // after 编造了简历里没有的数字=量化造假
        }
        return null;
      },
      model: promptedModel(model, 'resume-diagnosis.generate', { facts: resumeFacts, role }),
    }, pool, owner);
    if ('error' in out) throw new Error('diagnosis:' + out.error);
    return out.value;
  };
}

/**
 * 评分:一题一答经 invoke。供应商/schema 失败是 `unscored`，不是 50 分。
 * 调用方必须发审计事件并排除出能力画像/报告聚合，不允许编造中性分数。
 * `idempotencyKey` 会作为 registry businessRevision 派发:必须满足
 * `/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/`(首字符字母数字,余下仅 `._:-`);否则
 * invoke 以 `model_operation_revision_invalid` fail-closed(不会派发,绝不静默吞掉)。
 */
/**
 * v6 派生（evaluateAnswer / 自适应 assess 共用单源）：schema 值 → 脱敏 records + 0103 契约
 * 证据 + 确定性 hint 分。cache 命中返回的已是脱敏 record；首次模型返回则在这里做一次脱敏转换。
 * 0103 证据（utf8_byte span+digest）由 records 唯一派生（domain 单源）——首次/缓存两条路径
 * 同形；答案明文只在调用内存态存活，派生物不含原文。hint 分 = 档位×量表权重的确定性派生
 * （非模型输出）；relevant=false 已被 schema 钉为全 below → 恒 0。
 */
export function evaluateOutcomeFromValue(value: z.infer<typeof EvalSchema>, answer: string): {
  score: number; evidence: string[]; evidenceRecords: ScoreEvidenceRecord[]; dispositions: ScoredCriterionDisposition[];
} {
  const evidenceRecords = value.dispositions.map((item) => isStoredEvidence(item) ? item : toEvidenceRecord(answer, item));
  const dispositions = evidenceRecords.map((r) =>
    scoreDispositionFromCodeUnitSpan(answer, r.criterionId, r.disposition, r.start, r.end));
  const score = computeDeterministicTotal(value.dispositions.map((d) => ({
    criterionId: d.criterionId, disposition: d.disposition,
    weight: EVALUATION_SEED_CRITERIA.find((c) => c.criterionId === d.criterionId)?.weight ?? 0,
  })));
  return { score, evidence: evidenceRecords.map((item) => item.criterionId), evidenceRecords, dispositions };
}

export async function evaluateAnswer(pool: DbPool, owner: string, idempotencyKey: string, question: string, answer: string, model: ModelClient): Promise<EvaluationOutcome> {
  {
    const out = await invokeEvaluationOnce(pool, owner, {
      baseIdempotencyKey: idempotencyKey, question, answer, model,
    });
    // 旧的非自适应调用方没有 clarify 分支，保守保持 unscored；自适应图会把
    // quote_repair_exhausted 转为同题澄清，见 adaptive-interview-service。
    if (out.status !== 'scored') return { status: 'unscored', reason: out.error, evidence: [], evidenceRecords: [], dispositions: [] };
    return { status: 'scored', relevant: out.value.relevant, hasHook: out.value.relevant && out.value.hasHook, ...evaluateOutcomeFromValue(out.value, answer) };
  }
}

/** 报告:report 图的 generate,经 invoke(空报告=业务校验失败)。
 *  progressStream(TOKSTREAM 阶段1 · 可选):SSE 流键(=interviewId)。语义同 quizGenerator 的 progressStream。
 *  #50 v3：buildData 传结构化维度摘要（逐题 competency/questionId/score + 证据 cardId 引用），
 *  不传题目/答案原文；overall 仍由 aggregateScores 确定性计算。 */
export function reportGenerator(pool: DbPool, owner: string, idempotencyKey: string, model: ModelClient, progressStream?: string): GenerateReport {
  return async (s: InterviewSummary): Promise<ReportContent> => {
    const overall = aggregateScores(s.scores); // 空集或越界 score 由确定性聚合门拒绝，不交给模型猜。
    const call = async (): Promise<ReportContent> => {
      const out = await invoke({
        idempotencyKey, operation: { id: 'report.narrative.v1', businessRevision: idempotencyKey }, schema: ReportSchema,
        businessValidate: (v) => {
          try { validateReportContent(s, { overall, sections: v.sections }); return null; }
          catch (error: unknown) { return (asErr(error)?.message ?? 'invalid_report') as string; }
        },
        model: promptedModel(model, 'report.generate', { scores: s.scores, items: s.items ?? [] }),
      }, pool, owner);
      if ('error' in out) throw new Error('report:' + out.error);
      return { overall, sections: out.value.sections };
    };
    if (!progressStream) return call();
    return withGenerationProgress(pool, owner, progressStream, {
      jobKind: 'report', operationId: 'report.narrative.v1', attemptKey: idempotencyKey, segments: ['generate'],
    }, () => call());
  };
}
