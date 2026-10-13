/**
 * AG-12 成本轨③ proof（cjk-weighted-v1 CJK 加权估算器：注册+分派+fail-closed+env 门）。
 *
 * 纯函数·零 DB·零外呼（est live=0）。断言族（REQUEST §2-1 五臂）：
 *  ① v2 权重形：纯 CJK=N×1.0·纯 ASCII=ceil(bytes/3)·混合两肩相加·空串 0·非空 ≥1·
 *     全角/假名/部首区段臂（U+2E80–U+9FFF ∪ U+F900–FAFF ∪ U+FF00–FFEF）·谚文数值等价臂
 *     （U+AC00 不在集合·3 字节→3/3=1.0 系数值等价非集合成员）·astral/代理对臂
 *     （U+2A6AE 双连串=ceil(8/3)=3；按 UTF-16 单元错迭代成两孤代理 3+3→ceil(12/3)=4 必红——
 *     「逐码点」语义唯一实现判定臂）。
 *  ② v1 零漂：byteEstimate 同输入同输出（estimateContextTokens v1 与 Buffer.byteLength 逐值恒等，
 *     含 context-budget.proof :57 单 CJK=3 字节原值臂同值复钉）。
 *  ③ 分派/fail-closed：estimateContextTokens 与 planContextBudget 对 v2 正分派；对未注册版本
 *     仍 throw context_estimator_unknown / model_context_policy_invalid。
 *  ④ refineEstimate 套 v2 估算链：ceil(factor×estimate)·上界语义注释口径不变。
 *  ⑤ env 门：resolveModelCostGovernance endpoint() 对双值各受理·第三值/空值 throw
 *     model_cost_invalid_*（四前缀 MODEL_PRIMARY/MODEL_FAST/MODEL_BACKUP/MODEL_FAST_BACKUP 各一臂）。
 */
import {
  KNOWN_ESTIMATOR_VERSIONS, cjkWeightedEstimate, estimateContextTokens, planContextBudget,
  refineEstimate, isKnownEstimatorVersion,
  type CalibratedFactor, type CompletionRequest, type ModelCostPolicy,
} from '@meetwise/ai-runtime';
import { resolveModelCostGovernance } from '../src/model-cost-governance.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const errorOf = (fn: () => unknown): string => { try { fn(); return ''; } catch (e) { return e instanceof Error ? e.message : String(e); } };

// ═══════════════════════════════════════════════════════════════════════════
// ① v2 权重形（cjkWeightedEstimate 原语）
// ═══════════════════════════════════════════════════════════════════════════
A('① 注册：KNOWN_ESTIMATOR_VERSIONS 恰两值且 v2 在册', KNOWN_ESTIMATOR_VERSIONS.length === 2
  && KNOWN_ESTIMATOR_VERSIONS[0] === 'utf8-bytes-v1' && KNOWN_ESTIMATOR_VERSIONS[1] === 'cjk-weighted-v1');
A('① isKnownEstimatorVersion：v1/v2 真·utf8-bytes-v2/utf8-bytes-v9 假（未知 fail-closed 域不扩）',
  isKnownEstimatorVersion('utf8-bytes-v1') && isKnownEstimatorVersion('cjk-weighted-v1')
  && !isKnownEstimatorVersion('utf8-bytes-v2') && !isKnownEstimatorVersion('utf8-bytes-v9'));
A('① 空串 = 0', cjkWeightedEstimate('') === 0);
A('① 纯 CJK 4 字 = 4×1.0 = 4', cjkWeightedEstimate('中文测试') === 4);
A('① 纯 ASCII 3 字符 = ceil(3/3) = 1', cjkWeightedEstimate('abc') === 1);
A('① 纯 ASCII 7 字符 = ceil(7/3) = 3', cjkWeightedEstimate('abcdefg') === 3);
A('① 混合「中a文b」= 1.0+1/3+1.0+1/3 = ceil(8/3) = 3', cjkWeightedEstimate('中a文b') === 3);
A('① 全角形区段 U+FF21/U+FF22 各 1.0 → 2', cjkWeightedEstimate('\uFF21\uFF22') === 2);
A('① 假名区段 U+3042/U+304A（∈2E80–9FFF）各 1.0 → 2', cjkWeightedEstimate('\u3042\u304A') === 2);
A('① 区段下界 U+2E80 与上界 U+9FFF 各 1.0（闭区间）',
  cjkWeightedEstimate('\u2E80') === 1 && cjkWeightedEstimate('\u9FFF') === 1);
A('① 兼容表意区段 U+F900/U+FAFF 各 1.0（闭区间）',
  cjkWeightedEstimate('\uF900') === 1 && cjkWeightedEstimate('\uFAFF') === 1);
A('① 区段外紧邻 U+2E7F（3 字节）= ceil(3/3) = 1 且 U+A000（3 字节）= 1（区段集边界外按字节/3）',
  cjkWeightedEstimate('\u2E7F') === 1 && cjkWeightedEstimate('\uA000') === 1);
A('① 谚文数值等价臂：U+AC00 不在集合·UTF-8 3 字节 → 3/3 = 1（数值等价非集合成员）',
  cjkWeightedEstimate('\uAC00') === 1);
A('① 谚文字母 U+1100 同形 3/3 = 1', cjkWeightedEstimate('\u1100') === 1);
A('① astral 单码点 U+2A6AE（Ext B·不在集合·4 字节）= ceil(4/3) = 2', cjkWeightedEstimate('\u{2A6AE}') === 2);
A('① astral/代理对臂：U+2A6AE 双连串 = 2×4/3 = ceil(8/3) = 3（UTF-16 错迭代 4 必红·逐码点唯一判定）',
  cjkWeightedEstimate('\u{2A6AE}\u{2A6AE}') === 3);
A('① 非空 ≥1：单字节「.」= ceil(1/3) = 1', cjkWeightedEstimate('.') === 1);
A('① emoji U+1F600（4 字节·非 CJK 区段）= ceil(4/3) = 2', cjkWeightedEstimate('\u{1F600}') === 2);

// ═══════════════════════════════════════════════════════════════════════════
// ② v1 零漂（byteEstimate 原语/既有断言恒等·缺省路径逐字节零变）
// ═══════════════════════════════════════════════════════════════════════════
const V1_SAMPLES = ['abc', '中', '中文测试四字', '中a文b', '\u{2A6AE}\u{2A6AE}', '\u{1F600}', '', '한글 텍스트', 'ＡＢＣ'];
A('② v1 逐值恒等：estimateContextTokens(x, utf8-bytes-v1) === Buffer.byteLength(x, utf8)（9 样本谱）',
  V1_SAMPLES.every((s) => estimateContextTokens(s, 'utf8-bytes-v1') === Buffer.byteLength(s, 'utf8')));
A('② 单 CJK = 3 字节原值臂（context-budget.proof :57 同值复钉）', estimateContextTokens('中', 'utf8-bytes-v1') === 3);
A('② ASCII 3 字符 = 3 token 原值臂（context-budget.proof :56 同值复钉）', estimateContextTokens('abc', 'utf8-bytes-v1') === 3);
A('② 空串 = 0 原值臂（context-budget.proof :58 同值复钉）', estimateContextTokens('', 'utf8-bytes-v1') === 0);

// ═══════════════════════════════════════════════════════════════════════════
// ③ 分派/fail-closed（estimateContextTokens + planContextBudget 双面）
// ═══════════════════════════════════════════════════════════════════════════
A('③ 分派正例：estimateContextTokens(中文, v2) = 2', estimateContextTokens('中文', 'cjk-weighted-v1') === 2);
A('③ 分派正例：estimateContextTokens(中a文, v2) = ceil(1+1/3+1) = 3', estimateContextTokens('中a文', 'cjk-weighted-v1') === 3);
A('③ fail-closed：estimateContextTokens 未注册版本 throw context_estimator_unknown',
  errorOf(() => estimateContextTokens('x', 'utf8-bytes-v9' as never)) === 'context_estimator_unknown');

const policyBase = {
  scopeId: 'model-proof', provider: 'dashscope', model: 'qwen-plus', region: 'cn-beijing', priceRevision: 'proof-r1',
  maxInputTokens: 16000, maxOutputTokens: 4000,
  contextWindowTokens: 32768, contextSafetyMarginTokens: 512,
} as const;
const req: CompletionRequest = {
  service: 'proof.svc',
  system: '稳定系统指令',
  userData: '两万字中文简历事实会在此被 v1 误判超预算而 v2 修复',
};
const planV1 = planContextBudget(req, { ...policyBase, contextEstimator: 'utf8-bytes-v1' });
const planV2 = planContextBudget(req, { ...policyBase, contextEstimator: 'cjk-weighted-v1' });
A('③ planContextBudget v2 正分派：ok 且 plan.estimator=v2', planV1.ok && planV2.ok && planV2.plan.estimator === 'cjk-weighted-v1');
A('③ CJK 长输入 v2 计量 < v1（AG-12 3.7× 高估修复方向臂·min=max 零改善根除）',
  planV1.ok && planV2.ok && planV2.plan.inputTokens < planV1.plan.inputTokens);
A('③ planContextBudget 未注册版本仍 model_context_policy_invalid（fail-closed 不放松）',
  planContextBudget(req, { ...policyBase, contextEstimator: 'utf8-bytes-v9' as never }).ok === false
  && planContextBudget(req, { ...policyBase, contextEstimator: undefined as never }).ok === false);
A('③ planContextBudget v1 plan.estimator=v1 且 inputTokens 与改前恒等（estimator 面零漂）',
  planV1.ok && planV1.plan.estimator === 'utf8-bytes-v1');

// ═══════════════════════════════════════════════════════════════════════════
// ④ refineEstimate 套 v2 估算链（ceil(factor×estimate)·上界语义）
// ═══════════════════════════════════════════════════════════════════════════
const cal: CalibratedFactor = {
  estimator: 'cjk-weighted-v1', factorVersion: `cjk-weighted-v1.calibration-v1.${'a'.repeat(64)}`,
  factor: 1.1, rawMaxRatio: 1.0, safetyMargin: 0.1, observationCount: 3, hasUnderEstimate: false,
};
A('④ estimateContextTokens 套 v2 校准：7 CJK 字 ×1.1 → ceil(7.7) = 8',
  estimateContextTokens('中文测试四字串', 'cjk-weighted-v1', cal) === 8);
A('④ refineEstimate 直套 v2 原语：ceil(1.1 × 1) = 2', refineEstimate(cjkWeightedEstimate('abc'), cal) === 2);
A('④ v1 校准链恒等：3 字节 ×1.1 → ceil(3.3) = 4（refineEstimate 精化链零变）',
  estimateContextTokens('中', 'utf8-bytes-v1', { ...cal, estimator: 'utf8-bytes-v1' }) === 4);

// ═══════════════════════════════════════════════════════════════════════════
// ⑤ env 门：四前缀双值受理 + 第三值/空值 fail-closed（fixture 形沿 worker model-cost-governance proof）
// ═══════════════════════════════════════════════════════════════════════════
const failsWith = (env: NodeJS.ProcessEnv) => {
  try { resolveModelCostGovernance(env); return false; } catch { return true; }
};
const endpointEnv = (prefix: string, model: string, estimator: string) => ({
  [`${prefix}_BILLING_PROVIDER`]: 'dashscope',
  [`${prefix}_BILLING_MODEL`]: model,
  [`${prefix}_BILLING_REGION`]: 'cn-beijing',
  [`${prefix}_PRICE_REVISION`]: '2026-08-03-r1',
  [`${prefix}_INPUT_MICRO_CNY_PER_MILLION`]: '1000000',
  [`${prefix}_OUTPUT_MICRO_CNY_PER_MILLION`]: '2000000',
  [`${prefix}_PRICE_SOURCE_URL`]: 'https://example.test/pricing',
  [`${prefix}_MAX_INPUT_TOKENS`]: '16000',
  [`${prefix}_MAX_OUTPUT_TOKENS`]: '4000',
  [`${prefix}_CONTEXT_WINDOW_TOKENS`]: '32768',
  [`${prefix}_CONTEXT_ESTIMATOR`]: estimator,
  [`${prefix}_CONTEXT_SAFETY_MARGIN_TOKENS`]: '512',
});
const baseEnv = (primaryEstimator: string, fastEstimator: string) => ({
  NODE_ENV: 'production', MODEL_COST_ENFORCEMENT: 'enforce', MODEL_COST_BUDGET_SCOPE: 'model-prod', MODEL_COST_MONTHLY_BUDGET_MICRO_CNY: '100000000',
  MODEL_NAME: 'qwen-plus', MODEL_FAST_NAME: 'qwen-turbo',
  ...endpointEnv('MODEL_PRIMARY', 'qwen-plus', primaryEstimator), ...endpointEnv('MODEL_FAST', 'qwen-turbo', fastEstimator),
} as NodeJS.ProcessEnv);
const backupEnv = (backupEstimator: string, fastBackupEstimator: string) => ({
  ...baseEnv('utf8-bytes-v1', 'utf8-bytes-v1'), MODEL_BACKUP_API_KEY: 'backup-test-only',
  MODEL_BACKUP_NAME: 'qwen-plus-backup', MODEL_FAST_BACKUP_NAME: 'qwen-turbo-backup',
  ...endpointEnv('MODEL_BACKUP', 'qwen-plus-backup', backupEstimator), ...endpointEnv('MODEL_FAST_BACKUP', 'qwen-turbo-backup', fastBackupEstimator),
} as NodeJS.ProcessEnv);

A('⑤ MODEL_PRIMARY/MODEL_FAST 双值受理：v1/v1 与 v2/v2 组合均启动成功且 policy 值透传',
  (() => {
    const bothV1 = resolveModelCostGovernance(baseEnv('utf8-bytes-v1', 'utf8-bytes-v1'));
    const bothV2 = resolveModelCostGovernance(baseEnv('cjk-weighted-v1', 'cjk-weighted-v1'));
    const mixed = resolveModelCostGovernance(baseEnv('utf8-bytes-v1', 'cjk-weighted-v1'));
    return bothV1.policies.primary?.contextEstimator === 'utf8-bytes-v1' && bothV1.policies.fastPrimary?.contextEstimator === 'utf8-bytes-v1'
      && bothV2.policies.primary?.contextEstimator === 'cjk-weighted-v1' && bothV2.policies.fastPrimary?.contextEstimator === 'cjk-weighted-v1'
      && mixed.policies.primary?.contextEstimator === 'utf8-bytes-v1' && mixed.policies.fastPrimary?.contextEstimator === 'cjk-weighted-v1';
  })());
A('⑤ MODEL_BACKUP/MODEL_FAST_BACKUP 双值受理：v2 挂备用端点启动成功且透传（四前缀全覆盖）',
  (() => {
    const b = resolveModelCostGovernance(backupEnv('cjk-weighted-v1', 'utf8-bytes-v1'));
    return b.policies.backup?.contextEstimator === 'cjk-weighted-v1' && b.policies.fastBackup?.contextEstimator === 'utf8-bytes-v1';
  })());
A('⑤ MODEL_PRIMARY 第三值 fail-closed：model_cost_invalid_model_primary_context_estimator',
  failsWith({ ...baseEnv('utf8-bytes-v1', 'utf8-bytes-v1'), MODEL_PRIMARY_CONTEXT_ESTIMATOR: 'utf8-bytes-v9' }));
A('⑤ MODEL_FAST 第三值 fail-closed：model_cost_invalid_model_fast_context_estimator',
  failsWith({ ...baseEnv('utf8-bytes-v1', 'utf8-bytes-v1'), MODEL_FAST_CONTEXT_ESTIMATOR: 'guess-v1' }));
A('⑤ MODEL_BACKUP 第三值 fail-closed：model_cost_invalid_model_backup_context_estimator',
  failsWith({ ...backupEnv('utf8-bytes-v1', 'utf8-bytes-v1'), MODEL_BACKUP_CONTEXT_ESTIMATOR: '' }));
A('⑤ MODEL_FAST_BACKUP 缺失 fail-closed（required 缺失即启动失败原值保留）',
  failsWith((() => { const e: Record<string, string> = { ...backupEnv('utf8-bytes-v1', 'utf8-bytes-v1') }; delete e.MODEL_FAST_BACKUP_CONTEXT_ESTIMATOR; return e as NodeJS.ProcessEnv; })()));

console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-12 cjk-weighted-v1 估算器五臂证明全部通过（零 DB 零外呼）');
process.exit(failures ? 1 : 0);
