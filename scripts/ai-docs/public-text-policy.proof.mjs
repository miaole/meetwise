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
      // cap 数字行为断言：恰好 2152 个真实存在的安全小文件 = 扫描上限内全量行使（valid:true·scannedFiles:2152）。
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
      // perfload-env-fix：cap 2128→2136（2026-10-15 协调方 sanction·+8 沿 +8 先例形·perf-load 机检
      // 产出 TRACKED_DIR 首现·并线树实测 2132>2128 红停 PTP_FILE_LIMIT:2132）——本臂 fabricated 数
      // 随 cap 再联动同步（cap 数字行为断言语义不变·强度不减）。
      // ci-wiring3：cap 2136→2144（2026-10-15 协调方 sanction·+8 沿 +8 先例形·ci-wiring3 收据
      // +reconcile 迁移三刀在飞共享余量·并线树实测 2137>2136 红停 PTP_FILE_LIMIT:2137）——本臂 fabricated 数
      // 随 cap 再联动同步（cap 数字行为断言语义不变·强度不减）。
      // reconcile-retry：cap 2136→2144（2026-10-15 协调方 sanction·+8 沿 +8 先例形·本刀迁移 .sql
      // 受管件 +1 至 2137 红停 PTP_FILE_LIMIT:2137·三刀在飞共享余量）——本臂 fabricated 数随 cap
      // 再联动同步（cap 数字行为断言语义不变·强度不减）。
      // UC184-SLOT-ORDER nail 并线：cap 2136→2144（2026-10-15 协调方 sanction·+8 沿 +8 先例形·
      // reconcile 迁移/ci-wiring3 收据/uc184 收据三刀在飞共享）——本臂 fabricated 数随 cap 再联动
      // 同步（cap 数字行为断言语义不变·强度不减）。
      // COST-COLUMNS nail 并线：cap 2144→2152（2026-10-15 协调方预 sanction·+8 沿 +8 先例形·
      // 本刀树 2144=cap 恰等零余量+主线并线增量必越·cost-columns 收据+三刀在飞共享余量）——本臂
      // fabricated 数随 cap 再联动同步（cap 数字行为断言语义不变·强度不减）。
      // SAFEWRITE/QBANK 波后：cap 2152→2160（2026-10-15 协调方 sanction·+8 沿 +8 先例形·
      // 主线 685befed 2151 余 1·cache-observe/qbank-scope-fix/uc003-arm4/g7-env-billing
      // 四刀在飞共享余量）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // N-19 修复刀随刀：cap 2232→2240（2026-10-17 协调方 sanction·+8 沿 2208/2216/2224/2232
      // 四先例形·2224 恰等漏计勘误承 2232 刀+本刀 N-19 REQUEST 触顶·授权随令）——本臂 fabricated
      // 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2422 并线恰等步进：cap 2420→2422（2026-10-27 X16-ADV post 收官并线 #162 perfweb union 越限恰等步进·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+2 恰等零多放·沿 2416→2418/2418→2420 并线先例形·快速链·授权随令）：
      // 届值如实采：origin/main `7c5aa7445`（#162 perfweb 已并）承 2420=cap 恰等·本支 3caa2363a 承 2420=cap 恰等（双亲各自合规）·merge-tree 预演恰 2 处冲突（两 policy 脚本注记/cap 区·dual-keep 双留）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2422>2420 红——union 实测 2422=main 届扫 2420+本支并入互斥受管目 2（harness/x16-adv-REQUEST.md+apps/api/test/uc-e2e-016-nhp-adv.proof.ts·两集合无交叠·两 stdout 收据 .log 非扫描扩展名不计）·四联动点 2_422/f-2422.md/:2423 恰等改·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
      // CAP-SANCTION-2420 webhook-fault EXEC 并线 union 越限恰等步进：cap 2418→2420（2026-10-27 webhook-fault EXEC 并线 #159/#160/#161·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·main 届值 124a3053e 2418=cap 恰达零余量·union 实测 2420=2418+本卷 webhook-fault-REQUEST 受管 1 件并入+本刀 EXEC 面 proof 1 件受管（stdout 收据 .log 非扫描扩展名不计·TEXT_EXTENSIONS 亲证）·沿 2402→…→2418 并线先例形·先手步进·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
// webhook-fault post 并线 CAP-SANCTION-2424 注记随本 TC 四联动点 2_424/f-2424.md/:2425 恰等改（policy .mjs 链区承登）。
// CAP-SANCTION-2426 screg EXEC 并线+修法面恰等步进：cap 2421→2426（2026-10-26/27 screg 评分键域修法刀 EXEC·fetch EXIT=0·届值如实采：origin/main b36113958（#164 webhook-fault post 已并）承 2424=cap 恰等·本支 dac132a92 承 2421=cap 恰等（双亲各自合规）·merge-tree 预演恰 2 处冲突（两 policy 脚本注记/cap 区·dual-keep 双留沿先例形）·EXEC terminal=main 届扫 2424+本支 screg-REQUEST 1+本刀辅收 proof 1=2426 恰等（真跑收据 .log 非扫描扩展名不计）·随本 TC 四联动点 2_426/f-2426.md/:2427 恰等改·沿 2422→2424 并线先例形·先手步进·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2418 X16 起草刀越限步进：cap 2410→2418（2026-10-27 X16-ADV quiz/diagnosis 双口对抗边界起草刀·总盘派单序第 4 项常设预授权「越限沿先例步进承登」·+8 三十先例形·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406/2409/2410 快速链·授权随令）
      // 本支树终验亲跑 scanned 2410=cap 2410 恰等零余量+本卷 x16-adv-REQUEST 受管 1 件=2411 必超（EXEC 期 +1 proof=2412≤2418·余 6 在飞共享余量·X33 line/x33-adv-draft 对同两 script 交涉面随并线届值重算 dual-keep）·
      // 先手步进·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2418 随刀先手步进：cap 2416→2418（2026-10-27 PERF-web EXEC 立项 NHP-001-PERF-web-01 并线 #157/#158/#159 union 越限恰等步进+EXEC 面 terminal 算式·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+2 恰等零多放·沿 2402→2405/2406→2409/2410/2413/2416 并线先例形·
      // merge 两 policy 双件冲突 dual-keep 注释双留·cap 届值 main 承 2416（f82d1a2c2 亲证）·并线树终验亲跑 docs:check PTP_FILE_LIMIT:2417>2416 红（union 实测 2417=main 届扫 2416+本支 harness/perfweb-REQUEST.md 受管 1 件并入·双亲各自合规）·EXEC terminal=2416+REQUEST 1+proof 1=2418 恰等（tracked gate stdout 收据落 .log ∉TEXT_EXTENSIONS 非扫描面不计·沿 webhook-neg/批 C 先形）·#160 x33/#161 webhook-fault 在飞未在 main 如实采·四联动点 2_418/f-2418.md/:2419 恰等改·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2413 随刀先手步进：cap 2410→2413（2026-10-26 PERF-web 起草卷 NHP-001-PERF-web-01·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」承登·
      // 本树届值亲跑 scanned 2410=cap 2410 恰等零余量+本卷 harness/perfweb-REQUEST.md 1 件=2411 必超·算式=REQUEST 1（起草）+EXEC 期 proof 1+EXEC 期 tracked receipt 若落 text-extension 1=2413 恰等 terminal·
      // x33-adv-draft 先手步进先形·在飞三线登记（perf3=2413/x33=2417/webhook=2410·并线 union 届时重测）·四联动点 2_413/f-2413.md/:2414 恰等改·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2416 随刀联动：cap 2413→2416（2026-10-27 #157 PERF_api 三收据并线 #159 webhook-neg 双支受管目 union 越限恰等步进·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+3 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406/2409/2410/2413
      // 三十一先例形·并线树终验亲跑 docs:check PTP_FILE_LIMIT:2416>2413 红——双亲各自合规（main `5356fa8c5`=#159 届值 2413=cap 恰等·本支 `1fb9acbf8` 届值 2413=cap 恰等）union 实测 2416=双亲届值 2413 各含互斥受管目（main 侧 webhook-neg-REQUEST+两 proof·本支 PERF_api 三 proof）两集合无交叠 2413+3=2416 恰等·egress inventory union 同步登记 +6（376→382·proof 复跑 EXIT=0）·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2413 随刀联动补录：cap 2410→2413（2026-10-27 PERF_api 三收据并线 union 恰等步进·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+3 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406/2409/2410
      // 三十先例形·并线树终验亲跑 PTP_FILE_LIMIT:2413>2410 红——双亲各自合规（main `9c31c0ccc`=#156 届值 2410=cap 恰等·本支 `1a22540a2` 届值 2405=cap 恰等 worktree 实扫亲证）union 实测 2413=main 届值 2410+本支并入受管净增 3（PERF_api 三 proof·stdout 收据 .log 非扫描面不计）·本臂 TC 前值 2402 系本支起草届值漏随 2405 步进（P1 联动漏做）·并线后以合并树实测 2413 为准恰等补录·并线两轮如实承登：首轮对 d1a947e3d 实测 2412（首轮 merge 索引冲突路径三态重扫曾得 2418 冗计·git add 收敛后终验）未及落卷·#156 落 main 后重 merge 终验 2413 如实·
      // CAP-SANCTION-2419 EXEC 并线 union 越限恰等步进：cap 2417→2419（2026-10-27 X33-ADV EXEC·协调方 EXEC 派单常设预授权「cap 届值如实采·union 越限沿常设预授权恰等步进」随令·+2 恰等零多放·沿 2402→2405/2406→2409→2410→2413 并线先例形·并线 merge origin/main `5356fa8c5`（#156/#158/#159 三线收官）后终验亲跑 PTP_FILE_LIMIT:2418>2417 红——union 实测 2419=2418（REQUEST 并入）+1 proof（stdout 收据 .log 非扫描扩展名不计）·快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2417 随刀：cap 2409→2417（2026-10-27 X33-ADV 起草刀·协调方派单预授权「越限沿先例步进承登」·+8 二十四先例形·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2394
      // 二十四 +8 先例·其间 2392/2397/2402/2405/2406/2409 恰等变体如实登记·届树亲跑 scanned 2409=cap 2409 恰等零余量+本卷 harness/x33-adv-REQUEST.md 1 件=2410 必超（EXEC 期 +1 proof 终态 2411≤2417）·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2413 EXEC 并线恰等步进：cap 2410→2413（2026-10-27 NHP-014 webhook-neg EXEC·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·+3 恰等零多放·沿 2402→2405/2406→2409→2410 并线先例形·并线 merge `69997bd42` 后终验亲跑 PTP_FILE_LIMIT:2411>2410 红——union 实测 2413=2411（REQUEST 并入）+2 proof（stdout 收据 .log 非扫描扩展名不计）·快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2410 并线恰等步进：cap 2409→2410（2026-10-27 PAY-NEG 支付拒绝 UI 刀收官并线 #155 sse-adv·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·+1 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406/2409
      // 二十九先例形·并线树终验亲跑 PTP_FILE_LIMIT:2410>2409——双亲各自合规（main `d1a947e3d` 届值 2409=cap 恰等零余量·本支 `80847d175` 届值 2405=届 cap 恰等零余量）union 实测 2410=2409+本卷 pay-neg-REQUEST 受管 1 件并入（派单原裁 2405→2406 恰等步进随 #155 并线届值重算·merge `7813aa407` 后亲测）·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2409 并线 union 恰等步进：cap 2406→2409（2026-10-27 SSE-ADV sanction 收官并线 #154 killsw 二轮 union·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·+3 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406
      // 二十八先例形·并线树终验亲跑 PTP_FILE_LIMIT:2409>2406——双支各自合规（本支 `907a7c47c`→2406 恰等·main `27a87781b` 届值 2405=killsw union 恰等）union 实测 2409=2406+killsw 并入受管净增 3（REQUEST+2 proof·stdout 收据非扫描面不计）（累计并入越限·merge-tree 预演同值）·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2406 随刀：cap 2402→2406（2026-10-27 SSE-ADV sanction 收官并线协调方常设预授权·+4 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402
      // 二十六先例形·并线树终验亲跑 PTP_FILE_LIMIT:2406>2402——双亲各自合规（main `cab3c7092` 届值 2402=cap 零余量·本支 `907a7c47c` 届值 2402=cap 恰等〔scanned 2401·stdout 非扫描面〕）union 实测 2406=本支净增 4 受管文件（REQUEST+proof+docker-info+receipt JSON）并入（累计并入越限·merge-tree 预演同值）·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2402 随刀：cap 2397→2402（2026-10-27 SSE-ADV EXEC 立项协调方届值如实采·+5 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2394/2397
      // 二十五先例形·本支树终验亲跑 PTP_FILE_LIMIT:2398>2397——#151 并线后 2397=cap 零余量+本支 REQUEST 1 件=2398 必超（merge a0b5893f4 后亲证）·协调方届值 2402 如实采（#152 在飞预登同值未并）·本刀净增 4 受管文件终态 2402 恰等·
      // CAP-SANCTION-2403 随刀：cap 2402→2403（2026-10-26 NHP-014 支付回调刀起草随刀协调方预授权 sanction·+1 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2394/2397/2402
      // 二十六先例形·本刀树终验亲跑 scanned 2402=cap 恰等零余量——本卷 webhook-neg-REQUEST.md 受管 +1=2403 必越（CAP-SANCTION-2354 同形：main 恰 cap 零余量+本卷 REQUEST +1）·
      // 起草 commit 即触·预授权「越限沿先例步进承登」随令行使·快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2402 随刀：cap 2397→2402（2026-10-26 UC-030 时钟卷并线收官协调方预授权 sanction·+5 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397
      // 二十五先例形·并线树终验亲跑 PTP_FILE_LIMIT:2402>2397——双亲各自合规（本支 e987e8213 届值 2392≤2394·main e072e957f 届值 2397=cap 零余量）union 实测 2402=本支净增 5 受管文件（REQUEST+proof+3 receipts）并入（累计并入越限·merge-tree 预演同值）·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2397 随刀：cap 2394→2397（2026-10-26 补评闭环并线收官协调方预授权 sanction·+3 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392
      // 二十四先例形·并线树终验亲跑 PTP_FILE_LIMIT:2397>2394——双亲各自合规（本支 582d4cf08 届值 2392+main 39cf555c4 届值 2394 双零余量）union 实测 2397 必超（累计并入越限·merge-tree 预演同值）·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2394 随刀：cap 2386→2394（2026-10-26 NHP 批 C 收官协调方序 A sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386
      // 二十三先例形·并线树终验亲算预算——origin/main `b894cad88`（#146 批 B 并线后）届扫 2381 余 5 + 本支 line/nhp-c-draft 净增 6 受管文件（REQUEST+3 proofs+3 receipts）union=2388≤2394·
      // 协调方 2026-10-26 序 A sanction·本批 6 受管文件·快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2392 随刀：cap 2386→2392（2026-10-26 补评闭环收官协调方追认 sanction·+6 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386
      // 二十三先例形·来源：批 C 后继补评闭环刀三 proof naming-convention/any 类·stash 对照基线零余量实证·协调方 2026-10-26 追认·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2386 随刀：cap 2378→2386（2026-10-26 NHP 批 B 收官协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378
      // 二十二先例形·本支树终验亲跑 PTP_FILE_LIMIT:2381>2378——origin/main `47f26403b` 届扫 2376 余 2 + 本支 line/nhp-batch-b-draft 净增 5 受管文件（REQUEST+4 proofs）union=2381 必超·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2378 随刀：cap 2370→2378（2026-10-26 NHP 批 A 收官协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370
      // 二十一先例形·并线树终验亲跑 PTP_FILE_LIMIT:2372>2370——origin/main `151479547` 届扫 2364 余 6 + 本支 line/nhp-batch-a-draft 净增 8 受管文件 union=2372·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2370 随刀：cap 2362→2370（2026-10-26 UC-017 并线二轮随刀·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362
      // 二十先例形·双刀同日各自 2354→2362 步进（UC-017/UC-025 各自基线合规）后双支并线 union 实测 2364>2362（累计并入越限·沿 cap 2338→2346 五刀先例形）·
      // 授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2362 随刀：cap 2354→2362（2026-10-26 UC-017 并线终验随刀·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354
      // 十九先例形·并线树实测 2355>2354 红停承登（双亲各自合规 2346/2352·越限 9 件全来自邻支线 mop01/event-ttl/ag36 交付件·累计并入越限·根因不在本刀交付面）·
      // 授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // UC025-POST 并线随刀：cap 2354→2362（2026-10-26 协调方并线 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354
      // 十九先例形·并线树终验亲跑 PTP_FILE_LIMIT:2355>2354——main 恰 2354=cap 零余量+本卷 uc025-e2e-REQUEST.md 受管 +1=2355（merge `486776d00` 后终验亲证）·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2354 随刀：cap 2346→2354（2026-10-26 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346
      // 十八先例形·届树亲跑 2341 余 5（brief 颁「2328 恰等零余量」系 LEDGER :702 历史行值·勘误如实）·在飞六条 E2E 缺口领包卷并线必越（2341+6=2347>2346·先手步进·
      // 授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2346 随刀：cap 2338→2346（2026-10-22 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338
      // 十七先例形·main 现值 2339 已越 2338 一文件（五刀 ag34/#249/ag35/asr-quality/lease-attempts 各自基线合规·累计并入越限·协调方累计账失察）·
      // 在飞 AG-25 勘误卷 1+本卷 1=2341≤2346 余 5·main CI 红热修 PTP_FILE_LIMIT:2339>2338·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2338 随刀：cap 2330→2338（2026-10-22 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280
      // 十六先例形·主线已扫 2330 余量 0·在飞新卷 ≥1（AG 下一刀）并线=2331 必超·授权随令）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // MANAGED-FILE-CEILING-2320 随刀：cap 2312→2320（2026-10-20·+8·开工前已扫 2310 余量 2·加上本记录后扫描变成 2311·步进只许 +8·恰达上限仍通过·多一个仍拒绝）——本臂 fabricated 数随 cap 再联动同步（这次数字跟着上限走·语义不变·强度不减）。
      // MANAGED-FILE-CEILING-2312 随刀：cap 2304→2312（2026-10-20·+8·开工前已扫 2303 余量 1·加上本记录后扫描变成 2304·步进只许 +8·恰达上限仍通过·多一个仍拒绝）——本臂 fabricated 数随 cap 再联动同步（这次数字跟着上限走·语义不变·强度不减）。
      // MANAGED-FILE-CEILING-2304 随刀：cap 2296→2304（2026-10-19·+8·开工前已扫 2293 余量 3·加上本记录后扫描变成 2294·步进只许 +8·恰达上限仍通过·多一个仍拒绝）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // MANAGED-FILE-CEILING-2296 随刀：cap 2288→2296（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288
      // 十一先例形·开工前已扫 2285 余量 3·加上本记录后扫描变成 2286·步进只许 +8）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // MANAGED-FILE-CEILING-2288 随刀：cap 2280→2288（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280
      // 十先例形·主线已扫 2280 余量 0·本卷使扫描变成 2281·授权随令）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2280 随刀：cap 2272→2280（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272
      // 九先例形·主线 2270·在飞新卷 3 并线=2273 必超·授权随令）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2272 随刀：cap 2264→2272（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264
      // 八先例形·主线 2261·在飞四支线并线 2265 必超·授权随令）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2264 随刀：cap 2256→2264（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256
      // 七先例形·2256 恰等零余量·在飞 deploy:check 修复刀并线必越·授权随令）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2256 随刀：cap 2248→2256（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248
      // 六先例形·2248 恰等零余量·在飞五刀并线 2253 超限·授权随令）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2248 随刀：cap 2240→2248（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240
      // 五先例形·2240 恰等零余量·在飞四刀并线 2249 超限·授权随令）——本臂 fabricated 数随 cap
      // 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2402 随刀：cap 2397→2402（2026-10-26 killsw 开关刀随刀·+5 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397
      // 二十五先例形·协调方 EXEC 派单预授权「cap 届值重算+本刀 tracked 文件余量」随令·本刀 EXEC 面 +4 净增受管文件（两 proof+两门矩阵 stdout 收据·并线基含本卷 REQUEST 2398）union=2402 恰等·
      // 快速链·授权随令）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2405 并线 union 越限恰等步进：cap 2402→2405（2026-10-27 killsw 开关刀并线 #152 clock-e2e·协调方并线令预授权「union 越限预授权恰等步进+承登」随令·
      // 并线树终验亲跑 PTP_FILE_LIMIT:2405>2402 红·双亲各自合规（本支 d41a4511f 届值 2400≤2402·main 961f5ef12 届值 2402=cap 零余量）union 实测 2405=2400+clock 并入受管 5·
      // 计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // cap 2420→2421 随刀：eslint-ignores 起草刀（2026-10-26·+1 恰等零多放·uc003x c1a4ce3a0 起草随刀单件恰等先例形·协调方派单预授权「越限沿先例步进承登预授权」随令·本支树届扫 2420=cap 恰等零余量+本卷 harness/eslint-ignores-REQUEST.md 受管 1 件=2421 必超（PTP_FILE_LIMIT:2421>2420 形·docs:check 起草前亲跑 EXIT=0 scanned 2420 亲证）·四联动点 2_421/f-2421.md/:2422 恰等改·派单门「diff 恰 2 tracked」偏离如实承登·协调方 post 审可否决·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2420 post 收官并线 union 越限恰等步进：cap 2418→2420（2026-10-27 PERF-web post 双审双 PASS 会签后并线 #161 uc003x·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+2 恰等零多放·
      // 届值如实采：origin/main 124a3053e 承 2418=cap 恰等（uc003x 线已并）·本支 2418=cap 恰等（双亲各自合规）·merge-tree 预演恰 3 处冲突（web package.json 脚本行+policy .mjs 注释双区）→additive/dual-keep 解·
      // 合并树终验亲跑 docs:check PTP_FILE_LIMIT:2420>2418 红（union 实测 2420=main 届扫 2418+本支互斥受管目 2：perfweb-REQUEST+nhp-perf-web.proof·两 stdout 收据 .log 非扫描面不计）·四联动点 2_420/f-2420.md/:2421 恰等改·沿 2416→2418 并线先例形·先手步进·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2411 随刀：cap 2410→2411（2026-10-26 uc003x 简历域残面起草刀随刀·+1 恰等零多放·pay-neg #155 单件恰等先例形·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406/2409/2410
      // 三十先例形·协调方派单预授权「越限沿先例步进承登预授权」随令·本支树届扫 2410=cap 恰等零余量+本卷 REQUEST 1 件=2411 必超·
      // 计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2421 随刀：cap 2420→2421（2026-10-26 screg 评分键域修法刀起草随刀·+1 恰等零多放·uc003x 起草刀 #161 单件恰等先例形+pay-neg #155 先形·
      // 协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」在树（policy .mjs 注记栈亲证）随令行使·本支树届扫 2420=cap 恰等零余量（docs:check 起草前亲跑 EXIT=0 亲证）+本卷 screg-REQUEST.md 1 件=2421 必超（PTP_FILE_LIMIT:2421>2420 形）·
      // 计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2418 post 收官并线 union 越限恰等步进：cap 2416→2418（2026-10-27 uc003x 残面 post 收官并线 #157 perf3-receipts·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·main 届值 f82d1a2c2 2416=cap 恰等零余量·union 实测 2418=2416+本支并入互斥受管目 2（uc003x-REQUEST+uc-e2e-003-nhp-neg.proof·两 stdout 收据 .log 非扫描面不计）·首轮未收敛实测 2422 冗计如实承登（2 冲突件×3 stage=+4·沿 #157 同形坑·git add 收敛后终验 2418）·沿 2402→…→2416 并线先例形·先手步进·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2420 X16 EXEC 并线 union 越限恰等步进：cap 2418→2420（2026-10-27 X16-ADV EXEC 立项并线 #157/#158/#159/#161·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+2 恰等零多放·并线 merge `a69bfdb5e` 后终验亲跑 docs:check PTP_FILE_LIMIT:2419>2418 红——union 实测 2419=2418+本卷 x16-adv-REQUEST 受管 1 件并入·EXEC terminal=2420=2419+本刀 proof 1 件·两 policy 注记栈冲突 dual-keep 双留·沿 2402→…→2418 并线先例形·先手步进·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2423 EXEC 并线 union 越限恰等步进：cap 2422→2423（2026-10-27 eslint-ignores EXEC 并线 #163 x16-adv·协调方常设预授权「union 越限沿常设预授权恰等步进」随令·+1 恰等零多放·并线树终验亲跑 docs:check PTP_FILE_LIMIT:2423>2422 红（真 EXIT=1 亲证）——union 实测 2423=main 届扫 2422+本卷 eslint-ignores-REQUEST 受管 1 件并入·两 policy 注记栈冲突 dual-keep 双留（本支 eslint-ignores 起草注记+main X16-ADV/CAP-SANCTION-2422 注记并留）·沿 2420→2422 并线先例形·先手步进·计数预算非内容策略）——本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // 随本步进勘误（P3 形·随卷承登）：上行「第 2421 个注入路径」原 main 侧文本与其同断言 :2423 不自洽（本步进后正形=第 2424 个注入路径触发早返回）·随四联动点恰等改一并勘正。
      // CAP-SANCTION-2427 #160 x33 收官并线恰等步进：cap 2424→2427（2026-10-27 X33-ADV 跨用户授权补集 #160 收官并线 #162 perfweb+#163 x16-adv+#164 webhook-fault·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+3 恰等零多放·union 实测 2427=main 届扫 2424+本支互斥受管目 3（x33-adv-REQUEST+uc-e2e-033-nhp-adv.proof+uc033-nhp-adv/00-docker-info.txt·.txt ∈TEXT_EXTENSIONS 计面·两 stdout 收据 .log 非扫描扩展名不计）·详 policy .mjs 链区 CAP-SANCTION-2427 注记）——本 TC 四联动点 2_427/f-2427.md/:2428 恰等改。
      // CAP-SANCTION-2428 二轮并线恰等步进：cap 2427→2428（2026-10-27 X33 #160 补集收官二轮并线 #165 eslint-ignores·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令·+1 恰等零多放·union 实测 2428=本支届扫 2427+main 并入互斥受管目 1（eslint-ignores-REQUEST.md·两集合无交叠）·详 policy .mjs 链区 CAP-SANCTION-2428 注记）——本 TC 四联动点 2_428/f-2428.md/:2429 恰等改。
      // CAP-SANCTION-2429 起草随刀恰等步进：cap 2428→2429（2026-10-28 worker 负载伞首刀 route-classify 起草（R43 伞首·具名 NHP-LOAD-WORKER-SUITE-RC-01·harness/rcload-REQUEST.md）随刀·协调方派单预授权「越限沿先例步进承登预授权」随令·+1 恰等零多放·本支届扫 2428=cap 恰等零余量+本卷 REQUEST 受管 1 件=2429 必超·EXEC 期 +1 proof 届值再步进预登·详 policy .mjs 链区 CAP-SANCTION-2429 注记）。
      // CAP-SANCTION-2430 screg post 双审双 PASS 会签后并线恰等步进：cap 2428→2430（2026-10-27 screg 评分键域修法刀 §9-post 落卷后并线收官·fetch EXIT=0·届值如实采：origin/main 7950f45bd（#160 x33-adv 补集收官二轮并线·含 #165 eslint-ignores/#166 backlog-reg 在前·merge-base=b36113958=#164 亲证）承 2428=cap 恰等·本支 0b0f7133a 承 2426=cap 恰等（双亲各自合规）·merge-tree 预演恰 2 处冲突（两 policy 脚本注记/cap 区·dual-keep 双留·本支 CAP-SANCTION-2426 注记+main CAP-SANCTION-2425/2427/2428 注记并留）·合并树终验亲跑 docs:check PTP_FILE_LIMIT 红（未收敛首轮实测 2434 冗计如实承登=2 冲突件×3 stage +4·沿 CAP-SANCTION-2418 同形坑·git add 收敛后终验 EXIT=0 scanned 2430=cap 恰等）——union 实测 2430=main 届扫 2428+本支并入互斥受管目 2（harness/screg-REQUEST.md+apps/worker/test/scoring-eval-key.proof.ts·两集合无交叠·真跑收据 .log 非扫描扩展名不计）·详 policy .mjs 链区 CAP-SANCTION-2430 注记·协调方常设预授权随令行使）——本 TC 四联动点 2_430/f-2430.md/:2431 恰等改。
      // CAP-SANCTION-2432 rcload EXEC 立项并线+落码面恰等步进：cap 2430→2432（2026-10-28 worker 负载伞首刀 route-classify EXEC·fetch EXIT=0·届值如实采：origin/main 351501976（#168 recon-flip 已并）承 2430=cap 恰等·本支 e6f217633 承 2429=cap 恰等（双亲各自合规）·merge-tree 预演 EXIT=0 但 auto-merge 于 cap 行误留本支 2429（如实承登）·真实 merge 恰 2 处冲突 dual-keep 双留（本支 CAP-SANCTION-2429 注记+main CAP-SANCTION-2426/2430 注记并留·先例形）·EXEC terminal=main 届扫 2430+本支 rcload-REQUEST 1+本刀主证 proof 1（nhp-load-worker-rc01.proof.ts）=2432 恰等（真跑收据 .log 非扫描扩展名不计）·详 policy .mjs 链区 CAP-SANCTION-2432 注记·常设预授权随令行使）——本 TC 四联动点 2_432/f-2432.md/:2433 恰等改。
      // CAP-SANCTION-2433 起草随刀恰等步进：cap 2432→2433（2026-10-26 PERF_api 残格两格合卷起草（总盘小刀 #12-13·UC-004/UC-015 PERF_api 残格·harness/perf2-REQUEST.md）随刀·协调方派单预授权「越限沿先例步进承登预授权」随令·+1 恰等零多放·本支届扫 2432=cap 恰等零余量（基线 docs:check EXIT=0 scanned 2432 亲证）+本卷 REQUEST 受管 1 件=2433 必超·EXEC 期 +2 proof 届值再步进预登=2435（REQUEST §2 门 1）·详 policy .mjs 链区 CAP-SANCTION-2433 注记·沿 2429 起草随刀单件恰等先例形·快速链·授权随令）——本 TC 四联动点 2_433/f-2433.md/:2434 恰等改。
      // CAP-SANCTION-2438 起草刀越限步进：cap 2430→2438（2026-10-26 回调安全日志接线起草刀 GAP-UC014-AUDIT-EMIT·协调方派单预授权「越限沿先例步进承登」随令行使·+8 沿 CAP-SANCTION-2417/2418 起草刀 +8 同形·union 实测 2431=origin/main 351501976 届扫 2430（=cap 恰等零余量亲证）+本卷 harness/audit-log-REQUEST.md 受管 1 件·EXEC 期 +1 可选 proof 终态 2432≤2438（stdout 收据 .log 非扫描扩展名不计）·详 policy .mjs 链区 CAP-SANCTION-2438 注记）——本 TC 四联动点 2_438/f-2438.md/:2439 恰等改。
      // CAP-SANCTION-2438 audit-log post 会签后并线届值取大承登：本支 2_438＞main 届值 2_432（CAP-SANCTION-2432 注记并留上）→ 合并树取大恒 2_438·本 TC 四联动点 2_438/f-2438.md/:2439 零再改（2026-10-28 audit-log post 双审双 PASS 会签后并线·dual-keep 双留先例形）。
      // CAP-SANCTION-2438 perf2 EXEC 立项并线届值取大承登：本支 2_433＜main 届值 2_438（perf2 起草 CAP-SANCTION-2433 注记并留上）→ 合并树取大恒 2_438·本 TC 四联动点 2_438/f-2438.md/:2439 零再改（2026-10-28 perf2 EXEC 立项并线·dual-keep 双留先例形·EXEC 期 +2 proof 预登越限臂沿常设预授权恰等步进·届时实测 scanned 取算）。
      const paths = [];
      for (let i = 0; i < 2_438; i += 1) {
        const relativePath = `ai-docs/f-${String(i).padStart(4, '0')}.md`;
        write(fixture, relativePath, 'ok');
        paths.push(relativePath);
      }
      const atCap = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: paths });
      assert.equal(atCap.valid, true, atCap.errors.join('\n'));
      assert.equal(atCap.scannedFiles, 2_438);
      // 超限错误码形状断言：第 2439 个注入路径触发早返回（先于读盘·免落盘可断言）——
      // 错误串恰为 `PTP_FILE_LIMIT:2439`（`${CODE}:${n}` 形）·scannedFiles:0。
      const overCap = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: [...paths, 'ai-docs/f-2438.md'] });
      assert.equal(overCap.valid, false);
      assert.equal(overCap.scannedFiles, 0);
      assert.deepEqual(overCap.errors, [`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2439`]);
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
