import { ExternalHttpStatusError, ExternalRequestTimeoutError, ExternalResponseJsonError, fetchJsonWithTimeout } from './timeout.ts';
import { rejectDashscopeNativeTransportOverride, resolveDashscopeNativeConfig } from './dashscope-native-config.ts';
import { requireFiniteVector, requireRecord } from './native-response-guard.ts';

/**
 * 向量化 seam（10 年负债隔离：embedding 供应商可换,接口不变）。
 * dashscopeEmbedder=真(text-embedding-v4,1024 维,已实测);fakeEmbedder=确定性词袋(gate 召回度量数学,非真召回)。
 */
export interface Embedder {
  readonly dim: number;
  readonly id: string;
  embed(texts: string[]): Promise<number[][]>;
  /** Provider-reported input token usage. Undefined means the supplier omitted usage; callers must then settle conservatively. */
  embedWithUsage?(texts: string[]): Promise<{ vectors: number[][]; inputTokens?: number }>;
}

const BATCH = 10;

/** 真 embedder：DashScope text-embedding-v4(OpenAI 兼容 /embeddings,1024 维)。分批,保序。 */
export function dashscopeEmbedder(cfg: { baseUrl?: string; apiKey?: string; model?: string; dim?: number } = {}): Embedder {
  rejectDashscopeNativeTransportOverride(cfg.baseUrl);
  rejectDashscopeNativeTransportOverride(cfg.apiKey);
  const native = resolveDashscopeNativeConfig();
  const baseUrl = cfg.baseUrl ?? native.compatibleBaseUrl;
  const apiKey = cfg.apiKey ?? native.keys.embed;  // 只取 embedding 能力 Key；缺失即 embedder_not_configured，绝不回退别的 key 变量
  const model = cfg.model ?? process.env.DASHSCOPE_EMBED_MODEL ?? 'text-embedding-v4';
  const dim = cfg.dim ?? Number(process.env.EMBED_DIM ?? 512);   // 生产默认值；维度必须由冻结评测集、成本与延迟门共同决定。
  const embedWithUsage = async (texts: string[]): Promise<{ vectors: number[][]; inputTokens?: number }> => {
      if (!baseUrl || !apiKey) throw new Error('embedder_not_configured');
      const out: number[][] = [];
      let inputTokens = 0;
      let sawUsage = false;
      for (let i = 0; i < texts.length; i += BATCH) {
        const batch = texts.slice(i, i + BATCH);
        let j: {
          data: { embedding: number[]; index: number }[];
          usage?: { prompt_tokens?: number; input_tokens?: number; total_tokens?: number };
        };
        try {
          j = await fetchJsonWithTimeout(`${baseUrl}/embeddings`, {
          method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model, input: batch, dimensions: dim }),
          }, { maxBytes: 1024 * 1024 });
        } catch (error) {
          if (error instanceof ExternalRequestTimeoutError) throw new Error('embedder_timeout');
          if (error instanceof ExternalResponseJsonError) throw new Error('embedder_malformed');
          if (error instanceof ExternalHttpStatusError) throw new Error('embed_http_' + error.status);
          throw error;
        }
        const body = requireRecord(j, 'embedder_malformed');
        if (!Array.isArray(body.data) || body.data.length !== batch.length) throw new Error('embedder_malformed');
        const sorted = body.data.slice().sort((a, b) => {
          const left = requireRecord(a, 'embedder_malformed');
          const right = requireRecord(b, 'embedder_malformed');
          const li = left.index;
          const ri = right.index;
          if (!Number.isSafeInteger(li) || !Number.isSafeInteger(ri)) throw new Error('embedder_malformed');
          return (li as number) - (ri as number);
        });
        for (const row of sorted) {
          const item = requireRecord(row, 'embedder_malformed');
          out.push(requireFiniteVector(item.embedding, dim, 'embedder_malformed'));
        }
        const used = j.usage?.prompt_tokens ?? j.usage?.input_tokens ?? j.usage?.total_tokens;
        if (typeof used === 'number' && Number.isFinite(used) && used >= 0) { inputTokens += used; sawUsage = true; }
      }
    return { vectors: out, ...(sawUsage ? { inputTokens } : {}) };
  };
  return { dim, id: model, embedWithUsage, async embed(texts) { return (await embedWithUsage(texts)).vectors; } };
}

/** 确定性词袋 embedder(无网络)：共享 token → 向量重叠。仅用于 gate 召回度量数学是否正确,**不代表真召回率**。 */
export function fakeEmbedder(dim = 256): Embedder {
  const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); };
  const toks = (s: string) => s.toLowerCase().replace(/[，。、,.?？!！:：()（）]/g, ' ').split(/\s+/).filter(Boolean)
    .flatMap((w) => /[一-龥]/.test(w) ? Array.from({ length: Math.max(1, w.length - 1) }, (_, i) => w.slice(i, i + 2)) : [w]); // 中文 bigram
  const embed = async (texts: string[]): Promise<number[][]> => {
    return texts.map((t) => {
      const v = new Array(dim).fill(0);
      for (const tk of toks(t)) v[hash(tk) % dim] += 1;
      const norm = Math.hypot(...v) || 1;
      return v.map((x) => x / norm);
    });
  };
  return {
    dim, id: 'fake-bow',
    embed,
    async embedWithUsage(texts) { return { vectors: await embed(texts), inputTokens: 0 }; },
  };
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { const av = a[i]!; const bv = b[i]!; dot += av * bv; na += av * av; nb += bv * bv; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
