/**
 * G7 test-support barrel (GODFN-1b). The outbound interceptor lives on the
 * test-support face; production builds must never import it — the pre-1b
 * `src/index.ts` export line migrated here and the composition roots reach it
 * through the gated '@meetwise/ai-runtime/g7-test-support' subpath only.
 */
export {
  g7OutboundAllowDepth,
  withG7OutboundAllow,
  installG7OutboundInterceptor,
  uninstallG7OutboundInterceptor,
  g7OutboundSpy,
  resetG7OutboundSpyCounters,
  isG7OutboundInterceptorInstalled,
} from './g7-outbound-interceptor.ts';
