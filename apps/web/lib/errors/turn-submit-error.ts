import { INTERVIEW_PRIVACY_FENCED_TEXT } from './action-error';

/**
 * turnSubmitFeedback —— #59 提交失败分码映射（G4 FAILURE-PATH W1 · REQUEST rev2 §1② · 裁定①形制 A）。
 * 纯字符串面、零依赖零 DOM（沿 action-error.ts 同型先例）：InterviewPanel 提交失败臂消费，
 * 离线可证（web-logic.proof.ts 纯函数输出断言 + 组件源码静态接线断言，非浏览器 DOM 证明）。
 *
 * 异形分层注记（预执行双审席1·裁定①附注）：返回 {text,action} ≠ ActionErrorMessage {text,href,note}
 * ——提交动作型反馈≠页面型错误块：action 由纯函数判定、由组件薄执行（router 跳转在事件回调内），分层进 proof。
 *
 * 病根（#59 审计原文）：服务端错误体={error: code} 无 message——proxy 401 unauthorized（turn route :13）、
 * 400 missing_idempotency_key（:16）、上游体透传（:23）；api 面 interview_not_active 409、
 * interview_answer_submission_conflict 409、interview_privacy_fenced 410——裸透传 j?.message 生产面恒
 * undefined → 恒落泛化兜底：401 无登录引导、409 无回列表动作。本映射把出路引导出来。
 */

/** 组件薄执行的动作枚举：login=跳 /login?expired=1（沿 lib/api/server.ts:30 同参形）；back_to_interviews=回 /interviews。 */
export type TurnSubmitAction = 'login' | 'back_to_interviews';

export interface TurnSubmitFeedback {
  text: string;
  action?: TurnSubmitAction;
}

// ── 401 行：登录过期 → 引登录（proxy turn route 对无 token 恒发 {error:'unauthorized'} 401；
//    防御性 superset：其余 401 码同归登录引导——令牌失效语义与码面无关）─────────────────
const LOGIN_EXPIRED_TEXT = '登录已过期，请重新登录';

// ── 409 行：interview_not_active（api 面 409）→ 回列表出路 ────────────────────────────
const INTERVIEW_NOT_ACTIVE_TEXT = '该面试已结束';

// ── 409 行：interview_answer_submission_conflict（api 面 409 防双提交）→ 中性防重文案，
//    无导航动作（作答保留、既有回滚行为零改——不把冲突渲染成死路）────────────────────
const ANSWER_CONFLICT_TEXT = '该作答已提交，请勿重复提交';

// ── 410 行：interview_privacy_fenced → 文案=action-error.ts 既有常量**单源引用**（#243 F6 已落值，
//    本刀只补 export·值零改）；410 永久围栏给「重试」指引=教用户白点，出路=回列表新建。──
//    （503 文案同理与 action-error.ts SERVICE_UNAVAILABLE_TEXT 同文；该常量不在本刀 export 授权面，
//     此处逐字同文+proof 经 actionErrorMessage('interviews',503,null) 做同文断言。）
const SERVICE_UNAVAILABLE_TEXT = '服务暂不可用';

// ── 兜底行：既有泛化文案逐字（未知码/无码/解析失败/垃圾体）——原文一字不改 ────────────────
const SUBMIT_FAILED_TEXT = '提交失败,请重试';

/** 映射表逐码（REQUEST §1② 全表）：`turnSubmitFeedback(status, code)`。未知码/无码/垃圾输入 → 兜底形。 */
export function turnSubmitFeedback(status: number, code: string | null): TurnSubmitFeedback {
  if (status === 401) return { text: LOGIN_EXPIRED_TEXT, action: 'login' };
  if (code === 'interview_not_active') return { text: INTERVIEW_NOT_ACTIVE_TEXT, action: 'back_to_interviews' };
  if (code === 'interview_answer_submission_conflict') return { text: ANSWER_CONFLICT_TEXT };
  if (code === 'interview_privacy_fenced') return { text: INTERVIEW_PRIVACY_FENCED_TEXT, action: 'back_to_interviews' };
  if (code === 'public_preview_read_only' || status === 503) return { text: SERVICE_UNAVAILABLE_TEXT };
  return { text: SUBMIT_FAILED_TEXT };
}
