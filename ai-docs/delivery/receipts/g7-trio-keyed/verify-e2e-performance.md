# Receipt — G7 trio keyed · **CMD3 `pnpm verify:e2e-performance`**（Line G7K EXEC · ×1 · EXIT **1** · `executed:awaiting_post_prove_dual`）

**Line**: G7K · **Knife**: G7 trio 带 Key 新鲜跑（协调方 U4 EXEC 授权 · 额度上限 200）
**REQUEST**: `19df4e7f`（origin 链 · 本地孪生 `bfad493f` patch-id `d6093f0c` 全等）· **PRE dual**: mw-model-op `794f288d`（镜像 `d74c957e`）+ mw-e2e-ha `615ee8bf`（镜像 `2254fbf0`）BOTH PASS
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-g7k` · `line/g7k-trio-keyed`
**实跑 code SHA**: **`8c6860e33d925628771acaaa9de5bc2dbaa72cb6`**（machine receipt `gitHead` 字段自证同值）

## 逐 attempt 记录（七字段 · 本 CMD 恰一次 · 无重跑）

| 字段 | 值 |
|------|-----|
| 1. CMD 原文 | `pnpm verify:e2e-performance`（= `node scripts/run-e2e-performance-suite.mjs` · wiring `package.json:280` @`8c6860e3`） |
| 2. EXIT | **1**（原始退出码 · 未洗） |
| 3. 时间戳 | start 2026-10-07 21:39:16 +0800 · end 2026-10-07 21:41:41 +0800（2m25s · receipt startedAt `2026-10-07T13:39:17.237Z` finishedAt `13:41:41.188Z`） |
| 4. 实跑 code SHA | `8c6860e33d925628771acaaa9de5bc2dbaa72cb6` |
| 5. 关键输出 | step1 web production build **EXIT=0**（97.2s）· step2 migrate/deploy evolution **EXIT=0**（15.0s · migrate runner 全 PASS 族：首次应用/幂等/并发索引/漂移检测/0121 pgcrypto/再部署零数据丢失 · HTTP 步内 applied=141 PASS）· step3 **HTTP full E2E EXIT=1**（31.8s · `E2E_FAILURE_CLASS class=api`）→ suite 短路 throw `e2e_performance_suite_failed:HTTP full E2E:exit=1` · **无 `live_provider_key_missing`（0 hit）· 无 `FreeTierOnly/AllocationQuota`（0 hit）** |
| 6. envModelApiKey | **set**（loader 进程环境注入 · name-only） |
| 7. 预算消耗计数 | 结构估计 **< 50 次**（HTTP full E2E 与 CMD1 同源同量级）· 上限 200 未超 |

**machine receipt**: `.tmp/e2e-receipts/2026-10-07T13-39-17-235Z-53176.json`（`outcome=failed` · `failure=e2e_performance_suite_failed:HTTP full E2E:exit=1` · `gitHead=8c6860e3…` · `releaseEvidence=false` · steps 表见下）
**原始 log**: `.tmp/g7k-keyed-20261007/03-verify-e2e-performance.log`（210 行 · gitignored 不入树 · 摘录过无-Key 自查）

## steps 表（suite receipt 原文 · 短路契约）

| step | exit | duration | 判定 |
|------|------|----------|------|
| web production build | 0 | 97152ms | PASS（≠ suite green） |
| schema migration/deploy evolution（`migrate:prove`） | 0 | 15006ms | PASS（migrate EXIT0 ≠ suite green） |
| **HTTP full E2E**（`e2e:isolated` · 与 CMD1 同源） | **1** | 31792ms | **FAIL · class=api**（与 CMD1 同根：HTTP E2E 断言脚本失败退出 · case 级明细 by-design withheld，见 CMD1 收据 §失败归类） |
| step4–27（browser full E2E / web:prove / resume-extract / R5-MARKED-RED 族 memory/HNSW/rag-generation/rag-corpus-version/qbank-control-role/rag-cache / retrieval / crag / agent-skills 等 24 步） | — | — | **not_run（suite 契约短路：首步失败即 throw · `run-e2e-performance-suite.mjs` steps 循环）** · not_run ≠ pass |

## Key gate 判定

**解除（级联点翻转）**：AC `7c818c5` 收据 C3 = migrate PASS 后 HTTP 步 Key-blocked 级联；本刀 migrate PASS 后 HTTP 步失败 class=**api**（非 provider/Key 类）——失败**性质**由 Key-blocked 更新为真实业务红，suite `failure` 字符串不变（`HTTP full E2E:exit=1` · 同 AC 原值）。

## 失败归类（五分类）

- **HTTP full E2E 步**：**api 类**（同 CMD1 suite 级判定；同源脚本 `e2e/full.e2e.ts`）。
- **not_run 步 ×24**：suite 契约短路产物，如实记 not_run（**≠ pass ≠ skip-as-pass**）。
- R5-MARKED-RED 步族本刀未到达（短路），其 LEGACY 披露保持（到达亦 ≠ sole-stack ≠ RAG migrated ≠ G6 closed）。

## 预算披露

HTTP full E2E 与 CMD1 同源（同脚本同流程），结构估 **< 50 次**。`actualSpendCny=null`（沿 I 线 · No invented spend）。

## presence-only 探针（C-MO-G7K-2 · CMD 跑前）

`.env` **ABSENT** · `.env.local` **ABSENT** · `apps/api/.env` **ABSENT**

## env-gap 记录

**0 阻断 env-gap**。本步 FAIL 非 `schema migration:exit=1`（AC 收据同款区分保留：suite error 是 `HTTP full E2E:exit=1`）。R5-MARKED-RED pgvector-legacy 披露原样（log :81/:84 逐字在案）。

## 状态

**EXIT=1 · 红如实收** · build EXIT0 + migrate EXIT0 ≠ suite green · ≠ SLO ≠ LOAD ≠ HA（perf 数据面未到达：短路于 HTTP 步）· `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 OPEN · `actualSpendCny=null` · awaiting post-prove dual（协调方另派 · Ban 自批）

---

*Receipt · G7K CMD3 verify:e2e-performance · 2026-10-07 · ×1 · EXIT 1 · build 0 + migrate 0 + HTTP E2E 1（class=api 同 CMD1 根因）· 后 24 步 not_run 短路 · gate 级联点翻转 Key-blocked→api · 预算结构估 <50/上限 200 · actualSpendCny=null · g7SuiteGreen=false · STOP*
