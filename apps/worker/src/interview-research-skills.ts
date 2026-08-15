/**
 * 面试图的“内部 skills”不是模型可任意命名、任意执行的插件系统。
 *
 * 只有这三个静态、只读、无副作用的能力可被 graph 的确定性检索分支调用：
 *   - rag.retrieve：owner-scoped 本地题库召回
 *   - web.explore：单层 allowlist 探索（兼容/降级 seam）
 *   - deep.research：有界多源 allowlist 取证
 *
 * 未登记 skill、超长/控制字符 query、未启用网络能力和每个 job 的调用预算耗尽都返回空
 * 结果，绝不退化为“把名称交给 shell/HTTP/ToolRegistry 试试看”。钱、用户资料写入、支付
 * 和任何 effectful action 均不在此目录中。
 */
import { classifyInterviewResearchBoundary, normalizeResearchQuery, type ResearchBoundaryDecision, type ScoredRef, type SourceDoc } from '@meetwise/domain';

export const INTERVIEW_RESEARCH_SKILLS = ['rag.retrieve', 'web.explore', 'deep.research'] as const;
export type InterviewResearchSkill = (typeof INTERVIEW_RESEARCH_SKILLS)[number];

export interface InterviewResearchSkillDeps {
  localRetrieve: (query: string) => Promise<ScoredRef[]>;
  webExplore: (query: string) => Promise<SourceDoc[]>;
  deepResearch?: (query: string) => Promise<SourceDoc[]>;
}

export interface InterviewResearchSkillPolicy {
  /** 只接受固定目录中的 id；未知值被忽略而不是被动态加载。 */
  enabled?: readonly string[];
  /** 一个 interview job 至多生成一个 pending question；默认一次深检索足够。 */
  maxCallsPerSkill?: Partial<Record<InterviewResearchSkill, number>>;
  maxQueryChars?: number;
}

export interface InterviewResearchSkills {
  readonly enabled: ReadonlySet<InterviewResearchSkill>;
  isEnabled(skill: string): skill is InterviewResearchSkill;
  researchBoundary(query: string): ResearchBoundaryDecision;
  retrieve(query: string): Promise<ScoredRef[]>;
  exploreWeb(query: string): Promise<SourceDoc[]>;
  deepResearch(query: string): Promise<SourceDoc[]>;
}

const DEFAULT_ENABLED: readonly InterviewResearchSkill[] = ['rag.retrieve', 'web.explore'];
const DEFAULT_CALLS: Record<InterviewResearchSkill, number> = {
  'rag.retrieve': 1,
  'web.explore': 1,
  'deep.research': 1,
};

function toPositiveInt(value: number | undefined, fallback: number): number {
  return Number.isInteger(value) && (value as number) > 0 && (value as number) <= 8 ? value as number : fallback;
}

/** 每次 consumer 领取 job 时创建，预算不会跨用户或跨面试共享。 */
export function createInterviewResearchSkills(
  deps: InterviewResearchSkillDeps, policy: InterviewResearchSkillPolicy = {},
): InterviewResearchSkills {
  const requested = policy.enabled ?? [
    ...DEFAULT_ENABLED,
    ...(deps.deepResearch ? ['deep.research'] : []),
  ];
  const enabled = new Set<InterviewResearchSkill>(
    requested.filter((value): value is InterviewResearchSkill => (INTERVIEW_RESEARCH_SKILLS as readonly string[]).includes(value)),
  );
  if (!deps.deepResearch) enabled.delete('deep.research');
  const maxQueryChars = toPositiveInt(policy.maxQueryChars, 256);
  const remaining: Record<InterviewResearchSkill, number> = {
    'rag.retrieve': toPositiveInt(policy.maxCallsPerSkill?.['rag.retrieve'], DEFAULT_CALLS['rag.retrieve']),
    'web.explore': toPositiveInt(policy.maxCallsPerSkill?.['web.explore'], DEFAULT_CALLS['web.explore']),
    'deep.research': toPositiveInt(policy.maxCallsPerSkill?.['deep.research'], DEFAULT_CALLS['deep.research']),
  };

  const queryFor = (skill: InterviewResearchSkill, raw: string): string | null => {
    if (!enabled.has(skill) || remaining[skill] <= 0) return null;
    if (classifyInterviewResearchBoundary(raw).action !== 'allow') return null;
    const query = normalizeResearchQuery(raw, maxQueryChars);
    if (!query) return null;
    remaining[skill]--;
    return query;
  };
  const call = async <T>(skill: InterviewResearchSkill, raw: string, fn: (query: string) => Promise<T>): Promise<T | undefined> => {
    const query = queryFor(skill, raw);
    if (!query) return undefined;
    try { return await fn(query); } catch { return undefined; } // 检索是 fail-soft，不把源故障放大为面试失败。
  };

  return {
    enabled,
    isEnabled: (skill: string): skill is InterviewResearchSkill => enabled.has(skill as InterviewResearchSkill),
    researchBoundary: classifyInterviewResearchBoundary,
    async retrieve(raw) { return (await call('rag.retrieve', raw, deps.localRetrieve)) ?? []; },
    async exploreWeb(raw) { return (await call('web.explore', raw, deps.webExplore)) ?? []; },
    async deepResearch(raw) {
      if (!deps.deepResearch) return [];
      return (await call('deep.research', raw, deps.deepResearch)) ?? [];
    },
  };
}
