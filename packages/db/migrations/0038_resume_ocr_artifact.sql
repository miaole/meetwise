-- 0038_resume_ocr_artifact.sql
--
-- OCR success is sensitive and cannot be replayed from ai_invocation_trace.
-- Keep the validated text only as a short-lived pgcrypto-encrypted recovery
-- artifact. It is committed atomically with the durable model success marker,
-- then deleted atomically with resume ingestion + entitlement confirmation.

CREATE TABLE IF NOT EXISTS resume_ocr_artifact (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 256),
  ciphertext bytea NOT NULL,
  key_version int NOT NULL CHECK (key_version > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, idempotency_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON resume_ocr_artifact TO app_role;
ALTER TABLE resume_ocr_artifact ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_ocr_artifact FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_resume_ocr_artifact_owner ON resume_ocr_artifact;
CREATE POLICY p_resume_ocr_artifact_owner ON resume_ocr_artifact
  USING (owner_user_id=current_setting('app.principal_user',true))
  WITH CHECK (owner_user_id=current_setting('app.principal_user',true));
