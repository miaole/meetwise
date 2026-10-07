/**
 * UC-E2E-016/029 FAULT focused prove — NHP-016-FAULT-01（诊断/押题显式失败注入 → *_unavailable 终态 · 无死胡同）.
 *
 * Knife: ai-docs/delivery/harness/gap-uc016-fault-inject-nhp.md · gap id GAP-UC016-FAULT-01.
 * Contract: PC + F1(quiz 模型缝抛错) + F2(diagnosis 同族) + F3(E3 schema 第一层拒绝·确定性收敛)
 *           + F4(失败后重建到 ready · D1 重建映射) + F5(无悬挂消费/二次 reap 幂等) + F6(收据)
 *           + NEG 硬闸 N1(全程额度净 0/无双重退款/已结算不重复退) N2(死胡同反向行使) N3(已 ready 不倒退) N4(attempts 有界)。
 *
 * C-HA-1 micro-patch `95b1fd95` 键面（逐字 · N2/F5 共用 · fail-closed keying）：
 *   「每个 failed 且对象**非 ready** 的注入面 job 恰一条 *_unavailable 终态事件（fail-closed 键面：
 *    alreadySettled 晚到失败对象已结算 ready、故意无终态事件系产品既有语义 → 不在逐 job 断言面内 ·
 *    Ban 藉本键面把已 ready 倒退合法化——N3 仍守）」。alreadySettled 对象由 N1 负向断言
 *   「不重复退、不发假终态」与 N3「ready 不倒退」兜底（quiz-consumer.ts:76-83 alreadySettled 分支亲读）。
 *
 * 造数诚实（harness · C-HA-3/C-RR-1）：
 *   - 消费生命周期全经真产品路径 reserveEntitlement / enqueueQuizJob / enqueueDiagnosisJob /
 *     quizDispatchTick / diagnosisDispatchTick（Ban 裸 INSERT 绕产品路径 · 沿 quiz.proof/diagnosis.proof 先例）。
 *   - resume_quiz / resume_diagnosis 夹具行（status='created' + resume 引用）与 entitlement_bucket provision
 *     为夹具（quiz.proof:44-45 / diagnosis.proof:75-76 同款先例）；alreadySettled 场景的对象 ready 态
 *     由真产品 drain（成功 scripted 模型）产生，仅 job 行 orphan 化（reaper.proof:35-40 同款 fixture 时移）。
 * - 零 live 模型（C-HA-5/C-RR-2）：全部注入经 scriptedModelClient（model-client.ts:137 既有生产缝）
 *     + run 时 env -u MODEL_API_KEY；缺 key 时 model-client.ts:364 fail-closed 不外呼（双保险）。
 *
 * Isolation: 三层壳 pnpm uc016:nhp-fault:prove → run-e2e-isolated.mjs → prove:uc016-nhp-fault；
 *            assertIsolatedTestTarget 强制隔离 nonce。
 *
 * EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ UC-016/029 行升格 ≠ PERF_api/PERF_web/LOAD_worker
 *        ≠ 生产容量 ≠ SLO ≠ HA ≠ 模型质量闭环。releaseEvidence=false · Not HA · coveredCount=8 不变。
 *
 *   pnpm uc016:nhp-fault:prove                (via run-e2e-isolated)
 *   pnpm -C apps/worker prove:uc016-nhp-fault (raw; needs isolated env + container nonce)
 *
 * Frozen params（receipt 同步登记）：bucket='paid' 9.00 · TTL=now()+300 days（≥ run 时长+余量）·
 * 每流预留 units=1.00 · 结算流恰 6（PC quiz/diag + F4 quiz/diag + ASett quiz/diag · 成功结算属设计内）·
 * 失败流恰 3（F1/F2/F3 · 全部退款净 0）· MAX_QUIZ_JOB_ATTEMPTS=5 / MAX_DIAGNOSIS_JOB_ATTEMPTS=5（产品常量）。
 */
import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, availableUnits,
  enqueueQuizJob, enqueueDiagnosisJob,
  sweepStuckQuizJobs, sweepStuckDiagnosisJobs,
  MAX_QUIZ_JOB_ATTEMPTS, MAX_DIAGNOSIS_JOB_ATTEMPTS,
  createResumeWithBlob, transitionResume, completeIngestion,
} from '@meetwise/db';
import { scriptedModelClient } from '@meetwise/ai-runtime';
import { ingestResume } from '@meetwise/domain';
import { quizDispatchTick, type QuizConsumerDeps } from '../src/quiz-consumer.ts';
import { diagnosisDispatchTick, type DiagnosisConsumerDeps } from '../src/diagnosis-consumer.ts';

// ── frozen params（harness 登记 · 冻结入 receipt）────────────────────────────────
const BUCKET_TTL_DAYS = 300;
const UNITS_PER_FLOW = 1.0;
const QUIZ_FLOWS = ['PC', 'F1', 'F3', 'F4', 'ASET'] as const;      // 5 × 1.0
const DIAG_FLOWS = ['PC', 'F2', 'F4', 'ASET'] as const;            // 4 × 1.0
const BUCKET_TOTAL = (QUIZ_FLOWS.length + DIAG_FLOWS.length) * UNITS_PER_FLOW; // 9.00
const SETTLED_FLOWS = 6;   // PC quiz/diag + F4 quiz/diag + ASett quiz/diag（成功结算 · 设计内）
const EXPECTED_FINAL_AVAIL = BUCKET_TOTAL - SETTLED_FLOWS * UNITS_PER_FLOW;    // 3.00

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWNER = `uc016fault-${S}`;
const eq = (a: number, b: number) => Math.round(a * 100) === Math.round(b * 100);

const RECEIPT_DIR = fileURLToPath(new URL('../../../.tmp/uc016-fault-receipts/', import.meta.url));

// ── C-HA-5/C-RR-2 · scripted 缝逐 case 冻结（receipt 同步落盘）──────────────────
// F1（harness F1 逐字「resume-quiz.generate 脚本抛错」）· F2 同族 · F3（ok:true + schema 外形非法 JSON）。
const throwF1Script = { 'resume-quiz.generate': () => { throw new Error('nhp16_injected_model_outage'); } };
const throwF2Script = { 'resume-diagnosis.generate': () => { throw new Error('nhp16_injected_diagnosis_outage'); } };
const schemaF3Script = { 'resume-quiz.generate': () => ({ ok: true as const, raw: { items: 'nhp16-schema-injection-not-an-array' } }) };
const okQuizScript = { 'resume-quiz.generate': () => ({ ok: true as const, raw: { items: [
  { q: '限流怎么做?', refs: ['限流'] }, { q: 'Redis 原子性?', refs: ['Redis'] }, { q: '3 年 Go?', refs: ['Go'] },   // Go 幻觉 → factuality 门过滤
] } }) };
const okDiagScript = { 'resume-diagnosis.generate': () => ({ ok: true as const, raw: {
  overall: 72,
  summary: '结构清晰、有高并发实战亮点,但缺量化指标与岗位关键词。',
  sections: [
    { kind: 'structure', title: '结构与排版', score: 80, findings: [{ text: '分节清晰,信息密度合理', refs: [] }] },
    { kind: 'highlight', title: '亮点', score: 85, findings: [{ text: '有高并发限流实战经验', refs: ['限流'] }] },
    { kind: 'risk', title: '风险/硬伤', findings: [{ text: '成果缺少量化数据(QPS/延迟)', refs: [] }] },
    { kind: 'match', title: '岗位匹配度', score: 70, findings: [{ text: '与后端高并发岗位相关', refs: ['限流'] }] },
  ],
  rewrites: [
    { before: '负责订单系统限流改造', after: '主导订单系统限流改造,基于 Redis 计数器支撑高并发', refs: ['限流', 'Redis'] },
  ],
} }) };

const classification: Record<string, unknown> = {};   // C-RR-3：按实际行为落 receipt

const avail = () => asPrincipal(pool, OWNER, (c) => availableUnits(c, OWNER));
const quizObj = (id: string) => asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_quiz WHERE id=$1', [id])).then((r) => r.rows[0]?.status as string);
const diagObj = (id: string) => asPrincipal(pool, OWNER, (c) => c.query('SELECT status FROM resume_diagnosis WHERE id=$1', [id])).then((r) => r.rows[0]?.status as string);
const quizJob = (id: string) => asPrincipal(pool, OWNER, (c) => c.query('SELECT status, attempts, last_error FROM quiz_job WHERE quiz_id=$1', [id])).then((r) => r.rows[0]);
const diagJob = (id: string) => asPrincipal(pool, OWNER, (c) => c.query('SELECT status, attempts, last_error FROM diagnosis_job WHERE diagnosis_id=$1', [id])).then((r) => r.rows[0]);
const evCount = async (stream: string, kind: string) => Number((await asPrincipal(pool, OWNER, (c) => c.query('SELECT count(*)::int n FROM interview_event WHERE stream_key=$1 AND kind=$2', [stream, kind]))).rows[0].n);

/** C-HA-1 micro-patch 键面枚举（逐字语义）：failed 且对象非 ready → 入逐 job 终态事件断言面；
 *  failed 且对象 ready（alreadySettled）→ 不在断言面内（N1 负向 + N3 兜底），本函数同时返回两集合供双面断言。 */
function keyFace(jobs: Array<{ stream: string; jobStatus: string; objStatus: string }>) {
  const failedNotReady = jobs.filter((j) => j.jobStatus === 'failed' && j.objStatus !== 'ready');
  const failedReady = jobs.filter((j) => j.jobStatus === 'failed' && j.objStatus === 'ready');
  return { failedNotReady, failedReady };
}

const RESUME_TEXT = ['工作经历', '负责订单系统限流改造,用 Redis 计数器扛高并发', '技能', 'Redis、限流、分布式锁'].join('\n');

async function seedResume(): Promise<string> {
  return asPrincipal(pool, OWNER, async (c) => {
    const up = await createResumeWithBlob(c, OWNER, RESUME_TEXT);
    await transitionResume(c, OWNER, up.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, up.resumeId, ingestResume(RESUME_TEXT));
    return up.resumeId;
  });
}

async function main() {
  await assertIsolatedTestTarget(pool);

  // 夹具：对象行（'created' + 引用）与桶 provision（quiz.proof:44-45 先例）· 造数主路径走真产品 API。
  const QID = (k: string) => `qz16-${k}-${S}`;
  const DID = (k: string) => `dg16-${k}-${S}`;
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(`INSERT INTO resume_quiz(id,owner_user_id,status) VALUES ${QUIZ_FLOWS.map((_, i) => `($${i * 2 + 1},$${i * 2 + 2},'created')`).join(',')}`,
      QUIZ_FLOWS.flatMap((k) => [QID(k), OWNER]));
    await c.query(`INSERT INTO resume_diagnosis(id,owner_user_id,status) VALUES ${DIAG_FLOWS.map((_, i) => `($${i * 2 + 1},$${i * 2 + 2},'created')`).join(',')}`,
      DIAG_FLOWS.flatMap((k) => [DID(k), OWNER]));
    await c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now() + ($3 || ' days')::interval)",
      [OWNER, BUCKET_TOTAL, String(BUCKET_TTL_DAYS)],
    );
  });
  const resumeId = await seedResume();
  const epoch = await asPrincipal(pool, OWNER, async (c) => Number((await c.query<{ privacy_epoch: number }>(
    'SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, OWNER],
  )).rows[0]!.privacy_epoch));
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(`UPDATE resume_quiz SET resume_id=$3,privacy_epoch=$4 WHERE owner_user_id=$1 AND id IN (${QUIZ_FLOWS.map((_, i) => `$${i + 5}`).join(',')})`, [OWNER, resumeId, epoch, ...QUIZ_FLOWS.map((k) => QID(k))]);
    await c.query(`UPDATE resume_diagnosis SET resume_id=$3,privacy_epoch=$4 WHERE owner_user_id=$1 AND id IN (${DIAG_FLOWS.map((_, i) => `$${i + 5}`).join(',')})`, [OWNER, resumeId, epoch, ...DIAG_FLOWS.map((k) => DID(k))]);
  });
  const avail0 = await avail();
  classification.envModelApiKeyUnset = process.env.MODEL_API_KEY === undefined;

  // ══ PC · positive control（成功 scripted 模型 · 对照缺失=Ban 假绿）══════════════
  section('PC · positive control：成功模型 quiz+diagnosis 经真队列到 ready+结算');
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID('PC'), 'resume_quiz', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID('PC'), resumeId, epoch));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID('PC'), 'resume_diagnosis', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueDiagnosisJob(c, OWNER, DID('PC'), resumeId, epoch));
  const pcQuiz = await quizDispatchTick({ pool, model: scriptedModelClient(okQuizScript), leaseOwner: 'nhp16-w1' } as QuizConsumerDeps);
  const pcDiag = await diagnosisDispatchTick({ pool, model: scriptedModelClient(okDiagScript), leaseOwner: 'nhp16-w1' } as DiagnosisConsumerDeps);
  A('PC 消费到 owner（对照前置）', pcQuiz.owners >= 1 && pcDiag.owners >= 1);
  A('PC 押题 ready（正对照活 · 幻觉 Go 题被过滤后 2 题）', (await quizObj(QID('PC'))) === 'ready'
    && Number((await asPrincipal(pool, OWNER, (c) => c.query('SELECT jsonb_array_length(questions) n FROM resume_quiz WHERE id=$1', [QID('PC')]))).rows[0].n) === 2);
  A('PC 诊断 ready（正对照活）', (await diagObj(DID('PC'))) === 'ready');
  A('PC job 双 done（无卡 running/queued）', (await quizJob(QID('PC'))).status === 'done' && (await diagJob(DID('PC'))).status === 'done');
  A('PC 终态事件 quiz_ready + diagnosis_ready', (await evCount(QID('PC'), 'quiz_ready')) === 1 && (await evCount(DID('PC'), 'diagnosis_ready')) === 1);
  A('PC 结算 -2.0（success settles by design）', eq(await avail(), avail0 - 2 * UNITS_PER_FLOW));

  // ══ F1 + F2 · 模型缝抛错（E2/E1 主证）════════════════════════════════════════
  section('F1+F2 · resume-quiz.generate / resume-diagnosis.generate 脚本抛错 → failed + 终态事件 + 退预留');
  const availBeforeF12 = await avail();
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID('F1'), 'resume_quiz', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID('F1'), resumeId, epoch));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID('F2'), 'resume_diagnosis', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueDiagnosisJob(c, OWNER, DID('F2'), resumeId, epoch));
  const f1Tick = await quizDispatchTick({ pool, model: scriptedModelClient(throwF1Script), leaseOwner: 'nhp16-w2' } as QuizConsumerDeps);
  const f2Tick = await diagnosisDispatchTick({ pool, model: scriptedModelClient(throwF2Script), leaseOwner: 'nhp16-w2' } as DiagnosisConsumerDeps);
  const f1j = await quizJob(QID('F1')); const f2j = await diagJob(DID('F2'));
  A('F1 quiz_job failed（终态 · 不无限重试）', f1j.status === 'failed');
  A('F2 diagnosis_job failed（同族）', f2j.status === 'failed');
  A('F1 对象 resume_quiz failed（生成链路未交付）', (await quizObj(QID('F1'))) === 'failed');
  A('F2 对象 resume_diagnosis failed（同族）', (await diagObj(DID('F2'))) === 'failed');
  A('F1 恰一条 quiz_unavailable 终态事件（无静默死胡同）', (await evCount(QID('F1'), 'quiz_unavailable')) === 1);
  A('F2 恰一条 diagnosis_unavailable 终态事件（同族）', (await evCount(DID('F2'), 'diagnosis_unavailable')) === 1);
  A('F1 attempts=1（单次行使即终态）', Number(f1j.attempts) === 1);
  A('F2 attempts=1', Number(f2j.attempts) === 1);
  A('F1+F2 双退款落账（退回到注入前 · N1 非空转：drain release 吞错则本断言必红）', eq(await avail(), availBeforeF12));
  classification.F1 = { inject: 'script throw(nhp16_injected_model_outage)', jobLastError: f1j.last_error ?? null, attempts: Number(f1j.attempts) };
  classification.F2 = { inject: 'script throw(nhp16_injected_diagnosis_outage)', jobLastError: f2j.last_error ?? null, attempts: Number(f2j.attempts) };

  // ══ F3 · E3 schema 非法 JSON → 双校验第一层拒绝 → 确定性收敛（不无限重试）══════
  section('F3 · ok:true + schema 外形非法 JSON → invoke 第一层 schema 拒绝 → 收敛');
  const availBeforeF3 = await avail();
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID('F3'), 'resume_quiz', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID('F3'), resumeId, epoch));
  await quizDispatchTick({ pool, model: scriptedModelClient(schemaF3Script), leaseOwner: 'nhp16-w3' } as QuizConsumerDeps);
  const f3j = await quizJob(QID('F3'));
  A('F3 job failed（终态）', f3j.status === 'failed');
  A('F3 对象 resume_quiz failed', (await quizObj(QID('F3'))) === 'failed');
  A('F3 last_error 含 schema_validation_failed（双校验第一层 schema 拒绝 · 实际行为即证据）', String(f3j.last_error ?? '').includes('schema_validation_failed'));
  A('F3 恰一条 quiz_unavailable 终态事件（可解释降级 · 非死胡同）', (await evCount(QID('F3'), 'quiz_unavailable')) === 1);
  A('F3 退预留净 0', eq(await avail(), availBeforeF3));
  await quizDispatchTick({ pool, model: scriptedModelClient(schemaF3Script), leaseOwner: 'nhp16-w3b' } as QuizConsumerDeps);   // 收敛复核拍
  const f3j2 = await quizJob(QID('F3'));
  A('F3 二次调度零 requeue 零重跑（attempts 仍=1 · 确定性拒绝不无限重试）', f3j2.status === 'failed' && Number(f3j2.attempts) === 1);
  A('F3 attempts 有界上界=产品常量 MAX_QUIZ_JOB_ATTEMPTS', Number(f3j2.attempts) <= MAX_QUIZ_JOB_ATTEMPTS);
  classification.F3 = { inject: 'ok:true + raw.items not-an-array (schema-invalid)', jobLastError: f3j.last_error ?? null, attempts: Number(f3j2.attempts), note: '实测=第一层 schema 拒绝即终态收敛 · spec E3「transient 重试」分支 NOT claimed（C-RR-3）' };

  // ══ F4 · 失败后重建到 ready（D1 重建映射 · 非字面 failed→pending 口）══════════
  section('F4 · 失败后重建新实例 → ready（A1/A2 验收语义 · D1 重建映射 · 非字面 failed→pending 口）');
  const availBeforeF4 = await avail();
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID('F4'), 'resume_quiz', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID('F4'), resumeId, epoch));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID('F4'), 'resume_diagnosis', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueDiagnosisJob(c, OWNER, DID('F4'), resumeId, epoch));
  await quizDispatchTick({ pool, model: scriptedModelClient(okQuizScript), leaseOwner: 'nhp16-w4' } as QuizConsumerDeps);
  await diagnosisDispatchTick({ pool, model: scriptedModelClient(okDiagScript), leaseOwner: 'nhp16-w4' } as DiagnosisConsumerDeps);
  A('F4 重建押题 ready（重试后可成功 · D1 映射标记：此为「重建新实例」非字面 failed→pending 状态机口）', (await quizObj(QID('F4'))) === 'ready');
  A('F4 重建诊断 ready（同上 · D1 映射标记）', (await diagObj(DID('F4'))) === 'ready');
  A('F4 旧失败对象终态稳定不复活（quiz F1/F3 仍 failed）', (await quizObj(QID('F1'))) === 'failed' && (await quizObj(QID('F3'))) === 'failed');
  A('F4 旧失败对象终态稳定不复活（diagnosis F2 仍 failed）', (await diagObj(DID('F2'))) === 'failed');
  A('F4 旧失败对象事件数不变（终态稳定 · C-HA-4 不省略）', (await evCount(QID('F1'), 'quiz_unavailable')) === 1 && (await evCount(DID('F2'), 'diagnosis_unavailable')) === 1 && (await evCount(QID('F3'), 'quiz_unavailable')) === 1);
  A('F4 结算 -2.0（成功结算设计内）', eq(await avail(), availBeforeF4 - 2 * UNITS_PER_FLOW));
  classification.F4 = { inject: 'success model on NEW instances', mapping: 'D1 rebuild-mapping（重建≠同实例复活 · Ban 宣称字面 failed→pending 已验）' };

  // ══ alreadySettled · 已结算 ready 对象晚到失败（C-HA-1 键面豁免面 · N1 负向 + N3 兜底）═══
  section('ASett · 已结算 ready 对象 + 孤儿化 job 被 reap → 不发假终态/不重复退/不倒退（reaper.proof ⑥ 同构）');
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, QID('ASET'), 'resume_quiz', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueQuizJob(c, OWNER, QID('ASET'), resumeId, epoch));
  await asPrincipal(pool, OWNER, (c) => reserveEntitlement(c, OWNER, DID('ASET'), 'resume_diagnosis', UNITS_PER_FLOW));
  await asPrincipal(pool, OWNER, (c) => enqueueDiagnosisJob(c, OWNER, DID('ASET'), resumeId, epoch));
  await quizDispatchTick({ pool, model: scriptedModelClient(okQuizScript), leaseOwner: 'nhp16-w5' } as QuizConsumerDeps);
  await diagnosisDispatchTick({ pool, model: scriptedModelClient(okDiagScript), leaseOwner: 'nhp16-w5' } as DiagnosisConsumerDeps);
  A('ASett 双对象经真 drain 到 ready+已结算', (await quizObj(QID('ASET'))) === 'ready' && (await diagObj(DID('ASET'))) === 'ready');
  // fixture orphan 化（reaper.proof:35-40 同款：仅 job 行 status/lease/attempts 时移 · 对象/账面零触碰）：
  await asPrincipal(pool, OWNER, async (c) => {
    await c.query(`UPDATE quiz_job SET status='running', lease_owner='dead-worker#nhp16', lease_expires_at=now()-interval '5 minutes', attempts=$2 WHERE quiz_id=$1`, [QID('ASET'), MAX_QUIZ_JOB_ATTEMPTS]);
    await c.query(`UPDATE diagnosis_job SET status='running', lease_owner='dead-worker#nhp16', lease_expires_at=now()-interval '5 minutes', attempts=$2 WHERE diagnosis_id=$1`, [DID('ASET'), MAX_DIAGNOSIS_JOB_ATTEMPTS]);
  });
  const availBeforeReap = await avail();
  const rq = await asPrincipal(pool, OWNER, (c) => sweepStuckQuizJobs(c, OWNER));
  const rd = await asPrincipal(pool, OWNER, (c) => sweepStuckDiagnosisJobs(c, OWNER));
  A('ASett 孤儿 job 被收割（quiz failed=1 · diag failed=1 · release 返 already_confirmed → 跳过事件+跳过对象翻转）',
    rq.failed === 1 && rd.failed === 1 && rq.requeued === 0 && rd.requeued === 0);
  A('ASett job 已终结 failed（清理面）', (await quizJob(QID('ASET'))).status === 'failed' && (await diagJob(DID('ASET'))).status === 'failed');
  A('N3 ASett 已 ready 押题不被倒退（CAS NOT IN ready 自证条款负向行使）', (await quizObj(QID('ASET'))) === 'ready');
  A('N3 ASett 已 ready 诊断不被倒退（同族）', (await diagObj(DID('ASET'))) === 'ready');
  A('N1 ASett 不发假终态（quiz_unavailable 仍=0 · 产品既有语义：已交付对象不发失败事件）', (await evCount(QID('ASET'), 'quiz_unavailable')) === 0);
  A('N1 ASett 不发假终态（diagnosis_unavailable 仍=0 · 同族）', (await evCount(DID('ASET'), 'diagnosis_unavailable')) === 0);
  A('N1 ASett 不重复退款（余额不变）', eq(await avail(), availBeforeReap));

  // ══ F5 + N2 · 收尾审计（micro-patch 键面逐字）═══════════════════════════════
  section('F5+N2 · 无悬挂消费 · 二次 reap 幂等 · micro-patch 键面逐 job 断言');
  const allQuizJobs = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT quiz_id, status FROM quiz_job WHERE owner_user_id=$1', [OWNER]))).rows;
  const allDiagJobs = (await asPrincipal(pool, OWNER, (c) => c.query('SELECT diagnosis_id, status FROM diagnosis_job WHERE owner_user_id=$1', [OWNER]))).rows;
  A('F5 无 stuck running/queued 残留（全部 done|failed）',
    allQuizJobs.every((j: any) => ['done', 'failed'].includes(j.status)) && allDiagJobs.every((j: any) => ['done', 'failed'].includes(j.status)));
  const rq2 = await asPrincipal(pool, OWNER, (c) => sweepStuckQuizJobs(c, OWNER));
  const rd2 = await asPrincipal(pool, OWNER, (c) => sweepStuckDiagnosisJobs(c, OWNER));
  A('F5 二次 reap 幂等 0 增量（无重复退款面）', rq2.requeued === 0 && rq2.failed === 0 && rd2.requeued === 0 && rd2.failed === 0);
  const quizFaces = await Promise.all(QUIZ_FLOWS.map(async (k) => ({ stream: QID(k), jobStatus: (await quizJob(QID(k))).status, objStatus: await quizObj(QID(k)), eventKind: 'quiz_unavailable' })));
  const diagFaces = await Promise.all(DIAG_FLOWS.map(async (k) => ({ stream: DID(k), jobStatus: (await diagJob(DID(k))).status, objStatus: await diagObj(DID(k)), eventKind: 'diagnosis_unavailable' })));
  const { failedNotReady, failedReady } = keyFace([...quizFaces, ...diagFaces]);
  A(`N2/F5 micro-patch 键面：failed 且对象非 ready 的注入面 job 恰 ${failedNotReady.length} 个（=F1/F2/F3）`,
    failedNotReady.length === 3 && failedNotReady.every((j) => ['qz16-F1-', 'dg16-F2-', 'qz16-F3-'].some((p) => j.stream.startsWith(p))));
  let faceOk = true;
  for (const j of failedNotReady) if ((await evCount(j.stream, j.eventKind)) !== 1) faceOk = false;
  A('N2 键面内逐 job 恰一条 *_unavailable 终态事件（任一缺失=死胡同=EXIT1）', faceOk);
  A('N2 键面外：alreadySettled（failed+ready）恰 2 个且全部不在断言面', failedReady.length === 2);
  let exclOk = true;
  for (const j of failedReady) if ((await evCount(j.stream, j.eventKind)) !== 0) exclOk = false;   // N1 负向面：故意无终态事件
  A('键面外负向断言：alreadySettled 对象 0 条假终态事件（N1 兜底 · Ban 藉键面把倒退合法化——N3 已单独断言仍守）', exclOk);
  A('N3 全程 ready 对照组零倒退（PC/F4/ASett 六对象全部仍 ready）',
    (await quizObj(QID('PC'))) === 'ready' && (await quizObj(QID('F4'))) === 'ready' && (await quizObj(QID('ASET'))) === 'ready'
    && (await diagObj(DID('PC'))) === 'ready' && (await diagObj(DID('F4'))) === 'ready' && (await diagObj(DID('ASET'))) === 'ready');

  // ══ N1 · 全 run 额度对账（spec A3）══════════════════════════════════════════
  section('N1 · 全 run 额度对账：失败流净 0 · 结算流恰 6×1.0');
  A(`N1 全 run avail === bucket ${BUCKET_TOTAL.toFixed(2)} − 结算 6×1.0 = ${EXPECTED_FINAL_AVAIL.toFixed(2)}（失败流全部净 0 · 无双重退款）`, eq(await avail(), EXPECTED_FINAL_AVAIL));
  const settledCount = Number((await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND status='confirmed'", [OWNER]))).rows[0].n);
  const releasedCount = Number((await asPrincipal(pool, OWNER, (c) => c.query("SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1 AND status='released'", [OWNER]))).rows[0].n);
  A(`N1 消费台账：confirmed=${settledCount}（恰 6）· released=${releasedCount}（恰 3 失败流 · 各恰一次释放）`, settledCount === 6 && releasedCount === 3);

  // ══ F6 · 收据（.tmp · implementer pre-commit runs · not evidence of record）═══
  section('F6 · 收据落盘');
  const receipt = {
    caseId: 'NHP-016-FAULT-01',
    gapId: 'GAP-UC016-FAULT-01',
    row: 'UC-E2E-016/029 · FAULT 分面（§1.0.1 :121 · NHP 矩阵 :82 · gap→case-only）',
    microPatchKeyFace: '95b1fd95：N2/F5 = failed 且对象非 ready 的注入面 job 恰一条 *_unavailable；alreadySettled（failed+ready）不在断言面，由 N1 负向（不重复退·不发假终态）+ N3（ready 不倒退）兜底',
    frozenParams: {
      bucket: { kind: 'paid', total: BUCKET_TOTAL, ttlDays: BUCKET_TTL_DAYS },
      unitsPerFlow: UNITS_PER_FLOW,
      quizFlows: QUIZ_FLOWS, diagnosisFlows: DIAG_FLOWS,
      settledFlows: SETTLED_FLOWS, expectedFinalAvail: EXPECTED_FINAL_AVAIL,
      maxQuizJobAttempts: MAX_QUIZ_JOB_ATTEMPTS, maxDiagnosisJobAttempts: MAX_DIAGNOSIS_JOB_ATTEMPTS,
      owner: OWNER, seed: { resumeIngestPath: 'createResumeWithBlob→transitionResume→completeIngestion+ingestResume（真产品路径）', objectRowsAndBucketProvision: 'fixture（quiz.proof:44-45 先例）', orphanFixture: 'job 行 status/lease/attempts 时移（reaper.proof:35-40 先例）' },
    },
    scriptedSeams: {   // C-HA-5/C-RR-2：每 case 脚本行为冻结
      PC: { service: 'resume-quiz.generate + resume-diagnosis.generate', behavior: 'ok:true 合法 raw（2 接地题 / 4 维接地诊断）' },
      F1: { service: 'resume-quiz.generate', behavior: 'throw new Error(nhp16_injected_model_outage)' },
      F2: { service: 'resume-diagnosis.generate', behavior: 'throw new Error(nhp16_injected_diagnosis_outage)' },
      F3: { service: 'resume-quiz.generate', behavior: 'ok:true + raw {items:"nhp16-schema-injection-not-an-array"}（schema 外形非法）' },
      F4: { service: 'resume-quiz.generate + resume-diagnosis.generate', behavior: 'ok:true 合法 raw（新实例）' },
      ASett: { service: 'resume-quiz.generate + resume-diagnosis.generate', behavior: 'ok:true 合法 raw（真 drain 至 ready+结算）' },
    },
    zeroLive: { scriptedSeamOnly: true, providerOutboundCalls: 0, envModelApiKeyUnset: process.env.MODEL_API_KEY === undefined, missingKeyFailClosed: 'model-client.ts:364 known_not_executed（双保险）' },
    classification,   // C-RR-3：按实际行为落 receipt
    disclosure: {
      D1: 'F4=重建新实例映射（controller 无 failed→pending 重启口）· Ban 宣称字面口已验 · 旧对象终态稳定断言已行使',
      D2: '断言键=产品真表真事件（resume_quiz/quiz_job/interview_event·resume_diagnosis/diagnosis_job）· spec AssessmentReport/AiGraphRun 为需求语映射',
      D3: '零模型质量/召回/安全断言（质量归 ai-eval · 禁 fake-model 冒充质量闭环）',
      D4: 'UC-029 0 题 BOUND 面（partial）本刀不碰',
    },
    nonClaims: 'EXIT0 ≠ covered ≠ suite green ≠ 行升格 ≠ PERF/LOAD/容量/SLO/HA ≠ 模型质量闭环 · releaseEvidence=false · Not HA · coveredCount=8',
    finishedAt: '',
    overall: 'PASS',
    failedAsserts: 0,
  };
  try {
    mkdirSync(RECEIPT_DIR, { recursive: true });
    const attemptNo = readdirSync(RECEIPT_DIR).filter((f) => f.endsWith('.json') && f.includes('nhp-fault')).length + 1;
    receipt.finishedAt = new Date().toISOString();
    receipt.overall = fail === 0 ? 'PASS' : 'FAIL';
    receipt.failedAsserts = fail;
    const receiptPath = join(RECEIPT_DIR, `uc016-nhp-fault-attempt${String(attemptNo).padStart(3, '0')}.json`);
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 1));
    console.log(`RECEIPT_WRITTEN ${receiptPath} · implementer pre-commit run · not evidence of record`);
  } catch (e) {
    console.error(`RECEIPT_WRITE_FAILED ${(e as Error)?.message ?? e}`);
    fail++; // 收据缺失 = 契约不完整（F6），不得静默绿
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-016/029 NHP-016-FAULT-01 PC+F1–F6+N1–N4 asserts passed · EXIT0 ≠ covered ≠ suite green ≠ 行升格 · coveredCount=8'
    : `✗ ${fail} UC-E2E-016/029 NHP-016-FAULT-01 asserts failed → EXIT1 诚实保留（缺陷登记 backlog · 修复另刀 · Ban 借刀改 consumer/lifecycle/ai-runtime）`}`);
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', (e as Error)?.message ?? e); process.exit(1); });
