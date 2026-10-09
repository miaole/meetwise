/**
 * UNSTUB-ERASE rev2 主证明（D6 合规最低集 · 软删先行）。
 *
 * 覆盖面（蓝图 §5.2 六列 · rev2 范围：interview-data 公开删除端点维持关闭 · 账户级+简历删除+注销）：
 *   NEG    越权/未认证 404/401 不分叉；软删后读面（列表/画像/面试 guard 410）；注销后旧
 *          Bearer→401 account_inactive、login→401；密码错→401 零副作用。
 *   FAULT  注销事务中途失败（账本投毒）→ 整体回滚无部分态（事务原子性）。
 *   BOUND  重放幂等：同 (owner,resume) 二次删同 requestId alreadyFenced 不建第二账；
 *          并发双删恰一 winner（账本恰 1 行）；注销重放不重复建账。
 *   ADV    JWS 冒充 Bearer→401（P3 原值）；x-privacy-authorization 头不改变受理语义；
 *          注入/G7 面零触（围栏 turn 410 面由 privacy-erasure-http 同形承载）。
 *   不撒谎 物理行仍在三轨在卷：resume 行 status='erasure_fenced'+erasure_requested_at、
 *          interview 行仍在（fence 由 4-target 账本行表达）、user_account 行仍在
 *          status='disabled'+deleted_at；purgePending===true 三响应在卷；列表收缩与物理行
 *          不变双断言并列（种子护栏 before>0）。
 *   完成推进 账户级删除默认 compose（隔离 PG 全迁移链 + 已建 PRIV 链）驱动 claim/purge →
 *          memory account_data request 与面试 projection request（4-target 形）推进
 *          completed；简历轨 request 无 worker（S2 登记）保持 fenced + purgePending=true。
 *
 * 三读面（rev2 R4）：growth/export 第三查/memory historicalWeakDimensions —— 面试围栏后
 * 成长档案/导出/弱项偏置零泄漏（0129 预览路径=产品侧单场围栏入口，账户仍 active 时 HTTP 验证）。
 *
 * 隔离 PG + 全迁移链 + 低权登录，沿 privacy-erasure-http.proof 形制；零模型调用（PERF 结构面
 * 不适用；LOAD 显式 blind）。不宣称物理清除完成：S2 前 purge_pending 恒真。
 */
import 'reflect-metadata';
import { createHash } from 'node:crypto';
import {
  asPrincipal, asPrivacyWorkerExecutor, asPrivacyWorkerPrincipal,
  claimMemoryTarget, purgeMemoryTarget, claimAuthorizationTarget, consumeAuthorizationSnapshot,
  issueAuthorizationSnapshot, purgeInterviewProjectionTarget, createPool, provisionRuntimeLogin,
  historicalWeakDimensions, type Client,
} from '@meetwise/db';
import { generatePrivacyAuthzKeyPair, signPrivacyAuthorizationSnapshot } from '@meetwise/domain';

const admin = createPool();
const role = `unstube_erase_api_${process.pid}`;
const password = 'unstube-erase-api-runtime-password-2026';
let runtime: ReturnType<typeof createPool> | undefined;
let failures = 0;

function A(name: string, ok: boolean) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
}

async function json(response: Response): Promise<any> {
  return response.json();
}


const sha256 = (input: string) => createHash('sha256').update(input).digest('hex');
const memoryKeyHash = (uid: string) => sha256(`account_deletion:memory:${uid}`);

const KEY = generatePrivacyAuthzKeyPair(`unstube-erase-${process.pid}`);
const worker = `unstube_erase_worker_${process.pid}`;
const NOW_SEC = Math.floor(Date.now() / 1000);

// 签发器专用 principal（SET LOCAL ROLE privacy_issuer · 与 memory-governance/INT 证明同源）。
async function asIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE privacy_issuer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

async function main() {
  await provisionRuntimeLogin(admin, { roleName: role, password });
  runtime = createPool({ user: role, password });
  Object.assign(process.env, {
    NODE_ENV: 'test',
    WEB_ORIGIN: 'https://web.example.test',
    AUTH_SECRET: 'unstube-erase-proof-auth-secret',
    PRIVACY_ERASURE_IDEMPOTENCY_HMAC_KEY: 'unstube-erase-proof-hmac-key',
    PGUSER: role,
    PGPASSWORD: password,
  });
  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');

  const signup = async (email: string) => {
    const res = await fetch(`${base}/auth/signup`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'unstube-erase-password-2026', role: 'candidate' }),
    });
    const body = await json(res);
    if (res.status !== 200 || typeof body.token !== 'string') throw new Error(`signup_failed:${email}`);
    return body as { token: string; userId: string };
  };
  const uploadResume = async (token: string, text: string) => {
    const res = await fetch(`${base}/resume`, {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ text }),
    });
    const body = await json(res);
    return { status: res.status, resumeId: body.resumeId as string | undefined };
  };
  const auth = (token: string) => ({ authorization: `Bearer ${token}` });
  const physicalResumes = async (uid: string) =>
    Number((await admin.query('SELECT count(*)::int AS n FROM resume WHERE owner_user_id=$1', [uid])).rows[0]?.n ?? -1);

  try {
    // ════════ 种子：era1（简历软删面） / era2（三读面+账户级删除） / other（越权对照） ════════
    const era1 = await signup(`unstube-erase-era1-${process.pid}@example.test`);
    const era2 = await signup(`unstube-erase-era2-${process.pid}@example.test`);
    const other = await signup(`unstube-erase-other-${process.pid}@example.test`);
    A('Seed: 三个候选人经真实 API 注册取得 Bearer 令牌',
      typeof era1.token === 'string' && typeof era2.token === 'string' && typeof other.token === 'string');

    let era1Resume = '';
    let era2ResumeA = '';
    let otherResume = '';
    for (const [who, session] of [['era1', era1], ['era2', era2], ['other', other]] as const) {
      await fetch(`${base}/privacy/consent`, { method: 'POST', headers: { ...auth(session.token), 'content-type': 'application/json' }, body: JSON.stringify({ purpose: 'resume_processing' }) });
      const up = await uploadResume(session.token, `工作经历\n${who} 负责高并发消息队列与幂等消费系统三年，供删除受理证明`);
      A(`Seed: ${who} 上传一份简历（种子护栏 before>0）`, up.status === 200 && typeof up.resumeId === 'string');
      if (who === 'era1') era1Resume = up.resumeId!;
      else if (who === 'era2') era2ResumeA = up.resumeId!;
      else otherResume = up.resumeId!;
    }
    // era2 第二份：ADV 头中性面用掉一份后，注销时仍有一份 active 可围栏（resumesFenced>=1）。
    const era2UpB = await uploadResume(era2.token, '工作经历\nera2 第二份简历，负责分布式任务调度与幂等去重，供账户级删除受理');
    A('Seed: era2 上传第二份简历', era2UpB.status === 200 && typeof era2UpB.resumeId === 'string');
    const era2ResumeB = era2UpB.resumeId!;

    // era2 的面试 + ready 评估（三读面种子：growth/export/weakDims 都读 assessment_report）。
    // assessment_report 带 0059 投影写护栏（assert_interview_privacy_active 读 principal GUC）
    // → 沿 career-path 证明形制在 admin 连接上先绑 principal 再种子、用后清空。
    const interviewId = `unstube-erase-iv-${process.pid}`;
    await admin.query("SELECT set_config('app.principal_user',$1,false)", [era2.userId]);
    await admin.query(
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'completed',0,0,'[]'::jsonb)",
      [interviewId, era2.userId],
    );
    const dims = JSON.stringify([{ dimension: '并发', score: 40, gap: true }, { dimension: '限流', score: 75, gap: false }]);
    await admin.query(
      `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions,overall)
       VALUES ($1,$2,$3,'ready',$4::jsonb,58)`,
      [`unstube-erase-ar-${process.pid}`, era2.userId, interviewId, dims],
    );
    await admin.query("SELECT set_config('app.principal_user','',false)");

    // ════════ NEG：未认证 / 越权 404 不分叉 ════════
    const unauth = await fetch(`${base}/resume/${era1Resume}`, { method: 'DELETE' });
    A('NEG: 未认证删除简历 → 401（fail-closed）', unauth.status === 401);

    const cross = await fetch(`${base}/resume/${era1Resume}`, { method: 'DELETE', headers: auth(other.token) });
    A('NEG: 越权删除（other 删 era1 的简历）→ 404 不分叉不泄漏', cross.status === 404);
    A('NEG: 越权删除后物理行仍在且未被围栏',
      (await admin.query('SELECT status FROM resume WHERE id=$1', [era1Resume])).rows[0]?.status === 'ingested');

    // ════════ P-04：单删受理 + 不撒谎 + 幂等重放 ════════
    const beforeList1 = (await json(await fetch(`${base}/resume`, { headers: auth(era1.token) }))).resumes.length;
    const beforePhysical1 = await physicalResumes(era1.userId);
    A('BOUND-Seed: era1 列表 before>0（种子护栏）', beforeList1 > 0 && beforePhysical1 > 0);

    const del1 = await fetch(`${base}/resume/${era1Resume}`, { method: 'DELETE', headers: auth(era1.token) });
    const del1Body = await json(del1);
    A('S1: 单删 → 202 + mode=logical + purgePending=true（非完成态）',
      del1.status === 202 && del1Body.mode === 'logical' && del1Body.purgePending === true
      && typeof del1Body.requestId === 'string' && del1Body.resumeId === era1Resume);

    const tomb = (await admin.query('SELECT status, erasure_requested_at FROM resume WHERE id=$1', [era1Resume])).rows[0];
    A('不撒谎: 物理行仍在 — status=erasure_fenced 且 erasure_requested_at 非空',
      tomb?.status === 'erasure_fenced' && tomb?.erasure_requested_at != null);

    const ledger1 = (await admin.query(
      "SELECT count(*)::int AS n FROM privacy_erasure_request WHERE scope='resume_data' AND subject_id=$1",
      [era1Resume])).rows[0]?.n;
    A('S1: 受理恰建 1 条 resume_data request（无物理 purge target,S2 登记）', ledger1 === 1);

    const listAfter1 = (await json(await fetch(`${base}/resume`, { headers: auth(era1.token) }))).resumes.length;
    const profileAfter1 = await fetch(`${base}/resume/${era1Resume}/profile`, { headers: auth(era1.token) });
    A('NEG-读面: 软删后列表不含 + profile 404（0063 active-read RLS 即时生效）',
      listAfter1 === beforeList1 - 1 && profileAfter1.status === 404);
    A('不撒谎: 列表收缩但物理行数不变（双断言并列）', (await physicalResumes(era1.userId)) === beforePhysical1);

    // ════════ BOUND：重放幂等 + 并发双删恰一 winner ════════
    const replay = await fetch(`${base}/resume/${era1Resume}`, { method: 'DELETE', headers: auth(era1.token) });
    const replayBody = await json(replay);
    A('BOUND: 二次单删 → 202 同态（alreadyFenced + 同 requestId）',
      replay.status === 202 && replayBody.alreadyFenced === true && replayBody.requestId === del1Body.requestId);
    A('BOUND: 二次删不建第二份账',
      (await admin.query("SELECT count(*)::int AS n FROM privacy_erasure_request WHERE scope='resume_data' AND subject_id=$1", [era1Resume])).rows[0]?.n === 1);

    const raceUp = await uploadResume(era1.token, '工作经历\n并发双删专用简历，负责分布式任务调度与幂等去重');
    const raceResume = raceUp.resumeId!;
    const [raceA, raceB] = await Promise.all([
      fetch(`${base}/resume/${raceResume}`, { method: 'DELETE', headers: auth(era1.token) }),
      fetch(`${base}/resume/${raceResume}`, { method: 'DELETE', headers: auth(era1.token) }),
    ]);
    A('BOUND: 并发双删恰一 winner（账本恰 1 行）且两响应均 202',
      raceA.status === 202 && raceB.status === 202
      && (await admin.query("SELECT count(*)::int AS n FROM privacy_erasure_request WHERE scope='resume_data' AND subject_id=$1", [raceResume])).rows[0]?.n === 1);

    // ════════ P-05：全量删受理（era1 现上传一份新 active 简历作为全量删对象） ════════
    const bulkUp = await uploadResume(era1.token, '工作经历\nera1 全量删受理专用简历，负责缓存一致性协议与幂等投递');
    A('P-05-Seed: era1 全量删前存在 active 简历（种子护栏 before>0）', bulkUp.status === 200 && typeof bulkUp.resumeId === 'string');
    const bulk1 = await fetch(`${base}/privacy/resume-data`, { method: 'DELETE', headers: auth(era1.token) });
    const bulk1Body = await json(bulk1);
    A('S1: 全量删 → 202 + mode=logical + purgePending=true + resumesFenced>=1',
      bulk1.status === 202 && bulk1Body.mode === 'logical' && bulk1Body.purgePending === true && bulk1Body.resumesFenced >= 1);
    const emptyBulk = await fetch(`${base}/privacy/resume-data`, { method: 'DELETE', headers: auth(era1.token) });
    const emptyBulkBody = await json(emptyBulk);
    A('S1: 空集重放 → 202 resumesFenced=0 同形（幂等不重复建账）',
      emptyBulk.status === 202 && emptyBulkBody.resumesFenced === 0);
    A('不撒谎: era1 物理行数不变（首份+并发+全量删对象=before+2,软删≠物理删除）', (await physicalResumes(era1.userId)) === beforePhysical1 + 2);

    // ════════ 三读面（R4）：单场围栏（0129 预览=产品侧入口）后 growth/export/weakDims 不可见 ════════
    const growthBefore = await json(await fetch(`${base}/profile/growth`, { headers: auth(era2.token) }));
    const exportBefore = await json(await fetch(`${base}/privacy/export`, { headers: auth(era2.token) }));
    const weakBefore = await asPrincipal(runtime, era2.userId, (c) => historicalWeakDimensions(c, era2.userId));
    A('R4-Seed: 围栏前 growth 含评估点 + export 含该面试 + 弱项含「并发」',
      (growthBefore.points?.length ?? 0) > 0
      && (exportBefore.interviews ?? []).some((x: any) => x.id === interviewId)
      && (exportBefore.assessments ?? []).some((x: any) => x.interview_id === interviewId)
      && weakBefore.includes('并发'));

    const previewFence = await fetch(`${base}/privacy/erasure-preview`, {
      method: 'POST',
      headers: { ...auth(era2.token), 'content-type': 'application/json', 'idempotency-key': `unstube-fence-${process.pid}` },
      body: JSON.stringify({ scope: 'interview_data', subjectId: interviewId }),
    });
    A('R4-Setup: 0129 预览路径受理单场围栏（202 local_fenced）', previewFence.status === 202);

    const guardAfter = await fetch(`${base}/interview/${interviewId}`, { headers: auth(era2.token) });
    A('NEG-guard: 围栏后 GET interview → 410 interview_privacy_fenced',
      guardAfter.status === 410 && (await json(guardAfter)).error === 'interview_privacy_fenced');

    const growthAfter = await json(await fetch(`${base}/profile/growth`, { headers: auth(era2.token) }));
    const exportAfter = await json(await fetch(`${base}/privacy/export`, { headers: auth(era2.token) }));
    const weakAfter = await asPrincipal(runtime, era2.userId, (c) => historicalWeakDimensions(c, era2.userId));
    A('R4: 围栏后 growth 不含该面试评估（成长档案零泄漏）', !JSON.stringify(growthAfter).includes(interviewId));
    A('R4: 围栏后 export 第三查不含该面试（interviews+assessments 双面）',
      !(exportAfter.interviews ?? []).some((x: any) => x.id === interviewId)
      && !(exportAfter.assessments ?? []).some((x: any) => x.interview_id === interviewId));
    A('R4: 围栏后 memory historicalWeakDimensions 不再给出「并发」（弱项偏置零泄漏）',
      !weakAfter.includes('并发'));

    // ════════ ADV：JWS 冒充 Bearer 原值 401；x-privacy-authorization 头不改变受理语义 ════════
    const privacyJws = signPrivacyAuthorizationSnapshot({
      privateKeyPem: KEY.privateKeyPem, kid: KEY.kid,
      actor: era1.userId, owner: era1.userId, interview: interviewId,
      purpose: 'interview_data_erasure', privacyEpoch: 1,
      targets: [{ kind: 'checkpoint_rows', resource: '2'.repeat(64) }],
      nowSec: NOW_SEC, ttlSec: 600,
    }).jws;
    const jwsAsBearer = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { authorization: `Bearer ${privacyJws}`, 'idempotency-key': `unstube-jws-${process.pid}` },
    });
    A('ADV-P3 原值: 隐私 JWS 不能冒充登录令牌 → 401', jwsAsBearer.status === 401);
    const interviewClosed = await fetch(`${base}/privacy/interview-data/${interviewId}`, {
      method: 'DELETE', headers: { ...auth(era2.token), 'idempotency-key': `unstube-closed-${process.pid}` },
    });
    A('rev2-R1: 公开 interview-data DELETE 维持关闭 → 503（不建账本）',
      interviewClosed.status === 503 && (await json(interviewClosed)).error === 'interview_erasure_authorization_not_available');
    const headerNeutral = await fetch(`${base}/resume/${era2ResumeA}`, {
      method: 'DELETE', headers: { ...auth(era2.token), 'x-privacy-authorization': privacyJws },
    });
    const headerNeutralBody = await json(headerNeutral);
    A('ADV-P4 新义: x-privacy-authorization 头既非必需也无特权 → 单删照常 202 受理',
      headerNeutral.status === 202 && headerNeutralBody.mode === 'logical' && headerNeutralBody.purgePending === true);

    // ════════ FAULT：注销事务中途失败 → 无部分态（账本投毒 23505 → 整体回滚） ════════
    await admin.query(
      `INSERT INTO privacy_erasure_request(owner_user_id,scope,subject_id,idempotency_key_hash,status,privacy_epoch)
       VALUES ($1,'resume_data','poison',$2,'fenced',1)`,
      [era2.userId, memoryKeyHash(era2.userId)],
    );
    const era2InterviewsBefore = Number((await admin.query('SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1', [era2.userId])).rows[0]?.n ?? -1);
    const poisoned = await fetch(`${base}/profile/deactivate`, {
      method: 'POST', headers: { ...auth(era2.token), 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'unstube-erase-password-2026' }),
    });
    A('FAULT: 投毒后注销受理中途失败（23505→全局过滤器 409 conflict,不伪受理）',
      poisoned.status === 409 && (await json(poisoned)).error === 'conflict');
    A('FAULT: 无部分态 — 简历未围栏/面试未建账/账户仍 active/deleted_at 空/会话仍可用',
      (await admin.query("SELECT status FROM resume WHERE id=$1", [era2ResumeB])).rows[0]?.status === 'ingested'
      && (await admin.query("SELECT count(*)::int AS n FROM privacy_erasure_request WHERE scope='interview_data' AND owner_user_id=$1", [era2.userId])).rows[0]?.n === 1
      && era2InterviewsBefore === 1
      && (await admin.query("SELECT status FROM user_account WHERE id=$1", [era2.userId])).rows[0]?.status === 'active'
      && (await admin.query('SELECT deleted_at FROM user_account WHERE id=$1', [era2.userId])).rows[0]?.deleted_at === null
      && (await json(await fetch(`${base}/profile`, { headers: auth(era2.token) }))).status === 'active');
    await admin.query("DELETE FROM privacy_erasure_request WHERE owner_user_id=$1 AND subject_id='poison'", [era2.userId]);

    // ════════ P-07：注销 + 发起账户级删除 ════════
    const wrongPw = await fetch(`${base}/profile/deactivate`, {
      method: 'POST', headers: { ...auth(era2.token), 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'definitely-wrong-password' }),
    });
    A('NEG: 注销密码错 → 401 且零副作用（账户/账本/围栏三面不变）',
      wrongPw.status === 401
      && (await admin.query("SELECT status FROM user_account WHERE id=$1", [era2.userId])).rows[0]?.status === 'active'
      && (await admin.query("SELECT count(*)::int AS n FROM privacy_erasure_request WHERE owner_user_id=$1 AND scope='account_data'", [era2.userId])).rows[0]?.n === 0);
    const missingPw = await fetch(`${base}/profile/deactivate`, {
      method: 'POST', headers: { ...auth(era2.token), 'content-type': 'application/json' }, body: JSON.stringify({}),
    });
    A('NEG: 注销缺密码 → 400（高危操作二次确认）', missingPw.status === 400);

    const deactivate = await fetch(`${base}/profile/deactivate`, {
      method: 'POST', headers: { ...auth(era2.token), 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'unstube-erase-password-2026' }),
    });
    const deactivateBody = await json(deactivate);
    A('S1: 注销+账户级删除 → 202 + mode=logical + purgePending=true + deletedAt + 两轨计数',
      deactivate.status === 202 && deactivateBody.mode === 'logical' && deactivateBody.purgePending === true
      && typeof deactivateBody.deletedAt === 'string' && deactivateBody.resumesFenced >= 1 && deactivateBody.interviewsFenced >= 1);

    const acct = (await admin.query('SELECT status, deleted_at FROM user_account WHERE id=$1', [era2.userId])).rows[0];
    A('不撒谎: 账户物理行仍在 — status=disabled 且 deleted_at 非空', acct?.status === 'disabled' && acct?.deleted_at != null);
    A('不撒谎: 面试物理行仍在（fence 由账本行表达,行不删）',
      (await admin.query('SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1', [era2.userId])).rows[0]?.n === era2InterviewsBefore);

    // ════════ NEG：注销后登录拒 + 旧 Bearer 拒 + 重放不重复建账 ════════
    const staleBearer = await fetch(`${base}/profile`, { headers: auth(era2.token) });
    A('NEG: 注销后旧 Bearer → 401 account_inactive', staleBearer.status === 401 && (await json(staleBearer)).error === 'account_inactive');
    const relogin = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `unstube-erase-era2-${process.pid}@example.test`, password: 'unstube-erase-password-2026' }),
    });
    A('NEG: 注销后 login → 401（status!=active 拒绝）', relogin.status === 401);
    const ledgerBeforeReplay = Number((await admin.query("SELECT count(*)::int AS n FROM privacy_erasure_request WHERE owner_user_id=$1", [era2.userId])).rows[0]?.n ?? -1);
    const replayDeactivate = await fetch(`${base}/profile/deactivate`, {
      method: 'POST', headers: { ...auth(era2.token), 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'unstube-erase-password-2026' }),
    });
    A('BOUND: 注销重放 → 401 account_inactive（守卫先拒,不重复建账）',
      replayDeactivate.status === 401 && (await json(replayDeactivate)).error === 'account_inactive'
      && (await admin.query("SELECT count(*)::int AS n FROM privacy_erasure_request WHERE owner_user_id=$1", [era2.userId])).rows[0]?.n === ledgerBeforeReplay);

    // ════════ 4-target 断言（rev2 R1：账户级删除的面试面 = 0096 projection 形） ════════
    const projectionRequests = (await admin.query(
      `SELECT r.id, r.status, r.privacy_epoch, r.target_set_digest
         FROM privacy_erasure_request r
        WHERE r.owner_user_id=$1 AND r.scope='interview_data' AND r.subject_id=$2
        ORDER BY r.created_at, r.id`,
      [era2.userId, interviewId])).rows;
    const deactivateRequest = projectionRequests[projectionRequests.length - 1];
    const targetShape = (await admin.query(
      `SELECT
         count(*)::int AS total,
         count(*) FILTER (WHERE sink IN ('event','ai_graph_run','report') AND status='pending')::int AS projection_pending,
         count(*) FILTER (WHERE sink='checkpoint_rows' AND status='erased')::int AS fence_anchor
       FROM privacy_deletion_target WHERE request_id=$1`, [deactivateRequest.id])).rows[0];
    A('R1: 注销发起的面试面 request 恰 4 target（3 pending 投影 + 1 erased fence 锚）',
      projectionRequests.length >= 1 && targetShape?.total === 4
      && targetShape?.projection_pending === 3 && targetShape?.fence_anchor === 1);

    // ════════ 完成推进（审计批 4 验收）：默认 compose（隔离 PG 全迁移链）+ 已建 PRIV 链 ════════
    // 面试面：0096 投影链（0091 冻结 issuer 快照 → claim → purge）→ completed。
    const projectionTargets = (await admin.query(
      'SELECT id, sink, resource_hmac FROM privacy_deletion_target WHERE request_id=$1 ORDER BY sink', [deactivateRequest.id])).rows;
    const signedProjection = signPrivacyAuthorizationSnapshot({
      privateKeyPem: KEY.privateKeyPem, kid: KEY.kid,
      actor: era2.userId, owner: era2.userId, interview: interviewId,
      purpose: 'interview_data_erasure', privacyEpoch: Number(deactivateRequest.privacy_epoch),
      targets: projectionTargets.map((t) => ({ kind: t.sink, resource: t.resource_hmac })),
      nowSec: NOW_SEC, ttlSec: 600,
    });
    await asIssuer(era2.userId, (c) => issueAuthorizationSnapshot(c, {
      jti: signedProjection.jti, keyId: KEY.kid, actor: era2.userId, interviewId,
      purpose: 'interview_data_erasure', privacyEpoch: Number(deactivateRequest.privacy_epoch),
      targetSetDigest: signedProjection.targetSetDigest, expiresAt: new Date(signedProjection.expiresAtMs),
    }));
    await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signedProjection.jti, worker));
    let projectionCompletedSeen = false;
    for (const t of projectionTargets) {
      if (t.sink === 'checkpoint_rows') continue;   // fence 锚不可认领（0096 立法）
      const claimed = await asPrivacyWorkerPrincipal(admin, era2.userId, (c) =>
        claimAuthorizationTarget(c, signedProjection.jti, t.id, worker, 60));
      if (!claimed) continue;
      const purged = await asPrivacyWorkerPrincipal(admin, era2.userId, (c) =>
        purgeInterviewProjectionTarget(c, t.id, claimed.leaseToken));
      if (purged.requestStatus === 'completed') projectionCompletedSeen = true;
    }
    A('完成推进: 面试面 request 由已建链推进 completed（purge 收尾返回+账本复核）',
      projectionCompletedSeen
      && (await admin.query('SELECT status FROM privacy_erasure_request WHERE id=$1', [deactivateRequest.id])).rows[0]?.status === 'completed');

    // 记忆面：0093 account_data 链 → completed。
    const memoryRequest = (await admin.query(
      "SELECT id, status, privacy_epoch, target_set_digest FROM privacy_erasure_request WHERE owner_user_id=$1 AND scope='account_data' ORDER BY created_at DESC, id DESC LIMIT 1",
      [era2.userId])).rows[0];
    const memoryTargets = (await admin.query(
      'SELECT id, sink, resource_hmac FROM privacy_deletion_target WHERE request_id=$1 ORDER BY sink', [memoryRequest.id])).rows;
    const signedMemory = signPrivacyAuthorizationSnapshot({
      privateKeyPem: KEY.privateKeyPem, kid: KEY.kid,
      actor: era2.userId, owner: era2.userId, interview: era2.userId,
      purpose: 'account_data_erasure', privacyEpoch: Number(memoryRequest.privacy_epoch),
      targets: memoryTargets.map((t) => ({ kind: t.sink, resource: t.resource_hmac })),
      nowSec: NOW_SEC, ttlSec: 600,
    });
    await asIssuer(era2.userId, (c) => issueAuthorizationSnapshot(c, {
      jti: signedMemory.jti, keyId: KEY.kid, actor: era2.userId, interviewId: era2.userId,
      purpose: 'account_data_erasure', privacyEpoch: Number(memoryRequest.privacy_epoch),
      targetSetDigest: signedMemory.targetSetDigest, expiresAt: new Date(signedMemory.expiresAtMs),
    }));
    await asPrivacyWorkerExecutor(admin, (c) => consumeAuthorizationSnapshot(c, signedMemory.jti, worker));
    let memoryCompletedSeen = false;
    for (const t of memoryTargets) {
      const claimed = await asPrivacyWorkerPrincipal(admin, era2.userId, (c) =>
        claimMemoryTarget(c, signedMemory.jti, t.id, worker, 60));
      if (!claimed) continue;
      const purged = await asPrivacyWorkerPrincipal(admin, era2.userId, (c) =>
        purgeMemoryTarget(c, t.id, claimed.leaseToken));
      if (purged.requestStatus === 'completed') memoryCompletedSeen = true;
    }
    A('完成推进: 记忆面 account_data request 推进 completed（3 可解析 MEM sink 全 purge）',
      memoryCompletedSeen
      && (await admin.query('SELECT status FROM privacy_erasure_request WHERE id=$1', [memoryRequest.id])).rows[0]?.status === 'completed');

    // 简历轨：无 worker（S2-a 登记）→ request 保持 fenced + purgePending 恒真（不撒谎）。
    A('不撒谎: 简历轨 request 无 purge worker（S2 登记）→ 保持 fenced,绝不伪称 completed',
      (await admin.query(
        "SELECT count(*)::int AS n FROM privacy_erasure_request WHERE owner_user_id=$1 AND scope='resume_data' AND status='fenced'",
        [era2.userId])).rows[0]?.n >= 1);

    // DB 级三读面终检：注销后（账户 disabled 不影响谓词）弱项读取面为空。
    const weakFinal = await asPrincipal(runtime, era2.userId, (c) => historicalWeakDimensions(c, era2.userId));
    A('R4-终检: 注销后 memory 弱项读取面为空（账户级删除零泄漏）', weakFinal.length === 0);
    A('不撒谎-终检: other 的简历全程未被触碰（跨账户零越界）',
      (await admin.query('SELECT status FROM resume WHERE id=$1', [otherResume])).rows[0]?.status === 'ingested');

    console.log(failures === 0 ? '\n✓ UNSTUB-ERASE rev2 主证明全部通过（软删受理 · 物理行仍在 · purgePending 恒真 · 完成推进=已建链）'
      : `\n✗ ${failures} 项失败`);
  } finally {
    await app.close();
    await runtime?.end();
    await admin.query(`DROP ROLE IF EXISTS ${role}`);
    await admin.end();
  }
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });
