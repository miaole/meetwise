# Harness — **G7 Key-blocked residual · Path-B-style honest receipts track**（Line AD · NAIL · **`post_prove_dual_pass`** · ≠ suite green · Key-blocked residual receipts landed · **`g7SuiteGreen=false`**）

**Status**: **`post_prove_dual_pass`**（Line AD nail · EXIT **1/1/1** Key-blocked `live_provider_key_missing` · **`g7SuiteGreen=false`** · Disclosure-1 **OPEN** · R1 **OPEN** · P1–P5≠gate R1 · assertionCount=null · 0 model · actualSpendCny=null · coveredCount=8 · Key-blocked ≠ pass · Ban wash suite green · Ban `g7SuiteGreen=true` · Ban live · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban self-approve beyond this authorized nail）

> **REQUEST-era note（historical · retained）**: this file began as REQUEST `draft:awaiting_pre_exec_dual`. PROVE_TIP **`f4981cb`** / `f4981cb6f75d5710039915b47e063e9192248da0` · stubs `2e4a825` / `2e4a825bc1c77d5428bdab281dba4c4aaf6104f2` · EXIT **1/1/1** Key-blocked · PRE dual mw-e2e-ha `f215438` + mw-model-op `2d422c1` · POST dual mw-e2e-ha `ea00c93` + mw-model-op `c4bc836` BOTH PASS. Lifecycle advanced to **`post_prove_dual_pass`** by Line AD nail only. Ban flipping G7 green / R1 closed / Disclosure-1 closed.
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **`g7SuiteGreen=false`**
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`416b6a5`** / full `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8`（wave start · sibling Line AE/AF/AG/AH REQUEST commits may land alongside · Ban touch siblings）
**Knife**: **G7 Key-blocked residual honest receipts track**（Line AD · coordinator 称「G7 Path B 诚实收据」）——把 Line AC Path A 之后 **残余 FAIL class = Key-blocked** 钉成 **可复核、不可洗绿** 的残余收据轨；**不是** suite 翻绿刀 · **不是** live 刀 · **不是** Key 供给刀
**Gap / theme**: G7 trio（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）**OPEN 1/1/1** · dominant FAIL = **Key-blocked** `provider/live_provider_key_missing`（Line AC nail 登记）
**Prior nail**: Line AC · NAIL **`3922b48`** / `3922b4859f034f07d43ba9f9b443ac3d29b7687e` · prove tip **NAILED TO `7c818c5`** / `7c818c5fe2249cdac686aa2a0e58748b3c5dea68` · code `160c30c` / `160c30cac7a0a05106120949f337847b782647b7` · receipts tip `5481d4d` · REQUEST `94a8b2a` · POST dual mw-e2e-ha `fdab68f` + mw-model-op `6f0d015` BOTH PASS · EXIT **1/1/1** Key-blocked
**Experts**: `mw-e2e-ha` + `mw-model-op`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT flip · Ban invent covered · Ban suite green claim · Ban self-nail

## 1. 现状如实陈述（只读 · 零改写）

Line AC Path A（`sg docker` / `scripts/with-docker-session.sh` 激活 **既有** docker 组 · Ban sudo/chmod/usermod/setfacl）把 Line U env-gap **清除于本 host/session class**；trio 各 ×1 越过 DB/migrate 门后 **全部撞 Key-blocked fail-closed**：

| # | CMD（`package.json` @ `416b6a5`） | Line AC EXIT | 首个 FAIL 点（read-only cite @ `416b6a5`） | 残余读法 |
|---|-----------------------------------|--------------|---------------------------------------------|----------|
| 1 | `pnpm e2e:isolated`（`:260` → `run-e2e-isolated.mjs e2e:prove`） | **1** | `scripts/run-e2e.mjs:43` top-level `throw tagE2EFailure('provider','live_provider_key_missing')` · machine receipt `assertionCount=null`（case ledger 前抛出） | **Key-blocked** · 零业务 case 执行 · ≠ pass |
| 2 | `pnpm e2e:ui:isolated`（`:261`） | **1** | `scripts/run-e2e-ui.mjs:48` 同 code · chromium present ≠ UI green | **Key-blocked** · Playwright case not_run |
| 3 | `pnpm verify:e2e-performance`（`:264`） | **1** | web build 0 · `migrate:prove` 0 · HTTP full E2E 1（同 Key gate · `e2e_performance_suite_failed:HTTP full E2E:exit=1`） | **Key-blocked**（cascaded）· PERF 数据 not_run |

**行号漂移注**: Line AC prove tip 钉 `:251/:252/:255`；`416b6a5` 为 `:260/:261/:264`（中间提交加脚本）——执行时按当 tip 重核，**Ban** 用新行号改写 Line AC 收据。

**Calibrated pins retained**: `g7SuiteGreen=false` · trio **OPEN 1/1/1** · Disclosure-1 **OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` e2e default · never counts toward R1）· R1 **OPEN**（`r1Closed=false`）· R5-MARKED-RED pgvector-legacy · G6 still OPEN · 0 model calls · `actualSpendCny=null`。

**ERRATUM retained**: FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22` @ 09-23 for that removal。

## 2. 本刀目标（诚实残余收据 · 非绿）

> **Goal**: 在 **Ban live · Ban buy cloud · Ban secrets · Ban Meridian** 约束下，Key-blocked 是 **约束内不可逾越** 的残余（Key 供给 = 用户/协调方另行授权的 live 刀，不在本轨）。本刀把该残余做成 **Path-B 式诚实收据**：可复核、可交叉引用、可被未来 live 刀直接接手——**不是** suite green、**不是** 关 G7。

| 产物（授权后） | 内容 | 诚实口径 |
|----------------|------|----------|
| **R1 · Key-gate 静态定位账** | read-only 钉死三条 CMD 的 Key gate 源码点（`run-e2e.mjs:43` / `run-e2e-ui.mjs:48` / perf HTTP 步委派链）+ 守护 proof（`scripts/g6-e2e-iso-blocked.proof.mjs:84` · `scripts/uc-e2e-001-live-blocked.proof.mjs:55`）— file:line + blob | 静态定位 ≠ 执行 · ≠ pass |
| **R2 · 残余分类表** | 每条 CMD：env-gap（cleared @ Line AC）/ Key-blocked（OPEN）/ business-assert（**unreached** · 未知）/ not_run 三分 · 业务 case 数 = **未知（null）** 显式登记 | Ban 把 `assertionCount=null` 写成 0 失败 / 全绿 |
| **R3 · 可选新鲜 re-attest ×1（Branch B′）** | 若协调方授权：当 tip trio 各 **恰一次**（经 `with-docker-session.sh` · `env -u MODEL_API_KEY -u MODEL_BASE_URL`）确认 class 仍 Key-blocked；EXIT 如实（预期 1/1/1） | Ban retry-to-green · Ban 只留绿 attempt · Ban live |
| **R4 · 解锁条件账（unlock ledger · 非执行）** | 书面列明：要越过 Key-blocked **须** live Key 供给 + live 预算 + mw-model-op live 双审 + 协调方显式授权（另刀 · Line C live chat-only `7eb1a7e` 先例 ≠ trio）| 列条件 ≠ 授权 · ≠ 承诺 |
| **R5 · SUMMARY** | 拟 `receipts/g7-key-blocked-residual-honest/SUMMARY.md`：引 Line AC 链 + R1–R4 + pins + non-claims | `g7SuiteGreen=false` 原值入 SUMMARY |

**明确非目标（Ban）**:

- **Ban** 把 Key-blocked 叙述为 pass / skip-as-pass / 「环境限制可视为通过」/ not_run-as-pass
- **Ban** `g7SuiteGreen=true` · Ban 宣称 suite / trio / family green · Ban R1/Disclosure-1 closed
- **Ban** live（零真实模型调用 · 不加载 Key · 不读 `.env*` · 无 Key fingerprint）· Ban fake-model / 假 provider 冒充 Key 通过
- **Ban** 绕 Key gate（Ban 改 `run-e2e*.mjs` 降级 · Ban 设假 `MODEL_API_KEY` 占位串过门 · Ban 开假服务开关）
- **Ban** buy cloud · Ban Meridian · Ban secrets · Ban force-push

## 3. 分支方案（本 commit 不写码 · 不实跑）

| 分支 | 触发 | 内容（授权后） | Ban |
|------|------|----------------|-----|
| **A · docs-only 残余账** | 默认 · 无需新跑 | R1 + R2 + R4 + R5，全部 **引用** Line AC 收据（blob 锚 `git hash-object` 前后一致）+ read-only 源码 cite；CITE_EXIT=引用 Line AC 1/1/1 | Ban 新跑冒充 · Ban 改旧收据 |
| **B′ · re-attest ×1** | 协调方另授权（tip 前移后需确认 class 未漂移） | A 全部 + R3（trio 各恰一次 · Keys stripped）；若 class 漂移（如回到 env-gap 或出现新 class）→ 如实入账，**不**自行修复 | Ban retry-to-green · Ban live · Ban 修码 |

**不存在的分支**: 「Key 到位后跑绿」不属本刀；任何 live 尝试须独立 REQUEST + mw-model-op live 双审 + 预算授权。

## 4. 验证契约（仅授权后 · 本 REQUEST 零实跑）

1. **Base**: 执行时 `git fetch` 后钉 committed SHA；Line AC prove tip 永远 **NAILED TO `7c818c5`**（Ban 用更晚 tip 冒充）。
2. **Worktree**: 独立 worktree（拟 `/workspace/meetwise-lineAD` · branch `line/ad-g7-key-blocked-residual`）；`pnpm install --frozen-lockfile`；禁改 lockfile。
3. **Branch B′ CMD**: `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <cmd>` × trio，各恰一次；CMD + EXIT + 起止时间（Asia/Shanghai）+ code SHA。
4. **门控探针（B′ 必录）**: `id`/groups · `ls -l /var/run/docker.sock` · `docker info` 首行（**Ban** 打印 Key / `.env*`）。
5. **收据落点（拟）**: `ai-docs/delivery/receipts/g7-key-blocked-residual-honest/`（per-CMD 仅 B′ · `SUMMARY.md` 必有）。
6. **Ban live**: 模型调用 0 · Keys unset · `actualSpendCny=null`。
7. **SSOT**: 本 REQUEST **零触碰** backlog / checklist / 矩阵；登记留给未来 nail 且须协调方授权。

## 5. 行语义 / 状态冻结

- trio stays **OPEN 1/1/1** · `g7SuiteGreen=false` · Disclosure-1 **OPEN** · R1 **OPEN** · coveredCount=**8** · Ban invent covered
- Line AC / Line U nail 证据链 **保留**（Ban 改写 · Ban 用本轨冲销 env-gap 历史）
- G6 / R5-MARKED-RED / BUG-E2E-ISO **不**因本刀关闭

## 6. Ban 列表

- Ban coding（本 turn docs-only）· Ban prove 执行（须 PRE dual BOTH PASS + 协调方授权）
- Ban live · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban fake green
- **Ban `g7SuiteGreen=true`** · **Ban washing Key-blocked as pass** · Ban 绕 Key gate · Ban fake-model
- Ban 宣称 suite / trio / family green · Ban covered flip · Ban SSOT 擅自翻行
- Ban retry-to-green · Ban flake wash · Ban self-approve（alone ≠ dual）· Ban self-nail
- Ban 碰 Line AE/AF/AG/AH 文件 · Ban 碰 018/052/025 · Ban 代发 agent 消息

## 7. Non-claims

Not a pass · not run · not suite green · not trio green · not fixed · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not live · not Key provisioning · not buy-cloud · Key-blocked ≠ pass · `g7SuiteGreen=false` · trio OPEN 1/1/1 · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false` · Disclosure-1 OPEN · R1 OPEN · STOP

*Harness · G7 Key-blocked residual honest receipts · Line AD · REQUEST-era footer retained historically · Ban coding · Ban g7SuiteGreen=true · Ban live · Ban buy cloud · Ban Meridian · Ban washing Key-blocked as pass*

---

## Execution addendum（Line AD · 2026-10-06 · additive · lines above unchanged so PRE-review line cites stay valid）

**Label rename（C-MO-AD-6 · AUTHORIZE cond. 3）**: in all execution receipts the §2 products **R1–R5 are labelled P1–P5**（R1→P1 Key-gate cite · R2→P2 residual table · R3→P3 re-attest ×1 · R4→P4 unlock ledger · R5→P5 SUMMARY）. **P1-product ≠ gate R1**; gate R1 stays **OPEN**; "R1/P1 done" must never be read as gate R1 closed.

Executed per coordinator AUTHORIZE（PRE BOTH PASS: mw-e2e-ha `f215438` · REQUEST `f32f56d` · mw-model-op `2d422c1`）: Branch A + B′ · exec HEAD `880f144` · trio EXIT **1/1/1** Key-blocked · receipts `ai-docs/delivery/receipts/g7-key-blocked-residual-honest/` · `g7SuiteGreen=false` · Disclosure-1/R1 OPEN · coveredCount=8 · 0 model calls · POST dual BOTH PASS · Ban self-nail beyond authorized nail.

---

## 8. Line AD NAIL lifecycle（`post_prove_dual_pass` · 2026-10-06 · additive）

- Lifecycle on this harness/slice/SUMMARY: **`post_prove_dual_pass`**.
- **PROVE_TIP**（receipts · NAILED TO · do **not** claim a later tip as the prove tip）: `f4981cb` / `f4981cb6f75d5710039915b47e063e9192248da0` · stubs tip `2e4a825` / `2e4a825bc1c77d5428bdab281dba4c4aaf6104f2` · exec HEAD `880f144` / `880f14408dda9a9cb03737b811b6005d94c3a2dc`.
- **PROVE_EXIT 1/1/1** · Key-blocked `live_provider_key_missing` · assertionCount=**null** · business-assert **unreached** · **0 model calls** · `actualSpendCny=null`.
- PRE dual BOTH PASS: mw-e2e-ha `f215438` / `f2154387df654b4600b74b4c8a52c1d35f5986b2` + mw-model-op `2d422c1` / `2d422c14e585c544a162f536cc9b3058a7d14e30`.
- POST dual BOTH PASS: mw-e2e-ha `ea00c93` / `ea00c936a032fc7334d46762c33709b6dbe016bb` + mw-model-op `c4bc836` / `c4bc83679eaac6ec92c257c4739d4a31dc9d2e49`（honesty of Key-blocked residual · alone≠dual）.
- Products: **P1–P5**（Key-gate cite / residual class / re-attest ×1 / unlock ledger / SUMMARY）. **P1–P5 ≠ gate R1** · gate R1 stays **OPEN** · Disclosure-1 **OPEN**.
- FAIL class honesty: **Key-blocked ≠ pass** · Ban wash suite green · Ban `g7SuiteGreen=true` · Ban live · Ban buy cloud.
- **STILL_OPEN**: trio **OPEN 1/1/1** · **`g7SuiteGreen=false`** · Disclosure-1 **OPEN** · R1 **OPEN**.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.
- **Addendum（model-op non-blocker · C-MO-AD POST）**: future keys-stripped re-attest **must** treat **`.env` / `.env.local` / `apps/api/.env` absence** as a **required pre-probe assertion**（**presence-only** check · **never read contents**）because `run-e2e.mjs:15–19` auto-loads `ROOT/.env` when present and could bypass `env -u MODEL_API_KEY -u MODEL_BASE_URL`. Keep that probe required; Ban secrets / Ban reading `.env*` contents.
- Keep siblings（Line AC G7 Path A nail · Line AE/AF/AG/AH · Line U）as written. Ban overwriting sibling nails.

---

*Harness · G7 Key-blocked residual honest receipts · Line AD NAIL · 2026-10-06 · lifecycle post_prove_dual_pass · PROVE_TIP f4981cb · POST ea00c93+c4bc836 PASS · EXIT 1/1/1 Key-blocked · g7SuiteGreen=false · Disclosure-1 OPEN · R1 OPEN · P1–P5≠gate R1 · .env absence probe required · Ban wash suite green · Ban live · releaseEvidence=false · STOP*
