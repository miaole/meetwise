# PARITY-B · e2e-parity baseline 再生刀 · REQUEST（docs-only）

status: **`draft:awaiting_pre_exec_dual`**（REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 EXEC · 本 commit 零码零再生零门状态翻转——再生属下轮 EXEC 面；本 REQUEST 的全部门读数均为只读实测，再生设计已在 /tmp 副本干跑验证、仓库本体零触碰）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base line 与 worktree 披露

- fetch 2026-10-08：`origin/feat/mysql-schema-skeleton` = `9265e4d8`（≥ `9265e4d8` 达成；本地同名分支已 ff 至同点）。
- 本刀 worktree：`/Users/miaole/Desktop/golucky/meetwise-line-parity`（仓库根同级新建）；分支 `line/e2e-parity-baseline-regen`（新立自 `origin/feat/mysql-schema-skeleton`，跟踪同名 upstream）。
- 立项出处：**协调方 PARITY-B · e2e-parity baseline 再生刀（CMOP03-D nail `9265e4d8` 登记的收尾项——本文引用之，不自建 SSOT 行）**。
- 全部 blob 锚均为 mw-core 在本 worktree 于 base 点以 `git ls-tree` 亲算，非转录：

| 文件 | blob @ 9265e4d8 |
| --- | --- |
| `ai-docs/testing/e2e-parity-baseline.json` | `2f72becfb2b1ca6e05da9748346d4243daf4195b` |
| `ai-docs/testing/e2e-parity-allowlist.json` | `c367f175247c6be1b5aafe9d3d8c79cdd974fc9e` |
| `ai-docs/testing/e2e-parity-baseline.md` | `30129fda598b4f06fc8e9955a5c6e36d09ffbc3a` |
| `scripts/e2e-parity-check.mjs`（扫描器·只读） | `403949840af47fd690594db1fff9ce58aefbed8b` |
| `scripts/e2e-parity.proof.mjs`（prove 门·只读） | `749c86fe64a1d3764fbff27c795bc12e983ef3f3` |
| `e2e/full.e2e.ts`（反触碰钉①） | `6c27b58339e952142d5a9c9bc9fd2da02df4143c` |
| `e2e/helpers/interview.ts`（反触碰钉②） | `c70016123ce144d75e1e6f39eecaa6f1f415304b` |

## 1. 红事实（本刀实测 · 只读静态读数 · 零实跑零容器）

**门命令亲核**：`package.json` → `"e2e-parity:prove": "node scripts/e2e-parity.proof.mjs"`、`"e2e-parity:check": "node scripts/e2e-parity-check.mjs"`（pnpm 10.18.0 · node v22.19.0 亲测在位）。

**再生前红读数（本 worktree @ 9265e4d8 亲跑）**：

- `node scripts/e2e-parity-check.mjs` → **EXIT=1** · `valid=false` · 恰 **12** 错误（2 `assertion_removed` + 10 `assertion_untracked`）· stats：fileCount=7 · testCount=37 · **assertionCount=350** · floors=48/367 · effectiveFloors=37/342 · allowlistCount=6 · releaseEvidence=false。
- `node scripts/e2e-parity.proof.mjs` → **FAIL TC-e2e-parity-01-main**（首断言 `result.valid===true` 失败，错误集即上列 12 行）。

**漂移出处（`git log -S` 逐源亲算 · 基线 JSON 自 `7da29707` 2026-09-04 创建以来零 commit 触碰——`git log --follow` 全账仅 1 条）**：

| commit | 日期 | 漂移面 | 身份账 |
| --- | --- | --- | --- |
| `a4e3de58` | 2026-09-18 | fix(g7-key-x3)：`至少出了 1 道题` 断言 label 追加 terminal/reason 诊断（条件 `questions >= 1` 未变 → **digest 全等、label 变**） | 1 换 |
| `85d36c76` | 2026-09-23 | prove(e2e)：UC018 full.e2e abandon inclusion（GAP-UC018-FULL-E2E）新增 8 断言**未入库基线** | +8 |
| `1789e321` | 2026-10-08 | fix(cmop03) C-MO-P3：`出处审查` 断言条件 `identities.length === questions` → `=== questions + clarifications`（label 模板串逐字节全等 → **digest 变、label 全等**） | 1 换 |

**与协调方卷面的差异披露（交预执行双审裁）**：卷面预期 diff 面=「恰为 C-MO-P3 4 行改写对应字段」。实测：C-MO-P3（1789e321 改写 full.e2e.ts 4 行=2 删 2 增，其中仅 1 行是断言条件行，另一对是 destructure 行零身份面）只是 **3 个漂移源之一**。**C-MO-P3-only 再生达不成 prove EXIT=0**：8 条 UC018 untracked + 1 条 g7-key-x3 label 换面 + 扫描总数 350≠TC 硬码 342 三者残留，门必续红。故本刀按任务书「baseline 逐字段对照**实树**再生」把再生面扩为**全漂移集（3 源 · 12 身份）**，逐字段前后值见 §2，扩面裁定权交双审。旁证：`9d262413`（CMOP03-D EXEC）卷面「parity base pre-red stash-proven（C-MO-P3 baseline drift, ban-regenerated）」与本读数相容——红在改动前已在，纯上游漂移，本刀零因果。

**零漂移旁证**：1789e321 同 commit 改的 `e2e/helpers/interview.ts`（5 行）零断言调用点变化——基线 interview.ts 快照（tests=1/assertions=4）与实树 bag 全等（12 错误行零 interview.ts 项，check 输出亲读）。

## 2. 再生设计（逐字段对照实树 · 程序化 · Ban 手抄）

**治理依据（`ai-docs/testing/e2e-parity-baseline.md` 只引不改）**：替换断言=「allowlist 写下**旧**身份和对应负 delta，同时把**新**身份追加进基线并上调 floors」（§更新 allowlist 步骤 5）；身份相对上一版基线**只能追加**，抹旧身份且 allowlist 未记录 → `baseline_identity_dropped`（§追加基线 步骤 4）；`--print` **不写盘**、基线已存在时只打印未入库身份，不得当整文件覆盖稿（:69）。故**纯覆盖式再生被治理文本与门机制双重排除**（纯换面→`baseline_identity_dropped`；allowlist 引用基线外身份→`allowlist_unknown_assertion`），唯一合法路径=**追加式再生**。

**程序化裁定**：全部身份由 `scripts/e2e-parity-check.mjs` 导出的扫描器从当 tip 实树提取（`untrackedAgainstBaseline` 同源算法），旧身份由基线 JSON 程序化提取（bag 差集），**零人工手抄 digest**；脚本 fail-closed 锚定预注册集（见下），任何超集/缺集/他文件漂移即拒写。

### 2.1 逐字段前后值表（diff 审查面 · 交双审逐行对）

**`ai-docs/testing/e2e-parity-baseline.json`（2f72becf → 再生后）**：

| 字段 | 前 | 后 | 性质 |
| --- | --- | --- | --- |
| `files["e2e/full.e2e.ts"].assertions` | 74 项（含 2 旧漂移身份） | 84 项 | **stable-merge 追加 10 新身份**；旧身份全保留；既有 74 项相对顺序零扰动 |
| `files["e2e/full.e2e.ts"].assertionCount` | 74 | 84 | =数组长度 |
| `files["e2e/full.e2e.ts"].tests` / `testCount` | 1（implicit-suite）/ 1 | 全等 | 零 diff |
| 其余 6 文件快照（assert.ts digest / interview.ts / e2e-helpers.proof / performance.e2e / 2 个 prove） | — | 字节全等 | 脚本逐 bag 断言（净 of 既有 allowlist 移除集） |
| `floors.testCount` | 48 | 48 | 零 diff |
| `floors.assertionCount` | 367 | **377** | =各文件计数和（+10） |
| `schemaVersion` / `releaseEvidence` / `scope` | 1 / false / `"e2e/ test+assertion parity plus agreed critical prove scripts"` | 全等 | 零 diff |

**`ai-docs/testing/e2e-parity-allowlist.json`（c367f175 → 再生后）**：

| 字段 | 前 | 后 |
| --- | --- | --- |
| `entries` | 6 项 | **7 项**（尾部追加 1 条；既有 6 条字节全等） |
| 新条目 `id` / `path` | — | `E2E-PARITY-20261008-upstream-drift-regen` / `e2e/full.e2e.ts` |
| 新条目 `removedAssertions` | — | 恰 2 旧身份：`出处审查…`（`sha256:5fb8372fff815be47b96ffc71e3de7c8fb4efb7dfe6f3aa9e252ffdb643005c6`）· `至少出了 1 道题(旧 label)`（`sha256:8327ec148e87dbfcfc9d4083fc643882f2bfa212e62966f55bde3055da785b35`） |
| 新条目 `removedTests` / `removedFile` / `testCountDelta` / `assertionCountDelta` | — | `[]` / `false` / `0` / `-2` |
| 新条目 `reason` | — | `"Upstream assertion rewrites and additions (cmop03 C-MO-P3 provenance condition retarget, g7-key-x3 question-count diagnostic label extension, uc018 abandon block) replaced two identities and added eight; replacement identities appended to the baseline without lowering floors."`（≥24 字符含空格 · 禁词零命中 · 全局唯一 id） |

**`scripts/e2e-parity.proof.mjs`（749c86fe → 再生后）· 仅 TC-e2e-parity-01-main 4 个数字随 JSON 同步**（`baseline.md:18` 自declare「数字以 JSON + TC-e2e-parity-01-main 为准（随 JSON 更新，禁止手改成旧数）」——数字是 JSON 的派生读数；断言逻辑与 fixture TC 全族零触碰。此裁定交双审）：

| 断言行（`scripts/e2e-parity.proof.mjs:90-95`） | 前 | 后 |
| --- | --- | --- |
| `assert.equal(result.stats.assertionCount, N)` | 342 | **350** |
| `assert.equal(result.stats.floors.assertionCount, N)` | 367 | **377** |
| `assert.equal(result.stats.effectiveFloors.assertionCount, N)` | 342 | **350** |
| `assert.equal(result.stats.allowlistCount, N)` | 6 | **7** |
| （fileCount=7 / testCount=37 / floors.testCount=48 / effectiveFloors.testCount=37 / releaseEvidence=false） | — | 零 diff |

数学自洽：effective = 377 −（既有 −25 + 新 −2）= **350** = 实树扫描总数；37 = 48 − 11（不变）。

**`ai-docs/testing/e2e-parity-baseline.md`（30129fda → 再生后）· 仅 :18 冻结数字行随 JSON 同步**（该行自declare「随 JSON 更新」）：`floors` **48 / 367**→**48 / 377**；effective 扫描 **37 / 342**→**37 / 350**；allowlist **6** 条→**7** 条。其余全文零触碰；`generation-trust:prove` 对该文件的 required 词面（parity floors/AI diffs/review/fail-closed/e2e-parity:check）全保留。

### 2.2 追加的 10 个新身份（扫描器 `--print` 机器提取 @ 实树，非手抄）

| # | kind | label | conditionDigest |
| --- | --- | --- | --- |
| 1 | A | `[UC018] abandon 前置额度≥1(${beforeUnits})` | `sha256:8b2ef57cf67c830ab6592b7c93b7509037f03e300d494e0710ba45c8b8b8a8c7` |
| 2 | A | `[UC018] abandon 后 begin → 409 interview_not_active(不可 resume; ${JSON.stringify(b).slice(0, 80)})` | `sha256:a823fbfb60e1334a66b5052c2e9bddd1171c8af33e276e0fdeee0a612bdd5f8a` |
| 3 | A | `[UC018] abandon 后额度净变 0(${unitsAfterAbandon.availableUnits})` | `sha256:93e4349c15e28572664be0479d110c953c2cebb5acf7f2f7e1923751177dcd71` |
| 4 | A | `[UC018] begin 后额度 -1(${unitsAfterBegin.availableUnits})` | `sha256:a6f3412c80faaeebe0927816b50e0c8ff30fac09bbb9ced107169affb94ca53a` |
| 5 | A | `[UC018] begin 预留 → 202(${JSON.stringify(await readJson(r)).slice(0, 60)})` | `sha256:e7cbfa12bd287fbbcff4ad697afff00ecc330dd4ecc40380550d6a98c3338a5f` |
| 6 | A | `[UC018] GET interview → status=abandoned(${got.status})` | `sha256:50f38683422aa1fea984775d2f51099b4c5549334abaaa5207b689a535ca146f` |
| 7 | A | `[UC018] POST abandon → abandoned+released(${JSON.stringify(b).slice(0, 100)})` | `sha256:67fd21b6fa980dc4b95cbe6cfdbbdc27b892fab20d84d4557b1ec9d5e5c07709` |
| 8 | A | `[UC018] 建放弃面试 → interviewId(${abandonInterviewId})` | `sha256:664349ff51bea06c0644050d52d2ceb03abab0bdf080736f8badd16efa199bfc` |
| 9 | A | `出处审查: 不把 AI 分/progress 当 B 端分（identities=${provenance.identities.length}, forgedScores=${provenance.forgedScores}）`（label 与旧全等） | `sha256:16131e7bc2b53e9ff9d7eee8621a427bc02f03c095da309fe591cfd9d7742bc8`（旧 `5fb8372f…`→新，C-MO-P3 条件 +clarifications） |
| 10 | A | `至少出了 1 道题(实际 ${questions} 道;事件:${[...kinds].join(',')}; terminal=${terminal}; reason=${(terminalPayload as any)?.reason ?? 'n/a'})`（label 扩展，g7-key-x3） | `sha256:8327ec148e87dbfcfc9d4083fc643882f2bfa212e62966f55bde3055da785b35`（与旧身份 **digest 全等**——条件 `questions >= 1` 未变，纯 label 换面） |

注：`[状态机] 岗位会话出处审查…` 兄弟身份不在漂移集（与实树匹配，check 错误集零该行）。

### 2.3 EXEC 再生命令（写全 · 已对 /tmp 副本干跑验证 · 仓库本体零触碰的干跑 receipt 见 §3.3）

步骤 1——程序化再生两份 JSON（在 worktree 根保存为 `/tmp/parity-regen-exec.mjs` 后 `node /tmp/parity-regen-exec.mjs`）：

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { scanParitySources, floorsFromFiles } from './scripts/e2e-parity-check.mjs';
const SCOPE_PATH = 'e2e/full.e2e.ts';
const PREREGISTERED_REMOVED_DIGESTS = Object.freeze([
  'sha256:5fb8372fff815be47b96ffc71e3de7c8fb4efb7dfe6f3aa9e252ffdb643005c6',
  'sha256:8327ec148e87dbfcfc9d4083fc643882f2bfa212e62966f55bde3055da785b35',
]);
const keyOf = (i) => `${i.kind}\n${i.label}\n${i.conditionDigest}`;
const cmp = (a, b) => keyOf(a).localeCompare(keyOf(b));
const bag = (items) => { const m = new Map(); for (const i of items) m.set(keyOf(i), (m.get(keyOf(i)) ?? 0) + 1); return m; };
const fail = (msg) => { console.error('FAIL ' + msg); process.exit(1); };

const scan = scanParitySources(process.cwd());
if (scan.errors.length) fail('scan errors: ' + JSON.stringify(scan.errors));
const baseline = JSON.parse(readFileSync('ai-docs/testing/e2e-parity-baseline.json', 'utf8'));
const allowlist = JSON.parse(readFileSync('ai-docs/testing/e2e-parity-allowlist.json', 'utf8'));

// added = untracked（scan − baseline bag）
const added = {};
for (const [path, current] of Object.entries(scan.files)) {
  const frozen = baseline.files[path];
  const knownT = frozen ? bag(frozen.tests) : new Map();
  const knownA = frozen ? bag(frozen.assertions) : new Map();
  const tests = current.tests.filter((i) => !knownT.has(keyOf(i)));
  const assertions = current.assertions.filter((i) => !knownA.has(keyOf(i)));
  if (tests.length || assertions.length) added[path] = { tests, assertions };
}
const addedPaths = Object.keys(added);
if (addedPaths.length !== 1 || addedPaths[0] !== SCOPE_PATH) fail('added scope: ' + JSON.stringify(addedPaths));
if (added[SCOPE_PATH].tests.length !== 0) fail('added tests present');
if (added[SCOPE_PATH].assertions.length !== 10) fail('added count ' + added[SCOPE_PATH].assertions.length);

// 既有 allowlist 移除集（bag）
const alRemoved = { tests: new Map(), assertions: new Map() };
const addToBag = (m, items) => { for (const i of items) { const k = keyOf(i); m.set(k, (m.get(k) ?? 0) + 1); } };
for (const entry of allowlist.entries) {
  addToBag(alRemoved.tests, entry.removedTests ?? []);
  addToBag(alRemoved.assertions, entry.removedAssertions ?? []);
}

// removed-NEW = baseline − scan − 既有allowlist（恰 2 · digest 锚定）
const scanBagA = bag(scan.files[SCOPE_PATH].assertions);
const removedSet = new Set();
for (const item of baseline.files[SCOPE_PATH].assertions) {
  const k = keyOf(item);
  if ((scanBagA.get(k) ?? 0) < 1 && (alRemoved.assertions.get(k) ?? 0) < 1) removedSet.add(k);
}
if (removedSet.size !== 2) fail('removed set size ' + removedSet.size);
const removed = baseline.files[SCOPE_PATH].assertions.filter((i) => removedSet.has(keyOf(i)));
for (const d of PREREGISTERED_REMOVED_DIGESTS) {
  if (!removed.some((i) => i.conditionDigest === d)) fail('preregistered digest missing ' + d);
}

// 其余文件净漂移必须为零（净 of 既有 allowlist）
for (const path of Object.keys(baseline.files)) {
  if (path === SCOPE_PATH) continue;
  const a = bag(baseline.files[path].assertions); const b = bag(scan.files[path].assertions);
  const t = bag(baseline.files[path].tests); const u = bag(scan.files[path].tests);
  for (const [k, v] of a) if ((b.get(k) ?? 0) + (alRemoved.assertions.get(k) ?? 0) < v) fail('other-file drift ' + path);
  for (const [k, v] of t) if ((u.get(k) ?? 0) + (alRemoved.tests.get(k) ?? 0) < v) fail('other-file test drift ' + path);
}

// stable merge：既有 74 项相对顺序零扰动，10 项按扫描器同源 comparator 落位
const additions = [...added[SCOPE_PATH].assertions].sort(cmp);
const merged = baseline.files[SCOPE_PATH].assertions.slice();
for (const item of additions) {
  let idx = merged.length;
  for (let i = 0; i < merged.length; i++) { if (cmp(item, merged[i]) < 0) { idx = i; break; } }
  merged.splice(idx, 0, item);
}
baseline.files[SCOPE_PATH].assertions = merged;
baseline.files[SCOPE_PATH].assertionCount = merged.length;
baseline.floors = floorsFromFiles(baseline.files);
if (baseline.floors.testCount !== 48 || baseline.floors.assertionCount !== 377) fail('floors ' + JSON.stringify(baseline.floors));

allowlist.entries.push({
  id: 'E2E-PARITY-20261008-upstream-drift-regen',
  path: SCOPE_PATH,
  reason: 'Upstream assertion rewrites and additions (cmop03 C-MO-P3 provenance condition retarget, g7-key-x3 question-count diagnostic label extension, uc018 abandon block) replaced two identities and added eight; replacement identities appended to the baseline without lowering floors.',
  removedTests: [],
  removedAssertions: removed,
  removedFile: false,
  testCountDelta: 0,
  assertionCountDelta: -removed.length,
});

// 2-space indent + 尾随换行（与既有字节格式一致）
writeFileSync('ai-docs/testing/e2e-parity-baseline.json', JSON.stringify(baseline, null, 2) + '\n');
writeFileSync('ai-docs/testing/e2e-parity-allowlist.json', JSON.stringify(allowlist, null, 2) + '\n');
console.log('OK appended=10 removed=2 floors=' + JSON.stringify(baseline.floors));
```

步骤 2——TC-01-main 数字同步（唯一锚点断言 · 任一非恰 1 次命中即拒写）：

```bash
node -e "
const fs = require('fs');
const p = 'scripts/e2e-parity.proof.mjs';
let t = fs.readFileSync(p, 'utf8');
const subs = [
  ['assert.equal(result.stats.assertionCount, 342);', 'assert.equal(result.stats.assertionCount, 350);'],
  ['assert.equal(result.stats.floors.assertionCount, 367);', 'assert.equal(result.stats.floors.assertionCount, 377);'],
  ['assert.equal(result.stats.effectiveFloors.assertionCount, 342);', 'assert.equal(result.stats.effectiveFloors.assertionCount, 350);'],
  ['assert.equal(result.stats.allowlistCount, 6);', 'assert.equal(result.stats.allowlistCount, 7);'],
];
for (const [from, to] of subs) { const n = t.split(from).length - 1; if (n !== 1) { console.error('anchor not unique: ' + from + ' x' + n); process.exit(1); } t = t.replace(from, to); }
fs.writeFileSync(p, t);
console.log('TC-e2e-parity-01-main stats synced 342>350 367>377 342>350 6>7');
"
```

步骤 3——`e2e-parity-baseline.md:18` 数字同步（同唯一锚点纪律）：

```bash
node -e "
const fs = require('fs');
const p = 'ai-docs/testing/e2e-parity-baseline.md';
let t = fs.readFileSync(p, 'utf8');
const subs = [
  ['\`floors\` **48 / 367**（含已替换旧身份）', '\`floors\` **48 / 377**（含已替换旧身份）'],
  ['effective floors = 扫描 **37 / 342**', 'effective floors = 扫描 **37 / 350**'],
  ['allowlist **6** 条', 'allowlist **7** 条'],
];
for (const [from, to] of subs) { const n = t.split(from).length - 1; if (n !== 1) { console.error('anchor not unique: ' + from + ' x' + n); process.exit(1); } t = t.replace(from, to); }
fs.writeFileSync(p, t);
console.log('baseline.md:18 numbers synced');
"
```

## 3. EXEC Prove 计划（一次优先 · attempts 全账）

按序（每步 EXIT 记账，任何非预期读数 → 停止报账升级，Ban 静默重试）：

1. `pnpm run e2e-parity:check` → 期望 **EXIT=0** · `valid=true` · `errors=[]` · stats `{fileCount:7, testCount:37, assertionCount:350, floors:{48,377}, effectiveFloors:{37,350}, allowlistCount:7, releaseEvidence:false}`（§2.1 表的机器复核）。
2. `pnpm run e2e-parity:prove` → 期望 **EXIT=0 一次优先** · `PASS e2e-parity proof: 24 scenarios`（含 TC-01-main 全断言绿）。
3. `pnpm run generation-trust:prove` → 期望 **EXIT=0**（base 点已绿——本 REQUEST 亲测 receipt：`PASS generation-trust: policy encoded; …`，再生后 required 词面全保留）。
4. **反触碰亲算**：`git diff --stat e2e/ apps/ packages/` = 空；`git ls-tree HEAD -- e2e/full.e2e.ts e2e/helpers/interview.ts` 再生前后 blob 全等（`6c27b583` / `c7001612`）；diff 形状 receipt：baseline JSON **52 增 2 删**、allowlist JSON **21 增 0 删**、proof.mjs 恰 4 行换数、baseline.md 恰 3 处换数。
5. commit（作者/提交者 `mw-core <mw-core@meetwise.local>`，单 commit 恰 4 个产品面文件）后复跑步骤 1-2 各恰 1 次（post-commit previousBaseline 走 `HEAD^`，与 dirty-tree 案同解——干跑已双案验证 `valid=true`）。
6. **attempts 全账**：prove/check 每次 EXIT 与耗时逐条入 EXEC 收据；非预期红 = 停止升级（Ban retry-to-green、Ban 改 e2e 源凑绿、Ban 调 allowlist/reason 凑绿）。

### 3.1 基线已在红的兄弟门（本刀不处置 · 只记账不扩面）

base 点 9265e4d8 亲测只读 receipt：`pnpm run docs:check` **EXIT=1**（`public_text_policy:PTP_FILE_LIMIT:3877`——tracked 扫描面 3877 > 上限 2048，仓库规模面预红）；`pnpm run quality:governance:check` **EXIT=1**（`governed_path_*`：ecs-full-stack CD 控制面 v58/v70 + traceability 历史缺口——full-stack 域预红，与本刀零交集）。本刀 EXEC 后二门**错误类与错误集必须逐字节同 base**（本刀 4 文件不入 PTP 扫描上限变化面以外的新错误类）；Ban 借机修（另刀立项归协调方）。

### 3.2 dry-run 验证 receipt（本 REQUEST 已做 · 仓库零触碰）

再生脚本在 `/tmp/parity-regen-dryrun/` 副本上干跑（读仓库、写 /tmp）：`OK appended=10 removed=2 floors={"testCount":48,"assertionCount":377}`；baseline diff=52+/2−、allowlist diff=21+/0−；`validateParityDocuments`（dirty-tree 案 A 与 post-commit 案 B，previousBaseline=`git show HEAD:` 基线）双案 **`valid=true errors=[]`** stats 同 §3 步骤 1。设计非纸面推导，系机器验证。

## 4. 硬 Ban（任务书④ 全列 + 本刀补充）

1. **Ban 借机改任何断言本体/测试逻辑**：`e2e/**`、`apps/**`、`packages/**` 零触碰（反触碰钉①② blob 前后全等亲算入收据）；`scripts/e2e-parity.proof.mjs` 仅 TC-01-main 4 个派生数字随 JSON 同步（`baseline.md:18` 自declare 数字以 JSON 为准），断言逻辑/比较子/fixture TC 全族零改；`scripts/e2e-parity-check.mjs` 零触碰。
2. **Ban 翻其他门红**：base 绿门（`generation-trust:prove` EXIT=0 亲测；`e2e-static-guards`、`e2e-helpers:prove`、`e2e-case-inventory:prove` 等 e2e 面门——本刀零 e2e 触碰）必须保持绿；base 红门（`docs:check`、`quality:governance:check`）错误类/集逐字节同 base，不得新增。
3. **Ban 改共享 SSOT**：`execution-master-checklist.md` / `gap-bug-backlog.md` / `e2e-platform-integration.md`（其 :188 旧数 48/367、37/342、6 条系历史存档读数，**留档不动**）/ 矩阵 / sibling 归档——只读引用；`e2e-parity-baseline.md` 仅 :18 数字行随 JSON 同步（其自declare义务），非 SSOT 改写。
4. **Ban 手抄 baseline**：全部身份由扫描器/bag 差集程序化提取；脚本 fail-closed 锚定（added 恰=10 且 scope 恰=`e2e/full.e2e.ts` 且 tests=0；removed-NEW 恰=2 且 digest ∈ {`5fb8372f…`,`8327ec14…`}；其余 6 文件净漂移=0；floors 恰={48,377}；4+3 个文本锚点各恰 1 次命中）。
5. **Ban secrets**：不读不写 `.env*`；收据零键值；pre-commit `check-staged-secrets` 钩子照走。
6. **本刀补充**：Ban 纯覆盖/整文件重写再生（既有 74 断言与 6 allowlist 条目顺序零扰动）；Ban 抹旧身份（`baseline_identity_dropped`）；Ban 下调 floors（`floor_dropped`）；Ban 注入 `E2E_PARITY_BASE_REF`/`GITHUB_BASE_REF` 绕 previousBaseline 守卫；Ban 把 `--print` 输出当覆盖稿（`:69`）；Ban force-push；Ban self-approve（预执行/post-prove 双审均须 mw-e2e-ha + mw-model-op 独立席位）；Ban 把 parity 门绿写成「测试已跑/可发布/覆盖增加」（静态身份门，恒 `releaseEvidence=false`）。

## 5. 流程声明（任务书⑥）

REQUEST（本文）→ 预执行双审（mw-e2e-ha + mw-model-op · 空审 stub 见 §7）→ meetwise 授权 → EXEC（程序化再生 + §3 prove 一次优先 · 单 commit 恰 4 产品面文件：两 JSON + proof.mjs + baseline.md）→ post-prove 双审 → meetwise 授权 nail。执行地：worktree `meetwise-line-parity` · 分支 `line/e2e-parity-baseline-regen`。

## 6. 再生后终态预期（供 post-prove 双审对表）

`e2e-parity:check`/`:prove` **EXIT=0**；stats `7 / 37 / 350 · floors 48/377 · effective 37/350 · allowlist 7 · releaseEvidence=false`；`baseline_identity_dropped`/`floor_dropped`/`assertion_removed`/`assertion_untracked` 全族零命中；e2e 面零字节变化（门绿纯来自账本面追平，非测试面任何改动）。

## 7. 交付物与本 commit

- `ai-docs/delivery/harness/parity-baseline-regen.md`（本文）
- `ai-docs/delivery/parity-baseline-regen.slice.md`（切片速览）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-parity-regen-mw-e2e-ha.md`（空审 stub · 待审席填写）
- `ai-docs/delivery/reviews/REQUEST-2026-10-08-parity-regen-mw-model-op.md`（空审 stub · 待审席填写）

本 commit = 上述恰 4 文件、零其他 diff；作者/提交者 `git -c user.name=mw-core -c user.email=mw-core@meetwise.local`。

## 8. Not-a-pass 诚实尾条

Not a pass · not EXEC（再生未落 · 本 REQUEST docs-only）· not proven（prove 归 EXEC）· not run（零实跑零容器零 live；本刀读数均系只读静态门 + /tmp 副本干跑）· not 门绿（`e2e-parity:check`/`:prove` 在 base 点 EXIT=1 retained，再生前零冲销）· not baseline 已再生（2f72becf 未动）· not C-MO-P3-only（实测 3 源 12 身份，扩面待双审裁）· not 兄弟门处置（docs:check / quality:governance:check base 预红留档）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize · not 预执行双审 done · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual
