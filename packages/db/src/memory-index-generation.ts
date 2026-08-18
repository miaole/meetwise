import type { Client } from './principal.ts';
import type {
  MemoryIndexManifestReceipt, MemoryIndexGenerationStatus, MemoryIndexCacheKind,
} from '@meetwise/contracts';
import {
  deriveEmbeddingRecipeDigest, memoryVectorChecksum,
  type MemoryEmbedder, type MemoryEmbeddingRecipe,
} from '@meetwise/domain';

/**
 * 索引 generation 生命周期 + 缓存失效治理（MEM-11）数据库操作层。
 *
 * 承重边界（与 packages/db/migrations/0102_memory_index_generation_governance.sql 一一对应）：
 *  - 冻结 source manifest：仅 active + 未过期 + consent granted + 数据分类允许 embedding 的事实
 *    进 manifest；manifest 只存 digest + span_locator 溯源，**不存 content 明文 / PII**。
 *  - shadow generation 独立构建：新 generation（独立版本，非原地改 active）；embedding 走受控
 *    seam（本层只把 embedder 输出的向量送进 SQL，embedder 本身是注入的——真实 embed 归
 *    MODEL-OP，proof 用确定性替身）；采集失败/污染 SQL RAISE 回滚，绝不清旧 active。
 *  - 验证后 CAS 切换：validate（manifest digest/计数/embedding 完整性/recipe 一致）→ building→
 *    validated；switch_active（重验 liveness，删除/撤回先赢）→ 旧 active→retiring → validated→active。
 *  - 撤回/删除同步失效：fence generation + 失效检索/水合缓存 + recall 只读 active generation 且
 *    重验 liveness/epoch/status（旧 generation/旧缓存不得恢复已撤回内容）。
 *  - 显式状态机（building→validated→active→retiring→retired→fenced）；非法跃迁 CAS 返回空/抛错。
 *  - 并发不变量：CAS（from→to）+ principal 幂等键（manifest_key/idempotency_key/generation_key）
 *    + RLS owner 隔离 + 审计（复用 memory_append_audit）。
 *
 * 分层纪律：本层不做 schema 校验与 PII 护栏（那是 contracts/domain 的职责），只把字段送进承重
 * SQL 函数并映射返回值——与 memory-governance.ts / memory-fact-adjudication.ts 保持一致。
 * embedding seam 与 RAG-02B qbank compute cache 严格隔离（不同 scope/表/key 空间/用途），
 * 本层绝不引用 qbank 的 compute cache。
 */

export interface FreezeSourceManifestInput {
  manifestKey: string;
  embeddingRecipeDigest: string;
  policyVersion: string;
  idempotencyKey?: string;
}

export interface EmbeddableManifestFact {
  factId: string;
  factKey: string;
  content: string;
  contentDigest: string;
}

export interface GenerationEmbeddingInput {
  factId: string;
  dimension: number;
  vector: number[];
  checksum: string;
}

export interface BuildShadowGenerationInput {
  generationKey: string;
  manifestId: string;
  embeddingRecipeDigest: string;
  dimension: number;
  embeddings: GenerationEmbeddingInput[];
}

export interface GenerationReceipt { id: string; status: MemoryIndexGenerationStatus }

export interface ActiveGeneration {
  id: string;
  generationKey: string;
  manifestDigest: string;
  generationPrivacyEpoch: number;
  generationConsentRevision: number;
  status: MemoryIndexGenerationStatus;
}

export interface GenerationCacheEntry {
  cacheEntryId: string;
  generationId: string;
  value: unknown;
  status: 'live';
}

/** 冻结 source manifest：仅仍授权事实进 manifest，返回权威 digest/计数/epoch。 */
export async function freezeSourceManifest(
  c: Client, input: FreezeSourceManifestInput,
): Promise<MemoryIndexManifestReceipt> {
  const r = await c.query<{
    manifest_id: string; manifest_digest: string; fact_count: string | number;
    privacy_epoch: string | number; consent_revision: string | number; replayed: boolean;
  }>(
    'SELECT * FROM memory_freeze_source_manifest($1,$2,$3,$4)',
    [input.manifestKey, input.embeddingRecipeDigest, input.policyVersion, input.idempotencyKey ?? null],
  );
  const row = r.rows[0];
  if (!row?.manifest_id)
    throw Object.assign(new Error('memory_freeze_manifest_failed'), { code: 'memory_freeze_manifest_failed' });
  return {
    manifestId: row.manifest_id, manifestDigest: row.manifest_digest,
    factCount: Number(row.fact_count), privacyEpoch: Number(row.privacy_epoch),
    consentRevision: Number(row.consent_revision), replayed: row.replayed,
  };
}

/**
 * 读 manifest 中「仍可嵌入」的事实（embedding seam 边界：content 从这里出库给 embedder）。
 * 重验 liveness——返回数 < manifest 计数即构建中途有撤回/删除，调用方必须失败不激活（删除先赢）。
 */
export async function readEmbeddableManifestFacts(c: Client, manifestId: string): Promise<EmbeddableManifestFact[]> {
  const r = await c.query<{ fact_id: string; fact_key: string; content: string; content_digest: string }>(
    'SELECT * FROM memory_read_embeddable_manifest_facts($1)', [manifestId],
  );
  return r.rows.map((row) => ({
    factId: row.fact_id, factKey: row.fact_key, content: row.content, contentDigest: row.content_digest,
  }));
}

/** 独立构建 shadow generation（不激活）；非法输入 SQL RAISE 回滚。 */
export async function buildShadowGeneration(c: Client, input: BuildShadowGenerationInput): Promise<GenerationReceipt> {
  const embeddings = JSON.stringify(input.embeddings.map((e) => ({
    factId: e.factId, dimension: e.dimension, vector: e.vector, checksum: e.checksum,
  })));
  const r = await c.query<{ id: string; status: MemoryIndexGenerationStatus }>(
    'SELECT * FROM memory_build_shadow_generation($1,$2,$3,$4,$5)',
    [input.generationKey, input.manifestId, input.embeddingRecipeDigest, input.dimension, embeddings],
  );
  const row = r.rows[0];
  if (!row?.id)
    throw Object.assign(new Error('memory_build_generation_failed'), { code: 'memory_build_generation_failed' });
  return { id: row.id, status: row.status };
}

/** 验证 generation（digest/计数/embedding 完整性/recipe 一致）→ building→validated；失败返回 null。 */
export async function validateGeneration(
  c: Client, generationId: string, expected: { manifestDigest: string; factCount: number; embeddingRecipeDigest: string },
): Promise<GenerationReceipt | null> {
  const r = await c.query<{ id: string; status: MemoryIndexGenerationStatus }>(
    'SELECT * FROM memory_validate_generation($1,$2,$3,$4)',
    [generationId, expected.manifestDigest, expected.factCount, expected.embeddingRecipeDigest],
  );
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status };
}

/** CAS 切换 active（重验 liveness，删除/撤回先赢）；失败返回 null。 */
export async function switchActiveGeneration(c: Client, generationId: string): Promise<GenerationReceipt | null> {
  const r = await c.query<{ id: string; status: MemoryIndexGenerationStatus }>(
    'SELECT * FROM memory_switch_active_generation($1)', [generationId],
  );
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status };
}

/** 退役窗口关闭：retiring→retired；非法跃迁返回 null。 */
export async function retireGenerationWindow(c: Client, generationId: string): Promise<GenerationReceipt | null> {
  const r = await c.query<{ id: string; status: MemoryIndexGenerationStatus }>(
    'SELECT * FROM memory_retire_generation_window($1)', [generationId],
  );
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status };
}

/** fence generation（撤回/删除）并失效其缓存；非法跃迁返回 null。 */
export async function fenceGeneration(c: Client, generationId: string): Promise<GenerationReceipt | null> {
  const r = await c.query<{ id: string; status: MemoryIndexGenerationStatus }>(
    'SELECT * FROM memory_fence_generation($1)', [generationId],
  );
  const row = r.rows[0];
  if (!row) return null;
  return { id: row.id, status: row.status };
}

/** 撤回/删除同步：fence 所有引用这些 fact 的 generation + 失效其缓存。返回 fenced 条数。 */
export async function fenceGenerationsForFacts(c: Client, factIds: string[]): Promise<number> {
  const r = await c.query<{ fenced_count: string | number }>(
    'SELECT * FROM memory_fence_generations_for_facts($1)', [factIds],
  );
  const n = Number(r.rows[0]?.fenced_count);
  if (!Number.isSafeInteger(n) || n < 0)
    throw Object.assign(new Error('memory_fence_for_facts_failed'), { code: 'memory_fence_for_facts_failed' });
  return n;
}

/** 缓存写：绑当前 active generation 的 epoch/revision。 */
export async function putGenerationCacheEntry(
  c: Client, input: { generationId: string; cacheKind: MemoryIndexCacheKind; cacheKey: string; value: unknown },
): Promise<{ id: string; status: 'live' }> {
  const r = await c.query<{ id: string; status: 'live' }>(
    'SELECT * FROM memory_put_generation_cache_entry($1,$2,$3,$4)',
    [input.generationId, input.cacheKind, input.cacheKey, JSON.stringify(input.value)],
  );
  const row = r.rows[0];
  if (!row?.id)
    throw Object.assign(new Error('memory_put_cache_failed'), { code: 'memory_put_cache_failed' });
  return { id: row.id, status: row.status };
}

/** 缓存读：命中前重验绑定 generation 仍 active + epoch/revision 匹配；陈旧返回 null（防御性失效）。 */
export async function lookupGenerationCache(
  c: Client, cacheKind: MemoryIndexCacheKind, cacheKey: string,
): Promise<GenerationCacheEntry | null> {
  const r = await c.query<{ cache_entry_id: string; generation_id: string; value: unknown; status: 'live' }>(
    'SELECT * FROM memory_lookup_generation_cache($1,$2)', [cacheKind, cacheKey],
  );
  const row = r.rows[0];
  if (!row) return null;
  return {
    cacheEntryId: row.cache_entry_id, generationId: row.generation_id,
    value: typeof row.value === 'string' ? JSON.parse(row.value) : row.value, status: row.status,
  };
}

/** 失效某 generation 的全部缓存；返回失效条数。 */
export async function invalidateGenerationCache(c: Client, generationId: string): Promise<number> {
  const r = await c.query<{ invalidated_count: string | number }>(
    'SELECT * FROM memory_invalidate_generation_cache($1)', [generationId],
  );
  const n = Number(r.rows[0]?.invalidated_count);
  if (!Number.isSafeInteger(n) || n < 0)
    throw Object.assign(new Error('memory_invalidate_cache_failed'), { code: 'memory_invalidate_cache_failed' });
  return n;
}

/** 读 active generation（recall 只读 active generation 的承重入口）；无 active 返回 null。 */
export async function activeGeneration(c: Client): Promise<ActiveGeneration | null> {
  const r = await c.query<{
    id: string; generation_key: string; manifest_digest: string;
    generation_privacy_epoch: string | number; generation_consent_revision: string | number;
    status: MemoryIndexGenerationStatus;
  }>('SELECT * FROM memory_active_generation()');
  const row = r.rows[0];
  if (!row) return null;
  return {
    id: row.id, generationKey: row.generation_key, manifestDigest: row.manifest_digest,
    generationPrivacyEpoch: Number(row.generation_privacy_epoch),
    generationConsentRevision: Number(row.generation_consent_revision), status: row.status,
  };
}

/** 最小 recall：只读 active generation 的 fact id 且重验 liveness；完整两阶段召回是 MEM-14。 */
export async function recallActiveGenerationFactIds(c: Client): Promise<{ factId: string; factKey: string }[]> {
  const r = await c.query<{ fact_id: string; fact_key: string }>(
    'SELECT * FROM memory_recall_active_generation_fact_ids()',
  );
  return r.rows.map((row) => ({ factId: row.fact_id, factKey: row.fact_key }));
}

/**
 * 一键构建 shadow generation（不激活）：freeze → read（重验 liveness）→ embed（seam）→ build。
 * 返回 generation 收据 + 冻结 manifest 回执 + 实际嵌入条数。失败（liveness 计数不符 / SQL RAISE）
 * 向上抛错——调用方据此决定「不激活、清空重试」，绝不原地覆盖 active。
 */
export async function buildMemoryGeneration(
  c: Client,
  input: {
    generationKey: string;
    manifestKey: string;
    recipe: MemoryEmbeddingRecipe;
    policyVersion: string;
    embedder: MemoryEmbedder;
    idempotencyKey?: string;
  },
): Promise<{ generation: GenerationReceipt; manifest: MemoryIndexManifestReceipt; embeddedCount: number }> {
  const recipeDigest = deriveEmbeddingRecipeDigest(input.recipe);
  const manifest = await freezeSourceManifest(c, {
    manifestKey: input.manifestKey, embeddingRecipeDigest: recipeDigest,
    policyVersion: input.policyVersion, idempotencyKey: input.idempotencyKey,
  });
  const facts = await readEmbeddableManifestFacts(c, manifest.manifestId);
  // 删除先赢：冻结后任一条 fact 被撤回/删除 → 可嵌入数 < manifest 计数 → fail（不激活）。
  if (facts.length !== manifest.factCount) {
    throw Object.assign(new Error('memory_generation_stale_manifest'), { code: 'memory_generation_stale_manifest' });
  }
  const vectors = await input.embedder.embed(facts.map((f) => f.content));
  const embeddings: GenerationEmbeddingInput[] = facts.map((f, i) => ({
    factId: f.factId, dimension: input.embedder.dim, vector: vectors[i]!, checksum: memoryVectorChecksum(vectors[i]!),
  }));
  const generation = await buildShadowGeneration(c, {
    generationKey: input.generationKey, manifestId: manifest.manifestId,
    embeddingRecipeDigest: recipeDigest, dimension: input.embedder.dim, embeddings,
  });
  return { generation, manifest, embeddedCount: facts.length };
}
