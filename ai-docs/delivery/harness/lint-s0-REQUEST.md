# LINT-S0 — C1 lint 门 S0 切片（@meetwise/config devDeps 依赖落位 · EXEC REQUEST）

**Status**: **`exec:awaiting_post_prove_dual`**（pre_exec_dual BOTH PASS @`f728b509` · meetwise 协调方明示 EXEC 授权 · EXEC 已行使 2026-10-07 见 §9 · 送审史 append-only：`draft:awaiting_pre_exec_dual` → `exec:awaiting_post_prove_dual` · **Ban self-approve** · **alone≠dual**）
**Date**: 2026-10-07
**Base**: 主线 `feat/mysql-schema-skeleton` @`28db833f` · 分支 `line/lint-s0-request`（工作树 `meetwise-line-lints0`）
**蓝本**: `ai-docs/delivery/harness/lint-design.md` @`line/lint-design` @`75584fa6`（五节设计定稿 nail · EXEC 定稿 @`7942f26a`）——**唯一蓝本**：设计 §1.5 切片节 S0 行原文范围为全部授权面，**禁增删**；设计 §1.1 选型结论 + §1.2 规则集 + §1.3 门禁挂点为 S0 行的引用结论，只引不扩。
**Honesty**: 本档全部 file:line 锚点在 `line/lint-s0-request` @`28db833f` 实树亲读验证（packages/config/package.json、turbo.json、pnpm-lock.yaml:339、pnpm-workspace.yaml、根 package.json、ci.yml:39、NEXT-NODE-BEST-PRACTICES.md:40；行号错=审席 FAIL）；蓝本引文逐字誊录字节一致。**蓝本不在本 base 实树**（`lint-design.md` 在 `line/lint-design` 分支，`28db833f` 实树无此文件——以 `git show line/lint-design:ai-docs/delivery/harness/lint-design.md` 亲读，如实登记）。

---

## §0 依据（设计 nail + 勾销路径）

1. **立项依据**：`ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md:40` C1 ❌（亲读 @`28db833f`）：「lint/format 门禁（eslint9+prettier，import-order+no-explicit-any warn 起步）——❌ 当前零配置（台账 #13）」。零配置本刀再证：全仓 `find` 无 `.eslintrc*` / `eslint.config.*` / `biome.json*` / `.prettierrc*`；`grep -c "eslint" pnpm-lock.yaml` = **0** · prettier = **0** · biome = **0**（零安装现状亲证 @`28db833f`）。
2. **设计定稿**：LINT-DESIGN 五节设计已 nail（`line/lint-design` @`75584fa6`，post-prove dual BOTH PASS）。选型结论引用（设计 §1.1 原文）：「**选型结论：eslint 9 flat config 胜出 = C1 钉死组合（eslint9+prettier）原样兑现，无偏离。**」规则集引用（设计 §1.2）：lint 半边**四规则 warn 起步**（no-explicit-any / naming-convention / no-unused-vars / import-order）+ `--max-warnings N` 机器闸；format 半边 **prettier 独立条目**（`printWidth: 140` · `semi: true` · `singleQuote: true` · `trailingComma: 'all'`——参数钉死组合属 S1 config 产物内容面）。挂点引用（设计 §1.3）：turbo.json:8 `"lint": {}` 空槽已存在，**零变更即挂点就绪**（本 base 亲读 `turbo.json:9` 在场——设计 §1.3 锚 :8 为设计 base `e2834082` 行号；`7a8fd22c` tscgate2 点灯后 `//#typecheck` 入列致下移一行，@`28db833f` lint=`:9`，如实登记）。
3. **勾销路径**：C1 勾销 = 设计 §1.5 实施切片 **S0→S1→S2→S3→S4→S5 全链** + `pnpm turbo lint` 全量绿收据（设计 §3 验收 / §4 Non-claims）。**本 REQUEST 仅授权 S0 一片**——S0 ≠ 勾销（§7）。
4. **安装授权来源**：设计 §1.5 S0 行明文「**安装义务在实现刀·本刀零安装**」——pnpm install（网络行为 + lockfile 变更）由设计钉死授权给本实现切片，约束见 §1.3 安装纪律 + §5 Ban。
5. **本刀性质**：docs-only 起草（本档本身零码动零安装）；EXEC 行使面 = packages/config 一个 importer 的 devDependencies + lockfile 再生 + 收据。

## §1 范围（S0 行原文逐条 + deps 清单 + flat config 产物落位）

### 1.1 S0 行原文（设计 §1.5 逐字誊录）

设计 §1.5 切片链全文（context）：「S0 → devDeps 入 `@meetwise/config`（…）→ S1 → config 包产物（…）→ S2 → workspace 指针（…）→ S3 → `pnpm dlx` 瞬态 dry-run 全量 + 四规则真计数钉死 + `--max-warnings N` 基线定值（零修复·warn 态）→ S4 → per-workspace `"lint"` script 点亮（≤5 文件/批·两批）→ S5 → `pnpm turbo lint` 全量绿 + 收据。每切片独立可 revert；format 首跑 diff 若行使须独立 format-only commit 且属实现刀另行授权面——本设计 docs-only 不行使。est 0 live。」

**S0 行原文（本切片全部授权范围·逐字）**：

> S0 → devDeps 入 `@meetwise/config`（eslint@9 · typescript-eslint@8 · eslint-plugin-import 或 simple-import-sort · prettier@3；版本精确值由实现刀 pnpm install 落 lockfile 钉死；**安装义务在实现刀·本刀零安装**）

S0 范围唯一项：**devDependencies 落入 `@meetwise/config`**（四包·见 1.2）+ pnpm install lockfile 再生 + 收据。设计 §1.5 明文每切片 ≤5 文件——本切片 git 触碰面 = **2 文件 + 收据**（§3）。

### 1.2 deps 清单（设计选型钉死组合·四包）

设计 S0 行四包·major 线设计钉死；**版本精确值由实现刀 pnpm install 落 lockfile 钉死**（设计原文）。下表 registry 状态 = 2026-10-07 `npm view` 亲证快照，安装日可在设计钉死的 major 线内取当时最新 stable：

| # | 包 | 设计钉死 | registry 快照（2026-10-07 亲证） | 兼容性亲证 |
|---|---|---|---|---|
| D1 | `eslint` | `eslint@9` | latest 9.x = **9.39.5** | engines node `^18.18.0 \|\| ^20.9.0 \|\| >=21.1.0`——CI node-version: 22（`.github/workflows/ci.yml:39` 亲读）✓ |
| D2 | `typescript-eslint` | `typescript-eslint@8` | latest 8.x = **8.71.1** | peer eslint `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` ✓；peer typescript `>=4.8.4 <6.1.0`——仓 catalog `typescript: 6.0.3`（`pnpm-workspace.yaml` 亲读）✓ 上限内 |
| D3 | `eslint-plugin-import` | 设计二选一：`eslint-plugin-import` **或** `simple-import-sort`（§1.2 原文：「import-order（eslint-plugin-import 或 simple-import-sort，二选一落实现刀）」） | **裁定落 `eslint-plugin-import`**，latest 2.x = **2.32.0**；peer eslint `^2 \|\| … \|\| ^8 \|\| ^9` ✓ | **裁定依据（registry 亲证 2026-10-07）**：`npm view simple-import-sort versions` = 仅剩 `0.0.1-security` 占位、dist-tags `latest: 0.0.1-security`——原包全部版本已撤、不可装；设计明文「二选一落实现刀」→ 落未撤的可装支。安装日若 simple-import-sort 恢复可用，仍钉死本裁定不换（确定性优先；换装=偏离须另行授权） |
| D4 | `prettier` | `prettier@3` | latest 3.x = **3.9.9** | engines node `>=14` ✓ |

**prettier 归属闭环声明**：设计 S0 行明文 `prettier@3` 在列 → **prettier 安装属 S0 范围内**（非范围问题在此闭环，§2 不再列）。

目标 devDependencies 形态（`packages/config/package.json`·键名字典序=pnpm 写入序；caret 快照为 2026-10-07 参考值，安装日以 lockfile 为版本钉死 SSOT）：

```json
"devDependencies": {
  "eslint": "^9.39.5",
  "eslint-plugin-import": "^2.32.0",
  "prettier": "^3.9.9",
  "typescript-eslint": "^8.71.1"
}
```

### 1.3 安装纪律（S0 含 pnpm install·网络 + lockfile 变更·约束钉死）

1. **安装仅限设计指定 deps**：`pnpm --filter @meetwise/config add -D eslint@9 typescript-eslint@8 eslint-plugin-import@2 prettier@3`（或等效 package.json 手编 + 全仓 `pnpm install`）——**只许四包入 importer**，任何清单外包（含传递闭包之外的顺手加装）= Ban（§5）。
2. **装后 lockfile diff 审计义务**：`git diff pnpm-lock.yaml` 逐行审——只许 **importers.packages/config 新增 devDependencies 四项 + snapshots 段四包及其传递闭包的新增块**；任何**既有** specifier/version 条目的改写或删除 = FAIL（判据：diff 删除行中不得出现既有包条目）。
3. **禁顺带升级**：install 禁 `-L`/`--latest`/全仓 update 语义；catalog（`pnpm-workspace.yaml`）零字节零触；既有依赖零触碰。
4. **禁跨 major**：eslint@10 / typescript-eslint@9（如已发布）/ prettier@4 / eslint-plugin-import@3 均不在设计授权 major 线内，禁装。

### 1.4 flat config 产物文件落位（设计 §1.5 S1 预定位·**本切片非执行面**）

设计将产物落位划归 **S1**（原文：「S1 → config 包产物（packages/config 下 eslint flat base + prettier 配置 + package.json exports·≤3 文件）」）。为路径可追溯预告如下，**本切片一个产物文件都不落**（含四规则 warn 骨架——骨架属 S1 产物内容，§2.2）：

- `packages/config/eslint.config.base.mjs`（eslint flat base·四规则 warn 骨架——S1）
- prettier 配置 + `.prettierignore`（`printWidth: 140` · `semi: true` · `singleQuote: true` · `trailingComma: 'all'`；ignore：`dist/**`·`src/generated/**`·`pnpm-lock.yaml`·coverage——设计 §1.2 原文；S1）
- `packages/config/package.json` `exports` 扩充（`./eslint/…` · `./prettier/…`——S1；本切片 exports 键 :7-10 零字节）

**--print-config 冒烟归属**：S0 零 config 产物 → `eslint --print-config` 无产物可载、不可行使，**登记为 S1 首项冒烟**（本切片以工具链版本冒烟替代，§4.2·偏离模板之处如实登记）。

### 1.5 触碰面收束

git 触碰面 = `packages/config/package.json` + `pnpm-lock.yaml` + 收据 `ai-docs/delivery/receipts/lint-s0/`。`turbo.json` 零字节（:9 `"lint": {}` 空槽与 :4 `//#typecheck` 本 base 亲读在场（设计原文 :8/:6 为其 base `e2834082` 行号·`7a8fd22c` 后移位·非设计错）·均零触）；apps/packages src 零字节；11 workspace lint script 全零 + typecheck script 2/11 在场（`apps/web/package.json:17` · `packages/contracts/package.json:16` 本 base 亲读——设计 §1.3 双零为其 base `e2834082` 现状·`7da52c5b` c12 typecheck 点灯后 web+contracts 各 +1 行·现状不动零触）；根 package.json 零字节。

## §2 非范围

1. **S1–S5 全部**（设计 §1.5 原文为准）：S1 config 包产物（eslint flat base + prettier 配置 + package.json exports·≤3 文件）；S2 workspace 指针（根 `eslint.config.mjs` + 11 workspace 逐个 extends·≤5 文件/批·可拆两批）；S3 `pnpm dlx` 瞬态 dry-run 全量 + 四规则真计数钉死 + `--max-warnings N` 基线定值；S4 per-workspace `"lint"` script 点亮（≤5 文件/批·两批）；S5 `pnpm turbo lint` 全量绿 + 收据。
2. **规则内容零落**：四规则 warn 骨架（no-explicit-any 渐进收紧 / naming-convention / no-unused-vars `argsIgnorePattern: '^_'` / import-order `node:` → 外部 → `@meetwise/*` → 相对）只落 S1 config 产物面；本切片**零 `eslint.config.*` 文件——连骨架都不落**；零调参（`printWidth=140` 等参数钉死组合属 S1 配置内容）。
3. **CI 零触**：`.github/` 零字节（ci.yml:39 node-version: 22 仅作引擎兼容引证，零改）。
4. **apps/packages 源码零触**：零 lint run 全仓、零 `--fix`、零 `prettier --write`——format 首跑 diff 若行使须独立 format-only commit 且属实现刀另行授权面（设计 §1.5 明文），本切片不行使。
5. **设计 S0 四项外任何包 = 增 · 禁**：含 `eslint-config-prettier`（不在设计 S0 行清单）、`eslint-import-resolver-typescript`（若 S1 import/order 需 TS resolver，不在本清单→须另行授权）、`globals`、`eslint-plugin-n` 等一切未列包。
6. **catalog 零触**：`pnpm-workspace.yaml` catalog 段（typescript 6.0.3 等）零字节——单包 devDeps 不入 catalog；多 workspace 共享化属后续切片另议。
7. **turbo/C2 面零触**：`turbo.json` 零字节（lint 空槽点亮属 S4 面）；C2 `//#typecheck` 真 token 并线依赖问题（设计 §1.3）不属本切片。
8. **零规则生效声明**：S0 装完四包后仓库仍无任何 lint/format 配置——零 lint 能力变化、零 format 变化、零 CI 行为变化。

## §3 逐条改动清单（file:line 现状→目标·全数亲读 @`28db833f`）

| # | 码面 | 现状（亲读） | 目标 |
|---|---|---|---|
| C1 | `packages/config/package.json:6-11` | 全文 11 行：`:6` description「共享工程配置：tsconfig base/nest preset、**eslint**、tailwind preset。其余包 extends 它，单一真相。」（eslint 本就是 config 包章程 declared 职责位·设计 §1.1 引证）；`:7-10` `exports` 仅 `./tsconfig/base.json`·`./tsconfig/nest.json` 两键；**全文无 `devDependencies` 键** | `:10` `exports` 收尾 `}` 加逗号后新增 `devDependencies` 四键（1.2 JSON 形态·字典序）；name/version/description/exports 四键零字节零改 |
| C2 | `pnpm-lock.yaml:339` | `  packages/config: {}`——importer 空对象（无 dependencies/devDependencies 段·亲读）；全文件 `eslint`=0 · `prettier`=0 · `simple-import-sort`=0 · `biome`=0（grep 亲证） | `pnpm install` 再生：`:339` importer 展开为 devDependencies 四项（specifier+version）；snapshots 段新增四包及其传递闭包快照块。**审计判据（§1.3.2）**：diff 仅上述新增；任何既有条目改写/删除 = FAIL |
| C3 | `ai-docs/delivery/receipts/lint-s0/`（新增目录） | 无（receipts/ 父目录在场·`receipts/<knife>/` 惯例沿 lint-design 先例） | 收据落位（§4.5 清单）：package.json diff 快照 + lockfile diff 审计输出 + 版本冒烟输出 + sha256 |

**零改动面**（零字节亲证义务）：`turbo.json` · 根 `package.json` · `pnpm-workspace.yaml` · `apps/**` · `packages/**`（除 C1 一文件）· `.github/**` · `CLAUDE.md` · `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md`。

## §4 prove

1. **install 唯一性 + lockfile diff 审计**：装后 `git diff --stat` 全仓**仅两文件**（`packages/config/package.json` · `pnpm-lock.yaml`，收据除外）；`git diff pnpm-lock.yaml` 逐行审——仅 importers.packages/config devDependencies 四项 + snapshots 四包传递闭包新增块；**既有包条目零改写零删除**（禁顺带升级的机器判据）。
2. **工具链冒烟（--print-config 的 S0 等价替代·偏离模板之处如实登记）**：`pnpm --filter @meetwise/config exec eslint --version` = 9.x · `pnpm --filter @meetwise/config exec prettier --version` = 3.x · `pnpm --filter @meetwise/config exec eslint --print-config` **不可行使**——S0 零 config 产物（设计划归 S1），登记为 **S1 首项冒烟**；本切片以版本冒烟证明四包装得上、跑得动。
3. **零 lint run 全仓 · 零 --fix**：零 `eslint .`、零 `pnpm turbo lint`、零 `--fix`、零 `prettier --write`（format 首跑 diff 未授权·设计 §1.5 明文）。装完即停，四包零执行面（版本冒烟除外）。
4. **est live = 0**：四包均 devDependency registry 安装（网络行为仅包下载）；零业务外呼 · 零 Key 触碰 · `actualSpendCny=null`。
5. **收据 `ai-docs/delivery/receipts/lint-s0/`**：① `package.json.diff`（C1 前后快照）② `lockfile-diff-audit.txt`（C2 全量 diff + 既有条目零改写审计结论）③ `smoke.txt`（两版本冒烟原始输出 + --print-config 不可行使登记）④ `sha256.txt`（以上文件指纹）。收据入 git。
6. **EXIT=0 一次过**：Ban retry-to-green，attempts 全账如实入收据。

## §5 Ban（全列）

1. **Ban 全仓 lint 执行**：eslint 零 run · `pnpm turbo lint` 零触（turbo.json:9 空槽零字节零改）。
2. **Ban 自动修**：零 `--fix` · 零 `prettier --write` · 零任何源文件格式变更（format 首跑 diff 属实现刀另行授权面·设计 §1.5 明文）。
3. **Ban CI 接线**：`.github/` 零字节·零 workflow 零 step 增改。
4. **Ban SSOT 触碰**：`CLAUDE.md` · `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md`（C1 行 :40 勾销属后继刀全链验收时事项）· backlog/coverage matrix 零改。
5. **Ban secrets/.env/Key**：零凭据面本切片也无——staged 内容过 secret gate · 零 Key name-only 需求 · `actualSpendCny=null`。
6. **Ban 顺带升级/跨界安装**：安装仅限设计指定四 deps（§1.3）；既有依赖零触碰；catalog 零触；禁跨 major；`eslint-config-prettier` 等清单外包 = 增 · 禁。
7. **Ban 范围蔓延**：S1–S5 全部面（config 产物文件/规则骨架/workspace 指针/lint script 点亮/turbo lint）零字节。
8. **Ban self-approve**：本 REQUEST 只送 pre-exec 双审 · Dual PASS ≠ 开工 · **alone≠dual** · EXEC 须 meetwise 明示授权。

## §6 pins（十一值照抄·蓝本 §2 Ban 原文）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本切片零外呼·零消耗）

## §7 Non-claims

**S0 ≠ lint 门上线 ≠ C1 勾销**。S0 仅落 devDependencies：≠ 规则生效（零 config 文件）≠ 任何 lint 结果产出（零 run）≠ format 变更（零 --write）≠ CI 行为变化 ≠ `--max-warnings N` 基线存在（属 S3）≠ import-order/四规则可执行性证明（属 S1 产物+S2 指针）。`NEXT-NODE-BEST-PRACTICES.md:40` C1 勾销须 S0→S5 全链 + `pnpm turbo lint` 全量绿收据，本切片后 C1 仍 ❌。设计 §4 Non-claims 承继：warn 起步/计数预估均为设计面推演，实测以 S3 dry-run 为准。版本快照（9.39.5/8.71.1/2.32.0/3.9.9）为 2026-10-07 registry 观测，非钉死承诺——版本 SSOT = 安装日 lockfile。

## §8 STOP

**STOP · `awaiting_pre_exec_dual` · alone≠dual。** 本 REQUEST（docs-only 起草）写完即停零码动；EXEC（pnpm install 行使）须 pre-exec 双审 PASS + meetwise 明示授权；Ban self-approve；Ban retry-to-green。

---

*LINT-S0 EXEC REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`28db833f` · 分支 `line/lint-s0-request` · 蓝本=lint-design.md @`line/lint-design` @`75584fa6` §1.5 S0 行 · deps=eslint@9 + typescript-eslint@8 + eslint-plugin-import@2（二选一裁定：simple-import-sort 注册表已撤）+ prettier@3 入 @meetwise/config · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*

---

## §9 EXEC trail（append-only · 2026-10-07 行使记录）

**状态推进**：`draft:awaiting_pre_exec_dual` → **`exec:awaiting_post_prove_dual`**（pre_exec_dual BOTH PASS @`f728b509` · meetwise 协调方明示 EXEC 授权 · 本节为零改写追加，§0–§8 原文零字节零改）。

**行使面（恰蓝图 §1）**：C1 `packages/config/package.json` 新增 devDependencies 四键（eslint `^9.39.5` · eslint-plugin-import `^2.32.0` · prettier `^3.9.9` · typescript-eslint `^8.71.1`，字典序；name/version/description/exports 零改）；C2 `pnpm --filter @meetwise/config add -D eslint@9 typescript-eslint@8 eslint-plugin-import@2 prettier@3`（§1.3.1 首选命令）——EXIT=0 单次过（1m14.7s，pnpm 10.18.0 / node 22.22.3），lockfile 再生。

**prove 结果**：① 触碰面恰 2 文件（git diff --name-only 亲证；turbo.json/pnpm-workspace.yaml/根 package.json/.github//CLAUDE.md/BEST-PRACTICES/11 workspace pkg/apps+packages src 全零字节）；② lockfile 审计：键集 823→1014，disappeared 集为 **空**（既有包零消失零版本改写）；22 删除行定性 = 1 行 C2 锚点展开（蓝图预期）+ 6 键移位/marker 重构（es-define-property/estree-util-is-identifier-name/gopd/has-symbols/math-intrinsics/object-inspect，前后均在场）+ 15 行 `optional: true` 翻转（新闭包硬依赖路径再达，pnpm 再生语义）——字面删除行含 6 既有键如实披露供双审复核；新增 191 键全属四包闭包；lockfileVersion 9.0 未变；③ 版本冒烟：eslint v9.39.5 · prettier 3.9.9 · typescript-eslint 8.71.1 · eslint-plugin-import 2.32.0（全 EXIT=0，major 线内）；④ `--print-config` 不可行使按 §1.4 登记为 S1 首项冒烟；⑤ est live=0 · actualSpendCny=null。

**停止条件核查**：a) peer 冲突——未命中（typescript@6.0.3 落 tse cap <6.1.0 内，install 零 ERR_PEER 冲突输出）；b) 闭包外变更——未命中（新增 191 键全属四包闭包，既有键零改写）；c) major 线外——未命中（四包全落设计钉死 major 线）。

**如实披露**：install 输出含 `WARN deprecated eslint@9.39.5`——npm 亲证 deprecation 文案 "This version is no longer supported…"（v9 线进入 maintenance、v10 为 latest@10.12.0）；9.39.5 为 9.x 终版，设计钉死 @9 线内无替代版本，跨 major 属 Ban（§1.3.4）+停止条件 c，故按钉死线安装并如实登记（收据 install-output.txt）。

**收据**：`ai-docs/delivery/receipts/lint-s0/`（install-output.txt · package.json.diff · lockfile-diff-audit.txt · smoke.txt · zero-pollution.txt · sha256.txt）。

**Non-claims 承继（§7 原样）**：S0 ≠ lint 门上线 ≠ C1 勾销；装后仓库仍零 lint/format 配置零 CI 变化；NEXT-NODE-BEST-PRACTICES.md:40 C1 仍 ❌。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
