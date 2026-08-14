-- 0066_qbank_control_executor.sql
--
-- A qbank principal stored in app.principal_user was never a safe control
-- boundary: a runtime login that can issue arbitrary SQL can set that GUC.
-- Generation construction/activation is therefore moved to a dedicated,
-- NOINHERIT database executor.  Request-path app_role keeps only read access
-- and SECURITY DEFINER retrieval functions; it cannot create corpus facts,
-- mutate question artifacts, create partitions, or switch the active index.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='qbank_control_executor') THEN
    CREATE ROLE qbank_control_executor NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;

REVOKE qbank_control_executor FROM app_role, app_gateway_role;
GRANT USAGE ON SCHEMA public TO qbank_control_executor;

-- The public request role may query the small read model through its existing
-- RLS policies/functions, but cannot masquerade as __system_qbank__ to write.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON qbank_corpus_epoch FROM PUBLIC, app_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON qbank_source, qbank_pool_entry, qbank_chunk,
  qbank_embedding_recipe, qbank_vector_generation, qbank_generation_chunk,
  qbank_question, qbank_question_chunk FROM app_role;

-- vector_chunk still holds non-qbank request data.  Keep its normal app-role
-- policy for non-qbank rows, but reserve the legacy qbank lane exclusively for
-- the control executor as well.  This prevents a forged GUC from reinserting a
-- legacy vector and bypassing generation provenance.
DROP POLICY IF EXISTS p_vchunk_insert ON vector_chunk;
DROP POLICY IF EXISTS p_vchunk_update ON vector_chunk;
DROP POLICY IF EXISTS p_vchunk_delete ON vector_chunk;
CREATE POLICY p_vchunk_insert ON vector_chunk FOR INSERT TO app_role
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND kind <> 'qbank');
CREATE POLICY p_vchunk_update ON vector_chunk FOR UPDATE TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND kind <> 'qbank')
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND kind <> 'qbank');
CREATE POLICY p_vchunk_delete ON vector_chunk FOR DELETE TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND kind <> 'qbank');
DROP POLICY IF EXISTS p_vchunk_qbank_control ON vector_chunk;
CREATE POLICY p_vchunk_qbank_control ON vector_chunk FOR ALL TO qbank_control_executor
  USING (kind='qbank' AND owner_user_id='__system_qbank__')
  WITH CHECK (kind='qbank' AND owner_user_id='__system_qbank__');
GRANT SELECT, INSERT, UPDATE, DELETE ON vector_chunk TO qbank_control_executor;
GRANT EXECUTE ON FUNCTION qbank_search_terms(text) TO qbank_control_executor;

-- One explicit policy per control relation makes the role's authority visible
-- in PostgreSQL rather than implicit in an application session variable.
GRANT SELECT, UPDATE ON qbank_corpus_epoch TO qbank_control_executor;
DROP POLICY IF EXISTS p_qbank_corpus_epoch_control ON qbank_corpus_epoch;
CREATE POLICY p_qbank_corpus_epoch_control ON qbank_corpus_epoch FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);

GRANT SELECT ON qbank_active_generation TO qbank_control_executor;
DROP POLICY IF EXISTS p_qbank_active_generation_control ON qbank_active_generation;
CREATE POLICY p_qbank_active_generation_control ON qbank_active_generation FOR SELECT TO qbank_control_executor
  USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_source, qbank_pool_entry, qbank_chunk,
  qbank_embedding_recipe, qbank_vector_generation, qbank_generation_chunk,
  qbank_question, qbank_question_chunk TO qbank_control_executor;
GRANT SELECT ON qbank_retrieval_candidate TO qbank_control_executor;

DROP POLICY IF EXISTS p_qbank_source_control ON qbank_source;
CREATE POLICY p_qbank_source_control ON qbank_source FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_qbank_pool_control ON qbank_pool_entry;
CREATE POLICY p_qbank_pool_control ON qbank_pool_entry FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_qbank_chunk_control ON qbank_chunk;
CREATE POLICY p_qbank_chunk_control ON qbank_chunk FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_qbank_recipe_control ON qbank_embedding_recipe;
CREATE POLICY p_qbank_recipe_control ON qbank_embedding_recipe FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_qbank_generation_control ON qbank_vector_generation;
CREATE POLICY p_qbank_generation_control ON qbank_vector_generation FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_qbank_generation_chunk_control ON qbank_generation_chunk;
CREATE POLICY p_qbank_generation_chunk_control ON qbank_generation_chunk FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_qbank_question_control ON qbank_question;
CREATE POLICY p_qbank_question_control ON qbank_question FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS p_qbank_question_chunk_control ON qbank_question_chunk;
CREATE POLICY p_qbank_question_chunk_control ON qbank_question_chunk FOR ALL TO qbank_control_executor
  USING (true) WITH CHECK (true);

-- Control functions are called only after SET LOCAL ROLE
-- qbank_control_executor.  Do not use current_setting('app.principal_user')
-- for authorization inside SECURITY DEFINER functions: the executable grant
-- is the authorization boundary.
CREATE OR REPLACE FUNCTION qbank_prepare_generation_partition(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE suffix text; tab text; idx text;
BEGIN
  IF p_generation !~ '^qgen-[0-9a-f-]{36}$' OR NOT EXISTS (
    SELECT 1 FROM qbank_vector_generation WHERE id=p_generation AND state='building'
  ) THEN
    RAISE EXCEPTION 'invalid qbank building generation' USING ERRCODE='check_violation';
  END IF;
  suffix := replace(substr(p_generation, 6), '-', '');
  tab := 'qbank_generation_chunk_' || suffix;
  idx := 'qgc_hnsw_visible_' || suffix;
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF qbank_generation_chunk FOR VALUES IN (%L)', tab, p_generation);
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I USING hnsw (embedding vector_cosine_ops) WHERE visible', idx, tab);
END;
$$;

CREATE OR REPLACE FUNCTION qbank_validate_generation(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE exp_count integer; actual_count integer; snapshot_epoch bigint; now_epoch bigint; st text;
BEGIN
  SELECT expected_chunk_count, source_epoch, state INTO exp_count, snapshot_epoch, st
    FROM qbank_vector_generation WHERE id=p_generation FOR UPDATE;
  IF st IS DISTINCT FROM 'building' THEN RAISE EXCEPTION 'qbank generation is not building' USING ERRCODE='check_violation'; END IF;
  SELECT count(*)::integer INTO actual_count FROM qbank_generation_chunk WHERE generation_id=p_generation;
  SELECT epoch INTO now_epoch FROM qbank_corpus_epoch WHERE singleton FOR SHARE;
  IF actual_count <> exp_count THEN RAISE EXCEPTION 'qbank generation chunk count % != expected %', actual_count, exp_count USING ERRCODE='check_violation'; END IF;
  IF now_epoch <> snapshot_epoch THEN RAISE EXCEPTION 'qbank corpus changed during generation build (% -> %)', snapshot_epoch, now_epoch USING ERRCODE='serialization_failure'; END IF;
  UPDATE qbank_vector_generation SET state='validated', validated_at=clock_timestamp() WHERE id=p_generation;
END;
$$;

CREATE OR REPLACE FUNCTION qbank_activate_generation(p_generation text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE snapshot_epoch bigint; now_epoch bigint; st text;
BEGIN
  SELECT epoch INTO now_epoch FROM qbank_corpus_epoch WHERE singleton FOR UPDATE;
  SELECT source_epoch, state INTO snapshot_epoch, st FROM qbank_vector_generation WHERE id=p_generation FOR UPDATE;
  IF st NOT IN ('validated','retired') THEN RAISE EXCEPTION 'qbank generation must be validated or retired before activation' USING ERRCODE='check_violation'; END IF;
  IF snapshot_epoch <> now_epoch THEN RAISE EXCEPTION 'qbank corpus changed since generation build; rebuild required' USING ERRCODE='serialization_failure'; END IF;
  UPDATE qbank_vector_generation SET state='retired' WHERE state='active' AND id<>p_generation;
  UPDATE qbank_vector_generation SET state='active', activated_at=clock_timestamp(), failure_reason=NULL WHERE id=p_generation;
  INSERT INTO qbank_active_generation(singleton,generation_id,updated_at) VALUES (true,p_generation,clock_timestamp())
    ON CONFLICT(singleton) DO UPDATE SET generation_id=EXCLUDED.generation_id, updated_at=EXCLUDED.updated_at;
  UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
END;
$$;

CREATE OR REPLACE FUNCTION qbank_mark_generation_failed(p_generation text, p_reason text) RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE qbank_vector_generation SET state='failed', failure_reason=left(coalesce(p_reason,'build_failed'), 512)
   WHERE id=p_generation AND state IN ('building','validated');
END;
$$;

REVOKE ALL ON FUNCTION qbank_prepare_generation_partition(text), qbank_validate_generation(text),
  qbank_activate_generation(text), qbank_mark_generation_failed(text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION qbank_prepare_generation_partition(text), qbank_validate_generation(text),
  qbank_activate_generation(text), qbank_mark_generation_failed(text,text) TO qbank_control_executor;
