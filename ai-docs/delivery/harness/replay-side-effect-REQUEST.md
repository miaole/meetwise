executed:awaiting_post_prove_dual

# 出题续跑先记住检索包再调用模型

本说明只记录改法。这次不改产品源码，不改证明，不新增迁移，不新增代码文件。

行号在 `a3516e9c943b3fc891e13a76e21df3bf0a6f5669` 上亲读。下面引用的是该提交里的原文。

## §0 现状

出题节点把检索和模型调用放在同一次返回里。正常返回之前，检索结果没有单独的检查点。进程在节点返回前死掉，续跑会把整个节点再执行一遍。模型调用有幂等键，所以同一键不会再次向外派发。本地检索、低置信时的网页或深检索，以及出题成功后的已问查询，都会再做一次。进度事件的键已经能挡住重复落库。

### §0.1 出题节点

`packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts`

- 第 64–66 行先算有效种类：路由种类是 `grounded` 且没有可用简历画像时，改成 `fundamental`，否则用路由种类。
- 第 67 行轮次取 `state.mind.turn`。
- 第 79–82 行是澄清分支。它直接用状态里已有的澄清题面，不调用检索接缝。
- 第 83–95 行是非澄清分支。第 84 行从 `state.transcript` 取出已问题面，第 85 行用同一份记录现算会话摘要，第 93–95 行只调用一次 `deps.retrieveAndGenerate`。事实形参恒为空数组。
- 第 96–117 行：接缝返回失败时，要么顺延下一胜任力并加一状态版本，要么收口。这两条返回都不带检索包。
- 第 167–210 行：成功时状态版本加一，并写入待发问题。检索结果只存在于接缝内部，不在这次返回之前落进检查点。加权缺口也是在这次成功返回里才写（第 206–209 行），失败臂不写。

因此，节点在正常返回前不会把检索包写入检查点。

### §0.2 已有自环，编译参数不变

`packages/ai-graphs/src/adaptive-interview/graph.ts`

- 第 30–35 行节点只有 `plan`、`decide`、`genQuestion`、`awaitAnswer`、`evalAnswer`、`conclude`。
- 第 43–54 行是出题节点的条件边。第 50–52 行：有待发问题去等回答；未结束、路由存在且不是收口时回到 `genQuestion`；否则收口。回到出题节点的这条边已经存在。
- 第 62–65 行写明编译选项没有递归上限形参。编译实参只有 `{ checkpointer }`。

递归上限不在编译上。`apps/worker/src/adaptive-lifecycle.ts` 第 356 行和第 411 行的调用配置已经带 `recursionLimit: 64`。第 367–372 行：待执行节点非空时 `invoke(null)`，只有全新线程才 `invoke({})`。第 448–449 行：本题已经写入、下一步非空、且没有待发问题时，同样 `invoke(null)`。

### §0.3 状态里已有的覆盖通道

`packages/ai-graphs/src/adaptive-interview/state.ts`

- 第 225 行 `transcript` 的归约是拼接。检索包不能放进这条会拼接的对话记录。
- 第 135 行简历事实只活在依赖闭包上，注释写明禁止进入图状态和检查点。
- 第 232–237 行 `topicMainQuestionId`、第 251–260 行 `weightedDeficit` 都是覆盖通道：归约 `(_, b) => b`，缺省 `null`。键不在返回值里时，检查点原值保留。
- 第 148–178 行 `retrieveAndGenerate` 现有九个形参，最后三个可选。返回值是出题结果，不是检索包。

现在没有可选的检索包通道。

### §0.4 服务把检索放在模型调用前面，但同一次才返回

`apps/worker/src/adaptive-interview-service.ts` 的 `retrieveAndGenerate` 从第 404 行到第 731 行。

- 第 393–394 行的 `rollTurn`、`rollSeq` 是进程内计数，进程一死就没了。第 478–483 行用它选择初诊键：`${threadId}:ask:t${turn}:0`，同轮再次进入且计数已大于 0 时用 `:r${rollSeq}`。第 620 行接地重试键是 `:gr${refsRetry}`。操作名是第 26 行的 `interview.question-generation.v1`。
- 第 490–495 行 `withTokenStream` 包住 `withGenerationProgress`，进度段名是 `retrieve`、`generate`、`validate`。检索就在这个包装里面。
- 第 499–506 行：种类是 `fundamental` 或 `scenario` 时调用 `cragRetrieve`，否则本地与网页都是空。低置信才继续探外部。
- 第 507–515 行：检索结论里的原生失败在模型调用前就返回失败形。
- 第 568–612 行才是 `invoke`。第 687 行出题成功后调用 `wasAsked`。第 712 行换题后再次查询。

`packages/domain/src/crag.ts` 第 29–40 行评级阈值是高 0.7、低 0.3、保留 0.5。第 70 行先做本地检索，第 74–77 行只有不够好才调用 `deepResearch`，没有深检索时才退回 `webExplore`。这些阈值不要改。

`apps/worker/src/interview-consumer.ts` 第 461–469 行：同一次领取里 `rag.retrieve`、`web.explore`、`deep.research` 各最多一次。第 446–447 行本地检索的副作用会更新进程内加权缺口；这个数组本身不是检查点字段，要等出题节点成功返回才写入 `weightedDeficit`。

进度键在 `apps/worker/src/generation-progress.ts`：第 23 行间隔 2000 毫秒，第 29 行每次生成最多 6 行。第 146 行 `generation:${attemptKey}:started`，第 133 行 `generation:${attemptKey}:progress:${ordinal}`，第 95 行 `generation:${attemptKey}:first-token`。同键重放不添行。载荷白名单在第 35–38 行，没有检索正文。

已问查询在 `apps/worker/src/memory-service.ts` 第 12–13 行，是归一化后的精确匹配。

领取预算在 `apps/worker/src/interview-dispatch-fairness.ts` 第 10–13 行：每所有者在途 1，全局在途 4。`apps/worker/src/interview-consumer.ts` 第 313–315 行按这个预算领取。预留秒数在 `packages/db/src/commerce/commerce.ts` 第 37 行，值是 1800。

### §0.5 续跑证明里已经钉住的期望

`apps/worker/package.json` 第 60 行脚本名 `prove:adaptive-resume`，命令体是 `tsx test/adaptive-resume.proof.ts`。

`apps/worker/test/adaptive-resume.proof.ts`：

- 第 170 行：全新线程用空对象起跑，出首题。
- 第 187 行把整个接缝换成入口即抛错。抛错发生在派发前，模型尚未完成，节点也尚未返回，所以检索包不会写入检查点。
- 第 206、250、277、300 行：题目就绪事件恰一次。
- 第 207–208 行、第 251 行：评分模型调用次数不变。
- 第 209 行：上述抛错窗口续跑后，待提问的模型调用次数加一。期望是 `askBefore1 + 1`。
- 第 210、253、276、299 行：不得重跑计划或作答评估。第 210 行同时要求决策节点也不重跑。
- 第 211 行：该抛错窗口的失败出题账本行数是 0。

## §1 修法

执行时只改三个已有文件，并在已有证明上追加一条断言。不新增节点名，不改节点集合、条件边和编译参数，不新增迁移，不新增代码文件。除本说明外，新增受管文件是 0。

### §1.1 状态增加可选检索包

在 `packages/ai-graphs/src/adaptive-interview/state.ts` 按 `weightedDeficit` 的写法增加一个可选通道。归约是 `(_, b) => b`，缺省 `null`。旧检查点没有这个键时按缺省，不回填。

包里只放四类内容：

- 本次本地结果
- 本次网页或深检索结果
- 检索结论
- 身份：轮次、胜任力、难度、有效种类

禁止写入简历事实。禁止放进 `transcript`，也不要放进会拼接进提示词的会话摘要。会话摘要继续在第 85 行从对话记录现算。加权缺口数组不是这个包的字段，仍走现有通道。

依赖类型上增加一个可选声明，只有生产接缝显式写成真。未声明时，下面的两段路径不启用。

### §1.2 非澄清路径两段，且只有声明了才两段

改 `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts`。澄清分支第 79–82 行保持一次都不调用接缝，也不写检索包。

没有声明的脚本接缝仍走第 93–95 行今天的一次调用。测试里直接传入的脚本函数不会把模型调两次。

生产接缝声明支持之后，非澄清路径分成两段。身份用检查点里的轮次、胜任力、难度和有效种类，四项全相同才算命中。不要用进程内的 `rollSeq` 或任何进程内序号当唯一键。

第一段：没有与当前身份相同的包时，只做检索并返回该包。节点的返回值只写这个新通道。不写待发问题，不改路线，不加状态版本，不置结束，不写降级。待发问题仍是空，路线仍在，结束仍为假，于是第 50–52 行已有条件边回到 `genQuestion`。这就是那一次检查点。不新增节点名。

检索相位若得到第 507–515 行那种原生失败，不写检索包，节点仍走第 96–117 行现有失败出口。

第二段：身份命中则把包交回接缝，跳过再次本地检索和深检索，再走现有模型调用与已问查询。成功、换胜任力、收口的返回形状保持第 96–117 行和第 167–210 行的现有字段。状态版本仍只在这些现有返回里加一。加权缺口仍只在成功返回时按第 206–209 行写。

模型幂等键的形状不改，仍是 `:0`、`:r` 加序号、`:gr` 加序号这三种。检索相位不得推进 `rollSeq`，也不得组装或发出模型键。键的选择仍只在生成相位，规则与第 478–483 行相同。同一轮的生成相位不会因为中间多了一次检索返回而再加一次序号。

### §1.3 服务把检索从模型调用前面拆开

改 `apps/worker/src/adaptive-interview-service.ts`。生产对象在返回处显式声明支持两段。脚本接缝不声明。

检索相位在模型调用前返回。种类需要检索时只调用一次现有 `cragRetrieve`；不需要检索时返回空的本地结果、空的外部结果和空结论，身份仍写上。这个相位不进入进度包装，不调用 `invoke`，不写账本。

生成相位收到身份相符的包之后，不得再调用本地检索、网页或深检索，也不得再进 `cragRetrieve`。后续用包里的本地结果、外部结果和结论，接上现有的模板早退、情景降级、模型调用、批判和已问查询。`withGenerationProgress` 只包生成相位。`withTokenStream` 仍只包模型增量，留在生成相位，不包检索。进度段名仍是 `retrieve`、`generate`、`validate`。间隔、行数上限和三条事件键都不改。

已问查询仍留在生成相位，位置仍在模型成功之后。不为「查重已返回、节点尚未返回」的窄窗再拆节点或新表。那个窄窗续跑时，已问查询可以再做一次；本地检索和深检索不可以。

同一进程里，检索相位已经通过现有闭包更新了加权缺口 holder 的，生成相位仍按第 415–418 行在成功结果上带出现值。进程重启后的续跑不得为了重算缺口再调用本地检索。缺口不进检索包。生成相位仍先用第 409–411 行的现有种子。

同一次领取里三路检索各一次的上限不改。生成相位不再调用，才不会在同一次领取里撞上第二次。

### §1.4 证明只追加一条

改已有 `apps/worker/test/adaptive-resume.proof.ts`，不新建证明文件。

第 209 行保持 `askBefore1 + 1`，不要改成 0。那条对应第 187 行的入口抛错：模型尚未派发，检索包没有写入检查点，续跑仍进入生成相位并调用模型一次。第 211 行失败账本行数为 0 也不改。

不要改续跑空输入与全新线程空对象的区分，也不要改题目就绪、评分不重评、不得重跑计划与作答评估这些断言。对应行是第 170、206、207–208、210、250、251、253、276、277、299、300 行。

同文件追加一条：检索包已在状态里、且身份与当前轮次、胜任力、难度、有效种类相同。用低到会触发深检索的本地分数，使第一段确实调用过深检索。续跑不得第二次调用本地检索或深检索。这两路的新增次数都是 0。模型幂等键形状不在这条断言里改写。

## §1.5 否决

- 不改生命周期里续跑空输入与新线程空对象的区分。第 367–372 行和第 448–449 行保持现在的分支。
- 不改图的节点集合和编译参数。第 30–35 行的六个节点、第 43–54 行的条件边、第 65 行 `.compile({ checkpointer })` 都不改。
- 不把递归上限塞回编译。调用配置上已有的 64 留在第 356 行和第 411 行。
- 不改模型幂等和账本。键的三种形状、操作名、用量行的写入条件都不改。
- 不改检索评级阈值。高 0.7、低 0.3、保留 0.5 保持原值。
- 不改进度节流和事件键。2000 毫秒、6 行，以及 started、progress、first-token 三条键保持原样。
- 不改已问的精确匹配。
- 不把检索正文写进事件或推送。检索包只进检查点通道。
- 不改领取预算。每所有者在途 1、全局在途 4、预留 1800 秒，以及同一次领取内三路检索各一次的上限，都不改。

## §2 门

执行时跑下面四条，不新增别的命令，不新增供应商环境名，不另造出站门。

续跑证明以 `apps/worker/package.json` 第 60 行为准。全命令是：

`pnpm -C apps/worker prove:adaptive-resume`

它执行的就是 `tsx test/adaptive-resume.proof.ts`。

另外三条在仓库根目录：

`node scripts/ai-docs/check-docs.mjs`

`pnpm turbo typecheck --force`

`pnpm turbo lint`

## §8 状态

executed:awaiting_post_prove_dual

本说明只记录改法。产品代码、证明和迁移都不在这次提交里改。

executed:awaiting_post_prove_dual

## §9-EXEC

行号是本次工作树上亲读的，不是说明开头那次提交的行号。

- `packages/ai-graphs/src/adaptive-interview/state.ts`：检索包类型 91–101；`replayPacket` 197–201；`retrievalReplay` 203–207；`retrieveReplayPacket` 208–222；覆盖通道 `retrievalPacket` 305–309，归约 `(_, b) => b`，缺省 `null`。
- `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts`：身份四项全同 33–41；包判定 43–47。未声明两段时仍一次调用 129–132。没有同身份包时只返回 `{ retrievalPacket }` 119–123，不写待问、不改路线、不加状态版本、不结束、不写降级。身份命中后把包交回生成 125–128。失败仍走原出口 134 起。
- `apps/worker/src/adaptive-interview-service.ts`：生产对象 `retrievalReplay: true` 在 436。检索段 `retrieveReplayPacket` 437–454，不进进度包装，不调用模型，不推进 `rollSeq`。原生失败收据仍用既有 `:0`（416–419），不调用模型。生成段先种子再带回同一进程缺口 461–468。幂等键选择仍在生成段 535–541，形状仍是 `:0`、`:r` 加序号、`:gr` 加序号。已有包时不再调用 `loadRetrieval` 556–562。未传入包的直接调用仍一次检索加生成。
- `apps/worker/test/adaptive-resume.proof.ts`：209 行仍是 `askBefore1 + 1`，没有改成 0。新增断言在 363–368：包已在状态且身份相同，本地分数 0.1 使第一段走过深研；续跑后这两路新增次数都是 0。

门：

- `pnpm -C apps/worker prove:adaptive-resume` → `gate-replay-exec-prove.log`，EXIT=1。加载 `createPool()` 时失败，断言没有跑到，runner 未改。原文：`Error: database_config_invalid:database_target_missing`（`packages/db/src/principal.ts:753` `invalidDatabaseConfig`，`:788` `resolveDatabaseConnectionString`，`:946` `createPool`，`apps/worker/test/adaptive-resume.proof.ts:27`）。
- `node scripts/ai-docs/check-docs.mjs` → `gate-replay-exec-docs.log`，EXIT=0，扫描 2289（≤2296）。
