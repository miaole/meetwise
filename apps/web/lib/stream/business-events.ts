/**
 * 前端消费的是**业务事件**（非模型 token）。这里是纯解析层：SSE 文本 → 强类型 BusinessEvent。
 * 与后端 interview_event 的 kind 对齐（见 CLAUDE.md SSE 事件目录）。纯函数,可确定性单测,不依赖 React/浏览器。
 */
import { z } from 'zod';

/**
 * 题型来自 `packages/domain/src/adaptive-interview.ts`。保留旧值是为了让
 * 已经落库、仍会被重放的历史事件可读；新图产生 grounded/fundamental/
 * scenario/behavioral。这里若收窄会使完整的 question_ready 帧被丢弃，UI
 * 便会永久停在 connecting。
 */
export const QuestionKind = z.enum([
  'grounded', 'fundamental', 'scenario', 'behavioral',
  'primary', 'followup', 'clarification', 'fallback',
]);
export type QuestionKind = z.infer<typeof QuestionKind>;

/** 业务事件判别联合（event = SSE event 字段 = 后端 interview_event.kind）。 */
export const BusinessEvent = z.discriminatedUnion('event', [
  z.object({ event: z.literal('progress'), id: z.number().int(), data: z.record(z.string(), z.unknown()) }),
  // question identity 由服务端持久化发放；旧流可显示题面但不能取得可提交身份（UI fail-closed）。
  z.object({ event: z.literal('question_ready'), id: z.number().int(), data: z.object({
    question: z.string(), competency: z.string().optional(),
    questionId: z.string().regex(/^q-v\d+-t\d+-c\d+$/).optional(),
    stateVersion: z.number().int().nonnegative().optional(),
    turn: z.number().int().nonnegative().optional(),
    qkind: QuestionKind.optional(),
  }) }),
  z.object({ event: z.literal('waiting_user'), id: z.number().int(), data: z.record(z.string(), z.unknown()) }),
  // outcome 区分 answered / unresolved(跳过/探尽未决):unresolved 不是"得0分",前端标 skipped、不展示惩罚分;报告侧亦剔除。
  z.object({ event: z.literal('answer_evaluated'), id: z.number().int(), data: z.object({
    score: z.number(),
    outcome: z.string().optional(),
    questionId: z.string().regex(/^q-v\d+-t\d+-c\d+$/).optional(),
    stateVersion: z.number().int().nonnegative().optional(),
    turn: z.number().int().nonnegative().optional(),
    answerId: z.string().uuid().optional(),
    answerHash: z.string().regex(/^[a-f0-9]{64}$/).optional(),
    competency: z.string().min(1).optional(),
  }) }),
  // 引导事件(**非终态**):回答没正面回应本题 → 图已发放一条新的 pending question
  // identity（不是旧题的重放许可），前端必须随事件替换提交令牌，否则重答会被服务端拒绝为 stale。
  z.object({ event: z.literal('clarification_needed'), id: z.number().int(), data: z.object({
    hint: z.string(), question: z.string(), competency: z.string().optional(),
    questionId: z.string().regex(/^q-v\d+-t\d+-c\d+$/).optional(),
    stateVersion: z.number().int().nonnegative().optional(),
    turn: z.number().int().nonnegative().optional(),
  }) }),
  z.object({ event: z.literal('report_ready'), id: z.number().int(), data: z.object({ overall: z.number() }) }),
  // 终态降级事件：报告生成失败被隔离 → 前端退出等待态、显示"报告暂不可用",绝不无限转圈
  z.object({ event: z.literal('report_unavailable'), id: z.number().int(), data: z.object({ reason: z.string() }) }),
  // 评分证据不足/评分执行失败：没有可信分数，额度已释放。不得与 report_unavailable 混用；后者的面试已经完成并扣费。
  z.object({ event: z.literal('assessment_unavailable'), id: z.number().int(), data: z.object({ reason: z.string() }).loose() }),
  z.object({ event: z.literal('interview_unavailable'), id: z.number().int(), data: z.object({ reason: z.string() }).loose() }),
  z.object({ event: z.literal('error'), id: z.number().int(), data: z.record(z.string(), z.unknown()) }),
]);
export type BusinessEvent = z.infer<typeof BusinessEvent>;

export interface SSEFrame { id?: number; event?: string; data: string }

/** 流式 SSE 解码：在**空行分隔符**(CRLF/CR/LF 皆可,spec)切帧;返回完整帧 + 未完成尾巴(rest,下次拼接,不归一以免拆裂不完整分隔符)。
 *  审计 MEDIUM 修复:`split('\n\n')` 遇 `\r\n\r\n` 切不出帧 → 永久转圈;改按 `/\r\n\r\n|\r\r|\n\n/` 分,行内按 `/\r\n|\r|\n/` 拆。 */
export function decodeSSE(buffer: string): { frames: SSEFrame[]; rest: string } {
  const parts = buffer.split(/\r\n\r\n|\r\r|\n\n/);
  const rest = parts.pop() ?? '';                       // 最后一段可能不完整(含半截分隔符),留到下次
  const frames: SSEFrame[] = [];
  for (const block of parts) {
    if (!block.trim()) continue;
    const dataLines: string[] = [];
    const f: SSEFrame = { data: '' };
    for (const line of block.split(/\r\n|\r|\n/)) {
      if (line.startsWith(':')) continue;               // 注释/心跳行,spec 要求忽略
      if (line.startsWith('id:')) f.id = Number(line.slice(3).trim());
      else if (line.startsWith('event:')) f.event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, '')); // spec:只去一个前导空格
    }
    f.data = dataLines.join('\n');
    if (f.event === undefined) continue;                // 纯心跳/注释帧(无 event)不产出幻象帧
    frames.push(f);
  }
  return { frames, rest };
}

/** 帧 → 强类型业务事件。schema 不过(未知事件/坏 payload)返回 null（前端只信契约内的事件,不裸用）。 */
export function toBusinessEvent(f: SSEFrame): BusinessEvent | null {
  let data: unknown = {};
  try { data = f.data ? JSON.parse(f.data) : {}; } catch { return null; }
  const parsed = BusinessEvent.safeParse({ event: f.event, id: f.id, data });
  return parsed.success ? parsed.data : null;
}
