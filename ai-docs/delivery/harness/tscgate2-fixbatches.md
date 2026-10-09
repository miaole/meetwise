# TSCGATE-2 — e2e tsc 修复四批+门禁点亮刀（C1/C2 落地）

**状态**：`draft_rev2:awaiting_pre_exec_dual`（rev2 双席 FAIL 合并：B2 落点 e2e/helpers/undici-types.d.ts+值域并集禁 any·门禁改道根级 tsconfig.e2e.json+turbo root 接线 dry-run 亲证·apps/api 禁点亮 26 错实测·验收补三门·erratum 两处） · base = 主线 `c17804a5`（**含 E2EFAIL-1 修复补收 3a2a2e2b·B1 已消·残余 10 错**）· 分支 `line/tsc-fix-batches` · 立项依据 = TSC-GATE-1 nail 四批估算（≈15-20 行/6 文件）+ C1/C2 落地路径（turbo.json:6 typecheck 空挂+apps include 模式复制）。

## 1. 修法（四批·零逻辑变更）
- **B2 类型环境**（2 错 TS2304 HeadersInit/RequestInfo·proof.ts:54/:70）：**ambient d.ts 正选落点=e2e/helpers/undici-types.d.ts**（rev2·双席实测：e2e/types/ 撞 directory-contract.mjs:136 forbidden_domain_tree；helpers/*.d.ts 匹配 HELPER_FILE 正则 :139 照拾 include **/*）——声明面手塑（undici-types@8.3.0 仅存 .pnpm 无顶层 hoist·import 不可解析）：`RequestInfo` 逐字镜像 `string|URL|Request`（保 proof.ts:70 逆变兼容）·`HeadersInit` 并集 `Headers|[string,string][]|Record<string,string|readonly string[]>`（HeaderRecord KnownHeaderValues 收窄适度放宽=tests 面 non-claim）·**禁 any 塑**（编译绿但静默禁用检查——收据钉防）；
- **B3 真型不配**（1 错 TS2322 interview.ts:182 includes-cast 不收窄）：CONCLUDE_REASONS as const 收窄谓词（~2 行）；
- **B4 strict 噪声**（7 错：sse.ts:10 TS2322 捕获组+:12 TS2345·ocr-fixture.ts:75/:76·performance.e2e.ts:52-54 TS2532×5——三族全结构性不变式：正则三捕获组无可选组/row<glyph.length 循环界/percentile :22 空守卫后索引恒 in-bounds→`!` 断言/收口=诚实形态·守卫=不可达死防御分支 tests 面永不行使=假信心——席2 边界锚恰为 B3：interview.ts:179 reason 源自服务端 payload 外部数据→运行时守卫必须保留仅修型通道）：非空断言或显式守卫（机械 ~10 行）；
- **门禁点亮（rev2 改道·席1/席2 双实测）**：正式 tsconfig=**根级 `tsconfig.e2e.json`**（include ["e2e/**/*"]·allowJs:true checkJs:false·noEmit·skipLibCheck 继承——e2e/tsconfig.json 撞 directory-contract :215-217 unexpected_e2e_file）+ root script `typecheck:e2e` + **turbo 接线钉死根 package.json `typecheck`→`typecheck:e2e`**（turbo 2.10 root 任务·EXEC 须 `turbo run typecheck --dry-run` 亲证选择面恰 e2e）·**禁 e2e/package.json**（需动 pnpm-workspace.yaml=Ban 面外）·**apps/api 禁点亮**（tsc --noEmit 现状红 EXIT=2 实测 26 错）·**本刀禁给 apps/packages 任何包新增 typecheck script**（点亮首日红实测：worker41/domain26/api26/db20/ai-runtime15/web0/contracts0）。
- **禁降 strict**（run-B 残余 4 含真断链+真型错——降 strict 掩盖可修错误·TSC-GATE-1 立场）。

## 2. 验收
`tsc --noEmit` EXIT=0（e2e 域清零）·`pnpm typecheck:e2e` EXIT=0·static guards EXIT=0·零产品码 src 零 diff·attempts 全账·收据 `ai-docs/delivery/receipts/tscgate2-fixbatches/`。

## 3. Ban
零逻辑变更（型收窄/守卫/环境声明·零行为 diff——tests/纯型面）·e2e/ 外仅 tsconfig/turbo/package.json script·apps/packages src 零 diff·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual·est 0 live。

## 4. 验收补全（席2 处方2）
验收清单补 `e2e-platform:check`+`e2e-parity:check`+`e2e-helpers:prove`（运行时腿·base 亲证 EXIT=0 26 scenarios）全 EXIT=0·**erratum×2**：B4 码标 TS2322×1(:10)+TS2345×1(:12) 非 ×2；「41 错」系 apps/worker 非 api（api=26）。

## 5. Non-claims
本刀 ≠ C1 lint 门 ≠ apps/packages 全量 typecheck 点亮（e2e 先行·按包点亮后续）≠ G7 面。
