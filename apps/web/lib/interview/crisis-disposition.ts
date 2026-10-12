/**
 * D6 合规最低集 #239-②：危机/自伤话术固定处置——web 侧触发词面与固定处置文案。
 * 与 `@meetwise/domain` `crisis-disposition` 合同对齐（**不引入 domain 包**，
 * 沿 apps/web/lib/stream/scoring-honesty.ts 同款先例）；两侧词表同源同形，
 * web 层在提交口本地确定性拦截，worker 层 invokeEvaluationOnce 同词表兜底。
 * 纯函数零状态机：无会话态、无升级态、无新表。
 * 文案 = 法务复核保留项（保留不阻塞开工）：只指向公开求助渠道，
 * 不冒充正式医疗/心理服务承诺，不承诺任何服务效果。
 */

/** 确定性触发词面（zh/en）——与 domain CRISIS_TRIGGER_PATTERNS 逐条对齐，改一侧必改另一侧。 */
export const CRISIS_TRIGGER_PATTERNS: readonly RegExp[] = [
  /自杀/,
  /自残/,
  /自伤/,
  /轻生/,
  /想死/,
  /不想活/,
  /活不下去/,
  /结束(?:自己的)?(?:生命|性命)/,
  /伤害(?:我)?自己/,
  /了结自己/,
  /suicid/i,
  /self[- ]?harm/i,
  /self[- ]?injur/i,
  /kill myself/i,
  /end my life/i,
  /want to die/i,
  /hurting myself/i,
];

/** 纯函数判定：作答文本命中任一危机触发词面即 true。空/非字符串恒 false。 */
export function matchesCrisisTrigger(text: string): boolean {
  const t = String(text ?? '');
  if (!t) return false;
  return CRISIS_TRIGGER_PATTERNS.some((re) => re.test(t));
}

/**
 * 固定处置文案（InterviewPanel 警示区渲染·zh 与面试面既有文案同形硬编码）。
 * 转介信息=全国统一心理援助热线 12356（24 小时）+紧急 120/就近急诊——公开事实。
 */
export const CRISIS_DISPOSITION_NOTICE_HEADING = '我们注意到你可能正处于艰难时刻';
export const CRISIS_DISPOSITION_NOTICE_BODY =
  '请优先照顾自己：可拨打全国统一心理援助热线 12356（24 小时）；紧急情况请拨打 120 或前往就近医院急诊。' +
  '本回答未提交评分，草稿仍保留在输入框，可修改后继续。';
