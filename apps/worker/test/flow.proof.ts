/**
 * 端到端 agent 主干证明（对真 Postgres）：测的是**生产生命周期服务 interview-lifecycle**(startInterview/submitAnswer)——非内联 demo。
 *   简历加密摄取 → 额度 reserve → startInterview(押题 invoke+factuality, 建图首问) → submitAnswer×N(resume+eval invoke, 末轮确认额度+入队报告)
 *   → 报告舱壁 drain(invoke) → report_ready。模型注入确定性脚本(CI);生产注入 defaultModelClient 真模型。
 *   pnpm flow:prove   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createPool, asPrincipal, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, getReport,
} from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { ingestResume } from '@meetwise/domain';
import { createCheckpointer } from '../src/main.ts';
import { drainReportsOnce } from '../src/report-worker.ts';
import { reportGenerator } from '../src/interview-service.ts';
import { startInterview, submitAnswer } from '../src/interview-lifecycle.ts';   // **生产生命周期服务**

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const OWNER = 'userA', IID = 'flow-' + Date.now();
const RESUME = ['工作经历', '参与订单系统限流改造,用 Redis 计数器扛高并发', '技能', 'Redis、限流、分布式锁', '联系方式', '手机 13800138000'].join('\n');

let modelCalls = 0;
const baseModel = scriptedModelClient({
  'resume-quiz.generate': () => ({ ok: true, raw: { items: [
    { q: '订单系统限流怎么做的?', refs: ['限流'] }, { q: 'Redis 计数器原子性如何保证?', refs: ['Redis'] },
    { q: '聊聊你 3 年 Go 工程经验', refs: ['Go'] },   // 幻觉 → factuality 拒
  ] } }),
  'mock-interview.evaluate': () => ({ ok: true, raw: { score: 76, evidence: ['Redis 计数器'] } }),
  'report.generate': () => ({ ok: true, raw: { overall: 76, sections: [{ title: '总评', body: '限流主题扎实' }] } }),
});
const model: ModelClient = { complete: (req, attempt) => { modelCalls++; return baseModel.complete(req, attempt); } };

async function main() {
  for (const f of ['01_schema', '02_commerce', '03_resume', '04_report','14_notification']) await pool.query(sql(`../../../packages/db/sql/${f}.sql`));
  await pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ('${IID}','${OWNER}','created')`);
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('${OWNER}','paid',5.0, now()+interval '300 days')`);
  const cp = createCheckpointer(); await cp.setup();

  section('① 简历加密摄取 + ② 额度 reserve');
  const up = await asPrincipal(pool, OWNER, (c) => createResumeWithBlob(c, OWNER, RESUME));
  await asPrincipal(pool, OWNER, (c) => transitionResume(c, OWNER, up.resumeId, 'uploaded', 'ingesting'));
  await asPrincipal(pool, OWNER, (c) => completeIngestion(c, OWNER, up.resumeId, ingestResume(RESUME)));
  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, IID, 'mock_interview', 1.0));
  A('额度 reserve 占住 1.0', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1.0);

  section('③ startInterview(生产):押题经 invoke+factuality → 落题 → 首问');
  const { questions, firstQuestion } = await startInterview(pool, cp, OWNER, IID, up.resumeId, model);
  A('押题落库且过滤了幻觉「Go」(2 题接地)', questions.length === 2 && !questions.some((q) => q.includes('Go')));
  A('首题已出(interrupt 等待用户)', !!firstQuestion);
  A('题目持久化进 interview.questions', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT jsonb_array_length(questions) n FROM interview WHERE id=$1', [IID]))).rows[0].n === 2);

  section('④ submitAnswer(生产)×2:resume + eval(invoke);末轮确认额度+入队报告');
  let done = false;
  for (let i = 0; i < questions.length; i++) {
    const t = await submitAnswer(pool, cp, OWNER, IID, i, `答案${i + 1}:用 Redis 计数器`, model);
    A(`第${i + 1}题 eval 经 invoke(score=${t.score})`, t.score === 76);
    done = t.done;
  }
  A('末轮 done', done);
  A('完成后 interview=completed', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT status FROM interview WHERE id=$1", [IID]))).rows[0].status === 'completed');
  A('完成后额度已结算(扣 1.0,available=4.0)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1.0);

  section('⑤ 报告舱壁:submitAnswer 已入队 → drain(生产 reportGenerator) → report_ready');
  const outcome = await drainReportsOnce(pool, OWNER, 'flow-worker', {
    loadSummary: () => ({ interviewId: IID, questionCount: 2, scores: [76, 76] }),
    generate: reportGenerator(pool, OWNER, `${IID}:report`, model),
  });
  A('报告 drain 到 ready(overall=76)', outcome === 'ready' && ((await asPrincipal(pool, OWNER, (c) => getReport(c, OWNER, IID)))!.content as any).overall === 76);

  section('⑥ 关口完整性 & 隔离');
  const traces = await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1', [OWNER]));
  A('4 次模型调用全经 invoke 关口(quiz+2eval+report)', traces.rows[0].n === 4);
  A('模型真打次数===trace 数(无旁路)', modelCalls === traces.rows[0].n && modelCalls === 4);
  A('userB 看不到 userA 流程数据(RLS)', (await asPrincipal(pool, 'userB', (c) => c.query("SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id='userA'"))).rows[0].n === 0);

  console.log(`\n${failures === 0 ? '✓ 端到端 agent 主干(测生产生命周期服务)全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
