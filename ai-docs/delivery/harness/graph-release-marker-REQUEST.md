# 续跑前核对图版本

本说明只记录改法。基线是 `0cebd82b625cbf1b514eb161e34a18cbb3447a53`。行号都在这一提交上亲读。

## §0 锚

### 0.1 图版本字符串只在观察器参数里

`packages/ai-graphs/src/adaptive-interview/graph.ts`

- 第 26 行：`release: 'adaptive-interview/v1',`。这是 `graphObserver.runNode` 的参数，不是检查点元数据。
- 第 65 行：`.compile({ checkpointer });`。编译实参只有 `checkpointer`。第 62–64 行写明编译选项没有递归上限形参，现行代码没有把别的键放进 `compile`。

同目录以及整个 `packages/ai-graphs` 没有 `graph_version`，也没有 `graphVersion`。

`apps/worker/src/adaptive-lifecycle.ts` 第 266 行是另一处观察器参数：`release: 'adaptive-interview/v1'`。它包住 `runGraph`，不写入检查点。

### 0.2 检查点读写不带图版本，续跑也不拒绝不同版本

`apps/worker/src/checkpoint-fence.ts`

- 第 68–69 行 `getTuple` 原样交给内层：`return this.inner.getTuple(config);`。读缝不看版本，也不改已存行。
- 第 77–79 行 `put` 先做写围栏，然后把元数据原样交给内层：`return this.inner.put(config, checkpoint, metadata, newVersions);`。这里没有图版本字段。
- 第 82–84 行 `putWrites` 不接收检查点元数据。

`apps/worker/src` 同样没有 `graph_version` 或 `graphVersion`。

续跑入口在 `apps/worker/src/adaptive-lifecycle.ts`。开始路径第 356 行已经有 `cfg`，第 366 行 `g.getState(cfg)`，第 369 行与第 371 行才 `g.invoke`。作答路径第 411 行已经有 `cfg`，第 412 行 `gInitial.getState(cfg)`，第 446 行与第 449 行才 `g.invoke`。这两处在调用图之前都不读检查点元数据里的图版本，也没有「版本不同就拒绝」的错误码。

已有的「版本」不是这件事：

- `packages/ai-graphs/src/adaptive-interview/state.ts` 第 283–284 行的 `stateVersion` 是业务逻辑版本，注释写明独立于检查点 id。第 309 行 `retrievalPacket` 是出题续跑检索包，旧检查点缺省 null。本文件不动。
- `apps/worker/test/adaptive-legacy-checkpoint.proof.ts` 第 11–13 行的「版本失配」是剥掉 `channel_values` 顶层键，不是检查点元数据里的图版本。
- `apps/api/src/modules/interview/interview.service.ts` 第 176 行的 `resume_version_mismatch` 是简历 pin，不是图版本。

因此：版本还没有写入检查点元数据，续跑也还不会拒绝不同版本。

## §1 修法

允许的行为只有这些。

写入检查点时，元数据带上当前图版本字符串 `adaptive-interview/v1`。落点是 `apps/worker/src/checkpoint-fence.ts` 的 `put`：围栏判定保持原样，通过之后把调用方已经传入的元数据字段保留，并带上 `graph_version`，值就是这个字符串，再交给内层。不改 `getTuple` 的直通。不在 `putWrites` 上另造一份元数据。不改写已经落库的旧行；新写入的是新检查点。

续跑时，在图运行前核对。落点是 `apps/worker/src/adaptive-lifecycle.ts` 的两个入口，用已经在手的 `d.cp.getTuple(cfg)` 读将要续跑的那一条元数据，不新增第二套图装配。开始路径放在第 356 行 `cfg` 之后、第 366 行 `getState` 之前。作答路径放在第 411 行 `cfg` 之后、第 412 行 `getState` 之前。

- 没有检查点，或者元数据里没有版本（键不在，或值不是非空字符串）：仍按当前版本放行。其后的 `getState`、`invoke` 和已有的只投影路径保持现在的形状。
- 元数据里已有非空字符串，且与 `adaptive-interview/v1` 逐字相同：放行。
- 元数据里已有非空字符串，且与当前版本不同：在图运行前拒绝。错误对象沿第 443 行 `stale_question` 的形状，稳定错误码用 `graph_release_mismatch`。这个字符串现在全仓没有。不调用 `invoke`，不 `put`，不 `deleteThread`，不改写旧检查点。

不把 `graph_release_mismatch` 放进 `apps/worker/src/interview-consumer.ts` 第 267–271 行的瞬时错误码集合。那组是租约丢失和可重试故障，版本不同不是这类。不改分类函数，不新造重试策略。

不改 `packages/ai-graphs/src/adaptive-interview/graph.ts`。第 26 行的观察器参数和第 65 行的 `compile({ checkpointer })` 保持原样。不把观察器参数当成已经写入的检查点标记。不做状态迁移函数。不新增第二套图装配。

证明只扩展已经存在的 `apps/worker/test/graph-fence-write.proof.ts`。在现有 `put` 透传臂上断言内层元数据带有 `graph_version` 且值是 `adaptive-interview/v1`，原有字段仍在。另加两臂：没有版本的旧检查点仍能进入现有开始路径；版本是别的非空字符串时，在 `invoke` 之前抛 `graph_release_mismatch`，检查点行数不增加。不新建证明文件，不改 `package.json`。

## §1.3 否决

- 否决统计在途版本分布。那要线上数据，本改法不读、不汇总、不报表。
- 否决发明保留天数、小时数或条数。不新造清理任务。
- 否决新的数据库权限。
- 否决新的 `DELETE`。不调用 `deleteThread` 来处理版本不同。
- 否决新迁移。不改已有迁移。
- 否决改检索包。`state.ts` 第 309 行 `retrievalPacket` 以及该文件其余字段都不改。
- 否决把缺失版本的旧检查点一律判失败。没有版本仍按当前版本放行。

同时否决：改写旧检查点、新增第二套图装配、做状态迁移函数、把图版本塞进 `compile`、改观察器那两处 `release` 参数、把 `stateVersion` 当作图版本。

## §2 门

只跑仓库里已经有的命令。不新造脚本，不改脚本表。证明扩展 `apps/worker/test/graph-fence-write.proof.ts` 这一个已有文件，不新建第二个受管文件。本说明是唯一允许新增的受管文件。

| 项 | 已有命令 | 通过条件 |
|---|---|---|
| 检查点围栏 | `pnpm graph-fence-write:prove` | 根 `package.json` 第 548 行已有。扩展后的证明退出码 0。覆盖写入带版本、缺版本放行、版本不同在图运行前拒绝且旧行不改。 |
| 自适应图续跑 | `pnpm adaptive-life:prove` | 根 `package.json` 第 545 行已有。缺版本的现有路径仍通过。 |
| 自适应图续跑 | `pnpm adaptive-resume:prove` | 根 `package.json` 第 546 行已有。 |
| 旧检查点 | `pnpm adaptive-legacy-checkpoint:prove` | 根 `package.json` 第 547 行已有。缺版本仍放行，不把通道缺键改判成图版本失败。 |
| 自适应图行为 | `pnpm adaptive-flow:prove` | 根 `package.json` 第 544 行已有。 |
| 图装配 | `pnpm adaptive-graph:prove` | 根 `package.json` 第 541 行已有，指向 `packages/ai-graphs` 的 `prove:adaptive-graph`。 |
| 编译契约 | `pnpm adaptive-compile-contract:prove` | 根 `package.json` 第 542 行已有。`compile` 仍只有 `checkpointer`。 |
| 类型 | `pnpm turbo typecheck --force` | 退出码 0。 |
| 静态检查 | `pnpm turbo lint` | 退出码 0，且 0 errors。警告数低于下表上限算过。不要加空警告，也不要改这些上限。 |
| 文档 | `node scripts/ai-docs/check-docs.mjs` | 退出码 0。 |

静态检查上限以各包 `package.json` 里现有的 `--max-warnings` 为准：

| 包 | 上限 | 亲读位置 |
|---|---|---|
| root | 5242 | `package.json` 第 8 行 |
| api | 1423 | `apps/api/package.json` 第 7 行 |
| domain | 115 | `packages/domain/package.json` 第 10 行 |
| ai-runtime | 628 | `packages/ai-runtime/package.json` 第 14 行 |
| worker | 959 | `apps/worker/package.json` 第 7 行 |
| db | 1042 | `packages/db/package.json` 第 11 行 |
| web | 601 | `apps/web/package.json` 第 7 行 |
| qdrant | 27 | `packages/qdrant-store/package.json` 第 11 行 |
| ai-graphs | 47 | `packages/ai-graphs/package.json` 第 10 行 |
| contracts | 265 | `packages/contracts/package.json` 第 12 行 |

本修法不调用模型，不新增供应商环境变量。因此不跑 `pnpm provider-egress:inventory`，也不跑 `pnpm provider-egress:prove`。这两条命令在根 `package.json` 第 37–38 行，本改法用不到。

不新增迁移，不写迁移唯一性门。

## §8

draft:awaiting_pre_exec_dual

本步只新增这份说明。产品代码、证明和迁移都不改。

draft:awaiting_pre_exec_dual

draft:awaiting_pre_exec_dual
