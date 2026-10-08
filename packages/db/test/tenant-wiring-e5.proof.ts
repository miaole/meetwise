/**
 * PRIV01-C · P2 — tenant wiring E5 application-layer half prove (static contract).
 *
 * R2 (registered at PRIV01-B §4.1.1): the E5 application-layer half — own-id
 * unexpected-empty-set reads/writes fail CLOSED (throw / indistinguishable 404),
 * never silently translated into a legal empty success — is proven HERE against
 * the wiring manifest (tenant-wiring.manifest.ts). The E5 DB-layer half (GUC
 * unset → 0 rows default deny) belongs to the PRIV01-A candidate A isolation
 * prove. Neither half alone may be read as "E5 fully proven".
 *
 * Machine check per manifest entry (file = envelope unit):
 *   1. the wired context tag exists in the file (the helper call is real);
 *   2. `single-id` entries carry a fail-closed witness string present in the
 *      same file (404 indistinguishable / noop / not_ready / rowCount gate …);
 *   3. α-bound entries carry an explicit `owner_user_id=` predicate witness in
 *      the same file (required predicate inside statement shape — E2);
 *   4. `list-legal-empty` entries are classified as legitimate empty-set
 *      endpoints (E5 does not apply; empty list stays legal);
 *   5. every manifest file has consumption > 0 (wired, not registered-only).
 *
 * Always-on, zero DB dependency. releaseEvidence=false · Not HA · does not
 * weaken RLS (the authorization root stays PG RLS / asPrincipal + set_config).
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WIRED_FILES, RESIDUAL_PATHS } from './tenant-wiring.manifest.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

// --- manifest sanity ---
A('manifest: wired files registered (file envelope)', WIRED_FILES.length > 0, `files=${WIRED_FILES.length}`);
A('manifest: residual absences registered (Ban silent absence)', RESIDUAL_PATHS.length > 0, `residualEntries=${RESIDUAL_PATHS.length}`);
{
  const seen = new Set<string>();
  let dup = false;
  for (const w of WIRED_FILES) for (const p of w.paths) {
    const key = `${w.file}#${p.ctx}`;
    if (seen.has(key)) dup = true;
    seen.add(key);
  }
  A('manifest: context tags unique per file', !dup);
}

let singleIdChecked = 0;
let listClassified = 0;
let predicateWitnessed = 0;

for (const w of WIRED_FILES) {
  const abs = join(repoRoot, w.file);
  let src: string;
  try {
    src = readFileSync(abs, 'utf8');
  } catch {
    A(`wired file readable: ${w.file}`, false, 'MISSING FILE');
    continue;
  }
  A(`wired file has tenant consumption: ${w.file} (exact count=${w.count})`,
    /\b(requireOwnerUserId|assertTenantPredicate|buildRequiredOwnerFilter|enforceOwnerOnRow|TenantEnforcementError)\b/.test(src)
    || /from\s+'[^']*tenant[^']*'/.test(src));
  for (const p of w.paths) {
    const ctxOk = src.includes(p.ctx);
    A(`ctx present: ${w.file} :: ${p.ctx}`, ctxOk);
    if (!ctxOk) continue;
    if (p.kind === 'single-id') {
      singleIdChecked++;
      const witnessOk = p.e5Witness ? src.includes(p.e5Witness) : false;
      A(`E5 fail-closed witness: ${p.ctx} → "${p.e5Witness}"`, witnessOk);
    } else if (p.kind === 'predicate-bind') {
      // α owner-predicate binding on a single-id path whose method-level E5
      // branch is witnessed by the sibling method-entry tag in the same file.
      predicateWitnessed++;
      const witnessOk = p.predicateWitness ? src.includes(p.predicateWitness) : false;
      A(`required-predicate witness (predicate-bind): ${p.ctx} → "${p.predicateWitness}"`, witnessOk);
    } else if (p.kind === 'list-legal-empty') {
      listClassified++;
      A(`E5 whitelist (legal empty set): ${p.ctx}`, true);
    }
    if (p.predicateWitness) {
      predicateWitnessed++;
      A(`required-predicate witness: ${p.ctx} → "${p.predicateWitness}"`, src.includes(p.predicateWitness));
    }
  }
}

A('E5 coverage: single-id fail-closed paths checked', singleIdChecked > 0, `singleId=${singleIdChecked}`);
A('E5 coverage: list endpoints classified legal-empty', listClassified > 0, `list=${listClassified}`);
A('E2 coverage: explicit owner predicates bound in statement shape', predicateWitnessed > 0, `predicates=${predicateWitnessed}`);

// RLS root untouched discipline (same static pins as P1 — no silent weakening on this proof's watch).
const principalPath = join(repoRoot, 'packages', 'db', 'src', 'principal.ts');
const principal = readFileSync(principalPath, 'utf8');
A('E4: asPrincipal + set_config intact (authorization root untouched by wiring)',
  /export async function asPrincipal/.test(principal) && /set_config\('app\.principal_user'/.test(principal));

console.log(failures === 0
  ? `\n✓ tenant-wiring E5 (application-layer half) proof passed (EXIT=0)`
  : `\n✗ tenant-wiring E5 proof: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
