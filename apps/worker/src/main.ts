/**
 * @meetwise/worker — 图执行组合根。长会话图在这里跑，不在 api 请求里跑
 * （否则长连接回到内存 session 反模式，正是本项目要杀的头号问题）。
 * 职责：拥有 PostgresSaver checkpointer、把 checkpointer + ai-runtime.invoke 注入纯 ai-graphs，
 * 凭 threadId 续跑/恢复。ai-graphs 因此得以保持纯逻辑（不引 db/checkpointer）。
 *
 * 骨架：当前给出组合根装配点；真实的队列消费/续跑循环 S5 落（见 production-backlog）。
 */
import { hostname } from 'node:os';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { buildMockInterviewGraph } from '@meetwise/ai-graphs';
import { webExplore, type AllowedSource } from '@meetwise/domain';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, runMigrations, loadMigrations, annSearch } from '@meetwise/db';
import { langfuseTracer, httpSpanTransport, setTracer, dashscopeEmbedder, cachingEmbedder, inMemoryEmbeddingStore, type ModelClient } from '@meetwise/ai-runtime';
import { defaultModelClient, fastModelClient, reportGenerator } from './interview-service.ts';
import { runReportDispatcher, type ReportWorkerDeps } from './report-worker.ts';
import { runInterviewConsumer } from './interview-consumer.ts';
import { runCommerceReconciler } from './commerce-reconcile.ts';
import { runQuizConsumer } from './quiz-consumer.ts';
import { runDiagnosisConsumer } from './diagnosis-consumer.ts';
import { ingestQbank, QBANK_OWNER } from './qbank-ingest.ts';
import { QBANK_SEED } from './qbank-seed.ts';

export function createCheckpointer(connString?: string): PostgresSaver {
  const conn = connString
    ?? process.env.DATABASE_URL
    ?? 'postgresql://meetwise:meetwise_dev_password@127.0.0.1:54329/meetwise';
  return PostgresSaver.fromConnString(conn);
}

/** 组合根装配：把持久 checkpointer 注入纯 mock-interview 图。 */
export async function buildMockInterviewRunner(questions: string[], checkpointer?: PostgresSaver) {
  const cp = checkpointer ?? createCheckpointer();
  await cp.setup();
  return buildMockInterviewGraph(cp, questions);
}

/** 报告 worker 依赖。loadSummary 从事件账本聚合真实分数；generate **经 invoke 关口真模型出**(双校验,失败抛错→舱壁标 report failed)。 */
function reportWorkerDeps(pool: ReturnType<typeof createPool>, model: ModelClient): ReportWorkerDeps {
  return {
    loadSummary: (owner, interviewId) => asPrincipal(pool, owner, async (c) => {
      // **剔除非作答(跳过/探尽未决)**:这些题没真实考察,绝不能把"未展开"当 0 分拉低综合分(career advice 失真红线)。
      // 历史事件无 outcome 字段 → COALESCE 当 'answered' 计入(向后兼容)。
      const ev = await c.query(
        "SELECT (payload->>'score')::int AS s FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND COALESCE(payload->>'outcome','answered') <> 'unresolved' ORDER BY seq", [interviewId]);
      const scores = ev.rows.map((r) => r.s).filter((x): x is number => Number.isFinite(x));
      return { interviewId, questionCount: scores.length, scores, owner };
    }),
    // 真报告:经 invoke 关口(双校验)出。owner/幂等键据 summary;失败抛错 → worker 标 report failed(舱壁,不碰 interview)。
    generate: (s) => reportGenerator(pool, s.owner!, `${s.interviewId}:report`, model)(s),
  };
}

async function bootstrap() {
  // 组合根：持久 checkpointer + **真正启动**两个生产消费循环——报告调度 + 面试 job 消费(api 入队的 start/answer)。
  const pool = createPool();
  // 启动先跑版本化迁移(只跑待应用、幂等、advisory 锁)——替掉 init-scripts 只跑一次/drop+recreate 丢数据。
  const migDir = fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url));
  const mig = await runMigrations(pool, loadMigrations(migDir));
  console.log(`migrations: applied ${mig.applied.length}, skipped ${mig.skipped.length}`);
  const cp = createCheckpointer(); await cp.setup();
  // 观测:配了 Langfuse creds 就把 invoke 关口的脱敏 span 接上(fail-open,挂了不拖垮业务);定时 flush。
  if (process.env.LANGFUSE_PUBLIC_KEY) {
    const lf = langfuseTracer(httpSpanTransport());
    setTracer(lf);
    const t = setInterval(() => void lf.flush(), 5000); t.unref?.();
    process.on('SIGTERM', () => void lf.flush());
    console.log('observability: Langfuse tracer attached');
  }
  const leaseOwner = `${hostname()}#${process.pid}`;       // 每进程唯一,租约归属可辨
  const model = defaultModelClient();                      // 生产质量模型(出题/报告等);未配 MODEL_* 则降级
  const fastModel = fastModelClient();                     // 快模型(评分/规划等约束性任务,降反问延迟)
  const reportLoop = runReportDispatcher(pool, leaseOwner, reportWorkerDeps(pool, model));
  // 自适应 agent 默认开(ADAPTIVE_INTERVIEW=0 退回旧固定题单流程)。注真检索:缓存 embedder + annSearch(qbank)。
  // 检索 fail-soft:embedder/题库不可用 → 返 [] → CRAG 优雅降级(用能力出题),不让面试失败。
  const embedder = cachingEmbedder(dashscopeEmbedder(), inMemoryEmbeddingStore());
  // web 探索许可源**默认空**(空 = 只用本地题库;运营按需在此配 {domain, searchUrl} 授权源)。
  // 之前漏声明 → 真跑 web-explore 路径时 ReferenceError 崩(E2E 实测抓到;假 gate 不跑此路径所以漏)。
  const WEB_ALLOWLIST: AllowedSource[] = [];
  const adaptive = process.env.ADAPTIVE_INTERVIEW === '0' ? undefined : {
    localRetrieve: async (owner: string, q: string) => {
      try {
        const [vec] = await embedder.embed([q]);
        const hits = await asPrincipal(pool, owner, (c) => annSearch(c, owner, 'qbank', vec, 5));
        return hits.map((h) => ({ ref: h.refId, score: Math.max(0, 1 - h.distance) }));   // 距离→相似度
      } catch { return []; }                                                                // 降级:无检索 → CRAG 走能力出题
    },
    // 真 web 探索机制已接(allowlist 强制 + 注入 fetch + 抽取 + 降级);**allowlist 默认空**(源/授权由你配 WEB_ALLOWLIST),空 = 只用本地。
    webExplore: (q: string) => webExplore(q, WEB_ALLOWLIST, async (url) => {
      try { const r = await fetch(url, { signal: AbortSignal.timeout(8000) }); if (!r.ok) return null; return { url, text: (await r.text()).replace(/<[^>]+>/g, ' ').slice(0, 8000) }; } catch { return null; }
    }),
    role: '技术岗',
  };
  if (adaptive) {
    // 性能:**已灌则跳过**——否则每次开机都对全部种子调 embedder API 重嵌入(无谓成本+延迟)。
    const have = await asPrincipal(pool, QBANK_OWNER, (c) => c.query("SELECT count(*)::int n FROM vector_chunk WHERE kind='qbank'")).then((r) => r.rows[0].n).catch(() => 0);
    if (have < QBANK_SEED.length) { const seeded = await ingestQbank(pool, QBANK_SEED, embedder).catch(() => 0); console.log('qbank seed:', seeded, '题'); }
    else console.log('qbank already seeded:', have, '题(跳过重嵌入)');
  }
  const interviewLoop = runInterviewConsumer({ pool, cp, model, fastModel, leaseOwner, adaptive });
  if (adaptive) console.log('interview: ADAPTIVE agent on (规划→自适应决策→CRAG出题→反思→评估→报告舱壁)');
  // 押题(resume-quiz)消费循环:api 入队 generate job → 本消费者跑图/模型 → 业务事件经 SSE 回前端。
  const quizLoop = runQuizConsumer({ pool, model, leaseOwner });
  // 简历诊断(resume-diagnosis)消费循环:api 入队 generate job → 本消费者跑图/模型 → 业务事件经 SSE 回前端。
  const diagnosisLoop = runDiagnosisConsumer({ pool, model, leaseOwner });
  // **商务对账兜底(C1)**:周期回收租约过期的孤儿预留(中途弃/进程崩→退额度回池,零泄漏) + 把 confirm 投的结算 outbox 真实入账本。
  // 无它则:弃面试的预留永久挂 reserved 漏额度、结算账本永不落。多实例安全(sweep 行锁 + settle SKIP LOCKED,幂等)。
  const commerceLoop = runCommerceReconciler(pool);
  process.on('SIGTERM', async () => { await Promise.allSettled([Promise.resolve(reportLoop.stop()), interviewLoop.stop(), quizLoop.stop(), diagnosisLoop.stop(), commerceLoop.stop()]); console.log('drained, exiting'); process.exit(0); });   // 优雅排空在飞 job 再退
  console.log('worker ready: report dispatcher + interview consumer + quiz consumer + diagnosis consumer + commerce reconciler started as', leaseOwner);
}

if (process.env.WORKER_BOOTSTRAP === '1') bootstrap();
