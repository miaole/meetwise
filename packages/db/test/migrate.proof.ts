/** 迁移运行器证明（真 Postgres）：只跑待应用 · 幂等 · 事务 · 漂移检测 · advisory 锁 · 目录加载。 pnpm migrate:prove */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertIsolatedTestTarget, createPool, runMigrations, loadMigrations } from '../src/index.ts';

export type MigrateProofOutcome = {
  assertions: number;
  failures: string[];
};

/**
 * The exact migration-runner proof shared by the local isolated target and
 * the private cloud test runner.  It deliberately accepts an already-bound
 * pool: target attestation belongs to the caller, while every DDL assertion
 * below remains identical in both environments.
 */
export async function runMigrateProof(
  pool: any,
  migrationDirectory: string,
  report?: (name: string, passed: boolean) => void,
): Promise<MigrateProofOutcome> {
  let assertions = 0;
  const failures: string[] = [];
  const A = (name: string, passed: boolean) => {
    assertions++;
    report?.(name, passed);
    if (!passed) failures.push(name);
  };
  const has = async (table: string) => (await pool.query("SELECT to_regclass($1) r", ['public.' + table])).rows[0].r !== null;

  await pool.query('DROP TABLE IF EXISTS schema_migrations, mig_t1, mig_t2, mig_t3 CASCADE');
  const m1 = { version: '0001', sql: 'CREATE TABLE IF NOT EXISTS mig_t1(id int)' };
  const m2 = { version: '0002', sql: 'CREATE TABLE IF NOT EXISTS mig_t2(id int)' };

  let r = await runMigrations(pool, [m2, m1]);   // 乱序传入,按 version 排序
  A('首次:两迁移都应用(按序)', JSON.stringify(r.applied) === JSON.stringify(['0001', '0002']));
  A('表真建出来', (await has('mig_t1')) && (await has('mig_t2')));
  A('schema_migrations 记 2 条', (await pool.query('SELECT count(*)::int n FROM schema_migrations')).rows[0].n === 2);

  r = await runMigrations(pool, [m1, m2]);       // 重跑
  A('幂等:重跑无新应用(全 skip)', r.applied.length === 0 && r.skipped.length === 2);

  const m3 = { version: '0003', sql: 'CREATE TABLE IF NOT EXISTS mig_t3(id int)' };
  r = await runMigrations(pool, [m1, m2, m3]);   // 加新迁移
  A('只跑新增的 0003', JSON.stringify(r.applied) === JSON.stringify(['0003']) && await has('mig_t3'));

  // PostgreSQL does not allow CREATE INDEX CONCURRENTLY inside a transaction.
  // The runner has one narrow, parsed escape hatch—not a generic
  // "non-transactional SQL" option—and still appends the ledger only after
  // the index is physically present.
  const concurrentIndex = {
    version: '0003a',
    executionMode: 'concurrent-index' as const,
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_mig_t3_id ON mig_t3(id);',
  };
  r = await runMigrations(pool, [m1, m2, m3, concurrentIndex]);
  A('并发索引迁移: 真索引建成且随后才记账本', JSON.stringify(r.applied) === JSON.stringify(['0003a'])
    && (await pool.query("SELECT to_regclass('public.ix_mig_t3_id') r")).rows[0]?.r !== null
    && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0003a'")) .rows[0]?.n === 1);
  r = await runMigrations(pool, [m1, m2, m3, concurrentIndex]);
  A('并发索引迁移: 重跑只 skip，不重建或重复记账', r.applied.length === 0 && r.skipped.length === 4);
  let concurrentRejected = false;
  try {
    await runMigrations(pool, [m1, m2, m3, concurrentIndex, {
      version: '0003b', executionMode: 'concurrent-index' as const,
      sql: 'CREATE INDEX CONCURRENTLY ix_mig_t3_bad ON mig_t3(id); DROP TABLE mig_t3;',
    }]);
  } catch (error) { concurrentRejected = (error as { code?: string }).code === 'migration_concurrent_index_sql_invalid'; }
  A('并发索引迁移: 夹带第二条 SQL 在 DDL 前拒绝且不记账', concurrentRejected
    && (await has('mig_t3'))
    && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0003b'")).rows[0]?.n === 0);
  let nonRecoverableConcurrentRejected = false;
  try {
    await runMigrations(pool, [m1, m2, m3, concurrentIndex, {
      version: '0003b1', executionMode: 'concurrent-index' as const,
      sql: 'CREATE INDEX CONCURRENTLY ix_mig_t3_no_if ON mig_t3(id);',
    }]);
  } catch (error) { nonRecoverableConcurrentRejected = (error as { code?: string }).code === 'migration_concurrent_index_sql_invalid'; }
  A('并发索引迁移: 缺 IF NOT EXISTS 的不可恢复写法在 DDL 前拒绝', nonRecoverableConcurrentRejected
    && (await pool.query("SELECT to_regclass('public.ix_mig_t3_no_if') r")).rows[0]?.r === null
    && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0003b1'")).rows[0]?.n === 0);
  await pool.query('CREATE TABLE mig_index_definition(a int, b int)');
  await pool.query('CREATE INDEX ix_mig_index_definition ON mig_index_definition(b)');
  const wrongDefinitionIndex = {
    version: '0003d',
    executionMode: 'concurrent-index' as const,
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_mig_index_definition ON mig_index_definition(a) WHERE b IS NULL;',
  };
  let wrongDefinitionRejected = false;
  try { await runMigrations(pool, [m1, m2, m3, concurrentIndex, wrongDefinitionIndex]); }
  catch (error) { wrongDefinitionRejected = (error as { code?: string }).code === 'migration_concurrent_index_definition_mismatch'; }
  A('并发索引迁移: 同名有效但表/列/谓词不符时不写账本', wrongDefinitionRejected
    && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0003d'")).rows[0]?.n === 0);
  await pool.query('DROP TABLE mig_index_definition');
  await pool.query('CREATE TABLE mig_index_access_method(a int, b int)');
  await pool.query('CREATE INDEX ix_mig_index_access_method ON mig_index_access_method USING brin(a,b) WHERE b IS NULL');
  const brinDefinitionIndex = {
    version: '0003e',
    executionMode: 'concurrent-index' as const,
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_mig_index_access_method ON mig_index_access_method(a,b) WHERE b IS NULL;',
  };
  let brinRejected = false;
  try { await runMigrations(pool, [m1, m2, m3, concurrentIndex, brinDefinitionIndex]); }
  catch (error) { brinRejected = (error as { code?: string }).code === 'migration_concurrent_index_definition_mismatch'; }
  A('并发索引迁移: 同名有效 BRIN 不能冒充声明的 B-tree，账本保持为空', brinRejected
    && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0003e'")).rows[0]?.n === 0);
  await pool.query('DROP TABLE mig_index_access_method');
  await pool.query('CREATE TABLE mig_index_unique(a int, b int)');
  await pool.query('CREATE UNIQUE INDEX ix_mig_index_unique ON mig_index_unique(a) WHERE b IS NULL');
  const uniqueDefinitionIndex = {
    version: '0003f',
    executionMode: 'concurrent-index' as const,
    sql: 'CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_mig_index_unique ON mig_index_unique(a) WHERE b IS NULL;',
  };
  let uniqueRejected = false;
  try { await runMigrations(pool, [m1, m2, m3, concurrentIndex, uniqueDefinitionIndex]); }
  catch (error) { uniqueRejected = (error as { code?: string }).code === 'migration_concurrent_index_definition_mismatch'; }
  A('并发索引迁移: 同名 UNIQUE 属性错配时不写账本', uniqueRejected
    && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0003f'")).rows[0]?.n === 0);
  await pool.query('DROP TABLE mig_index_unique');
  await pool.query('CREATE TABLE mig_unique_conflict(id int NOT NULL)');
  await pool.query('INSERT INTO mig_unique_conflict(id) VALUES (1),(1)');
  const invalidConcurrentIndex = {
    version: '0003c',
    executionMode: 'concurrent-index' as const,
    sql: 'CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS ix_mig_unique_conflict ON mig_unique_conflict(id);',
  };
  let invalidIndexRejected = false;
  try { await runMigrations(pool, [m1, m2, m3, concurrentIndex, invalidConcurrentIndex]); }
  catch { invalidIndexRejected = true; }
  let invalidIndexRerunRejected = false;
  try { await runMigrations(pool, [m1, m2, m3, concurrentIndex, invalidConcurrentIndex]); }
  catch (error) { invalidIndexRerunRejected = (error as { code?: string }).code === 'migration_concurrent_index_not_valid'; }
  A('并发唯一索引失败留下无效物理索引: 不记账且重跑失败关闭', invalidIndexRejected && invalidIndexRerunRejected
    && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0003c'")).rows[0]?.n === 0
    && (await pool.query("SELECT indisvalid FROM pg_index WHERE indexrelid='public.ix_mig_unique_conflict'::regclass")).rows[0]?.indisvalid === false);
  await pool.query('DROP TABLE mig_unique_conflict');
  await pool.query('DROP INDEX ix_mig_t3_id');
  let recordedIndexMissingRejected = false;
  try { await runMigrations(pool, [m1, m2, m3, concurrentIndex]); }
  catch (error) {
    const code = (error as { code?: string }).code;
    recordedIndexMissingRejected = code === 'migration_concurrent_index_not_valid' || code === 'migration_concurrent_index_definition_mismatch';
  }
  A('并发索引迁移: 已记账但物理索引被删时重跑失败关闭', recordedIndexMissingRejected);

  let threw = false;
  try { await runMigrations(pool, [
    { version: '0001', sql: 'CREATE TABLE IF NOT EXISTS mig_t1(id int, x text)' }, m2, m3,
  ]); } catch { threw = true; }
  A('漂移检测:改已应用迁移(0001)→ 报错(禁止改历史)', threw);

  // 失败迁移回滚:坏 SQL 不留 schema_migrations 记录
  let err = false;
  try { await runMigrations(pool, [{ version: '0004', sql: 'THIS IS NOT SQL' }]); } catch { err = true; }
  A('坏迁移抛错且不记录(事务回滚)', err && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0004'")).rows[0].n === 0);

  // P0: a non-empty database without a migration ledger must be rejected before
  // CREATE TABLE schema_migrations or any destructive baseline SQL can run.
  await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  await pool.query('CREATE TABLE migration_guarded_business(id int PRIMARY KEY, value text NOT NULL)');
  await pool.query("INSERT INTO migration_guarded_business VALUES (1, 'must-survive')");
  let guarded = false;
  try { await runMigrations(pool, [{ version: '0001', sql: 'DROP TABLE migration_guarded_business' }]); }
  catch (error) { guarded = (error as { code?: string }).code === 'migration_uninitialized_nonempty_database'; }
  A('非空且无迁移账本: DDL 前拒绝破坏性 baseline', guarded);
  A('拒绝后业务表和行仍在', (await has('migration_guarded_business'))
    && (await pool.query('SELECT value FROM migration_guarded_business WHERE id=1')).rows[0]?.value === 'must-survive');
  A('拒绝后不创建迁移账本', (await pool.query("SELECT to_regclass('public.schema_migrations') r")).rows[0]?.r === null);
  await pool.query('DROP TABLE migration_guarded_business, mig_t1, mig_t2, mig_t3');

  // P0: an existing but discontinuous ledger (for example, a manually inserted
  // 0002 with the destructive 0001 missing) is equally unsafe.  It must fail
  // before the missing 0001 can touch the business table.
  const dangerousBaseline = { version: '0001', sql: 'DROP TABLE migration_guarded_business' };
  const safeLater = { version: '0002', sql: 'CREATE TABLE IF NOT EXISTS mig_t2(id int)' };
  await pool.query('DROP TABLE IF EXISTS schema_migrations, migration_guarded_business, mig_t2 CASCADE');
  await runMigrations(pool, [safeLater]);
  await pool.query('CREATE TABLE migration_guarded_business(id int PRIMARY KEY, value text NOT NULL)');
  await pool.query("INSERT INTO migration_guarded_business VALUES (1, 'must-survive-bad-ledger')");
  let badLedger = false;
  try { await runMigrations(pool, [dangerousBaseline, safeLater]); }
  catch (error) { badLedger = (error as { code?: string }).code === 'migration_ledger_not_contiguous_prefix'; }
  A('非连续迁移账本: 在缺失 baseline 的 DDL 前拒绝', badLedger);
  A('坏账本拒绝后业务表、数据和账本保持不变',
    (await has('migration_guarded_business'))
    && (await pool.query('SELECT value FROM migration_guarded_business WHERE id=1')).rows[0]?.value === 'must-survive-bad-ledger'
    && (await pool.query('SELECT version FROM schema_migrations ORDER BY version')).rows.map((r: { version: string }) => r.version).join(',') === '0002');
  await pool.query('DROP TABLE migration_guarded_business, mig_t2, schema_migrations');

  // 目录加载 + baseline(冻结真 schema) + 增量 + 幂等 + **数据保全(零丢失)**
  await pool.query('DROP TABLE IF EXISTS schema_migrations, app_setting CASCADE');
  const loaded = loadMigrations(migrationDirectory);
  A('加载迁移(0001_baseline 起,≥3)', loaded[0]?.version === '0001_baseline' && loaded.length >= 3);
  A('加载 P0 commerce 迁移 0020', loaded.some((m) => m.version === '0020_commerce_terminal_integrity'));
  A('加载 question identity 迁移 0021', loaded.some((m) => m.version === '0021_interview_question_identity'));
  A('加载 event 唯一约束对齐迁移 0027', loaded.some((m) => m.version === '0027_interview_event_unique_constraint_reconcile'));
  A('加载 application-bound interview 迁移 0028', loaded.some((m) => m.version === '0028_application_bound_interview'));
  A('加载 qbank generation/hybrid 迁移 0029', loaded.some((m) => m.version === '0029_qbank_generation_hybrid_retrieval'));
  A('加载 B 端岗位发布幂等迁移 0030', loaded.some((m) => m.version === '0030_job_posting_idempotency'));
  A('加载题目业务实体/多 chunk RAG 迁移 0031', loaded.some((m) => m.version === '0031_qbank_question_artifact_rag'));
  A('加载通用 RAG corpus 版本控制迁移 0032', loaded.some((m) => m.version === '0032_rag_corpus_version_control'));
  A('加载 AI 费用账本与预算状态机迁移 0033', loaded.some((m) => m.version === '0033_ai_cost_governance'));
  A('加载已发布费用账本函数修复迁移 0034', loaded.some((m) => m.version === '0034_ai_cost_governance_function_fix'));
  A('加载费用账本 principal 绑定迁移 0035', loaded.some((m) => m.version === '0035_ai_cost_principal_scope'));
  A('加载文本/多模态模型费用迁移 0036', loaded.some((m) => m.version === '0036_ai_text_cost_governance'));
  A('加载模型调用持久幂等状态机迁移 0037', loaded.some((m) => m.version === '0037_ai_model_invocation_durable_claim'));
  A('加载 OCR 崩溃恢复加密工件迁移 0038', loaded.some((m) => m.version === '0038_resume_ocr_artifact'));
  A('加载简历 OCR 衍生记录删除迁移 0039', loaded.some((m) => m.version === '0039_resume_derivative_erasure'));
  A('加载低权网关调度迁移 0040', loaded.some((m) => m.version === '0040_gateway_dispatch_least_privilege'));
  A('加载 API 低权运行迁移 0041', loaded.some((m) => m.version === '0041_api_runtime_least_privilege'));
  A('加载运行时指标低权网关迁移 0042', loaded.some((m) => m.version === '0042_runtime_observability_gateway'));
  A('加载 LangGraph checkpoint 低权迁移 0043', loaded.some((m) => m.version === '0043_langgraph_checkpoint_least_privilege'));
  A('加载 checkpoint thread RLS 迁移 0045', loaded.some((m) => m.version === '0045_checkpoint_thread_rls'));
  A('加载评分不可用恢复迁移 0046', loaded.some((m) => m.version === '0046_application_assessment_recovery'));
  A('加载简历稳定引用写门与在线部分索引迁移 0052–0055',
    loaded.some((m) => m.version === '0052_resume_reference_runtime_enforcement')
    && loaded.some((m) => m.version === '0053_resume_reference_legacy_classification')
    && loaded.some((m) => m.version === '0054_resume_reference_write_gate')
    && loaded.find((m) => m.version === '0055_resume_reference_legacy_backfill_index')?.executionMode === 'concurrent-index');
  A('加载模型派发后未知结果对账迁移 0056',
    loaded.some((m) => m.version === '0056_model_invocation_reconcile'));
  A('加载模型调用费用 scope 绑定迁移 0057',
    loaded.some((m) => m.version === '0057_model_invocation_cost_scope'));
  A('加载逻辑节点 canonical header 与单派发 slot 迁移 0085',
    loaded.some((m) => m.version === '0085_ai_model_logical_node_dispatch_slot'));
  A('加载题库工件完整性迁移 0065',
    loaded.some((m) => m.version === '0065_qbank_artifact_integrity'));
  A('加载题库独立控制执行器迁移 0066',
    loaded.some((m) => m.version === '0066_qbank_control_executor'));
  A('加载题库控制面原文读取与活动 generation 边界迁移 0067',
    loaded.some((m) => m.version === '0067_qbank_control_plane_read_boundary'));
  const rr = await runMigrations(pool, loaded);
  A('baseline 应用 → 真生产 schema 建出来(user_account/payment_order/vector_chunk)', (await has('user_account')) && (await has('payment_order')) && (await has('vector_chunk')));
  A('0020 → providerTxn partial unique index 已建', (await pool.query("SELECT to_regclass('public.uq_payment_order_provider_txn') r")).rows[0].r !== null);
  A('0020 → interview/consumption terminal-pair trigger 已建', (await pool.query(
    "SELECT count(*)::int n FROM pg_trigger WHERE tgname='trg_interview_consumption_terminal_pair' AND NOT tgisinternal")).rows[0].n === 1);
  A('0065 → 题库已发布工件和映射不可原地改写 trigger 已建', (await pool.query(
    "SELECT count(*)::int n FROM pg_trigger WHERE tgname IN ('trg_qbank_question_artifact_guard','trg_qbank_question_chunk_artifact_guard') AND NOT tgisinternal")).rows[0].n === 2);
  A('0066 → app_role 失去题库控制写/切换权限，独立 executor 获得最小控制函数权限',
    (await pool.query("SELECT 1 FROM pg_roles WHERE rolname='qbank_control_executor'")).rowCount === 1
    && (await pool.query("SELECT has_table_privilege('app_role','qbank_source','INSERT') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_function_privilege('app_role','qbank_activate_generation(text)','EXECUTE') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_function_privilege('qbank_control_executor','qbank_activate_generation(text)','EXECUTE') allowed")).rows[0]?.allowed === true);
  A('0067 → app_role 无原始题库表读取权限，只能调用活动 generation metadata 受限读函数',
    (await pool.query("SELECT has_table_privilege('app_role','qbank_chunk','SELECT') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_function_privilege('app_role','qbank_active_generation_metadata()','EXECUTE') allowed")).rows[0]?.allowed === true);
  A('0021 → interview_question + 事件去重索引已建', (await has('interview_question')) && (await pool.query("SELECT to_regclass('public.uq_interview_event_key') r")).rows[0].r !== null);
  A('0027 → 事件去重表级唯一约束已建', (await pool.query("SELECT count(*)::int n FROM pg_constraint WHERE conname='uq_interview_event_key_constraint' AND contype='u'")).rows[0].n === 1);
  A('0028/0046 → application/interview attempt 唯一索引与自动回填 trigger 已建', (await pool.query("SELECT to_regclass('public.uq_interview_application_attempt') r")).rows[0].r !== null
    && (await pool.query("SELECT count(*)::int n FROM pg_trigger WHERE tgname='trg_finalize_bound_job_application' AND NOT tgisinternal")).rows[0].n === 1);
  A('0029 → qbank 可重建事实、generation 指针、语料 epoch 与分区表已建',
    (await has('qbank_chunk')) && (await has('qbank_embedding_recipe')) && (await has('qbank_vector_generation'))
    && (await has('qbank_active_generation')) && (await has('qbank_corpus_epoch')) && (await has('qbank_generation_chunk')));
  A('0067 → qbank 分词仅由控制 executor 与受限 SECURITY DEFINER 检索函数使用，app_role 无原始辅助函数执行权',
    (await pool.query("SELECT has_function_privilege('app_role','qbank_search_terms(text)','EXECUTE') allowed")).rows[0].allowed === false
    && (await pool.query("SELECT has_function_privilege('qbank_control_executor','qbank_search_terms(text)','EXECUTE') allowed")).rows[0].allowed === true);
  A('0030 → 同招聘方岗位发布 idempotency 唯一索引已建', (await pool.query("SELECT to_regclass('public.uq_job_posting_owner_idempotency') r")).rows[0].r !== null);
  A('0031 → qbank_question 与有角色的 qbank_question_chunk 已建', (await has('qbank_question')) && (await has('qbank_question_chunk')));
  A('0032 → 通用 corpus、generation、binding 与删除审计表已建',
    (await has('rag_corpus_document')) && (await has('rag_embedding_generation')) && (await has('rag_query_binding')) && (await has('rag_citation')));
  A('0033 → 价格版本、月预算与预留账本已建',
    (await has('ai_cost_price_book')) && (await has('ai_cost_budget_month')) && (await has('ai_cost_reservation')));
  A('0036 → 文本调用双向 token 价格与预留过程已建',
    (await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name='ai_cost_reservation' AND column_name='output_tokens_reserved'")).rowCount === 1
    // 0083 keeps the legacy eight-argument overload only as a revoked shell:
    // app_role must execute exactly the revision-bound nine-argument procedure.
    && (await pool.query("SELECT count(*)::int n FROM pg_proc WHERE proname='ai_cost_reserve_text_scoped'")).rows[0].n === 2
    && (await pool.query("SELECT has_function_privilege('app_role','ai_cost_reserve_text_scoped(text,text,text,text,text,text,integer,integer)','EXECUTE') allowed")).rows[0].allowed === false
    && (await pool.query("SELECT has_function_privilege('app_role','ai_cost_reserve_text_scoped(text,text,text,text,text,text,text,integer,integer)','EXECUTE') allowed")).rows[0].allowed === true);
  A('0037 → 模型调用持久幂等表、未知调用索引与强制行级安全已建',
    (await has('ai_model_invocation'))
    && (await pool.query("SELECT to_regclass('public.ix_ai_model_invocation_unknown') r")).rows[0].r !== null
    && (await pool.query("SELECT relforcerowsecurity FROM pg_class WHERE oid='public.ai_model_invocation'::regclass")).rows[0].relforcerowsecurity === true);
  A('0038 → OCR 加密恢复工件表与强制行级安全已建',
    (await has('resume_ocr_artifact'))
    && (await pool.query("SELECT relforcerowsecurity FROM pg_class WHERE oid='public.resume_ocr_artifact'::regclass")).rows[0].relforcerowsecurity === true);
  A('0039/0088 → app_role 仅保留 OCR trace 删除权，调用账本不得直接删除',
    (await pool.query("SELECT has_table_privilege('app_role','ai_invocation_trace','DELETE') allowed")).rows[0].allowed === true
    && (await pool.query("SELECT has_table_privilege('app_role','ai_model_invocation','DELETE') allowed")).rows[0].allowed === false);
  A('0040 → 无表权限的网关角色只获固定调度函数执行权',
    (await pool.query("SELECT has_function_privilege('app_gateway_role','gateway_dispatch_owners(text)','EXECUTE') allowed")).rows[0].allowed === true
    && (await pool.query("SELECT has_table_privilege('app_gateway_role','interview_job','SELECT') allowed")).rows[0].allowed === false);
  A('0041 → user_account 强制 RLS，网关仅有固定函数执行权',
    (await pool.query("SELECT relforcerowsecurity FROM pg_class WHERE oid='public.user_account'::regclass")).rows[0].relforcerowsecurity === true
    && (await pool.query("SELECT has_function_privilege('app_gateway_role','gateway_auth_login(text)','EXECUTE') allowed")).rows[0].allowed === true
    && (await pool.query("SELECT has_table_privilege('app_gateway_role','user_account','SELECT') allowed")).rows[0].allowed === false
    && (await pool.query("SELECT has_function_privilege('app_role','gateway_admin_users()','EXECUTE') allowed")).rows[0].allowed === true);
  A('0042 → worker 仅有固定全局指标函数执行权，不具备费用账本 SELECT',
    (await pool.query("SELECT has_function_privilege('app_gateway_role','gateway_job_gauges()','EXECUTE') allowed")).rows[0].allowed === true
    && (await pool.query("SELECT has_function_privilege('app_gateway_role','gateway_cost_budget_snapshot(text)','EXECUTE') allowed")).rows[0].allowed === true
    && (await pool.query("SELECT has_table_privilege('app_gateway_role','ai_cost_reservation','SELECT') allowed")).rows[0].allowed === false);
  A('0043 → checkpoint schema 在迁移期建好，app_role 仅有运行时数据权限',
    (await has('checkpoints')) && (await has('checkpoint_blobs')) && (await has('checkpoint_writes'))
    && (await pool.query("SELECT has_table_privilege('app_role','checkpoints','INSERT') allowed")).rows[0].allowed === true
    && (await pool.query("SELECT has_table_privilege('app_role','checkpoints','TRUNCATE') allowed")).rows[0].allowed === false);
  A('0045 → checkpoint thread enrollment 与三张保存表均强制 RLS',
    (await has('checkpoint_thread_enrollment'))
    && (await pool.query("SELECT bool_and(relforcerowsecurity) AS forced FROM pg_class WHERE relname IN ('checkpoint_thread_enrollment','checkpoints','checkpoint_blobs','checkpoint_writes')")).rows[0]?.forced === true);
  A('0046 → 岗位申请可显式评分不可用、历史 attempt 唯一、failed 必须释放',
    (await pool.query("SELECT pg_get_constraintdef(oid) def FROM pg_constraint WHERE conname='job_application_status_check'")).rows[0]?.def.includes('assessment_unavailable')
    && (await pool.query("SELECT to_regclass('public.uq_interview_application_attempt') r")).rows[0]?.r !== null
    && (await pool.query("SELECT pg_get_functiondef('enforce_interview_consumption_terminal_pair()'::regprocedure) def")).rows[0]?.def.includes("'failed'")
    && (await pool.query("SELECT pg_get_constraintdef(oid) def FROM pg_constraint WHERE conname='ck_job_application_score_range'")).rows[0]?.def.includes('100')
    && (await pool.query("SELECT count(*)::int n FROM pg_trigger WHERE tgname='trg_interview_scoring_completion_integrity' AND NOT tgisinternal")).rows[0]?.n === 1
    && (await pool.query("SELECT count(*)::int n FROM pg_trigger WHERE tgname='trg_job_application_lineage' AND NOT tgisinternal")).rows[0]?.n === 1
    && (await pool.query("SELECT count(*)::int n FROM pg_constraint WHERE conname='fk_job_application_job_recruiter'")).rows[0]?.n === 1);
  A('0052–0055 → 简历稳定引用门与遗留批量分类部分索引已建',
    (await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name='interview_job' AND column_name='reference_schema_version'")).rowCount === 1
    && (await pool.query("SELECT count(*)::int n FROM pg_trigger WHERE tgname='trg_interview_job_resume_reference' AND NOT tgisinternal")).rows[0]?.n === 1
    && (await pool.query("SELECT to_regclass('public.ix_interview_job_reference_legacy_backfill') r")).rows[0]?.r !== null
    && (await pool.query("SELECT 1 FROM pg_proc WHERE proname='classify_legacy_interview_job_reference_batch'")).rowCount === 1);
  A('0056/0057 → 仅网关可枚举过期模型派发 owner，应用只可按绑定 scope 冻结自己的匹配费用',
    (await pool.query("SELECT has_function_privilege('app_gateway_role','gateway_model_invocation_owners(integer)','EXECUTE') allowed")).rows[0]?.allowed === true
    && (await pool.query("SELECT has_function_privilege('app_role','gateway_model_invocation_owners(integer)','EXECUTE') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_function_privilege('app_role','ai_cost_mark_unknown_for_model_reconcile_scoped(text,text,text,text)','EXECUTE') allowed")).rows[0]?.allowed === true
    && (await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name='ai_model_invocation' AND column_name='cost_scope_id'")).rowCount === 1);
  A('0085/0088 → 逻辑节点 header/slot 与调用状态机由受控过程维护，app_role 没有 invocation 直写权限',
    (await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name='ai_model_invocation' AND column_name='logical_node_key_digest'")).rowCount === 1
    && (await pool.query("SELECT count(*)::int n FROM pg_trigger WHERE tgname='tr_ai_model_invocation_state_guard' AND NOT tgisinternal")).rows[0]?.n === 1
    && (await pool.query("SELECT has_table_privilege('app_role','ai_model_logical_node_header','SELECT') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_table_privilege('app_role','ai_model_invocation','INSERT') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_table_privilege('app_role','ai_model_invocation','UPDATE') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_table_privilege('app_role','ai_model_invocation','DELETE') allowed")).rows[0]?.allowed === false
    && (await pool.query("SELECT has_function_privilege('app_role','ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer)','EXECUTE') allowed")).rows[0]?.allowed === true
    && (await pool.query("SELECT has_function_privilege('app_role','ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer)','EXECUTE') allowed")).rows[0]?.allowed === true);
  A('增量 0003 → app_setting 有 ALTER 加的 updated_at 列(非 DROP 重建)', (await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name='app_setting' AND column_name='updated_at'")).rowCount === 1);
  // 关键:插用户数据 → 再部署(重跑迁移)→ 数据必须还在(运行器 skip,不重跑 baseline 的 drop+recreate)
  await pool.query("INSERT INTO app_setting(key,value) VALUES ('user_key','user_data')");
  const rr2 = await runMigrations(pool, loaded);
  A('再部署:全迁移 skip(不重跑 baseline 的 DROP)', rr2.applied.length === 0 && rr2.skipped.length === loaded.length);
  A('**零数据丢失**:再部署后用户数据仍在', (await pool.query("SELECT value FROM app_setting WHERE key='user_key'")).rows[0]?.value === 'user_data');

  return { assertions, failures };
}

async function main() {
  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    const workspaceMigrations = resolve(process.cwd(), 'packages/db/migrations');
    const migrationDirectory = existsSync(workspaceMigrations)
      ? workspaceMigrations
      : resolve(process.cwd(), 'migrations');
    const outcome = await runMigrateProof(pool, migrationDirectory, (name, passed) => {
      console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}`);
    });
    console.log(`\n${outcome.failures.length === 0 ? '✓ 迁移运行器 全部通过' : '✗ ' + outcome.failures.length + ' 失败'}`);
    if (outcome.failures.length > 0) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

// The private FC artifact is CommonJS while the normal test is ESM.  Avoid
// `import.meta` here so importing the shared proof into that artifact can
// never execute the local CLI path during module loading.
if (process.argv[1] && resolve(process.argv[1]).endsWith('/migrate.proof.ts')) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
