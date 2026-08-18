/**
 * legacy schema 兼容门(drift:prove)——防"改了 sql/ 演示/单元 fixture 忘写迁移"。
 *
 * 背景:版本化 migrations（迁移）才是 fresh deploy（全新部署）的唯一真相；`packages/db/sql/`
 * 是仍被一部分旧 demo/单元 fixture 使用的兼容镜像，不能用于生产、发布或当前 E2E（端到端）结论。
 * 若只改 sql/ 没写迁移 → fresh deploy(只跑 migrations)建出的库与兼容镜像不一致 → 旧 fixture 可能误导或端点 500(实发:payment_order.idempotency_key、
 * interview_job UNIQUE、admin_audit/question_feedback/learning_progress、user_account.is_admin 全曾漂移)。
 * migrate:prove 只校验"迁移历史 checksum 不被改",抓不到这类漂移;本门补上。
 *
 * 做法:临时库 A 从**全部迁移**建、临时库 B 从**全部 sql/**建,diff 列 + UNIQUE/PK 约束。
 *   **sql/ 有、迁移缺 = 漂移 = 红**(这是会打断 fresh deploy 的方向)。反向(迁移独有,如 LangGraph checkpoints)说明
 *   兼容镜像落后；它不被当作生产正确性证明，相关运行测试必须迁移到完整 migration prefix（迁移前缀）。
 *   app_role 是 cluster 级角色:建库 SQL 里的 CREATE ROLE 幂等化(已存在则跳过);用完 DROP 两个临时库(避免角色跨库依赖污染其它门)。
 *   用法:pnpm drift:prove   (需 docker DB 在跑)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const CN = process.env.PGCONTAINER || 'meetwise-postgres-dev';
const DB_MIG = '_drift_mig', DB_SQL = '_drift_sql';
const ROOT = new URL('..', import.meta.url).pathname;
function assertContainerRunning() {
  if (!/^[A-Za-z0-9_.-]+$/.test(CN))
    throw new Error('drift_postgres_container_name_invalid');
  try {
    const state = execSync(`docker inspect -f '{{.State.Running}}' ${CN}`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();
    if (state !== 'true') throw new Error('not_running');
  } catch {
    throw new Error(`drift_postgres_container_not_running:${CN}; run pnpm db:up or set PGCONTAINER to a disposable running PostgreSQL container`);
  }
}
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

// app_role/app_gateway_role 都是 cluster 级角色(跨库共享):临时库里直接复用,
// 既不 DROP(跨库依赖会失败)也不重复 CREATE。
const idempotentRole = (s) => s
  .replace(/EXECUTE 'DROP OWNED BY app_role';\s*EXECUTE 'DROP ROLE app_role';/g, 'NULL;')   // 中和 DROP(临时库无需 drop cluster 角色)
  .replace(/EXECUTE 'DROP OWNED BY app_gateway_role';\s*EXECUTE 'DROP ROLE app_gateway_role';/g, 'NULL;')
  .replace(/CREATE ROLE app_role NOLOGIN\s*;/gi,
    'DO $ir$ BEGIN CREATE ROLE app_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $ir$;')
  .replace(/CREATE ROLE app_gateway_role NOLOGIN\s*;/gi,
    'DO $ir$ BEGIN CREATE ROLE app_gateway_role NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $ir$;');

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
  assertContainerRunning();
  for (const db of [DB_MIG, DB_SQL]) { try { psqlAdmin(`DROP DATABASE IF EXISTS ${db}`); } catch {} psqlAdmin(`CREATE DATABASE ${db}`); }
  try {
    loadFrom('packages/db/migrations', DB_MIG);   // fresh deploy 路径
    loadFrom('packages/db/sql', DB_SQL);          // legacy compatibility fixture（旧兼容样本）
    let fail = 0;
    const A = (n, c) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
    for (const [label, q] of [['列', COLS_SQL], ['UNIQUE/PK 约束', CONS_SQL]]) {
      const mig = rows(DB_MIG, q), sql = rows(DB_SQL, q);
      const missing = [...sql].filter((x) => !mig.has(x));
      A(`sql/ 的${label}迁移路径全覆盖(fresh deploy 不缺)`, missing.length === 0);
      if (missing.length) { console.log(`  ✗ 迁移缺失(改了 sql/ 忘写迁移?需补增量迁移):`); missing.forEach((m) => console.log(`     - ${m}`)); }
    }
    console.log(`\n${fail === 0 ? '✓ schema 兼容镜像未超出迁移路径（fresh deploy 仍以 migrations 为准）' : '✗ ' + fail + ' 类漂移——补增量迁移后再合并'}`);
    process.exitCode = fail === 0 ? 0 : 1;
  } finally {
    for (const db of [DB_MIG, DB_SQL]) { try { psqlAdmin(`DROP DATABASE IF EXISTS ${db}`); } catch {} }   // 清理:删临时库,避免 app_role 跨库依赖污染其它门
  }
}
main();
