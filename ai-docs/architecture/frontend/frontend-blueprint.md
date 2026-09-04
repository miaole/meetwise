---
id: architecture_frontend_blueprint
name: 前端架构方案
description: Meetwise Web 端（Next.js App Router）的技术选型、组件库、RSC 边界、数据流、SSE 消费、状态与安全设计。
type: reference
scope: shared
level: guide
status: active
owner: architecture
version: 1
tags:
  - architecture
  - frontend
  - nextjs
related:
  - ../system-blueprint.md
  - ../ai/langgraph-blueprint.md
  - ../../requirements/use-cases/cend-overview-progress.md
  - ../current-runtime-truth.md
---

# 前端架构方案

> 前端是 **Next.js App Router**。本文与 `system-blueprint.md` 的「契约先行、所有用户内容不可信、状态落服务端」一致。
>
> **落地状态（apps/web）**：SSE 重连驱动、类型化 API 客户端、Next.js App Router 页面、`InterviewPanel`、`VoiceCallPanel` 和 B/C 端页面均已存在；`runInterviewStream` 使用 Last-Event-ID（最后事件编号）续传、重连上限、buffer（缓冲区）封顶和 AbortSignal（取消信号），视图归约将 `report_unavailable` 表示为降级出口。C 端进度相关路由是 `/dashboard`（成长主页）与 `/interviews`（列表）；`/growth` 是成长档案（`totals.answered`=ScoreCard「累计已评分」，与 dashboard 已答题数不同源）。不是下文目标态的 `history`/`profile`。列表/详情进度文案读 `InterviewView.issued_turns`/`answered_turns`；成长主页「已答题数」读经契约校验的 `Overview.answered`（题目账本，不是 ScoreCard 张数），取数失败显示「—」。均分仍来自 ScoreCard。成长档案页 `totals.answered` 仍为可评分 ScoreCard 数，文案是「累计已评分」，与 dashboard 已答题数不同源。见 [C 端总览进度用例](../../requirements/use-cases/cend-overview-progress.md)。`pnpm web:prove` 覆盖承重纯逻辑，但它不是浏览器、真实 API、语音设备或云环境的发布证明。组件库、页面清单和生产验证状态以 [运行时事实矩阵](../current-runtime-truth.md) 为准。

## 1. 选型决策

| 层 | 选型 | 原因 |
| --- | --- | --- |
| 框架 | Next.js App Router + React 19 + TypeScript | RSC、流式渲染、SEO、部署一等公民 |
| 样式 | Tailwind CSS v4 | 原子化、可组合、构建期裁剪，设计系统同源 |
| 组件库 | **shadcn/ui（Radix primitives，copy-in 自有代码）** | 组件源码进仓库、可改可审计、无运行时锁定，符合「先快后稳沉淀设计系统」 |
| 图标 | lucide-react | shadcn 默认，tree-shakable |
| 契约客户端 | **共享 zod4 schema（`packages/contracts`）+ 类型化 fetch 封装** | 同一份 schema 前后端共用，从第一天锁接口，杜绝手写 fetch 路径漂移。**注：ts-rest 3.x 锁 zod^3、与 zod4 不兼容，已弃用改 zod4-native，见 ADR-0004** |
| 服务端状态 | TanStack Query（client）+ RSC fetch（server） | 缓存、重试、失效、分页统一；RSC 负责首屏/SEO |
| 客户端 UI 状态 | **Zustand（仅存易失 UI 态）** | 面试真相在服务端 checkpoint，客户端只存草稿/开关，不当事实源 |
| 表单 | react-hook-form + `@hookform/resolvers/zod` | 复用契约里的 Zod schema，前后端同构校验 |
| Markdown | **react-markdown + rehype-sanitize** | AI 输出是不可信内容，必须 sanitize，从根上消除 **XSS 风险** |
| 语音 | Web Speech API（封装成 hook） | 浏览器原生能力，封装为 `useSpeech*` |
| 测试 | Vitest + RTL + Playwright + MSW | 见 `testing/strategy/test-strategy.md` |

## 2. `apps/web` 目录结构

```text
apps/web/
  app/
    (marketing)/            # RSC：首页、FAQ、协议、隐私、联系 —— SEO、ISR
    (auth)/login/           # 微信扫码登录（client island 轮询二维码状态）
    (app)/                  # 目标态曾规划 history/profile；当前 C 端进度面如下
      dashboard/            # 成长主页：已答题数 + 最近场次进度
      interviews/           # 面试列表进度文案
      growth/               # 成长档案（累计已评分 = ScoreCard，不是已答题数）
      interview/
        [resultId]/         # 模拟面试运行页（client：SSE + 对话）
        [resultId]/report/  # 报告页（实际路由多为 /report/[id]）
    api/                    # 仅做 SSE/上传的薄代理 route handler，不放业务
  components/               # shadcn/ui 自有组件 + 业务组件
  lib/
    api/                    # 类型化 fetch 封装（server 版 + client 版，复用 contracts schema）
    stream/                 # useInterviewStream 等 SSE hooks
    store/                  # zustand（仅 UI 草稿态）
  middleware.ts             # 鉴权重定向
```

## 3. RSC / Client 边界（核心原则）

默认 **Server Component**；只有需要交互、订阅 SSE、用浏览器 API 的地方下沉为 `'use client'` 岛屿。

| 页面 | 渲染 | 理由 |
| --- | --- | --- |
| 营销页 / FAQ / 协议 | RSC + ISR | 纯内容、可缓存、要 SEO |
| `interview/start` | RSC 预取岗位/简历列表 + 表单 client 子树 | 首屏服务端取数，交互局部 client |
| `interview/[resultId]`（押题进度 / 模拟对话） | client | 实时 SSE、流式文本、TTS、暂停恢复 |
| `interview/[resultId]/report` | RSC 首屏（报告若就绪）→ 未就绪降级 client 轮询/SSE | 报告重、可 SSR；异步未完成时再订阅 `report_ready` |
| `history` / `profile` | 目标态 | 下文路由设计仍用这两个名字；**当前代码没有这两条路径** |
| `/dashboard`（成长主页） | RSC | 并发拉 `/profile/overview` + `/interview`；「已答题数」=`overviewAnsweredLabel`（契约失败→「—」）；最近场次走 `interviewProgressLabel` |
| `/interviews` | RSC | 列表进度只渲染 `InterviewView` 账本字段，不另计 ScoreCard |
| `/growth` | RSC | `totals.answered` 文案「累计已评分」，与 dashboard 已答题数不同源 |
| `/resume` | RSC + 上传 client 岛 | 文本/PDF 常开。图片 OCR **仅预览**：RSC 读 `isOcrPreviewEnabled`（精确 `OCR_ENABLED=1` 且 `OCR_PREVIEW=1`，生产/enforce/公开预览锁定）再传给表单；关闭态 `accept` 不含图片，Server Action 本地拒绝。失败映射 API `{error}`，**不把 `text`/`transcript` 当成功转写**。API 预览 invoke 与 `0127` 已在 main。`releaseEvidence=false`，不是视觉质量 SLO。 |

## 4. 路由设计：用嵌套路由，不要 URL-query 状态机

把整个面试流程塞进 `/interview?step=input|progress|interview|complete&serviceType=...` 一个客户端组件的 URL-query 状态机是错的：状态活在客户端、刷新即丢、无法分享、无法从服务端恢复。Meetwise 用**资源化的嵌套路由**：

- `/interview/start` → 配置入口。
- `/interview/[resultId]` → 一次面试 = 一个 `interviewResult.resultId`（也是 LangGraph 的 `threadId`）。URL 天然可分享、可恢复、可刷新。
- `/interview/[resultId]/report` → 报告。

好处：刷新或断线后，凭 URL 里的 `resultId` 重新拉 checkpoint 即可恢复，不依赖任何客户端持久化——URL 就是恢复句柄，服务端 checkpoint 是唯一真相。

## 5. 数据获取：契约先行

`packages/contracts` 用 **zod4 schema** 定义所有接口的请求/响应，前端只消费类型化封装，**禁止手写 fetch 路径**（杜绝审计里前后端漂移的 8+ 缺口接口）。后端用同一份 schema 过 `ZodValidationPipe` 校验、出 `zod-openapi` 文档。

```ts
// lib/api/client.ts —— 类型化 fetch 封装，请求/响应都用契约 schema 校验
import { AnswerDto, InterviewView } from "@meetwise/contracts";

export async function getInterview(id: string): Promise<InterviewView> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/interview/${id}`, { /* auth header */ });
  return InterviewView.parse(await res.json());   // 运行时校验，类型从 schema 推导
}
```

- RSC 里直接 `await getInterview(id)` 服务端取数。
- Client 里用 TanStack Query 包一层：`useQuery({ queryFn: () => getInterview(id) })`，拿缓存/重试/失效。
- 决策见 ADR-0004：ts-rest 3.x 锁 zod^3、与 zod4 不兼容 → 弃用，改共享 zod4 schema（前后端同构校验、单一真相）。

## 6. 客户端状态：Zustand 只存易失态

把整段面试 `messages`、`referenceAnswer`、`sessionId` 用持久化插件写进 localStorage 是反模式——一旦服务端会话过期，客户端持久态就成了与服务端分叉的第二真相源。Meetwise 反过来：

- **真相源 = 服务端 LangGraph checkpoint（Postgres）**。
- Zustand 只放**易失 UI 态**：表单草稿、侧边栏开关、TTS 开关、乐观更新的临时占位。
- 进入/恢复面试页时，先从服务端拉权威对话历史与 `waiting_user` 状态，再渲染；Zustand 不做事实存储。

## 7. SSE：消费业务事件，连接可抛弃

前端订阅的是**业务事件**（`progress`、`question_ready`、`waiting_user`、`answer_evaluated`、`report_ready`、`error`），不是模型 token（见 `langgraph-blueprint.md`）。`answer_evaluated.score` 只经 `practiceHintScore`（canonical question identity **加** answer claim）展示练习 hint；缺身份不展示分（不是 0）。`report_ready.overall` 非 0..100 整数不写入视图。这是 `SCOR-00H` 消费诚实，不是测量权威。封装成一个类型化 async-generator hook，全站只有这一处 SSE 解析逻辑：

```ts
// lib/stream/useInterviewStream.ts
export function useInterviewStream(resultId: string) {
  // fetch + ReadableStream 解析 SSE；产出强类型 BusinessEvent
  // 断线 = 无副作用：用同一 resultId 重连，服务端凭 checkpoint 回放当前状态
}
```

**关键设计：SSE 连接是一次性的、可随时断的。** 断线/超时不丢业务状态，因为状态在服务端业务事实与受控 checkpoint 中。这不把 checkpoint 当作用户历史、删除账本或长时 transcript；这些能力仍受 `INT-TRANSCRIPT-00/01` 阻断。ECS 应用运行时必须支持断线后的安全重连，客户端不得把连接存活当作事实。

## 8. 鉴权：middleware + httpOnly cookie

把 JWT 存 localStorage、每个请求手动塞 header 会把 token 暴露给任意脚本，易受 XSS 窃取。Meetwise：

- 登录态用 **httpOnly、Secure、SameSite cookie**，JS 读不到。
- `middleware.ts` 用 `protectedPaths` 前缀匹配 + `matcher: '/:path*'`，未登录重定向 `/login`。`/dashboard` 与 `/interviews` 在名单内；`/growth` 目前靠页内 `getServerToken()`，尚未列入 `protectedPaths`。下方 snippet 是目标态示例，不是当前文件。
- RSC 取数在服务端转发 cookie；client 走同源代理 route handler。

```ts
// middleware.ts —— 下文是目标态示例，不是当前文件。现网 matcher 为 `/:path*`；
// 鉴权名单含 /dashboard /interviews，不含目标态 /history /profile。
export const config = { matcher: ["/interview/:path*", "/profile", "/history"] };
```

## 9. AI 内容渲染与安全

- 所有 AI/用户产出的 Markdown 一律 `react-markdown` + `rehype-sanitize`，**绝不** `dangerouslySetInnerHTML`。直接消除审计标注的 `v-html` XSS。
- 报告/答案里的链接、图片白名单化。
- 前端只做预校验，权威校验在服务端（与 `status-machine.md`、`structured-output-and-safety.md` 一致）。

## 10. 静态目录与 ECS 应用运行时

- GitHub Pages 只发布项目导航用的纯静态目录，不承载 Next Server Actions、cookie、API、SSE 代理或用户数据；它不是实际应用部署，也不是认证边界。
- 用户应用、API 与 Worker 由受控 ECS 运行。预览入口必须是固定 HTTPS hostname，并绑定不可变镜像摘要、健康回执和独立访问策略；没有这些证明的目录项保持禁用。
- **长连接 SSE**：面试可能跨越数分钟到数小时。应用运行时必须把 SSE 断线视为正常路径：客户端使用稳定 cursor/snapshot 重连，服务端业务事实与受控 checkpoint 决定可见状态。不能因静态目录可访问而假设应用连接已经就绪。
- API 不应被静态目录代理；同源需求只能由经认证的 ECS Web 运行时处理。

## 11. 关键技术选型与理由（失败模式驱动）

每条选型都对应一个具体失败模式——这些是前端最容易踩、且一旦踩到就动摇「状态落服务端、内容不可信」两条底座的坑。

| 选型 | 拒绝的反模式 | 理由（失败模式） |
| --- | --- | --- |
| shadcn/ui 自有源码 | 运行时锁定的组件库 | 组件源码进仓库才可审计、可定制、无版本锁定 |
| 嵌套路由 + `[resultId]` | `?step=...` 单组件 URL 状态机 | 状态活在客户端则刷新即丢、无法分享、无法从服务端恢复 |
| 服务端 checkpoint 为真相，Zustand 仅 UI | 客户端持久化整段面试状态 | 客户端持久态会成为与服务端分叉的第二真相源 |
| 共享 zod4 schema 契约 | 手写、易漂移的前端 fetch 路径 | 同一份 schema 前后端共用，从根上杜绝接口漂移 |
| react-markdown + rehype-sanitize | 裸 HTML 注入渲染 | AI/用户输出是不可信内容，不 sanitize 即 XSS |
| httpOnly cookie + middleware | JWT 存 localStorage 手动塞 header | localStorage 中的 token 任意脚本可读，易被 XSS 窃取 |
| Vitest + RTL + Playwright + MSW | 无自动化测试 | SSE 渐进渲染/断线重连/契约不漂移必须可回归，见测试策略 |

## 12. 测试

- 组件/hook：Vitest + React Testing Library。
- SSE：MSW 模拟事件流，断言渐进渲染与断线重连。
- E2E：Playwright 跑「选岗→押题 SSE→报告」「开始模拟面试→回答→暂停→恢复→结束」全链路（见 `test-strategy.md` 必测路径）。
- 契约：前端用与后端同一份 zod4 schema 做类型与 schema 测试，保证不漂移。
