/**
 * 记忆管理控制面命令层（MEM-10）的纯域原语：显式 status enum（非布尔汤）+ scope/disposition/
 * role 常量。与迁移 0107_memory_control_surface.sql 的 CHECK 约束逐值一致（漂移即证明失败）。
 *
 * 这里**不重实现**删除授权根（冻结在 privacy-authorization.ts 的 issuer + 0093 的 erasure），
 * 也不重实现事实状态机（冻结在 memory-fact-adjudication.ts + 0099）或索引治理（0102）。本模块
 * 只提供命令层自己需要、且 SQL 侧必须以 CHECK 枚举钉死的常量：
 *
 *   - 删除 scope（single_fact/session/account）：三种不同 fence 半径 + 不同 sink 可解析集。
 *   - 删除 request/target 状态机（pending_external/partial_failed/completed …）：物理删除完成前
 *     绝不伪造 completed；失败写目标级 reason + receipt；旧内容保持 fenced 不复活。
 *   - 纠正 disposition（superseded/disputed）：命令层语义元数据，与冻结 0099 的 relationship
 *     （contradicts/user_correction）是不同层级，各自留痕。
 *   - 受控角色名（memory_reviewer / memory_policy_releaser）：NOLOGIN NOINHERIT NOBYPASSRLS。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */
import { MEMORY_AUTHZ_SINK_KINDS } from './memory-governance.ts';

/** 删除范围：单条遗忘 / 会话删除 / 删除全部（三种不同 fence 半径 + sink 可解析集）。 */
export const MEMORY_DELETION_SCOPES = ['single_fact', 'session', 'account'] as const;
export type MemoryDeletionScope = (typeof MEMORY_DELETION_SCOPES)[number];

/**
 * 删除请求状态机（与 0107 表 CHECK 一致）：
 *   fenced → purging → pending_external / partial_failed → completed。
 * completed 只有「全部 target completed」才可达（no-forge-completed 守卫触发器），
 * 有 pending_external / partial_failed 时绝不 completed（诚实标注，不伪造）。
 */
export const MEMORY_DELETION_REQUEST_STATUSES = [
  'fenced', 'purging', 'pending_external', 'partial_failed', 'completed',
] as const;
export type MemoryDeletionRequestStatus = (typeof MEMORY_DELETION_REQUEST_STATUSES)[number];

/**
 * 删除目标状态机（与 0107 表 CHECK 一致）：
 *   pending=本域数据面可解析（待 worker 领取）；pending_external=未知 locator 或待 reindex 解析；
 *   leased=worker 已领取（lease CAS）；partial_failed=失败写 reason+receipt；completed=物理删除
 *   完成（带 receipt）。completed 不可回退（one-way 守卫）。
 */
export const MEMORY_DELETION_TARGET_STATUSES = [
  'pending', 'pending_external', 'leased', 'partial_failed', 'completed',
] as const;
export type MemoryDeletionTargetStatus = (typeof MEMORY_DELETION_TARGET_STATUSES)[number];

/** 纠正命令 disposition：superseded=新版本取代旧值；disputed=用户纠正（纠错）。 */
export const MEMORY_CORRECTION_DISPOSITIONS = ['superseded', 'disputed'] as const;
export type MemoryCorrectionDisposition = (typeof MEMORY_CORRECTION_DISPOSITIONS)[number];

/** 采集暂停状态：显式 enum（active/paused），非布尔汤。 */
export const MEMORY_COLLECTION_PAUSE_STATUSES = ['active', 'paused'] as const;
export type MemoryCollectionPauseStatus = (typeof MEMORY_COLLECTION_PAUSE_STATUSES)[number];

/** policy 发布命令状态：build → validated → activated（单调前进）。 */
export const MEMORY_POLICY_PUBLISH_STATUSES = ['built', 'validated', 'activated'] as const;
export type MemoryPolicyPublishStatus = (typeof MEMORY_POLICY_PUBLISH_STATUSES)[number];

/** reindex 任务状态：pending / completed / failed。 */
export const MEMORY_REINDEX_TASK_STATUSES = ['pending', 'completed', 'failed'] as const;
export type MemoryReindexTaskStatus = (typeof MEMORY_REINDEX_TASK_STATUSES)[number];

/** 导出回执状态：issued / completed。 */
export const MEMORY_EXPORT_RECEIPT_STATUSES = ['issued', 'completed'] as const;
export type MemoryExportReceiptStatus = (typeof MEMORY_EXPORT_RECEIPT_STATUSES)[number];

/** 受控角色名（NOLOGIN NOINHERIT NOBYPASSRLS；默认不可读用户正文）。 */
export const MEMORY_CONTROL_REVIEWER_ROLE = 'memory_reviewer' as const;
export const MEMORY_CONTROL_POLICY_RELEASER_ROLE = 'memory_policy_releaser' as const;

/** 删除目标 sink 枚举复用 MEMORY_AUTHZ_SINK_KINDS（memory-governance.ts），不重复定义。 */
export type MemoryDeletionSink = (typeof MEMORY_AUTHZ_SINK_KINDS)[number];
