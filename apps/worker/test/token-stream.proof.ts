/**
 * TOKSTREAM S4b · worker token-stream proof（门预申明①新 proof · fake seam+隔离 PG 零模型外呼·actualSpendCny=null）。
 *
 * R2 验收四臂（REQUEST §2 R2·fake pool 捕获 pg_notify 载荷，零真 PG 依赖）：
 *   R2-a seq 单调（(streamKey,attemptKey) 内自 1 递增·帧契约 v:1/streamKey/attemptKey 齐备）；
 *   R2-b 超限切分（L1 4KB 预算触顶同步冲帧·码点安全不丢字符）；
 *   R2-c NOTIFY 载荷按 JSON.stringify 后实算 ≤7500（R8(b) EXEC 定谳=超限切分）；
 *   R2-d 写败不阻断业务返回值（§C-3 best-effort 丢帧）。
 * R3 三触发面接线臂（隔离 PG·专用连接 LISTEN interview_token_ch 实收）：
 *   quiz/report/adaptive 三面各一臂：帧流键/attemptKey/seq 正确+拼接==模型 raw 全文+generation_* 落表
 *   与基线一致（generation_started 在位；全臂行为基线由 prove:tokenstream 原值回归承底）。
 * R7 worker 侧断言：断开不取消（无听众生成照常至终态）/流中失败禁自动重 invoke（单飞恰一次）/
 *   「为补 delta 重跑」静态零新增。
 * 运行：pnpm s4b-token-stream:prove（经 scripts/run-e2e-isolated.mjs 隔离 PG）；裸跑需隔离 DATABASE_URL。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Client } from '@meetwise/db';
import { createPool, loadMigrations, runMigrations, asPrincipal } from '@meetwise/db';
import type { CompletionRequest, ModelClient, ModelResult } from '@meetwise/ai-runtime';
import { quizGenerator, reportGenerator } from '../src/interview-service.ts';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';
import { withTokenStream, TOKEN_NOTIFY_MAX_PAYLOAD_BYTES, TOKEN_STREAM_NOTIFY_CHANNEL } from '../src/token-stream.ts';

let fail = 0;
const A = (n: string, c: boolean, detail?: unknown) => {
  console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`);
  if (!c && detail !== undefined) console.log(`      ↳ detail: ${JSON.stringify(detail)}`);
  if (!c) fail++;
};
const sleep = (ms: number) => new Promise<void>((r) => { setTimeout(r, ms); });
const OWNER = 's4bTsOwner';
const MARKER = 'S4B-TS-内容哨兵';

/** fake pg pool：捕获 pg_notify 载荷（R2 四臂·零真 PG）。 */
function fakeNotifyPool(opts: { failAll?: boolean } = {}): { pool: Parameters<typeof withTokenStream>[0]; payloads: string[] } {
  const payloads: string[] = [];
  const pool = {
    query: async (sql: string, params?: unknown[]) => {
      if (typeof sql === 'string' && sql.includes('pg_notify')) {
        if (opts.failAll) throw new Error('notify_channel_down');
        payloads.push(String(Array.isArray(params) ? params[1] : ''));
      }
      return { rows: [], rowCount: 0 };
    },
  };
  return { pool: pool as unknown as Parameters<typeof withTokenStream>[0], payloads };
}

interface CapturedFrame { v: number; streamKey: string; attemptKey: string; seq: number; text: string; coalesced?: boolean }

/** 流式 fake 模型：prepare.execute 逐片吐 raw 全文（R1b② 可选回调位消费面·经 invoke 线程到 sink）。 */
function streamingModel(rawByText: Record<string, string>): ModelClient {
  const rawFor = (req: CompletionRequest): string => rawByText[req.service] ?? '{}';
  const result = (req: CompletionRequest): ModelResult => ({ ok: true, raw: JSON.parse(rawFor(req)) as unknown });
  return {
    async complete(req) { return result(req); },
    prepare: (req) => ({
      ready: true as const,
      execute: async (_signal?: AbortSignal, onDelta?: (d: { text: string }) => void) => {
        const text = rawFor(req);
        if (onDelta) { onDelta({ text: text.slice(0, 4) }); onDelta({ text: text.slice(4) }); }
        return result(req);
      },
    }),
  };
}

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));

  /* ═══ R2 核心四臂（fake pool·零真 PG 依赖）═══ */
  {
    const { pool: fp, payloads } = fakeNotifyPool();
    const out = await withTokenStream(fp, OWNER, 's4b-r2a', { attemptKey: 'k-a', jobKind: 'quiz' }, async (t) => {
      t.pushDelta('a');
      t.pushDelta('b');
      t.pushDelta('c');
      return 'biz-ok-a';
    });
    await sleep(20);
    const frames = payloads.map((p) => JSON.parse(p) as CapturedFrame);
    A('R2-a withTokenStream 业务返回值原样（包装不改写）', out === 'biz-ok-a');
    A('R2-a seq 单调自 1 递增+帧契约 v:1/streamKey/attemptKey 齐备+拼接保序',
      frames.length >= 1
      && frames.every((f, i) => f.seq === i + 1 && f.v === 1 && f.streamKey === 's4b-r2a' && f.attemptKey === 'k-a')
      && frames.map((f) => f.text).join('') === 'abc',
      { frames });
  }
  {
    const { pool: fp, payloads } = fakeNotifyPool();
    const big = 'x'.repeat(5000);   // >4KB L1 帧预算 → 预算触顶同步冲帧切分
    await withTokenStream(fp, OWNER, 's4b-r2b', { attemptKey: 'k-b', jobKind: 'quiz' }, async (t) => {
      t.pushDelta(big);
      return 'biz-ok-b';
    });
    await sleep(20);
    const frames = payloads.map((p) => JSON.parse(p) as CapturedFrame);
    const concat = frames.map((f) => f.text).join('');
    const allFramesWithinBudget = payloads.every((p) => Buffer.byteLength(p, 'utf8') <= TOKEN_NOTIFY_MAX_PAYLOAD_BYTES);
    A('R2-b 超限切分：>4KB delta 同步切帧（多帧·零丢字符·帧字节 ≤4KB·载荷 ≤NOTIFY 预算）',
      frames.length >= 2 && concat === big && allFramesWithinBudget
      && frames.every((f) => Buffer.byteLength(f.text, 'utf8') <= 4096),
      { frames: frames.length, concatLen: concat.length });
  }
  {
    const { pool: fp, payloads } = fakeNotifyPool();
    const escaping = '"'.repeat(4000);   // stringify 后 ~8000 字节 > NOTIFY 预算 → 实算切分
    await withTokenStream(fp, OWNER, 's4b-r2c', { attemptKey: 'k-c', jobKind: 'report' }, async (t) => {
      t.pushDelta(escaping);
      return 'biz-ok-c';
    });
    await sleep(20);
    const frames = payloads.map((p) => JSON.parse(p) as CapturedFrame);
    const concat = frames.map((f) => f.text).join('');
    A('R2-c NOTIFY 载荷按 stringify 后实算：全帧 ≤7500 字节+零丢字符（码点安全切分）',
      payloads.length >= 2 && payloads.every((p) => Buffer.byteLength(p, 'utf8') <= TOKEN_NOTIFY_MAX_PAYLOAD_BYTES) && concat === escaping,
      { payloads: payloads.length, maxBytes: Math.max(0, ...payloads.map((p) => Buffer.byteLength(p, 'utf8'))) });
  }
  {
    const { pool: fp, payloads } = fakeNotifyPool({ failAll: true });
    const out = await withTokenStream(fp, OWNER, 's4b-r2d', { attemptKey: 'k-d', jobKind: 'quiz' }, async (t) => {
      t.pushDelta('y'.repeat(4200));   // 触发同步冲帧 → NOTIFY 全败
      return 'biz-ok-d';
    });
    await sleep(20);
    A('R2-d 写败不阻断业务返回值（§C-3 best-effort 丢帧·零抛穿·零帧成功落账）',
      out === 'biz-ok-d' && payloads.length === 0,
      { out, payloads: payloads.length });
  }
  {
    const { pool: fp, payloads } = fakeNotifyPool();
    await withTokenStream(fp, OWNER, 's4b-r2e', { attemptKey: 'k-e', jobKind: 'quiz' }, async (t) => {
      t.pushDelta('pre');
      t.abortReason('probe_abort');
      t.pushDelta('post-abort-ignored');
      t.endUsage(undefined);
      return 'biz-ok-e';
    });
    await sleep(20);
    const frames = payloads.map((p) => JSON.parse(p) as CapturedFrame);
    A('R2-e abortReason 停收+冲帧（pre 帧冲出·post-abort 零帧）+endUsage 遥测不抛',
      frames.map((f) => f.text).join('') === 'pre',
      { frames });
  }

  /* ═══ R3 三触发面接线臂（隔离 PG·LISTEN 实收）═══ */
  const listener: Client = await pool.connect();
  const captured: CapturedFrame[] = [];
  const onNotification = (msg: { channel: string; payload?: string }) => {
    if (msg.channel !== TOKEN_STREAM_NOTIFY_CHANNEL || !msg.payload) return;
    try { captured.push(JSON.parse(msg.payload) as CapturedFrame); } catch { /* 有损通道坏帧即丢 */ }
  };
  listener.on('notification', onNotification as never);
  await listener.query(`LISTEN ${TOKEN_STREAM_NOTIFY_CHANNEL}`);

  const framesFor = (streamKey: string, attemptKey: string): CapturedFrame[] =>
    captured.filter((f) => f.streamKey === streamKey && f.attemptKey === attemptKey).sort((a, b) => a.seq - b.seq);

  interface FamilyRow { kind: string; payload: Record<string, unknown> }
  const familyRows = async (stream: string): Promise<FamilyRow[]> => asPrincipal(pool, OWNER, async (c) => {
    const r = await c.query(
      `SELECT kind, payload FROM interview_event WHERE stream_key=$1 AND kind IN ('generation_started','model_first_token','generation_progress') ORDER BY seq`, [stream]);
    return r.rows.map((row) => ({ kind: String(row.kind), payload: row.payload as Record<string, unknown> }));
  });

  /* ── R3-quiz 面 ── */
  {
    const QID = `s4bq-${Date.now()}`;
    const quizKey = `${QID}:quiz`;
    const raw = `{"items":[{"q":"${MARKER}流式 quiz 题面","refs":[]}]}`;
    const items = await quizGenerator(pool, OWNER, [], quizKey, streamingModel({ 'resume-quiz.generate': raw }), QID)(EMPTY_PROFILE);
    await sleep(300);
    const frames = framesFor(QID, quizKey);
    A('R3-quiz withTokenStream 在位：帧经 interview_token_ch 实收（streamKey/attemptKey/seq 自 1 单调+拼接==raw 全文）',
      items.length === 1 && frames.length >= 1
      && frames.every((f, i) => f.seq === i + 1 && f.v === 1)
      && frames.map((f) => f.text).join('') === raw, { frames: frames.length });
    A('R3-quiz generation_* 落表与基线一致（generation_started 在位·阶段1 面零回归）',
      (await familyRows(QID)).some((r) => r.kind === 'generation_started' && r.payload.jobKind === 'quiz'));
  }

  /* ── R3-report 面 ── */
  {
    const RID = `s4br-${Date.now()}`;
    const reportKey = `${RID}:report`;
    const raw = '{"sections":[{"title":"S","body":"b"}]}';
    const report = await reportGenerator(pool, OWNER, reportKey, streamingModel({ 'report.generate': raw }), RID)({
      interviewId: RID, questionCount: 1, scores: [80], owner: OWNER,
    });
    await sleep(300);
    const frames = framesFor(RID, reportKey);
    A('R3-report withTokenStream 在位：帧实收+拼接==raw 全文',
      report.sections.length === 1 && frames.length >= 1
      && frames.every((f, i) => f.seq === i + 1)
      && frames.map((f) => f.text).join('') === raw, { frames: frames.length });
    A('R3-report generation_* 落表与基线一致（generation_started 在位·阶段1 面零回归）',
      (await familyRows(RID)).some((r) => r.kind === 'generation_started' && r.payload.jobKind === 'report'));
  }

  /* ── R3-adaptive 面（next_question·interviewer.ask）── */
  {
    const IID = `s4bi-${Date.now()}`;
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [IID, OWNER]);
    // refs 携选定事实子串：grounded-refs 闸（refsGroundedInFacts 要求 refs 非空∧逐条为选定事实子串）
    // 首过——空 refs 会触发 `:gr{k}` 有界重试（多次模型执行=拼接重复的非预期面）。
    const raw = `{"q":"${MARKER}流式 ask 题面","refs":["高并发"]}`;
    // kind='grounded'+resumeFacts 在场：绕开 scenario 空检索模板降级面（零模型调用=零 delta）与
    // grounded 无事实早退面——直达模型生成本臂（grounded 不走 CRAG 检索·useRetrieval=false）。
    const deps = buildAdaptiveDeps({
      pool, owner: OWNER, threadId: IID, model: streamingModel({ 'interviewer.ask': raw }),
      competencies: ['并发'], resumeFacts: ['主导过日均亿级请求的高并发网关系统设计'],
      localRetrieve: async () => [], webExplore: async () => [],
    });
    const generation = await deps.retrieveAndGenerate('并发', 2, 0, 0, [], 'grounded');
    await sleep(300);
    const askKey = `${IID}:ask:t0:0`;
    const frames = framesFor(IID, askKey);
    const genOk = 'ok' in generation && generation.ok === true && typeof generation.question === 'string';
    A('R3-adaptive withTokenStream 在位：帧实收（streamKey=threadId·attemptKey=initialKey·拼接==raw 全文）',
      genOk && frames.length >= 1 && frames.every((f, i) => f.seq === i + 1)
      && frames.map((f) => f.text).join('') === raw,
      { genOk, frames: frames.length, capturedSample: captured.length, frameTexts: frames.map((f) => f.text), rawLen: raw.length });
    A('R3-adaptive generation_* 落表与基线一致（generation_started segments=[retrieve,generate,validate]）',
      (await familyRows(IID)).some((r) => r.kind === 'generation_started'
        && JSON.stringify(r.payload.segments) === JSON.stringify(['retrieve', 'generate', 'validate'])));
  }

  /* ── R7 worker 侧：断开不取消+流中失败禁自动重 invoke ── */
  {
    // (i) 无听众（无 LISTEN 订阅者注册）生成照常至终态——delta 无听众=廉价 no-op·终态权威照落。
    const NID = `s4bn-${Date.now()}`;
    const raw = `{"items":[{"q":"${MARKER}无听众臂","refs":[]}]}`;
    const items = await quizGenerator(pool, OWNER, [], `${NID}:quiz`, streamingModel({ 'resume-quiz.generate': raw }), NID)(EMPTY_PROFILE);
    A('R7(i) delta 无听众：生成不取消·业务终态照常（模型恰一次·无重跑）',
      items.length === 1 && (await familyRows(NID)).some((r) => r.kind === 'generation_started'));
  }
  {
    // (iii) 流中失败 → error 面·禁自动重 invoke（模型恰一次·零自动重跑）。
    const FID = `s4bf-${Date.now()}`;
    let calls = 0;
    const failModel: ModelClient = {
      async complete() { calls += 1; return { ok: false, kind: 'transient' as const, externalOutcome: 'unknown' as const }; },
      prepare: () => ({
        ready: true as const,
        execute: async () => { calls += 1; return { ok: false, kind: 'transient' as const, externalOutcome: 'unknown' as const }; },
      }),
    };
    let threw = false;
    try {
      await quizGenerator(pool, OWNER, [], `${FID}:quiz`, failModel, FID)(EMPTY_PROFILE);
    } catch { threw = true; }
    A('R7(iii) 流中失败：error 面抛出·模型恰一次（禁自动重 invoke）', threw && calls === 1, { calls });
  }

  /* ── 静态断言（R3 三面 withTokenStream+spec 显式绑定·R2 单写者前提声明在场）── */
  {
    const s = readFileSync(fileURLToPath(new URL('../src/interview-service.ts', import.meta.url)), 'utf8');
    const a = readFileSync(fileURLToPath(new URL('../src/adaptive-interview-service.ts', import.meta.url)), 'utf8');
    const t = readFileSync(fileURLToPath(new URL('../src/token-stream.ts', import.meta.url)), 'utf8');
    const quizFace = s.slice(s.indexOf('export function quizGenerator'), s.indexOf('export function reportGenerator'));
    const reportFace = s.slice(s.indexOf('export function reportGenerator'));
    A('静态 R3：三触发面 withTokenStream 在位+InvokeSpec.onModelDelta 显式绑定（spec 面非闭包隐式）',
      quizFace.includes('withTokenStream(') && quizFace.includes('onModelDelta: (d: { text: string }) => tokenSink.pushDelta(d.text)')
      && reportFace.includes('withTokenStream(') && reportFace.includes('onModelDelta: (d: { text: string }) => tokenSink.pushDelta(d.text)')
      && a.includes('withTokenStream(') && a.includes('onModelDelta: (delta: { text: string }) => tokenSink.pushDelta(delta.text)'));
    A('静态 R2：单写者前提配置上界声明在场（MODEL_EXECUTION_TIMEOUT_MS ≤ lease 60s·seq 回归由 web max-seq 吸收注记）',
      t.includes('MODEL_EXECUTION_TIMEOUT_MS') && t.includes('lease 60s') && t.includes('max-seq'));
  }

  listener.off('notification', onNotification as never);
  listener.release();
  console.log(`CMD=token-stream:prove EXIT=${fail === 0 ? 0 : 1}`);
  process.exit(fail === 0 ? 0 : 1);
}

/** 最小合法 ResumeProfile（quizGenerator 闭包只用捕获的 resumeFacts；沿 tokenstream-progress.proof 同形）。 */
const EMPTY_PROFILE = { experience: [], skills: [], facts: [], pii: [], blocked: [] };

const pool = createPool();

main().catch(async (e) => {
  console.error(e);
  console.log('CMD=token-stream:prove EXIT=1');
  try { await pool.end(); } catch { /* already ended */ }
  process.exit(1);
});
