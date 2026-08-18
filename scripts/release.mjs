#!/usr/bin/env node
/**
 * 版本发布机制（ADR-0021）。
 *
 * 单一版本来源：根 package.json 的 `version` 字段（语义化版本）。
 * 每次发布：bump 版本 → 把 CHANGELOG 的 `[Unreleased]` 收敛为版本段 → 提交 → 打 tag `vX.Y.Z`。
 * 永不自动 push：`git push` 与 `git push --tags` 是显式、可审计的独立步骤。
 *
 * 用法：
 *   node scripts/release.mjs patch|minor|major|prerelease [--dry-run]
 *
 * 拒绝在脏工作区上运行：打 tag 必须钉在一个干净、可复现的提交上。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const PKG_PATH = resolve(ROOT, 'package.json');
const CHANGELOG_PATH = resolve(ROOT, 'CHANGELOG.md');

const [bumpType, ...flags] = process.argv.slice(2);
const dryRun = flags.includes('--dry-run');

const VALID = ['patch', 'minor', 'major', 'prerelease'];
if (!VALID.includes(bumpType)) {
  console.error(`用法: node scripts/release.mjs <${VALID.join('|')}> [--dry-run]`);
  process.exit(2);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function parseVersion(v) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/.exec(v);
  if (!m) throw new Error(`非语义化版本: ${v}`);
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function nextVersion(v, type) {
  const { major, minor, patch } = parseVersion(v);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch': return `${major}.${minor}.${patch + 1}`;
    case 'prerelease': return `${major}.${minor}.${patch + 1}-0`;
    default: throw new Error(`未知 bump 类型: ${type}`);
  }
}

const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
const current = pkg.version;
if (!current) throw new Error('根 package.json 缺少 version 字段');
const next = nextVersion(current, bumpType);

const changelog = readFileSync(CHANGELOG_PATH, 'utf8');
const UNRELEASED = '## [Unreleased]';
if (!changelog.includes(UNRELEASED)) {
  throw new Error(`CHANGELOG.md 缺少 "${UNRELEASED}" 段`);
}

// 收敛：把 [Unreleased] 段头替换为"空 [Unreleased] + 新版本段头"，使其下内容归属新版本。
const date = new Date().toISOString().slice(0, 10);
const nextHeader = `## [${next}] - ${date}`;
const newChangelog = changelog.replace(`${UNRELEASED}\n`, `${UNRELEASED}\n\n${nextHeader}\n`);

// 空 [Unreleased] 只警告不阻断：早期发布允许空版本段。
const unreleasedBody = changelog.split(UNRELEASED)[1]?.split('\n## [')[0]?.trim() ?? '';
if (!unreleasedBody) {
  console.warn('警告：当前 [Unreleased] 段为空，将发布一个空版本段。');
}

const tag = `v${next}`;
const commitMsg = `chore(release): ${next}`;

console.log(`计划发布 ${current} -> ${next}`);
console.log(`  CHANGELOG: 收敛 [Unreleased] -> [${next}]`);
console.log(`  提交: ${commitMsg}`);
console.log(`  tag: ${tag}`);

if (dryRun) {
  console.log('(dry-run) 未写入任何内容');
  process.exit(0);
}

const dirty = git(['status', '--porcelain']);
if (dirty !== '') {
  console.error('工作区不干净，拒绝发布。请先提交或暂存所有变更后再运行。');
  console.error(dirty.split('\n').slice(0, 10).join('\n'));
  process.exit(1);
}

pkg.version = next;
writeFileSync(PKG_PATH, `${JSON.stringify(pkg, null, 2)}\n`);
writeFileSync(CHANGELOG_PATH, newChangelog);

git(['add', 'package.json', 'CHANGELOG.md']);
git(['commit', '-m', commitMsg]);
git(['tag', '-a', tag, '-m', `release ${next}`]);

console.log(`已发布 ${next}（commit + tag ${tag}）`);
console.log('下一步（显式、可审计）：');
console.log('  git push');
console.log('  git push --tags');
