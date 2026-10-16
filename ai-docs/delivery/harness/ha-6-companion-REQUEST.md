# HA-6 · HA 配套三件（R-20 连接预算 + R-21 PgBouncer 预览尺度裁决 + R-23 多实例状态处置 · HA 簇中优先 · EXEC REQUEST 起草 · docs-only 零码动）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `ha6-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding · **Dual PASS ≠ 开工** · alone≠dual）
**Date**: 2026-10-11
**审计项**: LEDGER HA 簇配套行（`ai-docs/delivery/harness/product-campaign-LEDGER.md:134`「R-20/R-21/R-23/R-24/R-36/R-37/R-44/R-50/R-51 | 连接预算/PgBouncer/多实例状态/队列指标/登录锁定/scrypt/索引/生命周期 | HA 配套 | 中」——本刀只取 **R-20 连接预算 / R-21 PgBouncer / R-23 多实例状态** 三件，余六件 :134 后刀）·:136 执行裁定（HA 簇北星门 2 工作·pins `haStatus=NOT_HA` 维持至簇收口）·HA-1 rev2 §9-9（R4）稀释表继承面（「恢复全局精确上限归 R-20/21（Redis 共享桶）与 R-23 配套后刀，届时按本表逐流继承核对」——**本刀即该后刀**）
**Base**: `feat/mysql-schema-skeleton` @`20186718`（主线 tip 本席 `git rev-parse` 亲证=h3 nail 落卷提交）· 分支 `line/ha-6-companion`（工作树 `meetwise-ha6`：`git -C ../meetwise worktree add ../meetwise-ha6 -b line/ha-6-companion 20186718` · 与 ha-1..ha-5 线互不触碰）
**前序 HA 簇**: R-17 归 HA-1（nail，merge 主线 @`b4b756b4`·七 service 拓扑 `docker/compose.ha.yml`）·R-18/19 归 HA-2（merge @`ed0505a6`）·R-22 归 HA-3（merge @`e41aba3e`）·R-26 归 HA-4（merge @`007b718f`）·R-47 归 HA-5（merge @`1d477a72`）——本刀=R-20/21/23 配套收口
**Honesty**: 蓝本与全部涉案码 file:line 起草席亲读（本章 §0 全录，**@`20186718` 实树逐锚重 pin**——HA-1 稀释表锚 @`c5300f73` 有 5 处行号漂移，§0.4 漂移表如实登记）；零实跑零 prove（本刀=REQUEST 起草，prove 判据见 §4 待 EXEC 兑现）；est live=0（静态 proof+compose config 断言，零生产操作·零真实流量·零模型外呼）。
**格式先例**: `ha-1-redundancy-REQUEST.md` / `ha-2-graceful-REQUEST.md` / `ha-3-db-resilience-REQUEST.md` / `ha-5-alerting-REQUEST.md`（§0-§8 同构）。

---

## §0 立靶（蓝本+码面亲读 · file:line 全录 @`20186718`）

### 0.1 蓝本与授权链

1. LEDGER:125-134 HA 簇表=北星门 2 专属工作面；:134 配套行映射本刀三件（R-20/R-21/R-23）；:136「HA 簇=北星门 2 工作」+「pins `haStatus=NOT_HA` 维持至该簇收口」。
2. HA-1 已按序落卷（R-17 nail @`b4b756b4`·多副本拓扑本体 `docker/compose.ha.yml`），R-20/21/23 是其 §4-3 显式登记的后刀：「R-20/21/23/24/36/37/44/50/51 配套（连接预算/PgBouncer/队列指标/登录锁定/scrypt/索引等）→ 后刀；本刀仅登记 rate-limit 单实例内存缺口（rate-limit.service.ts:4-6），零改」。
3. HA-1 rev2 §9-9（R4）收据 `receipts/ha-1/rate-limit-dilution.json` 在主线（本席亲证 @`20186718` 在树）：13 流 ×2 稀释账 + disposition 明言归本刀继承核对。
4. `ai-docs/delivery/harness/TASK-SOP-v2.md:86`：「HA-GATE 簇=两波：波1 无云先行（停机/DB 韧性/告警）→波2 需云+先决 S9（冗余/备份/**PgBouncer**）」——PgBouncer 的秩序位=波2 云侧，是本刀 R-21 预览尺度裁决的蓝本依据之一。
5. `ai-docs/delivery/north-star-ha.md:67`（「默认 / stub / 本地 compose 一律 `haStatus: NOT_HA`」）=本刀起点钉；本刀收口≠haStatus 翻转（§7）。

### 0.2 R-20 现状盘点：连接预算（池清单 × max × 拓扑重算）

**池上限单源**：`packages/db/src/principal.ts:946` `max: Number(o.max ?? process.env.PGPOOL_MAX ?? 20)`——全仓生产池默认 max 读同一 env `PGPOOL_MAX`（默认 20），显式 `max` 覆盖仅两处（sse-listen/job-wakeup 均 `max: 1`）。池参数四参+keepAlive/query_timeout 已由 HA-3 落（principal.ts:946-964·零改）。

**业务 PG（`DATABASE_URL` 单一目标）连接预算表**——业务 PG 目标唯一性亲证：checkpoint 池与业务库「one target」（`apps/worker/src/main.ts:127-131` 注释原文「ordinary DB work and LangGraph checkpoints one target」·`createCheckpointer` 用 `resolveDatabaseConnectionString()` :123=同 `DATABASE_URL`，principal.ts:759）：

| 池（purpose） | 进程 × HA-1 副本 | 单实例 max | 锚（@`20186718`） | HA-1 拓扑上界 |
|---|---|---|---|---|
| api | api-a/api-b ×2 | 20（默认 env） | `apps/api/src/platform/db.service.ts:7` | 40 |
| sse-listen | api ×2 | **1**（显式 max:1） | `apps/api/src/platform/sse-notify.service.ts:151` | 2 |
| worker | worker-a/b ×2 | 20（默认 env） | `apps/worker/src/main.ts:430` | 40 |
| checkpoint | worker ×2 | 20（默认 env） | `apps/worker/src/main.ts:133` | 40 |
| job-wakeup | worker ×2 | **1**（显式 max:1） | `apps/worker/src/main.ts:661` | 2 |
| **业务 PG 小计（稳态上界）** | | | | **124** |
| migrate（一次性·瞬态） | job ×1 | ≤20 | `packages/db/src/migrate-cli.ts:6`（+:47/:72 两临时子池） | 0（`compose.prod.yml:247-248` `service_completed_successfully` 门下与 api/worker 不并行；滚动重部署窗例外→入余量账） |

**条件行（专用 URL 池——落点由云侧密钥值决定，是否与业务 PG 同实例本仓不可证=S15 亲证项）**：

| 池（purpose） | 进程 × 副本 | 单实例 max | 锚 | 同实例共址时 |
|---|---|---|---|---|
| qbank-control | worker ×2 | 20（默认 env） | `apps/worker/src/main.ts:501`（`QBANK_CONTROL_DATABASE_URL` 专用·compose.ha.yml:249/:313 必填） | +40 |
| rag-control | worker ×2 | 20（默认 env） | `apps/worker/src/rag-control-runtime.ts:36`（`RAG_CONTROL_DATABASE_URL` 专用） | +40 |
| privacy-worker | worker ×2 | 20（默认 env·**可选**：URL 未配即禁用，privacy-worker-runtime.ts:21-25） | `apps/worker/src/privacy-worker-runtime.ts:32` | +40 |

**PG 侧上限（对照面）**：本仓全部 compose **零处 `max_connections` 配置**（rg 亲证 `docker/*.yml` 零命中）→ dev/demo/沙箱/ha-dual-pg 的 `pgvector/pgvector:pg16` 走镜像默认 **100**；生产 PG=云侧（`docker/compose.ha.yml:53` `DATABASE_URL: ${RUNTIME_DATABASE_URL:?…}` + `:54` `DATABASE_SSL_MODE: verify-full` + `rds_ca` secret——PG 服务器在云，max_connections 是云参数，本仓不可证，**S15 亲证项**）。PG16 默认 `superuser_reserved_connections=3`（PG 公开默认值·非仓内锚）→ 应用可用 **97**。

**重算结论（R-20 缺口本体）**：
- **单副本现状**（compose.prod 拓扑·今生产形态）：api 21 + worker 41 = **62 ≤ 97** → 单副本下预算未爆（R-20 在单副本时代不构成在飞缺口·如实登记不冒功）。
- **HA-1 拓扑**（api×2 + worker×2）：2×21 + 2×41 = **124 > 97 → 超售 27**。拓扑收口把连接需求翻倍而 PG 侧上限未动=**R-20 在多实例下为真缺口**；今生产宿主尚未应用 compose.ha.yml（HA-1 est live=0·宿主应用另行授权），故缺口随拓扑应用才兑现——**本刀必须在拓扑应用前把帽落卷**（预算表入 B4/S15 继承面·沿 `receipts/ha-1/resource-budget.json`「Ban 静默超售」同口径）。

### 0.3 R-21 现状盘点：PgBouncer 有无

**全仓零引入**（本席 rg 亲证：`docker/ scripts/ packages/ apps/` 四面 "pgbouncer" 零命中；docker/ 全 19 个 compose 文件无 pgbouncer service）→ R-21 不是「改造既有」而是「该不该加」的裁决题。裁决四依据（§1-W3 详述）：① W1 一行 env 帽后预算 76 ≤ 97，PgBouncer 要解决的问题已被更简手段解决；② 本仓两条 LISTEN 专用连接（sse-listen :151 / job-wakeup :661）与 transaction-pooling **语义不兼容**（LISTEN/NOTIFY 须会话粘性，session mode 又不省连接）——引入即须 LISTEN 旁路=复杂化；③ 新增单点服务=给 HA 拓扑添 SPOF；④ TASK-SOP:86 秩序位=PgBouncer 归波2（需云+S9 先决）。

### 0.4 R-23 现状盘点：多实例状态（HA-1 拓扑下的进程态清单）

| 进程态 | 形态 | 多实例语义 | 处置 | 锚 |
|---|---|---|---|---|
| **限流令牌桶+并发槽** | 每 api 实例进程内 Map（**单实例内存**，:4 注释自证「多实例生产换 Redis 共享桶(seam:同 allow 接口)」） | per-key 有效上限 ×N（LB 轮询近似均摊·N=2） | **本刀 W2 主体**：HA-1 R4 表 13 流继承核对+×N 接受裁定 | `apps/api/src/platform/rate-limit.service.ts:4-36`（allow :12 / acquireSlot :24 / releaseSlot :31） |
| **principal 状态缓存** | 60s 内存缓存（status+pwd_epoch）·改密走 evict | 单实例 evict 即时；多实例最坏 ≤60s 最终一致+缓存重填 TOCTOU 窗 | **零改·登记维持**（码面注释已自证 seam：「要真·即时 + 跨实例一致须换 Redis 共享吊销源(已知 seam)」） | `apps/api/src/platform/principal.guard.ts:9-15`（:14-15 seam 句） |
| **SSE 泵注册表/连接** | 每实例仅本进程 SSE 连接；事件事实在 DB（seq 重放） | **无需共享态**：pg_notify 天然广播每副本 LISTEN（每进程恰一条 max:1 专用池）；跨副本续传靠 Last-Event-ID+账本重放——HA-1 V5 已实证「零 redis 零粘性」 | 零改（前刀已证已收） | `apps/api/src/platform/sse-notify.service.ts:11/:150`；HA-1 REQUEST §3-V5/nail 卷 |
| **worker 租约互斥** | DB `FOR UPDATE SKIP LOCKED`+CAS lease_owner | **无需共享态**（租约在 PG·跨副本天然互斥）——HA-1 V6 已证接管+CAS 拒 | 零改 | `packages/db/src/report/report.ts:26-35`；HA-1 V6 |
| **parse 并发槽** | `acquireSlot('resume-parse:global', PARSE_MAX)` 进程内 | ×N 稀释（6→12） | 归 W2 逐流表第 10 行 | `apps/api/src/modules/resume/resume.service.ts:20/:48` |

**限流 13 流 ×2 稀释表（继承 `receipts/ha-1/rate-limit-dilution.json`·值全等本席逐流亲证 @`20186718`；锚漂移 5 处如实登记）**：

| # | 流 | 现值 | ×2 有效 | 锚 @`20186718`（HA-1 JSON 锚→今锚·漂移加粗） |
|---|---|---|---|---|
| 1 | signup:email | 3 burst / 0.02 perSec | 6 / 0.04 | `auth.service.ts:28`（零漂） |
| 2 | signup:ip | 10 / 0.05 | 20 / 0.1 | `auth.service.ts:12-13/:28`（零漂） |
| 3 | signup:global | 60 / 1 | 120 / 2 | `auth.service.ts:28`（零漂） |
| 4 | login:email | 5 / 0.2 | 10 / 0.4 | `auth.service.ts:54`（零漂） |
| 5 | recruiter invite:principal | 12 / 0.05 | 24 / 0.1 | `recruiter.service.ts:114`（**漂：67→114**） |
| 6 | recruiter invite:ip | 12 / 0.05 | 24 / 0.1 | `recruiter.service.ts:116`（**漂：69→116**） |
| 7 | quiz SSE 并发槽 | 5 concurrent | 10 | `quiz.controller.ts:56`（零漂） |
| 8 | interview SSE 并发槽 | 5 concurrent | 10 | `interview.controller.ts:262`（**漂：260→262**） |
| 9 | resume-file:principal | 15 / 0.1 | 30 / 0.2 | `resume.service.ts:36`（零漂） |
| 10 | resume-parse:global 并发槽 | 6 concurrent（PARSE_MAX :20） | 12 | `resume.service.ts:20/:48`（零漂） |
| 11 | voice:principal | 40 / 0.3 | 80 / 0.6 | `interview.service.ts:25/:338`（**漂：:316→:338**·常量 :25 零漂） |
| 12 | turn:principal | 30 / 0.2 | 60 / 0.4 | `interview.service.ts:27/:399/:432`（**漂：377/410→399/432**·常量 :27 零漂） |
| 13 | report_retry:per-report | 3 / (3/3600) | 6 / (6/3600) | `interview.service.ts:30/:701`（**漂：679→701**·常量 :30 零漂） |

（漂移原因面：锚点基于 @`c5300f73`，主线其后并入 LEVEL-SCHEME 等刀，interview/recruiter 文件体量增长行号后移；13 流**值**逐流亲证全等零漂。）

### 0.5 靶心一句话

单副本时代连接预算 62 ≤ 97 从未爆表，HA-1 拓扑一落即 124 > 97 超售 27——R-20 的修法是一行 `PGPOOL_MAX` env 帽（简化优先，非 PgBouncer 非改码）；R-21 的裁决是**不加**（预算已解+LISTEN 不兼容+添 SPOF+秩序位在波2）；R-23 的处置是**接受 ×N 稀释并落档**（Redis 共享桶登记归波2，码面零改）——三件合起来=「拓扑收口后的两笔账（连接账/限流账）记清楚、用最薄的手段封顶、重的方案留给云侧」。

---

## §1 范围（三件 · EXEC 依此实现 · W2/W3 以登记档+负断言为交付形态）

| 件 | 锚 | 修法（EXEC 依此实现） |
|---|---|---|
| **W1 连接预算帽（R-20 本体）** | `docker/compose.ha.yml:51-70`（`x-ha-cloud-runtime-env` 锚块）+ §0.2 预算表 | ① 锚块内增**一行** `PGPOOL_MAX: "12"`——经 YAML 锚合并自动覆盖 api-a/api-b/worker-a/worker-b 四副本（本席亲证四 service environment 全部 `<<: *ha-cloud-runtime-env`，worker-a/b 另并 `*ha-worker-native-model-env` 不冲突；compose.ha.yml:51 锚定义+四消费点）；同 env 顺带帽住 worker 进程全池（qbank/rag/privacy 默认池同读 ：946）——一行帽全域。② 落 **`receipts/ha-6/connection-budget.json`**：§0.2 全表（稳态行+条件行+瞬态行）+约束公式 **6P+4 ≤ 97 → P ≤ 15**（2×(P+1)+2×(2P+1)；P=`PGPOOL_MAX`）+P=12 稳态账 **76**（余 21=滚动窗 migrate 瞬态 ≤12+条件池惰性+运维余量）+共址 worst-case 条件账 148（+惰性注记：pg Pool 按需建连+idle 30s 回收 principal.ts:950·qbank/rag 仅治理重建门控使用 main.ts:498-500 注释·privacy 未配即禁用）+**S15 前置行**（「生产应用/翻转前须亲证生产 PG `max_connections` ≥97 或按实值重算本表」·沿 resource-budget.json B4/S15 前置形）。③ **EXEC 双审可在 10 ≤ P ≤ 15 内调值**（调值须预算表+§4-A1 断言预期同步重算落卷；越界=修法漂移回 REQUEST 补审）；起草席推荐 12 |
| **W2 限流 ×N 处置（R-23 主体·零码）** | `receipts/ha-1/rate-limit-dilution.json`（继承面）+ `rate-limit.service.ts:4` seam | **裁定：预览尺度接受 ×N 稀释（零码·零基建）**，落处置登记档（C3）固化三面：① **13 流继承核对表**=§0.4 表（值全等+5 锚漂移重 pin 在卷）——HA-1 R4 disposition 的「届时按本表逐流继承核对」以本刀兑现；② **接受理由三条**（(a) ×2 后逐流绝对值仍有界（6/20/120/10 burst 等）且 LB 轮询均摊下 2× 为上界非叠加放大；(b) Redis 共享桶成本面：`apps/api/package.json` 今日零 redis 依赖（rg 亲证零命中）+须新增 Redis 面与 fail-open/closed 裁决+密钥授权——违反 EXTREV-7 与 LEDGER:137「右列不加厚」；(c) 并发槽/吊销窗同理有界：SSE 槽 5→10、parse 6→12、吊销 ≤60s 最终一致（principal.guard.ts:14-15 seam 在卷·零改））；③ **Redis 共享桶=登记不实施**：归 S15/波2 云侧需 Redis 面时另刀（TASK-SOP:86 波2 口径·rate-limit.service.ts:4 seam 注释维持原样零改） |
| **W3 PgBouncer 裁决（R-21·零码）** | §0.3 四依据 + TASK-SOP:86 | **裁定：预览尺度不加 PgBouncer**，四理由落处置登记档（C3）：① 预算面——W1 一行帽后 76 ≤ 97，问题已被更简手段解决（简化优先）；② 技术面——sse-listen（sse-notify.service.ts:151）与 job-wakeup（main.ts:661）两条 LISTEN 专用连接与 transaction-pooling 语义不兼容（LISTEN/NOTIFY 须会话粘性；session 模式不省连接）→ 引入即须 LISTEN 旁路=复杂化；③ 拓扑面——新增单点服务=给 HA 拓扑添 SPOF；④ 秩序面——TASK-SOP:86 明载 PgBouncer=波2（需云+S9 先决）·本裁定=预览尺度预填入继承面，**波2 云侧时按实况重裁**（非永久封死）。随卷负断言：全仓 compose/scripts/packages/apps 零 pgbouncer（§4-A4） |

---

## §2 非范围（全列 · 越界即废）

1. **RDS 切换/云托管/生产 PG 参数调整**（含 max_connections 云参数实值）——云侧归 S15；本刀只在 budget.json 留 S15 亲证前置行，零云操作。
2. **R-24 队列指标 / R-36 登录锁定 / R-37 scrypt / R-44 索引 / R-50/51 生命周期**（LEDGER:134 同行余六件）——后刀。
3. **Redis 共享桶实施**——本刀裁定=接受 ×N（W2）；Redis 面归 S15/波2 另刀。Ban 本刀顺手实现。
4. **rate-limit/吊销窗/并发槽产品语义零改**：`rate-limit.service.ts`、`principal.guard.ts`、各调用点一行零触（W2=登记非改码）。
5. **池参数/池创建面零改**：principal.ts:946-964（HA-3 已落 keepAlive/query_timeout 等）与全部 createPool 调用点零触；R-22 面零重做。
6. **宿主升 4c8g 执行**——HA-1 resource-budget.json 已裁决选①且前置入 B4/S15 继承面，执行归云侧，非本刀。
7. **compose.prod.yml / compose.prod.override.yml / 其他既有 compose 零改**（治理契约）；唯一 compose 落点=compose.ha.yml 非治理叠加层一行（C1）。
8. **haStatus/pins 翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` 维持；既有 NOT_HA 常量钉/proof 收据面/`probe.multi.mjs` fail-closed 零改零弱化。
9. **生产宿主/生产库任何操作**：验证面全在静态 proof+compose config；B 组沙箱探针若保留也仅沙箱（est live=0）。
10. 顺带非范围：LEDGER/backlog/SSOT 状态行（只读引用·nail 时才改）、`compose.ha.sandbox.yml` 本体（B 组只沿其形制，若 EXEC 裁撤则零触）。

---

## §3 逐条改动清单（file 现状 → 目标 · EXEC 落码对账表）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `docker/compose.ha.yml:51-70`（`x-ha-cloud-runtime-env` 锚块） | 无 `PGPOOL_MAX` → 增一行 `PGPOOL_MAX: "12"`（P 值双审可在 10-15 调·调值须 budget.json+§4-A1 同步重算）；**其余键零增零删零改** |
| C2 | `receipts/ha-6/connection-budget.json`（新增） | 不存在 → §0.2 预算表机读卷：pools 行（含锚）+公式（6P+4 ≤ 97）+P 值+稳态/条件/瞬态三账+S15 前置行+`haStatus/releaseEvidence/claimProductionHA` 三钉（沿 resource-budget.json 形制） |
| C3 | `ai-docs/delivery/harness/ha-6-companion-disposition.md`（新增·名字 EXEC 可随仓惯例定） | 不存在 → W2 处置登记（13 流继承核对表+接受 ×N 三理由+Redis seam 波2 登记+吊销窗登记）+ W3 PgBouncer 四理由裁定+波2 重裁留位——纯 docs |
| C4 | `scripts/ha/ha6-companion.proof.mjs`（新增·名字 EXEC 可随仓惯例定）+ 根 `package.json` 脚本注册（如 `ha6:prove`·additive） | 不存在 → §4-A 组静态 proof（注入式·读仓内文件断言·零网络零容器）；脚本名随仓惯例定（Ban 撞既有 prove 形制） |

---

## §4 prove 判据（验证矩阵 · EXEC 必须全过 · 全静态/沙箱 est live=0 · CMD+EXIT 收据 · Ban retry-to-green）

**A. 静态确定性 proof（C4 载体·零容器零网络）**

1. **A1 预算算术断言**：proof 解析 C1 的 `PGPOOL_MAX` 值 P 与池清单锚（principal.ts:946 默认式+两显式 max:1 调用点）→ 断言：业务 PG 稳态账 = 6P+4（P=12 时=76）且 ≤ 97；P 越出 [10,15] 即 FAIL（防静默调值）——公式与数字双断言，调 P 必须同步改预期=漂移门。
2. **A2 锚传播断言**：`docker compose -f docker/compose.prod.yml -f docker/compose.ha.yml config` 输出（stub 全部 `:?` 必填变量后执行——沿 ha-2 B8 口径：遇 `${VAR:?…}` 缺值即 error、「绿」无意义）含 `PGPOOL_MAX=12` 且 api-a/api-b/worker-a/worker-b 四 service environment 均继承到（防 YAML 键合并不传播）；原三 service `profiles: ["ha-disabled"]` 停用面零回归（RX-1 断言沿 HA-1 判定器口径不复述）。
3. **A3 13 流零漂断言**：proof 逐流读码面（§0.4 表 13 锚）常量/字面值 vs `receipts/ha-1/rate-limit-dilution.json` `current` 列**全等**（13 流点数闭合·点数不符即 FAIL·沿 HA-3 A2 census 形）；同时断言本档 §0.4 漂移表 5 锚与实树一致（行号再漂=FAIL→回 REQUEST 补审）。
4. **A4 负断言（W2/W3 不引入面）**：rg "pgbouncer" 于 `docker/ scripts/ packages/ apps/` 零命中；rg "redis"（依赖面）于 `apps/api/package.json` 零命中——两负断言FAIL 即=本刀裁定被越权违反。
5. **A5 零回归**：C1 触面 `docker compose … config` EXIT=0；根 package.json additive 注册后既有脚本零删改；tsc 于触面零新增误差；既有 prove 矩阵按仓内现状如实列账（跑/未跑），红项逐条基线对账禁 skip-as-pass；全部收据（EXIT+读数）入 EXEC 记账+`receipts/ha-6/`。

**B. 沙箱活体连接数探针（可选件 · EXEC 双审可裁撤，裁撤须落卷理由 · 授权闸沿 ha 先例系）**

6. **B1**：沙箱最小栈沿 `docker/compose.ha.sandbox.yml:18-42` 形制（tmpfs 一次性 PG·哑凭据·`MEETWISE_HA6_PROOF_AUTHORIZED=1` 由协调方设·不得默认可跑）→ 四副本 up → `pg_stat_activity` 应用连接计数 ≤ budget.json 稳态账（P=12 时 76）→ 收据后 `down` 全灭。Ban 以本件替代 A1-A4（静态断言是主证，活体仅佐证）；沙箱 PG 默认 100 与生产云参数不同值如实注记（不外推）。

---

## §5 Ban

Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · Ban retry-to-green（attempts 全账）· Ban skip-as-pass · **Ban 原地改任何既有 compose**（`compose.prod*.yml`/`compose.ha-dual*.yml`/`compose.ha.sandbox.yml` 全列；唯一落点=C1 compose.ha.yml 一行）· **Ban 碰产品码语义**（rate-limit/principal/pool 调用点/吊销窗零行触——本刀码动仅 C4 proof+package.json additive 注册）· **Ban 引入 PgBouncer/Redis 到任何 compose 或依赖**（W2/W3 裁定=不加·登记不实施）· **Ban 把「接受 ×N」叙事成「限流已多实例安全/已 Redis 化/全局精确上限已恢复」**（处置=登记·seam 波2 在卷）· **Ban 静默超售**（预算表条件行/余量/S15 前置必须随卷；共址 worst-case 148 不得隐去）· Ban `PGPOOL_MAX` 越出 [10,15]（越界=修法漂移回 REQUEST 补审）· Ban 生产宿主/生产库/云侧操作（est live=0）· Ban secrets/连接串入日志与收据（沿 observePoolError 脱敏纪律）· Ban 翻 pins · Ban SSOT 无关触碰（LEDGER/backlog 只读引用·nail 时才改）。

---

## §6 pins（十一值照抄 `harness/entpay-slice2-REQUEST.md:139` 经 ha-1..ha-5 同款 · EXEC/审查不得改口 · 本刀零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）

## §7 Non-claims

本刀 ≠ HA ≠ haStatus 翻转 ≠ HA 簇收口（R-24/36/37/44/50/51 未落·B3 簇收口判据另计）≠ 限流已共享化/多实例限流已加固（×N 稀释=接受登记，强度变化如实入账）≠ PgBouncer 就绪或封死（波2 重裁留位）≠ RDS/云侧就绪（S15 亲证前置在卷非已证）≠ 宿主升配已执行 · 预算账 ≤97 ≠ 生产容量/负载绿（w2-resource-sizing receipts:5 sizing≠capacity 同口径·G6 另证）· superuser_reserved_connections=3 与镜像默认 100 系 PG 公开默认值非仓内锚，生产实值以 S15 亲证为准 · 条件池「稳态≈0」系惰性池语义推断+码面注释，非实测 · prove EXIT=0 ≠ DONE（claimDone=false · 完成判定走双审+nail）。

## §8 STOP

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工。** 本 REQUEST 为起草席 docs-only 产物：未动任何产品码/compose、未跑 prove、无实现自批资格。开工三条款（缺一保持本状态零码动）：① **协调方开工授权**（LEDGER:136 HA 簇解锁亲证·批1 收口状态确认）；② **本档预执行双审 BOTH PASS**（落 `reviews/REQUEST-2026-10-11-ha-6-companion-*-mw-*.md`，含 W1 P 值终裁与 B 组裁撤裁定）——EXEC 不得改 §1 修法口径与 §5 Ban，漂移须回 REQUEST 补审；③ **沙箱授权**（若 B 组保留）：`MEETWISE_HA6_PROOF_AUTHORIZED=1` 由协调方设，不得默认可跑。任何越 §2 非范围冲动（顺手实现 Redis 桶、引入 PgBouncer、动 rate-limit 产品码、调云参数）= 停手上报，不借机修。

---

*HA-6 COMPANION REQUEST（起草） · 2026-10-11 · ha6-draft 席 · base `feat/mysql-schema-skeleton` @`20186718`（主线 tip 亲证） · R-20 连接预算（单副本 62 ≤ 97 未爆 → HA-1 拓扑 124 > 97 超售 27 → 一行 PGPOOL_MAX 帽 P=12 落 76·约束 6P+4 ≤ 97·S15 亲证前置入卷）+ R-21 PgBouncer 预览尺度裁决=不加（预算已解/LISTEN 不兼容/添 SPOF/秩序位波2·波2 重裁留位）+ R-23 多实例状态处置=接受 ×N 稀释落档（13 流继承核对+5 锚漂移重 pin·Redis seam 归波2·吊销窗 60s 登记维持）· 全锚 @`20186718` 亲读 · est live=0 · pins 十一值零翻转 · markers=0 · ⛔push ⛔动主线仓 ⛔触其他工作树 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*

*卫生声明（沿 ha-3 同款）：markers=0 = 本档零占位标记——`rg -n "TODO|FIXME|XXX|TBD|待补|占位|<MARKER>"` 于落卷前亲证：唯一命中=本声明行自引 pattern 字面（非占位），零真实占位标记（收据随 commit）。*

draft:awaiting_pre_exec_dual（起草席 ha6-draft 落卷 2026-10-11 · 待预执行双审·双审 PASS 后由协调方行使 EXEC 授权）

→ nailed（post-prove 双席 BOTH PASS @2026-10-11 · nail 席 merge `line/ha-6-companion` @`90258ec3` 落主线 `feat/mysql-schema-skeleton` · 原文保留 append-only）
