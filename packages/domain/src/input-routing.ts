/**
 * @meetwise/domain · 面试输入分流 + 超长作答策略（PRD-TEST-012 · CTX-01）纯域原语（零 IO、零模型、零 db）。
 *
 * CTX-01 拆解：
 * ① 面试路径对超长作答**只做确定性拒绝**（reject-only，无 segment），但**绝不**把摘要/压缩产物当
 *    评分证据——分段会改写作答、有污染评分证据的风险，且 model 侧 `capUserData('mock-interview.evaluate')`
 *    上限 12,000 > 面试上限 8,000（分段对面试作答永不触发），故 fail-closed 只 reject。评分只看原始作答，
 *    经 SCOR 的 `score_evidence` 链（span/digest 绑定 canonical answer artifact）。
 * ② 自由对话路径（CTX-03+ 才建的事件源/压缩）与本路径隔离——本模块只做「面试 vs 自由对话」的
 *    输入分流判断，不建自由对话链路本身（free_conversation_route 只是分流结果，无任何链路副作用）。
 * ③ 核心验收：超长作答被拒绝（进不了评分），评分事实（哪些证据进 score_evidence、最终
 *    deterministic_total）不得因超长而改变——评分事实只由 scoring-aggregation.ts 的
 *    computeDeterministicTotal / scoreSpanDigest / reverifyScoreEvidenceSpan 算，本模块不改公式，
 *    proof 复用它们证明「超长处理不改变它」。
 *
 * 复用（四原语不重实现）：
 *  - 确定性总分/证据复验：见上（scoring-aggregation.ts，SCOR-02，与迁移 0103 DB 逐值一致）。
 *  - span 单一坐标系：utf8_byte（memory-admission.ts，UTF-8 字节，与 PostgreSQL octet_length 一致）。
 *  - 显式 enum（禁布尔汤）：与 scoring-fact-root.ts 的 as-const 数组 + 派生联合类型同款。
 *
 * 边界：自由对话事件源/压缩（CTX-03/04）、派发前预算器（CTX-02）不在此；本模块是「判定」不是「实现」。
 */

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/**
 * 面试单条作答上限（字符，UTF-16 code unit）。与 packages/contracts 的 `ANSWER_MAX=8000` 语义一致——
 * 契约 zod `.max(8000)` 是入口第一线（超限 → 400），本常量是「超长策略判定」的单一真相（service 纵深兜底
 * → 413 answer_too_long）。8000 字对真实口述/打字作答足够宽；超长 = answer 会进 interview_job.payload(JSONB)
 * + checkpoint transcript + 队列的存储/放大攻击面。**不是 token 上限**（tokenizer 预算归 CTX-02）。
 */
export const INTERVIEW_ANSWER_MAX_LENGTH = 8000;

/** 输入分流结果（显式 enum，非布尔汤：不能用 `isInterview` 这类单布尔位表达多路由）。 */
export const INPUT_ROUTE_KINDS = ['interview_route', 'free_conversation_route'] as const;
export type InputRouteKind = (typeof INPUT_ROUTE_KINDS)[number];

/**
 * 超长作答处理策略（显式 enum）。当前**只实现 `reject`**（reject-only，无 segment）：
 * 分段会改写作答、有污染评分证据的风险，且 model 侧 `capUserData('mock-interview.evaluate')` 上限
 * 12,000 > 面试上限 8,000——分段对面试作答永不触发，故 fail-closed 只 reject、不保留误导性的 segment 分支。
 */
export const OVERLONG_POLICY_KINDS = ['reject'] as const;
export type OverlongPolicyKind = (typeof OVERLONG_POLICY_KINDS)[number];

/**
 * 分段形态（reject 恒为 'none'）。唯一的头部截断在 model 侧 `capUserData('mock-interview.evaluate')`
 * （ai-runtime/model-client.ts，上限 12,000，面试作答永不触发）——是「模型看到什么」的最后防线，
 * **不是本模块策略、也不是 score_evidence 证据源**（证据 span/digest 必须锚定原始 answer artifact）。
 */
export const SEGMENT_POLICIES = ['none'] as const;
export type SegmentPolicy = (typeof SEGMENT_POLICIES)[number];

/** 超长作答策略（reject-only，带 max_length / segment_policy(恒 none) / 用户可感知错误码）。 */
export interface OverlongAnswerPolicy {
  policy: OverlongPolicyKind;
  /** 触发判定的上限（字符）。reject 时为面试上限。 */
  maxLength: number;
  /** 恒 'none'：本模块不产出分段形态（为何 reject-only 见 OVERLONG_POLICY_KINDS 头注释）。 */
  segmentPolicy: SegmentPolicy;
  /** 用户可感知错误码（reject 时非空；对齐 API 413 `answer_too_long`）。 */
  errorCode: string | null;
}

/** 超长策略判定结果：accepted（无需处理）或 rejected（需按 policy 处理）。 */
export type OverlongAnswerDecision =
  | { accepted: true; maxLength: number }
  | { accepted: false; policy: OverlongAnswerPolicy };

/** 服务端问题身份绑定（与 TurnDto / claimInterviewAnswer 的 identity 语义一致，非客户端可自由声明）。 */
export interface InterviewQuestionIdentity {
  questionId: string;
  stateVersion: number;
  answerHash: string;
  turn: number;
}

// 服务端问题身份格式（与 packages/contracts TurnDto 的校验一致）：
// questionId 形如 q-v{stateVersion}-t{turn}-c{clarifyAttempts}（图内 issueQuestionId 编码）；
// answerHash = answer 的 SHA-256 hex（服务端重算，不信客户端）。
// 捕获组用于交叉校验内嵌 stateVersion/turn 与同对象字段一致（防弱绑定 fail-open）。
const QUESTION_ID_RE = /^q-v(\d+)-t(\d+)-c(\d+)$/;
const ANSWER_HASH_RE = /^[a-f0-9]{64}$/;

/**
 * 「是否携带完整服务端问题身份绑定」的 fail-closed 判定。输入字段是 unknown（不可信），
 * 任何缺字段/非法值 → false。这决定一条输入是「面试作答」还是「自由对话消息」：
 * 面试作答必须绑定 server-issued question identity，自由对话无此绑定。
 * 承重：questionId 内嵌的 stateVersion/turn 必须与同对象字段**逐字段一致**，否则 fail-closed 拒——
 * 否则 `q-v1-t0-c0` + `stateVersion:5` 这类伪造/漂移绑定会被误判为有效（弱绑定 fail-open）。
 */
export function isInterviewQuestionIdentity(input: unknown): input is InterviewQuestionIdentity {
  if (!input || typeof input !== 'object') return false;
  const q = input as Record<string, unknown>;
  if (typeof q.questionId !== 'string') return false;
  const m = QUESTION_ID_RE.exec(q.questionId);
  if (!m) return false;
  if (typeof q.stateVersion !== 'number' || !Number.isInteger(q.stateVersion) || q.stateVersion < 0) return false;
  if (typeof q.answerHash !== 'string' || !ANSWER_HASH_RE.test(q.answerHash)) return false;
  if (typeof q.turn !== 'number' || !Number.isInteger(q.turn) || q.turn < 0) return false;
  // 交叉校验：内嵌 stateVersion/turn 与对象字段不一致 → 拒（防弱绑定 fail-open）。
  // clarifyAttempts 对象侧无字段可交叉，但 q-v...-c 已约束为非负整数（\d+），无需额外校验。
  if (Number(m[1]) !== q.stateVersion || Number(m[2]) !== q.turn) return false;
  return true;
}

export interface RouteInputDecision {
  route: InputRouteKind;
  /** 分流依据（可审计；不含答案正文/PII，可安全进日志/SSE 元数据）。 */
  reason: string;
}

/**
 * 输入分流：面试 vs 自由对话。唯一依据是「是否携带完整服务端问题身份绑定」——
 * 有完整身份 → interview_route（走面试评分链）；否则 → free_conversation_route（只作分流结果，
 * 不建链路；自由对话的 over-long/压缩策略属 CTX-02/03/04，本路径绝不越界实现）。
 */
export function routeInterviewOrFreeConversation(input: unknown): RouteInputDecision {
  if (isInterviewQuestionIdentity(input)) {
    return { route: 'interview_route', reason: 'bound_to_server_issued_question_identity' };
  }
  return { route: 'free_conversation_route', reason: 'no_server_issued_question_identity' };
}

/**
 * 超长作答策略判定。面试路径：`length > INTERVIEW_ANSWER_MAX_LENGTH` → 确定性 `reject`（明确错误码
 * `answer_too_long`，用户可感知）；`≤` 上限 → accepted（评分按原始作答进行，不截断、不摘要）。
 * 自由对话路径：本模块只做分流，不建自由对话链路——超长策略 fail-closed 返回「不可用」，绝不臆造
 * 一个自由对话压缩策略（那是 CTX-02/03/04 的职责）。
 */
export function resolveOverlongAnswerPolicy(route: InputRouteKind, length: number): OverlongAnswerDecision {
  if (route === 'free_conversation_route') {
    return {
      accepted: false,
      policy: {
        policy: 'reject',
        maxLength: 0, // 自由对话上限未定义：不臆造数字（fail-closed，宁可不处理也不编造策略）。
        segmentPolicy: 'none',
        errorCode: 'free_conversation_route_unavailable',
      },
    };
  }
  if (route !== 'interview_route') fail('input_route_kind_invalid');
  if (!Number.isSafeInteger(length) || length < 0) fail('answer_length_invalid');
  if (length > INTERVIEW_ANSWER_MAX_LENGTH) {
    return {
      accepted: false,
      policy: {
        policy: 'reject',
        maxLength: INTERVIEW_ANSWER_MAX_LENGTH,
        segmentPolicy: 'none',
        errorCode: 'answer_too_long',
      },
    };
  }
  return { accepted: true, maxLength: INTERVIEW_ANSWER_MAX_LENGTH };
}
