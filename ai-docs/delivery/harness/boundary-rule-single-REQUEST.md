# 两份数据边界文案收成生产正在使用的那一份

## §0 锚

基线完整 sha：`0cebd82b625cbf1b514eb161e34a18cbb3447a53`。下面行号与开头都在这个提交上亲读。

两句逐字节不相同。短句 151 个码点、395 个 UTF-8 字节。长句 220 个码点、594 个 UTF-8 字节。开头 20 个字相同，第 20 个字是空格（U+0020）。之后都先接 `消息中,`，再分开：短句接 `用户数据被一对**随机命名的`，长句接 `三类材料(用户原文/历史摘要/检索召回片段)被一对随机命名的`。

生产短句 `DATA_BOUNDARY_RULE`：

- 位置：`packages/ai-runtime/src/model-client.ts:198`
- 开头 20 个字：`【数据边界规则(稳定)】下面 user `

另一份 `UNTRUSTED_DATA_BOUNDARY_RULE`：

- 位置：`packages/domain/src/mem07-injection-fence.ts:53`
- 开头 20 个字：`【数据边界规则(稳定)】下面 user `

生产只拼短句。`packages/ai-runtime/src/model-client.ts:276` 的 system 是 `` `${req.system}\n${DATA_BOUNDARY_RULE}` ``。真正发出的提示用这一句。

`UNTRUSTED_DATA_BOUNDARY_RULE` 的引用只有：

- `packages/domain/src/mem07-injection-fence.ts:53` 定义；同文件 `:180` 赋给 `renderUntrustedDataFence` 的返回字段 `systemSuffix`
- `packages/domain/src/index.ts:476` 仍导出（`:473` 写明运行时尚未被 `model-client.ts` 消费）
- `packages/domain/test/mem07-injection-fence.proof.ts:24` 与 `:77`，只在证明里用

全库没有测试以外的文件调用 `renderUntrustedDataFence`，也没有测试以外的文件把 `UNTRUSTED_DATA_BOUNDARY_RULE` 拼进真正发出的提示。长句停在未接线的纯函数返回值上。本说明不缩短生产短句。

## §1 修法

生产 `DATA_BOUNDARY_RULE` 的字节保持不动。`packages/ai-runtime/src/model-client.ts:198` 那句一个字节不改，`:276` 拼进 system 的方式也不改。发出去的提示字节因此不变。

`UNTRUSTED_DATA_BOUNDARY_RULE` 改为与这句逐字节相同。可以改成引用同一常量，但生产提示字节不得变化。若两处改成引用同一常量，短句正文仍须与基线上的 `DATA_BOUNDARY_RULE` 逐字节相同，不得为了共用而改写短句。

`packages/domain/src/index.ts` 对 `UNTRUSTED_DATA_BOUNDARY_RULE` 的导出保留，不删除。

已有证明没有把旧长句写成字面量。`packages/domain/test/mem07-injection-fence.proof.ts:77` 只断言 `systemSuffix === UNTRUSTED_DATA_BOUNDARY_RULE`。落实时改为断言这两份现在逐字节相同，并且生产短句相对基线一个字节没变。若别处断言了旧长句，同样改成这个断言，不要留下旧长句。

不要把记忆摘要、召回或生命周期接到生产派发。不要让 `renderUntrustedDataFence` 进入发送路径。段标记可以留在未接线的纯函数里，不要为了收短文案而把这些段接到生产。不要改 ask 预算（`apps/worker/src/ask-context-budget.ts` 与它的调用）。

本说明是唯一允许新增的受管文件。落实时只改已有的常量和已有证明，不另增文件。

## §1.3 否决

否决：改写生产短句；删导出；把记忆原语接到生产；新迁移；新环境变量；调用模型。

## §2 门

从现有 `package.json` 读到的脚本：

- 根 `package.json`：`mem07-injection:prove` = `pnpm -C packages/domain prove:mem07-injection-fence`
- 根 `package.json`：`model-output-limit:prove` = `pnpm -C packages/ai-runtime prove:model-client-output-limit`
- `packages/domain/package.json`：`prove:mem07-injection-fence` = `tsx test/mem07-injection-fence.proof.ts`
- `packages/ai-runtime/package.json`：`prove:model-client-output-limit` = `tsx test/model-client-output-limit.proof.ts`
- `packages/ai-runtime/package.json`：`prove:model-client-dispatch` = `tsx test/model-client-dispatch.proof.ts`
- `packages/ai-runtime/package.json`：`prove:model-client-stream` = `tsx test/model-client-stream.proof.ts`

要跑：

- `pnpm mem07-injection:prove`
- `pnpm model-output-limit:prove`
- `pnpm -C packages/ai-runtime prove:model-client-dispatch`
- `pnpm -C packages/ai-runtime prove:model-client-stream`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`
- `node scripts/ai-docs/check-docs.mjs`

lint 上限恰为 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。这些数就是各包 `eslint . --max-warnings` 的现有上限（qdrant 在 `packages/qdrant-store`）。0 errors。低于上限算过。不得抬高上限。

不跑 `pnpm provider-egress:inventory` 与 `pnpm provider-egress:prove`，因为不调用模型、不新增供应商环境变量。不写迁移唯一性门。

这一刀不把能力项记为完成，因为记忆原语仍未接到生产。

## §8

draft:awaiting_pre_exec_dual

产品代码本步不改

draft:awaiting_pre_exec_dual

draft:awaiting_pre_exec_dual
