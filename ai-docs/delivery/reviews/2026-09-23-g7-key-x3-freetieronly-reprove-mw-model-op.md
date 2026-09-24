# PRE-EXEC · mw-model-op · G7 Key×3 FreeTierOnly re-prove（Line C）

**Verdict**: **PASS**  
**Role**: `mw-model-op`（独立审阅 · Ban 实现方自批）  
**Date**: 2026-09-23 (~20:40 PT)  
**Tip**: `d75867272ae8e947c35831219358d185a5f0c7bf`（短 `d758672`）  
**Branch**: `feat/mysql-schema-skeleton`  
**Kind**: docs-only L0 REQUEST · **≠ coding** · **≠ prove** · **≠ fixed** · Dual PASS ≠ authorize coding  
**releaseEvidence=false** · **haStatus=NOT_HA** · **claimProductionHA=false** · residual **OPEN** · EXIT **1/1/1** retained  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

---

## 结论（一句话）

本 tip 为 **诚实的 docs-only re-prove REQUEST**：未宣称代码已实现 free-first / ¥5 cap / deepseek-v4-pro 禁令；明确 Ban 静默 fallback、Ban 跨模型洗证、ASR gap 登记为 BLOCKED/PREREQ；费用为 console-reported 估计且 **Ban 伪造**。因此 **PASS**。执行前 blockers 见下（须 coding/授权/控制台，不得假绿）。

---

## Proves 已跑（静态 · 无 live model · 不花钱）

| CMD | EXIT | 读 |
|-----|------|-----|
| `pnpm eval-harness-matrix-cite:prove` | **0** | 矩阵 cite 静态 proof · ≠ G7 trio · ≠ suite green · ≠ residual closed |
| `pnpm e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` | **not_run** | 需 Key/网络/可能计费 · L0 Ban paid API |
| Bailian 控制台实际花费核对 | **unavailable** | 本审阅者无控制台访问 · 不得伪造 actual spend |

无独立 `g7-*-freetieronly*:prove` 静态脚本；未发现其它仅本地、零网络的 G7 FreeTierOnly 专用 prove。

---

## 问题 1–5（证据）

### 1. free-first / paid-fallback 是否在代码路径？Fallback 是否记原因？校准/成本治理风险？

**答：今日仅 docs 计划，代码路径未实现 FreeTierOnly→paid 的 free-first 画像。**

证据：
- Harness §2 / §4.3 明示本 L0 **零 coding**；fallback 事件字段为「计划」。
- `text-endpoint-config.ts`：`MODEL_NAME` 缺省 `qwen-plus`；`MODEL_ENDPOINT_PROFILE` 缺省 `deepseek-cn-public`。
- `docker/env/worker.env.example`：`MODEL_NAME=deepseek-v4-pro` · `MODEL_FAST_NAME=deepseek-v4-flash`（与测试 Ban 冲突，docs 已诚实指出「须显式钉 Bailian 名」）。
- `failover-model.ts`：预派发 endpoint failover（prepare not-ready→backup），**不是** FreeTierOnly 触发的 free→paid，亦无 `triggerErrorClass`/`fromModel`/`toModel` 字段。
- 全仓 `*.{ts,js,mjs}` **无** `FreeTierOnly` / `free-first` / `fromModel`/`toModel`/`triggerError` 实现命中。
- `scripts/e2e-live-capability-env.mjs`：仅在 Key set 且 profile unset 时钉 `dashscope-cn-beijing`，**无** free-first 画像。

校准 / 成本治理：
- 无符号名 `enforceCalibratedDispatchBudget`；相关为 `planDispatchBudget`（`context-budget.ts`）+ `refineEstimate`（校准因子 PK 含 **model**）。
- 切换到 `qwen3.8-*` 时：若误套另一模型校准因子会错标预算；因子按 `(owner,service,model,estimator,…)` 键控，**不得跨模型复用**。
- `model-cost-governance.ts` enforce 模式要求 `*_BILLING_MODEL` + price book 绑定；缺价或模型名与计费绑定不一致 → startup/`cost_*` fail-closed（可能挡住或误标，非静默成功）。

Docs **Ban 静默 fallback**（§2.3 · NHP-G7-FT-01）——计划诚实，**代码尚未承重**。

### 2. Per-call 实际模型记录？可行性？已有列？

**答：今日 e2e/isolated receipt 顶层无 actualModel；DB 侧有 model 绑定但 ≠ e2e receipt 字段。**

证据：
- `scripts/local-e2e-receipt.mjs`：`writeLocalE2EReceipt` / `writeLocalIsolatedReceipt` 字段含 outcome/exitCode/sourceDigests/… · **无** `model` / `actualModel` / `MODEL_NAME`。
- Harness §2.4 + `GAP-E2E-RECEIPT-PER-CALL-MODEL` 与此一致。
- `ai_model_invocation` 基表无独立 `model` 列；计费路径 `ai_cost_reservation(provider, model, …)` 与 claim 绑定参数 `p_model`（migrations 0033/0088/0130）**可**记录意图/计费模型。
- `ai_model_admission_policy.model_or_recipe` 为 recipe 名（`planner`/`questioner`…），**不是** Bailian 实际模型 id。
- `ai_model_fee_ledger.model_or_recipe` 同维。

可行性：授权后在 runner/receipt 写入 `actualModel`（+ fallback 事件）；prove 可用静态 receipt schema prove +（授权后）isolated 路径抽查 JSON keys。DB reservation/ledger 可作旁证，**不能**替代 e2e receipt per-call 字段（success 准则 §4.2）。

### 3. ¥5 cap · 实际花费 · deepseek-v4-pro Ban：代码还是 docs？

**答：¥5 per-run ceiling 与 deepseek-v4-pro 测试 Ban 今日均为 docs/计划；代码无 cap、无 denylist。**

证据：
- Harness §2.5 · NHP-G7-FT-07 · `GAP-G7-BAN-DEEPSEEK-V4-PRO-TEST` / `GAP-G7-COST-RECEIPT-PRE-POST` 明确后续 coding。
- `rg` apps/worker/packages/ai-runtime/scripts：无 `ALLOW_DEEPSEEK` / denylist / ¥5 spend cap。
- 相反：`worker.env.example` **默认** `deepseek-v4-pro`；proof 接受该名（`text-endpoint-config.proof.ts`）。
- Admission 表按 recipe allow/block，**不**按 `deepseek-v4-pro` 字符串禁测。
- **Actual spend**：审阅者 **无百炼控制台访问** → unavailable · Ban 伪造（同意 docs）。单价表标注 `console-reported by user via coordinator 2026-09-23` · 本刀未独立核价。

### 4. Capability honesty？

**答：是。** Harness §3 明确：免费模型只证明 wiring/auth/contract/fail-closed 形状；**不**证明质量/延迟/成本代表性/qwen-plus parity/SLO/HA；**Ban** 跨模型引用证据。NHP-G7-FT-06 · `GAP-G7-CROSS-MODEL-EVIDENCE-BAN` 一致。

### 5. `qwen-audio-turbo-latest` 缺口是否诚实？

**答：是（BLOCKED/PREREQ 风格 · 非假绿）。**

证据：
- 代码缺省：`voice.ts` · `DASHSCOPE_ASR_MODEL ?? 'qwen-audio-turbo-latest'`；`docker/env/{worker,api}.env.example` 同名。
- Harness §5 + `GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS`：不在用户配额列表 · 公开文档「仅免费体验、不支持付费」· **不适合**生产 ASR 证据 · paid 路径未钉 until gap。

---

## REQUEST stub 五项同意？

| # | Stub 问 | 本审 |
|---|---------|------|
| 1 | 冻结 trio + EXIT 1/1/1 FreeTierOnly 根因 scoped | **同意**（cite FIX receipt / `a4e3de5` / `5f591ea`） |
| 2 | free-first 映射 · paid 仅 qwen-plus/flash · Ban pro · ¥5 · console actual | **同意为计划**；**不同意**「代码已落实」 |
| 3 | 今日 receipt 无 per-call model · 后续 coding · 本 tip 零 coding | **同意** |
| 4 | ASR 免费体验-only + gap | **同意** |
| 5 | Dual PASS ≠ coding · Ban假绿 · pins · residual OPEN | **同意** |

---

## Blockers（执行前 must-fix）

1. **Standing authorize** 后 coding（Dual PASS ≠ coding）：至少覆盖  
   - free-first 画像钉死 / 或 operator 显式 env（Ban 静默 mid-run 换模）  
   - fallback 事件字段（`triggerErrorClass`/`fromModel`/`toModel`/…）  
   - receipt **per-call `actualModel`**（关 `GAP-E2E-RECEIPT-PER-CALL-MODEL`）  
   - **deepseek-v4-pro 测试拒绝路径**（关 `GAP-G7-BAN-DEEPSEEK-V4-PRO-TEST`；注意 example 默认即 pro）  
2. **计费绑定对齐**：`MODEL_NAME`/`MODEL_FAST_NAME` 与 `*_BILLING_MODEL` + `ai_cost_price_book` 行一致；缺价不得假绿。  
3. **校准纪律**：切换模型不得复用他模 `CalibratedFactor`；必要时无校准或按新 model 重建。  
4. **ASR**：`GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS` 未关前，ASR 路径标 skip/PREREQ · Ban 当生产证据。  
5. **成本**：pre-run 估计写入 receipt · post-run **仅**百炼控制台 actual · Ban 伪造；碰 ¥5 ceiling / 月 80% 告警则停。  
6. **冻结 trio** 仅在授权 +（如需）coding commit 后于 **已提交 SHA** 新鲜跑；prior EXIT 1/1/1 retained until then。  
7. Ban 跨模型 cite · Ban 读 `.env*` · Ban Meridian · Ban 改共享 SSOT / Line A·B。

## Non-blockers

- 本 tip docs 诚实性（residual OPEN · Ban假绿 · zero prove）  
- `pnpm eval-harness-matrix-cite:prove` EXIT=0（旁证矩阵纪律 · ≠ G7 关闭）  
- Capability honesty / ASR gap / cost Ban-伪造 文案已在 harness  
- Pins（含 PG-retained）与 REQUEST 一致  

---

## Non-claims

Not fixed · not coding authorized · not suite/family green · not G6/R5 closed · not HA · not `releaseEvidence=true` · Dual PASS ≠ coding ≠ 已修好 · EXIT 1/1/1 retained · FreeTierOnly residual **OPEN** · 用户关「用完即停」≠ residual closed · 无 actual spend（控制台不可用）· Ban 伪造费用

---

*mw-model-op PRE-EXEC · G7 Key×3 FreeTierOnly re-prove · tip d75867272ae8e947c35831219358d185a5f0c7bf · branch feat/mysql-schema-skeleton · PASS · blockers listed · releaseEvidence=false · NOT_HA · PG-retained · 2026-09-23 ~20:40 PT*
