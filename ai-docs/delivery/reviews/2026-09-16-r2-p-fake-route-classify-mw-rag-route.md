# Review — R2 P-FAKE 禁假绿 Worker（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-model-op）  
**日期**：2026-09-16（PT）  
**结论**：**pass**（限 **P-FAKE CLOSED pending dual-review**；**≠ R2 fully closed** · **≠ 路由已生效** · **≠ R4 / 题域已隔离** · **≠ 自批 dual-passed**）  
**releaseEvidence=false** · Not HA · **prove 绿 ≠ R2 全关**

覆盖 REQUEST：`REQUEST-r2-p-fake-route-classify-mw-rag-route.md`

## 对照

- Harness 假绿表：`harness/r2-classify-job-route.md` §1b Inventory F1–F4 · §5
- Status：`P-FAKE CLOSED pending dual-review` · **R2 NOT closed**（余 dual 收据 + ≠ 路由已生效 / harness gates）
- 生产钉：`route-classify-consumer.ts` → `createJobRouteModelClassify` + `classifyJobRoute`
- Prove：`apps/worker/test/r2-p-fake-route-classify.proof.ts`
- 前序：P-MODEL…P-START dual-passed；G-R2-5 retrieve-side CLOSED
- GAP-RAG-02 · m4 §R2 · G4 P-R2 仍以 R2 overall 开挡切流

## 专家问答

| # | 问 | 答 |
|---|----|----|
| 1 | Inventory F1–F4（isolation fake / rag03≠生产 / docs 假绿表 / apps 无旁路）是否完整且诚实？ | **是**。F1 rag03 注入 fake `modelClassify` 并钉 ≠ 生产 / P-FAKE；F2 rag04/rag05 `rule path must never call model` 为 proof-only；F3 harness 假绿表禁规则-only Worker 关 R2 / 假称路由生效；F4 apps/worker 仅 `route-classify-consumer.ts` 调 `classifyJobRoute` 且同文件必有 `createJobRouteModelClassify`，`apps/api` classify=0。 |
| 2 | 即使 P-FAKE 钉齐，是否仍保持 **R2 NOT closed**（本刀 dual-review + ≠ 路由已生效 / harness live gates）？ | **是**。status/harness/GAP-RAG-02/m4/G4 均钉 R2 overall 仍开；本刀 prove 绿 ≠ claim R2 / ≠ 路由已生效。 |
| 3 | 是否同意 **P-FAKE CLOSED pending dual-review**（非自批 dual-passed），且禁止写成路由已生效？ | **同意**。本文件为 rag 域收据；dual-passed 须 model-op + rag 双齐且 harness 关闸条件满足后另议。**禁止**写成路由已生效。 |
| 4 | G4 P-R2 / GAP-RAG-02 是否仍正确以 R2 overall 开（余项含 ≠ 路由已生效）挡切流？ | **是**。G4 P5/P10/G-R4-4 与 GAP-RAG-02 仍列 R2 PREREQ 开（P-FAKE dual + ≠ 路由已生效）；≠ 伪关 R4。 |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm r2-p-fake-route-classify:prove` | **0** |
| `pnpm r2-classify-job-route-prereq:prove` | **0**（R2 NOT closed overall） |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0**（≠ R4） |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0**（≠ 题域已隔离） |
| `pnpm mysql-stack:m4-rag:prove` | **0**（§R2 文档门） |
| `pnpm r2-p-start-route-classify:prove` | **0**（前序真拒启仍绿；R2 余 P-FAKE dual） |

## 接线核验（摘要）

1. **Sole pin**：consumer 注释与实现强制 `createJobRouteModelClassify`；无内联 fake `modelClassify` / `classifyJobByRule`。
2. **Legitimate ≠ P-FAKE**：`rule_unique_leaf`（modelCalls=0）发生在已 MODEL-OP 绑定的 `classifyJobRoute` 内，不算假绿 Worker。
3. **假绿表持有**：规则-only Worker / rag03 绿 = 生产路由生效 / bind+snapshot = R2 关 → 一律驳回。
4. **仍开**：P-FAKE dual 收据（至双审齐）+ **≠ 路由已生效**（live harness 若要求仍缺则仍开）+ harness 同意；R4 不在本刀。

## 非宣称

禁止：R2 fully closed、路由已生效、P-FAKE dual-passed（单域自批）、R4 / 题域已隔离、wrong_track=0、HA、`releaseEvidence=true`、假绿关 R2/R4。

## 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-r2-p-fake-route-classify-mw-rag-route.md`
- 结论文件：`ai-docs/delivery/reviews/2026-09-16-r2-p-fake-route-classify-mw-rag-route.md`
- HEAD：`639134f`
