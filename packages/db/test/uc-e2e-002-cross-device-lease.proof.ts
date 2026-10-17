/**
 * UC-E2E-002 focused NON-UI integration prove (eval-first · packages/db).
 *
 * TC-E2E-002-lease-race / A2 / A3 (partial):
 *   L1 concurrent same-owner dual leaseOwner → exactly one acquires while holder open
 *   L2 after release, second principal-device can acquire (sequential resume fence)
 *   L3 cross-principal: other owner sees 0 rows / cannot steal fence (404/0-row semantics)
 *
 * NO Playwright · NO MODEL_API_KEY · NO HTTP dual-session e2e.
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-002 covered · ≠ 双 HTTP session
 *
 *   pnpm uc002:lease:prove
 *   pnpm -C packages/db prove:uc002-lease   (raw; needs isolated DATABASE_URL)
 *
 * Matrix may rise to **partial** only when this file's asserts run green.
 * Do NOT claim covered until HTTP lease mouth (+ snapshot/full.e2e/UI) exist.
 * HTTP dual GET + Last-Event-ID: see apps/api/test/uc-e2e-002-cross-device-http.proof.ts (still ≠ covered).
 */
import { readFileSync } from 'node:fs';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  withInterviewGraphFence, assertInterviewGraphFence, renewInterviewGraphFence,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc002-${k}-${S}`;
const TID = (k: string) => `uc002-thread-${k}-${S}`;

async function seedInterview(owner: string, interviewId: string) {
  await pool.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, owner],
  );
}

async function graphRowsVisible(principal: string, threadId: string): Promise<number> {
  return asPrincipal(pool, principal, (c) => c.query(
    'SELECT count(*)::int n FROM ai_graph_run WHERE thread_id=$1',
    [threadId],
  )).then((r) => r.rows[0].n as number);
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-002 cross-device lease prove · NON-UI · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿≠UC-E2E-002 covered；integration lease CAS only；HTTP dual GET/LED → see uc002:http:prove；≠ HTTP lease mouth / Playwright');

  // ── L1: concurrent same-owner dual leaseOwner race (TC-E2E-002-lease-race) ──
  section('L1 · 同 owner 双 leaseOwner 并发抢 fence：恰一胜，输者 acquired=false');
  {
    const owner = OWN('race');
    const threadId = TID('race');
    await seedInterview(owner, threadId);

    let openFirst!: () => void;
    let firstEntered!: () => void;
    const firstOpen = new Promise<void>((resolve) => { openFirst = resolve; });
    const firstInside = new Promise<void>((resolve) => { firstEntered = resolve; });

    const fenceOneP = withInterviewGraphFence(pool, owner, threadId, 'device-a', async (fence) => {
      firstEntered();
      const ok = await asPrincipal(pool, owner, (c) => assertInterviewGraphFence(c, fence));
      A('L1 holder assertInterviewGraphFence=true', ok === true);
      await firstOpen;
      return 'first';
    });
    await firstInside;

    const fenceTwo = await withInterviewGraphFence(pool, owner, threadId, 'device-b', async () => 'second');
    A('L1 并发第二 device → acquired=false（无双跑）', fenceTwo.acquired === false);

    openFirst();
    const fenceOne = await fenceOneP;
    A('L1 首 device 正常完成', fenceOne.acquired === true && fenceOne.value === 'first');
  }

  // ── L2: after release, second device can acquire (sequential cross-device resume) ──
  section('L2 · 释放后第二 device 可顺序取得 fence（顺序 resume 的 lease 面）');
  {
    const owner = OWN('seq');
    const threadId = TID('seq');
    await seedInterview(owner, threadId);

    const a = await withInterviewGraphFence(pool, owner, threadId, 'device-a', async (fence) => fence.version);
    A('L2 device-a 取得 fence', a.acquired === true);
    const versionA = a.acquired ? a.value : -1;

    const b = await withInterviewGraphFence(pool, owner, threadId, 'device-b', async (fence) => fence.version);
    A('L2 device-b 在 a 释放后取得 fence', b.acquired === true);
    A('L2 version CAS 递增', b.acquired === true && typeof b.value === 'number' && b.value > versionA);
  }

  // ── L3: cross-principal blocked (A3 / 0-row · 不泄露) ──
  section('L3 · 错主体看不到 / 抢不到他人 thread lease（404/0 行语义）');
  {
    const owner = OWN('own');
    const other = OWN('oth');
    const threadId = TID('own');
    await seedInterview(owner, threadId);
    await seedInterview(other, TID('oth-dummy')); // other exists as principal; no rights on owner thread

    let openHold!: () => void;
    let held!: () => void;
    const holdOpen = new Promise<void>((resolve) => { openHold = resolve; });
    const inside = new Promise<void>((resolve) => { held = resolve; });

    const holdP = withInterviewGraphFence(pool, owner, threadId, 'device-owner', async () => {
      held();
      await holdOpen;
      return 'hold';
    });
    await inside;

    A('L3 属主可见 ≥1 行 ai_graph_run', (await graphRowsVisible(owner, threadId)) >= 1);
    A('L3 他主体 RLS 下见 0 行', (await graphRowsVisible(other, threadId)) === 0);

    // Wrong principal + same threadId: privacy/RLS prevents steal; must not report acquired.
    let otherAcquired: boolean | 'threw' = 'threw';
    try {
      const otherFence = await withInterviewGraphFence(pool, other, threadId, 'device-attacker', async () => 'stolen');
      otherAcquired = otherFence.acquired;
    } catch {
      otherAcquired = 'threw';
    }
    A('L3 他主体抢 fence → 未取得（false 或抛错）', otherAcquired === false || otherAcquired === 'threw');
    A('L3 属主行仍可见（未被偷走）', (await graphRowsVisible(owner, threadId)) >= 1);

    openHold();
    const hold = await holdP;
    A('L3 属主 hold 正常完成', hold.acquired === true);
  }

  // ══ 事务级 fence 形新臂（X1 真并发恰一胜 / X2 同 leaseOwner 接管 fail-closed 判别 / X3 锁连接占用收窄）══
  // ── X1: 真并发双 begin（同一事件循环同拍发起）：事务级锁串行化，恰一 acquired（FENCE_RACE 面复证）。
  section('X1 · 真并发双 begin（事务级锁形）：恰一 acquired');
  {
    const owner = OWN('x1');
    const threadId = TID('x1');
    await seedInterview(owner, threadId);
    const [r1, r2] = await Promise.all([
      withInterviewGraphFence(pool, owner, threadId, 'device-a', async () => 'a'),
      withInterviewGraphFence(pool, owner, threadId, 'device-b', async () => 'b'),
    ]);
    const acquiredCount = (r1.acquired ? 1 : 0) + (r2.acquired ? 1 : 0);
    A('X1 真并发双 begin 恰一 acquired', acquiredCount === 1);
    A('X1 胜者完成/败者 acquired=false 形', (r1.acquired && r1.value === 'a' && !r2.acquired)
      || (r2.acquired && r2.value === 'b' && !r1.acquired));
  }

  // ── X2 (判别臂·改前红): 同 leaseOwner 重复 begin——session 锁形下 try-lock 立即拒绝
  //     (acquired=false)；事务级锁形下行锁串行后 CAS 接管 version+1，前任 assert/renew
  //     三项同判 fail-closed 翻 false（checkpoint 写守门谓词=消费层写必被拒的可判别面）。
  section('X2 · 同 leaseOwner 重复 begin：version 严格递增+前任 assert/renew fail-closed');
  {
    const owner = OWN('x2');
    const threadId = TID('x2');
    await seedInterview(owner, threadId);
    let openFirst!: () => void;
    let firstEntered!: () => void;
    let staleVersion = -1;
    const firstOpen = new Promise<void>((resolve) => { openFirst = resolve; });
    const firstInside = new Promise<void>((resolve) => { firstEntered = resolve; });

    const firstP = withInterviewGraphFence(pool, owner, threadId, 'worker-w1', async (fence) => {
      staleVersion = fence.version;
      firstEntered();
      await firstOpen;
      return 'first';
    });
    await firstInside;

    const takeover = await withInterviewGraphFence(pool, owner, threadId, 'worker-w1', async (fence) => fence.version);
    A('X2 同 leaseOwner 重复 begin 接管成功且 version 严格递增', takeover.acquired === true && takeover.value === staleVersion + 1);

    const staleFence = { owner, interviewId: threadId, leaseOwner: 'worker-w1', version: staleVersion };
    const staleAssert = await asPrincipal(pool, owner, (c) => assertInterviewGraphFence(c, staleFence));
    const staleRenew = await asPrincipal(pool, owner, (c) => renewInterviewGraphFence(c, staleFence));
    A('X2 前任版本 assertInterviewGraphFence 翻 false（fail-closed·checkpoint 写守门谓词=写必被消费层拒）', staleAssert === false);
    A('X2 前任版本 renewInterviewGraphFence 不复活（三项同判）', staleRenew === false);

    openFirst();
    const first = await firstP;
    A('X2 首任正常完成（业务投影零污染·四护栏+heartbeat 停跳承重）', first.acquired === true && first.value === 'first');
  }

  // ── X3 (判别臂·改前红): 锁连接占用收窄形——invoke 运行中同键 advisory 锁零悬挂
  //     （session 锁形下 fn 全程持有=红；事务级锁形下 COMMIT 即释放=绿）+ 源级形制
  //     （专用连接/session unlock 语句零残留）。
  section('X3 · 锁连接占用收窄：begin 事务外无 advisory 锁悬挂+源级形制');
  {
    const owner = OWN('x3');
    const threadId = TID('x3');
    await seedInterview(owner, threadId);
    let openHold!: () => void;
    let held!: () => void;
    const holdOpen = new Promise<void>((resolve) => { openHold = resolve; });
    const inside = new Promise<void>((resolve) => { held = resolve; });

    const holdP = withInterviewGraphFence(pool, owner, threadId, 'device-holder', async () => {
      held();
      await holdOpen;
      return 'hold';
    });
    await inside;
    const lockKey = `${owner}:${threadId}`;
    // pg_locks classid/objid 以 32 位位型呈无符号,hashtext() 回有符号 int32——双 int4 形
    // pg_advisory_xact_lock(hashtext(a),hashtext(b)) 逐键按 uint32 落 classid/objid（无 int64
    // 宽化拆分）。比较双侧显式归一无符号域：'adaptive-interview' 哈希为负,其 classid=无符号
    // 重释值,带符号形比较即失配——判别力不得随哈希符号空真。
    const dangling = Number((await pool.query(
      "SELECT count(*)::int n FROM pg_locks WHERE locktype='advisory' AND classid::bigint=(hashtext($1)::bigint & 4294967295) AND objid::bigint=(hashtext($2)::bigint & 4294967295)",
      ['adaptive-interview', lockKey],
    )).rows[0].n);
    A('X3 invoke 运行中同键 advisory 锁零悬挂（连接只在 begin 短事务内占用）', dangling === 0);

    const source = readFileSync(new URL('../src/interview/interview-graph-lease.ts', import.meta.url), 'utf8');
    A('X3 源级形制：session 锁三件（try_lock/unlock/专用 connect）零残留·事务级锁在位',
      !source.includes('pg_try_advisory_lock') && !source.includes('pg_advisory_unlock')
      && !source.includes('pool.connect()') && source.includes('pg_advisory_xact_lock'));

    openHold();
    const hold = await holdP;
    A('X3 属主 hold 正常完成', hold.acquired === true);
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-002 L1–L3+X1–X3 lease CAS integration passed (partial ladder only; ≠ covered; ≠ HTTP dual-session)'
    : `✗ ${fail} UC-E2E-002 lease asserts failed`}`);
  console.log('BLOCKED_FOR_COVERED: HTTP lease mouth + snapshot route + Playwright dual + full.e2e (HTTP GET/LED advanced via uc002:http:prove; ≠ covered)');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
