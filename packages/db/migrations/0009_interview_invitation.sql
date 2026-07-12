-- 0009_interview_invitation.sql — B 端企业纵深:招聘方邀请候选人面试 + 人才库聚合。
-- 复用既有 job_application(多方 RLS),不另起新表(候选人自投 / 招聘方邀请同一条申请的不同来源)。
-- 隐私边界不变:招聘方只见 application 缓存状态/分数;候选人面试 transcript(interview / interview_event)
--   仍为 owner-only FORCE RLS,招聘方(另一 principal)读 = 0 行。who-pays:候选人用自己的额度池跑面试(他们的练习),
--   招聘方邀请只建申请壳,不碰额度/权益(AI 图/招聘方均不直接动 entitlement)。
-- 增量、非破坏:ADD COLUMN IF NOT EXISTS / DROP+ADD 已命名 CHECK(旧 'interviewing' 从未被写入,安全替换)。

-- ① 申请来源:候选人自投(applied)/ 招聘方邀请(invited)。默认 applied(向后兼容既有行)。
ALTER TABLE job_application ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'applied'
  CHECK (source IN ('applied','invited'));

-- ② 状态机扩展:invited → in_progress(候选人开始面试)→ completed(回填分数);declined(候选人婉拒,终态,不死胡同)。
--    旧集合含 'interviewing'(代码从未写入,但已部署库无法离线断言)→ 先把任何残留行迁到 'in_progress',
--    再换约束,确保 ADD CONSTRAINT 校验存量行时不会因一行残留而整迁移 ROLLBACK(部署硬卡)。
UPDATE job_application SET status='in_progress' WHERE status='interviewing';
ALTER TABLE job_application DROP CONSTRAINT IF EXISTS job_application_status_check;
ALTER TABLE job_application ADD CONSTRAINT job_application_status_check
  CHECK (status IN ('invited','in_progress','completed','declined'));

-- ③ 招聘方 INSERT 策略(多方 RLS 增量):招聘方可为**自己拥有的岗位**插入邀请行。
--    RLS 内 EXISTS 自校验岗位归属 → 即便仓储逻辑写错也无法越权代他人岗位邀请(纵深防御,安全边界在 RLS 不在应用层)。
DROP POLICY IF EXISTS p_recruiter_insert ON job_application;
CREATE POLICY p_recruiter_insert ON job_application FOR INSERT
  WITH CHECK (
    recruiter_user_id = current_setting('app.principal_user', true)
    AND EXISTS (SELECT 1 FROM job_posting j
                WHERE j.id = job_id AND j.owner_user_id = current_setting('app.principal_user', true))
  );

-- 人才库聚合(招聘方跨自有岗位看所有候选人)走既有 p_party_read(recruiter_user_id = principal),无需新策略。
