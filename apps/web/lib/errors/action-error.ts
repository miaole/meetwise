/**
 * actionErrorMessage —— #250/#251/#224 错误文案映射刀（蓝本=errmsg-map-REQUEST.md @2e942ace rev2）。
 * 纯字符串面、零依赖（沿 lib/jobs/application-start-error.ts 同型先例）：server action 与 RSC 页面共用，
 * 离线可证（web-logic.proof.ts 纯函数输出断言，非浏览器 DOM 证明）。
 *
 * redirect 通道只携码不携 status——码表内自带 status 归属（402 家族四码等）；`status` 形参服务非码通道
 * 与防御（503 行含「及其余 503」，无码/status 通道也落「服务暂不可用」）。返回 null=该码在此页无渲染面
 * （四页不渲染空壳）。
 *
 * rev2 E2 页域签名：create_failed 三页异文案（原文一字不改）；interviews 专属 begin_failed 文案不跨页，
 * quiz/diagnosis 的 begin 未映射兜底=各页 create_failed 文案（C7 redirect 侧写 create_failed，本函数对
 * begin_failed 也按页域归一到各页 create_failed 文案——防御性 superset，EXEC 择「保留注记」）。
 */

export type ActionErrorPage = 'interviews' | 'quiz' | 'diagnosis' | 'jobs';

export interface ActionErrorMessage {
  text: string;
  href?: string;
  note?: string;
}

// ── 402 行（额度不足；映射表全四码，文案页域无关）──────────────────────────────
const CREDITS_402_CODES: ReadonlySet<string> = new Set([
  'insufficient_entitlement',            // interview/quiz/diagnosis service 额度 saga（402）
  'credits_unavailable',                 // interviews/quiz/diagnosis actions 402 redirect
  'apply_credits_unavailable',           // jobs actions applyAction 402 redirect（#224）
  'interview_credits_unavailable',       // jobs actions startApplicationAction 402 redirect
]);
const CREDITS_TEXT = '额度不足，请前往『额度说明』查看获取方式';   // 蓝本「额度不足，去哪里获取」定稿页面化
const CREDITS_NOTE = '预览环境暂未开放购买';                      // 如实注记（billing 关闭期锚），无购买承诺
const PRICING_HREF = '/pricing';                                 // 充值入口=既有站内说明页（≠充值可用）

// ── 409 行（interview begin 确定性冲突；interviews 页域专属）──────────────────
const ROUTE_UNDECIDED_TEXT = '暂时无法判断岗位方向';              // rev3 后结构性不可达，映射行保留防御
const BINDING_CONFLICT_TEXT = '你有一场未结束的面试：继续/放弃后重来';
// （E1 出口注：继续=列表「进入 →」按钮；放弃=进会话后 InterviewPanel「放弃」+确认弹层（放弃退还额度）
//  ——两跳可达，页面自身即 /interviews 列表，故本行不带链接。）

// ── 503 行 ────────────────────────────────────────────────────────────────
const SERVICE_UNAVAILABLE_TEXT = '服务暂不可用';

// ── 兜底行（原文一字不改，逐字照抄各页现状 @2e942ace）─────────────────────────
const CREATE_FAILED_TEXT: Record<Exclude<ActionErrorPage, 'jobs'>, string> = {
  interviews: '创建面试失败,请稍后重试;若反复出现请确认额度与网络。',
  quiz: '创建押题失败,请稍后重试;若反复出现请确认额度与网络。',
  diagnosis: '创建诊断失败,请稍后重试;若反复出现请确认额度与网络。',
};
const INTERVIEWS_BEGIN_FAILED_TEXT = '启动面试失败（未预留额度）,请稍后重试;不会进入空会话。'; // 仅 interviews，不跨页

// ── 防御行（begin 确定性 409 专码：码透传必达页面不折叠丢失，文案落兜底原文）────
const INTERVIEW_BEGIN_DEFENSIVE_CODES: ReadonlySet<string> = new Set([
  'interview_resume_binding_unavailable',
  'legacy_resume_reference_unavailable',
  'resume_version_mismatch',
  'interview_not_active',
]);
const QUIZ_BEGIN_DEFENSIVE_CODES: ReadonlySet<string> = new Set([
  'resume_not_found_or_not_ready',
  'quiz_resume_reference_conflict',
]);
const DIAGNOSIS_BEGIN_DEFENSIVE_CODES: ReadonlySet<string> = new Set([
  'resume_not_found_or_not_ready',
  'diagnosis_resume_reference_conflict',
]);

/** 映射表逐码（§1③ 全文）：页域化 `actionErrorMessage(page, status, code)`。未知码→null（不渲染空壳）。 */
export function actionErrorMessage(page: ActionErrorPage, status: number, code: string | null): ActionErrorMessage | null {
  if (code !== null && CREDITS_402_CODES.has(code)) {
    return { text: CREDITS_TEXT, href: PRICING_HREF, note: CREDITS_NOTE };        // 402 行（四页同文案）
  }
  if (page === 'interviews') {
    if (code === 'candidate_route_undecided') return { text: ROUTE_UNDECIDED_TEXT };
    if (code === 'interview_resume_binding_conflict') return { text: BINDING_CONFLICT_TEXT };
    if (code === 'create_failed') return { text: CREATE_FAILED_TEXT.interviews };
    if (code === 'begin_failed' || (code !== null && INTERVIEW_BEGIN_DEFENSIVE_CODES.has(code))) {
      return { text: INTERVIEWS_BEGIN_FAILED_TEXT };
    }
  } else if (page === 'quiz' || page === 'diagnosis') {
    // quiz/diagnosis：create_failed 兜底文案；begin_failed/防御码按 rev2 E2 归一到本页 create_failed 文案
    if (
      code === 'create_failed' || code === 'begin_failed'
      || (code !== null && (page === 'quiz' ? QUIZ_BEGIN_DEFENSIVE_CODES : DIAGNOSIS_BEGIN_DEFENSIVE_CODES).has(code))
    ) {
      return { text: CREATE_FAILED_TEXT[page] };
    }
  } // jobs：无专属行（redirect 通道只写 402 家族，#224 渲染面即 402 行）
  if (code === 'public_preview_read_only' || status === 503) return { text: SERVICE_UNAVAILABLE_TEXT }; // 503 行（全局·含「及其余 503」）
  return null;                                                                    // 未知码：无渲染面
}
