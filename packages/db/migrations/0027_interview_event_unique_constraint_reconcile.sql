-- 升级路径与新库基线一致：event_key 的幂等约束必须是表级唯一约束。
-- 0021 的局部唯一索引仍被 appendEvent 的 ON CONFLICT 谓词选用；本约束
-- 保留 NULL 可重复的 PostgreSQL 语义，同时让 schema drift 比对新旧路径一致。
ALTER TABLE interview_event
  ADD CONSTRAINT uq_interview_event_key_constraint UNIQUE (stream_key, event_key);
