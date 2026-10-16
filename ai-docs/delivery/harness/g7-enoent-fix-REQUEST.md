# Harness — g7-enoent-fix REQUEST（G7 类②机械刀 · runner watch/receipt 清单 10 条旧路径→新域路径）

**Author**：`g7fix-exec`（G7 类②机械修复 EXEC 席 · 北星 loop）· **Date**：2026-10-10 · **Base**：`feat/mysql-schema-skeleton` @ **`46ff2290`**（G7 探针报告 tip · 亲验 `git log`）
**分支**：`line/g7-enoent-fix`（新 worktree `meetwise-g7fix`·仓根同级 worktree·主线工作树 feat 分支未动）
**性质**：类② receipt-gate ENOENT 纯机械修复（蓝本 `g7-green-gap.md` §2.2 类② / §5-1）· 零逻辑改 · 零断言改 · **零 live** · `MODEL_API_KEY` shell unset · `actualSpendCny=null`
**markers**：0 · ⛔push · alone≠dual · `g7SuiteGreen=false` retained（本刀不触判定面）

---

## 1. 改动面（两个文件 · 全部为映射表 1:1 路径替换）

### 1.1 主刀：`scripts/run-e2e-isolated.mjs`（13 处 · 8 行）

| # | 旧扁平路径 | 新域路径 | 出现处 |
|---|-----------|---------|--------|
| 1 | `packages/db/src/int-transcript-projection.ts` | `packages/db/src/transcript/int-transcript-projection.ts` | unstube-erase:prove:raw 清单 ×1 |
| 2 | `packages/db/src/memory-governance.ts` | `packages/db/src/memory/memory-governance.ts` | unstube-erase:prove:raw ×1 |
| 3 | `packages/db/src/privacy-authorization.ts` | `packages/db/src/privacy/privacy-authorization.ts` | unstube-erase:prove:raw ×1 |
| 4 | `packages/db/src/recruiter.ts` | `packages/db/src/recruiting/recruiter.ts` | g7fix4:finalize:prove:raw ×1 |
| 5 | `packages/db/src/commerce.ts` | `packages/db/src/commerce/commerce.ts` | g7fix4 ×1 + report-retry:prove:raw ×1 + report-retry:http:prove:raw ×1 = **×3** |
| 6 | `packages/db/src/job-route-decision.ts` | `packages/db/src/routing/job-route-decision.ts` | g7fix4:finalize:prove:raw ×1 |
| 7 | `packages/db/src/interview-jobs.ts` | `packages/db/src/interview/interview-jobs.ts` | role-input:prove:raw ×1 |
| 8 | `packages/db/src/candidate-route.ts` | `packages/db/src/routing/candidate-route.ts` | role-input:prove:raw ×1 |
| 9 | `packages/db/src/report.ts` | `packages/db/src/report/report.ts` | report-retry:prove:raw ×1 + report-retry:http:prove:raw ×1 = **×2** |
| 10 | `packages/db/src/resume.ts` | `packages/db/src/resume/resume.ts` | resume-grounding:prove:raw ×1 |

合计 10 条映射 · 13 处出现（commerce 3 / report 2 / 其余各 1）。替换后旧路径全仓活动面清零（`rg` 复核：仅剩历史收据 JSON / governance-audit-index 归档 / 迁移 SQL 注释 / 代码注释·均非活动门·不动）。

### 1.2 补漏（蓝本预期"五键即刻翻绿"·首轮复跑仍红后按映射表补漏·任务授权内）

- `packages/db/test/report-retry.proof.ts`（**2 处**）：`:213` chainFiles 静态门列表 + `:224` `readRepo('packages/db/src/report.ts')` → `packages/db/src/report/report.ts`。
- 归因：首轮 `report-retry:prove` 38 PASS 后仍抛 `✗ missing packages/db/src/report.ts`——该 `missing` 抛自 proof 自身 readRepo 静态门（`report-retry.proof.ts:35`），探针报告将 ENOENT 指针标在 runner `:851` 但 proof 内同钉旧路径。同一映射表机械补漏·零断言改动（锚钉正则原样·静态门语义原样·仅路径字面）。
- 其余四键 proof（report-retry-http / g7fix4-finalize-contract / role-input ×2 / unstube-erase）亲扫**零旧路径**——其红纯来自 runner 清单层。

## 2. 五键 EXIT 前后对照（前值=蓝本 §2.2 类② 探针 2026-10-10 亲跑原值；后值=本刀亲跑）

| 键 | 前 EXIT | 前失败面 | 后 EXIT | 后断言面 |
|----|---------|---------|---------|---------|
| `report-retry:prove` | 1 | 25 PASS 后 `✗ missing packages/db/src/report.ts` | **0** | 42 PASS / 0 FAIL |
| `report-retry:http:prove` | 1 | 38/38 全绿仍 EXIT=1（receipt 门杀） | **0** | 38/38 |
| `g7fix4:finalize:prove` | 1 | 断言全通过仍 EXIT=1 | **0** | 7 PASS / 0 FAIL |
| `role-input:prove` | 1 | interview-jobs/candidate-route ENOENT | **0** | 31 PASS / 0 FAIL |
| `unstube-erase:prove` | 1 | int-transcript-projection 等 receipt 门杀 | **0** | 46 PASS / 0 FAIL（receipt `outcome=passed`） |

**五键全数转绿**。蓝本 §5-1 预期（"五键预期即刻翻绿·其中三键断言面已实测全绿"）成立。

## 3. 旁证零伤（既有绿键复跑 · 双绿）

| 键 | 后 EXIT | 断言面 | 基线吻合 |
|----|---------|--------|---------|
| `neg:interview` | **0** | 97 PASS / 0 FAIL | 蓝本 §2.1 历史值 97 逐位吻合 |
| `interview:prove` | **0** | 54 PASS / 0 FAIL | 蓝本 §2.1 "54 PASS / 0 FAIL" 吻合 |

`node --check scripts/run-e2e-isolated.mjs` PASS（runner 语法面）。

## 4. 收据（`ai-docs/delivery/receipts/g7-enoent-fix/`）

- 五键绿收据 ×5：`report-retry-prove-PASS.json` · `report-retry-http-prove-PASS.json` · `g7fix4-finalize-prove-PASS.json` · `role-input-prove-PASS.json` · `unstube-erase-prove-PASS.json`（`LOCAL_ISOLATED_PROOF_RECEIPT` · `outcome=passed` · `exitCode=0` · `releaseEvidence=false`）
- 旁证收据 ×1：`interview-prove-PASS-sidesign.json`
- 修前红证 ×2（诚实全账）：`before-report-retry-prove-FAIL-enoent.json`（补漏前 ENOENT 现场证）· `before-report-retry-prove-FAIL-container-boot.json`（新 worktree 首跑 node_modules 缺 + 隔离 PG boot 未就绪环境红·装依赖后消·非映射面）
- 运行日志：`/tmp/g7fix-*.log`（会话外不持久·读数已全录本档）

## 5. Non-claims

- 本刀 = 类②机械路径修复；五键转绿 ≠ 断言语义放宽 ≠ 钉漂移裁决；类①③④⑤共 17 红全部 retained 归各刀线。
- `g7SuiteGreen=false` · trio 1/1/1（Key 时代）· G6 OPEN · R5-MARKED-RED · Disclosure-1 OPEN 全部 retained。
- `actualSpendCny=null`（零外呼·离线零模型键）· est live=0。
- 实现方禁止自批；翻转 `g7SuiteGreen` 仍须 trio 三绿 + post-run dual BOTH PASS + 协调方 nail。

---

*Harness · g7-enoent-fix · 2026-10-10 · base 46ff2290 · 2 文件 15 处路径字面（runner 13 + proof 补漏 2）· 五键 1/1/1/1/1→0/0/0/0/0 · 旁证双绿零回归 · markers=0 · est live=0 · ⛔push · alone≠dual*
