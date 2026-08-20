---
id: adr_0018_quality_governance_static_preflight
name: ADR-0018 复杂变更的静态治理预检
description: 为何 L2+ 变更使用版本化的 Harness 摘要、专家审计索引和冻结追溯缺口，而不把临时记录、CI 绿灯或文本声明当作发布证据。
type: reference
scope: shared
level: guide
status: accepted
owner: quality
related:
  - ./README.md
  - ../../requirements/use-cases/quality-assurance-traceability.md
  - ../../meta/task-sop.md
  - ../../testing/governance-audit-index.json
  - ../../testing/traceability-baseline.json
---

# ADR-0018 复杂变更的静态治理预检 · accepted

## 背景

复杂变更原本要求 Task Harness、专家审计和 L3+ ADR，但这些约束主要停留在流程文字和 `.tmp` 工作单中。静态文档检查并不读取 Harness、审计结论或 ADR，追溯清单也只登记少量自测。因此“CI 为绿”无法回答审计是否覆盖当前范围，也无法识别新增业务/测试用例扩大未映射缺口。

## 决定

1. 使用版本化 `governance-audit-index.json` 登记**明确列出的**治理任务。每条记录包含稳定 scope ID、revision、风险级别、受管路径、紧凑 Harness、审计镜头、审阅者声明、审计摘要及其摘要、finding 处置、复审范围摘要、验证命令 ID 和 L3+/L4 ADR。受保护 base 中的历史记录以精确 append-only 前缀作为冻结锚；候选新增记录与每条当前 terminal record 的受管路径摘要必须和 GitHub 事件给出的 exact head tree 一致，不回填或改写历史 JSON。
2. 树内校验器重算每个 `(scopeId, riskLevel)` **terminal revision** 的当前受管路径、Harness、审计范围和记录摘要；历史 revision 只校验结构与自身摘要。L2+ 至少两个审计镜头，L3+/L4 必须有受管 ADR。记录状态、Harness `authorizationConclusion` 和审计 `decision` 必须使用同一张转换表：`blocked/blocked/blocked`、`approved_for_spike/approved_for_spike/approved`、`approved_to_implement/approved_to_implement/approved`、`done/done/approved`；非阻塞任务的 P0/P1 finding 必须关闭。revision 大于 1 必须指向同 scope、同风险级别的前一 revision，且 `(scopeId, riskLevel, revision)` 和每个 predecessor 的 successor 都唯一；successor 必须保留 predecessor 的所有 P0/P1 finding ID、严重度和受管路径，未关闭 finding 只能以带明确处置和 `closureEvidence` 的 successor 关闭。
3. 以 `traceability-baseline.json` 的冻结未映射 leaf TC 集建立锚点。当前未映射项只允许保持或减少；新增未映射项必须由 revision 大于 1 的 change record 绑定前一摘要、精确新增 ID 和理由。这个基线不是覆盖率门，更不允许把未登记历史项从统计分母隐藏。
4. `quality-governance-check` 只读取本地版本化文件，禁止执行命令、读取环境/Git 状态、联网或接收运行回执，因此它只证明候选树内部一致。独立的 `governance-history` CI 工作流在 `pull_request_target` 中只 checkout GitHub 事件给出的受保护 base revision，使用该 base 的 guard 读取 base/head Git blob；它要求历史 records 与冻结基线不变、既有 expansions 为精确前缀、新记录只能追加为单一 successor，并以 `git show <exact-head>:<path>` 重算全部候选新增记录及当前 terminal records。该工作流不安装依赖、不执行候选代码、不读取用户密钥；base 治理工件缺失时普通 PR 固定失败，首次 bootstrap 只能走人工带外批准。两类结果都固定 `releaseEvidence=false`。

## 被否方案

| 方案 | 否决原因 |
| --- | --- |
| 只把 Harness 放在 `.tmp` | 任务结束后不可在受版本控制修订中复核，也不能绑定审计范围。 |
| 通过 Git diff 自动猜测所有“复杂”变更 | 风险分级依赖业务判断；纯静态启发式容易漏判或给小修改施加错误门禁。首版仅治理索引显式列出的路径。 |
| CI 绿灯等价于专家批准或发布证据 | 静态结构校验既未执行系统，也没有可信运行器、数据面证明或不可变回执。 |
| 仅保存未映射数量 | 新增缺口并同时删除旧缺口可绕过计数比较；必须冻结可比对的 ID 集。 |
| 只依赖候选树 JSON 摘要 | 同一 PR 可以同时重写历史内容和摘要；必须再与受信 Git base 的 blob 做 append-only 比较。 |

## 后果与验证

- 新的 L2+ 任务必须先写 Harness，再在索引登记审计摘要；后续状态、finding、范围或基线变化只能追加 successor，不能重写既有 record。治理脚本或工作流演进也必须追加 successor：候选新增记录与新 terminal snapshot 复核 exact head tree，受保护 base 的旧记录由不可变前缀锚定。原始过程资料仍可留在 `.tmp`，但不能代替版本化结论。
- 首次基线保留历史未映射项，避免把旧欠账伪装为覆盖完成；新建或修改的 UC/TC 必须带可追溯的注册表绑定。
- `pnpm quality:governance:prove` 与 `pnpm quality:governance:history:prove` 包含重复登记、单 successor、路径逃逸、摘要漂移、状态三元组冲突、缺审计/ADR、未关闭 finding、伪发布证据、历史重写、基线重写和新增未映射项的确定性反例。
- 审阅者身份和审计摘要只验证声明形状及摘要一致性，不能证明独立性、权限或审计质量。
- `governance-history` 的可信前提是默认分支保护、禁止 direct/force push、所需检查来自受保护工作流并要求最新 base；仓库内脚本不能抵御具备规则集绕过权限的管理员。全部结果仍是静态预检，`releaseEvidence=false`。可信运行回执与发布控制面仍是独立、未实施的能力。
