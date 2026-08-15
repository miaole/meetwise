-- 0052_resume_reference_runtime_enforcement.sql
--
-- 0049 introduced typed resume references but left two dangerous gaps:
-- a new start job could still be written with NULL resume_id, and a typed
-- value could point at a different same-owner interview.  This is only the
-- online expand step.  It deliberately does not rewrite a queue table or take
-- a long ACCESS EXCLUSIVE lock; 0053 classifies legacy rows in bounded batches
-- and 0054 installs the short-lock write gate after workers understand v50.

SET LOCAL lock_timeout = '2s';
SET LOCAL statement_timeout = '10s';

ALTER TABLE interview_job
  ADD COLUMN IF NOT EXISTS reference_schema_version smallint;
ALTER TABLE interview_job
  ALTER COLUMN reference_schema_version SET DEFAULT 50;

-- Existing rows remain NULL until 0053's bounded classification command has
-- processed them.  The worker treats NULL exactly like v49: fail closed, no
-- checkpoint enrollment, graph lease, decrypt, or model call.
