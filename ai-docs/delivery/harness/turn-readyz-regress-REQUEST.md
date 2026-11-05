# TURN-READYZ-REGRESS 主线两疑似产品回归诊断修复刀 REQUEST（普查 proof-health-1106 复核·诊断+修复+起草+落码一体席）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落码同 commit 一体席·诊断/修复/门矩阵亲测读数随 §0/§2/§9 落卷·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve·est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 复现读数 · 引入提交 · 根因（两条独立·互不相关）

### 红A `pnpm turn-idempotency:prove`（普查 PRODUCT-REGRESSION?）

- **复现读数（origin/main `e282c5ebd` · 隔离 PG `meetwise-e2e-34005-1793905297704`）**：**3 FAIL / 3**——「并发重发受理（accepted/replayed）」「队列仅 1 answer job」「ledger 首答 identity」三断言全红；两并发 POST `/turn` 均 **500**；真实错误 **SQLSTATE 42703 `column i.resume_privacy_epoch does not exist`**，栈指 `enqueueInterviewJob`（`packages/db/src/interview/interview-jobs.ts` 父引用锁读 SELECT `FROM interview i JOIN resume r`）→ `interview.service.ts` /turn 调用点 → 500 unhandled。
- **引入提交（git 考古·非新近回归）**：结构不相容自 **proof 出生 commit `3f5bdc805`（2026-08-18·同 squash 序列父 `d9394e914` 已载 v64 简历引用契约+迁移 0064）**。三证：①`git log -S resume_privacy_epoch -- packages/db/sql/` 全史零命中——boot 世界 sql/01-23 镜像链**从未有**该列；②harness（`_neg-harness.ts`）迁移白名单全程无 0064（`git log --all -S 0064_interview_resume_epoch_reference -- _neg-harness.ts` 零命中）；③门控父引用 SELECT 自 `d9394e914` 即在（-S/G 双证）而 /turn 自同日即调 `enqueueInterviewJob`。→ **proof 出生即红，从未绿过**；`ai-docs/delivery/harness/g7-green-gap.md:80`（3 FAIL·「answer job 去重面与现实现漂移」）与 `ai-docs/delivery/harness/product-campaign-LEDGER.md:243`（「turn-idempotency/resume-reference 基线红」）在卷承登一致。
- **根因判定：proof 过期（出生夹具/世界漂移），非产品缺陷**。proof 挂 boot 世界（无 0064 列）+夹具 interview 无 resume 绑定，与同日落地的 v64 契约（answer job 必须绑父 interview 隐私 epoch）结构性不相容。产品幂等语义本身完好：`claimInterviewAnswer` FOR UPDATE 串行占用→先 accepted 后 replayed；`enqueueInterviewJob` ON CONFLICT 唯一键幂等回读返同 jobId——修后绿实证（§2）。**用户可见影响：无**（生产走真迁移链、0064 列齐、语义正确；boot 世界仅测试夹具面）。

### 红B `pnpm api-runtime-role:prove`（普查 PRODUCT-REGRESSION?·隔离 2/2 复现+本地第 3 次）

- **复现读数（origin/main `e282c5ebd` · 隔离 PG `meetwise-e2e-38216-1793905628845` 等）**：**1 FAIL / 共 6 断言**——`低权 API readyz/api 使用无表权限 SELECT 1 仍为 200` FAIL；`GET /readyz/api` **503**；其余 5 断言（直读 user_account 拒/livez 200/signup/profile/login）全 PASS。真实路径：`HealthService.apiReady()` #92 迁移版本位 **直读 `SELECT max(version COLLATE "C") FROM schema_migrations`** → NOINHERIT 运行时登录裸连接（探针绝不 SET ROLE）**零表授权** → **42501 permission denied** → 非连接类 → `migration_mismatch` → 503。
- **引入提交：`10e802c26`（2026-10-10 · fix(healthworker): audit readiness 深化，API 迁移版本位 + worker workerReady fail-closed）**——账本读进探针位时未考虑 NOINHERIT 运行时登录零表授权面（#92 卷 obs-ready-REQUEST 全文零处提及该身份）。
- **根因判定：产品缺陷（真回归被 proof 抓住）**。生产 canonical 身份=provisionRuntimeLogin 建的 NOINHERIT 运行时登录（`rate-limit.service.ts:14` 注记明示），其下 `/readyz/api` **恒 503 migration_mismatch 假红**——`remote-deploy.sh:72` compose `--wait` 部署健康门/编排 readiness 全被拖死（可用性回归·obs-ready-REQUEST §9-E1 已登同族「readiness 拖死部署」脆弱面）。该 proof 自 `3f5bdc805`（2026-08-18）钉 readyz 200 契约七周后回归，非 CI 触达 27 天未觉（11-06 普查才抓）。

## §1 修法

### 件① 红A——proof 按真迁移链世界重挂（断言不放松）

`apps/api/test/turn-idempotency.proof.ts` 重写：①世界换真迁移链单真相装库（`DROP 账本+loadMigrations+runMigrations`·`runtime-role-http.proof` 同形，世界无关确定形）；②API 以 **NOINHERIT 运行时登录**连库（`provisionRuntimeLogin`+PGUSER/PGPASSWORD·生产同构）；③夹具经**真实 HTTP `/begin`** 流程产生合法 v64 start job（resume ingested·epoch=1 绑定·`resume-reference-http.proof` 种子形）；④question 种子经 **principal GUC 事务**（0058 `interview_question_privacy_active_write_guard`+FORCE RLS 生效面·`int-transcript-preview-submit-http.proof` adminAs 先例）；⑤**三条原断言逐字保留**（并发重发 accepted/replayed 恰一/队列仅 1 answer job payload 保真/ledger 首答 identity 不覆盖），另加 v64 引用形断言（reference 64·answer job 无 resume locator·绑父 epoch）与 begin 绑定断言。**语义零放松**：三条原断言即抓本回归的面（500≠202 修前必红）。

### 件② 红B——产品码修：#92 设计按网关元数据先例补完

沿 **0040/0041/0042 网关元数据先例**（「gateway role 零表授权·只执行评审过的固定 SECURITY DEFINER 函数」架构不变量）：新迁移 **`0225_readiness_migration_ledger_gateway.sql`** 建 `gateway_migration_ledger_max()`（**plpgsql** SECURITY DEFINER STABLE·search_path 钉死·REVOKE PUBLIC/app_role·GRANT EXECUTE TO app_gateway_role·返回 `max(version COLLATE "C")` 与探针原查询同字节序·**`to_regclass` 短路：账本表不存在（drift 纯文件重放世界）返回 NULL 绝不出错**——rev r1·§9-8）；`health.service.ts apiReady()` 账本读改经 **`db.asGateway`**（SET LOCAL ROLE app_gateway_role 调该函数·`DbService.asGateway` 既有原语零新增）。**探针仍恒两读有界、fail-closed 语义零变**（账本为空/缺失→函数返 NULL 仍 mismatch 503 fail-closed·SELECT 1 短路不变·连接类归 db_unreachable 不变）；**运行时登录零表授权不变量保持**（无任何表 GRANT·账本只读不可写·业务表照旧不可读）。

### 件③ 配套断言（修复前红→修复后绿）

- `runtime-role-http.proof.ts` 四层钉：①运行登录直读 schema_migrations **拒**（零表授权不变量）；②直调 `gateway_migration_ledger_max()` **拒**（EXECUTE 只经 app_gateway_role SET ROLE 门·NOINHERIT 不自动继承）；③经 asGateway 网关账本读 == 真实账本 max（**抓回归主断言·修前 42P01 红**）；④HTTP readyz 200（**修前 503 红**）。
- `obs-ready.proof.ts` P7 注入面随路径移 **DbService.asGateway 缝**（P7a 连接类错→db_unreachable / P7b 无码错→migration_mismatch / P7c 两读有界·池面 SELECT 1 恰 1+网关读恰 1——三断言语义不变·pool.connect/client.query 双形注入经实测两次挂起/崩溃后弃用·见 §1.3-4）。
- `validate.ts` readiness 计数钉随池面/网关面分账（readyz 池面 1 条·/health 2 条·DB 失败短路 3 条——`两条有界只读` 语义不变，账本读不经池 `.query` 面如实改钉）。

### §1.3 否决

1. **红B 改走「给运行时登录 GRANT SELECT ON schema_migrations」**：破「网关/运行时零表授权」架构不变量，且对象级授权使 21 个 `provisionRuntimeLogin+DROP ROLE` proof 需补 REVOKE（大爆炸面）——否决。
2. **红B 改走「账本不可读即跳过检查」**：fail-open，违 #92 fail-closed 立项口径——否决。
3. **红A 改 boot 世界补装 0064+改夹具绑简历**：boot 世界镜像链与迁移链漂移面继续扩大（0064 依赖 0049/0052/0054 触发器族），且与「真迁移链单真相」（DBHY-1）方向相逆——否决。
4. **obs-ready P7 沿 pool.connect/client.query 注入**：实测两失败（async 形丢回调=pg-pool 内部 query 永久挂起；回调形悬空 rejected Promise=unhandledRejection 崩进程；且已释放 client 复用面双向污染）——弃用，改 DbService.asGateway 实例缝注入（探针账本读唯一入口·零池内自用面误伤）。

## §2 验收（门矩阵·本席一体席亲跑读数）

1. **红A proof**：`pnpm turn-idempotency:prove` **EXIT=0 · 5/5 PASS**（修前 3 FAIL/42703）。
2. **红B proof**：`pnpm api-runtime-role:prove` **EXIT=0 · 9/9 PASS**（修前 5 PASS+1 FAIL·readyz 503·42501）。
3. **回归护面**：`pnpm obs-ready:prove` **EXIT=0 · 18/18 PASS**（#92 语义 P0-P7 全链·P7 新注入面）· `pnpm api:validate` **EXIT=0 · 220 PASS 0 FAIL**（readiness 计数分账钉全绿）。
4. **隔离族门**：`pnpm neg:interview` EXIT（§9）· `pnpm db:prove` EXIT（§9·迁移链含 0225 全链装库）。
5. **静态门**：`pnpm arch` EXIT（§9）· `node scripts/provider-egress-inventory.mjs` EXIT（§9）· 受影响包（apps/api/packages/db）typecheck/lint 不高于基线（§9）。
6. **两 policy 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 **scanned 2491=cap 2491 恰等**（+2=新受管 migration 0225（.sql ∈TEXT_EXTENSIONS）+本卷 REQUEST·界值亲测步进前 PTP_FILE_LIMIT:2490 红亲证）· `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12**（四联动点 2_491/f-2491.md/:2492 恰等改·沿 CAP-SANCTION-2491 注记）· markers 五类改动集组装词面 0 命中。
7. 不跑浏览器 UI runner（派单令）。

**门停止条件（命中即停手上报）**：两 proof 任一红·neg:interview/db:prove 新红·arch 红·check-docs 非 2491 恰等红·PTP 非 12/12·markers 非零·typecheck/lint 高于基线。**状态位（本节即「四处」之 §2 门尾）：`draft:awaiting_pre_exec_dual`**。

## §6 CI 接入建议（本刀不改 CI·仅建议与理由）

两条 proof 均为 **PG-ISOLATED 类（自管隔离容器·`run-e2e-isolated.mjs` 形·单跑 ~90-120s）**，非无 DB 静态门，故按派单令本刀不改 CI（含 `.github/workflows/ci.yml`/`nightly-ciw2.yml` 零字节）。建议：**两键接进 nightly-ciw2.yml 阻塞面**（沿 `quality:governance`/`authz5a` 族 nightly 接线先例形）：①`turn-idempotency:prove` ②`api-runtime-role:prove`。理由（实证）：两键均不在 CI 触达面=回归滞留实证——红A 出生即红 80 天无人觉（2026-08-18→11-06 普查）、红B 引入 27 天无人觉（10-10→11-06）；且红B 为可用性级（生产 readiness 恒假红·部署门拖死）优先级最高。若 CI runner 无 docker-in-runner 面，则沿 runner 自管容器形需 `docker info` 可用性预检（CI 环境核归 CI 线·非本刀）。

## §8 停止条件 · STOP

- 停止条件全载 §2 门停止条件行。已核不触发：两 proof 绿·obs-ready/api:validate 绿·cap 恰等步进在授权内（派单「两 policy 按新增受管文件实测步进」随令·常设预授权「恰等步进预登」先例形）。
- **STOP = `draft:awaiting_pre_exec_dual` 四处同值**（Status 头+§2 门尾+本节+卷尾注）——本刀起草与落码同 commit 一体席（诊断+修复+门矩阵亲测随 §0/§2/§9 落卷），**pre-exec 双审两独立外席待派**（对 §0 根因判定、§1 修法、§9 门读数复核·alone≠dual·Ban self-approve）。双审 PASS 前不 merge 不 push；双审任一 FAIL → 停手上报回炉。
- 卫生：est live=0（全门本地/隔离库·零外呼零 secrets 零模型调用）·actualSpendCny=null·⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase·不动其他工作树·不碰 Key 值。

## §9 EXEC/一体席记录（2026-11-06 · worktree `meetwise-regr` · 分支 `line/regr-draft`）

1. **授权链**：协调方派单（诊断并修复 meetwise 主线两处疑似产品回归·卷 `turn-readyz-regress-REQUEST.md`·状态 draft:awaiting_pre_exec_dual·pins 十一值·门矩阵 §2·建议接 CI 不改 CI·两 policy 实测步进·commit 一行大白话不 push）→ 本席一体席落卷+落码。
2. **树**：worktree `../meetwise-regr`（主仓仅 `git worktree add` 一次）· 分支 `line/regr-draft` · 基线 origin/main `e282c5ebd`（fetch 后亲证）· `pnpm install --frozen-lockfile` 门前置 · `docker info` 可用（colima 免启）。
3. **码面落点（7 文件）**：①`apps/api/test/turn-idempotency.proof.ts`（红A 重写·件①）②`packages/db/migrations/0225_readiness_migration_ledger_gateway.sql`（新·件②）③`apps/api/src/modules/health/health.service.ts`（件②·账本读改经 asGateway·注释随修）④`apps/api/test/runtime-role-http.proof.ts`（件③四层钉）⑤`apps/api/test/obs-ready.proof.ts`（件③P7 注入面移 asGateway 缝）⑥`apps/api/test/validate.ts`（件③readiness 计数分账）⑦`packages/db/src/principal.ts` **零净改**（探索期临时 GRANT 已逐字节还原·`git diff` 零行亲证）。
4. **门矩阵读数（EXIT 原值）**：①`pnpm turn-idempotency:prove` **EXIT=0 5/5**（修前 3 FAIL·lint 去告警重写后复跑再证 5/5）②`pnpm api-runtime-role:prove` **EXIT=0 9/9**（修前 1 FAIL）③`pnpm obs-ready:prove` **EXIT=0 18/18**④`pnpm api:validate` **EXIT=0 220 PASS**⑤`pnpm neg:interview` **EXIT=0**（108 条负路径用例全绿·§2 门④）⑥`pnpm db:prove` **EXIT=0**（migration 全链含 0225 装库绿·§2 门④）⑦`pnpm arch` **EXIT=0**（8 warnings 0 errors·warnings 非门·零新违规面）⑧`node scripts/provider-egress-inventory.mjs` **EXIT=0**（adapters=5·operations=10·pairs=55·releaseEvidence=false）⑨`node scripts/ai-docs/check-docs.mjs` **EXIT=0 scanned 2491=cap 2491 恰等**（步进前 PTP_FILE_LIMIT:2490 真红亲证）⑩`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**（selected=12/12）⑪受影响包 typecheck/lint **EXIT=0 不高于基线**（apps/api typecheck EXIT=0 + lint **1545=cap 1545 恰等贴线** 0 errors·改写 proof 去告警后实测回落恰等；packages/db typecheck EXIT=0 + lint **1042=cap 1042 恰等贴线** 0 errors）⑫markers 五类改动集（7 改动文件+2 新受管件）运行时组装词面 **0 命中**+行首冲突标记 0。
5. **两 policy 步进**：`CAP-SANCTION-2491` 注记两 policy 文件链区**追加**（既有注记零改写·史录全保留）·MAX_FILES **2_489→2_491**（+2 恰等=新受管 migration+REQUEST·届值 e282c5ebd 扫 2489 恰等亲证）·proof 四联动点 **2_491/f-2491.md/:2492** 恰等改·PTP 12/12 亲跑。
6. **偏离**：一处如实承登——派单预期两红「各自独立判定」成立（红A proof 过期/红B 产品缺陷），但红A 修复采用了红B 的 NOINHERIT 运行时登录生产同构形（红A proof 新世界即红B proof 世界）=两件共用身份面，属修法协同非越面。P7 注入面两次实测失败（§1.3-4）如实承登非静默。
7. **STOP 终态**：四处（Status 头/§2 门尾/§8/卷尾注）同值 **`draft:awaiting_pre_exec_dual`**——pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve·本刀不宣称关闭·批表行与 Status 终翻面权归协调方。
8. **rev r1（2026-11-06·登记源=核对路审查报告）**：核对路发现 **`pnpm drift:prove`（CI 必绿·ci.yml 挡合并面）被 0225 打红**——原 `LANGUAGE sql` 字符串体在 PG16 `check_function_bodies` 默认开（psql 重放）下 **CREATE 期即分析表引用**，drift 临时库=纯文件重放（migrate runner 的账本引导不在迁移文件里）无 `schema_migrations` → CREATE 报 relation 不存在 → ON_ERROR_STOP 红。**修法（rev r1·件②）**：函数体改 plpgsql + `to_regclass('public.schema_migrations')` 短路——表不存在（drift 重放世界）返回 NULL 绝不出错；迁移完成世界行为语义零变（readiness 仍返回真实最新版本号；落后/为空仍 mismatch 503 fail-closed·库不可达仍 SELECT 1 短路 db_unreachable）。rev r1 门复测（§2 矩阵重跑）：`pnpm drift:prove` EXIT=0（修前红复证）·`pnpm migrate:prove` EXIT=0（迁移行为不变）·迁移编号唯一性核对过（0225 单号无重复）·两 proof 5/5+9/9·obs-ready 18/18·neg:interview 108 全绿·typecheck/lint 恰等贴线·arch/egress/check-docs 2491 恰等/PTP 12/12/markers 0 全绿。**P2 三笔随修**：①「四处」指落实位 §2 门尾（本节上 prior 版枚举 Status 头+§2 门尾+§8+卷尾注中 §2 门尾行原无状态字面·已补）；②turn-idem proof 恢复 `assertIsolatedTestTarget` 前向断言；③LEDGER/g7-green-gap 引用补全仓路径 `ai-docs/delivery/harness/…`。

---

*TURN-READYZ-REGRESS REQUEST · 2026-11-06 起草落码一体席 · **`draft:awaiting_pre_exec_dual`** · base origin/main `e282c5ebd`（#211 online-pay-status-pin）· 分支 `line/regr-draft` · 工作树 `meetwise-regr` · 立项出处=普查 `.tmp/proof-health-1106.md`（PRODUCT-REGRESSION? ×2）+协调方派单 · 修法=红A proof 重挂真迁移链（断言不放松）+红B 新迁移 0225 网关函数补完 #92 设计（网关元数据先例形·零表授权不变量保持）· 门矩阵=两 proof 5/5+9/9+obs-ready 18/18+api:validate 220+neg:interview+db:prove+arch+egress+check-docs 2491 恰等+PTP 12/12+markers 0+typecheck/lint 贴线 · est live=0 · pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（Postgres · PostgresSaver · pgvector·adr-postgres-retained.md）· 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · ⛔push ⛔merge 主线*
