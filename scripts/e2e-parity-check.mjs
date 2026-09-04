/**
 * Static e2e / critical-prove test+assertion parity.
 *
 * Reads only versioned files. Does not execute E2E, read secrets, or write
 * the baseline. releaseEvidence is always false.
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BASELINE_PATH = 'ai-docs/testing/e2e-parity-baseline.json';
export const ALLOWLIST_PATH = 'ai-docs/testing/e2e-parity-allowlist.json';
export const CRITICAL_PROVE_SCRIPTS = Object.freeze([
  'scripts/local-e2e-receipt.proof.mjs',
  'scripts/bounded-command.proof.mjs',
]);
export const DIGEST_ONLY_FILES = Object.freeze(['e2e/helpers/assert.ts']);
export const EXTRA_ASSERTION_FILES = Object.freeze(['e2e/helpers/interview.ts']);
export const BINDING_SNIPPETS = Object.freeze({
  'e2e/full.e2e.ts': Object.freeze([{ kind: 'binding', label: 'assert: A', needle: 'assert: A' }]),
});
export const PARITY_SOURCE_PREFIXES = Object.freeze(['e2e/', 'scripts/']);
export const PARITY_SOURCE_EXTENSIONS = Object.freeze(['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs']);
export const ASSERT_WRAPPERS = Object.freeze(['A', 'assert', 'expect', 'expectCode', 'rejects']);
export const ASSERT_METHODS = Object.freeze([
  'equal', 'notEqual', 'deepEqual', 'notDeepEqual', 'strictEqual', 'notStrictEqual',
  'ok', 'match', 'doesNotMatch', 'throws', 'doesNotThrow', 'rejects', 'doesNotReject',
  'fail', 'ifError',
]);
export const TEST_CALLEES = Object.freeze(['test', 'it']);

const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const ALLOWLIST_ID_PATTERN = /^E2E-PARITY-\d{8}-[a-z0-9-]{3,64}$/;
const BANNED_REASON = /^(todo|tbd|n\/a|na|update|fix|allow|ok|yes|temp|temporary|placeholder)\b/i;
const MAX_FILES = 64;
const MAX_FILE_BYTES = 512_000;
const MAX_DEPTH = 8;
const MAX_ALLOWLIST = 256;
const BASELINE_KEYS = Object.freeze(['schemaVersion', 'releaseEvidence', 'scope', 'files']);
const FILE_KEYS = Object.freeze(['testCount', 'assertionCount', 'tests', 'assertions']);
const IDENTITY_KEYS = Object.freeze(['kind', 'label', 'conditionDigest']);
const ALLOWLIST_DOC_KEYS = Object.freeze(['schemaVersion', 'releaseEvidence', 'entries']);
const ALLOWLIST_ENTRY_KEYS = Object.freeze([
  'id', 'path', 'reason', 'removedTests', 'removedAssertions', 'removedFile',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function posixRel(repoRoot, absolutePath) {
  return relative(repoRoot, absolutePath).split(sep).join('/');
}

function sha256Text(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

function normalizeExpr(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function identityKey(item) {
  return `${item.kind}\n${item.label}\n${item.conditionDigest}`;
}

function sortedIdentities(items) {
  return [...items].sort((a, b) => identityKey(a).localeCompare(identityKey(b)));
}

function hasExactKeys(object, allowed) {
  const keys = Object.keys(object);
  return keys.length === allowed.length && keys.every((key) => allowed.includes(key));
}

function isIdentStart(char) {
  return /[A-Za-z_]/.test(char);
}

function isIdentPart(char) {
  return /[A-Za-z0-9_]/.test(char);
}

function skipWs(source, index) {
  let i = index;
  while (i < source.length && /\s/.test(source[i])) i += 1;
  return i;
}

export function stripCommentsPreservingStrings(source) {
  let out = '';
  let i = 0;
  const n = source.length;
  const readString = (quote) => {
    let chunk = quote;
    i += 1;
    while (i < n) {
      const char = source[i];
      if (char === '\\') {
        chunk += char + (source[i + 1] ?? '');
        i += 2;
        continue;
      }
      chunk += char;
      i += 1;
      if (char === quote) break;
    }
    return chunk;
  };
  const readTemplate = () => {
    let chunk = '`';
    i += 1;
    while (i < n) {
      const char = source[i];
      if (char === '\\') {
        chunk += char + (source[i + 1] ?? '');
        i += 2;
        continue;
      }
      if (char === '$' && source[i + 1] === '{') {
        chunk += '${';
        i += 2;
        let depth = 1;
        while (i < n && depth > 0) {
          const inner = source[i];
          if (inner === '"' || inner === "'") {
            const saved = i;
            const quoted = readString(inner);
            chunk += quoted;
            if (i === saved + 1 && quoted.length === 1) i += 1;
            continue;
          }
          if (inner === '`') {
            chunk += readTemplate();
            continue;
          }
          if (inner === '{') depth += 1;
          if (inner === '}') depth -= 1;
          chunk += inner;
          i += 1;
        }
        continue;
      }
      chunk += char;
      i += 1;
      if (char === '`') break;
    }
    return chunk;
  };
  while (i < n) {
    const char = source[i];
    const next = source[i + 1];
    if (char === '/' && next === '/') {
      i += 2;
      while (i < n && source[i] !== '\n') i += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      i += 2;
      while (i < n && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      out += ' ';
      continue;
    }
    if (char === '"' || char === "'") {
      out += readString(char);
      continue;
    }
    if (char === '`') {
      out += readTemplate();
      continue;
    }
    out += char;
    i += 1;
  }
  return out;
}

function readIdent(source, start) {
  let end = start;
  if (!isIdentStart(source[end] ?? '')) return null;
  end += 1;
  while (end < source.length && isIdentPart(source[end])) end += 1;
  return { name: source.slice(start, end), end };
}

function extractQuoted(raw) {
  const text = raw.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  if (text.startsWith('`') && text.endsWith('`')) return text.slice(1, -1);
  return null;
}

function splitArgs(argSource) {
  const args = [];
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;
  let start = 0;
  let i = 0;
  const n = argSource.length;
  const skipString = (quote) => {
    i += 1;
    while (i < n) {
      if (argSource[i] === '\\') {
        i += 2;
        continue;
      }
      if (argSource[i] === quote) {
        i += 1;
        return;
      }
      i += 1;
    }
  };
  const skipTemplate = () => {
    i += 1;
    while (i < n) {
      if (argSource[i] === '\\') {
        i += 2;
        continue;
      }
      if (argSource[i] === '$' && argSource[i + 1] === '{') {
        i += 2;
        let depth = 1;
        while (i < n && depth > 0) {
          if (argSource[i] === '"' || argSource[i] === "'") {
            skipString(argSource[i]);
            continue;
          }
          if (argSource[i] === '`') {
            skipTemplate();
            continue;
          }
          if (argSource[i] === '{') depth += 1;
          if (argSource[i] === '}') depth -= 1;
          i += 1;
        }
        continue;
      }
      if (argSource[i] === '`') {
        i += 1;
        return;
      }
      i += 1;
    }
  };
  while (i < n) {
    const char = argSource[i];
    if (char === '"' || char === "'") {
      skipString(char);
      continue;
    }
    if (char === '`') {
      skipTemplate();
      continue;
    }
    if (char === '(') depthParen += 1;
    if (char === ')') depthParen -= 1;
    if (char === '{') depthBrace += 1;
    if (char === '}') depthBrace -= 1;
    if (char === '[') depthBracket += 1;
    if (char === ']') depthBracket -= 1;
    if (char === ',' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
      args.push(argSource.slice(start, i).trim());
      start = i + 1;
    }
    i += 1;
  }
  const last = argSource.slice(start).trim();
  if (last || args.length) args.push(last);
  return args.filter((item, index, all) => item.length > 0 || index < all.length - 1);
}

function skipStringOrTemplate(source, start) {
  const quote = source[start];
  let i = start + 1;
  const n = source.length;
  if (quote === '"' || quote === "'") {
    while (i < n) {
      if (source[i] === '\\') {
        i += 2;
        continue;
      }
      if (source[i] === quote) return i + 1;
      i += 1;
    }
    return n;
  }
  if (quote !== '`') return start + 1;
  while (i < n) {
    if (source[i] === '\\') {
      i += 2;
      continue;
    }
    if (source[i] === '$' && source[i + 1] === '{') {
      i += 2;
      let depth = 1;
      while (i < n && depth > 0) {
        if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
          i = skipStringOrTemplate(source, i);
          continue;
        }
        if (source[i] === '{') depth += 1;
        if (source[i] === '}') depth -= 1;
        i += 1;
      }
      continue;
    }
    if (source[i] === '`') return i + 1;
    i += 1;
  }
  return n;
}

function matchingParen(source, openIndex) {
  let depth = 0;
  let i = openIndex;
  const n = source.length;
  while (i < n) {
    const char = source[i];
    if (char === '"' || char === "'") {
      i += 1;
      while (i < n) {
        if (source[i] === '\\') {
          i += 2;
          continue;
        }
        if (source[i] === char) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (char === '`') {
      i += 1;
      while (i < n) {
        if (source[i] === '\\') {
          i += 2;
          continue;
        }
        if (source[i] === '$' && source[i + 1] === '{') {
          i += 2;
          let inner = 1;
          while (i < n && inner > 0) {
            if (source[i] === '"' || source[i] === "'") {
              const q = source[i];
              i += 1;
              while (i < n) {
                if (source[i] === '\\') {
                  i += 2;
                  continue;
                }
                if (source[i] === q) {
                  i += 1;
                  break;
                }
                i += 1;
              }
              continue;
            }
            if (source[i] === '{') inner += 1;
            if (source[i] === '}') inner -= 1;
            i += 1;
          }
          continue;
        }
        if (source[i] === '`') {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }
    if (char === '(') depth += 1;
    if (char === ')') {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

function previousNonWs(source, index) {
  let i = index - 1;
  while (i >= 0 && /\s/.test(source[i])) i -= 1;
  return i;
}

function isCallSite(source, identStart, afterName) {
  const prev = previousNonWs(source, identStart);
  if (prev >= 7 && source.slice(prev - 7, prev + 1) === 'function') return false;
  if (prev >= 0 && source[prev] === '$') return false;
  if (prev >= 0 && source[prev] === '.' && source.slice(identStart, afterName) !== 'assert') return false;
  let i = skipWs(source, afterName);
  if (source[i] === '=' && source[i + 1] !== '=') return false;
  return true;
}

function canStartRegex(source, index) {
  const prev = previousNonWs(source, index);
  if (prev < 0) return true;
  const char = source[prev];
  if ('([,=:!&|?{~+*%^<>;\n'.includes(char)) return true;
  if (isIdentPart(char)) {
    let start = prev;
    while (start > 0 && isIdentPart(source[start - 1])) start -= 1;
    return ['return', 'case', 'throw', 'typeof', 'void', 'delete', 'await', 'new', 'in', 'of'].includes(source.slice(start, prev + 1));
  }
  return false;
}

function skipRegexLiteral(source, start) {
  let i = start + 1;
  const n = source.length;
  let inClass = false;
  while (i < n) {
    const char = source[i];
    if (char === '\\') {
      i += 2;
      continue;
    }
    if (char === '[') inClass = true;
    else if (char === ']' && inClass) inClass = false;
    else if (char === '/' && !inClass) {
      i += 1;
      while (i < n && /[a-z]/i.test(source[i])) i += 1;
      return i;
    }
    else if (char === '\n') return i;
    i += 1;
  }
  return n;
}

function toIdentity(kind, args, { labelFromFirst = false } = {}) {
  const cleaned = args.map((item) => item.trim()).filter(Boolean);
  let label = '';
  let exprParts = cleaned;
  if (labelFromFirst && cleaned[0]) {
    label = extractQuoted(cleaned[0]) ?? '';
    exprParts = cleaned.slice(1);
  } else if (cleaned.length) {
    const quoted = extractQuoted(cleaned[cleaned.length - 1]);
    if (quoted !== null) {
      label = quoted;
      exprParts = cleaned.slice(0, -1);
    }
  }
  return {
    kind,
    label,
    conditionDigest: sha256Text(normalizeExpr(exprParts.join(' , '))),
  };
}

export function extractParityCalls(source) {
  const code = stripCommentsPreservingStrings(source);
  const tests = [];
  const assertions = [];
  let i = 0;
  while (i < code.length) {
    const char = code[i];
    if (char === '"' || char === "'" || char === '`') {
      i = skipStringOrTemplate(code, i);
      continue;
    }
    if (char === '/' && canStartRegex(code, i)) {
      i = skipRegexLiteral(code, i);
      continue;
    }
    if (!isIdentStart(char)) {
      i += 1;
      continue;
    }
    const ident = readIdent(code, i);
    if (!ident) {
      i += 1;
      continue;
    }
    if (!isCallSite(code, i, ident.end)) {
      i = ident.end;
      continue;
    }
    let cursor = skipWs(code, ident.end);
    let kind = ident.name;
    if (code[cursor] === '.') {
      const methodIdent = readIdent(code, skipWs(code, cursor + 1));
      if (!methodIdent || ident.name !== 'assert' || !ASSERT_METHODS.includes(methodIdent.name)) {
        i = ident.end;
        continue;
      }
      kind = `assert.${methodIdent.name}`;
      cursor = skipWs(code, methodIdent.end);
    } else if (!ASSERT_WRAPPERS.includes(ident.name) && !TEST_CALLEES.includes(ident.name)) {
      i = ident.end;
      continue;
    }
    if (code[cursor] !== '(') {
      i = ident.end;
      continue;
    }
    const close = matchingParen(code, cursor);
    if (close < 0) {
      i = ident.end;
      continue;
    }
    const args = splitArgs(code.slice(cursor + 1, close));
    if (kind === 'assert' && previousNonWs(code, i) >= 0 && code[previousNonWs(code, i)] === '.') {
      kind = 'member.assert';
    }
    let trail = '';
    let after = close + 1;
    if (kind === 'expect') {
      let probe = skipWs(code, after);
      while (code[probe] === '.') {
        const method = readIdent(code, skipWs(code, probe + 1));
        if (!method) break;
        const open = skipWs(code, method.end);
        if (code[open] !== '(') break;
        const trailClose = matchingParen(code, open);
        if (trailClose < 0) break;
        trail += `.${method.name}(${code.slice(open + 1, trailClose)})`;
        after = trailClose + 1;
        probe = skipWs(code, after);
      }
    }
    const identity = TEST_CALLEES.includes(kind)
      ? toIdentity(kind, args, { labelFromFirst: true })
      : toIdentity(kind, trail ? [...args, trail] : args);
    if (TEST_CALLEES.includes(kind)) {
      tests.push(identity);
      i = cursor + 1;
    } else {
      assertions.push(identity);
      i = after;
    }
  }
  if (tests.length === 0 && assertions.length > 0) {
    tests.push({
      kind: 'implicit-suite',
      label: '',
      conditionDigest: sha256Text('implicit-suite'),
    });
  }
  return { tests, assertions };
}

function addError(errors, code, detail) {
  errors.push(`${code}:${detail}`);
}

function pathAllowed(repoRoot, candidate) {
  if (!nonEmptyString(candidate) || isAbsolute(candidate) || candidate.includes('\0') || candidate.includes('://')) {
    return { ok: false, error: `path_invalid:${candidate}` };
  }
  if (candidate.split('/').includes('..')) return { ok: false, error: `path_escape:${candidate}` };
  const resolved = resolve(repoRoot, candidate);
  if (!existsSync(resolved)) return { ok: false, error: `path_missing:${candidate}` };
  let stat;
  try { stat = lstatSync(resolved); }
  catch { return { ok: false, error: `path_unreadable:${candidate}` }; }
  if (stat.isSymbolicLink()) return { ok: false, error: `symlink_forbidden:${candidate}` };
  if (!stat.isFile()) return { ok: false, error: `path_not_file:${candidate}` };
  if (stat.size > MAX_FILE_BYTES) return { ok: false, error: `file_too_large:${candidate}` };
  let realRoot;
  let realCandidate;
  try {
    realRoot = realpathSync(repoRoot);
    realCandidate = realpathSync(resolved);
  } catch {
    return { ok: false, error: `path_unreadable:${candidate}` };
  }
  const rel = relative(realRoot, realCandidate);
  if (rel === '' || rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) {
    return { ok: false, error: `path_escape:${candidate}` };
  }
  const normalized = rel.split(sep).join('/');
  if (!PARITY_SOURCE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return { ok: false, error: `path_prefix_forbidden:${candidate}` };
  }
  if (!PARITY_SOURCE_EXTENSIONS.includes(extname(normalized))) {
    return { ok: false, error: `path_extension_forbidden:${candidate}` };
  }
  return { ok: true, absolute: realCandidate, relative: normalized };
}

function isParityE2eFile(relativePath) {
  return /(?:^|\/)e2e\/.+\.(?:e2e|proof|spec)\.ts$/.test(relativePath);
}

function walkE2eFiles(repoRoot, errors) {
  const files = [];
  const e2eRoot = resolve(repoRoot, 'e2e');
  if (!existsSync(e2eRoot)) {
    errors.push('source_empty:e2e');
    return files;
  }
  let rootStat;
  try { rootStat = lstatSync(e2eRoot); }
  catch {
    errors.push('source_unreadable:e2e');
    return files;
  }
  if (rootStat.isSymbolicLink()) {
    errors.push('symlink_forbidden:e2e');
    return files;
  }
  const visit = (absolutePath, depth) => {
    if (depth > MAX_DEPTH) {
      errors.push(`source_depth_exceeded:${posixRel(repoRoot, absolutePath)}`);
      return;
    }
    let stat;
    try { stat = lstatSync(absolutePath); }
    catch {
      errors.push(`source_unreadable:${posixRel(repoRoot, absolutePath)}`);
      return;
    }
    if (stat.isSymbolicLink()) {
      errors.push(`symlink_forbidden:${posixRel(repoRoot, absolutePath)}`);
      return;
    }
    if (stat.isDirectory()) {
      let entries;
      try { entries = readdirSync(absolutePath); }
      catch {
        errors.push(`source_unreadable:${posixRel(repoRoot, absolutePath)}`);
        return;
      }
      for (const entry of entries.sort()) visit(resolve(absolutePath, entry), depth + 1);
      return;
    }
    if (!stat.isFile()) return;
    const relativePath = posixRel(repoRoot, absolutePath);
    if (!isParityE2eFile(relativePath)) return;
    if (files.length >= MAX_FILES) {
      errors.push('file_limit:e2e');
      return;
    }
    const allowed = pathAllowed(repoRoot, relativePath);
    if (!allowed.ok) {
      errors.push(allowed.error);
      return;
    }
    files.push(relativePath);
  };
  visit(e2eRoot, 0);
  return files;
}

export function listParityFiles(repoRoot, options = {}) {
  const errors = [];
  const files = new Set();
  if (options.includeE2e !== false) {
    for (const file of walkE2eFiles(repoRoot, errors)) files.add(file);
  }
  const critical = options.criticalProveScripts ?? CRITICAL_PROVE_SCRIPTS;
  for (const script of critical) {
    const allowed = pathAllowed(repoRoot, script);
    if (!allowed.ok) errors.push(allowed.error);
    else files.add(allowed.relative);
  }
  if (options.includeHelpers !== false) {
    for (const extra of [...DIGEST_ONLY_FILES, ...EXTRA_ASSERTION_FILES]) {
      const allowed = pathAllowed(repoRoot, extra);
      if (!allowed.ok) errors.push(allowed.error);
      else files.add(allowed.relative);
    }
  }
  return { files: [...files].sort(), errors: [...new Set(errors)].sort() };
}

export function scanParitySources(repoRoot, options = {}) {
  const listed = listParityFiles(repoRoot, options);
  const files = {};
  const errors = [...listed.errors];
  if (!listed.files.length && !errors.length) errors.push('source_empty:parity_roots');
  for (const relativePath of listed.files) {
    const allowed = pathAllowed(repoRoot, relativePath);
    if (!allowed.ok) {
      errors.push(allowed.error);
      continue;
    }
    let source;
    try { source = readFileSync(allowed.absolute, 'utf8'); }
    catch {
      errors.push(`source_unreadable:${relativePath}`);
      continue;
    }
    const extracted = DIGEST_ONLY_FILES.includes(relativePath)
      ? { tests: [], assertions: [{ kind: 'source-digest', label: relativePath, conditionDigest: sha256Text(source) }] }
      : extractParityCalls(source);
    const bindings = (BINDING_SNIPPETS[relativePath] ?? [])
      .filter((item) => source.includes(item.needle))
      .map((item) => ({ kind: item.kind, label: item.label, conditionDigest: sha256Text(item.needle) }));
    const tests = sortedIdentities(extracted.tests);
    const assertions = sortedIdentities([...extracted.assertions, ...bindings]);
    files[relativePath] = {
      testCount: tests.length,
      assertionCount: assertions.length,
      tests,
      assertions,
    };
  }
  return { files, errors: [...new Set(errors)].sort() };
}

function validateIdentity(item, errors, where) {
  if (!isPlainObject(item) || !hasExactKeys(item, IDENTITY_KEYS)) {
    addError(errors, 'identity_fields_invalid', where);
    return false;
  }
  if (!nonEmptyString(item.kind)) addError(errors, 'identity_kind_invalid', where);
  if (typeof item.label !== 'string') addError(errors, 'identity_label_invalid', where);
  if (!SHA256_PATTERN.test(item.conditionDigest ?? '')) addError(errors, 'identity_digest_invalid', where);
  return true;
}

function bagKeys(items) {
  const bag = new Map();
  for (const item of items) {
    const key = identityKey(item);
    bag.set(key, (bag.get(key) ?? 0) + 1);
  }
  return bag;
}

function identityByKey(items) {
  const map = new Map();
  for (const item of items) map.set(identityKey(item), item);
  return map;
}

function validateSnapshotShape(snapshot, path, errors) {
  if (!isPlainObject(snapshot) || !hasExactKeys(snapshot, FILE_KEYS)) {
    addError(errors, 'baseline_file_fields_invalid', path);
    return;
  }
  if (!Array.isArray(snapshot.tests) || !Array.isArray(snapshot.assertions)) {
    addError(errors, 'baseline_file_arrays_invalid', path);
    return;
  }
  if (snapshot.testCount !== snapshot.tests.length) addError(errors, 'baseline_test_count_mismatch', path);
  if (snapshot.assertionCount !== snapshot.assertions.length) addError(errors, 'baseline_assertion_count_mismatch', path);
  snapshot.tests.forEach((item, index) => validateIdentity(item, errors, `${path}:tests:${index}`));
  snapshot.assertions.forEach((item, index) => validateIdentity(item, errors, `${path}:assertions:${index}`));
}

export function validateParityDocuments(baseline, allowlist, { scan, previousBaseline } = {}) {
  const errors = [];
  if (!isPlainObject(baseline) || !hasExactKeys(baseline, BASELINE_KEYS)) addError(errors, 'baseline_fields_invalid', 'top_level');
  if (baseline?.schemaVersion !== 1) addError(errors, 'baseline_schema_invalid', String(baseline?.schemaVersion));
  if (baseline?.releaseEvidence !== false) addError(errors, 'release_evidence_claimed', 'baseline');
  if (!isPlainObject(baseline?.files)) addError(errors, 'baseline_files_invalid', 'files');
  if (!isPlainObject(allowlist) || !hasExactKeys(allowlist, ALLOWLIST_DOC_KEYS)) addError(errors, 'allowlist_fields_invalid', 'top_level');
  if (allowlist?.schemaVersion !== 1) addError(errors, 'allowlist_schema_invalid', String(allowlist?.schemaVersion));
  if (allowlist?.releaseEvidence !== false) addError(errors, 'release_evidence_claimed', 'allowlist');
  if (!Array.isArray(allowlist?.entries)) addError(errors, 'allowlist_entries_invalid', 'entries');
  if ((allowlist?.entries?.length ?? 0) > MAX_ALLOWLIST) addError(errors, 'allowlist_limit', String(allowlist.entries.length));
  if (errors.length) return { valid: false, errors: [...new Set(errors)].sort(), stats: {} };

  const baselinePaths = Object.keys(baseline.files).sort();
  if (!baselinePaths.length) addError(errors, 'baseline_empty', 'files');
  for (const path of baselinePaths) {
    if (!PARITY_SOURCE_PREFIXES.some((prefix) => path.startsWith(prefix)) || path.includes('..') || isAbsolute(path)) {
      addError(errors, 'baseline_path_invalid', path);
    }
    validateSnapshotShape(baseline.files[path], path, errors);
  }

  const ids = new Set();
  const removedByPath = new Map();
  const removedFiles = new Set();
  for (const [index, entry] of (allowlist.entries ?? []).entries()) {
    const where = `entries:${index}`;
    if (!isPlainObject(entry) || !hasExactKeys(entry, ALLOWLIST_ENTRY_KEYS)) {
      addError(errors, 'allowlist_entry_fields_invalid', where);
      continue;
    }
    if (!ALLOWLIST_ID_PATTERN.test(entry.id)) addError(errors, 'allowlist_id_invalid', entry.id);
    if (ids.has(entry.id)) addError(errors, 'allowlist_id_duplicate', entry.id);
    ids.add(entry.id);
    if (!nonEmptyString(entry.path) || !baseline.files[entry.path]) addError(errors, 'allowlist_path_unknown', `${entry.id}:${entry.path}`);
    if (typeof entry.reason !== 'string' || entry.reason.trim().length < 24 || !entry.reason.includes(' ') || BANNED_REASON.test(entry.reason.trim())) {
      addError(errors, 'allowlist_reason_invalid', entry.id);
    }
    if (typeof entry.removedFile !== 'boolean') addError(errors, 'allowlist_removed_file_invalid', entry.id);
    if (!Array.isArray(entry.removedTests) || !Array.isArray(entry.removedAssertions)) {
      addError(errors, 'allowlist_removed_arrays_invalid', entry.id);
      continue;
    }
    if (entry.removedFile && (entry.removedTests.length || entry.removedAssertions.length)) {
      addError(errors, 'allowlist_removed_file_conflict', entry.id);
    }
    const snapshot = baseline.files[entry.path];
    const knownTests = snapshot ? bagKeys(snapshot.tests) : new Map();
    const knownAssertions = snapshot ? bagKeys(snapshot.assertions) : new Map();
    const bucket = removedByPath.get(entry.path) ?? { tests: new Map(), assertions: new Map() };
    if (entry.removedFile) removedFiles.add(entry.path);
    for (const [itemIndex, item] of entry.removedTests.entries()) {
      if (!validateIdentity(item, errors, `${entry.id}:removedTests:${itemIndex}`)) continue;
      const key = identityKey(item);
      if (!knownTests.has(key)) addError(errors, 'allowlist_unknown_test', `${entry.id}:${key.split('\n')[0]}`);
      bucket.tests.set(key, (bucket.tests.get(key) ?? 0) + 1);
    }
    for (const [itemIndex, item] of entry.removedAssertions.entries()) {
      if (!validateIdentity(item, errors, `${entry.id}:removedAssertions:${itemIndex}`)) continue;
      const key = identityKey(item);
      if (!knownAssertions.has(key)) addError(errors, 'allowlist_unknown_assertion', `${entry.id}:${item.label || item.kind}`);
      bucket.assertions.set(key, (bucket.assertions.get(key) ?? 0) + 1);
    }
    removedByPath.set(entry.path, bucket);
  }

  const inventory = scan ?? { files: {}, errors: [] };
  for (const scanError of inventory.errors ?? []) addError(errors, 'scan_invalid', scanError);

  const scannedPaths = new Set(Object.keys(inventory.files ?? {}));
  for (const path of baselinePaths) {
    if (!scannedPaths.has(path) && !removedFiles.has(path)) addError(errors, 'file_missing', path);
  }
  for (const path of [...scannedPaths].sort()) {
    if (!baseline.files[path]) addError(errors, 'file_untracked', path);
  }

  for (const path of baselinePaths) {
    const snapshot = baseline.files[path];
    const current = inventory.files?.[path];
    const removed = removedByPath.get(path) ?? { tests: new Map(), assertions: new Map() };
    if (removedFiles.has(path)) {
      if (current) addError(errors, 'allowlist_still_present', `${path}:file`);
      continue;
    }
    if (!current) continue;
    const currentTests = bagKeys(current.tests);
    const currentAssertions = bagKeys(current.assertions);
    const baselineTests = bagKeys(snapshot.tests);
    const baselineAssertions = bagKeys(snapshot.assertions);
    for (const [key, count] of removed.tests) {
      if ((currentTests.get(key) ?? 0) > 0) addError(errors, 'allowlist_still_present', `${path}:test:${key.split('\n')[1] || key.split('\n')[0]}`);
      if ((baselineTests.get(key) ?? 0) < count) addError(errors, 'allowlist_unknown_test', `${path}:${key.split('\n')[0]}`);
    }
    for (const [key, count] of removed.assertions) {
      if ((currentAssertions.get(key) ?? 0) > 0) addError(errors, 'allowlist_still_present', `${path}:assertion:${key.split('\n')[1] || key.split('\n')[0]}`);
      if ((baselineAssertions.get(key) ?? 0) < count) addError(errors, 'allowlist_unknown_assertion', `${path}:${key.split('\n')[1] || key.split('\n')[0]}`);
    }
    const expectedTests = new Map(baselineTests);
    const expectedAssertions = new Map(baselineAssertions);
    for (const [key, count] of removed.tests) expectedTests.set(key, (expectedTests.get(key) ?? 0) - count);
    for (const [key, count] of removed.assertions) expectedAssertions.set(key, (expectedAssertions.get(key) ?? 0) - count);
    const baselineByTest = identityByKey(snapshot.tests);
    const baselineByAssertion = identityByKey(snapshot.assertions);
    const currentByTest = identityByKey(current.tests);
    const currentByAssertion = identityByKey(current.assertions);
    for (const [key, count] of expectedTests) {
      if (count < 0) addError(errors, 'allowlist_unknown_test', path);
      else if ((currentTests.get(key) ?? 0) < count) {
        const item = baselineByTest.get(key);
        addError(errors, 'test_removed', `${path}:${item?.label || item?.kind || 'unknown'}`);
      }
    }
    for (const [key, count] of expectedAssertions) {
      if (count < 0) addError(errors, 'allowlist_unknown_assertion', path);
      else if ((currentAssertions.get(key) ?? 0) < count) {
        const item = baselineByAssertion.get(key);
        addError(errors, 'assertion_removed', `${path}:${item?.label || item?.kind || 'unknown'}`);
      }
    }
    for (const [key, count] of currentTests) {
      if ((expectedTests.get(key) ?? 0) < count) {
        const item = currentByTest.get(key);
        addError(errors, 'test_untracked', `${path}:${item?.label || item?.kind || 'unknown'}`);
      }
    }
    for (const [key, count] of currentAssertions) {
      if ((expectedAssertions.get(key) ?? 0) < count) {
        const item = currentByAssertion.get(key);
        addError(errors, 'assertion_untracked', `${path}:${item?.label || item?.kind || 'unknown'}`);
      }
    }
  }

  if (previousBaseline && isPlainObject(previousBaseline.files)) {
    for (const path of Object.keys(previousBaseline.files).sort()) {
      const previous = previousBaseline.files[path];
      const currentFrozen = baseline.files[path];
      if (!currentFrozen) {
        if (!removedFiles.has(path)) addError(errors, 'baseline_file_dropped', path);
        continue;
      }
      const previousTests = bagKeys(previous.tests ?? []);
      const previousAssertions = bagKeys(previous.assertions ?? []);
      const currentTests = bagKeys(currentFrozen.tests ?? []);
      const currentAssertions = bagKeys(currentFrozen.assertions ?? []);
      const removed = removedByPath.get(path) ?? { tests: new Map(), assertions: new Map() };
      for (const [key, count] of previousTests) {
        if ((currentTests.get(key) ?? 0) + (removed.tests.get(key) ?? 0) < count) {
          addError(errors, 'baseline_identity_dropped', `${path}:test`);
        }
      }
      for (const [key, count] of previousAssertions) {
        if ((currentAssertions.get(key) ?? 0) + (removed.assertions.get(key) ?? 0) < count) {
          const item = identityByKey(previous.assertions ?? []).get(key);
          addError(errors, 'baseline_identity_dropped', `${path}:${item?.label || item?.kind || 'assertion'}`);
        }
      }
    }
  }

  const unique = [...new Set(errors)].sort();
  const fileCount = Object.keys(inventory.files ?? {}).length;
  const testCount = Object.values(inventory.files ?? {}).reduce((sum, file) => sum + file.testCount, 0);
  const assertionCount = Object.values(inventory.files ?? {}).reduce((sum, file) => sum + file.assertionCount, 0);
  return {
    valid: unique.length === 0,
    errors: unique,
    stats: { fileCount, testCount, assertionCount, allowlistCount: allowlist.entries.length, releaseEvidence: false },
  };
}

export function loadJson(repoRoot, relativePath) {
  if (!nonEmptyString(relativePath) || isAbsolute(relativePath) || relativePath.includes('\0') || relativePath.split('/').includes('..')) {
    throw Object.assign(new Error(`path_escape:${relativePath}`), { code: 'EACCES' });
  }
  const resolved = resolve(repoRoot, relativePath);
  if (!existsSync(resolved)) throw Object.assign(new Error(`missing:${relativePath}`), { code: 'ENOENT' });
  let cursor = resolve(repoRoot);
  for (const part of relativePath.split('/')) {
    cursor = resolve(cursor, part);
    let stat;
    try { stat = lstatSync(cursor); }
    catch { throw Object.assign(new Error(`unreadable:${relativePath}`), { code: 'EIO' }); }
    if (stat.isSymbolicLink()) throw Object.assign(new Error(`symlink_forbidden:${relativePath}`), { code: 'ELOOP' });
  }
  const realRoot = realpathSync(repoRoot);
  const realFile = realpathSync(resolved);
  const rel = relative(realRoot, realFile);
  if (rel.startsWith(`..${sep}`) || rel === '..' || isAbsolute(rel)) {
    throw Object.assign(new Error(`path_escape:${relativePath}`), { code: 'EACCES' });
  }
  if (lstatSync(resolved).size > MAX_FILE_BYTES) throw Object.assign(new Error(`file_too_large:${relativePath}`), { code: 'EFBIG' });
  return JSON.parse(readFileSync(resolved, 'utf8'));
}

export function loadPreviousBaselineFromGit(repoRoot) {
  try {
    const text = execFileSync('git', ['show', `HEAD:${BASELINE_PATH}`], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: MAX_FILE_BYTES,
    });
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function checkE2EParity(repoRoot) {
  const scan = scanParitySources(repoRoot);
  let baseline;
  let allowlist;
  const loadErrors = [];
  try { baseline = loadJson(repoRoot, BASELINE_PATH); }
  catch (error) {
    loadErrors.push(`baseline_unreadable:${error.code === 'ENOENT' ? 'missing' : 'unreadable'}`);
  }
  try { allowlist = loadJson(repoRoot, ALLOWLIST_PATH); }
  catch (error) {
    loadErrors.push(`allowlist_unreadable:${error.code === 'ENOENT' ? 'missing' : 'unreadable'}`);
  }
  if (loadErrors.length) {
    return {
      valid: false,
      errors: [...loadErrors, ...scan.errors].sort(),
      stats: { fileCount: Object.keys(scan.files).length, releaseEvidence: false },
      scan,
    };
  }
  const result = validateParityDocuments(baseline, allowlist, {
    scan,
    previousBaseline: loadPreviousBaselineFromGit(repoRoot),
  });
  return { ...result, scan };
}

export function untrackedAgainstBaseline(scan, baseline) {
  const added = {};
  for (const [path, current] of Object.entries(scan.files)) {
    const frozen = baseline?.files?.[path];
    if (!frozen) {
      added[path] = current;
      continue;
    }
    const knownTests = bagKeys(frozen.tests);
    const knownAssertions = bagKeys(frozen.assertions);
    const tests = current.tests.filter((item) => !knownTests.has(identityKey(item)));
    const assertions = current.assertions.filter((item) => !knownAssertions.has(identityKey(item)));
    if (tests.length || assertions.length) {
      added[path] = { tests, assertions };
    }
  }
  return added;
}

export function baselineCandidate(scan) {
  return {
    schemaVersion: 1,
    releaseEvidence: false,
    scope: 'e2e/ test+assertion parity plus agreed critical prove scripts',
    files: scan.files,
  };
}

function main() {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const print = process.argv.includes('--print');
  const scan = scanParitySources(repoRoot);
  if (print) {
    let baseline = null;
    try { baseline = loadJson(repoRoot, BASELINE_PATH); }
    catch { baseline = null; }
    if (!baseline) console.log(JSON.stringify(baselineCandidate(scan), null, 2));
    else {
      console.log(JSON.stringify({
        kind: 'e2e_parity_untracked',
        releaseEvidence: false,
        files: untrackedAgainstBaseline(scan, baseline),
      }, null, 2));
    }
    if (scan.errors.length) process.exitCode = 1;
    return;
  }
  const result = checkE2EParity(repoRoot);
  console.log(JSON.stringify({
    kind: 'e2e_parity_inventory',
    valid: result.valid,
    errors: result.errors,
    stats: result.stats,
    releaseEvidence: false,
  }, null, 2));
  if (!result.valid) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
