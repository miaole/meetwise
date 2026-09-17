# 审查归档 — UC-E2E-028 账本/计费 spot · mw-model-op

**日期**：2026-09-10（PT）  
**结论**：**pass**（**honest gap / mark-red spot**；矩阵保持 **gap**；**≠ covered**；**≠ partial-closed**）  
**releaseEvidence=false** · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-028 covered

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm uc028:trace-fail-open:prove` | **0** |

收据：`.tmp/isolated-proof-receipts/2026-09-10T09-04-08-101Z-889142-3a47b72f-9a88-4379-b33b-bb3713e21191.json`（`release_evidence=false`）  
fixture=`pgvector` → **R5 green-risk**

## 核对项

### 1) persistTrace ↔ settle 同事务耦合（S1/S2）
| 断言 | 结果 |
|------|------|
| S1 `persistTrace` + INSERT `ai_invocation_trace` 存在 | PASS |
| S2 与 `settleAiTextCost` / `completeModelInvocation` **同事务**；失败 → `external_outcome_unknown` | PASS |
| 无 `.catch` fail-open 旁路包装 | PASS（耦合仍在） |

**裁定**：耦合属实。当前行为是 **fail-closed（写失败拖累成功路径）**，**不是**需求 A1 的 fail-open。

### 2) fail-open GAP 是否假绿（G-GAP）
打印并钉住：
- `GAP-UC028-FAIL-OPEN`（A1 / TC-E2E-028-trace-fail）
- `GAP-UC028-RECON`（A2；usage-calibration-reconciler ≠ UC-028 recon）
- `GAP-UC028-TRUTH-BLOCK-E2E`（A3 对照 E2E 缺）
- `GAP-UC028-INJECT`（无故障注入 harness）

**裁定**：**诚实钉成立**。EXIT=0 = mark-red honesty，**≠** A1 fail-open 闭环。若读成 covered / partial-closed /「trace 失败不阻塞已通」→ **假绿**。

### 3) report-bulkhead 旁证 ≠ covered
prove NOTE 明确旁证列表：`report-bulkhead` · `releaseSharedAdmissionBestEffort` · `reqid/estimate-threading` · `model-invocation-reconcile` **≠** UC-028 fail-open。  
**裁定**：与 harness 假绿表一致；旁证绿不得冒充本 UC。

## 矩阵
保持 **gap**（honest）。禁止升 partial-closed / covered。

## 仍缺（挡产品闭环；不挡本 honesty spot）
1. persistTrace 与 settle/complete **分事务** best-effort 旁路  
2. 故障注入：trace 写失败下 interview completed + consumption confirmed  
3. missing-trace rewrite / recon 队列（≠ usageCalibrationReconciler）  
4. A3 对照 E2E：业务真相失败必须阻塞 vs trace 失败不得阻塞  

## 对照
- harness：`ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md`
- eval：`ai-docs/delivery/eval/uc-e2e-028-trace-ledger-fail-open.eval.md`
- 需求：`e2e-scenarios.md` UC-E2E-028 · A1/A2/A3
