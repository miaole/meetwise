/**
 * HTTP 层「跳过当澄清」E2E / prove。
 *
 * 覆盖缺口：后续队列「缺 HTTP 层『跳过当澄清』的 E2E」。
 * 图内 already 有 adaptive-offtopic:prove（in-process，无 HTTP）；
 * full.e2e 的 helper 默认 clarificationAnswer='跳过'，但不是独立 HTTP prove，且依赖 MODEL_API_KEY。
 *
 * 本刀：真实 HTTP `POST /interview` + `/begin` + `/turn` → 入队 start/answer job
 * → 生产 consumer `drainInterviewJobOnce`（脚本模型，Ban MODEL_API_KEY）→ 断言 SSE 事件 + DB。
 *
 * 产品契约（packages/domain classifyTurn / isSkip，MAX_CLARIFY=1）：
 *   - 短非作答（如「不知道」）→ 至多 1 次澄清（clarification_needed，同题 + 引导语提示可回「跳过」）。
 *   - 澄清后再显式「跳过」→ unresolved + 换题（不评分、不写 score_card、不调用评估模型）。
 *   - 首轮显式跳过 → 直接 unresolved 换题（不先澄清）。对照面，不是本缺口本身。
 *
 * 不改 adaptive-lifecycle.ts。NO MODEL_API_KEY。releaseEvidence=false · NOT_HA。
 * 本绿 ≠ UC covered · ≠ 全栈 e2e:isolated。fixture = isolated PG（run-e2e-isolated）→ green-risk / R5。
 *
 *   pnpm skip-as-clarify:http:prove
 *   pnpm -C apps/api prove:skip-as-clarify-http   (raw; needs isolated DATABASE_URL)
 *
 * 分类（ci-cd.md §8，#243 合入后挂钩）：重 HTTP+consumer prove，进 verify:local，不进 PR CI / nightly。
 * 本 PR 不改 ci.yml / nightly-ciw2.yml / ci-cd.md / deploy.yml（#243 独占），挂钩写在 PR 描述。
 */
import 'reflect-metadata';
import { createRequire } from 'node:module';
import { createHash, randomUUID } from 'node:crypto';

import {
  assertIsolatedTestTarget, createPool, provisionRuntimeLogin, asPrincipal,
  createResumeWithBlob, transitionResume, completeIngestion, availableUnits,
  type DbPool,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, type ConsumerDeps } from '../../worker/src/interview-consumer.ts';
const { MemorySaver } = createRequire(new URL('../../worker/package.json', import.meta.url))('@langchain/langgraph') as { MemorySaver: new () => unknown };

const CMD = 'pnpm skip-as-clarify:http:prove';
const RESUME_TEXT = '工作经历\n后端工程师\n负责订单系统限流改造，使用 Redis 计数器和滑动窗口保护下游。\n技能\nRedis、限流、分布式锁';
const AUTH_SECRET = `skip-clarify-auth-${randomUUID()}`;
const RUNTIME_PASSWORD = `skip-clarify-runtime-${randomUUID()}`;

process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'skip-as-clarify-http-job-route-input-hmac-proof-key-not-production-01';

const keyPresentOnEntry = String(process.env.MODEL_API_KEY ?? '').trim().length > 0;
delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;
delete process.env.MEETWISE_PUBLIC_PREVIEW;

let failures = 0;
const results: Array<{ name: string; ok: boolean }> = [];
const A = (name: string, ok: boolean, detail?: unknown): boolean => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined && !ok ? `  detail=${JSON.stringify(detail)}` : ''}`);
  if (!ok) failures += 1;
  return ok;
};

console.log('HTTP skip-as-clarify prove · releaseEvidence=false · NOT_HA');
console.log('NOTE: 本绿≠UC covered；≠全栈 e2e:isolated；HTTP mouth + 真 consumer + 脚本模型；Ban live');
console.log(`CMD=${CMD}`);

type Res = { status: number; body: any };
type Qid = { questionId: string; stateVersion: number; turn: number };
type Ev = { kind: string; payload: any; seq: number };

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const turnBody = (id: Qid, answer: string) => ({
  ...id,
  answer,
  answerId: randomUUID(),
  answerHash: sha256(answer),
});

const admin = createPool();
const role = `skip_clarify_${process.pid}`;
let runtime!: DbPool;
let modelCalls = { ask: 0, evaluate: 0, planner: 0 };
let askSeq = 0;

const scripted = scriptedModelClient({
  'planner.competencies': () => {
    modelCalls.planner += 1;
    return { ok: true, raw: { competencies: ['并发', '缓存', '消息队列'] } };
  },
  'interviewer.ask': () => {
    modelCalls.ask += 1;
    return {
      ok: true,
      raw: { q: `结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性，并说明第 ${++askSeq} 轮验证方法`, refs: [] },
    };
  },
  'mock-interview.evaluate': () => {
    modelCalls.evaluate += 1;
    return {
      ok: true,
      raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'meets', quote: '滑动窗口' }] },
    };
  },
});
const model: ModelClient = { complete: (r, a) => scripted.complete(r, a) };

function consumerDeps(pool: DbPool): ConsumerDeps {
  return {
    pool,
    cp: new MemorySaver() as any,
    model,
    leaseOwner: `skip-clarify-w-${process.pid}`,
    adaptive: {
      localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }],
      webExplore: async () => [],
      role: '后端工程师',
    },
  };
}

async function main(): Promise<void> {
  A('L0 Ban live: MODEL_API_KEY absent on entry', !keyPresentOnEntry);
  await assertIsolatedTestTarget(admin);
  console.log('ISOLATED_TARGET_ATTESTATION ok');
  await provisionRuntimeLogin(admin, { roleName: role, password: RUNTIME_PASSWORD });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password: RUNTIME_PASSWORD, sslMode: 'disable',
  });
  A('runtime login current_user',
    (await runtime.query<{ current_user: string }>('SELECT current_user')).rows[0]?.current_user === role);

  Object.assign(process.env, {
    NODE_ENV: 'test',
    AUTH_DEV_HEADER: '1',
    AUTH_SECRET,
    RESUME_ENC_KEY: 'test-resume-enc-key',
    RESUME_HASH_SECRET: 'test-resume-hash-secret',
    PAY_PROVIDER_SECRET: 'test-pay-secret',
    OCR_ENABLED: '0',
    WEB_ORIGIN: 'https://web.example.test',
    PGUSER: role,
    PGPASSWORD: RUNTIME_PASSWORD,
  });

  const { createApp } = await import('../src/main.ts');
  const app = await createApp();
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  const deps = consumerDeps(runtime);

  const call = async (method: string, path: string, headers: Record<string, string> = {}, body?: unknown): Promise<Res> => {
    const res = await fetch(base + path, {
      method,
      headers: body === undefined ? headers : { ...headers, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };
  const hdr = (owner: string): Record<string, string> => ({ 'x-user-id': owner });

  const events = async (owner: string, interviewId: string): Promise<Ev[]> =>
    asPrincipal(runtime, owner, (c) => c.query(
      'SELECT kind, payload, seq FROM interview_event WHERE stream_key=$1 ORDER BY seq',
      [interviewId],
    )).then((r) => r.rows as Ev[]);

  const evKinds = (rows: Ev[], kind: string) => rows.filter((e) => e.kind === kind);
  const lastEv = (rows: Ev[], kind: string) => {
    const xs = evKinds(rows, kind);
    return xs[xs.length - 1];
  };

  const issued = async (owner: string, interviewId: string) =>
    asPrincipal(runtime, owner, (c) => c.query(
      `SELECT question_id, state_version, turn, question, competency, status
         FROM interview_question
        WHERE interview_id=$1 AND status='issued'
        ORDER BY state_version DESC LIMIT 1`,
      [interviewId],
    )).then((r) => r.rows[0] as
      | { question_id: string; state_version: number; turn: number; question: string; competency: string; status: string }
      | undefined);

  const scoreCards = async (owner: string, interviewId: string) =>
    asPrincipal(runtime, owner, (c) => c.query(
      `SELECT count(*)::int AS n
         FROM score_card
        WHERE interview_id=$1 AND owner_user_id=$2`,
      [interviewId, owner],
    )).then((r) => Number(r.rows[0]?.n ?? 0));

  const ivStatus = async (owner: string, interviewId: string) =>
    asPrincipal(runtime, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1', [interviewId]))
      .then((r) => r.rows[0]?.status as string | undefined);

  const drainDiag = async (owner: string, interviewId: string, kind: string) =>
    asPrincipal(runtime, owner, (c) => c.query(
      'SELECT kind, status, last_error FROM interview_job WHERE interview_id=$1 AND kind=$2 ORDER BY created_at DESC LIMIT 3',
      [interviewId, kind],
    )).then((r) => r.rows);

  async function seedResumeAndBucket(owner: string): Promise<string> {
    await admin.query(
      `INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
       VALUES ($1,'paid',5.0, now()+interval '300 days')`,
      [owner],
    );
    const created = await asPrincipal(runtime, owner, async (c) => {
      const up = await createResumeWithBlob(c, owner, RESUME_TEXT);
      await transitionResume(c, owner, up.resumeId, 'uploaded', 'ingesting');
      await completeIngestion(c, owner, up.resumeId, ingestResume(RESUME_TEXT));
      return up;
    });
    return created.resumeId;
  }

  async function openStarted(owner: string): Promise<{ id: string; q0: Qid; q0text: string; q0comp: string; unitsBefore: number }> {
    const resumeId = await seedResumeAndBucket(owner);
    const unitsBefore = await asPrincipal(runtime, owner, (c) => availableUnits(c, owner));
    const created = await call('POST', '/interview', hdr(owner));
    const createdId = (created.body?.interviewId ?? created.body?.id) as string | undefined;
    if (created.status !== 200 || typeof createdId !== 'string') {
      throw new Error(`create_failed:${created.status}:${JSON.stringify(created.body)}`);
    }
    const id = createdId;
    const began = await call('POST', `/interview/${id}/begin`, { ...hdr(owner), 'resume-id': resumeId });
    if (began.status !== 202) {
      throw new Error(`begin_failed:${began.status}:${JSON.stringify(began.body)}`);
    }
    const startDrain = await drainInterviewJobOnce(deps, owner);
    if (startDrain !== 'start') {
      console.error('start drain diagnostic', await drainDiag(owner, id, 'start'));
    }
    A(`${owner} 消费 start job → start`, startDrain === 'start');
    const ev = await events(owner, id);
    const qr = lastEv(ev, 'question_ready');
    const qrow = await issued(owner, id);
    const q0: Qid | undefined = qr
      ? { questionId: String(qr.payload.questionId), stateVersion: Number(qr.payload.stateVersion), turn: Number(qr.payload.turn) }
      : qrow
        ? { questionId: qrow.question_id, stateVersion: Number(qrow.state_version), turn: Number(qrow.turn) }
        : undefined;
    if (!q0 || !qrow) {
      throw new Error(`no_first_question:${owner}:${id}:events=${ev.map((e) => e.kind).join(',')}`);
    }
    return { id, q0, q0text: qrow.question, q0comp: qrow.competency, unitsBefore };
  }

  async function postTurn(owner: string, id: string, body: ReturnType<typeof turnBody>): Promise<Res> {
    return call('POST', `/interview/${id}/turn`, hdr(owner), body);
  }

  async function drainAnswer(owner: string, id: string, tag: string): Promise<void> {
    const r = await drainInterviewJobOnce(deps, owner);
    if (r !== 'answer') {
      console.error(`${tag} answer drain diagnostic`, r, await drainDiag(owner, id, 'answer'));
    }
    A(`${tag} 消费 answer job → answer`, r === 'answer');
  }

  // ── H1 · 跳过当澄清（本缺口主路径）────────────────────────────────
  const evalBeforeH1 = modelCalls.evaluate;
  {
    console.log('\n──────── H1 · 非作答澄清后再 HTTP「跳过」→ unresolved 换题 ────────');
    const owner = `sca-h1-${process.pid}`;
    const sess = await openStarted(owner);
    const ev0 = await events(owner, sess.id);
    A('H1 start 后有 question_ready、尚无 clarification_needed / answer_evaluated',
      evKinds(ev0, 'question_ready').length >= 1
      && evKinds(ev0, 'clarification_needed').length === 0
      && evKinds(ev0, 'answer_evaluated').length === 0);

    const nonAnswer = await postTurn(owner, sess.id, turnBody(sess.q0, '不知道'));
    A('H1 短非作答 /turn → 202 accepted', nonAnswer.status === 202 && nonAnswer.body?.accepted === true, nonAnswer);
    await drainAnswer(owner, sess.id, 'H1-clarify');

    const ev1 = await events(owner, sess.id);
    const clar = lastEv(ev1, 'clarification_needed');
    A('H1 非作答 → clarification_needed（不先换题）', !!clar, ev1.map((e) => e.kind));
    A('H1 引导语提示可回「跳过」', typeof clar?.payload?.hint === 'string' && String(clar.payload.hint).includes('跳过'), clar?.payload?.hint);
    A('H1 澄清后无 answer_evaluated、无 score_card、评估模型仍 0 次',
      evKinds(ev1, 'answer_evaluated').length === 0
      && (await scoreCards(owner, sess.id)) === 0
      && modelCalls.evaluate === evalBeforeH1);
    const clarId: Qid = {
      questionId: String(clar?.payload?.questionId ?? sess.q0.questionId),
      stateVersion: Number(clar?.payload?.stateVersion ?? sess.q0.stateVersion),
      turn: Number(clar?.payload?.turn ?? sess.q0.turn),
    };
    const sameStem = String(clar?.payload?.question ?? '') === sess.q0text
      || String(clar?.payload?.questionId) === sess.q0.questionId;
    A('H1 澄清重发同一题干（或同一 questionId），不是新能力题', sameStem && String(clar?.payload?.competency ?? sess.q0comp) === sess.q0comp);

    const skipBody = turnBody(clarId, '跳过');
    const skipped = await postTurn(owner, sess.id, skipBody);
    A('H1 澄清后 HTTP「跳过」→ 202 accepted', skipped.status === 202 && skipped.body?.accepted === true, skipped);
    await drainAnswer(owner, sess.id, 'H1-skip');

    const ev2 = await events(owner, sess.id);
    const evaluated = evKinds(ev2, 'answer_evaluated');
    const unresolved = evaluated.filter((e) => e.payload?.outcome === 'unresolved');
    A('H1 跳过当澄清 → answer_evaluated.outcome=unresolved（恰 1）',
      unresolved.length === 1 && Number(unresolved[0]!.payload?.score) === 0, evaluated.map((e) => e.payload));
    A('H1 跳过当澄清不写 score_card（hint 0 分≠供卡）', (await scoreCards(owner, sess.id)) === 0);
    A('H1 跳过当澄清不调用评估模型（确定性 isSkip）', modelCalls.evaluate === evalBeforeH1);
    const qr2 = lastEv(ev2, 'question_ready');
    const next = await issued(owner, sess.id);
    A('H1 跳过后发出下一题 question_ready', !!qr2 && evKinds(ev2, 'question_ready').length >= 2);
    A('H1 下一题换能力（pivot，不死缠原题）',
      !!next && next.competency !== sess.q0comp && next.question_id !== sess.q0.questionId
      && next.question_id === qr2?.payload?.questionId, { next, prev: sess.q0comp });
    // interview.status 在 begin 后仍为 created（与 uc-e2e-002 B6「begin 后仍 created·Ban 状态推进依赖」同口径）。
    // 本臂只断言跳过当澄清不会把会话收成终态，也不二次扣额。
    const st = await ivStatus(owner, sess.id);
    const unitsAfter = Number(await asPrincipal(runtime, owner, (c) => availableUnits(c, owner)));
    const unitsExpected = Number(sess.unitsBefore) - 1;
    A('H1 跳过当澄清不收场（status 仍 created，非 completed/abandoned/failed）',
      st === 'created', { status: st });
    A('H1 额度只预留 1 不双扣', unitsAfter === unitsExpected, { unitsBefore: Number(sess.unitsBefore), unitsAfter, unitsExpected });

    // N2 挂在同一场：旧题再答 → stale
    console.log('\n──────── N2 · 跳过当澄清后旧 questionId 再答 → 409 stale_question ────────');
    const stale = await postTurn(owner, sess.id, turnBody(clarId, '跳过'));
    A('N2 旧澄清题再 skip → 409 stale_question', stale.status === 409 && stale.body?.error === 'stale_question', stale);
    const evN2 = await events(owner, sess.id);
    A('N2 409 后 answer_evaluated 条数不增', evKinds(evN2, 'answer_evaluated').length === evaluated.length);
  }

  // ── H2 · 对照：首轮显式跳过不先澄清 ────────────────────────────────
  {
    console.log('\n──────── H2 · 首轮 HTTP「跳过」直接换题（不先 clarification_needed）────────');
    const owner = `sca-h2-${process.pid}`;
    const evalBefore = modelCalls.evaluate;
    const sess = await openStarted(owner);
    const skipped = await postTurn(owner, sess.id, turnBody(sess.q0, '跳过'));
    A('H2 首轮跳过 /turn → 202 accepted', skipped.status === 202 && skipped.body?.accepted === true, skipped);
    await drainAnswer(owner, sess.id, 'H2-skip');
    const ev = await events(owner, sess.id);
    A('H2 首轮跳过无 clarification_needed', evKinds(ev, 'clarification_needed').length === 0, ev.map((e) => e.kind));
    A('H2 首轮跳过 → answer_evaluated.outcome=unresolved',
      evKinds(ev, 'answer_evaluated').some((e) => e.payload?.outcome === 'unresolved' && e.payload?.questionId === sess.q0.questionId));
    const next = await issued(owner, sess.id);
    A('H2 直接换能力出下一题', !!next && next.competency !== sess.q0comp);
    A('H2 首轮跳过不调用评估模型、不写 score_card',
      modelCalls.evaluate === evalBefore && (await scoreCards(owner, sess.id)) === 0);
  }

  // ── N1 · 澄清后再次非作答（非跳过）也换题 ────────────────────────
  {
    console.log('\n──────── N1 · 澄清后再次「还是不会」→ unresolved 换题 ────────');
    const owner = `sca-n1-${process.pid}`;
    const sess = await openStarted(owner);
    const t1 = await postTurn(owner, sess.id, turnBody(sess.q0, '不知道'));
    A('N1 第一次非作答 → 202', t1.status === 202);
    await drainAnswer(owner, sess.id, 'N1-clarify');
    const ev1 = await events(owner, sess.id);
    const clar = lastEv(ev1, 'clarification_needed');
    A('N1 先澄清', !!clar);
    const clarId: Qid = {
      questionId: String(clar?.payload?.questionId ?? sess.q0.questionId),
      stateVersion: Number(clar?.payload?.stateVersion ?? sess.q0.stateVersion),
      turn: Number(clar?.payload?.turn ?? sess.q0.turn),
    };
    const t2 = await postTurn(owner, sess.id, turnBody(clarId, '还是不会'));
    A('N1 第二次非作答 → 202', t2.status === 202, t2);
    await drainAnswer(owner, sess.id, 'N1-unresolved');
    const ev2 = await events(owner, sess.id);
    A('N1 二次非作答 → unresolved（MAX_CLARIFY=1，不二次澄清）',
      evKinds(ev2, 'clarification_needed').length === 1
      && evKinds(ev2, 'answer_evaluated').some((e) => e.payload?.outcome === 'unresolved'));
    const next = await issued(owner, sess.id);
    A('N1 换能力出下一题', !!next && next.competency !== sess.q0comp);
  }

  // ── N3 · 长答案含「跳过」不得误判为 skip ─────────────────────────
  {
    console.log('\n──────── N3 · 长作答内含「跳过」不当显式 skip ────────');
    const owner = `sca-n3-${process.pid}`;
    const evalBefore = modelCalls.evaluate;
    const sess = await openStarted(owner);
    const long = '我在项目里用 Redis 计数器加滑动窗口做了限流，过程中差点想跳过降级方案，但最终还是上了令牌桶并压测验证。';
    const t = await postTurn(owner, sess.id, turnBody(sess.q0, long));
    A('N3 长作答 /turn → 202', t.status === 202, t);
    await drainAnswer(owner, sess.id, 'N3-long');
    const ev = await events(owner, sess.id);
    A('N3 不含 clarification_needed，不当 skip', evKinds(ev, 'clarification_needed').length === 0);
    A('N3 走评估（evaluate 被调用）且 outcome≠unresolved（相关作答）',
      modelCalls.evaluate > evalBefore
      && evKinds(ev, 'answer_evaluated').some((e) => e.payload?.questionId === sess.q0.questionId && e.payload?.outcome !== 'unresolved'),
      evKinds(ev, 'answer_evaluated').map((e) => e.payload?.outcome));
  }

  // ── N5 · 同身份重放不双推进 ────────────────────────────────────
  {
    console.log('\n──────── N5 · 跳过当澄清同 body 重放 → 202 replayed，事件不双写 ────────');
    const owner = `sca-n5-${process.pid}`;
    const sess = await openStarted(owner);
    const t1 = await postTurn(owner, sess.id, turnBody(sess.q0, '不知道'));
    A('N5 setup 非作答 → 202', t1.status === 202);
    await drainAnswer(owner, sess.id, 'N5-clarify');
    const clar = lastEv(await events(owner, sess.id), 'clarification_needed');
    const clarId: Qid = {
      questionId: String(clar?.payload?.questionId ?? sess.q0.questionId),
      stateVersion: Number(clar?.payload?.stateVersion ?? sess.q0.stateVersion),
      turn: Number(clar?.payload?.turn ?? sess.q0.turn),
    };
    const body = turnBody(clarId, 'skip');
    const first = await postTurn(owner, sess.id, body);
    A('N5 澄清后 skip 变体 → 202 accepted', first.status === 202 && first.body?.accepted === true, first);
    await drainAnswer(owner, sess.id, 'N5-skip');
    const evAfter = await events(owner, sess.id);
    const evCount = evAfter.length;
    const evaluatedN = evKinds(evAfter, 'answer_evaluated').length;
    const replay = await postTurn(owner, sess.id, body);
    A('N5 同 answerId 重放 → 202 replayed（不 409）',
      replay.status === 202 && replay.body?.replayed === true, replay);
    const evReplay = await events(owner, sess.id);
    A('N5 重放不新写事件、不新写 answer_evaluated',
      evReplay.length === evCount && evKinds(evReplay, 'answer_evaluated').length === evaluatedN);
    A('N5 skip 变体「skip」同样 unresolved',
      evKinds(evAfter, 'answer_evaluated').some((e) => e.payload?.outcome === 'unresolved'));
  }

  // ── N4 · 越权 / 未鉴权 / 终态 ───────────────────────────────────
  {
    console.log('\n──────── N4 · 越权 404 / 未鉴权 401 / abandon 后 409 ────────');
    const owner = `sca-n4-${process.pid}`;
    const other = `sca-n4b-${process.pid}`;
    const sess = await openStarted(owner);
    const cross = await call('POST', `/interview/${sess.id}/turn`, hdr(other), turnBody(sess.q0, '跳过'));
    A('N4 他主 skip → 404 not_found_or_forbidden',
      cross.status === 404 && cross.body?.error === 'not_found_or_forbidden', cross);
    const unauth = await call('POST', `/interview/${sess.id}/turn`, {}, turnBody(sess.q0, '跳过'));
    A('N4 未鉴权 skip → 401', unauth.status === 401, unauth);
    const evBefore = await events(owner, sess.id);
    A('N4 越权/未鉴权不落 clarification / evaluated',
      evKinds(evBefore, 'clarification_needed').length === 0
      && evKinds(evBefore, 'answer_evaluated').length === 0);

    const ab = await call('POST', `/interview/${sess.id}/abandon`, hdr(owner), {});
    A('N4 abandon → 200', ab.status === 200 && ab.body?.abandoned === true, ab);
    const afterAbandon = await postTurn(owner, sess.id, turnBody(sess.q0, '跳过'));
    A('N4 abandon 后再 skip → 409 interview_not_active',
      afterAbandon.status === 409 && afterAbandon.body?.error === 'interview_not_active', afterAbandon);
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${failed === 0 ? '✓' : '✗'} HTTP 跳过当澄清 prove  ${passed} passed / ${failed} failed · releaseEvidence=false · NOT_HA`);
  await app.close();
  await runtime.end();
  await admin.end();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error('✗', e?.stack ?? e?.message ?? e);
  try { await runtime?.end(); } catch { /* noop */ }
  try { await admin.end(); } catch { /* noop */ }
  process.exit(1);
});
