draft:awaiting_pre_exec_dual

# 题库控制权解锁失败时丢掉这条连接

基线 `2af55cce96efdc12e358fd0e3c8e870d690022ac`。本步只新增这一份说明，不改产品代码。

## §0 锚

行号是在基线 `2af55cce96efdc12e358fd0e3c8e870d690022ac`、分支 `line/provision-lock-release-draft` 上打开文件看到的。

### 0.1 会话级咨询锁

`packages/db/src/principal.ts` 的 `provisionQbankControlDefiner` 从第 291 行开始。第 292 行 `const c = await pool.connect()`。第 11 行 `export type Client = pkg.PoolClient`，所以 `c.release` 用的是 pg 的 `PoolClient.release`。

第 294–297 行说明：两路并发会在 `CREATE ROLE` 与 `ALTER ... OWNER` 上互相卡住，因此整段移交用一把会话级咨询锁串起来，事务回滚时也要在下面的 finally 里放开。

第 298 行：

`await c.query('SELECT pg_advisory_lock(hashtext($1))', ['meetwise:qbank_control_definer_provision']);`

键就是 `meetwise:qbank_control_definer_provision`。这是 `pg_advisory_lock`，不是事务级的 `pg_advisory_xact_lock`。锁挂在这条会话上，直到同一条连接解锁，或这条连接结束。

### 0.2 解锁失败被吞掉，随后无参放回

外层 finally 是第 558–561 行：

```
  } finally {
    await c.query('SELECT pg_advisory_unlock(hashtext($1))', ['meetwise:qbank_control_definer_provision']).catch(() => undefined);
    c.release();
  }
```

第 559 行解锁查询失败时，`.catch(() => undefined)` 把拒绝丢掉。第 560 行接着无参 `c.release()`。解锁没成功时，会话锁还在这条连接上。无参释放会把它放回池，下一轮借到它的人仍然占着这把锁。

第 555–557 行仍是失败时 `ROLLBACK` 再把原来的错误抛出去。内层 finally 在第 546–552 行，只做 `RESET ROLE` 和收回临时成员身份。这两处都不是本缺陷。

### 0.3 池在 err 为真时丢掉连接

打开的是 `node_modules/.pnpm/pg-pool@3.14.0_pg@8.22.0/node_modules/pg-pool/index.js`，`package.json` 里的版本是 `3.14.0`。

- 第 342 行：`client.release = this._releaseOnce(client, idleListener)`。
- 第 369–379 行 `_releaseOnce` 返回 `(err) => { ... this._release(client, idleListener, err) }`。同一条连接释放第二次会抛错。
- 第 382–384 行注释写的是 `release a client back to the poll, include an error to remove it from the pool`，函数是 `_release(client, idleListener, err)`。
- 第 392 行：`if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses)`。
- `err` 为真时进入这个分支，第 397 行 `return this._remove(client, this._pulseQueue.bind(this))`，不会再往下走到空闲列表。
- 第 172 行 `_remove(client, callback)`。第 173 行从 `_idle` 里摘掉（不在空闲列表里则摘不到）。第 179 行 `this._clients = this._clients.filter((c) => c !== client)`。第 181 行 `client.end(() => {`。连接结束，会话级锁跟着会话一起消失。
- `err` 为假时，还要第 392 行其余几项都不成立，才不会在这里移除。第 400–404 行过期客户端也会 `_remove`。这些都不成立时，第 427 行 `this._idle.push(new IdleItem(client, idleListener, tid))`，连接回到空闲列表。无参 `c.release()` 带进去的 `err` 是 `undefined`，正常用完的连接会走这条放回路径。

类型在 `node_modules/.pnpm/@types+pg@8.20.0/node_modules/@types/pg/index.d.ts` 第 312 行：`release(err?: Error | boolean): void`。`true` 也是真值，同样会进第 392 行。这里不写池大小，这段代码也没有把池大小当成丢连接的条件。

### 0.4 已有证明

搜过全仓 `provisionQbankControlDefiner`，以及 `packages/db/test` 里的 `pg_advisory_lock` 与 `pg_advisory_unlock`。

会调用这个函数的证明只有两份：

- `packages/db/test/qbank-handoff-closure.proof.ts` 第 152 行第一次调用，第 345 行第二次调用，第 348 行断言第二次重入成功。
- `packages/db/test/qbank-control-role.proof.ts` 第 172 行调用一次。

两份都没有看解锁失败之后的 `c.release`。要扩的是 `packages/db/test/qbank-handoff-closure.proof.ts`。另一份不改。

`packages/db/src/migrate-cli.ts` 第 45 行也调用这个函数，那是启动入口，不是证明。`packages/db/src/migrate.ts` 第 597–598 行解锁的是另一把键 `meetwise_migrations`，然后 `client.release()`，与本函数无关。

## §1 修法

只改 `packages/db/src/principal.ts` 里 `provisionQbankControlDefiner` 的外层 finally（第 558–561 行）。

锁键保持 `meetwise:qbank_control_definer_provision`。加锁仍是第 298 行的 `SELECT pg_advisory_lock(hashtext($1))`，解锁仍是 `SELECT pg_advisory_unlock(hashtext($1))`，参数仍是这一个键。

finally 改成下面这样：

1. await 解锁查询，去掉 `.catch(() => undefined)`。
2. 查询兑现：调用无参 `c.release()`。
3. 查询拒绝：在这个 finally 里面接住，不要让拒绝逃出去。逃出去会盖住第 555–557 行已经要抛的错误，也会把已经 `COMMIT` 的成功调用变成拒绝。调用方看见的结果保持现在的样子：解锁失败不另外成为这个函数的拒绝原因。
4. 接住的值是 `Error` 时，把同一个对象传给 `c.release`。不要再包一层新错误。`packages/config/tsconfig/base.json` 第 7 行是 `"strict": true`，没有把 `useUnknownInCatchVariables` 设成 false，catch 变量按 unknown 处理。`release` 只接受 `Error | boolean`。值不是 `Error` 时传入 `true`，这样第 392 行的 `err` 仍为真，走第 397 行的 `_remove` 和第 181 行的 `client.end()`。这种情况也不得改回无参 `c.release()`。

不改第 546–552 行的角色收回，不改第 555–557 行的回滚。不改角色语句，不新增迁移，不新增测试文件。

证明只扩 `packages/db/test/qbank-handoff-closure.proof.ts`。用现有的 `A(name, ok)`，用 `node:fs` 读取 `packages/db/src/principal.ts`。路径相对这份证明，不要把本机绝对路径写进证明。新断言只看 `provisionQbankControlDefiner` 里这把键的加锁与解锁：

- 解锁查询不再链式 `.catch(() => undefined)`。
- 解锁兑现之后的释放是无参 `c.release()`。
- 解锁拒绝的分支把该 `Error` 交给 `c.release`；不是 `Error` 时传入 `true`。这条分支里没有无参 `c.release()`。
- 加锁与解锁的键字符串仍都是 `meetwise:qbank_control_definer_provision`。

第 152、345、348 行的两次真实调用和重入断言保持原样。那两次只覆盖解锁成功：第二次能进去，说明上一把锁已经放开。它们证明不了解锁失败时连接被丢掉。失败路径以这条静态断言为准，对照 §0.3 的 `_release`。现有证明走真实库，不改函数签名就无法单让这次解锁失败，所以不另做运行时夹具。

`packages/db/test/qbank-control-role.proof.ts` 不改。

## §1.3 否决

- 否决改锁键。不改 `hashtext` 的参数，不换成别的锁函数，不让加锁和解锁各用一把键。
- 否决改角色语句。不改 `CREATE ROLE`、`ALTER ROLE`、`GRANT`、`REVOKE`、`OWNER TO`，也不改后面的 ACL 归一。
- 否决改其它 `c.release()`。本文件其余无参调用保持原样：第 611、640、667、701、725、742、1004、1021、1033、1155、1235、1252、1267、1334、1559、1626、2086、2098、2110、2126 行。`packages/db/src/migrate.ts` 第 598 行的 `client.release()` 也不改。
- 否决新增迁移。
- 否决解锁失败仍无参 `c.release()`。先 `.catch(() => undefined)` 再无参释放，就是现在的缺陷，不能留。
- 否决新增测试文件，也否决新的 script。
- 否决不改释放方式、改去换池或改池大小。池大小不在本修法里。

## §2 门

执行时跑这些已有命令：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`
- `pnpm qbank-handoff-closure:prove`。根 `package.json` 第 567 行，第 568 行转到 `pnpm -C packages/db prove:qbank-handoff-closure`，`packages/db/package.json` 第 32 行是 `tsx test/qbank-handoff-closure.proof.ts`。这是要扩的那份证明。
- `pnpm qbank-control-role:prove` 只复跑，不改文件。根 `package.json` 第 565 行，证明第 172 行仍调用同一函数。

各 `package.json` 里读到的 `--max-warnings` 是：root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265、config 0、db-mysql 0。错误数是 0。低于这些数可以通过。不许把这些数改大，也不要改对应的 `--max-warnings`。

## §8

draft:awaiting_pre_exec_dual

draft:awaiting_pre_exec_dual
