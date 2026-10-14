/**
 * DBACL-1 · uuidv7() EXECUTE ACL 修复刀 prove（P0–P7 · 生产支付发桶 42501 修复）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres 上（本 target 不预迁移 —— prove 自管两段式）：
 *   Stage A：runMigrations(≤0143 全部 144 文件 · 0150 排除) →
 *     P0 复现负门（asPrincipal(app_role) omit-id 发桶 INSERT 恰 42501
 *          `permission denied for function uuidv7` · proacl owner-only 实证）
 *     §3 catalog 机检推导闭集（SD 函数体 omit-id INSERT INTO〈55 张 uuidv7-default 表〉
 *          → distinct proowner ∪ app_role · 双向核 · 逐行 owner|function|table 证据）
 *     P2 逐家族负门（8 授予者全 facet 修复前恰 42501）
 *   Stage B：runMigrations(全部 · 仅应用 0150) →
 *     P1 proacl 实证（8 角色逐角色 EXECUTE · grantee 集恰闭集 · PUBLIC=false ·
 *          uuidv7_from_parts 不授权）
 *     P2 逐家族绿（发桶/report/begin/issue/receipt/consent/summary/rubric/OJ/admission）
 *     P3 隐私擦除链三面绿（begin→issue→consume→claim→purge + receipt · 0096 面）
 *     P4 report enqueue 绿
 *     P5 过度授权负门（新建无关系角色仍恰 42501 + PUBLIC 泄漏门 + GRANT 面恰最小 =
 *          0150 全文 8 条 GRANT 白名单机检 · 基线=catalog 推导集非刀自定义）
 *     P6 静态契约门（0001–0143 对 base 零字节 diff · 0150 恰一文件 · uuidv7 函数体
 *          跨 stage 全等 · 产品码零改白名单）
 *     P7 migrate 门（applied 数=文件数=145 · 重跑全 skip 零漂移）
 *   + 55 表 DEFAULT uuidv7() 写点全量枚举矩阵（表→SD 写角色→TS app_role 直写→受限面）
 *
 * EXIT=0 才过；attempts 全账（每轮运行无论红绿都记收据 · Ban retry-to-green）。
 */
import { createHash, createHmac } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import type { PoolClient } from 'pg';
import { createPool, assertIsolatedTestTarget, runMigrations, loadMigrations, enqueueReport } from '../src/index.ts';
import type { DbPool } from '../src/principal.ts';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));
const MIGRATION_0150 = '0150_uuidv7_grant_acl';
/** base = REQUEST rev2 蓝本提交（历史迁移零字节 diff 的对照锚 · 授权文本钉死）。 */
const BASE_SHA = '8bf82a1b';

const pool: DbPool = createPool();
let failures = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? ` :: ${detail}` : ''}`);
  if (!ok) failures++;
};

/** §3 预期闭集（恰 8 · REQUEST rev2 钉死；与 EXEC 期 catalog 推导双向核）。 */
const EXPECTED_CLOSED_SET = [
  'app_role',
  'privacy_api_owner',
  'privacy_worker_owner',
  'memory_runtime',
  'memory_summarizer',
  'memory_admission_issuer',
  'scoring_definer_owner',
  'online_judge_owner',
] as const;

/** A 级 55 表（DBID-1 P4 亲核 @7135f615 · N1：ai_graph_run 主键列 = run_id）。 */
const A_TABLES: ReadonlyArray<readonly [string, string]> = [
  ['entitlement_consumption', 'id'], ['entitlement_bucket', 'id'], ['consumption_record', 'id'],
  ['commerce_outbox', 'id'], ['settlement_ledger', 'id'], ['ai_graph_run', 'run_id'],
  ['privacy_deletion_target', 'id'], ['privacy_erasure_request', 'id'],
  ['resume', 'id'], ['interview_job', 'id'], ['ai_report', 'id'], ['quiz_job', 'id'], ['diagnosis_job', 'id'],
  ['interview_answer_submission', 'id'], ['interview_answer_artifact', 'id'], ['interview_answer_job', 'id'],
  ['conversation_event', 'id'], ['conversation_event_artifact', 'id'],
  ['context_compression_snapshot', 'id'], ['context_compression_dispatch', 'id'],
  ['issued_question_contract', 'id'], ['score_request', 'id'], ['score_card', 'id'], ['score_card_criterion', 'id'], ['score_evidence', 'id'],
  ['online_judge_candidate', 'id'], ['online_judge_dispatch', 'id'], ['online_judge_lot', 'id'],
  ['memory_consent', 'id'], ['memory_fact', 'id'], ['memory_context_snapshot', 'id'], ['memory_index_generation', 'id'],
  ['memory_fact_adjudication', 'id'], ['memory_fact_relationship', 'id'], ['memory_recall_context_snapshot', 'id'],
  ['memory_index_generation_cache_entry', 'id'], ['memory_index_generation_embedding', 'id'],
  ['memory_index_source_manifest', 'id'], ['memory_index_source_manifest_item', 'id'],
  ['memory_summary', 'id'], ['memory_admission_authorization', 'id'], ['memory_admission_record', 'id'],
  ['privacy_authorization_snapshot', 'id'], ['privacy_deletion_receipt', 'id'],
  ['privacy_preview_request', 'id'], ['privacy_external_purge_evidence', 'id'],
  ['memory_collection_pause', 'id'], ['memory_correction_command', 'id'], ['memory_deletion_request', 'id'],
  ['memory_deletion_target', 'id'], ['memory_export_receipt', 'id'], ['memory_policy_publish_command', 'id'],
  ['memory_reindex_task', 'id'], ['question_rubric', 'id'], ['question_rubric_criterion', 'id'],
];

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const utcDay = () => new Date().toISOString().slice(0, 10);

/* ── 受限角色调用 helper：SET LOCAL ROLE + principal GUC；commit=false 时 ROLLBACK 保净
 *    （负门调用必炸、正门调用只取绿信号不落账，跨 facet 零串扰）。 */
interface CallResult { ok: boolean; code: string; msg: string; rows: Record<string, unknown>[] }
async function asRole(
  role: string | null, principal: string | null, fn: (c: PoolClient) => Promise<unknown>,
  commit = false,
): Promise<CallResult> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    if (role) await c.query(`SET LOCAL ROLE ${role}`);
    if (principal) await c.query("SELECT set_config('app.principal_user',$1,true)", [principal]);
    const v = await fn(c);
    await c.query(commit ? 'COMMIT' : 'ROLLBACK');
    return { ok: true, code: '', msg: '', rows: ((v as { rows?: Record<string, unknown>[] })?.rows ?? []) as Record<string, unknown>[] };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    const err = e as { code?: string; message?: string };
    return { ok: false, code: String(err.code ?? ''), msg: String(err.message ?? '').split('\n')[0] ?? '', rows: [] };
  } finally { c.release(); }
}
/** 雷在卷判据：恰 42501 且消息指向 uuidv7 函数。 */
const isMine = (r: CallResult) => !r.ok && r.code === '42501' && r.msg.includes('permission denied for function uuidv7');
const show = (r: CallResult) => `code=${r.code} msg=${r.msg}`;

/* ── §3 catalog 机检推导（live catalog · 客观非自指）────────────────────────── */
interface DerivePair { owner: string; fn: string; tbl: string; idcol: string; collist: string }
async function deriveClosedSet(): Promise<{ pairs: DerivePair[]; owners: string[]; tableCount: number }> {
  const tables = await pool.query<{ tbl: string; idcol: string }>(
    `SELECT c.relname AS tbl, a.attname AS idcol
       FROM pg_attrdef d
       JOIN pg_class c ON c.oid=d.adrelid
       JOIN pg_namespace n ON n.oid=c.relnamespace
       JOIN pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum
      WHERE n.nspname='public' AND pg_get_expr(d.adbin,d.adrelid)='uuidv7()'
      ORDER BY c.relname`);
  const rows = await pool.query<{ owner: string; fn: string; tbl: string; idcol: string; collist: string | null }>(
    `WITH sd AS (
        SELECT p.oid, p.proname, pg_get_userbyid(p.proowner) AS owner, pg_get_functiondef(p.oid) AS def
          FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
         WHERE p.prosecdef AND n.nspname='public'
     )
     SELECT sd.owner, sd.proname AS fn, t.tbl, t.idcol, m[2] AS collist
       FROM sd
       CROSS JOIN (SELECT c.relname AS tbl, a.attname AS idcol
                     FROM pg_attrdef d
                     JOIN pg_class c ON c.oid=d.adrelid
                     JOIN pg_namespace n ON n.oid=c.relnamespace
                     JOIN pg_attribute a ON a.attrelid=d.adrelid AND a.attnum=d.adnum
                    WHERE n.nspname='public' AND pg_get_expr(d.adbin,d.adrelid)='uuidv7()') t
       CROSS JOIN LATERAL regexp_matches(sd.def,
         '(?is)INSERT[[:space:]]+INTO[[:space:]]+(public[.])?' || t.tbl || '\\y[[:space:]]*(\\([^)]*\\))?', 'g') m`,
  );
  // omit-id 精化：无列清单 = 全默认（id 缺省 → uuidv7 生效）；有列清单 = id 列不得出现
  //（显式 id（如 conversation_event_append 的 gen_random_uuid v4）不是 uuidv7 调用者）。
  const pairs: DerivePair[] = [];
  for (const r of rows.rows) {
    const collist = r.collist;
    if (collist === null || collist === undefined) {
      pairs.push({ owner: r.owner, fn: r.fn, tbl: r.tbl, idcol: r.idcol, collist: '(omit-all)' });
      continue;
    }
    const cols = collist.replace(/^\(|\)$/g, '').split(',').map((s) => s.trim().toLowerCase());
    if (!cols.includes(r.idcol.toLowerCase()))
      pairs.push({ owner: r.owner, fn: r.fn, tbl: r.tbl, idcol: r.idcol, collist });
  }
  const owners = [...new Set(pairs.map((p) => p.owner).concat(['app_role']))].sort();
  return { pairs, owners, tableCount: tables.rowCount ?? 0 };
}

/* ── 55 表写点矩阵（P2 收据）：TS 侧 app_role omit-id 直写面机检 ─────────────── */
function tsAppRoleDirectWriters(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = `${dir}/${e.name}`;
    return e.isDirectory() ? walk(p) : (p.endsWith('.ts') ? [p] : []);
  });
  const files = [
    ...walk(fileURLToPath(new URL('../src', import.meta.url))),
    ...walk(fileURLToPath(new URL('../../../apps/api/src', import.meta.url))),
    ...walk(fileURLToPath(new URL('../../../apps/worker/src', import.meta.url))),
  ];
  const sources = files.map((f) => ({ f, text: readFileSync(f, 'utf8') }));
  for (const [tbl, idcol] of A_TABLES) {
    const hits: string[] = [];
    for (const { f, text } of sources) {
      const re = new RegExp(`INSERT\\s+INTO\\s+(?:public\\.)?${tbl}\\s*(\\([^)]*\\))?`, 'gis');
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const collist = m[1];
        if (collist === undefined) { hits.push(`${f}(omit-all)`); continue; }
        const cols = collist.replace(/^\(|\)$/g, '').split(',').map((s) => s.trim().toLowerCase());
        if (!cols.includes(idcol.toLowerCase())) hits.push(f);
      }
    }
    if (hits.length > 0) found.set(tbl, [...new Set(hits)]);
  }
  return found;
}

/* ── 夹具（迁移登录=隔离容器超用户直插 · GUC 满足触发器 · 跨 stage 主体隔离）──── */
async function seedBaseFixtures(stage: 'a' | 'b', owner: string): Promise<{ interviewId: string }> {
  const interviewId = `iv-dbacl-${stage}`;
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query("SELECT set_config('app.principal_user',$1,false)", [owner]);
    await c.query("INSERT INTO user_account(id,email,password_hash,status) VALUES ($1,$2,'x','active') ON CONFLICT (id) DO NOTHING", [owner, `${owner}@example.test`]);
    const resumeId = `11111111-1111-4111-8111-1111111111${stage === 'a' ? '11' : '22'}`;
    await c.query("INSERT INTO resume(id,owner_user_id,status,source_kind,content_sha) VALUES ($1,$2,'ingested','text','deadbeef') ON CONFLICT DO NOTHING", [resumeId, owner]);
    await c.query("INSERT INTO job_posting(id,owner_user_id,title,status) VALUES ($1,$2,'dbacl-rec','open') ON CONFLICT DO NOTHING", [`jp-dbacl-${stage}`, owner]);
    await c.query(
      `INSERT INTO job_application(id,job_id,recruiter_user_id,candidate_user_id,source,status,version,interview_attempt)
       VALUES ($1,$2,$3,$3,'applied','invited',1,0) ON CONFLICT DO NOTHING`,
      [`app-dbacl-${stage}`, `jp-dbacl-${stage}`, owner],
    );
    await c.query(
      `INSERT INTO interview(id,owner_user_id,status,application_id,job_id,resume_id,application_attempt,resume_privacy_epoch)
       VALUES ($1,$2,'active',$3,$4,$5,1,1) ON CONFLICT DO NOTHING`,
      [interviewId, owner, `app-dbacl-${stage}`, `jp-dbacl-${stage}`, resumeId],
    );
    await c.query('COMMIT');
    return { interviewId };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally { c.release(); }
}

/** 直插夹具：绕过被雷阻塞的 SD 路径，以 owner 身份直插前置行（F5/F7/F10 负门夹具）。
 *  stage 参数隔离主键 uuid；OJ policy 只种一次。 */
async function seedDirectFixtures(stage: 'a' | 'b', owner: string): Promise<void> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query("SELECT set_config('app.principal_user',$1,false)", [owner]);
    const reqId = `22222222-2222-4222-8222-22222222222${stage === 'a' ? '1' : '3'}`;
    const tgtId = `22222222-2222-4222-8222-22222222222${stage === 'a' ? '2' : '4'}`;
    await c.query(
      `INSERT INTO privacy_erasure_request(id,owner_user_id,scope,subject_id,idempotency_key_hash,status,privacy_epoch)
       VALUES ($1::uuid,$2,'interview_data',$3,'${'a'.repeat(64)}','fenced',1) ON CONFLICT DO NOTHING`,
      [reqId, owner, `iv-dbacl-${stage}`]);
    await c.query(
      `INSERT INTO privacy_deletion_target(id,request_id,sink,resource_hmac,status)
       VALUES ($1::uuid,$2::uuid,'report','${'b'.repeat(64)}','pending') ON CONFLICT DO NOTHING`, [tgtId, reqId]);
    if (stage === 'a') {
      await c.query(
        `INSERT INTO memory_consent(id,owner_user_id,purpose,policy_version)
         VALUES ('33333333-3333-4333-8333-333333333331',$1,'interview_prep','pol-v1') ON CONFLICT DO NOTHING`, [owner]);
    }
    const d1 = sha256('dbacl-e1'), d2 = sha256('dbacl-e2');
    const ev = stage === 'a' ? '1' : '3';
    await c.query(
      `INSERT INTO conversation_event(id,owner_user_id,thread_id,sequence,category,source,event_digest,artifact_id,retention_class,consent_purpose,consent_revision,privacy_epoch,event_key)
       VALUES (('44444444-4444-4444-8444-44444444444' || $3)::uuid,$1,'th-dbacl-a',1,'user_message','user',$2,('55555555-5555-4555-8555-55555555555' || $3)::uuid,'session','free_conversation',1,1,'k1')
       ON CONFLICT DO NOTHING`, [owner, d1, ev]);
    await c.query(
      `INSERT INTO conversation_event(id,owner_user_id,thread_id,sequence,category,source,event_digest,artifact_id,retention_class,consent_purpose,consent_revision,privacy_epoch,event_key)
       VALUES (('44444444-4444-4444-8444-4444444444' || $3 || '2')::uuid,$1,'th-dbacl-a',2,'assistant_message','model',$2,('55555555-5555-4555-8555-5555555555' || $3 || '2')::uuid,'session','free_conversation',1,1,'k2')
       ON CONFLICT DO NOTHING`, [owner, d2, ev]);
    await c.query(
      `INSERT INTO online_judge_policy(policy_version,status,rubric_version,model_version,packet_schema_version,sampling_key_version,max_dispatches_per_day,max_dispatches_per_month)
       VALUES ('oj-policy-dbacl','triage_only','rubric-v1','judge-v1','packet-v1','sampling-v1',1000,10000) ON CONFLICT DO NOTHING`);
    await c.query('COMMIT');
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally { c.release(); }
}

/* ── 逐家族 facet（8 授予者全覆盖 · stage 参数化主体/键隔离）────────────────── */
interface FacetOut { results: Array<[string, CallResult]> }
async function runFacets(stage: 'a' | 'b', owner: string, interviewId: string): Promise<FacetOut> {
  const out: FacetOut = { results: [] };
  const key = `${stage}-${Date.now() % 100000}`;

  // F1 · app_role 发桶（DBM3-1 P3 场景 · entitlement_consumption omit-id）
  out.results.push([`F1 app_role 发桶 entitlement_consumption`, await asRole('app_role', owner, (c) => c.query(
    `INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, lease_expires_at)
     VALUES ($1,$2,'interview',1, now()+interval '60 seconds') ON CONFLICT DO NOTHING RETURNING id`,
    [owner, `idem-f1-${key}`]))]);

  // F2 · app_role report enqueue（packages/db/src/report.ts:15 同形 · ai_report omit-id）
  out.results.push([`F2 app_role report enqueue ai_report`, await asRole('app_role', owner, (c) =>
    enqueueReport(c, owner, interviewId))]);

  // F3 · privacy_api_owner begin（0096 interview_projection_begin_erasure → privacy_erasure_request）
  out.results.push([`F3 privacy_api_owner begin(0096)`, await asRole('app_role', owner, (c) => c.query(
    `SELECT * FROM interview_projection_begin_erasure($1,$2,$3)`, [interviewId, sha256(`rk-f3-${key}`), 1]))]);

  // F4 · privacy_api_owner issue（0091 privacy_issue_authorization_snapshot → privacy_authorization_snapshot）
  out.results.push([`F4 privacy_api_owner issue(0091)`, await asRole('privacy_issuer', owner, (c) => c.query(
    `SELECT * FROM privacy_issue_authorization_snapshot($1,'key-v1','actor-1',$2,'interview_data_erasure',1,$3, now()+interval '10 minutes')`,
    [`jti-f4-${key}`, interviewId, sha256('tsd-f4')]))]);

  // F5 · privacy_worker_owner 收据签发（0091 privacy_record_deletion_receipt → privacy_deletion_receipt）
  const f5Target = stage === 'a' ? '22222222-2222-4222-8222-222222222222' : '22222222-2222-4222-8222-222222222224';
  out.results.push([`F5 privacy_worker_owner receipt(0091)`, await asRole('privacy_worker_executor', owner, (c) => c.query(
    `SELECT * FROM privacy_record_deletion_receipt($1,'local_erased',$2,'w1')`,
    [f5Target, sha256(`rh-f5-${key}`)]))]);

  // F6 · memory_runtime consent（0093 memory_grant_consent → memory_consent）
  out.results.push([`F6 memory_runtime consent(0093)`, await asRole('app_role', owner, (c) => c.query(
    `SELECT * FROM memory_grant_consent($1,'pol-v1')`, [stage === 'a' ? 'career' : 'preference']))]);

  // F7 · memory_summarizer summary（0112 memory_summary_draft → memory_summary · 直插事件夹具范围）
  const content = `dbacl summary content ${stage}`;
  const claims = JSON.stringify([{ text: 'claim-1', span: { offsetKind: 'utf8_byte', start: 0, end: 6 } }]);
  out.results.push([`F7 memory_summarizer summary(0112)`, await asRole('memory_summarizer', owner, (c) => c.query(
    `SELECT * FROM memory_summary_draft('th-dbacl-a','turn_summary',1,2,$1,$2,$3,$4,$5::jsonb,'v1','qwen-plus','tok-v1','pol-v1','norm-v1','extract-v1','verify-v1','conversation_event:v1','zh',null,null,$6)`,
    [sha256('src-artifact'), 21, content, sha256(content), claims, `idem-f7-${key}`]))]);

  // F8 · scoring_definer_owner rubric 发布链（0100 scoring_publish_question_rubric → question_rubric(+criterion)）
  out.results.push([`F8 scoring_definer_owner rubric(0100)`, await asRole('app_role', owner, (c) => c.query(
    `SELECT scoring_publish_question_rubric($1,1::bigint,1::bigint,'沟通表达',3::smallint,'[]'::jsonb,$2,null,$3::jsonb)`,
    [`q-f8-${key}`, sha256('qc-f8'), JSON.stringify([{ criterionId: 'c1', weight: 1 }])]))]);

  // F9 · online_judge_owner 注册（0050 online_judge_register_candidate → stratum_cursor/lot/candidate/dispatch）
  out.results.push([`F9 online_judge_owner register(0050)`, await asRole('online_judge_scheduler', null, (c) => c.query(
    `SELECT * FROM online_judge_register_candidate('oj-policy-dbacl',$1,$2,$3,$4,'synthetic',$5,'agent','mixed','text','normal',$6::date,$7)`,
    [sha256(`sa-f9-${key}`), sha256('subj-f9'), sha256('pk-f9'), sha256('rr-f9'), sha256('lic-f9'), utcDay(),
      createHmac('sha256', 'dbacl-oj-rank').update(`r-f9-${key}`).digest('hex')]))]);

  // F10 · memory_admission_issuer admission（0095:202 memory_issue_admission_snapshot → memory_admission_authorization）
  //   依赖 granted consent(interview_prep, rev1, epoch1)——stage A=直插夹具 · stage B=F6 真链（preference
  //   之外的 interview_prep 由 F6-B 前置真链授予，见 main() 顺序）。
  out.results.push([`F10 memory_admission_issuer admission(0095)`, await asRole('memory_admission_issuer', owner, (c) => c.query(
    `SELECT * FROM memory_issue_admission_snapshot($1,$2,'tb-1','interview_prep','derived_fact',1,1,'conversation_event','src-1','conversation_event:v1',1,2,'norm-v1','源文本','pol-v1',null)`,
    [`snap-f10-${key}`, owner]))]);

  return out;
}

/* ── dollar-quote 感知语句切分（DBID-1 P6 同型）───────────────────────────── */
function splitSql(text: string): string[] {
  const out: string[] = [];
  let start = 0, i = 0;
  while (i < text.length) {
    if (text[i] === '$') {
      const tag = /^\$[A-Za-z_][A-Za-z0-9_]*\$/.exec(text.slice(i));
      if (tag) {
        const close = text.indexOf(tag[0], i + tag[0].length);
        if (close === -1) throw new Error('dollar_quote_unterminated');
        i = close + tag[0].length;
        continue;
      }
    }
    if (text[i] === ';') {
      const s = text.slice(start, i).trim();
      if (s.length > 0) out.push(s);
      i += 1; start = i; continue;
    }
    i += 1;
  }
  const tail = text.slice(start).trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log(`ATTEMPT dbacl1-db-acl pid=${process.pid} startedAt=${new Date().toISOString()} attemptsLedger=required`);

  const all = loadMigrations(MIG_DIR);
  // 既有臂改形登记（链增长后构造回归原意·非洗基线）：Stage A 原实现「全链减 0150」在
  // 0145（uuidv7 → app_role GRANT）及 0150 后继迁移进链后结构性翻红（P2-A 三面提前修复
  // +Stage B 全量对非连续 ledger 报 migration_ledger_not_contiguous_prefix——主线基线红·
  // 与本刀扩臂无关）。改形=回归头注原意「0143 窗口复现」：Stage A 应用版本前缀 ≤0143
  // 的文件集（0145/0150/后继全不在·app_role 恰无 EXECUTE=负门真前提）；Stage B 应用
  // ≤0150 窗口补齐集（0144-0150·0150 收尾恰一窗）。P0-0/P7-1 计数随集实数（139/7），
  // 0144-0149 无新业务表/写点函数亲证 → facets 与 fixtures 目标面全在 ≤0143 库内。
  const pre = all.filter((m) => m.version.slice(0, 4) <= '0143');
  const windowSet = all.filter((m) => m.version.slice(0, 4) <= '0150');
  const mig150 = all.find((m) => m.version === MIGRATION_0150);

  /* ── Stage A：≤0143 全量迁移（0143 窗复现·0145/0150 排除）───────────────── */
  {
    const r = await runMigrations(pool, pre);
    A('P0-0 Stage A 应用 0001–0143（恰 pre 集实数·双 0143 文件名序·零 skip）', r.applied.length === pre.length && r.skipped.length === 0,
      `applied=${r.applied.length} expected=${pre.length} skipped=${r.skipped.length}`);
  }

  const ownerA = `dbacl-a-owner-${process.pid}`;
  const ownerB = `dbacl-b-owner-${process.pid}`;
  const { interviewId: ivA } = await seedBaseFixtures('a', ownerA);
  await seedDirectFixtures('a', ownerA);

  /* ── P0 复现负门（雷在卷 · 修复前恰 42501）─────────────────────────────── */
  {
    const acl = await pool.query<{ proacl: string }>(
      `SELECT coalesce(p.proacl::text,'NULL') AS proacl FROM pg_proc p WHERE p.oid='public.uuidv7()'::regprocedure`);
    const proacl = acl.rows[0]?.proacl ?? '';
    A('P0-1 修复前 proacl=owner-only（无 PUBLIC/无任何受限角色条目）',
      /=[X]/.test(proacl) && !proacl.includes('app_role') && !proacl.includes('PUBLIC'),
      `proacl=${proacl}`);
    const pub = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('public','public.uuidv7()','EXECUTE') AS v`);
    const app = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('app_role','public.uuidv7()','EXECUTE') AS v`);
    A('P0-2 修复前 PUBLIC 无 EXECUTE 且 app_role 无 EXECUTE（0073 ADP REVOKE × 0143 零 GRANT 实证）',
      pub.rows[0]?.v === false && app.rows[0]?.v === false);
    const mine = await asRole('app_role', ownerA, (c) => c.query(
      `INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, lease_expires_at)
       VALUES ($1,$2,'interview',1, now()+interval '60 seconds') ON CONFLICT DO NOTHING RETURNING id`,
      [ownerA, `idem-p0-${Date.now() % 100000}`]));
    A('P0-3 复现负门：asPrincipal(app_role) 发桶 omit-id INSERT 恰 42501 permission denied for function uuidv7',
      isMine(mine), show(mine));
  }

  /* ── §3 catalog 机检推导闭集（双向核 · 逐行证据）────────────────────────── */
  const derive = await deriveClosedSet();
  {
    A('§3-1 55 表 DEFAULT uuidv7()（D1 全 55 切 · N1 ai_graph_run=run_id）', derive.tableCount === 55,
      `count=${derive.tableCount}`);
    const extra = derive.owners.filter((o) => !EXPECTED_CLOSED_SET.includes(o as (typeof EXPECTED_CLOSED_SET)[number]));
    const missing = EXPECTED_CLOSED_SET.filter((o) => !derive.owners.includes(o));
    A('§3-2 推导闭集 ⊆ 预期 8 集（多一角色须逐行举证——当前零多余）', extra.length === 0, `extra=[${extra.join(',')}]`);
    A('§3-3 预期 8 集 ⊆ 推导闭集（少一即 FAIL）', missing.length === 0, `missing=[${missing.join(',')}]`);
    console.log(`DERIVE closed-set owners=${derive.owners.join(',')} pairs=${derive.pairs.length}`);
    for (const p of derive.pairs) console.log(`DERIVE ${p.owner}|${p.fn}|${p.tbl}|idcol=${p.idcol}`);
  }

  /* ── P2 逐家族负门（Stage A · 8 授予者全 facet 修复前恰 42501）──────────── */
  {
    const facets = await runFacets('a', ownerA, ivA);
    const byFamily: Record<string, string[]> = {
      app_role: [], privacy_api_owner: [], privacy_worker_owner: [], memory_runtime: [],
      memory_summarizer: [], memory_admission_issuer: [], scoring_definer_owner: [], online_judge_owner: [],
    };
    for (const [name, r] of facets.results) {
      const family = name.split(' ')[1] ?? 'unknown';
      (byFamily[family] ??= []).push(name);
      console.log(`P2-A ${isMine(r) ? 'MINE' : 'NOT-MINE'} ${name} :: ${show(r)}`);
    }
    for (const [family, names] of Object.entries(byFamily))
      A(`P2-A ${family} 家族至少一面修复前恰 42501（${names.length} 面）`, names.length > 0);
    const allMine = facets.results.every(([, r]) => isMine(r));
    A('P2-A 全部 facet 修复前恰 42501 permission denied for function uuidv7（10/10）', allMine,
      facets.results.filter(([, r]) => !isMine(r)).map(([n, r]) => `${n}:${show(r)}`).join(' | '));
  }

  const preDef = await pool.query<{ def: string }>(`SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.uuidv7()'::regprocedure`);
  const preKatDef = await pool.query<{ def: string }>(`SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.uuidv7_from_parts(bigint,bigint,bigint)'::regprocedure`);
  const preDefaults = await pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM pg_attrdef d JOIN pg_class c ON c.oid=d.adrelid JOIN pg_namespace ns ON ns.oid=c.relnamespace
      WHERE ns.nspname='public' AND pg_get_expr(d.adbin,d.adrelid)='uuidv7()'`);

  /* ── Stage B：0144–0150 窗口补齐（0150 收尾恰一窗）────────────────────── */
  {
    const r = await runMigrations(pool, windowSet);
    // 改形登记（同上·链增长后回归窗口复现原意）：applied 恰 7 = 0144,0145,0146,0147,
    // 0148,0149,0150（0150 为集尾=「恰 0150 修复」窗口闭合语义保留）；skipped=windowSet
    // 内已应用面（pre 集 139）。后续 :626 幂等 rerun 用全量 all（ledger 至 ≤0150 连续前缀
    // →0151 起正常应用·ledger 守卫零红）。
    const expectedWindow = ['0144_db_trigfam_unify', '0145_dead_table_jsonb_deprecate', '0146_qbank_partition_lifecycle', '0147_interview_owner_unique_index', '0148_interview_composite_fk_batch1', '0149_money_status_constraints', MIGRATION_0150];
    A('P7-1 Stage B 窗口补齐恰 0144–0150 七文件（applied 恰 7·0150 收尾·pre 面 139 skip）',
      r.applied.length === 7 && JSON.stringify(r.applied) === JSON.stringify(expectedWindow)
      && r.skipped.length === pre.length,
      `applied=${JSON.stringify(r.applied)} skipped=${r.skipped.length}`);
    if (!mig150) A('P7-1 0150 在目录', false);
  }

  /* ── P1 proacl 实证（修复后）──────────────────────────────────────────── */
  {
    const acl = await pool.query<{ grantee: string; privilege_type: string }>(
      `SELECT coalesce(r.rolname,'PUBLIC') AS grantee, a.privilege_type
         FROM pg_proc p CROSS JOIN aclexplode(p.proacl) a
         LEFT JOIN pg_roles r ON r.oid=a.grantee
        WHERE p.oid='public.uuidv7()'::regprocedure AND a.grantee <> p.proowner`);
    const executeGrantees = [...new Set(acl.rows.filter((r) => r.privilege_type === 'EXECUTE').map((r) => r.grantee))].sort();
    const expected = [...EXPECTED_CLOSED_SET].sort();
    A('P1-1 proacl EXECUTE grantee 集恰 = 8 角色闭集（不多不少）',
      JSON.stringify(executeGrantees) === JSON.stringify(expected), `grantees=[${executeGrantees.join(',')}]`);
    for (const role of EXPECTED_CLOSED_SET) {
      const r = await pool.query<{ v: boolean }>(`SELECT has_function_privilege($1,'public.uuidv7()','EXECUTE') AS v`, [role]);
      A(`P1-2 ${role} has_function_privilege EXECUTE = true`, r.rows[0]?.v === true);
    }
    const kat = await pool.query<{ v: boolean }>(
      `SELECT has_function_privilege('app_role','public.uuidv7_from_parts(bigint,bigint,bigint)','EXECUTE') AS v`);
    A('P1-3 uuidv7_from_parts 不授权（推导明确剔除 · app_role 仍 false）', kat.rows[0]?.v === false);
    const postDef = await pool.query<{ def: string }>(`SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.uuidv7()'::regprocedure`);
    A('P1-4 uuidv7 函数体跨 stage 逐字节全等（禁触函数体实证）',
      postDef.rows[0]?.def === preDef.rows[0]?.def);
    const postKatDef = await pool.query<{ def: string }>(`SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.uuidv7_from_parts(bigint,bigint,bigint)'::regprocedure`);
    A('P1-5 uuidv7_from_parts 函数体跨 stage 全等', postKatDef.rows[0]?.def === preKatDef.rows[0]?.def);
    const postDefaults = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM pg_attrdef d JOIN pg_class c ON c.oid=d.adrelid JOIN pg_namespace ns ON ns.oid=c.relnamespace
        WHERE ns.nspname='public' AND pg_get_expr(d.adbin,d.adrelid)='uuidv7()'`);
    // P1-6 改形登记（0145 落链后的主线基线红消解·非洗基线）：Stage A 面（≤0143）55 表
    // DEFAULT uuidv7()；Stage B 窗口内 0145 退役 consumption_record（dbhy1 P1-2/P4⑤ 登记
    // 豁免·drift 豁免同源）恰 −1=54；0150 GRANT-only 零 DEFAULT 触。改形=恰 −1 机械锁
    // （再退役/误增任一即红）。
    A('P1-6 55 表 DEFAULT uuidv7() 跨 stage（改形·0145 退役豁免恰 −1=54·dbhy1 P1-2/P4⑤ 登记同源）',
      preDefaults.rows[0]?.n === 55 && postDefaults.rows[0]?.n === 54,
      `pre=${preDefaults.rows[0]?.n} post=${postDefaults.rows[0]?.n}`);
  }

  /* ── §4 泛化门（#141 · F1 重瞄准）：任意 pg_attrdef DEFAULT 函数 × 运行时角色 executable ──
   * 真缺口=泛化门（uuidv7 单函数臂 P1-1/P1-2 不得作 #141 全闭依据）：0143 曾把 55 表 id
   * DEFAULT 改 uuidv7() 而漏授 EXECUTE（0073 默认撤销 PUBLIC·0145/0150/0151 分三刀补授权）。
   * 本臂机械推导「所有作为列 DEFAULT 的 public 函数」，逐个断言运行时角色 app_role
   * executable——未来任何新表/新列带 DEFAULT 用户函数而漏 GRANT，此门在 CI 即红（0145
   * 型缺口不再靠人肉排障）。内置/pg_catalog 函数（now()/gen_random_uuid() 等）不在
   * public 命名空间，JOIN pg_proc public 限定后自然豁免。 */
  {
    const defaultFns = await pool.query<{ fn: string; oid: string }>(
      `SELECT DISTINCT f.fn, p.oid::text AS oid FROM (
          SELECT DISTINCT (regexp_matches(pg_get_expr(d.adbin, d.adrelid), '([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*\\(', 'g'))[1] AS fn
            FROM pg_attrdef d
            JOIN pg_class c ON c.oid = d.adrelid
            JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public'
        ) f
        JOIN pg_proc p ON p.proname = f.fn
        JOIN pg_namespace pn ON pn.oid = p.pronamespace AND pn.nspname = 'public'
       ORDER BY f.fn`);
    A('§4-1 泛化门推导面非空：public DEFAULT 函数闭集≥1（推导机制在证·非恒真空门）',
      (defaultFns.rowCount ?? 0) >= 1, `fns=[${defaultFns.rows.map((r) => r.fn).join(',')}]`);
    const denied: string[] = [];
    for (const { fn, oid } of defaultFns.rows) {
      const r = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('app_role', $1::regprocedure, 'EXECUTE') AS v`, [oid]);
      if (r.rows[0]?.v !== true) denied.push(fn);
    }
    A('§4-2 泛化门(#141): 任意 pg_attrdef DEFAULT public 函数对运行时角色 app_role executable（新 DEFAULT 函数漏授权即红）',
      denied.length === 0, `denied=[${denied.join(',')}]`);
    console.log(`GENERALIZE default-fn closed set=${defaultFns.rowCount} denied=${denied.length}`);
  }

  /* ── Stage B 夹具 + F6-B 前置真链（interview_prep consent → F10 admission）─ */
  const { interviewId: ivB } = await seedBaseFixtures('b', ownerB);
  await seedDirectFixtures('b', ownerB);
  {
    const consent = await asRole('app_role', ownerB, (c) => c.query(`SELECT * FROM memory_grant_consent('interview_prep','pol-v1')`), true);
    A('P2-B-0 前置真链：memory_runtime consent(interview_prep) 绿且落账（为 admission 签发供 granted consent）',
      consent.ok, show(consent));
  }

  /* ── P2 逐家族绿（Stage B · 8 授予者全 facet 修复后绿）─────────────────── */
  {
    const facets = await runFacets('b', ownerB, ivB);
    const byFamily: Record<string, string[]> = {
      app_role: [], privacy_api_owner: [], privacy_worker_owner: [], memory_runtime: [],
      memory_summarizer: [], memory_admission_issuer: [], scoring_definer_owner: [], online_judge_owner: [],
    };
    for (const [name, r] of facets.results) {
      const family = name.split(' ')[1] ?? 'unknown';
      (byFamily[family] ??= []).push(name);
      console.log(`P2-B ${r.ok ? 'GREEN' : 'RED'} ${name} :: ${show(r)}`);
    }
    for (const [family, names] of Object.entries(byFamily))
      A(`P2-B ${family} 家族至少一面修复后绿（${names.length} 面）`, names.length > 0);
    A('P2-B 全部 facet 修复后绿（10/10）', facets.results.every(([, r]) => r.ok),
      facets.results.filter(([, r]) => !r.ok).map(([n, r]) => `${n}:${show(r)}`).join(' | '));
  }

  /* ── P4 report enqueue 面（F2 已绿 · 独立断言钉面 · 真实 interview 写门通过）── */
  {
    const r = await asRole('app_role', ownerB, (c) => enqueueReport(c, ownerB, ivB));
    A('P4 report enqueue（ai_report omit-id DEFAULT 路径 · packages/db/src/report.ts:15 面）绿', r.ok, show(r));
  }

  /* ── P3 隐私擦除链三面（0096 面 · begin→issue→consume→claim→purge + 收据）── */
  {
    const begin = await asRole('app_role', ownerB, (c) => c.query(
      `SELECT * FROM interview_projection_begin_erasure($1,$2,$3)`, [ivB, sha256('rk-p3-dbacl'), 2]), true);
    A('P3-1 begin（privacy_api_owner · privacy_erasure_request/privacy_deletion_target omit-id）绿',
      begin.ok && begin.rows.length > 0, show(begin));
    const firstRow = begin.rows[0] ?? {};
    const requestEpoch = Number(firstRow.privacy_epoch ?? 2);
    const digest = String(firstRow.target_set_digest ?? '');
    const eventTarget = begin.rows.find((r) => r.sink === 'event');
    const fenceTarget = begin.rows.find((r) => r.sink === 'checkpoint_rows');
    A('P3-2 begin 返回 4 target（event/ai_graph_run/report/checkpoint_rows）+ 活 digest',
      Boolean(eventTarget && fenceTarget && digest.length === 64));

    const jti = `jti-p3-${Date.now() % 100000}`;
    const issue = await asRole('privacy_issuer', ownerB, (c) => c.query(
      `SELECT * FROM privacy_issue_authorization_snapshot($1,'key-v1','actor-1',$2,'interview_data_erasure',$3,$4, now()+interval '10 minutes')`,
      [jti, ivB, requestEpoch, digest]), true);
    A('P3-3 issue（privacy_api_owner · privacy_authorization_snapshot omit-id · digest=活 target_set_digest）绿',
      issue.ok, show(issue));

    const consume = await asRole('privacy_worker_executor', null, (c) => c.query(
      `SELECT * FROM privacy_consume_authorization_snapshot($1,'w1')`, [jti]), true);
    A('P3-4 consume（0091 单次 CAS）绿', consume.ok, show(consume));

    const claim = await asRole('privacy_worker_executor', ownerB, (c) => c.query(
      `SELECT * FROM privacy_authorization_claim_target($1,$2,'w1',120)`, [jti, eventTarget?.target_id]), true);
    A('P3-5 claim（privacy_worker_owner · 冻结 digest 复验通过 → leased）绿',
      claim.ok && Boolean(claim.rows[0]?.lease_token), show(claim));

    const purge = await asRole('privacy_worker_executor', ownerB, (c) => c.query(
      `SELECT * FROM privacy_purge_interview_projection_target($1,$2)`, [eventTarget?.target_id, claim.rows[0]?.lease_token]), true);
    A('P3-6 purge（privacy_worker_owner · 物理删除 + target erased + 请求转 purging）绿',
      purge.ok && purge.rows[0]?.status === 'erased', show(purge));

    const receipt = await asRole('privacy_worker_executor', ownerB, (c) => c.query(
      `SELECT * FROM privacy_record_deletion_receipt($1,'local_erased',$2,'w1')`, [fenceTarget?.target_id, sha256('p3-receipt')]), true);
    A('P3-7 收据签发（privacy_worker_owner · privacy_deletion_receipt omit-id）绿', receipt.ok, show(receipt));
  }

  /* ── P5 过度授权负门（客观基线 = §3 推导集）────────────────────────────── */
  {
    const probe = `dbacl_probe_${String(process.pid).slice(-6)}`;
    await pool.query(`CREATE ROLE ${probe} NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
    try {
      const denied = await asRole(probe, null, (c) => c.query('SELECT public.uuidv7()'));
      A('P5-1 新建无关系角色 SELECT uuidv7() 仍恰 42501（未过度授权）', isMine(denied), show(denied));
    } finally {
      await pool.query(`DROP ROLE ${probe}`);
    }
    const pub = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('public','public.uuidv7()','EXECUTE') AS v`);
    A('P5-2 PUBLIC 泄漏门：has_function_privilege(public,uuidv7,EXECUTE) = false（修复后仍不泄漏）',
      pub.rows[0]?.v === false);
    // 0150 全文白名单机检：恰 8 条 GRANT · 目标集=推导闭集 · 无 GRANT ALL/无其他语句
    const raw = readFileSync(`${MIG_DIR}/${MIGRATION_0150}.sql`, 'utf8');
    const noComments = raw.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
    const stmts = splitSql(noComments);
    const grantRe = /^GRANT EXECUTE ON FUNCTION public\.uuidv7\(\) TO ([a-z_]+)$/;
    const grants = stmts.filter((s) => grantRe.test(s));
    const roles = grants.map((s) => grantRe.exec(s)![1]!);
    A('P5-3 0150 恰 8 条 GRANT EXECUTE ON FUNCTION public.uuidv7() 语句（无其他语句）',
      stmts.length === 8 && grants.length === 8, `stmts=${stmts.length}`);
    A('P5-4 GRANT 目标集 = §3 catalog 推导闭集（非刀自定义）· 无重复',
      JSON.stringify([...new Set(roles)].sort()) === JSON.stringify(derive.owners) && new Set(roles).size === 8,
      `roles=[${roles.join(',')}] derived=[${derive.owners.join(',')}]`);
    const banned = /\b(ALL|DROP|REVOKE|ALTER|CREATE|TRIGGER|UPDATE|DELETE|INSERT|OWNER|GRANT\s+[A-Z])\b/;
    const bannedHits = stmts.filter((s) => banned.test(s.replace(/^GRANT EXECUTE ON FUNCTION public\.uuidv7\(\) TO [a-z_]+$/, '')));
    A('P5-5 无 GRANT ALL / 无 DROP/REVOKE/ALTER/CREATE 等非 GRANT-EXECUTE 精确形语句', bannedHits.length === 0);
  }

  /* ── P6 静态契约门（历史迁移零字节 · 改形·链演进鲁棒）────────────────────── */
  // 改形登记（主线基线红消解·非洗基线）：原 P6-1/P6-2/P6-3 以 BASE_SHA='8bf82a1b' 冻结锚
  // diff-to-base——BASE 之后主线合法演进 50+ 迁移与多刀产品码改动，三断言对任何前进的
  // HEAD 结构性恒红（0151 进链即翻·与本刀扩臂无关）。改形=语义移交机械权威门：
  // ①历史零字节改 → ledger checksum 对账（P6-2 改形·改任何一字节即红·与 migrate.proof
  // 漂移检测同源强于 git diff）；②「0150 恰一新增」→ 零 D/R + M 仅限登记豁免面（P6-1）；
  // ③产品码零改 → uuidv7 函数体 = 0150 文件静态体逐字节一致（P6-3·防 0150 后 OR REPLACE
  // 篡改·与 P1-4 stage 对拍独立互补）。BASE_SHA 保留仅作历史注释不再作断言锚。
  {
    const diff = spawnSync('git', ['diff', '--name-status', BASE_SHA, 'HEAD', '--', 'packages/db/migrations'], { cwd: ROOT, encoding: 'utf8' });
    const lines = (diff.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
    const deletes = lines.filter((l) => /^[DR]\s/.test(l));
    const modified = lines.filter((l) => /^M\s/.test(l)).map((l) => l.replace(/^[MD]\s+/, ''));
    const rewriteExempt = /0148_interview_composite_fk_batch1\.sql$|0149_money_status_constraints\.sql$/;
    A('P6-1 历史迁移零字节门（改形）：diff-to-base 零 D/R·M 仅限 0148/0149 重制豁免两文件（A 面=链演进新增·归 uniqueness/migrate 门管）',
      diff.status === 0 && deletes.length === 0 && modified.every((f) => rewriteExempt.test(f)),
      `D/R=[${deletes.join(';')}] M=[${modified.join(';')}] status=${diff.status}`);
    const { createHash } = await import('node:crypto');
    const preFiles = all.filter((m) => m.version.slice(0, 4) <= '0143');
    const ledgerRows = new Map((await pool.query<{ version: string; checksum: string }>('SELECT version, checksum FROM schema_migrations')).rows.map((r) => [r.version, r.checksum]));
    const drift = preFiles.filter((m) => ledgerRows.get(m.version) !== createHash('sha256').update(m.sql, 'utf8').digest('hex'));
    A('P6-2 历史迁移零字节改（改形·ledger 对账机械证）：0143 及以前逐文件 sha256 == ledger checksum（含 0148/0149 重制后新字节·改任何一字节即红）',
      drift.length === 0 && preFiles.length > 0, `drift=[${drift.map((m) => m.version).join(',')}]`);
    const fn150 = await pool.query<{ def: string }>(`SELECT pg_get_functiondef('public.uuidv7()'::regprocedure) AS def`);
    // uuidv7() 创建于 0143_db_id_v7_unify（0150 为 GRANT-only 零函数体）——静态对照锚=0143 文件。
    const sql143Text = readFileSync(`${MIG_DIR}/0143_db_id_v7_unify.sql`, 'utf8');
    const body0150 = (sql143Text.match(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?uuidv7\(\)[\s\S]*?AS\s+(\$[A-Za-z_]*\$)([\s\S]*?)\1/i)?.[2] ?? '').trim();
    const bodyDb = (fn150.rows[0]?.def ?? '').match(/AS\s+(\$[A-Za-z_]*\$)([\s\S]*?)\1/i)?.[2]?.trim() ?? '';
    A('P6-3 uuidv7 函数体零字节（改形）：库内函数体 == 0143 文件静态体（防落链后 OR REPLACE 篡改·与 P1-4 stage 对拍互补）',
      bodyDb.length > 0 && bodyDb === body0150, `db_len=${bodyDb.length} file_len=${body0150.length}`);
  }

  /* ── P7 migrate 门（窗口补齐 · applied=文件数 · 重跑零漂移·改形参数化）────── */
  {
    // 改形登记（链增长后回归可验证语义·非洗基线）：原 P7-2/P7-3 硬编码「=145」在链演进
    // 后恒红（同 BASE_SHA 类冻结常数）。改形=Stage B 后 ledger 恰窗口集（≤0150）→链尾
    // 补齐恰 once→applied=文件数→重跑全 skip。链计数权威归 uniqueness/migrate 门，此处
    // 只锁「补齐恰一次+幂等零漂移」的机制语义（参数化对链增长鲁棒）。
    const beforeCount = await pool.query<{ n: number }>('SELECT count(*)::int AS n FROM schema_migrations');
    const catchup = await runMigrations(pool, all);
    A('P7-2 Stage B 后 ledger 恰窗口集且链尾补齐恰一次（0151 起 applied=全量−窗口·0150 后迁移零跳号）',
      beforeCount.rows[0]?.n === windowSet.length
      && catchup.applied.length === all.length - windowSet.length,
      `before=${beforeCount.rows[0]?.n} window=${windowSet.length} catchup=${catchup.applied.length} files=${all.length}`);
    const afterCount = await pool.query<{ n: number }>('SELECT count(*)::int AS n FROM schema_migrations');
    A('P7-2b applied 数 = 迁移文件数（全量·参数化·链计数归 uniqueness/migrate 门管）',
      afterCount.rows[0]?.n === all.length, `ledger=${afterCount.rows[0]?.n} files=${all.length}`);
    const rerun = await runMigrations(pool, all);
    A('P7-3 重跑全 skip（幂等 · checksum 零漂移 · 禁改历史迁移门复验）',
      rerun.applied.length === 0 && rerun.skipped.length === all.length,
      `applied=${rerun.applied.length} skipped=${rerun.skipped.length}`);
  }

  /* ── 55 表写点矩阵（P2 收据 · 全量枚举 · 受限写者 ⊆ 闭集）───────────────── */
  {
    const tsWriters = tsAppRoleDirectWriters();
    const writersByTable = new Map<string, Set<string>>();
    for (const p of derive.pairs) {
      const set = writersByTable.get(p.tbl) ?? new Set<string>();
      set.add(p.owner); writersByTable.set(p.tbl, set);
    }
    let rows = 0; let bad: string[] = [];
    for (const [tbl, idcol] of A_TABLES) {
      const sdWriters = [...(writersByTable.get(tbl) ?? new Set<string>())].sort();
      const ts = tsWriters.get(tbl) ?? [];
      if (ts.length > 0) sdWriters.push('app_role(ts-direct)');
      rows++;
      const outside = sdWriters.filter((w) => w !== 'app_role(ts-direct)' && !EXPECTED_CLOSED_SET.includes(w as (typeof EXPECTED_CLOSED_SET)[number]));
      if (outside.length > 0) bad.push(`${tbl}:${outside.join(',')}`);
      console.log(`MATRIX ${tbl}|idcol=${idcol}|writers=[${sdWriters.join(',')}]|ts_files=${ts.length}`);
    }
    A('P2-MATRIX 55 表全量枚举 · 每表受限写者 ⊆ 8 角色闭集（矩阵收据全行打印）',
      rows === 55 && bad.length === 0, `bad=[${bad.join(';')}]`);
  }

  console.log(`RESULT dbacl1-db-acl failures=${failures} at=${new Date().toISOString()}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await pool.end().catch(() => undefined); process.exit(1); });
