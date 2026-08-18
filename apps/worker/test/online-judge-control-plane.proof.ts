/**
 * Real PostgreSQL proof for the online-Judge control plane.  It never sends a
 * model request: packets are opaque HMAC references, and the assertions prove
 * the durable selection/lease/privacy boundary rather than an imaginary LLM
 * quality result.
 */
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  asOnlineJudgeExecutor, asOnlineJudgeScheduler, asPrincipal, assertIsolatedTestTarget, createPool,
  loadMigrations, provisionOnlineJudgeExecutorLogin, provisionOnlineJudgeSchedulerLogin,
  provisionRuntimeLogin, runMigrations,
} from '@meetwise/db';
import type { Client } from '@meetwise/db';

const admin = createPool();
const schedulerRole = `judge_scheduler_${process.pid}`;
const executorRole = `judge_executor_${process.pid}`;
const runtimeRole = `judge_runtime_${process.pid}`;
const schedulerPassword = 'online-judge-scheduler-proof-password-2026';
const executorPassword = 'online-judge-executor-proof-password-2026';
const runtimePassword = 'online-judge-runtime-proof-password-2026';
const utcDay = new Date().toISOString().slice(0, 10);
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
const hash = (value: string) => createHash('sha256').update(value, 'utf8').digest('hex');
const rank = (value: string) => createHmac('sha256', 'online-judge-proof-sampling-secret').update(value, 'utf8').digest('hex');

interface Registered { candidateId: string; replayed: boolean; eligibility: string; selection: string; lotId: string; lotSlot: number; }

async function createPolicy(policyVersion: string, dailyBudget = 1000, monthlyBudget = 10_000) {
  await admin.query(
    `INSERT INTO online_judge_policy(
       policy_version,status,rubric_version,model_version,packet_schema_version,sampling_key_version,max_dispatches_per_day,max_dispatches_per_month
     ) VALUES ($1,'triage_only','rubric-v1','judge-v1','packet-v1','sampling-v1',$2,$3)`,
    [policyVersion, dailyBudget, monthlyBudget],
  );
}

async function register(
  c: Client, policyVersion: string, attempt: string, options: Partial<{
    subject: string; feature: string; language: string; modality: string; risk: string; sourcePolicy: string; rankValue: string;
  }> = {},
): Promise<Registered> {
  const sourceAttempt = hash(`attempt:${policyVersion}:${attempt}`);
  const result = await c.query(
    `SELECT * FROM online_judge_register_candidate(
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::date,$13
    )`,
    [
      policyVersion, sourceAttempt, hash(`subject:${options.subject ?? attempt}`), hash(`packet:${attempt}`), hash(`redaction:${attempt}`),
      options.sourcePolicy ?? 'synthetic', hash(`license:${attempt}`), options.feature ?? 'agent', options.language ?? 'mixed',
      options.modality ?? 'text', options.risk ?? 'normal', utcDay, rank(options.rankValue ?? attempt),
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('online_judge_register_no_row');
  return {
    candidateId: String(row.candidate_id), replayed: row.replayed === true,
    eligibility: String(row.eligibility_state), selection: String(row.selection_state),
    lotId: String(row.lot_id), lotSlot: Number(row.lot_slot),
  };
}

async function count(sql: string, values: unknown[] = []): Promise<number> {
  const result = await admin.query(sql, values);
  return Number(result.rows[0]?.n ?? 0);
}

async function main() {
  await assertIsolatedTestTarget(admin);
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionOnlineJudgeSchedulerLogin(admin, { roleName: schedulerRole, password: schedulerPassword });
  await provisionOnlineJudgeExecutorLogin(admin, { roleName: executorRole, password: executorPassword });
  await provisionRuntimeLogin(admin, { roleName: runtimeRole, password: runtimePassword });
  const scheduler = createPool({ user: schedulerRole, password: schedulerPassword, max: 32 });
  const executor = createPool({ user: executorRole, password: executorPassword, max: 24 });
  const runtime = createPool({ user: runtimeRole, password: runtimePassword, max: 4 });
  const businessOwner = `online-judge-business-${process.pid}`;
  const businessInterview = `online-judge-interview-${process.pid}`;
  try {
    await admin.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [businessInterview, businessOwner]);
    const businessBefore = await admin.query(
      `SELECT
         (SELECT count(*)::int FROM interview) AS interviews,
         (SELECT count(*)::int FROM consumption_record) AS consumptions,
         (SELECT count(*)::int FROM job_application) AS applications,
         (SELECT count(*)::int FROM interview_event) AS events`,
    );

    const unknownPolicy = `judge-unknown-${process.pid}`;
    await createPolicy(unknownPolicy, 1000);
    const unknownRows = await Promise.all(Array.from({ length: 10 }, (_, index) =>
      asOnlineJudgeScheduler(scheduler, (c) => register(c, unknownPolicy, `unknown-${index}`, { subject: `unknown-${index}` })),
    ));
    A('一个完整 lot 恰好产生 1 个 selected，其他 9 个固定为 lot_closed_unsampled',
      unknownRows.length === 10
      && await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='selected'", [unknownPolicy]) === 1
      && await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='lot_closed_unsampled'", [unknownPolicy]) === 9
      && await count('SELECT count(*)::int AS n FROM online_judge_dispatch d JOIN online_judge_candidate c ON c.id=d.candidate_id WHERE c.policy_version=$1', [unknownPolicy]) === 1);
    const claim = await asOnlineJudgeExecutor(executor, (c) => c.query('SELECT * FROM online_judge_claim_next_dispatch($1,$2)', [`worker-${process.pid}`, 60]));
    const claimed = claim.rows[0];
    const dispatchId = String(claimed?.dispatch_id ?? '');
    const leaseToken = String(claimed?.lease_token ?? '');
    A('独立 executor 只得到不透明 packet HMAC，不能得到用户正文或直接表读权限',
      /^[a-f0-9]{64}$/.test(String(claimed?.packet_ref_hmac ?? ''))
      && !Object.keys(claimed ?? {}).some((key) => /owner|thread|answer|resume|prompt|audio/i.test(key))
      && await rejects(() => asOnlineJudgeExecutor(executor, (c) => c.query('SELECT * FROM online_judge_candidate'))));
    A('错误 lease token 不能跨过 dispatching 边界', !(await asOnlineJudgeExecutor(executor, async (c) => {
      const r = await c.query('SELECT online_judge_mark_dispatching($1,$2) AS ok', [dispatchId, randomUUID()]);
      return r.rows[0]?.ok === true;
    })));
    const marked = await asOnlineJudgeExecutor(executor, async (c) => {
      const r = await c.query('SELECT online_judge_mark_dispatching($1,$2) AS ok', [dispatchId, leaseToken]);
      return r.rows[0]?.ok === true;
    });
    const unknowned = await asOnlineJudgeExecutor(executor, async (c) => {
      const r = await c.query(
        "SELECT online_judge_complete_dispatch($1,$2,'unknown','network_timeout',NULL,NULL) AS ok", [dispatchId, leaseToken],
      );
      return r.rows[0]?.ok === true;
    });
    A('dispatching→unknown 是有界终态；未知外部结果不可自动重发', marked && unknowned
      && await count("SELECT count(*)::int AS n FROM online_judge_dispatch WHERE id=$1 AND status='unknown'", [dispatchId]) === 1
      && await count("SELECT count(*)::int AS n FROM online_judge_dispatch WHERE id=$1 AND status IN ('queued','claimed')", [dispatchId]) === 0
      && await rejects(() => asOnlineJudgeExecutor(executor, (c) => c.query(
        "SELECT online_judge_complete_dispatch($1,$2,'judged','forged_without_receipt',50,NULL)", [dispatchId, leaseToken],
      ))));
    A('Judge policy 是不可变发布制品；修改预算/模型必须创建新版本而非原地更新',
      await rejects(() => admin.query('UPDATE online_judge_policy SET max_dispatches_per_day=999 WHERE policy_version=$1', [unknownPolicy])));

    const replayPolicy = `judge-replay-${process.pid}`;
    await createPolicy(replayPolicy, 1000);
    const replays = await Promise.all(Array.from({ length: 100 }, () => asOnlineJudgeScheduler(scheduler, (c) =>
      register(c, replayPolicy, 'same-attempt', { subject: 'same-subject' }))));
    A('100 次同 attempt + policy 并发重放只占用 1 个 candidate 和 1 个 lot slot',
      new Set(replays.map((row) => row.candidateId)).size === 1
      && await count('SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1', [replayPolicy]) === 1
      && await count('SELECT count(*)::int AS n FROM online_judge_lot WHERE policy_version=$1 AND eligible_count=1', [replayPolicy]) === 1);

    const closePolicy = `judge-close-${process.pid}`;
    await createPolicy(closePolicy, 1000);
    await asOnlineJudgeScheduler(scheduler, async (c) => {
      for (let index = 0; index < 9; index++) await register(c, closePolicy, `seed-${index}`, { subject: `seed-subject-${index}` });
    });
    const closers = await Promise.all(Array.from({ length: 20 }, () => asOnlineJudgeScheduler(scheduler, (c) =>
      register(c, closePolicy, 'concurrent-tenth', { subject: 'concurrent-tenth-subject' }))));
    A('20 个并发关闭者只关闭一次 lot，精确选择 1 条且不会产生第二个 slot',
      new Set(closers.map((row) => row.candidateId)).size === 1
      && await count('SELECT count(*)::int AS n FROM online_judge_lot WHERE policy_version=$1 AND closed_at IS NOT NULL', [closePolicy]) === 1
      && await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='selected'", [closePolicy]) === 1
      && await count('SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1', [closePolicy]) === 10);

    const prefixPolicy = `judge-prefix-${process.pid}`;
    await createPolicy(prefixPolicy, 1000);
    await asOnlineJudgeScheduler(scheduler, async (c) => {
      for (let index = 1; index <= 137; index++) await register(c, prefixPolicy, `prefix-${index}`, { subject: `prefix-subject-${index}` });
    });
    const prefixCounts = await admin.query(
      `SELECT lot_slot,lot_id FROM online_judge_candidate WHERE policy_version=$1 ORDER BY created_at,id`, [prefixPolicy],
    );
    const selected = await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='selected'", [prefixPolicy]);
    A('137 条同分层候选精确关闭 13 个 lot；任意完整前缀的 selected=13≤floor(137/10)',
      prefixCounts.rowCount === 137 && selected === 13
      && await count('SELECT count(*)::int AS n FROM online_judge_lot WHERE policy_version=$1 AND closed_at IS NOT NULL', [prefixPolicy]) === 13);

    const rarePolicy = `judge-rare-${process.pid}`;
    await createPolicy(rarePolicy, 1000);
    await asOnlineJudgeScheduler(scheduler, async (c) => {
      for (let index = 0; index < 9; index++) await register(c, rarePolicy, `rare-${index}`, { subject: `rare-${index}`, risk: 'anaphora' });
    });
    A('稀有分层不足 10 条时，online selected 和 dispatch 都为 0',
      await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='selected'", [rarePolicy]) === 0
      && await count('SELECT count(*)::int AS n FROM online_judge_dispatch d JOIN online_judge_candidate c ON c.id=d.candidate_id WHERE c.policy_version=$1', [rarePolicy]) === 0);

    const budgetPolicy = `judge-budget-${process.pid}`;
    await createPolicy(budgetPolicy, 0);
    await asOnlineJudgeScheduler(scheduler, async (c) => {
      for (let index = 0; index < 10; index++) await register(c, budgetPolicy, `budget-${index}`, { subject: `budget-${index}` });
    });
    A('预算为 0 时最低 rank 固定为 skipped_budget，不改选第二名且 dispatch=0',
      await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='skipped_budget'", [budgetPolicy]) === 1
      && await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='selected'", [budgetPolicy]) === 0
      && await count('SELECT count(*)::int AS n FROM online_judge_dispatch d JOIN online_judge_candidate c ON c.id=d.candidate_id WHERE c.policy_version=$1', [budgetPolicy]) === 0);

    const monthlyBudgetPolicy = `judge-monthly-budget-${process.pid}`;
    await createPolicy(monthlyBudgetPolicy, 1000, 0);
    await asOnlineJudgeScheduler(scheduler, async (c) => {
      for (let index = 0; index < 10; index++) await register(c, monthlyBudgetPolicy, `monthly-budget-${index}`, { subject: `monthly-budget-${index}` });
    });
    A('月度预算为 0 同样固定为 skipped_budget，且月预算账本不产生负数或 dispatch',
      await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='skipped_budget'", [monthlyBudgetPolicy]) === 1
      && await count('SELECT count(*)::int AS n FROM online_judge_budget_monthly WHERE policy_version=$1 AND reserved_count<0', [monthlyBudgetPolicy]) === 0
      && await count('SELECT count(*)::int AS n FROM online_judge_dispatch d JOIN online_judge_candidate c ON c.id=d.candidate_id WHERE c.policy_version=$1', [monthlyBudgetPolicy]) === 0);

    const privacyPolicy = `judge-privacy-${process.pid}`;
    await createPolicy(privacyPolicy, 1000);
    A('没有独立 consent + packet 服务时，任何 consented_deidentified 自动候选均 fail-closed 且不会占用 slot',
      await rejects(() => asOnlineJudgeScheduler(scheduler, (c) => register(c, privacyPolicy, 'real-user-like', { sourcePolicy: 'consented_deidentified' })))
      && await count('SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1', [privacyPolicy]) === 0);
    const revocable = await asOnlineJudgeScheduler(scheduler, async (c) => {
      let final: Registered | undefined;
      for (let index = 0; index < 10; index++) final = await register(c, privacyPolicy, `revoke-${index}`, { subject: `revoke-${index}` });
      return final;
    });
    const selectedPrivacyCandidate = await admin.query(
      "SELECT source_attempt_hmac FROM online_judge_candidate WHERE policy_version=$1 AND selection_state='selected'", [privacyPolicy],
    );
    const chosenHmac = String(selectedPrivacyCandidate.rows[0]?.source_attempt_hmac ?? '');
    const revoked = await asOnlineJudgeScheduler(scheduler, async (c) => {
      const r = await c.query('SELECT online_judge_revoke_candidate($1,$2) AS ok', [privacyPolicy, chosenHmac]);
      return r.rows[0]?.ok === true;
    });
    A('外送前撤回把 candidate 标为 revoked/skipped_privacy，并取消 queued dispatch', revoked
      && await count("SELECT count(*)::int AS n FROM online_judge_candidate WHERE policy_version=$1 AND source_attempt_hmac=$2 AND eligibility_state='revoked' AND selection_state='skipped_privacy'", [privacyPolicy, chosenHmac]) === 1
      && await count("SELECT count(*)::int AS n FROM online_judge_dispatch d JOIN online_judge_candidate c ON c.id=d.candidate_id WHERE c.policy_version=$1 AND d.status='cancelled'", [privacyPolicy]) === 1
      && Boolean(revocable));

    const schedulerTableReadRejected = await rejects(() => asOnlineJudgeScheduler(scheduler, (c) => c.query('SELECT * FROM online_judge_lot')));
    const executorTableReadRejected = await rejects(() => asOnlineJudgeExecutor(executor, (c) => c.query('SELECT * FROM online_judge_dispatch')));
    const runtimeFunctionRejected = await rejects(() => asPrincipal(runtime, businessOwner, (c) => c.query(
      'SELECT * FROM online_judge_register_candidate($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::date,$13)', [
        privacyPolicy, hash('blocked-attempt'), hash('blocked-subject'), hash('blocked-packet'), hash('blocked-redaction'), 'synthetic', hash('blocked-license'),
        'agent', 'mixed', 'text', 'normal', utcDay, rank('blocked'),
      ],
    )));
    A('app_role/调度器/执行器均没有控制面表权限；未授权 app_role 不可调用固定函数',
      schedulerTableReadRejected && executorTableReadRejected && runtimeFunctionRejected);
    const sensitiveColumns = await admin.query(
      `SELECT count(*)::int AS n FROM information_schema.columns
        WHERE table_schema='public' AND table_name IN ('online_judge_candidate','online_judge_dispatch','online_judge_lot')
          AND column_name ~* '(owner|thread|answer|resume|prompt|audio|recording|idempotency|content|payload)'`,
    );
    const businessAfter = await admin.query(
      `SELECT
         (SELECT count(*)::int FROM interview) AS interviews,
         (SELECT count(*)::int FROM consumption_record) AS consumptions,
         (SELECT count(*)::int FROM job_application) AS applications,
         (SELECT count(*)::int FROM interview_event) AS events`,
    );
    A('Judge 控制面无敏感正文列，且所有 selection/unknown/revoke 后业务账本、分数、权益与事件完全不变',
      Number(sensitiveColumns.rows[0]?.n) === 0
      && JSON.stringify(businessBefore.rows[0]) === JSON.stringify(businessAfter.rows[0]));
  } finally {
    await scheduler.end();
    await executor.end();
    await runtime.end();
    await admin.query(`DROP ROLE IF EXISTS ${schedulerRole}`);
    await admin.query(`DROP ROLE IF EXISTS ${executorRole}`);
    await admin.query(`DROP ROLE IF EXISTS ${runtimeRole}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ online-Judge control-plane proof passed' : `\n✗ ${failures} online-Judge control-plane checks failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });
