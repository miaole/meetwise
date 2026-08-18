-- 0097_qbank_generation_serving_scope_projection.sql
--
-- RAG-FUNNEL-02A (data-plane projection, NOT query routing): the reviewed
-- serving scope recorded at ingestion (0086 `qbank_chunk_serving_scope`) must
-- flow into the immutable generation snapshot before any track-local retrieval
-- (04) can prove `wrong_track=0`.  Before this migration a raw cut could carry
-- two independently reviewed projections (e.g. `qshared:prompt` under both
-- `backend/general` and `backend/go`) but the generation stored exactly one row
-- per `ref_id`, so the serving dimension was silently dropped at build time.
--
-- This migration therefore makes `qbank_generation_chunk` a per-(ref, scope)
-- projection: one frozen embedding per reviewed serving leaf.  It changes the
-- primary key from `(generation_id, ref_id)` to
-- `(generation_id, ref_id, taxonomy_version, serving_scope_id)` and adds a
-- released-leaf foreign key to `qbank_taxonomy_scope`.
--
-- WHY retire-and-clear rather than backfill: existing generation rows have no
-- reviewed scope value, and manufacturing one by guessing a leaf for a mixed
-- document would recreate the exact "model-guessed label" hazard 0086 forbids.
-- Generation rows are derived, rebuildable data (their source of truth is the
-- untouched `qbank_chunk` + `qbank_chunk_serving_scope` pair), so the safe
-- upgrade retires every live generation and clears the derived rows; the next
-- `ensureActiveQbankGeneration` rebuilds the snapshot with one row per
-- reviewed (ref, scope).  `qbank_corpus_epoch` is deliberately NOT bumped: the
-- visible source corpus did not change.  Only `qbank_cache_epoch` is bumped,
-- because retiring the active generation invalidates every cached hit.
--
-- It deliberately does NOT change the legacy global retrieval functions
-- (ANN/lexical/evidence/question).  Those still return one row per matching
-- projection row, so a shared cut now appears once per leaf; the track-local
-- hard filter that de-duplicates per requested leaf is RAG-FUNNEL-04's job,
-- exactly as 0086's header documented for 02..04.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '15s';

-- The 0029 trigger rejects any DELETE against a non-`building` generation, so
-- it must be removed before the derived-row clear below and recreated afterwards
-- with the extended serving-scope immutability check.
DROP TRIGGER IF EXISTS trg_qbank_generation_chunk_only_building ON qbank_generation_chunk;

-- Terminal `failed` generations keep their audited failure reason; every live
-- or in-flight generation is retired so no active pointer references a
-- now-empty, pre-projection partition.  The singleton active pointer itself
-- stays (its FK target remains a valid, now-retired generation) and is
-- re-pointed by the next activation.
UPDATE qbank_vector_generation
   SET state='retired'
 WHERE state IN ('building','validated','active');

DELETE FROM qbank_generation_chunk;

-- Active pointer flipped => cached hits referencing the retired generation are
-- stale.  Source corpus epoch is left untouched.
UPDATE qbank_cache_epoch SET epoch=epoch+1, updated_at=clock_timestamp() WHERE singleton;

ALTER TABLE qbank_generation_chunk
  ADD COLUMN taxonomy_version text,
  ADD COLUMN serving_scope_id text;

-- Table is empty after the clear above, so NOT NULL needs no default.  A scope
-- is a projection identity facet, never an optional label.
ALTER TABLE qbank_generation_chunk
  ALTER COLUMN taxonomy_version SET NOT NULL,
  ALTER COLUMN serving_scope_id SET NOT NULL;

-- PK grows to the projection key.  A shared ref now legitimately has one row
-- per reviewed leaf instead of one row whose scope was chosen by input order.
ALTER TABLE qbank_generation_chunk DROP CONSTRAINT IF EXISTS qbank_generation_chunk_pkey;
ALTER TABLE qbank_generation_chunk
  ADD CONSTRAINT qbank_generation_chunk_pkey
  PRIMARY KEY (generation_id, ref_id, taxonomy_version, serving_scope_id);

-- Scope legality is enforced at the database boundary: the pair must name a
-- released taxonomy entry (the leaf check is already owned by 0086's guard on
-- `qbank_chunk_serving_scope`; this FK re-asserts the same released entry at
-- the generation row level without duplicating the leaf predicate).
ALTER TABLE qbank_generation_chunk
  ADD CONSTRAINT qbank_generation_chunk_metadata_shape_check CHECK (
    taxonomy_version ~ '^v[1-9][0-9]{0,15}$'
    AND serving_scope_id ~ '^[a-z][a-z0-9_]*(/[a-z][a-z0-9_]*){0,3}$'
  ),
  ADD CONSTRAINT qbank_generation_chunk_metadata_scope_fk
    FOREIGN KEY (taxonomy_version, serving_scope_id)
    REFERENCES qbank_taxonomy_scope(taxonomy_version, scope_id);

-- Recreate the building-only trigger with serving-scope immutability.  The
-- no-op UPDATE arm still permits the `visible` flip performed by source
-- revocation (`qbank_source_visible_epoch_sync`), while any change to the
-- projection key facets (ref/scope/version/hash) now raises exactly like a
-- content mutation would.
CREATE OR REPLACE FUNCTION qbank_generation_chunk_only_building() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
DECLARE s text; generation text;
BEGIN
  IF TG_OP='UPDATE'
     AND NEW.generation_id=OLD.generation_id AND NEW.ref_id=OLD.ref_id
     AND NEW.taxonomy_version=OLD.taxonomy_version AND NEW.serving_scope_id=OLD.serving_scope_id
     AND NEW.content_hash=OLD.content_hash AND NEW.created_at=OLD.created_at
     AND (NEW.embedding <=> OLD.embedding)=0 THEN
    RETURN NEW;
  END IF;
  IF TG_OP='DELETE' THEN generation := OLD.generation_id; ELSE generation := NEW.generation_id; END IF;
  SELECT state INTO s FROM qbank_vector_generation WHERE id=generation;
  IF s IS DISTINCT FROM 'building' THEN
    RAISE EXCEPTION 'qbank_generation_chunk 只能写入 building generation' USING ERRCODE='check_violation';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_generation_chunk_only_building() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_generation_chunk_only_building ON qbank_generation_chunk;
CREATE TRIGGER trg_qbank_generation_chunk_only_building
  BEFORE INSERT OR UPDATE OR DELETE ON qbank_generation_chunk
  FOR EACH ROW EXECUTE FUNCTION qbank_generation_chunk_only_building();
