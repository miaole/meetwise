# Review — R4 **wrong_track=0 ADV**（执行前验收门 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT；本审只读 · **零 coding · 零 prove**）  
**结论**：**pass**（限：A1–A8 验收门文档够格；**wire 绿 ≠ wrong_track=0 ≠ R4 关**；本刀正确不 coding/prove）  
**releaseEvidence=false** · Not HA · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-wrong-track-adv-mw-rag-route.md`  
对照：`harness/r4-wrong-track-adv.md` · eval/slice · 父轨 §6f · 矩阵 NHP-R4-ADV-01 · REAL-WIRE-IMPL（await post-prove；≠ ADV）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | A1–A8 是否诚实：wired retrieve 上对抗 wrong_track=0，且不能被 wire 绿覆盖？ | **是**。 |
| 2 | 本刀无 coding / 无 prove？ | **同意**。CMD=`not_run:pre_dual`。 |
| 3 | NEG/FAULT companions 仅登记、不升 covered？ | **同意**。 |
| 4 | 保留 G-R2-5 / recheck fail-closed / 禁 P-FAKEPLAN？ | **同意**。 |
| 5 | R4 仍 NOT closed；将来 ADV 绿仍 ≠ R4 全家关？ | **同意**（并列 P-R1/P-R2/P-META）。 |
| 6 | REAL-WIRE-IMPL EXIT=0 / CALL_SITES≥1 ≠ wrong_track=0？ | **同意**（A6）。 |
| 7 | 本刀 dual 本身不授权 coding（须 wire post-prove + separate authorize）？ | **同意**。 |
| 8 | G7 draft ≠ 本刀成功？ | **同意**。 |
| 9 | releaseEvidence=false；禁 flip/DELETE/HA？ | **同意**。 |

## 批准范围

**批**：ADV 文档闸；wire≠ADV；NHP-R4-ADV-01 仍 gap/blocked；零 coding/prove。  

**不批**：wrong_track=0 已证、ADV covered、R4 关、本 dual 自动 authorize coding、HA。

## 非宣称

禁止：wrong_track=0、题域已隔离、R4 closed、wire 已覆盖 ADV、G7 success、covered、HA、`releaseEvidence=true`、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-wrong-track-adv-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-wrong-track-adv-mw-rag-route.md`
- HEAD：`639134f`
