# TSCGATE-2 e2e tsc 修复四批+门禁点亮刀 — EXEC 收据（mw-core）

```yaml
knife: TSCGATE-2（e2e tsc 修复四批 B2/B3/B4+门禁点亮·C1/C2 落地·零逻辑变更）
seat: mw-core（EXEC）
blueprint: REQUEST rev4 @e237e82e（ai-docs/delivery/harness/tscgate2-fixbatches.md·唯一蓝本·协调方正式授权）
base: e237e82e1e71dbd243c3d6c841daebf93d6eaeb9（worktree /Users/miaole/Desktop/golucky/meetwise-line-tscgate2·分支 line/tsc-fix-batches·代码 base=主线 c17804a5）
status: **exec:awaiting_post_prove_dual**（STOP·post-prove 双审归协调方派·Ban self-approve·alone≠dual）
env: tsc 6.0.3 · turbo 2.10.0 · pnpm 10.18.0 · 零依赖安装改动·零 .env 触碰
est_live_model_calls: 0（纯型修+静态门·零 live·零模型调用·Key name-only 零使用）
```

## 1. 交付面（四批+点亮·全列）

- **B2 类型环境**（新增 `e2e/helpers/undici-types.d.ts`·ambient 全局面）：`RequestInfo = string | URL | Request`（逐字镜像·保 proof.ts:70 逆变兼容）·`HeadersInit = Headers | [string,string][] | Record<string, string | readonly string[] | undefined>`（record 值域 `|undefined`=蓝图「HeaderRecord KnownHeaderValues 收窄适度放宽」授权·erratum-E5）·**禁 any 塑**（零 any 字面）；
- **B3 真型不配**（interview.ts·+4-1）：收窄谓词 `isConcludeReason = (value: string): value is ConcludeReason => (CONCLUDE_REASONS as readonly string[]).includes(value)`（~2 行·运行时同一 includes 调用·零行为 diff·服务端 payload 外部数据运行时守卫全保留——席2 边界锚遵守）；
- **B4 strict 噪声**（7 错机械修·全 `!` 非空断言·零守卫死分支）：sse.ts:10 `match[2]!`+:12 `match[3]!`（正则三捕获组无可选组）·ocr-fixture.ts:75 `glyph[row]!.length`+:76 `glyph[row]![column]`（row<glyph.length 循环界）·performance.e2e.ts percentile min()-clamp 索引 `]!`（:22 空守卫后恒 in-bounds·蓝图书 :52-54 三错于调用点·修在返回源头 1 行全消）；
- **门禁点亮**：根级 `tsconfig.e2e.json`（新增·extends ./tsconfig.json 继承 skipLibCheck/strict·include ["e2e/**/*"]·allowJs:true checkJs:false·noEmit）+ root script `typecheck:e2e` + turbo.json tasks 增 `"//#typecheck": {}`（rev4 钉值 token）+ root 别名 script `typecheck`（turbo 2.10 根任务锚点·attempt-A2·转发 `pnpm typecheck:e2e`）；
- **验收**（恰 1 run·原值见 00/02）：门1 `tsc -p tsconfig.e2e.json --noEmit` EXIT=0 · 门2 `pnpm typecheck:e2e` EXIT=0 · 门3 `e2e-static-guards:check` EXIT=0（runners=6 helpers=21 flags=9 aiPaths=6）· 门4 `e2e-platform:check` EXIT=0（directoryErrors=0）· §4 补全 `e2e-helpers:prove` EXIT=0（26 scenarios）· **`e2e-parity:check` 移出验收**（sibling 债·零触碰）；
- **turbo 接线亲证**：`turbo run typecheck --dry=json` → 恰 1 runnable=`//#typecheck`·command 逐字 **`pnpm typecheck:e2e`**（rev4 预言原值命中）·17 槽位 NONEXISTENT 预期跳过（11 workspace typecheck+6 build·蓝图书 10·漂移登记 03 §3）。

## 2. 零逻辑变更声明（逐批）

- B2：纯 ambient 类型声明（d.ts 零运行时输出）；
- B3：谓词提取=同一 `includes` 调用·同参同序·布尔取反位置不变→运行时等价；
- B4：`!` 非空断言=编译期擦除·零运行时指令；
- 点亮：tsconfig/script/turbo 声明面·零产品码触达。
- e2e 场景行为面旁证：`e2e-helpers:prove` 26 scenarios 全绿（EXIT=0）·static guards/platform 门全绿。

## 3. Ban 核对（逐条）

- 零产品码：`git diff --name-only | grep -E '^(apps|packages)/'` → **空（EXIT=1）**亲证（01 §4）；改动面=4 e2e 文件+package.json+turbo.json（M·14+/6-）+2 新增（d.ts/tsconfig.e2e.json）；
- 零逻辑变更：§2 逐批声明；apps/packages src 零 diff；
- turbo 接线仅 `//#typecheck` 声明（turbo.json 恰 1 行）；root package.json 恰 2 script 行（钉值 `typecheck:e2e`+别名 `typecheck`·attempt-A2 全账）；
- `e2e-parity:check` 移出验收 ✓（零触碰）；apps/api 禁点亮 ✓（未动）；本刀未给 apps/packages 任何包新增 typecheck script ✓（11 workspace typecheck 槽位维持 NONEXISTENT 原状）；
- 禁降 strict ✓（strict 经 base.json 继承·零覆盖）；
- Key name-only·est 0 live ✓；
- pins 照抄：**haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false** +脚注 **actualSpendCny=null**；
- 实现不自批：STOP awaiting post-prove dual·alone≠dual。

## 4. Non-claims

本刀 ≠ C1 lint 门 ≠ apps/packages 全量 typecheck 点亮（e2e 先行·按包点亮后续）≠ G7 面 ≠ e2e-parity 修复（sibling 债 parity-baseline-regen 另立）≠ apps/api 状态改判（26 错红维持）≠ alone=dual。erratum-E5（B2 record 值域放宽）为 EXEC 新发现依蓝图授权面执行·裁决权归协调方双审。
