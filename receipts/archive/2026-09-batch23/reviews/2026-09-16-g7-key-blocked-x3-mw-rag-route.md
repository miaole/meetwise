# Review — G7-A · Key-blocked×3 family honesty（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:45 PT）  
**结论**：**pass**（限：3× Key-unset **blocked** 须保持诚实；**≠ family/suite green** · **≠ 批 invent Key / 硬跑 live** · **≠ sole cutover** · **≠ R5 retired**）  
**硬钉**：**≠R4关** · **≠题域已隔离** · **≠suite绿** · **releaseEvidence=false** · **≠HA** · **通过前禁 coding/prove**（本刀另禁 invent Key / 硬跑 live）  
**配对**：mw-e2e-ha · HEAD `639134f` · 刀状态 `REQUEST-ready / not_run:pre_dual`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-key-blocked-x3-mw-rag-route.md`  
对照：`harness/g7-key-blocked-x3-honesty.md` · `harness/g6-e2e-iso-blocked.md` · `harness/r5-retirement-sole-stack-status.md` · `receipts/2026-09-16-g7-full-suite-run.md` · 刀 K3（cite 另轨）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 3× blocked 在 Key unset 时是否必须保持诚实（≠ family / suite green）？ | **是**。G7：`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` 均为 **blocked**（MODEL_API_KEY unset）。禁止 narrate 为 pass / skip-as-pass / suite green。 |
| 2 | 若日后 live authorize 到来，默认 pgvector 是否仍 **R5 green-risk ≠ sole cutover**？ | **是**。默认 `E2E_ISOLATION_STACK=pgvector-legacy`；有 Key 硬跑 live **仍**是 R5 假绿面，**≠** sole 迁栈 / ≠ R5 retired。本刀 **不**授权 live 跑。 |
| 3 | dual 前禁 docs pin 改；禁 invent Key；`not_run:pre_dual`；`releaseEvidence=false`？ | **同意**。不读 `.env*`；docs pin 仅 dual+authorize 后；本审零 prove · 零 live。 |

## 核验摘要（RAG / R5）

| CMD | G7 | 诚实读 |
|-----|-----|--------|
| `pnpm e2e:isolated` | blocked | Key unset · 若跑 → pgvector → **R5 green-risk** |
| `pnpm e2e:ui:isolated` | blocked | ≠ UI covered |
| `pnpm verify:e2e-performance` | blocked | ≠ SLO / ≠ LOAD / ≠ HA |
| G6 / BUG-E2E-ISO | 仍 OPEN | 本刀 **不**关；cite 归 K3 |
| Sole allowlist | 恰 5 | scor/isolated 宽家族 **不在** allowlist |

## 批准范围

**批**：3× blocked 诚实钉；禁假绿；禁 invent Key；R5 green-risk 提醒；CMD 冻结。  

**不批**：family green、suite green、provision Key、硬跑 live、关 G6、R5 retired、sole cutover、R4/题域已隔离、HA、自批。

## 仍开

- Key unset → 三 CMD **blocked**  
- **G6 / BUG-E2E-ISO 仍 OPEN**（K3 cite 另刀）  
- 默认 legacy → **R5 green-risk**（直至 sole∩scor 主轨落地）  
- R2/R4 **仍开**

## 非宣称

禁止：family green、suite green、G6 closed、R5 retired、sole cutover、R4/题域已隔离、SLO/LOAD/HA、`releaseEvidence=true`、invent Key、本 dual 授权 live、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-key-blocked-x3-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-key-blocked-x3-mw-rag-route.md`
- 对照：`harness/g7-key-blocked-x3-honesty.md` · `receipts/2026-09-16-g7-full-suite-run.md` · `harness/r5-retirement-sole-stack-status.md`
- HEAD：`639134f`
- 本审：**零 prove · 零 coding · 零 invent Key** · releaseEvidence=false · ≠HA
