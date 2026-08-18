/**
 * RAG-FUNNEL-07 / 自由文本自动漏斗与成本/unknown：持久化状态机 + CAS + RLS + 事务 outbox。
 *
 * PostgreSQL 是 free-text route 决策的权威事实源。真实模型调用是受控确定性 seam
 * （proof 注入 fake 输出），生产由 MODEL-OP-01 的 typed binding 接管；本模块把「外发前
 * 持久化 model_prepared 意图 + 外发后 result_validated/known_not_sent/dispatched_unknown/
 * validation_rejected 终态」这条状态机骨架先落库，模型本身可替换。
 *
 * 与 RAG-03 job-route-decision.ts 的**结构同构但 scope 隔离**（对齐迁移 0114）：
 *  - scope_id 对应 job_id；taxonomy/policy 版本、allocations、attempt_outcome/reason_codes、
 *    revision 状态机、event outbox 全部与 RAG-03 逐值一致；
 *  - **不扩权限**：revision 只存 canonical digest（free-text-semantic:v1）+ keyed input HMAC
 *    （服务端派生，goal 原文结构上无处可写）；同一 (scope, revision) 最多 1 次模型外发
 *    （route_pending 被 FOR UPDATE 锁定后先落 model_prepared，再调用 seam，任何终态不重发）；
 *  - dispatched_unknown / known_not_sent / validation_rejected 是 sticky 终态，永不自动重试；
 *  - **无 binding/snapshot/plan/检索消费链**：分类结果只是「建议 allowlisted track」，
 *    绝不授予读取/工具权限（无 public-read RLS、无 SECURITY DEFINER 读面）。
 *
 * 安全规则（编码在此）：
 *  - goal 原文**不落库、不 log、不进 cache/event**——只以 digest 形式存在；模型输入
 *    goal 只经受控 seam（真实外发归 MODEL-OP-01），不是日志/缓存/事件。
 *  - 四原语落点：① asPrincipal（全部事务，RLS FORCE owner=principal）② CAS（revision
 *    status 条件 UPDATE，陈旧落败=0 行）③ append-only outbox（free_text_route_event，
 *    INSERT…SELECT MAX+1，对齐 0104 的 event outbox，不重造 appendEvent——本面不是
 *    interview_event）④ lease 有意不用——派发≤1 由 FOR UPDATE + 终态 sticky 承重（对齐 RAG-03）。
 *
 * 分层纪律：形状校验归 domain（validateModelRouteOutput / classifyFreeTextByRule）；本层只把
 * 字段送进承重 SQL 并映射返回值。
 */
import { createHmac, randomUUID } from 'node:crypto';
import type { PoolClient as Client } from 'pg';
import { asPrincipal, type DbPool } from './principal.ts';
import {
  JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION,
  canonicalFreeTextSemanticDigest, classifyFreeTextByRule, validateModelRouteOutput,
  freeTextRouteDecisionHash, type JobRouteAllocation, type JobRouteModelOutput,
} from '@meetwise/domain';

export const FREE_TEXT_SCOPE_REVISION_STATUSES = ['route_pending', 'rule_decided', 'model_prepared', 'result_validated', 'route_decided', 'route_unresolved'] as const;
export type FreeTextScopeRevisionStatus = (typeof FREE_TEXT_SCOPE_REVISION_STATUSES)[number];

export const FREE_TEXT_ROUTE_ATTEMPT_OUTCOMES = ['rule_decided', 'result_validated', 'known_not_sent', 'dispatched_unknown', 'validation_rejected'] as const;
export type FreeTextRouteAttemptOutcome = (typeof FREE_TEXT_ROUTE_ATTEMPT_OUTCOMES)[number];

const INPUT_HMAC_VERSION = 'free-text-route-input:v1';

function codeError(code: string): Error { return Object.assign(new Error(code), { code }); }

/** 输入 HMAC（独立密钥）：证明 revision 由可信服务派生，调用方伪造 digest 也过不了重校验。 */
function computeFreeTextInputHmac(semanticDigest: string): string {
  const secret = process.env.RAG_FREE_TEXT_ROUTE_INPUT_HASH_KEY;
  if (!secret || secret.length < 32) throw new Error('free_text_route_input_hash_key_missing');
  return createHmac('sha256', secret).update(JSON.stringify({ v: INPUT_HMAC_VERSION, semanticDigest })).digest('hex');
}

function toJsonb(allocations: readonly JobRouteAllocation[]): string {
  return JSON.stringify(allocations.map((a) => ({ leafTrackId: a.leafTrackId, allocationBps: a.allocationBps })));
}

/* ─────────────────────────── revision（不可变语义修订） ─────────────────────────── */

/** 计算下一个 revision（= max+1）。同一 scope 内的单调版本，无跨 owner 读 MAX。 */
async function nextScopeRevision(c: Client, scopeId: string): Promise<number> {
  const r = await c.query('SELECT COALESCE(MAX(revision),0)+1 AS n FROM free_text_scope_revision WHERE scope_id=$1', [scopeId]);
  return Number(r.rows[0]?.n ?? 1);
}

async function appendFreeTextRouteEvent(c: Client, e: {
  scopeId: string; owner: string; revision: number; fromStatus: string | null; toStatus: string;
  reason: string | null; decisionId: string | null;
}): Promise<number> {
  const r = await c.query(
    `INSERT INTO free_text_route_event(scope_id,owner_user_id,revision,event_seq,decision_id,from_status,to_status,reason)
     SELECT $1, $2, $3, COALESCE(MAX(event_seq),0)+1, $4, $5, $6, $7
       FROM free_text_route_event WHERE scope_id=$1 AND revision=$3
     RETURNING event_seq`,
    [e.scopeId, e.owner, e.revision, e.decisionId, e.fromStatus, e.toStatus, e.reason],
  );
  return Number(r.rows[0]?.event_seq);
}

/**
 * 自由文本训练目标提交/重提交时自动写入新 revision（route_pending）。目标原文只以
 * canonical digest + HMAC 存，不含任何路由参数列（goal 文本不落库，结构上无可写原文）。
 */
export async function createFreeTextScopeRevision(c: Client, owner: string, scopeId: string, input: {
  goal: string;
}): Promise<{ revision: number; status: FreeTextScopeRevisionStatus }> {
  const digest = canonicalFreeTextSemanticDigest({ goal: input.goal });
  const hmac = computeFreeTextInputHmac(digest);
  const revision = await nextScopeRevision(c, scopeId);
  await c.query(
    `INSERT INTO free_text_scope_revision(scope_id,owner_user_id,revision,semantic_digest,input_hmac,status)
     VALUES($1,$2,$3,$4,$5,'route_pending')
     ON CONFLICT (scope_id, revision) DO NOTHING`,
    [scopeId, owner, revision, digest, hmac],
  );
  await appendFreeTextRouteEvent(c, { scopeId, owner, revision, fromStatus: null, toStatus: 'route_pending', reason: null, decisionId: null });
  return { revision, status: 'route_pending' };
}

/* ─────────────────────────── 分类漏斗（0 或 1 次模型外发） ─────────────────────────── */

export interface FreeTextRouteModelInput { scopeId: string; revision: number; goal: string }

/** RAG-07 受控确定性 seam；生产由 MODEL-OP-01 typed binding 提供真实实现。 */
export type FreeTextRouteModelClassify = (input: FreeTextRouteModelInput) => Promise<JobRouteModelOutput>;

export type ClassifyFreeTextScopeResult =
  | { status: 'route_decided'; decisionId: string; attemptOutcome: 'rule_decided' | 'result_validated'; modelCalls: number }
  | { status: 'route_unresolved'; decisionId: string; attemptOutcome: 'known_not_sent' | 'dispatched_unknown' | 'validation_rejected'; reasonCodes: string[]; modelCalls: number }
  | { status: 'noop'; reason: 'revision_not_found' | 'already_decided' | 'already_unresolved' | 'stale_revision' | 'not_pending' };

async function writeFreeTextRouteUnresolved(c: Client, args: {
  scopeId: string; owner: string; revision: number; attemptOutcome: FreeTextRouteAttemptOutcome; reasonCodes: string[];
}): Promise<{ decisionId: string }> {
  const decisionId = 'ftd_' + randomUUID();
  const decisionHash = freeTextRouteDecisionHash({
    scopeId: args.scopeId, revision: args.revision,
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, policyVersion: JOB_ROUTE_POLICY_VERSION,
    allocations: [], confidenceBps: null, marginBps: null,
    attemptOutcome: args.attemptOutcome, reasonCodes: args.reasonCodes,
  });
  await c.query(
    `INSERT INTO free_text_route_decision(id,scope_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash)
     VALUES($1,$2,$3,$4,'route_unresolved',$5,$6,$7,'[]'::jsonb,NULL,NULL,$8,$9)`,
    [decisionId, args.scopeId, args.owner, args.revision, args.attemptOutcome,
      JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION, args.reasonCodes, decisionHash],
  );
  await c.query(
    `UPDATE free_text_scope_revision SET status='route_unresolved', updated_at=clock_timestamp()
      WHERE scope_id=$1 AND revision=$2 AND status='model_prepared'`,
    [args.scopeId, args.revision],
  );
  await appendFreeTextRouteEvent(c, {
    scopeId: args.scopeId, owner: args.owner, revision: args.revision,
    fromStatus: 'model_prepared', toStatus: 'route_unresolved', reason: args.attemptOutcome, decisionId,
  });
  return { decisionId };
}

async function writeFreeTextRouteDecided(c: Client, args: {
  scopeId: string; owner: string; revision: number; attemptOutcome: 'rule_decided' | 'result_validated';
  allocations: JobRouteAllocation[]; confidenceBps: number; marginBps: number;
  fromStatus: 'rule_decided' | 'result_validated';
}): Promise<{ decisionId: string }> {
  const decisionId = 'ftd_' + randomUUID();
  const decisionHash = freeTextRouteDecisionHash({
    scopeId: args.scopeId, revision: args.revision,
    taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, policyVersion: JOB_ROUTE_POLICY_VERSION,
    allocations: args.allocations, confidenceBps: args.confidenceBps, marginBps: args.marginBps,
    attemptOutcome: args.attemptOutcome, reasonCodes: [],
  });
  await c.query(
    `INSERT INTO free_text_route_decision(id,scope_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash)
     VALUES($1,$2,$3,$4,'route_decided',$5,$6,$7,$8,$9,$10,'{}',$11)`,
    [decisionId, args.scopeId, args.owner, args.revision, args.attemptOutcome,
      JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION, toJsonb(args.allocations),
      args.confidenceBps, args.marginBps, decisionHash],
  );
  await c.query(
    `UPDATE free_text_scope_revision SET status='route_decided', updated_at=clock_timestamp()
      WHERE scope_id=$1 AND revision=$2 AND status=$3`,
    [args.scopeId, args.revision, args.fromStatus],
  );
  await appendFreeTextRouteEvent(c, {
    scopeId: args.scopeId, owner: args.owner, revision: args.revision,
    fromStatus: args.fromStatus, toStatus: 'route_decided', reason: null, decisionId,
  });
  return { decisionId };
}

/**
 * 分类漏斗：rules（0 次）→ seam（最多 1 次）→ 服务端双重校验 → 终态。同一 (scope, revision)
 * 最多 1 次外发；任何终态或非 route_pending 都 noop，绝不重发。
 *
 * goal 原文以参数传入（自由文本无 job_posting 可回读），仅用于重派生 digest 复核 + 喂受控
 * seam；绝不落库/落日志/落 cache/落 event。
 */
export async function classifyFreeTextScope(pool: DbPool, owner: string, scopeId: string, revision: number, goal: string, deps: {
  modelClassify: FreeTextRouteModelClassify;
}): Promise<ClassifyFreeTextScopeResult> {
  return asPrincipal(pool, owner, async (c) => {
    const rev = await c.query(
      'SELECT status, semantic_digest, input_hmac FROM free_text_scope_revision WHERE scope_id=$1 AND revision=$2 FOR UPDATE',
      [scopeId, revision],
    );
    if (rev.rowCount === 0) return { status: 'noop', reason: 'revision_not_found' } as const;
    const r = rev.rows[0] as { status: FreeTextScopeRevisionStatus; semantic_digest: string; input_hmac: string };
    if (r.status === 'route_decided') return { status: 'noop', reason: 'already_decided' } as const;
    if (r.status === 'route_unresolved') return { status: 'noop', reason: 'already_unresolved' } as const;
    if (r.status !== 'route_pending') return { status: 'noop', reason: 'not_pending' } as const;

    // goal 原文与 revision 的 digest 不一致 = 调用方传了与本 revision 不同的文本，fail-closed。
    const digest = canonicalFreeTextSemanticDigest({ goal });
    if (digest !== r.semantic_digest) return { status: 'noop', reason: 'stale_revision' } as const;
    if (computeFreeTextInputHmac(digest) !== r.input_hmac) throw codeError('free_text_route_input_hmac_mismatch');

    // ── rules 路径：唯一 leaf → route_decided，0 次模型外发 ──
    const ruleLeaf = classifyFreeTextByRule({ goal });
    if (ruleLeaf) {
      await c.query(
        `UPDATE free_text_scope_revision SET status='rule_decided', updated_at=clock_timestamp()
          WHERE scope_id=$1 AND revision=$2 AND status='route_pending'`,
        [scopeId, revision],
      );
      await appendFreeTextRouteEvent(c, { scopeId, owner, revision, fromStatus: 'route_pending', toStatus: 'rule_decided', reason: 'rule_unique_leaf', decisionId: null });
      const { decisionId } = await writeFreeTextRouteDecided(c, {
        scopeId, owner, revision, attemptOutcome: 'rule_decided',
        allocations: [{ leafTrackId: ruleLeaf, allocationBps: 10000 }],
        confidenceBps: 10000, marginBps: 10000, fromStatus: 'rule_decided',
      });
      return { status: 'route_decided', decisionId, attemptOutcome: 'rule_decided', modelCalls: 0 };
    }

    // ── 模型路径：先持久化 model_prepared 意图，再恰一次外发 ──
    await c.query(
      `UPDATE free_text_scope_revision SET status='model_prepared', updated_at=clock_timestamp()
        WHERE scope_id=$1 AND revision=$2 AND status='route_pending'`,
      [scopeId, revision],
    );
    await appendFreeTextRouteEvent(c, { scopeId, owner, revision, fromStatus: 'route_pending', toStatus: 'model_prepared', reason: 'rule_ambiguous', decisionId: null });

    let output: JobRouteModelOutput;
    try {
      output = await deps.modelClassify({ scopeId, revision, goal });
    } catch (err) {
      // 只有 seam 显式报告 dispatched_unknown 才落 unresolved；其余错误 rethrow（回滚，revision 仍 pending 可重试）。
      if ((err as { code?: unknown } | undefined)?.code !== 'dispatched_unknown') throw err;
      const { decisionId } = await writeFreeTextRouteUnresolved(c, { scopeId, owner, revision, attemptOutcome: 'dispatched_unknown', reasonCodes: ['dispatched_unknown'] });
      return { status: 'route_unresolved', decisionId, attemptOutcome: 'dispatched_unknown', reasonCodes: ['dispatched_unknown'], modelCalls: 1 };
    }

    // 模型主动含原因码 = 明确拒分（known_not_sent，未进入评分路径）。
    if (Array.isArray(output?.reasonCodes) && output.reasonCodes.length > 0) {
      const reasonCodes = output.reasonCodes.slice();
      const { decisionId } = await writeFreeTextRouteUnresolved(c, { scopeId, owner, revision, attemptOutcome: 'known_not_sent', reasonCodes });
      return { status: 'route_unresolved', decisionId, attemptOutcome: 'known_not_sent', reasonCodes, modelCalls: 1 };
    }

    const validated = validateModelRouteOutput(output);
    // `ok === false` (not `!ok`) keeps the discriminant narrowed under
    // strictNullChecks:false, which is how apps/api compiles this file.
    if (validated.ok === false) {
      const { decisionId } = await writeFreeTextRouteUnresolved(c, { scopeId, owner, revision, attemptOutcome: 'validation_rejected', reasonCodes: validated.reasons });
      return { status: 'route_unresolved', decisionId, attemptOutcome: 'validation_rejected', reasonCodes: validated.reasons, modelCalls: 1 };
    }

    // ── result_validated → route_decided ──
    await c.query(
      `UPDATE free_text_scope_revision SET status='result_validated', updated_at=clock_timestamp()
        WHERE scope_id=$1 AND revision=$2 AND status='model_prepared'`,
      [scopeId, revision],
    );
    await appendFreeTextRouteEvent(c, { scopeId, owner, revision, fromStatus: 'model_prepared', toStatus: 'result_validated', reason: null, decisionId: null });
    const { decisionId } = await writeFreeTextRouteDecided(c, {
      scopeId, owner, revision, attemptOutcome: 'result_validated',
      allocations: validated.allocations, confidenceBps: validated.confidenceBps, marginBps: validated.marginBps,
      fromStatus: 'result_validated',
    });
    return { status: 'route_decided', decisionId, attemptOutcome: 'result_validated', modelCalls: 1 };
  });
}
