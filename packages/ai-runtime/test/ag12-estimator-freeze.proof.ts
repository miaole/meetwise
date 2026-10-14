/**
 * AG-12-ESTIMATOR-FREEZE（成本轨③：claim 冻结参数 + 配对 per-row 估算器归因）真 PG 隔离证明。
 *
 * 蓝本=REQUEST §2-2 六臂（沿 ag19-prompt-version/cost2 ucal-windowing proof 形）：
 *  A. 链在册：0184 恰一条入账 + 0182/0183 号位零 claim（AG-39 已 declare）。
 *  ① 列在场+CHECK：estimator_version/calibration_factor_version 列+约束目录钉 + 第三值/越形
 *     INSERT → 23514 负臂（NULL 合法由 ③ NULL 臂承载）。
 *  ② identity-immutable 负臂：claim 后 UPDATE 冻结两列任一 → ai_model_invocation_identity_immutable
 *     （0181 四件套同形·防重放漂移的库级承重）。
 *  ③ claim 19 参往返：invoke 真 TS 接线（plan.cost.contextEstimator/calibration.factorVersion）
 *     落库逐字 + 无 policy 臂落 NULL + db wrapper 直调 $18/$19 定位钉 + 同键重放臂（重放携带刷新
 *     factor_version → 冻结两列保持首 claim 值不被覆盖=冻结语义显式锁）。
 *  ④ 配对 v1+v2 各带 estimator_version：存量旧行（NULL）→ COALESCE 'utf8-bytes-v1' 归因断言 +
 *     新行原值透传 + 0174 usage_missing 剔除谓词原值保留 + 0177 p_since 窗原值保留（只增列不改滤）。
 *  ⑤ 对账归因：同 owner 同 (service,model) 造 v1/v2 混合配对（blanket 红事实场景）→ 三元组分组
 *     各建各自因子（两 estimator 各一条 factor 行·互不混算）+ observation.estimator 逐行自带 +
 *     input.estimator 过滤语义（缺省全组/显式单组/未知值 fail-closed）+ 组结果 estimator 字段透传。
 *  ⑥ GRANT/SECURITY DEFINER 纪律：claim 19 参/v1/v2 三函数 app_role EXECUTE + 无 PUBLIC 默认项 +
 *     配对双函数 SECURITY DEFINER。
 *
 * 运行方式：经 scripts/run-e2e-isolated.mjs 的 `ag12-estimator-freeze:prove` gate（一次性容器 +
 * 全量版本化迁移含 0184）。零真实 provider；确定性 scripted seam（est live=0·actualSpendCny=null）。
 */
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  asPrincipal, assertIsolatedTestTarget, claimModelInvocation, createPool,
  listUsageCalibrationPairs, listUsageCalibrationPairsSince,
} from '@meetwise/db';
import { invoke, reconcileUsageCalibration, type Model, type ModelCostPolicy, type ModelResult } from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `ag12-freeze-${suffix}`;
const SCOPE = `scope-ag12-${suffix}`;
const SERVICE = 'svc-ag12';
const MODEL = 'm-ag12';
const F2 = `cjk-weighted-v1.calibration-v1.${'a'.repeat(64)}`;
const F2_REFRESHED = `cjk-weighted-v1.calibration-v1.${'b'.repeat(64)}`;

const Schema = z.object({ answer: z.string().min(1) });

interface Scenario { planEstimate: number; execute: ModelResult }

function fakeModel(digest: string, scenario: Scenario, cost: ModelCostPolicy): Model {
  return {
    requestDigest: digest,
    call: async () => scenario.execute,
    prepare: () => ({
      ready: true as const,
      cost,
      execute: async () => scenario.execute,
      estimateInputTokens: scenario.planEstimate,
    }),
  };
}

/** billed cost policy（contextEstimator/calibration 可选挂载→claim 冻结两列真值源）。 */
const policy = (over: Partial<ModelCostPolicy> = {}): ModelCostPolicy => ({
  scopeId: SCOPE, provider: 'p-ag12', model: MODEL, region: 'cn-proof', priceRevision: 'ag12-r1',
  maxInputTokens: 1000, maxOutputTokens: 500, ...over,
});

async function runInvocation(key: string, scenario: Scenario, cost: ModelCostPolicy): Promise<unknown> {
  return invoke({
    idempotencyKey: key, service: SERVICE, schema: Schema, businessValidate: () => null,
    model: fakeModel(sha256(`${SERVICE}:${key}`), scenario, cost),
  }, pool, OWNER);
}

const invocationRow = async (key: string) => (await pool.query<{
  status: string; estimator_version: string | null; calibration_factor_version: string | null;
  estimate_input_tokens: number | null; usage_source: string | null;
}>(
  `SELECT status,estimator_version,calibration_factor_version,estimate_input_tokens,usage_source
     FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
  [OWNER, key],
)).rows[0];

const factorRows = async () => (await pool.query<{ estimator: string; factor_version: string; factor: number }>(
  `SELECT estimator,factor_version,factor FROM ai_usage_calibration WHERE owner_user_id=$1 ORDER BY estimator`,
  [OWNER],
)).rows;

const errorOfAsync = async (fn: () => Promise<unknown>): Promise<string> => {
  try { await fn(); return ''; } catch (e) { return String(e instanceof Error ? e.message : e); }
};

async function main() {
  await assertIsolatedTestTarget(pool);

  // 因子/预算 fixture（沿 usage-calibration-reconciler proof 形）。
  await pool.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES('p-ag12','m-ag12','cn-proof','ag12-r1',1000000,2000000,'https://example.test/ag12-estimator-freeze',clock_timestamp())`,
  );
  await pool.query(`INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)`, [SCOPE]);

  // ═══════════════════════════════════════════════════════════════════════════
  // A. 链在册（隔离 runner 预迁移 0001→0184 全链 applied）
  // ═══════════════════════════════════════════════════════════════════════════
  const ledger = await pool.query(
    `SELECT count(*)::int n FROM schema_migrations WHERE version='0184_ag12_estimator_claim_freeze'`, []);
  A('A 真迁移链在册：0184 恰一条 schema_migrations 记录（预迁移真链已应用）', ledger.rows[0]?.n === 1);
  const q1823 = await pool.query(
    `SELECT count(*)::int n FROM schema_migrations WHERE version LIKE '0182%' OR version LIKE '0183%'`, []);
  A('A 号位纪律：0182/0183 零 claim（AG-39 已 declare 占用·本刀 0184 起号不越位）', q1823.rows[0]?.n === 0);

  // ═══════════════════════════════════════════════════════════════════════════
  // ① 列在场 + CHECK 目录钉 + 负臂（第三值/越形 → 23514）
  // ═══════════════════════════════════════════════════════════════════════════
  const cols = await pool.query(
    `SELECT column_name FROM information_schema.columns
      WHERE table_name='ai_model_invocation' AND column_name IN ('estimator_version','calibration_factor_version')`, []);
  A('① 两冻结列在场（estimator_version + calibration_factor_version）', cols.rowCount === 2);
  const cks = await pool.query<{ conname: string; def: string }>(
    `SELECT conname,pg_get_constraintdef(oid) AS def FROM pg_constraint
       WHERE conrelid='ai_model_invocation'::regclass
         AND conname IN ('ck_ai_model_invocation_estimator_version','ck_ai_model_invocation_calibration_factor_version')`, []);
  const ckMap = new Map(cks.rows.map((r) => [r.conname, r.def]));
  A('① CHECK 目录钉：estimator_version=NULL 允许 OR 枚举双值（沿 0174 短码枚举 CHECK 形）',
    ckMap.get('ck_ai_model_invocation_estimator_version')?.includes("'utf8-bytes-v1'") === true
    && ckMap.get('ck_ai_model_invocation_estimator_version')?.includes("'cjk-weighted-v1'") === true);
  A('① CHECK 目录钉：calibration_factor_version=NULL 允许 OR ^[A-Za-z0-9.:_-]{1,160}$ 宽松形',
    ckMap.get('ck_ai_model_invocation_calibration_factor_version')?.includes('A-Za-z0-9.:_-') === true);
  // 负臂：直 INSERT 完整合法 claimed 形（预置 0130 创建 permit→过状态机守卫）仅冻结列非法 → CHECK 23514。
  const badInsert = async (columnSql: string): Promise<{ message: string; code: string }> => {
    const key = `ag12:ck:${columnSql}:${suffix}`;
    const badValue = columnSql === 'estimator_version' ? 'bogus-v3' : 'bad shape!';
    try {
      await pool.query(
        `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
         VALUES($1,$2,NULL,'claimed') ON CONFLICT DO NOTHING`,
        [OWNER, key],
      );
      await pool.query(
        `INSERT INTO ai_model_invocation(
           owner_user_id,idempotency_key,logical_node_key_digest,request_digest,service,
           lease_token,lease_expires_at,status,estimate_input_tokens,${columnSql})
         VALUES($1,$2,$3,$4,$5,$6,clock_timestamp()+interval '60 seconds','claimed',100,$7)`,
        [OWNER, key, sha256(`ck:${columnSql}:${suffix}`), sha256(`ckd:${columnSql}:${suffix}`), SERVICE, randomUUID(), badValue],
      );
      return { message: '', code: '' };
    } catch (e) {
      const err = e as { message?: string; code?: string };
      return { message: String(err.message ?? e), code: String(err.code ?? '') };
    }
  };
  const badEstimator = await badInsert('estimator_version');
  if (badEstimator.code !== '23514') console.log(`  [diag badEstimator] code=${badEstimator.code} message=${badEstimator.message}`);
  A('① 负臂：estimator_version 第三值 INSERT → 23514 ck_ai_model_invocation_estimator_version',
    badEstimator.code === '23514' && badEstimator.message.includes('ck_ai_model_invocation_estimator_version'));
  const badFactor = await badInsert('calibration_factor_version');
  if (badFactor.code !== '23514') console.log(`  [diag badFactor] code=${badFactor.code} message=${badFactor.message}`);
  A('① 负臂：calibration_factor_version 越形 INSERT → 23514 ck_..._calibration_factor_version',
    badFactor.code === '23514' && badFactor.message.includes('ck_ai_model_invocation_calibration_factor_version'));

  // ═══════════════════════════════════════════════════════════════════════════
  // ② identity-immutable 负臂（claim 后 UPDATE 冻结两列任一 → 拒）
  // ═══════════════════════════════════════════════════════════════════════════
  const immutKey = `ag12:immut:${suffix}`;
  const directClaim = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
    owner: OWNER, idempotencyKey: immutKey, requestDigest: sha256(`digest:${immutKey}`), service: SERVICE,
    leaseToken: crypto.randomUUID(), leaseSeconds: 60, estimateInputTokens: 100,
    estimatorVersion: 'cjk-weighted-v1', calibrationFactorVersion: F2,
  }));
  A('② 前置：db wrapper 直调 19 参 claim → execute（$18/$19 定位见 ③）', directClaim.action === 'execute');
  const immutRow0 = await invocationRow(immutKey);
  A('② 前置：直调写入冻结两列逐字（estimator_version=v2·factor_version=F2）',
    immutRow0?.estimator_version === 'cjk-weighted-v1' && immutRow0?.calibration_factor_version === F2);
  const seedPermitAndAttempt = async (column: string) => {
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,'claimed','claimed') ON CONFLICT DO NOTHING`, [OWNER, immutKey],
    );
    try {
      await pool.query(`UPDATE ai_model_invocation SET ${column}='tampered-v99' WHERE owner_user_id=$1 AND idempotency_key=$2`, [OWNER, immutKey]);
      return '';
    } catch (e) { return String(e instanceof Error ? e.message : e); }
  };
  const raised1 = await seedPermitAndAttempt('estimator_version');
  const raised2 = await seedPermitAndAttempt('calibration_factor_version');
  A('② identity-immutable：claim 后 UPDATE estimator_version → 拒（ai_model_invocation_identity_immutable）',
    raised1.includes('ai_model_invocation_identity_immutable'));
  A('② identity-immutable：claim 后 UPDATE calibration_factor_version → 拒（同形·防重放漂移库级承重）',
    raised2.includes('ai_model_invocation_identity_immutable'));
  const immutRow1 = await invocationRow(immutKey);
  A('② 拒后冻结两列原值零篡改', immutRow1?.estimator_version === 'cjk-weighted-v1' && immutRow1?.calibration_factor_version === F2);

  // ═══════════════════════════════════════════════════════════════════════════
  // ③ claim 19 参往返（invoke 真 TS 接线 + NULL 臂 + 同键重放冻结臂）
  // ═══════════════════════════════════════════════════════════════════════════
  const v2Key = `ag12:v2:${suffix}`;
  await runInvocation(v2Key,
    { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 150, outputTokens: 20 } } },
    policy({ contextEstimator: 'cjk-weighted-v1', calibration: { estimator: 'cjk-weighted-v1', factorVersion: F2, factor: 1.65, rawMaxRatio: 1.5, safetyMargin: 0.1, observationCount: 3, hasUnderEstimate: false } }));
  const v2Row = await invocationRow(v2Key);
  A('③ invoke 真 TS 接线：v2 端点 claim 冻结 estimator_version=cjk-weighted-v1 逐字',
    v2Row?.status === 'succeeded' && v2Row?.estimator_version === 'cjk-weighted-v1');
  A('③ invoke 真 TS 接线：calibration.factorVersion 随 claim 冻结逐字（F2）',
    v2Row?.calibration_factor_version === F2);

  const nullKey = `ag12:null:${suffix}`;
  // 确定性窗间隔：两行完成时刻拉开 >1ms（JS Date 毫秒精度·水位线 +1µs 半开语义可分辨先后）。
  await new Promise((resolve) => setTimeout(resolve, 50));
  await runInvocation(nullKey,
    { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 50, outputTokens: 20 } } },
    policy());
  const nullRow = await invocationRow(nullKey);
  A('③ 无 policy 标签臂：缺省 claim 冻结两列落 NULL（可选链 NULL 缝·0181 先例同形）',
    nullRow?.status === 'succeeded' && nullRow?.estimator_version === null && nullRow?.calibration_factor_version === null);

  // 同键重放臂：同 idempotency_key 重放且携带刷新 factor_version → 冻结两列保持首 claim 值。
  const replayResult = await runInvocation(v2Key,
    { planEstimate: 100, execute: { ok: true, raw: { answer: 'tampered' }, usage: { inputTokens: 999, outputTokens: 999 } } },
    policy({ contextEstimator: 'cjk-weighted-v1', calibration: { estimator: 'cjk-weighted-v1', factorVersion: F2_REFRESHED, factor: 9.9, rawMaxRatio: 9, safetyMargin: 0.1, observationCount: 9, hasUnderEstimate: true } }));
  const replayRow = await invocationRow(v2Key);
  A('③ 同键重放：返回 cached 首结果（重放不重执行）',
    replayResult !== null && typeof replayResult === 'object' && 'value' in (replayResult as Record<string, unknown>)
    && (replayResult as { value?: { answer?: string } }).value?.answer === 'ok');
  A('③ 同键重放冻结臂：刷新 factor_version 不覆盖首 claim 冻结两列（estimator=v2·factor=F2 原值）',
    replayRow?.estimator_version === 'cjk-weighted-v1' && replayRow?.calibration_factor_version === F2
    && replayRow?.usage_source === null);
  const pron = await pool.query(
    `SELECT pronargs::int AS n FROM pg_proc WHERE proname='ai_model_claim_invocation_scoped'`, []);
  A('③ claim 函数恰 19 参（17 参旧签名已 DROP·migrate.proof :413 签名断言面同源）',
    pron.rows.length === 1 && Number(pron.rows[0]?.n) === 19);

  // usage_missing 行（v2 归因 + 打标剔除臂用）：usage 仿解析层产物（字段缺失按 policy 上限补齐+打标，
  // model-client :740-752 产出形——scripted seam 直返同形 ModelUsage）。
  const missingKey = `ag12:missing:${suffix}`;
  await runInvocation(missingKey,
    { planEstimate: 100, execute: { ok: true, raw: { answer: 'ok' }, usage: { inputTokens: 1000, outputTokens: 5, usageSource: 'usage_missing' as const } } },
    policy({ contextEstimator: 'cjk-weighted-v1' }));
  const missingRow = await invocationRow(missingKey);
  A('④ 前置：usage_missing 打标行落库（AG-14 口径·v2 归因在列）',
    missingRow?.usage_source === 'usage_missing' && missingRow?.estimator_version === 'cjk-weighted-v1');

  // ═══════════════════════════════════════════════════════════════════════════
  // ④ 配对 v1+v2 各带 estimator_version（COALESCE 存量归 v1 + 新行透传 + 谓词原值保留）
  // ═══════════════════════════════════════════════════════════════════════════
  const allPairs = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairs(c, OWNER));
  A('④ v1 配对函数（全史）：usage_missing 打标行被剔除（0174 剔除谓词原值保留）',
    allPairs.every((p) => p.idempotencyKey !== missingKey));
  A('④ v1 配对函数：存量旧行（NULL）COALESCE 归 utf8-bytes-v1（历史全部系 v1 字节估算真值）',
    allPairs.filter((p) => p.idempotencyKey === nullKey).length === 1
    && allPairs.find((p) => p.idempotencyKey === nullKey)?.estimator === 'utf8-bytes-v1');
  A('④ v1 配对函数：v2 新行原值透传（estimator_version=cjk-weighted-v1）',
    allPairs.find((p) => p.idempotencyKey === v2Key)?.estimator === 'cjk-weighted-v1');
  A('④ 配对行不带重放污染行（同键恰一行·幂等）', allPairs.filter((p) => p.idempotencyKey === v2Key).length === 1);

  const sinceEpoch = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairsSince(c, OWNER, new Date(0)));
  A('④ v2 配对函数（p_since=epoch）：与 v1 全史同行集同归因（首窗=全史等价·窗谓词原值）',
    sinceEpoch.length === allPairs.length
    && sinceEpoch.every((p, i) => p.idempotencyKey === allPairs[i]?.idempotencyKey && p.estimator === allPairs[i]?.estimator));
  // 窗谓词原值：p_since 取两完成时刻中点（cost2 ucal-windowing proof 同形·两行间隔已由 50ms 睡隔
  // 拉开）→ 窗口恰含后完成的 nullKey 行（COALESCE 归因不破窗语义）。
  const times = await pool.query<{ idempotency_key: string; completed_at: Date }>(
    `SELECT idempotency_key,completed_at FROM ai_model_invocation
      WHERE owner_user_id=$1 AND idempotency_key IN ($2,$3) AND completed_at IS NOT NULL`,
    [OWNER, v2Key, nullKey]);
  const rowV2 = times.rows.find((r) => r.idempotency_key === v2Key);
  const rowNull = times.rows.find((r) => r.idempotency_key === nullKey);
  if (!rowV2 || !rowNull) throw new Error('ag12: 窗口锚两行 completed_at 缺失（前置步骤失败）');
  const tV2 = new Date(rowV2.completed_at);
  const tNull = new Date(rowNull.completed_at);
  const sinceMid = new Date(Math.floor((tV2.getTime() + tNull.getTime()) / 2));
  const windowPairs = await asPrincipal(pool, OWNER, (c) => listUsageCalibrationPairsSince(c, OWNER, sinceMid));
  A('④ v2 配对函数（p_since=中点）：只回窗口内行且归因透传（0177 p_since 窗原值保留）',
    windowPairs.length === 1 && windowPairs[0]?.idempotencyKey === nullKey && windowPairs[0]?.estimator === 'utf8-bytes-v1');

  // ═══════════════════════════════════════════════════════════════════════════
  // ⑤ 对账归因：同 owner 同 (service,model) v1/v2 混合 → 三元组分组各自建因子（blanket 红事实根除）
  // ═══════════════════════════════════════════════════════════════════════════
  const r = await reconcileUsageCalibration(pool, { owner: OWNER, batch: `batch-ag12-${suffix}` });
  const groups = r.ok ? r.groups : [];
  A('⑤ 三元组分组：同 (service,model) 混合对账拆两组且组结果 estimator 字段透传',
    r.ok && groups.length === 2
    && groups.every((g) => g.service === SERVICE && g.model === MODEL)
    && groups.map((g) => g.estimator).sort().join(',') === 'cjk-weighted-v1,utf8-bytes-v1');
  const gV1 = groups.find((g) => g.estimator === 'utf8-bytes-v1');
  const gV2 = groups.find((g) => g.estimator === 'cjk-weighted-v1');
  A('⑤ 组内齐性：v1 组恰 1 观测（NULL 行）·v2 组恰 1 观测（v2 行·usage_missing/claimed 行不入组）',
    gV1?.observationCount === 1 && gV2?.observationCount === 1);
  const factors = await factorRows();
  A('⑤ 两 estimator 各恰一条因子行（互不混算·0119 单值 CHECK 已随 0184 扩枚举）',
    factors.length === 2
    && factors.some((f) => f.estimator === 'utf8-bytes-v1')
    && factors.some((f) => f.estimator === 'cjk-weighted-v1'));
  A('⑤ 因子互异（v1 组 50/100=0.55 vs v2 组 150/100×1.1=1.65·字节口径与 CJK 口径不再混桶）',
    Math.abs((factors.find((f) => f.estimator === 'utf8-bytes-v1')?.factor ?? 0) - 0.55) < 1e-9
    && Math.abs((factors.find((f) => f.estimator === 'cjk-weighted-v1')?.factor ?? 0) - 1.65) < 1e-9);
  const obs = await pool.query<{ estimator: string; invocation_idempotency_key: string }>(
    `SELECT estimator,invocation_idempotency_key FROM ai_usage_calibration_observation WHERE owner_user_id=$1`, [OWNER]);
  A('⑤ observation.estimator 逐行自带（NULL→v1 归因·v2 行透传·绝不整组盖章）',
    obs.rows.find((o) => o.invocation_idempotency_key === nullKey)?.estimator === 'utf8-bytes-v1'
    && obs.rows.find((o) => o.invocation_idempotency_key === v2Key)?.estimator === 'cjk-weighted-v1');

  // input.estimator 过滤语义（缺省全组/显式单组/未知 fail-closed）。
  const rFilterV2 = await reconcileUsageCalibration(pool, { owner: OWNER, batch: `batch-filter-${suffix}`, estimator: 'cjk-weighted-v1' });
  A('⑤ input.estimator 显式过滤：只回 v2 组（幂等重跑不重复落观测）',
    rFilterV2.ok && rFilterV2.groups.length === 1 && rFilterV2.groups[0]?.estimator === 'cjk-weighted-v1');
  const rFilterV1 = await reconcileUsageCalibration(pool, { owner: OWNER, batch: `batch-filter1-${suffix}`, estimator: 'utf8-bytes-v1' });
  A('⑤ input.estimator 显式过滤：只回 v1 组',
    rFilterV1.ok && rFilterV1.groups.length === 1 && rFilterV1.groups[0]?.estimator === 'utf8-bytes-v1');
  const rBogus = await reconcileUsageCalibration(pool, { owner: OWNER, batch: `batch-bogus-${suffix}`, estimator: 'bogus-v9' as never });
  A('⑤ input.estimator 未知值 fail-closed：usage_estimator_unknown（绝不猜测估算语义）',
    rBogus.ok === false && rBogus.error === 'usage_estimator_unknown');

  // ═══════════════════════════════════════════════════════════════════════════
  // ⑥ GRANT / SECURITY DEFINER 纪律（REVOKE PUBLIC + GRANT app_role·签名行随新签名重发）
  // ═══════════════════════════════════════════════════════════════════════════
  const claimSig = 'ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text,text,text)';
  const v1Sig = 'ai_usage_calibration_pairs_scoped(text)';
  const v2Sig = 'ai_usage_calibration_pairs_scoped_v2(text, timestamptz)';
  const priv = await pool.query<{ ok: boolean }>(
    `SELECT has_function_privilege('app_role',$1,'EXECUTE') ok`, [claimSig]);
  const privV1 = await pool.query<{ ok: boolean }>(`SELECT has_function_privilege('app_role',$1,'EXECUTE') ok`, [v1Sig]);
  const privV2 = await pool.query<{ ok: boolean }>(`SELECT has_function_privilege('app_role',$1,'EXECUTE') ok`, [v2Sig]);
  A('⑥ GRANT 纪律：claim 19 参/v1/v2 三函数 app_role EXECUTE（0181:385-386/0174:149-150/0177:88-89 形）',
    priv.rows[0]?.ok === true && privV1.rows[0]?.ok === true && privV2.rows[0]?.ok === true);
  const acls = await pool.query<{ proname: string; prosecdef: boolean; acl: string }>(
    `SELECT proname,prosecdef,array_to_string(proacl,',') AS acl FROM pg_proc
       WHERE proname IN ('ai_model_claim_invocation_scoped','ai_usage_calibration_pairs_scoped','ai_usage_calibration_pairs_scoped_v2')`, []);
  A('⑥ 无 PUBLIC 默认 EXECUTE 残留（REVOKE 随签名重发·漏发=纪律倒退）',
    acls.rows.length === 3 && acls.rows.every((r) => !/(^|,)=X/.test(r.acl) && r.acl.includes('app_role=X')));
  A('⑥ 配对双函数 SECURITY DEFINER（0174/0177 形逐字保留·只增列不改滤不改权）',
    acls.rows.filter((r) => r.proname.startsWith('ai_usage_calibration_pairs_scoped')).every((r) => r.prosecdef === true));

  // 0184 文件机械钉：REVOKE/GRANT 签名行随 19 参重发（文件字节面对表）。
  const m184 = sql('../../db/migrations/0184_ag12_estimator_claim_freeze.sql');
  A('⑥ 0184 文件机械钉：claim REVOKE/GRANT 签名行恰 19 参形 + 配对双函数 REVOKE/GRANT 在案',
    m184.includes(`REVOKE ALL ON FUNCTION ${claimSig} FROM PUBLIC, app_role`)
    && m184.includes(`GRANT EXECUTE ON FUNCTION ${claimSig} TO app_role`)
    && m184.includes(`REVOKE ALL ON FUNCTION ${v1Sig} FROM PUBLIC, app_role`)
    && m184.includes(`REVOKE ALL ON FUNCTION ${v2Sig} FROM PUBLIC, app_role`));

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-12 冻结+归因迁移证明全部通过（隔离库真迁移链·零外呼）');
  await pool.end();
  process.exit(failures ? 1 : 0);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'ag12_estimator_freeze_proof_failed');
  await pool.end();
  process.exit(1);
});
