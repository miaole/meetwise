/**
 * GODFN-1b static gate — production builds carry ZERO g7-bootstrap import.
 *
 * Design anchor: ai-docs/delivery/harness/godfn-decompose.md §2.2 证明
 * ("新增断言：生产构建零 g7-bootstrap import（静态扫描门）").
 *
 * Asserts, over the whole production source tree
 * (apps/api/src, apps/worker/src, packages package-src dirs — comments stripped):
 *   P1  zero `g7-bootstrap` module specifier anywhere in production src
 *       (the pre-1b unconditional side-effect entry is test-support-only now);
 *   P2  zero `g7-outbound-interceptor` module specifier in production src
 *       (the interceptor moved to packages/ai-runtime/test/support/);
 *   P3  zero `isG7FreetierReproveEnabled(process.env)` direct-read call text
 *       in production src (the 4 pre-1b scattered reads at
 *       model-client.ts:220/:347/:376 + context-budget.ts:281 converged into
 *       the composition-root injection seam g7-runtime-injection.ts);
 *   P4  `installG7OutboundInterceptor(` appears in zero production src files
 *       (assembly responsibility lives at the composition roots);
 *   P5  the gated '@meetwise/ai-runtime/g7-test-support' subpath is reached
 *       by dynamic import ONLY, in exactly the two composition roots
 *       (apps/api/src/main.ts, apps/worker/src/main.ts);
 *   P6  the runtime src index no longer re-exports the interceptor.
 *
 *   pnpm prove:g7-bootstrap-zero-prod-import
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

let failures = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
  if (!ok) failures += 1;
};

const runtimeRoot = fileURLToPath(new URL('../../..', import.meta.url));

/** Production source faces (test/, smoke/, scripts runners are NOT production). */
const PROD_ROOTS = [
  'apps/api/src',
  'apps/worker/src',
  'packages/ai-runtime/src',
  'packages/contracts/src',
  'packages/domain/src',
  'packages/db/src',
];

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) out.push(...listTsFiles(full));
    else if ((entry.endsWith('.ts') || entry.endsWith('.tsx')) && !entry.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/** Strip block + line comments (string-literal-aware enough for import scanning). */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  const n = src.length;
  let mode: 'code' | 'line' | 'block' | 'str' | 'tpl' = 'code';
  let strCh = '';
  while (i < n) {
    const ch = src[i]!;
    const next = src[i + 1];
    if (mode === 'code') {
      if (ch === '/' && next === '/') { mode = 'line'; i += 2; continue; }
      if (ch === '/' && next === '*') { mode = 'block'; i += 2; continue; }
      if (ch === '\'' || ch === '"') { mode = 'str'; strCh = ch; out += ch; i += 1; continue; }
      if (ch === '`') { mode = 'tpl'; out += ch; i += 1; continue; }
      out += ch; i += 1; continue;
    }
    if (mode === 'line') { if (ch === '\n') { mode = 'code'; out += ch; } i += 1; continue; }
    if (mode === 'block') { if (ch === '*' && next === '/') { mode = 'code'; i += 2; } else i += 1; continue; }
    if (mode === 'str') {
      if (ch === '\\') { i += 2; continue; }
      if (ch === strCh) { mode = 'code'; }
      out += ch; i += 1; continue;
    }
    // template literal — keep content (specifiers may live there) but track end
    if (ch === '\\') { out += ch + (next ?? ''); i += 2; continue; }
    if (ch === '`') { mode = 'code'; }
    out += ch; i += 1; continue;
  }
  return out;
}

const prodFiles = PROD_ROOTS.flatMap((rel) => listTsFiles(join(runtimeRoot, rel))).sort();
// Sanity: the walk must have found the real production tree (Ban vacuous pass).
A('P0 production walk found the source tree', prodFiles.length >= 200, `files=${prodFiles.length}`);
const stripped = new Map<string, string>();
for (const f of prodFiles) stripped.set(f, stripComments(readFileSync(f, 'utf8')));

const rel = (f: string): string => f.slice(runtimeRoot.length);
const COMPOSITION_ROOTS = ['apps/api/src/main.ts', 'apps/worker/src/main.ts'];
const filesWith = (needle: string, exclude: string[] = []): string[] =>
  prodFiles.filter((f) => stripped.get(f)!.includes(needle)).map(rel).filter((f) => !exclude.includes(f));

// P1 — zero g7-bootstrap specifier in production src (comments stripped).
A('P1 production src zero g7-bootstrap specifier', filesWith('g7-bootstrap').length === 0,
  filesWith('g7-bootstrap').join(','));
// P2 — zero g7-outbound-interceptor specifier in production src.
A('P2 production src zero g7-outbound-interceptor specifier', filesWith('g7-outbound-interceptor').length === 0,
  filesWith('g7-outbound-interceptor').join(','));
// P3 — zero direct-read call text in production src OUTSIDE the composition
// roots (the 4 pre-1b scattered reads converged; the roots' single read is
// pinned to exactly one occurrence each by P7/P8).
A('P3 runtime/production src zero isG7FreetierReproveEnabled(process.env) direct read',
  filesWith('isG7FreetierReproveEnabled(process.env)', COMPOSITION_ROOTS).length === 0,
  filesWith('isG7FreetierReproveEnabled(process.env)', COMPOSITION_ROOTS).join(','));
// P4 — zero interceptor assembly in production src outside the composition roots.
A('P4 runtime/production src zero installG7OutboundInterceptor call',
  filesWith('installG7OutboundInterceptor(', COMPOSITION_ROOTS).length === 0,
  filesWith('installG7OutboundInterceptor(', COMPOSITION_ROOTS).join(','));
// P5 — g7-test-support reached ONLY via dynamic import, exactly at the two composition roots.
const tsSupportFiles = filesWith('@meetwise/ai-runtime/g7-test-support');
const staticSupport = tsSupportFiles.filter((f) => {
  const code = stripped.get(join(runtimeRoot, f))!;
  return new RegExp(`(from\\s*['"]@meetwise/ai-runtime/g7-test-support['"])|(import\\s+['"]@meetwise/ai-runtime/g7-test-support['"])`).test(code);
});
const dynamicSupport = tsSupportFiles.filter((f) => stripped.get(join(runtimeRoot, f))!.includes("await import('@meetwise/ai-runtime/g7-test-support')"));
A('P5a g7-test-support never statically imported', staticSupport.length === 0, staticSupport.join(','));
A('P5b g7-test-support dynamic import only in api+worker mains',
  dynamicSupport.length === 2
  && dynamicSupport.includes('apps/api/src/main.ts')
  && dynamicSupport.includes('apps/worker/src/main.ts'),
  dynamicSupport.join(','));
// P6 — runtime src index no longer re-exports the interceptor.
const indexSrc = stripped.get(join(runtimeRoot, 'packages/ai-runtime/src/index.ts')) ?? '';
A('P6 ai-runtime src index has no interceptor re-export',
  !indexSrc.includes("from './g7-outbound-interceptor.ts'"));
// Composition roots still hold the single read point (injection assembled).
const apiMain = stripped.get(join(runtimeRoot, 'apps/api/src/main.ts')) ?? '';
const workerMain = stripped.get(join(runtimeRoot, 'apps/worker/src/main.ts')) ?? '';
A('P7 api main keeps exactly one G7 single-read point',
  (apiMain.match(/isG7FreetierReproveEnabled\(process\.env\)/g) ?? []).length === 1
    && apiMain.includes('configureG7RuntimeInjection('));
A('P8 worker main keeps exactly one G7 single-read point',
  (workerMain.match(/isG7FreetierReproveEnabled\(process\.env\)/g) ?? []).length === 1
    && workerMain.includes('configureG7RuntimeInjection('));

console.log(failures === 0 ? '\nOK g7-bootstrap-zero-prod-import (static gate)' : `\nFAIL ${failures}`);
process.exit(failures === 0 ? 0 : 1);
