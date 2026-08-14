-- 0068_qbank_content_fact_immutability.sql
--
-- qbank_source/pool/chunk is the reconstructible corpus truth.  0065 replaced
-- the guard functions but left the original INSERT-only triggers in place;
-- the control executor could therefore UPDATE an approved pool/chunk and
-- silently make a published generation's evidence text diverge from its
-- vector/hash.  This migration makes the corpus facts append-only and checks
-- the body hash inside PostgreSQL, not only in TypeScript.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';

-- Versioned DDL must also run under a non-superuser table owner.  These
-- relations are FORCE RLS in normal operation; table-owner semantics are
-- restored only inside this one transaction so the migration can replace the
-- protected view/trigger definitions.  A crash rolls the setting back.
ALTER TABLE qbank_curator NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_source NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_pool_entry NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_chunk NO FORCE ROW LEVEL SECURITY;

-- The legacy qbank content key is intentionally specified here rather than
-- pretending it is a full SHA-256 value: SHA-256(UTF-8(content))[:32].  New
-- writes must use this canonical lower-case 128-bit prefix.  A future full
-- digest migration needs a new hash scheme/ref/source rather than rewriting
-- historical facts in place.
CREATE OR REPLACE FUNCTION qbank_pool_requires_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  source_hash text;
  source_status text;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'qbank_pool_entry_immutable' USING ERRCODE='check_violation';
  END IF;

  SELECT content_hash, status INTO source_hash, source_status
    FROM qbank_source
   WHERE id=NEW.source_id;
  IF source_status IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'qbank_pool_source_not_approved' USING ERRCODE='check_violation';
  END IF;
  IF NEW.content_hash !~ '^[0-9a-f]{32}$'
     OR source_hash IS DISTINCT FROM NEW.content_hash THEN
    RAISE EXCEPTION 'qbank_pool_source_content_hash_mismatch' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_pool_requires_approved() FROM PUBLIC, app_role;

CREATE OR REPLACE FUNCTION qbank_chunk_requires_approved_pool()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  expected_hash text;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'qbank_chunk_immutable' USING ERRCODE='check_violation';
  END IF;

  expected_hash := left(encode(digest(convert_to(NEW.content, 'UTF8'), 'sha256'), 'hex'), 32);
  IF NEW.content_hash IS DISTINCT FROM expected_hash THEN
    RAISE EXCEPTION 'qbank_chunk_content_hash_mismatch' USING ERRCODE='check_violation';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM qbank_pool_entry p
      JOIN qbank_source s ON s.id=p.source_id
     WHERE p.ref_id=NEW.ref_id
       AND p.source_id=NEW.source_id
       AND p.content_hash=NEW.content_hash
       AND s.content_hash=NEW.content_hash
       AND s.status='approved'
  ) THEN
    RAISE EXCEPTION 'qbank_chunk_requires_matching_approved_pool_source' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_chunk_requires_approved_pool() FROM PUBLIC, app_role;

-- Rebuild the old INSERT-only hooks.  A SECURITY DEFINER trigger remains a
-- second line of defense if an owner-like migration connection bypasses the
-- executor's ordinary table grants.
DROP TRIGGER IF EXISTS trg_qpool_approved ON qbank_pool_entry;
CREATE TRIGGER trg_qpool_approved
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_pool_entry
  FOR EACH ROW EXECUTE FUNCTION qbank_pool_requires_approved();

DROP TRIGGER IF EXISTS trg_qbank_chunk_requires_approved_pool ON qbank_chunk;
CREATE TRIGGER trg_qbank_chunk_requires_approved_pool
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_chunk
  FOR EACH ROW EXECUTE FUNCTION qbank_chunk_requires_approved_pool();

-- A trigger can only protect rows written after this migration.  The
-- data-plane must therefore become fail-closed in the *same* migration: an
-- old row whose content was mutated before 0068 is never eligible for ANN,
-- lexical search or evidence while a later migration performs the audited
-- source-level quarantine.  Historic full SHA-256 values remain readable if
-- they exactly match the current UTF-8 bytes; new writes above are still
-- intentionally restricted to the canonical 128-bit prefix.
CREATE OR REPLACE VIEW qbank_retrieval_candidate AS
  SELECT p.ref_id, p.source_id, p.content_hash
    FROM qbank_pool_entry p
    JOIN qbank_source s ON s.id=p.source_id
    JOIN qbank_chunk ch
      ON ch.ref_id=p.ref_id
     AND ch.source_id=p.source_id
     AND ch.content_hash=p.content_hash
   WHERE s.status='approved'
     AND s.content_hash=p.content_hash
     AND (
       p.content_hash=left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
       OR p.content_hash=encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex')
     );

ALTER TABLE qbank_curator FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_source FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_pool_entry FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_chunk FORCE ROW LEVEL SECURITY;

-- `qbank_retrieval_candidate` is deliberately a normal security-definer view:
-- request identities receive only the downstream bounded functions, while the
-- view applies this structural eligibility predicate.  FORCE RLS also applies
-- to a view owner, so grant that owner this exact, read-only projection and
-- nothing else.  PostgreSQL evaluates FORCE RLS in a SECURITY DEFINER call as
-- the request role for this nested view, so `app_role` is also permitted by
-- the *row* predicate.  It still has no SELECT grant on any raw qbank table or
-- on this view (0067 revoked both); the only executable callers are the
-- bounded retrieval functions.  The predicate additionally names the owner
-- of *this* view dynamically so a non-superuser migration owner is supported
-- without a hard-coded login name.
DROP POLICY IF EXISTS p_qbank_source_candidate_view ON qbank_source;
CREATE POLICY p_qbank_source_candidate_view ON qbank_source FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user = (SELECT pg_get_userbyid(relowner)
                      FROM pg_class
                     WHERE oid='qbank_retrieval_candidate'::regclass)
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );
DROP POLICY IF EXISTS p_qbank_pool_candidate_view ON qbank_pool_entry;
CREATE POLICY p_qbank_pool_candidate_view ON qbank_pool_entry FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user = (SELECT pg_get_userbyid(relowner)
                      FROM pg_class
                     WHERE oid='qbank_retrieval_candidate'::regclass)
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );
DROP POLICY IF EXISTS p_qbank_chunk_candidate_view ON qbank_chunk;
CREATE POLICY p_qbank_chunk_candidate_view ON qbank_chunk FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user = (SELECT pg_get_userbyid(relowner)
                      FROM pg_class
                     WHERE oid='qbank_retrieval_candidate'::regclass)
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );

-- The bounded retrieval functions also read the active generation's vector
-- rows before intersecting them with the candidate view.  FORCE RLS applies
-- even when those functions are owned by a non-superuser migration role.
-- `app_role` has no SELECT grant on qbank_generation_chunk after 0067, so this
-- policy never grants raw vectors to a request; it only keeps the already
-- bounded SECURITY DEFINER search/evidence API operable.  The active-pointer,
-- `visible`, candidate-hash and complete-artifact predicates remain inside
-- those functions rather than being delegated to this row policy.
DROP POLICY IF EXISTS p_qbank_generation_candidate_reader ON qbank_generation_chunk;
CREATE POLICY p_qbank_generation_candidate_reader ON qbank_generation_chunk FOR SELECT TO PUBLIC
  USING (
    current_user = 'app_role'
    OR current_user IN (
      SELECT pg_get_userbyid(proowner) FROM pg_proc WHERE oid IN (
        'qbank_generation_ann_search(text,vector,integer)'::regprocedure,
        'qbank_generation_lexical_search(text,text,integer)'::regprocedure,
        'qbank_generation_distances(text,vector,text[])'::regprocedure,
        'qbank_generation_evidence(text,text[],integer)'::regprocedure,
        'qbank_generation_question_evidence(text,text[],integer)'::regprocedure
      )
    )
  );

-- The control executor still needs UPDATE on qbank_source to perform the
-- audited pending→approved→rejected state transition.  It never needs to
-- mutate or delete corpus facts after insertion.
REVOKE UPDATE, DELETE ON qbank_pool_entry, qbank_chunk FROM qbank_control_executor;
