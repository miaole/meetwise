/**
 * 类型化契约客户端：用 @meetwise/contracts 的 zod4 schema 校验**请求与响应**,并**区分 HTTP 状态**。
 * 审计 HIGH 修复:① 不再 status-盲——4xx=业务错(可降级)、5xx/网络=传输错(可重试)、2xx 但形不符=契约漂移,三者分开,绝不混成不透明抛错;
 * ② submitAnswer **强制 Idempotency-Key**(后端必需,缺则 400);③ 返回类型化 Result,不在业务错上裸抛(前端能优雅降级)。
 */
import { AnswerDto, AnswerResult, InterviewView } from '@meetwise/contracts';
import type { z } from 'zod';

export interface FetchResponse { status: number; json(): Promise<unknown> }
export type FetchLike = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<FetchResponse>;

export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; kind: 'business'; status: number; error?: string }   // 4xx：业务错（not_found/未鉴权/缺幂等键…）→ 前端可解释降级
  | { ok: false; kind: 'transport'; status?: number }                  // 5xx/网络/非JSON → 可重试
  | { ok: false; kind: 'drift'; status: number }                       // 2xx 但响应形不符契约 → 接口漂移,告警
  | { ok: false; kind: 'invalid_request' };                            // 调用方请求体本地不合法（与服务端漂移区分,审计建议）

async function call<T>(schema: z.ZodType<T>, fetchImpl: FetchLike, url: string, init?: Parameters<FetchLike>[1]): Promise<ApiResult<T>> {
  let res: FetchResponse;
  try { res = await fetchImpl(url, init); } catch { return { ok: false, kind: 'transport' }; }   // 网络层失败
  let body: unknown;
  try { body = await res.json(); } catch { return { ok: false, kind: 'transport', status: res.status }; } // 非 JSON(如 500 HTML)
  if (res.status >= 500) return { ok: false, kind: 'transport', status: res.status };
  if (res.status >= 400) return { ok: false, kind: 'business', status: res.status, error: (body as { error?: string })?.error };
  const p = schema.safeParse(body);
  return p.success ? { ok: true, value: p.data } : { ok: false, kind: 'drift', status: res.status };  // 形不符=漂移,不裸用
}

export interface InterviewApi {
  getInterview(id: string, headers?: Record<string, string>): Promise<ApiResult<z.infer<typeof InterviewView>>>;
  submitAnswer(id: string, body: z.infer<typeof AnswerDto>, idempotencyKey: string, headers?: Record<string, string>): Promise<ApiResult<z.infer<typeof AnswerResult>>>;
}

export function makeInterviewApi(baseUrl: string, fetchImpl: FetchLike): InterviewApi {
  return {
    getInterview(id, headers = {}) {
      return call(InterviewView, fetchImpl, `${baseUrl}/interview/${encodeURIComponent(id)}`, { headers });
    },
    submitAnswer(id, body, idempotencyKey, headers = {}) {
      const v = AnswerDto.safeParse(body);
      if (!v.success) return Promise.resolve<ApiResult<z.infer<typeof AnswerResult>>>({ ok: false, kind: 'invalid_request' }); // 请求体本地不合法,不发请求
      if (!idempotencyKey) return Promise.resolve<ApiResult<z.infer<typeof AnswerResult>>>({ ok: false, kind: 'business', status: 400, error: 'missing_idempotency_key' });
      return call(AnswerResult, fetchImpl, `${baseUrl}/interview/${encodeURIComponent(id)}/answer`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json', 'idempotency-key': idempotencyKey }, // 后端必需,强制带上
        body: JSON.stringify(v.data),
      });
    },
  };
}
