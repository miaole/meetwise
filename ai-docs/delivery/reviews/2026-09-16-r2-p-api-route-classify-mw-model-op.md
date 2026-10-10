# 独立审 — R2 P-API createJob → wakeup · mw-model-op

**日期**：2026-09-16（PT）  
**结论**：**pass**（**仅 P-API CLOSED**；**R2 仍 NOT closed**；**P-LOOP（classify→bind→snapshot）仍开**；**≠ 路由已生效**）  
**releaseEvidence=false** · Not HA · **P-API 关 ≠ R2 全关** · **wakeup ≠ inline classify** · **禁假绿 / 假 R2 关**

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm r2-p-api-route-classify:prove` | **0**（createJob→notifyWorkerJobWakeup；apiClassify=0；apiWake=1；Worker sole） |
| `pnpm r2-p-worker-route-classify:prove` | **0**（Worker sole + MODEL-OP 仍绿） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（P-MODEL+P-WORKER+P-API closed；闭环仍开；R2 NOT closed） |
| `pnpm job-route-classify-binding:prove` | **0**（Worker≥1；API=0；fail-closed 无 Key） |

## 交付物核对
| 项 | 结果 |
|----|------|
| `RecruiterService.create` | `createJob` + `notifyWorkerJobWakeup`；**无** `classifyJobRoute` |
| `notifyWorkerJobWakeup` | 通道 `meetwise_worker_wakeup_v1` / payload `wake`（无租户/作业载荷） |
| Migration `0133` | `route_pending` → `pg_notify(..., 'wake')`；不内联 classify |
| Worker sole | `route-classify-consumer` 仍为 apps 唯一 `classifyJobRoute(` |

## 专家问答（REQUEST）
1. **仅 wakeup、无内联 classify？** **是**。apiClassify=0；无第二分类路径。  
2. **复用既有 wakeup 通道？** **是**。0133 trigger + `notifyWorkerJobWakeup` 同 `wake` token。  
3. **仅关 P-API？** **同意**。**禁止** R2 closed / 路由已生效 / HA / releaseEvidence=true。  
4. **仍需 mw-rag-route？** **是** — 确认闭环缺口与 Inventory I3。

## 假绿 / 假关驳回
| 若宣称… | 裁定 |
|---------|------|
| R2 / 路由已生效 | **假关** — status/harness 钉闭环仍缺；GAP-RAG-02 仍开 |
| wakeup = inline classify / API 第二路径 | **假绿** — API 零 classify |
| live bind/snapshot 闭环已证 | **假绿** — 本刀未证 P-LOOP |

## 仍开（挡 R2）
- **P-LOOP**：classify → bind → snapshot 诚实闭环证据  
- live invoke / Key / 预算实测（`releaseEvidence=false`）

## 对照
- REQUEST：`reviews/REQUEST-r2-p-api-route-classify-mw-model-op.md`
- harness：`harness/r2-classify-job-route.md` · status
