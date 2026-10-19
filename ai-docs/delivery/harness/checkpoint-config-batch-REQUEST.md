draft:awaiting_pre_exec_dual

# 检查点连接把三次配置合成一次往返

## §0 看到的现行代码

文件：`apps/worker/src/checkpoint-principal.ts`。

`PrincipalBoundCheckpointPool.query` 在第 155–163 行。它本身没有写配置。第 156 行调用 `this.connect()`，用完在 `finally` 里走 `releaseAsync`（第 160–161 行）。因此每次 `query()` 在执行调用方语句之前，都会先付设置成本，返回连接池之前再付清理成本。

三次独立 `set_config` 写在 `connect()` 里，不是写在 `query()` 的函数体里：

- 第 141 行：`SET ROLE app_role`（单独一次往返）。
- 第 142 行：`set_config('app.principal_user', $1, false)`，值是 `access.owner`。
- 第 143 行：`set_config('app.checkpoint_thread_id', $1, false)`，值是 `access.threadId`。
- 第 144 行：`set_config('app.checkpoint_epoch', $1, false)`，值是 `String(access.fenceEpoch)`。

这三行各是一次 `client.query`，第三参都是 `false`（会话级，不是局部）。

清理在 `cleanupCheckpointPrincipalSession`（第 67–83 行），由释放路径第 99 行调用，不在 `query()` 体内：

- 第 55 行：`GUC_KEYS` 列出上述三个配置名。
- 第 79 行：`SET ROLE NONE`（单独一次往返）。
- 第 80–82 行：按 `GUC_KEYS` 循环。第 81 行虽是一行 `SELECT set_config($1, $2, false)`，运行时对三个名字各往返一次，值都是空串 `''`。

第 61–62 行和第 140 行写明：`SET LOCAL` 或 `set_config(..., true)` 盖不住自动提交读，读路径会失败。第 126 行同样禁止只靠 `SET LOCAL`。第 74–78 行写明角色复位不能改成另两种写法来代替 `SET ROLE NONE`。

取得连接失败时，第 150 行仍是 `client.release(true)`，不把半设置的连接还回池。测试用的清理替换在第 70–72 行：一旦设上，就整段跳过正常清理。

现有证明文件：`apps/worker/test/uc052-pool-role-leak.proof.ts`。它不数往返。第 54–56 行用 `current_setting` 读回三个配置，空串经 `nullif(..., '')` 变成未设置。第 69–71 行要求三者都空。第 73–77 行要求当前角色回到会话用户。第 138–165 行在同一次连接复用上核对「设置期间三个值都在、释放后都清掉」。第 177 行是证明在事务中途自己写的一次 `app.principal_user`，用来看中止之后是否还能清干净；那不是产品设置这三个配置的地方。

`apps/worker/package.json` 第 103 行的脚本名是 `prove:uc052-pool-role-leak`，命令是 `tsx test/uc052-pool-role-leak.proof.ts`。

## §1 修法

只改两个现有文件：

- `apps/worker/src/checkpoint-principal.ts`
- `apps/worker/test/uc052-pool-role-leak.proof.ts`

不新增文件。不改 `query()` 的函数体去再写一遍配置。`query()` 已经通过 `connect()` 设置；改第 142–144 行才能让 `query()` 和直接 `connect()` 一起少往返。

设置：删掉第 142–144 行的三次独立 `client.query`，改成一次 `client.query`。一条 `SELECT` 的选择列表里调用三次 `set_config`，例如：

```sql
SELECT set_config('app.principal_user', $1, false),
       set_config('app.checkpoint_thread_id', $2, false),
       set_config('app.checkpoint_epoch', $3, false)
```

参数仍是 `[access.owner, access.threadId, String(access.fenceEpoch)]`。配置名、值、第三参 `false` 都不变。纪元继续用 `String(access.fenceEpoch)`，不要改格式。

清理：删掉第 80–82 行的循环，改成同样形状的一次 `client.query`。三个配置名不变，三个值都是空串 `''`，第三参仍是 `false`。`GUC_KEYS` 可以继续作为这三个名字的来源，供这一次查询使用，避免常量闲置；不要去掉其中任何一项。

不要用分号把多条命令串成一次发送。参数查询只承载一条语句。三次 `set_config` 必须出现在同一条 `SELECT` 里。这与「一条语句里三次 `set_config`」或等价的单次查询是同一件事。

角色切换语义不变，并且不要放进这条 `SELECT`：

- 取得连接后仍先执行第 141 行的 `SET ROLE app_role`，再执行那一条三次 `set_config`。
- 归还前仍先执行第 79 行的 `SET ROLE NONE`，再执行那一条清空用的三次 `set_config`。
- 不改成第 74–78 行已经否定的角色复位写法。

其余路径保持原样：第 70–72 行的测试替换仍整段跳过正常清理；第 94–96 行在带错误释放时仍直接销毁、不跑清理；第 101–103 行清理抛错时仍销毁连接；第 148–151 行 `connect()` 失败时仍 `release(true)`。

证明只改 `apps/worker/test/uc052-pool-role-leak.proof.ts` 这一个现有文件。保留现有的结果核对：设置期间角色是 `app_role`，三个配置分别等于所有者、线程和纪元的字符串；释放后三者都是空（按现有 `nullif` 读法），当前角色回到会话用户；中止事务后下一次取出仍干净；清理失败时连接被销毁；下一次仍能绑上另一组所有者、线程和纪元。另外在这个文件里核对产品源码形状：设置三个配置只有一条 `client.query`，SQL 同时含三个配置名且每个 `set_config` 的第三参都是 `false`；清空同样只有一条，三个值都是空串；按键循环逐次 `query` 不再存在；`SET ROLE app_role` 与 `SET ROLE NONE` 仍各是单独语句。第 177 行那次自行写入留下，不删，也不算进要合并的三次。

## §1.3 否决

- 不改成 `SET LOCAL`，也不把 `set_config` 的第三参改成 `true`。第 60–62 行和第 140 行已说明：保存器的读走自动提交，没有包住这些设置的事务。局部设置在读路径会失败。`is_local=false` 的语义保持不变。
- 不删配置项。`app.principal_user`、`app.checkpoint_thread_id`、`app.checkpoint_epoch` 三个都要设置，清理时三个都要写成空串。少设任何一个都会让现有读回核对失败，也会把不该留下的会话值还回池。
- 不新增迁移。这只改连接上的会话配置怎么发送，不改表，不改策略定义，不新增 SQL 文件。

## §2 证明与文档检查

- 现有证明的脚本：`apps/worker/test/uc052-pool-role-leak.proof.ts`。`apps/worker/package.json` 第 103 行的脚本名是 `prove:uc052-pool-role-leak`，命令是 `tsx test/uc052-pool-role-leak.proof.ts`。
- 文档检查：`node scripts/ai-docs/check-docs.mjs`。

## §8

draft:awaiting_pre_exec_dual

本文件只记录上述改法。这次只增加本说明，不改产品代码，不新增代码或迁移文件。

draft:awaiting_pre_exec_dual
