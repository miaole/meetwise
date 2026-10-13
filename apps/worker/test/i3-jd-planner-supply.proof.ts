/**
 * I3 JOB-MGMT §2-4 worker 臂 — JD/competencies 喂 planner 供给链 prove（静态源+纯函数·零 DB·零模型外呼）。
 * 断言三链在位（#197/#258·裁决⑥ 读侧 join 形）：
 *   ① prompt 注册表 v4：job 缺省 → buildData 与 v3 逐字节一致（resume-grounding B1/S1-1 同源守卫）；
 *      job 供给 → 渲染岗位段（competencies + JD 摘要·只进「考哪些能力」面）。
 *   ② consumer 改道条件化：多叶子按 allocationBps 最高权重取 primary（单叶=原 [0] 形等价）；
 *      供给读经 RLS+快照同源门（getJobPlannerInputForInterview）；JD 摘要有界截取 ≤400。
 *   ③ 透传链闭合：startAdaptiveInterview 第 5 参 → planCompetencies 第 8 参 → promptedModel job 键。
 *   ④ #259 透传线与 G-R2-5 fail-closed 门零冲突（两处源串原样在位）。
 *   ⑤ api 侧编辑/重试 wakeup 线（组合根先例）+ API 零 classifyJobRoute（r2 P-API 不变量不破）。
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrompt } from '@meetwise/ai-runtime';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..', '..');
const src = (rel: string) => readFileSync(join(repoRoot, rel), 'utf8');

function main() {
  // ── ① prompt 注册表（纯函数·buildData 产物断言非模型输出）──
  const p = getPrompt('planner.competencies');
  A('planner.competencies 版本随演 v3→v4（改 prompt=升 version 纪律）', p.version === 'v4', `version=${p.version}`);
  const absentJob = p.buildData({ role: '后端工程师', facts: ['F1', 'F2'] });
  A('job 缺省 → buildData 与 v3 输出逐字节一致（resume-grounding B1 守卫同源）',
    absentJob === '岗位:后端工程师\n简历事实:\nF1\nF2', JSON.stringify(absentJob));
  const withFocusOnly = p.buildData({ role: '后端工程师', facts: ['F1'], focusWeaknesses: ['并发'] });
  A('仅 focus 供给 → 与 v3 形态逐字节一致（focus 段原样）',
    withFocusOnly === '岗位:后端工程师\n简历事实:\nF1\n上一轮弱点标签(本人上场评估差距维度,须覆盖·仅提示考什么·非难度信号):并发',
    JSON.stringify(withFocusOnly));
  const withJob = p.buildData({ role: '后端工程师', facts: ['F1'], job: { competencies: ['高并发', '分布式锁'], jdSummary: '负责网关与限流' } });
  A('job 供给 → 渲染岗位段（competencies+JD 摘要·「考什么能力」提示·非难度信号）',
    withJob === '岗位:后端工程师\n简历事实:\nF1\n岗位要求(招聘方发布·仅提示考什么能力·非难度信号):目标能力:高并发;分布式锁 / JD 摘要:负责网关与限流',
    JSON.stringify(withJob));
  const withEmptyJob = p.buildData({ role: '后端工程师', facts: ['F1', 'F2'], job: { competencies: [], jdSummary: '  ' } });
  A('job 全空 → 段不渲染（与 v3 逐字节一致）', withEmptyJob === absentJob, JSON.stringify(withEmptyJob));

  // ── ② consumer 改道条件化 + 供给读（静态源断言）──
  const consumer = src('apps/worker/src/interview-consumer.ts');
  A('consumer 多叶子按权重取 primary（allocationBps 最高·reduce 确定性）',
    /allocations\.reduce\(\(best, a\) => \(a\.allocationBps > best\.allocationBps \? a : best\)\)/.test(consumer));
  A('consumer 供给读经 RLS+快照同源门（getJobPlannerInputForInterview）',
    /getJobPlannerInputForInterview\(c, owner, job\.interviewId\)/.test(consumer));
  A('consumer JD 摘要确定性有界截取（≤400 字·零模型）',
    /JD_SUMMARY_MAX_CHARS = 400/.test(consumer) && /\.slice\(0, JD_SUMMARY_MAX_CHARS\)/.test(consumer));
  A('consumer startAdaptiveInterview 透传第 5 参 jobPlannerContext',
    /startAdaptiveInterview\(life, role, admitted\.ok && admitted\.resumeProfileAvailable \? facts : \[\], focus, jobPlannerContext\)/.test(consumer));

  // ── ③ 透传链闭合（lifecycle→service→prompt vars）──[merge nail 随演:QP #200-A/#201 第 9/10 参 quizQuestions/routeLeaf 接龙在 job 后,正则随并线实态]
  const lifecycle = src('apps/worker/src/adaptive-lifecycle.ts');
  A('lifecycle planCompetencies 第 8 参透传 job',
    /planCompetencies\(d\.pool, d\.owner, d\.interviewId, d\.fastModel \?\? d\.model, role, plannerFacts, focus, job, d\.quizQuestions, d\.routeLeaf\)/.test(lifecycle));
  const service = src('apps/worker/src/adaptive-interview-service.ts');
  A('planCompetencies promptedModel vars 携带 job 键',
    /promptedModel\(model, 'planner\.competencies', \{ role, facts, focusWeaknesses: focus, job, quizQuestions \}\)/.test(service));

  // ── ④ #259 透传线与 G-R2-5 门零冲突（原样源串在位）──
  A('#259 透传线零触（roleFromUserInput: requestContext.targetRole 原样）',
    /roleFromUserInput: requestContext\.targetRole,/.test(consumer));
  A('G-R2-5 fail-closed 门零触（decideRouteSnapshotRetrieve 原样在位）',
    /const retrieveDecision = decideRouteSnapshotRetrieve\(routeSnapForRetrieve\);/.test(consumer));

  // ── ⑤ api 组合根 wakeup 线 + Worker 唯一 classify 不变量 ──
  const apiService = src('apps/api/src/modules/recruiter/recruiter.service.ts');
  A('api update/retryRoute 后 notifyWorkerJobWakeup（R2 P-API 组合根先例·编辑自动重路由链自通）',
    /await this\.db\.asPrincipal\(principal, \(c\) => notifyWorkerJobWakeup\(c\)\);/.test(apiService));
  A('api 零 classifyJobRoute（Worker 唯一调用方·r2 P-API 不变量）', !apiService.includes('classifyJobRoute('));
  const dbRecruiter = src('packages/db/src/recruiting/recruiter.ts');
  A('db retryJobRoute 只写新 revision 不调 classifyJobRoute（sticky 闸 :181 字节零改的前提）',
    /export async function retryJobRoute\(/.test(dbRecruiter) && !dbRecruiter.includes('classifyJobRoute('));

  console.log(`\n${failures === 0 ? '✓ i3-jd-supply:prove 全部通过' : '✗ ' + failures + ' 失败'}（JD→planner 供给链 · 静态源+纯函数 · 零外呼）`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
