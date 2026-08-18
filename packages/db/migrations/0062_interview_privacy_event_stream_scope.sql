-- 0062_interview_privacy_event_stream_scope.sql
--
-- `interview_event` is a shared durable transport for interview, quiz and
-- diagnosis SSE.  0059 correctly fenced interview streams but incorrectly
-- treated every stream key as an interview, which denied a legitimate quiz or
-- diagnosis terminal event.  Scope the privacy gate to the owning aggregate
-- without weakening cross-owner isolation.

GRANT SELECT ON resume_quiz, resume_diagnosis TO privacy_api_owner;

CREATE OR REPLACE FUNCTION interview_event_stream_privacy_active(
  target_owner text,
  target_stream text
) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR principal <> target_owner
     OR target_stream IS NULL OR length(target_stream)=0 THEN
    RETURN false;
  END IF;

  -- An existing interview stream is always subject to the deletion fence and
  -- must belong to the same owner.  Do this before quiz/diagnosis lookups so a
  -- user cannot use a colliding id to bypass an interview tombstone.
  IF EXISTS (SELECT 1 FROM interview i WHERE i.id=target_stream) THEN
    RETURN EXISTS (
      SELECT 1 FROM interview i
       WHERE i.id=target_stream AND i.owner_user_id=target_owner
    ) AND interview_privacy_active(target_stream);
  END IF;

  IF EXISTS (SELECT 1 FROM resume_quiz q WHERE q.id=target_stream) THEN
    RETURN EXISTS (
      SELECT 1 FROM resume_quiz q
       WHERE q.id=target_stream AND q.owner_user_id=target_owner
    );
  END IF;
  IF EXISTS (SELECT 1 FROM resume_diagnosis d WHERE d.id=target_stream) THEN
    RETURN EXISTS (
      SELECT 1 FROM resume_diagnosis d
       WHERE d.id=target_stream AND d.owner_user_id=target_owner
    );
  END IF;

  -- Legacy generic streams are not an interview deletion subject.  They keep
  -- their historical owner RLS semantics; new product flows use one of the
  -- three aggregates above.
  RETURN true;
END $$;


GRANT CREATE ON SCHEMA public TO privacy_api_owner;
ALTER FUNCTION interview_event_stream_privacy_active(text,text) OWNER TO privacy_api_owner;
REVOKE ALL ON FUNCTION interview_event_stream_privacy_active(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION interview_event_stream_privacy_active(text,text) TO app_role;

DROP POLICY IF EXISTS p_owner ON interview_event;
CREATE POLICY p_owner ON interview_event FOR ALL TO app_role
  USING (interview_event_stream_privacy_active(owner_user_id, stream_key))
  WITH CHECK (interview_event_stream_privacy_active(owner_user_id, stream_key));

CREATE OR REPLACE FUNCTION enforce_interview_projection_privacy_active()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE target_interview text;
BEGIN
  target_interview := to_jsonb(NEW) ->> TG_ARGV[0];
  IF target_interview IS NULL OR length(target_interview)=0 THEN
    RAISE EXCEPTION 'interview_privacy_projection_locator_invalid' USING ERRCODE='22023';
  END IF;
  IF TG_TABLE_NAME='interview_event' THEN
    IF NOT interview_event_stream_privacy_active(NEW.owner_user_id, target_interview) THEN
      RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
    END IF;
  ELSE
    PERFORM assert_interview_privacy_active(target_interview);
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION enforce_interview_projection_privacy_active() OWNER TO privacy_api_owner;
REVOKE CREATE ON SCHEMA public FROM privacy_api_owner;


REVOKE ALL ON FUNCTION enforce_interview_projection_privacy_active() FROM PUBLIC, app_role;
