# Receipt — G7 trio keyed · **CMD1 `pnpm e2e:isolated`**（Line G7K EXEC · ×1 · EXIT **1** · `executed:awaiting_post_prove_dual`）

**Line**: G7K · **Knife**: G7 trio 带 Key 新鲜跑（AD P4 解锁刀 · 协调方 U4 EXEC 授权 2026-10-07 · 额度上限 200 次 live 调用）
**REQUEST**: `19df4e7f2f33da80c2f0dd3126697302b7e1f53b`（origin 链 · 本地孪生 `bfad493f` patch-id `d6093f0c` 全等）
**PRE dual**: BOTH PASS · mw-model-op `794f288d`（链上镜像 `d74c957e`）+ mw-e2e-ha `615ee8bf`（链上镜像 `2254fbf0`）
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-g7k` · `line/g7k-trio-keyed`（rebase 后 HEAD = origin tip `8c6860e3`）
**实跑 code SHA**: **`8c6860e33d925628771acaaa9de5bc2dbaa72cb6`**（worktree HEAD 实测 · receipt commit ≠ 实跑 code SHA 惯例不变）

## 逐 attempt 记录（七字段 · 本 CMD 恰一次 · 无重跑）

| 字段 | 值 |
|------|-----|
| 1. CMD 原文 | `pnpm e2e:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs` · wiring `package.json:276` @`8c6860e3`） |
| 2. EXIT | **1**（原始退出码 · 未洗） |
| 3. 时间戳 | start 2026-10-07 21:30:06 +0800 · end 2026-10-07 21:30:45 +0800（duration 38.5s · machine receipt `durationMs=38541`） |
| 4. 实跑 code SHA | `8c6860e33d925628771acaaa9de5bc2dbaa72cb6` |
| 5. 关键输出 | PG boot OK（`E2E_POSTGRES_READY boot/post-migrate/pre-probe`）· migrate **applied=141 skipped=0 全 PASS**（latest `0141_vector_plane_erasure_receipt_fence.sql`）· api/worker 启动 · `E2E_FAILURE_CLASS class=api` · **无 `live_provider_key_missing`（0 hit）· 无 `FreeTierOnly/AllocationQuota`（0 hit）** |
| 6. envModelApiKey | **set**（`source ~/.meetwise-secrets/load-model-api-key.sh` 进程环境注入 · name-only 记录 · 值零打印零入库） |
| 7. 预算消耗计数 | 结构估计 **< 50 次**（方法与依据见 §预算）· 上限 200 未超 |

**machine receipt**: `.tmp/e2e-receipts/2026-10-07T13-30-45-329Z-48991-6807f00e-e678-41f2-8a3c-1a85755c5cdc.json`（`outcome=failed` · `exitCode=1` · `failureClass=api` · `assertionCount=null` · `reviewLedger=[capability:image_ocr_unavailable, capability:voice_unavailable]` · `schemaMigrationManifest.count=141` · `releaseEvidence=false` · `dataHandling=no_output_prompt_answer_token_endpoint_or_connection_string_persisted`）
**原始 log**: `.tmp/g7k-keyed-20261007/01-e2e-isolated.log`（19 行 · gitignored 不入树 · 摘录过无-Key 自查）

## Key gate 判定（本刀核心解锁验证）

- **Key-blocked gate 解除**：`run-e2e.mjs:43`（blob `c655235c` @`8c6860e3`）未触发——Key set 经进程环境，业务 case **首次真实执行**（AC Path A `7c818c5` 收据中同 CMD 的 `live_provider_key_missing` 顶层 throw 不再出现）。
- **quota 残余无复发**：`FreeTierOnly/AllocationQuota` 0 hit（消除轮 `82981ff` 生效验证）。

## 失败归类（诚实 · 五分类）

- **suite 级（runner 判定）**：`failureClass=api`。语义 = HTTP E2E 断言脚本（`e2e/full.e2e.ts`）失败退出（`run-e2e.mjs:158` `client_exited` 链）→ 归 **api 类**。
- **case 级明细**：**by-design 不可得**——isolated wrapper `runFullE2E` 对子进程 stdout 仅做内存固定格式解析、stderr 永不回显（`run-e2e-isolated.mjs:2084-2098` 产品安全设计「untrusted output 不落终端/日志」，与 AC 收据「stderr withheld by design」同口径）；本刀遵守该契约零绕过（Ban 为取明细改产品/开假面）。故具体红 case 名以「withheld by design」如实登记，**不发明明细**。
- **已知非红项**：`reviewLedger` capability skip ×2（`image_ocr_unavailable` / `voice_unavailable`）= 无 DASHSCOPE key 的诚实 capability skip（0 live 调用 · **≠ pass** · Ban wash skip-as-pass）。

## 预算披露

- 精确 per-call 计数面 by-design 不存在（G7 cost ledger 仅 `G7_FREETIER_REPROVE=1` 专用路径启用，本刀未设；Ban 为计数改产品）。计数方法 = **结构面估计**：`full.e2e.ts` 含 3 条 `driveInterviewToTerminal` live interview 驱动（:187/:225/:346）+ quiz/diagnosis 生成 poll + report，每驱动 1–N 次 chat 调用；本次 run 业务执行窗口 ≈15s，估 **< 50 次**。
- 累计（trio）见 SUMMARY §预算：**< 120 次 < 200 上限，未触限，无中止**。
- **`actualSpendCny=null`**（沿 I 线 · 无计价数据源 · No invented spend）。

## presence-only 探针（C-MO-G7K-2 · CMD 跑前 · 只记存在性永不读值）

`.env` **ABSENT** · `.env.local` **ABSENT** · `apps/api/.env` **ABSENT**（runner `.env` auto-load 分支 `run-e2e.mjs:16-21` 未触发 · Key 唯一来源 = 进程环境）

## env-gap 记录

**0 阻断 env-gap**：docker Desktop server 29.1.3 OK（本机 session 已有 docker 权限，无需 `with-docker-session.sh`）· chromium cache 在（未安装新组件）· pnpm 10.18.0 / node v22.22.3 · `pnpm install --frozen-lockfile` EXIT=0（18.6s）。R5-MARKED-RED `E2E_ISOLATION_STACK=pgvector-legacy` 披露原样保留（log :4 逐字在案 · **≠ stack truth ≠ cutover ≠ G6 closed**）。

## 状态

**EXIT=1 · 红如实收** · Key gate 解除 ≠ suite green · migrate EXIT0 ≠ suite green · `g7SuiteGreen=false` · `r1Closed=false` · Disclosure-1 OPEN · trio OPEN（EXIT 1/1/1 retained · class 由 Key-blocked 更新为真实业务红）· `actualSpendCny=null` · awaiting post-prove dual（协调方另派 · Ban 自批）

---

*Receipt · G7K CMD1 e2e:isolated · 2026-10-07 · ×1 · EXIT 1 · failureClass=api · Key gate 解除 · quota 0 复发 · migrate 141 PASS · case 明细 by-design withheld · capability skip 2 · 预算结构估 <50/上限 200 · actualSpendCny=null · g7SuiteGreen=false · STOP*
