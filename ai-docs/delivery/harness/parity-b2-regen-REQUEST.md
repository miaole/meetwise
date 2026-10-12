# PARITY-B2 · e2e-parity baseline 再生刀（B1 后继·全新起草） · REQUEST（docs-only）

status: **`draft:awaiting_pre_exec_dual`**（REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 EXEC · 本 commit 零码零再生零门状态翻转——再生属下轮 EXEC 面；本 REQUEST 全部门读数均为只读实测，仓库本体除本文零触碰）

pins 十一值（照抄零翻）：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · r1Closed=false

## 0. Base line 与 worktree 披露

- 基线点（开工时主线 tip 实测钉卷）：**`89530dea526dc6125255c0821c7a5356b11bf9dc`**（`feat/mysql-schema-skeleton` 本地 tip · merge commit · parents `cd2f39cc`（协调方勘误段 tip）+ `20950015`（i6-239 线）· 2026-10-12 15:03:59 +0800）。本刀零 fetch，以任务书口径「开工时主线实际 tip」为准；协调方勘误段与侦察快照 tip（`cd2f39cc`/`8b8e20bc`）均已被该 merge 前移，故全部读数以本基线点实跑为准（见 §1）。
- 本刀 worktree：`/Users/miaole/Desktop/golucky/meetwise-parity2`（仓库根同级新建）；分支 `line/parity-b2-regen`（新立自 `89530dea`）。起草前防重双对表亲证：`git worktree list` 七树零 parity2 同名树；`git branch -a` 零 `line/parity-b2-regen` 同名分支；`rg "PARITY-B2|parity-b2" ai-docs/delivery/harness/` 恰 1 命中 = `parity-baseline-regen.md:5` 勘误段（系授权出处，判定登记面非同名刀卷）。
- 立项出处：**B1 卷 `ai-docs/delivery/harness/parity-baseline-regen.md` :5 协调方勘误段（「后继=PARITY-B2 全新起草（沿本卷形制·基线点以起草时实跑为准·git log -S 逐源归因账沿 B1 §1 先例·扩面裁定交预执行双审）」）——本文引用之，不自建 SSOT 行**。
- 全部 blob 锚均为 mw-core 在本 worktree 于基线点以 `git ls-tree` 亲算，非转录：

| 文件 | blob @ 89530dea |
| --- | --- |
| `ai-docs/testing/e2e-parity-baseline.json` | `24f67f798a752f8a55fa4e86f9ffc11024ef9a80` |
| `ai-docs/testing/e2e-parity-allowlist.json` | `472745109d45def7468a21cdc8738b6567408c4c` |
| `ai-docs/testing/e2e-parity-baseline.md` | `44e54fdaf7c46e9bb9cd403aa5014c174a399646` |
| `scripts/e2e-parity-check.mjs`（扫描器·只读） | `403949840af47fd690594db1fff9ce58aefbed8b` |
| `scripts/e2e-parity.proof.mjs`（prove 门·TC-01-main 数字面） | `8e67fda1b1a4c4723c10dcca7bac60250e476f32` |
| `e2e/full.e2e.ts`（反触碰钉①） | `4cb481aa6e8026b5fe2af556bc8eae0cbebd526b` |
| `e2e/helpers/interview.ts`（反触碰钉②） | `4aee4a29f2c41314dcffeee13eb980900191e8df` |
| `e2e/helpers/e2e-helpers.proof.ts`（漂移源②·§1.3 归因账主对象） | `e748be25b84599ae93eb5d941a56652e4c8521d6` |

- 环境读数（本 worktree 亲测）：node v22.22.3 · pnpm 10.18.0。

## 1. 红事实（本刀实测 · 只读静态读数 · 零实跑零容器）

**门命令亲核**：`package.json` → `"e2e-parity:check": "node scripts/e2e-parity-check.mjs"`、`"e2e-parity:prove": "node scripts/e2e-parity.proof.mjs"`（§0 环境读数在位）。

**再生前红读数（本 worktree @ 89530dea 亲跑）**：

- `node scripts/e2e-parity-check.mjs` → **EXIT=1** · `valid=false` · **101 展示行** = `assertion_removed` 12 + `assertion_untracked` 81 + `test_removed` 3 + `test_untracked` 5；按文件分布：`e2e/full.e2e.ts` 79 行（7 removed + 72 untracked）+ `e2e/helpers/e2e-helpers.proof.ts` 22 行（5 removed + 9 untracked + 3 test_removed + 5 test_untracked）= 101。stats：fileCount=7 · **testCount=39** · **assertionCount=428** · floors=48/377 · effectiveFloors=37/350 · allowlistCount=7 · releaseEvidence=false。
- `pnpm run e2e-parity:prove` → **EXIT=1 · FAIL TC-e2e-parity-01-main**（首断言 `result.valid===true` 失败，错误集即上列 101 行）。
- **滞后量**：`git rev-list --count f548c0d9..89530dea` = **456**（公式同协调方勘误段：B1 EXEC `f548c0d9` 系账本末次同步点·`git log --follow` 全账 baseline.json 恰 2 commit=创建 `7da29707`+B1 EXEC `f548c0d9`；勘误段 452 系 `cd2f39cc` 点读数·+4 = i6-239 线并入口径）。

**展示行去重披露（§1 读数与 §2 锚数差的定谳·机器亲证）**：`scripts/e2e-parity-check.mjs` validate 出口 `new Set(errors)` 去重（同 code+path+展示 label 的多键并作一行），故 **101 是展示行数而非身份键数**。bag 级真 census（本刀以扫描器同源算法 `scanParitySources` 亲算）：

| 面 | full.e2e.ts | e2e-helpers.proof.ts | 合计 |
| --- | --- | --- | --- |
| 新增 assertion 键 / 单位 | 74 键 / 74 单位 | 20 键 / 21 单位（其一键 ×2·bag 语义全量追加） | 94 键 / **95 单位** |
| 新增 test 键 | 0 | 5 键 | **5** |
| 死亡 assertion 键（removedNEW） | 7 键（各 1 单位） | 10 键（各 1 单位） | **17 键** |
| 死亡 test 键 | 0 | 3 键 | **3** |

数学闭环（机器验证）：assertion scan 428 = expected 350（377−27 既有 allowlist）+ 95 增 − 17 死 ✓；test scan 39 = expected 37（48−11）+ 5 增 − 3 死 ✓。**§2 fail-closed 预注册锚一律用 bag census，不用展示行数**；EXEC 脚本任何超集/缺集即拒写。

**漂移出处（`git log -S` 逐源亲算 · 窗口=f548c0d9..89530dea·两漂移文件触者共 20 commit·键级闭合）**：

`e2e/helpers/e2e-helpers.proof.ts`（22 展示行·预判证实：主源=authz 5A-2 #100 HMAC 四段式重写）：

| commit | 并线 | 触面（numstat） | 身份账 |
| --- | --- | --- | --- |
| `8a8633ce` | 经 merge `4a5528a5`（authz-harden 5A-2 簇④ nail·#100 HMAC 单源四段式 ts 窗） | +23/−14 | 三个 webhook HMAC 源码锁 test 换名（3 test_removed ↔ 3 test_untracked·`orderId:txn:paid` → `orderId:txn:paid:ts 四段`）+ 其内断言条件随四段式/ts 单次绑定重写（10 死键 ↔ 15 空label键 + `ord-1:txn-1:paid:1700000000000`·`-S"ord-1:txn-1:paid:1700000000000"` 唯一命中） |
| `e2479961`（e2e-recruiter-gate C2） | 直落 | +29/−1 | 新增 2 test（`adminHeaders` 双臂·2 test_untracked）+ 其内 4 带 label 键（`Bearer ${token}`/`application/json`/`e2e-admin`/`number`） |

helpers 键级账：20 生键 = 16（8a8633ce）+ 4（e2479961）✓；10 死键 + 3 死 test 全归 8a8633ce ✓；22 展示行 = 8a8633ce 16 行（5 removed+3 test_removed+5 untracked+3 test_untracked）+ e2479961 6 行（4 untracked+2 test_untracked）✓。

`e2e/full.e2e.ts`（79 展示行·八源逐段·scene/batch 线对应）：

| commit | 线 | 身份账（census 键级） |
| --- | --- | --- |
| `3735d6b9`（经 merge `b345b761`） | e2e-scene-409（R1/R2/R3 三场） | `[路由R1]` 12 + `[路由R2]` 8 + `[路由R3]` 7（主源出生）+ `worker` 1 = **28 生键**（`-S"路由R1"/"worker)"` 命中） |
| `bcd9528e` | e2e-r3-v4-follow（R3 v4 随演 12+/4−） | R3 段集内换面——死面全在未入库的 3735d6b9 集内，**零 baseline 死键**（§1.3 死键表零 R3 行亲证）；终树 7 R3 键的键级出生分布交 EXEC 机器逐键核 |
| `182fd31a` | e2e-scene-batch2（R4 隐私 LIVE+R5 同意撤回·:488 后纯追加 225 行零删） | `[R4-A]` 6 + `[R4-B]` 10 + `[R5]` 10 + `data_or_permission` 1 = **27 生键**（`-S"R4-A-1"/"R5-0"/"R4-B-2b"` 命中） |
| `91c04145` | e2e-assert-refresh（红①红②断言随演） | `[异常]` 4 + `[异常前置]` 3（无额度→trial 赠与换面）+ `[状态机·held]` 1 + `[第4件·0157]` 3 + `data_or_permission` 1 = **12 生键**；死键 3（`[异常前置] 无额度` ×2 + `[状态机·恢复]`）（`-S"trial 赠与生效"/"trial 桶扣减"/"状态机·held"/"第4件·0157"` 命中） |
| `e2479961` | e2e-recruiter-gate C3 | `B端审批活契约` 2 + `data_or_permission` 1 = **3 生键**（`-S"B端审批活契约"/"admin approve → decided=true"` 命中） |
| `02b34474` | g7p4（consent 步捕获·assert 嵌实际 status） | `PIPL 采集同意 → 200 (实际 ${r.status})` 1 生键（死键 1：旧 label `PIPL 采集同意 → 200`） |
| `67efa6e7` | g7p5（start 步捕获·同形换面） | `[状态机] start…(实际 ${r.status})` 1 生键（死键 1：旧 `并返回可信跳转` 面） |
| `f8769cea` | g7fix2（boundLoop twin sync·:388 随 1789e321） | 出处审查 `identities=q+c 孪生同步 1789e321` 1 生键（死键 1：旧条件面） |
| `22dcdd21` | g7fix5（finalize 统一面+`replayed:false`） | `[状态机] finalize 统一面` 1 生键（死键 1：旧 `→ 200` 面） |
| `8a8633ce`（并线 `4a5528a5`） | authz 5A-2 rev2 | full.e2e +6/−2 **零断言行**（仅错签/未知单臂新鲜 ts 管线·diff 亲证）——**零键贡献** |

生键合计：28+27+12+3+1+1+1+1 = **74** ✓；死键合计：3+1+1+1+1 = **7** ✓。

**零漂移旁证**：扫描 7 文件中其余 5 文件 check 错误集零行（机器证）；窗口触面：`assert.ts`/`bounded-command.proof.mjs`/`local-e2e-receipt.proof.mjs` 零 commit；`interview.ts`/`performance.e2e.ts` 各恰 1 commit（`7a8fd22c` tscgate2 类型批）而 bag 净漂移零；账本四文件（两 JSON+两 scripts）窗口零触（`git log f548c0d9..HEAD` 空亲证）。

**扩面裁定（交预执行双审）**：① 键级归因终账（尤其 `data_or_permission` 3 键跨 `e2479961`/`91c04145`/`182fd31a` 三源、R3 7 键跨 `3735d6b9`/`bcd9528e` 两源、helpers 空label 15 键 + 1 键 ×2 单位的键级归属）由 §2 fail-closed 机器锚在 EXEC 落盘时逐键断言全等，本表为段级亲算账；② TC-01-main 同步面由 B1 形 4 数字扩为 **7 数字**（testCount/floors.testCount/effectiveFloors.testCount 本轮亦动，见 §2.1）。

## 1-续. Ban 面（本刀再生纪律·详见 §4）

沿 B1 EXEC `f548c0d9` 形：**Ban 手抄 digest**（全部身份由扫描器/bag 差集程序化提取·fail-closed 预注册锚定 §2.2）；**Ban 扰动既有身份顺序**（stable-merge·既有 377 assertion 身份与 48 test 身份相对顺序零扰动）；**TC-01-main 数字随 JSON 同步**（唯一锚点断言·数字是 JSON 的派生读数，`baseline.md:18` 自declare 禁手改旧数）；**Non-claims 铁律：parity 门绿 ≠ 门3 0 BUG ≠ 可发布 ≠ HTTP E2E 已跑 ≠ HA ≠ 覆盖增加**（静态账本面追平·恒 `releaseEvidence=false`·`e2e:isolated` 归另账）。

## 2. 再生设计（逐字段对照实树 · 程序化 · Ban 手抄）

**治理依据（`ai-docs/testing/e2e-parity-baseline.md` 只引不改）**：替换断言=「allowlist 写下旧身份和对应负 delta，同时把新身份追加进基线并上调 floors」；身份相对上一版基线只能追加，抹旧身份且 allowlist 未记录 → `baseline_identity_dropped`；`--print` 不写盘、不得当整文件覆盖稿。故纯覆盖式再生被治理文本与门机制双重排除，唯一合法路径=**追加式再生**（两 scope 各一 allowlist 条目·双条目系 allowlist 条目 path 一对一形制所定，B1 单条目先例的直系推广）。

**程序化裁定**：新增身份由 `scanParitySources` 实树提取（bag 差集·`untrackedAgainstBaseline` 同源算法），死键由 baseline−scan−既有 allowlist 程序化提取，零人工手抄；脚本 fail-closed 锚定 §2.2 预注册集，任何超集/缺集/他文件漂移即拒写。

### 2.1 逐字段前后值表（diff 审查面 · 交双审逐行对）

**`ai-docs/testing/e2e-parity-baseline.json`（`24f67f79` → 再生后）**：

| 字段 | 前 | 后 | 性质 |
| --- | --- | --- | --- |
| `files["e2e/full.e2e.ts"].assertions` | 84 项 | 158 项 | stable-merge 追加 74 新身份；既有 84 项相对顺序零扰动 |
| `files["e2e/full.e2e.ts"].assertionCount` | 84 | 158 | =数组长度 |
| `files["e2e/helpers/e2e-helpers.proof.ts"].assertions` | 223 项 | 244 项 | stable-merge 追加 21 单位（20 键·其一键 ×2） |
| `files["e2e/helpers/e2e-helpers.proof.ts"].assertionCount` | 223 | 244 | =数组长度 |
| `files["e2e/helpers/e2e-helpers.proof.ts"].tests` / `.testCount` | 31 项 / 31 | 36 项 / 36 | 追加 5 新 test |
| 其余 5 文件快照 | — | bag 全等 | 逐 bag 断言净漂移零 |
| `floors.testCount` | 48 | **53** | =各文件计数和（+5） |
| `floors.assertionCount` | 377 | **472** | =各文件计数和（+95） |
| `schemaVersion` / `releaseEvidence` / `scope` | 1 / false / 原文 | 全等 | 零 diff |

数学自洽：effective = 472 −（既有 −27 + 新 −17）= **428** = 实树扫描总数 ✓；test effective = 53 −（既有 −11 + 新 −3）= **39** ✓。

**`ai-docs/testing/e2e-parity-allowlist.json`（`47274510` → 再生后）**：entries 7 → **9**（尾部追加 2 条；既有 7 条字节全等）：

| 字段 | 条目 A | 条目 B |
| --- | --- | --- |
| `id` | `E2E-PARITY-20261012-parity-b2-regen-full` | `E2E-PARITY-20261012-parity-b2-regen-helpers` |
| `path` | `e2e/full.e2e.ts` | `e2e/helpers/e2e-helpers.proof.ts` |
| `removedAssertions` | 恰 7（§2.2 上段） | 恰 10（§2.2 下段） |
| `removedTests` | `[]` | 恰 3（§2.2 尾） |
| `removedFile` / `testCountDelta` / `assertionCountDelta` | false / 0 / −7 | false / −3 / −10 |
| `reason` | ≥24 字符含空格 · 禁词零命中 · id 全局唯一（叙事=f548c0d9→89530dea 窗口 scene/route 增量与断言随演、R4/R5 隐私面升 LIVE、recruiter 审批活契约、g7 捕获刀换面，替换身份入库未下调 floors） | 同左（叙事=authz 5A-2 #100 HMAC 四段式三 test 重写（并线 4a5528a5·8a8633ce）+recruiter-gate 双 adminHeaders test（e2479961），重写与新身份入库、被替换身份入账未下调 floors） |

**`scripts/e2e-parity.proof.mjs`（`8e67fda1` → 再生后）· 仅 TC-e2e-parity-01-main 数字随 JSON 同步**（`:90-97` 七行派生读数·唯一锚点各恰 1 次命中；B1 形 4 数→本刀 7 数·扩面裁定交双审）。断言逻辑与 fixture TC 全族零触碰：

| 断言行（`scripts/e2e-parity.proof.mjs:90-97`） | 前 | 后 |
| --- | --- | --- |
| `assert.equal(result.stats.testCount, N)` | 37 | **39** |
| `assert.equal(result.stats.assertionCount, N)` | 350 | **428** |
| `assert.equal(result.stats.floors.testCount, N)` | 48 | **53** |
| `assert.equal(result.stats.floors.assertionCount, N)` | 377 | **472** |
| `assert.equal(result.stats.effectiveFloors.testCount, N)` | 37 | **39** |
| `assert.equal(result.stats.effectiveFloors.assertionCount, N)` | 350 | **428** |
| `assert.equal(result.stats.allowlistCount, N)` | 7 | **9** |
| （valid/fileCount=7/releaseEvidence=false 三行） | — | 零 diff |

**`ai-docs/testing/e2e-parity-baseline.md`（`44e54fda` → 再生后）· 仅 :18 冻结数字行随 JSON 同步**（该行自declare「随 JSON 更新，禁止手改成旧数」）：`floors` **48 / 377** → **53 / 472**；effective 扫描 **37 / 350** → **39 / 428**；allowlist **7** 条 → **9** 条。其余全文零触碰；generation-trust 对该文件 required 词面全保留（base 绿 receipt 见 §3 步骤 3）。

### 2.2 fail-closed 预注册锚（17 死键 digest 前缀 + 3 死 test label·机器提取亲算·EXEC 全 digest 匹配）

full.e2e.ts 7 死键（label | conditionDigest 前缀）：

| label | digest 前缀 |
| --- | --- |
| `PIPL 采集同意 → 200` | `74ffed4a65f9` |
| `[异常前置] 无额度用户仍可完成简历处理同意` | `74ffed4a65f9` |
| `[异常前置] 无额度用户持有合法且本人所属的 resumeId` | `484f491b472c` |
| `[状态机] start 原子创建岗位专属会话(…)` | `ef0718f854ba` |
| `[状态机] 岗位会话出处审查: AI 分/progress 不是 B 端分` | `424cf09a68ff` |
| `[状态机] 岗位终态后 {} finalize → 200，服务端仅认已绑定 interview(…)` | `e55f0b81f452` |
| `[状态机·恢复] 评分不可用后显式重试创建新 attempt（旧会话不复活）` | `6491a1cd6ea3` |

e2e-helpers.proof.ts 10 死键（kind 为 `assert.equal`/`assert.match`/`assert.notEqual`/`assert.throws` 族·label 空·展示 label 即 kind）：

| kind | digest 前缀 |
| --- | --- |
| `assert.equal` | `21025b9444a8` |
| `assert.notEqual` | `6ef8ed47f213` |
| `assert.equal`（label `ord-1:txn-1:paid`） | `13939cc3bc3b` |
| `assert.match` | `59026ac6446c` |
| `assert.match` | `aae4d7f08789` |
| `assert.notEqual` | `5f32a30957f0` |
| `assert.notEqual` | `7f62fd8a47ff` |
| `assert.notEqual` | `906e09361259` |
| `assert.throws` | `2c949136e0e5` |
| `assert.throws` | `d56525187e90` |

3 死 test（helpers·label 全文锚）：`createOrder/payWebhook/entitlement 走对应 path+method，HMAC 用独立 createHmac 核对，错签不代签` · `full.e2e 源码锁：入账必须 200 且 credited|already，错签 403，未知单 404` · `支付 webhook HMAC 绑定 orderId:txn:paid，换单/换流水/换事件都不能复用签名`。

### 2.3 EXEC 再生命令（形沿 B1 EXEC f548c0d9·程序化追加式）

步骤 1——程序化再生两份 JSON（保存为 `/tmp/parity-b2-exec.mjs` 后 `node /tmp/parity-b2-exec.mjs`；骨架沿 B1 §2.3：bag 差集提取 added/removedNEW·双 scope 各一 stable-merge·锚定集换本卷 census·floors 用 `floorsFromFiles` 收口）：

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { scanParitySources, floorsFromFiles } from './scripts/e2e-parity-check.mjs';
const SCOPES = ['e2e/full.e2e.ts', 'e2e/helpers/e2e-helpers.proof.ts'];
// fail-closed 预注册（§1 census + §2.2 锚·任何偏差即拒写）：
const EXPECT_ADDED = { 'e2e/full.e2e.ts': { tests: 0, assertionUnits: 74 }, 'e2e/helpers/e2e-helpers.proof.ts': { tests: 5, assertionUnits: 21 } };
const EXPECT_REMOVED = { 'e2e/full.e2e.ts': { tests: 0, assertionKeys: 7 }, 'e2e/helpers/e2e-helpers.proof.ts': { tests: 3, assertionKeys: 10 } };
const DIGEST8 = [/* §2.2 十七键前缀·全 digest 机器匹配 */];
const keyOf = (i) => `${i.kind}\n${i.label}\n${i.conditionDigest}`;
const cmp = (a, b) => keyOf(a).localeCompare(keyOf(b));
const bag = (items) => { const m = new Map(); for (const i of items) m.set(keyOf(i), (m.get(keyOf(i)) ?? 0) + 1); return m; };
const fail = (msg) => { console.error('FAIL ' + msg); process.exit(1); };

const scan = scanParitySources(process.cwd());
if (scan.errors.length) fail('scan errors');
const baseline = JSON.parse(readFileSync('ai-docs/testing/e2e-parity-baseline.json', 'utf8'));
const allowlist = JSON.parse(readFileSync('ai-docs/testing/e2e-parity-allowlist.json', 'utf8'));
const alRemoved = { tests: new Map(), assertions: new Map() };
const addToBag = (m, items) => { for (const i of items) { const k = keyOf(i); m.set(k, (m.get(k) ?? 0) + 1); } };
for (const e of allowlist.entries) { addToBag(alRemoved.tests, e.removedTests ?? []); addToBag(alRemoved.assertions, e.removedAssertions ?? []); }

// added = scan − baseline bag；removedNEW = baseline − scan − 既有 allowlist（恰 §2.2 集且 digest 前缀全中）
// 其余 5 文件 bag 净漂移必须为零；双 scope 逐键断言 EXPECT_ADDED/EXPECT_REMOVED；
// stable-merge：既有身份相对顺序零扰动，新增按扫描器同源 comparator 落位；
// 双 allowlist 条目（§2.1 表 A/B）尾部追加；floors = floorsFromFiles(baseline.files)
// 且断言恰 {testCount:53, assertionCount:472}；2-space indent + 尾随换行写盘。
```

（EXEC 落盘版须写全并附 /tmp 干跑 receipt·本 REQUEST 只读零写盘·干跑归 EXEC 面或 pre-exec 双审要求时另做。）

步骤 2——TC-01-main 七数字同步（唯一锚点·任一非恰 1 次命中即拒写）：

```bash
node -e "
const fs = require('fs');
const p = 'scripts/e2e-parity.proof.mjs';
let t = fs.readFileSync(p, 'utf8');
const subs = [
  ['assert.equal(result.stats.testCount, 37);', 'assert.equal(result.stats.testCount, 39);'],
  ['assert.equal(result.stats.assertionCount, 350);', 'assert.equal(result.stats.assertionCount, 428);'],
  ['assert.equal(result.stats.floors.testCount, 48);', 'assert.equal(result.stats.floors.testCount, 53);'],
  ['assert.equal(result.stats.floors.assertionCount, 377);', 'assert.equal(result.stats.floors.assertionCount, 472);'],
  ['assert.equal(result.stats.effectiveFloors.testCount, 37);', 'assert.equal(result.stats.effectiveFloors.testCount, 39);'],
  ['assert.equal(result.stats.effectiveFloors.assertionCount, 350);', 'assert.equal(result.stats.effectiveFloors.assertionCount, 428);'],
  ['assert.equal(result.stats.allowlistCount, 7);', 'assert.equal(result.stats.allowlistCount, 9);'],
];
for (const [from, to] of subs) { const n = t.split(from).length - 1; if (n !== 1) { console.error('anchor not unique: ' + from + ' x' + n); process.exit(1); } t = t.replace(from, to); }
fs.writeFileSync(p, t);
console.log('TC-e2e-parity-01-main stats synced 37>39 350>428 48>53 377>472 37>39 350>428 7>9');
"
```

步骤 3——`e2e-parity-baseline.md:18` 三处数字同步（同唯一锚点纪律）：

```bash
node -e "
const fs = require('fs');
const p = 'ai-docs/testing/e2e-parity-baseline.md';
let t = fs.readFileSync(p, 'utf8');
const subs = [
  ['\`floors\` **48 / 377**（含已替换旧身份）', '\`floors\` **53 / 472**（含已替换旧身份）'],
  ['effective floors = 扫描 **37 / 350**', 'effective floors = 扫描 **39 / 428**'],
  ['allowlist **7** 条', 'allowlist **9** 条'],
];
for (const [from, to] of subs) { const n = t.split(from).length - 1; if (n !== 1) { console.error('anchor not unique: ' + from + ' x' + n); process.exit(1); } t = t.replace(from, to); }
fs.writeFileSync(p, t);
console.log('baseline.md:18 numbers synced');
"
```

## 3. EXEC Prove 计划（一次优先 · attempts 全账）

按序（每步 EXIT 记账，任何非预期读数 → 停止报账升级，Ban 静默重试）：

1. `pnpm run e2e-parity:check` → 期望 **EXIT=0** · `valid=true` · `errors=[]` · stats `{fileCount:7, testCount:39, assertionCount:428, floors:{53,472}, effectiveFloors:{39,428}, allowlistCount:9, releaseEvidence:false}`（§2.1 表机器复核）。
2. `pnpm run e2e-parity:prove` → 期望 **EXIT=0 一次优先**（TC-e2e-parity-01-main 全断言绿）。
3. `pnpm run generation-trust:prove` → 期望 **EXIT=0**（base 点已绿——本 REQUEST 亲测 receipt：`PASS generation-trust: policy encoded; …`，再生后 required 词面全保留）。
4. **反触碰亲算**：`git diff --stat e2e/ apps/ packages/` = 空；`git ls-tree HEAD -- e2e/full.e2e.ts e2e/helpers/interview.ts` 前后 blob 全等（`4cb481aa` / `4aee4a29`）；diff 形状 receipt：baseline JSON、allowlist JSON（+2 条目）、proof.mjs 恰 7 行换数、baseline.md 恰 3 处换数。
5. commit（作者/提交者 `mw-core <mw-core@meetwise.local>`，单 commit 恰 4 个产品面文件）后复跑步骤 1-2 各恰 1 次（post-commit previousBaseline 走 `HEAD^`·B1 EXEC 双案先例）。
6. **attempts 全账**：prove/check 每次 EXIT 与耗时逐条入 EXEC 收据；非预期红 = 停止升级（Ban retry-to-green、Ban 改 e2e 源凑绿、Ban 调 allowlist/reason 凑绿）。

### 3.1 基线已在红/绿的兄弟门（本刀不处置 · 只记账不扩面）

base 点 89530dea 亲测只读 receipt：`pnpm run generation-trust:prove` **EXIT=0**（须保绿）；`pnpm run docs:check` **EXIT=1**（3 类 69 行：`PTP_LOCAL_PATH` 66 + `PTP_EXTERNAL_REFERENCE_LINK` 2 + `PTP_CODE_HOST_URL` 1——B1 卷自身 ：12 行即在册·本卷照 B1 先例以绝对路径披露 worktree 将 +1 LOCAL_PATH 行=同面加重·**类集零新增**·Ban 借机修，另刀立项归协调方）。本刀 EXEC 后二门错误类零新增。

## 4. 硬 Ban（任务书④ 全列 + 本刀补充）

1. **Ban 借机改任何断言本体/测试逻辑**：`e2e/**`、`apps/**`、`packages/**` 零字节（反触碰钉①② blob 前后全等亲算入收据）；`scripts/e2e-parity.proof.mjs` 仅 TC-01-main 七个派生数字随 JSON 同步（`baseline.md:18` 自declare 数字以 JSON 为准），断言逻辑/比较子/fixture TC 全族零改；`scripts/e2e-parity-check.mjs` 零触碰。
2. **Ban 翻其他门红/绿**：base 绿门（`generation-trust:prove` EXIT=0 亲测；`e2e-static-guards`、`e2e-helpers:prove`、`e2e-case-inventory:prove` 等 e2e 面门——本刀零 e2e 触碰）必须保持绿；base 红门（`docs:check`）错误**类集**零新增（行面加重仅限本卷自身路径披露行·B1 先例），Ban 借机修。
3. **Ban 改共享 SSOT**：`execution-master-checklist.md` / `gap-bug-backlog.md` / `e2e-platform-integration.md`（其旧数 48/377、37/350、7 条系历史存档读数，**留档不动**）/ 矩阵 / sibling 归档——只读引用；本刀**不自建 SSOT 行**（立项出处=B1 卷勘误段，§0）。
4. **Ban 手抄 baseline**：全部身份由扫描器/bag 差集程序化提取；脚本 fail-closed 锚定（added 恰=§1 census 两 scope 集且 units/keys 全中；removedNEW 恰=17+3 且 §2.2 digest 前缀全中；其余 5 文件 bag 净漂移=0；floors 恰={53,472}；7+3 个文本锚点各恰 1 次命中）。
5. **Ban 扰动既有身份顺序**：stable-merge·既有 377 assertion 身份与 48 test 身份相对顺序零扰动；Ban 纯覆盖/整文件重写再生；Ban 抹旧身份（`baseline_identity_dropped`）；Ban 下调 floors（`floor_dropped`）。
6. **Ban 注入 `E2E_PARITY_BASE_REF`/`GITHUB_BASE_REF` 绕 previousBaseline 守卫；Ban 把 `--print` 输出当覆盖稿；Ban force-push；Ban self-approve（预执行/post-prove 双审均须独立外席）；Ban retry-to-green、Ban 改 e2e 源凑绿、Ban 调 allowlist/reason 凑绿。**
7. **Ban secrets**：不读不写 `.env*`；收据零键值；pre-commit `check-staged-secrets` 钩子照走。
8. **Non-claims 铁律**：Ban 把 parity 门绿写成「测试已跑/可发布/0 BUG/覆盖增加/HA」——本门系静态身份账本面追平，恒 `releaseEvidence=false`；HTTP E2E（`e2e:isolated`）、门3 0 BUG、HA、发布证据均不在本刀声明域。

## 5. 流程声明 + pins（任务书⑥）

REQUEST（本文）→ 预执行双审（mw-e2e-ha + mw-model-op 两外席·独立审·空审 stub 见 §7）→ meetwise 授权 → EXEC（程序化追加式再生 + §3 prove 一次优先 · 单 commit 恰 4 产品面文件：两 JSON + proof.mjs + baseline.md）→ post-prove 双审 → meetwise 授权 nail。执行地：worktree `meetwise-parity2` · 分支 `line/parity-b2-regen`。

pins 十一值照抄零翻：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained` · `公开 DELETE=503` · `g7SuiteGreen=false` · `actualSpendCny=null` · `r1Closed=false`。

## 6. 再生后终态预期（供 post-prove 双审对表 · est live=0）

`e2e-parity:check`/`:prove` **EXIT=0**；stats `7 / 39 / 428 · floors 53/472 · effective 39/428 · allowlist 9 · releaseEvidence=false`；`baseline_identity_dropped`/`floor_dropped`/`assertion_removed`/`assertion_untracked`/`test_removed`/`test_untracked` 全族零命中；e2e 面零字节变化（门绿纯来自账本面追平，非测试面任何改动）。**est live=0**：本刀全程零实跑零容器零 live 消耗（纯静态账本面）。

## 7. 交付物与本 commit

- `ai-docs/delivery/harness/parity-b2-regen-REQUEST.md`（本文·恰 1 新文件）
- `ai-docs/delivery/reviews/REQUEST-2026-10-12-parity-b2-regen-mw-e2e-ha.md`（空审 stub · 待审席填写·EXEC 面随卷）
- `ai-docs/delivery/reviews/REQUEST-2026-10-12-parity-b2-regen-mw-model-op.md`（空审 stub · 待审席填写·EXEC 面随卷）

本 REQUEST commit = 恰 1 文件（本文）、零其他 diff；作者/提交者 `git -c user.name=mw-core -c user.email=mw-core@meetwise.local`。

**markers=0 亲证**：本卷落卷时对全文行五类标记词检查（沿 `scripts/i6-239-gates.proof.mjs` §2-7 词面运行时组装定义：四类标记词 + 冲突标记符——词面本卷零复抄以避自指）grep 零命中（EXIT=1 亲证）；本卷自身 markers=0。

## 8. 授权三条款 + Not-a-pass 诚实尾条

**三条款（缺一不开工）**：
1. **预执行双审两外席 BOTH PASS**（mw-e2e-ha + mw-model-op·独立审·对 §1 归因账逐行对 §2.1/§2.2 锚表·扩面裁定两处（§1 ①②）明示裁可）；
2. **协调方明示授权开工**（本 REQUEST 状态行翻 `executed` 须凭授权记录）；
3. **EXEC 立项不得改 §1 归因账与 §5 pins/Ban**（账面数字如遇实树前移漂移 → 停止上报重锚，Ban 静默改账；§2 锚集即合同）。

Not a pass · not EXEC（再生未落 · 本 REQUEST docs-only）· not proven（prove 归 EXEC）· not run（零实跑零容器零 live；本刀读数均系只读静态门）· not 门绿（`e2e-parity:check`/`:prove` 在基线点 EXIT=1 retained·101 展示行零冲销）· not baseline 已再生（`24f67f79` 未动）· not 兄弟门处置（docs:check 预红留档）· not covered · not HA · not releaseEvidence · not nail · not coordinator authorize · not 预执行双审 done · `g7SuiteGreen=false` · `actualSpendCny=null` · `r1Closed=false` · alone ≠ dual
