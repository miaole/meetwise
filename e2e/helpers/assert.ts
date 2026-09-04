/**
 * Shared E2E assertion counter. Fail-closed: the first false condition
 * exits the process. Do not wrap this in try/catch to manufacture a green run.
 * A failed assertion emits a closed-class ledger line before the prose message.
 */
import { emitE2EFailure, type E2EFailureClass } from './failure.ts';

export type AssertFn = (cond: boolean, msg: string, failureClass?: E2EFailureClass) => void;

export function createAssert(defaultClass: E2EFailureClass = 'api'): { A: AssertFn; passed: () => number } {
  let pass = 0;
  const A: AssertFn = (cond, msg, failureClass) => {
    if (!cond) {
      emitE2EFailure({ class: failureClass ?? defaultClass, code: 'assertion' });
      console.error('✗', msg);
      process.exit(1);
    }
    pass++;
    console.log('✓', msg);
  };
  return { A, passed: () => pass };
}
