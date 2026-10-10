# Review — 非happy+PERF/LOAD 矩阵（RAG/路由域 · 第二域 mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-16（PT）  
**结论**：**changes_requested（措辞阻塞）** — LOAD/R4/≠covered 整体诚实；**「R2 未接线」与现状矛盾，须改后再放行后续 prove**  
**releaseEvidence=false** · Not HA · **≠ covered** · **本审未跑任何 prove**（遵守通过前禁 prove）

覆盖 REQUEST：`REQUEST-2026-09-16-non-happy-perf-matrix-mw-rag-route.md`  
对照：`non-happy-path-perf-load-case-matrix.md` · `harness/non-happy-path-perf-load-matrix.md` · `eval/non-happy-path-perf-load-matrix.eval.md` · `e2e-requirement-coverage-matrix.md` §1.0 · R2/R4 status

## 专家复核（REQUEST 五问）

| # | 问 | 答 |
|---|----|----|
| 1 | RAG 行是否仍诚实为 gap/partial/blocked/green-risk，且 PERF/LOAD 为 blind？ | **大体是**。§1.5 / §1.0.2：NHP-R5-PERF-01=blind/green-risk；NHP-RAG-LOAD-01=blind；RAG PERF/LOAD 未填绿；**零 covered**。 |
| 2 | case-matrix §1.5 是否错误把 G-R2-5 / r2-prereq EXIT 叙事为 R2 closed？ | **否（未写成 R2 closed）**。锚点读法仍 ≠ R2/R4 关。但同行「**未接线 classify**」与当前 **classify wire 已齐** 矛盾（见阻塞项）。 |
| 3 | NHP-R4-ADV-01 是否仍钉 NOT closed？ | **是**。`gap`/`blocked`；wrong_track=0 目标未证；≠ 题域已隔离。 |
| 4 | NHP-RAG-LOAD-01 / NHP-R5-PERF-01 是否禁止用 pgvector 评测机械绿冒充容量/召回 SLO？ | **是**。明文 green-risk / `qbank-pg-eval ≠ 发布 SLO`；§2 快乐盲区表钉 R2/R5 prove 绿 ≠ 路由已生效/召回 SLO。 |
| 5 | 是否同意 RAG 相关 prove 不得在本双审前当本刀绿关复跑并回写 covered？ | **同意**。本审 **零 prove**；修完措辞并双审齐前仍禁。 |

## 结论三问

| # | 问 | 答 |
|---|----|----|
| 1 | 是否可接受为 eval-first 预执行基线？ | **结构可接受，措辞未齐前不放行**。列合同（NEG/FAULT/ADV/PERF/LOAD）、case-only≠执行、禁 covered、禁本刀绿关 — 方向正确。 |
| 2 | 阻塞项 / 假绿措辞？ | **有（诚实性，非假绿关闸）** 见下。无「covered / R2 closed / 题域已隔离」假绿；有 **过时「R2 未接线」**。 |
| 3 | 是否必须并列 `mw-model-op` 才放行后续 prove？ | **矩阵文档本刀：否**（配对 `mw-e2e-ha` 即可）。后续若 prove 子集碰 MODEL-OP binding / Key-unset，再并列 model-op。 |

## 阻塞项（须改后才可 pass 放行 prove）

将下列「**R2 未接线**」类措辞改为与 status 一致的诚实句，例如：  
**「R2 生产闭环 wire 已齐（P-MODEL…P-START dual-passed；P-FAKE pending dual）；R2 overall 仍 NOT closed（≠ 路由已生效 / harness gates）」**。

| 位置 | 现状问题 | 建议 |
|------|----------|------|
| `non-happy-path-perf-load-case-matrix.md` §1.5 `NHP-R2-NEG-01` | 场景写「未接线 classify」 | 改为：未决/无 binding → `interview_ineligible_route`；缺 snapshot → retrieve fail-closed（G-R2-5）；**≠** classify 未接线 |
| `e2e-requirement-coverage-matrix.md` §1.0.1 GAP-RAG-01…05 读法 | 「R2 未接线」 | 改为 overall NOT closed / ≠ 路由已生效；R4 NOT closed |
| `eval/non-happy-path-perf-load-matrix.eval.md` §3 | 「R2 未接线」 | 同上 |
| `REQUEST-…-mw-rag-route.md` 对照表 | 「R2 未接线诚实」 | 改为「R2 overall NOT closed 诚实」 |

**非阻塞（已诚实）**：NHP-R4-ADV-01 NOT closed；NHP-RAG-LOAD-01 / NHP-R5-PERF-01 blind；harness §2.2 钉 r2-prereq/G-R2-5/r4 ≠ R2/R4 关；§1.6 LOAD suites case-only/blind；禁 pgvector 机械绿当容量。

## 本审纪律

- **未执行**任何 `pnpm …:prove` / e2e / 压测。  
- **禁止**用本审把任何矩阵行升 `covered`。  
- 修完措辞后：请再请本域短确认或由 meetwise-core 附 diff 回执；**然后**才允许按 harness 双审后子集 prove。

## 非宣称

禁止：covered、R2/R4/R5 关、路由已生效、题域已隔离、wrong_track=0、HA、`releaseEvidence=true`、sole cutover、本刀 prove 绿关。

## 收据

- 专家：`mw-rag-route`
- 结论文件：`ai-docs/delivery/reviews/2026-09-16-non-happy-perf-matrix-mw-rag-route.md`
- HEAD：`639134f`
