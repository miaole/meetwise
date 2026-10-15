/**
 * Canonical generation projection (RAG-FUNNEL-02A data plane).
 *
 * A generation chunk is now a per-(ref, serving-scope) projection row.  This
 * module reads those rows back together with their reviewed serving metadata
 * (`qbank_chunk_serving_scope`) and any question artifacts that attach the
 * chunk under the *same* scope, producing the load-bearing shape that
 * RAG-FUNNEL-04 will filter track-locally.  It is metadata-only: it never
 * returns chunk body text — that remains behind the bounded evidence readers
 * so raw content stays inside the controlled corpus.
 *
 * It runs under `asQbankControlExecutor`, which 0066 grants SELECT on
 * `qbank_generation_chunk` and 0086 grants SELECT on
 * `qbank_chunk_serving_scope` / `qbank_question` / `qbank_question_chunk`.
 * No new SECURITY DEFINER function is required, so the sealed
 * `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST` in principal.ts is untouched.
 */
import { asQbankControlExecutor, type DbPool } from '../principal.ts';
import type { QbankAnnotationSource, QbankQuestionChunkRole } from './qbank-ingest.ts';

const SAFE_REF_ID = /^[A-Za-z0-9:_-]{1,160}$/;
const GENERATION_ID = /^qgen-[0-9a-f-]{36}$/;
const TAXONOMY_VERSION = /^v[1-9][0-9]{0,15}$/;
const SERVING_SCOPE = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;
const MAX_REFS = 200;

/** One question artifact that attaches this projected chunk under the same serving scope. */
export interface ProjectedQuestionAttachment {
  questionId: string;
  role: QbankQuestionChunkRole;
  ordinal: number;
  required: boolean;
  questionState: 'draft' | 'published' | 'retired';
  competency: string;
  difficulty: number;
}

/**
 * One frozen projection row: a raw chunk cut into one reviewed serving leaf,
 * its reviewed annotation, and zero-or-more question attachments that share
 * that exact leaf.
 */
export interface GenerationQuestionChunkProjection {
  generationId: string;
  refId: string;
  contentHash: string;
  taxonomyVersion: string;
  servingScopeId: string;
  annotationSource: QbankAnnotationSource;
  metadataHash: string;
  visible: boolean;
  questions: readonly ProjectedQuestionAttachment[];
}

export interface ReadGenerationProjectionInput {
  generationId: string;
  /** Optional track-local filter.  When set, every returned row carries exactly this leaf. */
  servingScopeId?: string;
  taxonomyVersion?: string;
  refIds?: readonly string[];
  /** When true (default), only visible rows are returned. */
  visibleOnly?: boolean;
}

function validateInput(input: ReadGenerationProjectionInput): void {
  if (!GENERATION_ID.test(input.generationId)) throw new Error('qbank_projection_invalid_generation_id');
  if (input.taxonomyVersion != null && !TAXONOMY_VERSION.test(input.taxonomyVersion)) {
    throw new Error('qbank_projection_invalid_taxonomy_version');
  }
  if (input.servingScopeId != null && !SERVING_SCOPE.test(input.servingScopeId)) {
    throw new Error('qbank_projection_invalid_serving_scope');
  }
  if (input.refIds != null
    && (input.refIds.length > MAX_REFS || input.refIds.some((ref) => !SAFE_REF_ID.test(ref)))) {
    throw new Error('qbank_projection_invalid_refs');
  }
}

interface ProjectionRow {
  ref_id: string;
  content_hash: string;
  visible: boolean;
  taxonomy_version: string;
  serving_scope_id: string;
  annotation_source: string | null;
  metadata_hash: string | null;
  question_id: string | null;
  role: string | null;
  ordinal: number | null;
  required: boolean | null;
  question_state: string | null;
  question_taxonomy_version: string | null;
  question_serving_scope_id: string | null;
  competency: string | null;
  difficulty: number | null;
}

const PROJECTION_SQL = `
  SELECT g.ref_id, g.content_hash, g.visible, g.taxonomy_version, g.serving_scope_id,
         cs.annotation_source, cs.metadata_hash,
         qc.question_id, qc.role, qc.ordinal, qc.required,
         q.state AS question_state, q.taxonomy_version AS question_taxonomy_version,
         q.serving_scope_id AS question_serving_scope_id, q.competency, q.difficulty
    FROM qbank_generation_chunk g
    LEFT JOIN qbank_chunk_serving_scope cs
      ON cs.ref_id=g.ref_id
     AND cs.taxonomy_version=g.taxonomy_version
     AND cs.serving_scope_id=g.serving_scope_id
    LEFT JOIN qbank_question_chunk qc
      ON qc.ref_id=g.ref_id
     AND qc.taxonomy_version=g.taxonomy_version
     AND qc.serving_scope_id=g.serving_scope_id
    LEFT JOIN qbank_question q ON q.id=qc.question_id
   WHERE g.generation_id=$1
`;

export async function readGenerationQuestionChunkProjection(
  pool: DbPool,
  input: ReadGenerationProjectionInput,
): Promise<GenerationQuestionChunkProjection[]> {
  validateInput(input);
  const clauses: string[] = [];
  const params: unknown[] = [input.generationId];
  if (input.taxonomyVersion != null) { params.push(input.taxonomyVersion); clauses.push(`g.taxonomy_version=$${params.length}`); }
  if (input.servingScopeId != null) { params.push(input.servingScopeId); clauses.push(`g.serving_scope_id=$${params.length}`); }
  if (input.visibleOnly !== false) clauses.push('g.visible');
  if (input.refIds != null) { params.push([...input.refIds]); clauses.push(`g.ref_id=ANY($${params.length}::text[])`); }
  const where = clauses.length ? ` AND ${clauses.join(' AND ')}` : '';

  return asQbankControlExecutor(pool, async (c) => {
    const result = await c.query<ProjectionRow>(`${PROJECTION_SQL}${where} ORDER BY g.ref_id, g.taxonomy_version, g.serving_scope_id, qc.question_id`, params);
    const byKey = new Map<string, GenerationQuestionChunkProjection>();
    for (const row of result.rows) {
      const key = `${row.ref_id}\u0000${row.taxonomy_version}\u0000${row.serving_scope_id}`;
      let projection = byKey.get(key);
      if (!projection) {
        // Fail closed: a projection row without its reviewed serving metadata is
        // an integrity break, never a silent empty annotation.
        if (row.annotation_source == null || row.metadata_hash == null) {
          throw new Error(`qbank_projection_missing_serving_metadata:${row.ref_id}:${row.taxonomy_version}:${row.serving_scope_id}`);
        }
        projection = {
          generationId: input.generationId,
          refId: String(row.ref_id),
          contentHash: String(row.content_hash),
          taxonomyVersion: String(row.taxonomy_version),
          servingScopeId: String(row.serving_scope_id),
          annotationSource: String(row.annotation_source) as QbankAnnotationSource,
          metadataHash: String(row.metadata_hash),
          visible: row.visible === true,
          questions: [],
        };
        byKey.set(key, projection);
      }
      if (row.question_id == null) continue;
      // A question attachment must share the chunk's reviewed leaf; a mismatch
      // means a chunk was projected under a scope its artifact did not review.
      if (row.question_taxonomy_version !== projection.taxonomyVersion
        || row.question_serving_scope_id !== projection.servingScopeId) {
        throw new Error(`qbank_projection_question_scope_mismatch:${row.ref_id}:${row.question_id}`);
      }
      (projection.questions as ProjectedQuestionAttachment[]).push({
        questionId: String(row.question_id),
        role: String(row.role) as QbankQuestionChunkRole,
        ordinal: Number(row.ordinal),
        required: row.required === true,
        questionState: String(row.question_state) as ProjectedQuestionAttachment['questionState'],
        competency: String(row.competency),
        difficulty: Number(row.difficulty),
      });
    }
    return [...byKey.values()];
  });
}
