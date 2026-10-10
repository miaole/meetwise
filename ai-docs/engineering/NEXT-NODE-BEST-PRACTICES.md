# Next.js / Node (NestJS+Fastify) 最佳实践规范（仓库强制版）

> 依据 Next.js 15 App Router 与 Node.js 官方最佳实践，按本仓形态定制。**所有审计刀与修复刀以本表为判据**；新代码必须逐条对表；存量违规按台账逐刀收敛。
> 状态列：✅ 本仓已符合 · ⚠️ 部分符合 · ❌ 违反（登记台账）

## A. Next.js（apps/web，App Router）

| # | 规则 | 本仓状态 | 证据/违反点 |
|---|------|---------|------------|
| A1 | Server Components 默认；`'use client'` 只放交互叶子，禁在 page/layout 层 | ✅ | page 均为 server，client 集中 components/ |
| A2 | 数据获取在 server（page async 直取/`serverGet`），禁 client useEffect+fetch 拉首屏 | ✅ | lib/api/server.ts 体系 |
| A3 | API 响应走契约校验（zod safeParse），禁 `as T` 裸 cast | ❌ | server.ts:31 裸 cast；Report/Profile 类型漂移（台账 GAP-DEBT-FE-TYPESHARE） |
| A4 | Streaming/Suspense：慢区段包 `<Suspense>`；路由级 loading.tsx/error.tsx 齐备 | ⚠️ | 面试流式有 SSE；报告/管理页无 Suspense 细分 |
| A5 | fetch 缓存语义显式（`cache:'no-store'`/revalidate 标注） | ⚠️ | serverGet 默认未标，依赖 Next 默认行为 |
| A6 | `next/image`/`next/font` 强制（禁裸 `<img>`/CSS @font-face 拉取） | ⚠️ | 待逐页核 |
| A7 | Metadata API 统一（禁手写 `<head>`）；viewport 单独导出 | ⚠️ | layout 有 metadata，子页覆盖面待核 |
| A8 | 客户端 bundle 卫生：重交互组件 `next/dynamic`；死依赖清零 | ❌ | react-query+zustand 零引用在 dependencies（台账 #12） |
| A9 | 环境变量分层：客户端仅 `NEXT_PUBLIC_*`；server env 启动期 zod 校验 | ⚠️ | env 使用散见，无统一 env schema |
| A10 | 文案/i18n 单源（messages/ 或 view-model 定稿体系），禁组件内散落硬编码 | ⚠️ | view-model 已定稿；toast/页面散落中文双轨（审计在卷） |

## B. Node / NestJS+Fastify（apps/api）

| # | 规则 | 本仓状态 | 证据/违反点 |
|---|------|---------|------------|
| B1 | 优雅停机：SIGTERM 排空在途请求+worker loop 停止 | ✅ | worker main.ts:712 双 loop drain |
| B2 | 全局异常 filter + Error 子类统一（禁 throw 裸字符串） | ⚠️ | all-exceptions.filter 在；db 层仍混 throw 字符串（后端审计中） |
| B3 | 入参校验 zod pipe 全路由 | ✅ | platform/zod.pipe.ts |
| B4 | 速率限制/并发帽（含 SSE 每连接占池） | ✅ | rate-limit.service + sse slot 429 |
| B5 | 流式响应规范：hijack+心跳+deadline+并发帽四件套 | ✅ 2026-10-08 | SSE-PUSH 刀落 sse-pump.ts 单源（49535514·nail 5fad2bc6）四件套语义原值 |
| B6 | 长轮询禁令：PG 事件改 LISTEN/NOTIFY 推送，轮询仅兜底 ≥30s | ✅ 2026-10-08 | SSE-PUSH：健康态 notify 精确推送+30s 兜底（实测 4ms/18ms）·退化态 legacy 2s fail-open（49535514·生产 posture 落码） |
| B7 | DB：参数化查询零字符串拼接；池复用单例 | 审计中 | db 审计刀在飞 |
| B8 | 结构化日志（pino）替代 console.log（API 进程内） | ⚠️ | API 侧 console 待清理面审计 |
| B9 | 超时帽全覆盖（上游调用/DB/SSE） | ⚠️ | SSE 10min 帽有；上游模型调用超时面审计中 |
| B10 | 依赖卫生：零死依赖；锁定版本；禁未审计新依赖直入 | ❌ | A8 同源 |

## C. 通用工程

| # | 规则 |
|---|------|
| C1 | lint/format 门禁（eslint9+prettier，import-order+no-explicit-any warn 起步）——❌ 当前零配置（台账 #13） |
| C2 | tsc --noEmit 进 CI 含 e2e/ 目录——❌（BUG-E2E-FAILUNIMPORT 直接成因） |
| C3 | 测试助手收敛（harness.ts 工厂），禁 109 处重抄 |
| C4 | 命名：文件 kebab-case 全库统一；布尔谓语式 |
| C5 | 错误消息机读前缀码（`domain_reason`）全库一致 |

> 违反项全部已在 gap-bug-backlog 技术债台账或专项刀（SSE-PUSH/TOKSTREAM/DBID/DIR-1）治理中；本表为判据 SSOT，刀的 prove 须逐条对表勾销。
