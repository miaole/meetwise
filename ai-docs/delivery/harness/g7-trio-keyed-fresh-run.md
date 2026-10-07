# Harness — G7 · **trio 带 Key 新鲜跑刀**（Line G7K · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · 北星 G7 闸核心冲击刀 · ≠ suite green）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行 · Ban trio 实跑 · Ban live 本次零调用 · Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban washing red as flake · Ban 为绿改产品 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7K**（G7 trio **带 Key 新鲜跑**——G7 闸核心冲击刀）
**授权链（待走）**：G7K REQUEST（本 commit）→ pre-exec dual **mw-model-op + mw-e2e-ha BOTH PASS** → 协调方授权 prove 执行（EXEC 时下达）→ 才允许在独立 worktree 实跑三条 CMD（各 ×1）。**本 commit 不预claim 任何 post-commit EXIT；实跑授权 = 协调方 EXEC 指令，双审 PASS 本身 ≠ 实跑授权。**
**Knife 定位**：G7 北星硬闸要求**全量 CMD+EXIT 收据**。冻结 trio（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）**OPEN 1/1/1**，AC Path A（`3922b48` · NAILED TO `7c818c5`）已把 env-gap 清除、trio 全部撞 **Key-blocked fail-closed**（`live_provider_key_missing`）；G7B 四分类立卷（`1c4588f9`：Key-blocked 3+3 · 真实产品缺陷 0 确认 unknown≠0 · 夹具 1 族 open + 1 已修 · 环境 0 open）；AD **P4 解锁账**（`receipts/g7-key-blocked-residual-honest/P4-unlock-ledger.md`）列明 Key-blocked 解锁条件。本刀 = **P4 解锁刀**：用户已供给 live Key（`~/.meetwise-secrets/MODEL_API_KEY` · 协调方探测 HTTP 200 可用）并授权使用，经本刀 REQUEST + 双审 + 协调方 EXEC 授权后，在 committed SHA 上带 Key 新鲜跑 trio 三条 CMD 各 ×1——**真目标 = 翻绿**（G7 全量收据核心），任何红都如实收。
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（至三绿 + post-dual + 协调方 nail 前不翻转）**: `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · **never counts toward R1**）· trio **OPEN 1/1/1**（AC `7c818c5` + AD `880f144` EXIT 1/1/1 retained）
**Base**: `origin/feat/mysql-schema-skeleton` **`50423a6f`** / full `50423a6fa6f18d4c9d193611cf84c4702e067208`（2026-10-07 fetch 后实测 tip · docs `NAIL SCOR/P0-CB inventory contract`）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7k` · branch `line/g7k-trio-keyed`

---

## 0. AD P4 解锁账兑现状态（逐条 · 列条件 ≠ 本 commit 自授权）

| # | P4 条件 | 本刀状态 |
|---|---------|----------|
| U1 | live `MODEL_API_KEY` 供给（operator 注入 · never `.env*` · never printed） | **已满足**：用户供给 `~/.meetwise-secrets/MODEL_API_KEY`（含 loader `~/.meetwise-secrets/load-model-api-key.sh`）· 协调方探测 HTTP 200 可用（name-only 探针 · 值未打印未入库）· **Ban agent 自造/改写 Key** |
| U2 | live spend 预算授权（cap + ledger） | **已满足（授权面）**：用户授权使用本 Key 跑本刀 trio；**预算上限以协调方 EXEC 指令为准**；本 REQUEST §5 披露预估；`actualSpendCny=null` 沿 I 线保持 |
| U3 | separate live REQUEST + mw-model-op live 双审（+ mw-e2e-ha）PRE PASS | **进行中 = 本 REQUEST**：pre-exec dual = 本刀双审 stub（mw-model-op + mw-e2e-ha · alone ≠ dual） |
| U4 | 协调方对该 live run 显式 AUTHORIZE | **待 EXEC 下达**（双审 PASS 后由协调方授权 prove 执行 · Ban 以双审 PASS 冒充授权） |
| U5 | Ban buy cloud · Ban Meridian · Ban fake key / fake-model / fake service flags / Ban 改 `run-e2e*.mjs` | **in force**（代码级守门 `run-e2e.mjs:42` `fake_service_mode_forbidden` blob `c655235c` @`50423a6f` 在位） |

先例不携带授权：Line C live chat-only `7eb1a7e` ≠ trio run；A″/FIX Key-set era（quota-403 era）授权不沿用至本刀（quota 已由消除轮 `82981ff` 移除，本刀为独立 REQUEST + 独立授权）。

---

## 1. trio wiring @ 当 tip（行号一律附 @SHA · 漂移如实登记）

| 行号 | @`7c818c5`（AC 收据钉定） | @`4766d4fc`（G7B 实测） | **@`50423a6f`（本刀 base · 实测）** |
|------|-------------------------------|--------------------------|--------------------------------------|
| `e2e:isolated` | `:251` | `:260` | **`:276`** |
| `e2e:ui:isolated` | `:252` | `:261` | **`:277`** |
| `verify:e2e-performance` | `:255` | `:264` | **`:280`** |

（历史收据行号**不改写**；本表只做当 tip 重核登记，漂移 = 上游文件增长，非语义变化。EXEC 时若 tip 前移，按纪律「按当 tip 重核行号」重测后回填收据。）

**解析链不变**：`e2e:isolated` = `run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`；`e2e:ui:isolated` = `run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs`；`verify:e2e-performance` = `run-e2e-performance-suite.mjs`。

**Key gate 源码点 @ `50423a6f`（实测 · blob 零漂移）**：
- `scripts/run-e2e.mjs:43` `if (!String(env.MODEL_API_KEY ?? '').trim()) throw tagE2EFailure('provider', 'live_provider_key_missing');`（blob **`c655235cd3d747a4237aa137cc74cd4905aa872c`** ≡ G7B 记录值 · 零漂移）
- `scripts/run-e2e-ui.mjs:48` 同 gate（blob **`aa86fb3f421966d75ff73393b8360aa29f4b6c4c`** ≡ G7B 记录值 · 零漂移）
- `scripts/run-e2e.mjs:42` `fake_service_mode_forbidden` 假服务守门在位（Ban 假 Key 占位过门的代码级依据）
- Key set 时 gate 解除 = 上两处 throw 不触发；**Key set ≠ auto green**（FIX 先例：Key set 仍 EXIT 1 · quota-403 era）。

**perf 套件 step 面 @`50423a6f`（实测 `run-e2e-performance-suite.mjs:17-40`）**：`web production build` → `schema migration/deploy evolution`（`migrate:prove`）→ `HTTP full E2E` → R5-MARKED-RED pgvector-legacy 族（memory / HNSW / rag-generation / rag-corpus-version / qbank-control-role / rag-cache 等 LEGACY 步）→ 汇总 evidence JSON。Key-blocked 在 AC 收据中级联发生于 HTTP full E2E 步。

---

## 2. 跑法（EXEC 期 · 纪律三要素全量落地 · L 线 `g7-trio-current-state-alignment.md` §4 沿用）

1. **跑在 committed SHA 上**：协调方 EXEC 时**重钉 committed SHA**（若 tip 再前移，以协调方重钉为准并逐 receipt 记录；默认 = 本 REQUEST 之后的 line 分支 tip）。fetch → 实跑在**独立 worktree**（本刀 worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7k` · branch `line/g7k-trio-keyed`；EXEC 可另开 `-nail` worktree 收据落盘）。**实跑 code SHA 以 worktree HEAD 实测为准；receipt commit ≠ 实跑 code SHA 惯例不变。**
2. **依赖安装**：`pnpm install --frozen-lockfile`（禁改 lockfile；EXIT 逐次记录）。
3. **Key 卫生（硬）**：Key **只经进程环境**——`source ~/.meetwise-secrets/load-model-api-key.sh`（loader 原文：`export MODEL_API_KEY="$(tr -d '\n' </Users/miaole/.meetwise-secrets/MODEL_API_KEY)"`）或等价同进程 export 后跑 pnpm；**Ban 写任何 `.env*`** · **Ban Key 值/fingerprint 入 receipt / log / commit / 截图** · NEW_SHELL_STATUS 类探针 name-only（set/unset · 不打印值）· stdout/stderr 原始日志落 worktree `.tmp/`（不入 git）；receipt 只引路径 + 关键行摘录（摘录须过「无 Key 值」自查）。
4. **每条 CMD 恰好一次**：`pnpm e2e:isolated` / `pnpm e2e:ui:isolated` / `pnpm verify:e2e-performance` **各自独立 ×1**（建议顺序 iso → ui → perf，与 AC/FIX 同序；顺序如实记录）。**knife 级 Ban retry-to-green**：红了不重跑、Ban 只留绿 attempt、Ban 把 EXIT=1 洗成 flake/环境偶发。**单条 CMD 内部既有重试机制按其自身契约算一次 attempt**（如 playwright per-case retry 等 suite 内建重试 = CMD 契约的一部分），收据须披露该内部重试配置原值；**Ban 临时调高重试/并发/超时配置**（改 prove 契约 = Ban coding 边界内禁事）。
5. **环境探针逐 attempt 记录**：本机 host（macOS · darwin · arm64）**≠** 历史 Linux box（AC Path A 所在 host）——docker（`docker info`）、chromium（install/version/smoke · Line U §3.6 例外：chromium 可安装且逐条记录 · **chromium ran ≠ UI green**）、pnpm/node 版本、DB/镜像可用性逐项探针入 receipt；**env 缺口如实记为该 CMD 的 FAIL 原因（env-gap 类）入账，不洗不掩盖**。若 session 无 docker 权限：优先直接可用路径；确需组激活才可走 `scripts/with-docker-session.sh`（AC Path A 先例 · code `160c30c` · 激活**既有**组 · **Ban sudo/chmod/usermod/setfacl**）；本机不可行则如实记 env-gap，不发明替代路径。
6. **逐 attempt 全记录**：每 attempt 必含 **CMD 原文 + EXIT + 开始/结束时间戳 + 实跑 code SHA + worktree/branch + install 记录 + 环境探针 + 逐 case FAIL 明细（case 名 + 失败原因 + 分类：api / fixture / env-gap / frontend / provider）**。三类 attempt 记录来源：CMD 退出码（$?）、suite 自身 machine receipt（如 `.tmp/e2e-receipts/*.json`）、原始 log 文件；三者交叉一致才可引用。
7. **R5-MARKED-RED 披露保持**：宽 `e2e:isolated`/perf 默认绑 pgvector-legacy（BUG-E2E-ISO `gap-bug-backlog.md:98` 附近 · G6 still OPEN）——本刀**不修夹具**（Q1/Q2/Q3 排队 ≠ 授权，各须另刀），R5-MARKED-RED 原样披露；R5 步绿 ≠ sole-stack ≠ RAG migrated ≠ G6 closed。
8. **输出日志**：`.tmp/g7k-keyed-<date>/`（不入 git）· Ban secrets / Key / `.env*` 任何内容入树入 receipt；`.env*` 本刀零读取零创建（loader 直读 secret 文件，不经 .env）。

## 3. 期望（诚实双向 · 本刀核心口径）

- **正向（解锁预期）**：AC Path A 后 trio 全部 FAIL 的 dominant class = **Key-blocked**（C1/C2/C3 顶层 gate 点）。本刀带 Key：三 gate **应解除**（`run-e2e.mjs:43` / `run-e2e-ui.mjs:48` 不再 throw；perf HTTP 步不再级联 Key-blocked）——业务 case **首次在 quota 移除后（消除轮 `82981ff`）+ committed SHA 上真实执行**。**真目标 = 翻绿**：三条 CMD EXIT 0 是本刀追求的 G7 全量收据核心结果；三绿 ≠ 自动 suite green（仍须 post-dual + 协调方 nail）。
- **反向（红的诚实收法）**：任何红（任何一条 CMD EXIT=1、任何 case FAIL）**如实收**——EXIT1 原值入账 + **逐 case FAIL 明细**（哪个 case / 什么原因 / 哪类）。产品缺陷 → **登记 backlog**（证据 = 已执行 case 的失败明细 · 终结 G7B「unknown≠0」悬置面），**修复另刀**（本刀 Ban coding）。env-gap / fixture 类同样如实分类登记。
- **双向 Ban**：**Ban 假绿**（无 EXIT 证据宣称绿 / skip 洗 pass / not_run 洗 pass / capability skip 洗 voice green）；**Ban flake 记法**（EXIT=1 不得记为 flake / 偶发 / 环境抖动而冲销——env-gap 可以**如实定性**为 FAIL 原因，但**必须**作为 FAIL 入账，EXIT=1 不变）；**Ban 为绿改产品**（EXEC 期任何「顺手修一把让它绿」= 违纪；缺陷一律登记，修复另走 REQUEST + 双审 + 授权）。
- **历史参照（不是预测保证）**：FIX era（Key set + quota-403）UI = **10 passed / 2 failed / 10 skipped**（22 case 面）；本刀 quota 已移除，case 通过面**预计**改善，但 `AllocationQuota.FreeTierOnly` 残余已在消除轮处理，**不预claim 任何具体 EXIT**——实测为准。

## 4. 收据落点（EXEC 期产物 · 本 commit 零预填）

- 目录：**`ai-docs/delivery/receipts/g7-trio-keyed/`**
  - `e2e-isolated.md` · `e2e-ui-isolated.md` · `verify-e2e-performance.md`（3 per-CMD）+ `SUMMARY.md`
  - 每份 per-CMD 必含：§2.6 逐 attempt 全记录字段 + Key 卫生声明（经进程环境 · `.env*` 0 读 · 值 0 打印）+ live 调用披露（调用发生面如实记录 · 状态-only · 不打印 payload 敏感值）+ 内部重试配置原值。
  - `SUMMARY.md`：三条 EXIT 表 + 逐条一句话原因 + Pins/Retained 原值 + `g7SuiteGreen=false` 保持声明 + evidenceOfRecord / SSOT 登记**留 nail 阶段**。
- **`g7SuiteGreen=false` 保持至：三条全绿 + post-run dual BOTH PASS + 协调方 nail**——三者缺一，不翻转；单条绿 ≠ trio 绿；两条绿 ≠ trio 绿；trio 绿 ≠ suite green（G6 OPEN / R5-MARKED-RED / Disclosure-1 OPEN 等其余口径独立核算）。
- 归档收据（A″ / FIX / AC / AD / U / L / G7B）**零改写**；本刀只新增 `receipts/g7-trio-keyed/` 新文件。

## 5. 预算披露（live 调用预估 · Ban invented spend）

- **调用面预估**：仅 **text chat + embedding** 族经 `MODEL_API_KEY` 发生 live 调用（HTTP full E2E 业务流 + UI ~22 case 面 + perf HTTP 一轮；每 case 1–n 次调用）。**voice/OCR/ASR/TTS 无 DASHSCOPE key → 沿产品既有 honest capability skip = 0 调用**（FIX 先例 `:18-19`）。
- **数量级预估**：trio 全程 live 调用**上限约 200 次**（数量级估计 · 不含异常路径外重试；以收据 machine receipt 实测计数为准）。额度上限以协调方 EXEC 指令为准；超限即停、如实记该 CMD 中止原因（不洗 not_run）。
- **金额口径**：**`actualSpendCny=null` 沿 I 线保持**（无计价数据源 · No invented spend）；EXEC 收据只记调用计数/时长，**不发明金额**；金额入账须协调方另行给出计价依据。

## 6. 诚实条款（硬钉）

1. EXIT 全部如实；**EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ SLO/LOAD ≠ 0 BUG ≠ fixed ≠ R1 closed ≠ G6 closed**；EXIT=1 是诚实红灯（env-gap 可如实定性为 FAIL 原因，但不得冲销 EXIT=1）；not_run ≠ pass；`g7_hard_disabled`（mapped not_run label）/ 运行时 `g7_path_disabled:<capability>` ≠ pass。
2. **Key set ≠ auto green**（FIX 先例 retained）；gate 解除 ≠ case 全过；capability skip ≠ voice/OCR green；mock 面（Q3）不存在于本刀，Ban 借任何 mock/假服务冒充真模型 E2E。
3. `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 OPEN · `techRoleFailClosedOptOutG7Only=true` · coveredCount=8 · trio OPEN 1/1/1（EXEC 前原值；EXEC 后按实收更新且**只由 nail 阶段落 SSOT**）。
4. ERRATUM 措辞冻结：FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban 写 `b1d7b22` @ 09-23 为该移除。
5. 本 commit（REQUEST）不预claim 任何 post-commit EXIT；三份收据在授权实跑后由被授权执行另行落盘，本文档零预填。

## 7. 边界（Ban 清单 · 本 REQUEST turn）

- **Ban coding**：零产品代码 / 零脚本 / 零夹具 / 零 `package.json` 改动（`run-e2e*.mjs` 零触碰 · EXEC 期同禁）。
- **Ban prove 执行**：本 turn 零 trio 实跑、零 live 调用、零 Key 加载（Key 文件存在性与 loader 存在性核对 = name-only · 未读值）。
- **Ban push**：一切 git 写操作只在独立 worktree commit；不 push、不 force-push。
- **Ban SSOT**：`gap-bug-backlog.md` / `execution-master-checklist.md` / 覆盖矩阵 / north-star 零触碰（nail 期才碰；缺陷登记也在 nail/另刀走）。
- **Ban live（本 turn）**：真实模型调用 0 次；`actualSpendCny=null`。
- **Ban 碰 sibling 线产物**：AC/AD/U/L/G7B 归档不改写。
- **Ban self-approve**：pre-exec dual = mw-model-op + mw-e2e-ha 两方独立签署（alone ≠ dual · 不代签 peer）；dual PASS 后仍须协调方授权 prove 执行。

## 8. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not suite green · not trio green · not family green · not fixed · not classified-as-green · not R1 closed · not Disclosure-1 closed · not TECH_ROLE closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail（SSOT 零触碰）· not new evidence · not live（本 turn）· not Key provisioning by agent（Key 由用户供给 · agent 零自造）· not coordinator authorize（U4 待 EXEC）· Key set ≠ auto green · gate 解除 ≠ case 全过 · `g7SuiteGreen=false` · `r1Closed=false` · trio OPEN 1/1/1 · 历史 EXIT 1/1/1 retained · `actualSpendCny=null` · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN 1/1/1 · STOP（awaiting pre-exec dual + 协调方 EXEC 授权）

---

*Harness · G7 trio 带 Key 新鲜跑刀 · Line G7K · 2026-10-07 · draft:awaiting_pre_exec_dual · docs REQUEST only · AD P4：U1/U2 满足 · U3=本刀双审 · U4 待协调方 EXEC · 真目标=翻绿 · 红如实收（EXIT1+逐 case 明细→登记，修复另刀）· Ban 假绿 / Ban flake 记法 / Ban 为绿改产品 · Key 只经进程环境 · Ban .env* · 每 CMD 恰一次 · g7SuiteGreen=false 至三绿+post-dual+nail · actualSpendCny=null · STOP*
