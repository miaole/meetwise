# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 格式，版本号遵循[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。版本唯一来源是根 `package.json` 的 `version` 字段，发布流程见 [`scripts/release.mjs`](scripts/release.mjs) 与 ADR-0022。

## [Unreleased]

## [0.1.0] - 2026-08-18
### Added
- 可复现的行走骨架：Next.js App Router（web）+ NestJS（api）+ LangGraphJS（worker）+ Postgres（+pgvector）+ Redis + MinIO。
- 自适应面试 Agent：`resume-quiz` / `mock-interview` / `career-path` / `report` 四张图，按节点角色拆分；有界 ReAct 工具循环；结构化输出双重校验；Postgres 检查点持久化、可断点续答。
- 统一模型出口（`packages/ai-runtime`）：预算/熔断/超时/故障转移/追踪，熔断打开时确定性拒绝、零 provider 外呼。
- 权益结算账本：`FOR UPDATE` + CAS 防超卖、FIFO-by-expiry 扣减、精确一次结算流水。
- 报告故障隔离后台作业：报告失败 ≠ 面试失败（租约 + 隔离区 + 退避）。
- 简历摄取与安全：PII 脱敏、加密存储、完整删除回执。
- 招聘方（B 端）：岗位发布 + 候选人投递 + 多租户 RLS。
- C 端成长曲线、裂变海报、中英 i18n（next-intl）。
- 八个可复现门禁（`db:prove` … `docs:check`）与数十套模块级证明门禁。
