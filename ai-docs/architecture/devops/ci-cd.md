---
id: architecture_devops_ci_cd
name: CI/CD 与发布门禁
description: PR 门禁（docs/lint/arch/契约/单测/RLS 越权/graph fixture/golden 安全+eval/demo 黄金路径 e2e/覆盖率）、密钥与供应链扫描、环境晋级、两类回滚、零停机迁移。把测试与门禁变成卡合并的执行体，不是空头支票。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ../../testing/strategy/test-strategy.md
  - ../../delivery/production-backlog.md
  - ../ai/runtime-migration.md
---

# CI/CD 与发布门禁

> 审计 P0：写了一长串「发布门禁」却无执行体，还引用不存在的 rollback 文档。本文把门禁变成**卡合并/卡发布的执行体**。

## 1. PR 门禁（全绿才可合并）

| 阶段 | 检查 | 失败动作 |
|---|---|---|
| docs | `pnpm docs:check`（必需文件 + 关键术语） | 阻断 |
| 静态 | lint + typecheck + **dependency-cruiser arch test**（模块边界、ai-runtime 不反调、AI 图不碰权益） | 阻断 |
| 契约 | zod4 **schema-diff**：破坏性变更未走版本化 → 阻断 |
| 单元 | Vitest/Jest，**覆盖率阈值**（核心域 ≥ 设定线） | 低于阈值阻断 |
| 隔离 | **RLS 多角色越权测试**：A 查 B / 无 principal → 断言 0 行 | 任一越权阻断 |
| 并发 | CAS 竞争、同 threadId 并发 resume（断言恰一个赢、不双发） | 阻断 |
| graph | 确定性 fixture + fake model 轨迹测试 | 阻断 |
| AI 安全/质量 | **对抗 golden 安全套件 + ai-eval golden**，对真实模型跑，红 → 阻断发布 | 阻断 |
| e2e | 隔离 prove 阻断合并。HTTP 全链路是 `pnpm e2e:isolated`（fetch/SSE，需 live Key，**不在** per-push）。Playwright 只覆盖 `pnpm e2e:ui:isolated` 浏览器层 | 隔离 prove 阻断；live E2E 非 per-push |
| 安全扫描 | gitleaks 密钥扫描 + Trivy/Dependabot SCA + 镜像扫描 | 高危阻断 |

## 2. 密钥与供应链

- pre-commit + CI **gitleaks**；仓库只允许 `*.env.example`，禁真 `.env`/密钥/简历原件/录音。
- 已知泄露的 Langfuse key 走泄露 IR：轮换 + 影响面核查（见 `rules/security/secrets-management.md`，待补）。
- SBOM + 依赖告警；防挖矿（补丁/扫描）接部署加固。

## 3. 环境与晋级

`dev`（compose.dev，本地全栈）→ `staging`（仿真）→ `prod`。晋级条件：上一环境 PR 门禁全绿 + demo 黄金路径冒烟。**不上 K8s（demo/早期单机 compose），不上 IaC（暂缓）**——见 ADR。

## 4. 两类回滚

| 类别 | 触发 | 动作 | 是否发版 |
|---|---|---|---|
| 配置面 | manifest（图/prompt/模型）效果坏 | 翻 `manifest.status`，灰度路由回退；进行中 run 因 pin 不受影响 | 否 |
| 代码面 | 迁移函数/共享代码 bug | deploy 修复 + 期间全局降级（关懒迁移、强制 pin 旧 manifest、batch 停） | 是 |

特性开关 / kill-switch 走服务端 flag 平面（非 provider 告警），可按租户灰度、可硬关。

## 5. 零停机迁移

DB 用 **expand-contract**（先加列/表兼容双写 → 切读 → 删旧），长会话 checkpoint 不能 drain，发布前用**黄金 checkpoint resume 冒烟**验证在飞会话可续（见 `runtime-migration.md`）。WAL/PITR 备份 + 恢复演练。

## 6. 流水线（示意）

```
push → [docs|lint|arch|contract|unit|rls|concurrency|graph] 并行
     → [ai-safety+eval golden vs 真实模型]
     → [build + 安全扫描]
     → [demo 黄金路径 e2e]
     → 全绿 → 可合并 → staging 自动部署 → 冒烟 → 人工晋级 prod（蓝绿/滚动）
```

**审计 H7/H8 修复——区分"已接入"与"计划"，别把表当全已落地**：
- **已 wired 进 `ci.yml`（真能卡合并）**：`docs:check`、密钥扫描(gitleaks 全历史)、五个验证 gate（`db:prove`/`runtime:prove`/`graph:prove`/`api:validate`/`pipeline:prove`）。
- **计划/未接入（DoD 不得宣称已具备）**：lint/typecheck、dependency-cruiser arch test、契约 schema-diff、覆盖率门、e2e 黄金路径、对抗安全 golden + ai-eval。这些是路线，不是现状。
- **真实模型 ai-eval 不作 PR 硬合并门**（H8：非确定性 flake 会阻断全部合并，且与"secrets 门控"矛盾）→ 移到 **nightly / release-gate**，带阈值 + flake 容忍 + owner；**PR 只跑 fake-model 确定性 fixture**。

DoD：标"已 wired"的每条都是 CI 里真实运行、真能卡住合并的 job；标"计划"的不得在 DoD 里冒充已具备。

## 7. ECS 全栈 GitHub CD 当前实施状态

- 目标流水线：`successful main CI SHA → ACR digest images → ECS forced command → quiesce → migrate → internal compose → synthetic/E2E → signed probe → external verify → confirm → Pages exact receipt`。
- 2026-08-20 远程 `main` 尚无该 workflow，ECS 也未 provision Compose/controller；状态是候选实现，不是已接入。
- PR gate 至少要构建两个 Docker image（不 push）并运行状态机行为 proof；纯 regex/includes 不能发现 publish 前 Web 未启动、旧写者未静默或 rollback 过早清理。
- 部署成功必须同时绑定 GitHub run/head SHA、OCI digests、controller live digest、migration ledger、publication generation、Pages final fingerprint 和公网 E2E receipt。
- 任一后半程失败必须由持久状态机自动恢复 predecessor 或保持可前滚的 fail-closed maintenance；不得让 workflow 绿而 Pages 仍 disabled，也不得让 workflow 红后无限期停站。
