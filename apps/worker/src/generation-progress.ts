/**
 * TOKSTREAM 阶段1 · 生成进度事件（EXEC @REQUEST a31a7bbe · pre-dual BOTH PASS · 协调方 EXEC 授权）。
 * 裁定落地：D-1=案A（interview_event 节流持久写）· D-1b=T1 纯时间窗 2s（schema 预留 tokensSoFar）·
 * 断线语义=重放（幂等覆盖写 + 终态清除，前端归约侧承重）· R-B 思考隐私缺省（不传输思考原文）·
 * D-2=新 generation_* kind · 触发面= interviewer.ask / resume-quiz.generate / report.narrative 三处包装层回调。
 *
 * 铁律（沿设计刀 harness/token-stream-design.md §3.2/§7）：
 *  ① 进度事件**非权威、非终态**——question_ready/quiz_ready/report_ready/*_unavailable/error 永远是唯一权威终态；
 *  ② 载荷红线：只含计数/时刻/段名/幂等键，**绝不出现生成内容/思考原文/prompt/答案文本**（写侧键白名单守卫 + 0126 围栏双保险）；
 *  ③ 节流：generation_progress 每 2s 至多一行且每次生成 ≤GENERATION_PROGRESS_MAX_ROWS 行（常量断言面 TS-P2/P4）；
 *  ④ 写失败 best-effort（结构化日志，绝不打断业务生成路径——进度不是健康信号）；
 *  ⑤ invoke 关口零改动（本模块只做「调用外」的旁路写）。
 */
import { asPrincipal, appendEvent, type DbPool } from '@meetwise/db';

/** 家族事件 kind（D-2 新 kind；前端 business-events/quiz-state 白名单双端同刀注册）。 */
export const GENERATION_PROGRESS_KINDS = ['generation_started', 'model_first_token', 'generation_progress'] as const;
export type GenerationProgressKind = (typeof GENERATION_PROGRESS_KINDS)[number];
export const isGenerationProgressKind = (kind: string): kind is GenerationProgressKind =>
  (GENERATION_PROGRESS_KINDS as readonly string[]).includes(kind);

/** T1 纯时间窗节流：两帧 generation_progress 至少间隔 2s（裁定 D-1b；帧数上界与生成长度解耦）。 */
export const GENERATION_PROGRESS_MIN_INTERVAL_MS = 2000;
/**
 * 每次生成（attemptKey）的 generation_progress 行数硬上界（裁定 D-1「≤6 行/生成常量断言」）。
 * generation_started / model_first_token 由 event_key 幂等天然各 ≤1 行（不占此配额；家族总行上界 = 6+2）。
 * 35s 执行超时缺省下 T1 理论上界 ~18 行，此常量是更紧的确定性上界（prove 断言 TS-P2/P4）。
 */
export const GENERATION_PROGRESS_MAX_ROWS = 6;

/** 阶段1 触发面（裁定：只做三面；评估/规划/路由/OCR 默认不接，防事件面泛化）。 */
export type GenerationJobKind = 'next_question' | 'quiz' | 'report';

/** 载荷键白名单（红线机检面 TS-P5）：任何新增键须先过设计面（Ban 内容/思考原文键）。 */
const PROGRESS_PAYLOAD_ALLOWED_KEYS: ReadonlySet<string> = new Set([
  'jobKind', 'operationId', 'attemptKey', 'segments', 'startedAt',
  'stage', 'tokensSoFar', 'elapsedMs', 'firstTokenMs',
]);

export interface GenerationProgressMeta {
  jobKind: GenerationJobKind;
  operationId: string;
  /** 幂等键（=invoke idempotencyKey）；同 attemptKey 重放经 event_key 不添行。 */
  attemptKey: string;
  /** 预估段（前端进度展示用；段名须在 STAGE 标签表内或可回退原文）。 */
  segments: readonly string[];
}

function enforcePayloadRedLine(kind: GenerationProgressKind, payload: Record<string, unknown>): void {
  for (const key of Object.keys(payload)) {
    if (!PROGRESS_PAYLOAD_ALLOWED_KEYS.has(key)) throw new Error(`generation_progress_payload_key_forbidden:${kind}:${key}`);
  }
}

/** 进度写失败：结构化日志（稳定标量，无 PII/原文/堆栈），绝不打断业务路径（纪律同 persistTraceBestEffort）。 */
function logProgressWriteFailure(meta: { stream: string; kind: string }, error: unknown): void {
  console.error(JSON.stringify({
    event: 'generation_progress_write_failed',
    streamKey: meta.stream,
    kind: meta.kind,
    errorName: error instanceof Error ? error.name : typeof error,
  }));
}

/** 每流每次生成的节流状态（进程内；跨进程重放由 event_key 幂等兜底行数上界）。 */
interface ProgressTracker { rows: number; lastWriteAt: number }
const progressTrackers = new Map<string, ProgressTracker>();

/** 测试 seam：重置进程内节流状态（prove 模拟跨进程重放用；生产零调用）。 */
export function resetGenerationProgressTrackersForTest(): void {
  progressTrackers.clear();
}

const sleep = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

async function writeEventRow(
  pool: DbPool, owner: string, stream: string, kind: GenerationProgressKind,
  payload: Record<string, unknown>, eventKey: string,
): Promise<void> {
  enforcePayloadRedLine(kind, payload);
  await asPrincipal(pool, owner, (c) => appendEvent(c, owner, stream, kind, payload, eventKey));
}

/**
 * 阶段2 观察 seam（阶段1 仅 fake seam/produce 调用；生产非流式下无人调用=恒静默）。
 * 首 token 时刻自 dispatch 起算由调用方提供；event_key 幂等 → 同 attemptKey 至多 1 行。
 */
export async function noteModelFirstToken(
  pool: DbPool, owner: string, stream: string,
  p: { attemptKey: string; firstTokenMs: number; tokensSoFar?: number },
): Promise<void> {
  await writeEventRow(pool, owner, stream, 'model_first_token', {
    attemptKey: p.attemptKey, firstTokenMs: p.firstTokenMs, ...(p.tokensSoFar !== undefined ? { tokensSoFar: p.tokensSoFar } : {}),
  }, `generation:${p.attemptKey}:first-token`);
}

export interface GenerationProgressRun {
  /** 段切换（retrieve→generate 等）；下一帧心跳携带新段名（纯时间窗，不为切段加帧——裁定 T1）。 */
  stage(name: string): void;
}

/**
 * 包装层回调核心：emit generation_started（幂等）→ fn 执行期间每 2s 至多一行 generation_progress
 * （≤MAX_ROWS 行硬上界）→ fn settle 后保证无在途进度写（不会晚于业务终态事件提交，防「终态后又冒进度」）。
 * 进度写全部 best-effort：失败只结构化日志，绝不改写 fn 的返回/抛错语义。
 */
export async function withGenerationProgress<T>(
  pool: DbPool, owner: string, stream: string, meta: GenerationProgressMeta,
  fn: (run: GenerationProgressRun) => Promise<T>,
): Promise<T> {
  const trackerKey = `${stream}\u0000${meta.attemptKey}`;
  const tracker: ProgressTracker = progressTrackers.get(trackerKey) ?? { rows: 0, lastWriteAt: 0 };
  progressTrackers.set(trackerKey, tracker);
  const startedAtMs = Date.now();
  let stage = meta.segments[0] ?? 'generate';
  let done = false;
  // 在途写链：finally 只需等「已在途的那一笔」（毫秒级），不等下一拍 sleep（否则每次生成白等 ≤2s）。
  let inflight: Promise<void> = Promise.resolve();
  let stopHeartbeat: (() => void) | undefined;
  const stopped = new Promise<void>((resolve) => { stopHeartbeat = resolve; });

  const writeProgressOnce = (): void => {
    if (done || tracker.rows >= GENERATION_PROGRESS_MAX_ROWS) return;
    const now = Date.now();
    if (tracker.lastWriteAt !== 0 && now - tracker.lastWriteAt < GENERATION_PROGRESS_MIN_INTERVAL_MS) return;
    tracker.rows += 1;
    tracker.lastWriteAt = now;
    const ordinal = tracker.rows;   // event_key 序号：跨进程重放同 ordinal → ON CONFLICT 不添行
    inflight = inflight.then(() => writeEventRow(pool, owner, stream, 'generation_progress', {
      attemptKey: meta.attemptKey, stage, elapsedMs: now - startedAtMs,
    }, `generation:${meta.attemptKey}:progress:${ordinal}`)).catch((error: unknown) => {
      logProgressWriteFailure({ stream, kind: 'generation_progress' }, error);
    });
  };

  // generation_started（幂等 event_key；重放/重跑不添行）。首写 best-effort。
  await writeEventRow(pool, owner, stream, 'generation_started', {
    jobKind: meta.jobKind, operationId: meta.operationId, attemptKey: meta.attemptKey,
    segments: [...meta.segments], startedAt: new Date(startedAtMs).toISOString(),
  }, `generation:${meta.attemptKey}:started`)
    .catch((error: unknown) => { logProgressWriteFailure({ stream, kind: 'generation_started' }, error); });

  const heartbeat = (async () => {
    while (!done) {
      // settle 即醒（stopped），不留悬挂 timer 拖住进程退出。
      await Promise.race([sleep(GENERATION_PROGRESS_MIN_INTERVAL_MS), stopped]);
      if (done) break;
      writeProgressOnce();
    }
  })();

  try {
    return await fn({ stage: (name) => { stage = name; } });
  } finally {
    done = true;
    stopHeartbeat?.();
    progressTrackers.delete(trackerKey);
    await Promise.all([inflight, heartbeat]).catch(() => undefined);
  }
}
