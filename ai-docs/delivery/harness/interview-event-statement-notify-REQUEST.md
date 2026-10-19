executed:awaiting_post_prove_dual

# 面试事件通知改为按语句发送

本文件只说明改法。本提交不新增迁移，不改产品代码，不改已有证明。行号均在工作树 `meetwise-iss138`、分支 `line/notify-statement-draft`、提交 `a3516e9c943b3fc891e13a76e21df3bf0a6f5669` 上亲读。

## §0 现场

### 0.1 现有通知迁移

`packages/db/migrations/0143_sse_push_notify.sql` 共 37 行。不是每一行都在调用 `pg_notify`。函数体里只有第 26 行这一次：

`PERFORM pg_notify('interview_event_ch', NEW.stream_key);`

因为触发器是按行触发，所以每插入一行就执行这一次。

- 函数名：第 19 行 `sse_event_notify_after_insert()`。第 20 行 `RETURNS trigger`。第 22 行 `SECURITY INVOKER`。第 23 行 `SET search_path = pg_catalog, public`。第 27 行 `RETURN NEW`。
- 第 31 行：`REVOKE ALL ON FUNCTION sse_event_notify_after_insert() FROM PUBLIC, app_role;`。没有 `GRANT`。
- 触发器名：第 33–34 行 `interview_event_sse_notify`，作用在 `interview_event`。
- 第 34–37 行：`AFTER INSERT`，并且是 `FOR EACH ROW`。
- 通道名：`interview_event_ch`。载荷是 `NEW.stream_key`，不是 JSON，也不带 owner、kind 或事件正文。

在 `packages/db/migrations` 里检索 `sse_event_notify_after_insert` 与 `interview_event_sse_notify`，可执行定义只出现在这个文件。`0144_db_trigfam_unify.sql` 第 16 行只在注释里提到文件名排序，第 22–23 行写明该文件自己零 `CREATE`/`DROP TRIGGER`。没有更后的迁移替换该函数或该触发器。

`packages/db/migrations` 目录里前缀最高的文件是 `0213_interview_job_autovacuum_reloptions.sql`。没有以 `0214_` 开头的文件。下一号用 `0214`。空号不拿来占用。目录里没有把临时探针名当成已落地迁移。

`packages/db/migrations/0001_baseline.sql` 第 41 行：`stream_key text NOT NULL`。

### 0.2 产品插入

`packages/db/src/interview/interview-event.ts` 的 `appendEvent` 是一条插入语句，最多插入一行，不是多行 `VALUES`。

- 第 22 行：`pg_advisory_xact_lock(hashtext($1))`，锁在事务内。
- 第 23–25 行：有 `event_key` 时先读已有 `seq`。
- 第 29–33 行：`INSERT INTO interview_event ... SELECT $1,$2,COALESCE(MAX(seq),0)+1,... FROM interview_event WHERE stream_key=$2`，`ON CONFLICT (stream_key,event_key) WHERE event_key IS NOT NULL DO NOTHING`，`RETURNING seq`。无 `GROUP BY` 的聚合只产生一行。
- 第 37–39 行：冲突后零行时再读已有 `seq`。

这条路径不改。事务锁和 `event_key` 不改。

### 0.3 监听与泵

`apps/api/src/platform/sse-notify.service.ts`

- 第 28 行：`SSE_NOTIFY_CHANNEL = 'interview_event_ch'`。
- 第 29 行：`SSE_NOTIFY_TRIGGER_NAME = 'interview_event_sse_notify'`。
- 第 309–318 行：事件通道把 `message.payload` 直接当作流键。不解析 JSON。第 311 行的 token 通道和第 312 行的吊销通道在此之前就返回，不走这条载荷。
- 第 461–464 行：健康检查是 `SELECT 1 FROM pg_trigger WHERE tgname = $1 AND tgrelid = $2::regclass LIMIT 1`，参数是触发器名和 `interview_event`。它不是只看触发器名，还要求表是 `interview_event`。它不读行级还是语句级，也不读函数体。同名触发器仍挂在这张表上时，这项检查仍然成立。
- 第 279 行：专用池 `max: 1`。第 444、449、458 行是三条 `LISTEN`：事件通道、`interview_token_ch`、`meetwise_principal_evict_v1`。条数不改。

`apps/api/src/platform/sse-pump.ts`

- 第 70 行：`HEALTHY_FALLBACK_MS = 30_000`。
- 第 71 行：`DEGRADED_POLL_MS = 2_000`。
- 第 174–176 行：健康时用 `fallbackMsHealthy`，缺省 30 秒；否则用 2 秒。
- 第 53 行与第 199 行：取数仍是调用方注入的 `fetchMore`。不改。

### 0.4 哈希与证明怎么装 SQL

`packages/db/test/dbhy1.proof.ts` 第 178 行把 `0143_sse_push_notify` 的 sha256 钉死为：

`87c472134193d67100f77b6fc34cb1665595586a80924a70803754809ebd4000`

对当前文件做 sha256，得到同一串。第 7 行与第 290 行的范围是 `0001`–`0144`。新文件不在这组里，不要把新文件写进这组，也不要改这一行哈希。

`apps/api/test/sse-push-notify.proof.ts` 只内嵌 0143 原文：

- 第 39–41 行说明装的是 0143 文件字节，不是手抄。
- 第 84–87 行 `readFileSync` 读取 `packages/db/migrations/0143_sse_push_notify.sql`。
- 第 243 行 `h.pool.query(migration0143)` 执行这份原文。

0143 字节与哈希保持不变。新断言要在同一证明里额外应用新迁移的 SQL，不能假装只装 0143 就变成语句级。

同一证明里的 `seedStream`（第 131–133 行）可以在一条 `VALUES` 里插入同一 `stream_key` 的多行。那不是产品插入，也不能用来证明语句级合并：同一通道、同一载荷在同一事务里是否只送达一次，是数据库的投递行为，不是这份函数源码在合并。

### 0.5 其他通道与级联删除检查

下列通道不改：

- `packages/db/migrations/0084_worker_job_wakeup_notifications.sql` 第 14 行：`meetwise_worker_wakeup_v1`。
- `packages/db/migrations/0133_job_route_pending_worker_wakeup.sql` 第 20 行：同一工人通道。
- `packages/db/migrations/0189_api_harden_shared_state.sql` 第 152 行：`meetwise_principal_evict_v1`。

`scripts/check-migration-version-uniqueness.mjs` 第 22–28 行：去掉注释、引号和美元引号之后，同一条顶层语句里先出现 `DROP`、后面又出现 `CASCADE`，就算一次级联删除。不在父提交 `26d0b35ce88700ea7a1ce1a92a742ca08ddbde0f` 里的新文件必须零次命中。因此新文件的 `DROP TRIGGER` 不能写 `CASCADE`，整个新文件也不要出现这个词。

`0144_db_trigfam_unify.sql` 第 11–13 行记过：`CREATE OR REPLACE` 若省略 `SECURITY` 与 `SET`，会清空函数上的 `search_path` 配置；同签名替换会留下 owner 和既有授权。替换时必须原样写回第 22–23 行的 `SECURITY INVOKER` 和 `search_path`。不要新发 `GRANT`，也不要再写一条 `REVOKE`。

## §1 修法

执行阶段才新增这一个迁移文件：`packages/db/migrations/0214_interview_event_statement_notify.sql`。本提交不加这个文件。

文件要做的事：

1. 同名函数 `CREATE OR REPLACE FUNCTION sse_event_notify_after_insert()`。签名保持 `RETURNS trigger`。保留 `LANGUAGE plpgsql`、`SECURITY INVOKER`、`SET search_path = pg_catalog, public`。函数体不再读 `NEW`，也不要 `RETURN NEW`。语句级触发器的返回值用 `RETURN NULL`。
2. 用过渡表。对 `inserted` 里不同的 `stream_key` 各 `pg_notify` 一次。通道仍是 `interview_event_ch`。载荷仍是裸 `stream_key`，不是 JSON。`stream_key` 在基线表上是 `NOT NULL`，不要另造空载荷过滤。过渡表没有行时，这条查询零次调用 `pg_notify`。
3. 先 `DROP TRIGGER IF EXISTS interview_event_sse_notify ON interview_event;`。这条语句禁止出现 `CASCADE`。然后按语句级重建同名触发器：`AFTER INSERT ON interview_event`，`REFERENCING NEW TABLE AS inserted`，`FOR EACH STATEMENT`，`EXECUTE FUNCTION sse_event_notify_after_insert()`。不要留着原来的行级触发器再叠加第二条，否则同一行会通知两次。
4. 不新发 `GRANT`。不改 `0143_sse_push_notify.sql` 的任一字节。不改 `interview-event.ts` 的单行插入、事务锁、`event_key`。不改三条 `LISTEN`、通道名、30 秒与 2 秒兜底、泵的取数。不改 0084、0133、0189 和其他通道。

建议的函数体只表达上面的行为，执行时以届时的数据库接受的语句为准：

```sql
PERFORM pg_notify('interview_event_ch', stream_key)
FROM (SELECT DISTINCT stream_key FROM inserted) AS changed;
```

新文件可以沿 0143 第 16–17 行设置本地 `lock_timeout` 与 `statement_timeout`。这只限制本迁移语句的等待，不改变通知语义。

这刀不声称去掉跨事务通知。另一次提交的事务仍可对同一流键再通知一次。同一事务里两条语句各自通知同一通道、同一载荷时，数据库可能只送达一次。那是数据库去重，不要写成这份函数源码能把跨语句的调用合并掉。源码保证的只是：同一条插入语句的过渡表里，每个不同的 `stream_key` 调用一次 `pg_notify`；零行不发。

断言只补已有 `apps/api/test/sse-push-notify.proof.ts`。不新建 ts 或证明文件。

证明里的新断言必须：

- 继续用第 84–87 行的方式读取 0143 文件字节。0143 字节与哈希保持不变。
- 在同一证明里，于 0143 已经执行之后，再 `readFileSync` 新迁移文件并执行那份文件字节。不要手抄 SQL。不能假装只装 0143 就变成语句级。
- 放在现有阶段之后，避免把已经只装 0143 的阶段改成语句级。
- 用目录定义证明触发器已是语句级：`pg_get_triggerdef` 含 `FOR EACH STATEMENT` 与 `REFERENCING NEW TABLE`，并且不再是 `FOR EACH ROW`；触发器名与表名不变。函数定义不再读取 `NEW`。
- 一条插入语句写入两个不同的 `stream_key` 时，测试连接上的 `LISTEN` 收到两条通知，通道是 `interview_event_ch`，载荷分别是这两个裸流键。
- 一条插入语句实际插入零行时，不收到通知。
- 不要用「同一流键插了多行，监听端只看到一条」来证明源码合并。同一通道同一载荷在同一事务内的数据库去重，行级多次调用也会呈现成一条送达。

`scripts/run-e2e-isolated.mjs` 第 1377–1387 行的收据源列表目前包含 `packages/db/migrations/0143_sse_push_notify.sql`，不包含尚未存在的新文件。该列表是收据源（同文件第 3302–3313 行），不是运行沙箱。执行阶段让证明去读新迁移时，把新文件路径补进同一个键 `sse-push:notify:prove:raw` 的列表。不改第 2416–2417 行的派发命令。不新增脚本。

## §1.3 否决

- 改 `0143_sse_push_notify.sql` 的任何字节，或改 `dbhy1.proof.ts` 第 178 行的哈希。
- 在 `DROP TRIGGER` 上写 `CASCADE`，或在新文件里写出会被级联删除检查命中的语句。依赖导致不带 `CASCADE` 的 `DROP` 失败时停下来，不要改成 `CASCADE`。
- 换函数名、换触发器名、换通道，或把载荷改成 JSON。
- 新发 `GRANT`，或重写 0143 已有的 `REVOKE`。
- 改 `interview-event.ts` 的单行插入、事务锁或 `event_key`。
- 改 `LISTEN` 条数、通道名、30 秒兜底、2 秒退化轮询，或泵的 `fetchMore`。
- 改 0084、0133、0189，或改 token 通道与吊销通道。
- 新建 ts、新建证明，或只装 0143 就声称已经是语句级。
- 保留行级触发器，再另挂一条语句级触发器。
- 把同一事务同一通道同一载荷的数据库去重写成源码合并。
- 声称这次改动去掉了跨事务通知。
- 因为目录里有空号就不用 `0214`。本基线最高文件名仍是 `0213_interview_job_autovacuum_reloptions.sql`。

## §2 门

下列命令都在本工作树里。本提交只跑最后一条文档检查。证明与迁移检查留给执行阶段。不列站检查。

- `pnpm -C apps/api prove:sse-push-notify`  
  `apps/api/package.json` 第 73 行的脚本名就是 `prove:sse-push-notify`。根 `package.json` 第 184 行的 `sse-push:notify:prove:raw` 也是这条命令。
- `sse-push:notify:prove:raw`  
  `scripts/run-e2e-isolated.mjs` 第 1377 行有这个清单键，第 2416–2417 行把它派发到上面的 `pnpm -C apps/api prove:sse-push-notify`。根 `package.json` 第 183 行用隔离脚本调用这个字面量。
- `node scripts/check-migration-version-uniqueness.mjs`  
  脚本存在。第 16 行写的就是这条启动方式。
- `node scripts/ai-docs/check-docs.mjs`  
  脚本存在。本提交的文档检查走这条命令。扫描上限是 2296。本提交只增加这一个说明文件。

## §8

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

已落语句级通知。同名函数改为对过渡表里不同的流键各通知一次，不再读取行变量。零行不发。不新发授权。同名触发器先去掉，再按语句级重建，过渡表名、通道和裸流键载荷保持原样。

原逐行迁移文件的字节未改。已有证明在执行那份原文之后，再读取并执行这份新迁移的字节。新增的区分断言看已执行函数体：对过渡表里不同的流键各通知一次，且不再读取行变量。同一通道同一载荷在同一事务里的送达去重不算这条区分。另两条断言：一条插入写入两个不同流键时收到两条裸流键通知；实际插入零行时不收到通知。

收据源列表补了这份新迁移的路径。派发命令未改。
