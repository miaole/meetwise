# 审查归档 — UC-E2E-031/032 MODEL-OP/安全 spot · mw-model-op

**日期**：2026-09-10（PT）  
**结论**：**pass**（**honesty pin / spot**；矩阵 **gap(e2e)/partial(eval)**；**≠ covered**）  
**releaseEvidence=false** · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-031/032 covered

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm uc031-032:injection-jailbreak:prove` | **0** |

收据：`.tmp/isolated-proof-receipts/2026-09-10T09-18-06-705Z-934477-cbb09141-72c6-4465-9caf-52f2a2eec706.json`（`release_evidence=false`）  
fixture=`pgvector` → **R5 green-risk**

## 核对项

### 1) 禁 e2e 假模型
| 断言 | 结果 |
|------|------|
| S2 e2e 不得借 fake-model 宣称 031/032 | PASS |
| S4 fake-model forbid guards | PASS |
| `GAP-UC031-032-FAKE-MODEL-BAN` | 已打印 |

**裁定**：**禁令成立**。用 `E2E_FAKE_MODEL` / fake jailbreak pass 冒充 model-resist / no-fabricate → **假绿**（本 prove 明确拒绝该叙事）。

### 2) golden / ai-eval 旁证 ≠ covered
| 断言 | 结果 |
|------|------|
| S3 旁证路径库存（golden-tasks / scoring:eval 等） | PASS |
| S1 需求层分流：model-resist / no-fabricate → **ai-eval** | PASS |
| NOTE 旁证列表 | golden-tasks · scoring:eval · TC-AIIV-002 · TC-RES-012 · TC-quiz-078 · safety-defense-in-depth · E2E_FAKE_MODEL forbid |

**裁定**：旁证可支撑 **partial(eval)** 库存，**≠** UC-E2E-031/032 **covered**；抬 covered 须 ai-eval suite + release-gate（非 e2e）。

### 3) GAP 诚实
打印 6 钉：`GAP-UC031-E2E-STRUCTURE` · `GAP-UC031-AI-EVAL` · `GAP-UC032-FABRICATE-REJECT` · `GAP-UC032-AI-EVAL` · `GAP-UC031-032-FAKE-MODEL-BAN` · `GAP-UC031-032-GUARDRAIL`  
S5 矩阵 gap(e2e)/partial(eval)；S6 GuardrailHit 目标 vs unwired。

**裁定**：**诚实钉成立**。EXIT=0 = honesty pin，**≠** fake jailbreak pass，**≠** covered。

## 矩阵
保持 **gap(e2e) / partial(eval)**。禁止升 covered。

## 仍缺（挡 covered；不挡本 honesty spot）
- e2e/integration：DOM escape / biz reject / GuardrailHit 运行时表
- ai-eval：生产模型 injection resist + no-fabricate + release-gate 阈值
- GuardrailHit append-only 审计表/API（现=0）

## 对照
- harness：`ai-docs/delivery/harness/uc-e2e-031-032-injection-jailbreak.md`
- eval：`ai-docs/delivery/eval/uc-e2e-031-032-injection-jailbreak.eval.md`
- 需求：`e2e-scenarios.md` UC-E2E-031 · UC-E2E-032
