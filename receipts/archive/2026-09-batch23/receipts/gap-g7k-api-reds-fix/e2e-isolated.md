# Receipt — G7R F-A-1 · **CMD1 `pnpm e2e:isolated`**（Line G7R EXEC · ×1 · EXIT **1** · `executed:awaiting_post_prove_dual`）

**Line**: G7R · **Knife**: GAP-G7K-API-REDS 修复刀 · F-A-1 配对实测（协调方 EXEC 授权 2026-10-07 · model-op 裁决首选值）
**授权链**: REQUEST `fa10e01e`（主线孪生；本地 line 孪生 `77305ad2` patch-id `d9de0018` 双侧全等）→ PRE dual BOTH PASS（mw-e2e-ha `216ffe16`/孪生 `d6d1d64e` + mw-model-op `351908ee`/孪生 `3767f783`）→ 协调方 EXEC 授权（F-A-1 值 + C-HA-1~8/C-MO-1~7 绑定）
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-g7r` · `line/g7r-api-reds-fix`（reset 至主线 tip = 重钉）
**实跑 code SHA**: **`3767f783863c8dc2bb8743e4ff02654948f1c34c`**（worktree HEAD 实测；CMD3 perf machine receipt `gitHead` 字段自证同值；receipt commit ≠ 实跑 code SHA）
**F-A-1 配对值**: `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` + `MODEL_NAME=qwen-plus`（协调方下达 · model-op 裁决首选）

## 逐 attempt 记录（七字段 · 本 CMD 恰一次 · 无重跑）

| 字段 | 值 |
|------|-----|
| 1. CMD 原文 | `pnpm e2e:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs` · wiring `package.json:278` @`3767f783` 实测——G7K 时代 `:276` 系 @`8c6860e3` 旧锚，+2 漂移 = mem00 接线已先在 REQUEST base `7b28a492` 落地，本 EXEC 按 C-HA-1 重钉回填） |
| 2. EXIT | **1**（原始退出码 · 未洗） |
| 3. 时间戳 | start 2026-10-08 00:10:49 +0800 · end 2026-10-08 00:11:04 +0800（machine receipt `durationMs=15215`） |
| 4. 实跑 code SHA | `3767f783863c8dc2bb8743e4ff02654948f1c34c` |
| 5. 关键输出 | PG boot OK（consecutive=3）· migrate **applied=141 skipped=0** 全 PASS（latest `0141_vector_plane_erasure_receipt_fence.sql`）· `E2E_FAILURE_CLASS class=api` · `ISOLATED_POSTGRES_OUTPUT_WITHHELD state_bytes=217 logs_bytes=1665`（withhold 契约在行动）· **`live_provider_key_missing` 0 hit · `FreeTierOnly/AllocationQuota` 0 hit**（log 机检 0/0）· 与 G7K CMD1 同形：**reviewLedger=[capability:image_ocr_unavailable, capability:voice_unavailable] 双 skip 在案** → 执行越过 `full.e2e.ts:153`（UC018 abandon 块 HTTP 层 PASS · 主面试 create/begin PASS）→ 红面仍在主面试 drive 段、class=api |
| 6. envModelApiKey | **set**（`source ~/.meetwise-secrets/load-model-api-key.sh` 进程环境注入 · name-only）+ F-A-1 两枚值 name-only（`.env`/`.env.local`/`apps/api/.env` 三文件 ABSENT 探针在案 · 值零入树） |
| 7. 预算消耗计数 | 结构估计 **< 10 次 live 调用**（业务窗口 ≈6s：全链 chat/embed 调用均 fast-fail，route classify 每新 revision ≤1 次 + 主 start job 数次；精确计数面 by-design 不存在 · `G7_FREETIER_REPROVE=1` 未设）· 上限 200 未超 |

**machine receipt**: `.tmp/e2e-receipts/2026-10-07T16-11-04-747Z-92031-790c9772-7a6c-4330-b19f-22367e0f3171.json`（`outcome=failed` · `exitCode=1` · `failureClass=api` · `assertionCount=null` · ledger 如上 · `schemaMigrationManifest.count=141` · `releaseEvidence=false`）
**原始 log**: `.tmp/g7r-fa1-20261007/01-e2e-isolated.log`（19 行 · gitignored `.gitignore:15` 不入树 · 引用摘录过无-Key 自查）

## F-A-1 判读（本 CMD 能证什么 / 不能证什么）

- **能证**：F-A-1 值下 HTTP 全链 E2E **仍红且与 G7K 同形**（class=api · ledger 同 · migrate PASS · 主 drive 段 fast-fail）；环境链完整（Key gate 解除 · 值经进程环境达 runner 与 worker——`run-e2e.mjs:14`/`run-e2e-ui.mjs:15` 均为 `{...process.env}` 展开，H0-alt-3 env 缺口**排除**；egress 探针 `dashscope.aliyuncs.com`/`api.deepseek.com` 均 HTTP 401-unauth 可达 = 连通性正常）。
- **不能证**：provider 层 HTTP 状态（401 vs 4xx model-not-exist vs pre-dispatch 拒绝）——子进程 stderr 永不回显（`run-e2e-isolated.mjs:2093` withhold 契约 · 零绕过）；**F-A-2 触发条件（收据现 4xx model-not-exist）无法由本收据证实**。

## 状态

**EXIT=1 · 红如实收** · F-A-1 不解除红③（iso 红面与 G7K 同形）· `g7SuiteGreen=false` · trio 保持 OPEN · `actualSpendCny=null` · awaiting post-prove dual（协调方另派 · Ban 自批）

---

*Receipt · G7R F-A-1 CMD1 e2e:isolated · 2026-10-08 · ×1 · EXIT 1 · failureClass=api · migrate 141 PASS · ledger=[ocr,voice] 与 G7K 同形 · env/egress 探针全过 · provider 状态 withhold 不可判读 · 预算结构估 <10/上限 200 · actualSpendCny=null · g7SuiteGreen=false · STOP*
