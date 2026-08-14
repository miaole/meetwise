-- P0: 图 interrupt 的 question identity 必须在图外持久化；SSE 投影重放必须有业务去重键。
ALTER TABLE interview_event ADD COLUMN IF NOT EXISTS event_key text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_event_key
  ON interview_event(stream_key, event_key) WHERE event_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS interview_question (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  question_id text NOT NULL,
  state_version int NOT NULL CHECK (state_version > 0),
  turn int NOT NULL CHECK (turn >= 0),
  question text NOT NULL,
  competency text,
  qkind text,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('issued','queued','answered','cancelled')),
  answer_id text,
  answer_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  answered_at timestamptz,
  PRIMARY KEY (owner_user_id, interview_id, question_id),
  UNIQUE (owner_user_id, interview_id, state_version)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_interview_question_open
  ON interview_question(owner_user_id, interview_id) WHERE status IN ('issued','queued');
GRANT SELECT, INSERT, UPDATE ON interview_question TO app_role;
ALTER TABLE interview_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_question FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_owner ON interview_question;
CREATE POLICY p_owner ON interview_question
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
