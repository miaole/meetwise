-- 0178_ag_e_report_dispatch_seq.sql
--
-- AG 修复轨刀 E（AG-03 报告重试真实化 + EG-A1 单调派发序号）的持久化面，expand-only 单列：
--   ai_report 补 `dispatch_seq` 列（int NOT NULL DEFAULT 0）——与 job 层 `attempts` 解耦的
--   **单调独立派发序号**（EG-A1 blocking 勘误的落点）。
--
-- 为什么必须与 attempts 解耦（EG-A1）：手动重试 requeueFailedReport 把 attempts 重置 0
-- （#229 D2 已决「全新自动重试预算」语义，保真不动）。若键取 n 自 attempts，手动重试后
-- claim 再自增会把 n 拉回 1 → 键 `:a1` 与上一轮同键同 digest → 0130 终态重放原样吞掉重试
-- （AG-03 换形式复现）。dispatch_seq 只在 claimReport 的 CAS UPDATE 同语句自增（与
-- attempts++ 同租约语义·FOR UPDATE SKIP LOCKED 下无并发双发），任何路径不复位
-- （含手动/批量/运营出口）→ 键空间单调不重访。
--
-- 消费面（AG-03 主修）：报告幂等键 `${interviewId}:report:a${dispatch_seq}`（键/revision 同源
-- 字符串，interview-service reportGenerator 的 businessRevision 随键同换，零额外接线）——
-- 每轮派发新键新 revision，0130 终态重放（cached/failed/unknown 皆 terminal）不再吞掉重试，
-- 重试=真发请求。上限仍为既有 MAX_REPORT_ATTEMPTS=3 预算轮语义（每轮内 a1,a2,a3 严格递增；
-- 手动重试开新预算轮序号继续 a4,a5…）。
--
-- 迁移号登记：实测主线 tip 迁移台账实占 max=0174（刀 B AG-06）；0175 已被刀 C 实占
-- （line/ag-c-requeue 0175_interview_job_next_attempt_at.sql·在飞未落主线），0176/0177
-- 留计费轨，本刀按协调方指定认领 0178（§0.3-3 claim 前实占复核·零硬编码本卷号）。
-- 与刀 C 0175 零表交集（彼动 interview_job·本刀动 ai_report）·零依赖·先后皆可。

-- IF NOT EXISTS：负测夹具（apps/api/test/_neg-harness sql/ 镜像引导）按清单重放本迁移，幂等形保
-- 「脏库重复整体加载确定性可重复」不变式（语义不变：DEFAULT 0 列，存在即无操作）。
ALTER TABLE ai_report ADD COLUMN IF NOT EXISTS dispatch_seq int NOT NULL DEFAULT 0;

COMMENT ON COLUMN ai_report.dispatch_seq IS
  'monotonic dispatch sequence (EG-A1): incremented in the claimReport CAS statement only; never reset by requeue (manual retry resets job-level attempts only). Report idempotency key = `${interviewId}:report:a${dispatch_seq}` (AG-03).';
