# 评测证明 — UC-E2E-028 trace/账本失败不阻塞（honest gap / mark-red）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-028 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md`  
**对照矩阵行**：`UC-E2E-028`  
**旁证（cite ≠ covered）**：`report-bulkhead.proof.ts` · `releaseSharedAdmissionBestEffort` · `reqid:prove` / estimate-threading · `model-invocation-reconcile:prove`  
**待审专家**：`mw-e2e-ha` + `mw-model-op`

---

## 1. 用途

eval-first：交付 **可执行** 静态库存 + GAP mark-red（`apps/api` 文件扫描），**无 `MODEL_API_KEY`**。  
主钉：**S1–S5**（persistTrace 存在但同事务耦合；无 rewrite 队列；无 e2e；spec best-effort vs code）→ **G-GAP-***（FAIL-OPEN / RECON / TRUTH-BLOCK-E2E / INJECT）。  
对齐需求 TC：`TC-E2E-028-trace-fail` · `TC-E2E-028-recon` · `TC-E2E-028-truth-block`（本切片仅诚实钉缺席，**不**宣称 TC 已绿）。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered` 或假 `partial`-closed。矩阵保持 **gap**（honest）。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 report-bulkhead / admission best-effort / usage reconciler 冒充本 UC covered。

抬到 covered 的 HTTP/product 清单见 harness **§1b**（非本 eval 已关闭项）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc028:trace-fail-open:prove` | **0** | **0**（2026-09-10 ~02:03 PT；S1–S5+G-GAP 4 pins；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-03-13-606Z-…`；R5 banner 已印；GAP-UC028-FAIL-OPEN / RECON / TRUTH-BLOCK-E2E / INJECT） | S1–S5 + G-GAP 诚实钉 → 矩阵保持 **gap**；≠ covered；**green-risk / R5** |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-10 ~02:03 PT；含 uc-e2e-028 unit + matrix gap 钉） | harness+eval 引用矩阵行；≠业务 covered |
| report-bulkhead / `reqid:prove` | **0** | 旁证（既有） | 旁证 ≠ UC covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；静态 inventory（isolated 包装）
pnpm uc028:trace-fail-open:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| S1 | persistTrace + INSERT ai_invocation_trace | **否** |
| S2 | 同事务耦合；catch → external_outcome_unknown | 否（反证 fail-open 未接线） |
| S3 | 无 missing-trace rewrite/recon | 否 |
| S4 | e2e 无 UC-028 场景 | 否 |
| S5 | spec best-effort vs code；report-bulkhead 旁证 | 否 |
| G-GAP-1 | GAP-UC028-FAIL-OPEN | 否（EXIT=0≠闭环） |
| G-GAP-2 | GAP-UC028-RECON | 否 |
| G-GAP-3 | GAP-UC028-TRUTH-BLOCK-E2E | 否 |
| G-GAP-4 | GAP-UC028-INJECT | 否 |

**BLOCKED（仍 gap 于产品/E2E）**：见 harness §1b — persistTrace 旁路隔离、故障注入、对账补写、A3 对照 E2E、sole-stack 夹具。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-028 covered**
- [ ] 未把 report-bulkhead / admission best-effort / usage reconciler 冒充本 UC covered（旁证 ≠ covered）
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵保持 **gap**（honest；非假 covered / 非假 partial-closed）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] G-GAP EXIT=0 读作诚实钉，非 A1 fail-open 闭环
- [ ] harness §1b「抬到 covered 还缺」已列 HTTP/product 路径（非仅 GAP 标签）

## 5. 专家请回答

1. S1–S5 + G-GAP 是否足以支撑矩阵保持 **gap**（honest mark-red；仍明示 ≠ covered）？  
2. 下一刀应优先 **persistTrace 旁路拆事务**，还是先 **故障注入 harness**（在现耦合上证明「会阻塞」）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered / 仍 gap」明示；`mw-e2e-ha` + `mw-model-op`。
