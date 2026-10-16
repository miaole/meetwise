# Slice — NHP Batch2 · 第二批 NEG/FAULT/BOUND（**post_prove_dual_pass** · honesty only）

**状态**：**`post_prove_dual_pass`** · 7× CMD **已跑**新鲜 EXIT · pre-exec dual 已 pass · post-prove 双独立审均 **pass** · **仅 honesty/partial** · **仍 ≠ covered**  
**日期**：2026-09-16（~08:05 PT · post-prove 双审回执）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ R2/R4 closed** · **≠ planner leaf** · **≠ PERF SLO**  
**前置已齐**：硬闸文档闸生效 · 矩阵双域文档闸 pass · Batch1 = **post_prove_dual_pass**（≠ 本批抬升）· 本批 **pre-exec dual pass** + **exec authorize** · post-prove 双独立审均 **pass** · **实现方禁止自批 pass**

---

## 产物

| 角色 | 路径 |
|------|------|
| 本切片索引 | `ai-docs/delivery/nhp-batch2-neg-fault.slice.md` |
| Harness | `ai-docs/delivery/harness/nhp-batch2-neg-fault.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch2-neg-fault.eval.md` |
| REQUEST · e2e-ha（pre-exec） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md` |
| REQUEST · rag-route（pre-exec） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md` |
| Review · e2e-ha（pre-exec dual pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md` |
| Review · rag-route（pre-exec dual pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md` |
| REQUEST · e2e-ha（post-prove） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` |
| REQUEST · rag-route（post-prove） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md` |
| Review · e2e-ha（post-prove pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md` · **pass（honesty/partial only）** |
| Review · rag-route（post-prove pass） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md` · **pass（honesty only）** |
| model-op | **无**（本批无 MODEL-OP live 子集；不要并列） |
| Batch1 对照 | `nhp-batch1-neg-perf.slice.md` · **post_prove_dual_pass**（7 IDs 不重复） |

## Case IDs（7）· CMD+EXIT（~08:00 PT · HEAD `639134f`）

| Case ID | CMD | EXIT | 读法 |
|---------|-----|------|------|
| NHP-002-BOUND-01 | `pnpm uc002:lease:prove` | **0** | lease 竞态 partial ≠ 002 covered |
| NHP-010-FAULT-01 | `pnpm uc010:sse-resume:prove` | **0** | SSE/LED resume partial ≠ SLO |
| NHP-011-NEG-01 | `pnpm uc011:report-refund:http:prove` | **0** | quarantine 误退拒 ≠ refund complete |
| NHP-017-FAULT-01 | `pnpm uc017:orphan:prove` | **0** | orphan reserved→released ≠ LOAD |
| NHP-018-NEG-01 | `pnpm uc018:abandon:http:prove` | **0** | abandon 后复活拒 ≠ 018 covered |
| NHP-019-FAULT-01 | `pnpm uc019:report-regenerate:http:prove` | **0** | retry∥release 并发 ≠ covered |
| NHP-R4-BOUND-01 | `pnpm g4-production-scoped-retrieve:prove` | **0** | 主叶 scoped honesty ≠ R4 closed / ≠ planner leaf |

## 硬钉

- 实现方 **不自批** pass；post-prove reviews/ 已由两位专家独立写入并均 **pass**（仅 honesty）  
- **EXIT=0 ≠ covered**；仍是诚实钉  
- **不跑** `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA / LOAD / PERF-CLOUD  
- **不**把 Batch1 pass 或本批 EXIT=0 读成 covered / R4 closed  
- `releaseEvidence=false`

---

*Slice · NHP Batch2 · 2026-09-16 ~08:05 PT · post_prove_dual_pass（honesty only）· releaseEvidence=false · ≠HA · ≠ covered*
