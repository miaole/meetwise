# G7P-1 — e2e runner 启动段探针刀（api 红真抛点定位·非判别 run）

**状态**：`exec_rev4:awaiting_post_prove_dual`（EXEC 席 mw-core 2026-10-08：探针脚本 `scripts/e2e-boot-probe.mjs` 落地〔sha256 `1629af6f75928496167c4ffa74401a1041ed4b532c8a730e6a42195bea50007e`·node --check 过〕·package.json 单 script `e2e:boot-probe` 接线·恰 2 run〔run-A 冷+run-B 热〕收据 `ai-docs/delivery/receipts/g7p-bootphase-probe/`——Ban self-approve：EXEC 席不裁闭环，判读结论附协调方） · 前态 `draft_rev4:awaiting_pre_exec_dual`（rev3 席2 三处方：形状 2-11 行对齐+三向补 EXIT 1-2/8 分支与先例序+n=1/臂边界+tsx 装载盲区+最末行交叉核规则+等价细节钉死——rev2 残留：§3 分支 1 区间联动 8 段编号〔EXIT 3-7·fail/timeout 均计〕——rev2 三处方落实：段序对齐真实链〔api+worker 并发 spawn+login-401 DB 门+3s sleep+exitCode 检查〕·段 5 实名 /readyz/api·EXIT=9 崩溃专属码+行文法钉死） · base = 主线 `a9f55133` · 分支 `line/g7-bootphase-probe` · 立项依据 = E2EFAIL-1 判别 run branch 3（api 红 23.3s·0 行·双计 0=史上最早死亡面）+ 席2 时序分析（prove 窗 ~5-8s vs runner 启动链 ≳8-12s ⇒ 红点很可能在启动段）+ 席2 建议「boot-phase 探针 run 或 code 截获面」——协调方裁**探针 run 方案**（不动 wrapper·零产品码·信息量最大）。

## 1. 背景与目标
历史 api 红族（G7S 38428/G7X 40363/G7U 40560/CMOP03-FIX 78798/G7Y 101906ms · **review ledger 2-11 行深跑红**〔席2 机器收据实证：G7S/G7X/G7U=2 行 capability skips · CMOP03-FIX=6 · G7Y=11〕）与 E2EFAIL-1 新形状（23330ms·0 行·双计 0）**不同族**；已修面（断言 supersession/断链 import）均非触发点。目标=区分红点在 (a) runner 启动段〔PG 冷启/api 进程退出/readyz 超时〕vs (b) 旅程早期段〔signup/resume/upload 前〕vs (c) 环境噪声〔Docker 重启后残留态〕——为 G7 修复刀定靶。

## 2. 手段（docs+脚本级探针·零产品码改动）
新增 `scripts/e2e-boot-probe.mjs`（探针脚本·不动 run-e2e wrapper）：
1. 按与 run-e2e-isolated.mjs 等价的容器/迁移流程起隔离环境【rev4·席2 等价细节钉死：PG-ready=consecutive 3 次成功（:2233-2247 防 initdb 竞态·GAP-PRIV-AUTHZ-PROVE-FLAKE 先例）·migrate 2-试恢复语义（:2250-2263）·post-migrate 再探——探针 PG-ready 语义不得弱于 consecutive=3】；
2. 分段采集启动链时序戳【rev2·席1 段序订正=对齐 run-e2e.mjs 真实链】：docker PG 起→migrate 完成→**api+worker 背靠背并发 spawn**（对齐 :119/:124——顺序启动会给 api 独占资源致冷启争用失真）→api `/livez` 首个 200（轮询 40×1s 同 :127-131）→**DB 门复刻**：POST /auth/login 期 401（对齐 :135 waitForApiDatabase :100-112——真实链 DB 门非 readyz）→**3s sleep**（对齐 :136）→**exitCode 检查**（:139-140 worker/api_exited_before_test）→worker `/livez`+单发 `/readyz/worker`（:141·worker 段只表里程碑不重排）→api `/readyz/api`（health.controller.ts:19 实名）→首个业务面请求（signup=POST /auth/signup）HTTP 状态与耗时；
3. 每段独立超时与 EXIT 码语义（段号=码：probe_pg_1/probe_migrate_2/probe_spawn_3〔api+worker 并发〕/probe_api_livez_4/probe_db_gate_5〔login-401〕/probe_exit_check_6〔3s sleep+exitCode+readyz/worker〕/probe_api_readyz_7/probe_first_signup_8）；**EXIT=9=脚本未捕获崩溃专属码**（与段 1 码解耦；无 PROBE_SEGMENT 行的 EXIT=1 亦=崩溃非段红——双保险预注册）；PROBE_SEGMENT 行文法钉死：`PROBE_SEGMENT segment=<id> status=<ok|fail|timeout> elapsed_ms=<n> ts=<ISO8601> [detail=...]`；
4. stdout 输出结构化 PROBE_SEGMENT 行（机器可收据·探针脚本 sha256 digest 自证入收据防 wrapper 漂移）。
- 跑恰 **2 次**（预注册：run-A 冷〔docker 刚起〕+ run-B 热〔紧随其后〕——区分冷热态）；非判别 run（不跑全旅程·不触模型调用面·Ban retry-to-green 不适用但禁重跑至绿同律）。

## 3. 预注册判读（三向）
- **启动段红**（**EXIT 3-7**〔probe_spawn_3..probe_api_readyz_7·status=fail 与 timeout 两状均计〕或 signup 前超时）⇒ 红因=runner/环境启动链 ⇒ G7 api 红修复刀定靶启动段（api_exited_before_test 类）；
- **环境面红**（EXIT 1/2=pg/migrate 快败·容器/环境面）⇒ 归环境处置非产品面；
- **signup 红**（EXIT 8=启动链健康·首业务面红）⇒ 旅程早期段（signup/auth 面）另探；
- **signup 绿**（EXIT 0 全段过）⇒ 启动链健康 ⇒ 红因在旅程段 ⇒ 归 G7X ①面延续（报告钟/断言之外的第三抛点）另探；
- **冷热分裂**（run-A 红run-B 绿或反之）⇒ **指向** infra-adjacent 候选（非坐实——**n=1/臂边界如实记收据**·与「启动链确定性冷启缺陷」同形不可分）⇒ 复跑窗策略调整候选。
**先例序**：红 run 的段 EXIT 为主判·冷热形态为噪声先验修饰（同时命中两向时主判优先）。**盲区注记**：探针不 spawn tsx——full.e2e.ts 装载段红（import 断链类）在探针呈 EXIT 0 绿→归「旅程段」·收据必须注记此边界。**判读机械规则**：以最末 PROBE_SEGMENT 行交叉核 EXIT（EXIT=1 无行=脚本崩非段红·EXIT=9 专属崩溃码同理）。
三向均如实入收据禁洗绿。

## 4. Ban
零产品码（apps/packages src 零改）· 零 wrapper 改动（run-e2e*.mjs 零改）· 探针脚本仅 scripts/ 新增 + package.json 单 script 接线 · pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）· est：0 live 模型调用（signup 探针若达=注册路径不走模型）· 0 Key · Key 只经进程 env name-only · 实现不自批 · alone≠dual。

## 5. 验收
探针恰 2 run 全收据（EXIT 原值+PROBE_SEGMENT 行+分段耗时表）· 三向判读结论 · 收据 `ai-docs/delivery/receipts/g7p-bootphase-probe/` · 探针脚本 node --check 过。

## 6. Non-claims
本刀 ≠ G7 修复 ≠ trio 任何面 ≠ api 红根因定谳（探针=定靶非修复）≠ g7SuiteGreen 翻转。
