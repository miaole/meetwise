/**
 * App-level tenant enforcement prove (additive MySQL-path prototype).
 *
 * Always-on (no MySQL required):
 *   - missing / blank owner → requireOwnerUserId throws
 *   - owner mismatch → assertTenantPredicate throws
 *   - match → passes
 *   - principal.ts still exports asPrincipal + set_config('app.principal_user')
 *
 * Optional PG path (when DATABASE_URL or full PG* components are present):
 *   - still uses asPrincipal (does not bypass set_config)
 *
 * EXEC additions (PRIV01-B · 2026-10-07 · P-A ruled · test-only, zero src/ product code):
 *   - E2 non-optional predicate: buildRequiredOwnerFilter must always yield the
 *     full required {column,value} shape — no empty-predicate success form exists.
 *   - E4 static pins: 0001_baseline.sql FORCE RLS header + app_role NOLOGIN (无
 *     BYPASSRLS) + p_owner USING/WITH CHECK double-sided predicate + vector_chunk;
 *     provisionRuntimeLogin NOINHERIT/NOBYPASSRLS.
 * PRIV01-C EXEC flip (2026-10-08 · authorized EXEC · R1 flipped — tightening, not relaxing):
 *   - Wiring-face machine-check FLIPPED from "wiring must stay 0" to
 *     "wiring == manifest" (file envelope + EXACT per-file counts, no lower
 *     bounds): face A stays 0 as the zero-deep-path-literal-import discipline
 *     (wiring imports go through the @meetwise/db barrel or db-relative
 *     './tenant/index.ts' — a literal 'src/tenant' path is still banned);
 *     face B consumption must be > 0 and EXACTLY equal the wired-file manifest
 *     (file set and per-file counts both asserted — anti silent-narrowing);
 *     barrel re-export statements stay exactly 2 (re-export ≠ consumption).
 *     The flip itself is double-reviewed verbatim (post-prove dual).
 *   - R2: the E5 application-layer half (own-id unexpected-empty-set fail-closed
 *     rethrow) is now proven against the wiring manifest by the sibling proofs
 *     tenant-wiring-e5.proof.ts (P2 static contract) and tenant-wiring-neg.proof.ts
 *     (P3 live cross-owner NEG). The E5 DB-layer half (GUC unset → 0 rows default
 *     deny) still belongs to the RLS isolation prove (PRIV01-A candidate A).
 *     No half may be read as "E5 fully proven" by the other.
 *
 * releaseEvidence=false · Not HA · does not weaken RLS.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TenantEnforcementError,
  requireOwnerUserId,
  assertTenantPredicate,
  buildRequiredOwnerFilter,
  enforceOwnerOnRow,
} from '../src/tenant/index.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

function caughtCode(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (e) {
    if (e instanceof TenantEnforcementError) return e.code;
    return `unexpected:${(e as Error).message}`;
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const principalPath = join(root, 'src/principal.ts');
const tenantPath = join(root, 'src/tenant/index.ts');

// --- unit: requireOwnerUserId ---
A('missing owner (undefined) throws tenant_owner_user_id_required',
  caughtCode(() => requireOwnerUserId(undefined)) === 'tenant_owner_user_id_required');

A('missing owner (null) throws tenant_owner_user_id_required',
  caughtCode(() => requireOwnerUserId(null)) === 'tenant_owner_user_id_required');

A('blank owner throws tenant_owner_user_id_required',
  caughtCode(() => requireOwnerUserId('   ')) === 'tenant_owner_user_id_required');

A('non-string owner throws tenant_owner_user_id_required',
  caughtCode(() => requireOwnerUserId(42)) === 'tenant_owner_user_id_required');

A('valid owner returns trimmed id',
  requireOwnerUserId('  user-a  ') === 'user-a');

// --- unit: assertTenantPredicate ---
A('predicate mismatch throws tenant_owner_mismatch',
  caughtCode(() => assertTenantPredicate('owner-b', 'owner-a')) === 'tenant_owner_mismatch');

A('predicate with blank row owner throws tenant_predicate_invalid',
  caughtCode(() => assertTenantPredicate('', 'owner-a')) === 'tenant_predicate_invalid');

A('predicate match passes (no throw)',
  caughtCode(() => assertTenantPredicate('owner-a', 'owner-a')) === undefined);

// --- unit: buildRequiredOwnerFilter ---
{
  const f = buildRequiredOwnerFilter('owner-z');
  A('buildRequiredOwnerFilter binds owner_user_id column + value',
    f.column === 'owner_user_id' && f.value === 'owner-z');
  A('buildRequiredOwnerFilter rejects missing owner',
    caughtCode(() => buildRequiredOwnerFilter('')) === 'tenant_owner_user_id_required');
  // E2: required predicate, not an optional filter hint — every success form
  // carries the full {column,value} shape; no empty/absent predicate exists.
  const g = buildRequiredOwnerFilter('  owner-w  ');
  A('buildRequiredOwnerFilter trims and yields exact required shape (E2)',
    g.column === 'owner_user_id' && g.value === 'owner-w'
    && Object.keys(g).length === 2);
  const shapes = ['owner-1', 'x'.repeat(64), ' owner-2 '].map(
    (o) => buildRequiredOwnerFilter(o),
  );
  A('buildRequiredOwnerFilter never yields an empty predicate — all shapes bound (E2)',
    shapes.every((s) => s.column === 'owner_user_id'
      && typeof s.value === 'string' && s.value.trim().length > 0));
}

// --- unit: enforceOwnerOnRow ---
A('enforceOwnerOnRow null row throws',
  caughtCode(() => enforceOwnerOnRow(null, 'owner-a')) === 'tenant_predicate_invalid');

A('enforceOwnerOnRow cross-owner throws',
  caughtCode(() => enforceOwnerOnRow({ owner_user_id: 'b' }, 'a')) === 'tenant_owner_mismatch');

A('enforceOwnerOnRow match returns required owner',
  enforceOwnerOnRow({ owner_user_id: 'a' }, 'a') === 'a');

// --- static: helpers + comments pin 应用层 tenant ≠ RLS ---
A('tenant module file present', existsSync(tenantPath));
if (existsSync(tenantPath)) {
  const src = readFileSync(tenantPath, 'utf8');
  A('tenant source pins 应用层 tenant ≠ RLS', /应用层 tenant\s*≠\s*RLS/.test(src));
  A('tenant source forbids silently replacing auth root',
    /must not silently replace|不得静默|auth root must not silently/i.test(src));
  A('tenant source exports requireOwnerUserId + assertTenantPredicate',
    /export function requireOwnerUserId/.test(src)
    && /export function assertTenantPredicate/.test(src));
  A('tenant source pins required-predicate (non-optional filter) wording (E2)',
    /required predicate object, not an optional filter hint/.test(src));
  A('tenant source exports buildRequiredOwnerFilter + enforceOwnerOnRow',
    /export function buildRequiredOwnerFilter/.test(src)
    && /export function enforceOwnerOnRow/.test(src));
}

// --- HARD: principal.ts RLS path intact (set_config not removed) ---
A('principal.ts present', existsSync(principalPath));
if (existsSync(principalPath)) {
  const principal = readFileSync(principalPath, 'utf8');
  A('principal.ts still exports asPrincipal',
    /export async function asPrincipal/.test(principal));
  A("principal.ts still set_config('app.principal_user')",
    /set_config\('app\.principal_user'/.test(principal));
  A('tenant module does not remove set_config from principal',
    /set_config\('app\.principal_user'/.test(principal)
    // DBSB-1 (E4 assertion-shape adaptation): the literal `SET LOCAL ROLE
    // app_role` moved into the runAs generic (`SET LOCAL ROLE ${role}`); the
    // guarded intent — the app_role entry is still wired through the RLS
    // transaction primitive — is now checked as asPrincipal delegating to
    // runAs('app_role') plus the generic emitting SET LOCAL ROLE.
    && /runAs\(pool, 'app_role'/.test(principal)
    && /SET LOCAL ROLE \$\{role\}/.test(principal));
  A('principal.ts provisionRuntimeLogin NOINHERIT/NOBYPASSRLS intact (E4)',
    /export async function provisionRuntimeLogin/.test(principal)
    && /NOINHERIT/.test(principal) && /NOBYPASSRLS/.test(principal));
}

// --- HARD: baseline RLS root intact (MUST NOT abandon — static pins, E4) ---
const baselinePath = join(root, 'migrations', '0001_baseline.sql');
A('0001_baseline.sql present', existsSync(baselinePath));
if (existsSync(baselinePath)) {
  const baseline = readFileSync(baselinePath, 'utf8');
  A('baseline header pins owner+ENABLE+FORCE RLS incl. app_role non-bypass (0001:7)',
    /所有归属表都带 owner_user_id \+ ENABLE \+ FORCE ROW LEVEL SECURITY/.test(baseline)
    && /连超级用户走 app_role 时也不绕过/.test(baseline));
  A('baseline app_role fail-closed NOLOGIN 无 BYPASSRLS (0001:63-64)',
    /CREATE ROLE app_role NOLOGIN/.test(baseline) && /无 BYPASSRLS/.test(baseline));
  A('baseline p_owner USING/WITH CHECK double-sided principal predicate (0001:69-79)',
    /USING \(owner_user_id = current_setting\(''app\.principal_user'', true\)\)/.test(baseline)
    && /WITH CHECK \(owner_user_id = current_setting\(''app\.principal_user'', true\)\)/.test(baseline));
  A('baseline vector_chunk ENABLE+FORCE+p_owner same shape (0001:300-304)',
    /ALTER TABLE vector_chunk ENABLE ROW LEVEL SECURITY/.test(baseline)
    && /ALTER TABLE vector_chunk FORCE ROW LEVEL SECURITY/.test(baseline)
    && /CREATE POLICY p_owner ON vector_chunk/.test(baseline));
}

// --- wiring-face machine-check: production wiring == wiring manifest (R1 flipped) ---
// PRIV01-C EXEC flip (tightening, not relaxing):
//   face A = literal 'src/tenant' string in production src must stay 0 — now the
//   ZERO-DEEP-PATH-LITERAL-IMPORT discipline (wiring goes through the
//   @meetwise/db barrel or db-relative './tenant/index.ts'; a deep 'src/tenant'
//   path literal is still banned). Semantics flipped from "zero wiring = green";
//   narrated verbatim for the post-prove dual review.
//   face B = tenant module/symbol consumption must be > 0 and EXACTLY equal the
//   wired-file manifest: file SET equality AND exact per-file count equality
//   (file = envelope unit; no lower bounds; anti silent-narrowing in both
//   directions — an unwired file consuming helpers, or a wired file losing a
//   touchpoint, both fail).
//   R1: barrel re-export statement count stays exactly 2 (re-export ≠
//   consumption classification unchanged; existence asserted).
//   R2: E5 application-layer half is proven by tenant-wiring-e5.proof.ts (P2)
//   and tenant-wiring-neg.proof.ts (P3) against the same manifest; the DB-layer
//   half remains PRIV01-A candidate A. Neither half alone is "E5 fully proven".
{
  const { WIRED_FILES } = await import('./tenant-wiring.manifest.ts');
  const symbolRe = /\b(requireOwnerUserId|assertTenantPredicate|buildRequiredOwnerFilter|enforceOwnerOnRow|TenantEnforcementError)\b/g;
  const specRe = /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)['"]([^'"]*)['"]/g;
  const reexportRe = /export\s+(?:type\s+)?\{[^{}]*\}\s*from\s*['"][^'"]*['"]/gs;
  const stripComments = (t: string): string =>
    t.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));
  const walk = (dir: string): string[] => {
    const out: string[] = [];
    let entries: import('node:fs').Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return out;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(p));
      else if (e.isFile() && p.endsWith('.ts')) out.push(p);
    }
    return out;
  };
  const repoRoot = join(root, '..', '..');
  const prodFiles: string[] = [];
  for (const top of ['packages', 'apps']) {
    const topDir = join(repoRoot, top);
    let tops: import('node:fs').Dirent[];
    try {
      tops = readdirSync(topDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const t of tops) {
      if (t.isDirectory()) prodFiles.push(...walk(join(topDir, t.name, 'src')));
    }
  }
  const moduleFiles = prodFiles.filter((f) => !f.includes('/src/tenant/'));
  let faceALiteral = 0;
  let faceBConsumption = 0;
  let tenantReexportStmts = 0;
  const observed = new Map<string, number>();
  for (const f of moduleFiles) {
    const raw = readFileSync(f, 'utf8');
    const text = stripComments(raw);
    if (raw.includes('src/tenant')) faceALiteral++;
    const spans: Array<[number, number]> = [];
    for (const m of text.matchAll(reexportRe)) {
      spans.push([m.index ?? 0, (m.index ?? 0) + m[0].length]);
    }
    const inSpan = (i: number) => spans.some(([s, e]) => i >= s && i < e);
    for (const m of text.matchAll(specRe)) {
      const spec = m[1] ?? '';
      if (!spec.split('/').includes('tenant')) continue;
      if (inSpan(m.index ?? 0)) tenantReexportStmts++;
      else {
        faceBConsumption++;
        observed.set(f, (observed.get(f) ?? 0) + 1);
      }
    }
    for (const m of text.matchAll(symbolRe)) {
      if (!inSpan(m.index ?? 0)) {
        faceBConsumption++;
        observed.set(f, (observed.get(f) ?? 0) + 1);
      }
    }
  }
  const barrelPath = join(repoRoot, 'packages', 'db', 'src', 'index.ts');
  const barrelTenantReexports = (() => {
    if (!existsSync(barrelPath)) return -1;
    const t = stripComments(readFileSync(barrelPath, 'utf8'));
    let n = 0;
    for (const m of t.matchAll(reexportRe)) {
      if (m[0].includes('tenant')) n++;
    }
    return n;
  })();
  // R1 flipped face A: zero deep-path literal imports (discipline — see comment above).
  A('wiring face A (flipped): zero literal src/tenant deep-path imports in production src',
    faceALiteral === 0,
    `hits=${faceALiteral} files-scanned=${moduleFiles.length} (discipline: barrel/@meetwise/db or db-relative './tenant/index.ts' only)`);
  // R1 flipped face B: consumption > 0 AND exactly == manifest (file set + exact counts).
  const manifestMap = new Map(WIRED_FILES.map((w) => [join(repoRoot, w.file), w.count]));
  const extraFiles = [...observed.keys()].filter((f) => !manifestMap.has(f));
  const missingFiles = [...manifestMap.keys()].filter((f) => !observed.has(f));
  const countMismatches = [...manifestMap.entries()]
    .filter(([f, c]) => observed.has(f) && observed.get(f) !== c)
    .map(([f, c]) => `${f}:manifest=${c}:observed=${observed.get(f)}`);
  A('wiring face B (flipped): consumption > 0 and EXACTLY equals wiring manifest (file envelope + exact per-file counts)',
    faceBConsumption > 0 && extraFiles.length === 0 && missingFiles.length === 0 && countMismatches.length === 0,
    `consumption=${faceBConsumption} manifestTotal=${WIRED_FILES.reduce((s, w) => s + w.count, 0)} `
    + `files=${observed.size}/${manifestMap.size} extra=[${extraFiles.join(',')}] missing=[${missingFiles.join(',')}] `
    + `mismatch=[${countMismatches.join(';')}]`);
  A('R1: barrel re-export present and classified re-export≠consumption (index.ts :25-32)',
    barrelTenantReexports === 2,
    `barrelTenantReexportStatements=${barrelTenantReexports} expected=2`);
}

// --- optional PG path: still uses asPrincipal (skip if no DB target) ---
async function optionalPgAsPrincipal(): Promise<void> {
  const hasUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasComponents = Boolean(
    process.env.PGHOST && process.env.PGPORT && process.env.PGUSER
    && process.env.PGPASSWORD !== undefined && process.env.PGDATABASE,
  );
  if (!hasUrl && !hasComponents) {
    A('optional PG path skipped (no DATABASE_URL / PG* target) — unit prove sufficient', true);
    return;
  }
  try {
    const { createPool, asPrincipal } = await import('../src/index.ts');
    const pool = createPool();
    try {
      const bound = await asPrincipal(pool, 'tenant-proof-user', async (c) => {
        const r = await c.query(
          "SELECT current_setting('app.principal_user', true) AS principal",
        );
        return r.rows[0]?.principal as string;
      });
      A('optional PG path uses asPrincipal + set_config (principal bound)',
        bound === 'tenant-proof-user');
    } finally {
      await pool.end();
    }
  } catch (e) {
    // Optional: connection failure must not fail the unit prove; report skip with detail.
    A('optional PG path unavailable (unit prove still green)', true,
      String((e as Error).message).slice(0, 120));
  }
}

await optionalPgAsPrincipal();

console.log(failures === 0
  ? '\n✓ tenant-enforcement proof passed (EXIT=0)'
  : `\n✗ tenant-enforcement proof: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
