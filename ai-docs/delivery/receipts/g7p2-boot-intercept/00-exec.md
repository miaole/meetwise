# G7P-2 · wrapper code 截获刀（真实链装载红 vs 旅程红切分）· EXEC 收据（判别 run 恰 1 attempt · 零 retry-to-green · 预注册四向判读向 3 命中）

- **授权链**：REQUEST `1c23c324` → **rev2 `064fc37e`（唯一蓝本 · `ai-docs/delivery/harness/g7p2-boot-intercept.md`）** → meetwise 协调方 EXEC 授权（mw-core · 本收据）→ post-prove 双审（归协调方派 · Ban self-approve）→ nail（归协调方授权）。
- **实跑 base**：worktree `meetwise-line-g7p2` · branch `line/g7-boot-intercept` · tip `064fc37e` + 本刀工作树改动（未 commit 实跑 · 同 E2EFAIL-1 先例以 sourceDigests 自证）。**实跑 code 自证 MATCH**：machine receipt `sourceDigests` **15/15 全 MATCH** 工作树亲算（含 `scripts/run-e2e.mjs=sha256:249e509b…`＝带门控接线的实跑版）· `scripts/e2e-boot-trace.mjs=sha256:fd169df8…`（新增钩子·不在 receipt digest 面内以其为全新文件亲算附记）· Ban 三面零触碰（`failure.ts=5ddb000a…` 与 E2EFAIL-1 卷内值全等 · `failure-class.mjs`/`INTERVIEW_TERMINALS`/`e2e/full.e2e.ts`〔=0658fa6c… 基线版非 E2EFAIL-1 改版〕零触碰 · porcelain 恰 2 entries＝本刀两文件）。
- **环境探针**（04-probes.txt）：docker server 29.1.3（`/_ping` OK）· node v22.22.3 · pnpm 10.18.0（packageManager pin）· `pnpm install --frozen-lockfile` EXIT=0（3.9s · 零 lockfile 改动）· Key **set（name-only）** 只经进程环境 loader（`~/.meetwise-secrets/load-model-api-key.sh` · `set -a` source · 值零打印零入库零入 log）· **`.env*` ABSENT**（worktree 前测无·orchestrate 亦零创建）· `E2E_VERBOSE` 未设（零调参）· orchestrate shell `NODE_OPTIONS` 未设（**flag 门控为唯一注入通道**亲证）· `G7_FREETIER_REPROVE` 未设 · 外来容器仅 `meetwise-postgres-dev`（run 前后双测同名·零触碰）。
- **本收据判定效力**：EXEC 期读数原值记账 · 零 SSOT 行改写 · 判别 run 结局＝**EXIT=1 红 retained · class=api · 四向判读向 3 命中（旅程红·T3 达）——装载面健康证立（T1→T2→T3 全程 364ms）·红点定靶至首断言后紧邻旅程步**（见 §5）。

## 1. coding 台账（两件套 · rev2 六处方逐条落实）

- **A 装载钩子** `scripts/e2e-boot-trace.mjs`（新增 · 154 行 · `node --check` 过）：
  - **注入形态**：NODE_OPTIONS `--import` **追加不覆盖**（`${process.env.NODE_OPTIONS ?? ''} --import <hook>` · run-e2e.mjs 门控内拼装）；经 tsx cli 父进程（`node tsx/dist/cli.mjs e2e/full.e2e.ts`）与 tsx 内部孙进程（`node --require preflight.cjs --import loader.mjs e2e/full.e2e.ts` · env 继承）**两度装载**——两进程各自 T1/exit 戳由 argvTail 区分（face=`tsx-cli-process`/`tsx-runner-entry-process`）。
  - **T1** = 本钩子在 tsx 链进程内首次求值（≈process start + node 引导开销 · 诚实注记）；**T2** = module hooks `load` 链上 URL 以 `/e2e/full.e2e.ts` 结尾（**ESM 语义遵守 rev2 键修正：entry onLoad 先于其 14 个静态 import 解析——T2≠依赖解析完成** · 经 `module.register(import.meta.url)` 自注册与 tsx loader 链式共存·纯 pass-through）；**T3** = 进程 stdout 首个以 ✓/✗ 起始的断言行（`assert.ts:19 console.log('✓', msg)` 唯一 ✓ 产出面亲证 · 跨 chunk 行首累积 · 单次守卫）。
  - **逐戳即时落盘**：`appendFileSync` per stamp（SIGKILL 安全非缓冲）→ `.tmp/e2e-boot-trace.json`（NDJSON 行流——逐戳追加+跨线程并写的必然形态 · 文件名照蓝本）；**run 身份内嵌**每行（`bootId=启动时刻.pid` + pid/ppid/tid + argvTail 路径 only · 零 env 值）；**run 前 unlink 由 orchestrate 外部亲证**（§3 · 钩子绝不自 unlink——否则孙进程装载会吞父进程 T1）。
  - **钩子全程自守 try/catch**（stamp 及所有副作用包裹 · 自守失败静默不制造新红 ⇒ 缺戳由判读以向 0 面处置）；**终端异常捕获**：`uncaughtExceptionMonitor` **零语义扰动记录**（冒烟已证 rethrow 形态会把 EXIT 1→7 违反「原语义」——monitor 后默认崩溃照常·退出码/原生打印不变 · unhandledRejection 默认 throw 模式升级为 uncaught exception ⇒ 同 monitor 面覆盖）+ hooks 链 `resolve`/`load` 失败**原码捕获后原样 rethrow**（装载类异常码文件份权威来源）+ `stderr.write` 包裹分类（ERR_MODULE_NOT_FOUND/ERR_UNSUPPORTED_DIR_IMPORT/编译类 · 死信面）+ `exit` 戳含退出码。
  - **零 stdout/stderr 写出**（不混 stdout E2E_ 收据面 · Ban「既有收据解析器零触碰」兑现：trace 走独立文件）。
- **B flag 门控接线** `scripts/run-e2e.mjs`（**diff 6+/1- = 7 行 ≤10 亲证** · 注入点 :144-152 原 :145-147 spawn 处）：仅 `process.env.E2E_BOOT_TRACE === '1'` 时给 tsx child extraEnv 附加 NODE_OPTIONS `--import`；**默认关零行为变化**（unset ⇒ spread `{}` ⇒ extraEnv 与基线逐字节等价 ⇒ NODE_OPTIONS 零附加——§7 亲证）；api/worker child 不在注入面（extraEnv 仅 tsx 调用）。
- **冒烟台账**（玩具链 /tmp · 零模型调用零 docker零产品面 · 非判别 run 不计 attempt）：①绿链直跑 T1/T2/T3/exit 全绿 ✓；②绿链 tsx 形（cli+孙两进程 T1×2/T2/T3/exit×2 code=0 ✓）；③断链装载红形：**EXIT 原值保持**（hook 版=1=无 hook 基线 · 修 rethrow→monitor 后）+ `uncaughtException` 戳 `code=MODULE_NOT_FOUND`（tsx 包装形）+ t2 在戳 ✓；④unhandledRejection：EXIT 1=1 语义保持 + monitor 面记录 ✓；⑤SIGKILL 挂死形：外部 kill 后 JSON 戳存续 ✓。冒烟期曾发现两处刀缺陷并修（T3 行尾换行先剥再取行首 · rethrow EXIT 1→7 弃用）——**刀自证先行·判别 run 未消耗于刀自败**。

## 2. 判别 run（恰 1 attempt · 零 retry · 恰一次台账消耗）

| attempt | 记事 | EXIT |
| --- | --- | --- |
| **#1（唯一）** | orchestrate 一次性封装：`set -a && source ~/.meetwise-secrets/load-model-api-key.sh && set +a && export E2E_BOOT_TRACE=1 && pnpm run e2e:isolated`（sidecar v2 并行 §4 · 挂死界 watchdog 预注册并行 §5 注） | **1** |

**attempt#1 原值读数**：EXIT=**1**（`.tmp/g7p2-run/exit` · wrapper `ELIFECYCLE Command failed with exit code 1`）· stdout `E2E_FAILURE_CLASS class=api` · 无 `E2E_FINAL_SUMMARY`/`E2E_REVIEW_CLASS_COUNT` ⇒ reviewLedger 0 行 · assertionCount=null · machine receipt（03）：outcome=failed · exitCode=1 · **durationMs=14449** · 12:44:13.269Z→12:44:27.718Z · failureClass=api · schemaMigrationManifest count=144 latest=`0143_sse_push_notify.sql`（与 E2EFAIL-1 同面无漂移）· `ISOLATED_POSTGRES_OUTPUT_WITHHELD` 容器 `meetwise-e2e-78490-1791463453268:62200` state_bytes=217 logs_bytes=516 · `LOCAL_E2E_RECEIPT release_evidence=false`。

## 3. trace 唯一收据源亲读转录（`.tmp/e2e-boot-trace.json` → 02-boot-trace.json 字节同一亲证 · run 前 unlink：`ENOENT (no stale file)` 亲证在 04-probes.txt）

| # | evt | at (UTC) | pid/face | 载荷 |
| --- | --- | --- | --- | --- |
| 1 | **t1** | 12:44:26.960 | 79534 / tsx-cli-process（ppid 79234=run-e2e.mjs） | argvTail=[tsx/dist/cli.mjs, e2e/full.e2e.ts] |
| 2 | **t1** | 12:44:27.078 | 79543 / tsx-runner-entry-process（ppid 79534） | argvTail=[/ROOT/e2e/full.e2e.ts] |
| 3 | **t2** | 12:44:27.174 | 79543（hooks 线程 tid=1） | url=e2e/full.e2e.ts · note=entry onLoad fires before its static imports resolve |
| 4 | **t3** | 12:44:27.324 | 79543（主线程） | marker=✓ · note=first assertion line on stdout |
| 5 | exit | 12:44:27.337 | 79543 | code=**1** |
| 6 | exit | 12:44:27.369 | 79534 | code=**1** |

**无** `resolve-error`/`load-error`/`uncaughtException`/`stderr-classified`/`selfguard-*` 任何戳 ⇒ 零装载类异常码 · 钩子自守全程无失败面。**时序**：T1(cli)→T2 **214ms**（含 tsx boot+esbuild+entry onLoad+钩子开销〔§9-N3〕）· T2→T3 **150ms**（14 静态 import+helpers 图+signup/login 真 HTTP+首 ✓）· T3→exit **13ms**（process.exit(1) 于首断言后紧邻步——`assert.ts` fail-closed 路径：emitE2EFailure[stderr 死信]+✗[stderr]+exit(1)；非 uncaught 崩溃〔monitor 无戳亲证〕）· tsx 面总寿命 **409ms** · run 全程 14.4s（其余为容器 boot+migrate+api/worker 就绪段 13.7s：startedAt→T1）。

## 4. sidecar v2 纪律行使（五条+CMOP03-E 叠加条+双计 · 全程 · est ≤25 判别口径）

| 纪律条 | 读数 |
| --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 anchor（wrapper log `label=post-migrate` · sidecar `ANCHOR post-migrate seen` @12:44:20.478） |
| ② 42P01 pending 窗（不计失败预算） | ✓ pending=1 tick（首 ok 前） |
| ③ 停针计数器仅 post-first-ok 武装 | ✓ first-ok tick @12:44:18.058（armed）· 停针未触发（STOP 哨兵=wrapper 退出 · total 12 tick） |
| ④ v2 策略落文字 | `sidecar-v2-script.mjs`（E2EFAIL-1 卷内冻结版**逐字节复用 · 唯一 diff=outDir 一行**〔`.tmp/g7p2-sidecar`〕· diff 亲证 · Ban 新发明查询兑现） |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 每 ok tick 双读（7 ok tick · 末可读=11） |
| 叠加·SELECT-only | ✓ 六查询全 SELECT 聚合 · 零行内容零 PII |
| 叠加·精确容器名+端口 | ✓ `meetwise-e2e-78490-1791463453268:62200`（全 run 单容器零重绑 · fallbackUsed=false） |
| 叠加·created_at∈run 窗 | ✓ inv 窗 `none|none`（零行平凡成立）· 末可读 ok tick 12:44:26.539 ⊆ run 窗 12:44:13.269–12:44:27.718 |
| 叠加·migrations 相关性·失配弃读 | ✓ 末可读 `migration_max=0143_sse_push_notify` ≡ machine receipt latest `0143_sse_push_notify.sql`（**容器态≡run 权威 manifest · 相关成立**）· 冻结 `WHERE version='0142'` 精确形 0 行=version 存文件名干（G7Y/CMOP03-F/E2EFAIL-1 同形注记）· **零弃读** |
| **双计分项** | **=0（succeeded 0 + failed 0 · 末可读 ok tick 11）· dispatching=0**（死于任何模型调用/job 创建之前——与 §3 死亡面一致）· teardown 撕裂窗注记：finalTick 12 `No such container`（wrapper finally 拆容器 · 读数取 tick 11 最末可读 · 沿 E2EFAIL-1 E-1 同形） |
| interview_job 读数 | 全程 `[]`（零 job）· last_error ∅ |

## 5. 四向预注册判读（REQUEST rev2 §3 × 实读）

| 预注册向 | 实读 | 判定 |
| --- | --- | --- |
| 向 0·T1 前死（trace 刀自失败·重跑豁免面） | T1 双戳在 · 6/6 戳完整 · 零 selfguard 戳 · 链全程有效 | **未命中** |
| 向 1·装载红（T3 未达 且〔T2 未达 或 装载类异常码〕或 120s 挂死界） | **T2 达**（27.174）· **T3 达**（27.324）· 零装载类异常码（无 resolve/load-error·无 ERR_*/编译类码·无 uncaughtException）· 挂死界未触发（tsx 面寿命 409ms ≪ 120s · watchdog 零 kill） | **未命中——装载红在本 run 被证伪** |
| 向 2·旅程红（T2 达+无码+T3 前死） | T3 达（marker=✓ 首断言『注册/登录 → 真 Bearer 令牌』**通过**并打印） | 未命中 |
| **向 3·旅程中红（T3 达 ⇒ 红在旅程段）** | **命中**——T3 后 13ms `process.exit(1)`（fail-closed 断言路径·class=api）⇒ 红点=**首断言后紧邻旅程步**（按序第 2 断言『PIPL 采集同意 → 200』面：consentResumeProcessing 真 HTTP 快速返回非 200 或抛后由 A() 捕获判假——13ms 窗内完成） | **向 3 成立** |
| 形状注记（诚实 · 非洗白） | **极早旅程红非「旅程深处」**：ledger 0 行（死于首个 `reviews.record`〔3c 面〕之前·对照历史深跑红族 40-102s/4-11 行为不同族）；与 E2EFAIL-1 判别 run（23330ms/0 行/class=api）**同族同形状**——本刀将其两拟合解切分：**装载红排除 · 旅程红成立（旅程第 2 断言面）**；精确 HTTP 状态码/错误文本不可回读（child stderr 按 withhold 契约在 isolated 链 :2163 丢弃=死信 by design · 定位归协调方/后续刀） | 形状登记升级协调方 |
| G7P-1 环境外推缺口 | 本 run **MODEL_API_KEY set**（与历史红环境同面·异于 G7P-1 复刻链 unset 面）——G7P-1「环境限制分支」在 key-present 面上仍未解释本红（红在 key 无关的 consent 断言面复现）⇒ 外推缺口**实测收窄**（key 有/无两面同形红） | 登记非裁定 |
| 红 retained ≠ 判别失败 | EXIT=1 retained ✓ · 单 attempt 零 retry ✓ · 四向如实记账禁洗绿 | ✓ |

**挂死界（run 前预注册）**：120s 无 T2 ⇒ 外部 kill ⇒ 装载红·挂死——watchdog 全程在岗（`watchdog.log` · boundary=120000ms 落文字于 run 前）· 本 run 未触发（无挂死面）；其 spawn 探测粒度限界见 §9-N1。

## 6. 预算与卫生

- live 双计 **0 ≤ est 25** ✓（est-not-counter · 死于任何调用前=诚实 0 · est 0→≤25 上调偏差系 rev2 已登记项）· **链累计硬帽 200 未触**（本刀 0）· **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
- Key 卫生：只经进程环境 loader · name-only `MODEL_API_KEY=set`（04-probes.txt · 值零打印零入库零入 log/commit）· `.env*` ABSENT 记录在卷。
- 容器卫生：本 run 容器 wrapper finally 已拆（finalTick `No such container` 亲证）· 外来容器 `meetwise-postgres-dev` 前后双测同名零触碰。
- **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null`。
- Ban 复核：零 retry-to-green（恰 1 有效 attempt）· 零第二 run 通道（§7 回归证明零 run 亲证）· 零产品码（porcelain 恰 2 entries=本刀两文件）· 既有收据解析器零触碰（trace 独立文件零 stdout 混面）· 零 SSOT 行改写 · 零 force-push · 零 self-approve · alone≠dual。

## 7. flag 关态回归证明（不增第二 run）

1. **diff 亲证**：`git diff scripts/run-e2e.mjs` = 6+/1- ≤10 行 · 门控唯一条件 `process.env.E2E_BOOT_TRACE === '1'`（run-e2e.mjs:147）——未设 ⇒ `bootTraceImport={}` ⇒ extraEnv spread 零键 ⇒ **NODE_OPTIONS 零附加 · 与基线逐字节等价**；追加语义亲证（既有 NODE_OPTIONS 保留前置拼接）。
2. **logic demo（非 run）**：同表达式三态求值——unset→`{}`（零键零附加）· =1→仅追加 `--import <hook>`· =1+既有 NODE_OPTIONS→`--max-old-space-size=4096 --import …`（append-not-overwrite ✓）。
3. 本 run 的 api/worker child 不在注入面（spawn 调用面零改动亲读）· orchestrate shell NODE_OPTIONS 未设亲证（04）。

## 8. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ G7 修复 ≠ 根因定谳**（=定靶细分：装载面健康证立+红点缩至旅程第 2 断言面）· ≠ consent 红根因定位（精确 code 死信不可回读）· **≠ G7 三绿**（`g7SuiteGreen=false` 维持）· ≠ `:107` GAP-G7K-API-REDS 关闭（但其候选面收窄：装载红排除·早期旅程红成立——供协调方归并裁定）· ≠ trio 面 · ≠ POST7B/7A 域任何翻案 · not covered（coveredCount=8 unchanged）· not HA · not `releaseEvidence=true`（receipt 自证 release_evidence=false）· 禁把向 3 命中误读为根因收口 · 禁把 0 双计读作「账本无调用=无问题」· alone≠dual（post-prove 双审归协调方派）· 实现方不 self-approve。

## 9. errata / notes（append-only）

- **N1（watchdog 粒度限界·如实）**：spawn 探测 pgrep 1s 轮询粒度 < 本 run tsx 面寿命 409ms ⇒ `watchdog-summary.spawnAt=null`（未及标记即逝）——**不损预注册界语义**：挂死界射程=「≥120s 无 T2 的挂死进程」必然横跨 ≥119 个轮询窗必被捕获；本 run 无挂死（T2 于 spawn 后 214ms 达）· 零 kill · 界未触发。后续刀若需 sub-second spawn 记账须收紧轮询或改 kqueue/fsevent 面。
- **N2（两进程 T1 语义）**：NODE_OPTIONS 继承使钩子在 tsx cli 父与 entry 孙两进程装载（各 T1/exit 戳）——**canonical T1=cli 父进程戳**（run-e2e.mjs spawn 的直接 child）·孙进程 T1 为 tsx 内部面（214ms 间隔=cli boot+esbuild 转载窗）；run 身份 bootId 每进程一枚以 pid 区分·无歧义。
- **N3（钩子扰动如实记）**：T1-T2 窗含钩子开销（per-stamp appendFileSync ×~6 + hooks 链 pass-through 每模块一次 URL 检查）——**未单独定量**（无 hook 基线时戳不可得而不增第二 run）；量级以冒烟绿链（含 hook T1→T2 ≈ 同量级）佐证为「装载相干噪声 < 观测窗数量级」。
- **N4**：machine receipt `gitHead` 字段 ABSENT（红 run 形状·E2EFAIL-1 E-2 同形）——实跑 code 以 sourceDigests 15/15 MATCH 自证（§0）。
- **N5**：migration 面与 E2EFAIL-1 同为 144/`0143_sse_push_notify`（无漂移）· sidecar 冻结 0142 精确形 0 行同形注记（§4）。
- **N6（刀期缺陷修复台账·append-only）**：冒烟期两修——T3 行首检测先剥行尾换行（否则 lineStart 恒空）；终端异常捕获 rethrow→uncaughtExceptionMonitor（否则 EXIT 1→7 语义漂移）——均修于判别 run 前·run 未消耗于刀自败（向 0 未发生亲证）。

---

**STOP：EXEC 完毕（exec:awaiting_post_prove_dual）**——刀 A/B 落树（run-e2e.mjs diff 7 行默认关+钩子 117 行全自守）· 判别 run 恰 1 attempt 红 retained（EXIT=1 · class=api · **四向向 3 命中：T3 达·旅程红·装载面 364ms 全健康·红点=首断言后 13ms 第 2 断言面**）· sidecar v2 全程双计 0≤est25 · pins 十值零翻转 · 判读结论附协调方（consent 面定靶建议+G7P-1 环境分支收窄注记+N1 粒度限界）· post-prove 双审后归 meetwise 授权 nail。
