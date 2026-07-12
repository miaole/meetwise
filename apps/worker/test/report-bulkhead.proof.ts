/**
 * 报告子图舱壁证明（对真 Postgres）：报告作为独立后台 job,失败隔离 + 独立重试 + 并发不双跑 + RLS。
 * 核心不变量:**报告失败绝不回滚/阻塞 interview**（面试结果照样 completed）；报告可独立 requeue 恢复;ready 才发 report_ready。
 *   pnpm report:prove   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createPool, asPrincipal, appendEvent,
  enqueueReport, claimReport, markReportReady, markReportFailed, requeueFailedReport, sweepReports, getReport,
  MAX_REPORT_ATTEMPTS,
} from '@meetwise/db';
import type { InterviewSummary, ReportContent } from '@meetwise/ai-graphs';
import { drainReportsOnce, sweepReportsOnce, dispatchTick, type ReportWorkerDeps } from '../src/report-worker.ts'; // 用真实生产函数,非测试本地复制

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

const summary: InterviewSummary = { interviewId: 'R1', questionCount: 2, scores: [68, 80] };
// 注入的 generate：先失败（模拟模型抖动）后成功——驱动舱壁的失败隔离与重试
const failingGenerate = (): ReportContent => { throw new Error('model_unavailable'); };
const goodGenerate = (s: InterviewSummary): ReportContent => ({
  overall: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length),
  sections: [{ title: '总评', body: `${s.questionCount} 题，均分稳定` }],
});

// 注入 worker deps：loadSummary 给固定摘要（带正确 interviewId），generate 由各用例传（失败/成功）
const depsWith = (generate: (s: InterviewSummary) => ReportContent): ReportWorkerDeps => ({
  loadSummary: (_o, iid) => ({ ...summary, interviewId: iid }),
  generate,
});
// 跑一次报告 job = 调用**真实生产函数** drainReportsOnce（3 事务生命周期 + 事件 CAS gate 都在生产代码里,不在测试里复制）
const runReportOnce = (owner: string, leaseOwner: string, generate: (s: InterviewSummary) => ReportContent) =>
  drainReportsOnce(pool, owner, leaseOwner, depsWith(generate));

async function main() {
  await pool.query(sql('../../../packages/db/sql/01_schema.sql'));
  await pool.query(sql('../../../packages/db/sql/04_report.sql'));
  // seed：已完成的面试（报告不存在不影响它）。userG 用于隔离 租约/重试/隔离 场景
  await pool.query(`INSERT INTO interview(id,owner_user_id,status) VALUES
    ('R1','userA','completed'),('R9','userB','completed'),
    ('RG-live','userG','completed'),('RG-stale','userG','completed'),('RG-pill','userG','completed'),('RG-back','userG','completed')`);

  section('enqueue：面试完成只做一次幂等 enqueue（不阻塞、不等报告）');
  const e1 = await asPrincipal(pool, 'userA', (c) => enqueueReport(c, 'userA', 'R1'));
  A('首次 enqueue 建 report job（queued）', e1.created);
  const e2 = await asPrincipal(pool, 'userA', (c) => enqueueReport(c, 'userA', 'R1'));
  A('重复 enqueue 幂等（同 reportId,不重排）', !e2.created && e2.reportId === e1.reportId);
  A('面试主链路不等报告：此刻报告仍 queued，interview 已 completed',
    (await asPrincipal(pool, 'userA', (c) => getReport(c, 'userA', 'R1')))!.status === 'queued');

  section('舱壁：报告失败**不碰 interview**（失败隔离）');
  A('worker 跑报告失败（模型抖动）', (await runReportOnce('userA', 'w1', failingGenerate)) === 'failed');
  const afterFail = await asPrincipal(pool, 'userA', (c) => getReport(c, 'userA', 'R1'));
  A('报告状态 failed、attempts=1', afterFail!.status === 'failed' && afterFail!.attempts === 1);
  A('**interview 仍 completed（报告失败没回滚/拖垮面试）**',
    (await asPrincipal(pool, 'userA', (c) => c.query("SELECT status FROM interview WHERE id='R1'"))).rows[0].status === 'completed');
  A('失败时不发 report_ready 事件',
    (await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='report_ready'"))).rows[0].n === 0);

  section('独立恢复：requeue 失败报告 → 重试成功 → ready + report_ready 事件');
  A('requeue failed→queued', await asPrincipal(pool, 'userA', (c) => requeueFailedReport(c, 'userA', e1.reportId)));
  A('重试跑报告成功', (await runReportOnce('userA', 'w1', goodGenerate)) === 'ready');
  const done = await asPrincipal(pool, 'userA', (c) => getReport(c, 'userA', 'R1'));
  A('报告 ready 且含内容（attempts=2）', done!.status === 'ready' && (done!.content as any).overall === 74 && done!.attempts === 2);
  A('ready 才发 report_ready 事件（SSE 信号）',
    (await asPrincipal(pool, 'userA', (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='R1' AND kind='report_ready'"))).rows[0].n === 1);

  section('租约：活租约的 running 不被另一 worker 抢（只领到 queued/过期）');
  await asPrincipal(pool, 'userG', (c) => enqueueReport(c, 'userG', 'RG-live'));
  const live = await asPrincipal(pool, 'userG', (c) => claimReport(c, 'userG', 'wLive'));   // 领到,持活租约
  A('worker wLive 领到 RG-live', !!live);
  const steal = await asPrincipal(pool, 'userG', (c) => claimReport(c, 'userG', 'wThief')); // userG 此刻无其它可领
  A('活租约的 running 不被抢（第二 claim 落空）', steal === null);

  section('崩溃恢复：租约过期的 running 可被重领（attempts 增长）');
  await pool.query("UPDATE ai_report SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id='userG' AND interview_id='RG-live'");
  const reclaim = await asPrincipal(pool, 'userG', (c) => claimReport(c, 'userG', 'wResume'));
  A('租约过期后被重领（崩溃 worker 不致卡死）', !!reclaim && reclaim!.attempts === 2);
  await asPrincipal(pool, 'userG', (c) => markReportReady(c, 'userG', reclaim!.reportId, 'wResume', { overall: 70, sections: [{ title: 't', body: 'b' }] }));

  section('stale finalize 防护：被抢租约的旧 worker finalize 落空,且**不发 report_ready**（审计 S1）');
  await asPrincipal(pool, 'userG', (c) => enqueueReport(c, 'userG', 'RG-stale'));
  const a = await asPrincipal(pool, 'userG', (c) => claimReport(c, 'userG', 'wA'));          // A 领到
  await pool.query("UPDATE ai_report SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id='userG' AND interview_id='RG-stale'"); // A 卡住,租约过期
  const b = await asPrincipal(pool, 'userG', (c) => claimReport(c, 'userG', 'wB'));           // B 重领
  A('B 重领 RG-stale', !!b && b!.reportId === a!.reportId);
  const staleOk = await asPrincipal(pool, 'userG', (c) => markReportReady(c, 'userG', a!.reportId, 'wA', { overall: 1, sections: [{ title: 'x', body: 'y' }] }));
  A('旧 worker A finalize 落空（CAS lease_owner 不匹配）', staleOk === false);
  A('A 落空 → 不发 report_ready 事件',
    (await asPrincipal(pool, 'userG', (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='RG-stale' AND kind='report_ready'"))).rows[0].n === 0);
  await asPrincipal(pool, 'userG', (c) => markReportReady(c, 'userG', b!.reportId, 'wB', { overall: 75, sections: [{ title: 't', body: 'b' }] })); // B 正常收尾

  section('poison-pill 兜底：超 MAX_REPORT_ATTEMPTS 的 failed → sweeper 隔离(quarantined),不无限重试');
  await asPrincipal(pool, 'userG', (c) => enqueueReport(c, 'userG', 'RG-pill'));
  for (let i = 0; i < MAX_REPORT_ATTEMPTS + 2; i++) {
    const res = await runReportOnce('userG', 'wPill', failingGenerate);
    if (res === 'idle') break;                                       // 被隔离后领不到了
    // 模拟退避时间已过（生产里是真实等待 2^n 秒,封顶 5min）
    await pool.query("UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE owner_user_id='userG' AND interview_id='RG-pill' AND status='failed'");
    await sweepReportsOnce(pool, 'userG');                           // 未超→requeue,超→quarantine
  }
  section('退避：失败后 next_attempt_at 置未来 → 退避未到 sweeper 不重排（瞬时故障不毫秒烧光重试）');
  await asPrincipal(pool, 'userG', (c) => enqueueReport(c, 'userG', 'RG-back'));
  await runReportOnce('userG', 'wBack', failingGenerate);            // claim+fail → failed + next_attempt 未来
  const back = (await asPrincipal(pool, 'userG', (c) => c.query("SELECT (next_attempt_at > now()) AS f, status FROM ai_report WHERE interview_id='RG-back'"))).rows[0];
  A('失败后 next_attempt_at 在未来（指数退避）', back.f === true && back.status === 'failed');
  // 真退避(2^attempts 秒)已验在未来;此处显式拉远退避窗,使"退避未到不重排"对负载/执行时长无关(防 flake:原 2s 窗在连跑高负载下会被自身 DB 往返耗过)。
  await asPrincipal(pool, 'userG', (c) => c.query("UPDATE ai_report SET next_attempt_at = now() + interval '1 hour' WHERE interview_id='RG-back' AND status='failed'"));
  await sweepReportsOnce(pool, 'userG');                             // 退避未到
  A('退避未到 → sweep 不重排（仍 failed,不立即重烧）',
    (await asPrincipal(pool, 'userG', (c) => c.query("SELECT status FROM ai_report WHERE interview_id='RG-back'"))).rows[0].status === 'failed');
  const pill = await asPrincipal(pool, 'userG', (c) => getReport(c, 'userG', 'RG-pill'));
  A('poison-pill 最终被隔离 quarantined（不无限重试）', pill!.status === 'quarantined');
  A(`隔离时 attempts 达上限 ${MAX_REPORT_ATTEMPTS}`, pill!.attempts === MAX_REPORT_ATTEMPTS);
  A('全程 interview RG-pill 仍 completed（舱壁:崩溃循环不碰面试）',
    (await asPrincipal(pool, 'userG', (c) => c.query("SELECT status FROM interview WHERE id='RG-pill'"))).rows[0].status === 'completed');
  A('隔离时发 report_unavailable 终态事件（前端优雅降级,不无限转圈——非静默死胡同）',
    (await asPrincipal(pool, 'userG', (c) => c.query("SELECT count(*)::int n FROM interview_event WHERE stream_key='RG-pill' AND kind='report_unavailable'"))).rows[0].n === 1);

  section('多租户调度：dispatchTick 枚举活跃 owner 各自 drain（队列在生产真被排干,非只写不调度）');
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('RH','userH','completed'),('RI','userI','completed')");
  await asPrincipal(pool, 'userH', (c) => enqueueReport(c, 'userH', 'RH'));
  await asPrincipal(pool, 'userI', (c) => enqueueReport(c, 'userI', 'RI'));
  const tick = await dispatchTick(pool, 'dispatcher-1', depsWith(goodGenerate));   // 枚举 → 逐 owner drain+sweep
  A('dispatchTick 枚举到含待办的多个 owner（≥2）', tick.owners >= 2);
  A('userH 报告被排干到 ready', (await asPrincipal(pool, 'userH', (c) => getReport(c, 'userH', 'RH')))!.status === 'ready');
  A('userI 报告被排干到 ready', (await asPrincipal(pool, 'userI', (c) => getReport(c, 'userI', 'RI')))!.status === 'ready');

  section('并发不双跑：两 worker 同时 claim,只一个领到');
  await asPrincipal(pool, 'userB', (c) => enqueueReport(c, 'userB', 'R9'));
  const [c1, c2] = await Promise.all([
    asPrincipal(pool, 'userB', (c) => claimReport(c, 'userB', 'wA')),
    asPrincipal(pool, 'userB', (c) => claimReport(c, 'userB', 'wB')),
  ]);
  A('两并发 claim 恰好一个领到（FOR UPDATE SKIP LOCKED + CAS）', (!!c1 ? 1 : 0) + (!!c2 ? 1 : 0) === 1);

  section('RLS：userB 看不到 userA 的报告');
  A('userB 视角 userA 报告=0 行',
    (await asPrincipal(pool, 'userB', (c) => c.query("SELECT count(*)::int n FROM ai_report WHERE owner_user_id='userA'"))).rows[0].n === 0);
  A('userB claim 只会领到自己的（领到的 interview=R9）', !!c1 ? c1.interviewId === 'R9' : (c2 ? c2.interviewId === 'R9' : false));

  console.log(`\n${failures === 0 ? '✓ 全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
