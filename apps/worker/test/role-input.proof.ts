/**
 * ROLE-INPUT (#259 目标岗位输入) prove —— worker 侧 payload→planner 段(REQUEST rev4 §3 C8·断言三段式落槽:归一化三形与
 * payload 键写入/不写归 api `apps/api/test/role-input.proof.ts`;表单空串不发头归 web `web-logic.proof.ts`)。
 *
 * 判据(REQUEST §4 矩阵·rev4 v3 基线 fixture 纪律:叶命中 fixture,禁断言 v1 undecided-409):
 *   ① 填岗位的 start job → planner buildData 含用户岗位且**不含** snapshot 叶串(优先序坐实);
 *   ② 留空走现状路由(byte-identical):planner userData=岗位:<snapshot 叶>;payload 零 targetRole 键;resolver 源 undefined;
 *   ③ 优先序边界:a) 双在用户胜(①);b) flag-off 用户仍胜(不走 deps/legacy);c) 用户在场+snapshot 缺失+flag ON →
 *      仍 throw adaptive_role_route_missing(门零弱化);d) 旧 job 无键 → undefined 容忍不崩(沿 requestId 缺失容忍形制);
 *   ④ begin 传输面归 api 侧(见头注)。
 * fake seam 总策:捕获型 ModelClient(记 req.service/system/userData 后按剧本返 raw;断言**请求对象字段**)·零 Key·零网络·est live=0。
 * 运行:仅经 scripts/run-e2e-isolated.mjs role-input:prove:raw(隔离 PG;assertIsolatedTestTarget 钉死,禁影子 schema 假绿)。
 */
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  assertIsolatedTestTarget, asPrincipal, availableUnits, createPool, createResumeWithBlob,
  enqueueInterviewJob, getInterviewRouteSnapshotForAdaptiveRole, reserveEntitlement,
  supplyCandidateProfileRoute, transitionResume, completeIngestion,
} from '@meetwise/db';
import { ingestResume, type ResumeProfile } from '@meetwise/domain';
import type { CompletionRequest, ModelClient, ModelResult } from '@meetwise/ai-runtime';
import { selectPlannerFacts, buildResumeFactPool } from '../src/adaptive-interview-service.ts';
import {
  ADAPTIVE_ROLE_ROUTE_MISSING, LEGACY_TECH_ROLE_DEFAULT, MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV,
  resolveAdaptiveInterviewRole,
} from '../src/adaptive-role-resolve.ts';
import { interviewDispatchTick, type ConsumerDeps } from '../src/interview-consumer.ts';

let failures = 0;
const A = (name: string, condition: boolean, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${condition || !detail ? '' : `  [${detail}]`}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER = `role-input-proof-${process.pid}`;
const RESUME = [
  '工作经历',
  '负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。',
  '技能',
  'Redis、限流、分布式锁',
].join('\n');
const USER_ROLE = '后端开发工程师';
const DEPS_SEAM_ROLE = 'deps-seam-role';

// ── 捕获型模型(seam 策略:断言 CompletionRequest 对象字段;剧本面镜像 interview.proof 形制) ──
interface Captured { service: string; system: string; userData: string; rag?: string }
const captureAll: Captured[] = [];
function captureDispatchModel(captured: Captured[]): ModelClient {
  return {
    async complete(req: CompletionRequest): Promise<ModelResult> {
      captured.push({ service: req.service, system: req.system, userData: req.userData, rag: req.rag });
      if (req.service === 'planner.competencies') return { ok: true, raw: { competencies: ['高并发'] } };
      if (req.service === 'resume-quiz.generate') return { ok: true, raw: { items: [{ q: `请说明你的 Redis 限流改造取舍与验证方法(${captured.length})。`, refs: ['Redis'] }] } };
      if (req.service === 'interviewer.ask') return { ok: true, raw: { q: `请说明高并发限流的取舍,并给出验证方法(${captured.length})。`, refs: [] } };
      if (req.service === 'mock-interview.evaluate') return { ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'meets', quote: 'Redis' }] } };
      return { ok: false, kind: 'deterministic' as const };
    },
  };
}

// ── U. 纯单元:resolver 优先序矩阵(§4③;门语义零弱化断言本体;env 显式传入零进程污染) ──
function sectionU() {
  const flagOn = {} as NodeJS.ProcessEnv;                       // unset → fail-closed ON(产品默认)
  const flagOff = { [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: '0' } as NodeJS.ProcessEnv;
  let e: unknown;
  // a) 用户输入+snapshot 双在(flag ON)→ 用户串胜
  A('U1 双在用户胜(优先序#1>#2,flag ON)', resolveAdaptiveInterviewRole({ roleFromUserInput: USER_ROLE, roleFromRouteSnapshot: 'backend/nodejs' }, flagOn) === USER_ROLE);
  // c) 用户输入+snapshot 缺失(flag ON)→ 仍 throw(门零弱化:用户输入不解锁供给存在性门)
  e = undefined;
  try { resolveAdaptiveInterviewRole({ roleFromUserInput: USER_ROLE }, flagOn); }
  catch (err) { e = err; }
  A('U2 用户在场+缺 snapshot 仍 throw adaptive_role_route_missing(门零弱化)', (e as { code?: string })?.code === ADAPTIVE_ROLE_ROUTE_MISSING);
  // 现状面:仅 snapshot → 叶;全缺 flag ON → throw;deps/legacy 仅 flag-off 可达
  A('U3 仅 snapshot → 叶(flag ON·现状)', resolveAdaptiveInterviewRole({ roleFromRouteSnapshot: 'backend/nodejs' }, flagOn) === 'backend/nodejs');
  e = undefined;
  try { resolveAdaptiveInterviewRole({}, flagOn); }
  catch (err) { e = err; }
  A('U4 全缺 flag ON → throw(现状)', (e as { code?: string })?.code === ADAPTIVE_ROLE_ROUTE_MISSING);
  // b) 用户输入+flag-off → 用户串胜、不走 deps/legacy
  A('U5 flag-off 用户胜(不走 deps/legacy)', resolveAdaptiveInterviewRole({ roleFromUserInput: USER_ROLE, roleFromDeps: DEPS_SEAM_ROLE }, flagOff) === USER_ROLE);
  A('U6 flag-off deps seam 可达(现状)', resolveAdaptiveInterviewRole({ roleFromDeps: DEPS_SEAM_ROLE }, flagOff) === DEPS_SEAM_ROLE);
  A('U7 flag-off 全缺 → legacy 默认(现状)', resolveAdaptiveInterviewRole({}, flagOff) === LEGACY_TECH_ROLE_DEFAULT);
  // d) 旧 job 无键/纯空白 → undefined 容忍(沿 requestId 同形制;空白≠值)
  A('U8 纯空白用户输入视同 undefined → 落 snapshot 叶', resolveAdaptiveInterviewRole({ roleFromUserInput: '   ', roleFromRouteSnapshot: 'backend/nodejs' }, flagOn) === 'backend/nodejs');
  A('U9 空串用户输入 flag-off 落 deps(容忍不崩)', resolveAdaptiveInterviewRole({ roleFromUserInput: '', roleFromDeps: DEPS_SEAM_ROLE }, flagOff) === DEPS_SEAM_ROLE);
}

async function main() {
  sectionU();
  section('fixture:隔离库·生产同链(简历→ingested→interview 绑定→route 供给→预留→入队)');
  const pool = createPool();
  await assertIsolatedTestTarget(pool);
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '30 days')",
      [OWNER],
    );
  });
  const resume = await asPrincipal(pool, OWNER, async (c) => {
    const created = await createResumeWithBlob(c, OWNER, RESUME);
    await transitionResume(c, OWNER, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, created.resumeId, ingestResume(RESUME));
    return created.resumeId;
  });
  const epoch = Number((await asPrincipal(pool, OWNER, async (c) => await c.query<{ privacy_epoch: number }>(
    'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resume, OWNER],
  ))).rows[0]?.privacy_epoch);
  if (!Number.isFinite(epoch)) throw new Error(`fixture_epoch_unreadable:resume=${resume}`);

  /** 造一场面试:withRoute=生产同链供给 snapshot(缺供给仅供 ③c 死角行使);payload 由调用方定(=api begin 写出形)。 */
  const makeInterview = async (tag: string, opts: { withRoute: boolean }): Promise<{ iid: string; leaf: string }> => {
    const iid = `ri-${tag}-${Date.now()}-${randomUUID().slice(0, 8)}`;
    await asPrincipal(pool, OWNER, (c) => c.query(
      "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)",
      [iid, OWNER, resume, epoch],
    ));
    let leaf = '';
    if (opts.withRoute) {
      const supply = await asPrincipal(pool, OWNER, (c) => supplyCandidateProfileRoute(c, OWNER, iid, resume));
      A(`fixture ${tag} route 供给(v3 恒 decided)`, supply.status === 'supplied', String((supply as { status?: string }).status));
      const snap = await asPrincipal(pool, OWNER, (c) => getInterviewRouteSnapshotForAdaptiveRole(c, OWNER, iid));
      leaf = typeof snap?.allocations?.[0]?.leafTrackId === 'string' ? (snap!.allocations![0]!.leafTrackId as string).trim() : '';
      A(`fixture ${tag} snapshot 叶可读(生产同链)`, leaf.length > 0, `leaf=${leaf}`);
    }
    await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, iid, 'mock_interview', 1));
    return { iid, leaf };
  };
  const unitsBefore = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  const deps: ConsumerDeps = {
    pool,
    cp: new MemorySaver() as any,
    model: captureDispatchModel(captureAll),
    leaseOwner: `role-input-proof-worker-${process.pid}`,
    adaptive: {
      role: DEPS_SEAM_ROLE,
      maxTurns: 2,
      absoluteMaxTurns: 2,
      localRetrieve: async () => [],
      webExplore: async () => [],
    },
  };
  const plannerCallsSince = (from: number) => captureAll.slice(from).filter((x) => x.service === 'planner.competencies');
  const firstQuestionOf = async (iid: string) => asPrincipal(pool, OWNER, async (c) => (await c.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM interview_question WHERE interview_id=$1 AND status='issued'", [iid],
  )).rows[0]!.n);

  // ── ① 填岗位:start job payload 带 targetRole → planner userData=用户岗位,零 snapshot 叶串 ──
  section('① 用户岗位入 planner <data>(优先序#1>#2 坐实)');
  const t1 = await makeInterview('user-role', { withRoute: true });
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, t1.iid, 'start', { requestId: 'role-input-user', targetRole: USER_ROLE }, 0));
  const before1 = captureAll.length;
  const tick1 = await interviewDispatchTick(deps);
  const planner1 = plannerCallsSince(before1)[0];
  A('①a 调度器消费 owner 队列(owners=1)', tick1.owners === 1);
  A('①b planner 调用在场且 service=planner.competencies', !!planner1);
  A('①c planner userData 岗位行=用户输入串(buildData v.role 同形参)', !!planner1 && planner1.userData.startsWith(`岗位:${USER_ROLE}\n简历事实:\n`),
    planner1?.userData.slice(0, 40));
  A('①d planner userData 零 snapshot 叶串(用户输入胜过规则路由叶·优先序坐实)', !!planner1 && !planner1.userData.includes(t1.leaf), `leaf=${t1.leaf}`);
  A('①e start job 全链投影 issued 首题(消费不因新源中断)', await firstQuestionOf(t1.iid) >= 1);
  A('①f selectPlannerFacts 同源收用户串(排序面同参·≤8 条预算)', (() => {
    const pool1 = buildResumeFactPool(ingestResume(RESUME) as unknown as { experience?: unknown; skills?: unknown });
    const picked = selectPlannerFacts(pool1, USER_ROLE);
    return picked.length <= 8 && picked.every((f) => f.length <= 120);
  })());

  // ── ② 留空:payload 零键(旧 job 无键同形)→ 现状路由 leaf,byte-identical 判据 ──
  section('② 留空=现状路由(byte-identical·兼 ③d 旧 job 无键容忍)');
  const t2 = await makeInterview('empty-role', { withRoute: true });
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, t2.iid, 'start', { requestId: 'role-input-empty' }, 0));
  const before2 = captureAll.length;
  await interviewDispatchTick(deps);
  const planner2 = plannerCallsSince(before2)[0];
  A('②a planner userData 岗位行=snapshot 叶(与现状逐字节一致)', !!planner2 && planner2.userData.startsWith(`岗位:${t2.leaf}\n`), planner2?.userData.slice(0, 40));
  const payload2 = await asPrincipal(pool, OWNER, async (c) => (await c.query<{ payload: unknown; role: string | null }>(
    "SELECT payload, payload->>'targetRole' AS role FROM interview_job WHERE interview_id=$1 AND kind='start'", [t2.iid],
  )).rows[0]);
  A('②b payload 零 targetRole 键(JSON.stringify({requestId}) 与现状逐字节)', payload2?.role === null && JSON.stringify(payload2?.payload) === JSON.stringify({ requestId: 'role-input-empty' }),
    JSON.stringify(payload2?.payload));
  A('②c 旧 job 无键消费不崩(issued 首题在·③d 判据)', await firstQuestionOf(t2.iid) >= 1);

  // ── ③b flag-off:用户输入仍胜(不走 deps/legacy)──
  section('③b flag-off 用户胜(deps seam 与 legacy 默认零胜出)');
  const t3 = await makeInterview('flag-off', { withRoute: true });
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, t3.iid, 'start', { requestId: 'role-input-flagoff', targetRole: USER_ROLE }, 0));
  const before3 = captureAll.length;
  const prevFlag = process.env[MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV];
  process.env[MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV] = '0';
  let tick3: Awaited<ReturnType<typeof interviewDispatchTick>>;
  try { tick3 = await interviewDispatchTick(deps); }
  finally {
    if (prevFlag === undefined) delete process.env[MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV];
    else process.env[MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV] = prevFlag;
  }
  const planner3 = plannerCallsSince(before3)[0];
  A('③b-1 flag-off 消费完成(owners=1)', tick3.owners === 1);
  A('③b-2 planner userData=用户输入串(胜过 deps seam)', !!planner3 && planner3.userData.startsWith(`岗位:${USER_ROLE}\n`), planner3?.userData.slice(0, 40));
  A('③b-3 零 deps-seam 串/零 legacy 默认串(userData 全差分)', !!planner3 && !planner3.userData.includes(DEPS_SEAM_ROLE) && !planner3.userData.includes(LEGACY_TECH_ROLE_DEFAULT));
  A('③b-4 flag 复原(默认 fail-closed ON)', process.env[MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV] === prevFlag);

  // ── ③c 用户在场+snapshot 缺失+flag ON → 仍 throw(门零弱化·供给账本存在性门不因用户输入解锁) ──
  section('③c 缺 snapshot 仍 throw(门零弱化·死角行使=fixture 有意不供给)');
  const t4 = await makeInterview('no-route', { withRoute: false });
  await asPrincipal(pool, OWNER, (c) => enqueueInterviewJob(c, OWNER, t4.iid, 'start', { requestId: 'role-input-noroute', targetRole: USER_ROLE }, 0));
  const before4 = captureAll.length;
  await interviewDispatchTick(deps);
  const failedJob = await asPrincipal(pool, OWNER, async (c) => (await c.query<{ status: string; last_error: string | null }>(
    "SELECT status, last_error FROM interview_job WHERE interview_id=$1 AND kind='start'", [t4.iid],
  )).rows[0]);
  A('③c-1 job failed 且 last_error=adaptive_role_route_missing(用户输入未解锁供给存在性门)',
    failedJob?.status === 'failed' && (failedJob.last_error ?? '').includes(ADAPTIVE_ROLE_ROUTE_MISSING),
    `status=${failedJob?.status} last_error=${failedJob?.last_error}`);
  A('③c-2 消费面零 planner 调用(门在 planner 之前 fail-closed)', plannerCallsSince(before4).length === 0);

  // ── 额度收口:三场供给面各扣 1,③c 死角场由 failInterviewAndRelease 释放(无静默泄漏) ──
  const unitsAfter = await asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
  A('④ 额度账实相符(3 场扣 1+死角场释放=net 3)', unitsBefore - unitsAfter === 3, `before=${unitsBefore} after=${unitsAfter}`);

  // ── ⑤ quiz 链(#230·S1 同形镜像):prompt v2 条件段+缺省回退 v1 字节(捕获型 ModelClient·真 invoke 链·零外呼) ──
  section('⑤ quiz prompt(#230):v2 条件段+缺省回退 v1 字节(B 片断言落槽:并入 worker role-input proof·收据注明)');
  const { quizGenerator } = await import('../src/interview-service.ts');
  const { getPrompt } = await import('@meetwise/ai-runtime');
  const quizPrompt = getPrompt('resume-quiz.generate');
  A('⑤a prompt v1→v2 版本升位(改 prompt=升 version 注册表纪律)', quizPrompt.version === 'v2');
  A('⑤b system 出题边界句零弱化(接地纪律全句保留:仅依据简历事实/严禁编造/refs 原文)',
    quizPrompt.system.includes('仅依据 <data> 内的简历事实出 3 道训练问题')
    && quizPrompt.system.includes('严禁编造简历中不存在的技能或经历')
    && quizPrompt.system.includes('每题的 refs 必须是简历里出现过的关键词原文'));
  const quizFacts = ['负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。'];
  // 最小合法 ResumeProfile(quizGenerator 闭包只用捕获的 resumeFacts,profile 形参只满足图注入类型)。
  const emptyProfile: ResumeProfile = { experience: [], skills: [], facts: [], pii: [], blocked: [] };
  // ⑤c 缺省(undefined=旧 job 缺键经 consumer/lifecycle 透传的同形)→ userData 与 v1 逐字节一致(facts join·零岗位段)。
  await (quizGenerator(pool, OWNER, quizFacts, `role-input-quiz-v1-${process.pid}`, deps.model))(emptyProfile);
  const q1 = captureAll.filter((x) => x.service === 'resume-quiz.generate').at(-1);
  A('⑤c 缺省回退 v1 字节(userData=facts join·零岗位段·旧 job 无键同形不崩)', !!q1 && q1.userData === quizFacts.join('\n'), q1?.userData.slice(0, 40));
  // ⑤d 填岗位 → userData=「目标岗位:<用户串>\n」条件段+facts 接地同帧。
  await (quizGenerator(pool, OWNER, quizFacts, `role-input-quiz-v2-${process.pid}`, deps.model, undefined, USER_ROLE))(emptyProfile);
  const q2 = captureAll.filter((x) => x.service === 'resume-quiz.generate').at(-1);
  A('⑤d 填岗位:目标岗位条件段前缀(diagnosis :59 同形)', !!q2 && q2.userData.startsWith(`目标岗位:${USER_ROLE}\n`), q2?.userData.slice(0, 40));
  A('⑤e v2 userData 仍含 facts 接地(岗位段与事实同帧)', !!q2 && q2.userData.endsWith(quizFacts.join('\n')));

  console.log(`\n${failures === 0 ? '✓ ROLE-INPUT prove(①②③④⑤·payload→planner 段+quiz prompt 段)全部通过' : `✗ ${failures} 项失败`}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error('✗', e instanceof Error ? `${e.message} code=${(e as { code?: string }).code ?? ''}` : e);
  process.exit(1);
});
