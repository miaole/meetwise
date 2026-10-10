/**
 * G7S — candidate-profile-derived route supply（通用 begin 供给面收口：写侧 + 角色门 fallback 读侧）。
 *
 * 写侧（begin 事务内同步执行，先于扣额/入队）：以候选人本人简历（owner-scoped 解密，reparse 同款
 * 读取先例；原文仅在内存匹配信号，绝不落库/落 trace）rule 派生唯一 track 叶，落
 * candidate_profile_route_decision + candidate_profile_route_snapshot（0142 新结构，additive-only；
 * Ban 冒用 job 维度 job_route_decision/job_semantic_revision；Ban 伪造 binding/decision 行）。
 * 未决/失败 → 返回 undecided，调用方同步 409 candidate_route_undecided（同事务回滚零悬账，
 * 镜像 recruiter 面 interview_ineligible_route 先例）。
 *
 * 读侧（worker start job 角色门）：旧 recruiter snapshot（0104 interview_route_snapshot）优先，
 * 缺行才 fallback 新 snapshot 表——recruiter-flow 面（唯一生产者 recruiter.ts:428）零回归；
 * 检索面（G-R2-5）维持旧表直读不动，candidate 面 retrieval 走既有 degradedRetrieval 语义。
 *
 * 门语义零弱化（C-HA/C-MO 铁律）：worker adaptive-role-resolve fail-closed 门零改动——本模块
 * 只解决「供给缺失」，缺行/缺叶仍拒（拒因前移非拒体消失）。releaseEvidence=false · Not HA。
 */
import { newEntityId } from './ids.ts';
import type { PoolClient as Client } from 'pg';
import {
  CANDIDATE_ROUTE_TAXONOMY_VERSION, CANDIDATE_ROUTE_POLICY_VERSION, CANDIDATE_ROUTE_REVISION,
  canonicalCandidateProfileDigest, candidateRouteDecisionHash, classifyCandidateProfileByRule,
} from '@meetwise/domain';
import { requireOwnerUserId } from './tenant/index.ts';   // PRIV01-C 第二层 E1(应用层 tenant ≠ RLS · 授权根仍为 asPrincipal+RLS)
import { decryptResumeBlob } from './resume.ts';
import { getInterviewRouteSnapshot, type InterviewRouteSnapshotView } from './job-route-decision.ts';

export type CandidateProfileRouteSupply =
  | { status: 'supplied'; decisionId: string; leafTrackId: string; reused: boolean }
  | { status: 'undecided'; reason: 'profile_unavailable' | 'no_signal_hit' | 'ambiguous_language_evidence' };

/**
 * begin 事务内同步供给 candidate-profile route decision + snapshot。
 * 幂等：decision UNIQUE(interview_id) + snapshot PK(interview_id)，ON CONFLICT DO NOTHING 后回读既有行。
 * 派生输入 = 简历解密原文（owner-scoped；零外发零模型）；输出只有 leaf + sha256 digest。
 */
export async function supplyCandidateProfileRoute(c: Client, owner: string, interviewId: string, resumeId: string): Promise<CandidateProfileRouteSupply> {
  const ownerScope = requireOwnerUserId(owner, 'candidate-route.supply');   // PRIV01-C 第二层 E1(两席一致裁定纳入 · 候选 owner 归属读写平面)
  // 幂等回读：本 interview 已供给 → 复用（重复 begin / 崩溃后重放不会产生第二份决策）。
  const existing = await c.query(
    `SELECT decision_id, leaf_track_id
       FROM candidate_profile_route_snapshot
      WHERE interview_id=$1 AND candidate_user_id=$2`,
    [interviewId, ownerScope],
  );
  if (existing.rowCount !== 0) {
    const row = existing.rows[0] as { decision_id: string; leaf_track_id: string };
    return { status: 'supplied', decisionId: row.decision_id, leafTrackId: row.leaf_track_id, reused: true };
  }
  // 简历必须处于 ingested（与 begin 的绑定守卫同一前提）；原文经 owner-scoped 解密取回。
  // E5:自身 id 意外 0 行 → undecided → 服务层 409 candidate_route_undecided fail-closed。
  const resume = await c.query(
    `SELECT content_sha FROM resume WHERE id=$1 AND owner_user_id=$2 AND status='ingested'`,
    [resumeId, ownerScope],
  );
  if (resume.rowCount === 0) return { status: 'undecided', reason: 'profile_unavailable' };
  const resumeContentSha = String((resume.rows[0] as { content_sha: string }).content_sha);
  let raw: string;
  try {
    raw = await decryptResumeBlob(c, ownerScope, resumeId);
  } catch {
    return { status: 'undecided', reason: 'profile_unavailable' };
  }
  const rule = classifyCandidateProfileByRule(raw ?? '');
  if (!rule.decided) {
    return { status: 'undecided', reason: rule.reason === 'profile_empty' ? 'profile_unavailable' : rule.reason };
  }
  const inputDigest = canonicalCandidateProfileDigest(raw ?? '');
  const decisionHash = candidateRouteDecisionHash({
    interviewId, resumeId, inputDigest,
    leafTrackId: rule.leafTrackId, allocationBps: rule.allocationBps, policyVersion: CANDIDATE_ROUTE_POLICY_VERSION,
  });
  const decisionId = newEntityId('cprd');
  const ins = await c.query(
    `INSERT INTO candidate_profile_route_decision
       (id,interview_id,owner_user_id,resume_id,resume_content_sha,input_digest,
        taxonomy_version,policy_version,route_outcome,attempt_outcome,leaf_track_id,allocation_bps,decision_hash)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,'route_decided','rule_decided',$9,$10,$11)
     ON CONFLICT (interview_id) DO NOTHING
     RETURNING id`,
    [decisionId, interviewId, ownerScope, resumeId, resumeContentSha, inputDigest,
      CANDIDATE_ROUTE_TAXONOMY_VERSION, CANDIDATE_ROUTE_POLICY_VERSION,
      rule.leafTrackId, rule.allocationBps, decisionHash],
  );
  // 并发 begin（advisory 锁下罕见）撞 UNIQUE → 回读既有 decision，snapshot 引用真实行。
  let finalDecisionId = decisionId;
  if ((ins.rowCount ?? 0) === 0) {
    const dec = await c.query(
      `SELECT id FROM candidate_profile_route_decision WHERE interview_id=$1 AND owner_user_id=$2`,
      [interviewId, ownerScope],
    );
    if (dec.rowCount === 0) return { status: 'undecided', reason: 'profile_unavailable' };
    finalDecisionId = String((dec.rows[0] as { id: string }).id);
  }
  await c.query(
    `INSERT INTO candidate_profile_route_snapshot
       (interview_id,candidate_user_id,decision_id,resume_content_sha,input_digest,
        taxonomy_version,leaf_track_id,allocation_bps,status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,'interview_snapshotted')
     ON CONFLICT (interview_id) DO NOTHING`,
    [interviewId, ownerScope, finalDecisionId, resumeContentSha, inputDigest,
      CANDIDATE_ROUTE_TAXONOMY_VERSION, rule.leafTrackId, rule.allocationBps],
  );
  return { status: 'supplied', decisionId: finalDecisionId, leafTrackId: rule.leafTrackId, reused: false };
}

/**
 * worker start job 角色门 fallback 读：旧 recruiter snapshot 优先（recruiter 面零回归），
 * 缺行才读 candidate snapshot 并适配同一 InterviewRouteSnapshotView 形状。
 * 适配语义如实登记：candidate 面无 job 祖先 → jobId='' · revision=常量 1 · routeDigest=input_digest。
 * 消费方（角色门）只读 allocations[0].leafTrackId；检索面（G-R2-5）不走本函数（维持旧表直读）。
 */
export async function getInterviewRouteSnapshotForAdaptiveRole(c: Client, candidate: string, interviewId: string): Promise<InterviewRouteSnapshotView | null> {
  const primary = await getInterviewRouteSnapshot(c, candidate, interviewId);
  if (primary) return primary;
  const r = await c.query(
    `SELECT s.interview_id, s.decision_id, s.leaf_track_id, s.allocation_bps, s.input_digest
       FROM candidate_profile_route_snapshot s
      WHERE s.interview_id=$1 AND s.candidate_user_id=$2`,
    [interviewId, candidate],
  );
  if (r.rowCount === 0) return null;
  const row = r.rows[0] as {
    interview_id: string; decision_id: string; leaf_track_id: string; allocation_bps: number; input_digest: string;
  };
  return {
    interviewId: row.interview_id,
    jobId: '',
    revision: CANDIDATE_ROUTE_REVISION,
    decisionId: row.decision_id,
    routeDigest: row.input_digest,
    allocations: [{ leafTrackId: String(row.leaf_track_id), allocationBps: Number(row.allocation_bps) }],
  };
}
