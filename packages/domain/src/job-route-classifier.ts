/**
 * RAG-FUNNEL-03 / ROUTE-01 岗位意图路由：纯领域分类器 + 冻结校准策略 + 图内 planner/scheduler。
 *
 * 零 IO、零模型、零 db —— 只做：
 *  - canonical 岗位语义 digest（结构上无法被伪造的 trackId/weight/confidence 污染）；
 *  - 确定性 rule 分类（唯一 leaf 才命中，0 调用模型；"全栈" 绝不扩散到所有语言桶）；
 *  - 模型输出的双重校验（schema → business）：taxonomy/校准/max-leaf/min-allocation/
 *    confidence/margin 全过才 route_decided，任一不符 → 明确原因码；
 *  - 图内 planner 输出是否属于 snapshot 的判定；
 *  - 每轮确定性 weighted-deficit 选择器（多桶 = 按轮配额，不是一次混合检索）。
 *
 * 真实模型外发归 MODEL-OP-01 typed binding；本模块只暴露受控确定性 seam
 * （classifyJobByRule + validateModelRouteOutput）。改校准常量 = 改路由语义，必须升 policy 版本。
 */
import { createHash } from 'node:crypto';

/** taxonomy v1 叶节点（父节点 backend/frontend/qa/ai_ml 不是 leaf）。与迁移 0086 种子一一对应。 */
export const TAXONOMY_V1_LEAVES = [
  'backend/nodejs',
  'backend/java',
  'backend/go',
  'backend/python',
  'backend/general',
  'frontend/web',
  'qa/quality_engineering',
  'ai_ml/applied',
] as const;
export type TaxonomyLeaf = (typeof TAXONOMY_V1_LEAVES)[number];

export const JOB_ROUTE_TAXONOMY_VERSION = 'v1';
/** 冻结校准策略版本：count/min-weight/confidence 阈值/margin 全部冻结。 */
export const JOB_ROUTE_POLICY_VERSION = 'calibration-2026-08-frozen:v1';
export const JOB_ROUTE_MAX_LEAVES = 4;
export const JOB_ROUTE_MIN_ALLOCATION_BPS = 500;
export const JOB_ROUTE_CONFIDENCE_THRESHOLD_BPS = 7000;
export const JOB_ROUTE_MARGIN_THRESHOLD_BPS = 1000;
export const JOB_ROUTE_TOTAL_BPS = 10000;

/** leaf 语法：`backend/nodejs` 这种 1–4 段小写标识符。父节点不合语法（且不在允许清单）。 */
const LEAF_RE = /^[a-z][a-z0-9_]*(?:\/[a-z][a-z0-9_]*){0,3}$/;

export interface JobRouteAllocation { leafTrackId: string; allocationBps: number }

/** 小模型 `job_route_classify` 的严格输出合同（RAG-03 seam；真实外发归 MODEL-OP-01）。 */
export interface JobRouteModelOutput {
  allocations: JobRouteAllocation[];
  confidenceBps: number;
  marginBps: number;
  reasonCodes: string[];
}

const normalize = (t: string) => t.normalize('NFKC').trim();

/**
 * 岗位语义 revision 的 canonical digest：只含 title/description/competencies（trim + NFKC）。
 * 不含任何 trackId/weight/confidence/override —— 用户提交的桶参数结构上无法进入路由身份。
 */
export function canonicalJobSemanticDigest(input: { title: string; description: string; competencies: string[] }): string {
  const title = normalize(input.title);
  const description = normalize(input.description ?? '');
  const competencies = (input.competencies ?? []).map(normalize).filter((s) => s.length > 0);
  return createHash('sha256').update(JSON.stringify({ v: 'job-semantic:v1', title, description, competencies })).digest('hex');
}

/**
 * rule 信号词典：确定性关键词 → 唯一 leaf。通用/歧义词（后端/backend/全栈/fullstack/api/数据库/
 * 分布式/系统/架构…）刻意不映射到任何单一 leaf，否则 "全栈" 会被扩散成所有语言桶。
 * 命中 0 个或 ≥2 个 leaf → 返回 null（交给模型，绝不做多桶推断）。
 */
const RULE_SIGNALS: Record<TaxonomyLeaf, readonly string[]> = {
  'backend/nodejs': ['nodejs', 'node.js', 'express', 'nestjs', 'koa', 'egg.js'],
  'backend/java': ['java', 'spring', 'kotlin', 'scala', 'hibernate', 'mybatis', 'jvm'],
  'backend/go': ['golang', 'go', 'gin'],
  'backend/python': ['python', 'django', 'flask', 'fastapi', 'tornado', 'pandas', 'numpy'],
  'backend/general': ['后端开发'],
  'frontend/web': ['前端', 'frontend', 'react', 'vue', 'angular', '小程序', 'typescript', 'javascript', 'html', 'css'],
  'qa/quality_engineering': ['测试', 'qa', '质量工程', '自动化测试', 'sdet'],
  'ai_ml/applied': ['机器学习', '深度学习', '大模型', 'llm', 'rag', 'nlp', '算法', '人工智能', 'pytorch', 'tensorflow', 'embedding', 'langchain'],
};

function corpus(input: { title: string; description: string; competencies: string[] }): string {
  return normalize(`${input.title}\n${input.description ?? ''}\n${(input.competencies ?? []).join('\n')}`);
}

/** ASCII token 用词边界匹配（避免 `go` 命中 `google`、`java` 命中 `javascript`）；CJK 用子串匹配。 */
function signalMatches(text: string, token: string): boolean {
  if (/^[A-Za-z0-9.+# ]+$/.test(token)) {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }
  return text.includes(token);
}

/** 规则分类：唯一 leaf 才返回（0 调用模型）；0 个或 ≥2 个 leaf 命中 → null。 */
export function classifyJobByRule(input: { title: string; description: string; competencies: string[] }): TaxonomyLeaf | null {
  const text = corpus(input);
  const hits = TAXONOMY_V1_LEAVES.filter((leaf) => RULE_SIGNALS[leaf].some((t) => signalMatches(text, t)));
  return hits.length === 1 ? hits[0]! : null;
}

export type ValidateJobRouteOutputResult =
  | { ok: true; allocations: JobRouteAllocation[]; confidenceBps: number; marginBps: number }
  | { ok: false; reasons: string[] };

/**
 * 模型输出的服务端双重校验（schema → business）。返回的 reasons 是精确原因码：
 *   invalid_schema / taxonomy_invalid / calibration_failed / too_broad / low_confidence / conflict。
 * facet 兼容性在 RAG-03 阶段无数据可校验，显式延后：facet 维度只存在于 RAG-01/02 的
 * QuestionArtifactMetadata / serving_scope（题面工件元数据，非岗位语义），本模块输入合同
 * （title/description/competencies 的 digest + leaf allocations）不含 facet 字段，也无可交叉
 * 核对的 leaf→facet 定义，故延后至 RAG-04 serving_scope 消费时（检索/evidence 二次校验）再验证。
 * 不宣称「结构上已满足」——合同里没有 facet 字段等于没有 facet 校验。
 */
export function validateModelRouteOutput(output: JobRouteModelOutput): ValidateJobRouteOutputResult {
  const reasons: string[] = [];
  const push = (r: string) => { if (!reasons.includes(r)) reasons.push(r); };

  if (!output || typeof output !== 'object' || !Array.isArray(output.allocations)) {
    return { ok: false, reasons: ['invalid_schema'] };
  }
  const allocs = output.allocations;
  if (allocs.length < 1) return { ok: false, reasons: ['invalid_schema'] };
  if (allocs.length > JOB_ROUTE_MAX_LEAVES) push('too_broad');

  const seen = new Set<string>();
  let sum = 0;
  for (const a of allocs) {
    if (!a || typeof a !== 'object' || typeof a.leafTrackId !== 'string' || !LEAF_RE.test(a.leafTrackId)) { push('invalid_schema'); continue; }
    if (!(TAXONOMY_V1_LEAVES as readonly string[]).includes(a.leafTrackId)) push('taxonomy_invalid');
    if (seen.has(a.leafTrackId)) push('too_broad'); // 同 bucket 拆两份 = 歧义
    seen.add(a.leafTrackId);
    if (!Number.isInteger(a.allocationBps) || a.allocationBps <= 0) push('invalid_schema');
    else {
      sum += a.allocationBps;
      if (a.allocationBps < JOB_ROUTE_MIN_ALLOCATION_BPS) push('calibration_failed');
    }
  }
  if (sum !== JOB_ROUTE_TOTAL_BPS) push('invalid_schema'); // 万分之一之和必须恰为 10000
  if (!Number.isInteger(output.confidenceBps) || output.confidenceBps < 0 || output.confidenceBps > JOB_ROUTE_TOTAL_BPS) push('invalid_schema');
  else if (output.confidenceBps < JOB_ROUTE_CONFIDENCE_THRESHOLD_BPS) push('low_confidence');
  if (!Number.isInteger(output.marginBps) || output.marginBps < 0 || output.marginBps > JOB_ROUTE_TOTAL_BPS) push('invalid_schema');
  if (!Array.isArray(output.reasonCodes) || output.reasonCodes.some((r) => typeof r !== 'string')) push('invalid_schema');
  if (output.reasonCodes.length > 0) push('conflict'); // 模型主动含原因码 = 拒绝，不是成功输出

  if (reasons.length > 0) return { ok: false, reasons };

  // margin 必须与 allocations 的 top1-top2 差距一致：防止模型报高 margin 但实际近似打平。
  const sorted = [...allocs].sort((a, b) => b.allocationBps - a.allocationBps);
  const gap = sorted[0]!.allocationBps - (sorted.length > 1 ? sorted[1]!.allocationBps : JOB_ROUTE_TOTAL_BPS);
  if (output.marginBps !== gap) return { ok: false, reasons: ['conflict'] };
  if (output.marginBps < JOB_ROUTE_MARGIN_THRESHOLD_BPS) return { ok: false, reasons: ['conflict'] };

  return {
    ok: true,
    allocations: allocs.map((a) => ({ leafTrackId: a.leafTrackId, allocationBps: a.allocationBps })),
    confidenceBps: output.confidenceBps,
    marginBps: output.marginBps,
  };
}

/**
 * 决策内容哈希：把 (job, revision, taxonomy/policy 版本, allocations, confidence/margin,
 * attempt_outcome, reason_codes) 钉死，binding/snapshot 的 route_digest 即此哈希的副本。
 */
export function jobRouteDecisionHash(input: {
  jobId: string; revision: number; taxonomyVersion: string; policyVersion: string;
  allocations: JobRouteAllocation[]; confidenceBps: number | null; marginBps: number | null;
  attemptOutcome: string; reasonCodes: string[];
}): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'job-route-decision:v1',
    jobId: input.jobId,
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

/** 图内 planner 的输出合同：服务端必须校验 leaf 属于 snapshot、difficulty 1..5、competencyId 形状。 */
export interface InterviewPlannerOutput { leafTrackId: string; competencyId: string; difficulty: number }

export function validatePlannerOutput(
  output: InterviewPlannerOutput,
  snapshotAllocations: readonly JobRouteAllocation[],
): { ok: true } | { ok: false; reason: string } {
  if (!output || typeof output !== 'object') return { ok: false, reason: 'invalid_schema' };
  if (!snapshotAllocations.some((a) => a.leafTrackId === output.leafTrackId)) return { ok: false, reason: 'leaf_not_in_snapshot' };
  if (typeof output.competencyId !== 'string' || output.competencyId.length < 1 || output.competencyId.length > 64
    || /[\u0000-\u001f\u007f]/.test(output.competencyId)) return { ok: false, reason: 'competency_invalid' };
  if (!Number.isInteger(output.difficulty) || output.difficulty < 1 || output.difficulty > 5) return { ok: false, reason: 'difficulty_invalid' };
  return { ok: true };
}

/**
 * 确定性 weighted-deficit 选择器（DRR 风格）：每轮给每个 leaf 累加其 allocationBps，选 deficit 最大者
 * （并列取最小下标 = 不可变序），选中的减去总权重 10000。多桶岗位按轮配额收敛，而非一次混合检索。
 */
export function nextWeightedDeficitLeaf(
  allocations: readonly JobRouteAllocation[],
  deficit: readonly number[],
): { leafIndex: number; deficit: number[] } {
  if (allocations.length === 0) throw new Error('job_route_empty_allocations');
  if (deficit.length !== allocations.length) throw new Error('job_route_deficit_length_mismatch');
  const total = allocations.reduce((s, a) => s + a.allocationBps, 0);
  const next = allocations.map((a, i) => (deficit[i] ?? 0) + a.allocationBps);
  let best = 0;
  for (let i = 1; i < next.length; i++) if (next[i]! > next[best]!) best = i;
  next[best] = next[best]! - total;
  return { leafIndex: best, deficit: next };
}

/** 跑 `rounds` 轮，返回每轮选中的 leaf 下标序列（proof 用，确认配额比例）。 */
export function planWeightedDeficitRounds(allocations: readonly JobRouteAllocation[], rounds: number): number[] {
  const out: number[] = [];
  let deficit = allocations.map(() => 0);
  for (let i = 0; i < rounds; i++) {
    const step = nextWeightedDeficitLeaf(allocations, deficit);
    out.push(step.leafIndex);
    deficit = step.deficit;
  }
  return out;
}
