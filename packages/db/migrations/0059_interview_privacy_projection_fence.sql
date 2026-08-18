-- 0059_interview_privacy_projection_fence.sql
--
-- 0058 fenced checkpoints and queue payloads, but legacy answer/report/
-- projection paths still had independent tables.  A controller check is not a
-- security boundary: a stale worker or a direct app_role query could otherwise
-- append a new event or regenerate a report after DELETE returned 202.
--
-- Keep the locator out of payload JSON.  Every interview-owned projection is
-- gated by the reviewed 0058 SECURITY DEFINER predicate.  RLS protects reads
-- and ordinary writes; BEFORE triggers protect writes even when a repository
-- forgets the predicate.  DELETE is deliberately not gated so a future
-- privacy purger can remove the already-fenced rows.

CREATE OR REPLACE FUNCTION enforce_interview_projection_privacy_active()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  target_interview text;
BEGIN
  -- A PL/pgSQL trigger function is compiled once but attached to relations
  -- with different column sets.  `NEW.stream_key` would therefore fail while
  -- compiling the same function for ai_report.  Resolve the allowlisted
  -- column name dynamically from the row instead of using relation-specific
  -- record fields.
  target_interview := to_jsonb(NEW) ->> TG_ARGV[0];
  IF target_interview IS NULL OR length(target_interview)=0 THEN
    RAISE EXCEPTION 'interview_privacy_projection_locator_invalid' USING ERRCODE='22023';
  END IF;
  PERFORM assert_interview_privacy_active(target_interview);
  RETURN NEW;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER FUNCTION enforce_interview_projection_privacy_active() OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION enforce_interview_projection_privacy_active() FROM PUBLIC, app_role;

-- Each policy remains owner-scoped and additionally rejects a thread that has
-- a privacy target.  `interview_privacy_active` takes the same advisory lock
-- as the deletion transaction, so an event/projection either commits before
-- the deletion transaction (and will later be purged) or is rejected after it.
DROP POLICY IF EXISTS p_owner ON interview_event;
CREATE POLICY p_owner ON interview_event FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(stream_key))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(stream_key));

DROP POLICY IF EXISTS p_owner ON ai_graph_run;
CREATE POLICY p_owner ON ai_graph_run FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(thread_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(thread_id));

DROP POLICY IF EXISTS p_owner ON ai_report;
CREATE POLICY p_owner ON ai_report FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP POLICY IF EXISTS p_owner ON assessment_report;
CREATE POLICY p_owner ON assessment_report FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP POLICY IF EXISTS p_owner ON learning_plan;
CREATE POLICY p_owner ON learning_plan FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP POLICY IF EXISTS p_owner ON learning_progress;
CREATE POLICY p_owner ON learning_progress FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP POLICY IF EXISTS p_owner ON career_path;
CREATE POLICY p_owner ON career_path FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP POLICY IF EXISTS p_owner ON question_feedback;
CREATE POLICY p_owner ON question_feedback FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP POLICY IF EXISTS p_owner ON interview_question;
CREATE POLICY p_owner ON interview_question FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP POLICY IF EXISTS p_owner ON interview_job;
CREATE POLICY p_owner ON interview_job FOR ALL TO app_role
  USING (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id))
  WITH CHECK (owner_user_id=current_setting('app.principal_user', true) AND interview_privacy_active(interview_id));

DROP TRIGGER IF EXISTS interview_event_privacy_projection_write_guard ON interview_event;
CREATE TRIGGER interview_event_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON interview_event
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('stream_key');

DROP TRIGGER IF EXISTS ai_graph_run_privacy_projection_write_guard ON ai_graph_run;
CREATE TRIGGER ai_graph_run_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON ai_graph_run
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('thread_id');

DROP TRIGGER IF EXISTS ai_report_privacy_projection_write_guard ON ai_report;
CREATE TRIGGER ai_report_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON ai_report
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('interview_id');

DROP TRIGGER IF EXISTS assessment_report_privacy_projection_write_guard ON assessment_report;
CREATE TRIGGER assessment_report_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON assessment_report
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('interview_id');

DROP TRIGGER IF EXISTS learning_plan_privacy_projection_write_guard ON learning_plan;
CREATE TRIGGER learning_plan_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON learning_plan
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('interview_id');

DROP TRIGGER IF EXISTS learning_progress_privacy_projection_write_guard ON learning_progress;
CREATE TRIGGER learning_progress_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('interview_id');

DROP TRIGGER IF EXISTS career_path_privacy_projection_write_guard ON career_path;
CREATE TRIGGER career_path_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON career_path
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('interview_id');

DROP TRIGGER IF EXISTS question_feedback_privacy_projection_write_guard ON question_feedback;
CREATE TRIGGER question_feedback_privacy_projection_write_guard
  BEFORE INSERT OR UPDATE ON question_feedback
  FOR EACH ROW EXECUTE FUNCTION enforce_interview_projection_privacy_active('interview_id');
