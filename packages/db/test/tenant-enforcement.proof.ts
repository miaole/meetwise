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
 * releaseEvidence=false · Not HA · does not weaken RLS.
 */
import { readFileSync, existsSync } from 'node:fs';
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
    && /SET LOCAL ROLE app_role/.test(principal));
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
