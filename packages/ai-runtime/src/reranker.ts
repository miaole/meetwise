import { ExternalHttpStatusError, ExternalRequestTimeoutError, ExternalResponseJsonError, fetchJsonWithTimeout } from './timeout.ts';
import { rejectDashscopeNativeTransportOverride, resolveDashscopeNativeConfig } from './dashscope-native-config.ts';
import { requireRecord } from './native-response-guard.ts';

/**
 * 重排 seam（cross-encoder 精排）：稠密召回 top-N 后用 gte-rerank-v2 精排到 top-k——召回靠向量、精度靠重排,标准两段式。
 * 供应商可换(seam),接口不变。dashscopeReranker=真(已实测);上层只给 (query, docs) 拿回排序后的 id。
 */
export interface Reranker {
  readonly id: string;
  rerank(query: string, docs: { id: string; text: string }[], topN: number): Promise<string[]>;
}

export function dashscopeReranker(cfg: { apiKey?: string; model?: string; url?: string } = {}): Reranker {
  rejectDashscopeNativeTransportOverride(cfg.apiKey);
  rejectDashscopeNativeTransportOverride(cfg.url);
  const native = resolveDashscopeNativeConfig();
  const apiKey = cfg.apiKey ?? native.keys.rerank;  // 只取 rerank 能力 Key；缺失即 reranker_not_configured，绝不回退
  const model = cfg.model ?? process.env.DASHSCOPE_RERANK_MODEL ?? 'gte-rerank-v2';
  const url = cfg.url ?? native.rerankUrl;
  return {
    id: model,
    async rerank(query, docs, topN) {
      if (!apiKey) throw new Error('reranker_not_configured');
      if (!docs.length) return [];
      let j: { output: { results: { index: number; relevance_score: number }[] } };
      try {
        j = await fetchJsonWithTimeout(url, {
          method: 'POST', redirect: 'error', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify({ model, input: { query, documents: docs.map((d) => d.text) }, parameters: { top_n: topN, return_documents: false } }),
        }, { maxBytes: 256 * 1024 });
      } catch (error) {
        if (error instanceof ExternalRequestTimeoutError) throw new Error('reranker_timeout');
        if (error instanceof ExternalResponseJsonError) throw new Error('reranker_malformed');
        if (error instanceof ExternalHttpStatusError) throw new Error('rerank_http_' + error.status);
        throw error;
      }
      const body = requireRecord(j, 'reranker_malformed');
      const output = requireRecord(body.output, 'reranker_malformed');
      if (!Array.isArray(output.results)) throw new Error('reranker_malformed');
      // 供应商的 index 也是不可信远端输入；越界/缺字段必须丢弃，不能发明 id。
      return output.results.flatMap((row) => {
        const r = requireRecord(row, 'reranker_malformed');
        if (!Number.isSafeInteger(r.index)) throw new Error('reranker_malformed');
        const doc = docs[r.index as number];
        return doc ? [doc.id] : [];
      });
    },
  };
}
