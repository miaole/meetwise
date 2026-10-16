import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { createPool, type Client, type DbPool } from '@meetwise/db';

/**
 * SSE-PUSH(用户直裁刀 · Opt1 通道健康分级兜底):interview_event INSERT 触发器
 * (迁移 0143)在 `interview_event_ch` 上 pg_notify 裸 stream_key;API 进程用
 * **恰一条**专用 LISTEN 连接收播,进程内 router 按 streamKey 分发给该流的
 * SSE 等待者(pump 侧 Promise.race 的 notify 臂)。
 *
 * 通道健康双条件(协调方约束①,任一失败即降级):
 *   1. LISTEN 连接在位(专用池 max:1,断连按指数退避重连);
 *   2. establish 期恰一次 pg_trigger SELECT 实证 0143 trigger 在场
 *      (每连接建立时一次,非每 SSE、非周期)。
 * 降级可观测(协调方约束②):每次降级转变打一行结构化日志
 *   `SSE_NOTIFY_DEGRADED reason=listen_down|trigger_missing ...`
 * pump 侧降级即回落 legacy 2s 轮询(fail-open 回旧行为,不变慢不变错之外
 * 的第三形态:回到旧 cadence,两既有 proof 的退化环境按构造即此路径)。
 *
 * 生命周期蓝本 = apps/worker job-wakeup-listener(只复制不共享:Ban 碰 worker
 * wakeup 通道本体)。通知回调内零 SQL:只 resolve 等待者(edge-trigger);
 * 事实仍由 pump 的 seq>lastSeq 取数把关 —— notify 是 lossy hint,误醒空手
 * ping、漏醒由兜底收。
 *
 * 单例经 getSseNotify() 惰性建立(**禁每 SSE 一条 LISTEN 连接**):既有 proof
 * (sse-principal-slot)自建 module 无本 provider,控制器构造器零改动,故不走
 * Nest DI 注入控制器;PlatformModule 仅挂关闭钩子兜底收池。
 */
export const SSE_NOTIFY_CHANNEL = 'interview_event_ch';
export const SSE_NOTIFY_TRIGGER_NAME = 'interview_event_sse_notify';

/**
 * TOKSTREAM S4b：token delta 专用 NOTIFY 通道（worker token-stream.ts 同名常量）。
 * 纯 NOTIFY 通道零表零触发器（worker `SELECT pg_notify` 直发）=**零迁移**根据；同专用连接
 * 第二 LISTEN 命令（A11 单例纪律零破·禁每 SSE 一连接）。
 */
export const SSE_TOKEN_CHANNEL = 'interview_token_ch';

/** worker→api token 帧（§C-2 帧契约逐字；api→browser emit 面剥 v/streamKey=流键已由路由承载）。 */
export interface SseTokenFrame {
  v: number;
  streamKey: string;
  attemptKey: string;
  seq: number;
  text: string;
  coalesced?: boolean;
}

export type SseTokenSubscriber = (frame: SseTokenFrame) => void;

/**
 * 守卫缓存吊销广播通道(#36 同 seam 第二缓存共用)：与 interview_event_ch 同一条专用 LISTEN
 * 连接挂第二通道(同连接多 LISTEN·零新增连接预算)。收播=本进程 evict 对应缓存 + 单调 evict 序
 * 自增(回填 TOCTOU 守卫比对源)。生产端=user_account 触发器(0189)与 revokeSession 单语句
 * pg_notify——都与状态 UPDATE 同事务随 commit 送达；LISTEN 断连/未建立时退回各缓存 ≤60s TTL 兜底。
 */
export const PRINCIPAL_EVICT_CHANNEL = 'meetwise_principal_evict_v1';
export type PrincipalEvictKind = 'uid' | 'jti';
type PrincipalEvictHandler = (key: string) => void;

const principalEvictHandlers: Record<PrincipalEvictKind, Set<PrincipalEvictHandler>> = {
  uid: new Set(),
  jti: new Set(),
};
/** 单调 evict 序(每进程每键)：回填前比对——DB 读开始后若序前进,该读可能先于远端 commit,放弃回填。 */
const principalEvictSeq: Record<PrincipalEvictKind, Map<string, number>> = {
  uid: new Map(),
  jti: new Map(),
};

export function principalEvictGeneration(kind: PrincipalEvictKind, key: string): number {
  return principalEvictSeq[kind].get(key) ?? 0;
}

/**
 * 本进程 evict 入口(本地吊销写路径调用,也由收播分派调用)：序自增 + 触发全部已注册本进程 evict。
 * 序前进即「此后完成的 DB 读可能读到旧态」的信号,回填侧据此放弃落缓存。
 */
export function notePrincipalEvicted(kind: PrincipalEvictKind, key: string): void {
  const seq = principalEvictSeq[kind];
  seq.set(key, (seq.get(key) ?? 0) + 1);
  for (const h of principalEvictHandlers[kind]) {
    try { h(key); } catch { /* evict 处理器只动进程内 Map,不抛 */ }
  }
}

/** 注册本进程 evict 处理器；首个订阅者触发 LISTEN 建立(不等首个 SSE 流,吊销窗从进程启动即生效)。 */
export function onPrincipalEvict(kind: PrincipalEvictKind, handler: PrincipalEvictHandler): void {
  principalEvictHandlers[kind].add(handler);
  getSseNotify().whenHealthy();
}

/** 收播分派(载荷=JSON {t,k};只动进程内 Map,零 SQL)。畸形载荷丢弃(TTL 兜底恒在)。 */
function dispatchPrincipalEvict(raw: string | undefined): void {
  if (!raw) return;
  let kind: string, key: string;
  try {
    const p = JSON.parse(raw) as { t?: string; k?: string };
    kind = p.t ?? '';
    key = p.k ?? '';
  } catch { return; }
  if ((kind !== 'uid' && kind !== 'jti') || typeof key !== 'string' || key.length === 0 || key.length > 512) return;
  notePrincipalEvicted(kind, key);
}

/** 降级原因(协调方约束②枚举;listen_down 兼作未建立/断连的初始态)。 */
export type SseNotifyReason = 'listen_down' | 'trigger_missing';
export type SseNotifyHealth = { healthy: true } | { healthy: false; reason: SseNotifyReason };

type ListenClient = Client;

export interface SseNotifyOptions {
  /** 测试缝(worker-listener 同款);生产用专用池独占客户端。 */
  connect?: () => Promise<ListenClient>;
  /** 测试缝;生产 console.warn。 */
  log?: (line: string) => void;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  random?: () => number;
}

export interface SseNotifyWait {
  promise: Promise<void>;
  /** 注销等待者(幂等;race 落败/循环退出/断开收尾全路径调用)。 */
  dispose(): void;
}

const DEFAULT_BASE_MS = 100;
const DEFAULT_MAX_MS = 5_000;

@Injectable()
export class SseNotifyService {
  private readonly router = new Map<string, Set<() => void>>();
  /** TOKSTREAM S4b：token 帧订阅路由（同流多订阅者广播复制·禁互偷帧——A 帧被 pump₁ 消费不得致 pump₂ 丢帧）。 */
  private readonly tokenRouter = new Map<string, Set<SseTokenSubscriber>>();
  private tokenListenDegraded = false;
  private readonly connectOverride: (() => Promise<ListenClient>) | undefined;
  private readonly logLine: (line: string) => void;
  private readonly reconnectBaseMs: number;
  private readonly reconnectMaxMs: number;
  private readonly random: () => number;

  private pool: DbPool | undefined;
  private active: ListenClient | undefined;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private stopPromise: Promise<void> | undefined;
  private stopped = false;
  private establishing = false;
  private consecutiveFailures = 0;
  private lastLoggedReason: SseNotifyReason | undefined;
  private state: SseNotifyHealth = { healthy: false, reason: 'listen_down' };
  private healthyResolvers: Array<(h: SseNotifyHealth) => void> = [];

  constructor(options: SseNotifyOptions = {}) {
    this.connectOverride = options.connect;
    this.logLine = options.log ?? ((l) => console.warn(l));
    this.reconnectBaseMs = options.reconnectBaseMs ?? DEFAULT_BASE_MS;
    this.reconnectMaxMs = options.reconnectMaxMs ?? DEFAULT_MAX_MS;
    this.random = options.random ?? Math.random;
  }

  /** 同步读当前通道健康(pump 每循环迭代读一次:降级可即时回落)。 */
  health(): SseNotifyHealth {
    return this.state;
  }

  /** 等待首个健康 establish(生产启动探针/proof 预热;不健康也不 reject)。 */
  whenHealthy(): Promise<SseNotifyHealth> {
    if (this.state.healthy) return Promise.resolve(this.state);
    this.ensureStarted();
    return new Promise((resolve) => this.healthyResolvers.push(resolve));
  }

  /** 注册某流的等待者;notify 到达即 resolve(lossy 信号,只醒不取数)。 */
  waitFor(streamKey: string): SseNotifyWait {
    this.ensureStarted();
    let settle: () => void = () => {};
    const promise = new Promise<void>((resolve) => { settle = resolve; });
    const entry = () => {
      settle();
      this.remove(streamKey, entry);
    };
    let set = this.router.get(streamKey);
    if (!set) { set = new Set(); this.router.set(streamKey, set); }
    set.add(entry);
    return { promise, dispose: () => this.remove(streamKey, entry) };
  }

  /** 在册等待者总数(ops/proof:断连注销无泄漏断言)。 */
  waitingCount(): number {
    let n = 0;
    for (const set of this.router.values()) n += set.size;
    return n;
  }

  /**
   * TOKSTREAM S4b：订阅本流 token delta 帧（连续广播订阅·非 edge-trigger）。fan-out 语义=**广播复制**
   * （EXEC 定谳）：同 streamKey 多订阅者各得同一帧对象（只读不变形），A 帧被任一 pump 消费不得致其他
   * pump 丢帧（禁互偷帧）。回调内零 SQL 纪律同 waitFor。dispose=注销（断开/终态全路径调用）。
   */
  subscribeToken(streamKey: string, onFrame: SseTokenSubscriber): { dispose(): void } {
    this.ensureStarted();
    let set = this.tokenRouter.get(streamKey);
    if (!set) { set = new Set(); this.tokenRouter.set(streamKey, set); }
    set.add(onFrame);
    return {
      dispose: () => {
        const s = this.tokenRouter.get(streamKey);
        if (!s) return;
        s.delete(onFrame);
        if (s.size === 0) this.tokenRouter.delete(streamKey);
      },
    };
  }

  /** token 订阅者总数(ops/proof:断连注销无泄漏断言面)。 */
  tokenSubscriberCount(): number {
    let n = 0;
    for (const set of this.tokenRouter.values()) n += set.size;
    return n;
  }

  /** 终态收尾:停重连、放回客户端、关专用池(隐式 UNLISTEN)。 */
  async stop(): Promise<void> {
    if (!this.stopPromise) {
      this.stopped = true;
      if (this.retryTimer) clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
      const client = this.active;
      this.active = undefined;
      this.state = { healthy: false, reason: 'listen_down' };   // 计划内关停≠降级,不打降级日志
      for (const r of this.healthyResolvers.splice(0)) r(this.state);
      this.stopPromise = (async () => {
        if (client) { this.detach(client); try { client.release(); } catch { /* already gone */ } }
        if (this.pool) { const p = this.pool; this.pool = undefined; await p.end().catch(() => undefined); }
      })();
    }
    await this.stopPromise;
  }

  private remove(streamKey: string, entry: () => void) {
    const set = this.router.get(streamKey);
    if (!set) return;
    set.delete(entry);
    if (set.size === 0) this.router.delete(streamKey);
  }

  private ensureStarted() {
    if (this.stopped || this.pool || this.connectOverride) {
      // 测试缝路径:退避计时器在位时不旁路(重连节奏与生产同构,单测可确定性读数)。
      if (this.connectOverride && !this.retryTimer) void this.establish();
      return;
    }
    try {
      // 每进程恰一条:独立 max:1 专用池,不占请求池(禁每 SSE 一条连接)。
      this.pool = createPool({ max: 1, purpose: 'sse-listen' });
    } catch {
      this.degrade('listen_down');
      this.scheduleReconnect();
      return;
    }
    void this.establish();
  }

  private delayFor(failures: number) {
    const cap = Math.min(this.reconnectMaxMs, this.reconnectBaseMs * (2 ** Math.min(Math.max(failures - 1, 0), 8)));
    return Math.min(this.reconnectMaxMs, Math.floor(cap * (0.75 + Math.max(0, Math.min(1, this.random())) * 0.25)));
  }

  private scheduleReconnect() {
    if (this.stopped || this.retryTimer) return;
    this.consecutiveFailures += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      void this.establish();
    }, this.delayFor(this.consecutiveFailures));
    this.retryTimer.unref?.();
  }

  private detach(client: ListenClient) {
    client.off('notification', this.onNotification as never);
    client.off('error', this.onClientError as never);
    client.off('end', this.onClientEnd as never);
  }

  private readonly onNotification = (message: { channel: string; payload?: string }) => {
    if (this.stopped) return;
    if (message.channel === SSE_TOKEN_CHANNEL) { this.dispatchTokenFrame(message.payload); return; }   // TOKSTREAM S4b 第二通道分流
    if (message.channel === PRINCIPAL_EVICT_CHANNEL) { dispatchPrincipalEvict(message.payload); return; }
    if (message.channel !== SSE_NOTIFY_CHANNEL) return;
    const key = message.payload;
    if (!key) return;
    const set = this.router.get(key);
    if (!set) return;
    for (const entry of [...set]) entry();   // 同流多等待者全醒(P-4);回调内零 SQL
  };

  /**
   * token 帧分流（TOKSTREAM S4b）：解析+形状校验（有损通道·坏帧即丢不补发 §C-3）→ 同流订阅者广播
   * 复制。订阅者回调异常吞没不外溢（泵侧 safeWrite 自守卫写失败）。
   */
  private dispatchTokenFrame(payload?: string): void {
    if (!payload) return;
    let parsed: unknown;
    try { parsed = JSON.parse(payload); } catch { return; }
    const f = parsed as Partial<SseTokenFrame> | null;
    if (!f || typeof f !== 'object') return;
    if (f.v !== 1 || typeof f.streamKey !== 'string' || !f.streamKey
      || typeof f.attemptKey !== 'string' || !f.attemptKey
      || typeof f.text !== 'string'
      || typeof f.seq !== 'number' || !Number.isSafeInteger(f.seq) || f.seq < 1) return;
    const frame: SseTokenFrame = {
      v: 1, streamKey: f.streamKey, attemptKey: f.attemptKey, seq: f.seq, text: f.text,
      ...(f.coalesced === true ? { coalesced: true as const } : {}),
    };
    const set = this.tokenRouter.get(f.streamKey);
    if (!set) return;
    for (const sub of [...set]) {
      try { sub(frame); } catch { /* 订阅者异常不外溢 */ }
    }
  }

  private readonly onClientError = () => { if (this.active) this.loseClient('listen_down'); };
  private readonly onClientEnd = () => { if (this.active) this.loseClient('listen_down'); };

  private loseClient(reason: SseNotifyReason) {
    const client = this.active;
    this.active = undefined;
    if (client) { this.detach(client); try { client.release(new Error('sse_notify_listen_lost')); } catch { /* already released */ } }
    this.degrade(reason);
    this.scheduleReconnect();
  }

  private degrade(reason: SseNotifyReason) {
    const wasHealthy = this.state.healthy;
    this.state = { healthy: false, reason };
    // 约束②:每次降级转变一行结构化日志(同原因持续降级不重复刷屏)。
    if ((wasHealthy || this.lastLoggedReason !== reason)) {
      this.lastLoggedReason = reason;
      this.logLine(
        `SSE_NOTIFY_DEGRADED reason=${reason} fallback=legacy_2s_poll` +
        (reason === 'trigger_missing'
          ? ` hint=trigger_${SSE_NOTIFY_TRIGGER_NAME}_absent_see_migration_0143`
          : ` hint=listen_connect_failed_will_retry_backoff`),
      );
    }
  }

  private async establish(): Promise<void> {
    if (this.stopped || this.active || this.establishing) return;
    this.establishing = true;
    let client: ListenClient | undefined;
    try {
      client = this.connectOverride ? await this.connectOverride() : await this.pool!.connect();
      if (this.stopped) { client.release(); return; }
      this.active = client;
      client.on('notification', this.onNotification as never);
      client.on('error', this.onClientError as never);
      client.on('end', this.onClientEnd as never);
      await client.query(`LISTEN ${SSE_NOTIFY_CHANNEL}`);
      // TOKSTREAM S4b：同连接第二 LISTEN（零新连接零迁移·A11 单例纪律零破）。token 通道=有损
      // best-effort（§C-3 不补发）——其失败只降级 token 臂（结构化日志一次），绝不拖垮权威事件
      // 通道健康面（health() 语义原值=事件通道 LISTEN+0143 trigger 双条件）。
      try {
        await client.query(`LISTEN ${SSE_TOKEN_CHANNEL}`);
        this.tokenListenDegraded = false;
      } catch {
        if (!this.tokenListenDegraded) {
          this.tokenListenDegraded = true;
          this.logLine('SSE_TOKEN_CHANNEL_DEGRADED reason=listen_failed hint=token_delta_arm_off_authoritative_channel_unaffected');
        }
      }
      // 守卫吊销广播第二通道:同连接多 LISTEN(零新增连接预算);随本连接断连/重连生命周期同寿。
      await client.query(`LISTEN ${PRINCIPAL_EVICT_CHANNEL}`);
      // 约束①条件2:establish 期恰一次 trigger 实证(每连接一次;缺席即降级并退避
      // 重连——迁移后发版的自愈路径:下次 establish 重新实证)。
      const trig = await client.query(
        'SELECT 1 FROM pg_trigger WHERE tgname = $1 AND tgrelid = $2::regclass LIMIT 1',
        [SSE_NOTIFY_TRIGGER_NAME, 'interview_event'],
      );
      if (this.stopped || this.active !== client) return;
      if (trig.rowCount !== 1) {
        this.loseClient('trigger_missing');
        return;
      }
      this.state = { healthy: true };
      this.consecutiveFailures = 0;
      this.lastLoggedReason = undefined;
      for (const r of this.healthyResolvers.splice(0)) r(this.state);
    } catch {
      if (client && this.active === client) this.loseClient('listen_down');
      else if (client) { try { client.release(); } catch { /* already released */ } }
      else this.degrade('listen_down');
      this.scheduleReconnect();
    } finally {
      this.establishing = false;
    }
  }
}

let singleton: SseNotifyService | undefined;

/** 进程级单例(每进程恰一条 LISTEN 连接;惰性起:首个 waitFor/whenHealthy 触发)。 */
export function getSseNotify(): SseNotifyService {
  singleton ??= new SseNotifyService();
  return singleton;
}

/** PlatformModule 关闭钩子:进程收尾时关掉单例专用池(app.close() 即触发)。 */
@Injectable()
export class SseNotifyLifecycle implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await getSseNotify().stop();
  }
}
