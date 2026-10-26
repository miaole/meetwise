/**
 * interview-event-retention.proof.ts — event-ttl 刀件④：interview_event 保留期清扫隔离库证明（≥11 臂）。
 *
 * 真迁移链（全量 0001→0219）+ 隔离容器（run-e2e-isolated 包装·assertIsolatedTestTarget nonce 门）。
 * 臂面（event-ttl REQUEST 件④·P2-3 增第⑪臂）：
 *   ① 界 fail-closed 双面（SQL 侧低/高越界 RAISE + db 仓侧断言）
 *   ② 表权-函数权双验（app_role 无 interview_event DELETE·有清扫函数 EXECUTE·PUBLIC 零执行权）
 *   ③ 超龄 progress 族行被清（+批 LIMIT 批帽行使）
 *   ④ 未龄行零触（缺省保留窗 30d 边界语义亲证）
 *   ⑤ 超龄 business 终态 kind 行零触（kind 收窄主断言·恰 4 值 ephemeral 族域外零删）
 *   ⑥ 0195 律回归（两释放臂外一切路径仍 RAISE 23514 interview_event_immutable·app_role 直删 ACL 42501）
 *   ⑦ TG_OP='DELETE' 收窄（持 GUC 的 UPDATE 形仍拦·definer 角色无 UPDATE 表权双证）
 *   ⑧ 0208 隐私臂回归（SET ROLE privacy_worker_owner+隐私 GUC 形放行臂行为不变·0096:529 语义）
 *   ⑨ 幂等（二连拍 purged=0）
 *   ⑩ RLS 裸删拒（无 GUC 下 definer 角色直 DELETE 触发器墙 23514）+policy 目录断言
 *   ⑪ pg_auth_members 防漂移长效臂（P2-3：event_retention_worker 零成员·零可登录角色成员·0208:38-39
 *      同构显式 Ban 的库面回归）
 * 运行：node scripts/run-e2e-isolated.mjs interview-event-retention:prove:raw（隔离库包装）。
 * est live=0：零模型外呼·零生产操作·零 secrets。
 */
import { fileURLToPath } from 'node:url';
import {
  createPool, runMigrations, loadMigrations, assertIsolatedTestTarget,
  purgeExpiredInterviewEvents, type DbPool, type Client,
} from '../src/index.ts';

const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));
const PROBE_DB = 'interview_event_ttl_probe';

let db: DbPool;
let failures = 0;
const A = (n: string, c: boolean, extra?: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${c || !extra ? '' : ` — ${extra}`}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const OWNER = 'ttlSweepUser';
const STREAM_PROGRESS = 'evt-ttl-p1';      // progress 族（超龄 5：400d×4+31d×1 + 未龄 1）
const STREAM_BIZ = 'evt-ttl-biz';          // business 终态 kind（超龄·收窄域外）
const STREAM_BATCH = 'evt-ttl-p2';         // 批帽行使面（超龄 5）
const STREAM_PRIVACY = 'evt-ttl-pv';       // 0208 隐私臂回归面（未龄·隐私路径删）

const errOf = (e: unknown) => e as { code?: string; message?: string };
async function expectRaise(name: string, code: string, messagePart: string, fn: () => Promise<unknown>): Promise<void> {
  try {
    await fn();
    A(name, false, `expected RAISE ${code} ${messagePart}, got success`);
  } catch (e) {
    const err = errOf(e);
    const ok = err.code === code && (err.message ?? '').includes(messagePart);
    A(name, ok, `got code=${err.code} message=${(err.message ?? '').slice(0, 120)}`);
  }
}

/** 单连接内 BEGIN+SET LOCAL ROLE 定界（pool.query 跨连丢 SET ROLE·沿 dbhy1/memory-admission 先例）。 */
async function withRole<T>(role: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL ROLE ${role}`);   // 角色名全部为本证明内固定字面量·零外部输入插值
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

const one = async (sql: string, params: unknown[] = []): Promise<Record<string, unknown>> =>
  (await db.query(sql, params)).rows[0] ?? {};

async function main() {
  // 单容器单库（沿 authz5a2-stale-payload-ttl 先例）：fresh 库+全量迁移链（0048/0219 的 CREATE ROLE 系 cluster 级幂等形）。
  const admin = createPool({ purpose: 'event_ttl_probe_admin' });
  await assertIsolatedTestTarget(admin);
  const manifest = loadMigrations(MIG_DIR);
  await admin.query(`DROP DATABASE IF EXISTS ${PROBE_DB} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${PROBE_DB}`);
  db = createPool({ purpose: 'event_ttl_probe', database: PROBE_DB });
  const migrations = await runMigrations(db, manifest);
  A('迁移链全量应用(全链恰一次·链头 0219)', migrations.applied.length === manifest.length
    && migrations.applied[migrations.applied.length - 1] === '0219_interview_event_retention_purge');
  A(`迁移目录文件数=217(现最大 0218 顺延·0219 认领零冲突·实测 ${manifest.length})`, manifest.length === 217);
  const fnMeta = await one(
    `SELECT proowner::regrole::text AS owner, prosecdef AS sd FROM pg_proc
      WHERE oid = to_regprocedure('interview_event_retention_purge(integer,integer)')`,
  );
  A('清扫函数在库(0219 SECURITY DEFINER·owner=event_retention_worker)', fnMeta['owner'] === 'event_retention_worker' && fnMeta['sd'] === true);

  // ── fixture：interview 行（0059 写 guard 须真实 interview+principal GUC）+ interview_event 行直插 ──
  // 单连接定界（principal GUC 系 session 级·pool 跨连会丢）。触发器面如实行使：0059
  // privacy_projection_write_guard(BEFORE INSERT)·0126 no_raw_answer_guard(BEFORE INSERT OF payload·
  // payload='{}' 零顶层 answer 键)·0214 sse_notify(AFTER INSERT·零 DELETE 面)。
  {
    const client = await db.connect();
    try {
      await client.query("SELECT set_config('app.principal_user', $1, false)", [OWNER]);
      for (const stream of [STREAM_PROGRESS, STREAM_BIZ, STREAM_BATCH, STREAM_PRIVACY]) {
        await client.query(`INSERT INTO interview(id, owner_user_id, status) VALUES ($1, $2, 'active')`, [stream, OWNER]);
      }
      const seed = (stream: string, seq: number, kind: string, ageDays: number) => client.query(
        `INSERT INTO interview_event(owner_user_id, stream_key, seq, kind, payload, created_at)
         VALUES ($1, $2, $3, $4, '{}'::jsonb, clock_timestamp() - make_interval(days => $5::int))`,
        [OWNER, stream, seq, kind, ageDays],
      );
      // STREAM_PROGRESS：超龄 progress 族 5 行（恰 4 值 ephemeral 域全覆盖+窗界 31d）+ 未龄 1 行。
      await seed(STREAM_PROGRESS, 1, 'progress', 400);
      await seed(STREAM_PROGRESS, 2, 'generation_started', 400);
      await seed(STREAM_PROGRESS, 3, 'model_first_token', 400);
      await seed(STREAM_PROGRESS, 4, 'generation_progress', 400);
      await seed(STREAM_PROGRESS, 5, 'progress', 31);            // 31d：缺省保留窗(30d)外一日
      await seed(STREAM_PROGRESS, 6, 'progress', 0);             // 未龄（④ 零触面）
      // STREAM_BIZ：超龄 business 终态 kind（⑤ kind 收窄主断言面·划出清扫域）。
      await seed(STREAM_BIZ, 1, 'question_ready', 400);
      await seed(STREAM_BIZ, 2, 'report_ready', 400);
      await seed(STREAM_BIZ, 3, 'answer_evaluated', 400);
      // STREAM_BATCH：超龄 progress 5 行（③ 批帽行使面）。
      for (let i = 1; i <= 5; i++) await seed(STREAM_BATCH, i, 'progress', 400);
      // STREAM_PRIVACY：未龄 progress 1 行（⑧ 隐私路径删除面·与龄窗无关）。
      await seed(STREAM_PRIVACY, 1, 'progress', 0);
    } finally {
      client.release();
    }
  }
  A('fixture: 15 行 interview_event 落库(经 0059/0126/0214 三触发器面·guard 须真实 interview+principal)', (await one(
    'SELECT count(*)::int AS n FROM interview_event',
  ))['n'] === 15);

  section('① 界 fail-closed 双面（SQL 侧 30..3650/1..10000 + db 仓侧断言）');
  const purgeAsApp = (keep: number, batch: number) => withRole('app_role', (c) => c.query(
    'SELECT interview_event_retention_purge($1, $2)', [keep, batch],
  ));
  /** 仓侧断言面：显式借用一条连接交 Client 形参（pool≠Client·沿 usage-calibration-retention tick 同形）。 */
  const purgeViaWrapper = async (keep: number, batch: number): Promise<number> => {
    const client = await db.connect();
    try {
      return await purgeExpiredInterviewEvents(client, keep, batch);
    } finally {
      client.release();
    }
  };
  await expectRaise('臂①: keep_days=29 低越界 RAISE check_violation(收窄下界防误删近窗)', '23514', 'interview_event_retention_invalid_input', () => purgeAsApp(29, 500));
  await expectRaise('臂①: keep_days=3651 高越界 RAISE', '23514', 'interview_event_retention_invalid_input', () => purgeAsApp(3651, 500));
  await expectRaise('臂①: batch_cap=0 低越界 RAISE', '23514', 'interview_event_retention_invalid_input', () => purgeAsApp(30, 0));
  await expectRaise('臂①: batch_cap=10001 高越界 RAISE', '23514', 'interview_event_retention_invalid_input', () => purgeAsApp(30, 10001));
  await expectRaise('臂①: db 仓侧断言 keepDays=29 越界即抛(interview_event_retention_invalid)', 'interview_event_retention_invalid', 'interview_event_retention_invalid', () => purgeViaWrapper(29, 500));
  await expectRaise('臂①: db 仓侧断言 batchCap=10001 越界即抛', 'interview_event_retention_invalid', 'interview_event_retention_invalid', () => purgeViaWrapper(30, 10001));

  section('② 表权-函数权双验（app_role 无 DELETE·有 EXECUTE·PUBLIC 零执行权）');
  A('臂②: app_role 对 interview_event 无 DELETE(0096:255 纪律零破坏)', (await one(
    "SELECT has_table_privilege('app_role','interview_event','DELETE') AS ok",
  ))['ok'] === false);
  A('臂②: app_role 对 interview_event SELECT,INSERT 保持(基线零回归)', (await one(
    "SELECT has_table_privilege('app_role','interview_event','SELECT,INSERT') AS ok",
  ))['ok'] === true);
  A('臂②: app_role 有清扫函数 EXECUTE(0177:172 同形·worker 登录身份直调)', (await one(
    "SELECT has_function_privilege('app_role','interview_event_retention_purge(integer,integer)','EXECUTE') AS ok",
  ))['ok'] === true);
  A('臂②: PUBLIC 对清扫函数零执行权(REVOKE ALL FROM PUBLIC)', (await one(
    "SELECT has_function_privilege('public','interview_event_retention_purge(integer,integer)','EXECUTE') AS ok",
  ))['ok'] === false);
  A('臂②: event_retention_worker 表权最小面(SELECT,DELETE 有·UPDATE 无)', (await one(
    "SELECT has_table_privilege('event_retention_worker','interview_event','SELECT,DELETE') AS grant_ok, has_table_privilege('event_retention_worker','interview_event','UPDATE') AS upd_ok",
  ))['grant_ok'] === true && (await one(
    "SELECT has_table_privilege('event_retention_worker','interview_event','UPDATE') AS upd_ok",
  ))['upd_ok'] === false);

  section('③ 超龄 progress 族行被清（批 LIMIT 批帽行使）+ 事务局域 GUC 零残留');
  const batched = await purgeViaWrapper(30, 3);
  A('臂③: 批帽行使 purge(30,3)=3(批删 LIMIT 生效)', batched === 3);
  const agedProgressCount = async () => Number((await one(
    `SELECT count(*)::int AS n FROM interview_event
      WHERE kind IN ('progress','generation_started','model_first_token','generation_progress')
        AND created_at < clock_timestamp() - make_interval(days => 30)`,
  ))['n']);
  A('臂③: 批后残余超龄 progress 族=7(10-3·零重复计账)', (await agedProgressCount()) === 7);
  const full = await purgeViaWrapper(30, 10000);
  A('臂③: 全量拍 purge(30,10000)=7(超龄 progress 族恰清·purged=实际删除行数)', full === 7);
  A('臂③: 清后超龄 progress 族=0', (await agedProgressCount()) === 0);
  // GUC 事务局域亲证（专用新池=全新 backend·免池连接复用的隐式事务语义干扰）：
  // 显式事务内 set_config(is_local) 可见→提交后归 NULL（is_local 真语义）。
  {
    const fresh = createPool({ purpose: 'event_ttl_probe_fresh1', database: PROBE_DB });
    try {
      const client = await fresh.connect();
      try {
        await client.query('BEGIN');
        await client.query('SET LOCAL ROLE app_role');
        const neverSet = (await client.query("SELECT current_setting('app.event_ttl_sweep', true) AS guc")).rows[0]['guc'];
        await client.query("SELECT set_config('app.event_ttl_sweep', 'probe', true)");
        const inTxn = (await client.query("SELECT current_setting('app.event_ttl_sweep', true) AS guc")).rows[0]['guc'];
        await client.query('COMMIT');
        await client.query('BEGIN');
        await client.query('SET LOCAL ROLE app_role');
        const afterCommit = (await client.query("SELECT current_setting('app.event_ttl_sweep', true) AS guc")).rows[0]['guc'];
        await client.query('COMMIT');
        A('臂③: GUC 事务局域亲证(未置新会话读 NULL·is_local 置位事务内可见·提交后值不复存)',
          neverSet === null && inTxn === 'probe' && (afterCommit === null || afterCommit === ''),
          `neverSet=${String(neverSet)} inTxn=${String(inTxn)} afterCommit=${String(afterCommit)}`
          + '（注:PG 复位态占位读空串·值不跨事务界；臂面安全性由键1 current_user 门承载·0208 同构）');
      } finally { client.release(); }
    } finally { await fresh.end(); }
  }

  section('④ 未龄行零触（缺省保留窗 30d 边界语义亲证）');
  A('臂④: 未龄 progress 行(created_at=now)零触仍在', (await one(
    `SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND seq=6 AND kind='progress'`, [STREAM_PROGRESS],
  ))['n'] === 1);
  A('臂④: 31d 行已被清(恰在缺省保留窗 30d 外·窗界语义)', (await one(
    `SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1 AND seq=5`, [STREAM_PROGRESS],
  ))['n'] === 0);

  section('⑤ 超龄 business 终态 kind 行零触（kind 收窄主断言·恰 4 值 ephemeral 域）');
  A('臂⑤: 超龄 question_ready/report_ready/answer_evaluated 三行零触(域外零删)', (await one(
    'SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [STREAM_BIZ],
  ))['n'] === 3);
  A('臂⑤: 全库残余超龄行恰为域外 3 行(kind IN 收窄·不存在第 5 值放行面)', (await one(
    `SELECT count(*)::int AS n FROM interview_event
      WHERE created_at < clock_timestamp() - make_interval(days => 30)
        AND kind NOT IN ('progress','generation_started','model_first_token','generation_progress')`,
  ))['n'] === 3);

  section('⑥ 0195 律回归（两释放臂外一切路径恒 RAISE 23514）');
  await expectRaise('臂⑥: app_role 直 DELETE 仍拦(表权墙 42501 permission denied·0096:255)', '42501', 'permission denied', () => withRole('app_role', (c) => c.query('DELETE FROM interview_event WHERE stream_key=$1', [STREAM_BIZ])));
  await expectRaise('臂⑥: 直连超管会话 DELETE 仍 RAISE interview_event_immutable(0195 恒 RAISE 基线·零行亦触发)', '23514', 'interview_event_immutable', () => db.query('DELETE FROM interview_event WHERE stream_key=$1', ['evt-ttl-nonexistent']));
  await expectRaise('臂⑥: privacy_worker_owner 无隐私 GUC DELETE 仍 RAISE(0208 键2 拦回·interview_event_immutable)', '23514', 'interview_event_immutable', () => withRole('privacy_worker_owner', (c) => c.query('DELETE FROM interview_event WHERE stream_key=$1', [STREAM_BIZ])));

  section("⑦ TG_OP='DELETE' 收窄（GUC 单键不解锁 UPDATE 面）");
  await expectRaise('臂⑦: 持 app.event_ttl_sweep GUC 的 UPDATE 仍 RAISE(收窄臂·UPDATE 豁免零正当)', '23514', 'interview_event_immutable', async () => {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.event_ttl_sweep', 'probe', true)");
      await client.query('UPDATE interview_event SET payload=payload WHERE stream_key=$1', [STREAM_BIZ]);
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; } finally { client.release(); }
  });
  await expectRaise('臂⑦: event_retention_worker(带 GUC)UPDATE 42501(表权 UPDATE 未授予·0195 REVOKE 面)', '42501', 'permission denied', () => withRole('event_retention_worker', async (c) => {
    await c.query("SELECT set_config('app.event_ttl_sweep', 'probe', true)");
    await c.query('UPDATE interview_event SET payload=payload WHERE stream_key=$1', [STREAM_BIZ]);
  }));

  section('⑧ 0208 隐私臂回归（放行臂行为不变·0096:529 语义逐字）');
  {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      await client.query('SET LOCAL ROLE privacy_worker_owner');
      await client.query("SELECT set_config('app.principal_user', $1, true)", [OWNER]);
      await client.query("SELECT set_config('app.privacy_target_id', 'evt-ttl-privacy-target', true)");
      const r = await client.query('DELETE FROM interview_event WHERE owner_user_id=$1 AND stream_key=$2', [OWNER, STREAM_PRIVACY]);
      A('臂⑧: 隐私单目标臂 DELETE 恰删 1 行(四键放行·行为零变)', r.rowCount === 1);
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; } finally { client.release(); }
  }
  A('臂⑧: 隐私删除后该 stream 零残行(0096 删后 read=0 语义)', (await one(
    'SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [STREAM_PRIVACY],
  ))['n'] === 0);

  section('⑨ 幂等（二连拍零新删）');
  const second = await purgeViaWrapper(30, 10000);
  A('臂⑨: 二连拍 purged=0(幂等·零重复计账)', second === 0);

  section('⑩ RLS 裸删拒 + policy 目录断言');
  // 专用新池=全新 backend（未沾任何 purge 调用的会话级 GUC 残留·set_config(is_local) 在隐式事务
  // 调用形下系会话域——PG 语义）→ 无 GUC 裸删断言在净会话上成立。
  {
    const fresh = createPool({ purpose: 'event_ttl_probe_fresh2', database: PROBE_DB });
    try {
      await expectRaise('臂⑩: 无 GUC 下 definer 角色直 DELETE 拦(触发器墙 23514·policy GUC 门双墙)', '23514', 'interview_event_immutable', async () => {
        const client = await fresh.connect();
        try {
          await client.query('BEGIN');
          await client.query('SET LOCAL ROLE event_retention_worker');
          await client.query('DELETE FROM interview_event WHERE stream_key=$1', [STREAM_BIZ]);
          await client.query('COMMIT');
        } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; } finally { client.release(); }
      });
    } finally { await fresh.end(); }
  }
  const policies = (await db.query(
    `SELECT policyname, cmd, roles::text AS roles, qual::text AS qual FROM pg_policies
      WHERE tablename='interview_event' ORDER BY policyname`,
  )).rows as Array<{ policyname: string; cmd: string; roles: string; qual: string }>;
  const selPolicy = policies.find((p) => p.policyname === 'interview_event_retention_worker_select');
  const delPolicy = policies.find((p) => p.policyname === 'interview_event_retention_worker_delete');
  A('臂⑩: RLS select policy 在册(FOR SELECT TO event_retention_worker USING true·0096 dispatch 同构)',
    !!selPolicy && selPolicy.cmd === 'SELECT' && selPolicy.roles.includes('event_retention_worker') && selPolicy.qual.replace(/\s/g, '') === 'true');
  A('臂⑩: RLS delete policy 在册(USING app.event_ttl_sweep 非空门·0096:286-290 同构·裸删 policy 层即拒)',
    !!delPolicy && delPolicy.cmd === 'DELETE' && delPolicy.roles.includes('event_retention_worker') && delPolicy.qual.includes('app.event_ttl_sweep'));
  A('臂⑩: 既有 policy 面零扰动(p_owner+两 privacy_worker 仍各在其位·additive 形亲证)',
    policies.some((p) => p.policyname === 'p_owner')
    && policies.some((p) => p.policyname === 'interview_event_privacy_worker_select')
    && policies.some((p) => p.policyname === 'interview_event_privacy_worker_delete'));

  section('⑪ pg_auth_members 防漂移长效臂（P2-3·0208:38-39 同构显式 Ban 的库面回归）');
  const membership = await one(
    `SELECT count(*)::int AS total,
            count(*) FILTER (WHERE mem.rolcanlogin)::int AS login_members
       FROM pg_auth_members m
       JOIN pg_roles r ON r.oid = m.roleid
       JOIN pg_roles mem ON mem.oid = m.member
      WHERE r.rolname = 'event_retention_worker'`,
  );
  A('臂⑪: event_retention_worker 零成员资格(零可登录角色成员·SET ROLE 伪造上游防在位)',
    membership['total'] === 0 && membership['login_members'] === 0);
  const roleShape = await one(
    `SELECT rolcanlogin AS can_login, rolinherit AS inherit, rolsuper AS super
       FROM pg_roles WHERE rolname='event_retention_worker'`,
  );
  A('臂⑪: 角色形制 NOLOGIN NOINHERIT 非超user(判别器键1/键3 上游防)',
    roleShape['can_login'] === false && roleShape['inherit'] === false && roleShape['super'] === false);
  A('臂⑪: app_role 成员资格面零漂移(REVOKE 显式随发后零 membership)', (await one(
    `SELECT count(*)::int AS n FROM pg_auth_members m
       JOIN pg_roles r ON r.oid = m.roleid JOIN pg_roles mem ON mem.oid = m.member
      WHERE r.rolname='event_retention_worker' AND mem.rolname='app_role'`,
  ))['n'] === 0);

  console.log(`\n${failures === 0 ? '✓' : '✗'} interview-event-retention — 保留期清扫隔离库 prove 完成(失败 ${failures})`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
