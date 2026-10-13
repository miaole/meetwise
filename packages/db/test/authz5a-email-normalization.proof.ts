/**
 * AUTHZ-HARDEN 5A-1 簇① prove — #111+#131 邮箱归一（存量迁移+网关换体）五臂（REQUEST rev2 §2-1 db prove 形）。
 * 隔离库（run-e2e-isolated 门·assertIsolatedTestTarget）·est live=0（零模型外呼·零生产操作）。
 *
 * 五臂：
 *  [1] signup 归一落库：大写/带空白邮箱经 gateway_auth_signup → 库内 lower(btrim) 归一值；
 *  [2] 大写登录命中：gateway_auth_login('大写形') 命中同一账户（读侧入参先归一·裁决项①）；
 *  [3] 邀请命中（invite 200 非 404 的 SQL 承重面）：gateway_active_candidate 以大写 email 键解析到同一候选人
 *      （recruiter.service 归一后传参即此谓词；未命中=邀请 404 面的根，命中=200 面）；
 *  [4] 冲突预检只报告不合并：冲突库上跑 0167 体 → WARNING authz_0167_conflict_report 列明 + 冲突行整组原样
 *      保留 + 无冲突行照常归一 + 索引延后不建（防中途 UNIQUE 坠迁移·派单裁决）；
 *  [5] 重跑幂等：主链库上二次执行 0167 体 + 重放 runMigrations → 行映像零 diff + 索引仍在。
 * 附加：0169 会话表 R5 命名区分臂（retention_class='auth_session' 值域·表名与 privacy/memory 谱系分离）。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { asPrincipal, createPool, runMigrations, loadMigrations, assertIsolatedTestTarget, type DbPool } from '../src/index.ts';

const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));
let failures = 0, assertions = 0;
const A = (name: string, passed: boolean) => { assertions++; if (!passed) { failures++; console.log(`FAIL  ${name}`); } else console.log(`PASS  ${name}`); };
const migSql = (f: string) => readFileSync(`${MIG_DIR}/${f}`, 'utf8');

async function freshDb(admin: DbPool, name: string): Promise<DbPool> {
  await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${name}`);
  return createPool({ purpose: 'authz5a_probe', database: name });
}

async function main() {
  const admin = createPool({ purpose: 'authz5a_probe_admin' });
  await assertIsolatedTestTarget(admin);
  const manifest = loadMigrations(MIG_DIR);
  const names = manifest.map((m) => m.version);
  A('迁移清单含 0167/0168/0169（编号重 pin·0164 空号如实登记）', ['0167_email_case_normalization', '0168_gateway_auth_email_normalize', '0169_auth_user_session'].every((v) => names.includes(v)));

  // 单容器单库（0001 baseline 的 DROP ROLE 是 cluster 级,只在 virgin 库可重放）——冲突臂先行,模拟运营
  // 清障后全链过（=真实运营时序:预检报告 → 处置 → 迁移链闭合）。
  const db = await freshDb(admin, 'authz5a_main');

  // ── 阶段 A：预链(≤0166)+冲突行 → 臂 [4]（只报告不合并·索引延后）──
  const preManifest = manifest.filter((m) => !m.version.startsWith('0167_') && !m.version.startsWith('0168_') && !m.version.startsWith('0169_'));
  const pre = await runMigrations(db, preManifest);
  A('预链(≤0166)一次通过', pre.applied.length === preManifest.length);
  await db.query("INSERT INTO user_account(id, email, password_hash, role) VALUES ('c1','Foo@X.com','scrypt$aa$bb','candidate')");
  await db.query("INSERT INTO user_account(id, email, password_hash, role) VALUES ('c2','foo@x.com','scrypt$cc$dd','candidate')");
  await db.query("INSERT INTO user_account(id, email, password_hash, role) VALUES ('c3','Normal@x.com','scrypt$ee$ff','candidate')");
  const client = await db.connect();
  const notices: string[] = [];
  client.on('notice', (n: { message: string }) => notices.push(n.message));
  try {
    await client.query('BEGIN');
    await client.query(migSql('0167_email_case_normalization.sql'));
    await client.query('COMMIT');
  } finally {
    client.release();
  }
  const conflictRows = (await db.query("SELECT id, email FROM user_account WHERE id IN ('c1','c2') ORDER BY id")).rows;
  A('[4] 冲突行整组原样保留（只报告不合并·处置归运营·Ban 静默合并）', conflictRows[0]?.email === 'Foo@X.com' && conflictRows[1]?.email === 'foo@x.com');
  const normalRow = (await db.query("SELECT email FROM user_account WHERE id='c3'")).rows;
  A('[4] 无冲突行照常归一（Normal@x.com 已 lower——报告与归一并行不悖）', normalRow[0]?.email === 'normal@x.com');
  A('[4] 预检报告输出（authz_0167_conflict_report WARNING 列明冲突组）', notices.some((n) => n.includes('authz_0167_conflict_report') && n.includes('foo@x.com')));
  const deferredIdx = await db.query("SELECT indexname FROM pg_indexes WHERE indexname='ux_user_email_lower'");
  A('[4] 冲突未清 → 唯一索引延后不建（防中途 UNIQUE 坠迁移·派单裁决）', deferredIdx.rowCount === 0 && notices.some((n) => n.includes('authz_0167_ux_user_email_lower_deferred')));

  // ── 阶段 B：模拟运营清障（DELETE 重复行=运营处置,非迁移合并）→ 全链（0167-0169 过链）──
  await db.query("DELETE FROM user_account WHERE id='c2'");
  const first = await runMigrations(db, manifest);
  A('清障后 0167-0169 过链（新增三迁移恰全应用·预链 ledger 前缀衔接）',
    first.applied.length === manifest.length - preManifest.length
    && ['0167_email_case_normalization', '0168_gateway_auth_email_normalize', '0169_auth_user_session'].every((v) => first.applied.includes(v)));

  // [1] signup 归一落库（SQL 网关兜底闸——不经应用层,直证 0168 函数体）
  await db.query("SELECT gateway_auth_signup('u1', '  MixedCase@X.com ', 'scrypt$aa$bb', 'candidate')");
  const r1 = await db.query("SELECT email, role FROM user_account WHERE id='u1'");
  A('[1] signup/大写+空白邮箱 → 库内归一 lower(btrim) 落库', r1.rows[0]?.email === 'mixedcase@x.com');

  // [2] 大写登录命中同一账户
  const r2 = await db.query('SELECT id FROM gateway_auth_login($1)', ['MIXEDCASE@X.COM']);
  A('[2] login/大写邮箱登录命中同一账户（入参先归一·裁决项①）', r2.rows[0]?.id === 'u1');

  // [3] 邀请命中（invite 200 非 404 的 SQL 承重面）：recruiter(approved) 以大写+空白 email 解析候选人
  await db.query("SELECT gateway_auth_signup('r1', 'rec@x.com', 'scrypt$aa$bb', 'recruiter')");
  await db.query("UPDATE user_account SET approval_status='approved' WHERE id='r1'");
  const r3 = await asPrincipal(db, 'r1', (c) => c.query('SELECT id FROM gateway_active_candidate($1,$2)', [null, '  MIXEDCASE@X.COM ']));
  A('[3] invite/大写+空白 email 键经 gateway_active_candidate 命中候选人（200 非 404 的承重谓词）', r3.rows[0]?.id === 'u1');

  // [5] 重跑幂等：0167 体两次事务内重放 + runMigrations 重放 → 行映像零 diff
  const before = (await db.query('SELECT id, email FROM user_account ORDER BY id')).rows;
  for (let i = 0; i < 2; i++) { await db.query('BEGIN'); await db.query(migSql('0167_email_case_normalization.sql')); await db.query('COMMIT'); }   // SET LOCAL 须在事务内（runner 内同形）
  const after = (await db.query('SELECT id, email FROM user_account ORDER BY id')).rows;
  A('[5] 重跑幂等/0167 体两次重放行映像零 diff', JSON.stringify(before) === JSON.stringify(after));
  const rerun = await runMigrations(db, manifest);
  A('[5] 重跑幂等/runMigrations 重放全 skipped', rerun.applied.length === 0 && rerun.skipped.length === manifest.length);
  const idx = await db.query("SELECT indexname FROM pg_indexes WHERE indexname='ux_user_email_lower'");
  A('[5] 重跑幂等/ux_user_email_lower 在位（lower(email) 唯一索引·§1 逐字名）', idx.rowCount === 1);

  // ── 0169 R5 命名区分臂 ──
  const retention = await db.query(
    "SELECT pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid='auth_user_session'::regclass AND contype='c'");
  A('R5/0169 retention_class 值域恒 auth_session（≠ memory 0112 的 session/account/derived）',
    (retention.rows[0]?.def as string ?? '').includes('auth_session') && !(retention.rows[0]?.def as string ?? '').includes("'session',"));
  const jtiDef = await db.query(
    "SELECT pg_get_constraintdef(oid) def FROM pg_constraint WHERE conrelid='auth_user_session'::regclass AND contype='p'");
  A('R5/auth_user_session.jti 主键唯一（与 0091 privacy_authorization_snapshot.jti 表级分离）', (jtiDef.rows[0]?.def as string ?? '').includes('jti'));

  await db.end().catch(() => undefined);
  await admin.query('DROP DATABASE IF EXISTS authz5a_main WITH (FORCE)').catch(() => undefined);
  await admin.end().catch(() => undefined);
  console.log(`\n${failures === 0 ? `✓ authz5a:normalize:prove: ${assertions} 条断言全绿` : `✗ authz5a:normalize:prove: ${failures}/${assertions} 失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
