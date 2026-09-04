/**
 * HC-GAP-009 static guard (no database).
 *
 * Proves the current invoke seam, not a production fail-closed change:
 * `admitSharedModelOperation` runs only after `resolveModelAdmissionPartition`
 * yields a partition, and that function returns undefined without `operation`.
 * Legacy invoke therefore cannot write `ai_model_concurrency_lease`.
 *
 *   pnpm model-slot-bypass:static:prove
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolveModelAdmissionPartition } from '../src/model-admission.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const invokeSrc = readFileSync(fileURLToPath(new URL('../src/invoke.ts', import.meta.url)), 'utf8');
const admissionSrc = readFileSync(fileURLToPath(new URL('../src/model-admission.ts', import.meta.url)), 'utf8');

export function admitCallIsGuardedByPartition(src: string): boolean {
  const needle = 'await admitSharedModelOperation(';
  const first = src.indexOf(needle);
  if (first < 0) return false;
  if (src.indexOf(needle, first + needle.length) >= 0) return false;
  const before = src.slice(0, first);
  const guard = before.lastIndexOf('if (admissionPartition)');
  if (guard < 0) return false;
  const between = src.slice(guard, first);
  let depth = 0;
  let opened = false;
  for (const ch of between) {
    if (ch === '{') { depth += 1; opened = true; }
    if (ch === '}') depth -= 1;
    if (opened && depth < 1) return false;
  }
  return opened && depth >= 1;
}

export function partitionResolverFailsClosedWithoutOperation(src: string): boolean {
  return /export function resolveModelAdmissionPartition\([\s\S]*?\{[\s\S]*?if \(!spec\.operation\) return undefined;/.test(src);
}

A('无 operation → 分区 undefined（不进入 0120）', resolveModelAdmissionPartition({}) === undefined);
A('空 operation 对象仍须显式 id；缺字段不是分区', resolveModelAdmissionPartition({} as { operation?: { id: string; businessRevision: string } }) === undefined);

const wired = resolveModelAdmissionPartition({
  operation: { id: 'interview.answer-scoring.v1', businessRevision: 'hc-gap-009' },
});
A('wired operation 才派生四字段分区',
  wired?.operationId === 'interview.answer-scoring.v1'
    && wired.providerAccount === 'dashscope-main'
    && wired.region === 'cn-beijing'
    && wired.modelOrRecipe === 'scorer');

A('invoke 只从 spec 派生 admissionPartition',
  /const admissionPartition = resolveModelAdmissionPartition\(spec\);/.test(invokeSrc));
A('invoke 对 admitSharedModelOperation 只有一次 await 调用',
  [...invokeSrc.matchAll(/await admitSharedModelOperation\s*\(/g)].length === 1);
A('该调用必须在 if (admissionPartition) 块内', admitCallIsGuardedByPartition(invokeSrc));
A('resolveModelAdmissionPartition 无 operation 直接 return undefined',
  partitionResolverFailsClosedWithoutOperation(admissionSrc));
A('invoke 注释诚实写出 legacy 不折入共享分区',
  invokeSrc.includes('legacy cost-policy-only') && invokeSrc.includes('不折入共享分区'));
A('model-admission 注释声明非 operation 路径不走共享权威',
  admissionSrc.includes('只有 `spec.operation` 路径走此权威')
    && admissionSrc.includes('legacy cost-policy-only'));

const unguarded = invokeSrc.replace('if (admissionPartition) {', 'if (true) { // unguarded');
A('静态负例：去掉 admissionPartition 守卫则失败', admitCallIsGuardedByPartition(unguarded) === false);
const extraCall = `${invokeSrc}\n  await admitSharedModelOperation(pool, owner, { partition });\n`;
A('静态负例：第二次无守卫 await admit 失败', admitCallIsGuardedByPartition(extraCall) === false);
const missingEarlyReturn = admissionSrc.replace('if (!spec.operation) return undefined;', 'if (!spec.operation) { /* leak */ }');
A('静态负例：去掉无 operation 早退则失败', partitionResolverFailsClosedWithoutOperation(missingEarlyReturn) === false);

console.log(failures ? `\n✗ ${failures} HC-GAP-009 static failed` : '\n✓ HC-GAP-009 static: legacy invoke cannot enter 0120 lease');
process.exit(failures ? 1 : 0);
