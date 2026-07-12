/**
 * 向量化 seam（10 年负债隔离：embedding 供应商可换,接口不变）。
 * dashscopeEmbedder=真(text-embedding-v4,1024 维,已实测);fakeEmbedder=确定性词袋(gate 召回度量数学,非真召回)。
 */
export interface Embedder {
  readonly dim: number;
  readonly id: string;
  embed(texts: string[]): Promise<number[][]>;
}

const BATCH = 10;

/** 真 embedder：DashScope text-embedding-v4(OpenAI 兼容 /embeddings,1024 维)。分批,保序。 */
export function dashscopeEmbedder(cfg: { baseUrl?: string; apiKey?: string; model?: string; dim?: number } = {}): Embedder {
  const baseUrl = cfg.baseUrl ?? process.env.MODEL_BASE_URL;
  const apiKey = cfg.apiKey ?? process.env.MODEL_API_KEY;
  const model = cfg.model ?? process.env.EMBED_MODEL ?? 'text-embedding-v4';
  const dim = cfg.dim ?? Number(process.env.EMBED_DIM ?? 512);   // 生产默认 512(大库实测:128/512/1024 仅差~1%,512 微优+留 headroom)
  return {
    dim, id: model,
    async embed(texts) {
      if (!baseUrl || !apiKey) throw new Error('embedder_not_configured');
      const out: number[][] = [];
      for (let i = 0; i < texts.length; i += BATCH) {
        const batch = texts.slice(i, i + BATCH);
        const res = await fetchWithTimeout(`${baseUrl}/embeddings`, {
          method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, input: batch, dimensions: dim }),
        });
        if (!res.ok) throw new Error('embed_http_' + res.status);
        const j = await res.json() as { data: { embedding: number[]; index: number }[] };
        const sorted = j.data.slice().sort((a, b) => a.index - b.index);
        for (const d of sorted) out.push(d.embedding);
      }
      return out;
    },
  };
}

/** 确定性词袋 embedder(无网络)：共享 token → 向量重叠。仅用于 gate 召回度量数学是否正确,**不代表真召回率**。 */
export function fakeEmbedder(dim = 256): Embedder {
  const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); };
  const toks = (s: string) => s.toLowerCase().replace(/[，。、,.?？!！:：()（）]/g, ' ').split(/\s+/).filter(Boolean)
    .flatMap((w) => /[一-龥]/.test(w) ? Array.from({ length: Math.max(1, w.length - 1) }, (_, i) => w.slice(i, i + 2)) : [w]); // 中文 bigram
  return {
    dim, id: 'fake-bow',
    async embed(texts) {
      return texts.map((t) => {
        const v = new Array(dim).fill(0);
        for (const tk of toks(t)) v[hash(tk) % dim] += 1;
        const norm = Math.hypot(...v) || 1;
        return v.map((x) => x / norm);
      });
    },
  };
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}import { fetchWithTimeout } from './timeout.ts';

