# SUMMARY — LIVE E2E 复跑三键采证（2026-10-11 · 主层授权运行采证席）

**基线**: `feat/mysql-schema-skeleton` tip `c7142596`（HEAD 亲证）· 工作树脏项豁免（主层裁：`.gitignore` +2 行工具忽略项 + 4 个 untracked 工具产物目录，均不触源码/测试面）· Docker 29.1.3 · 磁盘 62Gi · `MODEL_API_KEY` 仓根 `.env` 在 + loader `~/.meetwise-secrets/load-model-api-key.sh` 可执行在（键值零打印）。

## 三键总表

| 键 | 命令 | EXIT | 断言/计数 | 定性 |
|---|---|---|---|---|
| S1 | `pnpm e2e:isolated` | attempt1/2=1（class=worker · boot 断）· attempt3=1（class=api · 深跑后红）| attempt3：64 个 ✓ 行后死于 `e2e/full.e2e.ts:344` 断言；套内 70 个 A( 位，:344 后 15 位未执行 · assertionCount=null（套未完）| **红**（1 条新红 + 2 次 boot 阻断，见下）|
| S2 | `pnpm performance:e2e`（字面键）| 1 | fail-closed `performance_e2e_isolation_required`（该直跑形无 wrapper 注入 `E2E_ISOLATED=1`，设计如此）| 闸（非业务红）|
| S2' | `pnpm performance:e2e:isolated`（LIVE 形）| attempt1/2/3/4=1（worker boot 断 ×3 形）· **attempt5=0** | 34 ✓ / 4 预算全过（livez p95=27ms<500 · commerce p95=8.3ms<1000 · signup p95=290.4ms<3000 · resume_ingest p95=25.6ms<3000 · 0 non2xx）· 32s | **绿（首跑基线即绿）** |
| S3 | `pnpm e2e:ui:isolated` | attempt1=1（18F/10S/0P · Playwright 浏览器二进制缺失，infra）· attempt2=1（**15P/3F/10S** · 197s）| 见下红项对账 | **红（3F · 构成=预期 2 + 新 1）** |

## 仪器链（fail-closed 闸如实记录，零绕过）

1. **S1/S2/S3 直接跑都会撞两道 worktree 环境闸**：仓根 `.env`（10-07 20:49 mtime·本席未动其内容）载 `MODEL_COST_ENFORCEMENT=enforce`+`MODEL_BACKUP_API_KEY` 但缺 `MODEL_BACKUP_BILLING_MODEL` 行 → worker 启动断 `model_cost_invalid_model_backup_billing_model`（`apps/worker/src/model-cost-governance.ts:50` ← `main.ts:428`）；`PRIVACY_WORKER_DATABASE_URL=…15432` 不可达 → worker 启动断 ECONNREFUSED（`privacy-worker-runtime.ts:19` ← `main.ts:498`）。`.env` 在 10-09/10-10 各席卷面为「不存在」（regfix §5.5 ls 亲证），系本刀窗口前被原样放回（mtime 保留）。**处置=回到 10-09 绿基线同形的授权 LIVE 协议**：Key 只经 loader source 注入进程环境 + `.env` 不回灌（S1/S3 走已落码的 `E2E_SKIP_DOTENV=1` 钩；S2 attempt5 以临时 `mv .env .env.live-rerun-hold` 实现同形，跑后即复原亲证：mtime 20:49 未变）。S2 attempt2/3 的 `MODEL_COST_ENFORCEMENT=observe`/`RAG_COST_ENFORCEMENT=observe` 父环境预置只解了前两道闸（perf runner 无 SKIP_DOTENV 钩），attempt4 仍断 privacy 闸 → 才落到 attempt5 的 `.env` 暂离形。**五次 S2 attempt 全数留档**。
2. **S3 attempt1**：18F/0P/10S 全数 `browserType.launch: Executable doesn't exist …/chromium_headless_shell-1228`（`@playwright/test` 1.61.1 · 本机 ms-playwright 缓存为空）= 基础设施崩 → 按「容器/网络崩重跑例外」执行 `pnpm exec playwright install chromium`（纯环境装件，零码动）后 attempt2 真跑。两次输出全档。

## 红项逐条对账（预期红 3 vs 实际 3F · 构成变化）

| # | 预期（对照 gap-red1-timing-face 11P/3F/10S）| 实际 | 判 |
|---|---|---|---|
| 1 | recruiting-bound C→B 早停终态串 ×2 | `[chromium]/[mobile] › e2e-ui/recruiting-bound.spec.ts:143` 双双 `TimeoutError: page.waitForURL('**/recruiter/jobs') 20s` @ spec `:21`（helper signUp，调用于 `:167`）| **预期红匹配（同用例）但红面已前移**：10-07 基线死在面试旅程自适应早停终态；现死在 B 端注册导航。旁证：0155_recruiter_approval_gate（B 端注册审核制，10-10 01:55 落主线，不在 10-09 基线）——注册后不再直落 /recruiter/jobs。归原刀域复核 |
| 2 | golden(chromium) 冷启 ×1 | **未复现**：golden 双 project 全 PASS | 预期红清除 |
| 3 | （无预期）| `[mobile] › e2e-ui/stream-window.spec.ts:60` silent variant：`registerAndGo` `waitForURL('**/dashboard') 20s` @ spec `:42` | **新红 1 条**。同 spec 同 helper 兄弟用例（:9/:46 mobile、:60 chromium）与 4.6s 前的 golden-mobile signup 全绿 → 冷启/时序面候选，**禁重跑洗绿，如实记账待另刀甄别** |

## S1 新红（LIVE 主链 · 回归根因在 6 刀之内）

- `e2e/full.e2e.ts:344` `A(r.status===402 && b.error==='insufficient_entitlement', '[异常] 额度不足 begin → 402 insufficient_entitlement（不再被 mask 成 500）')` **实测 begin 返回 `202 {"accepted":true,"jobId":…}`**（本席 diag 流程复现，同栈同协议）。根因：**0154_trial_bucket_grant（#228 注册赠送 trial 桶 1.00 单位，10-10 01:59 落主线，不在 10-09 基线）** 使「无额度用户」夹具前提失效——产品语义有意变更，e2e 断言未随演，LIVE 面未复跑故未觉。套内 :344 后 15 个断言位未执行（含 payment/report/SSE/privacy 段）。
- 10-09 基线 75 断言绿的对比口径：S1 attempt3 真测 64 ✓ 后死于 :344（本席 diag 同点复现，确定性红，非 flake）。

## 非绿项清单（如实记账，suite EXIT 不因此算全绿证据）

- S1/S3 OCR 段：`⊘ 图片简历 OCR 全栈 → skipped (DASHSCOPE_VISION_API_KEY unset)` — capability ledger `image_ocr_unavailable` ×2
- S1/S3 语音段：`⊘ 真实双向语音闭环 → skipped (DASHSCOPE_TTS/ASR_API_KEY unset)` — `voice_unavailable` ×2
- S3 skipped 10 = voice-duplex ×3 ×2 project + online-public ×2 ×2 project（test.skip，预期内）
- S1 review ledger 另有 `report_unavailable` ×4 = E2E_REPORT_FAIL_ALL=1 舱壁样本注入的预期故障面（非缺陷红）

## 结论（对「6 刀 est live=0 未复跑」的复验）

**LIVE 面未恢复绿。** 回归根因清点：6 刀中的 **#228 trial 桶刀（0154）击穿 S1 `:344` 断言**（确定性）、**B110 审核制刀（0155）使 recruiting-bound ×2 红面前移**（红仍红、面已变）、golden(chromium) 预期红被后续修复清除、新红 stream-window:60(mobile) 1 条（疑时序面）。S2 性能门首跑基线即绿（attempt5 · 0-非2xx）。产品码零改动、断言零改动、零 commit；全部收据在本目录。

## 容器与并发披露

- 本席 7 个 `meetwise-e2e-*` 容器全部即用即灭（wrapper 自清 + diag 手清，docker ps 亲证零残留）。
- 报告时点观测到 **并发席位容器 ×2**（`meetwise-e2e-26629-*`/`meetwise-e2e-26674-*`，本席末次跑后 ~14s 出现，pid 非本席）——非本席所启，未触碰。


## 工作区披露（零码动亲证）

- tracked 改动仅：`.gitignore`（前置既存·豁免）+ `apps/web/test-results/.last-run.json`（S3 Playwright 跑后自有记账，非源码）。
- untracked 新增：`receipts/live-rerun-2026-10-11/`（本席收据 37 件）+ `apps/web/test-results/` 三失败用例的 screenshot/trace 附件（S3 日志所指证据物，留工作区待裁）。
- 源码/断言/scripts 零字节改动（`git diff --stat` 除上述两件外全空）· 零 commit · 零 push。
- markers 门：本收据目录五类标记词 grep EXIT=1 零命中（亲证）。
- S2 期间 `.env` 曾暂离（`mv .env .env.live-rerun-hold`），跑后即时复原（mtime 2026-10-07 20:49 未变亲证）；全程键值零打印、零 secrets 入卷。

*三键采证席 · 2026-10-11 · 基线 c7142596 · S1 红（新红 1：0154 trial 桶击穿 ：344）· S2' 绿（首跑基线）· S3 红 3F（预期 2 匹配但面前移 0155 · 新 1 时序面候选 · golden 清除）· 非绿项=OCR/语音 capability 跳过 + voice-duplex/online-public skip ×10 · 零改码零 commit · 收据留工作区由主层裁 · ⛔push*
