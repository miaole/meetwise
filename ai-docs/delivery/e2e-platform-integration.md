---
id: delivery_e2e_platform_integration
name: E2E 平台集成分支（#55–#64）
description: feature/e2e-platform-integration 的核实合并顺序、冲突决议与 supersession。draft / 非 READY；releaseEvidence=false。
type: plan
scope: shared
level: guide
status: draft
owner: qa
version: 1
related:
  - ../skills/testing/fail-closed-gate.md
  - ../skills/testing/sop.md
  - ../meta/index.md
---

# E2E 平台集成分支

单分支 `feature/e2e-platform-integration` 对 `main` 开 **draft** PR，收纳草稿 PR #55–#64。**不标 READY。** `releaseEvidence=false`。AI 产物默认不可信；收束只走 [fail-closed 门](../skills/testing/fail-closed-gate.md)。

本文件记录**实际落地的合并顺序与决议**，不是愿望清单。与代码或 `package.json` 脚本不一致时，以本文件加当前树为准，并立刻改文档，禁止留 follow-up。

## 核实后的合并顺序

建议顺序经各 PR 的 merge-base / 文件重叠核实后**未改序**：

| 序 | PR | 头分支 | 相对当时 #55 母线的 fork | 本集成采取 |
| --- | --- | --- | --- | --- |
| 1 | #55 母线 | `feature/e2e-testing-skills` @ `dbcc310` | — | 作为 integration 起点（已含 generation-trust、e2e-platform SOP、fail-closed） |
| 2 | #58 | `cursor/harden-regression-entrypoint-61d4` | 旧于母线 tip（约 `b7b078c`） | 已 merge：车道合同 + review/verify；保留母线 `generation-trust:prove` / `e2e-platform:prove` / `--claim-done` 禁令 |
| 3 | #57 | `cursor/align-testing-docs-e2e-f3ba` | 旧于母线 tip（约 `b7b078c`） | 已 merge：HTTP 主层 / Playwright 次层；`ai-generated-review.md` 收成 fail-closed 指针 |
| 4 | #59 | `cursor/golden-tasks-registry-71ea` | 约 `b7b078c` | 已 merge：`golden-tasks:prove` 进 always-on；GT-01..04 禁止 `mapped` |
| 5 | #56 | `cursor/harden-e2e-auth-commerce-0f82` | 约 `b7b078c` | 待 merge |
| 6 | #60 | `cursor/e2e-interview-provenance-526a` | 约 `b7b078c` | 待 merge |
| 7 | #61 | `cursor/e2e-failure-class-ledger-e5f7` | 约 `b7b078c` | 待 merge |
| 8 | #62 | `cursor/e2e-directory-contract-07f9` | 约 `b7b078c` | 待 merge；与母线已有 `skills/testing/e2e-platform/` 去重 |
| 9 | #63 | `cursor/e2e-static-guards-b01f` | 约 `6530171` | 待 merge |
| 10 | #64 | `cursor/e2e-parity-baseline-f563` | 已基于 `dbcc310` | 待 merge |

未改序原因：#58 改回归入口合同，后续 PR 往 always-on 挂门；#57 只对齐文档分层；#59 收紧 golden 登记；#56/#60/#61 依次加厚 helper；#62/#63/#64 加目录/静态/parity 守卫。

## 冲突决议（已发生）

### #58

- `scripts/run-post-change-regression.mjs`：采用 #58 的 always-on → `--core` → `--live`、`--dry-run`、可选静态守卫、`REGRESSION_REVIEW_VERIFY_GATE`。**并入**母线 `ALWAYS_ON_REQUIRED` 的 `generation-trust:prove`、`e2e-platform:prove`，以及 `--claim-done` / `--ready` / `--done` → `regression_claim_done_forbidden`。摘要保留 `claimDone: false`、`readyFromUnreviewedGeneration`。
- 技能文档：保留 fail-closed / SOP / e2e-platform 链接，并写入 #58 要求的 `review/verify`、`automation does not trust AI outputs`、`multi-round allowed`。
- `provider-egress-inventory`：同时登记 `run-post-change-regression.mjs` 与 `.proof.mjs`；`environmentReferenceCount` 随清单长度更新，禁止手改成旧数。

### #57

- P0 公式只在 `skills/testing/fail-closed-gate.md`。`rules/global/ai-generated-review.md` **降为指针**（不得默认信任 / 审核 / 验证 / 多轮门禁 / 自动化仍在文中，供 `docs:check`），不再复制第二套 close 句。
- 保留 HTTP isolated E2E 主层、Playwright UI 次层、`testing/conventions/test-authoring.md`。
- 入口文档（`AGENTS.md` / `CLAUDE.md` / `meta/index.md` / `task-sop`）同时指向 SOP + fail-closed，并保留 authoring / 主次层用语。

## 重复文档处理

| 来源 | 处理 |
| --- | --- |
| #57 `ai-generated-review.md` 与 #55 `fail-closed-gate.md` 两套 P0 | 只保留 fail-closed 为收束公式；前者改指针 |
| 各 PR 各自重写 `SKILL.md` / `run-gates.md` / `check-docs.mjs` | 并集：母线文件清单 + 后来 PR 的新术语/新文件 |
| #62 目录合同 vs 母线 `skills/testing/e2e-platform/` | 待 merge 时以母线 SOP 为叙事源，#62 可执行 check/prove 并入，不复制第二套目录故事 |

## 源 PR 处置

#55–#64 保持 **draft**，不在本集成里标 READY。本 PR **supersede** 它们作为对 `main` 的合入口；源 PR 可继续停留在 `feature/e2e-testing-skills` 上，直到本集成合并后关闭。

## 当前 always-on（随代码更新）

`scripts/run-post-change-regression.mjs` 的 `ALWAYS_ON_REQUIRED`：

`docs:check` · `generation-trust:prove` · `golden-tasks:check` · `golden-tasks:prove` · `e2e-platform:prove` · `e2e-helpers:prove` · `e2e-receipt:prove` · `e2e-runner:prove` · `arch` · `api:smoke`

可选（`package.json` 有脚本才挂）：`public-text-policy:prove` · `quality:traceability:prove` · `provider-egress:prove`。

后续 PR 若往 always-on 加门，必须同步改本表与 [run-gates](../skills/testing/run-gates.md)。

## 本轮诚实边界

```text
aiAuthored: yes
aiTrust: untrusted
review: blocked:author_only
verification: 随合并推进填写
releaseEvidence: false
liveE2E: not_run:live_provider_key_missing
secrets: none
```

禁止把 always-on 绿写成 CI `verify`、live E2E 或发布证据。不得 `--claim-done`。
