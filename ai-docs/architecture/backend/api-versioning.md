---
id: architecture_backend_api_versioning
name: API/契约版本化与弃用
description: 五个版本面（HTTP 契约/prompt 注册表/路由与策略语义/数据库迁移账本/数据演进）的现状机制与演进纪律：additive-only、版本字符串即身份、改动=升版、冻结面零改、弃用按窗口。未实现的弃用机制显式标注。
type: architecture
scope: shared
level: spec
status: active
owner: architecture
version: 1
tags:
  - api
  - contracts
  - versioning
  - deprecation
related:
  - ../backend/data-model.md
  - ./qbank-partition-lifecycle-ops.md
  - ./adr/README.md
  - ../../rules/global/production-invariants.md
---

# API/契约版本化与弃用

仓库里有**五个互相独立的版本面**。本文逐面写机制与演进纪律；纪律本体全部来自既有代码与已合入刀，未实现的机制显式标「未实现·后续刀」。

## 1. HTTP 契约面（apiContract + OpenAPI）

- 单源：`packages/contracts/src/index.ts`——共享 zod4 schema + `apiContract` 注册表；`buildOpenApiDocument` 用 zod4 原生 `z.toJSONSchema` 生成 OpenAPI（零外部依赖），多端同源消费。
- **登记面是显式的**：公开 HTTP 端点登记进 `apiContract`；**有意不登记**的面在源码处逐字注记（如公开删除端点保持 503、记忆管理面「HTTP 路径待产品契约确定」）——不登记≠遗漏，是边界声明。
- 演进纪律：**additive-only**（新增端点/可选字段零破坏）；既有字段语义改动=先升契约再动实现。破坏性改动当前**未配自动化弃用窗口**（未实现·后续刀：响应字段弃用标记 + 双写窗），目前靠「 Ban 语义改动、additive 落地」纪律顶住。

## 2. Prompt 版本注册表（ai-runtime）

- 单源：`packages/ai-runtime/src/prompts.ts`——每个 service 一条版本化模板（`job.route-classify.v1`→`p.v2`、`resume-quiz.generate`→`v2`、`planner.competencies`→`v4`、`interviewer.ask`→`v8`、`mock-interview.evaluate`→`v7`、`resume.vision`→`v2`、`resume-diagnosis.generate`→`v1`）。
- 纪律（proof 臂原文）：**改 prompt=升 version 注册表**——同一 service 的行为变化必须升版本号，下游缓存/评测/审计按版本区分身份；`getPrompt(service, vars)` 组装产物可覆盖 system，无 vars 时 system 字节稳定（缓存前缀不变）。
- prompt 版本与模型版本**正交**：换模型不是升 prompt 版本的理由；prompt 行为变了才升。

## 3. 路由/策略语义版本（taxonomy + policy + revision）

- **taxonomy**：v1 冻结（叶语义不得改写）；v2 经 manifest-hash 发布（draft→released，0234 形）。检索计划按叶校验 `isServingTaxonomyForLeaf`——不一致 fail-closed `taxonomy_not_current`。
- **policy**：版本字符串即语义身份（`calibration-2026-08-frozen:v1` / `candidate-route-2026-10-frozen:v4` / `candidate-route-2026-11-frozen:v5` / 后缀 `+target-role:v2`）——进 `decision_hash`，改词典/阈值/仲裁=升版（新决策行自然区分，幂等回读不串版）。
- **job 语义修订链**：`job_semantic_revision`（revision 单调 + `semantic_digest` + `input_hmac`）——岗位文本编辑产生新 revision，旧 snapshot 按 revision 不可变（「岗位编辑后旧面试不喂新文本」由 digest 相等性把门）。
- **candidate 面**：决策/snapshot 行带 `taxonomy_version` + `resume_degraded_from` + `target_role_applied` 审计位——路由语义演进可审计可回读。

## 4. 数据库迁移账本

- 单向追加（`packages/db/migrations/0000…` 顺延），版本号唯一性有专用门（`check-migration-version-uniqueness`）；迁移 ledger 前缀与顺序在 G1（#239）修为账本形。
- 演进纪律：迁移只做加法（0234 注记「只做加法」为范）；改历史迁移=改版重建；schema 漂移有 `drift:prove`（未设 PGCONTAINER 时自拉一次性容器）。
- scripts 面：`ha6:prove` scripts digest 台账（改根 `package.json` scripts 的 PR 必跑并重登，t1660u 代决：不进主 CI）。

## 5. 弃用（现状 + 未实现面）

- 已有：删除/未实现端点**显式 410/503 + 机器可读错误码**（legacy answer 端点 410 带 replacement 指引；公开删除 503 freeze）——「消失的端点」不存在，旧客户端拿到的永远是有 actionable 语义的码。
- **未实现·后续刀**：响应字段/请求头的 sunset 窗口机制（`Deprecation`/`Sunset` 头 + 双写窗）；OpenAPI 弃用标注自动化。在配齐前，弃用=代码内显式码 + 文档登记，不做静默移除。

## 6. 验收对照（production-backlog P1「API/契约版本化与弃用」行）

本文件落库=该行 ❌→✅（机制成文）；§5 前半的既有机制真实存在并各有证明面，后半弃用窗口机制仍开（登记不虚标）。

Pins：NOT_HA · releaseEvidence=false · 本文档不翻任何 backlog 行状态位（行翻面归协调方批表）。
