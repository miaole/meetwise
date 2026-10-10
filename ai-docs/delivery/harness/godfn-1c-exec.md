# GODFN-1c — interview.service 拆解 EXEC 刀（按已 nail 设计执行）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已执行 · 收据 `receipts/godfn-decompose/1c/2026-10-08-exec-receipt.md` · api 16 键 EXIT=0 + stale-quiz-expiry base 同红零回归 + 新增 prove:begin-guard-merge 绿 + db-id-v7 绿；**trio 三键 env-blocked：执行环境零 live provider key（provider/live_provider_key_missing fail-fast·零用例执行·base 同环境同阻塞）——post-dual 前置=协调方持钥环境复跑** · 前态 draft_rev2:awaiting_pre_exec_dual）（rev1 双席 FAIL 三处方：prove 面照抄 §5.3 全量 16+trio〔原误引 §5.4 漏 uc025-nhp 五键等九键〕·dbid1 smoke 桩面保形+db-id-v7 入复跑·pins 补 r1Closed+收据路径归一+五值等数机检） · base = 主线 `16b40f0d` · 分支 `line/godfn-1c-interview-svc` · 蓝本 = **已 nail 设计** `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§5.3 1c 清单·roster 六守卫 :103/:118/:129/:156/:164/:178 零触碰）。

## 1. 范围（照设计 §5.3 1c 行）【rev2·双席 FAIL 处方落实】
拆解 apps/api/src/modules/interview/interview.service.ts（955 行·32 方法·begin() :193-356=164 行最大）——roster 六守卫（:103/:118/:129/:156/:164/:178）语义零弱化·**begin() 三守卫合并属本刀核心**（新增断言面：三错误码抛序等价+resume_quiz 查询 3→1 计数断言）·**保形委托面**：`packages/db/scripts/dbid1-api-guard-smoke.ts:23-39` Object.create(prototype) 直调 begin——begin 签名/this 语义零变·`prove:db-id-v7` 入复跑单（席2 处方）。
**prove 面（照抄设计 §5.3 全量·非 §5.4）**：api 16 键（neg:interview+uc025 六〔nhp-neg/bound/fault/fault-isolated/adv〕+uc018 二+uc011/uc019/uc004-fault+last-event-id+int-transcript-preview-submit-http+public-preview-write-gate+sse-slot）+ **e2e trio 三键**（e2e:isolated/e2e:ui:isolated/verify:e2e-performance）；worker 四 consumer+payment 键**删除**（属 1d 面·零证明力——worker interview-service 系独立模块不 import api InterviewService·席2 亲证）——est 核对：16+3=19 ≤25 ✓。
**机检实录条款（席2 处方）**：拆解前后五值逐点等数对照——asPrincipal 27/guardInterviewPrivacy 23/denyPublicPreviewWrite 10/requirePublicPreviewControlledWrite 1/catch(:any) 5（advisory 锁 5/FOR UPDATE 3 附）。

## 2. 硬约束
①纯机械拆解语义等价（守卫/事务边界/RLS 上下文零变更）；②prove 十+键全绿（attempts 全账非 retry-to-green）；③零迁移/零 SSOT/零 G7 面；④pins 十值逐字照抄设计 §4 全表（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · **r1Closed=false**）+脚注行 actualSpendCny=null；⑤作者 mw-core@meetwise.local；⑥不自批 alone≠dual；⑦est：prove 本地+触面 live ≤25/run；⑧Key name-only。

## 3. 验收
diff 面清单+prove 全键 EXIT=0 收据+attempts 台账+收据 `ai-docs/delivery/receipts/godfn-decompose/1c/`（归一蓝本 §5 钉位·含 blob 演进对照 d43a569c→新）·push 后 STOP awaiting_post_prove_dual。
