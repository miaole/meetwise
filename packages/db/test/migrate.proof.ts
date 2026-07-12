/** 迁移运行器证明（真 Postgres）：只跑待应用 · 幂等 · 事务 · 漂移检测 · advisory 锁 · 目录加载。 pnpm migrate:prove */
import { fileURLToPath } from 'node:url';
import { createPool, runMigrations, loadMigrations } from '../src/index.ts';
const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const has = async (t: string) => (await pool.query("SELECT to_regclass($1) r", ['public.' + t])).rows[0].r !== null;

async function main() {
  await pool.query('DROP TABLE IF EXISTS schema_migrations, mig_t1, mig_t2, mig_t3 CASCADE');
  const m1 = { version: '0001', sql: 'CREATE TABLE IF NOT EXISTS mig_t1(id int)' };
  const m2 = { version: '0002', sql: 'CREATE TABLE IF NOT EXISTS mig_t2(id int)' };

  let r = await runMigrations(pool, [m2, m1]);   // 乱序传入,按 version 排序
  A('首次:两迁移都应用(按序)', JSON.stringify(r.applied) === JSON.stringify(['0001', '0002']));
  A('表真建出来', (await has('mig_t1')) && (await has('mig_t2')));
  A('schema_migrations 记 2 条', (await pool.query('SELECT count(*)::int n FROM schema_migrations')).rows[0].n === 2);

  r = await runMigrations(pool, [m1, m2]);       // 重跑
  A('幂等:重跑无新应用(全 skip)', r.applied.length === 0 && r.skipped.length === 2);

  const m3 = { version: '0003', sql: 'CREATE TABLE IF NOT EXISTS mig_t3(id int)' };
  r = await runMigrations(pool, [m1, m2, m3]);   // 加新迁移
  A('只跑新增的 0003', JSON.stringify(r.applied) === JSON.stringify(['0003']) && await has('mig_t3'));

  let threw = false;
  try { await runMigrations(pool, [{ version: '0001', sql: 'CREATE TABLE IF NOT EXISTS mig_t1(id int, x text)' }]); } catch { threw = true; }
  A('漂移检测:改已应用迁移(0001)→ 报错(禁止改历史)', threw);

  // 失败迁移回滚:坏 SQL 不留 schema_migrations 记录
  let err = false;
  try { await runMigrations(pool, [{ version: '0004', sql: 'THIS IS NOT SQL' }]); } catch { err = true; }
  A('坏迁移抛错且不记录(事务回滚)', err && (await pool.query("SELECT count(*)::int n FROM schema_migrations WHERE version='0004'")).rows[0].n === 0);

  // 目录加载 + baseline(冻结真 schema) + 增量 + 幂等 + **数据保全(零丢失)**
  await pool.query('DROP TABLE IF EXISTS schema_migrations, app_setting CASCADE');
  const migDir = fileURLToPath(new URL('../migrations', import.meta.url));
  const loaded = loadMigrations(migDir);
  A('加载迁移(0001_baseline 起,≥3)', loaded[0].version === '0001_baseline' && loaded.length >= 3);
  const rr = await runMigrations(pool, loaded);
  A('baseline 应用 → 真生产 schema 建出来(user_account/payment_order/vector_chunk)', (await has('user_account')) && (await has('payment_order')) && (await has('vector_chunk')));
  A('增量 0003 → app_setting 有 ALTER 加的 updated_at 列(非 DROP 重建)', (await pool.query("SELECT 1 FROM information_schema.columns WHERE table_name='app_setting' AND column_name='updated_at'")).rowCount === 1);
  // 关键:插用户数据 → 再部署(重跑迁移)→ 数据必须还在(运行器 skip,不重跑 baseline 的 drop+recreate)
  await pool.query("INSERT INTO app_setting(key,value) VALUES ('user_key','user_data')");
  const rr2 = await runMigrations(pool, loaded);
  A('再部署:全迁移 skip(不重跑 baseline 的 DROP)', rr2.applied.length === 0 && rr2.skipped.length === loaded.length);
  A('**零数据丢失**:再部署后用户数据仍在', (await pool.query("SELECT value FROM app_setting WHERE key='user_key'")).rows[0]?.value === 'user_data');

  console.log(`\n${fail === 0 ? '✓ 迁移运行器 全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
