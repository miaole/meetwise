-- 0069_qbank_legacy_integrity_quarantine.sql
--
-- 0068 closed new writes, but a trigger cannot inspect a row whose dangerous
-- UPDATE happened before the trigger existed.  Quarantine every approved
-- source whose reconstructible pool/chunk/generation chain cannot be proven
-- from the canonical UTF-8 SHA-256 prefix.  Never guess or repair content:
-- reject the whole source, append a no-body receipt, and let the existing
-- source visibility trigger hide retained generation rows atomically.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

CREATE TABLE IF NOT EXISTS qbank_integrity_quarantine (
  source_id          text PRIMARY KEY REFERENCES qbank_source(id) ON DELETE RESTRICT,
  prior_status       text NOT NULL CHECK (prior_status IN ('pending','approved','rejected')),
  reason_codes       text[] NOT NULL CHECK (cardinality(reason_codes) > 0),
  hash_scheme        text NOT NULL CHECK (hash_scheme IN (
    'sha256_utf8_prefix128_v1',
    'sha256_utf8_full256_v1',
    'sha256_utf8_unverified_v1'
  )),
  detected_at        timestamptz NOT NULL DEFAULT clock_timestamp()
);

-- A non-superuser migration owner is deliberately supported.  These tables
-- are normally FORCE RLS, so temporarily restore PostgreSQL's ordinary table
-- owner semantics inside this single migration transaction; if the process
-- crashes, the transaction rolls back and FORCE remains in force.  The final
-- statements below restore FORCE before the migration ledger is committed.
ALTER TABLE qbank_source NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_pool_entry NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_chunk NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_generation_chunk NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_corpus_epoch NO FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_cache_epoch NO FORCE ROW LEVEL SECURITY;

-- The visibility projection is invoked by the controlled source transition.
-- It must use the qbank control executor's explicit grants/policies in normal
-- operation, rather than silently depending on a superuser function owner.
CREATE OR REPLACE FUNCTION qbank_source_visible_epoch_sync() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY INVOKER
  SET search_path = public, pg_temp
AS $$
DECLARE was_visible boolean := false; now_visible boolean := false;
BEGIN
  IF TG_OP='UPDATE' THEN
    SELECT EXISTS(SELECT 1 FROM qbank_pool_entry WHERE source_id=OLD.id) AND OLD.status='approved' INTO was_visible;
    SELECT EXISTS(SELECT 1 FROM qbank_pool_entry WHERE source_id=NEW.id) AND NEW.status='approved' INTO now_visible;
    IF was_visible OR now_visible THEN
      UPDATE qbank_generation_chunk g SET visible=now_visible
       FROM qbank_pool_entry p WHERE p.source_id=NEW.id AND p.ref_id=g.ref_id;
      UPDATE qbank_corpus_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
      UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
    END IF;
  ELSIF TG_OP='DELETE' THEN
    SELECT EXISTS(SELECT 1 FROM qbank_pool_entry WHERE source_id=OLD.id) AND OLD.status='approved' INTO was_visible;
    IF was_visible THEN
      UPDATE qbank_corpus_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
      UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;
    END IF;
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_source_visible_epoch_sync() FROM PUBLIC, app_role;

-- The receipt is a stable, reason-coded audit fact.  It never stores the
-- unsafe body, provider text, or a rewritten "correct" hash.
WITH raw_violations AS (
  SELECT p.source_id, 'pool_hash_not_canonical'::text AS reason
    FROM qbank_pool_entry p
    JOIN qbank_source s ON s.id=p.source_id
   WHERE s.status='approved' AND p.content_hash !~ '^[0-9a-f]{32}([0-9a-f]{32})?$'
  UNION ALL
  SELECT p.source_id, 'pool_source_hash_mismatch'::text
    FROM qbank_pool_entry p
    JOIN qbank_source s ON s.id=p.source_id
   WHERE s.status='approved' AND p.content_hash IS DISTINCT FROM s.content_hash
  UNION ALL
  SELECT p.source_id, 'pool_without_matching_chunk'::text
    FROM qbank_pool_entry p
    JOIN qbank_source s ON s.id=p.source_id
    LEFT JOIN qbank_chunk ch
      ON ch.ref_id=p.ref_id
     AND ch.source_id=p.source_id
     AND ch.content_hash=p.content_hash
   WHERE s.status='approved' AND ch.ref_id IS NULL
  UNION ALL
  SELECT ch.source_id, 'chunk_without_matching_pool'::text
    FROM qbank_chunk ch
    JOIN qbank_source s ON s.id=ch.source_id
    LEFT JOIN qbank_pool_entry p
      ON p.ref_id=ch.ref_id
     AND p.source_id=ch.source_id
     AND p.content_hash=ch.content_hash
   WHERE s.status='approved' AND p.ref_id IS NULL
  UNION ALL
  SELECT ch.source_id, 'chunk_hash_not_canonical'::text
    FROM qbank_chunk ch
    JOIN qbank_source s ON s.id=ch.source_id
   WHERE s.status='approved' AND ch.content_hash !~ '^[0-9a-f]{32}([0-9a-f]{32})?$'
  UNION ALL
  SELECT ch.source_id, 'chunk_body_hash_mismatch'::text
    FROM qbank_chunk ch
    JOIN qbank_source s ON s.id=ch.source_id
   WHERE s.status='approved'
     AND ch.content_hash IS DISTINCT FROM left(encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex'), 32)
     AND ch.content_hash IS DISTINCT FROM encode(digest(convert_to(ch.content, 'UTF8'), 'sha256'), 'hex')
  UNION ALL
  SELECT g_source.source_id, 'generation_hash_mismatch'::text
    FROM qbank_generation_chunk g
    JOIN qbank_pool_entry g_source ON g_source.ref_id=g.ref_id
    JOIN qbank_source s ON s.id=g_source.source_id
   WHERE s.status='approved' AND g.content_hash IS DISTINCT FROM g_source.content_hash
), violations AS (
  SELECT source_id, array_agg(DISTINCT reason ORDER BY reason) AS reason_codes
    FROM raw_violations
   GROUP BY source_id
)
INSERT INTO qbank_integrity_quarantine(source_id, prior_status, reason_codes, hash_scheme)
SELECT v.source_id, s.status, v.reason_codes,
       CASE
         WHEN EXISTS (
           SELECT 1 FROM qbank_pool_entry p
            WHERE p.source_id=v.source_id AND p.content_hash ~ '^[0-9a-f]{64}$'
         ) THEN 'sha256_utf8_full256_v1'
         WHEN EXISTS (
           SELECT 1 FROM qbank_pool_entry p
            WHERE p.source_id=v.source_id AND p.content_hash ~ '^[0-9a-f]{32}$'
         ) THEN 'sha256_utf8_prefix128_v1'
         ELSE 'sha256_utf8_unverified_v1'
       END
  FROM violations v
  JOIN qbank_source s ON s.id=v.source_id
ON CONFLICT (source_id) DO NOTHING;

-- approved→rejected is the only terminal safety transition available in the
-- existing source state machine.  Its AFTER trigger marks all corresponding
-- retained-generation rows invisible and advances corpus/cache epochs.
UPDATE qbank_source source
   SET status='rejected', reviewed_at=clock_timestamp()
  FROM qbank_integrity_quarantine q
 WHERE source.id=q.source_id
   AND source.status='approved';

ALTER TABLE qbank_source FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_pool_entry FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_chunk FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_generation_chunk FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_corpus_epoch FORCE ROW LEVEL SECURITY;
ALTER TABLE qbank_cache_epoch FORCE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON qbank_cache_epoch TO qbank_control_executor;
DROP POLICY IF EXISTS p_qbank_cache_epoch_control ON qbank_cache_epoch;
CREATE POLICY p_qbank_cache_epoch_control ON qbank_cache_epoch FOR ALL TO qbank_control_executor
  USING (singleton) WITH CHECK (singleton);

-- Keep the request role away from both the raw source truth and the
-- quarantine ledger.  0067 has the equivalent raw-table boundary; repeat the
-- revocation here because this migration introduces a new sensitive relation.
REVOKE SELECT ON qbank_integrity_quarantine FROM PUBLIC, app_role;
GRANT SELECT ON qbank_integrity_quarantine TO qbank_control_executor;
ALTER TABLE qbank_integrity_quarantine ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_integrity_quarantine FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_integrity_quarantine_control ON qbank_integrity_quarantine;
CREATE POLICY p_qbank_integrity_quarantine_control ON qbank_integrity_quarantine
  FOR SELECT TO qbank_control_executor USING (true);

CREATE OR REPLACE FUNCTION qbank_integrity_quarantine_immutable()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION 'qbank_integrity_quarantine_immutable' USING ERRCODE='check_violation';
END;
$$;
REVOKE ALL ON FUNCTION qbank_integrity_quarantine_immutable() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_integrity_quarantine_immutable ON qbank_integrity_quarantine;
CREATE TRIGGER trg_qbank_integrity_quarantine_immutable
  BEFORE UPDATE OR DELETE ON qbank_integrity_quarantine
  FOR EACH ROW EXECUTE FUNCTION qbank_integrity_quarantine_immutable();
