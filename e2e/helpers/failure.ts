/**
 * Typed surface for the closed E2E failure classification ledger.
 * Runtime truth lives in `failure-class.mjs` so Node runners can import it
 * without a compile step.
 */
export {
  E2E_FAILURE_CLASSES,
  E2E_FAILURE_LINE_RE,
  E2E_FAILURE_RECORD_SCHEMA,
  classifyE2EFailure,
  emitClassifiedE2EFailure,
  emitE2EFailure,
  formatE2EFailure,
  isE2EFailureClass,
  isOpaqueFailureCode,
  parseE2EFailure,
  parseE2EFailureLine,
  parseE2EFailureRecord,
  tagE2EFailure,
} from './failure-class.mjs';

export type E2EFailureClass =
  | 'api'
  | 'worker'
  | 'db'
  | 'provider'
  | 'capability'
  | 'data_or_permission'
  | 'frontend';

export type E2EFailureRecord = {
  class: E2EFailureClass;
  code: string;
};
