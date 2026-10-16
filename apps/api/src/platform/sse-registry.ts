/**
 * HA-2 · 进程级 SSE 连接注册表（REQUEST §3 C1）。
 *
 * 今天 SIGTERM = api 暴毙：三控制器(interview/quiz/diagnosis)劫持出的 SSE 连接
 * 无从枚举、无从排空(Fastify close 不跟踪 hijack 连接)、`SseNotifyLifecycle` 永不
 * 触发。本模块给进程一条「在册 SSE 连接」的单源清单，泵(sse-pump.ts)入口注册/
 * 收尾注销，停机链(main.ts)一键停取。
 *
 * **R1 口径(rev2 落卷·EXEC 必须依此)**：`drainAll()` 只**同步置旗、绝不直接 end()**
 * ——registry 条目持旗(泵注册置旗句柄)，泵的 `safeWrite` 与 while 条件同读同旗、
 * 写侧即刻失效；`reply.raw.end()` 保持泵内单点(sse-pump.ts 收尾路径)，仅由泵自身
 * 在**帧边界**(两次 write 之间)触发。否则 degraded 态(取数失败 break/断开竞态窗)
 * drain 侧先 end 而泵续 write ⇒ ERR_STREAM_WRITE_AFTER_END(socket 未捕获 error 即
 * 进程非零退)。
 *
 * 纯模块、零 IO：注册表与泵解耦可单测(proof 注入独立实例，沿 SsePumpOptions.notify?
 * 既有注入形制)。同时承载 API 进程级停机排水旗(isDraining/beginDrain)——onRequest
 * 503 门(main.ts)与 /readyz/api·/health 翻脸(health.controller.ts)同读此旗，进程内
 * 单源不分裂。
 */

/** 泵侧注册句柄：requestDrain 由泵实现——置位后泵写循环同读此旗(停取)并在帧间 end。 */
export interface SseRegistryEntry {
  requestDrain(): void;
}

export interface SseRegistry {
  /** 泵入口登记(hijack 后)；注销用 unregister(幂等)。 */
  register(streamKey: string, entry: SseRegistryEntry): void;
  /** 泵收尾注销——断开/终态/取数失败/deadline/drain 全退出路径共用泵内单注销点。 */
  unregister(streamKey: string, entry: SseRegistryEntry): void;
  /**
   * 停机排水：对全部在册条目**同步置旗**(R1：禁 end)。
   * 返回排水时在册条数(记账+prove 断言)。幂等：重复调用安全(置旗本身幂等，
   * end 只由泵单点触发一次)。
   */
  drainAll(): number;
  /** 在册连接数(ops 断言「排空后在册=0」，SseNotifyService.waitingCount 同款形制)。 */
  count(): number;
  /** 停机排水旗：onRequest 503 门与 readiness 翻脸同读。 */
  isDraining(): boolean;
  /** 停机置旗(仅 SIGTERM/SIGINT handler 调用·幂等)。 */
  beginDrain(): void;
}

export function createSseRegistry(): SseRegistry {
  // entry 以对象身份为键(identity Map)：同一泵同一条目重复注册天然去重，
  // 注销按同一引用删除，streamKey 仅作记账/排障。
  const entries = new Map<SseRegistryEntry, string>();
  let draining = false;
  return {
    register(streamKey, entry) {
      entries.set(entry, streamKey);
    },
    unregister(streamKey, entry) {
      // streamKey 只记账不参与匹配：泵收尾传同一引用即删(防 streamKey 拼写漂移误留泄漏)。
      void streamKey;
      entries.delete(entry);
    },
    drainAll() {
      draining = true;
      for (const entry of entries.keys()) entry.requestDrain();
      return entries.size;
    },
    count() {
      return entries.size;
    },
    isDraining() {
      return draining;
    },
    beginDrain() {
      draining = true;
    },
  };
}

/** 进程级单例：泵默认注册表 = onRequest 门 = readiness 翻脸，同读一份。 */
let singleton: SseRegistry | undefined;
export function getSseRegistry(): SseRegistry {
  singleton ??= createSseRegistry();
  return singleton;
}
