-- 0145_dead_table_jsonb_deprecate.sql — DBHY-1 死表退役 + jsonb 万能口袋 deprecated 标注 + sql/→migrations 承载声明头。
--
-- 【承载声明头（DBHY-1 · harness §3.0/§3.2）】packages/db/sql/ 兼容镜像的列+UNIQUE/PK 面由此前迁移路径全覆盖（0019 补齐后），
-- 其中 sql/20_resume_quiz.sql 全部内容（含 expires_at 锚点）由 0007_resume_quiz + 0135_resume_quiz_freshness_anchor 承载。
-- sql/ 目录本刀未删（D3=案B'：24 个 boot() 消费的 neg 族夹具迁移另刀；残面登记见 harness/exec 收据），
-- 但其身份自本迁移起降格为「neg 族测试夹具」，不再是 schema 真相源；drift:prove 门随本刀退役。
--
-- 【死表处置（D1/D2=案A/A'）】
--   app_setting：0002/0003「增量迁移示范」进产，业务代码零引用（仅 migrate.proof 冒烟）——示范改挂测试对象，表退役。
--   consumption_record：0001 出生、零生产写入（幂等真身=entitlement_consumption·uq 同形）；0143:68 曾为其 ALTER id SET DEFAULT
--   uuidv7()（dbid1 刀·历史原文不动），本 DROP 晚于该 ALTER，执行序合法。测试 count 断言改查 entitlement_consumption（同批 EXEC）。
--   让位序（协调方裁定）：本 DROP 先行——DBM3-1（0149）从其迁移面摘除 consumption_record 的 CHECK 项，不在将死表上叠新约束。
--
-- 【jsonb 万能口袋标注（D5）】四老列登记 DEPRECATED（只标注不拆列·拆表路线图另刀·GAP-DEBT-DB-HYGIENE 留卷）：
--   后继范式=子表（cf. interview_question @0021）；新消费者禁加（规范落 id-convention.md「jsonb 使用边界」）。
-- 非破坏边界：本迁移只有 DROP 两死表 + COMMENT；零 UPDATE/零 DELETE 行/零列类型变更/零触发器改动。

DROP TABLE IF EXISTS app_setting CASCADE;
DROP TABLE IF EXISTS consumption_record CASCADE;

-- 【生产路径缺口修复（本刀测试改打真表时暴露·亲核）】0143 为 55 表切 uuidv7() DEFAULT 后未显式授权：
-- 0040/0041 早已 REVOKE ALL ON ALL FUNCTIONS FROM PUBLIC（函数默认 ACL=owner-only·pg_proc.proacl={meetwise=X} 实证），
-- 而 reserveEntitlement（packages/db/src/commerce.ts:48·asPrincipal(app_role)）对 entitlement_consumption 无 id INSERT
-- → DEFAULT 求值即 permission denied for function uuidv7——生产预留路径自 0143 起断。补最小授权（仅 app_role·不动其他面）。
GRANT EXECUTE ON FUNCTION public.uuidv7() TO app_role;
GRANT EXECUTE ON FUNCTION public.uuidv7() TO online_judge_owner;   -- 0050 DEFINER 函数族（0143 把其表 DEFAULT 一并切了 uuidv7）

COMMENT ON COLUMN interview.questions IS
  'DEPRECATED (jsonb pocket): GAP-DEBT-DB-HYGIENE roadmap — production writer count = 0 (only reader interview.service.ts transcript path); successor pattern = child tables (cf. interview_question @0021); do not add new consumers';
COMMENT ON COLUMN assessment_report.dimensions IS
  'DEPRECATED (jsonb pocket): GAP-DEBT-DB-HYGIENE roadmap — structured entities in jsonb; successor pattern = child tables (dimension/score/gap/evidence columns); do not add new consumers';
COMMENT ON COLUMN learning_plan.items IS
  'DEPRECATED (jsonb pocket): GAP-DEBT-DB-HYGIENE roadmap — successor pattern = child tables; do not add new consumers';
COMMENT ON COLUMN career_path.milestones IS
  'DEPRECATED (jsonb pocket): GAP-DEBT-DB-HYGIENE roadmap — successor pattern = child tables; do not add new consumers';
