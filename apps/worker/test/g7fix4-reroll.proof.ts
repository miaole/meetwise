/** G7FIX-4R 判重后果语义刀 prove(蓝本 ai-docs/delivery/harness/g7fix4-reroll.md §4 六键):
 *  判重命中 → 有界换题(上限 MAX_DUPLICATE_REROLL=2,必换键+revision `:r{k}`)→ 新题成功;
 *  耗尽仍 unavailableGeneration('duplicate_question') 判死面形状回归;fail-closed 三面零位移;
 *  DB/registry 契约负证(同 revision 异键判死·新 revision 形过 registry);判死事件键面回归。
 *  全离线 scripted-model + fixture-PG,零真实模型外呼(est live=0)。 pnpm prove:g7fix4-reroll */
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  createPool, asPrincipal, assertIsolatedTestTarget, runMigrations, loadMigrations,
  createJob, classifyJobRoute, inviteCandidate, startApplicationInterview, reserveEntitlement,
  type DbPool,
} from '@meetwise/db';
import { invoke, promptedModel, resolveModelOperation, registryLogicalNodeKeyDigest, MODEL_OPERATION_REGISTRY_VERSION, scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { isQuestionGenerationFailure, normalizeQuestionGenerationResult, type QuestionGenerationResult } from '@meetwise/domain';
import { normalizeQuestion } from '@meetwise/db';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';
import { recordAskedQuestions } from '../src/memory-service.ts';
import { startAdaptiveInterview, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';
import { z } from 'zod';

// Test-only HMAC key for createJob/classifyJobRoute(bound 面前置;同 adaptive-lifecycle.proof 先例,非生产)。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'g7fix4-reroll-job-route-input-hmac-proof-key-not-production';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const nonce = Date.now();

const S1 = '请谈谈你在高并发场景下设计限流方案的一次具体经历。';
const S2 = '请描述一次你定位并修复线上内存泄漏的完整过程。';

/** 带调用计数的 scripted 面试官:第 n 次 interviewer.ask 返回 scripts[n](越界恒返末值)。其余服务确定性失败。 */
function countingAskModel(scripts: string[]) {
  let askCalls = 0;
  const model: ModelClient = {
    async complete(req) {
      if (req.service === 'interviewer.ask') {
        const raw = { q: scripts[Math.min(askCalls, scripts.length - 1)], refs: [] };
        askCalls += 1;
        return { ok: true, raw };
      }
      return { ok: false, kind: 'deterministic' };
    },
  };
  return { model, calls: () => askCalls };
}

/** 仅判重读面(wasAsked → episode SELECT)注入故障的 pool 代理:其余 SQL 全部直通。 */
function poolFailingOnDuplicateCheck(base: DbPool): DbPool {
  return new Proxy(base, {
    get(target, prop, receiver) {
      if (prop !== 'connect') return Reflect.get(target, prop, receiver);
      return async () => {
        const c = await (target as unknown as { connect: () => Promise<any> }).connect();
        return new Proxy(c, {
          get(t, p, r) {
            if (p !== 'query') return Reflect.get(t, p, r);
            return (...args: unknown[]) => {
              const first = args[0] as { text?: string } | string;
              const sql = typeof first === 'string' ? first : (first?.text ?? '');
              if (sql.includes("kind='episode'")) return Promise.reject(new Error('simulated_memory_outage'));
              return (t as { query: (...a: unknown[]) => Promise<unknown> }).query(...args);
            };
          },
        });
      };
    },
  });
}

async function seedEpisode(owner: string, q: string): Promise<void> {
  await recordAskedQuestions(pool, owner, [q], `seed-${nonce}`);
}

function isUnavailable(result: QuestionGenerationResult, code: string): boolean {
  return isQuestionGenerationFailure(result) && result.error === code && result.provenance.origin === 'unavailable';
}

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await assertIsolatedTestTarget(pool);
  const owners = {
    main: `rr-main-${nonce}`,       // §4.1 主断言 + §4.4 契约负证
    exhaust: `rr-exh-${nonce}`,     // §4.2 耗尽回归
    memory: `rr-mem-${nonce}`,      // §4.3a 记忆不可用
    replay: `rr-rep-${nonce}`,      // §4.3b attempt 闸
    provider: `rr-prv-${nonce}`,    // §4.3c provider 分类
    contract: `rr-con-${nonce}`,    // §4.4 契约负证 owner
    bound: `rr-bound-${nonce}`,     // §4.5 事件面(bound)
  };
  const threads = {
    main: `rr-t-main-${nonce}`, exhaust: `rr-t-exh-${nonce}`, memory: `rr-t-mem-${nonce}`,
    replay: `rr-t-rep-${nonce}`, provider: `rr-t-prv-${nonce}`, contract: `rr-t-con-${nonce}`,
  };
  // 各 seam 线程的 interview 行必须归各自属主(privacyInterviewId 跨属主会被 privacy 闸 pre-dispatch 拦截)。
  for (const id of Object.values(threads)) {
    const owner = id === threads.main ? owners.main
      : id === threads.exhaust ? owners.exhaust
      : id === threads.memory ? owners.memory
      : id === threads.replay ? owners.replay
      : id === threads.provider ? owners.provider
      : owners.contract;
    await asPrincipal(pool, owner, (c) => c.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')", [id, owner]));
  }

  console.log('\n──── §4.1 主断言:判重命中 → 有界 re-roll → 新题成功 ────');
  await seedEpisode(owners.main, S1);                                        // episode content=归一化 S1
  const first = countingAskModel([S1, S2]);                                  // 初诊返 S1(命中),re-roll 返 S2
  const depsMain = buildAdaptiveDeps({
    pool, owner: owners.main, threadId: threads.main, model: first.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const okResult = normalizeQuestionGenerationResult(await depsMain.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  const baseKey = `${threads.main}:ask:t0:0`;
  const r1Key = `${threads.main}:ask:t0:r1`;
  A('命中 → 换题成功:ok===true 且无 unavailable', okResult.ok === true);
  A('新题非重复题面:normalizeQuestion(q)≠S1 且=S2', okResult.ok
    && normalizeQuestion(okResult.question) !== normalizeQuestion(S1)
    && normalizeQuestion(okResult.question) === normalizeQuestion(S2));
  A('invoke 计数===2(初诊 1 次 re-roll,零循环放大)', first.calls() === 2);
  A('第二次键=:r1 后缀(必换键):provenance.idempotencyKey 精确相等', okResult.ok
    && okResult.provenance.idempotencyKey === r1Key && okResult.provenance.idempotencyKey !== baseKey);
  A('provenance 带 reroll 轨迹(reroll===1)且 origin=model', okResult.ok
    && okResult.provenance.reroll === 1 && okResult.provenance.origin === 'model');
  const invRows = await asPrincipal(pool, owners.main, (c) => c.query(
    'SELECT idempotency_key FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3) ORDER BY idempotency_key',
    [owners.main, baseKey, r1Key]));
  A('DB 两笔独立 invocation 行:基础键 + :r1 键', invRows.rows.length === 2
    && invRows.rows.some((r: any) => r.idempotency_key === baseKey)
    && invRows.rows.some((r: any) => r.idempotency_key === r1Key));
  // ai_model_logical_node_header 对 app_role 不可读(内部账本):header 断言走属主连接(lifecycle proof 同先例)。
  const r1Header = await pool.query(
    'SELECT count(*)::int n FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND logical_node_key_digest=$2',
    [owners.main, registryLogicalNodeKeyDigest(`${MODEL_OPERATION_REGISTRY_VERSION}:interview.question-generation.v1:${threads.main}:ask:t0:r1`)]);
  const baseHeader = await pool.query(
    'SELECT count(*)::int n FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND logical_node_key_digest=$2',
    [owners.main, registryLogicalNodeKeyDigest(`${MODEL_OPERATION_REGISTRY_VERSION}:interview.question-generation.v1:${threads.main}:ask:t0`)]);
  A('DB 两棵独立 logical node(revision 后缀入 header digest):基础 revision 与 :r1 revision 各一行',
    Number(r1Header.rows[0]?.n) === 1 && Number(baseHeader.rows[0]?.n) === 1);

  console.log('\n──── §4.2 耗尽回归:恒返 S1 → 上限到 → duplicate_question 判死面形状不变 ────');
  await seedEpisode(owners.exhaust, S1);
  const alwaysS1 = countingAskModel([S1]);
  const depsExh = buildAdaptiveDeps({
    pool, owner: owners.exhaust, threadId: threads.exhaust, model: alwaysS1.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const exhausted = normalizeQuestionGenerationResult(await depsExh.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('撞满上限 → 仍 unavailableGeneration(duplicate_question) 不弱化', isUnavailable(exhausted, 'duplicate_question'));
  A('耗尽 provenance 携带轨迹:reroll===2 且键停在最后一个 roll `:r2`',
    isQuestionGenerationFailure(exhausted) && exhausted.provenance.reroll === 2
    && exhausted.provenance.idempotencyKey === `${threads.exhaust}:ask:t0:r2`);
  A('上限内调用总数===3(含初诊,无循环放大)', alwaysS1.calls() === 3);
  A('errorCode 保持 duplicate_question(generationFailureOf reason 前置=generation_duplicate_question)',
    isQuestionGenerationFailure(exhausted) && exhausted.provenance.errorCode === 'duplicate_question');

  console.log('\n──── §4.3 fail-closed 保留:三面零位移 ────');
  const memoryModel = countingAskModel([S2]);
  const depsMem = buildAdaptiveDeps({
    pool: poolFailingOnDuplicateCheck(pool), owner: owners.memory, threadId: threads.memory, model: memoryModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const memoryOut = normalizeQuestionGenerationResult(await depsMem.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('wasAsked throw(记忆不可用) → generation_unavailable + duplicate_check_failed,零 re-roll',
    isUnavailable(memoryOut, 'generation_unavailable')
    && isQuestionGenerationFailure(memoryOut) && memoryOut.provenance.invokeError === 'duplicate_check_failed'
    && memoryOut.provenance.reroll === undefined && memoryOut.provenance.idempotencyKey === `${threads.memory}:ask:t0:0`
    && memoryModel.calls() === 1);

  const replayModel = countingAskModel([S1]);
  const depsReplay = buildAdaptiveDeps({
    pool, owner: owners.replay, threadId: threads.replay, model: replayModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const replay = normalizeQuestionGenerationResult(await depsReplay.retrieveAndGenerate('并发', 3, 1, 0, [], 'fundamental'));
  A('attempt=1 → attempt_replay_forbidden(结构闸零触,零 provider 外呼)',
    isUnavailable(replay, 'attempt_replay_forbidden')
    && isQuestionGenerationFailure(replay) && replay.provenance.idempotencyKey === `${threads.replay}:ask:t0:0`
    && replayModel.calls() === 0);

  const providerModel = scriptedModelClient({});
  const depsProvider = buildAdaptiveDeps({
    pool, owner: owners.provider, threadId: threads.provider, model: providerModel,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const providerOut = normalizeQuestionGenerationResult(await depsProvider.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('provider 确定性失败 → 既有分类判死(非 duplicate_question、分类自洽、零 re-roll 轨迹)',
    isQuestionGenerationFailure(providerOut) && providerOut.error !== 'duplicate_question'
    && providerOut.provenance.errorCode === providerOut.error && providerOut.provenance.origin === 'unavailable'
    && providerOut.provenance.reroll === undefined);

  console.log('\n──── §4.4 DB/registry 契约负证 ────');
  const contractRev = `${threads.main}:contract-rev`;
  const contractSchema = z.object({ q: z.string().min(1) });
  const contractModel: ModelClient = { async complete() { return { ok: true, raw: { q: '契约探针题' } }; } };
  const firstClaim = await invoke({
    idempotencyKey: `${threads.contract}:k1`, operation: { id: 'interview.question-generation.v1', businessRevision: contractRev },
    threadId: threads.contract, privacyInterviewId: threads.contract, schema: contractSchema, businessValidate: () => null,
    model: promptedModel(contractModel, 'interviewer.ask', {}),
  }, pool, owners.contract);
  const secondClaim = await invoke({
    idempotencyKey: `${threads.contract}:k2`, operation: { id: 'interview.question-generation.v1', businessRevision: contractRev },
    threadId: threads.contract, privacyInterviewId: threads.contract, schema: contractSchema, businessValidate: () => null,
    model: promptedModel(contractModel, 'interviewer.ask', {}),
  }, pool, owners.contract);
  A('同 revision 异键首投 → ok(注册 canonical 头)', !('error' in firstClaim));
  A('同 revision 异键再投 → logical_node_canonical_invocation_mismatch(0088:272 DB 层判死)',
    'error' in secondClaim && secondClaim.error === 'logical_node_canonical_invocation_mismatch');
  const baseRes = resolveModelOperation('interview.question-generation.v1', `${threads.main}:ask:t0`);
  const rerollRes = resolveModelOperation('interview.question-generation.v1', `${threads.main}:ask:t0:r1`);
  A('新 revision 形过 resolveModelOperation:ok 且 logicalNodeKey 相异且含 :r1 revision',
    baseRes.ok && rerollRes.ok && baseRes.logicalNodeKey !== rerollRes.logicalNodeKey
    && rerollRes.logicalNodeKey === `${MODEL_OPERATION_REGISTRY_VERSION}:interview.question-generation.v1:${threads.main}:ask:t0:r1`);

  console.log('\n──── §4.5 事件面回归:判死事件键仍 assessment_unavailable:generation_duplicate_question ────');
  const recruiter = `rr-rec-${nonce}`;
  const resumeId = randomUUID();
  await seedEpisode(owners.bound, S1);
  const jobRow = await asPrincipal(pool, recruiter, (c) => createJob(c, recruiter, {
    title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express'],
  }));
  const jobRev = Number((await pool.query(
    'SELECT COALESCE(MAX(revision),0)::int AS n FROM job_semantic_revision WHERE job_id=$1', [jobRow.id])).rows[0].n);
  const classified = await classifyJobRoute(pool, recruiter, jobRow.id, jobRev, {
    modelClassify: async () => { throw new Error('B-side seed must rule-decide; model path unexpected'); },
  });
  A('B 端岗位 rule-classified route_decided(start 前置)', classified.status === 'route_decided');
  await pool.query("INSERT INTO resume(id,owner_user_id,status,content_sha) VALUES ($1,$2,'ingested',$3)", [resumeId, owners.bound, `rr:${nonce}`]);
  const application = await asPrincipal(pool, recruiter, (c) => inviteCandidate(c, recruiter, jobRow.id, owners.bound));
  const started = await asPrincipal(pool, owners.bound, (c) => startApplicationInterview(c, owners.bound, application!.applicationId, resumeId));
  const boundIid = (started.status === 'started' || started.status === 'reused') ? started.interviewId : undefined;
  if (!boundIid) throw new Error('bound_face_start_missing_interview_id');
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [owners.bound]);
  await asPrincipal(pool, owners.bound, (c) => reserveEntitlement(c, owners.bound, boundIid, 'mock_interview', 1.0));
  let boundAsks = 0;
  const lifecycleModel: ModelClient = {
    async complete(req) {
      if (req.service === 'planner.competencies') return { ok: true, raw: { competencies: ['并发'] } };
      if (req.service === 'interviewer.ask') { boundAsks += 1; return { ok: true, raw: { q: S1, refs: [] } }; }
      return { ok: false, kind: 'deterministic' };
    },
  };
  const boundDeps: AdaptiveLifecycleDeps = {
    pool, cp: new MemorySaver(), owner: owners.bound, interviewId: boundIid, model: lifecycleModel,
    localRetrieve: async () => [], webExplore: async () => [],
  };
  const boundStart = await startAdaptiveInterview(boundDeps, '后端工程师', []);
  A('lifecycle 判死面:start 返回 unavailable 且 reason=generation_duplicate_question(generationFailureOf 映射不变)',
    !!boundStart.unavailable && boundStart.unavailable.reason === 'generation_duplicate_question');
  A('终态 provenance 自带耗尽轨迹:reroll===2 且 errorCode=duplicate_question',
    boundStart.unavailable?.provenance.reroll === 2 && boundStart.unavailable?.provenance.errorCode === 'duplicate_question');
  A('上限内调用总数===3(lifecycle 全链)', boundAsks === 3);
  const boundEvents = await asPrincipal(pool, owners.bound, (c) => c.query(
    "SELECT kind, event_key, payload FROM interview_event WHERE stream_key=$1 AND kind IN ('assessment_unavailable','interview_unavailable','question_ready') ORDER BY seq", [boundIid]));
  const terminalEvent = boundEvents.rows.find((r: any) => r.kind === 'assessment_unavailable');
  A('判死事件键恰一且仍 assessment_unavailable:generation_duplicate_question(consumer 键族零碰撞)',
    boundEvents.rows.length === 1 && !!terminalEvent
    && terminalEvent.event_key === 'assessment_unavailable:generation_duplicate_question'
    && terminalEvent.payload?.reason === 'generation_duplicate_question');
  A('事件 payload provenance 自带 reroll 轨迹(lifecycle 投影零改自带)',
    terminalEvent?.payload?.provenance?.reroll === 2 && terminalEvent?.payload?.provenance?.origin === 'unavailable');
  const boundState = (await pool.query(
    `SELECT i.status AS interview_status, ec.status AS consumption_status
       FROM interview i LEFT JOIN entitlement_consumption ec ON ec.owner_user_id=i.owner_user_id AND ec.idempotency_key=i.id
      WHERE i.id=$1`, [boundIid])).rows[0];
  A('判死面形状回归:interview=failed 且预留释放', boundState?.interview_status === 'failed' && boundState?.consumption_status === 'released');
  const rerollRows = await asPrincipal(pool, owners.bound, (c) => c.query(
    'SELECT idempotency_key FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key LIKE $2 ORDER BY idempotency_key',
    [owners.bound, `${boundIid}:ask:t0:%`]));
  A('lifecycle 全链 re-roll 键账::0 → :r1 → :r2 恰三笔',
    rerollRows.rows.length === 3
    && rerollRows.rows.some((r: any) => r.idempotency_key === `${boundIid}:ask:t0:0`)
    && rerollRows.rows.some((r: any) => r.idempotency_key === `${boundIid}:ask:t0:r1`)
    && rerollRows.rows.some((r: any) => r.idempotency_key === `${boundIid}:ask:t0:r2`));

  console.log(`\n${fail === 0 ? '✓ G7FIX-4R §4 六键全绿:有界换题(命中→:r{k}→新题)+耗尽判死不变+fail-closed 零位移+契约负证+事件键回归' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.stack ?? e?.message ?? e); process.exit(1); });
