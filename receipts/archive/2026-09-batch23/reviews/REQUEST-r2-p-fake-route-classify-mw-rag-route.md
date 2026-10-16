# REQUEST — R2 P-FAKE ban fake rule-only Worker / 假绿表 → mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（PT）  
**releaseEvidence=false** · Not HA · **pass ≠ R2 已关** · **≠ 路由已生效** · **≠ claim R2 fully closed** until dual-review + harness gates · **≠ R4 / 题域已隔离**

## 对照

- Harness 假绿表：`harness/r2-classify-job-route.md` §5（规则-only Worker / rag03 绿 / 读侧 snapshot ≠ R2 关）
- Status：`harness/r2-classify-job-route-status.md` — **P-FAKE CLOSED pending dual-review**；**R2 NOT closed**
- Inventory：F1 rag03 fake seam · F2 rag04/rag05 rule-path · F3 docs 假绿 · F4 apps 旁路=0
- Production pin：`route-classify-consumer.ts` + `createJobRouteModelClassify`
- Prove：`pnpm r2-p-fake-route-classify:prove`
- GAP-RAG-02 · `m4-rag-hard-gates.md` §R2 · G4 P-R2
- 前序：P-MODEL/P-WORKER/P-API/P-LOOP/P-START dual-passed；G-R2-5 retrieve-side CLOSED

## 切片立场

本刀关闭 **P-FAKE**（禁假绿）为 **CLOSED pending dual-review**：  
- 生产路径钉 MODEL-OP；isolation/fake seams **标红**不得外推  
- **即使** P-FAKE prove=0，**R2 overall 仍开**：本刀双审收据 + **≠ 路由已生效**（harness 可能仍要 live 收据）+ harness 同意  
- **禁止**把本绿写成 R2 closed / 路由已生效 / R4 / HA

## 请专家复跑

| CMD | 期望 EXIT |
|-----|-----------|
| `pnpm r2-p-fake-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0**（≠ 题域已隔离） |
| `pnpm mysql-stack:m4-rag:prove` | **0**（§R2 文档门） |

## 请专家回答

1. Inventory F1–F4（isolation fake / rag03≠生产 / docs 假绿表 / apps 无旁路）是否完整且诚实？  
2. 即使 P-FAKE 钉齐，是否仍保持 **R2 NOT closed**（本刀 dual-review + ≠ 路由已生效 / harness live gates）？  
3. 是否同意 **P-FAKE CLOSED pending dual-review**（非自批 dual-passed），且禁止写成路由已生效？  
4. G4 P-R2 / GAP-RAG-02 是否仍正确以 R2 overall 开（余项含 ≠ 路由已生效）挡切流？

## 非宣称

- 不宣称 R2 fully closed · 不宣称 路由已生效 · 不宣称 P-FAKE dual-passed  
- 不宣称 R4 / 题域已隔离 / wrong_track=0 · Not HA · `releaseEvidence=false`  
- 本 REQUEST **不是** pass 结论 · **禁止自批**
