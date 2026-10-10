/**
 * G7S — candidate-profile-derived interview track route（通用 begin 供给面收口 · 新产品决策语义）。
 *
 * 与 R 线 job_route（岗位**要求**语义，`job-route-classifier.ts`）刻意分离：本模块从候选人
 * **本人简历**派生面试 track leaf（**能力**语义）。零 IO、零模型、零 db —— rule 层确定叶分配
 * （0 次模型外发）。v3（#133 rev3 · 审计 #133 验收口径）起：零命中与 ≥2 specific 叶歧义不再
 * 未决 409，降级兜底 `backend/general` 并携带 degraded 信号（审计裁定：409 拒绝启动比泛化路由
 * 伤害更大——用户旅程第 4 断点）；begin 侧 409 `candidate_route_undecided` 路径保留仅作防御
 * （结构性不可达），`profile_unavailable`（简历缺失/解密失败）仍 fail-closed 409。
 *
 * HARD（G7S REQUEST 77989c49 · pre-exec dual BOTH PASS d43787e0 + 83b90a3d · C-MO-S1/S2）：
 *  - Ban 冒用 job 维度 `job_route_decision`/`job_semantic_revision`（岗位语义 ≠ 能力语义）；
 *  - 门语义零弱化：worker `adaptive-role-resolve` fail-closed 门零改动——本模块只解决「供给缺失」，
 *    缺行/缺叶仍拒（拒因从 worker 异步 throw 前移为 begin 同步业务拒绝，拒的本体零消失）；
 *  - 确定性：同输入同决策（C-HA-2）；优先序（语言专精证据 > 通用后端栈证据；general+唯一
 *    specific 叶并存 → 取 specific 叶）。v3（#133 rev3 R3-1/R3-5）起「≥2 语言叶并存=歧义未决，
 *    绝不多桶推断」的 G7S 冻结条款经**用户决策凌驾**路径解除：多桶不可判定时选最大覆盖面桶
 *    （backend/general）兜底并携带 degraded 信号（G7S 语义变更 erratum 归协调方卷；先前
 *    「待后继用户选择刀」条款作废，UI 刀 #259 非门槛）；
 *  - 输入文本仅在内存匹配信号，派生输出只有 leaf + sha256 digest——原文绝不落库/落 trace。
 * releaseEvidence=false · Not HA · ≠ R4 topic isolation closed · ≠ R1。
 */
import { createHash } from 'node:crypto';
import { TAXONOMY_V1_LEAVES, type TaxonomyLeaf } from './job-route-classifier.ts';

/** 候选人面与 job 面共用同一叶分类法（面试 track 域一致），taxonomy 版本沿 v1。 */
export const CANDIDATE_ROUTE_TAXONOMY_VERSION = 'v1';
/** 冻结策略版本：改词典/优先序 = 改路由语义，必须升版本。v3 = #133 rev3（词典收紧 + 409 退役降级臂）。 */
export const CANDIDATE_ROUTE_POLICY_VERSION = 'candidate-route-2026-10-frozen:v3';
/** 候选人面 decision 无 revision 链（简历内容 sha 定身份），恒 1。 */
export const CANDIDATE_ROUTE_REVISION = 1;
/** rule 唯一叶语义：命中即 100% 单叶分配（0 或 ≥2 specific → v3 降级臂 backend/general 兜底）。 */
export const CANDIDATE_ROUTE_ALLOCATION_BPS = 10000;

/** leaf 语法与 job 面一致：1–4 段小写标识符（`backend/nodejs` 式）。 */
export const CANDIDATE_ROUTE_LEAF_RE = /^[a-z][a-z0-9_]*(?:\/[a-z][a-z0-9_]*){0,3}$/;

/**
 * 候选人能力信号词典（确定性关键词 → leaf）。与 job 面 RULE_SIGNALS 语义不同源：
 * 这里是「候选人本人具备的工程能力证据」——通用后端栈证据（Redis/MySQL/消息队列…）与
 * 后端自述（后端工程师/后端开发）归 `backend/general`；语言专精信号（python/spring/golang…）
 * 归各自语言叶。
 *
 * #133 收紧原则（REQUEST rev3 §1.1 逐词裁定表）：弱证据/歧义证据词不作语言叶——语言叶只收
 * 「语言/岗位自述级强证据」；弱前端证据泛词（html/css/javascript/typescript）迁 `backend/general`
 * 共享/降级桶（general 结构上不产生歧义：单独命中 → decided backend/general；general+唯一
 * specific 叶 → 取 specific 叶）；裸 `go`/裸 `测试`/裸 `算法` 移除，上下文化 token 接管同叶
 * （CJK 混合 token 走 includes 大小写敏感分支 → 双/三大小写 × 带空格/不带空格变体显式列举）。
 * 观察项不动清单（登记不改）：spring/express/angular/tornado/前端/后端开发/测开（漏收实词·保守）/
 * 「自动化」裸词（有意排除）；`推荐算法`/`搜索算法` 刻意不收（后端推荐/搜索系统工程师真实存在）。
 */
const CANDIDATE_PROFILE_SIGNALS: Record<TaxonomyLeaf, readonly string[]> = {
  'backend/general': [
    '后端工程师', '后端开发', '服务端', 'backend engineer',
    'redis', 'mysql', 'postgresql', '消息队列', '消息中间件', '分布式锁', '分库分表',
    '高并发', '幂等', '限流', '微服务', 'kafka', 'rabbitmq', 'nginx', 'outbox',
    // #133 §1.1 #2-#5：html/css/javascript/typescript 自 frontend/web 迁入（弱证据共享桶）。
    'html', 'css', 'javascript', 'typescript',
  ],
  'backend/nodejs': ['nodejs', 'node.js', 'express', 'nestjs', 'koa', 'egg.js'],
  'backend/java': ['java', 'spring', 'kotlin', 'scala', 'hibernate', 'mybatis', 'jvm'],
  // #133 §1.1 #1：裸 'go' 移除（\bgo\b 命中英文普通动词 "go hiking"）→ 上下文化 token 显式列举
  //（go/Go 双大小写 × 空格变体 12 个 + rev2 D1 追加 GO 全大写变体 6 个）。
  'backend/go': [
    'golang', 'gin',
    'go语言', 'Go语言', 'GO语言', 'go 语言', 'Go 语言', 'GO 语言',
    'go开发', 'Go开发', 'GO开发', 'go 开发', 'Go 开发', 'GO 开发',
    'go工程师', 'Go工程师', 'GO工程师', 'go后端', 'Go后端', 'GO后端',
  ],
  'backend/python': ['python', 'django', 'flask', 'fastapi', 'tornado', 'pandas', 'numpy'],
  // #133 §1.1 #2-#5：html/css/javascript/typescript 迁出——余语言/岗位自述级强证据。
  'frontend/web': ['前端', 'frontend', 'react', 'vue', 'angular', '小程序'],
  // #133 §1.1 #6：裸 '测试' 移除（CJK 子串命中「单元测试/接口测试」）→ 收窄为岗位自述级 token。
  'qa/quality_engineering': ['qa', '质量工程', '自动化测试', 'sdet', '测试开发', '测试工程师', '软件测试'],
  // #133 §1.1 #7：裸 '算法' 移除（任何工程师「基础算法/数据结构」即中）→ 收窄为职位/专精 token。
  //（'机器学习算法' 冗余——必中 '机器学习' 子串，rev2 D3 登记留删随意，此处保留以显文档意图。）
  'ai_ml/applied': ['机器学习', '深度学习', '大模型', 'llm', 'rag', 'nlp', '人工智能', 'pytorch', 'tensorflow', 'embedding', 'langchain', '算法工程师', '算法专家', '机器学习算法'],
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

/** v3 降级臂信号源：degraded=true 时记录兜底前本应的未决拒因（审计对账/后续刀观察面用）。 */
export type CandidateProfileRouteDegradedFrom = 'ambiguous_language_evidence' | 'no_signal_hit';

/**
 * v3（#133 rev3 R3-1）：分类器除 `profile_empty`（空输入 → db 侧映射 profile_unavailable →
 * 409 防御面保留）外恒 decided。零命中与 ≥2 specific 叶歧义 → `backend/general` 最大覆盖面桶
 * 兜底 + degraded 信号，不再 409（409 拒绝启动伤害更大——审计裁定）；`no_signal_hit` /
 * `ambiguous_language_evidence` 作为未决拒因退役（仅存于 degradedFrom 对账信号）。
 */
export type CandidateProfileRouteRuleResult =
  | { decided: true; leafTrackId: TaxonomyLeaf; allocationBps: typeof CANDIDATE_ROUTE_ALLOCATION_BPS; degraded: false; degradedFrom?: undefined }
  | { decided: true; leafTrackId: 'backend/general'; allocationBps: typeof CANDIDATE_ROUTE_ALLOCATION_BPS; degraded: true; degradedFrom: CandidateProfileRouteDegradedFrom }
  | { decided: false; reason: 'profile_empty' };

/**
 * rule 分类（0 次模型外发）：
 *  - 恰 1 叶命中 → 该叶 @10000bps；
 *  - 通用后端叶与唯一语言叶并存 → 优先序取语言叶（语言专精证据压过通用栈证据）；
 *  - v3 降级臂（rev3 R3-1 · 审计 #133）：≥2 specific 叶歧义 / 0 叶命中 → `backend/general`
 *    兜底 @10000bps + degraded 信号（不再 409，「绝不多桶推断」冻结条款经用户决策凌驾解除）；
 *  - 空输入 → profile_empty（db 侧 profile_unavailable → 409 防御面保留，R3-3）。
 */
export function classifyCandidateProfileByRule(raw: string): CandidateProfileRouteRuleResult {
  const text = normalize(raw);
  if (!text) return { decided: false, reason: 'profile_empty' };
  const hits = TAXONOMY_V1_LEAVES.filter((leaf) => CANDIDATE_PROFILE_SIGNALS[leaf].some((t) => signalMatches(text, t)));
  if (hits.length === 1) return { decided: true, leafTrackId: hits[0]!, allocationBps: CANDIDATE_ROUTE_ALLOCATION_BPS, degraded: false };
  const specific = hits.filter((l) => l !== 'backend/general');
  if (hits.includes('backend/general') && specific.length === 1)
    return { decided: true, leafTrackId: specific[0]!, allocationBps: CANDIDATE_ROUTE_ALLOCATION_BPS, degraded: false };
  // v3 降级臂：多桶不可判定（≥2 specific）与零命中均选最大覆盖面桶（general）并携带 degraded。
  if (hits.length === 0)
    return { decided: true, leafTrackId: 'backend/general', allocationBps: CANDIDATE_ROUTE_ALLOCATION_BPS, degraded: true, degradedFrom: 'no_signal_hit' };
  return { decided: true, leafTrackId: 'backend/general', allocationBps: CANDIDATE_ROUTE_ALLOCATION_BPS, degraded: true, degradedFrom: 'ambiguous_language_evidence' };
}
