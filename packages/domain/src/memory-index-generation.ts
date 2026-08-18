/**
 * 索引 generation 治理（MEM-11）的纯域原语：冻结 manifest digest / embedding recipe digest /
 * 确定性 embedding 替身（proof 用）。零 IO、零模型、零 db，可被 packages/db 与 proof 引用。
 *
 * 与 MEM-00（memory-governance.ts）刻意分离：MEM-00 管 sink registry + span/digest 规范化，
 * MEM-11 管「冻结源清单的不可变摘要 + embedding 配方钉住 + 确定性替身向量」。两者共用同一
 * UTF-8 字节摘要纪律（见 memory-governance.ts 头注释：digest 永远对 UTF-8 字节计算，跨层
 * byte-for-byte 一致）。
 *
 * embedding seam 边界（与 RAG-02B qbank compute cache 严格隔离）：
 *   - qbank 的 embeddingComputeCacheKey 是 HMAC(scope='global-approved-qbank' + recipe + provider
 *     input digest)，语义是「全局语料库 provider 计算去重」，owner 无关、表/用途都不同。
 *   - MEM 向量是 owner 作用域的个人记忆，recipe digest 只钉「配方版本 + 维度」，不参与 provider
 *     计算去重；真实 embed 归 MODEL-OP-01（本域不接模型）。proof 用 `deterministicMemoryEmbedder`
 *     确定性替身（bag-of-words，dim 可配，零 IO），绝不交叉复用 qbank 的 scope/表/key 空间。
 */
import { createHash } from 'node:crypto';

// LOW-1 诚实说明：embedding 数据分类 allowlist（derived_fact/topic/preference，排除 dimension_label）
// 与 purpose allowlist（interview_prep/career/preference/self_improvement）**硬编码在 SQL 侧**：
//   - 数据分类：0102 memory_freeze_source_manifest 的 `r.allowed_data_class IN ('derived_fact','topic','preference')`
//   - 目的：0093 memory_consent / 0099 memory_fact_adjudication 的 `purpose CHECK (… IN ('interview_prep','career','preference','self_improvement'))`
// 此处不维护一份会漂移的 TS 常量（跨层单一事实源难同步，删死声明）：改任一侧必须两侧同改。

/**
 * MEM-11 generation 生命周期 enum **以 contract 为准**：packages/contracts 的
 * `MemoryIndexGenerationStatus` 是 8 态超集（building/validated/shadow/active/deprecated/
 * retired/retiring/fenced），其中 shadow/deprecated 是 MEM-00 兼容态、retiring/fenced 是
 * MEM-11 新增态。本域曾维护一份 6 态常量（building/validated/active/retiring/retired/fenced），
 * 与 contract 的 8 态漂移且零消费者（proof 已直接 pin `MemoryIndexGenerationStatus.options`），
 * 故删除该死常量、不再跨层重复一份会漂移的事实源（同文件 LOW-1 诚实说明：跨层单一事实源难同步）。
 * 显式 enum 禁布尔汤：所有 generation 状态跃迁仍在 DB 层 CAS 拒绝 + contract 侧 z.enum 冻结。
 */

/** manifest 状态（不可变快照：frozen → fenced）。 */
export const MEMORY_INDEX_MANIFEST_STATUSES = ['frozen', 'fenced'] as const;

/** 缓存 kind（检索缓存 / 来源水合缓存）。 */
export const MEMORY_INDEX_CACHE_KINDS = ['retrieval', 'hydration'] as const;

/** 冻结 manifest 的 canonical item 形状（digest 只对这些字段计算，span 不进 digest）。 */
export interface MemoryManifestItemDigestInput {
  factId: string;
  contentDigest: string;
  sourceArtifactDigest: string | null;
  immutableSourceVersion: string | null;
  factVersion: number;
}

/**
 * 冻结 manifest digest：sha256 对 canonical item 列表（按 fact_id 排序）逐项拼接。
 * canonical item = `${factId}:${contentDigest}:${sourceArtifactDigest ?? '-'}:${immutableSourceVersion ?? '-'}:${factVersion}`，
 * 项间以 '\n' 分隔。所有字段都是 text/int（uuid::text 恒小写），跨 TS↔SQL byte-for-byte 一致；
 * jsonb（span_locator）刻意不进 digest（jsonb 无跨层唯一规范序列化，强绑定会制造跨层误拒）。
 */
export function deriveManifestDigest(items: readonly MemoryManifestItemDigestInput[]): string {
  const canonical = [...items]
    .sort((a, b) => (a.factId < b.factId ? -1 : a.factId > b.factId ? 1 : 0))
    .map((it) =>
      [
        it.factId.toLowerCase(),
        it.contentDigest,
        it.sourceArtifactDigest ?? '-',
        it.immutableSourceVersion ?? '-',
        String(it.factVersion),
      ].join(':'),
    )
    .join('\n');
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/** embedding 配方（钉住 seam/维度；真实 provider/model 归 MODEL-OP，proof 用确定性替身）。 */
export interface MemoryEmbeddingRecipe {
  schema: string;
  provider: string;
  model: string;
  revision: string;
  dimension: number;
  normalization: string;
}

/**
 * embedding recipe digest：sha256 对**固定键序**的 JSON 序列化（只含 text/int 字段）。
 * 键序固定（schema→provider→model→revision→dimension→normalization）保证跨层一致；
 * 配方 digest 只钉「配方版本 + 维度」，不参与 provider 计算去重（那是 qbank 的事）。
 */
export function deriveEmbeddingRecipeDigest(recipe: MemoryEmbeddingRecipe): string {
  const canonical = JSON.stringify({
    schema: recipe.schema,
    provider: recipe.provider,
    model: recipe.model,
    revision: recipe.revision,
    dimension: recipe.dimension,
    normalization: recipe.normalization,
  });
  return createHash('sha256').update(canonical, 'utf8').digest('hex');
}

/**
 * 向量 checksum：sha256 对 float32 小端字节。SQL 侧只验 64-hex 格式 + 维度 + 有限性 + 计数，
 * 字节级完整性由调用方重算比对（SQL 无法稳定重算 float32 小端字节，故不把字节级校验压在 SQL）。
 */
export function memoryVectorChecksum(vector: readonly number[]): string {
  const buf = Buffer.allocUnsafe(vector.length * 4);
  for (let i = 0; i < vector.length; i++) {
    buf.writeFloatLE(vector[i]!, i * 4);
  }
  return createHash('sha256').update(buf).digest('hex');
}

/** MEM embedding seam：真实 embed 归 MODEL-OP，proof 注入确定性替身。 */
export interface MemoryEmbedder {
  readonly dim: number;
  readonly id: string;
  embed(texts: readonly string[]): Promise<number[][]>;
}

/**
 * 确定性 embedding 替身（proof 专用）：bag-of-words 哈希投影到 dim 维，L2 归一化。
 * 同一 content 恒得同一向量（确定性），dim 可配；零 IO 零模型。真实 embed 走 MODEL-OP-01
 * （本域不接真实模型，只用 seam 证明「独立构建 + 验证 + CAS 切换 + 失效」的机制正确）。
 */
export function deterministicMemoryEmbedder(dim = 16): MemoryEmbedder {
  const id = `deterministic-memory-embedder-v1-dim${dim}`;
  return {
    dim,
    id,
    async embed(texts) {
      return texts.map((t) => {
        const vec = new Array<number>(dim).fill(0);
        const toks = t.toLowerCase().split(/[^a-z0-9一-鿿]+/).filter(Boolean);
        for (const tok of toks) {
          const h = createHash('sha256').update(tok, 'utf8').digest();
          for (let i = 0; i < dim; i++) {
            vec[i] = (vec[i] ?? 0) + (h[i % h.length] ?? 0) / 255;
          }
        }
        // L2 归一化；空文本退化为零向量。
        let norm = 0;
        for (const v of vec) norm += v * v;
        norm = Math.sqrt(norm);
        return norm > 0 ? vec.map((v) => v / norm) : vec;
      });
    },
  };
}
