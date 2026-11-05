# UC-031-032-STRUCTURE-01 · Arm-REJ（biz-reject 双联）收据 · 2026-11-06

- CMD：`pnpm uc031-032:structure:prove`（隔离壳 · 隔离 PG `pgvector/pgvector:pg16` 容器真迁移链）· **EXIT=0**（终态 fresh run 2026-11-05T17:21:48Z · 48 断言 0 FAIL 全卷口径 · 本臂 33 断言）
- proof：`apps/worker/test/uc-e2e-031-032-structure.proof.ts`（NON-UI · tsx 形）
- 场景映射：`TC-E2E-031-biz-reject`（`e2e-scenarios.md:406`）+ `TC-E2E-032-fabricate-reject`（`:422`）
- **release_evidence=false** · **est live=0**（零模型零网络零 key·DB=隔离壳本机 pgvector 容器非 live 非外呼）· **actualSpendCny=null**

## ① 越界分数（纯函数 · 12 断言）

- `aggregateScores`（`packages/domain/src/assessment.ts:31`）：`[-1]` / `[101]` / `[3.5]`（非整数）逐 fixture 拒，code 精确钉 `score_aggregate_invalid_input`（严格等值）×3 PASS
- 边界对照 `[0,100]` 合法域内通过=50（[0,100] 恰等边界自证）×1 PASS
- `DiagnosisSchema`（`apps/worker/src/interview-service.ts:195`（overall 边界）/:200（section score optional））：overall -1 / 101 拒 ×2；section score 101 / -1 拒 ×2；section score 缺省通过（optional 语义如实）×1；overall=72 边界内通过（schema 形自证）×1 —— 共 6 PASS
- `clampScore`（`packages/domain/src/growth.ts:33` 经 `deriveGrowth` 出口）：维度分 250→100、-5→0 上/下限行为如实记录 ×2 PASS（**记录≠放行证明**——clamp 是显示整形非校验闸，schema/分数域闸仍在）

## ② 捏造双腿（隔离 PG 真路径行为断言 · r2 裁定不降级静态钉 · 21 断言含夹具自证）

链路：scripted `ModelClient` 喂捏造输出 → `diagnosisGenerator`（`interview-service.ts:289`）→ `invoke` 全链（双闸住 `businessValidate` 闭包·`hasUngroundedNumber` `:274` 未导出纯函数直呼不可行）→ 消费者 `diagnosisDispatchTick` 隔离 PG 驱动 → `markDiagnosisJobFailed` 落 `diagnosis_job.last_error`。

- **夹具自证 ×5 PASS**：facts 非空；`MBA` 不接地；`限流/Redis` 接地；`99999` 不在任何锚文本；三夹具 schema 形恒等且**全部过 schema**（control 归因前提：拒绝不可能来自 schema）。
- **control 接地对照腿 ×5 PASS**：同形接地夹具全链跑通 `ready`+报告落库+`last_error` 恰 null+改写 refs 全接地+额度结算（扣 1.0 非泄漏）+invoke 关口留 trace 恰 1 行 → **拒绝归因于业务闸（refs 接地/数字接地）而非 schema**。
- **fabricated_experience 腿 ×7 PASS**：诊断标 failed；报告未落库；**`last_error === 'diagnosis:business:fabricated_experience'`（严格等值·非裸码钉·非 includes 松钉）**；`diagnosis_unavailable` 终态事件在；失败退款（预留额度退还）；拒绝输出不落 trace（invoke 只在校验通过时 persistTrace）；直驱 generator throw 消息同值精确钉。
- **fabricated_metric 腿 ×7 PASS**：同上七面，**`last_error === 'diagnosis:business:fabricated_metric'`（严格等值）**。
- 断言值组合规则：`interview-service.ts:309` `throw new Error('diagnosis:' + out.error)` × `packages/ai-runtime/src/invoke.ts:1168` `business:${validated.reason}` 包装——两腿两法（消费者 last_error + 直驱 generator throw）取码恰等。

## 诚实框

- **本臂=结构面收据**：只证「业务校验闸对捏造 fixture 行使为拒且不交付」，**≠不造假率**（归二期 ai-eval 判定指标）；**≠covered**（状态词零动·coveredCount=8 不变）；本绿≠全链路 E2E。
- 与既有覆盖关系（如实·不冒充新增）：`apps/worker/test/diagnosis.proof.ts` ⑤/⑤b 已断言同码 `status='failed'` 行为面、⑧⑨ 有 last_error code 精确钉先形——本 prove 复用其 helper 形不复制实现，增 UC-031/032 两臂框 + code 精确钉 + control 归因腿。
- **AUDIT-OBSERVATION: absent**（逐腿打印 ×2 + Arm-ESC ×1 共 3 处）— GuardrailHit 落库腿：产品零接线（全仓 0 emit 点·升格权在协调方）。TC 需求句「+GuardrailHit 落库」该腿不入断言、不造 stub、不冒充已实现。

## attempts 台账（全账如实 · Ban retry-to-green）

| # | EXIT | 根因 | 处置 |
|---|------|------|------|
| 1 | 1 | proof 查询面接线缺陷：`last_error` 误从 `resume_diagnosis` 取（该列在 `diagnosis_job`·先例 diagnosis.proof.ts ⑧ 即 `FROM diagnosis_job WHERE diagnosis_id=$1`）——零断言面被行使、零产品码触 | 改拆双查询（diagnosis 状态 + job last_error）·断言集修复后更强（加 `job.status==='failed'` 前件）·非迁就 |
| 2 | 0 | 48/48 PASS | — |
| final | 0 | 终态确认 fresh re-run（新容器·EXIT=0 · 48 PASS · 0 FAIL） | 输出留档 `/tmp/uc31-structure-prove-final.log`（机内）+ 卷 §9 读数 |

产品面 attempt 1 起零行为变更（product diff=0·全改动=proof/CMD 槽/壳注册/注记/收据）。
