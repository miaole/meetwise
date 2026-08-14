/**
 * 关口可观测 seam：所有模型调用都过 invoke,所以**唯一埋点位**就是这里。Tracer 注入(no-op 默认 / recording 测试 / Langfuse 适配在组合根注入),
 * ai-runtime 不硬依赖任何观测后端(10 年:易变后端藏 seam 后)。落 observability-strategy §6:invoke 关口出延迟/重试/降级。
 * 脱敏铁律:span 只带标量(service/owner/attempt/outcome/latency),**绝不带 prompt 原文/简历/答案**。
 */
export type ModelCallOutcome =
  | 'cached'                 // 幂等命中,未真打模型
  | 'ok'                     // 双校验通过
  | 'transient_retry'        // 瞬时失败,将重试
  | 'schema_retry'           // schema 不过,将重试
  | 'business_error'         // 业务校验失败(确定性错,不重试)
  | 'deterministic_refusal'  // 模型确定性拒绝(不重试)
  | 'exhausted';             // 重试封顶仍失败

export interface ModelCallSpan {
  service?: string;
  owner: string;
  idempotencyKey: string;
  threadId?: string;       // 面试 id:Langfuse sessionId/traceId,一场面试归一棵树(跨调用 RCA)
  retrieval?: { ref: string; score: number }[];   // 检索质量信号:top-k 分数(分"没召到"vs"没用好")
  attempt: number;
  outcome: ModelCallOutcome;
  latencyMs: number;
  sources?: string[];     // provenance:本次生成用到的检索来源 ref_ids(题目/记忆/知识块)——可审计、可引用,非 PII
  inputTokens?: number;   // 成本观测:prompt token(标量,非内容)——喂 Langfuse 成本/token 看板
  outputTokens?: number;  // 成本观测:completion token(标量,非内容)
}
export interface Tracer { record(span: ModelCallSpan): void; }

const noopTracer: Tracer = { record() { /* 默认不观测 */ } };
let active: Tracer = noopTracer;

/** 组合根(worker/api)启动时注入真 tracer(Langfuse/OTel);测试注入 recordingTracer。 */
export function setTracer(t: Tracer): void { active = t; }
export function getTracer(): Tracer { return active; }

/** 测试用:把 span 收进数组,断言关口埋点完整。 */
export function recordingTracer(): Tracer & { spans: ModelCallSpan[] } {
  const spans: ModelCallSpan[] = [];
  return { spans, record(s) { spans.push(s); } };
}
