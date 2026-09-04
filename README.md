# Meetwise · 知面

**预览版。** 按真实经历练面试：出题、追问、留下点评。招聘侧是后续方向，不是已经能用来招人。

下一题看你怎么答，不是套题。进度能留下来。关键路径可本地核对。点评给复盘用，不构成能力认证，也不承诺面试、录用或 offer 结果。

[查看源码](https://github.com/miaole/meetwise) · [项目展示](https://miaole.github.io/meetwise/) · [预览说明](#预览说明)

---

## 为什么值得看

预览里按这个建。打开页面不算验收。

### 自适应追问

下一问看你怎么答，不是套题。模型输出先过 schema，再过业务校验，才进入业务逻辑。

### 进度可接着

进度写在库里，不是记在浏览器。等待用户输入写成持久化状态。

### 本地可核对

关键路径有本地 prove 门，一键 `corepack pnpm <gate>` 跑：

```text
db:prove  runtime:prove  graph:prove  pipeline:prove  api:validate  api:smoke  arch  docs:check
```

打开页面不算验收。

### 分数围栏和招聘方向

点评给复盘用，不构成能力认证。同一件事不写成两套账。题和材料按可见范围取。招聘侧是后续方向，练习记录不进筛人，也没有自动录用。

设计说明见 `ai-docs/architecture/adr/`。

---

## 界面一览

> 合成截图，用来看版式。标题、按钮和价格以本页和项目展示为准。

### 桌面端

| 落地页 | 登录 / 注册 | 控制台 |
| --- | --- | --- |
| ![落地页](apps/web/docs/screenshots/01-landing.png) | ![登录注册](apps/web/docs/screenshots/02-login.png) | ![控制台概览](apps/web/docs/screenshots/03-dashboard.png) |

| 简历隐私同意门 | 简历解析结果 | 面试列表 |
| --- | --- | --- |
| ![PIPL 同意门](apps/web/docs/screenshots/04a-resume-consent.png) | ![简历解析](apps/web/docs/screenshots/04-resume.png) | ![面试列表](apps/web/docs/screenshots/05-interviews.png) |

| 能力成长曲线 |
| --- |
| ![成长曲线](apps/web/docs/screenshots/08-growth.png) |

---

## 技术架构

```text
apps/
  web/        Next.js App Router（真 RSC + Server Actions + cookie 鉴权，PC/H5 响应式）
  api/        NestJS API、认证与应用服务
  worker/     异步任务、LangGraph 面试编排与后台处理
packages/
  contracts/  共享 zod4 契约（前后端同源，zod-openapi 生成多端契约）
  domain/     领域规则与显式状态机
  db/         迁移、约束、RLS 与数据库访问层
  ai-runtime/ 模型调用与可观测性（统一模型出口，唯一模型调用关口）
  ai-graphs/  LangGraph 图编排定义
  config/     配置基座
ai-docs/      产品、架构、用例、测试与运行时事实说明
```

**技术栈**：Next.js App Router · NestJS · LangGraphJS · Postgres（+pgvector）· Redis · S3/MinIO。

几条架构约束：

- **Controller 不编排**，编排落在应用服务层；前后端由共享契约驱动，不做手写的、会漂移的 API 调用。
- **图编排不直接改支付/权益**；图状态只承载运行态，业务事实落业务表。
- **用户内容一律进数据块**，绝不拼接进系统指令；**模型输出双重校验**后才进业务逻辑。
- **每个有状态对象用显式 status 枚举**，状态迁移服务端重新校验。
- **检查点持久化到 Postgres**，等待用户输入表达为持久化状态，不用内存 session map。

---

## 快速开始

```bash
pnpm docs:check     # 校验 ai-docs 结构 + 必需术语 + 公共文案策略
pnpm compose:demo   # 起演示基础设施栈（docker/compose.demo.yml）
pnpm compose:down   # 拆演示栈
docker compose -f docker/compose.dev.yml up   # 仅开发基础设施（Postgres+pgvector、Redis、MinIO、Mailhog）
```

完整运行时实现、已验证命令与阻断项，见 [当前运行时事实矩阵](ai-docs/architecture/current-runtime-truth.md)；后续推进按 [执行清单](ai-docs/delivery/execution-master-checklist.md)。

---

## 预览说明

GitHub Pages 只发布 `docs/` 项目展示与源码入口，不是已经部署的在线服务，不启动本地数据面服务，也不代理 API、认证、SSE 或任何用户数据。不提供支付、购买、退款或自动扣费。语音与简历识图陆续开放。

请勿提交需要删除保证的真实简历、身份信息、录音或密钥。

---

## 文案与安全原则

- 只协助梳理真实经历，不编造、不夸大、不代答。
- 练习反馈不等于能力认证，不用于自动招聘决策。
- 未完成完整删除闭环前，不把删除或撤回描述为可用服务。
- 不把本地验证、静态检查或设计文档写成发布证据。
- 不提交真实密钥、真实简历、录音或其他敏感资料。

---

## 许可证

[MIT](LICENSE)
