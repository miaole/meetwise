# SUMMARY — G7S EXEC · 通用 begin 供给面收口（DDL + 实现 + trio 复跑）· `executed:awaiting_post_prove_dual`

**Line**: G7S · **实跑 code SHA**: `fd569a606aa711e81ec9a1eb094c2370d9b160ee`（branch `line/g7s-snapshot-supply` · parent `91f1c751`=origin tip · REQUEST `77989c49` + PRE dual `d43787e0`/`83b90a3d` 全在祖先链）· **Date**: 2026-10-07/08 · **author**: mw-core · **禁 push**

## 0. 结果一览（诚实前置）

- **修复目标面（adaptive_role_route_missing 三红根因）确证消除**：全 trio + diag 全部 run 的 `interview_job.last_error` **零命中** `adaptive_role_route_missing`；通用 begin 面 202 保持；`candidate_profile_route_decision/_snapshot` 每 interview 恰一对落行；uc018 **双 project UI 全绿**（CMD2）；隔离 runner 下主驱动面试**完整完成**（start/answer jobs 全 done · interview completed ×1）。
- **trio 仍红（EXIT 1/1/1 如实）**：残留两类与 **G7S diff 零触碰面**的红——(a) iso/HTTP 面 `full.e2e.ts:203` 出处审查断言（最一致候选；✗ 原文被 withhold 契约扣留，diag-01 可见版指认）——澄清重发（server-issued identity 含 clarification_needed）vs 断言零澄清假设，live 模型行为面；(b) 红① recruiting-bound ×2——**C-MO-Q2 扩查定谳：`job_route_decision=route_unresolved/validation_rejected ×2`（classify 调用成功、输出被服务端双重校验拒）→ sticky 未决 → `interview_ineligible_route` fail-closed**——route 侧 classify 输出质量/校准问题，属 model-op/route 另刀。
- **`g7SuiteGreen=false` retained（零翻转）**· trio **OPEN** · Disclosure-1 **OPEN**（C-MO-Q3：供给面实际已修复——本 SUMMARY 即其证据卷——Disclosure 解除与否留协调方 nail 裁定）· Pins 原值全量 · `actualSpendCny=null`。
- **本 SUMMARY ≠ post-prove dual PASS ≠ trio 翻绿 ≠ 任何 Pin 翻转**；post-prove 双审由协调方另派（Ban 自批）。

## 1. 交付物（commit `fd569a60` · 7 files +366/−9）

| 面 | file | 内容 |
|---|---|---|
| DDL（additive-only） | `packages/db/migrations/0142_candidate_profile_route.sql` | 新结构 ×2：`candidate_profile_route_decision`（interview_id UNIQUE · sha256 digest CHECK · 叶语法 CHECK · 单值 route_outcome/attempt_outcome CHECK · bps=10000 CHECK）+ `candidate_profile_route_snapshot`（PK interview_id · FK→新 decision（域内真实行）· 单值 status CHECK）；REVOKE PUBLIC + GRANT SELECT/INSERT app_role + RLS ENABLE+FORCE + owner policy（镜像 0104 姿态）；**0104 既有表/约束零触碰零放宽**（实测：application_id/job_id 仍 NOT NULL · FK 仍在） |
| 域层（新产品决策语义） | `packages/domain/src/candidate-profile-route.ts`（新）+ `index.ts` 导出 | candidate-profile-derived **能力语义** rule 分类（与 job 面岗位**要求**语义刻意分离）：唯一叶才命中、0 次模型外发、冻结优先序（语言专精 > 通用后端栈）、≥2 语言叶=歧义未决；digest/decision_hash sha256 |
| DB 写/读侧 | `packages/db/src/candidate-route.ts`（新）+ `index.ts` 导出 | `supplyCandidateProfileRoute`（begin 事务内同步供给：幂等回读→owner-scoped 解密（reparse 先例）→rule 派生→落 decision+snapshot；未决返回 undecided）+ `getInterviewRouteSnapshotForAdaptiveRole`（角色门 fallback 读：**旧 recruiter snapshot 优先 → fallback 新表**；适配 view 如实登记 jobId='' · revision=1） |
| API | `apps/api/src/modules/interview/interview.service.ts` | `begin()` 供给步骤插于幂等门后、**先于 reserveEntitlement/enqueueInterviewJob**（C-MO-S4 事务序）；仅通用面（`application_id IS NULL`）供给；未决 → **409 `candidate_route_undecided`**（fail-closed 镜像，拒因前移非拒体消失）；同事务失败回滚零悬账 |
| Worker | `apps/worker/src/interview-consumer.ts` | 角色门供给读换 fallback reader；检索面（G-R2-5）维持旧表直读（candidate 面 retrieval 走既有 degradedRetrieval 语义，如实登记）；**死源 `:344` `roleFromJobRouteMetadata` 删除（非接线 · Ban 留死码）** |

## 2. trio 复跑（三 CMD 各恰好一次 · attempts 全记录）

| CMD | wiring | EXIT | 关键数 | 收据 |
|---|---|---|---|---|
| 1 `pnpm e2e:isolated` | `:278` @`0afb3bd2` | **1**（class=api · 0 summary · ✗ 文本 withheld） | applied=142 · reviewLedger 同形 | `01-cmd1-iso-attempt1.md` |
| 2 `pnpm e2e:ui:isolated` | `:279` | **1**（**12 passed / 2 failed / 10 skipped** · 2.0m） | **uc018 ×2 project 绿**；红① recruiting-bound ×2 红（30s 超时 · digest 1817280189） | `02-cmd2-ui-attempt1.md` |
| 3 `pnpm verify:e2e-performance` | `:282` | **1**（build ✓ → migrate ✓ → HTTP 面红 → 短路 not_run · 同形序） | start done ×2 + answer done ×4 · interview completed ×1 | `03-cmd3-perf-attempt1.md` |

 Key 全程进程环境（loader name-only · `envModelApiKey=set` · 配对值 `dashscope-cn-beijing`×`qwen-plus` 协调方既授权值）；`.env*` 五处逐 attempt 全 ABSENT；七字段逐 attempt 在卷；三来源（exit 文件 / machine receipt / 原始 log `.tmp/g7s-cmdN.log` 未入 git 如实披露）交叉一致。

## 3. diag-01（wrapper 外诊断 · 独立记账 · 非任何 CMD attempt）

同 tip wrapper-free 直跑 `e2e/full.e2e.ts`（可见输出）：signup→consent→upload→order/webhook→OCR skip→**uc018 全 PASS**→主驱动 begin 202→**2 题 question_ready + 4 turns（含澄清 ×2）**→ ✗ `full.e2e.ts:203` 出处审查（`identities=4 ≠ questions=2`）。log 副本 `.tmp/g7s-diag-01-e2e.log`（未入 git）。live 消耗：ai_model_invocation **9 行**（succeeded 6 / failed 3）+ trace 6。

## 4. C-MO-Q2 扩查定谳（红①归因 · 授权三查询 SELECT-only）

`job_route_decision` = **route_unresolved / validation_rejected ×2**（CMD2 fresh DB 累计）：classify **调用**成功（ledger `job.route-classify.v1` succeeded ×2）但**输出**未过 `validateModelRouteOutput` → sticky 终态永不自动重试 → 无 route_decided → binding 不落 → `recruiter.ts:410` `interview_ineligible_route`（fail-closed 如设计）→ start action throw → 30s 超时。`route_consumption_event` 0 行、`interview_route_snapshot` 0 行（recruiter 面零回归：行为与 G7K 基线同形）。**「begin 时序竞态」假说否定；F-F「classify succeeded ×2 vs 仍红」张力闭合（succeeded=调用非输出有效）**。红①属性=route 侧 classify 输出质量/校准（model-op/route 另刀），非本刀面。

## 5. 预算账本（≤200 硬闸 · 全程未触）

| run | live 观测 | 口径 |
|---|---|---|
| CMD1 | est ≤5（sidecar v1 仪器缺口如实登记） | est-not-counter |
| diag-01 | 9 行（6 ok/3 failed）+ trace 6 | 账本行 |
| CMD2 | 5 行 + trace 3 | 账本行（fresh DB 累计=全量） |
| CMD3 | 7 行 + trace 5 | 账本行 |
| **合计** | 观测 21 行 + est ≤5 ≈ **≤26 ≪ 200** | 超限即停未触发 |
| `actualSpendCny` | **null**（沿 I 线 · 无计价数据源 · Ban invented spend） | retained |

## 6. Conditions 逐条自评（executor 自评 · 非自批 PASS/FAIL verdict）

**C-HA-1（DDL additive-only）** ✅ 新 migration `0142` 独立新结构；等价 RLS/FORCE/owner policy/REVOKE-GRANT（实测 posture）；0104 既有 NOT NULL/FK/CHECK 零放宽（scratch 实测 `nullable=NO`×2 + FK count=1）；共享表零原位放宽；零伪造 binding/decision 行。
**C-HA-2（决定论）** ✅ 探针（真 domain 代码）：6 份 begin 用简历文本 → 全唯一叶 `backend/general`@10000（含 NEG：全栈=no_signal_hit · 双语言=ambiguous）；`candidate_profile_route ×2` per CMD 落行即决定论实证；uc018 双 project 202 保持、断言零触碰。
**C-HA-3（收据面）** ✅ recruiter 面零回归读数（§4 snapshot=0 行 + recruiter fail-closed 同形）；红①定谳仅用新增三查询读数（未用 F-F 四查询就地定谳）；行号以真实断言行落字（`:203`）；CMD1 ✗ 原文 withheld 如实登记非编造。
**C-HA-4（预算机械化）** ✅ per-run 账本行 + est 双轨（§5）；总包络 ≤26 ≪ 200；超限即停未触发。
**C-HA-5（边界保持）** ✅ 触碰面=双审裁决版 + 双审 post-裁决的 candidate-route 新模块（C-MO-S1「新产品语义立卷」的必然载体，如实申报）；blob 复核：`package.json=0afb3bd2`、`run-e2e-isolated.mjs=13dbfc43`（withhold 冻结）、`adaptive-role-resolve.ts` 零 diff（gate 零改动）。
**C-MO-S1（输入源定谳）** ✅ resume 派生（协调方落字）；独立 decision-kind + 独立 DDL 结构；**Ban 冒用 job 维度表全程守住**（grep 零写入）。
**C-MO-S2（additive-only）** ✅ 同 C-HA-1；新结构完整性形状 ≥0104 同类（sha256/叶语法/单值 status/bps=10000/UNIQUE interview_id/PK）；decision 引用指向真实新 decision 行（FK 域内 + 伪造行拒绝实测）。
**C-MO-S3（死源并案凭证）** ✅ `:344` 已删除（grep `interview-consumer.ts` 仅剩处置注释 1 笔）；`adaptive-role-resolve.ts` @EXEC tip 零改动（r1-tech-role-fail-closed.proof PASS 含其静态检查）；`MEETWISE_TECH_ROLE_FAIL_CLOSED` 默认 ON 读数未动（flag 文件零 diff）。
**C-MO-S4（事务序）** ✅ 供给先于扣额/入队（`begin()` 内码位）；未决 throw → 同 asPrincipal 事务回滚零悬账（402 场景实测：供给行随回滚消失，402 照返）；零吞供给失败的成功态回退。
**C-MO-S5（recruiter 零回归 + prove 契约）** ✅ `recruiter.ts:428` 唯一生产者链零 diff；trio 七字段/三来源/C-MO-Q2 三表白名单全量（SELECT-only · 零 payload/trace.output 列）。
**C-MO-Q1** ✅ 通用 begin 供给面=本刀第一承重面（双审随卷 + 本 EXEC 即其修复）。
**C-MO-Q2** ✅ 红①以新增三查询定谳（§4）；F-F 四查询未作定谳依据。
**C-MO-Q3** ✅ Disclosure-1 OPEN 保持（未翻转）；全程零 opt-out=0；本修复=真实产品供给修复（非换值）。

## 7. 残留与迭代建议（回协调方）

1. **红①**（recruiting-bound ×2）：route 侧 classify 输出质量/校准（`validation_rejected` sticky）——建议 model-op/route 侧另刀（classify 输出契约/模型校准面）；G7S 供给面与其零交集。
2. **iso/HTTP 面 :203 出处审查断言**（CMD1/CMD3 class=api 最一致候选）：澄清重发计入 server-issued identity（helper 语义）vs 断言 `identities===questions` 零澄清假设——e2e 断言语义 vs live 模型澄清行为面，属 e2e 断言语义另刀（**Ban 为绿改断言未动**）；建议该刀先以 wrapper 可见诊断复确 ✗ 落点。
3. **candidate 面 retrieval degrade**：`getInterviewRouteSnapshotForAdaptiveRole` 仅接角色门；检索面（qbank 读侧）维持旧表直读 → candidate 面 retrieval=degradedRetrieval（G-R2-5 既有语义，非缺陷）——如需 scoped retrieval 属后续产品刀。
4. **CMD1 sidecar v1 仪器缺口**：pnpm 管道缓冲致未采样（v2 已改 `docker ps` 发现）；CMD1 live 计数以 est 上界入账。
5. **迭代重跑**：按「各 CMD 恰好一次」本轮未重跑任何 CMD；后续迭代须协调方新授权（Ban retry-to-green）。

## 8. Non-claims

Not pass · not trio green · not suite green · **not `g7SuiteGreen=true`**（retained false）· not covered · not releaseEvidence=true · not HA · not nail · not backlog/P1 翻转 · not R1/Disclosure-1 closed（Disclosure-1 OPEN 保持）· not red① fixed（route 侧另刀）· not :203 semantic fixed（e2e 断言侧另刀）· not prove 重跑授权 · `actualSpendCny=null` · alone ≠ dual · post-prove 双审由协调方另派，**Ban 自批** · 禁 push
