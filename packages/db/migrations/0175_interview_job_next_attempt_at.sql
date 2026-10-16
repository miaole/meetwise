-- 0175_interview_job_next_attempt_at.sql
-- AG-C-REQUEUE（AG 修复轨刀 C · AG-04 consumer 瞬时错误分类 requeue + #4 next_attempt_at 退避 + EG-A2 queued 超限终态）。
-- REQUEST：ai-docs/delivery/harness/ag-c-requeue-REQUEST.md rev2（pre-exec 双审 BOTH PASS + 协调方常设 loop 授权）。
-- 编号=0175（rev2 E1 协调方裁定：billing 0170-0173 / 刀 B 0174 / 刀 C 0175）。
-- #4 兑现：interview_job 增退避列——语义沿 ai_report 范本（0001:231「退避：failed 后到此刻才允许重排」）
--   → 本表=requeue 后到此刻才允许重领（防瞬时故障 5s 消费拍内烧光 attempts，EXPERT-REVIEWS §二-2 :17 热循环勘误面）。
-- 写入面：requeueInterviewJob 置 queued 时写 now()+2^attempts 秒封顶 300（report.ts:53 范本逐字形·裁决项③按卷推荐零新参数面）；
-- 读取面：claimNextInterviewJob queued 臂加时闸 (next_attempt_at IS NULL OR next_attempt_at<=now())（report.ts:85 时闸形）。
-- NULL=无退避=立即可领：存量行/新入队行零行为变化（无 NOT NULL 无缺省，expand-only 幂等重放零 diff）。
-- 索引 EXEC 定夺：**不加**。claim 走既有 ix_ijob_claim(owner_user_id,status,seq,created_at) 前缀定位 queued 行后，
-- next_attempt_at 仅作索引后残余行过滤（per-owner inflight 帽极小，queued/owner 行数少）；报告范本侧亦无该列索引
-- （ix_report_claimable 仅 owner_user_id+status，0001:239）——同形不加，预防性索引归后继刀面。
-- 历史迁移 0001-0169 零字节改 + sql/ 影子面（05_interview_jobs.sql）零改（冻结自证）——本文件为唯一新迁移。

ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz;  -- 退避：requeue 后到此刻才允许重领
