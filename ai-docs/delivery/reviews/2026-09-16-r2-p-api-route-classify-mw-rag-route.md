# Review — R2 P-API wakeup（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-model-op 并行）  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限 P-API：createJob → wakeup；**≠ R2 关** · **≠ 路由已生效** · **≠ R4**）  
**releaseEvidence=false** · Not HA · **P-LOOP 仍开** · **R2 NOT closed**

覆盖 REQUEST：`REQUEST-r2-p-api-route-classify-mw-rag-route.md`

## 对照

- `RecruiterService.create` → `createJob` + `notifyWorkerJobWakeup`（API **零** `classifyJobRoute(`）
- `0133_job_route_pending_worker_wakeup.sql`（wake-only NOTIFY）
- Worker sole：`route-classify-consumer.ts` + MODEL-OP
- Status P11 / G-R2-1 · G-R2-3（闭环仍挡）
- 前序：`2026-09-10-r2-p-worker-route-classify-mw-rag-route.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | I3 API wakeup 已接、Worker 仍 sole classify？ | **是**。apiWake=1 · apiClassify=0 · workerCalls=1；无第二分类路径。 |
| 2 | 即使 P-API 关仍保持 R2 NOT closed？ | **同意**。P-LOOP / P-START / P-FAKE 仍开；G-R2-1/3 仍挡关闸。 |
| 3 | 禁假绿：wakeup ≠ 路由已生效 ≠ R2/R4？ | **同意并钉死**。 |
| 4 | G-R2-1/3 闭环条件仍未宣称达成？ | **是**。缺 classify→bind→snapshot 生产闭环诚实证据。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r2-p-api-route-classify:prove` | **0** |
| `pnpm r2-p-worker-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（P-* closed；闭环仍开；R2 NOT closed） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4 关） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |

## 非宣称

禁止：R2 关闭、路由已生效、R4/题域已隔离、假闭环、内联 classify 绕过 Worker、cutover / HA / `releaseEvidence=true`。
