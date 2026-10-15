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
  // .tmp/ 是 gitignored 临时目录，干净 checkout/CI 中不存在；mkdtempSync 不会创建父目录，须先确保其存在。
  mkdirSync(resolve(repoRoot, '.tmp'), { recursive: true });
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
// 云端标识夹具：真实形状必须逐段拼接，避免 proof 源文件本身被 docs:check 的 public-text 扫描命中。
// （E9 的合成夹具 tail0000000.ts.net / pgm-test.pg.rds.aliyuncs.com 由 isSyntheticIdentifier 精确放行，可字面出现。）
const privateKeyFixture = ['-----BEGIN ', 'RSA ', 'PRIVATE ', 'KEY-----'].join('');
const izbpFixture = ['izbp', '1a2b3c4d5e6f7g8'].join('');
const tailnetFixture = ['relay1', 'tail0000001', 'ts', 'net'].join('.');
const prodTailnetFixture = ['prod-relay', 'tail0000001', 'ts', 'net'].join('.');
const rdsFixture = ['meetwise-prod', 'pg', 'rds', 'aliyuncs', 'com'].join('.');
const mysqlRdsFixture = ['mysql-prod', 'mysql', 'rds', 'aliyuncs', 'com'].join('.');
const ltaiFixture = ['LTAI', '5tAbCdEfGhIjKlMnOp'].join('');
const akiaFixture = ['AKIA', 'IOSFODNN7EXAMPLE'].join('');
const skLiveFixture = ['sk-', 'live_abcdefghijklmnopqrstuv'].join('');

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
  'TC-quality-04-E8': () => {
    const fixture = createFixtureRoot();
    try {
      // 真实生产标识/私钥/API 密钥必须命中云端标识兜底（gitleaks 抓不到的 IP/实例ID/Tailscale/RDS hostname）。
      write(fixture, 'scripts/leak.mjs', [
        privateKeyFixture,
        `instance ${izbpFixture}`,
        `tailnet ${tailnetFixture}`,
        `db ${rdsFixture}`,
        `db ${mysqlRdsFixture}`,
        `access ${ltaiFixture}`,
        `aws ${akiaFixture}`,
        `token ${skLiveFixture}`,
      ].join('\n'));
      const result = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['scripts/leak.mjs'] });
      assert.equal(result.valid, false);
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.PRIVATE_KEY);
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.CLOUD_IDENTIFIER);
      expectCode(result, PUBLIC_TEXT_POLICY_CODES.API_KEY);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E9': () => {
    const fixture = createFixtureRoot();
    try {
      // 显式登记的合成夹具精确放行；公钥(非私钥)与占位 API 密钥不命中。
      write(fixture, 'ops/ecs/synthetic.conf', [
        'tailnet = tail0000000.ts.net',
        'endpoint = pgm-test.pg.rds.aliyuncs.com',
        'endpoint = pgm-proof.pg.rds.aliyuncs.com',
        'public = -----BEGIN PUBLIC KEY-----',
        'placeholder = sk-example-abcdefghijklmnop',
        'placeholder = sk-test-abcdefghijklmnop',
      ].join('\n'));
      const result = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ops/ecs/synthetic.conf'] });
      assert.equal(result.valid, true, result.errors.join('\n'));
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E10': () => {
    const fixture = createFixtureRoot();
    try {
      // 放行边界：fake tailnet 的子域仍属合成(整个 `tail0000000.ts.net` 是假 tailnet)，
      // 但同形不同尾号的真实 tailnet(非登记值)仍必须拦截。
      write(fixture, 'ops/ecs/subdomain.conf', 'tailnet = evil.tail0000000.ts.net\n');
      const sub = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ops/ecs/subdomain.conf'] });
      assert.equal(sub.valid, true, sub.errors.join('\n'));
      write(fixture, 'ops/ecs/real.conf', `tailnet = ${prodTailnetFixture}\n`);
      const real = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: ['ops/ecs/real.conf'] });
      assert.equal(real.valid, false, 'unregistered tailnet must stay blocked');
      expectCode(real, PUBLIC_TEXT_POLICY_CODES.CLOUD_IDENTIFIER);
    } finally {
      rmSync(fixture, { recursive: true, force: true });
    }
  },
  'TC-quality-04-E11': () => {
    const fixture = createFixtureRoot();
    try {
      // cap 数字行为断言：恰好 2128 个真实存在的安全小文件 = 扫描上限内全量行使（valid:true·scannedFiles:2128）。
      // AG-12 成本轨③：cap 2048→2064（任务书派单 sanctioned 值）——本臂 fabricated 数随 cap 联动
      // 同步（cap 数字行为断言语义不变·强度不减·偏离清单随 REQUEST §9 落卷）。
      // ciw2 nail：cap 2064→2072（2026-10-14 协调方授权）——本臂按同协议随件同步。
      // AG-11 成本轨④ post 补证：cap 2072→2080（沿 +16 同步长）——本臂 fabricated 数随 cap 再联动。
      // S4b 翻面：cap 2072→2080（2026-10-14 协调方授权）——本臂按同协议随件同步。
      // 5B 迁移消费刀 EXEC：cap 2064→2080（按 AG-12/COST2 先例机制·+11 受管文件触顶·偏离清单随
      // REQUEST §9 EXEC 附记显耀登记·post 双审/协调方可否决·并线时主线侧已由 AG-11 同值至 2080·
      // union 并集解·cap 终值 2080 维持）——本臂 fabricated 数随 cap 联动
      // 同步（cap 数字行为断言语义不变·强度不减）。
      // ag39q：cap 2080→2081（2026-10-14 协调方 sanction·最小步）——本臂 fabricated 数随 cap 再联动。
      // API-HARDEN nail：cap 2080→2088（2026-10-14 协调方 sanction·0189 迁移+proof/卷三受管件+并集增长）——本臂 fabricated 数随 cap 再联动。
      // 5B-MIG nail 续作：cap 2080→2090（2026-10-14 协调方授权·line/batch5b-mig 并主线 union 并集
      // 必然越顶 2080·沿 ciw2 5580a059 形制·双 sanctioned 取大 union 并集解）——本臂 fabricated 数随 cap 再联动
      // 同步（cap 数字行为断言语义不变·强度不减）。
      // 5B-MIG nail 并线后 sanction：cap 2090→2104（2026-10-14 协调方 sanction·+14 沿 +8 系先例形·
      // 并线树 f7fe7078 实测 2093>2090 红停·双亲增量并集+四刀并集余量）——本臂 fabricated 数随 cap 再联动
      // 同步（cap 数字行为断言语义不变·强度不减）。
      // ssepush-notify 回归修复刀：cap 2104→2112（2026-10-14 协调方 sanction·+8 本刀收据受管件增量·沿 +8 先例形）——本臂 fabricated 数随 cap 再联动
      // 同步（cap 数字行为断言语义不变·强度不减）。
      // S4b 并线预备席：cap 2112→2120（2026-10-14 协调方 sanction·+8 S4b 收据/卷/token-stream 三面
      // 受管件·并线树 2106+8=2114 实测红停 PTP_FILE_LIMIT:2114>2112·沿 +8 先例取 2120 头空）——本臂
      // fabricated 数随 cap 再联动同步（cap 数字行为断言语义不变·强度不减）。
      // evkind-scorecard-fix 收官：cap 2120→2128（2026-10-14 协调方预 sanction·+8 并线
      // feat/mysql-schema-skeleton @5bd92ce8 新增 admin-disable-evict/ag04-consumer-fix 两受管件+余量·
      // 沿 +8 先例形）——本臂 fabricated 数随 cap 再联动同步（cap 数字行为断言语义不变·强度不减）。
      const paths = [];
      for (let i = 0; i < 2_128; i += 1) {
        const relativePath = `ai-docs/f-${String(i).padStart(4, '0')}.md`;
        write(fixture, relativePath, 'ok');
        paths.push(relativePath);
      }
      const atCap = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: paths });
      assert.equal(atCap.valid, true, atCap.errors.join('\n'));
      assert.equal(atCap.scannedFiles, 2_128);
      // 超限错误码形状断言：第 2129 个注入路径触发早返回（先于读盘·免落盘可断言）——
      // 错误串恰为 `PTP_FILE_LIMIT:2129`（`${CODE}:${n}` 形）·scannedFiles:0。
      const overCap = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: [...paths, 'ai-docs/f-2128.md'] });
      assert.equal(overCap.valid, false);
      assert.equal(overCap.scannedFiles, 0);
      assert.deepEqual(overCap.errors, [`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2129`]);
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
