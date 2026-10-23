/**
 * 已投递 outbox 保留期。五臂：只删超期且已投递、批上限、表 DELETE 与函数 EXECUTE、
 * 部分索引谓词、越界天数和批大小。
 */
import { assertIsolatedTestTarget, createPool, purgeExpiredRelayedOutbox } from '@meetwise/db';
import { resolveCommerceOutboxRetentionConfig } from '../src/commerce-outbox-retention.ts';

process.env.NODE_ENV = 'test';

const pool = createPool();
let failures = 0;
let assertions = 0;
const A = (name: string, ok: boolean) => {
  assertions += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
};
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function normalizePredicate(raw: string): string {
  return raw
    .replace(/::(?:pg_catalog\.)?(?:character varying|varchar|bpchar|cstring|name|text)\b/gi, '')
    .replace(/[\s()"']/g, '')
    .toLowerCase();
}

async function insertOutbox(owner: string, key: string, status: 'pending' | 'relayed', ageDays: number): Promise<string> {
  const consumption = await pool.query<{ id: string }>(
    `INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, status)
     VALUES ($1, $2, 'mock_interview', 1, 'confirmed') RETURNING id::text`,
    [owner, key],
  );
  const consumptionId = consumption.rows[0]?.id;
  if (!consumptionId) throw new Error('consumption_insert_failed');
  const outbox = await pool.query<{ id: string }>(
    `INSERT INTO commerce_outbox(owner_user_id, kind, consumption_id, payload, status, created_at)
     VALUES ($1, 'settlement_proposed', $2, '{}', $3, clock_timestamp() - make_interval(days => $4::int))
     RETURNING id::text`,
    [owner, consumptionId, status, ageDays],
  );
  const id = outbox.rows[0]?.id;
  if (!id) throw new Error('outbox_insert_failed');
  return id;
}

async function purge(keepDays: number, batchCap: number): Promise<number> {
  const client = await pool.connect();
  try {
    return await purgeExpiredRelayedOutbox(client, keepDays, batchCap);
  } finally {
    client.release();
  }
}

async function sqlRejected(keepDays: number, batchCap: number): Promise<boolean> {
  try {
    await pool.query('SELECT commerce_outbox_relayed_retention_purge($1::int, $2::int)', [keepDays, batchCap]);
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes('commerce_outbox_retention_invalid_input');
  }
}

function configError(name: string, value: string): string {
  const env: NodeJS.ProcessEnv = {};
  env[name] = value;
  try {
    resolveCommerceOutboxRetentionConfig(env);
    return '';
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);

  const defaults = resolveCommerceOutboxRetentionConfig({});
  A('缺省关闭，天数 30，间隔 1 小时，批大小 500',
    defaults.enabled === false && defaults.keepDays === 30 && defaults.intervalMs === 3_600_000 && defaults.batchSize === 500);
  A('非法环境变量在启动解析时抛出',
    configError('COMMERCE_OUTBOX_RETENTION_ENABLED', 'yes') === 'commerce_outbox_retention_enabled_invalid'
    && configError('COMMERCE_OUTBOX_RETENTION_DAYS', '6') === 'commerce_outbox_retention_days_invalid'
    && configError('COMMERCE_OUTBOX_RETENTION_DAYS', '366') === 'commerce_outbox_retention_days_invalid'
    && configError('COMMERCE_OUTBOX_RETENTION_INTERVAL_MS', '1000') === 'commerce_outbox_retention_interval_invalid'
    && configError('COMMERCE_OUTBOX_RETENTION_BATCH', '0') === 'commerce_outbox_retention_batch_invalid'
    && configError('COMMERCE_OUTBOX_RETENTION_BATCH', '10001') === 'commerce_outbox_retention_batch_invalid');

  const ownerA = `outbox-ret-a-${suffix}`;
  const freshId = await insertOutbox(ownerA, `${suffix}-fresh-relayed`, 'relayed', 0);
  const pendingId = await insertOutbox(ownerA, `${suffix}-expired-pending`, 'pending', 40);
  const expiredId = await insertOutbox(ownerA, `${suffix}-expired-relayed`, 'relayed', 40);
  const purgedA = await purge(30, 100);
  const leftA = await pool.query<{ id: string; status: string }>(
    'SELECT id::text, status FROM commerce_outbox WHERE owner_user_id = $1',
    [ownerA],
  );
  const leftIds = new Set(leftA.rows.map((row) => row.id));
  A('只删已投递且超期：未超期 relayed 与超期 pending 仍在，超期 relayed 消失',
    purgedA === 1
    && leftA.rows.length === 2
    && leftIds.has(freshId)
    && leftIds.has(pendingId)
    && !leftIds.has(expiredId)
    && leftA.rows.every((row) => row.id !== expiredId));

  const ownerB = `outbox-ret-b-${suffix}`;
  const cap = 3;
  const seeded = await pool.query<{ n: number }>(
    `WITH cons AS (
       INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, status)
       SELECT $1, $2 || '-' || g.n::text, 'mock_interview', 1, 'confirmed'
         FROM generate_series(1, $3::int) AS g(n)
       RETURNING id
     )
     INSERT INTO commerce_outbox(owner_user_id, kind, consumption_id, payload, status, created_at)
     SELECT $1, 'settlement_proposed', cons.id, '{}', 'relayed', clock_timestamp() - interval '40 days'
       FROM cons
     RETURNING 1`,
    [ownerB, `${suffix}-batch`, cap + 2],
  );
  const purgedB = await purge(30, cap);
  const leftB = await pool.query<{ n: number }>('SELECT count(*)::int AS n FROM commerce_outbox WHERE owner_user_id = $1', [ownerB]);
  A('批上限：造 cap+2 行恰删 cap，余 2', seeded.rows.length === cap + 2 && purgedB === cap && leftB.rows[0]?.n === 2);

  const acl = await pool.query<{ canDelete: boolean; canExec: boolean }>(
    `SELECT has_table_privilege('app_role', 'commerce_outbox', 'DELETE') AS "canDelete",
            has_function_privilege('app_role', 'commerce_outbox_relayed_retention_purge(integer,integer)', 'EXECUTE') AS "canExec"`,
  );
  A('app_role 对表 DELETE 为 false、对函数 EXECUTE 为 true',
    acl.rows[0]?.canDelete === false && acl.rows[0]?.canExec === true);

  const index = await pool.query<{ valid: boolean; ready: boolean; live: boolean; pred: string | null; oldIndex: string | null }>(
    `SELECT i.indisvalid AS valid, i.indisready AS ready, i.indislive AS live,
            pg_get_expr(i.indpred, i.indrelid) AS pred,
            to_regclass('public.ix_outbox_pending')::text AS "oldIndex"
       FROM pg_index i
       JOIN pg_class c ON c.oid = i.indexrelid
      WHERE c.relname = 'ix_outbox_unsettled'`,
  );
  const pred = index.rows[0]?.pred ?? '';
  A('新索引谓词恰为 pending 且有效，旧索引消失',
    index.rows.length === 1
    && index.rows[0]?.valid === true
    && index.rows[0]?.ready === true
    && index.rows[0]?.live === true
    && normalizePredicate(pred) === 'status=pending'
    && /pending/i.test(pred)
    && !/relayed/i.test(pred)
    && index.rows[0]?.oldIndex === null);

  let tsDaysRejected = false;
  let tsBatchRejected = false;
  try { await purge(6, 500); } catch (error) { tsDaysRejected = (error as { code?: string }).code === 'commerce_outbox_retention_invalid'; }
  try { await purge(30, 10001); } catch (error) { tsBatchRejected = (error as { code?: string }).code === 'commerce_outbox_retention_invalid'; }
  const bounds = await pool.query<{ low: number; high: number }>(
    `SELECT commerce_outbox_relayed_retention_purge(7, 1)::int AS low,
            commerce_outbox_relayed_retention_purge(365, 10000)::int AS high`,
  );
  A('越界天数和批大小失败，边界 7/365 与 1/10000 可执行',
    tsDaysRejected && tsBatchRejected
    && await sqlRejected(6, 500)
    && await sqlRejected(366, 1)
    && await sqlRejected(30, 0)
    && await sqlRejected(30, 10001)
    && Number.isInteger(Number(bounds.rows[0]?.low))
    && Number.isInteger(Number(bounds.rows[0]?.high))
    && Number(bounds.rows[0]?.low) >= 0
    && Number(bounds.rows[0]?.high) >= 0);

  console.log(failures === 0 ? `PASS ${assertions}` : `FAIL ${failures}/${assertions}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.stack ?? error.message : 'commerce_outbox_retention_proof_failed');
  await pool.end().catch(() => undefined);
  process.exit(1);
});
