-- ═══════════════════════════════════════════════════════════════════════════════
-- 0129：隐私删除预览路径（预览版）
-- ═══════════════════════════════════════════════════════════════════════════════
-- 把已有 request / sink 盘点 / receipt 接成可用预览路径。
-- 面试范围复用 0096 interview_projection_begin_erasure；
-- 账户范围复用 0125 memory_vector_chunk_begin_erasure。
-- 不重开公开 DELETE /privacy/*；不宣称跨存储生产删除 SLO；
-- 预览请求禁止 completed / production_slo_claimed=true。
-- 不改 0125 privacy_deletion_target.sink CHECK。不占用 0126–0128。

GRANT CREATE ON SCHEMA public TO privacy_api_owner;

CREATE TABLE privacy_preview_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('interview_data','account_data','resume_data')),
  subject_id text NOT NULL,
  idempotency_key_hash text NOT NULL CHECK (idempotency_key_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('inventoried','local_fenced')),
  edition text NOT NULL DEFAULT 'preview' CHECK (edition = 'preview'),
  production_slo_claimed boolean NOT NULL DEFAULT false CHECK (production_slo_claimed = false),
  completeness text NOT NULL DEFAULT 'preview_incomplete' CHECK (completeness = 'preview_incomplete'),
  local_sweep_request_id uuid REFERENCES privacy_erasure_request(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 0 CHECK (version >= 0),
  UNIQUE (owner_user_id, idempotency_key_hash)
);

CREATE TABLE privacy_preview_sink_line (
  request_id uuid NOT NULL REFERENCES privacy_preview_request(id) ON DELETE RESTRICT,
  sink text NOT NULL,
  track text NOT NULL CHECK (track IN ('interview','account','resume','external','adjacent')),
  disposition text NOT NULL CHECK (disposition IN (
    'local_begin_started','local_begin_available','placeholder_no_target','external_pending','honest_unresolved'
  )),
  in_deletion_target_check boolean NOT NULL,
  PRIMARY KEY (request_id, sink)
);

CREATE INDEX privacy_preview_request_owner_created_idx
  ON privacy_preview_request (owner_user_id, created_at DESC, id DESC);

REVOKE ALL ON privacy_preview_request, privacy_preview_sink_line FROM PUBLIC, app_role;
GRANT SELECT, INSERT, UPDATE ON privacy_preview_request, privacy_preview_sink_line TO privacy_api_owner;

ALTER TABLE privacy_preview_request ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_preview_request FORCE ROW LEVEL SECURITY;
ALTER TABLE privacy_preview_sink_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_preview_sink_line FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS privacy_preview_request_owner ON privacy_preview_request;
CREATE POLICY privacy_preview_request_owner ON privacy_preview_request
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));

DROP POLICY IF EXISTS privacy_preview_sink_line_owner ON privacy_preview_sink_line;
CREATE POLICY privacy_preview_sink_line_owner ON privacy_preview_sink_line
  USING (EXISTS (
    SELECT 1 FROM privacy_preview_request r
     WHERE r.id = privacy_preview_sink_line.request_id
       AND r.owner_user_id = current_setting('app.principal_user', true)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM privacy_preview_request r
     WHERE r.id = privacy_preview_sink_line.request_id
       AND r.owner_user_id = current_setting('app.principal_user', true)
  ));

CREATE OR REPLACE FUNCTION assert_privacy_preview_request_not_completed() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.status IS NOT DISTINCT FROM 'completed' OR NEW.production_slo_claimed IS DISTINCT FROM false
     OR NEW.completeness IS DISTINCT FROM 'preview_incomplete' OR NEW.edition IS DISTINCT FROM 'preview' THEN
    RAISE EXCEPTION 'privacy_preview_completed_forbidden' USING ERRCODE='55000';
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION assert_privacy_preview_request_not_completed() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION assert_privacy_preview_request_not_completed() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS privacy_preview_request_not_completed ON privacy_preview_request;
CREATE TRIGGER privacy_preview_request_not_completed
  BEFORE INSERT OR UPDATE ON privacy_preview_request
  FOR EACH ROW EXECUTE FUNCTION assert_privacy_preview_request_not_completed();

-- 与 packages/domain/src/privacy-erasure-preview.ts PRIVACY_PREVIEW_SINK_CATALOG 逐行对齐。
CREATE OR REPLACE FUNCTION privacy_preview_catalog()
RETURNS TABLE (
  sink text, track text, default_disposition text, in_deletion_target_check boolean, local_begin text
)
LANGUAGE sql IMMUTABLE SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
  SELECT * FROM (VALUES
    ('checkpoint_rows','interview','local_begin_available',true,'interview_projection'),
    ('interview_job_payload','interview','local_begin_available',true,NULL),
    ('event','interview','local_begin_available',true,'interview_projection'),
    ('report','interview','local_begin_available',true,'interview_projection'),
    ('vector','interview','placeholder_no_target',true,NULL),
    ('redis','external','external_pending',true,NULL),
    ('oss','external','external_pending',true,NULL),
    ('langfuse','external','external_pending',true,NULL),
    ('interview_answer_artifact','interview','local_begin_available',true,NULL),
    ('ai_graph_run','interview','local_begin_available',true,'interview_projection'),
    ('memory_event','account','placeholder_no_target',true,NULL),
    ('memory_summary','account','local_begin_available',true,NULL),
    ('memory_fact','account','local_begin_available',true,NULL),
    ('memory_embedding','account','local_begin_available',true,NULL),
    ('memory_cache','account','placeholder_no_target',true,NULL),
    ('memory_context_snapshot','account','local_begin_available',true,NULL),
    ('memory_trace','account','placeholder_no_target',true,NULL),
    ('conversation_event','account','local_begin_available',true,NULL),
    ('conversation_event_artifact','account','local_begin_available',true,NULL),
    ('context_compression_snapshot','account','local_begin_available',true,NULL),
    ('context_compression_dispatch','account','local_begin_available',true,NULL),
    ('memory_vector_chunk','account','local_begin_available',true,'memory_vector_chunk'),
    ('user_memory','adjacent','honest_unresolved',false,NULL),
    ('ai_invocation_trace','adjacent','honest_unresolved',false,NULL),
    ('backup_pitr','adjacent','honest_unresolved',false,NULL)
  ) AS t(sink, track, default_disposition, in_deletion_target_check, local_begin);
$$;
ALTER FUNCTION privacy_preview_catalog() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_preview_catalog() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_preview_catalog() TO app_role;

CREATE OR REPLACE FUNCTION privacy_preview_begin_erasure(
  p_scope text,
  p_subject_id text,
  p_idempotency_key_hash text
) RETURNS TABLE (
  request_id uuid, request_status text, scope text, subject_id text,
  edition text, production_slo_claimed boolean, completeness text,
  replayed boolean, local_sweep_request_id uuid,
  sink text, track text, disposition text, in_deletion_target_check boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
  existing privacy_preview_request%ROWTYPE;
  created uuid;
  v_subject text;
  v_status text;
  v_started text;
  v_child uuid;
  v_child_hash text;
  v_epoch bigint;
BEGIN
  IF principal IS NULL OR length(principal)=0
     OR p_scope IS NULL OR p_scope NOT IN ('interview_data','account_data','resume_data')
     OR p_idempotency_key_hash IS NULL OR p_idempotency_key_hash !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'privacy_preview_invalid' USING ERRCODE='22023';
  END IF;
  PERFORM 1 FROM user_account ua WHERE ua.id = principal;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'privacy_preview_account_not_found' USING ERRCODE='42501';
  END IF;

  IF p_scope = 'interview_data' THEN
    IF p_subject_id IS NULL OR length(p_subject_id)=0 THEN
      RAISE EXCEPTION 'privacy_preview_subject_required' USING ERRCODE='22023';
    END IF;
    PERFORM 1 FROM interview i WHERE i.id = p_subject_id AND i.owner_user_id = principal;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'privacy_preview_not_found_or_forbidden' USING ERRCODE='42501';
    END IF;
    v_subject := p_subject_id;
    v_started := 'interview_projection';
    v_status := 'local_fenced';
  ELSIF p_scope = 'account_data' THEN
    IF p_subject_id IS NOT NULL AND length(p_subject_id)>0 AND p_subject_id <> principal THEN
      RAISE EXCEPTION 'privacy_preview_subject_mismatch' USING ERRCODE='22023';
    END IF;
    v_subject := principal;
    v_started := 'memory_vector_chunk';
    v_status := 'local_fenced';
  ELSE
    v_subject := principal;
    v_started := NULL;
    v_status := 'inventoried';
  END IF;

  SELECT * INTO existing FROM privacy_preview_request r
   WHERE r.owner_user_id = principal AND r.idempotency_key_hash = p_idempotency_key_hash
   FOR UPDATE;
  IF FOUND THEN
    IF existing.scope <> p_scope OR existing.subject_id <> v_subject THEN
      RAISE EXCEPTION 'privacy_preview_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT existing.id, existing.status, existing.scope, existing.subject_id,
             existing.edition, existing.production_slo_claimed, existing.completeness,
             true, existing.local_sweep_request_id,
             l.sink, l.track, l.disposition, l.in_deletion_target_check
        FROM privacy_preview_sink_line l
       WHERE l.request_id = existing.id
       ORDER BY l.sink;
    RETURN;
  END IF;

  IF v_started = 'interview_projection' THEN
    v_child_hash := encode(digest(p_idempotency_key_hash || ':interview_projection', 'sha256'), 'hex');
    SELECT COALESCE(e.fence_epoch, 1) INTO v_epoch
      FROM checkpoint_thread_enrollment e
     WHERE e.thread_id = v_subject AND e.owner_user_id = principal;
    IF v_epoch IS NULL OR v_epoch < 1 THEN
      v_epoch := 1;
    END IF;
    SELECT t.request_id INTO v_child
      FROM interview_projection_begin_erasure(v_subject, v_child_hash, v_epoch) t
     LIMIT 1;
    IF v_child IS NULL THEN
      RAISE EXCEPTION 'privacy_preview_local_sweep_failed' USING ERRCODE='55000';
    END IF;
  ELSIF v_started = 'memory_vector_chunk' THEN
    v_child_hash := encode(digest(p_idempotency_key_hash || ':memory_vector_chunk', 'sha256'), 'hex');
    SELECT t.request_id INTO v_child
      FROM memory_vector_chunk_begin_erasure(v_child_hash) t
     LIMIT 1;
    IF v_child IS NULL THEN
      RAISE EXCEPTION 'privacy_preview_local_sweep_failed' USING ERRCODE='55000';
    END IF;
  END IF;

  INSERT INTO privacy_preview_request(
      owner_user_id, scope, subject_id, idempotency_key_hash, status,
      edition, production_slo_claimed, completeness, local_sweep_request_id
    )
    VALUES (
      principal, p_scope, v_subject, p_idempotency_key_hash, v_status,
      'preview', false, 'preview_incomplete', v_child
    )
    ON CONFLICT (owner_user_id, idempotency_key_hash) DO NOTHING
    RETURNING id INTO created;

  IF created IS NULL THEN
    SELECT * INTO existing FROM privacy_preview_request r
     WHERE r.owner_user_id = principal AND r.idempotency_key_hash = p_idempotency_key_hash
     FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'privacy_preview_unavailable' USING ERRCODE='55000';
    END IF;
    IF existing.scope <> p_scope OR existing.subject_id <> v_subject THEN
      RAISE EXCEPTION 'privacy_preview_idempotency_conflict' USING ERRCODE='23505';
    END IF;
    RETURN QUERY
      SELECT existing.id, existing.status, existing.scope, existing.subject_id,
             existing.edition, existing.production_slo_claimed, existing.completeness,
             true, existing.local_sweep_request_id,
             l.sink, l.track, l.disposition, l.in_deletion_target_check
        FROM privacy_preview_sink_line l
       WHERE l.request_id = existing.id
       ORDER BY l.sink;
    RETURN;
  END IF;

  INSERT INTO privacy_preview_sink_line(request_id, sink, track, disposition, in_deletion_target_check)
    SELECT created, c.sink, c.track,
           CASE WHEN v_started IS NOT NULL AND c.local_begin = v_started
                THEN 'local_begin_started' ELSE c.default_disposition END,
           c.in_deletion_target_check
      FROM privacy_preview_catalog() c;

  RETURN QUERY
    SELECT pr.id, pr.status, pr.scope, pr.subject_id,
           pr.edition, pr.production_slo_claimed, pr.completeness,
           false, pr.local_sweep_request_id,
           l.sink, l.track, l.disposition, l.in_deletion_target_check
      FROM privacy_preview_request pr
      JOIN privacy_preview_sink_line l ON l.request_id = pr.id
     WHERE pr.id = created
     ORDER BY l.sink;
END $$;
ALTER FUNCTION privacy_preview_begin_erasure(text,text,text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_preview_begin_erasure(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_preview_begin_erasure(text,text,text) TO app_role;

CREATE OR REPLACE FUNCTION privacy_preview_get_receipt(p_request_id uuid)
RETURNS TABLE (
  request_id uuid, request_status text, scope text, subject_id text,
  edition text, production_slo_claimed boolean, completeness text,
  replayed boolean, local_sweep_request_id uuid,
  sink text, track text, disposition text, in_deletion_target_check boolean
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'privacy_preview_invalid' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM privacy_preview_request r
     WHERE r.id = p_request_id AND r.owner_user_id = principal
  ) THEN
    RAISE EXCEPTION 'privacy_preview_not_found_or_forbidden' USING ERRCODE='42501';
  END IF;
  RETURN QUERY
    SELECT pr.id, pr.status, pr.scope, pr.subject_id,
           pr.edition, pr.production_slo_claimed, pr.completeness,
           false, pr.local_sweep_request_id,
           l.sink, l.track, l.disposition, l.in_deletion_target_check
      FROM privacy_preview_request pr
      JOIN privacy_preview_sink_line l ON l.request_id = pr.id
     WHERE pr.id = p_request_id AND pr.owner_user_id = principal
     ORDER BY l.sink;
END $$;
ALTER FUNCTION privacy_preview_get_receipt(uuid) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_preview_get_receipt(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_preview_get_receipt(uuid) TO app_role;

CREATE OR REPLACE FUNCTION privacy_preview_list_receipts(max_items integer DEFAULT 8)
RETURNS TABLE (
  request_id uuid, scope text, subject_id text, request_status text
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR max_items IS NULL OR max_items < 1 OR max_items > 32 THEN
    RAISE EXCEPTION 'privacy_preview_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT r.id, r.scope, r.subject_id, r.status
      FROM privacy_preview_request r
     WHERE r.owner_user_id = principal
     ORDER BY r.created_at DESC, r.id DESC
     LIMIT max_items;
END $$;
ALTER FUNCTION privacy_preview_list_receipts(integer) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION privacy_preview_list_receipts(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION privacy_preview_list_receipts(integer) TO app_role;

REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;
