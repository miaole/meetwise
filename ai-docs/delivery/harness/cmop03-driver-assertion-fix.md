# Harness — **CMOP03-FIX · driver 断言修复刀**（G7X nail 立项刀①·P1 优先 · Line CMOP03-FIX · docs REQUEST · `draft:awaiting_pre_exec_dual` · C-MO-P3 刀域 · `full.e2e.ts:201-203` 断言澄清感知修复 · e2e harness/driver 代码修复（非产品码）· ≠ 刀② ≠ 关 `:107` ≠ trio 翻绿）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding（含 e2e harness/driver 代码）· Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿 · **Ban retry-to-green** · **Ban 为绿改断言（C-MO-P3 原有约束显式入卷 · 见 §1）** · Ban 碰 G7V-FIX 线（`apps/web/lib/*`）与 settlement/early-stop 产品码 · Ban 顺手做刀② · Ban 改共享 SSOT（C-MO-P3 登记行指向更新归协调方 nail）· Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-08
**Line**: **CMOP03-FIX**（**G7X nail 双刀立项之刀① · P1 优先** · C-MO-P3 刀域 · backlog G7X 登记块 2026-10-08 立项行 · 主线旧红③/C-MO-P3（G7S 节「`full.e2e.ts:203` 断言语义另刀（C-MO-P3 · 澄清重发 identity 计数 vs 零澄清假设）」）= 同一断言面，G7X nail 已收敛定谳）
**授权链**: G7S 供给面修复 → G7U 真测 trio 1/1/1 → G7W 甄别刀（尾段死亡定位）→ **G7X 根因调查刀**（REQUEST `83234709` → erratum `979a85e4` → EXEC 收据 `c477df54` → post-prove dual BOTH PASS → G7X nail `50557225`：**残红③根因双面收敛 + 双刀立项登记**，两席 post-dual 均明确支持两刀立项）→ **本 REQUEST（docs-only）→ 预执行双审（mw-e2e-ha + mw-model-op）→ meetwise 授权 → coding+prove 一次优先 → post-prove 双审 → meetwise 授权 nail**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权 ≠ 修复效果预claim。
**输入事实（G7X 收据 + nail 登记块在案引用 · 只读 · `c477df54`/`50557225` 在卷）**：
- **G7X T-1 判别 run**（实跑 code `979a85e4` · EXIT=1 class=api 40363ms 落簇 37.9–41.8s · 37 tick 全窗）：主面试 completed（tick-26）→ `ai_report` 舱壁 3-attempts 烧尽（`score_aggregate_empty` ×3 · tick-26/31/36）→ `report_unavailable`+`quarantined` 设计终态（tick-36）→ **末段（终态后 ≤2.0s）抛点与 `full.e2e.ts:201-203` 出处审查断言恒 False 一致**——事件面实测 **question_ready=3 + clarification_needed=2 → identities=5 vs questions=3**。
- **恒 False 由构造（码面算术 · 本席亲读 @`50557225` · blob 见 §1.4）**：`reviewInterviewProvenance` 对 **question_ready 与 clarification_needed 双 kind 逐事件均 push identity**（`e2e/helpers/interview.ts:209-210`），而驱动 `questions` 计数器**仅对 question_ready `++`**（`interview.ts:308-309`）；断言本体 `provenance.identities.length === questions`（`e2e/full.e2e.ts:202`）。设澄清轮数 c=#clarification_needed、问题数 q=#question_ready：identities=q+c，questions=q → **c≥1 时 identities≥q+1>questions，等式恒 False，与产品行为零关**——断言在含澄清轮次旅程下**构造性死亡**，任何产品实现都无法使其通过。
- **G7X post-dual 双席收敛意见在卷**：mw-e2e-ha PASS + mw-model-op PASS，两席均确认 CMD1 api 红与主线已登记 C-MO-P3（G7S 节旧红③ `full.e2e.ts:203`）收敛为**同一断言面**（同断言/同机制族/同类失败路径 · blob `7d65d0f3` 三点全等），两席均明确支持两刀立项——刀①（本刀）= driver 断言修复，刀②（弱输入 report_unavailable 预期面校准 · 产品语义裁归产品席）= 随①后另刀，**非本刀**。

**Base**: `origin/feat/mysql-schema-skeleton` **`50557225`**（full `50557225a40b4ae026bb39ead0e29786cbd7022e` · turn 内 `git fetch` EXIT=0 · remote-tracking ref 实测恰等 · 含 G7X nail 两刀立项登记）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-cmop03fix` · branch `line/cmop03-driver-assertion-fix`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · trio **OPEN**（G7U 真测 1/1/1 retained · G7X T-1 预期红原值记账零冲销）· **GAP-G7K-API-REDS P1 OPEN**（backlog `:107` 状态行不翻——**任一落地 ≠ `:107` 关闭**，关闭须其自身修复刀全链）· C-MO-P3 修复路由已裁=刀①（协调方已行使）但**未落地**（本刀即其落地 REQUEST）· 刀② **OPEN**（弱输入报告面产品语义裁归产品席 · 随①后）· P2 `GAP-G7W-QGEN-SCHEMA-VALIDATION` 复验门零触碰 · 残红①（旅程自适应早停面 ×2）非本刀零触碰 · 残红② golden ×1 suspended/OPEN 零触碰 · Disclosure-1 OPEN · `r1Closed=false` · **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban 实跑 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零代码改动（含 e2e harness/driver 代码）**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`50557225`；关键码面 blob `git hash-object` 亲算在卷 §1.4）；**(b)** G7X EXEC 收据 2 文件（`ai-docs/delivery/receipts/g7x-taildeath-rootcause/` 00-summary + 01-t1-timeline · commit `c477df54` · 本 tip 祖先）+ G7X nail 登记块（`50557225` · execution-master-checklist G7X 节 + backlog G7X 登记块）；**(c)** G7S/G7U/G7W/G7X committed 收据链机制引用。不发明任何未在案明细；EXEC 期行号按当 tip 重核回填。**修复后的实跑结果无论绿红，如实入收据（Ban 为绿改断言的重演 · Ban 定谳压力 · Ban 就地 reinterpret）。**

## 1. 立项依据（入卷 · 恒 False 由构造 → 修复=语义纠非避红）

### 1.1 断言本体与码面算术（亲读 @`50557225`）

断言本体（`e2e/full.e2e.ts:201-203` · blob `7d65d0f3`）：

```ts
A(provenance.trustedBSideScore === null && provenance.forgedScores === 'none'
  && provenance.identities.length === questions,
  `出处审查: 不把 AI 分/progress 当 B 端分（identities=${provenance.identities.length}, forgedScores=${provenance.forgedScores}）`);
```

三段合取中前两段（`trustedBSideScore === null` · `forgedScores === 'none'`）= **真出处审查语义**（不把 AI 分/progress 当 B 端分）；第三段 `identities.length === questions` = **计数对称校验**。算术：

| 量 | 定义处 | 计数口径 |
|---|---|---|
| `identities` | `interview.ts:209-210`（`reviewInterviewProvenance` · blob `c8e63f41`） | question_ready **与** clarification_needed 双 kind 逐事件各 push 1 枚（identity 签发面 `:77/:90-97` 双 kind 均为合法签发源） |
| `questions` | `interview.ts:308-309`（驱动主循环） | **仅 question_ready `++`** |
| 澄清轮 c | `interview.ts:339-361`（clarification_needed 分支 · 驱动逐轮应答 `submitTurn` + `turn++`） | 事件面 G7X 实测 c=2 |

**恒 False 证明（由构造）**：identities=q+c（q=#question_ready · c=#clarification_needed），questions=q → `identities.length === questions` ⟺ c=0。**c≥1 的任何旅程该合取恒 False** → `A()` fail-fast（`e2e/helpers/assert.ts:12-16` · blob `975fbb38`：emit 分类账行 + `console.error` + `process.exit(1)` · 第三参缺省 class='api'）→ 与 G7X T-1 machine receipt `failureClass=api` 一致（时间线：终态可读 ≤02:04:29.9 → 末段 ≤2.0s 抛 → exit 02:04:31.5 · `full.e2e.ts:383-385` `main().catch` 兜底同分类）。G7X T-1 实测 5≠3 即实例。

### 1.2 语义纠偏定性（非避红）

该断言的**自述语义**是出处审查（「不把 AI 分/progress 当 B 端分」），但第三段在构造上编码的是**「本旅程零澄清轮」假设**——澄清重发（clarification_needed 也签发 identity 且驱动逐轮应答 `:339-361`）是产品合法路径（identity 签发纪律 `:77`/`:90-97` 明文双 kind 均为合法签发源），却被计数口径单边排除。**断言与被审事实错位 = harness 断言语义缺陷（C-MO-P3 登记原文「澄清重发 identity 计数 vs 零澄清假设」）**，非产品缺陷、非 flake。修复=把计数口径纠回「服务端签发 identity 全集 vs 驱动应答 identity 轮次全集」的对称语义——**是语义纠偏，不是为绿而改断言**。**「Ban 为绿改断言」约束（C-MO-P3 原有）显式入卷**：本刀对 `:201-203` 的任何改动必须满足 §2 两案共有的反伪造零弱化硬条件 + §1.1 算术证明支撑 + §3 新预期面先于实跑冻结；**不满足任一即为「为绿改断言」= 本刀 FAIL**。恒 False 由构造的算术证明（§1.1）即立项依据——修的不是「红的读数」而是「读数器的口径」。

### 1.3 双席收敛与立项硬条件（G7X nail 登记块承卷）

G7X nail `50557225` 立项刀①硬条件逐条承卷并落实：(i) 修法=`:201-203` 断言澄清感知（预期 identity 集合纳入 clarification identity 或对称比较 question_ready 子集——§2 两案）；(ii) provenance 反伪造功能零弱化（`rejectForgedProgressScores` @`e2e/helpers/interview.ts:3`/`:199` + `e2e/helpers/sse.ts:53`/`:90` / identity 签发纪律 `:77`/`:90-97` 零触碰）；(iii)「Ban 为绿改断言」约束显式入 REQUEST（§1.2 已落字）；(iv) 修复后旅程首次执行 step 7/7a/8/9 须预注册新预期 EXIT 面（含 `full.e2e.ts:292` application face——§3 已冻结）；(v) Ban retry-to-green（§4 已落字）。

## 2. 修法方案（≥2 对比 · 推荐**方案 a**交双审 · 两案共有硬约束）

### 2.0 两案共有硬约束（违反任一 = 方案非法）

1. **provenance 反伪造功能零弱化**：`rejectForgedProgressScores`（`sse.ts:53-57` · 调用点 `sse.ts:90` + `interview.ts:199`）、identity 签发纪律（`interview.ts:77` 文档锚 / `:90-97` `questionIdentityFromEvent`：progress 非 identity 源 `:92`、非法 kind 拒绝 `:93`、regex/stateVersion 伪造拒绝 `:83-85`）、progress 携 questionId 拒绝（`interview.ts:206` `e2e_progress_not_identity`）——**全部零触碰零 diff**（机检钉：`sse.ts` blob `9bba015d` · `assert.ts` blob `975fbb38` · `run-e2e-isolated.mjs` blob `13dbfc43` · `model-operation-registry.ts` blob `63af556f` EXEC 前后全等强制；`interview.ts`/`full.e2e.ts` 允许本刀改动 · 改后 blob EXEC 收据登记）。
2. **NEG 面保留（伪造仍须红）**：伪造 progress 分数 → `e2e_forged_progress_score` 抛出红；progress 携 questionId → `e2e_progress_not_identity` 红；伪造 identity（regex/stateVersion 不符）→ `e2e_question_identity_forged` 红；B 端可信分越界（`trustedBSideScore !== null` 或 `forgedScores !== 'none'`）→ 断言红。**修复后的 `:201-203` 必须保留合取前三段中的真出处审查两段**（`trustedBSideScore === null && forgedScores === 'none'` 零改动保留）。
3. **断言仍为 fail-closed**：沿 `assert.ts` 自述「Do not wrap this in try/catch to manufacture a green run」——修复不引入任何吞错/降级/绕行。

### 2.1 方案 a · 预期 identity 集合纳入 clarification identity（**推荐**）

**语义**：澄清轮的 ask 也是 provenance 事实（clarification_needed 由 identity 纪律 `:90-97` 明文授权签发、驱动逐轮应答 `:339-361`）——预期 identity 集合=「驱动应答过的全部 identity 轮次」=question_ready 轮 + clarification_needed 轮。断言第三段改为：

```ts
&& provenance.identities.length === questions + clarifications
```

**实现**：驱动主循环 clarification_needed 分支（`interview.ts:339-361`）增 `clarifications++`（与 `questions++` `:309` 对称），`driveInterviewToTerminal` 返回形状（`:372-377`）与 `InterviewJourneyResult` 类型（`:63` 邻域）增 `clarifications` 字段；`full.e2e.ts:198` 解构与 `:202` 断言消费之。**仅触 `interview.ts` + `full.e2e.ts` 两文件 harness 面**。
- **变体 a′（零 helper 触碰备选 · 交双审裁定）**：`turns` 已构造性等于 questions+clarifications（`turn++` 恰在 `:330` 与 `:361` 两处 · stale-replay 提交不 increment），断言可写 `identities.length === turns` 而零改 `interview.ts`。**不推荐为主形**：将出处审查计数耦合到 turn 纪律（含 stale-replay 非 increment 语义）——语义自释性差、未来 turn 口径漂移会静默改写审查面；**仅当双审以最小 diff 面裁定优先时采用**。

**检测面**（对称全集）：服务端多签发任何一枚 identity（含 clarification kind）而驱动未应答 → identities > questions+clarifications → **红保留**；少签发/漏签发 → < → 红保留；伪造 identity 结构 → 逐事件 `questionIdentityFromEvent` 抛红（不变）。**全量计数对称，检测面零收窄**。

### 2.2 方案 b · 对称比较 question_ready 子集（不推荐 · 并陈交双审）

**语义**：将 identities 过滤为 question_ready 签发子集后与 `questions` 比对：`identities.filter(i => i.issuedBy === 'question_ready').length === questions`（或等价的专用子计数器）。**实现前置**：`reviewInterviewProvenance` 的 identities 收集形状须携带签发 kind 元数据（`interview.ts:200/210` push 处加 `issuedBy: event.kind` 或另立 `questionReadyIdentities` 计数）——**触碰 provenance review 数据结构本体**（反伪造核心 `:198-228` 邻域）。
- **检测面（收窄）**：question_ready kind 的多签发/漏签发仍红；**clarification kind 的多签发（服务端签发驱动未应答的澄清 identity）不再被计数断言捕获**（仅余逐事件结构校验一道）——**检测面较方案 a 收窄**。
- **代价**：diff 落在 `reviewInterviewProvenance` 本体（`:200-228`），紧邻受保护反伪造面，爆炸半径大；收益仅「helper 零新字段」不成立（同样要改 helper）。

### 2.3 对比结论

| 维度 | 方案 a（推荐） | 方案 b |
|---|---|---|
| 语义保真 | 签发全集 vs 应答全集 · 澄清 ask 入 provenance 事实面（与 `:77`/`:90-97` 双 kind 纪律一致） | 将澄清轮排除出计数审查 · 与 identity 签发纪律的双 kind 授权面错位 |
| 检测面 | 全量对称 · 零收窄 | clarification kind 多签发漏检 · 收窄 |
| diff 落点 | 驱动计数器 + 返回形状 + 断言一行（`interview.ts:339-361` 邻域 + `full.e2e.ts:198/:202`） | `reviewInterviewProvenance` 数据结构本体（反伪造核心邻域） |
| 反伪造零弱化 | 满足（受保护面零 diff 机检钉） | 满足但紧邻受保护面 · 爆炸半径大 |
| 实现风险 | 低（a′ 变体可零 helper 触碰） | 中（形状变更波及消费方） |

**推荐方案 a（主形=显式 `clarifications` 计数器 · a′ 零 helper 变体交双审裁定）**。最终断言形态由 pre-exec 双审 + meetwise EXEC 授权定值一次成型；**EXEC 期 Ban 断言形态二改**。

## 3. 新预期面预注册（修复后该旅程首次执行 step 7/7a/8/9 · **全部判据先于实跑冻结** · EXEC 授权后不回改）

> **总纪律**：本刀**不预设「全绿」**——step 7 以后任何红=**新面新登记**（原值记账 + 升级协调方裁），**Ban retry-to-green、Ban 红面就地 reinterpret、Ban 归因既有关行**。CMD1 同体一次优先（单 attempt）；修复面判据=**越过 `:201-203`**（即不再于 `:201-203` 处 class=api exit · 后续面按本节逐段判）。逐段期望 EXIT+判据如下（行号 @`50557225` · blob `7d65d0f3`）：

| 步 | 码面 | 期望 EXIT + 判据（冻结） |
|---|---|---|
| **修复面本体** | `:201-203`（方案 a 改后） | **必须过**：`trustedBSideScore === null && forgedScores === 'none' && identities.length === questions + clarifications` 全真（G7X 实测形状 5 === 3+2 应真）。若仍红=修复无效 · 本刀 FAIL · 原值记账升级协调方 |
| **无死胡同 + 终态非空** | `:209-210`（`A(terminal !== '', …, 'worker')`） | 过（G7X T-1 已证 terminal=`report_unavailable` 非空 · 终态族 ∈ `interview.ts:8` 五族任一即真） |
| **step 7 · 报告可查** | `:213-215` | 过：`GET /interview/:id/report` → 200。判据=端点可查（G7X 收据链 `interview.service.ts:672` 快读语义 · 报告行 quarantined 有行返 status） |
| **step 7 · 状态机自洽** | `:216` | 过：**本弱输入旅程 terminal=report_unavailable（G7X T-1 tick-36 在卷）→ 分支 `b.status !== 'ready'`** · 预期 b.status=`quarantined`（≠ ready · `ai_report` CHECK 族 @`0001_baseline.sql:224`）→ 断言真。**注意：这不是把 report_unavailable 写成「必须 ready」——恰好相反，:216 分支本身容于非 ready 终态；本刀零改 :216**。若本 run 终态族异动（如 report_ready）→ :216 分支自适应；红=新面登记 |
| **step 7a · 报告失败隔离** | `:220-237`（第三 interview 同 resume-id begin · failLoop） | 过：failLoop terminal=`report_unavailable` && rep.status=`quarantined`（`:236-237` 断言 · 该 face 本旅程**首次执行**）。依据=G7X T-1 主面试同构路径实测（practice/未绑岗零可计分 ScoreCard → `score_aggregate_empty` → 舱壁烧尽 → quarantined；`E2E_REPORT_FAIL_ALL=1` 注入面为 worker env 既有定值 · erratum ② 承卷）。**本刀零改 :236-237 断言本体**——「report_unavailable+quarantined 是否设计内常态」的产品语义裁=**刀② 域 · 本刀 Ban 越界裁** |
| **step 7b · 押题+诊断** | `:240-256`（pollTerminal 终态族） | 过：quiz 终态 ∈ {quiz_ready, quiz_unavailable, error} 非空 && 诊断终态 ∈ {diagnosis_ready, diagnosis_unavailable, error} 非空（无死胡同判据）。**具体落在哪一终态不预注册为定值**（ready 与 unavailable 同真）——超时/空终态红=新面登记 |
| **step 8 · B 端+RLS** | `:258-282` 邻域 | 过：发岗 200+jobId · 幂等复用+409 冲突 · 候选人发岗 403 门禁 · 自见 · 他方不可见（RLS）· 越权取 404。非 AI 面 · G7U/G7W 时代既有绿面承卷 |
| **step 9 · 候选人闭环** | `:286-298` | 过：浏览公开岗可见 → **`:292` application face：`POST /jobs/:id/apply` → 200+applicationId（`:294` 断言 · `recruiter.ts:132`/`:137-141` INSERT `job_application`）** → 自见投递 status=invited → 招聘方见候选人本人（多方 RLS）。G7W 在卷「死于 application face 之前」的反面即本 face 首达 |
| **旅程余段** | step 9 之后既有专家评审用例面 | 沿既有断言原样（本刀零改）——红=按既有面登记流程（非本刀新面 · 如实区分记录） |
| **总 EXIT** | `pnpm run e2e:isolated` | **期望 EXIT=0（当且仅当上列全部成立）**；任一红 → EXIT=1 + `E2E_FAILURE_CLASS` + machine receipt 原值全录（红面位置=断言行/类面定位 · **Ban 精确 stderr 归因超出 receipt 面**）→ 新面新登记升级协调方 |

**预期面机检钉**：EXEC 实跑前后 blob 全等强制——`sse.ts`=`9bba015d` · `assert.ts`=`975fbb38` · `run-e2e-isolated.mjs`=`13dbfc43` · `model-operation-registry.ts`=`63af556f`（四钉零 diff）；`full.e2e.ts`/`interview.ts` 改后新 blob 收据登记（改前 `7d65d0f3`/`c8e63f41` 承卷）。tracked 树 run 前后零改双测（`git status --porcelain` 非 untracked=0）。

## 4. prove 方案（EXEC 期 · pre-exec dual BOTH PASS + meetwise 授权后方可行）

1. **前置**：pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ **meetwise EXEC 显式授权**（定值面：断言形态 a 主形 vs a′ 变体 · base 重钉 ≥当 tip 含重新 fetch · 一次成型）→ 本 worktree（或授权重开）`pnpm install --frozen-lockfile`（EXIT 记录）→ coding（仅 §2.1 方案 a 落地面 · **恰两文件 `interview.ts`+`full.e2e.ts`** · diff 面 EXEC 收据全录）。
2. **执行序**：CMD1 同体 `pnpm run e2e:isolated`（wiring `package.json:278` blob `0afb3bd2`）**一次优先 · 单 attempt**——期望=修复后越过 `:201-203`（§3 预期面逐段判读落字；若后续面红，**红面位置+原值全录**）→ §3 表逐段判读 → machine receipt（`.tmp/e2e-receipts/*.json`）+ `E2E_FAILURE_CLASS` + EXIT 三源交叉一致才可引用。
3. **attempts 全台账 · Ban retry-to-green**：全部 attempt（含首跑）七字段全记录 Ban 删除覆盖——CMD 原文 / EXIT 原值 / 起止时间戳 / 实跑 code SHA（worktree HEAD 实测）/ worktree+branch / 环境探针（`.env*` ABSENT 前后各测 · Key name-only）/ 判读归类。**任何红面（含 step 7 后新面）不是重跑触发条件**——红=新面新登记升级协调方；零第二次 run 通道（Ban 为绿追跑 · Ban 只留绿 attempt · Ban flake 记法冲销）。
4. **预算**：**est 硬帽 ≤200（沿账本实测读数法——`ai_model_invocation` DB 账本逐 attempt 实测计数 · 非估算器口径）**：G7X T-1 同体实测 live=7/run；修复后旅程延展至 7a（第三 interview 全轮）+7b（quiz+诊断）→ 声明 est ≤30/run 量级 · 总硬帽 ≤200；超限即停如实记中止（不洗 not_run）。**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
5. **Key 卫生**：模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · **name-only 入卷**）· Ban 值/fingerprint 入 receipt/log/commit · Ban 写任何 `.env*`（ABSENT presence 逐 attempt 记录）· DB 直读（如需账本实测）用容器固定测试凭据（wrapper baseEnv 同面 · 非模型 Key · SELECT-only）。
6. **收据落点**：`ai-docs/delivery/receipts/cmop03-driver-assertion-fix/`（per-attempt 收据 + SUMMARY：§3 预期面逐段判读 + attempts 台账 + 四钉零 diff 机检 + 新面登记如有）。SSOT/backlog 登记**留 nail 阶段**（协调方）。
7. **EXIT 后路由**：全段成立（EXIT=0）→ post-prove dual → meetwise 授权 nail（C-MO-P3 落地登记 · **`:107` 关闭仍须其自身修复刀全链**——本刀落地 ≠ `:107` 关闭）；任一红 → 新面登记 + 原值记账 → 升级协调方（Ban 就地修断言再跑 · Ban 归因既有关行 · Ban 自 nail）。

## 5. 硬 Ban 清单

1. **Ban 弱化/删除 provenance 校验**：`rejectForgedProgressScores`（`sse.ts:53-57`/`:90` · `interview.ts:199`）、identity 签发纪律（`interview.ts:77`/`:90-97`）、progress 携 questionId 拒绝（`:206`）、B 端分信任面（`trustedBSideScore`/`forgedScores` 合取段）——零弱化零删除零 try/catch 包裹；NEG 面伪造 progress 分数/伪造 identity **仍须红**。
2. **Ban 为绿改断言（C-MO-P3 原有约束）**：断言改动仅限 §2 两案语义纠偏形态且满足 §2.0 共有硬约束；Ban 放宽 B 端分信任段、Ban 吞错、Ban 降级为 warning、Ban 删断言。
3. **Ban 把 report_unavailable 写成「必须 ready」**：`:216`/`:236-237` 零触碰——「practice/未绑岗零可计分 ScoreCard → report_unavailable+quarantined 是设计内常态还是 scoring 缺陷」= **刀② 产品语义裁 · 归产品席**，本刀零越界。
4. **Ban 碰 G7V-FIX 线与 settlement/early-stop 产品码**：`apps/web/lib/*` 零 diff；settlement/early-stop 相关产品码零 diff。
5. **Ban 顺手做刀②**：弱输入报告面校准（e2e 断言按设计预期写 + 报告链钟登记）归刀② 全链（新 REQUEST+双审+授权）——本刀 prove 读数若呈刀② 面（如 7a 实测形状偏离预期）**只登记不裁**。
6. **Ban 改共享 SSOT**：C-MO-P3 登记行指向更新（G7S 节/G7X nail 节/backlog 登记块）归**协调方 nail**；covered 矩阵/north-star-SSOT/backlog 状态行零触碰（`:107` P1 OPEN 不翻 · trio 不翻 · `g7SuiteGreen=false` 不翻）；sibling 归档（G7K/G7R/F-F/G7S/G7T/G7U/G7W/G7V/G7X 收据 lifecycle）零改写。
7. **Ban secrets**：模型 Key 只经进程环境（loader source `~/.meetwise-secrets/` · name-only 入卷）· Ban 值/fingerprint · Ban `.env*` · Ban Key 入 receipt/log/commit。
8. **Ban retry-to-green / Ban masking / Ban 破坏性注入 / Ban withhold 契约触碰**：单 attempt 一次优先 · 红=登记非重跑令 · Ban 伪造产品不可能状态 · Ban 清 BUILD_ID/降资源/杀进程 · 断言原文/case 名 stderr 回读契约零变更。

## 6. EXIT 契约（双向）

- **修复成立（越过了 `:201-203`）且 §3 全段成立** → 本刀产品=「C-MO-P3 断言面澄清感知落地 · provenance 反伪造零弱化机检钉在卷 · 新预期面首验读数在卷」→ post-prove dual → meetwise 授权 nail。**落地 ≠ `:107` 关闭 ≠ trio 翻绿 ≠ `g7SuiteGreen=true` ≠ 刀② 裁定**。
- **修复面仍红** → 本刀 FAIL · 原值记账 → 升级协调方（Ban 二改断言就地重跑）。
- **step 7 后任一面红** → 新面新登记（原值+位置+类面全录）→ 升级协调方（Ban 归因既有关行 · Ban retry-to-green）。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim §3 判读结果、不预claim 修复一次成型。

## 7. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed（本 turn 零代码改动 · 含 e2e harness/driver 代码）· not coding · not C-MO-P3 关闭（落地须本刀全链 + 协调方 nail 登记）· not `:107` GAP-G7K-API-REDS closed（P1 OPEN 不翻）· not 刀② 裁定/开工（产品语义裁归产品席）· not report_unavailable 语义定谳（刀② 域）· not trio green（1/1/1 retained）· not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not meetwise authorize · `g7SuiteGreen=false` · trio OPEN · **`actualSpendCny=null`** · alone ≠ dual

---

*Harness · CMOP03-FIX driver 断言修复刀（G7X nail 立项刀①·P1）· 2026-10-08 · `draft:awaiting_pre_exec_dual` · docs-only · 立项依据=恒 False 由构造（identities=q+c vs questions=q · c≥1 恒 False · G7X 实测 5≠3 · 修复=语义纠非避红 · Ban 为绿改断言显式入卷 · G7X 双席收敛在卷）· 修法两案对比（a=预期 identity 集合纳入 clarification identity · 推荐 · a′ 零 helper 变体备选；b=question_ready 子集对称比较 · 检测面收窄不推荐 · 两案反伪造零弱化+NEG 面伪造仍须红）· 新预期面先于实跑冻结（step 7 终态族 report_unavailable/quarantined ≠ ready → 7a/7b → step 8/9 → :292 application face · 不预设全绿 · step 7 后任何红=新面新登记）· prove=CMD1 同体一次优先单 attempt · attempts 全账 · Ban retry-to-green · est 硬帽 ≤200 账本实测读数法 · `actualSpendCny=null` · Key name-only · `.env*` ABSENT · STOP*
