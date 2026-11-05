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
      // CAP-SANCTION-2438 X17-ADV 起草步进：cap 2430→2438（2026-10-27 X17-ADV 起草落卷·总盘小刀 #4·协调方派单令 docs-only 起草授权+常设预授权「越限沿先例步进承登」随令行使·+8 三十三先例形沿 X16 2410→2418 同形·本树 2430=cap 恰等零余量+本卷 harness/x17-adv-REQUEST.md 受管 +1=2431 必越·起草 commit 即触·本刀净增受管 2 件（REQUEST+EXEC proof）届终 2432≤2438·余 6 系在飞共享余量沿 cap 2152 先例形·详 policy .mjs 链区 X17-ADV 步进注记）——本 TC 四联动点 2_438/f-2438.md/:2439 恰等改。
      // CAP-SANCTION-2432 rcload EXEC 立项并线+落码面恰等步进：cap 2430→2432（2026-10-28 worker 负载伞首刀 route-classify EXEC·fetch EXIT=0·届值如实采：origin/main 351501976（#168 recon-flip 已并）承 2430=cap 恰等·本支 e6f217633 承 2429=cap 恰等（双亲各自合规）·merge-tree 预演 EXIT=0 但 auto-merge 于 cap 行误留本支 2429（如实承登）·真实 merge 恰 2 处冲突 dual-keep 双留（本支 CAP-SANCTION-2429 注记+main CAP-SANCTION-2426/2430 注记并留·先例形）·EXEC terminal=main 届扫 2430+本支 rcload-REQUEST 1+本刀主证 proof 1（nhp-load-worker-rc01.proof.ts）=2432 恰等（真跑收据 .log 非扫描扩展名不计）·详 policy .mjs 链区 CAP-SANCTION-2432 注记·常设预授权随令行使）——本 TC 四联动点 2_432/f-2432.md/:2433 恰等改。
      // CAP-SANCTION-2436 XREP 跨副本 SSE 起草步进：cap 2428→2436（2026-10-28 XREP 跨副本 SSE 槽/播双 OS 进程证明起草刀·协调方派单预授权「越限沿先例步进承登」随令·+8 三十一先例形·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2394/2402/2410/2418/2428 快速链·其间 2392/2397/2405/2406/2409 等恰等变体如实登记·届树亲跑 scanned 2428=cap 恰等零余量+本卷 harness/xrep-REQUEST.md 受管 1 件=2429 必超（EXEC 期 +1 proof=2430≤2436·余 6 在飞共享余量沿 cap 2152 先例形）·详 policy .mjs 链区 CAP-SANCTION-2436 注记）——本 TC 四联动点 2_436/f-2436.md/:2437 恰等改。
      // XREP EXEC 立项并线取大承登（随 policy .mjs 链区同记）：merge --no-ff 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留·cap 取大 2_436（本支起草步进在先）·union 实测 2433≤2_436 零越限·EXEC 期 +1 proof=2434≤2_436·四联动点 2_436/f-2436.md/:2437 取大零改·本臂 fabricated 数随 cap 再联动同步（语义不变·强度不减）。
      // CAP-SANCTION-2433 起草随刀恰等步进：cap 2432→2433（2026-10-26 PERF_api 残格两格合卷起草（总盘小刀 #12-13·UC-004/UC-015 PERF_api 残格·harness/perf2-REQUEST.md）随刀·协调方派单预授权「越限沿先例步进承登预授权」随令·+1 恰等零多放·本支届扫 2432=cap 恰等零余量（基线 docs:check EXIT=0 scanned 2432 亲证）+本卷 REQUEST 受管 1 件=2433 必超·EXEC 期 +2 proof 届值再步进预登=2435（REQUEST §2 门 1）·详 policy .mjs 链区 CAP-SANCTION-2433 注记·沿 2429 起草随刀单件恰等先例形·快速链·授权随令）——本 TC 四联动点 2_433/f-2433.md/:2434 恰等改。
      // CAP-SANCTION-2438 起草刀越限步进：cap 2430→2438（2026-10-26 回调安全日志接线起草刀 GAP-UC014-AUDIT-EMIT·协调方派单预授权「越限沿先例步进承登」随令行使·+8 沿 CAP-SANCTION-2417/2418 起草刀 +8 同形·union 实测 2431=origin/main 351501976 届扫 2430（=cap 恰等零余量亲证）+本卷 harness/audit-log-REQUEST.md 受管 1 件·EXEC 期 +1 可选 proof 终态 2432≤2438（stdout 收据 .log 非扫描扩展名不计）·详 policy .mjs 链区 CAP-SANCTION-2438 注记）——本 TC 四联动点 2_438/f-2438.md/:2439 恰等改。
      // CAP-SANCTION-2438 audit-log post 会签后并线届值取大承登：本支 2_438＞main 届值 2_432（CAP-SANCTION-2432 注记并留上）→ 合并树取大恒 2_438·本 TC 四联动点 2_438/f-2438.md/:2439 零再改（2026-10-28 audit-log post 双审双 PASS 会签后并线·dual-keep 双留先例形）。
      // CAP-SANCTION-2438 perf2 EXEC 立项并线届值取大承登：本支 2_433＜main 届值 2_438（perf2 起草 CAP-SANCTION-2433 注记并留上）→ 合并树取大恒 2_438·本 TC 四联动点 2_438/f-2438.md/:2439 零再改（2026-10-28 perf2 EXEC 立项并线·dual-keep 双留先例形·EXEC 期 +2 proof 预登越限臂沿常设预授权恰等步进·届时实测 scanned 取算）。
      // CAP-SANCTION-2439 UC-017 收官并线恰等步进：cap 2438→2439（2026-10-28 X17-ADV 孤儿任务对抗 NHP-017-ADV-01 收官并线·协调方 CAP-SANCTION-2439 sanction 恰等步进 +1·常设预授权「并线收官越限恰等步进免再询·四联动点+注记栈承登」随令行使·双亲各自合规（本支 40477910f 承 2436≤2438·main 7ea825ff9 承 2436≤2438·共享基 c06ed67b5=2433·并集净增不相交恰 +3+3）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2439>2438 红（真 EXIT=1 亲证·红停登记 f1f5488a7·Ban 就地再改 cap 停手上报）——union 实测 2439 恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2439 注记·本刀 PR 链 40477910f→e3edde87f→f1f5488a7→本步进 commit）——本 TC 四联动点 2_439/f-2439.md/:2440 恰等改。
      // CAP-SANCTION-2440 起草随刀恰等步进：cap 2439→2440（2026-10-26 UC-033 PERF_api 残格刀起草（总盘 P2 小刀·「UC-033 PERF_api（X10≠SLO）」·harness/uc33p-REQUEST.md）随刀·协调方派单预授权「越限沿常设预授权恰等步进」随令·+1 恰等零多放·本树届扫 2439=cap 恰等零余量（基线 docs:check EXIT=0 scanned 2439 亲证）+本卷 REQUEST 受管 1 件=2440 必超·EXEC 期 +1 proof 届值再步进预登=2441（REQUEST §2 门 1）·详 policy .mjs 链区 CAP-SANCTION-2440 注记·沿 2433 起草随刀单件恰等先例形·快速链·授权随令）——本 TC 四联动点 2_440/f-2440.md/:2441 恰等改。
      // CAP-SANCTION-2441 UC-030 收官并线恰等步进：cap 2439→2441（2026-10-28 长会话刷新对抗 NHP-030-ADV-01 收官并线·协调方收官令预 sanction「并线越限恰等步进免停报·CAP-SANCTION-24xx 承登注记+proof 四联动点恰等改+PTP 12/12 亲跑·链接本刀 PR」随令行使 +2（2439→2441）·届值如实采：merge 7f256d705=merge origin/main c8f8effff（#175 x17-adv 合卷已落·cap 届值承 2439=CAP-SANCTION-2439）·本支 98062574a 承 2438≤2439 合规·main 届值 c8f8effff 承 2439=cap 恰等（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2441>2439 红（真 EXIT=1 亲证）——union 实测 2441=main 届扫 2439+本支并入互斥受管目 2（harness/uc30-adv-REQUEST.md+apps/api/test/uc-e2e-030-nhp-adv.proof.ts·两集合无交叠·真跑收据 .log 非扫描扩展名不计）恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2441 注记·本刀 PR：line/uc30-draft→main（链 98062574a→7f256d705→本步进 commit 全链随 PR 首·号承 PR/merge ref）·沿 CAP-SANCTION-2439 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_441/f-2441.md/:2442 恰等改。
      // CAP-SANCTION-2440/2441 uc33p EXEC 立项并线届值取大承登：本支 2_440＜main 届值 2_441（两上行注记并留）→ 合并树取大恒 2_441·EXEC 期 +1 proof 届值沿常设预授权恰等步进 2_441→2_443（详 policy .mjs 链区 CAP-SANCTION-2440/2441 uc33p EXEC 注记·2026-10-26）。
      // CAP-SANCTION-2443 uc33p EXEC 落码面恰等步进：cap 2441→2443（2026-10-26 UC-033 PERF_api 残格刀 EXEC 落码+并线树终验·合并树实测 PTP_FILE_LIMIT:2442>2441 红亲证留痕·union 实测 2443 恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2443 注记）——本 TC 四联动点 2_443/f-2443.md/:2444 恰等改。
      // CAP-SANCTION-2442 isob 起草随刀恰等步进：cap 2441→2442（2026-10-26 GAP-E2E-ISO-BANNER-PG-RETAINED SOLE_STACK 命名语义收口任务书起草·总盘 #11·docs 钉刀·harness/isob-REQUEST.md·协调方派单预授权「越限沿常设预授权恰等步进预登」随令·+1 恰等零多放·本支树届扫 2441=cap 恰等零余量（基线 docs:check EXIT=0 scanned 2441 亲证）+本卷受管 1 件=2442 必超·详 policy .mjs 链区 CAP-SANCTION-2442 注记·沿 CAP-SANCTION-2429/2433 起草随刀先例形·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_442/f-2442.md/:2443 恰等改。
      // CAP-SANCTION-2442 UC3F 起草随刀恰等步进：cap 2441→2442（2026-10-26 UC-003 FAULT 残脸收口起草（总盘 P2 小刀 #4·UC-003 FAULT 格 `:114` blind 残·harness/uc3f-REQUEST.md）起草随刀·协调方派单常设预授权「越限沿常设预授权恰等步进预登」随令行使 +1 恰等零多放·本树届扫 2441=cap 2441 恰等零余量（docs:check EXIT=0 scanned 2441 起草前亲跑）+本卷 REQUEST 受管 1 件=2442 必越·起草 commit 即触·EXEC 面=纯双表登记零新受管文件→EXEC terminal=2442 零新增·详 policy .mjs 链区 CAP-SANCTION-2442 注记·沿 CAP-SANCTION-2433/X17-ADV-2438 起草随刀先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_442/f-2442.md/:2443 恰等改。
      // UC3F EXEC 立项并线取大承登（随 policy .mjs 链区同记·2026-10-26）：main 届值 2_445（CAP-SANCTION-2445·下注）＞本支 2_442（UC3F 起草链·上注）→合并树取大恒 2_445 零再步进·union 实测 2446=main 届扫 2445+本支并入互斥受管目 1（harness/uc3f-REQUEST.md·两集合无交叠）越限 +1→CAP-SANCTION-2446 恰等步进 2445→2446 随 UC3F EXEC commit 落（四联动点随行·本支原 2_442/f-2442.md/:2443 链注记史录并留上·语义不变强度不减）。
      // XREP 收官并线届值取大承登（随 policy .mjs 链区同记·2026-10-28 xrep 卷 post 双审双 PASS 会签后并线）：main 届值 2_438（#171 audit-log 起草链已并·上注）＞本支 2_436（XREP 起草链·上注）→ 合并树取大恒 2_438 零再步进·union 实测=main 届扫 2433+本支并入互斥受管目 2（harness/xrep-REQUEST.md+apps/api/test/sse-cross-replica.proof.ts·两集合无交叠）=2435≤2_438 零越限零多放·本 TC 四联动点 2_438/f-2438.md/:2439 取大零改（本支 2_436 链注记史录并留·PTP 12/12 对 2_438 行使）。
      // CAP-SANCTION-2443 XREP 并线 union 越限恰等步进：cap 2441→2443（2026-10-28 XREP 跨副本 SSE 槽/播双 OS 进程证明卷并线 PR #173（line/xrep-draft→main）·协调方续行令「cap 届值取大·union 越限沿常设预授权恰等步进 CAP-SANCTION-24xx 承登+四联动点+PTP 12/12」随令行使 +2（2441→2443）·届值如实采：merge 50217aeda=merge origin/main 2818c2522（#176 uc30 合卷已落·cap 届值承 2441=上注 CAP-SANCTION-2441·取大恒 2441 零再步进）·本支 dab570973 承 2435≤2438 合规·main 届值 2818c2522 承 2441=cap 恰等（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2443>2441 红（真 EXIT=1 亲证）——union 实测 2443=main 届扫 2441+本支并入互斥受管目 2（harness/xrep-REQUEST.md+apps/api/test/sse-cross-replica.proof.ts·两集合无交叠·真跑收据 .log 非扫描扩展名不计）恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2443 注记·本刀 PR：line/xrep-draft→main（链 dab570973→50217aeda→本步进 commit 全链随 PR 首·号承 PR/merge ref）·沿 CAP-SANCTION-2441 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_443/f-2443.md/:2444 恰等改。
      // CAP-SANCTION-2443 UC-015 FAULT EXEC 立项并线恰等步进：cap 2441→2443（2026-10-26 简历 OCR 管线故障注入 NHP-015-FAULT-01 EXEC 立项·常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令行使 +2（2441→2443）·届值如实采：merge 087a80809=merge origin/main 2818c2522（#176 uc30 合卷已落·cap 届值承 2441=CAP-SANCTION-2441·#177 在飞未落 main 如实采）·本支 fa4f99cdf 承 2437≤2438 合规（起草卷算式）·main 届值 2818c2522 承 2441=cap 恰等（双亲各自合规）·合并树立项终验亲跑 docs:check PTP_FILE_LIMIT:2442>2441 红（真 EXIT=1 亲证）——union 实测 2442=main 届扫 2441+本支并入互斥受管目 1（harness/uc15f-REQUEST.md）·EXEC 期 +1 proof 终态 2443 恰等零多放（真跑收据 .log 非扫描扩展名不计）·详 policy .mjs 链区 CAP-SANCTION-2443 注记·沿 CAP-SANCTION-2441 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_443/f-2443.md/:2444 恰等改。
      // CAP-SANCTION-2453 UC2B 起草步进：cap 2445→2453（2026-10-26 UC-002 HTTP 槽租约口 BOUND 孪生面+snapshot 专用口边界起草卷（总盘 #16·具名 NHP-002-HTTP-BOUND-01·harness/uc2b-REQUEST.md）·协调方派单常设预授权「越限沿先例步进承登」随令行使·+8 起草刀先例形沿 X16 2410→2418/XREP 2428→2436/X17 2430→2438 同形·届树亲跑 scanned 2445=cap 2445 恰等零余量+本卷 harness/uc2b-REQUEST.md 受管 1 件=2446 必超（EXEC 期 +1 proof=2447≤2453·余 6 在飞共享余量沿 cap 2152 先例形）·详 policy .mjs 链区 CAP-SANCTION-2453 注记）——本 TC 四联动点 2_453/f-2453.md/:2454 恰等改。
      // CAP-SANCTION-2445 XREP 二轮并线 union 越限恰等步进：cap 2443→2445（2026-10-28 XREP 跨副本 SSE 卷并线 PR #173 二轮并线（届值推移 #178 uc15f 已落）·常设预授权随令行使 +2（2443→2445）·届值如实采：merge fb350cff0=merge origin/main 91aca39bf（#178 uc15f 合卷已落·cap 届值承 2443=上注 CAP-SANCTION-2443 双注记并留·取大恒 2443 零再步进）·本支 8a661b483 承 2443=cap 恰等·main 届值 91aca39bf 承 2443=cap 恰等（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2445>2443 红（真 EXIT=1 亲证）——union 实测 2445=main 届扫 2443+本支并入互斥受管目 2（harness/xrep-REQUEST.md+apps/api/test/sse-cross-replica.proof.ts·两集合无交叠·真跑收据 .log 非扫描扩展名不计）恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2445 注记·本刀 PR：line/xrep-draft→main（链 …→b1a234dae→8a661b483→fb350cff0→本步进 commit 全链随 PR #173 首·号承 PR/merge ref）·沿 CAP-SANCTION-2443 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_445/f-2445.md/:2446 恰等改。
      // CAP-SANCTION-2446 isob EXEC 落卷并线 union 越限恰等步进：cap 2445→2446（2026-10-26 isob EXEC 落卷并线·fetch EXIT=0·届值如实采 origin/main 33fdd233c=#173（cap 届值承 2445=上注 CAP-SANCTION-2445）·merge f76e05751 dual-keep 双留恰 2 处冲突（号随 merge-tree 重排）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2446>2445 红（真 EXIT=1 亲证）——union 实测 2446=main 届扫 2445+本支并入互斥受管目 1（harness/isob-REQUEST.md·两集合无交叠）恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2446 注记·常设预授权随令行使·禁止按预登 2442/anticipated 2444 行使·届值如实采）——本 TC 四联动点 2_446/f-2446.md/:2447 恰等改。
      // CAP-SANCTION-2446 UC3F EXEC 并线 union 越限恰等步进：cap 2445→2446（2026-10-26 UC-003 FAULT 残脸收口 EXEC 立项并线·常设预授权随令行使 +1（2445→2446）·届值如实采：merge bffbb6c55=merge origin/main 33fdd233c（cap 届值承 2445=上注 CAP-SANCTION-2445）·本支 51984c36a 承 2_442≤2_445 合规·main 届值 33fdd233c 承 2445=cap 恰等（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2446>2445 红（真 EXIT=1 亲证）——union 实测 2446=main 届扫 2445+本支并入互斥受管目 1（harness/uc3f-REQUEST.md·两集合无交叠·EXEC 面=双表行内注记+落卷零新受管文件）恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2446 注记·沿 CAP-SANCTION-2445 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_446/f-2446.md/:2447 恰等改。
      // CAP-SANCTION-2447 isob 收官并线 union 越限恰等步进：cap 2446→2447（2026-10-26 GAP-E2E-ISO-BANNER-PG-RETAINED SOLE_STACK 命名语义收口卷 post 复审 PASS 后收官并线·常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令行使 +1（2446→2447）·届值如实采：merge 3e6c96db2=merge origin/main c99d003f1（#180 uc3f 合卷已落·cap 届值承 2446=上注 CAP-SANCTION-2446 双注记（isob+UC3F）三线同号并留·取大恒 2446 零再步进·恰 2 处冲突=两 policy 脚本注记区 dual-keep 双留·#177/#179 在飞未落 main 如实采）·本支 d239baf25 承 2446=cap 恰等·main 届值 c99d003f1 承 2446=cap 恰等（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2447>2446 红（真 EXIT=1 亲证）——union 实测 2447=main 届扫 2446+本支并入互斥受管目 1（harness/isob-REQUEST.md·两集合无交叠）恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2447 注记·沿 CAP-SANCTION-2446 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_447/f-2447.md/:2448 恰等改。
      // CAP-SANCTION-2448 r5mr 收官并线 union 越限恰等步进：cap 2447→2448（详 policy .mjs 链区 CAP-SANCTION-2448 注记·2026-10-28 r5mr 卷 post 双审席1+席2 双 PASS 会签后收官并线·常设预授权随令行使 +1 恰等零多放·届值如实采 merge 0b4cd14a9=merge origin/main af273901a（#181 isob 已落·cap 届值承 2447=isob CAP-SANCTION-2447·取大恒 2447 零再步进）·本支 970403fec 承 2446≤2447 合规·main 届值 af273901a 承 2447=cap 恰等（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2448>2447 红（真 EXIT=1 亲证）——union 实测 2448=main 届扫 2447+本支并入互斥受管目 1（harness/r5mr-REQUEST.md·两集合无交叠·真跑收据 .log 非扫描扩展名不计）恰等零多放·本刀 PR：line/r5mr-draft→main（链 …→970403fec→0b4cd14a9→本步进 commit 全链随 PR 首·号承 PR/merge ref）·沿 CAP-SANCTION-2447 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_448/f-2448.md/:2449 恰等改。
      // CAP-SANCTION-2450 uc33p 二轮并线 union 越限恰等步进：cap 2448→2450（2026-10-28 PR #179 二轮并线·届值推移至 origin/main 0f41af1c4=#182·常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令行使 +2（2448→2450）·届值如实采：merge 树承 main 2448=CAP-SANCTION-2448（r5mr 收官）＞本支 2443（uc33p EXEC·上注并留）→取大恒 2_448 零再步进·本支 39afdb8d4 承 2443≤2448 合规（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2450>2448 红（收敛前首轮 2456 冗计 +6=3 冲突件×stage 冗计沿 CAP-SANCTION-2430 同形坑如实承登）——union 实测 2450=main 届扫 2448+本支并入互斥受管目 2（harness/uc33p-REQUEST.md 起草件+apps/api/test/uc-e2e-033-nhp-perf-api.proof.ts EXEC 落码件·两集合无交叠·真跑收据 .log 非扫描扩展名不计）恰等零多放·沿 CAP-SANCTION-2448 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_450/f-2450.md/:2451 恰等改。
      // CAP-SANCTION-2450 UC-050 再并线 union 越限恰等步进：cap 2448→2450（详 policy .mjs 链区 CAP-SANCTION-2450 注记·2026-10-28 PR #177 落后 main 多轮后再并线·单方预授权「union 越限沿常设预授权恰等步进 CAP-SANCTION-24xx 承登+四联动点」随令行使 +2（2448→2450）恰等零多放·届值如实采 origin/main 0f41af1c4=#182·merge --no-ff 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留·cap 取大恒 2_448 零再步进·本支承 2443≤2448 合规·main 届值 0f41af1c4 承 2448=cap 恰等（双亲各自合规）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2450>2448 红（真 EXIT=1 亲证）——union 实测 2450=main 届扫 2448+本支并入互斥受管目 2（harness/uc50-REQUEST.md+apps/api/test/uc-e2e-050-nhp-start-bypass.proof.ts·两集合无交叠）恰等零多放·沿 CAP-SANCTION-2448 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_450/f-2450.md/:2451 恰等改。
      // CAP-SANCTION-2452 UC-050 二轮再并线 union 越限恰等步进：cap 2450→2452（详 policy .mjs 链区 CAP-SANCTION-2452 注记·2026-10-28 PR #177 二轮再并线·常设预授权随令行使 +2（2450→2452）恰等零多放·届值 origin/main d10723200=#179 uc33p 已并·cap 取大恒 2_450 零再步进·双亲各自 2450=cap 恰等·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2452>2450 红（真 EXIT=1 亲证）——union 实测 2452=main 届扫 2450+本支并入互斥受管目 2（harness/uc50-REQUEST.md+apps/api/test/uc-e2e-050-nhp-start-bypass.proof.ts·两集合无交叠）恰等零多放·沿 CAP-SANCTION-2450 并线先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_452/f-2452.md/:2453 恰等改。
      // CAP-SANCTION-2448 CWN 起草随刀恰等步进：cap 2447→2448（2026-10-26 C-WORD-NEG UC-018 follow-up 词面负例起草（总盘 #9 · P3 小刀 · NEG 臂设计 docs 起草卷 · harness/cwn-REQUEST.md）随刀·协调方派单含「cap 预算核」项·常设预授权「越限沿常设预授权恰等步进预登」随令·+1 恰等零多放·本支树届扫 2447=cap 2447 恰等零余量（基线 docs:check EXIT=0 scanned 2447 亲证）+本卷 harness/cwn-REQUEST.md 受管 1 件=2448 必超·沿 CAP-SANCTION-2442 isob 起草随刀单件恰等先例形·详 policy .mjs 链区 CAP-SANCTION-2448 注记·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_448/f-2448.md/:2449 恰等改。
      // CAP-SANCTION-2456 UC3M 起草随刀恰等步进：cap 2455→2456（2026-10-30 UC-003 NEG-01 收据 N1b 两缺位码映射任务书起草（总盘 #5·P2·gap-bug-backlog :953 兑现·harness/uc3m-REQUEST.md）随刀·协调方派单常设预授权「越限沿常设预授权恰等步进预登」随令行使 +1 恰等零多放·本树届扫 2455=cap 2455 恰等零余量（docs:check EXIT=0 scanned 2455 起草前亲跑）+本卷 REQUEST 受管 1 件=2456 必越·EXEC 期产品码面=既有文件行内补键零新受管文件（终态 2456 零新增）·在飞 evap/cwn 各承 2448 如实采·沿 CAP-SANCTION-2455 单件恰等先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_456/f-2456.md/:2457 恰等改。
      // CAP-SANCTION-2461 EVAP EXEC 立项 union 越限恰等步进：cap 2455→2461（2026-10-30 GAP-EVAL-PARSER-DETAILS-UNCLOSED 评测解析收口 EXEC 落码·fetch 届值 origin/main 3af835ad4=#183（cap 承 2455=CAP-SANCTION-2455）·EXEC 前 docs:check PTP_FILE_LIMIT:2456>2455 红亲证·union 实测 2460=main 届扫 2455+在飞互斥受管目 5（cwn@24ca62f73/uc3m@1b2f6ad0f/online-pay@fdaa1ecf0/uc31@112ac8af0/本卷 REQUEST 各 1）+EXEC +1 fixture=2461 恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2461 注记）——本 TC 四联动点 2_461/f-2461.md/:2462 恰等改（loop/atCap/overCap 三处）。
      const paths = [];
      for (let i = 0; i < 2_495; i += 1) {
        const relativePath = `ai-docs/f-${String(i).padStart(4, '0')}.md`;
        write(fixture, relativePath, 'ok');
        paths.push(relativePath);
      }
      const atCap = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: paths });
      assert.equal(atCap.valid, true, atCap.errors.join('\n'));
      assert.equal(atCap.scannedFiles, 2_495);
      // 超限错误码形状断言：第 2496 个注入路径触发早返回（先于读盘·免落盘可断言·随 CAP-SANCTION-2495 四联动点恰等改一并勘正与 :2496 同断言自洽）——
      // 错误串恰为 `PTP_FILE_LIMIT:2496`（`${CODE}:${n}` 形）·scannedFiles:0。
      // CAP-SANCTION-2488 UC31 EXEC 期新 proof 受管 +1 恰等步进：cap 2487→2488（详 policy .mjs 链区 CAP-SANCTION-2488 注记·2026-11-06 UC-031/032 结构面第一期 EXEC 行使（harness/uc31-REQUEST.md §1 件①④·pre-exec 双审 BOTH PASS+协调方 EXEC 授权）·apps/worker/test/uc-e2e-031-032-structure.proof.ts 新 proof 受管 +1·收据 receipts/uc31-032-structure/ 3 件实测 ∉ MANAGED_ROOTS 非扫描面不计（r2 算式示例不作硬数承兑·门3 union 取大重算为准）·本树终验亲跑 PTP_FILE_LIMIT:2488>2487 红（真 EXIT=1 亲证）——union 实测 2488=届值 2487+本刀 proof 1 恰等零多放·常设预授权随令行使·四联动点 2_488/f-2488.md/:2489 恰等改·沿 CAP-SANCTION-2487 先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_488/f-2488.md/:2489 恰等改。
      // XREP 收官并线取大承登：本 TC 四联动点随合并树 cap=2_438 行使（本支原 2_436/f-2436.md/:2437 链注记史录并留上·语义不变强度不减）。
      // UC3F EXEC 立项并线取大承登：本 TC 四联动点随合并树 cap=2_445 行使（本支原 2_442/f-2442.md/:2443 链注记史录并留上·语义不变强度不减）·CAP-SANCTION-2446 恰等步进 2445→2446 随本 EXEC commit 兑现（f-2446.md/:2447 联动）。
      // isob 收官并线取大承登：本 TC 四联动点随合并树 cap=2_446 行使（uc3f 链注记史录并留上·语义不变强度不减）·CAP-SANCTION-2447 恰等步进 2446→2447 随本收官步进 commit 兑现（f-2447.md/:2448 联动）。
      // r5mr 收官并线取大承登：本 TC 四联动点随合并树 cap=2_447 行使（isob/uc3f 链注记史录并留上·语义不变强度不减）·CAP-SANCTION-2448 恰等步进 2447→2448 随本收官步进 commit 兑现（f-2448.md/:2449 联动）。
      // uc33p 二轮并线取大承登：本 TC 四联动点随合并树 cap=2_448 行使（uc33p 原 2_443/f-2443.md/:2444 链注记史录并留上·语义不变强度不减）·CAP-SANCTION-2450 恰等步进 2448→2450 随本步进 commit 兑现（f-2450.md/:2451 联动）。
      // UC2B EXEC 立项并线取大承登：本 TC 四联动点随合并树 cap=2_453 行使（UC2B 起草链 CAP-SANCTION-2453 注记史录并留上·r5mr 合并树原 2_448/f-2448.md/:2449 链注记史录并留上·语义不变强度不减·取大恒 2_453 零再步进）。
      // UC2B post-fix 并线取大承登：本 TC 四联动点随合并树 cap=2_455 行使（UC2B 原 2_453/f-2453.md/:2454 链注记史录并留上·语义不变强度不减）·CAP-SANCTION-2455 恰等步进 2453→2455 随本 merge step 兑现（f-2455.md/:2456 联动）。
      // CWN 起草随刀取大承登：本 TC 四联动点随合并树 cap=2_447 行使（isob 链注记史录并留上·语义不变强度不减）·CAP-SANCTION-2448 恰等步进 2447→2448 随本起草 commit 兑现（f-2448.md/:2449 联动）。
      // CWN EXEC 立项并线取大承登：本 TC 四联动点随合并树 cap=2_456 行使（本支 cwn 原 2_448/f-2448.md/:2449 链注记史录并留上·CAP-SANCTION-2456 恰等步进 2455→2456 随本 merge step 兑现·f-2456.md/:2457 联动·语义不变强度不减）。
      // UC3M 起草链 CAP-SANCTION-2456 史录并留上（2455→2456·本 merge 取大 2_461 零再步进·语义不变强度不减）。
      // EVAP EXEC 立项取大承登：本 TC 四联动点随合并树 cap=2_461 行使（UC2B 链史录并留上·语义不变强度不减）·CAP-SANCTION-2461 恰等步进 2455→2461 随本 EXEC commit 兑现（f-2461.md/:2462 联动）。
      // CWN 收官并线取大承登：本 TC 四联动点随合并树 cap=2_461 行使（CWN 2456/EVAP 2461 链注记史录并留上·语义不变强度不减·cap 取大恒 2_461 零再步进）。
      // CAP-SANCTION-2463 QUIZDX nail 收官并线 union 越限恰等步进：cap 2461→2463（2026-10-30 quiz/diagnosis HTTP 级逐实体 SSE 流证明卷 post-prove 双席 BOTH PASS 会签后收官并线（GAP-SSEPUSH-QUIZ-DX-HTTP · harness/quizdx-REQUEST.md 卷）·fetch EXIT=0·届值如实采 origin/main 5c94266b1=#187 regw 合卷已落（cap 届值承 2461=CAP-SANCTION-2461）·rebase 零冲突（双 package.json additive 区 auto-merge）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2463>2461 红（真 EXIT=1 亲证）——union 实测 2463=main 届扫 2461+本支并入互斥受管目 2（harness/quizdx-REQUEST.md+apps/api/test/quizdx-sse-http.proof.ts·两集合无交叠·真跑收据 .log 非扫描扩展名不计）恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2463 注记·协调方常设预授权「并线期 union 越限沿常设预授权恰等步进」随令行使·在飞 nk1-draft 承 2462（4d97b9f83）未落 main 如实采·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_463/f-2463.md/:2464 恰等改。
      // CAP-SANCTION-2462 FLKWARM 起草随刀恰等步进：cap 2461→2462（2026-10-30 隐私授权证明暖库重跑夹具隔离任务书起草（GAP-PRIV-AUTHZ-PROVE-FLAKE 可选后续刀·harness/nk1-REQUEST.md）随刀·协调方派单常设预授权「越限沿常设预授权恰等步进预登」随令行使 +1 恰等零多放·本树届扫 2461=cap 2461 恰等零余量（docs:check EXIT=0 scanned 2461 起草前亲跑）+本卷 REQUEST 受管 1 件=2462 必超·EXEC 期既有单一 proof 文件行内改零新受管文件→EXEC terminal=2462 零新增·详 policy .mjs 链区 CAP-SANCTION-2462 注记·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_462/f-2462.md/:2463 恰等改。
      // CAP-SANCTION-2464 FLKWARM r1 重锚预登：2026-11-02 预执行双审回炉修订席（harness/nk1-REQUEST.md §10）·届 tip 已进 origin/main 2e808c9e3=#188 quizdx 已并（main 届扫 2463）·本树四联动点 2_462/f-2462.md/:2463 起草形保持（本行仅注记预登数值零改·PTP 12/12 本树亲跑）·rebase 对届时两 policy 脚本注记/cap 区恰 2 处冲突·dual-keep 取「main 的 2463 注记全保留（史录并留）+ 本支改写 2_464」沿 CAP-SANCTION-2461 CWN 收官并线先例形（详 policy .mjs 链区 CAP-SANCTION-2464 注记）——cap = main 届扫 2463 + 本卷 REQUEST 1 = 2464 恰等零多放（cap 随届值如实采=本卷附加钉唯一豁免项）——rebase 后本 TC 四联动点 2_464/f-2464.md/:2465 恰等改（loop/atCap/overCap 三处·语义不变强度不减）。
      // CAP-SANCTION-2464 台账勘误起草随刀恰等步进：cap 2463→2464（2026-11-02 台账同编号多行矛盾勘误+总控台账 R 号标签映射修正起草刀（docs-only 起草落卷即停·harness/led-REQUEST.md）随刀·协调方派单「本卷 REQUEST +1 ⇒ CAP-SANCTION 届值步进（沿 nk1 预登形）」随令行使 +1 恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2464 注记·本树届扫 2463=cap 2463 恰等零余量起草前亲跑+本卷 REQUEST 受管 1 件=2464 必超·EXEC 期零新受管文件·在飞 nk1-draft 249ec97db 承 2464 同值未落 main 如实采·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_464/f-2464.md/:2465 恰等改。
      // CAP-SANCTION-2465 台账勘误 EXEC 先手步进：cap 2464→2465（详 policy .mjs 链区 CAP-SANCTION-2465 注记·2026-11-03 台账勘误 EXEC 行使（harness/led-REQUEST.md §2 勘误面·pre-exec 双审 r1 两席 BOTH PASS+协调方明示授权后随令行使）·rebase 对届 tip da1dae1de=#189 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（号随 merge-tree 重排）·union 算式=main 届扫 2464+本卷 REQUEST 1=2465 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使·在飞如实采按届重枚举：sse2-draft 7144da5fe 承 2465 同值未落 main 如实采（其余在飞树详 policy .mjs 链区同注记）·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_465/f-2465.md/:2466 恰等改。
      // CAP-SANCTION-2471 HA1 队列索引 EXEC 终态恰等步进：cap 2464→2471（2026-11-02 队列 status/lease 前导索引 + gauge 聚合改形 EXEC 落码（pre dual r7 BOTH PASS 放行·协调方 EXEC 授权·harness/ha1-REQUEST.md rev r6 卷）·fetch EXIT=0·rebase origin/main da1dae1de=#189 nk1 已并零冲突（main 侧 CAP-SANCTION-2463/2464 注记史录并留上）·union 实测 2465=main 届扫 2464+本卷 REQUEST 1（rebase 后 docs:check PTP_FILE_LIMIT:2465>2464 红亲证）+EXEC 净增 6（5 迁移 sql+1 proof ts·真跑收据 .log 非扫描扩展名不计）=2471 恰等零多放·详 policy .mjs 链区 CAP-SANCTION-2471 注记·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_471/f-2471.md/:2472 恰等改。
      // CAP-SANCTION-2472 HA1 队列索引 nail 收官并线 union 越限恰等步进：cap 2465→2472（详 policy .mjs 链区 CAP-SANCTION-2472 注记·2026-11-03 ha1-REQUEST.md 卷 post-prove 复审双席 BOTH PASS 会签后收官并线（B31 换形后补跑 45/45）·届值如实采 origin/main 4751aab28=#190 led 已并（main 届扫 2465=cap 2465 恰等·detached worktree docs:check EXIT=0 scanned 2465 亲证）·rebase 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（号随 merge-tree 重排）·合并树终验亲跑 docs:check PTP_FILE_LIMIT:2472>2471 红（真 EXIT=1 亲证）——union 实测 2472=main 届扫 2465+本支并入互斥受管目 7（harness/ha1-REQUEST.md+五迁移 sql 0220-0224+job-queue-index.proof.ts·两集合无交叠·真跑收据 .log 非扫描扩展名不计）恰等零多放·协调方常设预授权「并线期 union 越限沿常设预授权恰等步进」随令行使 +7（沿 CAP-SANCTION-2463 QUIZDX nail 收官并线先例形）·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_472/f-2472.md/:2473 恰等改。
      // CAP-SANCTION-2473 SSE2 起草随刀并线恰等步进：cap 2472→2473（详 policy .mjs 链区 CAP-SANCTION-2473 注记·2026-11-03 SSE 双卷覆盖盲区收口断言刀起草（regw 残面④~⑦+RW-3-0 · quizdx 盲区①②③+归因口径 · harness/sse2-REQUEST.md 卷）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main e647fcffa=#191 ha1 已并（main 届扫 2472=cap 2472 恰等·detached worktree docs:check EXIT=0 scanned 2472 亲证）·rebase 对届恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（main 侧 2464/2465/2471/2472 四注记史录全保留+本支 SSE2 注记改写 2473·号随 merge-tree 重排·沿 CAP-SANCTION-2464 FLKWARM r1 重锚先例形）——union 算式=main 届扫 2472+本卷 REQUEST 受管 1 件=2473 恰等零多放·EXEC 期既有两 proof 行内增断言零新受管文件→terminal 2473 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_473/f-2473.md/:2474 恰等改。
      // CAP-SANCTION-2474 批量翻面 EXEC 并线恰等步进：cap 2473→2474（详 policy .mjs 链区 CAP-SANCTION-2474 注记·2026-11-03 backlog 翻面候选行状态批量翻面刀 EXEC 行使（docs-only 翻面行使·E2EA-02 销案终翻/E2EA-05 残面窄化/L-06 CLOSED 三条 additive 翻面注·harness/flip-REQUEST.md·pre-exec 双审 r1 两席 BOTH PASS+协调方明示 EXEC 授权后随令行使）·届值如实采 origin/main 36740147b=#192 sse2 已并（main 届扫 2473=cap 2473 恰等）·rebase 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（main 侧 2464/2465/2471/2472/2473 五注记史录全保留+本支批量翻面注记改写 2474·号随 merge-tree 重排·沿 CAP-SANCTION-2473 SSE2 起草先例形）——union 算式=main 届扫 2473+本卷 REQUEST 受管 1 件=2474 恰等零多放·EXEC 期=既有 backlog 行 in-place additive 翻面注零新受管文件→terminal 2474 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_474/f-2474.md/:2475 恰等改。
      // CAP-SANCTION-2475 STATUS-RECON EXEC 并线恰等步进：cap 2474→2475（详 policy .mjs 链区 CAP-SANCTION-2475 注记·2026-11-03 harness REQUEST 状态对账刀 EXEC 行使（docs-only 翻面行使·executed 131 卷分四批 in-place additive 翻面注·harness/rc-REQUEST.md rev r2 卷·pre-exec 双审 r2 两席 BOTH PASS+协调方裁定 131 明示 EXEC 授权后随令行使）·届值如实采 origin/main b66e113f8=#193 flip 已并（main 届扫 2474=cap 2474 恰等）·rebase 零 git 冲突（本支仅触 harness/rc-REQUEST.md 一件·main 侧六注记史录全保留+本支 2475 注记 additive 落此）——union 算式=main 届扫 2474+本卷 REQUEST 受管 1 件=2475 恰等零多放·EXEC 期=既有 harness 卷 Status 行 in-place additive 翻面注零新受管文件→terminal 2475 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_475/f-2475.md/:2476 恰等改。
      // CAP-SANCTION-2476 STATUS-RECON rev r3 起草随刀恰等步进：cap 2475→2476（详 policy .mjs 链区 CAP-SANCTION-2476 注记·2026-11-03 harness REQUEST 状态对账刀 rev r3 修订落卷（提取器落为受管脚本 scripts/ai-docs/request-status-recon.mjs 起草随刀·harness/rc-REQUEST.md rev r3 卷·dual r3 复核位保留）·本树届扫 2475=cap 2475 恰等零余量（docs:check EXIT=0 scanned 2475 起草前亲跑）+本卷受管 1 件=2476 必超（PTP_FILE_LIMIT:2476>2475 红真 EXIT=1 亲证）——EXEC 期=既有 harness 卷 Status 行 in-place 行尾 additive 翻面注零新受管文件→terminal 2476 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_476/f-2476.md/:2477 恰等改。
      // CAP-SANCTION-2474 DRAFT-FLIP 批量关闭刀起草随刀恰等步进：cap 2473→2474（详 policy .mjs 链区 CAP-SANCTION-2474 注记·2026-11-03 draft 族批量关闭刀起草（15 卷静止 draft 关闭注起草·docs-only 起草落卷即停 · harness/df-REQUEST.md 卷）随刀·协调方派单含 cap 项「本卷 REQUEST +1 ⇒ CAP-SANCTION-2474 预登（随届值如实采）」随令行使 +1 恰等零多放·届值如实采 origin/main 36740147b=#192 sse2 已并（main 届扫 2473=cap 2473 恰等·worktree docs:check EXIT=0 scanned 2473 亲证）·在飞如实列三方竞争按合并序逐个恰等步进：flip-draft f9ffc4973 承 2474 已 EXEC 待 post 未落 main+rc-draft b53e4ccd7 承 2473 将步 2474 未落 main（并线期 union 沿常设预授权届时重算承登·同触两 policy 脚本=已知共享热面 dual-keep 先例形）——union 算式=main 届扫 2473+本卷 REQUEST 受管 1 件=2474 恰等零多放·EXEC 期 15 卷 in-place additive 关闭注零新受管文件→terminal 2474 零新增·PTP 12/12 亲跑·沿 nk1/flip/sse2 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_474/f-2474.md/:2475 恰等改。
      // CAP-SANCTION-2475 DRAFT-FLIP 关闭行使 EXEC 并线 union 越限恰等步进：cap 2474→2475（详 policy .mjs 链区 CAP-SANCTION-2475 注记·2026-11-03 draft 族批量关闭刀 EXEC 行使（15 卷卷尾 additive 关闭注行使·docs-only·harness/df-REQUEST.md 卷·pre-exec 双审 r4 两席 BOTH PASS+协调方明示 EXEC 授权后随令行使）·届值如实采 origin/main b66e113f8=#193 flip-draft 已并（main 届扫 2474=cap 2474 恰等·rebase 后本树 docs:check 亲跑 PTP_FILE_LIMIT:2475>2474 红 union 真亲证）·rebase 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（main 侧批量翻面 2474+本支 DRAFT-FLIP 起草 2474 两注记并留·号随 merge-tree 重排·沿 CAP-SANCTION-2473 SSE2 起草先例形）——union 算式=main 届扫 2474+本卷 REQUEST 受管 1 件=2475 恰等零多放·EXEC 期 15 卷卷尾 additive 关闭注+本卷 §9/状态三处全 in-place 零新受管文件→terminal 2475 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_475/f-2475.md/:2476 恰等改。
      // CAP-SANCTION-2477 DRAFT-FLIP 关闭行使 PR 期并线 union 越限恰等步进：cap 2476→2477（详 policy .mjs 链区 CAP-SANCTION-2477 注记·2026-11-03 draft 族批量关闭刀 PR 合并窗并线（15 卷卷尾 additive 关闭注行使+post-prove 双席 BOTH PASS 落卷·docs-only·harness/df-REQUEST.md 卷·首推 PR #195 后 CI verify 窗口内 origin/main 前进→merge 撞真冲突）·届值如实采 origin/main 82b0cd4ee=#194 rc-draft 已并（main 届扫 2476=cap 2476 恰等=CAP-SANCTION-2476 STATUS-RECON rev r3 承值）·rebase 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（main 侧 2474 批量翻面+2475/2476 STATUS-RECON 注记史录全保留+本支 df 2474 起草/2475 EXEC 注记并留·号随 merge-tree 重排·沿 CAP-SANCTION-2472 HA1 收官并线先例形）——union 实测 2477=main 届扫 2476+本卷 harness/df-REQUEST.md 受管 1 件恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +1（2476→2477）·EXEC 期 15 卷卷尾 additive 关闭注+本卷记录全 in-place 零新受管文件→terminal 2477 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_477/f-2477.md/:2478 恰等改。
      // CAP-SANCTION-2475 勘误扫尾起草随刀恰等步进：cap 2474→2475（详 policy .mjs 链区 CAP-SANCTION-2475 注记·2026-11-03 六刀 nail 期/双审期累积登记面 P2/P3 勘误扫尾刀起草（ha1/flip/led 三卷 §9 append 勘误注+sse2 收据 .log 勘误件+SHA 分注纪律登记+rc 卷四子项勘误预登移交·harness/err-REQUEST.md 卷）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main b66e113f8=#193 flip 已并（main 届扫 2474=cap 2474 恰等·detached worktree docs:check EXIT=0 scanned 2474 亲证）·在飞如实采按届重枚举：rc-draft be17eceb8 承 2_476 未落 main 不预采（并线期 union 届时重算承登）·EXEC 期=三卷 §9 in-place append+既有收据目录新 .log 勘误件（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2475 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_475/f-2475.md/:2476 恰等改。
      // CAP-SANCTION-2478 ERRATA-SWEEP rev r1 终修收官并线 union 越限恰等步进：cap 2477→2478（详 policy .mjs 链区 CAP-SANCTION-2478 注记·2026-11-03 六刀累积登记面勘误扫尾刀 rev r1 扫尾终修+收官追加（ha1/flip/led 三卷 §9 append 勘误注行使+sse2 收据 .log 勘误件落卷·harness/err-REQUEST.md rev r1 卷·协调方派单「err rev r1 扫尾终修+收官追加」随令行使）·届值如实采 origin/main 0d20d8f21=#195 df-draft 已并（main 届扫 2477=cap 2477 恰等=CAP-SANCTION-2477 DRAFT-FLIP PR 期承值）·rebase 恰 2 处冲突=两 policy 脚本注记/cap 区 dual-keep 双留（main 侧 2474 批量翻面+2475/2476 STATUS-RECON+2474 DRAFT-FLIP 起草+2475 DRAFT-FLIP EXEC+2477 DRAFT-FLIP PR 期五注记史录全保留+本支勘误扫尾起草 2475 注记并留·号随 merge-tree 重排·沿 CAP-SANCTION-2477 DRAFT-FLIP PR 期先例形）——union 算式=main 届扫 2477+本卷 harness/err-REQUEST.md 受管 1 件=2478 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +1（2477→2478）·EXEC 期=ha1/flip/led 三卷 §9 in-place append 勘误注+既有收据目录新 .log 勘误件（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2478 零新增·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_478/f-2478.md/:2479 恰等改。
      // CAP-SANCTION-2479 L-13 起草随刀恰等步进：cap 2478→2479（详 policy .mjs 链区 CAP-SANCTION-2479 注记·2026-11-03 静态库存勘误+老 proof 静面更新刀起草（UC-E2E-028 老 prove 绊线静态处置·E1=harness/uc-e2e-028-trace-ledger-fail-open.md 新增 §5 勘误注+E2=eval 面卷尾时点勘误注·两既有 .md 卷尾 additive·docs-only 起草落卷即停 · harness/l13-REQUEST.md 卷）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main 8c8119d0c=#196 err-draft 已并（main 届扫 2478=cap 2478 恰等·worktree docs:check EXIT=0 scanned 2478 起草前亲跑）+本卷 REQUEST 受管 1 件=2479 必超·EXEC 期两既有 .md in-place 卷尾 additive+收据 .log（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2479 零新增·在飞如实采按届枚举（df/rc/flip/err 已并·ag20/loadw/pay/scoringeval/uc011adv/uc31 ahead=1 两 policy 零触·ag18/cap-2272 ancient 分叉不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_479/f-2479.md/:2480 恰等改。
      // CAP-SANCTION-2480 FIN 台账收官起草随刀恰等步进：cap 2479→2480（详 policy .mjs 链区 CAP-SANCTION-2480 注记·2026-11-05 meetwise 台账收官刀起草+行使随令同卷（U5a/U5b/U5c/U6/U7/U8/U10 七项+G7K 勘误·harness/fin-REQUEST.md 卷·协调方终裁授权「除买云外全部完结」随令行使）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main `edda65a44`=#198 l13-draft 已并（main 届扫 2479=cap 2479 恰等·fin worktree docs:check EXIT=0 scanned 2479 起草前亲跑）+本卷 REQUEST 受管 1 件=2480 必超·EXEC 期既有 .md in-place append 零新受管文件→terminal 2480 零新增·在飞如实采按届枚举（df/rc/flip/err/l13/audit/uc011adv 七支已并消·g7w-draft 未并两 policy 热面如实列·ag20/loadw/pay/scoringeval/uc31 ahead=1 两 policy 零触·campaign-state 含 .tmp 面如实注·ag18/cap-2272 ancient 分叉不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/l13/err 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_480/f-2480.md/:2481 恰等改。
      // CAP-SANCTION-2480 R2-RECEIPT-GATE 起草随刀恰等步进：cap 2479→2480（详 policy .mjs 链区 CAP-SANCTION-2480 注记·2026-11-05 runner 域收据门修复刀起草（G7 账本簿记行混入收据 calls⇒绿 run 收据写盘必炸 EXIT 翻 1·EXEC 期 runner loadG7ReceiptFromLedger 读入循环 additive +8/−0·收据契约零触·harness/r2-receipt-gate-REQUEST.md 卷·案 A 卷 g7w-tail-seg-emit-REQUEST.md :237 §9-LIVE ⑦ 立项行使·docs-only 起草落卷即停）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main edda65a44=#198 l13 已并（main 届扫 2479=cap 2479 恰等·worktree docs:check EXIT=0 scanned 2479 起草前亲跑）+本卷 REQUEST 受管 1 件=2480 必超·EXEC 期 runner 既有件 in-place additive+收据 .log（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2480 零新增·在飞如实采按届枚举（fin-draft 2a4b09f22 承 2480/g7w-draft 86af8b34b 承 2481 同触两 policy 热面 dual-keep 先例形·ag20/loadw/pay/scoringeval/uc31 ahead=1 两 policy 零触·ag18/cap-2272 ancient 不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_480/f-2480.md/:2481 恰等改。
      // CAP-SANCTION-2481 R2-RECEIPT-GATE EXEC 并线 union 越限恰等步进：cap 2480→2481（详 policy .mjs 链区 CAP-SANCTION-2481 注记·2026-11-05 runner 域收据门修复刀 EXEC 行使+rebase 并线（G7 账本簿记行混入收据 calls⇒绿 run 收据写盘必炸 EXIT 翻 1·EXEC 期 runner loadG7ReceiptFromLedger 读入循环 additive +7/−0·收据契约零触·harness/r2-receipt-gate-REQUEST.md 卷·协调方派单令 EXEC 授权+pre-exec dual 双审 BOTH PASS 在卷）·fetch EXIT=0·届值如实采 origin/main 09fe2a23d=#199 fin-draft 已并（main 届扫 2480=cap 2480 恰等·detached worktree docs:check EXIT=0 scanned 2480 届核亲跑）·rebase 冲突=两 policy 脚本 3 处冲突块均在注记/注释行（数值行双侧同改自动归并）dual-keep 双留（main 侧 CAP-SANCTION-2480 FIN 注记史录全保留+本支起草 2480 注记并留·号随 merge-tree 重排）——union 算式=main 届扫 2480+本卷 harness/r2-receipt-gate-REQUEST.md 受管 1 件=2481 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +1（2480→2481）·EXEC 期 runner 既有件 in-place additive+收据 .log（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2481 零新增·在飞如实采按届枚举（idu-draft 承 2480/g7w-draft 承 2481 未并两 policy 热面如实列·ag20/loadw/pay/scoringeval/uc31 ahead=1 两 policy 零触·ag18/cap-2272 ancient 不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_481/f-2481.md/:2482 恰等改。
      // CAP-SANCTION-2480 ISO-DOTENV-UI 起草随刀恰等步进：cap 2479→2480（详 policy .mjs 链区 CAP-SANCTION-2480 注记·2026-11-05 窗2 worker 红 ISO-DOTENV-ISOLATION UI 线移植修复刀起草（scripts/run-e2e-ui.mjs:27 移植 run-e2e.mjs:20-22 先例形+同文注释·runner 测试基建面零产品码·harness/iso-dotenv-ui-REQUEST.md 卷）·协调方派单 §3「cap 预登（main 届扫 2479+1=2480·随届值如实采）」随令行使 +1 恰等零多放·本树届扫 2479=cap 2479 恰等零余量（docs:check EXIT=0 scanned 2479 起草前亲跑）+本卷 REQUEST 受管 1 件=2480 必超·起草 commit 即触·EXEC 期=既有 runner 单文件零新受管文件（真跑收据 .log ∉TEXT_EXTENSIONS 不计）→terminal 2480 零新增·在飞如实采（派单点名三支）：g7w-draft 承 2_481（ahead 2·两 policy 触面）/fin-draft 承 2_480（ahead 1·两 policy 触面）/r2-draft 承 2479（ahead 0 tip=origin/main 同值零触）——g7w/fin 已各超本卷预登值·并线 union 沿常设预授权届时取大重算承登·PTP 12/12 亲跑·沿 nk1/l13/led 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_480/f-2480.md/:2481 恰等改。
      // CAP-SANCTION-2482 ISO-DOTENV-UI EXEC 并线 union 越限恰等步进：cap 2481→2482（详 policy .mjs 链区 CAP-SANCTION-2482 注记·2026-11-05 窗2 worker 红 ISO-DOTENV-ISOLATION UI 线移植修复刀 EXEC 行使+nail 期 rebase 并线（scripts/run-e2e-ui.mjs:27 移植 run-e2e.mjs:20-22 先例形·isolated 形一律跳仓根 .env 回灌·runner 测试基建面零产品码·harness/iso-dotenv-ui-REQUEST.md 卷）·fetch EXIT=0·届值如实采 origin/main fde38e6b5=#201 已并（main 届扫 2481=cap 2481 恰等·docs:check EXIT=0 scanned 2481 届核亲跑）·rebase 冲突=两 policy 脚本 4 处冲突块均在注记/注释行+数值行 dual-keep 双留（main 侧 CAP-SANCTION-2480 FIN+CAP-SANCTION-2480 起草/CAP-SANCTION-2481 R2 EXEC 注记史录全保留+本支起草 2480 注记并留）——union 算式=main 届扫 2481+本卷 harness/iso-dotenv-ui-REQUEST.md 受管 1 件=2482 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +1（2481→2482）·EXEC 期 runner 既有件 in-place additive+B/C 臂收据 .log（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2482 零新增·在飞如实采按届枚举（g7w-draft 未落 main 两 policy 热面如实列·ag20/loadw/pay/scoringeval/uc31 ahead=1 两 policy 零触·ag18/cap-2272 ancient 不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_482/f-2482.md/:2483 恰等改。
      // CAP-SANCTION-2481 G7W 尾障双刀起草随刀恰等步进：cap 2479→2481（详 policy .mjs 链区 CAP-SANCTION-2481 注记·2026-11-05 G7W-TAIL-DEATH 收口刀+GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门二行使刀两卷起草（harness/g7w-tail-close-REQUEST.md+harness/g7w-qgen-reverify-REQUEST.md 两卷·docs-only 起草落卷即停）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使·派单预登「+1=2480」系单卷估式·两刀分开两卷受管 2 件如实采 +2=2481 恰等零多放（随届值如实采条款行使·如实登记）·届值如实采 origin/main edda65a44=#198 l13-draft 已并（main 届扫 2479=cap 2479 恰等·detached worktree docs:check EXIT=0 scanned 2479 起草前亲跑）+本波两卷 2 件=2481 必超·EXEC 期=tail-close 面② backlog in-place append+qgen 收据 .log（∉TEXT_EXTENSIONS 不计·若落受管扩展名沿常设预授权届时恰等步进重算承登）零新受管文件→terminal 2481 零新增·在飞如实采按届枚举（ag20/loadw/pay/scoringeval/uc31 各 ahead=1 两 policy 零触·audit-log/df/err/fin/l13/rc/uc011adv 已并·ag18/cap-2272/campaign-state/worker-hang-guard/delete-preview-site ancient 分叉或 legacy-chore 不同窗不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 l13 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_481/f-2481.md/:2482 恰等改。
      // CAP-SANCTION-2484 G7W 尾障双刀 nail 期并线 union 越限恰等步进：cap 2482→2484（详 policy .mjs 链区 CAP-SANCTION-2484 注记·2026-11-05 G7W-TAIL-DEATH 收口刀+GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门二行使刀 nail 期 rebase 并线（harness/g7w-tail-close-REQUEST.md+harness/g7w-qgen-reverify-REQUEST.md 两卷·pre-exec dual+post-prove dual BOTH PASS 在卷·协调方 nail 授权）·fetch EXIT=0·届值如实采 origin/main 70dfd74b4=#203 已并（main 届扫 2482=cap 2482 恰等·docs:check EXIT=0 scanned 2482 届核亲跑）·rebase 冲突=两 policy 脚本 4 处冲突块均在注记/注释行+数值行 dual-keep 双留（main 侧 CAP-SANCTION-2480 FIN+R2 起草+R2 EXEC+IDU 起草+IDU EXEC 注记史录全保留+本支 2481 G7W 起草注并留）——union 算式=main 届扫 2482+本波两卷受管 2 件=2484 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +2（2482→2484）·EXEC 期=既有 .md in-place append+收据 .log（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2484 零新增·在飞如实采按届枚举（perf-draft 承 2_481 两 policy 热面/pay/scoringeval/uc31 ahead=1 零触/ag20+loadw ref 已撤如实注/ag18/cap-2272 ancient 不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_484/f-2484.md/:2485 恰等改。
      // CAP-SANCTION-2485 ERRATA-SESSION-1105 总刀起草随刀恰等步进：cap 2484→2485（详 policy .mjs 链区 CAP-SANCTION-2485 注记·2026-11-05 会话勘误总刀收编起草卷（本会话全部已登记勘误+协调方裁断九项行使·harness/errata-session-1105-REQUEST.md 卷·docs-only 起草落卷即停·协调方派单「收编本会话全部已登记勘误+协调方裁断」随令）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main fd2b74635=#205 g7w-status-pin 已并（main 届扫 2484=cap 2484 恰等·worktree meetwise-errata docs:check EXIT=0 scanned 2484 起草前亲跑）+本卷 REQUEST 受管 1 件=2485 必超·EXEC 期=既有 .md in-place/行区/文件尾 append+收据 .log（∉TEXT_EXTENSIONS 不计）零新受管文件→terminal 2485 零新增·在飞如实采按届枚举（perf-draft 9b24a1936 承 2_481 两 policy 热面/pay/scoringeval/uc31 各 ahead=1 零触·四支 merge-base EXIT≠0 亲跑·ag20+loadw ref 已撤如实注/ag18/cap-2272 ancient 不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_485/f-2485.md/:2486 恰等改。
      // CAP-SANCTION-2481 ISO-DOTENV-PERF 起草随刀恰等步进：cap 2480→2481（详 policy .mjs 链区 CAP-SANCTION-2481 注记·2026-11-05 perf runner isolated 形跳仓根 .env 回灌守卫移植刀起草（ISO-DOTENV-ISOLATION→ISO-DOTENV-UI 承登后继第三 runner·run-performance-e2e.mjs :24 回灌守卫增 env.E2E_ISOLATED !== '1' 判·本 runner 无 E2E_SKIP_DOTENV 钩取先例唯一翻转格最小移植·harness/perf-iso-dotenv-REQUEST.md 卷）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main `09fe2a23d`=#199 fin-draft 已并（main 届扫 2480=cap 2480 恰等·worktree docs:check EXIT=0 scanned 2480 起草前亲跑）+本卷 REQUEST 受管 1 件=2481 必超·EXEC 期=既有 runner 单文件零新受管文件→terminal 2481 零新增·在飞如实采按届枚举（idu-draft `0aac6a4c4` 承 2_480/g7w-draft `86af8b34b` 承 2_481/r2-draft `185b0b39c` 承 2_481 三支未落 main·同触两 policy 脚本热面 dual-keep 先例形·union 届时取大重算承登·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/l13/fin 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_481/f-2481.md/:2482 恰等改。
      // CAP-SANCTION-2485 ISO-DOTENV-PERF EXEC 并线 union 越限恰等步进：cap 2484→2485（详 policy .mjs 链区 CAP-SANCTION-2485 注记·2026-11-05 perf runner isolated 形跳仓根 .env 回灌守卫移植刀 EXEC 行使+nail 期 rebase 并线（harness/perf-iso-dotenv-REQUEST.md 卷·pre-exec dual 双审 BOTH PASS 在卷·协调方派单令 EXEC 授权随令行使）·fetch EXIT=0·届值如实采 origin/main fd2b74635=#205 已并（main 届扫 2484=cap 2484 恰等·本刀 union 红亲证 2485>2484=+1 恰等反证）·rebase 冲突=两 policy 脚本 4 处冲突块均在注记/注释行+数值行 dual-keep 双留（main 侧 CAP-SANCTION-2480 FIN+R2 起草+R2 EXEC+IDU 起草+IDU EXEC+G7W 起草+G7W nail 注记史录全保留+本支 2481 ISO-DOTENV-PERF 起草注并留·号随 merge-tree 重排）·合并树 docs:check 亲跑 PTP_FILE_LIMIT:2485>2484 红真 EXIT=1 亲证（首轮未收敛实测 2489 冗计 +4=2 冲突件×3 stage 沿 CAP-SANCTION-2418 同形坑如实承登·git add 收敛后终验 2485）——union 算式=main 届扫 2484+本卷 harness/perf-iso-dotenv-REQUEST.md 受管 1 件=2485 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +1（2484→2485）·EXEC 期=既有 runner 单文件零新受管文件+B 臂 boot 收据 .log（∉TEXT_EXTENSIONS 不计）→terminal 2485 零新增·在飞如实采按届枚举（pay/scoringeval/uc31 各 ahead=1 两 policy 零触·idu/g7w/r2 均已并出名单·ag20/loadw ref 已撤如实注·ancient 分叉不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_485/f-2485.md/:2486 恰等改。
      // CAP-SANCTION-2486 ISO-DOTENV-PERF EXEC nail 期并线 union 越限恰等步进：cap 2485→2486（详 policy .mjs 链区 CAP-SANCTION-2486 注记·2026-11-05 perf runner isolated 形跳仓根 .env 回灌守卫移植刀 EXEC 行使+nail 期 rebase 并线（harness/perf-iso-dotenv-REQUEST.md 卷·pre-exec dual r1-r3 两独立外席 BOTH PASS+post-prove dual BOTH PASS 在卷·协调方 nail 授权随令行使）·fetch EXIT=0·届值如实采 origin/main fcbccea40=#207 errata-status-pin 已并（main 届扫 2485=cap 2485 恰等=CAP-SANCTION-2485 ERRATA 承值·docs:check EXIT=0 scanned 2485 届核亲跑）·本支预登 CAP-SANCTION-2485（届值 fd2b74635 扫 2484·+1=2485）系并线前预登·届值 ERRATA 刀进位后实际落点 union=2486>2485 红如实重算承登（预登注史录保留零洗）·rebase 冲突=两 policy 脚本各 1 处冲突块均在注记/注释行（数值行双侧同值自动归并后随本注恰等改）dual-keep 双留（main 侧 CAP-SANCTION-2485 ERRATA 注史录全保留+本支 CAP-SANCTION-2481 起草注+CAP-SANCTION-2485 EXEC 预登注并留·号随 merge-tree 重排·沿 CAP-SANCTION-2484 G7W nail 并线 dual-keep 先例形）——union 算式=main 届扫 2485+本卷 harness/perf-iso-dotenv-REQUEST.md 受管 1 件=2486 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +1（2485→2486）·EXEC 期=既有 runner 单文件零新受管文件+收据 .log（∉TEXT_EXTENSIONS 不计）→terminal 2486 零新增·在飞如实采按届枚举（s3caps-draft `96ad5d679` 承 2_485 ahead=3 merge-base fd2b74635 两 policy 热面·并线期 union 届时重算承登/pay `fdaa1ecf0`/uc31 `112ac8af0` 各 ahead=1 两 policy 零触/scoringeval 树撤+分支删（blob fc861681 经 F9 收编已在 main）如实注/ag20+loadw ref 已撤如实注/ancient 分叉不预采·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w/errata 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_486/f-2486.md/:2487 恰等改。
      // CAP-SANCTION-2487 ONLINE-PAY rev r2 修订随刀恰等步进：cap 2486→2487（详 policy .mjs 链区 CAP-SANCTION-2487 注记·2026-11-05 commerce online-pay REQUEST rev r2 修订落卷（viability 双审席2 成立项消化·docs-only 零码·harness/online-pay-REQUEST.md 卷·协调方派单「rev r2」随令）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main 92a82a944=#209 perf-status-pin 已并（main 届扫 2486=cap 2486 恰等=CAP-SANCTION-2486 ISO-DOTENV-PERF EXEC nail 承值·rebase 零冲突·rebase 后本树 docs:check 亲跑 PTP_FILE_LIMIT:2487>2486 红真 EXIT=1 亲证）——union 算式=main 届扫 2486+本卷 harness/online-pay-REQUEST.md 受管 1 件=2487 恰等零多放·EXEC 期=既有 .md in-place 修订零新受管文件→terminal 2487 零新增·在飞同号竞争如实列：s3caps-draft `2cfdade94` ahead=4 merge-base 92a82a944=届 tip 两 policy 热面同承 2487/uc31-rev `17195e4d4` ahead=1 merge-base fcbccea40=#207 两 policy 热面承 2486 届值进位后落点同 2487（uc31-draft `112ac8af0` 系前线已被 uc31-rev 替代如实注·两 policy 零触）——同号支并线期 union 届时取大重算承登·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w/errata 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_487/f-2487.md/:2488 恰等改。
      // CAP-SANCTION-2489 ONLINE-PAY 第一期 EXEC union 恰等步进：cap 2487→2489（详 policy .mjs 链区 CAP-SANCTION-2489 注记·2026-11-06 commerce 在线支付第一期 EXEC 落码（协调方明示 EXEC 授权·harness/online-pay-REQUEST.md 卷·件① PaymentProvider 接口+Unconfigured 骨架+件② pay-session 端点薄面+件③ contracts additive+件⑤ 隔离库真 PG proof·网关无关 fail-closed）随刀·协调方派单常设预授权「cap/lint 以合并树实测为准恰等步进免再询」随令行使 +2 恰等零多放·步进前本树亲跑 docs:check scanned 2487=cap 2487 恰等 EXIT=0（上链 CAP-SANCTION-2487 rev r2 承值）——union 算式=届扫 2487+EXEC 期新受管件恰 2（apps/api/src/modules/commerce/payment-provider.ts+apps/api/test/online-pay-s1.proof.ts·tracked gate stdout 收据 .log ∉TEXT_EXTENSIONS 非扫描面不计）=2489 恰等零多放·proof 先对改前树证红（service 面三臂红承·load-bearing）后落码复跑绿·在飞同号竞争 s3caps/uc31 两支沿上链如实列不变·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w/errata 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_489/f-2489.md/:2490 恰等改。
      // CAP-SANCTION-2487 RTX 路由分类事务拆相刀起草随刀恰等步进：cap 2486→2487（详 policy .mjs 链区 CAP-SANCTION-2487 注记·2026-11-05 meetwise 路由分类事务缺陷修复刀起草（classifyJobRoute/classifyFreeTextScope 拆相：事务 A 锁+CAS 落 model_prepared 提交·模型外呼移出全部 DB 事务·事务 B 重锁写终态·harness/route-classify-tx-REQUEST.md 卷）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main 92a82a944=#209 perf-status-pin 已并（main 届扫 2486=cap 2486 恰等·worktree docs:check EXIT=0 scanned 2486 起草前亲跑）+本卷 REQUEST 受管 1 件=2487 必超·proof 新增面并入既有 proof 文件零新受管件·EXEC 期=既有 src/proof 单文件改零新受管文件+收据 .log（∉TEXT_EXTENSIONS 不计）→terminal 2487 零新增·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w/errata/iso 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_487/f-2487.md/:2488 恰等改。
// CAP-SANCTION-2490 RTX 路由分类事务刀 nail 期并线 union 越限恰等步进：cap 2489→2490（详 policy .mjs 链区 CAP-SANCTION-2490 注记·2026-11-06 meetwise 路由分类事务缺陷修复刀 nail 期 rebase 并线（harness/route-classify-tx-REQUEST.md 卷·post-prove 双审两独立外席 BOTH PASS·协调方合并授权随令）随刀·fetch 多试网络不可达·届值如实采本地 origin/main ref=e282c5ebd=#211（main 届扫 2489=cap 2489 恰等·ref 与协调方令文届值恒等）·rebase 冲突=两 policy 脚本冲突块均在注记/注释行+数值行 dual-keep 双留（main 侧 CAP-SANCTION-2487 ONLINE-PAY rev+CAP-SANCTION-2489 ONLINE-PAY EXEC 注史录全保留+本支 CAP-SANCTION-2487 RTX 起草注并留·号随 merge-tree 重排·沿 CAP-SANCTION-2486 ISO-DOTENV-PERF nail 并线 dual-keep 先例形）——union 算式=main 届扫 2489+本卷受管 1 件=2490 恰等零多放·常设预授权随令行使 +1（2489→2490）·四联动点 2_490/f-2490.md/:2491 恰等改（proof 文件链区·loop/atCap/overCap 三处）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w/errata/iso 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_490/f-2490.md/:2491 恰等改。
      // CAP-SANCTION-2489 SBG 起草随刀恰等步进（派单预登值如实重算承登）：cap 2486→2489（详 policy .mjs 链区 CAP-SANCTION-2489 注记·2026-11-05 UI runner 误复用无压测源生产构建假红修复刀起草+落卷（STALE_BUILD_GUARD 意图判·harness/stale-build-guard-REQUEST.md 卷·起草+EXEC 同席落卷·协调方派单随令）·届值 origin/main 92a82a944=#209（main 届扫 2486=cap 2486 恰等）·派单预登「预期 2487」仅计 REQUEST 1 件·实际受管 +3（guard 模块+proof+REQUEST·如实重算承登·预登史录零洗）·在飞 pay bc9d6fd08 ahead=2/s3caps-draft 2cfdade94 ahead=5 承 2_487/uc31 ac3d1ef76 ahead=1 承 2_487（merge-base 均 92a82a944·两 policy 热面·并线 union 届时取大重算承登）·沿 CAP-SANCTION-2486 预登重算先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_489/f-2489.md/:2490 恰等改。
      // CAP-SANCTION-2493 SBG 构建守卫刀 nail 期并线 union 越限恰等步进：cap 2490→2493（详 policy .mjs 链区 CAP-SANCTION-2493 注记·2026-11-06 UI runner 构建守卫刀 nail 期 rebase 并线行使（post-prove 双审两独立外席收口·报告 .tmp/reviews/sbg-post-1.md/.tmp/reviews/sbg-post-2.md·协调方 nail 授权随令）·fetch EXIT=0·届值如实采 origin/main 768db078f=#213（main 届扫 2490=cap 2490 恰等）·rebase 冲突=两 policy 脚本注记/注释行+数值行 dual-keep 双留（main 侧 ONLINE-PAY rev/ONLINE-PAY EXEC/RTX 起草/RTX nail 注史录全保留+本支 SBG 起草注并留·号随 merge-tree 重排·沿 CAP-SANCTION-2490 RTX nail 先例形）·union=main 届扫 2490+本支受管 3 件=2493 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +3·四联动点 2_493/f-2493.md/:2494 恰等改（loop/atCap/overCap 三处）·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_493/f-2493.md/:2494 恰等改。
      // CAP-SANCTION-2486 UC31-REV 强制刷新落卷起草随刀恰等步进：cap 2485→2486（详 policy .mjs 链区 CAP-SANCTION-2486 注记·2026-11-05 UC-031/032 结构面第一期 REQUEST rev 席强制刷新落卷（viability 双席 (a)+(b) 裁定 2026-11-05+刷新清单并集八项·harness/uc31-REQUEST.md 卷·docs-only 刷新落卷即停·卷件自 line/uc31-draft 112ac8af0 零字改并线落新支 line/uc31-rev）随刀·协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放·届值如实采 origin/main fcbccea40=#207 errata-status-pin 已并（main 届扫 2485=cap 2485 恰等·docs:check EXIT=0 scanned 2485 起草前亲跑）+本卷 REQUEST 受管 1 件=2486 必超（rev 门 docs 届值+1=2486 恰等 EXIT=0 亲跑）·EXEC 期=proof 1+receipts 3（两臂收据 .md+run-manifest.json·TEXT_EXTENSIONS .md/.json 计面亲证）→EXEC terminal=2490 算式承登·并线期 union 取大重算·在飞如实采按届枚举（s3caps 96ad5d679 ahead=3 两 policy 热面承 CAP-SANCTION-2485 同号/pay fdaa1ecf0 ahead=1 两 policy 零触/perf-draft 3ad7f3c10 ahead=0 已并·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w/errata-session-1105/s3caps 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_486/f-2486.md/:2487 恰等改。
      // CAP-SANCTION-2487 UC31-REV rev r2 修订落卷并线恰等步进：cap 2486→2487（详 policy .mjs 链区 CAP-SANCTION-2487 注记·2026-11-05 UC-031/032 结构面第一期 REQUEST rev r2 修订落卷（登记源=pre-exec 双席 FAIL 两席独立收敛同因+协调方裁定：件① Arm-REJ ② 两腿走真实产品路径行为断言不降级静态钉·proof 落点改判 apps/worker/test/uc-e2e-031-032-structure.proof.ts·详卷 §9）随刀·fetch 网络三试 EXIT≠0 如实登记·届值如实采本地 origin/main 92a82a944=#209 已并（main 届扫 2486=cap 2486 恰等·detached worktree docs:check EXIT=0 scanned 2486 届核亲跑）·rebase 冲突=两 policy 脚本注记区 dual-keep 双留（main 侧 2481/2485/2486 ISO-DOTENV-PERF 三注史录全保留+本支 2486 UC31-REV 起草注并留·号随 merge-tree 重排）·数值行双侧同值自动归并后随本注恰等改——union 算式=main 届扫 2486+本卷 REQUEST 受管 1 件=2487 恰等零多放（本树 docs:check PTP_FILE_LIMIT:2487>2486 红真 EXIT=1 亲证）·协调方常设预授权随令行使 +1（2486→2487）·EXEC 期=proof 1+receipts 3→terminal=union 取大重算为准（r1 预登 2490 系算式示例史录保留零洗）·在飞如实采按届枚举（s3caps-draft 96ad5d679 ahead=3 两 policy 热面预登 2_485 已被届值越过·pay fdaa1ecf0 ahead=1 两 policy 零触·perf 已并出名单·详 policy .mjs 链区同注记）·PTP 12/12 亲跑·沿 nk1/flip/sse2/err/l13/fin/r2/idu/g7w/errata/iso-dotenv-perf 预登先例形·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_487/f-2487.md/:2488 恰等改。
      // CAP-SANCTION-2495 UC31-REV 结构证明刀 nail 期并线 union 越限恰等步进：cap 2493→2495（详 policy .mjs 链区 CAP-SANCTION-2495 注记·2026-11-06 UC-031/032 结构面刀 nail 期 rebase 并线行使（post-prove 双审两独立外席收口+r1 修订复审 PASS·报告 .tmp/reviews/uc31-post-1.md/uc31-post-2.md/uc31-r1.md·协调方 nail 授权随令）·fetch EXIT=0·届值如实采 origin/main db0dc8bfe=#214（main 届扫 2493=cap 2493 恰等）·rebase 冲突=两 policy 脚本注记/注释行+数值行 dual-keep 双留（main 侧 ONLINE-PAY rev/ONLINE-PAY EXEC/RTX 起草/RTX nail/SBG 起草/SBG nail 注史录全保留+本支 UC31-REV 起草注+rev r2 注并留·号随 merge-tree 重排·沿 CAP-SANCTION-2493 SBG nail 先例形）·union=main 届扫 2493+本支受管 2 件（REQUEST+apps/worker proof）=2495 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使 +2·四联动点 2_495/f-2495.md/:2496 恰等改（loop/atCap/overCap 三处）·PTP 12/12 亲跑·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）——本 TC 四联动点 2_495/f-2495.md/:2496 恰等改。
      const overCap = scanPublicTextPolicy({ repoRoot: fixture, trackedPaths: [...paths, 'ai-docs/f-2495.md'] });
      assert.equal(overCap.valid, false);
      assert.equal(overCap.scannedFiles, 0);
      assert.deepEqual(overCap.errors, [`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2496`]);
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
