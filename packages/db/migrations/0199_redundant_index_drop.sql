-- 0199_redundant_index_drop.sql — #122 半 2：冗余索引 DROP（案a·非并发·锁窗评估在案）
--
-- executionMode = transactional（默认·恰 2 语句）
--
-- #122 修法半 2（DROP 形裁决=案a 非并发 DROP INDEX·transactional 迁移）：
--   ix_user_email（09_auth）冗余于 user_account.email 列 UNIQUE 约束背衬索引
--   （0001 email text NOT NULL UNIQUE）——同列双 btree 纯冗余；
--   ix_qfb_rating（0019:28）全仓 rg 零查询引用（执行前置硬门实测通过）。
-- 锁窗评估（如实登记·裁决行使依据）：DROP INDEX（非 CONCURRENTLY）取 ACCESS
-- EXCLUSIVE 锁但为元数据级操作不扫堆表，持锁时长毫秒级；两表行数量级=设计期
-- 小表（user_account=账户数、question_feedback=反馈数），非并发 DROP 锁窗风险
-- 可承受。runner 两现成模式均不能承载 DROP INDEX CONCURRENTLY（concurrent-index
-- 解析器仅受 CREATE INDEX 形·multi-statement 逐语句 BEGIN/COMMIT 包裹下
-- CONCURRENTLY 禁止事务块内运行——卷内披露在案），案b 解析器扩形须双审明示
-- 未行使，故行案a。
-- drift 面：schema-drift-check 对账范围=列+UNIQUE/PK 约束（不含普通索引）——
-- packages/db/sql/ fixture 零改（触面清单外·出入如实登记交付报告）。

DROP INDEX IF EXISTS ix_user_email;
DROP INDEX IF EXISTS ix_qfb_rating;
