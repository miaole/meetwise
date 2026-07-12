/** 消费者→自适应路径证明:api 入队 start/answer → 消费者(adaptive 模式)跑自适应图 → SSE 事件 + 收尾 + 舱壁报告。
 *  注入 fake 检索(生产注 annSearch);脚本模型。 pnpm adaptive-consumer:prove (需 db:up) */
process.env.RESUME_ENC_KEY = 'test-resume-enc-key';
process.env.RESUME_HASH_SECRET = 'test-resume-hash-secret';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MemorySaver } from '@langchain/langgraph';
import { createPool, asPrincipal, reserveEntitlement, createResumeWithBlob, enqueueInterviewJob, availableUnits, getReport } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, type ConsumerDeps } from '../src/interview-consumer.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'consA', IID = 'cons-' + Date.now();
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');
const model: ModelClient = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存'] } }),
  'interviewer.ask': () => ({ ok: true, raw: { q: '结合你的限流经历聊聊高并发下怎么兼顾吞吐与一致', refs: ['qbank:a'] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 88, evidence: ['讲清滑动窗口'] } }),
});

async function main() {
  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report', '05_interview_jobs']) await pool.query(sql(f));
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [IID, OWNER]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [OWNER]);
  const up = await asPrincipal(pool, OWNER, (c) => createResumeWithBlob(c, OWNER, '工作经历\n负责限流改造,用 Redis 计数器和滑动窗口扛高并发\n技能 Redis、限流、分布式锁'));
  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));   // reserve 前(预留即扣 available)
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));

  const d: ConsumerDeps = { pool, cp: new MemorySaver() as any, model, leaseOwner: 'w1',
    adaptive: { localRetrieve: async (_o: string, _q: string) => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [], role: '后端工程师' } };

  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'start', { resumeId: up.resumeId }));
  A('消费 start job → 自适应路径(返回 start)', (await drainInterviewJobOnce(d, OWNER)) === 'start');
  let qr = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='question_ready'", [IID]));
  A('start 后发首题 question_ready(经队列→消费者→自适应图)', qr.rows[0].n >= 1);

  let done = false, guard = 0;
  while (!done && guard++ < 8) {
    await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', { answer: '我用计数器+滑动窗口扛高并发并降级' }, guard));
    await drainInterviewJobOnce(d, OWNER);
    const st = await asPrincipal(pool, OWNER, (c) => c.query("SELECT status FROM interview WHERE id=$1", [IID]));
    done = st.rows[0].status === 'completed';
  }
  const ev = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated'", [IID]));
  A('每答经评估发 answer_evaluated(≥2)', ev.rows[0].n >= 2);
  A('收尾 interview=completed(动态决策判定 all_resolved)', done === true);
  A('额度结算(扣 1.0)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1.0);
  A('报告入队走舱壁(queued)', (await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID)))!.status === 'queued');
  A('所有 job done(无卡)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_job WHERE owner_user_id=$1 AND status!='done'", [OWNER]))).rows[0].n === 0);
  // 终态事件 + **失败退款(兜底,修真 bug:额度泄漏)**:start job 失败 → 发 interview_unavailable + **释放预留额度**,
  // 否则用户为失败的面试白扣额度永久损失(availableUnits 扣 reserved,无 sweeper 回收)。
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('FAILIV',$1,'active')", [OWNER]);
  const balBeforeFail = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, 'FAILIV', 'mock_interview', 1.0));   // 模拟 begin 预留
  A('[状态机] 预留后 available 扣 1.0', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === balBeforeFail - 1.0);
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, 'FAILIV', 'start', { resumeId: 'does-not-exist' }));
  const fr = await drainInterviewJobOnce(d, OWNER);
  A('失败 job → 标 failed(终态,不重试)', fr === 'failed');
  const tev = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='FAILIV' AND kind='interview_unavailable'", []));
  A('发了 interview_unavailable 终态事件(无静默死胡同,对称 report_unavailable)', tev.rows[0].n === 1);
  A('[兜底] 失败退款:预留额度已释放(balance 恢复,不泄漏白扣)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === balBeforeFail);
  // 防双提交(并发一致性):同面试同题(seq)重复入队 → 幂等(同 job、一行),否则第二个 worker resume 会把答案错位应用到下一题
  const j1 = await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, 'DUP', 'answer', { turn: 0, answer: 'a' }, 1));
  const j2 = await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, 'DUP', 'answer', { turn: 0, answer: 'a-重试' }, 1));
  A('双提交同题 → 幂等(返同一 job id,不重复入队)', j1 === j2);
  const dupN = (await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_job WHERE interview_id='DUP' AND kind='answer' AND seq=1"))).rows[0].n;
  A('库里只一个 answer job(防 worker 二次 resume 错位应用到下一题)', dupN === 1);

  console.log(`\n${fail === 0 ? '✓ 消费者→自适应:生产主线(队列→消费者→自适应agent图→SSE→结算→舱壁报告)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
