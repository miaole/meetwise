# REQUEST — NHP Batch2 NEG/FAULT/BOUND **post-prove**（RAG/R4 子集）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~08:00 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R2 closed** · **≠ R4 closed** · **≠ 路由已生效** · **≠ planner leaf** · **≠ LOAD** · **≠ wrong_track=0**  
**配对**：`REQUEST-2026-09-16-nhp-batch2-neg-fault-post-prove-mw-e2e-ha.md`（双域对抗；冲突以阻塞项为准）  
**model-op**：本批 **不**送审（无 MODEL-OP live classify / P-LIVE 子集）  
**硬闸**：`north-star-hard-gates.md` 已生效（文档闸）· pre-exec dual pass · meetwise-core 授权本批 CMD  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ R4 关）**：`2026-09-16-nhp-batch2-neg-fault-mw-rag-route.md` · `2026-09-16-nhp-batch2-neg-fault-mw-e2e-ha.md`  
**本刀**：含 R4-BOUND 在内的 7× CMD **已跑**；**实现方不写** pass review；请专家 **独立复跑**（至少 R4-BOUND CMD）并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `delivery/harness/nhp-batch2-neg-fault.md` | Batch2 CMD/EXIT；R4 假绿禁令 |
| `delivery/eval/nhp-batch2-neg-fault.eval.md` | run-status + 延期 |
| `delivery/nhp-batch2-neg-fault.slice.md` | 切片索引（executed:awaiting_post_prove_dual） |
| `delivery/harness/r4-domain-isolation-status.md` | R4 **仍 NOT closed**；本批不接线 |
| `delivery/harness/r4-domain-isolation.md` | R4 harness；题域隔离 NOT closed |
| `delivery/non-happy-path-perf-load-case-matrix.md` | NHP-R4-BOUND-01 · 零 covered |
| `delivery/m4-rag-hard-gates.md` | 无生产接线不得宣称路由生效 / R4 关 |

---

## 切片立场（RAG 域）

本批仅冻 **一条** R4 BOUND honesty：

- **NHP-R4-BOUND-01** → `pnpm g4-production-scoped-retrieve:prove`

**EXIT=0 ≠ R4 closed** · **≠ planner leaf 关** · **≠ 路由已生效** · **≠ wrong_track=0** · **≠ R2 closed** · **≠ P-LIVE 已 dual**。  
本批 **未开 R4 编码 / 未改 R4 wire** · **未**扩 wrong_track ADV。  
本 REQUEST **不是** pass；实现方禁止自批。

其余 6 行（002/010/011/017/018/019）为 e2e-ha 主审；本域核对诚实钉即可。

---

## Post-prove CMD+EXIT（全表 · 实现方 · ~08:00 PT · HEAD `639134f`）

| Case ID | CMD | EXIT | 诚实读法 |
|---------|-----|------|----------|
| NHP-002-BOUND-01 | `pnpm uc002:lease:prove` | **0** | lease 竞态 partial ≠ 002 covered（e2e-ha 主审） |
| NHP-010-FAULT-01 | `pnpm uc010:sse-resume:prove` | **0** | SSE/LED resume partial ≠ SLO（e2e-ha 主审） |
| NHP-011-NEG-01 | `pnpm uc011:report-refund:http:prove` | **0** | quarantine 误退拒 ≠ refund complete（e2e-ha 主审） |
| NHP-017-FAULT-01 | `pnpm uc017:orphan:prove` | **0** | orphan reserved→released ≠ LOAD（e2e-ha 主审） |
| NHP-018-NEG-01 | `pnpm uc018:abandon:http:prove` | **0** | abandon 后复活拒 ≠ 018 covered（e2e-ha 主审） |
| NHP-019-FAULT-01 | `pnpm uc019:report-regenerate:http:prove` | **0** | retry∥quarantine honesty ≠ 019 covered（e2e-ha 主审） |
| **NHP-R4-BOUND-01** | `pnpm g4-production-scoped-retrieve:prove` | **0** | **≠ R4 closed / ≠ planner leaf / ≠ wrong_track=0**（本域主审） |

**未跑（禁）**：`e2e:isolated` · live classify / P-LIVE · R4 wire/coding · R4 ADV · LOAD / HA。  
**Key**：unset（未读 `.env*`）。

---

## 请专家回答

1. 请 **独立复跑**至少 `g4-production-scoped-retrieve:prove`，附 CMD+EXIT；可选复跑全 7。  
2. EXIT=0 是否仍钉 **≠ R4 closed / ≠ planner leaf / ≠ wrong_track=0 / ≠ 路由已生效**？  
3. harness/status/eval 是否错误把本批绿写成 R4 已关或 planner leaf 已过？（期望：**否**）  
4. 是否需要并列 `mw-model-op`？（期望：**否（本批）**；无 live classify 子集）  
5. 是否错误启动 R4 接线 / 编码 / wrong_track ADV？（期望：**否**）  
6. pre-exec dual pass + 本绿是否 **不得**自动批准 R4/planner 关闭？（期望：**不得**）

请将结论写入 `reviews/`（例如 `2026-09-16-nhp-batch2-neg-fault-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R2 closed / R4 closed / planner leaf / 路由已生效 / wrong_track=0 / LOAD 绿。  
- **await post-prove dual**（或专家复跑收据）。  
- **禁止**抬升为 covered / R2 closed / R4 closed / HA。

---

*REQUEST · mw-rag-route · NHP Batch2 NEG/FAULT/BOUND post-prove · 2026-09-16 ~08:00 PT · releaseEvidence=false · ≠HA · ≠ R4 closed*
