# Harness — G7 · **Key×3 FreeTierOnly re-prove**（Line C · L0 docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs only · **zero coding** · **zero prove** · **Ban自批 pass** · Dual PASS ≠ coding ≠ authorize prove ≠ suite green ≠ residual closed）  
**Date**: 2026-09-23 (~20:35 PT)  
**Line**: **C**（G7 Key×3 FreeTierOnly residual re-prove · **不得**触碰 Line A UC-018 / Line B UC-E2E-050–052 文件 · **不得**改共享 SSOT · 新 gap **仅**登记本刀 docs）  
**releaseEvidence=false** · **≠HA** · **haStatus=NOT_HA** · **claimProductionHA=false** · **≠ suite green** · **≠ fixed** · **≠ coding authorized** · **Ban假绿** · **未洗绿** · **Ban claim fixed without fresh EXIT** · **Dual PASS ≠ coding** · **EXIT 1/1/1 retained until fresh prove**  
**Pins**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false`  
**Experts（dual）**: **`mw-model-op` + `mw-e2e-ha`**（pre-exec dual · Ban self-approve · Ban implementer writing pass）  
**Prior residual honesty**: `harness/g7-key-x3-freetieronly-residual.md` · **`post_prove_dual_pass`** · dual on **`5897984`** · residual **OPEN** · **retained**  
**Prior FIX honesty**: `harness/g7-key-x3-fix-iso-ui-perf.md` · **`post_prove_dual_pass:honesty_red`** · dual on **`a4e3de5`** · tip **`5f591ea`** · EXIT **1/1/1** · **retained**  
**Slice**: `../g7-key-x3-freetieronly-reprove.slice.md`  
**Eval**: `../eval/g7-key-x3-freetieronly-reprove.eval.md`  
**REQUEST stubs**: `../reviews/REQUEST-2026-09-23-g7-key-x3-freetieronly-reprove-mw-{model-op,e2e-ha}.md`  
**Authority**: meetwise — L0 REQUEST open only · Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · Ban force-push · Ban paid API prove this step · Ban cross-model evidence wash  
**Honesty**: 用户已在百炼关闭部分模型「用完即停」≠ residual 已关 · 本刀 **未跑** 冻结 trio · **未**宣称 EXIT=0 · FreeTierOnly residual **仍 OPEN** 直至 **新** CMD+EXIT 证据

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | L0 docs REQUEST：在用户百炼配额动作之后，为 Key×3 FreeTierOnly residual 开 **re-prove** 计划（free-first · paid fallback · capability honesty · NHP · gaps） |
| **本刀不是什么** | **不是** coding · **不是** prove · **不是** 宣称 fixed · **不是** suite green · **不是** 把 prior honesty_red / residual dual_pass 洗成绿 |
| Prior FIX / residual dual_pass ⇒ residual closed？ | **否** — Dual PASS ≠ 已修好 · EXIT **1/1/1** retained |
| 用户关闭「用完即停」⇒ FreeTierOnly residual closed？ | **否** — 仅改变 provider 侧账单路径；关闭 residual **必须** 新鲜 EXIT=0 证据 |
| 免费模型绿 ⇒ 生产模型 / qwen-plus 证据？ | **Ban** — 禁止跨模型引用证据（例：禁止把 qwen3.8-* 结果写成 qwen-plus 证据） |
| 本步跑 paid API？ | **Ban** — L0 docs only · zero prove |

---

## 1. 冻结 Key×3 trio（G7）· 为何 EXIT=1

| # | CMD（`package.json` 实存） | Prior EXIT | 诚实读（cite） |
|---|----------------------------|------------|----------------|
| 1 | `pnpm e2e:isolated` | **1** | Key **set** · live chat **403 `AllocationQuota.FreeTierOnly`** · `questions=0` · `interview_unavailable` / `generation_provider_not_configured` · `failureClass=api` · **R5-MARKED-RED** · ≠ family green |
| 2 | `pnpm e2e:ui:isolated` | **1** | Key **set** · 10 passed / 2 failed / 10 skipped · recruiting-bound timeout（live 出题被同一配额挡住）· stream/golden partial · chromium ran ≠ UI green |
| 3 | `pnpm verify:e2e-performance` | **1** | migrate PASS 后 **HTTP full E2E** fail · ≠ SLO ≠ LOAD ≠ HA ≠ suite green |

**证据 cite（已找到）**：

| Artifact | SHA / path | 作用 |
|----------|------------|------|
| FIX receipt | `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md` | 叙事 403 FreeTierOnly · EXIT **1/1/1** · NEW_SHELL_STATUS=set |
| Prove / dual SHA | **`a4e3de5`**（full `a4e3de583942fb641acb7cf545709f4124034b86`） | FIX coding+prove land · post-prove dual BOTH PASS → honesty_red |
| Tip at dual | **`5f591ea`** | pin receipt to prove SHA |
| FIX harness / slice / eval | `harness/g7-key-x3-fix-iso-ui-perf.md` · slice · eval | status **`post_prove_dual_pass:honesty_red`** |
| Residual docs nail | dual on **`5897984`** · `harness/g7-key-x3-freetieronly-residual.md` | residual **OPEN** · O1/O2/O3 not selected · prove `not_run:no_coding_authorize` |
| Prior re-run（A″） | `receipts/2026-09-17-g7-key-x3-rerun.md` · dual on **`e697c81`** | EXIT 1/1/1 honesty_red · **retained** · ≠ wash into fixed |

**根因（retained）**：授权 Key 已 set，但 DashScope/百炼对当时文本模型返回 **403 `AllocationQuota.FreeTierOnly`** → fail-closed → trio 全红。**Key set ≠ suite green**。

**Key 纪律**：ONLY `source /home/box/.meetwise-secrets/load-model-api-key.sh` · 值 **永不**打印 / echo / commit · 身份需要时写 **fingerprint only（e.g. sha256 prefix computed at run time）** · **本步不计算** · **永不**读 `.env*`。

---

## 2. 模型画像计划（free-first · paid fallback）

### 2.1 用户侧上下文（coordinator · 非本刀执行）

- **已关「用完即停」→ 余额按量**（可付费）：`qwen-plus` · `qwen-turbo` · `qwen-max` · `qwen-vl-max` · `qwen-vl-plus` · `qwen-tts` · `paraformer-realtime-v2` · `text-embedding-v4` · `gte-rerank-v2` · `deepseek-v4-pro` · `deepseek-v4-flash`
- **仍「用完即停」开 · 不可计费**（免费额度优先试跑）：`qwen3.8-flash` · `qwen3.8-max` · `qwen3.8-27b` · `qwen3.8-omni-flash` · `qwen3.7-flash`（约各 1M tokens）
- **`qwen-audio-turbo-latest`（`DASHSCOPE_ASR_MODEL`）不在百炼配额列表** → 见 §5 + **`GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS`**
- **策略（coordinator 成本约束 2026-09-23）**：测试优先 **免费 qwen3.8-***；paid fallback **仅允许** `qwen-plus` 或 `deepseek-v4-flash`；**Ban `deepseek-v4-pro`** 用于测试跑（除非显式用户批准 flag 已记录）；每条 receipt **必须**记录 **实际** per-call model name + **实际花费**（控制台/用量 · Ban 伪造）；**Ban** 把 qwen3.8 结果写成 qwen-plus 证据
- **月预算**：账户 ¥200/月 · 告警阈值 80%（¥160）· 单次 re-prove ceiling 见 §2.5（远低于预算）

### 2.2 角色 → 免费候选 / 付费回退

| 角色 | Env var（NAME only） | 代码消费位置 | 本地设置位置（path only） | 免费候选（用完即停仍开） | 付费回退（已关用完即停） | 备注 |
|------|----------------------|--------------|---------------------------|--------------------------|--------------------------|------|
| chat / primary | `MODEL_NAME` | `packages/ai-runtime/src/text-endpoint-config.ts` · `apps/worker/src/model-cost-governance.ts` · `apps/worker/src/interview-service.ts` | `docker/env/worker.env.example`（模板）· 运行时：operator shell / compose 派生 env · Key：`/home/box/.meetwise-secrets/load-model-api-key.sh` | `qwen3.8-flash` 或 `qwen3.8-max` | **仅** `qwen-plus` 或 `deepseek-v4-flash` | 代码缺省 `qwen-plus`；example 模板现为 deepseek-* · **re-prove 须显式钉 Bailian 名** |
| fast | `MODEL_FAST_NAME` | `apps/worker/src/model-cost-governance.ts` · `interview-service.ts` · `apps/worker/smoke/adaptive-attack.ts` | 同上 worker example | `qwen3.8-flash` / `qwen3.7-flash` | **仅** `qwen-plus` 或 `deepseek-v4-flash` | 代码缺省 `qwen-turbo` |
| backup chat | `MODEL_BACKUP_NAME` | `text-endpoint-config.ts` · `model-cost-governance.ts` | worker example | （可选同免费族） | **仅** `qwen-plus` 或 `deepseek-v4-flash` | fallback 路径 |
| backup fast | `MODEL_FAST_BACKUP_NAME` | `model-cost-governance.ts` · `interview-service.ts` | worker example | （可选） | **仅** `qwen-plus` 或 `deepseek-v4-flash` | |
| endpoint profile | `MODEL_ENDPOINT_PROFILE` | `text-endpoint-config.ts` · `scripts/e2e-live-capability-env.mjs` | worker example · e2e live helper 在 key set 且 profile unset 时钉 `dashscope-cn-beijing` | n/a | n/a | Key set 时须与 Bailian 一致 · Ban DeepSeek default vs Bailian key 错配 |
| embedding | `DASHSCOPE_EMBED_MODEL` | `packages/ai-runtime/src/embedder.ts` | worker example | **无**（用户免费列表无 embedding 等价） | `text-embedding-v4` **paid only** | 代码缺省 `text-embedding-v4` |
| rerank | `DASHSCOPE_RERANK_MODEL` | `packages/ai-runtime/src/reranker.ts` | worker example | **无** | `gte-rerank-v2` **paid only** | 代码缺省 `gte-rerank-v2` |
| ASR（batch） | `DASHSCOPE_ASR_MODEL` | `packages/ai-runtime/src/voice.ts` | `docker/env/worker.env.example` · `docker/env/api.env.example` | 现状默认 `qwen-audio-turbo-latest` · **状态可疑**（§5） | 候选：`paraformer-realtime-v2`（流式族）/ Omni 路线 · **待 gap 关闭后选定** | **paid-capable 路径未钉** until gap |
| TTS | `DASHSCOPE_TTS_MODEL` | `voice.ts` | worker / api example | **无** | `qwen-tts` **paid only** | 代码缺省 `qwen-tts` |
| VL | `DASHSCOPE_VISION_MODEL` | `vision-endpoint-config.ts` | worker example · compose | **无**（免费列表无 VL） | `qwen-vl-max` / `qwen-vl-plus` **paid only** | 代码缺省 `qwen-vl-max` |
| stream ASR | `DASHSCOPE_STREAM_ASR_MODEL` | `voice-stream.ts` | worker example | **无** | `paraformer-realtime-v2` **paid only** | 缺省 `paraformer-realtime-v2` |
| stream TTS | `DASHSCOPE_STREAM_TTS_MODEL` | `voice-stream.ts` | worker example | **无** | paid TTS 族 | 缺省 `cosyvoice-v1` |

**显式钉**：embedding / rerank / ASR(待定) / TTS / VL / stream-* **在用户免费额度列表中无对等免费模型** → 这些角色 **paid only**（或 capability skip），不得假装有免费等价。


### 2.5 成本约束 · 单价（console-reported）· 单次估计

**来源**：百炼控制台单价由用户经 coordinator 报告（**2026-09-23**）· **本刀未独立核价** · cite: `console-reported by user via coordinator 2026-09-23`。

| 模型 | 输入 ¥/1M tokens | 输出 ¥/1M tokens | 备注 |
|------|------------------|------------------|------|
| `deepseek-v4-pro` | 12 | 24 | **测试跑 Ban**（无显式用户 OK / approval flag） |
| `deepseek-v4-flash` | 1 | 2 | 允许的 paid fallback 之一 |
| `qwen-plus`（≤128k） | 0.8 | 2 | 允许的 paid fallback 之一 |
| `qwen-turbo` | 0.3 | 0.6 | **非**本刀测试 paid-fallback allowlist（免费优先失败后不选它作 fallback） |
| `qwen-max` | 2.4 | 9.6 | **非**本刀测试 paid-fallback allowlist |
| `qwen-vl-max` | 1.6 | 4 | VL paid-only（若本 trio 触达） |
| `text-embedding-v4` | 0.5（无单独 out） | — | embed paid-only |
| `paraformer-realtime-v2` | ¥0.00024 / 音频秒 | — | ASR 候选（若启用） |

**测试跑 allowlist**：
1. **优先**：免费 `qwen3.8-*`（用完即停仍开）  
2. **Paid fallback ONLY**：`qwen-plus` **或** `deepseek-v4-flash`  
3. **Ban `deepseek-v4-pro`**：runner/证明路径必须拒绝，除非 receipt 记录显式批准 flag（计划名例：`ALLOW_DEEPSEEK_V4_PRO_TEST=1` + 用户 OK cite）· 见 **NHP-G7-FT-07**  
4. Pre-run 必须写成本估计 · Post-run 必须录 **控制台实际花费** · **Ban 伪造**

#### 单次冻结 trio re-prove · token 假设（保守 · 文档用）

| CMD | Chat in tokens（假设） | Chat out tokens（假设） | Embed tokens（假设） | ASR 秒（假设） |
|-----|----------------------|------------------------|---------------------|---------------|
| `pnpm e2e:isolated` | 80,000 | 25,000 | 50,000 | 0（voice skip unless keys） |
| `pnpm e2e:ui:isolated` | 60,000 | 20,000 | 20,000 | 0 |
| `pnpm verify:e2e-performance` | 100,000 | 35,000 | 50,000 | 0 |
| **合计（worst）** | **240,000** | **80,000** | **120,000** | **0** |

#### 费用上界（若 **全部** chat 落入 paid fallback）

| 画像 | Chat 费计算 | Embed 费 | **估计合计** |
|------|-------------|----------|--------------|
| 全免费 qwen3.8-*（额度内） | ¥0（免费额度） | embed 仍可能 paid：120k×0.5/1M = **¥0.06** | **≈ ¥0.06**（+ 免费额度消耗） |
| 全 fallback → `qwen-plus` | 240k×0.8/1M + 80k×2/1M = 0.192 + 0.160 = **¥0.352** | **¥0.06** | **≈ ¥0.41** |
| 全 fallback → `deepseek-v4-flash` | 240k×1/1M + 80k×2/1M = 0.240 + 0.160 = **¥0.40** | **¥0.06** | **≈ ¥0.46** |
| **禁** 全 fallback → `deepseek-v4-pro` | 240k×12/1M + 80k×24/1M = 2.88 + 1.92 = **¥4.80** | **¥0.06** | **≈ ¥4.86**（**Ban 无批准**） |

**本刀 per-run ceiling（授权 prove 时）**：**¥5.00**（远低于月预算 ¥200 · 80% 告警线 ¥160）。  
若估计或累计月耗接近告警线 → **停跑** · 向用户确认。  
**Actual spend**：每次跑完由用户/控制台用量录入 receipt · **Ban 伪造** · 本 L0 **未跑** → 无 actual。


### 2.3 Fallback 触发规则（禁止静默）

1. **仅**在下列错误类触发 paid fallback（须记入 receipt）：`AllocationQuota.FreeTierOnly` · quota-exhausted / 免费额度耗尽 · capability-unsupported（模型名不存在/已下线）  
2. **禁止**静默 fallback · **禁止**把 fallback 模型名写成「原计划模型」  
3. Fallback 事件字段（计划）：`triggerErrorClass` · `fromModel` · `toModel` · `atCallId` · timestamp  
4. Key 身份：fingerprint only（runtime 计算）· 本 L0 **不计算**

### 2.4 Per-call model 记录（今日状态 + 后续 coding）

| 问 | 答 |
|----|-----|
| 今日 e2e receipt 是否记录 per-call model name？ | **否** — 抽查 `.tmp/e2e-receipts/*.json` top-level keys 无 `model` / `actualModel` / `modelName` / `MODEL_NAME` |
| FIX receipt 是否逐 call 记模型？ | **否** — 仅叙事 FreeTierOnly · 未列 per-call model |
| 本 L0 是否改代码？ | **否** — 列为后续 coding step（授权后）：runners/receipts 写入 **实际** model per call |
| 成功准则（未来 prove） | 每条 model 调用的 receipt 含实际 model 字符串 · 与 env 意图一致或显式记录 fallback |

---

## 3. Capability honesty（免费替换证明什么 / 不证明什么）

| 免费模型替换 **证明** | 免费模型替换 **不证明** |
|----------------------|-------------------------|
| 接线（wiring）· auth · Key 分配 **不再**被 FreeTierOnly 挡住（若该免费模型路径 EXIT=0） | 生产模型质量 / 题面质量 |
| contract / schema / fail-closed 形状仍诚实 | 延迟 / 成本代表性 |
| runner 能带着 **set** Key 跑完家族并产出 receipt | **qwen-plus parity** · 与付费主模型行为等价 |
| | SLO / LOAD / HA / suite green / G6 closed / R5 retired |

**Ban cross-model evidence citation**：禁止「qwen3.8-flash EXIT=0 ⇒ qwen-plus 已验证」。若主路径要用 `qwen-plus`，必须 **单独** 对该模型名出具 CMD+EXIT（或显式标注 paid-fallback run）。

---

## 4. Re-prove CMDs · 成功准则 · 成本（本步不执行）

### 4.1 冻结 CMD（与 prior FIX 同 trio · 实存 scripts）

| # | CMD | 本 L0 状态 |
|---|-----|------------|
| 0 | `source /home/box/.meetwise-secrets/load-model-api-key.sh` + NEW_SHELL_STATUS probe（name-only） | **not_run:no_coding_authorize** |
| 1 | `pnpm e2e:isolated` | **not_run:no_coding_authorize** · prior EXIT=1 retained |
| 2 | `pnpm e2e:ui:isolated` | **not_run:no_coding_authorize** · prior EXIT=1 retained |
| 3 | `pnpm verify:e2e-performance` | **not_run:no_coding_authorize** · prior EXIT=1 retained |

### 4.2 成功准则（仅在后续 standing authorize + coding/prove 后）

1. **先** commit runner/docs 变更（若需 per-call model 记录）→ **再**跑 → **再** commit receipts  
2. 冻结 trio 在 **已提交 SHA** 上新鲜 **EXIT=0 / 0 / 0**（或诚实记录仍红的独立原因 · **Ban** wash）  
3. Receipt **逐 call** 记录实际 model name  
4. **Pre-run 成本估计**：方法 + ceiling（token×单价或百炼估算器；写明假设模型画像）· **Post-run 实际花费**：用户/控制台百炼账单录入 · **Ban 伪造**  
5. FreeTierOnly residual **仅**在新鲜 EXIT 证据下可关 · Dual PASS ≠ 已修好

### 4.3 后续 coding steps（本 L0 **不做**）

1. Receipt / runner：per-call `actualModel`（及 fallback 事件）字段  
2. （可选）e2e live env helper：显式 free-first 画像钉死 · Ban silent profile wash  
3. ASR 默认模型决策（关闭 `GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS` 后）

---

## 5. `qwen-audio-turbo-latest` 状态 + gap

| 项 | 发现 |
|----|------|
| Repo 用法 | `packages/ai-runtime/src/voice.ts` 缺省 `process.env.DASHSCOPE_ASR_MODEL ?? 'qwen-audio-turbo-latest'`；模板 `docker/env/worker.env.example` / `api.env.example` 同名 |
| 用户百炼配额列表 | **不在**列表（coordinator） |
| 公开文档 | 仍见模型页： [音频理解（Qwen-Audio）](https://help.aliyun.com/zh/model-studio/audio-language-model) — **仅供免费体验**；额度用完不可调用且 **不支持付费**；生产建议迁 **Qwen-Omni**；限流页仍列 `qwen-audio-turbo-latest`（[限流](https://help.aliyun.com/zh/model-studio/rate-limit)） |
| 模型大全 | 语音/全模态推广 Omni / 新 ASR 名（如 `qwen-audio-3.1-asr-*` · `qwen3.8-omni-flash`）· [模型大全](https://help.aliyun.com/zh/model-studio/models) |
| 结论 | **非未知下线公告**，但是 **免费体验-only · 无付费路径**；不在按量配额 UI 与「仅免费体验」叙述一致 · **不适合**作为生产 ASR 证据 |
| 命名 gap | **`GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS`**（本刀登记 · 非共享 SSOT） |

---

## 6. NHP（非快乐 · 先于 happy path）

| ID | 场景 | 期望诚实行为 |
|----|------|--------------|
| NHP-G7-FT-01 | 免费额度 mid-run 耗尽 | 显式 fallback 或 fail-closed · receipt 记 trigger · **Ban** 静默继续扮同一模型 |
| NHP-G7-FT-02 | paid fallback 仍 403 / billing refuse | EXIT≠0 · 记 error class · **Ban** invent green |
| NHP-G7-FT-03 | receipt 回显错误 model（与实际调用不符） | prove fail · **Ban** cross-model cite |
| NHP-G7-FT-04 | key fingerprint mismatch | fail-closed · **Ban** print key · fingerprint only |
| NHP-G7-FT-05 | embedding/rerank/TTS/VL 被误标为「免费跑通」 | **Ban** · 这些角色 paid-only（§2.2） |
| NHP-G7-FT-06 | 用 qwen3.8-* 绿洗 qwen-plus / 生产主模型 | **Ban** · capability honesty §3 |
| NHP-G7-FT-07 | 测试跑请求 / 误配 `deepseek-v4-pro`（无用户 OK flag） | **拒绝执行** · receipt 记 refuse · **Ban** 静默换模继续 · 仅当显式批准 flag 已记录才可放行 |

Happy path（仅授权后）：free-first 画像 → trio EXIT=0 → per-call model 记录齐全 → 成本 pre/post 录入 → post-prove dual。

---

## 7. Named gaps（仅本刀 docs · 不改共享 SSOT）

| Gap ID | 说明 | 关闭条件（未来） |
|--------|------|------------------|
| **GAP-G7-KEYX3-FREETIERONLY-RESIDUAL** | Key×3 仍 EXIT 1/1/1 · FreeTierOnly residual OPEN | 新鲜 trio EXIT=0 @ committed SHA + dual |
| **GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS** | 默认 ASR=`qwen-audio-turbo-latest` 不在配额列表 · 文档称仅免费体验不可付费 | 选定可付费 ASR/Omni 继任 · 更新 env 缺省 · 有收据 |
| **GAP-E2E-RECEIPT-PER-CALL-MODEL** | runners/receipts 今日不记录 per-call model | coding+prove 写入 actualModel 等字段 |
| **GAP-G7-COST-RECEIPT-PRE-POST** | 尚无本刀 pre-estimate / post-actual 花费收据 | 用户/控制台录入 · Ban 伪造 |
| **GAP-G7-BAN-DEEPSEEK-V4-PRO-TEST** | 测试跑须拒绝 deepseek-v4-pro（无显式用户 OK flag） | 后续 coding：runner guard + receipt flag · dual 守门 |
| **GAP-G7-CROSS-MODEL-EVIDENCE-BAN** | 流程钉：禁止跨模型证据引用 | 双审持续守门（纪律 · 非一次性「关」） |

---

## 8. Lifecycle

| Phase | Gate | 本刀 |
|-------|------|------|
| **L0** | REQUEST pair open · `draft:awaiting_pre_exec_dual` | **本步** |
| **L1** | Pre-exec dual `mw-model-op` + `mw-e2e-ha` | awaiting |
| **L2** | Standing authorize coding（若需 per-call model 等） | not_run · Dual PASS ≠ coding |
| **L3** | Coding + prove frozen trio · Ban invent EXIT | forbidden this tip |
| **L4** | Post-prove dual · Ban wash | forbidden this tip |
| **Residual** | FreeTierOnly | **STILL OPEN** |

---

## 9. Pins（must survive）

1. `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`  
2. `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false`  
3. EXIT **1/1/1** retained until fresh evidence · Ban假绿  
4. Dual PASS ≠ coding ≠ 已修好 ≠ suite green  
5. Ban secrets / `.env*` · Ban Meridian · Ban Cloud Agent · Ban force-push  
6. Ban Line A / Line B 文件 · Ban 改共享 SSOT  
7. Ban cross-model evidence citation  
8. Zero coding / zero prove / zero paid API this L0  

---

## 10. Non-claims

Not fixed · not coding authorized · not suite/family green · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not `releaseEvidence=true` · Dual PASS ≠ coding ≠ 已修好 · EXIT 1/1/1 retained · FreeTierOnly residual **OPEN** · 用户关「用完即停」≠ residual closed · zero prove this tip

---

*Harness · G7 Key×3 FreeTierOnly re-prove · Line C · 2026-09-23 (~20:35 PT) · draft:awaiting_pre_exec_dual · dual mw-model-op+mw-e2e-ha · EXIT 1/1/1 retained · Ban假绿 · Ban cross-model cite · GAP-MODEL-ASR-QWEN-AUDIO-TURBO-STATUS registered · releaseEvidence=false · ≠HA · zero coding · zero prove*
