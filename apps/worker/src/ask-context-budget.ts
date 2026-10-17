/**
 * ask-context-budget.ts — AG-20 CTX-02 显式接线（issues-master 更正版 :334「经 context-budget 裁剪」半）
 * 纯预算裁定原语（零 IO 零模型零墙钟零 env——calibration 缺省路径零 g7RuntimeInjection 触）。
 *
 * 职责：interviewer.ask 派发前把「会话摘要槽位」计入 CTX-02 组件级预算（context-budget.ts
 * planDispatchBudget·确定性降级臂）——预算不足时 summary 槽位最先裁（CTX-02 DEFAULT_TRIM_ORDER
 * 首位「最不关键」组件语义即此）,裁剪施为=会话段不渲染（#51 v8 缺省臂既有字节路径,零新形状）。
 *
 * 两层各司其职（与 model-client.ts planContextBudget 衔接,非替代非重复）：
 *  - 本层=组件级**降级**臂（可裁组件先裁再派发——transport 只拒不裁,issues-final AG-20 触发例子原文）;
 *  - transport 层=整请求渲染面**拒绝**臂（openAICompatibleClient prepare/complete/completeStream 的
 *    planContextBudget·authoritative 已接线:model_context_budget_exceeded→known_not_executed）。
 *  不可约组件（permission_snapshot/schema/tools）在本文本派发链无独立渲染载体→''（其渲染面归
 *  transport 整请求终审）;recent_turns=[]（会话状态已并入 followUp/session 段,不重复分账）。
 *  costPolicy 缺省（scripted/legacy 端点·resolveModelCostGovernance observe 模式）→ true=预算零触
 *  （additive 缺省臂=现状字节,沿 model-client.ts「legacy/test callers without a policy retain
 *  their current behaviour」契约）。policy 破损（FromCostPolicy throw / planDispatchBudget ok:false
 *  =catalog 窗口算术破）→ true 委任 transport 权威拒绝臂（同破损面在 prepare 必确定性
 *  model_context_policy_invalid / model_context_budget_exceeded 拒绝——双层同源 fail-closed,
 *  该臂 session 渲染与否不影响 transport 判定,零静默放行面）。
 */
import { contextBudgetPolicyFromCostPolicy, planDispatchBudget, type ContextBudgetDecision, type ModelCostPolicy } from '@meetwise/ai-runtime';

/** ask 派发预算分账输入（渲染文本均已在手:system=注册表静态 system·userData=去 session 的 buildData
 *  产物·rag=检索素材·summary=renderSessionSummarySection 产物——userData+summary 拼合=实派发
 *  <data> 全量,零双计零漏计;capUserData/capRagMaterial 封顶发生在 transport 渲染层,本层按未封顶
 *  原文估算=保守上界方向恒保守）。 */
export interface AskSessionBudgetParts {
  system: string;
  userData: string;
  rag: string;
  summary: string;
}

/** 本刀行为面=仅会话段可裁（trimOrder 窄化 ['summary']——rag/recent_turns 裁剪施为归后刀泛化面,§1.3 丙）。 */
const ASK_SESSION_TRIM_ORDER = ['summary'] as const;

/**
 * 纯裁定：true=会话段随派发渲染;false=CTX-02 降级裁剪（段不渲染）。确定性同输入同输出。
 */
export function sessionSurvivesAskBudget(parts: AskSessionBudgetParts, costPolicy: ModelCostPolicy | undefined): boolean {
  if (costPolicy === undefined) return true;
  let decision: ContextBudgetDecision;
  try {
    decision = planDispatchBudget({
      system: parts.system,
      permissionSnapshot: '',
      schema: '',
      tools: '',
      userData: parts.userData,
      rag: parts.rag,
      recentTurns: [],
      summary: parts.summary,
    }, contextBudgetPolicyFromCostPolicy(costPolicy, { service: 'interviewer.ask', trimOrder: ASK_SESSION_TRIM_ORDER, allowDegrade: true }));
  } catch {
    return true; // policy 破损→委任 transport 权威拒绝臂（上注·同源 fail-closed 非静默放行）
  }
  if (!decision.ok) return true; // catalog 窗口算术破→同上委任臂
  return decision.plan.status !== 'degraded' || !decision.plan.trimmedComponents.includes('summary');
}
