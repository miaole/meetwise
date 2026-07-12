/**
 * 重排 seam（cross-encoder 精排）：稠密召回 top-N 后用 gte-rerank-v2 精排到 top-k——召回靠向量、精度靠重排,标准两段式。
 * 供应商可换(seam),接口不变。dashscopeReranker=真(已实测);上层只给 (query, docs) 拿回排序后的 id。
 */
export interface Reranker {
  readonly id: string;
  rerank(query: string, docs: { id: string; text: string }[], topN: number): Promise<string[]>;
}

export function dashscopeReranker(cfg: { apiKey?: string; model?: string; url?: string } = {}): Reranker {
  const apiKey = cfg.apiKey ?? process.env.MODEL_API_KEY;
  const model = cfg.model ?? process.env.RERANK_MODEL ?? 'gte-rerank-v2';
  const url = cfg.url ?? 'https://dashscope.aliyuncs.com/api/v1/services/rerank/text-rerank/text-rerank';
  return {
    id: model,
    async rerank(query, docs, topN) {
      if (!apiKey) throw new Error('reranker_not_configured');
      if (!docs.length) return [];
      const res = await fetchWithTimeout(url, {
        method: 'POST', headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, input: { query, documents: docs.map((d) => d.text) }, parameters: { top_n: topN, return_documents: false } }),
      });
      if (!res.ok) throw new Error('rerank_http_' + res.status);
      const j = await res.json() as { output: { results: { index: number; relevance_score: number }[] } };
      return j.output.results.map((r) => docs[r.index].id);   // 按相关性降序的 id
    },
  };
}import { fetchWithTimeout } from './timeout.ts';

