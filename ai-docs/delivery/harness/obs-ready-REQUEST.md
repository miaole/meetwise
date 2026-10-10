# #92 — readiness 深化刀（obs-ready · 迁移版本位 + worker fail-closed）

**状态**：`exec:prove_green` · base = 主线 `f47670e6`（origin/feat/mysql-schema-skeleton）· 分支 `line/obs-ready` · 立项依据 = W7 可靠性审计 #92 口径：API readiness 缺迁移版本维（#91 envschema 已 nail 落主线，本刀在其上深化）、worker `/readyz/worker` 缺省 fail-open（main.ts 原文 `options.workerReady?.() ?? true`）。

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
