# REQUEST — NHP Batch3 FAULT/BOUND **post-prove**（RAG/R4 子集）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:17 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2 closed** · **≠ R4 closed** · **≠ 路由已生效** · **≠ planner leaf** · **≠ LOAD** · **≠ wrong_track=0** · **≠ ADV covered**  
**配对**：`REQUEST-2026-09-16-nhp-batch3-fault-bound-post-prove-mw-e2e-ha.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify / P-LIVE 子集）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· pre-exec + RECHECK dual pass · meetwise authorize 本批 CMD  
**前序 dual（已 pass · ≠ 自动绿关 / ≠ R4 关）**：`2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-rag-route.md` · `2026-09-16-nhp-batch3-fault-bound-RECHECK-mw-e2e-ha.md`  
**本刀**：含 R4-NEG + R4-FAULT 在内的 7× CMD **已跑**；**实现方不写** pass review；请专家 **独立复跑**（至少 R4 两 CMD）并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/harness/nhp-batch3-fault-bound.md` | Batch3 CMD/EXIT；R4 假绿禁令 |
| `delivery/eval/nhp-batch3-fault-bound.eval.md` | run-status + 延期 |
| `delivery/nhp-batch3-fault-bound.slice.md` | 切片索引（executed:awaiting_post_prove_dual） |
| `delivery/harness/r4-domain-isolation-status.md` | R4 **仍 NOT closed**；本批不改 wire |
| `delivery/harness/r4-domain-isolation.md` | R4 harness；题域隔离 NOT closed |
| `delivery/non-happy-path-perf-load-case-matrix.md` | NHP-R4-NEG-01 / NHP-R4-FAULT-01 · 零 covered |
| `delivery/m4-rag-hard-gates.md` | 无生产接线不得宣称路由生效 / R4 关 |
| 日志（可选） | `.tmp/nhp-batch3-fault-bound-exits/cmd{6,7}.log` |

---

## 切片立场（RAG 域）

本批冻 **两条** R4 honesty：

- **NHP-R4-NEG-01** → `pnpm g-r2-5-retrieve-fail-closed:prove`
- **NHP-R4-FAULT-01** → `pnpm g4-dispatch-recheck-prereq:prove`（**FLIPPED CALL_SITES=1≥1**）

**EXIT=0 ≠ R4 closed** · **≠ planner leaf 关** · **≠ 路由已生效** · **≠ wrong_track=0** · **≠ ADV covered** · **≠ R2 closed** · **≠ P-LIVE 已 dual**。  
**FLIPPED CALL_SITES≥1 仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV**（seam honesty only）。  
本批 **未开 R4 编码 / 未改 R4 wire** · **未**扩 wrong_track ADV。  
本 REQUEST **不是** pass；实现方禁止自批。

其余 5 行（015/011/017/019/033）为 e2e-ha 主审；本域核对诚实钉即可。

---

## Post-prove CMD+EXIT（全表 · 实现方 · ~19:17 PT · HEAD `639134f`）

| Case ID | CMD | EXIT | 诚实读法 |
|---------|-----|------|----------|
| NHP-015-BOUND-01 | `pnpm uc015:ingest-failures:prove` | **0** | F2/F3 BOUND ≠ OCR FAULT（e2e-ha 主审） |
| NHP-011-FAULT-01 | `pnpm uc011:report-refund:prove` | **0** | DB released 口径 ≠ refund complete（e2e-ha 主审） |
| NHP-017-BOUND-01 | `pnpm uc017:orphan:prove` | **0** | sweeper 幂等 ≠ LOAD（e2e-ha 主审） |
| NHP-019-NEG-01 | `pnpm uc019:report-regenerate:prove` | **0** | quarantine GAP ≠ 019 covered（e2e-ha 主审） |
| NHP-033-BOUND-01 | `pnpm uc033:cross-user-authz:prove` | **0** | X10 ≠ SLO（e2e-ha 主审） |
| **NHP-R4-NEG-01** | `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | snapshot missing fail-closed；**≠ R4 closed / ≠ 路由已生效**（本域主审） |
| **NHP-R4-FAULT-01** | `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **FLIPPED CALL_SITES=1** · recheck seam；**仍 ≠ R4 closed ≠ wrong_track=0 ≠ ADV**（本域主审） |

**未跑（禁）**：`e2e:isolated` · live classify / P-LIVE · R4 wire/coding · R4 ADV · LOAD / HA · Meridian。  
**Key**：unset（未读 `.env*`）。  
**证明摘录（实现方日志）**：`CALL_SITES≥1 for dispatchTrackLocalRetrieval( — callSites=1`；`OK … FLIPPED: CALL_SITES=1≥1; … R4 NOT closed; ≠ wrong_track=0`。

---

## 请专家回答

1. 请 **独立复跑**至少 `g-r2-5-retrieve-fail-closed:prove` 与 `g4-dispatch-recheck-prereq:prove`，附 CMD+EXIT；可选复跑全 7。  
2. EXIT=0 是否仍钉 **≠ R4 closed / ≠ planner leaf / ≠ wrong_track=0 / ≠ ADV covered / ≠ 路由已生效**？  
3. FLIPPED CALL_SITES=1 是否被错误读成 R4 已关或 wrong_track=0？（期望：**否**）  
4. harness/status/eval 是否错误把本批绿写成 R4 已关或 planner leaf 已过？（期望：**否**）  
5. 是否需要并列 `mw-model-op`？（期望：**否（本批）**；无 live classify 子集）  
6. 是否错误启动 R4 接线 / 编码 / wrong_track ADV / Meridian？（期望：**否**）  
7. pre-exec/RECHECK dual pass + 本绿是否 **不得**自动批准 R4/planner/ADV 关闭？（期望：**不得**）

请将结论写入 `reviews/`（例如 `2026-09-16-nhp-batch3-fault-bound-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R2 closed / R4 closed / planner leaf / 路由已生效 / wrong_track=0 / ADV covered / LOAD 绿。  
- **await post-prove dual**（或专家复跑收据）。  
- **禁止**抬升为 covered / R2 closed / R4 closed / HA。

---

*REQUEST · mw-rag-route · NHP Batch3 FAULT/BOUND post-prove · 2026-09-16 ~19:17 PT · releaseEvidence=false · ≠HA · ≠ R4 closed · FLIPPED ≠ ADV*
