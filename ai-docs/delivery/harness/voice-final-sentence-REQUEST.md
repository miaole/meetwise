draft:awaiting_pre_exec_dual

# 多句最终识别要接在一起

基线 `7883a32408dda945cfff1dfaee3cfa69583af7c6`。本步只新增这一份说明，不改产品代码，不改测试。

## §0 锚

基线 `7883a32408dda945cfff1dfaee3cfa69583af7c6`。下面的行号是在这棵树上打开文件看到的。

### 0.1 百炼一句的文本不是整段累积稿

`packages/ai-runtime/src/voice-stream.ts:94`：`result-generated` 读取 `m.payload.output.sentence`。`sent.text != null` 时把事件做成 `{ text: sent.text, final: !!sent.sentence_end }`。`final` 为真只表示这一句 `sentence_end`。`text` 是当前这一句的文本，不是整段累积稿。这一行不要改。

### 0.2 假语音一次只给出整句

同文件 `fakeStreamingAsr`（:38-46）。`:43` 每收到一块音频就产出一次 `final: false`，文本是整句的前缀（`finalText.slice(0, min(length, n * 4))`）。`:44` 流尽后只产出一次 `{ text: finalText, final: true }`，文本是整句。这个函数不要改。

### 0.3 后一句 final 会盖掉前一句

同文件 `streamingVoiceTurn`（:216-239）。`:231` `let transcript = '', partials = 0`。`:233-236` 的循环里：`:234` 用 `ev.text.trim()` 判断用户是否开口并打断 TTS。`:235` `if (ev.final) transcript = ev.text`，于是后一句 final 覆盖前一句。`:236` `else { partials++; hooks.onPartial?.(ev.text); }`，partial 只计数并回调，不写入 transcript。

打断仍在 `:221-227`，以及 `:227` 的 `hooks.bargeIn` 和 `:234`。这些不要改。

### 0.4 现有证明要求单次 final 与整句逐字相等

`packages/ai-runtime/test/voice-stream.proof.ts` 用 `fakeStreamingAsr`（经 `test/support/fakes.ts:14` 再导出）。整句常量在 `:9`。三处断言必须保持：

- `:17` `r.transcript === ANS`
- `:36` `rDuplex.transcript === ANS`
- `:43` `r2.transcript === ANS`

证明头注释 `:1` 写的已有命令是 `pnpm vstream:prove`。根 `package.json:480` 把它转到 `pnpm -C packages/ai-runtime prove:vstream`。`packages/ai-runtime/package.json:20` 的脚本是 `tsx test/voice-stream.proof.ts`。

## §1 修法

只改 `streamingVoiceTurn` 里 `:235` 这一处写入。不改函数签名，不改返回字段名。

在该回合里记一个「还没有收下过 final」的标记，初值为否。不要用 `transcript` 是否为空来判断，避免第一句文本是空字符串时，下一句又被当成第一句覆盖进去。

遇到 `ev.final`：

- 标记仍为否：`transcript = ev.text`，然后把标记改为已收下。第一句因此仍是整段赋值，与现在的单句结果逐字相同，末尾不会多出一个换行。
- 标记已为是：`transcript = transcript + '\n' + ev.text`。中间恰好一个换行（U+000A）。不覆盖。不 trim 任一句，不去重，不把句末标点改掉，不用空格，不用 `\r\n`，也不插入第二个换行。

`:236` 的 partial 分支保持原样：只 `partials++` 并 `hooks.onPartial?.(ev.text)`，不写入 transcript。partial 出现在两句 final 之间时，也仍然不写入。

三句 final 的文本若依次是 `a`、`b`、`c`，结果是 `a`、换行、`b`、换行、`c`。

## §1.3 否决

- 否决覆盖式保留：不许继续用后一句 final 整段替换 `transcript`。
- 否决改 partial 也入稿：`final: false` 不得写入 `transcript`。
- 否决改百炼解析：`:94` 仍把 `sentence.text` 放进事件，`final` 仍是 `sentence_end`。
- 否决新开证明文件：不新增证明文件，也不新开 npm script。两句 final 的断言只加在已有 `packages/ai-runtime/test/voice-stream.proof.ts`。
- 否决跑真实语音：不跑真实 ASR，不连百炼，不购买云资源，不新增环境变量。
- 同时否决：改 `fakeStreamingAsr` 的单句输出；改 `:221-227` 与 `:234` 的打断逻辑；把 `:17`、`:36`、`:43` 的整句相等断言改松或删掉。

## §2 门

执行时只在 `packages/ai-runtime/test/voice-stream.proof.ts` 增加两句 final 的断言，并跑已有的语音流证明。不要改 `fakeStreamingAsr`。两句场景在该证明文件里就地提供一个只用于这条断言的 ASR，按下面顺序产出事件：

1. `{ text: '还没说完', final: false }`
2. `{ text: '前一句已经结束', final: true }`
3. `{ text: '后一句的前缀', final: false }`
4. `{ text: '后一句也结束了', final: true }`

断言 `transcript` 与 `前一句已经结束` 加一个换行再加 `后一句也结束了` 逐字相等。`还没说完` 与 `后一句的前缀` 都不得出现在 `transcript` 里。`partials` 为 2。已有三处 `=== ANS` 原样保留。问题与 TTS 继续用现成的假 TTS，不断言新的打断行为。

已有语音流证明命令：

- `pnpm vstream:prove`

另外必跑：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

`pnpm turbo lint` 必须是 0 errors。警告上限恰为：root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。这是各包现有的 `eslint --max-warnings`，其中 ai-runtime 写在 `packages/ai-runtime/package.json:14`。警告数低于上限可以通过，等于上限也可以。不许把任一上限改大。

## §8

draft:awaiting_pre_exec_dual

以上三处状态相同。产品代码本步不改。

## 状态复述

draft:awaiting_pre_exec_dual
