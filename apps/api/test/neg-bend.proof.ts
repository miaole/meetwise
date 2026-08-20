import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot, mkAssert, tokenFor } from './_neg-harness';

/**
 * B 端(招聘方 jobs / 申请 applications / 人才库 recruiter / 角色 roles)+ 运营 admin + profile 域
 * **纯负路径**证明:角色越权 / 跨租户越权(IDOR)/ 多方 RLS 隔离 / admin 特权边界 / 重复申请 /
 *   不存在资源 / 未鉴权 / 返回体敏感字段泄漏。**一条 happy-path 都不承载**。
 *
 * 载体注意:_neg-harness.boot() 只灌 sql 01..16,**不含** 17_recruiter / 18_job_application / 22_interview_invitation
 *   → job_posting / job_application 表在裸 harness 里不存在(见文末"疑似真 bug")。本文件在 boot 后自行灌这三张表 +
 *   播种跨租户场景,才能对 B 端路由打真负测(否则全 500,测不出 403/404 授权语义)。DROP-then-load 保证多次跑幂等。
 */

const sqlText = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}`, import.meta.url)), 'utf8');
const migrationText = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/${f}`, import.meta.url)), 'utf8');

const h = await boot();
const { A, done } = mkAssert('neg:bend');
const VALID_RESUME_ID = '11111111-1111-4111-8111-111111111111';
const STALE_RESUME_ID = '22222222-2222-4222-8222-222222222222';

// ── 灌 B 端表(harness 缺)+ 播种跨租户负测场景 ─────────────────────────────
await h.pool.query('DROP TABLE IF EXISTS job_application CASCADE; DROP TABLE IF EXISTS job_posting CASCADE;');
for (const f of ['17_recruiter.sql', '18_job_application.sql', '22_interview_invitation.sql']) await h.pool.query(sqlText(f));

// 岗位:JOB_REC(recU 拥有,open) / JOB_REC2(recU2 拥有,open) / JOB_CLOSED(recU 拥有,closed)。h.pool=owner/superuser,绕 RLS 播种。
await h.pool.query(
  "INSERT INTO job_posting(id,owner_user_id,title,description,competencies,status) VALUES " +
  "('JOB_REC','recU','后端岗','', '[\"redis\"]','open')," +
  "('JOB_REC2','recU2','数据岗','', '[\"sql\"]','open')," +
  "('JOB_CLOSED','recU','已关岗','', '[]','closed')");
// victimU(candidate)投递到 recU 的岗位 → 一条属于 recU 租户的申请(invited)。recU2/userB 都无权见/改。
await h.pool.query(
  "INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,status,source) VALUES " +
  "('APP_VICTIM','JOB_REC','recU','victimU','invited','applied')");
// 旧库中可能存在「申请仍 in_progress、绑定面试已 abandoned」的历史行：
// 0046/0082 会把运行时 start 约束收紧到 created/active，但不会伪造地重写
// 这类历史事实。0123 只回填展示快照，不能因为 UPDATE 触发器再次检查 start
// 而整笔迁移失败；迁移后运行时约束仍必须恢复并拒绝该死绑定。
await h.pool.query(
  "INSERT INTO resume(id,owner_user_id,status,content_sha,source_kind) VALUES ($1,'userA','ingested','stale-snapshot-resume','text')",
  [STALE_RESUME_ID]);
await h.pool.query(
  "INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,interview_id,status,source,resume_id) " +
  "VALUES ('APP_STALE','JOB_REC','recU','userA','IV_STALE','in_progress','applied',$1)",
  [STALE_RESUME_ID]);
await h.pool.query(
  "INSERT INTO interview(id,owner_user_id,status,application_id,job_id,resume_id) " +
  "VALUES ('IV_STALE','userA','abandoned','APP_STALE','JOB_REC',$1)",
  [STALE_RESUME_ID]);
// This file reloads the historical B tables for isolated negative tests, so
// re-apply the current invariant migration after the fixture—not before it.
await h.pool.query(migrationText('0046_application_assessment_recovery.sql'));
await h.pool.query(migrationText('0104_job_route_decision.sql'));
let contextSnapshotMigrationPassed = true;
const migrationClient = await h.pool.connect();
try {
  await migrationClient.query('BEGIN');
  await migrationClient.query(migrationText('0123_user_facing_context_snapshots.sql'));
  await migrationClient.query('COMMIT');
} catch {
  contextSnapshotMigrationPassed = false;
  await migrationClient.query('ROLLBACK').catch(() => {});
} finally {
  migrationClient.release();
}

// ── principal 上下文 client(app_role + set_config),用于 DB 层直证 RLS 隔离(不经 HTTP)。ROLLBACK 只读不改。
const asP = async (uid: string, q: string, params: any[] = []) => {
  const c = await h.pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE app_role');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [uid]);
    const r = await c.query(q, params);
    await c.query('ROLLBACK');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => {}); throw e; } finally { c.release(); }
};
const oneOf = (s: number, arr: number[]) => arr.includes(s);
const appStatus = async (id: string) => (await h.pool.query('SELECT status, score FROM job_application WHERE id=$1', [id])).rows[0];

A('0123 展示快照回填不被历史 abandoned 绑定行阻断', contextSnapshotMigrationPassed);
const staleSnapshot = (await h.pool.query(
  'SELECT job_title_snapshot, status, interview_id, interview_attempt FROM job_application WHERE id=$1',
  ['APP_STALE'])).rows[0];
A('历史死绑定只补展示快照，不改写申请状态/绑定 attempt',
  staleSnapshot?.job_title_snapshot === '后端岗'
  && staleSnapshot?.status === 'in_progress'
  && staleSnapshot?.interview_id === 'IV_STALE'
  && staleSnapshot?.interview_attempt === 1);
A('0123 完成后 lineage 与 application binding trigger 均恢复启用',
  (await h.pool.query(
    "SELECT count(*)::int n FROM pg_trigger WHERE tgname IN ('trg_job_application_lineage','trg_enforce_job_application_interview_binding') " +
    "AND tgrelid='public.job_application'::regclass AND NOT tgisinternal AND tgenabled='O'" )).rows[0]?.n === 2);
let staleBindingStillRejected = false;
try {
  // Even a no-op UPDATE must not make an abandoned interview startable after
  // the migration window closes; the restored trigger remains fail-closed.
  await asP('userA', "UPDATE job_application SET version=version WHERE id='APP_STALE'");
} catch (error) {
  staleBindingStillRejected = String(error).includes('job_application_start_requires_bound_interview');
}
A('迁移窗口结束后历史死绑定仍由运行时 guard fail-closed 拒绝', staleBindingStillRejected);

/* ═════════════ 1) 未鉴权:无 token 且无 dev 头 → 401 unauthenticated ═════════════ */
{
  const anon = {};
  A('GET /jobs 无鉴权→401', (await h.req('GET', '/jobs', anon)).status === 401);
  A('POST /jobs/:id/apply 无鉴权→401', (await h.send('POST', '/jobs/JOB_REC/apply', anon, {})).status === 401);
  A('GET /applications 无鉴权→401', (await h.req('GET', '/applications', anon)).status === 401);
  A('POST /applications/:id/start 无鉴权→401', (await h.send('POST', '/applications/APP_VICTIM/start', anon, {})).status === 401);
  A('POST /applications/:id/decline 无鉴权→401', (await h.send('POST', '/applications/APP_VICTIM/decline', anon, {})).status === 401);
  A('POST /applications/:id/finalize 无鉴权→401', (await h.send('POST', '/applications/APP_VICTIM/finalize', anon, { interviewId: 'x' })).status === 401);
  A('GET /recruiter/jobs 无鉴权→401', (await h.req('GET', '/recruiter/jobs', anon)).status === 401);
  A('POST /recruiter/jobs 无鉴权→401', (await h.send('POST', '/recruiter/jobs', anon, { title: 'x' })).status === 401);
  A('GET /recruiter/talent 无鉴权→401', (await h.req('GET', '/recruiter/talent', anon)).status === 401);
  A('GET /recruiter/jobs/:id 无鉴权→401', (await h.req('GET', '/recruiter/jobs/JOB_REC', anon)).status === 401);
  A('GET /recruiter/jobs/:id/candidates 无鉴权→401', (await h.req('GET', '/recruiter/jobs/JOB_REC/candidates', anon)).status === 401);
  A('POST /recruiter/jobs/:id/invite 无鉴权→401', (await h.send('POST', '/recruiter/jobs/JOB_REC/invite', anon, { candidateId: 'userB' })).status === 401);
  A('GET /admin/users 无鉴权→401', (await h.req('GET', '/admin/users', anon)).status === 401);
  A('GET /admin/orders 无鉴权→401', (await h.req('GET', '/admin/orders', anon)).status === 401);
  A('GET /admin/audit 无鉴权→401', (await h.req('GET', '/admin/audit', anon)).status === 401);
  A('POST /admin/users/:id/disable 无鉴权→401', (await h.send('POST', '/admin/users/userA/disable', anon, {})).status === 401);
  A('GET /roles 无鉴权→401', (await h.req('GET', '/roles', anon)).status === 401);
  A('POST /roles/match 无鉴权→401', (await h.send('POST', '/roles/match', anon, { resumeId: 'r' })).status === 401);
  A('GET /profile 无鉴权→401', (await h.req('GET', '/profile', anon)).status === 401);
  A('GET /profile/growth 无鉴权→401', (await h.req('GET', '/profile/growth', anon)).status === 401);
  A('PATCH /profile/settings 无鉴权→401', (await h.patch('/profile/settings', anon, { preferences: {} })).status === 401);
  A('POST /profile/change-password 无鉴权→401', (await h.send('POST', '/profile/change-password', anon, {})).status === 401);
}

/* ═════════════ 2) 坏 token / 伪造 principal → 401(fail-closed) ═════════════ */
{
  const bad = { authorization: 'Bearer not.a.real.token' };
  A('GET /recruiter/jobs 垃圾 Bearer→401', (await h.req('GET', '/recruiter/jobs', bad)).status === 401);
  A('GET /admin/users 垃圾 Bearer→401', (await h.req('GET', '/admin/users', bad)).status === 401);
  A('GET /profile 错密钥签名 token→401', (await h.req('GET', '/profile', { authorization: 'Bearer ' + tokenFor('userA', { secret: 'wrong-secret' }) })).status === 401);
  A('GET /profile 幽灵账户(签名合法但账户不存在)→401', (await h.req('GET', '/profile', { authorization: 'Bearer ' + tokenFor('ghost_no_such_user') })).status === 401);
  A('GET /profile 保留系统主体 __system* 冒充→401', (await h.req('GET', '/profile', h.U('__system_qbank__'))).status === 401);
  A('POST /recruiter/jobs 保留系统主体→401', (await h.send('POST', '/recruiter/jobs', h.U('__system_admin__'), { title: 'hack' })).status === 401);
}

/* ═════════════ 3) 角色越权:candidate/admin 打招聘方专属 /recruiter/* → 403 recruiter_required ═════════════ */
{
  const a = h.U('userA');      // candidate
  A('candidate POST /recruiter/jobs→403', oneOf((await h.send('POST', '/recruiter/jobs', a, { title: '恶意岗位' })).status, [403]));
  A('candidate GET /recruiter/jobs→403', (await h.req('GET', '/recruiter/jobs', a)).status === 403);
  A('candidate GET /recruiter/talent(枚举人才库)→403', (await h.req('GET', '/recruiter/talent', a)).status === 403);
  A('candidate GET /recruiter/jobs/:id→403', (await h.req('GET', '/recruiter/jobs/JOB_REC', a)).status === 403);
  A('candidate GET /recruiter/jobs/:id/candidates→403', (await h.req('GET', '/recruiter/jobs/JOB_REC/candidates', a)).status === 403);
  A('candidate POST /recruiter/jobs/:id/invite(借邀请枚举用户)→403', (await h.send('POST', '/recruiter/jobs/JOB_REC/invite', a, { candidateEmail: 'probe@x.com' })).status === 403);
  const r403 = await h.send('POST', '/recruiter/jobs', a, { title: '恶意岗位' });
  A('candidate 越权 /recruiter 错误体标 recruiter_required', r403.body?.error === 'recruiter_required');
  // adminU:is_admin=true 但 role=candidate → 仍非招聘方 → 403(admin 特权≠招聘方特权)
  const adm = h.U('adminU');
  A('adminU(role=candidate) POST /recruiter/jobs→403', (await h.send('POST', '/recruiter/jobs', adm, { title: 'x岗' })).status === 403);
  A('adminU GET /recruiter/talent→403', (await h.req('GET', '/recruiter/talent', adm)).status === 403);
  A('victimU(candidate) GET /recruiter/jobs→403', (await h.req('GET', '/recruiter/jobs', h.U('victimU'))).status === 403);
}

/* ═════════════ 4) admin 越权:非 admin(candidate / recruiter)打 /admin/* → 403 admin_required ═════════════ */
{
  const a = h.U('userA');   // candidate,非 admin
  A('candidate GET /admin/users→403', (await h.req('GET', '/admin/users', a)).status === 403);
  A('candidate GET /admin/orders→403', (await h.req('GET', '/admin/orders', a)).status === 403);
  A('candidate GET /admin/stats→403', (await h.req('GET', '/admin/stats', a)).status === 403);
  A('candidate GET /admin/audit→403', (await h.req('GET', '/admin/audit', a)).status === 403);
  A('candidate GET /admin/question-feedback→403', (await h.req('GET', '/admin/question-feedback', a)).status === 403);
  A('candidate POST /admin/users/:id/disable(越权停用他人)→403', (await h.send('POST', '/admin/users/userB/disable', a, {})).status === 403);
  const r = await h.req('GET', '/admin/users', a);
  A('非 admin 越权 /admin 错误体标 admin_required', r.body?.error === 'admin_required');
  // recruiter 也不是 admin
  const rec = h.U('recU');
  A('recruiter GET /admin/users→403', (await h.req('GET', '/admin/users', rec)).status === 403);
  A('recruiter POST /admin/users/:id/disable→403', (await h.send('POST', '/admin/users/userA/disable', rec, {})).status === 403);
}

/* ═════════════ 5) admin 特权边界 + 返回体敏感字段泄漏(adminU=合法 admin) ═════════════ */
{
  const adm = h.U('adminU');
  // disable 不存在用户 → 404 not_found(非静默成功)
  const dz = await h.send('POST', '/admin/users/ghost_nonexistent/disable', adm, {});
  A('admin disable 不存在用户→404', dz.status === 404 && dz.body?.error === 'not_found');
  // 泄漏防线:/admin/users 跨用户只读,响应体绝不含 password_hash / pwd_epoch / preferences
  const us = await h.req('GET', '/admin/users', adm);
  const leakUser = Array.isArray(us.body?.users) && us.body.users.some((u: any) => 'password_hash' in u || 'pwd_epoch' in u || 'preferences' in u);
  A('admin /users 不泄漏 password_hash/pwd_epoch/preferences', us.status === 200 && !leakUser);
  // /admin/orders 不含任何 password/secret 字段
  const os = await h.req('GET', '/admin/orders', adm);
  const leakOrder = Array.isArray(os.body?.orders) && os.body.orders.some((o: any) => Object.keys(o).some((k) => /password|secret|token|hash/i.test(k)));
  A('admin /orders 不泄漏 password/secret/token/hash 字段', os.status === 200 && !leakOrder);
  // admin 只有 disable 这一个业务写口,无"造订单/改权益/建用户/改角色"面 → 不存在的写路由 404(无越权写业务数据的入口)
  A('admin 无 POST /admin/orders 写口→404', oneOf((await h.send('POST', '/admin/orders', adm, {})).status, [404, 405]));
  A('admin 无 POST /admin/users(建用户)写口→404', oneOf((await h.send('POST', '/admin/users', adm, { id: 'x' })).status, [404, 405]));
  A('admin 无 POST /admin/users/:id/promote(提权)写口→404', oneOf((await h.send('POST', '/admin/users/userA/promote', adm, {})).status, [404, 405]));
}

/* ═════════════ 6) 跨租户 IDOR:recruiter 读/改另一租户资源 ═════════════ */
{
  const r2 = h.U('recU2');   // 另一个招聘方租户
  // 读别人的岗位 → 404 not_found_or_forbidden(不泄漏存在性)
  const g = await h.req('GET', '/recruiter/jobs/JOB_REC', r2);
  A('recU2 读 recU 的岗位→404 not_found_or_forbidden', g.status === 404 && g.body?.error === 'not_found_or_forbidden');
  A('recU2 读 recU 的已关岗→404', (await h.req('GET', '/recruiter/jobs/JOB_CLOSED', r2)).status === 404);
  // 查别人岗位的候选人 → 200 但 RLS 过滤为空(victimU 绝不出现在 recU2 视图)
  const cand = await h.req('GET', '/recruiter/jobs/JOB_REC/candidates', r2);
  A('recU2 查 recU 岗位候选人→空(RLS 隔离,不见 victimU)', cand.status === 200 && Array.isArray(cand.body?.candidates) && cand.body.candidates.length === 0);
  // 邀请到别人岗位 → 404 job_not_found_or_forbidden
  const inv = await h.send('POST', '/recruiter/jobs/JOB_REC/invite', r2, { candidateId: 'userB' });
  A('recU2 邀请候选人到 recU 岗位→404 job_not_found_or_forbidden', inv.status === 404 && inv.body?.error === 'job_not_found_or_forbidden');
  // 招聘方自有列表不含他租户岗位
  const listR2 = await h.req('GET', '/recruiter/jobs', r2);
  A('recU2 /recruiter/jobs 列表不含 recU 的 JOB_REC', listR2.status === 200 && !(listR2.body?.jobs ?? []).some((j: any) => j.id === 'JOB_REC'));
  const listR = await h.req('GET', '/recruiter/jobs', h.U('recU'));
  A('recU /recruiter/jobs 列表不含 recU2 的 JOB_REC2', listR.status === 200 && !(listR.body?.jobs ?? []).some((j: any) => j.id === 'JOB_REC2'));
  // 人才库跨租户隔离:recU2 看不到投到 recU 岗位的 victimU
  const t2 = await h.req('GET', '/recruiter/talent', r2);
  A('recU2 人才库不含 victimU(跨租户隔离)', t2.status === 200 && !(t2.body?.talents ?? []).some((x: any) => x.candidate_user_id === 'victimU'));
}

/* ═════════════ 7) 跨用户 IDOR:candidate 读/改不属于自己的 application ═════════════ */
{
  const b = h.U('userB');    // 非 APP_VICTIM 的候选人
  // start 他人申请:noop(不死胡同)且 DB 绝不变
  const st = await h.send('POST', '/applications/APP_VICTIM/start', b, { resumeId: VALID_RESUME_ID });
  A('userB start victimU 的申请→noop(不推进)', st.status === 200 && st.body?.status === 'noop');
  A('userB start 后 APP_VICTIM 仍 invited(DB 未越权修改)', (await appStatus('APP_VICTIM')).status === 'invited');
  // decline 他人邀请:noop 且 DB 不变
  const dc = await h.send('POST', '/applications/APP_VICTIM/decline', b, {});
  A('userB decline victimU 的邀请→noop', dc.status === 200 && dc.body?.status === 'noop');
  A('userB decline 后 APP_VICTIM 仍 invited(未越权终结)', (await appStatus('APP_VICTIM')).status === 'invited');
  // finalize 他人申请:409 cannot_finalize 且 score 仍空
  const fz = await h.send('POST', '/applications/APP_VICTIM/finalize', b, {});
  A('userB finalize victimU 的申请→409 cannot_finalize', fz.status === 409 && fz.body?.error === 'cannot_finalize');
  A('userB finalize 后 APP_VICTIM.score 仍为空(未越权回填)', (await appStatus('APP_VICTIM')).score === null);
  // 列表侧:userB 的 /applications 绝不含 APP_VICTIM(候选人侧 RLS)
  const mine = await h.req('GET', '/applications', b);
  A('userB /applications 不含 victimU 的 APP_VICTIM', mine.status === 200 && !(mine.body?.applications ?? []).some((x: any) => x.id === 'APP_VICTIM'));
  // 不存在的申请:start→noop、finalize→409(不区分越权/不存在,均无泄漏)
  A('userA start 不存在申请→noop', (await h.send('POST', '/applications/app_ghost/start', h.U('userA'), { resumeId: VALID_RESUME_ID })).body?.status === 'noop');
  A('userA finalize 不存在申请→409', (await h.send('POST', '/applications/app_ghost/finalize', h.U('userA'), {})).status === 409);
}

/* ═════════════ 8) 申请闭环负路径:不存在/已关闭/重复/畸形 ═════════════ */
{
  const a = h.U('userA');
  const nf = await h.send('POST', '/jobs/ghost_job/apply', a, {});
  A('apply 不存在岗位→404 job_not_found_or_closed', nf.status === 404 && nf.body?.error === 'job_not_found_or_closed');
  const cl = await h.send('POST', '/jobs/JOB_CLOSED/apply', a, {});
  A('apply 已关闭岗位→404(闭岗不可投)', cl.status === 404 && cl.body?.error === 'job_not_found_or_closed');
  // finalize 不接收 interviewId：空对象可达服务端后因未绑定→409，任何客户端试图注入历史会话 ID → strict 400。
  A('finalize 空对象→409（无绑定不收口）', (await h.send('POST', '/applications/APP_VICTIM/finalize', a, {})).status === 409);
  A('finalize 注入 interviewId 空串→400', (await h.send('POST', '/applications/APP_VICTIM/finalize', a, { interviewId: '' })).status === 400);
  A('finalize 注入 interviewId 非字符串→400', (await h.send('POST', '/applications/APP_VICTIM/finalize', a, { interviewId: 123 })).status === 400);
  A('start 缺 resumeId→400', (await h.send('POST', '/applications/APP_VICTIM/start', a, {})).status === 400);
  A('start 非 UUID resumeId→400', (await h.send('POST', '/applications/APP_VICTIM/start', a, { resumeId: 'history-interview-id' })).status === 400);
  // 重复申请:dup 约束(UNIQUE job_id,candidate)→ 第二次幂等复用,绝不生成第二行
  const p1 = await h.send('POST', '/jobs/JOB_REC2/apply', h.U('userB'), {});
  const p2 = await h.send('POST', '/jobs/JOB_REC2/apply', h.U('userB'), {});
  A('重复 apply 同岗位:两次返回同一 applicationId(幂等)', p1.status === 200 && p2.status === 200 && p1.body?.applicationId === p2.body?.applicationId);
  const dupCnt = (await h.pool.query('SELECT count(*)::int n FROM job_application WHERE job_id=$1 AND candidate_user_id=$2', ['JOB_REC2', 'userB'])).rows[0].n;
  A('重复 apply 不产生第二行(dup 约束生效)', dupCnt === 1);
}

/* ═════════════ 9) 招聘方写路径负路径:畸形契约 / 邀请不存在或非候选人 / 越权岗位 ═════════════ */
{
  const rec = h.U('recU');
  // CreateJobDto:title min2 / competencies max30
  A('create job title 过短→400', (await h.send('POST', '/recruiter/jobs', rec, { title: 'a' })).status === 400);
  A('create job 缺 title→400', (await h.send('POST', '/recruiter/jobs', rec, {})).status === 400);
  A('create job competencies 超 30 条→400', (await h.send('POST', '/recruiter/jobs', rec, { title: '正常岗', competencies: Array.from({ length: 31 }, (_, i) => 'c' + i) })).status === 400);
  // InviteCandidateDto:id 或 email 二选一,email 需合法
  A('invite 既无 id 也无 email→400', (await h.send('POST', '/recruiter/jobs/JOB_REC/invite', rec, {})).status === 400);
  A('invite email 非法格式→400', (await h.send('POST', '/recruiter/jobs/JOB_REC/invite', rec, { candidateEmail: 'not-an-email' })).status === 400);
  // 邀请不存在的候选人 → 404 candidate_not_found
  const g1 = await h.send('POST', '/recruiter/jobs/JOB_REC/invite', rec, { candidateId: 'ghost_candidate' });
  A('invite 不存在候选人→404 candidate_not_found', g1.status === 404 && g1.body?.error === 'candidate_not_found');
  // 反枚举:邀请另一个招聘方(role=recruiter)按 email → 视为未找到(不当 B 端账户 oracle)
  const g2 = await h.send('POST', '/recruiter/jobs/JOB_REC/invite', rec, { candidateEmail: 'rec2@x.com' });
  A('invite 招聘方 email→404 candidate_not_found(不暴露 B 端账户)', g2.status === 404 && g2.body?.error === 'candidate_not_found');
  // 越权岗位:recU 邀请合法候选人到 recU2 的岗位 → 404 job_not_found_or_forbidden
  const g3 = await h.send('POST', '/recruiter/jobs/JOB_REC2/invite', rec, { candidateId: 'userB' });
  A('recU 邀请到 recU2 岗位→404 job_not_found_or_forbidden', g3.status === 404 && g3.body?.error === 'job_not_found_or_forbidden');
}

/* ═════════════ 10) roles:未鉴权已覆盖;无提权写面 + match 负路径 ═════════════ */
{
  const a = h.U('userA');
  const m0 = await h.send('POST', '/roles/match', a, {});
  A('roles/match 缺 resumeId→400 missing_resume_id', m0.status === 400 && m0.body?.error === 'missing_resume_id');
  // 匹配他人/不存在简历:RLS 限己 → 一律 404 not_found_or_forbidden(不区分不存在与越权)
  const m1 = await h.send('POST', '/roles/match', a, { resumeId: 'ghost_resume' });
  A('roles/match 他人/不存在简历→404 not_found_or_forbidden', m1.status === 404 && m1.body?.error === 'not_found_or_forbidden');
  // 无角色变更/自升写路由(candidate 无法自升 recruiter/admin):不存在的写口 → 404
  A('无 POST /roles(自建角色)写口→404', oneOf((await h.send('POST', '/roles', a, { role: 'recruiter' })).status, [404, 405]));
  A('无 PATCH /roles(自升角色)写口→404', oneOf((await h.patch('/roles', a, { role: 'admin' })).status, [404, 405]));
  A('无 POST /roles/promote(提权)写口→404', oneOf((await h.send('POST', '/roles/promote', a, { to: 'recruiter' })).status, [404, 405]));
}

/* ═════════════ 11) profile:无跨用户面 + 畸形 settings / 改密负路径 ═════════════ */
{
  const a = h.U('userA');
  // 无 /profile/:id 跨用户读面(principal 恒为自己)→ 带 id 段命中不到路由 → 404
  A('GET /profile/userB(跨用户读)→无该路由 404', oneOf((await h.req('GET', '/profile/userB', a)).status, [404, 405]));
  // PATCH /profile/settings:updateSettingsSchema .strict() 拒未知 key / 深嵌 / 坏枚举 / 缺 preferences
  A('settings 未知顶层 key→400', (await h.patch('/profile/settings', a, { preferences: {}, hack: 1 })).status === 400);
  A('settings preferences 内未知 key→400', (await h.patch('/profile/settings', a, { preferences: { evil: 'x' } })).status === 400);
  A('settings notifications 未知子 key→400', (await h.patch('/profile/settings', a, { preferences: { notifications: { sms: true } } })).status === 400);
  A('settings theme 非法枚举→400', (await h.patch('/profile/settings', a, { preferences: { theme: 'neon' } })).status === 400);
  A('settings locale 非法枚举→400', (await h.patch('/profile/settings', a, { preferences: { locale: 'fr' } })).status === 400);
  A('settings preferences 非对象→400', (await h.patch('/profile/settings', a, { preferences: 'x' })).status === 400);
  A('settings 缺 preferences→400', (await h.patch('/profile/settings', a, {})).status === 400);
  const rawBad = await h.raw('PATCH', '/profile/settings', { ...a, 'content-type': 'application/json' }, '{not valid json');
  A('settings 畸形 JSON 体→400', oneOf(rawBad.status, [400]));
  // change-password:短新密码 / 缺字段 / 错旧密码
  A('change-password 新密码 <8→400 invalid_password', (await h.send('POST', '/profile/change-password', a, { oldPassword: 'whatever1', newPassword: 'short' })).status === 400);
  A('change-password 缺字段→400', (await h.send('POST', '/profile/change-password', a, {})).status === 400);
  const wp = await h.send('POST', '/profile/change-password', h.U('pwUser'), { oldPassword: 'wrong-old-1', newPassword: 'brandnew12' });
  A('change-password 旧密码错误→401 wrong_password', wp.status === 401 && wp.body?.error === 'wrong_password');
  // /profile 自身返回体不泄漏 password_hash
  const me = await h.req('GET', '/profile', a);
  A('/profile 响应不含 password_hash/pwd_epoch', me.status === 200 && !('password_hash' in (me.body ?? {})) && !('pwd_epoch' in (me.body ?? {})));
}

/* ═════════════ 12) DB 层直证多方 RLS 隔离(不经 HTTP,穿透应用层看底座) ═════════════ */
{
  // 申请表私有:非当事方(另一招聘方 / 另一候选人)在 principal 上下文里查 = 0 行
  A('RLS: recU2 看不到 recU 租户的 APP_VICTIM', (await asP('recU2', 'SELECT count(*)::int n FROM job_application WHERE id=$1', ['APP_VICTIM'])).rows[0].n === 0);
  A('RLS: userB 看不到 victimU 的 APP_VICTIM', (await asP('userB', 'SELECT count(*)::int n FROM job_application WHERE id=$1', ['APP_VICTIM'])).rows[0].n === 0);
  // 已关闭岗位非公开可读(p_read 仅放行 open 或 owner)
  A('RLS: recU2 读不到 recU 的已关闭岗位 JOB_CLOSED', (await asP('recU2', 'SELECT count(*)::int n FROM job_posting WHERE id=$1', ['JOB_CLOSED'])).rows[0].n === 0);
  // 候选人无法伪造他人身份 INSERT 申请(p_candidate_insert WITH CHECK candidate=principal)
  let forge1 = false;
  try { await asP('userB', "INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,status,source) VALUES('app_forge1','JOB_REC','recU','victimU','invited','applied')"); }
  catch { forge1 = true; }
  A('RLS: userB 无法冒充 victimU 插入申请(WITH CHECK 拦截)', forge1);
  // 招聘方无法为非自有岗位建幽灵申请(p_recruiter_insert EXISTS 自校验岗位归属)
  let forge2 = false;
  try { await asP('recU2', "INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,status,source) VALUES('app_forge2','JOB_REC','recU2','userB','invited','invited')"); }
  catch { forge2 = true; }
  A('RLS: recU2 无法为 recU 的岗位建邀请申请(EXISTS 归属自校验)', forge2);
  // P0: candidate may insert a row for themself under p_candidate_insert, so
  // RLS alone cannot prove it is an *unscored invited shell*.  The DB trigger
  // must reject a pre-completed, high-score row before it becomes recruiter
  // visible.
  let forgedScoreRejected = false;
  try { await asP('userB', "INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,status,score,source) VALUES('app_forge_score','JOB_REC','recU','userB','completed',100,'applied')"); }
  catch { forgedScoreRejected = true; }
  A('DB guard: candidate 不能直接插入 completed/100 的伪造候选结果', forgedScoreRejected);
  let snapshotMutationRejected = false;
  try { await asP('victimU', "UPDATE job_application SET job_title_snapshot='伪造岗位' WHERE id='APP_VICTIM'"); }
  catch { snapshotMutationRejected = true; }
  A('DB guard: 候选人不能改写岗位标题快照', snapshotMutationRejected);
  const forgedVisible = await asP('recU', "SELECT count(*)::int n FROM job_application WHERE id='app_forge_score'");
  A('伪造完成行对受害招聘方可见数=0', forgedVisible.rows[0].n === 0);
  let tenantMutationRejected = false;
  try { await asP('victimU', "UPDATE job_application SET recruiter_user_id='recU2' WHERE id='APP_VICTIM'"); }
  catch { tenantMutationRejected = true; }
  A('DB guard: 终态前后均不能篡改 job/recruiter 租户归属', tenantMutationRejected);
  // 候选人无法改招聘方岗位状态(job_posting p_update USING owner=principal)
  const upd = await asP('userA', "UPDATE job_posting SET status='closed' WHERE id=$1", ['JOB_REC']);
  A('RLS: candidate userA 改不动招聘方岗位(0 行受影响)', (upd.rowCount ?? 0) === 0);
}

// 收尾:确认经过全部 IDOR 尝试后,受害申请仍然纹丝不动(端到端无越权副作用)
{
  const s = await appStatus('APP_VICTIM');
  A('全部越权尝试后 APP_VICTIM 仍 invited & score 空(零副作用)', s.status === 'invited' && s.score === null);
}

// ── 用例条数统计:共 111 条纯负路径断言(全部为拒绝/隔离/无副作用,零 happy-path)──
//   §1 未鉴权 22 · §2 坏 token/伪造主体 6 · §3 角色越权(recruiter)10 · §4 admin 越权 9 ·
//   §5 admin 特权边界+返回体泄漏 6 · §6 跨租户 IDOR(recruiter)7 · §7 跨用户 IDOR(application)9 ·
//   §8 申请闭环负路径 9（含禁止 client interviewId 注入）· §9 招聘方写负路径 8 · §10 roles 5 · §11 profile 15 · §12 DB 层 RLS 直证 6 · 收尾 1
await done();
