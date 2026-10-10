# Review — R2 P-MODEL job_route_classify binding（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-model-op 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（限 P-MODEL binding 关闭诚实；**绑定 ≠ 生产 classify**；**R2 仍开**）  
**releaseEvidence=false** · Not HA · **≠ 路由已生效** · **≠ R4 / 题域已隔离**

## 对照

- `harness/r2-classify-job-route.md` / `r2-classify-job-route-status.md`（P9 · G-R2-2 CLOSED · G-R2-1 仍开）
- `job.route-classify.v1` · `bindJobRouteClassify` · `0131_job_route_classify_admission.sql`
- REQUEST：`REQUEST-r2-p-model-job-route-classify-mw-rag-route.md`
- 前序：`2026-09-10-r2-classify-job-route-mw-rag-route.md`

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | Inventory I2/I3 生产 classify 仍缺失？ | **是**。apps api+worker **零** `classifyJobRoute(`；无 route-classify consumer。 |
| 2 | P-MODEL 关后仍保持 R2 NOT closed？ | **同意**。P-WORKER / P-API / P-START / P-FAKE 仍开；G-R2-1 仍挡关闸。 |
| 3 | 禁假绿：binding/rag03/写面 ≠ 路由已生效？ | **同意并钉死**。binding prove 绿 ≠ 生产 classify 已跑。 |
| 4 | G-R2-1（sole Worker 跑漏斗）仍未宣称达成？ | **是**。status 仍钉 G-R2-1 **是**（挡 R2）。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm job-route-classify-binding:prove` | **0**（P-MODEL；仍钉 apps calls=0） |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（P-MODEL closed；P-WORKER/P-API open；R2 NOT closed） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍为阻塞） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |

## 非宣称

禁止：R2 关闭、生产 classify 已接线、路由已生效、假 Worker、R4/题域已隔离、cutover / HA / `releaseEvidence=true`。
