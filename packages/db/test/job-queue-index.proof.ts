/**
 * job-queue-index.proof.ts — 队列 status/lease 前导索引 + gauge 聚合改形隔离库证明（45 项 = 44 判红断言 + 1 登记臂 B33）。
 *
 * 真迁移链（全量 0001→0224，222 件）+ 隔离容器（run-e2e-isolated 包装·assertIsolatedTestTarget nonce 门）。
 * 计数分组：9 静态（A1-A9）+ 12 元数据（B1-B11+B22）+ 19 EXPLAIN/登记（B12-B20+B23-B31+B33）+ 5 真行为
 * （B21 数值等价 / B32 按别名真执行 / B34 sweep idx_scan / B35 live idx_scan / B36 四新索引 idx_scan）。
 *
 * 判定基座（行为面主判 + 计划形状辅证）：
 *   - 破平手夹具三段全破（queued / running 过期 / running 未过期各 ≥50k·10k owner 各 ≥5）+
 *     done 450k/10k owner 基底 + ≥20k 同 interview_id 族散布；判别用夹具非生产形态仿真。
 *   - 首跑六轮「ANALYZE 四表 + EXPLAIN 三查询」= 夹具校准（六轮全绿才进正式判定；任一轮红 =
 *     仪器红 exit 1，禁 retry-to-green、禁改断言）；正式判定逐轮守卫走主判据。
 *   - B32 主判据 = 同 client 事务内 SET LOCAL 真执行 claim UPDATE（EXPLAIN ANALYZE·Actual Loops ≥1）
 *     后 ROLLBACK，只取 Alias=j 子树：带 Index Name 节点全 claim/owner 前导 且 归属 j 的 heap/Index
 *     Scan 节点 Filter 不含 owner_user_id（不读 Recheck Cond）；claim idx_scan 增量降为交叉登记
 *     （按索引聚合、整句四扫描共用，不能单独判红）。
 *   - B34/B35 主判据 = 单扫描语句真执行后目标索引（owner 前导 ix_ijob_claim）idx_scan 增量 ≥1；
 *     idx_scan 读数协议：前后读数各为独立 autocommit 语句、读前 pg_stat_force_next_flush()、
 *     禁与执行事务同块、ROLLBACK 不撤销计数。
 *   - 真执行前置：目标 owner 候选行各配 interview(id, owner_user_id) 行 + 事务内
 *     SET LOCAL app.principal_user=<owner>（interview_job 隐私写触发器墙）。
 *   - 种子期 session_replication_role=replica 绕 interview_job INSERT 触发器，种子会话结束复原。
 *
 * 运行：node scripts/run-e2e-isolated.mjs job-queue-index:prove（隔离库包装·禁直跑绕门）。
 * est live=0：零模型外呼·零生产操作·零 secrets。
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  createPool, runMigrations, loadMigrations, assertIsolatedTestTarget,
  type DbPool, type Client,
} from '../src/index.ts';

const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));
const ADMIN_DB = 'postgres';
const MAIN_DB = 'jqidx_main_probe';

// ── 夹具合同常量（B11 与之全等断言） ─────────────────────────────────────
const SPREAD_OWNERS = 10_000;
const CTRL_OWNER = 'sqownera';
const STEADY_OWNER = 'sqsteady';
const DONE_SPREAD = 450_000;
const FAMILY_ROWS = 20_000;
const QUEUED_SEG = 50_000;
const RUNEXP_SEG = 50_000;
const RUNUNEXP_SEG = 50_000;
const FAILED_MAIN = 3;
const CTRL_QUEUED = 5;
const CTRL_RUNEXP_RQ = 5;    // sweep rq 臂候选（attempts < 上限）
const CTRL_RUNEXP_DEAD = 5;  // sweep dead 臂候选（attempts ≥ 上限）
const CTRL_DONE = 45;
const IJOB_MAIN_TOTAL = DONE_SPREAD + FAMILY_ROWS + QUEUED_SEG + RUNEXP_SEG + RUNUNEXP_SEG
  + FAILED_MAIN + CTRL_QUEUED + CTRL_RUNEXP_RQ + CTRL_RUNEXP_DEAD + CTRL_DONE;
const IJOB_MAIN_DONE = DONE_SPREAD + FAMILY_ROWS + CTRL_DONE;
const IJOB_MAIN_QUEUED = QUEUED_SEG + CTRL_QUEUED;
const IJOB_MAIN_RUNNING = RUNEXP_SEG + RUNUNEXP_SEG + CTRL_RUNEXP_RQ + CTRL_RUNEXP_DEAD;
const OTHER_MAIN_TOTAL = DONE_SPREAD + QUEUED_SEG + RUNEXP_SEG + RUNUNEXP_SEG + FAILED_MAIN;
const CONS_RESERVED = 5;
const CONS_CONFIRMED = 50_000;
// 稳态夹具（B31/B33 专用·单 owner·400k 终态）
const STEADY_FAILED = 400_000;
const STEADY_DONE = 50_000;
const STEADY_QUEUED = 5;
const STEADY_RUNEXP = 5;

const NEW_INDEXES = new Map<string, { index: string; deadStatus: string }>();
NEW_INDEXES.set('interview_job', { index: 'ix_ijob_status_lease', deadStatus: 'failed' });
NEW_INDEXES.set('quiz_job', { index: 'ix_quizjob_status_lease', deadStatus: 'failed' });
NEW_INDEXES.set('diagnosis_job', { index: 'ix_diagnosisjob_status_lease', deadStatus: 'failed' });
NEW_INDEXES.set('ai_report', { index: 'ix_report_status_lease', deadStatus: 'quarantined' });
const MARKER_TABLES = ['interview_job', 'quiz_job', 'diagnosis_job', 'ai_report'];
const INDEX_FILES = [
  '0220_job_queue_interview_status_lease_index.sql',
  '0221_job_queue_quiz_status_lease_index.sql',
  '0222_job_queue_diagnosis_status_lease_index.sql',
  '0223_job_queue_report_status_lease_index.sql',
];
const GAUGE_FILE = '0224_job_gauge_index_friendly.sql';
const GAUGE_MIRROR_STALE = 'packages/db/sql/24_runtime_observability_gateway.sql';
const CLAIM_LEASE_OWNER = 'sq-proof-lease';
const CLAIM_MAX_ATTEMPTS = 5;
const CLAIM_INFLIGHT_CAP = 1; // claim 租内未过期 running 帽（DEFAULT_INTERVIEW_PER_OWNER_INFLIGHT 同值）
const DEAD_MS_CAP = 33.1;     // 终态列上限 = §1.4/§1.2 对比表所列该形态测量值（VACUUM 后 Index Only Scan 33.1ms·同表并列 29.7ms 禁 seqscan 形·本机中位读数 29.5-31.5ms 与该包络同域）

const dispatchSql = new Map<string, string>();
dispatchSql.set('interview_job', `SELECT j.owner_user_id::text FROM public.interview_job AS j
  WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp())
  GROUP BY j.owner_user_id ORDER BY min(j.created_at) ASC, j.owner_user_id ASC`);
dispatchSql.set('quiz_job', `SELECT DISTINCT j.owner_user_id::text FROM public.quiz_job AS j
  WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp())`);
dispatchSql.set('diagnosis_job', `SELECT DISTINCT j.owner_user_id::text FROM public.diagnosis_job AS j
  WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp())`);
dispatchSql.set('ai_report', `SELECT DISTINCT r.owner_user_id::text FROM public.ai_report AS r
  WHERE r.status IN ('queued','failed') OR (r.status='running' AND r.lease_expires_at < clock_timestamp())`);
// B16-B19/B27-B30/B20 形（running-expired 双条件·now() stable 属 pseudo-constant）
const runExpiredSql = (t: string) => `SELECT count(*) FROM ${t} WHERE status='running' AND lease_expires_at < now()`;
// claim 候选段全语句（真实 claim UPDATE 形·B32 校准与正式判定共用）
const claimShapeSql = `UPDATE interview_job SET status='running', lease_owner='${CLAIM_LEASE_OWNER}',
     lease_expires_at=now()+interval '120 seconds', attempts=attempts+1, version=version+1
   WHERE id = (
     SELECT j.id FROM interview_job j
      WHERE j.owner_user_id='${CTRL_OWNER}'
        AND interview_privacy_active(j.interview_id)
        AND ((j.status='queued' AND (j.next_attempt_at IS NULL OR j.next_attempt_at <= now()) AND j.attempts < ${CLAIM_MAX_ATTEMPTS})
             OR (j.status='running' AND j.lease_expires_at < now() AND j.attempts < ${CLAIM_MAX_ATTEMPTS}))
        AND NOT EXISTS (SELECT 1 FROM interview_job r WHERE r.interview_id=j.interview_id AND r.status='running' AND r.lease_expires_at >= now())
        AND NOT EXISTS (SELECT 1 FROM interview_job f WHERE f.interview_id=j.interview_id AND f.status='failed')
        AND (
          SELECT count(*)::int FROM interview_job live
           WHERE live.owner_user_id='${CTRL_OWNER}'
             AND live.status='running'
             AND live.lease_expires_at >= now()
        ) < ${CLAIM_INFLIGHT_CAP}
     ORDER BY j.seq ASC, j.created_at ASC FOR UPDATE SKIP LOCKED LIMIT 1)
   RETURNING id`;
const sweepDeadSql = `UPDATE interview_job SET status='failed', last_error='reaped:worker_died', lease_owner=NULL, version=version+1
   WHERE owner_user_id='${CTRL_OWNER}' AND status='running' AND lease_expires_at < now() AND attempts >= ${CLAIM_MAX_ATTEMPTS}`;
const sweepRqSql = `UPDATE interview_job
      SET status=CASE WHEN (SELECT i.status FROM interview i WHERE i.id=interview_job.interview_id AND i.owner_user_id=interview_job.owner_user_id)='failed' THEN 'failed' ELSE 'queued' END,
          last_error=CASE WHEN (SELECT i.status FROM interview i WHERE i.id=interview_job.interview_id AND i.owner_user_id=interview_job.owner_user_id)='failed' THEN 'abandoned' ELSE last_error END,
          lease_owner=NULL, lease_expires_at=NULL, version=version+1
    WHERE owner_user_id='${CTRL_OWNER}' AND status='running' AND lease_expires_at < now() AND attempts < ${CLAIM_MAX_ATTEMPTS}`;
const liveSql = `SELECT count(*)::int AS n FROM interview_job live WHERE live.owner_user_id='${CTRL_OWNER}' AND live.status='running' AND live.lease_expires_at >= now()`;

let failures = 0;
const A = (n: string, c: boolean, extra?: string) => {
  console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${c || !extra ? '' : ` — ${extra}`}`);
  if (!c) failures += 1;
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const PIN = (k: string, v: unknown) => console.log(`PIN  ${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`);
let fencedSeen = 0;
const watchFenced = (e: unknown): never => {
  const msg = e instanceof Error ? `${e.message}` : String(e);
  if (msg.includes('interview_privacy_fenced')) fencedSeen += 1;
  throw e;
};

type PlanNode = Record<string, unknown>;
const asPlan = (rows: Array<Record<string, unknown>>): PlanNode[] => {
  const plan = rows[0]?.['QUERY PLAN'];
  if (!Array.isArray(plan)) throw new Error('jqidx_explain_json_missing');
  return plan as PlanNode[];
};
const rootNode = (plans: PlanNode[]): PlanNode => {
  const node = plans[0]?.['Plan'];
  if (!node || typeof node !== 'object') throw new Error('jqidx_plan_root_missing');
  return node as PlanNode;
};

interface ScanHit {
  alias: string; indexName?: string; indexCond?: string;
  filter?: string; nodeType: string; planRows?: number; actualRows?: number; actualLoops?: number;
}

/** 计划树扫描节点归属：Bitmap Index Scan 臂无 Alias，归属取父 Bitmap Heap Scan 的 Alias；
 *  「owner 降 Filter」只看归属 heap/Index Scan 节点的 Filter 键；不读 Recheck Cond。 */
function collectScans(node: PlanNode, inheritedAlias?: string, out: ScanHit[] = []): ScanHit[] {
  const type = String(node['Node Type'] ?? '');
  const alias = typeof node['Alias'] === 'string' ? (node['Alias'] as string) : inheritedAlias;
  if (type === 'Bitmap Index Scan') {
    out.push({
      alias: inheritedAlias ?? '', indexName: node['Index Name'] as string | undefined,
      indexCond: node['Index Cond'] as string | undefined, nodeType: type,
      planRows: node['Plan Rows'] as number | undefined,
      actualRows: node['Actual Rows'] as number | undefined, actualLoops: node['Actual Loops'] as number | undefined,
    });
  } else if (['Seq Scan', 'Index Scan', 'Index Only Scan', 'Bitmap Heap Scan', 'Tid Scan', 'Function Scan'].includes(type)) {
    out.push({
      alias: alias ?? '', indexName: node['Index Name'] as string | undefined,
      indexCond: node['Index Cond'] as string | undefined, filter: node['Filter'] as string | undefined,
      nodeType: type, planRows: node['Plan Rows'] as number | undefined,
      actualRows: node['Actual Rows'] as number | undefined, actualLoops: node['Actual Loops'] as number | undefined,
    });
  }
  for (const child of (node['Plans'] as PlanNode[] | undefined) ?? []) collectScans(child, alias, out);
  return out;
}

const redForms = (scans: ScanHit[], alias: string, newIndex: string): { armRed: boolean; filterRed: boolean } => {
  const mine = scans.filter((s) => s.alias === alias);
  return {
    armRed: mine.some((s) => s.indexName === newIndex),
    filterRed: mine.some((s) => (s.filter ?? '').includes('owner_user_id')),
  };
};

async function freshDatabase(admin: DbPool, name: string): Promise<DbPool> {
  await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${name}`);
  const pool = createPool({ purpose: `jqidx_${name}`, database: name });
  const manifest = loadMigrations(MIG_DIR);
  const applied = await runMigrations(pool, manifest);
  if (applied.applied.length !== manifest.length || manifest.length !== 222
    || applied.applied[applied.applied.length - 1] !== '0224_job_gauge_index_friendly') {
    throw new Error(`jqidx_migration_chain_unexpected: applied=${applied.applied.length} manifest=${manifest.length}`);
  }
  return pool;
}

async function readIdxScan(db: DbPool, rel: string, index: string): Promise<number> {
  await db.query('SELECT pg_stat_force_next_flush()');
  const r = await db.query(
    'SELECT idx_scan::bigint AS n FROM pg_stat_user_indexes WHERE schemaname = $1 AND indexrelname = $2',
    ['public', index],
  );
  if (r.rowCount !== 1) throw new Error(`jqidx_idx_scan_missing:${rel}:${index}`);
  return Number(r.rows[0].n);
}

async function tableCounts(db: DbPool, table: string): Promise<Record<string, number>> {
  const r = await db.query(
    `SELECT count(*) FILTER (WHERE status = 'done') AS done,
            count(*) FILTER (WHERE status = 'queued') AS queued,
            count(*) FILTER (WHERE status = 'running') AS running,
            count(*) FILTER (WHERE status = 'failed') AS failed,
            count(*) FILTER (WHERE status = 'quarantined') AS quarantined,
            count(*) FILTER (WHERE status = 'ready') AS ready,
            count(*) AS total FROM ${table}`,
  );
  return r.rows[0] as Record<string, number>;
}

const pinRoleState = async (c: Client, tag: string): Promise<void> => {
  const r = await c.query('SELECT current_user AS cu, current_setting($1) AS rs, current_setting($2, true) AS guc',
    ['row_security', 'app.principal_user']);
  PIN(`role_state_${tag}`, [['current_user', r.rows[0].cu], ['row_security', r.rows[0].rs], ['app.principal_user', r.rows[0].guc]]);
};

function walkAll(node: PlanNode, out: PlanNode[] = []): PlanNode[] {
  out.push(node);
  for (const child of (node['Plans'] as PlanNode[] | undefined) ?? []) walkAll(child, out);
  return out;
}

async function main() {
  console.log(`PIN  e2e_pg_image=${process.env.E2E_PG_IMAGE ?? '(unset:runner-default)'}`);
  const admin = createPool({ purpose: 'jqidx_admin', database: ADMIN_DB });
  await assertIsolatedTestTarget(admin);
  {
    const v = await admin.query('SELECT version() AS v, current_setting($1) AS dst, current_user AS cu, current_setting($2) AS rs',
      ['default_statistics_target', 'row_security']);
    PIN('postgres_version', v.rows[0].v);
    PIN('default_statistics_target', v.rows[0].dst);
    PIN('session_role_current_user', v.rows[0].cu);
    PIN('row_security', v.rows[0].rs);
  }

  // ══ A. 静态确定性（9 断言·零 DB） ══
  section('A 静态（A1-A9）');
  const migFiles = readdirSync(MIG_DIR).filter((f) => f.endsWith('.sql')).sort();
  const migText = new Map<string, string>(migFiles.map((f) => [f, readFileSync(`${MIG_DIR}/${f}`, 'utf8')]));
  const stripComments = (sql: string) => sql
    .replace(/--[^\n]*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .trim();

  // A1 内容标记恰 4 文件·四表各一·gauge 迁移零标记
  const markerHits = new Map<string, string[]>();
  for (const [f, text] of migText) {
    for (const m of text.matchAll(/--\s*job-queue-index:\s*([A-Za-z_][A-Za-z0-9_]*)/g)) {
      const list = markerHits.get(f) ?? [];
      list.push(m[1] ?? '');
      markerHits.set(f, list);
    }
  }
  const markerFiles = [...markerHits.keys()].sort();
  const markerExact = MARKER_TABLES.every((t) => {
    const hits = markerFiles.filter((f) => (markerHits.get(f) ?? []).includes(t));
    return hits.length === 1 && (markerHits.get(hits[0] ?? '') ?? []).length === 1;
  });
  A('A1 内容标记恰 4 文件·四表各恰一·gauge 迁移零标记',
    markerFiles.length === 4 && markerExact && !(markerHits.get(GAUGE_FILE) ?? []).length,
    `files=${markerFiles.join(',')} maps=${JSON.stringify([...markerHits])}`);

  // A2 并发模式注记独占整行（与运行器 /mi 正则同口径·恰一处）
  const a2 = INDEX_FILES.map((f) => {
    const hits = migText.get(f)!.match(/^\s*--\s*@migration-mode\s+concurrent-index\s*$/gmi) ?? [];
    return hits.length === 1;
  });
  A('A2 四文件 @migration-mode concurrent-index 独占整行（/mi 口径）', a2.every(Boolean), a2.join(','));

  // A3 剥注释后恰一条语句·CREATE INDEX CONCURRENTLY IF NOT EXISTS·; 结尾
  const stripped = INDEX_FILES.map((f) => stripComments(migText.get(f)!));
  const a3 = stripped.map((s) => /^CREATE\s+INDEX\s+CONCURRENTLY\s+IF\s+NOT\s+EXISTS\s+[A-Za-z_][A-Za-z0-9_]*\s+ON\s+public\.[A-Za-z_][A-Za-z0-9_]*\s*\([^;]+\);\s*$/is.test(s));
  A('A3 四文件剥注释后恰一语句（并发建索引形·; 结尾）', a3.every(Boolean), a3.join(','));

  // A4 键列逐字 (status, lease_expires_at)·无 WHERE 谓词
  const a4 = stripped.map((s) => {
    const m = s.match(/\(([^)]*)\)/);
    const cols = (m?.[1] ?? '').split(',').map((c) => c.trim().toLowerCase()).join(', ');
    return cols === 'status, lease_expires_at' && !/where/i.test(s);
  });
  A('A4 四语句键列逐字 (status, lease_expires_at)·无谓词', a4.every(Boolean), a4.join(','));

  // A5 索引名逐字·全仓唯一·≤63
  const names = ['ix_ijob_status_lease', 'ix_quizjob_status_lease', 'ix_diagnosisjob_status_lease', 'ix_report_status_lease'];
  const a5 = names.every((n) => {
    const hits = migFiles.filter((f) => migText.get(f)!.includes(n));
    return hits.length === 1 && INDEX_FILES.includes(hits[0] ?? '') && n.length <= 63;
  });
  A('A5 四索引名逐字·全仓唯一·长度合规', a5, names.join(','));

  // A6 负断言：目标表无其他 status 前导/隐式 status 谓词索引
  const a6Violations: string[] = [];
  for (const t of MARKER_TABLES) {
    const lead = new RegExp(`ON\\s+(?:public\\.)?${t}\\s*\\(\\s*status`, 'i');
    const implicit = new RegExp(`ON\\s+(?:public\\.)?${t}\\s*\\(\\s*[A-Za-z_][A-Za-z0-9_]*\\s*\\)\\s*WHERE\\s+status\\s*=\\s*'[^']*'`, 'i');
    for (const f of migFiles) {
      if (INDEX_FILES.includes(f)) continue;
      const text = migText.get(f)!;
      if (lead.test(text) || implicit.test(text)) a6Violations.push(`${f}:${t}`);
    }
  }
  A('A6 四目标表零其他 status 前导/隐式 status 谓词索引', a6Violations.length === 0, a6Violations.join(','));

  // A7 additive-only token 面
  const banned = /\b(DROP|ALTER|INSERT|UPDATE|DELETE)\b/i;
  const a7a = stripped.every((s) => !banned.test(s));
  const gaugeStripped = stripComments(migText.get(GAUGE_FILE)!);
  const a7b = /\bCREATE\s+OR\s+REPLACE\s+FUNCTION\s+gateway_job_gauges\b/i.test(gaugeStripped)
    && /\bREVOKE\b/i.test(gaugeStripped) && /\bGRANT\b/i.test(gaugeStripped)
    && !/\bDROP\s+FUNCTION\b/i.test(gaugeStripped);
  A('A7 四索引迁移零破坏 token·gauge 迁移仅 CREATE OR REPLACE + REVOKE/GRANT·无 DROP FUNCTION', a7a && a7b);

  // A8 既有索引在树（7 项）
  const a8Anchors: Array<[string, string]> = [
    ['0001_baseline.sql', 'CREATE INDEX ix_report_claimable ON ai_report (owner_user_id, status);'],
    ['0001_baseline.sql', 'CREATE INDEX ix_ijob_claim ON interview_job (owner_user_id, status, seq, created_at);'],
    ['0007_resume_quiz.sql', 'CREATE INDEX IF NOT EXISTS ix_quizjob_claim ON quiz_job (owner_user_id, status, created_at);'],
    ['0008_resume_diagnosis.sql', 'CREATE INDEX IF NOT EXISTS ix_diagnosisjob_claim ON diagnosis_job (owner_user_id, status, created_at);'],
    ['0010_consumption_stale_lease_idx.sql', 'ix_consumption_stale_lease'],
    ['0211_outbox_unsettled_partial.sql', 'ix_outbox_unsettled'],
    ['0132_job_route_classify_worker_dispatch.sql', 'ix_job_semantic_revision_route_pending'],
  ];
  const a8 = a8Anchors.every(([f, needle]) => migText.get(f)?.includes(needle) === true);
  A('A8 七项既有索引定义在树未被触碰', a8,
    a8Anchors.filter(([f, n]) => migText.get(f)?.includes(n) !== true).map(([f]) => f).join(','));

  // A9 gauge 定义点唯一性（迁移目录内恰 2 处）+ 单 RETURN QUERY + v_cutoff 入口单次
  const gaugeDefs = migFiles.filter((f) => /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+gateway_job_gauges\s*\(/i.test(migText.get(f)!));
  const noTfSibling = migFiles.every((f) => !/FUNCTION\s+tf_gateway_job_gauges\b/i.test(stripComments(migText.get(f)!)));
  const gaugeBody = stripComments(migText.get(GAUGE_FILE)!);
  const rqCount = (gaugeBody.match(/RETURN\s+QUERY/gi) ?? []).length;
  const cutoffCount = (gaugeBody.match(/v_cutoff\s+timestamptz\s*:=\s*clock_timestamp\s*\(\s*\)/gi) ?? []).length;
  A('A9 gauge 迁移域定义点恰 2（0042+0224）·零 tf_ 兄弟·0224 恰一条 RETURN QUERY·v_cutoff 入口单次',
    gaugeDefs.length === 2 && gaugeDefs.includes('0042_runtime_observability_gateway.sql') && gaugeDefs.includes(GAUGE_FILE)
    && noTfSibling && rqCount === 1 && cutoffCount === 1,
    `defs=${gaugeDefs.join(',')} rq=${rqCount} cutoff=${cutoffCount}`);
  PIN('gauge_stale_mirror_registered', GAUGE_MIRROR_STALE);

  if (failures > 0) {
    console.error('✗ static gates red — abort before database phases');
    process.exit(1);
  }

  // ══ 主夹具库 ══
  const db = await freshDatabase(admin, MAIN_DB);
  {
    const c = await db.connect();
    try {
      await c.query('BEGIN');
      await seedMainFixture(c);
      await c.query('COMMIT');
    } catch (e) {
      await c.query('ROLLBACK').catch(() => {});
      throw e;
    } finally {
      c.release();
    }
  }
  for (const t of [...MARKER_TABLES, 'interview', 'entitlement_consumption']) await db.query(`ANALYZE ${t}`);

  // ══ B1-B11 元数据 ══
  section('B 元数据（B1-B11）');
  for (const t of MARKER_TABLES) {
    const r = await db.query(
      'SELECT tablename FROM pg_indexes WHERE schemaname = $1 AND indexname = $2', ['public', NEW_INDEXES.get(t)!.index]);
    A(`B1-${t} 索引存在且落对应表`, r.rowCount === 1 && r.rows[0].tablename === t, `got=${r.rows[0]?.tablename}`);
  }
  {
    const r = await db.query(
      `SELECT c.relname AS name, i.indisvalid AS valid, i.indisready AS ready
         FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
        WHERE c.relname = ANY($1)`, [names]);
    const byName = new Map(r.rows.map((row) => [String(row.name), row]));
    A('B5 四索引 indisvalid 全真', names.every((n) => byName.get(n)?.valid === true));
    A('B6 四索引 indisready 全真', names.every((n) => byName.get(n)?.ready === true));
  }
  {
    const rows = await db.query(
      'SELECT pg_get_indexdef(indexrelid) AS def FROM pg_index WHERE indexrelid = ANY($1::regclass[])',
      [names.map((n) => `public.${n}`)]);
    let ok = 0;
    for (const row of rows.rows) {
      const def = String(row.def);
      const body = def.slice(def.toUpperCase().indexOf(' USING '));
      if (body.toLowerCase().includes('(status, lease_expires_at)') && !/\bwhere\b/i.test(body)) ok += 1;
    }
    A('B7-B10 四索引定义逐字两列无谓词（pg_get_indexdef）', ok === 4, `ok=${ok}`);
  }
  {
    const ij = await tableCounts(db, 'interview_job');
    const qz = await tableCounts(db, 'quiz_job');
    const dg = await tableCounts(db, 'diagnosis_job');
    const rp = await tableCounts(db, 'ai_report');
    const cons = await db.query(
      `SELECT count(*) FILTER (WHERE status='reserved' AND lease_expires_at < now()) AS rsv,
              count(*) FILTER (WHERE status='confirmed') AS cf FROM entitlement_consumption`);
    const ivw = await db.query('SELECT count(*)::int AS n FROM interview WHERE owner_user_id = $1', [CTRL_OWNER]);
    const b11 = Number(ij.total) === IJOB_MAIN_TOTAL && Number(ij.done) === IJOB_MAIN_DONE
      && Number(ij.queued) === IJOB_MAIN_QUEUED && Number(ij.running) === IJOB_MAIN_RUNNING
      && Number(ij.failed) === FAILED_MAIN
      && Number(qz.total) === OTHER_MAIN_TOTAL && Number(dg.total) === OTHER_MAIN_TOTAL && Number(rp.total) === OTHER_MAIN_TOTAL
      && Number(qz.failed) === FAILED_MAIN && Number(dg.failed) === FAILED_MAIN && Number(rp.ready) === DONE_SPREAD && Number(rp.quarantined) === FAILED_MAIN
      && Number(cons.rows[0].rsv) === CONS_RESERVED && Number(cons.rows[0].cf) === CONS_CONFIRMED
      && Number(ivw.rows[0].n) === CTRL_QUEUED + CTRL_RUNEXP_RQ + CTRL_RUNEXP_DEAD;
    A('B11 四表计数与夹具合同全等 + 控制组计数全等', b11,
      `ij=${JSON.stringify(ij)} qz=${JSON.stringify(qz)} dg=${JSON.stringify(dg)} rp=${JSON.stringify(rp)} cons=${JSON.stringify(cons.rows[0])}`);
  }
  if (failures > 0) {
    console.error('✗ metadata gates red — abort before plan phases');
    process.exit(1);
  }

  // ══ B12-B15 dispatch 默认计划 ══
  section('B EXPLAIN（B12-B15）');
  const defaultPlans: Record<string, PlanNode[]> = {};
  const runExpiredDefault: Record<string, PlanNode[]> = {};
  for (const t of MARKER_TABLES) {
    const plan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${dispatchSql.get(t)!}`)).rows);
    defaultPlans[t] = plan;
    const flat = JSON.stringify(plan);
    const scans = collectScans(rootNode(plan));
    A(`B12-${t} dispatch 枚举默认计划含对应新索引且目标表零 Seq Scan`,
      flat.includes(NEW_INDEXES.get(t)!.index) && !scans.some((s) => s.nodeType === 'Seq Scan' && s.alias === t),
      `scans=${scans.map((s) => `${s.nodeType}:${s.alias}:${s.indexName ?? ''}`).join(' | ')}`);
  }

  // ══ B16-B19 running-expired 双条件默认计划 + B20 seqscan=off 适用性（只作用此形） ══
  section('B EXPLAIN（B16-B20）');
  for (const t of MARKER_TABLES) {
    const plan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${runExpiredSql(t)}`)).rows);
    runExpiredDefault[t] = plan;
    const newScans = collectScans(rootNode(plan)).filter((s) => s.indexName === NEW_INDEXES.get(t)!.index);
    const twoCol = newScans.some((s) => (s.indexCond ?? '').includes('status') && (s.indexCond ?? '').includes('lease_expires_at'));
    A(`B16-${t} running-expired 双条件默认计划 Index Cond 同含 status+lease_expires_at（两列判据）`, twoCol,
      `cond=${newScans.map((s) => s.indexCond).join(' | ')}`);
  }
  {
    const seqOffPlans: Record<string, PlanNode[]> = {};
    const selfChecks: boolean[] = [];
    const client = await db.connect();
    try {
      for (const t of MARKER_TABLES) {
        await client.query('BEGIN');
        await client.query('SET LOCAL enable_seqscan = off');
        const setting = await client.query('SELECT current_setting($1) AS s', ['enable_seqscan']);
        const plan = asPlan((await client.query(`EXPLAIN (FORMAT JSON) ${runExpiredSql(t)}`)).rows);
        await client.query('ROLLBACK');
        seqOffPlans[t] = plan;
        selfChecks.push(String(setting.rows[0].s) === 'off');
      }
    } finally {
      client.release();
    }
    const norm = (plans: PlanNode[]) => JSON.stringify(collectScans(rootNode(plans))
      .filter((s) => s.indexName).map((s) => [s.alias, s.indexName, s.indexCond]));
    let same = true;
    for (const t of MARKER_TABLES) {
      const d = norm(runExpiredDefault[t]!);
      const o = norm(seqOffPlans[t]!);
      if (d !== o) {
        same = false;
        console.log(`PIN  b20_plan_mismatch_${t}_default=${d}`);
        console.log(`PIN  b20_plan_mismatch_${t}_seqoff=${o}`);
      }
    }
    A('B20 B16-B19 形 enable_seqscan=off 前后计划一致（同索引名同 Index Cond）且自检确为 off',
      same && selfChecks.every(Boolean), `same=${same} self=${selfChecks.join(',')}`);
  }

  // ══ 首跑六轮夹具校准自检（任一轮红 = 仪器红 exit 1） ══
  section('首跑六轮夹具校准（ANALYZE×6 + EXPLAIN B32/B34/B35 三查询）');
  const judgeShape = (label: string, plans: PlanNode[], alias: string, newIndex: string): boolean => {
    const scans = collectScans(rootNode(plans));
    const red = redForms(scans, alias, newIndex);
    if (red.armRed) console.log(`  [calib] ${label} armRed: ${alias}-归属臂 Index Name=${newIndex}`);
    if (red.filterRed) console.log(`  [calib] ${label} filterRed: ${alias}-归属 heap/Index Scan Filter 含 owner_user_id`);
    return !red.armRed && !red.filterRed;
  };
  let calibrationGreen = true;
  for (let round = 1; round <= 6; round += 1) {
    for (const t of MARKER_TABLES) await db.query(`ANALYZE ${t}`);
    const claimPlan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${claimShapeSql}`)).rows);
    const sweepPlan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${sweepDeadSql}`)).rows);
    const livePlan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${liveSql}`)).rows);
    const green = judgeShape(`b32#${round}`, claimPlan, 'j', NEW_INDEXES.get('interview_job')!.index)
      && judgeShape(`b34#${round}`, sweepPlan, 'interview_job', NEW_INDEXES.get('interview_job')!.index)
      && judgeShape(`b35#${round}`, livePlan, 'live', NEW_INDEXES.get('interview_job')!.index);
    console.log(`PIN  calibration_round_${round}=${green ? 'green' : 'RED'}`);
    console.log(`PIN  calibration_round_${round}_claim_json=${JSON.stringify(claimPlan)}`);
    console.log(`PIN  calibration_round_${round}_sweep_json=${JSON.stringify(sweepPlan)}`);
    console.log(`PIN  calibration_round_${round}_live_json=${JSON.stringify(livePlan)}`);
    calibrationGreen = calibrationGreen && green;
  }
  if (!calibrationGreen) {
    console.error('✗ instrument red: fixture calibration failed — fix fixture and re-review, rerun (no assertion edits)');
    process.exit(1);
  }
  console.log('PASS  B32/B34/B35 首跑六轮夹具校准全绿（三段全破夹具达判别力·仪器门不计入 45 项 tally）');

  // ══ B23-B30 gauge 子查询默认计划 ══
  section('B EXPLAIN（B23-B30）');
  for (const t of MARKER_TABLES) {
    const { index } = NEW_INDEXES.get(t)!;
    const queuedPlan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) SELECT count(*) FROM ${t} WHERE status='queued'`)).rows);
    const queuedIdx = collectScans(rootNode(queuedPlan)).filter((s) => s.indexName).map((s) => s.indexName);
    A(`B23-${t} gauge queued 子查询默认计划含对应新索引（或 index-only）`, queuedIdx.includes(index),
      `idx=${queuedIdx.join('|')}`);
    const runPlan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${runExpiredSql(t)}`)).rows);
    const runScans = collectScans(rootNode(runPlan)).filter((s) => s.indexName === index);
    A(`B27-${t} gauge running-expired 子查询两列 Index Cond（status+lease_expires_at）`,
      runScans.some((s) => (s.indexCond ?? '').includes('status') && (s.indexCond ?? '').includes('lease_expires_at')),
      `cond=${runScans.map((s) => s.indexCond).join(' | ')}`);
  }

  await mainDbBehaviorPhases(db);

  // ══ 稳态夹具相（B31/B33 专用·同库 TRUNCATE 后重种单 owner 400k 终态形） ══
  section('稳态夹具（单 owner 400k 终态）+ B31/B33');
  await db.query('TRUNCATE interview_job, quiz_job, diagnosis_job, ai_report, entitlement_consumption, commerce_outbox, interview CASCADE');
  {
    const c = await db.connect();
    try {
      await c.query('BEGIN');
      await seedSteadyFixture(c);
      await c.query('COMMIT');
    } catch (e) {
      await c.query('ROLLBACK').catch(() => {});
      throw e;
    } finally {
      c.release();
    }
  }
  // 仪器基线对齐（席测 33.1ms 口径 = VACUUM 后 Index Only Scan·Heap Fetches 0）：终态相先 VACUUM 置
  // 全可见位，再各预热一拍消冷缓存，然后才计时。读数与扫描形态逐表登记。
  for (const t of MARKER_TABLES) await db.query(`VACUUM (ANALYZE) ${t}`);
  {
    const client = await db.connect();
    let heapFetches = 0;
    const b31PerTable: Record<string, { setting: string; idxUsed: boolean; execMs: number }> = {};
    try {
      for (const t of MARKER_TABLES) {
        const { index, deadStatus } = NEW_INDEXES.get(t)!;
        await db.query(`SELECT count(*) FROM ${t} WHERE status='${deadStatus}'`);
        await client.query('BEGIN');
        await client.query('SET LOCAL enable_seqscan = off');
        const setting = await client.query('SELECT current_setting($1) AS s', ['enable_seqscan']);
        // 计时采样协议（固定规则·全样本入收据）：VACUUM + 预热后连测 3 拍取中位数——30ms 基线与本机
        // IOS 计时噪声（±10%）同量级，单拍采样会由噪声裁决；中位数是固定规则，非 best-of。
        const samples: number[] = [];
        let scanList: ScanHit[] = [];
        let heapFetchedThisTable = 0;
        for (let sample = 0; sample < 3; sample += 1) {
          const plan = asPlan((await client.query(`EXPLAIN (ANALYZE, FORMAT JSON) SELECT count(*) FROM ${t} WHERE status='${deadStatus}'`)).rows);
          const rawExec = plan[0]?.['Execution Time'];
          if (typeof rawExec !== 'number') throw new Error('jqidx_exec_time_missing');
          samples.push(rawExec);
          scanList = collectScans(rootNode(plan));
          for (const node of walkAll(rootNode(plan))) {
            if (typeof node['Heap Fetches'] === 'number') heapFetchedThisTable += node['Heap Fetches'] as number;
          }
        }
        await client.query('ROLLBACK');
        samples.sort((a, b) => a - b);
        const execMs = samples[1]!;
        const idxUsed = scanList.some((s) => s.indexName === index);
        heapFetches += heapFetchedThisTable;
        console.log(`PIN  b31_${t}_samples_ms=${samples.map((x) => x.toFixed(2)).join('/')} median_ms=${execMs.toFixed(2)} scan_shape=${JSON.stringify(scanList.filter((x) => x.indexName).map((x) => `${x.nodeType}:${x.indexName}`))}`);
        b31PerTable[t] = { setting: String(setting.rows[0].s), idxUsed, execMs };
      }
    } finally {
      client.release();
    }
    PIN('steady_heap_fetches_sum', heapFetches);
    const b31Ok = MARKER_TABLES.every((t) => {
      const r = b31PerTable[t]!;
      return r.setting === 'off' && r.idxUsed && r.execMs <= DEAD_MS_CAP;
    });
    A('B31 终态子查询（四表·seqscan off 自检 off·VACUUM 后预热一拍）全部走对应新索引且 ≤33.1ms 对比表上限',
      b31Ok, JSON.stringify(b31PerTable));
  }
  {
    const steadyClaimShape = claimShapeSql.replaceAll(`'${CTRL_OWNER}'`, `'${STEADY_OWNER}'`);
    const plan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${steadyClaimShape}`)).rows);
    const flat = JSON.stringify(plan);
    const scans = collectScans(rootNode(plan));
    const terminalSeq = scans.filter((s) => s.nodeType === 'Seq Scan')
      .map((s) => `${s.alias}(est=${s.planRows ?? s.actualRows})`);
    console.log(`PIN  b33_antijoin_plan_digest=${JSON.stringify({
      seqScans: terminalSeq,
      jScans: scans.filter((s) => s.alias === 'j').map((s) => `${s.nodeType}:${s.indexName ?? 'heap'}`),
      allScans: scans.map((s) => ({ a: s.alias, n: s.nodeType, i: s.indexName, rows: s.planRows ?? s.actualRows })),
    })}`);
    A('B33 登记臂有效性自检：终态 anti-join 计划含终端臂 Seq Scan（O(终态集) 登记·不判红）',
      flat.includes('Seq Scan') && terminalSeq.length > 0, `seq=${terminalSeq.join(',')}`);
  }

  // ══ 收尾登记 ══
  section('收据登记');
  {
    const dead = await db.query(
      `SELECT relname, n_dead_tup::bigint AS dead, n_tup_upd::bigint AS upd, n_tup_hot_upd::bigint AS hot
         FROM pg_stat_user_tables WHERE relname = ANY($1)`,
      [MARKER_TABLES]);
    for (const row of dead.rows) PIN(`n_dead_tup_${row.relname}`, { dead: row.dead, upd: row.upd, hot: row.hot });
  }
  console.log(`${fencedSeen === 0 ? 'PASS' : 'FAIL'}  interview_privacy_fenced 零出现（B32/B34 真执行收据登记·异常路径已 fail-closed·不计入 45 项 tally） seen=${fencedSeen}`);
  if (fencedSeen !== 0) failures += 1;

  console.log(`\n${failures === 0 ? '✓' : '✗'} job-queue-index — 45 项 prove 完成（44 判红 + 1 登记臂·失败 ${failures}）`);
  process.exit(failures === 0 ? 0 : 1);
}

/** 主库真行为相（B21/B32/B34/B35/B36 + 心跳写代价探针）。 */
async function mainDbBehaviorPhases(db: DbPool): Promise<void> {
  section('B21 gauge 数值等价（同会话 superuser/row_security=off）');
  {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL row_security = off');
      await pinRoleState(client, 'b21');
      const live = await client.query(
        `SELECT 'interview_job'::text AS queue,
           count(*) FILTER (WHERE j.status = 'queued')::bigint AS queued,
           count(*) FILTER (WHERE j.status = 'running' AND j.lease_expires_at < clock_timestamp())::bigint AS running_expired,
           count(*) FILTER (WHERE j.status = 'failed')::bigint AS dead FROM public.interview_job AS j
         UNION ALL
         SELECT 'report'::text,
           count(*) FILTER (WHERE r.status = 'queued')::bigint,
           count(*) FILTER (WHERE r.status = 'running' AND r.lease_expires_at < clock_timestamp())::bigint,
           count(*) FILTER (WHERE r.status = 'quarantined')::bigint FROM public.ai_report AS r
         UNION ALL
         SELECT 'quiz_job'::text,
           count(*) FILTER (WHERE q.status = 'queued')::bigint,
           count(*) FILTER (WHERE q.status = 'running' AND q.lease_expires_at < clock_timestamp())::bigint,
           count(*) FILTER (WHERE q.status = 'failed')::bigint FROM public.quiz_job AS q
         UNION ALL
         SELECT 'diagnosis_job'::text,
           count(*) FILTER (WHERE d.status = 'queued')::bigint,
           count(*) FILTER (WHERE d.status = 'running' AND d.lease_expires_at < clock_timestamp())::bigint,
           count(*) FILTER (WHERE d.status = 'failed')::bigint FROM public.diagnosis_job AS d`);
      const gauges = await client.query('SELECT * FROM gateway_job_gauges()');
      const key = (row: Record<string, unknown>) => `${row.queue}:${row.queued}:${row.running_expired}:${row.dead}`;
      const oldSet = live.rows.map(key).sort().join('|');
      const newSet = gauges.rows.map(key).sort().join('|');
      A('B21 gauge 四行四列与 0042 原 FILTER 查询逐值全等（单 RETURN QUERY 单快照·同会话）',
        live.rowCount === 4 && gauges.rowCount === 4 && oldSet === newSet, `old=${oldSet} new=${newSet}`);
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }

  section('B22 gauge 元数据/ACL/运行时结构自检');
  {
    const meta = await db.query(
      `SELECT prosecdef AS sd, proowner::regrole::text AS owner,
              pg_get_function_result('gateway_job_gauges()'::regprocedure) AS result_sig,
              pg_get_functiondef('gateway_job_gauges()'::regprocedure) AS def
         FROM pg_proc WHERE oid = 'gateway_job_gauges()'::regprocedure`);
    const row = meta.rows[0];
    PIN('b22_proowner_role', row.owner);
    const grant = await db.query("SELECT has_function_privilege('app_gateway_role','gateway_job_gauges()','EXECUTE') AS ok");
    const body = String(row.def);
    const beginIdx = body.indexOf('BEGIN');
    const endIdx = body.lastIndexOf('END');
    const inner = body.slice(beginIdx + 5, endIdx);
    const rq = (body.match(/RETURN\s+QUERY/g) ?? []).length;
    const stmtCount = (inner.match(/;/g) ?? []).length;
    const argTypes = await db.query(
      `SELECT array_to_string(proallargtypes::regtype[]::text[], ',') AS sig FROM pg_proc
        WHERE oid = 'gateway_job_gauges()'::regprocedure`);
    A('B22 prosecdef/owner(0042 落库属主·OR REPLACE 保持)/EXECUTE 授权/返回列全串逐字/RETURN QUERY=1/单语句体',
      row.sd === true && String(row.result_sig) === 'TABLE(queue text, queued bigint, running_expired bigint, dead bigint)'
      && grant.rows[0].ok === true && rq === 1 && stmtCount === 1,
      `sd=${row.sd} owner=${row.owner} sig=${row.result_sig} rq=${rq} stmts=${stmtCount} args=${argTypes.rows[0].sig}`);
  }

  section('B36 四 dispatch 查询真执行 → 四新索引 idx_scan 增量（独立 autocommit 协议）');
  {
    const pre: Record<string, number> = {};
    for (const t of MARKER_TABLES) pre[t] = await readIdxScan(db, t, NEW_INDEXES.get(t)!.index);
    for (const t of MARKER_TABLES) await db.query(dispatchSql.get(t)!);
    const post: Record<string, number> = {};
    for (const t of MARKER_TABLES) post[t] = await readIdxScan(db, t, NEW_INDEXES.get(t)!.index);
    const deltas = MARKER_TABLES.map((t) => ({ t, delta: post[t]! - pre[t]! }));
    PIN('b36_idx_scan_deltas', deltas);
    A('B36 四新索引 idx_scan 增量全 ≥1（真执行·EXPLAIN-only 不计数）',
      deltas.every((d) => d.delta >= 1), deltas.map((d) => `${d.t}:${d.delta}`).join(' '));
  }

  section('B32 claim 按别名真执行（EXPLAIN ANALYZE·SET LOCAL·ROLLBACK）');
  {
    const allIjobIndexes = (await db.query(
      "SELECT indexname FROM pg_indexes WHERE schemaname='public' AND tablename='interview_job'")).rows
      .map((r) => String(r.indexname));
    const preAll: Record<string, number> = {};
    for (const n of allIjobIndexes) preAll[n] = await readIdxScan(db, 'interview_job', n);
    const before = await db.query(
      `SELECT interview_id, status, lease_expires_at FROM interview_job WHERE owner_user_id = $1
        AND interview_id LIKE 'sqa%' ORDER BY interview_id`, [CTRL_OWNER]);
    const runBefore = await db.query(
      'SELECT count(*)::int AS n FROM interview_job WHERE owner_user_id = $1 AND status=\'running\'', [CTRL_OWNER]);

    const client = await db.connect();
    let plan: PlanNode[] = [];
    let runAfter = -1;
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL app.principal_user = '${CTRL_OWNER}'`);
      await pinRoleState(client, 'b32_tx');
      plan = asPlan((await client.query(`EXPLAIN (ANALYZE, FORMAT JSON) ${claimShapeSql}`)).rows);
      const after = await client.query(
        'SELECT count(*)::int AS n FROM interview_job WHERE owner_user_id = $1 AND status=\'running\'', [CTRL_OWNER]);
      runAfter = Number(after.rows[0].n);
      await client.query('ROLLBACK');
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {});
      watchFenced(e);
    } finally {
      client.release();
    }
    const updatedRows = runAfter - Number(runBefore.rows[0].n);
    PIN('b32_claim_update_rows', updatedRows);
    PIN('b32_claim_plan_json', JSON.stringify(plan));

    const scans = collectScans(rootNode(plan));
    const jScans = scans.filter((s) => s.alias === 'j');
    const armOk = jScans.every((s) => s.indexName === undefined
      || s.indexName === 'ix_ijob_claim' || (s.indexCond ?? '').includes('owner_user_id'));
    const filterOk = !jScans.some((s) => (s.filter ?? '').includes('owner_user_id'));
    const analyzed = jScans.some((s) => (s.actualLoops ?? 0) >= 1)
      || typeof rootNode(plan)['Actual Loops'] === 'number';
    const red = redForms(scans, 'j', 'ix_ijob_status_lease');
    const afterRollback = await db.query(
      `SELECT interview_id, status, lease_expires_at FROM interview_job WHERE owner_user_id = $1
        AND interview_id LIKE 'sqa%' ORDER BY interview_id`, [CTRL_OWNER]);
    const restored = JSON.stringify(before.rows) === JSON.stringify(afterRollback.rows);
    const crossDelta: Record<string, number> = {};
    for (const n of allIjobIndexes) crossDelta[n] = (await readIdxScan(db, 'interview_job', n)) - preAll[n]!;
    PIN('b32_claim_idx_scan_cross_delta', crossDelta);
    A('B32 claim 真执行（UPDATE 行数≥1·Actual Loops≥1）+ Alias=j 子树全 claim/owner 前导 + j heap Filter 无 owner_user_id + ROLLBACK 复原',
      analyzed && updatedRows >= 1 && armOk && filterOk && restored,
      `analyzed=${analyzed} rows=${updatedRows} armOk=${armOk} filterOk=${filterOk} restored=${restored} red=${JSON.stringify(red)}`);
  }

  section('B34 sweep 两 UPDATE 真执行 → ix_ijob_claim idx_scan 增量各 ≥1（独立 autocommit 协议）');
  {
    const snap = async () => (await db.query(
      `SELECT interview_id, status, lease_expires_at, attempts FROM interview_job
        WHERE owner_user_id = $1 AND status='running' AND interview_id LIKE 'sqa%' ORDER BY interview_id`, [CTRL_OWNER])).rows;
    const sweepPlan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${sweepDeadSql}`)).rows);
    console.log(`PIN  b34_aux_red_forms=${JSON.stringify(redForms(collectScans(rootNode(sweepPlan)), 'interview_job', 'ix_ijob_status_lease'))}`);

    const preDead = await readIdxScan(db, 'interview_job', 'ix_ijob_claim');
    const snapDead = await snap();
    let deadRows = -1;
    {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query(`SET LOCAL app.principal_user = '${CTRL_OWNER}'`);
        await pinRoleState(client, 'b34_tx');
        const r = await client.query(sweepDeadSql);
        deadRows = r.rowCount ?? 0;
        await client.query('ROLLBACK');
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        watchFenced(e);
      } finally {
        client.release();
      }
    }
    const postDead = await readIdxScan(db, 'interview_job', 'ix_ijob_claim');
    const restoredDead = JSON.stringify(snapDead) === JSON.stringify(await snap());

    const preRq = await readIdxScan(db, 'interview_job', 'ix_ijob_claim');
    let rqRows = -1;
    {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query(`SET LOCAL app.principal_user = '${CTRL_OWNER}'`);
        await pinRoleState(client, 'b34_rq_tx');
        const r = await client.query(sweepRqSql);
        rqRows = r.rowCount ?? 0;
        await client.query('ROLLBACK');
      } catch (e) {
        await client.query('ROLLBACK').catch(() => {});
        watchFenced(e);
      } finally {
        client.release();
      }
    }
    const postRq = await readIdxScan(db, 'interview_job', 'ix_ijob_claim');
    PIN('b34_idx_scan_readings', { preDead, postDead, deltaDead: postDead - preDead, preRq, postRq, deltaRq: postRq - preRq });
    PIN('b34_update_rows', { dead: deadRows, rq: rqRows });
    A('B34 sweep dead/rq 两 UPDATE 各自真执行（行数≥1·fenced 零出现·复原）+ ix_ijob_claim idx_scan 增量各 ≥1',
      deadRows >= 1 && rqRows >= 1 && (postDead - preDead) >= 1 && (postRq - preRq) >= 1 && restoredDead,
      `dead=${deadRows}(+${postDead - preDead}) rq=${rqRows}(+${postRq - preRq}) restored=${restoredDead}`);
  }

  section('B35 live-count 守卫真执行 → ix_ijob_claim idx_scan 增量 ≥1');
  {
    const livePlan = asPlan((await db.query(`EXPLAIN (FORMAT JSON) ${liveSql}`)).rows);
    console.log(`PIN  b35_aux_red_forms=${JSON.stringify(redForms(collectScans(rootNode(livePlan)), 'live', 'ix_ijob_status_lease'))}`);
    console.log(`PIN  b35_plan_json=${JSON.stringify(livePlan)}`);
    const pre = await readIdxScan(db, 'interview_job', 'ix_ijob_claim');
    const r = await db.query(liveSql);
    const post = await readIdxScan(db, 'interview_job', 'ix_ijob_claim');
    PIN('b35_idx_scan_readings', { pre, post, delta: post - pre, liveCount: Number(r.rows[0].n) });
    A('B35 live 守卫真执行 + ix_ijob_claim idx_scan 增量 ≥1（三段全破夹具未过期段 ≥50k ⇒ 成本可分辨 claim 臂应胜）',
      (post - pre) >= 1, `delta=${post - pre}`);
  }

  section('心跳 UPDATE 写代价探针（n_tup_upd / n_tup_hot_upd 改前 >0 → 改后 0）');
  await heartbeatProbe(db);
}

/** 心跳探针：同形续租 UPDATE 200 次/相，先无索引相（HOT 可用）再建 (status, lease) 索引相（HOT 失效）。 */
async function heartbeatProbe(db: DbPool): Promise<void> {
  await db.query(`CREATE TABLE jqidx_heartbeat_probe (
    id int PRIMARY KEY, owner_user_id text NOT NULL, status text NOT NULL,
    lease_expires_at timestamptz, filler text NOT NULL DEFAULT 'x')`);
  await db.query(`INSERT INTO jqidx_heartbeat_probe (id, owner_user_id, status, lease_expires_at)
    SELECT g, 'sqprobe', 'running', now() + interval '10 minutes' FROM generate_series(1, 100) g`);
  await db.query('ANALYZE jqidx_heartbeat_probe');
  const stats = async () => (await db.query(
    "SELECT n_tup_upd::bigint AS upd, n_tup_hot_upd::bigint AS hot, n_dead_tup::bigint AS dead FROM pg_stat_user_tables WHERE relname='jqidx_heartbeat_probe'")).rows[0];
  const ids = Array.from({ length: 100 }, (_, i) => i + 1);
  const renew = async () => {
    for (let round = 0; round < 2; round += 1) {
      await db.query(
        `UPDATE jqidx_heartbeat_probe SET lease_expires_at = now() + interval '120 seconds'
          WHERE id = ANY($1::int[]) AND owner_user_id = 'sqprobe' AND status = 'running'`, [ids]);
    }
  };
  await db.query('SELECT pg_stat_force_next_flush()');
  const pre = await stats();
  await renew();
  await db.query('SELECT pg_stat_force_next_flush()');
  const mid = await stats();
  await db.query('CREATE INDEX ix_jqidx_probe_status_lease ON jqidx_heartbeat_probe (status, lease_expires_at)');
  await renew();
  await db.query('SELECT pg_stat_force_next_flush()');
  const post = await stats();
  const reading = {
    updBefore: Number(mid.upd) - Number(pre.upd),
    hotBefore: Number(mid.hot) - Number(pre.hot),
    updAfter: Number(post.upd) - Number(mid.upd),
    hotAfter: Number(post.hot) - Number(mid.hot),
  };
  PIN('heartbeat_n_tup_readings', reading);
  await db.query('DROP TABLE jqidx_heartbeat_probe');
  A('心跳写代价：无索引相 200 次 n_tup_hot_upd 增量 >0；建 (status, lease) 后同形 200 次 hot 增量 =0（n_tup_upd=200）',
    reading.updBefore === 200 && reading.hotBefore > 0 && reading.updAfter === 200 && reading.hotAfter === 0,
    `before(upd=${reading.updBefore},hot=${reading.hotBefore}) after(upd=${reading.updAfter},hot=${reading.hotAfter})`);
}

/** 主夹具种子（replica 会话·INSERT 触发器旁路·会话结束复原）。 */
async function seedMainFixture(c: Client): Promise<void> {
  await c.query('SET session_replication_role = replica');
  try {
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'sqd' || g, 'start', 0, 'done', 1 FROM generate_series(0, ${DONE_SPREAD - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'sqfam', CASE WHEN g < ${FAMILY_ROWS / 2} THEN 'start' ELSE 'answer' END,
              CASE WHEN g < ${FAMILY_ROWS / 2} THEN 0 ELSE 1 END, 'done', 1
         FROM generate_series(0, ${FAMILY_ROWS - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'sqq' || g, 'start', 0, 'queued', 0 FROM generate_series(0, ${QUEUED_SEG - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'sqre' || g, 'start', 0, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(0, ${RUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'sqru' || g, 'start', 0, 'running', 0, 'sq-live', now() + interval '1 hour'
         FROM generate_series(0, ${RUNUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT 'sqo' || g, 'sqf' || g, 'start', 0, 'failed', ${CLAIM_MAX_ATTEMPTS} FROM generate_series(0, ${FAILED_MAIN - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT '${CTRL_OWNER}', 'sqaq' || g, 'start', 0, 'queued', 0 FROM generate_series(1, ${CTRL_QUEUED}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts, lease_owner, lease_expires_at)
       SELECT '${CTRL_OWNER}', 'sqare' || g, 'start', 0, 'running', 0, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(1, ${CTRL_RUNEXP_RQ}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts, lease_owner, lease_expires_at)
       SELECT '${CTRL_OWNER}', 'sqarx' || g, 'start', 0, 'running', ${CLAIM_MAX_ATTEMPTS}, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(1, ${CTRL_RUNEXP_DEAD}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT '${CTRL_OWNER}', 'sqad' || g, 'start', 0, 'done', 1 FROM generate_series(1, ${CTRL_DONE}) g`);
    await c.query(
      `INSERT INTO interview (id, owner_user_id, status)
       SELECT 'sqaq' || g, '${CTRL_OWNER}', 'active' FROM generate_series(1, ${CTRL_QUEUED}) g
       UNION ALL SELECT 'sqare' || g, '${CTRL_OWNER}', 'active' FROM generate_series(1, ${CTRL_RUNEXP_RQ}) g
       UNION ALL SELECT 'sqarx' || g, '${CTRL_OWNER}', 'active' FROM generate_series(1, ${CTRL_RUNEXP_DEAD}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zqd' || g, 'done', 1, NULL, NULL FROM generate_series(0, ${DONE_SPREAD - 1}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zqq' || g, 'queued', 0 FROM generate_series(0, ${QUEUED_SEG - 1}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zqre' || g, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(0, ${RUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zqru' || g, 'running', 0, 'sq-live', now() + interval '1 hour'
         FROM generate_series(0, ${RUNUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts)
       SELECT 'sqo' || g, 'zqf' || g, 'failed', 5 FROM generate_series(0, ${FAILED_MAIN - 1}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zdd' || g, 'done', 1, NULL, NULL FROM generate_series(0, ${DONE_SPREAD - 1}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zdq' || g, 'queued', 0 FROM generate_series(0, ${QUEUED_SEG - 1}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zdre' || g, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(0, ${RUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'zdru' || g, 'running', 0, 'sq-live', now() + interval '1 hour'
         FROM generate_series(0, ${RUNUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts)
       SELECT 'sqo' || g, 'zdf' || g, 'failed', 5 FROM generate_series(0, ${FAILED_MAIN - 1}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'rpd' || g, 'ready', 1, NULL, NULL FROM generate_series(0, ${DONE_SPREAD - 1}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'rpq' || g, 'queued', 0 FROM generate_series(0, ${QUEUED_SEG - 1}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'rpre' || g, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(0, ${RUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts, lease_owner, lease_expires_at)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'rpru' || g, 'running', 0, 'sq-live', now() + interval '1 hour'
         FROM generate_series(0, ${RUNUNEXP_SEG - 1}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts)
       SELECT 'sqo' || g, 'rpx' || g, 'quarantined', 5 FROM generate_series(0, ${FAILED_MAIN - 1}) g`);
    await c.query(
      `INSERT INTO entitlement_consumption (owner_user_id, idempotency_key, service_type, units_requested, status, lease_expires_at)
       SELECT '${CTRL_OWNER}', 'sqrsv' || g, 'interview', 1, 'reserved', now() - interval '1 hour'
         FROM generate_series(1, ${CONS_RESERVED}) g`);
    await c.query(
      `INSERT INTO entitlement_consumption (owner_user_id, idempotency_key, service_type, units_requested, status)
       SELECT 'sqo' || (g % ${SPREAD_OWNERS}), 'sqcf' || g, 'interview', 1, 'confirmed'
         FROM generate_series(0, ${CONS_CONFIRMED - 1}) g`);
  } finally {
    await c.query('RESET session_replication_role').catch(() => {});
  }
}

/** 稳态夹具种子（单 owner·400k 终态 + 50k done + 5 queued + 5 running 过期）。 */
async function seedSteadyFixture(c: Client): Promise<void> {
  await c.query('SET session_replication_role = replica');
  try {
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssjf' || g, 'start', 0, 'failed', 5 FROM generate_series(0, ${STEADY_FAILED - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssjd' || g, 'start', 0, 'done', 1 FROM generate_series(0, ${STEADY_DONE - 1}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssjq' || g, 'start', 0, 'queued', 0 FROM generate_series(1, ${STEADY_QUEUED}) g`);
    await c.query(
      `INSERT INTO interview_job (owner_user_id, interview_id, kind, seq, status, attempts, lease_owner, lease_expires_at)
       SELECT '${STEADY_OWNER}', 'ssjr' || g, 'start', 0, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(1, ${STEADY_RUNEXP}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'sszf' || g, 'failed', 5 FROM generate_series(0, ${STEADY_FAILED - 1}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'sszd' || g, 'done', 1 FROM generate_series(0, ${STEADY_DONE - 1}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'sszq' || g, 'queued', 0 FROM generate_series(1, ${STEADY_QUEUED}) g`);
    await c.query(
      `INSERT INTO quiz_job (owner_user_id, quiz_id, status, attempts, lease_owner, lease_expires_at)
       SELECT '${STEADY_OWNER}', 'sszr' || g, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(1, ${STEADY_RUNEXP}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssdf' || g, 'failed', 5 FROM generate_series(0, ${STEADY_FAILED - 1}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssdd' || g, 'done', 1 FROM generate_series(0, ${STEADY_DONE - 1}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssdq' || g, 'queued', 0 FROM generate_series(1, ${STEADY_QUEUED}) g`);
    await c.query(
      `INSERT INTO diagnosis_job (owner_user_id, diagnosis_id, status, attempts, lease_owner, lease_expires_at)
       SELECT '${STEADY_OWNER}', 'ssdr' || g, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(1, ${STEADY_RUNEXP}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssxf' || g, 'quarantined', 5 FROM generate_series(0, ${STEADY_FAILED - 1}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssxd' || g, 'ready', 1 FROM generate_series(0, ${STEADY_DONE - 1}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts)
       SELECT '${STEADY_OWNER}', 'ssxq' || g, 'queued', 0 FROM generate_series(1, ${STEADY_QUEUED}) g`);
    await c.query(
      `INSERT INTO ai_report (owner_user_id, interview_id, status, attempts, lease_owner, lease_expires_at)
       SELECT '${STEADY_OWNER}', 'ssxr' || g, 'running', 2, 'sq-ghost', now() - interval '1 hour'
         FROM generate_series(1, ${STEADY_RUNEXP}) g`);
  } finally {
    await c.query('RESET session_replication_role').catch(() => {});
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
