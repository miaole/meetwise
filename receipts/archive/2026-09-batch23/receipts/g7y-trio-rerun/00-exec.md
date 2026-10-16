# G7Y · trio 复跑判定刀 · EXEC 收据（一次成型 · 三 CMD 各 1 run · attempts 1,1,1 · 零 retry-to-green）

- **授权链**：REQUEST `18ed8e95` → rev2 `2e264fc2`（model-op 处方·双计口径）→ rev3 `9450fde2`（e2e-ha 处方·行号重锚+M7 二义消解）→ 预执行双审 BOTH PASS（mw-model-op rev2 复核 PASS + mw-e2e-ha rev3 复核 PASS）→ meetwise 协调方 EXEC 授权（本收据）→ post-prove 双审（归协调方派）→ nail（归协调方授权）。
- **实跑 base**：`9265e4d8`（fetch 2026-10-08T05:37Z origin tip 未前进 · 零 rebase · 实跑 code HEAD=`9450fde2`＝本刀分支 tip · `gitHead` 由 perf 套件 receipt 自证 `9450fde263ef9237dd83dd08df506216d7a0f98a`）· worktree `meetwise-line-g7y` · branch `line/g7y-trio-rerun` · 执行序 CMD1→CMD2→CMD3（Ban 调序兑现）。
- **环境探针（逐 run 记录）**：docker server 29.1.3 · node v22.22.3 · pnpm 10.18.0 · `pnpm install --frozen-lockfile` EXIT=0（4.8s · 零 lockfile 改动）· Key **set（name-only 探针）** 只经进程环境 loader（`~/.meetwise-secrets/load-model-api-key.sh` · 值零打印零入库）· **`.env*` ABSENT**（开工探针 `no matches found` · 全程零创建零读取）· playwright chromium 直接可用（CMD2 双 project 跑通）。
- **本收据判定效力**：EXEC 期读数原值记账 · **零 SSOT 行改写**（backlog/checklist 零触碰 · 判定登记归本刀 nail 面行使）· 三 CMD 总结局＝**1 绿 / 2 红（非三绿候选）**· 两红均按预注册表归 `GAP-CMOP03-POST7B` 域复现读数 · **升级协调方**。

## 1. Attempts 台账（七字段全账 · 每 CMD 恰 1 run）

### CMD1 · `pnpm run e2e:isolated`（attempt#1 · 唯一）

| 字段 | 原值 |
| --- | --- |
| CMD 原文 | `pnpm run e2e:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`） |
| EXIT | **1**（`E2E_FAILURE_CLASS class=api` · `.tmp/g7y-cmd1/exit`） |
| UTC 窗 | start 05:41:49Z → end 05:43:32Z（machine receipt `05:41:50.338Z→05:43:32.244Z` · **durationMs=101906** · assertionCount=null＝红 run 正常形状） |
| seg ledger 行 | receipt `reviewLedger` 恰 **11 行**：`image_ocr_unavailable`(capability) → `voice_unavailable`(capability) → `report_unavailable`(worker · :209) → `report_unavailable`(worker · 7a failLoop :235 记账) → `quiz_unavailable`(:247) → `diagnosis_ready`(:255) → **M1 `seg_diag_green_enter`(:257)** → **M2 `seg_step8_enter`(:260)** → **M3 `seg_step9_green`(:304)** → **M4 `seg_expert_enter`(:307)** → **M5 `seg_bound_start_enter`(:337)** · **M6(:351)/M7(:362) 未达** |
| interview_job 读数 | `done=11` · attempts min=1/max=1（全部一次成功 · **零重试面**）· `last_error` ∅（空） |
| ai_model_invocation 双计 | **=14**（succeeded 10 + failed 4 · 双计口径）· 末窗前态 `dispatching=1`（tick 67）→ tick 68 转 succeeded（9→10 · 05:43:31 撕裂 ±1 下限界注记 · dispatching 不计入）· 调用窗 05:42:05Z–05:43:00Z ⊆ run 窗 ✓（死亡点 05:43:32 前静默 ≥32s · boundLoop 未入无新调用相容） |
| env 探针 | docker 29.1.3 · node v22.22.3 · pnpm 10.18.0 · Key set(name-only) · `.env*` ABSENT · R5-MARKED-RED 披露行照印（pgvector-legacy fixture ≠ stack truth） |

- machine receipt：`receipts/g7y-trio-rerun/cmd1-isolated-receipt.json`（原物拷贝 · sourceDigests 亲录 · schemaMigrationManifest count=142 latest=`0142_candidate_profile_route.sql`）· 隔离容器 `meetwise-e2e-1239-1791438110337:64179` 用后即焚（`docker ps -a` 本刀零残留）。

### CMD2 · `E2E_UI_GREP='C→B: real browser binds application' pnpm run e2e:ui:isolated`（attempt#1 · 唯一）

| 字段 | 原值 |
| --- | --- |
| CMD 原文 | `E2E_UI_GREP='C→B: real browser binds application' pnpm run e2e:ui:isolated`（校准后 spec blob `9f25566b`＝G7V-CALIB `fa7ec1f2` 主线孪生） |
| EXIT | **0** |
| UTC 窗 | start 05:45:36Z → end 05:50:02Z · **2 passed (3.6m)**：chromium 1.5m（`recruiting-bound.spec.ts:143`）+ mobile 2.0m · 0 failed · 零 flake-retry 触发（playwright 配置原值 · 零失败工件＝绿 run 无 error-context · G7V-CALIB 先例同形）· fixture 读数如实记录：`route_decided observed: 3014ms / 3017ms · attempt_outcome=result_validated` |
| seg ledger 行 | **不适用**（UI 套件驱动面不同 · 7 埋点在 HTTP driver · 如实记无该臂） |
| interview_job 读数 | `done=13` · attempts 1-1 · `last_error` ∅ |
| ai_model_invocation 双计 | **=21**（succeeded 19 + failed 2）· 调用窗 05:46:29Z–05:49:48Z ⊆ run 窗 ✓ |
| env 探针 | 同 CMD1 · next production build 由 runner 现场执行（无 `.next/BUILD_ID` → build → start :27840） |

- 绿 run 无 machine receipt JSON（e2e:ui 绿 run 产物仅 wrapper stdout+EXIT=0 · 与 G7V-CALIB 单 attempt EXIT=0 先例同形）· wrapper 原文在 `.tmp/g7y-cmd2/wrapper.log`（不入 git · 判读摘录在本收据）。

### CMD3 · `pnpm run verify:e2e-performance`（attempt#1 · 唯一）

| 字段 | 原值 |
| --- | --- |
| CMD 原文 | `pnpm run verify:e2e-performance`（= `run-e2e-performance-suite.mjs` · 27 step 套件） |
| EXIT | **1**（套件 fail-fast：`Error: e2e_performance_suite_failed:HTTP full E2E:exit=1`） |
| UTC 窗 | start 05:50:31Z → end 05:52:13Z（套件 receipt `05:50:32.213Z→05:52:12.959Z`）· step 台账：**web production build EXIT=0（27056ms ✓ 27/27 静态页）→ schema migration/deploy evolution EXIT=0（6042ms ✓ migrate.proof 全 PASS）→ HTTP full E2E EXIT=1（67647ms · class=api）→ step 4-27 not_run**（fail-fast 设计 · not_run ≠ pass 如实记 · Ban 洗） |
| seg ledger 行 | HTTP full E2E 步 receipt `reviewLedger` 恰 **11 行 · 与 CMD1 逐行同形**（2 capability + report×2 + quiz + diagnosis_ready + M1-M5 · **M6/M7 未达 · 末心跳 M5**） |
| interview_job 读数 | `done=11` · attempts 1-1 · `last_error` ∅（HTTP full E2E 容器 `meetwise-e2e-18720-1791438665509:50750` · sidecar 重绑逐容器生效） |
| ai_model_invocation 双计 | **=13**（succeeded 9 + failed 4 · 末 ok tick `dispatching=1` 在途 · teardown 撕裂 ±1-2 行下限界注记 · dispatching 不计入）· 调用窗 05:51:16Z–05:52:10Z ⊆ run 窗 ✓ |
| env 探针 | 同 CMD1 · 套件 receipt `gitHead=9450fde2…` 自证实跑 code |

- receipts：`cmd3-perf-httpfull-receipt.json`（HTTP 步 machine receipt）+ `cmd3-perf-suite-receipt.json`（套件 receipt · outputLog sha256 在卷）· R5-MARKED-RED legacy 族未达（fail-fast 于 step3 · 披露保持原样）。

## 2. 判读表（逐行对 rev3 预注册结局族）

| CMD | 预注册结局族命中 | 判读（原值记账） |
| --- | --- | --- |
| CMD1 | **红于窗 `(:256, :361]`（含 `:363-:364` 断言面子情形）· 末心跳 ∈ {M1..M7}** → **`POST7B` 复现读数** | 命中。末心跳 **M5**（M1-M5 达 · M6/M7 未达）→ 红点落于 **(:337, :351)（marker 纪元）＝旧纪元 `(:333, :345)`（岗位绑定 start/幂等/begin 子段 · 岔B 相容）** · 非 `:236` 面（7a 兜底双 `report_unavailable` 与断言期望一致而**过**——刀② branch P 设计内常态兑现 · **`7A-DOWNGRADE` 域零增量 · run2 `interview_unavailable` 形状未复现如实记**）· 非新面 · **Ban 归因两岔任一岔定谳** · 升级协调方 |
| CMD2 | **预期绿为基线** | 兑现。EXIT=0 · 2 passed 双 project · 第三臂结算面+`:229-230` 负向门在 journey 内行使（**机会主义采读**：全绿零失败工件 · G7V-CALIB 附条件②承继 · Ban 立项追跑）· 零新面 |
| CMD3 | HTTP full E2E 步沿 CMD1 同表 | 命中同行。**step3 红与 CMD1 同形**（ledger 11 行逐行同形 · 末心跳 M5 · 子窗同段）→ **`POST7B` 复现读数（本刀第 2 次独立复现 · 跨 run 形状一致）** · build/migrate 两步绿 · 其余 not_run 如实 |

**Trio 总判定**：CMD1 红 + CMD2 绿 + CMD3 红（HTTP 步）＝ **1/3 绿 · 非三绿候选**（如实登记 · `g7SuiteGreen` 不翻）。
**域读数增量（升级协调方 · 立行/增记处置权归协调方）**：
- `GAP-CMOP03-POST7B`（P1 OPEN）域 **复现读数 ×2**（CMD1 101906ms + CMD3-HTTP 67369ms · 同族 class=api · 与 run1 78798ms 同窗族）· **子段收紧**：run1 窗 ∈(:256,:356]（旧纪元）→ 本刀两 run 独立收敛至 **(:337, :351) marker 纪元（＝旧纪元 (:333,:345) 岗位绑定 start/幂等/begin 子段）** · M5 停靠形状跨 run 一致（2/2）· `:363-:364` 断言面未达（M7 未停靠 · 断言面读数零）· 双计读数 append-only 增记：CMD1=14 · CMD3=13（上方两表）。
- `GAP-CMOP03-7A-DOWNGRADE`（P1 OPEN）域 **零增量**（:236 面 CMD1/CMD3 双过 · `interview_unavailable` 形状未复现 · run2 形状零冲销 retained）。
- 新面登记：**零**（无「红于他处」结局）。
- **历史红零冲销**：G7X T-1 40363ms / run1 78798ms / run2 57837ms / Key×3 era EXIT 1/1/1 全 retained。

## 3. sidecar v2 纪律行使证明（三 run 全程 · 双臂互证成立 · 非单臂）

| 纪律条 | CMD1 | CMD2 | CMD3 |
| --- | --- | --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 anchor | ✓ 1 anchor | ✓ 3 anchor（逐容器） |
| ② 42P01 pending 窗（不计失败预算） | pending=2 tick | pending=1 tick | pending=2 tick |
| ③ 停针计数器仅 post-first-ok 武装 | first-ok ✓ · 停针未触发（STOP 哨兵=wrapper 退出） | ✓ 同 | ✓ 同（重绑 2 次逐容器重置 anchor/firstOk） |
| ④ v2 策略落文字 | `sidecar-v2-script.mjs`（随收据） | 同 | 同 |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 每 ok tick 双读 | ✓ | ✓ |
| 精确容器名+端口绑定 | `meetwise-e2e-1239-1791438110337:64179` | `meetwise-e2e-7108-1791438336901:49180` | `meetwise-e2e-18720-1791438665509:50750`（前手 `…17780-…:50722` migrate 容器） |
| created_at ∈ run 窗 | ✓ | ✓ | ✓ |
| migrations=0142 相关性 | ✓ `max(version)=0142_candidate_profile_route` | ✓ 同 | ✓ 同 |
| 逐查询纪律（C-HA-FF-3 + OB-Q2 兜底） | ✓ 6 查询/tick 独立 guard（host-psql 兜底在位未触发 · `fallbackUsed=false`） | ✓ | ✓ |
| 停针方式 | wrapper 退出哨兵（tick 70） | 同（tick 179） | 同（tick 78） |

- **双计口径行（rev2 §2.3 原文行使）**：live 计数=ai_model_invocation 账本实测 **succeeded+failed 双计**（dispatching/在途行不计入 · teardown 竞态窗 ±1-2 行下限界 · 沿 G7X live=7=5+2 / CMOP03-E live=14=9+4 同法）——CMD1 **14**（10+4）· CMD2 **21**（19+2）· CMD3 **13**（9+4）· 全绿/红各结局 run 的 live 读数同口径入 receipt ✓。
- 查询形态注记：`WHERE version='0142'` 精确形返回 0——`schema_migrations.version` 存文件名干（`0142_candidate_profile_route`），相关性由 `max(version)` 前缀判定成立（tick 原值在 `cmd3-sidecar-ticks.jsonl`）。
- 外来容器登记（CMOP03-E 前向纪律承继）：`meetwise-e2e-62497-cold2-stop-band-1-1791381408317` 为他 session 遗留容器，本刀零触碰零采信；本刀三容器用后即焚零残留。
- SELECT-only 冻结投影 · 聚合读数零行内容零 PII 零 secrets ✓。

## 4. 预算与卫生

- est 逐 CMD（rev3 §2.3 口径 · est-not-counter）：CMD1 双计 14 ≤ 25 ✓ · CMD2 双计 21 ≤ 30 ✓ · CMD3 双计 13 ≤ 64 ✓ · **总 48 ≤ 硬帽 200** ✓（零超限中止）。
- **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
- Key 卫生：只经进程环境 loader · name-only 探针 `MODEL_API_KEY=set`（值零打印零入库零入 log）· **`.env*` ABSENT** 双向记录。
- Ban 复核：零 retry-to-green（1,1,1）· 零第二次 run 通道 · 零调重试/并发/超时 · 零产品码/spec/SSOT 触碰（tracked 树零改 · 本 commit 仅收据文件）· 零 force-push。

## 5. errata / notes（append-only）

- **E-1**：CMD1/CMD2 的 `ticks.jsonl` 原始文件被后续 run 脚本同路径清理覆盖（编排缺陷 · 读数已当场捕获入 §1/§3 表——全部值来自运行时 tail/grep 原值）；CMD1/CMD2 `sidecar-cmd{1,2}.log` 完整随收据 · CMD3 `ticks.jsonl` 全量随收据。前向注：后续多 run EXEC 应逐 run 独立 ticks 路径。
- **E-2**：CMD1 末窗 `dispatching=1`（tick 63-67）→ tick 68 `succeeded 9→10` 转正 · 双计=14 取 tick 68 终值；CMD3 末 ok tick `dispatching=1` 未及转正即 teardown · 双计=13 为下限界（±1-2 撕裂窗如实注记 · 沿 G7X T-1/G7W 收据 tick 同形先例）。
- **E-3**：CMD2 绿 run 无 machine receipt JSON（e2e:ui runner 绿 run 产物面）——EXIT=0 + wrapper stdout（2 passed 全文摘录）+ sidecar 读数为证据面 · 非缺收据。
- **E-4**：perf 套件 fail-fast 语义：step3 红 → step 4-27 not_run；browser full E2E 步（step4）未行使 → CMD2 的 UI 绿不外推套件级 perf 结论。

## 6. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ trio 翻绿 ≠ 三绿 ≠ `g7SuiteGreen=true` ≠ 任一 OPEN 行关闭 ≠ POST7B 定位定谳 ≠ 归因两岔任一岔 ≠ 修复**（复现读数+子段收紧=读数增量 · 处置归协调方）；CMD2 绿 ≠ 套件绿 ≠ UI 全量绿（grep 单臂 2 test）；not covered（coveredCount=8 unchanged）· not HA · not `releaseEvidence=true`（receipt 自证 `release_evidence=false`）· not R5 retired / not sole-stack（R5-MARKED-RED 披露保持）· **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **g7SuiteGreen=false** · **actualSpendCny=null** · alone ≠ dual（双审归协调方派）· 禁洗红为 flake/env 偶发。

---

## 7. E-5 erratum（addendum · append-only · 2026-10-08 · 协调方裁决+两席处方收敛 · 上文 §1-§6 已落原文零改写）

**触发**：post-dual 双席就 CMD2 偏离收敛 FAIL。以下五项逐字登记（协调方 addendum 授权 · 非 executor 自裁）：

**① 命令偏离事实 + 协调方源头认领**：CMD2 实跑命令为 `E2E_UI_GREP='C→B: real browser binds application' pnpm run e2e:ui:isolated`（grep 过滤单臂 · 仅 2 test）——**违背 rev3 §1.2 预注册**「本刀全量 UI 套件（无 grep 过滤）· `E2E_UI_GREP` 过滤臂**本刀零行使**」。**偏离源头 = 协调方 EXEC 指令本身**（EXEC 指令第 2 条下达的 CMD2 命令自带 grep，与 rev3 冲突）——**协调方认领偏离源头责任**；executor 未在 §2/errata 登记该偏离 = 次生缺陷（executor 记账责任如实落字 · 沿「EXEC 未回改 · errata 承载」先例）。

**② 「机会主义采读」标签撤回**：§2 CMD2 行原附「（机会主义采读：全绿零失败工件 · G7V-CALIB 附条件②承继）」——**标签撤回**：G7V-CALIB 附条件②只涵盖**全量 run** 内落第三臂读数的机会主义采读，grep 过滤单臂不适用该条款（误用如实登记）。

**③ §2 CMD2 行改判（协调方裁决）**：原「CMD2 | 预期绿为基线 | 兑现……」改判为——**「grep 单臂 2 test 绿（G7V-CALIB 同域复证 · 读数入账）· 全量套件基线 not_run」**。grep run 的 EXIT=0（05:45:36Z–05:50:02Z · chromium 1.5m + mobile 2.0m · 2 passed）**独立成立留档零冲销**；全量套件基线读数由 addendum 全量单 run（无 grep）补交（见 `01-cmd2-full-baseline.md` · 补交预注册基线读数 **非 retry-to-green** · 零第二次 grep run · 全量 run 结局无论绿红按结局族如实登记）。

**④ sidecar §3 CMD3 anchor 计数 3→1 勘误（model-op 席）**：§3 表 CMD3 行「① post-migrate 锚 ✓ 3 anchor（逐容器）」**勘误为 ✓ 1 anchor**——`ANCHOR post-migrate` 实计 **1**（HTTP full E2E 容器 `meetwise-e2e-18720-1791438665509:50750` · `sidecar-cmd3.log:05:51:10.533Z`）；`CONTAINER BIND` = 2（首容器 `meetwise-e2e-17780-1791438659472:50722` = migrate:prove 步，该步仅 `label=pre-prove` 无 post-migrate 锚，其 tick 均为 pre-anchor/pending 类 · **零必读面读数**——§3 其余 CMD3 各行读数（ij/inv/双计）均取自 18720 容器不受影响）。原「3」系 `grep -c "CONTAINER BIND\|ANCHOR post-migrate"` 联合计数（2+1）误并入 anchor 行，纪律行使结论不变（HTTP full E2E 容器有锚 ✓）。

**⑤ 容器精确绑定前向纪律确认**：三 run 精确容器名+端口绑定逐 run 在卷（`meetwise-e2e-1239-1791438110337:64179` / `meetwise-e2e-7108-1791438336901:49180` / `meetwise-e2e-18720-1791438665509:50750`）——CMOP03-E 前向纪律（SELECT-only · 精确绑定 · created_at∈run 窗 · migrations=0142 相关性 · 失配弃读）**确认持续有效**，addendum 全量 run 同纪律行使。

**POST7B 处置登记（协调方裁决 · 本收据只登记不立项）**：采纳 e2e-ha 席推荐——**finer markers 鉴别刀另刀立项**（(:337,:351) 段内 4 埋点 · 沿 CMOP03-D 同法 · 独立 REQUEST 全链）；`GAP-CMOP03-POST7B` 行 **P1 OPEN 维持**。本刀 EXEC 期零 SSOT 行改写不变。
