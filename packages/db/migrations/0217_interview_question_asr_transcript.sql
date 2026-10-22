-- 已发出的面试题暂存成功转写原文，供随后的作答入队显式带上转写结果。
-- 列默认为空。取消题目，或答案哈希从有值变为空时，触发器把原文清空。
-- 不改既有写卡函数，不改列默认，不把触发器函数执行权交给应用角色。

ALTER TABLE interview_question
  ADD COLUMN IF NOT EXISTS asr_transcript text;

COMMENT ON COLUMN interview_question.asr_transcript IS
  '成功转写原文。只在当前 issued 题上暂存；作答入队取走后清空。取消或答案哈希被清除时一并清空。';

CREATE OR REPLACE FUNCTION clear_interview_question_asr_transcript()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  NEW.asr_transcript := NULL;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION clear_interview_question_asr_transcript() FROM PUBLIC;

DROP TRIGGER IF EXISTS interview_question_asr_transcript_clear ON interview_question;
CREATE TRIGGER interview_question_asr_transcript_clear
  BEFORE UPDATE ON interview_question
  FOR EACH ROW
  WHEN (
    (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
    OR (NEW.answer_hash IS NULL AND OLD.answer_hash IS NOT NULL)
  )
  EXECUTE FUNCTION clear_interview_question_asr_transcript();
