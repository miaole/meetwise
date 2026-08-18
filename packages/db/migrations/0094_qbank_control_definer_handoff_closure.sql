-- 0094_qbank_control_definer_handoff_closure.sql
--
-- RAG-FUNNEL-01 closes the §6 sealed-manifest handoff.  0087/0089 established
-- the ownership invariant for the generation/artifact/taxonomy guards, but a
-- set of §6.1-6.5 objects still had the migration login as owner and could
-- therefore escape the fixed qbank_control_definer FORCE-RLS shape.  This
-- migration deliberately does NOT create the role and does NOT ALTER OWNER:
-- both live in the deploy-time `provisionQbankControlDefiner`, exactly like
-- 0087/0089.  It repairs the only three remaining proconfig/ACL gaps so the
-- provisioner's owner transfer and the startup catalog gate can verify one
-- coherent closure instead of silently adopting a historical PUBLIC grant.
--
-- It also introduces `qbank_metadata_review_receipt`: the append-only domain
-- receipt for a reviewed chunk-serving metadata record (target chunk/source,
-- serving scope/competency/difficulty facets, review result, metadata hash,
-- reviewer, timestamp, and an explicit status enum — never boolean soup).

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- §A  search_path fixes (3 functions)
--
--   qbank_active_source_id(text)   0013 pinned only `public` (no pg_temp), so a
--     hostile temporary schema could shadow a builtin it relies on.
--   qbank_search_terms(text)       0029 defined with no SET, inheriting the
--     caller's search_path; it is a pure IMMUTABLE builtin helper and must pin
--     the same `pg_catalog, public, pg_temp` lookup path as qbank_metadata_hash.
--   qbank_source_guard_update()    0013 INVOKER trigger with no SET, again
--     inheriting a caller-controlled search_path.
ALTER FUNCTION qbank_active_source_id(text) SET search_path = public, pg_temp;
ALTER FUNCTION qbank_search_terms(text) SET search_path = pg_catalog, public, pg_temp;
ALTER FUNCTION qbank_source_guard_update() SET search_path = public, pg_temp;

-- §B  ACL fixes (2 functions)
--
--   0013 created both below with no REVOKE, so they still carry the pre-0073
--   PUBLIC EXECUTE function default.  A request runtime must never invoke the
--   dedupe reader (it returns an opaque id only for a known exact hash) nor the
--   source UPDATE guard directly; a raw PUBLIC EXECUTE would otherwise be a
--   second callable surface beside the reviewed bounded API.
REVOKE ALL ON FUNCTION qbank_active_source_id(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_active_source_id(text) TO app_role;
REVOKE ALL ON FUNCTION qbank_source_guard_update() FROM PUBLIC, app_role;

-- §C  view security_invoker pins (2 views)
--
--   Both are deliberately definer-semantics projections.  0016 declared
--   qbank_visible_ref WITH (security_invoker=false) explicitly; 0068 left
--   qbank_retrieval_candidate on the implicit default (NULL reloptions).  Pin
--   both to the explicit reloption so the startup gate rejects any future flip
--   to security_invoker=true, which would re-execute the view as the request
--   role and silently resurrect the raw-corpus read bypass 0067/0068 closed.
ALTER VIEW qbank_retrieval_candidate SET (security_invoker = false);
ALTER VIEW qbank_visible_ref SET (security_invoker = false);

-- §D  MetadataReviewReceipt domain object
--
--   A chunk-serving metadata review is a fact about one chunk (ref_id) inside
--   one source (source_id) labeled for one released serving leaf
--   (taxonomy_version, serving_scope_id).  The optional competency/difficulty
--   facets mirror qbank_question's own facet columns and are independently
--   nullable — a receipt may review the serving-scope facet without a
--   competency/difficulty facet.  `metadata_hash` must equal the canonical
--   qbank_metadata_hash of the reviewed serving tuple, so a receipt can never
--   record a facet/hash combination the taxonomy guard would reject.
--
--   `review_result` is the review outcome (approved/rejected); `status` is the
--   receipt lifecycle enum (recorded/voided) — two explicit enums rather than a
--   single mutable boolean flag.  The relation is FORCE RLS and write-restricted
--   to the control executor or the generation control definer, matching the
--   taxonomy relations it references.
CREATE TABLE IF NOT EXISTS qbank_metadata_review_receipt (
  receipt_id        text PRIMARY KEY CHECK (receipt_id ~ '^[A-Za-z0-9:_-]{1,160}$'),
  ref_id            text NOT NULL REFERENCES qbank_chunk(ref_id),
  source_id         text NOT NULL REFERENCES qbank_source(id),
  taxonomy_version  text NOT NULL,
  serving_scope_id  text NOT NULL,
  competency        text CHECK (competency IS NULL OR char_length(competency) BETWEEN 1 AND 128),
  difficulty        smallint CHECK (difficulty IS NULL OR difficulty BETWEEN 1 AND 5),
  annotation_source text NOT NULL CHECK (annotation_source IN ('curator_reviewed','seed_v1_reviewed')),
  metadata_hash     text NOT NULL CHECK (
    metadata_hash ~ '^[0-9a-f]{64}$'
    AND metadata_hash = qbank_metadata_hash(
      'qbank-chunk-scope:v1', taxonomy_version, serving_scope_id, annotation_source
    )
  ),
  review_result     text NOT NULL CHECK (review_result IN ('approved','rejected')),
  status            text NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded','voided')),
  reviewer          text NOT NULL CHECK (char_length(reviewer) BETWEEN 1 AND 128),
  reviewed_at       timestamptz NOT NULL DEFAULT clock_timestamp(),
  FOREIGN KEY (taxonomy_version, serving_scope_id)
    REFERENCES qbank_taxonomy_scope(taxonomy_version, scope_id)
);
CREATE INDEX IF NOT EXISTS ix_qbank_metadata_review_receipt_ref
  ON qbank_metadata_review_receipt(ref_id);

ALTER TABLE qbank_metadata_review_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_metadata_review_receipt FORCE ROW LEVEL SECURITY;
REVOKE ALL ON qbank_metadata_review_receipt FROM PUBLIC, app_role;
GRANT SELECT, INSERT ON qbank_metadata_review_receipt TO qbank_control_executor;

-- The control executor writes/reads receipts directly; the definer may read
-- (and, for a future projection, insert) under the same generation-control
-- identity.  A request runtime (app_role) has neither a table grant nor a
-- row predicate, so it can never see the reviewer identity or the review
-- outcome outside the reviewed bounded API.
DROP POLICY IF EXISTS p_qbank_metadata_review_receipt_read ON qbank_metadata_review_receipt;
CREATE POLICY p_qbank_metadata_review_receipt_read ON qbank_metadata_review_receipt FOR SELECT TO PUBLIC
  USING (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());
DROP POLICY IF EXISTS p_qbank_metadata_review_receipt_write ON qbank_metadata_review_receipt;
CREATE POLICY p_qbank_metadata_review_receipt_write ON qbank_metadata_review_receipt FOR INSERT TO PUBLIC
  WITH CHECK (current_user='qbank_control_executor' OR qbank_is_generation_control_definer());
