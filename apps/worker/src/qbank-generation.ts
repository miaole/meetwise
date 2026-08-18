/**
 * Immutable qbank generation builder.
 *
 * The caller first persists approved, reconstructible qbank facts, then this module embeds a frozen snapshot into
 * an inactive partition. It never updates the current generation. `qbank_activate_generation` performs the only
 * traffic switch after row-count + epoch validation inside a DB transaction.
 */
import { createHash, randomUUID } from 'node:crypto';
import { asQbankControlExecutor, type DbPool } from '@meetwise/db';
import type { Embedder } from '@meetwise/ai-runtime';

const CHUNKER_VERSION = 'whole-qbank-item:v1';
const NORMALIZATION_VERSION = 'utf8-nfc-trim:v1';
const PREFIX_VERSION = 'none:v1';
const INSERT_BATCH = 64;

export interface QbankEmbeddingRecipe {
  id: string;
  hash: string;
  provider: string;
  model: string;
  providerRevision: string;
  dimensions: number;
  chunkerVersion: string;
  normalizationVersion: string;
  documentPrefixVersion: string;
  queryPrefixVersion: string;
  manifest: Record<string, string | number>;
}

export interface QbankGenerationResult {
  status: 'reused' | 'activated' | 'blocked_unrebuildable_legacy';
  recipe: QbankEmbeddingRecipe;
  generationId?: string;
  chunkCount: number;
  unrebuildableLegacyRefs?: string[];
}

const stableHash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * This legacy receipt covers only the fields listed below. It does not yet bind
 * deployment/region or prove that the declared normalization has been executed,
 * so it is insufficient for a routed projection or shared production compute cache.
 * `EMBED_MODEL_REVISION` is mandatory in stricter deployments; development is
 * marked `unverified` rather than pretending a floating provider model is immutable.
 * Set RAG_REQUIRE_EMBED_REVISION=1 to refuse that startup configuration.
 */
export function qbankEmbeddingRecipe(embedder: Embedder): QbankEmbeddingRecipe {
  if (embedder.dim !== 512) throw new Error(`qbank_generation_unsupported_dimension:${embedder.dim}`);
  const providerRevision = process.env.EMBED_MODEL_REVISION?.trim() || 'unverified';
  if (process.env.RAG_REQUIRE_EMBED_REVISION === '1' && providerRevision === 'unverified') {
    throw new Error('qbank_generation_provider_revision_required');
  }
  const manifest = {
    schema: 'qbank-embedding-recipe:v1',
    provider: 'openai-compatible',
    model: embedder.id.replace(/\+cache$/, ''),
    providerRevision,
    dimensions: embedder.dim,
    chunkerVersion: CHUNKER_VERSION,
    normalizationVersion: NORMALIZATION_VERSION,
    documentPrefixVersion: PREFIX_VERSION,
    queryPrefixVersion: PREFIX_VERSION,
  } as const;
  const hash = stableHash(manifest);
  return {
    id: 'qrecipe-' + hash.slice(0, 32), hash,
    provider: manifest.provider, model: manifest.model, providerRevision,
    dimensions: embedder.dim, chunkerVersion: CHUNKER_VERSION, normalizationVersion: NORMALIZATION_VERSION,
    documentPrefixVersion: PREFIX_VERSION, queryPrefixVersion: PREFIX_VERSION, manifest: { ...manifest },
  };
}

/**
 * A generation fact is one frozen projection row: a single reviewed serving
 * leaf for a single raw cut.  `taxonomyVersion`/`servingScopeId` are `null`
 * only under the legacy pre-0097 schema (constructed solely by the historical
 * integrity-upgrade proof); once the projection schema exists they are always
 * present or the build fails closed.
 */
type QbankFact = {
  refId: string;
  contentHash: string;
  content: string;
  taxonomyVersion: string | null;
  servingScopeId: string | null;
};

async function generationSchemaPresent(pool: DbPool): Promise<boolean> {
  return asQbankControlExecutor(pool, async (c) =>
    (await c.query("SELECT to_regclass('qbank_vector_generation') IS NOT NULL AS ok")).rows[0]?.ok === true,
  );
}

/**
 * True once 0097 has added `serving_scope_id` to `qbank_generation_chunk`.
 * The historical integrity-upgrade proof builds generations under the
 * pre-0097 prefix, so the builder must keep a legacy single-row-per-ref path
 * for that fixture — exactly like `ingestQbank` keeps its legacy-metadata
 * seam.  When this is true, the builder emits one row per reviewed (ref,
 * scope) and refuses an unrouted approved chunk.
 */
async function projectionSchemaPresent(pool: DbPool): Promise<boolean> {
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `SELECT EXISTS (
         SELECT 1 FROM information_schema.columns
          WHERE table_schema='public' AND table_name='qbank_generation_chunk'
            AND column_name='serving_scope_id'
       ) AS present`,
    );
    return r.rows[0]?.present === true;
  });
}

async function persistRecipe(pool: DbPool, recipe: QbankEmbeddingRecipe): Promise<void> {
  await asQbankControlExecutor(pool, (c) => c.query(
    `INSERT INTO qbank_embedding_recipe(
       id,recipe_hash,provider,model,provider_revision,dimensions,chunker_version,normalization_version,
       document_prefix_version,query_prefix_version,manifest
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)
     ON CONFLICT (recipe_hash) DO NOTHING`,
    [recipe.id, recipe.hash, recipe.provider, recipe.model, recipe.providerRevision, recipe.dimensions,
      recipe.chunkerVersion, recipe.normalizationVersion, recipe.documentPrefixVersion, recipe.queryPrefixVersion,
      JSON.stringify(recipe.manifest)],
  ));
}

async function activeRecipe(pool: DbPool): Promise<{ generationId: string; recipeId: string; sourceEpoch: string } | undefined> {
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `SELECT a.generation_id, g.recipe_id, g.source_epoch::text AS source_epoch FROM qbank_active_generation a
       JOIN qbank_vector_generation g ON g.id=a.generation_id WHERE a.singleton=true AND g.state='active'`,
    );
    return r.rowCount === 1
      ? { generationId: String(r.rows[0].generation_id), recipeId: String(r.rows[0].recipe_id), sourceEpoch: String(r.rows[0].source_epoch) }
      : undefined;
  });
}

async function currentCorpusEpoch(pool: DbPool): Promise<string> {
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton=true');
    if (r.rowCount !== 1 || typeof r.rows[0]?.epoch !== 'string') throw new Error('qbank_generation_epoch_missing');
    return r.rows[0].epoch;
  });
}

async function unrebuildableLegacyRefs(pool: DbPool): Promise<string[]> {
  return asQbankControlExecutor(pool, async (c) => {
    const r = await c.query(
      `SELECT DISTINCT v.ref_id
         FROM vector_chunk v
         LEFT JOIN qbank_chunk ch ON ch.ref_id=v.ref_id AND ch.content_hash=v.content_hash
        WHERE v.owner_user_id='__system_qbank__' AND v.kind='qbank' AND ch.ref_id IS NULL
        ORDER BY v.ref_id LIMIT 101`,
    );
    return r.rows.map((row) => String(row.ref_id));
  });
}

async function snapshotFacts(pool: DbPool, projection: boolean): Promise<{ epoch: string; facts: QbankFact[] }> {
  return asQbankControlExecutor(pool, async (c) => {
    const epoch = await c.query('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton=true');
    if (epoch.rowCount !== 1) throw new Error('qbank_generation_epoch_missing');
    if (!projection) {
      // Pre-0097 legacy fixture only: one row per ref, no serving-scope column
      // exists yet, so the reviewed-scope dimension cannot be represented.
      const facts = await c.query(
        `SELECT ch.ref_id, ch.content_hash, ch.content
           FROM qbank_chunk ch
           JOIN qbank_pool_entry pool
             ON pool.ref_id=ch.ref_id
            AND pool.source_id=ch.source_id
            AND pool.content_hash=ch.content_hash
           JOIN qbank_source source
             ON source.id=pool.source_id
            AND source.content_hash=pool.content_hash
          WHERE source.status='approved'
            AND (
              pool.content_hash=left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
              OR pool.content_hash=encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex')
            )
          ORDER BY ch.ref_id`,
      );
      return {
        epoch: String(epoch.rows[0].epoch),
        facts: facts.rows.map((r) => ({
          refId: String(r.ref_id), contentHash: String(r.content_hash), content: String(r.content),
          taxonomyVersion: null, servingScopeId: null,
        })),
      };
    }
    // Post-0097 projection path: LEFT JOIN every reviewed serving scope so a
    // shared raw cut expands to one frozen row per leaf.  ORDER BY is the
    // canonical, deterministic projection order; no scope is chosen by input
    // order, and every approved fact must carry at least one reviewed leaf.
    const facts = await c.query(
      `SELECT ch.ref_id, ch.content_hash, ch.content, cs.taxonomy_version, cs.serving_scope_id
         FROM qbank_chunk ch
         JOIN qbank_pool_entry pool
           ON pool.ref_id=ch.ref_id
          AND pool.source_id=ch.source_id
          AND pool.content_hash=ch.content_hash
         JOIN qbank_source source
           ON source.id=pool.source_id
          AND source.content_hash=pool.content_hash
         LEFT JOIN qbank_chunk_serving_scope cs ON cs.ref_id=ch.ref_id
        WHERE source.status='approved'
          AND (
            pool.content_hash=left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
            OR pool.content_hash=encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex')
          )
        ORDER BY ch.ref_id, cs.taxonomy_version, cs.serving_scope_id`,
    );
    const rows = facts.rows.map((r) => ({
      refId: String(r.ref_id), contentHash: String(r.content_hash), content: String(r.content),
      taxonomyVersion: r.taxonomy_version == null ? null : String(r.taxonomy_version),
      servingScopeId: r.serving_scope_id == null ? null : String(r.serving_scope_id),
    }));
    const unrouted = rows.find((row) => row.taxonomyVersion == null || row.servingScopeId == null);
    if (unrouted) {
      throw new Error(`qbank_generation_unrouted_chunk_without_serving_scope:${unrouted.refId}`);
    }
    return { epoch: String(epoch.rows[0].epoch), facts: rows };
  });
}

async function insertGenerationRows(pool: DbPool, generationId: string, facts: QbankFact[], vectors: number[][], projection: boolean): Promise<void> {
  for (let start = 0; start < facts.length; start += INSERT_BATCH) {
    const current = facts.slice(start, start + INSERT_BATCH);
    const params: unknown[] = [];
    const values = current.map((fact, offset) => {
      const vector = vectors[start + offset];
      if (!vector || vector.length !== 512 || !vector.every(Number.isFinite)) {
        throw new Error(`qbank_generation_invalid_document_embedding:${fact.refId}`);
      }
      if (projection) {
        if (fact.taxonomyVersion == null || fact.servingScopeId == null) {
          throw new Error(`qbank_generation_projection_scope_missing:${fact.refId}`);
        }
        const p = offset * 6;
        params.push(generationId, fact.refId, fact.taxonomyVersion, fact.servingScopeId, fact.contentHash, `[${vector.join(',')}]`);
        return `($${p + 1},$${p + 2},$${p + 3},$${p + 4},$${p + 5},$${p + 6}::vector)`;
      }
      const p = offset * 4;
      params.push(generationId, fact.refId, fact.contentHash, `[${vector.join(',')}]`);
      return `($${p + 1},$${p + 2},$${p + 3},$${p + 4}::vector)`;
    }).join(',');
    await asQbankControlExecutor(pool, (c) => c.query(
      projection
        ? `INSERT INTO qbank_generation_chunk(generation_id,ref_id,taxonomy_version,serving_scope_id,content_hash,embedding) VALUES ${values}
           ON CONFLICT (generation_id,ref_id,taxonomy_version,serving_scope_id) DO NOTHING`
        : `INSERT INTO qbank_generation_chunk(generation_id,ref_id,content_hash,embedding) VALUES ${values}
           ON CONFLICT (generation_id,ref_id) DO NOTHING`,
      params,
    ));
  }
}

/**
 * Builds only when the immutable recipe **and** approved-source snapshot are
 * unchanged.  Reusing by recipe alone is unsafe: an approved add/recovery
 * advances qbank_corpus_epoch, but the old generation has no vector for the
 * new source.  A builder may run at boot or under an explicitly authorised
 * rebuild job; activation still validates the snapshot epoch in PostgreSQL.
 */
export async function ensureActiveQbankGeneration(pool: DbPool, embedder: Embedder): Promise<QbankGenerationResult | undefined> {
  if (!await generationSchemaPresent(pool)) return undefined;
  const recipe = qbankEmbeddingRecipe(embedder);
  await persistRecipe(pool, recipe);
  const [active, corpusEpoch] = await Promise.all([activeRecipe(pool), currentCorpusEpoch(pool)]);
  if (active?.recipeId === recipe.id && active.sourceEpoch === corpusEpoch) {
    return { status: 'reused', recipe, generationId: active.generationId, chunkCount: 0 };
  }

  const unknownLegacy = await unrebuildableLegacyRefs(pool);
  if (unknownLegacy.length) {
    return { status: 'blocked_unrebuildable_legacy', recipe, chunkCount: 0, unrebuildableLegacyRefs: unknownLegacy };
  }
  const projection = await projectionSchemaPresent(pool);
  const snapshot = await snapshotFacts(pool, projection);
  const generationId = 'qgen-' + randomUUID();
  await asQbankControlExecutor(pool, async (c) => {
    await c.query(
      `INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state)
       VALUES ($1,$2,$3::bigint,$4,'building')`, [generationId, recipe.id, snapshot.epoch, snapshot.facts.length],
    );
    await c.query('SELECT qbank_prepare_generation_partition($1)', [generationId]);
  });
  try {
    // Network I/O deliberately occurs outside DB transactions/leases. The generation is invisible until activation.
    // A shared cut repeats its content once per reviewed leaf, so the embedding
    // list length equals the projection count, not the distinct-ref count.
    const vectors = await embedder.embed(snapshot.facts.map((f) => f.content));
    if (vectors.length !== snapshot.facts.length) throw new Error('qbank_generation_embedding_count_mismatch');
    await insertGenerationRows(pool, generationId, snapshot.facts, vectors, projection);
    await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_validate_generation($1)', [generationId]));
    await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_activate_generation($1)', [generationId]));
    return { status: 'activated', recipe, generationId, chunkCount: snapshot.facts.length };
  } catch (error) {
    await asQbankControlExecutor(pool, (c) => c.query('SELECT qbank_mark_generation_failed($1,$2)', [generationId, error instanceof Error ? error.message : 'build_failed']))
      .catch(() => undefined);
    throw error;
  }
}
