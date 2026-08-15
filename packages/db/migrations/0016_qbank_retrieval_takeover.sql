-- 0016_qbank_retrieval_takeover.sql — 生产检索接管:堵死 qbank 跨租户投毒的**残留直写洞 + 直读旁路**。
--
-- 背景/威胁模型:0013 建了策展源审核门(qbank_source 状态机 + qbank_pool_entry 受审旁路 + qbank_retrieval_candidate
--   approved-only 视图),但**生产检索仍绕过它**:
--     ① 直写洞:0001_baseline 冻结的 vector_chunk 写策略只校 owner=principal(对 kind='qbank' 无限制)——
--        任何用户能 INSERT 一条 owner=自己、kind='qbank' 的块,全员检索 qbank 都命中 → 直写投毒。
--        (且旧单条 FOR ALL 策略的 USING 含 'kind=qbank' 公共读,泄漏到 DELETE/UPDATE 行选择 → 任意用户可删/劫持共享题库。)
--     ② 直读旁路:annSearch(kind='qbank') 直读 vector_chunk,不与受审集求交、不限系统 owner。
--   本迁移把这些洞在生产库堵死(0001_baseline 是冻结快照不可改,故收紧必须以增量迁移表达)。
--
-- 本迁移做四件事(与 sql/06_retrieval.sql 的源真值一致):
--   ① 按命令拆 vector_chunk 策略:读=系统 owner 的 qbank 公共读/其余(含残留投毒)限己;增改删=仅本人非 qbank 行 或 系统灌库 principal 的 qbank 行。
--      (关键:DELETE/UPDATE 只看 USING;旧策略把 qbank 公共读混进 USING → 共享题库可被任意用户清空/劫持,本迁移分治堵死。)
--   ② 建 ref_id 索引:支撑 annSearch(qbank) 与可信可见集(qbank_visible_ref)按 ref_id 求交。
--   ③ 建"可信可见"定谓视图 qbank_visible_ref:annSearch(qbank) 只召回它 ∩ 系统 owner——两条泾渭分明的可见通道之并:
--        (a) approved 策展池:qbank_pool_entry ⋈ qbank_source(status='approved')——撤销源即时移出 → 立刻不再召回;
--        (b) 可信系统灌库块:owner='__system_qbank__' 且 ref_id 未纳入任何池条目(直灌题库常规通道,不受策展治理)。
--      非系统 principal 写入的残留/历史 qbank 块(既非 approved 池、又非系统 owner)一律不在可见集,且 annSearch 再叠一层
--      owner='__system_qbank__' 过滤 → 即便投毒块 ref_id 撞上某可见 ref,其攻击者向量也不会被 JOIN 带出(读侧投毒闭合)。
--   ④ 强断言视图属主可绕 RLS:见下"关键前置"。
--
-- 关键前置(务必知悉,曾是隐性 landmine):(b) 的 `NOT EXISTS(池条目)` 要正确排除"已撤销但仍系统 owner"的策展块,
--   必须能看到**被撤销源**的池条目;而 qbank_pool_entry 是 FORCE RLS + p_pool_read 只暴露 approved 源条目(0013)。
--   视图 security_invoker=false 以属主执行,但 FORCE RLS 连属主也管——只有 rolsuper/rolbypassrls 的属主才真正绕过。
--   若属主不具该权(如托管 PG 的非超级迁移账号),(b) 会漏召回被撤销块 → 撤销失效、投毒复活。故本迁移在建视图后
--   **硬断言属主 rolsuper OR rolbypassrls,不满足则迁移失败(fail-closed,绝不静默泄漏)**。诚实缺口:这把"撤销正确性"
--   钉在"迁移/视图属主可绕 RLS"这一部署前置上;若目标环境无法授予 bypassrls,须改走"策展块用独立 owner、(b) 纯 owner 判定"
--   的免超级用户方案(后续)。今 docker 部署 meetwise=超级用户,前置成立。
--
-- 诚实边界:(b) 使现有灌库 apps/worker qbank-ingest(以 '__system_qbank__' 直写、未登记池条目)的块保持可召回,不误伤
--   合法直灌;真正的跨租户投毒(非系统 principal 写)已被写门 ① 从源头挡死,残留/历史投毒块经读侧 ③ + owner 过滤剔除。
--   把直灌也纳入审核源(收窄乃至去掉 (b)、让 ingest 促块进 approved 池)属后续接线,不在本轮边界内。
--   perf 注:annSearch 的 JOIN+DISTINCT 使 HNSW 难被规划器采用(退化为受可见集约束的精确扫描)——demo/当前规模无碍,
--   共享题库达 ~10 万+ 块时应改"vector_chunk 上物化 visible 布尔列 + 部分 HNSW 索引"以保住 O(log N)(后续,见 retrieval-store 注)。
--
-- 幂等/非破坏:DROP POLICY IF EXISTS + CREATE;CREATE INDEX IF NOT EXISTS;CREATE OR REPLACE VIEW。不 DROP 表/列,不丢数据,脏库可重跑。

-- ① 按命令拆写策略(先清旧 p_owner 及本迁移四策略,再建;可重跑)。
DROP POLICY IF EXISTS p_owner ON vector_chunk;
DROP POLICY IF EXISTS p_vchunk_read ON vector_chunk;
DROP POLICY IF EXISTS p_vchunk_insert ON vector_chunk;
DROP POLICY IF EXISTS p_vchunk_update ON vector_chunk;
DROP POLICY IF EXISTS p_vchunk_delete ON vector_chunk;
CREATE POLICY p_vchunk_read ON vector_chunk FOR SELECT
  USING ((kind = 'qbank' AND owner_user_id = '__system_qbank__')   -- 公共读只放行系统 owner 的 qbank;残留投毒 qbank 仅本人可见 → 对所有读者隐身
         OR owner_user_id = current_setting('app.principal_user', true));
CREATE POLICY p_vchunk_insert ON vector_chunk FOR INSERT
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true)
              AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'));
CREATE POLICY p_vchunk_update ON vector_chunk FOR UPDATE
  USING (owner_user_id = current_setting('app.principal_user', true)
         AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true)
              AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'));
CREATE POLICY p_vchunk_delete ON vector_chunk FOR DELETE
  USING (owner_user_id = current_setting('app.principal_user', true)
         AND (kind <> 'qbank' OR owner_user_id = '__system_qbank__'));

-- ② 求交所需索引:annSearch(qbank) JOIN qbank_visible_ref ON ref_id。
CREATE INDEX IF NOT EXISTS ix_vchunk_ref ON vector_chunk (ref_id);

-- ③ 可信可见集(定谓视图)。security_invoker=false 显式声明:以属主执行,配合属主 rolbypassrls 使 (b) 的 NOT EXISTS 看到全量池条目。
CREATE OR REPLACE VIEW qbank_visible_ref WITH (security_invoker = false) AS
      SELECT p.ref_id FROM qbank_pool_entry p JOIN qbank_source s ON s.id = p.source_id   -- (a) approved 策展池(撤销即移出)
       WHERE s.status = 'approved'
  UNION
      SELECT v.ref_id FROM vector_chunk v                                                 -- (b) 可信系统灌库 且 未纳入策展治理
       WHERE v.kind = 'qbank' AND v.owner_user_id = '__system_qbank__'
         AND NOT EXISTS (SELECT 1 FROM qbank_pool_entry pe WHERE pe.ref_id = v.ref_id);
GRANT SELECT ON qbank_visible_ref TO app_role;

-- ④ 硬前置:视图属主须真能绕 RLS,否则 (b) 撤销正确性失效 → 直接让迁移失败(fail-closed)。
DO $$
DECLARE v_owner text; v_ok boolean;
BEGIN
  SELECT viewowner INTO v_owner FROM pg_views WHERE schemaname = 'public' AND viewname = 'qbank_visible_ref';
  SELECT rolsuper OR rolbypassrls INTO v_ok FROM pg_roles WHERE rolname = v_owner;
  IF NOT COALESCE(v_ok, false) THEN
    RAISE EXCEPTION 'qbank_visible_ref 属主 % 缺 rolsuper/rolbypassrls:lane(b) 撤销隔离将失效(被撤销策展块会漏召回)。请授予 bypassrls 或改用独立-owner 免超级方案。', v_owner
      USING ERRCODE = 'insufficient_privilege';
  END IF;
END $$;
