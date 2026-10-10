import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import { mkAssert } from './_neg-harness';
import {
  createPool, runMigrations, loadMigrations, asPrincipal,
  createJob, classifyJobRoute, inviteCandidate,
  reserveEntitlementForApplication, completeInterviewAndConfirm,
  failInterviewAndRelease, sweepExpiredReservations, renewReservationLease,
  markOrderPaidAndCredit,
} from '@meetwise/db';
import { InterviewService } from '../src/modules/interview/interview.service';
import { ApplicationsService } from '../src/modules/jobs/applications.service';
import { CommerceService } from '../src/modules/commerce/commerce.service';
import type { DbPool } from '@meetwise/db';

/**
 * entpay-s2.proof — B271 #271 片2 扣费路由验收矩阵（REQUEST §4 七判据·隔离 runner·est live=0）。
 *
 * 载体：真迁移链全量应用（0001→**0157**·含片2 payer 列+gateway_entpay_reserve/apply_allocation 受控
 * 函数族）+ **真实生产码面**——InterviewService/ApplicationsService/CommerceService 以最小 DbService
 * seam（asPrincipal/asGateway→隔离池）直调（零 HTTP 面·守卫/映射/事务边界全真）；
 * worker 面（adaptive-lifecycle :435/:441/:456·commerce-reconcile :35/:36/:65/:75·interview-consumer
 * :81/:163/:224/:233/:426）以同名 db 函数同参调用面覆盖（路由实现位=commerce/commerce.ts 八锚·§9-3 钉死）。
 *
 * 判据→落槽（REQUEST §4）：判据1 候选人零扣｜判据2 start 前拒（含 reused 复用路零余额同拒·rev2-R8）｜
 * 判据3 重试一次（evaluation_unscored 释放后重试净扣 1 次+同 attempt 幂等收敛单行）｜判据4 RLS 纵深｜
 * 判据5 C8 channel 守卫（offline 单持有效签名 ⇒ 拒·订单滞 created·桶零入账；online 回归零变化）｜
 * 判据6 B 端 abandon 泄漏回归（rev2-R5：企业桶回补∧消费行 released∧候选人桶零变∧sweeper 下拍零扫）。
 * 判据5 行（§4-5 C 端回归）=neg:interview/neg:commerce/neg:bend 独立跑（runner 目标）·不在本文件。
 *
 * est live=0（零模型外呼·零真实支付·隔离库零生产 DSN）。
 */

process.env.PAY_PROVIDER_SECRET ??= 'entpay-s2-proof-pay-secret-not-production';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'entpay-s2-proof-route-input-hmac-key-not-production-01';

const CAND = 's2-candidate-1';
const REC = 's2-recruiter-1';
const REC2 = 's2-recruiter-2';

let pool: DbPool | null = null;

/** 最小 DbService seam：asPrincipal/asGateway 直连隔离池（真实事务边界·RLS 上下文全真）。 */
const fakeDb = {
  asPrincipal: (owner: string, fn: (c: any) => any) => asPrincipal(pool!, owner, fn as any),
  asGateway: (fn: (c: any) => any) => Promise.resolve(fn(pool!)),
} as any;

const interviews = new InterviewService(fakeDb, { allow: () => true } as any, undefined as any, undefined as any, undefined as any);
const applications = new ApplicationsService(fakeDb);
const commerce = new CommerceService(fakeDb);

const paySig = (s: string) => createHmac('sha256', process.env.PAY_PROVIDER_SECRET!).update(s).digest('hex');

const errOf = (e: unknown): { status?: number; error?: string } => {
  const he = e as { getStatus?: () => number; getResponse?: () => { error?: string } } | undefined;
  if (typeof he?.getStatus === 'function' && typeof he?.getResponse === 'function') {
    return { status: he.getStatus(), error: he.getResponse()?.error };
  }
  return {};
};

/** B 端播种四件套：open 岗位（rule-classified）→ 邀请 → 返回 applicationId（0155 审核制招聘方语境）。 */
async function seedApplication(recruiter: string): Promise<string> {
  const jobRow = await asPrincipal(pool!, recruiter, (c) => createJob(c, recruiter, {
    title: 'Node.js 服务端工程师',
    description: '使用 NestJS 构建服务',
    competencies: ['nestjs', 'express', 'koa'],
  }));
  const rev = Number((await pool!.query('SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id])).rows[0].n);
  await classifyJobRoute(pool!, recruiter, jobRow.id, rev, {
    modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
  });
  const invited = await asPrincipal(pool!, recruiter, (c) => inviteCandidate(c, recruiter, jobRow.id, CAND));
  return invited!.applicationId;
}

async function main() {
  const { A, done } = mkAssert('entpay:s2:prove');
  pool = createPool({ purpose: 'entpay_s2_proof' });
  await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  const applied = await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  A('S2-0 真迁移链全量应用 0001→0157（末位=0157 扣费路由·S2-C1 落位）',
    applied.applied[applied.applied.length - 1] === '0157_billing_payer_route');
  A('S2-0b 0157 函数族在位（SECURITY DEFINER×2）',
    ((await pool.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname IN ('gateway_entpay_reserve','gateway_entpay_apply_allocation') AND prosecdef`)).rows[0]?.n ?? 0) === 2);

  await pool.query(`INSERT INTO user_account(id,email,password_hash,role,approval_status)
    VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','recruiter','approved'),($5,$6,'x','candidate','approved')
    ON CONFLICT DO NOTHING`, [REC, 's2-rec@x.com', REC2, 's2-rec2@x.com', CAND, 's2-cand@x.com']);
  // 企业桶：REC=5.00；REC2=5.00（跨招聘方隔离对照）。候选人零桶（个人额度 0·判据1 面）。
  await pool.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
    VALUES ($1,'enterprise',5.00, now()+interval '365 days'),($2,'enterprise',5.00, now()+interval '365 days')`, [REC, REC2]);
  await pool.query(`INSERT INTO resume(id, owner_user_id, status, content_sha)
    VALUES ('10000000-0000-4000-8000-000000000001',$1,'ingested','s2:resume:1') ON CONFLICT DO NOTHING`, [CAND]);
  const RESUME = '10000000-0000-4000-8000-000000000001';

  const recBucket = async (): Promise<{ reserved: number; consumed: number }> => {
    const r = await pool!.query(`SELECT coalesce(sum(units_reserved),0)::numeric AS reserved, coalesce(sum(units_consumed),0)::numeric AS consumed
      FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]);
    return { reserved: Number(r.rows[0].reserved), consumed: Number(r.rows[0].consumed) };
  };
  const candBucket = async (): Promise<number> => Number((await pool!.query(
    `SELECT coalesce(sum(units_reserved+units_consumed),0)::numeric AS n FROM entitlement_bucket WHERE owner_user_id=$1`, [CAND])).rows[0].n);

  // ══ 判据1 候选人零扣：候选人额度 0 完成岗位面试（无 402）·候选人桶零变 ∧ 企业桶 consumed +1 ══
  const app1 = await seedApplication(REC);
  const start1 = await applications.start(CAND, app1, { resumeId: RESUME } as any);
  A('判据1 start 合一事务返回 started+redirectTo（候选人零额度无 402·S2-C4）',
    start1.status === 'started' && typeof start1.redirectTo === 'string');
  const iv1 = (start1 as { interviewId: string }).interviewId;
  let b1 = await recBucket();
  A('判据1a 候选人个人桶零变（units_reserved+consumed=0·零扣费结构面）', (await candBucket()) === 0);
  A('判据1b 企业桶 units_reserved=1.00（企业路由预留落位）', b1.reserved === 1 && b1.consumed === 0);
  const payer1 = await pool!.query(`SELECT payer_user_id FROM entitlement_consumption WHERE idempotency_key=$1 AND owner_user_id=$2`, [iv1, CAND]);
  A('判据1c 消费行形状=D-1 形状甲（owner=候选人·payer=招聘方·0157 头注裁决）',
    payer1.rows[0]?.payer_user_id === REC);
  const again1 = await interviews.begin(CAND, iv1, RESUME) as { alreadyBegun?: boolean };
  b1 = await recBucket();
  A('判据1d begin 幂等短路（alreadyBegun·零重复预留·企业 reserved 仍 1.00）',
    again1.alreadyBegun === true && b1.reserved === 1);
  await asPrincipal(pool!, CAND, (c) => completeInterviewAndConfirm(c, CAND, iv1));
  b1 = await recBucket();
  A('判据1e 完成结算：企业桶 units_consumed=+1 且 reserved 归零·候选人桶仍零变（双断言·worker :435/:441 面）',
    b1.consumed === 1 && b1.reserved === 0 && (await candBucket()) === 0);

  // ══ 判据2 start 前拒：企业额度 0 ⇒ 拒·零 in_progress 空申请（CAS 零触）·两分码 ══
  const app2 = await seedApplication(REC);
  await pool!.query(`UPDATE entitlement_bucket SET units_total = units_reserved + units_consumed WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]); // avail→0
  let threw2: unknown;
  try { await applications.start(CAND, app2, { resumeId: RESUME } as any); } catch (e) { threw2 = e; }
  const e2 = errOf(threw2);
  A('判据2 企业额度 0 ⇒ start 拒（402·application_enterprise_pay_unavailable·候选人分码）',
    e2.status === 402 && e2.error === 'application_enterprise_pay_unavailable');
  const app2Row = await pool!.query(`SELECT status, interview_attempt, interview_id FROM job_application WHERE id=$1`, [app2]);
  A('判据2a CAS 零触：申请仍 invited·attempt=0·零绑定（不产生 in_progress 空申请·#227 收口）',
    app2Row.rows[0]?.status === 'invited' && Number(app2Row.rows[0]?.interview_attempt) === 0 && app2Row.rows[0]?.interview_id == null);
  A('判据2b 企业桶零预留（拒前零悬账）', (await recBucket()).reserved === 0);

  // reused 复用路（recruiter.ts:373-387·rev2-R8）：in_progress+绑定完整但未 begun（存量形状）→ 零余额同拒
  const app3 = await seedApplication(REC);
  await pool!.query(`UPDATE entitlement_bucket SET units_total = units_total + 1.00 WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]); // avail→1.00
  const start3 = await applications.start(CAND, app3, { resumeId: RESUME } as any);
  const iv3 = (start3 as { interviewId: string }).interviewId;
  A('判据2c 控制组：有余额 reused/started 正常（预留 1.00）', (await recBucket()).reserved === 1);
  // 构造存量形状：申请已 in_progress·绑定 interview created·start job 缺失（begin 未跑的 #227 存量悬停）
  await pool!.query(`DELETE FROM interview_job WHERE interview_id=$1 AND kind='start'`, [iv3]);
  await pool!.query(`UPDATE entitlement_bucket SET units_total = units_reserved + units_consumed WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]); // avail→0
  let threw3: unknown;
  try { await applications.start(CAND, app3, { resumeId: RESUME } as any); } catch (e) { threw3 = e; }
  const e3 = errOf(threw3);
  A('判据2d reused 复用路零余额同拒（402·同分码·rev2-R8）', e3.status === 402 && e3.error === 'application_enterprise_pay_unavailable');
  const app3Row = await pool!.query(`SELECT interview_attempt FROM job_application WHERE id=$1`, [app3]);
  A('判据2e reused 拒后零态变（attempt 不变·零二次预留）',
    Number(app3Row.rows[0]?.interview_attempt) === 1 && (await recBucket()).reserved === 1);

  // ══ 判据3 重试一次：evaluation_unscored 释放后重试净扣 1 次·同 attempt 幂等收敛单行 ══
  const app4 = await seedApplication(REC);
  await pool!.query(`UPDATE entitlement_bucket SET units_total = units_total + 1.00 WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]); // avail→1.00
  const start4 = await applications.start(CAND, app4, { resumeId: RESUME } as any);
  const iv4 = (start4 as { interviewId: string }).interviewId;
  const before3 = await recBucket();   // 失败前基线（含 iv3 既有预留）
  // evaluation_unscored 系统失败面（adaptive-lifecycle :456 + interview-consumer :81 同参调用形）
  await asPrincipal(pool!, CAND, async (c) => {
    await failInterviewAndRelease(c, CAND, iv4);
    await c.query(`UPDATE job_application SET status='assessment_unavailable', score=NULL, version=version+1
      WHERE id=$1 AND candidate_user_id=$2 AND status='in_progress'`, [app4, CAND]);
  });
  const afterFail = await recBucket();
  A('判据3a 系统失败释放：消费行 released·企业桶回补至失败前基线（预留零泄漏·:456 面）',
    afterFail.reserved === before3.reserved - 1 && (await pool!.query(`SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2`, [CAND, iv4])).rows[0]?.status === 'released');
  const retry4 = await applications.start(CAND, app4, { resumeId: RESUME } as any);
  const iv4b = (retry4 as { interviewId: string }).interviewId;
  A('判据3b 重试新 attempt（interview_id≠旧·assessment_unavailable 恢复路）', iv4b !== iv4 && retry4.status === 'started');
  const lease3 = await asPrincipal(pool!, CAND, (c) => renewReservationLease(c, CAND, iv4b, 1800));
  A('判据3b-iv 长会话租约续约（dispatch owner=候选人语境 rowCount=true·0-c⑥ 生产复验·:224/:233 零改面）', lease3 === true);
  await asPrincipal(pool!, CAND, (c) => completeInterviewAndConfirm(c, CAND, iv4b));
  const afterRetry = await recBucket();
  const rows4 = await pool!.query(`SELECT idempotency_key, status FROM entitlement_consumption WHERE owner_user_id=$1 AND service_type='mock_interview' ORDER BY created_at`, [CAND]);
  const confirmedIv4b = rows4.rows.filter((r: any) => r.status === 'confirmed' && r.idempotency_key === iv4b);
  const releasedIv4 = rows4.rows.filter((r: any) => r.status === 'released' && r.idempotency_key === iv4);
  A('判据3c 重试净扣企业恰 1 次（iv4b confirmed 恰 1 行·iv4 released 零计费·consumed 较失败前 +1）',
    confirmedIv4b.length === 1 && releasedIv4.length === 1 && afterRetry.consumed === afterFail.consumed + 1);
  // 同 attempt 网络重放：幂等键=interviewId（uq (owner,key) 背书）收敛单行
  const replay = await asPrincipal(pool!, CAND, (c) => reserveEntitlementForApplication(c, CAND, app4, iv4b, 'mock_interview', 1.0));
  const replayCnt = await pool!.query(`SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2`, [CAND, iv4b]);
  A('判据3d 同 attempt 重放收敛单行（duplicate·零二次扣·uq 0001:122）',
    replay.status === 'duplicate' && replayCnt.rows[0]?.n === 1 && afterRetry.consumed === afterFail.consumed + 1);
  A('判据3e 重放零新增预留（reserved 保持重试结算后基线）', (await recBucket()).reserved === afterFail.reserved);

  // ══ 判据4 RLS 纵深：候选人/他招聘方读不到对方企业扣费面 ══
  const invisCand = await asPrincipal(pool!, CAND, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]));
  const invisRec2Bucket = await asPrincipal(pool!, REC2, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]));
  const invisRec2Cons = await asPrincipal(pool!, REC2, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1`, [CAND]));
  A('判据4 候选人/他招聘方 principal 下他者企业桶与扣费行 SELECT=0（FORCE RLS·0-c③ 生产复验）',
    invisCand.rows[0]?.n === 0 && invisRec2Bucket.rows[0]?.n === 0 && invisRec2Cons.rows[0]?.n === 0);

  // ══ 判据5 C8 channel 守卫：offline 单持有效签名 ⇒ 拒·订单滞 created·桶零入账；online 回归零变化 ══
  await pool!.query(`INSERT INTO payment_order(id, owner_user_id, product_id, amount_cents, units, status, channel)
    VALUES ('s2-ord-offline',$1,'pack_10',9900,10,'created','offline'),
           ('s2-ord-online',$1,'pack_10',9900,10,'created','online')`, [REC]);
  // (a) 函数级：CAS choke 单点——offline 单 markOrderPaidAndCredit → conflict·订单滞 created·零桶入账
  const offCas = await asPrincipal(pool!, REC, (c) => markOrderPaidAndCredit(c, REC, 's2-ord-offline', 's2-txn-off-1'));
  const offRow = await pool!.query(`SELECT status FROM payment_order WHERE id='s2-ord-offline'`);
  A('判据5 offline 单 CAS 拒（conflict·订单滞 created·S2-C8 choke 单点）', offCas === 'conflict' && offRow.rows[0]?.status === 'created');
  // (b) webhook 级：真实 CommerceService.payWebhook + 有效 HMAC 签名 ⇒ 409 order_conflict·桶零入账
  let threw5: unknown;
  try { await commerce.payWebhook('s2-ord-offline', { providerTxn: 's2-txn-off-2', sig: paySig('s2-ord-offline:s2-txn-off-2:paid') }); } catch (e) { threw5 = e; }
  const e5 = errOf(threw5);
  const offBuckets = await pool!.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='paid'`, [REC]);
  A('判据5b offline 单持有效签名直调 payWebhook ⇒ 409 拒·订单滞 created·桶零入账',
    e5.status === 409 && e5.error === 'order_conflict' && offRow.rows[0]?.status === 'created' && offBuckets.rows[0]?.n === 0);
  // (c) online 回归：同签名面 credited（C 端零行为变化）
  const onWeb = await commerce.payWebhook('s2-ord-online', { providerTxn: 's2-txn-on-1', sig: paySig('s2-ord-online:s2-txn-on-1:paid') });
  const onRow = await pool!.query(`SELECT status FROM payment_order WHERE id='s2-ord-online'`);
  const onBuckets = await pool!.query(`SELECT units_total FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='paid'`, [REC]);
  A('判据5c online 单回归零变化（webhook credited·订单 paid·paid 桶入账 10u）',
    (onWeb as { result?: string }).result === 'credited' && onRow.rows[0]?.status === 'paid' && Number(onBuckets.rows[0]?.units_total) === 10);

  // ══ 判据6 B 端 abandon 泄漏回归（rev2-R5）：企业桶回补 ∧ 消费行 released ∧ 候选人桶零变 ∧ sweeper 下拍零扫 ══
  const app6 = await seedApplication(REC);
  await pool!.query(`UPDATE entitlement_bucket SET units_total = units_total + 1.00 WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]); // avail→1.00
  const start6 = await applications.start(CAND, app6, { resumeId: RESUME } as any);
  const iv6 = (start6 as { interviewId: string }).interviewId;
  const before6 = await recBucket();
  A('判据6 预置：绑企预留在位（reserved 含 iv6 预留 ≥1.00）', before6.reserved >= 1);
  const abandoned = await interviews.abandon(CAND, iv6);
  const afterAbandon = await recBucket();
  const cons6 = await pool!.query(`SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2`, [CAND, iv6]);
  const sweep6 = await asPrincipal(pool!, CAND, (c) => sweepExpiredReservations(c, CAND));
  A('判据6a abandon 释放路由：interview.service:526 面 ⇒ 企业桶 units_reserved 回补（interview-service 真 abandon·S2-C3 同步改兑现）',
    abandoned.abandoned === true && abandoned.released === 'released' && afterAbandon.reserved === before6.reserved - 1);
  A('判据6b 消费行 released ∧ 候选人桶零变 ∧ sweeper 下拍零扫（四断言·R5 全 face）',
    cons6.rows[0]?.status === 'released' && (await candBucket()) === 0 && sweep6.released === 0);

  // ══ C 端零触哨兵（§2.3·S2-C3 五调用点同构面）：C 端 reserveEntitlement 原函数在本库仍按 owner 本人桶工作 ══
  await pool!.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2.00, now()+interval '365 days')`, [CAND]);
  const cSideConsumed = await pool!.query(`SELECT coalesce(sum(units_consumed),0)::numeric AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='paid'`, [CAND]);
  A('哨兵 C 端个人桶在位（paid 2.00·reserveEntitlement 路径零触由 neg:interview/:262-264 回归背书）',
    Number(cSideConsumed.rows[0]?.n) === 0);

  await done();
}

main()
  .catch(async (e: unknown) => {
    console.error('ENTPAY-S2-PROOF-ABORT（prove 红=停手上报协调方·Ban retry-to-green）', e);
    process.exit(1);
  })
  .then(async () => {
    try { await pool?.end(); } catch { /* ignore */ }
  });
