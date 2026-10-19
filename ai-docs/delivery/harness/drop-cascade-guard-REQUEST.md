draft:awaiting_pre_exec_dual

# 禁止新迁移再写级联删除

本说明只记录改法。不改迁移正文，不新增迁移，不新增检查脚本。

## §0 锚

行号均在父提交 `26d0b35ce88700ea7a1ce1a92a742ca08ddbde0f` 上亲读。下面引用的是该提交里的原文，不是估计。

### 0.1 已应用迁移里的两句

`packages/db/migrations/0145_dead_table_jsonb_deprecate.sql`

- 第 16 行：`非破坏边界：本迁移只有 DROP 两死表 + COMMENT；零 UPDATE/零 DELETE 行/零列类型变更/零触发器改动。`
- 第 18 行：`DROP TABLE IF EXISTS app_setting CASCADE;`
- 第 19 行：`DROP TABLE IF EXISTS consumption_record CASCADE;`
- 第 25–26 行不是级联删除：`GRANT EXECUTE ON FUNCTION public.uuidv7() TO app_role;` 与 `GRANT EXECUTE ON FUNCTION public.uuidv7() TO online_judge_owner;`
- 第 28–35 行是四条 `COMMENT ON COLUMN`，不是删除。

同一目录里，可执行的 `DROP ... CASCADE` 不只有这两句。注释里的字不算语句。亲读到的可执行命中：

| 文件 | 行 | 原文 |
|---|---|---|
| `packages/db/migrations/0001_baseline.sql` | 11 | `DROP TABLE IF EXISTS interview, ai_graph_run, interview_event, consumption_record, ai_invocation_trace CASCADE;` |
| 同上 | 90 | `DROP TABLE IF EXISTS entitlement_bucket, entitlement_consumption, commerce_outbox, settlement_ledger CASCADE;` |
| 同上 | 169 | `DROP TABLE IF EXISTS resume, resume_blob, resume_profile CASCADE;` |
| 同上 | 222 | `DROP TABLE IF EXISTS ai_report CASCADE;` |
| 同上 | 251 | `DROP TABLE IF EXISTS interview_job CASCADE;` |
| 同上 | 283 | `DROP TABLE IF EXISTS vector_chunk CASCADE;` |
| 同上 | 310 | `DROP TABLE IF EXISTS user_memory CASCADE;` |
| 同上 | 334 | `DROP TABLE IF EXISTS assessment_report CASCADE;` |
| 同上 | 360 | `DROP TABLE IF EXISTS user_account CASCADE;` |
| 同上 | 376 | `DROP TABLE IF EXISTS learning_plan CASCADE;` |
| 同上 | 401 | `DROP TABLE IF EXISTS payment_order CASCADE;` |
| 同上 | 426 | `DROP TABLE IF EXISTS career_path CASCADE;` |
| 同上 | 448 | `DROP TABLE IF EXISTS consent_record CASCADE;` |
| 同上 | 470 | `DROP TABLE IF EXISTS notification CASCADE;` |
| `packages/db/migrations/0093_memory_governance.sql` | 53 | `DROP TABLE IF EXISTS memory_fact CASCADE;` |
| 同上 | 106, 130, 153, 177 | 同形 `DROP TABLE IF EXISTS ... CASCADE;`，表名依次为 `memory_consent`、`memory_context_snapshot`、`memory_index_generation`、`memory_audit_event` |
| `packages/db/migrations/0095_memory_admission_metadata_gate.sql` | 52 | `DROP TABLE IF EXISTS memory_admission_authorization CASCADE;` |
| 同上 | 91 | `DROP TABLE IF EXISTS memory_admission_record CASCADE;` |
| `packages/db/migrations/0099_memory_fact_adjudication.sql` | 49, 105 | `memory_fact_adjudication`、`memory_fact_relationship` |
| `packages/db/migrations/0102_memory_index_generation_governance.sql` | 73, 94, 112, 127 | `memory_index_source_manifest`、`memory_index_source_manifest_item`、`memory_index_generation_embedding`、`memory_index_generation_cache_entry` |
| `packages/db/migrations/0105_memory_two_stage_recall.sql` | 61 | `DROP TABLE IF EXISTS memory_recall_context_snapshot CASCADE;` |
| `packages/db/migrations/0107_memory_control_surface.sql` | 77, 96, 114, 136, 163, 178, 193 | `memory_collection_pause`、`memory_correction_command`、`memory_deletion_request`、`memory_deletion_target`、`memory_policy_publish_command`、`memory_reindex_task`、`memory_export_receipt` |
| `packages/db/migrations/0108_ctx03_immutable_session_event_source.sql` | 57 | `DROP TABLE IF EXISTS conversation_event_artifact CASCADE;` |
| 同上 | 86 | `DROP TABLE IF EXISTS conversation_event CASCADE;` |
| `packages/db/migrations/0115_ctx04_verifiable_compression_snapshot.sql` | 44 | `DROP TABLE IF EXISTS context_compression_snapshot CASCADE;` |
| `packages/db/migrations/0117_ctx05_compression_dispatch.sql` | 38 | `DROP TABLE IF EXISTS context_compression_dispatch CASCADE;` |
| `packages/db/migrations/0145_dead_table_jsonb_deprecate.sql` | 18, 19 | 见上，这是唯一要登记的两句 |

`packages/db/migrations/0135_resume_quiz_freshness_anchor.sql` 第 3 行是注释，不是语句：`已迁移库经本增量迁移得列;新库经 packages/db/sql/20_resume_quiz.sql 重放镜像(DROP+CASCADE 型)得同列——`。匹配前必须丢掉注释，否则这行会被误伤，而它的字节同样不能改。

`packages/db/migrations/0148_interview_composite_fk_batch1.sql` 第 68、71、74、77、80、83 行是 `REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID;`。这是外键子句，语句里没有 `DROP`。不得把它算成 `DROP ... CASCADE`。

目录共 213 个 `.sql`。数值前缀最小 `0001`、最大 `0213`。前缀空位只有 `0164`、`0182`、`0183`。低于 `0145` 的前缀没有空位。`0143`、`0152`、`0160` 各有两个文件。这些事实用来说明：不能靠「只看大于某一前缀的新文件」把 `0143` 的第三个文件漏掉，因为现有前缀检查对这三个前缀整组放行。

### 0.2 迁移运行器不拒绝级联删除

`packages/db/src/migrate.ts`

- 第 5 行只是注释：`迁移文件须**增量、非破坏**(CREATE TABLE IF NOT EXISTS / ALTER ... ADD COLUMN IF NOT EXISTS),绝不 DROP 丢数据。` 这里没有抛错。
- 第 37–95 行 `splitTopLevelStatements` 把 `--` 与 `/* */` 注释、引号和美元引号塌成空白，再按顶层分号切开。第 98–99 行 `containsTopLevelTransactionControl` 只认顶层 `BEGIN` / `COMMIT` / `ROLLBACK` / `END` / `ABORT` / `START TRANSACTION` / `PREPARE TRANSACTION`。
- 第 395–397 行只在非 `concurrent-index` 模式下调用上一函数，错误码是 `migration_transaction_control_forbidden`。没有 `CASCADE` 判断。
- 第 415–430 行：空账本遇到已有业务表时抛 `migration_uninitialized_nonempty_database`，避免在非空库上重放基线里的 `DROP`。这不是对迁移文件文本的级联删除拒绝。
- 第 364 行是运行器自己的 `DROP INDEX CONCURRENTLY IF EXISTS`，没有 `CASCADE`。
- 第 584 行对普通迁移执行 `await client.query(m.sql)`。已落地文件里的 `DROP ... CASCADE` 会在空库上照常执行。
- 第 602–613 行 `loadMigrations` 只按文件名装入正文并识别执行模式，不检查 `DROP`。

因此不能把拒绝写进运行器。写进去之后，空库重放 `0001_baseline.sql` 与 `0145_dead_table_jsonb_deprecate.sql` 会失败，已落地语句就无法再应用。

### 0.3 现有检查，以及它还没做这件事

`scripts/` 里已经在枚举迁移文件的检查是 `scripts/check-migration-version-uniqueness.mjs`。它没有配对的证明脚本。

- 第 16 行写明启动方式：`node scripts/check-migration-version-uniqueness.mjs [migrations-dir]`
- 第 26 行默认目录是 `packages/db/migrations`。
- 第 36 行：`const EXEMPT_DUPLICATE_PREFIXES = new Set(['0143', '0152', '0160']);` 这只登记重复的数值前缀。
- 第 40 行：`files = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();` 只读文件名，不读正文。
- 第 57–69 行只统计前缀重复。重复且不在上面的集合里则 `violations += 1`，最后 `process.exit(violations === 0 ? 0 : 1)`。

`.github/workflows/ci.yml` 第 170 行已经调用：`node scripts/check-migration-version-uniqueness.mjs`。根 `package.json` 没有这个脚本的证明项。

`scripts/schema-drift-check.mjs` 不是同等守卫。第 27–32 行的 `EXEMPTIONS` 把 `app_setting` 与 `consumption_record` 登记成「迁移侧已删、sql/ 镜像仍在」的列漂移豁免，不扫描 `DROP ... CASCADE`，也不让新迁移因这句话失败。它要数据库，启动方式是 `pnpm drift:prove`（文件第 17 行）。不要改它来承担本检查。

全仓没有「新迁移出现 `DROP ... CASCADE` 就失败，且只把上述两句排除」的脚本。测试与 `packages/db/sql/` 里的同形语句是夹具或镜像，不在本检查的目录里，也不构成这种守卫。

## §1 修法

改已有文件 `scripts/check-migration-version-uniqueness.mjs`。不新写检查文件。前缀检查原样保留，包括第 36 行那三个前缀。在它得出退出码之前增加下面的断言；任一侧失败都使进程以 1 退出。

断言：

1. 仍只扫描 `packages/db/migrations` 的 `.sql`。不扫描 `packages/db/sql/`，不扫描测试。
2. 切语句时与运行器第 37–95 行同一边界：注释、引号、美元引号不参与匹配，顶层分号才断句。
3. 一条语句算命中，当且仅当去掉注释和引号后的代码里有独立词 `DROP`，并且同一条语句里在它之后还有独立词 `CASCADE`。`ON DELETE CASCADE` 不命中。没有 `CASCADE` 的 `DROP` 不命中。`0135` 第 3 行那种注释不命中。
4. 比较前去掉首尾空白和末尾一个分号。比较整句，不做子串包含。`0001_baseline.sql` 第 11 行虽然写了 `consumption_record`，但整句不是 `DROP TABLE IF EXISTS consumption_record CASCADE`，不得算进例外。

例外只登记两句，而且必须文件名同时是 `0145_dead_table_jsonb_deprecate.sql`：

- `DROP TABLE IF EXISTS app_setting CASCADE`
- `DROP TABLE IF EXISTS consumption_record CASCADE`

该文件抽出的命中集合必须正好是这两句，各一次。多一句、少一句、改一个字，都失败。`GRANT` 与 `COMMENT` 不是命中，不进入这个集合。

选择按这两条语句排除，不按文件名整份排除。整份排除不行，原因有三条：

1. 这个文件不只有这两句。第 25–35 行是授权和注释。按文件名整份跳过之后，检查就不再看语句。文件里再添第三句 `DROP ... CASCADE` 也会被跳过。登记范围就从两句变成了整个文件。
2. 只跳过这一个文件名时，§0.1 表里其余已应用文件的可执行命中仍会失败。那些文件已经应用，字节不能改，不能靠改写来转绿，也不能把它们的文件名再登记成整份排除。那样就不再是「只有这两句例外」。
3. 若只按这两句的文本做全局放行、不核对文件名，新文件把这两句原样抄进去就会通过。`0001_baseline.sql` 第 11 行又会被子串误放行。所以语句排除必须整句相等，并且文件名必须是这一份。这仍然是按语句排除，不是按文件名整份排除。

其余已应用命中不写入允许名单，新文件也不许复用它们。它们只接受「与父提交字节对应的语句集合相同」：

- 父提交固定为 `26d0b35ce88700ea7a1ce1a92a742ca08ddbde0f`。
- 对该提交里已经存在、且文件名不是 `0145_dead_table_jsonb_deprecate.sql` 的迁移，工作树里的命中集合必须与该提交中同一路径的命中集合相同。相同则通过，不把这些句子登记成例外。
- 该提交中不存在的迁移文件，命中集合必须为空。任何 `DROP ... CASCADE` 都失败，包括抄写上面两句。
- 读不到该提交、或已存在路径取不到原文时，直接失败，不得当成空文件放行。
- 其他文件的集合一旦与父提交不同就失败。不允许再追加登记。

这样，当前树上已落地的句子保持原样时，已有命令仍以 0 退出。新迁移再写级联删除时以 1 退出。`0145_dead_table_jsonb_deprecate.sql` 始终按两句原文核对，不依赖「文件没改就跳过」。

## §1.3 否决

- 不改 `packages/db/migrations/0145_dead_table_jsonb_deprecate.sql` 的任何字节。已应用迁移的字节都不改。
- 不新增迁移文件，不修改已有迁移文件。
- 不新增受管文件。本说明是唯一新增的受管文件；执行阶段只改已经存在的 `scripts/check-migration-version-uniqueness.mjs`。不新增证明脚本，不改 `package.json`。
- 不放宽检查去允许删除别的表。不允许新的 `DROP ... CASCADE`，也不把 §0.1 里其余句子登记成可复用例外。
- 不把拒绝写进 `packages/db/src/migrate.ts`。运行器必须还能在空库上执行已经落地的语句。
- 不把 `ON DELETE CASCADE` 外键子句算进禁止。
- 不改 `scripts/schema-drift-check.mjs`，不把列漂移豁免当成级联删除允许名单。
- 不放宽第 36 行已有的前缀例外。

## §2 门

`scripts/check-migration-version-uniqueness.mjs` 没有证明脚本，根 `package.json` 也没有它的证明项。不新造证明命令，也不新造脚本文件。

执行时只跑文档门：

`node scripts/ai-docs/check-docs.mjs`

扩展落地后，级联删除断言与原有前缀检查共用脚本第 16 行已经写明、且 `.github/workflows/ci.yml` 第 170 行已经在调用的同一命令：

`node scripts/check-migration-version-uniqueness.mjs`

这不是新命令。不要另起一个检查入口。`pnpm drift:prove` 与 `pnpm migrate:prove` 是别的检查，不作为本改法新加的命令。

## §8 状态

draft:awaiting_pre_exec_dual

draft:awaiting_pre_exec_dual
