/**
 * MW-RUN-003：业务校验器抛错归一为 validator_internal_error，不再外派。
 * 本文件不连数据库。真实库上的调用和费用终态在 model-cost-governance.proof.ts。
 * releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { classifyDoubleValidate } from '../src/validators/index.ts';

const failures: string[] = [];
const A = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures.push(name);
};

const schema = z.object({ text: z.string() });
A('正常：校验通过', classifyDoubleValidate(schema, () => null, { text: 'ok' }).ok === true);
A('异常：schema 失败仍是 schema_validation_failed', (() => {
  const r = classifyDoubleValidate(schema, () => null, {});
  return r.ok === false && r.error === 'schema_validation_failed' && r.errorCode === 'schema_validation_failed';
})());
A('异常：业务拒绝仍带 reason，不重写成内部错误', (() => {
  const r = classifyDoubleValidate(schema, () => 'distort', { text: 'x' });
  return r.ok === false && r.error === 'business:distort' && r.errorCode === 'business_validation_failed';
})());
A('异常：校验器抛错归一且不逃逸', (() => {
  const r = classifyDoubleValidate(schema, () => { throw new Error('boom'); }, { text: 'x' });
  return r.ok === false && r.error === 'validator_internal_error' && r.errorCode === 'validator_internal_error';
})());

const invoke = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../src/invoke.ts'), 'utf8');
const gate = invoke.slice(invoke.indexOf('classifyDoubleValidate(spec.schema'));
A('回归：invoke 使用归一结果，没有在校验抛错后再次外派', gate.includes('classified.error') && !gate.slice(0, 800).includes('model.complete'));
console.log('PG_TERMINAL  真实库终态在 model-cost-governance.proof.ts：failed / validator_internal_error，费用结算，同键不再外派');

const exit = failures.length === 0 ? 0 : 1;
console.log(`ATTEMPT_END EXIT=${exit} fail=${failures.length}`);
process.exit(exit);
