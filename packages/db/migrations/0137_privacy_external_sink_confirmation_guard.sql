-- 0137_privacy_external_sink_confirmation_guard.sql
--
-- GAP-PRIV-EXTERNAL-SINK-RETENTION（Line AN-PRIV-EXT）：外部 sink（oss/redis/langfuse）
-- 异步确认诚实轨的「约束级」收紧。不新增 receipt 形状，**锚定 0091 既有**
-- `receipt_kind` 枚举 + `privacy_resolve_deletion_receipt`（external_pending→external_confirmed，
-- 写 resolved_at/resolved_by 的可审计单向转换）。
--
-- 为何需要（0091 L524-546 guard 的诚实缺口 · prove 红路径 EXT-NEG-02/02b/04）：
--   0091 completed guard 只要求「全部 target.status='erased'」且「无 external_pending/
--   failed_cleanup receipt」。今日 UC-052/0096 给外部 sink 落的是 target
--   status='retention_pending'，**不**写 `external_pending` receipt（peer N2）。因此只要外部
--   target 被直接改成 'erased'（缺任何确认），或经 `privacy_record_deletion_receipt` 直写
--   `external_confirmed`（绕开 pending→confirmed 审计链，resolved_at 为 NULL），请求就能被
--   UPDATE / reassess 推进到 `completed` —— 即 count-as-erased。
--
-- 本迁移只做 fail-closed 收紧（只会让更多 completed 被拒，不会让任何请求更易 completed）：
--   外部 sink target 计入 completed 的唯一凭据 = 同 target 上一条经
--   `privacy_resolve_deletion_receipt` 解析过的 `external_confirmed` receipt
--   （resolved_at IS NOT NULL AND resolved_by IS NOT NULL）。直写的 external_confirmed
--   （resolved_at IS NULL）**不计**外部 purge 证据（PRE C-4）。
--
-- 非目标（Ban）：不新增外部确认执行器 · 不调用任何 OSS/Redis/Langfuse API · 不改
-- 0091 issuer/resolve/record 函数体（冻结）· 不把 retention_pending 改写为 erased ·
-- 不开公开 DELETE（仍 503）· 不发明 completed。backlog `:64` GAP stays OPEN。
--
-- 其余子句与 0091 逐字一致（M2 INSERT/UPDATE 双生效 · M3 零 target 拒 · 55000）。

CREATE OR REPLACE FUNCTION assert_privacy_erasure_request_completed_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.status = 'completed' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'completed') THEN
    IF NOT EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id = NEW.id) THEN
      RAISE EXCEPTION 'privacy_erasure_request_zero_targets' USING ERRCODE='55000';
    END IF;
    IF EXISTS (SELECT 1 FROM privacy_deletion_target t
                WHERE t.request_id = NEW.id AND t.status <> 'erased') THEN
      RAISE EXCEPTION 'privacy_erasure_request_incomplete_targets' USING ERRCODE='55000';
    END IF;
    IF EXISTS (SELECT 1 FROM privacy_deletion_receipt rc
                WHERE rc.request_id = NEW.id
                  AND rc.receipt_kind IN ('external_pending','failed_cleanup')) THEN
      RAISE EXCEPTION 'privacy_erasure_request_external_unresolved' USING ERRCODE='55000';
    END IF;
    -- 0137：外部 sink 必须有经 resolve 审计链的 external_confirmed（直写/缺确认 → 拒）。
    IF EXISTS (SELECT 1 FROM privacy_deletion_target t
                WHERE t.request_id = NEW.id
                  AND t.sink IN ('oss','redis','langfuse')
                  AND NOT EXISTS (SELECT 1 FROM privacy_deletion_receipt rc
                                   WHERE rc.target_id = t.id
                                     AND rc.receipt_kind = 'external_confirmed'
                                     AND rc.resolved_at IS NOT NULL
                                     AND rc.resolved_by IS NOT NULL)) THEN
      RAISE EXCEPTION 'privacy_erasure_request_external_unconfirmed' USING ERRCODE='55000';
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- 所有权/授权与 0091 L549-558 一致（CREATE OR REPLACE 保留 owner；此处显式重申，幂等）。
GRANT CREATE ON SCHEMA public TO privacy_guard_owner;
ALTER FUNCTION assert_privacy_erasure_request_completed_guard() OWNER TO privacy_guard_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_guard_owner;
REVOKE ALL ON FUNCTION assert_privacy_erasure_request_completed_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS privacy_erasure_request_completed_guard ON privacy_erasure_request;
CREATE TRIGGER privacy_erasure_request_completed_guard
  BEFORE INSERT OR UPDATE ON privacy_erasure_request
  FOR EACH ROW EXECUTE FUNCTION assert_privacy_erasure_request_completed_guard();
