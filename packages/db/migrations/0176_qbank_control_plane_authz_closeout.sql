-- 0176_qbank_control_plane_authz_closeout.sql — qbank 控制面鉴权收口小刀（AG-41 全部+AG-42 五函数+AG-43 调度半前置+P5 缺号项）。
--
-- 蓝本=ai-docs/delivery/harness/qbank-control-sec-REQUEST.md（pre-exec 双审 BOTH PASS+协调方常设 loop 授权·五裁决项
-- 按卷 §8 推荐形行使）。历史迁移 0001-0169+0174 零字节（镜像纪律：只加新迁移，不回改 0066/0067/0106/0144/0146 原文；
-- 编号避撞刀 B 0174 已落/刀 C 0175 计划，本刀=0176）。四件修法：
--
-- ① AG-41 收口（0146 释放函数复活 GUC 鉴权）：REVOKE app_role+GRANT qbank_control_executor（沿 0066:162-165 同族手术形，
--    「executable grant is the authorization boundary」=0066:90-93 doctrine 原文）+函数内守卫 1 由
--    current_setting('app.principal_user')='__system_qbank__' GUC 断言替换为 definer 白名单断言
--    （0070:20-38/0144:674-701 白名单族形：SD 体内 current_user=函数属主，白名单=15 控制面函数属主集合；
--    principal.ts:985-986 doctrine 自认该 GUC 系 tenant-routing context 非 cryptographic identity root，
--    asPrincipal（principal.ts:991-998）本身即可自设——伪造 GUC 不再构成授权根）。
--    裁决项⑥=definer 断言形（非纯执行边界形）。裁决项⑤=failed 代 epoch 守卫【豁免+登记】：守卫 4 维持 retired-only
--    （0146:43 原形）——failed 代无重激活路径（重激活系 retired 专属）、非回滚资产、epoch 守卫语义（回滚窗口）不适用，
--    且调度半（AG-43）启用后 failed 半成品须可释放，补齐会使「构建失败同代」永挂；dbhy1 P5-12 臂维持原值。
--    【生产可操作性如实登记】（不改变本迁移行为，部署面注记）：qbank_release_retired_generation_storage 不在
--    QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST（principal.ts 本卷零字节）——provision 后属主=迁移登录，
--    非 15 白名单属主成员 → 守卫 1 显式拒绝（fail-closed 提前于 DETACH，且比原 GUC 门少一个伪造面）；
--    把释放函数纳管 manifest（属主转 qbank_control_definer）系后继刀面（直接 ALTER 属主会撞
--    assertQbankControlDefinerOwnership 的 unexpected_definer_function_count=0 门，本卷不碰）。
--    隔离库（迁移身份属主全函数）下守卫 1 恒过，调度半 proof 走 executor 路径可端到端验证。
-- ② AG-42 五函数删双空放行（裁决项①=形 A 双空报错）：ann（现行权威体在 0144 tf_ 触发器函数内·薄壳 delegator
--    零改）+lexical/distances/evidence/question_evidence（0106 体）——两 GUC 经 NULLIF 后皆空即
--    RAISE 'qbank_retrieval_scope_missing'（0124 rag_acl_principal_missing fail-closed 先例形；SQL 体 plpgsql 化，
--    CREATE OR REPLACE 换 LANGUAGE 已实测可行·ACL/属主/proconfig 原样保留）。
--    ERRCODE='check_violation'（23514·0124 rag_binding_invalid 同族+0146 守卫族同码）——**不占 42501**：
--    qbank-handoff-closure.proof 以「有 EXECUTE 后任何非 42501 结果=业务错误非权限洞」为 ACL 判据，
--    用 42501 会把 scope 缺失误伤成 ACL 拒绝。半边语义不变（仅设其一→0 行·rag04 fail-closed 半边臂在场）。
--    五函数 ACL 读面逐字镜像重申（0106:280-289+0144:648/:716·app_role 读面不动——本刀只收控制面）；
--    signature/owner/SECURITY DEFINER/SET search_path（tf_ 另含 hnsw.iterative_scan=strict_order）逐字保留。
-- ③ AG-43 调度半（Ban 解除呈报）：0146:9「Ban 自动清理调度」系设计内 Ban，由协调方本刀派单**明示解除**
--    （裁决项③落值·本迁移不回改 0146 原文）；受控调度面=worker 常驻 reconciler（apps/worker/src/qbank-release-sweep.ts，
--    QBANK_RELEASE_SWEEP_ENABLED 缺省 false+INTERVAL_MS 缺省按天·沿 USAGE_CALIBRATION_ENABLED 双旋钮先例），
--    本迁移只负责把执行权收进 executor。未释放代打点由调度拍结构化日志承载（main.ts:292/:310 形）。
-- ④ P5 缺号项（裁决项④按卷推荐=清理形）：DROP 九支遗留 GUC 策略（0013:63/:70/:75 三支+0029:45/:48 两支
--    +0031:21/:23/:40/:42 四支·E1 勘误后九名完备）。**真空收口**：四表 ENABLE+FORCE RLS 维持+executor 控制策略
--    （0066:72-90）在位+request 角色 0066:22-25/0067:39-44 零表权限 → 策略清零后 RLS 默认拒绝；
--    未来任何 re-GRANT 撞「无适用策略=默认拒」，不再复活「伪造 GUC 即读写」面（qbank_is_curator 本体 0013:32-35
--    留置=manifest 成员 0086 封印，仅成孤儿不再被策略引用）。如实越界注记：0029:119/:121 qbank_vector_generation
--    的 p_qbank_generation_read（USING(true)）/:121 write（GUC='__system_qbank__'）两支**不在卷枚举九支内**
--    （§1.4 枚举完备+与 0146 释放函数 UPDATE 的 RLS 语义纠缠，卷已排除）——本卷不动，后继刀另裁。

-- ═════════════════════════════════════════════════════════════════════════════
-- ① AG-41：qbank_release_retired_generation_storage —— 0146:15-59 逐字镜像·仅守卫 1 替换
-- ═════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION qbank_release_retired_generation_storage(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE suffix text; tab text; st text; snap_epoch bigint; now_epoch bigint; active_gen text; released timestamptz;
BEGIN
  -- 守卫 1：definer 白名单断言（0070:20-38/0144:674-701 白名单族形·裁决项⑥）——替换 0146:22-25 的
  -- app.principal_user GUC 断言。SD 体内 current_user=本函数属主；白名单=15 控制面函数属主集合
  -- （tf_is_generation_control_definer 调用时动态解析 pg_proc）。伪造 GUC 不再构成授权根；
  -- 执行授权边界=下方 REVOKE/GRANT（executor-only）。
  IF NOT public.tf_is_generation_control_definer() THEN
    RAISE EXCEPTION 'qbank_release_storage_definer_required' USING ERRCODE='insufficient_privilege';
  END IF;
  -- 守卫 2：目标代必须已终结（retired/failed）；building/validated/active 一律拒绝
  SELECT state, source_epoch, storage_released_at INTO st, snap_epoch, released
    FROM qbank_vector_generation WHERE id=p_generation FOR UPDATE;
  IF st IS NULL THEN
    RAISE EXCEPTION 'unknown qbank generation' USING ERRCODE='check_violation';
  END IF;
  IF st NOT IN ('retired','failed') THEN
    RAISE EXCEPTION 'qbank generation storage can only be released for retired/failed generations (state=%)', st USING ERRCODE='check_violation';
  END IF;
  -- 守卫 3：目标代 ≠ 当前 active 指针（state 守卫已含 active·此处双保险）
  SELECT generation_id INTO active_gen FROM qbank_active_generation WHERE singleton;
  IF active_gen = p_generation THEN
    RAISE EXCEPTION 'cannot release the active qbank generation' USING ERRCODE='check_violation';
  END IF;
  -- 守卫 4：回滚窗口已死——corpus epoch 已前进过该代的 source_epoch（activate 本会抛 serialization_failure·0029:354；
  -- 语料未前进时旧代仍是同 epoch 下的回滚资产，不许释放）。裁决项⑤=豁免形：维持 retired-only（0146:43 原形），
  -- failed 代无 epoch 守卫（无重激活路径·非回滚资产·调度半须可释放 failed 半成品——登记见文件头）。
  SELECT epoch INTO now_epoch FROM qbank_corpus_epoch WHERE singleton FOR SHARE;
  IF st = 'retired' AND snap_epoch >= now_epoch THEN
    RAISE EXCEPTION 'corpus epoch has not advanced past generation source_epoch; rollback window still open' USING ERRCODE='check_violation';
  END IF;
  -- 守卫 5：幂等门——已释放过即拒绝（防二次 DETACH 撞不存在的分区名）
  IF released IS NOT NULL THEN
    RAISE EXCEPTION 'qbank generation storage already released at %', released USING ERRCODE='check_violation';
  END IF;

  -- 分区名派生复用 prepare 的确定性规则（0029:201·不信任请求参数作 identifier）
  suffix := replace(substr(p_generation, 6), '-', '');
  tab := 'qbank_generation_chunk_' || suffix;
  -- DETACH+DROP 不逐行触发 row trigger；HNSW partial index 随表自动落
  EXECUTE format('ALTER TABLE qbank_generation_chunk DETACH PARTITION %I', tab);
  EXECUTE format('DROP TABLE %I', tab);
  -- 元数据行永不抹（发布审计面）；仅落释放时间戳
  UPDATE qbank_vector_generation SET storage_released_at=clock_timestamp() WHERE id=p_generation;
END;
$$;
-- 0066:162-165 同族手术形：executor-only（原 0146:61-62 的 GRANT app_role 收回）
REVOKE ALL ON FUNCTION qbank_release_retired_generation_storage(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION qbank_release_retired_generation_storage(text) TO qbank_control_executor;

-- ═════════════════════════════════════════════════════════════════════════════
-- ② AG-42 形 A：五函数双空放行分支→报错（qbank_retrieval_scope_missing·check_violation）
--    ann=0144:625-653 tf_ 体逐字镜像（薄壳 delegator 0144:655-667 零改）；余四=0106 体逐字镜像。
--    【语言面如实登记】五函数保持 LANGUAGE sql（0144/0106 原样）——plpgsql 化会丢 SQL 函数内联性，
--    rag03-hnsw-completeness.proof 的 substituted-body EXPLAIN 机制与 HNSW 索引路径实测被破坏
--    （EXEC 实证：plpgsql 版基线对照基线同门 EXIT 1→0 反差）。故双空硬闸由一次性标量断言助手承载：
--    qbank_assert_retrieval_scope()（INVOKER·plpgsql·非 SECURITY DEFINER=不触
--    assertQbankControlDefinerOwnership 的 unexpected_definer_function_count=0 门·0106:14-21 manifest
--    纪律只封印 SD 新对象）——WHERE 首位非相关标量子查询=InitPlan 拍前一次性求值（空集同样可靠触发），
--    触发即 RAISE。半边语义不变（仅设其一→WHERE 不匹配→0 行·rag04 fail-closed 半边臂在场）。
--    五函数 ACL 读面逐字镜像重申（0106:280-289+0144:648/:716·app_role 读面不动）；
--    signature/owner/SECURITY DEFINER/SET search_path（tf_ 另含 hnsw.iterative_scan=strict_order）逐字保留。
--
--    RAISE 形沿 0124 rag_acl_principal_missing 先例（fail-closed 报错）；ERRCODE='check_violation'
--    （23514·0124 rag_binding_invalid 同族+0146 守卫族同码）——**不占 42501**：qbank-handoff-closure.proof
--    以「有 EXECUTE 后任何非 42501 结果=业务错误非权限洞」为 ACL 判据，用 42501 会把 scope 缺失误伤成 ACL 拒绝。

CREATE OR REPLACE FUNCTION qbank_assert_retrieval_scope() RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SET search_path = public, pg_temp
AS $$
BEGIN
  IF NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NULL
     AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NULL THEN
    RAISE EXCEPTION 'qbank_retrieval_scope_missing' USING ERRCODE='check_violation';
  END IF;
  RETURN true;
END;
$$;
-- 只在五函数 definer 上下文内求值：REVOKE PUBLIC 后仅授两受者=该上下文的两个可能身份——
-- 迁移身份（属主·pre-provision/隔离库）与 qbank_control_definer（provision 后 manifest 函数属主转此·
-- 0144 DO 块已按供给同形态幂等确保存在）。app_role/executor 永不成为五函数 definer 上下文，不受者。
REVOKE ALL ON FUNCTION qbank_assert_retrieval_scope() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_assert_retrieval_scope() TO qbank_control_definer;

CREATE OR REPLACE FUNCTION public.tf_qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer)
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SET search_path = public, pg_temp
  SET hnsw.iterative_scan = 'strict_order'
AS $$
  WITH requested AS (
    SELECT greatest(1, least(coalesce(p_k, 1), 50))::integer AS k
  ), active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), ann AS (
    SELECT g.ref_id, g.embedding <=> p_embedding AS dist
      FROM active a
      JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
      JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
     WHERE (SELECT qbank_assert_retrieval_scope())
       AND NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
       AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
       AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
       AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
     ORDER BY g.embedding <=> p_embedding
     LIMIT (SELECT greatest(k * 8, 40) FROM requested)
  )
  SELECT a.ref_id, a.dist::double precision
    FROM ann a
   ORDER BY a.dist
   LIMIT (SELECT k FROM requested)
$$;
REVOKE ALL ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) TO qbank_control_definer;

CREATE OR REPLACE FUNCTION qbank_generation_lexical_search(p_generation text, p_query text, p_k integer)
RETURNS TABLE(ref_id text, lexical_score double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH requested AS (
    SELECT greatest(1, least(coalesce(p_k, 1), 200))::integer AS k
  ), active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), q AS (
    SELECT plainto_tsquery('simple', qbank_search_terms(left(coalesce(p_query,''), 12000))) AS tsq
  )
  SELECT g.ref_id, ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq)::double precision
    FROM active a
    JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
    JOIN qbank_chunk ch ON ch.ref_id=g.ref_id
    JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
    CROSS JOIN q
   WHERE q.tsq <> ''::tsquery
     AND to_tsvector('simple', qbank_search_terms(ch.content)) @@ q.tsq
     AND (SELECT qbank_assert_retrieval_scope())
     AND NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
     AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
     AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
     AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
   ORDER BY ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq) DESC, g.ref_id
   LIMIT (SELECT k FROM requested)
$$;

CREATE OR REPLACE FUNCTION qbank_generation_distances(p_generation text, p_embedding vector, p_refs text[])
RETURNS TABLE(ref_id text, distance double precision)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), requested AS (
    SELECT input.req_ref_id AS ref_id, input.ord
      FROM unnest(coalesce(p_refs, ARRAY[]::text[])) WITH ORDINALITY AS input(req_ref_id, ord)
     ORDER BY ord
     LIMIT 200
  )
  SELECT g.ref_id, (g.embedding <=> p_embedding)::double precision
    FROM active a
    JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
    JOIN requested input ON input.ref_id=g.ref_id
    JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
   WHERE (SELECT qbank_assert_retrieval_scope())
     AND NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
     AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
     AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
     AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
$$;

CREATE OR REPLACE FUNCTION qbank_generation_evidence(p_generation text, p_refs text[], p_chars integer)
RETURNS TABLE(ref_id text, excerpt text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), requested AS (
    SELECT input.req_ref_id AS ref_id, input.ord
      FROM unnest(coalesce(p_refs, ARRAY[]::text[])) WITH ORDINALITY AS input(req_ref_id, ord)
     ORDER BY ord
     LIMIT 50
  )
  SELECT input.ref_id, left(ch.content, greatest(1, least(coalesce(p_chars, 1), 1200)))
    FROM requested input
    JOIN active a ON true
    JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.ref_id=input.ref_id AND g.visible
    JOIN qbank_chunk ch ON ch.ref_id=g.ref_id
    JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
   WHERE (SELECT qbank_assert_retrieval_scope())
     AND NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
     AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
     AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
     AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
   ORDER BY input.ord
$$;

CREATE OR REPLACE FUNCTION qbank_generation_question_evidence(
  p_generation text, p_hit_refs text[], p_chars integer
) RETURNS TABLE(question_id text, hit_rank integer, evidence jsonb)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH active AS (
    SELECT a.generation_id
      FROM qbank_active_generation a
      JOIN qbank_vector_generation generation
        ON generation.id=a.generation_id AND generation.state='active'
     WHERE a.singleton=true AND a.generation_id=p_generation
  ), hit AS (
    SELECT input.req_ref_id AS ref_id, input.ord::integer AS hit_rank
      FROM unnest(coalesce(p_hit_refs, ARRAY[]::text[])) WITH ORDINALITY AS input(req_ref_id, ord)
     ORDER BY input.ord
     LIMIT 50
  ), selected AS (
    SELECT qc.question_id, min(hit.hit_rank) AS hit_rank
      FROM hit
      JOIN qbank_question_chunk qc ON qc.ref_id=hit.ref_id
      JOIN qbank_question q ON q.id=qc.question_id AND q.state='published'
     GROUP BY qc.question_id
  ), expected AS (
    SELECT question_id, count(*)::integer AS mapped_count
      FROM qbank_question_chunk
     GROUP BY question_id
  ), all_parts AS (
    SELECT selected.question_id, selected.hit_rank, qc.ref_id, qc.role, qc.ordinal, qc.required,
           left(ch.content, greatest(1, least(coalesce(p_chars, 1), 800))) AS excerpt
      FROM selected
      JOIN qbank_question_chunk qc ON qc.question_id=selected.question_id
      JOIN active a ON true
      JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.ref_id=qc.ref_id AND g.visible
      JOIN qbank_chunk ch ON ch.ref_id=qc.ref_id
      JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=ch.ref_id AND candidate.content_hash=ch.content_hash
     WHERE NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
       AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
       AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
       AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
  ), complete AS (
    SELECT question_id, min(hit_rank) AS hit_rank,
           count(*)::integer AS returned_count,
           count(*) FILTER (WHERE role='prompt') AS prompt_count,
           count(*) FILTER (WHERE role='rubric') AS rubric_count,
           count(*) FILTER (WHERE required) AS required_count,
           jsonb_agg(jsonb_build_object(
             'refId', ref_id, 'role', role, 'ordinal', ordinal, 'required', required, 'excerpt', excerpt
           ) ORDER BY CASE role
             WHEN 'prompt' THEN 0 WHEN 'rubric' THEN 1 WHEN 'follow_up' THEN 2
             WHEN 'example' THEN 3 WHEN 'anti_pattern' THEN 4 ELSE 5 END, ordinal, ref_id) AS evidence
      FROM all_parts
     GROUP BY question_id
  )
  SELECT complete.question_id, complete.hit_rank, complete.evidence
    FROM complete
    JOIN expected ON expected.question_id=complete.question_id
   WHERE (SELECT qbank_assert_retrieval_scope())
     AND complete.returned_count=expected.mapped_count
     AND complete.prompt_count=1
     AND complete.rubric_count>=1
     AND complete.required_count>=2
   ORDER BY complete.hit_rank, complete.question_id
$$;

-- ACL 读面逐字镜像重申（0106:280-289·app_role 读面不动）
REVOKE ALL ON FUNCTION qbank_generation_ann_search(text, vector, integer),
  qbank_generation_lexical_search(text, text, integer),
  qbank_generation_distances(text, vector, text[]),
  qbank_generation_evidence(text, text[], integer),
  qbank_generation_question_evidence(text, text[], integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_ann_search(text, vector, integer),
  qbank_generation_lexical_search(text, text, integer),
  qbank_generation_distances(text, vector, text[]),
  qbank_generation_evidence(text, text[], integer),
  qbank_generation_question_evidence(text, text[], integer) TO app_role;

-- ═════════════════════════════════════════════════════════════════════════════
-- ④ P5：九支遗留 GUC 策略清理（真空收口——RLS+FORCE 维持·re-GRANT 撞默认拒绝）
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS p_src_read ON qbank_source;
DROP POLICY IF EXISTS p_src_propose ON qbank_source;
DROP POLICY IF EXISTS p_src_review ON qbank_source;
DROP POLICY IF EXISTS p_qbank_chunk_read ON qbank_chunk;
DROP POLICY IF EXISTS p_qbank_chunk_insert ON qbank_chunk;
DROP POLICY IF EXISTS p_qbank_question_read ON qbank_question;
DROP POLICY IF EXISTS p_qbank_question_write ON qbank_question;
DROP POLICY IF EXISTS p_qbank_question_chunk_read ON qbank_question_chunk;
DROP POLICY IF EXISTS p_qbank_question_chunk_write ON qbank_question_chunk;
