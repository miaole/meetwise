/**
 * checkpoint 写世代围栏 façade（写缝拦截形）。
 *
 * 红面：checkpoint 写（invoke 内部 superstep put/putWrites）是全链唯一零 fence 消费的持久化写面
 * ——session advisory lock 只在会话存续时串行化；会话丢/failover 窗口内旧世代迟到的 put 会覆盖
 * 新世代 checkpoint 头，且该错位对投影侧 requireCurrentFence（只查 ai_graph_run 行）不可见。
 *
 * 门=唯三谓词（lease_owner/version/lease_expires_at，沿 assertInterviewGraphFence 复用零改）。
 * checkpoint.id 不参与放行判定——put 缝落新 id、putWrites 缝的 config 是否携带 checkpoint_id
 * 依装版而异且两形都不读它，三谓词即全部判据（id 仅由调用方锚定世代基点供 proof 断言；
 * id 缺失/undefined 时三谓词判定不受影响=零 fail-open 面）。
 *
 * fail-closed 两款：fence 不可缺省/不可空，缺失即构造期拒（禁投影侧 `d.fence &&` 短路放行形
 * ——写缝门禁用此形）；assert 查询异常（PG 错误等）原样上抛，异常≠放行，不吞不改码。
 *
 * 失守抛既有 `graph_fence_lost` 码=TRANSIENT_INTERVIEW_JOB_ERROR_CODES 既有 transient 白名单
 * （requeue+退避，下一持有者从最后被围栏 checkpoint 续跑），零新增分类。
 *
 * 残余窗口如实披露：assert 查询→内层 saver INSERT 为毫秒级 check-then-act 残缝；零迁移、
 * packages/db/src 零改、checkpointer 零替换的边界内不可再收窄（每 takeover 至多在飞
 * ~5 个 superstep 拍的暴露窗）。如实声明不声称闭合。
 *
 * 【WORKER-INFLIGHT-CRASH-01·2026-11-11】写失败收容（runContained 作用域内）：LangGraph 1.4.7
 * PregelLoop._trackCheckpointerPromise 把 put/putWrites 的 promise 包成 `tracked` 放进 Set，只在
 * _streamIterator 的 finally 里 Promise.all——写失败到 finally 之间（节点还在等模型/DB）`tracked`
 * 无 handler=unhandledRejection=Node 默认整进程退出（2c4g sizing globalInflight=16：42501
 * checkpoint_privacy_fenced / pg `Connection terminated` 两例真崩）。收容形：作用域内写失败
 * 被锁存（latch）+ abort 本次 invoke 的 signal，返回给 LangGraph 的 promise 一律 resolve（不再有
 * 可外溢的 rejected promise）；锁存后写缝零续写（fail-closed：不落任何后续 checkpoint），读缝
 * getTuple/list 直接抛锁存错；runContained 结束时原样抛锁存错（码不改→consumer 既有分类器：
 * 42501 确定性终态、graph_fence_lost/连接族 transient requeue）。
 * 锁存优先级：不可重试（42501 / 其他非瞬时码）覆盖更早锁存的可重试错（如
 * checkpoint_connection_lost）；同级（都可重试或都不可重试）仍首个获胜——避免权限拒绝被当成
 * 可重试反复 requeue。pg 连接族无 code 的错
 * （Connection terminated/Query read timeout/pool connect timeout）折算为
 * `checkpoint_connection_lost`（cause 保原错）——下一次 claim 由 pg-pool 新建连接=重连。
 * 作用域外（直调 put/putWrites）语义零变：原样上抛。
 *
 * 透传=全接口显式枚举（getTuple/list 直通·put/putWrites 拦截件·deleteThread 直通·serde 经
 * super 构造委托·setup/end 有则绑内层无则零触）——沿 PrincipalBoundCheckpointPool「Pool 兼容
 * façade」同族先例形。住地 worker src：图包纯拓扑纪律（模型/checkpointer 经注入）零触。
 */
import {
  BaseCheckpointSaver,
  type Checkpoint,
  type CheckpointMetadata,
  type CheckpointTuple,
  type LangGraphRunnableConfig,
} from '@langchain/langgraph';
import { asPrincipal, assertInterviewGraphFence, errCode, type DbPool, type InterviewGraphFence } from '@meetwise/db';

/** 沿类面派生的窄类型别名（零新增传递依赖）。 */
type ListOptions = Parameters<BaseCheckpointSaver<number>['list']>[1];
type Writes = Parameters<BaseCheckpointSaver<number>['putWrites']>[1];
type NewVersions = Parameters<BaseCheckpointSaver<number>['put']>[3];
type PutResult = ReturnType<BaseCheckpointSaver<number>['put']>;

/** pg@8.22 / pg-pool@3.14 连接层失败的无 code 消息（逐字），折算为可重试码。 */
const PG_CONNECTION_LOSS_MESSAGES: ReadonlySet<string> = new Set([
  'Connection terminated',
  'Connection terminated unexpectedly',
  'Query read timeout',
  'timeout exceeded when trying to connect',
]);
export const CHECKPOINT_CONNECTION_LOST = 'checkpoint_connection_lost';

/**
 * 与 interview-consumer.TRANSIENT_INTERVIEW_JOB_ERROR_CODES 同集（08* 另计）。
 * 不从 consumer 引用，避免 checkpoint-fence ↔ interview-consumer 循环依赖；
 * 集合变更时两边必须一起改（worker-inflight-crash.proof L-sync 对拍）。
 */
const RETRYABLE_CHECKPOINT_LATCH_CODES: ReadonlySet<string> = new Set([
  'graph_fence_lost', '57014', '57P01', '57P02', '57P03', 'ECONNRESET', 'EPIPE', 'ETIMEDOUT',
  'model_circuit_open', 'model_circuit_half_open', 'model_concurrency_exhausted',
  'cost_budget_exhausted', 'model_admission_timeout', 'model_admission_failed',
  CHECKPOINT_CONNECTION_LOST,
]);

/** 与 isTransientInterviewJobError 同口径：无 code = 不可重试（fail-closed）。 */
export function isRetryableCheckpointLatchError(error: unknown): boolean {
  const code = errCode(error);
  if (!code) return false;
  return code.startsWith('08') || RETRYABLE_CHECKPOINT_LATCH_CODES.has(code);
}

/** 有字符串 code 的错原样返回；无 code 的 pg 连接族错折算为 checkpoint_connection_lost（cause 保原错）。 */
export function normalizeCheckpointWriteError(error: unknown): unknown {
  const e = error as { code?: unknown; message?: unknown } | null | undefined;
  if (e && typeof e.code === 'string' && e.code.length > 0) return error;
  if (e && typeof e.message === 'string' && PG_CONNECTION_LOSS_MESSAGES.has(e.message))
    return Object.assign(new Error(CHECKPOINT_CONNECTION_LOST, { cause: error }), { code: CHECKPOINT_CONNECTION_LOST });
  return error;
}

export class FenceCheckpointSaver extends BaseCheckpointSaver<number> {
  private readonly inner: BaseCheckpointSaver<number>;
  private readonly pool: DbPool;
  private readonly fence: InterviewGraphFence;
  /** runContained 嵌套深度（>0=写失败收容生效）。 */
  private containDepth = 0;
  /** 被收容的写失败（job 级锁存·一旦置位永不清；不可重试可覆盖已锁存的可重试）。 */
  private latched: { error: unknown } | undefined;
  private abortCurrent: AbortController | undefined;
  /** 内层真写调用计数（proof 断言锁存后零续写）。 */
  innerWriteAttempts = 0;

  constructor(inner: BaseCheckpointSaver<number>, pool: DbPool, fence: InterviewGraphFence) {
    super();
    // 构造期拒 fail-closed：fence/pool/inner 任一缺失即拒，绝不静默降级为透传。
    if (!inner) throw Object.assign(new Error('checkpoint_fence_inner_required'), { code: 'checkpoint_fence_inner_required' });
    if (!pool) throw Object.assign(new Error('checkpoint_fence_pool_required'), { code: 'checkpoint_fence_pool_required' });
    if (!fence || typeof fence !== 'object' || !fence.owner || !fence.interviewId || !fence.leaseOwner
      || !Number.isSafeInteger(fence.version))
      throw Object.assign(new Error('checkpoint_fence_required'), { code: 'checkpoint_fence_required' });
    // serde 委托：序列化协议面与内层 saver 恒等同源（图侧 dump/loads 同一口径）。
    this.serde = inner.serde;
    this.inner = inner;
    this.pool = pool;
    this.fence = fence;
  }

  /** 写前三谓词复核；查询异常原样上抛（不吞不改码），失守才折算 graph_fence_lost。 */
  private async assertWriteFence(): Promise<void> {
    const alive = await asPrincipal(this.pool, this.fence.owner, (c) => assertInterviewGraphFence(c, this.fence));
    if (!alive) throw Object.assign(new Error('graph_fence_lost'), { code: 'graph_fence_lost' });
  }

  private currentLatch(): { error: unknown } | undefined {
    return this.latched;
  }

  /** 已锁存的写失败（无则 undefined）。 */
  get writeFailure(): unknown {
    return this.latched?.error;
  }

  /**
   * 写失败收容作用域：run 收到本次 invoke 专用 AbortSignal（写失败即 abort，图尽早停）。
   * 结束时若已锁存写失败 → 抛锁存错（优先于 run 自身的 AbortError/成功返回）；否则原样返回/上抛。
   */
  async runContained<T>(run: (signal: AbortSignal) => Promise<T>): Promise<T> {
    if (this.latched) throw this.latched.error;
    const controller = new AbortController();
    const previous = this.abortCurrent;
    this.abortCurrent = controller;
    this.containDepth++;
    try {
      const out = await run(controller.signal);
      const after = this.currentLatch();   // run 期间写缝可能已锁存（方法读避开 TS 窄化）
      if (after) throw after.error;
      return out;
    } catch (error) {
      const after = this.currentLatch();
      if (after) throw after.error;
      throw error;
    } finally {
      this.containDepth--;
      this.abortCurrent = previous;
    }
  }

  /** 写缝统一入口：作用域内失败→锁存+abort+返回 fallback（resolve）；作用域外原样上抛。 */
  private async guardedWrite<T>(write: () => Promise<T>, fallback: T): Promise<T> {
    if (this.latched) {
      if (this.containDepth > 0) return fallback;   // 锁存后零续写（fail-closed）
      throw this.latched.error;
    }
    try {
      await this.assertWriteFence();
      this.innerWriteAttempts++;
      return await write();
    } catch (raw) {
      if (this.containDepth === 0) throw raw;
      const error = normalizeCheckpointWriteError(raw);
      // 不可重试 > 可重试：42501 等确定性终态覆盖更早锁存的 checkpoint_connection_lost，
      // 避免权限拒绝被当成可重试反复 requeue。同级仍首个获胜。
      // 经 currentLatch() 读：本方法开头 `if (this.latched) return/throw` 会把字段收窄成
      // undefined，但并发写可在检查之后才锁存，窄化不成立。
      const prev = this.currentLatch();
      const next = (!prev || (isRetryableCheckpointLatchError(prev.error) && !isRetryableCheckpointLatchError(error)))
        ? error
        : prev.error;
      this.latched = { error: next };
      try { this.abortCurrent?.abort(next); } catch { /* abort 监听器异常不得外溢 */ }
      return fallback;
    }
  }

  override async getTuple(config: LangGraphRunnableConfig): Promise<CheckpointTuple | undefined> {
    if (this.latched) throw this.latched.error;
    return this.inner.getTuple(config);
  }

  /** 实名 list（AsyncGenerator 直通·读缝零触：本红面是写覆盖，读缝拦截不闭合本面）。 */
  override async *list(config: LangGraphRunnableConfig, options?: ListOptions): AsyncGenerator<CheckpointTuple> {
    if (this.latched) throw this.latched.error;
    yield* this.inner.list(config, options);
  }

  override async put(config: LangGraphRunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata, newVersions: NewVersions): PutResult {
    // 收容 fallback=与 PostgresSaver/MemorySaver put 返回同形的 nextConfig（LangGraph loop 不消费该返回值）。
    const configurable = (config.configurable ?? {}) as Record<string, unknown>;
    const fallback = { configurable: { ['thread_id']: configurable['thread_id'], ['checkpoint_ns']: configurable['checkpoint_ns'] ?? '', ['checkpoint_id']: checkpoint.id } } as Awaited<PutResult>;
    return this.guardedWrite(() => {
      // 围栏通过后才盖当前图版本。调用方字段保留；只交给这一次新写入，不回写旧行。
      const stamped = Object.assign({}, metadata, { ['graph_version']: 'adaptive-interview/v1' }) as CheckpointMetadata;
      return this.inner.put(config, checkpoint, stamped, newVersions);
    }, fallback);
  }

  override async putWrites(config: LangGraphRunnableConfig, writes: Writes, taskId: string): Promise<void> {
    return this.guardedWrite(() => this.inner.putWrites(config, writes, taskId), undefined);
  }

  override async deleteThread(threadId: string): Promise<void> {
    return this.inner.deleteThread(threadId);
  }

  /** 有则绑内层、无则零触（MemorySaver 底座无 setup/end；PostgresSaver 内层经此透传）。 */
  async setup(): Promise<void> {
    const inner = this.inner as { setup?: () => Promise<void> };
    if (typeof inner.setup === 'function') await inner.setup.call(this.inner);
  }

  /** 同上（façade surface 同族先例：PrincipalBoundCheckpointPool.end 直通形）。 */
  async end(): Promise<void> {
    const inner = this.inner as { end?: () => Promise<void> };
    if (typeof inner.end === 'function') await inner.end.call(this.inner);
  }
}

/** adaptive-lifecycle 的 invoke 缝：FenceCheckpointSaver 走收容作用域；其余 saver（测试 MemorySaver 直注）零变。 */
export function invokeWithCheckpointContainment<T>(cp: unknown, run: (signal?: AbortSignal) => Promise<T>): Promise<T> {
  return cp instanceof FenceCheckpointSaver ? cp.runContained(run) : run(undefined);
}
