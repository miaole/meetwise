/**
 * Historical qbank integrity upgrade proof.
 *
 * A fresh database would never exercise the risk fixed by 0069.  This proof
 * deliberately applies the real 0001..0067 prefix, uses the old control-plane
 * permission to change an active chunk body, then invokes the same versioned
 * migration runner used in production for 0068..0072.  It also proves the
 * 0068 data-plane boundary commits before 0069's audited quarantine scan and
 * that a non-superuser SECURITY DEFINER owner can execute the full
 * building→validated→active control transition. It is destructive only
 * after the isolated-target attestation succeeds.
 */
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, asPrincipal, asQbankControlExecutor, createPool,
  hybridQbankSearch, loadMigrations, qbankEvidenceForRefs,
  qbankQuestionEvidenceForRefs, runMigrations,
} from '@meetwise/db';
import { fakeEmbedder } from '@meetwise/ai-runtime';
import { ingestQbank, ingestQuestionBankArtifacts, type QbankQuestionArtifact } from '../src/qbank-ingest.ts';
import { ensureActiveQbankGeneration, qbankEmbeddingRecipe } from '../src/qbank-generation.ts';

const pool = createPool();
const embedder = fakeEmbedder(512);
const owner = 'qbank-integrity-upgrade-reader';
const METADATA = { taxonomyVersion: 'v1', servingScopeId: 'backend/general', annotationSource: 'curator_reviewed' as const };
const LEGACY_METADATA_FIXTURE = { allowLegacyMetadataFixture: true } as const;
const clean = { refId: 'qlegacy:clean', text: '干净题库正文：比较并交换需要预期版本与原子更新。', ...METADATA };
const generationMismatch = { refId: 'qlegacy:generation-hash', text: '历史 generation 摘要必须与可重建正文事实一致。', ...METADATA };
const scannerFixtures = [
  { refId: 'qlegacy:pool-noncanonical', text: '历史池摘要不是规范 SHA-256 的数据必须隔离。', ...METADATA },
  { refId: 'qlegacy:pool-source-mismatch', text: '历史池与来源摘要不一致的数据必须隔离。', ...METADATA },
  { refId: 'qlegacy:pool-without-chunk', text: '历史池条目缺正文块的数据必须隔离。', ...METADATA },
  { refId: 'qlegacy:chunk-noncanonical', text: '历史正文块摘要不是规范 SHA-256 的数据必须隔离。', ...METADATA },
] as const;
const dirty: QbankQuestionArtifact = {
  id: 'question:qlegacy-dirty', competency: '隔离迁移', difficulty: 3,
  ...METADATA,
  chunks: [
    { refId: 'qlegacy:dirty:prompt', role: 'prompt', ordinal: 0, required: true, text: '原始训练问题：解释版本化迁移如何避免历史数据漂移。' },
    { refId: 'qlegacy:dirty:rubric', role: 'rubric', ordinal: 0, required: true, text: '原始评分锚点：检查 migration ledger、checksum、事务和可见性隔离。' },
    { refId: 'qlegacy:dirty:anti', role: 'anti_pattern', ordinal: 0, text: '常见失分：只补新触发器，却没有隔离历史脏数据。' },
  ],
};
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

async function rejectsCode(fn: () => Promise<unknown>, code: string): Promise<boolean> {
  try { await fn(); return false; } catch (error) { return (error as { code?: string }).code === code; }
}

/**
 * The versioned runner owns its client lifecycle.  This test proxy resets the
 * test-only SET ROLE before returning that client to the shared pool, so a
 * proof of a non-superuser migration account cannot contaminate later runtime
 * assertions through connection reuse.
 */
async function runMigrationsAsRole(role: string, selected: ReturnType<typeof loadMigrations>): Promise<Awaited<ReturnType<typeof runMigrations>>> {
  const client = await pool.connect();
  await client.query(`SET ROLE ${role}`);
  const release = client.release.bind(client);
  let resetRelease: Promise<void> | undefined;
  const scopedClient = new Proxy(client, {
    get(target, property, receiver) {
      if (property === 'release') {
        return () => {
          resetRelease ??= target.query('RESET ROLE').then(() => release());
        };
      }
      const value = Reflect.get(target, property, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  const singleClientPool = { connect: async () => scopedClient };
  try {
    const result = await runMigrations(singleClientPool as unknown as typeof pool, selected);
    await resetRelease;
    return result;
  } catch (error) {
    await resetRelease?.catch(() => undefined);
    throw error;
  }
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);
  process.env.EMBED_MODEL_REVISION = 'qbank-integrity-upgrade-proof-v1';
  const migrationDir = fileURLToPath(new URL('../../../packages/db/migrations/', import.meta.url));
  const migrations = loadMigrations(migrationDir);
  const legacy = migrations.filter((migration) => migration.version <= '0067_qbank_control_plane_read_boundary');
  const hardening = migrations.filter((migration) => migration.version <= '0068_qbank_content_fact_immutability');
  const upgraded = migrations.filter((migration) => migration.version <= '0072_qbank_question_evidence_definer_rls');
  const metadataUpgrade = [
    ...upgraded,
    ...migrations.filter((migration) => migration.version === '0086_qbank_routed_metadata_taxonomy'),
    ...migrations.filter((migration) => migration.version === '0087_qbank_control_definer_corpus_dependency'),
  ];
  A('upgrade fixture has the reviewed 0067 legacy prefix, 0068..0072 low-privilege suffix, and 0086/0087 metadata hardening pair',
    legacy.at(-1)?.version === '0067_qbank_control_plane_read_boundary'
    && hardening.at(-1)?.version === '0068_qbank_content_fact_immutability'
    && upgraded.at(-1)?.version === '0072_qbank_question_evidence_definer_rls'
    && metadataUpgrade.at(-1)?.version === '0087_qbank_control_definer_corpus_dependency');
  if (failures) throw new Error('qbank_integrity_upgrade_migration_manifest_invalid');

  await runMigrations(pool, legacy);
  await ingestQbank(pool, [clean, generationMismatch], embedder, LEGACY_METADATA_FIXTURE);
  const fullDigestLegacy = await asQbankControlExecutor(pool, async (client) => {
    const row = await client.query<{ source_id: string; full_hash: string }>(
      `SELECT ch.source_id, encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex') AS full_hash
         FROM qbank_chunk ch WHERE ch.ref_id=$1`, [clean.refId],
    );
    const sourceId = row.rows[0]?.source_id;
    const fullHash = row.rows[0]?.full_hash;
    if (!sourceId || !fullHash) throw new Error('qbank_integrity_upgrade_full_digest_fixture_missing');
    return { sourceId, fullHash };
  });
  // Historical schema permitted the complete SHA-256 representation.  The
  // modern source trigger makes hashes immutable, so this fixture writes the
  // legacy snapshot through the isolated migration-owner seam before any
  // generation exists; it is not testing a runtime bypass.
  await pool.query('ALTER TABLE qbank_source DISABLE TRIGGER trg_qsrc_update');
  try {
    await pool.query('UPDATE qbank_source SET content_hash=$1 WHERE id=$2', [fullDigestLegacy.fullHash, fullDigestLegacy.sourceId]);
    await pool.query('UPDATE qbank_pool_entry SET content_hash=$1 WHERE ref_id=$2', [fullDigestLegacy.fullHash, clean.refId]);
    await pool.query('UPDATE qbank_chunk SET content_hash=$1 WHERE ref_id=$2', [fullDigestLegacy.fullHash, clean.refId]);
  } finally {
    await pool.query('ALTER TABLE qbank_source ENABLE TRIGGER trg_qsrc_update');
  }
  await ingestQuestionBankArtifacts(pool, [dirty], embedder, LEGACY_METADATA_FIXTURE);
  const g1 = await ensureActiveQbankGeneration(pool, embedder);
  if (!g1?.generationId) throw new Error('qbank_integrity_upgrade_generation_missing');
  const [queryEmbedding] = await embedder.embed(['历史正文漂移']);
  if (!queryEmbedding) throw new Error('qbank_integrity_upgrade_embedding_missing');
  const beforeEvidence = await asPrincipal(pool, owner, (client) =>
    qbankEvidenceForRefs(client, g1.recipe.id, [dirty.chunks[0]!.refId], 600));
  const beforeQuestion = await asPrincipal(pool, owner, (client) =>
    qbankQuestionEvidenceForRefs(client, g1.recipe.id, [dirty.chunks[0]!.refId], 600));
  A('0067 baseline exposes a complete clean artifact before the simulated old vulnerability',
    beforeEvidence.length === 1 && beforeEvidence[0]?.excerpt.includes('原始训练问题') === true
    && beforeQuestion.length === 1 && beforeQuestion[0]?.evidence.length === 3);
  A('the historical schema may contain an exact full SHA-256 chain without treating it as corrupt',
    fullDigestLegacy.fullHash.length === 64);

  const dirtyFact = await asQbankControlExecutor(pool, async (client) => {
    const row = await client.query<{ source_id: string }>(
      'SELECT source_id FROM qbank_chunk WHERE ref_id=$1', [dirty.chunks[0]!.refId],
    );
    // This is exactly the old hole: 0067 still grants the control executor
    // UPDATE, while its qbank_chunk trigger only guarded INSERT.
    await client.query(
      "UPDATE qbank_chunk SET content='旧版 UPDATE 漏洞植入的错误题面，向量仍对应原文。' WHERE ref_id=$1",
      [dirty.chunks[0]!.refId],
    );
    return row.rows[0];
  });
  // These four chains cover every legacy scanner branch which can be formed
  // before 0068's append-only trigger exists.  Each uses an independently
  // ingested source so quarantine must remain source-scoped rather than
  // treating a reason code as a global kill switch.
  await ingestQbank(pool, [...scannerFixtures], embedder, LEGACY_METADATA_FIXTURE);
  const scannerSourceIds = await asQbankControlExecutor(pool, async (client) => {
    const rows = await client.query<{ ref_id: string; source_id: string }>(
      'SELECT ref_id,source_id FROM qbank_chunk WHERE ref_id = ANY($1::text[])',
      [scannerFixtures.map((fixture) => fixture.refId)],
    );
    return new Map(rows.rows.map((row) => [row.ref_id, row.source_id]));
  });
  await asQbankControlExecutor(pool, async (client) => {
    await client.query("UPDATE qbank_pool_entry SET content_hash='not-a-canonical-hash' WHERE ref_id=$1", [scannerFixtures[0]!.refId]);
    await client.query(
      `UPDATE qbank_pool_entry
          SET content_hash=CASE WHEN content_hash=repeat('f', 32) THEN repeat('e', 32) ELSE repeat('f', 32) END
        WHERE ref_id=$1`, [scannerFixtures[1]!.refId],
    );
    await client.query("UPDATE qbank_pool_entry SET ref_id='qlegacy:pool-orphaned-ref' WHERE ref_id=$1", [scannerFixtures[2]!.refId]);
    // The legacy table accepts 32..128 lower-case hex characters, while the
    // migration only recognizes the audited 32/64-byte encodings.  A 33-digit
    // value therefore models a real legacy schema-valid but noncanonical row.
    await client.query("UPDATE qbank_chunk SET content_hash=repeat('a',33) WHERE ref_id=$1", [scannerFixtures[3]!.refId]);

    // `generation_hash_mismatch` is separately reachable from a historical
    // incomplete building generation.  It is a legal 0067 insert, not a test
    // bypass of the generation state trigger.
    const generationId = 'qgen-00000000-0000-4000-8000-000000000069';
    const epoch = await client.query<{ epoch: string }>('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton');
    await client.query(
      `INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state)
       VALUES ($1,$2,$3::bigint,1,'building')`, [generationId, g1.recipe.id, epoch.rows[0]!.epoch],
    );
    await client.query('SELECT qbank_prepare_generation_partition($1)', [generationId]);
    await client.query(
      `INSERT INTO qbank_generation_chunk(generation_id,ref_id,content_hash,embedding)
       VALUES ($1,$2,repeat('f',32),'[0${',0'.repeat(511)}]'::vector)`,
      [generationId, generationMismatch.refId],
    );
  });
  const poisonedBeforeUpgrade = await asPrincipal(pool, owner, (client) =>
    qbankEvidenceForRefs(client, g1.recipe.id, [dirty.chunks[0]!.refId], 600));
  A('0067 upgrade fixture reproduces body/vector drift before the hardening migration',
    typeof dirtyFact?.source_id === 'string'
    && poisonedBeforeUpgrade.length === 1
    && poisonedBeforeUpgrade[0]?.excerpt.includes('旧版 UPDATE 漏洞植入') === true);

  const epochBeforeUpgrade = Number((await pool.query('SELECT epoch FROM qbank_corpus_epoch WHERE singleton')).rows[0]?.epoch);
  const cacheEpochBeforeUpgrade = Number((await pool.query('SELECT epoch FROM qbank_cache_epoch WHERE singleton')).rows[0]?.epoch);
  const migrationRole = 'qbank_upgrade_migration_proof';
  await pool.query(`CREATE ROLE ${migrationRole} NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
  await pool.query(`GRANT ${migrationRole} TO CURRENT_USER`);
  await pool.query(`GRANT USAGE, CREATE ON SCHEMA public TO ${migrationRole}`);
  await pool.query(`GRANT SELECT, INSERT ON schema_migrations TO ${migrationRole}`);
  for (const table of [
    'qbank_curator',
    'qbank_source',
    'qbank_pool_entry',
    'qbank_chunk',
    'qbank_embedding_recipe',
    'qbank_vector_generation',
    'qbank_active_generation',
    'qbank_generation_chunk',
    'qbank_question',
    'qbank_question_chunk',
    'qbank_corpus_epoch',
    'qbank_cache_epoch',
  ])
    await pool.query(`ALTER TABLE ${table} OWNER TO ${migrationRole}`);
  for (const fn of [
    'qbank_pool_requires_approved()',
    'qbank_chunk_requires_approved_pool()',
    'qbank_source_visible_epoch_sync()',
    'qbank_active_generation_metadata()',
    'qbank_search_terms(text)',
    'qbank_generation_ann_search(text,vector,integer)',
    'qbank_generation_lexical_search(text,text,integer)',
    'qbank_generation_distances(text,vector,text[])',
    'qbank_generation_evidence(text,text[],integer)',
    'qbank_generation_question_evidence(text,text[],integer)',
    'qbank_prepare_generation_partition(text)',
    'qbank_validate_generation(text)',
    'qbank_activate_generation(text)',
    'qbank_mark_generation_failed(text,text)',
    'qbank_question_chunk_requires_visible_source()',
    'qbank_question_artifact_guard()',
    'qbank_question_chunk_artifact_guard()',
    'qbank_is_curator()',
    'qbank_generation_chunk_only_building()',
  ])
    await pool.query(`ALTER FUNCTION ${fn} OWNER TO ${migrationRole}`);
  await pool.query(`ALTER VIEW qbank_retrieval_candidate OWNER TO ${migrationRole}`);
  const migrationRoleShape = await pool.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
    'SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=$1', [migrationRole],
  );
  const firstHardening = await runMigrationsAsRole(migrationRole, hardening);
  const [afterHardeningEvidence, afterHardeningQuestion, afterHardeningHits, afterHardeningLexical, afterHardeningFullDigest] = await asPrincipal(pool, owner, async (client) => {
    const evidence = await qbankEvidenceForRefs(client, g1.recipe.id, [dirty.chunks[0]!.refId], 600);
    const question = await qbankQuestionEvidenceForRefs(client, g1.recipe.id, [dirty.chunks[0]!.refId], 600);
    const hits = await hybridQbankSearch(client, {
      query: '历史正文漂移', embedding: queryEmbedding, k: 10, expectedRecipeId: g1.recipe.id,
    });
    const lexical = await client.query<{ ref_id: string }>(
      'SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [g1.generationId, '错误题面', 10],
    );
    const fullDigestEvidence = await qbankEvidenceForRefs(client, g1.recipe.id, [clean.refId], 600);
    return [evidence, question, hits, lexical.rows, fullDigestEvidence] as const;
  });
  A('0068 commits the hash-verified read boundary before the later quarantine migration may start',
    firstHardening.applied.includes('0068_qbank_content_fact_immutability')
    && afterHardeningEvidence.length === 0 && afterHardeningQuestion.length === 0
    && !afterHardeningHits.some((hit) => hit.refId === dirty.chunks[0]!.refId)
    && !afterHardeningLexical.some((row) => row.ref_id === dirty.chunks[0]!.refId)
    && afterHardeningFullDigest.length === 1);

  const firstUpgrade = await runMigrationsAsRole(migrationRole, upgraded);
  const secondUpgrade = await runMigrationsAsRole(migrationRole, upgraded);
  const forceRestored = await pool.query<{
    source_force: boolean; pool_force: boolean; chunk_force: boolean; generation_force: boolean; corpus_force: boolean; cache_force: boolean;
    question_force: boolean; question_chunk_force: boolean;
  }>(
    `SELECT
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_source'::regclass) AS source_force,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_pool_entry'::regclass) AS pool_force,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_chunk'::regclass) AS chunk_force,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_generation_chunk'::regclass) AS generation_force,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_corpus_epoch'::regclass) AS corpus_force,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_cache_epoch'::regclass) AS cache_force,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_question'::regclass) AS question_force,
       (SELECT relforcerowsecurity FROM pg_class WHERE oid='qbank_question_chunk'::regclass) AS question_chunk_force`,
  );
  A('versioned runner applies 0069 quarantine and 0070/0071/0072 low-privilege control RLS exactly once, then replays without a second side effect',
    firstUpgrade.applied.length === 4
    && firstUpgrade.applied.includes('0069_qbank_legacy_integrity_quarantine')
    && firstUpgrade.applied.includes('0070_qbank_low_privilege_control_definer_rls')
    && firstUpgrade.applied.includes('0071_qbank_artifact_control_definer_rls')
    && firstUpgrade.applied.includes('0072_qbank_question_evidence_definer_rls')
    && secondUpgrade.applied.length === 0);
  A('a non-superuser, NOBYPASSRLS migration table owner can apply 0068..0072 and restores FORCE RLS before commit',
    migrationRoleShape.rows[0]?.rolsuper === false
    && migrationRoleShape.rows[0]?.rolbypassrls === false
    && forceRestored.rows[0]?.source_force === true
    && forceRestored.rows[0]?.pool_force === true
    && forceRestored.rows[0]?.chunk_force === true
    && forceRestored.rows[0]?.generation_force === true
    && forceRestored.rows[0]?.corpus_force === true
    && forceRestored.rows[0]?.cache_force === true
    && forceRestored.rows[0]?.question_force === true
    && forceRestored.rows[0]?.question_chunk_force === true);

  const quarantine = await asQbankControlExecutor(pool, (client) => client.query<{
    source_id: string; prior_status: string; reason_codes: string[]; hash_scheme: string;
  }>('SELECT source_id,prior_status,reason_codes,hash_scheme FROM qbank_integrity_quarantine WHERE source_id=$1', [dirtyFact!.source_id]));
  const sourceState = await asQbankControlExecutor(pool, (client) =>
    client.query<{ status: string }>('SELECT status FROM qbank_source WHERE id=$1', [dirtyFact!.source_id]));
  const visibleDirty = Number((await pool.query(
    'SELECT count(*) n FROM qbank_generation_chunk WHERE generation_id=$1 AND ref_id=$2 AND visible',
    [g1.generationId, dirty.chunks[0]!.refId],
  )).rows[0]?.n);
  const sourceReceipt = quarantine.rows[0];
  A('0069 appends one no-body quarantine receipt then terminally rejects the corrupted source',
    quarantine.rowCount === 1 && sourceReceipt?.prior_status === 'approved'
    && sourceReceipt.hash_scheme === 'sha256_utf8_prefix128_v1'
    && sourceReceipt.reason_codes.includes('chunk_body_hash_mismatch')
    && sourceState.rows[0]?.status === 'rejected');
  A('source rejection hides every retained-generation row and advances both epochs exactly once per contaminated source',
    visibleDirty === 0
    && Number((await pool.query('SELECT epoch FROM qbank_corpus_epoch WHERE singleton')).rows[0]?.epoch) === epochBeforeUpgrade + 6
    && Number((await pool.query('SELECT epoch FROM qbank_cache_epoch WHERE singleton')).rows[0]?.epoch) === cacheEpochBeforeUpgrade + 6);

  const allReasons = await asQbankControlExecutor(pool, async (client) => {
    const rows = await client.query<{ reason: string }>(
      `SELECT DISTINCT unnest(reason_codes) AS reason
         FROM qbank_integrity_quarantine
        ORDER BY reason`,
    );
    const statuses = await client.query<{ id: string; status: string }>(
      'SELECT id,status FROM qbank_source WHERE id = ANY($1::text[]) ORDER BY id',
      [[
        dirtyFact!.source_id,
        scannerSourceIds.get(scannerFixtures[0]!.refId),
        scannerSourceIds.get(scannerFixtures[1]!.refId),
        scannerSourceIds.get(scannerFixtures[2]!.refId),
        scannerSourceIds.get(scannerFixtures[3]!.refId),
        (await client.query<{ source_id: string }>('SELECT source_id FROM qbank_chunk WHERE ref_id=$1', [generationMismatch.refId])).rows[0]?.source_id,
      ]],
    );
    return { reasons: rows.rows.map((row) => row.reason), statuses: statuses.rows };
  });
  A('0069 classifies all seven historical corruption shapes and rejects each affected source without retaining text in the ledger',
    [
      'pool_hash_not_canonical',
      'pool_source_hash_mismatch',
      'pool_without_matching_chunk',
      'chunk_without_matching_pool',
      'chunk_hash_not_canonical',
      'chunk_body_hash_mismatch',
      'generation_hash_mismatch',
    ].every((reason) => allReasons.reasons.includes(reason))
    && allReasons.statuses.length === 6
    && allReasons.statuses.every((row) => row.status === 'rejected'));

  const [afterEvidence, afterQuestion, afterHits, afterLexical] = await asPrincipal(pool, owner, async (client) => {
    const evidence = await qbankEvidenceForRefs(client, g1.recipe.id, [dirty.chunks[0]!.refId], 600);
    const question = await qbankQuestionEvidenceForRefs(client, g1.recipe.id, [dirty.chunks[0]!.refId], 600);
    const hits = await hybridQbankSearch(client, {
      query: '历史正文漂移', embedding: queryEmbedding, k: 10, expectedRecipeId: g1.recipe.id,
    });
    const lexical = await client.query<{ ref_id: string }>(
      'SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [g1.generationId, '错误题面', 10],
    );
    return [evidence, question, hits, lexical.rows] as const;
  });
  const cleanEvidence = await asPrincipal(pool, owner, (client) =>
    qbankEvidenceForRefs(client, g1.recipe.id, [clean.refId], 600));
  A('post-upgrade ANN, lexical, evidence and complete-question paths fail closed for the old poisoned ref',
    afterEvidence.length === 0 && afterQuestion.length === 0
    && !afterHits.some((hit) => hit.refId === dirty.chunks[0]!.refId)
    && !afterLexical.some((row) => row.ref_id === dirty.chunks[0]!.refId));
  A('quarantine is source-scoped degradation: an exact historical full-digest clean source remains available byte-for-byte',
    cleanEvidence.length === 1 && cleanEvidence[0]?.excerpt === clean.text);

  const cacheEpochBeforeLowOwnerGeneration = Number((await pool.query(
    'SELECT epoch FROM qbank_cache_epoch WHERE singleton',
  )).rows[0]?.epoch);
  let lowOwnerGeneration: Awaited<ReturnType<typeof ensureActiveQbankGeneration>>;
  try {
    lowOwnerGeneration = await ensureActiveQbankGeneration(pool, embedder);
  } catch (error) {
    const databaseError = error as { code?: unknown; message?: unknown; detail?: unknown; hint?: unknown; where?: unknown; routine?: unknown };
    throw new Error(`qbank_low_privilege_control_execution_failed:${JSON.stringify({
      code: databaseError.code, message: databaseError.message, detail: databaseError.detail,
      hint: databaseError.hint, where: databaseError.where, routine: databaseError.routine,
    })}`);
  }
  const [activeAfterLowOwnerGeneration, controlFunctionOwners] = await asQbankControlExecutor(pool, async (client) => {
    const active = await client.query<{ generation_id: string; state: string }>(
      `SELECT active.generation_id,generation.state
         FROM qbank_active_generation active
         JOIN qbank_vector_generation generation ON generation.id=active.generation_id
        WHERE active.singleton`,
    );
    const owners = await client.query<{
      function_owner: string; rolsuper: boolean; rolbypassrls: boolean; relname: string; relation_owner: string;
    }>(
      `WITH function_owner AS (
         SELECT DISTINCT procedure.proowner
           FROM pg_proc procedure
          WHERE procedure.oid IN (
            'qbank_generation_chunk_only_building()'::regprocedure,
            'qbank_prepare_generation_partition(text)'::regprocedure,
            'qbank_validate_generation(text)'::regprocedure,
            'qbank_activate_generation(text)'::regprocedure,
            'qbank_mark_generation_failed(text,text)'::regprocedure,
            'qbank_question_chunk_requires_visible_source()'::regprocedure,
            'qbank_question_artifact_guard()'::regprocedure,
            'qbank_question_chunk_artifact_guard()'::regprocedure,
            'qbank_is_generation_control_definer()'::regprocedure,
            'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
          )
       )
       SELECT function_role.rolname AS function_owner, function_role.rolsuper, function_role.rolbypassrls,
              relation.relname, relation_role.rolname AS relation_owner
         FROM function_owner owner_id
         JOIN pg_roles function_role ON function_role.oid=owner_id.proowner
         CROSS JOIN pg_class relation
         JOIN pg_roles relation_role ON relation_role.oid=relation.relowner
        WHERE relation.oid IN (
          'qbank_vector_generation'::regclass,
          'qbank_generation_chunk'::regclass,
          'qbank_corpus_epoch'::regclass,
          'qbank_active_generation'::regclass,
          'qbank_cache_epoch'::regclass,
          'qbank_question'::regclass,
          'qbank_question_chunk'::regclass
        )
        ORDER BY relation.relname`,
    );
    return [active.rows[0], owners.rows] as const;
  });
  A('a NOSUPERUSER/NOBYPASSRLS control-function owner can build, validate and atomically activate a new generation',
    lowOwnerGeneration?.status === 'activated'
    && typeof lowOwnerGeneration.generationId === 'string'
    && activeAfterLowOwnerGeneration?.generation_id === lowOwnerGeneration.generationId
    && activeAfterLowOwnerGeneration?.state === 'active'
    && controlFunctionOwners.length === 7
    && controlFunctionOwners.every((row) => row.function_owner === migrationRole
      && row.relation_owner === migrationRole
      && row.rolsuper === false && row.rolbypassrls === false)
    && Number((await pool.query('SELECT epoch FROM qbank_cache_epoch WHERE singleton')).rows[0]?.epoch)
      === cacheEpochBeforeLowOwnerGeneration + 1);

  // This must exercise the worker's real catch-and-mark-failed path, rather
  // than proving only that a caller could manually invoke the terminal SQL
  // function.  A distinct recipe prevents active-generation reuse while the
  // short vector list deterministically fails before any partial row write.
  const countMismatchEmbedder = {
    ...embedder,
    id: 'fake-qbank-embedding-count-mismatch',
    embed: async (inputs: string[]) => (await embedder.embed(inputs)).slice(0, Math.max(0, inputs.length - 1)),
  };
  await ingestQuestionBankArtifacts(pool, [{
    id: 'question:qlegacy-builder-failure', competency: '构建失败收口', difficulty: 2,
    ...METADATA,
    chunks: [
      { refId: 'qlegacy:builder-failure:prompt', role: 'prompt', ordinal: 0, required: true, text: '新批准题面确保失败构建拥有可嵌入的冻结事实。' },
      { refId: 'qlegacy:builder-failure:rubric', role: 'rubric', ordinal: 0, required: true, text: '评分锚点：嵌入数量错配必须失败且不能切换活动世代。' },
      { refId: 'qlegacy:builder-failure:anti', role: 'anti_pattern', ordinal: 0, text: '反例：失败后复用未知调用或翻转旧活动世代。' },
    ],
  }], embedder, LEGACY_METADATA_FIXTURE);
  const artifactLowOwnerGeneration = await ensureActiveQbankGeneration(pool, embedder);
  const artifactQuestionEvidence = await asPrincipal(pool, owner, (client) =>
    qbankQuestionEvidenceForRefs(
      client,
      artifactLowOwnerGeneration!.recipe.id,
      ['qlegacy:builder-failure:prompt'],
      600,
    ));
  A('the isolated low-privilege complete-question reader returns one immutable artifact package after a real rebuild',
    artifactLowOwnerGeneration?.status === 'activated'
    && artifactQuestionEvidence.length === 1
    && artifactQuestionEvidence[0]?.questionId === 'question:qlegacy-builder-failure'
    && artifactQuestionEvidence[0]?.evidence.length === 3);

  const mismatchRecipe = qbankEmbeddingRecipe(countMismatchEmbedder);
  let builderFailure: Error | undefined;
  try {
    await ensureActiveQbankGeneration(pool, countMismatchEmbedder);
  } catch (error) {
    builderFailure = error instanceof Error ? error : new Error('qbank_generation_unknown_builder_failure');
  }
  const catchFailure = await asQbankControlExecutor(pool, (client) => client.query<{
    id: string; state: string; failure_reason: string;
  }>(
    `SELECT id,state,failure_reason
       FROM qbank_vector_generation
      WHERE recipe_id=$1 AND state='failed'
      ORDER BY created_at DESC LIMIT 1`,
    [mismatchRecipe.id],
  ));
  const activeAfterBuilderFailure = await asQbankControlExecutor(pool, (client) => client.query<{ generation_id: string }>(
    'SELECT generation_id FROM qbank_active_generation WHERE singleton',
  ));
  A('the real low-privilege worker builder catch path marks an embedding-count failure failed and never flips active',
    builderFailure?.message === 'qbank_generation_embedding_count_mismatch'
    && catchFailure.rows[0]?.state === 'failed'
    && catchFailure.rows[0]?.failure_reason === 'qbank_generation_embedding_count_mismatch'
    && activeAfterBuilderFailure.rows[0]?.generation_id === artifactLowOwnerGeneration?.generationId);

  const failedLowOwnerGenerationId = 'qgen-00000000-0000-4000-8000-000000000070';
  await asQbankControlExecutor(pool, async (client) => {
    const epoch = await client.query<{ epoch: string }>('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton');
    await client.query(
      `INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state)
       VALUES ($1,$2,$3::bigint,1,'building')`,
      [failedLowOwnerGenerationId, lowOwnerGeneration!.recipe.id, epoch.rows[0]!.epoch],
    );
  });
  const failedLowOwnerValidation = await rejectsCode(() => asQbankControlExecutor(pool, (validationClient) =>
    validationClient.query('SELECT qbank_validate_generation($1)', [failedLowOwnerGenerationId])), '23514');
  const failedLowOwnerState = await asQbankControlExecutor(pool, async (client) => {
    await client.query('SELECT qbank_mark_generation_failed($1,$2)', [failedLowOwnerGenerationId, 'missing_generation_rows']);
    return client.query<{ state: string; failure_reason: string }>(
      'SELECT state,failure_reason FROM qbank_vector_generation WHERE id=$1', [failedLowOwnerGenerationId],
    );
  });
  A('the same low-privilege control owner rejects an incomplete build without activating it, then records a bounded failed terminal state',
    failedLowOwnerValidation
    && failedLowOwnerState.rows[0]?.state === 'failed'
    && failedLowOwnerState.rows[0]?.failure_reason === 'missing_generation_rows'
    && activeAfterLowOwnerGeneration?.generation_id === lowOwnerGeneration?.generationId
    && (await asQbankControlExecutor(pool, (client) => client.query<{ generation_id: string }>(
      'SELECT generation_id FROM qbank_active_generation WHERE singleton',
    ))).rows[0]?.generation_id === artifactLowOwnerGeneration?.generationId);

  const runtimeLedgerDenied = await rejectsCode(() => asPrincipal(pool, owner, (client) =>
    client.query('SELECT source_id FROM qbank_integrity_quarantine')), '42501');
  const ownerMutationDenied = await rejectsCode(() => pool.query(
    "UPDATE qbank_chunk SET content='upgrade 后仍不能原地写' WHERE ref_id=$1", [clean.refId],
  ), '23514');
  A('request runtime cannot read the quarantine ledger, and post-upgrade raw owner mutation stays rejected',
    runtimeLedgerDenied && ownerMutationDenied);

  // Apply the new metadata migration over the deliberately old 0067 fixture.
  // This is the critical upgrade behaviour: it must never manufacture a
  // model-guessed label for a historical question/chunk, while new reviewed
  // artifacts must use the full metadata-only write path immediately.
  const metadataFirstUpgrade = await runMigrationsAsRole(migrationRole, metadataUpgrade);
  const metadataSecondUpgrade = await runMigrationsAsRole(migrationRole, metadataUpgrade);
  const legacyArtifactMetadata = await asQbankControlExecutor(pool, (client) => client.query<{
    metadata_state: string; taxonomy_version: string | null; serving_scope_id: string | null; mapped_scope_rows: string;
  }>(
    `SELECT q.metadata_state,q.taxonomy_version,q.serving_scope_id,
            (SELECT count(*)::text FROM qbank_question_chunk qc
              WHERE qc.question_id=q.id AND qc.taxonomy_version IS NOT NULL) AS mapped_scope_rows
       FROM qbank_question q WHERE q.id=$1`, [dirty.id],
  ));
  const postUpgradeArtifact: QbankQuestionArtifact = {
    id: 'question:qlegacy-post-metadata', competency: '审核 metadata', difficulty: 3, ...METADATA,
    chunks: [
      { refId: 'qlegacy:post-metadata:prompt', role: 'prompt', ordinal: 0, required: true, text: '新题在切块时必须携带 reviewed serving scope。' },
      { refId: 'qlegacy:post-metadata:rubric', role: 'rubric', ordinal: 0, required: true, text: '评分锚点：metadata 版本、leaf、来源与不可变 receipt 必须一致。' },
      { refId: 'qlegacy:post-metadata:anti', role: 'anti_pattern', ordinal: 0, text: '反例：从岗位或 query 反推未标注正文的语言标签。' },
    ],
  };
  const postUpgradeIngest = await ingestQuestionBankArtifacts(pool, [postUpgradeArtifact], embedder);
  const reviewedArtifactMetadata = await asQbankControlExecutor(pool, (client) => client.query<{
    metadata_state: string; taxonomy_version: string; serving_scope_id: string; mapped_scope_rows: string;
  }>(
    `SELECT q.metadata_state,q.taxonomy_version,q.serving_scope_id,
            (SELECT count(*)::text FROM qbank_question_chunk qc
              WHERE qc.question_id=q.id
                AND qc.taxonomy_version=q.taxonomy_version
                AND qc.serving_scope_id=q.serving_scope_id) AS mapped_scope_rows
       FROM qbank_question q WHERE q.id=$1`, [postUpgradeArtifact.id],
  ));
  A('0086/0087 apply once over a live historical prefix: old artifacts stay legacy_unrouted and no chunk receives a guessed scope',
    metadataFirstUpgrade.applied.length === 2
    && metadataFirstUpgrade.applied.includes('0086_qbank_routed_metadata_taxonomy')
    && metadataFirstUpgrade.applied.includes('0087_qbank_control_definer_corpus_dependency')
    && metadataSecondUpgrade.applied.length === 0
    && legacyArtifactMetadata.rows[0]?.metadata_state === 'legacy_unrouted'
    && legacyArtifactMetadata.rows[0]?.taxonomy_version === null
    && legacyArtifactMetadata.rows[0]?.serving_scope_id === null
    && legacyArtifactMetadata.rows[0]?.mapped_scope_rows === '0');
  A('after the upgrade, a new low-privilege controlled artifact persists one reviewed leaf on every cut',
    postUpgradeIngest.questionCount === 1
    && reviewedArtifactMetadata.rows[0]?.metadata_state === 'reviewed'
    && reviewedArtifactMetadata.rows[0]?.taxonomy_version === METADATA.taxonomyVersion
    && reviewedArtifactMetadata.rows[0]?.serving_scope_id === METADATA.servingScopeId
    && reviewedArtifactMetadata.rows[0]?.mapped_scope_rows === String(postUpgradeArtifact.chunks.length));

  const receiptColumns = await pool.query<{ column_name: string }>(
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='qbank_integrity_quarantine'",
  );
  A('quarantine ledger contains reason-coded metadata only and never stores raw qbank body text',
    !receiptColumns.rows.some((row) => /content|body|excerpt|text/i.test(row.column_name)));

  console.log(failures === 0
    ? '\n✓ qbank legacy integrity upgrade / quarantine proof passed'
    : `\n✗ ${failures} qbank legacy integrity upgrade assertions failed`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : 'qbank_integrity_upgrade_failed');
  await pool.end().catch(() => undefined);
  process.exit(1);
});
