---
id: testing_cloud_runtime_performance_thresholds
name: 云端运行性能与成本阈值
description: 为云端运行、迁移、缓存和全格式摄取定义运行前冻结的量化阈值、样本量、预算与晋级规则。
type: testing
scope: shared
level: spec
status: draft
owner: platform
version: 2
related:
  - ./cloud-runtime-migration-test-matrix.md
  - ../requirements/use-cases/cloud-runtime-and-migration.md
tags:
  - cloud
  - performance
  - cost
  - release-gate
---

# 云端运行性能与成本阈值

## 0. 使用规则

阈值清单 `THR-CLOUD-v1` 只定义 staging（预发布环境）的可重复验收，不代表 production（生产环境）SLA（服务等级协议）。在每次云端 run 前，平台、质量和成本责任角色必须对**本版本摘要**签名；未签名、资源规格漂移、样本不足、缺少三次完整记录或任何一次超阈，结论均为 `inconclusive`（结论不充分），不能发布。阈值只能通过创建新版本放宽，并且必须以新版本重跑所有受影响 TC（测试用例）；不得修改已有证据。

所有延迟从 runner（运行器）发起端单调计时；每条记录包含镜像 digest（内容摘要）、TargetGrant（目标授权）摘要、运行器规格、RDS（关系型数据库服务）规格/RCU（资源容量单位）、Tair 规格、数据集 revision、并发、持续时间、预算账本和证据 URI（统一资源标识符）。错误率的分母是所有已发起请求；故障注入场景另记“预期拒绝”，不把它伪装成成功。

## 1. 冻结资源与样本

| 项 | `THR-CLOUD-v1` 冻结值 | 违反后的判定 |
| --- | --- | --- |
| 重复次数 | 每项真实云 TC 连续 3 次，配置摘要完全相同 | `inconclusive` |
| Runner | 同 VPC、2 vCPU、4 GiB 内存、单一镜像 digest | `inconclusive` |
| RDS staging | 仅记录实际规格；当前 Serverless 基础版只能作 staging，不作生产推断 | 规格变化必须重跑 |
| 普通 API 样本 | 1,000 请求，持续至少 10 分钟，并发 20 | 样本不足 → `inconclusive` |
| Tair 缓存样本 | 10 轮 × 128 并发 = 1,280 请求；每轮不同 run ID | 样本不足 → `inconclusive` |
| 迁移 fixture | 100,000 行、至少 12 表、含 JSON（对象数据格式）/Unicode（统一码）/外键/序列/RLS（行级安全） | 结构或规模不足 → `inconclusive` |
| 全格式样本 | 每个宣称支持格式至少 20 个良性样本 + 10 个恶意/超限样本 | 格式缺样本 → `blocked` |
| 模型调用 | 云基础设施 TC 每次完整 run 最多 10 次收费模型调用，三次共最多 30 次；超过即停止并人工复核 | 超预算 → `failed` |

## 2. 量化验收阈值

| 阈值 ID | 关联 TC | 通过条件 | 失败/阻断条件 |
| --- | --- | --- | --- |
| `THR-01-runtime` | `TC-CLOUD-01-main/E1/E2/E4/E5/E6` | 普通 API 成功路径 P50 ≤ 120ms、P95 ≤ 350ms、P99 ≤ 800ms；非注入错误率 ≤ 0.5%；一次受控启动至 API/Worker readiness ≤ 60s | 任一重复超阈、TLS/身份误配、RAG 降级时仍调用模型 |
| `THR-02-migration` | `TC-CLOUD-02-main/E1/E2/E4/E6` | 100,000 行/12 表 fixture 的内容摘要、关系、序列和 RLS 一致率=100%；恢复演练 ≤ 30min；源冻结 ≤ 20min | 任意内容/约束差异、源冻结超时、自动重跑 orphaned（孤儿任务） |
| `THR-03-cache` | `TC-CLOUD-03-main/E1/E2/E4/E5/E6` | 1,280 请求中 winner=10（每轮 1）、旧 owner 覆盖=0、跨范围命中=0、非注入错误率 ≤ 0.5%；cache acquire P95 ≤ 80ms、P99 ≤ 200ms | 模型派发数>每轮 1、未知费用自动重发、越权命中 |
| `THR-04-ingest` | `TC-CLOUD-04-main/E1/E2/E4/E5/E6` | 良性样本扫描/解析成功率=100%；恶意/超限样本拒绝率=100%；授权 citation（引用）回跳正确率=100%；Excel 单元格/范围 locator 精确率=100%；PDF 页码精确率=100% 且页框 IoU（交并比）P95 ≥ 0.90；PPT（演示文稿）页码-形状 locator 精确率=100%；图片区域 IoU P95 ≥ 0.90；音视频时间戳绝对误差 P95 ≤ 1.0s、P99 ≤ 2.0s；在线可读残留=0 | 任一恶意样本进入 `published`、任一 locator 低于门槛、任一撤权后可读、删除误报 `erased` |
| `THR-05-security` | 所有 `*-E3` | 本地授权错误 SQL/HTTP=0；远端只读预检以外的 DDL/DML（数据操纵语言）/OSS 写=0；跨 run RDS/Tair/OSS 直接读写列删=0；checkpoint 跨主体读写删=0 | 任一越权副作用或静态高权凭据参与破坏性路径 |

## 3. 成本、数据和升级边界

- 模型成本必须来自持久费用账本；无法确认的供应商响应记为 `unknown`，不计入可用余额且不自动重试。
- 网络、存储、RDS、Tair 的云账单以控制面后续账单记录为准；当费用仍为 `unknown` 时，不得写“成本达标”。
- 上述阈值是首个受控 staging 门；它们不构成 production RPO（恢复点目标）、RTO（恢复时间目标）或高可用声明。production 必须有独立、经业务签署的规格、灾备和成本阈值。
