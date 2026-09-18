---
id: testing_conventions_e2e_directory_contract
name: E2E 目录契约（helpers / 场景 / run-e2e* · 评测车道）
description: Meetwise HTTP E2E 的目录职责与评测车道：共享 harness 只放可复用原语，一次性业务叙事只放场景，启栈与隔离只放 scripts/run-e2e*；LIVE / prove-shell / conn-only 分车道；非 UI 为主、UI 次要；静态门禁 fail-closed，不是 live E2E 或发布证据。
type: rule
scope: global
level: must
status: active
owner: qa
related:
  - ../strategy/test-strategy.md
  - ./test-authoring.md
  - ../../skills/testing/SKILL.md
  - ../../delivery/e2e-live-targets-whitelist.md
  - ../../delivery/adr-e2e-directory-restructure.md
---

# E2E 目录契约

Meetwise 的 HTTP 端到端（E2E）客户端已经拆成 **helpers**、**场景** 和 **运行器**。本契约只锁定这一棵树，**禁止**再抄其他产品的领域目录（例如 `booking/`、`catalog/`、`checkout/`）。

本文件不证明真供应商链路，也不构成发布证据。`releaseEvidence=false`。  
**切片注（S3）**：已落地 `scripts/isolated/` 薄入口（`run-isolated.mjs`）+ LIVE/prove-shell 白名单模块；**保留** `scripts/run-e2e-isolated.mjs` 与 `pnpm e2e:isolated` 等别名；**不** mass-move 测试；**不**缩小 `LIVE_E2E_TARGETS`（仍三元，含 secondary UI）。

## 硬钉（与 ADR / 白名单同构）

| 钉 | 裁定 |
|----|------|
| 主评测路径 | **非 UI** HTTP/SSE live（`e2e/*.e2e.ts` + `scripts/run-e2e*.mjs`） |
| UI | `apps/web/e2e-ui/` + `scripts/run-e2e-ui.mjs` = **次要 / secondary**；不得写成唯一全链路 / 主评测 |
| LIVE 白名单 | 权威列表见 `delivery/e2e-live-targets-whitelist.md`（S1）；主集 ⊆ `{e2e:prove, performance:e2e}` |
| 假绿 · 连通 | **禁止**把 `mysql-stack` / `conn-stack` / skeleton / ping / m2–m5 **连通绿**当成 LIVE E2E / covered / HA（**BUG-FAKE-CONN**；连通绿 ≠ covered/HA） |
| 假绿 · R5 | 默认 `E2E_PG_IMAGE=pgvector/pgvector:pg16` = **legacy fixture**（**BUG-FAKE-R5**）；本地绿 ≠ sole-stack / ≠ RAG 已迁 |
| 证据 | 静态 `e2e-platform:*` 绿 ≠ live E2E；loop 绿仍 `pending_review`；`aiOutputTrusted` 默认不可信 |

## 评测车道（LIVE · prove-shell · conn-only）

三车道**不得抹平**。脚本后缀都叫 `*:prove` 不等于同一车道。

| 车道 | 含义 | 典型入口 | 可否当业务 LIVE covered |
|------|------|----------|-------------------------|
| **LIVE**（主评测） | HTTP/SSE 真业务旅程 | `e2e:prove` → `e2e/full.e2e.ts`；`performance:e2e` → `e2e/performance.e2e.ts`；及其 `*:isolated` 包装 | 仅 UC 断言 + 夹具诚实；sole-stack 未迁 → 最多 partial/green-risk |
| **LIVE_OPTIONAL_UI**（次要） | Playwright 页面流 | `e2e:ui` / `e2e:ui:isolated` → `apps/web/e2e-ui/` | **否**（主评测）；浏览器旁证 only |
| **prove-shell**（借壳 · ≠ LIVE） | 域集成 / 负路径 / 合同 prove，经 `run-e2e-isolated.mjs` 起临时库 | 大量 `*:prove`（memory / rag / privacy / neg / …）且 target ∉ LIVE Set **且** ∉ conn-only；`isProveShellTarget` **排除** `mysql-stack:*` | partial 旁证；**不是**全链路 live E2E covered；**不得**把 prove-shell 绿写成 conn-only covered |
| **conn-only**（永不 LIVE） | 连通 / 骨架 / 文档钉 | **全部** `mysql-stack:*`（skeleton / ping / m2–m5 / r5-mark-red） | **永不** covered；冒充 = **BUG-FAKE-CONN** |
| **static platform** | 目录契约 / 信任 / inventory | `e2e-platform:*` · `e2e-static-guards:*` · `e2e-parity:*` · `e2e-case-inventory:prove` | 永不 live covered |

权威脚本分表：`ai-docs/delivery/e2e-live-targets-whitelist.md`（§1 LIVE · §2 prove-via-isolated-shell · §3 conn-only）。本契约引用该白名单；**禁止**在审查语言里把 mysql-stack / 域 prove 升格为 LIVE。

## 三层，各写各的

| 层 | 路径 | 放什么 | 不放什么 |
| --- | --- | --- | --- |
| 共享 harness | `e2e/helpers/*.ts` | 可复用 HTTP / 鉴权 / SSE / 面试循环 / 交易签名 / 断言 | `*.e2e.ts`、`async function main`、一场场景的简历原文 / JD / 固定答词 |
| 夹具 | `e2e/*-fixture.ts` | 二进制或哨兵样本（如 OCR PNG） | 启栈、答题编排 |
| 场景 | `e2e/*.e2e.ts` | 一场业务旅程（报名→简历→交易→面试→终态，或 API 突发） | 通用 parse / HMAC / SSE 解码 |
| 运行器 | `scripts/run-e2e*.mjs`、`scripts/run-performance-e2e.mjs` | 隔离、派生端口、假服务拒绝、拉起 api/worker、再 **spawn** 场景文件 | 简历正文、面试答词、把全链路写成运行器内联脚本 |
| 浏览器层 | `apps/web/e2e-ui/` | Playwright 页面流（**次要**） | 不要当成 HTTP 全链路的唯一实现 / 主评测 |

`e2e/` 根下只允许目录 `helpers/`。新的 HTTP 场景加 `e2e/<name>.e2e.ts`，不要新建 `e2e/interview/`、`e2e/commerce/` 这类领域树。

## 演进目录（S3 isolated done · **S4 landed · dual-review CLEARED · ≠ covered/HA** · 见 `delivery/reviews/2026-09-10-e2e-directory-s4-CLEARED.md`）

| 路径 | 切片 | 职责 | 今日状态 |
|------|------|------|----------|
| `scripts/isolated/run-isolated.mjs` | **S3** | 通用隔离壳**清晰入口**（薄 forward → legacy impl） | **已存在** |
| `scripts/isolated/targets-live-e2e.mjs` | **S3** | LIVE 白名单模块（主集 + secondary UI；禁擅自缩 Set） | **已存在** |
| `scripts/isolated/targets-domain-prove.mjs` | **S3** | prove-shell 命名诚实（域 prove ≠ E2E covered）；**排除** conn-only `mysql-stack:*` / `conn-stack:*`（NEVER prove-shell · NEVER LIVE） | **已存在** |
| `scripts/run-e2e-isolated.mjs` | 兼容 | **实现宿主** + 静态/R5 扫描钉；`pnpm e2e:isolated` 等仍指向此路径 | **保留** |
| `scripts/conn-stack/` | **S4** | mysql-stack 连通/静态**显式区**（conn-only bodies） | **已建** |
| `scripts/mysql-stack.*.proof.mjs` | **S4** | 薄 forward → `scripts/conn-stack/`（保 `mysql-stack:*:prove` 别名） | **forwarders** |

兼容期：`mysql-stack:*:prove` 别名**不破**（仍可走 legacy forwarder）；可选 `conn-stack:*:prove` 直指显式区。**mysql-stack / conn-stack = NEVER LIVE / NEVER prove-shell / NEVER covered / NEVER HA**（BUG-FAKE-CONN；**连通绿 ≠ covered/HA**）。**禁止** mass-move `e2e/*.e2e.ts` / 业务 `*.proof.ts`；**禁止**缩小 LIVE Set。

## 当前锁定的文件

**Helpers（可增补 `.ts` / `.mjs`，不可变成场景）：** `assert.ts`、`auth.ts`、`commerce.ts`、`resume.ts`、`http.ts`、`interview.ts`、`sse.ts`、`voice.ts`、`classify-failure.ts`、`failure.ts`、`failure-class.mjs`，以及无网络证明 `e2e-helpers.proof.ts`。

**场景：** `e2e/full.e2e.ts`（真 HTTP 主链路）、`e2e/performance.e2e.ts`（本机 API 突发）。

**夹具：** `e2e/ocr-fixture.ts`。

**运行器（今日仍锁定；兼容期勿删）：** `scripts/run-e2e.mjs`、`scripts/run-e2e-isolated.mjs`（实现宿主）、`scripts/isolated/run-isolated.mjs`（S3 清晰入口）、`scripts/run-e2e-ui.mjs`、`scripts/run-e2e-performance-suite.mjs`、`scripts/run-performance-e2e.mjs`。

运行器必须引用场景路径（例如 `e2e/full.e2e.ts`），而不是把那场旅程抄进 `scripts/`。

## 共享 harness 不得内嵌一次性业务叙事

一次性叙事属于场景，例如具体简历段落、具体口播题、具体答词。Helpers 可以有协议默认值（澄清「跳过」、过期身份重放的固定探测句），那不是一场用户故事。

`e2e/helpers/*.proof.ts` 是 helpers 的合同证明，可以用短输入测哈希 / 解析；它仍不是场景。

## 门禁（fail-closed）

```bash
pnpm e2e-platform:check          # 目录契约 + 信任守卫 + 核心边界；缺文件或叙事泄漏 → 非零退出
pnpm e2e-platform:prove          # 5 条命名静态守卫（含 directory-contract）；fail-closed，不是种植违规套件
pnpm e2e-platform:layout:prove   # 证明目录检查能失败：种植违规必须非零，禁止 skip-as-pass
pnpm e2e-platform:loop           # 自动跑 check + prove，写下 pending_review 回执；不默认信任 AI 产出
pnpm e2e-platform:loop --ui      # 再跑浏览器层；缺 MODEL_API_KEY 记 not_run 且非零，禁止 skip-as-pass
pnpm e2e-platform:loop --regression
pnpm e2e-platform:check --skip-core-boundaries   # 仍跑目录契约与信任守卫；不能跳过目录契约或审核
```

`scripts/e2e-platform/` 只服务 Meetwise 这棵树。它不引入其他产品的模块地图，也不替代 `pnpm e2e:isolated`。

脚本映射（禁止对调）：`e2e-platform:check` → `scripts/e2e-platform/check.mjs`；`e2e-platform:prove` → `scripts/e2e-platform/prove.mjs`（5 守卫）；`e2e-platform:layout:prove` → `scripts/e2e-platform/e2e-platform.proof.mjs`（种植违规）；`e2e-platform:loop` → `scripts/e2e-platform/review-loop.mjs`。

挂到无 Key 的事后回归：`pnpm regression` 的 always-on 含 `e2e-platform:check` / `e2e-platform:prove` / `e2e-platform:layout:prove`。`loop` 是变更轮次入口，**不要**把它再塞进 always-on，以免递归。

绿了只说明布局没漂、守卫能失败，**不是** live E2E，更不是发布通过。

## P0：可自动化，但 AI 产出默认不可信

可以自动跑 **重构守卫 / 测试 / UI / 回归**，也可以多轮。每一轮必须同时有：

1. **验证**：真实命令与退出码（`refactor` = `e2e-platform:check`，`test` = `e2e-platform:prove`（5 守卫，不是 `layout:prove`），`ui` = `e2e:ui:isolated`，`regression` = `pnpm regression` 的 always-on 子集，**不含** `--live` / `--core`）。
2. **审核**：回执 `reviewStatus` 只能是 `pending_review`（请求步都跑完）或 `rejected`（有失败或 `--ui` 缺 Key）。命令绿了仍是 `pending_review`，CLI 退出码 **2**，`aiOutputTrusted` 必须为 `false`，`reviewComplete` 必须为 false。失败退出 1。

禁止 `--trust-ai`、`--auto-approve`、跳过审核。没有「AI 已通过」状态。`liveE2E` 在本 loop 里恒为 `not_requested`。

回执写在仓库 `.tmp/e2e-platform-reviews/`（gitignore，不提交；拒绝写到 `.tmp` 之外）。每轮新文件，禁止覆盖；可用 `--round` / `--predecessor` 串多轮。回执只留命令、退出码、`skipReason`（如 `live_provider_key_missing`）、平台脚本 SHA-256 摘要；不写 stdout、提示词、答案、令牌、`.env`。注入的假 runner 必须标 `runnerKind=injected_for_proof`。`releaseEvidence=false`。

这不是 `quality:governance` 那套 L2+ 治理索引，也不证明审阅人身份或发布通过。它只让目录和守卫能被审计：哪一轮、哪步 `not_run`/`not_requested`、AI 产出是否仍未被默认信任。

## 关联

| 路径 | 角色 |
|------|------|
| `delivery/e2e-live-targets-whitelist.md` | S1 LIVE / prove-shell / conn-only 白名单 |
| `delivery/adr-e2e-directory-restructure.md` | ADR（D1–D6 · S2 = 本契约扩容） |
| `delivery/e2e-directory-target-structure.md` | mw-e2e-ha 意见稿 |
| `delivery/harness/e2e-directory-s2-contract.md` | S2 审查 harness |
| `delivery/harness/e2e-directory-s3-shim.md` | S3 审查 harness |
| `delivery/harness/e2e-directory-s4-conn-stack.md` | S4 审查 harness（conn-stack） |
| `scripts/e2e-platform/directory-contract.mjs` | 可执行合同（isolated + conn-stack REQUIRED；mysql-stack NEVER LIVE） |
