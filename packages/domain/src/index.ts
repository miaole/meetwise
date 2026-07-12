/**
 * @meetwise/domain — 纯领域逻辑（零 IO、零模型、零 db）。可被 ai-graphs 在节点里安全调用。
 * S2 摄取清洗 + factuality 歪曲门。此前住在 kernel/ingest.ts。
 */
export interface ProfileItem { text: string; line: number }
export interface ResumeProfile {
  experience: ProfileItem[];
  skills: ProfileItem[];
  facts: string[];                                  // 接地事实集（factuality 用）
  pii: { field: string; masked: string; line: number }[];
  blocked: { line: number; reason: string; raw: string }[];
}

// 先 NFKC 归一（全角数字 １→1 等），再匹配——否则全角/分隔符 PII 绕过去（审计 P0-3）。
const normalize = (t: string) => t.normalize('NFKC');
const PII = [
  // 手机：两式——带 86 前缀(吃掉前缀,无需 lookbehind) 或 裸 11 位(lookbehind 防黏连)。否则 +86 会被 86 的 '6' 顶掉 lookbehind 漏掉。
  { field: 'phone', re: /(?:\+?86[-\s]?)1[3-9]\d{9}(?!\d)|(?<!\d)1[3-9]\d{9}(?!\d)/g },
  // 邮箱：local-part 容许 unicode（用户@…），否则中文 local 漏（审计 P0-3）
  { field: 'email', re: /[^\s@]+@[^\s@]+\.[^\s@]+/g },
  // 证件：18 位（末位可 X）或 15 位旧号
  { field: 'idcard', re: /(?<!\d)(?:\d{17}[\dXx]|\d{15})(?!\d)/g },
];
const INJECTION = [/忽略.*(指令|以上|前面|上述)/, /ignore (previous|above|all)/i, /给(我)?(满分|高分|100)/, /system\s*[:：]/i, /你现在是/];

const mask = (v: string) => (v.length <= 4 ? '***' : v.slice(0, 2) + '***' + v.slice(-2));
// 兜底（fail-closed）：**任意非字母数字分隔符**（点/顿号/斜杠/下划线/空格/横杠…）拆开的 ≥11 位数字串一律脱敏。
// 只认空格/横杠会被 138.0013.8000、138、0013… 绕过（审计 P0-3 separator-evasion）。分隔符跨度限 0-3 防跨号合并。
// 追踪(低危,审计 round3)：逐行处理,被真换行拆成两半的号码不被本行兜底命中（半截各自非可用 PII;真实仅复制粘贴残片）。
const redactResidualDigits = (s: string) => s.replace(/\d(?:[^0-9A-Za-z]{0,3}\d){10,}/g, '[已脱敏]');
const stripPii = (t: string) => redactResidualDigits(PII.reduce((s, p) => s.replace(p.re, '[已脱敏]'), normalize(t)));

/** 原始简历文本 → 结构化 ResumeProfile。注入即拦（不进结构化、不喂模型）；PII 标记并脱敏，绝不存原文。 */
export function ingestResume(raw: string): ResumeProfile {
  const p: ResumeProfile = { experience: [], skills: [], facts: [], pii: [], blocked: [] };
  let section: 'experience' | 'skills' | 'other' = 'other';
  raw.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (!t) return;
    const ln = i + 1;
    const nt = normalize(t);
    // PII 标记先于注入判定（注入行也可能含 PII，否则计数漏；存脱敏值，绝不存原文）
    for (const pat of PII) { const m = nt.match(pat.re); if (m) for (const v of m) p.pii.push({ field: pat.field, masked: mask(v), line: ln }); }
    // 不可信输入：注入即拦，不进结构化、不喂模型；raw 也脱敏（防被日志带出 PII，审计 P2-10）
    for (const re of INJECTION) if (re.test(nt)) { p.blocked.push({ line: ln, reason: 'suspected_injection', raw: stripPii(t) }); return; }
    if (/(经历|经验|experience)/i.test(t) && t.length < 12) { section = 'experience'; return; }
    if (/(技能|skills)/i.test(t) && t.length < 10) { section = 'skills'; return; }
    if (/(教育|项目|联系|education|project|contact)/i.test(t) && t.length < 12) { section = 'other'; return; }
    const clean = stripPii(t);
    if (section === 'experience') { p.experience.push({ text: clean, line: ln }); p.facts.push(clean); }
    else if (section === 'skills') {
      clean.split(/[、,，/]/).map((s) => s.trim()).filter(Boolean).forEach((s) => { p.skills.push({ text: s, line: ln }); p.facts.push(s); });
    }
  });
  return p;
}

/** factuality 歪曲门：每个 ref 必须是某条 fact 的子串（最小长度防短词误命中），否则判幻觉/歪曲。
 *  护栏只能单向 ref ⊆ fact——反向会放过"精通Redis集群运维三年"这类真词包装的假声明（审计 H11）。 */
export function groundedByFacts(refs: string[], facts: string[]): boolean {
  return refs.every((r) => r.trim().length >= 2 && facts.some((f) => f.includes(r)));
}

// B 端题库安全（反窃取 / 反注入）
export { sampleQuestions, candidateView, containsBankSecret } from './bank-security.ts';
export type { BankQuestion } from './bank-security.ts';

// 认证核心（密码哈希 + 会话令牌）
export { hashPassword, verifyPassword, signToken, verifyToken } from './auth.ts';

// 能力评估
export { deriveAssessment } from './assessment.ts';
export type { AssessTurn, Dimension, Assessment } from './assessment.ts';

// 学习计划
export { deriveLearningPlan } from './learning.ts';
export type { LearnItem, LearningPlan } from './learning.ts';

// 职业路径
export { deriveCareerPath } from './career.ts';
export type { Milestone, CareerPath } from './career.ts';

// 成长档案/能力曲线（读侧聚合,纯逻辑）
export { deriveGrowth, toGrowthRow } from './growth.ts';
export type { GrowthRow, GrowthDim, GrowthPoint, GrowthTrend, GrowthView } from './growth.ts';

export {
  initMind, ingestAssessment, decideNext, withCurrent,
  isSkip, isNonAnswer, stripScoringManipulation, classifyTurn, markClarify, markUnresolved, clarifyHint, MAX_CLARIFY, MAX_PROBE,
  toCompetencySpecs, BEHAVIORAL_COMPETENCY,
  type InterviewMind, type Competency, type CompetencySpec, type NextAction, type QuestionKind, type TurnSignal, type TurnVerdict,
} from './adaptive-interview.ts';

export { isVerbatimCopy, validateGrounded, type SourceDoc, type GroundedQuestion, type GroundResult } from './grounded-questions.ts';

export { gradeRetrieval, cragRetrieve, type ScoredRef, type CragAction, type CragVerdict, type CragDeps } from './crag.ts';

export { critiqueQuestion, type QuestionCritique } from './question-critique.ts';
// 简历多格式提取 + 清洗(PDF/Word/图片→文本)
export { extractResumeText, cleanResumeText, detectResumeFormat, type ResumeFileFormat } from './resume-extract.ts';

export { isAllowed, isPrivateHost, extractMaterial, webExplore, createSafeFetch, type AllowedSource, type FetchFn, type FetchedPage, type RawFetch, type RawResponse, type SafeFetchOpts } from './web-explore.ts';
