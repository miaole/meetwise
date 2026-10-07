-- ═══════════════════════════════════════════════════════════════════════════════
-- 0141：向量面擦除收尾——lease 绑定 DELETE 围栏 + worker dispatch feed
-- ═══════════════════════════════════════════════════════════════════════════════
-- GAP-PRIV-04 vector erase（0125 同形扩展 · PRE dual 裁决 B+C · A 仅 additive fence）。
--
-- target 集先钉（PRE dual mw-privacy-int C-P4-2 / mw-e2e-ha C-EH-3，未钉不开工）：
--   ① 物理删除 target = sink 'memory_vector_chunk'（0125 已建 begin/claim/purge），
--      scope 谓词沿 0125 owner+kind 双谓词（owner_user_id = principal AND kind='memory'），
--      subject 作用域 = 账户轨道 owner。本刀不新增 sink 枚举值，不改 0125 任何函数体。
--   ② INT sink='vector' 无 interview 作用域键 → 诚实不建 target（现状保持；
--      本刀不假造面试作用域键；vector 面 claim 对 sink≠'memory_vector_chunk'
--      一律 42501 privacy_authorization_sink_forbidden——0125 既有门，本刀以证明钉）。
--   ③ kind='qbank' / 共享语料永不随 subject 删除（触发器只拦 kind='memory'；
--      qbank DELETE 面不受本刀影响）。
--
-- 本迁移只做三件可证明的事（0125/0048 同形 · additive fence，非 soft-as-erased）：
--   ① 写围栏加固：vector_chunk kind='memory' 的 DELETE 必须携带 0125 purge 事务安装的
--     target+lease 绑定（0048 checkpoint assert_checkpoint_privacy_fence 同形）——关闭
--     sink inventory §5 已披露缺口「触发器不拦 DELETE：app_role 仍可能自删 memory 行，
--     收据与真实删除者可能脱节」；错误/缺失 lease 一律 42501 fail-closed。
--   ② worker dispatch feed：privacy_list_claimable_vector_chunk_targets（0048
--     privacy_list_claimable_checkpoint_targets 同形，只出 target id + owner）。
--   ③ 授权 jti 解析 feed：privacy_vector_chunk_target_consumed_jti（只读；0125 claim
--     函数仍是唯一授权裁定者，jti 缺失/错配 → 42501 / sweep 跳过，无授权不删）。
--
-- 0091 receipt（候选 C）：purge 成功后由 worker caller 经既有
--   privacy_record_deletion_receipt（0091 现有函数）落 local_erased 收据——
--   receipt_kind 枚举 / completed guard（0091 L516-545）/ issuer 主链零语义改动。
--
-- 铁律：复用冻结 PrivacyAuthorizationIssuer（0091）与 0125 全部既有函数；公开 DELETE
-- 保持 503；本地隔离 PG 行级证据 ≠ 生产云端彻底删除——HNSW 索引内部页 / WAL / 备份 /
-- 副本不在行级证据面；releaseEvidence=false。

-- ═══════════════════════════════════════════════════════════════════════════════
-- A. lease 绑定 DELETE 围栏（0048 同形 · 只拦 kind='memory' · qbank 不受影响）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION enforce_vector_plane_erasure_delete_fence()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF TG_OP <> 'DELETE' THEN
    RETURN NEW;
  END IF;
  -- qbank / 其它 kind：走既有 RLS 与题库控制面，本围栏不拦。
  IF OLD.kind IS DISTINCT FROM 'memory' THEN
    RETURN OLD;
  END IF;
  -- 唯一合法 DELETE 上下文：0125 purge 事务（privacy_purge_memory_vector_chunk_target）
  -- 通过 set_config 安装的 target+lease。缺失即拒（关 app_role 无授权自删）。
  IF principal IS NULL OR length(principal) = 0
     OR current_setting('app.privacy_target_id', true) IS NULL
     OR current_setting('app.privacy_lease_token', true) IS NULL THEN
    RAISE EXCEPTION 'vector_plane_erasure_delete_not_authorized' USING ERRCODE='42501';
  END IF;
  PERFORM 1
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id::text = current_setting('app.privacy_target_id', true)
     AND t.status = 'leased'
     AND t.lease_token::text = current_setting('app.privacy_lease_token', true)
     AND t.sink = 'memory_vector_chunk'
     AND r.owner_user_id = principal
     AND r.scope = 'account_data'
     AND r.status IN ('fenced','purging','pending_external');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'vector_plane_erasure_delete_not_authorized' USING ERRCODE='42501';
  END IF;
  IF OLD.owner_user_id IS DISTINCT FROM principal THEN
    RAISE EXCEPTION 'vector_plane_erasure_delete_not_authorized' USING ERRCODE='42501';
  END IF;
  RETURN OLD;
END $$;

ALTER FUNCTION enforce_vector_plane_erasure_delete_fence() OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION enforce_vector_plane_erasure_delete_fence() FROM PUBLIC, app_role;

DROP TRIGGER IF EXISTS trg_vector_plane_erasure_delete_fence ON vector_chunk;
CREATE TRIGGER trg_vector_plane_erasure_delete_fence
  BEFORE DELETE ON vector_chunk
  FOR EACH ROW EXECUTE FUNCTION enforce_vector_plane_erasure_delete_fence();

-- ═══════════════════════════════════════════════════════════════════════════════
-- B. worker dispatch feed（0048 同形：只出 target id + owner，不收 locator/内容）
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION privacy_list_claimable_vector_chunk_targets(
  max_items integer DEFAULT 32
) RETURNS TABLE (target_id uuid, owner_user_id text)
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT t.id, r.owner_user_id
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE max_items BETWEEN 1 AND 128
     AND t.sink = 'memory_vector_chunk'
     AND r.scope = 'account_data'
     AND (t.status = 'pending'
          OR (t.status = 'leased' AND t.lease_expires_at < now())
          OR t.status = 'failed')
   ORDER BY t.created_at, t.id
   LIMIT max_items
$$;
ALTER FUNCTION privacy_list_claimable_vector_chunk_targets(integer) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_list_claimable_vector_chunk_targets(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_list_claimable_vector_chunk_targets(integer) TO privacy_worker_executor;

-- ═══════════════════════════════════════════════════════════════════════════════
-- C. 授权 jti 解析（只读 · 非授权判定）：按 request 的 (owner, epoch, digest) 找到
--    已消费 snapshot 的 jti，供 0125 claim 十项 fail-closed 链复核。本函数不做任何
--    授权裁定——解析错/缺 → claim 42501 或 sweep 诚实跳过（无授权不删）。
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION privacy_vector_chunk_target_consumed_jti(
  p_target uuid
) RETURNS text
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT s.jti
    FROM privacy_authorization_snapshot s
    JOIN privacy_deletion_target t ON t.id = p_target
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE s.owner_user_id = r.owner_user_id
     AND s.privacy_epoch = r.privacy_epoch
     AND s.target_set_digest = r.target_set_digest
     AND s.status = 'consumed'
     AND s.issuer_id = 'meetwise-privacy-authz-v1'
   ORDER BY s.consumed_at DESC NULLS LAST, s.jti
   LIMIT 1
$$;
ALTER FUNCTION privacy_vector_chunk_target_consumed_jti(uuid) OWNER TO privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_vector_chunk_target_consumed_jti(uuid) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_vector_chunk_target_consumed_jti(uuid) TO privacy_worker_executor;

-- sink 枚举零改动（0125 CHECK 原样）；INT sink='vector' 诚实不建 target 的现状保持。
-- receipt 落账经既有 0091 privacy_record_deletion_receipt（worker caller TS 侧调用），
-- 本迁移不改 privacy_deletion_receipt / completed guard 任何语义。
