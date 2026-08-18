/**
 * 不可变会话事件源（CTX-03）纯域原语：显式 enum（非布尔汤）+ 确定性 event_digest /
 * range_digest 派生。与迁移 0108_ctx03_immutable_session_event_source.sql 的 CHECK 约束与
 * digest 算法逐值一致（漂移即证明失败）。
 *
 * 这里**不重实现**删除根（冻结在 privacy-authorization.ts 的 issuer + 0093 的 erasure）、
 * 不重实现真实加密/KMS（归 MODEL-OP）、不实现真实 embedding。本模块只提供：
 *   - 事件 category/source/retention/consent/status 的显式 enum 常量（SQL 侧必须以 CHECK 钉死）。
 *   - `deriveEventDigest`：与 SQL `conversation_event_append` 内的 digest(canonical,'sha256')
 *     逐字节一致（category:source:body_hmac:retention:consent_purpose:consent_revision:
 *     privacy_epoch:enc_key_version）。事件内容身份指纹，无正文、无 PII。
 *   - `deriveRangeDigest`：与 SQL `conversation_event_range_ref` 的聚合一致（thread + from + to
 *     + 逐序 "seq:event_digest" 聚合）。checkpoint 只持这个引用，绝不反转成聊天历史。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */
import { createHash } from 'node:crypto';

/** 事件类别（显式 enum，最小集）：turn_start/user_message/assistant_message/tool_call/tool_result/system_note。 */
export const CONVERSATION_EVENT_CATEGORIES = [
  'turn_start', 'user_message', 'assistant_message', 'tool_call', 'tool_result', 'system_note',
] as const;
export type ConversationEventCategory = (typeof CONVERSATION_EVENT_CATEGORIES)[number];

/** 事件来源（provenance，显式 enum）：user/model/tool/system。 */
export const CONVERSATION_EVENT_SOURCES = ['user', 'model', 'tool', 'system'] as const;
export type ConversationEventSource = (typeof CONVERSATION_EVENT_SOURCES)[number];

/** 保留策略类别（显式 enum）：session=会话删除时清；account=账户删除时清；derived=派生存量。 */
export const CONVERSATION_RETENTION_CLASSES = ['session', 'account', 'derived'] as const;
export type ConversationRetentionClass = (typeof CONVERSATION_RETENTION_CLASSES)[number];

/** 同意用途（显式 enum）：本事件源仅服务「自由对话」。 */
export const CONVERSATION_CONSENT_PURPOSES = ['free_conversation'] as const;
export type ConversationConsentPurpose = (typeof CONVERSATION_CONSENT_PURPOSES)[number];

/** 事件/工件状态机（显式 enum，单向）：active → privacy_fenced → purged。 */
export const CONVERSATION_EVENT_STATUSES = ['active', 'privacy_fenced', 'purged'] as const;
export type ConversationEventStatus = (typeof CONVERSATION_EVENT_STATUSES)[number];

/** checkpoint 引用类型版本号（ref_version；引用格式演进时递增）。 */
export const CONVERSATION_EVENT_REF_VERSION = 1 as const;

/**
 * 账户删除 sink（与 0111 迁移的 privacy_deletion_target.sink CHECK 增量双向 pin）。
 * conversation_event（有序关系行）+ conversation_event_artifact（密文工件）——owner 作用域
 * 删除轨道，与 MEM/INT 两套 sink 互不相交。domain 侧 pin 住集合，SQL 侧以 CHECK 钉死，
 * 漂移即证明失败。
 */
export const CONVERSATION_EVENT_SINKS = ['conversation_event', 'conversation_event_artifact'] as const;
export type ConversationEventSink = (typeof CONVERSATION_EVENT_SINKS)[number];

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

/**
 * 事件内容身份 digest（与 0108 SQL 逐字节一致）。覆盖正文指纹（body_hmac 已是 keyed HMAC）+
 * 授权元数据；无正文、无 PII。enc_key_version 参与，使密钥代际轮转也改变内容身份。
 */
export function deriveEventDigest(input: {
  category: ConversationEventCategory;
  source: ConversationEventSource;
  bodyHmac: string;
  retentionClass: ConversationRetentionClass;
  consentPurpose: ConversationConsentPurpose;
  consentRevision: number;
  privacyEpoch: number;
  encKeyVersion: number;
}): string {
  const canonical = [
    input.category, input.source, input.bodyHmac, input.retentionClass,
    input.consentPurpose, String(input.consentRevision), String(input.privacyEpoch),
    String(input.encKeyVersion),
  ].join(':');
  return sha256(canonical);
}

/**
 * checkpoint 事件引用 digest（与 0108 SQL 逐字节一致）。entries 为范围内按 sequence 升序的
 * {sequence,eventDigest}；range_digest 覆盖 thread + 范围端点 + 逐事件聚合，使引用自身可校验
 * 范围正确性。checkpoint 只持 (thread,from,to,refVersion,eventCount,rangeDigest)，绝不反转成
 * 聊天历史（铁律③）。
 */
export function deriveRangeDigest(input: {
  threadId: string;
  fromSequence: number;
  toSequence: number;
  entries: Array<{ sequence: number; eventDigest: string }>;
}): string {
  const inner = input.entries
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((e) => `${e.sequence}:${e.eventDigest}`)
    .join('\n');
  const mid = sha256(inner);
  return sha256(`${input.threadId}:${input.fromSequence}:${input.toSequence}:${mid}`);
}

/** event_ref 引用对象（checkpoint/state 唯一持久的形状：thread + range + version + digest，无正文）。 */
export interface ConversationEventRef {
  threadId: string;
  fromSequence: number;
  toSequence: number;
  refVersion: number;
  eventCount: number;
  rangeDigest: string;
}
