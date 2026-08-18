/**
 * Generation-aware qbank retrieval.
 *
 * `vector_chunk` remains the compatibility store for private memory and pre-0029 test fixtures. Once the
 * generation schema exists, qbank reads must name the immutable recipe that produced the query embedding. A
 * mismatch is an error, not an invitation to compare unrelated vectors. The worker catches that error and
 * chooses the existing CRAG safe fallback; it must never silently query the previous vector space.
 */
import type { PoolClient as Client } from 'pg';

const vec = (e: number[]) => `[${e.join(',')}]`;
const RRF_K = 60;
const MAX_K = 50;
const MAX_CANDIDATES = 200;

export interface QbankActiveGeneration {
  generationId: string;
  recipeId: string;
}

export interface QbankHybridHit {
  refId: string;
  /** Real cosine distance. RRF only chooses order; it is deliberately not misrepresented as confidence. */
  distance: number;
  channels: ('dense' | 'lexical')[];
}

/** Retrieval is a release-controlled policy, not an assumed synonym for “more channels is better”. */
export type QbankRetrievalMode = 'dense' | 'rrf';

/**
 * Track-local serving scope (RAG-FUNNEL-04).  `servingScopeId` is the same
 * string as the planner's `leafTrackId`; `taxonomyVersion` is the frozen v1
 * taxonomy.  When supplied, the bounded retrieval SQL functions hard-filter on
 * the generation projection's own `taxonomy_version`/`serving_scope_id` BEFORE
 * ORDER BY/LIMIT.  Both must be present (fail-closed: a half-scoped request
 * yields zero rows, never a silent "all tracks" degradation).
 */
export interface QbankServingScopeInput {
  taxonomyVersion: string;
  servingScopeId: string;
}

const SERVING_SCOPE_RE = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;
const TAXONOMY_VERSION_RE = /^v[1-9][0-9]{0,15}$/;

function validateServingScope(scope: QbankServingScopeInput): void {
  if (!scope || typeof scope !== 'object'
    || typeof scope.taxonomyVersion !== 'string' || !TAXONOMY_VERSION_RE.test(scope.taxonomyVersion)
    || typeof scope.servingScopeId !== 'string' || !SERVING_SCOPE_RE.test(scope.servingScopeId)) {
    throw new Error('qbank_retrieval_invalid_serving_scope');
  }
}

/**
 * Set the session GUCs that the SECURITY DEFINER retrieval functions read.  The
 * `true` = SET LOCAL, scoped to the caller's transaction, so it cannot leak
 * across pooled connections.  Unset (no scope) keeps the legacy no-filter path.
 */
async function setServingScope(c: Client, scope?: QbankServingScopeInput): Promise<void> {
  if (scope === undefined) return;
  validateServingScope(scope);
  await c.query("SELECT set_config('app.qbank_serving_scope', $1, true)", [scope.servingScopeId]);
  await c.query("SELECT set_config('app.qbank_taxonomy_version', $1, true)", [scope.taxonomyVersion]);
}

export interface QbankEvidenceExcerpt {
  refId: string;
  excerpt: string;
}

export interface QbankQuestionEvidencePart {
  refId: string;
  role: 'prompt' | 'rubric' | 'follow_up' | 'example' | 'anti_pattern' | 'source_note';
  ordinal: number;
  required: boolean;
  excerpt: string;
}

/** A question is a business artifact assembled from multiple immutable RAG chunks, never one title/vector. */
export interface QbankQuestionEvidence {
  questionId: string;
  /** Rank of the first retrieved member chunk. This is ordering evidence, not a semantic confidence score. */
  hitRank: number;
  evidence: QbankQuestionEvidencePart[];
}

/** The only shape that may cross from qbank retrieval into an interview graph. */
export interface QbankQuestionRetrievalResult {
  /** Immutable business-artifact identifier, never the matched chunk identifier. */
  ref: string;
  /** Cosine-derived ranking signal only; CRAG calibrates policy separately. */
  score: number;
  /** Complete, role-labelled evidence package assembled after a second visibility check. */
  evidence: string;
}

function validEmbedding(embedding: number[]): void {
  if (!Array.isArray(embedding) || embedding.length !== 512 || !embedding.every(Number.isFinite)) {
    throw new Error('qbank_generation_invalid_query_embedding');
  }
}

function validK(k: number): void {
  if (!Number.isInteger(k) || k < 1 || k > MAX_K) throw new Error('qbank_generation_invalid_k');
}

function retrievalMode(mode: QbankRetrievalMode | undefined): QbankRetrievalMode {
  if (mode === undefined || mode === 'dense' || mode === 'rrf') return mode ?? 'dense';
  throw new Error('qbank_generation_invalid_retrieval_mode');
}

/** Fail-closed：在缺少 generation 元数据函数的 legacy/pre-generation 库上抛 `qbank_active_generation_metadata_missing`，永不返回 `undefined`——legacy `vector_chunk` 调用方必须直接用 `annSearchLegacy`（见 retrieval-store.ts）。 */
export async function activeQbankGeneration(c: Client): Promise<QbankActiveGeneration> {
  const present = (await c.query("SELECT to_regprocedure('qbank_active_generation_metadata()') IS NOT NULL AS ok")).rows[0]?.ok === true;
  if (!present) throw new Error('qbank_active_generation_metadata_missing');
  const r = await c.query('SELECT generation_id, recipe_id FROM qbank_active_generation_metadata()');
  if (r.rowCount !== 1) throw new Error('qbank_active_generation_missing');
  return { generationId: String(r.rows[0].generation_id), recipeId: String(r.rows[0].recipe_id) };
}

export async function requireActiveQbankGeneration(c: Client, expectedRecipeId: string): Promise<QbankActiveGeneration> {
  if (!expectedRecipeId || expectedRecipeId.length > 128) throw new Error('qbank_generation_invalid_recipe');
  const active = await activeQbankGeneration(c);
  if (!active) throw new Error('qbank_generation_schema_missing');
  if (active.recipeId !== expectedRecipeId) {
    throw new Error(`qbank_generation_recipe_mismatch:active=${active.recipeId}:query=${expectedRecipeId}`);
  }
  return active;
}

/** Fetches only currently visible, approved excerpts for already-selected refs. This is deliberately a second
 * authorization/visibility check after cache/RRF so a revoke racing prompt construction returns no stale text. */
export async function qbankEvidenceForRefs(
  c: Client, expectedRecipeId: string, refs: string[], maxCharsPerRef = 600,
  scope?: QbankServingScopeInput,
): Promise<QbankEvidenceExcerpt[]> {
  if (!Array.isArray(refs) || refs.length > MAX_K || refs.some((ref) => !/^[A-Za-z0-9:_-]{1,160}$/.test(ref))) {
    throw new Error('qbank_generation_invalid_evidence_refs');
  }
  if (!Number.isInteger(maxCharsPerRef) || maxCharsPerRef < 1 || maxCharsPerRef > 1200) {
    throw new Error('qbank_generation_invalid_evidence_size');
  }
  await setServingScope(c, scope);
  const active = await requireActiveQbankGeneration(c, expectedRecipeId);
  if (!refs.length) return [];
  const r = await c.query('SELECT ref_id, excerpt FROM qbank_generation_evidence($1,$2::text[],$3)', [active.generationId, refs, maxCharsPerRef]);
  return r.rows.map((row) => ({ refId: String(row.ref_id), excerpt: String(row.excerpt) }));
}

/**
 * Expands rank-ordered chunk hits into complete published question artifacts.  It deliberately has no legacy
 * fallback: returning a single old chunk as an interview question would reintroduce the very one-question/one-vector
 * defect this API prevents. The SECURITY DEFINER SQL function rechecks active-generation/source visibility.
 */
export async function qbankQuestionEvidenceForRefs(
  c: Client, expectedRecipeId: string, refs: string[], maxCharsPerPart = 500,
  scope?: QbankServingScopeInput,
): Promise<QbankQuestionEvidence[]> {
  if (!Array.isArray(refs) || refs.length > MAX_K || refs.some((ref) => !/^[A-Za-z0-9:_-]{1,160}$/.test(ref))) {
    throw new Error('qbank_generation_invalid_question_evidence_refs');
  }
  if (!Number.isInteger(maxCharsPerPart) || maxCharsPerPart < 1 || maxCharsPerPart > 800) {
    throw new Error('qbank_generation_invalid_question_evidence_size');
  }
  await setServingScope(c, scope);
  const active = await requireActiveQbankGeneration(c, expectedRecipeId);
  if (!refs.length) return [];
  const present = (await c.query("SELECT to_regclass('qbank_question') IS NOT NULL AS ok")).rows[0]?.ok === true;
  if (!present) return [];
  const r = await c.query(
    'SELECT question_id, hit_rank, evidence FROM qbank_generation_question_evidence($1,$2::text[],$3)',
    [active.generationId, refs, maxCharsPerPart],
  );
  return r.rows.map((row) => {
    const evidence = Array.isArray(row.evidence) ? row.evidence : [];
    return {
      questionId: String(row.question_id),
      hitRank: Number(row.hit_rank),
      evidence: evidence.map((part: Record<string, unknown>) => ({
        refId: String(part.refId),
        role: String(part.role) as QbankQuestionEvidencePart['role'],
        ordinal: Number(part.ordinal),
        required: part.required === true,
        excerpt: String(part.excerpt),
      })),
    };
  });
}

/**
 * Converts raw generation hits into the graph-safe question-artifact shape.
 * Keep this next to the second visibility check so worker code and proof code
 * cannot accidentally disagree about whether a standalone chunk is usable as
 * a question.  If no complete artifact survives, the safe result is empty.
 */
export async function qbankQuestionResultsForHits(
  c: Client, expectedRecipeId: string, hits: readonly Pick<QbankHybridHit, 'refId' | 'distance'>[], maxCharsPerPart = 420,
  scope?: QbankServingScopeInput,
): Promise<QbankQuestionRetrievalResult[]> {
  if (!Array.isArray(hits) || hits.length > MAX_K || hits.some((hit) =>
    !hit || !/^[A-Za-z0-9:_-]{1,160}$/.test(hit.refId) || !Number.isFinite(hit.distance))) {
    throw new Error('qbank_generation_invalid_question_hits');
  }
  const questions = await qbankQuestionEvidenceForRefs(c, expectedRecipeId, hits.map((hit) => hit.refId), maxCharsPerPart, scope);
  return questions.slice(0, 5).map((question) => {
    const hit = hits[Math.max(0, question.hitRank - 1)];
    return {
      ref: question.questionId,
      score: hit ? Math.max(0, 1 - hit.distance) : 0,
      evidence: question.evidence.map((part) => `[${part.role}] ${part.excerpt}`).join('\n'),
    };
  });
}

/**
 * RRF is ranking-only. The returned `distance` remains a cosine distance that downstream CRAG can calibrate;
 * rank score never becomes a fake semantic confidence. Candidate scores may cross channels, but the user sees
 * only opaque, approved ref IDs.
 */
export async function hybridQbankSearch(
  c: Client,
  input: { query: string; embedding: number[]; k: number; expectedRecipeId?: string; candidateK?: number; retrievalMode?: QbankRetrievalMode; scope?: QbankServingScopeInput },
): Promise<QbankHybridHit[]> {
  validEmbedding(input.embedding); validK(input.k);
  const mode = retrievalMode(input.retrievalMode);
  await setServingScope(c, input.scope);
  const active = await activeQbankGeneration(c);
  if (!active) {
    // Kept only for pre-0029 proof fixtures. Production migration presence makes a missing active pointer fail closed.
    const { annSearchLegacy } = await import('./retrieval-legacy.ts');
    return (await annSearchLegacy(c, 'qbank', input.embedding, input.k)).map((x) => ({ ...x, channels: ['dense'] }));
  }
  if (!input.expectedRecipeId || active.recipeId !== input.expectedRecipeId) {
    throw new Error(`qbank_generation_recipe_mismatch:active=${active.recipeId}:query=${input.expectedRecipeId ?? 'missing'}`);
  }
  // Dense needs only `k` rows; RRF keeps its deliberately wider independent candidate pools before fusion.
  // The default is release-controlled from measured holdouts, not an assumption that extra channels always help.
  const n = mode === 'rrf' ? Math.min(MAX_CANDIDATES, Math.max(input.k * 8, input.candidateK ?? 40)) : input.k;
  const denseRows = await c.query('SELECT ref_id, distance FROM qbank_generation_ann_search($1,$2::vector,$3)', [active.generationId, vec(input.embedding), n]);
  if (mode === 'dense') {
    return denseRows.rows.map((row) => ({ refId: String(row.ref_id), distance: Number(row.distance), channels: ['dense'] as ('dense' | 'lexical')[] }));
  }
  const lexicalRows = await c.query('SELECT ref_id, lexical_score FROM qbank_generation_lexical_search($1,$2,$3)', [active.generationId, input.query, n]);
  const rank = new Map<string, { score: number; channels: Set<'dense' | 'lexical'> }>();
  const add = (refId: string, position: number, channel: 'dense' | 'lexical') => {
    const x = rank.get(refId) ?? { score: 0, channels: new Set<'dense' | 'lexical'>() };
    x.score += 1 / (RRF_K + position + 1);
    x.channels.add(channel); rank.set(refId, x);
  };
  denseRows.rows.forEach((r, i) => add(String(r.ref_id), i, 'dense'));
  lexicalRows.rows.forEach((r, i) => add(String(r.ref_id), i, 'lexical'));
  const fused = [...rank.entries()]
    .sort((a, b) => b[1].score - a[1].score || a[0].localeCompare(b[0]))
    .slice(0, input.k);
  if (!fused.length) return [];
  const ds = await c.query(
    'SELECT ref_id, distance FROM qbank_generation_distances($1,$2::vector,$3::text[])',
    [active.generationId, vec(input.embedding), fused.map(([refId]) => refId)],
  );
  const distance = new Map(ds.rows.map((r) => [String(r.ref_id), Number(r.distance)]));
  // A candidate revoked between the two SQL calls is absent from qbank_generation_distances; never resurrect it.
  return fused.flatMap(([refId, ranking]) => {
    const d = distance.get(refId);
    return Number.isFinite(d) ? [{ refId, distance: d!, channels: [...ranking.channels].sort() }] : [];
  });
}
