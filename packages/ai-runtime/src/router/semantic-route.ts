/**
 * GAP-RAG-05 semantic classifier — 生产 RAG 语义/LLM 意图分类漏斗（Stage S · scripted/fixture 缝 · 零外呼）。
 *
 * CMD 消歧（C-4 · 文件头 disambiguation note）：prove CMD = `gap-rag05-classifier:prove`，
 * 与既有 `rag05-qbank-miss:prove`（root `package.json:252` · UC proof 族编号，rag05 =
 * qbank-miss case）**同名异义**——本模块属 backlog 行 GAP-RAG-05（semantic classifier ·
 * `gap-bug-backlog.md:73`）；两者零共享断言面，本模块不 import、不触、不改 qbank-miss 面。
 *
 * 漏斗（register PRD-TEST-017 / `architecture/ai/classifier-router-tier.md` §2「RAG 题域路由」行）：
 *   ① 规则命中（`classifyJobByRule` 冻结信号词典唯一 leaf）→ 直接 decided，**模型调用=0**；
 *   ② 规则 miss → 轻量模型 **strict-enum**：输出经 `validateModelRouteOutput` 服务端双重
 *      校验（schema → business），只接受 `TAXONOMY_V1_LEAVES` 8 叶内的建议；
 *      低置信 / unknown（schema 非法·空建议）/ 越权（非 allowlist 叶）→ unresolved +
 *      `clarificationRequired` + **0 检索**（人工澄清漏斗，Ban 兜底全量检索 · Ban 用户选桶）；
 *   ③ 同 scope 并发至多一次 attempt（in-flight guard）；模型缝 throw/超时/非法输出 →
 *      unresolved、不崩、**模块内零自动重试**（FAULT；sticky 持久化语义归 R2/RAG-07 db
 *      状态机既有 CLOSED/CLOSED 面，本模块不复制不替代）；注入/多语言/跨叶混淆输入 →
 *      建议仍落 allowlist 或 unresolved（ADV）。
 *
 * 只建议、不授权：decided 仅携带 allowlisted track 建议（leafTrackId/allocationBps/
 * confidence/margin），结构上没有任何读取/工具/检索授予面；**不得替代 R4 硬过滤**
 * （分类建议 ≠ 检索授权；R4 硬过滤仍是权威，本模块不 import 不触 R4 面）。
 *
 * Stage S（本刀授权面）：`modelClassify` 只能是注入的受控 seam（proof 注入 scripted
 * fixture）；本模块零网络客户端构造、零 provider 外呼。Stage L（真模型 live eval · 量化面：
 * misroute/Recall@K/P95/成本生产等价冻结）**不在 Stage S 授权内**——须 EXEC 再显式授权
 * （AD P4）+ 预算重报 + 阈值先冻（`SEMANTIC_ROUTE_PERF_BUDGET` 已先于首调冻结）+
 * H19 temperature=0 + 固定 prompt 版本 + 决策持久化。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=202 软删受理(purge_pending) ·
 * EXIT0 ≠ GAP-RAG-05 `:73` CLOSED ≠ 语义质量冻结 ≠ covered flip ≠ `:70`/`:71` close ≠
 * router 生产接线宣称 ≠ HA ≠ 替代 R4 · CRAG/`researchBoundary` ≠ router 口径不变。
 */
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import {
  classifyJobByRule,
  validateModelRouteOutput,
  JOB_ROUTE_TAXONOMY_VERSION,
  JOB_ROUTE_POLICY_VERSION,
  JOB_ROUTE_TOTAL_BPS,
  TAXONOMY_V1_LEAVES,
  type JobRouteAllocation,
  type JobRouteModelOutput,
  type TaxonomyLeaf,
} from '@meetwise/domain';

const normalize = (t: string) => t.normalize('NFKC').trim();

/** scope 语义 canonical digest：独立命名空间 `semantic-route:v1`（{goal} 形状），与 job/free-text 命名空间结构隔离。 */
export function canonicalSemanticRouteDigest(input: { goal: string }): string {
  const goal = normalize(input.goal);
  return createHash('sha256').update(JSON.stringify({ v: 'semantic-route:v1', goal })).digest('hex');
}

/** strict-enum 模型缝输入合同：scope 身份 + digest（原文不进缝合同）+ allowlist 白名单。 */
export interface SemanticRouteModelClassifyInput {
  scopeKey: string;
  semanticDigest: string;
  taxonomyLeaves: readonly TaxonomyLeaf[];
}

/** 受控模型缝（Stage S：proof 注入 scripted fixture · 零外呼；Stage L：MODEL-OP typed binding 承接，另授权）。 */
export type SemanticRouteModelClassify = (input: SemanticRouteModelClassifyInput) => Promise<JobRouteModelOutput>;

export type SemanticRouteUnresolvedReason =
  | 'low_confidence'
  | 'over_privileged_suggestion'
  | 'invalid_model_output'
  | 'model_seam_failure'
  | 'attempt_in_flight';

export type SemanticRouteDecision =
  | {
      kind: 'decided';
      source: 'rule' | 'model';
      scopeKey: string;
      semanticDigest: string;
      allocations: JobRouteAllocation[];
      confidenceBps: number;
      marginBps: number;
      modelCalls: 0 | 1;
      durationMs: number;
    }
  | {
      kind: 'unresolved';
      reason: SemanticRouteUnresolvedReason;
      scopeKey: string;
      semanticDigest: string;
      reasonCodes: string[];
      modelCalls: 0 | 1;
      retrievalDispatched: 0;
      toolGrant: false;
      readGrant: false;
      clarificationRequired: true;
      durationMs: number;
    };

/** 实例级 attempts 台账：每次 classify 恰一条（含失败/并发拒绝），全记录不丢弃（C-5 模块面）。 */
export interface SemanticRouteAttemptRecord {
  seq: number;
  scopeKey: string;
  semanticDigest: string;
  outcome: 'decided' | 'unresolved';
  source: 'rule' | 'model' | null;
  reason: SemanticRouteUnresolvedReason | null;
  modelCalls: 0 | 1;
  durationMs: number;
}

/**
 * 预注册 PERF/成本阈值（C-3 / CC-R8：**先于 Stage L 首调冻结** · Ban 事后改值凑绿）。
 * Stage S 只落机制（决策携带 durationMs + 阈值可断言）；误路由率/Recall@K/P95/成本**实测**
 * 留 Stage L（production-equivalent eval · FUNNEL-08 holdout 口径）。数值改动 = 改路由语义，
 * 必须另走授权刀并升 policy 说明，Ban 就地改。
 */
export const SEMANTIC_ROUTE_PERF_BUDGET = {
  stage: 'L',
  frozenAt: '2026-10-07',
  taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION,
  policyVersion: JOB_ROUTE_POLICY_VERSION,
  /** 误路由（wrong-track）holdout 上限 = 0（FUNNEL-08 wrong-track=0 口径）。 */
  misrouteHoldoutMax: 0,
  /** per-leaf Recall@5 下限（bps · 万分之一，0.80）。 */
  perLeafRecallAt5MinBps: 8000,
  /** 单次 classify（模型路径）P95 延迟预算（ms · 便宜档 few-shot 量级）。 */
  p95ModelClassifyLatencyMs: 3000,
  /** live 成本硬帽（CNY · 超帽立即 abort 记录 · C-HA-1/§3.5）。 */
  costHardCapCny: 20,
} as const;

/** Stage S 模块内单次模型缝等待上限（默认对齐 P95 预算；纯进程内计时器，非网络）。 */
export const SEMANTIC_ROUTE_SEAM_TIMEOUT_MS = SEMANTIC_ROUTE_PERF_BUDGET.p95ModelClassifyLatencyMs;

export interface SemanticRouteClassifierOptions {
  modelClassify: SemanticRouteModelClassify;
  timeoutMs?: number;
}

export interface SemanticRouteClassifier {
  classify(input: { scopeKey: string; goal: string }): Promise<SemanticRouteDecision>;
  /** attempts 全台账（快照副本 · append-only）。 */
  attempts(): readonly SemanticRouteAttemptRecord[];
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('semantic_route_seam_timeout')), timeoutMs);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/**
 * 语义分类漏斗工厂。规则路径纯同步零模型；模型路径受同 scope in-flight guard 约束
 * （并发第二调用者得 `attempt_in_flight` · 不触发第二次缝调用），缝失败/超时/非法输出
 * 一律 unresolved + clarificationRequired，模块内零自动重试。
 */
export function createSemanticRouteClassifier(options: SemanticRouteClassifierOptions): SemanticRouteClassifier {
  const timeoutMs = options.timeoutMs ?? SEMANTIC_ROUTE_SEAM_TIMEOUT_MS;
  const inflightScopes = new Set<string>();
  const ledger: SemanticRouteAttemptRecord[] = [];

  const finish = (
    partial: Omit<SemanticRouteAttemptRecord, 'seq'>,
    decision: SemanticRouteDecision,
  ): SemanticRouteDecision => {
    ledger.push({ seq: ledger.length + 1, ...partial });
    return decision;
  };

  const classify = async (input: { scopeKey: string; goal: string }): Promise<SemanticRouteDecision> => {
    const t0 = performance.now();
    const goal = normalize(input.goal);
    const scopeKey = input.scopeKey;
    const semanticDigest = canonicalSemanticRouteDigest({ goal });
    const elapsed = () => Math.round((performance.now() - t0) * 1000) / 1000;

    // ① 规则命中 → 直接 decided · 模型调用=0（冻结词典唯一命中 = 策略满信，与 R2 rule_decided 口径一致）。
    const ruleLeaf = classifyJobByRule({ title: goal, description: '', competencies: [] });
    if (ruleLeaf) {
      return finish(
        { scopeKey, semanticDigest, outcome: 'decided', source: 'rule', reason: null, modelCalls: 0, durationMs: elapsed() },
        {
          kind: 'decided', source: 'rule', scopeKey, semanticDigest,
          allocations: [{ leafTrackId: ruleLeaf, allocationBps: JOB_ROUTE_TOTAL_BPS }],
          confidenceBps: JOB_ROUTE_TOTAL_BPS, marginBps: JOB_ROUTE_TOTAL_BPS,
          modelCalls: 0, durationMs: elapsed(),
        },
      );
    }

    // ③ BOUND：同 scope 并发至多一次 attempt——第二个并发调用者不触发第二次缝调用。
    if (inflightScopes.has(scopeKey)) {
      return finish(
        { scopeKey, semanticDigest, outcome: 'unresolved', source: null, reason: 'attempt_in_flight', modelCalls: 0, durationMs: elapsed() },
        {
          kind: 'unresolved', reason: 'attempt_in_flight', scopeKey, semanticDigest,
          reasonCodes: ['scope_attempt_in_flight'], modelCalls: 0,
          retrievalDispatched: 0, toolGrant: false, readGrant: false,
          clarificationRequired: true, durationMs: elapsed(),
        },
      );
    }

    // ② strict-enum 模型路径：受控缝 + 服务端双重校验；失败一律澄清，不崩不重试（FAULT）。
    inflightScopes.add(scopeKey);
    try {
      const output = await withTimeout(
        options.modelClassify({ scopeKey, semanticDigest, taxonomyLeaves: TAXONOMY_V1_LEAVES }),
        timeoutMs,
      );
      const validated = validateModelRouteOutput(output);
      if (validated.ok) {
        return finish(
          { scopeKey, semanticDigest, outcome: 'decided', source: 'model', reason: null, modelCalls: 1, durationMs: elapsed() },
          {
            kind: 'decided', source: 'model', scopeKey, semanticDigest,
            allocations: validated.allocations,
            confidenceBps: validated.confidenceBps, marginBps: validated.marginBps,
            modelCalls: 1, durationMs: elapsed(),
          },
        );
      }
      // 精确原因映射：低置信 / 越权（非 allowlist 叶）/ 其余 schema·校准·过宽·冲突 → invalid。
      const reason: SemanticRouteUnresolvedReason = validated.reasons.includes('low_confidence')
        ? 'low_confidence'
        : validated.reasons.includes('taxonomy_invalid')
          ? 'over_privileged_suggestion'
          : 'invalid_model_output';
      return finish(
        { scopeKey, semanticDigest, outcome: 'unresolved', source: 'model', reason, modelCalls: 1, durationMs: elapsed() },
        {
          kind: 'unresolved', reason, scopeKey, semanticDigest,
          reasonCodes: [...validated.reasons], modelCalls: 1,
          retrievalDispatched: 0, toolGrant: false, readGrant: false,
          clarificationRequired: true, durationMs: elapsed(),
        },
      );
    } catch (err) {
      const code = err instanceof Error ? err.message : 'semantic_route_seam_failure';
      return finish(
        { scopeKey, semanticDigest, outcome: 'unresolved', source: 'model', reason: 'model_seam_failure', modelCalls: 1, durationMs: elapsed() },
        {
          kind: 'unresolved', reason: 'model_seam_failure', scopeKey, semanticDigest,
          reasonCodes: [code], modelCalls: 1,
          retrievalDispatched: 0, toolGrant: false, readGrant: false,
          clarificationRequired: true, durationMs: elapsed(),
        },
      );
    } finally {
      inflightScopes.delete(scopeKey);
    }
  };

  return { classify, attempts: () => [...ledger] };
}
