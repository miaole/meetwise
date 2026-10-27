/**
 * scoring-eval 基键规范化离线证明（零外呼·零 DB·E2EA-01 件①红停修法辅收臂）。
 *
 * 红停事实：评分评测样本键直拼 fixture 组 ID（中文域），registry businessRevision
 * ASCII 白名单(`/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/`,约束存档 interview-service.ts:317-320)
 * fail-closed → 71 请求 100% `model_operation_revision_invalid` 零评分。
 * 修法（案(b)）：构造点唯一落点 scoring-eval.ts 基键 sha256 hex 规范化——
 * 全 ASCII 过白名单、同输入同键（确定性）、原键域两两唯一（破 cache 语义零损）、
 * 总 revision 长=`scoring-eval:v3:`(16)+64+`:answer:`(8)+64=152≤256。
 *
 * 本证明对**真实码面**断言：resolveModelOperation 真 fail-closed 关口 +
 * interview-service 真 evaluationIdempotencyKey 链 + scoring-eval.ts 构造点源形 +
 * registry 白名单原文在树（案(a) 扩域 Ban 面零触）。
 *
 * pnpm -C apps/worker prove:scoring-eval-key
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveModelOperation } from '@meetwise/ai-runtime';
import { evaluationIdempotencyKey } from '../src/interview-service.ts';
import {
  MANIPULATION_INVARIANTS, MONO_GROUPS, OFFTOPIC, PERTURB_GROUPS,
  type ManipulationInvariantGroup, type MonoGroup, type OfftopicCase, type PerturbGroup,
} from './scoring-golden.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const smokePath = join(repoRoot, 'apps/worker/smoke/scoring-eval.ts');
const registryPath = join(repoRoot, 'packages/ai-runtime/src/model-operation-registry.ts');

/** 与 smoke/scoring-eval.ts evalKey 同形（源形一致性由本证明「构造点源形」臂钉死）。 */
const evalKey = (key: string): string => createHash('sha256').update(key, 'utf8').digest('hex');
const revisionOf = (key: string): string => `scoring-eval:v3:${evalKey(key)}`;
const isAscii = (s: string): boolean => [...s].every((ch) => ch.charCodeAt(0) <= 0x7f);

// 五构造点族全枚举（scoring-eval.ts :110/:141/:157/:176/:184 同形）。
const sampleKeys: string[] = [
  ...MONO_GROUPS.flatMap((g: MonoGroup) => g.cases.map((c) => `${g.id}:${c.tier}`)),
  ...PERTURB_GROUPS.flatMap((g: PerturbGroup) => g.variants.map((_, i) => `${g.id}:v${i}`)),
  ...OFFTOPIC.map((o: OfftopicCase) => o.id),
  ...MANIPULATION_INVARIANTS.flatMap((g: ManipulationInvariantGroup) => [`${g.id}:clean`, ...g.poisonedAnswers.map((_, i) => `${g.id}:poison:${i}`)]),
];
const chineseGroupIds = [...new Set([
  ...MONO_GROUPS.map((g: MonoGroup) => g.id),
  ...PERTURB_GROUPS.map((g: PerturbGroup) => g.id),
  ...MANIPULATION_INVARIANTS.map((g: ManipulationInvariantGroup) => g.id),
])].filter((id: string) => !isAscii(id));

console.log(`\n──── ① 负面对照（修法前形状·真关口必拒）────`);
const oldFormRevisions = chineseGroupIds.slice(0, 3).map((id) => evaluationIdempotencyKey(`scoring-eval:v3:${id}:${'strict'}`, '答'));
A('修法前形状（中文组 ID 直拼）经真 evaluationIdempotencyKey 链后仍非 ASCII', oldFormRevisions.every((r) => !isAscii(r)));
A(`中文组 ID 实证非空（金标 fixture 域）`, chineseGroupIds.length >= 10, `n=${chineseGroupIds.length}`);
A('修法前形状过真 resolveModelOperation 恰得 model_operation_revision_invalid（缺陷在树实证·非想象码面）',
  oldFormRevisions.every((r) => {
    const resolved = resolveModelOperation('interview.answer-scoring.v1', r);
    return !resolved.ok && resolved.error === 'model_operation_revision_invalid';
  }));

console.log(`\n──── ② 修法后形状：真关口全过（revision_invalid=0 的离线必要面）────`);
const newFullKeys = sampleKeys.map((key) => evaluationIdempotencyKey(revisionOf(key), '我会用幂等键与唯一约束保证重复投递不重复生效。'));
A(`样本键全枚举 n=${sampleKeys.length}（≥71 派发分母·五构造点族全覆盖）`, sampleKeys.length >= 71);
A('修法后全 revision 过真 resolveModelOperation（ok=true·零 model_operation_revision_invalid）',
  newFullKeys.every((r) => resolveModelOperation('interview.answer-scoring.v1', r).ok));
A('修法后全 revision 纯 ASCII（含 answer hash 段）', newFullKeys.every(isAscii));
A('总 revision 长=152≤256（白名单长度界内）', newFullKeys.every((r) => r.length === 152 && r.length <= 256));
A('sha256 hex 段恰 64 个小写十六进制（全长零截断）',
  sampleKeys.every((key) => /^[0-9a-f]{64}$/.test(evalKey(key))));

console.log(`\n──── ③ 确定性 + 两两唯一（破 cache 语义零损）────`);
A('同输入同键（逐键重算恒等）', sampleKeys.every((key) => revisionOf(key) === revisionOf(key) && evalKey(key) === evalKey(key)));
A('全样本键两两唯一（Set 恒等原键数）', new Set(sampleKeys.map(revisionOf)).size === sampleKeys.length,
  `unique=${new Set(sampleKeys.map(revisionOf)).size}/${sampleKeys.length}`);
A('不同样本键不得映射同 hash（answer 段独立于基键仍全链唯一）',
  new Set(newFullKeys).size === sampleKeys.length);

console.log(`\n──── ④ 构造点源形（恰 1 码面文件·五构造点共用一 helper）────`);
const smoke = readFileSync(smokePath, 'utf8');
A('构造点唯一落点已规范化：`scoring-eval:v3:${evalKey(key)}` 恰 1 处',
  (smoke.match(/baseIdempotencyKey: `scoring-eval:v3:\$\{evalKey\(key\)\}`/g) ?? []).length === 1);
A('修法前原样插值 `scoring-eval:v3:${key}` 零残留', !smoke.includes('`scoring-eval:v3:${key}`'));
A('evalKey helper=sha256 utf8 hex（与 interview-service answer hash 同形）',
  /evalKey = \(key: string\): string => createHash\('sha256'\)\.update\(key, 'utf8'\)\.digest\('hex'\)/.test(smoke));
A('五构造点仍经 scoreOnce 单口（key 参数面未增第二构造点）',
  (smoke.match(/baseIdempotencyKey:/g) ?? []).length === 1 && (smoke.match(/scoreOnce\(/g) ?? []).length >= 5);
A('fixture 显示词面零触：组 ID 原文仍直入印刷（可读性零损）',
  smoke.includes('${g.id.padEnd(') && smoke.includes('rejected=${s.reason}'));
A('registry 白名单原文在树零触（案(a) 扩域 Ban 面）',
  readFileSync(registryPath, 'utf8').includes('/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/'));
A('registry fail-closed 分支在树零触（model_operation_revision_invalid 语义保持）',
  readFileSync(registryPath, 'utf8').includes("'model_operation_revision_invalid'"));

console.log(`\n${failures === 0 ? '✓ scoring-eval 基键规范化离线证明全部通过（ASCII/确定性/唯一性/源形·真关口零 revision_invalid）' : `✗ ${failures} 项失败`}`);
process.exit(failures ? 1 : 0);
