/**
 * schema 漂移门(drift:prove)——防"改了 sql/ 忘写迁移"导致 fresh deploy 缺表/列/约束。（#175 门恢复 · CI-WIRING）
 *
 * 恢复形注记（2026-10-11·CI-WIRING 裁②=径1）：原门 cd8f7b24 落地，dbhy1（ea4e5796·sql/ 退役 case-B'）
 * 随退役移除（当时 CI→dbhy1:prove 承接）。sql/ 25 文件仍留树为夹具镜像（dbhy1 P3 登记残面），
 * 逐列+UNIQUE/PK 约束比对门自此空缺——#175 即此缺口。本件按原形恢复：
 * 临时库 A 从**全部迁移**建、临时库 B 从**全部 sql/** 建，diff 列 + UNIQUE/PK 约束；
 * **sql/ 有、迁移缺 = 漂移 = 红**（会打断 fresh deploy 的方向）；反向（迁移独有，如 langgraph checkpoints）不算漂移。
 *
 * 对现树的两点适配（均沿 dbhy1 先例·不弱化断言力）：
 *   ① 角色中和扩 app_gateway_role（01_schema.sql:13/:127；dbhy1 P4⑤ 角色中和注记「drift-check 同款」已先扩·本件对齐回原门）；
 *   ② dbhy1 退役残面（死表/夹具滞后）的逐列/约束滞后经 EXEMPTIONS 逐对象登记放行（理由背书 dbhy1 P1/P4⑤ 登记面），
 *      **未登记漂移仍 = 红 = fail-loud**（新门缺件必须 fail-loud；豁免面只收已亲核退役残面）。
 *
 * app_role/app_gateway_role 是 cluster 级角色:临时库里直接复用,既不 DROP(跨库依赖会失败)也不重复 CREATE;
 * 用完 DROP 两个临时库(避免角色跨库依赖污染其它门)。
 * 用法:pnpm drift:prove
 *   未设 PGCONTAINER 时自行拉起一次性容器（默认镜像 pgvector/pgvector:pg16，
 *   名 meetwise-postgres-drift-<pid>，结束后 docker rm -f -v 只拆本容器；
 *   不复用、不启动 meetwise-postgres-dev，避免依赖开发者手工 db:up）。
 *   显式设置 PGCONTAINER 则复用该已运行容器（未在跑 = fail-closed，不自动 db:up）。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { execSync, spawnSync } from 'node:child_process';

const EXPLICIT_CN = (process.env.PGCONTAINER ?? '').trim();
const OWN_CN = `meetwise-postgres-drift-${process.pid}`;
const IMAGE = process.env.DRIFT_PG_IMAGE || 'pgvector/pgvector:pg16';
const CONTAINER_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;
let CN = EXPLICIT_CN || OWN_CN;
let ownedContainer = false;

function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function docker(args, opts = {}) {
  return spawnSync('docker', args, { encoding: 'utf8', ...opts });
}

function assertSafeContainerName(name) {
  if (!CONTAINER_NAME_RE.test(name)) {
    throw new Error(`drift_postgres_invalid_container_name:${name}`);
  }
}

function containerRunning(name) {
  const r = docker(['inspect', '-f', '{{.State.Running}}', name]);
  return r.status === 0 && r.stdout.trim() === 'true';
}

function ensurePostgres() {
  if (EXPLICIT_CN) {
    assertSafeContainerName(EXPLICIT_CN);
    if (!containerRunning(EXPLICIT_CN)) {
      throw new Error(
        `drift_postgres_not_running:PGCONTAINER=${EXPLICIT_CN} 已显式指定但容器未在跑（fail-closed，不自动 db:up）`,
      );
    }
    CN = EXPLICIT_CN;
    ownedContainer = false;
    console.log(`drift:prove 复用已运行容器 PGCONTAINER=${CN}`);
    return;
  }
  assertSafeContainerName(OWN_CN);
  CN = OWN_CN;
  if (containerRunning(CN) || docker(['inspect', CN]).status === 0) {
    docker(['rm', '-f', '-v', CN]);
  }
  const run = docker([
    'run', '-d', '--name', CN,
    '-e', 'POSTGRES_USER=meetwise',
    '-e', 'POSTGRES_PASSWORD=meetwise_dev_password',
    '-e', 'POSTGRES_DB=meetwise',
    IMAGE,
  ]);
  if (run.status !== 0) {
    throw new Error(`drift_postgres_start_failed:${(run.stderr || run.stdout || '').trim()}`);
  }
  ownedContainer = true;
  console.log(`drift:prove 拉起一次性容器 ${CN} image=${IMAGE}`);
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const ready = docker(['exec', CN, 'pg_isready', '-U', 'meetwise', '-d', 'meetwise']);
    if (ready.status === 0) return;
    sleepMs(500);
  }
  throw new Error(`drift_postgres_not_ready:${CN}`);
}

function cleanupOwnContainer() {
  if (!ownedContainer) return;
  const r = docker(['rm', '-f', '-v', CN]);
  console.log(`drift:prove 拆除自建容器 ${CN} rm_exit=${r.status}`);
  ownedContainer = false;
}
const DB_MIG = '_drift_mig', DB_SQL = '_drift_sql';
const ROOT = new URL('..', import.meta.url).pathname;

// dbhy1 退役残面豁免登记（逐对象亲核·理由背书 dbhy1 登记面；未登记缺口=红）。
// 键=表名（该表全部列/UNIQUE-PK 约束缺口按表整体登记·仅收 dbhy1 已 DROP 的死表）。
// 列行形 "表.列"·约束行形 "表 UNIQUE (..)"——键统一取首 token（按 . 或空格切）。
const exemptionKey = (x) => x.split(/[. ]/)[0];
const EXEMPTIONS = new Map([
  ['app_setting', '0145 dbhy1 DROP 死表·sql/ 夹具仍载历史镜像（dbhy1 P1-1/P4⑤ 登记同源）'],
  ['consumption_record', '0145 dbhy1 DROP 死表·sql/ 夹具仍载历史镜像（dbhy1 P1-2/P4⑤ 登记同源）'],
]);

const psql = (db, sql, stopOnErr = true) => {
  try {
    return execSync(`docker exec -i ${CN} psql -U meetwise -d ${db} ${stopOnErr ? '-v ON_ERROR_STOP=1' : ''} -q -f -`,
      { input: sql, stdio: ['pipe', 'pipe', 'pipe'] }).toString();
  } catch (e) {
    const err = (e.stderr ? e.stderr.toString() : e.message);
    const errLines = err.split('\n').filter((l) => /ERROR|FATAL/.test(l)).slice(0, 3).join(' | ') || err.slice(-400);
    throw new Error(`psql[${db}] 失败: ${errLines}`);
  }
};
const psqlAdmin = (sql) => execSync(`docker exec -i ${CN} psql -U meetwise -d postgres -c "${sql}"`, { stdio: 'pipe' }).toString();

// cluster 级角色（app_role/app_gateway_role）跨库共享:中和 DROP、CREATE 幂等化(已存在则跳过)。
const idempotentRole = (s) => s
  .replace(/EXECUTE 'DROP OWNED BY app_role';\s*EXECUTE 'DROP ROLE app_role';/g, 'NULL;')                       // 中和 DROP(临时库无需 drop cluster 角色)
  .replace(/EXECUTE 'DROP OWNED BY app_gateway_role';\s*EXECUTE 'DROP ROLE app_gateway_role';/g, 'NULL;')       // 适配①:dbhy1 已扩·对齐(01_schema.sql:13)
  .replace(/CREATE ROLE app_role NOLOGIN\s*;/gi,
    'DO $ir$ BEGIN CREATE ROLE app_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $ir$;')
  .replace(/CREATE ROLE app_gateway_role NOLOGIN\s*;/gi,
    'DO $ir2$ BEGIN CREATE ROLE app_gateway_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $ir2$;'); // 适配①(01_schema.sql:127)

function loadFrom(dir, db) {
  const files = readdirSync(`${ROOT}${dir}`).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) psql(db, idempotentRole(readFileSync(`${ROOT}${dir}/${f}`, 'utf8')));
}

const COLS_SQL = `SELECT table_name||'.'||column_name FROM information_schema.columns WHERE table_schema='public';`;
const CONS_SQL = `SELECT tc.table_name||' UNIQUE ('||string_agg(kcu.column_name,',' ORDER BY kcu.column_name)||')'
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name AND tc.table_schema=kcu.table_schema
  WHERE tc.table_schema='public' AND tc.constraint_type IN ('UNIQUE','PRIMARY KEY')
  GROUP BY tc.table_name, tc.constraint_name;`;
const rows = (db, q) => new Set(psql(db, `\\pset format unaligned\n\\pset tuples_only on\n${q}`).split('\n').map((s) => s.trim()).filter(Boolean));

function main() {
  try {
    ensurePostgres();
    for (const db of [DB_MIG, DB_SQL]) { try { psqlAdmin(`DROP DATABASE IF EXISTS ${db}`); } catch {} psqlAdmin(`CREATE DATABASE ${db}`); }
    try {
      loadFrom('packages/db/migrations', DB_MIG);   // fresh deploy 路径
      loadFrom('packages/db/sql', DB_SQL);          // 真相(dbhy1 case-B' 后=夹具镜像·退役残面经 EXEMPTIONS 登记)
      let fail = 0;
      const A = (n, c) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
      for (const [label, q] of [['列', COLS_SQL], ['UNIQUE/PK 约束', CONS_SQL]]) {
        const mig = rows(DB_MIG, q), sql = rows(DB_SQL, q);
        const missing = [...sql].filter((x) => !mig.has(x));
        const unregistered = missing.filter((x) => !EXEMPTIONS.has(exemptionKey(x)));
        A(`sql/ 的${label}迁移路径全覆盖(fresh deploy 不缺·退役残面经登记豁免)`, unregistered.length === 0);
        if (missing.length) {
          console.log(`  ${label}缺口 ${missing.length} 项(豁免登记 ${missing.length - unregistered.length}·未登记 ${unregistered.length}):`);
          missing.forEach((m) => console.log(`     - ${m}${EXEMPTIONS.has(exemptionKey(m)) ? '(豁免·' + EXEMPTIONS.get(exemptionKey(m)) + ')' : '(未登记=红·改了 sql/ 忘写迁移?需补增量迁移)'}`));
        }
      }
      console.log(`\n${fail === 0 ? '✓ schema 无漂移:迁移路径覆盖 sql/ 真相(退役残面经登记豁免·fresh deploy 安全)' : '✗ ' + fail + ' 类漂移——补增量迁移或在 EXEMPTIONS 亲核登记后再合并'}`);
      process.exitCode = fail === 0 ? 0 : 1;
    } finally {
      if (!ownedContainer) {
        for (const db of [DB_MIG, DB_SQL]) { try { psqlAdmin(`DROP DATABASE IF EXISTS ${db}`); } catch {} }   // 复用外来容器时只删临时库
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    cleanupOwnContainer();
  }
}
main();
