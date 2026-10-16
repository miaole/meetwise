# REQUEST — NHP Batch1 NEG+PERF **post-prove** → mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~05:00 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ PERF SLO** · **≠ 全量 E2E 已齐** · **≠ R2/R4 closed**  
**配对**：`REQUEST-2026-09-16-nhp-batch1-neg-perf-post-prove-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify 子集）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· 矩阵双域文档闸已 pass · pre-exec dual pass · meetwise-core 授权本批 CMD  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ covered）**：`2026-09-16-nhp-batch1-neg-perf-mw-e2e-ha.md` · `2026-09-16-nhp-batch1-neg-perf-mw-rag-route.md`  
**本刀**：7× CMD **已跑**新鲜 EXIT；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/nhp-batch1-neg-perf.slice.md` | 切片索引（executed:awaiting_post_prove_dual） |
| `delivery/harness/nhp-batch1-neg-perf.md` | Batch1 CMD/EXIT 回执；假绿禁令 |
| `delivery/eval/nhp-batch1-neg-perf.eval.md` | 评测笔记；run-status |
| `delivery/non-happy-path-perf-load-case-matrix.md` | 用例全表 SSOT |
| `delivery/harness/non-happy-path-perf-load-matrix.md` | 父 harness |
| `delivery/north-star-hard-gates.md` | 硬闸（文档闸已生效 ≠ 笼统 prove 开跑） |
| 日志（可选） | `.tmp/nhp-batch1-neg-perf-exits/cmd{1..7}.log`（噪声；以本表 EXIT 为准） |

---

## 切片立场

实现方按 meetwise-core 授权跑完 Batch1 冻结 CMD。  
**EXIT=0 ≠ covered** · **≠ PERF SLO** · **≠ LOAD** · **≠ HA** · **≠ erasure complete** · **≠ ADV 七类齐** · **≠ R2/R4 closed**。  
本 REQUEST **不是** pass；实现方禁止自批。

R4 旁注（勿改 wire）：R4-REAL-WIRE dual pre-exec 已 pass 为 **correctly NOT wiring**（P-PLANNER blocker）· **本批未开 R4 编码**。

---

## Post-prove CMD+EXIT（实现方 · ~05:00 PT · HEAD `639134f` 工作树）

| Case ID | CMD | EXIT | 诚实读法 |
|---------|-----|------|----------|
| NHP-001-NEG-01 | `pnpm neg:auth` | **0** | case-only auth 旁证 ≠ UC-001 covered |
| NHP-001-PERF-api-01 | `pnpm uc001:live-blocked:prove` | **0** | Key-unset blocked honesty ≠ PERF SLO |
| NHP-015-NEG-01 | `pnpm uc015:ingest-failures:prove` | **0** | partial ≠ OCR FAULT/LOAD |
| NHP-050-NEG-01 | `pnpm privacy-erasure:http:prove` | **0** | DELETE=503 pin ≠ erasure complete |
| NHP-033-NEG-01 | `pnpm uc033:cross-user-authz:prove` | **0** | partial ≠ ADV齐/PERF |
| NHP-R2-NEG-01 | `pnpm r2-classify-job-route-prereq:prove` | **0** | ≠ R2 closed / ≠ 路由已生效（配对域主审） |
| NHP-R2-FAULT-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | ≠ R2/R4 closed（配对域主审） |

**未跑（禁）**：`e2e:isolated` · `verify:e2e-performance` · 云 TC · HA prove。  
**Key**：`MODEL_API_KEY` unset（仅 env 探测；未读 `.env*`）。  
**环境注记**：首轮无 Docker 时 isolated 目标曾 spawn fail；装启 docker 后重跑得上表。**≠** HA。

---

## 请专家回答

1. 实现方 EXIT 表是否与独立复跑一致？（请 **自行复跑** 同 7 CMD 并附 CMD+EXIT。）  
2. 是否有任何 EXIT=0 被错误抬成 covered / PERF SLO / LOAD / HA / erasure complete / 七类齐？  
3. harness/slice/eval 是否仍钉 `releaseEvidence=false` 与假绿禁令？  
4. 是否错误把 pre-exec dual pass + 本绿自动批准 Batch1「全家 covered」？（期望：**否**）  
5. 是否错误跑了禁令 CMD（`e2e:isolated` / `verify:e2e-performance` / 云 / HA）？（期望：**否**）  
6. RAG 两行是否应 defer 至配对 `mw-rag-route` 主审？（期望：**是**，本域核对诚实钉即可）

请将结论写入 `reviews/`（例如 `2026-09-16-nhp-batch1-neg-perf-post-prove-mw-e2e-ha.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / PERF SLO / R2 closed / R4 closed / 路由已生效 / erasure complete。  
- **await post-prove dual**（或专家复跑收据）。  
- **禁止**抬升为 covered / R2 closed / R4 closed / HA。

---

*REQUEST · mw-e2e-ha · NHP Batch1 NEG+PERF post-prove · 2026-09-16 ~05:00 PT · releaseEvidence=false · ≠HA · ≠ covered*
