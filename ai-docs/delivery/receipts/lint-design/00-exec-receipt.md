# LINT-DESIGN · C1 lint 门独立设计刀（docs-only 设计定稿）· EXEC 收据（attempt 1）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落 mw-core · 蓝本 = REQUEST rev2 `@6ffe80df` 唯一蓝本 · worktree `/Users/miaole/Desktop/golucky/meetwise-line-lint` · 分支 `line/lint-design` · base = 主线 `e2834082` · docs-only 零产品码零安装零 dlx 行使 · rev2 席2 三处方全兑现 · STOP awaiting post-prove dual · post-prove 双审归协调方派 · Ban self-approve）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false（脚注：actualSpendCny=null）

## 0. Base 与执行地
- 执行地：worktree `/Users/miaole/Desktop/golucky/meetwise-line-lint`（分支 `line/lint-design` · EXEC 起点 = `6ffe80df` 工作树 clean 亲证）。
- 蓝本：REQUEST rev2（`56eb8d5e` 立项 + `6ffe80df` rev2 席2 三处方）· 逐条兑现：处方1 → 设计 §1.4 双道钉死（主道 `pnpm dlx` 瞬态 dry-run 授权 + 代理道 grep 本刀已行使）；处方2 → 设计 §1.2 format 半边独立条目（prettier printWidth=140/semi/singleQuote/trailingComma='all' 对齐仓内隐式惯例·biome 分支留档未行使）；处方3 → 设计 §1.3 真 token（C2 门=`//#typecheck` 根任务 `@line/tsc-fix-batches@2ff8b73d` 并线依赖标注·勿引 turbo.json:6 空槽）。

## 1. 交付面（docs-only·diff 亲证）
- `git status --short` = 恰 1 文件 `ai-docs/delivery/harness/lint-design.md`（20 行骨架 → 五节设计定稿扩写）。
- 红线亲证：`git diff --stat -- apps packages` 空输出（**apps/packages src 零 diff ✓**）· `git diff --stat -- package.json pnpm-lock.yaml` 空输出（**manifest/lockfile 零变更 ✓**）· 零 npm 安装 · 零 `pnpm dlx` 行使（代理道 grep 已足·主道留实现刀·零瞬时通道动用）。

## 2. 设计要点（详见快照 01-lint-design.snapshot.md）
- **§1.1 选型**：eslint 9 flat config / biome / oxc-lint 六维度对比表（性能·config 格式·format 归属·规则生态·渐进收紧·仓内兼容性）→ **eslint9 胜出 = C1 钉死组合（eslint9+prettier）原样兑现无偏离**；偏离授权来源条款按 rev2 字面落笔（biome 胜出时授权来源=本对比表结论；现未偏离故无需）。仓内关键证据：`@meetwise/config` 章程 description 明文 declared "eslint…单一真相"（packages/config/package.json）；lockfile "oxc" 60 行全为 `@swc/core→oxc-resolver@11.21.3→@oxc-resolver/binding-*` 平台二进制（pnpm-lock.yaml:5272-5276），**非 oxc-lint 先例**。
- **§1.2 规则集**：lint 半边四规则全 warn 起步 + `--max-warnings N` 机器可断言闸（no-explicit-any / naming-convention / no-unused-vars / import-order）；format 半边 prettier 独立条目 printWidth=140（实测行长分布定档）·semi=true·singleQuote=true·trailingComma='all'。
- **§1.3 门禁挂点**：turbo.json:8 `"lint": {}` 空槽与 :6 typecheck 同层亲证 → **turbo.json 零变更即挂点就绪**，点亮面全在 per-workspace `"lint"` script（11 workspace lint/typecheck script 双零亲证表）。
- **§1.4 首日红**：lockfile eslint/biome/prettier 计数全 0 亲证（`grep -c`）⇒ 零安装 dry-run 不可能 → 双道钉死。残余面实数（本刀 grep 亲证）：`req: any`=88（apps/api 口径逐字复现蓝本·15 文件 top=interview.controller.ts 24）·src 词边界口径=86·全仓=89（+worker smoke 1）——三口径并存如实登记；`c: any`=19（src 口径精确复现·7 文件）；`catch(:any)`=0（src 口径精确复现·GODFN-1d 成立·测试面 66 不进首日 scope）。首日红=0（warn 结构保证）·error 化预演计数 107（88+19 蓝本口径）。分批清零 B1–B5 每批 ≤5 文件 ≤50 行。
- **§1.5 切片**：S0 devDeps 入 @meetwise/config → S1 config 包产物 → S2 workspace 指针 → S3 dlx 瞬态 dry-run 计数钉死 → S4 per-workspace script 点亮 → S5 turbo lint 全量绿+收据；每切片独立可 revert。

## 3. Non-claims
设计 ≠ 实施 ≠ lint 门上线 ≠ C1 勾销。§1.2/§1.4 计数为 grep 静态代理与结构推演，非 lint 工具实测；实测以实现刀 S3 dry-run 为准。

## 4. 工件清单
| 文件 | 内容 |
| --- | --- |
| `ai-docs/delivery/harness/lint-design.md` | 设计定稿本体（本刀唯一 diff 面） |
| `00-exec-receipt.md` | 本收据 |
| `01-lint-design.snapshot.md` | 设计定稿快照（与本体逐字节同符） |
| `02-sha256.txt` | sha256 双面（本体+快照·同符 `f71609bb…c88c2e1`） |

## 5. 收尾
harness lifecycle：`draft_rev2:awaiting_pre_exec_dual` → **`exec:awaiting_post_prove_dual`**（lint-design.md 状态行已改写）。post-prove 双审归协调方派 · Ban self-approve · 作者 `git -c user.name=mw-core -c user.email=mw-core@meetwise.local` · 完成后 push origin line/lint-design · 席 mw-core · est 0 live · actualSpendCny=null。
