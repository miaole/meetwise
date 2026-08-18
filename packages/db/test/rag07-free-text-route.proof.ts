/**
 * RAG-FUNNEL-07 / 自由文本自动漏斗与成本/unknown proof（真隔离 PostgreSQL + 全迁移链）。
 *
 * 把 RAG-03 的岗位意图自动路由**结构同构但 scope 隔离**地复用到自由文本（专项训练目标 /
 * 未来受限多语料请求），**不扩大权限**：
 *   FreeTextScopeRevision(不可变，只存 digest+HMAC) → 分类漏斗(0 或 1 次模型外发)
 *   → route_decided/unresolved；**无 binding/snapshot/plan/检索消费链**。
 *
 * 七类对抗矩阵：
 *   ① 规则唯一 leaf → 0 模型（正对照，seam 抛错断言绝不调）
 *   ② 低置信/unknown → 检索=0（结构上无检索面 + low_confidence/too_broad/conflict/
 *     taxonomy_invalid/invalid_schema/calibration_failed 精确原因码 + dispatched_unknown sticky）
 *   ③ 20 并发同 scope → 至多 1 次 attempt（真并发 barrier + pool max≥20，非顺序）
 *   ④ 分类结果不授予读取能力（无公开读 RLS / 无 SECURITY DEFINER 读面 / 越权读=0）
 *   ⑤ 未授权原文不进 prompt/log/cache/event（内容只以 digest 形式存在）
 *   ⑥ 结构同构但 scope 隔离（digest/hash 命名空间隔离 + job_id↔scope_id 列集同构）
 *   ⑦ DB CHECK 数值 backstop（绕过 domain 直插非法 decision 被拒）+ 多信号 rule 不扩散
 *
 * 四条承重原语：① asPrincipal ② CAS（revision status 条件 UPDATE）③ append-only outbox
 * ④ lease 有意不用（派发≤1 由 FOR UPDATE + 终态 sticky 承重，对齐 RAG-03）。
 *
 * pnpm rag07-free-text-route:prove   (node scripts/run-e2e-isolated.mjs rag07-free-text-route:prove:raw)
 */
import { randomUUID } from 'node:crypto';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  createFreeTextScopeRevision, classifyFreeTextScope,
} from '../src/index.ts';
import {
  canonicalFreeTextSemanticDigest, classifyFreeTextByRule, freeTextRouteDecisionHash,
  canonicalJobSemanticDigest, jobRouteDecisionHash,
  JOB_ROUTE_TAXONOMY_VERSION, JOB_ROUTE_POLICY_VERSION,
} from '@meetwise/domain';

// run-e2e-isolated.mjs 会剥离操作者 shell 里的真实 HMAC 密钥；proof 用固定测试键（≥32 字符）。
process.env.RAG_FREE_TEXT_ROUTE_INPUT_HASH_KEY = 'rag07-free-text-route-input-hmac-proof-key-not-production-01';
// 20 并发 proof 需要 pool max ≥ 20 才能真并行（非顺序）；默认 20 也给足余量。
process.env.PGPOOL_MAX = '32';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

type ModelOutput = {
  allocations: { leafTrackId: string; allocationBps: number }[];
  confidenceBps: number;
  marginBps: number;
  reasonCodes: string[];
};

type DecisionRow = {
  route_outcome: string; attempt_outcome: string;
  allocations: { leafTrackId: string; allocationBps: number }[];
  confidence_bps: number | null; margin_bps: number | null; reason_codes: string[];
};

/** 受控确定性 seam：计数外发次数，返回/抛出注入的模型结果；同时记录模型收到的输入（含 goal）。 */
function mkSeam(impl: (input: { scopeId: string; revision: number; goal: string }) => Promise<ModelOutput>) {
  let n = 0;
  const seen: { scopeId: string; revision: number; goal: string }[] = [];
  return {
    classify: async (input: { scopeId: string; revision: number; goal: string }) => { n++; seen.push(input); return impl(input); },
    calls: () => n,
    seen: () => seen,
  };
}

const TAG = 'rag07_' + Math.random().toString(36).slice(2, 8);
const recA = `${TAG}_recA`, recB = `${TAG}_recB`;

async function newScope(owner: string, goal: string): Promise<{ scopeId: string; revision: number }> {
  const scopeId = 'ftscope_' + randomUUID();
  const r = await asPrincipal(pool, owner, (c) => createFreeTextScopeRevision(c, owner, scopeId, { goal }));
  return { scopeId, revision: r.revision };
}

async function decision(scopeId: string): Promise<DecisionRow | undefined> {
  const r = await pool.query(
    'SELECT route_outcome, attempt_outcome, allocations, confidence_bps, margin_bps, reason_codes FROM free_text_route_decision WHERE scope_id=$1 ORDER BY revision DESC LIMIT 1',
    [scopeId],
  );
  return r.rows[0] as DecisionRow | undefined;
}

/** 用 owner 身份新建 scope + classify，返回结果 + seam 外发次数。 */
async function runModelCase(owner: string, goal: string, output: ModelOutput) {
  const s = await newScope(owner, goal);
  const seam = mkSeam(async () => output);
  const result = await classifyFreeTextScope(pool, owner, s.scopeId, s.revision, goal, { modelClassify: seam.classify });
  return { result, calls: seam.calls(), scopeId: s.scopeId };
}

/**
 * 绕过 domain 校验、以 owner 身份直插一条 route_decided decision，断言 DB CHECK 的数值 backstop 拒绝。
 * 返回 true = 被拒（通过）；false = 竟然插入成功（失败）。
 */
async function tryRawDecided(
  scopeId: string, owner: string, revision: number,
  allocs: { leafTrackId: string; allocationBps: number }[],
  confidenceBps: number, marginBps: number,
): Promise<boolean> {
  try {
    await asPrincipal(pool, owner, (c) => c.query(
      `INSERT INTO free_text_route_decision(id,scope_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash)
       VALUES($1,$2,$3,$4,'route_decided','result_validated','v1','calibration-2026-08-frozen:v1',$5::jsonb,$6,$7,'{}',$8)`,
      ['ftd_' + randomUUID(), scopeId, owner, revision, JSON.stringify(allocs), confidenceBps, marginBps, 'ab'.repeat(32)],
    ));
    return false;
  } catch {
    return true;
  }
}

async function main() {
  await assertIsolatedTestTarget(pool);

  // ① 规则唯一 leaf → 0 模型；revision 结构上无可写原文/路由参数。
  section('① rule 唯一 leaf → route_decided，0 次模型外发；revision 结构上无可写原文/路由参数');
  const GOAL_UNIQUE = 'Node.js 服务端专项训练';
  const s1 = await newScope(recA, GOAL_UNIQUE);
  const ruleSeam = mkSeam(async () => { throw new Error('rule path must never call model'); });
  const r1 = await classifyFreeTextScope(pool, recA, s1.scopeId, s1.revision, GOAL_UNIQUE, { modelClassify: ruleSeam.classify });
  A('规则唯一 leaf → route_decided / rule_decided，seam 0 次外发',
    r1.status === 'route_decided' && r1.attemptOutcome === 'rule_decided' && ruleSeam.calls() === 0);
  const d1 = await decision(s1.scopeId);
  A('规则 decision allocations = 单叶 backend/nodejs 10000 bps',
    d1?.route_outcome === 'route_decided' && Array.isArray(d1.allocations) && d1.allocations.length === 1
    && d1.allocations[0]!.leafTrackId === 'backend/nodejs' && d1.allocations[0]!.allocationBps === 10000);
  const revRow = (await pool.query('SELECT semantic_digest, input_hmac FROM free_text_scope_revision WHERE scope_id=$1 AND revision=1', [s1.scopeId])).rows[0];
  A('revision 只存 canonical digest + 输入 HMAC（均 64 hex，且互异）',
    /^[0-9a-f]{64}$/.test(revRow?.semantic_digest ?? '') && /^[0-9a-f]{64}$/.test(revRow?.input_hmac ?? '')
    && revRow?.semantic_digest !== revRow?.input_hmac);
  const revCols = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='free_text_scope_revision'")).rows.map((r) => r.column_name as string);
  A('revision 表结构无 goal/content/raw/text/track/weight/confidence/override 列（原文与桶参数无处可写）',
    !revCols.some((c) => /goal|content|raw|text|track|weight|confidence|override/i.test(c)));

  // ② 低置信/歧义/unknown → route_unresolved（精确原因码）；结构上检索=0。
  section('② 低置信/歧义 → route_unresolved（精确原因码）；自由文本无检索消费面（检索=0）');
  const AMBIGUOUS = '系统设计与架构进阶';
  const lowConf = await runModelCase(recA, AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }],
    confidenceBps: 6000, marginBps: 4000, reasonCodes: [],
  });
  A('low-confidence(<7000) → route_unresolved(low_confidence)，恰 1 次外发',
    lowConf.result.status === 'route_unresolved' && lowConf.result.attemptOutcome === 'validation_rejected'
    && lowConf.result.reasonCodes.includes('low_confidence') && lowConf.calls === 1);
  const tooBroad = await runModelCase(recA, AMBIGUOUS, {
    allocations: [
      { leafTrackId: 'backend/nodejs', allocationBps: 2000 }, { leafTrackId: 'backend/java', allocationBps: 2000 },
      { leafTrackId: 'backend/python', allocationBps: 2000 }, { leafTrackId: 'backend/go', allocationBps: 2000 },
      { leafTrackId: 'frontend/web', allocationBps: 2000 },
    ], confidenceBps: 9000, marginBps: 0, reasonCodes: [],
  });
  A('模型 5 桶 → too_broad → route_unresolved', tooBroad.result.status === 'route_unresolved' && tooBroad.result.reasonCodes.includes('too_broad'));
  const conflict = await runModelCase(recA, AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }],
    confidenceBps: 8500, marginBps: 9000, reasonCodes: [],
  });
  A('margin 与 top1-top2 实际 gap 不符 → route_unresolved(conflict)',
    conflict.result.status === 'route_unresolved' && conflict.result.reasonCodes.includes('conflict'));
  const taxonomy = await runModelCase(recA, AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/ruby', allocationBps: 10000 }],
    confidenceBps: 9000, marginBps: 10000, reasonCodes: [],
  });
  A('leaf 不在 taxonomy v1 → route_unresolved(taxonomy_invalid)',
    taxonomy.result.status === 'route_unresolved' && taxonomy.result.reasonCodes.includes('taxonomy_invalid'));
  const badSum = await runModelCase(recA, AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 2000 }],
    confidenceBps: 8500, marginBps: 0, reasonCodes: [],
  });
  A('allocations sum≠10000 → route_unresolved(invalid_schema)',
    badSum.result.status === 'route_unresolved' && badSum.result.reasonCodes.includes('invalid_schema'));
  const minAlloc = await runModelCase(recA, AMBIGUOUS, {
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 9700 }, { leafTrackId: 'frontend/web', allocationBps: 300 }],
    confidenceBps: 8000, marginBps: 0, reasonCodes: [],
  });
  A('min-allocation(<500) → route_unresolved(calibration_failed)',
    minAlloc.result.status === 'route_unresolved' && minAlloc.result.reasonCodes.includes('calibration_failed'));

  // unknown：dispatched_unknown 是 sticky 终态，永不自动重发。
  const sUnknown = await newScope(recA, AMBIGUOUS);
  const unknownSeam = mkSeam(async () => { throw Object.assign(new Error('external outcome unknown'), { code: 'dispatched_unknown' }); });
  const ru = await classifyFreeTextScope(pool, recA, sUnknown.scopeId, sUnknown.revision, AMBIGUOUS, { modelClassify: unknownSeam.classify });
  A('dispatched_unknown → route_unresolved，恰 1 次外发',
    ru.status === 'route_unresolved' && ru.attemptOutcome === 'dispatched_unknown' && unknownSeam.calls() === 1);
  const ru2 = await classifyFreeTextScope(pool, recA, sUnknown.scopeId, sUnknown.revision, AMBIGUOUS, { modelClassify: unknownSeam.classify });
  A('二次 classify → noop already_unresolved，seam 不再被调（unknown 永不自动重发）',
    ru2.status === 'noop' && ru2.reason === 'already_unresolved' && unknownSeam.calls() === 1);

  // 结构上无检索/快照/绑定消费链：自由文本仅 3 表，无 FK 引用 decision，无 SECURITY DEFINER 读面。
  const ftTables = (await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'free_text_%'")).rows.map((r) => r.table_name as string).sort();
  A('自由文本面仅 3 表（revision/decision/event），无 binding/snapshot/plan/cache/retrieval 表',
    JSON.stringify(ftTables) === JSON.stringify(['free_text_route_decision', 'free_text_route_event', 'free_text_scope_revision']));
  const decisionRefs = (await pool.query("SELECT count(*)::int n FROM pg_constraint WHERE confrelid='free_text_route_decision'::regclass")).rows[0].n;
  A('无任何表 FK 引用 free_text_route_decision（结构上无下游消费 → 检索=0）', decisionRefs === 0);
  const revisionRefs = (await pool.query("SELECT count(*)::int n FROM pg_constraint WHERE confrelid='free_text_scope_revision'::regclass")).rows[0].n;
  A('唯一引用 free_text_scope_revision 的是 decision 自身 FK（1 条，无检索/计划消费）', revisionRefs === 1);
  const ftFuncs = (await pool.query("SELECT count(*)::int n FROM pg_proc WHERE proname LIKE '%free_text%'")).rows[0].n;
  A('无任何 free_text 函数（无 SECURITY DEFINER 读面）', ftFuncs === 0);

  // ③ 20 并发同 scope → 至多 1 次 attempt（真并发 barrier + pool max≥20）。
  section('③ 20 并发同 scope → 至多 1 次 attempt（真并发 barrier + pool max≥20，非顺序）');
  const CONC_GOAL = '资深工程师职业进阶';
  const s3 = await newScope(recA, CONC_GOAL);
  const concSeam = mkSeam(async () => ({
    allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }],
    confidenceBps: 8500, marginBps: 4000, reasonCodes: [],
  }));
  const N = 20;
  let arrived = 0;
  const ready: (() => void)[] = [];
  // start barrier：凑满 20 个任务才放行，保证它们同时进入 classify（真并发，非顺序）。
  const gate = () => new Promise<void>((resolve) => {
    arrived += 1;
    if (arrived === N) { for (const r of ready) r(); ready.length = 0; resolve(); }
    else { ready.push(resolve); }
  });
  const results = await Promise.all(Array.from({ length: N }, async () => {
    await gate();
    return classifyFreeTextScope(pool, recA, s3.scopeId, s3.revision, CONC_GOAL, { modelClassify: concSeam.classify });
  }));
  const decidedCount = results.filter((r) => r.status === 'route_decided').length;
  const noopCount = results.filter((r) => r.status === 'noop' && r.reason === 'already_decided').length;
  A('20 并发 → 恰 1 次模型外发（seam 调用=1）', concSeam.calls() === 1);
  A('20 并发 → 恰 1 个 route_decided、其余 19 个 noop already_decided',
    decidedCount === 1 && noopCount === 19 && results.length === N);
  const concDecisionRows = (await pool.query('SELECT count(*)::int n FROM free_text_route_decision WHERE scope_id=$1', [s3.scopeId])).rows[0].n;
  A('UNIQUE(scope_id, revision) 恰 1 行 decision', concDecisionRows === 1);

  // ④ 分类结果不授予读取能力（无公开读 RLS / 无 SECURITY DEFINER 读面 / 越权读=0）。
  section('④ 分类结果不授予读取能力（无公开读 RLS / 无授权列 / 越权读写=0）');
  const crossDecision = await asPrincipal(pool, recB, (c) => c.query(
    "SELECT count(*)::int n FROM free_text_route_decision WHERE scope_id=$1 AND route_outcome='route_decided'", [s1.scopeId]));
  A('非 owner 读 route_decided decision = 0 行（无公开读，与 RAG-03 p_read_decided 刻意不同）',
    crossDecision.rows[0].n === 0);
  const crossRevision = await asPrincipal(pool, recB, (c) => c.query('SELECT count(*)::int n FROM free_text_scope_revision WHERE scope_id=$1', [s1.scopeId]));
  const crossEvent = await asPrincipal(pool, recB, (c) => c.query('SELECT count(*)::int n FROM free_text_route_event WHERE scope_id=$1', [s1.scopeId]));
  A('非 owner 读 revision/event = 0 行', crossRevision.rows[0].n === 0 && crossEvent.rows[0].n === 0);
  const decCols = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='free_text_route_decision'")).rows.map((r) => r.column_name as string);
  A('decision 表无 read/tool/sql/grant/permission/capability/acl 授权列',
    !decCols.some((c) => /read|tool|sql|grant|permission|capability|acl/i.test(c)));
  let crossInsertRevDenied = false;
  try {
    await asPrincipal(pool, recB, (c) => c.query(
      "INSERT INTO free_text_scope_revision(scope_id, owner_user_id, revision, semantic_digest, input_hmac, status) VALUES ($1,$2,99,$3,$4,'route_pending')",
      [s1.scopeId, recA, 'ab'.repeat(32), 'cd'.repeat(32)]));
  } catch { crossInsertRevDenied = true; }
  A('非 owner 不能为他人 scope INSERT revision（RLS WITH CHECK 拒绝）', crossInsertRevDenied);

  // ⑤ 未授权原文不进 prompt/log/cache/event（内容只以 digest 形式存在）。
  section('⑤ 未授权原文不进 prompt/log/cache/event（内容只以 digest 形式存在）');
  A('decision 表无 goal/content/raw/text/body/prompt 列',
    !decCols.some((c) => /goal|content|raw|text|body|prompt/i.test(c)));
  const eventReasons = (await pool.query('SELECT DISTINCT reason FROM free_text_route_event')).rows.map((r) => r.reason as string | null);
  const ALLOWED_REASONS: (string | null)[] = ['rule_unique_leaf', 'rule_ambiguous', 'dispatched_unknown', 'known_not_sent', 'validation_rejected', null];
  A('event.reason 全在固定 allowlist（无原文、无自由文本）', eventReasons.every((r) => ALLOWED_REASONS.includes(r)));
  const allFreeTextRows = [
    ...(await pool.query('SELECT * FROM free_text_scope_revision')).rows,
    ...(await pool.query('SELECT * FROM free_text_route_decision')).rows,
    ...(await pool.query('SELECT * FROM free_text_route_event')).rows,
  ];
  const serialized = JSON.stringify(allFreeTextRows);
  const leaked = [GOAL_UNIQUE, AMBIGUOUS, CONC_GOAL].filter((g) => serialized.includes(g));
  A('全库（revision/decision/event）无任一 goal 原文残留', leaked.length === 0);
  A('无 free_text 缓存表（无 cache 面承载原文）', !ftTables.some((t) => /cache/i.test(t)));

  // ⑥ 结构同构但 scope 隔离（digest/hash 命名空间隔离 + job_id↔scope_id 列集同构）。
  section('⑥ 结构同构但 scope 隔离（digest/hash 命名空间隔离 + 列集同构）');
  A('同文本 free-text digest ≠ job digest（独立命名空间 free-text-semantic:v1）',
    canonicalFreeTextSemanticDigest({ goal: 'X' }) !== canonicalJobSemanticDigest({ title: 'X', description: '', competencies: [] }));
  const isoAllocs = [{ leafTrackId: 'backend/nodejs', allocationBps: 10000 }];
  A('同 allocations free-text decision hash ≠ job decision hash（独立命名空间 + scopeId/jobId）',
    freeTextRouteDecisionHash({ scopeId: 'X', revision: 1, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, policyVersion: JOB_ROUTE_POLICY_VERSION, allocations: isoAllocs, confidenceBps: 10000, marginBps: 10000, attemptOutcome: 'rule_decided', reasonCodes: [] })
    !== jobRouteDecisionHash({ jobId: 'X', revision: 1, taxonomyVersion: JOB_ROUTE_TAXONOMY_VERSION, policyVersion: JOB_ROUTE_POLICY_VERSION, allocations: isoAllocs, confidenceBps: 10000, marginBps: 10000, attemptOutcome: 'rule_decided', reasonCodes: [] }));
  const jobDecCols = (await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='job_route_decision'")).rows.map((r) => r.column_name as string);
  // 先把 job_id 映射成 scope_id 再排序比较（job_id 与 scope_id 的字母序位置不同，必须映射后再比）。
  const jobDecMapped = jobDecCols.map((c) => (c === 'job_id' ? 'scope_id' : c)).sort();
  const ftDecCols = [...decCols].sort();
  A('decision 列集与 job_route_decision 同构（job_id↔scope_id）',
    JSON.stringify(jobDecMapped) === JSON.stringify(ftDecCols));

  // ⑦ DB CHECK 数值 backstop + 多信号 rule 不扩散。
  section('⑦ DB CHECK 数值 backstop（绕过 domain 直插非法 decision 被拒）+ 多信号 rule 不扩散');
  A('多信号 goal rule 返回 null（交给模型，不扩散为多桶）',
    classifyFreeTextByRule({ goal: 'Node.js 前端 全栈' }) === null);
  const illegalCases: { label: string; allocs: { leafTrackId: string; allocationBps: number }[]; conf: number; margin: number }[] = [
    { label: 'sum≠10000', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 2000 }], conf: 8500, margin: 4000 },
    { label: 'max-leaf>4', allocs: [
      { leafTrackId: 'backend/nodejs', allocationBps: 6000 }, { leafTrackId: 'backend/java', allocationBps: 1000 },
      { leafTrackId: 'backend/go', allocationBps: 1000 }, { leafTrackId: 'backend/python', allocationBps: 1000 },
      { leafTrackId: 'frontend/web', allocationBps: 1000 },
    ], conf: 8500, margin: 5000 },
    { label: 'min-alloc<500', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 9700 }, { leafTrackId: 'frontend/web', allocationBps: 300 }], conf: 8500, margin: 9400 },
    { label: 'confidence<7000', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], conf: 6000, margin: 4000 },
    { label: 'margin<1000', allocs: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }], conf: 8500, margin: 900 },
  ];
  for (const c of illegalCases) {
    const rawScope = await newScope(recA, AMBIGUOUS);
    const rejected = await tryRawDecided(rawScope.scopeId, recA, rawScope.revision, c.allocs, c.conf, c.margin);
    A(`DB CHECK 拒非法 decision（${c.label}）`, rejected);
  }

  console.log(`\n${fail === 0 ? '✓ rag07-free-text-route（真 Postgres）全部通过' : `✗ ${fail} 项失败`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
