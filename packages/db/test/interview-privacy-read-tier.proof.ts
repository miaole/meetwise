/**
 * privacy_active 读分层 prove（0206：interview_privacy_active_read read twin +
 * interview_privacy_fenced_targets 聚合）。
 *
 *   R1 read twin ↔ locking 谓词对未围栏面试布尔恒等（own / 跨主体 / 空 principal）
 *   R2 围栏中两者均 false，且 read twin 不取同键 advisory 锁（pg_locks 判别）、
 *      locking 面取锁（本事务可见）——admission 面串行化承重面不被读路径稀释
 *   R3 fenced_targets 聚合集 = 逐行 locking 求值集恒等（owner 内+跨主体隔离）
 *   R4 ACL 形（app_role EXECUTE / PUBLIC 零）+ 权威体 interview_privacy_active
 *      字节零漂（仍含同键锁行+authorization_paused 7 状态）+ paused 请求双谓词
 *      均判围栏（read 分层零围栏泄漏）
 *
 * 隔离 runner 全迁移链（0206 随链应用）·无模型外呼（est live=0）·releaseEvidence=false。
 *   pnpm -C packages/db prove:interview-privacy-read-tier   (raw; needs isolated runner)
 */
import { createHash } from 'node:crypto';
import {
  asPrincipal, assertIsolatedTestTarget, createPool,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWN = `read-tier-${suffix}`;
const OTHER = `read-tier-other-${suffix}`;
const hex = (seed: string) => createHash('sha256').update(seed).digest('hex');

async function seedInterview(owner: string, interviewId: string) {
  await pool.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, owner],
  );
}

async function fenceInterview(owner: string, interviewId: string, keySeed: string) {
  // fixture 种子走引导身份（app_role 对 privacy_begin_checkpoint_erasure 零 EXECUTE）：
  // 引导事务内 set_config 绑 principal 后直调权威受理过程，COMMIT 即释放其事务级围栏锁。
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.principal_user',$1,true)", [owner]);
    const r = await client.query(
      'SELECT request_id, request_status FROM privacy_begin_checkpoint_erasure($1,$2)',
      [interviewId, hex(keySeed)],
    );
    await client.query('COMMIT');
    if (r.rows.length === 0) throw new Error(`read_tier_fixture_fence_refused:${interviewId}`);
  } finally {
    client.release();
  }
}

/** 权威体 0076 替换体内文（prosrc 去首尾空白后须逐字节恒等；read 分层唯一 delta=锁行不进 twin）。 */
const AUTHORITY_BODY = [
  'DECLARE',
  "  principal text := current_setting('app.principal_user', true);",
  'BEGIN',
  '  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN RETURN false; END IF;',
  '',
  "  PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || target_interview));",
  '',
  '  PERFORM 1',
  '    FROM interview i',
  '   WHERE i.id=target_interview AND i.owner_user_id=principal;',
  '  IF NOT FOUND THEN RETURN false; END IF;',
  '',
  '  PERFORM 1',
  '    FROM privacy_checkpoint_target pt',
  '    JOIN privacy_erasure_request r ON r.id=pt.request_id',
  '   WHERE pt.thread_id=target_interview',
  '     AND pt.owner_user_id=principal',
  "     AND r.status IN ('requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused')",
  '   LIMIT 1;',
  '  RETURN NOT FOUND;',
  'END',
].join('\n');

// pg_locks.classid/objid 以 32 位位型呈无符号，hashtext() 回有符号 int32——单 int4 形
// pg_advisory_xact_lock(hashtext(k)) 先隐式宽化 int64 再拆键：负哈希落 classid=4294967295
// +objid=无符号低 32 位（classid=0 形过滤对负哈希永不相等=计 0，键匹配随哈希符号约 50%
// 闪断）。过滤双侧归一无符号域（objid 掩低 32 位+classid 按符号重建）。
const advisoryLockCount = (client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: Array<{ n: number }> }> }, key: string) =>
  client.query("SELECT count(*)::int n FROM pg_locks WHERE locktype='advisory' AND objid::bigint=(hashtext($1)::bigint & 4294967295) AND classid::bigint=(CASE WHEN hashtext($1)<0 THEN 4294967295 ELSE 0 END)", [key])
    .then((r) => Number(r.rows[0]?.n ?? 0));

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('interview privacy read-tier prove · 隔离库 · releaseEvidence=false · est live=0');

  const ivOpen = `read-tier-open-${suffix}`;
  const ivFenced = `read-tier-fenced-${suffix}`;
  const ivPaused = `read-tier-paused-${suffix}`;
  const ivOther = `read-tier-other-${suffix}`;
  await seedInterview(OWN, ivOpen);
  await seedInterview(OWN, ivFenced);
  await seedInterview(OWN, ivPaused);
  await seedInterview(OTHER, ivOther);
  await fenceInterview(OWN, ivFenced, `fence:${suffix}`);
  await fenceInterview(OWN, ivPaused, `pause:${suffix}`);
  await fenceInterview(OTHER, ivOther, `other:${suffix}`);
  // 0076 legacy pause 面：请求体转 authorization_paused（围栏必须保持·read 分层不得泄漏）。
  await pool.query(
    `UPDATE privacy_erasure_request r SET status='authorization_paused'
      WHERE r.id = (SELECT pt.request_id FROM privacy_checkpoint_target pt WHERE pt.thread_id=$1)`,
    [ivPaused],
  );

  // ── R1 read twin ↔ locking 谓词布尔恒等（未围栏面）──
  {
    const ownPair = await asPrincipal(pool, OWN, async (c) => ({
      locked: (await c.query('SELECT interview_privacy_active($1) AS v', [ivOpen])).rows[0].v as boolean,
      read: (await c.query('SELECT interview_privacy_active_read($1) AS v', [ivOpen])).rows[0].v as boolean,
    }));
    A('R1 未围栏 own 场：locking=true·read twin=true 恒等', ownPair.locked === true && ownPair.read === true);

    const crossPair = await asPrincipal(pool, OTHER, async (c) => ({
      locked: (await c.query('SELECT interview_privacy_active($1) AS v', [ivOpen])).rows[0].v as boolean,
      read: (await c.query('SELECT interview_privacy_active_read($1) AS v', [ivOpen])).rows[0].v as boolean,
    }));
    A('R1 跨主体：locking=false·read twin=false 恒等（fail-closed 同形）', crossPair.locked === false && crossPair.read === false);

    const client = await pool.connect();
    let blankLocked = false;
    let blankRead = false;
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.principal_user','',true)");
      const blank = await client.query('SELECT interview_privacy_active($1) AS locked, interview_privacy_active_read($1) AS read', [ivOpen]);
      blankLocked = blank.rows[0].locked === false;
      blankRead = blank.rows[0].read === false;
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
    A('R1 空 principal：locking=false·read twin=false 恒等（fail-closed）', blankLocked && blankRead);
  }

  // ── R2 围栏中双 false + read twin 零 advisory 锁判别 ──
  {
    const lockKey = `meetwise:interview_privacy:${ivFenced}`;
    await asPrincipal(pool, OWN, async (c) => {
      const lockedFalse = (await c.query('SELECT interview_privacy_active($1) AS v', [ivFenced])).rows[0].v === false;
      // 单参 advisory 锁（classid=0·objid=hashtext(key)）：本事务可见自己的锁。
      const held = await advisoryLockCount(c, lockKey);
      A('R2 围栏中 locking 谓词=false 且持有同键 advisory 锁（admission 串行化承重面在位）', lockedFalse && held >= 1);
    });
    await asPrincipal(pool, OWN, async (c) => {
      const readFalse = (await c.query('SELECT interview_privacy_active_read($1) AS v', [ivFenced])).rows[0].v === false;
      const held = await advisoryLockCount(c, lockKey);
      A('R2 围栏中 read twin=false 且同键 advisory 锁零命中（无锁逐行判别）', readFalse && held === 0);
    });
  }

  // ── R3 fenced_targets 聚合集 = 逐行求值集恒等 ──
  {
    const aggregated = (await asPrincipal(pool, OWN, (c) =>
      c.query('SELECT thread_id FROM interview_privacy_fenced_targets()')))
      .rows.map((r: Record<string, unknown>) => String(r.thread_id)).sort();
    const perRow = (await asPrincipal(pool, OWN, async (c) => {
      const ids = (await c.query('SELECT id FROM interview ORDER BY id')).rows.map((r: { id: string }) => String(r.id));
      const out: string[] = [];
      for (const id of ids) {
        if ((await c.query('SELECT interview_privacy_active($1) AS v', [id])).rows[0].v === false) out.push(id);
      }
      return out;
    })).sort();
    A('R3 owner 聚合集=逐行 locking 求值集恒等（含 fenced+paused·排除 open）',
      JSON.stringify(aggregated) === JSON.stringify([ivFenced, ivPaused].sort()) && JSON.stringify(aggregated) === JSON.stringify(perRow));

    const otherSet = (await asPrincipal(pool, OTHER, (c) =>
      c.query('SELECT thread_id FROM interview_privacy_fenced_targets()')))
      .rows.map((r: Record<string, unknown>) => String(r.thread_id)).sort();
    A('R3 跨主体隔离：other 聚合集仅含 own 围栏场（不串户）', JSON.stringify(otherSet) === JSON.stringify([ivOther]));
  }

  // ── R4 ACL 形 + 权威体零漂 + authorization_paused 围栏不泄漏 ──
  {
    const acl = await pool.query(
      `SELECT has_function_privilege('app_role','interview_privacy_active_read(text)','EXECUTE') AS ar,
              has_function_privilege('public','interview_privacy_active_read(text)','EXECUTE') AS pr,
              has_function_privilege('app_role','interview_privacy_fenced_targets()','EXECUTE') AS af,
              has_function_privilege('public','interview_privacy_fenced_targets()','EXECUTE') AS pf`,
    );
    const row = acl.rows[0];
    A('R4 ACL：read twin/fenced_targets 均 app_role EXECUTE=true·PUBLIC=false',
      row.ar === true && row.pr === false && row.af === true && row.pf === false);

    const body = await pool.query(
      `SELECT p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname='interview_privacy_active'`,
    );
    const prosrc = body.rows.length === 1 ? String(body.rows[0].prosrc) : '';
    A('R4 权威体字节零漂：interview_privacy_active 恰单体且体=0076 替换体（同键锁行在位·7 状态在位·零改写）',
      body.rows.length === 1 && prosrc.trim() === AUTHORITY_BODY
      && prosrc.includes('pg_advisory_xact_lock') && prosrc.includes('authorization_paused'));

    const pausedPair = await asPrincipal(pool, OWN, async (c) => ({
      lockedFalse: (await c.query('SELECT interview_privacy_active($1) AS v', [ivPaused])).rows[0].v === false,
      readFalse: (await c.query('SELECT interview_privacy_active_read($1) AS v', [ivPaused])).rows[0].v === false,
      aggregated: (await c.query('SELECT 1 FROM interview_privacy_fenced_targets() WHERE thread_id=$1', [ivPaused])).rowCount === 1,
    }));
    A('R4 authorization_paused：locking=false·read twin=false·聚合集含——paused 围栏在 read 分层零泄漏',
      pausedPair.lockedFalse && pausedPair.readFalse && pausedPair.aggregated);
  }

  console.log(fail === 0 ? '\n✓ privacy_active read 分层四臂全绿（read twin 恒等/零锁判别/聚合恒等/ACL+权威零漂）'
    : `\n✗ ${fail} 臂失败`);
  await pool.end();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'interview_privacy_read_tier_proof_failed');
  await pool.end();
  process.exit(1);
});
