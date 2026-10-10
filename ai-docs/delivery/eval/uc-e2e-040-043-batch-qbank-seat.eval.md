# 评测证明 — UC-E2E-040–043 B 端批匹配/题库/席位（honest batch-gap / mark-red）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-040–043 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-040-043-batch-qbank-seat.md`  
**对照矩阵行**：`UC-E2E-040–043`  
**旁证（cite ≠ covered）**：`e2e/full.e2e.ts` recruiting binding · `recruiting-bound.spec.ts` · `recruiter:prove` · `neg:bend` · `qbank-ingest`  
**待审专家**：`mw-e2e-ha` + `mw-privacy-int`（B-C）或 `mw-model-op`

---

## 1. 用途

eval-first：交付 **可执行** 静态库存 + GAP mark-red（`apps/api` 文件扫描），**无 `MODEL_API_KEY`**。  
主钉：**S1–S5**（recruiter 无 batch/seat/import；无 D4 表；qbank-ingest≠041；full.e2e 绑定旁证无 UC-040 TC；status-machine 未载 D4）→ **G-GAP-***（BATCH-PARTIAL / IMPORT-PARTIAL / DUAL-SIGN / SEAT-CAS / D4-STATUS / E2E）。  
对齐需求 TC：`TC-E2E-040-*` · `TC-E2E-041-*` · `TC-E2E-042-*` · `TC-E2E-043-*`（本切片仅诚实钉缺席，**不**宣称 TC 已绿）。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered` 或假 `partial`-closed。矩阵保持 **partial**（单岗位绑定）+ 批缺口 honest。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 full.e2e recruiting binding / recruiting-bound / qbank-ingest 冒充本行 covered。

抬到 covered 的 HTTP/product 清单见 harness **§1b**（非本 eval 已关闭项）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc040-043:batch-qbank-seat:prove` | **0** | **0**（2026-09-10 ~02:08 PT；S1–S5+G-GAP 6 pins；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-08-19-390Z-…`；R5 banner 已印；GAP-UC040-BATCH-PARTIAL / UC041-IMPORT / UC042-DUAL-SIGN / UC043-SEAT-CAS / D4-STATUS / E2E） | S1–S5 + G-GAP 诚实钉 → 矩阵保持 **partial** + batch gaps；≠ covered；**green-risk / R5** |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-10 ~02:08 PT；含 uc-e2e-040-043 unit + matrix partial 钉） | harness+eval 引用矩阵行；≠业务 covered |
| full.e2e binding / `recruiter:prove` | **0** | 旁证（既有） | 旁证 ≠ UC covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；静态 inventory（isolated 包装）
pnpm uc040-043:batch-qbank-seat:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-040-043-batch-qbank-seat.proof.mjs`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| S1 | recruiter jobs 有；无 batch/seat/import 路由 | **否** |
| S2 | 无 batch_job / seat_ledger / question_bank_item 表 | 否 |
| S3 | qbank-ingest ≠ UC-041；privacy partial_failed ≠ BatchJob | 否 |
| S4 | full.e2e / recruiting-bound 旁证；无 UC-040–043 TC | 否 |
| S5 | scenarios 定义 040–043；status-machine 未载 D4 | 否 |
| G-GAP-1 | GAP-UC040-BATCH-PARTIAL | 否（EXIT=0≠闭环） |
| G-GAP-2 | GAP-UC041-IMPORT-PARTIAL | 否 |
| G-GAP-3 | GAP-UC042-DUAL-SIGN | 否 |
| G-GAP-4 | GAP-UC043-SEAT-CAS | 否 |
| G-GAP-5 | GAP-UC040-043-D4-STATUS | 否 |
| G-GAP-6 | GAP-UC040-043-E2E | 否 |

**BLOCKED（仍 gap 于产品/E2E）**：见 harness §1b — D4 载重、BatchJob saga、题库导入、双签、席位 CAS、独立 e2e、sole-stack 夹具。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-040–043 covered**
- [ ] 未把 full.e2e recruiting binding / recruiting-bound / qbank-ingest 冒充本行 covered（旁证 ≠ covered）
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵保持 **partial**（单岗位）+ 批/导入/席位 **gap**（honest；非假 covered / 非假 partial-closed）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] G-GAP EXIT=0 读作诚实钉，非 A1 批/导入/席位闭环
- [ ] harness §1b「抬到 covered 还缺」已列 HTTP/product 路径（非仅 GAP 标签）

## 5. 专家请回答

1. S1–S5 + G-GAP 是否足以支撑矩阵保持 **partial** + 批缺口 honest（仍明示 ≠ covered）？  
2. 下一刀应优先 **D4 状态机载重裁决**，还是先 **BatchJob partial_failed 最小 HTTP**（在 D4 合同后）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered / 批缺口仍 gap」明示；`mw-e2e-ha` + `mw-privacy-int`（B-C）或 `mw-model-op`。
