executed:awaiting_post_prove_dual

# 含首尾空白的租户标识改为拒绝

## §0 现场

`packages/db/src/tenant/index.ts` 的 `requireOwnerUserId` 在第 46–63 行。

- 第 47–52 行：入参不是字符串时抛 `tenant_owner_user_id_required`。
- 第 54–60 行：先做 `trim`。去掉首尾空白后长度为 0（全空白，含空串）时抛同一个 `tenant_owner_user_id_required`。
- 第 62 行：非空但含首尾空白时 `return trimmed`。`'  user-a  '` 现在返回 `'user-a'`。这是要改的静默裁剪。

同一文件里，行上所有者比较用的 `trim` 不是这次要改的：

- `assertTenantPredicate` 第 78 行：行上的所有者不是字符串，或去掉首尾空白后长度为 0，抛 `tenant_predicate_invalid`。
- 第 85 行：`const actual = rowOwnerUserId.trim()`，再用这个值与要求的所有者比较。
- 第 77 行会先对要求的所有者调用 `requireOwnerUserId`。要求侧跟着上面的函数走。行侧第 78 行和第 85 行的 `trim` 保留。

第 1–20 行文件头注释，以及第 39–45 行函数上方的说明，都不改。不删 `requireOwnerUserId`。

`buildRequiredOwnerFilter` 第 107 行、`enforceOwnerOnRow` 第 120 行只是把入参交给 `requireOwnerUserId`。这两处函数体不用另写裁剪。

`apps/api/src/modules/interview/interview.service.ts` 把 `requireOwnerUserId` 的返回值当作后续主体，交给 `asPrincipal`。限流键仍用未裁剪的入参 `principal`：

- 第 427–428 行：`begin` 用返回值作为 `asPrincipal` 的主体。这条路径没有按 principal 限流。
- 第 446 行的键是 `` `turn:${principal}` ``。第 448 行才取返回值，第 449 行把返回值交给 `asPrincipal`。
- 第 488 行同样是 `` `turn:${principal}` ``。第 490 行才取返回值，第 492 行把返回值交给 `asPrincipal`。
- 第 383 行 `voiceGate` 的键是 `` `voice:${principal}` ``。`transcribe` 第 569–574 行、`speak` 第 586–588 行、`speakStreamPrepare` 第 597–599 行都是先过这道闸，再用返回值作为 `asPrincipal` 的主体。

因此带首尾空白的标识今天会留在限流键里，库会话里却变成裁剪后的另一个值。调用方文件不用改。第 770 行的重试限流键用的是面试 id，不是 principal，不在这次范围内。

`packages/db/test/tenant-enforcement.proof.ts` 把含首尾空白的标识断言成裁剪后成功，等于把这个缺陷写成期望。三处是：

- 第 82–83 行：`requireOwnerUserId('  user-a  ')` 被断言等于 `'user-a'`。
- 第 104–107 行：`buildRequiredOwnerFilter('  owner-w  ')` 被断言得到 `value === 'owner-w'`。
- 第 108–113 行：形状列表里的 `' owner-2 '` 被 `buildRequiredOwnerFilter` 成功收下，再要求返回值去掉空白后长度大于 0。

第 76–77 行对全空白 `'   '` 已经要求抛 `tenant_owner_user_id_required`，这处保持。第 97–99 行对不含空白的 `'owner-z'` 要求原值绑上，这处保持。

## §1 修法

只改两个现有文件：`packages/db/src/tenant/index.ts` 里的 `requireOwnerUserId`，以及 `packages/db/test/tenant-enforcement.proof.ts` 里上面三处。不新增文件。不改迁移。

`requireOwnerUserId` 成功时返回入参原值，不再 `return trimmed`。含空白即拒绝，这里的空白指首尾空白：原串与 `trim` 的结果不同。判定是：

- 不是字符串：仍抛 `tenant_owner_user_id_required`。
- 空串，或去掉首尾空白后长度为 0：仍抛 `tenant_owner_user_id_required`。
- 非空但含首尾空白：改为抛 `tenant_owner_user_id_required`。禁止返回裁剪后的值。
- 没有首尾空白的非空字符串：返回入参本身。中间的空格不在 `trim` 会删掉的范围内，原样返回，不要因为中间有空格而拒绝，也不要改成别的值。

判断首尾空白时可以和 `trim` 的结果比较，但比较只用于决定是否拒绝。成功路径必须返回入参原值。

行侧比较仍先去掉空白：第 78 行和第 85 行保持 `trim`。不要把行侧改成含空白即拒绝，也不要删掉这两处 `trim`。

头注不动：第 1–20 行和第 39–45 行都不改。不删 `requireOwnerUserId`。`assertTenantPredicate`、`buildRequiredOwnerFilter`、`enforceOwnerOnRow` 的函数体不改。要求侧若含首尾空白，会因为调用 `requireOwnerUserId` 而拒绝；这是调用结果，不是再写一套裁剪。

调用方文件不改，包括 `apps/api/src/modules/interview/interview.service.ts`。限流键继续用未裁剪的 `principal`。没有首尾空白时，返回值与入参相同，`asPrincipal` 拿到的仍是原来的标识。含首尾空白的标识在 `requireOwnerUserId` 抛错，不再变成另一个主体。限流与取返回值的先后顺序保持现状。

证明只改 `packages/db/test/tenant-enforcement.proof.ts` 这一个现有文件。三处「裁剪后成功」改成含首尾空白即拒绝的负例，错误码都是 `tenant_owner_user_id_required`：

- 第 82–83 行：`'  user-a  '` 必须抛错，不得等于 `'user-a'`。同段用不含空白的 `'user-a'` 断言返回值就是这一原串。
- 第 104–107 行：`'  owner-w  '` 必须抛错，不得得到 `value === 'owner-w'`。
- 第 108–113 行：`' owner-2 '` 移出成功形状，单独断言 `buildRequiredOwnerFilter` 对它抛错。`'owner-1'` 和 64 个 `'x'` 仍成功，值就是入参原串，谓词形状仍是恰好 `column` 与 `value` 两项。

第 70–80 行的非字符串、空值与全空白负例，以及第 97–99 行干净标识的成功形状，都保留。不新建证明文件。

## §1.3 否决

- 不改行侧比较的 `trim`（第 78 行、第 85 行）。
- 不改头注（第 1–20 行、第 39–45 行）。
- 不改调用方。限流键不改成裁剪后的值，也不改成先裁再限流。
- 不新建文件，不新建证明文件。
- 不碰迁移，不新增迁移。
- 不删 `requireOwnerUserId` 这一层。
- 不把可选数据库连接写成必跑项，不新增供应商环境，不另列出站检查。

## §2 现有证明与文档检查

- 现有证明文件：`packages/db/test/tenant-enforcement.proof.ts`。`packages/db/package.json` 第 45 行的脚本名是 `tenant-enforcement:prove`，脚本内容是 `tsx test/tenant-enforcement.proof.ts`。全命令：`pnpm --filter @meetwise/db tenant-enforcement:prove`。
- 文档检查：`node scripts/ai-docs/check-docs.mjs`。

没有新的供应商环境。证明在没有 `DATABASE_URL`、也没有成套 `PG*` 时，会跳过第 293 行起的可选数据库路径。标识断言不依赖那条路径。

## §8 状态

executed:awaiting_post_prove_dual

本文件只记录上述改法。这次只增加本说明，不改产品代码，不改证明，不新增迁移。

## 文末

executed:awaiting_post_prove_dual

## §9-EXEC

实际改动的文件：

- `packages/db/src/tenant/index.ts`：只改 `requireOwnerUserId`。去掉首尾空白后长度为 0，或 `trim` 结果与入参不同，都抛 `tenant_owner_user_id_required`。成功路径返回入参原值，不返回裁剪后的另一个字符串。函数仍在第 46–63 行；判定在第 55 行，返回在第 62 行。第 1–20 行头注、第 39–45 行函数说明未改。行侧比较仍在第 78 行和第 85 行使用 `trim`。`buildRequiredOwnerFilter` 第 107 行、`enforceOwnerOnRow` 第 120 行函数体未改。
- `packages/db/test/tenant-enforcement.proof.ts`：三处含首尾空白的成功断言改为同一错误码的负例。`'  user-a  '` 在第 82–88 行抛错且不得等于 `'user-a'`；不含空白的 `'user-a'` 在第 89–91 行断言返回值就是这一原串。`'  owner-w  '` 在第 113–118 行抛错，不得得到 `value === 'owner-w'`。`' owner-2 '` 在第 128–129 行单独抛错。`'owner-1'` 与 64 个 `'x'` 在第 119–127 行仍成功，值就是入参原串，谓词恰好 `column` 与 `value` 两项。全空白 `'   '` 仍在第 76–77 行。不含空白的 `'owner-z'` 仍在第 106–108 行。可选数据库路径现从第 309 行起；上文写的第 293 行是改证明之前的位置。没有 `DATABASE_URL` 时跳过该路径，本次证明日志即此情况。
- 本说明：三处状态改为同一个 `executed:awaiting_post_prove_dual`，并追加本节。未改上文。

两道门退出码都是 0：

- `pnpm --filter @meetwise/db tenant-enforcement:prove` 退出码 0。
- `node scripts/ai-docs/check-docs.mjs` 退出码 0。公共文本扫描 2288 个受管文件，不超过 2296。未新增受管文件。

## §9-EXEC-rev

类型检查认为按下标读取的成功形状可能为空。先把两项取出来，判空后再读列和值。含首尾空白仍拒绝。没有首尾空白时仍返回原值。断言没有变弱。
