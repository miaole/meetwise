---
name: meetwise-nextjs
description: Meetwise Next.js(web)App Router 规范——RSC 服务端取数、Server Actions、cookie 鉴权、错误/加载边界、SEO、多端响应式、无死胡同。生成/重构 web 页面时遵循。
---

# Meetwise Next.js 规范(web · App Router)

> 由专家审计沉淀。**真用 App Router 的服务端能力,不要 SPA-in-App-Router。**

## 页面默认 = async Server Component(RSC)
- 数据页是 `export default async function XPage()`,**无 `'use client'`**,服务端取数、HTML 服务端渲染。
- 取数用 `lib/api/server.ts`:`getServerToken()` / `serverGet<T>(path)` / `serverFetch(path,init)`(读 httpOnly cookie + Bearer 调 api)。
- 鉴权门:`if (!(await getServerToken())) redirect('/login')`(配合 `middleware.ts` 路由级拦截)。
- **并发取数用 `Promise.all`**,别串行 await(审计 #10 waterfall)。
- 动态路由 Next 15:RSC 里 `const { id } = await params`;client 组件里 `use(params)`。

## 变更 = Server Action('use server')
- 放 `app/<route>/actions.ts`,用 `serverFetch` 调 api;变更后 `revalidatePath(path)` 刷 RSC。
- 带参用 `action.bind(null, id)`。表单 `<form action={theAction}>`。
- **必须查 `res.ok` 再用 body**——否则 `{interviewId}=undefined` → 跳 `/interview/undefined`(审计 #5)。失败回错误态(可配 `useActionState`),不盲跳。

## 'use client' 只给真交互
- SSE 流、需本地状态的表单/弹窗。**但 client 组件不能读 httpOnly cookie、跨源 fetch 带不了令牌**——所以:
  - 面试 SSE/答题:由 RSC 读 cookie → 发短时 stream 票据/签名 URL 给 client,或 Next route handler 同源代理(`credentials:'include'`)。**绝不硬编码 `x-user-id:'demo'`**(审计 P0 #1:那是未鉴权 + 错身份)。
  - 答题走已建的 `lib/api/client.ts`(zod 双校验 + **强制 Idempotency-Key**),别裸 fetch `/turn`(审计 #2)。

## 401 / 会话过期(审计 #3)
- `serverFetch`/`serverGet` 遇 401 → 清 cookie + `redirect('/login')`,别把过期当"暂不可用"死胡同。cookie maxAge 对齐令牌 TTL。

## 错误/加载/404 边界(审计 #6,无死胡同铁律)
- 至少 `app/error.tsx`(根)+ `app/not-found.tsx`;流式路由配 `loading.tsx`。任何 RSC/Action 抛错都有出路,不落 Next 默认错误页。

## SEO
- root `layout.tsx`:metadataBase、title 模板、description、openGraph、twitter、robots;`sitemap.ts` + `robots.ts`。
- **每个公开页都要 `export const metadata`(title+description+canonical+OG)**——features 等别漏(审计 #8)。
- 营销页加 JSON-LD(首页 Organization/WebSite/SoftwareApplication;FAQ 用 `FAQPage`)。备 OG 图。

## 多端响应式(PC + H5)
- 用 `app/globals.css` 的 `.container`/`.card`/`.table-wrap` 体系,**别每页再塞 `maxWidth/padding/fontFamily` 内联壳**(双重 padding、宽度不一,审计 #7)。
- 表格一律 `<div className="table-wrap"><table>`(admin 表移动端溢出,审计 #7)。
- viewport 已配;输入 16px 防 iOS 缩放;触控 ≥42px;允许放大(a11y)。

## 性能
- 公共近静态数据(products/legal/features)用 `next:{revalidate:N}`(ISR/CDN 友好),别一律 `no-store`(审计 #9)。用户态数据才 `no-store`。
- 站内跳转用 `next/link`(prefetch),别裸 `<a>`(审计 #11)。`next/font` 优化字体;有图用 `next/image`。

## 反模式(审计实发,别犯)
SPA-in-App-Router(全 'use client' 客户端 fetch)· 硬编码 `x-user-id:'demo'` 未鉴权(P0)· 契约客户端不接裸 fetch 无幂等键(P0)· 死代码 `lib/api/session.ts`(localStorage 令牌,删)· Server Action 不查 ok 盲跳 · 无 error/not-found 边界 · 每页内联样式壳绕过响应式 · 串行 await。
