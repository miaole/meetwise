# AC-FIX adaptive-consumer 夹具供给修复刀 — EXEC 收据 · 终态全绿 EXIT=0

- 席位：mw-core（EXEC）· 蓝本 = AC-1 定谳（@f4c2a9f9）A 路线 + 协调方两次授权（初授权 → prove#1 红遇雷 STOP → 裁决 (a)(b) 混合行动树：:raw 诊断恰 1 次 → 分叉①续修 prove ≤2）
- worktree `/Users/miaole/Desktop/golucky/meetwise-line-ac1` · 分支 `line/adaptive-consumer-diag` · base = 03439f67（prove#1 后中间态 ceb43343 已在账）
- 改动面：**仅 `apps/worker/test/adaptive-consumer.proof.ts`**（apps/packages src 零 diff · runner 零 diff · 排空环语义原样 · 断言 :123/:124 字节零改零弱化）
- **终态：prove#2 EXIT=0 · pass_count=33 · fail_count=0 · failure_class=none**（runner 隔离面 `pnpm adaptive-consumer:prove`，2026-10-09T05:19:54Z，pg16 disposable 自拆零 stray，migrate 152/0）
- harness lifecycle：`exec:awaiting_post_prove_dual` · 本收据后 STOP · Ban self-approve · alone≠dual

---

## 1. 行动树回放（预算全账）

| 步 | 性质 | 命令/面 | 证明体? | 结果 |
|---|---|---|---|---|
| prove#1 | 初授权 THE prove（裁决前） | runner 隔离面 | 是 | EXIT=1 · 31/2 · child_exit_nonzero · 蓝本命名目标（溃点消失·排空环真走）已达 · 遇雷 STOP（已账 ceb43343） |
| 预备×2 | :raw 环境自备（非证明体） | docker+双探+迁移 | 否 | 首备探针 cwd 缺陷零进入即弃；重备成功（容器 meetwise-e2e-acfixdiag-93276-* · 152/0） |
| diag | **:raw 诊断恰 1 次**（裁决第一步·不计红绿账） | runner 同配方自备 + `pnpm -C apps/worker prove:adaptive-consumer` 双流直跑 | 诊断体 | EXIT=1 · 31/2 复现 · **两红断言精确落位**：`低置信 RAG…走有界 deepResearch`(:123) + `深检索正文以不可信信封…`(:124)——`raw-stdout.raw` |
| 定位 | 零消耗静态+纯函数演算 | 码面链路 + 真 langgraph 离线 sim（scratch 已删·输出留档 `mind-sim-final.txt`） | 否 | 根因闭环（§2）+ 修复设计三分支预验证（§3） |
| **prove#2** | 分叉①收口 prove（预算 ≤2 之第 1 次） | runner 隔离面 | 是 | **EXIT=0 · 33/33 全绿** |

证明体调用总计 3（prove#1 / diag / prove#2）· prove 红绿账调用总计 2（红 1 → 绿 1，逐修非 retry）· est live=0（scripted mock 面 · MODEL_API_KEY/DASHSCOPE env 计数 0 · Key name-only · 零 .env 写）

## 2. 根因定谳（:raw 诊断 + 码面逐环 + 离线 sim 互证）

两红同根，双因子叠加，均**夹具债**（NEGCOMM-1 同族）——产品侧零修复指示：

- **因子 A（供给缺失·根因环）**：G-R2-5 检索 scope 门（interview-consumer.ts :252-283）`routeSnapForRetrieve = getInterviewRouteSnapshot` **直读旧表 `interview_route_snapshot`**（0104 招聘流程链；g7s 明文：candidate 面快照只喂角色门 fallback 读，检索面维持旧表直读）。夹具建面方式=裸 SQL 插 interview、零 0104 链 → `decideRouteSnapshotRetrieve` → `{allowed:false, reason:'route_snapshot_missing'}` → 夹具 fake localRetrieve **从未被行使**（被 `degradedRetrieval('route_snapshot_missing')` 包裹）→ CRAG `gradeRetrieval` 判 `deny_external('local_retrieval_degraded:…')` → `explore` 零调用（deepCalls=0·shallowCalls=0）；`nativeRetrievalFailureToken` 不匹配 degraded 串 → 生成以空素材继续（scripted ask 出题）→ :123 红（0≠1）+ :124 红（rag 无信封）。sim DENIED 分支逐位复现实跑（3 asks · turns 0/1/2 · deny_external ×2 · deep=0）。
- **因子 B（场景字面量漂移·同族伴生）**：夹具 planner 脚本 `competencies:['并发','缓存']` 早于现行 kind 动力学成形——`planCompetencies → toCompetencySpecs` 确定性附加行为槽，score 88（hasHook=false，EvalSchema default）首证即 `conf 0.88 ≥ CONF_ENOUGH` 单轮结算 → **每个 core 能力恰一次 fundamental**。dual-core → 2 次 fundamental → 仅修因子 A 仍 `deepCalls=2≠1`（sim ALLOWED-dual-core 分支实证）。`:123` 的 `===1` 界在现行确定性动力学下对双 core 场景不可达。
- 判别式：sim 三分支（DENIED-dual / ALLOWED-dual / ALLOWED-single）输出与 :raw 实跑、断言 fate 逐一互证（`mind-sim-final.txt`）；产品回归排除（G-R2-5 门按文档语义行使「缺行=检索拒绝，绝不误当空题库/不落 web」；mind 动力学=确定性纯函数，零产品崩溃零漂移）。

## 3. 修复（全夹具段·生产同链·零弱化）

1. **测试专用 HMAC key**（沿 adaptive-lifecycle.proof.ts:11 先例）：`RAG_JOB_ROUTE_INPUT_HASH_KEY ??= '…not-production-01'`——runner 隔离面按设计剥除生产 key，createJob 生产链需同形 key 落 0104 语义修订行。
2. **0104 招聘流程链供给（生产写手全链）**：`createJob(recruiter) → classifyJobRoute(rule 零模型,'Node.js 服务端工程师'→backend/nodejs 唯一叶·沿 lifecycle 先例题形) → bindApplicationRoute(apply 面·candidate 自插 RLS) → snapshotInterviewRoute(候选 owner)`——`interview_route_snapshot` 行使检索 scope 门放行。**Ban 面如实登记**：授权初文所列 `job_route_decision(route_outcome='route_decided')+application_route_binding` 即此链的真实生产写手落点（非伪造行·全为 production writer 产物）；0142 candidate 面供给（第一刀已落）保留=通用 begin 面生产语义+角色门 fallback 读行使，二面并存=夹具场景的如实构成。
3. **planner 脚本 `['并发','缓存'] → ['并发']`**（夹具字面量债·零断言改动）：单 core 场景下恰 1 次 fundamental（深检索 + 行为槽 2 asks），`:123 ===1` 界在新场景下**逐字节保留原断言强度**（有界=恰一次·零浅层·信封完整）。sim ALLOWED-single 分支预验证 deep=1/shallow=0/信封 ✓ → prove#2 实证全绿。
4. （第一刀已落）:132 溃点卫生卫语句 + 0142 candidate 面供给——prove#2 下卫语句零触发（33=30 固定+2 环内 claim+1 供给断言对账）。

## 4. 终态 33 断言（prove#2 全 PASS）

runtime login · 0142 供给 · 双 worker fence ×2 · **0104 链供给** · start→自适应路径 · 零解密门 · question_ready · **低置信 RAG 走有界 deepResearch（:123 绿）** · **深检索信封入 prompt（:124 绿）** · 2×题 claim · answer_evaluated≥2 · 画像 hook ≥1 · 收尾 completed · 额度精确 −1.0 · 报告舱壁 queued · 无卡 job · 跨会话 episode ≥2 · v64 四卫 · legacy 六段零副作用+配对释放 · DUP 幂等双卫。

## 5. pins 十一值（照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false + 脚注 **actualSpendCny=null**（est live=0：mock 模型面零外发 · free-tier wiring 口径无计价数据源，Ban invented spend）

## 6. Non-claims

本绿 ≠ g7SuiteGreen 翻转 ≠ R4 closed ≠ HA ≠ 产品语义变更（门与检索拒绝语义零触碰·全为夹具供给）≠ 其他 proof 键转绿 ≠ candidate 面检索语义裁定（g7s 既有文档语义照旧）。attempt 全账见 `attempts.md`；prove#1 中间态收据史存 git ceb43343。
