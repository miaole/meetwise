/**
 * @meetwise/db · 不可变会话事件源（CTX-03）存储侧。
 *
 * 这是「自由对话」的纯数据访问层：append-only 业务事件源（owner RLS + 有序序列 + version）+
 * 加密正文源（ciphertext + keyed HMAC 指纹）+ checkpoint 事件引用（range/version/digest）。
 * **绝不重实现**删除根（issuer 冻结在 privacy-authorization.ts，erasure 归 0091/0093）、
 * **绝不重实现**真实加密/KMS（归 MODEL-OP，本层只用 pgp_sym_encrypt seam）。
 *
 * 隐私铁律（对齐 CLAUDE.md）：
 *   - 正文只进 pgp_sym_encrypt 密文，`bodyHmac` 用 **HMAC** 而非裸 sha256（防确认/关联预言机，
 *     同 resume.ts/int-transcript.ts）；app_role 无 ciphertext 读权限，读侧只走 0108 的
 *     SECURITY DEFINER 函数吐 watermark（body_hmac/key 版本/epoch/status/digest）。
 *   - checkpoint 只存 event_ref（range/version/digest），恢复用 replay 回放 watermark 重算
 *     range_digest 比对——checkpoint/trace 永不成为「原文聊天库」。
 *   - 事件 append-only：content 不可 UPDATE；status 单向 active → privacy_fenced → purged。
 */
import type { Client } from './principal.ts';
import { createHmac } from 'node:crypto';
import type {
  ConversationEventCategory, ConversationEventSource, ConversationRetentionClass,
  ConversationConsentPurpose, ConversationEventStatus,
} from '@meetwise/domain';

const IS_PROD = process.env.NODE_ENV === 'production';
/** 必需密钥：prod 缺失即 fail-closed 抛错（杜绝静默用 dev 默认 = 加密形同虚设）。 */
function requireSecret(envName: string, devDefault: string): string {
  const v = process.env[envName];
  if (!v) { if (IS_PROD) throw new Error(`${envName} is required in production`); return devDefault; }
  if (v.length < 16) throw new Error(`${envName} too weak (min 16 chars)`);
  return v;
}
/** 会话事件正文对称加密 key（生产走 KMS/区域密钥；与 resume/answer 的 key 刻意分离）。 */
const EVENT_ENC_KEY = () => requireSecret('CONVERSATION_EVENT_ENC_KEY', 'dev_conversation_key_change_in_prod_x');
/** 正文指纹密钥：HMAC（keyed，非裸 sha256），与 resume/answer 的 HMAC secret 刻意分离。 */
const EVENT_HMAC_SECRET = () => requireSecret('CONVERSATION_EVENT_HMAC_SECRET', 'dev_conversation_hmac_secret__change_me');
/**
 * 当前密钥版本（轮转用）：HMAC 与加密共用同一把「代际」旋钮（`CONVERSATION_EVENT_KEY_VERSION`），
 * 但列里分开存 hmac_key_version / enc_key_version，未来可独立轮转而不改 schema。按工件记录的
 * 版本取历史钥走 `CONVERSATION_EVENT_ENC_KEY_V{n}`（同 resume 的 N1）。
 */
export const CONVERSATION_EVENT_KEY_VERSION = Number(process.env.CONVERSATION_EVENT_KEY_VERSION ?? 1);
function encKeyForVersion(v: number): string {
  return process.env[`CONVERSATION_EVENT_ENC_KEY_V${v}`] ?? EVENT_ENC_KEY();
}

/** 正文指纹（keyed HMAC，64-hex）。与 SQL 侧只落指纹、不落原文。 */
export const conversationEventBodyHmac = (plaintext: string) =>
  createHmac('sha256', EVENT_HMAC_SECRET()).update(plaintext, 'utf8').digest('hex');

export interface AppendConversationEventInput {
  threadId: string;
  category: ConversationEventCategory;
  source: ConversationEventSource;
  /** 幂等键（principal 作用域）；同一键重放返回既有事件（replayed=true）。 */
  eventKey?: string | null;
  /** 事件正文：**未受信输入**，只在同一事务内以绑定参数进 pgp_sym_encrypt，绝不拼接/落明文。 */
  body: string;
  retentionClass: ConversationRetentionClass;
  consentPurpose: ConversationConsentPurpose;
  consentRevision: number;
  privacyEpoch: number;
}

export interface ConversationEventAppendReceipt {
  eventId: string;
  sequence: number;
  eventDigest: string;
  bodyHmac: string;
  artifactId: string;
  replayed: boolean;
}

export interface ReplayedConversationEvent {
  eventId: string;
  sequence: number;
  category: ConversationEventCategory;
  source: ConversationEventSource;
  eventDigest: string;
  artifactId: string;
  bodyHmac: string;
  hmacKeyVersion: number;
  encKeyVersion: number;
  retentionClass: ConversationRetentionClass;
  consentPurpose: ConversationConsentPurpose;
  consentRevision: number;
  privacyEpoch: number;
  status: ConversationEventStatus;
  version: number;
  createdAt: string;
}

export interface ConversationEventRangeRef {
  threadId: string;
  fromSequence: number;
  toSequence: number;
  refVersion: number;
  eventCount: number;
  rangeDigest: string;
}

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

/**
 * 追加会话事件（首包落 active）。同一事务内：advisory 锁串行分配 sequence → 幂等键重放 →
 * 插加密工件 + 关系行 → 复用 memory_append_audit。event_digest 由 SQL 侧确定性派生（不信任
 * 调用方自报指纹）。
 */
export async function appendConversationEvent(c: Client, input: AppendConversationEventInput): Promise<ConversationEventAppendReceipt> {
  if (!input.threadId || input.threadId.length === 0) fail('conversation_event_thread_invalid');
  if (typeof input.body !== 'string' || input.body.length === 0) fail('conversation_event_body_empty');
  if (!Number.isSafeInteger(input.consentRevision) || input.consentRevision < 1) fail('conversation_event_consent_revision_invalid');
  if (!Number.isSafeInteger(input.privacyEpoch) || input.privacyEpoch < 1) fail('conversation_event_epoch_invalid');

  const bodyHmac = conversationEventBodyHmac(input.body);
  const encKey = encKeyForVersion(CONVERSATION_EVENT_KEY_VERSION);

  const r = await c.query<{
    event_id: string; sequence: string | number; event_digest: string; body_hmac: string;
    artifact_id: string; replayed: boolean;
  }>(
    `SELECT * FROM conversation_event_append($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [
      input.threadId, input.category, input.source, input.eventKey ?? null, input.body, bodyHmac,
      CONVERSATION_EVENT_KEY_VERSION, CONVERSATION_EVENT_KEY_VERSION, encKey,
      input.retentionClass, input.consentPurpose, input.consentRevision, input.privacyEpoch,
    ],
  );
  const row = r.rows[0];
  const sequence = Number(row?.sequence);
  if (!row?.event_id || !Number.isSafeInteger(sequence) || sequence < 1) fail('conversation_event_append_failed');
  return {
    eventId: row.event_id, sequence, eventDigest: row.event_digest, bodyHmac: row.body_hmac,
    artifactId: row.artifact_id, replayed: row.replayed === true,
  };
}

/** 确定性回放（恢复路径，只依赖持久化事件源，无进程内 session map）。无正文、无 ciphertext。 */
export async function replayConversationEvents(c: Client, threadId: string, afterSequence = 0): Promise<ReplayedConversationEvent[]> {
  const r = await c.query<{
    event_id: string; sequence: string | number; category: ConversationEventCategory;
    source: ConversationEventSource; event_digest: string; artifact_id: string; body_hmac: string;
    hmac_key_version: number; enc_key_version: number; retention_class: ConversationRetentionClass;
    consent_purpose: ConversationConsentPurpose; consent_revision: string | number;
    privacy_epoch: string | number; status: ConversationEventStatus; version: string | number; created_at: string;
  }>('SELECT * FROM conversation_event_replay($1,$2)', [threadId, afterSequence]);
  return r.rows.map((row) => {
    const sequence = Number(row.sequence);
    const consentRevision = Number(row.consent_revision);
    const privacyEpoch = Number(row.privacy_epoch);
    const version = Number(row.version);
    if (!Number.isSafeInteger(sequence) || sequence < 1
      || !Number.isSafeInteger(consentRevision) || consentRevision < 1
      || !Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1
      || !Number.isSafeInteger(version) || version < 1) fail('conversation_event_replay_invalid');
    return {
      eventId: row.event_id, sequence, category: row.category, source: row.source,
      eventDigest: row.event_digest, artifactId: row.artifact_id, bodyHmac: row.body_hmac,
      hmacKeyVersion: row.hmac_key_version, encKeyVersion: row.enc_key_version,
      retentionClass: row.retention_class, consentPurpose: row.consent_purpose,
      consentRevision, privacyEpoch, status: row.status, version, createdAt: row.created_at,
    };
  });
}

/** checkpoint 事件引用（range/version/digest，无正文）。恢复方 replay 后重算比对。 */
export async function conversationEventRangeRef(c: Client, threadId: string, fromSequence: number, toSequence: number): Promise<ConversationEventRangeRef> {
  const r = await c.query<{
    thread_id: string; from_sequence: string | number; to_sequence: string | number;
    ref_version: string | number; event_count: string | number; range_digest: string;
  }>('SELECT * FROM conversation_event_range_ref($1,$2,$3)', [threadId, fromSequence, toSequence]);
  const row = r.rows[0];
  const fromSeq = Number(row?.from_sequence);
  const toSeq = Number(row?.to_sequence);
  const refVersion = Number(row?.ref_version);
  const eventCount = Number(row?.event_count);
  if (!row?.thread_id || !Number.isSafeInteger(fromSeq) || !Number.isSafeInteger(toSeq)
    || !Number.isSafeInteger(refVersion) || !Number.isSafeInteger(eventCount) || eventCount < 0) {
    fail('conversation_event_range_ref_invalid');
  }
  return {
    threadId: row.thread_id, fromSequence: fromSeq, toSequence: toSeq, refVersion,
    eventCount, rangeDigest: row.range_digest,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 账户删除 sink 闭合 + version CAS（0111）——复用冻结 PrivacyAuthorizationIssuer（0091），
// 只包 CTX 自己的 begin/claim/purge 解析器（镜像 0093 MEM 的包壳，不重实现删除根）。
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConversationEventErasureTarget { sink: string; resourceHmac: string }
export interface BegunConversationEventErasure {
  requestId: string;
  requestStatus: string;
  privacyEpoch: number;
  targetSetDigest: string;
  targets: ConversationEventErasureTarget[];
  replayed: boolean;
}

/**
 * 发起账户级会话事件删除（等价 sweep，与 memory_begin_account_erasure 并列，各自分账本）：
 * 同步 fence 双表 active→privacy_fenced（version+1，事件 privacy_epoch 不可变）→ 建
 * account_data request → 枚举 2 个 CTX sink target → 就地算 target_set_digest → request→fenced。
 * 幂等：同 owner 同 idempotency_key_hash 重放返回既有 2 行。返回的 targetSetDigest 必须与
 * 调用方 `canonicalTargetSetDigest(targets)` 相等，供签发快照。
 */
export async function beginConversationEventErasure(
  c: Client, idempotencyKeyHash: string,
): Promise<BegunConversationEventErasure> {
  const r = await c.query<{
    request_id: string; request_status: string; privacy_epoch: string | number;
    target_set_digest: string; sink: string; resource_hmac: string; replayed: boolean;
  }>('SELECT * FROM conversation_event_begin_erasure($1)', [idempotencyKeyHash]);
  if (r.rowCount === 0) throw Object.assign(new Error('conversation_event_begin_erasure_failed'), { code: 'conversation_event_begin_erasure_failed' });
  const first = r.rows[0]!;
  const privacyEpoch = Number(first.privacy_epoch);
  if (!Number.isSafeInteger(privacyEpoch) || privacyEpoch < 1)
    throw Object.assign(new Error('conversation_event_begin_erasure_failed'), { code: 'conversation_event_begin_erasure_failed' });
  return {
    requestId: first.request_id,
    requestStatus: first.request_status,
    privacyEpoch,
    targetSetDigest: first.target_set_digest,
    targets: r.rows.map((row) => ({ sink: row.sink, resourceHmac: row.resource_hmac })),
    replayed: first.replayed,
  };
}

export interface ClaimedConversationEventTarget { targetId: string; leaseToken: string; attempt: number }

/**
 * 在已消费快照下受约束地租用 CTX 删除目标（scope=account_data +
 * purpose=account_data_erasure + sink∈{conversation_event,conversation_event_artifact}
 * + 活 digest 重验）。安全违规抛错；业务不可租/已 erased 返回 null。
 */
export async function claimConversationEventTarget(
  c: Client, jti: string, targetId: string, worker: string, leaseSeconds = 60,
): Promise<ClaimedConversationEventTarget | null> {
  const r = await c.query<{ target_id: string; lease_token: string | null; status: string; attempt: number }>(
    'SELECT * FROM privacy_authorization_claim_conversation_event_target($1,$2,$3,$4)', [jti, targetId, worker, leaseSeconds],
  );
  const row = r.rows[0];
  if (!row || row.status === 'erased') return null;
  if (!row.lease_token || !Number.isSafeInteger(Number(row.attempt)))
    throw Object.assign(new Error('conversation_event_target_claim_invalid'), { code: 'conversation_event_target_claim_invalid' });
  return { targetId: row.target_id, leaseToken: row.lease_token, attempt: Number(row.attempt) };
}

export interface PurgedConversationEventTarget { targetId: string; status: string; deletedCount: number; requestStatus: string }

/** 删除侧物理清除：先正向跃迁 privacy_fenced→purged 再物理 DELETE，残留=0 校验。 */
export async function purgeConversationEventTarget(c: Client, targetId: string, token: string): Promise<PurgedConversationEventTarget> {
  const r = await c.query<{ target_id: string; status: string; deleted_count: string | number; request_status: string }>(
    'SELECT * FROM privacy_purge_conversation_event_target($1,$2)', [targetId, token],
  );
  const row = r.rows[0];
  if (!row?.target_id) throw Object.assign(new Error('conversation_event_target_purge_failed'), { code: 'conversation_event_target_purge_failed' });
  return { targetId: row.target_id, status: row.status, deletedCount: Number(row.deleted_count), requestStatus: row.request_status };
}

export interface ConversationEventDispatchDecision {
  eventId: string;
  status: ConversationEventStatus;
  dispatchDecision: number;
  voidReason: string | null;
}

/**
 * 补偿控制（防复活）：派发/回放进模型数据块前复核 live 状态 + 已观察 watermark。事件已被
 * fence/purge 或 epoch/revision 漂移 → dispatch_decision=0（voided），杜绝已删内容复活。
 */
export async function dispatchConversationEventReplay(
  c: Client, eventId: string, observedPrivacyEpoch: number, observedConsentRevision: number,
): Promise<ConversationEventDispatchDecision> {
  const r = await c.query<{
    event_id: string; status: ConversationEventStatus; dispatch_decision: number; void_reason: string | null;
  }>('SELECT * FROM conversation_event_dispatch_replay($1,$2,$3)', [eventId, observedPrivacyEpoch, observedConsentRevision]);
  const row = r.rows[0];
  if (!row?.event_id) throw Object.assign(new Error('conversation_event_dispatch_replay_failed'), { code: 'conversation_event_dispatch_replay_failed' });
  return {
    eventId: row.event_id, status: row.status, dispatchDecision: row.dispatch_decision, voidReason: row.void_reason,
  };
}

export interface ConversationEventTransitionReceipt { eventId: string; status: ConversationEventStatus; version: number }

/**
 * 单事件乐观 CAS 状态跃迁原语（MEDIUM-2：version 列接线）。`WHERE version=expected` +
 * `version+1`——并发用同一 expected_version 跃迁同一事件只有一个赢家（败者 0 行返回 null）；
 * 0108 单向 guard 仍拒回退。
 */
export async function transitionConversationEventStatus(
  c: Client, eventId: string, fromStatus: ConversationEventStatus, toStatus: ConversationEventStatus, expectedVersion: number,
): Promise<ConversationEventTransitionReceipt | null> {
  const r = await c.query<{ event_id: string; status: ConversationEventStatus; version: string | number }>(
    'SELECT * FROM conversation_event_transition_status($1,$2,$3,$4)', [eventId, fromStatus, toStatus, expectedVersion],
  );
  const row = r.rows[0];
  if (!row) return null;
  const version = Number(row.version);
  if (!Number.isSafeInteger(version) || version < 1) fail('conversation_event_transition_invalid');
  return { eventId: row.event_id, status: row.status, version };
}
