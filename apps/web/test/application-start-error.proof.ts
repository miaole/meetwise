/**
 * Offline proof: application-start 409 subclass is embedded in the thrown/log message.
 *   pnpm -C apps/web prove:application-start-error
 */
import {
  APPLICATION_START_CONFLICT_SUBCLASSES,
  applicationStartFailureMessage,
  extractApplicationStartConflictSubclass,
} from '../lib/jobs/application-start-error.ts';

let failures = 0;
const A = (n: string, c: boolean, d = '') => {
  console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? ' :: ' + d : ''}`);
  if (!c) failures++;
};

A(
  'extract resume_not_ready',
  extractApplicationStartConflictSubclass({ error: 'resume_not_ready' }) === 'resume_not_ready',
);
A(
  'extract application_binding_invalid',
  extractApplicationStartConflictSubclass({ error: 'application_binding_invalid' }) ===
    'application_binding_invalid',
);
A(
  'extract interview_ineligible_route',
  extractApplicationStartConflictSubclass({ error: 'interview_ineligible_route' }) ===
    'interview_ineligible_route',
);
A(
  'extract application_start_unexpected',
  extractApplicationStartConflictSubclass({ error: 'application_start_unexpected' }) ===
    'application_start_unexpected',
);
A('missing error → undefined', extractApplicationStartConflictSubclass({}) === undefined);
A('non-object → undefined', extractApplicationStartConflictSubclass(null) === undefined);
A('blank error → undefined', extractApplicationStartConflictSubclass({ error: '  ' }) === undefined);

A(
  'message includes subclass after colon',
  applicationStartFailureMessage(409, { error: 'resume_not_ready' }) ===
    'application_start_failed_409:resume_not_ready',
);
A(
  'message without subclass stays status-only',
  applicationStartFailureMessage(409, {}) === 'application_start_failed_409',
);
A(
  'non-409 still carries subclass when present',
  applicationStartFailureMessage(500, { error: 'application_start_unexpected' }) ===
    'application_start_failed_500:application_start_unexpected',
);

A(
  'known conflict subclasses pinned',
  APPLICATION_START_CONFLICT_SUBCLASSES.includes('resume_not_ready') &&
    APPLICATION_START_CONFLICT_SUBCLASSES.includes('interview_ineligible_route'),
);

if (failures) {
  console.error(`\nFAIL ${failures}`);
  process.exit(1);
}
console.log('\nOK application-start-error (409 subclass surfacing)');
