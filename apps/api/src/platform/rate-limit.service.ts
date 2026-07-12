import { Injectable } from '@nestjs/common';

/**
 * 令牌桶限流(per-key)。防暴力破解/滥用。**单实例内存**——多实例生产换 Redis 共享桶(seam:同 allow 接口)。
 * now 默认 Date.now;桶按时间补充令牌,超速即拒。
 */
@Injectable()
export class RateLimitService {
  private readonly buckets = new Map<string, { tokens: number; last: number }>();

  /** 取一令牌:有则放行扣一,无则拒(限流)。capacity=突发上限,refillPerSec=稳态速率。 */
  allow(key: string, capacity: number, refillPerSec: number, now: number = Date.now()): boolean {
    let b = this.buckets.get(key);
    if (!b) { b = { tokens: capacity, last: now }; this.buckets.set(key, b); }
    b.tokens = Math.min(capacity, b.tokens + ((now - b.last) / 1000) * refillPerSec);
    b.last = now;
    if (b.tokens >= 1) { b.tokens -= 1; return true; }
    return false;
  }

  // ── 并发槽(long-lived 连接 per-principal 上限,如 SSE)。区别于令牌桶:关注"同时占用数"而非"速率"。──
  private readonly slots = new Map<string, number>();
  /** 占一并发槽:当前占用 < max 则占一并返 true;否则返 false(拒)。**成功后必须 release**(放 finally/close)。 */
  acquireSlot(key: string, max: number): boolean {
    const n = this.slots.get(key) ?? 0;
    if (n >= max) return false;
    this.slots.set(key, n + 1);
    return true;
  }
  /** 释放一并发槽(幂等:降到 0 删除,不会为负)。 */
  releaseSlot(key: string): void {
    const n = this.slots.get(key) ?? 0;
    if (n <= 1) this.slots.delete(key); else this.slots.set(key, n - 1);
  }
}
