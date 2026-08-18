---
id: use_cases_preview_synthetic_data_factory
name: 预览环境海量合成数据工厂用例
description: 定义 B/C 测试账号、复杂业务状态、批量装载、隔离验证和按批次清理的合同与七类测试矩阵。
type: requirements
scope: shared
level: spec
status: active
owner: qa
version: 1
related:
  - ./ecs-full-stack-preview-runtime.md
  - ../../architecture/current-runtime-truth.md
  - ../../delivery/cloud-resource-inventory.md
tags:
  - preview
  - synthetic-data
  - seed
  - rls
  - load
---

# 预览环境海量合成数据工厂用例

> 本文只定义 `meetwise_preview` 的合成测试数据。它不是生产数据迁移、模型质量、评分有效性、删除完成或容量发布证据。任何真实姓名、邮箱、手机号、简历、录音、回答、公司或招聘决定都不得进入该批次。

## 容量档 `large-v1`

| 对象 | 数量/分布 |
| --- | --- |
| B 端 recruiter | 20 个；每个 50 个岗位、约 500 条申请投影 |
| C 端 candidate | 200 个；每个约 50 条申请、3 份简历状态样本、30 场面试投影 |
| 岗位 | 1,000 个；全部经当前公开 API 建为 open，覆盖 backend/frontend/qa/ai_ml 与 Node/Java/Go/Python 等展示标签；当前没有关闭岗位的公开写接口，工厂不得暗改 closed |
| 申请 | 10,000 条；由候选人真实投递，覆盖 invited/declined，score 恒 NULL；in_progress/assessment_unavailable 留给后续真实岗位面试状态机生成 |
| 简历/画像 | 600 组；全部经 consent + upload API 生成，只含合成文本和加密 blob/脱敏画像；不伪造失败或删除状态 |
| 面试 | 6,000 场；经 create + abandon API 生成合法历史；不 begin、不创建 job、不保存 raw answer |

### 重点账号族

- `deep-*`：高密度使用画像。每个 C 端账号拥有 3 份简历、约 50 条申请和 30 场面试；每个 B 端账号拥有 50 个岗位、约 500 条候选投影，专门验证大列表。当前装载均使用实际执行时刻，不把“跨月时间线”计为已覆盖。
- `edge-*`：奇葩但合法的 Unicode、CJK、emoji、组合字符、全角符号、极长岗位描述、重复标题和合法状态边界。所有字符串仍须通过共享 contract；控制字符和非法 schema 在写库前拒绝。未来/很早时间线尚未由当前 API-only 工厂实现。
- `long-resume-*`：通过真实 HTTPS/API 上传接近 `UploadResumeDto` 60,000 字上限的纯合成长简历，包含多段经历、项目、技术栈、表格化文本和注入样式干扰行，用于验证清洗、加密、结构化和页面读取；另以超过 60,000 字请求验证 HTTP 拒绝且数据库零增量。
- `empty/failure-*`：合法空态、declined 申请，以及无同意/错误密码/超限输入的零写入拒绝，用于验证界面不把缺失能力伪装成成功。closed 岗位和 `assessment_unavailable` 只由其真实业务状态机产生，不由数据工厂伪造。

上述是首批上限，不是单事务大小。装载器必须按对象和 owner 分块，持续测量 RDS 连接数、事务时长、数据库体积和页面查询延迟；达到保护阈值即停止，不得为追求行数挤满 10 GiB 数据盘或 50 连接上限。

## UC-preview-synthetic-data-01 · 建立可登录的 B/C 海量合成数据批次

- 角色 Actor：预览环境管理员、合成数据装载器、API/Web、RDS。
- 前置 Precondition：
  1. 目标档精确绑定 RDS instance、database=`meetwise_preview`、TLS、schema revision 与 release digest；
  2. `meetwise_cloud_test` 及任何其他数据库不在允许写集合；
  3. 批次 seed、容量档、数据目录版本和密码派生策略已冻结；
  4. Worker 在装载期间停止或装载器保证不会创建可领取任务；
  5. expert-audit 与 spec-gate 已通过。
- 触发 Trigger：ECS root 以显式 batch id 执行 `plan`，确认后执行 `apply`。
- 主流程 Main：
  1. `plan` 读取当前数据库标识、迁移根和容量，生成不含密码/PII 的 manifest 与摘要；
  2. 装载器只调用 ECS loopback API，不持有数据库写凭据；root-only manifest 以 `datasetId + catalogDigest` 抢占单 loader，并逐阶段 fsync 记录进度；
  3. 经真实 signup/login 创建 recruiter/candidate 账号；密码由 ECS root-only seed secret 确定性派生并由 API 以 scrypt 落库，展示账号凭据只写 root-only receipt；
  4. 先为 `long-resume-*` 账号走真实 consent + upload API，验证 59,800 字附近成功和 60,001 字拒绝；再通过 API 创建岗位、投递、婉拒、简历和 create→abandon 面试历史；
  5. 每阶段记录精确计划数、插入数、冲突数、耗时和摘要；日志不得包含密码、连接串、简历正文或回答；
  6. 使用真实低权 B/C 登录分别查询自己的页面投影，再用其他主体验证越权为 0；数据库层无 principal 与跨主体矩阵使用只读 proof，不由 factory 直连写库；
  7. 管理读回核对总量、状态分布、FK、孤儿、score/raw-answer/queued-job 禁止项和目标库增量；
  8. 全部通过后 batch 由 `loading` CAS 到 `ready`，输出脱敏 receipt。
- 备选流 Alternate：容量保护阈值先达到时，loader 停在完整 owner chunk 边界，批次记 `ready_limited`（若状态合同允许）或 `failed`，不得谎称达到 large-v1；后续只能以新 batch revision 扩容。
- 异常流 Exception：
  - E1 重复：同 batch、同 manifest 重放只回放既有 receipt，业务行零增量；同 batch 不同 manifest 拒绝。机制：batch 唯一键、manifest digest 和逐对象唯一映射。
  - E2 并发：20 个 loader 同时运行时恰一个取得 batch lease；失联后只允许 fence 后接管，旧 loader 不能提交新 chunk。机制：CAS、lease token、chunk receipt。
  - E3 越权：B/B、C/C、B/C、无 principal、伪 role 与 direct runtime SQL 均不能读取/修改不属于自己的私有对象；开放岗位只按产品合同公开。机制：RLS、低权 gateway、显式 owner 过滤。
  - E4 失败回滚：任一 API 请求失败后 batch 不得标 ready；重试依赖账号唯一键、岗位 idempotency key、application 唯一键、简历内容去重和“单一开放面试”复用语义。当前数据库专属于唯一长期合成 dataset，回收只能停止服务后重建整个 `meetwise_preview` 并重跑迁移，不提供模糊前缀 DELETE。`erasure_fenced/erased` 受暂停门保护，不得用 seed 绕过。
  - E5 降级：Worker、模型、Tair、OSS、OCR、语音、支付均不是生成前提；不可用时仍可生成纯数据库展示数据，但相关能力只显示 unavailable，不伪造成功。
  - E6 超时/断线：SSH/进程/数据库响应丢失后，按 durable batch/chunk receipt 恢复；不能靠客户端计数猜测，也不能换 batch 悄悄重做。
- 后置 Postcondition：成功 dataset manifest 状态为 `ready`，该专用数据库在装载前必须为空且只包含这一 dataset；固定验收库增量为 0；不存在 raw answer、数值 B 端 score、可领取 Worker job、支付、模型调用或外部 trace。
- 验收 Acceptance：
  1. 规模和每账号分布精确符合 `large-v1` 或明确的保护阈值终态；
  2. 两个展示 recruiter、两个展示 candidate 可经真实 HTTPS 登录，页面展示大量分页数据；
  3. 至少一个 `deep-*`、一个 `edge-*`、一个 `long-resume-*` 和一个 `empty/failure-*` 账号可登录复核对应页面；
  4. 账号密码哈希不是明文，receipt 权限为 root-only，Git/Pages/日志没有凭据；
  5. 所有申请 `score IS NULL`，没有伪造排序/录用结论；
  6. `interview_job status IN ('queued','running')`、模型调用、支付、语音/OCR/OSS 副作用增量均为 0；
  7. RLS 越权矩阵全部返回 0，公开岗位之外无跨主体数据；
  8. 同 dataset 重放业务表总量不变；若数据库出现非 catalog 账号或第二 dataset，装载器立即拒绝，不能自动清理。
- 关联：不新增公开 endpoint；状态对象为 `SyntheticFixtureBatch`/`SyntheticFixtureObject`；命中 CAS、幂等键、RLS 和持久账本；安全规则为 synthetic-only、无凭据输出、无模型/支付/PII 副作用。
- 七类覆盖：正常（Main）/异常（E4、E6）/特殊（边界文本与状态目录）/逃逸通道（E3）/高并发（E2）/复杂（跨 B/C 关系图与分页）/刁钻（E1 同 batch 异 manifest、错误 target、孤儿与清理攻击）。

## 七类测试矩阵

| 类别 | TC | 层 | 核心断言 |
| --- | --- | --- | --- |
| 正常 | `TC-preview-synthetic-data-01-main` | ECS + RDS + HTTPS | 精确数量、展示账号可登录、B/C 页面批量数据可分页。 |
| 异常 | `TC-preview-synthetic-data-01-E1` | API fault injection | 请求中断/响应丢失后重跑不重不漏，manifest 未越级 ready。 |
| 特殊 | `TC-preview-synthetic-data-01-E2` | contract/API | CJK、emoji、组合字符、59,800 字简历等合法输入通过；60,001 字、控制 schema 和删除状态等非法输入零写入拒绝。 |
| 逃逸通道 | `TC-preview-synthetic-data-01-E3` | 低权 SQL + HTTP | 跨 owner/role、无 principal、伪 cookie、direct runtime SQL 私有读取或修改均为 0。 |
| 高并发 | `TC-preview-synthetic-data-01-E4` | 20 路并发 | 单 batch 单赢家、对象总量精确、连接池不超预算。 |
| 复杂 | `TC-preview-synthetic-data-01-E5` | browser + DB | 招聘方岗位/人才池与候选人岗位/申请/简历/面试的关系一致，分页/筛选/空态/失败态均可观察。 |
| 刁钻 | `TC-preview-synthetic-data-01-E6` | target/purge/security | 错误 DB/schema/digest、同 batch 异 manifest、伪 object registry、跨批次 purge 全部失败且基线不变。 |

## 禁止伪造的业务事实

- `answer_evaluated`、ScoreCard、数值 score、人才排序、录用/拒绝决定。
- 模型/RAG/Embedding/语音/OCR/支付/退款/删除完成和供应商回执。
- raw answer、简历原文、真实 PII、真实企业/岗位和受保护属性。
- queued/running job、活动 lease、活跃模型 invocation 或费用预留。

## 分阶段执行门

1. `showcase-v1`：6 个 candidate、2 个 recruiter；覆盖 deep/edge/long-resume/empty persona，并完成 HTTP、页面、DB 三方核对。
2. `large-v1`：只有 showcase receipt 通过后才扩到 20 recruiter、200 candidate、1,000 jobs、10,000 applications、600 resumes、6,000 abandoned interviews。
3. 任一阶段发现 queued/running job、模型/支付副作用、numeric B score、非 catalog 账号、数据库容量或页面延迟越界，立即停止，不能继续扩容。

`showcase-v1` 已作为同一 synthetic dataset family 的基线阶段写入；因此后续 `large-v1` 的数据库累计目标为 220 个账号、1,024 个岗位、10,072 条申请、600 份去重简历和 6,180 场 abandoned 面试。large manifest 自身仍计划 20/200/1,000/10,000/600/6,000；验收必须同时报告阶段内与累计值，不能把前一阶段 24 个岗位、72 条申请和 180 场面试藏掉。

## 当前门禁

- `spec-gate`：**large_load_completed_pending_extended_acceptance**。2026-08-16，`large-v1` 在 ECS 上完成一次受控装载；systemd `Result=success`、`NRestarts=0`，耗时 14 分 30 秒。post-verification 累计达到 220/1,024/10,072/600/6,180，当前定义的 12 项 forbidden counter 均为 0，maintenance ledger 已恢复，API/Web/Worker/Nginx 均为 active。完整 verification digest 为 `20a592ee483d5a52c7a6b3dda9e0072ddd0aeac2deb2abbde42eeb8c1b99af8e`，DB receipt digest 为 `5be888773fe97349b26f91dd2ce2f959111e58976a99affaf251c1f344b7158e`，target digest 为 `76384d220048a60938071d2a2eb4dff8e715e6b7157b87f7e5018070ad71950b`，`verifiedAt=2026-08-16T15:51:03.657Z`；root-only 原始回执位于 `/var/lib/meetwise-preview-synthetic/preview-large-v1/`。该证据不证明 SIGKILL takeover、RLS 全矩阵、逐 owner 分布、浏览器分页/筛选、持续性能或生产可用。
