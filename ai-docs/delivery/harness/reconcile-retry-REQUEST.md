# RECONCILE-RETRY REQUEST — #10（5C 批）翻案刀·model_invocation unknown 悬挂面处置（修法裁决=(c) 仅可观测化·积压水位双 gauge+gateway 只读函数·零行为变更·reconcile-retry 战役·docs-only REQUEST 卷·起草落卷即停）

**Status**: **`stopped:exec_red_gate_baseline`**（EXEC 落卷·2026-10-15·门矩阵十绿一红承登：docs:check **PTP_FILE_LIMIT:2137>2136 红停**——红唯一根因=件① 迁移受管计面 +1（merge 点 HEAD 实测恰 2136=cap 绿）·cap 上抬权归协调方·沿 evkind `stopped:exec_red_gate_baseline`/tokstream/perfload-env-fix 先例 Status 不落 executed·沿承登记⛔就地自调 cap·翻面权归协调方 · est live=0 · Ban self-approve · alone≠dual · ⛔push）

**席位**：RECONCILE-RETRY 起草席（诊断+起草双责·协调方派·批表盘点席翻案 #10 真未闭立靶）。
**基线**：`feat/mysql-schema-skeleton` @ `109e3eb1`（fetch 后 origin tip 同指亲证·docs:check 2133≤cap 2136 本树亲跑 EXIT=0）· 分支 `line/reconcile-retry`（建前 `git branch --list "line/reconcile*"` 零命中·本起草席 `git worktree add ../meetwise-rcr -b line/reconcile-retry feat/mysql-schema-skeleton` 亲立·HEAD 落 `109e3eb1` 亲证）· 工作树 `meetwise-rcr`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/meta/index.md` → `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（形制范本·§0-§8/停止条件四类/Ban-pins 形制沿承）→ `ai-docs/delivery/harness/evkind-scorecard-fix-REQUEST.md`（最新 docs-only 邻卷·迁移占号/raw 直跑形/收据仓根先例）→ `ai-docs/delivery/ai-capability-review/issues-final.md`（AG-01/AG-02/AG-03/AG-06 关联 #10 语义簇·:13/:14/:15/:20）→ `ai-docs/delivery/harness/product-campaign-LEDGER.md`（:87 批表 5C 区「#10 unknown 结案」翻案靶行·只读）→ 涉事机制源 `apps/worker/src/model-invocation-reconcile.ts`/`packages/db/src/model-op/model-invocation.ts`/`packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql`/`packages/db/migrations/0033_ai_cost_governance.sql`/`packages/db/migrations/0056_model_invocation_reconcile.sql`/`packages/db/migrations/0057_model_invocation_cost_scope.sql`/`packages/db/src/jobs/gateway-dispatch.ts`。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①批表盘点席翻案（2026-10-14 派单 brief 在案·「#10（5C 批）真未闭——`apps/worker/src/model-invocation-reconcile.ts:5-7` 注释自证 never retries or releases·卡死的 model_invocation 行永不重试永不释放」）；②LEDGER `:87` 批表 5C 区「#10 unknown 结案」行（翻案靶·旧结案与盘点席证据冲突）；③issues-final AG-01/AG-02/AG-03/AG-06 四簇（`:13`/:14/:15/:20·关联总表 #10）；④协调方派单 brief（2026-10-14·RECONCILE-RETRY 战役·修法三择一裁决授权起草席·STOP=draft:awaiting_pre_exec_dual）；⑤结构范本=出处必读清单两卷。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`109e3eb1`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **14** 树实测（主仓+13 支线树）——无第二 reconcile-retry 同名树；`git branch --list "line/reconcile*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep reconcile-retry` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀产品触面=6 码面（新迁移 0203+`gateway-dispatch.ts`+`packages/db/src/index.ts`+`metrics.ts`+`model-invocation-reconcile.ts`+`model-invocation-reconcile.proof.ts`）。届时对各在飞分支执行 `git log -1 -- <文件>` 逐树逐件复核，任一分支顶对任一触面存在主线 `109e3eb1` 之后的新增提交→触停止条件「现场漂移」停手上报。
- 同名函数占用查：`rg -rn "gateway_model_invocation_backlog" packages apps` 本树**零命中**亲证=新函数名无撞面。
- **EXEC 立项日复测（merge `4fbb2e26` 树·2026-10-15）**：`git worktree list`=**15** 树（主仓+14 支线）·`git branch --list "line/reconcile*"` 恰 1 命中=本分支·harness 目录 reconcile-retry 恰 1=本卷。在飞交叠复核**执行记录**：在飞刀分支（cost-columns/ci-wiring3/dbhy1-p4-fix/obs-ledger/ops-hygiene/status-flip2/uc184-slot-order/receipt-archive2/batch1-residual 及已并 batchflip/batch-residual-plan/ci-red-clear/perfload-env-fix）对 5 触面逐树逐件 last-touch 全数 `git merge-base --is-ancestor` 判=**`109e3eb1` 祖先（零后基线触面）**；陈旧支线若干命中后基线触面均为旧基线未并所致非在飞刀（沿 evkind 复核先例）→「现场漂移」零触。merge 本身 `git merge-tree --write-tree` 预演 EXIT=0（tree `2f4b3c22`）·实测零冲突·`git diff --name-only 109e3eb1 HEAD` 9 文件（ci.yml/.gitleaks.toml/egress json/checklist/batch-residual-plan.md/ci-red-clear-REQUEST.md/LEDGER/本卷/provider-egress proof.mjs）**零触 7 产品触面**。落件后 `rg -l "gateway_model_invocation_backlog" packages apps ai-docs scripts` 恰 4 命中=本刀四件+本卷（零外来撞面）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`109e3eb1`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `apps/worker/src/model-invocation-reconcile.ts` | `119323b9`（132 行） | **`:5-7` 头注自证「This worker never retries or releases that request…so a later caller cannot send the same idempotency key again」（翻案靶自证面）·`:17-19` MIN_AGE 35s/MAX 1h/默认 120s·`:25` FINALIZATION_GRACE 30s·`:48-49` olderThan 须 >executionTimeout+grace 否则启动失败（误杀防护）·`:64-69` asPrincipal 单事务原子对冻结注释·`:74`/`:78` 终态化+冻结调用·`:92-125` tick（`:100` 枚举·`:101-105` enumeration_failed 臂=inc+rethrow 形·`:107-122` owner 循环·`:113-116` terminalized/frozen 计数·`:123` ownerFailures throw）·`:127-132` 30s cadence**（件④ 接线点=`:122` 循环末与 `:123` throw 之间） |
| `packages/db/src/model-op/model-invocation.ts` | `1d8acb7f`（230 行） | **`:4-6` 头注「a timeout is an auditable unknown rather than an invitation to send the same billable request again」·`:16` claim action 'unknown' 形·`:125-126` unknown 错误映射·`:150-159` AG-D 释放入注释（**pre-dispatch 限定**·known-not-sent 零外呼零费用·0130 expired-claimed 重领落点）·`:160-166` releaseRefusedModelInvocationClaim·`:199-205` markModelInvocationUnknown·`:214-230` reconcileStaleModelInvocations（窗口 35s..1h·limit 1..1000）** |
| `packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql` | `cbc07c09`（744 行） | **`:170-183` dispatching→succeeded/failed/unknown 守卫形·`:185` 兜底 RAISE `ai_model_invocation_state_transition_invalid`（unknown 无出边=终态结构性封死）·`:271-273` canonical 换键拒（`canonical_invocation_mismatch`）·`:424-443` claim 对终态行决策（`:436-439` unknown 行→action='unknown' 恒拒）·`:456-476` 过期租约重领（**仅 claimed 行**）·`:623-683` terminalize（`:672` completed_at 仅 succeeded/failed 置时·unknown 恒 NULL）·`:685-727` `ai_model_reconcile_stale_scoped`（`:705` status='dispatching'+dispatched_at 超窗谓词·`:708` FOR UPDATE SKIP LOCKED·`:711-713` permit 'dispatching'→'unknown'·`:715` error_code='model_terminalization_reconcile'·`:716` completed_at=NULL**） |
| `packages/db/migrations/0033_ai_cost_governance.sql` | `2cce4019`（211 行） | **`:51` 预留 status 五值 CHECK·`:107-108` 对既存预留重 reserve 决策映射（dispatching/unknown→'unknown' 恒拒新预留）·`:126-131` 预算闸（reserved+settled+新预留>limit→budget_exhausted）+reserved_micro_cny 递增·`:163-166` settle 回退 reserved·`:179-184` release（`:179` 注释=「派发后即使调用方自称失败…必须对账」政策句·仅 reserved 可释放+reserved_micro_cny 回退）·`:190-200` `ai_cost_mark_unknown`（**只翻预留 status·零预算月回退=持有即政策**）** |
| `packages/db/migrations/0057_model_invocation_cost_scope.sql` | `6f78d8d7`（80 行） | `:43-74` `ai_cost_mark_unknown_for_model_reconcile_scoped`（四参 scope 精确匹配·changed<>1 即 RAISE·对冻结原子性半）·`:62-67` 仅 status='dispatching' 可翻 unknown |
| `packages/db/migrations/0056_model_invocation_reconcile.sql` | `17ffb25a`（59 行） | **`:3-6` 头注「reconciliation may only freeze it as unknown, never replay or release it」（语义权威句）·`:40-56` `gateway_model_invocation_owners`（`:44` 窗口校验 22023 形·`:46-52` DISTINCT owner 查询——件① 同族同形范本）·`:58-59` REVOKE FROM PUBLIC,app_role+GRANT app_gateway_role** |
| `packages/ai-runtime/src/invoke.ts` | `44e137f6`（1204 行） | **`:788` claim failed/unknown→terminal deterministic_refusal（unknown 重发恒死）·`:943-946` 派发边界（markModelInvocationDispatched+markAiCostDispatched）·`:987` 传输异常→transient/unknown·`:1019-1021`/`:1068-1069` invoke 侧 unknown 打标两臂** |
| `apps/worker/test/model-invocation-reconcile.proof.ts` | `e8f2ccec`（466 行） | **`:1-6` 头注自证「proves that recovery freezes both the invocation and the billable reservation without a retry/release path」·`:60-75` dispatch() 种子形·`:72` ageInvocation（bootstrap 连接 dispatched_at 回拨 2 分钟）·`:105` assertIsolatedTestTarget·`:438-455` bootstrap-vs-app_role ACL 臂形+owner 失败传播臂**（件⑤ 只增臂基面·既有断言零改） |
| `packages/ai-runtime/src/metrics.ts` | `1e6284cb`（175 行） | **`:100-101` reconcile 双 counter 名·`:157-159` 基线预注册形（件③ 落点·gauge 预注册沿 jobsQueued 族注释 `:92-95`「gauge 是全局绝对值…告警侧 max()」）** |
| `apps/worker/src/main.ts` | `b47aba76`（840 行） | **`:711-715` 接线注释+`:715` runModelInvocationReconciler 循环·`:803` stop 注册（drain-loop readiness 挂钩）·`:398-423` refreshModelCostGauges（`:422` modelCostUnknownReservations per-scope gauge=成本侧已有·invoke 侧积压水位零 gauge=缺口对照）** |
| `packages/db/src/jobs/gateway-dispatch.ts` | `1d6ad3e7`（85 行） | **`:29-33` gatewayModelInvocationOwners（asGateway 形=件② 同构范本）·`:35-37` gatewayJobGauges+「Global operational gauges expose only aggregate counts」注释（件①② 政策沿承）** |
| `packages/db/migrations/0037_ai_model_invocation_durable_claim.sql` | `9916a37e`（41 行） | **`:32-33` 部分索引 `ix_ai_model_invocation_unknown ON ai_model_invocation(created_at) WHERE status IN ('dispatching','unknown')`——件① 两 COUNT 的承载索引（零新索引依据）** |

**EXEC 重 pin（merge `4fbb2e26` 树·2026-10-15 亲证）**：上表 12/12 **blob 恒等+行数恒等**（逐件 `git hash-object` 复算=`119323b9`/`1d8acb7f`/`cbc07c09`/`2cce4019`/`6f78d8d7`/`17ffb25a`/`44e137f6`/`e8f2ccec`/`1e6284cb`/`b47aba76`/`1d6ad3e7`/`9916a37e`）——merge diff 零触上表 12 件。**四条锚勘误（pre-exec 双审席1 P2+席2 P3 随 pin 落·均 blob 恒等仅行锚误·本席 sed/Read 逐条亲证）**：①proof.ts「`:60-75` dispatch() 种子形·`:72` ageInvocation」→dispatch() 种子形实 **`:43-60`**·ageInvocation 实 **`:67-79`**（`:72` 回拨行恒等）；②proof.ts「`:438-455` bootstrap-vs-app_role ACL 臂形+owner 失败传播臂」→owner 失败传播臂实 **`:431-453`**（A 断言=`:452-453`·`:438-455` 涵摘要 console.log 行）；③proof.ts 头注自证句尾「without a retry/release path」跨 **`:6-7`**（原锚 `:1-6` 截尾）；④metrics.ts「jobsQueued 族注释 `:92-95`」→gauge 语义注释实 **`:67-70`**（「gauge 是全局绝对值…告警侧用 max() 去重」=`:69`·jobsQueued 族常量=`:74-77`）。其余行锚全表逐条 sed 亲验恒等（0088 `:170-183`/`:185`/`:271-273`/`:436-439`/`:456-476`/`:672`/`:705-716`·0033 `:51`/`:107-108`/`:126-131`/`:163-166`/`:179-184`/`:190-200`·0057 `:43-74`·0056 `:40-59`·0037 `:32-33`·invoke.ts `:788`/`:943-946`/`:987`/`:1019-1021`/`:1068-1069`·main.ts `:398-423`/`:422`/`:711-715`/`:803`·gateway-dispatch.ts `:29-33`/`:35-37`·model-invocation.ts `:4-6`/`:16`/`:125-126`/`:150-166`/`:199-205`/`:214-230`·metrics.ts `:100-101`/`:157-159`·reconcile.ts 全锚 `:5-7`/`:17-19`/`:25`/`:48-49`/`:64-69`/`:74`/`:78`/`:92-125`（`:100`/`:101-105`/`:107-122`/`:113-116`/`:123`）·proof.ts `:105`）。

### 0.2 派单简报核实登记（结论零变·如实精化）

1. 简报「#10 真未闭——`:5-7` 注释自证 never retries or releases·卡死行永不重试永不释放」——**核实成立但机制描述精化**：悬挂 `dispatching` 行的**终态化（冻结）路径实存且机制完备**（§1.2·35s 起窗+误杀防护+SKIP LOCKED+原子对冻结+proof 承载）——「永不重试永不释放」的真身=①unknown 终态后同键重发被三层结构性封死（by-design·§1.3-a）②预算持有永不再动（§1.3-b）③**积压水位零观测**（§1.3-c）——③为真缺口。精化≠翻案方向推翻。
2. 简报「5C 批 #10 unknown 结案」——LEDGER `:87`「#10 unknown 结案」逐字亲证；盘点席翻案依据=注释自证面成立（§0.1 行 1 锚）。
3. 简报「迁移如需按链顶 202 顺延实测」——链顶实测 **202**·头 `0202_interview_event_kind_score_card_written.sql`（`ls packages/db/migrations | wc -l` 亲数）·本刀需恰 1 迁移占 **0203**（§0.3）。
4. 简报「配额占用/槽位泄漏」疑面——核实=**配额持有为真**（unknown 预留的 reserved_micro_cny 永不回退·`0033:190-200` 零预算月 UPDATE·该月 headroom 永久缩减至 period_key 滚动）；**槽位泄漏不成立**（dispatch slot 每 logical node 单行·终态化不增不减·非泄漏面如实登记）。

### 0.3 迁移号登记（预期恰 1 新迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql`（本树亲证）。
- 本刀占位号=**0203**（`0203_gateway_model_invocation_backlog.sql`）。协调规则：EXEC 立项日对届时主线链顶 `ls packages/db/migrations` 亲数+在飞分支题面复核后取最小未占号顺延（零硬编码·沿 evkind 0202/AG39 改占勘误先例）·Ban 抢号 Ban 私占·若届时 0203 已被占→按亲数取下一个最小未占号并全卷同步改锚（停止条件「现场漂移」零触·属认领规则内动作）。
- **EXEC 立项日复测（merge `4fbb2e26` 树·2026-10-15）**：`ls packages/db/migrations | wc -l`=**202**·头 `0202_interview_event_kind_score_card_written.sql` 恒等——merge 零新增迁移；在飞九分支（cost-columns/ci-wiring3/dbhy1-p4-fix/obs-ledger/ops-hygiene/status-flip2/uc184-slot-order/receipt-archive2/batch1-residual）迁移目录逐树 `git ls-tree` 实数=202·**0203 零占用**（cost-columns 后 EXEC 改 0204 为协调方对 cost-columns 刀的授权注记·与本刀零交涉面）→**占号成立**（协调方授权 EXEC·0203 归本刀）。落件后 migrate 链头实测 `0203_gateway_model_invocation_backlog.sql`（门 3）。

## §1 红事实（机制链·全部亲证 @`109e3eb1`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 model_invocation 行生命周期（谁写/谁终态）

```
claim（invoke.ts:773→ai_model_claim_invocation_scoped 0088:290+）   INSERT claimed+lease
  → 派发边界（invoke.ts:943-946→ai_model_transition_dispatched_scoped 0088:480+）claimed→dispatching（dispatched_at 冻结+slot 行+预留 pairing 校验 BINDING-001）
      → succeed/failed（completeModelInvocation model-invocation.ts:185→ai_model_terminalize_scoped 0088:623+）dispatching→succeeded|failed（completed_at 置时）
      → unknown（invoke 侧 markModelInvocationUnknown model-invocation.ts:199·invoke.ts:1019-1021/:1068-1069 传输 unknown 两臂）dispatching→unknown（completed_at=NULL）
      → 【无终态悬挂】DB 故障在派发后：行滞留 dispatching
          → reconcile（model-invocation-reconcile.ts:92-125 tick 30s→ai_model_reconcile_stale_scoped 0088:685-727）dispatching→unknown（completed_at=NULL·error_code='model_terminalization_reconcile'）+同事务预留冻结（0057:43-74）
pre-dispatch 拒绝支线：claimed→failed（failModelInvocationClaim）/claimed→claimed 可重领（AG-D releaseRefused·0179·**仅 known-not-sent 预派发族**）
```

- **终态权威形态**：unknown 行 `completed_at` 恒 NULL（`0088:672` CASE 仅 succeeded/failed 置时·reconcile `:716` 显式 NULL）→ 「status='unknown' AND completed_at IS NULL」=**未决账单歧义的永久集合**（无任何后续处置语义存在）。
- **读侧封锁**：claim 对 unknown 行恒返 action='unknown'（`0088:436-439`）→ invoke.ts:788 deterministic_refusal 终态——同键重发结构性不可能；对 dispatching 行返 'wait' 轮询至终态化。

### 1.2 reconcile 现行为（终态化路径实存且完备——简报精化的事实基面）

- **阈值与误杀防护**：起窗默认 120s·下限 35s·上限 1h（`:17-19`）；配置校验强制 olderThan > executionTimeoutMs+30s 结算宽限（`:48-49`·启动失败非静默）——合法在飞请求不可能被提前冻结。
- **并发与原子性**：`FOR UPDATE SKIP LOCKED`（`0088:708`）多副本协作；每 owner 单 principal 事务内成对冻结 invocation+cost 预留（`:64-69`·`:74`+`:78`·`0057:69-71` changed<>1 即 RAISE 回滚整事务）——无半终态化对。
- **失败语义**：枚举失败/owner 失败→计数+rethrow（`:101-105`/`:117-123`）→drain-loop consecutiveFailures→readiness 翻假（`main.ts:803`+drain-loop.ts:22「must not be ready」）——挂账不假健康。
- **proof 承载**：`pnpm model-invocation-reconcile:prove`（root package.json:227 runner 形 / :228 raw 直跑形→worker package.json:34）·proof e8f2ccec 466 行·冻结/幂等/并发/RLS 全臂绿态在卷。
- **结论**：简报所指「补 release 路径（悬挂超时行→终态化·写明超时阈值与误杀防护）」**现状已闭**——该路径即 reconcile 本体（§1-修法裁决 (a) 出局的事实依据）。

### 1.3 卡死形态与后果（「真未闭」的三层分解）

- **(a) 重发封死（by-design·非缺口）**：unknown 行 claim 恒拒（`0088:436-439`）+状态守卫 unknown 无出边（`0088:185` 兜底 RAISE·全迁移链无 unknown→X 迁移臂）+对 unknown 预留重 reserve 恒 decision='unknown'（`0033:107-108`）→invoke 预派发拒——三层独立结构封死同键重发。换新幂等键同 logical node 亦拒（`0088:271-273` canonical mismatch）。**传输层无定谳≠可安全重试**（`model-invocation.ts:4-6`+`0056:3-6` 语义权威句）——供应商可能已执行并计账，重发=双账单风险。
- **(b) 预算持有（by-design·非缺口）**：unknown 预留的 reserved_micro_cny 永不回退（`0033:190-200` mark_unknown 零预算月 UPDATE·对照 settle `:163-166`/release `:181` 均回退）→该月 headroom 永久缩减；政策依据=`:179`（可能已被执行的请求必须保守对账）。**该持有是会计政策非泄漏**——但持有总量当前不可观测（见 (c)）。
- **(c) 观测缺口（真缺口·本刀靶）**：unknown 终态集 write-only 积累（completed_at 恒 NULL·无任何 revisit 语义）而观测面只有**事件计数**（terminalized/枚举失败/owner 失败·`metrics.ts:100-101`）——**零积压水位 gauge**：①悬挂深度（超窗 dispatching 积压）零 gauge——reconcile 落后/瘫痪时水位不可见（readiness 仅在失败后翻假·不回答「积了多少」）；②歧义存量（unknown 未决集）零 gauge——成本侧有 per-scope unknownCount（`main.ts:422`）但 invoke 侧账本零 gauge·全局面零 gauge。运维无法答「多少账单歧义在库/对账是否跟得上」——#10 旧结案「unknown 机制已闭」与「机制可运营」之间的真残面。

### 1.4 修法三择一裁决：**采 (c) 仅可观测化（零行为变更）**

- **(a) 补 release 路径·出局（重做+半禁）**：悬挂终态化半=§1.2 已闭（重做冗余）；post-dispatch release 半（退预留/复活重发）与 (b) 同禁——`0033:179`+`0056:3-6`+`model-invocation.ts:4-6` 三处语义权威句明文封死。AG-D 释放路径（`0179`/`model-invocation.ts:150-166`）是 **pre-dispatch known-not-sent 限定**，不构成 post-dispatch 释放先例。
- **(b) 补安全重试·出局（Ban）**：§1.3-(a) 三层结构性禁+幂等键面=账单身份（BINDING-001 冻结绑定 `0088:524-555`+canonical node `0088:271-273`）——「安全重试」在传输无定谳前提下不存在；业务级重试（attempt 键/换题）归 AG-02/AG-03 域（issues-final `:14`/:15·#44/#229/#20）非 #10。
- **(c) 采·三理由**：①缺口真实（§1.3-(c)·水位不可见=机制不可运营）；②零行为变更（读-only COUNT+gauge·tick 判定/翻转/throw 语义逐字不变）；③先例族现成（`gateway_job_gauges`/`gatewayCostBudgetSnapshot` 聚合只读 gauge 族·`gateway-dispatch.ts:35-37` 政策句「expose only aggregate counts, never jobs, users, prompts, or payment details」+承载索引现成 `0037:32-33` 零新索引）。

## §1-修法（预期恰 5 码面+1 迁移+收据·零行为变更）

- **件①（迁移·全文规格钉定）**：新文件 `packages/db/migrations/0203_gateway_model_invocation_backlog.sql`（号沿 §0.3 认领规则）·`-- @migration-mode multi-statement`（0202 同 mode·migrate.ts:590-592 亲证解析）·**恰 3 语句**（CREATE FUNCTION+REVOKE+GRANT·`0056:40-59` 同族同形）·**Ban 表/列/索引/数据洗**（承载索引 `0037:32-33` 现成·两 COUNT 皆部分索引可服务）。函数体规格（EXEC 照抄·头注可微调·**Ban 改函数名/Ban 窗口边界漂移/Ban 加列**）：

```sql
-- 0203_gateway_model_invocation_backlog.sql — RECONCILE-RETRY · model_invocation 积压水位只读 gateway 函数
--
-- @migration-mode multi-statement
--
-- #10（5C 批）翻案刀观测半：unknown 未决集（completed_at 恒 NULL·0088:672/:716）write-only
-- 积累而积压水位零观测（裁决=(c) 仅可观测化·零行为变更）。聚合只读·零 owner/PII/原文
-- （gateway-dispatch.ts:35-37 政策沿承）。dispatching_aged=超窗悬挂深度（稳态 0·>0=对账落后）；
-- unknown_unresolved=未决账单歧义存量。两谓词皆 0037:32-33 部分索引可服务·零新索引。
-- 窗口校验同 gateway_model_invocation_owners（0056:44 22023 形逐字）。

CREATE OR REPLACE FUNCTION gateway_model_invocation_backlog(p_older_than_ms integer)
RETURNS TABLE(dispatching_aged bigint, unknown_unresolved bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_older_than_ms IS NULL OR p_older_than_ms < 35000 OR p_older_than_ms > 3600000 THEN
    RAISE EXCEPTION 'gateway_model_invocation_reconcile_window_invalid' USING ERRCODE='22023';
  END IF;
  RETURN QUERY
    SELECT
      (SELECT count(*)::bigint FROM public.ai_model_invocation AS i
       WHERE i.status='dispatching'
         AND i.dispatched_at < clock_timestamp() - make_interval(secs => p_older_than_ms::double precision / 1000.0)),
      (SELECT count(*)::bigint FROM public.ai_model_invocation AS u
       WHERE u.status='unknown' AND u.completed_at IS NULL);
END;
$$;

REVOKE ALL ON FUNCTION gateway_model_invocation_backlog(integer) FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_model_invocation_backlog(integer) TO app_gateway_role;
```

- **件②（db wrapper·恰 2 文件）**：`packages/db/src/jobs/gateway-dispatch.ts` 增（`:29-33` gatewayModelInvocationOwners 同构）：`export interface GatewayModelInvocationBacklog { dispatchingAged: number; unknownUnresolved: number }` + `gatewayModelInvocationBacklog(pool: DbPool, olderThanMs: number)`（asGateway 池形·`SELECT dispatching_aged,unknown_unresolved FROM gateway_model_invocation_backlog($1)`·Number 收敛缺省 0）；`packages/db/src/index.ts` 增同名 export（`:48` 行族同形）。
- **件③（metrics·恰 1 文件）**：`packages/ai-runtime/src/metrics.ts` METRIC 增两常量 `modelInvocationReconcileDispatchingAged: 'model_invocation_reconcile_dispatching_aged'` + `modelInvocationUnknownBacklog: 'model_invocation_unknown_backlog'`（`:100-101` 行族）+ 基线预注册 `setGauge(...,0)` 两行（`:157-159` 形·零 label 低基数纪律）。
- **件④（tick 接线·恰 1 文件·落点钉死）**：`apps/worker/src/model-invocation-reconcile.ts` `modelInvocationReconcileTick` 内·owner for 循环（`:107-122`）之后、`if (ownerFailures > 0) throw`（`:123`）**之前**插 backlog 读块：try 调 `gatewayModelInvocationBacklog(pool, config.olderThanMs)` → `getMetrics().setGauge(METRIC.modelInvocationReconcileDispatchingAged, backlog.dispatchingAged)` + `setGauge(METRIC.modelInvocationUnknownBacklog, backlog.unknownUnresolved)`；catch 臂**镜像 `:101-105` 枚举形**（inc modelInvocationReconcileInvocations `{ result: 'backlog_failed' }`+console.error 无 owner/key 载荷+`throw new Error('model_invocation_reconcile_backlog_failed')`）。落点在 ownerFailures throw 前=owner 失败时水位仍刷新（正悬挂最深时）。**零行为变更判据=除该块外 tick 函数零语句增删改**。
- **件⑤（proof 扩臂·恰 1 文件·既有断言零字节改）**：`apps/worker/test/model-invocation-reconcile.proof.ts` 尾段新增恰 7 臂（沿 `:60-75` dispatch()/`:72` ageInvocation 复用·`A()` 断言器不改）：①空基线臂=净 owner 双 0；②悬挂深度臂=dispatch+ageInvocation 不跑 tick→dispatching_aged=1 且 unknown_unresolved 不含该行；③窗口外不计臂=dispatch 不 age（dispatched_at=now）→不入 aged 计数；④unknown 存量臂=对该行跑 tick 翻 unknown 后→unknown_unresolved≥1 且 dispatching_aged 回 0；⑤窗口校验臂=gatewayModelInvocationBacklog(pool, 34999) 拒（22023 族）；⑥ACL 臂=asPrincipal 下 EXECUTE 该函数→permission denied（REVOKE 生效·沿 `:438-455` bootstrap-vs-app_role 形）；⑦gauge 接线臂=`setMetrics` 注入捕获实例→跑 tick→两 gauge 值与库态相符（置于最末·捕获实例不影响他臂）。
- **件⑥（收据）**：`receipts/reconcile-retry/00-exec.md`（**仓根 receipts/=非受管根·零 docs:check 增量**·沿 evkind 件⑥ 先例）七字段：门矩阵全表 EXIT 原值+改前改后 PASS 名单 diff+diff numstat+重 pin 全表+偏离清单+pins 零翻声明+改前名单摘录。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十一门·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **reconcile 面 proof 翻绿（raw 直跑形为主判据）**：`pnpm -C apps/worker prove:model-invocation-reconcile` EXIT=0（tsx 直跑隔离 PG·不经 watch 缓存）；**改前必做 run 恰一次**取基线 PASS 名单（不计 prove·沿 negbend rev2 必做条款）·改后 PASS 名单 diff=既有名单零弱化+恰 7 新臂全过（既有臂翻红或新臂数≠7 即停）；runner 形 `pnpm model-invocation-reconcile:prove` 作补充判据如实记（注册行零触·缓存歧义不作为绿依据）。
2. **邻面不回退**：①`node scripts/run-e2e-isolated.mjs interview:prove:raw` EXIT=0·**57 PASS 恒等**（对 evkind §9 基线·<57 或名单减员即停）；②`pnpm -C apps/api neg:all` EXIT=0 六段全绿（段序 auth→commerce→resume→interview→bend→input·届时实测分母如实记·主线口径 686/686+ade 判别臂 687 在飞·LEDGER:396 口径）·邻段 PASS 名单 diff=∅（diff 非空即停·如实登记归因）。
3. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链头实测=本刀认领号（预期 0203·届时链顶顺延如实记）。
4. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0（新函数零 UNIQUE/PK 接触·理论零扰动·红即停承登 Ban 自改基线）。
5. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=203 violations=0`（files 对届时链顶亲数·violations 恒 0）。
6. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
7. **lint 五值恰等**：`pnpm turbo lint` 12 任务全 0 errors·web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628** 五值恰等（perfload-env-fix nail 口径·届时实跑为准·任一超即停承登·Ban 顺手消偿）。
8. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**≤cap 2136（>2136 红停上报·cap 上抬权归协调方）**（基线 2133 本树亲跑·本卷 +1 预期 2134·收据仓根非受管根零增量）。
9. **markers 五类零命中**：本刀改动集（件①-⑤+本卷 .md）新增行五类标记词 grep 零命中（词族沿 i6-239 门口径·词面不复抄卷内防自指·命令与回执入收据）。
10. **diff 面机检**：`git diff --numstat <base>` **恰 7 tracked 路径**=件① .sql（A）+件② 两 .ts+件③ metrics.ts+件④ reconcile.ts+件⑤ proof.ts+本卷 .md（+收据目录 untracked 仓根非受管根口径）——多任何 tracked 路径即停（越界需要类）。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·est live=0（prove 全离线隔离 PG·零模型外呼）。

## §3 范围外（边界清单·越界即 FAIL）

1. **tick 行为面零触**：判定/翻转/阈值/throw/owner 循环/枚举臂语义逐字不变（`:17-25` 常量·`:42-57` 配置·`:100-105`/`:107-123` 主逻辑·除件④ backlog 块外零语句增删改）——零行为变更是裁决 (c) 的成立前提。
2. **重试/释放语义零触**：三层禁面（`0088:436-439`/`:185`/`:623-683`+`0033:107-108`/`:190-200`）与 AG-D pre-dispatch 释放面（`0179`/`model-invocation.ts:150-166`）零改——(b) 裁决否决沿承·Ban 借机实现任何重试/复活/预算释放。
3. **成本会计政策零触**：reserved_micro_cny 对 unknown 的持有政策（`0033:179`）零改——持有=政策·本刀只令其可观测。
4. **业务重试面零触**：attempt 键/换题/报告键（AG-02/AG-03·#44/#229/#20 域）零触——另 issue 另刀。
5. **run-e2e-isolated 注册行零触**（evkind §3-4 先例·prove 以 raw 直跑形为主判据规避缓存歧义）。
6. **共享 SSOT 零改**：LEDGER/checklist/backlog 只读引用——批表 5C 区「#10 unknown 结案」行翻面权归协调方（翻面名目建议随 EXEC/post 链由协调方裁·本卷不预设翻面措辞）。
7. **迁移恰 1 件**：Ban 第二迁移 Ban 顺手扩面——EXEC 期若发现需第二 DDL→停上报（越界需要类）。
8. **测试既有断言零触**：proof e8f2ccec 既有臂零字节改（只增臂·「为绿改断言」Ban 沿承）。

## §4 依赖

**①上游已满足**：reconcile 机制族（0056/0057/0088 在链）+部分索引（0037 在链）+gateway gauge 族（gateway_job_gauges 在链）=修法承载面全在树；盘点席翻案=红靶确认。**②无同文件并发**：产品触面=新文件 0203+五 .ts——§0.0 在飞交叠复核规则 EXEC 立项日必做。**③迁移号**：§0.3 占位 0203·认领规则在卷。**④下游**：批表 5C 区 #10 行翻面+gauge 告警 expr 归 observability 后继面（alerts-lint 白名单若纳新 gauge 名归协调方另裁·本刀 Ban 触告警配置）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（改前/改后 run 恰各一次·红不重跑冲销）；Ban 实现 post-dispatch 重试/释放/预算回退任何形（§3-2/§3-3·(b) 裁决否决沿承）；Ban 触 tick 行为面（§3-1）；Ban 触成本会计/AG-D 面/业务重试面（§3-3/§3-4）；Ban 触 run-e2e-isolated 注册行（§3-5）；Ban 改共享 SSOT（§3-6·LEDGER #10 行翻面权归协调方）；Ban 第二迁移/顺手扩面（§3-7）；Ban 改既有 proof 断言（§3-8）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（EXEC 期 prove 全离线隔离 PG·零模型外呼·§2-11 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词不复抄卷内防自匹配——沿 negbend/evkind 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 裁决 (c) 与 §5 Ban/pins 与 §1-修法件①-⑤ 施工面规格**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·迁移号按 §0.3 认领规则重核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（reconcile 阈值/守卫/禁面三锚语义变·proof 臂集重构·部分索引 `0037:32-33` 消失·链顶实测后 0203 已被占且认领规则不可达·§0.0 在飞分支对本刀触面有新增提交）→停·重 pin 回炉。
- **机制不满足**：件①-⑤ 落卷后改后 proof 既有臂任一翻红或 7 新臂任一不过或水位读数与库态不符（§1.3-(c) 推定形被证伪·如 unknown 行 completed_at 非 NULL 形）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法恰 6 件面（需触行为面/重试释放语义/成本会计/第二迁移/注册行/告警配置/SSOT）→停·另刀或协调方裁决（§1.4 (a)(b) 否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻套件新红/lint 五值任一超/docs:check>2136/drift 红/uniqueness violations>0）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（2026-10-15·EXEC 施工席落卷）

**授权链**：pre-exec 双审两外席 BOTH PASS（席1 agent_08ae74ed+席2 agent_8e7d4fd6 会签）→协调方 EXEC 授权（**EXEC·0203 归本刀**·cost-columns 后 EXEC 改 0204）→本席落卷·收据=`receipts/reconcile-retry/00-exec.md`（仓根非受管根·untracked 交付）。

**工序**：①`pnpm install --frozen-lockfile`（node_modules ABSENT→EXIT=0 13.1s·零 lockfile 变更先行）；②`git fetch`+`git merge --no-ff feat/mysql-schema-skeleton`@`0c06033d`→merge **`4fbb2e26`**（merge-tree 预演 EXIT=0 tree `2f4b3c22`·冲突解=∅ 零 union 手解·merge diff 9 tracked 文件零触 7 产品触面·⛔pull --rebase 未用）；③§0 全量重 pin（**12/12 blob 恒等+行数恒等**·四条锚勘误随 pin 落=§0.1 EXEC 重 pin 段）+席1 P2-1+席2 P2-A 共同处方随 pin 落=**件③ metrics.ts `:157-158` 基线枚举补 `'backlog_failed'`**；④件① 迁移 `0203_gateway_model_invocation_backlog.sql`（链顶复测 202·头 0202·在飞九分支链均 202·0203 零占用·占号成立·SQL 与 §1-修法规格 diff 逐字恒等·恰 3 语句 CREATE FUNCTION+REVOKE+GRANT·`@migration-mode multi-statement`）；⑤件② db wrapper（gateway-dispatch.ts asGateway 同构+interface）+`packages/db/src/index.ts` 同名 export 双行；⑥件③ metrics 双 gauge 常量+基线预注册 `setGauge(...,0)` 两行+枚举 `'backlog_failed'`；⑦件④ tick 接线（owner 循环末与 ownerFailures throw 之间·backlog 读块+catch 臂镜像 `:101-105` 枚举形 inc `backlog_failed`+console.error 无载荷+throw `model_invocation_reconcile_backlog_failed`·块外 tick 零语句增删改）；⑧件⑤ proof 恰 7 新臂（尾段纯增量·既有断言零字节改·新臂块首 fixture repair 修复既有 broken-pair 臂遗留雷行=新码内·不在既有臂）；⑨件⑥ 收据仓根。

**改前 run（恰一次·测量形）**：裸 `pnpm -C apps/worker prove:model-invocation-reconcile` 先试=boot 段 env 前置缺失（`database_target_missing`·未达测量面·如实登记）；测量经 `node scripts/run-e2e-isolated.mjs model-invocation-reconcile:prove:raw`=**17 PASS 全绿 EXIT=0**。改后 run **两次如实承登**：第一次=新臂④ tick 撞既有 broken-pair 臂故意遗留的 aged+cost-对已删雷行（freeze changed<>1→RAISE→owner_failed·run 中止·17 既有+新①②③ PASS）——一次性容器净态复刻同机制 `OWNER_OUTCOME {"invocations":1,"frozenCosts":1}` 成跑=件④机制零瑕·§1.3-(c) 推定形未被证伪（反被新①②③绿+复刻证实）→定性=件⑤ 新码 fixture 时序缺陷→修件⑤ 新码（新臂块首 fixture repair·既有字节零触）→第二次 **24 PASS 全绿 EXIT=0**（既有 17 名单逐字恒等零弱化+恰 7 新臂全过）。runner 形 `pnpm model-invocation-reconcile:prove`=同命令（root `:227`→`:raw` 注册形）如实记零重跑。

**门矩阵（十一门）**：门1 raw 直跑主判据 **24 PASS EXIT=0**（改后第二次）·门2 interview:prove:raw **57 PASS 恒等** EXIT=0+neg:all **687 PASS** 六段全绿 EXIT=0（685+ade 判别臂=在飞口径恒等）·门3 migrate:prove EXIT=0 链 **203 头 0203**（harness 收据 manifest `count=203 latest=0203_gateway_model_invocation_backlog.sql`+字节序 197 文件全等）·门4 drift:prove EXIT=0 零漂·门5 uniqueness **files=203 violations=0**（exemptions 0143/0152/0160 恒等）·门6 typecheck **8/8·0 cached** EXIT=0·门7 lint 12 任务 0 errors **五值恰等 web 601/root 5235/api 1421/worker 954/ai-runtime 628** EXIT=0（首跑 worker 955=本席新 import 两行 import/order +1→仅动自己新行归位→954 恰等·如实承登）·门9 markers 五类改动集新增行零命中·门10 diff 恰 7 tracked 路径+收据 untracked 非受管根·门11 卫生绿（install 复跑零 lockfile 改·.env* ABSENT 三查·actualSpendCny=null·est live=0）。**门8 docs:check 红停（唯一红）**：EXIT=1 **`public_text_policy:PTP_FILE_LIMIT:2137`>cap 2136**——merge 点 HEAD 受管文本实测 **2136=cap 恰等绿**·红唯一增量=件① 迁移 .sql 受管计面 +1（本卷 §0/§9 增行零增文件·收据仓根非受管零计面）·沿 perfload-env-fix `PTP_FILE_LIMIT:2132>2128` 协调方 sanction 先例形·cap 上抬权归协调方·Ban 就地自调·如实红停上报。

**STOP=`stopped:exec_red_gate_baseline`**（沿 evkind/tokstream 先例·门8 红承登·其余十门全绿·本刀产品件面自身零红·翻面权归协调方·cap sanction 处置后 post 双审续链）。

**偏离清单（五笔全数登记）**：①门8 docs:check 红承登上报；②改后 run 两次（第一次红=件⑤新码 fixture 缺陷·根因+复刻证据+修复全登记·非凑绿重跑冲销）；③lint 首跑 worker 955 承登后仅自修新行归位 954 恰等；④门2 neg 分母实测 687=在飞口径恒等（§2-2「届时实测分母如实记」条款内动作）；⑤裸跑 boot 段 env 前置缺失一次如实登记（未达测量面）。

est live=0 · markers=0 · pins 十一值零翻 · ⛔push。

---

*RECONCILE-RETRY REQUEST · 2026-10-14 起草 · 2026-10-15 EXEC 落卷（§9）· **`stopped:exec_red_gate_baseline`**（门8 docs:check `PTP_FILE_LIMIT:2137>2136` 红停承登=件① 迁移受管计面 +1·merge 点 HEAD 实测恰 2136=cap 绿·cap 上抬权归协调方·沿 perfload-env-fix 先例·其余十门全绿·翻面权归协调方）· base 并线 `feat/mysql-schema-skeleton` @`0c06033d`→merge `4fbb2e26`（零冲突·tree 预演 `2f4b3c22`）· 分支 `line/reconcile-retry` · 工作树 `meetwise-rcr` · 修法=件① 迁移 0203 gateway_model_invocation_backlog 只读双 COUNT（dispatching_aged/unknown_unresolved·0056 同族·0037 部分索引承载·零新索引·恰 3 语句）+件② db wrapper+件③ metrics 双 gauge+基线枚举 `'backlog_failed'`（席1 P2-1+席2 P2-A 处方）+件④ tick 接线（ownerFailures throw 前·backlog_failed 镜像枚举臂）+件⑤ proof 恰 7 新臂（既有断言零字节改）+件⑥ 收据仓根 · 改前 17 PASS→改后 24 PASS 全绿（两次承登见 §9）· 门矩阵=十绿一红（红=门8 计数预算非内容策略）· est live=0 · markers=0 · pins 十一值零翻 · 停止条件四类（「验收红不可修」命中承登）· Ban self-approve · alone≠dual · ⛔push*
