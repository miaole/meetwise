#!/usr/bin/env node
/**
 * Migration numeric-prefix uniqueness gate (#140 fix 2 · MIG-RUNNER 裁决项③
 * 本刀落码·CI-WIRING 只登记接线归属).
 *
 * Migration application order is the four-digit numeric prefix.  Two files
 * claiming one prefix make the effective order depend on the tail of the file
 * name and have historically shipped as silent dual-number migrations.  This
 * gate fails any duplicated numeric prefix unless that exact prefix is
 * explicitly registered in the exemption list below — historical dual numbers
 * stay listed with their registration; new duplicates must NOT be added (claim
 * the next free prefix instead).
 *
 * Self-contained on purpose (no workspace imports, plain node) so CI can run
 * it standalone before any container is up:
 *   node scripts/check-migration-version-uniqueness.mjs [migrations-dir]
 *
 * Exit codes: 0 = unique under registered exemptions; 1 = violation, bad
 * filename shape, or unreadable directory.
 */
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = process.argv[2] !== undefined ? resolve(process.argv[2]) : resolve(repoRoot, 'packages/db/migrations');

/**
 * Registered historical dual-number prefixes (dual numbers tolerated by the
 * per-file-name duplicate check before this gate existed):
 *   0143 — db-intfk rev2 双占（协调方顺延裁定 0147/0148「不改内容只改号」）
 *   0152 — b110 主线双占（「EXEC 时若主线已被占则取最小未占并如实登记」先例 c51c792d）
 *   0160 — I2 B-DELIVERABLE + H3 LEVEL-SCHEME 两刀同号
 * Additions here require a coordination ruling recorded in the delivery docs.
 */
const EXEMPT_DUPLICATE_PREFIXES = new Set(['0143', '0152', '0160']);

let files;
try {
  files = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
} catch (error) {
  console.error(`migration_migrations_dir_unreadable dir=${migrationsDir} error=${String(error)}`);
  process.exit(1);
}

const byPrefix = new Map();
for (const name of files) {
  const prefix = name.match(/^(\d{4})_/)?.[1];
  if (prefix === undefined) {
    console.error(`migration_filename_invalid dir=${migrationsDir} file=${name} expected=<4-digit-prefix>_<name>.sql`);
    process.exit(1);
  }
  if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
  byPrefix.get(prefix).push(name);
}

let violations = 0;
const exemptions = [...EXEMPT_DUPLICATE_PREFIXES].sort();
for (const [prefix, names] of [...byPrefix.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))) {
  if (names.length <= 1) continue;
  if (EXEMPT_DUPLICATE_PREFIXES.has(prefix)) {
    console.log(`migration_prefix_duplicate_exempt prefix=${prefix} files=${names.join(',')}`);
    continue;
  }
  violations += 1;
  console.error(`migration_prefix_duplicate prefix=${prefix} files=${names.join(',')}`);
}
console.log(`migration_prefix_uniqueness dir=${migrationsDir} files=${files.length} violations=${violations} exemptions=${exemptions.join(',')}`);
process.exit(violations === 0 ? 0 : 1);
