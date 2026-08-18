---
id: adr_0021_app_versioning_release
name: ADR-0021 应用版本与发布机制
description: 单一语义化版本来源、发布脚本、CHANGELOG 与 git tag 的可复现发布链路，以及运行时 /meta 版本暴露。
type: reference
scope: shared
level: guide
status: accepted
owner: architecture
related:
  - ./README.md
  - ../system-blueprint.md
  - ../../delivery/production-backlog.md
  - ../../meta/directory-boundaries.md
---

# ADR-0021 应用版本与发布机制 · accepted

## 背景

现状：所有 workspace 包的 `version` 都是 `0.0.0`，根 `package.json` 没有 `version` 字段，仓库没有任何 git tag，没有 CHANGELOG，没有发布脚本，运行时探针（`/livez`、`/readyz`）不报告版本。

后果是三个真实缺口：

1. **不能钉版本**：部署只能"推到 main"，无法回答"线上跑的是哪一版"。
2. **不能校验部署**：回滚、灰度、A/B 都缺一个可读的版本标识做锚点。
3. **不能可复现发布**：没有 bump→changelog→tag 的确定性链路，发布动作靠手记，无法审计。

这直接挡住"100% 生产高可用 = 零数据丢失 + 优雅降级 + 快速恢复"里的"快速恢复"——恢复的第一步是知道当前版本、能回退到上一版。

## 决定

### 1. 锁定式 monorepo 版本（单一生效版本）

整个产品只有一个语义化版本，workspace 包**不独立发版**。Meetwise 是产品、不是 SDK/库生态；包是内部 seam，不是对外发布的制品。给每个包独立版本（Changesets）是在为一个不存在的"包市场"付复杂度。

### 2. 单一来源 = 根 `package.json` 的 `version` 字段

这是 Node 生态的标准锚点，工具链零额外成本即可读取。workspace 包的 `version` 字段保持 `0.0.0`（注释其"不独立发布"语义）。

### 3. 发布脚本 `scripts/release.mjs`（机制本体）

`node scripts/release.mjs <patch|minor|major|prerelease> [--dry-run]`：

- bump 版本（内置语义化递增，不引第三方依赖）。
- 收敛 `CHANGELOG.md` 的 `[Unreleased]` 段为新版本段（Keep a Changelog）。
- 提交 `chore(release): X.Y.Z` + 打带注释的 tag `vX.Y.Z`。
- `--dry-run` 预览；**脏工作区拒绝执行**（tag 必须钉在干净、可复现的提交上）。
- **永不自动 push**：`git push` / `git push --tags` 是显式、可审计的独立步骤。

### 4. 运行时暴露 `/meta`

api 增加 `/meta` 探针，返回 `{ name, version, revision }`。`version` 的运行时来源是部署注入的 `APP_VERSION`（CI 从 git tag 写入），本地/未发布环境回退 `dev`；`revision` 来自 `APP_REVISION`/`GIT_SHA`。**刻意不读文件系统取版本**——cwd / `__dirname` 在打包与多进程下存在歧义，12-factor 应用以环境注入为准。

### 5. 一致性门 `release.yml`

推 `v*` tag 触发：校验 tag 与 `package.json` 版本一致（防"tag 说 v0.1.0、文件却写 0.1.1"的漂移），然后跑 `docs:check` + `arch`。

### 6. 契约与迁移的版本纪律（文档化，非新机制）

- OpenAPI 的 `info.version` 跟随同一 `APP_VERSION`（契约与运行时版本同源，见 ADR-0004 遗留的"契约变更走版本化"）。
- 迁移 additive-only、单向、落地即不可改，破坏性变更走 expand-contract。

## 被否

- **Changesets / 独立 per-package 版本**：产品非 SDK，独立发版是十年负债（[[meetwise-longevity-10yr]]）。
- **运行时读文件取版本**：`process.cwd()` 与 `__dirname` 在 monorepo 打包、多进程、容器路径下均歧义，环境注入才是稳定契约。
- **发布脚本自动 push**：push 是外部副作用，必须显式、可审计，不能藏在脚本里。

## 后果

- 首次发布基线 `0.1.0`（行走骨架 + 10 模块），后续由 `release.mjs` 递增。
- 每个发布都是一个可审计的提交 + 带注释 tag + CHANGELOG 段；CI 校验 tag↔版本一致。
- 部署校验从"不知道是哪版"变成"`curl /meta` 一看即知"；回滚有了可读锚点。
- 契约、OpenAPI、迁移的版本号从此与产品版本同一套纪律，不再各自漂移。
