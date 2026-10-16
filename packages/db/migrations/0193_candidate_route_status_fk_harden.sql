-- 0193_candidate_route_status_fk_harden.sql — #151：0142 状态值域补全 + interview 侧复合 FK（0148 同口径）
--
-- @migration-mode multi-statement
--
-- #151 修法：①状态建模补失败/未决态（值域裁决=三值：现役 'interview_snapshotted'
-- + 预留 'route_undecided'（0142 头注「无决策/歧义 → begin 409 candidate_route_undecided」
-- 同族词汇）/ 'snapshot_failed'——应用零触，只为后续状态建模不再迁移）；
-- 约束换名重建形 = 熔单 ALTER（DROP 旧单值 CHECK + ADD 全值域 NOT VALID 同语句
-- 原子·无裸窗）+ VALIDATE 后行；②复合 FK 与 0148 同口径（NOT VALID→VALIDATE 分
-- 事务·引用列=父侧复合唯一键在位亲证：interview(id, owner_user_id)=0147
-- uq_interview_id_owner）：
--   decision(interview_id, owner_user_id)     → interview (id, owner_user_id)
--   snapshot(interview_id, candidate_user_id) → interview (id, owner_user_id)
--     （candidate_user_id=候选人本人=interview.owner 语义·0142 policy 谓词同源）
-- 【resume 侧 FK 机制披露（裁决⑤引用列亲证结果·如实登记）】resume.id 为 uuid、
-- 0142 decision/snapshot.resume_id 为 text（0142 建表仅 length CHECK——跨型断层
-- 即其结构根因），text→uuid 无 FK 可建形；不走 ALTER COLUMN TYPE（非 additive+
-- 应用写面触险=越界）。resume 侧 FK 缓建呈报归后继处置，本迁移不建。
-- 前置孤儿检测（fail-loud 沿 0149 首语句形·不洗存量·interview 侧两引用面）。
-- 7 语句 = 1 DO 块 + 1 熔单 ALTER（snapshot status 换名重建）+ 2 ADD FK NOT VALID
--        + 1 VALIDATE status + 2 VALIDATE FK。

DO $route_orphan_check$
DECLARE
  v_decision_interview integer;
  v_snapshot_interview integer;
BEGIN
  SELECT count(*) INTO v_decision_interview FROM candidate_profile_route_decision ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
   WHERE i.id IS NULL;
  SELECT count(*) INTO v_snapshot_interview FROM candidate_profile_route_snapshot ch
    LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.candidate_user_id
   WHERE i.id IS NULL;
  IF v_decision_interview + v_snapshot_interview > 0 THEN
    RAISE EXCEPTION 'route_orphan_rows: decision.interview=%, snapshot.interview=% — 先对账清孤儿，不洗存量数据',
      v_decision_interview, v_snapshot_interview;
  END IF;
END
$route_orphan_check$;

ALTER TABLE candidate_profile_route_snapshot
  DROP CONSTRAINT IF EXISTS ck_candidate_profile_route_snapshot_status,
  ADD CONSTRAINT ck_candidate_profile_route_snapshot_status
  CHECK (status IN ('interview_snapshotted','route_undecided','snapshot_failed')) NOT VALID;

ALTER TABLE candidate_profile_route_decision
  ADD CONSTRAINT fk_cpr_decision_interview FOREIGN KEY (interview_id, owner_user_id)
  REFERENCES interview (id, owner_user_id) NOT VALID;
ALTER TABLE candidate_profile_route_snapshot
  ADD CONSTRAINT fk_cpr_snapshot_interview FOREIGN KEY (interview_id, candidate_user_id)
  REFERENCES interview (id, owner_user_id) NOT VALID;

ALTER TABLE candidate_profile_route_snapshot VALIDATE CONSTRAINT ck_candidate_profile_route_snapshot_status;
ALTER TABLE candidate_profile_route_decision VALIDATE CONSTRAINT fk_cpr_decision_interview;
ALTER TABLE candidate_profile_route_snapshot VALIDATE CONSTRAINT fk_cpr_snapshot_interview;
