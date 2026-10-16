-- 0187_qbank_owner_scoped_retrieval.sql — AG39 企业私有题库（修法②）：五函数镜像扩 owner 维度库内强制过滤+私有优先排序。
--
-- REQUEST：ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md（rev4·裁决②③⑧行使落值）。README 用户决策原文：
--   「检索函数内强制过滤——不要只靠应用层传参：SECURITY DEFINER 检索函数按场景在库内强制（C 端练习
--   owner_kind=platform；企业岗位面试 (owner_kind=org AND org_id=本场企业) OR owner_kind=platform·并按私有优先
--   排序（org 行排在 platform 之前））」。
--
-- 镜像纪律（qsec 刀卷原语义）：**不回改 0106/0144/0146/0176 历史原文**——本迁移 CREATE OR REPLACE 0176 现行权威体
--   （0176:118-337），signature/属主/SECURITY DEFINER/SET search_path（tf_ 另含 hnsw.iterative_scan=strict_order）
--   逐字保留；五函数 ACL 读面逐字镜像重申（0176:339-349·app_role 读面不动）；断言助手 INVOKER 形+两受者
--   GRANT 镜像重申（0176:118-135·非 SECURITY DEFINER=不触 principal.ts manifest unexpected_definer_function_count=0 门）。
--
-- owner GUC 契约（裁决③行使）：两枚 app.qbank_owner_kind / app.qbank_org_id（沿 setServingScope 同形 SET LOCAL
--   事务级）。C 端=owner_kind=platform+org_id 空；B 端=owner_kind=org+org_id=本场企业。owner GUC 系**查询参数**
--   （过滤值）非鉴权根——执行授权边界=EXECUTE grant 维持不动（0066:90-93 doctrine 原文·§5 Ban 分界）。
--
-- 断言语义（rev4 P2-c/P2-e 钉死）：owner 维度**并入** qbank_assert_retrieval_scope 助手——0176 serving 双空判定
--   **先行**（顺序不动），owner 缺失/半缺/非法组合随后 RAISE，message 恒等 'qbank_retrieval_scope_missing'、
--   ERRCODE 'check_violation'(23514)——既有断言面（qbank-control-sec tryCall B1-B5 臂 code 等值+message includes、
--   rag04 :331-332 '23514|' 前缀+includes）零翻。org_id 空串与 NULL 同义（NULLIF 归一）——platform+空 恒为合法
--   组合（裁决⑧ setup 补 GUC 形 owner_kind='platform'+org_id='' 借此既过助手又不违列 CHECK platform→org_id IS NULL）；
--   org 缺 org_id=半缺→RAISE；platform+非空 org_id=非法组合→RAISE；kind 第三值→RAISE。**绝不静默降级 platform**。
--
-- 私有优先排序落位（裁决②行使·rev2 E4+N2 钉死）：owner 谓词入内层 WHERE（0176:157-161 谓词区同位——
--   **禁入 ann 内层前导排序键**：内层 ORDER BY embedding 距离（0176:162）原形维持，废索引辅助且贴算法改动边）+
--   owner 秩入外层 ORDER BY（0176:167 外层 dist 排序处增 owner 秩先序：org=0 / platform=1）。如实登记：
--   ann 内层 LIMIT greatest(k*8,40)（0176:163）截断先于外层 owner 秩——org 候选稀少时召回不足属**质量**非隔离
--   （隔离由内层 owner 谓词保证·与召回率正交）。lexical 同形（owner 秩先于词频排序）。distances/evidence/
--   question_evidence 无优先序语义（按请求 ref 序/命中秩取证）只加 owner 行级谓词。RRF 融合层（应用侧
--   hybridQbankSearch）不承担优先序——其位置分继承 SQL 已排序行序，§5 Ban 库内强制语义不破。
--
-- 行级 owner 谓词（五函数同一形·与 helper 断言互为纵深）：
--   g.owner_kind='platform' OR (g.owner_kind='org' AND g.org_id=NULLIF(current_setting('app.qbank_org_id',true),''))
--   C 端（kind=platform+org 空）：platform 行放行；org 行 org_id=NULL 比较恒假不放行 → C 端禁企业私有**落列同拍生效**。
--   B 端（kind=org+org_id=A）：platform 行放行（公共补足）+org A 行放行（私有）+org B 行不放行 → 跨租户零泄漏。
-- 历史迁移 0001-0186 零字节。

-- ═════════════════════════════════════════════════════════════════════════════
-- ① 断言助手：0176 serving 双空判定先行 + owner 维度并入（INVOKER·非 SD·message 恒等）
-- ═════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION qbank_assert_retrieval_scope() RETURNS boolean
  LANGUAGE plpgsql
  STABLE
  SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner_kind text;
  v_org_id text;
BEGIN
  -- 0176:124-127 原断言（serving 双空判定先行·顺序不动）：双空 → RAISE。
  IF NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NULL
     AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NULL THEN
    RAISE EXCEPTION 'qbank_retrieval_scope_missing' USING ERRCODE='check_violation';
  END IF;
  -- AG39 owner 维度：空串与 NULL 同义（NULLIF 归一·P2-e）。缺失 / kind 第三值 / org 半缺 / platform 带非空 org_id
  -- 一律 fail-closed，message/code 与 serving 双空场景恒等（P2-c 断言面兼容）——绝不静默降级 platform。
  v_owner_kind := NULLIF(current_setting('app.qbank_owner_kind', true), '');
  v_org_id := NULLIF(current_setting('app.qbank_org_id', true), '');
  IF v_owner_kind IS NULL
     OR (v_owner_kind <> 'platform' AND v_owner_kind <> 'org')
     OR (v_owner_kind = 'org' AND v_org_id IS NULL)
     OR (v_owner_kind = 'platform' AND v_org_id IS NOT NULL) THEN
    RAISE EXCEPTION 'qbank_retrieval_scope_missing' USING ERRCODE='check_violation';
  END IF;
  RETURN true;
END;
$$;
-- 0176:131-135 两受者镜像重申：REVOKE PUBLIC 后仅授迁移身份上下文（属主）与 qbank_control_definer。
REVOKE ALL ON FUNCTION qbank_assert_retrieval_scope() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_assert_retrieval_scope() TO qbank_control_definer;

-- ═════════════════════════════════════════════════════════════════════════════
-- ② tf_ ann 权威体镜像（0176:137-169 逐字+owner 谓词入内层 WHERE+owner 秩入外层 ORDER BY）
-- ═════════════════════════════════════════════════════════════════════════════

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
    SELECT g.ref_id, g.owner_kind, g.embedding <=> p_embedding AS dist
      FROM active a
      JOIN qbank_generation_chunk g ON g.generation_id=a.generation_id AND g.visible
      JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id
     WHERE (SELECT qbank_assert_retrieval_scope())
       AND NULLIF(current_setting('app.qbank_serving_scope', true), '') IS NOT NULL
       AND NULLIF(current_setting('app.qbank_taxonomy_version', true), '') IS NOT NULL
       AND g.taxonomy_version = NULLIF(current_setting('app.qbank_taxonomy_version', true), '')
       AND g.serving_scope_id = NULLIF(current_setting('app.qbank_serving_scope', true), '')
       AND (g.owner_kind = 'platform'
            OR (g.owner_kind = 'org'
                AND g.org_id = NULLIF(current_setting('app.qbank_org_id', true), '')))
     ORDER BY g.embedding <=> p_embedding
     LIMIT (SELECT greatest(k * 8, 40) FROM requested)
  )
  SELECT a.ref_id, a.dist::double precision
    FROM ann a
   ORDER BY (CASE WHEN a.owner_kind = 'org' THEN 0 ELSE 1 END), a.dist
   LIMIT (SELECT k FROM requested)
$$;
REVOKE ALL ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) TO qbank_control_definer;

-- ═════════════════════════════════════════════════════════════════════════════
-- ③ lexical 权威体镜像（0176:173-206 逐字+owner 谓词+owner 秩先序）
-- ═════════════════════════════════════════════════════════════════════════════

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
     AND (g.owner_kind = 'platform'
          OR (g.owner_kind = 'org'
              AND g.org_id = NULLIF(current_setting('app.qbank_org_id', true), '')))
   ORDER BY (CASE WHEN g.owner_kind = 'org' THEN 0 ELSE 1 END),
            ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq) DESC, g.ref_id
   LIMIT (SELECT k FROM requested)
$$;

-- ═════════════════════════════════════════════════════════════════════════════
-- ④ distances 权威体镜像（0176:208-237 逐字+owner 行级谓词·无优先序语义）
-- ═════════════════════════════════════════════════════════════════════════════

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
     AND (g.owner_kind = 'platform'
          OR (g.owner_kind = 'org'
              AND g.org_id = NULLIF(current_setting('app.qbank_org_id', true), '')))
$$;

-- ═════════════════════════════════════════════════════════════════════════════
-- ⑤ evidence 权威体镜像（0176:239-270 逐字+owner 行级谓词·ORDER BY input.ord 原形维持）
-- ═════════════════════════════════════════════════════════════════════════════

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
     AND (g.owner_kind = 'platform'
          OR (g.owner_kind = 'org'
              AND g.org_id = NULLIF(current_setting('app.qbank_org_id', true), '')))
   ORDER BY input.ord
$$;

-- ═════════════════════════════════════════════════════════════════════════════
-- ⑥ question_evidence 权威体镜像（0176:272-337 逐字+owner 谓词入 all_parts 内层 WHERE）
-- ═════════════════════════════════════════════════════════════════════════════

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
       AND (g.owner_kind = 'platform'
            OR (g.owner_kind = 'org'
                AND g.org_id = NULLIF(current_setting('app.qbank_org_id', true), '')))
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

-- ═════════════════════════════════════════════════════════════════════════════
-- ⑦ ACL 读面逐字镜像重申（0176:339-349·app_role 读面不动）
-- ═════════════════════════════════════════════════════════════════════════════

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
