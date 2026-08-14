/**
 * @meetwise/db · 生产向量库 ops(pgvector HNSW)。隐私:只收向量+ref_id+hash,不收原文。检索返回 ref_id,由业务层取文。
 */
import type { PoolClient as Client } from 'pg';
import { activeQbankGeneration } from './qbank-generation-retrieval.ts';
import { annSearchLegacy } from './retrieval-legacy.ts';

export { annSearchLegacy } from './retrieval-legacy.ts';

const vec = (e: number[]) => `[${e.join(',')}]`;   // pgvector 字面量

/** 写入/去重一个向量块(同 owner+kind+hash 幂等覆盖)。 */
export async function upsertVectorChunk(
  c: Client, owner: string, x: { id: string; kind: 'qbank' | 'memory'; refId: string; contentHash: string; embedding: number[] },
): Promise<void> {
  await c.query(
    `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
       VALUES ($1,$2,$3,$4,$5,$6::vector)
       ON CONFLICT (owner_user_id, kind, content_hash) DO UPDATE SET embedding=EXCLUDED.embedding, ref_id=EXCLUDED.ref_id`,
    [x.id, owner, x.kind, x.refId, x.contentHash, vec(x.embedding)]);
}

/**
 * ANN 检索:HNSW 余弦近邻 top-k。返回 ref_id + 距离(越小越近)。RLS 自动按 owner 隔离。
 *
 * qbank 检索接管(跨租户投毒读侧门):kind='qbank' 时**只召回可信可见的 qbank 块**——与 0016 定谓视图
 *   qbank_visible_ref 求交,**再叠一层 owner='__system_qbank__' 过滤**:
 *     (a) approved 策展池(qbank_pool_entry ⋈ 源 status='approved')——撤销源即时移出 → 立刻不再召回;
 *     (b) 可信系统灌库块(owner='__system_qbank__' 且未纳入策展治理)——直灌题库常规通道。
 *   owner 过滤是关键防线:视图按 ref_id 求交,而 ref_id(=题目业务 id)可猜/可撞;若某残留投毒行(owner=攻击者、
 *   kind='qbank')ref_id 撞上某可见 ref,仅按 ref_id JOIN 会把**攻击者的向量**带出并主导排序。加 owner='__system_qbank__'
 *   后,合法 qbank 块皆系统 owner → 投毒行不被 JOIN 命中。DISTINCT ON(ref_id) 再防同 ref 多行(重灌不同 hash)撑爆 top-k。
 *   **其它 kind(memory 等)行为完全不变**。
 *
 *   接管未部署时(视图缺失)的策略:QBANK_TAKEOVER_REQUIRED=1(生产应置)→ **fail-closed 抛错**,绝不回落到未过滤 qbank 读
 *   (防跨服务部署竞态:worker 尚未跑迁移期间 api 若回落原始读会短暂送投毒)。未置该 env 的隔离单测(仅 01+06、无不可信
 *   写入者)→ 回落原始 qbank 读以保持向后兼容。写门与视图同在 0016,恒同生同灭,不存在"写已收紧但读回落"的裂脑窗口。
 *
 *   perf 诚实注:JOIN+DISTINCT 使规划器难采用 HNSW,退化为受可见集约束的精确扫描——demo/当前规模无碍;共享题库达
 *   ~10 万+ 块时应改"vector_chunk 上物化 visible 布尔列 + WHERE 谓词部分 HNSW 索引"以保住 O(log N)(后续)。
 */
export async function annSearch(
  c: Client, owner: string, kind: 'qbank' | 'memory', queryEmbedding: number[], k: number,
  opts: { qbankRecipeId?: string } = {},
): Promise<{ refId: string; distance: number }[]> {
  const qvec = vec(queryEmbedding);
  if (kind === 'qbank') {
    // 0029+ has an immutable generation pointer. A query embedding without its recipe receipt is unsafe:
    // same dimension does not mean same vector space. Do not fall through to legacy vector_chunk here.
    const active = await activeQbankGeneration(c);
    if (active) {
      if (!opts.qbankRecipeId || active.recipeId !== opts.qbankRecipeId) {
        throw new Error(`qbank_generation_recipe_mismatch:active=${active.recipeId}:query=${opts.qbankRecipeId ?? 'missing'}`);
      }
      const r = await c.query('SELECT ref_id, distance FROM qbank_generation_ann_search($1,$2::vector,$3)', [active.generationId, qvec, k]);
      return r.rows.map((row) => ({ refId: row.ref_id as string, distance: Number(row.distance) }));
    }
    return annSearchLegacy(c, kind, queryEmbedding, k);
  }
  return annSearchLegacy(c, kind, queryEmbedding, k);
}
