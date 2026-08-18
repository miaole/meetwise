-- 0113_qbank_route_scope_cache.sql
--
-- RAG-FUNNEL-06 / route-scope 缓存 + provenance + 撤销隔离。
--
-- 只建 durable negative-result cache 数据面：`qbank_route_scope_negative_result`
-- （route-scope 绑定的「本 leaf 无合格题」负结果 + 显式状态机 active→superseded +
-- CAS version）与 `qbank_route_scope_cache_event`（append-only outbox，承载
-- active→superseded 的撤销 receipt）。retrieval-result / singleflight 热缓存键
-- 在 packages/db/src/qbank-route-scope-cache.ts 里以 HMAC 绑定 routeScopeCacheDigest
--（含 routeScopeDigest / leaf / taxonomy / generationId / recipeId / privacyEpoch /
-- aclDigest 七面），不在本迁移建 Redis 数据面（Redis 不是真相，真相在 PG 行/epoch CAS）。
--
-- WHY 权威判定落在 PG 行/epoch CAS（非进程内 Map）：
--  * 旧 cache 命中（retrieval-result / negative-result）在「generation 切换 / source
--    撤销 / corpus epoch 失效 / privacy epoch 漂移」后**不得**出题、**不得**派发 fallback。
--    进程内 Map 无法跨实例/重启一致地判定「这行已因撤销作废」，只有 PG 行的 CAS 状态转移
--    （active→superseded，version+1）才是唯一权威判定；read 时在同一事务内重读
--    qbank_cache_epoch + active generation + 调用方供的 live privacy epoch，mismatch →
--    CAS supersede + 返回 stale（sticky，绝不 replay 旧 negative verdict）。
--  * negative-result 只存 route-scope/verdict digest（无用户正文/PII），故撤销 = CAS
--    supersede（sticky 终态）+ outbox receipt，**不**走 0111 的 deletion sink
--    （privacy_deletion_target.sink 专为含 PII 的删除面；本表无 PII，无需物理删除 receipt）。
--
-- WHY 不建 SECURITY DEFINER 函数（对齐 0104/0106/0110）：状态转移全部在
-- packages/db/src/qbank-route-scope-cache.ts 的 asPrincipal 事务内以 CAS UPDATE 表达，
-- 不引入新的 SECURITY DEFINER 对象，principal.ts 的 sealed manifest 保持不动。
--
-- 迁移号决议：任务预分配 0113。写前 tail-3 实测 = 0109/0110/0111（0112 被 MEM-02
-- concurrent agent 约定占用、尚未落盘），故保留 0113 不抢占 0112。manifest 短暂出现
-- 0111→0113 缺口，直到 MEM-02 落 0112；隔离 runner（每次全新容器）不受影响。
--（详见 .tmp/rag06-cache-provenance-pregen-gate.md）

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- ────────────────────────────────────────────────────────────────────────────
-- 1) qbank_route_scope_negative_result：route-scope 绑定的 durable negative-result
--    cache。UNIQUE(owner, route_scope_cache_digest) 幂等；route_scope_cache_digest
--    是 canonical cache 身份（七面绑定，见 domain deriveRouteScopeCacheDigest）。
--    保存 generation/recipe/privacy/corpus epoch 快照列，供 read 时同事务重验。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qbank_route_scope_negative_result (
  id text PRIMARY KEY,
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  route_scope_cache_digest text NOT NULL CHECK (route_scope_cache_digest ~ '^[0-9a-f]{64}$'),
  route_scope_digest text NOT NULL CHECK (route_scope_digest ~ '^[0-9a-f]{64}$'),
  leaf_track_id text NOT NULL CHECK (leaf_track_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  taxonomy_version text NOT NULL CHECK (taxonomy_version ~ '^v[1-9][0-9]{0,15}$'),
  generation_id text NOT NULL CHECK (generation_id ~ '^qgen-[0-9a-f-]{36}$'),
  recipe_id text NOT NULL CHECK (recipe_id ~ '^qrecipe-[0-9a-f]{32}$'),
  privacy_epoch bigint NOT NULL CHECK (privacy_epoch >= 0),
  acl_digest text NOT NULL CHECK (acl_digest ~ '^[0-9a-f]{64}$'),
  corpus_epoch bigint NOT NULL CHECK (corpus_epoch >= 0),
  verdict text NOT NULL CHECK (verdict = 'no_eligible_in_scope'),
  verdict_digest text NOT NULL CHECK (verdict_digest ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('active','superseded')),
  version bigint NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  -- corpus_epoch 是 negative-result 的**时态身份**：同一 route scope 在不同语料 epoch 下「无合格题」
  -- 是不同事实（epoch 变可能补题）。把它纳入 UNIQUE 键，使「epoch 变后重新 record」落新行，
  -- 旧 epoch 行被 read 同事务 CAS superseded（sticky），绝不挡住新 epoch 的 re-record。
  UNIQUE (owner_user_id, route_scope_cache_digest, corpus_epoch)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2) qbank_route_scope_cache_event：单 owner 单调 append-only outbox。
--    (owner_user_id, event_seq) 单调；event_seq 在同一事务内分配（对齐 0104/0106/0110）。
--    承载 active→superseded 的撤销 receipt（reason 记录 stale 原因），是撤销的终态 receipt。
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qbank_route_scope_cache_event (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  event_seq bigint NOT NULL CHECK (event_seq > 0),
  cache_digest text NOT NULL CHECK (cache_digest ~ '^[0-9a-f]{64}$'),
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('active','superseded')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, event_seq)
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3) Grants + RLS。两张表全部 candidate-owned；app_role 只获 principal 作用域读写
--    （negative_result 需 INSERT + UPDATE 走 CAS；event 只 INSERT，append-only）。
--    无 role 提升写路径。
-- ────────────────────────────────────────────────────────────────────────────
REVOKE ALL ON qbank_route_scope_negative_result FROM PUBLIC;
REVOKE ALL ON qbank_route_scope_cache_event FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE ON qbank_route_scope_negative_result TO app_role;
GRANT SELECT, INSERT ON qbank_route_scope_cache_event TO app_role;

ALTER TABLE qbank_route_scope_negative_result ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_route_scope_negative_result FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_route_scope_cache_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_route_scope_cache_event FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_qbank_route_scope_negative_result_owner ON qbank_route_scope_negative_result;
CREATE POLICY p_qbank_route_scope_negative_result_owner ON qbank_route_scope_negative_result
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_qbank_route_scope_cache_event_owner ON qbank_route_scope_cache_event;
CREATE POLICY p_qbank_route_scope_cache_event_owner ON qbank_route_scope_cache_event
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
