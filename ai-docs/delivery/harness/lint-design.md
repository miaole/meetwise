# LINT-DESIGN — C1 lint 门独立设计刀（docs-only 设计定稿）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落席 mw-core · 蓝本 = REQUEST rev2 `@6ffe80df` 唯一蓝本 · base = 主线 `e2834082` · 分支 `line/lint-design` · 立项依据 = `ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md:40` C1 ❌〔仓内零 lint 配置亲证：无 .eslintrc / eslint.config.* / biome.json / .prettierrc〕）· rev2 席2 三处方全部兑现：处方1 → §1.4 预估方法双道钉死 · 处方2 → §1.2 format 半边设计条目 · 处方3 → §1.3 真 token 精确表述。

## 1. 手段（docs-only 设计定稿·零产品码）
`ai-docs/delivery/harness/lint-design.md` 扩写为五节设计定稿：

### 1.1 工具选型对比（三路径 · 六维度）
| 维度 | eslint 9 flat config | biome | oxc-lint |
|---|---|---|---|
| 性能 | Node 进程·三者最慢（本仓 src ≈5.5 万行·秒级至十秒级，可 turbo 缓存摊薄） | Rust 单二进制·典型 10–30× 于 eslint | Rust·对标 biome 或更快（截至本刀未 GA） |
| config 格式 | `eslint.config.mjs`（TS/JS 代码级·可编程 override·monorepo 多目录 glob 原生） | `biome.json`（JSON 声明式·单文件全仓） | 以兼容 eslint flat config 为目标（形态未定型） |
| format 归属 | **不含 formatter → 独立 prettier（= C1 钉死组合）** | 内置 formatter·format 归属 biome | 不含（oxc-format 另立·实验态） |
| 规则生态 | 最大：typescript-eslint（含 **type-aware** 规则·projectService）/ import 顺序 / naming-convention 全量·NestJS 装饰器场景成熟 | 规则数百条·**无 type-aware**·插件 API 面窄 | 起步期·eslint 插件兼容在途 |
| 渐进收紧支持 | 成熟三档：`warn` severity → 逐目录 glob override 升 `error` → 行级 `eslint-disable` 配额治理 | severity + overrides 可用·行级禁用较粗 | 部分支持·语义漂移风险 pre-GA |
| 仓内兼容性 | `@meetwise/config`（packages/config/package.json description）**章程明文 declared**："tsconfig base/nest preset、**eslint**、tailwind preset…单一真相"——eslint preset 本就是 config 包的既定职责位；lockfile eslint=0 零历史包袱 | 单配置可入 config 包·但 type-aware 缺位直接削弱 no-explicit-any 严格化主诉求 | lockfile "oxc" 60 行**全部**为 `@swc/core → @swc-node/register → oxc-resolver@11.21.3 → @oxc-resolver/binding-*` 平台二进制·**非 oxc-lint 工具链先例**；零先例 + pre-GA |

**选型结论：eslint 9 flat config 胜出 = C1 钉死组合（eslint9+prettier）原样兑现，无偏离。** 理由四条：① no-explicit-any 的收紧终局需要 type-aware 判别力（biome/oxc 缺位）；② naming-convention（NestJS 装饰器参数命名）与 import-order 在 typescript-eslint+import 生态是现成成熟件；③ 性能劣势非本仓瓶颈——lint 是日频门禁非热循环，且 typecheck 才是时长大头；④ biome 的最大卖点（内置 format）在本对比中权重归零，因 C1 已把 format 半边独立划给 prettier。

**偏离授权来源声明（REQUEST rev2 条款兑现）**：本设计若 biome 胜出，授权来源 = 本 §1.1 对比表结论（设计自身即授权载体，明文于此）；现结论未偏离 C1 处方组合，故**无需偏离授权**，对比表仍作为选型可追溯性凭据存档。biome 胜出分支仅在 §1.2 format 半边留档未行使。

### 1.2 规则集设计
**lint 半边**（全部 warn 起步·首日零红结构保证）：
1. `@typescript-eslint/no-explicit-any`：**warn 起步渐进收紧**。残余面实数（本刀 grep 亲证）：`req: any` = **88**（apps/api 口径·`grep -rn "req: any" --include="*.ts" apps/api` = 88 逐字复现蓝本口径）· `c: any` = **19**（src 口径·7 文件：interview.service/interview-report/interview-assessment/interview-learning/resume.service/profile.service/roles.service）· `catch(:any)` = **0**（src 口径·GODFN-1d 消零亲证成立；测试面另有 66 处 `catch(error: any)` 集中于 `*.proof.ts`，不在第一阶段 scope）。收紧路径 = warn 基线计数钉死 → §1.4 分批清零 → 逐模块 glob override 升 error。
2. `@typescript-eslint/naming-convention`：types/classes/interfaces PascalCase（interface 禁 `I` 前缀）· variables/functions/成员 camelCase·常量 UPPER_CASE·`allowLeadingUnderscores: true` 存量宽容起步；面未预演 → 点亮日 dry-run 实测计数后定 warn→error 批次。
3. `@typescript-eslint/no-unused-vars`：warn 起步·`argsIgnorePattern: '^_'`；面 grep 不可靠测 → 点亮日 dry-run 实测定值。
4. import-order（eslint-plugin-import 或 simple-import-sort，二选一落实现刀）：顺序 = `node:` 内建 → 外部包 → `@meetwise/*` → 相对路径；warn 起步（存量 import 块已大体遵守·`interview.service.ts:1-19` 亲证样本）。

severity 总则：四规则全 warn 起步 + `--max-warnings N` 闸（N = 点亮日 dry-run 实测基线计数）——「warn 起步」由此从口头约束变机器可断言：**存量不破门、潜增即红**。

**format 半边（eslint9 胜出 → prettier 配置独立条目·对齐仓内隐式惯例）**：
- `printWidth: 140`——实测依据：apps+packages src 54,997 行中 >120 占 3.4%（1,848 行）·>140 占 1.5%（840 行）；仓内隐式惯例为长行不折（import 单行至 ~250 字符亲证）→ 140 是把首跑 format churn 压至最低档的可读性折中；首跑 format diff ≈ O(百行级)，**须独立 format-only commit**；终值在实现刀以 `pnpm dlx prettier` 瞬态 dry-run 双向计数复核后钉死。
- `semi: true`（全仓分号亲证）· `singleQuote: true`（`from '…'` 单引号、双引号零样本亲证）· `trailingComma: 'all'`（多行 import 末项尾逗号 61 处亲证）· 缩进 2 空格零 tab 亲证。
- 配置落位：`@meetwise/config` 导出 prettier 配置 + `.prettierignore`（`dist/**`·`src/generated/**`·`pnpm-lock.yaml`·coverage）。
- **biome 胜出分支（存档未行使）**：format 归属 biome（`biome.json` formatter 段）·prettier 不引入——本分支随 §1.1 结论落选，仅留档保证选型可追溯。

### 1.3 门禁挂点
- turbo.json:8 `"lint": {}` 空槽**已存在**（与 :6 `typecheck` 同层兄弟任务——结构兼容性天然成立）→ **turbo.json 零变更即挂点就绪**；点亮面全部在 per-workspace package.json `"lint"` script 同层点亮（11 workspace 现状亲证：lint/typecheck script **双零**——apps/api·apps/web·apps/worker·packages/ai-graphs·ai-runtime·config·contracts·db·db-mysql·domain·qdrant-store 全部无此二 script）。
- **真 token 精确表述（rev2 处方3）**：C2 门 = `//#typecheck` 根任务 `@line/tsc-fix-batches@2ff8b73d`（**并线依赖：该 token 不在本 base——root package.json 无 typecheck script，turbo.json:6 空 `typecheck` 槽非门，勿引**）。lint 门独立于 C2：`pnpm turbo lint` 命中 `lint: {}` 空槽 × per-workspace lint script；lint 是否并入 C2 根任务 dependsOn = 后续刀，不在本设计授权面。
- per-workspace script 形态：`"lint": "eslint . --max-warnings <N>"`（N=点亮日基线）。

### 1.4 首日红预估
**预估方法钉死（rev2 处方1）**：lockfile eslint=0 亲证（`grep -c "eslint" pnpm-lock.yaml` = **0**·biome=0·prettier=0 同证·传递依赖零）⇒ 零安装全仓 dry-run 不可能 → **双道并行钉死入设计**：
- **主道 = `pnpm dlx` 瞬态 dry-run**（授权来源 = §2 Ban 明文：package.json/lockfile 零变更·执行后 `git diff --exit-code package.json pnpm-lock.yaml` 亲证义务）——点亮日行使，产出四规则全量真计数与 `--max-warnings N` 基线；
- **代理道 = grep 静态预估**（沿残余 req:any 亲证先例）——本刀已行使，实数如 §1.2 表。

**残余面实数汇总（蓝本口径 + 口径差如实登记）**：`req: any` = 88（apps/api 口径·逐字复现）；src 词边界口径 = 86；全仓同法（含 apps/worker/smoke/scoring-eval.ts:43 一处）= 89。`c: any` = 19（src 口径精确复现）·全仓含测试 = 39。`catch(:any)` = 0（src 口径精确复现）·测试面 66。更宽 typed-any 面（`ident: any` src）= 149——no-explicit-any 终局收紧的远景存量，不进首日 scope。口径差成因 = 词边界 + 目录 scope（apps/api/test 含 2 处），三口径并存注明，分批清零以蓝本口径 88 为基线计数。

**首日红结论**：warn 起步 + `--max-warnings N` ⇒ **首日红 = 0（结构保证）**。若做 error 化预演（假设计数）：req:any 88 + c:any 19 = **107**（蓝本口径）；naming-convention / no-unused-vars / import-order 三规则面未测 → 点亮日 dry-run 实测后定值，禁伪称预估数。

**分批清零路径**（每批 ≤5 文件 ≤50 行）：B1 `interview.controller.ts` 恰 1 文件 24 处（27% 面）；B2 其余 controller 按模块约 8 文件（privacy 8 · resume/recruiter/quiz/profile/jobs/diagnosis/admin 各 6）；B3 `c: any` 7 service 文件 19 处；B4 测试面 66 处 catch-any（低优先·*.proof.ts）；B5 逐模块 warn→error glob override。修法方向 = 落窄类型（FastifyRequest/统一 principal 类型），不做 `any` 改 `unknown` 的假清零。

### 1.5 实施切片建议（每步 ≤5 文件 / ≤50 行·lockfile 与 config 包除外）
S0 → devDeps 入 `@meetwise/config`（eslint@9 · typescript-eslint@8 · eslint-plugin-import 或 simple-import-sort · prettier@3；版本精确值由实现刀 pnpm install 落 lockfile 钉死；**安装义务在实现刀·本刀零安装**）→ S1 → config 包产物（packages/config 下 eslint flat base + prettier 配置 + package.json exports·≤3 文件）→ S2 → workspace 指针（根 eslint.config.mjs + 11 workspace 逐个 extends，≤5 文件/批·可拆两批）→ S3 → `pnpm dlx` 瞬态 dry-run 全量 + 四规则真计数钉死 + `--max-warnings N` 基线定值（零修复·warn 态）→ S4 → per-workspace `"lint"` script 点亮（≤5 文件/批·两批）→ S5 → `pnpm turbo lint` 全量绿 + 收据。每切片独立可 revert；format 首跑 diff 若行使须独立 format-only commit 且属实现刀另行授权面——本设计 docs-only 不行使。est 0 live。

## 2. Ban
零产品码（纯设计文档·apps/packages src 零 diff）·零 npm 包安装（设计文档不含 package.json 变更）·**pnpm dlx 瞬态执行授权（package.json/lockfile 零变更·用后 `git diff --exit-code package.json pnpm-lock.yaml` 亲证义务）**·Key name-only·est 0 live·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 3. 验收
设计文档（本件：选型对比表 §1.1 + 规则集清单 §1.2 + 门禁挂点 §1.3 + 首日红预估 §1.4 + 实施切片建议 §1.5）+ 实测记录 §5 + 收据 `ai-docs/delivery/receipts/lint-design/`（设计文档快照 + sha256）。

## 4. Non-claims
设计 ≠ 实施 ≠ lint 门上线 ≠ C1 勾销。§1.2/§1.4 计数为 grep 静态代理与结构推演，非 lint 工具实测；实测数以实现刀 S3 dry-run 为准。

## 5. 实测记录（EXEC 本刀·grep 代理道亲证）
- lockfile 四计数：`grep -c "eslint" pnpm-lock.yaml` = 0 · biome = 0 · prettier = 0 · "oxc" = 60（全为 `@swc/core → oxc-resolver@11.21.3 → @oxc-resolver/binding-*` 平台二进制·pnpm-lock.yaml:5272-5276 亲证——非 oxc-lint 先例）。
- `req: any`：apps/api 口径 = 88（15 文件·top = interview.controller.ts 24）·src 词边界 = 86·全仓 = 89（+worker smoke 1）。`c: any`：src = 19（7 文件清单见 §1.2）·含测试 = 39。`catch(:any)`：src = 0（GODFN-1d 成立）·测试面 = 66。src typed-any 宽口径 = 149。
- 格式惯例：semi=true · singleQuote=true · trailingComma=多行尾逗号（61 处样本）· 2 空格缩进零 tab · 行长分布 54,997 行：>100 = 4,180（7.6%）·>120 = 1,848（3.4%）·>140 = 840（1.5%）·>160 = 397（0.7%）。
- 门禁面：turbo.json:8 `"lint": {}` 与 :6 `"typecheck": { "dependsOn": ["^build"] }` 同层亲证；11 workspace lint/typecheck script 双零亲证；root package.json 无 typecheck script（C2 门真 token 并线依赖亲证）。
- 立项依据：`ai-docs/engineering/NEXT-NODE-BEST-PRACTICES.md:40` C1 ❌（eslint9+prettier·import-order+no-explicit-any warn 起步）。
- 本刀红线亲证：`git diff --stat -- apps packages` 零输出（apps/packages src 零 diff）·pnpm-lock.yaml/package.json 零 diff·零 dlx 行使（本刀代理道已足·主道留实现刀）。
