-- 0148_interview_composite_fk_batch1.sql
--
-- DBFK-1（GAP-DEBT-DB-NOFK）Batch 1 三表（ai_report / assessment_report /
-- question_feedback）+ Batch 1b 三表（learning_plan / career_path /
-- learning_progress · D2 同刀复核通过：三写点 interview.service.ts:822/:849/:904
-- 均在 interview 完成链内且 guardInterviewPrivacy 先行）复合 FK：
--   子 (interview_id, owner_user_id) → 父 interview (id, owner_user_id)
--   ON DELETE CASCADE（D5 铺轨语义，与 resume 侧 0001:190 一致）
-- 在线路径两段式（D4：PG 无 ADD CONSTRAINT … FOREIGN KEY … CONCURRENTLY，
-- 在线等价 = NOT VALID 短 ACCESS EXCLUSIVE 不扫存量 → VALIDATE 仅子表
-- SHARE UPDATE EXCLUSIVE 不阻塞读写）。NOT DEFERRABLE（D3：卫星永远后于父行存在）。
-- additive：零 UPDATE/DELETE/DROP/TRIGGER/POLICY；orphan-check-first 是 prove P1
-- 前置门（本文件不含 SELECT，保持语句白名单纯净）。

ALTER TABLE interview
  ADD CONSTRAINT uq_interview_id_owner UNIQUE USING INDEX uq_interview_id_owner;

ALTER TABLE ai_report
  ADD CONSTRAINT fk_ai_report_interview_owner FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID;
ALTER TABLE assessment_report
  ADD CONSTRAINT fk_assessment_report_interview_owner FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID;
ALTER TABLE question_feedback
  ADD CONSTRAINT fk_question_feedback_interview_owner FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID;
ALTER TABLE learning_plan
  ADD CONSTRAINT fk_learning_plan_interview_owner FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID;
ALTER TABLE career_path
  ADD CONSTRAINT fk_career_path_interview_owner FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID;
ALTER TABLE learning_progress
  ADD CONSTRAINT fk_learning_progress_interview_owner FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID;

ALTER TABLE ai_report VALIDATE CONSTRAINT fk_ai_report_interview_owner;
ALTER TABLE assessment_report VALIDATE CONSTRAINT fk_assessment_report_interview_owner;
ALTER TABLE question_feedback VALIDATE CONSTRAINT fk_question_feedback_interview_owner;
ALTER TABLE learning_plan VALIDATE CONSTRAINT fk_learning_plan_interview_owner;
ALTER TABLE career_path VALIDATE CONSTRAINT fk_career_path_interview_owner;
ALTER TABLE learning_progress VALIDATE CONSTRAINT fk_learning_progress_interview_owner;
