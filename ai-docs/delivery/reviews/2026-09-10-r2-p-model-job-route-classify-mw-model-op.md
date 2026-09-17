# 独立主审 — R2 P-MODEL `job_route_classify` MODEL-OP 绑定 · mw-model-op

**日期**：2026-09-10（PT）  
**结论**：**pass**（**仅 P-MODEL CLOSED**；**R2 整体仍开**；**≠ 路由已生效**；**无假 Worker**）  
**releaseEvidence=false** · Not HA · **禁止假 R2 关** · **禁止**写成生产 classify 已接线

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm job-route-classify-binding:prove` | **0** |
| `pnpm -C packages/ai-runtime prove:model-operation-registry` | **0** |
| `pnpm -C packages/ai-runtime prove:operation-binding` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（apps `classifyJobRoute(` **calls=0**；无 route-classify consumer） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（dispatch/recheck 仍零接线；旁证 R2/R4 仍开） |

## 交付物核对
| 项 | 结果 |
|----|------|
| Registry `job.route-classify.v1`（UC alias `job_route_classify`） | 已登记；`maxDispatches=1`；text-small |
| `bindJobRouteClassify` | 合法 digest → 密封 provenance；无 Key / 无网络 |
| Sealed `sealed-job-route-classify-binding.ts` | UC alias 映射；夹带 prompt/url/apiKey → 拒 |
| Migration `0131_job_route_classify_admission.sql` | admission 种子存在 |

## 专家问答（REQUEST）
1. **合同一致？** **是**。registry/operation-binding 证明：无 raw prompt、无 provider URL、未知字段拒、`maxDispatches=1`、admission 分区完整。  
2. **fail-closed 诚实？** **是**。未知 op / 非法 digest / 未接线 → binding 缺失；无 Key 路径。  
3. **仅关 P-MODEL？** **同意**。P-MODEL CLOSED ≠ R2 closed ≠ 路由已生效 ≠ 生产 classify 已跑。  
4. **仍需 mw-rag-route？** **是**。P-WORKER/P-API 仍开须第二域确认；本审不代签 Rag。

## 假绿 / 假关驳回
| 若宣称… | 裁定 |
|---------|------|
| R2 / 题域隔离 / 路由已生效 | **假关** — apps calls=0；无 classify consumer |
| P-MODEL 绿 = Worker 已跑 classify | **假绿** — 本刀明确不新建 Worker、不接线 |
| binding prove 绿 = live invoke / Key / 预算实测 | **假绿** — 本地静态；`releaseEvidence=false` |

## 仍开（挡 R2）
- **P-WORKER**：sole 分类 Worker / `route_pending` drain  
- **P-API**：生产调用 `classifyJobRoute` + bind/snapshot 消费链  
- dispatch/recheck 全接线（G4）；GAP-RAG-02

## 对照
- REQUEST：`reviews/REQUEST-r2-p-model-job-route-classify-mw-model-op.md`
- harness：`harness/r2-classify-job-route.md` · status
