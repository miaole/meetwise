# CMOP03-F · POST7B finer markers 段内鉴别刀 · EXEC 收据（一次成型 · 判别 run 恰 1 attempt · 零 retry-to-green）

- **授权链**：REQUEST `7ef80920` → rev2 `2bd5f041`（model-op 处方：sidecar 叠加三条+双计口径+折扣注记）→ 预执行双审 BOTH PASS（mw-e2e-ha PASS @rev1 + mw-model-op FAIL→rev2 复核 PASS）→ meetwise 协调方 EXEC 授权（本收据）→ post-prove 双审（归协调方派）→ nail（归协调方授权）。
- **实跑 base**：协调方授权重钉 `2bd5f041`（本刀分支 tip · fetch 2026-10-08T09:1xZ 亲证 `origin/line/cmop03f-finermarkers` 同点）；主线 `origin/feat/mysql-schema-skeleton` 已前移至 `48dee7a2`（≠实跑点）——按 G7Y §1.6「跑在 committed SHA 上（协调方重钉为准）」以本刀分支 tip 为实跑 base 如实记录。实跑 code 自证：machine receipt `sourceDigests["e2e/full.e2e.ts"]`=`sha256:0658fa6c…` 与工作树（base+恰 4 埋点）亲算 **MATCH**（receipt `gitHead` 字段=null · 以 sourceDigests 为自证面 · E-2 注记）。worktree `meetwise-line-cmop03f` · branch `line/cmop03f-finermarkers`。
- **环境探针**：docker server 29.1.3 · node v22.22.3 · pnpm 10.18.0 · `pnpm install --frozen-lockfile` EXIT=0（4.7s · 零 lockfile 改动）· Key **set（name-only 探针）** 只经进程环境 loader（`~/.meetwise-secrets/load-model-api-key.sh` · 值零打印零入库零入 log）· **`.env*` ABSENT**（开工探针 `no matches found` · 全程零创建零读取）。
- **本收据判定效力**：EXEC 期读数原值记账 · **零 SSOT 行改写**（backlog/checklist 零触碰 · 判定登记归本刀 nail 面行使）· 判别 run 结局＝**EXIT=1 红 retained · 红点在段外（预注册双向界条款命中）→ 如实升级协调方（跨 run 形状漂移）**。

## 1. coding 台账（恰 4 行 seg2 埋点 · insert-only）

- **diff 形状（机器核验）**：`git diff --numstat e2e/full.e2e.ts` = **4 insertions / 0 deletions**——insert-only ⇒ 全部既有行（含 `:337-:351` 段全部 A() 断言本体与 M5/M6 心跳行、`:356`/`:357`、CMOP03-D 7 枚 seg_*）**逐字节零 diff**（0 删除行的数学性质）。4 行全为 `reviews.record({ class: 'worker', code: 'seg2_*' })` 形态（`E2E_REVIEW_LINE_RE` code 正则合形）。
- **marker 纪元重锚（插入后实锚 · 逐行亲证）**：M5=`:337`（未动）· **F1 `seg2_start_readjson`=`:340`** · **F2 `seg2_start_assert_pre`=`:342`** · start 断言=`:343-:345` · fetch#2=`:346` · readJson#2=`:347` · 幂等断言=`:348-:349` · **F3 `seg2_idem_assert_post`=`:350`** · fetch#3=`:352` · begin 断言=`:353` · **F4 `seg2_begin_assert_post`=`:354`** · M6=`:355`（+4 位移）· M7=`:366`（+4）。CMOP03-D 7 枚（M1:257/M2:260/M3:304/M4:307/M5:337/M6:355/M7:366）留树零改写。
- **三零机器核验**：① A() 本体逐字节零 diff ✓（4+/0-）；② 四钉 blob 前后全等 ✓（EXEC 前后亲算：`sse.ts`=`9bba015d` · `assert.ts`=`975fbb38` · `run-e2e-isolated.mjs`=`e818fb46`〔登记旧值 `13dbfc43` 漂移已在卷 · 本刀零触碰〕· `model-operation-registry.ts`=`63af556f`）；③ withhold 契约零触碰 ✓（本刀零码触碰 runner · `seg2_*` 为 E2E_REVIEW 结构化行 ≠ stderr 断言原文回读）。

## 2. 静态门台账（五件）

| script | attempt | EXIT | 注 |
| --- | --- | --- | --- |
| `e2e-static-guards:prove` | 1 | **0** | selected=30/30 · releaseEvidence=false |
| `e2e-static-guards:check` | 1 | **0** | runners=6 helpers=20 flags=9 aiPaths=6 |
| `e2e-helpers:prove` | 2 | **0** | 首 attempt EXIT=1 根因=node_modules missing（新 worktree 环境面 · 非埋点缺陷）→ `pnpm install --frozen-lockfile` EXIT=0 后复跑 EXIT=0 · 26 scenarios |
| `e2e-parity:prove` | 1 | **0** | 22 scenarios（parity-b 再生 base 生效） |
| `e2e-case-inventory:prove` | 1 | **0** | 静态 pins 面 |

## 3. 判别 run attempt 台账（CMD1 同体 · attempt#1 唯一）

| 字段 | 原值 |
| --- | --- |
| CMD 原文 | `pnpm run e2e:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:prove`）+ sidecar v2 并行（§4） |
| EXIT | **1**（`E2E_FAILURE_CLASS class=api` · `.tmp/c03f-run/exit`） |
| UTC 窗 | start **09:21:30Z** → end **09:22:28Z**（machine receipt `startedAt=09:21:30.488Z` `finishedAt=09:22:28.688Z` · **durationMs=58200** · assertionCount=null＝红 run 正常形状） |
| reviewLedger | 恰 **4 行**：`image_ocr_unavailable`(capability) → `voice_unavailable`(capability) → `report_unavailable`(worker · :209 主旅程终态记账) → **`interview_unavailable`(worker · :235 7a failLoop recordTerminal 记账)** · **零 seg_*/seg2_* 心跳行（M1-M7 全未达 · F1-F4 全未达 · 末心跳=无）** |
| 死亡面 | **`:236` 7a failLoop 断言面相容**——failLoop terminal 实得 `interview_unavailable` ≠ 断言期望 `report_unavailable`（`:236` `A(failLoop.terminal === 'report_unavailable' && …)` fail-fast）· 精确断言行 withhold 契约内不可回读（`ISOLATED_POSTGRES_OUTPUT_WITHHELD state_bytes=217 logs_bytes=0`）· bounding 非「已证」 |
| receipt | `cmd1-isolated-receipt.json`（原物拷贝 · sourceDigests 亲录 · schemaMigrationManifest count=142 latest=`0142_candidate_profile_route.sql`）· 容器 `meetwise-e2e-31828-1791451290487:60471` 用后即焚（`docker ps -a` 本刀零残留 · 外来容器 `meetwise-e2e-62497-cold2-stop-band-1-1791381408317` 他 session 遗留零触碰零采信——G7Y 已登记同名） |

## 4. sidecar v2 纪律行使（五条+叠加三条+双计 · 全程）

| 纪律条 | 读数 |
| --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 anchor（`E2E_POSTGRES_READY label=post-migrate` @ wrapper stdout） |
| ② 42P01 pending 窗（不计失败预算） | ✓ pending=2 tick（首 ok 前） |
| ③ 停针计数器仅 post-first-ok 武装 | ✓ first-ok tick（armed）· 停针未触发（STOP 哨兵=wrapper 退出 · total 41 tick） |
| ④ v2 策略落文字 | `sidecar-v2-script.mjs`（G7Y 收据卷内冻结版原样复用 · 唯一 diff=outDir 一行产物路径 · 查询/纪律逻辑逐字节冻结 · Ban 新发明查询兑现） |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 每 ok tick 双读（35 ok tick） |
| 叠加·精确容器名+端口绑定 | ✓ `meetwise-e2e-31828-1791451290487:60471`（全 run 单容器零重绑 · `fallbackUsed=false` 逐查询 guard 全 docker-exec 直连） |
| 叠加·created_at∈run 窗 | ✓ inv 调用窗 `09:21:48.449–09:22:25.201`（tick 39 最末可读）⊆ run 窗 `09:21:30.488–09:22:28` |
| 叠加·migrations=0142 相关性 | ✓ `max(version)=0142_candidate_profile_route`（`WHERE version='0142'` 精确形 0 行——version 存文件名干 · 前缀判定成立 · G7Y 同形注记）· **失配弃读：无失配面（零弃读）** |
| **双计分项** | **=11（succeeded 8 + failed 3 · 末 ok tick 40）· dispatching=0（无在途）· teardown 撕裂 ±1-2 下限界注记（tick 40 inv_window/migmax 恰逢容器拆除 err——读数取 tick 39 · E-1 注记）** |
| interview_job 读数 | 末读 `done=9` · attempts min=1/max=1 · `last_error` ∅（空）· tick 34/37/38/39 有 `running|1` 在途过渡态 |

## 5. 判读表（rev2 §4 预注册判据 × 实读）

| 预注册条款 | 实读 | 判定 |
| --- | --- | --- |
| 六窗任一（M5✓F1✗ / F1✓F2✗ / F2✓F3✗ / F3✓F4✗ / F4✓M6✗ / F4✓M6✗零隙） | **零心跳**（M1 未达 ⇒ F1-F4 全未达 ⇒ 六窗全不适用） | 未命中——**段内判别读数=零（判别对象未抵达 · 非埋点失效：静态门五件 EXIT=0 + sourceDigests 自证埋点 code 实跑）** |
| **双向界条款（段外红）**：「M5 未达（红点在 :337 前）或 M6 达（红点在 :351 后）⇒ 红点在本段外 ⇒ 如实验证升级协调方（跨 run 形状漂移）」 | **命中**——末心跳=无（红点在 M1(:257) 前 · 远在 M5(:337) 段外）· ledger 4 行与 G7Y trio 11 行 POST7B 形状**不同形** | **段外红 → 如实升级协调方（跨 run 形状漂移）· Ban 强行归类段内兑现** |
| 段外面归属（判读 · 非归因） | ledger 4 行 + failLoop terminal=`interview_unavailable` ⇒ **`:236` 7a 面相容**＝**CMOP03-D run2 `GAP-CMOP03-7A-DOWNGRADE` 形状第 2 次独立复现**（run2 57837ms ledger 恰 4 行 :236 致死 M1-M7 全未达——本 run 58200ms 同时长族同 ledger 形 · G7Y nail「run2 `interview_unavailable` 形状未复现」的形状**本次复现**） | **7A-DOWNGRADE 域读数增量登记（归本刀 nail 转挂 · Ban 就地归因 OPEN 行 · Ban 归因三候选〔`adaptive-lifecycle.ts:54`/`interview-consumer.ts:93`/`commerce-reconcile.ts:65` 并列零归因纪律照抄〕）** |
| **BUG-E2E-FAILUNIMPORT 折扣注记引用（rev2 §4）** | 段外红命中折扣场景——`class=api` 分类读数**按折扣引用**（段外分类面受扰 · 升级判定不依赖受扰分类面 · 依赖 ledger 心跳序位） | ✓ 引用兑现 |
| 预期红 retained ≠ 判别失败 | EXIT=1 class=api retained ✓ | ✓（红 retained 如实 · 单 attempt 零 retry） |
| POST7B 域 | **11 行形状本次未复现**（×3 原值 78798/101906/67369ms retained 零冲销） | POST7B **P1 OPEN 维持**（未复现≠关闭≠解决 · 段内 finer markers 读数待 POST7B 形状复现 run · 处置归协调方） |

## 6. 预算与卫生

- live 双计 **11 ≤ est 25** ✓（est-not-counter）· 链累计 **71+11=82 ≤ 硬帽 200** ✓（零超限中止）· **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
- Key 卫生：只经进程环境 loader · name-only 探针 `MODEL_API_KEY=set`（值零打印零入库零入 log/commit）· **`.env*` ABSENT** 双向记录（本刀零读取零创建）。
- Ban 复核：零 retry-to-green（判别 run 恰 1 attempt）· 零第二次 run 通道 · 零调重试/并发/超时 · 零产品码/spec 触碰（tracked 改动恰 `e2e/full.e2e.ts` 4 行 + 本收据族）· 零 SSOT 行改写 · 零 force-push · 零 self-approve · 零单臂冒充双臂（sidecar 双臂全程行使 · 与 driver ledger 读数并记）。

## 7. errata / notes（append-only）

- **E-1**：末 ok tick 40 的 `ai_model_invocation_window`/`migration_relevance`/`migration_max` 三查询恰逢容器拆除撕裂窗 err（`No such container`/`is not running`）——叠加窗/迁移读数取 **tick 39 最末可读值**（`09:22:25.201` max created_at ⊆ run 窗 ✓）；双计取 tick 40（ij/inv_status 两查询 tick 40 仍 ok）。teardown ±1-2 下限界注记沿 G7X/G7Y 同形先例。
- **E-2**：machine receipt `gitHead` 字段=null（runner 产物面字段缺 · 红 run 形状）——实跑 code 以 `sourceDigests["e2e/full.e2e.ts"]` 对工作树亲算 **MATCH** 自证（§0）。
- **E-3**：wrapper stdout `logs_bytes=0`（G7Y CMD1 为 1617）——withhold 面更严为 runner 原值行为 · 精确断言行不可回读纪律不变（bounding 非「已证」）。

## 8. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ POST7B 定位定谳**（段外红 · finer markers 零判别读数）· **≠ 7A-DOWNGRADE 归因定谳**（`:236` 面相容=读数增量 · 三候选并列零归因）· **≠ 修复**（定位≠修复≠关闭）· **≠ POST7B 关闭**（P1 OPEN 维持 · ×3 原值零冲销）· **≠ 7A-DOWNGRADE 关闭**（P1 OPEN 维持 · 增量登记归 nail）· ≠ 埋点失效判定（零读数=死亡点在埋点前 · 静态门+sourceDigests 自证埋点有效在跑）· not covered（coveredCount=8 unchanged）· not HA · not `releaseEvidence=true`（receipt 自证 `release_evidence=false`）· **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · alone ≠ dual（post-prove 双审归协调方派）· 禁洗红为 flake/env 偶发 · 禁洗段外红为段内候选。

---

**STOP：EXEC 完毕（STOP awaiting post-prove dual）**——判别 run 单 attempt 红 retained · 段外条款命中升级协调方 · post-prove 双审（mw-e2e-ha + mw-model-op）后归 meetwise 授权 nail。
