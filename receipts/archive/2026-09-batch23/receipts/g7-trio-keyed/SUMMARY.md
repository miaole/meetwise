# SUMMARY — G7 trio keyed fresh run（Line G7K EXEC · `executed:awaiting_post_prove_dual` · 2026-10-07）

**Lifecycle**: **`executed:awaiting_post_prove_dual`**（EXEC 实跑落盘 · trio EXIT **1/1/1** · **≠ suite green** · **≠ trio green** · post-prove dual 由协调方另派 · Ban 自批 · alone ≠ dual）
**授权链**: REQUEST `19df4e7f`（origin 链 · 本地孪生 `bfad493f` patch-id `d6093f0c` 全等）→ PRE dual **BOTH PASS**（mw-model-op `794f288d` 镜像 `d74c957e` + mw-e2e-ha `615ee8bf` 镜像 `2254fbf0`）→ 协调方 **U4 EXEC 显式授权**（2026-10-07 · 额度上限 200 次 live 调用）→ 本 EXEC（三条 CMD 各 ×1 · 无重跑）。
**实跑 code SHA**: **`8c6860e33d925628771acaaa9de5bc2dbaa72cb6`**（origin tip · worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7k` · branch `line/g7k-trio-keyed` · CMD3 machine receipt `gitHead` 自证同值 · **receipt commit ≠ 实跑 code SHA**）
**Wiring @`8c6860e3`**: `e2e:isolated` `:276` · `e2e:ui:isolated` `:277` · `verify:e2e-performance` `:280`（与 REQUEST 基点 `50423a6f` 零漂移 · gate blob `c655235c`/`aa86fb3f` 零漂移）
**Receipts**: `ai-docs/delivery/receipts/g7-trio-keyed/`（本 SUMMARY + 3 per-CMD）

---

## EXIT table（each CMD ×1 · Ban retry-to-green · 逐 attempt 全记录）

| # | CMD | Start (CST) | End (CST) | EXIT | 失败类 | 一句话原因 |
|---|-----|-------------|-----------|------|--------|------------|
| 1 | `pnpm e2e:isolated` | 21:30:06 | 21:30:45 | **1** | **api** | **Key gate 解除**（`live_provider_key_missing` 0 hit）· migrate applied=141 全 PASS · HTTP E2E 断言脚本失败退出（class=api · case 明细 by-design withheld）· capability skip 2 |
| 2 | `pnpm e2e:ui:isolated` | 21:34:09 | 21:37:45 | **1** | frontend（suite 级）/ **api**（case 级） | Playwright launch **已到达**（对比 AC「not reached」翻转）· **24 tests = 10 passed / 4 failed / 10 skipped** · recruiting-bound ×2 waitForURL 30s timeout（bind URL 不出现）+ uc018-abandon ×2 abandon proxy **409≠200** |
| 3 | `pnpm verify:e2e-performance` | 21:39:16 | 21:41:41 | **1** | api（级联） | build EXIT0（97.2s）+ migrate EXIT0（15.0s）→ **HTTP full E2E EXIT=1（31.8s · class=api 同 CMD1 根因）** → suite 契约短路，后续 24 步 not_run |

**Trio EXIT**: **1 / 1 / 1**（EXIT 原值与 AC `7c818c5`、AD `880f144` retained 相同；**失败性质翻转：Key-blocked → 真实业务红**——gate 解除后业务 case 首次真实执行，红 = 真实，非环境、非 Key、非 flake）

## 三 gate 解除验证（本刀核心冲击结果）

| Gate | AC Path A（`7c818c5`） | 本刀（`8c6860e3`） | 判定 |
|------|------------------------|---------------------|------|
| C1 iso Key gate（`run-e2e.mjs:43`） | 顶层 throw `live_provider_key_missing` | **0 hit** · 业务 case 实跑 | **解除** |
| C2 UI Key gate（`run-e2e-ui.mjs:48`） | Playwright launch not reached | **已到达 · 24 tests 实跑** | **解除** |
| C3 perf HTTP 级联 | HTTP 步 Key-blocked | HTTP 步 class=**api**（非 provider 类） | **解除**（级联点翻转） |
| quota 残余（消除轮 `82981ff` 验证） | —（era 早于消除轮） | `FreeTierOnly/AllocationQuota` 三 log **0 hit** | **无复发** |

**Key-blocked 类清零（本刀范围内）**：G7B 四分类的 C1/C2/C3 顶层 Key-blocked FAIL 点在本 tip + live Key 下**全部解除**；C7（quota）无复发；C8（recruiting-bound）按 G7B 处置「随 live 解锁刀复核」在本刀复核 = **仍红、非 quota、归 api 类候选真实缺陷**。

## 逐 case 红明细（本刀唯一 case 级证据面 · 五分类）

| CMD | case / 步骤 | 分类 | 明细 |
|-----|-------------|------|------|
| CMD1 | HTTP E2E 断言脚本（`full.e2e.ts`）退出非零 | **api** | runner 判定 `failureClass=api`；case 级名 **by-design withheld**（wrapper stderr 永不回显 + stdout 仅固定格式解析 · 产品安全契约 · 本刀零绕过）；capability skip ×2（image_ocr_unavailable / voice_unavailable） |
| CMD2 | `recruiting-bound.spec.ts:56` × chromium+mobile | **api** | `waitForURL(/\/interview\/iv_…?applicationId=app_/)` 30s timeout @`:96`（「开始面试」按钮 visible 已过）→ interview bind URL 不出现；**G7B C8 复核点：仍红 · 非 quota** |
| CMD2 | `uc018-abandon.spec.ts:68` × chromium+mobile | **api** | abandon proxy **Expected 200 / Received 409** @`:139`；与 recruiting-bound 同根性为候选解读（in-interview 状态未建立 → abandon 409）如实标注，非断言，修复刀复核 |
| CMD2 | voice-duplex ×6（:166/:205/:237 × 2 project） | provider/capability（skip） | `DASHSCOPE_TTS/ASR_API_KEY unset` 诚实 capability skip · 0 调用 · ≠ voice green |
| CMD2 | online-public ×4（:20/:34 × 2 project） | env 条件（skip） | `ONLINE_BASE_URL` 未设（公网冒烟非本地范围）· 非 FAIL |
| CMD3 | HTTP full E2E 步 | **api** | 同 CMD1；step4–27 **not_run**（suite 短路契约 · ≠ pass） |

**缺陷登记口径**：本刀 EXEC 零触碰 SSOT（gap-bug-backlog 零 diff）；上述 api 类红（recruiting-bound bind 路径 · abandon 409 · iso 脚本 api 红面）按 REQUEST 条款**登记 backlog 修复另刀**，登记动作留协调方 nail 阶段（append-only）。

## 预算披露（额度 200 · 未超限 · 无中止）

- 精确 per-call 计数面 by-design 不存在（G7 cost ledger 仅 `G7_FREETIER_REPROVE=1` 路径启用 · 本刀未设 · Ban 为计数改产品）。
- 计数方法 = **结构面估计**：CMD1 ≈3×interview 驱动+quiz/diagnosis/report ≈ **<50**；CMD2 live 面仅 recruiting-bound ×2 ≈ **<20**；CMD3 = HTTP E2E 复跑同源 ≈ **<50**。**trio 合计结构估 < 120 次 < 200 上限**——未触限、未中止。
- **`actualSpendCny=null`**（沿 I 线 · 无计价数据源 · No invented spend · 金额须协调方另给计价依据）。

## Key 卫生声明（C-K6 / C-MO-G7K-3）

Key **只经进程环境**（`source ~/.meetwise-secrets/load-model-api-key.sh` · loader 原文在 REQUEST harness §2.3 在档）；`.env*` **零写入零读取**（auto-load 分支 `run-e2e.mjs:16-21` 未触发——三文件全 ABSENT）；Key 值/fingerprint **零打印零入树**；原始 log 留 `.tmp/g7k-keyed-20261007/`（gitignore 生效未入 git）；receipt 摘录过无-Key 自查；NEW_SHELL_STATUS 类探针 name-only。

## presence-only 探针（C-MO-G7K-2 · 每 CMD 跑前各一次 · 共 3 次）

| 时点 | `.env` | `.env.local` | `apps/api/.env` |
|------|--------|--------------|------------------|
| CMD1 前 | ABSENT | ABSENT | ABSENT |
| CMD2 前 | ABSENT | ABSENT | ABSENT |
| CMD3 前 | ABSENT | ABSENT | ABSENT |

## env-gap 记录

**0 阻断 env-gap**：docker Desktop server 29.1.3（session 已有权限 · 无需 `with-docker-session.sh`）· chromium cache 在（零安装）· pnpm 10.18.0 / node v22.22.3 · `pnpm install --frozen-lockfile` EXIT=0（18.6s）· 本机 macOS darwin arm64 与历史 Linux box 差异未产生任何 FAIL 归因。R5-MARKED-RED `E2E_ISOLATION_STACK=pgvector-legacy` 披露三 log 逐字在案（**≠ stack truth ≠ cutover ≠ G6 closed**）。

## Pins（原值 · EXEC 后未翻转项）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained**: **`g7SuiteGreen=false`**（三红在案 · 翻转 = 三绿 + post-dual BOTH + 协调方 nail，缺一不可）· `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN** · trio **OPEN**（EXIT 1/1/1 · 失败性质更新为真实业务红）· `actualSpendCny=null`
**SSOT 零触碰**（gap-bug-backlog / execution-master-checklist / 覆盖矩阵零 diff · 登记留 nail 阶段）

## Non-claims

Not a pass · not suite green · not trio green · not family green · not fixed · not classified-as-green · not R1 closed · not Disclosure-1 closed · not TECH_ROLE closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · Key gate 解除 ≠ case 全过 · migrate/build EXIT0 ≠ suite green · chromium ran ≠ UI green · capability skip ≠ voice/OCR green · 10 passed ≠ UI green · not_run ≠ pass · skip ≠ pass · `g7SuiteGreen=false` · `r1Closed=false` · trio OPEN · alone ≠ dual（post-dual 未开始 · Ban 自批）

---

*SUMMARY · G7 trio keyed fresh run · Line G7K EXEC · 2026-10-07 · lifecycle executed:awaiting_post_prove_dual · 实跑 code SHA 8c6860e3 · trio EXIT 1/1/1（Key-blocked → 真实业务红翻转 · 三 gate 解除 · quota 0 复发）· CMD2 24=10P/4F/10S（F: recruiting-bound×2 api · abandon 409×2 api）· CMD3 build+migrate PASS 后 HTTP 步 class=api 短路 24 步 not_run · 预算结构估 <120/上限 200 未超限 · actualSpendCny=null · presence 探针 3×全 ABSENT · env-gap 0 · Pins 原值 · g7SuiteGreen=false · 等待协调方另派 post-prove dual · STOP*
