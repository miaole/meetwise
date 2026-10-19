executed:awaiting_post_prove_dual

# 没总分时不标口径不同

基线 `e722550dcce62d195e0bf2ead0737fcfee1e62c9`。本步只新增这一份说明，不改产品代码。

## §0 锚

基线 `e722550dcce62d195e0bf2ead0737fcfee1e62c9`，分支 `line/growth-null-overall-draft`。行号是在这棵树上打开文件看到的。

### 0.1 任一 overall 为 null，或维度名交集为空，纯函数都返回 false

`apps/web/lib/growth/comparable.ts` 的 `growthDeltaComparable`（第 12–19 行）不要改。

- 第 13 行：`prev?.overall == null` 或 `curr?.overall == null` 时直接返回 false。交集还没看。
- 第 14–18 行：两边 overall 都不是 null 之后，才用 `curr.dims` 的键去对 `prev.dims`。一个公共维度名都没有就返回 false；有公共名才返回 true。
- 第 24–26 行 `growthDeltaView`：不可比时 `{ comparable: false, delta: null }`。可比时 `delta` 是这一场 overall 减去上一场 overall。这个减法不要改。

### 0.2 注释写的是两场都有分才标注，渲染却只看上一场有没有分

`apps/web/app/growth/page.tsx`：

- 第 78–80 行：时间线最新在上。delta 按时间序，是本场 overall 减上一场 overall。第 80 行注释写明：不可比则不渲染 delta；两场都有分才显示「维度口径不同 · 不可比」；前一场缺分则不渲染。
- 第 81–86 行：先按 `points` 的时间序组条目。`i > 0` 时用 `growthDeltaView(points[i - 1], p)`。`prevScored` 只等于 `i > 0 && points[i - 1].overall != null`。第 87 行再 `.reverse()`，所以最新在上。
- 第 150 行渲染循环的 `i` 是倒序之后的下标，不是 `points` 的下标。当前场是 `p`。上一场有没有分只用已经算好的 `prevScored`。
- 第 156–159 行：只有 `view.comparable && view.delta !== 0` 才渲染 delta 数字。这段不要改。
- 第 161–163 行：注释写的是两场都有分、但维度名交集为空，才用中性标注代替 delta。渲染条件却是 `!view.comparable && prevScored`。第 163 行文案是「维度口径不同 · 不可比」，`data-testid="delta-not-comparable"`。这两处都留着。

`growthDeltaComparable` 在这一场 overall 为 null 时已经返回 false，于是 `view.comparable` 为 false。只要上一场 overall 不是 null，`prevScored` 就是 true，第 162 行仍会渲染那句。维度名有没有交集不影响这个结果，因为第 13 行在看交集之前就返回了。

上一场 `{ overall: 70, dims: { 算法: 60 } }`、这一场 `{ overall: null, dims: { 算法: 80 } }` 就是这种情况：维度名有交集（都有「算法」），这一场没有总分，页面仍会标出「维度口径不同」。

## §1 修法

只改 `apps/web/app/growth/page.tsx` 第 162 行这个谓词。

现在是 `!view.comparable && prevScored`。改为：上一场 overall 不是 null，且这一场 overall 不是 null，且 `!view.comparable`，才渲染第 163 行那句。

`prevScored` 已经表示「有上一场，且上一场 overall 不是 null」。这一场是 `p`。谓词写成：

`!view.comparable && prevScored && p.overall != null`

不要用第 150 行渲染循环的 `i` 去读 `points[i - 1]`。那个 `i` 是倒序后的下标。

这一场 overall 为 null 时不渲染。上一场 `{ overall: 70, dims: { 算法: 60 } }`、这一场 `{ overall: null, dims: { 算法: 80 } }` 不得出现「维度口径不同」。

两场 overall 都不是 null，且维度名没有交集时，`growthDeltaComparable` 仍返回 false，第 163 行原文「维度口径不同 · 不可比」仍要出现。`data-testid="delta-not-comparable"` 留着。

不改第 163 行的文案，不改 className，不改 testid。不改第 85 行 `prevScored` 的算法，它仍然只表示上一场有分。不改第 156–159 行的 delta 数字。不改第 80 行和第 161 行的注释。不改 `growthDeltaComparable`，不改 `growthDeltaView`。

## §1.3 否决

- 不改文案「维度口径不同 · 不可比」。
- 不改 `growthDeltaComparable`，也不改 `growthDeltaView`。
- 不新建证明文件。
- 不新建 npm script。
- 不新增环境变量。

## §2 门

在 `apps/web` 里搜过成长页和 `delta-not-comparable`。没有测试文件按场次数据渲染这段标注。

- `apps/web/test/web-logic.proof.ts` 第 1647–1653 行只调用 `growthDeltaView` / `growthDeltaComparable`。第 1654–1656 行只检查 `apps/web/app/growth/page.tsx` 的源码里有 `growthDeltaView` 的 import、`delta-not-comparable`，以及「维度口径不同 · 不可比」。它不把上面两场数据画出来。
- `apps/web/e2e-ui/screenshots.spec.ts` 第 86–87 行只打开 `/growth` 并截图，不断言这句。

因此执行步只改页面谓词，不新建测试文件。现有 `growthDeltaComparable` 测试保持不变。第 1654–1656 行的源码字符串检查也不改：文案和 testid 都留着，它们仍能对上。

`apps/web` 之外，`apps/worker/test/weakness.proof.ts` 第 104–106 行同样只检查页面源码里有这句和 testid，不渲染。不要改那个文件，也不要把它当成加断言的地方。

另外必跑：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

`pnpm turbo lint` 必须是 0 errors。警告上限恰为 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。低于上限可以通过，不许放宽。这些数就是各包现有的 `eslint . --max-warnings`：根 `package.json` 第 8 行 5242，`apps/api/package.json` 第 7 行 1423，`packages/domain/package.json` 第 10 行 115，`packages/ai-runtime/package.json` 第 14 行 628，`apps/worker/package.json` 第 7 行 959，`packages/db/package.json` 第 11 行 1042，`apps/web/package.json` 第 7 行 601，`packages/qdrant-store/package.json` 第 11 行 27，`packages/ai-graphs/package.json` 第 10 行 47，`packages/contracts/package.json` 第 12 行 265。未点名的包维持各自现有 lint 脚本，不得放宽。

这是页面改动。执行时还要用浏览器点开成长页核对：这一场没有总分时不出现「维度口径不同」；两场都有分且维度名没有交集时仍出现原文「维度口径不同 · 不可比」。写这份说明时不启动浏览器。

## §8

executed:awaiting_post_prove_dual

本步只新增这一份说明，不改页面，不改纯函数。

executed:awaiting_post_prove_dual

## §9-EXEC

只改了 `apps/web/app/growth/page.tsx` 第 162 行谓词，现为 `!view.comparable && prevScored && p.overall != null`。第 163 行文案未改。

`node scripts/ai-docs/check-docs.mjs` 退出码 0。

`pnpm turbo typecheck`、`pnpm turbo lint` 和浏览器核对留到事后复验，这一步没有跑。
