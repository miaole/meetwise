-- 0140_privacy_external_vendor_purge_evidence.sql
--
-- Line AR · GAP-PRIV-EXTERNAL-SINK-RETENTION async purge real knife
-- REQUEST e2eac8ca · AUTHORIZE coding+prove · PRE privacy 6093626e + e2e e473eac2
--
-- Hardening N1–N3 (mw-privacy-int PRE · MUST before prove):
--   N1  per-sink evidence class pinned (CHECK · no invent):
--       oss      → oss_delete_list_empty_local_stub
--       redis    → redis_del_exists_empty_local_stub
--       langfuse → langfuse_retention_delete_replica_local_stub
--       environment_class = local_isolated_stub ONLY this knife
--       (stub ≠ cloud vendor deleted · backlog :64 stays OPEN · Ban buy cloud)
--   N2  privacy_resolve_deletion_receipt gains vendor-evidence gate for
--       oss/redis/langfuse: refuse resolve→external_confirmed unless a matching
--       verified_absent evidence row exists (Ban wash 0137 attestation into wipe · NB-3).
--   N3  retention_pending vs external_pending wiring:
--       confirmer writes external_pending AFTER vendor evidence, THEN resolve;
--       privacy_apply_external_sink_erased_with_vendor_evidence marks erased
--       only when evidence present (Ban count-as-erased · Ban forge).
--
-- Also tightens completed guard (0137 body + vendor_unproven clause).
-- Three sinks same column · Ban OSS-only shrink · DELETE stays 503 · UC-052 partial.
-- Ban invent completed · Ban close :64 · Ban secrets · Ban Meridian.

-- ── N1: vendor purge evidence ledger ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS privacy_external_purge_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT,
  target_id uuid NOT NULL REFERENCES privacy_deletion_target(id) ON DELETE RESTRICT,
  sink text NOT NULL CHECK (sink IN ('oss','redis','langfuse')),
  evidence_class text NOT NULL,
  evidence_hash text NOT NULL,
  vendor_operation text NOT NULL,
  verified_absent boolean NOT NULL DEFAULT false,
  environment_class text NOT NULL DEFAULT 'local_isolated_stub'
    CHECK (environment_class IN ('local_isolated_stub')),
  recorded_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (target_id),
  CONSTRAINT privacy_external_purge_evidence_class_matches_sink CHECK (
    (sink = 'oss' AND evidence_class = 'oss_delete_list_empty_local_stub')
    OR (sink = 'redis' AND evidence_class = 'redis_del_exists_empty_local_stub')
    OR (sink = 'langfuse' AND evidence_class = 'langfuse_retention_delete_replica_local_stub')
  )
);

ALTER TABLE privacy_external_purge_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_external_purge_evidence FORCE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS privacy_external_purge_evidence_request_idx
  ON privacy_external_purge_evidence (request_id);

REVOKE ALL ON privacy_external_purge_evidence FROM PUBLIC, app_role;
-- Match 0091 receipt ACL: worker_owner needs INSERT+UPDATE for SECURITY DEFINER writers;
-- guard_owner SELECT for completed-guard EXISTS. Table OWNER = privacy_worker_owner (definer writer).
GRANT SELECT, INSERT, UPDATE ON privacy_external_purge_evidence TO privacy_worker_owner;
GRANT SELECT ON privacy_external_purge_evidence TO privacy_guard_owner;
GRANT USAGE ON SCHEMA public TO privacy_worker_owner, privacy_guard_owner;

GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER TABLE privacy_external_purge_evidence OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;

DROP POLICY IF EXISTS privacy_external_purge_evidence_worker_owner ON privacy_external_purge_evidence;
CREATE POLICY privacy_external_purge_evidence_worker_owner ON privacy_external_purge_evidence
  FOR ALL TO privacy_worker_owner
  USING (EXISTS (
    SELECT 1 FROM privacy_erasure_request r
     WHERE r.id = privacy_external_purge_evidence.request_id
       AND r.owner_user_id = current_setting('app.principal_user', true)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM privacy_erasure_request r
     WHERE r.id = privacy_external_purge_evidence.request_id
       AND r.owner_user_id = current_setting('app.principal_user', true)
  ));

DROP POLICY IF EXISTS privacy_external_purge_evidence_guard_dispatch ON privacy_external_purge_evidence;
CREATE POLICY privacy_external_purge_evidence_guard_dispatch ON privacy_external_purge_evidence
  FOR SELECT TO privacy_guard_owner USING (true);

-- ── record vendor evidence (worker executor · N1) ─────────────────────────
CREATE OR REPLACE FUNCTION privacy_record_vendor_purge_evidence(
  p_target uuid,
  p_evidence_class text,
  p_evidence_hash text,
  p_vendor_operation text,
  p_verified_absent boolean,
  p_recorded_by text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request uuid;
  v_sink text;
  evidence_id uuid;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_target IS NULL
     OR p_evidence_class IS NULL OR length(p_evidence_class)=0
     OR p_evidence_hash IS NULL OR length(p_evidence_hash)=0
     OR p_vendor_operation IS NULL OR length(p_vendor_operation)=0
     OR p_recorded_by IS NULL OR length(p_recorded_by)=0
     OR p_verified_absent IS NOT TRUE THEN
    RAISE EXCEPTION 'privacy_vendor_evidence_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.request_id, t.sink INTO v_request, v_sink
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target AND r.owner_user_id = principal
   FOR UPDATE OF t;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_vendor_evidence_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF v_sink NOT IN ('oss','redis','langfuse') THEN
    RAISE EXCEPTION 'privacy_vendor_evidence_sink_not_external' USING ERRCODE='22023';
  END IF;
  -- N1: class must match sink (also enforced by table CHECK).
  IF (v_sink = 'oss' AND p_evidence_class <> 'oss_delete_list_empty_local_stub')
     OR (v_sink = 'redis' AND p_evidence_class <> 'redis_del_exists_empty_local_stub')
     OR (v_sink = 'langfuse' AND p_evidence_class <> 'langfuse_retention_delete_replica_local_stub') THEN
    RAISE EXCEPTION 'privacy_vendor_evidence_class_mismatch' USING ERRCODE='22023';
  END IF;
  INSERT INTO privacy_external_purge_evidence(
      request_id, target_id, sink, evidence_class, evidence_hash,
      vendor_operation, verified_absent, environment_class, recorded_by)
  VALUES (
      v_request, p_target, v_sink, p_evidence_class, p_evidence_hash,
      p_vendor_operation, true, 'local_isolated_stub', p_recorded_by)
  ON CONFLICT (target_id) DO UPDATE
     SET evidence_class = EXCLUDED.evidence_class,
         evidence_hash = EXCLUDED.evidence_hash,
         vendor_operation = EXCLUDED.vendor_operation,
         verified_absent = true,
         environment_class = 'local_isolated_stub',
         recorded_by = EXCLUDED.recorded_by,
         created_at = now()
  RETURNING id INTO evidence_id;
  RETURN evidence_id;
END $$;
GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_record_vendor_purge_evidence(uuid,text,text,text,boolean,text)
  OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_record_vendor_purge_evidence(uuid,text,text,text,boolean,text)
  FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_record_vendor_purge_evidence(uuid,text,text,text,boolean,text)
  TO privacy_worker_executor;

-- ── N3: mark external target erased only with vendor evidence ─────────────
CREATE OR REPLACE FUNCTION privacy_apply_external_sink_erased_with_vendor_evidence(
  p_target uuid,
  p_recorded_by text
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_sink text;
  v_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_target IS NULL
     OR p_recorded_by IS NULL OR length(p_recorded_by)=0 THEN
    RAISE EXCEPTION 'privacy_external_erase_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.sink, t.status INTO v_sink, v_status
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target AND r.owner_user_id = principal
   FOR UPDATE OF t;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_external_erase_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  IF v_sink NOT IN ('oss','redis','langfuse') THEN
    RAISE EXCEPTION 'privacy_external_erase_sink_not_external' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM privacy_external_purge_evidence e
     WHERE e.target_id = p_target AND e.verified_absent IS TRUE
       AND e.environment_class = 'local_isolated_stub'
       AND (
         (v_sink = 'oss' AND e.evidence_class = 'oss_delete_list_empty_local_stub')
         OR (v_sink = 'redis' AND e.evidence_class = 'redis_del_exists_empty_local_stub')
         OR (v_sink = 'langfuse' AND e.evidence_class = 'langfuse_retention_delete_replica_local_stub')
       )
  ) THEN
    RAISE EXCEPTION 'privacy_external_erase_vendor_unproven' USING ERRCODE='55000';
  END IF;
  UPDATE privacy_deletion_target
     SET status='erased', version=version+1, updated_at=now()
   WHERE id = p_target AND status IN ('retention_pending','pending','leased','purging')
  RETURNING status INTO v_status;
  IF v_status IS NULL THEN
    SELECT status INTO v_status FROM privacy_deletion_target WHERE id = p_target;
  END IF;
  RETURN v_status;
END $$;
GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_apply_external_sink_erased_with_vendor_evidence(uuid,text)
  OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_apply_external_sink_erased_with_vendor_evidence(uuid,text)
  FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_apply_external_sink_erased_with_vendor_evidence(uuid,text)
  TO privacy_worker_executor;

-- ── N2: resolve gains vendor evidence gate (0091 body + gate) ─────────────
-- Signature / OWNER / GRANT identical to 0091. CREATE OR REPLACE keeps ACL.
-- Gate: for oss/redis/langfuse, refuse pending→confirmed unless verified_absent
-- evidence of the pinned class exists. Non-external sinks unchanged (F1 local path).
CREATE OR REPLACE FUNCTION privacy_resolve_deletion_receipt(
  p_target uuid,
  p_recorded_by text
) RETURNS TABLE (receipt_id uuid, receipt_kind text, request_status text)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  v_request uuid;
  v_sink text;
  receipt_row record;
  new_request_status text;
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_target IS NULL
     OR p_recorded_by IS NULL OR length(p_recorded_by)=0 THEN
    RAISE EXCEPTION 'privacy_authorization_resolve_invalid' USING ERRCODE='22023';
  END IF;
  SELECT t.request_id, t.sink INTO v_request, v_sink
    FROM privacy_deletion_target t
    JOIN privacy_erasure_request r ON r.id = t.request_id
   WHERE t.id = p_target AND r.owner_user_id = principal
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_resolve_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  SELECT rc.* INTO receipt_row FROM privacy_deletion_receipt rc
   WHERE rc.target_id = p_target AND rc.receipt_kind = 'external_pending' FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_authorization_receipt_not_pending' USING ERRCODE='40901';
  END IF;
  -- N2 vendor evidence gate AFTER pending check (preserve 40901 for not-pending;
  -- Ban wash attestation: pending→confirmed still requires verified_absent evidence).
  IF v_sink IN ('oss','redis','langfuse') THEN
    IF NOT EXISTS (
      SELECT 1 FROM privacy_external_purge_evidence e
       WHERE e.target_id = p_target AND e.verified_absent IS TRUE
         AND e.environment_class = 'local_isolated_stub'
         AND (
           (v_sink = 'oss' AND e.evidence_class = 'oss_delete_list_empty_local_stub')
           OR (v_sink = 'redis' AND e.evidence_class = 'redis_del_exists_empty_local_stub')
           OR (v_sink = 'langfuse' AND e.evidence_class = 'langfuse_retention_delete_replica_local_stub')
         )
    ) THEN
      RAISE EXCEPTION 'privacy_authorization_resolve_vendor_unproven' USING ERRCODE='55000';
    END IF;
  END IF;
  UPDATE privacy_deletion_receipt rc
     SET receipt_kind='external_confirmed', resolved_at=now(), resolved_by=p_recorded_by
   WHERE rc.id = receipt_row.id;

  IF NOT EXISTS (SELECT 1 FROM privacy_deletion_target t WHERE t.request_id=v_request AND t.status <> 'erased')
     AND NOT EXISTS (SELECT 1 FROM privacy_deletion_receipt rc WHERE rc.request_id=v_request AND rc.receipt_kind IN ('external_pending','failed_cleanup')) THEN
    UPDATE privacy_erasure_request
       SET status='completed', version=version+1, updated_at=now()
     WHERE id=v_request AND status IN ('fenced','purging','pending_external')
     RETURNING status INTO new_request_status;
  END IF;
  IF new_request_status IS NULL THEN
    SELECT status INTO new_request_status FROM privacy_erasure_request WHERE id=v_request;
  END IF;
  RETURN QUERY SELECT receipt_row.id, 'external_confirmed'::text, new_request_status;
END $$;
GRANT CREATE ON SCHEMA public TO privacy_worker_owner;
ALTER FUNCTION privacy_resolve_deletion_receipt(uuid,text) OWNER TO privacy_worker_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_worker_owner;
REVOKE ALL ON FUNCTION privacy_resolve_deletion_receipt(uuid,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION privacy_resolve_deletion_receipt(uuid,text) TO privacy_worker_executor;

-- ── completed guard: 0137 + vendor evidence clause ────────────────────────
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
    -- 0137: resolve-audited external_confirmed required for externals.
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
    -- 0140: vendor purge evidence required (NB-3 · Ban wash attestation into wipe).
    IF EXISTS (SELECT 1 FROM privacy_deletion_target t
                WHERE t.request_id = NEW.id
                  AND t.sink IN ('oss','redis','langfuse')
                  AND NOT EXISTS (SELECT 1 FROM privacy_external_purge_evidence e
                                   WHERE e.target_id = t.id
                                     AND e.verified_absent IS TRUE
                                     AND e.environment_class = 'local_isolated_stub'
                                     AND (
                                       (t.sink = 'oss' AND e.evidence_class = 'oss_delete_list_empty_local_stub')
                                       OR (t.sink = 'redis' AND e.evidence_class = 'redis_del_exists_empty_local_stub')
                                       OR (t.sink = 'langfuse' AND e.evidence_class = 'langfuse_retention_delete_replica_local_stub')
                                     ))) THEN
      RAISE EXCEPTION 'privacy_erasure_request_external_vendor_unproven' USING ERRCODE='55000';
    END IF;
  END IF;
  RETURN NEW;
END $$;

GRANT CREATE ON SCHEMA public TO privacy_guard_owner;
ALTER FUNCTION assert_privacy_erasure_request_completed_guard() OWNER TO privacy_guard_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_guard_owner;
REVOKE ALL ON FUNCTION assert_privacy_erasure_request_completed_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS privacy_erasure_request_completed_guard ON privacy_erasure_request;
CREATE TRIGGER privacy_erasure_request_completed_guard
  BEFORE INSERT OR UPDATE ON privacy_erasure_request
  FOR EACH ROW EXECUTE FUNCTION assert_privacy_erasure_request_completed_guard();
