/**
 * usage-reconciliation 纯逻辑 proof:tokenizer/usage 对账与版本化保守校准。
 * 无 DB、无网络、无墙钟依赖;断言的是承重不变量:
 *   低估显式标记、上界支配、因子单调、确定性、版本 fail-closed、保守下界。
 * 这是"真断言不变量",不是"返回了东西"。
 */
import {
  DEFAULT_SAFETY_MARGIN,
  MAX_SAFETY_MARGIN,
  isKnownEstimatorVersion,
  reconcileUsage,
  refineEstimate,
  type CalibratedFactor,
  type UsageObservation,
} from '../src/usage-reconciliation.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;
const cal = (o: ReturnType<typeof reconcileUsage>): CalibratedFactor | null => (o.ok ? o.calibration : null);
const rejects = (o: ReturnType<typeof reconcileUsage>, error: string) => !o.ok && o.error === error;

const obs = (overrides: Partial<UsageObservation> = {}): UsageObservation => ({
  estimator: 'utf8-bytes-v1',
  estimateInputTokens: 1000,
  providerInputTokens: 400,
  providerOutputTokens: 120,
  service: 'mock-interview.evaluate',
  model: 'qwen-plus',
  batch: 'b1',
  observedAtMs: 1_700_000_000_000,
  ...overrides,
});

// ── 低估检测:provider > estimate 是承重不变量违约,必须显式标记,且因子放大回安全上界。
const under = reconcileUsage([obs({ estimateInputTokens: 100, providerInputTokens: 150 })]);
A('低估被显式标记 underEstimated + hasUnderEstimate,因子放大 >1 重新支配',
  under.ok === true
  && under.verdicts.length === 1
  && under.verdicts[0]!.underEstimated === true
  && under.calibration !== null
  && under.calibration.hasUnderEstimate === true
  && under.calibration.factor > 1
  && close(under.calibration.rawMaxRatio, 1.5));
A('低估后精化估算重新支配该观测(165 ≥ 150),绝不静默吞掉违约',
  under.ok && under.calibration !== null && refineEstimate(100, under.calibration) >= 150);

// ── 保守下界不变量:精化后估算 ≥ 所有已观测 provider usage。
const history = [
  obs({ service: 's1', estimateInputTokens: 1000, providerInputTokens: 400 }), // ratio 0.4
  obs({ service: 's2', estimateInputTokens: 500, providerInputTokens: 300 }),  // ratio 0.6 (worst)
  obs({ service: 's3', estimateInputTokens: 2000, providerInputTokens: 100 }), // ratio 0.05
];
const hist = reconcileUsage(history);
A('因子 = 已观测最坏比率 × (1 + 默认余量) = 0.66',
  hist.ok && hist.calibration !== null
  && close(hist.calibration.rawMaxRatio, 0.6)
  && close(hist.calibration.factor, 0.6 * (1 + DEFAULT_SAFETY_MARGIN)));
A('精化估算 ≥ 所有已观测 provider usage(保守下界不变量,逐条支配)',
  hist.ok && hist.calibration !== null
  && history.every((o) => refineEstimate(o.estimateInputTokens, hist.calibration!) >= o.providerInputTokens));

// ── 因子单调性:加观测绝不破坏既有上界。
const baseSet = [obs({ service: 's1', estimateInputTokens: 1000, providerInputTokens: 400 })]; // ratio 0.4
const fBase = reconcileUsage(baseSet);
const fLower = reconcileUsage([...baseSet, obs({ service: 's2', estimateInputTokens: 500, providerInputTokens: 100 })]);  // ratio 0.2
const fHigher = reconcileUsage([...baseSet, obs({ service: 's3', estimateInputTokens: 500, providerInputTokens: 400 })]); // ratio 0.8
A('因子单调性:加低比率观测不降因子,加高比率观测升因子',
  fBase.ok && fLower.ok && fHigher.ok
  && cal(fBase) !== null && cal(fLower) !== null && cal(fHigher) !== null
  && close(cal(fLower)!.factor, cal(fBase)!.factor)
  && cal(fHigher)!.factor > cal(fBase)!.factor);
A('加高比率观测后,既有观测仍被新因子支配(上界只升不降)',
  fHigher.ok && cal(fHigher) !== null
  && baseSet.every((o) => refineEstimate(o.estimateInputTokens, cal(fHigher)!) >= o.providerInputTokens));

// ── 空历史行为:未声明版本 fail-closed;声明已知版本 → 无校准(null),不猜。
const emptyNoVersion = reconcileUsage([]);
const emptyDeclared = reconcileUsage([], { estimator: 'utf8-bytes-v1' });
A('空历史:未声明版本 fail-closed;声明已知版本 → verdicts=[] 且 calibration=null',
  rejects(emptyNoVersion, 'usage_estimator_unknown')
  && emptyDeclared.ok && emptyDeclared.verdicts.length === 0 && emptyDeclared.calibration === null);

// ── 确定性 + 顺序无关 + 时间/批次无关:因子与版本均稳定(内容身份摘要)。
const detSet = [
  obs({ service: 'sa', estimateInputTokens: 1000, providerInputTokens: 400, batch: 'b1', observedAtMs: 100 }),
  obs({ service: 'sb', estimateInputTokens: 500, providerInputTokens: 300, batch: 'b2', observedAtMs: 200 }),
];
const det1 = reconcileUsage(detSet);
const det2 = reconcileUsage([detSet[1]!, detSet[0]!]);
const det3 = reconcileUsage(detSet.map((o) => ({ ...o, batch: `${o.batch}-x`, observedAtMs: o.observedAtMs + 999_999 })));
A('确定性 + 顺序无关 + 时间/批次无关:因子与版本均稳定',
  det1.ok && det2.ok && det3.ok
  && cal(det1) !== null && cal(det2) !== null && cal(det3) !== null
  && close(cal(det1)!.factor, cal(det2)!.factor)
  && cal(det1)!.factorVersion === cal(det2)!.factorVersion
  && cal(det1)!.factorVersion === cal(det3)!.factorVersion);

// ── 未知估算器版本 fail-closed(观测入口与声明入口都拒绝)。
A('未知估算器版本 fail-closed(观测入口带下标、声明入口拒绝)',
  rejects(reconcileUsage([{ ...obs(), estimator: 'utf8-bytes-v2' as unknown as UsageObservation['estimator'] }]), 'usage_estimator_unknown')
  && (() => { const r = reconcileUsage([{ ...obs(), estimator: 'utf8-bytes-v2' as unknown as UsageObservation['estimator'] }]); return !r.ok && r.index === 0; })()
  && rejects(reconcileUsage([], { estimator: 'utf8-bytes-v9' as unknown as UsageObservation['estimator'] }), 'usage_estimator_unknown'));
A('isKnownEstimatorVersion 只认登记版本',
  isKnownEstimatorVersion('utf8-bytes-v1') === true
  && isKnownEstimatorVersion('utf8-bytes-v2') === false
  && isKnownEstimatorVersion('') === false
  && isKnownEstimatorVersion(123) === false);

// ── 字段级非法观测逐条 fail-closed 且返回下标。
const invalidCases: Partial<UsageObservation>[] = [
  { estimateInputTokens: 0 },
  { estimateInputTokens: 1.5 },
  { providerInputTokens: -1 },
  { providerOutputTokens: -1 },
  { service: '' },
  { model: '   ' },
  { batch: '' },
  { observedAtMs: Number.NaN },
];
A('字段级非法观测(estimate=0/非整数、负 usage、空标识、NaN 时间)逐条 fail-closed 且返回下标',
  invalidCases.every((over) => {
    const r = reconcileUsage([obs(over)]);
    return !r.ok && r.error === 'usage_observation_invalid' && r.index === 0;
  }));

// ── 安全余量非法(负/超上限/NaN) fail-closed。
A('安全余量非法(负/超上限/NaN) fail-closed',
  rejects(reconcileUsage([obs()], { safetyMargin: -0.01 }), 'usage_safety_margin_invalid')
  && rejects(reconcileUsage([obs()], { safetyMargin: MAX_SAFETY_MARGIN + 0.1 }), 'usage_safety_margin_invalid')
  && rejects(reconcileUsage([obs()], { safetyMargin: Number.NaN }), 'usage_safety_margin_invalid'));

// ── 零上报观测:无校准信号、不误判低估、不计入因子样本。
const zeroProvider = reconcileUsage([obs({ providerInputTokens: 0, providerOutputTokens: 0 })]);
const mixed = reconcileUsage([
  obs({ estimateInputTokens: 1000, providerInputTokens: 400 }),
  obs({ providerInputTokens: 0, providerOutputTokens: 0 }),
]);
A('provider 未上报输入(0)不产生校准、不误判低估',
  zeroProvider.ok && zeroProvider.calibration === null
  && zeroProvider.verdicts.length === 1
  && zeroProvider.verdicts[0]!.underEstimated === false);
A('零上报观测不计入因子样本,但仍在 verdicts 中(observationCount=1, verdicts=2)',
  mixed.ok && mixed.calibration !== null && mixed.calibration.observationCount === 1 && mixed.verdicts.length === 2);

// ── refineEstimate 对非法估算值显式报错,而非静默。
const dummyCal: CalibratedFactor = {
  estimator: 'utf8-bytes-v1', factorVersion: 'x', factor: 0.66, rawMaxRatio: 0.6,
  safetyMargin: DEFAULT_SAFETY_MARGIN, observationCount: 1, hasUnderEstimate: false,
};
let threw = false;
try { refineEstimate(0, dummyCal); } catch { threw = true; }
A('refineEstimate 对非法估算值(0)显式报错,而非静默返回',
  threw && refineEstimate(1000, dummyCal) === 660);

console.log(failures === 0
  ? '\n✓ usage-reconciliation 对账/校准不变量全部通过(纯逻辑,无 DB/网络/墙钟)'
  : `\n✗ ${failures} 项失败`);
process.exit(failures === 0 ? 0 : 1);
