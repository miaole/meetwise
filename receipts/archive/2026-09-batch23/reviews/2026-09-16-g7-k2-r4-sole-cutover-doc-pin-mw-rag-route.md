# Review — G7-K2 · R4 domain-isolation **sole-cutover doc pin**（mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（~19:45 PT）  
**结论**：**pass**（限：status SSOT 需显式 **≠ sole cutover** 钉对齐 prove；**≠ 批 coding/prove** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ sole cutover done**）  
**硬钉**：**≠R4关** · **≠题域已隔离** · **≠suite绿** · **releaseEvidence=false** · **≠HA** · **通过前禁 coding/prove**  
**配对**：mw-e2e-ha · HEAD `639134f` · 刀状态 `REQUEST-ready / not_run:pre_dual`

覆盖 REQUEST：`REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-rag-route.md`  
对照：`harness/g7-k2-r4-sole-cutover-doc-pin.md` · `harness/r4-domain-isolation-status.md` · `harness/r4-domain-isolation.md` · `receipts/2026-09-16-g7-full-suite-run.md` · `scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs` · G7 log `mysql_r4_domain.log`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | status SSOT 是否需显式 **≠ sole cutover** 钉以匹配 prove 诚实？ | **是**。G7 log：`FAIL status: must pin ≠ sole cutover`；`PASS harness evidence: pins ≠ sole cutover`。status 现有 `≠ cutover` **不足** prove 字串；docs pin 对齐必要。 |
| 2 | 加该钉是否 **禁止** 读成 sole cutover 已完成 / R4 关 / 题域已隔离？ | **禁止该读法**。钉 = 诚实否定；与「题域隔离 NOT closed」共存；**≠** cutover done。 |
| 3 | dual 后是否仍保持 **wrong_track=0 / ADV / LIVE_PG_GAP** 开？ | **是**。本刀仅 status/doc pin；wire/ADV/LIVE_PG 正交仍开（ADV partial ≠ covered）。 |
| 4 | Docs-first；`not_run:pre_dual`；禁自批；`releaseEvidence=false`？ | **同意**。本审零 prove · 零 coding；scor-00/R5 夹具债 **不在本刀**（见 sole∩scor 主轨）。 |

## 核验摘要（RAG / 域隔离）

| 项 | 裁定 |
|----|------|
| G7 收据 | `mysql-stack:r4-domain-isolation:prove` EXIT=1 = doc pin drift · ≠ 题域已隔离 |
| Status | `≠ cutover` 在；**缺**精确 `≠ sole cutover` → prove FAIL |
| Harness evidence | 已钉 `≠ sole cutover`（与 status 漂移一致） |
| 正交仍开 | wrong_track=0 ADV ≠ covered；LIVE_PG_GAP；REAL-WIRE ≠ R4 关 |
| 与 MAIN 刀 | scor/R5 fixture **out of scope**（S5）— 正确隔离 |

## 批准范围

**批**：sole-cutover **doc pin** 对齐路径；R4/题域仍开；ADV/LIVE_PG 仍开；CMD 冻结。  

**不批**：宣称 sole cutover / R4 / 题域已隔离、weaken prove、wire ADV、flip default、suite green、HA、自批、coding/prove 本 prep。

## 仍开

- R4 / **题域隔离 NOT closed**  
- wrong_track=0 **≠ covered**；ADV partial；**LIVE_PG_GAP**  
- G7 r4-domain nonzero **保留**直至 authorize+status pin  
- scor-00 / R5 green-risk（主轨另刀）

## 非宣称

禁止：R4 closed、题域已隔离、sole cutover done、wrong_track=0 covered、ADV covered、suite green、HA、`releaseEvidence=true`、本 dual 授权 prove/coding、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-g7-k2-r4-sole-cutover-doc-pin-mw-rag-route.md`
- 对照：`harness/g7-k2-r4-sole-cutover-doc-pin.md` · `harness/r4-domain-isolation-status.md` · `receipts/2026-09-16-g7-full-suite-run.md`
- HEAD：`639134f`
- 本审：**零 prove · 零 coding** · releaseEvidence=false · ≠HA
