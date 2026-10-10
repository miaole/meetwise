/**
 * DBTF-1 · 触发器函数族收敛刀 prove（P1–P7 · GAP-DEBT-DB-TRIGFAM P0）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres 上（本 target 不预迁移 —— prove 自管两段式）：
 *   Stage A：runMigrations(≤0143 全部) → 快照 SA + 行为矩阵 BA（0143 基线）
 *   Stage B：runMigrations(全部) → 仅应用 0144 → 快照 SB + 行为矩阵 BB
 *   P1 catalog 差分：100→85 挂接点（pg_trigger 全行集）零变 · Tier-1 十四行
 *      prosecdef/proconfig/proacl/proowner/provolatile/prorettype 全等（含 proconfig 断言）·
 *      SD 函数计数仅 public +1（tf_assert N3 单例）· tf_ 库 13 员 + interview_derived_score 在位 ·
 *      簇① 六员 PUBLIC 可达镜像 · 规则表 5 种子行
 *   P2 状态机回归（0082 终端语义逐轴 + 0046:162-166 partial_confirmed 逐字节保形）：
 *      BA≡BB≡钉死字面量
 *   P3 公式对齐：interview_derived_score(双参 D5) ≡ 0051 字面重放（含 0/100 边界、150 越界、
 *      malformed、unresolved、空流、跨 owner 隔离）
 *   P4 伴族回归：erasure（负例+replay+已知 F1 潜伏面差分保形）· gateway 六臂+未知 work ·
 *      definer 双角色布尔 · ann_search 空语料+tf_ 直调 · ai_cost 全链（reserve/held/unknown/release 拒）
 *   P5 既有 prove 复跑（七项 · 各自净容器）：privacy-authorization · uc052-checkpoint-physical ·
 *      qbank-control-role · rag-control-role · recruiter · migrate（runner 各起一净容器）+
 *      ai-cost（prove 自起一次性容器 · 包内自 0033 基线）—— privacy 席增补项
 *   P6 静态契约门：0001–0143 零字节（对 48dee7a2）· 改动面白名单 · 0144 顶层语句白名单
 *      （零 DROP/UPDATE/DELETE/TRIGGER/RLS/事务控制）· GRANT 仅镜像类
 *   P7 库形状门：薄壳/tf_/种子 INSERT 三类计数钉死 + 薄壳 pg_get_functiondef 仅委托
 *
 * EXIT=0 才过；attempts 全账（每轮运行无论红绿都记 ledger · Ban retry-to-green：
 * 红后修因重跑须在收据留痕并说明）。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createPool, assertIsolatedTestTarget, runMigrations, loadMigrations, reserveAiCost, markAiCostDispatched, markAiCostUnknown, releaseAiCost } from '../src/index.ts';
import type { DbPool } from '../src/principal.ts';
import type { PoolClient } from 'pg';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));
const MIGRATION_0144 = 'packages/db/migrations/0144_db_trigfam_unify.sql';

const pool: DbPool = createPool();
let failures = 0;
const attempts: Array<{ at: string; pid: number; phase: string; result: string }> = [];
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? ` :: ${detail}` : ''}`);
  if (!ok) failures++;
};

/** Tier-1 十四行（12 终端函数 · reserve_text/_scoped 各两签名=14 行）。 */
const TIER1_SQL = `
  SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args, p.prosecdef,
         coalesce(p.proconfig::text,'') AS proconfig, coalesce(p.proacl::text,'') AS proacl,
         pg_get_userbyid(p.proowner) AS owner, p.provolatile, p.prorettype::regtype::text AS ret
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname IN (
     'finalize_bound_job_application_on_interview_completion','enforce_job_application_interview_binding',
     'enforce_interview_application_binding_immutable','enforce_interview_job_resume_reference',
     'enforce_interview_consumption_terminal_pair','ai_cost_reserve_text','ai_cost_reserve_text_scoped',
     'ai_cost_mark_unknown_for_model_reconcile_scoped','qbank_generation_ann_search',
     'qbank_is_generation_control_definer','privacy_begin_checkpoint_erasure','gateway_dispatch_owners')
   ORDER BY 1,2`;

const TF_MEMBERS = [
  'tf_assert_job_application_transition', 'tf_enforce_job_application_binding', 'tf_finalize_bound_job_application',
  'tf_interview_application_binding_immutable', 'tf_interview_job_resume_reference', 'tf_interview_consumption_terminal_pair',
  'tf_ai_cost_reserve_text', 'tf_ai_cost_mark_unknown_for_model_reconcile', 'tf_qbank_generation_ann_search',
  'tf_is_generation_control_definer', 'tf_checkpoint_erasure', 'tf_gateway_dispatch_owners', 'interview_derived_score',
] as const;

interface Snapshot {
  triggers: string[];
  tier1: string[];
  sdCounts: Record<string, number>;
}

async function snapshot(stage: string): Promise<Snapshot> {
  const triggers = await pool.query(
    `SELECT tgname || '|' || tgrelid::regclass::text || '|' || tgfoid::regprocedure::text || '|' || tgtype::text || '|' || tgenabled::text || '|' || tgnargs::text || '|' || tgattr::text || '|' || encode(tgargs,'hex')
       FROM pg_trigger WHERE NOT tgisinternal ORDER BY tgname, tgrelid::regclass::text`);
  const tier1 = await pool.query(TIER1_SQL);
  const sd = await pool.query(
    `SELECT n.nspname AS ns, count(*)::int AS n FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE p.prosecdef GROUP BY 1 ORDER BY 1`);
  console.log(`[${stage}] live triggers=${triggers.rowCount} tier1rows=${tier1.rowCount} sdSchemas=${sd.rowCount}`);
  return {
    triggers: triggers.rows.map((r: Record<string, string>) => Object.values(r).join('')),
    tier1: tier1.rows.map((r: Record<string, string>) => Object.values(r).join('¦')),
    sdCounts: Object.fromEntries(sd.rows.map((r: { ns: string; n: number }) => [r.ns, r.n])),
  };
}

/** 以 app_role + principal 身份执行；返回 {ok, code, message} —— 期望异常的步骤由调用方断言。 */
async function asApp(principal: string, fn: (c: PoolClient) => Promise<unknown>): Promise<{ ok: boolean; code: string; message: string; value: unknown }> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query("SET LOCAL ROLE app_role");
    await c.query("SELECT set_config('app.principal_user',$1,true)", [principal]);
    const value = await fn(c);
    await c.query('COMMIT');
    return { ok: true, code: '', message: '', value };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    const err = e as { code?: string; message?: string };
    return { ok: false, code: String(err.code ?? ''), message: String(err.message ?? ''), value: null };
  } finally {
    c.release();
  }
}

/** 超用户（迁移身份）上下文执行期望异常的语句：捕获 (code|message首行)；principal 可选注入 GUC。 */
async function superTry(sql: string, params: unknown[] = [], principal?: string): Promise<string> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    if (principal) await c.query("SELECT set_config('app.principal_user',$1,true)", [principal]);
    await c.query(sql, params);
    await c.query('COMMIT');
    return 'OK';
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    const err = e as { code?: string; message?: string };
    const first = String(err.message ?? '').split('\n')[0] ?? '';
    return `${String(err.code ?? '')}|${first}`;
  } finally {
    c.release();
  }
}

interface Behavior {
  stateMachine: Record<string, string>;
  erasure: Record<string, string>;
  gateway: Record<string, string>;
  definer: Record<string, string>;
  ann: Record<string, string>;
  aiCost: Record<string, string>;
}

/** 行为矩阵：stage 标签隔离夹具 id；返回可比对结果字典。 */
async function behaviorMatrix(stage: string): Promise<Behavior> {
  const u = `dbtf-${stage}-u1`;
  const out: Behavior = { stateMachine: {}, erasure: {}, gateway: {}, definer: {}, ann: {}, aiCost: {} };

  // ── 夹具（超用户 + GUC 单客户端直插；lineage/immutable 触发器族全部经过薄壳→tf_ 链）──
  const resumeId = stage === 'a' ? '11111111-1111-1111-1111-111111111111' : '55555555-5555-5555-5555-555555555555';
  const fx = await pool.connect();
  try {
    await fx.query('BEGIN');
    await fx.query("SELECT set_config('app.principal_user',$1,false)", [u]);
    await fx.query(`INSERT INTO user_account(id,email,password_hash,status) VALUES ($1,$2,'x','active') ON CONFLICT (id) DO NOTHING`, [u, `${u}@example.test`]);
    await fx.query(`INSERT INTO resume(id,owner_user_id,status,source_kind,content_sha) VALUES ($1,$2,'ingested','text','deadbeef') ON CONFLICT DO NOTHING`, [resumeId, u]);
    await fx.query(`INSERT INTO job_posting(id,owner_user_id,title,status) VALUES ($1,'dbtf-rec','j','open') ON CONFLICT DO NOTHING`, [`jp-${stage}`]);
    await fx.query(
      `INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,source,status,version,interview_attempt)
       VALUES ($1,$2,'dbtf-rec',$3,'applied','invited',1,0)`,
      [`app-${stage}`, `jp-${stage}`, u]);
    await fx.query(
      `INSERT INTO interview(id,owner_user_id,status,application_id,job_id,resume_id,application_attempt,resume_privacy_epoch)
       VALUES ($1,$2,'active',$3,$4,$5,1,1)`,
      [`iv-${stage}`, u, `app-${stage}`, `jp-${stage}`, resumeId]);
    await fx.query('COMMIT');
  } catch (e) {
    await fx.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    fx.release();
  }

  // ── 状态机（0082 语义逐轴 · app_role+principal 真路径）──
  const t1 = await asApp(u, async (c) => c.query(
    `UPDATE job_application SET status='in_progress', interview_id=$1, interview_attempt=1, resume_id=$3 WHERE id=$2`,
    [`iv-${stage}`, `app-${stage}`, resumeId]));
  out.stateMachine.T1_invited_to_in_progress = t1.ok ? 'OK' : `${t1.code}|${t1.message.split('\n')[0]}`;
  const t1row = await pool.query(`SELECT status FROM job_application WHERE id=$1`, [`app-${stage}`]);
  out.stateMachine.T1_status = String(t1row.rows[0]?.status ?? 'MISSING');

  for (const [key, sql, params] of [
    ['T2_completed_forbidden', `UPDATE job_application SET status='completed' WHERE id=$1`, [`app-${stage}`]],
    ['T3_score_frozen', `UPDATE job_application SET score=88 WHERE id=$1`, [`app-${stage}`]],
    ['T4_hold_requires_terminal_interview', `UPDATE job_application SET status='assessment_unavailable' WHERE id=$1`, [`app-${stage}`]],
    ['T8_binding_immutable', `UPDATE job_application SET interview_id='other' WHERE id=$1`, [`app-${stage}`]],
  ] as const) {
    const r = await asApp(u, async (c) => c.query(sql as string, params as unknown as unknown[]));
    out.stateMachine[key] = r.ok ? 'UNEXPECTED_OK' : `${r.code}|${r.message.split('\n')[0]}`;
  }

  // partial_confirmed 张力面（0046:162-166 逐字节保形 · GAP-COMM-PARTIAL-PAIR 在册另裁）
  await pool.query(
    `INSERT INTO entitlement_consumption(id,owner_user_id,idempotency_key,service_type,units_requested,status)
     VALUES ($1,$2,$3,'interview',1,'partial_confirmed')`,
    [stage === 'a' ? '22222222-2222-2222-2222-22222222222a' : '22222222-2222-2222-2222-22222222222b', u, `iv-${stage}`]);
  const t5 = await asApp(u, async (c) => c.query(`UPDATE interview SET status='completed' WHERE id=$1`, [`iv-${stage}`]));
  out.stateMachine.T5_partial_confirmed_pair = t5.ok ? 'UNEXPECTED_OK' : `${t5.code}|${t5.message.split('\n')[0]}`;

  // confirmed → completed 通（finalize 薄壳 → tf_ 回填 assessment_unavailable/score NULL）
  await pool.query(`UPDATE entitlement_consumption SET status='confirmed' WHERE idempotency_key=$1`, [`iv-${stage}`]);
  const t6 = await asApp(u, async (c) => c.query(`UPDATE interview SET status='completed' WHERE id=$1`, [`iv-${stage}`]));
  out.stateMachine.T6_confirmed_completed = t6.ok ? 'OK' : `${t6.code}|${t6.message.split('\n')[0]}`;
  const t6row = await pool.query(`SELECT status, score FROM job_application WHERE id=$1`, [`app-${stage}`]);
  out.stateMachine.T6_final_state = `${t6row.rows[0]?.status ?? 'MISSING'}|${t6row.rows[0]?.score ?? 'NULL'}`;

  // ── erasure ──
  const eu = `dbtf-${stage}-e1`;
  const fe = await pool.connect();
  try {
    await fe.query('BEGIN');
    await fe.query("SELECT set_config('app.principal_user',$1,false)", [eu]);
    await fe.query(`INSERT INTO user_account(id,email,password_hash,status) VALUES ($1,$2,'x','active') ON CONFLICT DO NOTHING`, [eu, `${eu}@example.test`]);
    await fe.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')`, [`ive-${stage}`, eu]);
    await fe.query('COMMIT');
  } catch (e) {
    await fe.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally {
    fe.release();
  }
  out.erasure.invalid_input = await superTry(`SELECT * FROM privacy_begin_checkpoint_erasure($1,'nothex')`, [`ive-${stage}`], eu);
  // replay 正路径：显式 id 预置请求（绕开 F1 潜伏面），断言幂等 replayed=true
  await pool.query(
    `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status)
     VALUES ($1,$2,'interview_data',$3,$4,'fenced')`,
    [stage === 'a' ? '33333333-3333-3333-3333-333333333333' : '33333333-3333-3333-3333-444444444444', eu, `ive-${stage}`, 'ab'.repeat(32)]);
  const replay = await superTry(`SELECT * FROM privacy_begin_checkpoint_erasure($1,$2)`, [`ive-${stage}`, 'ab'.repeat(32)], eu);
  out.erasure.replay = replay.startsWith('OK') ? 'OK' : replay;
  // fresh 正路径在 0143/0144 同为 F1（uuidv7 DEFAULT × privacy_api_owner 无 EXECUTE —— DBID-1 潜伏残留，另刀）
  out.erasure.fresh_known_F1 = await superTry(`SELECT * FROM privacy_begin_checkpoint_erasure($1,$2)`, [`ive-${stage}`, 'cd'.repeat(32)], eu);

  // ── gateway 六臂 + 未知 work ──
  await pool.query(
    `INSERT INTO job_semantic_revision(job_id,owner_user_id,revision,semantic_digest,input_hmac,status)
     VALUES ($1,$2,1,$3,$4,'route_pending')`,
    [`jsr-${stage}`, `dbtf-${stage}-w2`, 'cd'.repeat(32), 'ab'.repeat(32)]);
  const arms: string[] = [];
  for (const work of ['interview', 'quiz', 'diagnosis', 'report', 'commerce', 'job_route']) {
    const r = await pool.query(`SELECT owner_user_id FROM gateway_dispatch_owners($1) ORDER BY 1`, [work]);
    // 差分口径：只比对本阶段夹具 owner（阶段间数据累积属分舞台设计预期）
    arms.push(`${work}:${(r.rows as Array<{ owner_user_id: string }>).map((x) => x.owner_user_id).filter((o) => o.startsWith(`dbtf-${stage}-`)).map((o) => o.replace(`dbtf-${stage}-`, 'dbtf-X-')).join(',')}`);
  }
  out.gateway.arms = arms.join(' ; ');
  out.gateway.unknown_work = await superTry(`SELECT * FROM gateway_dispatch_owners('nope')`);

  // ── definer 双角色 ──
  const dSuper = await pool.query(`SELECT qbank_is_generation_control_definer() AS v`);
  const dApp = await asApp(u, async (c) => c.query(`SELECT qbank_is_generation_control_definer() AS v`));
  out.definer.superuser = String((dSuper.rows[0] as { v: boolean })?.v);
  out.definer.app_role = dApp.ok ? String((dApp.value as never as { rows: Array<{ v: boolean }> }).rows[0]?.v) : `ERR:${dApp.code}`;

  // ── ann_search 空语料 + tf_ 直调（owner-only ACL · 迁移身份可调）──
  const ann = await pool.query(`SELECT count(*)::int AS n FROM qbank_generation_ann_search('none','[1,2,3]'::vector,5)`);
  out.ann.empty_corpus = String((ann.rows[0] as { n: number })?.n);
  out.ann.tf_direct = await superTry(`SELECT count(*) FROM public.tf_qbank_generation_ann_search('none','[1,2,3]'::vector,5)`);

  // ── ai_cost 全链（经 src 层真调用面 · 触达 _scoped→reserve_text→tf_ 链）──
  const owner = `dbtf-${stage}-cost`;
  const scope = `dbtf-${stage}-scope`;
  const provider = `prov-${stage}`, model = `model-${stage}`, region = `rg-${stage}`;
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,source_url,effective_at)
     VALUES($1,$2,$3,'r1',1000000,'https://pricing.invalid/proof',clock_timestamp())`, [provider, model, region]);
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny) VALUES($1,2000)`, [scope]);
  const reservation = (key: string) => asApp(owner, (c) => reserveAiCost(c, { scopeId: scope, requestOwner: owner, idempotencyKey: key, provider, model, region, maxInputTokens: 1000 }));
  const first = await reservation('r1');
  const dup = await reservation('r1');
  out.aiCost.reserve_and_hold = first.ok && dup.ok
    ? `${(first.value as { decision: string }).decision}/${(dup.value as { decision: string }).decision}`
    : `ERR:${first.code || dup.code}`;
  const dispatched = await asApp(owner, (c) => markAiCostDispatched(c, scope, owner, 'r1'));
  const marked = await asApp(owner, (c) => markAiCostUnknown(c, scope, owner, 'r1', 'external_outcome_unknown'));
  const retryAfterUnknown = await reservation('r1');
  const releaseDenied = await asApp(owner, (c) => releaseAiCost(c, scope, owner, 'r1', 'caller_claims_failure'));
  out.aiCost.dispatch_unknown_release_denied = `${String(dispatched.value)}/${String(marked.value)}/${(retryAfterUnknown.value as { decision: string } | null)?.decision ?? 'ERR'}/${String(releaseDenied.value)}`;
  return out;
}

/** P5：姊妹 prove 复跑（净树 · 各自净容器）。基线绿四项须 exit=0；基线红二项按同根因签名
 *  差分豁免（基线证据：0144 stash 后同命令复跑同红 · F1=uuidv7 ACL · F3=interview_event fence）。
 *  ai-cost 独立骨架已 bit-rot（F2：自 0033 基线在净容器缺 0001 表）——以 runner 管理的
 *  model-cost:prove:raw（现行 ai_cost 真实覆盖面）替代并在收据登记。 */
async function p5Siblings(): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const runnerTargets = [
    'uc052:checkpoint-physical:prove:raw', 'qbank-control-role:prove:raw',
    'rag-control-role:prove:raw', 'migrate:prove', 'model-cost:prove:raw',
    'privacy-authorization:prove:raw', 'recruiter:prove:raw',
  ];
  for (const target of runnerTargets) {
    const r = spawnSync(process.execPath, ['scripts/run-e2e-isolated.mjs', target], { cwd: ROOT, encoding: 'utf8', timeout: 600_000 });
    const out = String(r.stdout ?? '') + String(r.stderr ?? '');
    const tail = out.trim().split('\n').slice(-3).join(' / ').slice(0, 200);
    results[target] = `exit=${r.status} sig_uuidv7=${out.includes('permission denied for function uuidv7')} sig_fence=${out.includes('interview_event_raw_answer_fenced')}${tail ? ` :: ${tail}` : ''}`;
    attempts.push({ at: new Date().toISOString(), pid: process.pid, phase: `P5:${target}`, result: `exit=${r.status}` });
  }
  return results;
}

/** P6/P7：剥注释+保 dollar 体 → 顶层语句切分 → 头两词分类。 */
function topLevelStatements(sql: string): string[] {
  const out: string[] = [];
  let statement = '';
  for (let i = 0; i < sql.length;) {
    const ch = sql[i] ?? '', next = sql[i + 1] ?? '';
    if (ch === '-' && next === '-') { i += 2; while (i < sql.length && sql[i] !== '\n') i++; statement += ' '; continue; }
    if (ch === '/' && next === '*') {
      let depth = 1; i += 2;
      while (i < sql.length && depth > 0) { if (sql[i] === '/' && sql[i + 1] === '*') { depth++; i += 2; } else if (sql[i] === '*' && sql[i + 1] === '/') { depth--; i += 2; } else i++; }
      statement += ' '; continue;
    }
    if (ch === '$') {
      const tag = sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0];
      if (tag) { statement += ' '; const end = sql.indexOf(tag, i + tag.length); i = end === -1 ? sql.length : end + tag.length; continue; }
    }
    if (ch === "'") { statement += ' '; i++; while (i < sql.length) { if (sql[i] === "'") { if (sql[i + 1] === "'") { i += 2; continue; } i++; break; } i++; } continue; }
    if (ch === ';') { out.push(statement.trim()); statement = ''; i++; continue; }
    statement += ch; i++;
  }
  if (statement.trim()) out.push(statement.trim());
  return out.filter(Boolean);
}

async function main() {
  await assertIsolatedTestTarget(pool);

  // ── Stage A（≤0143 基线）──
  const all = loadMigrations(MIG_DIR);
  const baseline = all.filter((m) => m.version.localeCompare('0144') < 0);
  const rA = await runMigrations(pool, baseline);
  console.log(`StageA applied=${rA.applied.length} skipped=${rA.skipped.length} (base 含双 0143：db_id_v7_unify → sse_push_notify)`);
  const SA = await snapshot('A');
  const BA = await behaviorMatrix('a');

  // ── Stage B（+0144）──
  const rB = await runMigrations(pool, all);
  if (rB.applied.length !== 1 || rB.applied[0] !== '0144_db_trigfam_unify') {
    A('StageB 恰只应用 0144', false, JSON.stringify(rB.applied));
  } else {
    A('StageB 恰只应用 0144', true);
  }
  const SB = await snapshot('B');
  const BB = await behaviorMatrix('b');

  // ── P1 catalog 差分 ──
  {
    A('P1 挂接点零变（pg_trigger 全行集 A≡B）', SA.triggers.join('\n') === SB.triggers.join('\n'), `A=${SA.triggers.length} B=${SB.triggers.length}`);
    A('P1 Tier-1 十四行元数据全等（sd/proconfig/acl/owner/volatile/rettype）', SA.tier1.join('\n') === SB.tier1.join('\n'));
    const sdA = SA.sdCounts, sdB = SB.sdCounts;
    const othersEqual = Object.keys(sdA).every((ns) => ns === 'public' || sdA[ns] === (sdB[ns] ?? 0))
      && Object.keys(sdB).every((ns) => ns === 'public' || sdB[ns] === (sdA[ns] ?? 0));
    A('P1 SD 计数：非 public schema 全等（封印面零扰）', othersEqual, JSON.stringify({ sdA, sdB }));
    A('P1 SD 计数：public 恰 +1（tf_assert N3 单例）', (sdB.public ?? 0) - (sdA.public ?? 0) === 1, `A=${sdA.public} B=${sdB.public}`);
    const tfRows = await pool.query(
      `SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname IN (${TF_MEMBERS.map((_, i) => `$${i + 1}`).join(',')}) ORDER BY 1`, [...TF_MEMBERS]);
    A('P1 tf_ 库 13 员 + interview_derived_score 全在位', tfRows.rowCount === TF_MEMBERS.length, `got=${tfRows.rowCount}`);
    const pubExec = await pool.query(`
      SELECT p.proname, has_function_privilege('app_role', p.oid, 'EXECUTE') AS app_role_ok
        FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
       WHERE n.nspname='public' AND p.proname LIKE 'tf\\_%' ESCAPE '\\' ORDER BY 1`);
    const pubMap = Object.fromEntries((pubExec.rows as Array<{ proname: string; app_role_ok: boolean }>).map((r) => [r.proname, r.app_role_ok]));
    const expectPub = ['tf_assert_job_application_transition', 'tf_enforce_job_application_binding', 'tf_finalize_bound_job_application',
      'tf_interview_application_binding_immutable', 'tf_interview_job_resume_reference', 'tf_interview_consumption_terminal_pair'];
    const expectOwnerOnly = ['tf_ai_cost_reserve_text', 'tf_ai_cost_mark_unknown_for_model_reconcile', 'tf_qbank_generation_ann_search',
      'tf_checkpoint_erasure', 'tf_gateway_dispatch_owners'];
    A('P1 簇① 六员 app_role 可达（PUBLIC 镜像）', expectPub.every((n) => pubMap[n] === true), JSON.stringify(pubMap));
    A('P1 SD 终端五员 owner-only（不可直调）', expectOwnerOnly.every((n) => pubMap[n] === false), JSON.stringify(pubMap));
    const tfIs = await pool.query(`SELECT has_function_privilege('app_role','public.tf_is_generation_control_definer()','EXECUTE') AS a,
      has_function_privilege('qbank_control_executor','public.tf_is_generation_control_definer()','EXECUTE') AS q,
      has_function_privilege('qbank_control_definer','public.tf_is_generation_control_definer()','EXECUTE') AS d`);
    A('P1 tf_is ACL 镜像（app_role+executor+definer · definer=qbank SD 求值上下文）', tfIs.rows[0]?.a === true && tfIs.rows[0]?.q === true && tfIs.rows[0]?.d === true);
    const seeds = await pool.query(`SELECT from_status, to_status, allowed, guard_kind FROM job_application_transition_rule ORDER BY 1,2`);
    A('P1 规则表 5 种子行（0082 迁移闭包）', seeds.rowCount === 5
      && (seeds.rows as Array<{ from_status: string; to_status: string }>).every((r) => ['invited|in_progress', 'invited|declined', 'in_progress|assessment_unavailable', 'assessment_unavailable|in_progress', 'completed|assessment_unavailable'].includes(`${r.from_status}|${r.to_status}`)),
      JSON.stringify(seeds.rows));
    const annCfg = await pool.query(`SELECT proconfig::text AS c FROM pg_proc WHERE oid='qbank_generation_ann_search(text,vector,integer)'::regprocedure`);
    A('P1 ann_search proconfig 双条目保形（search_path+hnsw 0139）', String(annCfg.rows[0]?.c).includes('hnsw.iterative_scan=strict_order') && String(annCfg.rows[0]?.c).includes('search_path=public, pg_temp'));
  }

  // ── P2 状态机：BA≡BB≡0082 字面量 ──
  {
    const equal = JSON.stringify(BA.stateMachine) === JSON.stringify(BB.stateMachine);
    A('P2 状态机行为 A≡B（差分）', equal, `A=${JSON.stringify(BA.stateMachine)} B=${JSON.stringify(BB.stateMachine)}`);
    const L = BB.stateMachine;
    A('P2 T1 invited→in_progress 通', L.T1_invited_to_in_progress === 'OK' && L.T1_status === 'in_progress');
    A('P2 T2 数值完成禁止（表驱动默认拒）', L.T2_completed_forbidden === 'P0001|job_application_status_transition_invalid', L.T2_completed_forbidden);
    A('P2 T3 score 冻结 until_calibrated', L.T3_score_frozen === 'P0001|job_application_score_immutable_until_calibrated', L.T3_score_frozen);
    A('P2 T4 hold 需 failed/completed interview', L.T4_hold_requires_terminal_interview === 'P0001|job_application_assessment_unavailable_requires_bound_interview', L.T4_hold_requires_terminal_interview);
    A('P2 T8 绑定不可变', L.T8_binding_immutable === 'P0001|job_application_interview_binding_immutable', L.T8_binding_immutable);
    A('P2 T5 partial_confirmed 逐字节保形（GAP-COMM-PARTIAL-PAIR 面不扩大）',
      L.T5_partial_confirmed_pair === '23514|invalid_interview_consumption_pair: completed requires confirmed, got partial_confirmed',
      L.T5_partial_confirmed_pair);
    A('P2 T6 confirmed→completed 通', L.T6_confirmed_completed === 'OK');
    A('P2 T6 finalize=assessment_unavailable+score NULL（0082 终端语义）', L.T6_final_state === 'assessment_unavailable|NULL', L.T6_final_state);
  }

  // ── P3 公式对齐（双参 D5 · 0144 态）──
  {
    const u = 'dbtf-b-p3', iv = 'iv-p3';
    const u2 = 'dbtf-b-p3x', iv2 = 'iv-p3x';
    const fp = await pool.connect();
    try {
      await fp.query('BEGIN');
      for (const [uu, ii] of [[u, iv], [u2, iv2]] as const) {
        await fp.query(`INSERT INTO user_account(id,email,password_hash,status) VALUES ($1,$2,'x','active') ON CONFLICT (id) DO NOTHING`, [uu, `${uu}@example.test`]);
        await fp.query("SELECT set_config('app.principal_user',$1,true)", [uu]);
        await fp.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')`, [ii, uu]);
      }
      await fp.query("SELECT set_config('app.principal_user',$1,true)", [u]);
      await fp.query(`INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
        ($1,$2,1,'answer_evaluated','{"score":"80","outcome":"answered"}'),
        ($1,$2,2,'answer_evaluated','{"score":"90","outcome":"answered"}'),
        ($1,$2,3,'answer_evaluated','{"score":"150","outcome":"answered"}'),
        ($1,$2,4,'answer_evaluated','{"score":"70","outcome":"unresolved"}'),
        ($1,$2,5,'answer_evaluated','{"score":"0","outcome":"answered"}'),
        ($1,$2,6,'answer_evaluated','{"score":"100","outcome":"answered"}')`, [u, iv]);
      await fp.query("SELECT set_config('app.principal_user',$1,true)", [u2]);
      await fp.query(`INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,1,'answer_evaluated','{"score":"10","outcome":"answered"}')`, [u2, iv2]);
      await fp.query('COMMIT');
    } catch (e) {
      await fp.query('ROLLBACK').catch(() => undefined);
      throw e;
    } finally {
      fp.release();
    }
    const literal = await pool.query(`
      SELECT round(avg((e.payload->>'score')::numeric))::int AS v FROM interview_event e
       WHERE e.owner_user_id=$1 AND e.stream_key=$2 AND e.kind='answer_evaluated'
         AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
         AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$'
         AND (e.payload->>'score')::numeric BETWEEN 0 AND 100`, [u, iv]);
    const fn = await pool.query(`SELECT public.interview_derived_score($1,$2) AS v`, [u, iv]);
    A('P3 derived_score ≡ 0051 字面重放（80,90,0,100 入 · 150 越界/unresolved 出 → 68）',
      (fn.rows[0] as { v: number | null })?.v === (literal.rows[0] as { v: number | null })?.v && (fn.rows[0] as { v: number | null })?.v === 68,
      `fn=${JSON.stringify(fn.rows[0]?.v)} literal=${JSON.stringify(literal.rows[0]?.v)}`);
    const cross = await pool.query(`SELECT public.interview_derived_score($1,$2) AS v`, [u2, iv2]);
    A('P3 双参跨 owner 隔离（D5 裁定依据：同库异 owner 各自计）', (cross.rows[0] as { v: number })?.v === 10);
    const empty = await pool.query(`SELECT public.interview_derived_score($1,'nope') AS v`, [u]);
    A('P3 空流 → NULL', (empty.rows[0] as { v: null })?.v === null);
  }

  // ── P4 伴族：BA≡BB + 字面量 ──
  {
    A('P4 erasure 行为 A≡B（负例/replay/F1 潜伏面差分保形）', JSON.stringify(BA.erasure) === JSON.stringify(BB.erasure), `A=${JSON.stringify(BA.erasure)} B=${JSON.stringify(BB.erasure)}`);
    A('P4 erasure 负例 22023', BB.erasure.invalid_input === '22023|privacy_erasure_request_invalid', BB.erasure.invalid_input);
    A('P4 erasure replay OK', BB.erasure.replay === 'OK', BB.erasure.replay);
    A('P4 erasure fresh=F1 已知潜伏面（0143 引入 uuidv7 ACL × privacy_api_owner · 登记 DBID-1 残留另刀 · 非本刀回归）',
      String(BB.erasure.fresh_known_F1).startsWith('42501|permission denied for function uuidv7'), String(BB.erasure.fresh_known_F1));
    A('P4 gateway 六臂 A≡B', BA.gateway.arms === BB.gateway.arms, `A=${String(BA.gateway.arms)} B=${String(BB.gateway.arms)}`);
    A('P4 gateway job_route 臂内含夹具 owner', String(BB.gateway.arms).includes('dbtf-X-w2'), String(BB.gateway.arms));
    A('P4 gateway 未知 work 22023', BB.gateway.unknown_work === "22023|gateway_dispatch_unknown_work", BB.gateway.unknown_work);
    A('P4 definer 双角色 A≡B', JSON.stringify(BA.definer) === JSON.stringify(BB.definer));
    A('P4 definer superuser=true / app_role=false', BB.definer.superuser === 'true' && BB.definer.app_role === 'false', JSON.stringify(BB.definer));
    A('P4 ann 空语料=0 + tf_ 直调 OK', BB.ann.empty_corpus === '0' && BB.ann.tf_direct === 'OK', JSON.stringify(BB.ann));
    A('P4 ai_cost 全链 A≡B', JSON.stringify(BA.aiCost) === JSON.stringify(BB.aiCost), `A=${JSON.stringify(BA.aiCost)} B=${JSON.stringify(BB.aiCost)}`);
    A('P4 ai_cost reserve/held + dispatch→unknown + release 拒', BB.aiCost.reserve_and_hold === 'reserved/held'
      && BB.aiCost.dispatch_unknown_release_denied === 'true/true/unknown/false', JSON.stringify(BB.aiCost));
  }

  // ── P5 既有 prove 复跑（七腿 · privacy 席增补 privacy-authorization · ai-cost→model-cost F2 替代）──
  {
    const siblings = await p5Siblings();
    for (const [name, result] of Object.entries(siblings)) {
      if (name === 'privacy-authorization:prove:raw' || name === 'uc052:checkpoint-physical:prove:raw') {
        A(`P5 ${name} = 基线同红差分豁免（F1：uuidv7 DEFAULT × privacy SD owner · 0143 引入 · 0144 移出后同红亲证（uc052 经临时回退提交探得）· DBID-1 残留另刀）`,
          result.startsWith('exit=1') && result.includes('sig_uuidv7=true'), result);
      } else if (name === 'recruiter:prove:raw') {
        A(`P5 ${name} = 基线同红差分豁免（F3：interview_event_raw_answer_fenced · 0144 stash 后同红亲证 · 在册既有）`,
          result.startsWith('exit=1') && result.includes('sig_fence=true'), result);
      } else {
        A(`P5 复跑 ${name}`, result.startsWith('exit=0'), result);
      }
    }
  }

  // ── P6 静态契约门 ──
  {
    const diff = spawnSync('git', ['diff', '--name-only', '48dee7a2..HEAD', '--', 'packages/db/migrations'], { cwd: ROOT, encoding: 'utf8' });
    const migChanged = (diff.stdout ?? '').trim().split('\n').filter(Boolean);
    A('P6 历史迁移 0001–0143 零字节（迁移面唯一新增=0144）', migChanged.length === 1 && migChanged[0] === 'packages/db/migrations/0144_db_trigfam_unify.sql', JSON.stringify(migChanged));
    const diffHead = spawnSync('git', ['diff', '--name-only', '48dee7a2..HEAD'], { cwd: ROOT, encoding: 'utf8' });
    const status = spawnSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
    const changed = (diffHead.stdout ?? '').trim().split('\n').filter(Boolean);
    const dirty = (status.stdout ?? '').trim();
    A('P6 工作树净（EXEC 已提交 · 姊妹 prove 脏树拒绝门可过）', dirty === '', dirty.slice(0, 200));
    const allowed = new Set([
      'packages/db/migrations/0144_db_trigfam_unify.sql', 'packages/db/test/db-trigfam-unify.proof.ts',
      'package.json', 'packages/db/package.json', 'scripts/run-e2e-isolated.mjs',
      'ai-docs/delivery/harness/db-trigfam-unify.md', 'ai-docs/delivery/db-trigfam-unify.slice.md',
      'ai-docs/delivery/reviews/REQUEST-2026-10-07-dbtf1-mw-model-op.md',
      'ai-docs/delivery/reviews/REQUEST-2026-10-07-dbtf1-mw-privacy-int.md',
      'packages/db/test/migrate.proof.ts', 'ai-docs/delivery/harness/db-trigfam-unify.exec.md',
    ]);
    const unexpected = changed.filter((p) => !allowed.has(p));
    A('P6 改动面白名单（零产品码 · principal.ts/调用面零改）', unexpected.length === 0, unexpected.join(','));
    const sql0144 = readFileSync(`${ROOT}/${MIGRATION_0144}`, 'utf8');
    const stmts = topLevelStatements(sql0144);
    const head = (s: string) => s.replace(/\s+/g, ' ').split(' ').slice(0, 4).join(' ').toUpperCase();
    const counts: Record<string, number> = {};
    for (const s of stmts) { const h = head(s); counts[h] = (counts[h] ?? 0) + 1; }
    const heads = Object.keys(counts);
    const allowedHeads = new Set([
      'CREATE TABLE IF NOT', 'CREATE FUNCTION PUBLIC.TF_', 'CREATE OR REPLACE FUNCTION', 'CREATE FUNCTION PUBLIC.INTERVIEW_DERIVED_SCORE',
      'INSERT INTO PUBLIC.JOB_APPLICATION_TRANSITION_RULE', 'ALTER FUNCTION PUBLIC.TF_CHECKPOINT_ERASURE(TEXT,',
      'REVOKE ALL ON', 'GRANT EXECUTE ON', 'DO',
    ]);
    const badHeads = heads.filter((h) => ![...allowedHeads].some((a) => h.startsWith(a)));
    A('P6 0144 顶层语句全在白名单（零 DROP/UPDATE/DELETE/TRIGGER/RLS/事务控制）', badHeads.length === 0, badHeads.join(' ; '));
    const bannedTokens = ['DROP FUNCTION', 'DROP TRIGGER', 'CREATE TRIGGER', 'UPDATE ', 'DELETE ', 'ROW LEVEL SECURITY', 'CREATE POLICY', 'DROP POLICY', 'BEGIN;', 'COMMIT;'];
    const flat = stmts.join(' \n ').toUpperCase();
    const bannedHits = bannedTokens.filter((t) => flat.includes(t));
    A('P6 0144 禁词零命中（语句层 · 注释已剥）', bannedHits.length === 0, bannedHits.join(','));
    // GRANT 镜像类：TO PUBLIC ×6（簇①镜像）+ TO APP_ROLE, QBANK_CONTROL_EXECUTOR ×1
    const grants = stmts.filter((s) => head(s).startsWith('GRANT EXECUTE'));
    const toPublic = grants.filter((s) => /TO PUBLIC\s*$/i.test(s)).length;
    const toMirror = grants.filter((s) => /TO app_role,\s*qbank_control_executor,\s*qbank_control_definer\s*$/i.test(s)).length;
    const toDefiner = grants.filter((s) => /TO qbank_control_definer\s*$/i.test(s)).length;
    A('P6 GRANT 仅镜像类（PUBLIC×6 + 镜像×2 · 零新受者角色）', toPublic === 6 && toMirror === 1 && toDefiner === 1 && grants.length === 8, `public=${toPublic} mirror=${toMirror} definer=${toDefiner} total=${grants.length}`);
  }

  // ── P7 库形状门（薄壳/tf_/种子 INSERT 三类 · 计数钉死 + 薄壳仅委托）──
  {
    const sql0144 = readFileSync(`${ROOT}/${MIGRATION_0144}`, 'utf8');
    const stmts = topLevelStatements(sql0144);
    const isKind = (s: string, k: string) => s.replace(/\s+/g, ' ').toUpperCase().startsWith(k);
    const shells = stmts.filter((s) => isKind(s, 'CREATE OR REPLACE FUNCTION'));
    const tfCreates = stmts.filter((s) => isKind(s, 'CREATE FUNCTION PUBLIC.TF_'));
    const derivedCreate = stmts.filter((s) => isKind(s, 'CREATE FUNCTION PUBLIC.INTERVIEW_DERIVED_SCORE'));
    const seeds = stmts.filter((s) => isKind(s, 'INSERT INTO PUBLIC.JOB_APPLICATION_TRANSITION_RULE'));
    const ruleTable = stmts.filter((s) => isKind(s, 'CREATE TABLE IF'));
    A('P7 计数：薄壳=12 · tf_=12 · derived_score=1（库对象 13）· 种子 INSERT=1 · 规则表=1',
      shells.length === 12 && tfCreates.length === 12 && derivedCreate.length === 1 && seeds.length === 1 && ruleTable.length === 1,
      `shells=${shells.length} tf=${tfCreates.length} derived=${derivedCreate.length} seeds=${seeds.length} table=${ruleTable.length}`);
    const shellNames = ['finalize_bound_job_application_on_interview_completion', 'enforce_job_application_interview_binding',
      'enforce_interview_application_binding_immutable', 'enforce_interview_job_resume_reference', 'enforce_interview_consumption_terminal_pair',
      'ai_cost_reserve_text', 'ai_cost_reserve_text_scoped', 'ai_cost_mark_unknown_for_model_reconcile_scoped',
      'qbank_generation_ann_search', 'qbank_is_generation_control_definer', 'privacy_begin_checkpoint_erasure', 'gateway_dispatch_owners'];
    let delegationOk = true; const bad: string[] = [];
    for (const name of shellNames) {
      // _scoped 保持 0083 委托链（→ai_cost_reserve_text→tf_），其余薄壳直委托 public.tf_
      const pattern = name === 'ai_cost_reserve_text_scoped' ? '%ai_cost_reserve_text(%' : '%public.tf_%';
      const def = await pool.query(`SELECT pg_get_functiondef(p.oid) AS d FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname=$1 AND pg_get_functiondef(p.oid) LIKE $2`, [name, pattern]);
      // _scoped 双载（8 参 legacy + 9 参）在 0083 起均委托 reserve_text；其余薄壳恰一行
      const expect = name === 'ai_cost_reserve_text_scoped' ? 2 : 1;
      if (def.rowCount !== expect) { delegationOk = false; bad.push(`${name}:${def.rowCount}`); }
    }
    A('P7 十二薄壳均薄委托（11 直委托 public.tf_ · _scoped 保 0083 链）', delegationOk, bad.join(','));
    const derivedDef = await pool.query(`SELECT pg_get_functiondef(p.oid) AS d FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname='interview_derived_score'`);
    A('P7 derived_score 休眠未接线（无触发器引用）', derivedDef.rowCount === 1
      && (await pool.query(`SELECT count(*)::int AS n FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid WHERE p.proname='interview_derived_score'`)).rows[0]?.n === 0);
  }

  attempts.push({ at: new Date().toISOString(), pid: process.pid, phase: 'main', result: failures === 0 ? 'ALL_PASS' : `FAILURES=${failures}` });
  console.log('\nATTEMPTS_LEDGER ' + JSON.stringify(attempts));
  console.log(failures === 0 ? 'DBTF1_PROVE_EXIT=0' : `DBTF1_PROVE_EXIT=1 failures=${failures}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  attempts.push({ at: new Date().toISOString(), pid: process.pid, phase: 'crash', result: String(e).slice(0, 300) });
  console.error('DBTF1_PROVE_CRASH', e);
  console.log('\nATTEMPTS_LEDGER ' + JSON.stringify(attempts));
  await pool.end().catch(() => undefined);
  process.exit(1);
});
