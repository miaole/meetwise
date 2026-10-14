import { Injectable, Optional } from '@nestjs/common';
import { DbService } from './db.service';

/**
 * 令牌桶限流(per-key)+并发槽 lease。防暴力破解/滥用/并发炸弹。
 *
 * **共享化分级(#37/#17)**：全局桶与 IP 桶(`*:global` / `*:ip:*`——跨实例放大主面)落 PG 共享桶表
 * `platform_rl_bucket` 单行原子 UPSERT(双实例合计消费=单实例,×2 稀释归零);per-principal/per-email 桶
 * (攻击域天然单主体)维持进程内 + LRU 容量上限(#129)。并发槽(SSE 三控制器 `sse:${principal}` cap=5 与
 * `resume-parse:global`)落 PG 槽 lease 表 `platform_slot_lease`:acquire=单语句 INSERT … ON CONFLICT
 * (slot_key) DO UPDATE … WHERE n<max OR expired(原子占,过期接管 n 归 1),release 对称减零减穿。
 * now 默认 Date.now;桶按时间补充令牌,超速即拒;桶参数全部由调用点传入(值零改)。
 *
 * **降级形(可用性优先·降级可观测)**:PG 往返失败/不可达时——桶退回进程内本地桶、槽 fail-open 放行
 * (槽位是资源保护非安全边界;429 语义在共享层可用时保持精确),每次转变打一行结构化日志
 * (`RL_SHARED_DEGRADED`/`RL_SHARED_RECOVERED`,沿 SSE_NOTIFY_DEGRADED 形制);降级期每秒至多试探一次
 * PG(防连接超时放大)。桶表行数经惰性 TTL 清理有界(7 天未动=确定已补满,删除等价淘汰满额桶)。
 * 槽 lease:占用行 12min 到期后被下一次 acquire 原子接管(SSE 连接 10min 封顶+缓冲;进程崩溃残留回收,
 * 零新增周期任务)。LLM 外呼禁令不涉本文件;UPSERT 频度=入口频度,复用既有 api 池零新增连接。
 */
@Injectable()
export class RateLimitService {
  // 测试缝(sse-principal-slot 等自建实例):无 DbService → 纯进程内模式,零 PG 往返;生产 DI 注入 → 共享模式。
  constructor(@Optional() private readonly db?: DbService) {}

  /** 进程内桶容量上限(#129·LRU 淘汰;沿 RL_* env 形制,量级 10^4)。 */
  private readonly memCapacity: number = (() => {
    const n = Number(process.env.RL_MEM_CAPACITY ?? 10_000);
    return Number.isFinite(n) && n > 0 ? n : 10_000;
  })();
  private readonly buckets = new Map<string, { tokens: number; last: number }>();

  // ── 共享层健康(桶+槽同库同池;一次转变一行日志,降级期每秒至多试探一次)──
  private sharedHealthy = true;
  private lastSharedProbeMs = 0;
  private sharedOpsSinceCleanup = 0;
  /** 槽 lease 时长:SSE 连接 10min 封顶(sse-pump deadline)+2min 缓冲;崩溃残留占用到期即被接管。 */
  private static readonly slotLeaseMs = 12 * 60_000;
  /** 共享桶惰性清理采样间隔与 TTL(7 天未动=按最小 refill 也早已补满,删除≡淘汰满额桶)。 */
  private static readonly cleanupEveryOps = 128;
  private static readonly bucketTtlMs = 7 * 24 * 3600_000;

  private markSharedDegraded(fallback: string): void {
    if (this.sharedHealthy) {
      this.sharedHealthy = false;
      console.warn(`RL_SHARED_DEGRADED reason=pg_error fallback=${fallback}`);
    }
  }

  private markSharedRecovered(): void {
    if (!this.sharedHealthy) {
      this.sharedHealthy = true;
      console.warn('RL_SHARED_RECOVERED fallback=none');
    }
  }

  /** 降级期试探节流:健康态每试;降级态每秒至多一次(防连接超时放大入口延迟)。 */
  private shouldProbeShared(now: number): boolean {
    if (this.sharedHealthy) return true;
    if (now - this.lastSharedProbeMs < 1000) return false;
    this.lastSharedProbeMs = now;
    return true;
  }

  /** 全局/IP 桶=跨实例放大主面 → 共享;其余(per-principal/per-email)进程内。调用点 key/capacity 零改。 */
  private static isSharedBucketKey(key: string): boolean {
    return key.endsWith(':global') || key.includes(':ip:');
  }

  /** 采样惰性清理共享桶表(到期行=确定已补满的空闲桶);失败静默(下个采样窗再试)。 */
  private async maybeCleanupBuckets(now: number): Promise<void> {
    this.sharedOpsSinceCleanup += 1;
    if (this.sharedOpsSinceCleanup < RateLimitService.cleanupEveryOps) return;
    this.sharedOpsSinceCleanup = 0;
    try {
      await this.db!.pool.query('DELETE FROM platform_rl_bucket WHERE last_ms < $1', [now - RateLimitService.bucketTtlMs]);
    } catch { /* 清理是尽力而为;主判定不受影响 */ }
  }

  // ── 进程内桶 LRU(#129):容量上限,打满淘汰最旧;访问即重排(真 LRU)。新 key 正常建满额桶。──
  private lruGet(key: string): { tokens: number; last: number } | undefined {
    const b = this.buckets.get(key);
    if (b) { this.buckets.delete(key); this.buckets.set(key, b); }
    return b;
  }

  private lruCreate(key: string, capacity: number, now: number): { tokens: number; last: number } {
    if (!this.buckets.has(key) && this.buckets.size >= this.memCapacity) {
      const oldest = this.buckets.keys().next().value;
      if (oldest !== undefined) this.buckets.delete(oldest);
    }
    const b = { tokens: capacity, last: now };
    this.buckets.set(key, b);
    return b;
  }

  /** 取一令牌:有则放行扣一,无则拒(限流)。capacity=突发上限,refillPerSec=稳态速率。 */
  async allow(key: string, capacity: number, refillPerSec: number, now: number = Date.now()): Promise<boolean> {
    if (this.db && RateLimitService.isSharedBucketKey(key) && this.shouldProbeShared(now)) {
      try {
        // 单行原子 UPSERT=令牌桶全式(补充折算与进程内同式;now 单调前进前提与进程内一致)。
        // 拒绝分支(WHERE 不满足)不写行——补充折算每调用从 last_ms 重算,幂等等价,无语义差。
        const r = await this.db.pool.query(
          `WITH up AS (
             INSERT INTO platform_rl_bucket AS b (bucket_key, tokens, last_ms)
             VALUES ($1, $2::float8 - 1, $3::float8)
             ON CONFLICT (bucket_key) DO UPDATE SET
               tokens = LEAST($2::float8, b.tokens + (($3::float8 - b.last_ms) / 1000.0) * $4::float8) - 1,
               last_ms = $3::float8
             WHERE LEAST($2::float8, b.tokens + (($3::float8 - b.last_ms) / 1000.0) * $4::float8) >= 1
             RETURNING 1 AS ok
           )
           SELECT true AS ok FROM up
           UNION ALL
           SELECT false WHERE NOT EXISTS (SELECT 1 FROM up)`,
          [key, capacity, now, refillPerSec],
        );
        this.markSharedRecovered();
        void this.maybeCleanupBuckets(now);
        return r.rows[0]?.ok === true;
      } catch {
        this.markSharedDegraded('local_bucket');
      }
    }
    const b = this.lruGet(key) ?? this.lruCreate(key, capacity, now);
    b.tokens = Math.min(capacity, b.tokens + ((now - b.last) / 1000) * refillPerSec);
    b.last = now;
    if (b.tokens >= 1) { b.tokens -= 1; return true; }
    return false;
  }

  /**
   * 非消费探针:桶当前(含惰性补充折算)是否仍够一次尝试(AUTHZ-HARDEN 5A-1 #120 失败锁入口用——
   * 探查不扣额,扣减只在真失败时经 allow 发生)。参数与 allow 同形;桶不存在=满额=true。
   */
  async hasToken(key: string, capacity: number, refillPerSec: number, now: number = Date.now()): Promise<boolean> {
    if (this.db && RateLimitService.isSharedBucketKey(key) && this.shouldProbeShared(now)) {
      try {
        const r = await this.db.pool.query(
          `WITH up AS (
             INSERT INTO platform_rl_bucket AS b (bucket_key, tokens, last_ms)
             VALUES ($1, $2::float8, $3::float8)
             ON CONFLICT (bucket_key) DO UPDATE SET
               tokens = LEAST($2::float8, b.tokens + (($3::float8 - b.last_ms) / 1000.0) * $4::float8),
               last_ms = $3::float8
             WHERE LEAST($2::float8, b.tokens + (($3::float8 - b.last_ms) / 1000.0) * $4::float8) >= 1
             RETURNING 1 AS ok
           )
           SELECT true AS ok FROM up
           UNION ALL
           SELECT false WHERE NOT EXISTS (SELECT 1 FROM up)`,
          [key, capacity, now, refillPerSec],
        );
        this.markSharedRecovered();
        void this.maybeCleanupBuckets(now);
        return r.rows[0]?.ok === true;
      } catch {
        this.markSharedDegraded('local_bucket');
      }
    }
    const b = this.lruGet(key);
    if (!b) return true;
    return Math.min(capacity, b.tokens + ((now - b.last) / 1000) * refillPerSec) >= 1;
  }

  // ── 并发槽(long-lived 连接 per-principal 上限,如 SSE)。区别于令牌桶:关注"同时占用数"而非"速率"。──
  // 共享模式=PG 槽 lease(跨实例精确);纯进程内模式(无 DbService)=本地 Map(sse-principal-slot proof 同)。
  private readonly slots = new Map<string, number>();

  /**
   * 占一并发槽:当前占用 < max 则占一并返 true;否则返 false(拒,调用点 429 语义零改)。**成功后必须
   * release**(放 finally/close)。单语句原子占:并发首占不撞 unique violation;过期占用被本次原子接管
   * (n 归 1,SSE 10min 封顶+缓冲)。PG 不可达 → fail-open 放行+降级日志(资源保护非安全边界)。
   */
  async acquireSlot(key: string, max: number): Promise<boolean> {
    const now = Date.now();
    if (this.db && this.shouldProbeShared(now)) {
      try {
        // 过期接管分支:held_until_ms < now → n 归 1(崩溃残留回收);否则 n+1。WHERE n<max OR expired:
        // 满额且未过期 → 不更新、零行 → false(429)。
        // $3=新 lease 终点(now+TTL,成功即刷新);$4=当前时刻——过期判定恒对 now,不得对刷新后的
        // lease 终点(否则每次 acquire 都把「未过期」判定自刷新成真,容量形同虚设)。
        const r = await this.db.pool.query(
          `WITH up AS (
             INSERT INTO platform_slot_lease AS s (slot_key, n, held_until_ms)
             VALUES ($1, 1, $3::float8)
             ON CONFLICT (slot_key) DO UPDATE SET
               n = CASE WHEN s.held_until_ms < $4::float8 THEN 1 ELSE s.n + 1 END,
               held_until_ms = $3::float8
             WHERE s.n < $2::int OR s.held_until_ms < $4::float8
             RETURNING 1 AS ok
           )
           SELECT true AS ok FROM up
           UNION ALL
           SELECT false WHERE NOT EXISTS (SELECT 1 FROM up)`,
          [key, max, now + RateLimitService.slotLeaseMs, now],
        );
        this.markSharedRecovered();
        return r.rows[0]?.ok === true;
      } catch {
        this.markSharedDegraded('fail_open');
        return true;   // 槽位 fail-open:资源保护面降级保可用;恢复后计数从共享行现状续算
      }
    }
    const n = this.slots.get(key) ?? 0;
    if (n >= max) return false;
    this.slots.set(key, n + 1);
    return true;
  }

  /** 释放一并发槽(幂等:降到 0 删行,不会为负;PG 面 fail-open 对称——释放失败只记日志不抛,finally 安全)。 */
  async releaseSlot(key: string): Promise<void> {
    const now = Date.now();
    if (this.db && this.shouldProbeShared(now)) {
      try {
        const dec = await this.db.pool.query(
          'UPDATE platform_slot_lease SET n = n - 1 WHERE slot_key=$1 AND n > 1', [key]);
        if ((dec.rowCount ?? 0) === 0) {
          await this.db.pool.query('DELETE FROM platform_slot_lease WHERE slot_key=$1 AND n <= 1', [key]);
        }
        this.markSharedRecovered();
        return;
      } catch {
        this.markSharedDegraded('fail_open');
        return;
      }
    }
    const n = this.slots.get(key) ?? 0;
    if (n <= 1) this.slots.delete(key); else this.slots.set(key, n - 1);
  }
}
