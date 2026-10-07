# REQUEST — **GAP-G7K-API-REDS 修复刀**（G7K 三红根因诊断 + 修复方案 + trio 复跑方案 · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-g7k-api-reds-fix.md` · slice `gap-g7k-api-reds-fix.slice.md`
**上游**: G7K nail `0c6c3287`（GAP-G7K-API-REDS P1 OPEN 登记）· G7K EXEC `f02602cb`（实跑 code SHA `8c6860e3` · trio EXIT 1/1/1）
**Base tip**: `7b28a492`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7R**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 诚实性 / HA 口径）

Line G7R · **GAP-G7K-API-REDS 修复刀**（G7K trio 真实业务红的根因诊断 + 修复方案 + trio 复跑 REQUEST）。请审：

1. **诊断前置的只读纪律与证据强度（harness §0/§1）**：本 REQUEST 零实跑零 live 零 Key 加载，证据来源 = git 只读 @`7b28a492`（行号+blob 亲算：spec blob `de4991e6`/`3309dc38`、`full.e2e.ts` `7d65d0f3`、`run-e2e-isolated.mjs` `13dbfc43`、`run-e2e.mjs` `c655235c`、`run-e2e-ui.mjs` `aa86fb3f`、gate blob 与 G7K 收据零漂移）+ G7K committed 收据 + G7K EXEC 磁盘工件（error-context 页快照 / 02 log · 未入 git · 引用合法性如实披露）；**根因假设均标注「假设非断言」**（红② G7K「候选解读」已升级为有证据强假设但仍非断言）——Ban 把假设当结论、Ban 发明未在案明细。
2. **红③ withhold 契约（本审首责）**：三角定位只走合法途径（`run-e2e-isolated.mjs:2084-2098` stderr 永不回显 + stdout 固定格式解析亲读；reviewLedger `[capability:image_ocr_unavailable(:58), capability:voice_unavailable(:153)]` → 执行越过 `:153` → 红面 `:154` 之后 class=api → 首选候选 `full.e2e.ts:199`、次选 `:333`）；**Ban 改 withhold 机制本身（F-E 否决）· Ban 发明 case 名**；EXEC 期 case 名甄别只走收据三角法或协调方显式批准的独立诊断 attempt（F-F · 独立记账 · 不替代 trio ×1）。
3. **修复候选归类与触碰面（harness §2）**：F-A env-gap（首选 · 零代码 · 值由协调方下达）/ F-B 产品缺陷另刀（须独立 REQUEST+双审+EXEC）/ F-C 既有专用 knob 备选（prove 契约变化须全披露 · UC018 断言语义零改）/ **F-D 改 spec 与 F-E 改 withhold = 否决**（Ban 为绿改语义/洗断言）；EXEC 默认 plan 零代码零夹具零 `package.json` 零 spec 零 SSOT。
4. **trio 复跑纪律（harness §3 · G7K C-K1~C-K8 沿用）**：committed SHA 重钉 + frozen-lockfile + 独立 worktree；三条 CMD **各恰好一次**（iso→ui→perf · wiring `:276/:277/:280` @`8c6860e3` 实测 · EXEC 按 tip 重核回填）；单条 CMD 内部重试按自身契约算一次 attempt（Ban 临时调高）；七字段逐 attempt 全记录（含 `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` name-only 探针与 `.env*` 三文件 ABSENT presence）；退出码/machine receipt/原始 log 三来源交叉一致；**Key 只经进程环境 · Ban `.env*` · Ban Key 值/fingerprint 入树**。
5. **预算诚实（harness §3.5）**：上限沿 G7K **≤200 次 live 调用**；**修复生效后 live 面较 G7K 增大**（recruiting-bound 完整 6 题×2 project + CMD1 三驱动全程生成——G7K 的 <120 是 bind 失败、生成面未展开下测得）——偏差已预披露；额度上限以协调方 EXEC 指令为准，超限即停如实记中止；voice/OCR/ASR/TTS capability skip = 0 调用 ≠ green；`actualSpendCny=null` 沿 I 线。
6. **EXIT 契约双向（harness §3.8/§6）**：三绿 → trio 翻绿收据成立，**`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；trio 绿 ≠ suite green——G6 OPEN/R5-MARKED-RED/Disclosure-1 OPEN 独立核算）；仍红 → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法（env-gap 可定性为 FAIL 原因但不冲销 EXIT=1）· Ban retry-to-green · Ban 只留绿 attempt**。
7. **R5-MARKED-RED 与 env 探针保持**：`E2E_ISOLATION_STACK=pgvector-legacy` 披露原样（≠ stack truth ≠ cutover ≠ G6 closed）；docker/chromium/pnpm/node 探针逐 attempt 记录；本机 macOS ≠ 历史 Linux box 差异如实记 env-gap 不洗。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT/backlog 状态翻转（GAP-G7K-API-REDS `0c6c3287` 状态行不翻 · nail 阶段才落字）· Ban 碰已占用行/sibling 归档（G7K 收据 lifecycle 冻结 · AC/AD/U/L/G7B 零改写）· ERRATUM 措辞冻结沿用（观察=`3424dc1` · 消除轮=`82981ff`）。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. `r1Closed=false`. Disclosure-1 **OPEN**. **假设 ≠ 断言** · env 补齐 ≠ H0 定谳 · **Ban 假绿叙事** · Ban 改 withhold · Ban 洗断言。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含 env 注入值与 F-C/F-F 批准权）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · GAP-G7K-API-REDS fix · Line G7R · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
