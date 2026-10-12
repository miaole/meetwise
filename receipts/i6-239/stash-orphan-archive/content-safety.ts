/**
 * I6 #239（D6 合规最低集）· 内容安全单源：②危机/自伤话术确定性触发词表 + 固定处置文案 + 转介信息。
 *
 * 边界（REQUEST §1②/§3-1·逐字承卷）：
 * - **不做 safety_hold 状态机、辱骂分级路由**——本模块只有「词表→命中布尔→固定文案」三条确定性映射，
 *   无状态枚举、无会话态、无新表、无迁移（§2-2 负断言钉死面）。
 * - 零 I/O、零模型外呼、零 env 依赖（①kill-switch 的 env 闸在 apps/api/src/platform/content-safety.ts，
 *   本模块只供 ② 的词面与文案单源）。
 * - 消费面：api `interview.service.ts` turn 口（命中 → 503+固定文案，privacy.service.ts:70
 *   HttpException/SERVICE_UNAVAILABLE 形）+ worker `interview-service.ts` invokeEvaluationOnce 头部
 *   纵深闸（命中 → 不派模型、固定码失败收口）+ web 渲染层（InterviewPanel 警示区形固定文案——
 *   web 不依赖本包，文案经 apps/web/test/web-logic.proof.ts 静态同文断言与本单源钉死）。
 * - 转介信息措辞=法务复核保留项（issues-master :314 硬依赖列「措辞建议法务复核，保留」·不阻塞开工）：
 *   文案只指现实存在的公共求助渠道（12356 心理援助热线/110/120），不冒充正式医疗或心理服务承诺（Ban 面）。
 */

/** ② 确定性触发词表（词表=裁决项②·最小可执行集）：只收直接危机/自伤表达，不做分级、不做模糊扩展——
 *  防误伤正常技术作答（如安全领域「防自伤式请求」类措辞不在此列）。比对前统一小写（英文大小写无关）。 */
export const CONTENT_SAFETY_CRISIS_TERMS: readonly string[] = [
  // 直接自伤/自杀表达（zh）
  '自杀',
  '自残',
  '自伤',
  '轻生',
  '想死',
  '不想活',
  '活不下去',
  '结束自己的生命',
  '结束生命',
  '割腕',
  '自我了断',
  // 直接自伤/自杀表达（en·小写比对）
  'suicide',
  'kill myself',
  'end my life',
  'end it all',
  'self-harm',
  'self harm',
  'hurt myself',
];

/** 危机固定处置的确定性检测：命中返回首个命中的触发词，未命中返回 null。纯函数·零状态·可离线证。 */
export function detectCrisisTerms(text: string): string | null {
  const packed = String(text ?? '').toLowerCase();
  for (const term of CONTENT_SAFETY_CRISIS_TERMS) {
    if (packed.includes(term)) return term;
  }
  return null;
}

/** ② 固定处置错误码（api 503 体 error 码·worker 失败收口码·web 映射键三方同名单源）。 */
export const CONTENT_SAFETY_CRISIS_HOLD_CODE = 'content_safety_crisis_hold';

/** ② 固定处置文案+转介信息（逐字=裁决项②·web 渲染层与本单源静态同文断言钉死）：
 *  如实告知「未提交/未保存」（api 口在持久化前拒绝·worker 口不派模型零 trace 写），
 *  只给真实公共求助渠道，不承诺服务、不留死胡同。 */
export const CONTENT_SAFETY_CRISIS_DISPOSAL_MESSAGE =
  '如果你正处于情绪危机或有伤害自己的想法，请先照顾自己的安全：可以暂停练习，联系你信任的人，或拨打全国心理援助热线 12356；紧急情况请直接拨打 110 或 120。这条回答没有提交、也没有被保存，等你准备好了随时可以回来继续。';
