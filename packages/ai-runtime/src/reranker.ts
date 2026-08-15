import { ExternalHttpStatusError, fetchJsonWithTimeout } from './timeout.ts';
import { rejectDashscopeNativeTransportOverride, resolveDashscopeNativeConfig } from './dashscope-native-config.ts';

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
  const apiKey = cfg.apiKey ?? native.apiKey;
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
        if (error instanceof ExternalHttpStatusError) throw new Error('rerank_http_' + error.status);
        throw error;
      }
      // 供应商的 index 也是不可信远端输入；越界项必须丢弃，不能让一次畸形响应中断整次检索。
      return j.output.results.flatMap((r) => {
        const doc = docs[r.index];
        return doc ? [doc.id] : [];
      });
    },
  };
}
