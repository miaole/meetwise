# G7P-3 — consent 端点定靶刀（G7 api 红精确 HTTP code 截获）

**状态**：`draft:awaiting_pre_exec_dual` · base = 主线 `94650e43` · 分支 `line/g7-consent-probe` · 立项依据 = G7P-2 nail 裁定（向 3 定靶 consent 面·T3 后 13ms fail-closed·「间歇性/状态依赖」注记·码面侦察无确定性红因〔consent 链显式 v4 id 不吃 uuidv7 雷·幂等 SELECT 跳过〕——需 withhold 契约内拿精确 code）。

## 1. 目标
拿 POST /privacy/consent 的精确 HTTP status+response body+耗时——切分红因：5xx（服务端 DB/RLS 面）/4xx（guard/body 面）/200（间歇不可复现→状态依赖假说增强→对比 full.e2e 上下文差异）。

## 2. 手段（探针脚本·零产品码·沿 G7P-1 模式）
新增 `scripts/e2e-consent-probe.mjs`：
1. 复刻 G7P-1 等价环境（容器/迁移 consecutive=3/migrate 2-试/api spawn/livez/login-401 DB 门——worker 可不 spawn〔consent 面纯 api〕但为保真与真实链一致仍并发 spawn）；
2. 探针序列：signupOrLogin（e2e/helpers/auth.ts 同式）→ POST /privacy/consent（body 同 helpers/resume.ts:12-19）→ **打印精确 status+body+elapsed** → GET /privacy/consent 状态对照 → （若 4xx/5xx）复打一次（状态依赖探测）；
3. 恰 **2 run**（冷/热·沿 G7P-1）+每 run 探针序列恰一次；
4. PROBE_SEGMENT 行文法沿 G7P-1（segment/status/elapsed_ms/ts/detail）·EXIT 码=段号（probe_env_1/probe_signup_2/probe_consent_post_3/probe_conent_status_4/probe_repost_5）·EXIT=9 崩溃专属·最末行交叉核 EXIT。

## 3. 预注册判读（四向）
- **5xx**：服务端炸（DB/RLS/迁移面）⇒ 根因候选=DB 层（对照 0150/0151 后主线环境）⇒ 修复刀定靶 api/DB；
- **4xx**：guard/body/purpose 校验面 ⇒ API 契约面修复；
- **200 双 run**：探针环境不可复现 ⇒ 状态依赖/上下文差（full.e2e 的 email 生成策略/前置 signup 状态/api 冷热）⇒ 下一刀=full.e2e 内联 code 截获（driver 侧打印 consent response）；
- **间歇**（run-A 红 run-B 绿或反之）⇒ 状态依赖+冷热敏感 ⇒ 登记交协调方裁复跑窗。
四向如实禁洗绿禁重跑至绿。

## 4. Ban
零产品码（apps/packages src 零改）·零 wrapper 改·helpers 导入只读复用（e2e/helpers/auth.ts 的 BASE/fetch 形态·探针自实现不打扰）·Key 只经进程 env name-only·est 0 live（consent/signup 链零模型已实证）·pins 十值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null）·实现不自批·alone≠dual。

## 5. 验收
2 run 全收据（EXIT 原值+PROBE_SEGMENT+consent status/body/elapsed 三元组）·四向判读结论·探针脚本 sha256 自证·收据 `ai-docs/delivery/receipts/g7p3-consent-probe/`·node --check 过。

## 6. Non-claims
本刀 ≠ G7 修复 ≠ consent 面根因定谳（=code 截获定靶）≠ trio 面 ≠ g7SuiteGreen 翻转·探针环境与 full.e2e 上下文差如实记（200 结果的限定语）。
