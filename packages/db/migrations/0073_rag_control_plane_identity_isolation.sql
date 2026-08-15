-- 0073_rag_control_plane_identity_isolation.sql
--
-- Forward-only replacement for the 0032 generic RAG control-plane trust
-- boundary.  `app.principal_user` remains a row-routing value for private
-- corpus access; it is never an authority for global corpus, generation,
-- release, or physical-vector operations.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='rag_control_executor') THEN
    CREATE ROLE rag_control_executor NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='rag_control_login') THEN
    CREATE ROLE rag_control_login NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='rag_control_definer') THEN
    CREATE ROLE rag_control_definer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='rag_runtime_definer') THEN
    CREATE ROLE rag_runtime_definer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END
$$;

-- `rag_control_login` is a reserved capability group, not a shared fallback
-- credential.  Real control logins are created only by the provisioner with
-- a supplied secret and a closed membership allowlist.
ALTER ROLE rag_control_login NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;

REVOKE ALL ON SCHEMA public FROM rag_control_executor, rag_runtime_definer, rag_control_login;
REVOKE CREATE ON SCHEMA public FROM PUBLIC, app_role, rag_control_executor, rag_runtime_definer, rag_control_login;
GRANT rag_control_executor TO rag_control_login;
REVOKE app_role, app_gateway_role, privacy_worker_executor, qbank_control_executor FROM rag_control_login;

CREATE SCHEMA IF NOT EXISTS rag_runtime AUTHORIZATION rag_runtime_definer;
CREATE SCHEMA IF NOT EXISTS rag_control AUTHORIZATION rag_control_definer;
REVOKE ALL ON SCHEMA rag_runtime, rag_control FROM PUBLIC;
GRANT USAGE ON SCHEMA rag_runtime TO app_role;
GRANT USAGE ON SCHEMA rag_control TO rag_control_executor;
-- Catalog startup checks run with the NOINHERIT executor role.  Namespace
-- usage reveals only function names/signatures; it does not grant EXECUTE or
-- table access to the request/control login.
GRANT USAGE ON SCHEMA rag_runtime TO rag_control_executor;
GRANT USAGE ON SCHEMA rag_control TO rag_runtime_definer;
GRANT USAGE, CREATE ON SCHEMA rag_control TO rag_control_definer;

-- 0032 data lacks a trustworthy issuer.  It is deliberately quarantined; no
-- recovery exception is hidden in this migration.
ALTER TABLE public.rag_embedding_generation
  ADD COLUMN IF NOT EXISTS control_trust_state text NOT NULL DEFAULT 'legacy_untrusted'
  CHECK (control_trust_state IN ('controlled','legacy_untrusted','quarantined'));

CREATE TABLE IF NOT EXISTS public.rag_control_request (
  request_id text PRIMARY KEY CHECK (request_id ~ '^rctrl-[0-9a-f]{32}$'),
  workflow_root_id text NOT NULL,
  predecessor_request_id text REFERENCES public.rag_control_request(request_id),
  operation text NOT NULL CHECK (operation ~ '^[a-z][a-z0-9_]{2,80}$'),
  logical_request_key text NOT NULL CHECK (char_length(logical_request_key) BETWEEN 1 AND 240),
  business_revision bigint NOT NULL CHECK (business_revision > 0),
  canonical_input_digest text NOT NULL CHECK (canonical_input_digest ~ '^[0-9a-f]{64}$'),
  outcome text NOT NULL DEFAULT 'prepared' CHECK (outcome IN ('prepared','dispatching','succeeded','known_not_sent','unknown','failed')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  terminal_at timestamptz,
  UNIQUE (operation, logical_request_key, business_revision),
  UNIQUE (workflow_root_id, business_revision),
  UNIQUE (predecessor_request_id),
  CHECK ((business_revision = 1) = (predecessor_request_id IS NULL)),
  CHECK ((business_revision = 1 AND workflow_root_id = request_id) OR (business_revision > 1))
);

-- The request ledger must exist before these FKs are added.  Keeping these
-- bindings on the business objects makes a response-lost replay checkable
-- without trusting a caller-supplied request digest.
ALTER TABLE public.rag_embedding_generation
  ADD COLUMN IF NOT EXISTS control_request_id text REFERENCES public.rag_control_request(request_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rag_generation_control_request
  ON public.rag_embedding_generation(control_request_id) WHERE control_request_id IS NOT NULL;
ALTER TABLE public.rag_rebuild_run
  ADD COLUMN IF NOT EXISTS control_request_id text REFERENCES public.rag_control_request(request_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rag_rebuild_control_request
  ON public.rag_rebuild_run(control_request_id) WHERE control_request_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.rag_control_dispatch_attempt (
  request_id text PRIMARY KEY REFERENCES public.rag_control_request(request_id),
  provider_policy_revision text NOT NULL CHECK (char_length(provider_policy_revision) BETWEEN 1 AND 160),
  provider_idempotency_key_digest text NOT NULL CHECK (provider_idempotency_key_digest ~ '^[0-9a-f]{64}$'),
  state text NOT NULL CHECK (state IN ('prepared','dispatching','succeeded','known_not_sent','unknown','failed')),
  response_digest text CHECK (response_digest IS NULL OR response_digest ~ '^[0-9a-f]{64}$'),
  dispatched_at timestamptz,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  -- `dispatched_at` records the durable pre-network admission.  It remains
  -- present after a terminal outcome so the attempt cannot be rewritten as a
  -- never-started row after a process crash.
  CHECK ((state <> 'prepared') = (dispatched_at IS NOT NULL)),
  CHECK ((state IN ('succeeded','known_not_sent','unknown','failed')) = (settled_at IS NOT NULL))
);

-- A provider attempt must name the durable business object it may affect.
-- `request_id` remains unique (one semantic dispatch per request), while a
-- generation can legitimately have many independently idempotent batches.
CREATE TABLE IF NOT EXISTS public.rag_control_dispatch_subject (
  request_id text PRIMARY KEY REFERENCES public.rag_control_request(request_id),
  subject_kind text NOT NULL CHECK (subject_kind IN ('generation','rebuild_run')),
  subject_id text NOT NULL CHECK (char_length(subject_id) BETWEEN 1 AND 180),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS public.rag_reconciliation_receipt (
  receipt_id text PRIMARY KEY CHECK (receipt_id ~ '^rrec-[A-Za-z0-9:_-]{1,160}$'),
  request_id text NOT NULL REFERENCES public.rag_control_request(request_id),
  subject_kind text NOT NULL CHECK (subject_kind IN ('request','generation','rebuild_run')),
  subject_id text NOT NULL CHECK (char_length(subject_id) BETWEEN 1 AND 180),
  decision text NOT NULL CHECK (decision='failed'),
  evidence_digest text NOT NULL CHECK (evidence_digest ~ '^[0-9a-f]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (request_id, subject_kind, subject_id)
);

-- The digest accepted when a logical request is opened is only a caller-side
-- dedupe hint.  The control function binds the request to a digest derived
-- from the *actual typed database arguments* before it can mutate business
-- state.  This prevents a prepared request with an arbitrary digest from
-- being reused for a different generation, policy, or rollout transition.
CREATE TABLE IF NOT EXISTS public.rag_control_request_input_binding (
  request_id text PRIMARY KEY REFERENCES public.rag_control_request(request_id),
  operation text NOT NULL CHECK (operation ~ '^[a-z][a-z0-9_]{2,80}$'),
  input_digest text NOT NULL CHECK (input_digest ~ '^[0-9a-f]{64}$'),
  bound_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS public.rag_global_document_provenance (
  document_id text NOT NULL,
  content_version integer NOT NULL,
  trust_state text NOT NULL CHECK (trust_state IN ('approved','legacy_untrusted','revoked')),
  control_request_id text REFERENCES public.rag_control_request(request_id),
  provenance_digest text NOT NULL CHECK (provenance_digest ~ '^[0-9a-f]{64}$'),
  issued_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (document_id, content_version),
  FOREIGN KEY (document_id, content_version) REFERENCES public.rag_corpus_content_version(document_id, content_version),
  CHECK ((trust_state='approved') = (control_request_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS public.rag_generation_integrity_quarantine (
  generation_id text PRIMARY KEY,
  reason_code text NOT NULL CHECK (reason_code ~ '^[a-z0-9_]{3,100}$'),
  evidence_digest text NOT NULL CHECK (evidence_digest ~ '^[0-9a-f]{64}$'),
  detected_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS public.rag_cache_epoch (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  epoch bigint NOT NULL UNIQUE DEFAULT 1 CHECK (epoch > 0),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO public.rag_cache_epoch(singleton, epoch) VALUES (true, 1) ON CONFLICT (singleton) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.rag_cache_invalidation_outbox (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- Snapshot value, not an FK: the singleton epoch is intentionally updated
  -- in place while older invalidation events remain auditable.
  cache_epoch bigint NOT NULL CHECK (cache_epoch > 0),
  event_kind text NOT NULL CHECK (event_kind IN ('promote','rollback','legacy_isolation','tombstone')),
  generation_id text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  consumed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.rag_generation_release_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  generation_id text NOT NULL REFERENCES public.rag_embedding_generation(id),
  event_kind text NOT NULL CHECK (event_kind IN ('promote','rollback')),
  prior_generation_id text,
  request_id text NOT NULL REFERENCES public.rag_control_request(request_id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (request_id, event_kind)
);

-- Every historical global version remains non-readable.  The active pointer
-- is cleared before any new controlled generation may be started.
INSERT INTO public.rag_global_document_provenance(document_id, content_version, trust_state, control_request_id, provenance_digest)
SELECT v.document_id, v.content_version, 'legacy_untrusted', NULL,
       encode(public.digest(v.document_id || ':' || v.content_version::text || ':' || v.content_hash, 'sha256'), 'hex')
  FROM public.rag_corpus_content_version v
  JOIN public.rag_corpus_document d ON d.id=v.document_id
 WHERE d.visibility='global'
ON CONFLICT (document_id, content_version) DO NOTHING;

INSERT INTO public.rag_generation_integrity_quarantine(generation_id, reason_code, evidence_digest)
SELECT id, 'legacy_0032_untrusted', encode(public.digest(id || ':' || coalesce(physical_table,''), 'sha256'), 'hex')
  FROM public.rag_embedding_generation
ON CONFLICT (generation_id) DO NOTHING;

UPDATE public.rag_embedding_generation
   SET control_trust_state='legacy_untrusted',
       state=CASE WHEN state IN ('building','shadow','gated','active','deprecated') THEN 'retired' ELSE state END,
       retired_at=CASE WHEN state IN ('building','shadow','gated','active','deprecated') THEN clock_timestamp() ELSE retired_at END;
UPDATE public.rag_query_binding SET status='revoked' WHERE status='active';
UPDATE public.rag_citation SET status='invalidated' WHERE status='valid';
UPDATE public.rag_active_generation SET generation_id=NULL,row_version=row_version+1,switched_at=clock_timestamp() WHERE singleton;
UPDATE public.rag_cache_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
INSERT INTO public.rag_cache_invalidation_outbox(cache_epoch,event_kind,generation_id)
SELECT epoch,'legacy_isolation',NULL FROM public.rag_cache_epoch WHERE singleton;

-- Table ownership and permissions form the data-plane boundary.  Runtime
-- access is available only through its SECURITY DEFINER functions; the
-- control executor gets only fixed procedure execution.
DO $$
DECLARE relation_name text; policy_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'rag_corpus_epoch','rag_corpus_document','rag_corpus_content_version','rag_corpus_chunk','rag_corpus_tombstone',
    'rag_embedding_recipe','rag_release_policy','rag_embedding_generation','rag_generation_member','rag_active_generation',
    'rag_rebuild_run','rag_shadow_evaluation','rag_generation_rollout','rag_query_binding','rag_citation',
    'rag_control_request','rag_control_dispatch_attempt','rag_control_dispatch_subject','rag_reconciliation_receipt','rag_control_request_input_binding','rag_global_document_provenance','rag_generation_integrity_quarantine',
    'rag_cache_epoch','rag_cache_invalidation_outbox','rag_generation_release_event'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO rag_control_definer', relation_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, app_role, rag_control_executor, rag_control_login, rag_runtime_definer', relation_name);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO rag_control_definer', relation_name);
  END LOOP;
END
$$;

GRANT SELECT, INSERT, UPDATE ON public.rag_corpus_document, public.rag_corpus_content_version,
  public.rag_corpus_chunk, public.rag_corpus_tombstone, public.rag_query_binding, public.rag_citation,
  public.rag_corpus_epoch, public.rag_embedding_generation, public.rag_embedding_recipe,
  public.rag_generation_member, public.rag_active_generation, public.rag_generation_rollout,
  public.rag_global_document_provenance TO rag_runtime_definer;

-- Explicit policies for the two definers.  No policy relies on a forged GUC
-- for control authority; the runtime policy only routes private owner rows.
DO $$
DECLARE relation_name text; policy_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'rag_corpus_epoch','rag_corpus_document','rag_corpus_content_version','rag_corpus_chunk','rag_corpus_tombstone',
    'rag_embedding_recipe','rag_release_policy','rag_embedding_generation','rag_generation_member','rag_active_generation',
    'rag_rebuild_run','rag_shadow_evaluation','rag_generation_rollout','rag_query_binding','rag_citation',
    'rag_control_request','rag_control_dispatch_attempt','rag_control_dispatch_subject','rag_reconciliation_receipt','rag_control_request_input_binding','rag_global_document_provenance','rag_generation_integrity_quarantine',
    'rag_cache_epoch','rag_cache_invalidation_outbox','rag_generation_release_event'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', relation_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', relation_name);
    -- PostgreSQL combines permissive policies with OR.  Leaving one 0032
    -- policy behind would therefore re-enable its forged-GUC/global rule even
    -- when the new policy is correct.  Replace the entire fixed-table policy
    -- set before installing the reviewed control/runtime policies below.
    FOR policy_name IN
      SELECT polname FROM pg_policy WHERE polrelid=format('public.%I', relation_name)::regclass
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', policy_name, relation_name);
    END LOOP;
    EXECUTE format('CREATE POLICY p073_control_all ON public.%I FOR ALL TO rag_control_definer USING (true) WITH CHECK (true)', relation_name);
  END LOOP;
END
$$;

-- 0032 created one physical `public.rag_vector_<uuid>` table per generation
-- and granted app_role SELECT on it.  These relations are not covered by the
-- fixed-table loop above.  Move every legacy-format relation into the control
-- schema, remove all old grants/policies, and leave it readable only to the
-- quarantining control definer.  The reviewed runtime functions never select
-- a generation whose trust state is legacy_untrusted, so no legacy vector can
-- re-enter serving traffic after this upgrade.
DO $$
DECLARE legacy_table text; policy_name text;
BEGIN
  FOR legacy_table IN
    SELECT cls.relname
      FROM pg_class cls
      JOIN pg_namespace ns ON ns.oid=cls.relnamespace
     WHERE ns.nspname='public' AND cls.relkind='r'
       AND cls.relname ~ '^rag_vector_[0-9a-f]{32}$'
  LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO rag_control_definer', legacy_table);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, app_role, rag_control_executor, rag_control_login, rag_runtime_definer', legacy_table);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', legacy_table);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', legacy_table);
    FOR policy_name IN
      SELECT polname FROM pg_policy WHERE polrelid=format('public.%I', legacy_table)::regclass
    LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', policy_name, legacy_table);
    END LOOP;
    EXECUTE format('ALTER TABLE public.%I SET SCHEMA rag_control', legacy_table);
    EXECUTE format('CREATE POLICY p073_legacy_quarantined_control ON rag_control.%I FOR ALL TO rag_control_definer USING (true) WITH CHECK (true)', legacy_table);
  END LOOP;
END
$$;

DROP POLICY IF EXISTS p073_runtime_document ON public.rag_corpus_document;
CREATE POLICY p073_runtime_document ON public.rag_corpus_document FOR ALL TO rag_runtime_definer
  USING ((visibility='private' AND owner_user_id=current_setting('app.principal_user',true)) OR
         (visibility='global' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
            WHERE p.document_id=public.rag_corpus_document.id
              AND p.content_version=public.rag_corpus_document.current_content_version
              AND p.trust_state='approved')))
  WITH CHECK (visibility='private' AND owner_user_id=current_setting('app.principal_user',true));
DROP POLICY IF EXISTS p073_runtime_content ON public.rag_corpus_content_version;
CREATE POLICY p073_runtime_content ON public.rag_corpus_content_version FOR ALL TO rag_runtime_definer
  USING (EXISTS (SELECT 1 FROM public.rag_corpus_document d WHERE d.id=document_id AND
       ((d.visibility='private' AND d.owner_user_id=current_setting('app.principal_user',true)) OR
        (d.visibility='global' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
          WHERE p.document_id=public.rag_corpus_content_version.document_id
            AND p.content_version=public.rag_corpus_content_version.content_version
            AND p.trust_state='approved')))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.rag_corpus_document d WHERE d.id=document_id AND d.visibility='private'
    AND d.owner_user_id=current_setting('app.principal_user',true)));
DROP POLICY IF EXISTS p073_runtime_chunk ON public.rag_corpus_chunk;
CREATE POLICY p073_runtime_chunk ON public.rag_corpus_chunk FOR ALL TO rag_runtime_definer
  USING (EXISTS (SELECT 1 FROM public.rag_corpus_document d WHERE d.id=document_id AND
       ((d.visibility='private' AND d.owner_user_id=current_setting('app.principal_user',true)) OR
        (d.visibility='global' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
          WHERE p.document_id=public.rag_corpus_chunk.document_id
            AND p.content_version=public.rag_corpus_chunk.content_version
            AND p.trust_state='approved')))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.rag_corpus_document d WHERE d.id=document_id AND d.visibility='private'
    AND d.owner_user_id=current_setting('app.principal_user',true)));
DROP POLICY IF EXISTS p073_runtime_binding ON public.rag_query_binding;
CREATE POLICY p073_runtime_binding ON public.rag_query_binding FOR ALL TO rag_runtime_definer
  USING (owner_user_id=current_setting('app.principal_user',true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user',true));
DROP POLICY IF EXISTS p073_runtime_citation ON public.rag_citation;
CREATE POLICY p073_runtime_citation ON public.rag_citation FOR ALL TO rag_runtime_definer
  USING (owner_user_id=current_setting('app.principal_user',true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user',true));
DROP POLICY IF EXISTS p073_runtime_tombstone ON public.rag_corpus_tombstone;
CREATE POLICY p073_runtime_tombstone ON public.rag_corpus_tombstone FOR ALL TO rag_runtime_definer
  USING (owner_user_id=current_setting('app.principal_user',true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user',true));
DROP POLICY IF EXISTS p073_runtime_generation_read ON public.rag_embedding_generation;
CREATE POLICY p073_runtime_generation_read ON public.rag_embedding_generation FOR SELECT TO rag_runtime_definer
  USING (control_trust_state='controlled' AND state IN ('active','gated','deprecated'));
DROP POLICY IF EXISTS p073_runtime_recipe_read ON public.rag_embedding_recipe;
CREATE POLICY p073_runtime_recipe_read ON public.rag_embedding_recipe FOR SELECT TO rag_runtime_definer USING (true);
DROP POLICY IF EXISTS p073_runtime_member_read ON public.rag_generation_member;
CREATE POLICY p073_runtime_member_read ON public.rag_generation_member FOR SELECT TO rag_runtime_definer
  USING (owner_user_id=current_setting('app.principal_user',true) OR
         (visibility='global' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
          WHERE p.document_id=public.rag_generation_member.document_id
            AND p.content_version=public.rag_generation_member.content_version
            AND p.trust_state='approved')));
DROP POLICY IF EXISTS p073_runtime_active_read ON public.rag_active_generation;
CREATE POLICY p073_runtime_active_read ON public.rag_active_generation FOR SELECT TO rag_runtime_definer USING (true);
DROP POLICY IF EXISTS p073_runtime_rollout_read ON public.rag_generation_rollout;
CREATE POLICY p073_runtime_rollout_read ON public.rag_generation_rollout FOR SELECT TO rag_runtime_definer USING (true);
DROP POLICY IF EXISTS p073_runtime_epoch_read ON public.rag_corpus_epoch;
CREATE POLICY p073_runtime_epoch_read ON public.rag_corpus_epoch FOR SELECT TO rag_runtime_definer USING (true);
DROP POLICY IF EXISTS p073_runtime_epoch_update ON public.rag_corpus_epoch;
CREATE POLICY p073_runtime_epoch_update ON public.rag_corpus_epoch FOR UPDATE TO rag_runtime_definer USING (singleton) WITH CHECK (singleton);
DROP POLICY IF EXISTS p073_runtime_provenance_read ON public.rag_global_document_provenance;
CREATE POLICY p073_runtime_provenance_read ON public.rag_global_document_provenance FOR SELECT TO rag_runtime_definer USING (trust_state='approved');

-- The old GUC-gated functions remain installed only so older code cannot
-- resolve names during a rolling migration; none are executable by request,
-- control-login, gateway, or privacy roles after this point.
DO $$
DECLARE function_identity text;
BEGIN
  FOR function_identity IN
    SELECT p.oid::regprocedure::text FROM pg_proc p
      WHERE p.pronamespace='public'::regnamespace AND p.proname ~ '^rag_'
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM app_role, rag_control_executor, rag_control_login, rag_runtime_definer, app_gateway_role, privacy_worker_executor', function_identity);
  END LOOP;
END
$$;
GRANT EXECUTE ON FUNCTION public.digest(text,text), public.digest(bytea,text), public.vector_dims(public.vector)
  TO rag_runtime_definer, rag_control_definer;

CREATE OR REPLACE FUNCTION rag_control.rag_control_begin_request(
  p_operation text, p_logical_key text, p_digest text, p_revision bigint
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE existing public.rag_control_request%ROWTYPE; request_id text;
DECLARE predecessor public.rag_control_request%ROWTYPE;
BEGIN
  IF p_operation !~ '^[a-z][a-z0-9_]{2,80}$' OR char_length(p_logical_key) NOT BETWEEN 1 AND 240
     OR p_digest !~ '^[0-9a-f]{64}$' OR p_revision < 1 THEN
    RAISE EXCEPTION 'rag_control_request_invalid' USING ERRCODE='check_violation';
  END IF;
  -- Serialize all revisions of the same logical work.  A unique index alone
  -- would make one concurrent identical retry fail after it observed an old
  -- snapshot; callers must instead receive the same immutable request id.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_operation || E'\\x1f' || p_logical_key, 0));
  SELECT * INTO existing FROM public.rag_control_request
   WHERE operation=p_operation AND logical_request_key=p_logical_key AND business_revision=p_revision FOR UPDATE;
  IF FOUND THEN
    IF existing.canonical_input_digest<>p_digest THEN RAISE EXCEPTION 'rag_control_idempotency_conflict' USING ERRCODE='unique_violation'; END IF;
    RETURN existing.request_id;
  END IF;
  IF p_revision=1 THEN
    request_id := 'rctrl-' || replace(gen_random_uuid()::text,'-','');
    INSERT INTO public.rag_control_request(request_id,workflow_root_id,operation,logical_request_key,business_revision,canonical_input_digest)
    VALUES (request_id,request_id,p_operation,p_logical_key,p_revision,p_digest);
    RETURN request_id;
  END IF;
  SELECT * INTO predecessor FROM public.rag_control_request
   WHERE operation=p_operation AND logical_request_key=p_logical_key AND business_revision=p_revision-1 FOR UPDATE;
  IF NOT FOUND OR NOT (
       predecessor.outcome='known_not_sent'
       OR (predecessor.outcome='failed' AND EXISTS (
         SELECT 1 FROM public.rag_reconciliation_receipt r
          WHERE r.request_id=predecessor.request_id AND r.decision='failed'
       ))
  ) THEN
    RAISE EXCEPTION 'rag_control_successor_requires_reconciliation' USING ERRCODE='check_violation';
  END IF;
  request_id := 'rctrl-' || replace(gen_random_uuid()::text,'-','');
  INSERT INTO public.rag_control_request(request_id,workflow_root_id,predecessor_request_id,operation,logical_request_key,business_revision,canonical_input_digest)
  VALUES (request_id,predecessor.workflow_root_id,predecessor.request_id,p_operation,p_logical_key,p_revision,p_digest);
  RETURN request_id;
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_mark_request_dispatching(
  p_request_id text, p_provider_policy_revision text, p_provider_key_digest text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE prior public.rag_control_dispatch_attempt%ROWTYPE;
BEGIN
  IF p_provider_key_digest !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'rag_control_dispatch_digest_invalid' USING ERRCODE='check_violation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.rag_control_dispatch_subject WHERE request_id=p_request_id) THEN
    RAISE EXCEPTION 'rag_control_dispatch_subject_missing' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO prior FROM public.rag_control_dispatch_attempt WHERE request_id=p_request_id FOR UPDATE;
  IF FOUND THEN
    IF prior.provider_policy_revision=p_provider_policy_revision AND prior.provider_idempotency_key_digest=p_provider_key_digest
       AND prior.state='dispatching' THEN RETURN false; END IF;
    RAISE EXCEPTION 'rag_control_dispatch_conflict' USING ERRCODE='unique_violation';
  END IF;
  UPDATE public.rag_control_request SET outcome='dispatching'
    WHERE request_id=p_request_id AND outcome='prepared';
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_control_request_not_prepared' USING ERRCODE='check_violation'; END IF;
  INSERT INTO public.rag_control_dispatch_attempt(request_id,provider_policy_revision,provider_idempotency_key_digest,state,dispatched_at)
  VALUES (p_request_id,p_provider_policy_revision,p_provider_key_digest,'dispatching',clock_timestamp());
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_bind_generation_dispatch_request(
  p_request_id text,p_generation_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE request_row public.rag_control_request%ROWTYPE; existing public.rag_control_dispatch_subject%ROWTYPE; input_digest text;
BEGIN
  SELECT * INTO request_row FROM public.rag_control_request WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND OR request_row.operation<>'generation_embedding_batch' THEN
    RAISE EXCEPTION 'rag_control_dispatch_operation_mismatch' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO existing FROM public.rag_control_dispatch_subject WHERE request_id=p_request_id FOR UPDATE;
  IF FOUND THEN
    IF existing.subject_kind<>'generation' OR existing.subject_id<>p_generation_id THEN
      RAISE EXCEPTION 'rag_control_dispatch_subject_conflict' USING ERRCODE='unique_violation';
    END IF;
    IF request_row.outcome IN ('prepared','dispatching') THEN RETURN; END IF;
    RAISE EXCEPTION 'rag_control_dispatch_request_not_pending' USING ERRCODE='check_violation';
  END IF;
  IF request_row.outcome<>'prepared' OR NOT EXISTS (
    SELECT 1 FROM public.rag_embedding_generation
      WHERE id=p_generation_id AND state='building' AND control_trust_state='controlled'
  ) THEN RAISE EXCEPTION 'rag_control_dispatch_subject_unavailable' USING ERRCODE='check_violation'; END IF;
  input_digest := rag_control.rag_control_input_digest('generation_embedding_batch', jsonb_build_object('generation_id',p_generation_id));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_embedding_batch',input_digest) THEN
    RAISE EXCEPTION 'rag_control_dispatch_request_not_pending' USING ERRCODE='check_violation';
  END IF;
  INSERT INTO public.rag_control_dispatch_subject(request_id,subject_kind,subject_id)
  VALUES (p_request_id,'generation',p_generation_id);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_bind_rebuild_dispatch_request(
  p_request_id text,p_run_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE request_row public.rag_control_request%ROWTYPE; existing public.rag_control_dispatch_subject%ROWTYPE; input_digest text;
BEGIN
  SELECT * INTO request_row FROM public.rag_control_request WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND OR request_row.operation<>'rebuild_external_step' THEN
    RAISE EXCEPTION 'rag_control_dispatch_operation_mismatch' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO existing FROM public.rag_control_dispatch_subject WHERE request_id=p_request_id FOR UPDATE;
  IF FOUND THEN
    IF existing.subject_kind<>'rebuild_run' OR existing.subject_id<>p_run_id THEN
      RAISE EXCEPTION 'rag_control_dispatch_subject_conflict' USING ERRCODE='unique_violation';
    END IF;
    IF request_row.outcome IN ('prepared','dispatching') THEN RETURN; END IF;
    RAISE EXCEPTION 'rag_control_dispatch_request_not_pending' USING ERRCODE='check_violation';
  END IF;
  IF request_row.outcome<>'prepared' OR NOT EXISTS (
    SELECT 1 FROM public.rag_rebuild_run
      WHERE id=p_run_id AND status IN ('pending','running','paused','orphaned')
  ) THEN RAISE EXCEPTION 'rag_control_dispatch_subject_unavailable' USING ERRCODE='check_violation'; END IF;
  input_digest := rag_control.rag_control_input_digest('rebuild_external_step', jsonb_build_object('run_id',p_run_id));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'rebuild_external_step',input_digest) THEN
    RAISE EXCEPTION 'rag_control_dispatch_request_not_pending' USING ERRCODE='check_violation';
  END IF;
  INSERT INTO public.rag_control_dispatch_subject(request_id,subject_kind,subject_id)
  VALUES (p_request_id,'rebuild_run',p_run_id);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_settle_request_dispatch(
  p_request_id text, p_terminal_state text, p_response_digest text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
BEGIN
  IF p_terminal_state NOT IN ('succeeded','known_not_sent','unknown','failed') OR p_response_digest !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'rag_control_dispatch_terminal_invalid' USING ERRCODE='check_violation';
  END IF;
  UPDATE public.rag_control_dispatch_attempt SET state=p_terminal_state,response_digest=p_response_digest,settled_at=clock_timestamp()
   WHERE request_id=p_request_id AND state='dispatching';
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_control_dispatch_not_dispatching' USING ERRCODE='check_violation'; END IF;
  UPDATE public.rag_control_request SET outcome=p_terminal_state,terminal_at=clock_timestamp()
   WHERE request_id=p_request_id AND outcome='dispatching';
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_record_reconciliation_receipt(
  p_request_id text,p_receipt_id text,p_subject_kind text,p_subject_id text,p_decision text,p_evidence_digest text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
BEGIN
  IF p_subject_kind NOT IN ('request','generation','rebuild_run') OR p_decision<>'failed'
     OR p_evidence_digest !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'rag_reconciliation_receipt_invalid' USING ERRCODE='check_violation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.rag_control_request WHERE request_id=p_request_id AND outcome='unknown') THEN
    RAISE EXCEPTION 'rag_reconciliation_request_not_unknown' USING ERRCODE='check_violation';
  END IF;
  IF p_subject_kind='request' AND p_subject_id<>p_request_id THEN
    RAISE EXCEPTION 'rag_reconciliation_subject_mismatch' USING ERRCODE='check_violation';
  END IF;
  INSERT INTO public.rag_reconciliation_receipt(receipt_id,request_id,subject_kind,subject_id,decision,evidence_digest)
  VALUES (p_receipt_id,p_request_id,p_subject_kind,p_subject_id,p_decision,p_evidence_digest)
  ON CONFLICT (receipt_id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.rag_reconciliation_receipt
                 WHERE receipt_id=p_receipt_id AND request_id=p_request_id AND subject_kind=p_subject_kind
                   AND subject_id=p_subject_id AND decision=p_decision AND evidence_digest=p_evidence_digest) THEN
    RAISE EXCEPTION 'rag_reconciliation_receipt_conflict' USING ERRCODE='unique_violation';
  END IF;
END;
$$;

-- `unknown` is intentionally not retryable.  These two terminalizers require
-- a prior immutable reconciliation receipt for the exact owned business row,
-- then atomically close both the domain row and its dispatch request as
-- `failed`.  A later successor must use a new business revision and a new
-- provider idempotency key; it never rewrites this request or generation.
CREATE OR REPLACE FUNCTION rag_control.rag_terminalize_unknown_generation(
  p_request_id text,p_generation_id text,p_receipt_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.rag_reconciliation_receipt
     WHERE receipt_id=p_receipt_id AND request_id=p_request_id AND subject_kind='generation'
       AND subject_id=p_generation_id AND decision='failed'
  ) THEN RAISE EXCEPTION 'rag_reconciliation_receipt_missing' USING ERRCODE='check_violation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.rag_control_request WHERE request_id=p_request_id AND outcome='unknown') THEN
    RAISE EXCEPTION 'rag_reconciliation_request_not_unknown' USING ERRCODE='check_violation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.rag_control_dispatch_subject
    WHERE request_id=p_request_id AND subject_kind='generation' AND subject_id=p_generation_id) THEN
    RAISE EXCEPTION 'rag_reconciliation_subject_mismatch' USING ERRCODE='check_violation';
  END IF;
  UPDATE public.rag_embedding_generation
     SET state='failed',failure_reason='reconciled_unknown',retired_at=clock_timestamp()
   WHERE id=p_generation_id
     AND state IN ('building','shadow','gated');
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_reconciliation_subject_mismatch' USING ERRCODE='check_violation'; END IF;
  UPDATE public.rag_control_request SET outcome='failed',terminal_at=clock_timestamp()
   WHERE request_id=p_request_id AND outcome='unknown';
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_terminalize_unknown_rebuild_run(
  p_request_id text,p_run_id text,p_receipt_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.rag_reconciliation_receipt
     WHERE receipt_id=p_receipt_id AND request_id=p_request_id AND subject_kind='rebuild_run'
       AND subject_id=p_run_id AND decision='failed'
  ) THEN RAISE EXCEPTION 'rag_reconciliation_receipt_missing' USING ERRCODE='check_violation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.rag_control_request WHERE request_id=p_request_id AND outcome='unknown') THEN
    RAISE EXCEPTION 'rag_reconciliation_request_not_unknown' USING ERRCODE='check_violation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.rag_control_dispatch_subject
    WHERE request_id=p_request_id AND subject_kind='rebuild_run' AND subject_id=p_run_id) THEN
    RAISE EXCEPTION 'rag_reconciliation_subject_mismatch' USING ERRCODE='check_violation';
  END IF;
  UPDATE public.rag_rebuild_run
     SET status='failed',completed_at=clock_timestamp(),lease_owner=NULL,lease_expires_at=NULL,row_version=row_version+1
   WHERE id=p_run_id AND status IN ('pending','running','paused','orphaned');
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_reconciliation_subject_mismatch' USING ERRCODE='check_violation'; END IF;
  UPDATE public.rag_control_request SET outcome='failed',terminal_at=clock_timestamp()
   WHERE request_id=p_request_id AND outcome='unknown';
END;
$$;

-- These helpers are intentionally not granted to the executor.  A reviewed
-- operation calculates its own canonical jsonb payload, claims the binding,
-- performs its state mutation, then terminalizes the request in the same
-- PostgreSQL transaction.  A response-lost replay can only read the exact
-- success result; it cannot substitute a new argument set under an old id.
CREATE OR REPLACE FUNCTION rag_control.rag_control_input_digest(p_operation text,p_input jsonb)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
  SELECT encode(public.digest(p_operation || E'\\x1f' || p_input::text, 'sha256'), 'hex')
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_claim_request_input(
  p_request_id text,p_operation text,p_input_digest text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE request_row public.rag_control_request%ROWTYPE;
DECLARE binding_row public.rag_control_request_input_binding%ROWTYPE;
BEGIN
  IF p_input_digest !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'rag_control_input_digest_invalid' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO request_row FROM public.rag_control_request WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND OR request_row.operation<>p_operation THEN
    RAISE EXCEPTION 'rag_control_request_mismatch' USING ERRCODE='check_violation';
  END IF;
  SELECT * INTO binding_row FROM public.rag_control_request_input_binding WHERE request_id=p_request_id FOR UPDATE;
  IF FOUND THEN
    IF binding_row.operation<>p_operation OR binding_row.input_digest<>p_input_digest THEN
      RAISE EXCEPTION 'rag_control_request_input_mismatch' USING ERRCODE='check_violation';
    END IF;
    IF request_row.outcome='succeeded' THEN RETURN false; END IF;
    IF request_row.outcome='prepared' THEN RETURN true; END IF;
    RAISE EXCEPTION 'rag_control_request_not_prepared' USING ERRCODE='check_violation';
  END IF;
  IF request_row.outcome<>'prepared' THEN
    RAISE EXCEPTION 'rag_control_request_not_prepared' USING ERRCODE='check_violation';
  END IF;
  INSERT INTO public.rag_control_request_input_binding(request_id,operation,input_digest)
  VALUES (p_request_id,p_operation,p_input_digest);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_succeed_request(
  p_request_id text,p_operation text,p_input_digest text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
BEGIN
  UPDATE public.rag_control_request r
     SET outcome='succeeded',terminal_at=clock_timestamp()
    FROM public.rag_control_request_input_binding b
   WHERE r.request_id=p_request_id AND r.request_id=b.request_id
     AND r.operation=p_operation AND b.operation=p_operation AND b.input_digest=p_input_digest
     AND r.outcome='prepared';
  IF NOT FOUND AND NOT EXISTS (
    SELECT 1 FROM public.rag_control_request r
      JOIN public.rag_control_request_input_binding b ON b.request_id=r.request_id
     WHERE r.request_id=p_request_id AND r.operation=p_operation AND b.operation=p_operation
       AND b.input_digest=p_input_digest AND r.outcome='succeeded'
  ) THEN
    RAISE EXCEPTION 'rag_control_request_complete_conflict' USING ERRCODE='check_violation';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_register_private_document(p_document_id text, p_source_kind text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user',true);
BEGIN
  IF coalesce(principal,'')='' THEN RAISE EXCEPTION 'rag_principal_missing' USING ERRCODE='insufficient_privilege'; END IF;
  INSERT INTO public.rag_corpus_document(id,owner_user_id,visibility,source_kind)
  VALUES (p_document_id,principal,'private',p_source_kind)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_publish_private_document_version(
  p_document_id text,p_content_hash text,p_parser_hash text,p_cleaning_hash text,p_chunker_hash text,p_locator jsonb,p_chunks jsonb
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user',true); v integer; old_v integer; owner_id text;
BEGIN
  IF coalesce(principal,'')='' OR jsonb_typeof(p_chunks) IS DISTINCT FROM 'array' OR jsonb_array_length(p_chunks)=0 THEN
    RAISE EXCEPTION 'rag_private_publish_invalid' USING ERRCODE='check_violation';
  END IF;
  SELECT current_content_version,owner_user_id INTO old_v,owner_id FROM public.rag_corpus_document
   WHERE id=p_document_id AND visibility='private' FOR UPDATE;
  IF NOT FOUND OR owner_id<>principal THEN RAISE EXCEPTION 'rag_document_not_writable' USING ERRCODE='insufficient_privilege'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_chunks) AS x(id text,ordinal integer,content_hash text,content text,locator jsonb)
    WHERE id !~ '^[A-Za-z0-9:_-]{1,180}$' OR ordinal IS NULL OR ordinal<0 OR content_hash !~ '^[0-9a-f]{64}$'
      OR content IS NULL OR char_length(content) NOT BETWEEN 1 AND 120000)
     OR EXISTS (SELECT ordinal FROM jsonb_to_recordset(p_chunks) AS x(id text,ordinal integer,content_hash text,content text,locator jsonb)
         GROUP BY ordinal HAVING count(*)>1) THEN RAISE EXCEPTION 'rag_private_chunks_invalid' USING ERRCODE='check_violation'; END IF;
  v:=old_v+1;
  IF old_v>0 THEN
    UPDATE public.rag_corpus_content_version SET state='superseded' WHERE document_id=p_document_id AND content_version=old_v AND state='active';
    UPDATE public.rag_corpus_chunk SET state='superseded' WHERE document_id=p_document_id AND content_version=old_v AND state='active';
    INSERT INTO public.rag_corpus_tombstone(chunk_id,document_id,content_version,owner_user_id,reason)
      SELECT id,document_id,content_version,owner_id,'supersede' FROM public.rag_corpus_chunk WHERE document_id=p_document_id AND content_version=old_v
      ON CONFLICT (chunk_id) DO NOTHING;
  END IF;
  INSERT INTO public.rag_corpus_content_version(document_id,content_version,content_hash,parser_recipe_hash,cleaning_recipe_hash,chunker_recipe_hash,source_locator)
  VALUES (p_document_id,v,p_content_hash,p_parser_hash,p_cleaning_hash,p_chunker_hash,coalesce(p_locator,'{}'::jsonb));
  INSERT INTO public.rag_corpus_chunk(id,document_id,content_version,ordinal,content_hash,content,locator)
  SELECT id,p_document_id,v,ordinal,content_hash,content,coalesce(locator,'{}'::jsonb)
    FROM jsonb_to_recordset(p_chunks) AS x(id text,ordinal integer,content_hash text,content text,locator jsonb);
  UPDATE public.rag_corpus_document SET current_content_version=v,content_hash=p_content_hash,status='active',row_version=row_version+1,updated_at=clock_timestamp()
   WHERE id=p_document_id;
  UPDATE public.rag_corpus_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
  RETURN v;
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_register_global_document(p_request_id text,p_document_id text,p_source_kind text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('global_publish', jsonb_build_object('document_id',p_document_id,'source_kind',p_source_kind));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'global_publish',input_digest) THEN RETURN; END IF;
  INSERT INTO public.rag_corpus_document(id,owner_user_id,visibility,source_kind)
  VALUES (p_document_id,'__system_rag__','global',p_source_kind) ON CONFLICT (id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.rag_corpus_document WHERE id=p_document_id AND visibility='global' AND source_kind=p_source_kind) THEN
    RAISE EXCEPTION 'rag_global_document_conflict' USING ERRCODE='unique_violation';
  END IF;
  PERFORM rag_control.rag_succeed_request(p_request_id,'global_publish',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_control_publish_global_document_version(
  p_request_id text,p_document_id text,p_content_hash text,p_parser_hash text,p_cleaning_hash text,p_chunker_hash text,p_locator jsonb,p_chunks jsonb
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE v integer; old_v integer; digest_value text; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('global_publish', jsonb_build_object(
    'chunks',p_chunks,'chunker_hash',p_chunker_hash,'cleaning_hash',p_cleaning_hash,'content_hash',p_content_hash,
    'document_id',p_document_id,'locator',coalesce(p_locator,'{}'::jsonb),'parser_hash',p_parser_hash
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'global_publish',input_digest) THEN
    SELECT content_version INTO v FROM public.rag_global_document_provenance
      WHERE document_id=p_document_id AND control_request_id=p_request_id AND trust_state='approved';
    IF NOT FOUND THEN RAISE EXCEPTION 'rag_control_replay_result_missing' USING ERRCODE='check_violation'; END IF;
    RETURN v;
  END IF;
  IF jsonb_typeof(p_chunks) IS DISTINCT FROM 'array' OR jsonb_array_length(p_chunks)=0 THEN RAISE EXCEPTION 'rag_global_publish_invalid' USING ERRCODE='check_violation'; END IF;
  SELECT current_content_version INTO old_v FROM public.rag_corpus_document WHERE id=p_document_id AND visibility='global' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_global_document_missing' USING ERRCODE='foreign_key_violation'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_chunks) AS x(id text,ordinal integer,content_hash text,content text,locator jsonb)
    WHERE id !~ '^[A-Za-z0-9:_-]{1,180}$' OR ordinal IS NULL OR ordinal<0 OR content_hash !~ '^[0-9a-f]{64}$'
      OR content IS NULL OR char_length(content) NOT BETWEEN 1 AND 120000)
     OR EXISTS (SELECT ordinal FROM jsonb_to_recordset(p_chunks) AS x(id text,ordinal integer,content_hash text,content text,locator jsonb)
       GROUP BY ordinal HAVING count(*)>1) THEN RAISE EXCEPTION 'rag_global_chunks_invalid' USING ERRCODE='check_violation'; END IF;
  v:=old_v+1;
  IF old_v>0 THEN
    UPDATE public.rag_corpus_content_version SET state='superseded' WHERE document_id=p_document_id AND content_version=old_v AND state='active';
    UPDATE public.rag_corpus_chunk SET state='superseded' WHERE document_id=p_document_id AND content_version=old_v AND state='active';
  END IF;
  INSERT INTO public.rag_corpus_content_version(document_id,content_version,content_hash,parser_recipe_hash,cleaning_recipe_hash,chunker_recipe_hash,source_locator)
  VALUES (p_document_id,v,p_content_hash,p_parser_hash,p_cleaning_hash,p_chunker_hash,coalesce(p_locator,'{}'::jsonb));
  INSERT INTO public.rag_corpus_chunk(id,document_id,content_version,ordinal,content_hash,content,locator)
    SELECT id,p_document_id,v,ordinal,content_hash,content,coalesce(locator,'{}'::jsonb)
      FROM jsonb_to_recordset(p_chunks) AS x(id text,ordinal integer,content_hash text,content text,locator jsonb);
  UPDATE public.rag_corpus_document SET current_content_version=v,content_hash=p_content_hash,status='active',row_version=row_version+1,updated_at=clock_timestamp() WHERE id=p_document_id;
  digest_value:=encode(public.digest(p_document_id || ':' || v::text || ':' || p_content_hash || ':' || p_request_id,'sha256'),'hex');
  INSERT INTO public.rag_global_document_provenance(document_id,content_version,trust_state,control_request_id,provenance_digest)
  VALUES (p_document_id,v,'approved',p_request_id,digest_value);
  UPDATE public.rag_corpus_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
  PERFORM rag_control.rag_succeed_request(p_request_id,'global_publish',input_digest);
  RETURN v;
END;
$$;

-- New functions are the sole visible API.  Old public overloads are kept
-- present for migration compatibility but are not executable by service roles.
ALTER FUNCTION rag_control.rag_control_begin_request(text,text,text,bigint) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_mark_request_dispatching(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_bind_generation_dispatch_request(text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_bind_rebuild_dispatch_request(text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_settle_request_dispatch(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_record_reconciliation_receipt(text,text,text,text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_terminalize_unknown_generation(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_terminalize_unknown_rebuild_run(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_control_input_digest(text,jsonb) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_claim_request_input(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_succeed_request(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_register_global_document(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_control_publish_global_document_version(text,text,text,text,text,text,jsonb,jsonb) OWNER TO rag_control_definer;
ALTER FUNCTION rag_runtime.rag_register_private_document(text,text) OWNER TO rag_runtime_definer;
ALTER FUNCTION rag_runtime.rag_publish_private_document_version(text,text,text,text,text,jsonb,jsonb) OWNER TO rag_runtime_definer;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rag_control, rag_runtime FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rag_control.rag_control_begin_request(text,text,text,bigint),
  rag_control.rag_mark_request_dispatching(text,text,text), rag_control.rag_bind_generation_dispatch_request(text,text),
  rag_control.rag_bind_rebuild_dispatch_request(text,text), rag_control.rag_settle_request_dispatch(text,text,text),
  rag_control.rag_record_reconciliation_receipt(text,text,text,text,text,text),
  rag_control.rag_terminalize_unknown_generation(text,text,text), rag_control.rag_terminalize_unknown_rebuild_run(text,text,text),
  rag_control.rag_register_global_document(text,text,text),
  rag_control.rag_control_publish_global_document_version(text,text,text,text,text,text,jsonb,jsonb)
  TO rag_control_executor;
GRANT EXECUTE ON FUNCTION rag_runtime.rag_register_private_document(text,text),
  rag_runtime.rag_publish_private_document_version(text,text,text,text,text,jsonb,jsonb)
  TO app_role;

CREATE OR REPLACE FUNCTION rag_runtime.rag_bind_query(p_binding_id text,p_sticky_key text,p_ttl_seconds integer)
RETURNS TABLE(generation_id text,recipe_id text) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user',true); active_id text; candidate_id text; candidate_percent integer;
        corpus_epoch bigint; candidate_epoch bigint; selected_id text;
BEGIN
  IF coalesce(principal,'')='' OR p_ttl_seconds NOT BETWEEN 60 AND 604800 OR char_length(p_sticky_key) NOT BETWEEN 1 AND 512 THEN
    RAISE EXCEPTION 'rag_binding_invalid' USING ERRCODE='check_violation';
  END IF;
  SELECT epoch INTO corpus_epoch FROM public.rag_corpus_epoch WHERE singleton;
  SELECT a.generation_id INTO active_id FROM public.rag_active_generation a WHERE a.singleton;
  IF active_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.rag_embedding_generation g
    WHERE g.id=active_id AND g.state='active' AND g.control_trust_state='controlled' AND g.source_epoch=corpus_epoch) THEN
    RAISE EXCEPTION 'rag_active_generation_stale' USING ERRCODE='serialization_failure';
  END IF;
  SELECT g.id,r.percent,g.source_epoch INTO candidate_id,candidate_percent,candidate_epoch
    FROM public.rag_embedding_generation g JOIN public.rag_generation_rollout r ON r.generation_id=g.id
   WHERE g.state='gated' AND g.control_trust_state='controlled' AND r.status IN ('running','completed') ORDER BY g.created_at DESC LIMIT 1;
  IF candidate_id IS NOT NULL AND candidate_epoch=corpus_epoch
     AND (get_byte(decode(substr(md5(p_sticky_key),1,2),'hex'),0) % 100) < candidate_percent THEN selected_id:=candidate_id; ELSE selected_id:=active_id; END IF;
  IF selected_id IS NULL THEN RAISE EXCEPTION 'rag_active_generation_unavailable' USING ERRCODE='no_data_found'; END IF;
  INSERT INTO public.rag_query_binding(id,owner_user_id,generation_id,sticky_key_hash,expires_at)
  VALUES (p_binding_id,principal,selected_id,encode(public.digest(p_sticky_key,'sha256'),'hex'),clock_timestamp()+make_interval(secs=>p_ttl_seconds))
  ON CONFLICT (id) DO NOTHING;
  RETURN QUERY SELECT b.generation_id,g.recipe_id FROM public.rag_query_binding b
    JOIN public.rag_embedding_generation g ON g.id=b.generation_id AND g.control_trust_state='controlled'
    WHERE b.id=p_binding_id AND b.owner_user_id=principal AND b.status='active' AND b.expires_at>clock_timestamp();
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_resolve_query_binding(p_binding_id text)
RETURNS TABLE(generation_id text,recipe_id text,dimensions integer) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user',true);
BEGIN
  UPDATE public.rag_query_binding SET status='expired' WHERE id=p_binding_id AND owner_user_id=principal AND status='active' AND expires_at<=clock_timestamp();
  RETURN QUERY SELECT b.generation_id,r.id,r.dimensions FROM public.rag_query_binding b
    JOIN public.rag_embedding_generation g ON g.id=b.generation_id AND g.state IN ('active','gated','deprecated') AND g.control_trust_state='controlled'
    JOIN public.rag_embedding_recipe r ON r.id=g.recipe_id
   WHERE b.id=p_binding_id AND b.owner_user_id=principal AND b.status='active' AND b.expires_at>clock_timestamp();
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_binding_unavailable' USING ERRCODE='no_data_found'; END IF;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_search_bound(p_binding_id text,p_embedding public.vector,p_k integer)
RETURNS TABLE(chunk_id text,document_id text,content_version integer,distance double precision) LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE gen_id text; ignored_recipe text; table_name text; dim integer;
BEGIN
  IF p_k NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'rag_search_k_invalid' USING ERRCODE='check_violation'; END IF;
  SELECT rb.generation_id,rb.recipe_id,rb.dimensions INTO gen_id,ignored_recipe,dim FROM rag_runtime.rag_resolve_query_binding(p_binding_id) rb;
  SELECT physical_table INTO table_name FROM public.rag_embedding_generation WHERE id=gen_id AND control_trust_state='controlled';
  IF NOT FOUND OR public.vector_dims(p_embedding)<>dim THEN RAISE EXCEPTION 'rag_search_embedding_invalid' USING ERRCODE='check_violation'; END IF;
  RETURN QUERY EXECUTE format(
    'SELECT v.chunk_id,v.document_id,v.content_version,(v.embedding OPERATOR(public.<=>) $1)::double precision
       FROM rag_control.%I v
       JOIN public.rag_generation_member m ON m.generation_id=$2 AND m.chunk_id=v.chunk_id
       JOIN public.rag_corpus_chunk c ON c.id=v.chunk_id AND c.state IN (''active'',''superseded'')
       JOIN public.rag_corpus_document d ON d.id=c.document_id
      WHERE (v.visibility=''private'' AND v.owner_user_id=current_setting(''app.principal_user'',true))
         OR (v.visibility=''global'' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
            WHERE p.document_id=v.document_id AND p.content_version=v.content_version AND p.trust_state=''approved''))
      ORDER BY v.embedding OPERATOR(public.<=>) $1 LIMIT $3', table_name)
    USING p_embedding,gen_id,p_k;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_evidence_bound(p_binding_id text,p_chunk_ids text[],p_max_chars integer)
RETURNS TABLE(chunk_id text,document_id text,content_version integer,snapshot_hash text,locator jsonb,excerpt text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE gen_id text;
BEGIN
  IF coalesce(array_length(p_chunk_ids,1),0)>50 OR p_max_chars NOT BETWEEN 1 AND 1200 THEN
    RAISE EXCEPTION 'rag_evidence_invalid' USING ERRCODE='check_violation';
  END IF;
  SELECT rb.generation_id INTO gen_id FROM rag_runtime.rag_resolve_query_binding(p_binding_id) rb;
  RETURN QUERY SELECT c.id,c.document_id,c.content_version,c.content_hash,c.locator,left(c.content,p_max_chars)
    FROM unnest(p_chunk_ids) WITH ORDINALITY u(id,ord)
    JOIN public.rag_generation_member m ON m.generation_id=gen_id AND m.chunk_id=u.id
    JOIN public.rag_corpus_chunk c ON c.id=m.chunk_id AND c.state IN ('active','superseded')
    JOIN public.rag_corpus_document d ON d.id=c.document_id
   WHERE (d.visibility='private' AND d.owner_user_id=current_setting('app.principal_user',true))
      OR (d.visibility='global' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
        WHERE p.document_id=c.document_id AND p.content_version=c.content_version AND p.trust_state='approved'))
   ORDER BY u.ord;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_record_citation(p_citation_id text,p_binding_id text,p_chunk_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user',true); gen_id text; chunk_row record;
BEGIN
  SELECT rb.generation_id INTO gen_id FROM rag_runtime.rag_resolve_query_binding(p_binding_id) rb;
  SELECT ch.* INTO chunk_row FROM public.rag_corpus_chunk ch JOIN public.rag_generation_member m
    ON m.chunk_id=ch.id AND m.generation_id=gen_id WHERE ch.id=p_chunk_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_citation_not_bound' USING ERRCODE='check_violation'; END IF;
  INSERT INTO public.rag_citation(id,owner_user_id,binding_id,generation_id,chunk_id,document_id,content_version,snapshot_hash)
  VALUES (p_citation_id,principal,p_binding_id,gen_id,chunk_row.id,chunk_row.document_id,chunk_row.content_version,chunk_row.content_hash)
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION rag_runtime.rag_tombstone_private_document(p_document_id text,p_reason text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_runtime, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user',true); owner_id text; generation_row record; chunk_row record;
BEGIN
  IF p_reason NOT IN ('delete','erasure') THEN RAISE EXCEPTION 'rag_tombstone_reason_invalid' USING ERRCODE='check_violation'; END IF;
  SELECT owner_user_id INTO owner_id FROM public.rag_corpus_document WHERE id=p_document_id AND visibility='private' FOR UPDATE;
  IF NOT FOUND OR owner_id<>principal THEN RAISE EXCEPTION 'rag_document_not_writable' USING ERRCODE='insufficient_privilege'; END IF;
  FOR chunk_row IN SELECT * FROM public.rag_corpus_chunk WHERE document_id=p_document_id AND state IN ('active','superseded') LOOP
    UPDATE public.rag_corpus_chunk SET state='tombstoned' WHERE id=chunk_row.id;
    UPDATE public.rag_corpus_content_version SET state='tombstoned' WHERE document_id=chunk_row.document_id AND content_version=chunk_row.content_version
      AND state IN ('active','superseded');
    INSERT INTO public.rag_corpus_tombstone(chunk_id,document_id,content_version,owner_user_id,reason)
    VALUES (chunk_row.id,chunk_row.document_id,chunk_row.content_version,owner_id,p_reason)
    ON CONFLICT (chunk_id) DO UPDATE SET reason=EXCLUDED.reason;
    FOR generation_row IN SELECT physical_table FROM public.rag_embedding_generation WHERE control_trust_state='controlled' LOOP
      -- A controlled generation is allowed to be in `building` before its
      -- physical partition exists.  Tombstoning must still finish and must
      -- never turn that harmless intermediate state into a data-read error.
      IF to_regclass(format('rag_control.%I',generation_row.physical_table)) IS NOT NULL THEN
        EXECUTE format('DELETE FROM rag_control.%I WHERE chunk_id=$1',generation_row.physical_table) USING chunk_row.id;
      END IF;
    END LOOP;
    UPDATE public.rag_citation SET status='invalidated' WHERE chunk_id=chunk_row.id AND status='valid';
  END LOOP;
  UPDATE public.rag_corpus_document SET status=CASE WHEN p_reason='erasure' THEN 'hard_deleted' ELSE 'soft_deleted' END,
    retained_until=CASE WHEN p_reason='erasure' THEN clock_timestamp() ELSE clock_timestamp()+interval '30 days' END,
    row_version=row_version+1,updated_at=clock_timestamp() WHERE id=p_document_id;
  UPDATE public.rag_corpus_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
END;
$$;

ALTER FUNCTION rag_runtime.rag_bind_query(text,text,integer) OWNER TO rag_runtime_definer;
ALTER FUNCTION rag_runtime.rag_resolve_query_binding(text) OWNER TO rag_runtime_definer;
ALTER FUNCTION rag_runtime.rag_search_bound(text,public.vector,integer) OWNER TO rag_runtime_definer;
ALTER FUNCTION rag_runtime.rag_evidence_bound(text,text[],integer) OWNER TO rag_runtime_definer;
ALTER FUNCTION rag_runtime.rag_record_citation(text,text,text) OWNER TO rag_runtime_definer;
ALTER FUNCTION rag_runtime.rag_tombstone_private_document(text,text) OWNER TO rag_runtime_definer;
GRANT EXECUTE ON FUNCTION rag_runtime.rag_bind_query(text,text,integer), rag_runtime.rag_resolve_query_binding(text),
  rag_runtime.rag_search_bound(text,public.vector,integer), rag_runtime.rag_evidence_bound(text,text[],integer),
  rag_runtime.rag_record_citation(text,text,text), rag_runtime.rag_tombstone_private_document(text,text) TO app_role;

CREATE OR REPLACE FUNCTION rag_control.rag_register_embedding_recipe(
  p_request_id text,p_id text,p_recipe_hash text,p_provider text,p_model text,p_provider_revision text,p_dimensions integer,
  p_normalization_version text,p_chunker_hash text,p_document_transform_version text,p_query_transform_version text,p_manifest jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE existing public.rag_embedding_recipe%ROWTYPE; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('recipe_register', jsonb_build_object(
    'chunker_hash',p_chunker_hash,'dimensions',p_dimensions,'document_transform_version',p_document_transform_version,
    'id',p_id,'manifest',p_manifest,'model',p_model,'normalization_version',p_normalization_version,
    'provider',p_provider,'provider_revision',p_provider_revision,'query_transform_version',p_query_transform_version,
    'recipe_hash',p_recipe_hash
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'recipe_register',input_digest) THEN RETURN; END IF;
  SELECT * INTO existing FROM public.rag_embedding_recipe WHERE recipe_hash=p_recipe_hash;
  IF FOUND THEN
    IF existing.id=p_id AND existing.provider=p_provider AND existing.model=p_model AND existing.provider_revision=p_provider_revision
       AND existing.dimensions=p_dimensions AND existing.normalization_version=p_normalization_version AND existing.chunker_recipe_hash=p_chunker_hash
       AND existing.document_transform_version=p_document_transform_version AND existing.query_transform_version=p_query_transform_version
       AND existing.manifest=p_manifest THEN
      PERFORM rag_control.rag_succeed_request(p_request_id,'recipe_register',input_digest);
      RETURN;
    END IF;
    RAISE EXCEPTION 'rag_recipe_conflict' USING ERRCODE='unique_violation';
  END IF;
  INSERT INTO public.rag_embedding_recipe(id,recipe_hash,provider,model,provider_revision,dimensions,normalization_version,chunker_recipe_hash,document_transform_version,query_transform_version,manifest)
  VALUES (p_id,p_recipe_hash,p_provider,p_model,p_provider_revision,p_dimensions,p_normalization_version,p_chunker_hash,p_document_transform_version,p_query_transform_version,p_manifest);
  PERFORM rag_control.rag_succeed_request(p_request_id,'recipe_register',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_register_release_policy(
  p_request_id text,p_id text,p_min_queries integer,p_recall_bp integer,p_p95_bp integer,p_cost_bp integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE existing public.rag_release_policy%ROWTYPE; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('policy_register', jsonb_build_object(
    'id',p_id,'max_cost_regression_bp',p_cost_bp,'max_p95_regression_bp',p_p95_bp,
    'max_recall_drop_bp',p_recall_bp,'min_labeled_queries',p_min_queries
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'policy_register',input_digest) THEN RETURN; END IF;
  SELECT * INTO existing FROM public.rag_release_policy WHERE id=p_id;
  IF FOUND THEN
    IF existing.min_labeled_queries=p_min_queries AND existing.max_recall_drop_bp=p_recall_bp
       AND existing.max_p95_regression_bp=p_p95_bp AND existing.max_cost_regression_bp=p_cost_bp THEN
      PERFORM rag_control.rag_succeed_request(p_request_id,'policy_register',input_digest);
      RETURN;
    END IF;
    RAISE EXCEPTION 'rag_release_policy_conflict' USING ERRCODE='unique_violation';
  END IF;
  INSERT INTO public.rag_release_policy(id,min_labeled_queries,max_recall_drop_bp,max_p95_regression_bp,max_cost_regression_bp)
  VALUES (p_id,p_min_queries,p_recall_bp,p_p95_bp,p_cost_bp);
  PERFORM rag_control.rag_succeed_request(p_request_id,'policy_register',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_start_generation(p_request_id text,p_generation_id text,p_recipe_id text,p_policy_id text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE corpus_epoch bigint; expected integer; table_name text; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_start', jsonb_build_object(
    'generation_id',p_generation_id,'policy_id',p_policy_id,'recipe_id',p_recipe_id
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_start',input_digest) THEN
    SELECT expected_chunk_count INTO expected FROM public.rag_embedding_generation
      WHERE id=p_generation_id AND recipe_id=p_recipe_id AND release_policy_id=p_policy_id
        AND control_request_id=p_request_id AND control_trust_state='controlled';
    IF NOT FOUND THEN RAISE EXCEPTION 'rag_control_replay_result_missing' USING ERRCODE='check_violation'; END IF;
    RETURN expected;
  END IF;
  SELECT epoch INTO corpus_epoch FROM public.rag_corpus_epoch WHERE singleton FOR SHARE;
  IF NOT EXISTS (SELECT 1 FROM public.rag_embedding_recipe WHERE id=p_recipe_id)
     OR NOT EXISTS (SELECT 1 FROM public.rag_release_policy WHERE id=p_policy_id) THEN
    RAISE EXCEPTION 'rag_generation_dependency_missing' USING ERRCODE='foreign_key_violation';
  END IF;
  table_name := 'rag_vector_' || replace(substr(p_generation_id,6),'-','');
  INSERT INTO public.rag_embedding_generation(id,recipe_id,release_policy_id,source_epoch,expected_chunk_count,physical_table,state,control_trust_state,control_request_id)
  VALUES (p_generation_id,p_recipe_id,p_policy_id,corpus_epoch,0,table_name,'building','controlled',p_request_id)
  ON CONFLICT (id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.rag_embedding_generation WHERE id=p_generation_id AND recipe_id=p_recipe_id
    AND release_policy_id=p_policy_id AND control_request_id=p_request_id AND control_trust_state='controlled') THEN
    RAISE EXCEPTION 'rag_generation_conflict' USING ERRCODE='unique_violation';
  END IF;
  INSERT INTO public.rag_generation_member(generation_id,chunk_id,document_id,owner_user_id,visibility,content_version,content_hash)
  SELECT p_generation_id,c.id,c.document_id,d.owner_user_id,d.visibility,c.content_version,c.content_hash
    FROM public.rag_corpus_chunk c JOIN public.rag_corpus_document d ON d.id=c.document_id
   WHERE c.state='active' AND d.status='active' AND d.current_content_version=c.content_version
     AND (d.visibility='private' OR EXISTS (SELECT 1 FROM public.rag_global_document_provenance p
       WHERE p.document_id=c.document_id AND p.content_version=c.content_version AND p.trust_state='approved'))
  ON CONFLICT (generation_id,chunk_id) DO NOTHING;
  SELECT count(*)::integer INTO expected FROM public.rag_generation_member WHERE generation_id=p_generation_id;
  UPDATE public.rag_embedding_generation SET expected_chunk_count=expected WHERE id=p_generation_id AND state='building';
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_start',input_digest);
  RETURN expected;
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_prepare_generation_storage(p_request_id text,p_generation_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE table_name text; table_ref text; dimensions integer; read_policy text; delete_policy text; control_policy text; index_name text; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_prepare', jsonb_build_object('generation_id',p_generation_id));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_prepare',input_digest) THEN RETURN; END IF;
  SELECT g.physical_table,r.dimensions INTO table_name,dimensions FROM public.rag_embedding_generation g
    JOIN public.rag_embedding_recipe r ON r.id=g.recipe_id WHERE g.id=p_generation_id AND g.state='building' AND g.control_trust_state='controlled';
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_generation_not_building' USING ERRCODE='check_violation'; END IF;
  read_policy:='p_' || table_name || '_runtime_read'; delete_policy:='p_' || table_name || '_runtime_delete';
  control_policy:='p_' || table_name || '_control_all'; index_name:='i_' || table_name || '_hnsw';
  table_ref:=format('rag_control.%I',table_name);
  EXECUTE format('CREATE TABLE IF NOT EXISTS rag_control.%I (chunk_id text PRIMARY KEY,document_id text NOT NULL,owner_user_id text NOT NULL,visibility text NOT NULL CHECK (visibility IN (''private'',''global'')),content_version integer NOT NULL,embedding public.vector(%s) NOT NULL)',table_name,dimensions);
  EXECUTE format('ALTER TABLE rag_control.%I OWNER TO rag_control_definer',table_name);
  EXECUTE format('ALTER TABLE rag_control.%I ENABLE ROW LEVEL SECURITY',table_name);
  EXECUTE format('ALTER TABLE rag_control.%I FORCE ROW LEVEL SECURITY',table_name);
  EXECUTE format('DROP POLICY IF EXISTS %I ON rag_control.%I',control_policy,table_name);
  EXECUTE format('CREATE POLICY %I ON rag_control.%I FOR ALL TO rag_control_definer USING (true) WITH CHECK (true)',control_policy,table_name);
  EXECUTE format('DROP POLICY IF EXISTS %I ON rag_control.%I',read_policy,table_name);
  EXECUTE format('CREATE POLICY %I ON %s FOR SELECT TO rag_runtime_definer USING ((visibility=''private'' AND owner_user_id=current_setting(''app.principal_user'',true)) OR (visibility=''global'' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p WHERE p.document_id=%s.document_id AND p.content_version=%s.content_version AND p.trust_state=''approved'')))',read_policy,table_ref,table_ref,table_ref);
  EXECUTE format('DROP POLICY IF EXISTS %I ON rag_control.%I',delete_policy,table_name);
  EXECUTE format('CREATE POLICY %I ON rag_control.%I FOR DELETE TO rag_runtime_definer USING (visibility=''private'' AND owner_user_id=current_setting(''app.principal_user'',true))',delete_policy,table_name);
  EXECUTE format('GRANT SELECT,DELETE ON rag_control.%I TO rag_runtime_definer',table_name);
  EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON rag_control.%I USING hnsw (embedding public.vector_cosine_ops)',index_name,table_name);
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_prepare',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_insert_generation_vector(p_request_id text,p_generation_id text,p_chunk_id text,p_embedding public.vector)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE table_name text; dimensions integer; member_row record; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_vector', jsonb_build_object(
    'chunk_id',p_chunk_id,'embedding',p_embedding::text,'generation_id',p_generation_id
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_vector',input_digest) THEN RETURN; END IF;
  SELECT g.physical_table,r.dimensions INTO table_name,dimensions FROM public.rag_embedding_generation g JOIN public.rag_embedding_recipe r ON r.id=g.recipe_id
    WHERE g.id=p_generation_id AND g.state='building' AND g.control_trust_state='controlled';
  IF NOT FOUND OR public.vector_dims(p_embedding)<>dimensions THEN RAISE EXCEPTION 'rag_generation_vector_invalid' USING ERRCODE='check_violation'; END IF;
  SELECT gm.* INTO member_row FROM public.rag_generation_member gm JOIN public.rag_corpus_chunk c ON c.id=gm.chunk_id
   WHERE gm.generation_id=p_generation_id AND gm.chunk_id=p_chunk_id AND c.state='active'
    AND NOT EXISTS (SELECT 1 FROM public.rag_corpus_tombstone t WHERE t.chunk_id=gm.chunk_id AND t.reason IN ('delete','erasure'));
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_generation_member_unavailable' USING ERRCODE='check_violation'; END IF;
  EXECUTE format('INSERT INTO rag_control.%I(chunk_id,document_id,owner_user_id,visibility,content_version,embedding) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (chunk_id) DO NOTHING',table_name)
    USING member_row.chunk_id,member_row.document_id,member_row.owner_user_id,member_row.visibility,member_row.content_version,p_embedding;
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_vector',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_validate_generation(p_request_id text,p_generation_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE table_name text; expected integer; actual integer; generation_source_epoch bigint; now_epoch bigint; mismatch integer; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_validate', jsonb_build_object('generation_id',p_generation_id));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_validate',input_digest) THEN
    IF NOT EXISTS (SELECT 1 FROM public.rag_embedding_generation WHERE id=p_generation_id AND state IN ('shadow','gated','active','deprecated','retired')
      AND control_trust_state='controlled') THEN
      RAISE EXCEPTION 'rag_control_replay_result_missing' USING ERRCODE='check_violation';
    END IF;
    RETURN;
  END IF;
  SELECT g.physical_table,g.expected_chunk_count,g.source_epoch INTO table_name,expected,generation_source_epoch FROM public.rag_embedding_generation g
   WHERE id=p_generation_id AND state='building' AND control_trust_state='controlled' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_generation_not_building' USING ERRCODE='check_violation'; END IF;
  EXECUTE format('SELECT count(*)::integer FROM rag_control.%I',table_name) INTO actual;
  EXECUTE format(
    'SELECT count(*)::integer FROM (SELECT chunk_id,document_id,content_version FROM rag_control.%I EXCEPT SELECT chunk_id,document_id,content_version FROM public.rag_generation_member WHERE generation_id=$1) x', table_name)
    INTO mismatch USING p_generation_id;
  IF mismatch<>0 THEN RAISE EXCEPTION 'rag_generation_vector_member_mismatch' USING ERRCODE='check_violation'; END IF;
  EXECUTE format(
    'SELECT count(*)::integer FROM (SELECT chunk_id,document_id,content_version FROM public.rag_generation_member WHERE generation_id=$1 EXCEPT SELECT chunk_id,document_id,content_version FROM rag_control.%I) x', table_name)
    INTO mismatch USING p_generation_id;
  IF mismatch<>0 OR actual<>expected THEN RAISE EXCEPTION 'rag_generation_vector_count_mismatch' USING ERRCODE='check_violation'; END IF;
  SELECT epoch INTO now_epoch FROM public.rag_corpus_epoch WHERE singleton FOR SHARE;
  IF generation_source_epoch<>now_epoch OR EXISTS (SELECT 1 FROM public.rag_generation_member gm JOIN public.rag_corpus_chunk c ON c.id=gm.chunk_id
     WHERE gm.generation_id=p_generation_id AND (c.state<>'active' OR EXISTS (SELECT 1 FROM public.rag_corpus_tombstone t WHERE t.chunk_id=gm.chunk_id AND t.reason IN ('delete','erasure')))) THEN
    RAISE EXCEPTION 'rag_generation_source_stale' USING ERRCODE='serialization_failure';
  END IF;
  UPDATE public.rag_embedding_generation SET state='shadow',validated_at=clock_timestamp() WHERE id=p_generation_id;
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_validate',input_digest);
END;
$$;

ALTER FUNCTION rag_control.rag_register_embedding_recipe(text,text,text,text,text,text,integer,text,text,text,text,jsonb) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_register_release_policy(text,text,integer,integer,integer,integer) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_start_generation(text,text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_prepare_generation_storage(text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_insert_generation_vector(text,text,text,public.vector) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_validate_generation(text,text) OWNER TO rag_control_definer;
GRANT EXECUTE ON FUNCTION rag_control.rag_register_embedding_recipe(text,text,text,text,text,text,integer,text,text,text,text,jsonb),
  rag_control.rag_register_release_policy(text,text,integer,integer,integer,integer), rag_control.rag_start_generation(text,text,text,text),
  rag_control.rag_prepare_generation_storage(text,text), rag_control.rag_insert_generation_vector(text,text,text,public.vector),
  rag_control.rag_validate_generation(text,text) TO rag_control_executor;

CREATE OR REPLACE FUNCTION rag_control.rag_record_shadow_evaluation(
  p_request_id text,p_generation_id text,p_dataset_revision text,p_labeled integer,p_base_recall numeric,p_candidate_recall numeric,
  p_base_p95 numeric,p_candidate_p95 numeric,p_base_cost numeric,p_candidate_cost numeric
) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE policy_row public.rag_release_policy%ROWTYPE; verdict text; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_evaluate', jsonb_build_object(
    'base_cost',p_base_cost,'base_p95',p_base_p95,'base_recall',p_base_recall,'candidate_cost',p_candidate_cost,
    'candidate_p95',p_candidate_p95,'candidate_recall',p_candidate_recall,'dataset_revision',p_dataset_revision,
    'generation_id',p_generation_id,'labeled',p_labeled
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_evaluate',input_digest) THEN
    SELECT verdict INTO verdict FROM public.rag_shadow_evaluation WHERE generation_id=p_generation_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'rag_control_replay_result_missing' USING ERRCODE='check_violation'; END IF;
    RETURN verdict;
  END IF;
  SELECT p.* INTO policy_row FROM public.rag_embedding_generation g JOIN public.rag_release_policy p ON p.id=g.release_policy_id
   WHERE g.id=p_generation_id AND g.state='shadow' AND g.control_trust_state='controlled';
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_generation_not_shadow' USING ERRCODE='check_violation'; END IF;
  verdict:=CASE WHEN p_labeled>=policy_row.min_labeled_queries AND p_candidate_recall>=p_base_recall-policy_row.max_recall_drop_bp::numeric/10000
      AND p_candidate_p95<=p_base_p95*(1+policy_row.max_p95_regression_bp::numeric/10000)
      AND p_candidate_cost<=p_base_cost*(1+policy_row.max_cost_regression_bp::numeric/10000) THEN 'passed' ELSE 'failed' END;
  INSERT INTO public.rag_shadow_evaluation(generation_id,dataset_revision,labeled_query_count,baseline_recall,candidate_recall,baseline_p95_ms,candidate_p95_ms,baseline_cost_per_query,candidate_cost_per_query,verdict)
  VALUES (p_generation_id,p_dataset_revision,p_labeled,p_base_recall,p_candidate_recall,p_base_p95,p_candidate_p95,p_base_cost,p_candidate_cost,verdict)
  ON CONFLICT (generation_id) DO NOTHING;
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_evaluate',input_digest);
  RETURN verdict;
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_gate_generation(p_request_id text,p_generation_id text,p_approval_reference text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_gate', jsonb_build_object(
    'approval_reference',p_approval_reference,'generation_id',p_generation_id
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_gate',input_digest) THEN RETURN; END IF;
  IF char_length(coalesce(p_approval_reference,''))<8 THEN RAISE EXCEPTION 'rag_approval_reference_invalid' USING ERRCODE='check_violation'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.rag_embedding_generation g JOIN public.rag_shadow_evaluation e ON e.generation_id=g.id
     WHERE g.id=p_generation_id AND g.state='shadow' AND g.control_trust_state='controlled' AND e.verdict='passed') THEN
    RAISE EXCEPTION 'rag_shadow_evaluation_not_passed' USING ERRCODE='check_violation';
  END IF;
  UPDATE public.rag_embedding_generation SET state='gated' WHERE id=p_generation_id;
  INSERT INTO public.rag_generation_rollout(generation_id,percent,status) VALUES (p_generation_id,0,'ready') ON CONFLICT (generation_id) DO NOTHING;
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_gate',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_advance_rollout(p_request_id text,p_generation_id text,p_percent integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE prior integer; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_rollout', jsonb_build_object('generation_id',p_generation_id,'percent',p_percent));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_rollout',input_digest) THEN RETURN; END IF;
  SELECT percent INTO prior FROM public.rag_generation_rollout WHERE generation_id=p_generation_id FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.rag_embedding_generation WHERE id=p_generation_id AND state='gated' AND control_trust_state='controlled')
     OR p_percent NOT IN (1,10,50,100) OR p_percent<=prior THEN
    RAISE EXCEPTION 'rag_rollout_transition_invalid' USING ERRCODE='check_violation';
  END IF;
  UPDATE public.rag_generation_rollout SET percent=p_percent,status=CASE WHEN p_percent=100 THEN 'completed' ELSE 'running' END,updated_at=clock_timestamp()
   WHERE generation_id=p_generation_id;
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_rollout',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_promote_generation(p_request_id text,p_generation_id text,p_expected_previous text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE generation_source_epoch bigint; current_epoch bigint; prior_generation text; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_promote', jsonb_build_object(
    'expected_previous_generation_id',p_expected_previous,'generation_id',p_generation_id
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_promote',input_digest) THEN RETURN; END IF;
  SELECT g.source_epoch INTO generation_source_epoch FROM public.rag_embedding_generation g
   WHERE id=p_generation_id AND state='gated' AND control_trust_state='controlled' FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.rag_generation_rollout WHERE generation_id=p_generation_id AND percent=100 AND status='completed') THEN
    RAISE EXCEPTION 'rag_generation_not_promotable' USING ERRCODE='check_violation';
  END IF;
  SELECT epoch INTO current_epoch FROM public.rag_corpus_epoch WHERE singleton FOR SHARE;
  IF current_epoch<>generation_source_epoch THEN RAISE EXCEPTION 'rag_generation_source_stale' USING ERRCODE='serialization_failure'; END IF;
  SELECT generation_id INTO prior_generation FROM public.rag_active_generation WHERE singleton FOR UPDATE;
  IF prior_generation IS DISTINCT FROM NULLIF(p_expected_previous,'') THEN RAISE EXCEPTION 'rag_active_generation_cas_conflict' USING ERRCODE='serialization_failure'; END IF;
  IF prior_generation IS NOT NULL THEN UPDATE public.rag_embedding_generation SET state='deprecated' WHERE id=prior_generation AND state='active'; END IF;
  UPDATE public.rag_embedding_generation SET state='active',activated_at=clock_timestamp() WHERE id=p_generation_id;
  UPDATE public.rag_active_generation SET generation_id=p_generation_id,row_version=row_version+1,switched_at=clock_timestamp() WHERE singleton;
  UPDATE public.rag_cache_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
  INSERT INTO public.rag_generation_release_event(generation_id,event_kind,prior_generation_id,request_id)
  VALUES (p_generation_id,'promote',prior_generation,p_request_id);
  INSERT INTO public.rag_cache_invalidation_outbox(cache_epoch,event_kind,generation_id)
  SELECT epoch,'promote',p_generation_id FROM public.rag_cache_epoch WHERE singleton;
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_promote',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_rollback_generation(p_request_id text,p_target_generation text,p_expected_active text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE generation_source_epoch bigint; current_epoch bigint; prior_generation text; input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('generation_rollback', jsonb_build_object(
    'expected_active_generation_id',p_expected_active,'target_generation_id',p_target_generation
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'generation_rollback',input_digest) THEN RETURN; END IF;
  SELECT g.source_epoch INTO generation_source_epoch FROM public.rag_embedding_generation g
   WHERE id=p_target_generation AND state='deprecated' AND control_trust_state='controlled' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'rag_rollback_target_invalid' USING ERRCODE='check_violation'; END IF;
  SELECT epoch INTO current_epoch FROM public.rag_corpus_epoch WHERE singleton FOR SHARE;
  IF current_epoch<>generation_source_epoch THEN RAISE EXCEPTION 'rag_rollback_source_stale' USING ERRCODE='serialization_failure'; END IF;
  SELECT generation_id INTO prior_generation FROM public.rag_active_generation WHERE singleton FOR UPDATE;
  IF prior_generation IS DISTINCT FROM p_expected_active THEN RAISE EXCEPTION 'rag_rollback_cas_conflict' USING ERRCODE='serialization_failure'; END IF;
  UPDATE public.rag_embedding_generation SET state='deprecated' WHERE id=prior_generation AND state='active';
  UPDATE public.rag_embedding_generation SET state='active',activated_at=clock_timestamp() WHERE id=p_target_generation;
  UPDATE public.rag_active_generation SET generation_id=p_target_generation,row_version=row_version+1,switched_at=clock_timestamp() WHERE singleton;
  UPDATE public.rag_cache_epoch SET epoch=epoch+1,updated_at=clock_timestamp() WHERE singleton;
  INSERT INTO public.rag_generation_release_event(generation_id,event_kind,prior_generation_id,request_id)
  VALUES (p_target_generation,'rollback',prior_generation,p_request_id);
  INSERT INTO public.rag_cache_invalidation_outbox(cache_epoch,event_kind,generation_id)
  SELECT epoch,'rollback',p_target_generation FROM public.rag_cache_epoch WHERE singleton;
  PERFORM rag_control.rag_succeed_request(p_request_id,'generation_rollback',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_create_rebuild_run(p_request_id text,p_run_id text,p_generation_id text,p_deadline_at timestamptz,p_pause_budget_seconds integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE input_digest text;
BEGIN
  input_digest := rag_control.rag_control_input_digest('rebuild_create', jsonb_build_object(
    'deadline_at',p_deadline_at,'generation_id',p_generation_id,'pause_budget_seconds',p_pause_budget_seconds,'run_id',p_run_id
  ));
  IF NOT rag_control.rag_claim_request_input(p_request_id,'rebuild_create',input_digest) THEN RETURN; END IF;
  INSERT INTO public.rag_rebuild_run(id,generation_id,deadline_at,pause_budget_seconds,control_request_id)
  VALUES (p_run_id,p_generation_id,p_deadline_at,p_pause_budget_seconds,p_request_id) ON CONFLICT (generation_id) DO NOTHING;
  IF NOT EXISTS (SELECT 1 FROM public.rag_rebuild_run WHERE id=p_run_id AND generation_id=p_generation_id AND control_request_id=p_request_id) THEN
    RAISE EXCEPTION 'rag_rebuild_run_conflict' USING ERRCODE='unique_violation';
  END IF;
  PERFORM rag_control.rag_succeed_request(p_request_id,'rebuild_create',input_digest);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_claim_rebuild_run(p_run_id text,p_worker text,p_lease_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE claimed boolean;
BEGIN
  IF p_lease_seconds NOT BETWEEN 5 AND 3600 THEN RAISE EXCEPTION 'rag_rebuild_lease_invalid' USING ERRCODE='check_violation'; END IF;
  UPDATE public.rag_rebuild_run SET status='running',lease_owner=p_worker,lease_expires_at=clock_timestamp()+make_interval(secs=>p_lease_seconds),
    heartbeat_at=clock_timestamp(),row_version=row_version+1
   WHERE id=p_run_id AND status IN ('pending','running','orphaned') AND (lease_owner IS NULL OR lease_owner=p_worker OR lease_expires_at<clock_timestamp())
   RETURNING true INTO claimed;
  RETURN coalesce(claimed,false);
END;
$$;

CREATE OR REPLACE FUNCTION rag_control.rag_heartbeat_rebuild_run(p_run_id text,p_worker text,p_lease_seconds integer,p_cursor jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, rag_control, pg_temp AS $$
DECLARE ok boolean;
BEGIN
  IF p_lease_seconds NOT BETWEEN 5 AND 3600 THEN RAISE EXCEPTION 'rag_rebuild_lease_invalid' USING ERRCODE='check_violation'; END IF;
  UPDATE public.rag_rebuild_run SET lease_expires_at=clock_timestamp()+make_interval(secs=>p_lease_seconds),heartbeat_at=clock_timestamp(),
    cursor=coalesce(p_cursor,'{}'::jsonb),row_version=row_version+1
   WHERE id=p_run_id AND status='running' AND lease_owner=p_worker AND lease_expires_at>=clock_timestamp() RETURNING true INTO ok;
  RETURN coalesce(ok,false);
END;
$$;

ALTER FUNCTION rag_control.rag_record_shadow_evaluation(text,text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_gate_generation(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_advance_rollout(text,text,integer) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_promote_generation(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_rollback_generation(text,text,text) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_create_rebuild_run(text,text,text,timestamptz,integer) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_claim_rebuild_run(text,text,integer) OWNER TO rag_control_definer;
ALTER FUNCTION rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb) OWNER TO rag_control_definer;
GRANT EXECUTE ON FUNCTION rag_control.rag_record_shadow_evaluation(text,text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric),
  rag_control.rag_gate_generation(text,text,text), rag_control.rag_advance_rollout(text,text,integer),
  rag_control.rag_promote_generation(text,text,text), rag_control.rag_rollback_generation(text,text,text),
  rag_control.rag_create_rebuild_run(text,text,text,timestamptz,integer), rag_control.rag_claim_rebuild_run(text,text,integer),
  rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb) TO rag_control_executor;

-- PostgreSQL gives newly created functions EXECUTE to PUBLIC by default.
-- Close that default *after every reviewed function has been created*, then
-- restore the two explicit caller manifests.  A future capability must add a
-- signature here deliberately.  This migration also changes the execution
-- identity's default ACL below: reviewed migrations commonly CREATE under the
-- migration owner and then ALTER FUNCTION OWNER, so definer-only defaults are
-- not enough to prevent PUBLIC EXECUTE during that handoff.
-- This must be role-global rather than `IN SCHEMA`: PostgreSQL combines
-- schema-specific defaults with the role-global default, whose ordinary
-- function default grants EXECUTE to PUBLIC.
ALTER DEFAULT PRIVILEGES FOR ROLE rag_control_definer REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE rag_runtime_definer REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rag_control FROM PUBLIC, app_role, rag_control_login, rag_runtime_definer;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA rag_runtime FROM PUBLIC, rag_control_executor, rag_control_login, rag_control_definer;

GRANT EXECUTE ON FUNCTION rag_control.rag_control_begin_request(text,text,text,bigint),
  rag_control.rag_mark_request_dispatching(text,text,text), rag_control.rag_bind_generation_dispatch_request(text,text),
  rag_control.rag_bind_rebuild_dispatch_request(text,text), rag_control.rag_settle_request_dispatch(text,text,text),
  rag_control.rag_record_reconciliation_receipt(text,text,text,text,text,text),
  rag_control.rag_terminalize_unknown_generation(text,text,text), rag_control.rag_terminalize_unknown_rebuild_run(text,text,text),
  rag_control.rag_register_global_document(text,text,text),
  rag_control.rag_control_publish_global_document_version(text,text,text,text,text,text,jsonb,jsonb),
  rag_control.rag_register_embedding_recipe(text,text,text,text,text,text,integer,text,text,text,text,jsonb),
  rag_control.rag_register_release_policy(text,text,integer,integer,integer,integer),
  rag_control.rag_start_generation(text,text,text,text), rag_control.rag_prepare_generation_storage(text,text),
  rag_control.rag_insert_generation_vector(text,text,text,public.vector), rag_control.rag_validate_generation(text,text),
  rag_control.rag_record_shadow_evaluation(text,text,text,integer,numeric,numeric,numeric,numeric,numeric,numeric),
  rag_control.rag_gate_generation(text,text,text), rag_control.rag_advance_rollout(text,text,integer),
  rag_control.rag_promote_generation(text,text,text), rag_control.rag_rollback_generation(text,text,text),
  rag_control.rag_create_rebuild_run(text,text,text,timestamptz,integer), rag_control.rag_claim_rebuild_run(text,text,integer),
  rag_control.rag_heartbeat_rebuild_run(text,text,integer,jsonb) TO rag_control_executor;

GRANT EXECUTE ON FUNCTION rag_runtime.rag_register_private_document(text,text),
  rag_runtime.rag_publish_private_document_version(text,text,text,text,text,jsonb,jsonb),
  rag_runtime.rag_bind_query(text,text,integer), rag_runtime.rag_resolve_query_binding(text),
  rag_runtime.rag_search_bound(text,public.vector,integer), rag_runtime.rag_evidence_bound(text,text[],integer),
  rag_runtime.rag_record_citation(text,text,text), rag_runtime.rag_tombstone_private_document(text,text) TO app_role;
