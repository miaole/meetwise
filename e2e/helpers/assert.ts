/**
 * Shared E2E assertion counter. Fail-closed: the first false condition
 * exits the process. Do not wrap this in try/catch to manufacture a green run.
 */
export type AssertFn = (cond: boolean, msg: string) => void;

export function createAssert(): { A: AssertFn; passed: () => number } {
  let pass = 0;
  const A: AssertFn = (cond, msg) => {
    if (!cond) {
      console.error('✗', msg);
      process.exit(1);
    }
    pass++;
    console.log('✓', msg);
  };
  return { A, passed: () => pass };
}
