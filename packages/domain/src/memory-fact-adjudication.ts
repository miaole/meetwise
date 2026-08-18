/**
 * 记忆事实裁决（MEM-13）的纯域原语：稳定 factKey 派生 + subject 归一化 + 六分量分离守护。
 *
 * 与 MEM-00（memory-governance.ts：存储/召回/删除）与 MEM-12（memory-admission.ts：准入元标签门）
 * 刻意分开。本模块是「长期事实的冲突/时效判定」的纯函数层，只落地三样东西，其余交给 db/contracts：
 *
 *  1. **factKey 服务端派生**：owner + controllerScope + purpose + namespace + 归一化 fact 主题
 *     （NFKC→trim→lower→拒 control/注入），sha256 成 64-hex。与 SQL 侧
 *     `encode(digest(principal || ':' || 'c_personal' || ':' || purpose || ':' || namespace || ':' || subject_norm, 'sha256'), 'hex')`
 *     **逐字节一致**（跨层承重点：proof 用本函数算出期望 key，再与 DB 落库的 key 比对）。
 *     —— 与 MEM-12 的 fact_key 刻意不同：MEM-12 是「来源身份键」（scope+subject+purpose+source 身份，
 *     同 subject 不同来源得到不同 key）；MEM-13 是「主题键」（同 subject 归一后收敛到同一 key，
 *     冲突/替代判定才成立）。两者共存，各自服务各自状态机，互不覆盖。
 *
 *  2. **subject 归一化**：NFKC 归一（全角→半角等）+ trim + lower，拒绝 control/换行（注入/序列化
 *     逃逸/日志注水）与超长。与 SQL `lower(trim(normalize(p_subject,'NFKC')))` 逐字节一致。
 *
 *  3. **六分量分离守护**：source_trust / extraction_confidence / user_confirmation /
 *     freshness·valid_until / salience / retrieval_score 是六条互不推导的独立轴。本模块守护
 *     「retrieval_score 裁决期恒空」「user_confirmation 不被 source_trust 自动推导」两条不变式
 *     （完整激活状态机在 SQL 函数，本模块只做纯函数侧校验）。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */
import { createHash } from 'node:crypto';

/** 事实分类命名空间（对齐 0093 memory_fact.kind 枚举）。 */
export const MEMORY_FACT_NAMESPACES = [
  'fact', 'preference', 'skill', 'weakness', 'topic', 'episode',
] as const;
export type MemoryFactNamespace = (typeof MEMORY_FACT_NAMESPACES)[number];

/** 单/多值规则：单值事实全局至多一个 active；多值事实可多个 active。 */
export const MEMORY_FACT_CARDINALITIES = ['single_value', 'multi_value'] as const;
export type MemoryFactCardinality = (typeof MEMORY_FACT_CARDINALITIES)[number];

/** 首期 controller_scope 固定 C 端个人范围（与 MEM-12 一致）。 */
export const FACT_ADJUDICATION_SCOPE = 'c_personal' as const;

/** 非法裁决输入统一失败出口：错误名即 code（上层按 code 分支）。 */
const fail = (code: string): never => {
  throw Object.assign(new Error(code), { code });
};

/** subject 长度上限（归一化前，与 SQL char_length 上限一致；字符计数按 UTF-16，ASCII/CJK BMP 与 SQL 一致）。 */
const FACT_SUBJECT_MAX_LEN = 200;

/**
 * subject 归一化：NFKC 归一 → trim → lower；拒绝空/超长/control 字符（含换行——防注入与日志注水）。
 * 与 SQL 侧 `lower(trim(pg_catalog.normalize(p_subject, 'NFKC')))` 逐字节一致（对 ASCII 与 BMP 中文
 * 完全一致；大小写折叠差异仅存在于个别非 ASCII 字母，故 factKey 的 subject 部分只应在可控字符集内取值）。
 */
export function normalizeFactSubject(subject: string): string {
  if (typeof subject !== 'string' || subject.length === 0) fail('memory_adjudication_subject_empty');
  if (subject.length > FACT_SUBJECT_MAX_LEN) fail('memory_adjudication_subject_too_long');
  if (/[\u0000-\u001f\u007f]/.test(subject)) fail('memory_adjudication_subject_control');
  const norm = subject.normalize('NFKC').trim().toLowerCase();
  if (norm.length === 0) fail('memory_adjudication_subject_empty');
  return norm;
}

/**
 * 稳定 factKey 服务端派生：sha256(owner ':' scope ':' purpose ':' namespace ':' normalizedSubject)。
 * 与 SQL `memory_adjudicate_materialize` 的派生逐字节一致（owner=principal=app.principal_user）。
 * 客户端无 factKey 字段可传——本函数只接受结构化组件，factKey 由服务端算 hash。
 */
export function deriveMemoryFactKey(input: {
  owner: string;
  purpose: string;
  namespace: string;
  subject: string;
  controllerScope?: string;
}): string {
  const scope = input.controllerScope ?? FACT_ADJUDICATION_SCOPE;
  if (!input.owner || input.owner.length === 0) fail('memory_adjudication_owner_empty');
  if (scope !== FACT_ADJUDICATION_SCOPE) fail('memory_adjudication_scope_forbidden');
  if (!input.purpose || input.purpose.length === 0) fail('memory_adjudication_purpose_empty');
  if (!(MEMORY_FACT_NAMESPACES as readonly string[]).includes(input.namespace)) fail('memory_adjudication_namespace_invalid');
  const subjectNorm = normalizeFactSubject(input.subject);
  return createHash('sha256')
    .update(`${input.owner}:${scope}:${input.purpose}:${input.namespace}:${subjectNorm}`, 'utf8')
    .digest('hex');
}

/**
 * 六分量分离守护（fail-closed）：裁决期（materialize/confirm/correct/revoke）绝不写入 retrieval_score
 * （它只在召回时瞬态排序），也绝不让 user_confirmation 被 source_trust 自动推导（trusted 来源物化后
 * 仍是 unconfirmed，必须经 confirm 显式授予）。此守护与 SQL 的 CHECK (retrieval_score IS NULL) + 激活
 * 规则同源，纯函数侧再校验一道。
 */
export function assertFactAdjudicationSeparation(meta: {
  retrievalScore?: number | null;
  userConfirmation?: string;
  sourceTrust?: string;
}): void {
  if (meta.retrievalScore !== undefined && meta.retrievalScore !== null) fail('adjudication_retrieval_score_forbidden');
  if (meta.userConfirmation !== undefined
      && meta.userConfirmation !== 'unconfirmed'
      && meta.userConfirmation !== 'user_confirmed'
      && meta.userConfirmation !== 'business_verified') fail('adjudication_user_confirmation_invalid');
  if (meta.sourceTrust !== undefined && meta.sourceTrust !== 'trusted' && meta.sourceTrust !== 'untrusted')
    fail('adjudication_source_trust_invalid');
}
