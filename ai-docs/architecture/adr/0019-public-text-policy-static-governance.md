---
id: adr_0019_public_text_policy_static_governance
name: ADR-0019 公共文本策略的静态治理
description: 公共成果为何使用受管路径扫描、确定性原因码和版本化审计记录，而不把文字检查结果外推为运行、合规或发布结论。
type: reference
scope: shared
level: guide
status: proposed
owner: quality
related:
  - ./README.md
  - ../../requirements/use-cases/quality-assurance-traceability.md
  - ../../testing/governance-audit-index.json
---

# ADR-0019 公共文本策略的静态治理 · proposed

## 背景

公共文本需要避免把本项目描述成外部项目的衍生物，也不能泄露代码托管项目地址或本地绝对路径。仅靠人工措辞检查会漏掉中英文变体、CI 配置、隐藏开发指南和符号链接；反过来禁用普通技术词又会损伤“参照系”、`schema reference` 和业务 citation 等合法表达。

## 决定

1. 公共文本策略只扫描受管文本路径，并为归属表述、代码托管地址、路径逃逸、读取失败和待人工判断分别输出确定性原因码。
2. 对 UC-quality-04 建立独立 L3 治理记录：受管路径、Harness、审计镜头、审阅者声明、审计摘要和所有七类 TC 均被版本化摘要绑定。
3. 审阅者身份和摘要摘要只说明提交者的声明及其与当前范围的一致性；静态检查不能证明审阅者独立性、权限、真人身份或审计质量。未完成独立复核时记录保持 `blocked`。
4. 文字策略结果只属于本地静态预检，固定 `releaseEvidence=false`；它不证明运行安全、法规合规、云端行为或发布可用性。

## 被否方案

| 方案 | 否决原因 |
| --- | --- |
| 仅依赖口头或人工检查 | 无法稳定覆盖配置、英文变体、符号链接和路径逃逸。 |
| 禁用所有“参考”或 `reference` | 会误伤技术术语与内部对象字段，不能表达真正的归属风险。 |
| 以静态扫描绿灯代替专家或发布批准 | 扫描没有独立身份、运行回执、环境证明或不可变证据集。 |

## 后果与验证

- `pnpm public-text-policy:prove` 覆盖 UC-quality-04 的正常、幂等、隔离、逃逸、失败关闭、待审和合法术语场景。
- `pnpm quality:traceability:prove` 只验证注册表与绑定；`pnpm quality:governance:check` 只验证治理结构和摘要。
- 这两类命令均为静态预检，`releaseEvidence=false`；本 ADR 在独立 L3 审计完成前保持 proposed。
