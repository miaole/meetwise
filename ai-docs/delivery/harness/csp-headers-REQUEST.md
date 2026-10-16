# CSP-HEADERS REQUEST — api 面 CSP/安全头基线小刀（批表 #67 承接·web 面已由 AUTHZ-HARDEN 5A-2 闭环定谳·api /docs HTML 真空面 hash 钉 enforce 修法·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 续作收口 2026-10-14·落码面在树 b7626bab+续作并线 b1a97988+三门补行（neg:all 687/687·uc003 恰 1 run 绿·e2e 全量两门红形零漂移）+门 9 维持核（lint 12/12 五值恰等·typecheck 8/8·prove 12/12）全绿·§9-EXEC 续作收口记录七字段+全表落卷·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push） · 起草席原态=`draft:awaiting_pre_exec_dual`（2026-10-14 起草落卷·pre-exec 双审会签后协调方授权 EXEC·门 9 红停回炉 rev2 落卷 `b7626bab`·席1 复审 PASS agent_ae44650f 17 项全 PASS 后协调方授权续作收尾）

**席位**：CSP-HEADERS 起草席（meetwise 战役「CSP-HEADERS 内容安全策略小刀」诊断+起草席·批表 #67 b 类可直接立项承接）。
**基线**：`origin/feat/mysql-schema-skeleton` @ `0ff55592`（本席 fetch 后 REMOTE tip 亲证 `git rev-parse`=0ff55592c16b4d953b8a9197f35524ad41df4139·=派单下界恰等·cap 2184 sanction 卷在 tip）· 分支 `line/csp-headers`（本起草席 `git worktree add ../meetwise-csp -b line/csp-headers` 亲立·HEAD 落 `0ff55592` 亲证·建树净 tracked 零翻动）· 工作树 `meetwise-csp`（仓根同级）。注：主仓本地 HEAD 恒等 `0ff55592`（本波主仓=origin tip 同点）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（批表 #67=CSP 未落地·`grep -ri content-security-policy apps/api/src` 零命中亲证=真未做·web 面安全头基线）；②本席 §0 普查三项定谳（该 grep 对 **api 面**零命中成立亲证·对 **web 面**不成立——web 已由 AUTHZ-HARDEN 5A-2 #67 落地 nonce 形 enforce·漂移登记 §0.2）；③结构范本 `ai-docs/delivery/harness/secret-checker-nul-guard-REQUEST.md`（§0-§9 形制·STOP 三处制）+行为范本 `apps/web/test/authz5a2-csp.proof.ts`（源级断言+静态字面量禁入断言先例）+`apps/api/test/ha-2-drain.proof.ts`（export 钩子安装器+bare fastify inject+源断言先例）。

## §0 现状锚（起草席亲读亲证 @`0ff55592`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **43 树**（主仓+42 含本 csp 树）——无第二 csp 同名树；`git branch --list "line/csp-headers"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep -ci csp` 建前 **0 命中**→落卷后唯一同名卷=本卷。
- **在飞交叠复核**：全 `line/*` 分支对 `apps/api/src/main.ts` merge-base..tip 触面扫描——唯一命中=`line/godfn-1b-g7guard`（其 main.ts blob `c5806a12` 对本 base `a6c6819f` 系滞后向·触面=:1-50 G7 组合根域·与本刀触面 :101 插块/:155 接线/:222 路由行**三处全不相交**·冲突预期零）。并线序=先到先并·后并方改锚。
- **在飞重扫协议（EXEC 立项日必做）**：重跑本节全 `line/*` 扫描+§0.1 blob 对表·任一漂移→照 §8 现场漂移款停·重 pin 回炉。

### 0.1 blob 锚表（`git hash-object` 亲算 @`0ff55592`）

| 文件 | blob（8 hex） | 行数 | 本刀触面/引用锚 |
|---|---|---|---|
| `apps/api/src/main.ts` | `a6c6819f` | 266 | **修法主面（3 编辑）**。行图：`:101` createApiShutdownChain 收尾 `}`（**编辑1 插入锚=其后·`:103` 真 NestJS 注释行前**）·`:104` createApp·`:108` assertCriticalEnv·`:146-149` x-request-id 注释·`:150-154` onRequest x-request-id hook（**编辑2 插入锚=`:154` `});` 行后**）·`:155` 传输层封顶注释·`:164` 1MiB limit hook·`:180` preParsing 小体上限·`:202` onResponse metrics·`:213` enableCors·`:220` /openapi.json（cache-control）·`:221-227` /docs 路由（**编辑3 改 `:222` reply 行**·`:223-226` HTML 模板零字节）·`:238` drainGateHook（bootstrap 内） |
| `apps/api/package.json` | `910ff4f8` | 118 | **修法副面（编辑4 恰 1 行）**。`:7` lint 预算 1421·`:9` typecheck·`:49` `prove:env-schema` 行（**插入锚=其后**）·script loader 形=`node --import @swc-node/register/esm-register`（全卷先例形） |
| `apps/api/test/csp-headers.proof.ts` | —（新件） | — | **修法证明件（编辑5 全文随 §1 fenced）**·形制=ha-2-drain 先例（A() 计数器+exitCode 1+bare Fastify inject+源断言） |
| `apps/api/test/ha-2-drain.proof.ts` | `2a2f0828` | 317 | proof 形制模板锚+**邻面门**（`:14` import src/main·`:270` readFileSync src/main.ts 源断言——本刀插块须过其源断言面）·**零触** |
| `apps/web/middleware.ts` | `6c718b4e` | 123 | **web 面已闭环引用锚（零触）**·`:22-33` buildContentSecurityPolicy（nonce+strict-dynamic·dev 才 unsafe-eval 注记）·`:35-37` withCspHeader 响应头形唯一设置点·`:99-115` middleware 三出口（503/404/redirect/next）全携 CSP+x-nonce 请求头形·`:123` matcher 全量 |
| `apps/web/next.config.mjs` | `f44c9119` | 47 | **web 安全头引用锚（零触）**·`:31-45` headers()：X-Frame-Options DENY/X-Content-Type-Options nosniff/Referrer-Policy/HSTS/Permissions-Policy 五头在位+`:38-43` 注记亲证「CSP 不再在此静态设置（防双头交集）·现由 middleware 每请求 nonce 形」 |
| `apps/web/test/authz5a2-csp.proof.ts` | `221e1786` | 93 | web CSP 证明件引用锚（零触）——「放行/重定向/503/404 出口携 CSP」「next.config 静态零设置」断言在库=web 面闭环在证 |
| `apps/web/app/page.tsx` | `c1865b3f` | — | 自持内联脚本 nonce 接线引用锚（`:42-48` JSON-LD 读 x-nonce 显式接线·零触） |
| `scripts/i6-239-gates.proof.mjs` | `339f92f4` | — | markers 五类运行时组装口径源（`§2-7`·词面不入卷防自匹配）·**零触** |

**窗口期事实亲证**：`grep -ri content-security-policy apps/api/src` **EXIT=1 零命中**（批表行原 grep 亲证成立）·`grep -rni "content-security-policy|helmet" apps/api --include=*.ts --include=*.json` EXIT=0 零命中（helm 面零引入）·api 响应头设置点全图=main.ts `:56`（drain 503 connection: close）+`:152`（x-request-id）+`:220`（cache-control）**仅三处·零 CSP/XFO/nosniff**（读码定谳）·`ops/deploy/nginx.conf`+`docker/lb.nginx.conf` 安全头面仅 `X-HA-Upstream` 两处（零安全头·且生产链 nginx 无 api location）。

### 0.2 派单简报漂移登记（结论如实改锚·修法方向不变）

1. **简报「CSP 未落地=真未做」→ 定谳=半成立（面别切分）**：批表原 grep 范围=`apps/api/src`——**api 面零命中成立亲证**（§0.1）；**web 面不成立**——`grep -ri content-security-policy apps/web` 命中 middleware.ts 三形接线+证明件，web CSP 已由 AUTHZ-HARDEN 5A-2 #67 落地（nonce+strict-dynamic **enforce** 非 report-only·apps/web 全出口零豁免·next.config.mjs `:38-43` 注记亲证 CSP 从静态头刻意移除防双头交集）。批表行「web 面安全头基线」框定已过时：web 基线在位，真空白=**api 面**。行翻面权归协调方（本卷如实登记不翻行）。
2. **简报候选甲措辞「Next.js 面 nonce 或 'unsafe-inline' 权衡」→ 权衡面移至 api**：该权衡对 web 已 moot（已 nonce 化·style-src 'unsafe-inline' 已在且如实注记=仅样式面）。本刀权衡面=api /docs 单静态内联脚本：hash 钉 vs 'unsafe-inline' vs nonce（§1.3 定谳 hash）。
3. **简报「受影响面 e2e/e2e-ui 门零翻红」→ 门面具体化**：e2e 静态门三件（static-guards/parity/platform）+e2e-ui 活门 `uc003:i18n-locale-ui:prove`（sbg nail 闭环后绿基线）+e2e:isolated/e2e:ui:isolated 全量两门基线重 pin 协议（§2-7·g7SuiteGreen=false pin 零翻·红形零漂移判定）。
4. **diff 面双读数定谳**：起草 turn=恰 1 tracked（本卷 .md·本 commit 满足）；EXEC 码面=**恰 3 tracked**（main.ts 3 编辑+package.json 1 行+proof 新件）+本卷 .md（EXEC 仅 §9-EXEC append）=共 4 tracked。多任何 tracked 即停。

### 0.3 迁移号登记（预期零迁移）

主线链顶实测迁移链 **204** 头 `0204`（在册收据恒等）。本刀修法=纯响应头增量+证明件·**零迁移零 DDL 零 DB 面**。EXEC 期若实测产生迁移诉求→停（越界需要类）上报（§8）。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 危害机制（本席 @`0ff55592` 读码+grep 活证·命令与 EXIT 原值如实载）

- **A api 面真空（批表行亲证面）**：`grep -ri content-security-policy apps/api/src` EXIT=1；api 进程全部响应零 CSP/X-Frame-Options/X-Content-Type-Options/Strict-Transport-Security/Referrer-Policy/Permissions-Policy（§0.1 三处设置点全图·读码定谳）；helmet 类中间件零引入（apps/api 无依赖无引用）。
- **B /docs 真空面活证（唯一 HTML 面·三无）**：`main.ts:221-227` `/docs` 公开路由（createApp 即注册·**无鉴权门**）`text/html` 响应体=unpkg.com 外链 `swagger-ui-dist@5` css+bundle.js+**静态内联引导脚本** `SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger' });`——无 CSP/无 XFO/无 nosniff。任一注入面（swagger-ui-dist 供应链·unpkg 可用性/完整性·`@5` 浮动大版本）在零 CSP 下直达浏览器执行面；nosniff 缺位叠 `text/html` 显式声明=XSS 注入的常备温床形。**生产暴露面如实定性（不夸大不缩小）**：compose.prod api 宿主回环绑定 `127.0.0.1:8787`（loader synthetic-verify 用）·公网唯一入口=funnel→nginx:80→web:3000 不直暴 api（compose.prod.yml `:248-251` 注记亲证）——**非公网直暴面**；但 dev/本地/compose 私网位面（`api:8787` 为 web 与监控容器可达）全暴露·纵深缺口属实·且 api 零安全头为批表盘点席判定的基线缺口本体。
- **C web 面对照（已闭环·候选丙前提反证）**：web 三形接线=①响应头形（middleware 统一设·next.config 不再静态设防双头交集）②请求头形（请求头携 CSP→Next App Router 对 RSC flight/水合内联脚本自动补同一 nonce）③自持内联形（page.tsx JSON-LD 读 x-nonce 显式接线）——全出口（含 preview 503/404/redirect）零豁免+93 行证明件在库。「前端架构强依赖 inline 无 nonce 化路径·CSP enforce 必破」**反证不成立**（RSC 面自动补 nonce·JSON-LD 已接线·dev 才 unsafe-eval 生产零放宽·Tailwind 内联样式属 style 面已如实注记）。web 第三方资源域=零（`https://schema.org` 系 JSON-LD @context 词面·非资源加载）。
- **D nginx 面防线错位（候选乙′据）**：两 nginx conf 仅 `X-HA-Upstream` 零安全头；且生产链 nginx 仅 `location / → web_pool`（无 api location·api 不经 nginx）——nginx 层补 api 头**到不了** api 响应面。

### 1.2 归因链

- **环①（成因）**：api 先于 web 安全审计落地（CORS fail-closed/限流/信封等审计刀已收口），响应头基线面未列入彼时刀域——`/docs`（Swagger UI·CDN 免依赖注释 `:218`）按「开发便利面」引入，未按「浏览器执行面」对待。
- **环②（批表发现）**：批表盘点席以 `apps/api/src` 零命中grep 判定 #67 未做——对 api 面准确；对 web 面（同号 #67 已被 AUTHZ-HARDEN 5A-2 消费收口）系盘点口径未分面，本卷 §0.2 如实勘定。
- **环③（修法窗口）**：web 面先例形全在（nonce/hash 纪律·公开面零豁免·防双头交集·证明件形制）——api 面修法沿同族原则形最小增量；/docs 内联脚本为**静态模板单串**=hash 钉最优窗口（非每请求变异）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=api 面 enforce（hash 钉形）**：`/docs` 路由自设完整 CSP——`script-src 'self' https://unpkg.com 'sha256-W5Zk…'`（内联引导脚本 hash 钉·hash 常量本席 openssl+node 双器亲算恒等）+`style-src` unpkg+'unsafe-inline'（Swagger UI 运行时注入内联样式·**仅样式面·脚本面不回退**·web 面同款权衡如实登记）+img/font 白名单+frame-ancestors 'none'+object-src/base-uri 收口；全局 onSend 门=nosniff 恒设+CSP `frame-ancestors 'none'`（见头已设即让位路由级·防双头交集）；钩子源 503（preview/drain）与异常信封出口零豁免（onSend 生命周期位·web 全出口先例同形）。证明件 hash 自洽臂（源抽内联脚本现算 sha256 对常量）=HTML↔hash 漂移 fail-closed。
- **候选甲′（否决·Ban）=script-src 'unsafe-inline' 降级形**：内联脚本为静态单串·hash 零成本可得——降级形无谓放宽唯一脚本执行面，恰为本刀所补缺口的同族复发。Ban。
- **候选甲″（否决·Ban）=nonce 形（照搬 web）**：nonce 优势在每请求动态渲染面（SSR 模板内插）；/docs 系静态模板字符串——nonce 化需将静态串改动态内插=无谓复杂化+失去响应可缓存性，hash 静态更强。非对价。Ban。
- **候选乙（否决·Ban）=仅 report-only（观察期形）**：①api 全链**零 report 收集端点**（无 report-uri/report-to collector=死遥测·「观察期」无观察对象·假安全语义）；②唯一 HTML 面策略可计算性强（静态模板+hash 可证）·enforce 风险有限且被证明件+neg:all+邻面门覆盖——report-only 无承重对象。Ban。
- **候选乙′（否决·Ban）=nginx 层加头**：生产链 api 不经 nginx（无 api location·§1.1-D）——头到不了响应面；改 nginx 加 api location=生产拓扑变更越本刀域。Ban。
- **候选丙（否决·前提反证）=行勘误不修**：丙的前提「前端架构强依赖 inline 无 nonce 化路径·enforce 必破」被 §1.1-C 反证（web 已 nonce 化闭环·api /docs 内联可 hash 钉）。**丙的勘误部分成立**（批表行「web 面安全头基线」框定过时·§0.2-1 已登记）——勘误随卷移交协调方行翻面，修法部分照行（api 面真空白属实）。

## §1-修法（两文件定稿+一证明新件·预期恰 3 tracked 码面·零迁移·web 面零字节）

**修法总则**：①`apps/web/**` 零字节（web 闭环面零触·§3-1）；②main.ts 三编辑=新导出块（DOCS_CONTENT_SECURITY_POLICY 常量+installSecurityHeaderGate 钩子安装器）+createApp 内接线 1 行+/docs 路由 reply 链首加两头；③api 全部既有钩子/路由/CORS/metrics 语义零字节（纯增量·不 reflow 既有行）；④HTML 模板体（`:223-226` 五行）零字节（外链与内联脚本原文不动——hash 对模板现算·模板漂移由证明件 H4 臂 fail-closed）；⑤script-src 指令面 **'unsafe-inline' 字面量永不入**（甲′否决·证明件 H5a 静态断言承重）。

**定稿（EXEC 逐字节套用·fenced 块为唯一权威形）**——

编辑1·main.ts 新导出块（**rev2 拆分重钉**：原围栏首行 `import type { FastifyInstance } from 'fastify'` 行移出围栏——该行并入 main.ts 顶部 import 区（:1 附近·import/order 钉序 builtin→external→internal·public-preview :1 先例·落位=现树 external 组末尾 `@nestjs/platform-fastify` 行后）；导出块本体留 `:102` 后（去 import 行·插入锚=`:101` createApiShutdownChain 收尾 `}` 行后·真 NestJS 注释行前·整块含尾随空行））：
```ts
// ── #67-API CSP/安全头门（api 面零豁免·web 面 AUTHZ-HARDEN 5A-2 姊妹面）──────────
// web 面 CSP 已由 AUTHZ-HARDEN 5A-2 落地（apps/web/middleware.ts nonce 形 enforce·全出口零豁免）。
// 本刀补 api 面：/docs 是 api 进程唯一 HTML 面（unpkg 外链 script/css + 静态内联引导脚本）——
// CSP 用 hash 钉死内联脚本 + unpkg 白名单（script-src 零 'unsafe-inline'：无谓放宽·hash 零成本可得）；
// 其余 api 响应（JSON/SSE）无渲染执行面，全局仅 frame-ancestors 'none'（禁嵌入）+ nosniff（禁嗅探）。
// onSend 形=钩子源 503（preview 门/drain 门）与异常信封出口同样携带（公开面零豁免·web 全出口先例同形）；
// /docs 路由自设完整 CSP 先于 onSend——onSend 见头已设即不覆盖（防双头交集互相击穿·web next.config.mjs 先例同形）。
export const DOCS_CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' https://unpkg.com 'sha256-W5ZkT0lIItdqrqlONL7d8umuI3m3Tu/+GD1Sj5JOG9k='",
  "style-src 'self' https://unpkg.com 'unsafe-inline'",   // Swagger UI 运行时注入内联样式（仅样式面；脚本面不回退——web 面同款权衡）
  "img-src 'self' data:",
  "font-src https://unpkg.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
].join('; ');

/** 全局安全头门（onSend 统一出口·nosniff 恒设；CSP 见头已设即让位路由级策略）。 */
export function installSecurityHeaderGate(fastify: FastifyInstance): void {
  fastify.addHook('onSend', (_req, reply, _payload, done) => {
    reply.header('x-content-type-options', 'nosniff');
    if (reply.getHeader('content-security-policy') === undefined) {
      reply.header('content-security-policy', "frame-ancestors 'none'");
    }
    done();
  });
}

```

编辑2·main.ts createApp 内接线（插入锚=`:154` x-request-id hook 的 `});` 行后·`:155` 传输层封顶注释行前）：
```ts
  installSecurityHeaderGate(fastify);   // #67-API：全局安全头门（onSend·钩子源 503/异常信封出口零豁免；/docs 路由级 CSP 先设不让位）
```

编辑3·main.ts `:222` /docs 路由 reply 行（行首 `reply.type` 前插两头链·该行其余部分（text/html 与模板 send 全体）逐字节不动）：
```ts
    reply.header('content-security-policy', DOCS_CONTENT_SECURITY_POLICY).header('x-frame-options', 'DENY').type('text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Meetwise API</title>
```
（上行系 `:222`-`:223` 跨行模板的收眼前缀形——实际编辑=仅在 `:222` 行 `reply.` 前插 `reply.header('content-security-policy', DOCS_CONTENT_SECURITY_POLICY).header('x-frame-options', 'DENY').` 前缀·`:223-226` 模板体与 `:227` 收行零字节）

编辑4·apps/api/package.json（插入锚=`:49` `"prove:env-schema"` 行后·恰 1 行含行尾逗号）：
```json
  "prove:csp-headers": "node --import @swc-node/register/esm-register test/csp-headers.proof.ts",
```

编辑5·新件 `apps/api/test/csp-headers.proof.ts`（全文）：
```ts
/**
 * #67-API CSP/安全头门 prove（api 面零豁免·hash 自洽·源级接线断言·est live=0）。
 * 臂面：
 *   H1 GLOBAL-200    bare fastify+installSecurityHeaderGate：普通 200 出口 nosniff+frame-ancestors 在场；
 *   H2 HOOK-503      onRequest 钩子源 503（public-preview 门同形：async hook 内 await reply.code(503).send）
 *                    出口同样两头在场（零豁免直证·onSend 生命周期位承重）；
 *   H3 ROUTE-NOBUMP  路由级 CSP 先设→onSend 不覆盖（单 CSP 头·值恒等 DOCS_CONTENT_SECURITY_POLICY·防双头交集直证）
 *                    +全局 nosniff 仍在场；
 *   H4 HASH-SELF     main.ts 源 /docs 模板内联脚本现算 sha256-base64 恰等 DOCS_CONTENT_SECURITY_POLICY 内
 *                    hash 常量（HTML↔hash 漂移 fail-closed·模板体零字节纪律的执法点）；
 *   H5 STATIC        script-src 指令内联放行字面量禁入 + createApp 接线行在源 + /docs 路由接线在源。
 * 运行：pnpm -C apps/api prove:csp-headers · releaseEvidence=false · Not HA · actualSpendCny=null
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import { DOCS_CONTENT_SECURITY_POLICY, installSecurityHeaderGate } from '../src/main.ts';

let fail = 0;
let pass = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); c ? pass++ : fail++; };

const here = dirname(fileURLToPath(import.meta.url));   // apps/api/test
const apiRoot = join(here, '..');                        // apps/api

const GLOBAL_CSP = "frame-ancestors 'none'";

async function headerProof() {
  // H1 普通 200 出口
  const app1 = Fastify();
  installSecurityHeaderGate(app1);
  app1.get('/ping', async () => ({ ok: true }));
  const r1 = await app1.inject({ method: 'GET', url: '/ping' });
  A('H1a 200 出口 nosniff 在场', r1.headers['x-content-type-options'] === 'nosniff');
  A('H1b 200 出口 CSP=frame-ancestors none', r1.headers['content-security-policy'] === GLOBAL_CSP);
  // H2 钩子源 503（零豁免直证·钩形照抄 public-preview 门 async-hook-send 形）
  const app2 = Fastify();
  installSecurityHeaderGate(app2);
  app2.addHook('onRequest', async (_req, reply) => { await reply.code(503).send({ error: 'gate' }); });
  app2.get('/gated', async () => ({ ok: true }));
  const r2 = await app2.inject({ method: 'GET', url: '/gated' });
  A('H2a 钩子源 503 status', r2.statusCode === 503);
  A('H2b 钩子源 503 nosniff 在场（零豁免）', r2.headers['x-content-type-options'] === 'nosniff');
  A('H2c 钩子源 503 CSP 在场（零豁免）', r2.headers['content-security-policy'] === GLOBAL_CSP);
  // H3 路由级 CSP 先设→onSend 不覆盖
  const app3 = Fastify();
  installSecurityHeaderGate(app3);
  app3.get('/docs', (_req, reply) => { reply.header('content-security-policy', DOCS_CONTENT_SECURITY_POLICY).type('text/html').send('<html></html>'); });
  const r3 = await app3.inject({ method: 'GET', url: '/docs' });
  A('H3a /docs 单 CSP 头=路由级策略（onSend 不覆盖）', r3.headers['content-security-policy'] === DOCS_CONTENT_SECURITY_POLICY);
  A('H3b /docs nosniff 全局仍在场', r3.headers['x-content-type-options'] === 'nosniff');
  await app1.close(); await app2.close(); await app3.close();
}

function hashAndStaticProof() {
  const src = readFileSync(join(apiRoot, 'src/main.ts'), 'utf8');
  // H4 hash 自洽：抽 /docs 模板内联 script（非 src 引用形）现算 sha256-base64 对 DOCS_CSP 常量
  const inline = [...src.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  A('H4a /docs 模板恰 1 内联 script', inline.length === 1);
  const digest = createHash('sha256').update(inline[0] ?? '', 'utf8').digest('base64');
  A('H4b 内联脚本 sha256 恰等 DOCS_CSP hash 常量（漂移 fail-closed）', DOCS_CONTENT_SECURITY_POLICY.includes(`'sha256-${digest}'`));
  // H5 静态断言（词面运行时组装防自匹配）
  const scriptSrc = DOCS_CONTENT_SECURITY_POLICY.split(';').map((s) => s.trim()).find((s) => s.startsWith('script-src')) ?? '';
  A('H5a script-src 指令内联放行字面量禁入', scriptSrc.length > 0 && !scriptSrc.includes(['u', 'n', 's', 'a', 'f', 'e'].join('') + '-inline'));
  A('H5b createApp 接线行在源', /installSecurityHeaderGate\(fastify\)/.test(src));
  A('H5c /docs 路由接线在源', /reply\.header\('content-security-policy', DOCS_CONTENT_SECURITY_POLICY\)/.test(src));
}

async function main() {
  await headerProof();
  hashAndStaticProof();
  console.log(`\n===== csp-headers.proof(api) PASS=${pass} FAIL=${fail} =====`);
  if (fail > 0) process.exitCode = 1;
}

await main();
```

**行为恒等主张与验证法**：①api 产品行为唯一增量=响应头新增（JSON/SSE 消费面 fetch/EventSource 不读 CSP 渲染语义·nosniff 对 application/json 无行为变化·零既有断言面触）②既有钩子序零动（onSend 独立生命周期位·不插队 onRequest/preParsing 链）③web 面零字节（§3-1）④HTML 模板与 openapi 面逐字节恒等（编辑3 仅前缀·证明件 H4 执法）⑤`/openapi.json` 面仅获全局两头（nosniff+frame-ancestors）零策略冲突。

## §2 验收断言（pre-exec 双审核对单基面·数字口径以实跑实测为准·门序=起草卷既登基线）

1. **改前对照（程序化源级·零冲突销纪律）**：`git show 0ff55592:apps/api/src/main.ts` 对 `grep -ciE 'content-security-policy|x-content-type-options|x-frame-options'` = **0 命中**（改前真空直证·收据落卷）；改后工作树同 grep ≥3 命中（编辑1/2/3 三落点）。批表行原 grep（api/src CSP 零命中）改前 EXIT=1 亲证随收据复执。
2. **prove:csp-headers（新门·红绿自证）**：`pnpm -C apps/api prove:csp-headers` **EXIT=0 全臂 PASS**——H1/H2/H3/H4/H5 臂面全绿（§1 编辑5 fenced 臂面单）；对改前 blob 此门不可运行（导出面不存在）=红绿结构性自明·改前对照以门 1 程序化源级承。
3. **neg:all**：`pnpm neg:all` 隔离容器全绿·总臂 **687**（90/90/91/102/179/135 在册基线·**±2 熔断上报**·本刀零触测试/DB 面·api 面全量负电池=响应头增量零回归门）。
4. **邻面门**：`pnpm -C apps/api prove:ha2-drain` EXIT=0（import src/main+`:270` 源断言面·本刀插块须过）+`pnpm -C apps/api prove:env-schema` EXIT=0（SERVE_ARGS 直 spawn src/main.ts boot 面·本刀零破 boot）。
5. **e2e 静态门**：`pnpm e2e-static-guards:check`+`e2e-static-guards:prove`+`e2e-parity:check`+`e2e-parity:prove`+`e2e-platform:check` **全 EXIT=0**（受影响面静态零翻红）。
6. **e2e-ui 活门**：`pnpm uc003:i18n-locale-ui:prove` **EXIT=0 恰 1 run**（sbg nail 闭环后绿基线·零翻红·Ban retry-to-green）。
7. **e2e/e2e-ui 全量两门（基线重 pin 协议）**：`e2e:isolated`/`e2e:ui:isolated` 在册基线已陈（G7Y trio 2026-10-08 纪元·主线大幅前移）→EXEC 期**改前基线重取（各恰 1 run）→改后恰 1 run**·判定=**零翻红**（改前绿→改后须绿；改前红→红形零漂移：reviewLedger 行数与红点段不新增·同形红如实承登基线红非本刀翻红·g7SuiteGreen=false pin 零翻）·±1 翻红即停上报。若协调方裁定全量两门本刀豁免（改面=响应头增量·门 3-6 已覆盖）→豁免裁决随 EXEC 收据落卷·非本席预让。
8. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
9. **lint**：`pnpm turbo lint` 12/12 EXIT=0·五值恰等 web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（预算内·本刀新增码零警告增量为预期·任一越值即停）。
10. **docs:check ≤cap 2184**：起草改前基线 EXIT=0 **scanned 2165**（本席亲跑）→落卷后 2166 预期；EXEC 码面 +1（proof .ts 新受管件）→EXEC 期 2167 ≤ 2184 绿（cap 2184 sanction 已在祖 `0ff55592`=本 base）。
11. **markers 五类零命中**：本刀改动集（3 码面+本卷 .md）五类标记词+冲突标记对运行时组装词面 grep 零命中（i6-239 `§2-7` 口径·词面不复抄卷内防自匹配·命令与回执随 §9-EXEC 落卷）。
12. **diff 面机检**：`git diff --numstat <base>` EXEC 码面恰 **3 tracked**（main.ts 3 编辑+package.json 恰 1 行+proof 新件）+本卷 .md（EXEC 仅 §9-EXEC append·不洗 §0-§8）——多任何 tracked 路径即停（越界需要类）。**卫生**：est live=0（门 1-6/8-12 零模型外呼；门 7 全量两门若行使=隔离 compose·live 双计归 e2e 面预算随收据如实计·非本卷预估权）·0 Key 值·`.env*` ABSENT 双向记录·`actualSpendCny=null`。
13. **贴边注意（三条·EXEC 必读）**：①hash 常量 `W5ZkT0lIItdqrqlONL7d8umuI3m3Tu/+GD1Sj5JOG9k=` 系起草时对 `:226` 内联脚本字节亲算（openssl+node 双器恒等）——若并线携模板漂移·以证明件 H4 现算臂为准回炉重 pin（Ban 手改常量凑 H4）；②新建 worktree 无 node_modules——门 3/4/6/7/8/9 前须 `pnpm install --frozen-lockfile` EXIT=0（sbg EXEC 先例·lockfile 零改）；③typecheck 副产 `apps/web/tsconfig.tsbuildinfo` checkout 回滚（nul-guard 卷同款先例·不入交付面）。

## §3 范围外（边界清单·越界即 FAIL）

1. **web 面零触**：`apps/web/**` 零字节（middleware.ts/next.config.mjs/page.tsx/authz5a2-csp.proof.ts）——web CSP 基线已闭环（§1.1-C），本刀纯 api 面。
2. **unpkg `@5` 浮动大版本零触**：版本钉版/自托管/SRI=供应链刀候选（归协调方另裁·本卷不搭车）；CSP 白名单按 host 面（redirect 至同 host 版本化 URL 属放行域）。
3. **api 其余安全头零触**：HSTS/Referrer-Policy/Permissions-Policy on api（TLS/浏览器语境头·后继刀候选如实登记）；XFO 仅随 /docs 路由（web 基线同形）·全局不加（JSON 面无益·最小增量纪律）。
4. **CI 面零触**：ci.yml/run-e2e-isolated.mjs 注册面零字节（新证明件经 package.json script 手跑路径·门 2 承）——若协调方裁定 CI 面须挂→扩面另裁（§8）。
5. **nginx/拓扑零触**：两 conf+compose 族零字节（候选乙′否决随卷）。
6. **产品行为语义零触**：既有钩子链/CORS/metrics/信封/路由响应体（含 openapi）零字节（§1-修法总则③④⑤）。
7. **共享 SSOT 零改**：checklist/LEDGER/backlog/批表只读引用——行翻面权归协调方 nail；web 卷（AUTHZ-HARDEN 5A-2）零回改。

## §4 依赖

- **①web 面 AUTHZ-HARDEN 5A-2（已主线在祖）**：本卷 api 面承其两原则形（公开面零豁免/防双头交集）+证明件形制（§0.1 引用锚）·承接非搭车。
- **②cap 2184 sanction 已兑现**（`0ff55592` 在祖=本 base·本卷余量 19→落卷后 18→EXEC 期 17·零 sanction 诉求）。
- **③`line/godfn-1b-g7guard`（在飞·滞后向）**：§0.0 已定性三落点不相交·先到先并纪律覆盖。
- **④行翻面与 nail 排序归协调方**（含批表 #67 行「web 面安全头基线」框定勘误·§0.2-1 移交）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线（并线权归协调方 nail）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 触 web 面（§3-1 零字节）；Ban script-src 指令面内联放行字面量（甲′否决·证明件 H5a 承重）；Ban /docs nonce 化（甲″否决）；Ban report-only 降级（乙否决·死遥测）；Ban nginx/拓扑改（乙′否决）；Ban HTML 模板体改（§1-修法④·H4 臂执法）；Ban 触 CI/run-e2e-isolated 注册面（§3-4）；Ban 迁移 Ban DDL（§0.3）；Ban 触既有钩子/路由/CORS/metrics 语义（§1-修法③）；Ban retry-to-green（§2 门恰 run 纪律·门 7 红形零漂移判定）；Ban 改共享 SSOT/翻批表（行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因红靶外新红（邻面新红→如实登记升级）；Ban 造 .env*/写 Key 值；Ban 顺带升级依赖包（pnpm install --frozen-lockfile 恒等）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0 注记

- 起草 turn（本卷）：est live=**0**——零 prove 实跑（全部证据=git/grep/读码/openssl+node hash 双算/docs:check 与 markers 本地零外呼脚本·零模型外呼零 Key 加载零 secrets 零消耗·新建 worktree 未装 node_modules 零跑面）。
- EXEC 期：门 1-6/8-12 隔离容器或本地零模型外呼=est live=0；门 7 全量两门若行使=隔离 compose·live 双计归 e2e 面预算随收据如实计（非本卷预估权·豁免裁定则恒零）。

## §7 markers=0 + 起草自检登记（如实载）

- 本刀改动集（起草 turn=本卷 1 .md）**五类标记词+冲突标记对零命中**（起草席亲跑·i6-239 `§2-7` 运行时组装口径·词面不复抄卷内防自匹配·回执随 EXEC 收据留痕）。
- **起草自检登记**：①`node scripts/ai-docs/check-docs.mjs` 改前基线 EXIT=0 `scanned 2165`（本席亲证·≤cap 2184 余 19）·落卷后实测值随 commit 记（预期 2166）；②markers 五类亲跑零命中；③CSP hash 常量本席 openssl+node 双器亲算恒等（对 `:226` 内联脚本字节·§2-13①）；④批表原 grep（api/src CSP）EXIT=1 零命中亲证+web 面命中亲证（§0.2-1 双面勘定）；⑤在飞交叠全 `line/*` 扫描亲证（§0.0·唯一 main.ts 触面支线三落点不相交）；⑥blob 锚表七件 `git hash-object` 亲算（§0.1）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本卷不预 claim 任何 post-commit EXIT。**

**[EXEC 续作收口 2026-10-14 本处终态更替]** `executed:awaiting_post_prove_dual`（§9-EXEC 续作收口记录·起草期 STOP 语义历史承登不洗·post-prove 双审两独立外席待派）。 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1-修法五编辑定稿与 §5 Ban/pins 与 §1.3 淘汰结论**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞重扫必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/位点漂移（尤 `:101/:154/:222` 三插入锚与 `:226` 内联脚本字节）·或 web 面引用锚任一 blob 漂（middleware/next.config/proof）·或 §0.0 在飞重扫命中 main.ts 新增改写→停·重 pin 回炉。
- **机制不满足**：证明件任一臂 FAIL（零豁免臂不响/路由级让位臂失败/hash 自洽臂不齐/静态断言红）或门 1 改前对照翻非零→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿·Ban 手改 hash 常量凑 H4）。
- **越界需要**：修法诉求超出 3 码面（需触 web 面/CI 注册面/nginx/版本钉/迁移/既有钩子语义）→停·另刀或协调方裁决（§1.3 否决沿承）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 五值越/docs:check>cap/neg 臂数漂超熔断/门 7 翻红）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 rev re-fence 处置登记（rev re-fence 落卷席·本席亲证·2026-10-14·本节纯 append·§0-§8 其余原文零字洗）

**Rev 触发**：pre-exec 席1 探针 FAIL P0×1+P1×1（agent_fad42b7b @ `a3bddbd1`）——P0=编辑1 addHook 签名行内联对象型 `(…): void` 形在仓 typescript@6.0.3 下 tsc TS1005 语法错（函数型箭头与法/方法返回形混写）；P1=编辑5 `as any`×3+钩参 `: any`×4 共 7 处 no-explicit-any·eslint --stdin 实测 +7 越在册 lint 恰等线 1421（`--max-warnings 1421` 零余量）。**处置**：编辑1/编辑5 两 fenced 块整块 re-fence（§1-修法 内·唯一权威形随 re-fence 更新）·其余 §0-§8 原文零字洗·R2-R5 勘误以注记形落本节（原文不洗）。

- **R0（P0）编辑1 整块 re-fence**：签名行改 `fastify: FastifyInstance` 形·`import type { FastifyInstance } from 'fastify'` 随块首行入围栏——`apps/api/src/platform/public-preview.ts:1,75` 先例同形（:1 import type·:75 installPublicPreviewIngressGate 签名）；onSend 钩参改推断零注记形（`(_req, reply, _payload, done)`·先例 `async (request, reply) =>` 同形）——块内 `any` 词面清零（原签名行 `(...args: any[])`+回调 4 any 随 re-fence 消）。落点=§1-修法 编辑1 fenced 块。
- **R1（P1）编辑5 整块 re-fence 去 any 化**：bare `Fastify()` 返回值对 `FastifyInstance` 形参天然型容——`as any`×3 删；onRequest/get 钩参可推断——`: any`×4 删（合计 7·恰等席1 +7 实测）。§2-9「本刀新增码零警告增量为预期」句保持原文（去 any 后应零增量·EXEC 期门 9 实测核）。落点=§1-修法 编辑5 fenced 块。
- **R2 勘误（SSE 面）**：§1-修法 行为恒等主张①补边界——SSE 面 `hijack()` 出口不达 onSend 生命周期位（hijack 绕过生命周期·两头随之不至）=security-inert（无渲染执行面·嵌入/嗅探防护不因之受挫·如实登记不夸大）；该增量归 **sse-pump writeHead 后继刀**（§3-6 产品行为语义零触界之后继刀候选·本刀不搭车）。
- **R3 勘误（行锚+限定）**：§0.1 apps/web/middleware.ts 行锚勘误——buildContentSecurityPolicy 实际 `:15-27`（原记 :22-33）·withCspHeader 实际 `:30-33`（原记 :35-37）·middleware 三出口面实际 `:99-119`（原记 :99-115）·matcher `:123` 不变；§0.1 窗口期事实亲证「api 响应头设置点全图…仅三处」**限定 main.ts 面**（读码定谳范围措辞）——api 更宽面另有 content-type 设置点一处（`apps/api/src/modules/interview/interview.controller.ts:197` report 导出面）不在三处之列；零 CSP/XFO/nosniff 结论不变。
- **R4 勘误（措辞收紧）**：§0.0「唯一命中=`line/godfn-1b-g7guard`」收紧为「唯一命中系本席扫描时点（local `line/*` 范围）读数」——origin 远端 `line/obs-logging`（merge-base `b429aebb`·main.ts +25/−6·hunks :35-57）与 `line/obs-envschema`（merge-base `6aa83c48`·main.ts +6/−0·hunks :9-34）系**滞后向**分叉（两 merge-base 均为 HEAD 祖先·本席 `git merge-base --is-ancestor` 亲证）·亦触 `apps/api/src/main.ts` 路径面——但与本刀三落点 `:101/:154/:222` 全不相交·先到先并/后并方改锚纪律覆盖·非风险面。
- **R5 勘误（hash 脆弱性精化）**：§2-13① 精化——unpkg 升级（`@5` 浮动大版本/外链资源漂移）**不使**内联 hash 失配（hash 钉的是 /docs HTML 模板内静态内联引导脚本·与 unpkg 外链内容无涉·模板面漂移由 H4 现算臂 fail-closed 执法）；真风险三件=a) 子资源白名单 host 面（unpkg.com 整域放行·覆盖面大于所需）+b) 外链零 SRI（integrity 缺位·子资源篡改仅由 CSP host 面收口）+c) 运行期 fail-closed 降解——模板漂移若现算臂红则内联脚本被阻断 → `/docs` 降解为空壳（安全侧 fail-closed 成立·可用性侧回归如实登记）。

**rev 验证闭环（本席亲跑 @ re-fence 后工作面·命令与 EXIT 随 §9-EXEC 收据复执）**：①tsc 探针复跑——编辑1 块（含 import 行）在仓 tsconfig（apps/api 继承 strict/noUncheckedIndexedAccess/bundler 解析）下编译零错；席1 TS1005 场景复演=旧签名形实测红（TS1005 复现）→ re-fence 形实测绿（PASS 翻转）；编辑5 去 any 调用面（bare Fastify+installSecurityHeaderGate+addHook/get 推断钩参）对 re-fence 签名联合编译零错；②eslint 面抽查——编辑5 re-fence 全文 no-explicit-any 新增=0（旧形 +7 复演对账·与席1 实测恰等）；③node --check 探针 harness 产物零错（TS 块面以 tsc 为准·node --check 不适 TS 语法）；④docs:check 复跑 EXIT=0 ≤cap 2184；⑤markers 五类+冲突标记对本改动集零命中（i6-239 `§2-7` 运行时组装口径·词面不入卷防自匹配）。

**STOP 不变**：仍 **`draft:awaiting_pre_exec_dual`**——re-fence 后席1 复审确认（覆盖其 P0×1+P1×1 FAIL）方会签；§8 三条款·alone≠dual·Ban self-approve 沿承不翻。

**[EXEC 续作收口 2026-10-14 本处终态更替]** `executed:awaiting_post_prove_dual`（§9-EXEC 续作收口记录·rev1 历史原态承登不洗）。

**rev2 处置登记（EXEC 门 9 红停回炉·落卷席亲证·2026-10-14·沿本节 append 形制·§0-§8 除 §1-修法 编辑1 围栏唯一权威形随重钉外原文零字洗）**：

- **R6 触发与根因（门 9 红·第一手复演）**：EXEC 落码面（3 码面在树未提交）门 9 lint 红——api 面 **1422 warnings > 恰等线 1421**（`eslint . --max-warnings 1421` EXIT=1·本席复演亲证）；违例行唯一定谳=`apps/api/src/main.ts:102:1  warning  "fastify" type import should occur before import of "@meetwise/ai-runtime" · import/order`（恰 +1·余 1421 面零漂）。根因=编辑1 rev1 形把 `import type { FastifyInstance } from 'fastify'` 随块首行落 `:102`（居于全部 import 组之后）——import/order（`packages/config/eslint.config.base.mjs:74` 'warn' 级·groups=builtin→external→internal·pathGroups `@meetwise/**`→internal position after）判定 external 组 import 违规后置=+1 warn 越恰等线（`--max-warnings 1421` 零余量即红）。
- **R7 rev2 处置（协调方裁决出路 (a)·import 顶置）**：§1-修法 编辑1 围栏拆分重钉=import 行移出围栏——该行并入 main.ts 顶部 import 区（**external 组末尾 `@nestjs/platform-fastify` 行后·落位现树 `:8`**·import/order 钉序 builtin→external→internal·`public-preview.ts:1` 顶置先例同法）；导出块本体留插入锚 `:101` 后（去 import 行·块体 `:103` 起）；落码面同形修正（原 `:102` import 行移 `:8`·其余落码面零字节）。落位合规机理=import/order 规则指示语「fastify type import should occur before import of @meetwise/ai-runtime」与顶置落位逐字对表恰合（内联围栏致落位偏离·re-fence 块内重排不救——re-fence 收块内只会把偏离随块钉死）。
- **R8 教训注记（验证闭环面缺口）**：席1 re-fence 验证闭环（本节 rev1 ①-⑤）以 tsc 编译+eslint 词面抽查为域——**tsc 编译零错≠eslint 排序面零警**：import/order 系 lint 面规则非 type 面·且落位面（import 行在文件内位置）不在「块内语法/any 词面」抽查域内。**验证闭环须覆盖落位面**：围栏首行含 import 时落位随块钉死·块体行号锚（:101 后）不约束词法位——rev2 后围栏本体零 import 行=该类漂移结构关闭。
- **R9 rev2 验证闭环（本席亲跑 @ rev2 后工作面·命令与 EXIT 随 §9-EXEC 收据复执）**：①门 9 复跑——`pnpm turbo lint --force` EXIT=0 **12/12**·api 恰等双证=`--max-warnings 1421` EXIT=0（✖ 1421 problems 0 errors）+`--max-warnings 1420` EXIT=1 **恰等 1421**·root 恰等双证=`--max-warnings 5235` EXIT=0（✖ 5235 problems 0 errors）+`--max-warnings 5234` EXIT=1 **恰等 5235**（红 1422→绿 1421 恰 −1·五值零增量）；②typecheck `pnpm turbo typecheck --force` EXIT=0 **8/8**；③`pnpm -C apps/api prove:csp-headers` EXIT=0 **PASS=12 FAIL=0 维持**（H1a-H5c 全臂）；④node --check harness 产物零错（`scripts/ai-docs/check-docs.mjs`+`scripts/i6-239-gates.proof.mjs`·TS 块面以 tsc 为准沿 rev1 ③ 口径）；⑤markers 五类+冲突标记对改动集运行时组装词面零命中 EXIT=0（i6-239 `§2-7` 口径·3 码面+本卷 .md 全在改动集扫域）；⑥docs:check EXIT=0 **scanned 2171 ≤ cap 2184**（对起草预期 2167 +4=EXEC 序1 merge `d28b1a2e` 并线卷入受管件·cap 内绿如实登记）；⑦typecheck 副产 `apps/web/tsconfig.tsbuildinfo` checkout 回滚（§2-13③·不入交付面）。
- **R10 窗沿与落卷形态**：§8-③「EXEC 立项不得改 §1-修法五编辑定稿（改则回炉重审）」——本 rev2 系**回炉窗沿合法修订**（双审已签后 EXEC 红停回炉=rev2 窗·协调方裁决出路 (a) 随卷登记·gpr R1-a amend 先例形沿派单引）；落卷基线=`line/csp-headers` @ `d28b1a2e`（EXEC 序1 merge 后 tip·派单引 `7f08f03d` 在史为其亲·本席 `git merge-base --is-ancestor` 亲证）；分支未 push 亲证（无 upstream·`git branch -r --contains HEAD` 空·`git ls-remote --heads origin line/csp-headers` 零命中）→落卷=**新 commit**（3 码面+本卷 .md 恰 4 tracked·amend 不适用=码面 rev2 前未成 commit·无史可洗）。

**STOP 不变（rev2 后重申）**：仍 **`draft:awaiting_pre_exec_dual`**——rev2 落卷后席1 复审确认（覆盖门 9 红根因 R6）方会签→EXEC 重授权；§8 三条款·alone≠dual·Ban self-approve 沿承不翻。

**[EXEC 续作收口 2026-10-14 本处终态更替]** `executed:awaiting_post_prove_dual`（rev2 复审 PASS agent_ae44650f「17 项全 PASS·rev2 确认·可授权 EXEC·实为续作核验收口」·协调方授权续作收尾·三门补行+门 9 维持核全绿·§9-EXEC 续作收口记录七字段+全表落卷·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve）。

### §9-EXEC 续作收口记录（2026-10-14·EXEC 续作核验收口席·协调方授权续作·本节纯 append·§0-§8 原文零字洗·STOP 五处同步更替见各处注记）

**① 并线（续作序1）**：`git fetch`+`git merge --no-ff origin/feat/mysql-schema-skeleton`·届时 tip=`281ae14a`（submit-flow-competency-wire nail·≥archive-expand 波下界 `5b53dd41`=gitleaks nail·`merge-base --is-ancestor` 亲证）·merge-tree 预演 EXIT=0 零冲突零 union-解需·merge=**`b1a97988`**（ort 零冲突 8 files +536/−16·merge-base=`d28b1a2e`·对 pnpm-lock.yaml/package.json 零 delta 零重装需·禁 pull --rebase 遵守）。落码面（b7626bab 三码面）对并线 worker 文件零 hunk 交叠·merge 后 `prove:csp-headers` 12/12 即绿（H4 hash 自洽臂=模板零漂亲证）。

**② 门 3 补行**：`pnpm neg:all` **EXIT=0 687/687**（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135·恰等在册基线零漂·±2 熔断未触·隔离容器·FAIL=0）。

**③ 门 6 补行（协调方特授权 LIVE·source secrets 同 shell）**：`pnpm uc003:i18n-locale-ui:prove` **EXIT=0 恰 1 run**（1 passed 2.4s·chromium 单项目·E2E_UI_SKIP_WORKER=1·零 retry）·sbg nail 后绿基线零翻红（门⑥主线三度 1 passed 先例恒等）·模型消耗面=DOM/locale 断言面**零模型外呼实证**（无 G7 cost ledger 行·SKIP_WORKER=1 零图执行）→本门 est live 消耗=0·actualSpendCny=null 维持。偏离登记：首启误形（E2E_UI_GREP/E2E_UI_PROJECT/E2E_UI_SKIP_WORKER 三 env 欠贴=全量 e2e:ui 形）容器 boot 秒级中止·**零测试执行**·自清容器归零·不计 run·不触 Ban retry-to-green（非红重试·系误形中止）。

**④ 门 7 补行（全量两门改前/改后基线重 pin 协议）**：改前=merge 树 `b1a97988` 临时 checkout `d28b1a2e` 三码面（main.ts/package.json checkout+proof 移出·porcelain 3 行预置态）→`e2e:isolated`+`e2e:ui:isolated` 各恰 1 run；改后=码面归位（porcelain 0 行·main.ts 对 HEAD byte-diff 恒等亲证）各恰 1 run。判定=**红形零漂移全兑现**：
- `e2e:isolated` 改前红→改后红**同形**（收据 `2026-10-16T04-35-59`/`2026-10-16T05-11-47` 双件在 `.tmp/e2e-receipts/`）：failureClass=api·reviewLedger 恰 2 行（image_ocr_unavailable+voice_unavailable）改后零新增·durMs 433857/433726 同形·migration manifest 双侧 204 头 0204 恒等→**基线红承登非本刀翻红**（§2-7 判定式）；
- `e2e:ui:isolated` 改前红→改后红**同形**：class=frontend client_exited·红点段=`recruiting-bound.spec.ts:222`「C→B」双项目（chromium+mobile·各 6.8m·`:302` toHaveText EARLY_STOP_COPY）·✘ 行 byte-diff EXIT=0 恒等·双侧 2 failed/10 skipped/18 passed 恒等→基线红承登；
- **g7SuiteGreen=false pin：false→false 零翻**。
- 偏离登记：改前 `e2e:isolated` 首启 5.8s 前置中止（`live_provider_key_missing` 快速失败·零测试执行·收据 `2026-10-16T04-26-12` 在档）——门 7 系 §2-7/§6 明载 live 面（live 双计归 e2e 面预算·非本卷预估权）·补键后续行·非红重试。

**⑤ 门 9 维持核（rev2 后）**：`pnpm turbo lint --force` **EXIT=0 12/12 维持**·恰等双证三件=api `--max-warnings 1421` EXIT=0（✖ 1421 problems 0 errors）/`1420` EXIT=1·root `5235` EXIT=0（✖ 5235 problems 0 errors）/`5234` EXIT=1·web `601` EXIT=0（✖ 601 problems 0 errors）/`600` EXIT=1·worker 954/ai-runtime 628/contracts 265/domain 115/ai-graphs 47/qdrant-store 27/db 1042 全表恒等（0 errors）·`turbo typecheck --force` **EXIT=0 8/8**·`prove:csp-headers` **PASS=12 FAIL=0 维持**·tsbuildinfo 副产 checkout 回滚（§2-13③）。
- **P2 注记（.next lint 域污染·纪律内整理·非码面红）**：门 6/7 UI 门 runner「无 .next/BUILD_ID 先 next build」副产 `apps/web/.next`（441MB·gitignored）滞留工作面→首轮 `lint --force` web 2913>601+root 双红（base eslint config 零 .next ignore 面·rev2 树无该副产故 R9 未遇）——副产移除后复跑 12/12 五值恰等全恢复=**构建副产非码面警告·码面零警告增量兑现**；runner 行为面 Ban 触（§3-4）不动·注记供后继 UI 门刀知悉（UI 门后须清 .next 方可核 lint）。

**⑥ P2 i6-239 口径限定注记（沿席1 确认席建议落卷）**：`scripts/i6-239-gates.proof.mjs`「改动集恰符(实际触面⊆申报清单)」臂系 i6-239 该刀历史申报清单（波次绑定静态清单）专属口径——后继刀（含本刀）改动集路径不在清单→该臂红=**协议形非 markers 门实质红**（先例 `8b577e8b`/`dd8f58a6`「申报清单系 i6-239 刀专属静态清单口径外」同形承登）；markers 实质门=「markers=0 五类标记词零命中」·本刀改动集（本卷 .md）运行时组装直扫零命中维持（词面运行时组装·i6-239 §2-7 口径·i6-gates:prove 恰符臂 1 红如实登记=协议形）。本注记沿 rev2 确认席（agent_ae44650f）建议落卷·行翻面权归协调方。

**⑦ 全表+卫生+偏离+STOP**：

| # | 门 | 终值（本树亲证·续作席亲跑） | 判定 |
|---|---|---|---|
| 1 | 改前对照（程序化源级） | `git show 0ff55592:apps/api/src/main.ts` 三头 grep=**0**；改后工作树=**4**（≥3）·api/src CSP grep 改前 EXIT=1→改后 3 行 | 绿 |
| 2 | prove:csp-headers | EXIT=0 **PASS=12 FAIL=0**（H1a-H5c 全臂·merge 后维持） | 绿 |
| 3 | neg:all | EXIT=0 **687/687**（90/90/91/102/179/135·续作补行） | 绿 |
| 4 | 邻面 ha2-drain+env-schema | **47/47**+**22/22** 双 EXIT=0（env-schema 经隔离壳 `env-schema:prove:raw`·22 断言含 E 面 boot=/readyz 200） | 绿 |
| 5 | e2e 静态门五件 | static-guards check/prove+parity check/prove+platform check 五 **EXIT=0** | 绿 |
| 6 | uc003 UI 活门 | EXIT=0 **恰 1 run 1 passed 2.4s**（LIVE 特授权·零 retry·续作补行） | 绿 |
| 7 | e2e 全量两门 | 改前/改后各恰 1 run×2 门·**红形零漂移**（api/frontend 双门同形）·g7SuiteGreen=false 零翻（续作补行） | 绿（基线红承登） |
| 8 | typecheck | turbo --force **8/8** EXIT=0 | 绿 |
| 9 | lint | turbo --force **12/12** EXIT=0·五值恰等 601/5235/1421/954/628 恰等双证兑现 | 绿 |
| 10 | docs:check | EXIT=0 **2173≤cap 2184**（2171+并线 2 受管件·余 11） | 绿 |
| 11 | markers 五类 | 改动集（本卷 .md）运行时组装直扫**零命中**（落卷前复执随本 commit） | 绿 |
| 12 | diff 面机检+卫生 | 本 commit **恰 1 tracked .md**·.env* ABSENT 双向·零 lockfile 改·actualSpendCny=null | 绿 |
| 13 | 贴边三注意 | hash 常量未手改（H4 现算臂恒等执法）·--frozen-lockfile 零重装需（merge 零 lockfile delta）·tsbuildinfo 回滚 | 绿 |

est live/卫生：门 6 零模型消耗实证；门 7 四 run（isolated×2+ui×2）真模型链消耗归 e2e 面预算随收据如实计（收据 4 件在 `.tmp/e2e-receipts/`·每 run CNY 未单项计价如实登记·actualSpendCny=null 卷面口径不预 claim）·Key 值零落卷零落日志·隔离容器自清残留 0。diff 面机检：本 commit 恰 1 tracked .md=本卷（§9 append+STOP 五处更替注记·§0-§8 原文零字节）。偏离总账三项（③门 6 首启误形中止/④门 7 改前首启 key-missing 前置中止/⑤.next 域污染整理·皆纪律内零码面越界零史洗）。

**STOP=`executed:awaiting_post_prove_dual`**（五处同步更替：Status/trailer token 翻面+§8/rev1 重申/rev2 重申三处终态更替注记·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve·⛔push ⛔force push 未用·⛔pull --rebase 未用）。

### §9-补 post 双审 P2 勘误随卷注记（2026-10-16 nail 席·post 双审会签 PASS 授权（席1 agent_96ba8643+席2 agent_cb2d691b）·append 注记形·§0-§9 上文零字节洗改·原文沿 append-only 不动·operative 以本节为准）

- **P2-1（席1）§9-① merge-base 勘记**：原文「merge-base=`d28b1a2e`」系误记——`d28b1a2e` 实为并线前 `line/csp-headers` 侧祖（EXEC 序1 merge tip·经 `b7626bab` rev2 为 `b1a97988` 双 parent 之一）·真 merge-base=`git merge-base b7626bab 281ae14a`=`7e8ada73`（=dcw nail·nail 席亲证·对 `d28b1a2e` 侧 `git merge-base d28b1a2e 281ae14a` 同值恒等双路）。该误记对并线判定面零影响（merge 本体 EXIT=0 零冲突事实不变·`merge-base --is-ancestor` 下界亲证不受传染）。
- **P2-2（席1+席2）§9-⑦ 收据计数勘记**：原文「收据 4 件在 `.tmp/e2e-receipts/`」系误记——真实收据=**3 件**（`2026-10-16T04-35-59` isolated 改前+`2026-10-16T05-11-47` isolated 改后+`2026-10-16T04-26-12` 前置中止·nail 席 `ls .tmp/e2e-receipts/` 亲证恰 3 件零余）；`e2e:ui`/`e2e:ui:isolated` 两 run 系 `scripts/run-e2e-isolated.mjs:3150` `if (target === 'e2e:prove')` 分支护栏机制**必然无收据通道**（`writeLocalE2EReceipt` 仅 e2e:prove 臂进入·e2e:ui 形恒不写收据）→ui 门红形恒等证据=✘ 行 byte-diff EXIT=0 恒等对照 **transcript-only**（非收据件·§9-④ ui 段证据面口径以本注记为准）。该误记对门 7 判定面零影响（红形零漂移/恰 1 run/基线红承登三判定均不依赖收据件数）。

---

*CSP-HEADERS REQUEST · 2026-10-14 起草 · **`executed:awaiting_post_prove_dual`**（EXEC 续作收口 2026-10-14 更替·起草原态 `draft:awaiting_pre_exec_dual`·落卷=§9-EXEC 续作收口记录） · base `origin/feat/mysql-schema-skeleton` @`0ff55592`（REMOTE tip 恰等派单下界·cap 2184 sanction 在祖）· 分支 `line/csp-headers` · 工作树 `meetwise-csp`（本起草席立·建前 branch+worktree+harness 卷名三查不存在）· 立项出处=协调方派单 brief（批表 #67 CSP 未落地·api 面 grep 零命中亲证）· **普查三项定谳**：a) 现有安全头面=web 已闭环（middleware nonce+strict-dynamic enforce 全出口零豁免+next.config 五头+93 行证明件·CSP 从静态头刻意移除防双头交集）·api 全裸（三处响应头设置点零 CSP/XFO/nosniff·helmet 零引入）·nginx 仅 X-HA-Upstream 且生产链无 api location；b) web 资源面=RSC flight 请求头形自动补 nonce+JSON-LD x-nonce 显式接线+Tailwind style 面 'unsafe-inline' 已注记·第三方资源域零——「inline 无 nonce 化路径 enforce 必破」反证不成立；c) api 响应头设置点=main.ts `:152` x-request-id/`:220` cache-control/`:56` drain connection 三处·`/docs` 公开路由（`:221-227`·无鉴权门）=unpkg 外链+静态内联脚本三无真空面（生产回环绑定非公网直暴·dev/私网位面暴露·纵深缺口属实·如实定性）· **方案定谳=候选甲（api 面 hash 钉 enforce）**：/docs 完整 CSP（script-src 'self'+unpkg+'sha256-W5ZkT0lIItdqrqlONL7d8umuI3m3Tu/+GD1Sj5JOG9k='·hash 双器亲算·style 面 unpkg+'unsafe-inline' 仅样式面如实登记·frame-ancestors/object-src/base-uri 收口）+全局 onSend 门（nosniff 恒设+CSP frame-ancestors 让位路由级防双头交集·钩子源 503/异常信封零豁免）·候选否决=甲′script 内联放行字面量（无谓放宽）/甲″nonce 化（静态模板非对价）/乙 report-only（零收集端点=死遥测）/乙′nginx（api 不经 nginx 到不了）/丙（前提反证·勘误部分随卷移交）· **修法五编辑**：main.ts 新导出块（DOCS_CONTENT_SECURITY_POLICY+installSecurityHeaderGate）+createApp 接线 1 行+/docs reply 链首两头+package.json `prove:csp-headers` 1 行+证明新件 csp-headers.proof.ts（H1 全局 200/H2 钩子源 503 零豁免/H3 路由级不让位防双头交集/H4 hash 自洽 fail-closed/H5 静态断言含内联放行字面量禁入·词面组装防自匹配）· 恰 3 tracked 码面+本卷 .md·web 面零字节·零迁移（链 204 头 0204）· **门矩阵十三条**（改前对照程序化源级/prove:csp-headers 红绿自证/neg:all 687±2/邻面 ha2-drain+env-schema/e2e 静态门五件/uc003 UI 活门恰 1 run/e2e 全量两门基线重 pin 协议红形零漂移/typecheck 8/8/lint 五值恰等 601-5235-1421-954-628/docs:check 2165→2167≤cap 2184/markers 五类/diff 面机检+卫生）· 漂移登记四项（api/web 面别切分/权衡面移 api/门面具体化/diff 双读数 1+3）· est live=0 · markers=0 · pins 十一值照抄 · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP · pre-exec 双审两独立外席待派 · ⛔push ⛔merge 主线 ⛔force push 未用*
