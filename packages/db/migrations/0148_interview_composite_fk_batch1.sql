-- 0148_interview_composite_fk_batch1.sql
--
-- @migration-mode multi-statement
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
-- additive：零 UPDATE/DELETE/DROP/TRIGGER/POLICY；orphan-check-first 由首语句
-- DO 块承载（#134 修法「发布前跑孤儿检测」进迁移本体：六子表孤儿计数非 0 即
-- RAISE EXCEPTION fail-loud，运行时红即拒跑；沿 0149:12-32「先检测后约束」形）。
--
-- 重制注记（#134/#115 遗留锁面清偿）：原形 13 语句落 runner 默认 transactional
-- 臂 = 全文件单事务，NOT VALID+VALIDATE 锁持有至提交且受超时封顶，有孤儿/大表
-- 时整个迁移回滚致部署失败。重制为 multi-statement 逐步记账形：14 语句（1 DO 块
-- 孤儿检测 + 1 UNIQUE USING INDEX + 6 ADD FK NOT VALID + 6 VALIDATE）经
-- splitTopLevelStatements 各自独立短事务 + 逐步记账旁表（断点续跑），VALIDATE 不
-- 再与 NOT VALID 同事务持锁；语句级 lock/statement_timeout 由运行器语句事务承载。
-- checksum 变更 = 重制预期形：已应用环境对账红属预期，处置 = 隔离库重建；
-- releaseEvidence=false，零生产库在案。

DO $fk_orphan_check$
DECLARE
  v_ai_report integer;
  v_assessment_report integer;
  v_question_feedback integer;
  v_learning_plan integer;
  v_career_path integer;
  v_learning_progress integer;
BEGIN
  SELECT count(*) INTO v_ai_report FROM ai_report ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
   WHERE ch.interview_id IS NOT NULL AND i.id IS NULL;
  SELECT count(*) INTO v_assessment_report FROM assessment_report ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
   WHERE ch.interview_id IS NOT NULL AND i.id IS NULL;
  SELECT count(*) INTO v_question_feedback FROM question_feedback ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
   WHERE ch.interview_id IS NOT NULL AND i.id IS NULL;
  SELECT count(*) INTO v_learning_plan FROM learning_plan ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
   WHERE ch.interview_id IS NOT NULL AND i.id IS NULL;
  SELECT count(*) INTO v_career_path FROM career_path ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
   WHERE ch.interview_id IS NOT NULL AND i.id IS NULL;
  SELECT count(*) INTO v_learning_progress FROM learning_progress ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
   WHERE ch.interview_id IS NOT NULL AND i.id IS NULL;
  IF v_ai_report + v_assessment_report + v_question_feedback
     + v_learning_plan + v_career_path + v_learning_progress > 0 THEN
    RAISE EXCEPTION 'fk_orphan_rows: ai_report=%, assessment_report=%, question_feedback=%, learning_plan=%, career_path=%, learning_progress=% — 发布前先清孤儿，不洗存量数据',
      v_ai_report, v_assessment_report, v_question_feedback,
      v_learning_plan, v_career_path, v_learning_progress;
  END IF;
END
$fk_orphan_check$;

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
