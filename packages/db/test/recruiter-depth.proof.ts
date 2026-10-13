/**
 * recruiter:prove — 真 PostgreSQL/RLS 证明 C→B P0 绑定闭环。
 * 重点不是“候选人本人有一个高分 interview”，而是 application 只能绑定其原子创建的
 * 同人/同岗位/同简历会话；普通历史训练不能替换。评分合同未校准时，
 * 完成只能进入 scoreless 的人工复核终态，绝不能回填 B 端排名分数。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  createPool, asPrincipal, inviteCandidate, listMyApplications, startApplicationInterview,
  declineInvitation, finalizeApplication, listJobCandidates, listTalentPool, getJob,
  assertIsolatedTestTarget, reserveEntitlement, completeInterviewAndConfirm, failInterviewAndRelease,
  markApplicationAssessmentUnavailable, markApplicationNoEligibleScore, appendEvent,
  createJob, updateJob, closeJob, getJobRouteStatus, retryJobRoute,
  applyToJob, listNextJobRoutePending, classifyJobRoute,
} from '../src/index.ts';

// I3 JOB-MGMT（§2-3·mock seam 零外呼）：classifyJobRoute 输入 HMAC 密钥（沿 job-route-decision.proof 同款非生产键）。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY = 'rag03-job-route-input-hmac-proof-key-not-production-01';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const TAG = 'rdep_' + Math.random().toString(36).slice(2, 8);
const recA = `${TAG}_recA`, recB = `${TAG}_recB`, cand = `${TAG}_cand`, cand2 = `${TAG}_cand2`, cand3 = `${TAG}_cand3`, cand4 = `${TAG}_cand4`, cand5 = `${TAG}_cand5`, cand6 = `${TAG}_cand6`;
const jobA = `job_${TAG}_A`, jobB = `job_${TAG}_B`, historicIv = `iv_hist_${TAG}`;
// I3 JOB-MGMT：createJob 自生成 id（newEntityId('job')）——夹具句柄用返回值（jobC/jobD 常量不存在对应行）。
let jobCId = '', jobDId = '';
const resumeCand = randomUUID(), resumeCand2 = randomUUID(), resumeCand3 = randomUUID(), resumeCand4 = randomUUID(), resumeCand5 = randomUUID(), resumeCand6 = randomUUID();
const createdInterviewIds = new Set<string>([historicIv]);

async function setup() {
  // This proof deliberately relies on the migration-built schema.  Executing
  // the historical raw SQL here would bypass later invariants (0046) and makes
  // a proof target able to mutate an operator's database.
  await assertIsolatedTestTarget(pool);
  await pool.query("INSERT INTO job_posting(id,owner_user_id,title,description,competencies,status) VALUES ($1,$2,'后端工程师','',$3,'open')", [jobA, recA, JSON.stringify(['高并发', '分布式锁', '限流'])]);
  await pool.query("INSERT INTO job_posting(id,owner_user_id,title,competencies,status) VALUES ($1,$2,'前端工程师',$3,'open')", [jobB, recB, JSON.stringify(['React'])]);
  // REG-FIX 组7(深层围栏随演·首层 0126 围栏之下的 R2 P-START 真拒启面):startApplicationInterview 要求岗位已
  // 有 route_decided 决策(0104 形:job_semantic_revision + job_route_decision·单叶 10000bps/conf≥7000/
  // margin≥1000/零 reason_codes·decision_hash hex64)。种子以 owner 身份过 FORCE RLS(tryRawDecided 先例形);
  // jobA 全部 application 共用·jobB 无 application 零需。断言语义零改·围栏零弱化(fixture 供决定非绕门)。
  await asPrincipal(pool, recA, async (c) => {
    await c.query(
      "INSERT INTO job_semantic_revision(job_id,owner_user_id,revision,semantic_digest,input_hmac,status) VALUES ($1,$2,1,$3,$4,'route_decided')",
      [jobA, recA, (randomUUID() + randomUUID()).replace(/-/g, '').slice(0, 64), (randomUUID() + randomUUID()).replace(/-/g, '').slice(0, 64)],
    );
    await c.query(
      `INSERT INTO job_route_decision(id,job_id,owner_user_id,revision,route_outcome,attempt_outcome,taxonomy_version,policy_version,allocations,confidence_bps,margin_bps,reason_codes,decision_hash)
       VALUES ($1,$2,$3,1,'route_decided','result_validated','v1','calibration-2026-08-frozen:v1',$4::jsonb,10000,1000,'{}',$5)`,
      [`rd_${jobA}`, jobA, recA, JSON.stringify([{ leafTrackId: 'backend/nodejs', allocationBps: 10000 }]), 'ab'.repeat(32)],
    );
  });
  for (const [id, owner] of [[resumeCand, cand], [resumeCand2, cand2], [resumeCand3, cand3], [resumeCand4, cand4], [resumeCand5, cand5], [resumeCand6, cand6]] as const) {
    await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [id, owner, `${TAG}:${owner}`]);
  }
  // 历史普通练习刻意高分：它属于 cand，但没有 application/job/resume binding。
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'completed')", [historicIv, cand]);
  // 事件触发器会验证当前 principal（主体）与 stream owner（流所有者）；fixture
  // 也必须走真实候选人的低权路径，不能由管理员连接绕过正在验证的隐私边界。
  await asPrincipal(pool, cand, (c) => c.query(
    "INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,1,'answer_evaluated',$3)",
    // REG-FIX 组7:历史练习事件 payload 围栏合规化——0126 enforce_interview_event_no_raw_answer(payload 存在
    // `answer` 键即 RAISE)落地后 fixture 未随演;raw 答文摘除改 hash 形(同 completeBound 在用形),score 99
    // 语义保留·下游断言零引用 raw 文本。
    [cand, historicIv, JSON.stringify({ questionId: `proof-${historicIv}`, stateVersion: 1, answerId: randomUUID(), answerHash: 'd'.repeat(64), competency: '并发', score: 99 })],
  ));
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2.0,now()+interval '300 days')", [cand4]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2.0,now()+interval '300 days')", [cand5]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2.0,now()+interval '300 days')", [cand6]);
  // I4 #221/#223:0165/0166 受控函数族函数内复核 active+approved recruiter(0155)——recA/recB 须为
  // 实体 approved 招聘方(③/④ 节 listJobCandidates/listTalentPool 富化即触发函数门);cand 带 email
  // 供 #223 识别列断言;pendRec=pending 供 ⑧ DB 纵深门负探针。neg-bend :46 同款 fixture 直插法。
  await pool.query(
    "INSERT INTO user_account(id,email,password_hash,role,approval_status) VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','recruiter','approved'),($5,$6,'x','recruiter','pending'),($7,$8,'x','candidate','approved')",
    [recA, `${TAG}-recA@x.com`, recB, `${TAG}-recB@x.com`, `${TAG}_pendRec`, `${TAG}-pend@x.com`, cand, `${TAG}-cand@x.com`],
  );
}

async function completeBound(candidate: string, interviewId: string, score: number) {
  await asPrincipal(pool, candidate, async (c) => {
    await c.query("INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,1,'answer_evaluated',$3)", [candidate, interviewId, JSON.stringify({ questionId: `proof-${interviewId}`, stateVersion: 1, answerId: randomUUID(), answerHash: 'a'.repeat(64), competency: '并发', score })]);
    await c.query("UPDATE interview SET status='completed',version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='created'", [interviewId, candidate]);
  });
}

async function main() {
  await setup();
  section('① application→interview 原子一对一绑定 + 并发重试');
  const inv = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand));
  A('招聘方 A 邀请候选人 → application', !!inv?.applicationId);
  const appId = inv!.applicationId;
  A('候选人侧初态 invited', (await asPrincipal(pool, cand, (c) => listMyApplications(c, cand))).find((x) => x.id === appId)?.status === 'invited');
  const starts = await Promise.all(Array.from({ length: 20 }, () => asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, appId, resumeCand))));
  const boundId = (starts.find((x) => x.status === 'started' || x.status === 'reused') as any)?.interviewId as string;
  createdInterviewIds.add(boundId);
  A('20 路并发 start → 全部返回同一受信 interviewId', !!boundId && starts.every((x: any) => (x.status === 'started' || x.status === 'reused') && x.interviewId === boundId));
  const binding = (await pool.query('SELECT ja.status,ja.interview_id,ja.resume_id,i.application_id,i.job_id,i.resume_id AS iv_resume,i.owner_user_id FROM job_application ja JOIN interview i ON i.id=ja.interview_id WHERE ja.id=$1', [appId])).rows[0];
  A('DB 四元绑定完整(application/job/resume/candidate)', binding?.status === 'in_progress' && binding?.interview_id === boundId && binding?.resume_id === resumeCand && binding?.application_id === appId && binding?.job_id === jobA && binding?.iv_resume === resumeCand && binding?.owner_user_id === cand);
  A('每 application 恰一 interview', (await pool.query('SELECT count(*)::int n FROM interview WHERE application_id=$1', [appId])).rows[0].n === 1);

  section('② 旧 C 端历史训练不能替换绑定，DB trigger 直接拦截');
  let historicalRebindRejected = false;
  try { await asPrincipal(pool, cand, (c) => c.query('UPDATE interview SET application_id=$2,job_id=$3,resume_id=$4 WHERE id=$1', [historicIv, appId, jobA, resumeCand])); } catch { historicalRebindRejected = true; }
  A('直接把历史普通 interview 改绑为岗位会话 → DB 拒绝', historicalRebindRejected);
  let applicationSwapRejected = false;
  try { await asPrincipal(pool, cand, (c) => c.query('UPDATE job_application SET interview_id=$2 WHERE id=$1', [appId, historicIv])); } catch { applicationSwapRejected = true; }
  A('直接把 application 指向历史 interview → DB 拒绝', applicationSwapRejected);
  A('未完成的绑定会话无法 finalize，即使存在本人历史 99 分', await asPrincipal(pool, cand, (c) => finalizeApplication(c, cand, appId)) === 'not_ready');

  section('③ 完成的绑定会话进入人工复核，不生成 B 端数值评分');
  await completeBound(cand, boundId, 78);
  A('完成 trigger 自动收口为 assessment_unavailable、score=NULL', (await pool.query('SELECT status,score FROM job_application WHERE id=$1', [appId])).rows[0]?.status === 'assessment_unavailable' && (await pool.query('SELECT score FROM job_application WHERE id=$1', [appId])).rows[0]?.score === null);
  A('浏览器 finalize 返回显式 scoreless outcome', await asPrincipal(pool, cand, (c) => finalizeApplication(c, cand, appId)) === 'assessment_unavailable');
  A('招聘方读取边界不返回历史或实时数值评分', (await asPrincipal(pool, recA, (c) => listJobCandidates(c, recA, jobA))).find((x) => x.candidate_user_id === cand)?.score === null);
  let completedAttemptMutationRejected = false;
  try { await asPrincipal(pool, cand, (c) => c.query('UPDATE job_application SET interview_attempt=99 WHERE id=$1', [appId])); } catch { completedAttemptMutationRejected = true; }
  A('scoreless application 的 attempt 不可被单列篡改', completedAttemptMutationRejected);

  section('③a 已确认扣费的完成事务同样不得自动形成 B 端分数（报告子图与此解耦）');
  const paid = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand4));
  const paidStart = await asPrincipal(pool, cand4, (c) => startApplicationInterview(c, cand4, paid!.applicationId, resumeCand4)) as any;
  createdInterviewIds.add(paidStart.interviewId);
  await asPrincipal(pool, cand4, async (c) => {
    await reserveEntitlement(c, cand4, paidStart.interviewId, 'mock_interview', 1.0);
    await appendEvent(c, cand4, paidStart.interviewId, 'answer_evaluated', { questionId: `proof-${paidStart.interviewId}`, stateVersion: 1, answerId: randomUUID(), answerHash: 'b'.repeat(64), competency: '并发', score: 82 });
    await completeInterviewAndConfirm(c, cand4, paidStart.interviewId);
  });
  const paidState = (await pool.query('SELECT status,score FROM job_application WHERE id=$1', [paid!.applicationId])).rows[0];
  A('确认消费 + interview completed 的同一事务进入复核终态、score=NULL', paidState?.status === 'assessment_unavailable' && paidState?.score === null);
  A('报告失败/不可用不会让 finalize 伪造数值评分', await asPrincipal(pool, cand4, (c) => finalizeApplication(c, cand4, paid!.applicationId)) === 'assessment_unavailable');

  // 第二条完成样本用于真实筛选/排序；第三条保留 invited 作为反例。
  const inv3 = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand3));
  const s3 = await asPrincipal(pool, cand3, (c) => startApplicationInterview(c, cand3, inv3!.applicationId, resumeCand3)) as any;
  createdInterviewIds.add(s3.interviewId);
  await completeBound(cand3, s3.interviewId, 55);
  const inv2 = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand2));
  A('重复邀请已复核候选人返回真实 assessment_unavailable', (await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand)))?.status === 'assessment_unavailable');

  section('④ RLS 最小化视图、筛选、跨租户隔离');
  const candsA = await asPrincipal(pool, recA, (c) => listJobCandidates(c, recA, jobA));
  A('招聘方看到 4 条申请且只有状态/分数摘要', candsA.length === 4 && candsA.find((x) => x.candidate_user_id === cand)?.source === 'invited');
  A('招聘方读候选人 interview = 0 行', await asPrincipal(pool, recA, (c) => c.query('SELECT id FROM interview WHERE id=$1', [boundId]).then((r) => r.rowCount)) === 0);
  A('招聘方读候选人作答事件 = 0 行', await asPrincipal(pool, recA, (c) => c.query('SELECT id FROM interview_event WHERE owner_user_id=$1', [cand]).then((r) => r.rowCount)) === 0);
  const reviewOnly = await asPrincipal(pool, recA, (c) => listTalentPool(c, recA, { status: 'assessment_unavailable' }));
  A('已完成会话只以 assessment_unavailable 进入人才库，无 invited 反例', reviewOnly.length === 3 && reviewOnly.every((x) => x.status === 'assessment_unavailable') && !reviewOnly.some((x) => x.candidate_user_id === cand2));
  A('人才库返回的 score 一律为 NULL，不能成为招聘排序依据', reviewOnly.every((x) => x.score === null));
  A('招聘方 B 人才库无 A 的候选人', !(await asPrincipal(pool, recB, (c) => listTalentPool(c, recB))).some((x) => x.candidate_user_id === cand));
  A('招聘方 B 读 A 的岗位为 null', await asPrincipal(pool, recB, (c) => getJob(c, recB, jobA)) === null);

  section('⑤ declined 终态、缺简历与 who-pays');
  const missing = await asPrincipal(pool, cand2, (c) => startApplicationInterview(c, cand2, inv2!.applicationId, randomUUID()));
  A('非 ingested/不存在 resume → resume_not_ready 且 application 不变', missing.status === 'resume_not_ready'
    && (await pool.query('SELECT status,interview_id FROM job_application WHERE id=$1', [inv2!.applicationId])).rows[0]?.status === 'invited');
  A('declined 终态不可启动', await asPrincipal(pool, cand2, (c) => declineInvitation(c, cand2, inv2!.applicationId)) === true
    && (await asPrincipal(pool, cand2, (c) => startApplicationInterview(c, cand2, inv2!.applicationId, resumeCand2))).status === 'noop');
  const recConsumption = await pool.query('SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id IN ($1,$2)', [recA, recB]);
  A('邀请/绑定不产生招聘方 entitlement 消费', recConsumption.rows[0].n === 0);

  section('⑥ 无可信评分：释放额度 → B 端可恢复终态 → 新 attempt 围栏');
  const inv4 = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand5));
  const s4 = await asPrincipal(pool, cand5, (c) => startApplicationInterview(c, cand5, inv4!.applicationId, resumeCand5)) as any;
  createdInterviewIds.add(s4.interviewId);
  let failedReservedRejected = false;
  await asPrincipal(pool, cand5, async (c) => {
    const reserved = await reserveEntitlement(c, cand5, s4.interviewId, 'interview', 1);
    if (reserved.status !== 'reserved') throw new Error(`expected_reserved:${reserved.status}`);
  });
  // A PostgreSQL constraint error aborts its transaction by design.  Keep the
  // deliberate hostile write in its own transaction so the next transaction
  // can prove the normal compensating path still releases the same reserve.
  try { await asPrincipal(pool, cand5, (c) => c.query("UPDATE interview SET status='failed' WHERE id=$1", [s4.interviewId])); } catch { failedReservedRejected = true; }
  await asPrincipal(pool, cand5, async (c) => {
    await failInterviewAndRelease(c, cand5, s4.interviewId);
    const marked = await markApplicationAssessmentUnavailable(c, cand5, s4.interviewId);
    if (marked !== 'updated') throw new Error(`assessment_unavailable_application_not_marked:${marked}`);
    await appendEvent(c, cand5, s4.interviewId, 'assessment_unavailable', { reason: 'proof_unscored' }, 'assessment_unavailable:proof_unscored');
  });
  const unavailable = (await pool.query('SELECT status,score,interview_id,interview_attempt FROM job_application WHERE id=$1', [inv4!.applicationId])).rows[0];
  A('评分缺证据 → application=assessment_unavailable、score=NULL、attempt=1', unavailable?.status === 'assessment_unavailable' && unavailable?.score === null && unavailable?.interview_id === s4.interviewId && Number(unavailable?.interview_attempt) === 1);
  A('失败面试额度只释放一次', (await pool.query("SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2", [cand5, s4.interviewId])).rows[0]?.status === 'released');
  A('0046 terminal-pair 在 DB 层阻止任何 failed+reserved 写入', failedReservedRejected);
  A('finalize 返回显式 scoreless outcome（绝不伪造 0 分）', await asPrincipal(pool, cand5, (c) => finalizeApplication(c, cand5, inv4!.applicationId)) === 'assessment_unavailable');
  let attemptMutationRejected = false;
  try { await asPrincipal(pool, cand5, (c) => c.query('UPDATE interview SET application_attempt=99 WHERE id=$1', [s4.interviewId])); } catch { attemptMutationRejected = true; }
  A('旧 attempt 编号不可篡改（触发器覆盖 application_attempt）', attemptMutationRejected);
  let staleRecoveryRejected = false;
  try { await asPrincipal(pool, cand5, (c) => c.query("UPDATE job_application SET status='in_progress' WHERE id=$1", [inv4!.applicationId])); } catch { staleRecoveryRejected = true; }
  A('旧 failed attempt 不可被直接复活为 in_progress', staleRecoveryRejected);
  let unavailableAttemptMutationRejected = false;
  try { await asPrincipal(pool, cand5, (c) => c.query('UPDATE job_application SET interview_attempt=99 WHERE id=$1', [inv4!.applicationId])); } catch { unavailableAttemptMutationRejected = true; }
  A('assessment_unavailable 的 attempt 不可被单列篡改', unavailableAttemptMutationRejected);
  const retries = await Promise.all(Array.from({ length: 20 }, () => asPrincipal(pool, cand5, (c) => startApplicationInterview(c, cand5, inv4!.applicationId, resumeCand5))));
  const retryId = (retries.find((x: any) => x.status === 'started' || x.status === 'reused') as any)?.interviewId;
  createdInterviewIds.add(retryId);
  const retryBinding = (await pool.query('SELECT status,interview_id,interview_attempt,score FROM job_application WHERE id=$1', [inv4!.applicationId])).rows[0];
  A('20 路显式重试只创建一个新 attempt=2，旧失败会话保留', retries.every((x: any) => (x.status === 'started' || x.status === 'reused') && x.interviewId === retryId)
    && retryBinding?.status === 'in_progress' && retryBinding?.interview_id === retryId && Number(retryBinding?.interview_attempt) === 2
    && retryBinding?.score === null && (await pool.query('SELECT count(*)::int n FROM interview WHERE application_id=$1', [inv4!.applicationId])).rows[0]?.n === 2);

  section('⑦ 全部 unresolved 不是伪造 0 分：已完成消费 + B 端 scoreless hold 终态（0082 自动收口·completed 会话 held 不可复活）');
  const noScore = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand6));
  const noScoreStart = await asPrincipal(pool, cand6, (c) => startApplicationInterview(c, cand6, noScore!.applicationId, resumeCand6)) as any;
  createdInterviewIds.add(noScoreStart.interviewId);
  await asPrincipal(pool, cand6, async (c) => {
    await reserveEntitlement(c, cand6, noScoreStart.interviewId, 'mock_interview', 1.0);
    await appendEvent(c, cand6, noScoreStart.interviewId, 'answer_evaluated', { questionId: `proof-${noScoreStart.interviewId}`, stateVersion: 1, answerId: randomUUID(), answerHash: 'c'.repeat(64), competency: '并发', score: 0, outcome: 'unresolved' });
    await completeInterviewAndConfirm(c, cand6, noScoreStart.interviewId);
  });
  const beforeNoScoreMark = (await pool.query('SELECT status,score FROM job_application WHERE id=$1', [noScore!.applicationId])).rows[0];
  // 0082 校准 hold(REAL):application 绑定面试 completed 即自动收口 assessment_unavailable+score=NULL
  // (finalize_bound_job_application_on_interview_completion·REPLACE 0051 形——全 unresolved 也不伪造 0 分,
  // 也不把申请错误标 completed;评分合同未校准,完成即 B 端 hold 终态)。
  A('全 unresolved 完成后自动收口 hold 不伪造 0 分，也不把申请错误标 completed', beforeNoScoreMark?.status === 'assessment_unavailable' && beforeNoScoreMark?.score === null);
  // 手动 markApplicationNoEligibleScore 在 0082 自动收口后=幂等 replay(无第二个状态迁移·见下方重放断言);
  // completed 会话随即落入 I2 W1 held 门(拒重试)——重试语义断言见 :2xx no-score 重试面。
  const noScoreState = (await pool.query('SELECT status,score,interview_id,interview_attempt FROM job_application WHERE id=$1', [noScore!.applicationId])).rows[0];
  const noScoreConsumption = (await pool.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [cand6, noScoreStart.interviewId])).rows[0];
  A('无有效评分 → application=assessment_unavailable、score=NULL，旧 completed interview 仍被绑定', noScoreState?.status === 'assessment_unavailable' && noScoreState?.score === null
    && noScoreState?.interview_id === noScoreStart.interviewId && Number(noScoreState?.interview_attempt) === 1);
  A('无有效评分是已完成交互：消费 confirmed，不错误退款', noScoreConsumption?.status === 'confirmed');
  A('no-score 收口只返回 replayed，不追加第二个 application 状态迁移', await asPrincipal(pool, cand6, (c) => markApplicationNoEligibleScore(c, cand6, noScoreStart.interviewId)) === 'replayed');
  const noScoreRetries = await Promise.all(Array.from({ length: 20 }, () => asPrincipal(pool, cand6, (c) => startApplicationInterview(c, cand6, noScore!.applicationId, resumeCand6))));
  const noScoreRetry = (await pool.query('SELECT status,interview_id,interview_attempt,score FROM job_application WHERE id=$1', [noScore!.applicationId])).rows[0];
  // I2 W1 held 门(REAL):绑定面试 completed=hold 终态 → 一律 application_held_not_retryable——completed 的
  // 旧会话不能复活、不创建新 attempt(与 ⑥ failed→恢复 attempt=2 面相对照·两 gate 分码各承)。
  A('20 路 no-score 重试全拒 held，completed 的旧会话不能复活、不创建新 attempt', noScoreRetries.every((x: any) => x.status === 'application_held_not_retryable')
    && noScoreRetry?.status === 'assessment_unavailable' && noScoreRetry?.interview_id === noScoreStart.interviewId && Number(noScoreRetry?.interview_attempt) === 1 && noScoreRetry?.score === null);
  // 0082 校准 hold(REAL):completed 状态写冻结(B 端数值完成在校准合同前不可达)且 score 校准前不可变——
  // 原探针(completed+score 在场→降级 scoreless)前提在 0082 下结构性不可达,按同意图换双探针:
  // ①恢复 completed+score 必拒 ②对 hold 行改写 score 必拒(防 raw SQL 复活 avg-LLM 评分行为)。
  let validScoreRestoreRejected = false;
  try { await asPrincipal(pool, cand4, (c) => c.query("UPDATE job_application SET status='completed',score=82 WHERE id=$1", [paid!.applicationId])); } catch { validScoreRestoreRejected = true; }
  let scoreRewriteRejected = false;
  try { await asPrincipal(pool, cand4, (c) => c.query("UPDATE job_application SET score=82 WHERE id=$1", [paid!.applicationId])); } catch { scoreRewriteRejected = true; }
  A('校准 hold：评分不可伪造——completed 状态写冻结、hold 行 score 校准前不可变', validScoreRestoreRejected && scoreRewriteRejected);

  /* ───────────── I3 JOB-MGMT 三簇断言（§2-1/§2-2/§2-3·零外呼·全 mock seam） ───────────── */

  section('I3 §2-1 updateJob 语义变更→重路由断言（db prove·recruiter-depth 先例形）');
  const created = await asPrincipal(pool, recA, (c) => createJob(c, recA, { title: 'I3 路由岗', description: '初版描述', competencies: ['高并发'] }));
  jobCId = created?.id ?? '';
  A('I3-1a createJob 实回 {id}（契约如实化·非 JobView）', typeof created?.id === 'string' && !(created as unknown as Record<string, unknown>).title);
  const revCount = async (jobId: string) => Number((await pool.query('SELECT COUNT(*)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobId])).rows[0].n);
  const latestStatus = async (jobId: string) => String((await pool.query("SELECT status FROM job_semantic_revision WHERE job_id=$1 ORDER BY revision DESC LIMIT 1", [jobId])).rows[0]?.status ?? '');
  A('I3-1b 建岗即写 revision 1（route_pending）', jobCId !== '' && await revCount(jobCId) === 1 && await latestStatus(jobCId) === 'route_pending');
  const upd = await asPrincipal(pool, recA, (c) => updateJob(c, recA, jobCId, { description: 'I3 语义变更描述' }));
  A('I3-1c updateJob 语义变更 → 新 revision 2（route_pending·recruiter.ts :108 链）', upd?.description === 'I3 语义变更描述' && await revCount(jobCId) === 2 && await latestStatus(jobCId) === 'route_pending');
  const updSame = await asPrincipal(pool, recA, (c) => updateJob(c, recA, jobCId, { title: 'I3 路由岗', description: 'I3 语义变更描述', competencies: ['高并发'] }));
  A('I3-1d unchanged 编辑零 revision（unchanged 短路·基线锚 :101-103）', updSame?.title === 'I3 路由岗' && await revCount(jobCId) === 2);
  const updForeign = await asPrincipal(pool, recB, (c) => updateJob(c, recB, jobCId, { title: '越权改名' }));
  A('I3-1e 他主 updateJob → null（owner 谓词+行锁）', updForeign === null && await revCount(jobCId) === 2);

  section('I3 §2-2 closeJob 三臂断言（#220·语义保持）');
  A('I3-2a 他主 close → false（owner 谓词臂·非空真岗位）', jobCId !== '' && await asPrincipal(pool, recB, (c) => closeJob(c, recB, jobCId)) === false);
  A('I3-2b owner close → true（open→closed 臂）', await asPrincipal(pool, recA, (c) => closeJob(c, recA, jobCId)) === true);
  A('I3-2c closed 再 close → false（rowCount=0 臂·service 映射同 404 壳）', await asPrincipal(pool, recA, (c) => closeJob(c, recA, jobCId)) === false);
  A('I3-2d close 后候选人 apply → null（neg 臂·jobs.service job_not_found_or_closed 404 族 db 缝）',
    await asPrincipal(pool, cand, (c) => applyToJob(c, cand, jobCId)) === null);

  section('I3 §2-3 #219 路由可见+显式重试断言（mock model 拒分/放行·零 LLM 外呼）');
  // 双叶信号（前端+算法 → frontend/web+ai_ml/applied 两命中）→ rule 不唯一 → 强制走模型路径（rule_decided 恒拒本面）。
  const createdD = await asPrincipal(pool, recB, (c) => createJob(c, recB, { title: 'I3 未决岗', description: '多面岗位', competencies: ['前端', '算法'] }));
  jobDId = createdD?.id ?? '';
  A('I3-3a 未决岗位 revision 1 route_pending', jobDId !== '' && await revCount(jobDId) === 1 && await latestStatus(jobDId) === 'route_pending');
  const rejectSeamCalls: number[] = [];
  const rejectSeam = { classify: async () => { rejectSeamCalls.push(1); return { allocations: [], confidenceBps: 0, marginBps: 0, reasonCodes: ['i3_proof_reject'] }; } };
  const unresolved = await classifyJobRoute(pool, recB, jobDId, 1, { modelClassify: rejectSeam.classify });
  A('I3-3b mock 拒分 → route_unresolved/known_not_sent（reasonCodes 落 decision）',
    unresolved.status === 'route_unresolved' && unresolved.attemptOutcome === 'known_not_sent'
    && unresolved.reasonCodes.includes('i3_proof_reject') && rejectSeamCalls.length === 1);
  const routeSeen = await asPrincipal(pool, recB, (c) => getJobRouteStatus(c, recB, jobDId));
  A('I3-3c 招聘方读面可见 route_unresolved+reasonCodes（#219 可见面·最新 revision 视角）',
    routeSeen !== null && routeSeen.status === 'route_unresolved' && routeSeen.revision === 1
    && routeSeen.reasonCodes.includes('i3_proof_reject'));
  // 席2 登记项④落成显式断言：unresolved 后同 revision 重跑仍被 sticky 闸拦死（可失败断言·闸 :181 字节零改的前提）。
  const noopSame = await classifyJobRoute(pool, recB, jobDId, 1, { modelClassify: rejectSeam.classify });
  A('I3-3d 席2④ 显式断言：unresolved 后同 revision classifyJobRoute 仍 noop already_unresolved（sticky 终态语义零改·零二次外发）',
    noopSame.status === 'noop' && noopSame.reason === 'already_unresolved' && rejectSeamCalls.length === 1);
  const retried = await asPrincipal(pool, recB, (c) => retryJobRoute(c, recB, jobDId));
  const rev1Status = String((await pool.query('SELECT status FROM job_semantic_revision WHERE job_id=$1 AND revision=1', [jobDId])).rows[0]?.status ?? '');
  A('I3-3e 显式重试 → 新 revision 2（route_pending·unresolved 旧 revision 原样留存）',
    retried !== null && retried.status === 'retried' && retried.revision === 2 && await revCount(jobDId) === 2
    && await latestStatus(jobDId) === 'route_pending' && rev1Status === 'route_unresolved');
  const retriedAgain = await asPrincipal(pool, recB, (c) => retryJobRoute(c, recB, jobDId));
  A('I3-3f 幂等门：route_pending 再 retry → already_pending（有界·不制造空 revision）',
    retriedAgain !== null && retriedAgain.status === 'already_pending' && retriedAgain.revision === 2 && await revCount(jobDId) === 2);
  const claim = await asPrincipal(pool, recB, (c) => listNextJobRoutePending(c));
  A('I3-3g 既有 drain 认领新 revision（listNextJobRoutePending → jobD rev2·零 consumer 改动）',
    claim !== null && claim.jobId === jobDId && claim.revision === 2);
  const acceptSeam = {
    classify: async () => ({
      allocations: [{ leafTrackId: 'backend/nodejs', allocationBps: 7000 }, { leafTrackId: 'frontend/web', allocationBps: 3000 }],
      confidenceBps: 8500, marginBps: 4000, reasonCodes: [],
    }),
  };
  const decided = await classifyJobRoute(pool, recB, jobDId, 2, { modelClassify: acceptSeam.classify });
  const routeAfter = await asPrincipal(pool, recB, (c) => getJobRouteStatus(c, recB, jobDId));
  A('I3-3h 重试 drain 后状态翻转 route_decided（reasonCodes 清零·招聘方视角）',
    decided.status === 'route_decided' && decided.attemptOutcome === 'result_validated'
    && routeAfter !== null && routeAfter.status === 'route_decided' && routeAfter.revision === 2
    && routeAfter.reasonCodes.length === 0);
  const retryDecided = await asPrincipal(pool, recB, (c) => retryJobRoute(c, recB, jobDId));
  A('I3-3i 已决再 retry → already_decided（无重试必要·零空转 revision）',
    retryDecided !== null && retryDecided.status === 'already_decided' && await revCount(jobDId) === 2);

  section('⑧ I4 #221/#223:通知写侧 gateway 机制臂 + 同意门识别投影(裁决项①/③·db 层直证)');
  // user_account 种子见 setup()(recA/recB approved·pendRec pending·cand candidate)。
  // WITH CHECK 语义证明:招聘方 principal 直插候选人 owned 通知行被拒(14_notification.sql p_owner
  // WITH CHECK+FORCE RLS 零动——写侧必经裁决形通道,禁止绕过)。
  let withCheckRejected = false;
  try { await asPrincipal(pool, recA, (c) => c.query("INSERT INTO notification(id,owner_user_id,kind,payload) VALUES ('ntf_i4_forge',$1,'job_invited','{}')", [cand])); }
  catch { withCheckRejected = true; }
  A('招聘方 principal 直插候选人通知行被拒(WITH CHECK 语义·写侧必经裁决形通道)', withCheckRejected);
  // gateway_notify_invited owner 谓词 fail-closed:非自有申请(recB × recA 的申请)→ 零写零信号。
  await asPrincipal(pool, recB, (c) => c.query('SELECT gateway_notify_invited($1,$2)', [recB, appId]));
  A('通知函数 owner 谓词 fail-closed:非自有申请零写(与不存在不可区分)', (await pool.query('SELECT count(*)::int n FROM notification WHERE id=$1', [`ntf_${appId}`])).rows[0].n === 0);
  // 命中:recA 对自有申请调函数 → 候选人通知行落库(窄接口:kind/payload 固定·id=ntf_<applicationId>)。
  await asPrincipal(pool, recA, (c) => c.query('SELECT gateway_notify_invited($1,$2)', [recA, appId]));
  const invNotif = (await pool.query('SELECT id, owner_user_id, kind, payload FROM notification WHERE id=$1', [`ntf_${appId}`])).rows[0];
  A('通知函数命中:候选人通知行落库(owner=cand·kind=job_invited·id=ntf_<applicationId> 幂等形)', invNotif?.owner_user_id === cand && invNotif?.kind === 'job_invited');
  A('通知 payload 恰 {jobId,jobTitle} 最小集(键集=2·零 PII 扩散·§5 Ban)', invNotif?.payload?.jobId === jobA && invNotif?.payload?.jobTitle === '后端工程师' && Object.keys(invNotif?.payload ?? {}).length === 2);
  // 幂等:重邀请/幂等复用 → 通知零堆积。
  await asPrincipal(pool, recA, (c) => c.query('SELECT gateway_notify_invited($1,$2)', [recA, appId]));
  A('幂等重调:通知行零堆积(ON CONFLICT (id) DO NOTHING·ntf_<applicationId> 形)', (await pool.query('SELECT count(*)::int n FROM notification WHERE id=$1', [`ntf_${appId}`])).rows[0].n === 1);
  // DB 纵深:pending recruiter 直调通知函数 → gateway_recruiter_required(0155 审批维度·fail-closed 只增不弱)。
  let pendRejected = false;
  try { await asPrincipal(pool, `${TAG}_pendRec`, (c) => c.query('SELECT gateway_notify_invited($1,$2)', [`${TAG}_pendRec`, appId])); }
  catch (e) { pendRejected = String(e).includes('gateway_recruiter_required'); }
  A('pending recruiter 直调通知函数→gateway_recruiter_required(neg-bend :421 同款 DB 门)', pendRejected);
  // #223 识别投影(0166 gateway_recruiter_contact_share):无同意 → 恰零出参(fail-closed·0160 同意门同形)。
  const shareIds = [appId, inv3!.applicationId];
  const preShare = await asPrincipal(pool, recA, (c) => c.query('SELECT application_id, email FROM gateway_recruiter_contact_share($1,$2)', [recA, shareIds]));
  A('识别投影无同意→零出参(fail-closed:无 recruiter_contact_share 同意行的候选人不披露)', preShare.rows.length === 0);
  // cand 同意 recruiter_contact_share → 恰同意行出邮箱;未同意的 inv3(cand3)仍零出参;跨租户 recB 恒零出参。
  await asPrincipal(pool, cand, (c) => c.query("INSERT INTO consent_record(id,owner_user_id,purpose,policy_version) VALUES ($1,$2,'recruiter_contact_share','v1')", [`cr_${TAG}`, cand]));
  const share = await asPrincipal(pool, recA, (c) => c.query('SELECT application_id, email FROM gateway_recruiter_contact_share($1,$2)', [recA, shareIds]));
  A('识别投影同意后→恰同意行出候选人邮箱(inv3/cand3 未同意仍零出参)', share.rows.length === 1 && share.rows[0]?.application_id === appId && share.rows[0]?.email === `${TAG}-cand@x.com`);
  const shareX = await asPrincipal(pool, recB, (c) => c.query('SELECT application_id, email FROM gateway_recruiter_contact_share($1,$2)', [recB, shareIds]));
  A('识别投影 owner 谓词 fail-closed:跨租户 recruiter 恒零出参', shareX.rows.length === 0);

  console.log(`\n${failures === 0 ? '✓ recruiter:prove 全部通过' : '✗ ' + failures + ' 失败'}（application-bound interview + RLS + 自动回填）`);
}

async function cleanup() {
  await pool.query('DELETE FROM interview_event WHERE stream_key = ANY($1::text[])', [[...createdInterviewIds]]);
  await pool.query('DELETE FROM interview WHERE id = ANY($1::text[])', [[...createdInterviewIds]]);
  await pool.query('DELETE FROM job_application WHERE job_id IN ($1,$2)', [jobA, jobB]);
  // I3 JOB-MGMT：路由面夹具清理（revision 无 job_posting FK·显式删；决策/事件随 (job_id) 域删）。
  if (jobCId && jobDId) {
    await pool.query('DELETE FROM job_route_event WHERE job_id IN ($1,$2)', [jobCId, jobDId]);
    await pool.query('DELETE FROM job_route_decision WHERE job_id IN ($1,$2)', [jobCId, jobDId]);
    await pool.query('DELETE FROM job_semantic_revision WHERE job_id IN ($1,$2)', [jobCId, jobDId]);
  }
  await pool.query('DELETE FROM job_posting WHERE id = ANY($1::text[])', [[jobA, jobB, jobCId, jobDId].filter(Boolean)]);
  await pool.query('DELETE FROM notification WHERE owner_user_id = ANY($1::text[])', [[cand]]);
  await pool.query('DELETE FROM consent_record WHERE id = $1', [`cr_${TAG}`]);
  await pool.query('DELETE FROM user_account WHERE id = ANY($1::text[])', [[recA, recB, `${TAG}_pendRec`, cand]]);
  await pool.query('DELETE FROM entitlement_consumption WHERE owner_user_id IN ($1,$2,$3)', [cand4, cand5, cand6]);
  await pool.query('DELETE FROM entitlement_bucket WHERE owner_user_id IN ($1,$2,$3)', [cand4, cand5, cand6]);
  await pool.query('DELETE FROM resume WHERE id = ANY($1::uuid[])', [[resumeCand, resumeCand2, resumeCand3, resumeCand4, resumeCand5, resumeCand6]]);
}

main().catch((e) => { console.error(e); failures++; }).finally(async () => {
  try { await cleanup(); } catch (e) { console.error('cleanup failed:', e); }
  await pool.end(); process.exit(failures === 0 ? 0 : 1);
});
