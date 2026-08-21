-- 0123_user_facing_context_snapshots.sql
-- 用户可见上下文不能依赖会被关闭岗位 RLS 隐藏的当前行，也不能拿内部 id 兜底。
-- 申请时冻结岗位标题；岗位面试继承该快照。interview.created_at 为同岗位多场练习提供可读时间线。

ALTER TABLE job_application
  ADD COLUMN IF NOT EXISTS job_title_snapshot text NOT NULL DEFAULT '岗位信息待补充';

-- 这是受控 migration backfill，不是候选人运行时状态迁移。现有 lineage trigger
-- 强制 app.principal_user=候选人，migration owner 必须只在本事务的快照回填窗口暂停它。
--
-- `trg_enforce_job_application_interview_binding` 也必须在这个同一窗口暂停：
-- 它会在每一条 UPDATE 上重新检查 `status='in_progress'` 是否仍指向
-- created/active interview，即使本次 UPDATE 只写新的展示快照。历史库允许保留
-- 已 abandon/failed 的 in_progress 行（运行时会 fail-closed），这类行会让无关的
-- 展示字段回填被误判成一次 start。这里只暂停这两个受影响的 UPDATE trigger，
-- 不改变 status、interview_id、attempt、score 或任何 lineage 字段；migration
-- runner 的事务保证任一失败时禁用状态和数据一起回滚，随后立即恢复运行时约束。
ALTER TABLE job_application DISABLE TRIGGER trg_job_application_lineage;
ALTER TABLE job_application DISABLE TRIGGER trg_enforce_job_application_interview_binding;
UPDATE job_application a
   SET job_title_snapshot = j.title
  FROM job_posting j
 WHERE j.id = a.job_id
   AND a.job_title_snapshot = '岗位信息待补充';
ALTER TABLE job_application ENABLE TRIGGER trg_enforce_job_application_interview_binding;
ALTER TABLE job_application ENABLE TRIGGER trg_job_application_lineage;

-- `interview` 通过 DEFERRABLE INITIALLY DEFERRED 外键引用 application/job/resume。
-- 上面的 application 回填会在本事务中留下待结算的约束事件；PostgreSQL 在这些
-- 事件结算前拒绝后续 ALTER TABLE interview。这里先强制结算并把本事务剩余部分
-- 切到 immediate 检查：约束不满足则整笔 migration 回滚，满足后后续 interview
-- 回填不会再次积累 pending events，也不会把结构变更拆出 migration ledger 事务。
SET CONSTRAINTS ALL IMMEDIATE;

ALTER TABLE job_application DROP CONSTRAINT IF EXISTS job_application_title_snapshot_chk;
ALTER TABLE job_application ADD CONSTRAINT job_application_title_snapshot_chk
  CHECK (char_length(btrim(job_title_snapshot)) BETWEEN 1 AND 120);

ALTER TABLE interview
  ADD COLUMN IF NOT EXISTS job_title_snapshot text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz;

-- 历史时间只从既有业务证据回填；没有证据就保持 NULL，禁止伪装成迁移时刻。
UPDATE interview i
   SET created_at = COALESCE(
     (SELECT min(j.created_at) FROM interview_job j WHERE j.interview_id = i.id AND j.owner_user_id = i.owner_user_id),
     (SELECT min(q.created_at) FROM interview_question q WHERE q.interview_id = i.id AND q.owner_user_id = i.owner_user_id),
     (SELECT a.created_at FROM job_application a
       WHERE a.id = i.application_id AND a.job_id = i.job_id AND a.candidate_user_id = i.owner_user_id)
   )
 WHERE i.created_at IS NULL;

ALTER TABLE interview ALTER COLUMN created_at SET DEFAULT now();

UPDATE interview i
   SET job_title_snapshot = COALESCE(
     (SELECT a.job_title_snapshot FROM job_application a
       WHERE a.id = i.application_id AND a.job_id = i.job_id AND a.candidate_user_id = i.owner_user_id),
     (SELECT j.title FROM job_posting j WHERE j.id = i.job_id)
   )
 WHERE i.job_id IS NOT NULL
   AND i.job_title_snapshot IS NULL;

ALTER TABLE interview DROP CONSTRAINT IF EXISTS interview_job_title_snapshot_chk;
ALTER TABLE interview ADD CONSTRAINT interview_job_title_snapshot_chk
  CHECK (job_title_snapshot IS NULL OR char_length(btrim(job_title_snapshot)) BETWEEN 1 AND 120);

-- 快照值由数据库从受信业务行派生，调用者不能自报标题；建立后不可改写。
CREATE OR REPLACE FUNCTION enforce_user_facing_context_snapshot()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE trusted_title text;
BEGIN
  IF TG_TABLE_NAME = 'job_application' THEN
    IF TG_OP = 'INSERT' THEN
      SELECT title INTO trusted_title FROM job_posting WHERE id = NEW.job_id;
      IF trusted_title IS NULL THEN RAISE EXCEPTION 'job_title_snapshot_source_missing'; END IF;
      NEW.job_title_snapshot := trusted_title;
    ELSIF NEW.job_title_snapshot IS DISTINCT FROM OLD.job_title_snapshot THEN
      RAISE EXCEPTION 'job_title_snapshot_immutable';
    END IF;
  ELSIF TG_TABLE_NAME = 'interview' THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.job_id IS NULL THEN
        NEW.job_title_snapshot := NULL;
      ELSE
        SELECT a.job_title_snapshot INTO trusted_title
          FROM job_application a
         WHERE a.id = NEW.application_id
           AND a.job_id = NEW.job_id
           AND a.candidate_user_id = NEW.owner_user_id;
        IF trusted_title IS NULL THEN RAISE EXCEPTION 'interview_job_title_snapshot_source_missing'; END IF;
        NEW.job_title_snapshot := trusted_title;
      END IF;
    ELSIF TG_OP = 'UPDATE' AND NEW.job_title_snapshot IS DISTINCT FROM OLD.job_title_snapshot THEN
      RAISE EXCEPTION 'interview_job_title_snapshot_immutable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_application_title_snapshot ON job_application;
CREATE TRIGGER trg_job_application_title_snapshot
BEFORE INSERT OR UPDATE OF job_title_snapshot ON job_application
FOR EACH ROW EXECUTE FUNCTION enforce_user_facing_context_snapshot();

DROP TRIGGER IF EXISTS trg_interview_job_title_snapshot ON interview;
CREATE TRIGGER trg_interview_job_title_snapshot
BEFORE INSERT OR UPDATE OF job_title_snapshot ON interview
FOR EACH ROW EXECUTE FUNCTION enforce_user_facing_context_snapshot();
