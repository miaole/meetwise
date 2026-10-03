# REQUEST — **G7 trio / Disclosure-1 / TECH_ROLE=0 ≠ R1 honesty** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`
**Knife**: `harness/g7-trio-disclosure-techrole-honesty.md` · slice `g7-trio-disclosure-techrole-honesty.slice.md`
**Parent tip**: `320c07b`（origin `feat/mysql-schema-skeleton` tip · not a prove tip）
**Date**: 2026-10-03

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
| `g7SuiteGreen` | **false**（retained） |
| `r1Closed` | **false**（retained） |

## 请审什么（mw-model-op 视角）

Line L · G7 遗留 honesty docs-only REQUEST：冻结 trio（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）历史 **OPEN 1/1/1** + **Disclosure-1** + **TECH_ROLE=0 ≠ R1** 口径钉；本刀默认离线文档+收据对齐。请审：

1. **Trio 现状钉是否属实、逐一完整**（harness §1）：
   - `pnpm e2e:isolated`（`package.json:240` → `run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`）：缺 quota-403 移除（`b1d7b22` 及后）在已提交 SHA 上的新鲜 CMD+EXIT；Key set 时曾 **403 `AllocationQuota.FreeTierOnly`** → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api`；夹具面 BUG-E2E-ISO / G6 OPEN；R5-MARKED-RED retained。
   - `pnpm e2e:ui:isolated`（`package.json:241` → `e2e:ui` → `run-e2e-ui.mjs`）：末次（Key set + chromium ran）EXIT=1 · **10 passed / 2 failed / 10 skipped** · recruiting-bound timeout · stream/golden partial；CR chromium prereq 关 ≠ UI green（UI′ honesty_red retained）。
   - `pnpm verify:e2e-performance`（`package.json:244` → `run-e2e-performance-suite.mjs`）：末次 migrate PASS 后 **HTTP full E2E fail**；SLO/LOAD/HA 证据缺（G6 OPEN）。
   - 末次 trio 实跑 = 2026-09-17 FIX（prove `a4e3de5` · dual tip `5f591ea`）；此后 A″（dual `e697c81`）EXIT 1/1/1；FR3 / Line C live（2026-10-02）均 **not_re_run · stay OPEN**。
2. **Disclosure-1 口径钉**：`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · **never counts toward R1** · `techRoleFailClosedOptOutG7Only=true`（G7-only opt-out）；披露项 **OPEN** 须持续披露。禁叙事：Ban「TECH_ROLE=0 ⇒ R1 closed / fail-closed 已生产生效」· Ban「G7 e2e 绿 ⇒ 生产 role path 已 fail-closed」· Ban 抹除 Disclosure-1。
3. **TECH_ROLE=0 ≠ R1**：R1 **STILL OPEN**（`r1-real-close-ssot-flip`：SSOT NOT flipped）· `r1Closed=false`；Ban 跨口径引用（offline proves @ `b1d7b22` EXIT=0 / Line C 单 settled call EXIT=0 / CR chromium 0/0/0 任一 ≠ trio EXIT=0 ≠ R1 证据）。
4. **本刀范围**：docs 对齐 + **离线收据索引对齐**（harness §5，零新跑、零改写历史收据）；**不**宣称 suite green；`g7SuiteGreen=false` 保持；SSOT 行（backlog / checklist / 矩阵）**本阶段零触碰**，nail 阶段才改且须协调方另行授权。
5. **Ban live（硬）**：真实模型 API 调用零次（chat/embed/rerank/asr/tts/stream 全族）；不加载 Key；不跑 NEW_SHELL_STATUS probe；不读 `.env*`；`actualSpendCny=null`（No invented spend）。
6. **禁假绿 / 禁 retry-to-green**：EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ 0 BUG；not_run ≠ pass；收据 token `g7_hard_disabled` = mapped not_run label（运行时抛 `g7_path_disabled:<capability>`）≠ pass；未来任何授权跑逐 attempt 记录（含失败），禁只留绿 attempt、禁循环重跑至绿。
7. **quota-403 residual CLOSED ≠ suite green**（G7 FR3 nail 原文口径）——Ban「quota-403 removed ⇒ trio green」。

Trio stays **OPEN 1/1/1**. `g7SuiteGreen=false`. R1 **OPEN**. Disclosure-1 **OPEN**. **Ban covered**. **Ban 假绿 suite 声明**。本 stub 不授权 coding / prove / live / push；pre-exec dual PASS 后由协调方另行授权；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · G7 trio/disclosure/techrole honesty · mw-model-op（docs gate only · Ban prove · Ban product edit · Ban live）

**Reviewer**: `mw-model-op`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-e2e-ha`）
**Review date**: 2026-10-02
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-l-model-op`（branch `rv/l-model-op`，自 `origin/feat/mysql-schema-skeleton`）
**被审 SHA**: `0345315`（`0345315d19c92f038519e6e4b5ebd680f36c6441` · `docs(model-op): REQUEST G7 trio/disclosure/techrole honesty (pre_dual)`）
**Docs-only 核实**: `git diff --name-status 0345315^ 0345315` = 恰 4 个新增 md（slice / harness / REQUEST·model-op / REQUEST·e2e-ha），+298/−0，零代码 / 零 SSOT / 零 `package.json` 触碰。
**祖先关系**: `git merge-base --is-ancestor 0345315 origin/feat/mysql-schema-skeleton` EXIT=0；origin tip 现为 `a66e1d1`（A″/C'' nail 前移，fetch 后实况）；REQUEST 记载 base tip `320c07b` = `0345315^`（核实一致）。

## 检查表（file:line 证据 · 本 worktree @ a66e1d1 实读）

1. **Trio wiring 只读核对**：`package.json:238` `e2e:prove`=`node scripts/run-e2e.mjs` · `:239` `e2e:ui`=`node scripts/run-e2e-ui.mjs` · `:240` `e2e:isolated`=`node scripts/run-e2e-isolated.mjs e2e:prove` · `:241` `e2e:ui:isolated`=`node scripts/run-e2e-isolated.mjs e2e:ui` · `:244` `verify:e2e-performance`=`node scripts/run-e2e-performance-suite.mjs` —— 与 harness §1 表（`harness/g7-trio-disclosure-techrole-honesty.md:33-39`）逐字一致；`git diff --stat 320c07b HEAD -- package.json scripts/` 为空（wiring 引用未失效）。
2. **Trio 现状诚实性（OPEN 1/1/1 · prior EXIT=1 retained）**：
   - `e2e:isolated`：403 `AllocationQuota.FreeTierOnly` → `questions=0` · `interview_unavailable`/`generation_provider_not_configured` · `failureClass=api` = `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md:28`；harness:45；本 stub:30；slice:32。
   - `e2e:ui:isolated` 末次 **EXIT=1 · 10 passed / 2 failed / 10 skipped** · recruiting-bound timeout · stream/golden partial 如实呈现，未把 partial pass 说成 green：`receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md:29`；harness:46；本 stub:31；slice:33。
   - `verify:e2e-performance` 末次 migrate PASS 后 HTTP full E2E fail：`receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md:30`；harness:47；本 stub:32；slice:34。
   - 末次 trio 实跑 = 2026-09-17 FIX · prove `a4e3de5` · dual tip `5f591ea`：`receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md:7-8`；harness:45,104；本 stub:33。
   - A″ Key×3 re-run dual `e697c81` EXIT **1/1/1**：`receipts/2026-09-17-g7-key-x3-rerun.md:8,20`；harness:105。
   - FR3（2026-10-02）offline only · live trio not_run：`reviews/2026-10-02-g7-key-x3-freetieronly-fixround3-mw-model-op.md:9,30`；`receipts/g7-key-x3-freetieronly-reprove/2026-09-23-line-c-step3-g7-freetier-live-receipt.md:43`（"Offline only · no live trio · no nail yet"）。
   - Line C live（2026-10-02）trio not_re_run · stay OPEN：`receipts/g7-linec-live-2026-10-02/2026-10-02-line-c-chat-live-receipt.md:15`；`gap-bug-backlog.md:181`；`execution-master-checklist.md:492`。
   - CR chromium prereq 0/0/0 ≠ UI green · Live `not_run:this_knife`：`g7-chromium-ui-runner-prereq.slice.md:21,35,43-44`；`reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md:9-10`。UI′ `post_prove_dual_pass:honesty_red` retained：`g7-ui-live-rerun-after-chromium.slice.md:3,6`。
3. **Disclosure-1 / TECH_ROLE=0 ≠ R1**：原文「G7 e2e `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` — non-production role path; never counts toward R1」= `receipts/g7-key-x3-freetieronly-reprove/2026-09-23-line-c-step3-g7-freetier-live-receipt.md:13-14`；`techRoleFailClosedOptOutG7Only=true`：同收据:7；harness:9,58,136；slice:38；本 stub:34。R1 STILL OPEN · SSOT NOT flipped：`reviews/2026-09-17-r1-real-close-ssot-flip-mw-rag-route.md:5-6,28`、`reviews/2026-09-17-r1-real-close-ssot-flip-mw-e2e-ha.md:14,16`（"no SSOT flip yet"）；`gap-bug-backlog.md:128`「R1 **OPEN**」；`execution-master-checklist.md:450`；Line C receipt:37。Line C run `MEETWISE_TECH_ROLE_FAIL_CLOSED` unset：receipt:37；`gap-bug-backlog.md:182`。禁叙事清单钉死：harness:65-71；slice:40；本 stub:34-35。
4. **Ban live / 收据 token（不改码）**：Ban live 贯穿四文件（harness:11,22,89；slice:26,48；本 stub:37；e2e-ha stub:37）；无任何真实模型调用安排、零 Key 加载、零 `.env*` 读取、零 NEW_SHELL_STATUS probe；`actualSpendCny=null`（harness:9,136；slice:53；receipt:28；backlog:180）。token 口径「`g7_hard_disabled` = mapped not_run label · 运行时抛 `g7_path_disabled:<capability>` · 均 ≠ pass · Do not change code」：`gap-bug-backlog.md:131,186`；harness:52；slice:42；代码实证（只读）：`packages/ai-runtime/test/g7-freetier-reprove-paths.proof.ts:102-144` · `g7-freetier-fix-round2.proof.ts:202-204`；0345315 未触碰任何代码。
5. **Pins 原值保持**：`haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503` + retained `g7SuiteGreen=false · r1Closed=false · techRoleFailClosedOptOutG7Only=true · nail=false · actualSpendCny=null` —— 本 stub Pins 表:12-23、harness:8-9,134-137、slice:6-7,44-53、e2e-ha stub:12-23 全部原值，无翻转；`g7SuiteGreen=false` 与 SSOT 现行一致（`gap-bug-backlog.md:128` · `execution-master-checklist.md:450`）。
6. **SSOT 现行口径交叉核对（只读）**：G7 FR3 nail「Trio **OPEN** 1/1/1」=`gap-bug-backlog.md:128`（e2e-ha stub:33 引 :128 ✓）；Line C live nail「Trio not_re_run, historical exit 1, stay OPEN」=`gap-bug-backlog.md:181`（✓）· `execution-master-checklist.md:492`（✓）；quota-403 removed ≠ suite green（FR3 nail 原文）=`gap-bug-backlog.md:129` = harness:24；nail additive 惯例（不改写 `210f4c0` FR3 段）= `gap-bug-backlog.md:184` = harness:80。
7. **产出边界与「不到北星不停」兼容**：harness §3（:75-83）授权范围 = docs 对齐 + 离线收据索引（零新跑、零新证据、零改写历史收据）；nail 阶段须协调方另行授权（:80）；§8 Non-claims（:147）明确 not trio green / not fixed / not R1 closed / not SSOT edited；§6 lifecycle（:121-128）Trio OPEN retained。本刀 = 诚实登记刀，非完成刀，未宣称 trio 关闭 ✓。

## Fail-trigger audit（逐项排查 · 均未触发）

- **F1 历史/部分绿暗示现状绿**：未触发——三 CMD 均标 OPEN + prior EXIT=1 retained（harness:45-47；slice:32-34；stub:30-32）；`e2e:ui:isolated` 的 10P/2F/10S 与 EXIT=1 并列如实呈现，无「chromium 关 ⇒ UI 绿」变体（harness:46「chromium ran ≠ UI green」）。
- **F2「R1 已关 / fail-closed 已生产生效」暗示**：未触发——禁叙事清单 harness:65-71 共 6 条；「TECH_ROLE=0 ≠ R1」「never counts toward R1」在 4 文件一致。
- **F3 live 安排 / Key 动作**：未触发——Ban live 硬禁令贯穿，零调用安排、零 invent spend（`actualSpendCny=null`）。
- **F4 假绿 suite 叙事 / `g7SuiteGreen` 翻转**：未触发——四文件全部保持 false，且「本刀不宣称 suite green」显式（slice:47；harness:81；stub:36）。
- **F5 改共享 SSOT / 翻 covered / 翻 UC 行**：未触发——0345315 = 4 新增 md，backlog / checklist / 矩阵 / north-star 零触碰；nail 明确另授权。
- **F6 收据 token 改码 / 洗 token**：未触发——映射口径如实披露且「Do not change code」；运行时 token `g7_path_disabled:*` 代码未动。
- **F7 retry-to-green 安排**：未触发——harness:27,93 明禁，未来授权跑须逐 attempt 记录（含失败 EXIT+时间戳）。

## Blockers

无。

## Conditions

- **C-1（双签）**：alone ≠ dual。本 PASS 仅为 `mw-model-op` 半签，不构成 dual、不授权 L2/L3；须 `mw-e2e-ha` 独立同审 PASS + 协调方另行授权后方可执行 docs 对齐 / 离线收据整理 / nail SSOT 登记；implementer 不自批。
- **C-2（时序措辞修正）**：本 stub:33「此后 A″（dual `e697c81`）EXIT 1/1/1」时序措辞不精确——按收据时间戳，A″ re-run（2026-09-17 ~19:29–19:37 PT execute · nail ~19:50）在 FIX（~20:04–20:17 · nail ~20:23）**之前**（FIX 收据:44 亦称 "Prior A″"）。材料事实不变：两条均 EXIT 1/1/1 · honesty_red retained · 此后无新鲜 trio 实跑 · 末次实跑 = FIX（harness:45 表述正确）。nail 阶段落库 docs 时须按 A″→FIX 顺序表述，禁止把 A″ 写成 FIX 之后的复跑。
- **C-3（口径持续）**：任何后续产物（含 nail 段）保持 `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 **OPEN 持续披露** · `techRoleFailClosedOptOutG7Only=true` 原值；禁「R1 已关 / trio 已关 / suite green / quota-403 removed ⇒ trio green」任何变体。
- **C-4（未来授权跑纪律）**：逐 attempt 记录（含失败 EXIT+时间戳）；禁只留绿 attempt、禁循环重跑至绿、禁把 EXIT=1 洗成 flake。
- **C-5（格式，非阻断）**：harness:125 §6 L2 行单元格内含未转义 `|`（「nail 阶段 SSOT 登记 | 另行授权」）致 Markdown 表列错位；docs 执行阶段修正排版，不改语义。
- **C-6（base tip 漂移备案）**：origin tip 已由 `320c07b` 前移至 `a66e1d1`；`0345315` 祖先关系已核实；`package.json`/`scripts/` 在两 tip 间零 diff，wiring 引用不失效；后续引用以 fetch 后实况为准。

## 中文三行摘要

1. trio 三条 CMD OPEN 1/1/1 现状钉与收据逐字对上：末次实跑 2026-09-17 FIX（prove `a4e3de5` / dual tip `5f591ea`），`e2e:ui:isolated` 末次 EXIT=1 · 10P/2F/10S 如实呈现，无历史绿/部分绿洗现状绿。
2. Disclosure-1「`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 仅 G7、never counts toward R1」与 backlog:128/:181、checklist:450/:492、FreeTierOnly 收据原文一致；`r1Closed=false`、`g7SuiteGreen=false`、Pins 原值全保持；SSOT 零触碰、Ban live 贯穿、token 映射不改码。
3. 两处非阻断瑕疵（stub「此后 A″」时序措辞、harness §6 表格管道符）登记 Conditions C-2/C-5；本 PASS = docs gate 半签，alone ≠ dual，待 `mw-e2e-ha` 独立同审 + 协调方另行授权，Dual PASS ≠ coding ≠ nail。

Verdict: PASS
