# Harness — **G7 env-gap honest fix track**（Line AC · NAIL · **`post_prove_dual_pass`** · ≠ suite green）

**Status**: **`post_prove_dual_pass`**（Line AC nail · Path A · EXIT **1/1/1** Key-blocked `live_provider_key_missing` · **`g7SuiteGreen=false`** · Disclosure-1 **OPEN** · R1 **OPEN** · Key-blocked ≠ pass · Ban wash suite green · Ban coding · Ban live · Ban Meridian · Ban secrets · Ban force-push · Ban self-approve beyond this authorized nail）

> **REQUEST-era note（historical · retained）**: this file began as REQUEST `draft:awaiting_pre_exec_dual`. CODE `160c30c` · PROVE tip **`7c818c5`** · EXIT **1/1/1** Key-blocked · post dual mw-e2e-ha `fdab68f` + mw-model-op `6f0d015` BOTH PASS. Lifecycle advanced to **`post_prove_dual_pass`** by Line AC nail only. U env-gap cleared via `sg docker` / `scripts/with-docker-session.sh`（Ban sudo/chmod/usermod）.
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`f43bea1`** / full `f43bea12fc7f2e28e7bb0052b6a80811eac47e91`
**Knife**: **G7 env-gap honest fix track**（Line AC）——把 Line U trio 新鲜跑钉死的 **env-gap** 推到「真撞到业务断言」**或**「钉清不可逾越 blocker」；**不是** suite 翻绿刀
**Gap / theme**: **FAIL class = env-gap**（Line U nail 登记 · backlog `gap-bug-backlog.md` Line U 段 · receipts `g7-trio-fresh/`）
**Prior nail**: Line U · tip **`7c631c2`** / `7c631c26a1d173cd47f2543287ead287ef00fd23` · prove tip **`9ff3daf`** · code **`e8c63a9`** · EXIT **1/1/1** · `g7SuiteGreen=false` · Disclosure-1/R1 **OPEN**
**Experts**: `mw-e2e-ha` + `mw-model-op`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT flip · Ban invent covered · Ban suite green claim

## 1. 现状如实陈述（先读证据 · 零改写）

Line U G7 trio fresh（REQUEST `1c57bb3` · PRE dual BOTH PASS · prove `9ff3daf` @ code `e8c63a9` · POST dual BOTH PASS · NAIL `7c631c2`）在 committed SHA 上产出新鲜 CMD+EXIT，**三条均未到达业务断言**：

| # | CMD | EXIT | Dominant FAIL | Detail（引 SUMMARY / per-CMD receipt） |
|---|-----|------|---------------|----------------------------------------|
| 1 | `pnpm e2e:isolated` | **1** | **env-gap** | `E2E_FAILURE class=db code=database_not_ready` · isolation DB never ready · **zero cases ran** · host uid `box` **not** in `docker` group · `docker.sock` **permission denied** |
| 2 | `pnpm e2e:ui:isolated` | **1** | **env-gap** | same `database_not_ready` **before** Playwright · cases **not_run** · chromium **1.61.1 / v1228** installed（**chromium ≠ UI green**） |
| 3 | `pnpm verify:e2e-performance` | **1** | **env-gap**（cascaded） | web build EXIT=0 → **`migrate:prove` / schema migration EXIT=1** → HTTP full E2E **not_run**（not_run ≠ pass）· same docker.sock gap |

**Calibrated pins retained（Line U nail · 本刀不改）**: `g7SuiteGreen=false` · trio **OPEN 1/1/1** · Disclosure-1 **OPEN**（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` · never counts toward R1）· R1 **OPEN**（`r1Closed=false`）· fixture disclosure **R5-MARKED-RED** pgvector-legacy / **G6 still OPEN** · Ban live（Keys unset · 0 model calls · `actualSpendCny=null`）.

**ERRATUM retained（Line U）**: FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff` · Ban `b1d7b22` @ 09-23 for that removal.

## 2. 本刀目标（诚实 · 二选一成功判据）

> **Goal**: 可复现路径，把 trio 从 **env-gap（DB/migrate 门前红）** 推到下列 **之一** —— **不是** 宣称 suite green。

| Outcome | 成功判据（授权执行后） | 仍须保留的诚实口径 |
|---------|------------------------|--------------------|
| **A · 越过 env-gap** | 三条 CMD 各自越过 isolation DB / migrate 门，**真撞到业务断言或 Key-blocked fail-closed 业务路径 FAIL**（case 级明细可排队）；EXIT 仍如实（预期多为 1） | `g7SuiteGreen=false` · Disclosure-1/R1 **OPEN** · Ban 假绿 · Ban covered flip · Ban live |
| **B · 钉清不可逾越 blocker** | 书面钉死：在 **Ban buy cloud · Ban Meridian · Ban secrets · Ban privilege 越权** 约束下，本 host/class **无法**获得可用 isolation DB（docker.sock / 等价 fixture 不可达），且无合规替代路径；blocker 入 receipt + nail | 同上 · trio stays OPEN 1/1/1 · env-gap 登记保留 · **≠** suite green 借口 |

**明确非目标（Ban）**:

- **Ban** 把本刀叙述为 suite green / trio green / family green / R1 closed / Disclosure-1 closed
- **Ban** `g7SuiteGreen=true`（本刀及后续执行 **除非未来协调方另行授权** —— 默认 stays **false**）
- **Ban** live（真实模型 API 调用 0 · 不加载 Key · 不读 `.env*`）
- **Ban** buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban fake green
- **Ban** 把 env-gap 冲销成 flake / not_run-as-pass / 「环境偶发」洗绿

## 3. 根因钉定（env-gap · 非产品业务断言红）

**共同根因（三条）**: isolation runner 需要本机 Docker 起 PG fixture；uid `box` 对 `/var/run/docker.sock` **permission denied**（不在 `docker` group）→ DB never ready → iso/ui `database_not_ready`；perf 在 migrate 步同因 EXIT=1，HTTP E2E not_run。

**不是**（本轮证据下）:

- 不是 Key-blocked live chat 业务红（Keys 故意 unset · Ban live · 未到 chat 断言）
- 不是 FIX 历史 403 FreeTierOnly 重演（quota-403 消除轮 `82981ff` · 观察 `3424dc1` · 本轮未触达）
- 不是 chromium 缺失（UI 已装 chromium；门在 DB 前）
- 不是 flake（attempt ×1 · EXIT=1 诚实 · Ban wash）

**Fixture 旁证（保留 · 不 wash）**: stderr **R5-MARKED-RED** `E2E_ISOLATION_STACK=pgvector-legacy` · G6 still OPEN · **≠** 本刀关闭 G6 / R5。

## 4. 分支方案（本 commit 不写码 · 不实跑 · 不买云）

| 分支 | 触发 | 内容（授权后） | Ban |
|------|------|----------------|-----|
| **A · remediable env** | 在 **不** buy cloud / Meridian / secrets / force-push 前提下，协调方/主机运营可授予合规 docker 访问（例：把 runner uid 加入 `docker` group、或提供已授权的 rootless/socket ACL、或预置合规 isolation 等价物——**须双审可验收、可复现**） | (1) 记录 remediation 动作与前后探针（`docker info` / sock 权限 · **Ban** 把密钥写入树）；(2) committed SHA 上 trio 三条 CMD **各恰一次**（Ban retry-to-green）；(3) 收据写清：是否越过 DB/migrate 门、撞到哪些业务断言或 Key-blocked fail-closed；(4) `g7SuiteGreen` **保持 false** | Ban live · Ban secrets 入树 · Ban 假绿 · Ban 宣称 suite green |
| **B · impassable blocker nail** | remediation 需要 buy cloud / Meridian / 越权提权 / secrets 泄露路径，或双审认定本 host/class 无合规可达路径 | 钉 blocker：证据链（sock mode/owner/group · uid/groups · `docker info` permission denied · Line U receipts 交叉引用）+ 明确「不可逾越」判据 + 仍 OPEN 的 G7/trio/Disclosure-1/R1 | Ban 用 blocker 叙事冲销为「可当绿」· Ban 发明替代绿路径 |

**Branch A 越过门后的诚实预期（非绿）**: Keys unset → 业务路径多为 Key-blocked / `generation_provider_not_configured` / fail-closed **EXIT=1** —— 这是 **「真撞到业务断言/fail-closed」成功**，**不是** suite green。三条全绿才有资格**讨论** suite green（仍须 post-run dual + 协调方授权 + nail）；本刀 **默认不讨论翻 `g7SuiteGreen`**。

## 5. prove / 验证契约（仅协调方授权后 · 本 REQUEST 零实跑）

1. **Base**: 执行时 `git fetch` 后钉 committed SHA（本 REQUEST parent = `f43bea12…`；若 tip 前移，按当 tip 重核 `package.json` 行号）。
2. **Worktree**: 独立 worktree（先例 `/workspace/meetwise-lineAC` · branch `line/ac-g7-env-gap-fix`）；`pnpm install --frozen-lockfile`；禁改 lockfile。
3. **CMD 集（trio · 与 Line U 同）**: `pnpm e2e:isolated` · `pnpm e2e:ui:isolated` · `pnpm verify:e2e-performance` —— 行号按当 tip 重核（Line U prove @ tip 曾钉 `:246` / `:247` / `:250`）。
4. **每条恰一次**: CMD + EXIT + 时间戳 + 实跑 code SHA；红了不重跑；Ban flake 记法；Ban 只留绿 attempt。
5. **门控探针（必录）**: remediation 前后 `id`/`groups`、`ls -l /var/run/docker.sock`、`docker info` 首行错误或成功（**Ban** 打印任何 Key / `.env*`）。
6. **收据落点（拟）**: `ai-docs/delivery/receipts/g7-env-gap-honest-fix/` —— per-CMD + `SUMMARY.md`；须含：是否越过 DB/migrate、case 级明细或 Key-blocked 分类、env-gap vs business-assert 分界、`g7SuiteGreen=false`、Disclosure-1/R1 OPEN。
7. **Ban live**: 模型调用 0 · Keys unset · `actualSpendCny=null`。
8. **SSOT**: 本 REQUEST **零触碰** backlog/checklist/矩阵；翻转/登记留给未来 nail 且须协调方授权。

## 6. 行语义 / 状态冻结

- trio stays **OPEN 1/1/1** 直至未来授权下的新鲜绿收据 + dual + nail（本刀不预挂 EXIT=0）
- `g7SuiteGreen=false` · Disclosure-1 **OPEN** · R1 **OPEN** · coveredCount=**8** · Ban invent covered
- G6 / R5-MARKED-RED / BUG-E2E-ISO **不**因本刀关闭
- Line U nail 证据链 **保留**（prove tip NAILED TO `9ff3daf` · Ban 用更晚 tip 冒充该 prove tip）

## 7. Ban 列表

- Ban coding（本 turn docs-only）· Ban prove 执行（须 PRE dual BOTH PASS + 协调方授权）
- Ban live · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban fake green
- **Ban `g7SuiteGreen=true`**（除非未来协调方显式授权；默认 stays false）
- Ban 宣称 suite / trio / family green · Ban covered flip · Ban SSOT 擅自翻行
- Ban 把 env-gap 洗成 flake · Ban retry-to-green · Ban self-approve（alone ≠ dual）
- Ban 碰 Line Z/AA/AB · Ban 代发 agent 消息

## 8. Non-claims

Not a pass · not run · not suite green · not trio green · not fixed · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not live · not buy-cloud · `g7SuiteGreen=false` · trio OPEN 1/1/1 · Line U EXIT 1/1/1 retained · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false` · Disclosure-1 OPEN · R1 OPEN · STOP

---

## 9. Line AC NAIL lifecycle（`post_prove_dual_pass` · 2026-10-06 · additive）

- Lifecycle on this harness/slice/SUMMARY: **`post_prove_dual_pass`**.
- **PATH A**: remediable env · U env-gap cleared via `sg docker` / `scripts/with-docker-session.sh`（activate pre-existing docker group · **Ban sudo/chmod/usermod/setfacl**）。
- Prove tip **NAILED TO**: `7c818c5fe2249cdac686aa2a0e58748b3c5dea68`（do **not** claim a later origin tip as the prove tip）· receipts tip `5481d4ddcb8d119678ec4f70e1b626f8f7b27f1b`.
- Prove code SHA: `160c30cac7a0a05106120949f337847b782647b7` · **PROVE_EXIT 1/1/1** · Key-blocked `live_provider_key_missing`.
- POST dual BOTH PASS: mw-e2e-ha `fdab68fd5e4223a27ffa0e2802e13250838fb088` + mw-model-op `6f0d015a96903ee59ad4953089a0a9f0bbe9ed7c`.
- FAIL class honesty: **env-gap cleared** this host/session · dominant FAIL = **Key-blocked**（`provider/live_provider_key_missing`）· **Key-blocked ≠ pass** · **Ban wash suite green** · **0 model calls** · Ban live.
- STILL_OPEN: trio **OPEN 1/1/1** · **`g7SuiteGreen=false`** · Disclosure-1 **OPEN** · R1 **OPEN**.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503.

### ERRATUM（retained · coordinator wording）

| Role | SHA |
|------|-----|
| FreeTierOnly **观察** | **`3424dc1`** |
| **消除轮** | **`82981ff`** |
| Ban | writing shorthand **`quota-403=82981ff`** |
| Ban | writing **`b1d7b22` @ 09-23** for that removal |

Keep siblings（Line U trio-fresh nail · Z/AA/AB REQUEST tracks）as written.

---

*Harness · G7 env-gap honest fix track · Line AC NAIL · 2026-10-06 · lifecycle post_prove_dual_pass · Path A · prove tip 7c818c5 · code 160c30c · EXIT 1/1/1 Key-blocked · post dual fdab68f+6f0d015 PASS · g7SuiteGreen=false · Disclosure-1 OPEN · R1 OPEN · Ban wash suite green · Ban live · releaseEvidence=false · STOP*
