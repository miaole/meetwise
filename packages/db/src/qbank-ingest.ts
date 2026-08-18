/**
 * 共享题库灌库(决策 i):策展真题 → embed → **经策展治理入库**,而非直写 vector_chunk。
 *
 * 治理路径(每条种子):findSourceByHash/propose → qbank_source(kind,content_hash 去重)→ approve → promoteToPool
 *   → 写 vector_chunk(kind='qbank',系统 owner)。这样该 chunk 的 ref_id 进 approved 策展源之下的 qbank_pool_entry
 *   (0016 可见 lane(a))→ **撤销(reject)源即时下架其真实 chunk**。此前灌库直写 vector_chunk(落 0016 lane(b) 免治理),
 *   源审核/撤销只管未来内容、撤不掉现有题库 —— 本改动把线上真实题库接进治理,使其**可被撤销下架**。
 *
 * 键对齐(修专家审计致命项):可见性 JOIN 与 pool 唯一键都是 **ref_id**(0016 视图 + 0013 UNIQUE(ref_id)),故
 *   pool 条目 PK 也**随 ref_id 派生**('qp-'+sha(refId)),与 ON CONFLICT(ref_id) 仲裁对齐 —— 杜绝"PK 由 content_hash 派生、
 *   仲裁却按 ref_id"导致的 PK 冲突(23505)逃逸 ON CONFLICT → 整批中止(同题面不同 refId / 跨批复灌确定性触发)。
 *   source PK 仍随 content_hash(源身份=内容,同文本多 refId 共享一源);chunk id 仍随 content_hash(与其 UNIQUE(owner,kind,hash) 一致)。
 *
 * refId 内容不可变守卫:同一 refId 若已有**不同 content_hash** 的治理块,视为"改版"——DB 是 ref_id 键的 append-only 池,
 *   无法就地重指;静默 DO NOTHING 会把治理挂在旧源上(reject 打错源→下架失效)。故**抛错(fail-loud)**:改版须走新 refId + 撤销旧源。
 *
 * 灌库、generation 构建和活动指针切换只能使用独立 qbank_control_executor 数据库身份。普通 app_role
 * 即使伪造 app.principal_user（应用会话主体）也没有写权限；缺身份或缺架构必须失败关闭，不能退回 GUC 直灌。
 *
 * 幂等/原子性:批内先按 refId 去重(同 refId 多次=输入错误,取最后一条,防自撞);**逐条独立事务**(控制面 executor 各自
 *   BEGIN/COMMIT)——灌库天生幂等,不需全批 all-or-nothing:一条竞态/冲突只跳过或失败该条,不拖垮整批;崩溃后重灌补齐
 *   (源 content_hash 去重 + pool ON CONFLICT(ref_id) + chunk ON CONFLICT(owner,kind,hash) 皆幂等)。已 reject 的源**不复活**
 *   (findSourceByHash 见 rejected→跳过);并发把源撤销时 reviewSource CAS 落败→重读→尊重下架跳过(不让池触发器炸该条)。
 * 隐私:原文不入向量库(只 ref_id+hash+向量);题面原文在业务表/题库源。返回真正入库(未跳过)的条数。
 */
import { asQbankControlExecutor, type DbPool } from './principal.ts';
import { upsertVectorChunk } from './retrieval-store.ts';
import { createHash } from 'node:crypto';
import {
  proposeSource, reviewSource, promoteToPool, isApprovedSource, findSourceByHash, type QbankSourceKind,
} from './qbank-curation.ts';

/**
 * 向量化 seam(embedding 供应商可换,接口不变)。这里**刻意不** import `@meetwise/ai-runtime` 的 Embedder:
 * ai-runtime 在运行时(值)依赖 @meetwise/db,若 db 反向 import ai-runtime 会闭合包级环(depcruise no-circular),
 * 且 packages/db 未声明 ai-runtime 依赖,packages/db 独立 `tsc --noEmit` 无法解析它。故在 db 数据面本地声明
 * 结构等价的最小接口——任意 ai-runtime Embedder(含 fakeEmbedder)在结构上自动满足。dim/id 保留为只读
 * 必填字段,与 ai-runtime Embedder 的必填面一致:调用方(含 proof 内联对象)传 {id,dim,embed} 不触发 excess-property 报错。
 */
export interface QbankEmbedder {
  readonly dim: number;
  readonly id: string;
  embed(texts: string[]): Promise<number[][]>;
}

export const QBANK_OWNER = '__system_qbank__';   // 系统灌库主体:qbank 向量唯一可写 principal + 治理路径下的 curator(迁移 0017 seed)

export const QBANK_TAXONOMY_V1 = 'v1';
export const QBANK_ANNOTATION_SOURCES = ['curator_reviewed', 'seed_v1_reviewed'] as const;
export type QbankAnnotationSource = (typeof QBANK_ANNOTATION_SOURCES)[number];

/**
 * A serving scope is assigned when a source is cut, before it can become a
 * generation input.  It is deliberately independent of a later job route:
 * route selection may choose this reviewed leaf but may never manufacture one.
 */
export interface QbankServingMetadata {
  taxonomyVersion: string;
  servingScopeId: string;
  annotationSource: QbankAnnotationSource;
}

/**
 * Historical migration proofs build a pre-0086 database deliberately.  This
 * seam is only for constructing that fixture: normal worker callers must
 * have the complete metadata schema before they can ingest a serving fact.
 */
export interface QbankIngestOptions {
  allowLegacyMetadataFixture?: boolean;
}

export interface QbankItem extends QbankServingMetadata { refId: string; text: string; kind?: QbankSourceKind }
export const QBANK_QUESTION_CHUNK_ROLES = ['prompt', 'rubric', 'follow_up', 'example', 'anti_pattern', 'source_note'] as const;
export type QbankQuestionChunkRole = (typeof QBANK_QUESTION_CHUNK_ROLES)[number];

export interface QbankQuestionArtifactChunk {
  refId: string;
  text: string;
  role: QbankQuestionChunkRole;
  ordinal: number;
  /** Prompt and rubric are mandatory for a published question; callers may mark other evidence mandatory too. */
  required?: boolean;
  kind?: QbankSourceKind;
}

/**
 * Question metadata is deliberately outside the embedding text.  Each artifact has several retrievable, immutable
 * chunks so an agent can retrieve a prompt by meaning yet receive its rubric/follow-ups/anti-patterns as a complete
 * evidence package.  A direct QbankItem remains available only for non-question reference material.
 */
export interface QbankQuestionArtifact {
  id: string;
  competency: string;
  difficulty: number;
  /** Canonical leaf; every v1 chunk mapping must carry this exact reviewed tuple. */
  taxonomyVersion: string;
  servingScopeId: string;
  annotationSource: QbankAnnotationSource;
  chunks: readonly QbankQuestionArtifactChunk[];
}

const hashOf = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);
const SAFE_REF_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const TAXONOMY_VERSION = /^v[1-9][0-9]{0,15}$/;
const SERVING_SCOPE = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;

/** Must remain byte-identical to `qbank_metadata_hash` in migration 0086. */
export function qbankMetadataHash(
  kind: 'qbank-chunk-scope:v1' | 'qbank-artifact-metadata:v1',
  metadata: QbankServingMetadata,
): string {
  return createHash('sha256').update(
    `${kind}:${metadata.taxonomyVersion}:${metadata.servingScopeId}:${metadata.annotationSource}`,
    'utf8',
  ).digest('hex');
}

function validateServingMetadata(metadata: QbankServingMetadata, label: string): void {
  if (!TAXONOMY_VERSION.test(metadata.taxonomyVersion)
    || !SERVING_SCOPE.test(metadata.servingScopeId)
    || !(QBANK_ANNOTATION_SOURCES as readonly string[]).includes(metadata.annotationSource)) {
    throw new Error(`qbank_invalid_serving_metadata:${label.slice(0, 160)}`);
  }
}

async function assertReviewedServingScopes(pool: DbPool, metadata: readonly QbankServingMetadata[]): Promise<void> {
  const unique = [...new Map(metadata.map((entry) => [
    `${entry.taxonomyVersion}\u0000${entry.servingScopeId}`,
    entry,
  ])).values()];
  await asQbankControlExecutor(pool, async (c) => {
    for (const entry of unique) {
      const scope = await c.query(
        `SELECT 1
           FROM qbank_taxonomy_release r
           JOIN qbank_taxonomy_scope s ON s.taxonomy_version=r.version
          WHERE r.version=$1 AND r.state='released'
            AND s.scope_id=$2 AND s.is_leaf`,
        [entry.taxonomyVersion, entry.servingScopeId],
      );
      if (scope.rowCount !== 1) {
        throw new Error(`qbank_serving_scope_not_released_leaf:${entry.taxonomyVersion}:${entry.servingScopeId}`);
      }
    }
  });
}

export async function ingestQbank(
  pool: DbPool,
  items: QbankItem[],
  embedder: QbankEmbedder,
  options: QbankIngestOptions = {},
): Promise<number> {
  if (items.length === 0) return 0;
  for (const item of items) {
    if (!SAFE_REF_ID.test(item.refId)) throw new Error(`qbank_invalid_ref_id:${item.refId.slice(0, 32)}`);
    if (!item.text.trim() || item.text.length > 24_000) throw new Error(`qbank_invalid_content:${item.refId}`);
    validateServingMetadata(item, item.refId);
  }
  // A raw cut can receive independently reviewed projections.  A repeated
  // `(ref, version, scope)` is only idempotent when the canonical content and
  // review source agree; anything else would make input order choose the
  // evidence that a published artifact later resolves to.
  const byProjection = new Map<string, QbankItem>();
  for (const item of items) {
    const key = `${item.refId}\u0000${item.taxonomyVersion}\u0000${item.servingScopeId}`;
    const previous = byProjection.get(key);
    if (previous && (previous.text !== item.text
      || (previous.kind ?? 'question_bank') !== (item.kind ?? 'question_bank')
      || previous.annotationSource !== item.annotationSource)) {
      throw new Error(`qbank_conflicting_projection_input:${item.refId}`);
    }
    byProjection.set(key, item);
  }
  const uniq = [...byProjection.values()];

  // Authority is the executor login, not a mutable request GUC.  A missing
  // control-plane schema therefore fails closed before any corpus write.
  const governed = await asQbankControlExecutor(pool, async (c) => {
    const tbl = (await c.query(
      "SELECT to_regclass('qbank_pool_entry') IS NOT NULL AND to_regclass('qbank_curator') IS NOT NULL AS ok")).rows[0].ok as boolean;
    return tbl;
  });
  // 0029+ stores reconstructible facts and builds an immutable generation later. It intentionally does not
  // overwrite legacy vector_chunk: doing so would recreate the mixed-vector-space P0 this migration removes.
  const generationStore = await asQbankControlExecutor(pool, async (c) =>
    (await c.query("SELECT to_regclass('qbank_chunk') IS NOT NULL AS ok")).rows[0]?.ok === true,
  );
  const metadataStore = await asQbankControlExecutor(pool, async (c) =>
    (await c.query(
      "SELECT to_regclass('qbank_taxonomy_release') IS NOT NULL AND to_regclass('qbank_taxonomy_scope') IS NOT NULL AND to_regclass('qbank_chunk_serving_scope') IS NOT NULL AS ok",
    )).rows[0]?.ok === true,
  );
  if (generationStore && !governed) {
    throw new Error('qbank_generation_requires_governed_source_pool');
  }
  // A normal worker must run the complete migration manifest.  The one
  // explicit fixture seam keeps upgrade proofs able to construct their old
  // prefix, without allowing a rolling runtime to silently continue serving
  // unreviewed cuts after 0086 is expected.
  if (!metadataStore && !options.allowLegacyMetadataFixture) {
    throw new Error('qbank_serving_metadata_schema_missing');
  }
  if (metadataStore) await assertReviewedServingScopes(pool, uniq);
  // Legacy-only test/upgrade compatibility still writes vector_chunk. In generation mode embeddings are produced
  // once by the immutable full-corpus builder, so an ingest does not spend a second provider call only to discard it.
  const vecs = generationStore ? undefined : await embedder.embed(uniq.map((i) => i.text));

  let n = 0;
  for (let i = 0; i < uniq.length; i++) {
    const item = uniq[i];
    if (!item) throw new Error(`qbank_internal_missing_item:${i}`);
    const { refId } = item;
    const hash = hashOf(item.text);
    const embedding = vecs?.[i];
    // 逐条独立事务:爆炸半径=单条;幂等故可续跑。
    const wrote = await asQbankControlExecutor(pool, async (c) => {
      if (governed) {
        const found = await findSourceByHash(c, hash);
        if (found?.status === 'rejected') return false;              // 尊重下架:重灌不复活被撤销的种子
        // refId 内容不可变守卫:同 refId 已有不同 content_hash 的治理块 = 改版 → 拒绝静默 mis-key,fail-loud。
        const prior = await c.query(
          "SELECT content_hash FROM vector_chunk WHERE ref_id=$1 AND kind='qbank' AND owner_user_id=$2", [refId, QBANK_OWNER]);
        const priorVector = prior.rows[0];
        if (prior.rowCount && (!priorVector || priorVector.content_hash !== hash))
          throw new Error(`qbank refId ${refId} 内容已变(改版须用新 refId + 撤销旧源);拒绝静默重指治理`);
        const sourceId = found
          ? found.id                                                 // 复用既有活跃源(幂等,不重建)
          : (await proposeSource(c, {
              id: 'qs-' + hash, kind: item.kind ?? 'question_bank',
              uri: 'seed://' + refId, contentHash: hash, addedBy: QBANK_OWNER,
            })).sourceId;
        if (!(await isApprovedSource(c, sourceId))) {                // 半途 provision 恢复:pending → approve
          const ok = await reviewSource(c, sourceId, 'pending', 'approved', 'seed auto-approved (trusted system corpus)');
          if (!ok) {                                                 // CAS 落败(并发被撤销/改状态)→ 重读,尊重下架而非让池触发器炸该条
            const now = await findSourceByHash(c, hash);
            if (now?.status !== 'approved') return false;
          }
        }
        // pool 条目:PK 随 refId('qp-'+sha(refId))与 ON CONFLICT(ref_id) 仲裁对齐 → 无 PK 逃逸;该 chunk 从此受治理(lane a)。
        await promoteToPool(c, { id: 'qp-' + hashOf(refId), sourceId, refId, contentHash: hash });
        if (generationStore) {
          const priorFact = await c.query('SELECT content_hash, source_id FROM qbank_chunk WHERE ref_id=$1', [refId]);
          const priorChunk = priorFact.rows[0];
          if (priorFact.rowCount && (!priorChunk || priorChunk.content_hash !== hash || priorChunk.source_id !== sourceId)) {
            throw new Error(`qbank refId ${refId} immutable fact mismatch; use a new refId and revoke the prior source`);
          }
          await c.query(
            `INSERT INTO qbank_chunk(ref_id, source_id, content_hash, content)
             VALUES ($1,$2,$3,$4)
             ON CONFLICT (ref_id) DO NOTHING`,
            [refId, sourceId, hash, item.text],
          );
          if (metadataStore) {
            const chunkMetadataHash = qbankMetadataHash('qbank-chunk-scope:v1', item);
            await c.query(
              `INSERT INTO qbank_chunk_serving_scope(
                 ref_id,taxonomy_version,serving_scope_id,annotation_source,metadata_hash
               ) VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (ref_id,taxonomy_version,serving_scope_id) DO NOTHING`,
              [refId, item.taxonomyVersion, item.servingScopeId, item.annotationSource, chunkMetadataHash],
            );
            const persistedMetadata = await c.query(
              `SELECT annotation_source, metadata_hash
                 FROM qbank_chunk_serving_scope
                WHERE ref_id=$1 AND taxonomy_version=$2 AND serving_scope_id=$3`,
              [refId, item.taxonomyVersion, item.servingScopeId],
            );
            const persisted = persistedMetadata.rows[0];
            if (persistedMetadata.rowCount !== 1
              || persisted?.annotation_source !== item.annotationSource
              || persisted?.metadata_hash !== chunkMetadataHash) {
              throw new Error(`qbank_chunk_serving_metadata_immutable_mismatch:${refId}`);
            }
          }
        }
      }
      if (!generationStore) {
        if (!embedding) throw new Error('qbank_legacy_embedding_missing');
        await upsertVectorChunk(c, QBANK_OWNER, { id: 'qb-' + hash, kind: 'qbank', refId, contentHash: hash, embedding });
      }
      return true;
    });
    if (wrote) n++;
  }
  return n;
}

const artifactHash = (artifact: QbankQuestionArtifact) => createHash('sha256').update(JSON.stringify({
  id: artifact.id, competency: artifact.competency, difficulty: artifact.difficulty,
  taxonomyVersion: artifact.taxonomyVersion, servingScopeId: artifact.servingScopeId,
  annotationSource: artifact.annotationSource,
  chunks: artifact.chunks.map((chunk) => ({
    refId: chunk.refId, text: chunk.text, role: chunk.role, ordinal: chunk.ordinal, required: chunk.required === true,
  })),
})).digest('hex');

function validateQuestionArtifacts(artifacts: readonly QbankQuestionArtifact[]): void {
  const ids = new Set<string>();
  for (const artifact of artifacts) {
    if (!SAFE_REF_ID.test(artifact.id) || !ids.add(artifact.id)) throw new Error(`qbank_question_invalid_id:${artifact.id.slice(0, 32)}`);
    if (!artifact.competency.trim() || artifact.competency.length > 128) throw new Error(`qbank_question_invalid_competency:${artifact.id}`);
    if (!Number.isInteger(artifact.difficulty) || artifact.difficulty < 1 || artifact.difficulty > 5) throw new Error(`qbank_question_invalid_difficulty:${artifact.id}`);
    validateServingMetadata(artifact, artifact.id);
    if (artifact.chunks.length < 3 || artifact.chunks.length > 12) throw new Error(`qbank_question_invalid_chunk_count:${artifact.id}`);
    const refIds = new Set<string>();
    const seenRoleOrdinal = new Set<string>();
    let prompt = 0; let rubric = 0;
    for (const chunk of artifact.chunks) {
      if (!SAFE_REF_ID.test(chunk.refId) || !refIds.add(chunk.refId)) throw new Error(`qbank_question_duplicate_or_invalid_ref:${chunk.refId.slice(0, 32)}`);
      if (!chunk.text.trim() || chunk.text.length > 24_000) throw new Error(`qbank_question_invalid_chunk_text:${artifact.id}`);
      if (!(QBANK_QUESTION_CHUNK_ROLES as readonly string[]).includes(chunk.role)) throw new Error(`qbank_question_invalid_chunk_role:${artifact.id}`);
      if (!Number.isInteger(chunk.ordinal) || chunk.ordinal < 0 || chunk.ordinal > 99 || !seenRoleOrdinal.add(`${chunk.role}:${chunk.ordinal}`)) {
        throw new Error(`qbank_question_invalid_chunk_ordinal:${artifact.id}`);
      }
      if (chunk.role === 'prompt') prompt++;
      if (chunk.role === 'rubric') rubric++;
    }
    if (prompt !== 1 || rubric < 1) throw new Error(`qbank_question_requires_exact_prompt_and_rubric:${artifact.id}`);
    const promptChunk = artifact.chunks.find((chunk) => chunk.role === 'prompt');
    const rubricChunk = artifact.chunks.find((chunk) => chunk.role === 'rubric');
    if (!promptChunk?.required || !rubricChunk?.required) throw new Error(`qbank_question_prompt_and_rubric_must_be_required:${artifact.id}`);
  }
}

/**
 * Ingests published interview questions as a composite RAG artifact.  It intentionally refuses a legacy database:
 * silently degrading an expert question into one vector would make the interview agent score against incomplete
 * evidence. Chunks are stored first through the same approved-source governance; the question becomes visible only
 * after every mapping is atomically written and its immutable artifact receipt matches.
 */
export async function ingestQuestionBankArtifacts(
  pool: DbPool,
  artifacts: readonly QbankQuestionArtifact[],
  embedder: QbankEmbedder,
  options: QbankIngestOptions = {},
): Promise<{ questionCount: number; chunkCount: number }> {
  if (!artifacts.length) return { questionCount: 0, chunkCount: 0 };
  validateQuestionArtifacts(artifacts);
  const schema = await asQbankControlExecutor(pool, async (c) =>
    (await c.query(
      "SELECT to_regclass('qbank_question') IS NOT NULL AND to_regclass('qbank_question_chunk') IS NOT NULL AS ok",
    )).rows[0]?.ok === true,
  );
  if (!schema) throw new Error('qbank_question_artifact_schema_missing');

  const metadataStore = await asQbankControlExecutor(pool, async (c) =>
    (await c.query("SELECT to_regclass('qbank_chunk_serving_scope') IS NOT NULL AS ok")).rows[0]?.ok === true,
  );

  if (!metadataStore && !options.allowLegacyMetadataFixture) {
    throw new Error('qbank_serving_metadata_schema_missing');
  }
  if (metadataStore) await assertReviewedServingScopes(pool, artifacts);

  const allChunks: QbankItem[] = artifacts.flatMap((artifact) => artifact.chunks.map((chunk) => ({
    refId: chunk.refId, text: chunk.text, kind: chunk.kind ?? 'question_bank',
    taxonomyVersion: artifact.taxonomyVersion,
    servingScopeId: artifact.servingScopeId,
    annotationSource: artifact.annotationSource,
  })));
  const rawContent = new Map<string, { text: string; kind: QbankSourceKind }>();
  for (const chunk of allChunks) {
    const prior = rawContent.get(chunk.refId);
    const kind = chunk.kind ?? 'question_bank';
    if (prior && (prior.text !== chunk.text || prior.kind !== kind)) {
      throw new Error(`qbank_question_shared_ref_content_mismatch:${chunk.refId}`);
    }
    rawContent.set(chunk.refId, { text: chunk.text, kind });
  }
  await ingestQbank(pool, allChunks, embedder, options);

  for (const artifact of artifacts) {
    const receipt = artifactHash(artifact);
    await asQbankControlExecutor(pool, async (c) => {
      const metadataHash = qbankMetadataHash('qbank-artifact-metadata:v1', artifact);
      const existing = await c.query(
        metadataStore
          ? `SELECT artifact_hash,state,metadata_state,taxonomy_version,serving_scope_id,annotation_source,metadata_hash
               FROM qbank_question WHERE id=$1 FOR UPDATE`
          : 'SELECT artifact_hash,state FROM qbank_question WHERE id=$1 FOR UPDATE',
        [artifact.id],
      );
      if (existing.rowCount && existing.rows[0].artifact_hash !== receipt) {
        throw new Error(`qbank_question_immutable_artifact_mismatch:${artifact.id}`);
      }
      if (metadataStore && existing.rowCount && (
        existing.rows[0].metadata_state !== 'reviewed'
        || existing.rows[0].taxonomy_version !== artifact.taxonomyVersion
        || existing.rows[0].serving_scope_id !== artifact.servingScopeId
        || existing.rows[0].annotation_source !== artifact.annotationSource
        || existing.rows[0].metadata_hash !== metadataHash
      )) {
        throw new Error(`qbank_question_metadata_immutable_mismatch:${artifact.id}`);
      }
      if (!existing.rowCount) {
        await c.query(
          metadataStore
            ? `INSERT INTO qbank_question(
                 id,artifact_hash,competency,difficulty,state,
                 metadata_state,taxonomy_version,serving_scope_id,annotation_source,metadata_hash
               ) VALUES ($1,$2,$3,$4,'draft','reviewed',$5,$6,$7,$8)`
            : `INSERT INTO qbank_question(id,artifact_hash,competency,difficulty,state)
               VALUES ($1,$2,$3,$4,'draft')`,
          metadataStore
            ? [artifact.id, receipt, artifact.competency.trim(), artifact.difficulty,
              artifact.taxonomyVersion, artifact.servingScopeId, artifact.annotationSource, metadataHash]
            : [artifact.id, receipt, artifact.competency.trim(), artifact.difficulty],
        );
      }
      for (const chunk of artifact.chunks) {
        await c.query(
          metadataStore
            ? `INSERT INTO qbank_question_chunk(
                 question_id,ref_id,content_hash,role,ordinal,required,
                 taxonomy_version,serving_scope_id,annotation_source,metadata_hash
               ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
               ON CONFLICT (question_id,ref_id) DO NOTHING`
            : `INSERT INTO qbank_question_chunk(question_id,ref_id,role,ordinal,required)
               VALUES ($1,$2,$3,$4,$5)
               ON CONFLICT (question_id,ref_id) DO NOTHING`,
          metadataStore
            ? [artifact.id, chunk.refId, hashOf(chunk.text), chunk.role, chunk.ordinal, chunk.required === true,
              artifact.taxonomyVersion, artifact.servingScopeId, artifact.annotationSource, metadataHash]
            : [artifact.id, chunk.refId, chunk.role, chunk.ordinal, chunk.required === true],
        );
      }
      const complete = await c.query(
        metadataStore
          ? `SELECT count(*)::int AS total,
                    count(*) FILTER (WHERE role='prompt')::int AS prompts,
                    count(*) FILTER (WHERE role='rubric')::int AS rubrics,
                    count(*) FILTER (WHERE required)::int AS required,
                    count(*) FILTER (WHERE taxonomy_version=$2 AND serving_scope_id=$3 AND annotation_source=$4 AND metadata_hash=$5)::int AS matching_metadata
               FROM qbank_question_chunk WHERE question_id=$1`
          : `SELECT count(*)::int AS total,
                    count(*) FILTER (WHERE role='prompt')::int AS prompts,
                    count(*) FILTER (WHERE role='rubric')::int AS rubrics,
                    count(*) FILTER (WHERE required)::int AS required,
                    count(*)::int AS matching_metadata
               FROM qbank_question_chunk WHERE question_id=$1`,
        metadataStore
          ? [artifact.id, artifact.taxonomyVersion, artifact.servingScopeId, artifact.annotationSource, metadataHash]
          : [artifact.id],
      );
      const row = complete.rows[0];
      if (Number(row.total) !== artifact.chunks.length || Number(row.prompts) !== 1 || Number(row.rubrics) < 1
        || Number(row.required) < 2 || Number(row.matching_metadata) !== artifact.chunks.length) {
        throw new Error(`qbank_question_incomplete_mapping:${artifact.id}`);
      }
      // A published receipt is immutable.  Re-ingest can prove the same
      // draft-to-published transition once, but it must never issue a no-op
      // UPDATE against an already-published row: the database trigger treats
      // every post-publication write as a tamper attempt.
      await c.query("UPDATE qbank_question SET state='published' WHERE id=$1 AND state='draft'", [artifact.id]);
    });
  }
  return { questionCount: artifacts.length, chunkCount: allChunks.length };
}
