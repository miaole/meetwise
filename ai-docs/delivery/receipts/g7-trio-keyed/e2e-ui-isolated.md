# Receipt — G7 trio keyed · **CMD2 `pnpm e2e:ui:isolated`**（Line G7K EXEC · ×1 · EXIT **1** · `executed:awaiting_post_prove_dual`）

**Line**: G7K · **Knife**: G7 trio 带 Key 新鲜跑（协调方 U4 EXEC 授权 · 额度上限 200）
**REQUEST**: `19df4e7f`（origin 链 · 本地孪生 `bfad493f` patch-id `d6093f0c` 全等）· **PRE dual**: mw-model-op `794f288d`（镜像 `d74c957e`）+ mw-e2e-ha `615ee8bf`（镜像 `2254fbf0`）BOTH PASS
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-g7k` · `line/g7k-trio-keyed`
**实跑 code SHA**: **`8c6860e33d925628771acaaa9de5bc2dbaa72cb6`**

## 逐 attempt 记录（七字段 · 本 CMD 恰一次 · 无重跑）

| 字段 | 值 |
|------|-----|
| 1. CMD 原文 | `pnpm e2e:ui:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs` · wiring `package.json:277` @`8c6860e3`） |
| 2. EXIT | **1**（原始退出码 · 未洗） |
| 3. 时间戳 | start 2026-10-07 21:34:09 +0800 · end 2026-10-07 21:37:45 +0800（3m36s · Playwright 计 2.2m 用例窗口） |
| 4. 实跑 code SHA | `8c6860e33d925628771acaaa9de5bc2dbaa72cb6` |
| 5. 关键输出 | web production build PASS（`next build` → `next start :31304`）· PG boot+migrate applied=141 PASS · Playwright **24 tests: 10 passed / 4 failed / 10 skipped** · suite 级 `E2E_FAILURE class=frontend code=client_exited`（playwright 退出非零的 wrapper 级归类）· **无 `live_provider_key_missing`（0 hit）· 无 `FreeTierOnly/AllocationQuota`（0 hit）** |
| 6. envModelApiKey | **set**（loader 进程环境注入 · name-only） |
| 7. 预算消耗计数 | 结构估计 **< 20 次**（live 面仅 recruiting-bound ×2 的 interview bind 尝试；golden/screenshots/stream-window/abandon 均 0 模型调用）· 上限 200 未超 |

**原始 log**: `.tmp/g7k-keyed-20261007/02-e2e-ui-isolated.log`（gitignored 不入树 · Playwright reporter 明细在案 · 摘录过无-Key 自查）
**失败工件**: `apps/web/test-results/`（trace.zip / 截图 / error-context.md · 未入 git · 仅路径引用）

## Key gate 判定

**解除**：`run-e2e-ui.mjs:48`（blob `aa86fb3f`）未触发——Playwright launch **已到达并执行**（24 tests 实跑 · 对比 AC `7c818c5` 收据 C2「Playwright launch not reached（Key-blocked before UI cases）」· 状态翻转如实登记）。chromium ran（cache 版本无需安装）· **chromium ran ≠ UI green** 惯例不变（本 CMD EXIT=1 即证）。

## 逐 case 明细（Playwright reporter 原文 · 五分类 · Ban 洗绿）

### 4 failed（红 · EXIT1 原值）

| # | case（reporter 原文） | 耗时 | 失败点（file:line 原文） | 分类 |
|---|------------------------|------|--------------------------|------|
| F1 | `[chromium] › e2e-ui/recruiting-bound.spec.ts:56:1 › C→B: real browser binds application to a new interview, completes it, and front-end finalizes it` | 35.3s | `TimeoutError: page.waitForURL: Timeout 30000ms exceeded` @ `recruiting-bound.spec.ts:96`（`waitForURL(/\/interview\/iv_[^?]+\?applicationId=app_/)`；:94「开始面试」按钮 visible **已通过**） | **api**（interview bind URL 30s 不出现 = live interview 生成/bind 路径红；与 CMD1 `failureClass=api` 独立 CMD 互证；quota 0 复发 → **非 quota 类**；G7B C8「随 live 解锁刀复核」在本刀复核结果 = **仍红 · 非 Key-blocked** · 候选真实产品缺陷/LIVE 路径红 → 登记 backlog 修复另刀） |
| F2 | `[mobile] › e2e-ui/recruiting-bound.spec.ts:56:1`（同 F1） | 35.6s | 同 F1（@`:96`） | **api**（同 F1） |
| F3 | `[chromium] › e2e-ui/uc018-abandon.spec.ts:68:1 › UC018-UI-abandon: in-interview 放弃 → abandoned+released · irreversible · same HTTP contract` | 1.6s | `Error: UI abandon proxy → 200` · **Expected: 200 / Received: 409** @ `uc018-abandon.spec.ts:139`（`expect(abandonResp.status(), 'UI abandon proxy → 200').toBe(200)`） | **api**（HTTP contract 层红：abandon 代理收 409 Conflict 非 200。与 F1 的同根性（in-interview 状态未建立 → abandon 409）为**候选解读如实标注，非断言**——登记 backlog 由修复刀复核） |
| F4 | `[mobile] › e2e-ui/uc018-abandon.spec.ts:68:1`（同 F3） | 2.5s | 同 F3（409 @`:139`） | **api**（同 F3） |

### 10 passed（绿 · 逐条如实）

golden ×2（chromium 4.4s / mobile 2.8s：landing→signup→cookie auth→protected render · no-cookie→/login 重定向）· screenshots ×4（desktop/mobile H5 双 project）· stream-window ×2（10k SSE replay 精确重投 · 80-turn DOM window · terminal view · chromium 751ms / mobile 1.1s）· uc018-abandon 前置路径不在 passed 面（passed 全表以 log 为准）。

### 10 skipped（skip ≠ pass · 逐类原值）

| 族 | 数 | skip 原因（spec 原文） | 分类 |
|----|----|--------------------------|------|
| `voice-duplex.spec.ts`（:166/:205/:237 × chromium+mobile） | 6 | `test.skip(!voiceKeysReady)`——`DASHSCOPE_TTS_API_KEY/DASHSCOPE_ASR_API_KEY unset — voice duplex not provable`（`voice-duplex.spec.ts:9`） | **provider/capability**（诚实 capability skip · 0 live 调用 · **≠ voice green**） |
| `online-public.spec.ts`（:20/:34 × chromium+mobile） | 4 | `test.skip(!onlineBaseUrl)`——`set ONLINE_BASE_URL to run the ECS/public smoke`（`online-public.spec.ts:16`） | **env 条件跳过**（公网冒烟需 `ONLINE_BASE_URL`，本地范围外 · 非 Key 类 · 非 FAIL） |

## 预算披露

live 面 = recruiting-bound ×2 的 interview bind 尝试（F1/F2 各一次 start 尝试，bind 前的生成调用 1–N 次/次）+ 无其他模型调用面（golden/screenshots/stream/abandon/quiz 不调模型）。结构估 **< 20 次**。`actualSpendCny=null`（沿 I 线）。

## presence-only 探针（C-MO-G7K-2 · CMD 跑前）

`.env` **ABSENT** · `.env.local` **ABSENT** · `apps/api/.env` **ABSENT**

## env-gap 记录

**0 阻断 env-gap**（docker/chromium/pnpm/node 同 CMD1 探针面）。R5-MARKED-RED pgvector-legacy 披露原样（log :3 逐字在案）。

## 状态

**EXIT=1 · 红如实收** · 10 passed ≠ UI green（4 failed 在案）· chromium ran ≠ UI green · UI′ `post_prove_dual_pass:honesty_red`（FIX 时代）历史态零改写 · `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 OPEN · `actualSpendCny=null` · awaiting post-prove dual（协调方另派 · Ban 自批）

---

*Receipt · G7K CMD2 e2e:ui:isolated · 2026-10-07 · ×1 · EXIT 1 · 24=10P/4F/10S · Playwright launch reached（gate 解除）· F1/F2 recruiting-bound waitForURL 30s timeout=api 类 · F3/F4 abandon proxy 409≠200=api 类 · skip: voice×6 capability + online-public×4 无 ONLINE_BASE_URL · 预算结构估 <20/上限 200 · actualSpendCny=null · g7SuiteGreen=false · STOP*
