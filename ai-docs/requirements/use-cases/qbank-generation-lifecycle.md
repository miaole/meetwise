---
id: requirements_qbank_generation_lifecycle
name: 题库版本构建与发布用例
description: 题库内容、完整题目工件、不可变检索 generation 与撤销的业务用例及七类测试矩阵。
type: requirement
scope: shared
level: use-case
status: active
owner: product-architecture
version: 2
related:
  - ../../architecture/ai/rag-production-release-runbook.md
  - ../../architecture/ai/rag-corpus-lifecycle.md
  - ../../testing/strategy/test-strategy.md
  - ../../rules/global/production-invariants.md
---

# 题库版本构建与发布

## 术语

- 题库（Question Bank，简称 qbank）：受审核、可撤销的面试训练素材。
- 检索世代（generation）：用一个冻结语料快照和一个嵌入 recipe 构建出的不可变索引版本。
- recipe（检索配方）：模型、版本、维度、规范化和切块版本的不可变收据。
- CAS（比较并交换）：仅在预期版本或状态仍成立时更新的并发控制。
- RLS（行级安全）：数据库按当前主体限制可读写行的授权机制。
- ANN（近似最近邻）：向量检索候选算法；只决定候选排序，不等于质量分数。

## UC-QBANK-01 · 将已批准题目作为完整工件发布到活动检索世代

- 角色：题库运营者、题库构建任务、候选人面试运行时。
- 前置：题库来源已批准；每道题至少有一个必填题面和一个必填评分锚点；构建者拥有独立的题库控制面身份；当前可能已存在活动世代。
- 触发：运营者批准新题、撤销已批准来源，或受控构建任务收到内容/recipe 变更。
- 主流程：
  1. 构建任务读取已批准来源的 `qbank_corpus_epoch`（题库内容世代）和完整题目工件映射，形成快照。
  2. 以新的 recipe 构建不可见 generation；构建期间不修改当前活动 generation。
  3. 数据库校验行数、来源可见性、题目工件完整性和快照 epoch；全部通过才以单行 CAS 切换活动指针。
  4. 请求用明确的 recipe 查询活动 generation。命中任一 chunk 后，只返回所有映射 chunk 均仍可见的完整题目证据包；裸 chunk 不得成为出题依据。
- 备选流：recipe 与内容 epoch 都未变化时复用活动 generation，不发起新的 embedding（嵌入）调用。
- 异常流：
  - E1 重复构建：相同 recipe 与相同 epoch 只复用现有 generation；不得多次激活或重复计费。机制：状态机 + 版本比较。
  - E2 并发构建：同一快照最多一个激活者；失败者读取最终活动版本或留下可审计失败 generation。机制：数据库锁与活动指针 CAS。
  - E3 越权/伪造主体：普通运行时主体不能通过设置应用上下文变量取得审批、入库、构建或激活权限。机制：独立控制面身份；RLS 不能把可写 GUC（会话配置）当授权根。
  - E4 构建失败：嵌入数、维度、内容快照或验证失败时候选 generation 标为 failed，旧活动 generation 保持可读。机制：不可变状态机与失败账本。
  - E5 撤销竞争：缓存命中后、拼装题目前撤销任一映射来源时，结果为零个完整题目；不得返回残缺题面或评分锚点。机制：第二次可见性校验和事件 epoch。
  - E6 连接中断/超时：构建任务在外部 embedding 调用后断线时不得假定已成功；不自动盲重发，交由受控对账/人工重建。机制：持久 generation 状态与成本账本。
  - E7 原始 SQL 逃逸：即使绕过应用仓储，来源哈希、正文哈希、池条目和题目映射不一致必须被数据库拒绝；已发布题目及映射不可原地改写。机制：触发器、约束和最小权限。
- 后置：活动 generation 指向单一 recipe 与 source epoch；检索缓存按内容 epoch 失效；每次题目使用应能持久化 generation、recipe、工件哈希和来源定位器。当前最后一项尚未接线，故本用例不具备发布资格。
- 验收：
  - 新批准工件在切换前的旧 generation 命中数为 `0`，切换后完整包数为 `1`。
  - 任一映射 chunk 撤销后完整包数为 `0`；裸辅助 chunk 返回的完整包数为 `0`。
  - recipe 不匹配、无活动 generation、未批准来源均 fail-closed（失败关闭）。
  - 并发和失败场景中活动指针数恒为 `1`，活动 generation 被原地修改数为 `0`。
  - 题库控制面越权写入、伪造 curator（审核员）身份、跨主体读取均为 `0`；该项当前为发布阻断，未满足前本地测试不能视为上线证据。
- 关联：`qbank_source → qbank_pool_entry → qbank_chunk → qbank_vector_generation → qbank_active_generation`；四原语中的 CAS、RLS、事件/版本账本；RAG（检索增强生成）发布运行手册。

## 测试矩阵

| 流 | 用例编号 | 测试层 | 当前命令 | 必测断言 |
| --- | --- | --- | --- | --- |
| 正常、特殊 | TC-QBANK-01-N1 | 完整迁移隔离 PostgreSQL | `pnpm rag-generation:prove` | 工件→generation→完整证据包；内容 epoch 漂移必须新建 generation。 |
| E1、E2、E4 | TC-QBANK-01-E1/E2/E4 | 完整迁移隔离 PostgreSQL | `pnpm rag-generation:prove` | 重用、激活、失败 generation 与活动指针互斥。 |
| E5、刁钻 | TC-QBANK-01-E5 | 完整迁移隔离 PostgreSQL | `pnpm rag-generation:prove` | 撤销后不返回已撤销 required chunk 的题目。 |
| 逃逸、复杂 | TC-QBANK-01-X1 | 完整迁移隔离 PostgreSQL | `pnpm qbank-control-role:prove` + `pnpm rag-generation:prove` | 低权限运行时即使伪造 `__system_qbank__` 会话变量也不能读写来源、原文、recipe 或建分区；残留角色成员关系、管理员错挂、retired generation（已退役检索世代）直查与超大候选/引用数组均被拒绝或封顶；哈希错配、原始 SQL 改题和任一 optional chunk 撤销均被拒绝/返回零包。来源/池/正文不可变的细化验收见 TC-QBANK-03。 |
| 当前读路径 | TC-QBANK-01-R1 | 完整迁移隔离 PostgreSQL | `pnpm qbank-pipeline:prove` | 原始辅助 chunk 永不提升为题目；完整 artifact 才能成为图的本地证据。 |
| 质量/容量 | TC-QBANK-01-Q1 | 冻结标注集 + 真实 PostgreSQL | 待补 | 至少 300 条（60 正常、180 非理想、60 拒绝）报告 Hit@5、Recall@5、strict-all@5、MRR、nDCG、MAP、95% 置信区间、P95/P99 与成本。 |

本页的本地隔离测试只证明数据库与代码契约，回执必须标为 `releaseEvidence=false`。真实模型、云 PostgreSQL、缓存服务、权限身份和容量演练完成前，禁止把任何通过数写成生产质量或高可用结论。

## UC-QBANK-03 · 题库正文必须由数据库验证并永久禁止原地替换

- 角色：题库控制执行器、迁移执行器、候选人面试运行时。
- 触发：控制执行器导入一条新的题库正文，或操作员试图更正、替换、删除已入库的来源/池/正文链。
- 前置：`qbank_source → qbank_pool_entry → qbank_chunk` 是活动 generation（检索世代）的唯一可重建事实链；控制面拥有独立数据库登录，普通运行时没有这些表的写权限。
- 不做：本用例不实现新的题库编辑器、自动修正文案或历史题目 provenance（来源记录）。内容修订必须使用**新 `ref_id`（引用标识）+ 新 source（来源）+ 新 generation**，旧 source 通过已审计的 `approved → rejected` 撤销；绝不在同一行原地更新。

### 数据与状态机

`content_hash` 的当前规范是 `sha256_utf8_prefix128_v1`：对 UTF-8（统一字符编码）正文计算 SHA-256（安全散列算法），取前 32 个小写十六进制字符。它是现有历史数据的兼容标识，不被描述成完整 256 位摘要；其 128 位碰撞工作量仍不能作为允许绕过数据库正文校验的理由。将来若升级到完整 64 位摘要，必须以新的显式 hash scheme（散列方案）/新 ref/source 迁移，不能悄悄重写历史行。

| 对象 | 允许状态/动作 | 禁止动作与数据库不变量 |
| --- | --- | --- |
| `qbank_source` | `pending → approved → rejected`，审核备注可追加 | `id/kind/content_hash/added_by` 不可改；不得删除。它提供链的预声明摘要。 |
| `qbank_pool_entry` | 仅首次插入，精确重放读取既有事实 | 禁止 UPDATE（更新）/DELETE（删除）；`source_id/ref_id/content_hash` 必须等于 approved source。 |
| `qbank_chunk` | 仅首次插入，精确重放读取既有事实 | 禁止 UPDATE/DELETE；`content_hash` 必须等于数据库按 UTF-8 正文重算的 `sha256_utf8_prefix128_v1`，并与 source/pool 三者精确相等。 |
| 已激活 generation | 只读；撤销通过 source 状态和 epoch（内容世代）失效 | 任何正文/哈希/来源原地改写均拒绝；不得借缓存失效、重嵌或活动指针绕过新 generation。 |

### 主流程

1. 控制执行器先提议并批准 source，再以同一 `ref_id`、`source_id` 与 `content_hash` 插入 pool（池）事实。
2. 插入 `qbank_chunk` 时，数据库在同一行触发器中重算 UTF-8 SHA-256 前缀；只有正文、source、pool、ref 和摘要全等才允许提交。
3. 成功提交的 pool/chunk 行变为 append-only（仅追加）。后续构建从这些事实创建新 generation；已激活 generation 从不被修改。
4. 要修改正文时，操作员创建新 `ref_id` 的完整链并构建/验证/切换新 generation；确认切换后再撤销旧 source。旧 generation、历史证据和撤销账本保持可审计。

### 异常与对抗流

- E1 重放：相同 source/pool/chunk 的重复导入只读取既有事实，不产生第二行、第二个可见 epoch 或第二次 embedding（嵌入）费用。
- E2 并发：20 个控制任务并发导入同一正文时，恰一条事实链提交；其他任务精确读回同一行。不同正文共用 `ref_id`、不同 source 或不同摘要均失败。
- E3 错摘要/错编码：正文的 UTF-8（统一字符编码）**字节序列**、source/pool 摘要任一不等，数据库在写入 generation 前以 `23514`（检查约束违反）拒绝；当前方案不做 NFC（Unicode 规范化形式 C）或空白规范化，视觉相同而字节不同的文本是不同内容，必须使用各自的正确摘要；不允许应用层 `hashOf`（哈希辅助函数）单独作为安全判断。
- E4 原始 SQL 逃逸：即使取得题库控制角色，尝试 UPDATE/DELETE pool/chunk 必须以 `42501`（权限不足）或 `23514`（触发器拒绝）失败；表所有者/迁移形状的直接 UPDATE 也必须被触发器拒绝。普通运行时伪造 `app.principal_user`（应用主体会话变量）不得获得写权。
- E5 活动 generation：正文进入活动 generation 后，直接改 `qbank_chunk.content`、`content_hash`、`source_id` 或 pool 映射必须失败；活动检索的 evidence（证据）正文、generation ID、向量行和 cache epoch（缓存世代）均保持不变。
- E6 中断/回滚：哈希校验或权限检查失败时事务回滚，pool/chunk/generation/cache epoch 的增量均为 `0`；重试只能走精确重放或新 ref 的受控改版。
- X1 刁钻：先构建并激活 G1，再以原始 SQL 尝试正文替换、pool 重指和 delete；随后用同一 query（查询）读取，必须得到与攻击前字节相同的 evidence，且新内容命中数为 `0`。撤销旧 source 后 G1/G2 的可见性按既有 epoch 规则收敛，不能以“修复内容”为名复活旧 ref。

### 验收与测试矩阵

- 任意已提交 `qbank_chunk` 均满足 `content_hash = sha256_utf8_prefix128_v1(content)`，并与 source/pool 精确相等；违反时 generation 写入数为 `0`。
- `qbank_pool_entry` 与 `qbank_chunk` 的原地 UPDATE/DELETE 成功数为 `0`；活动 generation 原地正文改变数为 `0`。
- 所有本地隔离回执均为 `releaseEvidence=false`（非发布证据）；真实云控制登录、审核工作流、成本和容量演练仍是单独发布门。

| 流 | 用例编号 | 测试层 | 命令 | 必测断言 |
| --- | --- | --- | --- | --- |
| 正常、重放 | TC-QBANK-03-N1 | 完整迁移隔离 PostgreSQL（关系型数据库） | `pnpm rag-generation:prove` | 正文数据库重算、精确重放、generation 构建和读取均成立。 |
| E2、E6 | TC-QBANK-03-E2/E6 | 20 并发完整迁移 PostgreSQL | `pnpm rag-generation:prove` | 恰一事实链、错误摘要/失败事务零副作用。 |
| E3、E4 | TC-QBANK-03-E3/E4 | 三种数据库身份 + 原始 SQL | `pnpm qbank-control-role:prove` + `pnpm rag-generation:prove` | runtime 伪造 GUC 无权写；控制角色无 pool/chunk UPDATE/DELETE；表所有者形状也被不可变触发器拒绝。 |
| E5、X1 | TC-QBANK-03-E5/X1 | 活动 generation 隔离 PostgreSQL | `pnpm rag-generation:prove` | 直接正文/哈希/来源/池替换被拒，攻击前后 evidence、generation、cache epoch 不变；改版只允许新 ref + 新 generation。 |

`0068_qbank_content_fact_immutability.sql` 已将本用例接入当前完整迁移链；2026-08-10 本地隔离回执中 `pnpm rag-generation:prove` 为 **28/28**、`pnpm qbank-control-role:prove` 为 **8/8**，均为 `releaseEvidence=false`。28 项已覆盖 20 路同内容并发、正文摘要失败的事务回滚，以及控制执行器/表所有者两种 UPDATE（更新）与 DELETE（删除）逃逸；控制面回归还会拒绝不统一、可登录、可继承、超级用户、可绕过行级安全或带成员关系的 SECURITY DEFINER（安全定义者）owner（所有者）。既有题库的升级窗口由 UC-QBANK-04 单独验证，不能把这些本地数字扩大为真实云发布结论。

## UC-QBANK-04 · 升级时隔离旧版可被篡改的题库事实

- 角色：迁移执行器、题库控制执行器、候选人面试运行时、题库运营者。
- 前置：目标数据库的迁移账本是连续且校验和正确的前缀；可能存在于 `0068` 之前写入、并曾被旧 INSERT-only（仅插入）触发器原地改写的 `qbank_pool_entry`（题库池条目）或 `qbank_chunk`（题库正文块）。
- 触发：版本化迁移器依次应用 `0068`、`0069`、`0070`、`0071`、`0072`；`0068` 不是只保护后续写入，它必须在自身提交时使正文摘要无法证明的旧链从数据平面归零。`0069` 才是一次可审计的历史完整性收口，`0070–0072` 使无超级权限、不可绕过行级安全的 generation（检索世代）控制函数、题目工件写入函数与完整题目证据读取器所有者可实际完成构建/校验/激活和读取；它们都不是普通读取时的最佳努力修复。
- 不做：不猜测或重写可疑正文，不把当前向量重新解释为可信文本，不删除审计行，也不自动重新批准来源。运营者只能以新的 `ref_id`（引用标识）/source（来源）/generation（检索世代）重新导入并审核内容。

### 主流程

1. 迁移在同一事务内创建仅控制面可见的 quarantine ledger（隔离账本），枚举所有已批准 source（来源）关联的 pool/chunk 链。
2. 每条链同时验证：32 位 `sha256_utf8_prefix128_v1`（UTF-8 正文 SHA-256 前 128 位）或历史上摘要与正文精确相等的 64 位完整 SHA-256（安全散列算法）、source/pool/chunk 三方摘要和 source ID（来源标识）一致、每个 pool `ref_id` 都有对应正文事实。新写入仍只允许 32 位规范前缀；64 位仅是不可改写历史事实的兼容读取形态。
3. 发现任一异常时，迁移向隔离账本追加固定原因码，并将该 source 从 `approved`（已批准）原子转为 `rejected`（已撤销）。既有可见 generation 行由现有 source-visibility（来源可见性）触发器置为不可见，语料与缓存 epoch（世代）递增。
4. 数据平面候选视图再以正文重算摘要和 source/pool/chunk 精确连接作为第二道 fail-closed（失败关闭）防线；因此漏记或后续人为脏写也不能把正文送回检索/evidence（证据）函数。
5. 迁移提交后，完整 source 保持可读；隔离 source 的 ANN（近似最近邻）候选、词法候选、evidence 和完整题目包均为 `0`。恢复只能走新来源、新 generation 的审核发布流程。

### 异常、逃逸与状态机

- E1 重跑：相同 migration ledger（迁移账本）重跑不重复写 quarantine receipt（隔离收据）、不二次递增 epoch（世代）。机制：版本化迁移账本与 source 状态机。
- E2 并发：迁移 advisory lock（咨询锁）串行化迁移器，source/epoch 锁串行化会改变可见性的控制写入；普通检索读取不持 advisory lock。0068 提交即以正文摘要候选视图阻断旧脏链，0069 提交后再有账本与 source 撤销，0070–0072 补齐低权限控制函数、题目工件写入和完整题目证据读取器的强制行级安全可执行性。任一在任一已提交版本上执行的读取，都不能重新读到无法证明正文的 evidence（证据）。机制：每迁移独立事务、候选视图、PostgreSQL 的事务可见性与控制写锁。
- E3 越权/逃逸：普通运行时伪造 `app.principal_user`（应用主体会话变量）不能读取/改写隔离账本，也不能将 rejected source 重新批准；表所有者形状的后续 pool/chunk UPDATE/DELETE 仍被 `0068` 触发器拒绝。机制：独立控制面身份、RLS（行级安全）与触发器。
- E4 失败回滚：任何 quarantine 写入、source 撤销或 view（视图）重定义失败时，整个 `0069` 事务回滚；不允许留下“账本说已隔离、检索仍可见”的半状态。机制：迁移单事务与版本账本。
- E5 降级：隔离只下架被污染 source，不因一条脏内容让其他已验证 source 停止提供 evidence；无法验证的候选一律返回空集，不回退到旧 vector/raw chunk（原始块）。机制：候选视图的精确连接与 fail-closed。
- E6 中断/恢复：migration runner（迁移运行器）在提交前断线时 ledger 不前进；重启后从同一版本重新运行并得到一个确定结果。机制：每迁移独立事务与 checksum（校验和）。
- X1 刁钻：先在 `0067` 旧架构中构建活动 generation，再用旧控制权限将正文改成不同字节；升级 `0068 → 0069 → 0070 → 0071 → 0072` 后，攻击文本命中、旧 ref 的 evidence、完整题目包和 ANN/词法候选均为 `0`，同时一个干净 source 仍可返回原文，且低权限所有者能构建、激活并读取后续完整题目包。机制：历史扫描、source 撤销、epoch 可见性投影、数据平面复核与受限控制函数。

### 后置、验收与测试

- 领域状态：每个被识别 source 只有一个不可变 quarantine receipt；其状态为 `rejected`，不会被本迁移自动复活。
- 账本：`qbank_integrity_quarantine` 记录 source、旧状态、固定原因码、hash scheme（散列方案）与检测时间；不得记录正文。
- 验收：脏链的可见 generation 行、ANN/词法/evidence/完整题目包均为 `0`；干净链保持 `1`；隔离与 cache epoch 变化均可量化；所有本地回执保持 `releaseEvidence=false`。
- 关联：`qbank_source → qbank_pool_entry → qbank_chunk → qbank_retrieval_candidate → qbank_generation_chunk`；四原语中的迁移账本、RLS、CAS（比较并交换）与持久事件/审计账本。
- 七类覆盖标注：正常/异常/特殊/逃逸通道/高并发/复杂/刁钻。

| 流 | 用例编号 | 测试层 | 命令 | 必测断言 |
| --- | --- | --- | --- | --- |
| 正常、特殊 | TC-QBANK-04-N1 | 0067 → 0068 → 0069 → 0070 → 0071 → 0072 升级隔离 PostgreSQL | `pnpm qbank-integrity-upgrade:prove` | 脏 source 仅隔离一次，干净 source/evidence 保留；低权限控制函数可构建、校验、激活并读取后续完整题目包。 |
| E1、E4、E6 | TC-QBANK-04-E1/E4/E6 | 真实版本化迁移器 | `pnpm qbank-integrity-upgrade:prove` | 0068、0069、0070、0071 与 0072 均可独立重放；0068 与 0069 之间脏链已由数据平面归零，0069–0072 重跑不重复隔离或额外切换活动指针；不完整 generation 在激活前进入 `failed`。 |
| E2、E3、E5、X1 | TC-QBANK-04-E2/E3/E5/X1 | 完整迁移隔离 PostgreSQL + 原始 SQL | `pnpm qbank-integrity-upgrade:prove` + `pnpm rag-generation:prove` | 旧版正文篡改在 0068 后和 0069 后所有读路径均为 `0`、干净链仍为 `1`；0068–0072 可由无超级权限、不可绕过行级安全的迁移函数/表所有者执行，普通运行时和表所有者均无后续原地写绕过路径。 |

2026-08-10 的 `pnpm qbank-integrity-upgrade:prove` 在隔离 PostgreSQL 中从真实 `0067` 迁移前缀复现旧控制执行器正文 UPDATE（更新），**分别提交** `0068`、`0069`、`0070`、`0071` 与 `0072`；**18/18** 断言通过。它验证 0068 已在历史扫描前使 ANN（近似最近邻）/词法/evidence（证据）/完整题目归零，0069 再完成 source（来源）隔离账本单写、`approved → rejected` 与 generation 可见性，0070–0072 则让无超级权限、不可绕过行级安全的控制函数/表所有者真实执行 `building → validated → active` 与完整题目证据包读取，并以真实 worker（后台任务进程）构建 catch（捕获）处理 embedding（向量嵌入）数量错配为 `failed`，再在不完整 generation 时于激活前走 `building → failed`。每个被隔离 source 各使 corpus/cache epoch（语料/缓存世代）递增 `1`，本回归覆盖的 6 个 source 因而各增 `6`。7 类历史完整性原因码均至少有一个真实旧架构样本；干净的完整 64 位历史摘要链保留；运行时无账本读取权和 upgrade 后原地写仍拒绝。回执为本地 `releaseEvidence=false`，并不表示真实云数据库已完成实际脏数据扫描或容量演练。

## UC-QBANK-02 · 已发出问题可复现其题库版本与完整证据链

### 语义与边界

- 角色：候选人、面试运行时、模型调用网关、题库控制任务。招聘方不拥有 provenance（来源收据）表的读取权限；如未来确有合规审计需求，必须另建受同意、保留期和访问审计约束的受限接口。
- 前置：一个题目可能同时向模型呈现 `0..N` 个完整 qbank artifact（题库工件）。系统能够证明的是“哪些工件被送入本次模型上下文”，不能把模型的输出引用伪称为“模型因果使用了这些资料”。
- 图状态中的 `qbank` 收据是类型化、无正文的 opaque binding（不透明绑定）：`modelInputReceiptId`、`modelOutputReceiptId`、`provenanceKind` 和 `issuanceAttempt`。完整 artifact、locator、已渲染片段摘要只由网关收据表保存；它们不得复制进 checkpoint（检查点）、SSE（服务器推送事件）或图 state（状态），以避免大状态和来源正文泄露。
- `provenanceKind` 只能是 `qbank`、`none` 或 `legacy_unverifiable`。`none` 表示本次确实没有呈现 qbank；`legacy_unverifiable` 表示旧 checkpoint（检查点）/旧题目缺少可验证收据，二者绝不能互相转换。
- `issuanceAttempt`（发题尝试序号）从 `0` 开始。它是持久化图状态的一部分，必须进入模型幂等键（idempotency key）；因此撤销后的重生不会复用旧模型输出。

### 领域对象、状态机与可信边界

| 对象 | 不可变真相 | 可迁移状态 / 约束 |
| --- | --- | --- |
| `model_input_receipt`（模型输入收据） | 由独立 `model_gateway_executor`（模型网关执行器）在实际派发前写入的 `invocation_id + rendered_evidence_digest + issuance_attempt`；含 artifact ancestry（工件祖先链）与每个片段的渲染摘要 | `prepared → dispatching → succeeded / known_not_sent / unknown`；该登录仅属于独立网关进程、没有 `app_role` / `app_gateway_role` 成员关系，模型 API（应用程序接口）密钥只在该进程。 |
| `model_output_receipt`（模型输出收据） | 同一网关在成功解析模型响应后写入的 `output_digest + cited_qbank_ids` | 仅成功结算时追加；模型声明引用必须是 input receipt 已呈现工件的子集。 |
| `interview_question`（问题账本） | identity、题面、能力、题型、创建时间、`provenance_kind` | `provenance_kind NOT NULL CHECK (qbank/none/legacy_unverifiable)`；只能 `issued → queued → answered` 或 `issued/queued → cancelled`；不可原地换题。 |
| `question_model_input_binding`（题目模型输入绑定） | 题目到一个 immutable input/output receipt 的关系，或澄清复发时的 origin question（原问题） | 一题一条绑定；direct（直接模型题）和 clarification_reissue（澄清复发）二选一，禁止一个题绑定多个成功模型输入。 |
| `interview_question_qbank_provenance` | 一个 artifact-derived rendered evidence（工件派生的已渲染证据）一行：generation、recipe、artifact hash、渲染策略版本、片段摘要、是否被模型声明引用 | `0..N` 行；仅追加写，不能更新、删除或改为另一 generation。 |
| `interview_question_qbank_locator` | parent 对应 artifact 的全部 `(ref_id, source_id, content_hash, role, ordinal, required)` | 完整集合、顺序和角色必须与 artifact 映射精确相等；仅追加写。 |
| `interview_event`（事件账本） | `question_ready` 的题目 identity 与 payload | 仅 INSERT（插入）；不得更新或删除。 |
| 图的 pending question（待回答题） | question identity、typed receipt、issuanceAttempt | `fresh → rag_provenance_stale → fresh(issuanceAttempt+1)` 最多一次；再次 stale 时发无 qbank 的安全降级题并写 `none`。 |

真正的 `model_gateway_executor` 是本用例的授权根，而非新增的一张表：它运行在独立进程和网络出口，持有唯一的模型 API 密钥与独立数据库登录；Worker 只持有经过认证的 issuance command（发题命令）能力，不能直连模型供应商或 `SET ROLE`（切换角色）为网关。网关在网络请求前固定 input receipt 的 canonical digest（规范化摘要）、模型调用 ID、图线程、问题 identity 和 issuanceAttempt；响应被结构化校验后，在成功结算事务追加 output receipt。`persistInterviewQuestionWithProvenance`（持久化问题及来源收据）只接受同一 identity 的成功 input/output receipt，并对传入题面和模型引用计算规范化摘要，要求同时等于网关保存的 output digest。普通运行时即使能写 SQL（结构化查询语言），也不能借任意当前有效工件伪造“该工件已渲染进模型请求”或换掉已发送的题面。

input receipt 的创建绝不与网络或题目投影伪装为同一原子事务：`prepared` 可以在网络请求前崩溃而成为 `known_not_sent`，`dispatching/unknown` 可以没有问题账本，且必须留作成本/删除对账证据。真正的原子不变量是：一旦 `question_ready` 存在，它与问题、question binding、全部 provenance/locator 及一个已存在的成功 input/output receipt 必在同一投影事务中绑定；反向不要求每个模型调用都生成问题。

本机制依赖不可伪造的数据库主体边界。当前仓库中基于 `app.principal_user` 的 GUC（会话配置）授权根仍是独立 P0（最高优先级）整改项；在签名主体上下文或每租户数据库身份落地前，UC-QBANK-02 的 E3 只能作为结构完整性证明，不能宣称多租户对抗安全通过。

### 主流程

1. 检索层从活动 generation（检索世代）得到完整 artifact 的正文证据。网关调用 `qbank_generation_question_receipt(...)` 取得无正文 canonical receipt；它派生 generation、recipe、artifact hash、所有 locator、每个实际渲染片段的 SHA-256（安全散列算法）摘要、字符数和 `renderer_policy_version`（渲染策略版本）。完整 ancestry（祖先链）不等价于完整正文进入 prompt（提示词）。
2. 网关在派发前用真实请求字节的 `model_input_digest`（模型输入摘要）建立 `prepared` input receipt，再标记 `dispatching`；成功解析结果后以同一网关追加 output receipt。它的幂等键包含 `threadId + turn + attempt + issuanceAttempt + rendered_evidence_digest`。模型输出只能引用本次 rendered evidence 的 qbank artifact 或明确的 web（网页）来源。
3. 图的 `genQuestion`（生成问题节点）仅保留 input/output receipt ID、`provenanceKind` 和 `issuanceAttempt`。澄清分支使用 `clarification_reissue` 指向 origin question（原问题）及其 receipt，不重新检索、调用模型或伪造新的模型派发。
4. 投影事务按固定顺序以 `SELECT ... FOR SHARE` 锁定 `qbank_corpus_epoch`（题库内容世代）→ 读取 active pointer（活动指针）/generation（检索世代）→ 校验 artifact/locator/rendered digest 全集。所有会改变候选可见性的 source（来源）、pool（池）、generation active switch（活动切换）操作必须持同一 epoch 锁并在事务中 bump epoch（递增世代）。它在同一事务插入问题、question binding、provenance parent、全部 locator 和 `question_ready`；所有写入均为插入或精确等值重放，禁止 `DO UPDATE` 覆盖。
5. 只有投影事务提交后才通过 SSE（服务器推送事件）发布 `question_ready`。审计、质量评测和删除均读取历史 receipt，永不以当前 active generation（活动检索世代）反推历史题目的来源。

### 备选流

- 行为题、基础题、模型故障后的安全降级题写 `provenanceKind=none` 且 parent/binding 数为 `0`。它不能带 `NULL` generation 或当前活动指针来伪装来源；它也不能复用前一次 stale（来源过期）模型题文或 evidence（证据）。
- release（版本发布）切换或回滚后，已发题的历史 receipt 仍可由题目所有者在保留期内读取；它不提供新的检索入口。
- release 之前创建的题目/旧 checkpoint 一律标为 `legacy_unverifiable`；不得回填、不得投影为零来源、不得重新发给模型。

### 异常流

- E1 重放/幂等：`issuanceAttempt` 是模型输入尝试身份，不是第二个已发 question identity。相同 `(owner, interview, question_id, issuanceAttempt)` 的 input/output receipt 只可等值重放；一个 `interview_question` 最多有一个 `question_model_input_binding`。不同 generation、recipe、artifact hash、渲染片段摘要、引用集合或模型收据一律拒绝。机制：复合唯一键 + 精确读回，禁止覆盖。
- E2 并发/CAS（比较并交换）：20 个 worker（后台进程）竞争同一 question identity 时，恰一个首次写入；其他只得到 bytewise（逐字节）相同的 canonical receipt。机制：问题 identity 唯一键、父子 FK（外键）、事务锁和 CAS。
- E3 越权/RLS（行级安全）：在签名主体上下文/每租户身份上线后，其他候选人、招聘方、普通 runtime 或题库控制 executor（控制执行器）对收据直接读写均为 `0` / `42501`（权限不足）。当前阶段原始 SQL 仍必须不能创建模型输入收据、改题面、改事件、改 parent/locator 或删除其中任何一项；不得把 GUC 形状测试误报为多租户授权证明。机制：专用网关身份、受限 SECURITY DEFINER（定义者权限）函数、append-only trigger（追加写触发器）和最小授权。
- E4 撤销竞争：receipt 校验前撤销先提交时，投影以稳定错误 `rag_provenance_stale` 失败，题目、question binding、provenance 和 `question_ready` 增量均为 `0`。此前模型调用可能已经是 `dispatching/succeeded`，因此不能把模型外发数伪写为零；它必须留下至多一次的成本/删除收据。运行时取消旧 pending、使 `issuanceAttempt+1`，最多重生一次；若再次过期，只可发 `none` 的安全降级题，且不复用旧题文或 qbank evidence。若投影先获得 epoch 的共享锁并提交，撤销只可在其后生效，历史 receipt 保留但新检索不可再使用该来源。
- E5 历史切换/删除：generation retired（退役）或 active 指针回滚后，旧 receipt 不变且不能新写。interview-data（面试数据）删除必须将 provenance parent/locator、input/output receipt 行和 `dispatching/unknown` 的 provider request locator（供应商请求定位器）纳入同一删除请求：本地收据可物理删除，供应商有删除/保留合同才创建 `model_provider` target（删除目标），否则状态只能是 `retention_pending`（保留待确认），不能完成。题库来源删除账本与候选人删除账本分域，不能互相级联抹除。
- E6 超时/断线：模型成功但投影超时，只能重放同一 receipt/identity；若可见性已变化走 E4，不得换成最新 generation 或另造已发 question ID。没有 question binding 的 `prepared/dispatching/unknown` receipt 是合法的调用证据，仍须进入成本、删除和对账状态机。
- E6a 澄清/模型失败：澄清复发创建新 question identity，但以 `clarification_reissue` 绑定 origin question 的 immutable input/output receipt；不产生第二次模型调用。模型失败或第二次 stale 的 `none` fallback 不得创建该绑定，失败收据只能留在调用/删除账本。
- E7 原始 SQL 逃逸：伪造 generation/recipe 对、遗漏/新增/调换 locator、把 cited 设为未呈现工件、更新题面、更新事件或删除子项均必须被数据库拒绝。机制：完整集合触发器、不可变触发器、RLS 和受限函数。

### 后置与验收

- 每条 `provenance_kind=qbank` 的新问题账本记录有 `1..5` 条不可变 qbank provenance 和一个 direct/origin question binding；每个 parent 的 locator 数、角色、顺序、哈希与 artifact 映射精确一致。每个 artifact 最多 `64` locator、一次 input 最多 `5` artifact/`320` locator，canonical receipt 的 UTF-8（统一字符编码）字节数最多 `96 KiB`；越界必须 fail-closed（失败关闭），不能压缩成不可验证 JSON（JavaScript 对象表示法）。
- `provenance_kind=none` 必须是 parent/binding `0`；`legacy_unverifiable` 只允许存量迁移写入且永不转换。三个取值与 parent/binding 的任一非法组合均由数据库触发器拒绝。
- `question_ready`、题目、question binding、全部 provenance/locator 必须在同一投影事务中一致，并绑定到一个已存在的成功 input/output receipt；input receipt 的创建本身不与网络或问题投影原子。`question_ready` 不包含 locator、正文或 prompt。
- 所有新 qbank 收据都有对等的 deletion target（删除目标）；删除后候选人、招聘方和 worker 的收据读取均为 `0`。在完整删除生命周期实现前，本项仍是发布阻断，不能提前宣称删除完成。
- 本用例只能证明“系统呈现给模型的题库工件”和“模型声明引用”，不把声明写成模型因果证明。
- 当前代码尚未接线本用例，因此现有 qbank retrieval（题库检索）不能写成“题目级可复现”。

- 关联：`model_input_receipt → interview_question → interview_question_qbank_provenance → interview_question_qbank_locator`；`qbank_vector_generation`、`qbank_embedding_recipe`、`qbank_question`、`qbank_chunk`；四原语中的 CAS、幂等键、RLS、持久事件日志；`UC-QBANK-01`。
- 七类覆盖标注：正常/异常/特殊/逃逸通道/高并发/复杂/刁钻。

### UC-QBANK-02 测试矩阵（实现前门禁）

| 流 | 用例编号 | 测试层 | 必测断言 |
| --- | --- | --- | --- |
| 正常、特殊 | TC-QBANK-02-N1 | 完整迁移隔离 PostgreSQL | 一个问题绑定 `1..5` artifact-derived rendered evidence，parent/全部 locator/canonical digest 精确一致；`none` 严格零行；cited 只能是网关 output receipt 中 rendered artifact 的子集。 |
| E1、E6 | TC-QBANK-02-E1/E6 | 完整迁移隔离 PostgreSQL | input/output receipt 的同 attempt 等值重放无新增，`question_ready=1`；任一 output digest、渲染摘要、locator 集合或 binding 不同均失败；无 question 的 dispatching/unknown 调用仍可对账。 |
| E2 | TC-QBANK-02-E2 | 20 并发完整迁移 PostgreSQL | 恰一首次写入；所有读回为逐字节相同 receipt，事件仅一条。 |
| E3、E7 | TC-QBANK-02-E3/E7 | 三种低权登录 + 原始 SQL | runtime 不能伪造 `model_input_receipt` 或篡改题面/事件/parent/locator；签名主体上线后再验证跨 owner、招聘方、控制 executor 读写均为零。GUC 形状测试不得代替该安全结论。 |
| E4、刁钻 | TC-QBANK-02-E4 | source/pool/active 三种锁序 + Worker 生命周期 E2E（端到端） | revoke（撤销）先赢时题目/binding/事件为零、首次与最多一次重生的调用收据可审计且键不同；第二次 stale 的 none fallback 不复用旧题文/证据；receipt 先赢时历史收据保持且撤销后新读为零。 |
| E5 | TC-QBANK-02-E5 | 完整迁移隔离 PostgreSQL + 删除 worker | generation 切换后历史 receipt 不变；候选人删除枚举 parent/locator/input/output/provider 四类 sink，未完成外部删除必须为 `retention_pending` 或 `pending_external`（外部处理未完成）。 |
| 澄清、失败、复杂 | TC-QBANK-02-E6a | Graph（图）+ 完整迁移隔离 PostgreSQL | clarification reissue（澄清复发）只引用 origin question；模型失败/second stale 均为 none，不能错误绑定旧 qbank receipt。 |
| 旧版本、容量 | TC-QBANK-02-E8 | 图 checkpoint + 完整迁移隔离 PostgreSQL | 缺收据的旧 pending/旧问题只能为 `legacy_unverifiable`；canonical 的 schema version（模式版本）、UTF-8、排序、SHA-256 和 5/64/320/96KiB 上限由 TypeScript（类型脚本）与数据库双侧验证。 |

本 UC 通过 spec-gate（规格门禁）的前提是上述所有测试都有可执行命令与不可伪造的本地回执；在未接线前本页是实现契约，不是已完成声明。
