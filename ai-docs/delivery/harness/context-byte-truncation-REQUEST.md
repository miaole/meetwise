# 上下文截断改按 UTF-8 字节计算

draft:awaiting_pre_exec_dual

本文只记录改法。不改产品代码，不新增代码文件。父提交 `c93c119228ed9b2248c1c4d7a967ace054c2156a`，分支 `line/context-byte-cap-draft`。

## §0 锚

行号来自该父提交上的源码，不是估计。

### 截断按 UTF-16 的 `string.length`

`packages/ai-runtime/src/model-client.ts`：

- 第 115–122 行 `codepointSafeSlice` 用 `s.length` 和 `s.slice` 按下标切。末位码元若落在高代理 `0xd800`–`0xdbff`，只回退一位。预算数字仍是 UTF-16 码元个数，不是 UTF-8 字节数。
- 第 108 行 `DEFAULT_USERDATA_CAP = 20_000`。第 109 行注释写「字符」，比较用的却是 `string.length`。
- 第 110–114 行 `SERVICE_USERDATA_CAP`：第 111 行 `mock-interview.evaluate` 为 `12_000`；第 112 行 `interviewer.ask` 为 `16_000`；第 113 行 `report.generate` 为 `8_000`。
- 第 127–131 行 `capUserData`。第 129 行 `if (userData.length <= cap) return userData`。第 130 行把 `cap - marker.length` 交给 `codepointSafeSlice`。是否超限、扣掉标记，两处都是 `string.length`。
- 第 133–136 行 `capRagMaterial`。第 133 行 `RAG_MATERIAL_CAP = 8_000`。第 135 行 `rag.length <= RAG_MATERIAL_CAP`。第 136 行同样扣 `marker.length`。

结论：`capUserData` 与 `capRagMaterial` 按 UTF-16 的 `string.length` 截断。基本多文种平面里的一个汉字，`length` 为 1，UTF-8 为 3 字节。

### 预算按 UTF-8 字节拒绝

同一文件：

- 第 187–194 行 `byteEstimate` 返回 `Buffer.byteLength(value, 'utf8')`。
- 第 242–243 行 `renderPrompt` 先调用 `capUserData` 和 `capRagMaterial`，再把渲染结果交给预算。
- 第 268 行 `planContextBudget`。第 283–284 行说明端点缺省估算器仍是 `utf8-bytes-v1`。第 295–299 行在该版本上调用 `byteEstimate`；另一已注册版本走加权估算，不是这条字节路径。
- 第 319 行把系统、用户文本、图片描述、图片预留和响应格式预留加总为 `inputTokens`。
- 第 321–323 行：`providerInputLimit < 1`，或 `inputTokens` 大于 `policy.maxInputTokens`，或大于 `providerInputLimit` 时，返回 `{ ok: false, error: 'model_context_budget_exceeded' }`。

错位：`capUserData('字'.repeat(16_000), 'interviewer.ask')` 在第 129 行因 `length === 16_000` 原样返回，`byteEstimate` 为 48_000。这段随后进入第 319 行。字符数已经封顶时也一样：12_000 个汉字的 `length` 是 12_000，字节是 36_000。截断阶段看起来没超，预算阶段才按字节拒绝。

默认标记 `…[内容过长已截断]`（第 107 行）的 `length` 是 10，UTF-8 是 26 字节。第 130 行和第 136 行若继续扣 `marker.length`，正文加标记的字节数会超过同一个数字上限。

### 现有测试

`apps/worker/test/context-window.proof.ts`：

- 第 16–21 行把各服务上限写成与实现相同的数字。第 18 行 `interviewer.ask` 为 `16_000`。
- 第 28 行用 `out.length <= cap` 断言封顶。
- 第 33 行用 `.length` 比较 50_000、100_000、200_000 字三次输出是否等长。

`apps/worker/test/context-stress.proof.ts`：

- 第 53 行和第 60 行把回声正文的 `data.length` 记入 `recorded`。
- 第 135–137 行三处用 `.length` 断言不超过 `12_000`、`12_000`、`20_000`。
- 第 167 行「实收 ≤ 12000」和第 200 行「每次评估请求 ≤ 12000」用的就是上面记下的 `data.length`。
- 第 138–143 行断言短答案原样、调用方标记留在末尾、emoji 截断不留下孤立高代理。这些不是上限数字。
- 第 147–149 行是边缘契约按字数拒绝，不是这两个封顶函数。

不要把合成上限从 16_000 提高。

## §1 修法

截断改用与预算相同的 UTF-8 字节口径。中文不再在截断阶段按 `string.length` 看起来没超，到 `planContextBudget` 才被拒绝。

只改现有函数和现有测试的断言口径，不新增代码文件。

1. `capUserData` 与 `capRagMaterial` 的超限比较改为 `byteEstimate(text) <= cap`。这个函数就是 `planContextBudget` 在 `utf8-bytes-v1` 上用的计量。数字不改：默认 20_000，评估 12_000，`interviewer.ask` 16_000，报告 8_000，检索素材 8_000。
2. 扣除标记改为 `cap - byteEstimate(marker)`。默认标记按 26 字节计，不按 `length` 的 10。调用方传入的标记（含第 240 行那种带 nonce 的标记）也用 `byteEstimate` 现算，不把 26 写死。
3. 返回值含标记之后，`byteEstimate` 必须小于等于同一个数字上限。切开处仍须是完整码点：不拆 UTF-8 序列，也不留孤立高代理。`codepointSafeSlice` 目前只认 UTF-16 下标；若把字节预算直接当成 `string.length` 传入，中文会被切得过长。只改这个现有函数的计数单位，或在上述两个现有函数里按码点累加 `Buffer.byteLength`，切到字节预算以内。它的调用方只有这两处封顶。不改第 442 行 `splitCodepointSafeByBytes` 的流式合帧行为。
4. 字节数未超过上限的字符串原样返回。纯 ASCII 正文在「是否超限」上字节数等于 `string.length`。标记若含非 ASCII，扣除量改按标记字节，截断后的 ASCII 正文会比按 `marker.length` 扣除时更短，使正文加标记的字节数不超过同一上限。这不是放宽上限。
5. 不改 `planContextBudget` 的拒绝条件，不改估算器分派，不把截断改成加权估算。加权估算对汉字小于字节估算，截断若改用加权，字节预算仍可能拒绝。系统提示、围栏、图片和预留之和仍可能超过 `maxInputTokens` 或 `providerInputLimit`；本改动只消除用户数据或检索素材「按字符没超、按字节已超」这一段错位。

现有测试若用 `.length` 做封顶断言，执行时改成字节断言，不能把上限放宽。

- `context-window.proof.ts` 第 28 行改为 UTF-8 字节数小于等于同一个 `cap`。仍按字符封顶时，汉字输出的字节数约为该数字的三倍，这条断言必须失败。第 33 行三次输出的比较改为字节长度，仍须全相等。第 16–21 行的数字不改，第 18 行 `interviewer.ask` 保持 `16_000`。
- `context-stress.proof.ts` 第 135–137 行改为字节数不超过 `12_000`、`12_000`、`20_000`，截断标记仍须留在末尾。第 167 行和第 200 行的上限断言改为字节，上限仍是 `12_000`。第 53 行和第 60 行若继续只记 `data.length`，这两条就仍是 UTF-16；执行时让这两条上限断言改读 UTF-8 字节。第 138–143 行保持原意。第 147–149 行边缘契约不改。

## §1.3 否决

- 不提高合成上限。第 112 行 `interviewer.ask` 的 `16_000` 维持原数，只改计量单位。这不是 `packages/ai-runtime/src/voice-stream.ts` 第 75 行的采样率。
- 不改采样温度。第 157–165 行 `resolveEvalTemperatureOverride` 与第 167–175 行 `SERVICE_TEMPERATURE` 不动。
- 不新增迁移。

## §2 门

两个证明的脚本名取自 package.json，外加文档检查。不列出站清单。

- 窗口证明：根 `package.json` 第 598 行 `window:prove`，正文是 `pnpm -C apps/worker prove:window`。`apps/worker/package.json` 第 85 行 `prove:window`，正文是 `tsx test/context-window.proof.ts`。
- 长上下文证明：根 `package.json` 第 287 行 `stress:prove`，正文是 `node scripts/run-e2e-isolated.mjs stress:prove:raw`。`apps/worker/package.json` 第 20 行 `prove:stress`，正文是 `tsx test/context-stress.proof.ts`。`scripts/run-e2e-isolated.mjs` 第 2483–2484 行把 `stress:prove:raw` 转到 `pnpm -C apps/worker prove:stress`。
- `node scripts/ai-docs/check-docs.mjs`

本文不运行这两份证明，也不把它们写成已经通过。

## §8

draft:awaiting_pre_exec_dual

draft:awaiting_pre_exec_dual
