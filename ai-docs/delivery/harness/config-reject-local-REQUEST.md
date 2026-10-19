executed:awaiting_post_prove_dual

# 生产环境拒绝本机数据库地址

## §0 现场

亲读 `packages/db/src/principal.ts`。分支 `line/config-reject-draft`，HEAD `a3516e9c943b3fc891e13a76e21df3bf0a6f5669`。

`invalidDatabaseConfig`（第 752–754 行）返回类型是 `never`。正文是抛出 Error，消息由前缀 `database_config_invalid:` 接上代码。代码为 `production_local_database_host` 时，抛出原文是 `database_config_invalid:production_local_database_host`。不返回假，也不只打日志。

`resolveDatabaseConnectionString`（第 761–794 行）在生产环境拒绝本机主机，两处都调用上面的抛错：

- 第 780–781 行：已经有 URL 时，`(process.env.NODE_ENV ?? '').toLowerCase() === 'production'` 并且 `isLocalDatabaseHost(parsed.hostname)` 为真。
- 第 791–792 行：走 PG 组件时，同一生产判断并且 `isLocalDatabaseHost(components.host)` 为真。

`NODE_ENV` 先转小写，再与 `production` 比较。

`isLocalDatabaseHost`（第 818–830 行）先做 `host.replace(/^\[|\]$/g, '').replace(/\.$/, '').toLowerCase()`，再判断：

- `localhost`：规范化后与 `localhost` 全等。裸 `localhost` 因此拒绝。只多一个尾点的 `localhost.` 会先被去掉尾点，再与 `localhost` 全等，因此也拒绝。
- `127.0.0.1`：正则 `/^127(?:\.\d{1,3}){3}$/` 要求 `127` 后面恰好三段点分数字。`127.0.0.1` 命中。`127.0.0.2` 同样命中。
- `::1`：规范化后与 `::1` 全等。首尾方括号会先被去掉，所以主机名 `[::1]` 也会变成 `::1` 并拒绝。
- 同一返回式还把 `postgres`、`0:0:0:0:0:0:0:1`、IPv4 映射回环和链路本地地址视为本机。这些词不改，也不另加点名。

本工作树的 `node` 读到：`new URL('postgresql://app:pw@[::1]:5432/meetwise').hostname` 是 `[::1]`（带方括号）；`postgresql://app:pw@localhost.:5432/meetwise` 的 hostname 是 `localhost.`（带尾点）；`postgresql://app:pw@localhost:5432/meetwise` 的 hostname 是 `localhost`。

`packages/db/test/principal-config.proof.ts` 已有三则生产抛错断言，错误都是 `database_config_invalid:production_local_database_host`：

- 第 52–54 行：`NODE_ENV=production`，`PGHOST=127.0.0.1`。
- 第 56–58 行：`PGHOST=127.0.0.2`。
- 第 60–62 行：`DATABASE_URL` 主机为 `localhost.`。

裸 `localhost` 和裸 `::1` 没有单独点名。

`ai-docs/delivery/harness/product-campaign-LEDGER.md` 检索 `production_local_database_host` 为零命中。没有把这件事记成已经结束的行。

## §1 修法

不改 `isLocalDatabaseHost`。不改 `invalidDatabaseConfig`。不改 `resolveDatabaseConnectionString`。

只在已有 `packages/db/test/principal-config.proof.ts` 增加点名断言。错误仍是 `database_config_invalid:production_local_database_host`。不新增文件。断言调用 `resolveDatabaseConnectionString`，与第 54、58、62 行相同。沿用该文件已有的 `reset`、`A`、`errorCode`。

1. 生产环境，`DATABASE_URL` 为 `postgresql://app:pw@localhost:5432/meetwise`（主机是裸 `localhost`，没有尾点）。断言错误原文如上。
2. 生产环境，`PGHOST` 为裸 `::1`，其余 PG 组件与第 52 行同形。断言错误原文如上。
3. URL 的 `hostname` 带方括号，所以同一证明再点名 `DATABASE_URL` 为 `postgresql://app:pw@[::1]:5432/meetwise`。判定函数已经会去掉首尾方括号。这一则只补证明，不改判定。错误原文仍如上。

## §1.3 否决

- 不改拒绝词表。
- 不改抛错函数。
- 不把生产本机库改成返回假，也不改成只打日志。
- 不新建证明。
- 不新增迁移。
- 不改受管文件上限。
- 不新增供应商环境。

## §2 门

`packages/db/package.json` 第 41 行的脚本名是 `prove:principal-config`，命令是 `tsx test/principal-config.proof.ts`。实际入口：

`pnpm --filter @meetwise/db prove:principal-config`

文档门：

`node scripts/ai-docs/check-docs.mjs`

文档门必须退出码 0，扫描数必须 ≤2296。本说明是唯一新增文件。

## §8

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

`packages/db/test/principal-config.proof.ts` 在原有三则之后追加三则。生产环境下都抛 `database_config_invalid:production_local_database_host`：

- 第 64–66 行：`DATABASE_URL` 为 `postgresql://app:pw@localhost:5432/meetwise`，主机是裸 `localhost`。
- 第 68–70 行：`PGHOST` 为裸 `::1`，其余 PG 组件与第 52 行同形。
- 第 72–74 行：`DATABASE_URL` 为 `postgresql://app:pw@[::1]:5432/meetwise`。本工作树的 `node` 读到该 URL 的 hostname 是 `[::1]`（带方括号）。

第 52–54、56–58、60–62 行未改。`packages/db/src/principal.ts` 未改。

- `pnpm --filter @meetwise/db prove:principal-config` EXIT=0
- `pnpm --filter @meetwise/db exec tsc -p tsconfig.json --noEmit` EXIT=0
- `node scripts/ai-docs/check-docs.mjs` EXIT=0，扫描 2289

三处状态同为 `executed:awaiting_post_prove_dual`。
