# REQUEST — **G7X CMD1 api-face 尾段死亡根因调查刀**（GAP-G7K-API-REDS P1 独立刀 · 四臂预注册：H-T1 报告段 / H-T2 B-side/review / H-T3 资源顺序 / H-T4 harness 伪红 · ≠ 修复 ≠ 关行 ≠ trio 翻绿）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/g7x-taildeath-rootcause.md` · slice `g7x-taildeath-rootcause.slice.md`
**上游**: G7W 甄别刀 EXEC 收据 `a4e49b8a`（CMD1 EXIT=1 class=api 38013ms · 供给链清白 + 尾段 ~11-12s 静默后 uncaught throw 定位 + `job_application` 恒 0=死于 application face 之前 + `schema_validation_failed ×2` 表外登记 · G7W POST 双审在卷）→ G7U nail `bbc361fa`（GAP-G7K-API-REDS P1 OPEN 预留 · `0c6c3287` 登记）→ **本 REQUEST（docs-only）→ pre-exec dual（mw-e2e-ha + mw-model-op）→ meetwise 授权 → 调查+判别实验（一次优先）→ post-prove dual → meetwise 授权 nail**
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

## 请审什么（mw-model-op · 判读表忠实性 / 模型消费面 / 报告面状态机 / supply CLEAN 承卷边界 / P2 分界）

Line G7X · **CMD1 api-face 尾段死亡根因调查刀**（G7W 定位现象 → 本刀查根因 · 根因调查=只读诊断 · Ban 修复 · Ban 关行）。请审：

1. **四臂判读表忠实性（本审首责）**：H-T1（报告段/worker 重试链）/ H-T2（B-side/review 断言或等待超时）/ H-T3（第三 interview 创建前资源/顺序/锁池）/ H-T4（harness 尾段伪红）的机制候选与码面锚（`report-worker.ts:30/:49/:63-68` 舱壁 tx1/模型/tx2 + sweep 链 · `interview.service.ts:672` GET report 快读 · `full.e2e.ts:220/:223` 7a 同 resume-id）是否亲读成立；每臂判别读数+预期 EXIT+反例分支是否可证伪；**多臂并存 Ban 强行归一**（按臂三值全落字含零命中臂）是否硬闭合；「与 X 一致」≠「X 已证」措辞纪律（沿 G7R C-MO-2）。
2. **模型消费面读数（本审首责 · N2）**：`SELECT service, status, count(*), max(latency_ms), max(completed_at) FROM ai_model_invocation GROUP BY 1,2` 新增读数的合法性——service/latency_ms/completed_at 列锚（`0037:7` 亲读）· Ban output 列 · 非敏感聚合面；report 叙事 invocation 存在性/时刻/时延作为 H-T1 判别读数的忠实性；G7W 在卷读数（succeeded=5 + failed=2 恒定 · `ai_invocation_trace`=5=persistTrace 仅 !error 落）承卷是否如实。
3. **P2 分界（本审首责）**：**Ban 归因 `schema_validation_failed`**——该读数致死性已另立 P2 独立刀；本刀 N2 读数若现该 error_code 形状 → 只登记「P2 面读数」转 meetwise、零归因零定谳；H-T1c 子面（报告 invocation 层失败）与 P2 面（question-generation MALFORMED 吸收）的分界是否清晰不越界；与 G7W OB-3（`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset 口径差）的联合解释力不在本刀主张面。
4. **supply CLEAN 承卷边界**：Ban 归因 supply/route 面（G7W 在卷：6 job 全 done · attempts=1 · last_error 全 NULL · route 面未行使）——四臂零 supply/route 臂是否成立；读数若与 CLEAN 矛盾的显式证伪分支（如实记矛盾 + 回 meetwise · Ban 扫入基建 catch-all · Ban 就地 reinterpret 沿 F-F C-MO-P1）。
5. **报告面状态机判读**：`assessment_report`（N1 · status CHECK pending/ready/failed @`0001:336`）与 `interview_event`（N3 · kind 面 · Ban payload）作为 H-T1/H-T2 判别读数的忠实性；「report ready + report_ready 事件在 + invocation 早于窗起点 → H-T1 削弱」反例分支的对称性；H-T2「step 7 断言必炸状态组合」读法（终态 `report_ready` 而 report 行非 ready 矛盾组合）的码面依据（`full.e2e.ts:216` 亲读）。
6. **withhold 边界（与 mw-e2e-ha 共审）**：读 DB 不读 stderr——sidecar 与子进程 stdio 零接触；`run-e2e-isolated.mjs` 零 diff（blob `13dbfc43` 前后全等机检强制）；断言原文/case 名回读=契约变更裁定权归 meetwise；H-T4 判别不以 stderr 回读为判据（三面读数+时长形状承担）；**冻结投影白名单本体零触碰**（G7W 9 查询族逐字承卷 · N1-N5 独立附加槽位可审计区分）。
7. **预注册纪律（与 mw-e2e-ha 共审）**：Ban retry-to-green（判别 run ≤2 · T-2 仅预注册三分支 · T-1 红 EXIT 非触发条件）；红 EXIT 原值记账不冲销 G7U 真测 1/1/1；判读表未覆盖值域回 meetwise；逐查询 ok/error 纪律（报错 ≠ 空读 · 仪器错误不得改判）。
8. **边界完整性 / 预算 / Key 卫生**：GAP-G7K-API-REDS `:107` P1 OPEN 不翻不关（根因证据 ≠ 关闭 · 修复另刀）；残红①/旧红③/`:68-:71` 已清面（blob `63af556f`）零触碰；sibling 归档零改写；预算总 ≤20 ≪ 200 est-not-counter · `actualSpendCny=null`；模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only）· Ban `.env*` · Ban Key 值/fingerprint；docs-only 单 commit · Ban coding/Ban 实跑/Ban live/Ban push/Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. CMD1 api 红面 OPEN（本刀根因面 · 调查非修复）。GAP-G7K-API-REDS P1 OPEN（不翻不关）。`schema_validation_failed` 致死性 OPEN（P2 另刀 · 本刀零归因）。**根因调查=只读诊断 · Ban 修复另刀 · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / 调查执行 / 判别 run 实跑 / live / push；pre-exec dual PASS 后由 meetwise EXEC 授权（含 N2/N5 读数定值与 T-2 分支口径）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · G7X 尾段死亡根因调查刀 · Line G7X · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
