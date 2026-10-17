/**
 * TOKSTREAM 阶段1 prove（EXEC @REQUEST a31a7bbe · TS-P1..P5 · fake seam 零 live 零模型外呼）。
 * fake-seam 标注：本 proof=noteModelFirstToken 未接线 seam 的自调证明面（fake-seam proof·生产链路零证明;
 * 生产调用方零命中=unwired 原样登记，接线归流式真链后继刀）。

 * 断言面（receipts/archive/2026-09-batch23/slices/token-stream-design.slice.md §3.7 预注册 · 裁定后钉死）：
 *   TS-P1 首 token 事件链：generation_started→model_first_token 产生且 firstTokenMs 记录；进度事件经
 *        API 同形 SSE 读路径（interview.service.ts:950 同 SQL）可见时延 ≤ 2s poll + ε（实测值落输出）。
 *   TS-P2 节流正确性：受控长生成（fake 延迟 7s）下 generation_progress 行数 ∈ [2, min(6, ceil(7s/2s)+1)]，
 *        相邻行 elapsedMs 差 ≥ 2s-ε，event_key 序号互异。
 *   TS-P3 前端渲染断言：web:prove 面（apps/web/test/web-logic.proof.ts TOKSTREAM 段，不在本文件）。
 *   TS-P4 膨胀上界：generation_progress ≤ GENERATION_PROGRESS_MAX_ROWS(6)；started==1（event_key 幂等）；
 *        重放（同 idempotencyKey 二次经 invoke=cached）不添行；noteModelFirstToken 重放不添行；家族总行 ≤ 8。
 *   TS-P5 载荷红线：进度家族 payload 键 ⊆ 白名单；无顶层 answer；不含生成内容标记（TS-MARKER）。
 *   TS-P6 started 旁路化（首写不等待·消除头拍 await）：慢写 seam 正形（模型 fn 起跑先于 started 行
 *        可见+首拍零等待+内容无损+started 恰 1 行+poller 首见对照）+once-fail 写败负形（生成成功+
 *        结构化失败日志 generation_progress_write_failed+started 恒零行）+seq 序不变式（started.seq <
 *        调用方终态业务事件 seq·finally 在途等待承重）。
 * 运行：pnpm tokenstream:prove（经 scripts/run-e2e-isolated.mjs 隔离 PG）；本地直接跑需 DATABASE_URL。
 */
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, appendEvent, loadMigrations, runMigrations, type DbPool } from '@meetwise/db';
import { scriptedModelClient, type ModelClient, type ModelResult } from '@meetwise/ai-runtime';
import type { ResumeProfile } from '@meetwise/domain';
import { quizGenerator, reportGenerator } from '../src/interview-service.ts';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';
import {
  GENERATION_PROGRESS_MAX_ROWS, GENERATION_PROGRESS_MIN_INTERVAL_MS,
  noteModelFirstToken,
} from '../src/generation-progress.ts';

/** 最小合法 ResumeProfile(quizGenerator 闭包只用捕获的 resumeFacts,profile 形参只满足图注入类型)。 */
const EMPTY_PROFILE: ResumeProfile = { experience: [], skills: [], facts: [], pii: [], blocked: [] };

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sleep = (ms: number) => new Promise<void>((r) => { setTimeout(r, ms); });
const OWNER = 'tsOwner';
const MARKER = 'TS-MARKER-内容红线哨兵';

interface FamilyRow { seq: number; kind: string; payload: Record<string, unknown>; event_key: string | null }
async function familyRows(stream: string): Promise<FamilyRow[]> {
  return asPrincipal(pool, OWNER, async (c) => {
    const r = await c.query(
      `SELECT seq, kind, payload, event_key FROM interview_event
        WHERE stream_key=$1 AND kind IN ('generation_started','model_first_token','generation_progress')
        ORDER BY seq`, [stream]);
    return r.rows.map((row) => ({ ...row, seq: Number(row.seq) }));
  });
}

/** API SSE 读路径同形查询（interview.service.ts:950 同 SQL）。后台首见轮询器：与生成**并发**跑，
 *  记录每个 kind 首次可见时刻（TS-P1 时延面 = 提交→可见 ≤ 2s poll + ε；轮询粒度 100ms，实测值落输出）。 */
async function startFirstSeenPoller(stream: string): Promise<{ seenAt: (kind: string) => number | undefined; stop: () => Promise<void> }> {
  const seen = new Map<string, number>();
  let lastSeq = 0;
  let running = true;
  const loop = (async () => {
    while (running) {
      const rows = await asPrincipal(pool, OWNER, async (c) => c.query(
        'SELECT seq,kind FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq', [stream, lastSeq]));
      for (const row of rows.rows) {
        lastSeq = Math.max(lastSeq, Number(row.seq));
        if (!seen.has(row.kind)) seen.set(row.kind, Date.now());
      }
      await sleep(100);
    }
  })().catch(() => undefined);   // 轮询器自身故障不算证明面(可见性由行存在断言兜底)
  return {
    seenAt: (kind) => seen.get(kind),
    stop: async () => { running = false; await loop; },
  };
}

/** 全流行查询（不过滤 kind：TS-P6 seq 序断言需对照调用方终态业务事件行）。 */
async function streamRows(stream: string): Promise<FamilyRow[]> {
  return asPrincipal(pool, OWNER, async (c) => {
    const r = await c.query(
      'SELECT seq, kind, payload, event_key FROM interview_event WHERE stream_key=$1 ORDER BY seq', [stream]);
    return r.rows.map((row) => ({ ...row, seq: Number(row.seq) }));
  });
}

/** TS-P6 家族 INSERT 识别（appendEvent 形参序：[owner, stream, kind, payload, eventKey]）。 */
function isFamilyInsert(sql: unknown, params: unknown, stream: string, kind: string): boolean {
  return typeof sql === 'string' && sql.includes('INSERT INTO interview_event')
    && Array.isArray(params) && params[1] === stream && params[2] === kind;
}

/** TS-P6 慢写 seam（proxy pool·沿 R2 fake pool 先例形）：目标流首笔 generation_started INSERT 拖缓
 *  delayMs（query 级精准注入——首拍进度写被拖慢而业务路径直通），其余查询零扰直通；顶层 query 转发
 *  真池（withTokenStream 的 pg_notify 面不受扰）。 */
function slowStartedWritePool(targetStream: string, delayMs: number): DbPool {
  let slowed = false;
  const proxy = {
    query: (sql: unknown, params?: unknown[]) => pool.query(sql as string, params),
    connect: async () => {
      const c = await pool.connect();
      return {
        query: async (sql: unknown, params?: unknown[]) => {
          if (!slowed && isFamilyInsert(sql, params, targetStream, 'generation_started')) {
            slowed = true;
            await sleep(delayMs);
          }
          return c.query(sql as string, params);
        },
        release: () => { c.release(); },
      };
    },
  };
  return proxy as unknown as DbPool;
}

/** TS-P6 写败负形 seam（once-failing）：目标流首笔 generation_started INSERT 注入失败恰一次（无重试），
 *  其余查询直通（业务路径不受扰·沿 R2-d failAll 先例形收窄到单笔）。 */
function startedWriteFailingPool(targetStream: string): { pool: DbPool; latchFired: () => boolean } {
  let failed = false;
  const proxy = {
    query: (sql: unknown, params?: unknown[]) => pool.query(sql as string, params),
    connect: async () => {
      const c = await pool.connect();
      return {
        query: async (sql: unknown, params?: unknown[]) => {
          if (!failed && isFamilyInsert(sql, params, targetStream, 'generation_started')) {
            failed = true;
            throw new Error('p6_injected_started_write_failure');
          }
          return c.query(sql as string, params);
        },
        release: () => { c.release(); },
      };
    },
  };
  return { pool: proxy as unknown as DbPool, latchFired: () => failed };
}

/** fake「流式观察」模型 seam：受控延迟 + 首 token 观察回调（阶段1 生产无人调用；prove 专用·沿 voice-stream fake 先例）。 */
function observingDelayedModel(scripts: Record<string, (attempt: number) => ModelResult>, opts: {
  service: string; delayMs: number; firstTokenAtMs: number; onFirstToken: () => Promise<void>;
}): ModelClient {
  const base = scriptedModelClient(scripts);
  return {
    async complete(req, attempt, signal) {
      if (req.service === opts.service) {
        await sleep(opts.firstTokenAtMs);
        await opts.onFirstToken();                        // ← 首帧观察点（noteModelFirstToken 由闭包发出）
        await sleep(Math.max(0, opts.delayMs - opts.firstTokenAtMs));
      }
      return base.complete(req, attempt, signal);
    },
  };
}

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));

  /* ── 面1：quizGenerator（T1 节流 + ≤6 上界 + 首 token + 红线 + 重放） ── */
  const QID = `tsq-${Date.now()}`;
  const quizKey = `${QID}:quiz`;
  let genStart = 0;
  let firstTokenWrittenAt = 0;
  const quizModel = observingDelayedModel({
    'resume-quiz.generate': () => ({ ok: true, raw: { items: [{ q: `${MARKER}缓存穿透的三道防线`, refs: [] }] } }),
  }, {
    service: 'resume-quiz.generate', delayMs: 7000, firstTokenAtMs: 2500,
    onFirstToken: async () => {
      await noteModelFirstToken(pool, OWNER, QID, { attemptKey: quizKey, firstTokenMs: Date.now() - genStart, tokensSoFar: 1 });
      firstTokenWrittenAt = Date.now();
    },
  });
  genStart = Date.now();
  const poller = await startFirstSeenPoller(QID);          // 与生成并发跑(先于首写启动)
  const items = await quizGenerator(pool, OWNER, [], quizKey, quizModel, QID)(EMPTY_PROFILE);
  await poller.stop();
  const firstItem = items[0];
  A('TS-P0 quiz 面生成成功(内容不受进度包装影响)', items.length === 1 && !!firstItem && firstItem.q.includes(MARKER));

  const quizRows = await familyRows(QID);
  const started = quizRows.filter((r) => r.kind === 'generation_started');
  const firstToken = quizRows.filter((r) => r.kind === 'model_first_token');
  const progress = quizRows.filter((r) => r.kind === 'generation_progress');
  A('TS-P1 generation_started 恰 1 行(event_key 幂等)', started.length === 1);
  const ftRow = firstToken[0];
  A('TS-P1 model_first_token 存在且 firstTokenMs 为非负数',
    firstToken.length === 1 && !!ftRow && typeof ftRow.payload.firstTokenMs === 'number' && (ftRow.payload.firstTokenMs as number) >= 0);
  // TS-P1 时延 = noteModelFirstToken 提交时刻 → 同形 SSE 读路径首次可见时刻(并发轮询器,粒度 100ms;
  // 生产 SSE 面 2s 轮询周期由 controller 既有行为承担,本断言证写侧提交后即刻可见 ≤ 2s poll+ε)。
  const visibleMs = (poller.seenAt('model_first_token') ?? -1) - firstTokenWrittenAt;
  console.log(`      INFO model_first_token 写提交→SSE 同形读路径可见时延 = ${visibleMs}ms(裁定界 2s poll+ε=2500ms · 轮询粒度 100ms · TS-P1 实测值)`);
  A('TS-P1 model_first_token 经 SSE 同形读路径 ≤ 2500ms 可见', visibleMs >= 0 && visibleMs <= 2500);
  const quizFormulaCap = Math.ceil(7000 / GENERATION_PROGRESS_MIN_INTERVAL_MS) + 1;
  A(`TS-P2 节流行数 ∈ [2, min(${GENERATION_PROGRESS_MAX_ROWS}, ${quizFormulaCap})]`,
    progress.length >= 2 && progress.length <= Math.min(GENERATION_PROGRESS_MAX_ROWS, quizFormulaCap));
  const elapsedSeries = progress.map((r) => Number(r.payload.elapsedMs ?? -1));
  const deltasOk = elapsedSeries.every((v, i) => {
    const prev = i === 0 ? undefined : elapsedSeries[i - 1];
    return v >= 0 && (prev === undefined || v - prev >= GENERATION_PROGRESS_MIN_INTERVAL_MS - 100);
  });
  A('TS-P2 相邻帧 elapsedMs 差 ≥ 2s-ε(纯时间窗)', deltasOk);
  const distinctKeys = new Set(quizRows.map((r) => r.event_key));
  A('TS-P2 event_key 序号互异', distinctKeys.size === quizRows.length);
  A(`TS-P4 generation_progress ≤ ${GENERATION_PROGRESS_MAX_ROWS} 常量上界`, progress.length <= GENERATION_PROGRESS_MAX_ROWS);
  A('TS-P4 家族总行 ≤ MAX+2(started/first_token 各 ≤1)', quizRows.length <= GENERATION_PROGRESS_MAX_ROWS + 2);

  // 重放(同 idempotencyKey 二次经 invoke → claim=cached,fn 秒回;事件键幂等必须不添行)。
  const replayStart = Date.now();
  await quizGenerator(pool, OWNER, [], quizKey, scriptedModelClient({}), QID)(EMPTY_PROFILE);
  A('TS-P4 重放秒回(claim=cached,未再打模型)', Date.now() - replayStart < 2500);
  const afterReplay = await familyRows(QID);
  A('TS-P4 重放后家族行数不变(event_key 幂等)', afterReplay.length === quizRows.length);

  // noteModelFirstToken 直接重放同 attemptKey → 仍 1 行。
  await noteModelFirstToken(pool, OWNER, QID, { attemptKey: quizKey, firstTokenMs: 1, tokensSoFar: 1 });
  await noteModelFirstToken(pool, OWNER, QID, { attemptKey: quizKey, firstTokenMs: 1, tokensSoFar: 1 });
  A('TS-P4 noteModelFirstToken 重放同 attemptKey 仍 1 行', (await familyRows(QID)).filter((r) => r.kind === 'model_first_token').length === 1);

  /* ── 面2：interviewer.ask(retrieveAndGenerate 包装 · scenario 无检索路径) ── */
  const IID = `tsi-${Date.now()}`;
  // 夹具:invoke 的 privacyInterviewId 围栏(interview_privacy_active)要求 interview 行存在且属 OWNER
  // (生产恒真:threadId=已落库 interviewId;沿 adaptive-lifecycle.proof 夹具惯例)。
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [IID, OWNER]);
  const askKey = `${IID}:ask:t0:0`;
  let askGenStart = 0;
  const askModel = observingDelayedModel({
    'interviewer.ask': () => ({ ok: true, raw: { q: `${MARKER}结合限流经历谈高并发`, refs: [] } }),
  }, {
    service: 'interviewer.ask', delayMs: 3000, firstTokenAtMs: 1200,
    onFirstToken: () => noteModelFirstToken(pool, OWNER, IID, { attemptKey: askKey, firstTokenMs: Date.now() - askGenStart, tokensSoFar: 1 }),
  });
  const deps = buildAdaptiveDeps({
    pool, owner: OWNER, threadId: IID, model: askModel,
    competencies: ['并发'],
    localRetrieve: async () => [{ ref: 'qbank:ts-scenario-1', score: 0.9 }], webExplore: async () => [],
  });
  askGenStart = Date.now();
  const generation = await deps.retrieveAndGenerate('并发', 2, 0, 0, [], 'scenario');
  const askRows = await familyRows(IID);
  const askStarted = askRows.find((r) => r.kind === 'generation_started');
  const askOk = 'ok' in generation && generation.ok === true && typeof generation.question === 'string' && generation.question.length > 0;
  if (!askOk) console.log(`      INFO ask generation 结果(失败面诊断) = ${JSON.stringify(generation)}`);
  A('TS-P0 ask 面生成成功(generation 携模型输出题面)', askOk);
  A('TS-P1 ask 面 generation_started 落表且 segments=[retrieve,generate,validate]',
    !!askStarted && Array.isArray(askStarted.payload.segments) && JSON.stringify(askStarted.payload.segments) === JSON.stringify(['retrieve', 'generate', 'validate']));
  A('TS-P1 ask 面 model_first_token 落表', askRows.some((r) => r.kind === 'model_first_token'));

  /* ── 面3：reportGenerator(接线面证明:schema 失败路径也先落 generation_started) ── */
  const RID = `tsr-${Date.now()}`;
  const reportKey = `${RID}:report`;
  let reportThrew = false;
  try {
    await reportGenerator(pool, OWNER, reportKey, scriptedModelClient({
      'report.generate': () => ({ ok: true, raw: { sections: [] } }),   // 故意空 → schema 闸失败(terminal)
    }), RID)({ interviewId: RID, questionCount: 2, scores: [80, 90], owner: OWNER });
  } catch { reportThrew = true; }
  const reportRows = await familyRows(RID);
  A('TS-P0 report 面 schema 失败按预期抛错(report:...)', reportThrew);
  A('TS-P1 report 面 generation_started 先于业务结果落表(接线成立)', reportRows.some((r) => r.kind === 'generation_started' && r.payload.jobKind === 'report'));

  /* ── 面4：TS-P6 generation_started 旁路化(慢写 seam 正形+once-fail 写败负形+seq 序不变式) ── */
  const P6ID = `tsp-${Date.now()}`;
  const P6_SLOW_MS = 1200;
  let p6ModelCalledAt = 0;
  let p6StartedRowsAtModelCall = -1;
  const p6Scripted = scriptedModelClient({
    'resume-quiz.generate': () => ({ ok: true, raw: { items: [{ q: `${MARKER}旁路化内容哨兵`, refs: [] }] } }),
  });
  const p6Model: ModelClient = {
    async complete(req, attempt, signal) {
      if (req.service === 'resume-quiz.generate') {
        p6ModelCalledAt = Date.now();
        const probe = await asPrincipal(pool, OWNER, (c) => c.query(
          'SELECT COUNT(*)::int AS n FROM interview_event WHERE stream_key=$1 AND kind=$2', [P6ID, 'generation_started']));
        p6StartedRowsAtModelCall = Number(probe.rows[0]?.n ?? -1);
        await sleep(2500);   // 受控生成时长(沿 observingDelayedModel delayMs 形):fn 在途覆盖慢写落表窗
      }
      return p6Scripted.complete(req, attempt, signal);
    },
  };
  const p6Poller = await startFirstSeenPoller(P6ID);
  const p6T0 = Date.now();
  const p6Items = await quizGenerator(slowStartedWritePool(P6ID, P6_SLOW_MS), OWNER, [], `${P6ID}:quiz`, p6Model, P6ID)(EMPTY_PROFILE);
  await p6Poller.stop();
  const p6SeenStartedAt = p6Poller.seenAt('generation_started');
  console.log(`      INFO TS-P6 模型起跑=+${p6ModelCalledAt - p6T0}ms·started 可见=+${p6SeenStartedAt === undefined ? -1 : p6SeenStartedAt - p6T0}ms(seam 慢写 ${P6_SLOW_MS}ms·起跑时 started 行=${p6StartedRowsAtModelCall})`);
  A('TS-P6-a 正形·模型 fn 起跑先于 started 行可见(慢写在途时 fn 已跑到模型位·头拍未闸首拍零等待)',
    p6ModelCalledAt - p6T0 < P6_SLOW_MS && p6StartedRowsAtModelCall === 0);
  A('TS-P6-b 正形·生成结果照常返回内容无损(旁路化不改写业务语义)',
    p6Items.length === 1 && !!p6Items[0] && p6Items[0].q.includes(MARKER));
  A('TS-P6-c 正形·poller 首见对照:模型起跑时刻早于 generation_started 可见时刻',
    p6SeenStartedAt !== undefined && p6ModelCalledAt < p6SeenStartedAt);
  A('TS-P6-d 正形·started 恰 1 行(幂等不因旁路化破坏)',
    (await familyRows(P6ID)).filter((r) => r.kind === 'generation_started').length === 1);

  // seq 序不变式(显式 seq 断言臂):调用方终态业务事件(生产形=withGenerationProgress 返回后同流写
  // 终态·quiz 消费面 question_ready 形)恒晚于 started 落表——finally 在途等待承重。
  await asPrincipal(pool, OWNER, (c) => appendEvent(c, OWNER, P6ID, 'question_ready', { count: p6Items.length }));
  const p6All = await streamRows(P6ID);
  const p6StartedRow = p6All.find((r) => r.kind === 'generation_started');
  const p6BizRow = p6All.find((r) => r.kind === 'question_ready');
  A('TS-P6-e seq 序不变式:started.seq < 终态业务事件 seq(调用方终态写恒晚于 started 落表)',
    !!p6StartedRow && !!p6BizRow && p6StartedRow.seq < p6BizRow.seq);

  /* 负形:once-failing pool——started 写恰败一笔(结构化失败日志捕获·生成零扰)。 */
  const P6FID = `tspf-${Date.now()}`;
  const { pool: p6fPool, latchFired } = startedWriteFailingPool(P6FID);
  const origConsoleError = console.error;
  const p6fErrLines: string[] = [];
  console.error = (line: unknown): void => { p6fErrLines.push(typeof line === 'string' ? line : String(line)); };
  let p6fOk = false;
  let p6fContent = '';
  let p6fThrew = false;
  try {
    const p6fItems = await quizGenerator(p6fPool, OWNER, [], `${P6FID}:quiz`, p6Scripted, P6FID)(EMPTY_PROFILE);
    p6fOk = p6fItems.length === 1 && !!p6fItems[0];
    if (p6fOk && p6fItems[0]) p6fContent = p6fItems[0].q;
  } catch { p6fThrew = true; }
  console.error = origConsoleError;
  A('TS-P6-f 负形·写败注入生成成功内容无损(best-effort 零抛穿)', !p6fThrew && p6fOk && p6fContent.includes(MARKER));
  const p6fLogs = p6fErrLines
    .map((line) => { try { return JSON.parse(line) as Record<string, unknown>; } catch { return null; } })
    .filter((o): o is Record<string, unknown> => o !== null && o.event === 'generation_progress_write_failed');
  A('TS-P6-g 负形·结构化失败日志捕获 kind=generation_started(注入恰一笔·streamKey 对流)',
    latchFired() && p6fLogs.some((o) => o.kind === 'generation_started' && o.streamKey === P6FID));
  A('TS-P6-h 负形·started 恒零行(once-fail 无重试·幂等不回填)', (await familyRows(P6FID)).length === 0);

  /* ── TS-P5 载荷红线(三流全查) ── */
  const ALLOWED = new Set(['jobKind', 'operationId', 'attemptKey', 'segments', 'startedAt', 'stage', 'tokensSoFar', 'elapsedMs', 'firstTokenMs']);
  const allFamily = [...await familyRows(QID), ...await familyRows(IID), ...await familyRows(RID)];
  const keysOk = allFamily.every((r) => Object.keys(r.payload).every((k) => ALLOWED.has(k)));
  const noAnswerKey = allFamily.every((r) => !('answer' in r.payload));
  const noContentLeak = allFamily.every((r) => !JSON.stringify(r.payload).includes(MARKER));
  A('TS-P5 payload 键 ⊆ 白名单(无越界键)', keysOk);
  A('TS-P5 无顶层 answer 键(0126 围栏同形)', noAnswerKey);
  A('TS-P5 载荷不含生成内容标记(内容红线)', noContentLeak);

  console.log(`CMD=tokenstream:prove EXIT=${fail === 0 ? 0 : 1}`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); console.log('CMD=tokenstream:prove EXIT=1'); process.exit(1); });
