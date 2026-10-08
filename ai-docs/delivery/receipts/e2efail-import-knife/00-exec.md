# E2EFAIL-1 · full.e2e.ts emitE2EFailure 断链修复刀 · EXEC 收据（判别 run 恰 1 attempt · 零 retry-to-green · branch 3 预注册命中）

- **授权链**：REQUEST `a2dda46c` → rev2 `2ec927b7` → **rev3 `ef2dd5b2`（唯一蓝本）** → meetwise 协调方 EXEC 授权（mw-core）→〔**docker wedge MINE-STOP 一轮**（00-exec-mine-stop.md · 协调方处置：Docker Desktop 全量重启 → daemon 29.1.3 恢复）→ **resume 授权**（本收据）〕→ post-prove 双审（归协调方派）→ nail（归协调方授权）。
- **实跑 base**：worktree `meetwise-line-g7drv` · branch `line/g7-driver-assert` · tip `ef2dd5b2` + 本刀工作树改动（未 commit 实跑 · 同 CMOP03-F 先例以 sourceDigests 自证）。**实跑 code 自证 MATCH**：machine receipt `sourceDigests["e2e/full.e2e.ts"]=sha256:b5c3ea12…` 与工作树亲算全等 ✓ · `failure.ts=5ddb000a…`/`interview.ts=51f1ae97…`/`run-e2e.mjs=926fdf7d…` 同证 **Ban 三面零触碰**（failure.ts/failure-class.mjs/INTERVIEW_TERMINALS/interview.ts/runner 全未动）。
- **环境探针**：docker server 29.1.3（**协调方重启后**·`/_ping` OK 亲测）· node v22.22.3 · pnpm 10.18.0 · `pnpm install --frozen-lockfile` EXIT=0（4.2s · 零 lockfile 改动）· Key **set（name-only）** 只经进程环境 loader（`~/.meetwise-secrets/load-model-api-key.sh` · `set -a` source · 值零打印零入库零入 log）· **`.env*` ABSENT 前后双测**（probe_env=ABSENT / post_env=ABSENT · 本刀零创建零读取）· `E2E_VERBOSE` 未设（零调参）。
- **本收据判定效力**：EXEC 期读数原值记账 · 零 SSOT 行改写 · 判别 run 结局＝**EXIT=1 红 retained · class=api · branch 3（api 红）预注册命中——断链非该 run 触发点 · 红因另寻如实上报**（且死亡面较历史族更早——形状漂移如实登记 · 见 §5）。

## 1. coding 台账（修法两件套 · 机器核验）

- **A 断链修复**：`full.e2e.ts:14` = `import { createE2EReviewLedger, emitClassifiedE2EFailure, emitE2EFailure } from './helpers/failure.ts';` — `git diff --numstat e2e/full.e2e.ts` = **1 insertion / 1 deletion**（唯一改动行=:14 ⇒ `:201-203` 断言语义/failure.ts/failure-class.mjs/INTERVIEW_TERMINALS 数学上零触碰〔0 其他删除行〕·:205 调用面零触碰）。
- **B 机检**（`scripts/e2e-static-guards.mjs` 47+/0-）：`scanFailureHelperImports` — ① 从 `failure.ts` 的 `export {…} from './failure-class.mjs'` re-export 块文本解析导出面（不可解析/空面 ⇒ `failure_helper_exports_unreadable` **fail-closed EXIT=1**）；② full.e2e.ts 每个被调用导出名（正则 `name\s*\(` 文本级 · 前缀 `[^\w$.]` 排除属性访问）必须出现在 `./helpers/failure.ts` import 子句 ⇒ 缺失 ⇒ `failure_helper_import_missing:e2e/full.e2e.ts:<name>` EXIT=1；③ 双入口挂载（`evaluateE2eStaticGuards` + `scanE2eStaticGuards`〔CLI 直接调用 ⇒ EXIT=1 语义同源〕）——沿 :137 IMPORT_PATTERN（runners 面）与 :95 interview_helper_import（full.e2e.ts 面）先例形态 · 零新依赖。
- **B 红测自证（常驻负例 TC · 优先形态兑现）**（`scripts/e2e-static-guards.proof.mjs` 43+/0-）：
  - `TC-TEST-GUARD-019-failure-import-break-evaluate`：夹具机械摘 `emitE2EFailure` specifier（:205 调用保留）⇒ 必红 ✓ · 再摘 `emitClassifiedE2EFailure` ⇒ 双名必红 ✓（expectError 夹具）；
  - `TC-TEST-GUARD-019-failure-import-break-cli`：writeTree 夹具 + `scanE2eStaticGuards` 必红 ✓ + **captureGuard 实跑 CLI EXIT≠0 且 stderr 含 `failure_helper_import_missing:e2e/full.e2e.ts:emitE2EFailure`** ✓——**模拟摘 import 必红已固化常驻**（优先形态 · 超「手工摘-复原」下限）。

## 2. 静态门台账（五件 · wedge 前后双窗均绿）

| script | wedge 前窗 | resume 复核窗 | 注 |
| --- | --- | --- | --- |
| `e2e-static-guards:prove` | **0**（32/32） | **0**（32/32） | +2 新负例 TC 在卷 |
| `e2e-static-guards:check` | **0** | **0** | runners=6 helpers=20 flags=9 aiPaths=6 |
| `e2e-helpers:prove` | **0**（26 场景） | **0**（26 场景） | |
| `e2e-parity:prove` | **0**（22 场景） | **0**（22 场景） | |
| `e2e-case-inventory:prove` | **0** | **0** | 静态 pins 面 |

## 3. 判别 run attempts 台账（恰 1 有效 attempt · 零 retry）

| attempt | 记事 | EXIT |
| --- | --- | --- |
| #0（**未启动即中止**） | docker daemon wedge（`/_ping` 4×超时 exit=28 · `docker ps` 双探针挂死 · socket 可连/daemon 无响应）——**infrastructure-red 非产品红**（沿 HALOC A1-r1 先例入台账）· `pnpm e2e:isolated` **零启动**（恰一次台账未消耗）→ **协调方处置：Docker Desktop 全量重启 → daemon 29.1.3 恢复**（旧隔离容器清空属预期）→ resume 授权。详见 00-exec-mine-stop.md（原值保留） | n/a |
| **#1（唯一有效）** | `set -a && source ~/.meetwise-secrets/load-model-api-key.sh && set +a && pnpm run e2e:isolated`（经 orchestrate.sh 一次性封装 · sidecar v2 并行 §4） | **1** |

**attempt#1 原值读数**：

| 字段 | 原值 |
| --- | --- |
| EXIT | **1**（`.tmp/e2efail1-run/exit` · wrapper `ELIFECYCLE Command failed with exit code 1`） |
| stdout E2E_FAILURE 行 | **`E2E_FAILURE_CLASS class=api`**（01-wrapper.log:16 · 判定器 `lastE2EFailureClass(stdout)` 解析自 child 的 E2E_FAILURE 行 ⇒ child 确发 class=api 面）· 无 `E2E_FINAL_SUMMARY` · 无 `E2E_REVIEW_CLASS_COUNT` ⇒ **reviewLedger 0 行 · assertionCount=null** |
| machine receipt | `03-isolated-receipt.json`：outcome=failed · exitCode=1 · **durationMs=23330** · startedAt=11:15:26.576Z → finishedAt=11:15:49.906Z · failureClass=**api** · **assertionCount=null** · schemaMigrationManifest **count=144 latest=`0143_sse_push_notify.sql`**（base 漂移 142→144 如实登记 · CMOP03-F 时为 142/0142）· gitHead 字段 ABSENT（同 CMOP03-F E-2 形 · 以 sourceDigests 自证面 §0）· `ISOLATED_POSTGRES_OUTPUT_WITHHELD state_bytes=216 logs_bytes=0` |
| wrapper 里程碑 | boot anchor `E2E_POSTGRES_READY label=boot consecutive=3 attempt=6`（**重启后冷启 6 试**如实记）→ 容器 `meetwise-e2e-26416-1791458126574:59074` → migrate applied=144 → post-migrate anchor → pre-prove → **class=api 红**（01-wrapper.log 全 19 行在卷） |
| 时序 | run-e2e.mjs 有效窗 ≈ 5s（pre-probe ~11:15:44 → exit 11:15:49.9）· 死亡点在 tsx 用例输出任何结构行之前（0 review 行 ⇒ 未达 :58 首个 reviews.record〔3c 面〕· 未达 :187 主旅程 begin） |

## 4. sidecar v2 纪律行使（五条+叠加条+双计 · 全程）

| 纪律条 | 读数 |
| --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 anchor（wrapper log `label=post-migrate` :14 · sidecar `ANCHOR post-migrate seen` @11:15:39） |
| ② 42P01 pending 窗（不计失败预算） | ✓ pending=2 tick（首 ok 前） |
| ③ 停针计数器仅 post-first-ok 武装 | ✓ first-ok tick（armed）· 停针未触发（STOP 哨兵=wrapper 退出 · total 19 tick） |
| ④ v2 策略落文字 | `sidecar-v2-script.mjs`（cmop03f 卷内冻结版**逐字节复用 · 唯一 diff=outDir 一行**〔`.tmp/e2efail1-sidecar`〕· diff 亲证 · Ban 新发明查询兑现） |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 每 ok tick 双读（16 ok tick · 末可读=17） |
| 叠加·SELECT-only | ✓ 六查询全 SELECT 聚合 · 零行内容零 PII |
| 叠加·精确容器名+端口 | ✓ `meetwise-e2e-26416-1791458126574:59074`（全 run 单容器零重绑 · `fallbackUsed=false` 逐查询 docker-exec 直连） |
| 叠加·created_at∈run 窗 | ✓ inv 窗 `none|none`（零行平凡成立）· 末可读 ok tick 11:15:47.945 ⊆ run 窗 11:15:26.576–11:15:49.906 |
| 叠加·migrations 相关性·失配弃读 | ✓ 末可读 `migration_max=0143_sse_push_notify` ≡ machine receipt latest `0143_sse_push_notify.sql`（**容器态≡run 权威 manifest · 相关成立**）· 冻结 `WHERE version='0142'` 精确形 0 行=version 存文件名干（G7Y/CMOP03-F 同形注记）· **零弃读**（无失配面） |
| **双计分项** | **=0（succeeded 0 + failed 0 · 末可读 ok tick 17）· dispatching=0**（run 死于任何模型调用/job 创建之前——与 §3 死亡面一致）· teardown 撕裂窗注记：tick 18 半撕裂 / finalTick 19 `No such container`（wrapper finally 拆容器 · 读数取 tick 17 最末可读 · 沿 G7X/G7Y/CMOP03-F E-1 同形） |
| interview_job 读数 | 全程 `[]`（零 job）· last_error ∅ |

## 5. 三向预注册判读（REQUEST §3 × 实读）

| 预注册向 | 实读 | 判定 |
| --- | --- | --- |
| 绿 ⇒ 断链即根因 | EXIT=1 | 未命中 |
| worker 红 ⇒ 归刀② | class=api（非 worker） | 未命中 |
| **api 红 unchanged ⇒ 断链非该 run 触发点 ⇒ 红因另寻如实上报** | **命中**——EXIT=1 · class=api · **:205 可达性算术 a fortiori 排除**（该面需首循环空转 ≥420s〔interview.ts:287/:294/:302/:370〕· 本 run 全程 23.3s·run-e2e 有效窗 ~5s·0 review 行 ⇒ :205 连同其所在主旅程未进入） | **branch 3 成立：断链=已修复的潜伏炸弹（本 run 未触发）· 该 run 红因另寻**（child stderr 按 withhold 契约不可回读〔runFullE2E stderr 丢弃 by design〕· 精确 code 丢失=runner 原值行为 · 定位归协调方/后续刀） |
| 形状漂移（诚实注记 · 非洗白） | 历史 api 红族（G7X T-1 40363ms / CMOP03-FIX 78798ms / G7Y 101906ms）均**深跑红**（review 4-11 行·断言面中后段死）——本 run **0 行/0 断言/23.3s=史上最早死亡面**（未达 3c 首记）· **环境上下文**：run 于协调方 Docker 重启后 ~30min · PG 冷启 6 试 · infrastructure-adjacent 可能性**如实上报不裁定**（分类器原值=api 产品面 · infra-red 裁定权归协调方 · 沿 resume 指令 HALOC A1-r1 台账框架仅适用于 attempt#0 wedge 本身） | 形状登记升级协调方 |
| 红 retained ≠ 判别失败 | EXIT=1 retained ✓ 单 attempt 零 retry ✓ | ✓ |

## 6. 预算与卫生

- live 双计 **0 ≤ est 25** ✓（est-not-counter · 死于任何调用前=诚实 0）· **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
- Key 卫生：只经进程环境 loader · name-only 探针 `MODEL_API_KEY=set`（probe 文件在卷 · 值零打印零入库零入 log/commit）· **`.env*` ABSENT 双向记录**。
- 容器卫生：本 run 容器 wrapper finally 已拆（finalTick 亲证 `No such container`）· **外来容器零触碰零采信**：`meetwise-e2e-62497-cold2-stop-band-1-1791381408317`（CMOP03-F/G7Y 已登记同名）+ `meetwise-e2e-31654-1791458363379`（**本 run 结束 ~4min 后他 session 新起** · 时间戳/pid 亲证非本席）。
- Ban 复核：零 retry-to-green（判别 run 恰 1 有效 attempt）· 零第二次 run 通道 · 零调重试/并发/超时/VERBOSE · 零产品码/spec 触碰（tracked 改动=修法 A 一行+guards 两文件+收据族）· 零 SSOT 行改写 · 零 force-push · 零 self-approve · 零单臂冒充双臂（sidecar v2 实测臂全程行使 · E-4 前向纪律兑现）。

## 7. errata / notes（append-only）

- **E-1**：末可读读数取 ok tick 17（tick 18/19 撕裂窗——ij ok/inv 撕/容器消失 · wrapper finally 拆容器 · 沿 CMOP03-F E-1 同形下限界）。
- **E-2**：machine receipt `gitHead` 字段 ABSENT（红 run 形状）——实跑 code 以 sourceDigests 对工作树亲算 **MATCH** 自证（§0 · CMOP03-F E-2 同形）。
- **E-3**：attempt#0 wedge 事件与协调方重启处置原值见 00-exec-mine-stop.md（保留不改写）· 本收据 §3 台账为汇总面。
- **E-4**：base 漂移：schemaMigrationManifest 142/0142（CMOP03-F）→ **144/0143_sse_push_notify**（本 run）——主线前移事实如实登记（0143=sse-push-notify 落地）· 非本刀域。

## 8. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ 该 run api 红根因定位定谳**（branch 3=排除性读数 · 红因另寻归协调方）· **≠ G7 三绿**（g7SuiteGreen=false 维持）· ≠ `:107` 关闭 · ≠ 刀②落地 · ≠ C-MO-P3 收口（erratum 材料待判别 run 后续裁决）· ≠ infra-red 裁定（attempt#1 分类原值=api · 环境关联可能性上报不裁定）· ≠ POST7B/7A 域任何翻案 · not covered（coveredCount=8 unchanged）· not HA · not `releaseEvidence=true`（receipt 自证 release_evidence=false）· **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · alone ≠ dual（post-prove 双审归协调方派）· 禁洗红为 flake/env 偶发（环境上下文如实上报·裁定归协调方）· 禁把 0 双计读作「账本无调用=无问题」。

---

**STOP：EXEC 完毕（exec:awaiting_post_prove_dual）**——修法 A/B 落树+五门绿+判别 run 恰 1 attempt 红 retained（class=api · branch 3 命中 · 断链非触发点 · 形状漂移+环境上下文升级协调方）· post-prove 双审后归 meetwise 授权 nail。
