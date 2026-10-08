# G7P-1 — e2e runner 启动段探针刀（api 红真抛点定位·非判别 run）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `a9f55133` · 分支 `line/g7-bootphase-probe` · 立项依据 = E2EFAIL-1 判别 run branch 3（api 红 23.3s·0 行·双计 0=史上最早死亡面）+ 席2 时序分析（prove 窗 ~5-8s vs runner 启动链 ≳8-12s ⇒ 红点很可能在启动段）+ 席2 建议「boot-phase 探针 run 或 code 截获面」——协调方裁**探针 run 方案**（不动 wrapper·零产品码·信息量最大）。

## 1. 背景与目标
历史 api 红族（G7S 38428/G7X 40363/G7U 40560/CMOP03-FIX 78798/G7Y 101906ms·均 4-11 行 review ledger 深跑红）与 E2EFAIL-1 新形状（23330ms·0 行·双计 0）**不同族**；已修面（断言 supersession/断链 import）均非触发点。目标=区分红点在 (a) runner 启动段〔PG 冷启/api 进程退出/readyz 超时〕vs (b) 旅程早期段〔signup/resume/upload 前〕vs (c) 环境噪声〔Docker 重启后残留态〕——为 G7 修复刀定靶。

## 2. 手段（docs+脚本级探针·零产品码改动）
新增 `scripts/e2e-boot-probe.mjs`（探针脚本·不动 run-e2e wrapper）：
1. 按与 run-e2e-isolated.mjs 等价的容器/迁移流程起隔离环境；
2. 分段采集启动链时序戳：docker PG 起→migrate 完成→api spawn→api /livez 首个 200（耗时）→api /readyz 200（耗时）→worker spawn→worker livez→首个业务面请求（signup）HTTP 状态与耗时；
3. 每段独立超时与 EXIT 码语义（段号=码：probe_pg_1/probe_migrate_2/probe_api_spawn_3/probe_api_livez_4/probe_api_readyz_5/probe_worker_6/probe_first_signup_7）；
4. stdout 输出结构化 PROBE_SEGMENT 行（机器可收据）。
- 跑恰 **2 次**（预注册：run-A 冷〔docker 刚起〕+ run-B 热〔紧随其后〕——区分冷热态）；非判别 run（不跑全旅程·不触模型调用面·Ban retry-to-green 不适用但禁重跑至绿同律）。

## 3. 预注册判读（三向）
- **启动段红**（EXIT 3-6 或 signup 前超时）⇒ 红因=runner/环境启动链 ⇒ G7 api 红修复刀定靶启动段（api_exited_before_test 类）；
- **signup 绿**（EXIT 0 全段过）⇒ 启动链健康 ⇒ 红因在旅程段 ⇒ 归 G7X ①面延续（报告钟/断言之外的第三抛点）另探；
- **冷热分裂**（run-A 红run-B 绿或反之）⇒ 环境噪声主导 ⇒ infra-adjacent 假说坐实 ⇒ 复跑窗策略调整。
三向均如实入收据禁洗绿。

## 4. Ban
零产品码（apps/packages src 零改）· 零 wrapper 改动（run-e2e*.mjs 零改）· 探针脚本仅 scripts/ 新增 + package.json 单 script 接线 · pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）· est：0 live 模型调用（signup 探针若达=注册路径不走模型）· 0 Key · Key 只经进程 env name-only · 实现不自批 · alone≠dual。

## 5. 验收
探针恰 2 run 全收据（EXIT 原值+PROBE_SEGMENT 行+分段耗时表）· 三向判读结论 · 收据 `ai-docs/delivery/receipts/g7p-bootphase-probe/` · 探针脚本 node --check 过。

## 6. Non-claims
本刀 ≠ G7 修复 ≠ trio 任何面 ≠ api 红根因定谳（探针=定靶非修复）≠ g7SuiteGreen 翻转。
