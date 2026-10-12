import { Annotation } from '@langchain/langgraph';
import {
  initMind,
  type CompetencySpec,
  type DecisionProvenance,
  type InterviewMind,
  type QuestionGenerationProvenance,
  type QuestionGenerationResult,
  type QuestionKind,
  type ScoredCriterionDisposition,
} from '@meetwise/domain';

export interface Turn {
  questionId: string;
  stateVersion: number;
  /**
   * 已完成回合的 checkpoint 审计投影。原始 answer 只在 `submitted` 中短暂存在，供本轮
   * `assess` 使用；无论 scored/clarify/unresolved/unscored，投影后都不得再复制一份到
   * transcript。业务原文的保留、加密与删除权由图外业务存储负责，checkpoint 不承担它。
   */
  q: string;
  competency: string;
  score: number | null;
  sources: string[];
  critique: string[];
  outcome: 'answered' | 'clarify' | 'unresolved' | 'unscored';
  relevant: boolean;
  kind: QuestionKind;
  hint?: string;
  reason?: string;
  /**
   * #52 v6（SCORE-WRITER S2）：v6 评估回合的 0103 契约档位证据（criterionId+disposition+
   * utf8_byte span+spanDigest——派生物，**不含答案原文/引文原文**）。经 evaluate-answer 节点
   * 从 assess 结果透传，投影后随 checkpoint 复用（at-least-once 重放仍可写卡）；
   * 非 v6 评估回合（deterministic 非作答/clarify/unscored/旧 checkpoint）缺省无此字段。
   */
  dispositions?: ScoredCriterionDisposition[];
  /**
   * EVIDENCE-DELIVERY S1：模型评分判据（criterion 列表，来自 invoke 评估证据）——**模型判据非用户
   * 原文**；quote 逐字引文永不入 checkpoint/transcript（沿上方投影纪律：原文的保留、加密与删除权
   * 由图外业务存储负责）。仅 answered 回合写入；clarify/unresolved/unscored/旧 checkpoint 缺省无此键。
   */
  evidence?: string[];
}

export interface ClarifyDirective {
  competency: string;
  question: string;
  hint: string;
  sources: string[];
  critique: string[];
  qkind: QuestionKind;
  /**
   * billing P1（BILL1-TOPIC-FIELDS 修法⑤）：澄清双因显式 cause——「用户答非所问」='non_answer'
   * （图侧确定性 isNonAnswer 直派）、「引文核验失败」='quote_unverifiable'（assess quote_repair_exhausted
   * 源）。模型判跑题（relevant=false 无 cause）缺省 undefined=cause 不入澄清指令。纯枚举标识符，
   * 与 qkind 同类，可入 checkpoint。
   */
  clarifyCause?: 'non_answer' | 'quote_unverifiable';
}

/** billing P1（BILL1-TOPIC-FIELDS 修法③）：出题方式三值枚举（C14 边界=纯标识符·非 facts 非原文）。 */
export type QuestionAskMode = 'pivot' | 'probe' | 'clarify';

/**
 * A durable graph state may identify an answer but must never contain it.
 * The worker resolves this reference from its short-lived, owner-scoped input
 * boundary only while the evaluation node is running.
 */
export interface SubmittedAnswerRef {
  questionId: string;
  answerId: string;
}

/** 图、业务 question ledger 和 SSE 共用的 pending identity；ID 可复算，权限来自 owner-scoped ledger 而非不可猜性。 */
export interface PendingQuestion {
  questionId: string;
  stateVersion: number;
  turn: number;
  question: string;
  competency: string;
  difficulty: number;
  kind: QuestionKind;
  sources: string[];
  critique: string[];
  hint?: string;
  /**
   * #256 显示面形制 A（additive 可选·向后兼容）：发射时点的自适应软预算约数（=decide 后 mind.maxTurns，
   * domain rememberDecision 已含 raise 后现值）。仅供显示「预计约 M 题（自适应，可能调整）」——
   * 软预算可上调，非承诺非上限；旧 checkpoint/旧流缺省 undefined，消费者必须降级。
   */
  plannedTurns?: number;
  /**
   * billing P1（BILL1-TOPIC-FIELDS 修法③④⑤·additive 可选·向后兼容）：话题维度三标识符——
   * askMode=出题方式（pivot=话题主问题/probe=同能力追问/clarify=澄清重发）；topicId=话题归集键
   * （主问题填自己的 question_id，追问和澄清填主问题的 id；旧行为空=不按话题计费）；clarifyCause=
   * 澄清双因（仅 clarify 重发行携带）。三者均为纯枚举/标识符（C14 边界=与 questionId/kind 同类），
   * 旧 checkpoint 缺省 undefined，持久化层对 undefined 写 NULL。
   */
  askMode?: QuestionAskMode;
  topicId?: string;
  clarifyCause?: 'non_answer' | 'quote_unverifiable';
}

export interface AdaptiveDeps {
  competencies: (string | CompetencySpec)[];
  /**
   * C4/C13(RESUME-GROUNDING):有界脱敏 facts 池——仅存活于 worker deps 闭包(buildAdaptiveDeps 持有),
   * 经 `<data-nonce>` 围栏直达模型 seam(planner/grounded ask),**禁入图 state/checkpoint/interrupt/
   * SSE/episode**。图拓扑从本字段只派生授权位(`genQuestion` 的 grounded→fundamental 降级判定),
   * 调 `retrieveAndGenerate` 时 facts 形参恒传空数组;模型产出的 grounded 题面属派生内容可持久化,
   * 其擦除残差(interview_event/题面 ledger/memory episode/ai_invocation_trace.output 中的事实派生片段)
   * 登记 Non-claims 并归 #183/#153 PRIVACY-FACE 收口(EXTREV-7 铁律 2:流动属 RESUME-GROUNDING 管辖,
   * 持久化生命周期属未建删除面,不阻塞)。
   */
  resumeFacts?: string[];
  /** Non-sensitive authorization bit; unlike resume facts it is safe in a graph dependency. */
  resumeProfileAvailable?: boolean;
  maxTurns?: number;
  /** 平台 runaway 杀开关;未设则默认 120(长时面试档)。隔离 E2E 可压低控费。 */
  absoluteMaxTurns?: number;
  /**
   * H4 WEAKNESS-LOOP R3(#252 专项面):focus 弱项标签(本场报告 gap 维度名,worker deps 闭包携带)。
   * 只进 plan 节点 → initMind 派生 5-8 题专项软预算(「考多久」面);**绝不入图 state/checkpoint,
   * 也绝不影响难度/confidence**(反 confirmation-bias 铁律:难度仍中性 2 起、confidence 恒 0 起)。缺省=通用面零触。
   */
  focusWeaknesses?: string[];
  competencyKeywords?: Record<string, string[]>;
  retrieveAndGenerate: (
    competency: string,
    difficulty: number,
    attempt: number,
    turn: number,
    facts: string[],
    kind: QuestionKind,
    /**
     * AG-F(刀F·裁决⑤a):已问题面(transcript q 集)——供 worker seam 的 critique 复检收进
     * re-roll 骨架（off-competency/重复题面在 seam 内即触发有界重掷）。additive 可选:既有
     * scripted deps/直接调用零改;只含题面文本,与 transcript 同源,无新增敏感面。
     */
    asked?: string[],
  ) => Promise<QuestionGenerationResult | { question: string; sources: string[] }>;
  /** 评分故障必须 unscored，不能把 provider 不可用写成候选人 50 分；status 缺失兼容既有 scripted deps。 */
  /** identity 是已落库 pending question 的业务身份；评分内部 repair 必须复用它，绝不能另造回合。 */
  assess: (
    question: string,
    answer: string,
    competency: string,
    turn: number,
    identity?: Pick<PendingQuestion, 'questionId' | 'stateVersion' | 'topicId'>,
  ) => Promise<
    | {
        status?: 'scored'; score: number; evidence: string[]; relevant: boolean; hasHook?: boolean;
        /** #52 v6：0103 契约档位证据（派生物，无答案原文）；v6 评分回合必须供给。 */
        dispositions?: ScoredCriterionDisposition[];
        /**
         * billing P1（BILL1-TOPIC-FIELDS 修法⑤）：澄清双因显式 cause——quote_repair_exhausted 源
         * =『quote_unverifiable』、剥离后非作答源=『non_answer』（两源在图侧合流点拆分）。
         * 纯附加字段：score/relevant/evidence/dispositions 既有值逐位不变；模型判跑题
         * （relevant=false 无钉因）缺省 undefined。
         */
        clarifyCause?: 'non_answer' | 'quote_unverifiable';
      }
    | { status: 'unscored'; reason: string }
  >;
  /**
   * Hydrates one answer only for the running evaluation node. The return value
   * must not be returned by any node or stored in a checkpoint. A missing or
   * mismatched artifact is a controlled unscored outcome.
   */
  loadAnswer: (reference: Pick<SubmittedAnswerRef, 'answerId'>) => Promise<string>;
  /**
   * Optional vendor-neutral node observer. It receives only graph topology and
   * numeric state, never facts, questions, answers or checkpoint contents.
   */
  graphObserver?: {
    runNode<T>(input: {
      graph: string;
      node: 'plan' | 'decide' | 'genQuestion' | 'awaitAnswer' | 'evalAnswer' | 'conclude';
      turn: number;
      stateVersion: number;
      release: string;
    }, action: () => T | Promise<T>): Promise<T>;
  };
}

export const AdaptiveInterviewState = Annotation.Root({
  mind: Annotation<InterviewMind>({ reducer: (_, b) => b, default: () => initMind([]) }),
  transcript: Annotation<Turn[]>({ reducer: (a, b) => a.concat(b), default: () => [] }),
  route: Annotation<{ competency: string; difficulty: number; qkind: QuestionKind; mode?: QuestionAskMode } | 'conclude' | null>({
    reducer: (_, b) => b,
    default: () => null,
  }),
  clarify: Annotation<ClarifyDirective | null>({ reducer: (_, b) => b, default: () => null }),
  pending: Annotation<PendingQuestion | null>({ reducer: (_, b) => b, default: () => null }),
  /**
   * billing P1（BILL1-TOPIC-FIELDS 修法④）：当前话题主问题 id（纯标识符·C14 边界可 checkpoint）。
   * pivot 发射时=新 questionId 自己；probe/clarify 继承不写。旧 checkpoint 缺省 null →
   * probe/clarify 的 topicId 落 NULL（不按话题计费语义，additive 兼容）。
   */
  topicMainQuestionId: Annotation<string | null>({ reducer: (_, b) => b, default: () => null }),
  submitted: Annotation<SubmittedAnswerRef | null>({ reducer: (_, b) => b, default: () => null }),
  /** 业务逻辑版本，独立于 LangGraph checkpoint id；跨标签页在 API ledger 中做 CAS/去重。 */
  stateVersion: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
  degraded: Annotation<{ reason: string; turn: number } | null>({ reducer: (_, b) => b, default: () => null }),
  /** Fail-closed generation receipt. Never holds the invented stem. */
  generationProvenance: Annotation<QuestionGenerationProvenance | null>({ reducer: (_, b) => b, default: () => null }),
  concluded: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
  /**
   * AG-F(刀F·裁决②a):连续 competency 出题族耗尽计数（换序继续面)。0=无;每次「耗尽→顺延换序」
   * +1;成功出题归零（只统计连续耗尽）。达帽（generate-question 节点 MAX_COMPETENCY_EXHAUST_SWITCH）
   * 后再耗尽 → 既有 failClosed 真终场。控制面元数据:纯数字、无题面/答案/事实内容,checkpoint 安全。
   */
  competencyExhaustions: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
  /** 收尾出处;缺省兼容旧 checkpoint。不含答案原文或证据全文。worker/SSE/report 不读。 */
  concludeReason: Annotation<DecisionProvenance | null>({ reducer: (_, b) => b, default: () => null }),
});

export type AdaptiveInterviewGraphState = typeof AdaptiveInterviewState.State;
