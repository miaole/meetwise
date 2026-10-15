# #92 — readiness 深化刀（obs-ready · 迁移版本位 + worker fail-closed）

**`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line OBS-READY nail」段 :2617 已载 post 双审 errata 落卷 7ff73111 BOTH PASS+nail merge @`b284d8ca`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `exec:prove_green` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push） · base = 主线 `f47670e6`（origin/feat/mysql-schema-skeleton）· 分支 `line/obs-ready` · 立项依据 = W7 可靠性审计 #92 口径：API readiness 缺迁移版本维（#91 envschema 已 nail 落主线，本刀在其上深化）、worker `/readyz/worker` 缺省 fail-open（main.ts 原文 `options.workerReady?.() ?? true`）。

## §0 背景与现状（亲读）
- API readiness：`apps/api/src/modules/health/health.service.ts` + `health.controller.ts`（#91 已含 `config.envSchema` 位）；readiness = SELECT 1 + 配置位，**无迁移版本维**——迁移未跑完/漂移的库会被判可接流量。
- worker：`apps/worker/src/main.ts` startMetricsExposition `/readyz/worker` 缺省 `?? true`（fail-open）；`apps/worker/src/drain-loop.ts` ready() 的 `lastSuccessAt` 构造时即置 now → **首拍成功前即"就绪"**（启动窗 fail-open，审计原文「缺省 fail-open」）。
- 迁移 runner 口径（`packages/db/src/migrate.ts`）：版本=**文件名词干**（loadMigrations），canonicalMigrations 按词干排序；账本 `schema_migrations(version text PK)` 存完整词干。
- 任务②（关键配置缺失）已在 #91 T1 覆盖（readiness 已含 configReady）——本刀**不重复**。

## §1 手段（简化优先·最小改）
1. **①API 迁移版本位**：`packages/db/src/migrate.ts` 新增 `latestMigrationVersion(dir)`（同一版本源：词干 + `readdirSync` 零内容 IO，每拍现算）；`HealthService.apiReady()` 由 boolean 扩为三态 `'ok'|'db_unreachable'|'migration_mismatch'`——SELECT 1 短路（查询恒 ≤2 有界只读，不触业务表），账本 `max(version COLLATE "C")`（字节序）对目录 max（JS 默认 `.sort()` 同字节序），**刻意成对**：不依赖 DB 集群 locale 与 Node ICU；账本不可读/目录不可读（`MIGRATIONS_DIR` 覆盖，默认模块 URL 五级上溯 `packages/db/migrations`，dev 与 Dockerfile `COPY . .` 同构）一律 fail-closed。controller 增 `schema.migration` 固定枚举位（ok/mismatch/unknown，无 error/版本号/拓扑泄露——validate 降级体契约保持）。
2. **③worker fail-closed**：main.ts `?? true` → `?? false`（未注入回调=503 unready）；drain-loop `ready()` 增 `everSucceeded` 首拍成功门（首拍成功前一律不就绪；其后 3 连败/陈旧窗照旧）。
3. **相邻修复（必要前置）**：`apps/worker/src/adaptive-lifecycle.ts:15/17` 两条同源 import 重复绑定 `buildAdaptiveDeps`/`planCompetencies`——严格 ESM 链接下 import main.ts 即炸（基线预存：`prove:model-cost-metrics` 同炸复现）。合并为并集导入，零行为变更；否则本刀 worker 侧 prove 无法 import `startMetricsExposition`。
4. **runner 接线**：`run-e2e-isolated.mjs` 增 `obs-ready:prove:raw`（allowlist + 映射 + migrate 名单）；**`env-schema:prove:raw` 同入 migrate 名单**——#92 语义下空库（无 schema_migrations）诚实变 503，#91 E 段「正常启动 200」必须以预迁移目标为前提（不动其断言，补其前提）。

## §2 停止条件判定（STOP）
审计预警「迁移版本源与 runner 口径冲突（0043 双前缀等）→停手上报」。**亲核不触发，继续**：
- 0043 单文件（`0043_langgraph_checkpoint_least_privilege.sql`），无「0043 双前缀」实体；
- 实际双数字前缀 = **0143**（db_id_v7_unify / sse_push_notify）与 **0152**（consent_revoke_grant / resume_soft_delete_fence）——但 runner 版本=完整词干，两侧 max 均按完整词干字节序比较，序确定、无歧义；155 文件全匹配 `^[0-9]{4}_[a-z0-9_]+\.sql$`，无同名词干；runner `migration_manifest_duplicate_version` 不涉数字前缀。isolated 链 applied=155 全绿 + P0 口径自证在卷。

## §3 Ban
零新迁移文件 · 探针恒只读（SELECT 1 + 账本 max，不触业务表）· 公开探针体无键名/版本号/拓扑泄露 · Key name-only · 零 `.env` · est live=0（prove 全程隔离库/进程内/回环，无模型与外网调用）· 实现 不自批 · **alone≠dual**（post-prove dual 待席2）。

## §4 验收（prove·est live=0）
- **API 侧** `apps/api/test/obs-ready.proof.ts`（isolated：`corepack pnpm obs-ready:prove`）：**15/15 PASS · EXIT=0**——P0 口径自证（账本 max=目录 max，applied=155 含 0143/0152 双前缀）·P1 一致→200 ok·P2 注入假版本 `9999_zz_obs_ready_injected`→503+mismatch 原因位·P3 反向（删真 max 行）→503，还原→200（每拍现算自愈）·P4 漂移期 /livez 恒 200 + /health 同面·P5 DB 不可达→unknown 位+短路 1 条·P6 MIGRATIONS_DIR 不可读→fail-closed。
- **worker 侧** `apps/worker/test/obs-ready.proof.ts`（进程内/回环）：**6/6 PASS · EXIT=0**——W1 缺省无回调→503 unready（fail-open 修复本体）·W2 谓词 false→503/true→200·W3 启动窗端到端（gated drain-loop 首拍未成功→503，成功→200）·W4 ragReady 原语义钉住。
- **零回归**：`pnpm api:validate`（readiness pin 诚实更新为「两条有界只读」2/4/5/5 计数）· `pnpm env-schema:prove`（补预迁移前提后原断言零改）· `prove:drain`（新增 #92 首拍门两钉）· `prove:model-cost-metrics`（相邻修复复活，EXIT=0）。
- 交付：commit（author mw-obsready-exec）push `origin line/obs-ready` + numstat + prove EXIT + 日志样例 + pins 声明。

## §5 Non-claims
本刀 ≠ 迁移链本身正确性（runner/checksum/drift 面归 #88 系）≠ worker 全依赖就绪（jobWakeupListener/redis-wakeup ready() 启动窗语义未动，超本刀最小改）≠ ragReady 缺省翻转（仅钉原语义）≠ HA/releaseEvidence（false · Not HA）≠ config 维（#91 已 nail，未重复）≠ dual。

## STOP
lifecycle：`exec:prove_green:awaiting_post_prove_dual` · STOP（本席止于 prove 绿 + 交付落账；dual 复核、pins 十一值批裁、合线另席）· Ban self-approve · alone≠dual。

## §9 并线重锚注记（re-anchor · 2026-10-13 · 并线重锚席）
- **并线**：worktree 挂树 `meetwise-obsr` → `git merge --no-ff feat/mysql-schema-skeleton`（fetch 后 local==origin==cfead6e4 恒等零漂·merge-base=f47670e6·behind 484）。冲突 6 文件全数逐值重放，零机械合并：
  1. `apps/api/package.json`·`apps/worker/package.json`——prove 注册行并集：支线 `prove:obs-ready` + 主线 `prove:ha2-drain`/`prove:ha3-metrics-pool-errors` 双保留（并集解沿 BILL4 e1cb1110 协调方授权惯例）。
  2. 根 `package.json`——支线 `obs-ready:prove`/`obs-ready:prove:raw` 两行保留；`breaker:prove` 随主线删除（724d61b5 AG-24 熔断残留清理两门整删·主线 ai-runtime package.json 无 `prove:breaker` 亲证，非注册行并集面）。
  3. `apps/api/src/modules/health/health.controller.ts`——融合解：类注=支线三面描述（①SELECT 1 ②config 位 ③迁移版本位·`schema.migration` 固定枚举 ok/invalid/mismatch/unknown）+主线 HA-2 C4 排水段双保留；`apiReady` 体=主线排水门代码原位（先于 DB 探针·确定性信号）+支线 #91/#92 三面注释（db_unreachable→迁移位只能 unknown·fail-closed）。
  4. `apps/worker/src/adaptive-lifecycle.ts`——取主线单条并集 import（`buildAdaptiveDeps, buildResumeFactPool, planCompetencies, selectPlannerFacts` 四名一条+主线新增 `type ScoredCriterionDisposition`）＝支线 #92 相邻修复（同源 import 重复绑定、严格 ESM 链接即炸）同目标的终态结构；支线修复注释随之弃用（所述「两条同源 import」缺陷在新结构不复存在，保留即失真）。
  5. `scripts/run-e2e-isolated.mjs`——映射链并集（支线 `obs-ready:prove:raw`→`pnpm -C apps/api prove:obs-ready` + 主线 `consent-min:prove:raw` 双保留）；migrate 名单并集=主线全量注册（ag-a/b/d/e/f、fence-reflow-repair、role-input、weakness、quiz-list、requeue-backoff、bill1/bill2/bill3/bill4、ag12、ag19、report-retry、scor-parity 等）+支线两插入（`obs-ready:prove:raw`+`env-schema:prove:raw`·随 `api:validate` 后位，后者系本刀补预迁移前提）；allowlist 区自动合并逐值复核双保留（env-schema 既存·obs-ready 支线增）。
  - **自动合并区逐值复核**：`main.ts` workerReady fail-closed 落 `:267-270`（`?? false`+#92 注释三行）·`:769-771` workerReady 链=主线新结构（usageCalibration reconcile/retention 两循环 ENABLED 旋钮可选形 `?? true`·支线零触该链）；`drain-loop.ts` everSucceeded 首拍门 `:18/:49/:73-76` 完整+主线 HA-2 NamedStop/drainWithDeadline 段共存；`health.service.ts` 三态 ApiReadiness+`latestMigrationVersion`+`MIGRATIONS_DIR` fail-closed 完整；`validate.ts` readiness pin 2/4/5/5 完整。
- **门矩阵（重锚复验 · 2026-10-13 · worktree meetwise-obsr）**：
  - `pnpm obs-ready:prove`（runner·隔离 PG·migrate 名单在册）：**API 15/15 PASS · EXIT=0**（P0 口径自证至 P6b MIGRATIONS_DIR fail-closed 全链）。
  - `pnpm -C apps/worker prove:obs-ready`：**红——既存主线基线红承登**（非本刀面·不修不越界·见下条）。
  - `pnpm env-schema:prove`：**22/22 PASS · EXIT=0**。
  - `pnpm turbo typecheck --force`：**3 任务 successful · 0 cached · EXIT=0**（worker 无 typecheck 任务·主线同构）。
  - `pnpm docs:check`：**EXIT=0 · 2057 ≤ cap 2064**（首跑伪红 2067 系冲突六件未 add 时 `ls-files --cached` 按 stage 1/2/3 重复计数 +12 虚增；六件 add 后 2054+3=2057 对账即绿）。
  - markers 五类（词面沿 i6-239 五类标记词口径运行时组装防自指·改动集 653 文件）：**零命中**。
  - 补充证据 `pnpm -C apps/worker prove:drain`：**EXIT=0**（everSucceeded 首拍门重放面·import 链仅 drain-loop.ts 不经 main.ts，不受下条基线红染）。
- **worker obs-ready 基线红承登（归协调方/原刀处置）**：`apps/worker/src/qbank-release-sweep.ts:79` `asQbankControlExecutor(` 括号失衡（少一闭括号·swc `Expected ',', got ';'`）。A/B 三证：①该文件非本刀触面（3684bc00 改动集零此文件·由主线侧 b20ee350 qbank-control-sec 刀带入）；②合并后 worktree 文件与 `git show cfead6e4` blob 逐字节恒等（diff 空）；③对 pristine cfead6e4 blob 独立 `@swc/core parseSync` 同位同错复现（79:1）。主线卷在案：ag19-prompt-version-REQUEST :175「b20ee350 带入的主线既存基线红…归协调方/原刀处置；本刀按 Ban 范围外零修」+ ag24 :230/:235 同登。本刀 exec 时该文件尚不存在故当时 worker 6/6 绿；并线后 main.ts 依赖链加载即炸致本门不可运行。W1-W4 断言本体零改动随卷，待基线红清欠后复跑；首拍门重放面现行证据=drain prove EXIT=0。**清欠载体点名（post 双审 E2·防重复派单）=`line/ci-wiring2` `86303901`**（ci-wiring2 EXEC 簇Ⅱ 第 0 步破面修复：恰 1 字符右括号最小修复 `}));`→`})));`，本仓本地对象亲证在档——`git show 86303901` diff 恰 qbank-release-sweep.ts 1 文件 1 行 1 字符·commit 词面自证修复前 TransformError 79:90/TS1005(79,91) 与本承登同位同错）——W1-W4 复跑随该线并线清欠后行使，勿另派重复刀。
- **post 双审 errata 落卷（2026-10-14 · 前勘正席·post 双审 BOTH PASS 随卷 append·六件全亲证后落笔）**：
  - **E1（席2·生产运维语义变化登记）**：`ops/deploy/remote-deploy.sh` 迁移步 `:66`（`dc run --rm -T migrate`）前滚后，第 5 步 `:68-72`（`dc up -d --no-deps --wait --wait-timeout 180`）部署失败即 trap `restore_and_fail`（`:39-47`）还原 .env 旧镜像行、重拉旧 image——但库已前滚：#92 时代稳态下旧 image 自带旧迁移目录，账本 max(新)≠目录 max(旧) → `/readyz/api` 恒 503 `migration_mismatch` → compose `--wait` 180s 超时 → `:43` `rollback_restart_failed(需人工介入)` exit 1。定性：fail-closed 是本刀的正确代价（漂移 schema 绝不接流量），但**回滚腿结构性不可达**——migrate 一旦前滚，回滚到旧 image 必然不健康（唯一例外=新旧 image 跨 #92 语义的过渡次部署）；**须前向修复非回滚**（修法归协调方/后刀裁量），并登记**同步 deploy runbook** 义务。
  - **N1（席2·后置小刀注记）**：`health.service.ts` apiReady 双查询窗（`:44` SELECT 1 与 `:49-51` 账本 max 之间）恰逢 DB 抖动/断连时，账本查询抛错落 `:55` catch → 恒返 `migration_mismatch`（`:57`），真态实为 `db_unreachable`——公开位被错标 mismatch（controller 映射 schema.migration=mismatch），编排方误读「迁移漂移」而非「库不可达」。仍 fail-closed（503 恒真）仅原因位失真；后置小刀宜在 catch 分支区分连接类错误归并 db_unreachable/unknown 位——本笔仅登记不修。
  - **N5（席2·重试环建议登记）**：`scripts/run-e2e.mjs:146` worker 就绪探测为单发 `fetch(/readyz/worker)` 无重试环——首拍门（everSucceeded）生效后 worker 首拍成功前该位恒 503，单发命中启动窗即假红 `worker_not_ready`（机制正确、探测时机过敏）。建议沿同函数 `:131-135` api livez 40×1s 轮询同形补重试环——本笔仅登记不修。
  - **勘正两笔（席1·纯注释笔零行为变更）**：①`health.controller.ts` 类注枚举叙述——原「位值只有 ok/invalid/mismatch/unknown 固定枚举」失真，勘为 `schema.migration` 位实发恰 ok/mismatch/unknown 三值（controller `:40-42` 映射与 `:44/:50` 载荷亲证）、invalid 仅属 `config.envSchema` 配置域（`:49`）不混入本位；②`health.service.ts:53` 行注——原「目录不可读 → undefined → 不等」失真，勘为目录不可读=readdirSync 抛→下方 catch→migration_mismatch、undefined 仅空目录（readdirSync 成功但零 .sql）、两路均 fail-closed。
  - 本块前笔（E1/E2/N1/N5）均为登记/点名/注记面，零代码行为变更；勘正两笔系注释失真修复，行为面零触（无断言/门改动）。
- **卷状态**：`rebase 重锚完成·awaiting post dual`（上方 STOP 行 lifecycle 前值史录保留·零改）。⛔push（纯支线）。
