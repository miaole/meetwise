/**
 * RAG-FUNNEL-07 / 自由文本自动漏斗：纯领域分类器（零 IO、零模型、零 db）。
 *
 * 与 RAG-03 岗位路由**结构同构但 scope 隔离**：
 *  - 复用 RAG-03 的冻结 rule 信号词典（classifyJobByRule）+ 模型输出双重校验
 *    （validateModelRouteOutput：taxonomy/facet/校准/max-leaf/min-allocation/
 *    confidence/margin 全过才 route_decided，任一不符 → 精确原因码）。
 *  - canonical digest 用独立命名空间 `free-text-semantic:v1`（{goal} 形状，非
 *    {title,description,competencies}）；decision 哈希用独立命名空间
 *    `free-text-route-decision:v1` + scopeId（非 jobId）——同文本/同 allocations 也
 *    绝不与 job 决策碰撞（跨桶/跨 owner 隔离）。
 *  - 自由文本无 job_posting：goal 只以 digest 形式落库，分类结果只是「建议 allowlisted
 *    track」，**不授予任何读取/工具权限**（无 binding/snapshot/检索消费链）。
 *
 * 真实模型外发归 MODEL-OP-01 typed binding；本模块只暴露受控确定性 seam
 * （classifyFreeTextByRule 复用 classifyJobByRule），零 IO、零模型、零 db。
 */
import { createHash } from 'node:crypto';
import { classifyJobByRule, type TaxonomyLeaf, type JobRouteAllocation } from './job-route-classifier.ts';

const normalize = (t: string) => t.normalize('NFKC').trim();

/**
 * 自由文本语义（专项训练目标）canonical digest：只含 goal（trim + NFKC），独立命名空间。
 * 与 canonicalJobSemanticDigest({title:goal, description:'', competencies:[]}) 的命名空间/
 * 形状不同，故同一段文本的两个 digest 绝不相等——scope 身份结构上不可混入岗位路由。
 */
export function canonicalFreeTextSemanticDigest(input: { goal: string }): string {
  const goal = normalize(input.goal);
  return createHash('sha256').update(JSON.stringify({ v: 'free-text-semantic:v1', goal })).digest('hex');
}

/**
 * 自由文本规则分类：复用 RAG-03 冻结信号词典，把 goal 当作 title（description/competencies
 * 空）。唯一 leaf 才命中（0 模型调用）；0 个或 ≥2 个 → null（交给模型，绝不做多桶推断）。
 */
export function classifyFreeTextByRule(input: { goal: string }): TaxonomyLeaf | null {
  return classifyJobByRule({ title: input.goal, description: '', competencies: [] });
}

/**
 * 自由文本 route 决策内容哈希：独立命名空间 + scopeId（非 jobId），把
 * (scope, revision, taxonomy/policy 版本, allocations, confidence/margin,
 * attempt_outcome, reason_codes) 钉死。与 jobRouteDecisionHash 结构同构但命名空间/主键
 * 不同，同一组 allocations/confidence/margin 也绝不碰撞（scope 隔离，防跨桶复用决策）。
 */
export function freeTextRouteDecisionHash(input: {
  scopeId: string; revision: number; taxonomyVersion: string; policyVersion: string;
  allocations: JobRouteAllocation[]; confidenceBps: number | null; marginBps: number | null;
  attemptOutcome: string; reasonCodes: string[];
}): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'free-text-route-decision:v1',
    scopeId: input.scopeId,
    revision: input.revision,
    taxonomyVersion: input.taxonomyVersion,
    policyVersion: input.policyVersion,
    allocations: input.allocations.map((a) => [a.leafTrackId, a.allocationBps]),
    confidenceBps: input.confidenceBps,
    marginBps: input.marginBps,
    attemptOutcome: input.attemptOutcome,
    reasonCodes: [...input.reasonCodes].sort(),
  })).digest('hex');
}
