-- 0213_interview_job_autovacuum_reloptions.sql
-- 5C 批表残半：interview_job 高频改写表补表级自动清理触发参数（退避半=0175 已落·本件=调优半承接）。
-- 形：SET reloptions 仅目录项改写，零行数据改写，SHARE UPDATE EXCLUSIVE 瞬时锁，幂等可重放。
-- 回滚形：ALTER TABLE interview_job RESET (autovacuum_vacuum_scale_factor, autovacuum_vacuum_threshold, autovacuum_analyze_scale_factor);
ALTER TABLE interview_job SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 200,
  autovacuum_analyze_scale_factor = 0.02
);
