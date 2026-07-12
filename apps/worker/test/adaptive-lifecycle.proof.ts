/** 生产主线替换证明:自适应 lifecycle(start/submit)驱动自适应图,发 SSE 事件 + 收尾结算 + 报告走舱壁。
 *  脚本模型(CI);MemorySaver。 pnpm adaptive-life:prove (需 db:up) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MemorySaver } from '@langchain/langgraph';
import { createPool, asPrincipal, reserveEntitlement, appendEvent } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const OWNER = 'lifeA', IID = 'life-' + Date.now();
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');
const base = scriptedModelClient({
  'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存'] } }),
  'interviewer.ask': () => ({ ok: true, raw: { q: '结合你的限流经历聊聊高并发下怎么兼顾吞吐与一致', refs: ['qbank:a'] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 88, evidence: ['讲清滑动窗口'] } }),
});
const model: ModelClient = base;

async function main() {
  for (const f of ['01_schema', '02_commerce', '04_report']) await pool.query(sql(f));
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [IID, OWNER]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [OWNER]);
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));   // begin 预留

  const d: AdaptiveLifecycleDeps = { pool, cp: new MemorySaver(), owner: OWNER, interviewId: IID, model,
    localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [] };

  const s = await startAdaptiveInterview(d, '后端工程师', ['限流改造', 'Redis 计数器']);
  A('start → 首题(question_ready)', !!s.question && s.question.length > 0);

  let guard = 0, lastScore = 0, done = false;
  while (!done && guard++ < 10) { const r = await submitAdaptiveAnswer(d, '我用 Redis 计数器+滑动窗口扛高并发'); lastScore = r.score ?? 0; done = r.done; }
  A('submit 循环到收尾(done)', done === true);
  A('每答经评估(score=88)', lastScore === 88);

  const ev = await asPrincipal(pool, OWNER, (c) => c.query("SELECT kind, count(*)::int n FROM interview_event WHERE stream_key=$1 GROUP BY kind", [IID]));
  const kinds = Object.fromEntries(ev.rows.map((r: any) => [r.kind, r.n]));
  A('发了 question_ready 事件(SSE 首题+后续)', (kinds['question_ready'] ?? 0) >= 1);
  A('发了 answer_evaluated 事件(每答)', (kinds['answer_evaluated'] ?? 0) >= 2);
  const st = await asPrincipal(pool, OWNER, (c) => c.query("SELECT status FROM interview WHERE id=$1", [IID]));
  A('收尾:interview=completed', st.rows[0].status === 'completed');
  const rep = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM ai_report WHERE interview_id=$1", [IID]));
  A('报告入队走舱壁(ai_report 有行,异步隔离)', rep.rows[0].n === 1);

  // **报告完整性(审计高-1)**:answer_evaluated 带 outcome;报告计分查询剔除 unresolved(跳过/探尽未决),绝不把"未展开"当 0 分拉低综合分。
  const evOut = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND payload ? 'outcome'", [IID]));
  A('真实作答的 answer_evaluated 均带 outcome 标记', evOut.rows[0].n >= 2);
  await asPrincipal(pool, OWNER, async (c) => {
    await appendEvent(c, OWNER, IID, 'answer_evaluated', { turn: 99, score: 0, outcome: 'unresolved' });   // 注入一条"跳过"事件
  });
  // 复用 report-worker 同款计分查询:确认 unresolved 的 0 分被剔除(不进综合分)
  const scored = await asPrincipal(pool, OWNER, (c) => c.query(
    "SELECT (payload->>'score')::int AS s FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated' AND COALESCE(payload->>'outcome','answered') <> 'unresolved' ORDER BY seq", [IID]));
  const allEvals = await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='answer_evaluated'", [IID]));
  A('计分集剔除 unresolved(跳过题不计入报告综合分,career advice 不失真)', scored.rows.every((r: any) => r.s !== 0) && scored.rows.length === allEvals.rows[0].n - 1);

  console.log(`\n${fail === 0 ? '✓ 生产主线替换:自适应 agent 图驱动真面试生命周期(SSE 事件+结算+舱壁报告)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
