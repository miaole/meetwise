-- 0045_checkpoint_thread_rls.sql
-- The vendor checkpointer tables identify rows only by thread_id. Bind each
-- thread to its interview owner once, then FORCE RLS on every underlying table
-- so a runtime app_role cannot read/write/delete another owner's graph state.

CREATE TABLE IF NOT EXISTS checkpoint_thread_enrollment (
  thread_id text PRIMARY KEY,
  owner_user_id text NOT NULL,
  enrolled_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE checkpoint_thread_enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_thread_enrollment FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS checkpoint_thread_enrollment_owner ON checkpoint_thread_enrollment;
CREATE POLICY checkpoint_thread_enrollment_owner ON checkpoint_thread_enrollment
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
GRANT SELECT, INSERT ON checkpoint_thread_enrollment TO app_role;

ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints FORCE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_blobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_blobs FORCE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_writes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_writes FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS checkpoints_owner ON checkpoints;
CREATE POLICY checkpoints_owner ON checkpoints
  FOR ALL TO app_role
  USING (EXISTS (
    SELECT 1 FROM checkpoint_thread_enrollment e
     WHERE e.thread_id=checkpoints.thread_id
       AND e.owner_user_id=current_setting('app.principal_user', true)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM checkpoint_thread_enrollment e
     WHERE e.thread_id=checkpoints.thread_id
       AND e.owner_user_id=current_setting('app.principal_user', true)
  ));

DROP POLICY IF EXISTS checkpoint_blobs_owner ON checkpoint_blobs;
CREATE POLICY checkpoint_blobs_owner ON checkpoint_blobs
  FOR ALL TO app_role
  USING (EXISTS (
    SELECT 1 FROM checkpoint_thread_enrollment e
     WHERE e.thread_id=checkpoint_blobs.thread_id
       AND e.owner_user_id=current_setting('app.principal_user', true)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM checkpoint_thread_enrollment e
     WHERE e.thread_id=checkpoint_blobs.thread_id
       AND e.owner_user_id=current_setting('app.principal_user', true)
  ));

DROP POLICY IF EXISTS checkpoint_writes_owner ON checkpoint_writes;
CREATE POLICY checkpoint_writes_owner ON checkpoint_writes
  FOR ALL TO app_role
  USING (EXISTS (
    SELECT 1 FROM checkpoint_thread_enrollment e
     WHERE e.thread_id=checkpoint_writes.thread_id
       AND e.owner_user_id=current_setting('app.principal_user', true)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM checkpoint_thread_enrollment e
     WHERE e.thread_id=checkpoint_writes.thread_id
       AND e.owner_user_id=current_setting('app.principal_user', true)
  ));

-- Runtime never calls PostgresSaver.setup(); migration bookkeeping is not a
-- data-plane capability and stays with the migration login.
REVOKE ALL ON checkpoint_migrations FROM app_role;
