-- 0158_score_card_insert_guard.sql — G1 SCORE-S3 #43：score_card BEFORE INSERT 初始态白名单守门。
--
-- 审计（issues-master 更正版 #43）：状态转移触发器只挂 BEFORE UPDATE OF status（0100:421-422），
-- write_final / adjudicate 直插终态卡此前只靠函数体内白名单（0103:129-134 / 0109:455,457）约束——
-- definer 层任意新函数可直插 10 态 CHECK 枚举内的任意状态。
-- 本迁移把四处 INSERT 面的初始态并集（逐面亲证）：
--   ① scoring_record_score_card   → 'pending_evidence'（0100:869-876，:875）
--   ② scoring_supersede_score_card → 'pending_evidence'（0100:1006-1013，:1010）
--   ③ scoring_write_final_score_card → p_target_status ∈ {practice_eligible, b_review_eligible}
--     （0103:251-258，:257；函数体白名单 0103:129-134）
--   ④ scoring_adjudicate_score_card → v_status ∈ {review_required, practice_eligible}
--     （0109:470-478，:478；:455/:457 赋值面）
--   并集恰四值 {pending_evidence, review_required, practice_eligible, b_review_eligible}
-- 下沉为表级 BEFORE INSERT 守门：白名单外任意直插（含未来新 definer 函数）一律 23514 拒。
--
-- 形制照 0109:190-194 四件套同族（ALTER FUNCTION OWNER TO + REVOKE FROM PUBLIC,app_role
-- + DROP TRIGGER IF EXISTS + CREATE TRIGGER；命名入 *_insert_guard 家族，
-- 同 score_card_status_transition_guard 形）。评分语义零变：四合法初始态 INSERT 全通
-- （scor-parity proof 正测硬门经真实 writer 函数逐面行使；SECURITY DEFINER 函数同样触发本触发器）。
--
-- score_request 面不挂（rev2 D2 定谳）：唯一 INSERT 面 = 0100:634（status 硬编码 'pending' :636）
-- + 0100:141 五态 CHECK 已限；补挂 BEFORE INSERT 守门属无引用扩权（无第二 INSERT 面）。

CREATE OR REPLACE FUNCTION assert_score_card_insert_initial_status() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NEW.status NOT IN ('pending_evidence','review_required','practice_eligible','b_review_eligible') THEN
    RAISE EXCEPTION 'score_card_insert_initial_status' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
ALTER FUNCTION assert_score_card_insert_initial_status() OWNER TO scoring_definer_owner;
REVOKE ALL ON FUNCTION assert_score_card_insert_initial_status() FROM PUBLIC, app_role;
DROP TRIGGER IF EXISTS score_card_insert_guard ON score_card;
CREATE TRIGGER score_card_insert_guard
  BEFORE INSERT ON score_card FOR EACH ROW EXECUTE FUNCTION assert_score_card_insert_initial_status();
