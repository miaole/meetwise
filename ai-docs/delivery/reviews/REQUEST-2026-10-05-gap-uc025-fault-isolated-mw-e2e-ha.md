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
