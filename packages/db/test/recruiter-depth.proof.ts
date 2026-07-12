/**
 * recruiter:prove — B 端企业纵深证明(对真 Postgres):招聘方邀请候选人面试 + 人才库,严格多方/多租户 RLS。
 * 承重证明:
 *   ① 邀请闭环:招聘方邀请 → 候选人(同一引擎)面试 → 分数回填 → 招聘方见状态/分数。
 *   ② 状态机 CAS:invited → in_progress → completed,陈旧/非法迁移落败=0 行(declined 终态)。
 *   ③ **transcript 隔离**:招聘方读候选人私有面试(interview / interview_event)= 0 行(owner-only FORCE RLS)。
 *   ④ **跨租户隔离**:招聘方 B 看不到招聘方 A 的岗位/候选人/人才库;越权代他人岗位邀请被 RLS 拒。
 *   ⑤ who-pays:邀请只建申请壳,不动 entitlement(候选人用自己额度跑面试——他们的练习)。
 * 用唯一 tag 隔离并发污染(其他 agent 共用 dev DB);非破坏(不重建 interview 等共享表)。
 *   pnpm recruiter:prove   (需 pnpm db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import {
  createPool, asPrincipal,
  inviteCandidate, listMyApplications, startApplicationInterview, declineInvitation,
  finalizeApplication, listJobCandidates, listTalentPool, getJob,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

const TAG = 'rdep_' + Math.random().toString(36).slice(2, 8);
const recA = `${TAG}_recA`, recB = `${TAG}_recB`, cand = `${TAG}_cand`, cand2 = `${TAG}_cand2`, cand3 = `${TAG}_cand3`;
const jobA = `job_${TAG}_A`, jobB = `job_${TAG}_B`;
const ivId = `iv_${TAG}`, ivId3 = `iv3_${TAG}`;   // 候选人私有面试(transcript)

async function setup() {
  // 基表/基础策略由既有迁移 0004/0005 提供(共享 dev DB 已迁移)。这里只幂等应用本特性的 0009 增量
  // (ADD COLUMN IF NOT EXISTS / DROP+ADD 命名约束 / DROP+CREATE 策略),非破坏、可重复跑、不碰共享 interview 表。
  await pool.query(sql('../sql/22_interview_invitation.sql'));
  // seed(超级用户绕 RLS):两招聘方各一岗位 + 候选人私有面试 + 一条 transcript 事件(招聘方绝不可读)。
  await pool.query("INSERT INTO job_posting(id,owner_user_id,title,description,competencies,status) VALUES ($1,$2,'后端工程师','',$3,'open')",
    [jobA, recA, JSON.stringify(['高并发', '分布式锁', '限流'])]);
  await pool.query("INSERT INTO job_posting(id,owner_user_id,title,competencies,status) VALUES ($1,$2,'前端工程师',$3,'open')",
    [jobB, recB, JSON.stringify(['React'])]);
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'completed')", [ivId, cand]);
  await pool.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'completed')", [ivId3, cand3]);
  await pool.query("INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,1,'answer_evaluated',$3)",
    [cand, ivId, JSON.stringify({ answer: '我的私密作答原文——招聘方绝不可见', score: 78 })]);
  // ivId3 评估轮次:score 55(finalize 服务端推导=55,用于真排序断言)。
  await pool.query("INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,1,'answer_evaluated',$3)",
    [cand3, ivId3, JSON.stringify({ score: 55 })]);
}

async function main() {
  await setup();

  section('① 邀请闭环 + 状态机 CAS(invited → in_progress → completed)');
  const inv = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand));
  A('招聘方 A 邀请候选人 → 建申请', inv !== null && typeof inv.applicationId === 'string');
  const appId = inv!.applicationId;

  const before = await asPrincipal(pool, cand, (c) => listMyApplications(c, cand));
  const mine0 = before.find((x) => x.id === appId);
  A('候选人侧看到受邀申请(status=invited)', mine0?.status === 'invited');

  A('CAS:invited → in_progress(候选人开始面试)', await asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, appId)) === true);
  A('CAS 守卫:重复 start(已 in_progress)→ 落败 false', await asPrincipal(pool, cand, (c) => startApplicationInterview(c, cand, appId)) === false);

  // [防伪造] 候选人借用**他人**(cand3 的)高分面试 finalize 自己的申请 → 推导取不到自己的评估轮次 → false(owner_user_id 限定)。
  A('防伪造:借用他人面试 finalize → false(分数服务端按本人面试推导,借不了)', await asPrincipal(pool, cand, (c) => finalizeApplication(c, cand, appId, ivId3)) === false);
  A('CAS:in_progress → completed(分数**服务端推导**=78,非自报)', await asPrincipal(pool, cand, (c) => finalizeApplication(c, cand, appId, ivId)) === true);
  A('回填分数=服务端从已评估轮次推导(78,非客户端传入)', (await asPrincipal(pool, recA, (c) => listJobCandidates(c, recA, jobA))).find((x) => x.candidate_user_id === cand)?.score === 78);
  A('CAS 守卫:重复 finalize(已 completed)→ 落败 false(防重复回填/非法迁移)', await asPrincipal(pool, cand, (c) => finalizeApplication(c, cand, appId, ivId)) === false);

  // 再造两条对抗用例行:cand3 完成(低分 55,用于真排序断言)、cand2 受邀未动(invited,用于真筛选反例)。
  const inv3 = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand3));
  await asPrincipal(pool, cand3, (c) => finalizeApplication(c, cand3, inv3!.applicationId, ivId3));   // 推导=55
  const inv2 = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand2));   // 留在 invited
  A('真实状态回填:邀请已 completed 的候选人 → 幂等复用且回真实状态 completed(不谎报 invited)',
    (await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand)))?.status === 'completed');

  section('② 招聘方多方 RLS 可见缓存状态/分数(但**不可见 transcript**)');
  const candsA = await asPrincipal(pool, recA, (c) => listJobCandidates(c, recA, jobA));
  const row = candsA.find((x) => x.candidate_user_id === cand);
  A('招聘方 A 看到该候选人 completed + 分数78(多方 RLS 跨方读)', row?.status === 'completed' && row?.score === 78);
  A('招聘方 A 看到来源=invited(招聘方邀请)', row?.source === 'invited');

  // transcript 隔离:招聘方 A 以自己 principal 读候选人私有面试行 = 0 行(FORCE RLS owner-only)。
  const ivLeak = await asPrincipal(pool, recA, (c) => c.query('SELECT id FROM interview WHERE id=$1', [ivId]).then((r) => r.rowCount));
  A('**transcript 隔离**:招聘方读候选人 interview 行 = 0(owner-only FORCE RLS)', ivLeak === 0);
  const evLeak = await asPrincipal(pool, recA, (c) => c.query('SELECT id FROM interview_event WHERE owner_user_id=$1', [cand]).then((r) => r.rowCount));
  A('**transcript 隔离**:招聘方读候选人 interview_event(作答原文)= 0', evLeak === 0);

  section('③ 人才库:跨自有岗位聚合 + 服务端排序/筛选(租户隔离)');
  const poolA = await asPrincipal(pool, recA, (c) => listTalentPool(c, recA));
  const tRow = poolA.find((x) => x.candidate_user_id === cand);
  A('人才库含该候选人 + 岗位标题 + 分数', tRow?.job_title === '后端工程师' && tRow?.score === 78);
  A('人才库每行均属招聘方 A(无他人租户行泄漏)', poolA.every((x) => x.job_id === jobA));   // A 此刻只有 jobA
  A('人才库聚合到 3 条(cand completed / cand3 completed / cand2 invited)', poolA.length === 3);
  // 真筛选:存在 invited 反例行时,status=completed 必须把它滤掉(否则筛选逻辑被忽略也能蒙混)。
  const completedOnly = await asPrincipal(pool, recA, (c) => listTalentPool(c, recA, { status: 'completed' }));
  A('服务端筛选 status=completed:恰 2 条且无 invited 反例(cand2 被滤掉)',
    completedOnly.length === 2 && completedOnly.every((x) => x.status === 'completed') && !completedOnly.some((x) => x.candidate_user_id === cand2));
  // 真排序:两条 completed 分数 78/55,降序必须单调且首行=78、次行=55(单行池骗不过此断言)。
  const byScore = await asPrincipal(pool, recA, (c) => listTalentPool(c, recA, { sort: 'score', order: 'desc', status: 'completed' }));
  A('服务端按分数降序:[78,55] 单调(真排序,非仅非空)', byScore.length === 2 && byScore[0].score === 78 && byScore[1].score === 55);
  const byScoreAsc = await asPrincipal(pool, recA, (c) => listTalentPool(c, recA, { sort: 'score', order: 'asc', status: 'completed' }));
  A('服务端按分数升序:[55,78](order 参数真生效)', byScoreAsc[0].score === 55 && byScoreAsc[1].score === 78);

  section('④ 跨租户隔离 + 越权邀请被 RLS 拒');
  const poolB = await asPrincipal(pool, recB, (c) => listTalentPool(c, recB));
  A('招聘方 B 人才库看不到 A 的候选人(租户隔离)', !poolB.some((x) => x.candidate_user_id === cand));
  const candsB = await asPrincipal(pool, recB, (c) => listJobCandidates(c, recB, jobA));
  A('招聘方 B 查 A 的岗位候选人 = 0 行(RLS recruiter_user_id≠B)', candsB.length === 0);
  A('招聘方 B 取 A 的岗位 → null(RLS 隔离)', await asPrincipal(pool, recB, (c) => getJob(c, recB, jobA)) === null);
  A('招聘方 B 邀请到 A 的岗位 → null(非自有岗位,应用层拒)', await asPrincipal(pool, recB, (c) => inviteCandidate(c, recB, jobA, cand2)) === null);

  // RLS 纵深防御:即便绕过仓储直接 INSERT,p_recruiter_insert 的 EXISTS 自校验也拒绝代他人岗位邀请。
  let rlsRejected = false;
  try {
    await asPrincipal(pool, recB, (c) => c.query(
      "INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,status,source) VALUES ($1,$2,$3,$4,'invited','invited')",
      [`app_${TAG}_hack`, jobA, recB, `${TAG}_victim`]));   // B 声称是 A 的岗位招聘方(用全新候选人,排除 UNIQUE 干扰,唯一拒因=RLS)
  } catch { rlsRejected = true; }
  A('**RLS 纵深**:绕仓储直插他人岗位邀请 → 被 p_recruiter_insert 拒', rlsRejected);

  section('⑤ declined 终态 + who-pays(邀请不动 entitlement)');
  A('CAS:invited → declined(候选人2 婉拒,终态)', await asPrincipal(pool, cand2, (c) => declineInvitation(c, cand2, inv2!.applicationId)) === true);
  A('CAS 守卫:declined 后再 finalize → 落败 false(终态不可逆)', await asPrincipal(pool, cand2, (c) => finalizeApplication(c, cand2, inv2!.applicationId, 'x')) === false);
  A('CAS 守卫:declined 后再 start → 落败 false', await asPrincipal(pool, cand2, (c) => startApplicationInterview(c, cand2, inv2!.applicationId)) === false);
  // who-pays:邀请只写 job_application,从不动额度池。**查真实额度表** entitlement_consumption(commerce.ts),招聘方零消费。
  const recConsumption = await pool.query('SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id IN ($1,$2)', [recA, recB]);
  A('who-pays:邀请不在真实额度表 entitlement_consumption 产生招聘方消费(候选人用自己额度面试)', recConsumption.rows[0].n === 0);

  // 幂等:重复邀请同岗位同候选人 → 复用既有 applicationId(UNIQUE job_id,candidate)。
  const invDup = await asPrincipal(pool, recA, (c) => inviteCandidate(c, recA, jobA, cand));
  A('幂等:重复邀请同岗位同候选人 → 复用既有 applicationId', invDup?.applicationId === appId);

  console.log(`\n${failures === 0 ? '✓ B 端企业纵深 全部通过' : '✗ ' + failures + ' 失败'}(邀请闭环 + 状态机CAS + transcript隔离 + 跨租户隔离 + who-pays)`);
}

/** 清理本 run 的 seed(放 finally:即便断言抛错也不把垃圾留进共享 dev DB)。 */
async function cleanup() {
  await pool.query('DELETE FROM job_application WHERE id LIKE $1 OR job_id IN ($2,$3)', [`app_${TAG}_%`, jobA, jobB]);
  await pool.query('DELETE FROM job_posting WHERE id IN ($1,$2)', [jobA, jobB]);
  await pool.query('DELETE FROM interview WHERE id IN ($1,$2)', [ivId, ivId3]);
  await pool.query('DELETE FROM interview_event WHERE owner_user_id IN ($1,$2)', [cand, cand3]);
}

main()
  .catch((e) => { console.error(e); failures++; })
  .finally(async () => {
    try { await cleanup(); } catch (e) { console.error('cleanup failed:', e); }
    await pool.end();
    process.exit(failures === 0 ? 0 : 1);
  });
