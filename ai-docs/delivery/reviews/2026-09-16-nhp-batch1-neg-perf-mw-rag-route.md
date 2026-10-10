# Review — NHP Batch1 NEG+PERF（RAG/路由子集 · 第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限：Batch1 RAG 两行纳入/排除边界诚实；**≠ 授权已跑绿** · **≠ covered** · **≠ R2/R4 关** · **≠ 路由已生效**）  
**releaseEvidence=false** · Not HA · **本审未跑任何 prove**（遵守通过前禁 prove）

覆盖 REQUEST：`REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`  
对照：`harness/nhp-batch1-neg-perf.md` · `eval/nhp-batch1-neg-perf.eval.md` · case-matrix §1.5

## 专家复核（REQUEST 五问）

| # | 问 | 答 |
|---|----|----|
| 1 | 纳入 R2 NEG+FAULT、排除 R4/R5/LOAD 是否可接受？ | **可接受**。Batch1 只冻合同钉 `NHP-R2-NEG-01` / `NHP-R2-FAULT-01`；R4 ADV/BOUND/PERF、R5 PERF、RAG-LOAD 明确 deferred，防假阳扩面。 |
| 2 | EXIT=0 是否仍钉 ≠ 路由已生效 / ≠ R2 closed？ | **是**。harness §1 读法 + §4 假绿表均钉 `r2-prereq`/`g-r2-5` 绿 ≠ 路由已生效 / R2·R4 关。 |
| 3 | 是否错误借用历史 P-LIVE / G-R2-5 dual 自动批准本批绿关？ | **否（未借用）**。REQUEST/harness 钉历史 dual ≠ 本批自动绿关；本刀 `not_run:pre_dual_review`。 |
| 4 | 是否需要并列 `mw-model-op`？ | **否（本批）**。两 CMD 为静态/合同 honesty（prereq + retrieve fail-closed）；无 MODEL-OP live classify / P-LIVE 子集。若后续扩 live Key classify，再并列。 |
| 5 | 是否同意双审前禁实现方绿关复跑并回写 covered？ | **同意**。 |

## 结论三问

| # | 问 | 答 |
|---|----|----|
| 1 | RAG 子集是否可随 Batch1 进入「谈执行」议程？ | **可以**（待本域 + `mw-e2e-ha` 双审齐且无更严冲突后，由编排授权 CMD）。 |
| 2 | 阻塞项？ | **无硬阻塞**。非 RAG 行仍须 e2e-ha；本域不单方盖章开跑全批。 |
| 3 | 双审通过前是否继续禁 prove？ | **是**。 |

## RAG 边界诚实核验

| Case | CMD（双审后） | 旗 | 读法 |
|------|---------------|----|------|
| NHP-R2-NEG-01 | `r2-classify-job-route-prereq:prove` | partial | ineligible / wire 旁证；**≠** R2 closed / ≠ 路由已生效 |
| NHP-R2-FAULT-01 | `g-r2-5-retrieve-fail-closed:prove` | partial | 缺 snapshot degraded；**≠** R2/R4 关 |
| NHP-R4-* / R5 / RAG-LOAD | — | deferred | **不在 Batch1**；禁借本批关题域/容量 |

与 case-matrix §1.5 一致：R2 wire 已齐、overall NOT closed、P-LIVE dual 收据齐仍 ≠ 路由已生效。

## 非宣称

禁止：covered、R2/R4/R5 关、路由已生效、题域已隔离、wrong_track=0、HA、`releaseEvidence=true`、LOAD/容量绿、历史 dual 自动绿关、本域单方开跑全批、实现方自批。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`
- HEAD：`639134f`
