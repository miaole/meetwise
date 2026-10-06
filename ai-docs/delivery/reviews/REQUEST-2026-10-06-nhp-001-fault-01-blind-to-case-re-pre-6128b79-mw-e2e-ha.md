# re-PRE — NHP-001-FAULT-01 · UC-001 FAULT blind→case · REQUEST `6128b79` · mw-e2e-ha（Line AI · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Review date**: 2026-10-06 ~19:28 CST（Asia/Shanghai · UTC+8）
**Line**: **AI**
**REQUEST**: `6128b79`（`6128b7964df504f8127ef77b1bdf5b7a822a4add`）· meetwise-core · 2026-10-06 14:34:16 +08:00 · **supersedes `db24fc9`** · cites FAIL `64fba04` · ancestor of `origin/feat/mysql-schema-skeleton` ✔
**Coverage note**: 本人 prior PRE-EXEC PASS `899fef2` **只覆盖旧 tip `db24fc9` / wave `c562906`，不覆盖本 tip `6128b79`**。本文件为对 `6128b79` 的全新独立审查，不追加到旧 PASS 文件。
**Peer**: mw-rag-route Re-PRE PASS `44e3665` — **独立核实，不代签 / 不共签** · peer 附条件 C1–C7 **carry**
**Scope**: 只审文档 · **Ban coding** · Ban prove 执行 · Ban fake green before prove · Ban wash Y/AB/AG · Ban live · Ban `.env*` · Ban git config · Ban force-push · Ban product-code change · Ban invent covered · Ban HA · Ban buy cloud · Ban nail

本 PASS = docs gate 半签。**≠** AUTHORIZE · **≠** coding 许可 · **≠** covered · **≠** nail · alone ≠ dual · EXIT0≠covered（尚无 prove）。

---

## 0. 变更面

- `git show --stat 6128b79` = **4 markdown only**：harness（+110/−…）· slice · 两 dual stub。零 `apps/` / `packages/` / `scripts/` / `package.json`。✅
- FAIL `64fba04` 正文在 rag stub 历史段 **原样保留**（rewrite 注记 append-only）。✅
- 本刀未碰 AL/AM/AG 产品/prove 文件；未翻矩阵/backlog。✅

## 1. B1–B5（对照 FAIL `64fba04` · 独立核）

| # | 原阻断 | 本稿 | 独立核 |
|---|--------|------|--------|
| **B1** | 无源锚 / 设计交审查者 | harness §2 / 注入合同钉 file:line；注入 = `ReportWorkerDeps.generate` 确定性 throw（不改产品）；CMD 拟 `pnpm uc001:nhp-fault:prove` | **解除** · 抽核：`report-worker.ts` `drainReportsOnce` `:30-58`（throw→`markReportFailed`→`'failed'`）· `:61-70` sweep→quarantined+`report_unavailable` · `report.ts:7` / `:73-85` · controller `:174-191` · service `:661-690` · `/turn` `:30-33` · `/answer` `:242-246` 410 |
| **B2** | 未钉 status/error · 无正控 · 无 mutation | F1/F2/F2b/PC 钉死 HTTP；`MUT-F1-stuck-running` 预期红 | **解除** · harness `:66-73` |
| **B3** | relabel vs `report:prove` | delta = begin→`/turn`→complete→注入失败后的 **HTTP 读口**；Ban borrow report-bulkhead / uc011 / uc019 | **解除** |
| **B4** | 回归未具名 | 具名 neg 26 · bound 17/17 · `report:prove`；env EXIT1 ≠ pass ≠ regression | **解除** · `package.json:167-170`/`203` 现存脚本名核对 |
| **B5** | 证据层未定 | 单一层 Nest HTTP + 隔离真 PG via `run-e2e-isolated.mjs`；Ban fake DB for ledger | **解除** |

矩阵诚实：`:112` FAULT 列仍 **`**partial**`** · NHP `:37` partial · 具名 case 证据层 blind · **Ban flip**。✅ · 无 `uc001:nhp-fault:prove` 尚属预期（Ban coding until BOTH+AUTHORIZE）。✅

## 2. C1–C7 carry（peer `44e3665` §2 · 本审独立复核 · 不阻断 PASS）

| ID | 条件（执行前须落实） | 本审核 |
|----|----------------------|--------|
| **C1** | `:68` 路径 `GET /interviews/:id` 应为 `GET /interview/:id`（`@Controller('interview')` `:14` · `@Get(':id')` `:168`） | **carry** · 属实 |
| **C2** | 「complete」须披露为离线 seed（`completeInterviewAndConfirm` + enqueueReport）· Ban 叙述成无模型跑通主链 | **carry** · adaptive-lifecycle 生产路径需 worker 打分；本刀 Ban live |
| **C3** | F2/F2b 顺序：`requeueFailedReport` 仅 `status='failed'`（`report.ts:60-64`）；quarantined 后 retry → **404** `no_retriable_report`。F2b 须在 F2 前或分 fixture | **carry** · service `:684-688` 核对属实 |
| **C4** | runner：须明文允许 `run-e2e-isolated.mjs` + `package.json` **纯增量**目标登记（AG `7eb1c88` 同型），否则与 Ban infra 自相矛盾 | **carry** |
| **C5** | 「无双扣」/ledger：要么加 LEDGER-SNAP（真 PG），要么明示本 case 不做 ledger 断言 | **carry** · harness 仍谈 ledger 但 F1 表无双扣断言 |
| **C6** | MUT-F1：记录实际值 · EXIT≠0 · temp only · never commit | **carry** |
| **C7** | 「Supertest」→ 与仓内 `createApp`+`listen(0)`+fetch 对齐措辞 | **carry** |

以上 C1–C7 = **执行前条件**，**不**把本次 docs gate 打回 FAIL。Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE；AUTHORIZE ≠ 本 PASS。

## 3. Ban / Pins

| Check | Ruling |
|-------|--------|
| Ban wash Y/AB/AG | **held** · 只读引用 prove+POST SHA · 不借绿 · AG 现已有 POST 亦不洗入 FAULT |
| Ban fake green before prove | **held** · 无 `uc001:nhp-fault:prove` · 本审不宣称绿 |
| Ban coding | **held** · 零代码 · 本 PASS ≠ AUTHORIZE |
| alone ≠ dual · 不代签 `44e3665` | **held** |
| coveredCount=8 · FAULT stays partial | **held** |

### Pins（原值 · 不翻）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503**

## Blockers

**无**（docs gate）。执行前须落实 C1–C7（carry）。

## Non-claims

PASS ≠ AUTHORIZE ≠ coding ≠ prove ≠ covered ≠ nail ≠ HA · Ban wash Y/AB/AG · Ban fake green · EXIT0≠covered · alone ≠ dual · 不代签 peer · prior `899fef2` ≠ 覆盖本 tip

## 中文摘要

REQUEST `6128b79` 为 docs-only re-PRE（supersedes `db24fc9`），B1–B5 相对 FAIL `64fba04` 均已解除；源锚与 HTTP 钉死项独立抽核属实。矩阵 FAULT 仍 partial，具名 prove 尚未存在（Ban coding / Ban fake green）。peer rag PASS `44e3665` 的 C1–C7（路径、`complete` seed 披露、F2/F2b 顺序、runner 增量登记、ledger 二选一、MUT 纪律、Supertest 措辞）本审复核后 **carry** 为执行前条件，不阻断本次 docs PASS。本人旧 PASS `899fef2` 只覆盖 `db24fc9`，不覆盖本 tip。Ban wash Y/AB/AG；pins 不动。本 PASS≠AUTHORIZE≠coding；alone≠dual；不代签 peer。

Verdict: PASS
