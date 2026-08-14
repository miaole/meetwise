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
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const TAG = 'rdep_' + Math.random().toString(36).slice(2, 8);
const recA = `${TAG}_recA`, recB = `${TAG}_recB`, cand = `${TAG}_cand`, cand2 = `${TAG}_cand2`, cand3 = `${TAG}_cand3`, cand4 = `${TAG}_cand4`, cand5 = `${TAG}_cand5`, cand6 = `${TAG}_cand6`;
const jobA = `job_${TAG}_A`, jobB = `job_${TAG}_B`, historicIv = `iv_hist_${TAG}`;
const resumeCand = randomUUID(), resumeCand2 = randomUUID(), resumeCand3 = randomUUID(), resumeCand4 = randomUUID(), resumeCand5 = randomUUID(), resumeCand6 = randomUUID();
const createdInterviewIds = new Set<string>([historicIv]);

async function setup() {
  // This proof deliberately relies on the migration-built schema.  Executing
  // the historical raw SQL here would bypass later invariants (0046) and makes
  // a proof target able to mutate an operator's database.
  await assertIsolatedTestTarget(pool);
  await pool.query("INSERT INTO job_posting(id,owner_user_id,title,description,competencies,status) VALUES ($1,$2,'后端工程师','',$3,'open')", [jobA, recA, JSON.stringify(['高并发', '分布式锁', '限流'])]);
  await pool.query("INSERT INTO job_posting(id,owner_user_id,title,competencies,status) VALUES ($1,$2,'前端工程师',$3,'open')", [jobB, recB, JSON.stringify(['React'])]);
  for (const [id, owner] of [[resumeCand, cand], [resumeCand2, cand2], [resumeCand3, cand3], [resumeCand4, cand4], [resumeCand5, cand5], [resumeCand6, cand6]] as const) {
    await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [id, owner, `${TAG}:${owner}`]);
  }
  // 历史普通练习刻意高分：它属于 cand，但没有 application/job/resume binding。
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'completed')", [historicIv, cand]);
  // 事件触发器会验证当前 principal（主体）与 stream owner（流所有者）；fixture
  // 也必须走真实候选人的低权路径，不能由管理员连接绕过正在验证的隐私边界。
  await asPrincipal(pool, cand, (c) => c.query(
    "INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,1,'answer_evaluated',$3)",
    [cand, historicIv, JSON.stringify({ answer: '历史 C 端私密作答', score: 99 })],
  ));
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2.0,now()+interval '300 days')", [cand4]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2.0,now()+interval '300 days')", [cand5]);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',2.0,now()+interval '300 days')", [cand6]);
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

  section('⑦ 全部 unresolved 不是伪造 0 分：已完成消费 + B 端 scoreless 终态 + 下一 attempt');
  const noScore = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand6));
  const noScoreStart = await asPrincipal(pool, cand6, (c) => startApplicationInterview(c, cand6, noScore!.applicationId, resumeCand6)) as any;
  createdInterviewIds.add(noScoreStart.interviewId);
  await asPrincipal(pool, cand6, async (c) => {
    await reserveEntitlement(c, cand6, noScoreStart.interviewId, 'mock_interview', 1.0);
    await appendEvent(c, cand6, noScoreStart.interviewId, 'answer_evaluated', { questionId: `proof-${noScoreStart.interviewId}`, stateVersion: 1, answerId: randomUUID(), answerHash: 'c'.repeat(64), competency: '并发', score: 0, outcome: 'unresolved' });
    await completeInterviewAndConfirm(c, cand6, noScoreStart.interviewId);
  });
  const beforeNoScoreMark = (await pool.query('SELECT status,score FROM job_application WHERE id=$1', [noScore!.applicationId])).rows[0];
  A('全 unresolved 完成后自动回填不伪造 0 分，也不把申请错误标 completed', beforeNoScoreMark?.status === 'in_progress' && beforeNoScoreMark?.score === null);
  await asPrincipal(pool, cand6, async (c) => {
    const marked = await markApplicationNoEligibleScore(c, cand6, noScoreStart.interviewId);
    if (marked !== 'updated') throw new Error(`no_eligible_score_application_not_marked:${marked}`);
    await appendEvent(c, cand6, noScoreStart.interviewId, 'assessment_unavailable', { reason: 'no_eligible_scored_answer' }, 'assessment_unavailable:no_eligible_scored_answer');
  });
  const noScoreState = (await pool.query('SELECT status,score,interview_id,interview_attempt FROM job_application WHERE id=$1', [noScore!.applicationId])).rows[0];
  const noScoreConsumption = (await pool.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [cand6, noScoreStart.interviewId])).rows[0];
  A('无有效评分 → application=assessment_unavailable、score=NULL，旧 completed interview 仍被绑定', noScoreState?.status === 'assessment_unavailable' && noScoreState?.score === null
    && noScoreState?.interview_id === noScoreStart.interviewId && Number(noScoreState?.interview_attempt) === 1);
  A('无有效评分是已完成交互：消费 confirmed，不错误退款', noScoreConsumption?.status === 'confirmed');
  A('重放 no-score 收口只返回 replayed，不追加第二个 application 状态迁移', await asPrincipal(pool, cand6, (c) => markApplicationNoEligibleScore(c, cand6, noScoreStart.interviewId)) === 'replayed');
  const noScoreRetries = await Promise.all(Array.from({ length: 20 }, () => asPrincipal(pool, cand6, (c) => startApplicationInterview(c, cand6, noScore!.applicationId, resumeCand6))));
  const noScoreRetryId = (noScoreRetries.find((x: any) => x.status === 'started' || x.status === 'reused') as any)?.interviewId;
  createdInterviewIds.add(noScoreRetryId);
  const noScoreRetry = (await pool.query('SELECT status,interview_id,interview_attempt,score FROM job_application WHERE id=$1', [noScore!.applicationId])).rows[0];
  A('20 路 no-score 重试只创建 attempt=2，completed 的旧会话不能复活', noScoreRetries.every((x: any) => (x.status === 'started' || x.status === 'reused') && x.interviewId === noScoreRetryId)
    && noScoreRetry?.status === 'in_progress' && noScoreRetry?.interview_id === noScoreRetryId && Number(noScoreRetry?.interview_attempt) === 2 && noScoreRetry?.score === null);
  let validScoreDowngradeRejected = false;
  try { await asPrincipal(pool, cand4, (c) => c.query("UPDATE job_application SET status='assessment_unavailable',score=NULL WHERE id=$1", [paid!.applicationId])); } catch { validScoreDowngradeRejected = true; }
  A('有合格评分的已完成申请不能被直接降级为 scoreless', validScoreDowngradeRejected);

  console.log(`\n${failures === 0 ? '✓ recruiter:prove 全部通过' : '✗ ' + failures + ' 失败'}（application-bound interview + RLS + 自动回填）`);
}

async function cleanup() {
  await pool.query('DELETE FROM interview_event WHERE stream_key = ANY($1::text[])', [[...createdInterviewIds]]);
  await pool.query('DELETE FROM interview WHERE id = ANY($1::text[])', [[...createdInterviewIds]]);
  await pool.query('DELETE FROM job_application WHERE job_id IN ($1,$2)', [jobA, jobB]);
  await pool.query('DELETE FROM job_posting WHERE id IN ($1,$2)', [jobA, jobB]);
  await pool.query('DELETE FROM entitlement_consumption WHERE owner_user_id IN ($1,$2,$3)', [cand4, cand5, cand6]);
  await pool.query('DELETE FROM entitlement_bucket WHERE owner_user_id IN ($1,$2,$3)', [cand4, cand5, cand6]);
  await pool.query('DELETE FROM resume WHERE id = ANY($1::uuid[])', [[resumeCand, resumeCand2, resumeCand3, resumeCand4, resumeCand5, resumeCand6]]);
}

main().catch((e) => { console.error(e); failures++; }).finally(async () => {
  try { await cleanup(); } catch (e) { console.error('cleanup failed:', e); }
  await pool.end(); process.exit(failures === 0 ? 0 : 1);
});
