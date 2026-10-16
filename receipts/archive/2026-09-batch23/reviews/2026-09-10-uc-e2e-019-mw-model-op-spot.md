# 审查归档 — UC-E2E-019 账本/计费 spot · mw-model-op

**日期**：2026-09-10（PT）  
**结论**：**pass**（**partial ladder / spot**；**≠ covered**）  
**releaseEvidence=false** · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-019 covered

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm uc019:report-regenerate:prove` | **0** |

收据：`.tmp/isolated-proof-receipts/2026-09-10T08-25-46-197Z-790571-a606ef97-e6dc-4ff7-8a74-7c9f48169300.json`（`release_evidence=false`）  
fixture=`pgvector` → **R5 green-risk**（≠ sole-stack migrated）

## 核对项

### 1) requeue ∥ release 边界（G1/G2）
| 场景 | 结果 | 假绿？ |
|------|------|--------|
| G1 failed 上连点 `requeueFailedReport` | 首次 true→queued；二三次 false；额度不扣；consumption 仍 `confirmed` | **否**（partial 下） |
| G2 requeue ∥ `releaseConsumption` | release→`already_confirmed`；无 `released∧(queued\|running)`；额度不退 | **否** |

### 2) A3 refund-first GAP（G3）
- confirmed 上 release **无法**到 `released` → A3「退款先到→regen 拒」产品路径 **不存在**
- 打印 `GAP-UC019-REFUND-FIRST-ORDER`
- **诚实钉成立**；把 G3 EXIT=0 读成 A3 已闭环 → **假绿**

### 3) quarantined 禁 requeue
- poison→quarantined 后 `requeueFailedReport=false`
- 钉 `GAP-UC019-QUARANTINE-REGEN`
- **非假绿**：明确 BLOCKED，与 UC-011 R2 同口径；≠「quarantine 已可免费 regenerate」

### 4) 与 UC-011 D1 一致性
| D1 口径 | UC-011 | UC-019 spot |
|---------|--------|-------------|
| 报告失败默认不退 | R2 confirmed 不退 | G1/G2 confirmed 不退、额度不回补 |
| regenerate 免费（代理） | R2 regenerate→019 BLOCKED | G1 requeue 不扣费（failed→queued 代理） |
| quarantine 不可 requeue | R2 BLOCKED | G3 同钉 |

**裁定**：与 UC-011 D1 **一致**；未把「报告失败应退」写进 019。

## 仍缺（不挡本 spot pass；挡 covered）
- HTTP regenerate + `(interviewId, regenerateAttempt)` 产品幂等键（G4）
- A3 refund-first→released→regen 拒闭环
- quarantined 免费 regenerate 出口
- sole-stack 夹具（当前 pgvector R5）

## 对照
- harness：`ai-docs/delivery/harness/uc-e2e-019-report-regenerate.md`
- eval：`ai-docs/delivery/eval/uc-e2e-019-report-regenerate.eval.md`
- 需求：`e2e-scenarios.md` UC-E2E-019 · A1/A2/A3
- 关联：`reviews/2026-09-10-uc-e2e-011-mw-model-op-spot.md`
