/**
 * Static public-text policy for original, project-owned descriptions.
 *
 * This module is deliberately local-only: it reads the current Git worktree's
 * managed public-text paths (tracked plus non-ignored additions), never loads
 * scanned modules, consults no environment variables, and does not make
 * network requests.  A scan failure is a policy failure rather than a pass.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';

export const PUBLIC_TEXT_POLICY_VERSION = 4;
export const PUBLIC_TEXT_POLICY_CODES = Object.freeze({
  ATTRIBUTION_ZH: 'PTP_ATTRIBUTION_ZH',
  ATTRIBUTION_EN: 'PTP_ATTRIBUTION_EN',
  CODE_HOST_URL: 'PTP_CODE_HOST_URL',
  EXTERNAL_REFERENCE_LINK: 'PTP_EXTERNAL_REFERENCE_LINK',
  NEEDS_REVIEW: 'PTP_NEEDS_REVIEW',
  LOCAL_PATH: 'PTP_LOCAL_PATH',
  ROOT_MISSING: 'PTP_ROOT_MISSING',
  ROOT_SYMLINK: 'PTP_ROOT_SYMLINK',
  GIT_LIST_FAILED: 'PTP_GIT_LIST_FAILED',
  PATH_ESCAPE: 'PTP_PATH_ESCAPE',
  PATH_MISSING: 'PTP_PATH_MISSING',
  PATH_SYMLINK: 'PTP_PATH_SYMLINK',
  PATH_TYPE: 'PTP_PATH_TYPE',
  PATH_READ_FAILED: 'PTP_PATH_READ_FAILED',
  FILE_LIMIT: 'PTP_FILE_LIMIT',
  FILE_TOO_LARGE: 'PTP_FILE_TOO_LARGE',
});

const MANAGED_ROOTS = Object.freeze(['ai-docs', 'apps', 'packages', 'scripts', 'docker', 'e2e', '.github', '.claude']);
const REQUIRED_ROOTS = Object.freeze(['ai-docs', 'apps', 'packages', 'scripts']);
const ROOT_FILES = new Set(['README.md', 'AGENTS.md', 'CLAUDE.md']);
const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.mjs', '.cjs', '.js', '.ts', '.tsx', '.mts', '.cts', '.json', '.yaml', '.yml', '.sql', '.sh', '.toml']);
const MAX_FILES = 2_048;
const MAX_FILE_BYTES = 2 * 1_024 * 1_024;
const CODE_HOSTS = [
  ['git' + 'hub', 'com'],
  ['git' + 'lab', 'com'],
  ['bit' + 'bucket', 'org'],
  ['git' + 'ee', 'com'],
  ['code' + 'berg', 'org'],
  ['source' + 'forge', 'net'],
];
const ZH_EXPLICIT_ATTRIBUTIONS = [
  '改' + '编' + '自',
  '移' + '植' + '自',
  '照' + '搬' + '自',
  '借' + '鉴' + '自',
  '参' + '考' + '自',
  '参' + '照' + '自',
  '参' + '考' + '至',
  '参' + '照' + '至',
  '参' + '考' + '到',
  '参' + '照' + '到',
  '依' + '附' + '于',
];
const LOCAL_PATH_MARKERS = ['/' + 'Users' + '/', '/' + 'private' + '/' + 'tmp' + '/', 'claude-' + '501'];

// 项目自己的 canonical 出处与预览链接：README 指向自身仓库/页面是导航，不是对外引用或来源署名，
// 因此不落入 CODE_HOST_URL / EXTERNAL_REFERENCE_LINK 拦截。host 名同样按拆词拼接，避免本策略文件被自身扫描命中。
// 仅精确匹配（后随边界），任何其它 host/repo（含同 repo 前缀的更长时间路径）仍照常拦截。
const SELF_CANONICAL_URLS = Object.freeze([
  'git' + 'hub' + '.com/miaole/meetwise',
  'miaole.' + 'git' + 'hub' + '.io/meetwise',
]);
const SELF_URL_BOUNDARY = /[A-Za-z0-9._-]/;
function isSelfUrl(text) {
  for (const url of SELF_CANONICAL_URLS) {
    const index = text.indexOf(url);
    if (index === -1) continue;
    const next = text[index + url.length];
    if (next === undefined || !SELF_URL_BOUNDARY.test(next)) return true;
  }
  return false;
}

// These patterns deliberately require an attribution construction.  They do
// not ban legitimate terms such as “参照系”, “schema reference”, or “citation”.
const POLICY_RULES = Object.freeze([
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: new RegExp(`(?:${ZH_EXPLICIT_ATTRIBUTIONS.join('|')})`, 'u'),
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: /(?:来自|源自|基于)\s*(?:(?:外部|其他|某(?:个)?|该|这个)\s*)?(?:开源\s*)?(?:项目|仓库|代码库|代码仓|repo(?:sitory)?)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: /(?:本项目|本系统|本仓库|Meetwise|知面)\s*(?:由|从)\s*[^\n]{0,80}?(?:项目|仓库|代码库|代码仓|repo(?:sitory)?)\s*(?:衍生|改编|迁移|移植|复制|照搬|构建)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: /(?:以|按)\s*[^\n]{0,80}?(?:项目|仓库|代码库|代码仓|repo(?:sitory)?)\s*(?:为基础|改造|迁移|移植|照搬)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\b(?:adapted|ported|derived|copied|migrated|forked)\s+from\s+(?:(?:an?|the|external)\s+)*(?:project|repository|repo)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\bbased\s+on\s+(?:(?:an?|the|external)\s+)*(?:project|repository|repo)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\b(?:reference|refer)\s+(?:to|from)\s+(?:(?:an?|the|external)\s+)*(?:project|repository|repo)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\b(?:this\s+)?(?:project|repository|repo)\s+(?:is\s+)?(?:adapted|ported|derived|copied|migrated|forked)\s+from\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.CODE_HOST_URL,
    re: new RegExp(`\\b(?:https?:\\/\\/)?(?:www\\.)?(?:${CODE_HOSTS.map(([host, suffix]) => `${host}\\.${suffix}`).join('|')})\\/[A-Za-z0-9][A-Za-z0-9._-]*\\/[A-Za-z0-9][A-Za-z0-9._-]*`, 'iu'),
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.NEEDS_REVIEW,
    re: /(?:归属|来源)\s*(?:待确认|未确认|待审计)|\b(?:attribution|origin)\s+(?:pending|unknown)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.LOCAL_PATH,
    re: new RegExp(`(?:${LOCAL_PATH_MARKERS.map((marker) => marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'u'),
  },
]);

// Published project documents state their own contracts and evidence. They
// must not outsource either to an external citation link. This applies to all
// public Markdown roots, not the private agent-skill library under `.claude`.
// URLs that form part of a configuration example are not a citation, while a
// rendered external reference is.
const PUBLISHED_MARKDOWN_ROOTS = Object.freeze(['ai-docs', 'apps', 'packages', 'scripts', 'docker', 'e2e', '.github']);
const PUBLISHED_MARKDOWN_REFERENCE_RULES = Object.freeze([
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /\]\(\s*(?:https?:)?\/\/[^\s)]+\s*\)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /^\s*\[[^\]\n]+\]:\s*<?(?:https?:)?\/\/[^\s>]+/imu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /<(?:https?:)?\/\/[^\s>]+>/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /<a\b[^>]*\bhref\s*=\s*(?:"(?:https?:)?\/\/[^"\s>]+"|'(?:https?:)?\/\/[^'\s>]+'|(?:https?:)?\/\/[^\s>]+)/iu,
  },
]);

function rulesForPath(trackedPath) {
  const isPublishedMarkdown = /\.mdx?$/iu.test(trackedPath) && (
    ROOT_FILES.has(trackedPath)
    || PUBLISHED_MARKDOWN_ROOTS.some((root) => trackedPath.startsWith(`${root}/`))
  );
  return isPublishedMarkdown
    ? [...POLICY_RULES, ...PUBLISHED_MARKDOWN_REFERENCE_RULES]
    : POLICY_RULES;
}

function stable(values) {
  return [...new Set(values)].sort();
}

function isManagedPath(candidate) {
  if (typeof candidate !== 'string' || candidate.length === 0 || candidate.includes('\0') || isAbsolute(candidate)) return false;
  const normalized = candidate.split('\\').join('/');
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) return false;
  if (ROOT_FILES.has(normalized)) return true;
  if (!TEXT_EXTENSIONS.has(extname(normalized))) return false;
  return MANAGED_ROOTS.some((root) => normalized.startsWith(`${root}/`));
}

function pathError(code, path) {
  return `${code}:${path}`;
}

function rootErrors(repoRoot) {
  const errors = [];
  if (!existsSync(repoRoot)) return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')];
  let rootStat;
  try {
    rootStat = lstatSync(repoRoot);
  } catch {
    return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')];
  }
  if (rootStat.isSymbolicLink()) return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_SYMLINK, '.')];
  if (!rootStat.isDirectory()) return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')];
  for (const root of REQUIRED_ROOTS) {
    const candidate = resolve(repoRoot, root);
    try {
      const stat = lstatSync(candidate);
      if (stat.isSymbolicLink()) errors.push(pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_SYMLINK, root));
      else if (!stat.isDirectory()) errors.push(pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, root));
    } catch {
      errors.push(pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, root));
    }
  }
  return stable(errors);
}

export function listTrackedPublicTextPaths(repoRoot) {
  const errors = rootErrors(repoRoot);
  if (errors.length > 0) return { paths: [], errors };
  let listed;
  let deleted;
  try {
    // Scan additions as well as index entries.  A new public document is part
    // of the worktree claim before it is staged, so excluding it would let the
    // local gate pass while the same content is waiting to be committed.
    listed = execFileSync('git', ['-C', repoRoot, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] });
    deleted = execFileSync('git', ['-C', repoRoot, 'ls-files', '--deleted', '-z'], { encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return { paths: [], errors: [pathError(PUBLIC_TEXT_POLICY_CODES.GIT_LIST_FAILED, 'git-ls-files')] };
  }
  // A file deleted in the current working tree is not public text to scan. A
  // later race or an explicitly supplied missing path still fails closed.
  const deletedPaths = new Set(deleted.toString('utf8').split('\0').filter(Boolean));
  const paths = listed.toString('utf8').split('\0').filter(Boolean)
    .filter((path) => !deletedPaths.has(path))
    .filter(isManagedPath)
    .sort();
  if (paths.length > MAX_FILES) {
    return { paths: [], errors: [pathError(PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT, String(paths.length))] };
  }
  return { paths, errors: [] };
}

function safelyReadTrackedText(repoRoot, realRoot, trackedPath) {
  const normalized = trackedPath.split('\\').join('/');
  if (!isManagedPath(normalized)) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_ESCAPE, normalized) };
  const candidate = resolve(repoRoot, normalized);
  const relativeCandidate = relative(repoRoot, candidate);
  if (relativeCandidate === '..' || relativeCandidate.startsWith(`..${sep}`) || isAbsolute(relativeCandidate)) {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_ESCAPE, normalized) };
  }
  let stat;
  try {
    stat = lstatSync(candidate);
  } catch {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_MISSING, normalized) };
  }
  if (stat.isSymbolicLink()) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_SYMLINK, normalized) };
  if (!stat.isFile()) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_TYPE, normalized) };
  if (stat.size > MAX_FILE_BYTES) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.FILE_TOO_LARGE, normalized) };
  let realCandidate;
  try {
    realCandidate = realpathSync(candidate);
  } catch {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_READ_FAILED, normalized) };
  }
  const bounded = relative(realRoot, realCandidate);
  if (bounded === '..' || bounded.startsWith(`..${sep}`) || isAbsolute(bounded)) {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_ESCAPE, normalized) };
  }
  try {
    return { text: readFileSync(candidate, 'utf8') };
  } catch {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_READ_FAILED, normalized) };
  }
}

function lineNumber(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

/**
 * Scan the current public-text worktree.  `trackedPaths` is injectable only
 * for deterministic proof fixtures; production callers omit it and use Git.
 */
export function scanPublicTextPolicy({ repoRoot, trackedPaths } = {}) {
  const root = resolve(repoRoot ?? '.');
  const rootValidationErrors = rootErrors(root);
  if (rootValidationErrors.length > 0) return { valid: false, errors: rootValidationErrors, scannedFiles: 0 };

  const listed = trackedPaths === undefined
    ? listTrackedPublicTextPaths(root)
    : { paths: trackedPaths, errors: [] };
  if (listed.errors.length > 0) return { valid: false, errors: stable(listed.errors), scannedFiles: 0 };
  if (!Array.isArray(listed.paths) || listed.paths.length > MAX_FILES) {
    return { valid: false, errors: [pathError(PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT, String(listed.paths?.length ?? 'invalid'))], scannedFiles: 0 };
  }

  let realRoot;
  try {
    realRoot = realpathSync(root);
  } catch {
    return { valid: false, errors: [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')], scannedFiles: 0 };
  }
  const errors = [];
  let scannedFiles = 0;
  for (const trackedPath of [...listed.paths].sort()) {
    const read = safelyReadTrackedText(root, realRoot, trackedPath);
    if (read.error) {
      errors.push(read.error);
      continue;
    }
    scannedFiles += 1;
    for (const { code, re } of rulesForPath(trackedPath)) {
      const expression = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
      for (const match of read.text.matchAll(expression)) {
        if (isSelfUrl(match[0])) continue;
        errors.push(`${code}:${trackedPath}:${lineNumber(read.text, match.index)}`);
      }
    }
  }
  const sortedErrors = stable(errors);
  return { valid: sortedErrors.length === 0, errors: sortedErrors, scannedFiles };
}
