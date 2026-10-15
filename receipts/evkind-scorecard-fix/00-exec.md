# EVKIND-SCORECARD-FIX EXEC 收据 · 00-exec

- 席位：EXEC 施工席（协调方 2026-10-15 授权·pre-exec 双审会签 PASS=席1 agent_26f888d0+席2 agent_c59b09b7）
- 工作区：`/Users/miaole/Desktop/golucky/meetwise-evk`（`line/evkind-scorecard-fix` @`66d200d5` 起跑）
- 本收据属性：仓根 `receipts/`=非受管根零 docs:check 增量；本刀门 10 口径=收据 untracked 交付（commit 恰 3 tracked 路径），tracked 翻面权归协调方
- est live=0（全 prove 假体/隔离库/静态·零模型外呼）· pins 十一值零翻（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）

## 0. 并线与冲突解

- `git fetch` 后 `origin/feat/mysql-schema-skeleton` tip=`3b32b6c8`（与授权序预期 ≈3b32b6c8+ 恰符）。
- `git merge-tree --write-tree` 预演 EXIT=0 tree=`bd80175a` 零冲突 → `git merge --no-ff feat/mysql-schema-skeleton` 实并 merge=**`c830405f`**（双亲 `66d200d5`+`3b32b6c8`）·冲突解=∅（零冲突零 union 手解面）·`pull --rebase` 未用（Ban 沿承）。
- 40 文件 +2284/−54 全来自主线 tokstream-s4b 窗（token-stream/sse-pump/proof 五件+SSOT 三翻）·本刀并线零手解。

## 1. 门矩阵全表（EXIT 原值·并线 c830405f 树+件①② 落卷后本席亲跑）

| # | 门 | 命令 | EXIT | 实测值 | 判读 |
|---|---|---|---|---|---|
| 1 | interview:prove:raw 翻绿 | `node scripts/run-e2e-isolated.mjs interview:prove:raw` | **0** | **57 PASS**·`:323` 原语④断言 PASS·零 23514 | 绿（改前 18 前缀零弱化+39 翻） |
| 1P | （改前 run·件③） | 同上（改前恰此一次成跑） | 1 | **18 PASS→23514 `ck_interview_event_kind` 拒 'score_card_written'** | 红指纹 §3 |
| 2a | scor-01:prove:raw | 同 runner | 0 | 64 PASS | 绿 |
| 2b | scor-02:prove:raw | 同 runner | 0 | 65 PASS | 绿 |
| 2c | scor03-evidence-conflict:prove:raw | 同 runner | 0 | 64 PASS | 绿 |
| 2d | scor-parity:prove:raw | 同 runner | 0 | 57 PASS | 绿 |
| 2e | growth:prove:raw | 同 runner | 0 | 31 PASS | 绿 |
| 2f | scoring-integrity:prove | 同 runner | **1** | **PASS=10 后 ①c FAIL**（预期恒等 23） | **红·基线亲证 §4** |
| 3 | migrate:prove | `pnpm migrate:prove` | 0 | 全 PASS·链头=0202 认领（链 201+本刀 1·uniqueness files=202 同证·改后隔离跑全链 migrate 含 0202 应用行为直证） | 绿 |
| 4 | drift:prove | `pnpm drift:prove` | 0 | 零漂移·豁免 0145/0149 等恒等·CHECK 不入对账面 | 绿 |
| 5 | uniqueness | `node scripts/check-migration-version-uniqueness.mjs` | 0 | **files=202 violations=0 exemptions=0143,0152,0160** | 绿（202 恰符） |
| 6 | typecheck | `pnpm turbo typecheck --force` | 0 | **8/8 · 0 cached**（daemon 停用后复跑同值·tsbuildinfo 副效应 checkout 还原净树） | 绿 |
| 7 | lint | `pnpm turbo lint` | 1 | web **601=601**/api **1421=1421**/worker **954=954**/ai-runtime 628/db 1042/domain 115/contracts 265/ai-graphs 47/qdrant 27 全恰等恒等；**root 实测 5235>预算行 5224 → root 任务 EXIT=1** | root 承登红 §5（主线既登·勿自升） |
| 8 | docs:check | `node scripts/ai-docs/check-docs.mjs` | 0 | 基线（merge 树净·移出件① A/B 实测）=**2118**·落卷=**2119**（件① .sql 入扫面 +1 A/B 亲证）·**≤cap 2120 余 1**（cap=2120 `public-text-policy.mjs:63-65` 亲证） | 绿（三分口径 §6） |
| 9 | markers 五类 | 本收据 §7 直扫 | — | 新增行五类零命中（EXIT 全 1） | 绿 |
| 10 | diff 面机检 | `git diff --numstat`（对本刀 commit） | — | **恰 3 tracked 路径**=件① 0202.sql(A)+件② catalog.md+本卷 REQUEST.md；收据 untracked 非受管根口径 | 绿 |
| 11 | 卫生 | `pnpm install --frozen-lockfile` | 0 | 5.1s·零 lockfile 改（porcelain 零行亲证）·`.env*` ABSENT 双向记录·actualSpendCny=null·est live=0 | 绿 |

**STOP 终态：`stopped:exec_red_gate_baseline`（沿 AG38/tokstream `stopped:exec_red_gate_budget` 先例·Status 不落 executed·翻面权归协调方）**——红两笔：§4 scoring-integrity（基线亲证·非本刀交付面）+§5 root lint（主线既登承登红）。本刀两产品件面自身全绿（interview 翻绿+scor 五套件翻绿+migrate/drift/uniqueness/typecheck/docs/markers/diff/卫生绿）。

## 2. 改前改后 PASS 名单 diff

- 改前（0202 前·隔离链含 0192 旧 CHECK）：**18 PASS** 后 23514 抛（红点 `interview.proof.ts:261` 写卡臂）。
- 改后：**57 PASS** EXIT=0。
- 名单 diff（sort+comm）：改前 18 名单 **全数在改后名单中（零弱化）**；新增翻绿 **39**，含：
  - `PASS  写卡同事务原子追加 score_card_written 事件（0103 原语④）`（即 `:323` 断言·改前红点）
  - `PASS  score_card 行数 = 已答（ledger 提交）题数（S1 卡数断言）`
  - `PASS  （辅·S1 已落面）Dashboard 读面 avgScore 非 null（score_card 均分）` 及其余 36 臂（改前因写卡事务 23514 回滚被阻断的后段全翻）。

## 3. 改前红点摘录（本树实跑·恰一次成跑·`/tmp/evkind-pre-interview-raw5.log`）

```
PASS ...（前缀 18 行全 PASS）
PASS  D2 同事务落 score_request（q-v1-t0-c0）
error: new row for relation "interview_event" violates check constraint "ck_interview_event_kind"
    at async writeFinalScoreCard (/…/packages/db/src/scoring/scoring-aggregation.ts:64:13)
    at async <anonymous> (/…/apps/worker/src/score-writer.ts:102:21)
    at async main (/…/apps/worker/test/interview.proof.ts:261:21)
  code: '23514',
  constraint: 'ck_interview_event_kind',
  where: 'SQL statement "INSERT INTO interview_event(…) SELECT … ''score_card_written'', …'
         'PL/pgSQL function scoring_write_final_score_card(uuid,uuid,jsonb,text) line 181 at SQL statement'
```

指纹与 §1.1/§1.2 推定形全符（23514·ck_interview_event_kind·0103 函数体 INSERT·score-writer:102 链）·机制满足。隔离收据 `.tmp/isolated-proof-receipts/2026-10-14T22-32-11-240Z-71447-af7fb471-3b20-4cae-8619-dfb1afc5c005.json`。

### 3.1 改前 run 基础设施失败登记（非红冲销·如实四笔）

改前 run 恰一次口径下的环境失败链（四次 attempt 均未达测量面·红测量只 attempt-5 一次）：
1. attempt-1/2：隔离 PG boot 超时（`isolated_postgres_database_not_ready:boot`·机载磁盘 Data 卷 100% 满余 1.9Gi+同刻另一席位隔离跑负载）。环境修复=`docker volume prune`（回收 43.66GB·全为历次隔离跑死亡卷·仅清无容器引用卷·并行席位在用卷未触碰·零工作树零代码零证据触碰）。
2. attempt-3：磁盘修复后仍 boot 败（负载余波）。
3. attempt-4：手动 boot 探针（同镜像同参）12s 就绪+宿主 SQL 探针复现→定位真因=本 worktree `packages/db/node_modules` 缺失（worktree 新建未装）→宿主 SQL 探针 `pg` 模块 ERR_MODULE_NOT_FOUND 恒败→`waitForPostgres` 三连胜永不满足的 boot 假败。
4. 修复=`pnpm install --frozen-lockfile` EXIT=0（即门 11 卫生·零 lockfile 改）→attempt-5 成跑=唯一改前红测量（18 PASS→23514）。
`waitForPostgres` 探针双臂（容器 psql+宿主 pg Client）设计对依赖缺失的暴露面如实承登（run-e2e-isolated.mjs `:2884-2940`·Ban 就地改·归协调方知悉）。

## 4. scoring-integrity:prove 红=基线红亲证（非本刀交付面）

- 本刀落卷树：EXIT=1·PASS=10 后 FAIL `graph 经同一 pending question identity 评分；quote 不可核验只调用一次并进入同题 clarify`·`TypeError: Cannot convert undefined or null to object at Function.hasOwn` @`apps/worker/test/scoring-report-integrity.proof.ts:116:50`·前缀事件 `token_stream_reconcile … frames=0 deltaChars=0`（§2-2 预期恒等 23 PASS）。
- **stash A/B 基线对照（停止条件「验收红不可修」规程·`git stash -u` 净树 c830405f）**：EXIT=1·**PASS=10·同断言·同 TypeError :116:50·同 frames=0 指纹**——基线同红同形亲证=非本刀两产品件引入（本刀零 TS 零测试改·CHECK 扩域与该断言无机制接触面）。
- 归属：并线窗主线新基线红（tokstream-s4b 窗触 interview-service/adaptive-interview-service/token-stream/sse-pump 面·其门矩阵不含 scoring-integrity 故未曝·其既登基线红 TS-P1=tokenstream:prove ask 臂系**不同 proof 不同断言**·本红超其既登清单）。精确归因窗（fc1964cf..3b32b6c8 内哪笔）非本刀范围 Ban 就地追修·留协调方。
- 双次同指纹（本树+基线树）·Ban retry-to-green 未再跑。
- 停止条件「验收红不可修」命中：停手·本节即如实登记。

## 5. root lint 承登红（主线既登·非本刀引入）

- root 任务 `eslint . --max-warnings 5224` 实测 **5235 problems (0 errors)** → EXIT=1。
- 主线既登（`dd8f58a6` commit 文亲证）："root 聚合 5237→5235 恰等（协调方 sanction 5224→5235·…）·**root 任务 EXIT=1=预算行 5224 未随 sanction 落行勿自升承登**"——预算行落行权归协调方·本席 Ban 自调（§5 Ban 顺手消偿沿承）。
- 本刀零 TS/零 lint 词面新增（markers §7 同证）·root +0 归本刀。
- 包值恰等：web 601/api 1421/worker 954（REQUEST 门7 旧观察 950 系 `6ca9f3e7` 窗口径·主线 tokstream sanction +4=954·随重 pin 如实更记）/ai-runtime 628/db 1042/domain 115/contracts 265/ai-graphs 47/qdrant 27。
- turbo daemon 串根事故登记：首跑 lint/typecheck 任务 cwd 被 turbo 2.10 解析到同仓姊妹 worktree `meetwise-s4b`（298 外树路径·`git worktree list` 亲证同仓 `dd8f58a6 [line/tokstream-s4b]`）——`pnpm turbo daemon stop`+`TURBO_DAEMON=false --force` 复跑=全 1239 路径 meetwise-evk 零外树·计数恒等（双树码面同代互证）·本表数值以净跑 lint2/typecheck2 为准。daemon 串根面归协调方知悉（多 worktree 战役共性风险）。

## 6. docs:check 三分口径（P2 落锚）

- 基线（merge `c830405f` 树净·件① 移出 A/B 实测）=**2118**；落卷（件①+件②+本卷笔改·本树亲跑 EXIT=0）=**2119**；投影=2119 ≤cap 2120 余 1。
- cap 漂移：起草口径 cap 2112/基线 2109 → 主线 tokstream-s4b sanction cap 2112→**2120**（`scripts/ai-docs/public-text-policy.mjs:63-65` 亲证）。
- 件① .sql 确入扫面（TEXT_EXTENSIONS 含 .sql+packages/ 受管根·A/B 实测 +1）——起草投影「2111 余 1」绝对值随并线漂移·余量恰 1 恒等闭合。

## 7. markers 五类直扫（本刀改动集四件新增行·ttl-wire 05 形）

```
# 冲突标记：grep -E '^(<<<<<<<|=======|>>>>>>>)' <新增行>   → EXIT=1 零命中
# fake-green/绕过词：grep -Ei 'fake-pass|fake-green|always-pass|skip-gate'  → EXIT=1 零命中
# 测试门弱化：grep -E '\.only|\.skip\(|xit\(|@ts-ignore|@ts-expect-error|eslint-disable' → EXIT=1 零命中
# 遗留标：grep -E 'TODO|FIXME|HACK|XXX' → EXIT=1 零命中
# secrets 样值：grep -E 'sk-[a-zA-Z0-9]{8,}|BEGIN.*PRIVATE KEY' → EXIT=1 零命中
```
（实跑回执：对 0202.sql 全文+catalog.md +2 行+REQUEST.md 本刀新增行+本收据全文五类直扫·EXIT 全 1·「markers 五类」等叙述提法系叙述层引用不计命中沿 tokstream E2 豁免形。）

## 8. §0 重 pin 全表（EXEC 立项 @c830405f·blob 亲算+行锚逐条 rg/sed 亲证）

| 锚 | 起草 @6ca9f3e7 | EXEC @c830405f | 漂移判读 |
|---|---|---|---|
| 0103 | `3e3987c1`(355) | `3e3987c1`(355) 恒等 | blob 零漂；行锚修正=CAS `:262-267`→**`:242-244`**·score_card INSERT `:268-277`→**`:252-261`**（席1 P2 亲证·错锚非漂移）·:99/:284/:285/:286/:291/:298 恒等 |
| 0192 | `27b4c39d`(51) | `27b4c39d`(51) 恒等 | blob 零漂；行锚修正=头注 `:9-16`→**`:8-18`**·DO 块 `:27-40`→**`:22-37`**·CHECK `:43-50`→**`:42-49`**（19 值枚举 `:44-49`）·:51 VALIDATE 恒等 |
| 0100 | `d88b2910`(1031) | 恒等 | 零漂（:769/:890/:891/:902 亲证） |
| 0109 | `2fe4eca9`(527) | 恒等 | 零漂（:200/:511/:512/:527 亲证） |
| 0149 | `cec80b94`(83) | 恒等 | 零漂（:16-18/:48-50 亲证） |
| scoring-aggregation.ts | `6b1cf675`(113) | 恒等 | 零漂（:63/:68 亲证） |
| score-writer.ts | `fcb93f6d`(126) | 恒等 | blob 零漂；行锚席1 P2 全修正=def **`:63`**·fence 复核 **`:71-77`**·claim **`:80`**·writeFinalScoreCard 调用 **`:102`**·fence-tolerant **`:118-125`**（:33-34 两码·:121-124 catch·:124 上抛）·原 `:81-128`/`:97-103`/`:110-117` 行位误·**原 `:131-140` 段越 EOF 删**（文件 126 行） |
| adaptive-lifecycle.ts | `1e6129ed`(609) | 恒等 | 行锚 ±1：调用 `:495-502`→**`:496-502`**·:493 门恒等 |
| interview-consumer.ts | `27ddbcf1`(657) | 恒等 | 零漂（:463 亲证） |
| interview.proof.ts | `645ec783`(556) | 恒等 | 零漂（:25/:261/:307/:323/:326/:417/:520 亲证） |
| scor 五 proof | `333ff918`/`649c25d1`/`01f781e7`/`d61d0e22`/`7512b481` | 恒等 | 零漂（断言 :210/:203/:245 亲证） |
| domain-events-catalog.md | `31bfacf8`(73) | 立项 pin 恒等·件② 落卷后 `b4155710`(75) | 行锚席1 P2 修正=session_concluded `:58`→**`:59`**·interview_unavailable `:59`→**`:61`**·`## 3.`=**`:63`**·落点=:61 后 ## 3. 前 |
| run-e2e-isolated.mjs | `f986c56b`(3166) | **`e69e317a`(3189)** | **blob 漂移**（并线 tokstream 注册面）·行锚重 pin=注册块 `:662-675`→**`:680-701`**·scor 注册 `:1791/:1806/:1824/:1840/:1857`→**`:1809/:1824/:1842/:1858/:1875`**·scoring-integrity `:2383-2384`→**`:2401-2402`**·命令映射 `:2494-2503`→**`:2517-2525`** |
| package.json（根） | `f9755fa2`(669) | **`35611a1f`(675)** | **blob 漂移**（并线）·行锚 `:271`/`:495` 恒等零漂 |
| 链顶 | 201·头 0201 | 201·头 0201 恒等 | 0202 未占·占号成立（§0.3 复测） |
| lint 口径 | worker 950 观察 | worker **954** 恰等 | 主线 tokstream sanction +4（3b32b6c8 口径）·root 实际 5235/预算行 5224（§5） |
| docs cap | 2112/2109 | **2120**/基线 2118 | 主线 sanction（§6） |

## 9. 偏离清单（非零·五笔全登记）

1. **门 2f scoring-integrity 红（基线亲证）**：§2-2「PASS≠23 即停承登」+停止条件「验收红不可修」命中→STOP 承登（§4）·Ban 借机修沿承·未修未凑绿。
2. **门 7 root lint 5235>预算行 5224**：主线既登承登红（§5）·非本刀引入·Ban 自调预算行沿承。
3. **改前 run 四次基础设施失败后第五次成跑**：非「红重跑冲销」（四次均未达测量面·boot 段环境失败）·环境修复=docker volume prune 死卷清理 43.66GB+pnpm install --frozen-lockfile（即门 11）·全链如实登记 §3.1。
4. **收据 untracked 交付**：门 10「恰 3 tracked 路径」机械满足（commit 不含收据）·与 perf-prep tracked 先例的取舍如实登记·tracked 翻面权归协调方。
5. **门 7 worker 观察值 950→954**：REQUEST 起草口径随主线 tokstream sanction 漂移·随 §0 重 pin 如实更记（非翻转·上游 sanctioned 变更沿承）。

## 10. 旧代码忽略仍正确（wire/结构变更义务声明）

本刀唯一运行面变更=CHECK 约束值域扩 +1（expand-only）：旧读方（零直读消费面 rg 亲证）/旧写方（三函数原 19 值写点全部仍合法）/旧迁移（0192 已应用行零触碰）/隔离 proof 基座（自建最小表零 CHECK）在忽略本变更时行为恒等——扩域只新增合法值·不改既有消息形/键/流拓扑；目录补录为文档面。零 wire 契约字段增删·零 Redis/消息结构变更·义务零触。

## 11. diff numstat（本刀 commit 面）

```
（见 commit·恰 3 tracked 路径）
packages/db/migrations/0202_interview_event_kind_score_card_written.sql  | 27 +++++++++（A）
ai-docs/architecture/backend/domain-events-catalog.md                    |  2 +（+2/-0 纯增）
ai-docs/delivery/harness/evkind-scorecard-fix-REQUEST.md                | （重 pin+§9）
receipts/evkind-scorecard-fix/00-exec.md                                 | untracked 非受管根
```
