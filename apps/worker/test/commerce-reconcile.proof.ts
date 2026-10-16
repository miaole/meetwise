/**
 * C1 对账兜底的**生产调度侧**证明（真 Postgres）：把已写好的 reconcile/sweep/settle 经 worker tick 真跑起来。
 * 证明:①中途弃的面试预留被回收退额度(零泄漏)+发 interview_unavailable 终态事件(无死胡同)
 *      ②活会话(续约)绝不被误扫 ③confirm 投的 outbox 被真实入账本 ④重跑/并发幂等(不重退/不重发/不重入账)。
 *   pnpm -C apps/worker prove:commerce-reconcile   (需 db:up)
 */
import { randomUUID, createHash } from 'node:crypto';
import {
  createPool, asPrincipal, reserveEntitlement, confirmConsumption, availableUnits,
  renewReservationLease, DEFAULT_LEASE_SECONDS, assertIsolatedTestTarget,
  inviteCandidate, startApplicationInterview, createJob, classifyJobRoute,
} from '@meetwise/db';

// Test-only HMAC key for createJob/classifyJobRoute (same pattern as adaptive-life/rag03/r4; not production).
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'commerce-reconcile-job-route-input-hmac-proof-key-not-production-01';
import { commerceReconcileTick, reconcileOwner, consecutiveReconcileFailureCount } from '../src/commerce-reconcile.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

// 每 owner 独立池,tick 用 superuser 池越 RLS 枚举(dev 口径)。用唯一后缀避免与其它 proof/重跑撞。
const S = Date.now().toString(36);
const OWN = (k: string) => `recon-${k}-${S}`;
const IID = (k: string) => `iv-${k}-${S}`;

const evCount = (owner: string, stream: string, kind: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    "SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2", [stream, kind]))
    .then((r) => r.rows[0].n as number);
const consStatus = (owner: string, key: string) =>
  asPrincipal(pool, owner, (c) => c.query(
    "SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, key]))
    .then((r) => r.rows[0]?.status as string);

async function seedOwner(owner: string, units = 5.0) {
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')", [owner, units]);
}
async function expireLease(owner: string, key: string) {
  await pool.query("UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 minute' WHERE owner_user_id=$1 AND idempotency_key=$2", [owner, key]);
}

/** FENCE-REFLOW §4-1 围栏 fixture：privacy_erasure_request('fenced') × privacy_checkpoint_target（0076 v2 interview_privacy_active 判定面）。
 *  admin(superuser dev 池)直插仅作 fixture；围栏判定只经布尔函数消费，工具/产品面零旁路。 */
async function fenceInterview(owner: string, interviewId: string) {
  const req = await pool.query(
    "INSERT INTO privacy_erasure_request(owner_user_id,scope,subject_id,idempotency_key_hash,status) VALUES ($1,'interview_data',$2,$3,'fenced') RETURNING id",
    [owner, interviewId, `fence-reflow-proof:${owner}:${interviewId}`]);
  const requestId = req.rows[0].id as string;
  const tgt = await pool.query(
    "INSERT INTO privacy_deletion_target(request_id,sink,resource_hmac) VALUES ($1,'checkpoint_rows',$2) RETURNING id",
    // resource_hmac 钉 64-hex（0047 privacy_deletion_target_resource_hmac_chk）——fixture 用 sha256 摘要满足格式。
    [requestId, createHash('sha256').update(`fence-reflow-proof-hmac:${interviewId}`).digest('hex')]);
  await pool.query(
    'INSERT INTO privacy_checkpoint_target(target_id,request_id,owner_user_id,thread_id,fence_epoch) VALUES ($1,$2,$3,$4,2)',
    [tgt.rows[0].id, requestId, owner, interviewId]);
}
const ivStatus = (owner: string, iid: string) =>
  asPrincipal(pool, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1', [iid]))
    .then((r) => r.rows[0]?.status as string | undefined);

async function main() {
  // This proof writes expired reservations and must only run against the
  // throwaway cluster that has received the complete migration ledger.
  await assertIsolatedTestTarget(pool);

  section('① 中途弃的面试预留:租约过期 → 对账 tick 回收退额度 + 发 interview_unavailable 终态事件');
  {
    const owner = OWN('abandon'), iid = IID('abandon');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0)); // begin 预留
    const availAfterReserve = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    A('预留后额度扣 1.0（5→4）', availAfterReserve === 4.0);
    await expireLease(owner, iid);                       // 模拟用户中途弃 + 无续约 → 租约过期
    const r = await commerceReconcileTick(pool);         // 真 tick(枚举 → 回收)
    A('tick 回收 ≥1 笔孤儿预留', r.staleReleased >= 1);
    A('额度全退回池（4→5,零泄漏）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
    A('预留 consumption 置 released', (await consStatus(owner, iid)) === 'released');
    A('发了 interview_unavailable 终态事件(无静默死胡同)', (await evCount(owner, iid, 'interview_unavailable')) === 1);
    // **不留半死态(审计高)**:interview 必须落 'abandoned'——否则 create() 复用"未终态"既有面试,用户开不了新面试被卡死。
    A('interview 置终态 abandoned(create 不复用尸体,用户可开新面试)',
      (await asPrincipal(pool, owner, (c) => c.query("SELECT status FROM interview WHERE id=$1", [iid]))).rows[0].status === 'abandoned');
  }

  section('② 活会话(每轮续约)绝不被对账误扫');
  {
    const owner = OWN('active'), iid = IID('active');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await expireLease(owner, iid);                       // 先把租约推到过期(模拟长思考)
    const renewed = await asPrincipal(pool, owner, (c) => renewReservationLease(c, owner, iid, DEFAULT_LEASE_SECONDS)); // 下一轮 job 来了 → 续约
    A('续约成功(仍 reserved)', renewed === true);
    const r = await commerceReconcileTick(pool);
    A('续约后不被回收(仍 reserved)', (await consStatus(owner, iid)) === 'reserved');
    A('活会话 interview 不被误置 abandoned(仍 waiting_user)',
      (await asPrincipal(pool, owner, (c) => c.query("SELECT status FROM interview WHERE id=$1", [iid]))).rows[0].status === 'waiting_user');
    A('活会话额度未退(available 仍 4.0)', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);
    A('活会话不发 interview_unavailable(误杀防护)', (await evCount(owner, iid, 'interview_unavailable')) === 0);
    // 收尾:活会话最终应能正常 confirm 结算(续约+回收未破坏结算路径)
    const conf = await asPrincipal(pool, owner, (c) => confirmConsumption(c, owner, iid, 1));
    A('活会话最终仍能 confirm 结算(未因对账丢预留)', conf.status === 'confirmed');
    void r;
  }

  section('③ confirm 投的结算 outbox 被 tick 真实入账本(exactly-once)');
  {
    const owner = OWN('settle'), iid = IID('settle');
    await seedOwner(owner);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) => confirmConsumption(c, owner, iid, 1));  // → 投 settlement_proposed 到 outbox
    const pendBefore = (await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n FROM commerce_outbox WHERE status='pending'"))).rows[0].n;
    A('confirm 后 outbox 有 1 条 pending', pendBefore === 1);
    const r = await commerceReconcileTick(pool);
    A('tick 结算入账 settled≥1', r.settled >= 1);
    const ledger = await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n, COALESCE(SUM(units_settled),0) s FROM settlement_ledger WHERE consumption_id IN (SELECT id FROM entitlement_consumption WHERE owner_user_id=$1)", [owner]));
    A('结算账本入 1 笔 = 1.0', ledger.rows[0].n === 1 && Number(ledger.rows[0].s) === 1.0);
    const pendAfter = (await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n FROM commerce_outbox WHERE status='pending'"))).rows[0].n;
    A('outbox 标 relayed(0 pending)', pendAfter === 0);
  }

  section('④ 幂等:重跑 tick 不重退额度、不重发终态事件、不重入账本');
  {
    const owner = OWN('idem'), iid = IID('idem');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await expireLease(owner, iid);
    await commerceReconcileTick(pool);
    const availAfter1 = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    await commerceReconcileTick(pool);   // 重跑
    await commerceReconcileTick(pool);   // 再重跑
    A('重跑额度不再变(不重退)', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === availAfter1 && availAfter1 === 5.0);
    A('interview_unavailable 恰 1 条(重跑不重发)', (await evCount(owner, iid, 'interview_unavailable')) === 1);
  }

  section('⑤ 多实例并发:两拍同时对同一孤儿预留 → 恰好回收一次(行锁,无双退/无双发)');
  {
    const owner = OWN('race'), iid = IID('race');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await expireLease(owner, iid);
    // 两个"worker 实例"同时对账(reconcileOwner 直调,绕开枚举去打同一 owner)
    const [a, b] = await Promise.all([
      reconcileOwner(pool, owner).catch(() => ({ staleReleased: 0, settled: 0, abandoned: 0 })),
      reconcileOwner(pool, owner).catch(() => ({ staleReleased: 0, settled: 0, abandoned: 0 })),
    ]);
    A('两并发对账合计恰回收 1 笔(无双退)', (a.staleReleased + b.staleReleased) === 1);
    A('额度恰退 1.0 回池(available=5.0,无双退超发)', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
    A('interview_unavailable 恰 1 条(并发不重发)', (await evCount(owner, iid, 'interview_unavailable')) === 1);
  }

  section('⑥ 非面试(quiz/diagnosis)孤儿预留:回收退额度,但不误发面试事件');
  {
    const owner = OWN('quiz'), qid = IID('quiz');
    await seedOwner(owner);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, qid, 'resume_quiz', 1.0));
    await expireLease(owner, qid);
    const r = await commerceReconcileTick(pool);
    A('quiz 孤儿预留被回收退额度', r.staleReleased >= 1 && (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
    A('quiz 回收不发 interview_unavailable(仅 mock_interview 发)', (await evCount(owner, qid, 'interview_unavailable')) === 0);
  }

  section('⑦ B 端岗位面试的过期预留：评分不可用、释放一次、可创建下一 attempt');
  {
    // R2 P-START：无 route_decided → start 拒启 interview_ineligible_route（无 interviewId）。
    // 旧 raw job_posting INSERT 跳过 semantic revision / classify → reserve(undefined) 炸 NOT NULL idempotency_key。
    // 诚实最小修：createJob → rule-classify → invite → start，再 reserve 真实 interviewId（同 adaptive-life B）。
    const owner = OWN('bound'), recruiter = OWN('bound-rec');
    const resumeId = randomUUID();
    await seedOwner(owner, 2.0);
    const jobRow = await asPrincipal(pool, recruiter, (c) => createJob(c, recruiter, {
      title: 'Node.js 服务端工程师',
      description: '使用 NestJS 构建服务',
      competencies: ['nestjs', 'express', 'koa'],
    }));
    const jobId = jobRow.id;
    const rev = Number((await pool.query(
      'SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobId],
    )).rows[0].n);
    const classify = await classifyJobRoute(pool, recruiter, jobId, rev, {
      modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
    });
    A('B 端岗位 rule-classified route_decided（start 前置）', classify.status === 'route_decided' && classify.attemptOutcome === 'rule_decided');
    await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [resumeId, owner, `reconcile:${owner}`]);
    const app = await asPrincipal(pool, recruiter, (c) => inviteCandidate(c, recruiter, jobId, owner));
    const first = await asPrincipal(pool, owner, (c) => startApplicationInterview(c, owner, app!.applicationId, resumeId));
    const firstInterviewId = (first.status === 'started' || first.status === 'reused') ? first.interviewId : undefined;
    A('B 端 startApplicationInterview 返回 interviewId', typeof firstInterviewId === 'string' && firstInterviewId.length > 0);
    if (!firstInterviewId) throw Object.assign(new Error('b_side_start_missing_interview_id'), { code: 'b_side_start_missing_interview_id', start: first });
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, firstInterviewId, 'mock_interview', 1.0));
    await expireLease(owner, firstInterviewId);
    await commerceReconcileTick(pool);
    const state = (await pool.query('SELECT status,score,interview_id,interview_attempt FROM job_application WHERE id=$1', [app!.applicationId])).rows[0];
    A('B 端过期会话 → assessment_unavailable、score=NULL、指针仍为旧 attempt', state?.status === 'assessment_unavailable'
      && state?.score === null && state?.interview_id === firstInterviewId && Number(state?.interview_attempt) === 1);
    A('B 端过期会话的 interview=failed 且额度 released 恰一次',
      (await asPrincipal(pool, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1', [firstInterviewId]))).rows[0]?.status === 'failed'
      && (await consStatus(owner, firstInterviewId)) === 'released'
      && (await evCount(owner, firstInterviewId, 'assessment_unavailable')) === 1);
    const retries = await Promise.all(Array.from({ length: 20 }, () => asPrincipal(pool, owner, (c) => startApplicationInterview(c, owner, app!.applicationId, resumeId))));
    const retryId = (retries.find((x: any) => x.status === 'started' || x.status === 'reused') as any)?.interviewId;
    const retry = (await pool.query('SELECT status,interview_id,interview_attempt,score FROM job_application WHERE id=$1', [app!.applicationId])).rows[0];
    A('20 路恢复只创建下一 attempt=2，旧失败会话不可回填', retries.every((x: any) => (x.status === 'started' || x.status === 'reused') && x.interviewId === retryId)
      && retry?.status === 'in_progress' && retry?.interview_id === retryId && Number(retry?.interview_attempt) === 2 && retry?.score === null);
  }

  section('⑧ FENCE-REFLOW F3(#238)：围栏行两分支全跳零 DML——同户结算不毒化、围栏行零事件零终态、B 端围栏同跳');
  {
    const owner = OWN('fence'), ivFenced = IID('fence'), ivOk = IID('fence-ok');
    await seedOwner(owner, 5.0);
    // C 端围栏行：非终态 + 围栏锚落库（0076 v2 判定面）。
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [ivFenced, owner]);
    await fenceInterview(owner, ivFenced);
    // 同户非围栏对照行 + 同户另一笔 pending 结算 outbox（confirm 投 settlement_proposed）。
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [ivOk, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, ivOk, 'mock_interview', 1.0));
    const settleIid = IID('fence-settle');
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, settleIid, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) => confirmConsumption(c, owner, settleIid, 1));
    // 围栏行挂死预留（过期 → 会被 sweep 翻 released）。
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, ivFenced, 'mock_interview', 1.0));
    const evBeforeFenced = await evCount(owner, ivFenced, 'interview_unavailable');
    await expireLease(owner, ivFenced);
    await expireLease(owner, ivOk);
    const r = await commerceReconcileTick(pool);
    A('F3 同户 pending 结算对账入账成功（settlement_ledger 落行·outbox relayed——围栏行不毒化整批）',
      r.settled >= 1
      && (await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n FROM settlement_ledger WHERE owner_user_id=$1", [owner]))).rows[0].n >= 1
      && (await asPrincipal(pool, owner, (c) => c.query("SELECT count(*)::int n FROM commerce_outbox WHERE owner_user_id=$1 AND status='pending'", [owner]))).rows[0].n === 0);
    A('F3 围栏行预留 released（sweep 释放不被回滚）', (await consStatus(owner, ivFenced)) === 'released');
    A('F3 无 interview_privacy_fenced 循环报错（连续失败计数=0）', consecutiveReconcileFailureCount() === 0);
    A('F3 围栏行 interview_event 增量=0（两分支全跳·零事件写）',
      (await evCount(owner, ivFenced, 'interview_unavailable')) === evBeforeFenced && evBeforeFenced === 0);
    A('F3 围栏 interview 保持非终态（零 DML·不置 abandoned/failed）', (await ivStatus(owner, ivFenced)) === 'waiting_user');
    A('F3 非围栏对照行 byte 级不变（abandoned + interview_unavailable 恰 1）',
      (await ivStatus(owner, ivOk)) === 'abandoned' && (await evCount(owner, ivOk, 'interview_unavailable')) === 1);
    A('F3 fencedSkipped 计数 ≥1 随 ReconcileOutcome 上报', r.fencedSkipped >= 1);

    // B 端围栏行（application_id≠NULL）：⑦ 同款真 start 链 fixture → 围栏 → 挂死预留 → 同跳。
    const recruiter = OWN('fence-rec');
    const resumeId = randomUUID();
    const jobRow = await asPrincipal(pool, recruiter, (c) => createJob(c, recruiter, {
      title: 'Fence B 端工程师', description: '围栏同跳 fixture', competencies: ['nodejs'],
    }));
    const rev = Number((await pool.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id])).rows[0].n);
    await classifyJobRoute(pool, recruiter, jobRow.id, rev, {
      modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
    });
    await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [resumeId, owner, `reconcile-fence:${owner}`]);
    const app = await asPrincipal(pool, recruiter, (c) => inviteCandidate(c, recruiter, jobRow.id, owner));
    const started = await asPrincipal(pool, owner, (c) => startApplicationInterview(c, owner, app!.applicationId, resumeId));
    const bInterviewId = (started.status === 'started' || started.status === 'reused') ? started.interviewId : undefined;
    if (!bInterviewId) throw Object.assign(new Error('fence_b_side_start_missing'), { code: 'fence_b_side_start_missing' });
    const bBound = (await pool.query('SELECT application_id FROM interview WHERE id=$1', [bInterviewId])).rows[0]?.application_id;
    A('F3 B 端围栏 fixture：interview 绑定 application_id（≠NULL）', typeof bBound === 'string' && bBound === app!.applicationId);
    const appBefore = (await pool.query('SELECT status,interview_attempt,score FROM job_application WHERE id=$1', [app!.applicationId])).rows[0];
    const ivBStatusBefore = await ivStatus(owner, bInterviewId);
    await fenceInterview(owner, bInterviewId);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, bInterviewId, 'mock_interview', 1.0));
    await expireLease(owner, bInterviewId);
    const r2 = await commerceReconcileTick(pool);
    A('F3 B 端围栏行同跳：零 assessment_unavailable 事件（:46-49 块同跳·appendEvent 不触发）',
      (await evCount(owner, bInterviewId, 'assessment_unavailable')) === 0);
    const appAfter = (await pool.query('SELECT status,interview_attempt,score FROM job_application WHERE id=$1', [app!.applicationId])).rows[0];
    A('F3 B 端围栏行同跳：application 状态零翻转', JSON.stringify(appAfter) === JSON.stringify(appBefore));
    A('F3 B 端围栏行同跳：interview 状态零翻转（不置 failed/abandoned）', (await ivStatus(owner, bInterviewId)) === ivBStatusBefore);
    A('F3 B 端围栏行同跳：预留 released（sweep 已释放·围栏跳过不回滚释放）', (await consStatus(owner, bInterviewId)) === 'released');
    A('F3 B 端围栏行同跳：零 interview_unavailable 事件', (await evCount(owner, bInterviewId, 'interview_unavailable')) === 0);
    // EXEC 续做修正（前席断言语义错位）：fencedSkipped=逐拍计数（非跨拍累计）——r 拍=C 端围栏行（≥1 已断言）,
    // r2 拍仅新 sweep 的 B 端围栏行 → 本拍 ≥1、两拍合计 ≥2（r.fencedSkipped≥1 + r2.fencedSkipped≥1）。
    A('F3 fencedSkipped 含 B 端行（本拍 ≥1·两拍合计 ≥2）', r2.fencedSkipped >= 1 && (r.fencedSkipped + r2.fencedSkipped) >= 2);
    A('F3 二拍后仍零循环报错（连续失败计数=0）', consecutiveReconcileFailureCount() === 0);
  }

  section('⑨ interview_unavailable 补 event_key（kind:id:phase 幂等去重面）：identity 断言 + 重放拍零重发');
  {
    const owner = OWN('evkey'), iid = IID('evkey');
    await seedOwner(owner);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')", [iid, owner]);
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, iid, 'mock_interview', 1.0));
    await expireLease(owner, iid);
    // reclaim cancel 收口联合判别钉：拍前 seed 一行 open 题（status 缺省 'issued'·0021 CHECK 四值+
    // uq_interview_question_open 单开题窗内恰一行）——reclaim 拍必须把它收口为 'cancelled'
    // （主臂 finishAbandon 同事务 cancel ∪ 兜底臂显式 cancel，两臂终态口径合一）。
    // seed 必须以 owner principal 执行（0058/0059 投影写护栏要求 session principal=owner·DBHY-1），
    // 裸 superuser 池直插会被围栏断言以 interview_privacy_fenced 拒绝。
    await asPrincipal(pool, owner, (c) => c.query("INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question) VALUES ($1,$2,'q-reclaim-closeout',1,0,'收口判别题')", [owner, iid]));
    A('seed 就位：open 题 status=issued（拍前 fixture 自证）',
      (await asPrincipal(pool, owner, (c) => c.query('SELECT status FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2', [owner, iid]))).rows[0]?.status === 'issued');
    await commerceReconcileTick(pool);
    A('reclaim 拍收口：seed issued 题 → status=cancelled（对零 cancel 接线的前码恒 issued=红·防回退判别钉）',
      (await asPrincipal(pool, owner, (c) => c.query('SELECT status FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2', [owner, iid]))).rows[0]?.status === 'cancelled');
    const ekRow = await asPrincipal(pool, owner, (c) => c.query(
      "SELECT event_key FROM interview_event WHERE stream_key=$1 AND kind='interview_unavailable'", [iid]));
    A('interview_unavailable 恰 1 条且 event_key 恒等 interview_unavailable:<id>:reclaim',
      ekRow.rows.length === 1 && ekRow.rows[0].event_key === `interview_unavailable:${iid}:reclaim`);
    await commerceReconcileTick(pool);   // 重放拍（已 released 不再进 swept；键在场则去重兜底）
    A('重放拍零重发（event_key 去重 ∪ swept exactly-once 结构面·仍恰 1 条）',
      (await evCount(owner, iid, 'interview_unavailable')) === 1);

    // 终态-conflict 子臂（兜底臂独走判别）：interview 预置终态 'completed'（INSERT 先于 reserve=
    // 0020 配对触发器 consumption NULL 放行）→ reclaim 拍主 CAS（commerce.ts :529 WHERE IN
    // created/waiting_user）0 行 → :539 抛 interview_abandon_conflict → commerce-reconcile.ts
    // :79 窄滤接住 → soft-set no-op（completed 被排除=状态零翻转）→ :86 兜底臂独走 cancel
    // （主臂 finishAbandon 不可达=cancel 唯一来源钉死）。
    const ownerT = OWN('evkey-term'), iidT = IID('evkey-term');
    await seedOwner(ownerT);
    await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'completed')", [iidT, ownerT]);
    await asPrincipal(pool, ownerT, (c) => reserveEntitlement(c, ownerT, iidT, 'mock_interview', 1.0));
    await asPrincipal(pool, ownerT, (c) => c.query("INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question) VALUES ($1,$2,'q-reclaim-term',1,0,'终态收口题')", [ownerT, iidT]));
    await expireLease(ownerT, iidT);
    await commerceReconcileTick(pool);
    A('终态-conflict 兜底臂独走：soft-set no-op（interview 保持 completed 零翻转）', (await ivStatus(ownerT, iidT)) === 'completed');
    A('终态-conflict 兜底臂独走：open 题仍被收口 cancelled（不经 finishAbandon 主臂·:86 直收）',
      (await asPrincipal(pool, ownerT, (c) => c.query('SELECT status FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2', [ownerT, iidT]))).rows[0]?.status === 'cancelled');
  }

  console.log(`\n${fail === 0 ? '✓ C1 对账兜底调度侧:孤儿预留回收+终态事件+结算入账+幂等+并发安全 全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
