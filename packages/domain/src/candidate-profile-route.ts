/**
 * G7S — candidate-profile-derived interview track route（通用 begin 供给面收口 · 新产品决策语义）。
 *
 * 与 R 线 job_route（岗位**要求**语义，`job-route-classifier.ts`）刻意分离：本模块从候选人
 * **本人简历**派生面试 track leaf（**能力**语义）。零 IO、零模型、零 db —— rule 层唯一叶才命中
 * （0 次模型外发）；0 叶或歧义 → 未决（begin 侧 fail-closed 409 `candidate_route_undecided`，
 * 镜像 recruiter 面 `interview_ineligible_route` 先例）。
 *
 * HARD（G7S REQUEST 77989c49 · pre-exec dual BOTH PASS d43787e0 + 83b90a3d · C-MO-S1/S2）：
 *  - Ban 冒用 job 维度 `job_route_decision`/`job_semantic_revision`（岗位语义 ≠ 能力语义）；
 *  - 门语义零弱化：worker `adaptive-role-resolve` fail-closed 门零改动——本模块只解决「供给缺失」，
 *    缺行/缺叶仍拒（拒因从 worker 异步 throw 前移为 begin 同步业务拒绝，拒的本体零消失）；
 *  - 确定性：同输入同决策（C-HA-2）；优先序冻结（语言专精证据 > 通用后端栈证据；≥2 语言叶并存
 *    = 歧义未决，绝不多桶推断——沿 job 侧「全栈绝不扩散」同款纪律）；
 *  - 输入文本仅在内存匹配信号，派生输出只有 leaf + sha256 digest——原文绝不落库/落 trace。
 * releaseEvidence=false · Not HA · ≠ R4 topic isolation closed · ≠ R1。
 */
import { createHash } from 'node:crypto';
import { TAXONOMY_V1_LEAVES, type TaxonomyLeaf } from './job-route-classifier.ts';

/** 候选人面与 job 面共用同一叶分类法（面试 track 域一致），taxonomy 版本沿 v1。 */
export const CANDIDATE_ROUTE_TAXONOMY_VERSION = 'v1';
/** 冻结策略版本：改词典/优先序 = 改路由语义，必须升版本。 */
export const CANDIDATE_ROUTE_POLICY_VERSION = 'candidate-route-2026-10-frozen:v1';
/** 候选人面 decision 无 revision 链（简历内容 sha 定身份），恒 1。 */
export const CANDIDATE_ROUTE_REVISION = 1;
/** rule 唯一叶语义：命中即 100% 单叶分配（0 或 ≥2 → 未决）。 */
export const CANDIDATE_ROUTE_ALLOCATION_BPS = 10000;

/** leaf 语法与 job 面一致：1–4 段小写标识符（`backend/nodejs` 式）。 */
export const CANDIDATE_ROUTE_LEAF_RE = /^[a-z][a-z0-9_]*(?:\/[a-z][a-z0-9_]*){0,3}$/;

/**
 * 候选人能力信号词典（确定性关键词 → leaf）。与 job 面 RULE_SIGNALS 语义不同源：
 * 这里是「候选人本人具备的工程能力证据」——通用后端栈证据（Redis/MySQL/消息队列…）与
 * 后端自述（后端工程师/后端开发）归 `backend/general`；语言专精信号（python/spring/golang…）
 * 归各自语言叶。歧义词刻意不映射到任何单一语言叶。
 */
const CANDIDATE_PROFILE_SIGNALS: Record<TaxonomyLeaf, readonly string[]> = {
  'backend/general': [
    '后端工程师', '后端开发', '服务端', 'backend engineer',
    'redis', 'mysql', 'postgresql', '消息队列', '消息中间件', '分布式锁', '分库分表',
    '高并发', '幂等', '限流', '微服务', 'kafka', 'rabbitmq', 'nginx', 'outbox',
  ],
  'backend/nodejs': ['nodejs', 'node.js', 'express', 'nestjs', 'koa', 'egg.js'],
  'backend/java': ['java', 'spring', 'kotlin', 'scala', 'hibernate', 'mybatis', 'jvm'],
  'backend/go': ['golang', 'go', 'gin'],
  'backend/python': ['python', 'django', 'flask', 'fastapi', 'tornado', 'pandas', 'numpy'],
  'frontend/web': ['前端', 'frontend', 'react', 'vue', 'angular', '小程序', 'typescript', 'javascript', 'html', 'css'],
  'qa/quality_engineering': ['测试', 'qa', '质量工程', '自动化测试', 'sdet'],
  'ai_ml/applied': ['机器学习', '深度学习', '大模型', 'llm', 'rag', 'nlp', '算法', '人工智能', 'pytorch', 'tensorflow', 'embedding', 'langchain'],
};

const normalize = (t: string) => t.normalize('NFKC').trim();

/** ASCII token 用词边界匹配（避免 `go` 命中 `google`、`java` 命中 `javascript`）；CJK 用子串匹配。 */
function signalMatches(text: string, token: string): boolean {
  if (/^[A-Za-z0-9.+# ]+$/.test(token)) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.includes(token);
}

/**
 * 候选人 profile 语义 canonical digest：只含归一化简历文本的 sha256（结构上无法被伪造的
 * trackId/weight 污染；原文不落库，digest 只作派生身份/审计对账）。
 */
export function canonicalCandidateProfileDigest(raw: string): string {
  return createHash('sha256').update(JSON.stringify({ v: 'candidate-semantic:v1', text: normalize(raw) })).digest('hex');
}

/** 决策行 hash（与 job 面 decision_hash 同构）：digest+leaf+policy 的 sha256，DB 完整性对账用。 */
export function candidateRouteDecisionHash(input: {
  interviewId: string; resumeId: string; inputDigest: string;
  leafTrackId: string; allocationBps: number; policyVersion: string;
}): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'candidate-route:v1', interviewId: input.interviewId, resumeId: input.resumeId,
    inputDigest: input.inputDigest, leafTrackId: input.leafTrackId,
    allocationBps: input.allocationBps, policyVersion: input.policyVersion,
  })).digest('hex');
}

export type CandidateProfileRouteRuleResult =
  | { decided: true; leafTrackId: TaxonomyLeaf; allocationBps: typeof CANDIDATE_ROUTE_ALLOCATION_BPS }
  | { decided: false; reason: 'profile_empty' | 'no_signal_hit' | 'ambiguous_language_evidence' };

/**
 * rule 分类（唯一叶才返回；0 次模型外发）：
 *  - 恰 1 叶命中 → 该叶 @10000bps；
 *  - 通用后端叶与唯一语言叶并存 → 冻结优先序取语言叶（语言专精证据压过通用栈证据）；
 *  - ≥2 语言叶并存 / 0 叶 → 未决（begin 侧 409，绝不多桶推断）。
 */
export function classifyCandidateProfileByRule(raw: string): CandidateProfileRouteRuleResult {
  const text = normalize(raw);
  if (!text) return { decided: false, reason: 'profile_empty' };
  const hits = TAXONOMY_V1_LEAVES.filter((leaf) => CANDIDATE_PROFILE_SIGNALS[leaf].some((t) => signalMatches(text, t)));
  if (hits.length === 1) return { decided: true, leafTrackId: hits[0]!, allocationBps: CANDIDATE_ROUTE_ALLOCATION_BPS };
  const specific = hits.filter((l) => l !== 'backend/general');
  if (hits.includes('backend/general') && specific.length === 1)
    return { decided: true, leafTrackId: specific[0]!, allocationBps: CANDIDATE_ROUTE_ALLOCATION_BPS };
  if (hits.length === 0) return { decided: false, reason: 'no_signal_hit' };
  return { decided: false, reason: 'ambiguous_language_evidence' };
}
