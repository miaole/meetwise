/** Production runtime login proof: a migrated DB creates an app-role member that cannot elevate or bypass RLS. */
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, assertRuntimeLoginIdentity, createPool, asGateway, asPrincipal, loadMigrations, provisionRuntimeLogin, runMigrations } from '../src/index.ts';

const admin = createPool();
const role = `runtime_role_${process.pid}`;
const password = 'runtime-role-proof-password-2026';
let failures = 0;
const A = (name: string, condition: boolean) => { console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`); if (!condition) failures++; };

async function rejects(fn: () => Promise<unknown>): Promise<boolean> {
  try { await fn(); return false; } catch { return true; }
}

async function main() {
  await assertIsolatedTestTarget(admin);
  const migrations = loadMigrations(fileURLToPath(new URL('../migrations', import.meta.url)));
  await admin.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  await runMigrations(admin, migrations);
  await provisionRuntimeLogin(admin, { roleName: role, password });
  await provisionRuntimeLogin(admin, { roleName: role, password }); // repeat must be safe/rotatable

  const attrs = (await admin.query(
    `SELECT r.rolsuper, r.rolbypassrls, r.rolcreaterole, r.rolcreatedb, r.rolinherit,
            pg_has_role(r.rolname, 'app_role', 'member') AS app_member,
            pg_has_role(r.rolname, 'app_gateway_role', 'member') AS gateway_member
       FROM pg_roles r WHERE r.rolname=$1`, [role],
  )).rows[0];
  A('运行登录无 superuser/bypass/create-role/create-db 且 NOINHERIT，仅为 app/app_gateway 角色成员',
    attrs?.rolsuper === false && attrs?.rolbypassrls === false && attrs?.rolcreaterole === false
    && attrs?.rolcreatedb === false && attrs?.rolinherit === false && attrs?.app_member === true && attrs?.gateway_member === true);

  await admin.query("INSERT INTO interview(id,owner_user_id,status) VALUES ('runtime-a','role-user-a','created'),('runtime-b','role-user-b','created') ON CONFLICT DO NOTHING");
  await admin.query("INSERT INTO interview_job(owner_user_id,interview_id,kind,payload,status) VALUES ('role-user-a','runtime-a','start','{}','queued')");
  await admin.query(`INSERT INTO user_account(id,email,password_hash,role,is_admin) VALUES
    ('role-user-a','role-a@example.test','scrypt$test$a','candidate',false),
    ('role-user-b','role-b@example.test','scrypt$test$b','candidate',false),
    ('role-recruiter','role-recruiter@example.test','scrypt$test$r','recruiter',false),
    ('role-admin','role-admin@example.test','scrypt$test$admin','candidate',true)
    ON CONFLICT (id) DO UPDATE SET status='active', role=EXCLUDED.role, is_admin=EXCLUDED.is_admin`);
  await admin.query("INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status) VALUES ('runtime-order','role-user-a','pack_10',9900,10,'created') ON CONFLICT DO NOTHING");
  await admin.query("INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES ('runtime-budget',1000,true) ON CONFLICT (scope_id) DO UPDATE SET monthly_limit_micro_cny=1000,enabled=true");
  await admin.query("INSERT INTO ai_cost_budget_month(scope_id,period_key,limit_micro_cny,reserved_micro_cny,settled_micro_cny) VALUES ('runtime-budget',to_char(clock_timestamp() AT TIME ZONE 'UTC','YYYY-MM'),1000,100,250) ON CONFLICT (scope_id,period_key) DO UPDATE SET reserved_micro_cny=100,settled_micro_cny=250");
  const runtime = createPool({ user: role, password, max: 2 });
  try {
    await assertRuntimeLoginIdentity(runtime, role);
    A('组合根身份门接受精确低权 runtime login', true);
    A('组合根身份门拒绝错误预期账号', await rejects(() => assertRuntimeLoginIdentity(runtime, `${role}_wrong`)));
    A('运行登录不能 CREATE TABLE', await rejects(() => runtime.query('CREATE TABLE runtime_role_escape(id int)')));
    A('运行登录不能 CREATE ROLE', await rejects(() => runtime.query('CREATE ROLE runtime_role_escape')));
    A('运行登录不能切回迁移高权角色', await rejects(() => runtime.query('SET ROLE meetwise')));
    A('运行登录不能直接读取跨租户队列', await rejects(() => runtime.query('SELECT owner_user_id,payload FROM interview_job')));
    A('运行登录不能直接读取账户或支付表',
      await rejects(() => runtime.query('SELECT id, password_hash FROM user_account'))
      && await rejects(() => runtime.query('SELECT owner_user_id FROM payment_order'))
      && await rejects(() => runtime.query('SELECT scope_id FROM ai_cost_reservation')));
    const dispatched = await asGateway(runtime, (c) => c.query("SELECT owner_user_id FROM gateway_dispatch_owners('interview')"));
    A('网关只返回 queued owner，低权登录不获得队列正文', dispatched.rowCount === 1 && dispatched.rows[0]?.owner_user_id === 'role-user-a' && Object.keys(dispatched.rows[0] ?? {}).join(',') === 'owner_user_id');
    const visibleA = await asPrincipal(runtime, 'role-user-a', (c) => c.query('SELECT id FROM interview ORDER BY id'));
    const visibleB = await asPrincipal(runtime, 'role-user-b', (c) => c.query('SELECT id FROM interview ORDER BY id'));
    A('RLS principal A 只见自己的行', visibleA.rowCount === 1 && visibleA.rows[0]?.id === 'runtime-a');
    A('RLS principal B 只见自己的行', visibleB.rowCount === 1 && visibleB.rows[0]?.id === 'runtime-b');
    await runtime.query('BEGIN');
    await runtime.query('SET LOCAL ROLE app_role');
    const noPrincipal = await runtime.query('SELECT id FROM interview');
    await runtime.query('ROLLBACK');
    A('未设置 principal 时 RLS fail-closed 为 0 行', noPrincipal.rowCount === 0);

    const accountA = await asPrincipal(runtime, 'role-user-a', (c) => c.query('SELECT id FROM user_account ORDER BY id'));
    const accountB = await asPrincipal(runtime, 'role-user-b', (c) => c.query('SELECT id FROM user_account ORDER BY id'));
    A('账户表强制 RLS：每个 principal 只见自己的账户',
      accountA.rowCount === 1 && accountA.rows[0]?.id === 'role-user-a'
      && accountB.rowCount === 1 && accountB.rows[0]?.id === 'role-user-b');

    await asGateway(runtime, (c) => c.query(
      "SELECT gateway_auth_signup('role-new','role-new@example.test','scrypt$test$new','candidate')"));
    const login = await asGateway(runtime, (c) => c.query(
      "SELECT id, password_hash, status, role, pwd_epoch FROM gateway_auth_login('role-new@example.test')"));
    A('无会话网关仅可完成固定注册/登录函数，返回契约字段',
      login.rowCount === 1 && login.rows[0]?.id === 'role-new'
      && Object.keys(login.rows[0] ?? {}).sort().join(',') === 'id,password_hash,pwd_epoch,role,status');

    A('候选人 principal 不能调用招聘方跨账户解析', await rejects(() =>
      asPrincipal(runtime, 'role-user-a', (c) => c.query("SELECT id FROM gateway_active_candidate('role-user-b', NULL)"))));
    const invitedCandidate = await asPrincipal(runtime, 'role-recruiter', (c) => c.query(
      "SELECT id FROM gateway_active_candidate('role-user-b', NULL)"));
    A('招聘方 principal 仅经固定函数解析活跃候选人',
      invitedCandidate.rowCount === 1 && invitedCandidate.rows[0]?.id === 'role-user-b');

    A('非管理员 principal 不能调用运营跨租户查询', await rejects(() =>
      asPrincipal(runtime, 'role-user-a', (c) => c.query('SELECT * FROM gateway_admin_users()'))));
    const adminUsers = await asPrincipal(runtime, 'role-admin', (c) => c.query('SELECT * FROM gateway_admin_users()'));
    A('管理员 principal 可调用固定运营查询且不含 password_hash',
      adminUsers.rows.some((row) => row.id === 'role-user-a')
      && adminUsers.rows.every((row) => !Object.hasOwn(row, 'password_hash')));

    const orderOwner = await asGateway(runtime, (c) => c.query(
      "SELECT gateway_payment_order_owner('runtime-order') AS owner_user_id"));
    A('支付回调网关只返回订单 owner，不暴露订单正文',
      orderOwner.rowCount === 1 && orderOwner.rows[0]?.owner_user_id === 'role-user-a'
      && Object.keys(orderOwner.rows[0] ?? {}).join(',') === 'owner_user_id');

    const gauges = await asGateway(runtime, (c) => c.query('SELECT * FROM gateway_job_gauges()'));
    A('worker 指标网关只返回固定四队列的聚合计数',
      gauges.rowCount === 4 && gauges.rows.every((row) =>
        Object.keys(row).sort().join(',') === 'dead,queue,queued,running_expired'
        && ['interview_job', 'report', 'quiz_job', 'diagnosis_job'].includes(String(row.queue))));
    const budget = await asGateway(runtime, (c) => c.query(
      "SELECT * FROM gateway_cost_budget_snapshot('runtime-budget')"));
    A('费用指标网关仅返回一个 scope 的限额、已用额和未知数',
      budget.rowCount === 1 && Number(budget.rows[0]?.monthly_limit_micro_cny) === 1000
      && Number(budget.rows[0]?.used_micro_cny) === 350 && Number(budget.rows[0]?.unknown_count) === 0
      && Object.keys(budget.rows[0] ?? {}).sort().join(',') === 'monthly_limit_micro_cny,unknown_count,used_micro_cny');
    A('费用指标网关拒绝畸形 scope，而非把它拼进查询', await rejects(() =>
      asGateway(runtime, (c) => c.query("SELECT * FROM gateway_cost_budget_snapshot('bad scope')"))));
  } finally {
    await runtime.end();
    await admin.query(`DROP ROLE IF EXISTS ${role}`);
    await admin.end();
  }
  console.log(`\n${failures === 0 ? '✓ runtime database role proof passed' : `✗ ${failures} failures`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end(); process.exit(1); });
