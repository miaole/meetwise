draft:awaiting_pre_exec_dual

# 对公下单没改到行时不能报已创建

基线 `2af55cce96efdc12e358fd0e3c8e870d690022ac`。本步只新增这一份说明，不改产品代码。行号是在这棵树上打开文件看到的。

## §0 锚

### 0.1 对公更新的返回值被丢掉

`apps/api/src/modules/commerce/commerce.service.ts` 的 `createOrder`（:71）。

:74 原文：`const offline = p.domain === 'enterprise' && dto?.channel === 'offline';`

:84 调用 `packages/db` 的 `createOrder`，只要订单 id。

:87 原文：

```
if (offline) await c.query("UPDATE payment_order SET channel='offline' WHERE id=$1 AND status='created'", [oid]);
```

这次 `c.query` 的返回值没有赋给变量。

:95 原文：

```
return { orderId, amountCents: p.amountCents, status: 'created', channel: offline ? 'offline' : 'online' };
```

`offline` 为真时，这里固定 `status: 'created'`、`channel: 'offline'`，不看更新到了几行。

### 0.2 订单仍是 created 时，更新应碰到 1 行

`packages/db/src/commerce/payment.ts` 的 `createOrder`（:8-44）在同键重放、且商品、金额、份数一致时返回已有 id（:40-43）。渠道不在这次比较里。

服务层 :87 的条件是这个 id，并且 `status='created'`。订单仍是 `created` 时，这句应更新到 1 行。这时返回 `created` 与 `offline` 是对的。

### 0.3 更新不到 1 行仍报 created

`packages/db/sql/11_commerce.sql:13` 的 status 只允许 `created`、`paid`、`failed`、`refunded`。:14 的 channel 缺省是 `online`。

:87 要求 `status='created'`。订单已经不是 `created` 时，这句更新到 0 行，:95 仍报 `created`。这是谎报。

两条已经存在的出路会把 status 带离 `created`：

- `packages/db/sql/23_api_gateway.sql:384-385` 把仍是 `created` 的订单改成 `failed`，不改 channel，也不入账。
- `packages/db/src/commerce/payment.ts:78-81` 的线上入账把 `created` 且 `channel='online'` 的订单改成 `paid`。

这两种之后再走对公下单重放，都会回到 :87，并碰到 0 行。同键能走到这里，是因为 :40-43 只比较商品、金额、份数。

### 0.4 现有 getOrder 读不出 channel

`packages/db/src/commerce/payment.ts:46-50` 原文：

```
export async function getOrder(c: Client, owner: string, id: string): Promise<{ id: string; status: string; units: number; amountCents: number; productId: string } | null> {
  const r = await c.query('SELECT id, status, units, amount_cents, product_id FROM payment_order WHERE id=$1', [id]);
```

SELECT 没有 `channel`，返回类型也没有 `channel`。第二个参数 `owner` 没有出现在这句 SQL 里。行是否可见仍由调用方事务里的行级策略决定。

`commerce.service.ts:3` 已经 import 了这个函数。同文件 :104 用它取 `productId`。:161-164 再包一层，没有行时抛 `{ error: 'not_found' }`。

## §1 修法

只处理对公分支这一次 UPDATE 的行数。线上单不走这条检查。

### 1.1 只在 offline 分支看这次 UPDATE 的 rowCount

保留 :87 的 SQL 原文。不要拿掉 `status='created'`，也不要改成能改写已经支付或已经失败的行。把这次查询的返回值接住。判断放在同一次 `asPrincipal` 回调里。

- `rowCount === 1`：维持返回 `status: 'created'`、`channel: 'offline'`。金额仍用 :95 的 `p.amountCents`。
- `rowCount !== 1`：调用已经 import 的 `getOrder(c, principal, oid)`。不要为这次读再开事务，也不要改走 :161 的方法。
  - 读到行：用该行的 `status` 与 `channel` 填响应。不要改写成 `created`，也不要在更新没碰到行时仍写 `offline`。金额仍用 `p.amountCents`，不要改用行上的金额。
  - 读不到行：抛与 :163 相同的 `HttpException({ error: 'not_found' }, 404)`。不要另造错误码，不要返回 `created`。

`offline` 为假时不要执行这句 UPDATE，也不要做这次行数检查。响应仍是 :95 的 `created` 与 `online`。

`rowCount === 1` 包括同键重放且订单仍是 `created`。这时不要改去读库再换一套状态。

### 1.2 只给已有 getOrder 补上 channel

`payment.ts:47` 的 SELECT 补上 `channel`，返回类型补上 `channel`。WHERE 仍是 `id=$1`。不要把 `owner` 补进 WHERE，那不是这次要修的事。

不要改 `payment.ts:8-44` 的插入、`ON CONFLICT DO NOTHING`、`idempotency_replay_missing`、`idempotency_key_conflict`。

:104-106 只看 `productId`。不要改这个判断。

`apps/api/src/modules/commerce/commerce.controller.ts:52-53` 的 `GET /commerce/orders/:id` 直接返回这个对象。补列之后，这个 GET 的 JSON 会多出 `channel`。不要另写一条查询，也不要改这个 GET 去删字段。

不要改 `packages/contracts/src/index.ts:254` 的 `CreateOrderDto`，也不要改 :298 的 `OrderResult`。下单响应今天已经在 :95 带了 `channel`，控制器没有用这个 schema 再滤一遍。

## §1.3 否决

- 改价。金额继续用产品表上的 `amountCents`。不改份数，不改商品表。
- 改线上单。`offline` 为假的路径保持返回 `created` 与 `online`。不改 webhook，不改入账。
- 新增迁移。不新增迁移文件，不改已有迁移。
- 新增测试文件。只扩下面点名的已有证明，不新建证明文件。
- `rowCount` 为 0 仍返回 `created`。读不到行时也不许返回 `created`。
- 改 `packages/db` 里 `createOrder` 的插入与幂等冲突语义。
- `rowCount === 1` 时改报别的状态。这时维持 `created` 与 `offline`。

## §2 门

要扩的已有证明是 `apps/api/test/enterprise-pay-s1.proof.ts`。它经 `POST /commerce/orders` 进入这个 `createOrder`。对公创建在段 [2] 的 :115-120（S1-2a）。那里没有幂等键，断言的是库里的 channel 和 status，不是响应体的 `status` 与 `channel`。

幂等键从 `apps/api/src/modules/commerce/commerce.controller.ts:30` 的请求头 `idempotency-key` 进入。该证明的 `h.post` 第二个参数就是请求头（`apps/api/test/_neg-harness.ts:326`）。

命令是 `pnpm entpay:s1:prove`。根 `package.json` 把这条接到 `node scripts/run-e2e-isolated.mjs entpay:s1:prove`。

只扩这一份文件里的两处：

1. 段 [2]，S1-2p（:192）之后、段 [3]（:194）之前。使用一把新的幂等键。商品用已有的 `ent_pack_50`（`commerce.service.ts:42`，金额 39900），`channel` 为 `offline`，招聘方仍用本文件的 `recAuth`。
   - 同一键连下两次，此时订单仍是 `created`。两次都是 200，同一个 `orderId`，响应 `status` 为 `created`、`channel` 为 `offline`，金额仍是 39900。库里仍是一行，status 为 `created`，channel 为 `offline`。
   - 再用本文件已有的置败口把这一单改成 `failed`：`POST /admin/offline-remits/${id}/fail`，请求形状与 :177 相同。`23_api_gateway.sql:384-385` 只在 status 仍是 `created` 时改成 `failed`，不改 channel，也不入账。不要走确认口，以免在段 [3] 读取企业桶合计之前多入一笔。
   - 然后用同一键、同一商品、`channel: 'offline'` 重放。必须 200，同一个 `orderId`，响应 `status` 为 `failed`、`channel` 为 `offline`，金额仍是 39900。不得是 `created`。库里 status 仍是 `failed`，channel 仍是 `offline`。

2. S1-5f（:262）之后、`await done()`（:264）之前。先用另一把新键、`channel: 'online'` 下 `ent_pack_50`，再走本文件已有的支付回调，使库内成为 `paid` 且 channel 为 `online`（缺省见 `11_commerce.sql:14`，线上分支不会执行 :87）。然后同一键改以 `channel: 'offline'` 重放。:40 不比较渠道，所以会执行 :87；status 已不是 `created`，更新到 0 行。响应必须是 `paid` 与 `online`，同一个 `orderId`，不得是 `created` 与 `offline`。库里 status 仍是 `paid`，channel 仍是 `online`。放在 S1-5f 之后，是为了不改段 [3] 已经取过的桶合计。

不要改 `apps/api/test/neg-commerce.proof.ts`。它也调用这个 `createOrder`，但 :336-343 只下 `pack_10` 与 `pack_30`，不进入对公分支。线上路径不改，所以这个文件不改。只复跑 `pnpm neg:commerce`。

另外必跑：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

lint 必须 0 errors。各包已经写着的 `--max-warnings` 不许改大：root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant-store 27、ai-graphs 47、contracts 265、db-mysql 0、config 0。低于上限可以通过。

## §8

draft:awaiting_pre_exec_dual

以上三处状态相同。本步只新增这一份说明，不改产品代码。

draft:awaiting_pre_exec_dual
