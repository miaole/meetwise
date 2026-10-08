-- 0147_interview_owner_unique_index.sql
-- @migration-mode concurrent-index
--
-- DBFK-1（GAP-DEBT-DB-NOFK）父侧唯一键：interview 建 UNIQUE(id, owner_user_id)，
-- 镜像 resume 模板 0001:180 的 uq_resume_id_owner。(id) 已是 PK，本组合在函数依赖
-- 上冗余，但复合 FK 的引用列必须有精确唯一约束（INCLUDE 列不算），0148 将以
-- UNIQUE USING INDEX 把本索引收编为约束。恰一条语句，合 runner
-- concurrentIndexStatement 正则门：事务外在线建索引（0055 先例）+ 独立短事务记账。

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_interview_id_owner
  ON interview (id, owner_user_id);
