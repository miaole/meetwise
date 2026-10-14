-- 0201_qbank_fusion_owner_rank_org_dedup.sql — AG39 质量收尾小刀（修法①+②）：RRF 融合层 owner 秩补全（owner_kind
--   additive 出面，应用侧三级稳定排序键 owner_rank→fused_score→refId）+ org 调用方同内容双行内容级去重（NOT EXISTS
--   镜像谓词·org 域孪生可召回则 platform 孪生行让位）。
--
-- REQUEST：ai-docs/delivery/harness/ag39-quality-REQUEST.md（rev3·裁决①-⑦落值行使·pre-exec 双审两席 BOTH PASS+
--   协调方授权开工）。蓝本沿 0187 镜像纪律：**不回改 0001-0188 历史迁移字节**——0176/0187 现行权威体逐字保留后
--   增量叠加（体/谓词/排序/LIMIT 原形零改，仅 SELECT 列面/RETURNS 面加 owner_kind 末列+WHERE 尾加同内容排除谓词）。
--
-- 迁移号改占勘误（协调方裁决·沿母刀 0182+0183→0186+0187 改占先例）：卷 rev2/rev3 原占 0200——0200 已被成本⑤
--   在飞实占（line/ag-cost5 0200_ag08_admission_partition_per_endpoint_seeds.sql·git ls-tree 亲证），协调方改占
--   **0201**（全分支 migrations ls-tree 零占用亲证；0189 全树空号但占之违链单调不占；5B-MIG 0190-0199 十号在飞
--   在前）。应用序前置条件（卷 rev3 R2）：本迁移须在 5B-MIG 0190-0199 与 cost5 0200 merge+apply 之后应用——
--   migrate.ts 账本连续前缀守卫（expectedPrefix 逐位比对）使先应用本号而后前号方到场 →
--   migration_ledger_not_contiguous_prefix fail-closed；缺号本身零敏感（守卫只比 manifest 在场项）。
--
-- 修法①（裁决①行使=案①-A 三级稳定排序键单选·加权形备选不行使）：tf_qbank_generation_ann_search + 薄壳
--   qbank_generation_ann_search（0144 :659-668 RETURNS TABLE 同拍）+ qbank_generation_lexical_search 三函数返回面
--   additive 增 **owner_kind text 末列**。返回类型变更=DROP+CREATE（A12 钉死；临时库实证 CREATE OR REPLACE 增尾列
--   亦被禁 "cannot change return type of existing function"）+ACL 原形重放（0144/0187 现行权威 ACL 逐字重放：
--   tf_→REVOKE PUBLIC+GRANT qbank_control_definer；壳/lexical→REVOKE PUBLIC+GRANT app_role）。体/谓词/排序/LIMIT
--   原形零改——ann 内层前导排序键（embedding 距离 ORDER BY）Ban 零触。应用侧融合层（hybridQbankSearch）排序键改
--   owner_rank（org=0/platform=1，与 0187 外层 ORDER BY CASE 同构）→ fused_score → refId 三级稳定序——**叠序非
--   替代**：库内 owner 谓词与外层 owner 秩零削弱零改动，隔离语义不变，仅融合输出序补全端到端语义。
--   **0187 头注 :29-30 勘误（历史字节零改·以本迁移为准）**：「RRF 融合层不承担优先序」自本迁移起由「融合层承担
--   owner 秩叠序（融合输出序 owner 维度在前）」接替；§5 Ban 库内强制语义不破（融合层只增不削·proof 隔离臂仍以
--   直连函数调用验证库内强制）。
--
-- DROP 依赖摘除/原形重放（0068 candidate 视图 RLS 策略）：四条策略 USING 内 `::regprocedure` 常量对检索函数建
--   pg_depend 跟踪——DROP 函数须先摘策略（p_qbank_source_candidate_view / p_qbank_pool_candidate_view /
--   p_qbank_chunk_candidate_view / p_qbank_generation_candidate_reader），函数重建后**逐字重放 0068 :142-216 原文**
--   （语义零改·regprocedure 重指新 OID=依赖关系原样重建；同 0144/0187 ACL 原形重放先例·策略面只重放不新造）。
--
-- 修法②（裁决②行使=案②-A SQL 谓词排除·取证函数零签名零体变更）：ann/lexical 两函数体增同内容排除谓词——
--   **仅当 owner GUC=org 且当前行为 platform 行**时，同 generation 投影内存在「org 域孪生」（NOT EXISTS 镜像本查询
--   全谓词：同 generation + 同 taxonomy_version + 同 serving_scope_id + visible + candidate 成员（ref_id 单列 join
--   形）+ owner 域；lexical 臂镜像另含 qbank_chunk join 与 @@q.tsq 词项匹配）且 content_hash 相同 → 排除该 platform
--   行；孪生在本查询不可召回则 platform 行存活（防跨 scope 误杀唯一可召回副本）。org 行恒存活（私有优先语义自然
--   结果）。谓词零签名变更（CREATE OR REPLACE 合法面；本迁移与①合流故同拍 DROP+CREATE）。承重面=源级
--   uq_qsrc_active_hash_scoped（0186）+hash 由应用层从正文派生（0029 头注）+单活跃源纪律；qbank_chunk/
--   qbank_generation_chunk 零内容级唯一约束（同 owner 双 refId 行亦可达=登记边界，不属本刀修面）。
--   distances/evidence/question_evidence 取证面**零触**（裁决⑦：取证面 owner 行级谓词零改·无优先序语义；被排除
--   platform 孪生 refId 单独入参仍沿 owner 行级谓词解析其自身证据）。qbank_question curation 展面双行=登记后继
--   （裁决⑦边界）。qbank_source 展面与 uq_qsrc_active_hash_scoped 索引语义零改。
--
-- 缓存键 v5→v6（裁决⑥单跳）：qbank-retrieval-cache.ts CACHE_KEY_VERSION 随本迁移同拍升版——融合排序与折叠语义
--   一变则旧键全量陈旧；零残留论证（版本串内嵌键不可达+TTL 有界自净+fill_intent 旧键行 inert+滚动部署键空间
--   不相交）见卷 §0.2-4。
--
-- 历史迁移 0001-0188 零字节。est live=0：隔离库真迁移链+假体 embedder 全本地可证，零模型外呼。

-- ═════════════════════════════════════════════════════════════════════════════
-- ⓪ DROP 依赖摘除：0068 candidate 视图 RLS 策略四条（函数重建后末节逐字重放）
-- ═════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS p_qbank_source_candidate_view ON qbank_source;
DROP POLICY IF EXISTS p_qbank_pool_candidate_view ON qbank_pool_entry;
DROP POLICY IF EXISTS p_qbank_chunk_candidate_view ON qbank_chunk;
DROP POLICY IF EXISTS p_qbank_generation_candidate_reader ON qbank_generation_chunk;

-- ═════════════════════════════════════════════════════════════════════════════
-- ① tf_ ann 权威体（0187 §② 原形零改 + RETURNS 增 owner_kind 末列 + WHERE 尾增同内容排除谓词）
-- ═════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS public.tf_qbank_generation_ann_search(text, vector, integer);

CREATE FUNCTION public.tf_qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer)
RETURNS TABLE(ref_id text, distance double precision, owner_kind text)
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
       -- 同内容排除（org 调用方专用）：镜像本查询全谓词——同 generation+同 taxonomy_version+serving_scope_id+
       -- visible+candidate 成员（ref_id 单列 join 形）+owner 域；孪生在本查询不可召回则 platform 行存活。
       AND NOT (
         NULLIF(current_setting('app.qbank_owner_kind', true), '') = 'org'
         AND g.owner_kind = 'platform'
         AND EXISTS (
           SELECT 1
             FROM qbank_generation_chunk twin
             JOIN qbank_retrieval_candidate twin_candidate ON twin_candidate.ref_id = twin.ref_id
            WHERE twin.generation_id = g.generation_id
              AND twin.visible
              AND twin.taxonomy_version = g.taxonomy_version
              AND twin.serving_scope_id = g.serving_scope_id
              AND twin.owner_kind = 'org'
              AND twin.org_id = NULLIF(current_setting('app.qbank_org_id', true), '')
              AND twin.content_hash = g.content_hash
         )
       )
     ORDER BY g.embedding <=> p_embedding
     LIMIT (SELECT greatest(k * 8, 40) FROM requested)
  )
  SELECT a.ref_id, a.dist::double precision, a.owner_kind
    FROM ann a
   ORDER BY (CASE WHEN a.owner_kind = 'org' THEN 0 ELSE 1 END), a.dist
   LIMIT (SELECT k FROM requested)
$$;
REVOKE ALL ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tf_qbank_generation_ann_search(text, vector, integer) TO qbank_control_definer;

-- ═════════════════════════════════════════════════════════════════════════════
-- ② 薄壳同拍（0144 :659-668 原形零改 + RETURNS TABLE 增 owner_kind 末列·DROP+CREATE+ACL 重放）
-- ═════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS qbank_generation_ann_search(text, vector, integer);

CREATE FUNCTION qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer)
RETURNS TABLE(ref_id text, distance double precision, owner_kind text)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
  SET hnsw.iterative_scan = 'strict_order'
AS $$
  SELECT * FROM public.tf_qbank_generation_ann_search(p_generation, p_embedding, p_k)
$$;
REVOKE ALL ON FUNCTION qbank_generation_ann_search(text, vector, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_ann_search(text, vector, integer) TO app_role;

-- ═════════════════════════════════════════════════════════════════════════════
-- ③ lexical 权威体（0187 §③ 原形零改 + RETURNS 增 owner_kind 末列 + WHERE 尾增同内容排除谓词·
--    镜像另含 qbank_chunk join 与 @@q.tsq 词项匹配）
-- ═════════════════════════════════════════════════════════════════════════════

DROP FUNCTION IF EXISTS qbank_generation_lexical_search(text, text, integer);

CREATE FUNCTION qbank_generation_lexical_search(p_generation text, p_query text, p_k integer)
RETURNS TABLE(ref_id text, lexical_score double precision, owner_kind text)
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
  SELECT g.ref_id, ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq)::double precision, g.owner_kind
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
     -- 同内容排除（org 调用方专用）：镜像本查询全谓词（candidate 成员单列 join+qbank_chunk join+@@q.tsq 词项匹配）。
     AND NOT (
       NULLIF(current_setting('app.qbank_owner_kind', true), '') = 'org'
       AND g.owner_kind = 'platform'
       AND EXISTS (
         SELECT 1
           FROM qbank_generation_chunk twin
           JOIN qbank_chunk twin_chunk ON twin_chunk.ref_id = twin.ref_id
           JOIN qbank_retrieval_candidate twin_candidate ON twin_candidate.ref_id = twin.ref_id
          WHERE twin.generation_id = g.generation_id
            AND twin.visible
            AND twin.taxonomy_version = g.taxonomy_version
            AND twin.serving_scope_id = g.serving_scope_id
            AND twin.owner_kind = 'org'
            AND twin.org_id = NULLIF(current_setting('app.qbank_org_id', true), '')
            AND twin.content_hash = g.content_hash
            AND q.tsq <> ''::tsquery
            AND to_tsvector('simple', qbank_search_terms(twin_chunk.content)) @@ q.tsq
       )
     )
   ORDER BY (CASE WHEN g.owner_kind = 'org' THEN 0 ELSE 1 END),
            ts_rank_cd(to_tsvector('simple', qbank_search_terms(ch.content)), q.tsq) DESC, g.ref_id
   LIMIT (SELECT k FROM requested)
$$;
REVOKE ALL ON FUNCTION qbank_generation_lexical_search(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_lexical_search(text, text, integer) TO app_role;

-- ═════════════════════════════════════════════════════════════════════════════
-- ④ 0068 candidate 视图 RLS 策略原形重放（0068 :142-216 逐字·regprocedure 重指新 OID·语义零改）
-- ═════════════════════════════════════════════════════════════════════════════

CREATE POLICY p_qbank_source_candidate_view ON qbank_source FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user = (SELECT pg_get_userbyid(relowner)
                      FROM pg_class
                     WHERE oid='qbank_retrieval_candidate'::regclass)
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );
CREATE POLICY p_qbank_pool_candidate_view ON qbank_pool_entry FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user = (SELECT pg_get_userbyid(relowner)
                      FROM pg_class
                     WHERE oid='qbank_retrieval_candidate'::regclass)
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );
CREATE POLICY p_qbank_chunk_candidate_view ON qbank_chunk FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user = (SELECT pg_get_userbyid(relowner)
                      FROM pg_class
                     WHERE oid='qbank_retrieval_candidate'::regclass)
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );
CREATE POLICY p_qbank_generation_candidate_reader ON qbank_generation_chunk FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );
