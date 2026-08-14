/**
 * Real managed Redis/Tair contract. It never starts a local container and it
 * never scans/flushes shared keyspace: every key uses one fresh opaque digest
 * and expires naturally. Run only against a dedicated non-production endpoint:
 *
 *   RAG_REDIS_TEST_URL=rediss://... pnpm -C apps/worker prove:rag-redis-cache
 */
import { createHash } from 'node:crypto';
import { RedisQbankRetrievalCache, resolveRagRedisCacheConfig } from '../src/rag-redis-cache.ts';
import type { QbankRetrievalCacheAddress } from '@meetwise/db';

const testUrl = process.env.RAG_REDIS_TEST_URL;
if (!testUrl) throw new Error('rag_redis_test_url_missing');

const cfg = resolveRagRedisCacheConfig({
  ...process.env,
  RAG_REDIS_URL: testUrl,
  RAG_REDIS_TOPOLOGY: process.env.RAG_REDIS_TEST_TOPOLOGY ?? 'standalone',
});
const cache = await RedisQbankRetrievalCache.connect(cfg);
const digest = createHash('sha256').update(`rag-redis-int:${Date.now()}:${process.pid}`).digest('hex');
const address: QbankRetrievalCacheAddress = { cacheKey: digest, corpusEpoch: '1' };
const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
let failed = 0;
const check = (name: string, condition: boolean) => { console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`); if (!condition) failed++; };

try {
  const contenders = await Promise.all(Array.from({ length: 32 }, () => cache.acquire(address, 1_000)));
  const owner = contenders.filter((x): x is NonNullable<typeof x> => x !== undefined);
  check('真实 Redis/Tair：32 个并发同键 acquire 恰有 1 个 winner', owner.length === 1);
  if (owner[0]) {
    const saved = await cache.publish(address, owner[0], [{ refId: 'qbank:proof:ref', distance: 0.125 }], 3_000);
    const read = await cache.read(address, 5);
    check('真实 Redis/Tair：fenced publish 后 value 可读且锁已删除', saved && read?.length === 1 && read[0]?.refId === 'qbank:proof:ref');
  }

  const staleAddress: QbankRetrievalCacheAddress = { cacheKey: createHash('sha256').update(`${digest}:stale`).digest('hex'), corpusEpoch: '1' };
  const first = await cache.acquire(staleAddress, 100);
  await sleep(160);
  const second = await cache.acquire(staleAddress, 1_000);
  const secondWrite = second ? await cache.publish(staleAddress, second, [{ refId: 'qbank:proof:new', distance: 0.25 }], 3_000) : false;
  const staleWrite = first ? await cache.publish(staleAddress, first, [{ refId: 'qbank:proof:old', distance: 0.5 }], 3_000) : true;
  const final = await cache.read(staleAddress, 5);
  check('真实 Redis/Tair：过期旧 owner 不能覆盖新 owner（Lua fencing）', !!first && !!second && secondWrite && !staleWrite && final?.[0]?.refId === 'qbank:proof:new');
} finally {
  await cache.close().catch(() => undefined);
}

if (failed) process.exit(1);
console.log('✓ Redis/Tair 热缓存实际契约通过；仍须执行 PG+账本+故障注入全链路矩阵。');
