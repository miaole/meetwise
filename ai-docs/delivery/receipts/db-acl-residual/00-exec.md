# DB-ACL-RESIDUAL EXEC 收据 · 00

- 刀位：#142 残面单 db-acl2:prove 立靶（REQUEST=`ai-docs/delivery/harness/db-acl-residual-REQUEST.md`）
- 授权链：pre-exec 双审会签 PASS（席1 agent_9ffa0cc6+席2 agent_e22738db）→协调方 EXEC 授权→本席 EXEC
- EXEC 时点：2026-10-15 · 工作树 meetwise-dar · 分支 line/db-acl-residual
- 并线：merge `dca42710`（--no-ff feat/mysql-schema-skeleton@origin tip `f417d8e7`·merge-base `418f16e8`·零冲突）
- STOP：`executed:awaiting_post_prove_dual`（待 post-prove 双审）· ⛔push

## 一、门矩阵全表+EXIT 原值

| # | 门 | 命令 | EXIT | 读数 |
|---|---|---|---|---|
| 1 | db-acl2:prove | `pnpm db-acl2:prove` | 0 | **38 PASS / 0 FAIL 翻绿**（`RESULT dbacl2-db-acl failures=0`·恰 1 run 零 retry） |
| 2 | db-acl:prove | `pnpm db-acl:prove` | 0 | 62 PASS / 0 FAIL 维持（两跑全绿：首跑 grep 管道丢 EXIT·复跑显式捕获·非 retry-to-green） |
| 3 | migrate:prove | `pnpm migrate:prove` | 0 | 全绿（链 204 头 0204） |
| 4 | drift:prove | `pnpm drift:prove` | 0 | 零漂移（豁免 2 项既登恒等） |
| 5 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | 0 | `files=204 violations=0 exemptions=0143,0152,0160` |
| 6 | dbhy1:prove | `pnpm dbhy1:prove` | 0 | 28 PASS / 0 FAIL |
| 7 | interview:prove | `pnpm interview:prove` | 0 | 57 PASS / 0 FAIL |
| 8 | neg:all | `node scripts/run-e2e-isolated.mjs neg:all` | 0 | 687 PASS / 0 FAIL 六段全绿（auth 90+commerce 90+resume 91+interview 102+bend 179+input 135） |
| 9 | typecheck | `pnpm turbo typecheck --force` | 0 | 8/8 successful · 0 cached |
| 10 | lint 五值 | `pnpm turbo lint` | 0 | web 601 / root 5235 / api 1421 / worker 954 / ai-runtime 628 恰等 · 全域 0 errors |
| 11 | docs:check | `node scripts/ai-docs/check-docs.mjs` | 0 | scanned 2149 ≤ cap 2152（终值·含件③收据面） |
| 12 | markers 五类 | 词面运行时组装扫描（沿 `scripts/i6-239-gates.proof.mjs:151-163` 形） | 0 | 改动集零命中 |
| 13 | diff 面机检 | `git diff --numstat` | — | 恰 2 tracked（见 §四） |
| 14 | 卫生 | `pnpm install --frozen-lockfile` | 0 | lockfile 零改 · `.env*` ABSENT 双向 · est live=0 · tsbuildinfo 运行翻动 checkout 归位 · `actualSpendCny=null` |

收据（隔离容器）：`.tmp/isolated-proof-receipts/2026-10-15T14-12-22-990Z-59467-7781358d-463d-45bc-8d0e-4d5a6dfd5390.json`（db-acl2:prove·outcome=passed exitCode=0）。

## 二、38 臂 PASS 全名单（db-acl2:prove）

P5-4 · P0-0 · P0-1 · P0-2 · P0-3 · P0-4 · §3-1 · §3-2 · §3-3 · §3-4 · §3-5 · §3-6 · P5-1 · P1-1 · P1-2 · P1-3 · P1-4 · P1-5 · P1-6 · P1-7 · P1-8 · P1-9 · P2-1 · P2-2 · P2-3 · P2-4 · P2-5 · P3-1 · P3-2 · P3-3 · P3-4 · P3-5 · P4-1 · P4-2 · P4-3 · P5-2 · **P5-2b（新臂）** · P5-3 —— 恰 38（37 保留语义臂+1 catchup 臂·零删门零弱化）。DERIVE：closed-set owners=memory_runtime · sdTotal=282 · 唯一调用点 `memory_runtime|conversation_event_append|pgp_sym_encrypt(p_body, p_enc_key)|arity=2|kind=encrypt`。

## 三、diff numstat

```
48   5 ai-docs/delivery/harness/db-acl-residual-REQUEST.md
76  39 packages/db/test/db-acl2.proof.ts
```

恰 2 tracked 路径（本卷 .md+件① .ts）+本收据目录 untracked——零越界面。六处改形落点逐条见 REQUEST §9。

## 四、重 pin 全表（@origin tip `f417d8e7`·merge `dca42710`）

| 项 | 起草值 @`418f16e8` | EXEC 实测 @`dca42710` | 结论 |
|---|---|---|---|
| 链数/头值 | 202 / 0202 | **204 / `0204_ai_cost_cached_input_price`**（简报 203=时点前置值） | 顺延合法 |
| loadMigrations | all=202·pre=144·win=152·winAdd=8·catchup=50 | **all=204·pre=144·win=152·winAdd=8·catchup=52** | pre/win 恒等·catchup +2 |
| db-acl2.proof.ts blob | `9efeae31` | `9efeae31`（改形前基恒等） | 恒等 |
| db-acl.proof.ts blob | `570f5741` | `570f5741`（零字节触） | 恒等 |
| migrate.ts blob | `f472f356` | `f472f356`（**三值并列：@`418f16e8`=@`f417d8e7`=merge 后工作树**） | 恒等 |
| 0151 文体 blob | `e6e76af1` | `e6e76af1` | 恒等 |
| 0108 blob | `351aeb45` | `351aeb45` | 恒等 |
| run-e2e-isolated.mjs blob | `e69e317a` | **`0787a7ff`**（主线 ci-wiring3 等波合法并线·行锚重 pin `:1538-:1546`/`:1547-:1558`/`:2162-:2163`/`:2489-:2492`） | 漂移·接线语义恒等 |
| package.json blob | `3b04b871`（`:405-:408`/`:8` 预算 5235） | `3b04b871`（行锚亲证恒等） | 恒等 |
| expectedWindow 八名 | 0144_db_trigfam_unify…MIGRATION_0151 | 逐字恒等 | 恒等 |
| cap（public-text-policy MAX_FILES） | 2_144@`:78` | **2_152@`:90`**（主线 `591d07cf` sanction） | 联动落值 |
| §0.0 交叠复核 | 规则 | 全分支重跑零在飞新触（`line/db-pgp-acl`=`650b018e` 原始血统支线·blob 恒等·早于主线） | 通过 |
| P4-1' diff-to-base 形态 | 58A/0M/0D（起草实测） | **60A/0M/0D**（204 链实测） | 零 D/R/M 恒成立 |

## 五、偏离清单（如实登记·零就地处置）

1. 门 8 neg:all 裸 `pnpm -C apps/api neg:all` 缺 PG env → env_schema_invalid 红（环境供给面非码红）；隔离 runner 形 EXIT=0 687/0 绿为门读数。
2. 门 2 db-acl:prove 两跑全绿账（首跑 EXIT 码丢失于 grep 管道·复跑显式捕获 EXIT=0·两跑均绿）。
3. §0.1 run-e2e-isolated.mjs blob 漂移重 pin（主线合法并线所致·本刀零触面）。
4. 门 11 cap 2144→2152（主线 sanction 已落值·REQUEST §0.1 行随更）。

## 六、pins 零翻声明

§5 十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · **actualSpendCny=null**。est live=0（EXEC 期零模型外呼零 Key 加载零生产操作）。

## 七、STOP

**`executed:awaiting_post_prove_dual`** —— 待 post-prove 双审（Ban self-approve · alone≠dual）· #142 翻面权归协调方 nail · ⛔push。
