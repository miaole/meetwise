# REQUEST — R2 `classifyJobRoute` honesty PREREQ（fail-closed · 未接线）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ R4 / 题域已隔离** · **≠ sole cutover** · **≠ production classify wire**

## 对照

- `ai-docs/delivery/harness/r2-classify-job-route.md`（Inventory I1–I6 · P-MODEL/P-WORKER/P-API）
- `ai-docs/delivery/harness/r2-classify-job-route-status.md`（G-R2-*）
- `ai-docs/delivery/eval/r2-classify-job-route.eval.md`
- `packages/db/src/job-route-decision.ts`（合同）· `packages/db/src/recruiter.ts`（revision/bind/snapshot 写面）
- `apps/api` / `apps/worker`：**零** `classifyJobRoute(`
- G4 前序：`REQUEST-g4-dispatch-recheck-prereq-mw-rag-route.md`（P-R2 阻塞仍开）
- GAP-RAG-02 · `m4-rag-hard-gates.md` §R2

## 切片立场（实现方自认）

本刀 **不**把 `classifyJobRoute` 接进生产 API/Worker。  
产品阻塞 → **honesty PREREQ + fail-closed**（禁止假绿宣称 R2 已接线 / 路由已生效）：

| 阻塞 | 事实 |
|------|------|
| **P-MODEL** | `job_route_classify` MODEL-OP-01 typed binding **未实施** |
| **P-WORKER** | sole 分类 Worker / drain **不存在**；`apps/worker` 零 classify 调用 |
| **P-API** | 建岗/编辑只写 `route_pending`；API 零 `classifyJobRoute(` |
| **P-START** | `startApplicationInterview` 缺 binding 仍优雅降级（强改 fail-closed 会打爆 legacy） |
| **P-FAKE** | 规则-only 假 Worker + 假 modelClassify = 假绿 |

合同 + revision/bind/snapshot 写面 **仍在**；≠ 生产 classify 已跑。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-classify-job-route-prereq:prove` | **0** |
| `pnpm g4-production-scoped-retrieve:prove` | **0**（缺 snapshot → unscoped 仍在） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍为阻塞） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm mysql-stack:m4-rag:prove` | **0** |

## 请专家回答

1. Inventory（建岗 revision → 分类 Worker → bind → snapshot → Worker 读侧）是否正确？  
2. 本刀是否正确选择 **honesty PREREQ + fail-closed**（因 P-MODEL/P-WORKER/P-API），而非假接线？  
3. 是否同意 **保持 R2 NOT closed**，禁止把 bind/snapshot 写面 / rag03 绿写成「路由已生效」？  
4. G-R2 关闭条件（classify 生产调用 + MODEL-OP binding + bind/snapshot 闭环）是否仍正确未宣称达成？

## 非宣称（实现方自认）

- 不宣称生产 `classifyJobRoute` 已接线 · 不宣称路由已生效  
- 不宣称 R2 / R1 / R4 / 题域隔离已关 · 不宣称 wrong_track=0  
- 不切 qbank / 向量真相 / flip default / HA / `releaseEvidence=true` / open DELETE  
- 本 REQUEST **不是** pass 结论
