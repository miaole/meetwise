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
import { asPrincipal, assertInterviewGraphFence, type DbPool, type InterviewGraphFence } from '@meetwise/db';

/** 沿类面派生的窄类型别名（零新增传递依赖）。 */
type ListOptions = Parameters<BaseCheckpointSaver<number>['list']>[1];
type Writes = Parameters<BaseCheckpointSaver<number>['putWrites']>[1];
type NewVersions = Parameters<BaseCheckpointSaver<number>['put']>[3];
type PutResult = ReturnType<BaseCheckpointSaver<number>['put']>;

export class FenceCheckpointSaver extends BaseCheckpointSaver<number> {
  private readonly inner: BaseCheckpointSaver<number>;
  private readonly pool: DbPool;
  private readonly fence: InterviewGraphFence;

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

  override async getTuple(config: LangGraphRunnableConfig): Promise<CheckpointTuple | undefined> {
    return this.inner.getTuple(config);
  }

  /** 实名 list（AsyncGenerator 直通·读缝零触：本红面是写覆盖，读缝拦截不闭合本面）。 */
  override async *list(config: LangGraphRunnableConfig, options?: ListOptions): AsyncGenerator<CheckpointTuple> {
    yield* this.inner.list(config, options);
  }

  override async put(config: LangGraphRunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata, newVersions: NewVersions): PutResult {
    await this.assertWriteFence();
    return this.inner.put(config, checkpoint, metadata, newVersions);
  }

  override async putWrites(config: LangGraphRunnableConfig, writes: Writes, taskId: string): Promise<void> {
    await this.assertWriteFence();
    return this.inner.putWrites(config, writes, taskId);
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
