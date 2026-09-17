# 独立审 — R2 P-WORKER sole `route-classify` Worker · mw-model-op

**日期**：2026-09-16（PT）  
**结论**：**conditional**（**P-WORKER 接线诚实可关**；须修陈旧 binding prove 后再宣称 REQUEST CMD 全绿）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **P-API 仍开** · **禁假 Worker / 假 R2 关**

## Prove（亲自）
| CMD | EXIT | 读法 |
|-----|------|------|
| `pnpm r2-p-worker-route-classify:prove` | **0** | P-WORKER sole consumer + MODEL-OP modelClassify 钉；P-API=0；R2 NOT closed |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | workerCalls=1；apiCalls=0；R2 NOT closed |
| `pnpm job-route-classify-binding:prove` | **1** | **红**：仍断言 apps api+worker **零** `classifyJobRoute(`，与 P-WORKER 接线冲突（实测 calls=1） |

## 交付物核对
| 项 | 结果 |
|----|------|
| `route-classify-consumer.ts` | `createJobRouteModelClassify` → `classifyJobRoute({ modelClassify })`；gateway `job_route` drain |
| `main.ts` | `runRouteClassifyConsumer` + wake/stop/ready 接线 |
| MODEL-OP | `bindJobRouteClassify` → `invoke`（`job.route-classify.v1`）；非规则-only |
| Migration `0132` | `job_route` gateway + pending index 种子 |

## 专家问答（REQUEST）
1. **modelClassify 诚实？** **是**。走 `createJobRouteModelClassify` / bind+invoke；失败 `known_not_sent`，不发明假 `route_decided`。  
2. **fail-closed？** **结构上是**（无 Key / binding 缺失 → known_not_sent；`dispatched_unknown` 上抛）。**但** REQUEST 要求的 `job-route-classify-binding:prove` 当前 **EXIT=1**，不能写「binding 仍绿」。  
3. **仅关 P-WORKER？** **同意**（在修好 binding prove 陈旧断言后可合入叙事）。**禁止** R2 closed / 路由已生效 / HA / releaseEvidence=true。  
4. **仍需 mw-rag-route？** **是** — 确认 P-API 阻塞与 Inventory。

## 条件（合入/双审绿前必须）
1. 更新 `packages/ai-runtime/test/job-route-classify-binding.proof.ts`：允许 **worker** `classifyJobRoute(`=1（sole consumer），继续钉 **api**=0、fail-closed bind、≠ R2 关。  
2. 复跑 `pnpm job-route-classify-binding:prove` → **EXIT=0** 后再宣称 REQUEST CMD 表全绿。

## 假绿 / 假关驳回
| 若宣称… | 裁定 |
|---------|------|
| R2 / 路由已生效 / HA | **假关** — P-API 仍开；apiCalls=0 |
| 规则-only / 假 Worker | **驳回** — 代码路径为 MODEL-OP invoke |
| binding prove 仍绿（本轮） | **假绿** — 亲自跑 **EXIT=1** |

## 对照
- REQUEST：`reviews/REQUEST-r2-p-worker-route-classify-mw-model-op.md`
- harness：`harness/r2-classify-job-route.md`

---

## 复审追加（2026-09-16 PT · RECHECK）

**结论升级**：**pass**（**仅 P-WORKER CLOSED**；**R2 仍开**；**P-API 仍开**；**≠ 路由已生效**）

对照：`RECHECK-r2-p-worker-route-classify-mw-model-op.md`

### 复跑 prove
| CMD | EXIT |
|-----|------|
| `pnpm job-route-classify-binding:prove` | **0**（Worker sole≥1；API=0；fail-closed bind） |
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0** |

### 条件核对
1. binding prove 陈旧零调用断言已改 → **满足**  
2. 同意推进叙事：**仅**关 P-WORKER；**禁止** R2 closed / 路由已生效 / HA / releaseEvidence=true  

rag 第二域已 pass：不冲突。`releaseEvidence=false` · Not HA。
