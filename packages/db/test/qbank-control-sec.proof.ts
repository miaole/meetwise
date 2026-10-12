/**
 * QBANK-CONTROL-SEC · qbank 控制面鉴权收口小刀 prove（0176 · EXIT=0 · attempts 全账 · Ban retry-to-green）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（版本化迁移全量含 0176）：
 *   CS-A AG-41 释放函数收口（0176 ①）：
 *     A1 executor-only ACL——app_role SET ROLE 直调 → 42501（permission denied for function）；
 *     A2 伪造 __system_qbank__ GUC 后 app_role 仍拒（GUC 不再是授权根·原 P5-11 攻击路径反向证明）；
 *     A3 函数体静态镜像：无 current_setting('app.principal_user')·引用 tf_is_generation_control_definer
 *        （0070:20-38/0144:674-701 白名单族形·裁决项⑥）；failed 代无 epoch 守卫=裁决项⑤豁免登记（A7 实证可释）。
 *     A4 executor 路径端到端：retired 代 corpus epoch 前进后经 asQbankControlExecutor 释放成功（DETACH+DROP+
 *        storage_released_at 落戳——AG-43 调度半的生产调用形）；
 *     A5 executor 路径负门：retired 代回滚窗口未关 → check_violation（守卫 4 在场）；
 *     A6 executor 路径枚举读（调度枚举 SELECT·0066 executor 读权在位）；
 *     A7 failed 代经 executor 可释放（裁决项⑤豁免形·dbhy1 P5-12 同源语义走 executor 路径）。
 *   CS-B AG-42 五函数双空放行收口（0176 ②·形 A）：
 *     B1-B5 双空 GUC 直调五函数逐一 qbank_retrieval_scope_missing（check_violation·23514·0124 fail-closed
 *        先例形；ann 经 0144 薄壳 delegator 进 tf_ 体）——活跃代真实语料在场，报错非空数据假阳；
 *     B6 设双 scope（v1/backend/general）后 equality 臂原样返回行（含 ann delegator 全链）；
 *     B7/B8 半边（仅设其一）→ 0 行（fail-closed 半边语义不变·rag04 同族）；
 *     B9 tf_ann proconfig 双 SET 存续（search_path + hnsw.iterative_scan=strict_order·0144 逐字重声明钉子）。
 *   CS-C P5 九支遗留 GUC 策略清理（0176 ④·裁决项④清理形）：
 *     C1 九支策略 pg_policies 缺席；C2 四表 ENABLE+FORCE RLS 维持（真空收口·re-GRANT 撞默认拒绝）；
 *     C3 executor 控制策略在位（0066:72-90 面·调度/构建链不受损）。
 */
import { createHash, randomUUID } from 'node:crypto';
import { createPool, ingestQbank, asQbankControlExecutor, assertIsolatedTestTarget } from '../src/index.ts';

let failures = 0; let assertions = 0;
const A = (name: string, ok: boolean) => { assertions++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

async function main() {
  const pool = createPool();
  try {
    await assertIsolatedTestTarget(pool);
    A('CS-0 隔离目标实证（E2E_ISOLATED + 容器 nonce）', true);

    // ── 夹具：语料 + 两代（G1→retired·G2=active）+ 一个 failed 代 + corpus epoch 前进 ──（dbhy1 P5 同形）
    const DIM2 = 512, TAX = 'v1', SCOPE2 = 'backend/general';
    const unusedEmbedder = { dim: DIM2, id: 'qsec-proof:v1', embed: async () => { throw new Error('qsec_embedder_must_not_be_called'); } } as const;
    const mkVec = () => '[' + Array.from({ length: DIM2 }, (_, i) => ((i % 7) + 1) / 10).join(',') + ']';
    const RECIPE_MANIFEST = { schema: 'qbank-embedding-recipe:v1', provider: 'qsec', model: 'qsec-proof:v1', providerRevision: 'r1', dimensions: DIM2, chunkerVersion: 'whole:v1', normalizationVersion: 'nfc:v1', documentPrefixVersion: 'none:v1', queryPrefixVersion: 'none:v1' };
    const recipeHash = createHash('sha256').update(JSON.stringify(RECIPE_MANIFEST)).digest('hex');
    const recipeId = 'qrecipe-' + recipeHash.slice(0, 32);
    const vecByRef = new Map<string, string>();
    const ingest = async (refs: string[]) => {
      const items = refs.map((r) => { vecByRef.set(r, mkVec()); return { refId: r, text: `控制面收口冒烟语料 ${r} alpha bravo`, taxonomyVersion: TAX, servingScopeId: SCOPE2, annotationSource: 'seed_v1_reviewed' }; });
      const n = await ingestQbank(pool, items as any, unusedEmbedder as any);
      if (n !== items.length) throw new Error(`qsec_ingest_short:${n}/${items.length}`);
    };
    const factsSnapshot = () => asQbankControlExecutor(pool, async (c: any) => {
      const e = await c.query('SELECT epoch::text AS epoch FROM qbank_corpus_epoch WHERE singleton=true');
      const rows = await c.query(
        `SELECT ch.ref_id, ch.content_hash, cs.taxonomy_version, cs.serving_scope_id
           FROM qbank_chunk ch
           JOIN qbank_pool_entry pool ON pool.ref_id=ch.ref_id AND pool.source_id=ch.source_id AND pool.content_hash=ch.content_hash
           JOIN qbank_source source ON source.id=pool.source_id AND source.content_hash=pool.content_hash
           JOIN qbank_chunk_serving_scope cs ON cs.ref_id=ch.ref_id
          WHERE source.status='approved'
          ORDER BY ch.ref_id, cs.taxonomy_version, cs.serving_scope_id`, []);
      return { epoch: String(e.rows[0].epoch), facts: rows.rows.map((r: any) => ({ refId: String(r.ref_id), contentHash: String(r.content_hash), taxonomyVersion: String(r.taxonomy_version), servingScopeId: String(r.serving_scope_id) })) };
    });
    const mkGeneration = async (validate: boolean): Promise<string> => {
      await asQbankControlExecutor(pool, (c: any) => c.query(
        `INSERT INTO qbank_embedding_recipe(id,recipe_hash,provider,model,provider_revision,dimensions,chunker_version,normalization_version,document_prefix_version,query_prefix_version,manifest)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb) ON CONFLICT (recipe_hash) DO NOTHING`,
        [recipeId, recipeHash, RECIPE_MANIFEST.provider, RECIPE_MANIFEST.model, RECIPE_MANIFEST.providerRevision, DIM2, RECIPE_MANIFEST.chunkerVersion, RECIPE_MANIFEST.normalizationVersion, RECIPE_MANIFEST.documentPrefixVersion, RECIPE_MANIFEST.queryPrefixVersion, JSON.stringify(RECIPE_MANIFEST)]));
      const { epoch, facts } = await factsSnapshot();
      const gen = 'qgen-' + randomUUID();
      await asQbankControlExecutor(pool, async (c: any) => {
        await c.query(`INSERT INTO qbank_vector_generation(id,recipe_id,source_epoch,expected_chunk_count,state) VALUES ($1,$2,$3::bigint,$4,'building')`, [gen, recipeId, epoch, facts.length]);
        await c.query('SELECT qbank_prepare_generation_partition($1)', [gen]);
      });
      await asQbankControlExecutor(pool, async (c: any) => {
        const params: unknown[] = [];
        const values = facts.map((f: any, i: number) => {
          const v = vecByRef.get(f.refId);
          if (!v) throw new Error('qsec_missing_vector:' + f.refId);
          const q = i * 6;
          params.push(gen, f.refId, f.taxonomyVersion, f.servingScopeId, f.contentHash, v);
          return `($${q + 1},$${q + 2},$${q + 3},$${q + 4},$${q + 5},$${q + 6}::vector)`;
        }).join(',');
        await c.query(`INSERT INTO qbank_generation_chunk(generation_id,ref_id,taxonomy_version,serving_scope_id,content_hash,embedding) VALUES ${values}`, params);
      });
      if (validate) await asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_validate_generation($1)', [gen]));
      return gen;
    };
    const activate = (g: string) => asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_activate_generation($1)', [g]));
    const part = (g: string) => `qbank_generation_chunk_${g.slice(5).replaceAll('-', '')}`;
    const epochNow = async () => Number((await pool.query('SELECT epoch FROM qbank_corpus_epoch WHERE singleton')).rows[0].epoch);

    await ingest(['qsec:a', 'qsec:b', 'qsec:bump']);
    const G1 = await mkGeneration(true);
    await activate(G1);
    const G2 = await mkGeneration(true);
    await activate(G2);   // G1 → retired
    const G4 = await mkGeneration(false);
    await asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_mark_generation_failed($1,$2)', [G4, 'qsec-fixture']));

    // ── CS-B AG-42 形 A：双空报错臂五函数（B1-B5）──
    // 前置：G2=active 且有真实可见 chunk——双空放行若未被删会返回行，报错非空数据假阳。
    const tryCall = async (label: string, sql: string, params: unknown[], wantMsg: string, wantCode: string) => {
      try { await pool.query(sql, params as unknown[]); A(label, false); }
      catch (e: any) { A(label, String(e?.code) === wantCode && String(e?.message).includes(wantMsg)); }
    };
    const qvec = mkVec();
    await tryCall('B1 ann（经 0144 薄壳 delegator）双空 → qbank_retrieval_scope_missing',
      'SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)', [G2, qvec, 5], 'qbank_retrieval_scope_missing', '23514');
    await tryCall('B2 lexical 双空 → qbank_retrieval_scope_missing',
      'SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [G2, 'alpha', 5], 'qbank_retrieval_scope_missing', '23514');
    await tryCall('B3 distances 双空 → qbank_retrieval_scope_missing',
      'SELECT ref_id FROM qbank_generation_distances($1,$2::vector,$3::text[])', [G2, qvec, ['qsec:a']], 'qbank_retrieval_scope_missing', '23514');
    await tryCall('B4 evidence 双空 → qbank_retrieval_scope_missing',
      'SELECT ref_id FROM qbank_generation_evidence($1,$2::text[],$3)', [G2, ['qsec:a', 'qsec:b'], 64], 'qbank_retrieval_scope_missing', '23514');
    await tryCall('B5 question_evidence 双空 → qbank_retrieval_scope_missing（门在外层 WHERE=InitPlan 恒求值）',
      'SELECT question_id FROM qbank_generation_question_evidence($1,$2::text[],$3)', [G2, ['qsec:a'], 64], 'qbank_retrieval_scope_missing', '23514');

    // B6-B8：设双 scope → equality 臂原样；半边 → 0 行（fail-closed 半边语义不变）。
    // 各臂单一 checkout 客户端内 BEGIN+SET LOCAL 定界（pool.query 跨连会丢 session GUC·A2 同教训）。
    {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.qbank_serving_scope','backend/general',true), set_config('app.qbank_taxonomy_version','v1',true)");
        const scopedEvi = (await client.query('SELECT ref_id FROM qbank_generation_evidence($1,ARRAY[$2,$3],64) ORDER BY ref_id', [G2, 'qsec:a', 'qsec:b'])).rows;
        const scopedAnn = (await client.query('SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)', [G2, qvec, 5])).rows;
        await client.query('COMMIT');
        A('B6 双 scope 后 evidence equality 臂原样返回 2 行（ann delegator 全链同闸）', scopedEvi.length === 2);
        A('B6b 双 scope 后 ann（delegator→tf_）返回行', scopedAnn.length > 0);
      } finally { client.release(); }
    }
    {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.qbank_serving_scope','backend/general',true), set_config('app.qbank_taxonomy_version','',true)");
        const onlyScope = (await client.query('SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)', [G2, qvec, 5])).rows;
        await client.query('COMMIT');
        A('B7 仅设 serving_scope（taxonomy 清空）→ 0 行', onlyScope.length === 0);
      } finally { client.release(); }
    }
    {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.qbank_serving_scope','',true), set_config('app.qbank_taxonomy_version','v1',true)");
        const onlyTax = (await client.query('SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)', [G2, qvec, 5])).rows;
        await client.query('COMMIT');
        A('B8 仅设 taxonomy（scope 清空）→ 0 行', onlyTax.length === 0);
      } finally { client.release(); }
    }
    const tfCfg = (await pool.query(`SELECT proconfig::text AS c FROM pg_proc WHERE oid='public.tf_qbank_generation_ann_search(text, vector, integer)'::regprocedure`)).rows[0]?.c ?? '';
    A('B9 tf_ann proconfig 双 SET 存续（search_path + hnsw.iterative_scan）', tfCfg.includes('search_path=public, pg_temp') && tfCfg.includes("hnsw.iterative_scan=strict_order"));

    // ── CS-A AG-41：executor-only ACL + definer 断言（A1-A3）──
    // A1+A2 同一 checkout 客户端内定界（BEGIN+SET LOCAL ROLE·asPrincipal 同形）：SET ROLE/session GUC
    // 经 pool.query 会被 pool 换连丢弃（本 proof 实测 A2 落第二条连接·current_user=meetwise），故以
    // 显式事务定界——伪造 GUC 与调用同事务，证明「GUC 在场仍拒」。
    {
      const client = await pool.connect();
      try {
        // A1：SET LOCAL ROLE app_role（事务定界）→ 直调 → ACL 42501。失败臂后 ROLLBACK（25P02 防 aborted-tx）。
        await client.query('BEGIN');
        await client.query('SET LOCAL ROLE app_role');
        try {
          await client.query('SELECT qbank_release_retired_generation_storage($1)', [G1]);
          A('A1 app_role 直调释放函数 → 42501（executor-only ACL·0066:162-165 手术形）', false);
        } catch (e: any) { A('A1 app_role 直调释放函数 → 42501（executor-only ACL·0066:162-165 手术形）', String(e?.code) === '42501'); }
        await client.query('ROLLBACK');
        // A2：同客户端新事务——伪造 GUC 与调用同事务，证明「GUC 在场仍拒」。
        await client.query('BEGIN');
        await client.query('SET LOCAL ROLE app_role');
        await client.query("SELECT set_config('app.principal_user','__system_qbank__',true)");
        try {
          await client.query('SELECT qbank_release_retired_generation_storage($1)', [G1]);
          A('A2 伪造 __system_qbank__ GUC 后 app_role 仍拒 42501（GUC 非授权根·P5-11 攻击路径反向证明）', false);
        } catch (e: any) { A('A2 伪造 __system_qbank__ GUC 后 app_role 仍拒 42501（GUC 非授权根·P5-11 攻击路径反向证明）', String(e?.code) === '42501'); }
        await client.query('ROLLBACK');
      } finally { client.release(); }
    }
    const fnDef = String((await pool.query(`SELECT pg_get_functiondef('qbank_release_retired_generation_storage(text)'::regprocedure) AS def`)).rows[0]?.def ?? '');
    const acl = (await pool.query(`SELECT proacl::text AS a FROM pg_proc WHERE oid='qbank_release_retired_generation_storage(text)'::regprocedure`)).rows[0]?.a ?? '';
    A('A3a 函数体零 current_setting(\'app.principal_user\' 调用（GUC 门已删·静态镜像；0146 GUC 断言调用形状）', !fnDef.includes("current_setting('app.principal_user'"));
    A('A3b 函数体引用 tf_is_generation_control_definer（definer 白名单断言·裁决项⑥）', fnDef.includes('tf_is_generation_control_definer'));
    A('A3c ACL：app_role 不在 proacl（executor-only·REVOKE 生效）', !acl.includes('app_role') && acl.includes('qbank_control_executor'));

    // A4-A7：executor 路径端到端（AG-43 调度半的生产调用形）。
    const releasable = await asQbankControlExecutor(pool, (c: any) => c.query(
      `SELECT id, state FROM qbank_vector_generation
         WHERE state IN ('retired','failed') AND storage_released_at IS NULL ORDER BY id`));
    A('A6 executor 枚举未释放终态代可读（调度枚举读权·0066 executor SELECT）',
      releasable.rows.some((r: any) => r.id === G1) && releasable.rows.some((r: any) => r.id === G4));

    const e1 = await epochNow();
    try {
      await asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_release_retired_generation_storage($1)', [G1]));
      A('A5 executor 释放 retired 代·回滚窗口未关 → check_violation（守卫 4 在场）', false);
    } catch (e: any) { A('A5 executor 释放 retired 代·回滚窗口未关 → check_violation（守卫 4 在场）', String(e?.code) === '23514'); }
    // corpus 前进：撤销 bump 源（dbhy1 P5-3 同款 sanctioned 路径）
    await asQbankControlExecutor(pool, (c: any) => c.query(
      `UPDATE qbank_source s SET status='rejected', reviewed_by='qsec-proof', review_note='qsec corpus bump', reviewed_at=now(), version=version+1
        WHERE s.status='approved' AND s.id IN (SELECT ch.source_id FROM qbank_chunk ch WHERE ch.ref_id='qsec:bump')`));
    const e2 = await epochNow();
    A(`A5b corpus epoch 已前进（${e1} → ${e2}）`, e2 > e1);
    await asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_release_retired_generation_storage($1)', [G1]));
    A('A4 executor 释放 retired 代成功：分区 DETACH+DROP',
      (await pool.query('SELECT to_regclass($1) r', ['public.' + part(G1)])).rows[0].r === null);
    A('A4b storage_released_at 落戳（元数据行保留）',
      (await pool.query('SELECT storage_released_at IS NOT NULL AS r FROM qbank_vector_generation WHERE id=$1', [G1])).rows[0].r === true);
    await asQbankControlExecutor(pool, (c: any) => c.query('SELECT qbank_release_retired_generation_storage($1)', [G4]));
    A('A7 failed 代经 executor 可释放（裁决项⑤豁免形·无 epoch 守卫）',
      (await pool.query('SELECT to_regclass($1) r', ['public.' + part(G4)])).rows[0].r === null);
    A('A7b active 指针仍=G2（释放不动控制面）',
      (await pool.query('SELECT generation_id FROM qbank_active_generation WHERE singleton')).rows[0].generation_id === G2);

    // ── CS-C P5：九支清理（C1-C3）──
    const dropped = ['public.qbank_source:p_src_read', 'public.qbank_source:p_src_propose', 'public.qbank_source:p_src_review',
      'public.qbank_chunk:p_qbank_chunk_read', 'public.qbank_chunk:p_qbank_chunk_insert',
      'public.qbank_question:p_qbank_question_read', 'public.qbank_question:p_qbank_question_write',
      'public.qbank_question_chunk:p_qbank_question_chunk_read', 'public.qbank_question_chunk:p_qbank_question_chunk_write'];
    const pols = new Set((await pool.query(`SELECT schemaname||'.'||tablename||':'||policyname AS name FROM pg_policies WHERE schemaname='public'`)).rows.map((r: any) => String(r.name)));
    A('C1 九支遗留 GUC 策略全部缺席（0176 P5 清理）', dropped.every((d) => !pols.has(d)));
    const force = async (t: string) => (await pool.query(
      `SELECT relrowsecurity AND relforcerowsecurity AS f FROM pg_class WHERE oid=$1::regclass`, ['public.' + t])).rows[0]?.f === true;
    A('C2 四表 ENABLE+FORCE RLS 维持（真空收口：无适用策略=默认拒绝）',
      await force('qbank_source') && await force('qbank_chunk') && await force('qbank_question') && await force('qbank_question_chunk'));
    const executorPolicies = ['public.qbank_source:p_qbank_source_control', 'public.qbank_chunk:p_qbank_chunk_control',
      'public.qbank_question:p_qbank_question_control', 'public.qbank_question_chunk:p_qbank_question_chunk_control'];
    A('C3 executor 控制策略在位（0066 控制面不受损）', executorPolicies.every((p) => pols.has(p)));

    console.log(`\n${failures === 0 ? `✓ qbank-control-sec prove ${assertions} 断言全绿` : `✗ ${failures}/${assertions} 失败`}`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    await pool.end();
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
