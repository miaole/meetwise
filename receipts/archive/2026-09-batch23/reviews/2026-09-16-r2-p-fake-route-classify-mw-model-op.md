# 独立审 — R2 P-FAKE 禁规则-only 假 Worker · mw-model-op

**日期**：2026-09-16（PT）  
**结论**：**pass**（**P-FAKE CLOSED pending dual-review only**；**R2 仍 NOT closed**；**≠ 路由已生效**；**≠ R4**；**≠ 自批 dual-passed**）  
**releaseEvidence=false** · Not HA · **prove 绿 ≠ R2 全关**

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm r2-p-fake-route-classify:prove` | **0**（sole 钉 `createJobRouteModelClassify`；missingModelOp=0；apiClassify=0；F1–F4 inventory） |
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm job-route-classify-binding:prove` | **0**（Key-unset fail-closed） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |

## 交付物核对
| 项 | 结果 |
|----|------|
| Sole consumer | `createJobRouteModelClassify` → `classifyJobRoute({ modelClassify })` |
| 合同 `deps.modelClassify` | **必填**（无可省略假路径） |
| apps 旁路 | workerCalls=1；missingModelOp=0；API classify=0 |
| Isolation fake seams | rag03/04/05 **仅** proof 夹具；harness 假绿表禁外推生产 R2 绿 |
| UC `rule_unique_leaf` modelCalls=0 | 发生在已绑定 MODEL-OP 的 Worker 调用之后 = **不是** P-FAKE |

## 专家问答（REQUEST）
1. **sole 强制 MODEL-OP、无缺 binding 旁路？** **是**。  
2. **Key-unset fail-closed 持有；isolation 未写成生产绿？** **是**（`known_not_sent`；F1–F4 钉夹具≠生产）。  
3. **P-FAKE CLOSED pending dual only；禁 R2 关？** **同意**。禁止 HA / releaseEvidence=true / 自批 dual-passed / 路由已生效。  
4. **仍需 mw-rag-route？** **是** — 假绿表 Inventory + harness live gates / ≠ 路由已生效。

## 假绿 / 假关驳回
| 若宣称… | 裁定 |
|---------|------|
| 规则-only Worker = R2 绿 / 路由已生效 | **假绿**（P-FAKE） |
| rag03 注入 fake modelClassify = 生产接线 | **假绿**（isolation only） |
| P-FAKE prove 绿 = R2 关 | **假关** — dual + harness gates 未齐 |
| live invoke / Key / 预算已测 | **假绿** — `releaseEvidence=false` |

## 仍开（挡 R2）
- P-FAKE **dual-review 收据**（mw-rag-route）  
- harness 同意关闸 / live 收据若要求仍缺  
- ≠ 宣称路由已生效

## 对照
- REQUEST：`reviews/REQUEST-r2-p-fake-route-classify-mw-model-op.md`
- harness：`harness/r2-classify-job-route.md` · status · eval
