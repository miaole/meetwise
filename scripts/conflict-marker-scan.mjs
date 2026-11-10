#!/usr/bin/env node
/**
 * FIX-G3 / #178 残留：全仓合并冲突标记扫描（CI 硬门，红即阻断）。
 *
 * 扫 git 跟踪文件里三种整行标记：
 *   - 以 7 个 `<` 开头、其后是空格或行尾
 *   - 整行恰为 7 个 `=`
 *   - 以 7 个 `>` 开头、其后是空格或行尾
 * 排除：二进制文件（git grep -I）；vendor 类目录（node_modules / vendor / third_party /
 * third-party / .pnpm-store）。只看 git 跟踪的文件，所以未跟踪的构建产物不进扫描面。
 *
 * setext 标题下划线：在 markup 文件（md/mdx/markdown/mkd/rst/txt/adoc/asciidoc）里，
 * 若紧邻上一行是非空、且本身不是冲突标记，整行 7 个 `=` 视为 setext 标题下划线，不报。
 * 仅当该文件没有 `<<<<<<<` / `>>>>>>>` 时才抑制；有尖括号标记则同文件所有 `=======`
 * 仍报（fail-closed）。非 markup 文件（如 .ts / .json）里的孤立 `=======` 仍报。
 * 已知限制：markup 文件中紧跟正文、且同文件没有尖括号标记的孤立残留 `=======`
 * 会被当成 setext 而不报——优先消除误报。规避：用 ATX（`#`）标题，或把下划线改成不是 7 个 `=`。
 *
 * 标记字符串在运行时拼出来，脚本自身不含字面标记，避免自指命中。
 *
 * 用法：node scripts/conflict-marker-scan.mjs [--root <git 工作区>]
 * 退出码：0 = 零命中；1 = 有命中（逐条打印 文件:行号:标记类型，不回显行内容）；2 = git 调用失败。
 * 证明：node scripts/conflict-marker-scan.proof.mjs（pnpm conflict-markers:prove）。
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const L = '<'.repeat(7);
const E = '='.repeat(7);
const R = '>'.repeat(7);

// CR 可选：CRLF 文件里分隔行是 `=======\r`，不加会漏报（proof 种植 CRLF 冲突块覆盖）。
const CR = String.fromCharCode(13);
export const CONFLICT_MARKER_ERE = `^(${L}|${R})( |${CR}?$)|^${E}${CR}?$`;

export const EXCLUDED_DIR_GLOBS = [
  '**/node_modules/**',
  '**/vendor/**',
  '**/third_party/**',
  '**/third-party/**',
  '**/.pnpm-store/**',
];

/** markup 扩展名：只在这些文件里把「标题行 + 7 个 =」当作 setext 下划线抑制。 */
export const SETEXT_LIKE_EXT = /\.(md|mdx|markdown|mkd|rst|txt|adoc|asciidoc)$/i;

export function classifyMarkerLine(line) {
  if (line === E) return 'separator(=======)';
  if (line.startsWith(L) && (line.length === 7 || line[7] === ' ')) return 'ours(<<<<<<<)';
  if (line.startsWith(R) && (line.length === 7 || line[7] === ' ')) return 'theirs(>>>>>>>)';
  return null;
}

function isOursOrTheirs(kind) {
  return typeof kind === 'string' && (kind.startsWith('ours') || kind.startsWith('theirs'));
}

function isSeparator(kind) {
  return typeof kind === 'string' && kind.startsWith('separator');
}

/** 紧跟非空、非冲突标记行的 7 个 `=`，在 markup 文件中视为 setext 下划线。读失败则不抑制（fail-closed）。 */
export function isSetextUnderline(root, file, lineNo) {
  if (!SETEXT_LIKE_EXT.test(file)) return false;
  try {
    const text = readFileSync(join(root, file), 'utf8');
    const lines = text.split('\n');
    const prev = (lines[lineNo - 2] ?? '').replace(/\r$/, '');
    if (!prev.trim()) return false;
    if (classifyMarkerLine(prev)) return false;
    return true;
  } catch {
    return false;
  }
}

/** 无尖括号标记的 markup 文件里，抑制 setext 下划线造成的孤立 `=======` 误报。 */
export function suppressSetextFalsePositives(root, hits) {
  const byFile = new Map();
  for (const h of hits) {
    const list = byFile.get(h.file) ?? [];
    list.push(h);
    byFile.set(h.file, list);
  }
  const out = [];
  for (const fileHits of byFile.values()) {
    const hasAngle = fileHits.some((h) => isOursOrTheirs(h.kind));
    for (const h of fileHits) {
      if (!hasAngle && isSeparator(h.kind) && isSetextUnderline(root, h.file, h.line)) continue;
      out.push(h);
    }
  }
  return out;
}

/** 返回 { status: 'clean' | 'hits' | 'error', hits: [{ file, line, kind }], error? } */
export function scanConflictMarkers(root) {
  const args = [
    '-C', root, 'grep', '-I', '-n', '-z', '--no-color', '-E', CONFLICT_MARKER_ERE,
    '--', '.', ...EXCLUDED_DIR_GLOBS.map((g) => `:(exclude,glob)${g}`),
  ];
  const r = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) return { status: 'error', hits: [], error: String(r.error.message ?? r.error) };
  if (r.status === 1 && !r.stdout) return { status: 'clean', hits: [] };
  if (r.status !== 0) return { status: 'error', hits: [], error: (r.stderr || `git grep exit ${r.status}`).trim() };
  const hits = [];
  // -z：file\0line\0content\n
  for (const rec of r.stdout.split('\n')) {
    if (!rec) continue;
    const [file, lineNo, ...rest] = rec.split('\0');
    const content = rest.join('\0').replace(/\r$/, '');
    hits.push({ file, line: Number(lineNo), kind: classifyMarkerLine(content) ?? 'marker' });
  }
  const filtered = suppressSetextFalsePositives(root, hits);
  return { status: filtered.length ? 'hits' : 'clean', hits: filtered };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (isMain) {
  const i = process.argv.indexOf('--root');
  const root = i > 0 ? resolve(process.argv[i + 1]) : resolve(new URL('..', import.meta.url).pathname);
  const res = scanConflictMarkers(root);
  if (res.status === 'error') {
    console.error(`conflict-marker-scan: git grep 失败：${res.error}`);
    process.exit(2);
  }
  if (res.status === 'hits') {
    for (const h of res.hits) {
      console.error(`${h.file}:${h.line}: ${h.kind}`);
      if (process.env.GITHUB_ACTIONS === 'true') console.log(`::error file=${h.file},line=${h.line}::合并冲突标记 ${h.kind}`);
    }
    console.error(`conflict-marker-scan: 发现 ${res.hits.length} 处合并冲突标记（排除二进制与 ${EXCLUDED_DIR_GLOBS.join(' ')}）`);
    process.exit(1);
  }
  console.log('conflict-marker-scan: 0 处合并冲突标记（git 跟踪文件全量；已排除二进制与 vendor 类目录）');
}
