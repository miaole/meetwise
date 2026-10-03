# Harness — G7 · **trio / Disclosure-1 / TECH_ROLE=0 ≠ R1 honesty**（Line L · docs-only REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（docs 执行阶段完成 · awaiting post-prove dual · **not a pass** · **≠ suite close** · L0 docs only · **zero coding** · **zero prove** · **Ban live** · **Ban自批 pass** · Dual PASS ≠ coding ≠ authorize prove ≠ suite green ≠ residual closed）  
**Date**: 2026-10-03
**Line**: **L**（G7 遗留 honesty · trio 历史 OPEN + Disclosure-1 + TECH_ROLE=0 ≠ R1 · **不得**触碰其他 Line 的文件 · **本阶段不改共享 SSOT 行** · 新钉 **仅**登记本刀 docs）
**Base tip**: `320c07b` / `320c07bff1bdad9952a10acdfdcfb873cab8f3e0`（origin `feat/mysql-schema-skeleton`）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-l`（branch `line/l-g7-honesty`）
**releaseEvidence=false** · **haStatus=NOT_HA** · **claimProductionHA=false** · **g7SuiteGreen=false** · **r1Closed=false** · **≠ suite green** · **≠ fixed** · **Ban假绿** · **禁假绿 suite 声明** · **EXIT 1/1/1 retained until fresh evidence**
**Pins（原值全抄）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained extra pins**: `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · `nail=false` · `actualSpendCny=null`
**Experts（dual）**: **`mw-model-op` + `mw-e2e-ha`**（pre-exec dual · Ban self-approve · Ban implementer writing pass）
**Authority**: meetwise — L0 docs REQUEST only · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · Ban force-push · Ban push · Ban live（真实模型 API 调用零次）

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | docs-only REQUEST：把 G7 冻结 trio 的历史 OPEN 现状 + Disclosure-1 + 「TECH_ROLE=0 ≠ R1」口径钉进 docs，并**离线整理**既有收据索引（零新跑、零新证据） |
| **本刀不是什么** | **不是** trio re-run · **不是** prove · **不是** suite green 声明 · **不是** fixed · **不是** SSOT nail · **不是** 把历史 EXIT=1 洗成绿 |
| 本刀跑 trio？ | **Ban** — `not_run:no_coding_authorize` · 历史 EXIT **1/1/1** retained |
| 本刀调用真实模型 API？ | **Ban live** — 零 fetch / 零 chat / 零 embed / 零 ASR / 零 TTS · 不加载 Key · 不跑 NEW_SHELL_STATUS probe |
| offline proves EXIT=0（`b1d7b22` 等）⇒ trio 绿？ | **Ban** — offline 单元 prove ≠ trio CMD+EXIT ≠ suite green |
| quota-403 removed（FR3 residual CLOSED）⇒ trio 绿？ | **Ban** — 「Residual FreeTier quota gap **CLOSED** (quota-403 removed only) is not suite green」（G7 FR3 nail 原文） |
| Line C 单次 settled chat call（`post_live_dual_pass`）⇒ trio covered？ | **Ban** — Line C live nail 原文「Trio not_re_run, historical exit 1, stay OPEN」 |
| 本刀改 SSOT 行？ | **Ban**（本阶段）— SSOT 行（backlog G7 段 / checklist G7 段 / 覆盖矩阵）**仅**在 nail 阶段经协调方另行授权才改 |
| retry-to-green？ | **Ban** — 未来任何授权跑须逐 attempt 记录（含失败），禁只留绿 attempt、禁循环重跑至绿 |

---

## 1. 冻结 trio（G7）· 逐一现状 · 为何 OPEN

**Wiring（`package.json` 实存，只读核对；行号钉定 base **`320c07b`** = **`0345315`**（两 tip 同值）；origin tip 后移（`0cf8591` · `8dde8e3`）scripts 块实测漂移 +2 行 → `:240/:241/:242/:243/:246`，引用行号一律附 @SHA）**：

| CMD | package.json（@`320c07b` / @`0345315`） | 解析链 |
|-----|--------------|--------|
| `pnpm e2e:isolated` | `:240` @`320c07b`/`0345315` | `node scripts/run-e2e-isolated.mjs e2e:prove` → `e2e:prove`（`:238`）= `node scripts/run-e2e.mjs` |
| `pnpm e2e:ui:isolated` | `:241` @`320c07b`/`0345315` | `node scripts/run-e2e-isolated.mjs e2e:ui` → `e2e:ui`（`:239`）= `node scripts/run-e2e-ui.mjs` |
| `pnpm verify:e2e-performance` | `:244` @`320c07b`/`0345315` | `node scripts/run-e2e-performance-suite.mjs` |

**逐一现状（为何 OPEN）**：

| # | CMD | 历史 EXIT | 缺什么（收据 / 环境 / 纪律） |
|---|-----|-----------|------------------------------|
| 1 | `pnpm e2e:isolated` | **1** | ① 缺 **quota-403 移除后**（`b1d7b22` 及以后）在已提交 SHA 上的新鲜 CMD+EXIT 收据——最后一次 trio 实跑为 2026-09-17 FIX（prove `a4e3de5` · tip `5f591ea`）EXIT=1；② 缺 live provider 环境闭环：Key **set** 时仍曾 403 `AllocationQuota.FreeTierOnly` → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api`；③ 夹具面 BUG-E2E-ISO 仍 open：宽 isolated 历史绑 pgvector 镜像、云 serial runner 拒 migration/vector 全套（PRD-TEST-008）、夹具拆分（MySQL 关系面 / Qdrant 向量面）属 R5 阶段 3–4 未做、**G6 still OPEN**；④ 本刀 Ban live → `not_run:no_coding_authorize`（纪律性冻结，非脚本缺失）；⑤ **R5-MARKED-RED** retained |
| 2 | `pnpm e2e:ui:isolated` | **1** | ① 缺新鲜 UI CMD+EXIT 收据；末次实跑（Key set + chromium 已装）EXIT=1：**10 passed / 2 failed / 10 skipped** · recruiting-bound timeout（live 出题被同一配额挡住）· stream/golden partial；② chromium prereq 已由 CR 刀关（install/version/smoke EXIT 0/0/0）但 **chromium ran ≠ UI green**（UI′ `post_prove_dual_pass:honesty_red` retained）；③ 同 #1 的配额/夹具环境缺口；④ 本刀 Ban live → `not_run:no_coding_authorize` |
| 3 | `pnpm verify:e2e-performance` | **1** | ① 缺新鲜 perf CMD+EXIT 收据；末次 EXIT=1：**migrate PASS 后 HTTP full E2E fail**；② SLO / LOAD / HA 证据缺（**≠ SLO ≠ LOAD ≠ HA ≠ suite green**；G6 OPEN）；③ 同 #1 的 provider 配额环境缺口（live 出题路径）；④ 本刀 Ban live → `not_run:no_coding_authorize` |

**Trio 汇总口径（SSOT 现行）**：
- G7 FR3 nail（2026-10-02）：**「Trio OPEN 1/1/1」** · `g7SuiteGreen=false` · R1 OPEN。
- Line C live nail（2026-10-02）：**「Trio not_re_run, historical exit 1, stay OPEN」**（`pnpm e2e:isolated` · `pnpm e2e:ui:isolated` · `pnpm verify:e2e-performance`）。
- 收据 token `g7_hard_disabled` 是 **mapped not_run label**；运行时抛的是 `g7_path_disabled:<capability>`。两者都**不是 pass**。行为已 fail-closed；**Do not change code**。

---

## 2. Disclosure-1 与「TECH_ROLE=0 ≠ R1」口径钉

**Disclosure-1（SSOT receipt 原文口径）**：G7 e2e `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` — **non-production role path; never counts toward R1**。对应 retained pin `techRoleFailClosedOptOutG7Only=true`（opt-out **仅限 G7 e2e**）。

**现行事实钉**：
- R1 **STILL OPEN**（`r1-real-close-ssot-flip` 刀：SSOT NOT flipped · **R1 STILL OPEN** · Ban 假关）；G7 FR3 / Line C live 两枚 2026-10-02 nail 同口径「R1 **OPEN** · TECH_ROLE=0 is not R1」。
- Line C live receipt 记录该 run `MEETWISE_TECH_ROLE_FAIL_CLOSED` **unset**。
- `r1Closed=false` retained。

**禁叙事清单（任何 artefact / commit message / 汇报）**：
1. **Ban**「TECH_ROLE=0 / fail-closed opt-out ⇒ R1 closed / R1 已满足 / fail-closed 已在生产生效」。
2. **Ban**「G7 e2e 绿 ⇒ 生产 role path 已 fail-closed」——opt-out 是 **G7-only** 披露项，不是 R1 证据。
3. **Ban** 把 Disclosure-1 当**缺陷修复**或**已关闭**叙述——Disclosure-1 是 **OPEN 的披露口径**，须持续披露。
4. **Ban** 抹掉 Disclosure-1、或把 `techRoleFailClosedOptOutG7Only=true` 改写/隐去。
5. **Ban** 跨口径引用：offline prove EXIT=0 / Line C 单 call EXIT=0 / CR chromium EXIT=0 **任一都不得**写成 trio EXIT=0 或 R1 / G6 / R5 / HA / suite green 证据。
6. **Ban** 把 trio 历史 EXIT=1 重述为 flake / 环境偶发 / 已解决（无新鲜 CMD+EXIT 证据前）。

---

## 3. 本刀产出范围（docs 对齐 + 离线收据整理）

**授权范围内（本 REQUEST 被 dual PASS 后、经协调方授权执行）**：
1. 本 harness + slice 两文件随 REQUEST 一并落库（docs 状态钉，不改共享 SSOT）。
2. **离线收据整理** = 对既有收据做索引对齐（§5 表），零新跑、零新证据、零改写历史收据内容。
3. nail 阶段（**另行授权后**）才允许把本刀口径登记进共享 SSOT（backlog G7 段 / checklist G7 段）；登记为 **additive 新段**，不改写既有 G7 FR3 / Line C live 段落（「G7 FR3 nail section from `210f4c0` … stay as written」惯例）。
4. `g7SuiteGreen=false` 保持——任何产物不得写 true / 不得删该钉。

**范围外（本刀全部禁）**：trio re-run · 任何 prove 执行 · 任何 live 模型调用 · 改 runner/proof/产品代码 · 改 `package.json` · 翻 covered / coveredCount · 翻 UC-018 / UC-052 / UC-004 等任何行 · 开 DELETE · 宣称 HA / 0 BUG / `releaseEvidence=true` · invent Key / invent spend。

---

## 4. Bans（硬禁令 · 全程）

- **Ban live**：禁真实模型 API 调用（chat/embed/rerank/asr/tts/stream 全族）；禁加载 Key；禁读 `.env*`；fingerprint 也不计算（本刀无 Key 动作）。
- **Ban prove 执行**：`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` 及一切 `*:prove` 均不跑；status 标 `not_run:no_coding_authorize`。
- **禁假绿**：EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ 0 BUG ≠ R1/R4 closed；not_run ≠ pass；`g7_hard_disabled` ≠ pass；honesty/dual PASS ≠ verification success。
- **禁改 SSOT 行**（本阶段）：backlog / checklist / 覆盖矩阵 / north-star 行零触碰——nail 阶段才改，且须协调方另行授权。
- **禁 retry-to-green**：任何未来授权跑须逐 attempt 记录（含失败 attempt 与其 EXIT / 时间戳）；禁只留绿 attempt、禁循环重跑至绿、禁把 EXIT=1 洗成 flake。
- **Ban self-approve**：实现方不自批；dual = `mw-model-op` + `mw-e2e-ha` 两专家各自独立新文件；**alone ≠ dual**。
- **Ban push / force-push**；git 写操作仅限本 worktree 本 commit。
- **Ban cross-model evidence citation**（沿用 FR3 钉）；**Ban secrets**（永不打印 Key / 永不 commit）。

---

## 5. 离线收据索引（对齐既有 · 零新证据）

| 收据 / 审据 | SHA / 路径 | 诚实读法 |
|-------------|------------|----------|
| FIX receipt（末次 trio 实跑） | `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md` · prove `a4e3de5` · dual tip `5f591ea` | EXIT **1/1/1** · 403 FreeTierOnly 叙事 · honesty_red retained |
| A″ Key×3 re-run | `receipts/2026-09-17-g7-key-x3-rerun.md` · dual `e697c81` | EXIT **1/1/1** honesty_red retained |
| FreeTierOnly SSOT receipt（fix-round2） | `receipts/g7-key-x3-freetieronly-reprove/2026-09-23-line-c-step3-g7-freetier-live-receipt.md` + `.json` · code tip **`b1d7b22`** | `offlineProvesAtCodeSha=b1d7b22` only · trio OPEN 1/1/1 · **Disclosure-1** 原文 · `g7SuiteGreen=false` · 收据 commit ≠ prove SHA |
| FR3 re-review（model-op） | `reviews/2026-10-02-g7-key-x3-freetieronly-fixround3-mw-model-op.md` | offline proves @ `b1d7b22` EXIT 0（单元 prove）· **trio / R1 / nail 仍 OPEN** |
| FR3 re-review REQUEST（e2e-ha） | `reviews/REQUEST-2026-10-02-g7-key-x3-fix-round3-re-review-mw-e2e-ha.md` | 同口径 |
| Line C live receipt（chat-only） | `receipts/g7-linec-live-2026-10-02/2026-10-02-line-c-chat-live-receipt.md` | 1 settled call EXIT 0 · **trio not_re_run · historical exit 1 · stay OPEN** · `MEETWISE_TECH_ROLE_FAIL_CLOSED` unset this run |
| Line C post-live 双 nail | `reviews/2026-10-02-g7-linec-post-live-mw-model-op.md` · `reviews/REQUEST-2026-10-02-g7-post-live-mw-e2e-ha.md` | `post_live_dual_pass` · not a suite close · Disclosure-1 OPEN |
| Chromium prereq（CR） | `g7-chromium-ui-runner-prereq.slice.md` · dual `2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-*` | install/version/smoke 0/0/0 · **≠ UI green** · Live UI `not_run:this_knife` |
| UI′ honesty_red | `g7-ui-live-rerun-after-chromium.slice.md` | Key set + chromium ran · EXIT=1 · honesty_red retained |
| BUG-E2E-ISO（backlog） | `gap-bug-backlog.md` B 区 | 宽 isolated/perf 夹具面 gap · G6 still OPEN · cite ≠ G6 closed ≠ R5 retired ≠ family green |

> 注：上表仅**索引**，不新增、不改写、不重释任何历史收据；`evidenceOfRecord=false` 惯例不变。

---

## 6. Lifecycle

| Phase | Gate | 本刀 |
|-------|------|------|
| **L0** | REQUEST pair open（harness + slice + 双 stub）· `draft:awaiting_pre_exec_dual` | **done**（REQUEST `56d9b3d`；tree-identical mirror `0345315`） |
| **L1** | Pre-exec dual `mw-model-op` + `mw-e2e-ha` | **BOTH PASS**（mw-model-op @`b8dfb62` + mw-e2e-ha @`a474ca4`） |
| **L2** | 协调方授权 docs/coding（nail 阶段 SSOT 登记 · 另行授权） | **executed**（standing authorize · 本执行 commit · 零跑 · 零 live） |
| **L3** | 执行 docs 对齐 + 离线收据整理（零跑、零 live） | **executed**（产物：`harness/g7-trio-current-state-alignment.md` · `harness/g7-trio-offline-receipt-index-alignment.md`） |
| **L4** | Docs dual（两专家新文件） | **awaiting post-prove dual**（不自批） |
| **Trio** | 冻结 trio | **OPEN 1/1/1 retained** · `not_run:no_coding_authorize` |

---

## 7. Pins（must survive）

1. `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`
2. `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
3. `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · `nail=false` · `actualSpendCny=null`（No invented spend）
4. Trio **OPEN 1/1/1** retained until fresh CMD+EXIT @ committed SHA · `not_run:no_coding_authorize`
5. Disclosure-1 **OPEN**（持续披露）· **TECH_ROLE=0 ≠ R1** · R1 **OPEN**
6. Dual PASS ≠ coding ≠ 已修好 ≠ suite green ≠ trio green
7. Ban live · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · Ban force-push · Ban push
8. Ban 改共享 SSOT（本阶段）· Ban cross-model cite · Ban retry-to-green · Ban self-approve

---

## 8. Non-claims

Not suite green · not trio green · not family green · not fixed · not R1 closed · not TECH_ROLE closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not coding authorized · not prove run · not live run · not SSOT edited · Dual PASS ≠ coding · EXIT 1/1/1 retained · Disclosure-1 OPEN · `g7SuiteGreen=false`

---

*Harness · G7 trio/disclosure/TECH_ROLE honesty · Line L · 2026-10-03 · executed:awaiting_post_prove_dual（docs 执行阶段完成 · not a pass）· dual mw-model-op@`b8dfb62`+mw-e2e-ha@`a474ca4` PASS · trio OPEN 1/1/1 retained · Ban live · 禁假绿 · g7SuiteGreen=false · Disclosure-1 OPEN · TECH_ROLE=0 ≠ R1 · releaseEvidence=false · zero coding · zero prove*
