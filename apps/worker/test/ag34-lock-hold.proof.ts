/**
 * Static + pure-function proof: the dispatch budget is structurally bounded by
 * the shared pool ceiling, and the in-flight lock/fence documentation matches
 * the current transaction-level implementation. No PG, no model calls, no DNS.
 */
import { readFileSync } from 'node:fs';
import {
  DEFAULT_INTERVIEW_DISPATCH_BUDGET, readInterviewDispatchBudget,
} from '../src/interview-dispatch-fairness.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

const throwsWith = (fn: () => unknown, message: string): boolean => {
  try {
    fn();
    return false;
  } catch (error) {
    return error instanceof Error && error.message === message;
  }
};

type Env = Record<string, string | undefined>;

/** Tuple-based env literal: keeps SCREAMING_SNAKE env keys out of object-literal position (zero new lint warnings). */
const envOf = (entries: ReadonlyArray<readonly [string, string]>): Env => {
  const env: Env = {};
  for (const [name, value] of entries) env[name] = value;
  return env;
};

function main() {
  // A 预算闸：缺省过·显式超池上限具名拒·等界过·既有互检原值·PGPOOL_MAX 整形校验。
  const defaulted = readInterviewDispatchBudget({});
  A('A 缺省预算 1/4 且缺省过闸（4 ≤ 池上限缺省 20）', defaulted.perOwnerInflight === 1 && defaulted.globalInflight === 4);
  const emptyPoolMax = readInterviewDispatchBudget(envOf([['PGPOOL_MAX', '']]));
  A('A PGPOOL_MAX 未设/空串均按缺省 20 过闸', emptyPoolMax.globalInflight === 4);
  A('A globalInflight 显式超池上限具名拒', throwsWith(
    () => readInterviewDispatchBudget(envOf([['WORKER_INTERVIEW_GLOBAL_INFLIGHT', '5'], ['PGPOOL_MAX', '4']])),
    'interview_dispatch_budget_exceeds_pool_max',
  ));
  const atCeiling = readInterviewDispatchBudget(envOf([['WORKER_INTERVIEW_GLOBAL_INFLIGHT', '12'], ['PGPOOL_MAX', '12']]));
  A('A 等界过闸（globalInflight == poolMax）', atCeiling.globalInflight === 12);
  const haShape = readInterviewDispatchBudget(envOf([['PGPOOL_MAX', '12']]));
  A('A compose.ha 形（池上限 12·预算缺省 4）零行为过闸', haShape.globalInflight === 4);
  A('A 既有互检原值（per-owner 大于 global 具名拒）', throwsWith(
    () => readInterviewDispatchBudget(envOf([['WORKER_INTERVIEW_PER_OWNER_INFLIGHT', '8'], ['WORKER_INTERVIEW_GLOBAL_INFLIGHT', '2']])),
    'interview_dispatch_budget_invalid',
  ));
  A('A PGPOOL_MAX 非法整形具名拒（科学计数法）', throwsWith(
    () => readInterviewDispatchBudget(envOf([['PGPOOL_MAX', '1e1']])),
    'PGPOOL_MAX_invalid',
  ));
  A('A PGPOOL_MAX 非法整形具名拒（小数）', throwsWith(
    () => readInterviewDispatchBudget(envOf([['PGPOOL_MAX', '12.0']])),
    'PGPOOL_MAX_invalid',
  ));

  // B 机械钉（锁 pin 回归即红）：事务级 xact 锁在位·session 锁三件零残留。
  const leaseSource = readFileSync(new URL('../../../packages/db/src/interview/interview-graph-lease.ts', import.meta.url), 'utf8');
  A('B 锁 pin：session 锁三件（try_lock/unlock/专用 connect）零残留·事务级锁在位',
    !leaseSource.includes('pg_try_advisory_lock') && !leaseSource.includes('pg_advisory_unlock')
    && !leaseSource.includes('pool.connect(') && leaseSource.includes('pg_advisory_xact_lock'));

  // C 机械钉（注释回归即红）：过时短语零命中·纠偏注释在位。
  const consumerSource = readFileSync(new URL('../src/interview-consumer.ts', import.meta.url), 'utf8');
  A('C 注释钉：过时长持锁短语零命中·纠偏注释在位',
    !consumerSource.includes('覆盖 invoke 全程')
    && consumerSource.includes('仅覆盖 begin 竞态窗')
    && consumerSource.includes('保证源=lease CAS 与 claim 谓词'));

  // D 原值回归：缺省预算字节原值。
  A('D DEFAULT_INTERVIEW_DISPATCH_BUDGET 原值 {1,4}',
    DEFAULT_INTERVIEW_DISPATCH_BUDGET.perOwnerInflight === 1 && DEFAULT_INTERVIEW_DISPATCH_BUDGET.globalInflight === 4);

  console.log(`\n${failures === 0 ? '✓ interview dispatch lock-hold proof passed' : `✗ ${failures} failures`}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
