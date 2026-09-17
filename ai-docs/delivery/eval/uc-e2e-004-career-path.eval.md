# 评测证明 — UC-E2E-004 career-path 全链路（honest gap / mark-red）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-004 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-004-career-path.md`  
**对照矩阵行**：`UC-E2E-004`  
**旁证（cite ≠ covered）**：`neg:interview` · `scor-00-honesty:prove` / domain `deriveCareerPath` · `report:prove` · `graph:prove` · `validate.ts` · web report GET  
**待审专家**：`mw-e2e-ha` + `mw-rag-route`（或 `model-op`）

---

## 1. 用途

eval-first：交付 **可执行** 静态库存 + GAP mark-red（`apps/api` 文件扫描），**无 `MODEL_API_KEY`**。  
主钉：**S1–S5**（HTTP 路由存在但=derive；无 career-path 图；无 GrowthTimeline 写；无 e2e 场景）→ **G-GAP-***（E2E-MAIN / GRAPH / GROWTH-A1A2 / FAIL-A3 / UNCERTAINTY）。  
对齐需求 TC：`TC-E2E-004-main` · `TC-E2E-004-fail` · `TC-E2E-004-uncertainty`（本切片仅诚实钉缺席，**不**宣称 TC 已绿）。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered` 或假 `partial`-closed。矩阵保持 **gap**（honest）。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 `report:prove` / `neg:interview` / domain derive 冒充本 UC covered。

抬到 covered 的 HTTP/product 清单见 harness **§1b**（非本 eval 已关闭项）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc004:career-path:prove` | **0** | **0**（2026-09-10 ~01:59 PT；S1–S5+G-GAP 5 pins；receipt `.tmp/isolated-proof-receipts/2026-09-10T08-59-34-929Z-…`；R5 banner 已印；GAP-UC004-E2E-MAIN / GRAPH / GROWTH-A1A2 / FAIL-A3 / UNCERTAINTY） | S1–S5 + G-GAP 诚实钉 → 矩阵保持 **gap**；≠ covered；**green-risk / R5** |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-10 ~01:59 PT；含 uc-e2e-004 unit + matrix gap 钉） | harness+eval 引用矩阵行；≠业务 covered |
| `pnpm report:prove` / `neg:interview` | **0** | 旁证（既有） | 旁证 ≠ UC covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；静态 inventory（isolated 包装）
pnpm uc004:career-path:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-004-career-path.proof.mjs`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| S1 | POST/GET career-path 路由存在 | **否** |
| S2 | generate=deriveCareerPath；无 AiGraphRun | 否 |
| S3 | 无 career-path 图文件；report 旁证在 | 否 |
| S4 | 无 GrowthTimeline 写；growth 不 join career_path | 否 |
| S5 | e2e 无 UC-004 场景 | 否 |
| G-GAP-1 | GAP-UC004-E2E-MAIN | 否（EXIT=0≠闭环） |
| G-GAP-2 | GAP-UC004-GRAPH | 否 |
| G-GAP-3 | GAP-UC004-GROWTH-A1A2 | 否 |
| G-GAP-4 | GAP-UC004-FAIL-A3 | 否 |
| G-GAP-5 | GAP-UC004-UNCERTAINTY | 否 |

**BLOCKED（仍 gap 于产品/E2E）**：见 harness §1b — e2e 主路径、LangGraph/ADR 降级、成长落点、A1 曲线维、A3 失败降级、不确定性闸、UI 触发、sole-stack 夹具。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-004 covered**
- [ ] 未把 `report:prove` / `graph:prove` / `neg:interview` / `validate.ts` / domain derive 冒充本 UC covered（旁证 ≠ covered）
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵保持 **gap**（honest；非假 covered / 非假 partial-closed）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] G-GAP EXIT=0 读作诚实钉，非 A1/A2/A3 闭环
- [ ] harness §1b「抬到 covered 还缺」已列 HTTP/product 路径（非仅 GAP 标签）

## 5. 专家请回答

1. S1–S5 + G-GAP 是否足以支撑矩阵保持 **gap**（honest mark-red；仍明示 ≠ covered）？  
2. 下一刀应优先 **e2e HTTP 主路径**，还是先 **ADR 降级承认 derive≠AiGraphRun** 再改写验收？  
3. 结论写入 `reviews/`，含「仍 ≠ covered / 仍 gap」明示；`mw-e2e-ha` + `mw-rag-route`（或 `model-op`）。
