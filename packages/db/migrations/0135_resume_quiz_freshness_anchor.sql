-- 0135_resume_quiz_freshness_anchor.sql — GAP-UC025-NEG-01 真接线:resume_quiz 新鲜度锚点列。
-- **非破坏**:ADD COLUMN IF NOT EXISTS;绝不 DROP 已有列、绝不原地重写 0007(已迁移库缺列会假 500)。
-- 已迁移库经本增量迁移得列;新库经 packages/db/sql/20_resume_quiz.sql 重放镜像(DROP+CASCADE 型)得同列——
-- 两类库都必须拿到锚点列(e2e-ha C-1)。语义:worker 置 ready 时写 now()+TTL(apps/worker/src/quiz-lifecycle.ts);
-- NULL=无锚点,begin 的 stale 校验不得把 NULL 当过期(否则已迁移库旧工件被假拒绝)。
ALTER TABLE resume_quiz ADD COLUMN IF NOT EXISTS expires_at timestamptz;
