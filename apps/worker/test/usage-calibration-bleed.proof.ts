/**
 * AG-07 止血旋钮证明（AG-COST1 §1-①·AG-07 P1→P2：60s 硬编码→env 旋钮）。
 *
 * 三臂（REQUEST §2-1）：①env 全缺省臂——ENABLED 缺省 false（裁决项①推荐 (b) 干脆关停·可调）+
 * INTERVAL 缺省 86_400_000（专家意见 (a) 降频到每天·重启用缺省即按天·绝不回退 60s）；
 * ②非法值臂——INTERVAL_MS=abc/-1/0.5/越域、ENABLED=非布尔 → throw 专用 error code（启动失败·
 * 沿 AG-18「非法就启动失败」纪律·绝不静默回退）；③合法臂——合法值生效 + main.ts 三处接线源级
 * pin（:710 条件起循环/:738 ready 短路/:772 drainStops 可选 stop）+ runDrainLoop 间隔透传源级
 * pin + 活循环 smoke（首拍即跑·ready 真·stop 排空）+ 域级本体 sha256 pin（AG-COST2 授权触面
 * 施工后 re-pin 新值·零字节承诺显式解除·勘误注随 REQUEST 落卷）。
 *
 * 零 DB：活循环 smoke 的 fake pool 只触发 tick 内 enumerate 失败 catch（tick 自吞·整拍不抛的
 * 既有语义），零真实连接零外呼零模型调用（est live=0·actualSpendCny=null）。
 */
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import type { DbPool } from '@meetwise/db';
import {
  resolveUsageCalibrationReconcileConfig, runUsageCalibrationReconciler,
} from '../src/usage-calibration-reconcile.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const errorOf = (fn: () => unknown): string => { try { fn(); return ''; } catch (e) { return e instanceof Error ? e.message : String(e); } };

// ── 臂① env 全缺省：默认=关停（裁决项①(b)·EXEC 按卷推荐执行·可调）+ 按天间隔 ─────────────
const defaulted = resolveUsageCalibrationReconcileConfig({});
A('臂① env 全缺省：ENABLED 缺省 false（关停·裁决项①(b) 推荐执行·可调）', defaulted.enabled === false);
A('臂① env 全缺省：INTERVAL_MS 缺省 86_400_000（重启用即按天·专家意见 (a) 值·绝不回退 60s）', defaulted.intervalMs === 86_400_000);
A('臂① 空串视同缺省（boundedInteger/boundedBoolean 既有先例形）',
  resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_ENABLED: '', USAGE_CALIBRATION_INTERVAL_MS: '' }).enabled === false
  && resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_INTERVAL_MS: '' }).intervalMs === 86_400_000);

// ── 臂② 非法值 → throw 专用 error code（启动失败·不静默） ─────────────────────────────
const INTERVAL_ILLEGAL: Array<[string, string]> = [
  ['abc', '非数值'], ['-1', '负数'], ['0.5', '非整数'], ['1000', '低于下界 60_000'], ['999999999', '高于上界 604_800_000'],
];
for (const [raw, label] of INTERVAL_ILLEGAL) {
  A(`臂② INTERVAL_MS=${raw}（${label}）→ throw usage_calibration_reconcile_interval_invalid`,
    errorOf(() => resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_INTERVAL_MS: raw })) === 'usage_calibration_reconcile_interval_invalid');
}
for (const raw of ['yes', 'enabled', '2']) {
  A(`臂② ENABLED=${raw}（非布尔）→ throw usage_calibration_reconcile_enabled_invalid`,
    errorOf(() => resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_ENABLED: raw })) === 'usage_calibration_reconcile_enabled_invalid');
}

// ── 臂③ 合法值生效（三呈报值 60_000/3_600_000/86_400_000 全合法 + 布尔三形） ────────────
A('臂③ ENABLED=1 → true（重启用）', resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_ENABLED: '1' }).enabled === true);
A('臂③ ENABLED=true（大小写归一）→ true', resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_ENABLED: 'TRUE' }).enabled === true);
A('臂③ ENABLED=0 → false（显式关停合法）', resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_ENABLED: '0' }).enabled === false);
A('臂③ INTERVAL_MS=60000（原 60s 硬编码值·任务书中间下界）合法',
  resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_INTERVAL_MS: '60000' }).intervalMs === 60_000);
A('臂③ INTERVAL_MS=3600000（中间档每小时·任务书登记值）合法',
  resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_INTERVAL_MS: '3600000' }).intervalMs === 3_600_000);
A('臂③ INTERVAL_MS=86400000（每天·专家意见 (a) 值）合法',
  resolveUsageCalibrationReconcileConfig({ USAGE_CALIBRATION_INTERVAL_MS: '86400000' }).intervalMs === 86_400_000);

// ── 臂③ 接线源级 pin（main.ts 三处 + 间隔透传面·沿 ha-2-drain 源级断言形制） ────────────
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mainSrc = readFileSync(join(root, 'src/main.ts'), 'utf8');
A('接线 pin：main.ts 调用点改传 resolve 结果（resolveUsageCalibrationReconcileConfig()）',
  /const usageCalibrationControl = resolveUsageCalibrationReconcileConfig\(\);/.test(mainSrc));
A('接线 pin：ENABLED=false → 不起循环（enabled 条件三目 + : undefined·沿 privacyErasureLoop 可选循环先例）',
  /usageCalibrationControl\.enabled\s*\n?\s*\? runUsageCalibrationReconciler\(pool, usageCalibrationControl\.intervalMs\)\s*\n?\s*: undefined;/.test(mainSrc));
A('接线 pin：ready 面可选短路（(usageCalibrationReconcileLoop?.ready() ?? true)）',
  /\(usageCalibrationReconcileLoop\?\.ready\(\) \?\? true\)/.test(mainSrc));
A('接线 pin：drainStops 可选 stop（usageCalibrationReconcileLoop?.stop() ?? Promise.resolve()）',
  /usageCalibrationReconcileLoop\?\.stop\(\) \?\? Promise\.resolve\(\)/.test(mainSrc));
A('接线 pin：drainStops 具名项在位（ha-2-drain A.4 清单 16 项零回归）',
  /\{ name: 'usage-calibration-reconcile', stop:/.test(mainSrc));

const reconcileSrc = readFileSync(join(root, 'src/usage-calibration-reconcile.ts'), 'utf8');
A('间隔透传 pin：runUsageCalibrationReconciler(pool, intervalMs) → runDrainLoop(tick, intervalMs)（intervalMs 逐参透传）',
  /runDrainLoop\(async \(\) => \{ await usageCalibrationReconcileTick\(pool\); \}, intervalMs\)/.test(reconcileSrc));

// ── 臂③ 域级本体 sha256 pin（§0.1 #3 重 pin·AG-COST2 授权触面：加窗路径+因子合并落本件·
// cost1 零字节承诺由本刀显式解除并 re-pin 新值·沿 §0「漂则重 pin」锚协议·勘误注随 REQUEST 落卷） ──
const reconcilerPath = join(root, '../../packages/ai-runtime/src/usage-calibration-reconciler.ts');
const reconcilerSha = createHash('sha256').update(readFileSync(reconcilerPath, 'utf8')).digest('hex');
A('域级本体 sha256 pin：usage-calibration-reconciler.ts == AG-COST2 施工后 re-pin 值（防顺手触碰·原 cost1 值 3f375925…df1 已随授权触面退役）',
  reconcilerSha === '429cdfdc51c3dba8f4fd04d35303249d98028f793fad738bab45b8b88fe76ac1');

// ── 臂③ 活循环 smoke（零 DB：fake pool 触发 enumerate 失败 catch·tick 自吞整拍不抛） ────
async function main() {
  const fakePool = { query: async () => { throw new Error('proof_no_db_zero_live'); } } as unknown as DbPool;
  const loop = runUsageCalibrationReconciler(fakePool, 60_000);
  await new Promise((r) => setTimeout(r, 100));   // 首拍 wakePending=true 即跑（不等 60s）
  A('活循环 smoke：loop 起 + 首拍完成（enumerate 失败被 tick 自吞·consecutiveFailures=0）',
    loop.ready() === true && loop.snapshot().consecutiveFailures === 0);
  await loop.stop();
  A('活循环 smoke：stop() 排空 resolve（可优雅排空语义原值）', loop.ready() === false);

  console.log(`\n${failures === 0 ? '✓ AG-07 止血旋钮三臂证明全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
