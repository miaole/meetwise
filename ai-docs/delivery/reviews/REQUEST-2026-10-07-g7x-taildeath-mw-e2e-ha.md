# REQUEST — **G7X CMD1 api-face 尾段死亡根因调查刀**（GAP-G7K-API-REDS P1 独立刀 · 四臂预注册：H-T1 报告段 / H-T2 B-side/review / H-T3 资源顺序 / H-T4 harness 伪红 · ≠ 修复 ≠ 关行 ≠ trio 翻绿）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7x-taildeath-rootcause.md` · slice `g7x-taildeath-rootcause.slice.md`
**上游**: G7W 甄别刀 EXEC 收据 `a4e49b8a`（CMD1 EXIT=1 class=api 38013ms · 供给链清白 + 尾段 ~11-12s 静默后 uncaught throw 定位 + `job_application` 恒 0=死于 application face 之前 + `schema_validation_failed ×2` 表外登记）→ G7U nail `bbc361fa`（GAP-G7K-API-REDS P1 OPEN 预留 · `0c6c3287` 登记）→ **本 REQUEST（docs-only）→ pre-exec dual（mw-e2e-ha + mw-model-op）→ meetwise 授权 → 调查+判别实验（一次优先）→ post-prove dual → meetwise 授权 nail**
**Base tip**: `84bbef23`（`origin/feat/mysql-schema-skeleton` · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准 · EXEC 重钉须重新 fetch）
**Date**: 2026-10-07
**Line**: **G7X**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · Ban flip true） |
| `actualSpendCny` | **null**（retained） |
| Trio | **OPEN**（G7U 真测 **1/1/1** · 全 attempt 如实 retained） |
| CMD1 api 红面 | **OPEN**（G7W 定位在卷 · 本刀根因面） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · backlog `:107` 状态行不翻 · 本刀只产根因证据） |
| `schema_validation_failed` 致死性 | **OPEN**（**P2 另刀** · 本刀零触碰零归因） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 判别 run 合法性 / 预注册硬闭合 / withhold 边界 / 仪器边界）

Line G7X · **CMD1 api-face 尾段死亡根因调查刀**（G7W 定位现象 → 本刀查根因 · 根因调查=只读诊断 · Ban 修复 · Ban 关行）。请审：

1. **四臂预注册纪律（本审首责 · FLK/G7W 先例合规）**：H-T1（报告段/worker 重试链）/ H-T2（B-side/review 断言或等待超时）/ H-T3（第三 interview 创建前资源/顺序/锁池）/ H-T4（harness 尾段伪红）是否每臂有假设+判别读数+预期 EXIT+反例分支；**多臂并存 Ban 强行归一**（EXEC 收据按臂「命中/削弱/不可判」三值全落字含零命中臂）是否硬闭合；**Ban retry-to-green** 是否结构性关闭——判别 run 上限 ≤2（T-1 主判别 + T-2 仅预注册三分支触发：仪器窗口错失 / N5 瞬态细采样 / 判读表外值域经 meetwise 裁定），**T-1 红 EXIT 本身不是 T-2 触发条件**；红 EXIT 原值记账不冲销 G7U 真测 1/1/1 台账 · Ban flake 记法冲销 · Ban 只留绿 attempt。
2. **死亡窗码面定性忠实性**：harness §1.1 尾段区间（step 7 `:212-216` → 7a 第三 interview `:220/:223` → 7b → step 8 → step 9 `recruiter.ts:132`）与 G7W 在案读数（tick-24 completed 后零新行 · `job_application` 恒 0 · start 恒 2）的映射是否亲读成立（blob `7d65d0f3`/`c8e63f41`/`06d87f73`/`d06b4f49` @`84bbef23` 亲算）；「死亡窗 ∈ [step 7 前后， 7a POST 落库前]」的界线是否与 DB 读数一致不越界。
3. **仪器合法性（本审首责）**：G7W sidecar 机制复用（wrapper 零 diff · blob `13dbfc43` 前后全等机检强制 · 端口行 `:2310` · ok/error 逐查询纪律沿 C-HA-FF-3 · `client.on('error')` 兜底兑现 G7W OB-2）；**冻结投影白名单本体=G7W 9 查询族逐字承卷零改（禁碰本体）**——新增 N1-N5 读数是否全部在 harness §1.3-C 声明（独立附加槽位可审计区分 · 全 SELECT-only · Ban `interview_job.payload`/`ai_invocation_trace.output`/`interview_event.payload`/`pg_stat_activity.query` 内容列 · 零写语句）；N5 `pg_stat_activity` 系统视图读数的最小读面声明是否充分（Ban query/usename/application_name 列）；后端日志尾随 name-only 纪律（原文留 `.tmp/` 不入 git · Ban 子进程 stderr 回读——**读 DB 不读 stderr** · 断言原文/case 名回读裁定权归 meetwise）。
4. **T-2 分支与预期红契约**：「预期 EXIT=1 class=api（红 retained）≠ 判别失败——判别成功判据=快照捕获读数」双向契约；T-2 触发条件预登记义务（EXEC 收据落字后才跑 · Ban 事后择优）；仪器窗口错失反例分支（Ban 私自第三 run）。
5. **判读表边界**：单一读数不定谳（「与 X 一致」≠「X 已证」）；判读表未覆盖读数 → 如实回 meetwise Ban 就地 reinterpret；逐查询报错 ≠ 空读、仪器错误不得改判；时长形状判读（恒定 ~12s 尾窗 vs 随机）与在卷簇（37.9–40.6s）构成分解的合法性。
6. **边界完整性**：Ban 归因 `schema_validation_failed`（P2 另刀 · 读数现形只登记不归因）；Ban 归因 supply/route 面（G7W CLEAN 在卷 · 矛盾读数走显式证伪分支）；残红①（旅程自适应早停 ×2）/旧红③ `full.e2e.ts:202-204`（C-MO-P3 · blob `7d65d0f3` 零 diff）非本刀零触碰；`model-operation-registry.ts:63-71`（blob `63af556f`）已清面零触碰；sibling 归档零改写；SSOT/backlog 翻转 Ban（GAP-G7K-API-REDS `:107` 不翻 · **Ban 关任何行**——根因证据 ≠ 关闭）。
7. **预算与 Key 卫生**：T-1+T-2 各 ≤10 live 口径总 ≤20 ≪ 200（est-not-counter）· 超限即停如实记中止 · `actualSpendCny=null`；DB 直读用容器固定测试凭据（非模型 Key）；模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit · `.env*` ABSENT presence 逐 attempt 记录。
8. **七字段与四来源交叉一致**：CMD 原文/EXIT 原值/时间戳/实跑 code SHA/worktree+branch/环境探针/判读归类逐 attempt 全记录；`EXIT`/`E2E_FAILURE_CLASS`/machine receipt/快照 ndjson 四来源交叉一致才可引用；全部 attempt 全记录 Ban 删除覆盖。
9. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban 调查/判别实验执行 · Ban 实跑 · Ban live · Ban push/force-push · Ban 根因结论预claim · Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. CMD1 api 红面 OPEN（本刀根因面 · 调查非修复）。GAP-G7K-API-REDS P1 OPEN（不翻不关）。**根因调查=只读诊断 · Ban 修复另刀 · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / 调查执行 / 判别 run 实跑 / live / push；pre-exec dual PASS 后由 meetwise EXEC 授权（含 sidecar 周期/N5 采样 tick/T-2 分支定值）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · G7X 尾段死亡根因调查刀 · Line G7X · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
