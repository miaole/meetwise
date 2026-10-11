# RECHECK Review — NHP Batch3 FAULT/BOUND（措辞修 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT；本审只读 · **零 prove**）  
**结论**：**pass**（限：前序 **changes_requested** 之 FAULT/矩阵「无接线」陈旧钉 **已闭合**；RAG 子集可随 Batch3 进入「谈执行」议程）  
**硬钉**：**双审前仍禁 prove** · **≠ covered** · **≠ R4 关** · **≠ wrong_track=0** · **≠ ADV covered** · **releaseEvidence=false** · **≠HA** · **本刀不改 wire** · **无 model-op**  
**配对**：mw-e2e-ha · HEAD `639134f`

覆盖 RECHECK REQUEST：`REQUEST-2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md`  
前序阻塞：`2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`（**changes_requested**）

## 专家确认

| # | 问 | 答 |
|---|----|----|
| 1 | 措辞阻塞是否已闭合？ | **是**。harness/eval/slice/矩阵/原 REQUEST 已去「生产路径无接线」；FAULT = **FLIPPED** 读法。 |
| 2 | FAULT EXIT=0 = FLIPPED（≥1）· 仍 ≠ R4 / ≠ wrong_track=0 / ≠ ADV · seam only？ | **接受**。 |
| 3 | 双审前禁 prove；不改 wire；无 model-op；releaseEvidence=false？ | **仍同意**。 |
| 4 | NHP-R4-NEG-01（g-r2-5）fail-closed ≠ R4 closed？ | **仍可接受**。 |

## 核验摘要

| 文件 | 裁定 |
|------|------|
| harness §1 FAULT 行 / §3 / 假绿表 | FLIPPED；禁「无接线」假读 |
| eval / slice | 同步 |
| 矩阵 §1.5 NHP-R4-FAULT-01 | FLIPPED CALL_SITES≥1；仍 ≠ R4/wrong_track/ADV |
| 陈旧「生产路径无」短语 | **未见**（仅 checklist 声明禁该钉） |

## 批准范围

**批**：措辞阻塞闭合；RAG 子集（R4-NEG-01 + R4-FAULT-01 FLIPPED honesty）可谈 dual / 谈执行（仍须双域 + exec authorize 才可跑 CMD）。  

**不批**：本 RECHECK 自动开跑 prove、covered、R4 关、wrong_track=0、ADV covered、HA、`releaseEvidence=true`。

## 非宣称

禁止：R4 closed、wrong_track=0、ADV covered、covered、HA、本刀已 prove、实现方自批、FLIPPED = R4 关。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md`
- 前序：`2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`（changes_requested → **本 RECHECK 闭合**）
- HEAD：`639134f`
