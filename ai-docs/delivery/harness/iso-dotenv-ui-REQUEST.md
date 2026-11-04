# ISO-DOTENV-UI REQUEST（runner 域一行移植修复·起草席落卷）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-11-05 EXEC 随令行使落卷（授权链=pre-exec 双审 r1 两独立外席 BOTH PASS + 协调方明示 EXEC 授权随令·详 §9 EXEC 记录）· 前值 `draft:awaiting_pre_exec_dual`（2026-11-05 诊断+起草落卷即停）史录保留 · EXEC 行使面=验收三读亲跑（B/C 两臂 runner 全输出收据 `.log` 两枚落 receipts + 非隔离形探针 + g6 行为门复跑·零码改动）· 本卷起草期未设 Status 行——EXEC 翻面按 L-13 三处钉先例形补设（三处钉：本行 + §8 + 卷尾 · 同值）· post-prove 双审两独立外席留协调方派席 · 行翻面权归协调方 · alone≠dual · Ban self-approve · est live=0 · markers=0）

> 任务类型：runner 测试基建面一行移植修复（诊断已定谳·起草落卷即停·禁 EXEC）。
> 立项出处：协调方派单 brief（窗2 worker 红诊断席 ROOT_CAUSE 实证报告 `.tmp/win2-worker-diag-1105.md`·`VERDICT: ROOT_CAUSE` 在案）。
> 本刀唯一修法面：`scripts/run-e2e-ui.mjs:27` 移植 `scripts/run-e2e.mjs:20-22` ISO-DOTENV-ISOLATION 先例形。零产品码触面。

## §0 事实锚（本席亲证清单·2026-11-05）

- **基线**：`main` @ `edda65a44`（fetch 后 `git rev-parse origin/main` 同值亲证=主仓 HEAD 同值·零落后）。分支 `line/idu-draft`、工作树 `meetwise-idu`（本席 `git worktree add` 亲立·建前 `git branch --list 'line/idu-draft'` 零命中 + worktree 列表零 `meetwise-idu` 双查亲证）。
- **根因五层亲证表**（全部 `git show origin/main:<path>` 逐行亲读）：

| # | 锚 | 亲证结论 |
| --- | --- | --- |
| 1 | `scripts/run-e2e-ui.mjs:27` | 现值恰为 `if (process.env.E2E_SKIP_DOTENV !== '1') {`——isolated 形照灌仓根 .env（不对称点） |
| 2 | `scripts/run-e2e.mjs:20-22` | 先例形亲读：`:20` ISO-DOTENV-ISOLATION 长注释（明言伪红源系 G7K 诊断席环境发现）+ `:21` E2E_SKIP_DOTENV 语义保持注释 + `:22` `if (process.env.E2E_SKIP_DOTENV !== '1' && env.E2E_ISOLATED !== '1') {` |
| 3 | 仓根 `.env` 五键（name-only） | `MODEL_COST_ENFORCEMENT` / `RAG_COST_ENFORCEMENT` / `PRIVACY_WORKER_DATABASE_URL` / `QBANK_CONTROL_DATABASE_URL` / `RAG_CONTROL_DATABASE_URL` 五键全部在场（grep 键名·零值读取）；`MODEL_BACKUP_API_KEY` 在场；`MODEL_BACKUP_BILLING_MODEL` 缺席（grep 计数 0）——与诊断报告 §2 V1 崩点前提逐项吻合 |
| 4 | `apps/worker/src/main.ts` 计费/控制面 fail-closed 链 | `:457` `resolveModelCostGovernance()` 调用点 + `:461` `verifyModelCostGovernance` + `:480-481` 双 `*_cost_configuration_not_provisioned` throw + `:515` `initializePrivacyWorkerStartup` + `:522-524` `assertQbankControlExecutorIdentity` 五锚逐行亲证吻合；`:530` `initializeRagControlStartup` 实值在 `:531`（诊断席行号尾差 1·机制与结论不受影响·如实登记） |
| 5 | 脚本装配面 | `package.json` 亲证：`e2e:ui:isolated` = `node scripts/run-e2e-isolated.mjs e2e:ui`；`run-e2e-ui.mjs:53` `live_provider_key_missing` 快速失败门在 worker spawn（`:188-191`）之前必达（`:24-26` 既有注释明言其设计语义） |

- **诊断三证在案**（诊断席报告 §2，本席不重跑）：复现 A（runner 保真 env·EXIT=1·`worker_exited_before_test`·withheld worker:stderr 1082 / api:stdout 1061）+ V1（手动 boot·stderr 1082 与扣留数逐字节同值·崩点 `model_cost_invalid_model_backup_billing_model`）+ V2（仅剥五泄漏键·30s 存活至 SIGKILL·stdout 718 字节健康 boot·stderr 仅 3 条良性 warn）。
- **防重检查过**：harness 目录无同名卷（`git ls-tree` 亲证·`iso-dotenv-isolation-REQUEST.md` 系 HTTP 线原刀卷非本域·本卷名 `iso-dotenv-ui-REQUEST.md` 零冲突）。
- **在飞登记**（worktree 列表亲测 18 工作树）：派单点名三支 g7w/fin/r2 详 §3；其余 audit/df/err/l13/rc/uc011adv ahead=0、ag20/loadw/pay/scoringeval/uc31 ahead=1 两 policy 零触、ag18/campaign-state/cap-2272 ancient 多 merge-base 分叉不预采（沿 L-13 注记先例形）。

## §1 修法（已随起草落卷·逐字）

`scripts/run-e2e-ui.mjs` 单文件·净 3 insertions / 1 deletion（≤5 行预算达成）·零产品码触面：

```diff
@@ -24,7 +24,9 @@
 // 加载 .env(RESUME 加密键 + 模型),不覆盖已设。
 // REG-FIX 组8b 测试钩:E2E_SKIP_DOTENV='1' 跳过仓根 .env 回灌(默认零变)——g6-e2e-iso-blocked 行为门用:
 // Key-unset 快速失败(live_provider_key_missing)在任何宿主形态(仓根 .env 存/缺)必达,不被 .env 静默绕过。
-if (process.env.E2E_SKIP_DOTENV !== '1') {
+// ISO-DOTENV-ISOLATION:isolated 形(E2E_ISOLATED=1)无论 E2E_SKIP_DOTENV 与否一律跳 .env 回灌——主仓 .env 在场时其环境语义键(APP_RUNTIME_DB_EXPECTED_ROLE/NODE_ENV/PORT 类)穿透隔离删单(:37-47 只删云凭据)漏入 api/worker 子进程=伪红源(G7K 诊断席环境发现);包装器 baseEnv 已供隔离全套 env,隔离形零回灌需求。
+// E2E_SKIP_DOTENV 语义保持:非 isolated 形仍按原钩跳过(默认零变·g6-e2e-iso-blocked 行为门语义不变)。
+if (process.env.E2E_SKIP_DOTENV !== '1' && env.E2E_ISOLATED !== '1') {
```

- 同文注释系 `run-e2e.mjs:20-21` 先例形的同文移植；其中删单行号引用按本文件修改后实值适配为 `(:37-47 只删云凭据)`（先例文本内 `(:28-34)` 系 run-e2e.mjs 写时快照·该文件现树删单块实际已漂至 `:30-43`·先例注记自身行号亦已陈旧——本席取「写时实值」语义适配本文件·偏离登记见 §9）。
- 行为语义（协调方知悉项·沿诊断 §5）：修后 ui 线 isolated 与窗1 同规则——`MODEL_API_KEY` 须由 shell 导入（`:53` 的 `live_provider_key_missing` 门不变·`E2E_SKIP_DOTENV` 非 isolated 语义保持零变）；.env 的 `DASHSCOPE_EMBED_API_KEY` 等亦不再回灌（窗1 现状一致）。

## §2 断言预算（三臂·主判据=不再 worker_exited_before_test·不强求绿）

- **A 臂（基线红·诊断席在案实证·不重跑）**：修复前同宿主形态（仓根 .env 在场）`worker_exited_before_test`——诊断复现 A：EXIT=1·`E2E_FAILURE class=worker code=worker_exited_before_test` 双写·withheld worker:stderr 1082 / api:stdout 1061；V1 stderr 与扣留数逐字节同值。
- **B 臂（主断言·本席亲跑）**：修复后 worktree 同态（主仓 `.env` 副本拷入 worktree 根·untracked ignored·零 tracked 面影响）+ shell 占位 `MODEL_API_KEY`（哑值·非真实凭证·仅过 `:53` 非空门；boot 期零 provider 调用沿诊断 V2 码证）+ 无 freetier·`pnpm e2e:ui:isolated`：
  - `worker_exited_before_test` 出现次数 **0**（log 全文 grep 计数亲证）；
  - worker:stdout 扣留读数 **718 字节 = 诊断 V2 健康 boot 逐字节同值**；worker:stderr 214 字节 3 chunks（V2 三良性 warn 同形）；api:stdout 1065 字节存活；
  - runner 越过 `:196`（修后 `:198`）worker exitCode 门与 `:207` readyz 40x1s 环，推进至 web build 段日志 `无 .next/BUILD_ID，先 next build`——worker 存活过启动期正面观测达成；
  - 本席于 build 段杀窗终止（外呼面零·Playwright/spec 未起）；终红 `class=frontend code=web_not_ready` 系杀窗截断 build 所致非 worker 腿（§ 预算明示不强求绿）。
- **C 臂（.env 回灌阻断门证据·本席亲跑）**：修复后零 shell Key 同态跑 → EXIT=1 `E2E_FAILURE class=provider code=live_provider_key_missing` @ `run-e2e-ui.mjs:55`（修后行号）·worker 零 spawn·容器自清——对照 A 臂（同态 .env 在场时回灌过门）证明 isolated 形 .env 回灌已被本修法阻断。
- **V2 静态对照**：诊断 V2（剥五键手动 boot 30s 存活·stdout 718B）即预期行为的变体级实证；B 臂 worker stdout 718B 与 V2 同值=差分变体动态兑现闭环。

## §3 cap 预登（CAP-SANCTION-2480 恰等步进·随届值如实采）

- 届值亲证：起草前 worktree `node scripts/ai-docs/check-docs.mjs` **EXIT=0 scanned 2479 ≤ cap 2479 恰等零余量**（本席亲跑·`MAX_FILES` 行 `scripts/ai-docs/public-text-policy.mjs:299` `2_479` 亲读）。
- 本卷 REQUEST 受管 1 件 → 2480 必超 → 沿协调方派单 §3「cap 预登（main 届扫 2479+1=2480·随届值如实采）」+ 常设预授权先例形随令行使 +1 恰等零多放：**cap 2479→2480**。
- 四联动点已随卷恰等改（两 policy 脚本）：`policy.mjs` `MAX_FILES 2_480` + 链区注记；`proof.mjs` loop `i < 2_480` / atCap `scannedFiles 2_480` / overCap `f-2480.md` / `FILE_LIMIT:2481` + 链区注记（越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
- 在飞如实列（派单点名三支·本席逐支亲测）：**g7w-draft** `86af8b34b` 承 `2_481`（ahead 2·两 policy 触面亲测）/**fin-draft** `2a4b09f22` 承 `2_480`（ahead 1·两 policy 触面亲测）/**r2-draft**（meetwise-r2 工作树）承 `2479`（ahead 0·tip=origin/main 同值·两 policy 零触）——g7w/fin 已各步进超本卷预登值，并线 union 沿常设预授权「cap 以合并树实测恰等步进免再询」届时取大重算承登。
- EXEC 期=既有 runner 单文件零新受管文件（修法已随起草落卷·真跑收据 .log 非扫描扩展名不计）→ EXEC terminal **2480 零新增**。

## §5 Ban

- Ban self-approve · alone≠dual（pre-exec 双审两独立外席待派）· Dual PASS ≠ 开工。
- Ban 触产品码（本刀修法面=scripts runner 基建面唯一）· Ban 改 `run-e2e.mjs` 既有先例形 · Ban 改 worker/api boot 语义与治理门。
- Ban push · Ban merge 主线 · Ban force push · 一切改动只交付本工作树。
- Ban 超出 §3 预登值（2480）自升 cap（cap sanction 权归协调方·并线期 union 越限沿常设预授权届时重算承登·非本席越权）。
- Ban 洗史录（两 policy 注记栈 append-only·既有注记零字节改写）· Ban 假绿绕过与测试门弱化 · Ban 读/打印 .env 值（本刀全程 name-only）。

## §8 停手

- **file:line 不符**：亲证阶段全锚吻合，唯诊断报告 `main.ts:530` 实值 `:531` 尾差 1 已如实登记（§0-4·机制结论不受影响·不触发停手）；EXEC 期再遇锚漂 → 停手上报。
- **机制不满足**：EXEC 期复跑 B 臂若仍现 `worker_exited_before_test` → 红停上报（Ban 改判据凑绿）。
- **验收红且口径内修不了**：docs:check 超 §3 届值且协调方未裁 → 红停；PTP proof 红 → 红停；markers 净增行非零 → 红停。
- **越界**：需触产品码 / 别的仓 / 超出 §1 修法面的改动才能继续 → 停手记录现场证据上报。

## §9 落卷记录

- **落卷内容**（本 commit tracked 面恰 4 文件）：① `scripts/run-e2e-ui.mjs`（§1 修法·唯一码面）② `ai-docs/delivery/harness/iso-dotenv-ui-REQUEST.md`（本卷）③ `scripts/ai-docs/public-text-policy.mjs`（§3 cap+注记）④ `scripts/ai-docs/public-text-policy.proof.mjs`（§3 四联动点+注记）。
- **三门槛值（本席落卷前亲跑）**：docs:check **EXIT=0 scanned 2480 ≤ cap 2480 恰等**（落卷+cap 联动后树上实测）；PTP proof **12/12** EXIT=0（亲跑）；markers 五类探针词面运行时组装（防自指不入卷）对本 commit 全部净增行 **0 命中** + 改动集全文件对账恒等（亲跑）。
- **偏离任务书清单（如实·两处）**：① 先例同文注释内删单行号引用 `(:28-34)` 适配为本文件修改后实值 `(:37-47)`（先例该引用在 run-e2e.mjs 现树亦已陈旧漂至 :30-43·取「写时实值」语义·不影响任何行为）；② B 臂断言执行形为有界观测窗（worker readyz 环过即杀·外呼面零）而非等待 24 tests 全量运行——任务书两判据为「或」关系·前者正面达成·后者由 B 臂越门推进证据与 V2 同值间接支撑（强求全量运行需真实 Key·违零 live 零真实 Key 纪律）。
- **STOP**：`executed:awaiting_post_prove_dual`（2026-11-05 EXEC 随令行使落卷·三处钉：Status 行+本节+卷尾·同值·前值 `draft:awaiting_pre_exec_dual`（2026-11-05 起草落卷即停·双审待派）史录保留——EXEC 期零码改动兑现·本卷 §1 形即终形亲证·开工三条款已履行核验（①pre-exec 双审 r1 两独立外席 BOTH PASS 在案（在席记录归协调方台账·本席按令转录沿 L-13 §8 先例形）②协调方明示 EXEC 授权随令③锚点对届树重核零漂详 §9 EX1）。

**EXEC 记录（2026-11-05 · 协调方派单「ISO-DOTENV-UI EXEC」随令行使·授权链=pre-exec 双审 r1 两独立外席 BOTH PASS + 协调方明示 EXEC 授权随令（在席双审过程记录以协调方台账为准·本席按令转录沿 L-13/df/err §9 先例形）· rebase 核：`git fetch origin` 后 origin/main 仍 `edda65a44` 零前进 → 本支零 rebase·cap 届值如实采 2480=§3 预登值（在飞 g7w 2_481/fin 2_480 竞争未并线·常设预授权「届时取大重算承登」条款本 terminal 未触发）：**

- **EX1 行使面=零码改动兑现**：`scripts/run-e2e-ui.mjs` 对起草 commit `3e3621c8a` 零 diff（§1 形即终形亲证）·修后锚全量亲读在案零漂：if 行现 `:29`（§1 hunk `@@ -24,7 +24,9 @@` 修后推得值·预登 `:27` 系修前行号锚）/`live_provider_key_missing` 门 `:55`/worker exitCode 门 `:198`/readyz 40×1s 环 `:207`/build 段标记 `无 .next/BUILD_ID，先 next build` 在案。
- **EX2 B 臂读数（本席亲跑·runner 全输出 tee 落档 `receipts/iso-dotenv-ui/2026-11-05/b-arm-isolated-ui.log`）**：`E2E_SKIP_DOTENV` unset + shell 哑占位 `MODEL_API_KEY`（非真实凭证·仅过 `:55` 非空门）+ 无 freetier + 仓根 `.env` 在场（untracked ignored·全程 name-only 纪律）→ isolated 形 `.env` 零回灌（修法直接标的）：`worker_exited_before_test` 全 log grep 计数 **0**；`E2E_PROCESS_OUTPUT_WITHHELD process=worker:stdout` **718 字节 = 诊断 V2 健康 boot 逐字节同值**（chunks=6 系 IO 调度伪差·字节值同判据）；`worker:stderr 214 字节 3 chunks`（V2 三良性 warn 同形）；`api:stdout 1067 字节`（起草席亲跑读数 1065·两独立 run 的 boot 日志字节正常漂移·同为存活量级·如实登记非同值判据项）；runner 越 `:198` exitCode 门与 `:207` readyz 环推进至 build 段标记——worker 存活过启动期正面观测达成；web-build 子进程有界杀窗截断 → 终红 `class=frontend code=web_not_ready` 系杀窗截断 build 所致非 worker 腿（§2 预算明示不强求绿·B 臂两判据「或」关系前者达成·后者由越门证据+718B=V2 同值间接支撑）。
- **EX3 C 臂读数（本席亲跑·tee 落档 `receipts/iso-dotenv-ui/2026-11-05/c-arm-isolated-ui.log`）**：零 shell Key 同态跑 → **EXIT=1 · `E2E_FAILURE class=provider code=live_provider_key_missing`**（@ `run-e2e-ui.mjs:55` 修后行号·模块顶抛）·log 零「启 api + worker」行=worker 零 spawn 亲证·容器自清（终态 `docker ps -a` 零 meetwise-e2e 容器亲测）——对照 A 臂（诊断席在案·同态 .env 在场旧码回灌过门）= isolated 形 .env 回灌阻断实证闭环。
- **EX4 非 isolated 形零变探针（本席亲跑）**：`node scripts/run-e2e-ui.mjs`（零 E2E_ISOLATED/零 E2E_SKIP_DOTENV）→ **EXIT=1 · `E2E_FAILURE class=capability code=e2e_ui_isolation_required`**·零 spawn——隔离要求语义与修前零变（修法仅触 `.env` 回灌条件·不触隔离门）。
- **EX5 g6-e2e-iso-blocked 行为门复跑（本席亲跑）**：`pnpm g6-e2e-iso-blocked:prove` → **EXIT=0**（blocked-honesty 语义·Key-unset 快速失败与非 isolated 形 `E2E_SKIP_DOTENV` 钩语义零变行为级确认）。
- **EX6 三门读数（EXEC 落卷前亲跑·树上终形）**：门 1 docs **EXIT=0 · scanned 2480 = cap 2480 恰等零再步进**（EXEC 期零新受管件·收据 `.log` ∉TEXT_EXTENSIONS 不计）；门 2 PTP **12/12 EXIT=0**（`static_preflight_valid: selected=12/12`）；门 3 markers=改动集（M 本卷 + A 收据 `.log` ×2）新增行五类标记词+行首冲突标记 **0 命中**（词面运行时组装·i6-239 §2-7 口径）。
- **EX7 面收敛（EXEC 终形枚举）**：`git diff --name-status origin/main..HEAD` 终形=起草 4 tracked（§9 落卷记录①-④）+ EXEC 增量恰 3 路径=`M ai-docs/delivery/harness/iso-dotenv-ui-REQUEST.md` + `A receipts/iso-dotenv-ui/2026-11-05/b-arm-isolated-ui.log` + `A receipts/iso-dotenv-ui/2026-11-05/c-arm-isolated-ui.log`（收据 ∉TEXT_EXTENSIONS 不计→terminal 2480 零新增兑现）——产品码/迁移/g6 门/先例 `run-e2e.mjs`/两 policy 脚本零触亲证。
- **EX8 事故如实登记（EXEC 期 B 臂首跑·非验收读数·不入收据档）**：首跑 driver 缺陷双重事件：① 杀窗 pgrep 未收窄工作树路径 → 误杀非本树 `next build` 进程（pid 32498·2026-11-05T02:45:44Z±·本树 runner 当时未达 build 段——本树 build 在其后 spawn 并完整跑完写出 BUILD_ID 为证·受害进程归属本机其他在飞工作树·非本席可定域·如实上报协调方对台账核）；② 应急路径仅杀 pnpm 壳 → runner 树孤儿存活·Playwright 泄窗跑 12 tests（涉模型面 test 失败形态 `attempt_outcome=known_not_sent — begin not attempted` = 网关 fail-closed 零外发·零 live provider IO 亲证）——SIGINT runner 触发其自有 cleanup 止损·api/worker/playwright 全清·容器自清·零残留亲测。事故 log 存 `.tmp/exec-incidents/b-arm-attempt1-2026-11-05T0245.log`（不提交）·driver 已修正（pgrep 收窄本树路径+应急父链定位 SIGINT runner）后复跑=EX2 正式读数。
- **EX9 双席 P2/P3 登记转录（全部登记不修·修法/处置权归协调方·本卷行使面零触·细则以协调方台账为准·本席按令转录沿 L-13 EX8 先例形）**：**席1 P2-1=r2 届值**（在飞 r2-draft 届值面·与 §3 在飞登记/常设预授权取大重算条款相关联）；**席2 P2-1=B/C 臂 runner 全输出 tee 落 receipts `.log`**（EX2/EX3 已兑现）；**席2 P2-2=performance runner 残留**（performance:e2e runner 域残留面登记·本刀零触）；**P3×4 备查**（细则以协调方台账为准·按令转录）。
- **EX10 后续**：post-prove 双审两独立外席留协调方派席·状态三处（Status 行+§8+卷尾）同值转 `executed:awaiting_post_prove_dual`（前值 `draft:awaiting_pre_exec_dual` 史录保留）·翻面/关账权归协调方·⛔push。

*ISO-DOTENV-UI REQUEST · 2026-11-05 诊断+起草落卷 · 2026-11-05 EXEC 行使落卷（EXEC 期零码改动·验收三读+g6 门亲跑·详 §9 EXEC 记录）· **STOP=`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual` 起草落卷史录保留）· base `main` @`edda65a44`（fetch 后 origin/main tip 同值亲证=主仓 HEAD 同值）· 分支 `line/idu-draft` · 工作树 `meetwise-idu`（本起草席亲立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief（窗2 worker 红诊断席 ROOT_CAUSE 定谳 `.tmp/win2-worker-diag-1105.md`）· 修法=`scripts/run-e2e-ui.mjs:27` 移植 `run-e2e.mjs:20-22` ISO-DOTENV-ISOLATION 先例形（if && 形+同文注释）单文件净 3+1-1 零产品码 · 事实锚五层亲证（:27 现值/先例形逐字/.env 五键 name-only/main.ts 链五锚+尾差如实/装配面）· 三臂断言（A 诊断在案基线红 / B 亲跑 worker 存活 stdout 718B=V2 逐字节同值 0 次 worker_exited_before_test / C 亲跑 live_provider_key_missing 回灌阻断实证）· CAP-SANCTION-2480 恰等步进预登（2479→2480·四联动点·起草前 docs:check EXIT=0 scanned 2479 亲跑·在飞 g7w 2_481/fin 2_480/r2 2479 点名如实列·g7w/fin 超预登值 union 届时取大重算承登）· 三门本席亲跑 docs 2480≤2480 恰等+PTP 12/12+markers 0/0 · 偏离两处如实登记（删单行号引用适配/B 臂有界观测窗）· 停止条件四类全设 · ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
