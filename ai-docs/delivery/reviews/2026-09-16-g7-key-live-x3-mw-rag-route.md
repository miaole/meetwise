# Review — G7-A′ · **live Key×3** hard-run prep（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~23:23 PT）  
**结论**：**pass**（限：执行前文档闸 · live Key×3 **planning**；**≠ family/suite green** · **≠ sole cutover** · **≠ R5 retired** · **≠ G6 closed** · **≠ live already authorized**）  
**硬钉**：**Key present ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA** · **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed** · **R5 green-risk / sole ≠ retired / G6 OPEN retained** · **`releaseEvidence=false`** · **≠HA** · **dual pass ⇒ may execute；then post-prove dual** · **禁 invent/paste Key · 禁读 `.env*`** · **禁实现方自批**  
**配对**：mw-e2e-ha · HEAD `639134f` · 刀状态 `REQUEST-ready / not_run:pre_dual`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-key-live-x3-mw-rag-route.md`  
对照：`harness/g7-key-live-x3.md` · `g7-key-live-x3.slice.md` · `eval/g7-key-live-x3.eval.md` · Prior A `harness/g7-key-blocked-x3-honesty.md`（unset-era · **`post_change_dual_pass`** · live path superseded only）· `harness/g6-e2e-iso-blocked.md` · root `package.json` trio scripts

**本审动作**：零 live e2e · 零 sole flip · 零 DELETE · 零 invent/paste Key · 未读 `.env*` · 零 commit secrets · 零 coding。壳 name-only：`MODEL_API_KEY=unset`（≠ invent；parent assert ≠ 本壳探针）。

## 专家问答（REQUEST Q1–Q4）

| # | 问 | 答 |
|---|----|----|
| **1** | Agree live Key×3 plan must retain **R5 green-risk / sole ≠ retired / G6 OPEN** pins even if Key present？ | **同意（硬钉）。** Key 仅解锁 authorize **规划/执行闸**；默认 isolation 仍 **pgvector-legacy** → 日后 EXIT=0 仍是 **R5 green-risk ≠ sole-stack ≠ R5 retired**。G6 / BUG-E2E-ISO **仍 OPEN** until sole-stack full re-run + inventory review。本刀 **不**关 G6、**不**宣布 sole cutover。 |
| **2** | Agree **Key present ≠ auto green ≠ covered ≠ SLO/LOAD ≠ HA** and **EXIT=0 ≠ suite green ≠ R2/R4/G6 closed**？ | **同意。** 与 harness L3/L4 · eval 硬钉 · slice hard pins 一致。`verify:e2e-performance` 日后 EXIT=0 仍嵌入 mark-red / R5 leaves → **≠** RAG migrated · **≠** SLO/LOAD/HA · **≠** suite green。R2/R4 **仍开**；live trio ≠ domain isolation closed。 |
| **3** | Agree dual before execute；post-prove dual after run；no invent Key / no read `.env*` / `not_run:pre_dual` now？ | **同意。** Gate：pre-exec dual pass ⇒ **may** execute（另需 meetwise authorize）· then **post-prove dual**。今三 CMD 全 **`not_run:pre_dual`**。禁 invent/paste Key、禁读 `.env*`、禁伪造收据。本审未跑 live。 |
| **4** | Agree supersedes/unblocks **live path** of A without rewriting A unset honesty as green？ | **同意。** A′ 仅 supersedes/unblocks **live path planning**；A `post_change_dual_pass` unset-era honesty **保留**；**禁止**把 A rewrite 为 green / 删除 A。 |

## 核验摘要（RAG / sole / R5）

| 项 | 本审读 |
|----|--------|
| `pnpm e2e:isolated` | package.json exact · **`not_run:pre_dual`** · Key required later · default pgvector → **R5 green-risk** · ≠ G6 closed |
| `pnpm e2e:ui:isolated` | exact · **`not_run:pre_dual`** · ≠ UI covered alone · same R5 risk |
| `pnpm verify:e2e-performance` | exact · **`not_run:pre_dual`** · EXIT=0 later ≠ SLO ≠ LOAD ≠ HA ≠ suite green · mark-red/R5 leaves retained |
| Key present | **≠ auto green ≠ covered ≠ sole cutover ≠ R5 retired** |
| G6 / BUG-E2E-ISO | **仍 OPEN** — 本刀不关 |
| Sole / R5 | **sole ≠ retired** · R5 green-risk **retained** even after dual+authorize live |
| R2 / R4 | **仍开** · live trio ≠ 题域已隔离 |
| Prior A | unset-era honesty **retained** · live path **superseded by A′ only** |
| `releaseEvidence` | **false** |

## NHP（RAG 强调列）

| Col | Pin |
|-----|-----|
| PARTIAL | HTTP green + UI red（或反向）≠ family covered |
| R5 | pgvector EXIT=0 → **green-risk ≠ sole / ≠ G6 closed** |
| G6 | Key live ≠ G6 closed |
| PERF/LOAD | suite EXIT=0 ≠ SLO ≠ LOAD ≠ HA |
| FAULT | invent/paste Key / read `.env*` / commit secrets = forbid |
| ADV | self-approve dual / forge receipts / rewrite A green = forbid |

## 批准范围

**批**：live Key×3 **pre-exec planning** 文档闸；frozen trio 名；`not_run:pre_dual`；R5/sole/G6/R2/R4 硬钉保留；NHP 必登；gate dual→may execute→post-prove；A unset honesty retained；`releaseEvidence=false`。

**不批**：family/suite green、covered、sole cutover、R5 retired、G6 closed、R2/R4 closed、SLO/LOAD/HA、`releaseEvidence=true`、invent/paste Key、跳过 post-prove、实现方自批、把 A rewrite 为 green、本 dual = live 已执行授权（仍须 meetwise execute authorize）。

## 仍开

- 三 CMD **`not_run:pre_dual`**（本 prep 零 live）  
- **G6 / BUG-E2E-ISO 仍 OPEN**  
- 默认 legacy → **R5 green-risk**（直至 sole∩scor 主轨落地）  
- R2/R4 **仍开** · sole ≠ retired  
- Live execute 仍待 **meetwise authorize**（即便 dual pass）  
- Post-prove dual **await after run**

## 非宣称

禁止：auto green、covered、family/suite green、G6 closed、R5 retired、sole cutover、R4/题域已隔离、SLO/LOAD/HA、`releaseEvidence=true`、invent Key、本 dual 代替 execute authorize、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-key-live-x3-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-key-live-x3-mw-rag-route.md`
- 对照：`harness/g7-key-live-x3.md` · `g7-key-live-x3.slice.md` · `eval/g7-key-live-x3.eval.md` · `harness/g7-key-blocked-x3-honesty.md` · `package.json` trio
- HEAD：`639134f`
- 本审：**零 live e2e · 零 coding · 零 invent/paste Key · 未读 `.env*`** · releaseEvidence=false · ≠HA · ≠ sole cutover · G6 OPEN

*Review · mw-rag-route · G7-A′ live Key×3 · 2026-09-16 ~23:23 PT · pre-exec **pass** · not_run:pre_dual · releaseEvidence=false · ≠HA · R5 green-risk retained · supersedes live path of A · A unset honesty retained*
