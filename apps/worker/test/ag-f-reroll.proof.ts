/** AG-F(刀F)四类出题失败有界 re-roll prove(蓝本 ai-docs/delivery/harness/ag-f-reroll-REQUEST.md §2·形沿 g7fix4-reroll.proof):
 *  §A seam 四类族(schema/external_outcome_unknown/critique⑤a)有界 re-roll(键 `:r{k}`+revision 同换·统一计数·每 roll 重过全闸);
 *  §B 图侧耗尽换 competency 继续(裁决②a·连续耗尽帽·全序耗尽才真终场·assessment_unavailable 形状回归);
 *  §C unscored 0 分继续(裁决③a·图内后果·后续 turn 照常推进·混合面完成+报告·全 unscored 面原 fail 形零位移);
 *  §D 账本契约负证(同 revision 异键 canonical mismatch·同键二掷缓存回放禁面·新 revision 形过 registry);
 *  §E 保守面零位移(attempt 闸/duplicate 耗尽/duplicate_check_failed 原样)。
 *  全离线 scripted-model + 真迁移隔离 PG,零真实模型外呼(est live=0)。 pnpm prove:ag-f-reroll */
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  createPool, asPrincipal, assertIsolatedTestTarget, runMigrations, loadMigrations,
  answerHash, claimInterviewAnswer, reserveEntitlement,
  type DbPool,
} from '@meetwise/db';
import { invoke, promptedModel, resolveModelOperation, registryLogicalNodeKeyDigest, MODEL_OPERATION_REGISTRY_VERSION, scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { isQuestionGenerationFailure, normalizeQuestionGenerationResult, type QuestionGenerationResult } from '@meetwise/domain';
import { normalizeQuestion } from '@meetwise/db';
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';
import { recordAskedQuestions } from '../src/memory-service.ts';
import { startAdaptiveInterview, submitAdaptiveAnswer, type AdaptiveLifecycleDeps } from '../src/adaptive-lifecycle.ts';
import { z } from 'zod';

// Test-only HMAC key for createJob/classifyJobRoute(bound 面前置;同 adaptive-lifecycle.proof 先例,非生产)。
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'ag-f-reroll-job-route-input-hmac-proof-key-not-production';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──── ${t} ────`);
const nonce = Date.now();

const GOOD_Q = '请结合一次你在线上限流阈值校准中的具体做法与验证结果展开说明。';

/** 带调用计数的 scripted 面试官:第 n 次 interviewer.ask 返回 scripts[n](越界恒返末值)。
 *  script 形:{ ok:true, raw } 走正常 schema/业务闸;{ schemaBad:true } 返 q=42 违例 AskSchema;
 *  { boom:true } 直接 throw(→invoke transient unknown 臂)。planner 走指定 3 competency
 *  (QP #201 PlannerPlanSchema min(3) 沿 g7fix4 补锤先例);其余服务确定性失败。 */
type AskScript = { ok: true; raw: { q: string; refs: string[] } } | { schemaBad: true } | { boom: true };
function countingAskModel(scripts: AskScript[], planner: string[] = ['并发', '缓存', '网络']) {
  let askCalls = 0;
  const model: ModelClient = {
    async complete(req) {
      if (req.service === 'planner.competencies') return { ok: true, raw: { competencies: planner } };
      if (req.service === 'interviewer.ask') {
        const script = scripts[Math.min(askCalls, scripts.length - 1)];
        askCalls += 1;
        if ('schemaBad' in script) return { ok: true, raw: { q: 42, refs: [] } };
        if ('boom' in script) throw new Error('simulated_provider_blackhole');
        return { ok: true, raw: script.raw };
      }
      return { ok: false, kind: 'deterministic' };
    },
  };
  return { model, calls: () => askCalls };
}

/** 仅判重读面(wasAsked → episode SELECT)注入故障的 pool 代理:其余 SQL 全部直通(沿 g7fix4 先例)。 */
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

const okQ = (q: string): AskScript => ({ ok: true, raw: { q, refs: [] } });

function isUnavailable(result: QuestionGenerationResult, code: string): boolean {
  return isQuestionGenerationFailure(result) && result.error === code && result.provenance.origin === 'unavailable';
}

async function seedEpisode(owner: string, q: string): Promise<void> {
  await recordAskedQuestions(pool, owner, [q], `seed-${nonce}`);
}

async function invocationRow(owner: string, key: string) {
  return (await pool.query(
    'SELECT status,error_code FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, key]));
}

async function askKeyRows(owner: string, threadId: string) {
  return (await asPrincipal(pool, owner, (c) => c.query(
    'SELECT idempotency_key FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key LIKE $2 ORDER BY idempotency_key',
    [owner, `${threadId}:ask:t0:%`]))).rows.map((r: any) => r.idempotency_key as string);
}

async function insertInterview(id: string, owner: string): Promise<void> {
  await asPrincipal(pool, owner, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active') ON CONFLICT (id) DO NOTHING", [id, owner]));
}

async function main() {
  await runMigrations(pool, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await assertIsolatedTestTarget(pool);
  const owners = {
    schema: `agf-schema-${nonce}`, unknown: `agf-unknown-${nonce}`, critique: `agf-crit-${nonce}`,
    critExh: `agf-critexh-${nonce}`, familyOut: `agf-out-${nonce}`, schemaExh: `agf-schemaexh-${nonce}`,
    exhaust: `agf-exh-${nonce}`, switch: `agf-switch-${nonce}`, unscored: `agf-unscored-${nonce}`,
    contract: `agf-con-${nonce}`, replay: `agf-rep-${nonce}`, dup: `agf-dup-${nonce}`, memory: `agf-mem-${nonce}`,
  };
  const threads = Object.fromEntries(Object.entries(owners).map(([k, v]) => [k, `agf-t-${k}-${nonce}`]));

  console.log('\n──── §A seam 四类族有界 re-roll(修法①·键 :r{k}+revision 同换·统一计数) ────');
  // A1 schema 臂:初诊 q=42 违例 AskSchema → :r1 合法新题 → ok。
  insertInterview(threads.schema!, owners.schema!);
  const schemaModel = countingAskModel([{ schemaBad: true }, okQ(GOOD_Q)]);
  const depsSchema = buildAdaptiveDeps({
    pool, owner: owners.schema!, threadId: threads.schema!, model: schemaModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const schemaOut = normalizeQuestionGenerationResult(await depsSchema.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('schema 违例 → :r1 换掷成功:ok 且无 unavailable', schemaOut.ok === true);
  A('键/revision 同换:provenance.idempotencyKey 精确=:r1', schemaOut.ok && schemaOut.provenance.idempotencyKey === `${threads.schema}:ask:t0:r1`);
  A('invoke 计数===2(初诊 1+族内 re-roll 1,零循环放大)', schemaModel.calls() === 2);
  A('provenance reroll===1 且 origin=model', schemaOut.ok && schemaOut.provenance.reroll === 1 && schemaOut.provenance.origin === 'model');
  const schemaBase = await invocationRow(owners.schema!, `${threads.schema}:ask:t0:0`);
  A('DB 初诊行=failed/schema_validation_failed(确定性失败族已结算入账)',
    schemaBase.rows[0]?.status === 'failed' && schemaBase.rows[0]?.error_code === 'schema_validation_failed');
  const schemaR1 = await invocationRow(owners.schema!, `${threads.schema}:ask:t0:r1`);
  A('DB :r1 行独立存在(新 logical node·非缓存回放)', schemaR1.rows.length === 1 && schemaR1.rows[0]?.status === 'succeeded');
  const r1Header = await pool.query(
    'SELECT count(*)::int n FROM ai_model_logical_node_header WHERE owner_user_id=$1 AND logical_node_key_digest=$2',
    [owners.schema, registryLogicalNodeKeyDigest(`${MODEL_OPERATION_REGISTRY_VERSION}:interview.question-generation.v1:${threads.schema}:ask:t0:r1`)]);
  A('DB :r1 revision 入 header digest(独立 logical node 一行)', Number(r1Header.rows[0]?.n) === 1);

  // A2 provider unknown 臂:初诊 throw → external_outcome_unknown → :r1 成功(裁决④a unknown 入族)。
  insertInterview(threads.unknown!, owners.unknown!);
  const unknownModel = countingAskModel([{ boom: true }, okQ(GOOD_Q)]);
  const depsUnknown = buildAdaptiveDeps({
    pool, owner: owners.unknown!, threadId: threads.unknown!, model: unknownModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const unknownOut = normalizeQuestionGenerationResult(await depsUnknown.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('external_outcome_unknown → :r1 换掷成功(四类文面含 unknown)', unknownOut.ok === true);
  A('unknown 臂键=:r1·reroll===1·调用计数===2', unknownOut.ok
    && unknownOut.provenance.idempotencyKey === `${threads.unknown}:ask:t0:r1`
    && unknownOut.provenance.reroll === 1 && unknownModel.calls() === 2);
  const unknownBase = await invocationRow(owners.unknown!, `${threads.unknown}:ask:t0:0`);
  A('DB 初诊行=unknown(瞬态账面待对账·:r1 行独立)', unknownBase.rows[0]?.status === 'unknown');

  // A3 critique 臂(裁决⑤a 复检收进 seam):初诊跑题 → seam critique 拒 → :r1 合格题。
  insertInterview(threads.critique!, owners.critique!);
  const critModel = countingAskModel([okQ('今天天气怎么样呀'), okQ('请谈谈限流迭代里一次具体的取舍与验证经历')]);
  const depsCrit = buildAdaptiveDeps({
    pool, owner: owners.critique!, threadId: threads.critique!, model: critModel.model,
    competencies: ['并发'], competencyKeywords: { 并发: ['限流'] },
    localRetrieve: async () => [], webExplore: async () => [],
  });
  const critOut = normalizeQuestionGenerationResult(await depsCrit.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('critique 拒(off_competency) → :r1 换掷成功(⑤a 复检进 seam)', critOut.ok === true && critOut.question.includes('限流'));
  A('critique 臂键=:r1·reroll===1·调用计数===2', critOut.ok
    && critOut.provenance.idempotencyKey === `${threads.critique}:ask:t0:r1`
    && critOut.provenance.reroll === 1 && critModel.calls() === 2);

  // A4 critique 耗尽判死形(与图节点 critique 拒绝 provenance 同形)。
  insertInterview(threads.critExh!, owners.critExh!);
  const critExhModel = countingAskModel([okQ('今天天气怎么样呀')]);
  const depsCritExh = buildAdaptiveDeps({
    pool, owner: owners.critExh!, threadId: threads.critExh!, model: critExhModel.model,
    competencies: ['并发'], competencyKeywords: { 并发: ['限流'] },
    localRetrieve: async () => [], webExplore: async () => [],
  });
  const critExhOut = normalizeQuestionGenerationResult(await depsCritExh.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('critique 耗尽 → business_invalid+question_critique_failed 判死形(reason 映射不变)',
    isUnavailable(critExhOut, 'business_invalid')
    && isQuestionGenerationFailure(critExhOut) && critExhOut.provenance.invokeError === 'question_critique_failed');
  A('critique 耗尽轨迹:reroll===2·键停 :r2·计数===3(含初诊)', isQuestionGenerationFailure(critExhOut)
    && critExhOut.provenance.reroll === 2
    && critExhOut.provenance.idempotencyKey === `${threads.critExh}:ask:t0:r2` && critExhModel.calls() === 3);

  // A5 族外零位移:provider_not_configured 不入族 → 单发判死原样。
  insertInterview(threads.familyOut!, owners.familyOut!);
  const depsOut = buildAdaptiveDeps({
    pool, owner: owners.familyOut!, threadId: threads.familyOut!, model: scriptedModelClient({}),
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const familyOutRes = normalizeQuestionGenerationResult(await depsOut.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('族外(provider_not_configured)零 re-roll 原形判死:reroll 缺省·键停 :0',
    isQuestionGenerationFailure(familyOutRes) && familyOutRes.error === 'provider_not_configured'
    && familyOutRes.provenance.reroll === undefined
    && familyOutRes.provenance.idempotencyKey === `${threads.familyOut}:ask:t0:0`);

  // A6 schema 耗尽轨迹:恒违例 → 上限到 → schema_invalid+reroll 2(交图节点换 competency 臂的输入形状)。
  insertInterview(threads.schemaExh!, owners.schemaExh!);
  const schemaExhModel = countingAskModel([{ schemaBad: true }]);
  const depsSchemaExh = buildAdaptiveDeps({
    pool, owner: owners.schemaExh!, threadId: threads.schemaExh!, model: schemaExhModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const schemaExhOut = normalizeQuestionGenerationResult(await depsSchemaExh.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('schema 耗尽 → schema_invalid·reroll===2·键停 :r2·计数===3',
    isUnavailable(schemaExhOut, 'schema_invalid') && isQuestionGenerationFailure(schemaExhOut)
    && schemaExhOut.provenance.reroll === 2
    && schemaExhOut.provenance.idempotencyKey === `${threads.schemaExh}:ask:t0:r2` && schemaExhModel.calls() === 3);
  const exhKeys = await askKeyRows(owners.schemaExh!, threads.schemaExh!);
  A('DB 键账::0→:r1→:r2 恰三笔(`:r{k}` 单调递增零复用)',
    JSON.stringify(exhKeys) === JSON.stringify([`${threads.schemaExh}:ask:t0:0`, `${threads.schemaExh}:ask:t0:r1`, `${threads.schemaExh}:ask:t0:r2`]));

  console.log('\n──── §B 图侧耗尽换 competency(修法②·裁决②a 连续耗尽帽) ────');
  // B1 全序耗尽:3 competency 恒 schema 违例 → 顺延换序×2 后真终场(帽=第 3 个连续耗尽到达即终)。
  insertInterview(threads.exhaust!, owners.exhaust!);
  const exhaustModel = countingAskModel([{ schemaBad: true }]);
  const exhaustDeps: AdaptiveLifecycleDeps = {
    pool, cp: new MemorySaver(), owner: owners.exhaust!, interviewId: threads.exhaust!, model: exhaustModel.model,
    localRetrieve: async () => [], webExplore: async () => [],
  };
  const exhaustStart = await startAdaptiveInterview({ ...exhaustDeps }, '后端工程师', []);
  A('全序耗尽 → start unavailable reason=generation_schema_invalid(generationFailureOf 映射不变)',
    !!exhaustStart.unavailable && exhaustStart.unavailable.reason === 'generation_schema_invalid');
  A('终场 provenance 自带耗尽轨迹:reroll===2·errorCode=schema_invalid',
    exhaustStart.unavailable?.provenance.reroll === 2 && exhaustStart.unavailable?.provenance.errorCode === 'schema_invalid');
  A('帽语义:恰 3 competency×(初诊+2 roll)=9 次 ask·第 3 个连续耗尽即真终场', exhaustModel.calls() === 9);
  const exhAllKeys = await askKeyRows(owners.exhaust!, threads.exhaust!);
  A('换序统一键账:t0 内 :0+:r1..:r8 恰 9 笔单调递增(跨 competency 零复用零碰撞)',
    JSON.stringify(exhAllKeys) === JSON.stringify(
      [0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => (k === 0 ? `${threads.exhaust}:ask:t0:0` : `${threads.exhaust}:ask:t0:r${k}`))));
  const exhaustEvents = await asPrincipal(pool, owners.exhaust!, (c) => c.query(
    "SELECT kind, event_key, payload FROM interview_event WHERE stream_key=$1 AND kind IN ('assessment_unavailable','interview_unavailable') ORDER BY seq", [threads.exhaust!]));
  A('真终场事件键族原样:unbound 面 interview_unavailable(terminal 键)·reason=generation_schema_invalid·provenance origin=unavailable',
    exhaustEvents.rows.length === 1 && exhaustEvents.rows[0].kind === 'interview_unavailable'
    && exhaustEvents.rows[0].event_key === 'interview_unavailable:terminal'
    && exhaustEvents.rows[0].payload?.reason === 'generation_schema_invalid'
    && exhaustEvents.rows[0].payload?.provenance?.origin === 'unavailable');
  const exhaustStatus = await pool.query('SELECT status FROM interview WHERE id=$1', [threads.exhaust]);
  A('全序耗尽终态:interview=failed(failInterviewAndRelease 形状不变)', exhaustStatus.rows[0]?.status === 'failed');

  // B2 换序成功:第 1 competency 耗尽 → 顺延第 2 个 → 成功出题·不终场·concluded 未置。
  insertInterview(threads.switch!, owners.switch!);
  const switchModel = countingAskModel([{ schemaBad: true }, { schemaBad: true }, { schemaBad: true }, okQ('请谈谈缓存击穿场景下一次具体的布防取舍与压测验证经历')]);
  const switchDeps: AdaptiveLifecycleDeps = {
    pool, cp: new MemorySaver(), owner: owners.switch!, interviewId: threads.switch!, model: switchModel.model,
    localRetrieve: async () => [], webExplore: async () => [],
  };
  const switchStart = await startAdaptiveInterview(switchDeps, '后端工程师', []);
  A('第 1 competency 耗尽 → 换序第 2 个成功出题:question 在场·不终场', !!switchStart.question && !switchStart.unavailable);
  const switchQ = await pool.query(
    'SELECT competency FROM interview_question WHERE interview_id=$1 ORDER BY state_version DESC LIMIT 1', [threads.switch]);
  A('出题 competency=顺延后的第 2 个(缓存)·question_ready 已投影', switchQ.rows[0]?.competency === '缓存');
  const switchEvents = await asPrincipal(pool, owners.switch!, (c) => c.query(
    "SELECT kind FROM interview_event WHERE stream_key=$1", [threads.switch!]));
  A('换序成功面零终态事件:assessment_unavailable/interview_unavailable 零行·question_ready 恰一',
    !switchEvents.rows.some((r: any) => r.kind === 'assessment_unavailable' || r.kind === 'interview_unavailable')
    && switchEvents.rows.filter((r: any) => r.kind === 'question_ready').length === 1);
  A('换序调用账:1 耗尽 competency 3 次+再入初诊 1 次=4(帽内即成功·零放大)', switchModel.calls() === 4);
  const switchKeys = await askKeyRows(owners.switch!, threads.switch!);
  A('换序成功键账::0+:r1+:r2(第 1 competency)+:r3(换序再入初诊)恰 4 笔',
    JSON.stringify(switchKeys) === JSON.stringify(
      [`${threads.switch}:ask:t0:0`, `${threads.switch}:ask:t0:r1`, `${threads.switch}:ask:t0:r2`, `${threads.switch}:ask:t0:r3`]));

  console.log('\n──── §C unscored 0 分继续(修法③·裁决③a) ────');
  // C1:turn0 评分模型失败 → 该题按 0 计·继续推进;后续回合评分照常;收尾=完成+报告(不作废整场)。
  await insertInterview(threads.unscored!, owners.unscored!);
  await pool.query("INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0, now()+interval '300 days')", [owners.unscored]);
  await asPrincipal(pool, owners.unscored!, (c) => reserveEntitlement(c, owners.unscored!, threads.unscored!, 'mock_interview', 1.0));
  let evalCalls = 0;
  let askNo = 0;
  const unscoredModel: ModelClient = {
    async complete(req) {
      if (req.service === 'planner.competencies') return { ok: true, raw: { competencies: ['并发', '缓存', '网络'] } };
      if (req.service === 'interviewer.ask') { askNo += 1; return { ok: true, raw: { q: `第 ${askNo} 轮:请谈谈限流方案里一次具体的取舍与验证经历`, refs: [] } }; }
      if (req.service === 'mock-interview.evaluate') {
        evalCalls += 1;
        if (evalCalls === 1) return { ok: false, kind: 'deterministic' };   // 单点评分失败(仅 turn0)
        return { ok: true, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } };
      }
      return { ok: false, kind: 'deterministic' };
    },
  };
  const unscoredDeps: AdaptiveLifecycleDeps = {
    pool, cp: new MemorySaver(), owner: owners.unscored!, interviewId: threads.unscored!, model: unscoredModel,
    maxTurns: 2, localRetrieve: async () => [], webExplore: async () => [],
  };
  const uStart = await startAdaptiveInterview(unscoredDeps, '后端工程师', []);
  if (!uStart.questionId || uStart.stateVersion === undefined) throw new Error('unscored_start_missing_question');
  const uAnswer = '我用 Redis 计数器+滑动窗口扛高并发,阈值压测后灰度。';
  const uInput0 = { questionId: uStart.questionId, stateVersion: uStart.stateVersion, answerId: randomUUID(), answerHash: answerHash(uAnswer), turn: 0, answer: uAnswer };
  A('unscored 场景首答 identity 被接受', (await asPrincipal(pool, owners.unscored!, (c) => claimInterviewAnswer(c, owners.unscored!, threads.unscored!, uInput0))).status === 'accepted');
  const uFirst = await submitAdaptiveAnswer(unscoredDeps, uInput0);
  A('评分失败 → lifecycle 返回 score===0 且 degraded===true(transcript 按 0 计·不终场)',
    uFirst.score === 0 && uFirst.degraded === true && uFirst.done === false && uFirst.clarifying === false);
  A('后续 turn 照常推进:下一题 identity 在场', !!uFirst.nextQuestionId);
  const uEv0 = await asPrincipal(pool, owners.unscored!, (c) => c.query(
    "SELECT kind, event_key FROM interview_event WHERE stream_key=$1 ORDER BY seq", [threads.unscored!]));
  A('投影序:answer_unscored(q0) → question_ready(q1) 同事务续流(SSE 链不断)',
    uEv0.rows.some((r: any, i: number) => r.kind === 'answer_unscored' && r.event_key === `answer_unscored:${uStart.questionId}`
      && uEv0.rows.slice(i + 1).some((s: any) => s.kind === 'question_ready' && s.event_key === `question_ready:${uFirst.nextQuestionId}`)));
  const uStatus0 = await pool.query('SELECT status FROM interview WHERE id=$1', [threads.unscored]);
  A('unscored 面零终态:interview 仍 active·无 assessment_unavailable/interview_unavailable',
    uStatus0.rows[0]?.status === 'active'
    && !uEv0.rows.some((r: any) => r.kind === 'assessment_unavailable' || r.kind === 'interview_unavailable'));
  // 后续回合评分照常,直至软预算收尾 → 混合 unscored 完成面。
  let uDone = false; let uQid = uFirst.nextQuestionId!; let guard = 0;
  while (!uDone && guard < 6) {
    guard += 1;
    const row = await asPrincipal(pool, owners.unscored!, async (c) => (await c.query(
      'SELECT state_version,turn FROM interview_question WHERE interview_id=$1 AND question_id=$2', [threads.unscored, uQid])).rows[0]);
    const a = `第 ${guard} 轮回答:我用 Redis 计数器加滑动窗口限流,阈值压测后灰度放量,第 ${guard} 次验证。`;
    const input = { questionId: uQid, stateVersion: Number(row.state_version), turn: Number(row.turn), answerId: randomUUID(), answerHash: answerHash(a), answer: a };
    A(`续答 ${guard} identity 被接受`, (await asPrincipal(pool, owners.unscored!, (c) => claimInterviewAnswer(c, owners.unscored!, threads.unscored!, input))).status === 'accepted');
    const outcome = await submitAdaptiveAnswer(unscoredDeps, input);
    uDone = outcome.done;
    if (!uDone) uQid = outcome.nextQuestionId!;
  }
  const uFinal = (await pool.query(
    `SELECT i.status AS interview_status, ec.status AS consumption_status,
            (SELECT count(*)::int FROM ai_report r WHERE r.interview_id=i.id) AS report_count,
            (SELECT count(*)::int FROM interview_event e WHERE e.stream_key=i.id AND e.kind='answer_unscored') AS unscored_events,
            (SELECT count(*)::int FROM interview_event e WHERE e.stream_key=i.id AND e.kind='answer_evaluated') AS evaluated_events,
            (SELECT count(*)::int FROM interview_event e WHERE e.stream_key=i.id AND e.kind='assessment_unavailable'
              AND e.event_key='assessment_unavailable:evaluation_unscored') AS fail_events
       FROM interview i LEFT JOIN entitlement_consumption ec ON ec.owner_user_id=i.owner_user_id AND ec.idempotency_key=i.id
      WHERE i.id=$1`, [threads.unscored])).rows[0];
  // AG-F(刀F·裁决③a)边界铁律:0 分继续=图内后果（续流+按 0 计+其余题照常计分）;conclude 收口面
  // 的结算终态受 0046 迁移触发器 DB 层钉死（answer_unscored 事件在场 ⇒ 禁 completed·fail+release
  // +evaluation_unscored 原样）——「混合面 completed 照计」归计费战役,本刀保守面零位移如实断言。
  A('图内续流兑现:其余题照常计分(answer_evaluated≥1·逐回合评分事件在册·SSE question_ready 链未断)',
    Number(uFinal?.evaluated_events) >= 1
    && (await asPrincipal(pool, owners.unscored!, (c) => c.query(
      "SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind='question_ready'", [threads.unscored]))).rows[0].n >= 2);
  A('收口结算面零位移(0046 触发器法):interview=failed·预留 released·assessment_unavailable:evaluation_unscored 恰一',
    uFinal?.interview_status === 'failed' && uFinal?.consumption_status === 'released' && Number(uFinal?.fail_events) === 1);
  A('事件账恰一:answer_unscored×1(单点失败按 0 计入图内·不中断续流)',
    Number(uFinal?.unscored_events) === 1);

  console.log('\n──── §D 账本契约负证(真迁移 PG) ────');
  // 直接 invoke 的 privacyInterviewId 过 privacy 闸 pre-dispatch → 面试行须在册(沿 g7fix4 §4.4 先例)。
  await insertInterview(threads.contract!, owners.contract!);
  await insertInterview(threads.replay!, owners.replay!);
  const contractRev = `${threads.contract}:rev`;
  const contractSchema = z.object({ q: z.string().min(1) });
  const contractModel: ModelClient = { async complete() { return { ok: true, raw: { q: '契约探针题' } }; } };
  const firstClaim = await invoke({
    idempotencyKey: `${threads.contract}:k1`, operation: { id: 'interview.question-generation.v1', businessRevision: contractRev },
    threadId: threads.contract, privacyInterviewId: threads.contract, schema: contractSchema, businessValidate: () => null,
    model: promptedModel(contractModel, 'interviewer.ask', {}),
  }, pool, owners.contract!);
  const secondClaim = await invoke({
    idempotencyKey: `${threads.contract}:k2`, operation: { id: 'interview.question-generation.v1', businessRevision: contractRev },
    threadId: threads.contract, privacyInterviewId: threads.contract, schema: contractSchema, businessValidate: () => null,
    model: promptedModel(contractModel, 'interviewer.ask', {}),
  }, pool, owners.contract!);
  A('同 revision 异键首投 → ok(canonical 头在册)', !('error' in firstClaim));
  if ('error' in firstClaim) console.log(`[diag] firstClaim.error=${firstClaim.error}`);
  A('同 revision 异键再投 → logical_node_canonical_invocation_mismatch(0088:271-273/0130:128-150 DB 层判死)',
    'error' in secondClaim && secondClaim.error === 'logical_node_canonical_invocation_mismatch');
  // 同键二掷 → 缓存回放(invoke.ts cached 臂)——re-roll 键族 `:r{k}` 单调递增零复用的禁面负证。
  let replayCalls = 0;
  const replayModel: ModelClient = { async complete() { replayCalls += 1; return { ok: true, raw: { q: '同键回放探针题' } }; } };
  const replayKey = `${threads.replay}:k1`;
  const replayFirst = await invoke({
    idempotencyKey: replayKey, operation: { id: 'interview.question-generation.v1', businessRevision: replayKey },
    threadId: threads.replay, privacyInterviewId: threads.replay, schema: contractSchema, businessValidate: () => null,
    model: promptedModel(replayModel, 'interviewer.ask', {}),
  }, pool, owners.replay!);
  const replaySecond = await invoke({
    idempotencyKey: replayKey, operation: { id: 'interview.question-generation.v1', businessRevision: replayKey },
    threadId: threads.replay, privacyInterviewId: threads.replay, schema: contractSchema, businessValidate: () => null,
    model: promptedModel(replayModel, 'interviewer.ask', {}),
  }, pool, owners.replay!);
  A('同键二掷 → 缓存回放原值(零新 provider 外呼:模型计数恒 1)·禁面坐实',
    !('error' in replayFirst) && !('error' in replaySecond)
    && (replaySecond as { value: { q: string } }).value.q === (replayFirst as { value: { q: string } }).value.q
    && replayCalls === 1);
  const baseRes = resolveModelOperation('interview.question-generation.v1', `${threads.schema}:ask:t0`);
  const rollRes = resolveModelOperation('interview.question-generation.v1', `${threads.schema}:ask:t0:r1`);
  A('`:r{k}` revision 形过 resolveModelOperation:ok 且 logicalNodeKey 相异且含 :r1',
    baseRes.ok && rollRes.ok && baseRes.logicalNodeKey !== rollRes.logicalNodeKey
    && rollRes.logicalNodeKey === `${MODEL_OPERATION_REGISTRY_VERSION}:interview.question-generation.v1:${threads.schema}:ask:t0:r1`);

  console.log('\n──── §E 保守面零位移 ────');
  // E1 attempt=1 闸:字节零改,零 provider 外呼。
  insertInterview(threads.replay!, owners.replay!);
  const replayDepsModel = countingAskModel([okQ(GOOD_Q)]);
  const depsReplay = buildAdaptiveDeps({
    pool, owner: owners.replay!, threadId: threads.replay!, model: replayDepsModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const replay = normalizeQuestionGenerationResult(await depsReplay.retrieveAndGenerate('并发', 3, 1, 0, [], 'fundamental'));
  A('attempt=1 → attempt_replay_forbidden(结构闸零触·零外呼)',
    isUnavailable(replay, 'attempt_replay_forbidden')
    && isQuestionGenerationFailure(replay) && replay.provenance.idempotencyKey === `${threads.replay}:ask:t0:0`
    && replayDepsModel.calls() === 0);
  // E2 判重耗尽:统一计数下纯判重路径键形零变(fresh turn rollSeq===0 → :r1/:r2 与既有逐位一致)。
  insertInterview(threads.dup!, owners.dup!);
  await seedEpisode(owners.dup!, GOOD_Q);
  const dupModel = countingAskModel([okQ(GOOD_Q)]);
  const depsDup = buildAdaptiveDeps({
    pool, owner: owners.dup!, threadId: threads.dup!, model: dupModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const dupExh = normalizeQuestionGenerationResult(await depsDup.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('判重耗尽 → duplicate_question 判死原样:reroll===2·键停 :r2·计数===3',
    isUnavailable(dupExh, 'duplicate_question') && isQuestionGenerationFailure(dupExh)
    && dupExh.provenance.reroll === 2
    && dupExh.provenance.idempotencyKey === `${threads.dup}:ask:t0:r2` && dupModel.calls() === 3);
  // E3 判重复检故障:duplicate_check_failed 单发判死原样(零 re-roll)。
  insertInterview(threads.memory!, owners.memory!);
  const memModel = countingAskModel([okQ(GOOD_Q)]);
  const depsMem = buildAdaptiveDeps({
    pool: poolFailingOnDuplicateCheck(pool), owner: owners.memory!, threadId: threads.memory!, model: memModel.model,
    competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [],
  });
  const memOut = normalizeQuestionGenerationResult(await depsMem.retrieveAndGenerate('并发', 3, 0, 0, [], 'fundamental'));
  A('duplicate_check_failed → generation_unavailable 原样:零 re-roll·键停 :0·计数===1',
    isUnavailable(memOut, 'generation_unavailable')
    && isQuestionGenerationFailure(memOut) && memOut.provenance.invokeError === 'duplicate_check_failed'
    && memOut.provenance.reroll === undefined && memModel.calls() === 1);

  console.log(`\n${fail === 0 ? '✓ AG-F §A-§E 全绿:四类族有界 re-roll(键 revision 同换·统一计数)+耗尽换 competency 不终场(连续帽·全序耗尽真终场)+unscored 0 分继续+账本负证+保守面零位移' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.stack ?? e?.message ?? e); process.exit(1); });
