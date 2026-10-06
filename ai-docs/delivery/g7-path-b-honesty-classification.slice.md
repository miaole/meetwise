# Slice — **G7 Path B honesty 分类刀**（Line G7B · docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · 分类 + 排队清单 · ≠ suite green · Ban `g7SuiteGreen=true` · Ban trio 重跑 · Ban 装 Key 蒙混 · Ban coding · Ban live · Ban Meridian）

**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **`g7SuiteGreen=false`** · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Date**: 2026-10-06
**Base**: `origin/feat/mysql-schema-skeleton` · `4766d4fc`（fetch 网络失败 · 以本地 origin tip 实际值为准 · 满足预期 ≥`4766d4fc`）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7b` · branch `line/g7b-path-b-honesty`
**Knife**: G7 **Path B honesty 刀**（协调方优先级 #4 · (a) 业务断言路径分类 + (b) Path B honesty 方案）· 承接 Line AC NAIL `3922b4859f034f07d43ba9f9b443ac3d29b7687e`（Path A · prove tip `7c818c5fe2249cdac686aa2a0e58748b3c5dea68` · code `160c30cac7a0a05106120949f337847b782647b7` · EXIT **1/1/1** Key-blocked `live_provider_key_missing` · POST dual `fdab68f`+`6f0d015` PASS）与 Line AD residual 轨（`880f144` re-attest 1/1/1 · P2 分类表）
**Experts**: `mw-model-op` + `mw-e2e-ha`（stubs `reviews/REQUEST-2026-10-06-g7-path-b-honesty-mw-model-op.md` + `…-mw-e2e-ha.md` · PENDING · Ban self-approve · alone ≠ dual）

---

## 范围（docs-only · 一次 commit）

1. **分类矩阵**（核心产出 · `harness/g7-path-b-honesty-classification.md` §2）：trio 三条 CMD 全部 FAIL case 逐个归入 **[Key-blocked | 真实产品缺陷 | 夹具/基建缺陷 | 环境缺口]**，逐 case 引 Path A 收据原文（file:line/case id）：
   - **C1/C2/C3 = Key-blocked**（每 CMD 1 个顶层 gate 点）：`e2e-isolated.md:43-45`（`run-e2e.mjs:43` · `assertionCount=null`）· `e2e-ui-isolated.md:36-42`（`run-e2e-ui.mjs:48` · Playwright not reached）· `verify-e2e-performance.md:29-33`（build 0 · migrate 0 · HTTP E2E 1 级联）。
   - **C4 = 夹具/基建缺陷 open**（R5-MARKED-RED pgvector-legacy · BUG-E2E-ISO `gap-bug-backlog.md:98`）· **C10 = 夹具/断言缺陷已修**（A″ ingest 标签 → FIX 已修）。
   - **C5/C6 = 环境缺口已闭合**（Line U docker.sock cleared @ AC Path A · chromium present）。
   - 历史 Key-set era case 级明细（A″ `e697c81` → FIX `a4e3de5` · 唯一 case 级证据 · retained）：C7 quota-tier / C8 recruiting-bound ×2 / C9 capability keys → 全归 **Key-blocked** 族。
   - **计数**：Key-blocked 3+3 · 真实产品缺陷 **0 确认（unknown ≠ 0** · `assertionCount=null` · Ban 写 0 失败/全绿**）** · 夹具/基建 1 族 open + 1 已修 · 环境 0 open。
2. **Path B 方案**（harness §3）：
   - [夹具/基建] 修复刀排队 **Q1–Q3**：Q1 夹具拆分（MySQL/Qdrant · P1）· Q2 云 serial runner 另轨（P2）· Q3 fixture-based mock 断言面（P1 · **必须显式标注「mock ≠ real-model E2E」** · Ban 冒充真模型 E2E · 独立 REQUEST+双审）。
   - [Key-blocked] 保持披露：Ban 装 Key 蒙混 / Ban 假 Key 占位（`run-e2e.mjs:42` `fake_service_mode_forbidden` 守门）· 解锁条件账沿用 AD P4（live Key + 预算 + live 双审 + 协调方授权 = 另刀）。
   - [真实产品缺陷] backlog 登记：**0 确认 → 登记为 unknown(null) · 非 0**；不发明缺陷行；未来登记须已执行 case 证据。
3. **诚实条款**（harness §4）：`g7SuiteGreen=false` 保持 · trio OPEN 1/1/1 retained · **本刀不跑 trio**（Ban 与 AC/AD 收据重复跑 · 分类全引用既有收据）· mock ≠ real-model E2E · Ban 假绿叙事 · Ban live（0 模型调用 · `actualSpendCny=null`）。
4. **边界**：docs-only 分类 + 排队清单；**零产品改动**；SSOT nail 期才碰；Ban live；Ban 碰 sibling 线归档。

## ERRATUM（retained · 原文措辞）

FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · **Ban** shorthand `quota-403=82981ff` · **Ban** `b1d7b22` @ 09-23 for that removal。

## Non-claims

Not a pass · not run · not suite green · not trio green · not fixed · not R1/Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not live · not mock-surface implementation · Key-blocked ≠ pass · mock ≠ real-model E2E · unknown(null) ≠ 0 · trio OPEN 1/1/1 · `g7SuiteGreen=false` · alone ≠ dual

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN.

---

*Slice · G7 Path B honesty classification · Line G7B · 2026-10-06 · draft:awaiting_pre_exec_dual · docs-only · 四分类 C1–C11 · 排队 Q1–Q3 · Ban trio 重跑 · Ban 装 Key 蒙混 · Ban 假绿 · Ban live · STOP*
