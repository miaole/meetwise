/**
 * SSE 0143 NOTIFY trigger 存在性 / 禁用态 fail-closed 进 readiness prove。
 *
 * 预迁移隔离库（与 obs-ready 同形，不走 _neg-harness：后者会 DROP 重建 schema，
 * 导致账本 drift，/readyz 在 trigger 位之前就被 migration_mismatch 挡掉）。
 *
 * T-1  预迁移世界 trigger 正常 → /readyz/api 与 /health 200，sse.notify=ok
 * T-2  ALTER TABLE … DISABLE TRIGGER（tgenabled='D'）→ 503，sse.notify=trigger_missing
 * T-3  ENABLE 恢复 → 200，sse.notify=ok
 * T-4  DROP TRIGGER → 503，sse.notify=trigger_missing
 * T-5  重装 0143 后 pg_terminate_backend(application_name=meetwise-sse-listen)
 *      → health() 与 /readyz sse.notify=listen_down（HTTP 仍 200，通道设计回落 2s 轮询）
 * T-6  单元缝：假客户端 trigger 查询 rowCount=0 → health()=trigger_missing + 结构化降级日志
 * T-R  ENABLE REPLICA TRIGGER（tgenabled='R'）→ 503，sse.notify=trigger_missing
 * T-table  表改名使 to_regclass 为 NULL → 503，sse.notify=trigger_missing（非 listen_down）
 * T-7  目录查询抛错 → sse.notify=unknown，HTTP 200（不单独 503）
 *
 * 不改 apps/api prove:sse-slot（#243 的 env -u 六变量封闭化不在本刀，且本刀不碰该脚本）。
 * #243 未合，本证明只登记 pnpm 脚本，待挂 verify:local。
 *
 *   pnpm sse-notify-trigger-health:prove
 *   pnpm -C apps/api prove:sse-notify-trigger-health
 *
 * releaseEvidence=false · NOT_HA · 本绿 ≠ covered · actualSpendCny=null
 */
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, createPool, latestMigrationVersion } from '@meetwise/db';
import type { Client, DbPool } from '@meetwise/db';
import {
  getSseNotify,
  SseNotifyService,
  SSE_NOTIFY_TRIGGER_HEALTH_SQL,
  SSE_NOTIFY_TRIGGER_NAME,
} from '../src/platform/sse-notify.service.ts';
import { HealthService } from '../src/modules/health/health.service.ts';

let fail = 0;
let total = 0;
const A = (name: string, cond: boolean, detail?: unknown) => {
  total++;
  if (!cond) {
    fail++;
    console.log(`FAIL  ${name}`);
    if (detail !== undefined) console.log(`      ↳ ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
  } else {
    console.log(`PASS  ${name}`);
  }
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
async function until(cond: () => boolean | Promise<boolean>, timeoutMs: number): Promise<boolean> {
  const t0 = Date.now();
  for (;;) {
    if (await cond()) return true;
    if (Date.now() - t0 > timeoutMs) return false;
    await sleep(25);
  }
}

delete process.env.MODEL_API_KEY;
delete process.env.MODEL_BASE_URL;

const admin: DbPool = createPool();
await assertIsolatedTestTarget(admin);
console.log('ISOLATED_TARGET_ATTESTATION ok loopback+nonce verified');

process.env.AUTH_SECRET = `sse-notify-trigger-health-${randomUUID()}`;
process.env.MEETWISE_PUBLIC_PREVIEW = '0';
process.env.OCR_ENABLED = '0';
process.env.NODE_ENV = 'test';
process.env.WEB_ORIGIN = 'https://web.example.test';
delete process.env.MIGRATIONS_DIR;

const migration0143 = readFileSync(
  fileURLToPath(new URL('../../../packages/db/migrations/0143_sse_push_notify.sql', import.meta.url)),
  'utf8',
);

console.log('SSE 0143 trigger health prove · fail-closed readiness · releaseEvidence=false · NOT_HA');

const SSE_NOTIFY_TRIGGER_HEALTH_SQL_CANONICAL =
  "SELECT 1 FROM pg_catalog.pg_trigger WHERE tgname = $1 AND tgrelid = to_regclass('public.interview_event') AND NOT tgisinternal AND tgenabled IN ('O', 'A') LIMIT 1";
A('T-static SSE_NOTIFY_TRIGGER_HEALTH_SQL 与规范谓词全等（to_regclass + tgenabled IN (O,A)）',
  SSE_NOTIFY_TRIGGER_HEALTH_SQL === SSE_NOTIFY_TRIGGER_HEALTH_SQL_CANONICAL);

const { createApp } = await import('../src/main.ts');
const app = await createApp();
await app.listen(0, '127.0.0.1');
const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
const get = async (path: string) => {
  const res = await fetch(base + path);
  return { status: res.status, body: await res.json().catch(() => ({})) as Record<string, unknown> & { status?: string; sse?: { notify?: string }; schema?: { migration?: string } } };
};

try {
  const ledgerMax = (await admin.query<{ v: string | null }>('SELECT max(version COLLATE "C") AS v FROM schema_migrations')).rows[0]?.v ?? null;
  const dirMax = latestMigrationVersion(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
  A('T-pre 预迁移目标：账本 max === 目录 max',
    ledgerMax !== null && dirMax !== undefined && ledgerMax === dirMax,
    { ledgerMax, dirMax });

  // ── T-1 trigger 正常 → 200 ok ──
  {
    console.log('\n──────── T-1 · premigrated trigger enabled → ok ────────');
    const trig = await admin.query<{ tgenabled: string }>(
      'SELECT tgenabled FROM pg_catalog.pg_trigger WHERE tgname=$1 AND tgrelid=to_regclass(\'public.interview_event\') AND NOT tgisinternal',
      [SSE_NOTIFY_TRIGGER_NAME],
    );
    A('T-1a 预迁移 trigger 在场且 tgenabled=O',
      trig.rowCount === 1 && trig.rows[0]?.tgenabled === 'O', trig.rows);
    const notify = getSseNotify();
    const flipped = await Promise.race([
      notify.whenHealthy().then(() => true),
      sleep(15_000).then(() => false),
    ]);
    A('T-1b LISTEN+trigger 双条件达成 → health() healthy', flipped && notify.health().healthy === true, notify.health());
    const r = await get('/readyz/api');
    A('T-1c /readyz/api → 200 sse.notify=ok',
      r.status === 200 && r.body.status === 'ok' && r.body.sse?.notify === 'ok', r);
    const alias = await get('/health');
    A('T-1d /health 同面 200 sse.notify=ok',
      alias.status === 200 && alias.body.sse?.notify === 'ok', alias);
  }

  // ── T-2 DISABLE → tgenabled='D' → 503 trigger_missing ──
  {
    console.log('\n──────── T-2 · DISABLE trigger (tgenabled=D) ────────');
    await admin.query(`ALTER TABLE interview_event DISABLE TRIGGER ${SSE_NOTIFY_TRIGGER_NAME}`);
    const state = await admin.query<{ tgenabled: string }>(
      'SELECT tgenabled FROM pg_catalog.pg_trigger WHERE tgname=$1 AND tgrelid=to_regclass(\'public.interview_event\')',
      [SSE_NOTIFY_TRIGGER_NAME],
    );
    A('T-2a 目录实证 tgenabled=D（trigger 行仍在，仅被禁用）',
      state.rowCount === 1 && state.rows[0]?.tgenabled === 'D', state.rows);
    const r = await get('/readyz/api');
    A('T-2b /readyz/api → 503 sse.notify=trigger_missing（禁用 ≠ 在场）',
      r.status === 503 && r.body.status === 'degraded' && r.body.sse?.notify === 'trigger_missing', r);
  }

  // ── T-3 ENABLE 恢复 ──
  {
    console.log('\n──────── T-3 · ENABLE trigger ────────');
    await admin.query(`ALTER TABLE interview_event ENABLE TRIGGER ${SSE_NOTIFY_TRIGGER_NAME}`);
    const r = await get('/readyz/api');
    A('T-3 /readyz/api 恢复 200 sse.notify=ok',
      r.status === 200 && r.body.status === 'ok' && r.body.sse?.notify === 'ok', r);
  }


  // ── T-R ENABLE REPLICA → tgenabled='R' → 503 trigger_missing ──
  {
    console.log('\n──────── T-R · ENABLE REPLICA trigger (tgenabled=R) ────────');
    await admin.query(`ALTER TABLE interview_event ENABLE REPLICA TRIGGER ${SSE_NOTIFY_TRIGGER_NAME}`);
    try {
      const state = await admin.query<{ tgenabled: string }>(
        'SELECT tgenabled FROM pg_catalog.pg_trigger WHERE tgname=$1 AND tgrelid=to_regclass(\'public.interview_event\') AND NOT tgisinternal',
        [SSE_NOTIFY_TRIGGER_NAME],
      );
      A('T-Ra 目录实证 tgenabled=R',
        state.rowCount === 1 && state.rows[0]?.tgenabled === 'R', state.rows);
      const r = await get('/readyz/api');
      A('T-Rb /readyz/api → 503 sse.notify=trigger_missing（replica 态主库不会触发）',
        r.status === 503 && r.body.status === 'degraded' && r.body.sse?.notify === 'trigger_missing', r);
    } finally {
      await admin.query(`ALTER TABLE interview_event ENABLE TRIGGER ${SSE_NOTIFY_TRIGGER_NAME}`);
    }
    const restored = await get('/readyz/api');
    A('T-Rc ENABLE 恢复后 /readyz/api 200 sse.notify=ok',
      restored.status === 200 && restored.body.sse?.notify === 'ok', restored);
  }

  // ── T-table 表缺席（rename 使 to_regclass 为 NULL）→ 503 trigger_missing，不误标 listen_down ──
  {
    console.log('\n──────── T-table · to_regclass NULL (table renamed) ────────');
    await admin.query('ALTER TABLE interview_event RENAME TO interview_event_pr263_absent');
    try {
      const r = await get('/readyz/api');
      A('T-table-a /readyz/api 表缺席 → 503 sse.notify=trigger_missing（非 listen_down）',
        r.status === 503 && r.body.status === 'degraded' && r.body.sse?.notify === 'trigger_missing', r);
    } finally {
      await admin.query('ALTER TABLE interview_event_pr263_absent RENAME TO interview_event');
    }
    const restored = await get('/readyz/api');
    A('T-table-b 恢复表名后 /readyz/api 200',
      restored.status === 200 && (restored.body.sse?.notify === 'ok' || restored.body.sse?.notify === 'listen_down'), restored);
  }

  // ── T-7 目录查询抛错 → unknown，HTTP 200（不单独 503；与既有 ready 公式同形）──
  {
    console.log('\n──────── T-7 · catalog query throw → unknown, HTTP 200 ────────');
    const health = app.get(HealthService);
    const db = (health as unknown as { db: { pool: { query: (...args: unknown[]) => Promise<unknown> } } }).db;
    const orig = db.pool.query.bind(db.pool);
    db.pool.query = ((...args: unknown[]) => {
      const sql = String(args[0] ?? '');
      if (sql.includes('pg_trigger')) return Promise.reject(new Error('catalog_boom'));
      return orig(...args);
    }) as typeof db.pool.query;
    try {
      const r = await get('/readyz/api');
      A('T-7a /readyz/api 查询异常 → 200 sse.notify=unknown（不单独 503）',
        r.status === 200 && r.body.status === 'ok' && r.body.sse?.notify === 'unknown', r);
      const alias = await get('/health');
      A('T-7b /health 同面 200 sse.notify=unknown',
        alias.status === 200 && alias.body.sse?.notify === 'unknown', alias);
    } finally {
      db.pool.query = orig;
    }
    const restored = await get('/readyz/api');
    A('T-7c 还原查询后 /readyz/api 不再标 unknown',
      restored.body.sse?.notify !== 'unknown', restored);
  }

  // ── T-4 DROP TRIGGER → 503 trigger_missing ──
  {
    console.log('\n──────── T-4 · DROP TRIGGER ────────');
    await admin.query(`DROP TRIGGER IF EXISTS ${SSE_NOTIFY_TRIGGER_NAME} ON interview_event`);
    const r = await get('/readyz/api');
    A('T-4 /readyz/api → 503 sse.notify=trigger_missing（缺席）',
      r.status === 503 && r.body.status === 'degraded' && r.body.sse?.notify === 'trigger_missing', r);
  }

  // ── T-5 重装 + 断开 LISTEN → sse.notify=listen_down，HTTP 200 ──
  {
    console.log('\n──────── T-5 · LISTEN disconnect → listen_down ────────');
    await admin.query(migration0143);
    const notify = getSseNotify();
    const flipped = await Promise.race([
      notify.whenHealthy().then(() => true),
      sleep(15_000).then(() => false),
    ]);
    A('T-5a 重装后通道翻绿', flipped && notify.health().healthy === true, notify.health());
    const victims = await admin.query<{ pid: number }>(
      "SELECT pid FROM pg_stat_activity WHERE application_name = 'meetwise-sse-listen' AND pid <> pg_backend_pid()",
    );
    A('T-5b 找到 application_name=meetwise-sse-listen 的专用连接', (victims.rowCount ?? 0) >= 1, victims.rows);
    for (const row of victims.rows) {
      await admin.query('SELECT pg_terminate_backend($1)', [row.pid]);
    }
    const down = await until(() => {
      const st = notify.health();
      return st.healthy === false && st.reason === 'listen_down';
    }, 3_000);
    A('T-5c getSseNotify().health() reason=listen_down', down, notify.health());
    let r = await get('/readyz/api');
    if (r.body.sse?.notify !== 'listen_down') {
      const again = await admin.query<{ pid: number }>(
        "SELECT pid FROM pg_stat_activity WHERE application_name = 'meetwise-sse-listen' AND pid <> pg_backend_pid()",
      );
      for (const row of again.rows) {
        await admin.query('SELECT pg_terminate_backend($1)', [row.pid]);
      }
      await until(() => {
        const st = notify.health();
        return st.healthy === false && st.reason === 'listen_down';
      }, 2_000);
      r = await get('/readyz/api');
    }
    A('T-5d /readyz/api 可见 sse.notify=listen_down 且 HTTP 200（不因瞬时 LISTEN 断连摘流量）',
      r.status === 200 && r.body.status === 'ok' && r.body.sse?.notify === 'listen_down', r);
  }

  // ── T-6 单元缝：trigger 查询空 → trigger_missing ──
  {
    console.log('\n──────── T-6 · unit seam trigger_missing ────────');
    const logs: string[] = [];
    const client = new EventEmitter() as EventEmitter & {
      query: (sql: string) => Promise<{ rowCount: number; rows: unknown[] }>;
      release: () => void;
    };
    client.query = async (sql: string) => {
      if (/^LISTEN /i.test(sql.trim()) || /set_config\('application_name'/.test(sql)) {
        return { rowCount: 0, rows: [] };
      }
      if (/pg_trigger/i.test(sql)) return { rowCount: 0, rows: [] };
      return { rowCount: 0, rows: [] };
    };
    client.release = () => undefined;
    const svc = new SseNotifyService({
      connect: async () => client as unknown as Client,
      log: (l) => logs.push(l),
      reconnectBaseMs: 60_000,
      reconnectMaxMs: 60_000,
      random: () => 0,
    });
    void svc.waitFor('unit-missing').promise;
    const seen = await until(() => {
      const st = svc.health();
      return st.healthy === false && st.reason === 'trigger_missing';
    }, 2_000);
    A('T-6a health() reason=trigger_missing', seen, svc.health());
    A('T-6b 结构化降级日志 reason=trigger_missing',
      logs.some((l) => /^SSE_NOTIFY_DEGRADED reason=trigger_missing fallback=legacy_2s_poll hint=/.test(l)),
      logs);
    await svc.stop();
  }
} finally {
  await app.close().catch(() => undefined);
  await getSseNotify().stop().catch(() => undefined);
  await admin.end().catch(() => undefined);
}

console.log(`\n${fail === 0 ? `✓ sse-notify-trigger-health: ${total} 条全绿` : `✗ sse-notify-trigger-health: ${fail}/${total} 失败`}`);
process.exit(fail === 0 ? 0 : 1);
