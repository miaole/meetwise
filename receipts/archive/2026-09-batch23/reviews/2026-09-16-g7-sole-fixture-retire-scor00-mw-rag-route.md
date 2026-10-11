# Review — G7 main-track · **sole夹具退役 ⋂ scor-00**（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:45 PT）  
**结论**：**pass**（限：升格主轨 T1–T6 从 RAG/R5 视角够格；**≠ R5 retired yet** · **≠ sole cutover** · **≠ R4/题域已隔离** · **≠ 批 coding/prove 绿翻**）  
**硬钉**：**≠R4关** · **≠题域已隔离** · **≠suite绿** · **releaseEvidence=false** · **≠HA** · **通过前禁 coding/prove**  
**配对**：mw-e2e-ha · HEAD `639134f` · 刀状态 `REQUEST-ready / not_run:pre_dual` · 原 B4 **SUPERSEDED**

覆盖 REQUEST：`REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-mw-rag-route.md`  
对照：`harness/g7-sole-fixture-retire-scor00.md` · `harness/r5-retirement-sole-stack-status.md` · `harness/g1-default-switch-prep.md` · `m5-pgvector-fixture-retirement-plan.md` · `receipts/2026-09-16-g7-full-suite-run.md` · `north-star-hard-gates.md` · 正交 K2（R4 sole-**cutover doc pin** ≠ 本夹具退役轨）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | 是否同意将 scor-00 升格并入 sole夹具退役主轨（T1–T5）？ | **同意**。G7 `scor-00:http:prove` EXIT=1（`interview_ineligible_route` on **pgvector**）= sole-fixture ∩ scor 交叉缺口，非纯产品分；与 BUG-FAKE-R5 / G1-DEFAULT-LEGACY 同面。 |
| 2 | 默认 legacy 是否在 sole default + scor sole-provable 落地前保持 **R5 green-risk**？ | **是**。`E2E_ISOLATION_STACK` 缺省仍 `pgvector-legacy`；G1 prep landed ≠ flip；T5 须保留 R5 green-risk 钉。 |
| 3 | scor 上 sole 是否可能需 allowlist/disposable 策略 dual — **本 prep 禁静默扩 allowlist**？ | **同意**。Sole allowlist **恰 5**（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant）；scor-00 **不在** list。扩面/disposable = 另 dual+authorize（WS-C）。 |
| 4 | 禁 coding/prove now；`not_run:pre_dual`；禁自批；`releaseEvidence=false`；≠ sole cutover / ≠ R4 closed？ | **同意**。本审零 prove · 零 coding 绿翻；K2 doc pin ≠ 本轨 cutover 宣称。 |

## 核验摘要（RAG / R5）

| ID | 表面 | 裁定 |
|----|------|------|
| G7-SCOR00-PG-FIXTURE | scor EXIT=1 on pgvector | **R5 green-risk** · ≠ business green |
| G1-DEFAULT-LEGACY | 默认仍 legacy；flip NOT open | prep ≠ flip |
| ALLOWLIST-BOUND | 恰 5；scor 不在 | 禁静默扩 |
| T1–T6 | 默认真栈 · 去假绿 · scor sole 可证 · nonzero 诚实关 · R5 钉 · dual 门 | 与 R5 status Main-track 指针一致 |
| 正交 | K2 = R4 status ≠ sole cutover **文案钉** | **≠** 本夹具退役执行 |

## 批准范围

**批**：主轨升格 + T1–T6 验收门文档；R5 green-risk 保留；allowlist 边界；CMD 冻结 `not_run:pre_dual`；B4 superseded 读法。  

**不批**：翻默认、扩 allowlist、weaken scor assert、宣称 R5 retired / sole cutover / R4 关 / 题域已隔离、suite green、HA、本 prep coding/prove、自批。

## 仍开

- **R5 未 retired**（直至 sole receipts + dual）  
- 默认 **pgvector-legacy** · flip NOT open  
- scor-00 **sole 可证** 未落地；G7 scor nonzero **保留**  
- Sole allowlist 恰 5（scor 外）  
- R2/R4 **仍开** · suite green **未宣称**

## 非宣称

禁止：R5 retired、sole cutover、R4 closed、题域已隔离、suite green、G7 scor 已关（无 sole 收据）、prep=flip、静默扩 allowlist、HA、0 BUG、`releaseEvidence=true`、本 dual 授权 coding/prove、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-sole-fixture-retire-scor00-mw-rag-route.md`
- 对照：`harness/g7-sole-fixture-retire-scor00.md` · `harness/r5-retirement-sole-stack-status.md` · `harness/g1-default-switch-prep.md` · `receipts/2026-09-16-g7-full-suite-run.md`
- HEAD：`639134f`
- 本审：**零 prove · 零 coding** · releaseEvidence=false · ≠HA
