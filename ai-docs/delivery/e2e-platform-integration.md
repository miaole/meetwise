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
| 5 | #56 | `cursor/harden-e2e-auth-commerce-0f82` | 约 `b7b078c` | 已 merge：auth/commerce helper 合同 + mock fetch prove；保留母线 `classifyFailure` |
| 6 | #60 | `cursor/e2e-interview-provenance-526a` | 约 `b7b078c` | 已 merge：规范 questionId + 拒绝伪造分；保留 #56 commerce prove 与母线 golden covering 诚实句 |
| 7 | #61 | `cursor/e2e-failure-class-ledger-e5f7` | 约 `b7b078c` | 已 merge：封闭 `E2E_FAILURE`/`E2E_REVIEW` 账本；不回退 #56 auth 或 #60 identity |
| 8 | #62 | `cursor/e2e-directory-contract-07f9` | 约 `b7b078c` | 已 merge：可执行目录契约 + planted-violation；母线 SOP 仍是叙事源；脚本不与 5 守卫 `prove` 对调 |
| 9 | #63 | `cursor/e2e-static-guards-b01f` | 约 `6530171` | 已 merge：假服务共享列表 + 密钥扫描失败即关 + unverified AI path；不回退 #61 ledger / #60 identity / Key trim |
| 10 | #64 | `cursor/e2e-parity-baseline-f563` | 已基于 `dbcc310` | 已 merge：parity floors + allowlist；不回退 always-on 车道合同，不把 parity 绿写成审核 |

未改序原因：#58 改回归入口合同，后续 PR 往 always-on 挂门；#57 只对齐文档分层；#59 收紧 golden 登记；#56/#60/#61 依次加厚 helper；#62/#63/#64 加目录/静态/parity 守卫。

## 冲突决议（已发生）

### #58

- `scripts/run-post-change-regression.mjs`：采用 #58 的 always-on → `--core` → `--live`、`--dry-run`、可选静态守卫、`REGRESSION_REVIEW_VERIFY_GATE`。**并入**母线 `ALWAYS_ON_REQUIRED` 的 `generation-trust:prove`、`e2e-platform:prove`，以及 `--claim-done` / `--ready` / `--done` → `regression_claim_done_forbidden`。摘要保留 `claimDone: false`、`readyFromUnreviewedGeneration`。
- 技能文档：保留 fail-closed / SOP / e2e-platform 链接，并写入 #58 要求的 `review/verify`、`automation does not trust AI outputs`、`multi-round allowed`。
- `provider-egress-inventory`：同时登记 `run-post-change-regression.mjs` 与 `.proof.mjs`；`environmentReferenceCount` 随清单长度更新，禁止手改成旧数。

### #61

- 采用 #61 的 `failure-class.mjs` / `failure.ts` 与 runner `tagE2EFailure`，但 **不**把 `signupOrLogin` / `uidFromToken` / `questionIdentity` 退回旧实现。
- helper prove 保留 #56/#60 合同，追加 ledger / opaque_pass 用例。
- `INTERVIEW_TERMINALS` 含 `error`（#61 AI/system 终态）；证明数组同步更新。
- 回归脚本保持 #58 车道合同，拒绝 #61 旧 `ALWAYS_ON` 回退。

### #60

- helper prove 并入 provenance / forged-score 用例，同时保留 #56 的 commerce/auth mock 合同。
- `questionIdentity` 采用规范 `q-v{n}-t{n}-c{n}`；`q-ready` 视为伪造。
- `ai-provenance.md` 保留 #59 的 covering 诚实句，并入 #60 的 SSE/conclude P0。

### #56

- `full.e2e.ts` 保留母线 `classifyFailure`，采用 #56 的 `isWebhookCreditResult` / `postPayWebhook`。
- helper prove 并入 mock fetch + `signToken` 合同；母线 resume / 失败分类用例改为 `await test`，避免异步 wrapper 漏计。

### #59

- `golden-tasks:prove` 加入 `ALWAYS_ON_REQUIRED`，与 `generation-trust:prove` / `e2e-platform:prove` 并存。
- 诚实规则并入：`relatedCommands` 不是 covering；GT-01..04（`subject=ai-output`）禁止 `mapped`。
- 丢弃 #59 对回归脚本的旧 `ALWAYS_ON` 数组回退。

### #64

- 采用 `scripts/e2e-parity-check.mjs` / `.proof.mjs` 与 `ai-docs/testing/e2e-parity-baseline.{md,json}` + allowlist。
- **不**把回归入口退回旧 `ALWAYS_ON` 数组。parity 两门挂进现有 `ALWAYS_ON_REQUIRED`。
- 文档并集：fail-closed / SOP / honesty / AGENTS 写入 `e2e-parity:check` 与 `parity floors`；作者改 allowlist 不算自签审核。
- CI `verify` 追加 parity check/prove；不加新的云部署 job。
- 集成后 helper/场景增长只能**抬高** floors 或写可审 allowlist 负 delta，禁止下调地板假装从来没有。本合并把 floors 从 22/155 抬到 47/366（含已替换旧身份）；effective floors = 当前扫描 37/342。替换旧 conditionDigest 的条目写入 allowlist，原因写清是鉴权/出处/账本合同变更，不是 AI self-approval。

### #63

- 采用 `scripts/e2e-fake-service-flags.mjs`、`scripts/e2e-static-guards.mjs` / `.proof.mjs`，以及 runner 对 `assertNoFakeServiceFlags` 的真实 import+call。
- **不**把 runner 退回 `new Error(...)` 或无 trim 的 `MODEL_API_KEY` 检查。隔离码保持 `e2e_isolation_required` / `e2e_ui_isolation_required` / `performance_e2e_isolation_required`，经 `tagE2EFailure` 入账。
- 母线 5 守卫仍要在 runner 源码里看见 `VOICE_FAKE` / `OCR_FAKE` / `E2E_FAKE_MODEL` 与 `fake_service_mode_forbidden`，因此保留内联三旗标检查，同时调用共享列表（扩展 ASR/TTS/embed/rerank/transport overrides）。
- 文档并集：保留 fail-closed / review/verify / HTTP 主层，并写入 `unverified AI path`、`失败即关`、`e2e-static-guards`。
- `ALWAYS_ON_REQUIRED` 与 CI `verify` 追加 `e2e-static-guards:check` / `prove`；不加新的云部署 job。
- 不削弱 `questionIdentity` 规范 id，也不把 `scorelessBound` 从 `assessment_unavailable && score === null` 改成伪造 0 分。

### #62

- 采用 #62 的 `check.mjs` / `core-boundaries.mjs` / `trust-guard.mjs` / `review-loop.mjs` / `review-record.mjs` / `e2e-platform.proof.mjs` 与 `testing/conventions/e2e-directory-contract.md`。
- **不**把 `e2e-platform:prove` 改指 `e2e-platform.proof.mjs`。母线 `prove.mjs` 仍是 5 条命名守卫；种植违规入口是 `e2e-platform:layout:prove`。
- `directory-contract.mjs` 以 #62 可执行布局为准，并入母线已有 helpers（`resume.ts`、`classify-failure.ts`、`failure.ts`、`failure-class.mjs`）。`.mjs` helper 合法；场景仍不得进 `helpers/`。
- 保留母线「`e2e/full.e2e.ts` 必须 import `helpers/resume.ts`」与「helpers 不得 import `apps/web` / `apps/api`」。
- 技能文档（`SKILL.md` / SOP / fail-closed / e2e-platform 叙事）以母线为源，只补 check / prove / layout:prove 映射，不另开第二套 P0。
- `ALWAYS_ON_REQUIRED` 在原有 `e2e-platform:prove` 旁加上 `e2e-platform:check` 与 `e2e-platform:layout:prove`。`loop` 不进 always-on。
- CI `verify` 同一步跑 check + prove + layout:prove；不加新的云部署 job。
- #61 把 runner 隔离码收成短码 `isolation_required` 后，5 守卫扫不到 `e2e_*_isolation_required`。本合并把三个 runner 的 `tagE2EFailure` 码恢复为 `e2e_isolation_required` / `e2e_ui_isolation_required` / `performance_e2e_isolation_required`，与 `failure-class.mjs` 映射和 `classify-failure.ts` 一致。
- helper prove 已改 `await test(`；`baseline.json` 地板改为 `^(?:await )?test\\(`，min 仍 9，不降。

### #57

- P0 公式只在 `skills/testing/fail-closed-gate.md`。`rules/global/ai-generated-review.md` **降为指针**（不得默认信任 / 审核 / 验证 / 多轮门禁 / 自动化仍在文中，供 `docs:check`），不再复制第二套 close 句。
- 保留 HTTP isolated E2E 主层、Playwright UI 次层、`testing/conventions/test-authoring.md`。
- 入口文档（`AGENTS.md` / `CLAUDE.md` / `meta/index.md` / `task-sop`）同时指向 SOP + fail-closed，并保留 authoring / 主次层用语。

## 重复文档处理

| 来源 | 处理 |
| --- | --- |
| #57 `ai-generated-review.md` 与 #55 `fail-closed-gate.md` 两套 P0 | 只保留 fail-closed 为收束公式；前者改指针 |
| 各 PR 各自重写 `SKILL.md` / `run-gates.md` / `check-docs.mjs` | 并集：母线文件清单 + 后来 PR 的新术语/新文件 |
| #62 目录合同 vs 母线 `skills/testing/e2e-platform/` | 母线 SOP 为叙事源；可执行布局锁在 `testing/conventions/e2e-directory-contract.md` + `scripts/e2e-platform/check.mjs`；不复制第三套目录故事 |

## 源 PR 处置

#55–#64 保持 **draft**，不在本集成里标 READY。本 PR **supersede** 它们作为对 `main` 的合入口；源 PR 可继续停留在 `feature/e2e-testing-skills` 上，直到本集成合并后关闭。

## 当前 always-on（随代码更新）

`scripts/run-post-change-regression.mjs` 的 `ALWAYS_ON_REQUIRED`：

`docs:check` · `generation-trust:prove` · `golden-tasks:check` · `golden-tasks:prove` · `e2e-platform:check` · `e2e-platform:prove` · `e2e-platform:layout:prove` · `e2e-helpers:prove` · `e2e-receipt:prove` · `e2e-runner:prove` · `e2e-static-guards:check` · `e2e-static-guards:prove` · `e2e-parity:check` · `e2e-parity:prove` · `arch` · `api:smoke`

脚本映射（禁止对调）：`e2e-platform:check` → `scripts/e2e-platform/check.mjs`；`e2e-platform:prove` → `scripts/e2e-platform/prove.mjs`（5 命名守卫）；`e2e-platform:layout:prove` → `scripts/e2e-platform/e2e-platform.proof.mjs`（种植违规）；`e2e-platform:loop` → `scripts/e2e-platform/review-loop.mjs`（`test` 步仍是 `prove`，不是 `layout:prove`）。

可选（`package.json` 有脚本才挂）：`public-text-policy:prove` · `quality:traceability:prove` · `provider-egress:prove`。

后续 PR 若往 always-on 加门，必须同步改本表与 [run-gates](../skills/testing/run-gates.md)。

## 文档同步（本分支，非 follow-up）

与代码/脚本不一致的技能页已在本分支改完，禁止再开「文档后补」工单：

| 文件 | 对齐内容 |
| --- | --- |
| `skills/testing/run-gates.md` | always-on 名单 = `ALWAYS_ON_REQUIRED`；假服务完整列表；隔离长码 + `tagE2EFailure` |
| `skills/testing/e2e-platform/README.md` | always-on 含平台三入口 + 静态守卫 + parity；完整名单仍只维护在 run-gates |
| `skills/testing/e2e-platform/00-overview.md` | 假服务：母线三旗标内联 + `e2e-fake-service-flags.mjs` 扩展列表；无 Key 回归指向 run-gates |
| `skills/testing/e2e-platform/02-post-change.md` | 第 3 步 / 完成证据含 `e2e-static-guards:*` 与 `e2e-parity:*` |
| `skills/testing/e2e-platform/05-failure-classification.md` | `classifyFailure` 的 `FAIL_*` 与 runner `E2E_FAILURE` 账本对照指向 run-gates §6；隔离码不得收短 |
| `skills/README.md` / `meta/index.md` / `meta/directory-boundaries.md` | 集成分支、目录契约、parity floors 各只指向一处 |
| `testing/conventions/e2e-directory-contract.md` | 可执行布局；脚本映射禁止对调 |
| `testing/e2e-parity-baseline.md` + JSON/allowlist | floors 47/366；effective 37/342；allowlist 5 条 |

`docs:check` 把本文件列为 required，并要求出现 `#55`、`#64`、`feature/e2e-platform-integration`、`fail-closed`、`releaseEvidence`、`supersede`。

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
