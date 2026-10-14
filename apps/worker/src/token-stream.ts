/**
 * TOKSTREAM S4b · worker token 流观察缝（S3 §D-3 签名逐字 · 唯一蓝本 tokstream-s3-design.md §D-3/§C-2/§C-3）。
 * 与 generation-progress.ts 同位（阶段1 粗进度=appendEvent 持久面，零触零回归；本面=token_delta 传输态
 * 细流，pg_notify 不落表——两通道正交，迁移号结论=预期零迁移）。
 *
 * 铁律（§C-2/§C-3 逐字承接）：
 *  ① 帧契约 `{v:1, streamKey, attemptKey, seq, text, coalesced?}`；seq 为 (streamKey, attemptKey) 内
 *     自 1 单调递增；L1 合帧（~100ms 窗/≤4KB 码点安全切分·coalesceTokenDeltas 原值复用）；
 *  ② pg_notify('interview_token_ch', JSON 帧) **best-effort**：写败=丢帧，一概不补发不重传
 *     （at-most-once·非权威）；恢复路径唯一=流结束照旧 appendEvent 权威终态（全文）；
 *  ③ token_delta `text`=生成内容 → 仅传输态，Ban 落 interview_event（0126 围栏精神·持久面零扩）；
 *     思考原文维持 R-B 缺省不传输不落盘；
 *  ④ **明令禁止为补 delta 重跑模型调用**（双跑双扣·§E 计费纪律）——本面纯观察，绝不改写业务返回/抛错语义；
 *  ⑤ 结束面 telemetry：usage.completion_tokens vs Σdelta 字符数对账（仅日志·非门·跨语言 tokens≠字符可比）。
 *
 * 单写者前提（EXEC 立项声明·二择一行使=前者「配置上界声明」）：本面前提成立条件=
 * MODEL_EXECUTION_TIMEOUT_MS（invoke.ts 缺省 35_000·上限 120_000）≤ claim lease 60s
 * （invoke claim `leaseSeconds:60`）；部署若配置 execution>lease 则二写者窗存在→seq 回归由 web 侧
 * max-seq 幂等吸收（(attemptKey,seq) 去重·旧 seq 帧丢弃——interview-state token_delta 归约同款语义）。
 *
 * attemptKey 重执行登记（F6 场景·非新机制）：quiz/report 的 attemptKey=idempotencyKey——同 attemptKey
 * 幂等重试窗内重执行时本面 seq 自 1 重启：web 缓冲按 (attemptKey,seq) 键控（max-seq 去重），缓冲按
 * attemptKey 换代不互毒（attemptKey 变=缓冲换代）。
 */
import {
  MODEL_STREAM_FRAME_MAX_BYTES,
  MODEL_STREAM_L1_COALESCE_WINDOW_MS,
  coalesceTokenDeltas,
  splitCodepointSafeByBytes,
  type CoalescedTokenFrame,
  type TokenDeltaFrameInput,
} from '@meetwise/ai-runtime';
import type { DbPool } from '@meetwise/db';

/** TOKENSTREAM S4b 专用 NOTIFY 通道（api 侧 sse-notify.service 同名单连接第二 LISTEN·零新连接零迁移）。 */
export const TOKEN_STREAM_NOTIFY_CHANNEL = 'interview_token_ch';

/**
 * NOTIFY 载荷预算（R8(b)·EXEC 定谳=按 JSON.stringify **后**载荷实算+超限切分）：
 * PostgreSQL NOTIFY 载荷上限 8000 字节；取 7500 安全余量。4KB text 最坏转义膨胀（每字符 ≤6 字节）
 * 可破 envelope——超限时按码点安全切分降档出多帧（seq 连续递增），绝不静默截断内容。
 */
export const TOKEN_NOTIFY_MAX_PAYLOAD_BYTES = 7500;

/**
 * 单写者前提启动期哨兵（文件头「配置上界声明」配套）：部署若配 MODEL_EXECUTION_TIMEOUT_MS
 * 超过 claim lease 60s，启动即结构化 warn 标记二写者窗已开——seq 回归由 web 侧 max-seq 幂等
 * 吸收（缺省 35_000 档零告警；仅提示不改行为）。
 */
const executionTimeoutMsFromEnv = Number.parseInt(process.env.MODEL_EXECUTION_TIMEOUT_MS ?? '', 10);
if (Number.isFinite(executionTimeoutMsFromEnv) && executionTimeoutMsFromEnv > 60_000) {
  console.warn(JSON.stringify({
    event: 'token_stream_single_writer_window_open',
    executionTimeoutMs: executionTimeoutMsFromEnv,
    leaseSeconds: 60,
    mitigation: 'web_max_seq_dedupe',
  }));
}

/** D-3 元信息（签名逐字：meta: { attemptKey, jobKind }）。 */
export interface TokenStreamMeta {
  /** 幂等键（=invoke idempotencyKey）；seq 计数与遥测对账的键面。 */
  attemptKey: string;
  /** 触发面 kind（next_question | quiz | report；阶段1 GenerationJobKind 同域）。 */
  jobKind: string;
}

/** 结束面 usage 报告（completeStream onUsage 同形；调用方无 usage 面时传 undefined——遥测只记 Σdelta 半）。 */
export interface TokenUsageReport {
  completionTokens?: number;
  promptTokens?: number;
  cachedInputTokens?: number;
}

/** D-3 TokenSink（签名逐字：pushDelta(text) / endUsage(u) / abortReason(r)）。 */
export interface TokenSink {
  /** 模型 delta 纯观察入口（码点完整 JS 字符串；L1 合帧后出帧）。 */
  pushDelta(text: string): void;
  /** 结束面 usage 对账遥测（仅日志·非门）；缺省 undefined=只记 Σdelta 字符半。 */
  endUsage(u: TokenUsageReport | undefined): void;
  /** 调用方中止申报（流中失败/上游截断）：停收后续 delta+冲帧（best-effort）+结构化日志。 */
  abortReason(r: string): void;
}

/** 写失败结构化日志（纪律沿 generation-progress logProgressWriteFailure：稳定标量、无 PII/原文/堆栈）。 */
function logWriteFailure(streamKey: string, attemptKey: string, error: unknown): void {
  console.error(JSON.stringify({
    event: 'token_stream_notify_failed',
    streamKey,
    attemptKey,
    errorName: error instanceof Error ? error.name : typeof error,
  }));
}

/**
 * 包装层核心（§D-3 逐字）：`withTokenStream(pool, owner, streamKey, meta, run)`——run 执行期间
 * TokenSink 收模型 delta→L1 合帧→pg_notify best-effort；settle（finally）保证冲净在途帧+遥测对账，
 * 绝不改写 run 的返回/抛错语义（④）。owner 参数= pool 主账面（本面 pg_notify 零表零 RLS，owner 仅
 * 沿 §D-3 签名与日志面承接）。
 */
export async function withTokenStream<T>(
  pool: DbPool, owner: string, streamKey: string, meta: TokenStreamMeta,
  run: (t: TokenSink) => Promise<T>,
): Promise<T> {
  let seq = 0;                       // (streamKey, attemptKey) 内自 1 单调递增（单写者前提见文件头声明）
  let ended = false;                 // settle/abort 后停收（终态后不得再冒帧）
  let deltaChars = 0;                // Σdelta 字符数（⑦遥对面·web 缓冲半=R6 归约）
  let framesEmitted = 0;
  let pending: TokenDeltaFrameInput[] = [];
  let pendingBytes = 0;
  let flushTimer: ReturnType<typeof setTimeout> | undefined;

  const envelopeByteLen = (seqValue: number): number =>
    Buffer.byteLength(JSON.stringify({
      v: 1, streamKey, attemptKey: meta.attemptKey, seq: seqValue, coalesced: true, text: '',
    }), 'utf8') + 16;   // +余量：seq 位数浮动与转义边界

  /** 按 JSON.stringify 后载荷实算（R8(b)）；超限→码点安全切分降档出多帧（不满足则逐级收紧预算）。 */
  const notifySafePieces = (text: string): string[] => {
    const fits = (piece: string, seqValue: number): boolean =>
      Buffer.byteLength(JSON.stringify({
        v: 1, streamKey, attemptKey: meta.attemptKey, seq: seqValue, text: piece,
      }), 'utf8') <= TOKEN_NOTIFY_MAX_PAYLOAD_BYTES;
    if (fits(text, seq + 1)) return [text];
    let budget = Math.max(64, Math.floor((TOKEN_NOTIFY_MAX_PAYLOAD_BYTES - envelopeByteLen(seq + 1)) / 6));
    for (;;) {
      const parts = splitCodepointSafeByBytes(text, budget);
      const firstSeq = seq + 1;
      if (parts.every((p, i) => fits(p, firstSeq + i))) return parts;
      if (budget <= 1) return parts;   // 病态 envelope（单码点仍超）→ 原样出片，写侧 best-effort 丢帧兜底
      budget = Math.max(1, Math.floor(budget / 2));
    }
  };

  const emitFrame = (frame: CoalescedTokenFrame): void => {
    for (const piece of notifySafePieces(frame.text)) {
      seq += 1;
      const payload = JSON.stringify({
        v: 1,
        streamKey,
        attemptKey: meta.attemptKey,
        seq,
        text: piece,
        ...(frame.coalesced ? { coalesced: true as const } : {}),
      });
      framesEmitted += 1;
      // best-effort（②）：pool 直连 NOTIFY（零表零 RLS 零事务；写败=丢帧，绝不阻断业务生成路径）。
      void pool.query('SELECT pg_notify($1::text, $2::text)', [TOKEN_STREAM_NOTIFY_CHANNEL, payload])
        .catch((error: unknown) => logWriteFailure(streamKey, meta.attemptKey, error));
    }
  };

  const flush = (): void => {
    if (flushTimer !== undefined) { clearTimeout(flushTimer); flushTimer = undefined; }
    if (!pending.length) return;
    const inputs = pending;
    pending = [];
    pendingBytes = 0;
    // L1 合帧原值复用（A3 :446·100ms 窗/≤4KB 码点安全切分）——窗语义/预算触顶先冲帧由本面触发，
    // 帧切分与 coalesced 标记全由 coalesceTokenDeltas 权威产出。
    for (const frame of coalesceTokenDeltas(inputs, {
      windowMs: MODEL_STREAM_L1_COALESCE_WINDOW_MS,
      maxFrameBytes: MODEL_STREAM_FRAME_MAX_BYTES,
    })) emitFrame(frame);
  };

  const sink: TokenSink = {
    pushDelta(text) {
      if (ended || !text) return;
      const bytes = Buffer.byteLength(text, 'utf8');
      deltaChars += text.length;                   // Σdelta 字符累计（endUsage 对账遥测半·非恒 0）
      pending.push({ tMs: Date.now(), text });
      pendingBytes += bytes;
      if (pendingBytes >= MODEL_STREAM_FRAME_MAX_BYTES) {
        flush();                                   // 预算触顶先冲帧（L1 语义·同步路径=proof 确定性臂）
        return;
      }
      if (flushTimer === undefined) {
        flushTimer = setTimeout(flush, MODEL_STREAM_L1_COALESCE_WINDOW_MS);
        flushTimer.unref?.();                      // 败者计时器纪律：不悬挂进程退出
      }
    },
    endUsage(u) {
      // ⑦ tokens 对账（仅日志·非门）：completion_tokens 与 Σdelta 字符数跨语言不可比，只并排落盘。
      console.log(JSON.stringify({
        event: 'token_stream_reconcile',
        streamKey,
        attemptKey: meta.attemptKey,
        jobKind: meta.jobKind,
        owner,
        deltaChars,
        frames: framesEmitted,
        completionTokens: u?.completionTokens,
        promptTokens: u?.promptTokens,
        cachedInputTokens: u?.cachedInputTokens,
      }));
    },
    abortReason(r) {
      if (ended) return;
      console.warn(JSON.stringify({
        event: 'token_stream_aborted',
        streamKey,
        attemptKey: meta.attemptKey,
        jobKind: meta.jobKind,
        reason: r,
      }));
      flush();                                     // 已合帧内容 best-effort 冲出（非权威·§C-3 不补发）
      ended = true;
    },
  };

  try {
    return await run(sink);
  } finally {
    ended = true;
    flush();                                       // settle：冲净在途帧（毫秒级；不等待 NOTIFY 回执=best-effort）
    if (flushTimer !== undefined) { clearTimeout(flushTimer); flushTimer = undefined; }
  }
}
