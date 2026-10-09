# TSCGATE-2 — attempts 全账 + erratum 台账

## 1. attempts 全账（EXEC 期全部迭代·无隐藏跑）

- **attempt-B2-1**：d.ts 按蓝图钉值并集塑（`Record<string, string|readonly string[]>` 无 undefined）→ tsc 复跑出**蓝图 10 错清单外新错** `proof.ts(79,29) TS2345`：`init?.headers` 经 @types/node→undici-types@8.3.0（.pnpm 内可解析）解析为真身 `HeadersInit = [string,string][] | HeaderRecord | Headers`，其中 `HeaderRecord`（header.d.ts:161 mapped type over `HeaderNames|Lowercase<HeaderNames>`·KnownHeaderValues 值域·optional）索签值域为 `string | undefined`（IANARegisteredMimeType|undefined 子型），不可赋给无 undefined 的 Record 值域——**与验收门 1（EXIT=0）数学不可两全**；蓝图 B2 括注「HeaderRecord KnownHeaderValues 收窄**适度放宽**=tests 面 non-claim」即授权面 → **attempt-B2-2**：record 值域加 `| undefined`（仍在新增 d.ts 内·零 any·零逻辑·1 token 级放宽）→ EXIT=0。登记为 erratum-E5（EXEC 新发现·协调方裁决保留权）。
- **attempt-A1（turbo）**：`turbo.json` 增 `"//#typecheck": {}` + root 仅 `typecheck:e2e` script → dry=json：`//#typecheck` **入选但 command=`<NONEXISTENT>`**（turbo 2.10 根任务=按名查根 package.json 同名 script·根无 `typecheck`）。
- **attempt-A2（turbo）**：root 补 `"typecheck": "pnpm typecheck:e2e"` 别名（package.json script=Ban 面明示许可面；任务书钉值 script `typecheck:e2e` 保持原样不变）→ dry=json：**18 槽位·恰 1 runnable=`//#typecheck`·command 逐字 `pnpm typecheck:e2e`**（蓝图 rev4 预言原值命中）·17 个 NONEXISTENT 跳过。
- **run 计数**：tsc 共 4 次（R1 空选弃跑·R2 基线 10 错·R3 中途 1 新错·R4/验收 0）；turbo dry=json 共 2 次（A1/A2）；四门验收恰 1 run 批（00-manifest §四门）·零重跑零取优。

## 2. erratum 台账（蓝图 ×4 照抄 + EXEC ×1）

| # | 内容 | 来源 |
|---|------|------|
| E1 | B4 码标：sse.ts **TS2322×1(:10)+TS2345×1(:12)** 非 ×2 | 蓝图 §4（rev2 双席） |
| E2 | 「41 错」系 **apps/worker 非 api**（api=26） | 蓝图 §4（rev2 双席） |
| E3 | B4 performance **TS2532×3 非 ×5**（总 7/总 10 不变） | 蓝图 §4（rev2→rev3） |
| E4 | **B2 :70 TS2552**（RequestInfo·rev4 席2 补入：基线实测 proof.ts:70 确为 TS2552「Did you mean 'RequestInit'?」·R2 原值吻合） | 蓝图 rev4 |
| E5 | **B2 HeadersInit record 值域加 `\| undefined`**：蓝图钉值并集与验收门 1 冲突（undici HeaderRecord 索签值域 `string\|undefined`·proof.ts:79 TS2345 实测）·依蓝图括注「适度放宽=tests 面 non-claim」执行·**EXEC 新发现** | 本刀 attempt-B2-1/2 |

## 3. 计数漂移登记（非 erratum·如实记账）

- 蓝图书「10 workspace `#typecheck` 槽位 `<NONEXISTENT>`」·实测 **11** 个 workspace `#typecheck` 槽位 NONEXISTENT（ai-graphs/ai-runtime/api/config/contracts/db/db-mysql/domain/qdrant-store/web/worker）+6 个 `^build` 依赖槽位 NONEXISTENT=17——性质同为「预期跳过·勿误 STOP」，多 1 个为席2 实测时点后包数漂移（config/db-mysql 在 packages 列表）。

## 4. 预存红登记（本刀验收单外·sibling 债）

- `pnpm docs:check` EXIT=1 `public_text_policy:PTP_FILE_LIMIT:4081`：管辖文件数 4081 ≫ MAX_FILES=2048（public-text-policy.mjs:40）——本刀 untracked 新增恰 9 文件（7 收据+d.ts+tsconfig.e2e.json），**base 侧 ≈4072 已深红**，非本刀引入；docs:check 不在本刀四门+§4 验收单（pre-commit 仅 secrets 扫描）——登记 sibling 债归协调方（与 e2e-parity 同性质）。
