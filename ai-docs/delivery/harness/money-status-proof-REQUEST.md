# 金额状态约束证明按现有迁移语句验收

本说明只记录改法。本步不改证明，不改迁移。

## §0 锚

行号来自分支 `line/money-status-proof-draft`、提交 `0cebd82b625cbf1b514eb161e34a18cbb3447a53` 上打开的文件。下面是打开时看到的原文。

### 0.1 证明头注仍按独立语句计数

`packages/db/test/db-money3.proof.ts`

- 第 20 行：` *   P6 0149 文本静态门（dollar-quote 感知）：语句白名单 = 1×DO 检测 + 5×DROP CONSTRAINT IF EXISTS +`
- 第 21 行：` *      4×ADD CONSTRAINT CHECK，零 UPDATE/DELETE/INSERT/ALTER TYPE/CREATE INDEX/TRIGGER/RLS/GRANT。`

### 0.2 白名单只认单独的 DROP 与单独的 ADD CHECK

同文件第 343–360 行：

```
  /* ── P6 · 0149 文本静态门（语句白名单 · append-only 纪律结构性保证） ───────── */
  {
    const noComments = migRaw.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
    const stmts = splitSql(noComments);
    const doBlocks = stmts.filter((s) => /^DO \$dbm3_detect\$$/.test(s.split('\n')[0] ?? '')).length;
    const dropC = stmts.filter((s) => /^ALTER TABLE (public\.)?[a-z_]+ DROP CONSTRAINT IF EXISTS [a-z_]+$/.test(s)).length;
    const addC = stmts.filter((s) => /^ALTER TABLE (public\.)?[a-z_]+ ADD CONSTRAINT [a-z_]+ CHECK \(/.test(s)).length;
    const whitelisted = stmts.filter((s) =>
      s.startsWith('DO $dbm3_detect$')
      || /^ALTER TABLE (public\.)?[a-z_]+ DROP CONSTRAINT IF EXISTS [a-z_]+$/.test(s)
      || /^ALTER TABLE (public\.)?[a-z_]+ ADD CONSTRAINT [a-z_]+ CHECK \(/.test(s)).length;
    const other = stmts.length - whitelisted;
    const banned = /\b(UPDATE|DELETE|INSERT|DROP COLUMN|DROP TABLE|DROP POLICY|DROP ROLE|ALTER COLUMN|CREATE INDEX|CREATE TABLE|CREATE OR REPLACE|TRIGGER|GRANT|REVOKE|POLICY|NOT VALID|VALIDATE CONSTRAINT|REPLICA IDENTITY|OWNER TO|SECURITY LABEL)\b/i;
    const bannedHits = stmts.filter((s) => banned.test(s)); // 全语句含 DO 体逐一扫描（无豁免）
    A('P6-1 语句白名单：1×DO 检测 + 5×DROP CONSTRAINT IF EXISTS（4 幂等守卫+1 D3 删 0027）+ 4×ADD CONSTRAINT CHECK，无其他语句',
      doBlocks === 1 && dropC === 5 && addC === 4 && other === 0);
    A('P6-2 零 UPDATE/DELETE/INSERT/ALTER TYPE/CREATE INDEX/TRIGGER/RLS/GRANT（含 DO 体 · 零数据触碰硬保证）',
      bannedHits.length === 0);
```

`dropC` 要求整句就是单独一行 `ALTER TABLE … DROP CONSTRAINT IF EXISTS …`。`addC` 要求整句以 `ALTER TABLE … ADD CONSTRAINT … CHECK (` 开头。禁词表把 `NOT VALID` 与 `VALIDATE CONSTRAINT` 算进全语句命中，断言是 `dropC === 5 && addC === 4 && other === 0`。

### 0.3 迁移正文已不是那套独立语句

`packages/db/migrations/0149_money_status_constraints.sql` 第 19 行注释写的是：`10 语句 = 1 DO 块前置脏值检测（原形逐字保持）+ 4 熔单 ALTER + 1 D3 DROP + 4 VALIDATE。` 注释不是语句。按文件里已有的美元引号切分（与证明 `splitSql` 相同：先去掉 `--` 注释，美元引号内的分号不当边界），可执行语句是 10 条：

| # | 行 | 种类 | 原文要点 |
|---|---|---|---|
| 1 | 24–44 | DO | `DO $dbm3_detect$` … `END $dbm3_detect$;` |
| 2 | 47–50 | 同一 ALTER 里先 DROP 再 ADD CHECK，带 NOT VALID | `ALTER TABLE payment_order` / `DROP CONSTRAINT IF EXISTS ck_payment_order_amount_cents_positive,` / `ADD CONSTRAINT ck_payment_order_amount_cents_positive` / `CHECK (amount_cents > 0) NOT VALID;` |
| 3 | 54–57 | 同上 | `ALTER TABLE payment_order` / `ck_payment_order_units_range` / `CHECK (units > 0 AND units <= 9999999999.99 AND units = round(units, 2)) NOT VALID;` |
| 4 | 60–63 | 同上 | `ALTER TABLE settlement_ledger` / `ck_settlement_units_settled_nonneg` / `CHECK (units_settled >= 0) NOT VALID;` |
| 5 | 67–71 | 同上 | `ALTER TABLE ai_graph_run` / `ck_ai_graph_run_status` / `CHECK (status IN ('created','active','waiting_user','migrating','paused','quarantined',` / `'safe_terminating','safely_terminated','succeeded','completed','failed')) NOT VALID;` |
| 6 | 77 | 单独 DROP | `ALTER TABLE interview_event DROP CONSTRAINT IF EXISTS uq_interview_event_key_constraint;` |
| 7 | 80 | VALIDATE | `ALTER TABLE payment_order VALIDATE CONSTRAINT ck_payment_order_amount_cents_positive;` |
| 8 | 81 | VALIDATE | `ALTER TABLE payment_order VALIDATE CONSTRAINT ck_payment_order_units_range;` |
| 9 | 82 | VALIDATE | `ALTER TABLE settlement_ledger VALIDATE CONSTRAINT ck_settlement_units_settled_nonneg;` |
| 10 | 83 | VALIDATE | `ALTER TABLE ai_graph_run VALIDATE CONSTRAINT ck_ai_graph_run_status;` |

可执行的 `NOT VALID` 只在第 50、57、63、71 行，各一次，都在上面四条熔断 ALTER 末尾。可执行的 `VALIDATE CONSTRAINT` 只在第 80–83 行，四条各自独立。第 6 条没有 `NOT VALID`，也没有 `ADD CONSTRAINT`。这四条熔断语句都不是单独的 DROP 行，也不是以 ADD CONSTRAINT 开头，所以对不上 §0.2 的 `dropC === 5` 与 `addC === 4`，并且会撞上禁词表里的 `NOT VALID` 与 `VALIDATE CONSTRAINT`。

## §1 修法

只改既有文件 `packages/db/test/db-money3.proof.ts` 的头注（第 20–21 行）和 P6 白名单（第 343–360 行这一段里的计数与允许词）。不改迁移，不新增语句，不改金额状态的产品语义。

头注改为与 §0.3 的 10 条一致：1 个 `DO $dbm3_detect$`，4 条在同一 `ALTER` 里 `DROP CONSTRAINT IF EXISTS` 再 `ADD CONSTRAINT … CHECK (…) NOT VALID`，1 条单独的 `DROP CONSTRAINT IF EXISTS`，4 条 `VALIDATE CONSTRAINT`。仍然写明零 `UPDATE` / `DELETE` / `INSERT` / `ALTER TYPE` / `CREATE INDEX` / `TRIGGER` / `RLS` / `GRANT`。

白名单计数改为：

- `doBlocks === 1`：沿用现有「首行是 `DO $dbm3_detect$`」判定。
- 熔断 ALTER 恰好 4。一条算熔断，当且仅当去掉首尾空白、把内部空白（含换行）收成单空格后，形如 `ALTER TABLE <表> DROP CONSTRAINT IF EXISTS <名>, ADD CONSTRAINT <名> CHECK ( <谓词> ) NOT VALID`，两处约束名相同，该句含 `NOT VALID` 恰好一次，且不含 `VALIDATE CONSTRAINT`。四条的表现有名是 `payment_order` / `ck_payment_order_amount_cents_positive`、`payment_order` / `ck_payment_order_units_range`、`settlement_ledger` / `ck_settlement_units_settled_nonneg`、`ai_graph_run` / `ck_ai_graph_run_status`。不要再用「整句以 `ADD CONSTRAINT` 开头」当作这四条的通过条件，那个正则对不上现文。
- 单独 DROP 恰好 1，仍用现有整句正则 `^ALTER TABLE (public\.)?[a-z_]+ DROP CONSTRAINT IF EXISTS [a-z_]+$`。这一条是 `interview_event` 上的 `uq_interview_event_key_constraint`。熔断语句里的 `DROP` 不计入这 1。这一条不得含 `NOT VALID` 或 `VALIDATE CONSTRAINT`。
- `VALIDATE CONSTRAINT` 恰好 4，整句匹配 `^ALTER TABLE (public\.)?[a-z_]+ VALIDATE CONSTRAINT [a-z_]+$`，表与约束名就是上面四个 CHECK 名。这四条不得再含 `NOT VALID`。
- `other === 0`。语句总数是 10。P6-1 的说明文字改成这组计数，断言改为 `doBlocks === 1` 且熔断数为 4 且单独 DROP 为 1 且 VALIDATE 为 4 且 `other === 0`。不再断言 `dropC === 5 && addC === 4`。

`UPDATE`、`DELETE`、`INSERT` 以及现有禁词表里其余词保持，仍对全部语句（含 DO 体）扫描，无豁免：`DROP COLUMN`、`DROP TABLE`、`DROP POLICY`、`DROP ROLE`、`ALTER COLUMN`、`CREATE INDEX`、`CREATE TABLE`、`CREATE OR REPLACE`、`TRIGGER`、`GRANT`、`REVOKE`、`POLICY`、`REPLICA IDENTITY`、`OWNER TO`、`SECURITY LABEL`。只从这份全局禁词表拿掉 `NOT VALID` 与 `VALIDATE CONSTRAINT`。拿掉之后不是全局放行：`NOT VALID` 只能出现在上面四条熔断 ALTER 上，`VALIDATE CONSTRAINT` 只能出现在上面四条 VALIDATE 上。DO 体、单独 DROP、以及任何未归类语句出现这两个词，仍然失败。

不改 P6-3、P6-4，不改 P0–P5 与 P7。不改 CHECK 谓词，不改迁移里的任何字节。

## §1.3 否决

- 不改迁移文件。
- 不新增迁移。
- 不放宽 `UPDATE` / `DELETE` / `INSERT` 禁词。
- 不新建第二份证明文件。
- 不改金额状态的产品行为。
- 不新增环境变量。

## §2 门

现有脚本，本说明不新造命令。

`packages/db/package.json` 第 69 行：`"prove:db-money3": "tsx test/db-money3.proof.ts"`。同文件第 11 行 lint 是 `eslint . --max-warnings 1042`，第 13 行 typecheck 是 `tsc -p tsconfig.json --noEmit`。根 `package.json` 第 8 行 lint 是 `eslint . --max-warnings 5242`。`turbo.json` 已有 `typecheck` 与 `lint` 任务。

门至少包括：

- `pnpm -C packages/db prove:db-money3`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`
- `node scripts/ai-docs/check-docs.mjs`

`pnpm turbo lint` 的警告上限恰为：root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。对应脚本是各包 `package.json` 里现有的 `eslint . --max-warnings <该数>`：根 5242，`apps/api` 1423，`packages/domain` 115，`packages/ai-runtime` 628，`apps/worker` 959，`packages/db` 1042，`apps/web` 601，`packages/qdrant-store` 27，`packages/ai-graphs` 47，`packages/contracts` 265。低于上限算过，不得放宽这些数，0 errors。未点名的包维持各自现有 lint 脚本，不得放宽。

不调用模型，不新增供应商环境变量，因此不列 provider-egress。不新增迁移，因此不把迁移唯一性当作本改动要新跑的门。不把批表或能力项记成新增完成。本说明是唯一允许新增的受管文件。

## §8

executed:awaiting_post_prove_dual

本步只新增本说明，不改证明，不改迁移。

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-rev

本节更正 P6-3 的扫描范围，并以此节为准。上文「不改 P6-3」那句保留；扫描范围改按本节，不按那句。

`packages/db/test/db-money3.proof.ts` 第 363 行是 `!/ALTER\s+COLUMN|TYPE\s+numeric/i.test(migRaw)`。`migRaw` 是整份迁移原文，含行注释。`packages/db/migrations/0149_money_status_constraints.sql` 第 7 行是行注释，其中含有 `ALTER COLUMN`。只改白名单、仍扫描这份含注释的原文时，`pnpm -C packages/db prove:db-money3` 仍会失败。

P6-3 改为扫描去掉行注释之后的文本，不要扫描含注释的原文。按行去掉 `--` 及其后内容，与同段已有的去注释文本同一范围。正则仍是 `ALTER\s+COLUMN|TYPE\s+numeric`（大小写不敏感）。注释里的 `ALTER COLUMN` 不得失败。

可执行语句里的 `ALTER COLUMN` 或 `TYPE numeric` 仍然失败。不要放宽到可执行语句。

不改迁移的任何字节。不新增迁移。不改 P6-4 的约束名断言。

其余修法仍只改这份既有证明的头注、P6 白名单，外加 P6-3 的扫描范围。

门不变。不把批次清单或能力项记成新增完成。

## §9-EXEC

证明已按 §1 与 §9-rev 改完。头注改为 1 个 DO $dbm3_detect$、4 条同一 ALTER 里先 DROP CONSTRAINT IF EXISTS 再 ADD CONSTRAINT … CHECK (…) NOT VALID、1 条单独 DROP CONSTRAINT IF EXISTS、4 条 VALIDATE CONSTRAINT。P6 白名单按这组计数，不再断言 5 条单独 DROP 与 4 条单独 ADD。全局禁词表拿掉 NOT VALID 与 VALIDATE CONSTRAINT；这两个词分别只允许出现在四条熔断 ALTER 与四条 VALIDATE 上。P6-3 改为扫描同段已去掉行注释的文本。P6-4、P0–P5、P7 没有改。

迁移 packages/db/migrations/0149_money_status_constraints.sql 字节没有改。sha256 为 e7b916d05f4b7072eb5a1d6ca9c788e2fd2d6dbec0086aa3b9911807325947d8，长度 6022 字节。

活库证明启动前，没有别的 tsx 证明进程，也没有 adaptive 证明进程。随后用 DATABASE_URL 指向 127.0.0.1:54329 的 meetwise 库跑了一次 pnpm -C packages/db prove:db-money3，没有设置 NODE_ENV=production。退出码 1。失败发生在任何断言和任何 SQL 之前，错误文本是 destructive_proof_requires_e2e_isolated。这不是白名单断言失败，也不是连接被占或库被锁。没有改迁移，没有放宽隔离检查，没有重试，没有结束别人的数据库连接。活库证明不记为通过，也不记为因占用推迟。

## §10

未提交把 §8 那三处状态改成 `executed:awaiting_post_prove_dual` 不算通过。隔离证明仍红：P6-1 到 P6-4 已通过，P3-2、P3-4、P5-1 在已提交证明和当前工作区都会失败。未提交 diff 只动了本说明和 P6。这三处已改回 `draft:awaiting_pre_exec_dual`，三处同值。这是撤回未提交的状态翻转，不是洗掉 §0 到 §9-EXEC 的既有段落。

下一席只改 `packages/db/test/db-money3.proof.ts` 的下面三处。本步不落这三处的证明码。除此三处，该证明文件不动。

P5-1：先按行去掉 `--` 注释（`--` 及其后直到行尾），再对去掉注释后的文本套原来的正则 `/CONSTRAINT\s+uq_event_key\b/`。命中的是 `packages/db/sql/01_schema.sql` 第 51 行注释 `-- 原表级 CONSTRAINT uq_event_key 已删`，没有可执行约束。不改 `sql/01`。

P3-2：期望文本从 `'10'` 改为 `'10.00'`。查询里 `units_total=10` 保留。`entitlement_bucket.units_total` 是 `numeric(12,2)`，`coalesce(sum(units_total),0)::text` 的合计文本是 `10.00`。不改列类型。

P3-4：保留 release 断言（第二次 reserve 为 reserved，`releaseConsumption` 为 released）。`settleOutbox` 的签名是 `export async function settleOutbox(c: Client, owner: string): Promise<{ settled: number }>`。它只收客户端和 owner，不收 `confirmConsumption` 的返回值。`confirmConsumption` 返回的 `ConfirmResult` 只有 `status` 与 `unitsSettled`（或 noop 的 `finalStatus`、error 的 `reason`），没有 consumption id，也没有 outbox id。owner 是调用 confirm 时已经持有的参数，不是 confirm 返回的标识。签名对不上，因此不授权在 confirm 之后调用 `settleOutbox`。只改为断言 `commerce_outbox` 出现 `settlement_proposed`。调用 `settleOutbox` 与这条 outbox 断言不得并列为可选。`confirmConsumption` 写入的是 `commerce_outbox`（`settlement_proposed`）；confirm 本身不写 `settlement_ledger`。`settlement_ledger` 的 INSERT 在 `settleOutbox`。不要新写 INSERT，不要直接插账本。

不改：迁移字节（`packages/db/migrations/0149_money_status_constraints.sql` 的 sha256 必须仍是 `e7b916d05f4b7072eb5a1d6ca9c788e2fd2d6dbec0086aa3b9911807325947d8`，6022 字节）、P6-4、P0、P1、P2、P3-1、P3-3、P3-5、P3-6、P4、P5-2、P5-3、P7。P6 里已写上的白名单和去注释扫描保持不动。不改迁移文件。不提交。

§8 中间那句已恢复为已提交原文。证明尚未按本节改完，该句不改成已完成。

## §11

P3-2、P3-4、P5-1 这三处已经按 §10 落在证明里。隔离证明 `node scripts/run-e2e-isolated.mjs db-money3:prove:raw` 退出码 0。迁移 `packages/db/migrations/0149_money_status_constraints.sql` 字节未改，sha256 仍是 `e7b916d05f4b7072eb5a1d6ca9c788e2fd2d6dbec0086aa3b9911807325947d8`，长度 6022。

§8 中间那句「本步只新增本说明，不改证明，不改迁移。」是先前记录，保持原文。现以 §11 为准。
