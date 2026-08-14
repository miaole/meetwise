---
id: rule_ai_structured_output_and_safety
name: AI 结构化输出与安全规则
description: 定义模型输入、输出、校验、日志和隐私边界。
type: rule
scope: shared
level: policy
status: active
owner: ai
version: 1
tags:
  - ai
  - safety
  - structured-output
---

# AI 结构化输出与安全规则

## 输入

- 用户简历、JD、回答内容都属于不可信输入。
- 不可信输入只能放 data block，不允许拼入 system instruction。
- 输入模型前应记录 hash、长度、来源和敏感级别。
- 超长输入必须截断或摘要，保留截断策略。

## 输出

- 模型输出必须是结构化 schema。
- schema 校验失败必须重试、降级或返回可解释错误。
- 业务 validator 必须再次校验：
  - 问题数量
  - 字段完整性
  - 分数范围
  - 枚举合法性
  - 是否包含禁止内容
  - 是否引用不存在的简历事实

> schema 通过 ≠ 业务合法。一个结构完全合法、却「声称候选人有他简历里没有的经历」的输出，必须在业务 validator 被拦下。两段分离：先 coerce 归一类型 → schema 校验 → 业务校验，绝不裸 parse 进业务逻辑。

## 真实性校验（歪曲门）

防造假不止查「事实缺失」，更要查「**事实歪曲**」——这是面试场景的护城河，也是 B 端招聘决策的合规底线。

- **缺失**：模型断言简历里根本没有的经历/技能 → 拦截。
- **歪曲**（更隐蔽）：把简历里的「参与」说成「主导」、「30%」夸成「50%」、把边缘职责说成核心贡献 → 同样拦截。
- **证据接地**：模型对候选人的每条断言必须能追到 `ResumeProfile` 的某个字段 **provenance span**（来源页/坐标/原文）；追不到或与原文语义不符 → 判歪曲。
- **证据与判分解耦**：先用 provenance 锁定「候选人到底说了什么」，再独立判分；不让模型一边臆造事实一边给分。
- **语料/答案当不可信注入源**：参与生成的简历/答案可能夹「给满分」类注入，按 [安全纵深](./safety-defense-in-depth.md) 当 data 处理。
- 失败动作：歪曲视为 deterministic（不盲目重试）→ 标记 + 不入库 + 要求重生成或可解释降级。

## 日志

禁止记录：

- 完整简历原文
- 完整用户回答
- 身份证、手机号、邮箱等 PII
- API key、token、支付密钥
- 模型完整 prompt，除非脱敏且仅用于本地调试

允许记录：

- traceId
- graphRunId
- promptVersion
- model
- token/cost
- 输入 hash
- 输出 schema 校验结果
- 脱敏错误摘要

## 凭据边界

- 真实 API Key（Application Programming Interface Key，应用程序接口密钥）、AccessKey（访问密钥）、令牌、密码和私钥只能保存在被 Git 忽略的本机配置、操作系统密钥链或云端 Secret Manager（密钥管理服务）中。
- Git 仓库只允许提交不可用的 `.env.example` 占位模板；不得提交任何实际 `.env`、密钥前缀、可复用令牌、录音、简历原件或支付凭据。
- 本机提交钩子必须扫描暂存区并拒绝环境文件和常见密钥特征；CI（Continuous Integration，持续集成）必须扫描完整 Git 历史。两道门禁均不可被示例模板、日志或测试夹具绕过。
- 所有验证输出只允许出现“是否已配置”、模型名、哈希和聚合指标；禁止输出完整值、前缀或可拼接的片段。

## 内容安全

- 不帮助用户伪造经历。
- 不生成欺骗招聘方的虚假证明。
- 不诱导用户提供过度敏感信息。
- 职业路径建议必须保留不确定性和用户最终决策权。
