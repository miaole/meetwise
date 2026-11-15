-- 0235_privacy_erasure_feed_filter_residue_receipt.sql — 擦除域 PR257 N-1/N-2/N-6 收口
-- ═══════════════════════════════════════════════════════════════════════════
-- N-1（队头饿死）：0096 投影 claimable feed 原体 ORDER BY created_at LIMIT max_items，
--   无授权（无已消费 0091 jti）target 永久 pending、永远占住前列名额——审查实测 45 个
--   可认领 target 只回最早 32 个，签发方上线后有授权 target 会被存量无授权 target 永久
--   挡住。修后 feed 内联 0232 B1 同款「已消费 jti」EXISTS 限定：只列可实际推进的 target，
--   worker 每拍 32 次空 jti 查询空转消失；worker 的 skipUnauthorized 降为纵深兜底。
--   函数属主/授权沿用 0096（CREATE OR REPLACE 保形），签名与语义面（返回列、上限界）零变。
-- N-6（性能）：#249 剥离后 done 行 payload 一般非 '{}'，清扫每拍对 interview_job 逐行跑
--   EXISTS（0232 policy 谓词打 privacy_checkpoint_target.thread_id+owner_user_id）——
--   该表此前无对应索引，全表扫描。补复合索引。
-- N-2（收据缺口）：A2 残留清扫（privacy_purge_fenced_interview_job_residue）此前只回计数、
--   零持久收据。补 sweep 批次台账表（只记计数/上限/时点——零 job id/owner/内容元数据），
--   函数每次清扫落一行；A1/投影 purge 的 local_erased 收据 0232 已落（B2-e 臂在证）。
-- 全部 append-only：不改既有迁移字节（0229/0230 checksum 钉不受影响）。

-- ── N-1：feed 限定已消费授权 ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION interview_projection_list_claimable_targets(
  max_items integer DEFAULT 32
) RETURNS TABLE (target_id uuid, owner_user_id text)
LANGUAGE sql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT pt.target_id, pt.owner_user_id
    FROM interview_projection_target pt
    JOIN privacy_deletion_target t ON t.id=pt.target_id
    JOIN privacy_erasure_request r ON r.id=pt.request_id
   WHERE max_items BETWEEN 1 AND 128
     AND r.status IN ('fenced','purging','pending_external')
     AND (t.status='pending' OR (t.status='leased' AND t.lease_expires_at < now()) OR t.status='failed')
     AND EXISTS (
       SELECT 1
         FROM privacy_authorization_snapshot s
        WHERE s.owner_user_id = r.owner_user_id
          AND s.interview_id = r.subject_id
          AND s.privacy_epoch = r.privacy_epoch
          AND s.target_set_digest = r.target_set_digest
          AND s.purpose = 'interview_data_erasure'
          AND s.status = 'consumed'
          AND s.issuer_id = 'meetwise-privacy-authz-v1'
          AND s.expires_at > now()
     )
   ORDER BY t.created_at, pt.target_id
   LIMIT max_items
$$;

-- ── N-6：清扫谓词复合索引 ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS privacy_checkpoint_target_thread_owner_idx
  ON privacy_checkpoint_target (thread_id, owner_user_id);

-- ── N-2：A2 残留清扫批次台账 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS privacy_job_residue_receipt (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  deleted_count bigint NOT NULL CHECK (deleted_count >= 0),
  max_items integer NOT NULL CHECK (max_items BETWEEN 1 AND 512),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON privacy_job_residue_receipt TO privacy_worker_owner;
REVOKE ALL ON privacy_job_residue_receipt FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION privacy_purge_fenced_interview_job_residue(
  max_items integer DEFAULT 64
) RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  removed bigint := 0;
BEGIN
  IF max_items IS NULL OR max_items < 1 OR max_items > 512 THEN
    RAISE EXCEPTION 'interview_job_residue_purge_invalid' USING ERRCODE='22023';
  END IF;
  -- 事务局域（is_local=true）：只在本函数所在事务内生效，函数即唯一 setter。
  PERFORM set_config('app.privacy_job_residue_sweep', 'on', true);
  WITH victim AS (
    SELECT j.id
      FROM interview_job j
     WHERE j.payload <> '{}'::jsonb
       AND NOT (j.status = 'running' AND j.lease_expires_at IS NOT NULL AND j.lease_expires_at >= now())
     ORDER BY j.created_at, j.id
     LIMIT max_items
  )
  DELETE FROM interview_job d USING victim WHERE d.id = victim.id;
  GET DIAGNOSTICS removed = ROW_COUNT;
  PERFORM set_config('app.privacy_job_residue_sweep', '', true);
  -- N-2：批次收据（同事务·失败即回滚——台账与删除原子）。只记计数，零行级元数据。
  INSERT INTO privacy_job_residue_receipt(deleted_count, max_items) VALUES (removed, max_items);
  RETURN removed;
END $$;
