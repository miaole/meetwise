# OBS-ENVSCHEMA — 配置集中校验刀（EXTREV-3C OBS-LOG #91 · EXEC 简版合并 REQUEST）

**Status**: **`exec:awaiting_post_prove_dual`**（EXEC 已按审计口径实施+prove · 本档=简版合并 REQUEST+EXEC 记账 · **Ban self-approve** · **alone≠dual** · 待 post-prove 双审）
**Status+（EXEC append-only）**: prove 终态 `pnpm env-schema:prove` EXIT=0（21/21 全绿·isolated runner 容器 nonce attested）· 零回归批 12 绿 + 4 红（neg:input 4/135·resume-reference 5 红·uc001-neg 7/26·uc001-bound 11/17——**经 stash 基线复跑逐条实证为 base 6aa83c48 既有红同文同数，与本刀无关**，全账见 §3）· est live=0
**Status++（rev2 · post-dual 席2 FAIL 窄口径修复 · append-only）**: databaseTargetProblem 误报缺陷已修（rawEnv 单源判定）+ A10 回归钉 · 复跑 EXIT=0 **22/22** · tsc 26→30（+4 TS2532 测试侧·26 既有零漂移实证）· 勘误归档见 §5 · 修复 commit author `mw-envschema-exec2` 直送席1 补签
**Date**: 2026-10-07
**审计项**: issues-master #91（P1·第3批C 可靠性/运维/API）：「配置无集中校验（约 108 个 env 变量散落 70 个文件），AUTH_SECRET 缺失照常启动并通过 readiness」·锚点 auth.service.ts:57-58 / principal.guard.ts:52 / health.service.ts:20-27（评审基线漂移已亲读复核）·修复口径：「引入 env schema（zod）启动即校验，缺关键密钥 fail-fast 并纳入 readiness」
**Base**: 主线系 `feat/mysql-schema-skeleton` @`6aa83c48` · 分支 `line/obs-envschema`（工作树 `meetwise-line-obsenv`）
**Honesty**: 三档清单全部消费点 file:line 亲读实证（见 §1 表）；红线：Ban 108 全量收编、Ban 大规模改写 process.env 读法（审计口径④）、Ban secrets/.env 入库、est live=0（零 Key 触碰零外呼）。

---

## §0 头 · 状态机

本刀=**只做启动校验层**：boot 最早点对关键必需 env 做 zod 校验 fail-fast（缺失/格式错→进程启动即死、错误信息一次性列全缺失项），并把配置校验状态纳入 readiness。不动散落各文件的既有 process.env 读法（那是债，本刀不还）。姊妹刀：#89 pino+requestId（OBS-LOG 同批）；#92 readiness 深化（迁移版本/依赖拓扑/workerReady fail-open）**非本刀范围**。

## §1 三档定谳表（逐消费点亲读 · 禁把 108 个全收）

| 档 | 变量 | 消费点（亲读） | 定谳依据 |
|---|---|---|---|
| **T1 必需（无条件 fail-fast）** | `AUTH_SECRET` | `apps/api/src/platform/principal.guard.ts:52`（缺→所有 Bearer 验签恒 null→401，认证全瘫）；`apps/api/src/modules/auth/auth.service.ts:57-59`（缺→登录恒 500 auth_not_configured）；`profile.service.ts:111`（降级不回签）；`privacy.service.ts:74`（HMAC 回退根） | #91 审计本体：缺失照常启动+readiness 全绿，运行时才瘫 |
| **T1 必需** | 数据库目标：`DATABASE_URL` **或** `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE` 完整五件套（择一，与 db SSOT 同口径） | `packages/db/src/principal.ts:758-790`（resolveDatabaseConnectionString：缺目标抛 database_target_missing；password 允许空串、不允许未定义）；`apps/api/src/platform/db.service.ts:8`（`createPool()` 构造期 **eager** resolve——今日缺 DB 实已启动即死，本刀把事实显式化+可读化+列全） | readiness SELECT 1 的前置；生产 compose `:?` 强制（compose.prod.yml:12） |
| **T2 条件必需** | （无成员） | `MODEL_API_KEY` 经亲读**降级 T3**：生产 compose 明文「Text provider credentials are Worker-only … no API service receives either key」（`docker/compose.prod.yml:271-273`，Key 仅挂 worker 块 `:277`）；API 侧全文 grep 零文本模型消费（仅 vision/voice，见 T3）。`WEB_ORIGIN` 生产 fail-closed 已由 `apps/api/src/main.ts:78-79` 既有检查覆盖，schema 不重复收（双源禁） | 审计草案「非预览必填?」与部署契约冲突——契约胜，定谳不属争议 |
| **T3 可选（运行时 fail-closed · 设计如此 · 不入本层）** | `MODEL_API_KEY`/`MODEL_BACKUP_API_KEY` | `packages/ai-runtime/src/model-client.ts:583`（缺→known_not_executed「未配置→未派发」）；`text-endpoint-config.ts:63`；测试面**主动删除**行使该路径（`apps/api/test/validate.ts:31-34`「Contract tests intentionally exercise the unconfigured-provider failure path」、`test/_neg-harness.ts:41-43`） | 无条件收编会打断 contract tests 一等路径+违背 worker-only 契约 |
| **T3 可选** | `DASHSCOPE_{EMBED,RERANK,ASR,TTS,STREAM_ASR,STREAM_TTS}_API_KEY` | `packages/ai-runtime/src/dashscope-native-config.ts:35`（「缺即 `*_not_configured`，绝不回退别的 key」）；`apps/api/src/modules/interview/interview-voice.ts:65`（asr_not_configured→503 文字回落）；`interview-voice-seams.ts:17`（「A config throw must not take down text-interview DI」） | 每能力独立开关，缺失=能力关闭非部署损坏 |
| **T3 可选** | `DASHSCOPE_VISION_API_KEY`（OCR） | `packages/ai-runtime/src/vision-endpoint-config.ts:63`；`apps/api/src/modules/resume/ocr-model-client.ts:12-24`（OCR 三锁 production/enforce/public-preview refuse-closed；缺 Key→known_not_executed） | OCR 本身预览-only，双 flag 缺省 0 |
| **T3 特记** | `DASHSCOPE_API_KEY` | `dashscope-native-config.ts:57`（LEGACY broad key：**出现即拒** dashscope_native_broad_api_key_forbidden） | 「禁止」类非「缺失」类，既有适配器面守卫已盖，schema 不收 |

**停机条件核对**：zod=catalog `4.4.3`（pnpm-workspace.yaml:11），`z.preprocess/optional/safeParse/issue` 实跑通过，非不兼容；MODEL_API_KEY 三档归属以部署契约实证定谳（上表），**未触发停机上报条件**。

## §2 逐条改动清单（file:line 现状→目标）+ 非范围/Ban

| # | 码面 | 改动 |
|---|---|---|
| C1 | `apps/api/src/platform/env-schema.ts`（新增） | zod schema（T1 面字段级格式）+ `parseCriticalEnv` 纯函数（**zod 基础字段 issue 时 refinement 会被跳过——DB 择一关系放 parse 后普通代码恒算，保证一次性列全**）+ `assertCriticalEnv` 抛 `env_schema_invalid: <缺失项全列>`；问题码稳定：`missing:AUTH_SECRET`/`invalid:DATABASE_URL:<因>`/`database_target_missing:…(lacking: …)` |
| C2 | `apps/api/src/main.ts:31-37` | `createApp()` 最早点插 `assertCriticalEnv()`（serve/测试/embedder 全 boot 路径统一过闸；bootstrap catch 既有 `console.error(error.message)+exitCode=1` 即死）；DATABASE_URL 深度格式（协议/TLS/生产本地 host/组件冲突）仍以 `@meetwise/db` 为单一真相，本层只做存在性/粗格式前置 |
| C3 | `apps/api/src/modules/health/health.service.ts` | 增 `configReady()`（同一纯函数每次现算，返回布尔）；`apiReady()` SELECT 1 语义零改 |
| C4 | `apps/api/src/modules/health/health.controller.ts` | `/readyz/api`+旧 `/health`：`{status:'ok',config:{envSchema:'ok'}}`；任一失败→503 `{status:'degraded',config:{envSchema:'ok'\|'invalid'}}`（**降级体无 error 字段——validate.ts:209-211 既有契约亲读后保持**；键名/明细只进 boot 日志，公开探针不泄拓扑——controller 注记纪律） |
| C5 | `apps/api/test/env-schema.proof.ts`（新增）+ `apps/api/package.json`（`prove:env-schema` 槽）+ 根 `package.json`（`env-schema:prove`/`:raw` 包装，沿 privacy-erasure:http:prove 形制）+ `scripts/run-e2e-isolated.mjs`（allowlist+isolatedCommand 各加一行，既有模式逐字同构） | prove 接线（见 §3） |
| C6 | `ai-docs/requirements/use-cases/cloud-runtime-and-migration.md:155-158`（UC-runtime-health-001 主流程 2/3 两行） | readiness 响应面文档对齐（新增 config 布尔位），零语义漂移 |

**非范围（全列）**：①#92 readiness 深化（迁移版本/workerReady fail-open）——归 OBS-LOG #92 刀；②worker 进程 boot 校验（worker 既有 `resolveDashscopeNativeConfig`/model-cost 启动期守卫，其 workerReady 面归 #92）；③108 个 env 全量收编、集中 config 对象、70 文件 process.env 读法改写（Ban④）；④WEB_ORIGIN/RESUME_ENC_KEY/PAY_PROVIDER_SECRET 等其余密钥的收编（RESUME_ENC_KEY 等生产已由 compose `:?` 强制；本刀清单只钉 T1 两项，扩清单=另一刀）；⑤pino/requestId（#89 姊妹刀）。

**Ban**：Ban self-approve·Ban retry-to-green（attempts 全账 §3）·Ban secrets/.env 入库·Key name-only（零 Key 值触碰·est live=0）·Ban SSOT 无关触碰（CLAUDE.md 零字节）·Ban 收编超出 §1 表的任何变量。

## §3 prove 判据与实测（attempts 全账）

**门（全过）**：
1. **缺 AUTH_SECRET spawn 启动即死**：`node --import @swc-node/register/esm-register src/main.ts`（净化 env，只缺 AUTH_SECRET）→ 退出码 **1**、stderr/stdout 含 `env_schema_invalid`+`missing:AUTH_SECRET`、从未监听（无 `api on`）。日志样例：
   ```
   env_schema_invalid: missing:AUTH_SECRET
   ```
2. **多缺失项一次性列全**（双缺 spawn）：`env_schema_invalid: missing:AUTH_SECRET; database_target_missing:DATABASE_URL or complete PG component set (lacking: PGHOST,PGPORT,PGUSER,PGPASSWORD,PGDATABASE)`
3. **格式错启动即死**：`DATABASE_URL=ftp://…` → exit 1+`invalid:DATABASE_URL:…`（target_missing 不双报）。
4. **全配置正常启动 OK**：isolated runner 容器（nonce attested）上 boot 成功，`/readyz/api`→200 `{status:"ok",config:{envSchema:"ok"}}`；旧 `/health` 同面；`/livez` 恒 200。
5. **readiness 含配置状态**：E2 断言 `body.config.envSchema==='ok'`；F2 fail-closed 面：清掉 AUTH_SECRET 后 `configReady()===false`。
6. **prove 汇总**：`pnpm env-schema:prove` EXIT=0，**21/21**（A1-A9 单元面 9 + B/C/D spawn 死亡面 5 + E boot/readiness 4 + F 配置位 3）· est live=0 · 零外呼。

**零回归批（attempts 全账 · Ban skip-as-pass · 12 绿 4 红·4 红全数 stash 基线复跑实证为 base `6aa83c48` 既有红）**：

| 目标 | 结果 |
|---|---|
| api:smoke（toolchain+contract+display-names） | rc=0 |
| prove:public-preview-write-gate | rc=0 |
| api:validate（isolated·readiness 断言 206-211 全过） | rc=0 |
| api-runtime-role:prove（readiness 断言 :38-39 全过） | rc=0 |
| neg:auth / neg:commerce / neg:resume / neg:interview / neg:bend | rc=0 ×5 |
| **neg:input** | **rc=1（4/135 红）——基线复跑同 4 红同文（sqli-in-status-query-nocrash / non-uuid-id/resume-delete / xss-in-feedback-comment-nocrash / xss-in-learning-topic-nocrash）** |
| int-transcript-preview-submit:http:prove | rc=0 |
| privacy-erasure:http:prove | rc=0 |
| **resume-reference:http:prove** | **rc=1（5 红：begin 202 单一 start job / resume_id+epoch 绑定 / locator 剥离 / 重复 begin 幂等 / 低权 login locator·epoch）——基线复跑同「5 项失败」同文** |
| **uc001:nhp-neg:prove** | **rc=1（asserts=26 failed=7·GAP-UC001-NEG-01）——基线复跑 asserts=26 failed=7 全同** |
| **uc001:nhp-bound:prove** | **rc=1（asserts=17 failed=11·GAP-UC001-BOUND-01）——基线复跑 asserts=17 failed=11 全同** |
| typecheck | 基线 26 错=改后 26 错（同集合，零新增；apps/api 裸 tsc 口径，与既有基线一致） |

基线日志留档：/tmp/neginput-baseline.log、/tmp/rr-baseline.log、/tmp/u1n-baseline.log、/tmp/u1b-baseline.log。**结论：本刀 diff 零新增红；4 红均为 `feat/mysql-schema-skeleton` 在飞既有红（其 GAP 脚注自称 honest red retained），禁本刀借机修（归各线负责席）。**

未跑面（如实）：uc/harness 族（uc002/010/011/014/018/019/025/033/turn-idempotency/sse-push-notify 等）与 neg:auth 等同走 `_neg-harness.boot()` 同一 createApp 路径，本批已抽 neg:all 六组+两类异构 env boot（preview=1、PG 组件式）覆盖；scor-00:http:prove 未跑（legacy 栈 opt-in 警告面，boot 路径与上同）；e2e 全链未跑（est live=0 车道不含）。

## §4 pins（十一值照抄）+ Non-claims

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼·零消耗·est live=0）

Non-claims：本刀 ≠ 108 env 全量治理 ≠ 集中 config 对象 ≠ worker 侧校验 ≠ #92 readiness 深化；T3 可选 ≠ 无守卫（运行时 fail-closed 既有）；`config.envSchema:'ok'` ≠ 依赖拓扑健康声明（仅 T1 存在性/粗格式）；prove EXIT=0 ≠ DONE（claimDone=false · local green = NOT_READY · awaiting post-dual）。

## §5 勘误归档（post-dual 双审席2 FAIL 窄口径处方 · append-only · §3 原文零改写）

**rev2（2026-10-07 · 席2 FAIL 处方逐字执行 · 其余面席2 已 PASS 不重开 · 修复后直送复审席1 补签）**：

1. **勘误①（§3 typecheck 行失实）**：§3 「typecheck | 基线 26 错=改后 26 错（同集合，零新增）」实测失实——该 26=26 系本刀 proof 文件落盘**前**的快照；proof 落盘后裸 tsc 实测 **26→30**（+4 = `test/env-schema.proof.ts` 4×TS2532「Object is possibly 'undefined'」，测试侧·沿 ERRATA-1 放宽先例不入产品码门）；复核：26 既有错集合零漂移实证（file+code 归一 diff 空集，AFTER_MINUS_PROOF=26=ORIG26）。
2. **勘误②（产品码单点缺陷+修复记录）**：席2 实测坐实 `env-schema.ts databaseTargetProblem` 缺陷——parse 失败分支以 `{}` 传入致组件存在性真相被丢弃：**五件套齐全+仅缺 AUTH_SECRET → 误报 `lacking: PGHOST,PGPORT,PGUSER,PGPASSWORD,PGDATABASE`**。修复（处 方逐字）：组件存在性改 **rawEnv 单源判定**——`PGPASSWORD` 用 `rawEnv[name] !== undefined`（空串算已供，对齐 principal.ts:767）；其余四件用 `blankToUndefined(rawEnv[name]) !== undefined`；消灭 `{}` 回退。prove 增 **A10** 回归钉（五件套齐全+仅缺 AUTH_SECRET → problems 精确等于 `['missing:AUTH_SECRET']`，禁含 database_target_missing 成员）；复跑 `pnpm env-schema:prove` **EXIT=0（22/22）**；tsc 30≤30 门（26 既有零漂移+4 TS2532 测试侧）。A1-A9/B/C/D/E/F 既有断言全数零改 PASS。
3. **docs:check inherited-red 定性**：`PTP_FILE_LIMIT`（MAX_FILES=2_048，public-text-policy.mjs:40）在本刀 base `6aa83c48` 即已红（本席实测 managed 4126 > 2048；席2 处方口径基线 4585 tracked 超限）——**inherited-red 与本刀无关**（本刀 +3 文件仅使计数 4126→4129）；该门为干净 CI checkout 设计，本地长青工作树超限属环境既有态，归 docs 门负责席，本刀不禁借机修。
4. 复审路径：修复 commit（author `mw-envschema-exec2`）已 push `line/obs-envschema`，直送席1 补签；本 §5 为 append-only 勘误层，§0-§4 原文不重写。

## STOP

**STOP · `awaiting_post_prove_dual` · alone≠dual。** 实现不自批；post-prove 双审 PASS 后由 meetwise 明示才回填；Ban retry-to-green；neg:input/resume-reference/uc001-neg/uc001-bound 4 红均为既有红（基线实证），不构成本刀 retry 面禁借机修（归各线负责席）。

---

*OBS-ENVSCHEMA EXEC REQUEST · 2026-10-07 · exec:awaiting_post_prove_dual（rev2 窄口径修复后重送） · base `feat/mysql-schema-skeleton`@`6aa83c48` · 分支 `line/obs-envschema` · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null · Dual PASS ≠ 合并 · Ban self-approve*
