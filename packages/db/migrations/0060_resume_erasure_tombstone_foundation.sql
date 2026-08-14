-- 0060_resume_erasure_tombstone_foundation.sql
--
-- This is deliberately a *hardening-only* migration.  It removes the legacy
-- app_role direct-delete escape hatch and reserves an irreversible tombstone
-- representation.  It does not expose a resume erasure endpoint or worker:
-- quiz/diagnosis/B-side snapshots and external receipts are not ready yet.

-- A runtime principal must never be able to erase resume evidence outside the
-- future request/target/receipt protocol.  RLS only scopes a DELETE; it does
-- not make the operation auditable, so remove the capability entirely.
REVOKE DELETE ON resume, resume_blob, resume_profile FROM app_role;

-- `content_sha` is an HMAC of plaintext.  A finished tombstone cannot retain
-- it: even an HMAC is a cross-upload correlation handle.  Replace the global
-- unique constraint with one that applies only to resumable active states;
-- an erased resume is never selected as a dedup/retry target.
ALTER TABLE resume ALTER COLUMN content_sha DROP NOT NULL;
ALTER TABLE resume DROP CONSTRAINT IF EXISTS uq_resume_content;
DROP INDEX IF EXISTS uq_resume_content_active;
CREATE UNIQUE INDEX uq_resume_content_active
  ON resume(owner_user_id, content_sha)
  WHERE content_sha IS NOT NULL
    AND status IN ('uploaded','ingesting','ingested','failed');

ALTER TABLE resume
  ADD COLUMN IF NOT EXISTS privacy_epoch bigint NOT NULL DEFAULT 1;

ALTER TABLE resume DROP CONSTRAINT IF EXISTS resume_status_check;
ALTER TABLE resume
  ADD CONSTRAINT resume_status_check
  CHECK (status IN ('uploaded','ingesting','ingested','failed','erasure_fenced','erased'));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='resume_privacy_epoch_chk') THEN
    ALTER TABLE resume
      ADD CONSTRAINT resume_privacy_epoch_chk CHECK (privacy_epoch >= 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='resume_erased_content_hmac_chk') THEN
    ALTER TABLE resume
      ADD CONSTRAINT resume_erased_content_hmac_chk
      CHECK ((status='erased') = (content_sha IS NULL));
  END IF;
END $$;

-- No app role currently has a reviewed resume-erasure request function.  Make
-- the new statuses impossible to forge until the next migration introduces a
-- request snapshot and a separate privacy worker capability.  Keeping this
-- as an explicit trigger (instead of assuming service code behaves) closes
-- direct SQL and future overlooked repository paths.
CREATE OR REPLACE FUNCTION enforce_resume_tombstone_foundation()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF TG_OP='INSERT' THEN
    IF NEW.status IN ('erasure_fenced','erased') OR NEW.privacy_epoch <> 1 THEN
      RAISE EXCEPTION 'resume_privacy_lifecycle_not_available' USING ERRCODE='P0001';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.privacy_epoch IS DISTINCT FROM OLD.privacy_epoch THEN
    RAISE EXCEPTION 'resume_privacy_epoch_immutable' USING ERRCODE='P0001';
  END IF;
  IF NEW.content_sha IS DISTINCT FROM OLD.content_sha THEN
    RAISE EXCEPTION 'resume_content_hmac_immutable' USING ERRCODE='P0001';
  END IF;
  IF OLD.status IN ('erasure_fenced','erased') OR NEW.status IN ('erasure_fenced','erased') THEN
    RAISE EXCEPTION 'resume_privacy_lifecycle_not_available' USING ERRCODE='P0001';
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION enforce_resume_tombstone_foundation() OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION enforce_resume_tombstone_foundation() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS resume_tombstone_foundation_write_guard ON resume;
CREATE TRIGGER resume_tombstone_foundation_write_guard
  BEFORE INSERT OR UPDATE ON resume
  FOR EACH ROW EXECUTE FUNCTION enforce_resume_tombstone_foundation();
