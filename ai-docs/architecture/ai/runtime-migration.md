---
id: architecture_ai_runtime_migration
name: Agent / 图 演进与迁移方案
description: 生成模型 / 图拓扑 / Prompt / 工具契约 / 输出 Schema 五类制品的版本演进，以及长会话在版本变更后的 checkpoint 恢复——ReleaseManifest 快照 pin、checkpointer wrapper 迁移、拓扑变更走 Drain、thread 租约并发控制、安全终止保数据。
type: reference
scope: shared
level: spec
status: active
owner: architecture
related:
  - ./agent-runtime.md
  - ./langgraph-blueprint.md
  - ../../rules/global/production-invariants.md
  - ../../rules/global/status-machine.md
---

# Agent / 图 演进与迁移方案

> 范围：本方案负责「生成模型 / 图拓扑 / Prompt / 工具契约 / 输出 Schema」五类制品的版本演进，以及长会话（mock-interview）在版本变更后的 checkpoint 恢复。**不负责**嵌入模型迁移、语料重建索引、检索隔离——那些归 RAG 语料生命周期文档，本方案仅监控「迁移是否引入隔离回归」（§13）。
> 落地姿态：目标态架构。当前 docs-only/walking-skeleton 阶段按 §14 分阶段，**不一次性全建**。
> **实现状态**：本文全部制品（`ai_release_manifest`/懒迁移链/batch 迁移/shadow/DLQ）**均未实例化**——现状连 §14 Phase 0 都尚未完整落地。已运行的相邻机制：面试图 checkpointer 持久化 + 同 thread 租约/并发去重（在 worker 侧）✅；report 幂等 upsert ✅。本文的迁移/manifest/pin-follow 体系为目标设计，勿当已建。

## 0. 核心模型与命名

- mock-interview：`threadId = interviewResult.resultId`，业务层 camelCase，调用图引擎放入 `configurable.thread_id`。report 子图用 `report:{resultId}`，处于不同 `graph_name` 命名空间，不撞键。
- 活动唯一性用部分唯一索引强制：

```sql
CREATE UNIQUE INDEX uq_active_run ON ai_graph_run (graph_name, thread_id)
  WHERE status IN ('active','waiting_user','migrating','paused');
```

**五类版本制品钉一个快照，而非五条独立轴。** 把 `graphVersion/promptBundle/modelBinding/toolContract/schemaVer` 当五条可独立解析的轴，正是「版本分裂」的来源：金丝雀放量可能解析出「新图 + 旧 tool 契约」的非法组合，运行到某节点才炸。引入不可变 **`ReleaseManifest`**：一个 manifest 是一组制品的冻结快照，`ai_graph_run` 只钉一个 `manifest_id`。一举消除组合非法、级联删除、pin 多件的复杂度。

## 1. 数据模型

### 1.1 `ai_release_manifest`（不可变发布快照）

| 列 | 类型 | 说明 |
|---|---|---|
| `manifest_id` | text PK | `{graph_name}@{graph_version}#{shorthash}` |
| `graph_name` | text | resume-quiz / mock-interview / career-path / report |
| `graph_version` | text | semver |
| `prompt_bundle_ref` | FK→`ai_prompt_versions` | prompt 版本束 |
| `model_binding_ref` | text | 模型绑定（厂商/型号/温度/上限），仅境内 |
| `tool_contract_ver` | text | 工具契约版本 |
| `schema_ver` | text | 输出 Schema 版本 |
| `serde_ver` | text | 序列化器版本 |
| `runtime_ver` | text | 图引擎库版本 |
| `min_resumable_ver` | text | 低于此的旧 run 不桥接、走安全终止 |
| `topology_hash` | text | 节点集合+channel 集合哈希，判破坏性拓扑变更 |
| `status` | enum | draft / canary / active / retired |
| `created_at` | timestamptz | 创建即冻结，行不可 update |

被任一 run 钉用过的 manifest 及其引用制品**永不可硬删**，用 FK `ON DELETE RESTRICT` 在 DB 层封死（清理被 pin 的旧制品 = 直接破坏 pin 红利，不靠流程纪律）。

### 1.2 `ai_graph_run`（演进的脊柱）

关键列：`run_id` PK、`graph_name`、`thread_id`、`manifest_id` FK（当前钉用快照）、`pin_mode`（`run_pinned` 默认 / `platform_follow`）、`status`（§2）、`version`（乐观锁，所有写 CAS）、`lease_owner`/`lease_expires_at`（thread 租约，§6）、`retire_after`、`last_resumed_at`。

> `ai_graph_run` 是业务侧元数据，**不是 checkpoint**。checkpoint 由图引擎自有表（`checkpoint_id` 单调链 + `parent_checkpoint_id`）持有，本方案**绝不旁路 insert/改写它**（§4）。

### 1.3 `ai_graph_migration`（迁移审计 + DLQ）

`run_id`、`from/to_manifest`、`kind`（lazy_payload/drain/runtime_upgrade/safe_terminate）、`result`（succeeded/quarantined/failed）、`dlq_payload`（指向原 checkpoint 的**引用**+期望目标版本，不拷贝内容）、`error_class/detail_desensitized`（脱敏，绝不落简历/答案）。

## 2. `ai_graph_run` 状态机

枚举与转换见 `rules/global/status-machine.md`（AiGraphRun 表）。要点：任意转换走 CAS；`migrating→active`/`migrating→quarantined` 由迁移结果驱动并服务端再校验目标 manifest 的 schema/业务校验；`safely_terminated`/`quarantined` 是**终态保数据**，原 checkpoint 永不就地改写，可经 DLQ 补函数重放。

## 3. pin vs follow

**默认 `run_pinned`，平台级新版只对尚未开始的新 run 生效。** 不一律 follow 的理由：**评分可辩护性 > 改进时效**。进行中的面试若中途换评分 prompt/模型/题库语义，同一场会出现两套口径，分数无法解释、无法申诉。pin 保证「一场会话从头到尾用同一把尺子」。

诚实边界：pin **不**保证 bit 级可复现（模型输出本身非确定）；它保证**评分口径一致**；「结果不依赖重放」来自已评结果落 `InterviewEvent`/结果表持久化。统一措辞「评分口径一致、且已评结果持久不依赖重放」，不写「可复现」。

## 4. 图状态与 checkpoint 的真实耦合面（全篇最大要点）

### 4.1 checkpoint 是多 channel + reducer 结构

一个 checkpoint 不止业务 payload，还有 `channel_versions`、`versions_seen`、`pending_writes`、`pending_sends`、下一个要执行的节点 `next` 等**控制流元数据**，挂在 `checkpoint_id` 单调链上。因此：

- **只改 payload 不够**：删节点后旧 checkpoint 的 `next`/pending 指向失效；重命名 channel 后 `channel_versions` 对不上，reducer 重放错乱。
- **绝不旁路 insert/改写 checkpoint 行**：接错整条损坏，接不进则 resume 仍读旧行。

### 4.2 迁移在 checkpointer wrapper 层，能力严格受限

懒迁移在包装图引擎 `BaseCheckpointSaver.getTuple` 的 wrapper 里做：读出 tuple → 判可迁移性 → 仅在引擎内一致变换后交还引擎，由引擎走正常 put 续接链路。**不手写 checkpoint 行。**

**懒迁移（migration-on-read）只支持纯 payload 字段级变更**：已存在 channel 内字段增/删/默认值/格式转换，不动节点集合、不增删改名 channel。凡涉及节点拓扑或 channel 增删改名（即 `topology_hash` 变化）：**一律走 Drain，禁止懒迁移。**

### 4.3 变更三级分类

| 级别 | 定义 | 策略 |
|---|---|---|
| ① 非破坏 | 不改语义/拓扑、payload 兼容 | platform follow 可直接生效；旧 run 懒迁移或无需 |
| ② payload 字段级破坏 | `topology_hash` 不变，仅 channel 内字段结构变 | 懒迁移（纯 payload）+ 逐版单跳函数 |
| ③ 拓扑/语义破坏 | 节点/channel 增删改名、评分语义变 | **禁止迁移**：旧 run 一律 Drain→自然 completed；过期未完则安全终止。绝不把老状态迁进新语义产出混合口径脏分 |

CI 兜底：**contract-diff 对黄金 checkpoint 做 dry-run 自动判级**；新图 `topology_hash` 变了却被标成②，CI 拒绝合并。把最危险的「判级错误」用门禁挡住。

### 4.4 引擎库 / serde 是隐藏的第六条轴

升级图引擎库或序列化器，可能让所有历史 checkpoint 反序列化破裂（停了 3 天的会话期间部署新引擎 → resume 失败）。manifest 钉 `runtime_ver`+`serde_ver`，run 间接钉死；引擎升级是显式迁移事件（失败模式 F-RT），上线前用黄金 checkpoint 跑跨版本反序列化回归；低于 `min_resumable_ver` → 安全终止不桥接。

## 5. 迁移链组织

- **逐版单跳**：`migrate_v3_1__to__v3_2(payload)->payload`，链式组合到目标版。
- **纯函数 + 版本化目录 + before/after fixture**，回归面小可测。
- 迁移函数默认纯函数；确需补字段经 `MigrationCtx.readonlyLookup`，**显式标记为有依赖**。lookup 失败不直接 quarantine：先短重试，仍失败则非关键字段降级为「安全默认 + 标记待补」让 resume 继续，仅关键字段（缺它评分语义错）才 quarantine——不把业务 DB 抖动放进 resume 热路径致命依赖。

`min_resumable_ver` 判定：①run 版本 ≥ 目标且链完整 → 懒迁移；②run 版本 < min → 安全终止；③区间内但缺某跳 → 不可迁移 → 安全终止 + DLQ。

## 6. thread 级并发控制（长会话头号真实事故）

`threadId=resultId`，双标签页/断线重连会对同一 thread 并发 resume。乐观锁只保护 `ai_graph_run` 那一行，保护不了图执行本身——并发执行会 channel 双写、`answer_evaluated` 发两次、同题打两次分。**强制「同 thread 同时只有一个活动执行」**：

```sql
UPDATE ai_graph_run
   SET lease_owner=:me, lease_expires_at=now()+interval '30s', version=version+1
 WHERE thread_id=:tid AND (lease_owner IS NULL OR lease_expires_at < now()) AND version=:expected;
-- 0 行 ⇒ 已有活动执行 ⇒ 拒绝本次 resume（"会话进行中，勿多开"）
```

执行期定时续租；崩溃后租约过期可被接管。**batch-migrate 与 resume 共用同一租约**（批量迁移某 run 前先抢该 thread 租约，与懒迁移互斥，解决「批量置 migrating 同时用户回来 resume → 两条路径产出两个新 checkpoint」破坏 exactly-once）。可加 `pg_try_advisory_lock(hashtext(thread_id))` 作执行级二重保险。

## 7. 批量迁移 + 背压（可选 Phase 3，非主路径）

主路径永远是「懒迁移在 resume 时发生」。批量只用于主动收敛长尾旧 run，且**绝不旁路写 checkpoint**——它做的是「主动触发一次受控 resume-then-checkpoint」，让旧 run 经正常引擎路径前进。背压：token-bucket 限流 + 最大并发上限（默认 ≤4，≤20 run/min）+ 低峰窗口 + **在线优先自动让位**（在线 resume p95 超阈持续 60s → batch 转 paused）+ 按 thread 逐个抢租约抢不到即跳过 + cursor 续跑幂等。

## 8. 灰度发布与绑定解析

```
resolveManifest(graph_name, run):
  if run.pin_mode == run_pinned and run.manifest_id != null: return run.manifest_id  # 进行中铁律
  return canaryRouter.pick(graph_name, bucketOf(userId))   # 新 run 按灰度选冻结快照
```

解析出 manifest 后自校验 `runtime_ver/serde_ver` 与当前实例兼容、`schema_ver` 在支持集内；不兼容则该实例不接此 run。金丝雀分桶用 `userId`（C 端），**分层抽样**（按使用频次轻/中/重分层，各层内同比例进金丝雀），避免样本全是重度用户。

**Shadow 的诚实定位**：交互式 mock-interview 不能做 live shadow（「同一输入」要等用户实时答两遍）。live shadow 仅对 report 子图、单轮无状态评分节点有效；对 `waiting_user` 交互图改用「基于已记录 `InterviewEvent` 的离线日志重放评测」。

## 9. 指标

本方案拥有：`graph_migration_total{kind,result}`、`graph_migration_latency`、`graph_run_quarantined_total`、`graph_safe_terminated_total`、`runtime_deserialize_fail_total`、`batch_migrate_online_pause_total`。LLM 调用追踪复用 `ai_invocation_traces` + Langfuse。**不归本方案**：跨租户越权检索指标属 RAG 文档；本方案只监控 `migration_introduced_isolation_regression_total`（迁移是否让某 run 的 principal 归属/可见性非预期漂移）。一个结论住一个地方。

## 10. 回滚（分两类）

| 类别 | 触发 | 回滚动作 | 是否发版 |
|---|---|---|---|
| **配置面** | 某 manifest 效果坏 | 该 manifest `status: canary→retired`，灰度路由回退到上个 active；进行中 run 因 pin 不受影响 | 不需发版，翻 status |
| **代码面** | 迁移函数 / wrapper / 共享代码 bug | deploy 修复版；期间全局降级：关闭懒迁移自动应用、强制所有 resume pin 旧 manifest、batch 全停 | 需发版 + 降级 |

回滚验证：黄金 checkpoint + fixture 跑 resume 冒烟；核对新 run 落的 `manifest_id` 已是旧版；`graph_run_quarantined_total` 回零。

## 11. 失败模式表

| 编号 | 失败 | 检测 | 处置 |
|---|---|---|---|
| F-CTRL | ③级拓扑变更被误当懒迁移 | CI dry-run 判级 + `topology_hash` 比对 | 合并门禁拒绝；运行时遇到则安全终止 |
| F-RT | 引擎/serde 升级后反序列化失败 | 升级前黄金 checkpoint 跨版本回归 | 低于 min → 安全终止；区间内 → 桥接；可强制 pin 旧 runtime 实例 |
| F-LOCK | 同 thread 并发 resume/双开 | 租约抢占 0 行 | 拒绝第二个，提示会话进行中 |
| F-BP | 批量回填拖垮在线 resume | 在线 p95 超阈 | batch 自动 paused 退回懒迁移 |
| F-LOOKUP | 迁移 readonlyLookup 命中 DB 抖动 | lookup 超时/报错 | 非关键字段→安全默认+待补；关键→quarantine（不丢数据） |
| F-MIG | 迁移函数抛错/产出非法 | 目标 manifest 双重校验 | run→quarantined，原 checkpoint 不动，DLQ 待补重放 |
| F-FB-ALL | 整条 fallback 链全死（kill-switch 关了唯一可用模型） | 链上无可用 binding | run **安全终止**（非无限重试），告知可稍后重开，事件落账本 |
| F-OLD | run 超 `min_resumable_ver` | resume 时版本比对 | 安全终止 + DLQ |
| F-RETIRE | `retire_after` 已过被 resume | retire 检查 | 安全终止 |

kill-switch/降级链是节点级安全兜底，**凌驾于 pin 之上**，但每次触发落 `InterviewEvent` 可解释。

## 12. 安全终止的诚实语义

文案必须诚实告知在途丢失：「本场已完成评分的 N 道题已保留；正在作答中的当前题答案将不计入」，不得用「记录已保留」掩盖在途丢失。两个保留窗口用途不同：`retire_after`（默认 14 天）超期不再活跃 resume，触发即安全终止；旧图定义保留 90 天仅供 DLQ 重放/审计/复盘，不供活跃恢复。

report 子图幂等按 `(resultId, graph_version)` upsert `AssessmentReport`（`ON CONFLICT DO UPDATE`），重算覆盖语义明确，避免重复行；report 作 subgraph/后台 job，永不阻塞面试主路径。

## 13. 与 RAG 语料生命周期的边界

| 归本方案 | 归 RAG 语料治理 |
|---|---|
| 生成模型/图拓扑/prompt/工具契约/输出 schema 的版本演进 | 嵌入模型迁移、语料重建索引 |
| 长会话 checkpoint 恢复、迁移链、安全终止 | 混合检索、rerank、query 改写 |
| 迁移是否引入隔离回归（监控） | 4 级可见性、principal 归属、租户隔离强制、grounding、真实性校验 |

## 14. 分阶段落地（守 walking-skeleton 纪律）

整套（多表+DLQ+batch+manifest）**不一次性建**，否则正文本身成了「反对过度设计」的反面样板：

- **Phase 0（demo 必做）**：只 `ai_graph_run` + **pin** + **Drain** + **安全终止** + thread 租约（F-LOCK 最小版）。不做迁移函数/batch/shadow/manifest 表（用单列记录当前版本）。一场「能 pin、能 drain、能安全终止」的面试已足以演示「长会话版本一致性」核心卖点。
- **Phase 1**：懒迁移（仅纯 payload 字段级）+ contract-diff CI 判级 + 逐版单跳链。
- **Phase 2**：引入 `ai_release_manifest` + 分层金丝雀 + 模型迁移离线 eval 门禁。
- **Phase 3（按需）**：批量迁移 + 背压 + DLQ 重放。

每阶段 DoD：可演示、无死路、黄金 checkpoint resume 冒烟进 CI。

## 验证手段

黄金 checkpoint 套件（before/after fixture + resume 端到端冒烟）；CI contract-diff 强制判级；并发回归（同 threadId 并发 2 resume，断言只 1 个推进、`answer_evaluated` 不重复、第二个被租约拒绝）；背压回归（注入在线延迟断言 batch 自动 paused）；引擎升级回归（升 runtime/serde 前跑全套反序列化）；幂等回归（report 重复触发断言行数不增）；安全终止文案断言。
