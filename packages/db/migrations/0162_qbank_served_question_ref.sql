-- H2 QBANK-CORPUS #79 — 同 interview 已 served 题排除的最小持久面(additive-only 新表)。
--
-- 卷据:§3-⑤「排除已问题:同 interview 已 served 题排除…零已问机制现状故为新建面·最小形=refId 集合过滤」。
-- 写入点:packages/db/src/qbank/qbank-track-local-retrieval.ts 派发 served 转换的同一 asPrincipal
-- 事务(原子:plan dispatched→served 与 served-ref 登记同事务,失败同回滚,plan 留 dispatched 可重派)。
-- 读取点:同文件 Phase 3.5 池级过滤(difficulty 谓词 #77 与已问排除 #79 同位)。
--
-- 形状裁决:owner-scoped 三列主键(幂等重放不添行);question_ref=题面 artifact id
-- (qbank_generation_question_evidence 的 question_id 形,如 question:seed:limit-1),非 chunk ref。
-- additive 铁律:既有 qbank_* 全部零触碰;RLS owner policy 镜像 0142 惯例(单表谓词防跨表递归);
-- REVOKE PUBLIC + 最小 GRANT;无 UPDATE/DELETE 语义(interview 擦除面归既有 privacy 管线,本表零删改)。
-- releaseEvidence=false · Not HA。

CREATE TABLE IF NOT EXISTS qbank_served_question_ref (
  owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
  interview_id text NOT NULL CHECK (char_length(interview_id) BETWEEN 1 AND 512),
  question_ref text NOT NULL CHECK (question_ref ~ '^[A-Za-z0-9:_-]{1,160}$'),
  served_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (owner_user_id, interview_id, question_ref)
);

REVOKE ALL ON qbank_served_question_ref FROM PUBLIC;
GRANT SELECT, INSERT ON qbank_served_question_ref TO app_role;

ALTER TABLE qbank_served_question_ref ENABLE ROW LEVEL SECURITY;
ALTER TABLE qbank_served_question_ref FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_qbank_served_question_ref_owner ON qbank_served_question_ref;
CREATE POLICY p_qbank_served_question_ref_owner ON qbank_served_question_ref
  FOR ALL TO app_role
  USING (owner_user_id = current_setting('app.principal_user', true))
  WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
