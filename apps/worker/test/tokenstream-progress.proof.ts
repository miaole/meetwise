/**
 * TOKSTREAM 阶段1 prove（EXEC @REQUEST a31a7bbe · TS-P1..P5 · fake seam 零 live 零模型外呼）。
 * 断言面（harness/token-stream-design.md §3.7 预注册 · 裁定后钉死）：
 *   TS-P1 首 token 事件链：generation_started→model_first_token 产生且 firstTokenMs 记录；进度事件经
 *        API 同形 SSE 读路径（interview.service.ts:950 同 SQL）可见时延 ≤ 2s poll + ε（实测值落输出）。
 *   TS-P2 节流正确性：受控长生成（fake 延迟 7s）下 generation_progress 行数 ∈ [2, min(6, ceil(7s/2s)+1)]，
 *        相邻行 elapsedMs 差 ≥ 2s-ε，event_key 序号互异。
 *   TS-P3 前端渲染断言：web:prove 面（apps/web/test/web-logic.proof.ts TOKSTREAM 段，不在本文件）。
 *   TS-P4 膨胀上界：generation_progress ≤ GENERATION_PROGRESS_MAX_ROWS(6)；started==1（event_key 幂等）；
 *        重放（同 idempotencyKey 二次经 invoke=cached）不添行；noteModelFirstToken 重放不添行；家族总行 ≤ 8。
 *   TS-P5 载荷红线：进度家族 payload 键 ⊆ 白名单；无顶层 answer；不含生成内容标记（TS-MARKER）。
 * 运行：pnpm tokenstream:prove（经 scripts/run-e2e-isolated.mjs 隔离 PG）；本地直接跑需 DATABASE_URL。
 */
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, loadMigrations, runMigrations } from '@meetwise/db';
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
    return r.rows.map((row) => ({ seq: Number(row.seq), kind: row.kind, payload: row.payload, event_key: row.event_key }));
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
    localRetrieve: async () => [], webExplore: async () => [],
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
