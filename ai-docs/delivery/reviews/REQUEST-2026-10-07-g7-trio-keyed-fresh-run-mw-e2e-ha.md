# REQUEST — **G7 trio 带 Key 新鲜跑**（北星 G7 闸核心冲击刀 · AD P4 解锁刀 · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7-trio-keyed-fresh-run.md` · slice `g7-trio-keyed-fresh-run.slice.md`
**Base tip**: `50423a6f`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7K**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN 1/1/1**（retained · AC `7c818c5` + AD `880f144` EXIT 1/1/1 retained） |
| `techRoleFailClosedOptOutG7Only` | **true**（retained · Disclosure-1） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 诚实性 / HA 口径）

Line G7K · **G7 trio 带 Key 新鲜跑刀**（AD P4 解锁刀 · 北星 G7 闸核心冲击刀）。请审：

1. **跑法三要素（harness §2 · L 线 `g7-trio-current-state-alignment.md` §4 纪律沿用）**：committed SHA + frozen-lockfile + 独立 worktree；三条 CMD（`pnpm e2e:isolated` `:276` / `pnpm e2e:ui:isolated` `:277` / `pnpm verify:e2e-performance` `:280` @`50423a6f` 实测；解析链 iso→`run-e2e.mjs`、ui:iso→`run-e2e-ui.mjs`、perf→`run-e2e-performance-suite.mjs` 不变）**各自恰好一次**；单条 CMD 内部既有重试机制按其自身契约算一次 attempt（配置原值披露 · Ban 临时调高）；**每 attempt 全记录：CMD + EXIT + 起止时间戳 + 实跑 code SHA（receipt commit ≠ 实跑 code SHA）+ 环境探针 + 逐 case FAIL 明细**。
2. **wiring 行号漂移登记（harness §1）**：AC 钉定 `:251/:252/:255` → G7B 实测 `:260/:261/:264` → 本刀 `:276/:277/:280` @`50423a6f`——漂移如实登记、历史收据不改写；EXEC 时 tip 前移则按「按当 tip 重核行号」重测回填。gate blob `c655235c`/`aa86fb3f` 零漂移。
3. **期望诚实双向（harness §3 · e2e-ha 首责）**：带 Key 后三 gate 应解除、**真目标 = 翻绿**；任何红如实收——EXIT1 原值 + 逐 case FAIL 明细（case 名/原因/分类 api/fixture/env-gap/frontend/provider）→ 产品缺陷登记 backlog（修复另刀）；**Ban 假绿 · Ban flake 记法（env-gap 可定性为 FAIL 原因但不得冲销 EXIT=1）· Ban 只留绿 attempt · Ban retry-to-green · Ban 为绿改产品**。
4. **环境缺口诚实（harness §2.5）**：本机 macOS host ≠ 历史 Linux box——docker/chromium/pnpm/DB 探针逐 attempt 记录；env 缺口如实记 env-gap 类 FAIL 原因；chromium 可安装例外保留且逐条记录（**chromium ran ≠ UI green** · UI′ `post_prove_dual_pass:honesty_red` retained 惯例）；docker 组激活仅限 `with-docker-session.sh` 先例（Ban sudo/chmod/usermod/setfacl · 本机不可行则如实记 env-gap 不发明替代路径）。
5. **夹具披露保持**：R5-MARKED-RED `E2E_ISOLATION_STACK=pgvector-legacy`（BUG-E2E-ISO · G6 still OPEN）原样披露；本刀**不修夹具**（G7B Q1/Q2/Q3 排队 ≠ 授权 · 各须另刀）；R5 步绿 ≠ sole-stack ≠ RAG migrated ≠ G6 closed。
6. **收据与口径（harness §4）**：`receipts/g7-trio-keyed/` 3 per-CMD + SUMMARY；归档（A″/FIX/AC/AD/U/L/G7B）零改写；**`g7SuiteGreen=false` 保持至三条全绿 + post-run dual BOTH PASS + 协调方 nail**；单条绿 ≠ trio 绿；trio 绿 ≠ suite green ≠ HA ≠ SLO/LOAD ≠ covered ≠ `releaseEvidence=true`；`EXIT=0 ≠ 0 BUG ≠ fixed`；not_run ≠ pass；SSOT 留 nail 阶段。
7. **Ban live 侧纪律（与 model-op 分工共守）**：Key 只经进程环境 · Ban `.env*` · Ban Key 值/fingerprint 入树；live 调用面如实披露（text chat + embed 族 · voice/OCR/ASR/TTS honest capability skip = 0 调用且 Ban 洗 skip-as-pass）；`actualSpendCny=null` 沿 I 线。
8. **边界**：本 REQUEST turn docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT · Ban 碰 sibling 归档 · ERRATUM 措辞冻结（观察=`3424dc1` · 消除轮=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22`@09-23）。

Trio stays **OPEN 1/1/1**. `g7SuiteGreen=false`. `r1Closed=false`. Disclosure-1 **OPEN**. **Key set ≠ auto green** · chromium ran ≠ UI green · capability skip ≠ voice green · gate 解除 ≠ case 全过 · **Ban 假绿叙事**.

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权实跑；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

# PRE-EXEC dual 审查段（mw-e2e-ha · adversarial evidence-honesty · append-only）

**Status**: PASS（e2e-ha 半签 · alone ≠ dual · 不代签 peer mw-model-op）
**Reviewer worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-g7k-e2e-ha` · branch `rv/g7k-e2e-ha` @ 主线 tip `23b2ceb5`
**被审 REQUEST**: `19df4e7f`（G7K trio keyed fresh run · 本地主线最新段）
**本审自身边界**: docs gate only · 0 prove run · 0 live 调用 · 0 Key 值读取（仅 `~/.meetwise-secrets/` name-only 存在性核对）· 0 coding · 0 SSOT 触碰 · 禁 push

## §A 检查表（逐项机检裁决）

| # | 审项 | 裁决 | 证据（本审亲算） |
|---|------|------|------------------|
| P1 | 祖先 + docs-only | **PASS** | `merge-base --is-ancestor 19df4e7f 23b2ceb5` OK；`git show --name-status 19df4e7f` 恰 4 文件全 ai-docs（slice +28 / harness +111 / 双 stub +43/+44 = +226/−0），零产品码零 `package.json` 零 SSOT 四件零 reviews 外触碰 |
| P2 | 三 gate 收据对照 | **PASS** | `run-e2e.mjs:43` gate 语句逐字亲读吻合，整文件 blob `c655235cd3d7…` 亲算全等；`run-e2e-ui.mjs:48` 同 gate，blob `aa86fb3f4219…` 全等；`run-e2e.mjs:42` `fake_service_mode_forbidden` 在位；perf 级联与 AC SUMMARY（`g7-env-gap-honest-fix/SUMMARY.md` EXIT 1/1/1 · row 3 HTTP 步 Key-blocked · `:48` stderr）+ `P1-key-gate-cite-ledger.md:26-27` 同 blob 前缀逐字吻合 |
| P3 | wiring 行号 @base | **PASS** | `package.json` @`50423a6f` `:276`=`e2e:isolated` / `:277`=`e2e:ui:isolated` / `:280`=`verify:e2e-performance` 亲读吻合；解析链三条（iso→`run-e2e-isolated.mjs e2e:prove`→`run-e2e.mjs` 等）与源文件一致；`run-e2e-performance-suite.mjs:17-40` 步面（build→migrate→HTTP full E2E→R5-MARKED-RED LEGACY 族）亲读吻合 |
| P4 | G7B 分类衔接 | **PASS** | `P2-residual-classification.md`：business assert **unknown(null)** + Ban 写 0 + AD@`880f144` 无漂移 Key-blocked 1/1/1；backlog `:106` G7B 立卷行「Key-blocked 3+3 · 真实产品缺陷 0 确认（unknown≠0）· 夹具 1 族 open+1 已修 · 环境 0」——REQUEST「红如实收→缺陷登记 backlog 终结 unknown≠0 · 修复另刀」与之闭环 |
| P5 | L 线三要素沿用 | **PASS** | `g7-trio-current-state-alignment.md` §4 `:78`（CMD+EXIT+时间戳含失败 attempt · 实跑 code SHA receipt commit≠prove SHA · 禁 retry-to-green/只留绿/洗 flake · 行号附 @SHA）→ harness §2 全量落地且加码（+逐 case FAIL 明细五分类 + 三来源交叉一致 + 环境探针） |
| P6 | 期望双向诚实 · 三禁写死 | **PASS** | 「真目标=翻绿」（harness §3/slice 要点2/stub 第3条）与「任何红如实收 EXIT1 原值+逐 case 明细→登记」并置；Ban 假绿（harness §3/§6.1/§6.2）、Ban flake 记法（env-gap 可定性为 FAIL 原因但**不冲销 EXIT=1** · §3/§6.1）、Ban 为绿改产品（EXEC 期顺手修=违纪 · §3/§7/stub 第3条）三禁跨文件一致写死 |
| P7 | 一次跑纪律 | **PASS** | 三条 CMD 各自恰好一次（harness §2.4 · knife 级 Ban retry-to-green）；单 CMD 内部既有重试按自身契约算一次 attempt + 配置原值披露 + Ban 临时调高重试/并发/超时（§2.4）；逐 attempt 全记录七字段（§2.6）；实跑 code SHA 以 worktree HEAD 实测、receipt commit ≠ 实跑 code SHA（§2.1/stub 第1条） |
| P8 | env-gap 预披露（记不洗） | **PASS** | harness §2.5：macOS（darwin·arm64）≠ 历史 Linux box（AC Path A host）明写；docker/chromium/pnpm/node/DB 逐项探针入 receipt；「env 缺口如实记 env-gap 类 FAIL 原因入账，不洗不掩盖」+ stub 第4条同文；chromium 可安装例外保留（Line U §3.6 锚点落实 · chromium ran ≠ UI green）；docker 组激活仅限 `with-docker-session.sh`（code `160c30c` 在档 · 脚本源码自带 Ban sudo/chmod/usermod/setfacl 亲读）；本机不可行如实记 env-gap 不发明替代路径 |
| P9 | `g7SuiteGreen=false` 保持 + 收据落点 | **PASS** | 三绿 + post-run dual BOTH PASS + 协调方 nail 三者缺一不翻转（harness §4/slice 要点3/stub 第6条三处一致）；单条绿≠trio 绿、两条绿≠trio 绿、trio 绿≠suite green（G6 OPEN/R5-MARKED-RED/Disclosure-1 OPEN 独立核算）；落点 `receipts/g7-trio-keyed/` 3 per-CMD + SUMMARY · 归档零改写 · SSOT/evidenceOfRecord 留 nail |
| P10 | Pins 原值 + retained 三项 | **PASS** | haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 原值零漂移（stub/harness/slice 三处对齐）；retained：`g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` + Disclosure-1 OPEN + trio OPEN 1/1/1（AC `7c818c5`+AD `880f144` EXIT 1/1/1 retained · P2 收据亲证 no drift） |
| P11 | P4 解锁账 + 授权链 | **PASS** | U1（Key 用户供给 · loader 与 Key 文件 name-only 在位亲证 · 值零读零印）/ U2（授权面满足 · cap 待 EXEC）/ U3（=本 REQUEST+dual）/ U4（待协调方 EXEC 显式授权 · **双审 PASS ≠ 实跑授权**多处写死）/ U5（in force · `:42` 守门亲证）；与 AD `P4-unlock-ledger.md`「conditions only ≠ authorize」结构一致；先例不携带授权（Line C `7eb1a7e` chat-only / FIX Key-set era / AC Path A）逐条写死；ERRATUM 四 SHA（`3424dc1`/`82981ff`/Ban shorthand/`b1d7b22`@09-23）亲证在档且措辞冻结 |
| P12 | 抢跑面 | **PASS** | `line/g7k-trio-keyed` 上 `50423a6f..bfad493f` 恰 1 commit = REQUEST 本身（patch-id `d6093f0c…` 与主线 `19df4e7f` 双侧亲算全等 · 四 REQUEST 文件 byte-identical）——零先于 dual 的 EXEC/receipt 抢跑 |

## §B Fail-trigger audit（找茬面 · 均未触发）

- F1 假绿：REQUEST 本身零实跑零预填（§6.5 本 commit 不预claim 任何 post-commit EXIT · §4 本 commit 零预填），无任何绿宣称 → 不触发。
- F2 flake 洗白：Ban flake 记法写死且显式禁止 env-gap 冲销 EXIT=1 → 不触发。
- F3 为绿改产品：Ban coding 贯穿 REQUEST turn 与 EXEC 期（`run-e2e*.mjs`/夹具/`package.json` EXEC 期同禁）→ 不触发。
- F4 Key 泄露：Key 只经进程环境 · Ban `.env*` · Ban 值/fingerprint 入树入据 · name-only 探针 · 原始 log 落 `.tmp/` 不入 git → 不触发（本审亦零读值）。
- F5 授权越位：U4 待协调方 EXEC · 双审 PASS ≠ 实跑授权 → 不触发。
- F6 SSOT/归档触碰：机检 name-status 零命中 → 不触发。
- F7 FIX/AC 先例授权沿用：显式 Ban 沿用 → 不触发。

## §C 观察（非阻断）

- O1: harness §1「BUG-E2E-ISO `gap-bug-backlog.md:98` 附近」——当前树实锚 `:104`（G7B 立卷行自称「:100 附近」）。「附近」已 hedge、cite-only、且 harness §1 明文「行号一律附 @SHA · 漂移如实登记」→ 由 C-K7 跟踪。
- O2: mw-e2e-ha stub Pins 表无 `actualSpendCny=null` 行（mw-model-op stub 表有）——审方分工使然；stub 第7条 + slice/harness Non-claims 均载 `actualSpendCny=null` 沿 I 线，不构成缺口。
- O3: base 漂移：REQUEST base=`50423a6f`（authoring 时 origin tip · 本地 origin ref 仍指此），本地主线已前移 5 commits（`50423a6f..23b2ceb5` 机检全 ai-docs 零产品码），G7 全部锚点（wiring `:276/:277/:280` + 两 gate blob + perf 步面）base→tip **零漂移亲证**；harness §2.1「EXEC 时协调方重钉 committed SHA」已预披露；origin push 间歇堵以本地主线链为准如实记录。
- O4: blob 口径：`c655235c`/`aa86fb3f` 为**整文件 blob**（与 P1 key-gate cite ledger 同口径）；两文件 gate 语句单行内容 hash 相同（`3fa534f6`）亦亲证同文——口径一致无歧义。

## §D Blockers

**0 Blocker。**

## §E Conditions（C-K1~C-K8 · 随卷绑定 EXEC 期 · 缺一即本 PASS 不覆盖）

- **C-K1**: 实跑前须协调方显式 U4 AUTHORIZE + committed SHA 重钉落字；双审 PASS（含本 PASS）≠ 实跑授权；先例（Line C/FIX/AC）不携带授权。
- **C-K2**: 每 attempt 全记录七字段缺一不可（CMD 原文+EXIT+起止时间戳+实跑 code SHA+worktree/branch+install+环境探针+逐 case FAIL 明细）；退出码/machine receipt/原始 log 三来源交叉一致才可引用；实跑 code SHA ≠ receipt commit。
- **C-K3**: 任何红（含 env-gap 类）一律 EXIT=1 原值入账 + 逐 case FAIL 明细五分类（api/fixture/env-gap/frontend/provider）；env-gap 只可定性为 FAIL 原因、不得冲销 EXIT=1；Ban 假绿 · Ban flake 记法 · Ban 只留绿 attempt · Ban retry-to-green。
- **C-K4**: 产品缺陷→登记 backlog、修复另刀；EXEC 期 Ban coding（`run-e2e*.mjs`/夹具/`package.json` 零触碰）。
- **C-K5**: `g7SuiteGreen=false` 保持至三条全绿 + post-run dual BOTH PASS + 协调方 nail；SSOT/evidenceOfRecord 登记留 nail 阶段；归档（A″/FIX/AC/AD/U/L/G7B）零改写。
- **C-K6**: Key 卫生：只经进程环境（loader 或等价同进程 export）· Ban `.env*` · Ban 值/fingerprint 入 receipt/log/commit/截图 · 探针 name-only · 原始 log 落 `.tmp/` 不入 git · 摘录过「无 Key 值」自查。
- **C-K7**: 行号/blob 漂移：EXEC 非 `50423a6f` 系 tip 时按当 tip 重核 wiring/gate 行号与 blob 并逐 receipt 回填（本审实测锚点至 `23b2ceb5` 零漂移）；「:98 附近」类 cite 漂移同此办理。
- **C-K8**: 预算：额度上限以协调方 EXEC 指令为准，超限即停如实记中止（不洗 not_run）；`actualSpendCny=null` 沿 I 线 · Ban invented spend · 金额须协调方另给计价依据。

## §F 中文摘要（3 行）

1. G7K REQUEST（`19df4e7f`，恰 4 md 全 ai-docs +226/−0 零产品码零 SSOT）为 P4 解锁刀：三 gate 锚点（`run-e2e.mjs:43` blob `c655235c` / `run-e2e-ui.mjs:48` blob `aa86fb3f` / perf HTTP 级联）与 wiring `:276/:277/:280` @`50423a6f` 逐一亲算吻合且至主线 tip `23b2ceb5` 零漂移，AC/G7B/AD/L 线引用面（含 ERRATUM 四 SHA、P4 账 U1–U5、Key-blocked 3+3 · unknown≠0）全落实。
2. 诚实骨架成立：真目标=翻绿与红如实收（EXIT1 原值+逐 case 明细→登记、修复另刀）双向写死，Ban 假绿/Ban flake 记法（env-gap 不冲销 EXIT=1）/Ban 为绿改产品三禁跨文件一致；每 CMD 恰一次+内部重试按自身契约+逐 attempt 七字段全记录+receipt commit≠实跑 code SHA；macOS≠Linux box 的 env-gap「记不洗」预披露在位。
3. 0 Blocker；C-K1~C-K8 随卷绑定（U4 协调方授权未下、`g7SuiteGreen=false` 至三绿+post-dual+nail、Key 卫生、漂移回填、预算纪律）；本 PASS 仅为 mw-e2e-ha 半签，alone≠dual，不代签 mw-model-op，POST PASS≠AUTHORIZE≠prove 授权。

*PRE-EXEC dual · mw-e2e-ha · 2026-10-07 · append-only（首 43 行 byte-intact）· 0 prove run · 0 coding · 0 SSOT · 禁 push*

Verdict: PASS
