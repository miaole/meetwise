/**
 * RAG-FUNNEL-01 handoff closure proof: the §6 sealed-manifest objects that
 * still had the migration login as owner must genuinely fail with 42501 while
 * owned by an arbitrary non-superuser role and stop failing once handed off to
 * the fixed `qbank_control_definer` NOLOGIN owner.
 *
 * The 42501 before/after is load-bearing, not a happy-path green check: before
 * provision we transfer the §6.1-6.5 functions/views to a fresh
 * NOSUPERUSER/NOBYPASSRLS role, then a real non-superuser serving login must
 * observe insufficient_privilege on the SECURITY DEFINER readers; after
 * provision the same login must observe no 42501.  A missing before/after
 * would leave the definer FORCE-RLS fix unproven (a superuser owner masks it).
 */
import {
  assertIsolatedTestTarget, asQbankControlExecutor, assertQbankControlDefinerOwnership, createPool,
  provisionQbankControlDefiner, provisionQbankControlLogin, provisionRuntimeLogin,
  QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST, QBANK_CONTROL_DEFINER_VIEW_MANIFEST, QBANK_CONTROL_DEFINER_TABLE_MANIFEST, QBANK_CONTROL_DEFINER_ROLE,
} from '../src/index.ts';
import { ingestQuestionBankArtifacts } from '../src/index.ts';

const admin = createPool();
const runtimeRole = `qbank_handoff_runtime_${process.pid}`;
const controlRole = `qbank_handoff_control_${process.pid}`;
const preHandoffOwner = `qbank_pre_handoff_${process.pid}`;
const definerRole = QBANK_CONTROL_DEFINER_ROLE;
const password = 'qbank-handoff-closure-2026';
const proofEmbedder = {
  id: 'qbank-handoff-closure-proof', dim: 512,
  async embed(texts: string[]) { return texts.map(() => new Array<number>(512).fill(0)); },
};
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

/** §6.1-6.5 objects handed off in this proof (13 functions + 2 views). */
const HANDOFF_FUNCTIONS = [
  'qbank_generation_ann_search(text,vector,integer)',
  'qbank_generation_lexical_search(text,text,integer)',
  'qbank_generation_distances(text,vector,text[])',
  'qbank_generation_evidence(text,text[],integer)',
  'qbank_active_generation_metadata()',
  'qbank_active_source_id(text)',
  'qbank_search_terms(text)',
  'qbank_bump_retrieval_cache_epoch()',
  'qbank_lock_retrieval_cache_epoch()',
  'qbank_pool_visible_epoch_sync()',
  'qbank_source_visible_epoch_sync()',
  'qbank_integrity_quarantine_immutable()',
  'qbank_source_guard_update()',
] as const;
const HANDOFF_VIEWS = ['public.qbank_retrieval_candidate', 'public.qbank_visible_ref'] as const;

async function rejectsCode(fn: () => Promise<unknown>, code = '42501'): Promise<boolean> {
  try { await fn(); return false; } catch (error) { return (error as { code?: string }).code === code; }
}

async function rejectsMessage(fn: () => Promise<unknown>, message: string): Promise<boolean> {
  try { await fn(); return false; } catch (error) { return error instanceof Error && error.message === message; }
}

/** A real non-superuser serving principal: enter only app_role, never a control role. */
async function asServingRuntime<T>(pool: ReturnType<typeof createPool>, fn: () => Promise<T>): Promise<T> {
  await pool.query('BEGIN');
  try {
    await pool.query('SET LOCAL ROLE app_role');
    const value = await fn();
    await pool.query('COMMIT');
    return value;
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
}

async function transferOwner(owner: string, functions: readonly string[], views: readonly string[]): Promise<void> {
  for (const signature of functions) await admin.query(`ALTER FUNCTION ${signature} OWNER TO ${owner}`);
  for (const view of views) await admin.query(`ALTER VIEW ${view} OWNER TO ${owner}`);
}

async function main() {
  await assertIsolatedTestTarget(admin);
  A('handoff closure manifest covers §6.1-6.5 (13 functions) + §6.2 (2 views) + review receipt table',
    QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.length === 31
    && QBANK_CONTROL_DEFINER_VIEW_MANIFEST.length === 2
    && QBANK_CONTROL_DEFINER_TABLE_MANIFEST.length === 15
    && QBANK_CONTROL_DEFINER_TABLE_MANIFEST.some((entry) => entry.name === 'public.qbank_metadata_review_receipt')
    && QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST.every((entry) => typeof entry.requiredSearchPath === 'string'));

  const migrationRole = (await admin.query<{ current_user: string }>('SELECT current_user AS current_user')).rows[0]?.current_user ?? '';
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password });
  await provisionQbankControlLogin(admin, { roleName: controlRole, password });
  const serving = createPool({ user: runtimeRole, password, max: 2 });
  const control = createPool({ user: controlRole, password, max: 2 });
  try {
    // The serving login itself is the non-superuser principal under test.
    const servingShape = (await admin.query(
      `SELECT rolsuper, rolbypassrls, pg_has_role($1, 'app_role', 'member') AS app_member,
              pg_has_role($1, 'qbank_control_executor', 'member') AS control_member
         FROM pg_roles WHERE rolname=$1`,
      [runtimeRole],
    )).rows[0];
    A('serving principal is NOSUPERUSER/NOBYPASSRLS and is an app_role member, never a control member',
      servingShape?.rolsuper === false && servingShape?.rolbypassrls === false
      && servingShape?.app_member === true && servingShape?.control_member === false);

    // Generation-mode ingest embeds nothing on the ingest path (the immutable
    // full-corpus builder owns embeddings), so no embedding recipe is needed
    // here; the approved-source governance path itself is what proves the
    // writer-side 42501 through the SECURITY DEFINER pool trigger.
    await admin.query(`CREATE ROLE ${preHandoffOwner} NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);

    // ── BEFORE handoff: the §6 objects are owned by an arbitrary non-superuser
    //    role, so a SECURITY DEFINER reader executing as that role must hit
    //    42501, the request runtime must not silently read, and the startup
    //    gate must reject the split-owner shape.
    await transferOwner(preHandoffOwner, HANDOFF_FUNCTIONS, HANDOFF_VIEWS);

    let before42501Excerpt: { code?: string; message?: string; routine?: string } | null = null;
    const beforeLockEpochDenied = await rejectsCode(async () => {
      try {
        await asServingRuntime(serving, () => serving.query('SELECT qbank_lock_retrieval_cache_epoch()'));
      } catch (error) {
        const databaseError = error as { code?: string; message?: string; routine?: string };
        before42501Excerpt = { code: databaseError.code, message: databaseError.message, routine: databaseError.routine };
        throw error;
      }
    });
    console.log('qbank_handoff_before_42501_excerpt', JSON.stringify(before42501Excerpt));
    const beforeActiveMetadataDenied = await rejectsCode(() => asServingRuntime(serving, () => serving.query('SELECT * FROM qbank_active_generation_metadata()')));
    const beforeAnnDenied = await rejectsCode(() => asServingRuntime(serving, () => serving.query(
      "SELECT * FROM qbank_generation_ann_search('qgen-00000000-0000-0000-0000-000000000000', NULL::vector, 1)",
    )));
    const beforeIngestDenied = await rejectsCode(() => ingestQuestionBankArtifacts(control, [{
      id: `question:qbank-handoff-before-${process.pid}`,
      competency: 'handoff before 42501',
      difficulty: 3,
      taxonomyVersion: 'v1',
      servingScopeId: 'backend/general',
      annotationSource: 'curator_reviewed',
      chunks: [
        { refId: `qbank-handoff-before:${process.pid}:prompt`, role: 'prompt', ordinal: 0, required: true, text: 'handoff before 42501 prompt' },
        { refId: `qbank-handoff-before:${process.pid}:rubric`, role: 'rubric', ordinal: 0, required: true, text: 'handoff before 42501 rubric' },
        { refId: `qbank-handoff-before:${process.pid}:anti`, role: 'anti_pattern', ordinal: 0, text: 'handoff before 42501 anti pattern' },
      ],
    }], proofEmbedder));
    const beforeGateRejected = await rejectsMessage(() => assertQbankControlDefinerOwnership(control), 'qbank_control_definer_ownership_invalid');
    A('BEFORE handoff: non-superuser serving principal observes 42501 on every SECURITY DEFINER reader and the writer path',
      beforeLockEpochDenied && beforeActiveMetadataDenied && beforeAnnDenied && beforeIngestDenied);
    A('BEFORE handoff: startup catalog gate rejects the split-owner shape', beforeGateRejected);

    // ── Restore the migration owner, then hand off through the provisioner.
    await transferOwner(migrationRole, HANDOFF_FUNCTIONS, HANDOFF_VIEWS);
    await provisionQbankControlDefiner(admin);
    const afterGateAccepted = await assertQbankControlDefinerOwnership(control).then(() => true, () => false);

    const afterLockEpoch = await asServingRuntime(serving, () => serving.query<{ qbank_lock_retrieval_cache_epoch: string }>('SELECT qbank_lock_retrieval_cache_epoch()'));
    const afterLockEpochOk = afterLockEpoch.rows[0]?.qbank_lock_retrieval_cache_epoch !== undefined;
    console.log('qbank_handoff_after_lock_epoch_excerpt', JSON.stringify({ epoch: afterLockEpoch.rows[0]?.qbank_lock_retrieval_cache_epoch, rowCount: afterLockEpoch.rowCount }));
    const afterActiveMetadata = await asServingRuntime(serving, () => serving.query('SELECT * FROM qbank_active_generation_metadata()')).then(() => true, () => false);

    let afterIngestOk = false;
    let ingestedRefId = '';
    let ingestedSourceId = '';
    try {
      const ingest = await ingestQuestionBankArtifacts(control, [{
        id: `question:qbank-handoff-after-${process.pid}`,
        competency: 'handoff after no-42501',
        difficulty: 3,
        taxonomyVersion: 'v1',
        servingScopeId: 'backend/general',
        annotationSource: 'curator_reviewed',
        chunks: [
          { refId: `qbank-handoff-after:${process.pid}:prompt`, role: 'prompt', ordinal: 0, required: true, text: 'handoff after no-42501 prompt' },
          { refId: `qbank-handoff-after:${process.pid}:rubric`, role: 'rubric', ordinal: 0, required: true, text: 'handoff after no-42501 rubric' },
          { refId: `qbank-handoff-after:${process.pid}:anti`, role: 'anti_pattern', ordinal: 0, text: 'handoff after no-42501 anti pattern' },
        ],
      }], proofEmbedder);
      afterIngestOk = ingest.questionCount === 1 && ingest.chunkCount === 3;
      ingestedRefId = `qbank-handoff-after:${process.pid}:prompt`;
      const chunk = await asQbankControlExecutor(control, (c) => c.query<{ source_id: string }>(
        'SELECT source_id FROM qbank_chunk WHERE ref_id=$1', [ingestedRefId],
      ));
      ingestedSourceId = chunk.rows[0]?.source_id ?? '';
    } catch (error) {
      console.error('qbank_handoff_after_ingest_error', JSON.stringify({
        message: (error as Error).message,
        code: (error as { code?: string }).code,
      }));
    }
    A('AFTER handoff: startup catalog gate accepts the single isolated owner', afterGateAccepted);
    A('AFTER handoff: the same non-superuser serving principal observes no 42501 and the writer path completes',
      afterLockEpochOk && afterActiveMetadata && afterIngestOk);

    // Bounded readers must be callable after handoff (any non-42501 outcome is
    // the ACL proof: missing generation/null vector is a business error, not a
    // privilege hole).  Raw relation/view SELECT stays 0 except the three
    // intentional request-side surfaces.
    const not42501 = async (fn: () => Promise<unknown>): Promise<boolean> => {
      try { await fn(); return true; } catch (error) { return (error as { code?: string }).code !== '42501'; }
    };
    const afterAnn = await not42501(() => asServingRuntime(serving, () => serving.query(
      "SELECT * FROM qbank_generation_ann_search('qgen-00000000-0000-0000-0000-000000000000', NULL::vector, 1)",
    )));
    const afterLexical = await not42501(() => asServingRuntime(serving, () => serving.query(
      "SELECT * FROM qbank_generation_lexical_search('qgen-00000000-0000-0000-0000-000000000000', 'handoff', 1)",
    )));
    const afterDistances = await not42501(() => asServingRuntime(serving, () => serving.query(
      "SELECT * FROM qbank_generation_distances('qgen-00000000-0000-0000-0000-000000000000', NULL::vector, ARRAY[]::text[])",
    )));
    const afterEvidence = await not42501(() => asServingRuntime(serving, () => serving.query(
      "SELECT * FROM qbank_generation_evidence('qgen-00000000-0000-0000-0000-000000000000', ARRAY[]::text[], 40)",
    )));
    const afterQuestionEvidence = await not42501(() => asServingRuntime(serving, () => serving.query(
      "SELECT * FROM qbank_generation_question_evidence('qgen-00000000-0000-0000-0000-000000000000', ARRAY[]::text[], 40)",
    )));
    A('AFTER handoff: dense reader is not 42501', afterAnn);
    A('AFTER handoff: lexical reader is not 42501', afterLexical);
    A('AFTER handoff: distance reader is not 42501', afterDistances);
    A('AFTER handoff: evidence reader is not 42501', afterEvidence);
    A('AFTER handoff: question-evidence reader is not 42501', afterQuestionEvidence);

    const rawReadDenied: string[] = [];
    for (const table of QBANK_CONTROL_DEFINER_TABLE_MANIFEST) {
      if (table.appRolePrivileges.includes('SELECT')) continue;
      const denied = await rejectsCode(() => asServingRuntime(serving, () => serving.query(`SELECT * FROM ${table.name} LIMIT 1`)));
      if (!denied) rawReadDenied.push(table.name);
    }
    for (const view of QBANK_CONTROL_DEFINER_VIEW_MANIFEST) {
      if (view.appRolePrivileges.includes('SELECT')) continue;
      const denied = await rejectsCode(() => asServingRuntime(serving, () => serving.query(`SELECT * FROM ${view.name} LIMIT 1`)));
      if (!denied) rawReadDenied.push(view.name);
    }
    const curatorReadable = await asServingRuntime(serving, () => serving.query('SELECT 1 FROM qbank_curator LIMIT 1')).then(() => true, () => false);
    const epochReadable = await asServingRuntime(serving, () => serving.query('SELECT 1 FROM qbank_cache_epoch LIMIT 1')).then(() => true, () => false);
    const visibleRefReadable = await asServingRuntime(serving, () => serving.query('SELECT 1 FROM qbank_visible_ref LIMIT 1')).then(() => true, () => false);
    A('AFTER handoff: app raw relation/view read=0 except qbank_curator / qbank_cache_epoch / qbank_visible_ref',
      rawReadDenied.length === 0 && curatorReadable && epochReadable && visibleRefReadable);

    // ── MetadataReviewReceipt domain object: append-only, hash-verified,
    //    explicit status enum (recorded/voided), FORCE RLS, executor-only.
    const validReceiptId = `receipt:handoff:${process.pid}:approved`;
    const receiptInserted = await asQbankControlExecutor(control, async (c) => {
      const inserted = await c.query(
        `INSERT INTO qbank_metadata_review_receipt(
           receipt_id,ref_id,source_id,taxonomy_version,serving_scope_id,annotation_source,
           metadata_hash,review_result,status,reviewer
         ) VALUES (
           $1,$2,$3,'v1','backend/general','curator_reviewed',
           qbank_metadata_hash('qbank-chunk-scope:v1','v1','backend/general','curator_reviewed'),
           'approved','recorded','proof-reviewer'
         )`,
        [validReceiptId, ingestedRefId, ingestedSourceId],
      );
      const row = await c.query<{ status: string; review_result: string; metadata_hash: string }>(
        'SELECT status, review_result, metadata_hash FROM qbank_metadata_review_receipt WHERE receipt_id=$1', [validReceiptId],
      );
      return inserted.rowCount === 1 && row.rows[0]?.status === 'recorded' && row.rows[0]?.review_result === 'approved';
    });
    const invalidStatusRejected = await rejectsCode(() => asQbankControlExecutor(control, (c) => c.query(
      `INSERT INTO qbank_metadata_review_receipt(
         receipt_id,ref_id,source_id,taxonomy_version,serving_scope_id,annotation_source,
         metadata_hash,review_result,status,reviewer
       ) VALUES (
         $1,$2,$3,'v1','backend/general','curator_reviewed',
         qbank_metadata_hash('qbank-chunk-scope:v1','v1','backend/general','curator_reviewed'),
         'approved','bogus','proof-reviewer'
       )`,
      [`receipt:handoff:${process.pid}:bad-status`, ingestedRefId, ingestedSourceId],
    )), '23514');
    const invalidHashRejected = await rejectsCode(() => asQbankControlExecutor(control, (c) => c.query(
      `INSERT INTO qbank_metadata_review_receipt(
         receipt_id,ref_id,source_id,taxonomy_version,serving_scope_id,annotation_source,
         metadata_hash,review_result,status,reviewer
       ) VALUES (
         $1,$2,$3,'v1','backend/general','curator_reviewed',repeat('a',64),'approved','recorded','proof-reviewer'
       )`,
      [`receipt:handoff:${process.pid}:bad-hash`, ingestedRefId, ingestedSourceId],
    )), '23514');
    const servingSelectDenied = await rejectsCode(() => asServingRuntime(serving, () => serving.query('SELECT * FROM qbank_metadata_review_receipt LIMIT 1')));
    const servingInsertDenied = await rejectsCode(() => asServingRuntime(serving, () => serving.query(
      `INSERT INTO qbank_metadata_review_receipt(receipt_id,ref_id,source_id,taxonomy_version,serving_scope_id,annotation_source,metadata_hash,review_result,status,reviewer)
       VALUES ('receipt:forged','${ingestedRefId}','${ingestedSourceId}','v1','backend/general','curator_reviewed',repeat('a',64),'approved','recorded','forged')`,
    )));
    A('MetadataReviewReceipt: executor writes/reads a hash-verified reviewed receipt; request runtime is fully denied',
      receiptInserted && invalidStatusRejected && invalidHashRejected && servingSelectDenied && servingInsertDenied);

    // The definer must hold the explicit vector_chunk read grant that lane (b)
    // of qbank_visible_ref relies on; otherwise the visible-ref union silently
    // drops system-owned chunks and the gate must reject it.
    const definerVectorChunkGrant = (await admin.query<{ allowed: boolean }>(
      "SELECT has_table_privilege($1,'public.vector_chunk','SELECT') AS allowed", [definerRole],
    )).rows[0]?.allowed === true;
    A('definer holds the explicit vector_chunk SELECT grant for qbank_visible_ref lane (b)', definerVectorChunkGrant);

    // ── HIGH-1 adversarial: post-handoff lane (b) revocation isolation.
    // Once provision makes the definer NOSUPERUSER/NOBYPASSRLS, FORCE RLS
    // applies to the view owner itself, so lane (b)'s NOT EXISTS can only see
    // the *revoked* pool row through the shared-owner coupling:
    // qbank_visible_ref and qbank_retrieval_candidate are the same role, and
    // p_qbank_pool_candidate_view names qbank_retrieval_candidate's owner
    // dynamically (not the visible-ref owner).  If that coupling is ever
    // broken, the revoked chunk silently resurrects through lane (b) with no
    // gate to catch it.  This assertion locks the behavior end-to-end.
    const visibleRefIds = () => asServingRuntime(serving, () => serving.query<{ ref_id: string }>(
      'SELECT ref_id FROM qbank_visible_ref',
    )).then((result) => result.rows.map((row) => row.ref_id));

    const revokeChunkVectorId = `vchunk-revoke-proof-${process.pid}`;
    const revokeContentHash = `h-revoke-proof-${process.pid}`;
    const revokeEmbedding = `[1,${new Array<number>(511).fill(0).join(',')}]`;
    await asQbankControlExecutor(control, (c) => c.query(
      `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
       VALUES ($1, '__system_qbank__', 'qbank', $2, $3, $4::vector)`,
      [revokeChunkVectorId, ingestedRefId, revokeContentHash, revokeEmbedding],
    ));

    const visibleBeforeRevocation = (await visibleRefIds()).includes(ingestedRefId);
    const poolRowPersists = (await admin.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM qbank_pool_entry WHERE ref_id=$1', [ingestedRefId],
    )).rows[0]?.n === 1;
    const vectorRowPersists = (await admin.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM vector_chunk WHERE ref_id=$1 AND kind='qbank' AND owner_user_id='__system_qbank__'",
      [ingestedRefId],
    )).rows[0]?.n === 1;

    const revoked = await asQbankControlExecutor(control, (c) => c.query(
      `UPDATE qbank_source
          SET status='rejected', reviewed_by='revoke-proof',
              review_note='HIGH-1 revocation isolation proof', reviewed_at=now(), version=version+1
        WHERE id=$1 AND status='approved'`,
      [ingestedSourceId],
    )).then((r) => r.rowCount === 1);

    const visibleAfterRevocation = await visibleRefIds();
    const chunkDroppedFromVisibleRef = !visibleAfterRevocation.includes(ingestedRefId);
    console.log('qbank_high1_revocation_diagnosis', JSON.stringify({
      visibleBeforeRevocation, poolRowPersists, vectorRowPersists, revoked, chunkDroppedFromVisibleRef,
    }));

    A('post-handoff: revoking an approved source drops its chunk from qbank_visible_ref (lane (b) does not resurrect it)',
      visibleBeforeRevocation && poolRowPersists && vectorRowPersists && revoked && chunkDroppedFromVisibleRef);

    // Deployable handoff must be re-entrant: a second provision is a no-op
    // success (owner is already the fixed role), never an owner-adopt error,
    // and the startup gate still accepts the closed shape afterward.
    const reprovisioned = await provisionQbankControlDefiner(admin).then(() => true, () => false);
    const afterReprovisionAccepted = reprovisioned
      && await assertQbankControlDefinerOwnership(control).then(() => true, () => false);
    A('provisionQbankControlDefiner is idempotent/re-entrant across a second call', afterReprovisionAccepted);
  } finally {
    await Promise.all([serving.end(), control.end()]);
    await admin.query(`DROP ROLE IF EXISTS ${preHandoffOwner}`).catch(() => undefined);
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await admin.query(`DROP ROLE IF EXISTS ${controlRole}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ qbank handoff closure proof passed' : `\n✗ ${failures} failures`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });
