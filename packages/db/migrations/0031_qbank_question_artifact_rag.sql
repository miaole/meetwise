-- 0031_qbank_question_artifact_rag.sql
--
-- P0: interview question is a business artifact, not a single embedding.  A published question is assembled from
-- immutable, governed chunks with explicit roles: prompt, scoring rubric, follow-ups, examples and anti-patterns.
-- Retrieval may hit any chunk, but the graph receives a bounded, source-rechecked question evidence package.  This
-- prevents a terse question title from being mistaken for its complete scoring standard or from leaking an orphaned
-- chunk into the interview prompt.

CREATE TABLE IF NOT EXISTS qbank_question (
  id            text PRIMARY KEY CHECK (id ~ '^[A-Za-z0-9:_-]{1,160}$'),
  artifact_hash text NOT NULL UNIQUE CHECK (artifact_hash ~ '^[0-9a-f]{64}$'),
  competency    text NOT NULL CHECK (char_length(competency) BETWEEN 1 AND 128),
  difficulty    smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  state         text NOT NULL CHECK (state IN ('draft','published','retired')),
  created_at    timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON qbank_question TO app_role;
ALTER TABLE qbank_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_question FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_question_read ON qbank_question;
CREATE POLICY p_qbank_question_read ON qbank_question FOR SELECT USING (qbank_is_curator());
DROP POLICY IF EXISTS p_qbank_question_write ON qbank_question;
CREATE POLICY p_qbank_question_write ON qbank_question FOR ALL
  USING (current_setting('app.principal_user', true)='__system_qbank__')
  WITH CHECK (current_setting('app.principal_user', true)='__system_qbank__');

CREATE TABLE IF NOT EXISTS qbank_question_chunk (
  question_id text NOT NULL REFERENCES qbank_question(id),
  ref_id      text NOT NULL REFERENCES qbank_chunk(ref_id),
  role        text NOT NULL CHECK (role IN ('prompt','rubric','follow_up','example','anti_pattern','source_note')),
  ordinal     smallint NOT NULL CHECK (ordinal >= 0 AND ordinal <= 99),
  required    boolean NOT NULL DEFAULT false,
  PRIMARY KEY (question_id, ref_id),
  UNIQUE (question_id, role, ordinal)
);
CREATE INDEX IF NOT EXISTS ix_qbank_question_chunk_ref ON qbank_question_chunk(ref_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON qbank_question_chunk TO app_role;
ALTER TABLE qbank_question_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_question_chunk FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS p_qbank_question_chunk_read ON qbank_question_chunk;
CREATE POLICY p_qbank_question_chunk_read ON qbank_question_chunk FOR SELECT USING (qbank_is_curator());
DROP POLICY IF EXISTS p_qbank_question_chunk_write ON qbank_question_chunk;
CREATE POLICY p_qbank_question_chunk_write ON qbank_question_chunk FOR ALL
  USING (current_setting('app.principal_user', true)='__system_qbank__')
  WITH CHECK (current_setting('app.principal_user', true)='__system_qbank__');

-- A mapping cannot attach an ungoverned/revoked chunk.  Question publication is separately checked in the retrieval
-- function, which also verifies the active generation and visibility immediately before returning prompt evidence.
CREATE OR REPLACE FUNCTION qbank_question_chunk_requires_visible_source() RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM qbank_chunk ch
      JOIN qbank_retrieval_candidate rc ON rc.ref_id=ch.ref_id AND rc.content_hash=ch.content_hash
     WHERE ch.ref_id=NEW.ref_id
  ) THEN
    RAISE EXCEPTION 'qbank_question_chunk 必须引用 approved/visible qbank_chunk' USING ERRCODE='check_violation';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION qbank_question_chunk_requires_visible_source() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS trg_qbank_question_chunk_requires_visible_source ON qbank_question_chunk;
CREATE TRIGGER trg_qbank_question_chunk_requires_visible_source
  BEFORE INSERT OR UPDATE ON qbank_question_chunk
  FOR EACH ROW EXECUTE FUNCTION qbank_question_chunk_requires_visible_source();

-- This is the only public read shape for question artifacts.  Its input is a rank-ordered list of already retrieved
-- chunk refs.  It expands to the complete published artifact only if prompt + rubric and every mapped chunk still
-- belong to the active visible generation.  Thus a source revocation racing cache/prompt construction yields no
-- partial question instead of a stale rubric or an invented score anchor.
CREATE OR REPLACE FUNCTION qbank_generation_question_evidence(
  p_generation text, p_hit_refs text[], p_chars integer
) RETURNS TABLE(question_id text, hit_rank integer, evidence jsonb)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, pg_temp
AS $$
  WITH hit AS (
    SELECT u.ref_id, u.ord::integer AS hit_rank
      FROM unnest(p_hit_refs) WITH ORDINALITY AS u(ref_id, ord)
  ), selected AS (
    SELECT qc.question_id, min(h.hit_rank) AS hit_rank
      FROM hit h
      JOIN qbank_question_chunk qc ON qc.ref_id=h.ref_id
      JOIN qbank_question q ON q.id=qc.question_id AND q.state='published'
     GROUP BY qc.question_id
  ), all_parts AS (
    SELECT s.question_id, s.hit_rank, qc.ref_id, qc.role, qc.ordinal, qc.required,
           left(ch.content, greatest(1, least(p_chars, 800))) AS excerpt
      FROM selected s
      JOIN qbank_question_chunk qc ON qc.question_id=s.question_id
      JOIN qbank_generation_chunk g ON g.generation_id=p_generation AND g.ref_id=qc.ref_id AND g.visible
      JOIN qbank_chunk ch ON ch.ref_id=qc.ref_id
      JOIN qbank_retrieval_candidate rc ON rc.ref_id=ch.ref_id AND rc.content_hash=ch.content_hash
  ), complete AS (
    SELECT question_id, min(hit_rank) AS hit_rank,
           count(*) FILTER (WHERE role='prompt') AS prompt_count,
           count(*) FILTER (WHERE role='rubric') AS rubric_count,
           count(*) FILTER (WHERE required) AS required_count,
           jsonb_agg(jsonb_build_object(
             'refId', ref_id, 'role', role, 'ordinal', ordinal, 'required', required, 'excerpt', excerpt
           ) ORDER BY CASE role
             WHEN 'prompt' THEN 0 WHEN 'rubric' THEN 1 WHEN 'follow_up' THEN 2
             WHEN 'example' THEN 3 WHEN 'anti_pattern' THEN 4 ELSE 5 END, ordinal, ref_id) AS evidence
      FROM all_parts
     GROUP BY question_id
  )
  SELECT question_id, hit_rank, evidence
    FROM complete
   WHERE prompt_count=1 AND rubric_count>=1 AND required_count >= 2
   ORDER BY hit_rank, question_id
$$;
REVOKE ALL ON FUNCTION qbank_generation_question_evidence(text,text[],integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION qbank_generation_question_evidence(text,text[],integer) TO app_role;
