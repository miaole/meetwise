import { Annotation } from '@langchain/langgraph';
import {
  initMind,
  type CompetencySpec,
  type DecisionProvenance,
  type InterviewMind,
  type QuestionGenerationProvenance,
  type QuestionGenerationResult,
  type QuestionKind,
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
}

export interface ClarifyDirective {
  competency: string;
  question: string;
  hint: string;
  sources: string[];
  critique: string[];
  qkind: QuestionKind;
}

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
  competencyKeywords?: Record<string, string[]>;
  retrieveAndGenerate: (
    competency: string,
    difficulty: number,
    attempt: number,
    turn: number,
    facts: string[],
    kind: QuestionKind,
  ) => Promise<QuestionGenerationResult | { question: string; sources: string[] }>;
  /** 评分故障必须 unscored，不能把 provider 不可用写成候选人 50 分；status 缺失兼容既有 scripted deps。 */
  /** identity 是已落库 pending question 的业务身份；评分内部 repair 必须复用它，绝不能另造回合。 */
  assess: (
    question: string,
    answer: string,
    competency: string,
    turn: number,
    identity?: Pick<PendingQuestion, 'questionId' | 'stateVersion'>,
  ) => Promise<
    | { status?: 'scored'; score: number; evidence: string[]; relevant: boolean; hasHook?: boolean }
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
  route: Annotation<{ competency: string; difficulty: number; qkind: QuestionKind } | 'conclude' | null>({
    reducer: (_, b) => b,
    default: () => null,
  }),
  clarify: Annotation<ClarifyDirective | null>({ reducer: (_, b) => b, default: () => null }),
  pending: Annotation<PendingQuestion | null>({ reducer: (_, b) => b, default: () => null }),
  submitted: Annotation<SubmittedAnswerRef | null>({ reducer: (_, b) => b, default: () => null }),
  /** 业务逻辑版本，独立于 LangGraph checkpoint id；跨标签页在 API ledger 中做 CAS/去重。 */
  stateVersion: Annotation<number>({ reducer: (_, b) => b, default: () => 0 }),
  degraded: Annotation<{ reason: string; turn: number } | null>({ reducer: (_, b) => b, default: () => null }),
  /** Fail-closed generation receipt. Never holds the invented stem. */
  generationProvenance: Annotation<QuestionGenerationProvenance | null>({ reducer: (_, b) => b, default: () => null }),
  concluded: Annotation<boolean>({ reducer: (_, b) => b, default: () => false }),
  /** 收尾出处;缺省兼容旧 checkpoint。不含答案原文或证据全文。worker/SSE/report 不读。 */
  concludeReason: Annotation<DecisionProvenance | null>({ reducer: (_, b) => b, default: () => null }),
});

export type AdaptiveInterviewGraphState = typeof AdaptiveInterviewState.State;
