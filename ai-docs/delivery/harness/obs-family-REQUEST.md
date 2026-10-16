# OBS-FAMILY 可观测性登记残留收口刀（5C-OBS 拆刀排程 · N1 原因位区分 + N5 探测重试环×3 + 访问行 query 剥离 · 起草 REQUEST · 落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审两外席待开 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· ⛔push）
**席位**：OBS-FAMILY 登记残留收口刀诊断+起草席（协调方派单·5C 拆刀排程 OBS 子刀·授权按 LEDGER :87 组标签+checklist STILL OPEN 三锚锚定·⛔push·⛔merge主线）。
**基线**：`feat/mysql-schema-skeleton` @ `dd89d290`（LEDGER 计件递推笔 commit·本席亲 fetch 亲证 origin tip=`039d9baa` 为其祖先 `git merge-base --is-ancestor` 恒等·docs:check 2180≤cap 2192 本席本树亲跑 EXIT=0）· 分支 `line/obs-family`（本席 `git worktree add ../meetwise-obs -b line/obs-family` 亲立·建树即落 `dd89d290`·分支零 commit 零 merge 节点·⛔pull --rebase 未用）· 工作树 `meetwise-obs`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（2026-10-16·5C-OBS 诊断+起草席·OBS 子刀靶=#248/#245/#246+相关 OBS 件·批表行原文仓外则按 LEDGER 组标签锚定沿 Q1 先例·量级≤1 天即起草）；②LEDGER :87 组标签（5C 可靠性行「/#248/#245/#246/#172/#14/#216 — 🆕 分 4 子刀（OBS/QUEUE/SSE-API/API-HARDEN）」在册未翻·OBS 子刀三行=#248/#245/#246·本席亲读在卷）；③checklist STILL OPEN 三锚（**:2624** OBS-READY nail STILL OPEN「N1 原因位区分+N5 探测重试环（post 注记·登记不修）」+ **:2194/:2215** OBS-LOGGING #89 nail STILL OPEN「访问行 query 剥离微刀·收据重生成」+「#89 ≠ 访问行 query 已剥（残留登记）」·本席亲读在卷）；④issues-master 三行原文（#248/#245/#246）**仓外待补**（协调方持有·全仓 grep 零原文命中亲证·不阻起草沿 Q1 先例·EXEC 立项时如已入卷照 §0 重 pin 协议补锚）。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git hash-object/活体 run 实测 @`dd89d290`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git branch --list "line/obs-family"` 恰 1 命中=本席分支；`git worktree list` 51 树 obs 词面恰 3=`meetwise-obsr`（`line/obs-ready`·tip 祖先亲证零独有 commit·OBS-READY nail @`b284d8ca` 已并主线）+`meetwise-obl`（`line/obs-ledger`·`9a0ade77` 祖先亲证零独有·散项归集台账 L-01..L-11 与本刀三面零交叠亲证）+本 `meetwise-obs`——无第二 obs-family 同名树。
- `origin/line/obs-logging`（`44da47c0`）/`origin/line/obs-envschema`（`7a2ff21b`）两 ref 系 rebase-era ff 合并前原枝残留（**内容已在本树亲证**：`apps/api/src/main.ts` genReqId 在卷+`apps/api/src/platform/env-schema.ts` rawEnv 7 命中·非在飞工作零冲突）。
- `ls ai-docs/delivery/harness/ | grep obs-family` 建前零命中→落卷后唯一同名卷=本卷（obs-ready/obs-logging/obs-envschema 三既有卷异名零冲突）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`dd89d290`·建树即本基线零漂移）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/api/src/modules/health/health.service.ts` | `d9706393`（72 行） | **`:42-61` `apiReady()`（:43-47 SELECT 1 短路 catch→`db_unreachable` 正确半·:48-56 账本查询+目录比对·:57-59 catch 恒返 `migration_mismatch`=N1 缺口正身·:54-55 两行注释自认 fail-closed 纪律）**·`:40` 注记「探针查询数有界：≤2」·`:69-71` `configReady()`（零触） |
| `apps/api/src/modules/health/health.controller.ts` | `abe2c7b2`（65 行） | **`:40-43` 三态映射（`db_unreachable`→`schema.migration='unknown'` 既有·本刀零触承诺的承载面）**·`:33-35` 排水旗先翻（零触） |
| `apps/api/src/main.ts` | `17cc52fd`（299 行） | **`:158-161` logger 配置（level=info+redact authorization/cookie·无 `serializers` 键=query 残留正身）**·`:162-168` genReqId 单源（零触）·`:147-152` 审计#89 注记块（「序列化面仅 method/url/…」随件③如实更新） |
| `scripts/run-e2e.mjs` | `94cbd5be`（199 行） | **`:148` 单发 `fetch(/readyz/worker).then((r) => r.ok).catch(() => false)`=N5 正身①·`:149` `worker_not_ready` 败臂**·`:134-139` api livez 40×1s 轮询同形参照（登记处方原件） |
| `scripts/run-e2e-ui.mjs` | `3ceb6f14`（312 行） | **`:200` 同形单发=N5 正身②·`:201` 败臂**（`skipWorker` 门包裹·`worker.exitCode` 前置检查 `:198` 零触） |
| `scripts/run-performance-e2e.mjs` | `edfcc96f`（124 行） | **`:103` 同形单发=N5 正身③·`:104` 败臂**（`:102` `worker.exitCode` 前置检查零触） |
| `apps/api/test/obs-ready.proof.ts` | `f9d1afaa`（127 行·**15 断言亲跑亲证 PASS=15 FAIL=0**） | P0 版本源口径/P1 一致 200/P2a-c 假版本/P4a-b liveness+别名/P3a-c 自愈/**P5a-c SELECT 1 短路+≤2 有界**（`:94-104` pool.query 注入缝=件④ P7 同形承载）/P6a-b MIGRATIONS_DIR fail-closed |
| `apps/worker/test/obs-ready.proof.ts` | `df66756f`（98 行·**6 断言亲跑亲证 PASS=6 FAIL=0**） | W1/W1b 缺省 fail-closed+W2a-b 谓词通路+W3a-b 首拍门端到端——**零 run-e2e 脚本引用=件④ 源级新臂落点** |
| `apps/api/test/obs-logging.proof.ts` | `1366ec54`（147 行·**23 断言亲跑亲证 PASS=23 FAIL=0**） | R1 访问面/R2 500 面（`:114` 错误行 query 已剥=filter 自有结构化字段·≠访问行已剥）/R3 Ban 面（`:135-136` authorization+body marker）/R4 非 500 不刷屏——**零带 query 样例=件④ R5 新增落点** |
| `apps/api/test/obs-logging.runner.ts` | `486ddaf1`（21 行） | 子进程 boot 载体（零触） |
| `packages/ai-runtime/src/metrics.ts` | `c5a3d39e`（183 行） | 指标注册表+`registerBaselineMetrics`（本刀零新增指标·只读邻证=登记面全是既有件收口非埋点扩面） |
| `receipts/archive/2026-09-batch23/receipts/obs-logging/manual-boot-sample.log` | archive 区 | OBS-LOGGING 登记残留「中间迭代产物·合并后重生成」的收据原件——**archive 区 append-only·本刀零字节（§0.2-4 处置）** |

### 0.2 漂移登记（派单 brief/登记原文 → `dd89d290` 现状）

1. **issues-master 仓外**：#248/#245/#246 三行原文协调方持有未入卷（全仓 `grep -rn "#248\|#245\|#246" ai-docs` 恰 LEDGER :87 组标签一处命中亲证）——不阻起草（派单 brief 明示沿 Q1 先例）·EXEC 立项时如已入卷照 §0 协议补锚·未入卷则维持仓外登记。本刀三面内容锚=checklist STILL OPEN 三处登记原文（§立项出处③）·非 brief 自建。
2. **N5 登记锚行号漂移**：obs-ready REQUEST errata 记 `scripts/run-e2e.mjs:146` → 本树亲读 **`:148`**（登记时点后主线上游行移 2 行·单发形词面恒等亲读在卷·缺口正身零漂）。
3. **N5 同族面扩展（登记原文只点名 run-e2e.mjs）**：同形单发在 `run-e2e-ui.mjs:200`+`run-performance-e2e.mjs:103` 亲读在卷（三处逐字同构 `.then((r) => r.ok).catch(() => false)`）——同族缺口同刀收口·裁决项①追认。
4. **收据重生成面处置**：`manual-boot-sample.log` 现居 `receipts/archive/2026-09-batch23/`（archive 区）——archive append-only 纪律下**原件零字节**；登记收口=件④ obs-logging proof 现行自证收据（`--- log receipt (redacted) ---` 形·本席亲跑在卷）替代中间迭代产物·裁决项②追认。
5. **api lint 贴边**：`pnpm -C apps/api lint` 本席亲跑 **1421 warnings=预算 1421 贴边零余量 EXIT=0**（OBS-READY 授权 A `f29ceb59` 重钉值）——本刀预期零新增 warning·漂移即停如实登记归因（Ban 借机修）。

### 0.3 迁移号登记与协调规则（预期零·实证后定）

- 本刀**预期零迁移**（四件=原因位分类+重试环+日志序列化+proof 臂·零 SQL 零新表零 wrapper）。**协调规则**：若 EXEC 期复判确需迁移→认领号=EXEC 立项日按届时主线链顶顺延实测·零硬编码本卷号·Ban 抢号 Ban 私占（沿 ssepush/queue-shutdown §0.3 同款）。

## §1 红事实（登记原文承引+源级亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 N1 原因位失真（`health.service.ts:42-61` 亲读·缺口正身 `:57-59`）

`apiReady()` 双查询窗：`:43-47` SELECT 1 短路（失败 catch→`db_unreachable`·正确半）→ `:48-56` 账本 max(version COLLATE "C")+目录 `latestMigrationVersion` 比对。**`:57-59` catch 无分类恒返 `'migration_mismatch'`**——SELECT 1 与账本查询之间恰逢 DB 抖动/断连时，账本查询抛连接类错误落此 catch，真态实为 `db_unreachable` 而公开位被错标 `mismatch`（controller `:41-43` 映射 `schema.migration='mismatch'`），编排方误读「迁移漂移」而非「库不可达」——E1 场景（deploy 回滚腿误判·OBS-READY post 双审在卷）下直接误导 runbook 判断方向。仍 fail-closed（503 恒真零丢失）仅原因位失真=登记原文定性。`:40` 注记自认「探针查询数有界：≤2」=修法约束。

### 1.2 N5 探测无重试环（三脚本单发·缺口正身 `run-e2e.mjs:148`+`run-e2e-ui.mjs:200`+`run-performance-e2e.mjs:103`）

三处逐字同构 `const workerReady = await fetch(\`http://127.0.0.1:${workerMetricsPort}/readyz/worker\`).then((r) => r.ok).catch(() => false);` **单发无重试**；随后 `:149/:201/:104` `if (!workerReady) throw tagE2EFailure('worker', 'worker_not_ready')`。worker 侧首拍门（`drain-loop.ts` everSucceeded·worker proof W3a 在钉：首拍未成功 `/readyz/worker` 恒 503 unready=#92 fail-closed 正确语义）生效后，worker 启动窗内该位恒 503——单发命中启动窗即假红 `worker_not_ready`（机制正确、探测时机过敏=登记原文）。同函数 api livez **40×1s 轮询同形参照在卷**（`run-e2e.mjs:134-139`）=登记处方原件。三脚本各自 `worker.exitCode` 前置检查（`run-e2e-ui.mjs:198`/`run-performance-e2e.mjs:102`/`run-e2e.mjs:145`）不吸收此缺口（进程活≠首拍成功）。

### 1.3 访问行 query 残留（`main.ts:158-161` 亲读+checklist :2193/:2196 登记原文承引）

现行 logger 配置仅 `level`+`redact: { paths: ['req.headers.authorization', 'req.headers.cookie'] }`·**无 `serializers` 键**——fastify 默认 req serializer 含完整 `req.url`（含 query 串）。OBS-LOGGING 双审实证 QUERY 探针入卷 1 行（checklist :2193「登记残留」原文）·:2196「**#89 ≠ 访问行 query 已剥（残留登记）**」。query 串是令牌类敏感参的常规载体（`?token=`/`?ticket=` 形）→ R3 Ban 面（值零入卷）的旁路形态：redact 只挡已列路径·query 随 url 整体入卷。R2 错误行 url 已去 query 系 all-exceptions filter 自有结构化字段（proof `:114`）——**错误行已剥 ≠ 访问行已剥**。

### 1.4 基线读数（起草席本树亲跑 @`dd89d290`·2026-10-16·全绿在卷）

`pnpm obs-ready:prove`（isolated 包装·隔离 PG）**15/15 EXIT=0**·`pnpm -C apps/worker prove:obs-ready` **6/6 EXIT=0**·`pnpm -C apps/api prove:obs-logging` **23/23 EXIT=0**·`node scripts/ai-docs/check-docs.mjs` 2180≤2192 EXIT=0·`pnpm -C apps/api lint` 1421/1421 贴边 EXIT=0。即：**既有门全绿=本刀为登记残留收口刀非复绿刀**（三缺口全在门覆盖外·新臂即新增覆盖）。

## §1-修法（四件·零业务语义变更——fail-closed 纪律与首拍门语义零触）

- **件① `health.service.ts` N1 原因位分类（登记处方「catch 分支区分连接类错误归并 db_unreachable/unknown 位」定稿契约·EXEC 照钉）**：
  - 具名 helper `isConnectionClassError(error): boolean` 落源（机检可锚）·**闭合集枚举**：pg SQLSTATE 连接类=`'08'` 前缀（connection_exception 类）+`'57P01'`/`'57P02'`/`'57P03'`（admin_shutdown/crash_shutdown/cannot_connect_now）+Node 系统码=`ECONNREFUSED`/`ECONNRESET`/`EPIPE`/`ENOTFOUND`/`EAI_AGAIN`/`ETIMEDOUT`。
  - `:57-59` catch 改为：`isConnectionClassError` 命中→`'db_unreachable'`；**其余（含无码 Error）→`'migration_mismatch'` 维持**（无法证明非迁移漂移即按漂移降级·fail-closed 不松动）。`:54-55`/`:58` 注释随实更新。
  - **零新增查询**（≤2 有界保持·proof P5b 臂零漂）·**controller 零字节**（`db_unreachable`→`'unknown'` 映射既有 `:41-43`）。
- **件② 三脚本 N5 重试环（登记处方「沿 api livez 40×1s 轮询同形补重试环」定稿契约）**：三处单发各改为**就地展开有界重试环**（不抽共享模块·§1.3-9）：`let workerReady = false; for (let i = 0; i < 40 && !workerReady; i++) { await sleep(1000); try { const r = await fetch(\`http://127.0.0.1:${workerMetricsPort}/readyz/worker\`); workerReady = r.ok; } catch {} }`——环尽 false→既有 `worker_not_ready` 败臂语义逐字保持（`run-e2e-ui.mjs` 环随 `skipWorker` 门包裹位移动·`worker.exitCode` 前置检查原序零触）。端口/env/失败分类/`sleep(3000)` 消费循环就绪窗全零字节。
- **件③ `main.ts` logger 访问行 query 剥离（登记处方「logger req serializer 剥 search 约 3 行」定稿契约）**：`:158-161` logger 配置增 `serializers: { req: ... }`——输出 `{ method, url: (url ?? '').split('?')[0], host, remoteAddress, remotePort }`（**url 去 `?` 及其后·path 恒在**·其余默认字段保全防形漂）。`genReqId`/`redact`/`level`/`bodyLimit`/onRequest 钩子零字节·`:147-152` 注记块随实更新（访问行 query 已剥·残留登记收口）。`obs-logging.runner.ts` 零触。
- **件④ 三 proof 维持+新增（机检基面·EXEC 落值）**：
  - `apps/api/test/obs-ready.proof.ts` **15 既有臂逐字维持**（含 P5b ≤2 有界臂）+新增 **P7a/P7b/P7c**（`:94` 同形 pool.query 注入缝复用：P7a 首查通/次查连接类错（`code:'ECONNREFUSED'` 注入）→`apiReady()==='db_unreachable'`+HTTP 503+`schema.migration='unknown'`；P7b 次查非连接类错（无码 Error）→`'migration_mismatch'`+'mismatch' 保真；P7c P7a 注入下实发查询恰 2 条=≤2 有界不破）。
  - `apps/worker/test/obs-ready.proof.ts` **6 既有臂逐字维持**+新增**源级臂 ≥3**（读仓库根三脚本源：每脚本含重试环形（`for`+`sleep(1000)`+`readyz/worker` 同函数共现）+**单发形负断言**（`.then((r) => r.ok)` 单发词面零命中）·40 上限字面在源）。
  - `apps/api/test/obs-logging.proof.ts` **23 既有臂逐字维持**+新增 **R5 ≥3**（`/livez?token=<探针标记>` 请求 200+全行扫描探针标记零命中（并入 R3 班面语义）+incoming 行 `req.url` 恰为剥后 path·path 保全直证）。

## §1.3 否决（替代路径·全数否决·越界行使即停止条件）

1. **否决「N1 catch 内补一发 SELECT 1 复探再分类」**：`:40` 探针 ≤2 有界纪律破+复探自身可再失败（竞态不闭合·三查询窗更大）。
2. **否决「N1 任何臂 fail-open（catch 返回 ok）」**：fail-closed 红线（`:54-55` 注记纪律）。
3. **否决「controller 侧改映射/加原因字段」**：controller 只收 service 枚举·错误信息已在 service 层吞为三态——分类位只能在 service；加字段破「降级体最小·无 error/明细」契约（validate.ts 降级体契约）。
4. **否决「N5 换用 /metrics 200 代 /readyz/worker」**：绕过首拍门 fail-closed 语义（W3a 在钉·metrics 有序列≠就绪）。
5. **否决「N5 无限等待/大幅拉长」**：40×1s 与 api livez 同形=登记处方·上限恒等；无限环=CI 悬挂风险。
6. **否决「N5 抽共享 helper 模块（新文件+三 import）」**：三脚本各自独立入口·抽共享=新建文件扩触面+改动 runner 族四文件；就地同形展开=最小触面（共享化归协调方后刀裁量）。
7. **否决「query 剥离用 redact paths 正则实现」**：redact 是值替换器·url 单值串无法按 query 段隔离替换；`serializers.req` 是 fastify 既有正解（登记原文点名）。
8. **否决「顺带剥 host/remoteAddress 等其余默认字段瘦身日志」**：越出登记面（登记只点名 query）·Ban 顺带扩面。
9. **否决「重写 archive 内 manual-boot-sample.log」**：archive 区 append-only·收口=现行 proof 收据自证替代（§0.2-4）。
10. **否决「本刀顺带新增指标/埋点」**：登记面全是既有件收口·metrics 注册表零触（§3-3）。

## §2 验收断言候选（EXEC 门矩阵·pre-exec 双审核对单基面·全过为绿）

1. **api obs-ready 门**：`pnpm obs-ready:prove` **EXIT=0**——15 既有臂逐字存活（机检 pre/post 清单 diff=恰 P7 新增·零既有臂 diff）+P7a/b/c 新增全绿（预期 18/18）。
2. **worker obs-ready 门**：`pnpm -C apps/worker prove:obs-ready` **EXIT=0**——6 既有臂逐字存活+源级新臂全绿（预期 ≥9/9）。
3. **obs-logging 门**：`pnpm -C apps/api prove:obs-logging` **EXIT=0**——23 既有臂逐字存活（含 R3 authorization/body 两 Ban 臂·R1 incoming 形臂按件③后 url 词面如实核）+R5 新增全绿（预期 ≥26/26）。
4. **env-schema 邻面门**：`pnpm env-schema:prove` EXIT=0（22/22·`env-schema.ts` 零触承载）。
5. **typecheck 门**：`pnpm turbo typecheck --force` EXIT=0（`TURBO_DAEMON=false` 沿 L-11 串根事故纪律·8/8 0 cached 口径）。
6. **lint 门**：`pnpm -C apps/api lint`（**1421 贴边零余量**）+`pnpm lint`（root max 5235）亲跑实测——零新增 warning 为预期·漂移即如实登记归因（**Ban 借机修 lint**）。
7. **docs:check 门**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（基线 2180·本卷 +1→**2181 ≤ cap 2192**·余量 11·>2192 红即停上报·cap sanction 权归协调方）。
8. **markers 门**：改动集（本卷 .md+三 src/script+三 proof）五类标记词零命中+`est live=0` 臂绿（词面见 `i6-239-gates.proof.mjs` 运行时组装·不入卷防自指）——**恰符臂红=协议形承登**（i6-239 历史刀申报面·沿 queue-shutdown §7/OBS-LOGGING 先例·非本刀新增红）。
9. **diff 面（改动面窄断言）**：EXEC diff（对立项基线）=恰 **7 类**——本卷 .md+`health.service.ts`+`apps/api/src/main.ts`+三 runner scripts+三 proof（+收据目录可选）——`health.controller.ts`/`apps/worker/src`/`packages/`/`migrations/`/共享 SSOT 四卷零文件入 diff（`git diff` 词面机检）。
10. **零迁移门**：改动集零 SQL 零新表（§0.3 预期零实证）。

## §3 范围外（边界清单·越界即 FAIL）

1. **零产品码越面**：仅 `health.service.ts`+api `main.ts` logger 块+三 runner scripts+三 proof——api 其余模块/web/worker src/packages 零字节；`health.controller.ts` 零字节（§1-件①承诺）；`startMetricsExposition`/`/readyz/worker` 端点零字节（首拍门语义零触）。
2. **fail-closed 纪律零触**：N1 双臂均 503 恒真·N5 首拍门语义零改·只修探测时机与原因位归类。
3. **指标注册表零触**：`packages/ai-runtime/src/metrics.ts`/`registerBaselineMetrics`/worker 组合根埋点零字节——本刀零新增指标（§1.3-10）。
4. **共享 SSOT 零改**：LEDGER（含 :87 组标签行）/checklist（含 :2194/:2215/:2624 三 STILL OPEN 行）/batch-residual-plan/issues-master 只读引用——#248/#245/#246 三行+两处 STILL OPEN 行翻面权归协调方 nail·本刀不宣称行关闭。
5. **零迁移零依赖升级**（§0.3）·`fastify@5.12.5` 零改。
6. **archive 收据区零字节**（§0.2-4·§1.3-9）。
7. **兄弟子刀零触**：#172/#14/#216（QUEUE/SSE-API/API-HARDEN 各归其子刀）/#139（留 5C-SSE-API）零字节零宣称。
8. est live=0（起草 turn·§6）。

## §4 依赖

**①上游已满足**：`dd89d290` 主线已含三刀 nail 谱系（OBS-ENVSCHEMA/OBS-LOGGING/OBS-READY 收官面·`line/obs-ready`/`line/obs-ledger` 祖先亲证+obs-logging/envschema 内容在树亲证 §0.0）·三面登记原文全部在卷（§立项出处③）。**②无同文件并发**：`git worktree list` 51 树亲证——零第二树触本刀七文件（§0.0）。**③迁移号**：§0.3（预期零）。**④下游**：批表三行翻面+checklist STILL OPEN 两处收口行核翻·归协调方 nail（本刀交付读数）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（⛔push·git 写只本 worktree commit）·Ban merge 主线（⛔merge主线）·Ban 自批（pre-exec 双审须独立外席·alone≠dual 不代签）·Ban 弱化断言（15/6/23 既有臂逐字冻结·新臂力不减·§1-件④）·Ban retry-to-green（断言红恰 1 attempt·基建红除外）·Ban 触 fail-closed 纪律与首拍门语义（§3-2）·Ban 触 controller/metrics 注册表/worker src（§3-1/§3-3）·Ban 触共享 SSOT（§3-4）·Ban 触 archive 区（§3-6）·Ban 抢迁移号 Ban 私占（§0.3）·Ban 借机修 lint/cap/协议形红（§2-6/§2-7）·Ban 顺带新增指标埋点（§1.3-10）·Ban 顺带升级依赖（§3-5）·Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）·Ban 触其他工作树（含 `meetwise-obsr`/`meetwise-obl`）。

**pins（本卷钉值·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零外呼零消耗）——**刀专项**：api obs-ready 断言总数=**15**（亲跑亲证）·worker obs-ready=**6**（亲跑亲证）·obs-logging=**23**（亲跑亲证）·N1 探针查询有界=**≤2**·N5 重试环=**40×1s**（与 api livez 同形·上限恒等）·api lint=**1421/1421 贴边**·root lint max **5235**·docs 基线 **2180**/cap **2192**·迁移=**0**·est live=0（起草 turn）。

## §6 est live=0（起草 turn）+ EXEC 门预申明

- **起草 turn（本 commit）**：est live=**0**——零模型外呼零 Key 加载零生产操作零消耗（全部基线 run=纯本地 tsx/node+隔离 PG 容器·用后即焚·obs-logging 子进程零 DB 触）。
- **EXEC 期门预申明（授权后方可行）**：①件①②③④落码落位；②§2 十门全跑全落收据（EXIT 逐门入卷）；③`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；④收据落点 `ai-docs/delivery/receipts/obs-family/`（00-exec.md+pre/post 断言清单对照+各门 EXIT 回执·count 纳 docs:check 面——余量 11 内 EXEC 自裁最小集·越即停上报）+harness 本卷推进注记（append-only）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 .md+EXEC 期三 src/script+三 proof+收据）**五类标记词 grep 零命中**（起草席落卷时对本卷亲跑直证·回执随 EXEC 收据留痕·五类词面见 `i6-239-gates.proof.mjs` 运行时组装·不入卷防自指）。**承登（基线红如实）**：`i6-gates:prove` 恰符臂以 i6-239 历史刀申报清单为期望集·任何后继刀必红该臂=**协议形承登**（沿 queue-shutdown-phases-REQUEST §7+authz-34 :225 先例）；基线树该门词面臂对 LEDGER 既存历史登记行词面红（改前同在·非本刀引入）——本刀实质臂=改动集五类词面零命中+`est live=0`+邻面零触+零迁移+SSOT 四卷零触（本刀改动集口径）·全绿为门。

## §8 STOP（开工三条款 + 待双审/EXEC 裁决项）

**STOP · `draft:awaiting_pre_exec_dual`（pre-exec 双审两外席待开 · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。）** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（含 §8 裁决行使落字·committed SHA 重钉）；③EXEC 立项**不得改 §1-修法定稿契约与 §5 Ban/pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）。**停止条件（四类）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob/机制漂移（health.service 被他刀改/三脚本单发形被他刀改/logger 配置被他刀动/链顶异动）→停·重 pin 回炉；**机制不满足**=件①②③④落位后 §2-1/2/3 命中红（既有臂非预期外有 diff/新臂不绿）→停·如实升级协调方（Ban 就地改因 Ban 扩面修）；**越界需要**=任何迁移/controller/metrics/worker src/archive/SSOT 改动诉求→停·另刀或 §8 裁决行使（Ban 就地修）；**验收红不可修**=门矩阵静态红（typecheck/lint 贴边漂移/docs:check>cap）且根因不在本刀交付面→停·如实登记（Ban 借机修）。

**待双审/EXEC 裁决项**：
- **①N5 同族面扩展追认（§0.2-3）**：登记原文只点名 `run-e2e.mjs`·同形单发在 `run-e2e-ui.mjs:200`+`run-performance-e2e.mjs:103` 亲读在卷——推荐=追认同刀收口（同族缺口·分散收口留残）vs 翻案（仅收 `run-e2e.mjs`·两同形残面另登记）。
- **②收据重生成处置追认（§0.2-4）**：archive 原件零字节+现行 proof 自证收据替代 vs 重生成 archive 内文件（本席裁不可行=archive append-only）——推荐=追认。
- **③N1 连接类闭合集枚举口径追认（§1-件①）**：'08' 前缀+57P01/02/03+六 Node 系统码闭合集·无码 Error 落 `migration_mismatch` 保 fail-closed——推荐=追认（漏列代价=该错误仍标 mismatch·方向保守不失真）vs 扩集（双审列举即随卷修·EXEC 立项不得改契约条款照开）。
- **④零迁移确认（§0.3）**：预期零；若 EXEC 复判需迁移→§0.3 协调规则。
- **⑤行关闭效力**：EXEC 命中门矩阵十门全绿+post 双审 BOTH PASS→批表 #248/#245/#246 三行（OBS 子刀·LEDGER :87 组标签）与 checklist :2194/:2215/:2624 STILL OPEN 行对应面的关闭/翻面登记权归协调方 nail（本刀交付读数·不宣称关闭·「5C 六行全闭」还须 QUEUE/SSE-API/API-HARDEN 各子刀——本刀=OBS 一子）。

---

*OBS-FAMILY REQUEST · 2026-10-16 起草 · STOP=`draft:awaiting_pre_exec_dual` · 起草 base=`feat/mysql-schema-skeleton` @`dd89d290`（本席亲 fetch·origin tip=`039d9baa` 祖先亲证·⛔pull --rebase 未用）· 分支 `line/obs-family` · 工作树 `meetwise-obs`（本起草席立·建前 branch/worktree 双查不存在）· 立项出处=协调方派单 brief（5C-OBS 诊断+起草席·靶=#248/#245/#246+相关 OBS 件）+LEDGER :87 组标签+checklist :2194/:2215/:2624 三 STILL OPEN 锚+issues-master 三行仓外待补（沿 Q1 先例）· 缺口三面=N1 `health.service.ts:57-59` catch 无分类恒 `migration_mismatch`（双查询窗原因位失真·fail-closed 恒真仅原因位失真）+N5 三脚本单发 `fetch(/readyz/worker)` 无重试环（首拍门窗假红 `worker_not_ready`）+访问行 query 残留（fastify 默认 req serializer 全 url 入卷·R3 Ban 面旁路形态）· 修法四件=原因位闭合集分类（零新增查询·controller 零字节）+三脚本 40×1s 重试环同形就地展开（败臂语义逐字保持）+logger `serializers.req` 剥 search（path 恒在）+三 proof 维持（15/6/23 逐字冻结）+新臂（P7×3+源级≥3+R5≥3）· 触面=七文件恰类（三 src/script+三 proof+本卷）· 零迁移零新增指标零 archive 触· est live=0（起草 turn）· markers=0（恰符臂协议形承登）· 停止条件四类全设未触发 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · ⛔push · ⛔merge主线 · STOP*
