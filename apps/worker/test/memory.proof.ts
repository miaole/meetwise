/**
 * 记忆模块证明（真 Postgres）· **lean MVP(专家审计砍瘦定稿)**:只证两件确定性、零非确定性的事——
 *   ① 跨会话精确判重(episode):recordAskedQuestions 写 → wasAsked 归一化 exact match 命中(防重复出题)。
 *   ② 历史弱项只读投影:pastWeakDimensions 从 assessment_report(status=ready 且 gap=true)读维度名(给能力选择软偏置)。
 *  外加 RLS 不串户 + 隐私(episode 只存我方归一化题面,非答案/PII)。
 *  **不测语义召回/embedding**——lean MVP 不含它(审计判为过度工程 + 毁引擎确定性);真检索质量由 retrieval benchmark 覆盖。
 *   pnpm memory:prove       （根脚本会起临时 pgvector cluster；绝不重建共享开发库）
 *   pnpm memory:prove:raw   （仅供已确认隔离的 cluster 调用）
 */
import { assertIsolatedTestTarget, createPool, asPrincipal, normalizeQuestion } from '@meetwise/db';
import { wasAsked, recordAskedQuestions, pastWeakDimensions } from '../src/memory-service.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const A_OWNER = 'userA', B_OWNER = 'userB';

async function main() {
  // `packages/db/sql/` 是旧兼容样本；这里必须验证当前 migration（迁移）
  // 前缀下的 RLS（行级安全）和 memory（记忆）表，而不是在测试中重建过时结构。
  await assertIsolatedTestTarget(pool);

  section('① 跨会话精确判重:recordAskedQuestions 写 episode → wasAsked 命中(归一化 exact,零语义)');
  // 同批含重复题面(仅大小写/空白差异)→ 归一化后应去重为 2 条,绝不写答案/PII。
  await recordAskedQuestions(pool, A_OWNER, ['谈谈你订单系统的限流方案', '  谈谈你订单系统的限流方案  ', '讲讲 Redis 持久化'], 'iv-1');
  A('同批归一化去重:恰 2 条 episode(重复题面合一)', Number((await asPrincipal(pool, A_OWNER, (c) => c.query("SELECT count(*)::int n FROM user_memory WHERE kind='episode'"))).rows[0].n) === 2);
  A('问过的题 wasAsked=true', (await wasAsked(pool, A_OWNER, '谈谈你订单系统的限流方案')) === true);
  A('空白/大小写变体仍判 true(归一化 exact,非语义相似)', (await wasAsked(pool, A_OWNER, '  谈谈你订单系统的限流方案  ')) === true);
  A('语义相近但不同题 wasAsked=false(不做语义误挡)', (await wasAsked(pool, A_OWNER, '订单系统怎么做限流')) === false);
  A('完全没问过的题 wasAsked=false', (await wasAsked(pool, A_OWNER, '讲讲 G1 垃圾回收')) === false);

  section('② 历史弱项只读投影:从 assessment_report(ready 且 gap=true)读维度名');
  // 当前投影 trigger（触发器）要求关联面试仍处于隐私活动态；完整迁移下不能再用
  // 旧 shadow schema（影子数据库结构）凭空插 report（报告）。
  await asPrincipal(pool, A_OWNER, async (c) => {
    await c.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('iv-1',$1,'created'),('iv-2',$1,'created')", [A_OWNER]);
  });
  await asPrincipal(pool, A_OWNER, (c) => c.query(
    `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions) VALUES ($1,$2,$3,'ready',$4)`,
    ['ar-1', A_OWNER, 'iv-1', JSON.stringify([
      { dimension: '分布式锁', score: 35, gap: true },
      { dimension: '高并发', score: 82, gap: false },
      { dimension: '消息队列', score: 40, gap: true },
    ])]));
  const weak = await pastWeakDimensions(pool, A_OWNER);
  A('只取 gap=true 的维度名(分布式锁+消息队列,不含达标的高并发)', weak.includes('分布式锁') && weak.includes('消息队列') && !weak.includes('高并发'));
  // pending 报告不投影(只信已生成的 ready,防未定稿弱项污染)
  await asPrincipal(pool, A_OWNER, (c) => c.query(
    `INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions) VALUES ($1,$2,$3,'pending',$4)`,
    ['ar-2', A_OWNER, 'iv-2', JSON.stringify([{ dimension: '缓存设计', score: 20, gap: true }])]));
  A('pending 报告的弱项不投影(只信 status=ready)', !(await pastWeakDimensions(pool, A_OWNER)).includes('缓存设计'));

  section('③ RLS 不串户:userB 读不到 userA 的 episode / 弱项');
  A('userB wasAsked(userA 问过的题) = false', (await wasAsked(pool, B_OWNER, '谈谈你订单系统的限流方案')) === false);
  A('userB pastWeakDimensions = 空(读不到 userA 报告)', (await pastWeakDimensions(pool, B_OWNER)).length === 0);

  section('④ 隐私:episode 只存我方归一化题面,绝无答案/PII');
  const contents = (await asPrincipal(pool, A_OWNER, (c) => c.query("SELECT content FROM user_memory WHERE kind='episode'"))).rows.map((x) => x.content).join(' ');
  A('episode 内容无手机号等原文 PII', !/1[3-9]\d{9}/.test(contents));
  A('episode 存的是归一化题面(小写去多余空白)', contents.includes(normalizeQuestion('谈谈你订单系统的限流方案')));

  console.log(`\n${fail === 0 ? '✓ 记忆 lean MVP(跨会话精确判重 + 弱项只读投影 + RLS + 隐私)全部通过' : '✗ ' + fail + ' 项失败'}`);
  await pool.end();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
