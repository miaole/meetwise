# Harness — **MOP03-B · MODEL-OP #102 域 cutover 独立审材料包**（REQUEST · docs-only · `draft:awaiting_pre_exec_dual` · Ban Redis cutover · Ban MODEL-OP closed · GAP-MOP-03 OPEN · PG LISTEN retained）

**Pins**（文首照抄 · 原值写死 · 本刀零翻转）: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs only · 材料包组装 · 零 coding · 零 prove 执行 · 零 live · 零 SSOT · Ban self-approve · alone ≠ dual · Ban nail until POST BOTH + meetwise AUTHORIZE）
**Date**: 2026-10-07（Asia/Shanghai）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`fe218b7a`** / full `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`（= fetch 后 origin tip · ≥ `fe218b7a` 达标 · MOP03 `:76` successor 立卷刀 nail 链已在祖先：checklist `:1132` · nail commit `e29d8f93` · worktree `/Users/miaole/Desktop/golucky/meetwise-line-mop03-cutover` · branch `line/mop03-cutover-review` · 兄弟刀 line/mop03-successor worktree（meetwise-line-mop03 @`47f17b83`）零触碰）（Base 行补记沿 `harness/g7-path-b-honesty-classification.md:9` 先例 · rev2 · e2e-ha PRE 处方）
**Wave**: Line **MOP03-B**（GAP-MOP-03 后继刀第二刀 · 前刀：AN-MOP-Q45 honesty nail `post_prove_dual_pass` + MOP03 `:76` successor 立卷刀六门合同）
**Experts**: `mw-model-op` + `mw-e2e-ha`（PRE dual 待开 · Ban self-approve · alone ≠ dual · Ban nail）
**Authority**: meetwise — 待授权（REQUEST → 预执行双审 → meetwise 授权 → 执行 → post 双审 → meetwise 授权 nail）
**Knife**: **MOP03-B · 「MODEL-OP #102 域 cutover」独立审材料包组装刀**（承卷证据清单 + 独立审判据 + 审后残留义务 · **本刀不切流 · 不翻转 `:76` · 不宣称 cutover 成立**）
**Gap id**: **`GAP-MOP-03`**（backlog `gap-bug-backlog.md:76` · P0 · **OPEN** · Ban flip CLOSED 本刀）

## 0. 承卷事实（勿重做 · 只读 cite · 零重跑）

前刀 AN-MOP-Q45 honesty nail **`post_prove_dual_pass`** 已落，以下为承卷事实，本刀**不重做、不重跑、不重写、不洗**：

- 双 reconciler worker wiring 已落码（锚见 §2-B）· Q4/Q5 prove **同列 EXIT 0/0** @ CODE_SHA `66a77ed` / `66a77eda3b405bbf3aef636d727b8e3564c46ffb`（PROVE_SHA `a1f3614` · POST dual `67050c0`+`a41c575`）。
- **Redis unset**（`MEETWISE_WAKEUP_REDIS_STREAMS` 未设 · ROOT `.env` absent）。
- **PG LISTEN retained**（`meetwise_worker_wakeup_v1` 生产通道原样）。
- 原钉原样有效：**prove EXIT 同列绿 禁止宣称 MODEL-OP/SLO/cutover 已关**（backlog `:76` 原文 · checklist `:1031`/`:1132` · 本刀 Ban 洗掉该钉）。
- backlog `:76` **GAP-MOP-03 stays OPEN**；`#102 域 cutover 仍须独立审` + `cutover 另 REQUEST` 两后继钩子为原文。
- MOP03 `:76` successor 立卷刀已立 **六门准入合同**（`harness/gap-mop-03-successor.md` §2b · checklist `:1132`）——本刀独立审判据沿该合同**不加不减、不降级**。

## 1. 本刀目标（docs · 授权后执行面 = 材料包核验 + 引用面 rg 实证）

为「**MODEL-OP #102 域 cutover**」组装**独立审材料包**，交付三件：

1. **承卷证据清单**（§2 · A–E 五面 · 全部 file:line 锚 + SHA/EXIT 可解析）；
2. **独立审判据**（§3 · 审席在什么条件下可同意「域 cutover 声明成立」——沿六门合同，不降级）;
3. **审后残留义务**（§4 · 即使审席 BOTH PASS 同意 cutover 声明成立之后，仍须保留/另刀的义务清单）。

**本刀材料包 ≠ cutover 执行 ≠ cutover 声明成立**：材料包只是让独立审**有据可审**；#102 域 cutover 声明成立与否由独立审（PRE/POST dual + BUG-REV-COND 四专家审 · 不降级）裁决，裁决通过后的行翻转另 nail。

## 2. 承卷证据清单（只读引用 · 锚 @ base `fe218b7a` 实测 · 授权后执行阶段 rg 逐条复验）

### A. Q4/Q5 prove 同列 EXIT（承卷 AN-MOP-Q45）

| Face | 值 | 锚 |
|------|-----|-----|
| Q4 CMD | `pnpm model-invocation-reconcile:prove` **EXIT=0** | `package.json:198` · isolated receipt `receipts/2026-10-06-an-mop-q45-q4-model-invocation-reconcile-isolated.json`（`releaseEvidence=false` · outcome=passed） |
| Q5 CMD | `pnpm model-op00-usage-reconciler:prove` **EXIT=0** | `package.json:202` · isolated receipt `receipts/2026-10-06-an-mop-q45-q5-usage-calibration-reconciler-isolated.json` |
| 同列窗口 | attempt **1**（Ban retry-to-green）· 2026-10-06 20:21:35–20:22:00 +08 · 同一 CODE_SHA `66a77ed` | `harness/gap-mop-03-dual-reconciler-q45-honesty.md` §3b · receipt `receipts/2026-10-06-an-mop-q45-gap-mop-03-dual-reconciler-q45-honesty-prove.md` |
| 可选 wakeup | `pnpm worker-wakeup:prove` EXIT=0 · **PG-unit 层 only · ≠ Q4/Q5 co-gate**（`package.json:389`） | 同上 receipt §Optional |
| 链 SHA | REQUEST `d269761` · PRE dual mw-model-op `e2db4bc` + mw-e2e-ha `66a77ed` · PROVE `a1f3614` · POST dual `67050c0`+`a41c575` · **GAP stays OPEN** | harness §NAIL lifecycle（全部 SHA 本刀实测可解析） |

### B. 双 reconciler wiring 码面锚（file:line · 本刀 fresh 实测）

| 锚 | 内容 |
|----|------|
| `apps/worker/src/main.ts:677` | `runModelInvocationReconciler(pool, resolveModelInvocationReconcileConfig())`（Q4 invocation terminalization loop · `FOR UPDATE SKIP LOCKED` @ `apps/worker/src/model-invocation-reconcile.ts:68`） |
| `apps/worker/src/main.ts:679-680` | 同列注释「Dual reconciler 同列 · ≠ MODEL-OP fake green / ≠ SLO / ≠ Redis cutover / PG LISTEN retained」+ `runUsageCalibrationReconciler(pool)`（Q5 · insert-only `ON CONFLICT DO NOTHING` @ `packages/db/src/usage-calibration.ts:74`） |
| `apps/worker/src/main.ts:694` | 双 loop 均入 `workerReady()` 就绪门 |
| `apps/worker/src/main.ts:712` | 双 loop 均入 SIGTERM drain/stop 排空链 |
| `packages/ai-runtime/src/model-operation-registry.ts` | **model-operation-registry 面**（`MODEL_OPERATION_REGISTRY_VERSION='model-op-registry-v1'` · MODEL-OP-00 node identity + MODEL-OP-02 admission partition + MODEL-OP-03 capability matrix · `wired:false` fail-closed 不接真 adapter 不可 dispatch） |

### C. PG LISTEN retained 证据

| 锚 | 内容 |
|----|------|
| `apps/worker/src/main.ts:633` | `startWorkerJobWakeupListener(createPool({ max: 1 }), …)` 生产 wakeup 会话在位 |
| `apps/worker/src/main.ts:640-641` | 注释「Additive Redis Streams wakeup prototype (M3). Default off via MEETWISE_WAKEUP_REDIS_STREAMS=0 — **never replaces the PG LISTEN session above**.」 |
| `packages/db/src/worker-job-wakeup.ts:7` | 「**Production still uses LISTEN/NOTIFY until an independent cutover is approved.**」 |
| `packages/db/src/worker-job-wakeup.ts:15` | `WORKER_JOB_WAKEUP_CHANNEL = 'meetwise_worker_wakeup_v1'` |

### D. Redis unset / additive default-off 证据（只评估不切）

| 锚 | 内容 |
|----|------|
| Q45 receipt | `MEETWISE_WAKEUP_REDIS_STREAMS` **unset** · ROOT `.env` **absent**（承卷实测 · C-E2E-2/C-MO-AN-3） |
| `apps/worker/src/worker-job-wakeup-redis.ts:21,49-52` | env 名 + value-gate：仅 `'1'/'true'/'on'`（trim+lowercase）开 · `'0'`/空/unset 关 · **default off** |
| `apps/worker/src/main.ts:642-655` | 默认 `enabled:false` disabled listener · URL 缺失即 skip 且「PG LISTEN unchanged」· 连接失败降级 PG LISTEN only |
| `apps/worker/test/worker-job-wakeup-redis.proof.ts:27-28` | flag 0 off / flag 1 on 门测试 |
| `package.json:484` | `worker-wakeup-redis:prove` 实存 · 其任何 EXIT0 **≠ cutover 证据**（C-E2E-3 口径） |

### E. 铁律原钉（承卷 · Ban 洗）

- backlog `:76`：「prove EXIT 同列绿 **禁止**宣称 MODEL-OP/SLO/cutover 已关；#102 域 cutover 仍须独立审」——原样有效，本刀逐字引用不改写。
- checklist `:1031`：「Nail ≠ MODEL-OP domain closed ≠ #102 cutover ≠ SLO closed ≠ Redis cutover ≠ suite green」——原样有效。
- checklist `:1132`：「立卷 ≠ 关闭 ≠ MODEL-OP domain closed ≠ Redis cutover ≠ #102 cutover ≠ suite green ≠ HA」——原样有效。
- Line C 口径（`e2e-requirement-coverage-matrix.md:104` / backlog `:170-172`）：one wiring call ≠ suite green ≠ 域 close · 收据≠prove SHA · not_run 不计 pass。

### F. EXEC 期 rg 复验订正锚（三处 · model-op PRE 处方 · rev2 登记 · 订正后为本节权威）

| 原引用（REQUEST rev1 行号） | **订正后锚（`fe218b7a` 实位 · EXEC rg 复验与 nail 一律用此号）** | 内容面 |
|------|------|------|
| backlog `:170-172` | **backlog `:183-191`**（G7 Line C live chat-only 节） | Line C 口径：one settled chat wiring call ≠ suite close |
| BUG-NOTIFY-REC `:93` | **backlog `:101`** | wakeup 切流须 Redis Streams hint + **强制** periodic reconcile |
| MOP01 立卷 `:82` | **backlog `:84` + `harness/gap-mop-01-wakeup-notify-rec.md` §2a（`:50`）** | 有界延迟窗口径 + 强制周期 reconcile 未在 sole stack 证明 |

**披露（诚实）**：该三处原引用行号系按兄弟支线 `47f17b83` 的 SSOT 状态计量，`fe218b7a` 实际位置如上——**引用内容逐字无损**，仅行号漂移。nail 不得沿用旧号；rev1 行内旧号保留为 provenance 不回改。

## 3. 独立审判据（审席可同意「#102 域 cutover 声明成立」的充要条件 · 沿六门合同不降级）

**裁复合体**：独立审（mw-model-op + mw-e2e-ha PRE/POST dual · 加 BUG-REV-COND 四专家审 · D2 不降级）只有同时确认下列**全部门**通过，方可同意域 cutover 声明成立；**任一门未过 → 声明不成立**（可部分通过 = 不成立，Ban「大体通过」措辞）：

1. **Q4/Q5 同列门（fresh）**：cutover REQUEST 自带**新跑** `pnpm model-invocation-reconcile:prove` 与 `pnpm model-op00-usage-reconciler:prove` **同列 EXIT 0/0**，同一 CODE_SHA、同一预声明 attempt 窗口（Asia/Shanghai）、attempts 全记录、Ban retry-to-green。**承卷的 `66a77ed` EXIT0 是背景证据，不可替代 fresh 门**（旧 EXIT ≠ 新证据 · 2026-09-17 wiring 先例同口径）。单绿 ≠ 双门关。
2. **wakeup prove + 强制周期 reconcile**（GAP-MOP-01 / BUG-NOTIFY-REC `:93` 原文要求）：切流 hint 须 wakeup prove + periodic reconcile 证据在卷；`worker-wakeup:prove` 只按 PG 层标注，不得冒充 Redis 侧证据；`worker-wakeup-redis:prove` EXIT0 ≠ cutover 证据。
3. **flag 默认关 → 审后开**：`MEETWISE_WAKEUP_REDIS_STREAMS` value-gated 语义保持（代码门 `worker-job-wakeup-redis.ts:49-52` 逐字）；审前 unset；开启动作只在 AUTHORIZE 之后。
4. **PG LISTEN retained 至最后**：整个独立审期间与切流 REQUEST 落地前，`meetwise_worker_wakeup_v1` 生产通道零摘除、零绕过（§2-C 锚原样）；PG LISTEN 的实际退役是 cutover 成立**之后**单独授权的另步，不在本审内。
5. **独立审规格不降级**：≥ PRE/POST dual（mw-model-op + mw-e2e-ha）+ BUG-REV-COND 四专家审（ADR 隐私 prove 清单全绿 · Ban 自批 · alone ≠ dual · 不互相代签）。
6. **两本账分离沿 I 线**：estimated 与 actual 分离；`actualSpendCny` 仅 console-cited actual 可写（今日 **null**）· 费率非承诺（I 线 nail `e09a39f`）。
7. **诚实非 claims 全程**：任何 EXIT0 ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite green ≠ coveredCount 扩面（Line C 口径）；无洗前钉（§2-E）、无 SSOT 静默改、无 retry-to-green、无单次后绿关因。

**审席产出语义**：审席 PASS = 「按 §3 七门核对，当前材料**支持进入** cutover 执行 REQUEST 的下一门」；**不是**「域 cutover 已完成」的宣称。#102 声明成立的最终登记仍须 meetwise 授权 nail（另 commit · 非本刀）。

## 4. 审后残留义务（即使独立审 BOTH PASS 同意声明成立后仍须保留/另刀）

1. **行翻转另 nail**：GAP-MOP-03 `:76` 行翻转（OPEN→CLOSED 或标注 #102 cutover adjudicated）只在独立审 BOTH PASS 之后、由**单独的 nail commit + meetwise AUTHORIZE** 完成；本刀 REQUEST 不翻转（Ban fake closed）。
2. **PG LISTEN 退役另步**：独立审通过 ≠ PG LISTEN 立即摘除；`worker-job-wakeup.ts:7` 的「until an independent cutover is approved」解除须专门授权步骤 + 回滚预案（Redis 侧故障时的 PG fallback 回切）。
3. **GAP-MOP-01 / BUG-NOTIFY-REC 有界延迟窗**：漏唤醒=有界延迟窗口径 + 「强制周期 reconcile 未在 sole stack 证明」的诚实清单**原样携带**（MOP01 立卷 `:82` 附录），不因 cutover 审通过而洗白。
4. **GAP-MOP-02 独立行不动**：claim/lease Q2/Q3 是 backlog `:75` 独立 OPEN 行，不在 #102 域 cutover 审面内，Ban 借审通过顺带关行。
5. **矩阵纪律**：`e2e-requirement-coverage-matrix.md` 零触碰（本刀零 diff）；coveredCount=**8** 不扩面；任何 covered 翻转走各自 UC 独立 prove + 审。
6. **账本纪律**：两本账分离沿 I 线持续；cutover 后任何真实 spend 仅可由 console-cited actual 写入，费率非承诺。
7. **Redis 只评估不切**：评估产物（基准、延迟、成本对比）只入 docs/receipt 面，不改 flag 默认值、不删 PG 通道、不写 Redis prove 授权——授权属未来 cutover REQUEST。
8. **旧 prove 语义标注**：`worker-wakeup:prove` 维持 PG 层标注；若 cutover 后其语义失真，处置（标红/换夹具）另 REQUEST，Ban 静默改老 proof。

## 5. 流程声明（本刀 lifecycle）

**REQUEST（本 commit · docs-only 材料包）→ 预执行双审（mw-model-op + mw-e2e-ha · PRE BOTH PASS）→ meetwise 授权 → 执行（材料包核验 + 引用面 rg 实证 · 零 coding / 零 prove 执行 / 零 live）→ post 双审（BOTH PASS）→ meetwise 授权 nail。**

执行阶段允许的操作面：只读 `rg`/`git` 对 §2 A–E 锚逐条复验 + 材料包完备性核对（SSOT 行号按 §2-F 订正锚）；Ban 任何产品码、SSOT、flag、容器、prove 执行。**rg 复验结果写入 exec/lifecycle commit message，post 双审可独立复跑**（rev2 · e2e-ha 建议采纳）。

## 6. Ban 列表（硬 Ban · 全程）

- **Ban Redis cutover**（PG LISTEN/NOTIFY 保留 · Redis 只评估不切 · 不启 flag · 不写 Redis prove 授权 · 不删/绕过 PG LISTEN）
- **Ban MODEL-OP fake closed**：本刀 REQUEST 本身不关 GAP-MOP-03 `:76` 行——行翻转 = 独立审 BOTH PASS 后另 nail；Ban SLO forge / fake green / coveredCount 扩面
- **Ban 洗掉「prove EXIT 同列绿 禁止宣称 MODEL-OP/SLO/cutover 已关」原钉**（§2-E 三处原钉逐字保留）
- **Ban 改共享 SSOT**（backlog / matrix / checklist / queue 本刀零 diff · nail 阶段才登记）
- Ban #102 借本刀合入叙事 · Ban 自判「cutover 成立」（本刀只组装材料包 · 判属独立审）
- Ban coding · Ban prove 执行 · Ban live（无 Key/网络/付费/console spend）· Ban 容器
- Ban 独立审规格降级（D2 · BUG-REV-COND 四专家审不可减）· Ban self-approve（alone ≠ dual）· Ban 互相代签
- Ban secrets / `.env*` 读改 · Ban Meridian · Ban buy cloud · Ban force-push · Ban 碰 sibling 刀文件（PRIV-EXT / PERF-TEAR / RAG-R3 / AO COND body）

## 7. Non-claims

docs-only REQUEST 材料包组装 · not #102 cutover 成立 · not MODEL-OP closed · not SLO · not Redis cutover · not PG LISTEN 退役 · not HA · not suite green · not `releaseEvidence=true` · not coveredCount 扩面 · `actualSpendCny=null` · GAP-MOP-03 **OPEN** · alone ≠ dual · PASS ≠ 执行 ≠ AUTHORIZE ≠ nail

## Review stubs（PRE · 空审位）

| Expert | Stub |
|--------|------|
| `mw-model-op` | `reviews/REQUEST-2026-10-07-mop03-cutover-mw-model-op.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-mop03-cutover-mw-e2e-ha.md` |

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · PG LISTEN retained · Ban Redis cutover · Ban MODEL-OP closed · backlog `:76` OPEN · alone ≠ dual · STOP（awaiting PRE dual）

*Harness · MOP03-B MODEL-OP #102 domain cutover independent review evidence pack · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 零 coding · 零 prove 执行 · 承卷 AN-MOP-Q45（Q4/Q5 EXIT 0/0 @66a77ed · Redis unset · PG LISTEN retained）勿重做 · Ban Redis cutover · Ban MODEL-OP closed · `:76` OPEN · alone ≠ dual · STOP*
