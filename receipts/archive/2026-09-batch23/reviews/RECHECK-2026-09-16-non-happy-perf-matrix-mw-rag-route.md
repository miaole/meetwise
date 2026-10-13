# RECHECK — 非happy+PERF/LOAD 矩阵措辞修 · mw-rag-route

**状态**：**RECHECK / 待复审**（实现方；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**对照回执**：`reviews/2026-09-16-non-happy-perf-matrix-mw-rag-route.md`（**changes_requested** · 措辞阻塞）  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2/R4 closed** · **本刀未跑 prove**

## 已修（措辞 only）

对照阻塞表，将过时「R2 未接线 / 未接线 classify」改为诚实：

- R2 **生产闭环 wire 已齐**（P-MODEL…P-START、P-FAKE dual-passed；G-R2-5 retrieve-side）
- R2 **overall 仍 NOT closed**（≠ 路由已生效；P-LIVE dual 收据齐；仍 ≠ 路由已生效；harness gates）

| 文件 | 改动摘要 |
|------|----------|
| `non-happy-path-perf-load-case-matrix.md` §1.5 `NHP-R2-NEG-01` | 场景去「未接线 classify」；改为 ineligible / G-R2-5 fail-closed；钉 ≠ classify 未接线 |
| `e2e-requirement-coverage-matrix.md` §1.0.1 GAP-RAG-01…05 | 「R2 未接线」→ wire 已齐 / overall NOT closed |
| `e2e-requirement-coverage-matrix.md` §1.4 GAP-RAG-02 | 去「有合同无生产接线；apps 零 classify」陈旧钉 |
| `eval/non-happy-path-perf-load-matrix.eval.md` §3 | 同上 |
| `REQUEST-2026-09-16-non-happy-perf-matrix-mw-rag-route.md` | 「R2 未接线诚实」→「R2 overall NOT closed 诚实」；立场段同步 |
| `m4-rag-hard-gates.md` / `harness/r4-domain-isolation*.md` | 同族陈旧「R2 未接线 / apps 零 classify」对齐 |

## 请专家确认

1. 措辞阻塞是否已闭合（可从 changes_requested → 短确认 pass）？  
2. 是否仍同意：**禁 prove** 直至本域 + `mw-e2e-ha` 双审齐且无更严冲突？  
3. 是否仍钉：≠ covered · ≠ R2/R4 关 · ≠ 路由已生效 · `releaseEvidence=false`？

## 非宣称

- 本 RECHECK **不是** pass · 不自批 · **未跑任何 prove**
