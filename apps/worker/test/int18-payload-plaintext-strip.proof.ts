/**
 * #18 · INT-P0-RAW-QUEUE 即时剥离回归证明（interview_job.payload 明文 answer）。
 *
 * 修前事实：legacy `/turn` answer job 的 payload 顶层 `answer` 只在 job 终态（markJobDone/
 * markJobFailed）才剥离；答案已被 worker 消费（图已评、投影已提交）后，只要 markJobDone 前
 * 发生瞬时错误/崩溃，job 回 queued 且明文继续滞留（最长到 24h TTL 清理）；reaper 写 failed 的
 * 三条臂与 requeue/sweep 的 failed 分支也不剥离，终态行明文永久滞留。
 *
 * 修后合同：
 *   S1 消费即剥：markInterviewAnswerApplied 同事务剥 `answer`/`asrOutcome`——markJobDone 前注入
 *      瞬时错误（57014）→ job 回 queued，但 payload 已无明文，身份字段保留。
 *   S2 HA 重放：同一 job 重领（无明文）→ 走 checkpoint 补投影成功（'answer'），answer_evaluated
 *      恰一（零双评）、面试未 failed、下一题仍在。
 *   S3 失败关闭对照：未消费却缺明文（TTL 清理后被领）→ 'failed'，零 answer_evaluated（零捏造）。
 *   S4 终态/旧行：reaper worker_died 臂写 failed 同拍剥离；历史 done 行残留明文由
 *      purgeStaleInterviewJobPayloads 不论龄期清理。
 *   S5 全表：终态行零明文。
 *
 * 证据层：隔离真 PG（run-e2e-isolated 全迁移链）· 真产品路径（resume→route→enqueue→
 * drainInterviewJobOnce）· 零 live 模型 · 零外呼。EXIT0 ≠ INT-P0-RAW-QUEUE 关闭（/turn 仍在
 * 消费前短暂持有明文）≠ INT-TRANSCRIPT-01 · releaseEvidence=false · NOT_HA。
 *
 *   pnpm int18:payload-strip:prove        （root · isolated）
 *   pnpm -C apps/worker prove:int18-payload-strip （raw；需 runner 注入的隔离 DATABASE_URL）
 */
process.env.RESUME_ENC_KEY = 'int18-payload-strip-resume-enc-key';
process.env.RESUME_HASH_SECRET = 'int18-payload-strip-resume-hash-secret';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'int18-payload-strip-job-route-input-hmac-proof-key-not-prod-01';
import { randomUUID } from 'node:crypto';
import { MemorySaver } from '@langchain/langgraph';
import {
  createPool, asPrincipal, provisionRuntimeLogin,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob,
  answerHash, claimInterviewAnswer, supplyCandidateProfileRoute, createJob, classifyJobRoute,
  bindApplicationRoute, snapshotInterviewRoute, assertIsolatedTestTarget,
  sweepStuckInterviewJobs, purgeStaleInterviewJobPayloads, MAX_INTERVIEW_JOB_ATTEMPTS, type DbPool,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { type ModelClient, type ModelResult } from '@meetwise/ai-runtime';
import { drainInterviewJobOnce, type ConsumerDeps } from '../src/interview-consumer.ts';

let failures = 0;
let total = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

console.log('#18 INT-P0-RAW-QUEUE payload 即时剥离 prove（S1-S5 · 脚本化假模型 · 零 live 外呼）');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · EXIT0≠INT-P0-RAW-QUEUE closed · ≠INT-TRANSCRIPT-01');


const S = Date.now().toString(36);
const admin = createPool();
const role = `int18_strip_${process.pid}`;
let runtime!: DbPool;

const GREEN_EVAL = { ok: true as const, raw: { relevant: true, hasHook: false, dispositions: [{ criterionId: 'answer_quality', disposition: 'exceeds', quote: '滑动窗口' }] } };
const model: ModelClient = {
  complete: (req) => {
    const scripted: Record<string, () => ModelResult> = {
      'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存', '消息队列'] } }),
      'interviewer.ask': () => ({ ok: true, raw: { q: '结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性，并给出一次具体取舍', refs: [] } }),
      'mock-interview.evaluate': () => GREEN_EVAL,
    };
    const fn = scripted[req.service];
    return Promise.resolve(fn ? fn() : { ok: false as const, kind: 'deterministic' as const });
  },
};

const OWN = (k: string) => `int18-${k}-${S}`;
const IID = (k: string) => `iv-int18-${k}-${S}`;

type Fixture = { owner: string; id: string; deps: ConsumerDeps };

async function fixture(tag: string): Promise<Fixture> {
  const owner = OWN(tag), id = IID(tag), recruiter = `${owner}-recruiter`;
  const resumeText = '合成样本：围绕 Redis、限流与分布式锁回答技术问题。';
  const up = await asPrincipal(runtime, owner, async (c) => {
    const created = await createResumeWithBlob(c, owner, resumeText);
    await transitionResume(c, owner, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, owner, created.resumeId, ingestResume(resumeText));
    return created;
  });
  const epoch = Number((await admin.query<{ privacy_epoch: number }>('SELECT privacy_epoch FROM resume WHERE id=$1', [up.resumeId])).rows[0]?.privacy_epoch);
  await admin.query("INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'created',$3,$4)", [id, owner, up.resumeId, epoch]);
  await asPrincipal(runtime, owner, (c) => supplyCandidateProfileRoute(c, owner, id, up.resumeId));
  const job = await asPrincipal(runtime, recruiter, (c) => createJob(c, recruiter, {
    title: 'Node.js 服务端工程师', description: '使用 NestJS 构建服务', competencies: ['nestjs', 'express', 'koa'],
  }));
  const rev = Number((await admin.query('SELECT COALESCE(MAX(revision),0)::int n FROM job_semantic_revision WHERE job_id=$1', [job.id])).rows[0].n);
  await classifyJobRoute(runtime, recruiter, job.id, rev, { modelClassify: async () => { throw new Error('fixture must rule-decide'); } });
  await asPrincipal(runtime, owner, (c) => bindApplicationRoute(c, {
    candidateUserId: owner, recruiterUserId: recruiter, jobId: job.id, applicationId: `${tag}-app-${id}`, emitConsumptionEvent: true,
  }));
  await asPrincipal(runtime, owner, (c) => snapshotInterviewRoute(c, owner, id, `${tag}-app-${id}`));
  const deps: ConsumerDeps = {
    pool: runtime, cp: new MemorySaver() as any, model, leaseOwner: `int18-${tag}`,
    adaptive: {
      localRetrieve: async () => [{ ref: 'qbank:a', score: 0.9 }], webExplore: async () => [],
      role: '后端工程师', maxTurns: 2, absoluteMaxTurns: 3,
    },
  };
  return { owner, id, deps };
}

/** 故障注入 pool：仅首个 markJobDone UPDATE 抛 57014（白名单瞬时码 → requeue）。 */
function faultOnMarkDone(pool: DbPool): { pool: DbPool; fired: () => boolean } {
  let fired = false;
  const wrapClient = (c: any) => new Proxy(c, {
    get(t, p) {
      if (p === 'query') {
        return (text: unknown, ...rest: unknown[]) => {
          if (!fired && typeof text === 'string' && text.startsWith("UPDATE interview_job SET status='done'")) {
            fired = true;
            return Promise.reject(Object.assign(new Error('canceling statement due to statement timeout (int18 injected)'), { code: '57014' }));
          }
          return t.query(text, ...rest);
        };
      }
      const v = Reflect.get(t, p);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  const proxied = new Proxy(pool as any, {
    get(t, p) {
      if (p === 'connect') return async () => wrapClient(await t.connect());
      const v = Reflect.get(t, p);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  return { pool: proxied as DbPool, fired: () => fired };
}

const issuedQuestion = (f: Fixture) => asPrincipal(admin, f.owner, (c) => c.query(
  "SELECT question_id, state_version, turn FROM interview_question WHERE interview_id=$1 AND status='issued' ORDER BY state_version DESC LIMIT 1", [f.id],
)).then((r) => r.rows[0] as { question_id: string; state_version: number; turn: number } | undefined);
const jobRow = (id: string) => admin.query(
  `SELECT status, payload ? 'answer' AS has_answer, payload ? 'asrOutcome' AS has_asr,
          payload->>'questionId' AS qid, payload->>'answerId' AS aid, payload->>'answerHash' AS ahash
     FROM interview_job WHERE id=$1`, [id],
).then((r) => r.rows[0] as { status: string; has_answer: boolean; has_asr: boolean; qid: string | null; aid: string | null; ahash: string | null });
const evCount = (f: Fixture, kind: string) => admin.query(
  'SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2', [f.id, kind],
).then((r) => r.rows[0].n as number);
const ivStatus = (f: Fixture) => admin.query('SELECT status FROM interview WHERE id=$1', [f.id]).then((r) => r.rows[0]?.status as string);

async function startAndEnqueueAnswer(f: Fixture, tag: string): Promise<{ jobId: string; input: Record<string, unknown> }> {
  await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'start', {}, 0));
  const started = await drainInterviewJobOnce(f.deps, f.owner);
  if (started !== 'start') throw new Error(`int18_${tag}_start_not_drained:${started}`);
  const q = await issuedQuestion(f);
  if (!q) throw new Error(`int18_${tag}_no_issued_question`);
  const answer = `我用 Redis 计数器+滑动窗口扛高并发，超阈值降级（int18 · ${tag} · 明文标记 PLAINTEXT-${tag}）`;
  const input = {
    questionId: q.question_id, stateVersion: Number(q.state_version), turn: Number(q.turn),
    answerId: randomUUID(), answerHash: answerHash(answer), answer, asrOutcome: 'word_timestamps_not_available',
  };
  const claimed = await asPrincipal(runtime, f.owner, (c) => claimInterviewAnswer(c, f.owner, f.id, input));
  if (claimed.status !== 'accepted') throw new Error(`int18_${tag}_claim_${claimed.status}`);
  const jobId = await asPrincipal(runtime, f.owner, (c) => enqueueInterviewJob(c, f.owner, f.id, 'answer', input, input.turn + 1));
  return { jobId, input };
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password: `${role}-pw`, sslMode: 'disable',
  });

  // ── S1 · 消费即剥 ──
  section('S1 · 答案已应用后、markJobDone 前瞬时错误 → requeue，payload 已无明文');
  const f1 = await fixture('s1');
  const { jobId: j1 } = await startAndEnqueueAnswer(f1, 's1');
  const before = await jobRow(j1);
  A('S1 前提: 入队后 payload 含明文 answer（legacy /turn 现状）', before.has_answer === true);
  const fault = faultOnMarkDone(runtime);
  const r1 = await drainInterviewJobOnce({ ...f1.deps, pool: fault.pool }, f1.owner);
  A('S1 前提: 故障确实注入在 markJobDone', fault.fired());
  A('S1 前提: 瞬时错误 → retry（requeue）', r1 === 'retry');
  const after1 = await jobRow(j1);
  E('S1-ROW', after1);
  A('S1 前提: job 回 queued（未终态）', after1.status === 'queued');
  A('S1 前提: 答案已被消费（answer_evaluated 恰一）', (await evCount(f1, 'answer_evaluated')) === 1);
  A('S1 核心: 消费后 queued 行 payload 不再含明文 answer', after1.has_answer === false);
  A('S1 核心: asrOutcome 同拍剥离', after1.has_asr === false);
  A('S1 身份字段保留（questionId/answerId/answerHash）', !!after1.qid && !!after1.aid && /^[a-f0-9]{64}$/.test(after1.ahash ?? ''));

  // ── S2 · HA 重放 ──
  section('S2 · 无明文重领 → checkpoint 补投影成功，零双评');
  await admin.query('UPDATE interview_job SET next_attempt_at=NULL WHERE id=$1', [j1]);
  const r2 = await drainInterviewJobOnce(f1.deps, f1.owner);
  const after2 = await jobRow(j1);
  E('S2-ROW', { drained: r2, ...after2, interview: await ivStatus(f1) });
  A('S2 重放走通（answer）', r2 === 'answer');
  A('S2 job done 且无明文', after2.status === 'done' && after2.has_answer === false);
  A('S2 answer_evaluated 仍恰一（零双评）', (await evCount(f1, 'answer_evaluated')) === 1);
  A('S2 面试未被判 failed', (await ivStatus(f1)) !== 'failed');
  A('S2 下一题仍 issued（会话不断流）', (await issuedQuestion(f1)) !== undefined);

  // ── S3 · 失败关闭对照 ──
  section('S3 · 未消费却缺明文（TTL 清理形）→ failed，零捏造');
  const f3 = await fixture('s3');
  const { jobId: j3 } = await startAndEnqueueAnswer(f3, 's3');
  await asPrincipal(admin, f3.owner, (c) => c.query("UPDATE interview_job SET payload=payload-'answer'-'asrOutcome' WHERE id=$1", [j3]));
  const r3 = await drainInterviewJobOnce(f3.deps, f3.owner);
  A('S3 未消费缺明文 → failed（失败关闭）', r3 === 'failed');
  A('S3 零 answer_evaluated（不拿空原文评分）', (await evCount(f3, 'answer_evaluated')) === 0);

  // ── S4 · 终态/旧行 ──
  section('S4 · reaper failed 臂剥离 + 历史 done 行残留清理');
  const f4 = await fixture('s4');
  const { jobId: j4 } = await startAndEnqueueAnswer(f4, 's4');
  await asPrincipal(admin, f4.owner, (c) => c.query(
    "UPDATE interview_job SET status='running', lease_owner='dead-worker', lease_expires_at=now()-interval '5 minutes', attempts=$2 WHERE id=$1",
    [j4, MAX_INTERVIEW_JOB_ATTEMPTS],
  ));
  const swept = await asPrincipal(runtime, f4.owner, (c) => sweepStuckInterviewJobs(c, f4.owner));
  const after4 = await jobRow(j4);
  E('S4-SWEEP', { failed: swept.failed, ...after4 });
  A('S4 前提: reaper 终结为 failed', after4.status === 'failed' && swept.failed >= 1);
  A('S4 核心: reaper failed 臂同拍剥离明文', after4.has_answer === false && after4.has_asr === false);
  // 旧行：修复前已 done 的行残留明文（模拟历史数据，0126 无 artifact 放行）。
  await asPrincipal(admin, f1.owner, (c) => c.query(`UPDATE interview_job SET payload=payload || jsonb_build_object('answer','LEGACY-PLAINTEXT-done') WHERE id=$1`, [j1]));
  A('S4 前提: 旧 done 行含明文', (await jobRow(j1)).has_answer === true);
  const purged = await asPrincipal(runtime, f1.owner, (c) => purgeStaleInterviewJobPayloads(c, f1.owner));
  A('S4 核心: 旧终态行不论龄期被 purge 清理', purged.purged >= 1 && (await jobRow(j1)).has_answer === false);
  A('S4 旧行清理不改状态', (await jobRow(j1)).status === 'done');

  // ── S5 · 全表 ──
  section('S5 · 全表：终态行零明文');
  const residual = await admin.query<{ n: number }>(
    "SELECT count(*)::int n FROM interview_job WHERE status IN ('done','failed') AND (payload ? 'answer' OR payload ? 'asrOutcome') AND owner_user_id LIKE $1",
    [`int18-%-${S}`],
  );
  A('S5 本案终态行明文残留=0', residual.rows[0]?.n === 0);

  console.log(`\n${failures === 0 ? `✓ #18 payload 即时剥离全臂绿（${total}/${total}）· EXIT=0` : `✗ ${failures}/${total} #18 断言失败`}`);
  console.log('PIN: EXIT0 ≠ INT-P0-RAW-QUEUE closed（消费前仍短暂持有明文）· ≠ INT-TRANSCRIPT-01 · releaseEvidence=false · NOT_HA');
  await runtime.end();
  await admin.end();
  process.exit(failures ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.stack ?? e);
  process.exit(1);
});
