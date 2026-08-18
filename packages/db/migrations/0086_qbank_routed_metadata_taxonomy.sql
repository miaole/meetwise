-- 0086_qbank_routed_metadata_taxonomy.sql
--
-- RAG-FUNNEL-01 starts at ingestion, not at query routing.  A job classifier
-- can only choose a pre-reviewed serving leaf; it may never invent a bucket
-- for an unlabelled corpus.  This migration therefore records immutable,
-- versioned metadata for each QBank cut and for every published question
-- artifact.  It deliberately does not yet change the legacy global retrieval
-- functions: RAG-FUNNEL-02..04 must build projection-local indexes and query
-- predicates before any `wrong_track=0` serving claim is valid.

CREATE TABLE IF NOT EXISTS qbank_taxonomy_release (
  version      text PRIMARY KEY CHECK (version ~ '^v[1-9][0-9]{0,15}$'),
  release_hash text NOT NULL UNIQUE CHECK (release_hash ~ '^[0-9a-f]{64}$'),
  state        text NOT NULL CHECK (state IN ('draft','released')),
  created_at   timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS qbank_taxonomy_scope (
  taxonomy_version text NOT NULL REFERENCES qbank_taxonomy_release(version),
  scope_id         text NOT NULL CHECK (scope_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'),
  parent_scope_id  text,
  is_leaf          boolean NOT NULL,
  display_name     text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 96),
  created_at       timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (taxonomy_version, scope_id),
  FOREIGN KEY (taxonomy_version, parent_scope_id)
    REFERENCES qbank_taxonomy_scope(taxonomy_version, scope_id)
    DEFERRABLE INITIALLY DEFERRED,
  CHECK ((parent_scope_id IS NULL AND position('/' IN scope_id)=0)
      OR (parent_scope_id IS NOT NULL AND scope_id LIKE parent_scope_id || '/%'))
);

-- A QBank raw chunk may eventually have more than one separately-reviewed
-- projection.  The metadata lives on this mapping, not on qbank_source and
-- not on a mutable query string.  A source-wide default must never silently
-- label a mixed document's sibling cuts.
CREATE TABLE IF NOT EXISTS qbank_chunk_serving_scope (
  ref_id             text NOT NULL REFERENCES qbank_chunk(ref_id),
  taxonomy_version   text NOT NULL,
  serving_scope_id   text NOT NULL,
  annotation_source  text NOT NULL CHECK (annotation_source IN ('curator_reviewed','seed_v1_reviewed')),
  metadata_hash      text NOT NULL CHECK (metadata_hash ~ '^[0-9a-f]{64}$'),
  created_at         timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (ref_id, taxonomy_version, serving_scope_id),
  FOREIGN KEY (taxonomy_version, serving_scope_id)
    REFERENCES qbank_taxonomy_scope(taxonomy_version, scope_id)
);
CREATE INDEX IF NOT EXISTS ix_qbank_chunk_serving_scope_scope
  ON qbank_chunk_serving_scope(taxonomy_version, serving_scope_id, ref_id);

ALTER TABLE qbank_question
  ADD COLUMN IF NOT EXISTS metadata_state text NOT NULL DEFAULT 'legacy_unrouted',
  ADD COLUMN IF NOT EXISTS taxonomy_version text,
  ADD COLUMN IF NOT EXISTS serving_scope_id text,
  ADD COLUMN IF NOT EXISTS annotation_source text,
  ADD COLUMN IF NOT EXISTS metadata_hash text;

ALTER TABLE qbank_question
  DROP CONSTRAINT IF EXISTS qbank_question_metadata_shape_check;
ALTER TABLE qbank_question
  ADD CONSTRAINT qbank_question_metadata_shape_check CHECK (
    (metadata_state='legacy_unrouted'
      AND taxonomy_version IS NULL AND serving_scope_id IS NULL
      AND annotation_source IS NULL AND metadata_hash IS NULL)
    OR
    (metadata_state='reviewed'
      AND taxonomy_version ~ '^v[1-9][0-9]{0,15}$'
      AND serving_scope_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'
      AND annotation_source IN ('curator_reviewed','seed_v1_reviewed')
      AND metadata_hash ~ '^[0-9a-f]{64}$')
  );
ALTER TABLE qbank_question
  DROP CONSTRAINT IF EXISTS qbank_question_metadata_scope_fk;
ALTER TABLE qbank_question
  ADD CONSTRAINT qbank_question_metadata_scope_fk
  FOREIGN KEY (taxonomy_version, serving_scope_id)
  REFERENCES qbank_taxonomy_scope(taxonomy_version, scope_id);

ALTER TABLE qbank_question_chunk
  ADD COLUMN IF NOT EXISTS content_hash text,
  ADD COLUMN IF NOT EXISTS taxonomy_version text,
  ADD COLUMN IF NOT EXISTS serving_scope_id text,
  ADD COLUMN IF NOT EXISTS annotation_source text,
  ADD COLUMN IF NOT EXISTS metadata_hash text;
ALTER TABLE qbank_question_chunk
  DROP CONSTRAINT IF EXISTS qbank_question_chunk_metadata_shape_check;
ALTER TABLE qbank_question_chunk
  ADD CONSTRAINT qbank_question_chunk_metadata_shape_check CHECK (
    (content_hash IS NULL AND taxonomy_version IS NULL AND serving_scope_id IS NULL
      AND annotation_source IS NULL AND metadata_hash IS NULL)
    OR
    (content_hash ~ '^[0-9a-f]{32}$'
      AND taxonomy_version ~ '^v[1-9][0-9]{0,15}$'
      AND serving_scope_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'
      AND annotation_source IN ('curator_reviewed','seed_v1_reviewed')
      AND metadata_hash ~ '^[0-9a-f]{64}$')
  );
ALTER TABLE qbank_question_chunk
  DROP CONSTRAINT IF EXISTS qbank_question_chunk_metadata_scope_fk;
ALTER TABLE qbank_question_chunk
  ADD CONSTRAINT qbank_question_chunk_metadata_scope_fk
  FOREIGN KEY (taxonomy_version, serving_scope_id)
  REFERENCES qbank_taxonomy_scope(taxonomy_version, scope_id);

-- The generated hashes are deliberately simple, byte-stable tuple hashes.
-- The application uses the same UTF-8 tuple function before it computes the
-- enclosing artifact receipt.  No free-form JSON serialization participates
-- in this integrity boundary.
CREATE OR REPLACE FUNCTION qbank_metadata_hash(
  p_kind text, p_taxonomy_version text, p_scope_id text, p_annotation_source text
) RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT encode(digest(convert_to(
    p_kind || ':' || p_taxonomy_version || ':' || p_scope_id || ':' || p_annotation_source,
    'UTF8'
  ), 'sha256'), 'hex')
$$;
REVOKE ALL ON FUNCTION qbank_metadata_hash(text,text,text,text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION qbank_metadata_hash(text,text,text,text) TO qbank_control_executor;

CREATE OR REPLACE FUNCTION qbank_taxonomy_release_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.state <> 'draft' THEN
      RAISE EXCEPTION 'qbank_taxonomy_release_must_start_draft' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_OP='UPDATE'
     AND OLD.state='draft' AND NEW.state='released'
     AND NEW.version=OLD.version AND NEW.created_at=OLD.created_at
     AND NEW.release_hash=qbank_taxonomy_manifest_hash(NEW.version) THEN
    RETURN NEW;
  END IF;
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'qbank_taxonomy_release_immutable' USING ERRCODE='check_violation';
  END IF;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION qbank_taxonomy_release_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_taxonomy_release_guard ON qbank_taxonomy_release;
CREATE TRIGGER trg_qbank_taxonomy_release_guard
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_taxonomy_release
  FOR EACH ROW EXECUTE FUNCTION qbank_taxonomy_release_guard();

CREATE OR REPLACE FUNCTION qbank_taxonomy_scope_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'qbank_taxonomy_scope_immutable' USING ERRCODE='check_violation';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM qbank_taxonomy_release r
     WHERE r.version=NEW.taxonomy_version AND r.state='draft'
  ) THEN
    RAISE EXCEPTION 'qbank_taxonomy_scope_release_missing' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_taxonomy_scope_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_taxonomy_scope_guard ON qbank_taxonomy_scope;
CREATE TRIGGER trg_qbank_taxonomy_scope_guard
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_taxonomy_scope
  FOR EACH ROW EXECUTE FUNCTION qbank_taxonomy_scope_guard();

-- A release hash is a canonical receipt of every tree entry, not a label for
-- four root nodes.  It is checked exactly at draft -> released, after all
-- entries have been inserted and before anything may receive the version.
CREATE OR REPLACE FUNCTION qbank_taxonomy_manifest_hash(p_version text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT encode(digest(convert_to(
    'qbank-taxonomy-manifest:v1:' || p_version || ':' || COALESCE(string_agg(
      scope_id || ':' || COALESCE(parent_scope_id,'') || ':' || is_leaf::text || ':' || display_name,
      E'\n' ORDER BY scope_id
    ), ''),
    'UTF8'
  ), 'sha256'), 'hex')
  FROM qbank_taxonomy_scope
  WHERE taxonomy_version=p_version
$$;
REVOKE ALL ON FUNCTION qbank_taxonomy_manifest_hash(text) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION qbank_taxonomy_manifest_hash(text) TO qbank_control_executor;

CREATE OR REPLACE FUNCTION qbank_chunk_serving_scope_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'qbank_chunk_serving_scope_immutable' USING ERRCODE='check_violation';
  END IF;
  IF NEW.metadata_hash IS DISTINCT FROM qbank_metadata_hash(
    'qbank-chunk-scope:v1', NEW.taxonomy_version, NEW.serving_scope_id, NEW.annotation_source
  ) THEN
    RAISE EXCEPTION 'qbank_chunk_serving_scope_hash_mismatch' USING ERRCODE='check_violation';
  END IF;
  IF NOT EXISTS (
    SELECT 1
      FROM qbank_taxonomy_release r
      JOIN qbank_taxonomy_scope s ON s.taxonomy_version=r.version
     WHERE r.version=NEW.taxonomy_version
       AND r.state='released'
       AND s.scope_id=NEW.serving_scope_id
       AND s.is_leaf
  ) THEN
    RAISE EXCEPTION 'qbank_chunk_serving_scope_not_released_leaf' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_chunk_serving_scope_guard() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_chunk_serving_scope_guard ON qbank_chunk_serving_scope;
CREATE TRIGGER trg_qbank_chunk_serving_scope_guard
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_chunk_serving_scope
  FOR EACH ROW EXECUTE FUNCTION qbank_chunk_serving_scope_guard();

-- The existing immutable artifact guards are extended rather than bypassed.
-- New artifacts are reviewed-only; pre-0086 rows remain explicitly legacy and
-- cannot become reviewed through an UPDATE.
CREATE OR REPLACE FUNCTION qbank_question_artifact_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP='DELETE' THEN
    RAISE EXCEPTION 'qbank_question_published_artifact_delete_forbidden' USING ERRCODE='check_violation';
  END IF;

  IF TG_OP='INSERT' THEN
    IF NEW.state <> 'draft' THEN
      RAISE EXCEPTION 'qbank_question_must_start_draft' USING ERRCODE='check_violation';
    END IF;
    IF NEW.metadata_state <> 'reviewed'
      OR NEW.metadata_hash IS DISTINCT FROM qbank_metadata_hash(
        'qbank-artifact-metadata:v1', NEW.taxonomy_version, NEW.serving_scope_id, NEW.annotation_source
      ) THEN
      RAISE EXCEPTION 'qbank_question_metadata_required' USING ERRCODE='check_violation';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM qbank_taxonomy_release r
      JOIN qbank_taxonomy_scope s ON s.taxonomy_version=r.version
      WHERE r.version=NEW.taxonomy_version AND r.state='released'
        AND s.scope_id=NEW.serving_scope_id AND s.is_leaf
    ) THEN
      RAISE EXCEPTION 'qbank_question_metadata_not_released_leaf' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.artifact_hash IS DISTINCT FROM OLD.artifact_hash
     OR NEW.competency IS DISTINCT FROM OLD.competency
     OR NEW.difficulty IS DISTINCT FROM OLD.difficulty
     OR NEW.metadata_state IS DISTINCT FROM OLD.metadata_state
     OR NEW.taxonomy_version IS DISTINCT FROM OLD.taxonomy_version
     OR NEW.serving_scope_id IS DISTINCT FROM OLD.serving_scope_id
     OR NEW.annotation_source IS DISTINCT FROM OLD.annotation_source
     OR NEW.metadata_hash IS DISTINCT FROM OLD.metadata_hash THEN
    RAISE EXCEPTION 'qbank_question_artifact_immutable' USING ERRCODE='check_violation';
  END IF;
  IF OLD.state='draft' AND NEW.state='published' THEN
    IF NOT EXISTS (
      SELECT 1 FROM qbank_question_chunk qc
       WHERE qc.question_id=NEW.id AND qc.role='prompt' AND qc.required
    ) OR NOT EXISTS (
      SELECT 1 FROM qbank_question_chunk qc
       WHERE qc.question_id=NEW.id AND qc.role='rubric' AND qc.required
    ) OR EXISTS (
      SELECT 1 FROM qbank_question_chunk qc
       WHERE qc.question_id=NEW.id
         AND (qc.taxonomy_version, qc.serving_scope_id, qc.annotation_source, qc.metadata_hash)
             IS DISTINCT FROM (NEW.taxonomy_version, NEW.serving_scope_id, NEW.annotation_source, NEW.metadata_hash)
    ) THEN
      RAISE EXCEPTION 'qbank_question_publish_requires_reviewed_matching_metadata' USING ERRCODE='check_violation';
    END IF;
    RETURN NEW;
  END IF;
  RAISE EXCEPTION 'qbank_question_state_immutable_after_publish' USING ERRCODE='check_violation';
END;
$$;
REVOKE ALL ON FUNCTION qbank_question_artifact_guard() FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION qbank_question_chunk_artifact_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  question_state text;
  question_version text;
  question_scope text;
  question_source text;
  question_hash text;
  chunk_hash text;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'qbank_question_chunk_artifact_immutable' USING ERRCODE='check_violation';
  END IF;
  SELECT state, taxonomy_version, serving_scope_id, annotation_source, metadata_hash
    INTO question_state, question_version, question_scope, question_source, question_hash
    FROM qbank_question WHERE id=NEW.question_id;
  SELECT content_hash INTO chunk_hash FROM qbank_chunk WHERE ref_id=NEW.ref_id;
  IF question_state IS NULL OR question_version IS NULL OR chunk_hash IS NULL
    OR NEW.content_hash IS DISTINCT FROM chunk_hash
    OR (NEW.taxonomy_version, NEW.serving_scope_id, NEW.annotation_source, NEW.metadata_hash)
       IS DISTINCT FROM (question_version, question_scope, question_source, question_hash) THEN
    RAISE EXCEPTION 'qbank_question_chunk_metadata_mismatch' USING ERRCODE='check_violation';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM qbank_chunk_serving_scope cs
      WHERE cs.ref_id=NEW.ref_id
        AND cs.taxonomy_version=NEW.taxonomy_version
        AND cs.serving_scope_id=NEW.serving_scope_id
        AND cs.annotation_source=NEW.annotation_source
        AND cs.metadata_hash=qbank_metadata_hash(
          'qbank-chunk-scope:v1', NEW.taxonomy_version, NEW.serving_scope_id, NEW.annotation_source
        )
  ) THEN
    RAISE EXCEPTION 'qbank_question_chunk_scope_not_reviewed' USING ERRCODE='check_violation';
  END IF;
  IF question_state='published' THEN
    IF EXISTS (
      SELECT 1 FROM qbank_question_chunk
       WHERE question_id=NEW.question_id
         AND ref_id=NEW.ref_id
         AND content_hash=NEW.content_hash
         AND role=NEW.role
         AND ordinal=NEW.ordinal
         AND required=NEW.required
         AND taxonomy_version=NEW.taxonomy_version
         AND serving_scope_id=NEW.serving_scope_id
         AND annotation_source=NEW.annotation_source
         AND metadata_hash=NEW.metadata_hash
    ) THEN
      RETURN NULL;
    END IF;
    RAISE EXCEPTION 'qbank_question_chunk_requires_draft_question' USING ERRCODE='check_violation';
  END IF;
  IF question_state IS DISTINCT FROM 'draft' THEN
    RAISE EXCEPTION 'qbank_question_chunk_requires_draft_question' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_question_chunk_artifact_guard() FROM PUBLIC, app_role;

-- Bootstrap the sealed v1 manifest before RLS is enabled.  A migration actor
-- is not the future control definer, so enabling FORCE RLS first would make a
-- valid low-privilege upgrade fail while trying to write its own initial tree.
INSERT INTO qbank_taxonomy_release(version, release_hash, state)
VALUES (
  'v1',
  encode(digest(convert_to('qbank-taxonomy-draft:v1', 'UTF8'), 'sha256'), 'hex'),
  'draft'
)
ON CONFLICT (version) DO NOTHING;

INSERT INTO qbank_taxonomy_scope(taxonomy_version, scope_id, parent_scope_id, is_leaf, display_name)
VALUES
  ('v1','backend',NULL,false,'后端'),
  ('v1','backend/nodejs','backend',true,'Node.js 后端'),
  ('v1','backend/java','backend',true,'Java/JVM 后端'),
  ('v1','backend/go','backend',true,'Go 后端'),
  ('v1','backend/python','backend',true,'Python 后端'),
  ('v1','backend/general','backend',true,'通用后端与系统设计'),
  ('v1','frontend',NULL,false,'前端'),
  ('v1','frontend/web','frontend',true,'Web 前端'),
  ('v1','qa',NULL,false,'测试质量'),
  ('v1','qa/quality_engineering','qa',true,'测试与质量工程'),
  ('v1','ai_ml',NULL,false,'AI 与机器学习'),
  ('v1','ai_ml/applied','ai_ml',true,'AI、RAG 与机器学习')
ON CONFLICT (taxonomy_version, scope_id) DO NOTHING;

-- `qbank_taxonomy_scope` has a deferred self-reference so a manifest can be
-- declared as one set.  Settle it before later ALTER TABLE statements; an
-- otherwise pending FK event makes PostgreSQL correctly reject those DDLs.
SET CONSTRAINTS ALL IMMEDIATE;

UPDATE qbank_taxonomy_release
   SET state='released', release_hash=qbank_taxonomy_manifest_hash(version)
 WHERE version='v1' AND state='draft';

ALTER TABLE qbank_taxonomy_release ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_taxonomy_release FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_taxonomy_scope ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_taxonomy_scope FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_chunk_serving_scope ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_chunk_serving_scope FORCE ROW LEVEL SECURITY;

REVOKE ALL ON qbank_taxonomy_release, qbank_taxonomy_scope, qbank_chunk_serving_scope FROM PUBLIC, app_role;
GRANT SELECT, INSERT, UPDATE ON qbank_taxonomy_release TO qbank_control_executor;
GRANT SELECT, INSERT ON qbank_taxonomy_scope, qbank_chunk_serving_scope TO qbank_control_executor;

DROP POLICY IF EXISTS p_qbank_taxonomy_release_read ON qbank_taxonomy_release;
CREATE POLICY p_qbank_taxonomy_release_read ON qbank_taxonomy_release FOR SELECT TO PUBLIC
  USING (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());
DROP POLICY IF EXISTS p_qbank_taxonomy_release_write ON qbank_taxonomy_release;
CREATE POLICY p_qbank_taxonomy_release_write ON qbank_taxonomy_release FOR INSERT TO PUBLIC
  WITH CHECK (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());
DROP POLICY IF EXISTS p_qbank_taxonomy_release_publish ON qbank_taxonomy_release;
CREATE POLICY p_qbank_taxonomy_release_publish ON qbank_taxonomy_release FOR UPDATE TO PUBLIC
  USING (current_user='qbank_control_executor' OR qbank_is_generation_control_definer())
  WITH CHECK (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_taxonomy_scope_read ON qbank_taxonomy_scope;
CREATE POLICY p_qbank_taxonomy_scope_read ON qbank_taxonomy_scope FOR SELECT TO PUBLIC
  USING (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());
DROP POLICY IF EXISTS p_qbank_taxonomy_scope_write ON qbank_taxonomy_scope;
CREATE POLICY p_qbank_taxonomy_scope_write ON qbank_taxonomy_scope FOR INSERT TO PUBLIC
  WITH CHECK (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());

DROP POLICY IF EXISTS p_qbank_chunk_serving_scope_read ON qbank_chunk_serving_scope;
CREATE POLICY p_qbank_chunk_serving_scope_read ON qbank_chunk_serving_scope FOR SELECT TO PUBLIC
  USING (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());
DROP POLICY IF EXISTS p_qbank_chunk_serving_scope_write ON qbank_chunk_serving_scope;
CREATE POLICY p_qbank_chunk_serving_scope_write ON qbank_chunk_serving_scope FOR INSERT TO PUBLIC
  WITH CHECK (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());
