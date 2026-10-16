# Receipt — G7R F-A-1 · **CMD2 `pnpm e2e:ui:isolated`**（Line G7R EXEC · ×1 · EXIT **1** · `executed:awaiting_post_prove_dual`）

**Line**: G7R · **Knife**: GAP-G7K-API-REDS 修复刀 · F-A-1 配对实测
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-g7r` · `line/g7r-api-reds-fix`
**实跑 code SHA**: **`3767f783863c8dc2bb8743e4ff02654948f1c34c`**
**F-A-1 配对值**: `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` + `MODEL_NAME=qwen-plus`

## 逐 attempt 记录（七字段 · 本 CMD 恰一次 · 无重跑）

| 字段 | 值 |
|------|-----|
| 1. CMD 原文 | `pnpm e2e:ui:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs` · wiring `package.json:279` @`3767f783` 实测 · C-HA-1 重钉） |
| 2. EXIT | **1**（原始退出码 · 未洗） |
| 3. 时间戳 | start 2026-10-08 00:13:24 +0800 · end 2026-10-08 00:16:08 +0800（2m44s · Playwright 计 2.0m 用例窗口） |
| 4. 实跑 code SHA | `3767f783863c8dc2bb8743e4ff02654948f1c34c` |
| 5. 关键输出 | migrate applied=141 PASS · Playwright **24 tests: 10 passed / 4 failed / 10 skipped**——**与 G7K CMD2 完全同形的 4F**（同 case、同失败点、同量级耗时）· suite 级 wrapper 归类 `client_exited` 链 · `live_provider_key_missing` 0 hit · `FreeTierOnly/AllocationQuota` 0 hit |
| 6. envModelApiKey | **set**（loader 进程环境 · name-only）+ F-A-1 两枚值 name-only；`.env`/`.env.local`/`apps/api/.env` 三文件 ABSENT |
| 7. 预算消耗计数 | 结构估计 **< 30 次 live 调用**（recruiting-bound ×2 route classify + start job 尝试；abandon ×2 begin→start job ×2；全部 fast-fail 无长生成 · golden/screenshots/stream-window/abandon 断言面零模型调用）· 上限 200 未超 |

**原始 log**: `.tmp/g7r-fa1-20261007/02-e2e-ui-isolated.log`（Playwright reporter 明细在案 · gitignored 不入树）
**失败工件**: `apps/web/test-results/`（trace.zip / 截图 / error-context.md · 未入 git · 本收据引用其产品面内容：状态码、UI 字符串、SSE 终态——均为面向浏览器/报告者的合法观察面 · 非 withhold 通道）

## 逐 case 明细（Playwright reporter 原文 · 五分类 · Ban 洗绿）

### 4 failed（红 · EXIT1 原值）

| # | case | 耗时 | 失败点（file:line） | 分类 | F-A-1 下明细 |
|---|------|------|---------------------|------|--------------|
| F1 | `[chromium] › recruiting-bound.spec.ts:56` | 34.8s | `TimeoutError: page.waitForURL: Timeout 30000ms exceeded` @ `:96` | **api** | `:94`「开始面试」visible 已过 → start server action throw → 根错误边界「出错了 · 错误标识:**382212850**」页快照在案（G7K 为 190419086 · 同面新 digest）→ **F-A-1 下红①原样** |
| F2 | `[mobile] › recruiting-bound.spec.ts:56` | 34.5s | 同 F1 @`:96` | **api** | 同 F1 |
| F3 | `[chromium] › uc018-abandon.spec.ts:68` | 1.8s | `UI abandon proxy → 200` · Expected 200 / **Received 409** @ `:139` | **api** | 页快照：「已结束」+ alert「面试启动/处理遇到问题,已停止…」+「重新开始面试」；**trace 网络面亲读**：`GET /api/interview/:id/events → 200`（SSE body 原文 `event: interview_unavailable` / `data: {"kind":"start","reason":"job_failed"}`）+ `POST …/abandon → 409` → **worker start job 秒败（fail-closed）→ abandon 409，F-A-1 下红②原样** |
| F4 | `[mobile] › uc018-abandon.spec.ts:68` | 1.9s | 同 F3 @`:139` | **api** | 同 F3 |

### 10 passed（绿 · 逐条如实）

golden ×2 · screenshots ×4 · stream-window ×2 · online-public 不在 passed 面（明细以 log 为准）——与 G7K passed 面同集。

### 10 skipped（skip ≠ pass · 原值）

voice-duplex ×6（`DASHSCOPE_TTS/ASR_API_KEY unset` · capability skip · 0 调用）· online-public ×4（无 `ONLINE_BASE_URL` · env 条件跳过）——与 G7K 同。

## F-A-1 判读（本 CMD 核心证据）

1. **红①红②在 F-A-1 下原样**：同 case、同失败点（`:96`/`:139`）、同量级耗时（34.8s≈30s 超时窗；1.8s 秒败）→ F-A-1 配对（dashscope-cn-beijing + qwen-plus）**未改变任何红面行为**。
2. **env 链排除（H0-alt-3 出局）**：`run-e2e-ui.mjs:15` `env={...process.env,…}` 全量传递 → F-A-1 值确认到达 api/worker/web；runner 自身 gate（`:48` Key gate blob `aa86fb3f`）通过。
3. **egress 排除**：`https://dashscope.aliyuncs.com/compatible-mode/v1/models` 与 `https://api.deepseek.com/models` 无认证探针均 **HTTP 401 可达**（连通/TLS 正常 · 401=未带凭证的预期响应 · 本探针零 Key 零模型调用）。
4. **worker 失败点产品面证据**：SSE 终态 `interview_unavailable {"kind":"start","reason":"job_failed"}`（trace 资源原文）= start job 失败（结构面新证据 · 登记见 SUMMARY §定谳）。
5. **仍不能证**：provider HTTP 状态 401 vs 4xx（withhold）→ F-A-2 触发条件（收据现 model-not-exist 4xx）**未证实**；401（H0-alt-1）亦未证实。

## 状态

**EXIT=1 · 红如实收** · F-A-1 不解除红①红② · `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · awaiting post-prove dual

---

*Receipt · G7R F-A-1 CMD2 e2e:ui:isolated · 2026-10-08 · ×1 · EXIT 1 · 24=10P/4F/10S 与 G7K 同形（recruiting-bound ×2 @:96 · abandon ×2 @:139）· SSE 亲读 interview_unavailable{kind:start,reason:job_failed} · env/egress 排除 · provider 状态 withhold 不可判读 · 预算结构估 <30/上限 200 · actualSpendCny=null · g7SuiteGreen=false · STOP*
