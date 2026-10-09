# AC-FIX adaptive-consumer 夹具供给修复刀 — EXEC 收据 · prove#1 红 · 遇雷 STOP

- 席位：mw-core（EXEC）· 蓝本 = AC-1 调查刀定谳（@f4c2a9f9 收据）+ 席1/席2 post-dual BOTH PASS 一致建议（A 路线：夹具供给真 route snapshot）· 协调方正式授权
- worktree `/Users/miaole/Desktop/golucky/meetwise-line-ac1` · 分支 `line/adaptive-consumer-diag` · base = 03439f67（AC-1 nail）
- 改动面：**仅 `apps/worker/test/adaptive-consumer.proof.ts` 夹具段**（apps/packages src 零 diff · runner 零 diff · 排空环语义原样）· `fixture.diff` 全量 22 行（+21/−1）三段：
  1. import 追加 `supplyCandidateProfileRoute`（@meetwise/db 出面，packages/db/src/index.ts:404 既有导出）；
  2. `ROUTE_SNAPSHOT_SUPPLY` 段（FENCE_RACE 插行后、RESERVATION_SETUP 前，生产 begin「供给先于扣额/入队」同位序）：`asPrincipal(pool, OWNER, (c) => supplyCandidateProfileRoute(c, OWNER, IID, up.resumeId))` —— **生产同链**（0142 供给面原函数，非伪造行）：内部 requireOwnerUserId → resume ingested 校验 → owner-scoped `decryptResumeBlob`（原文仅内存）→ `classifyCandidateProfileByRule` → 落 `candidate_profile_route_decision`（route_outcome='route_decided' · attempt_outcome='rule_decided'）+ `candidate_profile_route_snapshot`（FK 序 decision→snapshot · owner/principal 对齐 = OWNER ≡ app.principal_user · asPrincipal SET LOCAL ROLE app_role + RLS owner policy 行使）。沿 neg-interview 先例 FK 序；**Ban 面遵守**：零伪造 0104 job 维度行（job_route_decision/application_route_binding 零触碰——0142 头注明文 Ban masking，授权文中该二表名按 0142 生产同源面实义落为 candidate 面结构）；**非 legacy opt-out**（MEETWISE_TECH_ROLE_FAIL_CLOSED 全程未设，门 ON 态被生产等价行使）；fixture 简历（Redis/限流/分布式锁）经 `classifyCandidateProfileByRule`（packages/domain/src/candidate-profile-route.ts:95-105）恰命中 `backend/general` 唯一叶（ASCII 词界 `redis` + CJK `限流`/`分布式锁`，无第二叶、无歧义）；
  3. 排空环 `!q` 卫语句（授权 ③）：查无 issued 题 → stderr 诊断（start job status/last_error，镜像 :114-117 先例）+ `A('排空环第N轮查无 issued 题…诚实 FAIL 而非 TypeError', false)` + break——claim→evaluate→complete 排空语义零弱化，仅溃点卫生。
- harness lifecycle：`exec:awaiting_post_prove_dual` · **prove#1 红 → 遇雷 STOP** · Ban self-approve · alone≠dual

---

## 1. THE prove（恰 1 次证明体调用 · runner 隔离面）

- 命令：root 包裹器 `pnpm adaptive-consumer:prove`（≡ `node scripts/run-e2e-isolated.mjs adaptive-consumer:prove:raw`，授权字面 runner 隔离面）· 2026-10-09T04:36:29.315Z → 04:36:37.534Z（8219ms，child）· docker pgvector:pg16 disposable 容器 `meetwise-e2e-90621-1791520589313`（--rm 自拆零 stray；现存 `meetwise-e2e-godfn1c-35997` 系 11h 前他刀遗留，本刀未触碰）· migrate **152 applied / 0 skipped**。
- 终态：**EXIT=1 · pass_count=31 · fail_count=2 · failure_class=child_exit_nonzero** · runner receipt `.tmp/isolated-proof-receipts/2026-10-09T04-36-37-534Z-90621-f6cd817b-409b-4c70-ada6-ae3782618df0.json`（副本入本目录）。
- **summary 无 `stage=/code=` 后缀**（runRedactedProof :2210-2212 `ADAPTIVE_CONSUMER_STAGE` 正则未命中）→ proof **未走 main-catch banner**：全程零崩溃，exit 1 系 fail 计数器，main() 跑至最后断言（:389 DUP 段）。

### 断言算术对账（33 = 30 固定 + 3 环内 claim）

夹具 A() 调用点静态计数 32 = 30 字面 + 2 模板（环内 claim `第N题…` + 卫语句 `排空环第N轮…`）。观测 33 断言 = 30 固定全执行 + **环内 claim 恰 3 次执行、卫语句 0 次触发**。由环退出条件（`done || guard≥8`）→ **interview completed（:142 done=true）· 排空环真走 claim→evaluate→complete ×3 轮**。

## 2. 蓝本命名目标逐项对账

| 蓝本目标 | 判 | 证据 |
|---|---|---|
| 4/4 child_exit_nonzero NORMAL_ANSWER_DRAIN 溃点（q undefined TypeError · CODE=UNKNOWN）消失 | ✅ **达成** | 无 stage banner（=UNKNOWN 崩溃面不存在）；33 断言算术排除卫语句触发；执行到达 :389 |
| 排空环真语义行使：claim→evaluate→complete | ✅ **达成** | 3 次 claim 断言执行 + done=true 收尾 + :140-:149 段全达 |
| 夹具供给真 route snapshot · 门 ON 态生产等价行使 | ✅ **达成** | start 链过角色门产题 3 轮（AC-1 §3 #7 断环消除）；供给 A 断言执行且流程前进（若 undecided，start 必 fail → 无题 → 卫语句触发/断言数 ≠33）；非 opt-out（env 未设） |
| **prove EXIT=0** | ❌ **未达** | 残余 **2 断言级红**，见 §3 雷 |

## 3. 雷：2 残余红在授权证据面内结构性不可定位 → 逐修不可为 → STOP

- runner `runRedactedProof`（scripts/run-e2e-isolated.mjs:2191-2226）按设计**零断言明文持久化**（隐私铁律，stdout/stderr 仅内存计数）；`failed_check_ids` 仅 PPRIV/PRES 词表（本 proof 不用该命名）→ 空缺；receipt JSON 无断言名。**2 红是哪两条，在 runner 面不可知。**
- 静态定位到顶：31 PASS 中含全部流程必经断言（登录/fence/供给/start/首题/3×claim/完成/结算/报告/无卡/episode/v64 四卫/legacy 八卫/DUP 二卫），排除法无法把 2 红唯一收敛到具体断言——深段（v64 数据库卫、legacy v49/NULL 五段、episode、额度、报告）机制面均无本 run 独有变异签名。
- **基线缺口（根构）**：本 proof 自 3d88cb64（2026-09-04）后零更新；G-R4-3 默认翻 ON（72233a08，2026-09-23）以来一切已登记红 run（GODFN-1a `4/4 NORMAL_ANSWER_DRAIN UNKNOWN`、AC-1 同签名）都在 :132 崩溃——**:124 之后的 24 条深段断言在全部已登记 run 中不可达，无现行绿基线**。本 run 是翻 ON 后首次行使全程——2 红为**新暴露的未登记漂移**：假说主判 = 同 NEGCOMM-1 族夹具债（深段断言写于旧契约时代，其间 0049/0054 后续演进/R4 线/g7s 落地），产品回归未排除。
- **为何不盲修 + prove#2**：无证据指向的修复 = 猜测；「恰每 prove 一次禁重跑至绿」下，无诊断依据的 prove#2 属 retry-to-green 实质。授权面未含 AC-1 C-1 式 :raw 诊断面（该面在 AC-1 授权中以 Condition 显式给出，本刀授权文本无此条）——**定位手段本身超授权，即雷**。

## 4. 请求 post-prove dual 裁定（三路）

- **(a)** 授权 **:raw 诊断面**（AC-1 C-1 先例：runner 同配方自备隔离环境 + `pnpm -C apps/worker prove:adaptive-consumer` 双流可见直跑）恰 1 次定位 2 红 → 后续逐修刀各恰 1 次 prove 至绿；
- **(b)** 裁定本刀 scope 收口：蓝本命名目标（溃点消失 + 排空环真行使 + 供给门 ON 态诚实行使）已全达，EXIT=0 的 2 红另立调查/修复刀（深段基线缺口本就超出夹具供给蓝本射程）；
- **(c)** 其他裁定。

本刀未再消耗任何证明体调用；工作树状态 = prove#1 后原样（夹具改动 + 本收据），未回滚未隐藏。

## 5. pins 十一值（照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false + 脚注 **actualSpendCny=null**（est live=0：scriptedModelClient mock 面 · 零外发 · MODEL_API_KEY/DASHSCOPE env 计数=0 · Key name-only · 零 .env 写）

## 6. Non-claims

本收据 ≠ EXIT=0 达成 ≠ 2 红根因定谳（定位证据不存在，仅假说）≠ 深段契约裁定 ≠ g7SuiteGreen 翻转 ≠ adaptive 面全部。供给面「生效」判据 = 流程前进的间接证据 + 断言算术，非 supply 返回值直读（该断言行被 wrapper withhold）。attempts 全账见 `attempts.md`。
