/**
 * 简历诊断进程接线证明（对真 Postgres）：**真请求经队列驱动 resume-diagnosis 图**——api 入队(generate) → worker 消费循环 → runDiagnosis 跑图/模型。
 *   reserve + enqueue diagnosis → diagnosisDispatchTick(消费) → 解密简历→诊断→factuality 过滤→落库报告+逐维度事件+终态 diagnosis_ready + 结算额度。
 *   再证**失败路径无泄漏**:虚构经历的改写(业务校验 'fabricated_experience')→ runDiagnosis 抛 → markFailed + diagnosis_unavailable 终态事件 + **退还预留额度**。
 * 测的全是生产件(diagnosis-jobs/diagnosis-consumer/diagnosis-lifecycle);模型注脚本(CI)。
 *   pnpm diagnosis:prove   (需 pnpm db:up)
 */
import {
  assertIsolatedTestTarget, createPool, asPrincipal, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueDiagnosisJob,
} from '@meetwise/db';
import { scriptedModelClient } from '@meetwise/ai-runtime';
import { ingestResume, groundedByFacts } from '@meetwise/domain';
import { diagnosisDispatchTick, type DiagnosisConsumerDeps } from '../src/diagnosis-consumer.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const OWNER = 'diagUser', DID = 'dg-' + Date.now(), DID_FAIL = 'dgf-' + Date.now(), DID_METRIC = 'dgm-' + Date.now();
const RESUME = ['工作经历', '负责订单系统限流改造,用 Redis 计数器扛高并发', '技能', 'Redis、限流、分布式锁'].join('\n');

// 成功诊断:5 维度发现,其中 highlight 含一条幻觉 finding(refs=['Go'] 简历里没有)→ factuality 歪曲门过滤掉。改写均接地。
const okModel = scriptedModelClient({
  'resume-diagnosis.generate': () => ({ ok: true, raw: {
    overall: 72,
    summary: '结构清晰、有高并发实战亮点,但缺量化指标与岗位关键词。',
    sections: [
      { kind: 'structure', title: '结构与排版', score: 80, findings: [{ text: '分节清晰,信息密度合理', refs: [] }] },
      { kind: 'completeness', title: '完整性', score: 65, findings: [{ text: '缺少教育背景与项目时间线', refs: [] }] },
      { kind: 'highlight', title: '亮点', score: 85, findings: [
        { text: '有高并发限流实战经验', refs: ['限流'] },
        { text: '熟悉 Redis 原子操作', refs: ['Redis'] },
        { text: '具备三年 Go 微服务经验', refs: ['Go'] },                 // 幻觉:简历无 Go(ungrounded ref)→ factuality 门过滤
        { text: '曾任职 Google 担任首席科学家', refs: [] },              // 空 refs 正面信用走私 → 亮点维度强制引证 → 剔除(审计致命#2)
      ] },
      { kind: 'risk', title: '风险/硬伤', findings: [{ text: '成果缺少量化数据(QPS/延迟)', refs: [] }] },
      { kind: 'match', title: '岗位匹配度', score: 70, findings: [{ text: '与后端高并发岗位相关', refs: ['限流'] }] },
    ],
    rewrites: [
      { before: '负责订单系统限流改造', after: '主导订单系统限流改造,基于 Redis 计数器支撑高并发(建议补充峰值 QPS 数据)', refs: ['限流', 'Redis'] },
    ],
  } }),
});
// 失败诊断:改写虚构了简历里没有的经历(refs=['MBA'])→ invoke 业务校验 'fabricated_experience' → diagnosisGenerator 抛 → runDiagnosis 抛 → 消费者失败路径。
const failModel = scriptedModelClient({
  'resume-diagnosis.generate': () => ({ ok: true, raw: {
    overall: 60, summary: 'x',
    sections: [{ kind: 'highlight', title: '亮点', findings: [{ text: '有限流经验', refs: ['限流'] }] }],
    rewrites: [{ before: '负责限流改造', after: '拥有 MBA 学位与十年团队管理经验', refs: ['MBA'] }],   // 虚构经历(ungrounded ref)
  } }),
});
// 量化造假诊断(审计致命#1):改写 refs **全接地**(限流/Redis),但 after 编造了简历里没有的数字(99999 QPS)→ 业务校验 'fabricated_metric' 硬拒。
// 这是"refs 接地≠内容接地"的真威胁面——旧版只校验 refs 会放行;新增数字接地闸拦下。
const metricFabModel = scriptedModelClient({
  'resume-diagnosis.generate': () => ({ ok: true, raw: {
    overall: 70, summary: 'x',
    sections: [{ kind: 'highlight', title: '亮点', findings: [{ text: '有限流经验', refs: ['限流'] }] }],
    rewrites: [{ before: '负责订单系统限流改造', after: '将系统峰值 QPS 从 100 提升至 99999', refs: ['限流', 'Redis'] }],   // refs 接地但 99999 虚构
  } }),
});

async function seedResume(): Promise<string> {
  return asPrincipal(pool, OWNER, async (c) => {
    const up = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, up.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, up.resumeId, ingestResume(RESUME));
    return up.resumeId;
  });
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query("INSERT INTO resume_diagnosis(id,owner_user_id,status) VALUES ($1,$2,'created'),($3,$2,'created'),($4,$2,'created')", [DID, OWNER, DID_FAIL, DID_METRIC]);
    await c.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '300 days')", [OWNER]);
  });
  const resumeId = await seedResume();
  const epoch = await asPrincipal(pool, OWNER, async (c) => Number((await c.query<{ privacy_epoch: number }>(
    'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, OWNER],
  )).rows[0]?.privacy_epoch));
  await asPrincipal(pool, OWNER, (c) => c.query(
    'UPDATE resume_diagnosis SET resume_id=$3,privacy_epoch=$4 WHERE owner_user_id=$1 AND id IN ($2,$5,$6)',
    [OWNER, DID, resumeId, epoch, DID_FAIL, DID_METRIC],
  ));
  const facts = ingestResume(RESUME).facts;

  section('① 成功诊断:api 入队 generate → worker 消费 → 诊断落库 + 逐维度事件 + 结算额度');
  const before = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID, 'resume_diagnosis', 1.0));
  await asPrincipal(pool, OWNER, (c) => enqueueDiagnosisJob(c, OWNER, DID, resumeId, epoch));
  const okDeps: DiagnosisConsumerDeps = { pool, model: okModel, leaseOwner: 'dworker-1' };
  const tick = await diagnosisDispatchTick(okDeps);
  A('diagnosisDispatchTick 消费到 owner', tick.owners >= 1);
  const row = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status, report FROM resume_diagnosis WHERE id=$1', [DID]));
  const report = row.rows[0].report as any;
  A('诊断 ready 且报告落库', row.rows[0].status === 'ready' && report != null);
  A('报告含五维度(结构/完整性/亮点/风险/匹配度)', Array.isArray(report.sections) && report.sections.length === 5);
  A('综合分在区间 [0,100]', report.overall >= 0 && report.overall <= 100);

  section('② 真接地(非 theatre):每条 finding/改写的 refs 必接地;幻觉 Go 过滤;空 refs 正面信用走私被剔除(审计致命#2)');
  const highlight = report.sections.find((s: any) => s.kind === 'highlight');
  A('highlight 维度过滤后剩 2 条(Go ungrounded ref + Google 空 refs 均被剔除)', highlight.findings.length === 2);
  const allFindings: Array<{ text: string; refs: string[] }> = report.sections.flatMap((s: any): Array<{ text: string; refs: string[] }> => s.findings);
  A('被过滤的幻觉发现(refs=[Go])确实没入库', !allFindings.some((f) => f.refs.includes('Go')));
  A('空 refs 的正面信用走私(「Google 首席科学家」)被剔除(亮点维度强制引证)', !allFindings.some((f) => f.text.includes('Google')));
  // 真 factuality 断言:每条有 refs 的 finding 必须真接地(groundedByFacts=生产同一函数);空 refs 仅允许非正面声明维度(结构/完整性/风险)。
  A('落库每条 finding 的 refs 真接地于简历 facts(空 refs 仅限非声明维度)', allFindings.every((f) => f.refs.length === 0 || groundedByFacts(f.refs, facts)));
  A('落库正面声明维度(亮点/匹配度)的 finding 全部带接地 refs(无空 refs 吹捧)', report.sections.filter((s: any) => s.kind === 'highlight' || s.kind === 'match').flatMap((s: any) => s.findings).every((f: any) => f.refs.length >= 1 && groundedByFacts(f.refs, facts)));
  A('落库每条改写建议的 refs 真接地(绝不虚构经历)', Array.isArray(report.rewrites) && report.rewrites.length >= 1 && report.rewrites.every((r: any) => r.refs.length >= 1 && groundedByFacts(r.refs, facts)));
  A('派生计数正确:groundedCount=6 接地发现,rejectedCount=2 被过滤(Go + 空refs吹捧)', report.groundedCount === 6 && report.rejectedCount === 2);

  section('③ SSE 业务事件:progress + 逐维度 section_ready + 逐条 rewrite_ready + 终态 diagnosis_ready');
  const evs = await asPrincipal(pool, OWNER, (c) => c.query('SELECT kind FROM interview_event WHERE stream_key=$1 ORDER BY seq', [DID]));
  const kinds = evs.rows.map((r: any) => r.kind);
  A('有 progress 起始事件', kinds.includes('progress'));
  A('逐维度 section_ready 共 5 条(每落库维度一条)', kinds.filter((k: string) => k === 'section_ready').length === 5);
  A('逐条 rewrite_ready(每帧有界,避免大报告撑爆前端缓冲)', kinds.filter((k: string) => k === 'rewrite_ready').length === report.rewrites.length);
  A('终态 diagnosis_ready 收尾(前端不死等)', kinds[kinds.length - 1] === 'diagnosis_ready');

  section('④ 额度结算 + 关口 trace');
  A('额度已结算(扣 1.0,非泄漏)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === before - 1.0);
  A('模型调用经 invoke 关口留 trace(诊断 1 次)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2", [OWNER, `${DID}:diagnosis`]))).rows[0].n === 1);
  A('diagnosis_job 已 done(无卡 running/queued)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM diagnosis_job WHERE diagnosis_id=$1 AND status!='done'", [DID]))).rows[0].n === 0);

  section('⑤ 失败路径无泄漏:虚构经历改写 → 业务校验拒 → diagnosis_unavailable 终态 + 退还预留额度');
  const beforeFail = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID_FAIL, 'resume_diagnosis', 1.0));
  A('预留后额度 -1.0', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === beforeFail - 1.0);
  await asPrincipal(pool, OWNER, (c) => enqueueDiagnosisJob(c, OWNER, DID_FAIL, resumeId, epoch));
  await diagnosisDispatchTick({ pool, model: failModel, leaseOwner: 'dworker-2' });
  const failRow = await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_diagnosis WHERE id=$1', [DID_FAIL]));
  A('诊断标 failed(业务校验拒虚构经历)', failRow.rows[0].status === 'failed');
  A('诊断报告未落库(拒绝交付虚构内容)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT report FROM resume_diagnosis WHERE id=$1', [DID_FAIL]))).rows[0].report === null);
  const failKinds = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT kind FROM interview_event WHERE stream_key=$1 ORDER BY seq', [DID_FAIL]))).rows.map((r: any) => r.kind);
  A('发 diagnosis_unavailable 终态事件(无静默死胡同)', failKinds.includes('diagnosis_unavailable'));
  A('diagnosis_job 标 failed(不无限重试)', (await asPrincipal(pool, OWNER, (c) => c.query("SELECT status FROM diagnosis_job WHERE diagnosis_id=$1", [DID_FAIL]))).rows[0].status === 'failed');
  A('**失败退款**:预留额度退还(回到失败前,不白扣)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === beforeFail);

  section('⑤b 量化造假硬拒(审计致命#1:refs 接地≠内容接地):改写 refs 全接地但 after 编造数字 → fabricated_metric 拒');
  const beforeMetric = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID_METRIC, 'resume_diagnosis', 1.0));
  await asPrincipal(pool, OWNER, (c) => enqueueDiagnosisJob(c, OWNER, DID_METRIC, resumeId, epoch));
  await diagnosisDispatchTick({ pool, model: metricFabModel, leaseOwner: 'dworker-3' });
  A('量化造假诊断标 failed(after 的 99999 不在简历 → 业务校验拒,旧版只校验 refs 会放行)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_diagnosis WHERE id=$1', [DID_METRIC]))).rows[0].status === 'failed');
  A('量化造假报告未落库(不交付编造数字的改写)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT report FROM resume_diagnosis WHERE id=$1', [DID_METRIC]))).rows[0].report === null);
  A('量化造假失败退款(预留额度退还,不白扣)', (await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER))) === beforeMetric);

  section('⑥ RLS:他人看不到本人诊断/job + SSE 事件跨租户不可读 + WITH CHECK 拒越权写');
  A('userB 读不到 diagUser 的诊断(RLS USING)', (await asPrincipal(pool, 'userB', (c) => c.query(`SELECT count(*)::int n FROM resume_diagnosis WHERE owner_user_id='${OWNER}'`))).rows[0].n === 0);
  A('userB 读不到 diagUser 的 diagnosis_job(RLS USING)', (await asPrincipal(pool, 'userB', (c) => c.query(`SELECT count(*)::int n FROM diagnosis_job WHERE owner_user_id='${OWNER}'`))).rows[0].n === 0);
  A('userB 经 events 取数路径(stream_key=diagnosisId)读不到 diagUser 的诊断事件(RLS)',
    (await asPrincipal(pool, 'userB', (c) => c.query('SELECT count(*)::int n FROM interview_event WHERE stream_key=$1', [DID]))).rows[0].n === 0);
  let withCheckBlocked = false;
  try { await asPrincipal(pool, 'userB', (c) => c.query(`INSERT INTO resume_diagnosis(id,owner_user_id,status) VALUES ('dg-evil','${OWNER}','created')`)); }
  catch { withCheckBlocked = true; }
  A('userB 越权插入 owner=diagUser 的诊断 → 被 RLS WITH CHECK 拒', withCheckBlocked);

  section('⑦ abandon×worker 竞态守卫:已 ready 的诊断不可被 abandon 倒退');
  const revert = await asPrincipal(pool, OWNER, (c) => c.query("UPDATE resume_diagnosis SET status='failed' WHERE id=$1 AND owner_user_id=$2 AND status IN ('created','generating')", [DID, OWNER]));
  A('对 ready 诊断套用 abandon CAS → 0 行(状态机不倒退,不误退已扣费)', revert.rowCount === 0);
  A('ready 诊断仍 ready(未被倒退)', (await asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_diagnosis WHERE id=$1', [DID]))).rows[0].status === 'ready');

  console.log(`\n${failures === 0 ? '✓ 简历诊断进程接线(api 入队→worker 消费→runDiagnosis 图)全部通过' : '✗ ' + failures + ' 项失败'}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
