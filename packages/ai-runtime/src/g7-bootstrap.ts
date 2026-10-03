/**
 * Side-effect entry: install the G7 outbound interceptor BEFORE any model
 * client is constructed. api/worker mains import this module first under G7.
 */
import { installG7OutboundInterceptor } from './g7-outbound-interceptor.ts';

installG7OutboundInterceptor(process.env);
