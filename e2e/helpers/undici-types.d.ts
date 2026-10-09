/**
 * Ambient undici-types surface for the e2e tsc gate (TSCGATE-2 batch B2).
 *
 * undici-types@8.3.0 lives only under .pnpm (no top-level hoist), so the
 * `import('undici-types')` references inside @types/node stay unresolved and
 * the global fetch-family type names never reach this program (`lib:
 * ["ES2022"]` carries no DOM lib). These ambient declarations hand-shape
 * exactly the two names the e2e suite needs, mirroring the real undici-types
 * union members. Deliberately no `any`: a permissive escape would compile
 * green while silently disabling checks (receipt-pinned stance).
 */

/** Verbatim mirror of undici-types `RequestInfo` (keeps proof.ts fetch
 *  wrapper parameter contravariance intact). */
type RequestInfo = string | URL | Request;

/** Union mirror of undici-types `HeadersInit` — no `any` shaping. The record
 *  value is widened to `string | readonly string[] | undefined` for the e2e
 *  helpers' header-record building: the real undici `HeaderRecord` maps
 *  KnownHeaderValues to optional `string | undefined` values, so the plain
 *  record member only bridges it with `undefined` admitted (test surface,
 *  non-claim — harness 适度放宽 license). */
type HeadersInit = Headers | [string, string][] | Record<string, string | readonly string[] | undefined>;
