'use server';
import { serverFetch } from '../../lib/api/server';
import { redirect } from 'next/navigation';
import { actionErrorMessage } from '../../lib/errors/action-error';

/** Server Action:选简历(+可选目标岗位) → POST /interview 创建 → /begin(resume-id 头,可选 target-role 头)启动 → 服务端跳转进会话。
 *  对齐 startQuizAction:逐步校验,失败给明确出口(回列表带错 / 去登录 / 明确不可用),
 *  绝不静默跳进 /interview/undefined 这种死会话页(无死胡同)。
 *  begin 非 2xx（除已处理的 402）也必须回列表带错——禁止带着未预留的空壳进会话页（UC-E2E-018 UI abandon 前置）。
 *
 *  FENCE-REFLOW F2(#238 C 面):create 返回 `reused=true`（已有未结束练习面试被复用）→ 不盲 begin,
 *  透传复用信号回 /interviews 页渲染选择面（继续=进既有会话;放弃后重来=restartInterviewAction）。
 *  `reused=false` 时本函数行为与改前逐字段一致（byte 级不变）。
 *  FENCE-REFLOW F5(#253):begin 非 2xx（401 跳登录除外）→ 先 best-effort POST :id/abandon 回收空壳
 *  （'created' 无消费走 commerce NOT EXISTS 分支 → 'abandoned',列表显示「已结束」,不再残留幽灵「进入 →」）
 *  → 再带码 redirect;abandon 非 2xx 不阻塞、不重试。 */

/** F5 空壳回收:best-effort abandon（失败/网络错均不阻塞）→ 必达一次带码 redirect。 */
async function reclaimShellAndRedirect(interviewId: string, code: string): Promise<never> {
  await serverFetch('/interview/' + interviewId + '/abandon', { method: 'POST' }).catch(() => null);
  redirect(`/interviews?error=${encodeURIComponent(code)}`);   // begin 失败 → 回列表带码,不进未预留死会话
}

/** begin 非 2xx 的 body 错误码解析（码解析面与改前一致：映射命中透传原码,否则 begin_failed 兜底）。 */
async function beginErrorCode(res: Response): Promise<string> {
  const body: { error?: unknown } = await res.json().catch(() => ({}));
  const raw = typeof body.error === 'string' ? body.error : '';
  return raw !== '' && actionErrorMessage('interviews', 0, raw) ? raw : 'begin_failed';
}

export async function startInterviewAction(formData: FormData) {
  const resumeId = String(formData.get('resumeId') ?? '');
  // #259 目标岗位:trim 归一;空/缺省 → 不发 target-role 头(与现状逐字节一致)。镜像 diagnosis/actions 同形制。
  const targetRole = String(formData.get('targetRole') ?? '').trim();
  // QBANK-PLANNER-HONESTY #200-A ⑴:源押题标识(QuizPanel 入口 ?quiz= → 页面隐藏域);trim 归一;
  // 空/缺省 → 不发 quiz-id 头(与现状逐字节一致,#259 同纪律)。api begin 守卫 owner-scoped 消费
  // (他主 → 404 带码回列表),worker 读题面进 planner——「用这些题去模拟面试」宣称与实现对齐。
  const quizId = String(formData.get('quizId') ?? '').trim();
  if (!resumeId) return;
  const created = await serverFetch('/interview', { method: 'POST', body: '{}' });
  if (created.status === 401) redirect('/login?expired=1');
  if (!created.ok) redirect('/interviews?error=create_failed');          // 创建失败 → 回列表带错,不进 /interview/undefined
  const createdBody: { interviewId?: string; reused?: boolean } = await created.json().catch(() => ({ interviewId: undefined }));
  const interviewId = createdBody.interviewId;
  if (!interviewId) redirect('/interviews?error=create_failed');
  if (createdBody.reused === true) redirect(`/interviews?reused=${encodeURIComponent(interviewId)}`);   // F2:复用信号透传 → 列表页选择面（两出口,不新增第三文案）
  const headers: Record<string, string> = { 'resume-id': resumeId };
  if (targetRole) headers['target-role'] = targetRole;                   // 非空才增头(空串不发头=现状字节,#259)
  if (quizId) headers['quiz-id'] = quizId;                               // 非空才增头(#200-A·同纪律;零新表零新列,修法 A 零迁移)
  const begin = await serverFetch('/interview/' + interviewId + '/begin', { method: 'POST', headers });
  if (begin.status === 402) await reclaimShellAndRedirect(interviewId, 'credits_unavailable');   // 402 分支码面不变;F5 先回收空壳
  if (begin.status === 401) redirect('/login?expired=1');
  if (!begin.ok) {
    // #251 折叠点解除：begin 确定性 409/503 的 body error 码透传回列表（码必达页面不折叠丢失），
    // 不可解析/未映射 → begin_failed 兜底（原文不变）。F5：先回收空壳再带码 redirect（不重试）。
    const code = await beginErrorCode(begin);
    await reclaimShellAndRedirect(interviewId, code);
  }
  redirect('/interview/' + interviewId);
}

/** F2 选择面出口②「放弃后重来」:POST :id/abandon 放弃既有未结束面试（成功才继续）→ 重跑 create+begin 全新会话。
 *  abandon 失败 → 回列表带码（映射命中透传,否则 create_failed 兜底）——绝不带着未放弃的旧会话新建（否则 F1 三过滤下 create 仍复用旧会话,原地打转）。 */
export async function restartInterviewAction(formData: FormData) {
  const resumeId = String(formData.get('resumeId') ?? '');
  const priorId = String(formData.get('priorInterviewId') ?? '');
  if (!resumeId || !priorId) return;
  const abandoned = await serverFetch('/interview/' + priorId + '/abandon', { method: 'POST' }).catch(() => null);
  if (abandoned?.status === 401) redirect('/login?expired=1');
  if (!abandoned || !abandoned.ok) {
    const body: { error?: unknown } = abandoned ? await abandoned.json().catch(() => ({})) : {};
    const raw = typeof body.error === 'string' ? body.error : '';
    const code = raw !== '' && actionErrorMessage('interviews', 0, raw) ? raw : 'create_failed';
    redirect(`/interviews?error=${encodeURIComponent(code)}`);   // 放弃失败 → 回列表带错（放弃后重来未发生）
  }
  await startInterviewAction(formData);   // 重跑 create+begin:旧会话已 abandon(F1 三过滤下 create 不再复用)→ 新面试
}

/**
 * H4 R1/R4（#252/#214 弱项闭环入口·报告页 AssessmentSection「再练这 N 个弱项」+ LearningSection 每项「去练」共用）：
 * 携 focus（弱项标签数组,JSON 文本=报告页 gap 维度名/学习项 topic·上限=本场 gap 数,页侧派生）→
 * 既有 create+begin 链（同简历 resume-id 头+focus 头）。走本文件同一私有回收/码面助手（零复制零新导航模式）：
 * reused=true → 列表页既有选择面；begin 非 2xx → 先回收空壳再带码回列表；focus 缺失/畸形 → 不开面（防御,
 * 入口只在 gap>0 时渲染,此处兜底）。
 */
export async function startFocusRetrainAction(formData: FormData) {
  const resumeId = String(formData.get('resumeId') ?? '');
  let labels: string[] = [];
  try {
    const parsed: unknown = JSON.parse(String(formData.get('focus') ?? ''));
    if (Array.isArray(parsed)) labels = parsed.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
  } catch { labels = []; }   // 畸形 focus → 空集 → 不开面(专项面绝不以无 focus 形态静默开通用面误导)
  if (!resumeId || labels.length === 0) return;
  const created = await serverFetch('/interview', { method: 'POST', body: '{}' });
  if (created.status === 401) redirect('/login?expired=1');
  if (!created.ok) redirect('/interviews?error=create_failed');
  const createdBody: { interviewId?: string; reused?: boolean } = await created.json().catch(() => ({ interviewId: undefined }));
  const interviewId = createdBody.interviewId;
  if (!interviewId) redirect('/interviews?error=create_failed');
  if (createdBody.reused === true) redirect(`/interviews?reused=${encodeURIComponent(interviewId)}`);   // 复用信号 → 既有选择面(零新模式)
  // focus 非空才发头(空集不发头=现状字节,#259 target-role 同形制);JSON 数组文本,api 侧 normalizeFocusHeader 白名单消费。
  const headers: Record<string, string> = { 'resume-id': resumeId, focus: JSON.stringify(labels) };
  const begin = await serverFetch('/interview/' + interviewId + '/begin', { method: 'POST', headers });
  if (begin.status === 402) await reclaimShellAndRedirect(interviewId, 'credits_unavailable');
  if (begin.status === 401) redirect('/login?expired=1');
  if (!begin.ok) {
    const code = await beginErrorCode(begin);
    await reclaimShellAndRedirect(interviewId, code);
  }
  redirect('/interview/' + interviewId);
}
