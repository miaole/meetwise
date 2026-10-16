/**
 * #256 显示面「第 N 题 / 预计约 M 题」进度徽标（纯派生，薄渲染进 InterviewPanel，可确定性单测进 web-logic.proof）。
 *
 * N 口径（EXEC 勘误·漂移表微漂⑥）：服务端 question_ready.turn 为 **0 基**（实证：图 initMind turn:0、
 * 首题 questionId=q-v…-t0-c… 即 turn:0、web-logic 既有 fixtures 全 turn:0），而全仓「第 N 题」显示先例统一
 * **1 基**（lib/interview/progress.ts:19-20 `turn + 1`、InterviewPanel :417 `第 {i+1} 题`、QuizPanel/VoiceCallPanel 同形）。
 * 故 N = identity.turn+1（identity 在）→ 缺失降级 turns.length（本身即 1 基计数）；两臂在全流程自洽相等，
 * 仅 clarify 烧预算轮（turn 计入、turns 不计）如实分叉。按主题序号口径 ≠ 轮次/追问总数口径（§7 Non-claim）。
 *
 * M（形制 A）：plannedTurns=发射时点软预算约数，措辞必须约数+可调注记（Ban 承诺化）；
 * 缺失/非法（<1 或非整数）→ null → 只显「第 N 题」。提前结束/出报告语义🔒D3 零触碰。
 */
import type { InterviewView } from '../stream/interview-state';

export interface InterviewProgressBadge {
  current: number;
  planned: number | null;
  label: string;
}

export function interviewProgressBadge(
  view: Pick<InterviewView, 'questionIdentity' | 'turns' | 'plannedTurns'>,
): InterviewProgressBadge | null {
  const identityTurn = view.questionIdentity?.turn;
  if (identityTurn === undefined && view.turns.length === 0) return null;   // 无任何题 → 不渲染（防「第 0 题」）
  const current = identityTurn !== undefined ? identityTurn + 1 : view.turns.length;
  const planned = view.plannedTurns !== undefined && Number.isInteger(view.plannedTurns) && view.plannedTurns >= 1
    ? view.plannedTurns
    : null;
  return {
    current,
    planned,
    label: planned === null
      ? `第 ${current} 题`
      : `第 ${current} 题 / 预计约 ${planned} 题（自适应，可能调整）`,
  };
}
