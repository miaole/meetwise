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
 * Exit codes: 0 = unique under registered exemptions and cascade-drop sets
 * match; 1 = violation, bad filename shape, unreadable directory, unreadable
 * parent text, or a cascade-drop set that does not match.
 *
 * A statement is a cascade drop only when code left after comments, quotes,
 * and dollar quotes contains a DROP word and, later in that same top-level
 * statement, a CASCADE word.  `0145_dead_table_jsonb_deprecate.sql` must hit
 * exactly the two registered sentences, each once.  Any other file already in
 * parent 26d0b35ce88700ea7a1ce1a92a742ca08ddbde0f must keep that parent's hit
 * multiset; a file absent from the parent must have no hit.  Missing parent
 * text fails closed and is not treated as an empty file.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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

const PARENT_COMMIT = '26d0b35ce88700ea7a1ce1a92a742ca08ddbde0f';
const PARENT_MIGRATIONS_PREFIX = 'packages/db/migrations/';
const REGISTERED_CASCADE_FILE = '0145_dead_table_jsonb_deprecate.sql';
const REGISTERED_CASCADE_HITS = [
  'DROP TABLE IF EXISTS app_setting CASCADE',
  'DROP TABLE IF EXISTS consumption_record CASCADE',
];

function splitTopLevelStatements(sql) {
  const statements = [];
  let statement = '';
  for (let i = 0; i < sql.length;) {
    const ch = sql[i] ?? '';
    const next = sql[i + 1] ?? '';
    if (ch === '-' && next === '-') {
      i += 2;
      while (i < sql.length && sql[i] !== '\n') i++;
      statement += ' ';
      continue;
    }
    if (ch === '/' && next === '*') {
      let depth = 1;
      i += 2;
      while (i < sql.length && depth > 0) {
        if (sql[i] === '/' && sql[i + 1] === '*') { depth++; i += 2; }
        else if (sql[i] === '*' && sql[i + 1] === '/') { depth--; i += 2; }
        else i++;
      }
      statement += ' ';
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      statement += ' ';
      i++;
      while (i < sql.length) {
        if (sql[i] === quote) {
          if (sql[i + 1] === quote) { i += 2; continue; }
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (ch === '$') {
      const tag = sql.slice(i).match(/^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/)?.[0];
      if (tag) {
        statement += ' ';
        i += tag.length;
        const end = sql.indexOf(tag, i);
        i = end === -1 ? sql.length : end + tag.length;
        continue;
      }
    }
    if (ch === ';') {
      statements.push(statement);
      statement = '';
      i++;
      continue;
    }
    statement += ch;
    i++;
  }
  statements.push(statement);
  return statements;
}

function normalizeStatement(statement) {
  let text = statement.trim();
  if (text.endsWith(';')) text = text.slice(0, -1).trim();
  return text;
}

function isCascadeDrop(text) {
  const matcher = /\b(DROP|CASCADE)\b/gi;
  let seenDrop = false;
  let match = matcher.exec(text);
  while (match !== null) {
    if (match[1].toUpperCase() === 'DROP') seenDrop = true;
    else if (seenDrop) return true;
    match = matcher.exec(text);
  }
  return false;
}

function cascadeDropHits(sql) {
  const hits = [];
  for (const statement of splitTopLevelStatements(sql)) {
    const text = normalizeStatement(statement);
    if (text !== '' && isCascadeDrop(text)) hits.push(text);
  }
  return hits;
}

function sameHitMultiset(left, right) {
  if (left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function gitText(args) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 8 * 1024 * 1024,
  });
}

function loadParentMigrationNames() {
  let listing;
  try {
    gitText(['cat-file', '-e', `${PARENT_COMMIT}^{commit}`]);
    listing = gitText(['ls-tree', '-r', '--name-only', PARENT_COMMIT, 'packages/db/migrations']);
  } catch (error) {
    console.error(`migration_parent_unreadable parent=${PARENT_COMMIT} error=${String(error)}`);
    process.exit(1);
  }
  const names = new Set();
  for (const path of listing.split('\n')) {
    if (!path.startsWith(PARENT_MIGRATIONS_PREFIX) || !path.endsWith('.sql')) continue;
    const name = path.slice(PARENT_MIGRATIONS_PREFIX.length);
    if (name.length === 0 || name.includes('/')) continue;
    names.add(name);
  }
  return names;
}

function readParentMigration(name) {
  try {
    return gitText(['show', `${PARENT_COMMIT}:${PARENT_MIGRATIONS_PREFIX}${name}`]);
  } catch (error) {
    console.error(`migration_parent_sql_unreadable parent=${PARENT_COMMIT} file=${name} error=${String(error)}`);
    process.exit(1);
  }
}

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

let cascadeViolations = 0;
const parentNames = loadParentMigrationNames();
for (const name of files) {
  let sql;
  try {
    sql = readFileSync(join(migrationsDir, name), 'utf8');
  } catch (error) {
    console.error(`migration_sql_unreadable dir=${migrationsDir} file=${name} error=${String(error)}`);
    process.exit(1);
  }
  const hits = cascadeDropHits(sql);
  if (name === REGISTERED_CASCADE_FILE) {
    if (!sameHitMultiset(hits, REGISTERED_CASCADE_HITS)) {
      cascadeViolations += 1;
      console.error(`migration_cascade_drop_registered_mismatch file=${name} hits=${hits.map((hit) => JSON.stringify(hit)).join(',')}`);
    }
    continue;
  }
  if (parentNames.has(name)) {
    const parentHits = cascadeDropHits(readParentMigration(name));
    if (!sameHitMultiset(hits, parentHits)) {
      cascadeViolations += 1;
      console.error(`migration_cascade_drop_parent_mismatch file=${name} hits=${hits.length} parent_hits=${parentHits.length}`);
    }
    continue;
  }
  if (hits.length !== 0) {
    cascadeViolations += 1;
    console.error(`migration_cascade_drop_unregistered file=${name} hits=${hits.map((hit) => JSON.stringify(hit)).join(',')}`);
  }
}
console.log(`migration_cascade_drop dir=${migrationsDir} files=${files.length} violations=${cascadeViolations}`);
process.exit(violations === 0 && cascadeViolations === 0 ? 0 : 1);
