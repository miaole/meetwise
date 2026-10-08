# G7Y · trio 复跑判定刀（三绿收官测量刀）· REQUEST（docs-only）

status: **`draft:awaiting_pre_exec_dual`**（REQUEST 就绪 · 预执行双审未做 · meetwise 未授权 EXEC · 本 commit 零码零 spec 零实跑零 live 零容器——trio 实跑属下轮 EXEC 面）

**Pins（文首照抄 · 原值写死 · 零翻转）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **g7SuiteGreen=false** · **actualSpendCny=null**. Do not write covered.

**Date**: 2026-10-08
**Line**: **G7Y**（trio 复跑判定 · 三绿收官测量刀）
**Base**: `origin/feat/mysql-schema-skeleton` = **`9265e4d8`**（full `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc` · 2026-10-08 fetch 后实测 tip，≥ `9265e4d8` 达成 · 本地同名分支已 ff 同点）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7y` · branch `line/g7y-trio-rerun`（新立自 origin tip · 跟踪同名 upstream · 禁 force push）。

**立项出处（引用既有登记 · 不自建 SSOT 行）**：协调方 G7Y trio 复跑判定刀——CMOP03-FIX nail「C-MO-P3 行关闭/翻转归协调方后续（**trio 复跑复核保留**）」+ G7V-CALIB nail「G7U 残红①关联子面处置**随 G7Y trio 复判**」+ CMOP03-D nail「trio stays OPEN（真测 1/1/1 retained）· 复判 run 归协调方」既有指向的行使。本 REQUEST 为独立全链 REQUEST（REQUEST → 预执行双审 → meetwise 授权 → EXEC → post-prove 双审 → meetwise 授权 nail）。

---

## 0. 主线当前态与 blob 锚（mw-core 于本 worktree @ `9265e4d8` 亲算 · 非转录）

**主线当前态**：C-MO-P3 修复（刀① coding `4252efc8`：`e2e/full.e2e.ts` blob `7d65d0f3`→`1fededa5` + `e2e/helpers/interview.ts` blob `c8e63f41`→`c7001612` · 恒 False 消除）+ G7V-CALIB spec 校准（coding `fa7ec1f2` · 本线孪生 blob `9f25566b`）+ 刀② 弱输入预期面校准（零码改文档化落卷 CLOSED under branch P）**全部落码/落卷** · **CMOP03-D 7 埋点留树**（EXEC `3434f82b` 落码后随鉴别刀链落主线 · 本刀零触碰自动携带）。

| 文件 | blob @ `9265e4d8` | 角色 |
| --- | --- | --- |
| `e2e/full.e2e.ts` | `6c27b583`（=`1fededa5` 刀①修复 + 7 埋点纯插入的当 tip 值） | CMD1/CMD3 HTTP full E2E driver（`:201-203` 已修 · `:236` 7a 兜底 · `:356-357` boundLoop 断言面 · 7 埋点在树） |
| `e2e/helpers/interview.ts` | `c7001612` | 刀① 修复面（澄清感知计数） |
| `e2e/helpers/assert.ts` | `975fbb38` | 反伪造钉②（fail-fast 纪律） |
| `e2e/helpers/sse.ts` | `9bba015d` | 反伪造钉① |
| `apps/web/e2e-ui/recruiting-bound.spec.ts` | `9f25566b` | CMD2 校准后 spec（**G7V-CALIB `fa7ec1f2` 主线孪生** · `:62` 初稿 B const 载体 / `:233` 三面集 / `:239` or-面 / `:229-230` 负向门） |
| `scripts/run-e2e-isolated.mjs` | **`e818fb46`** | trio 解析链 runner（CMD1/CMD2 入口） |
| `scripts/run-e2e.mjs` | `c655235c` | Key gate（`:43` `live_provider_key_missing`）+ `:42` `fake_service_mode_forbidden` |
| `scripts/run-e2e-ui.mjs` | `aa86fb3f` | UI runner Key gate（`:48`） |
| `scripts/run-e2e-performance-suite.mjs` | `7580fa02` | CMD3 perf 套件 runner |
| `packages/ai-runtime/src/model-operation-registry.ts` | `63af556f` | 反伪造钉④ |

**blob 漂移如实登记**：`run-e2e-isolated.mjs` 在卷四钉旧值 `13dbfc43`（CMOP03-D era）→ 当 tip **`e818fb46`**——漂移源 = **PRIV01-C 授权 nail 落地的 `tenant-wiring-neg:prove:raw` 第 4 处 isolatedCommand 路由新增**（checklist Line PRIV01-C nail 在卷授权）· trio 三路由 `e2e:prove`/`e2e:ui`/`performance:e2e` 分支语义零变化（diff 亲读：纯新增路由分支与白名单条目）· 非本刀改动 · 非静默漂移。

**trio wiring @ 当 tip**（`package.json` 当值 blob **`24da3467`**——G7W-G era 在卷值 `0afb3bd2`→`24da3467` 漂移系上游脚本区增长 · trio 三行语义零变化）：`e2e:isolated`=`:278` · `e2e:ui:isolated`=`:279` · `verify:e2e-performance`=`:282`。解析链不变：`e2e:isolated` = `run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`；`e2e:ui:isolated` = `run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs`；`verify:e2e-performance` = `run-e2e-performance-suite.mjs`。

**7 埋点在树亲证**（`e2e/full.e2e.ts` blob `6c27b583` · `reviews.record({class:'worker',code:'seg_*'})`）：M1 `seg_diag_green_enter`=`:257` · M2 `seg_step8_enter`=`:260` · M3 `seg_step9_green`=`:304` · M4 `seg_expert_enter`=`:307` · M5 `seg_bound_start_enter`=`:337` · M6 `seg_boundloop_enter`=`:351` · M7 `seg_boundloop_terminal`=`:362`（与 CMOP03-D nail errata E-a 实插行号逐点一致）。断言面亲证：`:201-203`（C-MO-P3 修复后出处审查，含 `+ clarifications` 对称计数）· `:235-237`（7a failLoop recordTerminal + 兜底断言 `report_unavailable + quarantined` 本体）· `:355-357`（boundLoop recordTerminal + 死胡同断言 + `:357` provenance 同族残留候修行）。**本刀对上述断言本体零触碰**（Ban 顺手修先例承继 · `:357` 候修处置仍归协调方）。

---

## 1. 逐 CMD 预期面（多结局诚实预注册 · **不预设全绿**）

### 1.0 总则

- 三条 CMD **各恰 1 run 一次成型**（顺序 iso → ui → perf · 顺序如实记录）；**knife 级 Ban retry-to-green**（红了不重跑 · Ban 只留绿 attempt · Ban 把 EXIT=1 洗成 flake/环境偶发）；**零第二次 run 通道**——唯一例外 = 本文 §1 预注册的升级条款（红于他处→新面登记升级协调方，亦不构成重跑权）。
- **单条 CMD 内部既有重试机制按其自身契约算一次 attempt**（playwright per-case retry 等 suite 内建重试 = CMD 契约一部分，收据须披露内部重试配置原值）；**Ban 临时调高重试/并发/超时配置**。
- 历史红**零冲销**：trio 真测 **EXIT 1/1/1 retained**（Key×3 fix era · `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md` · quota-era 形状）；G7X T-1 预期红 40363ms、CMOP03-FIX run1 78798ms、CMOP03-D run2 57837ms 原值全在卷——本刀任何读数不回改不冲销。
- **每 run 的 `seg_*` ledger 行 = 判别读数**：7 埋点已留树自动携带心跳臂（G7V-CALIB 时 base 已含）——CMD1 与 CMD3 的 HTTP full E2E 步每 run 产出 reviewLedger 行序；CMD2 为 UI 套件（驱动面不同）无该臂，如实记「无 seg 臂」。

### 1.1 CMD1 `pnpm e2e:isolated` / CMD3 `pnpm verify:e2e-performance`（同族预期面 · 两 OPEN 面如实预注册）

**修复+校准已落的正面**：`:201-203` 恒 False 已消除（刀① · step 7/7a/7b 首执行全过在卷）；弱输入报告面按刀② branch P 校准=「practice 直创未绑岗零可计分 ScoreCard → `score_aggregate_empty` → 报告 unavailable+quarantined」为**设计内常态**（报告链钟 ~10-12s 预期带 · 非延迟非 flake 非供给故障）。

**两 OPEN 面如实预注册（不预设其已消解）**：

- **OPEN 面 (i)＝`GAP-CMOP03-7A-DOWNGRADE`（P1 OPEN）`:236` 面**：run2（注入 run）中 7a 兜底断言期望 `failLoop.terminal === 'report_unavailable'` 实达 `interview_unavailable` · 由构造即假 fail-fast；**三候选产生面并列零归因**（`apps/worker/src/adaptive-lifecycle.ts:54` 出题面烧尽 / `apps/worker/src/interview-consumer.ts:93` interview_job 重试上限 / `apps/worker/src/commerce-reconcile.ts:65` 孤儿预留回收）· **跨 run 形状漂移已留档**（同一 `:235` failLoop 面跨 run 给出 `report_unavailable`〔协调方 run〕vs `interview_unavailable`〔run2〕· 账本面事实 · 零归因）。本刀 trio run **无 `E2E_REPORT_FAIL_ALL` 注入**（纯跑）——该面在无注入下是否出现、呈现何形状，**零预设**。
- **OPEN 面 (ii)＝`GAP-CMOP03-POST7B`（P1 OPEN）窗 `(:256, :356]`**：run1 出现（78798ms · 死亡窗 ∈(:256,:356] · ledger 恰 4 条）· run2（鉴别刀）未复现（红点在窗前 `:236`）——**窗红未复现 ≠ 已解决**（原读数零冲销 · 两岔〔driver step 8/9 区 vs 异常/绑定段〕仍未分 · 复判 run 归协调方=本刀）。CMD3 的对应面 = perf 套件内 **HTTP full E2E 步**（同一 driver · 同窗语义沿展）。

**结局族（每 CMD 独立判定 · 原值记账）**：

| 结局 | 判据（以 reviewLedger + receipt 定位） | 处置 |
| --- | --- | --- |
| **全绿** | EXIT=0 · 全段断言过 · seg 心跳达 M7（或达 M7 后终局） | **「三绿候选」如实登记**（≠宣称——须 post-dual BOTH + 协调方 nail；`g7SuiteGreen` 翻转=**独立 SSOT 刀**，本刀禁翻） |
| **红于 `:236`** | ledger 第 4 行后即停 · failLoop terminal ≠ `report_unavailable` 或 rep.status ≠ quarantined | **`7A-DOWNGRADE` 域读数增量**：本 run 形状（terminal 值/attempts/last_error）append-only 增记该域 · **`ai_model_invocation` 双计读数 append-only 增记该域** · **Ban 归因三候选任一** · 升级协调方 |
| **红于窗 `(:256,:356]`** | ledger 达 M1（≥`:257`）后停于 `:357` 前 · seg 末心跳 ∈ {M1..M6} | **`POST7B` 复现读数**：复现读数 + 末心跳定位入该域（M1/M2→step8/9 岔A 相容；M3/M4/M5/M6→专家评审段岔B 相容；M7 停靠则 `:356-357` 断言面读数）· **`ai_model_invocation` 双计读数 append-only 增记该域** · **Ban 归因两岔任一岔定谳** · 升级协调方 |
| **红于他处** | 上列定位面均不合 | **新面登记**（沿「同形不同内容」分列判例 · 立行归协调方）· 按预注册升级条款升级 |
| **env/infra 中止** | docker/migration 等环境缺口 | env-gap 类如实记 FAIL 原因 · 不洗 not_run · 零产品读数 ≠ 判别失败 |

（CMD3 结局族沿同表，定位读数取自其 HTTP full E2E 步的 receipt/ledger；perf 套件其余步〔web build / migrate:prove / R5-MARKED-RED legacy 族〕各自原值记账，R5-MARKED-RED 披露保持——R5 步红≠本刀新面，沿 G6/BUG-E2E-ISO 既有域披露。）

### 1.2 CMD2 `pnpm e2e:ui:isolated`（校准后 spec · 绿为基线预期）

- spec = **G7V-CALIB 校准后主线孪生**（blob `9f25566b`）：第三臂 **初稿 B exact 门**（`:62` `NO_REPORT_ON_CHARGED_MSG` const · `:233` 结算三面集：初稿 B 面 + `REPORT_DOWN`/`PRACTICE_FEEDBACK` 两可达旧面 · `:239` else or-面承接两支各自 exact 锁定）+ **`:229-230` 负向门**（`releasedCopyOnCharged` 探测 + `toBe(false)` 诚实红门 · 资金谎报回归门立起）+ 其余臂（golden/stream/ingest 等）原样。
- **先例**：G7V-CALIB 单 attempt **EXIT=0 全测绿（2 passed）**（chromium 1.6m + mobile 1.3m · `E2E_UI_GREP` 单臂口径）——本刀全量 UI 套件（无 grep 过滤）预期**绿为基线**。
- **红 = 新面登记**：任何红按五分类如实记账（api/fixture/env-gap/frontend/provider）+ 立行归协调方 · **Ban 归因 G7V-CALIB 校准刀**（G7V-CALIB 附条件③承继：`:233` 三面集超时=仪器红正常 firing 走五分类升级 · Ban 归咎校准刀）；`E2E_UI_GREP` 过滤臂**本刀零行使**（附条件②：未来绿 run 落第三臂=机会主义采读 · Ban 立项追跑——本刀全量 run 若落第三臂读数即机会主义采读入账）。

---

## 2. run 预算与 sidecar v2 纪律（自带 · 前向兑现）

1. **run 预算**：trio 各 **1 run** 一次成型（Ban retry-to-green · 零第二次 run 通道 · 例外仅 §1 预注册升级条款=升级不重跑）。
2. **sidecar v2 纪律必须自带**（CMOP03-D nail 五条 · 本刀 EXEC 期逐条行使）：
   - ①**锚定点后移**：挂 wrapper stdout `E2E_POSTGRES_READY label=post-migrate`（**Ban container_found 锚**）；
   - ②**迁移在途等待窗**：首 ok tick 前 relation-missing（**42P01 族**）归类 `pending` 不计失败预算 · **停针计数器仅 post-first-ok 武装**；
   - ③**C-HA-FF-3 逐查询纪律 + OB-Q2 兜底**保留；
   - ④**v2 策略落文字**（本条即载体）；
   - ⑤**必读面 `interview_job` + `ai_model_invocation`**。
   - 叠加 CMOP03-E 前向纪律：sidecar **SELECT-only** · 绑定**精确容器名+端口** + `created_at∈run 窗` + `migrations=0142` 相关性校验——失配弃读并登记（Ban 前缀匹配误靶采信）；零有效读数 run 按「driver 单臂 + 缺陷附注」记账（**Ban 单臂冒充双臂互证**）。
3. **est 逐 CMD（沿各线在卷口径 · est-not-counter 非估算器）**：CMD1 **≤25**（CMOP03-E 满旅程 est 带口径 · G7X T-1 实测 live=7 先例 · 本刀纯跑无注入面）；CMD2 **≤30**（G7V-CALIB 口径 est ≤30≪200）；CMD3 **≤64**（G7W-G frozen S1 重估 extreme-bound ≤64 口径沿展 · 含 HTTP full E2E + legacy 族）。**总硬帽 200**（G7K trio-keyed §5 上限口径）· 超限即停如实记中止原因（不洗 not_run）· **`actualSpendCny=null`**（无计价数据源 · Ban invented spend · 金额入账须协调方另给计价依据）。**live 计数=`ai_model_invocation` 账本实测 succeeded+failed 双计**（dispatching/在途行不计入 · teardown 竞态窗 ±1-2 行下限界 · 沿 G7X live=7=5+2 / CMOP03-E live=14=9+4 同法），全绿/红各结局 run 的 live 读数同口径入 receipt。
4. **Key 卫生**：Key **只经进程环境**（loader `~/.meetwise-secrets/load-model-api-key.sh` 或同进程 export）· **name-only 探针**（set/unset 不打印值）· **Ban Key 值/fingerprint 入 receipt/log/commit** · **`.env*` ABSENT 双向记录**（本刀零读取零创建）。
5. **逐 attempt 全记录**：CMD 原文 + EXIT + 起止时间戳 + 实跑 code SHA（worktree HEAD 实测）+ worktree/branch + install 记录 + 环境探针 + 逐 case FAIL 明细（case 名+失败原因+五分类）+ machine receipt + `seg_*` ledger 行序；三类记录（退出码/receipt/原始 log）交叉一致才可引用。原始日志落 worktree `.tmp/`（不入 git）· receipt 只引路径+无 Key 值自查后摘录。
6. **跑在 committed SHA 上**：协调方 EXEC 时重钉 committed SHA（若 tip 前移以协调方重钉为准并逐 receipt 记录）；`pnpm install --frozen-lockfile`（禁改 lockfile · EXIT 逐次记录）；隔离 PG 用后即焚 · 容器零残留亲证。

---

## 3. 判定与上报（预注册）

- **三绿**：逐 CMD EXIT=0 → 如实登记为「**三绿候选**」——**≠ trio 翻绿宣称 ≠ `g7SuiteGreen=true`**；`g7SuiteGreen` 翻转 = **独立 SSOT 刀**（须 post-dual 双审 BOTH + 协调方 nail 全链 · **本刀禁翻**）。
- **任一红**：EXIT 原值记账 + 按归属面登记（红于 `:236`→`GAP-CMOP03-7A-DOWNGRADE` 域读数增量 · 红于 `(:256,:356]`→`GAP-CMOP03-POST7B` 复现读数 · 红于他处→新面登记）· **升级协调方**（立行/增记处置权归协调方 · 本刀 EXEC 期零 SSOT 行改写——判定登记归本刀 nail 面行使）。
- **任一 env/infra 中止**：env-gap 如实定性 · 不洗 · 零产品读数不冒充判别读数。

## 4. 硬 Ban（全链有效）

**Ban 翻 `g7SuiteGreen`/任何 pin** · **Ban 关 `GAP-CMOP03-POST7B`/`GAP-CMOP03-7A-DOWNGRADE`/`:107`（GAP-G7K-API-REDS）任一行** · **Ban retry-to-green**（含择优/调序/只留绿 attempt）· **Ban 碰产品码/spec**（`e2e/full.e2e.ts` 断言本体与 7 埋点、`recruiting-bound.spec.ts`、apps/packages 全域零触碰——本刀 docs+prove-only · 零 coding）· **Ban 改共享 SSOT**（checklist/backlog 行状态与既有节文本零改写——本刀判定登记仅落本刀 nail 与收据 · alone≠dual）· **Ban secrets**（Key 值/fingerprint/.env* 任何内容入树入 receipt）· Ban 归因三候选任一/两岔任一岔（读数增量≠归因定谳）· Ban 借读数冲销任何历史红原值 · Ban force-push · Ban self-approve · Ban 单臂冒充双臂 · Ban 临时调重试/并发/超时配置 · Ban invented spend。

## 5. 流程声明

REQUEST（本文）→ **预执行双审**（mw-e2e-ha + mw-model-op · stub `ai-docs/delivery/reviews/REQUEST-2026-10-08-g7y-{mw-e2e-ha,mw-model-op}.md` · 本 commit 即建 0 字节落 git——CMOP03-D errata E-c「stub 无 git 落点」教训前向兑现）→ **meetwise 授权 EXEC**（双审 PASS ≠ 实跑授权）→ **EXEC 一次成型**（trio 各 1 run · sidecar v2 · §1 判据逐 CMD 诚实判定）→ **post-prove 双审** → **meetwise 授权 nail**（三绿→**另立 `g7SuiteGreen` SSOT 刀** · 本刀 nail 零翻转）。

## 6. Non-claims（本 commit 逐条不宣称）

not trio green · not 三绿 · not `g7SuiteGreen=true` · not 任一 OPEN 行关闭（POST7B / 7A-DOWNGRADE / `:107` / C-MO-P3 行 / 残红①②③ / TAIL-DEATH / QGEN-P2 全数原状）· not covered（coveredCount=8 unchanged）· not HA · not `releaseEvidence=true` · not 修复 · not 归因定谳 · not run（零实跑零 live 零容器）· not coding（零码零 spec 零 SSOT 行改写）· **`g7SuiteGreen=false`** · **`actualSpendCny=null`** · Pins 十值零翻转 · alone ≠ dual。

详版 slice：`ai-docs/delivery/g7y-trio-rerun.slice.md`。
