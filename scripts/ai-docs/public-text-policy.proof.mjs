import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PUBLIC_TEXT_POLICY_CODES,
  listTrackedPublicTextPaths,
  scanPublicTextPolicy,
} from './public-text-policy.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function createFixtureRoot() {
  const fixture = mkdtempSync(resolve(repoRoot, '.tmp/public-text-policy-'));
  for (const directory of ['ai-docs', 'apps', 'packages', 'scripts']) mkdirSync(resolve(fixture, directory));
  return fixture;
}

function write(fixture, relativePath, text) {
  const target = resolve(fixture, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, text, 'utf8');
}

function expectCode(result, code) {
  assert.ok(result.errors.some((error) => error.startsWith(`${code}:`)), `missing ${code}: ${result.errors.join(', ')}`);
}

const attributionZh = ['改', '编', '自', '外部项目'].join('');
const sourceZh = ['来', '自', '外部项目'].join('');
const referenceZh = ['参', '考', '至', '某项目'].join('');
const attributionEn = ['adapted', 'from', 'external', 'project'].join(' ');
const referenceEn = ['reference', 'to', 'external', 'repository'].join(' ');
const codeHostUrl = `https://${['git' + 'hub', 'com'].join('.')}/owner/repository`;
const externalReferenceUrl = 'https://example.invalid/public-reference';
const externalReferenceDefinitions = [
  '[source]: https://example.invalid/reference-style',
  '<https://example.invalid/autolink>',
  '<a href="https://example.invalid/html-anchor">source</a>',
].join('\n');
const protocolRelativeReference = '[source](//example.invalid/protocol-relative)';
const unknownAttribution = ['归属', '待确认'].join('');

const checks = {
  'TC-quality-04-main': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'ai-docs/claim.md', `结论：${attributionZh}\n${sourceZh}\n${referenceZh}\n`);
      write(fixture, 'ai-docs/reference.md', `[外部材料](${externalReferenceUrl})\n`);
      write(fixture, 'apps/public.md', `${externalReferenceDefinitions}\n`);
      write(fixture, 'README.md', `${protocolRelativeReference}\n`);
      write(fixture, 'scripts/claim.mjs', `const source = '${attributionEn}';\nconst relation = '${referenceEn}';\n`);
      write(fixture, '.github/workflows/claim.yml', `link: ${codeHostUrl}\n`);
      const result = scanPublicTextPolicy({
        repoRoot: fixture,
        trackedPaths: ['README.md', 'scripts/claim.mjs', '.github/workflows/claim.yml', 'ai-docs/claim.md', 'ai-docs/reference.md', 'apps/public.md'],
      });
      assert.equal(result.valid, false);
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH);
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN);
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.CODE_HOST_URL);
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK);
      assert.deepEqual(result.errors, [...result.errors].sort(), 'errors must be deterministic');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E1': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'ai-docs/claim.md', attributionZh);
      const first = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/claim.md'] });
      const second = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/claim.md'] });
      assert.deepEqual(second, first, 'same tree must produce the same result');
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E2': () => {
    const firstFixture = createFixtureRoot();
    const secondFixture = createFixtureRoot();
    try {
      write(firstFixture, 'ai-docs/claim.md', attributionZh);
      write(secondFixture, 'ai-docs/claim.md', '本项目以状态机、数据约束和测试回执描述自身。');
      const first = scanPublicTextPolicy({ repoRoot: firstFixture, trackedPaths: ['ai-docs/claim.md'] });
      const second = scanPublicTextPolicy({ repoRoot: secondFixture, trackedPaths: ['ai-docs/claim.md'] });
      assert.equal(first.valid, false);
      assert.equal(second.valid, true, 'separate trees cannot share scan state');
    } finally {
      rmSync(firstFixture, { recursive: true, force: true });
      rmSync(secondFixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E3': () => {
    const fixture = createFixtureRoot();
    const outside = `${fixture}-outside.md`;
    try {
      writeFileSync(outside, 'safe', 'utf8');
      symlinkSync(outside, resolve(fixture, 'ai-docs/escape.md'));
      const escaped = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['../outside.md'] });
      const linked = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/escape.md'] });
      expectCode(escaped, PUBLIC_TEXT_POLICY_CODES.PATH_ESCAPE);
      expectCode(linked, PUBLIC_TEXT_POLICY_CODES.PATH_SYMLINK);
      rmSync(resolve(fixture, 'ai-docs/escape.md'), { force: true });

      write(fixture, 'ai-docs/untracked.md', '当前工作区的新公开文档也必须被扫描。');
      // The production discovery path must not depend on staging a file first.
      // `git init` supplies the same worktree listing interface without
      // requiring a commit or an external process beyond local Git metadata.
      execFileSync('git', ['init', '--quiet', fixture], { stdio: 'ignore' });
      const listed = listTrackedPublicTextPaths(fixture);
      assert.deepEqual(listed.errors, [], listed.errors.join('\n'));
      assert.ok(listed.paths.includes('ai-docs/untracked.md'), 'an untracked public document must be included in the local gate');
      const worktreeScan = scanPublicTextPolicy({ repoRoot: fixture });
      assert.equal(worktreeScan.valid, true, worktreeScan.errors.join('\n'));
      assert.ok(worktreeScan.scannedFiles >= 1);
    } finally {
      rmSync(outside, { force: true });
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E4': () => {
    const fixture = createFixtureRoot();
    try {
      mkdirSync(resolve(fixture, 'ai-docs/not-a-file.md'));
      const missing = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/missing.md'] });
      const wrongType = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/not-a-file.md'] });
      expectCode(missing, PUBLIC_TEXT_POLICY_CODES.PATH_MISSING);
      expectCode(wrongType, PUBLIC_TEXT_POLICY_CODES.PATH_TYPE);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E5': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'ai-docs/claim.md', `该材料的${unknownAttribution}。`);
      const result = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/claim.md'] });
      assert.equal(result.valid, false, 'unresolved attribution cannot be marked original');
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.NEEDS_REVIEW);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E6': () => {
    const fixture = createFixtureRoot();
    try {
      write(fixture, 'ai-docs/valid.md', [
        '系统以状态机作为参照系。',
        'The contract uses a schema reference and a citation field.',
        '[内部规则](../rules/global/production-invariants.md)',
      ].join('\n'));
      const result = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/valid.md'] });
      assert.equal(result.valid, true, result.errors.join('\n'));
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E7': () => {
    const fixture = createFixtureRoot();
    try {
      // 项目自身仓库与预览页是导航链接，允许；碰巧共享 repo 前缀的更长路径（另一 repo）仍必须拦截。
      const selfSource = `https://${['git' + 'hub', 'com'].join('.')}/miaole/meetwise`;
      const selfPreview = `https://miaole.${['git' + 'hub', 'io'].join('.')}/meetwise/`;
      const lookalike = `https://${['git' + 'hub', 'com'].join('.')}/miaole/meetwise-other`;
      write(fixture, 'README.md', `[查看源码](${selfSource}) · [查看预览目录](${selfPreview})\n`);
      const self = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['README.md'] });
      assert.equal(self.valid, true, self.errors.join(', '));
      write(fixture, 'ai-docs/claim.md', `[外部](${lookalike})\n`);
      const lookalikeResult = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ai-docs/claim.md'] });
      assert.equal(lookalikeResult.valid, false, 'same-prefix foreign repo must stay blocked');
      expectCode(lookalikeResult, PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK);
      expectCode(lookalikeResult, PUBLIC_TEXT_POLICY_CODES.CODE_HOST_URL);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
};

const selectedIndex = process.argv.indexOf('--case');
const selected = selectedIndex >= 0 ? process.argv[selectedIndex + 1] : undefined;
const selectedChecks = selected ? [[selected, checks[selected]]] : Object.entries(checks);
if (selected && !checks[selected]) throw new Error(`unknown_public_text_policy_case:${selected}`);

for (const [tcId, check] of selectedChecks) {
  check();
  console.log(`✓ ${tcId}`);
}
console.log(`static_preflight_valid: selected=${selectedChecks.length}/${Object.keys(checks).length}; releaseEvidence=false`);
