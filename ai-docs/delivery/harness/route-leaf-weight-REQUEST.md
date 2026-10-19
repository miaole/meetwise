draft:awaiting_pre_exec_dual

# 规划相关性按最高权重叶子选取

基线 `e722550dcce62d195e0bf2ead0737fcfee1e62c9`。本步只新增这一份说明，不改产品代码。

## §0 锚

基线 `e722550dcce62d195e0bf2ead0737fcfee1e62c9`。行号是在这棵树上打开文件看到的。

### 0.1 规划相关性叶子现在取快照第一片

`apps/worker/src/interview-consumer.ts` 先读检索用快照，再取叶子：

- :414-415 `routeSnapForRetrieve = await asPrincipal(...)`，调用 `getInterviewRouteSnapshotForAdaptiveRole`
- :424 `const routeLeafTrackId = routeSnapForRetrieve?.allocations?.[0]?.leafTrackId`
- :497 放进生命对象 `routeLeaf: routeLeafTrackId`

`:422-423` 与 `:496` 的注释已经写着：这是规划相关性闸的叶子；缺行或缺叶时是 `undefined`。变量名是 `routeLeafTrackId`。

`apps/worker/src/adaptive-lifecycle.ts:166-168` 把 `routeLeaf` 收成可选字符串。`:377` 调用 `planCompetencies` 时，最后一个实参是 `d.routeLeaf`。

`apps/worker/src/adaptive-interview-service.ts` 的 `planCompetencies`（:327）把这个值叫做 `relevanceLeaf`，两处交给已有函数：

- :335 `plannerPlanBusinessError(v.competencies, relevanceLeaf)`
- :350 `filterCompetenciesByLeafDomain(out.value.competencies, relevanceLeaf)`

`plannerPlanBusinessError` 在 :295。`relevanceLeaf` 为空时 :297 直接返回 `null`。`filterCompetenciesByLeafDomain` 在 :305。叶子为空时 :306 原样返回。这两处函数不要改。`:273` 的 `COMPETENCY_RELEVANCE_THRESHOLD = 0.5` 不要改。

### 0.2 角色门已经按最高权重取叶子

同文件角色门是另一次读取，不在 :424：

- :549 才进入 `isTechRoleFailClosedEnabled()`
- :550-551 再次 `await asPrincipal`，调用同一个 `getInterviewRouteSnapshotForAdaptiveRole`，结果放在 `snap`
- :555 `const allocations = snap?.allocations ?? []`
- :556-557 有叶子时 `allocations.reduce((best, a) => (a.allocationBps > best.allocationBps ? a : best))`，否则 `undefined`
- :559-560 胜出片的 `leafTrackId` 是非空字符串时，`trim()` 后写入 `roleFromRouteSnapshot`

比较符是 `>`，不是 `>=`。权重相同则保留快照里更早的那片。只有一片时，结果与 `[0]` 相同。`:552-554` 的注释写的就是这件事。

这次读取只在 `start` 且开关打开时发生。`:424` 在组生命对象之前，每条 claim 都会走到。两次读取不要并成一次，也不要挪位置。

### 0.3 校验只为分差复制排序，返回顺序仍是原顺序

`packages/domain/src/job-route-classifier.ts` 的 `validateModelRouteOutput` 从 :115 开始。`:149` 用 `[...allocs].sort(...)` 复制一份，只为核对 top1 与 top2 的分差。`:150-152` 拿这份副本算 `gap`，并与 `:37` 的 `JOB_ROUTE_MARGIN_THRESHOLD_BPS`（1000）比较。`:154-156` 返回的 `allocations` 是 `allocs.map(...)`，仍是模型原顺序。不要改这个函数，也不要改分差门槛。

`packages/db/src/routing/job-route-decision.ts` 的 `getInterviewRouteSnapshot`（:371）在 :380-384 按库里的数组顺序映射 `allocations`，没有重排。

### 0.4 检索缺口按 allocations 下标对齐

`job-route-classifier.ts` 的 `nextWeightedDeficitLeaf`（:204）在 :209 要求 `deficit.length` 与 `allocations.length` 相同。`:211` 用 `allocations.map((a, i) => (deficit[i] ?? 0) + a.allocationBps)`，下标一一对应。`:213` 并列时取更小的下标。

`apps/worker/src/interview-consumer.ts:443` 把缺口种子写成 `routeSnapForRetrieve?.allocations?.map(() => 0)`，长度与当时的数组一致。

`apps/worker/src/qbank-track-local-retrieve.ts:506-508`：传入的 `deficit` 长度等于 `snap.allocations.length` 才沿用，否则按片数补 0。`:510-514` 把 `snap.allocations` 原样送进计划，没有排序。`:541` 的检索条数是 `input.deps.k ?? 5`。

`apps/worker/src/adaptive-interview-service.ts:408` 调用 `cragRetrieve`。定义在 `packages/domain/src/crag.ts:57`。这两处都不要改。

就地排序或改写快照顺序会让缺口下标对错片。禁止。

### 0.5 已有证明怎么钉叶子

`apps/worker/test/qbank-planner-honesty.proof.ts:87` 断言生命对象仍写 `routeLeaf: routeLeafTrackId`。这条保持。变量名必须留下。

`apps/worker/test/role-input.proof.ts:113-128` 的 `makeInterview` 在 :124 用 `snap?.allocations?.[0]?.leafTrackId` 读供给快照的第一片，得到夹具字符串 `leaf`。`:160` 断言用户岗位文本里没有这串。`:175` 断言留空时岗位行等于 `岗位:` 加上这串。这是夹具读供给结果，不是规划相关性闸，也没有断言多叶时规划该选哪一片。不要改这个文件。

`packages/db/src/routing/candidate-route.ts:113-114` 的注释仍写角色门只读 `allocations[0]`。消费者 :555-557 已经是按权重的 `reduce`。`:135` 把候选人快照适配成只有一片的数组。这句注释和这次选取都不要顺手改。

## §1 修法

只改规划相关性叶子的选取。把 `apps/worker/src/interview-consumer.ts:424` 从 `allocations?.[0]?.leafTrackId` 改成与 :556-557 同形的 `reduce`。数组用已经读到的 `routeSnapForRetrieve`，不要再读数据库。

```ts
const routeLeafAllocations = routeSnapForRetrieve?.allocations ?? [];
const routeLeafTrackId = routeLeafAllocations.length > 0
  ? routeLeafAllocations.reduce((best, a) => (a.allocationBps > best.allocationBps ? a : best)).leafTrackId
  : undefined;
```

比较符保持 `>`。权重相同保留快照里更早的那片。只有一片时与原来的 `[0]` 相同。没有快照、没有 `allocations`、或数组为空时，`routeLeafTrackId` 仍是 `undefined`。胜出片没有 `leafTrackId` 时也仍是 `undefined`。不要改成空串，不要另找一片，不要 `trim()`。角色门 :559-560 的 `trim()` 只属于 `roleFromRouteSnapshot`，不要抄到这里。

`:497` 仍写 `routeLeaf: routeLeafTrackId`。变量名仍是 `routeLeafTrackId`。

`:414-415` 与 `:550-551` 两次 `getInterviewRouteSnapshotForAdaptiveRole` 保持各自位置，不要合并，不要把选取挪进 `:549` 的分支。`:335` 与 `:350` 继续把这个值传给原来的两个函数。

不新增文件，不新增 npm script，不新增环境变量。

## §1.3 否决

- 不改 `plannerPlanBusinessError`、`filterCompetenciesByLeafDomain`，也不改 `:273` 的相关性阈值。
- 不改 `validateModelRouteOutput`，不改 `:37` 的分差门槛，不改 `:149` 那份只用于核对的排序副本。
- 不就地排序 `allocations`，不把胜出叶子换到下标 0，不改写快照在库里或读出的顺序。
- 不改检索条数（`:541` 的 `k ?? 5`），不改 `cragRetrieve`（调用 :408，定义 `crag.ts:57`）。
- 不合并两次数据库读，也不把相关性叶子改成去读 `:550-551` 的 `snap`。
- 不改 `role-input.proof.ts`。`:124` 的 `[0]` 只是夹具读供给快照的第一片。
- 不改 `candidate-route.ts` 的注释或 `:135` 的单片适配。
- 不改 `routeLeafTrackId` 这个变量名。`:87` 已有的 `routeLeaf: routeLeafTrackId` 断言保持。
- 不新增文件，不新增 npm script，不新增环境变量。
- 不放宽 lint 警告上限。

## §2 门

执行时产品代码只改 §1 那一处选取。证明只在已有 `apps/worker/test/qbank-planner-honesty.proof.ts` 增加断言，不新建证明文件。`apps/worker/package.json:162` 已有脚本 `prove:qbank-planner-honesty`。

断言读消费者源码，三件同时成立：

1. `routeLeafTrackId` 由 `allocationBps` 的 `reduce` 选取，比较符是 `>`。
2. 不再用 `allocations?.[0]?.leafTrackId` 赋给 `routeLeafTrackId`。
3. `:87` 已有的 `routeLeaf: routeLeafTrackId` 断言保持，变量名不变。

命令：

- `pnpm -C apps/worker prove:qbank-planner-honesty`
- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

`pnpm turbo lint` 必须是 0 errors。警告上限恰好为 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。低于上限可以通过。不许把上限改高，也不许改检查脚本来放宽。

不跑出站清单。

## §8

draft:awaiting_pre_exec_dual

draft:awaiting_pre_exec_dual
