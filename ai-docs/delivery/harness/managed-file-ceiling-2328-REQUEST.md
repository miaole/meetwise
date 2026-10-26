executed:awaiting_post_prove_dual

# 受管文件上限再增加八份

本步只新增这份说明。不改产品代码，也不改 `scripts/ai-docs/public-text-policy.mjs` 里的数字。

## §0 现状

核对时分支是 `line/managed-file-ceiling-2328-draft`，HEAD 是 `c0e923dc5ab5ba0705ec6bb935c10312f5e98a13`，工作区干净。下面的行号是这次读到的行号。

`scripts/ai-docs/public-text-policy.mjs`：

- 第 132 行是常量的唯一定义：`const MAX_FILES = 2_320;`。现在的上限是 2320。
- 第 344 行用这个常量比较：`if (paths.length > MAX_FILES)`。
- 第 401 行再用同一个常量比较：`if (!Array.isArray(listed.paths) || listed.paths.length > MAX_FILES)`。

`scripts/ai-docs/public-text-policy.proof.mjs` 里随这个上限联动的断言：

- 第 324 行：`for (let i = 0; i < 2_320; i += 1)`。循环造出恰好 2320 个路径。
- 第 330 行：`assert.equal(atCap.valid, true, atCap.errors.join('\n'))`。恰好达到上限仍然通过。
- 第 331 行：`assert.equal(atCap.scannedFiles, 2_320)`。
- 第 332 行写明第 2321 个注入路径触发早返回。第 333 行写明错误串恰为 `PTP_FILE_LIMIT:2321`。
- 第 334 行把再多的一个路径写成 `'ai-docs/f-2320.md'`。
- 第 335 行：`assert.equal(overCap.valid, false)`。再多一个文件仍然拒绝。
- 第 336 行：`assert.equal(overCap.scannedFiles, 0)`。
- 第 337 行：`assert.deepEqual(overCap.errors, [`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2321`])`。

## §1 改法

只把 `MAX_FILES` 从 2320 改成 2328。第 132 行的 `2_320` 改成 `2_328`。步进只能是加 8。不要改成刚好等于当前扫描数，也不要取消上限。

第 344 行和第 401 行两处比较仍用同一个常量，不改成数字字面量。

证明要改的具体断言在已有文件 `scripts/ai-docs/public-text-policy.proof.mjs`。不新增受管文件。证明文件已经存在，只改数字。语义不变：恰好达到上限仍通过，再多一个文件仍拒绝。数字跟着新上限走。

- 第 324 行：`i < 2_320` 改为 `i < 2_328`。
- 第 331 行：`scannedFiles, 2_320` 改为 `scannedFiles, 2_328`。
- 第 332 行的「第 2321 个」改为「第 2329 个」。第 333 行的 `PTP_FILE_LIMIT:2321` 改为 `PTP_FILE_LIMIT:2329`。
- 第 334 行：`'ai-docs/f-2320.md'` 改为 `'ai-docs/f-2328.md'`。
- 第 337 行：`FILE_LIMIT:2321` 改为 `FILE_LIMIT:2329`。
- 第 330 行仍断言通过。第 335 行仍断言拒绝。第 336 行的扫描数仍是 0。

不放宽任何 lint 上限。不改价格、迁移、环境变量。

合计仍是 229/271。能力项完成 33、半成 2、未收 14 维持。

为什么现在要加：主线扫描 2317，上限 2320，余 3。已经在写、但还没进入主线的新说明有三份。再写下一份就会超过 2320。这份说明写入前，本工作树按同一受管路径规则点数也是 2317。

## §1.3 不改的范围

不改 lint 上限。不改扫描规则的其它判断。不把上限改成 2320 以外的别的步长。

扫描规则里保持不动的判断包括：哪些路径算受管文件、错误串的形状、单文件字节上限，以及第 344 行和第 401 行以外的早返回条件。两处长度比较继续写成大于同一个 `MAX_FILES`。历史注记不改。允许的步进只有一种：从 2320 加 8，得到 2328。

## §2 门

根目录 `package.json` 第 30 行已有脚本 `public-text-policy:prove`，命令是 `node scripts/ai-docs/public-text-policy.proof.mjs`。用这个现有脚本，不新造脚本。改数字之后按下面的顺序跑：

1. `pnpm public-text-policy:prove`
2. `node scripts/ai-docs/check-docs.mjs`
3. `pnpm turbo typecheck --force`
4. `pnpm turbo lint`

## §8

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

`scripts/ai-docs/public-text-policy.mjs` 的 `MAX_FILES` 从 `2_320` 改为 `2_328`。常量上一行写明上限从 2320 加 8 到 2328，恰达上限仍通过，多一个仍拒绝。两处比较仍是 `paths.length > MAX_FILES` 与 `listed.paths.length > MAX_FILES`。

`scripts/ai-docs/public-text-policy.proof.mjs` 恰好达到改为 `2_328`，再多一个改为 `2329`，注入路径改为 `ai-docs/f-2328.md`。恰好达到仍通过，再多一个仍拒绝，拒绝时扫描数仍是 0。

开头、§8 与文末三处状态同为 `executed:awaiting_post_prove_dual`。

退出码：

1. `pnpm public-text-policy:prove` EXIT=0，12/12。
2. `node scripts/ai-docs/check-docs.mjs` EXIT=0，扫描 2318，不超过 2328。
3. `pnpm turbo typecheck --force` EXIT=0，8/8。
4. `pnpm turbo lint` EXIT=0，0 errors。警告为根 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265、config 0、db-mysql 0，均未超过既有上限。
