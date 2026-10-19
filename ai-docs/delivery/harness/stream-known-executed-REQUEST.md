# 流式空输出和长度截断在已有用量时按已执行结算

基线完整 sha 是 `0cebd82b625cbf1b514eb161e34a18cbb3447a53`。行号是在这棵工作树上打开文件看到的。本步只新增这一份说明，不改产品代码。

## §0 锚

基线完整 sha：`0cebd82b625cbf1b514eb161e34a18cbb3447a53`。

### 非流式

`packages/ai-runtime/src/model-client.ts` 的非流式完成在 `dispatchOnce`（:774）拿到响应体之后才分类。`packages/ai-runtime/src/timeout.ts:203-211` 在 `response.ok` 为假时抛 `ExternalHttpStatusError`，回到 `model-client.ts:933-935`，到不了 :841。所以 :841-851 只发生在成功响应体上。

:817-818 取 `choices[0]` 和 `message.content`。:821 只有 `finish_reason === 'length'` 时把 `finishReason` 设为 `'length'`，否则是 `undefined`。:829-839 仅当响应里有 `usage` 对象时才组装 `usage`；整体没有 `usage` 时 `usage` 为 `undefined`。

:844-851：内容为空，或 `finishReason === 'length'`，并且 `usage` 已经组装时，返回形状是：

- `ok: false`
- `kind: 'deterministic'`
- `externalOutcome: 'known_executed'`
- `errorCode`：内容为空是 `deterministic_output_invalid`；内容非空且为长度截断是 `deterministic_output_truncated`。空内容优先，即使同时是 `length` 也用 `deterministic_output_invalid`
- `usage`：上面组装好的用量
- `finishReason`：只有长度截断时为 `'length'`，否则不带

:852-854：内容为空且上面这条不成立（没有 `usage`）时，返回 `{ ok: false, kind: 'transient', externalOutcome: 'unknown' }`。:879（g7）和 :881-882（非 g7）把已经成立的 `known_executed` 原样返回，不会再落到 :890 的成功返回。

熔断不在这个文件里记。`packages/ai-runtime/src/invoke.ts:82-90` 把 `known_executed` 定义为已执行但输出不可用，并写明结算真实 usage、熔断记 success。:1016 进入这条臂。用量能结算时，:1056-1060 以 `'success'` 释放共享准入；用量缺失或非法时 :1031 同样以 `'success'` 释放。两条都不是 failure。

### 流式

`completeStream` 从 :953 开始。:1023-1025 的终结账面是 `stopSeen`、`usageSeen`、`doneSeen`。:1035 见到 `data:` 值为 `[DONE]` 时 `doneSeen = true`。:1049 只在 `choice.finish_reason === 'stop'` 时把 `stopSeen` 设为 true。`finish_reason === 'length'` 不改任何标记。:1051-1054 只在 `choices` 为空数组且带 `usage` 时把 `usageSeen` 设为 true，并记下 `usageRecord`。

下面这些出口现在都是 `{ ok: false, kind: 'transient', externalOutcome: 'unknown' }`：

- :1124-1126：期限中止、传输中断或调用方取消
- :1132-1133：中途错误帧或空闲看门狗
- :1135-1137：`stopSeen && usageSeen && doneSeen` 不齐。EOF 没有 `[DONE]` 走这里。`finish_reason` 为 `length` 也走这里，因为 `stopSeen` 仍是 false
- :1139-1141：上面三项都齐，但累计文本 `acc` 为空

:1167-1169 只在这些判断都过去之后返回 `{ ok: true, raw, usage }`。`completeStream` 里没有 `known_executed` 返回。因此已有 usage 时，流式空输出和 `finish_reason=length` 都还不是非流式那种 `known_executed`，invoke 的 success 臂也走不到。

## §1 修法

只改流式这一处：`packages/ai-runtime/src/model-client.ts` 的 `completeStream`，判定在现在的 :1135-1141。不改 :774-942 的非流式分支，不改 `invoke.ts`。熔断记 success 只靠返回与非流式相同的形状，让现有 :1016-1060 继续以 `'success'` 释放。不要在 `completeStream` 里另写熔断调用。

当且仅当下面全部成立：

- 没有中途错误帧（`midStreamErrorFrame` 仍为 false）
- 没有空闲看门狗（`idleWatchdogFired` 仍为 false）
- 没有调用方取消或传输中断（没有走进 :1124 的 catch）
- usage 已经按现有 :1051-1054 解析到（`usageSeen` 为 true，且 `usageRecord` 在）
- 结束标记已出现：某个 choice 的 `finish_reason` 是 `stop` 或 `length`。没出现，或是别的值，都不算
- `data: [DONE]` 已出现（`doneSeen` 为 true）

这时：

- 累计文本为空：返回与非流式 :849-850 相同的 `known_executed`。`errorCode` 为 `deterministic_output_invalid`。结束标记若是 `length`，`finishReason` 仍为 `'length'`；若只是 `stop`，`finishReason` 与非流式一样不设。空文本优先于截断码，和 :844-848 相同。
- `finish_reason` 为 `length` 且累计文本非空：同一 `known_executed` 形状，`errorCode` 为 `deterministic_output_truncated`，`finishReason` 为 `'length'`。不得返回 `ok: true`。
- `finish_reason` 为 `stop` 且累计文本非空：:1167-1169 的成功路径保持不变，仍是 `{ ok: true, raw, usage }`。

`usage` 对象只用现有 :1147-1163 的组装，不要另写补齐公式。有 `usage` 时 :1164 的缓存观测照旧打一次。不要把 `length` 写成 `stopSeen = true`，否则会和 `stop` 的成功路径混在一起。

以下仍必须返回 `{ ok: false, kind: 'transient', externalOutcome: 'unknown' }`，不得改成 `known_executed`：

- 传输中断
- 调用方取消
- 中途错误帧
- 空闲看门狗
- 没有 usage
- 没有结束标记（`finish_reason` 不是 `stop` 也不是 `length`，或根本没出现）
- EOF 但没有 `[DONE]`（`doneSeen` 仍为 false）

:1136 注释里的 `streamEndedByEofWithoutDone` 字面量留在 `completeStream` 区域内。既有证明要求这个字符串还在。

不新增任何阈值数字。不新增迁移。不新增环境变量。不改非流式分支。`complete` 函数体上的既有哈希钉因此不用改，也不要改。

证明只扩展已有文件 `packages/ai-runtime/test/model-client-stream.proof.ts`。本说明是唯一允许新增的受管文件。不要新建证明文件。要补的断言：

- 空累计文本，`finish_reason` 为 `stop`，已有 usage chunk，已有 `[DONE]`，没有错误帧：`known_executed`，`errorCode` 为 `deterministic_output_invalid`，结果带 usage。不得再是 `transient` / `unknown`。
- 累计文本非空，`finish_reason` 为 `length`，已有 usage，已有 `[DONE]`：`known_executed`，`errorCode` 为 `deterministic_output_truncated`，`finishReason` 为 `length`。不得 `ok: true`。
- 累计文本为空且 `finish_reason` 为 `length`，已有 usage，已有 `[DONE]`：`known_executed`，`errorCode` 仍是 `deterministic_output_invalid`，`finishReason` 为 `length`。
- `finish_reason` 为 `stop` 且有文本、有 usage、有 `[DONE]`：仍是成功。
- 已经看到 `length` 或空文本，但没有 usage，或 EOF 没有 `[DONE]`：仍是 `transient` / `unknown`。
- 中途错误帧、空闲看门狗、调用方取消：仍是 `transient` / `unknown`。

沿用该证明已有的 `MODEL_TEXT_STREAM_ENABLED` 与 `MODEL_TEXT_STREAM_PREVIEW`。不要新环境变量名。

## §1.3 否决

- 否决把传输失败记成已执行。
- 否决没有 usage 也结算。
- 否决自动重放未知调用。
- 否决新迁移。
- 否决新环境变量。
- 否决放宽 lint 上限。

## §2 门

已有证明脚本名是 `prove:model-client-stream`。它在 `packages/ai-runtime/package.json:50`，对应 `packages/ai-runtime/test/model-client-stream.proof.ts`，已经覆盖 `model-client` 的流式结果。执行命令是 `pnpm -C packages/ai-runtime prove:model-client-stream`。本步只扩展这个已有证明文件。

另外必跑：

- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

lint 上限恰为 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。0 errors。低于上限算过。不得放宽这些上限。

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm provider-egress:inventory`
- `pnpm provider-egress:prove`

不新增供应商环境变量，不新增适配器文件。计数不变就不要改清单（`ai-docs/architecture/ai/provider-egress-inventory.json`）、证明硬计数（`scripts/provider-egress-inventory.proof.mjs` 里的适配器数、操作数、登记对数）和架构说明里的计数句（`ai-docs/architecture/ai/provider-egress-inventory.md` 的计数句）。计数变了必须三处一起改。

不写迁移唯一性门。

这一刀不把能力项记成全部完成，因为非流式路径此前已经收口，本文件只补流式这一种形状。

## §8

executed:awaiting_post_prove_dual

产品代码已按上文修法写完。空文本和长度截断在流式完成且已有用量时改为已执行。

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

`completeStream` 在没有中途错误帧、没有空闲看门狗、没有取消或传输中断、用量已按原有空 choices 块解析、结束标记是 stop 或 length、并且 `data: [DONE]` 已出现时，空累计文本改为 `known_executed`，`errorCode` 为 `deterministic_output_invalid`。结束标记是 length 时 `finishReason` 为 length；只是 stop 时不设 `finishReason`。累计文本非空且结束标记是 length 时改为 `known_executed`，`errorCode` 为 `deterministic_output_truncated`，`finishReason` 为 length，不再返回成功。结束标记是 stop 且累计文本非空时仍返回成功。用量只用原有组装，有用量时缓存观测仍打一次。`length` 不写入 `stopSeen`。没有用量、没有结束标记、没有结束帧、错误帧、看门狗、取消或传输中断仍是瞬时未知。非流式分支未改。证明补上这些断言。
