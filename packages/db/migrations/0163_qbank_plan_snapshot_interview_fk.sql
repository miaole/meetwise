-- H2 QBANK-CORPUS #202(收编) — 检索面切 candidate-route 的结构性使能:plan snapshot FK 改挂 interview。
--
-- 卷据:§3-⑥「C 端检索面从旧 recruiter snapshot 表切候选人路由(candidate-route)…本刀即解禁/扩形此缝」。
-- 现状(本刀亲测):qbank_retrieval_plan(0106:322)与 question_plan(0110:74)的 snapshot_id FK 均指向
-- interview_route_snapshot(interview_id)——candidate 面(0142)面试在该表无行,track-local 派发/miss 派发
-- 的 plan 冻结必撞 FK(结构上把 C 端检索面焊死在旧表)。本刀已把派发层读源切双轨
-- (qbank-track-local-retrieval Phase 1 → getInterviewRouteSnapshotForAdaptiveRole:旧表优先→candidate
-- fallback),plan 校验(validateRetrievalPlan)仍逐派发对真实 snapshot 行强校验;FK 改挂 interview(id)
-- 后两表 snapshot_id 语义=「必须是真实 interview」(两 snapshot 表各自保证 per-interview 行,FK 兜底存在性
-- 由读侧校验承重,与 #202 门语义零弱化一致)。
--
-- Additive 铁律:仅替换两条 FK 的引用目标(interview_route_snapshot.interview_id → interview.id,类型同为
-- text),零列变更零数据迁移;0106/0110 原文零字节零触碰;门语义零弱化(缺行/缺叶仍 snapshot_missing →
-- route_snapshot_missing → deny_external,永不 unscoped)。幂等:约束以既有名重建(DROP IF EXISTS +
-- 重名 ADD,manifest 单次执行语义不变)。releaseEvidence=false · Not HA。

ALTER TABLE qbank_retrieval_plan
  DROP CONSTRAINT IF EXISTS qbank_retrieval_plan_snapshot_id_fkey;
ALTER TABLE qbank_retrieval_plan
  ADD CONSTRAINT qbank_retrieval_plan_snapshot_id_fkey
  FOREIGN KEY (snapshot_id) REFERENCES interview(id);

ALTER TABLE question_plan
  DROP CONSTRAINT IF EXISTS question_plan_snapshot_id_fkey;
ALTER TABLE question_plan
  ADD CONSTRAINT question_plan_snapshot_id_fkey
  FOREIGN KEY (snapshot_id) REFERENCES interview(id);
