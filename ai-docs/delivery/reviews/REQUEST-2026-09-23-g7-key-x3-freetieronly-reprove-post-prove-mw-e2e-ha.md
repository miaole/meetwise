# POST-PROVE dual · mw-e2e-ha · Line C G7 Key×3 FreeTierOnly re-prove

**Role**: mw-e2e-ha（对抗证据诚实性 · 不替 mw-model-op 签字 · alone≠dual）  
**Kind**: POST-PROVE dual review（PASS=证据诚实记录/分类，≠G7 绿灯）  
**Date**: 2026-09-23 ~21:30 PT  
**Live tip reviewed**: `3424dc1` / `3424dc19e69cbe96b0a69d57743f4be4ed1988ba`  
**Receipt tip**: `5b2243e` / `5b2243eb32c65a25a11ea06e5941db1c02e3616f`（docs-only live trio receipt）  
**Branch**: `feat/mysql-schema-skeleton` · Repo `/workspace/meetwise` only · Ban Meridian · Ban `.env*` · Ban live LLM re-run  

**Pins（强制）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · trio **EXIT 1/1/1 retained** · free-model ≠ prod-model ≠ perf evidence · alone≠dual

---

## Tips

1. 本票只审 **证据诚实性与分类**；G7 trio 仍红，**禁止**把本 PASS 读成 G7 绿 / HA / 可发版。
2. FreeTierOnly **配额残差**可按「配额 403 根因已移除」关闭；**G7 trio 残差仍 OPEN**（EXIT 1/1/1）。
3. Disclosure-1（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` e2e pin）已披露：污染的是 **生产 fail-closed 角色路径** 证据，不是「有没有打到 free 模型」的配额证据；须 pin，不得当生产行为证明。
4. 配对 `mw-model-op` 已有独立 post-prove 文件；**不合并、不代签**；单审 ≠ dual。

---

## CMD|EXIT（本审实际执行 · offline only）

| CMD | EXIT |
|-----|------|
| `git fetch origin` | 0 |
| `git worktree add /workspace/mw-rv-3424dc1 3424dc1` | 0 |
| `pnpm install --frozen-lockfile`（worktree） | 0 |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | 0 |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | 0 |
| `pnpm eval-harness-matrix-cite:prove` | 0 |
| `git worktree remove /workspace/mw-rv-3424dc1 --force` | 0 |

Live trio **未**重跑（Ban paid/external LLM）。Live 证据来自 `meetwise-lineC` 工作树保留的 `.tmp/g7-step3/*` + `.tmp/e2e-receipts/*` + `.tmp/g7-ledgers/*`，对照 committed receipt `5b2243e`。

---

## 1) Ancestry / on-origin / files-per-commit

Ancestry（`994e83a`→`3424dc1`，含中间 docs `320e919`）均在 `origin/feat/mysql-schema-skeleton`：

| short | full | class | product? |
|-------|------|-------|----------|
| `994e83a` | `994e83a0998a35a3d75a5dade91a62244fe43f52` | packages/ai-runtime guard+proof + scripts + docker env example | **YES**（ai-runtime） |
| `cc8050d` | `cc8050d5eff3668b5253b386a43dc446462b1313` | model-client/invoke/timeout + client proof + runners | **YES**（ai-runtime） |
| `7219f8f` | `7219f8f769dad6d4c448ed41c59f0a40e7f42980` | `scripts/run-e2e-isolated.mjs` shared ledger | no |
| `fc8429c` | `fc8429cb554bcc93799979f5f765d931e63c0c74` | `run-e2e.mjs` + `e2e-live-capability-env.mjs` | no |
| `3424dc1` | `3424dc19e69cbe96b0a69d57743f4be4ed1988ba` | e2e-only `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` pin | no（scripts only） |
| `5b2243e` | `5b2243eb32c65a25a11ea06e5941db1c02e3616f` | `docs/delivery/line-c-step3-g7-freetier-live-receipt.{md,json}` | no（docs） |

`runnerCommitSha`（机器收据 `.tmp/e2e-receipts/2026-09-24T04-13-04-574Z-*.json`）=`3424dc19e69cbe96b0a69d57743f4be4ed1988ba` == tip。该次 `porcelainClean=true`。Docs receipt 用 `tipShaFull` 字段（非同名 `runnerCommitSha`）——见 C-A/C-E。

---

## 2) (a) New GAPs — log + source cites

### GAP-G7-E2E-PROVENANCE-CLARIFICATION-IDENTITY-COUNT — **有真实日志**

- **Log**: `.tmp/g7-step3/runfull-stderr-debug.txt:7` → `✗ 出处审查: 不把 AI 分/progress 当 B 端分（identities=4, forgedScores=none）`
- **Log**: `.tmp/g7-step3/runfull-stdout-debug.txt:45` → `实际 2 道;事件:question_ready,clarification_needed,...`
- **Assert**: `e2e/full.e2e.ts:201-203` 要求 `provenance.identities.length === questions`
- **Counter**: `e2e/helpers/interview.ts:209-210` 把 `question_ready` **与** `clarification_needed` 都推进 `identities`
- **Class**: assertion / free-model session shape（2 questions + clarification identities → 4≠2）；**非** FreeTierOnly 403

### GAP-G7-E2E-UI-APPLICATION-START-409 — **有真实日志；409 子类未入 body**

- **Log**: `.tmp/g7-step3/live-e2e-ui-isolated.log:43` / `:67` → `Error: application_start_failed_409`
- **Log**: 同文件 `:91`/`:125` → Playwright `waitForURL` timeout
- **Client throw**: `apps/web/app/jobs/actions.ts:26-28` → `POST /applications/${appId}/start` → `application_start_failed_${status}`
- **Spec**: `apps/web/e2e-ui/recruiting-bound.spec.ts:96` 等待 `/interview/iv_...?applicationId=app_`
- **API 409 映射**: `apps/api/src/modules/jobs/applications.service.ts:38-50` 对 `resume_not_ready` / `binding_invalid` / `interview_ineligible_route` / unexpected 一律 `HttpStatus.CONFLICT`(409)
- **Why 409**: 日志 **无** JSON `error` 字段 → 子类（简历未就绪 / 绑定异常 / 路由不合格 / 其它）**未钉死** → **CONDITION**（不是「无日志归因」blocker；分类到 HTTP 409 application start 成立）

### GAP-G7-E2E-REPORT-MAX-ATTEMPTS — **有真实日志**

- **Log**: `runfull-stdout-debug.txt:45` → `terminal=report_unavailable; reason=max_attempts_exceeded`
- **Source**: `apps/worker/src/report-worker.ts:67` → `appendEvent(..., 'report_unavailable', { reason: 'max_attempts_exceeded' })`
- **Model**: 同窗 ledger 全为 `qwen3.8-flash`（无 fallback）→ 报告重试耗尽发生在 **free-model** 路径上；属 secondary（出题已发生后的终态）

---

## 3) (b) C-C HARD perf root-cause separation

- **Fail step**: `scripts/run-e2e-performance-suite.mjs` steps[3]=`HTTP full E2E`（suite 共 **27** steps）
- **Log**: `live-verify-e2e-performance.log:189` `========== HTTP full E2E ==========`；`:206` `e2e_performance_suite_failed:HTTP full E2E:exit=1`
- **Inner class**: 与 GAP-PROVENANCE 同源（`e2e:isolated` EXIT 1 / assertion identities）——**不是** 403 FreeTierOnly、**不是** migrate 失败（migrate PASS 段在同 log 前部）、**不是** perf threshold/burst 叶子
- **Root-cause class（本审裁定）**: free-model 会话形状/断言（clarification 计入 identities）导致 HTTP full E2E 红；**已从证据分离**，但 **C-C「perf SLO / 生产模型确认」仍未闭合**（`ccConfirmed=false` 与 docs receipt 一致）
- **Ruling**: C-C = **SEPARATED（根因类已识别） / still OPEN as confirmed** —— 不得称为 C-C closed

---

## 4) (c) Disclosure-1 `MEETWISE_TECH_ROLE_FAIL_CLOSED`

- **Diff**: `3424dc1` `scripts/e2e-live-capability-env.mjs:39-40` — G7 且 unset 时强制 `=0`
- **Product default**: `apps/worker/src/adaptive-role-resolve.ts:35-38` — unset/blank → **fail-closed ON**；仅显式 `0|false|off` 走 legacy「技术岗」
- **Example pin**: `docker/env/worker.env.example` → `MEETWISE_TECH_ROLE_FAIL_CLOSED=1`
- **Ruling**: e2e 强制 0 **绕过**生产 fail-closed 守卫，测的是 **非生产角色解析路径**。对「生产 fail-closed / R1 行为」证据 **污染 → PIN + 不得计为该行为的证明**。对「free 模型出站 / FreeTierOnly 配额是否还在」证据 **不自动作废**（模型调用已发生且无 403）。**非 honesty blocker**（receipt 已披露）；**是 representation pin**

---

## 5) (d) FreeTierOnly residual vs trio residual

- Live trio + ledgers + runfull logs：`rg FreeTierOnly` → **0 hits**（本审复核）
- Per-call：`qwen3.8-flash` × **25**；fallback 空；无 `deepseek-v4-pro`；无 undeclared
- **Ruling（精确）**:
  - 残差 **「quota 403 FreeTierOnly」** 可关闭为 **「配额根因已移除」**（zero 403 + per-call model）
  - 残差 **「G7 Key×3 trio」** **保持 OPEN**（EXIT **1/1/1**）
  - **禁止**任何暗示 G7 绿 / trio 绿 的措辞

---

## 6) (e) Receipt hygiene / path

- 机器收据：`runnerCommitSha=3424dc19e69cbe96b0a69d57743f4be4ed1988ba` · `porcelainClean=true`（主 isolated `04-13-04`）· per-call `actualModel`+timestamps · `runCostCapCny=5` · `actualSpendCny=null` · `keyFingerprint=d26808ef` only
- Docs receipt（`5b2243e`）：聚合 25 calls / token in=13579 out=8833 · 无 raw key/DSN/bearer（本审 grep）
- **Path**: live receipt 落在 `docs/delivery/`；惯例与 gatherer（`scripts/lib/uc-covered-real-gatherer.mjs:450`）权威根为 **`ai-docs/delivery/receipts/`**（既有 `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/`）
- **Ruling**: **CONDITION** — mirror/move 到 `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/`，保持单源；docs 字段名建议对齐 `runnerCommitSha`

---

## 7) C-D non-happy offline asserts

Offline NHP（本审重跑 EXIT 0）覆盖：

- 429 bounded backoff + exhausted fail-closed（guard proof）
- ¥5 / COST_CAP fail-closed（guard + client proof）
- missing `MODEL_API_KEY` fail-closed（guard proof）
- fallback trigger recorded + allowlist（guard + client proof）
- pro / undeclared refuse（client proof）

→ **C-D = PASS（offline asserted）**；不等于 live 非快乐路径已绿。

---

## C-A..C-E status table

| Cond | Status | Note |
|------|--------|------|
| C-A prove hygiene | **PASS w/ CONDITION** | tip SHA 一致；主 run porcelainClean=true；docs 缺同名 `runnerCommitSha` 字段；raw logs 未入库 |
| C-B model honesty | **PASS** | prod default `qwen-plus` @ `packages/ai-runtime/src/text-endpoint-config.ts:67`；live `qwen3.8-flash` 已标 free / not prod / not perf；per-call 记录；无 pro/undeclared |
| C-C perf RC separation | **SEPARATED / OPEN** | 失败步=HTTP full E2E；类=provenance assertion（free-model）；非 403/migrate/threshold；**未**确认 perf SLO |
| C-D non-happy | **PASS（offline）** | guard+client proves EXIT 0 |
| C-E receipts | **PASS w/ CONDITION** | fingerprint-only；path 应镜像到 `ai-docs/delivery/receipts/` |

---

## Blockers / Conditions

**Blockers（honesty）**: 无（三 GAP 均有日志锚点；未把 trio 写成绿；Disclosure-1 已披露）

**Conditions**:
1. Mirror live receipt → `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/`（单源）
2. UI 409 **子类**未自 log body 钉死（仅能钉到 CONFLICT 映射集）
3. Durable raw logs / UI 机器收据完整度不足（依赖 lineC `.tmp`）
4. Disclosure-1 pin：G7 e2e `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` ≠ 生产 fail-closed 证据

---

## Pins（再述）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · PG-retained · trio EXIT 1/1/1 retained · free-model ≠ prod-model ≠ perf evidence · alone≠dual · Ban self-approve for mw-model-op

---

## 中文三行摘要

1. 本审 **PASS（证据诚实）**：trio 仍 1/1/1；FreeTierOnly 配额残差可标「配额根因移除」，G7 trio 残差仍 OPEN。  
2. 三新 GAP 均有 log↔source 锚点；C-C 已分离到 HTTP full E2E/出处断言，但未确认 perf SLO。  
3. Disclosure-1 为非生产角色路径 pin；收据路径需镜像到 `ai-docs/delivery/receipts/`；不代签 mw-model-op。

Verdict: PASS
