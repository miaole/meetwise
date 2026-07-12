/** 共享题库灌库证明:系统 owner 灌 → 任意用户公共读检索到(决策 i)+ hash 幂等。 pnpm qbank:prove (需 db:up) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, annSearch } from '@meetwise/db';
import { fakeEmbedder } from '@meetwise/ai-runtime';
import { ingestQbank, QBANK_OWNER } from '../src/qbank-ingest.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');
const emb = fakeEmbedder(512);

async function main() {
  for (const f of ['01_schema', '06_retrieval']) await pool.query(sql(f));
  const items = [
    { refId: 'q:limit', text: '请描述滑动窗口限流的实现原理' },
    { refId: 'q:cache', text: '缓存穿透/击穿/雪崩的区别与解决' },
    { refId: 'q:lock', text: '分布式锁如何保证可重入与防误删' },
  ];
  const n = await ingestQbank(pool, items, emb);
  A('系统 owner 灌 3 题', n === 3 && QBANK_OWNER.includes('system'));

  // 任意普通用户(非系统 owner)公共读检索到
  const [qvec] = await emb.embed(['滑动窗口限流']);
  const hits = await asPrincipal(pool, 'randomUserX', (c) => annSearch(c, 'randomUserX', 'qbank', qvec, 3));
  A('任意用户公共读共享题库(检索到 ≥1,跨 owner 共享)', hits.length >= 1 && hits.some((h) => h.refId.startsWith('q:')));

  // hash 幂等:重灌不增行
  await ingestQbank(pool, items, emb);
  const cnt = (await asPrincipal(pool, QBANK_OWNER, (c) => c.query("SELECT count(*)::int n FROM vector_chunk WHERE kind='qbank'"))).rows[0].n;
  A('重灌 hash 幂等(仍 3 行)', cnt === 3);

  console.log(`\n${fail === 0 ? '✓ 共享题库灌库(系统灌+公共读+幂等)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
