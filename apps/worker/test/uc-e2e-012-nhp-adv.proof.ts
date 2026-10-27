/**
 * NHP-012-ADV-01 · UC-E2E-012/024 ADV 分面（闭环完成条件·对抗面：0046 完成闸 bypass 拒绝 +
 * 结算终态配对禁令）
 *
 * REQUEST: ai-docs/delivery/harness/reassess-e2e-REQUEST.md §1 case-3（§1.0.1 :118 残余 ADV cell
 * blind→case-only · 与批 A F4a worker 收口臂互斥零借用——本 case=DB 闸层对抗 bypass）· Base:
 * line/reassess-draft（merge origin/main 0246361dd · EXEC tip 见 §9-EXEC）。
 *
 * 需求源: e2e-scenarios.md:274-:295（UC-024 后置「无悬挂」）· §0.2 缝 D：0046 :114-:116 具名
 * 对抗对象（repair script / 未来 lifecycle 绕 answer_unscored 臂把缺证据改成 paid-completed）·
 * :118-:137 enforce_interview_scoring_completion_integrity（completed∧EXISTS(answer_unscored) ⇒
 * :130 RAISE 23514 全事务回滚）· :137-:139 触发器 · :144-:172 enforce_interview_consumption_
 * terminal_pair（completed 需 confirmed · failed/abandoned 需 released · 无行放行）。D3 披露:
 * 本 case 只钉闸的对抗拒绝面；「补评后重算并回填」全流程 NOT claimed。
 *
 * 臂: **A1** 对抗 bypass（answer_unscored 在场流直 UPDATE→completed → 23514
 * `interview_completion_requires_all_answers_scored` 全事务回滚）；**A2** 结算配对 bypass（reserved
 * 消费行经产品路径 reserveEntitlement 落 → 直 UPDATE→failed → 23514
 * `invalid_interview_consumption_pair`）；**A3** 正控防恒红假绿（零 unscored 流同形 UPDATE 成功
 * completed——夹具前提=entitlement_consumption 无行（具名入收据）· 闸按证据条件触发非按篡改检测）；
 * **A4** 重复 bypass 幂等拒（二次直写仍 23514 · 零部分写：事件/消费/状态全恒）。
 *
 * Evidence layer: isolated 真 PG（run-e2e-isolated 全迁移链）· 真产品路径造数（resume 产品链→
 * route 链→reserve→enqueue start/answer→drainInterviewJobOnce；A2 reserved 行=产品路径
 * reserveEntitlement · Ban 裸 INSERT）· 对抗 UPDATE=本 case 被测对象（具名入收据）· 零 live 模型 ·
 * 零外呼。EXIT0 = 具名 case 真证据 ≠ covered ≠ suite green；§1.0.1 :118 行措辞零翻动 ·
 * coveredCount=8。
 *
 *   pnpm uc012:nhp-adv:prove              （root · isolated）
 *   pnpm -C apps/worker prove:uc012-nhp-adv （raw; needs isolated DATABASE_URL from the runner）
 */
process.env.RESUME_ENC_KEY = 'uc012-nhp-adv-resume-enc-key';
process.env.RESUME_HASH_SECRET = 'uc012-nhp-adv-resume-hash-secret';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'uc012-nhp-adv-job-route-input-hmac-proof-key-not-production-01';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  createPool, asPrincipal, provisionRuntimeLogin, reserveEntitlement, availableUnits,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob,
  answerHash, claimInterviewAnswer, supplyCandidateProfileRoute, createJob, classifyJobRoute,
  bindApplicationRoute, snapshotInterviewRoute, assertIsolatedTestTarget,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { type ModelClient, type ModelResult } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, type ConsumerDeps } from '../src/interview-consumer.ts';

let failures = 0;
let total = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const errCode = (e: unknown): string => String((e as { code?: string })?.code ?? '');
const errMsg = (e: unknown): string => String((e as Error)?.message ?? '');

console.log('NHP-012-ADV-01 UC-E2E-012/024 ADV prove (A1-A4 · 缝 D 0046 闸对抗 · Ban live)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · §1.0.1 :118 措辞零翻动 · EXIT0≠covered');

// ── 零模型面（§1 env -u 三键具名 · 词面已登记 provider-egress-inventory class=test-isolation）──
const keysOnEntry = ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']
  .filter((k) => String(process.env[k] ?? '').trim().length > 0);
for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];
A('L0 零模型: 三键（MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL）入场均不在场', keysOnEntry.length === 0);

const S = Date.now().toString(36);
const admin = createPool();
const role = `uc012_nhp_adv_${process.pid}`;
let runtime!: ReturnType<typeof createPool>;

const GREEN_EVAL = { ok: true as const, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } };
const UNKNOWN_EVAL = { ok: false as const, kind: 'transient' as const, externalOutcome: 'unknown' as const };

function buildModel(evalShape: 'green' | 'unknown'): ModelClient {
  const scripted: Record<string, (req: any) => ModelResult> = {
    'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存', '消息队列'] } }),
    'interviewer.ask': () => ({ ok: true, raw: { q: '结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性，并给出一次具体取舍', refs: [] } }),
    'mock-interview.evaluate': () => (evalShape === 'green' ? GREEN_EVAL : UNKNOWN_EVAL),
  };
  return {
    complete: (req, _attempt) => {
      const fn = scripted[req.service];
      return Promise.resolve(fn ? fn(req) : { ok: false as const, kind: 'deterministic' as const });
    },
  };
}

const OWN = (k: string) => `uc012a-${k}-${S}`;
const IID = (k: string) => `iv-uc012a-${k}-${S}`;
const RECRUITER = (k: string) => `${OWN(k)}-recruiter`;

const balOf = (owner: string) => asPrincipal(admin, owner, (c) => availableUnits(c, owner));
const ivStatus = (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2', [id, owner]))
    .then((r) => r.rows[0]?.status as string | undefined);
const consRow = (owner: string, key: string) =>
  asPrincipal(admin, owner, (c) => c.query('SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]))
    .then((r) => r.rows[0]?.status as string | undefined);
const evCount = async (owner: string, stream: string, kind: string) =>
  (await asPrincipal(admin, owner, (c) => c.query('SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2', [stream, kind]))).rows[0].n as number;
const issuedQuestion = async (owner: string, id: string) =>
  asPrincipal(admin, owner, (c) => c.query("SELECT question_id, state_version, turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [id]))
    .then((r) => r.rows[0] as { question_id: string; state_version: number; turn: number } | undefined);

/** 真产品路径夹具（批 A 同形）：bucket 种子（豁免②a）→ resume 产品链 → interview 壳行 'created'
 *  （守护①·豁免②c）→ route 链 → reserve（可选 · 产品路径 begin 同 CAS）。 */
async function fixture(tag: string, model: ModelClient, reserve: boolean): Promise<{ owner: string; id: string; deps: ConsumerDeps }> {
  const owner = OWN(tag), id = IID(tag);
  await admin.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [owner]);
  A(`[${tag}] 夹具自检: 种子后 availability=5.0`, (await balOf(owner)) === 5.0);
  const resumeText = '合成样本：围绕 Redis、限流与分布式锁回答技术问题。';
  const up = await asPrincipal(runtime, owner, async (c) => {
    const created = await createResumeWithBlob(c, owner, resumeText);
    await transitionResume(c, owner, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, owner, created.resumeId, ingestResume(resumeText));
    return created;
  });
  const resumeEpoch = Number((await admin.query<{ privacy_epoch: number }>('SELECT privacy_epoch FROM resume WHERE id=$1', [up.resumeId])).rows[0]?.privacy_epoch);
  await admin.query("INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)", [id, owner, up.resumeId, resumeEpoch]);
  A(`[${tag}] 守护① 壳行插入态='created'`, (await ivStatus(owner, id)) === 'created');
  await asPrincipal(runtime, owner, (c) => supplyCandidateProfileRoute(c, owner, id, up.resumeId));
  const rJob = await asPrincipal(runtime, RECRUITER(tag), (c) => createJob(c, RECRUITER(tag), {
    title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'],
  }));
  const rRev = Number((await admin.query('SELECT COALESCE(MAX(revision),0)::int n FROM job_semantic_revision WHERE job_id=$1', [rJob.id])).rows[0].n);
  const rClass = await classifyJobRoute(runtime, RECRUITER(tag), rJob.id, rRev, {
    modelClassify: async () => { throw new Error('fixture job must rule-decide; model path unexpected'); },
  });
  const rBind = await asPrincipal(runtime, owner, (c) => bindApplicationRoute(c, {
    candidateUserId: owner, recruiterUserId: RECRUITER(tag), jobId: rJob.id, applicationId: `${tag}-app-${id}`, emitConsumptionEvent: true,
  }));
  const rSnap = await asPrincipal(runtime, owner, (c) => snapshotInterviewRoute(c, owner, id, `${tag}-app-${id}`));
  A(`[${tag}] 夹具经生产链供给 route（decision+binding+snapshot）`, rClass.status === 'route_decided' && rBind.status === 'bound' && rSnap.status === 'snapshotted');
  if (reserve) await asPrincipal(runtime, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
  const deps: ConsumerDeps = {
    pool: runtime, cp: new MemorySaver() as any, model,
    leaseOwner: `uc012a-${tag}`,
    adaptive: {
      localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }],
      webExplore: async () => [],
      role: '后端工程师',
      maxTurns: 2, absoluteMaxTurns: 3,
    },
  };
  return { owner, id, deps };
}

async function startAndAnswer(f: Awaited<ReturnType<typeof fixture>>, tag: string): Promise<string> {
  await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'start', {}, 0));
  await drainInterviewJobOnce(f.deps, f.owner);
  const q = await issuedQuestion(f.owner, f.id);
  if (!q) throw new Error(`uc012_${tag}_no_issued_question`);
  const answer = `我用 Redis 计数器+滑动窗口扛高并发，超阈值降级（第1轮作答 · ${tag}）`;
  const input = { questionId: q.question_id, stateVersion: Number(q.state_version), turn: Number(q.turn), answerId: randomUUID(), answerHash: answerHash(answer), answer };
  A(`[${tag}] API identity ledger 接受`, (await asPrincipal(runtime, f.owner, (c) => claimInterviewAnswer(c, f.owner, f.id, input))).status === 'accepted');
  await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', input, input.turn + 1));
  const drained = await drainInterviewJobOnce(f.deps, f.owner);
  A(`[${tag}] 消费 answer job 走通（mid-flight 前提）`, drained === 'answer');
  return q.question_id;
}

/** 对抗写手（本 case 被测对象 · 具名入收据）：repair-script 形直 UPDATE interview 终态。 */
const adversarialUpdate = (owner: string, id: string, status: 'completed' | 'failed') =>
  asPrincipal(admin, owner, (c) => c.query('UPDATE interview SET status=$1 WHERE id=$2 AND owner_user_id=$3', [status, id, owner]));

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password: `${role}-pw`, sslMode: 'disable',
  });

  // ── A1 · 对抗 bypass：answer_unscored 在场 → 直写 completed → 23514 具名全回滚 ──
  section('A1 · unscored 在场流直 UPDATE→completed → 23514 interview_completion_requires_all_answers_scored（:118-:139）');
  const a1 = await (async () => {
    // 夹具前提（具名入收据）：entitlement_consumption 无行（不 reserve）——隔离被测闸=完成闸本体，
    // 防配对触发器对 completed∧非 confirmed 的同事务假因红（消费面归 A2/A3 专臂）。
    const f = await fixture('a1', buildModel('unknown'), false);
    await startAndAnswer(f, 'a1');
    A('A1 前提: answer_unscored 在场恰一（产品路径 unknown 收敛 · :531-:535 臂）', (await evCount(f.owner, f.id, 'answer_unscored')) === 1);
    A('A1 前提: consumption 无行（配对触发器 NULL 放行 · 隔离完成闸本体）', (await consRow(f.owner, f.id)) === undefined);
    const statusBefore = await ivStatus(f.owner, f.id);
    A('A1 前提: OLD.status 非 completed（mid-flight）', statusBefore !== undefined && statusBefore !== 'completed');
    const evBefore = await evCount(f.owner, f.id, 'answer_unscored');
    let caught: unknown;
    try { await adversarialUpdate(f.owner, f.id, 'completed'); } catch (e) { caught = e; }
    A('A1 闸拒绝（抛错在场）', caught !== undefined);
    A('A1 errcode 23514（check_violation 类 · USING ERRCODE）', errCode(caught) === '23514');
    A('A1 具名消息: interview_completion_requires_all_answers_scored（:130 字面）',
      errMsg(caught).includes('interview_completion_requires_all_answers_scored'));
    A('A1 全事务回滚: status 零漂（仍 mid-flight · 未落 completed）', (await ivStatus(f.owner, f.id)) === statusBefore);
    A('A1 零部分写: unscored 计数恒（零事件清洗/改写）', (await evCount(f.owner, f.id, 'answer_unscored')) === evBefore);
    E('A1-ERR', { code: errCode(caught), message: errMsg(caught).slice(0, 120) });
    return { f };
  })();

  // ── A2 · 结算配对 bypass：reserved 消费行（产品路径）→ 直写 failed → 23514 配对禁令 ──
  section('A2 · (failed, reserved) 直写拒 → 23514 invalid_interview_consumption_pair（:144-:172）');
  const a2 = await (async () => {
    // reserved 行=产品路径 reserveEntitlement（Ban 裸 INSERT · REQUEST §1 case-3 A2 具名）。
    const f = await fixture('a2', buildModel('green'), true);
    await startAndAnswer(f, 'a2');
    A('A2 前提: consumption=reserved（产品路径 reserve 落）', (await consRow(f.owner, f.id)) === 'reserved');
    A('A2 前提: 零 unscored（隔离被测闸=配对触发器 · 完成闸不在本臂路径）', (await evCount(f.owner, f.id, 'answer_unscored')) === 0);
    const statusBefore = await ivStatus(f.owner, f.id);
    const balBefore = await balOf(f.owner);
    let caught: unknown;
    try { await adversarialUpdate(f.owner, f.id, 'failed'); } catch (e) { caught = e; }
    A('A2 闸拒绝（抛错在场）', caught !== undefined);
    A('A2 errcode 23514', errCode(caught) === '23514');
    A('A2 具名消息前缀: invalid_interview_consumption_pair（failed requires released · :167-:170）',
      errMsg(caught).startsWith('invalid_interview_consumption_pair'));
    A('A2 全事务回滚: status 零漂 · consumption 仍 reserved',
      (await ivStatus(f.owner, f.id)) === statusBefore && (await consRow(f.owner, f.id)) === 'reserved');
    A('A2 额度零误退: availability 恒 4.0（零释放零双扣）', (await balOf(f.owner)) === balBefore && balBefore === 4.0);
    E('A2-ERR', { code: errCode(caught), message: errMsg(caught).slice(0, 120) });
    return { f };
  })();

  // ── A3 · 正控防恒红假绿：零 unscored 流同形 UPDATE 成功 completed ──
  section('A3 · 正控: 零 unscored 流同形直写 → completed 成功（闸按证据条件触发 · 非篡改检测）');
  {
    // 夹具前提（具名入收据）：entitlement_consumption 无行（A3 零 reserve——配对触发器 NULL 放行；
    // completed∧非 confirmed 的假因红与 A1 同理隔离）。同形 UPDATE=与 A1 唯一差异是证据面。
    const f = await fixture('a3', buildModel('green'), false);
    await startAndAnswer(f, 'a3');
    A('A3 前提: answer_evaluated 在场恰一 · 零 unscored',
      (await evCount(f.owner, f.id, 'answer_evaluated')) === 1 && (await evCount(f.owner, f.id, 'answer_unscored')) === 0);
    A('A3 前提: consumption 无行', (await consRow(f.owner, f.id)) === undefined);
    const statusBefore = await ivStatus(f.owner, f.id);
    let caught: unknown;
    try { await adversarialUpdate(f.owner, f.id, 'completed'); } catch (e) { caught = e; }
    A('A3 同形 UPDATE 成功（零抛错 · 与 A1 唯一差异=unscored 证据面）', caught === undefined);
    A('A3 终态落 completed（闸证据条件触发实证 · 0046 不做篡改检测）', (await ivStatus(f.owner, f.id)) === 'completed');
    A('A3 前提态曾非 completed（OLD.status≠completed 路径真实经过）', statusBefore !== 'completed');
  }

  // ── A4 · 重复 bypass 幂等拒 · 零部分写 ──
  section('A4 · 重复 bypass 幂等拒（A1/A2 流二次直写仍 23514 · 全态恒零部分写）');
  {
    const { f: f1 } = a1;
    const { f: f2 } = a2;
    const st1 = await ivStatus(f1.owner, f1.id);
    const unscored1 = await evCount(f1.owner, f1.id, 'answer_unscored');
    let caught1: unknown;
    try { await adversarialUpdate(f1.owner, f1.id, 'completed'); } catch (e) { caught1 = e; }
    A('A4 A1 流二次直写仍拒（errcode 23514 · 具名消息同）',
      errCode(caught1) === '23514' && errMsg(caught1).includes('interview_completion_requires_all_answers_scored'));
    A('A4 A1 流零部分写: status/unscored 恒', (await ivStatus(f1.owner, f1.id)) === st1 && (await evCount(f1.owner, f1.id, 'answer_unscored')) === unscored1);
    const st2 = await ivStatus(f2.owner, f2.id);
    let caught2: unknown;
    try { await adversarialUpdate(f2.owner, f2.id, 'failed'); } catch (e) { caught2 = e; }
    A('A4 A2 流二次直写仍拒（errcode 23514 · 配对消息同）',
      errCode(caught2) === '23514' && errMsg(caught2).startsWith('invalid_interview_consumption_pair'));
    A('A4 A2 流零部分写: status/consumption/额度恒',
      (await ivStatus(f2.owner, f2.id)) === st2 && (await consRow(f2.owner, f2.id)) === 'reserved' && (await balOf(f2.owner)) === 4.0);
  }

  // ── 全案完整性 ──
  section('INTEGRITY · 全案终态总账（A1/A2 拒后不悬挂不部分写 · A3 正控唯一 completed）');
  {
    A('INTEGRITY A1: 终态仍 mid-flight（未 completed 未 failed · 零悬挂写）',
      (await ivStatus(OWN('a1'), IID('a1'))) !== 'completed' && (await ivStatus(OWN('a1'), IID('a1'))) !== 'failed');
    A('INTEGRITY A2: 终态仍 mid-flight · consumption=reserved（零误释放）',
      (await ivStatus(OWN('a2'), IID('a2'))) !== 'failed' && (await consRow(OWN('a2'), IID('a2'))) === 'reserved');
    A('INTEGRITY A3: completed 恰一（正控流）', (await ivStatus(OWN('a3'), IID('a3'))) === 'completed');
    A('INTEGRITY 额度总账: a1/a3=5.0（无 reserve）· a2=4.0（reserved 占用恒）',
      (await balOf(OWN('a1'))) === 5.0 && (await balOf(OWN('a3'))) === 5.0 && (await balOf(OWN('a2'))) === 4.0);
    A('INTEGRITY 零直写 completed 污染: 仅 a3 一流 completed',
      (await Promise.all([['a1'], ['a2'], ['a3']].map(async ([t]) => (await ivStatus(OWN(String(t)), IID(String(t))))))).filter((s) => s === 'completed').length === 1);
  }

  console.log(`\n${failures === 0
    ? `✓ NHP-012-ADV-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
    : `✗ ${failures}/${total} NHP-012-ADV-01 断言失败`}`);
  console.log('PIN: ADV cell blind→case-only · EXIT0≠covered · §1.0.1 :118 措辞零翻动 · coveredCount=8');
  console.log('PIN: 语义钉=补评证据在场 ⇒ 对抗直写亦不得落 paid-completed（0046 :114-:116 具名对抗对象）');
  console.log('PIN: A3 正控前提=consumption 无行（具名入收据）· 闸按证据条件触发非按篡改检测（D3）');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · alone≠dual · ⛔push');
  await runtime.end();
  await admin.end();
  process.exit(failures ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.message ?? e);
  process.exit(1);
});
