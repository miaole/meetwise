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
 * Exit codes: 0 = unique under registered exemptions, cascade-drop sets
 * match, and the 0229/0230 INVOKER erratum plus format(%s) allowlist hold;
 * 1 = violation, bad filename shape, unreadable directory, unreadable
 * parent text, a cascade-drop set that does not match, or an erratum /
 * allowlist miss.
 *
 * Also (same process, no extra CI step): pin 0229/0230 file checksums so
 * header comments are not "fixed" in place (migrate.ts hashes the entire
 * SQL file, including comments — an in-place edit would migration_drift
 * already-applied ledgers and break PRIMITIVES_CHECKSUM).  CREATE FUNCTION
 * headers in those two files must stay INVOKER (no SECURITY DEFINER).
 * format() templates that contain %s must match the registered allowlist
 * (historical sites including 0229 text interpolations); new %s uses must
 * be registered explicitly.
 *
 * A statement is a cascade drop only when code left after comments, quotes,
 * and dollar quotes contains a DROP word and, later in that same top-level
 * statement, a CASCADE word.  `0145_dead_table_jsonb_deprecate.sql` must hit
 * exactly the two registered sentences, each once.  Any other file already in
 * parent 26d0b35ce88700ea7a1ce1a92a742ca08ddbde0f must keep that parent's hit
 * multiset; a file absent from the parent must have no hit.  Missing parent
 * text fails closed and is not treated as an empty file.
 */
import { createHash } from 'node:crypto';
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

/** sha256 of the exact 0230/0229 file bytes on origin/main (comments included). */
const PRIMITIVES_0230_CHECKSUM = '50b47580229fb51aebdb6c7b15f28ebf534e077d6abd9be295c1ceeb0bf6c14f';
const ADMIN_GRANTS_0229_CHECKSUM = '138059c508cb59af40c598c5f5eb9e551971a8762ccf96183bd3e88650b004ba';
const FILE_0230 = '0230_admin_provision_primitives.sql';
const FILE_0229 = '0229_admin_qbank_owner_grants.sql';

/**
 * Known-wrong header phrases that must remain (erratum).  Editing them in
 * place would change the checksum and break already-applied ledgers.
 */
const ERRATUM_PHRASES = Object.freeze({
  [FILE_0230]: Object.freeze([
    '序号 0000=置于链首',
    '六个 PL/pgSQL SECURITY DEFINER 原语',
    'SECURITY DEFINER 属迁移账户',
  ]),
  [FILE_0229]: Object.freeze([
    '与 0000 同制：SECURITY DEFINER（owner=迁移账户）',
  ]),
});

const EXPECTED_INVOKER_FUNCTIONS = Object.freeze({
  [FILE_0230]: Object.freeze([
    'mw_admin_create_login',
    'mw_admin_grant_role',
    'mw_admin_revoke_role_from',
    'mw_admin_create_nologin_role',
    'mw_admin_grant_schema_public',
    'mw_admin_revoke_direct_memberships',
  ]),
  [FILE_0229]: Object.freeze([
    'mw_admin_alter_table_owner',
    'mw_admin_alter_object_owner',
    'mw_admin_alter_function_owner',
    'mw_admin_alter_view_owner',
    'mw_admin_grant_select_table',
    'mw_admin_grant_exec_fn',
    'mw_admin_revoke_membership_from',
    'mw_admin_revoke_exec_fn',
    'mw_admin_grant_table_priv',
    'mw_admin_revoke_all_table',
    'mw_admin_revoke_col_table',
    'mw_admin_grant_table_privs',
    'mw_admin_grant_select_table_by_name',
    'mw_admin_default_priv_revoke',
    'mw_admin_revoke_exec_all',
  ]),
});

/**
 * Registered format() templates that contain at least one %s (%% is not a
 * specifier).  file+line+template must match exactly; a new %s site, a moved
 * line, or a template edit is a violation until it is deliberately added.
 * 0229 text interpolations are residual risk if those functions were ever
 * switched to SECURITY DEFINER — they stay INVOKER, and callers in
 * principal.ts now allowlist the text arguments.
 */
const REGISTERED_FORMAT_S_SITES = Object.freeze([
  Object.freeze({ file: '0032_rag_corpus_version_control.sql', line: 525, template: "CREATE TABLE IF NOT EXISTS %I (chunk_id text PRIMARY KEY, document_id text NOT NULL, owner_user_id text NOT NULL, visibility text NOT NULL CHECK (visibility IN ('private','global')), content_version integer NOT NULL, embedding vector(%s) NOT NULL)" }),
  Object.freeze({ file: '0073_rag_control_plane_identity_isolation.sql', line: 366, template: 'REVOKE ALL ON FUNCTION %s FROM app_role, rag_control_executor, rag_control_login, rag_runtime_definer, app_gateway_role, privacy_worker_executor' }),
  Object.freeze({ file: '0073_rag_control_plane_identity_isolation.sql', line: 1067, template: "CREATE TABLE IF NOT EXISTS rag_control.%I (chunk_id text PRIMARY KEY,document_id text NOT NULL,owner_user_id text NOT NULL,visibility text NOT NULL CHECK (visibility IN ('private','global')),content_version integer NOT NULL,embedding public.vector(%s) NOT NULL)" }),
  Object.freeze({ file: '0073_rag_control_plane_identity_isolation.sql', line: 1074, template: "CREATE POLICY %I ON %s FOR SELECT TO rag_runtime_definer USING ((visibility='private' AND owner_user_id=current_setting('app.principal_user',true)) OR (visibility='global' AND EXISTS (SELECT 1 FROM public.rag_global_document_provenance p WHERE p.document_id=%s.document_id AND p.content_version=%s.content_version AND p.trust_state='approved')))" }),
  Object.freeze({ file: '0226_identity_introspection_functions.sql', line: 415, template: 'p_%s_control_all' }),
  Object.freeze({ file: '0226_identity_introspection_functions.sql', line: 424, template: 'p_%s_runtime_read' }),
  Object.freeze({ file: '0226_identity_introspection_functions.sql', line: 432, template: 'p_%s_runtime_delete' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 5, template: 'ALTER TABLE %s OWNER TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 10, template: 'ALTER %s %s OWNER TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 15, template: 'ALTER FUNCTION %s OWNER TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 20, template: 'ALTER VIEW %s OWNER TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 25, template: 'GRANT SELECT ON TABLE %s TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 30, template: 'GRANT EXECUTE ON FUNCTION %s TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 40, template: 'REVOKE ALL ON FUNCTION %s FROM %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 45, template: 'GRANT %s ON TABLE %s TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 60, template: 'REVOKE ALL PRIVILEGES ON TABLE %s FROM %s' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 65, template: 'REVOKE ALL PRIVILEGES (%I) ON TABLE %s FROM %s' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 70, template: 'GRANT %s ON TABLE %s TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 79, template: 'GRANT SELECT ON TABLE %s TO %I' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 84, template: 'ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE %s ON %s FROM %s' }),
  Object.freeze({ file: '0229_admin_qbank_owner_grants.sql', line: 89, template: 'REVOKE ALL ON FUNCTION %s FROM %s' }),
]);

function sha256Hex(text) {
  return createHash('sha256').update(text).digest('hex');
}

function countPercentS(template) {
  let count = 0;
  for (let i = 0; i < template.length; i += 1) {
    if (template[i] !== '%') continue;
    const next = template[i + 1];
    if (next === undefined) break;
    if (next === '%') { i += 1; continue; }
    if (next === 's') count += 1;
    i += 1;
  }
  return count;
}

function lineAt(sql, pos) {
  return sql.slice(0, pos).split('\n').length;
}

function parseSqlString(sql, start) {
  // start points at the opening quote; returns { value, end } after the closer.
  const quote = sql[start];
  let i = start + 1;
  let value = '';
  while (i < sql.length) {
    if (sql[i] === quote) {
      if (sql[i + 1] === quote) { value += quote; i += 2; continue; }
      return { value, end: i + 1 };
    }
    value += sql[i];
    i += 1;
  }
  return { value, end: sql.length };
}

function parseDollarQuote(sql, start) {
  const tag = sql.slice(start).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)?.[0];
  if (tag === undefined) return undefined;
  const innerStart = start + tag.length;
  const end = sql.indexOf(tag, innerStart);
  if (end === -1) return { value: sql.slice(innerStart), end: sql.length };
  return { value: sql.slice(innerStart, end), end: end + tag.length };
}

/**
 * Walk migration SQL and collect format() first-argument templates that
 * contain %s.  Line comments, block comments, and ordinary string literals
 * (when not the format argument) are skipped.  Dollar-quoted function bodies
 * are scanned, because that is where the 0229/0230 primitives live.
 */
function extractFormatSSites(sql, file) {
  const sites = [];
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i] ?? '';
    const next = sql[i + 1] ?? '';
    if (ch === '-' && next === '-') {
      i += 2;
      while (i < sql.length && sql[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i + 1 < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i += 1;
      i = Math.min(i + 2, sql.length);
      continue;
    }
    if (ch === "'" || ch === '"') {
      i = parseSqlString(sql, i).end;
      continue;
    }
    const isFormat = sql.slice(i, i + 6).toLowerCase() === 'format'
      && (i === 0 || !/[A-Za-z0-9_]/.test(sql[i - 1] ?? ''));
    if (!isFormat) { i += 1; continue; }
    let j = i + 6;
    while (j < sql.length && /[ \t\n\r]/.test(sql[j] ?? '')) j += 1;
    if (sql[j] !== '(') { i += 1; continue; }
    j += 1;
    while (j < sql.length && /[ \t\n\r]/.test(sql[j] ?? '')) j += 1;
    let template;
    if (sql[j] === "'") {
      const parsed = parseSqlString(sql, j);
      template = parsed.value;
      j = parsed.end;
    } else if (sql[j] === '$') {
      const parsed = parseDollarQuote(sql, j);
      if (parsed !== undefined) {
        template = parsed.value;
        j = parsed.end;
      }
    }
    if (template !== undefined && countPercentS(template) > 0) {
      sites.push({ file, line: lineAt(sql, i), template });
    }
    i = j;
  }
  return sites;
}

function siteKey(site) {
  return `${site.file}:${site.line}:${site.template}`;
}

function createFunctionHeaders(sql) {
  const headers = [];
  const re = /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gi;
  let match = re.exec(sql);
  while (match !== null) {
    const name = match[1];
    const fromArgs = match.index;
    const asMatch = sql.slice(fromArgs).match(/\bAS\s+\$/i);
    if (asMatch && asMatch.index !== undefined) {
      headers.push({ name, header: sql.slice(fromArgs, fromArgs + asMatch.index) });
    }
    match = re.exec(sql);
  }
  return headers;
}

function checkPinnedFile(filesByName, file, expectedChecksum, errors) {
  const sql = filesByName.get(file);
  if (sql === undefined) {
    errors.push(`migration_erratum_file_missing file=${file}`);
    return;
  }
  const digest = sha256Hex(sql);
  if (digest !== expectedChecksum) {
    errors.push(`migration_erratum_checksum_mismatch file=${file} expected=${expectedChecksum} actual=${digest} — do not edit this already-applied migration in place (comments included; migrate.ts would report migration_drift)`);
  }
  for (const phrase of ERRATUM_PHRASES[file] ?? []) {
    if (!sql.includes(phrase)) {
      errors.push(`migration_erratum_phrase_missing file=${file} phrase=${JSON.stringify(phrase)}`);
    }
  }
  const headers = createFunctionHeaders(sql);
  const expected = EXPECTED_INVOKER_FUNCTIONS[file] ?? [];
  const names = headers.map((h) => h.name);
  if (names.join(',') !== expected.join(',')) {
    errors.push(`migration_erratum_function_list_mismatch file=${file} expected=${expected.join(',')} actual=${names.join(',')}`);
  }
  for (const header of headers) {
    if (/\bSECURITY\s+DEFINER\b/i.test(header.header)) {
      errors.push(`migration_erratum_security_definer file=${file} function=${header.name} — 0229/0230 primitives must remain INVOKER; switching to DEFINER needs a new migration and a security review`);
    }
  }
}

function checkFormatSAllowlist(filesByName, errors) {
  const found = [];
  for (const [file, sql] of [...filesByName.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    found.push(...extractFormatSSites(sql, file));
  }
  const expectedKeys = REGISTERED_FORMAT_S_SITES.map(siteKey);
  const foundKeys = found.map(siteKey);
  const expectedSet = new Set(expectedKeys);
  const foundSet = new Set(foundKeys);
  for (const site of found) {
    if (!expectedSet.has(siteKey(site))) {
      errors.push(`migration_format_s_unregistered file=${site.file} line=${site.line} template=${JSON.stringify(site.template)}`);
    }
  }
  for (const site of REGISTERED_FORMAT_S_SITES) {
    if (!foundSet.has(siteKey(site))) {
      errors.push(`migration_format_s_registered_missing file=${site.file} line=${site.line} template=${JSON.stringify(site.template)}`);
    }
  }
  if (foundKeys.length !== expectedKeys.length && errors.length === 0) {
    errors.push(`migration_format_s_count_mismatch expected=${expectedKeys.length} actual=${foundKeys.length}`);
  }
}

function runErratumSelfCheck(filesByName, errors) {
  const sql0230 = filesByName.get(FILE_0230);
  const sql0229 = filesByName.get(FILE_0229);
  if (sql0230 === undefined || sql0229 === undefined) return;

  const prefixFail = [];
  checkPinnedFile(new Map([[FILE_0230, `${sql0230} `]]), FILE_0230, PRIMITIVES_0230_CHECKSUM, prefixFail);
  if (prefixFail.length === 0) errors.push('migration_erratum_selfcheck_checksum_should_fail');

  const commentFail = [];
  checkPinnedFile(new Map([[FILE_0230, sql0230.replaceAll('SECURITY DEFINER', 'SECURITY INVOKER')]]), FILE_0230, PRIMITIVES_0230_CHECKSUM, commentFail);
  if (!commentFail.some((e) => e.startsWith('migration_erratum_checksum_mismatch') || e.startsWith('migration_erratum_phrase_missing'))) {
    errors.push('migration_erratum_selfcheck_comment_edit_should_fail');
  }

  const definerFail = [];
  const definerSql = sql0230.replace('LANGUAGE plpgsql AS $fn$', 'LANGUAGE plpgsql SECURITY DEFINER AS $fn$');
  checkPinnedFile(new Map([[FILE_0230, definerSql]]), FILE_0230, sha256Hex(definerSql), definerFail);
  if (!definerFail.some((e) => e.startsWith('migration_erratum_security_definer'))) {
    errors.push('migration_erratum_selfcheck_definer_should_fail');
  }

  const formatFail = [];
  const injected = new Map(filesByName);
  injected.set(FILE_0230, `${sql0230}\nSELECT format('SELECT %s', $1);\n`);
  checkFormatSAllowlist(injected, formatFail);
  if (!formatFail.some((e) => e.startsWith('migration_format_s_unregistered'))) {
    errors.push('migration_erratum_selfcheck_new_percent_s_should_fail');
  }
}


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

const isRepoMigrationsDir = resolve(migrationsDir) === resolve(repoRoot, 'packages/db/migrations');
let erratumErrors = [];
if (isRepoMigrationsDir) {
  const filesByName = new Map();
  for (const name of files) {
    try {
      filesByName.set(name, readFileSync(join(migrationsDir, name), 'utf8'));
    } catch (error) {
      console.error(`migration_sql_unreadable dir=${migrationsDir} file=${name} error=${String(error)}`);
      process.exit(1);
    }
  }
  checkPinnedFile(filesByName, FILE_0230, PRIMITIVES_0230_CHECKSUM, erratumErrors);
  checkPinnedFile(filesByName, FILE_0229, ADMIN_GRANTS_0229_CHECKSUM, erratumErrors);
  checkFormatSAllowlist(filesByName, erratumErrors);
  runErratumSelfCheck(filesByName, erratumErrors);
  for (const error of erratumErrors) console.error(error);
  console.log(`migration_definer_erratum dir=${migrationsDir} violations=${erratumErrors.length} format_s_sites=${REGISTERED_FORMAT_S_SITES.length}`);
} else {
  console.log(`migration_definer_erratum skipped dir=${migrationsDir} (fixture or non-repo migrations dir)`);
}
process.exit(violations === 0 && cascadeViolations === 0 && erratumErrors.length === 0 ? 0 : 1);
