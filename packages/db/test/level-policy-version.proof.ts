/**
 * H3 LEVEL-SCHEME 迁移 prove（0160 level_policy_version 表 + scheme v2 种子行）。
 * 经隔离 PG 运行（run-e2e-isolated.mjs level-policy-migrate:prove:raw → pnpm -C packages/db prove:level-policy）。
 *
 * 断言面（REQUEST §4.4）：
 *   1. 表存在且 DDL 形制 = H1 §4.1（A.4 形）：列集/uuid pk/scheme_version UNIQUE/status 四态 CHECK/五 jsonb。
 *   2. append-only 触发器：UPDATE/DELETE 一律拒（23514·level_policy_version_immutable·0100:294-296 同形）。
 *   3. seed v2 行：status='calibrating'·prompt_version/calibration_release_id NULL·
 *      附录 A' 16 字段对 contracts LEVEL_SCHEME_V2 逐字段零漂 diff（字段名即契约）。
 *   4. scheme_version unique 断言：重复 'v2' INSERT 被拒（23505）。
 *   5. 幂等面：runMigrations 重跑全 skip（零重放零重复行）。
 * 零生产操作（assertIsolatedTestTarget 前置）·零模型外呼（est live=0）。
 */
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { assertIsolatedTestTarget, createPool, runMigrations, loadMigrations } from '../src/index.ts';
import { LEVEL_SCHEME_V2 } from '@meetwise/contracts';

let fail = 0;
let assertions = 0;
const A = (n: string, c: boolean) => { assertions++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const pgErr = (e: unknown) => e as { code?: string; message?: string };
const pgTry = async (sql: string): Promise<{ code: string; message: string }> => { try { await pool.query(sql); return { code: '', message: '' }; } catch (e) { const p = pgErr(e); return { code: p.code ?? '', message: p.message ?? '' }; } };
/** 规范化深比较：jsonb 键序为 length→bytewise 重排·与 TS 对象插入序不同——递归排序键后 stringify 再比。 */
const canon = (v: unknown): unknown => Array.isArray(v) ? v.map(canon)
  : (v !== null && typeof v === 'object')
    ? Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, val]): [string, unknown] => [k, canon(val)]).sort(([a], [b]) => a.localeCompare(b)))
    : v;
const jsonEq = (a: unknown, b: unknown) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));

const pool = createPool();
try {
  await assertIsolatedTestTarget(pool);

  // 全量迁移（含 0160）在隔离 PG 上真实应用。
  const workspaceMigrations = resolve(process.cwd(), 'packages/db/migrations');
  const migrationDirectory = existsSync(workspaceMigrations)
    ? workspaceMigrations
    : resolve(process.cwd(), 'migrations');
  const loaded = loadMigrations(migrationDirectory);
  A('0160_level_policy_version 已纳入版本化目录', loaded.some((m) => m.version === '0160_level_policy_version'));
  await runMigrations(pool, loaded);

  // ── 1·DDL 形制（A.4）。
  A('level_policy_version 表已建', (await pool.query("SELECT to_regclass('public.level_policy_version') r")).rows[0]?.r !== null);
  const cols = await pool.query(
    `SELECT column_name, data_type, is_nullable FROM information_schema.columns
       WHERE table_name='level_policy_version' ORDER BY ordinal_position`);
  const colNames = cols.rows.map((r: { column_name: string }) => r.column_name);
  A('列集 = A.4 十一列（id/scheme_version/status/五 jsonb/prompt_version/calibration_release_id/created_at）',
    JSON.stringify(colNames) === JSON.stringify(['id', 'scheme_version', 'status', 'levels', 'weights', 'thresholds', 'evidence_requirements', 'confidence_map', 'prompt_version', 'calibration_release_id', 'created_at']));
  const uuidPk = await pool.query(
    `SELECT kcu.column_name FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
       WHERE tc.table_name='level_policy_version' AND tc.constraint_type='PRIMARY KEY'`);
  A('id uuid PRIMARY KEY', uuidPk.rows[0]?.column_name === 'id'
    && cols.rows.find((r: { column_name: string }) => r.column_name === 'id')?.data_type === 'uuid');
  const uniqueDef = await pool.query(
    `SELECT pg_get_constraintdef(oid) def FROM pg_constraint
       WHERE conrelid='public.level_policy_version'::regclass AND contype='u'`);
  A('scheme_version UNIQUE 约束在表', uniqueDef.rows.some((r: { def: string }) => r.def?.includes('scheme_version')));
  const checkDef = await pool.query(
    `SELECT pg_get_constraintdef(oid) def FROM pg_constraint
       WHERE conrelid='public.level_policy_version'::regclass AND contype='c' AND conname LIKE '%status%'`);
  A('status CHECK 四态（draft/calibrating/active/retired）',
    checkDef.rows.some((r: { def: string }) => ['draft', 'calibrating', 'active', 'retired'].every((s) => r.def.includes(`'${s}'`))));
  const jsonbCols = ['levels', 'weights', 'thresholds', 'evidence_requirements', 'confidence_map']
    .every((c) => cols.rows.find((r: { column_name: string }) => r.column_name === c)?.data_type === 'jsonb');
  A('五 jsonb 列形制（levels/weights/thresholds/evidence_requirements/confidence_map）', jsonbCols);

  // ── 2·append-only 触发器（UPDATE/DELETE 一律拒）。
  const upd = await pgTry("UPDATE level_policy_version SET status='active' WHERE scheme_version='v2'");
  A('UPDATE 被拒（23514·发布后不可变）', upd.code === '23514' && upd.message.includes('level_policy_version_immutable'));
  const del = await pgTry("DELETE FROM level_policy_version WHERE scheme_version='v2'");
  A('DELETE 被拒（23514·append-only 纵深）', del.code === '23514' && del.message.includes('level_policy_version_immutable'));
  const trg = await pool.query("SELECT count(*)::int n FROM pg_trigger WHERE tgname='level_policy_version_immutable_guard' AND NOT tgisinternal");
  A('immutable_guard 触发器在位', trg.rows[0]?.n === 1);

  // ── 3·seed v2 行 + 附录 A' 16 字段逐字段零漂 diff（对 TS 镜像 LEVEL_SCHEME_V2）。
  const row = (await pool.query("SELECT * FROM level_policy_version WHERE scheme_version='v2'")).rows[0];
  A('seed v2 行恰一条', row !== undefined
    && (await pool.query("SELECT count(*)::int n FROM level_policy_version WHERE scheme_version='v2'")).rows[0].n === 1);
  A("status='calibrating'（校准前不得 active·H1 §3.4）", row?.status === 'calibrating');
  A('prompt_version / calibration_release_id 置 NULL（发布记录尚不存在）', row?.prompt_version === null && row?.calibration_release_id === null);

  const levels = row?.levels ?? {};
  const weights = row?.weights ?? {};
  const thresholds = row?.thresholds ?? {};
  const evreq = row?.evidence_requirements ?? {};
  const confmap = row?.confidence_map ?? {};

  // 16 字段逐字段 diff：jsonb 值与 TS 镜像常量零漂（字段名即契约·Ban 抄写面增删改）。
  A('① levels.tiers 零漂（五档序 L1..L5）', jsonEq(levels.tiers, LEVEL_SCHEME_V2.tiers));
  A('② levels.scoreFloor 零漂（junior:null/50/65/75/85）',
    jsonEq(levels.scoreFloor, LEVEL_SCHEME_V2.scoreFloor));
  A('③ levels.labels 零漂（五档中文标签）', jsonEq(levels.labels, LEVEL_SCHEME_V2.labels));
  A('④ weights.weightByDifficulty 零漂（R1 五权）',
    jsonEq(weights.weightByDifficulty, LEVEL_SCHEME_V2.weightByDifficulty));
  A('⑤ weights.shrinkage 零漂（R2 k=1.5·mu0=50）', jsonEq(weights.shrinkage, LEVEL_SCHEME_V2.shrinkage));
  A('⑥ weights.capabilityWeight 零漂（R3 core=1.0/nonCore=0.5）',
    jsonEq(weights.capabilityWeight, LEVEL_SCHEME_V2.capabilityWeight));
  A('⑦ thresholds.coreFloor 零漂（mid:35/senior:40）', jsonEq(thresholds.coreFloor, LEVEL_SCHEME_V2.coreFloor));
  A('⑧ thresholds.consistencyMargin 零漂（R6=10）', thresholds.consistencyMargin === LEVEL_SCHEME_V2.consistencyMargin);
  A('⑨ thresholds.highestPassedDifficultyLine 零漂（R7=60·与 GAP 同值不同义）',
    thresholds.highestPassedDifficultyLine === LEVEL_SCHEME_V2.highestPassedDifficultyLine);
  A('⑩ thresholds.belowL1Reference 零漂（R8=30）', thresholds.belowL1Reference === LEVEL_SCHEME_V2.belowL1Reference);
  A('⑪ thresholds.milestoneSimulationPass 零漂（S2=70·待校准登记项）',
    thresholds.milestoneSimulationPass === LEVEL_SCHEME_V2.milestoneSimulationPass);
  A('⑫ thresholds.gapLine 零漂（S4 指注·不重复定义）', thresholds.gapLine === LEVEL_SCHEME_V2.gapLine);
  A('⑬ evidence_requirements.minCards 零漂（3/5/6/8/10）', jsonEq(evreq.minCards, LEVEL_SCHEME_V2.minCards));
  A('⑭ evidence_requirements.minCoverage 零漂（2/3/4/4/5）', jsonEq(evreq.minCoverage, LEVEL_SCHEME_V2.minCoverage));
  A('⑮ evidence_requirements.hardEvidence 零漂（四档难度证据全表）',
    jsonEq(evreq.hardEvidence, LEVEL_SCHEME_V2.hardEvidence));
  A('⑯ confidence_map.confidenceCaps 零漂（R5 8/5）', jsonEq(confmap.confidenceCaps, LEVEL_SCHEME_V2.confidenceCaps));
  A('16 字段恰齐（五 jsonb 顶层键并集 = 冻结抄写面·无第 17 字段）',
    (() => {
      const got = [...Object.keys(levels), ...Object.keys(weights), ...Object.keys(thresholds), ...Object.keys(evreq), ...Object.keys(confmap)].sort();
      const want = ['tiers', 'scoreFloor', 'labels', 'weightByDifficulty', 'shrinkage', 'capabilityWeight',
        'coreFloor', 'consistencyMargin', 'highestPassedDifficultyLine', 'belowL1Reference', 'milestoneSimulationPass', 'gapLine',
        'minCards', 'minCoverage', 'hardEvidence', 'confidenceCaps'].sort();
      return JSON.stringify(got) === JSON.stringify(want);
    })());
  A('16 字段零漂总断言（五 jsonb 规范化深比较 = TS 镜像逐值相等）',
    jsonEq({ ...levels, ...weights, ...thresholds, ...evreq, ...confmap }, LEVEL_SCHEME_V2));

  // ── 4·scheme_version unique 断言。
  const dup = await pgTry(
    `INSERT INTO level_policy_version (scheme_version, status, levels, weights, thresholds, evidence_requirements, confidence_map)
       VALUES ('v2','draft','{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb)`);
  A("重复 scheme_version='v2' INSERT 被拒（23505 unique_violation）", dup.code === '23505');

  // ── 5·幂等面：迁移重跑全 skip·行数不变。
  const rerun = await runMigrations(pool, loaded);
  A('重跑全 skip（0160 幂等面·运行器记账）', rerun.applied.length === 0 && rerun.skipped.length === loaded.length);
  A('重跑后 v2 行仍恰一条（零重放零重复）',
    (await pool.query("SELECT count(*)::int n FROM level_policy_version WHERE scheme_version='v2'")).rows[0].n === 1);

  console.log(`\n${fail === 0 ? '✓ 0160 level_policy_version 迁移 prove 全部通过' : `✗ ${fail} 失败`}`);
  if (fail > 0) process.exitCode = 1;
} finally {
  await pool.end();
}
