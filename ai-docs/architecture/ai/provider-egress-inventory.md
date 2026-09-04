---
id: provider_egress_inventory
name: 模型供应商出站静态清单
description: 版本化枚举当前仓库的模型、嵌入、重排序、语音与供应商签名下载直连位置；只作观测门，不构成网络隔离或发布证据。
type: architecture
scope: ai-runtime
level: guide
status: active
owner: architecture
version: 1
tags:
  - ai
  - security
  - egress
  - inventory
---

# 模型供应商出站静态清单

机器可读来源是 [provider-egress-inventory.json](provider-egress-inventory.json)，不可协商的当前适配器/操作基线在 [provider-egress-policy.mjs](../../../scripts/provider-egress-policy.mjs)。它固定登记当前已知的 5 个直接适配器、10 个操作类别、28 个**适配器—来源文件登记对**和 176 个环境引用；数值由静态验证输出，代码或配置变化后必须重跑，不能手工改写。

| 范围 | 当前静态登记 | 解释 |
| --- | ---: | --- |
| 适配器 | 5 | 文本/视觉、嵌入、重排序、HTTP 语音、WebSocket（网络套接字）流式语音。 |
| 操作 | 10 | chat、视觉 OCR（光学字符识别）、ASR（自动语音识别）、流式 ASR、TTS（文本转语音）、流式 TTS、两类 embedding（嵌入）、rerank（重排序）、供应商签名下载。 |
| 适配器—来源文件登记对 | 28 | 区分 production-direct（生产直连）、manual（手动）与本地测试；当前 API 语音组合根与所有原始音频手工 smoke 均已 fail-closed。 |
| 环境引用 | 176 | `MODEL_*`（文本主用/兜底）和 `DASHSCOPE_*`（嵌入、重排序、语音）在 API（应用程序接口）、Worker（后台任务）、测试启动器及适配器中的位置；含 `scripts/run-post-change-regression.mjs` 的 live 启动器。`DASHSCOPE_TEST_TRANSPORT_OVERRIDES` 仅可用于受控本地 proof。 |

## 这个门禁能与不能证明什么

执行：

```bash
pnpm provider-egress:inventory
pnpm provider-egress:prove
```

它会拒绝：已知适配器新增直调**来源文件**却未登记、删减清单自身也无法删掉的 5 个策略基线适配器/10 个操作类别、遗漏当前已登记的 `MODEL_*`/`DASHSCOPE_*` 引用、遗漏 `packages/ai-runtime` 已知的 `fetch`（网络请求）/WebSocket 传输源，以及把此清单改成 `enforce`（强制）或发布证据。HTTP JSON（JavaScript 对象表示法）正文现在由 `timeout.ts` 的统一受限读取器发送并消费；文本、嵌入和重排序适配器不再各自持有裸 `fetch`，但它们仍必须在适配器登记中保留，不能借由集中传输层删掉业务操作。

它**不会**读取环境变量、发送网络请求、启动容器、上传证据、修改密钥、改变运行时路由或验证云端网络策略。因而固定输出 `releaseEvidence=false`（不可作为发布证据）。它也不等价于“只有网关有模型密钥”、完整 AST（抽象语法树）出站扫描，或“所有未知新供应商代码都已被网络阻断”；这些只属于仍被 UC-MODEL-002 阻断的模型网关目标态。

## 维护规则

新增或改动供应商适配器、模型配置、WebSocket、签名下载或直接消费者时，必须在同一变更中：

1. 更新 JSON 中的 adapter、operation、consumer、环境/部署引用；
2. 说明该路径是生产直连、手动实测还是本地测试；
3. 运行以上两个命令；
4. 在真正迁移至独立网关并完成云端 E2E（端到端）前，保持 `mode=observe-only` 和 `releaseEvidence=false`。
