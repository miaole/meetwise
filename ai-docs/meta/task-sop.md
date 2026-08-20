---
id: meta_task_sop
name: 任务 SOP 与门禁
description: 把需求变成可实现、已验证、已落 ai-docs 的精简流程：分级、证据、门禁、（条件触发的）评审、归集、验证。
type: rule
scope: shared
level: policy
status: active
owner: architecture
version: 1
tags:
  - meta
  - sop
  - harness
  - gate
---

# 任务 SOP 与门禁

把一个需求变成可实现、已验证、已落 `ai-docs` 的最短可靠路径。**原则：先对齐 → 过门禁 → 才生成；一个结论一处；复杂必过专家 agent 审计（禁 freehand，P0）；结果原创陈述。**

## 1. 生命周期

```
Intake(.tmp) → Classify → 门禁 → Generate(草稿) → 专家 agent 审计(复杂必过, P0; 禁 freehand) → Consolidate(→ai-docs) → Verify
```

任一步不过 → `blocked` 或回退，不前进。任务状态：`draft → blocked / approved_for_spike / approved_to_implement → done`。

## 2. 风险分级（决定门禁强度）

| 级 | 含义 | 最少产物 |
| --- | --- | --- |
| L0 | 只读分析/调研 | 一行 SOP trace + 跳过理由 |
| L1 | 小范围文档 | 6 字段 harness 的自检 |
| L2 | 常规 spec | 6+3 harness + 自检 |
| L3 | **高危**：简历/PII、权益、多租户隔离/RLS、AI 安全/factuality、状态机、LangGraph 持久化 | harness + 专项 checklist + **专家评审** + ADR |
| L4 | **生产/对外不可逆**：部署、provision 云、暴露线上 | L3 全部 + 安全/合规 + 真实验证证据 + 用户显式授权 |

## 3. 证据级

E0=用户确认/已验证仓库事实；E1=据 E0 合理推断；E2=猜测；E3=未知。**E2/E3 不得生成 spec/代码，先验证升级。** 证据写成表：`source_id / 来源 / 结论 / E 级`。

## 4. 三个通用门（专项检查是门内的 checklist，不是独立门）

1. **需求门（所有任务）**：证据只用 E0/E1；范围（做/不做/禁改）；非目标。
2. **设计门（按相关触发 checklist）**：
   - 领域/状态机：显式枚举、转换表、服务端再校验、审计字段。
   - 契约：共享 zod4 schema（ZodValidationPipe + zod-openapi），不臆造、不漂移，有契约测试。
   - DB：约束、索引、**RLS + `SET LOCAL` + 事务级连接池**、迁移/回滚。
   - **LangGraph 可恢复**：checkpoint 落 Postgres（非内存/非 Redis）、`threadId` 纪律、无内存 session map、有"中断→恢复"测试。
   - AI-runtime：state/output schema、模型调用 harness、`ValidateResumeFactuality`、结构化输出、golden（含真实模型）、cost 预算、fallback、"可恢复非可重放"。
   - 隐私/租户：4 级可见性、fail-closed、PIPL 同意 + controller/processor、加密、销户级联、两侧物理隔离。
   - 安全（L4/对外）：不暴露 Redis/DB/Docker、密钥不入库+消费上限、注入对抗、防挖矿、备份/IR。
   - C 端产品（候选人 UI）：转化/onboarding/流式 UX/移动/taste。
3. **验证门（可测就必填）**：测试计划（含失败/退款/重复/并发/隔离/注入）；**禁伪验收**（只断言 200/只开页/mock 证质量/AI 自评/只 happy path）；验证命令。

## 5. 专家 agent 审计（P0 强制 · 禁止 freehand）

**P0 铁律**：**复杂业务/设计/代码（任何 L2+，即一切架构、设计、spec、代码、测试工程）在下结论前必须先过专家 agent 审计。禁止"自由发挥"（freehand）——不允许单写一份文档/一段代码就当定稿。** 只有 L0/L1 琐碎（只读分析、一行文档、改错别字）走自检 checklist。
方式：按主题派**对抗专家组**（分布式/可靠性架构、agent/LLM 系统、RAG、安全、C 端反过度工程等，按题选）找缺陷/过度声明/过度工程/失败模式 → 把批评纳入修订得"被审过的结论" → 才前进。范围实质变化才复审。
**未过专家 agent 审计的复杂产物，一律视为草稿，不得当定稿、不得宣称完成。** 历史 freehand 产物需回溯补审（见 backlog）。

## 6. Harness（6 必填 + 3 条件）

必填：① 范围 ② 证据表 ③ 领域+状态机影响 ④ 契约影响 ⑤ 隐私/安全影响 ⑥ 授权结论。
条件（N/A 一行说明）：⑦ DB 影响（写库才填）⑧ 测试计划（可测才填）⑨ 阻塞问题（真被阻塞才填）。
**L3+ 追加 ADR**：考虑过的替代方案 + 取舍 + 失败模式（这是设计可被辩护的部分）。

### 6.1 L2+ 可复核记录

`.tmp` 保留原始过程材料；当任务影响显式受管路径且风险为 L2+ 时，归集一条紧凑的版本化结论到 `ai-docs/testing/governance-audit-index.json`：任务 ID、scope ID、revision、受管路径、Harness 摘要、审计镜头、审阅者声明、审计摘要及其摘要、finding 处置、复审范围摘要、验证命令 ID；L3/L4 再绑定 ADR。revision 大于 1 必须以 `successorOf` 指向同 scope、同风险级别的前一 revision，且保留 predecessor 的所有 P0/P1 finding ID、严重度和受管路径；未关闭 finding 的关闭必须在 successor 中声明处置和 `closureEvidence`。`quality:governance:check` 只重算每个 scope/risk terminal revision；受信 CI 以受保护 base 的精确前缀锚定旧记录，并对候选新增记录和当前 terminal records 重算 exact head tree 路径摘要。

追溯基线的冻结 ID 集由索引锚定；新增允许缺口必须由 revision 大于 1 的 change record 追加，精确绑定前一摘要、新增 ID 和理由。`open` 表示已识别待处置，`blocked` 表示处置受阻；两者只能伴随任务 `blocked`。状态三元组固定为：`blocked / blocked / blocked`、`approved_for_spike / approved_for_spike / approved`、`approved_to_implement / approved_to_implement / approved`、`done / done / approved`（依次是记录状态、Harness 授权结论、审计结论）；后三种状态的 P0/P1 finding 必须全部 `closed`。

树内静态预检不执行验证命令、不读取 Git 状态或环境变量、不接收运行回执。另有受保护 base 上执行的 `governance-history` CI 守卫，读取 base/head Git blob 来拒绝历史 record/冻结基线重写、重排、删除和 successor 分叉；它还验证已抓取 PR ref 等于事件 head SHA，且不执行候选代码。base 治理工件缺失时普通 PR 固定失败，首次 bootstrap 必须人工带外批准。审阅者身份和审计摘要只校验声明的形状与摘要匹配，**不证明独立性、权限或审计质量**。两类守卫只能给出 `static_preflight_valid`，并且恒为 `releaseEvidence=false`；它们不表示专家结论自动成立，更不表示测试、云端或发布已经通过。

## 7. 归集（.tmp → ai-docs）：只进结果

- **只有结果类进 git/`ai-docs`**：PRD/需求、产品、领域模型、架构/设计、契约、规则、方法论、测试策略。
- **探索/辅助资料/口语/学习类永不进 git**，留 `.tmp`：Q&A 题库（`.tmp/qa-bank/`）、调研、评审草稿、过程笔记。
- 落位按目录边界；**先查重**（同一结论已存在则合并/取代，不并存分叉）；在 `meta/index.md` 登记。
- **结果原创陈述**：不写外部项目指涉或外部引用链接，直接讲最终结论与做了什么，用第一性原理 + 失败模式佐证；无源项目名/本地路径/外部引用链接。配置示例中的受控服务地址不构成引用。

## 8. 边生成边学（产 Q&A）

每个归集的 spec **同时**产出对应 Q&A（刁钻面试官视角 + 深度答案：取舍/失败模式/替代方案），写入 `.tmp/qa-bank/`（gitignore）。这是项目的"边生成边学"机制，也是架构可辩护叙事。

## 9. 强制/自动化

`docs:check` 负责文档结构与文字策略；它不读取 `.tmp` Harness，也不替代治理审计。`quality:governance:check` 负责候选树内显式登记的 L2+ 治理记录、ADR、摘要和冻结追溯缺口；`quality:governance:prove` 与 `quality:governance:history:prove` 覆盖其反例。受信 `governance-history` CI 作 base/head 的 append-only 比较；它依赖默认分支保护和 required check，不能防御拥有规则绕过权的人。它们都不构成运行或发布证据。`.tmp` gitignore，永不进 ai-docs。代码仓建立后再加 pre-commit（分级/锁定/暂存文件守卫/镜像扫描）。

## 10. 边界

SOP 给判断上轨道，不替代判断。**反过度流程**：L0/L1 走轻量，别给小任务套重门禁；评审只压在高危处。
