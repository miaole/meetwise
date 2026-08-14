/**
 * Narrow egress policy for the interview-research capability.
 *
 * This is not a universal intent classifier and is deliberately not used to route ordinary RAG queries. It only
 * recognizes explicit high-risk requests for which sending the text to external research would be an unsafe side
 * effect. Ambiguous normal technical questions remain the responsibility of CRAG/RAG. Product flows that expose a
 * general assistant need their own approved intent/authorization contract; they must not reuse this tiny policy as
 * one.
 */
export type ResearchBoundaryDecision =
  | { action: 'allow' }
  | { action: 'refuse'; reason: 'financial_transfer' | 'discriminatory_hiring' | 'private_data_exfiltration' | 'personal_advice_out_of_scope' }
  | { action: 'deny_external'; reason: 'prompt_injection_or_tool_escalation' };

/**
 * The policy sees a display-normalized form: full-width characters and zero-width separators cannot evade a
 * clearly dangerous imperative.  We preserve a space-delimited form for readable phrase checks and a compact
 * form for Chinese/English separator evasion ("忽 略\u200b所 有 指 令").  This is intentionally a narrow egress
 * guard, not a semantic intent classifier or a reason to inspect/decode arbitrary user payloads.
 */
const compact = (s: string) => s.normalize('NFKC').toLowerCase()
  .replace(/[\u200b-\u200d\ufeff]/g, '')
  .replace(/[\s\u0000-\u001f]+/g, ' ').trim();
const compactTokens = (s: string) => compact(s).replace(/[\s\p{P}\p{S}_]/gu, '');

/** Pure, reviewable and fail-closed for clear irreversible/exfiltration requests. */
export function classifyInterviewResearchBoundary(raw: string): ResearchBoundaryDecision {
  const q = compact(raw);
  const packed = compactTokens(raw);
  if (!q) return { action: 'deny_external', reason: 'prompt_injection_or_tool_escalation' };
  // This permits questions about prevention/audit while still treating direct actions as capabilities the interview
  // research layer simply does not possess.  It is deliberately checked before data-exfiltration and injection.
  const asksForDefense = /(?:如何|怎样|为什么|解释|防止|隔离|检测|识别|审计|测试|防御|mitigat|prevent|detect|isolate)/.test(q);
  // "如何设计转账幂等" is a legitimate technical question.  Directly moving company funds, including
  // deliberately vague “把公司账上的钱打过去”, is not; only the latter loses research capability.
  const finance = /(?:银行卡|银行账户|余额|bank\s*(?:account|balance)|card\s*balance).{0,80}(?:转给|转账|transfer|汇款)|(?:转给|转账|transfer|汇款).{0,80}(?:银行卡|银行账户|余额|bank\s*(?:account|balance))/.test(q)
    || /(?:请|帮我|替我|立刻|马上|现在|把|将).{0,36}(?:公司|企业|组织).{0,32}(?:账上|账户|帐户|资金|钱|余额|款项).{0,48}(?:转给|转到|转账|打给|打到|汇给|汇款|transfer|wire)/.test(q)
    || /(?:company|corporate).{0,40}(?:funds?|money|account).{0,48}(?:transfer|wire|send).{0,48}(?:me|them|this)|(?:transfer|wire|send).{0,48}(?:company|corporate).{0,40}(?:funds?|money|account).{0,48}(?:me|them|this)/.test(q)
    || /(?:请把|帮我把|现在把|将)(?:公司|企业|组织)(?:账上|账户|帐户|资金|钱|余额|款项|balance).{0,48}(?:转给|转到|转账|打给|打到|汇给|汇款|transfer|wire)/.test(packed);
  if (finance) return { action: 'refuse', reason: 'financial_transfer' };
  const discriminatory = /(?:年龄|\d{1,3}\s*岁|性别|怀孕|民族|种族|宗教|age|gender|race).{0,80}(?:录用|拒绝|reject|hire|hiring|招聘决定|是否要|筛掉|淘汰|别约|不约|拒收)|(?:录用|拒绝|reject|hire|hiring|招聘决定|筛掉|淘汰|别约|不约|拒收).{0,80}(?:年龄|\d{1,3}\s*岁|性别|怀孕|民族|种族|宗教|age|gender|race)/.test(q);
  if (discriminatory) return { action: 'refuse', reason: 'discriminatory_hiring' };
  const exfiltration = /(?:系统提示词|system\s*prompt|hidden\s*instruction|其他候选人|另一个候选人|上一个候选人|上一位候选人|他人(?:的)?(?:聊天|面试)记录|面试记录|聊天记录|简历原文|resume|(?:客户|候选人).{0,16}(?:简历|录音|通话)).{0,80}(?:发给|导出|下载|原样|全部|全文|贴出|show|export)|(?:发给|导出|下载|原样|全部|全文|贴出|show|export).{0,80}(?:系统提示词|system\s*prompt|hidden\s*instruction|其他候选人|另一个候选人|上一个候选人|上一位候选人|他人(?:的)?(?:聊天|面试)记录|面试记录|聊天记录|简历原文|resume|(?:客户|候选人).{0,16}(?:简历|录音|通话))/.test(q);
  if (exfiltration && !asksForDefense) return { action: 'refuse', reason: 'private_data_exfiltration' };
  if (/(?:前任|前男友|前女友).{0,40}(?:爱|想|回头|联系)|(?:附近|local).{0,40}(?:修空调|维修|师傅)/.test(q)) {
    return { action: 'refuse', reason: 'personal_advice_out_of_scope' };
  }
  if (!asksForDefense && /(?:请|帮我|立刻|马上|现在|执行).{0,40}(?:drop\s+table|delete\s+from|truncate|rm\s+-rf|删库|删除生产数据库)/.test(q)) {
    return { action: 'deny_external', reason: 'prompt_injection_or_tool_escalation' };
  }
  // A query *about* injection defense may safely use local technical material.  A direct instruction, even when
  // split by punctuation/zero-width characters, never earns a network-capable branch.
  const directInjection = /(?:ignore\s+(?:previous|all)|disregard\s+(?:rules?|instructions?)|call\s+(?:refund|payment|shell)|(?:退款|扣款).{0,32}(?:skill|工具)|导出.{0,32}(?:题库|简历)|system\s*[:：]|developer\s*[:：])/.test(q)
    || /(?:忽略所有(?:规则|指令|系统)|调用(?:退款|扣款|支付)(?:工具|skill)?|导出(?:全部)?(?:题库|简历))/.test(packed);
  if (directInjection && !asksForDefense) {
    return { action: 'deny_external', reason: 'prompt_injection_or_tool_escalation' };
  }
  return { action: 'allow' };
}
