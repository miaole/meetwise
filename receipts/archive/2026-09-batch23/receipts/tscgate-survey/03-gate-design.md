# TSC-GATE-1 门禁设计建议（产出 = 修复分批 REQUEST 输入·零实施）

## 1. 错数清零路径估算（11 → 0·四批·断链类优先沿 E2EFAIL-1 先例）

| 批 | 内容 | 错数 | 规模估 | 优先级依据 |
|----|------|------|--------|-----------|
| B1 断链 | full.e2e.ts:209 import 补齐（`:14` 加 `emitE2EFailure` 或按产品意图改调 `emitClassifiedE2EFailure`——修法归修复刀裁）+ 防回归负例 | 1 | 1-2 行 + 负例 TC | **最高**：运行时 ReferenceError 死路径，E2EFAIL-1（`83a6ec8b` ":14 import + static guard w/ 2 permanent red TCs"）同型先例在卷；注意该 commit 在 `line/g7-driver-assert` 未并本线——**修复 REQUEST 须先裁并轨/重放顺序**（避免双刀同文件冲突） |
| B2 真型不配 | interview.ts:180-182 includes→type-predicate（find 或 satisfies 收窄），零运行时语义变化 | 1 | ~3 行 | 次高：strict 无关真错 |
| B3 类型环境 | proof.ts `HeadersInit`/`RequestInfo`：`import type ... from 'undici-types'`（@types/node 传递依赖）或 e2e 局部 ambient d.ts；**禁为 2 错开 DOM lib**（污染面大） | 2 | 2 行 import | 中：类型面 only·tsx 运行时无感 |
| B4 strict 噪声 | sse.ts（捕获组解构收窄×2）·ocr-fixture.ts（glyph[row] 局部收窄×2）·performance.e2e.ts percentile 返回收口（3 调用点同根一修） | 7 | ~10 行 | 收尾：机械修·修完即满足 strict-on 全绿 |
| 门 | 修毕落 tsc 门（下节挂点）从绿挂起 + e2e-static-guards 负例常驻（E2EFAIL-1 双负例 TC 先例） | – | – | gate-from-green：门禁上线日即 0 错基线，此后只增不减 |

估算合计 ≈15-20 行·6 文件·4 批；每批独立可验（`tsc -p e2e/tsconfig.json --noEmit` 错数递减 11→0 可机器核）。B1 与 `line/g7-driver-assert` 的 `83a6ec8b` 同触 `:14` ——**REQUEST 立项时必须显式处理分叉**（rebase 重放或裁本线独立修后并轨）。

## 2. 门禁挂点三选项利弊（零实施·供 REQUEST 裁）

### 选项 A：static guards（scripts/e2e-static-guards.mjs 内加规则）

先例锚：`:95-:99` full.e2e.ts 三正则 required 规则（`interview_helper_import` 等）+ `:137-:141` IMPORT_PATTERN/CALL_PATTERN 面；backlog `gap-bug-backlog.md:868` 预设行明文处方「补 import + e2e-static-guards 门 + 双常驻负例 TC」（E2EFAIL-1 已沿此落地于其分支）。
- 利：CI 已挂（ci.yml `:56-59` 跑 `e2e-static-guards:check`+`:prove`）零新管线；负例 TC 惯形成熟（种植违规必红）；对 B1 单点断链是**精准防回归钉**。
- 弊：正则 ≈ 仿 tsc——只防**已知**断链复发，对未来新增 TS2304/2322/2532 覆盖为零；规则逐条维护；对格式漂移脆弱。
- 裁：**作为 B1 的常驻负例钉用（沿先例），不作为 tsc 替身**。

### 选项 B：独立 script（:check/:prove 惯形）

实测量：根 package.json `:check/:prove` 族 **491 个**（总 scripts 560）——本库最重惯形。形态估：`scripts/e2e-typecheck.mjs` wrapper + `e2e-typecheck:check`（tsc -p e2e/tsconfig.json --noEmit，错数>0 即红）+ `e2e-typecheck:prove`（种植违规必红·fail-closed 自证）。
- 利：完全合家法；带 prove 自证（本库门禁文化核心）；收据机器可读；临时 tsconfig 在修复刀转正为 tracked 文件即成真门。
- 弊：ci.yml 需加一行（新步骤）；与选项 C 的 turbo typecheck 语义重叠；wrapper 本身是需维护资产。
- 裁：**立即可落的最小真门**（e2e 域 strict-on 从绿挂起）。

### 选项 C：CI/turbo 原生（turbo typecheck 任务·现成落点）

亲证：turbo.json `:6` 已声明 `"typecheck": { "dependsOn": ["^build"] }` 但**全库空挂**——`grep '"typecheck"' apps/*/package.json packages/*/package.json` = 零实现（协调方引用行号 :25 与本 base 实况 :6 有漂移，以 :6 实测为准）。ci.yml 现有步骤链（`:45` docs:check → `:47-53` e2e-platform 三件 → `:56-59` static guards）为挂点模板。apps/api/tsconfig.json `include: ["src","test"]`、apps/web include 模式均可复制。
- 利：canonical 工具链·零自定义代码·turbo 缓存；**天然扩到 apps/packages src 面**（NEXT-NODE-BEST-PRACTICES C1/C2 正向）；一次立项全域受益。
- 弊： Blast radius 大——godfn-1d 收据在卷 apps/packages src 面存预存红（seams×4/TS2347 等），全域 typecheck **首日即红**，需按包渐进 include 或基线豁免先行；e2e/tsconfig.json 尚非 tracked 文件（须修复刀转正）。
- 裁：**战略方向**（C1/C2 主道），但首步应 e2e 域先行（红面最小），apps/packages 按包分批点亮。

### 合成建议（供 REQUEST 取舍）

**B+C 分层、A 作钉**：修复四批清零后，以选项 B 形态（e2e-typecheck:check/:prove）在 ci.yml static guards 步旁落地 e2e 域 strict-on 门（gate-from-green）；同一 REQUEST 或后续刀把 `typecheck` 脚本写进 e2e 域 package（turbo `:6` 任务即刻通电）作为选项 C 第一步；选项 A 仅落 B1 的双常驻负例 TC（E2EFAIL-1 先例 a fortiori）。**反对**：以放宽 strict（strict-off 门 11→4）换绿——探针已证残余 4 仍含真断链真型错（01 §4），且与 NEXT-NODE C1/C2 方向相逆。

## 3. Non-claims

本节 = 设计建议供料，非实施、非门禁落地、非任何修复；turbo/ci/package.json 本刀零触碰。
