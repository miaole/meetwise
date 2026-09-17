# REQUEST — NHP Batch3 FAULT/BOUND **post-prove** → mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:17 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ LOAD/容量绿** · **≠ PERF SLO** · **≠ 全量 E2E 已齐** · **≠ R2/R4 closed** · **≠ planner leaf** · **≠ wrong_track=0** · **≠ ADV covered**  
**配对**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify 子集）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· 矩阵双域文档闸已 pass · pre-exec + RECHECK dual pass · meetwise authorize 本批 CMD  
**前序 dual（已 pass · ≠ 自动绿关 / ≠ covered）**：`2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md` · `2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md`  
**本刀**：7× CMD **已跑**新鲜 EXIT；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/nhp-batch3-fault-bound.slice.md` | 切片索引（executed:awaiting_post_prove_dual） |
| `delivery/harness/nhp-batch3-fault-bound.md` | Batch3 CMD/EXIT 回执；假绿禁令 |
| `delivery/eval/nhp-batch3-fault-bound.eval.md` | 评测笔记；run-status |
| `delivery/non-happy-path-perf-load-case-matrix.md` | 用例全表 SSOT |
| `delivery/harness/non-happy-path-perf-load-matrix.md` | 父 harness |
| `delivery/north-star-hard-gates.md` | 硬闸（文档闸已生效 ≠ 笼统 prove 开跑） |
| Batch1 / Batch2 slice | **post_prove_dual_pass**（IDs 不重复） |
| 日志（可选） | `.tmp/nhp-batch3-fault-bound-exits/cmd{1..7}.log`（噪声；以本表 EXIT 为准） |

---

## 切片立场

实现方按 meetwise authorize 跑完 Batch3 冻结 CMD。  
**EXIT=0 ≠ covered** · **≠ PERF SLO** · **≠ LOAD** · **≠ HA** · **≠ refund complete** · **≠ 019 covered** · **≠ R2/R4 closed** · **≠ planner leaf** · **≠ wrong_track=0** · **≠ ADV covered**。  
**R4-FAULT FLIPPED CALL_SITES≥1 仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV**。  
本 REQUEST **不是** pass；实现方禁止自批。

R4 旁注（勿改 wire）：本批仅 **NHP-R4-NEG-01** + **NHP-R4-FAULT-01** honesty · **本批未开 R4 编码 / 未改 R4 wire** · **≠** R4 closed。

---

## Post-prove CMD+EXIT（实现方 · ~19:17 PT · HEAD `639134f` 工作树）

| Case ID | CMD | EXIT | 诚实读法 |
|---------|-----|------|----------|
| NHP-015-BOUND-01 | `pnpm uc015:ingest-failures:prove` | **0** | F2/F3 BOUND ≠ OCR FAULT / ≠ LOAD · pgvector green-risk/R5 |
| NHP-011-FAULT-01 | `pnpm uc011:report-refund:prove` | **0** | 失败→released DB 口径 ≠ refund complete / ≠ UI-pay |
| NHP-017-BOUND-01 | `pnpm uc017:orphan:prove` | **0** | sweeper 幂等 ≠ LOAD |
| NHP-019-NEG-01 | `pnpm uc019:report-regenerate:prove` | **0** | quarantine regen GAP ≠ 019 covered |
| NHP-033-BOUND-01 | `pnpm uc033:cross-user-authz:prove` | **0** | X10 burst ≠ PERF/LOAD SLO · 七类未齐 |
| NHP-R4-NEG-01 | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | snapshot missing fail-closed ≠ R4 closed（配对域主审） |
| NHP-R4-FAULT-01 | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **FLIPPED CALL_SITES=1** · seam honesty；**仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV**（配对域主审） |

**未跑（禁）**：`e2e:isolated` · `verify:e2e-performance` · 云 TC · HA prove · LOAD_* · PERF-CLOUD · Meridian。  
**Key**：`MODEL_API_KEY` unset（仅 env 探测；未读 `.env*`）。  
**环境注记**：Docker 已可用；首轮 7× 新鲜 EXIT=0，无需再启 dockerd。**≠** HA。

---

## 请专家回答

1. 实现方 EXIT 表是否与独立复跑一致？（请 **自行复跑** 同 7 CMD 并附 CMD+EXIT。）  
2. 是否有任何 EXIT=0 被错误抬成 covered / PERF SLO / LOAD / HA / refund complete / 019 全家齐？  
3. harness/slice/eval 是否仍钉 `releaseEvidence=false` 与假绿禁令？  
4. 是否错误把 pre-exec/RECHECK dual pass + 本绿自动批准 Batch3「全家 covered」？（期望：**否**）  
5. 是否错误跑了禁令 CMD（`e2e:isolated` / `verify:e2e-performance` / 云 / HA / Meridian）？（期望：**否**）  
6. R4-NEG / R4-FAULT 两行是否应 defer 至配对 `mw-rag-route` 主审？（期望：**是**，本域核对诚实钉即可）  
7. FLIPPED CALL_SITES≥1 是否仍钉 **≠ R4 closed ≠ wrong_track=0 ≠ ADV**？（期望：**是**）

请将结论写入 `reviews/`（例如 `2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / LOAD 绿 / PERF SLO / R2 closed / R4 closed / planner leaf / wrong_track=0 / ADV covered / refund complete。  
- **await post-prove dual**（或专家复跑收据）。  
- **禁止**抬升为 covered / R2 closed / R4 closed / HA。

---

*REQUEST · mw-e2e-ha · NHP Batch3 FAULT/BOUND post-prove · 2026-09-16 ~19:17 PT · releaseEvidence=false · ≠HA · ≠ covered*
