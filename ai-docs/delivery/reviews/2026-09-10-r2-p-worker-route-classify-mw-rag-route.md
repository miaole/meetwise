# Review — R2 P-WORKER sole route-classify（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-model-op 并行）  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限 P-WORKER sole consumer + MODEL-OP；**≠ R2 关** · **≠ 路由已生效** · **≠ R4**）  
**releaseEvidence=false** · Not HA · **P-API 仍开** · **R2 NOT closed**

覆盖 REQUEST：`REQUEST-r2-p-worker-route-classify-mw-rag-route.md`

## 对照

- `route-classify-consumer.ts` → `classifyJobRoute(` + `createJobRouteModelClassify`
- `0132_job_route_classify_worker_dispatch.sql` · `main.ts` wake/reconcile
- Status P10 / G-R2-1（P-API / 闭环仍挡）
- 前序 P-MODEL：`2026-09-10-r2-p-model-job-route-classify-mw-rag-route.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | Inventory I2 sole Worker 已接、I3 API 仍缺？ | **是**。workerCalls=1（sole consumer）；apiCalls=0。 |
| 2 | 保持 R2 NOT closed（因 P-API / 闭环 / P-START）？ | **同意**。G-R2-1 仍挡；不得宣称路由已生效。 |
| 3 | 禁假绿：Worker 绿 ≠ R2/路由/R4？ | **同意并钉死**。 |
| 4 | G-R2-1 关闭条件仍未宣称达成？ | **是**。需 API/触发 + classify→bind→snapshot 闭环可证。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（Worker sole；API=0；R2 NOT closed） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4 关） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |
| `pnpm job-route-classify-binding:prove` | **1**（**正交 nit**：仍断言 apps api+worker **零** classify；Worker 现 calls=1 致假失败；P-API=0 仍真。建议实现方把钉改为「API=0；Worker sole 允许 ≥1」——**不降级本 P-WORKER pass**） |

## 非宣称

禁止：R2 关闭、路由已生效、R4/题域已隔离、假 API 接线、假绿、cutover / HA / `releaseEvidence=true`。
