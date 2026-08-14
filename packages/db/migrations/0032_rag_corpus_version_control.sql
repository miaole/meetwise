-- 0032_rag_corpus_version_control.sql
--
-- Generic RAG version-control plane.  qbank generation (0029) remains the running shared-question-bank path;
-- this migration adds the multi-format corpus control plane without rewriting or weakening qbank's guards.
-- Facts live in Postgres, while every physical vector generation is a rebuildable derivative.

CREATE TABLE IF NOT EXISTS rag_corpus_epoch (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  epoch bigint NOT NULL CHECK (epoch > 0) DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO rag_corpus_epoch(singleton, epoch) VALUES (true, 1) ON CONFLICT (singleton) DO NOTHING;
GRANT SELECT ON rag_corpus_epoch TO app_role;
ALTER TABLE rag_corpus_epoch ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_corpus_epoch FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_corpus_epoch_read ON rag_corpus_epoch;
CREATE POLICY p_rag_corpus_epoch_read ON rag_corpus_epoch FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS rag_corpus_document (
  id text PRIMARY KEY CHECK (id ~ '^[A-Za-z0-9:_-]{1,160}$'),
  owner_user_id text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('private','global')),
  source_kind text NOT NULL CHECK (source_kind IN ('resume','job_description','knowledge','manual','pdf','spreadsheet','presentation','image','audio','video')),
  status text NOT NULL CHECK (status IN ('draft','active','updating','soft_deleted','hard_deleted')) DEFAULT 'draft',
  current_content_version integer NOT NULL DEFAULT 0 CHECK (current_content_version >= 0),
  content_hash text CHECK (content_hash IS NULL OR content_hash ~ '^[0-9a-f]{64}$'),
  row_version bigint NOT NULL DEFAULT 0 CHECK (row_version >= 0),
  retained_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((visibility <> 'global') OR owner_user_id = '__system_rag__')
);
GRANT SELECT, INSERT, UPDATE ON rag_corpus_document TO app_role;
ALTER TABLE rag_corpus_document ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_corpus_document FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_corpus_document_read ON rag_corpus_document;
CREATE POLICY p_rag_corpus_document_read ON rag_corpus_document FOR SELECT
  USING (visibility='global' OR owner_user_id=current_setting('app.principal_user', true)
    OR current_setting('app.principal_user', true)='__system_rag__');
DROP POLICY IF EXISTS p_rag_corpus_document_write ON rag_corpus_document;
CREATE POLICY p_rag_corpus_document_write ON rag_corpus_document FOR ALL
  USING (owner_user_id=current_setting('app.principal_user', true) OR current_setting('app.principal_user', true)='__system_rag__')
  WITH CHECK (
    (owner_user_id=current_setting('app.principal_user', true) AND visibility='private')
    OR current_setting('app.principal_user', true)='__system_rag__'
  );

CREATE TABLE IF NOT EXISTS rag_corpus_content_version (
  document_id text NOT NULL REFERENCES rag_corpus_document(id),
  content_version integer NOT NULL CHECK (content_version > 0),
  content_hash text NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  parser_recipe_hash text NOT NULL CHECK (parser_recipe_hash ~ '^[0-9a-f]{64}$'),
  cleaning_recipe_hash text NOT NULL CHECK (cleaning_recipe_hash ~ '^[0-9a-f]{64}$'),
  chunker_recipe_hash text NOT NULL CHECK (chunker_recipe_hash ~ '^[0-9a-f]{64}$'),
  source_locator jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL CHECK (state IN ('active','superseded','tombstoned','purged')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(document_id, content_version)
);
GRANT SELECT, INSERT, UPDATE ON rag_corpus_content_version TO app_role;
ALTER TABLE rag_corpus_content_version ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_corpus_content_version FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_content_version_read ON rag_corpus_content_version;
CREATE POLICY p_rag_content_version_read ON rag_corpus_content_version FOR SELECT USING (
  EXISTS (SELECT 1 FROM rag_corpus_document d WHERE d.id=document_id
    AND (d.visibility='global' OR d.owner_user_id=current_setting('app.principal_user', true)
      OR current_setting('app.principal_user', true)='__system_rag__'))
);
DROP POLICY IF EXISTS p_rag_content_version_write ON rag_corpus_content_version;
CREATE POLICY p_rag_content_version_write ON rag_corpus_content_version FOR ALL USING (
  EXISTS (SELECT 1 FROM rag_corpus_document d WHERE d.id=document_id
    AND (d.owner_user_id=current_setting('app.principal_user', true) OR current_setting('app.principal_user', true)='__system_rag__'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM rag_corpus_document d WHERE d.id=document_id
    AND (d.owner_user_id=current_setting('app.principal_user', true) OR current_setting('app.principal_user', true)='__system_rag__'))
);

CREATE TABLE IF NOT EXISTS rag_corpus_chunk (
  id text PRIMARY KEY CHECK (id ~ '^[A-Za-z0-9:_-]{1,180}$'),
  document_id text NOT NULL,
  content_version integer NOT NULL,
  ordinal integer NOT NULL CHECK (ordinal >= 0),
  content_hash text NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 120000),
  locator jsonb NOT NULL DEFAULT '{}'::jsonb,
  state text NOT NULL CHECK (state IN ('active','superseded','tombstoned','purged')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, content_version, ordinal),
  FOREIGN KEY(document_id, content_version) REFERENCES rag_corpus_content_version(document_id, content_version)
);
CREATE INDEX IF NOT EXISTS ix_rag_corpus_chunk_document_state ON rag_corpus_chunk(document_id, content_version, state);
GRANT SELECT, INSERT, UPDATE ON rag_corpus_chunk TO app_role;
ALTER TABLE rag_corpus_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_corpus_chunk FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_corpus_chunk_read ON rag_corpus_chunk;
CREATE POLICY p_rag_corpus_chunk_read ON rag_corpus_chunk FOR SELECT USING (
  EXISTS (SELECT 1 FROM rag_corpus_document d WHERE d.id=document_id
    AND (d.visibility='global' OR d.owner_user_id=current_setting('app.principal_user', true)
      OR current_setting('app.principal_user', true)='__system_rag__'))
);
DROP POLICY IF EXISTS p_rag_corpus_chunk_write ON rag_corpus_chunk;
CREATE POLICY p_rag_corpus_chunk_write ON rag_corpus_chunk FOR ALL USING (
  EXISTS (SELECT 1 FROM rag_corpus_document d WHERE d.id=document_id
    AND (d.owner_user_id=current_setting('app.principal_user', true) OR current_setting('app.principal_user', true)='__system_rag__'))
) WITH CHECK (
  EXISTS (SELECT 1 FROM rag_corpus_document d WHERE d.id=document_id
    AND (d.owner_user_id=current_setting('app.principal_user', true) OR current_setting('app.principal_user', true)='__system_rag__'))
);

CREATE TABLE IF NOT EXISTS rag_corpus_tombstone (
  chunk_id text PRIMARY KEY REFERENCES rag_corpus_chunk(id),
  document_id text NOT NULL,
  content_version integer NOT NULL,
  owner_user_id text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('supersede','delete','erasure')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_rag_tombstone_document ON rag_corpus_tombstone(document_id, reason);
GRANT SELECT, INSERT ON rag_corpus_tombstone TO app_role;
ALTER TABLE rag_corpus_tombstone ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_corpus_tombstone FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_tombstone_read ON rag_corpus_tombstone;
CREATE POLICY p_rag_tombstone_read ON rag_corpus_tombstone FOR SELECT
  USING (owner_user_id=current_setting('app.principal_user', true) OR owner_user_id='__system_rag__'
    OR current_setting('app.principal_user', true)='__system_rag__');
DROP POLICY IF EXISTS p_rag_tombstone_write ON rag_corpus_tombstone;
CREATE POLICY p_rag_tombstone_write ON rag_corpus_tombstone FOR INSERT
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

CREATE TABLE IF NOT EXISTS rag_embedding_recipe (
  id text PRIMARY KEY CHECK (id ~ '^rrecipe-[0-9a-f]{32}$'),
  recipe_hash text NOT NULL UNIQUE CHECK (recipe_hash ~ '^[0-9a-f]{64}$'),
  provider text NOT NULL CHECK (char_length(provider) BETWEEN 1 AND 80),
  model text NOT NULL CHECK (char_length(model) BETWEEN 1 AND 160),
  provider_revision text NOT NULL CHECK (char_length(provider_revision) BETWEEN 1 AND 160),
  dimensions integer NOT NULL CHECK (dimensions BETWEEN 1 AND 2000),
  normalization_version text NOT NULL,
  chunker_recipe_hash text NOT NULL CHECK (chunker_recipe_hash ~ '^[0-9a-f]{64}$'),
  document_transform_version text NOT NULL,
  query_transform_version text NOT NULL,
  manifest jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON rag_embedding_recipe TO app_role;
ALTER TABLE rag_embedding_recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_embedding_recipe FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_embedding_recipe_read ON rag_embedding_recipe;
CREATE POLICY p_rag_embedding_recipe_read ON rag_embedding_recipe FOR SELECT USING (true);
DROP POLICY IF EXISTS p_rag_embedding_recipe_write ON rag_embedding_recipe;
CREATE POLICY p_rag_embedding_recipe_write ON rag_embedding_recipe FOR INSERT
  WITH CHECK (current_setting('app.principal_user', true)='__system_rag__');

CREATE TABLE IF NOT EXISTS rag_release_policy (
  id text PRIMARY KEY CHECK (id ~ '^rpolicy-[A-Za-z0-9:_-]{1,120}$'),
  min_labeled_queries integer NOT NULL CHECK (min_labeled_queries > 0),
  max_recall_drop_bp integer NOT NULL CHECK (max_recall_drop_bp BETWEEN 0 AND 10000),
  max_p95_regression_bp integer NOT NULL CHECK (max_p95_regression_bp BETWEEN 0 AND 100000),
  max_cost_regression_bp integer NOT NULL CHECK (max_cost_regression_bp BETWEEN 0 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON rag_release_policy TO app_role;
ALTER TABLE rag_release_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_release_policy FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_release_policy_read ON rag_release_policy;
CREATE POLICY p_rag_release_policy_read ON rag_release_policy FOR SELECT USING (true);
DROP POLICY IF EXISTS p_rag_release_policy_write ON rag_release_policy;
CREATE POLICY p_rag_release_policy_write ON rag_release_policy FOR INSERT
  WITH CHECK (current_setting('app.principal_user', true)='__system_rag__');

CREATE TABLE IF NOT EXISTS rag_embedding_generation (
  id text PRIMARY KEY CHECK (id ~ '^rgen-[0-9a-f-]{36}$'),
  recipe_id text NOT NULL REFERENCES rag_embedding_recipe(id),
  release_policy_id text NOT NULL REFERENCES rag_release_policy(id),
  source_epoch bigint NOT NULL CHECK (source_epoch > 0),
  expected_chunk_count integer NOT NULL CHECK (expected_chunk_count >= 0),
  physical_table text NOT NULL UNIQUE CHECK (physical_table ~ '^rag_vector_[0-9a-f]{32}$'),
  state text NOT NULL CHECK (state IN ('building','shadow','gated','active','deprecated','retired','aborted','failed')),
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  activated_at timestamptz,
  retired_at timestamptz,
  CHECK ((state='failed') = (failure_reason IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rag_embedding_generation_active ON rag_embedding_generation(state) WHERE state='active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_rag_embedding_generation_gated ON rag_embedding_generation(state) WHERE state='gated';
GRANT SELECT, INSERT, UPDATE ON rag_embedding_generation TO app_role;
ALTER TABLE rag_embedding_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_embedding_generation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_generation_read ON rag_embedding_generation;
CREATE POLICY p_rag_generation_read ON rag_embedding_generation FOR SELECT USING (true);
DROP POLICY IF EXISTS p_rag_generation_write ON rag_embedding_generation;
CREATE POLICY p_rag_generation_write ON rag_embedding_generation FOR ALL
  USING (current_setting('app.principal_user', true)='__system_rag__')
  WITH CHECK (current_setting('app.principal_user', true)='__system_rag__');

CREATE TABLE IF NOT EXISTS rag_generation_member (
  generation_id text NOT NULL REFERENCES rag_embedding_generation(id),
  chunk_id text NOT NULL REFERENCES rag_corpus_chunk(id),
  document_id text NOT NULL,
  owner_user_id text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('private','global')),
  content_version integer NOT NULL,
  content_hash text NOT NULL CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  PRIMARY KEY(generation_id, chunk_id)
);
CREATE INDEX IF NOT EXISTS ix_rag_generation_member_document ON rag_generation_member(generation_id, document_id);
GRANT SELECT, INSERT ON rag_generation_member TO app_role;
ALTER TABLE rag_generation_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_generation_member FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_generation_member_read ON rag_generation_member;
CREATE POLICY p_rag_generation_member_read ON rag_generation_member FOR SELECT
  USING (owner_user_id=current_setting('app.principal_user', true) OR visibility='global'
    OR current_setting('app.principal_user', true)='__system_rag__');
DROP POLICY IF EXISTS p_rag_generation_member_write ON rag_generation_member;
CREATE POLICY p_rag_generation_member_write ON rag_generation_member FOR INSERT
  WITH CHECK (current_setting('app.principal_user', true)='__system_rag__');

CREATE TABLE IF NOT EXISTS rag_active_generation (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  generation_id text REFERENCES rag_embedding_generation(id),
  row_version bigint NOT NULL DEFAULT 0 CHECK (row_version >= 0),
  switched_at timestamptz
);
INSERT INTO rag_active_generation(singleton, generation_id) VALUES (true, NULL) ON CONFLICT (singleton) DO NOTHING;
GRANT SELECT ON rag_active_generation TO app_role;
ALTER TABLE rag_active_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_active_generation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_active_generation_read ON rag_active_generation;
CREATE POLICY p_rag_active_generation_read ON rag_active_generation FOR SELECT USING (singleton);

CREATE TABLE IF NOT EXISTS rag_rebuild_run (
  id text PRIMARY KEY CHECK (id ~ '^rrun-[0-9a-f-]{36}$'),
  generation_id text NOT NULL UNIQUE REFERENCES rag_embedding_generation(id),
  status text NOT NULL CHECK (status IN ('pending','running','paused','succeeded','aborted','orphaned','failed')) DEFAULT 'pending',
  lease_owner text,
  lease_expires_at timestamptz,
  heartbeat_at timestamptz,
  cursor jsonb NOT NULL DEFAULT '{}'::jsonb,
  deadline_at timestamptz,
  pause_budget_seconds integer NOT NULL DEFAULT 0 CHECK (pause_budget_seconds >= 0),
  paused_total_seconds integer NOT NULL DEFAULT 0 CHECK (paused_total_seconds >= 0),
  row_version bigint NOT NULL DEFAULT 0 CHECK (row_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON rag_rebuild_run TO app_role;
ALTER TABLE rag_rebuild_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_rebuild_run FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_rebuild_run_read ON rag_rebuild_run;
CREATE POLICY p_rag_rebuild_run_read ON rag_rebuild_run FOR SELECT
  USING (current_setting('app.principal_user', true)='__system_rag__');
DROP POLICY IF EXISTS p_rag_rebuild_run_write ON rag_rebuild_run;
CREATE POLICY p_rag_rebuild_run_write ON rag_rebuild_run FOR ALL
  USING (current_setting('app.principal_user', true)='__system_rag__')
  WITH CHECK (current_setting('app.principal_user', true)='__system_rag__');

CREATE TABLE IF NOT EXISTS rag_shadow_evaluation (
  generation_id text PRIMARY KEY REFERENCES rag_embedding_generation(id),
  dataset_revision text NOT NULL CHECK (char_length(dataset_revision) BETWEEN 1 AND 160),
  labeled_query_count integer NOT NULL CHECK (labeled_query_count > 0),
  baseline_recall numeric(8,6) NOT NULL CHECK (baseline_recall BETWEEN 0 AND 1),
  candidate_recall numeric(8,6) NOT NULL CHECK (candidate_recall BETWEEN 0 AND 1),
  baseline_p95_ms numeric(14,3) NOT NULL CHECK (baseline_p95_ms > 0),
  candidate_p95_ms numeric(14,3) NOT NULL CHECK (candidate_p95_ms > 0),
  baseline_cost_per_query numeric(18,8) NOT NULL CHECK (baseline_cost_per_query >= 0),
  candidate_cost_per_query numeric(18,8) NOT NULL CHECK (candidate_cost_per_query >= 0),
  verdict text NOT NULL CHECK (verdict IN ('passed','failed')),
  recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON rag_shadow_evaluation TO app_role;
ALTER TABLE rag_shadow_evaluation ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_shadow_evaluation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_shadow_eval_read ON rag_shadow_evaluation;
CREATE POLICY p_rag_shadow_eval_read ON rag_shadow_evaluation FOR SELECT USING (true);
DROP POLICY IF EXISTS p_rag_shadow_eval_write ON rag_shadow_evaluation;
CREATE POLICY p_rag_shadow_eval_write ON rag_shadow_evaluation FOR INSERT
  WITH CHECK (current_setting('app.principal_user', true)='__system_rag__');

CREATE TABLE IF NOT EXISTS rag_generation_rollout (
  generation_id text PRIMARY KEY REFERENCES rag_embedding_generation(id),
  percent integer NOT NULL CHECK (percent IN (0,1,10,50,100)) DEFAULT 0,
  status text NOT NULL CHECK (status IN ('ready','running','completed','rolled_back')) DEFAULT 'ready',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON rag_generation_rollout TO app_role;
ALTER TABLE rag_generation_rollout ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_generation_rollout FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_rollout_read ON rag_generation_rollout;
CREATE POLICY p_rag_rollout_read ON rag_generation_rollout FOR SELECT USING (true);
DROP POLICY IF EXISTS p_rag_rollout_write ON rag_generation_rollout;
CREATE POLICY p_rag_rollout_write ON rag_generation_rollout FOR ALL
  USING (current_setting('app.principal_user', true)='__system_rag__')
  WITH CHECK (current_setting('app.principal_user', true)='__system_rag__');

CREATE TABLE IF NOT EXISTS rag_query_binding (
  id text PRIMARY KEY CHECK (id ~ '^rbind-[A-Za-z0-9:_-]{1,160}$'),
  owner_user_id text NOT NULL,
  generation_id text NOT NULL REFERENCES rag_embedding_generation(id),
  sticky_key_hash text NOT NULL CHECK (sticky_key_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('active','expired','revoked')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_rag_query_binding_owner ON rag_query_binding(owner_user_id, status, expires_at);
GRANT SELECT, INSERT, UPDATE ON rag_query_binding TO app_role;
ALTER TABLE rag_query_binding ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_query_binding FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_query_binding_read ON rag_query_binding;
CREATE POLICY p_rag_query_binding_read ON rag_query_binding FOR SELECT
  USING (owner_user_id=current_setting('app.principal_user', true));
DROP POLICY IF EXISTS p_rag_query_binding_write ON rag_query_binding;
CREATE POLICY p_rag_query_binding_write ON rag_query_binding FOR ALL
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

CREATE TABLE IF NOT EXISTS rag_citation (
  id text PRIMARY KEY CHECK (id ~ '^rcite-[A-Za-z0-9:_-]{1,160}$'),
  owner_user_id text NOT NULL,
  binding_id text NOT NULL REFERENCES rag_query_binding(id),
  generation_id text NOT NULL REFERENCES rag_embedding_generation(id),
  chunk_id text NOT NULL REFERENCES rag_corpus_chunk(id),
  document_id text NOT NULL,
  content_version integer NOT NULL,
  snapshot_hash text NOT NULL CHECK (snapshot_hash ~ '^[0-9a-f]{64}$'),
  status text NOT NULL CHECK (status IN ('valid','invalidated')) DEFAULT 'valid',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_rag_citation_chunk ON rag_citation(chunk_id, status);
GRANT SELECT, INSERT, UPDATE ON rag_citation TO app_role;
ALTER TABLE rag_citation ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_citation FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_rag_citation_read ON rag_citation;
CREATE POLICY p_rag_citation_read ON rag_citation FOR SELECT
  USING (owner_user_id=current_setting('app.principal_user', true));
DROP POLICY IF EXISTS p_rag_citation_write ON rag_citation;
CREATE POLICY p_rag_citation_write ON rag_citation FOR ALL
  USING (owner_user_id=current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

CREATE OR REPLACE FUNCTION rag_require_system() RETURNS void
  LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF current_setting('app.principal_user', true) <> '__system_rag__' THEN
    RAISE EXCEPTION 'only __system_rag__ may mutate RAG control plane' USING ERRCODE='insufficient_privilege';
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION rag_require_system() FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION rag_recipe_immutable() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP IN ('UPDATE','DELETE') THEN
    RAISE EXCEPTION 'rag embedding recipe is immutable' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION rag_recipe_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_rag_recipe_immutable ON rag_embedding_recipe;
CREATE TRIGGER trg_rag_recipe_immutable BEFORE UPDATE OR DELETE ON rag_embedding_recipe
FOR EACH ROW EXECUTE FUNCTION rag_recipe_immutable();

CREATE OR REPLACE FUNCTION rag_content_version_guard() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP='UPDATE' THEN
    IF NEW.document_id<>OLD.document_id OR NEW.content_version<>OLD.content_version
      OR NEW.content_hash<>OLD.content_hash OR NEW.parser_recipe_hash<>OLD.parser_recipe_hash
      OR NEW.cleaning_recipe_hash<>OLD.cleaning_recipe_hash OR NEW.chunker_recipe_hash<>OLD.chunker_recipe_hash
      OR NEW.source_locator<>OLD.source_locator THEN
      RAISE EXCEPTION 'rag content version facts are immutable' USING ERRCODE='check_violation';
    END IF;
    IF NOT ((OLD.state='active' AND NEW.state IN ('superseded','tombstoned'))
      OR (OLD.state='superseded' AND NEW.state IN ('tombstoned','purged'))
      OR (OLD.state='tombstoned' AND NEW.state='purged')
      OR NEW.state=OLD.state) THEN
      RAISE EXCEPTION 'invalid rag content version state transition % -> %', OLD.state, NEW.state USING ERRCODE='check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION rag_content_version_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_rag_content_version_guard ON rag_corpus_content_version;
CREATE TRIGGER trg_rag_content_version_guard BEFORE UPDATE ON rag_corpus_content_version
FOR EACH ROW EXECUTE FUNCTION rag_content_version_guard();

CREATE OR REPLACE FUNCTION rag_chunk_guard() RETURNS trigger
  LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF TG_OP='UPDATE' THEN
    IF NEW.id<>OLD.id OR NEW.document_id<>OLD.document_id OR NEW.content_version<>OLD.content_version
      OR NEW.ordinal<>OLD.ordinal OR NEW.content_hash<>OLD.content_hash OR NEW.content<>OLD.content OR NEW.locator<>OLD.locator THEN
      RAISE EXCEPTION 'rag chunk facts are immutable' USING ERRCODE='check_violation';
    END IF;
    IF NOT ((OLD.state='active' AND NEW.state IN ('superseded','tombstoned'))
      OR (OLD.state='superseded' AND NEW.state IN ('tombstoned','purged'))
      OR (OLD.state='tombstoned' AND NEW.state='purged') OR NEW.state=OLD.state) THEN
      RAISE EXCEPTION 'invalid rag chunk state transition % -> %', OLD.state, NEW.state USING ERRCODE='check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION rag_chunk_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_rag_chunk_guard ON rag_corpus_chunk;
CREATE TRIGGER trg_rag_chunk_guard BEFORE UPDATE ON rag_corpus_chunk
FOR EACH ROW EXECUTE FUNCTION rag_chunk_guard();

CREATE OR REPLACE FUNCTION rag_register_document(p_document_id text, p_source_kind text, p_visibility text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR principal='' THEN RAISE EXCEPTION 'rag principal missing' USING ERRCODE='insufficient_privilege'; END IF;
  IF p_visibility='global' AND principal<>'__system_rag__' THEN RAISE EXCEPTION 'only system may register global RAG document' USING ERRCODE='insufficient_privilege'; END IF;
  INSERT INTO rag_corpus_document(id,owner_user_id,visibility,source_kind)
  VALUES (p_document_id,principal,p_visibility,p_source_kind)
  ON CONFLICT (id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION rag_register_document(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_register_document(text,text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_publish_document_version(
  p_document_id text, p_content_hash text, p_parser_recipe_hash text, p_cleaning_recipe_hash text,
  p_chunker_recipe_hash text, p_source_locator jsonb, p_chunks jsonb
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true); v integer; old_v integer; owner text;
BEGIN
  IF jsonb_typeof(p_chunks) IS DISTINCT FROM 'array' OR jsonb_array_length(p_chunks)=0 THEN
    RAISE EXCEPTION 'rag document version requires a non-empty chunk array' USING ERRCODE='check_violation';
  END IF;
  SELECT current_content_version, owner_user_id INTO old_v, owner FROM rag_corpus_document WHERE id=p_document_id FOR UPDATE;
  IF NOT FOUND OR owner<>principal THEN RAISE EXCEPTION 'rag document not writable' USING ERRCODE='insufficient_privilege'; END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_to_recordset(p_chunks) AS x(id text, ordinal integer, content_hash text, content text, locator jsonb)
    WHERE id !~ '^[A-Za-z0-9:_-]{1,180}$' OR ordinal IS NULL OR ordinal<0
      OR content_hash !~ '^[0-9a-f]{64}$' OR content IS NULL OR char_length(content) NOT BETWEEN 1 AND 120000
  ) OR EXISTS (
    SELECT ordinal FROM jsonb_to_recordset(p_chunks) AS x(id text, ordinal integer, content_hash text, content text, locator jsonb)
    GROUP BY ordinal HAVING count(*)>1
  ) THEN RAISE EXCEPTION 'invalid or duplicate rag chunks' USING ERRCODE='check_violation'; END IF;
  v := old_v+1;
  IF old_v>0 THEN
    UPDATE rag_corpus_content_version SET state='superseded' WHERE document_id=p_document_id AND content_version=old_v AND state='active';
    UPDATE rag_corpus_chunk SET state='superseded' WHERE document_id=p_document_id AND content_version=old_v AND state='active';
    INSERT INTO rag_corpus_tombstone(chunk_id,document_id,content_version,owner_user_id,reason)
      SELECT id,document_id,content_version,owner,'supersede' FROM rag_corpus_chunk
      WHERE document_id=p_document_id AND content_version=old_v ON CONFLICT (chunk_id) DO NOTHING;
  END IF;
  INSERT INTO rag_corpus_content_version(document_id,content_version,content_hash,parser_recipe_hash,cleaning_recipe_hash,chunker_recipe_hash,source_locator)
  VALUES (p_document_id,v,p_content_hash,p_parser_recipe_hash,p_cleaning_recipe_hash,p_chunker_recipe_hash,coalesce(p_source_locator,'{}'::jsonb));
  INSERT INTO rag_corpus_chunk(id,document_id,content_version,ordinal,content_hash,content,locator)
    SELECT id,p_document_id,v,ordinal,content_hash,content,coalesce(locator,'{}'::jsonb)
    FROM jsonb_to_recordset(p_chunks) AS x(id text, ordinal integer, content_hash text, content text, locator jsonb);
  UPDATE rag_corpus_document SET current_content_version=v,content_hash=p_content_hash,status='active',row_version=row_version+1,updated_at=clock_timestamp()
    WHERE id=p_document_id;
  UPDATE rag_corpus_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
  RETURN v;
END;
$$;
REVOKE ALL ON FUNCTION rag_publish_document_version(text,text,text,text,text,jsonb,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_publish_document_version(text,text,text,text,text,jsonb,jsonb) TO app_role;

CREATE OR REPLACE FUNCTION rag_register_embedding_recipe(
  p_id text,p_recipe_hash text,p_provider text,p_model text,p_provider_revision text,p_dimensions integer,
  p_normalization_version text,p_chunker_recipe_hash text,p_document_transform_version text,p_query_transform_version text,p_manifest jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM rag_require_system();
  INSERT INTO rag_embedding_recipe(id,recipe_hash,provider,model,provider_revision,dimensions,normalization_version,chunker_recipe_hash,document_transform_version,query_transform_version,manifest)
  VALUES (p_id,p_recipe_hash,p_provider,p_model,p_provider_revision,p_dimensions,p_normalization_version,p_chunker_recipe_hash,p_document_transform_version,p_query_transform_version,p_manifest)
  ON CONFLICT (recipe_hash) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION rag_register_embedding_recipe(text,text,text,text,text,integer,text,text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_register_embedding_recipe(text,text,text,text,text,integer,text,text,text,text,jsonb) TO app_role;

CREATE OR REPLACE FUNCTION rag_register_release_policy(p_id text,p_min_queries integer,p_recall_bp integer,p_p95_bp integer,p_cost_bp integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM rag_require_system();
  INSERT INTO rag_release_policy(id,min_labeled_queries,max_recall_drop_bp,max_p95_regression_bp,max_cost_regression_bp)
  VALUES (p_id,p_min_queries,p_recall_bp,p_p95_bp,p_cost_bp) ON CONFLICT (id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION rag_register_release_policy(text,integer,integer,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_register_release_policy(text,integer,integer,integer,integer) TO app_role;

CREATE OR REPLACE FUNCTION rag_start_generation(p_generation_id text,p_recipe_id text,p_policy_id text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE ep bigint; dim integer; tab text; expected integer;
BEGIN
  PERFORM rag_require_system();
  SELECT epoch INTO ep FROM rag_corpus_epoch WHERE singleton FOR SHARE;
  SELECT dimensions INTO dim FROM rag_embedding_recipe WHERE id=p_recipe_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag recipe not found' USING ERRCODE='foreign_key_violation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM rag_release_policy WHERE id=p_policy_id) THEN RAISE EXCEPTION 'rag release policy not found' USING ERRCODE='foreign_key_violation'; END IF;
  tab := 'rag_vector_' || replace(substr(p_generation_id,6),'-','');
  INSERT INTO rag_embedding_generation(id,recipe_id,release_policy_id,source_epoch,expected_chunk_count,physical_table,state)
  VALUES (p_generation_id,p_recipe_id,p_policy_id,ep,0,tab,'building');
  INSERT INTO rag_generation_member(generation_id,chunk_id,document_id,owner_user_id,visibility,content_version,content_hash)
    SELECT p_generation_id,c.id,c.document_id,d.owner_user_id,d.visibility,c.content_version,c.content_hash
      FROM rag_corpus_chunk c JOIN rag_corpus_document d ON d.id=c.document_id
     WHERE c.state='active' AND d.status='active' AND d.current_content_version=c.content_version;
  SELECT count(*)::integer INTO expected FROM rag_generation_member WHERE generation_id=p_generation_id;
  UPDATE rag_embedding_generation SET expected_chunk_count=expected WHERE id=p_generation_id;
  RETURN expected;
END;
$$;
REVOKE ALL ON FUNCTION rag_start_generation(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_start_generation(text,text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_prepare_generation_storage(p_generation_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE tab text; dim integer; p_read text; p_delete text; idx text;
BEGIN
  PERFORM rag_require_system();
  SELECT g.physical_table,r.dimensions INTO tab,dim FROM rag_embedding_generation g JOIN rag_embedding_recipe r ON r.id=g.recipe_id
   WHERE g.id=p_generation_id AND g.state='building';
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid rag building generation' USING ERRCODE='check_violation'; END IF;
  p_read := 'p_' || tab || '_read'; p_delete := 'p_' || tab || '_delete'; idx := 'i_' || tab || '_hnsw';
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I (chunk_id text PRIMARY KEY, document_id text NOT NULL, owner_user_id text NOT NULL, visibility text NOT NULL CHECK (visibility IN (''private'',''global'')), content_version integer NOT NULL, embedding vector(%s) NOT NULL)',tab,dim);
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',tab);
  EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY',tab);
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I',p_read,tab);
  EXECUTE format('CREATE POLICY %I ON %I FOR SELECT USING (visibility=''global'' OR owner_user_id=current_setting(''app.principal_user'', true))',p_read,tab);
  EXECUTE format('DROP POLICY IF EXISTS %I ON %I',p_delete,tab);
  EXECUTE format('CREATE POLICY %I ON %I FOR DELETE USING (owner_user_id=current_setting(''app.principal_user'', true) OR current_setting(''app.principal_user'', true)=''__system_rag__'')',p_delete,tab);
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I USING hnsw (embedding vector_cosine_ops)',idx,tab);
  EXECUTE format('GRANT SELECT ON %I TO app_role',tab);
END;
$$;
REVOKE ALL ON FUNCTION rag_prepare_generation_storage(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_prepare_generation_storage(text) TO app_role;

CREATE OR REPLACE FUNCTION rag_insert_generation_vector(p_generation_id text,p_chunk_id text,p_embedding vector)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE tab text; dim integer; m record;
BEGIN
  PERFORM rag_require_system();
  SELECT g.physical_table,r.dimensions INTO tab,dim FROM rag_embedding_generation g JOIN rag_embedding_recipe r ON r.id=g.recipe_id
    WHERE g.id=p_generation_id AND g.state='building';
  IF NOT FOUND OR vector_dims(p_embedding)<>dim THEN RAISE EXCEPTION 'invalid rag generation vector' USING ERRCODE='check_violation'; END IF;
  SELECT gm.* INTO m FROM rag_generation_member gm JOIN rag_corpus_chunk c ON c.id=gm.chunk_id
    WHERE gm.generation_id=p_generation_id AND gm.chunk_id=p_chunk_id AND c.state='active'
      AND NOT EXISTS (SELECT 1 FROM rag_corpus_tombstone t WHERE t.chunk_id=gm.chunk_id AND t.reason IN ('delete','erasure'));
  IF NOT FOUND THEN RAISE EXCEPTION 'rag generation member unavailable or tombstoned' USING ERRCODE='check_violation'; END IF;
  EXECUTE format('INSERT INTO %I(chunk_id,document_id,owner_user_id,visibility,content_version,embedding) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (chunk_id) DO NOTHING',tab)
    USING m.chunk_id,m.document_id,m.owner_user_id,m.visibility,m.content_version,p_embedding;
END;
$$;
REVOKE ALL ON FUNCTION rag_insert_generation_vector(text,text,vector) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_insert_generation_vector(text,text,vector) TO app_role;

CREATE OR REPLACE FUNCTION rag_validate_generation(p_generation_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE tab text; expected integer; actual integer; source_ep bigint; now_ep bigint; invalid_count integer;
BEGIN
  PERFORM rag_require_system();
  SELECT physical_table,expected_chunk_count,source_epoch INTO tab,expected,source_ep FROM rag_embedding_generation WHERE id=p_generation_id AND state='building' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag generation is not building' USING ERRCODE='check_violation'; END IF;
  EXECUTE format('SELECT count(*) FROM %I',tab) INTO actual;
  SELECT epoch INTO now_ep FROM rag_corpus_epoch WHERE singleton FOR SHARE;
  SELECT count(*)::integer INTO invalid_count FROM rag_generation_member gm JOIN rag_corpus_chunk c ON c.id=gm.chunk_id
    WHERE gm.generation_id=p_generation_id AND (c.state<>'active' OR EXISTS (SELECT 1 FROM rag_corpus_tombstone t WHERE t.chunk_id=gm.chunk_id AND t.reason IN ('delete','erasure')));
  IF actual<>expected THEN RAISE EXCEPTION 'rag generation vector count % != expected %',actual,expected USING ERRCODE='check_violation'; END IF;
  IF now_ep<>source_ep THEN RAISE EXCEPTION 'rag corpus changed during generation build (% -> %)',source_ep,now_ep USING ERRCODE='serialization_failure'; END IF;
  IF invalid_count<>0 THEN RAISE EXCEPTION 'rag generation source became unavailable during build' USING ERRCODE='serialization_failure'; END IF;
  UPDATE rag_embedding_generation SET state='shadow',validated_at=clock_timestamp() WHERE id=p_generation_id;
END;
$$;
REVOKE ALL ON FUNCTION rag_validate_generation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_validate_generation(text) TO app_role;

CREATE OR REPLACE FUNCTION rag_record_shadow_evaluation(
  p_generation_id text,p_dataset_revision text,p_labeled integer,p_base_recall numeric,p_candidate_recall numeric,
  p_base_p95 numeric,p_candidate_p95 numeric,p_base_cost numeric,p_candidate_cost numeric
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE policy rag_release_policy%ROWTYPE; verdict text;
BEGIN
  PERFORM rag_require_system();
  SELECT p.* INTO policy FROM rag_embedding_generation g JOIN rag_release_policy p ON p.id=g.release_policy_id
    WHERE g.id=p_generation_id AND g.state='shadow';
  IF NOT FOUND THEN RAISE EXCEPTION 'rag generation is not in shadow' USING ERRCODE='check_violation'; END IF;
  verdict := CASE WHEN p_labeled>=policy.min_labeled_queries
      AND p_candidate_recall >= p_base_recall - policy.max_recall_drop_bp::numeric/10000
      AND p_candidate_p95 <= p_base_p95*(1+policy.max_p95_regression_bp::numeric/10000)
      AND p_candidate_cost <= p_base_cost*(1+policy.max_cost_regression_bp::numeric/10000)
    THEN 'passed' ELSE 'failed' END;
  INSERT INTO rag_shadow_evaluation(generation_id,dataset_revision,labeled_query_count,baseline_recall,candidate_recall,baseline_p95_ms,candidate_p95_ms,baseline_cost_per_query,candidate_cost_per_query,verdict)
  VALUES (p_generation_id,p_dataset_revision,p_labeled,p_base_recall,p_candidate_recall,p_base_p95,p_candidate_p95,p_base_cost,p_candidate_cost,verdict)
  ON CONFLICT (generation_id) DO NOTHING;
  RETURN verdict;
END;
$$;
REVOKE ALL ON FUNCTION rag_record_shadow_evaluation(text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_record_shadow_evaluation(text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric) TO app_role;

CREATE OR REPLACE FUNCTION rag_gate_generation(p_generation_id text,p_approval_ref text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM rag_require_system();
  IF char_length(coalesce(p_approval_ref,''))<8 THEN RAISE EXCEPTION 'rag release requires an auditable approval reference' USING ERRCODE='check_violation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM rag_embedding_generation g JOIN rag_shadow_evaluation e ON e.generation_id=g.id
    WHERE g.id=p_generation_id AND g.state='shadow' AND e.verdict='passed') THEN
    RAISE EXCEPTION 'rag shadow evaluation gate not passed' USING ERRCODE='check_violation';
  END IF;
  UPDATE rag_embedding_generation SET state='gated' WHERE id=p_generation_id;
  INSERT INTO rag_generation_rollout(generation_id,percent,status) VALUES (p_generation_id,0,'ready') ON CONFLICT (generation_id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION rag_gate_generation(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_gate_generation(text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_advance_rollout(p_generation_id text,p_percent integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE old_percent integer;
BEGIN
  PERFORM rag_require_system();
  SELECT percent INTO old_percent FROM rag_generation_rollout WHERE generation_id=p_generation_id FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM rag_embedding_generation WHERE id=p_generation_id AND state='gated') THEN
    RAISE EXCEPTION 'rag generation is not gated' USING ERRCODE='check_violation';
  END IF;
  IF p_percent NOT IN (1,10,50,100) OR p_percent<=old_percent THEN RAISE EXCEPTION 'invalid non-monotonic rollout step' USING ERRCODE='check_violation'; END IF;
  UPDATE rag_generation_rollout SET percent=p_percent,status=CASE WHEN p_percent=100 THEN 'completed' ELSE 'running' END,updated_at=clock_timestamp() WHERE generation_id=p_generation_id;
END;
$$;
REVOKE ALL ON FUNCTION rag_advance_rollout(text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_advance_rollout(text,integer) TO app_role;

CREATE OR REPLACE FUNCTION rag_promote_generation(p_generation_id text,p_expected_previous text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE source_ep bigint; now_ep bigint; previous text; rollout integer;
BEGIN
  PERFORM rag_require_system();
  SELECT source_epoch INTO source_ep FROM rag_embedding_generation WHERE id=p_generation_id AND state='gated' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag generation is not gated' USING ERRCODE='check_violation'; END IF;
  SELECT percent INTO rollout FROM rag_generation_rollout WHERE generation_id=p_generation_id;
  IF rollout IS DISTINCT FROM 100 THEN RAISE EXCEPTION 'rag generation rollout is not complete' USING ERRCODE='check_violation'; END IF;
  SELECT epoch INTO now_ep FROM rag_corpus_epoch WHERE singleton FOR SHARE;
  IF source_ep<>now_ep THEN RAISE EXCEPTION 'rag corpus changed since candidate snapshot' USING ERRCODE='serialization_failure'; END IF;
  SELECT generation_id INTO previous FROM rag_active_generation WHERE singleton FOR UPDATE;
  IF previous IS DISTINCT FROM NULLIF(p_expected_previous,'') THEN RAISE EXCEPTION 'rag active generation CAS conflict' USING ERRCODE='serialization_failure'; END IF;
  IF previous IS NOT NULL THEN UPDATE rag_embedding_generation SET state='deprecated' WHERE id=previous AND state='active'; END IF;
  UPDATE rag_embedding_generation SET state='active',activated_at=clock_timestamp() WHERE id=p_generation_id;
  UPDATE rag_active_generation SET generation_id=p_generation_id,row_version=row_version+1,switched_at=clock_timestamp() WHERE singleton;
END;
$$;
REVOKE ALL ON FUNCTION rag_promote_generation(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_promote_generation(text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_rollback_generation(p_target_generation text,p_expected_active text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE source_ep bigint; now_ep bigint; current_active text;
BEGIN
  PERFORM rag_require_system();
  SELECT source_epoch INTO source_ep FROM rag_embedding_generation WHERE id=p_target_generation AND state='deprecated' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag rollback target is not retained/deprecated' USING ERRCODE='check_violation'; END IF;
  SELECT epoch INTO now_ep FROM rag_corpus_epoch WHERE singleton FOR SHARE;
  IF source_ep<>now_ep THEN RAISE EXCEPTION 'rag rollback target has a stale corpus snapshot' USING ERRCODE='serialization_failure'; END IF;
  SELECT generation_id INTO current_active FROM rag_active_generation WHERE singleton FOR UPDATE;
  IF current_active IS DISTINCT FROM p_expected_active THEN RAISE EXCEPTION 'rag rollback CAS conflict' USING ERRCODE='serialization_failure'; END IF;
  UPDATE rag_embedding_generation SET state='deprecated' WHERE id=current_active AND state='active';
  UPDATE rag_embedding_generation SET state='active',activated_at=clock_timestamp() WHERE id=p_target_generation;
  UPDATE rag_active_generation SET generation_id=p_target_generation,row_version=row_version+1,switched_at=clock_timestamp() WHERE singleton;
END;
$$;
REVOKE ALL ON FUNCTION rag_rollback_generation(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_rollback_generation(text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_bind_query(p_binding_id text,p_sticky_key text,p_ttl_seconds integer)
RETURNS TABLE(generation_id text,recipe_id text) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true); active text; candidate text; pct integer; ep bigint; candidate_ep bigint; selected text;
BEGIN
  IF principal IS NULL OR principal='' OR p_ttl_seconds NOT BETWEEN 60 AND 604800 OR char_length(p_sticky_key) NOT BETWEEN 1 AND 512 THEN
    RAISE EXCEPTION 'invalid rag query binding' USING ERRCODE='check_violation';
  END IF;
  SELECT epoch INTO ep FROM rag_corpus_epoch WHERE singleton;
  SELECT a.generation_id INTO active FROM rag_active_generation a;
  IF active IS NOT NULL AND NOT EXISTS (SELECT 1 FROM rag_embedding_generation g WHERE g.id=active AND g.state='active' AND g.source_epoch=ep) THEN
    RAISE EXCEPTION 'rag active generation is stale; rebuild before binding new query' USING ERRCODE='serialization_failure';
  END IF;
  SELECT g.id,r.percent,g.source_epoch INTO candidate,pct,candidate_ep FROM rag_embedding_generation g JOIN rag_generation_rollout r ON r.generation_id=g.id
    WHERE g.state='gated' AND r.status IN ('running','completed') ORDER BY g.created_at DESC LIMIT 1;
  IF candidate IS NOT NULL AND candidate_ep=ep AND (get_byte(decode(substr(md5(p_sticky_key),1,2),'hex'),0) % 100) < pct THEN selected:=candidate; ELSE selected:=active; END IF;
  IF selected IS NULL THEN RAISE EXCEPTION 'rag active generation unavailable' USING ERRCODE='no_data_found'; END IF;
  INSERT INTO rag_query_binding(id,owner_user_id,generation_id,sticky_key_hash,expires_at)
  VALUES (p_binding_id,principal,selected,encode(digest(p_sticky_key,'sha256'),'hex'),clock_timestamp()+make_interval(secs=>p_ttl_seconds))
  ON CONFLICT (id) DO NOTHING;
  RETURN QUERY SELECT b.generation_id,g.recipe_id FROM rag_query_binding b JOIN rag_embedding_generation g ON g.id=b.generation_id
   WHERE b.id=p_binding_id AND b.owner_user_id=principal;
END;
$$;
REVOKE ALL ON FUNCTION rag_bind_query(text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_bind_query(text,text,integer) TO app_role;

CREATE OR REPLACE FUNCTION rag_resolve_query_binding(p_binding_id text)
RETURNS TABLE(generation_id text,recipe_id text,dimensions integer) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true);
BEGIN
  UPDATE rag_query_binding SET status='expired' WHERE id=p_binding_id AND owner_user_id=principal AND status='active' AND expires_at<=clock_timestamp();
  RETURN QUERY SELECT b.generation_id,r.id,r.dimensions FROM rag_query_binding b
    JOIN rag_embedding_generation g ON g.id=b.generation_id AND g.state IN ('active','gated','deprecated')
    JOIN rag_embedding_recipe r ON r.id=g.recipe_id
    WHERE b.id=p_binding_id AND b.owner_user_id=principal AND b.status='active' AND b.expires_at>clock_timestamp();
  IF NOT FOUND THEN RAISE EXCEPTION 'rag binding unavailable, expired, or unauthorized' USING ERRCODE='no_data_found'; END IF;
END;
$$;
REVOKE ALL ON FUNCTION rag_resolve_query_binding(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_resolve_query_binding(text) TO app_role;

CREATE OR REPLACE FUNCTION rag_search_bound(p_binding_id text,p_embedding vector,p_k integer)
RETURNS TABLE(chunk_id text,document_id text,content_version integer,distance double precision) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE gen text; tab text; dim integer;
BEGIN
  IF p_k NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'invalid rag search k' USING ERRCODE='check_violation'; END IF;
  SELECT generation_id,recipe_id,dimensions INTO gen,tab,dim FROM rag_resolve_query_binding(p_binding_id);
  SELECT physical_table INTO tab FROM rag_embedding_generation WHERE id=gen;
  IF vector_dims(p_embedding)<>dim THEN RAISE EXCEPTION 'rag query embedding recipe dimension mismatch' USING ERRCODE='check_violation'; END IF;
  RETURN QUERY EXECUTE format(
    'SELECT v.chunk_id,v.document_id,v.content_version,(v.embedding <=> $1)::double precision
       FROM %I v JOIN rag_generation_member m ON m.generation_id=$2 AND m.chunk_id=v.chunk_id
       JOIN rag_corpus_chunk c ON c.id=v.chunk_id AND c.state IN (''active'',''superseded'')
      WHERE (v.visibility=''global'' OR v.owner_user_id=current_setting(''app.principal_user'', true))
        AND NOT EXISTS (SELECT 1 FROM rag_corpus_tombstone t WHERE t.chunk_id=v.chunk_id AND t.reason IN (''delete'',''erasure''))
      ORDER BY v.embedding <=> $1 LIMIT $3',tab)
    USING p_embedding,gen,p_k;
END;
$$;
REVOKE ALL ON FUNCTION rag_search_bound(text,vector,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_search_bound(text,vector,integer) TO app_role;

CREATE OR REPLACE FUNCTION rag_evidence_bound(p_binding_id text,p_chunk_ids text[],p_max_chars integer)
RETURNS TABLE(chunk_id text,document_id text,content_version integer,snapshot_hash text,locator jsonb,excerpt text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE gen text;
BEGIN
  IF coalesce(array_length(p_chunk_ids,1),0)>50 OR p_max_chars NOT BETWEEN 1 AND 1200 THEN RAISE EXCEPTION 'invalid rag evidence request' USING ERRCODE='check_violation'; END IF;
  SELECT generation_id INTO gen FROM rag_resolve_query_binding(p_binding_id);
  RETURN QUERY
    SELECT c.id,c.document_id,c.content_version,c.content_hash,c.locator,left(c.content,p_max_chars)
      FROM unnest(p_chunk_ids) WITH ORDINALITY u(id,ord)
      JOIN rag_generation_member m ON m.generation_id=gen AND m.chunk_id=u.id
      JOIN rag_corpus_chunk c ON c.id=m.chunk_id AND c.state IN ('active','superseded')
      JOIN rag_corpus_document d ON d.id=c.document_id
     WHERE (d.visibility='global' OR d.owner_user_id=current_setting('app.principal_user', true))
       AND NOT EXISTS (SELECT 1 FROM rag_corpus_tombstone t WHERE t.chunk_id=c.id AND t.reason IN ('delete','erasure'))
     ORDER BY u.ord;
END;
$$;
REVOKE ALL ON FUNCTION rag_evidence_bound(text,text[],integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_evidence_bound(text,text[],integer) TO app_role;

CREATE OR REPLACE FUNCTION rag_record_citation(p_citation_id text,p_binding_id text,p_chunk_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true); gen text; chunk_row record;
BEGIN
  SELECT generation_id INTO gen FROM rag_resolve_query_binding(p_binding_id);
  SELECT ch.* INTO chunk_row FROM rag_corpus_chunk ch JOIN rag_generation_member m ON m.chunk_id=ch.id AND m.generation_id=gen WHERE ch.id=p_chunk_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag citation chunk is not bound to generation' USING ERRCODE='check_violation'; END IF;
  INSERT INTO rag_citation(id,owner_user_id,binding_id,generation_id,chunk_id,document_id,content_version,snapshot_hash)
  VALUES (p_citation_id,principal,p_binding_id,gen,chunk_row.id,chunk_row.document_id,chunk_row.content_version,chunk_row.content_hash)
  ON CONFLICT (id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION rag_record_citation(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_record_citation(text,text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_tombstone_document(p_document_id text,p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true); owner text; g record; c record;
BEGIN
  IF p_reason NOT IN ('delete','erasure') THEN RAISE EXCEPTION 'invalid rag tombstone reason' USING ERRCODE='check_violation'; END IF;
  SELECT owner_user_id INTO owner FROM rag_corpus_document WHERE id=p_document_id FOR UPDATE;
  IF NOT FOUND OR owner<>principal THEN RAISE EXCEPTION 'rag document not writable' USING ERRCODE='insufficient_privilege'; END IF;
  FOR c IN SELECT * FROM rag_corpus_chunk WHERE document_id=p_document_id AND state IN ('active','superseded') LOOP
    UPDATE rag_corpus_chunk SET state='tombstoned' WHERE id=c.id;
    UPDATE rag_corpus_content_version SET state='tombstoned' WHERE document_id=c.document_id AND content_version=c.content_version AND state IN ('active','superseded');
    INSERT INTO rag_corpus_tombstone(chunk_id,document_id,content_version,owner_user_id,reason)
      VALUES (c.id,c.document_id,c.content_version,owner,p_reason) ON CONFLICT (chunk_id) DO UPDATE SET reason=EXCLUDED.reason;
    FOR g IN SELECT physical_table FROM rag_embedding_generation LOOP
      EXECUTE format('DELETE FROM %I WHERE chunk_id=$1',g.physical_table) USING c.id;
    END LOOP;
    UPDATE rag_citation SET status='invalidated' WHERE chunk_id=c.id AND status='valid';
  END LOOP;
  UPDATE rag_corpus_document SET status=CASE WHEN p_reason='erasure' THEN 'hard_deleted' ELSE 'soft_deleted' END,
    retained_until=CASE WHEN p_reason='erasure' THEN clock_timestamp() ELSE clock_timestamp()+interval '30 days' END,
    row_version=row_version+1,updated_at=clock_timestamp() WHERE id=p_document_id;
  UPDATE rag_corpus_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
END;
$$;
REVOKE ALL ON FUNCTION rag_tombstone_document(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_tombstone_document(text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_create_rebuild_run(p_run_id text,p_generation_id text,p_deadline_at timestamptz,p_pause_budget_seconds integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM rag_require_system();
  INSERT INTO rag_rebuild_run(id,generation_id,deadline_at,pause_budget_seconds)
  VALUES (p_run_id,p_generation_id,p_deadline_at,p_pause_budget_seconds) ON CONFLICT (generation_id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION rag_create_rebuild_run(text,text,timestamptz,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_create_rebuild_run(text,text,timestamptz,integer) TO app_role;

CREATE OR REPLACE FUNCTION rag_claim_rebuild_run(p_run_id text,p_worker text,p_lease_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE claimed boolean;
BEGIN
  PERFORM rag_require_system();
  IF p_lease_seconds NOT BETWEEN 5 AND 3600 THEN RAISE EXCEPTION 'invalid rebuild lease' USING ERRCODE='check_violation'; END IF;
  UPDATE rag_rebuild_run SET status='running',lease_owner=p_worker,lease_expires_at=clock_timestamp()+make_interval(secs=>p_lease_seconds),heartbeat_at=clock_timestamp(),row_version=row_version+1
   WHERE id=p_run_id AND status IN ('pending','running','orphaned') AND (lease_owner IS NULL OR lease_owner=p_worker OR lease_expires_at<clock_timestamp())
   RETURNING true INTO claimed;
  RETURN coalesce(claimed,false);
END;
$$;
REVOKE ALL ON FUNCTION rag_claim_rebuild_run(text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_claim_rebuild_run(text,text,integer) TO app_role;

CREATE OR REPLACE FUNCTION rag_heartbeat_rebuild_run(p_run_id text,p_worker text,p_lease_seconds integer,p_cursor jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE ok boolean;
BEGIN
  PERFORM rag_require_system();
  UPDATE rag_rebuild_run SET lease_expires_at=clock_timestamp()+make_interval(secs=>p_lease_seconds),heartbeat_at=clock_timestamp(),cursor=coalesce(p_cursor,'{}'::jsonb),row_version=row_version+1
   WHERE id=p_run_id AND status='running' AND lease_owner=p_worker AND lease_expires_at>=clock_timestamp() RETURNING true INTO ok;
  RETURN coalesce(ok,false);
END;
$$;
REVOKE ALL ON FUNCTION rag_heartbeat_rebuild_run(text,text,integer,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_heartbeat_rebuild_run(text,text,integer,jsonb) TO app_role;
