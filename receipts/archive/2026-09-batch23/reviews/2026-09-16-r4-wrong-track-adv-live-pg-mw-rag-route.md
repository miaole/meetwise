# Review — R4 **wrong_track=0 ADV · LIVE_PG**（执行前验收门 · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT；本审只读 · **零 coding · 零 prove**）  
**结论**：**pass**（限：L1–L8 验收门文档够格；**unit ADV ≠ LIVE_PG**；**LIVE_PG_GAP 仍开**；本刀正确不 coding/prove）  
**硬钉**：**≠ R4 关** · **≠ covered** · **≠ 题域已隔离** · **ADV honesty dual ≠ LIVE_PG closed** · **releaseEvidence=false** · **≠HA** · **通过前禁 coding/prove**  
**配对**：mw-e2e-ha · HEAD `639134f`

覆盖 REQUEST：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md`  
对照：`harness/r4-wrong-track-adv-live-pg.md` · eval/slice · 父轨 §6g · status §11 · 前序 ADV post-prove（honesty only）

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | L1–L8 是否诚实：live Worker+PG full-path，且不能被 unit+map dual 覆盖？ | **是**。 |
| 2 | 本刀无 coding / 无 prove？ | **同意**。CMD=`not_run:pre_dual`。 |
| 3 | NHP-R4-ADV-01 仍 partial；本刀 dual 不自动升 covered？ | **同意**。 |
| 4 | 保留 G-R2-5 / recheck fail-closed / 禁 P-FAKEPLAN？ | **同意**。 |
| 5 | R4 仍 NOT closed；将来 LIVE_PG 绿仍 ≠ R4 全家关？ | **同意**。 |
| 6 | ADV post_prove_dual_pass（honesty）/ unit EXIT=0 ≠ LIVE_PG_GAP 已关？ | **同意**。 |
| 7 | 本刀 dual 本身不授权 coding（须 separate authorize）？ | **同意**。 |
| 8 | G7 draft ≠ 本刀成功？ | **同意**。 |
| 9 | releaseEvidence=false；禁 flip/DELETE/HA？ | **同意**。 |

## 批准范围

**批**：LIVE_PG 验收门文档；unit ADV ≠ LIVE_PG 硬钉；零 coding/prove；LIVE_PG_GAP 仍开诚实。  

**不批**：LIVE_PG prove 绿关、covered、R4 关、LIVE_PG_GAP 已关、本 dual 自动 authorize coding、HA、`releaseEvidence=true`。

## 非宣称

禁止：R4 closed、题域已隔离、covered、LIVE_PG_GAP 已关、ADV honesty = full live Worker+PG、rag04 冒充 LIVE_PG、HA、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md`
- HEAD：`639134f`
