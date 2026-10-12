/**
 * D6 合规最低集 #239-②：危机/自伤话术固定处置（确定性触发词 + 固定处置 + 转介信息）。
 * 修法列原文「不做 safety_hold 状态机等重方案」——本模块是纯函数零状态机：
 * 无会话态、无升级态、无新枚举、无新表、零迁移、零模型调用。
 * 转介信息措辞 = 法务复核保留项（保留不阻塞开工）：热线号码为公开事实，本模块
 * 不冒充正式医疗/心理服务承诺，只指向公共求助渠道。
 */

/**
 * 确定性触发词面（zh/en）。词表 = 裁决②：字面正则即全部判定依据，
 * 命中即处置（不评分、不深挖、不再交模型）。误报方向宁可偏保守（固定处置
 * 只多给一次求助信息，不产生任何惩罚性后果）。
 */
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
 * 评分拒评原因码（worker invokeEvaluationOnce 前置扫描命中时随既有
 * failed→unscored 释放链收口用）。生命周期事件 reason 仍为固定字面量
 * evaluation_unscored（adaptive-lifecycle 不透传细分原因，现状零翻）。
 */
export const CRISIS_DISPOSITION_REASON = 'crisis_disposition' as const;
