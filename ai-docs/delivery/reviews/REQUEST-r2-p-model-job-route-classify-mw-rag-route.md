# REQUEST — R2 P-MODEL `job_route_classify` binding（R2 仍开）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-10（PT）  
**releaseEvidence=false** · Not HA · **R2 仍 NOT closed** · **≠ 路由已生效**

## 对照

- P-MODEL CLOSED：`job.route-classify.v1` + `bindJobRouteClassify` + `0131`
- P-WORKER / P-API **仍开**：`apps/api`+`apps/worker` **零** `classifyJobRoute(`
- Status：`harness/r2-classify-job-route-status.md`（G-R2-2 CLOSED；G-R2-1 仍开）
- 前序 honesty：`REQUEST-r2-classify-job-route-mw-rag-route.md`

## 切片立场

P-MODEL 关闭 **不等于** R2 关闭。无 sole 分类 Worker / API 触发 → 多数岗位仍 `route_pending` → 无 bind → 无 snapshot。  
禁止用规则-only 假 Worker 冒充 R2 关（P-FAKE）。

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm job-route-classify-binding:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（calls=0；P-MODEL closed；R2 NOT closed） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（R2 仍为 dispatch 阻塞） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** |

## 请专家回答

1. Inventory 是否仍正确（I2/I3 classify 生产调用缺失）？  
2. P-MODEL 关闭后，是否同意 **保持 R2 NOT closed**（因 P-WORKER/P-API）？  
3. 是否禁假绿：binding 绿 / rag03 绿 / bind·snapshot 写面 ≠ 路由已生效？  
4. G-R2-1 关闭条件（sole Worker 实际跑漏斗）是否仍正确未宣称达成？

## 非宣称

- 不宣称生产 `classifyJobRoute` 已接线 · 不宣称路由已生效 · 不关 R2/R4  
- 不新建假 Worker · 不 flip / cutover / HA / `releaseEvidence=true`  
- 本 REQUEST **不是** pass 结论
