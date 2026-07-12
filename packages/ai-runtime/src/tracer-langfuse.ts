/**
 * Langfuse 观测适配器：把 invoke 关口的脱敏 span 投递到 Langfuse。三条生产铁律:
 *  ① **脱敏**:只送标量(service/outcome/attempt/latency/**token 数**)+ 标识(owner/idempotencyKey),**绝不送 prompt/简历/答案/PII**;
 *  ② **fail-open**:观测后端挂了绝不拖垮业务(record 不抛、flush 吞错);
 *  ③ **非阻塞**:批量缓冲 + 异步 flush,不在模型调用路径上等网络。
 * transport 是 seam:gate 用 fake 捕获;生产用 httpSpanTransport(Langfuse ingestion)。
 * 线格式:`toLangfuseBatch` 纯函数构 Langfuse 真实 ingestion schema(trace-create + generation-create 带 usage),已 gate 形状;
 *   **诚实**:形状对照官方文档构造并 gate,但最终仍需对真 Langfuse 实例跑一次 smoke(或换官方 SDK)确认 100% 对版。
 */
import type { Tracer, ModelCallSpan } from './trace.ts';

export interface SpanEvent {
  name: string;
  userId: string;
  traceId: string;     // = threadId(一场面试一棵树);多次调用 generation 挂同一 trace
  obsId: string;       // = idempotencyKey(该次调用的 observation id,唯一)
  metadata: { service?: string; outcome: string; attempt: number; latencyMs: number; sources: string[]; inputTokens: number; outputTokens: number; topScore: number | null };
}
export interface SpanTransport { send(events: SpanEvent[]): Promise<void> }

export interface LangfuseTracer extends Tracer { flush(): Promise<void>; pending(): number }

/** 把 ModelCallSpan 映射为脱敏事件并批量投递。flushAt 触发异步 flush。 */
export function langfuseTracer(transport: SpanTransport, opts: { flushAt?: number } = {}): LangfuseTracer {
  const buf: SpanEvent[] = [];
  const flushAt = opts.flushAt ?? 20;
  const toEvent = (s: ModelCallSpan): SpanEvent => {
    const scores = (s.retrieval ?? []).map((r) => r.score);
    return {
      name: `model:${s.service ?? 'unknown'}`,
      userId: s.owner,                         // 伪匿名标识,用于分组——非内容/PII
      traceId: s.threadId ?? s.idempotencyKey, // **一场面试一棵树**:同 threadId 的调用归一 trace(无 threadId 退回 per-call)
      obsId: s.idempotencyKey,                 // 该次调用的 observation id(唯一)
      metadata: { service: s.service, outcome: s.outcome, attempt: s.attempt, latencyMs: s.latencyMs, sources: s.sources ?? [], inputTokens: s.inputTokens ?? 0, outputTokens: s.outputTokens ?? 0, topScore: scores.length ? Math.max(...scores) : null },
    };
  };
  async function flush() {
    if (!buf.length) return;
    const batch = buf.splice(0);
    try { await transport.send(batch); } catch { /* fail-open:观测不可拖垮业务,丢这批也不抛 */ }
  }
  return {
    record(s) { buf.push(toEvent(s)); if (buf.length >= flushAt) void flush(); },   // 非阻塞
    flush,
    pending: () => buf.length,
  };
}

/**
 * 纯函数:脱敏事件 → Langfuse ingestion batch(真实 schema)。每条 span 产两事件:
 *  - `trace-create`:父 trace(sessionId=traceId,把一次面试的多次调用归到一个 session)
 *  - `generation-create`:一次模型调用,带 **usage**(input/output/total TOKENS)→ Langfuse 成本/token 看板靠它。
 * level:ok→DEFAULT,其余→WARNING(出错的调用在看板高亮)。
 */
export function toLangfuseBatch(events: SpanEvent[], isoTime: string): unknown[] {
  return events.flatMap((e, i) => {
    const traceId = e.traceId;                            // = threadId,一棵树
    const obsId = `${e.obsId}:${i}`;                      // observation 唯一 id
    const endTime = isoTime;
    const startTime = new Date(Date.parse(isoTime) - e.metadata.latencyMs).toISOString();   // 让 Langfuse 算出延迟(否则 latency=0)
    const lowRecall = e.metadata.topScore != null && e.metadata.topScore < 0.3;             // 召回弱标记(top 分低 = "没召到好的")
    return [
      { id: `t:${obsId}`, type: 'trace-create', timestamp: isoTime, body: { id: traceId, name: e.name, userId: e.userId, sessionId: traceId, tags: [e.metadata.outcome, ...(lowRecall ? ['low_recall'] : [])] } },
      { id: `g:${obsId}`, type: 'generation-create', timestamp: isoTime, body: {
        id: obsId, traceId, name: e.name, model: e.metadata.service ?? 'unknown',           // 多 generation 挂同一 traceId=一棵树
        startTime, endTime,                                                                  // 延迟看板靠这两个
        usage: { input: e.metadata.inputTokens, output: e.metadata.outputTokens, total: e.metadata.inputTokens + e.metadata.outputTokens, unit: 'TOKENS' },
        level: e.metadata.outcome === 'ok' ? 'DEFAULT' : 'WARNING',
        metadata: { outcome: e.metadata.outcome, attempt: e.metadata.attempt, latencyMs: e.metadata.latencyMs, sources: e.metadata.sources, topScore: e.metadata.topScore },   // 检索质量信号:topScore 分"没召到"vs"没用好"
      } },
    ];
  });
}

/** 生产 transport:POST Langfuse ingestion(真实 schema)。creds 走 env,绝不入库不入日志。 */
export function httpSpanTransport(cfg: { url?: string; publicKey?: string; secretKey?: string; now?: () => string } = {}): SpanTransport {
  const url = cfg.url ?? process.env.LANGFUSE_HOST;
  const pk = cfg.publicKey ?? process.env.LANGFUSE_PUBLIC_KEY;
  const sk = cfg.secretKey ?? process.env.LANGFUSE_SECRET_KEY;
  return {
    async send(events) {
      if (!url || !pk || !sk) throw new Error('langfuse_not_configured');
      const auth = Buffer.from(`${pk}:${sk}`).toString('base64');
      const isoTime = (cfg.now ?? (() => new Date().toISOString()))();
      const res = await fetch(`${url.replace(/\/$/, '')}/api/public/ingestion`, {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: `Basic ${auth}` },
        body: JSON.stringify({ batch: toLangfuseBatch(events, isoTime) }),
      });
      if (!res.ok) throw new Error('langfuse_http_' + res.status);
    },
  };
}
