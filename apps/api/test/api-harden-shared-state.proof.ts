/**
 * API-HARDEN 共享化行为 prove（#36/#37/#17/#129/#118 六件断言面·隔离库·est live=0）。
 *
 * 臂面（双池=模拟双实例；同进程单 LISTEN 单例=广播收播真实线，跨进程缓存分身由双池读写两侧扮演）：
 *   S1 SLOT-SHARED      双实例交替 acquireSlot('sse:proof',5) 合计恰 5、第 6 拒(false→调用点 429 语义)；
 *                       release 对称减零减穿；E7a 过期接管:held_until 过去→acquire 原子接管 n 归 1。
 *   S2 BUCKET-SHARED    双实例交替 allow('login:proof:global',3,0) 合计恰 3；跨实例补充折算；
 *                       hasToken 非消费探针跨实例同形(消费可见、探查不扣额)。
 *   W1 EVICT-WIRE       A 池读回填缓存 → B 池 UPDATE pwd_epoch(0189 触发器同事务 pg_notify) →
 *                       广播送达窗内(<1s·裁决② 预算)守卫缓存被逐、重查得新代次。
 *   W2 APPROVAL-WIRE    B 池 UPDATE role/approval_status(件④ 审批态·grant 方向) → 广播窗内
 *                       accountState 读得新 role/approval(#118 一查五列读侧)。
 *   T1 TOCTOU-GUARD     「DB 读完成→广播→回填」交错(db 桩在 query 解析前注入 notePrincipalEvicted)：
 *                       本请求用读得值但**不落缓存**(下一调用必重查)——uid 侧+jti 侧同形。
 *   T2 EVICT-SEQ        单调 evict 序契约：notePrincipalEvicted 每调 +1(本地与收播同源)。
 *   D1 DEGRADED-FALLBACK db 桩恒抛 → 共享桶 allow 走本地桶(fail-open 保可用)、acquireSlot fail-open
 *                       放行；结构化降级日志(console.warn RL_SHARED_DEGRADED)被捕获。
 *   M1 MEM-LRU(#129)    RL_MEM_CAPACITY=3 时进程内桶 5 distinct key → Map 尺寸=3(淘汰最旧,新 key 满额建桶)。
 *
 * 运行：pnpm -C apps/api prove:api-harden（隔离 runner 注入全迁移链·含 0189）。
 * releaseEvidence=false · Not HA · 本绿≠跨进程端到端(双实例拓扑面) · actualSpendCny=null
 */
import { randomUUID } from 'node:crypto';
import { createPool, assertIsolatedTestTarget, asGateway, asPrincipal } from '@meetwise/db';
import type { Client, DbPool } from '@meetwise/db';
import { hashPassword } from '@meetwise/domain';
import { RateLimitService } from '../src/platform/rate-limit.service.ts';
import { accountState } from '../src/platform/principal.guard.ts';
import { isSessionActive, issueSessionToken } from '../src/platform/auth-session.ts';
import { getSseNotify, notePrincipalEvicted as noteEvict, principalEvictGeneration } from '../src/platform/sse-notify.service.ts';

/** 双实例模拟:每池一个结构形 DbService(DbService 构造器自建池,proof 需指定池故按同形薄封装)。 */
function dbFromPool(pool: DbPool) {
  return {
    pool,
    asPrincipal: <T>(user: string, fn: (c: Client) => Promise<T>): Promise<T> => asPrincipal(pool, user, fn),
    asGateway: <T>(fn: (c: Client) => Promise<T>): Promise<T> => asGateway(pool, fn),
  } as unknown as DbServiceLike;
}
interface DbServiceLike {
  pool: DbPool;
  asPrincipal<T>(user: string, fn: (c: Client) => Promise<T>): Promise<T>;
  asGateway<T>(fn: (c: Client) => Promise<T>): Promise<T>;
}

process.env.AUTH_SECRET ??= 'api-harden-proof-secret';
process.env.RESUME_ENC_KEY ??= 'api-harden-resume-enc-key';
process.env.RESUME_HASH_SECRET ??= 'api-harden-resume-hash-secret';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 计数 asPrincipal 包装(结构形兼容 DbService 被 accountState 使用)。 */
function countingDb(real: DbServiceLike) {
  const state = { n: 0 };
  const wrapped = {
    n: () => state.n,
    asPrincipal: async <T>(user: string, fn: (c: unknown) => Promise<T>): Promise<T> => {
      state.n += 1;
      return real.asPrincipal(user, fn as never);
    },
  };
  return wrapped as unknown as DbServiceLike & { n: () => number };
}

/** db 桩:query 在解析前注入副作用(模拟「读完成前/后广播到达」的交错),并可脚本化返回行。 */
function interleavedDb(onQuery: () => void, rows: unknown[], rowCount = rows.length) {
  return {
    asPrincipal: async <T>(_user: string, fn: (c: { query: () => Promise<{ rows: unknown[]; rowCount: number }> }) => Promise<T>): Promise<T> =>
      fn({
        query: async () => {
          const r = { rows, rowCount };
          onQuery();
          return r;
        },
      }) as T,
  } as unknown as DbServiceLike;
}

function throwingDb() {
  return {
    pool: {
      query: async () => { throw new Error('pg_down_injected'); },
    },
  } as unknown as DbServiceLike;
}

async function main() {
  const poolA: DbPool = createPool({ purpose: 'api' });
  const poolB: DbPool = createPool({ purpose: 'api' });
  await assertIsolatedTestTarget(poolA);
  await assertIsolatedTestTarget(poolB);
  const dbA = dbFromPool(poolA);
  const dbB = dbFromPool(poolB);
  const rlA = new RateLimitService(dbA);
  const rlB = new RateLimitService(dbB);

  // 种子主体(唯一 email;gateway 网关函数产 active 账户 pwd_epoch=0)。
  const uid = randomUUID();
  await dbA.asGateway((c) => c.query('SELECT gateway_auth_signup($1,$2,$3,$4)', [uid, `api-harden-${uid}@proof.test`, hashPassword('proof-password-1'), 'candidate']));

  // ── S1 共享槽:双实例交替恰 5·第 6 拒·零减穿·E7a 过期接管 ──
  {
    const key = `sse:${uid}`;
    let granted = 0;
    for (let i = 0; i < 5; i++) {
      const ok = i % 2 === 0 ? await rlA.acquireSlot(key, 5) : await rlB.acquireSlot(key, 5);
      if (ok) granted += 1;
    }
    A('S1 双实例交替占槽合计恰 5', granted === 5);
    A('S1 第 6 槽双实例皆拒(429 语义上游=false)', (await rlA.acquireSlot(key, 5)) === false && (await rlB.acquireSlot(key, 5)) === false);
    await rlB.releaseSlot(key);
    A('S1 对侧 release 腾出一槽 → A 可再占(跨实例可见)', (await rlA.acquireSlot(key, 5)) === true);
    await rlA.releaseSlot(key);
    await rlA.releaseSlot(key);
    await rlA.releaseSlot(key);
    await rlA.releaseSlot(key);
    await rlA.releaseSlot(key);   // 恰量 release:减到 1 删行;超减零穿(行已删,DELETE 零行,不抛)
    const nAfter = await poolA.query('SELECT n FROM platform_slot_lease WHERE slot_key=$1', [key]);
    A('S1 零减穿:恰量+对齐 release 后计数行删尽(n 永不为负)', nAfter.rows.length === 0);
    // E7a:崩溃残留占用(held_until 已过期)→ 下一次 acquire 原子接管 n 归 1。
    await poolB.query("INSERT INTO platform_slot_lease(slot_key, n, held_until_ms) VALUES ($1, 5, 1) ON CONFLICT (slot_key) DO UPDATE SET n=5, held_until_ms=1", [key]);
    const takeover = await rlB.acquireSlot(key, 5);
    const nRow = await poolA.query('SELECT n, held_until_ms FROM platform_slot_lease WHERE slot_key=$1', [key]);
    A('S1 E7a 过期接管:满额残留被原子接管且 n 归 1', takeover === true && nRow.rows[0]?.n === 1 && Number(nRow.rows[0]?.held_until_ms) > Date.now());
    await rlB.releaseSlot(key);
  }

  // ── S2 共享桶:双实例交替消费+补充折算+hasToken 非消费探针 ──
  {
    const gKey = 'login:proof:global';
    const t0 = 1_000_000_000;
    let ok = 0;
    for (let i = 0; i < 4; i++) {
      const allowed = i % 2 === 0 ? await rlA.allow(gKey, 3, 0, t0) : await rlB.allow(gKey, 3, 0, t0);
      if (allowed) ok += 1;
    }
    A('S2 双实例交替消费合计恰 3(×2 稀释归零),第 4 拒', ok === 3);
    A('S2 跨实例补充折算:10s×0.1/s → 对侧再放行 1', (await rlB.allow(gKey, 3, 0.1, t0 + 10_000)) === true);
    const ipKey = 'chgpwd:ip:203.0.113.9';
    A('S2 ip 桶双实例消费 2/2', (await rlA.allow(ipKey, 2, 0, t0)) && (await rlB.allow(ipKey, 2, 0, t0)));
    A('S2 hasToken 探针跨实例见消费(已空=false)', (await rlA.hasToken(ipKey, 2, 0, t0)) === false);
    A('S2 hasToken 非消费:探后 allow 仍拒(探查不扣额)', (await rlB.allow(ipKey, 2, 0, t0)) === false);
    A('S2 补满后探针转 true', (await rlB.hasToken(ipKey, 2, 0.01, t0 + 600_000)) === true);
  }

  // ── W1 吊销广播线:0189 触发器 → pg_notify → LISTEN 第二通道 → 逐缓存重查 ──
  {
    const h = await getSseNotify().whenHealthy();
    A('W0 LISTEN 健康(第二通道随 0143 同连接建立)', h.healthy);
    const cnt = countingDb(dbA);
    const st1 = await accountState(cnt, uid, Date.now());
    await accountState(cnt, uid, Date.now());
    A('W1 首查落缓存(第二次调用零新查询)', cnt.n() === 1 && st1.epoch === 0 && st1.active === true);
    await poolB.query('UPDATE user_account SET pwd_epoch = pwd_epoch + 1 WHERE id=$1', [uid]);
    const t0 = Date.now();
    let evicted = false;
    let observed = { epoch: -1, elapsed: Number.MAX_SAFE_INTEGER };
    while (Date.now() - t0 < 1000) {
      await sleep(20);
      const st = await accountState(cnt, uid, Date.now());
      if (cnt.n() > 1) {
        evicted = true;
        observed = { epoch: st.epoch, elapsed: Date.now() - t0 };
        break;
      }
    }
    A(`W1 广播送达窗内缓存被逐并重查得新代次(<1s·实测 ${evicted ? observed.elapsed : 'timeout'}ms)`, evicted && observed.epoch === 1);
  }

  // ── W2 审批态广播线(件④·grant 方向;对称 revoke 方向同触发器同窗)──
  {
    await poolB.query("UPDATE user_account SET role='recruiter', approval_status='approved' WHERE id=$1", [uid]);
    const t0 = Date.now();
    let seen = false;
    while (Date.now() - t0 < 1000) {
      await sleep(20);
      const st = await accountState(dbA, uid, Date.now());
      if (st.role === 'recruiter' && st.approvalStatus === 'approved') { seen = true; break; }
    }
    A('W2 审批态变更广播窗内 B 端守卫读侧生效(一查五列)', seen);
  }

  // ── T1 回填代次比对(TOCTOU):读完成→广播→回填交错,陈旧态不落缓存 ──
  {
    const uidT = `toctou-${randomUUID()}`;
    // ① uid 侧:query 返回旧行,但解析前广播到达(代次前进)→ 本请求用值,缓存必不落。
    const staleRow: Record<string, unknown> = { status: 'active', role: 'candidate' };
    staleRow['pwd_epoch'] = 5;
    staleRow['approval_status'] = null;
    staleRow['is_admin'] = null;
    const stale = interleavedDb(() => noteEvict('uid', uidT), [staleRow]);
    const st = await accountState(stale, uidT, Date.now());
    A('T1 交错读返回值仅本请求可用(值如实)', st.epoch === 5 && st.active === true);
    const fresh = countingDb(dbA);
    const st2 = await accountState(fresh, uidT, Date.now());
    A('T1 陈旧读未落缓存(重查发生且读得真值:该主体不存在 epoch=-1,非缓存旧值 5)', fresh.n() === 1 && st2.epoch === -1);
    // ② jti 侧同形。
    const jti = randomUUID();
    const staleJ = interleavedDb(() => noteEvict('jti', jti), [], 1);
    A('T1 jti 交错读返回值如实(active)', (await isSessionActive(staleJ, uidT, jti, Date.now())) === true);
    const freshJ = countingDb(dbA);
    A('T1 jti 陈旧读未落缓存(重查发生且读得真值:无会话行=false,非缓存 true)', (await isSessionActive(freshJ, uidT, jti, Date.now())) === false && freshJ.n() === 1);
  }

  // ── T2 单调 evict 序契约 ──
  {
    const k = randomUUID();
    const g0 = principalEvictGeneration('uid', k);
    noteEvict('uid', k);
    noteEvict('uid', k);
    A('T2 evict 序单调自增(本地与收播同源)', g0 === 0 && principalEvictGeneration('uid', k) === 2);
  }

  // ── D1 降级形:PG 恒抛 → 桶本地兜底 + 槽 fail-open + 结构化降级日志 ──
  {
    const lines: string[] = [];
    const origWarn = console.warn;
    console.warn = (l: unknown) => { if (typeof l === 'string') lines.push(l); };
    try {
      const rlD = new RateLimitService(throwingDb());
      A('D1 共享桶 PG 不可达 → 本地桶兜底放行(可用性优先)', (await rlD.allow('login:degraded:global', 3, 0)) === true);
      A('D1 槽 PG 不可达 → fail-open 放行(资源保护非安全边界)', (await rlD.acquireSlot('sse:degraded', 5)) === true);
      A('D1 降级转变打一行结构化日志(RL_SHARED_DEGRADED)', lines.some((l) => l.startsWith('RL_SHARED_DEGRADED reason=pg_error')));
    } finally {
      console.warn = origWarn;
    }
  }

  // ── M1 进程内桶 LRU 上限(#129)──
  {
    process.env.RL_MEM_CAPACITY = '3';
    const rlM = new RateLimitService();   // 无 db=纯进程内模式
    for (const e of ['a@x.test', 'b@x.test', 'c@x.test', 'd@x.test', 'e@x.test']) {
      await rlM.allow(`login:${e}`, 5, 0.2);
    }
    const size = (rlM as unknown as { buckets: Map<string, unknown> }).buckets.size;
    A('M1 容量上限 3:5 distinct key 后 Map 尺寸有界(淘汰最旧)', size === 3);
    A('M1 淘汰后新 key 满额桶语义正常(可消费)', (await rlM.allow('login:f@x.test', 5, 0.2)) === true);
    delete process.env.RL_MEM_CAPACITY;
  }

  // jti 真吊销线(revokeSession 单语句 CTE 内 UPDATE+NOTIFY 同事务):同进程本地 evict 即时面。
  {
    const token = await issueSessionToken(dbA, uid, 1);
    const row = await poolA.query('SELECT 1 AS ok FROM auth_user_session WHERE user_id=$1 AND revoked_at IS NULL LIMIT 1', [uid]);
    A('J1 签发带 jti 会话行(守卫吊销真相源在位)', token !== null && row.rows.length === 1);
  }

  await getSseNotify().stop();
  await poolA.end().catch(() => undefined);
  await poolB.end().catch(() => undefined);

  console.log(`\n${failures === 0 ? '✓ api-harden shared-state passed' : `✗ ${failures} failed`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('PROOF_CRASH', e); process.exit(1); });
