/**
 * @meetwise/worker — 图执行组合根。长会话图在这里跑，不在 api 请求里跑
 * （否则长连接回到内存 session 反模式，正是本项目要杀的头号问题）。
 * 职责：拥有 PostgresSaver checkpointer、把 checkpointer + ai-runtime.invoke 注入纯 ai-graphs，
 * 凭 threadId 续跑/恢复。ai-graphs 因此得以保持纯逻辑（不引 db/checkpointer）。
 *
 * 骨架：当前给出组合根装配点；真实的队列消费/续跑循环 S5 落（见 production-backlog）。
 */
import { hostname } from 'node:os';
import { createServer, type Server } from 'node:http';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { buildMockInterviewGraph } from '@meetwise/ai-graphs';
import { webExplore, deepExplore, createSafeFetch, degradedRetrieval, type AllowedSource, type RawFetch } from '@meetwise/domain';
import {
  createPool, resolveDatabaseConnectionString, assertRuntimeLoginIdentity, asPrincipal, asQbankControlExecutor, assertQbankControlExecutorIdentity, assertQbankControlDefinerOwnership, activeQbankGeneration, cachedQbankSearch, gatewayCostBudgetSnapshot, gatewayJobGauges,
  qbankEvidenceForRefs, qbankQuestionResultsForHits, type GatewayCostBudgetSnapshot,
} from '@meetwise/db';
import { createLangfuseV5Runtime, resolveLangfuseConnection, resolveModelDeadlineConfig, resolveModelRateLimitConfig, setTracer, dashscopeEmbedder, cachingEmbedder, inMemoryEmbeddingStore, getMetrics, registerBaselineMetrics, METRIC, type Embedder, type ModelClient } from '@meetwise/ai-runtime';
import { assertLegacyInterviewGraphDisabled } from './production-config.ts';
import { runDrainLoop } from './drain-loop.ts';
import { startWorkerJobWakeupListener } from './job-wakeup-listener.ts';
import { defaultModelClient, fastModelClient, reportGenerator } from './interview-service.ts';
import { runReportDispatcher, type ReportWorkerDeps } from './report-worker.ts';
import { runInterviewConsumer } from './interview-consumer.ts';
import { runCommerceReconciler } from './commerce-reconcile.ts';
import { runModelInvocationReconciler, resolveModelInvocationReconcileConfig } from './model-invocation-reconcile.ts';
import { runQuizConsumer } from './quiz-consumer.ts';
import { runDiagnosisConsumer } from './diagnosis-consumer.ts';
import { ingestQbank, ingestQuestionBankArtifacts } from './qbank-ingest.ts';
import { QBANK_ARTIFACTS, QBANK_SEED } from './qbank-seed.ts';
import { ensureActiveQbankGeneration, qbankEmbeddingRecipe } from './qbank-generation.ts';
import { budgetedQbankEmbedding, resolveRagCostGovernance } from './rag-cost-governance.ts';
import { resolveModelCostGovernance, verifyModelCostGovernance } from './model-cost-governance.ts';
import { RedisQbankRetrievalCache, UnavailableQbankRetrievalCache, isProductionEnvironment, resolveRagRedisCacheConfig } from './rag-redis-cache.ts';
import { PrincipalBoundCheckpointPool } from './checkpoint-principal.ts';
import { runCheckpointPrivacyEraser } from './privacy-erasure-worker.ts';
import { initializePrivacyWorkerStartup } from './privacy-worker-runtime.ts';
import { initializeRagControlStartup } from './rag-control-runtime.ts';

/**
 * web 探索默认许可源:**权威公开技术源**(尊重 ToS、内容稳定可引)。构造 URL 走各站公开检索端点。
 * 默认非空 = CRAG fallback 真外呼已启用(SSRF 门在 createSafeFetch/isAllowed 里承重)。
 */
function src(domain: string, searchUrl: (q: string) => string): AllowedSource { return { domain, searchUrl }; }
const DEFAULT_WEB_ALLOWLIST: AllowedSource[] = [
  src('postgresql.org', (q) => `https://www.postgresql.org/search/?u=%2Fdocs%2F&q=${encodeURIComponent(q)}`),
  src('kubernetes.io', (q) => `https://kubernetes.io/search/?q=${encodeURIComponent(q)}`),
  src('redis.io', (q) => `https://redis.io/docs/latest/?q=${encodeURIComponent(q)}`),
  src('developer.mozilla.org', (q) => `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(q)}`),
  src('nginx.org', (q) => `https://nginx.org/en/docs/?q=${encodeURIComponent(q)}`),
  src('en.wikipedia.org', (q) => `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`),
];

/**
 * env WEB_ALLOWLIST 覆盖(逗号分隔域名)。未设 → 用默认权威源;显式设空串 → [](关闭外呼,只用本地题库)。
 * env 覆盖的域用通用 `?q=` 检索端点占位(运营配了就自负其责);SSRF 门仍在 isAllowed/createSafeFetch 兜底。
 */
function resolveWebAllowlist(raw: string | undefined): AllowedSource[] {
  if (raw === undefined) return DEFAULT_WEB_ALLOWLIST;                 // 未设 → 默认权威源
  const domains = raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return domains.map((domain) => src(domain, (q) => `https://${domain}/?q=${encodeURIComponent(q)}`));   // 设了(含空=[]) → 覆盖
}

/** 配置错误不应把整个本地检索静默降级为空：记录一次可操作告警并回退到经验证的安全范围。 */
function boundedIntEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (Number.isInteger(value) && value >= min && value <= max) return value;
  console.warn(`${name}=${JSON.stringify(raw)} invalid; using ${fallback} (allowed ${min}-${max})`);
  return fallback;
}

/** A release policy must be explicit in observability/cache identity. An invalid value degrades to the evaluated default. */
function qbankRetrievalMode(): 'dense' | 'rrf' {
  const raw = process.env.RAG_QBANK_RETRIEVAL_MODE;
  if (raw === undefined || raw === 'dense') return 'dense';
  if (raw === 'rrf') return 'rrf';
  console.warn(`RAG_QBANK_RETRIEVAL_MODE=${JSON.stringify(raw)} invalid; using dense (allowed dense|rrf)`);
  return 'dense';
}

/**
 * `useRuntimeRole=true` is for the production worker after migration 0043.
 * Tests and the one-time schema initializer deliberately leave it false so
 * PostgresSaver.setup() can exercise vendor DDL without granting DDL to apps.
 */
export function createCheckpointer(connString?: string, useRuntimeRole = false): PostgresSaver {
  const url = new URL(connString ?? resolveDatabaseConnectionString());
  if (useRuntimeRole) {
    // PostgresSaver owns an internal pool, so it cannot use asPrincipal(). Its tables are migrated in 0043 and
    // it must connect as the non-owner app_role rather than quietly retaining the runtime login's ambient power.
    const options = url.searchParams.get('options') ?? '';
    if (!/(?:^|\s)-c\s+role=app_role(?:\s|$)/.test(options))
      url.searchParams.set('options', `${options} -c role=app_role`.trim());
  }
  // Do not use PostgresSaver.fromConnString(): it internally constructs a bare
  // pg Pool and would silently bypass our CA/verify-full TLS policy. Sharing the
  // same factory makes ordinary DB work and LangGraph checkpoints one target and
  // one transport-security policy.
  const pool = createPool({ connectionString: url.toString() });
  return new PostgresSaver(useRuntimeRole ? new PrincipalBoundCheckpointPool(pool).asPool() : pool);
}

/** 组合根装配：把持久 checkpointer 注入纯 mock-interview 图。 */
export async function buildMockInterviewRunner(questions: string[], checkpointer?: PostgresSaver) {
  const cp = checkpointer ?? createCheckpointer();
  await cp.setup();
  return buildMockInterviewGraph(cp, questions);
}

/** 报告 worker 依赖。loadSummary 从事件账本聚合真实分数；generate **经 invoke 关口真模型出**(双校验,失败抛错→舱壁标 report failed)。 */
function reportWorkerDeps(pool: ReturnType<typeof createPool>, model: ModelClient): ReportWorkerDeps {
  const rawFaultInvocations = process.env.E2E_REPORT_FAIL_INVOCATIONS;
  const rawForceAll = process.env.E2E_REPORT_FAIL_ALL;
  if ((rawFaultInvocations !== undefined || rawForceAll !== undefined) && process.env.E2E_ISOLATED !== '1')
    throw new Error('e2e_report_fault_requires_isolated_target');
  if (rawForceAll !== undefined && rawForceAll !== '1')
    throw new Error('e2e_report_fail_all_invalid');
  const forceAllReportFailures = rawForceAll === '1';
  // A post-provider fault must target explicit calls.  "fail every call after
  // N" made a dedicated report-bulkhead test poison later, unrelated B-side
  // result tests and concealed whether a report outage affected score closing.
  // The parser is fail-closed: malformed / duplicate / non-positive sequence
  // numbers prevent worker boot instead of silently widening a chaos test.
  const faultInvocations = new Set<number>();
  if (rawFaultInvocations !== undefined) {
    const pieces = rawFaultInvocations.split(',').map((value) => value.trim());
    if (pieces.length === 0 || pieces.some((value) => !/^[1-9]\d*$/.test(value)))
      throw new Error('e2e_report_fault_invocations_invalid');
    for (const piece of pieces) {
      const value = Number(piece);
      if (!Number.isSafeInteger(value) || faultInvocations.has(value))
        throw new Error('e2e_report_fault_invocations_invalid');
      faultInvocations.add(value);
    }
  }
  let reportInvocations = 0;
  const generateLiveReport = (s: import('@meetwise/ai-graphs').InterviewSummary) =>
    reportGenerator(pool, s.owner!, `${s.interviewId}:report`, model)(s);
  return {
    loadSummary: (owner, interviewId) => asPrincipal(pool, owner, async (c) => {
      // 只消费由 question-bound worker 写入的评分事件。遗留 /answer 的
      // 固定 68 分没有题目/答案 provenance，不能作为报告或任何评分来源。
      const ev = await c.query(
        "SELECT (e.payload->>'score')::int AS s FROM interview_event e WHERE e.stream_key=$1 AND e.kind='answer_evaluated' AND e.payload ?& ARRAY['questionId','stateVersion','answerId','answerHash','competency'] AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$' AND (e.payload->>'score')::numeric BETWEEN 0 AND 100 AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved' AND EXISTS (SELECT 1 FROM interview_question q WHERE q.owner_user_id=e.owner_user_id AND q.interview_id=e.stream_key AND q.question_id=e.payload->>'questionId' AND q.state_version=CASE WHEN COALESCE(e.payload->>'stateVersion','') ~ '^[0-9]+$' THEN (e.payload->>'stateVersion')::int ELSE NULL END AND q.answer_id=e.payload->>'answerId' AND q.answer_hash=e.payload->>'answerHash' AND q.competency=e.payload->>'competency' AND q.status='answered') ORDER BY e.seq", [interviewId]);
      const scores = ev.rows.map((r) => r.s).filter((x): x is number => Number.isFinite(x));
      return { interviewId, questionCount: scores.length, scores, owner };
    }),
    // 真报告:经 invoke 关口(双校验)出。owner/幂等键据 summary;失败抛错 → worker 标 report failed(舱壁,不碰 interview)。
    // Isolated E2E may inject a *post-provider* fault to exercise the report
    // bulkhead without replacing OCR/ASR/TTS/LLM with a fake.  The live model
    // response is still obtained and validated first; production refuses this
    // flag before it can start.
    generate: async (s) => {
      const report = await generateLiveReport(s);
      reportInvocations++;
      // Counting selected calls is useful for a narrow chaos scenario, but an
      // end-to-end bulkhead proof must not depend on earlier real-model retry
      // counts.  The isolated-only all-calls switch is deterministic while
      // still failing only *after* a live provider response is validated.
      if (forceAllReportFailures || faultInvocations.has(reportInvocations))
        throw new Error('e2e_forced_report_post_provider_failure');
      return report;
    },
  };
}

/**
 * 队列健康 gauge 的 DB 数据源(**告警数据源**:queued 积压 / running 超租约(卡住) / DLQ 死信)。
 * queue 标签低基数、静态;`dead` 谓词各队列不同:report 的死信是 quarantined(耗尽重试终态),
 * 其余 job 的 'failed' 即终态死信(见 interview-consumer:markJobFailed 后发 *_unavailable,不重试)。
 * 表名/谓词均为硬编码常量(无注入面)。
 */
const JOB_GAUGE_QUEUES = ['interview_job', 'report', 'quiz_job', 'diagnosis_job'] as const;

/**
 * 一拍队列 gauge 刷新：仅调用无表权限网关的固定聚合函数。
 * **别拖垮 DB**:低频(默认 15s)+ 固定四个聚合、小表全扫可接受;查询失败由 drain-loop 兜底吞掉、下拍重试。
 * gauge 是全局绝对值:多实例各查同一 DB 得同值 → 告警侧 max() 去重(切勿 sum,翻倍)。
 */
export async function refreshJobGauges(pool: ReturnType<typeof createPool>): Promise<void> {
  const m = getMetrics();
  const byQueue = new Map((await gatewayJobGauges(pool)).map((row) => [row.queue, row]));
  for (const queue of JOB_GAUGE_QUEUES) {
    const row = byQueue.get(queue);
    m.setGauge(METRIC.jobsQueued, row?.queued ?? 0, { queue });
    m.setGauge(METRIC.jobsRunningExpired, row?.runningExpired ?? 0, { queue });
    m.setGauge(METRIC.jobsDead, row?.dead ?? 0, { queue });
  }
}

/**
 * worker 侧 /metrics 暴露端点(对齐 api 的 MetricsController 风格:纯聚合标量文本、无鉴权、生产由网络/ingress 限内网)。
 * worker 无 HTTP 业务面,故自挂一个极简 http server 供 Prometheus 抓取;渲染只出已注册指标(counter/gauge,标签仅 dep/queue)——
 * **不含任何 owner/PII/原文**,scrape 安全。`up{job="meetwise-worker"}` 由 Prometheus 抓取合成 = worker 存活数据源。
 */
export function startMetricsExposition(options: { ragReady?: () => boolean; workerReady?: () => boolean } = {}): Server {
  const port = Number(process.env.WORKER_METRICS_PORT || 9091);
  // Metrics carry queue/cost/dependency posture. Bind loopback by default; a
  // deployment must consciously opt in to a private scrape address.
  const host = process.env.WORKER_METRICS_HOST || '127.0.0.1';
  const server = createServer((req, res) => {
    const path = (req.url ?? '').split('?')[0];
    if (req.method === 'GET' && path === '/metrics') {
      res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4' });
      res.end(getMetrics().render());
    } else if (req.method === 'GET' && (path === '/healthz' || path === '/livez')) {
      res.writeHead(200, { 'content-type': 'text/plain' }); res.end('ok\n');
    } else if (req.method === 'GET' && path === '/readyz/rag') {
      const ready = options.ragReady?.() ?? true;
      res.writeHead(ready ? 200 : 503, { 'content-type': 'text/plain' }); res.end(ready ? 'ready\n' : 'degraded\n');
    } else if (req.method === 'GET' && path === '/readyz/worker') {
      const ready = options.workerReady?.() ?? true;
      res.writeHead(ready ? 200 : 503, { 'content-type': 'text/plain' }); res.end(ready ? 'ready\n' : 'unready\n');
    } else {
      res.writeHead(404); res.end();
    }
  });
  server.listen(port, host);
  server.unref?.();   // 不因 metrics server 阻止进程优雅退出
  console.log(`worker /metrics on ${host}:${port}`);
  return server;
}

/**
 * qbank generation is an optional read-model build. It must never hold the worker's command consumers hostage:
 * without an active, recipe-matching generation `localRetrieve` returns no local evidence and CRAG chooses its
 * ordinary bounded fallback. The source-of-truth interview/payment state machines stay available.
 *
 * This is deliberately not an automatic retry loop. Embedding is a billable POST and the provider contract has
 * no verified idempotency key here; uncertain transport failures need a scheduled/operator-owned rebuild run,
 * not blind at-least-once replays that can duplicate provider charges.
 */
async function initializeQbankReadModel(controlPool: ReturnType<typeof createPool>, embedder: Embedder, state: { ready: boolean }): Promise<void> {
  try {
    const generationSchema = await asQbankControlExecutor(controlPool, (c) =>
      c.query("SELECT to_regclass('qbank_vector_generation') IS NOT NULL AS ok")).then((r) => r.rows[0]?.ok === true);
    if (generationSchema) {
      // Migration-safe boot: only facts with their original text can enter a new vector generation. Existing legacy
      // vectors without facts block activation rather than being silently discarded or re-embedded from a hash.
      const seedChunkRefs = QBANK_ARTIFACTS.flatMap((artifact) => artifact.chunks.map((chunk) => chunk.refId));
      const seedFacts = await asQbankControlExecutor(controlPool, (c) =>
        c.query('SELECT count(*)::int n FROM qbank_chunk WHERE ref_id = ANY($1::text[])', [seedChunkRefs]))
        .then((r) => Number(r.rows[0]?.n ?? 0));
      if (seedFacts < seedChunkRefs.length) {
        const seeded = await ingestQuestionBankArtifacts(controlPool, QBANK_ARTIFACTS, embedder);
        console.log(`qbank question artifacts seeded/reconciled: questions=${seeded.questionCount} chunks=${seeded.chunkCount}`);
      }
      const generation = await ensureActiveQbankGeneration(controlPool, embedder);
      if (generation?.status === 'blocked_unrebuildable_legacy') {
        console.error(`qbank generation BLOCKED: ${generation.unrebuildableLegacyRefs?.length ?? 0}${(generation.unrebuildableLegacyRefs?.length ?? 0) >= 101 ? '+' : ''} visible legacy refs lack approved reconstructible text; local RAG fail-closed until operator reimports them`);
        return;
      }
      if (generation) {
        // `ensureActiveQbankGeneration` returns activated/reused. A prior active/exists spelling left retrieval
        // disabled after a normal worker restart, despite a valid active pointer in Postgres.
        state.ready = generation.status === 'activated' || generation.status === 'reused';
        console.log(`qbank generation ${generation.status}: ${generation.generationId ?? '-'} chunks=${generation.chunkCount} recipe=${generation.recipe.id}`);
      }
      return;
    }

    // Compatibility for proof fixtures / an intentionally pre-0029 database only. Production migrations install
    // generation schema before worker bootstrap, so this branch is never a vector-model upgrade path.
    const have = await asQbankControlExecutor(controlPool, (c) => c.query("SELECT count(*)::int n FROM vector_chunk WHERE kind='qbank'")).then((r) => r.rows[0].n);
    const governed = await asQbankControlExecutor(controlPool, (c) => c.query("SELECT count(*)::int n FROM qbank_pool_entry")).then((r) => r.rows[0].n);
    if (have < QBANK_SEED.length || governed < have) {
      const seeded = await ingestQbank(controlPool, QBANK_SEED, embedder);
      console.log(`legacy qbank seed/governance reconciliation: ${seeded}`);
    } else console.log('legacy qbank already seeded & governed:', have, '题');
    state.ready = true;
  } catch (error) {
    // Do not log a provider response/body: it can contain prompt data. The state remains false, so local RAG does
    // not send an embedding request for every interview turn while the builder is unavailable.
    const kind = error instanceof Error ? error.name : 'unknown_error';
    console.error(`qbank read model unavailable at boot (${kind}); local RAG fail-closed and command consumers remain available`);
  }
}

/** Strict-cost production never rebuilds vectors from the command-consumer process: rebuilding is billable and must be an operator-owned job. */
async function activateExistingQbankReadModel(pool: ReturnType<typeof createPool>, recipeId: string, state: { ready: boolean }): Promise<void> {
  try {
    const active = await asPrincipal(pool, 'qbank-readiness', (c) => activeQbankGeneration(c));
    state.ready = active?.recipeId === recipeId;
    if (!state.ready) console.error('qbank active generation unavailable or recipe mismatch; local RAG remains fail-closed until a governed rebuild is promoted');
  } catch (error) {
    console.error(`qbank active generation check failed (${error instanceof Error ? error.name : 'unknown_error'}); local RAG remains fail-closed`);
  }
}

function ragFailureOutcome(error: unknown): 'budget_exhausted' | 'policy_missing' | 'price_missing' | 'unknown' | 'claim_timeout' | 'cache_dependency_unavailable' | 'cache_value_invalid' | 'internal_error' {
  const code = (error as { code?: unknown } | undefined)?.code;
  if (code === 'qbank_retrieval_claim_timeout') return 'claim_timeout';
  if (code === 'rag_cache_dependency_unavailable') return 'cache_dependency_unavailable';
  if (code === 'rag_cache_value_invalid') return 'cache_value_invalid';
  if (code === 'external_outcome_unknown' || code === 'rag_cost_unknown') return 'unknown';
  if (typeof code === 'string' && code === 'rag_cost_budget_exhausted') return 'budget_exhausted';
  if (typeof code === 'string' && code === 'rag_cost_policy_missing') return 'policy_missing';
  if (typeof code === 'string' && code === 'rag_cost_price_missing') return 'price_missing';
  return 'internal_error';
}

function observeRagRetrieval(mode: 'dense' | 'rrf', outcome: string, cacheStatus: 'hit' | 'miss' | 'none' | 'unavailable' | 'invalid', latencyMs: number, candidates = 0): void {
  const metrics = getMetrics();
  metrics.inc(METRIC.ragRetrievalTotal, { outcome, mode });
  metrics.inc(METRIC.ragCacheTotal, { status: cacheStatus });
  metrics.observe(METRIC.ragRetrievalLatencyMs, latencyMs, { outcome, mode });
  metrics.observe(METRIC.ragRetrievalCandidates, candidates, { mode });
}

type CostSnapshotReader = (pool: ReturnType<typeof createPool>, scopeId: string) => Promise<GatewayCostBudgetSnapshot | undefined>;

/** Global budget gauges use one aggregate gateway read; no user, request, or query label enters Prometheus. */
async function refreshRagCostGauges(
  pool: ReturnType<typeof createPool>, scopeId: string | undefined, readSnapshot: CostSnapshotReader = gatewayCostBudgetSnapshot,
): Promise<boolean> {
  const metrics = getMetrics();
  if (!scopeId) {
    metrics.setGauge(METRIC.ragCostGovernanceEnabled, 0);
    return false;
  }
  const row = await readSnapshot(pool, scopeId);
  if (!row) {
    metrics.setGauge(METRIC.ragCostGovernanceEnabled, 0);
    return false;
  }
  const limit = row.monthlyLimitMicroCny;
  const used = row.usedMicroCny;
  metrics.setGauge(METRIC.ragCostGovernanceEnabled, 1);
  metrics.setGauge(METRIC.ragCostBudgetRemainingRatio, Math.max(0, Math.min(1, (limit - used) / limit)));
  metrics.setGauge(METRIC.ragCostUnknownReservations, row.unknownCount);
  return true;
}

/** Text/vision-model budget gauges use the same ledger truth as RAG, but a separate scope and metric family.
 * The query has no user dimension, so Prometheus cannot become a cost or PII side channel. */
export async function refreshModelCostGauges(
  pool: ReturnType<typeof createPool>, scopeId: string | undefined, readSnapshot: CostSnapshotReader = gatewayCostBudgetSnapshot,
): Promise<boolean> {
  const metrics = getMetrics();
  if (!scopeId) {
    metrics.setGauge(METRIC.modelCostGovernanceEnabled, 0);
    metrics.setGauge(METRIC.modelCostBudgetRemainingRatio, 0);
    metrics.setGauge(METRIC.modelCostUnknownReservations, 0);
    return false;
  }
  const row = await readSnapshot(pool, scopeId);
  if (!row) {
    metrics.setGauge(METRIC.modelCostGovernanceEnabled, 0);
    metrics.setGauge(METRIC.modelCostBudgetRemainingRatio, 0);
    metrics.setGauge(METRIC.modelCostUnknownReservations, 0);
    return false;
  }
  const limit = row.monthlyLimitMicroCny;
  const used = row.usedMicroCny;
  metrics.setGauge(METRIC.modelCostGovernanceEnabled, 1);
  metrics.setGauge(METRIC.modelCostBudgetRemainingRatio, Math.max(0, Math.min(1, (limit - used) / limit)));
  metrics.setGauge(METRIC.modelCostUnknownReservations, row.unknownCount);
  return true;
}

async function bootstrap() {
  // 组合根：持久 checkpointer + **真正启动**两个生产消费循环——报告调度 + 面试 job 消费(api 入队的 start/answer)。
  // Fail deployment before serving jobs if a timeout is malformed or the
  // transport could outlive the gateway deadline.
  resolveModelDeadlineConfig();
  resolveModelRateLimitConfig();
  const pool = createPool();
  const expectedRuntimeRole = process.env.APP_RUNTIME_DB_EXPECTED_ROLE?.trim();
  if (isProductionEnvironment() && !expectedRuntimeRole) throw new Error('APP_RUNTIME_DB_EXPECTED_ROLE is required in production');
  if (expectedRuntimeRole) await assertRuntimeLoginIdentity(pool, expectedRuntimeRole);
  // 观测:预注册基线指标序列(熔断打开/退款失败 counter 置 0)+ 自挂 /metrics 端点(Prometheus 抓取,up 即 worker 存活数据源)。
  registerBaselineMetrics();
  // Schema migration 由独立的一次性 migrate 服务完成；运行时 worker 绝不持有 DDL 权限，
  // 也不会在多副本启动时与 API/另一个 worker 竞争迁移锁。
  // 生产必须完成价格表、月度硬预算与调用前预留；开发可用 observe 跑本地样例，但该模式不可发布。
  const ragCost = resolveRagCostGovernance();
  const modelCost = resolveModelCostGovernance();
  // Exact model/price configuration is checked before any worker consumer,
  // queue loop or provider-capable dependency is assembled.  The runtime role
  // receives only a boolean predicate, never a writable price-book handle.
  await verifyModelCostGovernance(pool, modelCost);
  // Redis is the only qbank hot-cache backend. Its connection failure does not stop interview/payment consumers,
  // but local RAG subsequently fails closed (no legacy PostgreSQL cache read and no paid embedding retry).
  // Production must name a TLS-protected Tair endpoint.  Local isolated E2E has
  // no VPC data-plane access by design, so it gets an explicit fail-closed cache
  // port rather than a fake hit or forbidden PostgreSQL fallback; interviews can
  // still exercise their bounded no-local-RAG path.
  const ragCache = process.env.RAG_REDIS_URL
    ? await RedisQbankRetrievalCache.connect(resolveRagRedisCacheConfig())
    : (() => {
      if (isProductionEnvironment()) throw new Error('rag_redis_url_missing');
      getMetrics().setGauge(METRIC.ragCacheDependencyState, 0, { dependency: 'redis' });
      console.warn('RAG Redis endpoint is not configured; local RAG is fail-closed');
      return new UnavailableQbankRetrievalCache();
    })();
  // 价格/预算配置只在短生命周期 migrate 服务中以迁移账号写入；worker 只能读聚合快照，
  // 防止遭入侵的业务容器关闭预算或改写单价。
  const ragConfigured = await refreshRagCostGauges(pool, ragCost.scopeId);
  const modelConfigured = await refreshModelCostGauges(pool, modelCost.scopeId);
  if (ragCost.mode === 'enforce' && !ragConfigured) throw new Error('rag_cost_configuration_not_provisioned');
  if (modelCost.mode === 'enforce' && !modelConfigured) throw new Error('model_cost_configuration_not_provisioned');
  console.log(`rag cost governance: ${ragCost.mode}; model cost governance: ${modelCost.mode}`);
  // 0043 owns the vendor checkpoint schema. Calling PostgresSaver.setup() here would reintroduce runtime DDL;
  // a low-privilege startup must fail deployment migration, not acquire CREATE SCHEMA/TABLE rights.
  const cp = createCheckpointer(undefined, true);
  // Langfuse v5 uses the official OpenTelemetry exporter. Enabled means all
  // keys including the dedicated correlation secret are present, otherwise
  // startup rejects rather than silently emitting no data or leaking raw IDs.
  const langfuseConnection = resolveLangfuseConnection(process.env, { requireCorrelationSecret: true });
  const langfuse = langfuseConnection.enabled
    ? createLangfuseV5Runtime(langfuseConnection, { environment: process.env.NODE_ENV, release: process.env.APP_RELEASE ?? 'unknown' })
    : undefined;
  if (langfuse) {
    setTracer(langfuse.tracer);
    getMetrics().setGauge(METRIC.langfuseTracingState, 1, { state: 'enabled' });
    const flush = () => void langfuse.flush().catch(() => {
      getMetrics().inc(METRIC.langfuseExportFailures, { operation: 'flush' });
      getMetrics().setGauge(METRIC.langfuseTracingState, 1, { state: 'flush_failed' });
    });
    const timer = setInterval(flush, 5_000); timer.unref?.();
    console.log('observability: Langfuse v5 OpenTelemetry exporter attached');
  } else {
    getMetrics().setGauge(METRIC.langfuseTracingState, 1, { state: 'disabled' });
  }
  const leaseOwner = `${hostname()}#${process.pid}`;       // 每进程唯一,租约归属可辨
  // NOTIFY is a commit-delivered wakeup hint, not a queue. Every consumer
  // retains this bounded scan for listener outages, leases and future-due
  // report retries. The listener normally removes the previous 1.5s idle
  // discovery delay without increasing database polling.
  const jobReconcileIntervalMs = boundedIntEnv('WORKER_JOB_RECONCILE_INTERVAL_MS', 5_000, 1_000, 60_000);
  // Physical erasure uses a separate least-privilege database login.  Falling
  // back to the API/runtime pool would collapse the privilege boundary, so a
  // missing URL leaves requests visibly fenced/pending rather than pretending
  // the cleanup completed.
  const privacyPool = await initializePrivacyWorkerStartup(process.env);
  if (!privacyPool) console.warn('checkpoint privacy physical eraser disabled: dedicated database login is not configured');
  // The qbank control credential never shares the request-path runtime pool.
  // It is required only for a governed bootstrap rebuild; serving a previously
  // promoted immutable generation uses the normal read-only runtime path.
  const qbankControlUrl = process.env.QBANK_CONTROL_DATABASE_URL?.trim();
  const qbankControlPool = qbankControlUrl ? createPool({ connectionString: qbankControlUrl }) : undefined;
  if (qbankControlPool) {
    await assertQbankControlExecutorIdentity(qbankControlPool);
    await assertQbankControlDefinerOwnership(qbankControlPool);
  }
  // Generic/full-format RAG has no executable rebuild/outbox worker yet, so
  // mounting this credential cannot enable one.  If the credential is
  // mounted, however, fail startup before any worker loop starts unless the
  // live login and complete SECURITY DEFINER/RLS manifest are exact.
  const ragControlPool = await initializeRagControlStartup(process.env);
  const model = defaultModelClient({ primary: modelCost.policies.primary, backup: modelCost.policies.backup });
  const fastModel = fastModelClient({ primary: modelCost.policies.fastPrimary, backup: modelCost.policies.fastBackup });
  const reportLoop = runReportDispatcher(pool, leaseOwner, reportWorkerDeps(pool, model), jobReconcileIntervalMs);
  // 自适应图是唯一生产面试路径；旧固定题单会持久化原始回答且缺少 graph fence，禁止回退。
  // （principal/模型/query HMAC/k/语料 epoch；不落 query/简历/答案）+ PostgreSQL 权威 epoch/ANN/RLS/账本。
  // 检索 fail-soft:embedder/题库不可用 → 返 [] → CRAG 优雅降级(用能力出题),不让面试失败。
  const rawEmbedder = dashscopeEmbedder();
  const embedder = cachingEmbedder(rawEmbedder, inMemoryEmbeddingStore());
  if (ragCost.mode === 'enforce' && rawEmbedder.id !== ragCost.model) {
    throw new Error(`rag_cost_billing_model_mismatch:${rawEmbedder.id}`);
  }
  // qbank recipe is an immutable receipt over model revision, dimension, normalization and chunker. It is passed
  // to every query; cache versioning alone is not evidence that query and document vectors share a space.
  const qbankRecipe = qbankEmbeddingRecipe(embedder);
  // This is intentionally process-local readiness, not a source of truth. The database functions still verify the
  // active pointer/recipe on every read. Its only purpose is to avoid billable query embeddings while no active
  // generation exists or a boot-time build is unavailable.
  const qbankReadModel = { ready: false };
  const retrievalMode = qbankRetrievalMode();
  // web 探索许可源:默认权威公开技术源(启用 CRAG 外呼);env WEB_ALLOWLIST 覆盖,显式空串=关闭。
  // 之前漏声明 → 真跑 web-explore 路径时 ReferenceError 崩(E2E 实测抓到;假 gate 不跑此路径所以漏)。
  const WEB_ALLOWLIST: AllowedSource[] = resolveWebAllowlist(process.env.WEB_ALLOWLIST);
  // SSRF 门:真 fetch 包成 safeFetch——手动逐跳重定向 + 每跳 allowlist/私网复核 + 8s 硬超时 + fail-soft。
  const rawFetch: RawFetch = (u, init) => fetch(u, init);
  const safeFetch = createSafeFetch(rawFetch, WEB_ALLOWLIST, { timeoutMs: 8000 });
  assertLegacyInterviewGraphDisabled(process.env);
  const adaptive = {
    localRetrieve: async (owner: string, q: string) => {
      const started = performance.now();
      try {
        if (!qbankReadModel.ready) {
          observeRagRetrieval(retrievalMode, 'not_ready', 'none', Math.round(performance.now() - started));
          return [degradedRetrieval('not_ready')];
        }
        const cached = await cachedQbankSearch(pool, owner, {
          query: q,
          // Chunk retrieval overfetches deliberately: old/retired standalone chunks cannot become a question;
          // the next step groups only complete question artifacts and returns at most five of them to CRAG.
          k: 12,
          // HMAC cache identity includes both query embedder and immutable qbank recipe; active generation switch
          // additionally bumps corpus epoch. A mismatch throws inside DB and is caught below as safe no-local-RAG.
          embedderVersion: `${embedder.id}:dim=${embedder.dim}:recipe=${qbankRecipe.id}:retrieval=${retrievalMode}:v1`,
          qbankRecipeId: qbankRecipe.id,
          retrievalMode,
          cache: ragCache,
          // Strict mode intentionally uses the unwrapped provider adapter: the durable result cache already removes
          // repeated query calls, and a local cache hit must not reserve a second external-cost ledger entry.
          embed: budgetedQbankEmbedding(pool, owner, ragCost.mode === 'enforce' ? rawEmbedder : embedder, ragCost),
          ttlSeconds: boundedIntEnv('RAG_QBANK_CACHE_TTL_SECONDS', 120, 5, 3600),
          waitMs: boundedIntEnv('RAG_QBANK_CACHE_WAIT_MS', 5000, 100, 30000),
          leaseSeconds: boundedIntEnv('RAG_QBANK_CACHE_LEASE_SECONDS', 20, 5, 60),
        });
        const hits = cached.hits;
        const questionArtifactSchema = await asPrincipal(pool, owner, async (c) =>
          (await c.query("SELECT to_regclass('qbank_question') IS NOT NULL AS ok")).rows[0]?.ok === true,
        );
        if (questionArtifactSchema) {
          // A question is never represented by the one matching chunk. Resolve hits to a complete published
          // artifact under a second active-generation/ACL check, without first reading unused raw chunk text.
          const result = await asPrincipal(pool, owner, (c) => qbankQuestionResultsForHits(c, qbankRecipe.id, hits, 420));
          if (result.length) {
            observeRagRetrieval(retrievalMode, 'ok', cached.cacheStatus, Math.round(performance.now() - started), result.length);
            return result;
          }
          // The 0031 schema exists but none of the hit chunks belongs to a complete artifact. Fail closed rather
          // than allowing a legacy title-only chunk to be used as a scored interview question.
          observeRagRetrieval(retrievalMode, 'ok', cached.cacheStatus, Math.round(performance.now() - started), 0);
          return [];
        }
        // Pre-0031 proof fixtures retain only the old ref-only contract. Production migration installs 0031 before
        // worker boot, so this compatibility path cannot weaken a live question bank.
        const excerpts = await asPrincipal(pool, owner, (c) => qbankEvidenceForRefs(c, qbankRecipe.id, hits.map((h) => h.refId), 600));
        const byRef = new Map(excerpts.map((x) => [x.refId, x.excerpt]));
        const result = hits.flatMap((h) => {
          const evidence = byRef.get(h.refId);
          return evidence ? [{ ref: h.refId, score: Math.max(0, 1 - h.distance), evidence }] : [];
        });
        observeRagRetrieval(retrievalMode, 'ok', cached.cacheStatus, Math.round(performance.now() - started), result.length);
        return result;
      } catch (error) {
        const outcome = ragFailureOutcome(error);
        observeRagRetrieval(retrievalMode, outcome,
          outcome === 'cache_dependency_unavailable' ? 'unavailable' : outcome === 'cache_value_invalid' ? 'invalid' : 'none',
          Math.round(performance.now() - started));
        // 只打固定 reason code，不记录 owner/query/模型响应；Prometheus 和日志能定位降级类型而不泄漏输入。
        console.warn(`qbank retrieval degraded: ${outcome}`);
        return [degradedRetrieval(outcome)];
      }                                                                // 降级:无检索 → CRAG 走能力出题
    },
    // 单源 explorer 只作兼容 seam；运行中的低置信 CRAG 注入下方 deepResearch（最多 3 个
    // allowlist 源、每源 4k/总 12k 字符，safeFetch 已承重 SSRF/跳转/超时）。显式空串=只用本地。
    webExplore: (q: string) => webExplore(q, WEB_ALLOWLIST, safeFetch),
    deepResearch: WEB_ALLOWLIST.length > 0
      ? async (q: string) => (await deepExplore(q, WEB_ALLOWLIST, safeFetch, {
        maxSources: 3, maxCharsPerSource: 4_000, maxTotalChars: 12_000, maxQueryChars: 256,
      })).docs
      : undefined,
    graphObserver: langfuse?.graphObserver,
    role: '技术岗',
    // 实时供应商 E2E 不能用本地模型替身。为把浏览器收口测试控制在费用/时间预算内，
    // 仅临时隔离库允许 1–8 轮的显式上限；任何其他环境都不读取该变量，保持图默认 8 轮。
    maxTurns: process.env.E2E_ISOLATED === '1'
      ? boundedIntEnv('E2E_ADAPTIVE_MAX_TURNS', 8, 1, 8)
      : undefined,
  };
  const interviewLoop = runInterviewConsumer({ pool, cp, model, fastModel, leaseOwner, adaptive }, jobReconcileIntervalMs);
  if (adaptive) console.log('interview: ADAPTIVE agent on (规划→自适应决策→CRAG出题→反思→评估→报告舱壁)');
  // 押题(resume-quiz)消费循环:api 入队 generate job → 本消费者跑图/模型 → 业务事件经 SSE 回前端。
  const quizLoop = runQuizConsumer({ pool, model, leaseOwner }, jobReconcileIntervalMs);
  // 简历诊断(resume-diagnosis)消费循环:api 入队 generate job → 本消费者跑图/模型 → 业务事件经 SSE 回前端。
  const diagnosisLoop = runDiagnosisConsumer({ pool, model, leaseOwner }, jobReconcileIntervalMs);
  // This is a dedicated, otherwise-idle PG session. It never performs RLS
  // work or claims jobs: every notification merely coalesces a normal drain
  // across all queue classes. Notifications contain no job or tenant data.
  const jobWakeupListener = startWorkerJobWakeupListener(createPool({ max: 1 }), () => {
    reportLoop.wake();
    interviewLoop.wake();
    quizLoop.wake();
    diagnosisLoop.wake();
  }, { closePoolOnStop: true });
  // **商务对账兜底(C1)**:周期回收租约过期的孤儿预留(中途弃/进程崩→退额度回池,零泄漏) + 把 confirm 投的结算 outbox 真实入账本。
  // 无它则:弃面试的预留永久挂 reserved 漏额度、结算账本永不落。多实例安全(sweep 行锁 + settle SKIP LOCKED,幂等)。
  const commerceLoop = runCommerceReconciler(pool);
  // Post-dispatch model calls are never automatically replayed.  This loop
  // only freezes stale indeterminate work as unknown together with its cost
  // reservation, making the ambiguity observable and preventing a second
  // billable send under the same idempotency key.
  const modelInvocationReconcileLoop = runModelInvocationReconciler(pool, resolveModelInvocationReconcileConfig());
  const privacyErasureLoop = privacyPool ? runCheckpointPrivacyEraser(privacyPool, `${leaseOwner}:privacy`) : undefined;
  // 队列健康 gauge 刷新循环(告警数据源:queued/卡住/DLQ 深度)。低频 15s,查询失败经 drain-loop 兜底不停循环。
  const gaugeLoop = runDrainLoop(() => Promise.all([
    refreshJobGauges(pool), refreshRagCostGauges(pool, ragCost.scopeId), refreshModelCostGauges(pool, modelCost.scopeId),
  ]).then(() => undefined), Number(process.env.WORKER_GAUGE_INTERVAL_MS || 15000));
  const metricsServer = startMetricsExposition({
    ragReady: () => ragCache.available && qbankReadModel.ready,
    workerReady: () => reportLoop.ready() && interviewLoop.ready() && quizLoop.ready() && diagnosisLoop.ready()
      && jobWakeupListener.ready() && commerceLoop.ready() && modelInvocationReconcileLoop.ready() && (privacyErasureLoop?.ready() ?? true),
  });
  // Start consumers before the optional external embedding build. A failure can only disable local evidence, never
  // turn an infrastructure dependency into an interview/payment availability outage.
  if (adaptive) {
    // A cache outage must not become a paid bootstrap rebuild.  With no active
    // Redis/Tair singleflight, local RAG remains fail-closed and every command
    // consumer still serves its bounded non-RAG path.
    if (!ragCache.available) {
      console.warn('qbank read model disabled: Redis/Tair singleflight unavailable');
    } else if (ragCost.mode === 'enforce') {
      void activateExistingQbankReadModel(pool, qbankRecipe.id, qbankReadModel);
    } else if (!qbankControlPool) {
      console.error('qbank read model unavailable: QBANK_CONTROL_DATABASE_URL is required for a governed rebuild; local RAG remains fail-closed');
    } else {
      void initializeQbankReadModel(qbankControlPool, embedder, qbankReadModel);
    }
  }
  process.on('SIGTERM', async () => { await jobWakeupListener.stop().catch(() => {}); await Promise.allSettled([Promise.resolve(reportLoop.stop()), interviewLoop.stop(), quizLoop.stop(), diagnosisLoop.stop(), commerceLoop.stop(), modelInvocationReconcileLoop.stop(), privacyErasureLoop?.stop() ?? Promise.resolve(), gaugeLoop.stop(), ragCache.close(), privacyPool?.end() ?? Promise.resolve(), qbankControlPool?.end() ?? Promise.resolve(), ragControlPool?.end() ?? Promise.resolve(), langfuse?.shutdown()]); metricsServer.close(); console.log('drained, exiting'); process.exit(0); });   // 优雅排空在飞 job 再退
  console.log(`worker ${ragCache.available ? 'ready' : 'degraded'}: event wakeup + ${jobReconcileIntervalMs}ms bounded reconciliation for report/interview/quiz/diagnosis + commerce reconciler + model invocation reconciler + privacy eraser(${privacyErasureLoop ? 'enabled' : 'pending dedicated login'}) + gauge refresh started as`, leaseOwner);
}

if (process.env.WORKER_BOOTSTRAP === '1') bootstrap();
