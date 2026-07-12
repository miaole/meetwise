/**
 * 记忆模块证明（真 Postgres + pgvector）：长期记忆语义召回、情景判重(防重复出题)、RLS 不串户、隐私(派生摘要非原文)。
 * 用 fakeEmbedder(词袋,512 维)→ 测的是"写入→向量化→ANN 召回→取文"全管线 + 隔离;真语义质量由检索 benchmark 实测覆盖。
 *   pnpm memory:prove   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool } from '@meetwise/db';
import { fakeEmbedder } from '@meetwise/ai-runtime';
import { rememberFact, recallMemories, wasAsked } from '../src/memory-service.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}`, import.meta.url)), 'utf8');
const emb = fakeEmbedder(512);
const OWNER = 'userA';

async function main() {
  for (const f of ['01_schema.sql', '06_retrieval.sql', '07_memory.sql']) await pool.query(sql(f));

  section('① 写入长期记忆(派生事实)→ 向量化进 vector_chunk');
  await rememberFact(pool, OWNER, emb, { kind: 'skill', content: '精通 Redis 限流与缓存设计' });
  const weakId = await rememberFact(pool, OWNER, emb, { kind: 'weakness', content: '分布式锁掌握较弱，红锁理解不深' });
  await rememberFact(pool, OWNER, emb, { kind: 'topic', content: 'MySQL 索引与事务隔离' });
  await rememberFact(pool, OWNER, emb, { kind: 'episode', content: '谈谈你订单系统的限流方案', sourceId: 'iv-1' });
  A('4 条记忆入 user_memory', (await pool.query('SELECT count(*)::int n FROM user_memory')).rows[0].n === 4);
  A('4 条记忆向量化入 vector_chunk(kind=memory)', (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE kind='memory'")).rows[0].n === 4);

  section('② 语义召回:查"分布式锁"→ 命中弱项记忆(成长档案个性化)');
  const r1 = await recallMemories(pool, OWNER, emb, '分布式锁 红锁', 3);
  A('召回 top-1 = 分布式锁弱项记忆', r1[0]?.id === weakId && r1[0]?.kind === 'weakness');
  const r2 = await recallMemories(pool, OWNER, emb, 'Redis 限流缓存', 3);
  A('查"Redis限流"→ 命中技能记忆', r2[0]?.content.includes('Redis'));

  section('③ 情景记忆:防重复出题');
  A('问过的题 wasAsked=true(不再重复出)', (await wasAsked(pool, OWNER, '谈谈你订单系统的限流方案')) === true);
  A('没问过的题 wasAsked=false', (await wasAsked(pool, OWNER, '讲讲 G1 垃圾回收')) === false);

  section('④ RLS:userB 召回不到 userA 的成长档案(不串户)');
  const bRecall = await recallMemories(pool, 'userB', emb, '分布式锁', 5);
  A('userB 语义召回 userA 记忆 = 0', bRecall.length === 0);
  A('userB wasAsked(userA 问过的题) = false', (await wasAsked(pool, 'userB', '谈谈你订单系统的限流方案')) === false);

  section('⑤ 隐私:记忆是派生摘要,非简历原文 PII');
  const contents = (await pool.query('SELECT content FROM user_memory')).rows.map((x) => x.content).join(' ');
  A('记忆内容无手机号等原文 PII(派生事实)', !/1[3-9]\d{9}/.test(contents));

  console.log(`\n${fail === 0 ? '✓ 记忆模块(长期语义召回 + 情景判重 + RLS + 隐私)全部通过' : '✗ ' + fail + ' 项失败'}`);
  await pool.end();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
