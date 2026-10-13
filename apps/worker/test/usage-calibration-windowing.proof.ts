/**
 * AG 成本轨② proof（AG-COST2 · AG-07 迁移四件套 + 因子合并语义 + 90 天保留期）。
 *
 * 隔离库真迁移链（沿 entpay-s1/ag-b-classify 先例形）：runner 预迁移（0001→0177 全链·pnpm -C packages/db
 * migrate·零字节漂检由 migrate:prove 承载）后，本 proof 在真链上做行为断言 + 以 BEGIN/COMMIT 包裹
 * 0177 文件原字节重放（观测表先重建 pre-0177 旧形态）驱动迁移行为臂。零真实 provider 外呼（est live=0）。
 *
 * 断言族（REQUEST §2-1 五臂 + 伴随）：
 *  A. 链在册：0177 恰一条入账（真链已应用）+ 迁移目录含 0177 且 0175/0176 号位不 claim。
 *  B. 件①去重保留最早 + 新 PK 生效：pre-0177 旧形态重建 + 同 (owner,key) 三 batch fixture →
 *     0177 原字节重放 → 恰留最早 batch 一行·组内计数·唯一调用零丢失；PK 列集恰两列·
 *     同 key 二次 INSERT ON CONFLICT 命中（幂等仍绿）·batch 列 NOT NULL 溯源维持。
 *  C. 件③水位线单调：GREATEST 推进·回拨尝试值不降。
 *  D. 件②④加窗：v2(p_since) 恰返回窗口内行 + v1 同 fixture 仍返回全史（旧函数保留对照臂）·
 *     枚举 v2 同谓词·端到端「旧数据不入对账」（watermark 后 windowed reconcile 不见旧配对）·
 *     窗口空零写零推进（幂等重放安全）。
 *  E. 件④合并 max 语义：纯函数 fixture（prev 0.9 vs 增量 0.7×1.2=0.84 → 0.9 不降；增量
 *     1.5×1.2=1.8 → 1.8 只升）+ append-only（DB 双窗：旧行原值在位·新版本行落库·合并链版本
 *     含 prev·observationCount 相加）+ 低增量不降臂（上界保证）+ merged 过 P3 双校验读回。
 *  F. 件⑤floor+枚举 v2 集成：floor = MIN(水位线)·枚举 v2 以 floor 驱动。
 *  G. 件⑥保留期：SECURITY DEFINER 清除恰删 90 天前·越界天数 fail-closed·app_role 对观测表
 *     保持无 DELETE（0119 GRANT 纪律零破坏）·水位线表授权形制。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  assertIsolatedTestTarget, asPrincipal, createPool,
  gatewayUsageCalibrationOwnersSince, gatewayUsageCalibrationWatermarkFloor,
  listUsageCalibrationPairs, listUsageCalibrationPairsSince,
  purgeExpiredUsageCalibrationObservations, upsertUsageCalibrationWatermark,
} from '@meetwise/db';
import {
  CALIBRATION_ALGORITHM_VERSION, invoke, mergeCalibratedFactorWithPrev, reconcileUsage,
  reconcileUsageCalibrationWindowed, resolveLatestCalibratedFactor,
  type CalibratedFactor, type Model, type ModelCostPolicy, type ModelResult, type UsageObservation,
} from '@meetwise/ai-runtime';
import { resolveUsageCalibrationRetentionConfig } from '../src/usage-calibration-retention.ts';

process.env.NODE_ENV = 'test';

const pool = createPool();
let failures = 0;
let assertions = 0;
const A = (name: string, ok: boolean) => { assertions++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const errorOf = (fn: () => unknown): string => { try { fn(); return ''; } catch (e) { return e instanceof Error ? e.message : String(e); } };
const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const MIGRATION_SQL = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0177_usage_calibration_ag07_windowing.sql', import.meta.url)), 'utf8');
// AG-12（成本轨③·件③改写面授权）：0184 已把配对 v1/v2 DROP+CREATE 升为带 estimator_version 的
// 8 列返回表——0177 原字节重放中的 7 列 CREATE OR REPLACE 撞「cannot change return type」。
// 重放尾段随真链顺序追补 0184 配对函数节（v1 DROP 起至文件尾·恰含双函数+REVOKE/GRANT），
// 使重放终态=链最新；0177 字节仍逐字全量重放·行为臂断言力不减。
const MIGRATION_0184_PAIRING_SECTION = (() => {
  const full = readFileSync(fileURLToPath(new URL('../../../packages/db/migrations/0184_ag12_estimator_claim_freeze.sql', import.meta.url)), 'utf8');
  const marker = 'DROP FUNCTION IF EXISTS ai_usage_calibration_pairs_scoped(text);';
  const idx = full.indexOf(marker);
  if (idx < 0) throw new Error('ag12_0184_pairing_section_marker_missing');
  return full.slice(idx);
})();

// ==========================================================================
// H. 件⑥旋钮纪律（沿 AG-COST1 止血旋钮同族·纯 resolve 面）：缺省关停+bounded 非法即 throw
// ==========================================================================
const retentionDefault = resolveUsageCalibrationRetentionConfig({});
A('H 保留期旋钮：缺省 ENABLED=false（清除=生产数据删除·启用=显式运维决策·可调）', retentionDefault.enabled === false);
A('H 保留期旋钮：缺省 DAYS=90（裁决基准值）·INTERVAL=86_400_000（按天低频）',
  retentionDefault.keepDays === 90 && retentionDefault.intervalMs === 86_400_000);
A('H 保留期旋钮：非法 ENABLED/DAYS/INTERVAL → throw 专用 code（绝不静默回退）',
  errorOf(() => resolveUsageCalibrationRetentionConfig({ USAGE_CALIBRATION_RETENTION_ENABLED: 'yes' })) === 'usage_calibration_retention_enabled_invalid'
  && errorOf(() => resolveUsageCalibrationRetentionConfig({ USAGE_CALIBRATION_RETENTION_DAYS: '0' })) === 'usage_calibration_retention_days_invalid'
  && errorOf(() => resolveUsageCalibrationRetentionConfig({ USAGE_CALIBRATION_RETENTION_DAYS: '9999' })) === 'usage_calibration_retention_days_invalid'
  && errorOf(() => resolveUsageCalibrationRetentionConfig({ USAGE_CALIBRATION_RETENTION_INTERVAL_MS: 'abc' })) === 'usage_calibration_retention_interval_invalid');
A('H 保留期旋钮：合法值生效（1/3650 边界·ENABLED=1）',
  resolveUsageCalibrationRetentionConfig({ USAGE_CALIBRATION_RETENTION_ENABLED: '1', USAGE_CALIBRATION_RETENTION_DAYS: '3650', USAGE_CALIBRATION_RETENTION_INTERVAL_MS: '60000' }).keepDays === 3650
  && resolveUsageCalibrationRetentionConfig({ USAGE_CALIBRATION_RETENTION_DAYS: '1' }).keepDays === 1);

const OWNER = `ucal-win-${suffix}`;        // 加窗端到端臂 owner
const OWNER_FIX = `ucal-fix-${suffix}`;    // 迁移行为 fixture owner
const OWNER_MERGE = `ucal-mrg-${suffix}`;  // 合并 append-only 臂 owner
const SCOPE = `ucal-win-scope-${suffix}`;
const SERVICE = 'svc-win';
const MODEL = 'm-win';

const policy: ModelCostPolicy = {
  scopeId: SCOPE, provider: 'p-win', model: MODEL, region: 'cn-proof', priceRevision: 'win-r1',
  maxInputTokens: 1000, maxOutputTokens: 500,
};
const Schema = z.object({ answer: z.string().min(1) });
interface Scenario { planEstimate: number; execute: ModelResult }
function fakeModel(digest: string, scenario: Scenario): Model {
  return {
    requestDigest: digest,
    call: async () => scenario.execute,
    prepare: () => ({
      ready: true as const,
      cost: policy,
      execute: async () => scenario.execute,
      estimateInputTokens: scenario.planEstimate,
    }),
  };
}
async function runInvocation(owner: string, key: string, scenario: Scenario) {
  return invoke({
    idempotencyKey: key, service: SERVICE, schema: Schema, businessValidate: () => null,
    model: fakeModel(`${owner}:${key}`, scenario),
  }, pool, owner);
}

/** 重建 pre-0177 旧形态观测表（0119 :399-431 原文投影·行为 fixture 专用·隔离库一次性面）。 */
async function rebuildPre0177ObservationTable(): Promise<void> {
  await pool.query('DROP TABLE IF EXISTS ai_usage_calibration_observation CASCADE');
  await pool.query(`
    CREATE TABLE ai_usage_calibration_observation (
      owner_user_id text NOT NULL CHECK (char_length(owner_user_id) BETWEEN 1 AND 512),
      batch text NOT NULL CHECK (char_length(batch) BETWEEN 1 AND 256),
      invocation_idempotency_key text NOT NULL CHECK (char_length(invocation_idempotency_key) BETWEEN 1 AND 256),
      service text NOT NULL CHECK (char_length(service) BETWEEN 1 AND 256),
      model text NOT NULL CHECK (char_length(model) BETWEEN 1 AND 160),
      estimator text NOT NULL CHECK (estimator IN ('utf8-bytes-v1')),
      estimate_input_tokens integer NOT NULL CHECK (estimate_input_tokens >= 1),
      provider_input_tokens integer NOT NULL CHECK (provider_input_tokens >= 0),
      provider_output_tokens integer NOT NULL CHECK (provider_output_tokens >= 0),
      reconciliation_status text NOT NULL CHECK (reconciliation_status IN ('within_estimate','under_estimated')),
      observed_at_ms bigint NOT NULL CHECK (observed_at_ms >= 0),
      created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
      PRIMARY KEY (owner_user_id, batch, invocation_idempotency_key)
    )`);
  await pool.query(`ALTER TABLE ai_usage_calibration_observation ENABLE ROW LEVEL SECURITY`);
  await pool.query(`ALTER TABLE ai_usage_calibration_observation FORCE ROW LEVEL SECURITY`);
  await pool.query(`DROP POLICY IF EXISTS p_ai_usage_calibration_observation_owner ON ai_usage_calibration_observation`);
  await pool.query(`CREATE POLICY p_ai_usage_calibration_observation_owner ON ai_usage_calibration_observation
    USING (owner_user_id = current_setting('app.principal_user', true))
    WITH CHECK (owner_user_id = current_setting('app.principal_user', true))`);
  await pool.query(`GRANT SELECT, INSERT ON ai_usage_calibration_observation TO app_role`);
}

/** 以 0177 文件原字节做单迁移事务重放（runner 同形：BEGIN → 文件全部语句 → COMMIT）。
 *  AG-12：0184 已把配对 v1/v2 升为 8 列返回表——同事务先 DROP 双函数（0181 :177 升参先例同形），
 *  0177 字节照常全量重放（7 列 CREATE 全新建不撞型），尾段追补 0184 配对函数节（真链顺序
 *  0177→0184·重放终态=链最新·0177 字节零截断·行为臂断言力不减）。 */
async function replayMigration0177(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DROP FUNCTION IF EXISTS ai_usage_calibration_pairs_scoped(text)');
    await client.query('DROP FUNCTION IF EXISTS ai_usage_calibration_pairs_scoped_v2(text, timestamptz)');
    await client.query(MIGRATION_SQL);
    await client.query(MIGRATION_0184_PAIRING_SECTION);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  await assertIsolatedTestTarget(pool);
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES('p-win','m-win','cn-proof','win-r1',1000000,2000000,'https://example.test/usage-calibration-windowing',clock_timestamp())`,
  );
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)`, [SCOPE]);

  // ==========================================================================
  // A. 链在册：0177 恰一条入账（真迁移链已应用）+ 号位登记
  // ==========================================================================
  const ledger = await pool.query(
    `SELECT count(*)::int n FROM schema_migrations WHERE version='0177_usage_calibration_ag07_windowing'`, []);
  A('A 真迁移链在册：0177 恰一条 schema_migrations 记录（预迁移真链已应用）', ledger.rows[0]?.n === 1);
  // A. 号位纪律（nail rev 勘正）：0175=AG-C 合法实落主线（并线基期后）·0176 仍零 claim——
  // 原断言固化并线基期空号位事实，AG-C 合并后 schema_migrations 含 0175 → 恒假。
  // 改为只钉 0176（qsec 号位·仍未占）+ 0177 唯一性已由上一断言钉死。
  const q176 = await pool.query(
    `SELECT count(*)::int n FROM schema_migrations WHERE version LIKE '0176%'`, []);
  A('A 号位纪律：0176 零 claim（qsec 号位不占·0175 系 AG-C 合法实落不在此断言域）', q176.rows[0]?.n === 0);

  // ==========================================================================
  // B. 件①：pre-0177 旧形态重建 → 0177 原字节重放 → 去重保留最早 + 新 PK 生效
  // ==========================================================================
  await rebuildPre0177ObservationTable();
  // fixture：同 (owner,key)=k1 三 batch（cal-…08/09/10·字典序=时间序）+ 单行 k2；各行 provider 值可辨，
  // 断言「恰留最早 batch 行」而非任意行。唯一调用零丢失：k1/k2 两键全存。
  const fixRows: Array<[string, string, number, string]> = [
    ['cal-2099010800', 'k1', 8, 'within_estimate'],
    ['cal-2099010900', 'k1', 9, 'under_estimated'],
    ['cal-2099011000', 'k1', 10, 'within_estimate'],
    ['cal-2099010800', 'k2', 7, 'within_estimate'],
  ];
  for (const [batch, key, provider, status] of fixRows) {
    await pool.query(
      `INSERT INTO ai_usage_calibration_observation(owner_user_id,batch,invocation_idempotency_key,service,model,estimator,estimate_input_tokens,provider_input_tokens,provider_output_tokens,reconciliation_status,observed_at_ms)
       VALUES($1,$2,$3,$4,$5,'utf8-bytes-v1',100,$6,0,$7,0)`,
      [OWNER_FIX, batch, key, SERVICE, MODEL, provider, status],
    );
  }
  await replayMigration0177();

  const kept = await pool.query(
    `SELECT batch, provider_input_tokens, count(*) OVER (PARTITION BY owner_user_id, invocation_idempotency_key) AS group_n
       FROM ai_usage_calibration_observation WHERE owner_user_id=$1 AND invocation_idempotency_key='k1'`,
    [OWNER_FIX]);
  A('B① 历史膨胀行去重：同 (owner,key) 三 batch → 恰留一行', kept.rows.length === 1);
  A('B① 保留最早 batch（cal-…08 字典序最早·非任意行）', kept.rows[0]?.batch === 'cal-2099010800' && Number(kept.rows[0]?.provider_input_tokens) === 8);
  const fixKeys = await pool.query(
    `SELECT count(*)::int n, count(DISTINCT invocation_idempotency_key)::int k FROM ai_usage_calibration_observation WHERE owner_user_id=$1`,
    [OWNER_FIX]);
  A('B① 唯一调用零丢失：两键全存·总行数=键数（膨胀行恰删净）', fixKeys.rows[0]?.n === 2 && fixKeys.rows[0]?.k === 2);
  const pk = await pool.query(
    `SELECT pg_get_constraintdef(c.oid) def FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
      WHERE t.relname='ai_usage_calibration_observation' AND c.contype='p'`, []);
  A('B② 新 PK 生效：列集恰 (owner_user_id, invocation_idempotency_key) 两列',
    pk.rows[0]?.def === 'PRIMARY KEY (owner_user_id, invocation_idempotency_key)');
  const ins = await pool.query(
    `INSERT INTO ai_usage_calibration_observation(owner_user_id,batch,invocation_idempotency_key,service,model,estimator,estimate_input_tokens,provider_input_tokens,provider_output_tokens,reconciliation_status,observed_at_ms)
     VALUES($1,'cal-2099011100','k1',$2,$3,'utf8-bytes-v1',100,11,0,'within_estimate',0)
     ON CONFLICT (owner_user_id,invocation_idempotency_key) DO NOTHING`,
    [OWNER_FIX, SERVICE, MODEL]);
  A('B② 同 key 跨 batch 二次 INSERT → ON CONFLICT 新 PK 命中（幂等仍绿·行零新增）',
    (ins.rowCount ?? -1) === 0
    && (await pool.query(`SELECT count(*)::int n FROM ai_usage_calibration_observation WHERE owner_user_id=$1 AND invocation_idempotency_key='k1'`, [OWNER_FIX])).rows[0]?.n === 1);
  const batchCol = await pool.query(
    `SELECT is_nullable FROM information_schema.columns WHERE table_name='ai_usage_calibration_observation' AND column_name='batch'`, []);
  A('B② batch 列保留为溯源列（NOT NULL 维持）', batchCol.rows[0]?.is_nullable === 'NO');

  // ==========================================================================
  // C. 件③：水位线 GREATEST 单调推进·绝不回拨
  // ==========================================================================
  const t1 = new Date('2026-03-02T00:00:00Z');
  const t0 = new Date('2026-03-01T00:00:00Z');
  const t2 = new Date('2026-03-03T00:00:00Z');
  const w1 = await asPrincipal(pool, OWNER, (c) => upsertUsageCalibrationWatermark(c, OWNER, t1));
  A('C 水位线首推=入参值', w1.getTime() === t1.getTime());
  const wRollback = await asPrincipal(pool, OWNER, (c) => upsertUsageCalibrationWatermark(c, OWNER, t0));
  A('C 回拨尝试（更小 last_completed_at UPSERT）→ GREATEST 兜住·值不降', wRollback.getTime() === t1.getTime());
  const w2 = await asPrincipal(pool, OWNER, (c) => upsertUsageCalibrationWatermark(c, OWNER, t2));
  A('C 前移生效（更大值推进）', w2.getTime() === t2.getTime());

  // ==========================================================================
  // D. 件②④：加窗配对 v2/v1 对照 + 枚举 v2 + 端到端「旧数据不入对账」
  // ==========================================================================
  const oldKey = `win-old:${suffix}`;
  const newKey = `win-new:${suffix}`;
  await runInvocation(OWNER, oldKey, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 50, outputTokens: 5 } } });
  await runInvocation(OWNER, newKey, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 60, outputTokens: 5 } } });
  // 两配对 completed_at 天然有序（terminalize 先后）；窗口下界取两时刻中点——0088 状态守卫下
  // 不做同态回填（succeeded→succeeded 非法转移·守卫设计如此），窗口语义断言力等价。
  const times = await pool.query(
    `SELECT idempotency_key, completed_at FROM ai_model_invocation
      WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3) AND completed_at IS NOT NULL`,
    [OWNER, oldKey, newKey]);
  const tOld = new Date(times.rows.find((r: { idempotency_key: string }) => r.idempotency_key === oldKey)?.completed_at);
  const tNew = new Date(times.rows.find((r: { idempotency_key: string }) => r.idempotency_key === newKey)?.completed_at);
  const sinceMid = new Date(Math.floor((tOld.getTime() + tNew.getTime()) / 2));
  const v1All = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairs(c, OWNER));
  A('D v1 全史对照臂：同 fixture 仍返回全史 2 配对（旧函数零字节保留·行为不变）', v1All.length === 2);
  const v2Window = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairsSince(c, OWNER, sinceMid));
  A('D v2 加窗：p_since=两时刻中点 → 恰返回窗口内 1 配对（先完成旧配对剔除）',
    v2Window.length === 1 && v2Window[0]?.idempotencyKey === newKey);
  const v2Future = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairsSince(c, OWNER, new Date(Date.now() + 86_400_000)));
  A('D v2 加窗：p_since=未来 → 零行（窗口语义）', v2Future.length === 0);
  const v2All = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairsSince(c, OWNER, new Date(0)));
  A('D v2 加窗：p_since=epoch → 全量 2（首窗=全史等价）', v2All.length === 2);
  const enumWin = await gatewayUsageCalibrationOwnersSince(pool, sinceMid);
  A('D 枚举 v2 加窗：p_since=中点 → 含本 owner（窗口内有新配对）', enumWin.includes(OWNER));
  const enumFuture = await gatewayUsageCalibrationOwnersSince(pool, new Date(Date.now() + 86_400_000));
  A('D 枚举 v2 加窗：p_since=未来 → 不含本 owner（owner 无窗红事实根除）', !enumFuture.includes(OWNER));

  // 端到端：水位线推到中点 → windowed reconcile 恰观测窗口内 1 条·旧配对不入对账。
  await asPrincipal(pool, OWNER, (c) => upsertUsageCalibrationWatermark(c, OWNER, sinceMid));
  const wr1 = await reconcileUsageCalibrationWindowed(pool, { owner: OWNER, batch: `cal-win-1-${suffix}` });
  const obsWin = await asPrincipal(pool, OWNER, async (c) => {
    const r = await c.query(
      `SELECT invocation_idempotency_key FROM ai_usage_calibration_observation WHERE owner_user_id=$1`, [OWNER]);
    return r.rows.map((row: { invocation_idempotency_key: string }) => row.invocation_idempotency_key);
  });
  A('D 端到端：加窗 reconcile 恰观测窗口内 1 条·旧数据不入对账',
    wr1.ok && wr1.groups.length === 1 && wr1.watermarkTo !== null && obsWin.length === 1 && obsWin[0] === newKey);
  A('D 端到端：水位线推进至本批 max(completed_at)（>入窗水位）',
    wr1.ok && wr1.watermarkFrom.getTime() === sinceMid.getTime() && wr1.watermarkTo !== null && wr1.watermarkTo.getTime() > sinceMid.getTime());
  const wr2 = await reconcileUsageCalibrationWindowed(pool, { owner: OWNER, batch: `cal-win-2-${suffix}` });
  A('D 幂等重放安全：窗口空 → ok·零组·水位线不写不回拨（watermarkTo=null）',
    wr2.ok && wr2.groups.length === 0 && wr2.watermarkTo === null);

  // ==========================================================================
  // E. 件④：合并 max 语义 fixture + append-only + 低增量不降
  // ==========================================================================
  const obs = (estimate: number, provider: number): UsageObservation[] => ([{
    estimator: 'utf8-bytes-v1', estimateInputTokens: estimate, providerInputTokens: provider,
    providerOutputTokens: 0, service: SERVICE, model: MODEL, batch: 'fixture', observedAtMs: 0,
  }]);
  const prevFactor: CalibratedFactor = {
    estimator: 'utf8-bytes-v1', factorVersion: `utf8-bytes-v1.${CALIBRATION_ALGORITHM_VERSION}.${'a'.repeat(64)}`,
    factor: 0.9, rawMaxRatio: 0.75, safetyMargin: 0.2, observationCount: 5, hasUnderEstimate: false,
  };
  const incLow = reconcileUsage(obs(100, 70), { estimator: 'utf8-bytes-v1', safetyMargin: 0.2 });
  const mergedLow = incLow.ok && incLow.calibration ? mergeCalibratedFactorWithPrev(prevFactor, incLow.calibration) : null;
  A('E fixture①：prev 0.9 vs 增量 0.7×1.2=0.84 → merged=0.9（绝不静默缩水）',
    mergedLow !== null && incLow.ok && Math.abs((incLow.calibration?.factor ?? 0) - 0.84) < 1e-9
    && Math.abs(mergedLow.factor - 0.9) < 1e-9 && mergedLow.rawMaxRatio === 0.75);
  const incHigh = reconcileUsage(obs(100, 150), { estimator: 'utf8-bytes-v1', safetyMargin: 0.2 });
  const mergedHigh = incHigh.ok && incHigh.calibration ? mergeCalibratedFactorWithPrev(prevFactor, incHigh.calibration) : null;
  A('E fixture②：增量 1.5×1.2=1.8 → merged=1.8（只升）·observationCount 相加（5+1）',
    mergedHigh !== null && Math.abs(mergedHigh.factor - 1.8) < 1e-9 && mergedHigh.observationCount === 6);
  A('E 合并链：merged factorVersion 形态合法·含 prev 因子链（异于 prev/增量版本）',
    mergedHigh !== null && /^utf8-bytes-v1\.calibration-v1\.[0-9a-f]{64}$/.test(mergedHigh.factorVersion)
    && mergedHigh.factorVersion !== prevFactor.factorVersion
    && (incHigh.ok && incHigh.calibration ? mergedHigh.factorVersion !== incHigh.calibration.factorVersion : true));
  A('E 伴随语义：hasUnderEstimate = prev OR 增量·safetyMargin=增量侧常量·rawMaxRatio=两肩有效值',
    mergedHigh !== null && mergedHigh.hasUnderEstimate === true && mergedHigh.safetyMargin === 0.2
    && Math.abs(mergedHigh.rawMaxRatio - 1.5) < 1e-9
    && (mergedLow !== null && mergedLow.hasUnderEstimate === false));

  // DB append-only 端到端（默认 safety=DEFAULT_SAFETY_MARGIN）：窗1 低位 → 窗2 高位 → 窗3 低位不降。
  const mKey1 = `mrg-1:${suffix}`;
  const mKey2 = `mrg-2:${suffix}`;
  const mKey3 = `mrg-3:${suffix}`;
  await runInvocation(OWNER_MERGE, mKey1, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 70, outputTokens: 5 } } });
  const mr1 = await reconcileUsageCalibrationWindowed(pool, { owner: OWNER_MERGE, batch: `cal-mrg-1-${suffix}` });
  const rowsAfter1 = await pool.query(
    `SELECT factor_version, factor, raw_max_ratio, observation_count, under_estimate_flag, created_at
       FROM ai_usage_calibration WHERE owner_user_id=$1 ORDER BY created_at`, [OWNER_MERGE]);
  A('E DB 窗1（首窗无 prev）=普通全量计算：恰 1 因子行·observationCount=1',
    mr1.ok && mr1.groups.length === 1 && rowsAfter1.rows.length === 1 && Number(rowsAfter1.rows[0]?.observation_count) === 1);
  await runInvocation(OWNER_MERGE, mKey2, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 150, outputTokens: 5 } } });
  const mr2 = await reconcileUsageCalibrationWindowed(pool, { owner: OWNER_MERGE, batch: `cal-mrg-2-${suffix}` });
  const rowsAfter2 = await pool.query(
    `SELECT factor_version, factor, raw_max_ratio, observation_count, created_at
       FROM ai_usage_calibration WHERE owner_user_id=$1 ORDER BY created_at`, [OWNER_MERGE]);
  const oldRow = rowsAfter1.rows[0];
  const rowsAfter2Old = rowsAfter2.rows.find((r: { factor_version: string }) => r.factor_version === oldRow?.factor_version);
  A('E DB append-only：窗2 后恰 2 行·旧行原值在位（绝不 UPDATE/DELETE）',
    mr2.ok && rowsAfter2.rows.length === 2 && rowsAfter2Old !== undefined
    && Math.abs(Number(rowsAfter2Old.factor) - Number(oldRow.factor)) < 1e-12
    && String(rowsAfter2Old.created_at) === String(oldRow.created_at));
  const mergedRow = rowsAfter2.rows.find((r: { factor_version: string }) => r.factor_version !== oldRow?.factor_version);
  const expectedMerged = Math.max(Number(oldRow.factor), 1.5 * (1 + 0.10));
  A('E DB 合并 max：新行 factor=max(factor_prev, rawMax_增量×(1+0.1))·observationCount 相加=2',
    mergedRow !== undefined && Math.abs(Number(mergedRow.factor) - expectedMerged) < 1e-9
    && Number(mergedRow.observation_count) === 2
    && Math.abs(Number(mergedRow.raw_max_ratio) - 1.5) < 1e-9);
  await runInvocation(OWNER_MERGE, mKey3, { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 20, outputTokens: 5 } } });
  const mr3 = await reconcileUsageCalibrationWindowed(pool, { owner: OWNER_MERGE, batch: `cal-mrg-3-${suffix}` });
  const rowsAfter3 = await pool.query(
    `SELECT count(*)::int n FROM ai_usage_calibration WHERE owner_user_id=$1`, [OWNER_MERGE]);
  const latest = await asPrincipal(pool, OWNER_MERGE, (c) => resolveLatestCalibratedFactor(c, OWNER_MERGE, SERVICE, MODEL));
  A('E 低增量不降：窗3 低比率（0.2）→ 因子行只增版本不降值·merged 过 P3 双校验读回',
    mr3.ok && rowsAfter3.rows[0]?.n === 3 && latest !== null
    && Math.abs(latest.factor - expectedMerged) < 1e-9 && latest.observationCount === 3);

  // ==========================================================================
  // F. 件⑤：floor = MIN(水位线)·tick 枚举以 floor 驱动
  // ==========================================================================
  const floor = await gatewayUsageCalibrationWatermarkFloor(pool);
  A('F floor=水位线整批下界（MIN·非空且 ≤ 本 owner 水位）',
    floor !== null && floor.getTime() <= (wr1.ok && wr1.watermarkTo ? wr1.watermarkTo.getTime() : Number.MAX_SAFE_INTEGER));
  const enumFromFloor = await gatewayUsageCalibrationOwnersSince(pool, floor ?? new Date(0));
  A('F 枚举 v2 以 floor 驱动：窗口内有新配对的 owner 在册（无窗红事实根除·取比 floor 更晚完成配对的 owner）',
    enumFromFloor.includes(OWNER_MERGE) === true);

  // ==========================================================================
  // G. 件⑥：90 天保留期（SECURITY DEFINER 清除·fail-closed·GRANT 纪律）
  // ==========================================================================
  const rOld = `ret-old:${suffix}`;
  const rMid = `ret-mid:${suffix}`;
  const rNew = `ret-new:${suffix}`;
  for (const [key, ageSql] of [[rOld, `interval '120 days'`], [rMid, `interval '50 days'`], [rNew, `interval '10 days'`]] as const) {
    await pool.query(
      `INSERT INTO ai_usage_calibration_observation(owner_user_id,batch,invocation_idempotency_key,service,model,estimator,estimate_input_tokens,provider_input_tokens,provider_output_tokens,reconciliation_status,observed_at_ms,created_at)
       VALUES($1,'cal-ret','${key}',$2,$3,'utf8-bytes-v1',100,1,0,'within_estimate',0, clock_timestamp() - ${ageSql})`,
      [OWNER_FIX, SERVICE, MODEL],
    );
  }
  const purged = await purgeExpiredUsageCalibrationObservations(pool, 90);
  const remaining = await pool.query(
    `SELECT invocation_idempotency_key FROM ai_usage_calibration_observation WHERE owner_user_id=$1 AND invocation_idempotency_key LIKE 'ret-%' ORDER BY invocation_idempotency_key`,
    [OWNER_FIX]);
  A('G 保留期清除：恰删 90 天前 1 行·50/10 天行保留', purged === 1 && remaining.rows.length === 2
    && remaining.rows.some((r: { invocation_idempotency_key: string }) => r.invocation_idempotency_key === rMid)
    && remaining.rows.some((r: { invocation_idempotency_key: string }) => r.invocation_idempotency_key === rNew));
  let rejectZero = false;
  try { await purgeExpiredUsageCalibrationObservations(pool, 0); } catch (e) {
    rejectZero = (e as { code?: string }).code === 'usage_calibration_retention_invalid';
  }
  A('G 越界天数 fail-closed：keepDays=0 → throw（TS 侧守门·SQL 侧同域 RAISE）', rejectZero);
  const grants = await pool.query(`
    SELECT
      has_table_privilege('app_role','ai_usage_calibration_observation','DELETE') AS obs_delete,
      has_table_privilege('app_role','ai_usage_calibration_observation','INSERT') AS obs_insert,
      has_table_privilege('app_role','ai_usage_calibration_watermark','SELECT') AS wm_select,
      has_table_privilege('app_role','ai_usage_calibration_watermark','INSERT') AS wm_insert,
      has_table_privilege('app_role','ai_usage_calibration_watermark','UPDATE') AS wm_update,
      has_table_privilege('app_role','ai_usage_calibration_watermark','DELETE') AS wm_delete`);
  const g = grants.rows[0];
  A('G GRANT 纪律：观测表 app_role 保持无 DELETE（0119 insert-only 零破坏）·水位线 SELECT/INSERT/UPDATE 无 DELETE',
    g?.obs_delete === false && g?.obs_insert === true
    && g?.wm_select === true && g?.wm_insert === true && g?.wm_update === true && g?.wm_delete === false);
  const fnExec = await pool.query(`
    SELECT
      has_function_privilege('app_role','ai_usage_calibration_observation_retention_purge(integer)','EXECUTE') AS purge_exec,
      has_function_privilege('app_gateway_role','gateway_usage_calibration_owners_v2(timestamptz)','EXECUTE') AS enum_exec,
      has_function_privilege('app_gateway_role','gateway_usage_calibration_watermark_floor()','EXECUTE') AS floor_exec`);
  const f = fnExec.rows[0];
  A('G 函数授权：purge→app_role·枚举 v2/floor→app_gateway_role', f?.purge_exec === true && f?.enum_exec === true && f?.floor_exec === true);

  console.log(failures ? `\n✗ ${failures}/${assertions} 项失败` : `\n✓ AG-COST2 迁移四件套+合并语义+保留期 全臂通过（${assertions} 臂）`);
  await pool.end();
  process.exit(failures ? 1 : 0);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : 'usage_calibration_windowing_proof_failed');
  await pool.end();
  process.exit(1);
});
