/**
 * 分块影响实测：粗暴截断 vs 真分块(重叠窗口 + max-pool)对召回的影响。回答"之前切片有没有问题"。
 *   截断法:每文 1 向量(clean→cap)。 分块法:长文切 700/overlap120,每块嵌入,文档分=各块 cosine 最高(max-pool)。
 *   pnpm chunk:eval [N]   (默认 100;需 .env+联网)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dashscopeEmbedder, cachingEmbedder, cosine, evalRecall, type EmbeddingStore } from '@meetwise/ai-runtime';

for (const line of readFileSync(new URL('../../../.env', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^(MODEL_[A-Z_]+|EMBED_MODEL)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const N = Number(process.argv[2] ?? 100);
const DS = encodeURIComponent('C-MTEB/T2Reranking');
const CACHE = '/private/tmp/claude-501/-Users-miaole-Desktop-golucky-meetwise/de307e7b-b845-4c8d-8fbd-f683c5b922eb/scratchpad/chunkemb.json';
const stripHtml = (s: string) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const truncate = (v: number[], d: number) => { const t = v.slice(0, d); const nm = Math.hypot(...t) || 1; return t.map((x) => x / nm); };
function chunk(text: string, size = 700, overlap = 120, maxChunks = 10): string[] {
  if (text.length <= size) return [text || '空'];
  const out: string[] = [];
  for (let i = 0; i < text.length && out.length < maxChunks; i += size - overlap) out.push(text.slice(i, i + size));
  return out;
}
function fileStore(): EmbeddingStore {
  const m: Record<string, number[]> = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
  return { async getMany(ks) { return ks.map((k) => m[k] ?? null); }, async putMany(items) { for (const it of items) m[it.key] = it.vec; writeFileSync(CACHE, JSON.stringify(m)); } };
}
async function fetchRows(n: number) {
  const out: any[] = [];
  for (let off = 0; out.length < n; off += 100) {
    const r = await fetch(`https://datasets-server.huggingface.co/rows?dataset=${DS}&config=default&split=dev&offset=${off}&length=100`);
    const j = await r.json() as any; if (!j.rows.length) break;
    for (const x of j.rows) if (x.row.positive?.length && x.row.negative?.length) out.push(x.row);
  }
  return out.slice(0, n);
}

async function main() {
  const rows = await fetchRows(N);
  const docs: { id: string; full: string; rel: boolean; qi: number }[] = [];
  const golden: { query: string; relevant: string[] }[] = [];
  rows.forEach((r, i) => {
    const rel: string[] = [];
    r.positive.forEach((t: string, j: number) => { const id = `q${i}_p${j}`; docs.push({ id, full: stripHtml(t), rel: true, qi: i }); rel.push(id); });
    r.negative.forEach((t: string, j: number) => docs.push({ id: `q${i}_n${j}`, full: stripHtml(t), rel: false, qi: i }));
    golden.push({ query: stripHtml(r.query), relevant: rel });
  });
  const D = 512;
  const emb = cachingEmbedder(dashscopeEmbedder({ dim: 1024 }), fileStore());
  console.log(`${docs.length} 文档 / ${golden.length} 查询。嵌入两套(截断 + 分块)…`);

  // A) 截断法:每文 1 向量(cap 1500,复刻之前)
  const truncVecs = await emb.embed(docs.map((d) => d.full.slice(0, 1500) || '空'));
  // B) 分块法:每文多块,记录块→文映射
  const chunkTexts: string[] = []; const chunkDoc: number[] = [];
  docs.forEach((d, di) => chunk(d.full).forEach((c) => { chunkTexts.push(c); chunkDoc.push(di); }));
  const chunkVecs = await emb.embed(chunkTexts);
  console.log(`分块后共 ${chunkTexts.length} 块(原 ${docs.length} 文)。`);

  const qVecs = await emb.embed(golden.map((g) => g.query));
  const line = (lbl: string, r: any) => console.log(`${lbl.padEnd(20)} hit@k=${(r.hitRate * 100).toFixed(1)}%  recall@k(全)=${(r.recall * 100).toFixed(1)}%  nDCG=${r.ndcg.toFixed(3)}`);

  console.log('─'.repeat(70));
  for (const k of [5, 10]) {
    // 截断检索
    const tRetr = golden.map((g, qi) => {
      const qv = truncate(qVecs[qi], D);
      return docs.map((d, di) => ({ id: d.id, s: cosine(qv, truncate(truncVecs[di], D)) })).sort((a, b) => b.s - a.s).slice(0, k).map((x) => x.id);
    });
    line(`截断 cap1500 k=${k}`, evalRecall(tRetr, golden, k));
    // 分块检索:max-pool 到文档
    const cRetr = golden.map((g, qi) => {
      const qv = truncate(qVecs[qi], D);
      const best = new Map<number, number>();
      chunkVecs.forEach((cv, ci) => { const s = cosine(qv, truncate(cv, D)); const di = chunkDoc[ci]; if (s > (best.get(di) ?? -1)) best.set(di, s); });
      return [...best.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map((e) => docs[e[0]].id);
    });
    line(`分块 maxpool k=${k}`, evalRecall(cRetr, golden, k));
  }
  console.log('─'.repeat(70) + '\n注:分块法对长文应不再丢命中点;两者差距=之前截断压低的召回。');
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
