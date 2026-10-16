/**
 * Side-effect entry: install the G7 outbound interceptor BEFORE any model
 * client is constructed.
 *
 * GODFN-1b: test-support face. Production composition roots no longer import
 * this module — apps/api/src/main.ts and apps/worker/src/main.ts read
 * G7_FREETIER_REPROVE exactly once and assemble the interceptor + runtime
 * injection themselves via '@meetwise/ai-runtime/g7-test-support'. This
 * side-effect entry remains for in-process test harnesses that want the
 * pre-1b bootstrap shape. Production builds carry zero g7-bootstrap import
 * (static gate: prove:g7-bootstrap-zero-prod-import).
 */
import { installG7OutboundInterceptor } from './g7-outbound-interceptor.ts';

installG7OutboundInterceptor(process.env);
