# Review — G7-K3 · `g6-e2e-iso-blocked` backlog cite honesty（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:45 PT）  
**结论**：**pass**（限：backlog **cite** `g6-e2e-iso-blocked` 对齐路径；**cite ≠ G6 关** · **≠ R5 retired** · **≠ family covered** · **≠ 批 coding/prove**）  
**硬钉**：**≠R4关** · **≠题域已隔离** · **≠suite绿** · **releaseEvidence=false** · **≠HA** · **通过前禁 coding/prove**  
**配对**：mw-e2e-ha · HEAD `639134f` · 刀状态 `REQUEST-ready / not_run:pre_dual`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-k3-g6-backlog-cite-mw-rag-route.md`  
对照：`harness/g7-k3-g6-backlog-cite.md` · `gap-bug-backlog.md` · `harness/g6-e2e-iso-blocked.md` · `scripts/g6-e2e-iso-blocked.proof.mjs` · `receipts/2026-09-16-g7-full-suite-run.md` · 前序 `reviews/2026-09-10-g6-e2e-iso-blocked-mw-rag-route.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 是否同意 BUG-E2E-ISO 行（或关联行）必须 cite `g6-e2e-iso-blocked` 且 **不**关 G6？ | **同意**。prove：`gap-bug-backlog: must cite g6-e2e-iso-blocked honesty pin`；现状 BUG-E2E-ISO 行无该字串 → G7 EXIT=1。cite 后 G6 / BUG-E2E-ISO **仍 OPEN**。 |
| 2 | cite ≠ sole-stack migrated / ≠ R5 retired / ≠ family covered？ | **同意**。cite = 诚实交叉引用；默认夹具仍 pgvector → **R5 green-risk** 仍在；Key unset → family **blocked**。 |
| 3 | Key-unset 保持 blocked；禁 invent Key；docs-first；`not_run:pre_dual`；禁自批；`releaseEvidence=false`？ | **同意**。本审零 prove · 零 coding · 不读 `.env*`。 |

## 核验摘要（RAG / R5）

| 项 | 裁定 |
|----|------|
| G7 收据 | `g6-e2e-iso-blocked:prove` EXIT=1 = cite 缺；Key-unset behavior PASS |
| backlog | BUG-E2E-ISO 在；**未**含 `g6-e2e-iso-blocked` 字串 |
| G6 harness | 仍 OPEN · blocked ≠ covered · ≠ migrated |
| 与刀 A | Key-blocked×3 互补；本刀只管 cite |
| R5 | cite **不**退役夹具；BUG-FAKE-R5 仍开 |

## 批准范围

**批**：backlog cite 对齐路径；G6 仍开；Key-unset blocked 保留；CMD 冻结。  

**不批**：关 G6/BUG-E2E-ISO、family green、invent Key、硬跑 live、R5 retired、sole cutover、suite green、HA、coding/prove 本 prep。

## 仍开

- **G6 / BUG-E2E-ISO 仍 OPEN**  
- Key unset → `e2e:isolated` / UI / perf **blocked**（刀 A）  
- R5 green-risk（默认 pgvector-legacy）  
- G7 g6 cite nonzero **保留**直至 authorize+cite

## 非宣称

禁止：G6 closed、BUG-E2E-ISO closed、family covered、R5 retired、sole cutover、R4/题域已隔离、suite green、HA、`releaseEvidence=true`、本 dual 授权 prove/coding、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-k3-g6-backlog-cite-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-k3-g6-backlog-cite-mw-rag-route.md`
- 对照：`harness/g7-k3-g6-backlog-cite.md` · `gap-bug-backlog.md` · `harness/g6-e2e-iso-blocked.md` · `receipts/2026-09-16-g7-full-suite-run.md`
- HEAD：`639134f`
- 本审：**零 prove · 零 coding** · releaseEvidence=false · ≠HA
