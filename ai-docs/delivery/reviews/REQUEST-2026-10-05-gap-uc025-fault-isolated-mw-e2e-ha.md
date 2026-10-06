# REQUEST — **GAP-UC025-FAULT-ISOLATED-01 · UC-025 FAULT 隔离 PG/HTTP 证据层** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc025-fault-isolated.md` · slice `gap-uc025-fault-isolated.slice.md`
**Parent tip**: `44154aa5`（full `44154aa53a8c8508e8e8b1c51333c648187ac360` = origin tip · AA nail `15eedd6` 之后）
**Date**: 2026-10-05

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

## 请审什么（mw-e2e-ha · evidence-honesty / EXIT 契约 / 三层隔离壳）

Line W · UC-025 FAULT 隔离面升级刀（AA in-process nail `15eedd6` 之后 · coordinator-prioritized #2）。请审：

1. **互补不互替裁决**：AA in-process（`InterviewService.begin` + fake DB · 无 PG 无网络 · proof 自证「no PostgreSQL, no network」）≠ isolated ≠ covered；AA harness 明文「PG/HTTP-level FAULT → separate knife」。本刀是否诚实定性为**新增隔离面**而非重跑/替代/洗 AA；Ban 洗 AA 证据为已足够。
2. **判据原值**：隔离面判据 = AA 钉死口径原值（409 · `missing_quiz_expiry` · NULL/NaN fail-closed fold 同口 · 顺序 NEG `stale_quiz`→FAULT→BOUND `resume_version_mismatch` · 无 quiz-id 整块跳过 · C-1 supersede 窄保留 NULL≠`stale_quiz`）——是否零漂移、未发明新验收标准。
3. **三层隔离壳方案**：随机 `meetwise-e2e-*` 容器（只删自建、不触开发库）+ 动态端口（`app.listen(0)` 先例 `_neg-harness.ts:89`）+ 迁移白名单（`01_schema`…`22_interview_invitation` 含 `20_resume_quiz`/`0135`）+ `assertIsolatedTestTarget`；注册先例 K `uc014:webhook-adv:prove`（root `package.json:148-149` 三层）；真 HTTP = 真 Nest app 真 fetch 非直调 service。方案是否与 `run-e2e-isolated.mjs` 头注契约一致、是否引入 fake-green 面。
4. **注入面 F1–F5**：缺锚（NULL）主断言 + NaN 锚同口 + 新鲜锚正控（防「带 quiz-id 一律拒」过宽假绿）+ 过去锚 `stale_quiz` 顺序控制 + 无 quiz-id 跳过；DB before/after 零副作用快照（interview 未建/额度未扣/队列未入）。是否完整覆盖 AA 判据、是否越界（ADV 跨用户 replay 非本刀，owner-scope 仅 disclosed-not-blocking）。
5. **EXIT 契约诚实**：EXIT 0 当且仅当隔离面全部断言成立；任一做不出 → EXIT1 诚实保留（`GAP-UC025-FAULT-ISOLATED-01` 明细落 receipt）；attempts 全记录（含中断/失败逐次记录 EXIT+时间戳）、Ban retry-to-green、Ban 记 flake；EXIT0 ≠ covered ≠ nail ≠ 翻行。
6. **禁碰与回归**：AA in-process proof/harness/slice/receipt + B'' NEG proof + 前 W BOUND proof 零改动（ruler 冻结）；授权 prove 时同 tip `uc025:nhp-neg:prove` + `uc025:nhp-bound:prove` + `uc025:nhp-fault:prove` 仍 EXIT0、Ban 改三者迁就；SSOT 零触碰（登记留 nail）；UC-018/052/004/014/026/002/011 不碰。
7. **Pins 原值**：上表 8 项不翻；row stays gap · FAULT 列 stays gap · coveredCount=8。

Dual PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC DUAL REVIEW — mw-e2e-ha（append-only · 2026-10-02 审 · 审的 REQUEST = `b0242bf` ≡ origin `43322e5c`）

**Reviewer**: `mw-e2e-ha`（adversarial evidence-honesty）· **只签本人**，不代签 mw-privacy-int（其 stub 仍 PENDING，存在性已核，内容不裁）· alone ≠ dual · 本 PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA。
**审点核验（命令 + EXIT + 可复现证据）**：worktree `/Users/miaole/Desktop/golucky/meetwise-rv-w-e2e-ha`（branch `rv/w-e2e-ha` @ `origin/feat/mysql-schema-skeleton`）· `git fetch origin` 后 origin tip = `43322e5c` · `git merge-base --is-ancestor b0242bf origin/feat/mysql-schema-skeleton` OK · patch-id 双侧同为 `13fa9475af22405f16803ed42492996eb586a221`（`b0242bf` 与 `43322e5c` 同补丁）· REQUEST diff = 4 个新增 md、+244/−0、零代码零 SSOT。

## 检查表（逐项核验 · 证据 file:line）

| # | 项 | 核验证据 | 裁决 |
|---|----|----------|------|
| 1 | REQUEST 祖先 + docs-only | `merge-base --is-ancestor b0242bf` OK · diff 仅 4 新增 md（harness/slice/两 stub）· 零 SSOT 零产品码 | MET |
| 2 | AA C-1 supersede 授权依据引用为真 | AA harness `harness/nhp-025-fault-01-missing-expiry-fail-closed.md:173`（nail additive）原值「in-process … **≠ isolated Postgres/HTTP E2E** · **≠ covered** … **PG/HTTP-level FAULT → separate knife**」；AA proof `apps/api/test/uc-e2e-025-nhp-fault.proof.ts` 头注「in-process (NOT isolated three-layer shell) … Ban narrating this as isolated PG/HTTP E2E or covered」逐字核对一致；AA C-1 旧工件披露 `:90`「未回填 → 预期拒绝（本刀披露）」逐字一致——W harness「该『预期拒绝』当时只有 in-process 证据，隔离面收据由本刀补」引用准确 | MET |
| 3 | 互补不互替双向写死 | W harness One-line + 结论段 + Ban 列表：Ban 洗 AA in-process 为已足够 · Ban 重跑/改写 AA prove 冒充隔离面 · Ban 把隔离面 EXIT0 叙事成 AA 收据替代 · Ban 用任一 wash 另一（双向）；Non-claims「本刀不关 `GAP-UC025-FAULT-01`」；gap id 四名分立（AA `GAP-UC025-FAULT-01` / B'' `GAP-UC025-NEG-01` / 前 W `GAP-UC025-BOUND-01` / 新 `GAP-UC025-FAULT-ISOLATED-01`）互不改名 | MET |
| 4 | 判据原值零漂移 | F1 NULL→409 `missing_quiz_expiry` = `interview.service.ts:239`；F2 NaN fold 同口 = `:242` + AA harness「NaN/illegal date fail-closed fold same guard same error code」；F4 过去锚→`stale_quiz` = NEG 块 `:216-222`（`expires_at<=now`→`stale_quiz`）；顺序 NEG→FAULT→BOUND 冻结 = 代码块序；F5 无 quiz-id 整块跳过 = `if (sourceQuizId)` 双块守卫；F3 正控 = AA harness prove 方案「正控：未来非空合法 `expires_at` → 越过本 FAULT 检查（可到 bind sentinel / 下一守卫）」同口径。**零新验收标准** | MET |
| 5 | 协调方指令歧义纠正核实 | 实现方按 AA 原值纠正（缺锚/NULL→`missing_quiz_expiry` 而**非** `stale_quiz`；过去锚→`stale_quiz` 而**非** `missing_quiz_expiry`）与真实代码 `:222`/`:239` 及 AA harness 钉死表逐项一致；C-1 窄保留 NULL≠`stale_quiz` 在 NEG 块原样保留（NULL→quizExpired=false 走 FAULT 块）。**纠正正确** | MET |
| 6 | 三层壳完整性 | 随机容器：`scripts/run-e2e-isolated.mjs` 头注「该包装器每次只删除它自己创建的 `meetwise-e2e-*` 容器，绝不触碰开发数据库或开发容器」；动态端口：`app.listen(0, '127.0.0.1')` @ `apps/api/test/_neg-harness.ts:89` 逐字在；迁移白名单：`_neg-harness.ts:65` `01_schema`…`22_interview_invitation` 含 `20_resume_quiz`，锚列经 `packages/db/sql/20_resume_quiz.sql:15`（`expires_at timestamptz` · 注释「增量侧 0135」重放镜像）入隔离 schema——`migrations/0135_*.sql` 非独立白名单条目（见 C-3）；`assertIsolatedTestTarget(db.pool)` @ `_neg-harness.ts:58`；K 先例三层注册 @ root `package.json:148-149`（`uc014:webhook-adv:prove`）逐字在 | MET（附 C-3） |
| 7 | EXIT 契约诚实 | EXIT0 当且仅当隔离面全断言（F1–F5 + DB before/after 快照 + 三层壳证据）；EXIT1 诚实保留打印 `GAP-UC025-FAULT-ISOLATED-01` 明细；attempts 全记录含中断/失败逐次 EXIT+时间戳；Ban retry-to-green；Ban 记 flake——与 B'' `harness/gap-uc025-neg-real-wiring.md` EXIT 写法先例同构（EXIT1-before / honest-EXIT0-after / EXIT0≠covered≠nail≠SSOT flip）；EXIT1 例示竟含「NaN 在真 PG 列上未 fold 同口」= 对 PG 层 NaN 可达性风险的诚实预留（见 C-2） | MET |
| 8 | EXIT0 ≠ covered ≠ 翻行 | harness/slice/stub 三处一致：FAULT 列 stays gap · row stays gap · NEG frozen · BOUND gap · ADV blind · coveredCount=**8**；翻列须 post-prove dual PASS + 协调方 nail · Ban self-nail；UC-025 行 stays AA nail 后现状（与 SSOT `e2e-requirement-coverage-matrix.md:125` 现状逐项吻合） | MET |
| 9 | 禁碰清单 | AA proof/script/harness/slice/receipt 冻结 · B'' NEG proof + 前 W BOUND proof 冻结 · SSOT 四文件本 REQUEST 零触碰（diff 证实）· UC-018/052/004/014/026/002/011 不碰 · 产品码本 turn 零编辑 · 回归钉（授权 prove 时同 tip `uc025:nhp-neg:prove`+`nhp-bound:prove`+`nhp-fault:prove` 仍 EXIT0 · Ban 改三者迁就） | MET |
| 10 | Pins 原值 | 8 项（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503）在 stub/harness/slice 三文件逐字一致，与 SSOT 现值一致 | MET |
| 11 | 真实 HTTP 分界 | 「真实 Nest app（createApp from src/main）真控制器真管道真 fetch——非直调 service」写为与 AA in-process 的分界线；`MODEL_API_KEY`/`MODEL_BASE_URL` 删除先例 K harness；无 fake-green 面引入（正控 F3 专防「带 quiz-id 一律拒」过宽假绿） | MET |
| 12 | 引用事实抽查 | AA 双审 `c674cb5`（mw-e2e-ha POST-PROVE PASS）+ `42b9834`（mw-rag-route）存在 · pre-wire `fe411fa` 存在 · prove tip `3a6ec52` 祖先在 · 前 W BOUND nail `2af0640` 存在 · `0135_resume_quiz_freshness_anchor.sql:6` `ALTER TABLE resume_quiz ADD COLUMN IF NOT EXISTS expires_at timestamptz;` 逐字在 | MET |

## 互补裁决（mw-e2e-ha 裁定）

**AA in-process（`a8b98fc`/`3a6ec52`，nail `15eedd6`）与本刀隔离面（拟 `GAP-UC025-FAULT-ISOLATED-01`）= 互补不互替，边界已写死，授权依据引用真实。** 依据：AA harness/proof 自证「in-process ≠ isolated Postgres/HTTP E2E ≠ covered · PG/HTTP-level FAULT → separate knife」——AA 自己的条款把隔离面留给 separate knife，本刀 = 接刀，非重跑、非替代、非洗 AA。双向 Ban 在案：Ban 借 AA in-process 收据关本 gap / Ban 借本刀隔离面 EXIT0 洗 AA 收据为已足够；两份收据各证各层（AA 钉服务逻辑判据：错误码/NaN 同口/顺序/C-1 supersede；本刀证同一判据在真 HTTP 管道 + 真隔离 PG 复现），任一绿均不自动关对方。**裁决：互补关系成立， 本刀放行进入双审待齐状态。**

## Fail-trigger audit（本审触发的 FAIL 条件盘点 — 均未触发）

1. 洗 AA / 借 AA 关 gap / 冒充隔离面 —— 未发现（双向 Ban 在案，引用逐字核对一致）。
2. 判据漂移 / 发明新验收标准 / F1↔F4 语义互换 —— 未发现（与代码 `:222`/`:239`/`:242` 及 AA 钉死表逐项一致）。
3. EXIT 契约留假绿口（retry-to-green 合法化、flake 洗白、EXIT0=covered）—— 未发现；F3 正控 + 零副作用快照 + 三层壳证据均入 EXIT0 必要条件。
4. SSOT / 既有 proof / 兄弟行触碰 —— 未发现（diff 仅 4 新增 md）。
5. Pins 翻值 —— 未发现（三文件 + SSOT 一致）。

## Blockers

无。

## Conditions（放行所附 · 授权 coding 后 prove 前 MUST 兑现；违反任一 = post-prove 审 FAIL trigger）

- **C-1 种子前置显式化**：F1/F2/F3/F4 的隔离 PG 种子行必须 `resume_quiz.status='ready'`（否则 NEG 块先抛 `stale_quiz`，观察面错守卫）。prove 输出须打印种子 status；F1/F2 若观察到 `stale_quiz` 即 = 假绿，判 FAIL 不判 PASS。
- **C-2 NaN 真 PG 可达性诚实**：`expires_at` 为 `timestamptz` 真列（0135），物理不可存「不可解析日期」；F2 须用真实可存且经驱动解析后 `Date(...).getTime()` 为 NaN 的值（如 PG `'infinity'` 族，视驱动解析实测），prove 输出须打印注入原值与解析后值。若真列上确实不可达 NaN 同口，唯一诚实路径 = **EXIT1** 保留 `GAP-UC025-FAULT-ISOLATED-01`（harness 已预留此例），Ban 降级回 in-process 冒充隔离面绿、Ban 弱化 F1 主断言。
- **C-3 锚列入隔离 schema 的证据**：现行 `_neg-harness.ts:65` 白名单经 `sql/20_resume_quiz.sql` 重放镜像（`:15` 含锚列）得 `expires_at`，`migrations/0135` 非独立条目——新 proof 必须打印隔离 schema 内锚列实测（列名/类型 `timestamptz`）证明判据打在真列上，无论走镜像或直跑 0135；Ban 静默假设。
- **C-4 F3 sentinel 显式钉死**：正控观察值须在 prove 前写死（越 FAULT 后到达的下一守卫/哨兵，如 BOUND 种子下 `resume_version_mismatch` 或 bind sentinel），断言形 = 错误 ≠ `missing_quiz_expiry` 且 ≠ `stale_quiz`；F3 观察 `stale_quiz`/`missing_quiz_expiry` = FAIL。
- **C-5 F5 行为不变观察值显式化**：无 quiz-id begin 的「行为不变」须落为具体 before/after 观察（与接线前基线一致路径 + 快照零副作用），不得以「没抛 FAULT」空转充数。
- **C-6 双审齐 + 顺序不变**：本 PASS 仅 mw-e2e-ha 单签；mw-privacy-int（或按 harness 规则改 `mw-rag-route` 并在 stub 说明理由）另行审签后方为 dual；pre-exec dual PASS ≠ coding，coding 仍须协调方明确授权；prove 后 post-prove dual 用新文件（never overwrite 本 stub）。

## 三行中文摘要

1. REQUEST `b0242bf`≡`43322e5c` 同补丁、祖先核实在、docs-only（4 新增 md、零代码零 SSOT）；AA「PG/HTTP-level FAULT → separate knife」授权依据逐字属实，互补不互替双向写死，本刀 = 接刀非洗刀。
2. F1–F5 判据与 AA 钉死原值及真实代码（`missing_quiz_expiry` `:239`/NaN 同口 `:242`/过去锚 `stale_quiz` `:222`/无 quiz-id 跳过/正控防过宽）零漂移；实现方对协调方歧义的纠正（NULL→`missing_quiz_expiry` 非 `stale_quiz`）核实为正确；EXIT 契约（EXIT0 当且仅当隔离面全断言、attempts 全记录、Ban retry-to-green、EXIT0≠covered≠翻行）与 B'' 先例同构、诚实。
3. 无 Blockers；附 C-1~C-6（ready 种子显式化、NaN 真 PG 可达性诚实 EXIT1 预留、锚列证据、F3 sentinel 与 F5 观察值钉死、双审齐后由协调方另授 coding）；coveredCount=8、UC-025 行/FAULT 列 stays gap 原值不动；mw-privacy-int 另行审签，本人不代签。

Verdict: PASS

---

# POST-PROVE DUAL REVIEW — mw-e2e-ha（append-only · 2026-10-02 审 · 审的包 = coding `cce1980b` + receipt `f2ef22f7` @ `line/w-uc025-fault-isolated` · REQUEST `b0242bf`）

**Reviewer**: `mw-e2e-ha`（adversarial evidence-honesty）· 只签本人，**不代签 mw-privacy-int**（其 post-prove 审并行进行，本审看不到也不看）· alone ≠ dual · 本 PASS ≠ coding ≠ prove ≠ nail ≠ covered ≠ HA。
**审查基础（worktree）**：`/Users/miaole/Desktop/golucky/meetwise-rv-wp-e2e-ha`（branch `rv/wp-e2e-ha`）。**位置事实纠正**：任务书称 origin tip `3fb7ba50` 已含被审包——git 实况核实：origin tip 只含 REQUEST（`b0242bf`≡`43322e5c` 同补丁）+ pre-exec 双审（`69be76c9`/`3fb7ba50`）；**coding `cce1980b` 与 receipt `f2ef22f7` 仅在 `line/w-uc025-fault-isolated`**。本审按实况把 worktree 重置到交付树 `f2ef22f7` 审查与 fresh re-run，包内容与任务书所指逐字节同一（`cce1980b`/`f2ef22f7` 即被审 SHA）。pre-exec PASS 段自 origin tip 恢复入本文件后追加本段（append-only，合并后为全集）。

## 一、包完整性（命令 + 可复现证据）

- coding `cce1980b` 恰 **4 文件**：`apps/api/test/uc-e2e-025-nhp-fault-isolated.proof.ts`（新增 374 行）+ root `package.json`（+2 注册）+ `apps/api/package.json`（+1 注册）+ `scripts/run-e2e-isolated.mjs`（+14/−2：allowlist+dispatch+isolatedReceiptSources+migrate 名单）；`git diff --name-status b0242bf f2ef22f7` 全树仅此 4 文件 + 2 个 receipt 文件。
- **零 diff 核验全过**：AA in-process `uc-e2e-025-nhp-fault.proof.ts`、`_neg-harness.ts`、UC-018/052/004/014/026/002/011 各 proof、SSOT 四文件（e2e-requirement-coverage-matrix / non-happy-path-perf-load-case-matrix / gap-bug-backlog / execution-master-checklist）——`git diff --quiet b0242bf f2ef22f7 -- <f>` 全静默。

## 二、FRESH RE-RUN（C-DUAL-FROM-FRESH · 恰一次 · 禁重试遵守）

- `pnpm install --frozen-lockfile` → **EXIT=0**（Done in 15.7s · pnpm v10.18.0）。
- `pnpm uc025:nhp-fault-isolated:prove` **恰跑一次 → EXIT=0**；`SUMMARY asserts=22 failed=0`（fresh log：worktree `.tmp-rv-prove-fresh.log` 行 81；`CMD=pnpm uc025:nhp-fault-isolated:prove EXIT=0` 行 92）。容器 `meetwise-e2e-8295-1791261787174`（随机名 · PG `127.0.0.1:50722`）· `migrations: applied=136 skipped=0`（含 `0135_resume_quiz_freshness_anchor`，ledger tail 逐项打印）· `app.listen(0)` 动态 HTTP 端口。
- fresh 观察值与实现方声称**逐项一致**：F1 409 `missing_quiz_expiry` / F2 409 同口（NaN fold）/ F3 409 `resume_version_mismatch` / F4 409 `stale_quiz` / F5a 202+`accepted:true`+jobId / F5b 409 `interview_not_active`；零 FAIL、零 WRONG_GUARD。
- **回归钉独立复现**（本审 worktree 同树另跑三脚本，非 retry 本刀）：`uc025:nhp-neg:prove` EXIT=0 · `uc025:nhp-bound:prove` EXIT=0 · `uc025:nhp-fault:prove` EXIT=0 —— 实现方 3 行裸 EXIT log 由此补强为独立复现。

## 三、REWORK 裁决（关键项 · 逐条证据实读）

1. **attempt-1 壳缺陷属实**：实读实现方 worktree `.tmp/prove-fault-isolated-1.log`——EXIT1（structured receipt `exitCode:1` · container `meetwise-e2e-99965-1791259498574`）；`error: column "resume_privacy_epoch" does not exist`、`code 42703`、`routine errorMissingColumn`，崩于 F1 before-snapshot（**任何 F1–F5 断言未及执行**）；同 log `MIGRATION_WHITELIST sql=[23_api_gateway.sql]` + `FAIL L3 migration whitelist includes resume_quiz table` 证实前任 L3 回读正则假红（只抓到带扩展名的引号串）。部分白名单壳承载不了 begin 路径 = 结构性缺陷，证据与 receipt「Attempt-1 缺陷与修正」三条根因逐条吻合。
2. **换壳 = 加严（非等强降格）**：新壳 = runner 全迁移链（fresh 复现 applied=136 ⊇ 旧白名单 01–22+0037/38/39/0046+23 共 27 项）+ **旧壳没有的** `assertIsolatedTestTarget`（loopback+nonce 防误连 attestation）+ `provisionRuntimeLogin`（NOINHERIT app_role · 请求路径 RLS · 无 bypass）+ 真 Nest `createApp`+`app.listen(0)`；注册走同族 begin-path 刀既定先例 `uc001:nhp-neg/bound:prove:raw`（runner migrate 名单 diff 同列核实）。观察面更大 + 权限收敛 = **加严**，本审裁定成立。
3. **「F1–F5 断言逐字节未动」裁决**：前任 draft（331 行 · attempt-1 receipt 记录 digest `sha256:cb330e74…`）**未入库且已被覆盖** → 全量 byte-diff 客观不可复现（诚实披露，见 Conditions-3 流程债）。可观测证据全部吻合：attempt-1 log 中 draft 的 F1 块头「── F1 missing anchor (NULL expires_at) · main assertion ──」及 L0/L1/L2/C-7/C-1/C4 断言文本、种子值、C4 探针输出格式与终稿逐字节一致；唯一可见断言区差异 = 已披露的 L3 回读改 `schema_migrations` 台账（**改后更严**：观测真库 applied 台账而非源码文本回读）；attempt-1 崩溃早于一切 F1–F5 断言执行 → **不存在红改绿洗白空间**。attempt-2 receipt 的 proof digest `c4ac55e7…` == 提交文件 sha256 == 本审 fresh re-run 所跑文件，**三方一致**（attempt 2 跑的就是提交代码）。
4. **`_neg-harness.ts` 零编辑核实（强于 git diff）**：attempt-1 与 attempt-2 两份 structured receipt 中 `_neg-harness.ts` digest 同为 `sha256:7687c5a9…` == 提交树文件 == 本审 worktree 文件——两次 attempt 之间该共享壳从未被改，REWORK 声称「共享壳不背本刀修复」属实。
5. **披露完整性**：proof 头注 CONTINUATION REWORK 块（proof.ts:16–33）+ receipt「接棒盘点」「Attempt-1 缺陷与修正」「Attempts 台账」三处，逐条与原始 log/receipt 证据吻合；attempts 全记录（1=EXIT1 · 2=EXIT0）、无 retry-to-green、无 flake 标签。**REWORK 裁决：成立（有错如实修正 · 披露完备 · 判据未动 · 壳加严）。**

## 四、断言抽查（proof.ts file:line × fresh 输出）

| 断言 | 源 | fresh 观察 | 裁决 |
|----|----|----|----|
| F1 主断言 409+零副作用 | proof.ts:266–270 | `{"status":409,"body":{"error":"missing_quiz_expiry"}}`；before/after 快照逐字节同（interview 未绑/额度 0/队列 0/quiz 原样） | PASS |
| F2 NaN fold 打印原值+解析值 | proof.ts:234–239, 281–285 | `C4_NAN_PROBE injected_raw(pg::text)=infinity parsed=number(Infinity) newDate.getTime()=NaN Number.isNaN=true` → 409 同口 | PASS |
| F3 sentinel 钉死 | proof.ts:290–291 注释 + 301–302 断言（观察到 stale_quiz/missing_quiz_expiry 即 FAIL） | 409 `resume_version_mismatch` + 零副作用 | PASS |
| F4 顺序 intact | proof.ts:314–318 | 409 `stale_quiz`（NEG→FAULT→BOUND 序不破）+ 零副作用 | PASS |
| F5a/F5b 观察值 | proof.ts:331–351 | F5a 202+jobId+resume 绑定+恰 1 consumption `1.00/reserved`+恰 1 start job+quiz 零触碰（would-fail NULL 工件在场）；`F5_DISCLOSURE` 打印；F5b 409 `interview_not_active`+快照逐字节同 | PASS |
| 锚列内省（C-7） | proof.ts:187–195 | `ANCHOR_COLUMN … "data_type":"timestamp with time zone","udt_name":"timestamptz"` + ledger 0135 在 tail + mirror 静态锚 | PASS |

## 五、条件裁决（pre-exec C-1~C-6 · 按任务映射，括注本审 pre-exec 原编号）

| 条件 | 证据 | 裁决 |
|------|------|------|
| C-1 种子显式化（=pre-exec C-1） | fresh log SEED×5 全 `status=ready` 逐行打印；F1/F2 观察 `missing_quiz_expiry` 非 `stale_quiz`（wrong-guard 未触发） | MET |
| C-2 owner-scope 不 widen | 全部种子单 principal `U`（proof.ts:206–225 `owner_user_id=$1`）；begin 全走 `x-user-id: U`（:254）；无跨用户 replay 断言；ADV 排除 | MET |
| C-3 dev 回退披露 | `IDENTITY_DISCLOSURE` 打印（proof.ts:142）+ receipt「身份（C-3）」段：dev/test 身份语义 ≠ 生产授权面 · isolated green ≠ production-authz proof | MET |
| C-4 NaN 诚实（=pre-exec C-2） | `'infinity'::timestamptz` 真可存值；injected+parsed+getTime+isNaN 全打印；真列 NaN fold 确认可达；EXIT1 预留未触发、无 in-process 降级 | MET |
| C-5 F3 sentinel 钉死（=pre-exec C-4） | sentinel 于 prove 前写死在源（proof.ts:290–291）+ 断言形 = ≠missing_quiz_expiry 且 ≠stale_quiz（:298–302）；fresh 观察 pinned 值 | MET |
| C-6 F5 观察值（=pre-exec C-5） | F5a/F5b 具体观察值全落（上表）；F5a 按 C-6 叙事为「行为不变」证据而非零副作用，F5_DISCLOSURE 显式披露 | MET |
| （pre-exec C-3 锚列证据 → proof C-7） | 内省 + 台账 + mirror 三重证据（上表末行） | MET |
| （pre-exec C-6 双审齐） | 本审仅 mw-e2e-ha 单签；mw-privacy-int 并行另审，不代签 | 进行中（非本审 blocker） |

## 六、其他发现（不构成 blocker）

1. **包位置偏差**：coding/receipt 未在 origin tip（仅 line/w 分支）——协调方合并时需注意；包内容与任务书所指 SHA 逐字节同一，不影响裁决。
2. **回归 log 过简**：实现方 `regression-uc025-1.log` 仅 3 行裸 EXIT（无命令回显/时间戳）——本审已独立复现三脚本 EXIT=0 补强。
3. **流程债（Condition 落条）**：前任 draft 未先 commit 再 rework，导致「断言逐字节未动」只能以可观测证据链而非全量 byte-diff 证实——建议后续 continuation/rework 一律先 commit（或 stash）半成品再动，保 byte-diff 可复现性。
4. **格式瑕疵（不扣分）**：`EVIDENCE C4-NAN-PROBE` JSON 中 `"getTime":null` 系 `JSON.stringify(Infinity)→null` 序列化惯性；诚实值为同行 console 文本 `newDate.getTime()=NaN`，无隐瞒意图。

## Blockers

无。

## Conditions（随 PASS 放行 · 不改判）

1. EXIT0 = 隔离面 case 级证据 ≠ covered ≠ nail ≠ 翻行 ≠ HA；row stays gap · FAULT 列 stays gap · coveredCount=8 原值（receipt JSON pins 已核）。
2. 与 AA in-process 收据互补不互替（双向），任一不洗另一；`GAP-UC025-FAULT-01` 语义不动。
3. 流程债整改：后续 rework 前先固化半成品 commit（见六.3）。
4. 包合并入 origin 由协调方执行；mw-privacy-int post-prove 另签后方为 dual。

## 三行中文摘要

1. fresh re-run 恰一次 `pnpm uc025:nhp-fault-isolated:prove` **EXIT=0**（22/22 · applied=136 含 0135 · 容器随机用毕即毁），F1–F5 观察值与声称逐项一致，回归三连在本审 worktree 独立复现全 0；REWORK 裁决成立：attempt-1 42703 壳缺陷证据实读、换壳=加严（全迁移+RLS 运行登录+防误连 attestation）、attempt-2 所跑文件 digest 与提交文件三方一致、`_neg-harness.ts` 两 attempt digest 相同证零编辑。
2. 「F1–F5 断言逐字节未动」：draft 未入库致全量 byte-diff 客观不可复现（已诚实披露为流程债），但可观测证据（attempt-1 log 中断言文本/种子/C4 格式逐字节一致 + 崩溃早于一切 F1–F5 执行 + 唯一改动 L3 改后更严）支持该声称，无红改绿洗白空间。
3. C-1~C-6 全 MET（种子 ready 显式化 · owner 单主不 widen · dev 回退披露 · NaN 真列可达且打印链完整 · sentinel 钉死 · F5 具体观察值）；SSOT/AA/NEG/BOUND/UC 兄弟 proof 零触碰；Blockers 无；mw-privacy-int 并行另签，本人不代签；coveredCount=8 与 row/FAULT stays gap 原值不动。

Verdict: PASS
