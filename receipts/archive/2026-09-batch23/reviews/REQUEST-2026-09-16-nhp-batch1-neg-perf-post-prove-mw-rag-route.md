# REQUEST — NHP Batch1 NEG+PERF **post-prove**（RAG/路由子集）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~05:00 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2 closed** · **≠ R4 closed** · **≠ 路由已生效** · **≠ LOAD**  
**配对**：`REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify / P-LIVE 子集）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· pre-exec dual pass · meetwise-core 授权本批 CMD  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ R2 关）**：`2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md` · `2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md`  
**本刀**：含 RAG 两行在内的 7× CMD **已跑**；**实现方不写** pass review；请专家 **独立复跑**（至少 RAG 两 CMD）并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/harness/nhp-batch1-neg-perf.md` | Batch1 CMD/EXIT；R2 假绿禁令 |
| `delivery/eval/nhp-batch1-neg-perf.eval.md` | run-status + 延期 |
| `delivery/nhp-batch1-neg-perf.slice.md` | 切片索引 |
| `delivery/harness/r2-classify-job-route-status.md` | R2 **仍 NOT closed** |
| `delivery/harness/r4-domain-isolation-status.md` | R4 **仍 NOT closed**；本批不接线 |
| `delivery/non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R2-* · 零 covered |
| `delivery/m4-rag-hard-gates.md` §R2 | 无生产接线不得宣称路由生效 |

---

## 切片立场（RAG 域）

本批仅冻合同 / fail-closed 钉：

- **NHP-R2-NEG-01** → `pnpm r2-classify-job-route-prereq:prove`  
- **NHP-R2-FAULT-01** → `pnpm g-r2-5-retrieve-fail-closed:prove`  

**EXIT=0 ≠ R2 closed** · **≠ 路由已生效** · **≠ R4 closed** · **≠ P-LIVE 已 dual** · **≠ unscoped 生产全路径已禁**。  
R4-REAL-WIRE = **correctly NOT wiring**（P-PLANNER）· **本批未开 R4 编码 / 未改 R4 wire**。  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（全表 · 实现方 · ~05:00 PT）

| Case ID | CMD | EXIT | 诚实读法 |
|---------|-----|------|----------|
| NHP-001-NEG-01 | `pnpm neg:auth` | **0** | case-only auth 旁证 ≠ UC-001 covered（e2e-ha 主审） |
| NHP-001-PERF-api-01 | `pnpm uc001:live-blocked:prove` | **0** | Key-unset blocked honesty ≠ PERF SLO（e2e-ha 主审） |
| NHP-015-NEG-01 | `pnpm uc015:ingest-failures:prove` | **0** | partial ≠ OCR FAULT/LOAD（e2e-ha 主审） |
| NHP-050-NEG-01 | `pnpm privacy-erasure:http:prove` | **0** | DELETE=503 pin ≠ erasure complete（e2e-ha 主审） |
| NHP-033-NEG-01 | `pnpm uc033:cross-user-authz:prove` | **0** | partial ≠ ADV齐/PERF（e2e-ha 主审） |
| **NHP-R2-NEG-01** | `pnpm r2-classify-job-route-prereq:prove` | **0** | **≠ R2 closed / ≠ 路由已生效**（本域主审） |
| **NHP-R2-FAULT-01** | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | **≠ R2/R4 closed**；retrieve-side only（本域主审） |

**未跑（禁）**：`e2e:isolated` · live classify / P-LIVE · R4 wire/coding · LOAD / HA。  
**Key**：unset（未读 `.env*`）。

---

## 请专家回答

1. 请 **独立复跑**至少 `r2-classify-job-route-prereq:prove` + `g-r2-5-retrieve-fail-closed:prove`，附 CMD+EXIT；可选复跑全 7。  
2. EXIT=0 是否仍钉 **≠ 路由已生效 / ≠ R2 closed / ≠ R4 closed**？  
3. harness/status/eval 是否错误把本批绿写成 R2/R4 已关或 P-LIVE 已通过？（期望：**否**）  
4. 是否需要并列 `mw-model-op`？（期望：**否（本批）**；无 live classify 子集）  
5. 是否错误启动 R4 接线 / 编码？（期望：**否**；R4-REAL-WIRE = correctly NOT wiring）  
6. pre-exec dual pass + 本绿是否 **不得**自动批准 R2/R4 关闭？（期望：**不得**）

请将结论写入 `reviews/`（例如 `2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R2 closed / R4 closed / 路由已生效 / LOAD 绿。  
- **await post-prove dual**（或专家复跑收据）。  
- **禁止**抬升为 covered / R2 closed / R4 closed / HA。

---

*REQUEST · mw-rag-route · NHP Batch1 NEG+PERF post-prove · 2026-09-16 ~05:00 PT · releaseEvidence=false · ≠HA · ≠ R2/R4 closed*
