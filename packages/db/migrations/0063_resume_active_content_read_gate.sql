-- 0063_resume_active_content_read_gate.sql
--
-- 0060 reserves `erasure_fenced` / `erased` but deliberately does not expose
-- a resume-erasure request.  Owner-only RLS on blob/profile would still let a
-- stale repository path read sensitive content after a future tombstone is
-- committed.  Reads therefore require both the normal tenant principal and
-- an actively ingested parent resume.  Writes needed by ingestion remain
-- narrow staging operations; no app-role DELETE capability is reintroduced.

DROP POLICY IF EXISTS p_owner ON resume_blob;
DROP POLICY IF EXISTS p_resume_blob_active_read ON resume_blob;
DROP POLICY IF EXISTS p_resume_blob_owner_insert ON resume_blob;
DROP POLICY IF EXISTS p_resume_blob_active_update ON resume_blob;

CREATE POLICY p_resume_blob_active_read ON resume_blob
  FOR SELECT TO app_role
  USING (
    owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (
      SELECT 1 FROM resume r
       WHERE r.id=resume_blob.resume_id
         AND r.owner_user_id=resume_blob.owner_user_id
         AND r.status='ingested'
    )
  );

-- Blob creation happens before ingestion reaches `ingested`, so its INSERT
-- policy cannot use the read predicate.  The composite foreign key still
-- proves owner alignment; this policy supplies the RLS tenant boundary.
CREATE POLICY p_resume_blob_owner_insert ON resume_blob
  FOR INSERT TO app_role
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

CREATE POLICY p_resume_blob_active_update ON resume_blob
  FOR UPDATE TO app_role
  USING (
    owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (
      SELECT 1 FROM resume r
       WHERE r.id=resume_blob.resume_id
         AND r.owner_user_id=resume_blob.owner_user_id
         AND r.status='ingested'
    )
  )
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

DROP POLICY IF EXISTS p_owner ON resume_profile;
DROP POLICY IF EXISTS p_resume_profile_active_read ON resume_profile;
DROP POLICY IF EXISTS p_resume_profile_owner_insert ON resume_profile;
DROP POLICY IF EXISTS p_resume_profile_active_update ON resume_profile;

CREATE POLICY p_resume_profile_active_read ON resume_profile
  FOR SELECT TO app_role
  USING (
    owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (
      SELECT 1 FROM resume r
       WHERE r.id=resume_profile.resume_id
         AND r.owner_user_id=resume_profile.owner_user_id
         AND r.status='ingested'
    )
  );

-- The profile is inserted in the same ingestion transaction immediately
-- before `ingesting -> ingested`, hence INSERT is tenant-scoped but not yet
-- active-state-scoped.  No profile DELETE is granted to app_role.
CREATE POLICY p_resume_profile_owner_insert ON resume_profile
  FOR INSERT TO app_role
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));

CREATE POLICY p_resume_profile_active_update ON resume_profile
  FOR UPDATE TO app_role
  USING (
    owner_user_id=current_setting('app.principal_user', true)
    AND EXISTS (
      SELECT 1 FROM resume r
       WHERE r.id=resume_profile.resume_id
         AND r.owner_user_id=resume_profile.owner_user_id
         AND r.status='ingested'
    )
  )
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true));
