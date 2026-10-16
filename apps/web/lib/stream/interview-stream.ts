/**
 * 面试 SSE 驱动（框架无关,可注入流 + 睡眠单测,不依赖浏览器/React）。
 * 把 decodeSSE + toBusinessEvent + applyEvent 串成"读流→续状态"的循环,并实现**断线自动重连(凭 Last-Event-ID)**。
 *
 * SSE-RESILIENCE（#53/#55/#56, rev2 dual_pass）重连语义：
 * ① 退避为 full-jitter 指数退避（C1 共用,base=500ms·factor=2·cap=30s,可注入）；连续无进展耗尽（maxRetries）
 *    **不再 degraded**——转入慢速永续退避（cap 档）继续重连；degraded 出口只留给：绝对上限 maxTotalReconnects
 *    （防 dribble-DoS,语义保留）、HTTP 400 非法游标（既有 fail-closed 零改）、本刀新增 fatal 状态码（401/404）。
 * ② 断流分家（#55 W3）：**无错干净结束**（for-await 正常完成且非终态=服务器 10min 轮换/正常收尾）不计失败预算,
 *    短固定间隔即重连；**抛错断流**（传输错/溢出）才进失败预算。补钉1：连续 N 次（默认 5）无进展的 clean end
 *    （sse-pump DB 取数失败的第三种 clean-end）重新计入失败预算走退避,禁 1Hz 永续轮询退化向量;有进展即清零。
 *    decodeSSE `sawTraffic`（C10）：本 chunk 见过任何字节（含 `: ping` 心跳）即重置失败预算——心跳盲区修复。
 * ③ 打开状态码分类（#56 W4）：401→停转停转+streamStopReason='auth'（零重连,跳登录由 React 层执行）、
 *    404→fail-closed 'not_found'、429→'rate_limited' 停升级慢速重试（不计连续预算,绝对上限仍封顶）、
 *    5xx→计失败走退避；400 游标仍走 InvalidLastEventIdError 既有语义零改（'cursor'）。
 * ④ resumeSignals 注入（框架无关）：online → 唤醒退避等待+重置退避;visibilitychange→visible → 立即唤醒;
 *    手动重试（W2 去 reload 出口）→ 同一唤醒+重置缝。监听随驱动全部退出路径 dispose（注记B）。
 *
 * 既有不变量:① 终态(report_ready/unavailable/error)→ 收尾返回,不再重连;② 非终态断流/传输错 → reconnecting,凭 lastEventId 续(seq>lastId 重放,不丢不重);
 *        ③ 本次连接有进展(收到帧)→ 重置重试计数(健康的 flapping 不误判耗尽);
 *        ⑤ HTTP 400 invalid_last_event_id → 立即停转 / degraded,不得用同一游标重试(HC-GAP-014,零改);
 *        ⑥ HTTP 410 interview_privacy_fenced → 立即停转**不重连**,直接围栏出口(FENCE-REFLOW F6/#243:永久围栏重连无意义,重试=教用户白点;
 *          沿本刀"fatal 状态码零重连"同臂——不进退避/干净 end 循环)。
 */
import { decodeSSE, toBusinessEvent, type BusinessEvent } from './business-events';
import { applyEvents, initialView, isTerminal, onStreamClosed, onReconnectExhausted, type InterviewView, type StreamStopReason } from './interview-state';
import { isInterviewPrivacyFencedError, isInvalidLastEventIdError, isSseOpenStatusError, classifySseOpenStatus } from './sse-cursor';
import { jitteredBackoff, capJitterBackoff, noopResumeSignals, CLEAN_END_RECONNECT_MS, CLEAN_END_NO_PROGRESS_BUDGET, SSE_BACKOFF_BASE_MS, SSE_BACKOFF_CAP_MS, type ResumeSignals } from './backoff';

/** 打开 SSE 流：真实实现 fetch(url, {headers:{'last-event-id': String(lastEventId)}, signal}) 返回 res.body 的字符串分块异步迭代;
 *  此处注入便于确定性单测。lastEventId>0 时带 Last-Event-ID 头让服务端从 seq>lastEventId 重放;signal 用于卸载取消。 */
export type StreamOpener = (lastEventId: number, signal?: AbortSignal) => AsyncIterable<string> | Promise<AsyncIterable<string>>;

/**
 * 浏览器/调用方恢复信号缝（#53 W1①·注入式,驱动保持无浏览器全局可单测）：
 * 类型、no-op 实现与生产钉值常量单源在 C1 backoff.ts（三驱动共用,杜绝复制粘贴漂移）。
 */
export type { ResumeSignals } from './backoff';
export { noopResumeSignals, CLEAN_END_RECONNECT_MS, CLEAN_END_NO_PROGRESS_BUDGET, SSE_BACKOFF_BASE_MS, SSE_BACKOFF_CAP_MS } from './backoff';

/** 干净 end（轮换/收尾）短固定重连间隔与无进展宽限次数（补钉1）：单源在 backoff.ts,此处 re-export。 */

export interface RunStreamOpts {
  open: StreamOpener;
  onView: (v: InterviewView) => void;
  maxRetries?: number;            // 连续无进展预算:耗尽→**慢速永续**(不再 degraded,#53 W1②)
  maxTotalReconnects?: number;    // **绝对**重连上限(即便每次都有进展也封顶,防 dribble-DoS,审计 A;语义保留)
  maxBufferBytes?: number;        // 单连接 buffer 上限(防无分隔符流无限增长 OOM,审计 B)
  signal?: AbortSignal;           // 卸载/取消(审计 C)
  sleep?: (ms: number) => Promise<void>;
  backoffMs?: (attempt: number) => number;      // 失败预算退避(默认 C1 full-jitter 500ms→30s)
  capBackoffMs?: (attempt: number) => number;                  // 慢速永续/429 cap 档退避(默认 C1 capJitter 30s)
  resumeSignals?: ResumeSignals;                // online/visible/手动重试恢复缝(默认 no-op)
  cleanEndReconnectMs?: number;                 // 干净 end 短固定间隔(默认 1s)
  cleanEndNoProgressBudget?: number;            // 无进展 clean end 宽限次数(补钉1,默认 5)
}

export async function runInterviewStream(opts: RunStreamOpts): Promise<InterviewView> {
  const max = opts.maxRetries ?? 3;
  const maxTotal = opts.maxTotalReconnects ?? 100;
  const maxBuf = opts.maxBufferBytes ?? 1_000_000;
  const cleanMs = opts.cleanEndReconnectMs ?? CLEAN_END_RECONNECT_MS;
  const cleanBudget = opts.cleanEndNoProgressBudget ?? CLEAN_END_NO_PROGRESS_BUDGET;
  // 默认退避睡眠**对 abort 敏感**：卸载时退避中也立即解除,不干等到下一拍(审计残留:prompt teardown)。注入的 sleep(测试)不受影响。
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => {
    if (opts.signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    opts.signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  }));
  const backoff = opts.backoffMs ?? jitteredBackoff(SSE_BACKOFF_BASE_MS, 2, SSE_BACKOFF_CAP_MS);   // C1 full-jitter(旧 200·2^n 封顶5s ≈1.4s 即 degraded 的口径废弃)
  const capBackoff = opts.capBackoffMs ?? capJitterBackoff(SSE_BACKOFF_CAP_MS);
  let view = initialView;
  let attempts = 0;
  let totalReconnects = 0;
  let cleanNoProgress = 0;      // 补钉1:连续无进展 clean end 计数(有进展/收到任何字节即清零)
  let perpetual = false;        // W1②:连续无进展耗尽 → 慢速永续(cap 档),不再 degraded
  let lastFailureReason: StreamStopReason | undefined;   // 最近失败分类(5xx='server';传输=undefined):绝对上限 degraded 时承载,供文案按因分臂

  // resumeSignals 注册与 dispose(注记B:随驱动全部退出路径 dispose——finally 收口)。
  const signals = opts.resumeSignals ?? noopResumeSignals();
  const disposers: Array<() => void> = [];
  let wake: (() => void) | null = null;   // 退避等待中的唤醒柄
  const fire = () => { attempts = 0; cleanNoProgress = 0; perpetual = false; wake?.(); };   // 恢复=立即重连+重置退避(绝对上限不重置)
  disposers.push(signals.onOnline(fire), signals.onVisible(fire), signals.onRetry(fire));

  // 可被 resume 信号打断的退避等待:resume 唤醒即提前解除(不打断注入 sleep 的既有 abort 语义)。
  const doze = (ms: number): Promise<void> => new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => { if (settled) return; settled = true; wake = null; resolve(); };
    wake = finish;
    void Promise.resolve(sleep(ms)).then(finish, finish);
  });

  try {
    for (;;) {
      if (opts.signal?.aborted) return view;                             // 取消(卸载)→ 立即停,不再 onView
      let buffer = '';
      let sawTraffic = false;
      const startId = view.lastEventId;                                   // 本次连接前的进度水位
      let cleanEnd = false;                                               // #55 W3:流无错干净结束(for-await 正常完成)
      try {
        const stream = await opts.open(view.lastEventId, opts.signal);    // 凭 lastEventId 续
        // **续连成功即回 live**(审计高):同时清除上一场连接的 stopReason/轮换旗,防陈旧原因渗进 live 态。
        if (view.connection !== 'live') { view = { ...view, connection: 'live', streamStopReason: undefined, cleanEndReconnect: undefined }; opts.onView(view); }
        for await (const chunk of stream) {
          if (opts.signal?.aborted) return view;
          buffer += chunk;
          if (buffer.length > maxBuf) throw new Error('sse_buffer_overflow'); // 防无分隔符流无限增长 → 当失败重连
          const { frames, rest, sawTraffic: traffic } = decodeSSE(buffer);
          // 心跳/任何字节=活跃信号:收到即重置失败预算(修口径「收到心跳即重置」,#55 心跳盲区;redelivery 防护不受影响——重放帧不推进水位,绝对上限照记)
          if (traffic) { attempts = 0; cleanNoProgress = 0; }
          sawTraffic = sawTraffic || traffic;
          buffer = rest;
          const events: BusinessEvent[] = [];
          let highestId = view.lastEventId;
          for (const f of frames) {
            const ev = toBusinessEvent(f);
            // 服务器按 seq>Last-Event-ID 重放，但代理、切换网络或错误客户端仍可能投递重复帧。
            // 在归约前拒绝 <= 水位的帧，防止重复题目/重复区块/重复 React 更新。
            if (!ev) continue;
            // TOKSTREAM S4b 光标守卫（F2 联动·interview-state 守卫的上游半）：token_delta 全表唯一
            // id optional——不过水位滤网、**不动 highestId**（undefined 一经赋值会毒化本 chunk 内后续
            // 权威帧的 `ev.id <= highestId` 去重比较，致重放帧漏过滤）。
            if (ev.id === undefined) { events.push(ev); continue; }
            if (ev.id <= highestId) continue;
            events.push(ev);
            highestId = ev.id;
          }
          // One decoded network chunk now has one immutable view snapshot and one UI publication. This protects the
          // reducer itself from O(n²) history copies; the React bridge then further coalesces multiple chunks to rAF.
          if (events.length) {
            view = applyEvents(view, events);
            opts.onView(view);
            if (isTerminal(view.phase)) { view = { ...view, connection: 'closed' }; opts.onView(view); return view; } // 终态收尾
          }
        }
        cleanEnd = true;                                                  // 无抛错正常完成=干净 end(轮换/收尾)
      } catch (err) {
        if (opts.signal?.aborted) return view;
        lastFailureReason = undefined;                                    // 传输错(默认无分类),状态码分支命中再精化
        if (isInvalidLastEventIdError(err)) {
          view = onReconnectExhausted(view, 'cursor'); // 非法游标:失败关闭,不重试同一 Last-Event-ID(既有语义零改,原因='cursor')
          opts.onView(view);
          return view;
        }
        if (isInterviewPrivacyFencedError(err)) {
          // F6/#243:围栏=永久态,重连/重试同一游标只会再 410 → 停转不重连,直接围栏出口(view-model 据 privacyFenced 渲染一句话出口)。
          // 终态停转:不进退避/干净 end 循环(沿 SSE-RESILIENCE fatal 分臂同形——cursor/auth/not_found 同为 return 收尾)。
          view = { ...view, connection: 'closed', degraded: true, privacyFenced: true };
          opts.onView(view);
          return view;
        }
        if (isSseOpenStatusError(err)) {
          const cls = classifySseOpenStatus(err.status);                  // #56 W4:按打开状态码分类消费
          if (cls === 'auth') {                                           // 401:停转+零重连,跳登录由 React 层执行
            view = onReconnectExhausted(view, 'auth');
            opts.onView(view);
            return view;
          }
          if (cls === 'not_found') {                                      // 404:fail-closed,不无限重连
            view = onReconnectExhausted(view, 'not_found');
            opts.onView(view);
            return view;
          }
          if (cls === 'rate_limited') {                                   // 429 多标签:停(升级)退避,慢速重试;不计连续预算,绝对上限仍封顶
            view = { ...onStreamClosed(view), streamStopReason: 'rate_limited' as StreamStopReason, cleanEndReconnect: undefined };
            opts.onView(view);
            totalReconnects++;
            if (totalReconnects > maxTotal) { view = onReconnectExhausted(view, 'rate_limited'); opts.onView(view); return view; }
            await doze(capBackoff(attempts));
            continue;
          }
          /* 5xx('server')与其余 4xx/transport:计失败走退避(同下方失败预算路径);绝对上限 degraded 按因承载 */
          lastFailureReason = cls === 'server' ? 'server' : undefined;
        }
        /* 传输错/溢出/5xx:当作断流,走重连(计失败预算) */
      }

      if (opts.signal?.aborted) return view;
      // **真进展(事件 id 推进)才重置连续重试计数**——否则重复重放同一事件的流会无限重连(redelivery≠progress)
      const progressed = view.lastEventId > startId;
      if (progressed) { attempts = 0; cleanNoProgress = 0; lastFailureReason = undefined; }

      if (cleanEnd && !progressed && !sawTraffic) cleanNoProgress++;      // 补钉1:无进展且无字节的 clean end 计宽限
      if (cleanEnd && cleanNoProgress <= cleanBudget) {
        // #55 W3①:无错干净结束(服务器 10min 轮换/正常收尾)→ **不计失败预算**,短固定间隔即重连;
        // 注记C:软措辞轮换闪回(非断网是换连接)。绝对上限计数照记(dribble 防护不因 clean end 豁免)。
        lastFailureReason = undefined;                                    // 服务端能干净收尾=可达,清陈旧失败分类
        view = onStreamClosed(view, { cleanEnd: true });
        opts.onView(view);
        totalReconnects++;
        if (totalReconnects > maxTotal) { view = onReconnectExhausted(view); opts.onView(view); return view; }
        await doze(cleanMs);
        continue;
      }
      // 失败预算路径:抛错断流/溢出/5xx,以及补钉1超宽限的无进展 clean end(DB 取数失败第三种 clean-end,禁 1Hz 永续轮询)
      view = onStreamClosed(view);
      opts.onView(view);
      attempts++;
      totalReconnects++;
      // 绝对上限(即便每次都有进展也封顶) → degraded 出口(语义保留;最近失败分类承载,无分类=缺省文案)
      if (totalReconnects > maxTotal) { view = onReconnectExhausted(view, lastFailureReason); opts.onView(view); return view; }
      // W1②:连续无进展耗尽 → 慢速永续(cap 档)继续重连,**不再 degraded**
      if (attempts > max) perpetual = true;
      await doze(perpetual ? capBackoff(attempts) : backoff(attempts));
    }
  } finally {
    for (const d of disposers) { try { d(); } catch { /* dispose 幂等 */ } }
  }
}
