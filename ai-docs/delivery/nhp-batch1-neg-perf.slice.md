# Slice — NHP Batch1 · 第一批 NEG+PERF（**post-prove dual pass**)

**状态**：**post_prove_dual_pass** · 7× CMD 已跑新鲜 EXIT · `mw-e2e-ha` + `mw-rag-route` **post-prove** 双独立审均 pass · **仍 ≠ covered**  
**日期**：2026-09-16（~05:00 PT）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ R2/R4 closed** · **≠ PERF SLO**  
**前置已齐**：硬闸文档闸生效 · 矩阵双域文档闸 pass · pre-exec dual pass · meetwise-core 本批执行授权 → **已跑** harness §2 CMD；**实现方禁止自批 pass**

---

## 产物

| 角色 | 路径 |
|------|------|
| 本切片索引 | `ai-docs/delivery/nhp-batch1-neg-perf.slice.md` |
| Harness | `ai-docs/delivery/harness/nhp-batch1-neg-perf.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch1-neg-perf.eval.md` |
| REQUEST · e2e-ha（pre-exec） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md` |
| REQUEST · rag-route（pre-exec） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md` |
| REQUEST · e2e-ha（**post-prove**） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md` |
| REQUEST · rag-route（**post-prove**） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md` |
| Review · e2e-ha（**post-prove pass**） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md` |
| Review · rag-route（**post-prove pass**） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md` |
| model-op | **无**（本批无 MODEL-OP 子集） |

## Case IDs（7）· CMD+EXIT（诚实）

| Case ID | CMD | EXIT | 读法 |
|---------|-----|------|------|
| NHP-001-NEG-01 | `pnpm neg:auth` | **0** | case-only auth 旁证 ≠ UC-001 covered |
| NHP-001-PERF-api-01 | `pnpm uc001:live-blocked:prove` | **0** | Key-unset blocked honesty ≠ PERF SLO |
| NHP-015-NEG-01 | `pnpm uc015:ingest-failures:prove` | **0** | partial ≠ OCR FAULT/LOAD |
| NHP-050-NEG-01 | `pnpm privacy-erasure:http:prove` | **0** | DELETE=503 pin ≠ erasure complete |
| NHP-033-NEG-01 | `pnpm uc033:cross-user-authz:prove` | **0** | partial ≠ ADV齐/PERF |
| NHP-R2-NEG-01 | `pnpm r2-classify-job-route-prereq:prove` | **0** | ≠ R2 closed / ≠ 路由已生效 |
| NHP-R2-FAULT-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | ≠ R2/R4 closed |

## 硬钉

- 实现方 **不自批** pass（post-prove reviews/ 由专家写）  
- **executed ≠ covered**；EXIT=0 诚实钉仍是诚实钉  
- **不跑** `e2e:isolated` / `verify:e2e-performance` / 云 TC / HA prove  
- **不改** R4 wire（R4-REAL-WIRE = correctly NOT wiring）  
- `releaseEvidence=false`

---

*Slice · NHP Batch1 · 2026-09-16 ~05:00 PT · post_prove_dual_pass · releaseEvidence=false · ≠HA · ≠ covered*
