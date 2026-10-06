# Harness — **GAP-UC025-FAULT-ISOLATED-01 · UC-025 FAULT isolated PG/HTTP evidence**（Line W · NAIL · **`post_prove_dual_pass`** · row stays gap · FAULT column stays gap · coveredCount=8）

**Status**: **`post_prove_dual_pass`**（Line W nail · isolated PG/HTTP FAULT evidence only · prove EXIT=0 · dual BOTH PASS · **EXIT0 ≠ covered** · complementary≠substitute AA · **AA_WASH: no** · 409 `missing_quiz_expiry` not washed · AA nail `15eedd6` / in-process `a8b98fc`/`3a6ec52` retained as complementary · attempts1–4 EXIT1 retained · Ban retry-to-green wash · row stays **gap** · FAULT column stays **gap** · coveredCount=**8** · Ban invent covered · Ban flip row/FAULT off gap · Ban HA/suite green · Ban coding · Ban live · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban self-approve beyond this authorized nail）

> **REQUEST/prove-era note（historical · retained）**: this file began as REQUEST `draft:awaiting_pre_exec_dual` → prove `post_prove_awaiting_dual`. Prove tip **NAILED TO** `e8d8a919a4f1a6da8e2879a09d429653fd849705` · CODE **`cce33ba9359ee040cf7cffa661cbb2477a1ed694`** · REQUEST `43322e5c2686b3daaf1e66a255184ac8ca74c6b9`（`b0242bf` missing on origin → use 43322e5）· CMD `pnpm uc025:nhp-fault-isolated:prove` **EXIT=0**（HTTP **409** `missing_quiz_expiry` · F1–F5 · three-layer isolated shell）· attempts1–4 EXIT1 honest retained · attempt 4b `e7b9ba2` same-SHA another EXIT1（privacy OPEN ledger）· post dual mw-e2e-ha `c55253b` + mw-privacy-int `1fc6623` BOTH PASS. Lifecycle advanced to **`post_prove_dual_pass`** by Line W nail only.
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · g7SuiteGreen=false
**Date**: 2026-10-05（Line W REQUEST · coordinator-prioritized #2）
**Base / written at**: `origin/feat/mysql-schema-skeleton` **`44154aa5`** / full `44154aa53a8c8508e8e8b1c51333c648187ac360`（AA nail `15eedd6` 之后 · not a prove tip）
**Knife**: **GAP-UC025-FAULT-ISOLATED-01**（W — 把 UC-025 FAULT 证据升到**隔离 PG + 真实 HTTP** 层；AA 线 `15eedd6` 只钉 in-process 层；本刀产出与 AA **同判据但隔离面**的证据）
**Gap id**: **`GAP-UC025-FAULT-ISOLATED-01`**（本刀新具名 · **不**改名 AA `GAP-UC025-FAULT-01` · **不**改名 B'' `GAP-UC025-NEG-01` · **不**改名前 W `GAP-UC025-BOUND-01`）
**Case id**: **`NHP-025-FAULT-01`**（同一 case 的**证据层升级**，不新开 NHP case 行 · 不编辑 NHP 矩阵 status 行——登记留 nail）
**Row**: **`UC-E2E-025`** FAULT 列（证据面升级）· not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-004 · not UC-E2E-014/026 · not UC-E2E-002 · not UC-E2E-011
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（stubs PENDING · Ban self-approve · alone ≠ dual；选 `mw-privacy-int` 理由：quiz 锚点涉 privacy 授权域邻接——`resume_quiz` 为 owner-scoped 工件、begin 授权路径含 owner 检查、隔离 harness 走 `x-user-id` dev 回退面；若 privacy-int 审后判纯 commerce/E2E 可改 `mw-rag-route` 并在 stub 说明理由）
**Authority**: meetwise — Line W NAIL AUTHORIZED（docs/SSOT honesty only · Ban coding）· Ban secrets / `.env*` · Ban force-push · Ban wash AA · Ban invent covered / coveredCount bump · Ban flip row/FAULT off gap · Ban live · Ban buy cloud · Ban Meridian

## One-line

AA 线 `15eedd6` 已 nail `NHP-025-FAULT-01`（**409 `missing_quiz_expiry`** fail-closed · code `a8b98fc` · prove tip `3a6ec52` · post dual `c674cb5`+`42b9834` PASS），但 AA 的 prove 是 **in-process**（进程内 `InterviewService.begin` + recording fake DB · 无 PostgreSQL · 无网络 · 无真实 HTTP）——AA harness/proof 自证「**≠ isolated Postgres/HTTP E2E** · **≠ covered** · PG/HTTP-level FAULT → **separate knife**」。本刀 = 该 separate knife：新增隔离面 FAULT prove（拟 `pnpm uc025:nhp-fault-isolated:prove`）——真实 HTTP 注入（stale-quiz 场景族：缺锚/NaN 锚 → begin **409 `missing_quiz_expiry`**）+ DB before/after 快照 + 三层隔离壳（随机容器/动态端口/迁移白名单）。**与 AA in-process 证据互补不互替**；Ban 洗 AA 的 in-process 证据为已足够；Ban 翻 UC-025 行（stays AA nail 后现状：row gap · FAULT 列 gap · NEG frozen · BOUND gap · ADV blind）。

## AA in-process 证据面事实（原值引用 · 不洗不改）

AA nail commit `15eedd65658c370f91cca5a55a86b76bdaa60a98`（`docs(delivery): NAIL NHP-025-FAULT-01 … post_prove_dual_pass`）：

- **code**: `a8b98fcaaa8c314fd8e25437ff015f59dce05d93` · **prove tip NAILED TO**: `3a6ec52195bbde8bd56cae10e48346391cee116d` · CMD `pnpm uc025:nhp-fault:prove` **FAULT EXIT0**
- **HTTP/error pin**: **409 CONFLICT · `{ error: 'missing_quiz_expiry' }`** · NULL/NaN fail-closed · C-1 **supersede**（窄保留 NULL≠`stale_quiz`；缺锚→409）
- **post dual BOTH PASS**: mw-e2e-ha `c674cb543fa93f849d84224074c5a69fb68a741e` + mw-rag-route `42b98343faf338435c6297b3744d7b108490c57f` · pre-wire `fe411fa` **EXIT1** honest retained
- AA proof `apps/api/test/uc-e2e-025-nhp-fault.proof.ts` 头注原值：*「Evidence layers (both must pass) — harness choose-one: **in-process** (NOT isolated three-layer shell)… R — in-process run of the real InterviewService.begin against a recording fake DB client (no PostgreSQL, no network, no model, no secrets)… Ban narrating this as isolated PG/HTTP E2E or covered.」*
- AA harness 原值：*「**Evidence layer**: in-process `InterviewService.begin` + fake DB · **≠ isolated Postgres/HTTP E2E** · **≠ covered** … PG/HTTP-level FAULT → **separate knife**.」*
- AA C-1 supersede 披露原值（harness「旧工件」行）：*「0135 前缺锚工件须经迁移/回填 `expires_at` 后方可 begin；未回填 → 预期拒绝（本刀披露）」*——该「预期拒绝」当时只有 in-process 证据，**隔离面收据由本刀补**。

**结论**：AA 自己的条款把 PG/HTTP 隔离面留给 separate knife = 本刀。Ban 把 AA in-process 收据叙事成隔离/covered/Ban 说「已足够」；**两份收据互补不互替**——AA in-process 钉死服务逻辑判据（错误码/顺序/C-1 supersede/NaN 口径），本刀证明同一判据在**真实 HTTP 管道 + 真实隔离 PG**（`expires_at timestamptz` 真列 · `0135_resume_quiz_freshness_anchor.sql:6`）上复现。Ban 用任一 wash 另一。

## 产品事实基线（读真实代码 · @`44154aa5` · 本刀 Ban 编辑）

- `apps/api/src/modules/interview/interview.service.ts:239`：`throw new HttpException({ error: 'missing_quiz_expiry' }, HttpStatus.CONFLICT)`（FAULT 独立块）；`:210` 注释：C-1 窄保留 NULL≠stale_quiz · AA 已 supersede 放行语义→独立块 fail-closed；`:228` 注释：NaN fold 入同口；抛点先于 resume bind / `reserveEntitlement` / `enqueueInterviewJob`。
- 顺序（AA 钉死冻结）：NEG `stale_quiz`（`:209` 起）→ FAULT `missing_quiz_expiry`（`:239`）→ BOUND `resume_version_mismatch`；无 quiz-id 整块跳过。
- 锚列：`packages/db/migrations/0135_resume_quiz_freshness_anchor.sql:6` `ALTER TABLE resume_quiz ADD COLUMN IF NOT EXISTS expires_at timestamptz;`（工件表 `0007_resume_quiz.sql` / `sql/20_resume_quiz.sql`）。

## 隔离面 prove 设计（授权后才 coding · 本 REQUEST 一个代码行都不加）

- **拟 CMD**：`pnpm uc025:nhp-fault-isolated:prove`（拟名 · 授权后才注册；Ban 本 turn 改 `package.json`）。
- **三层注册先例**（K 线 `uc014:webhook-adv:prove` @ root `package.json:148-149`）：root `:prove` → `node scripts/run-e2e-isolated.mjs uc025:nhp-fault-isolated:prove:raw` → `pnpm -C apps/api prove:uc025-nhp-fault-isolated`。
- **三层隔离壳**（先例 `scripts/run-e2e-isolated.mjs` 头注 + K 线 proof 头注）：
  1. **随机容器**：每次运行新建 `meetwise-e2e-*` 独立容器，壳只删自建容器，**绝不触碰开发数据库/开发容器**；
  2. **动态端口**：PG 与 API 均动态端口（`app.listen(0, '127.0.0.1')` 先例 `apps/api/test/_neg-harness.ts:89`）；
  3. **迁移白名单**：schema 由固定迁移白名单加载（`_neg-harness.ts` boot() `01_schema`…`22_interview_invitation` 先例，含 `20_resume_quiz` + `0135` 锚列），`assertIsolatedTestTarget(db.pool)` 防误连开发库。
- **真实 HTTP**：真实 Nest app（`createApp` from `src/main`）真控制器真管道真 fetch——**非直调 service**（这是与 AA in-process 的分界线）。`MODEL_API_KEY`/`MODEL_BASE_URL` 删除（负路径不触付费 provider，K 线 harness 先例）。
- **注入表（FAULT 隔离面 · 判据 = AA 钉死口径，不发明新验收标准）**：

| id | 注入什么 | 注入在哪 | 观察什么 |
|----|----------|----------|----------|
| **F1 缺锚（主断言）** | begin 带 `quiz-id`、源押题 `expires_at` **IS NULL**（stale-quiz 场景族：锚缺失/未回填旧工件） | 真实 HTTP begin（隔离 PG 内 owner-scoped 工件行） | **409** + body `{ error: 'missing_quiz_expiry' }`（≠`stale_quiz` ≠`resume_version_mismatch`）+ **DB before/after 快照零副作用**：interview 未建、额度未扣（先于 reserve）、队列未入 |
| **F2 NaN 锚** | `expires_at` 为不可解析/非法日期（解析 NaN） | 同 F1 | 同 **409 `missing_quiz_expiry`**（NaN fail-closed fold 同口，AA 钉死）+ 零副作用快照 |
| **F3 正控（防过宽假绿）** | 新鲜非空合法锚 | 同 F1 | 越过 FAULT 守卫（到下一守卫/sentinel）——证明 F1/F2 不是「带 quiz-id 一律拒」 |
| **F4 顺序控制** | 过去时点锚 | 同 F1 | `stale_quiz`（NEG 块逐字节冻结 · 顺序 NEG→FAULT→BOUND 冻结）；`resume_version_mismatch` 仅作 BOUND 面非回归观察，非本刀断言对象 |
| **F5 无 quiz-id** | begin 不带 quiz 工件标识 | 同 F1 | FAULT 块整跳过、行为不变（AA 钉死「无 quiz-id → 整块跳过」） |

- **C-1 supersede 隔离面价值**：F1 = 「0135 前旧工件未回填 → 预期拒绝」在真实 PG/HTTP 层的收据（AA 仅 in-process）。
- **ADV 边界（Ban widen）**：跨用户 replay quiz id = NHP 序 #4 ADV、非本刀；owner-scope 仅作 disclosed-not-blocking 观察（owner 检查路径旁证），Ban 把它算成本刀断言、Ban 借它关 ADV。
- **回归（授权 prove 时 · 同 tip）**：`pnpm uc025:nhp-neg:prove` + `pnpm uc025:nhp-bound:prove` + `pnpm uc025:nhp-fault:prove` 仍 **EXIT0**；任一回归 = FAIL；**Ban 改 NEG/BOUND/AA-FAULT 三脚本迁就**。

## Prove EXIT 契约（含诚实保留路径）

- **EXIT 0 当且仅当隔离面全部断言成立**：F1–F5 每项断言 + DB before/after 零副作用快照 + 三层壳隔离证据（随机容器/动态端口/迁移白名单）全部通过。
- **EXIT 1 = 诚实保留 gap**：任一做不出/断言不成立（例：真 HTTP 上错误码漂移、NaN 在真 PG 列上未 fold 同口、顺序漂移、隔离壳起不来）。prove 须打印 `GAP-UC025-FAULT-ISOLATED-01` 明细（哪断言未证 · file:line 依据），如实落 receipt。
- **attempts 全记录 · Ban retry-to-green**：每次 prove attempt（含中断/失败）逐次记录 EXIT 与时间戳；不得只留绿色 attempt 或循环重跑至绿；Ban 把 EXIT1 记成 flake/环境问题。
- **EXIT0 ≠ covered ≠ nail ≠ 翻行**：EXIT0 只是隔离面 case 级证据；**FAULT 列 stays gap**、row stays gap、coveredCount=**8** 不动；翻列须 post-prove dual PASS + 协调方授权 nail，implementer Ban self-nail。
- 本刀收据与 AA in-process 收据**互补不互替**：绿其一不绿另一、或两绿，均不自动关 `GAP-UC025-FAULT-01` / `GAP-UC025-FAULT-ISOLATED-01` 之外任何行。

## Receipt 落点

- 隔离面 prove receipt：`ai-docs/delivery/receipts/2026-10-<D>-gap-uc025-fault-isolated-prove.md`（dated at run time · prove 全输出 · EXIT 值 · F1–F5 逐项 · DB 快照 · attempt 台账）；结构化证据另附同名 `.json`。
- post-prove dual（新文件，**never overwrite** pre-exec stubs）：`reviews/REQUEST-2026-10-<D>-gap-uc025-fault-isolated-post-mw-e2e-ha.md` / `…-post-mw-privacy-int.md`（或 rag-route，按双审裁决）。
- pre-exec dual 落在本刀两个 REQUEST stubs 上（PENDING stubs **append 不改写**——2026-10-02/06 stubs 先例）。

## 禁碰清单

1. **AA 已 nail 的 in-process proof 零改动**：`apps/api/test/uc-e2e-025-nhp-fault.proof.ts`、script `prove:uc025-nhp-fault` / `uc025:nhp-fault:prove`、AA harness `harness/nhp-025-fault-01-missing-expiry-fail-closed.md` + slice + receipt `receipts/2026-10-06-nhp-025-fault-01-missing-expiry-fail-closed-prove.md`——ruler 冻结。
2. **B'' NEG proof** `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` + 前 W **BOUND proof** `uc-e2e-025-nhp-bound.proof.ts` 冻结（Ban 迁就）。
3. **SSOT 零触碰**：`e2e-requirement-coverage-matrix.md` / `non-happy-path-perf-load-case-matrix.md` / `gap-bug-backlog.md` / `execution-master-checklist.md` 本 REQUEST 一行不改（登记留 nail）。
4. **不碰** UC-E2E-018 / UC-E2E-052 / UC-E2E-004 / UC-E2E-014/026 / UC-E2E-002 / UC-E2E-011 任何行/文件（014/026 归 K 线 · 011 refund-callback 归 V 线后续）。
5. 产品码本 turn 零编辑（`interview.service.ts` / controller / contracts / migrations 全部只读）。
6. Ban secrets / `.env*`：隔离壳所需 secret 只经进程环境注入，值不入树不入 receipt；Ban force-push · Ban push · Ban self-approve · alone ≠ dual。

## Ban 列表

- **Ban coding**（本 turn docs-only）· **Ban prove 执行**（需 pre-exec dual PASS 后由协调方授权）· **Ban push**。
- **Ban 洗 AA in-process 证据为已足够**（in-process ≠ isolated ≠ covered；两份收据互补不互替）· Ban 重跑/改写 AA prove 冒充隔离面 · Ban 把隔离面 EXIT0 叙事成 AA 收据的替代。
- **Ban covered / Ban 翻行**：不写 covered、不翻 UC-025 行任何列、coveredCount 保持 8、Ban SSOT edit。
- Ban wash B'' NEG（frozen）/ 前 W BOUND（nailed 仍 gap）/ AA FAULT（nailed 仍 gap）。
- Ban invent a fix · Ban stub/布尔洗绿 · Ban 改任何既有 proof 正则/断言迁就 · Ban widen 到 ADV/REGEN · Ban 把 EXIT1 记成 flake。
- Ban secrets / `.env*` · Ban Meridian · Ban HA cloud buy · Ban force-push · Ban self-approve · Ban self-nail。

## Non-claims

docs REQUEST ≠ coding permission ≠ prove run ≠ nail ≠ covered ≠ HA。EXIT0（授权后）≠ covered ≠ 翻行。alone ≠ dual。本刀不关 `GAP-UC025-FAULT-01`（AA 的 gap id 语义不动），只新增隔离面证据与 `GAP-UC025-FAULT-ISOLATED-01` 具名。

## Pins

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE stays **503** · row stays gap · FAULT 列 stays gap · AA in-process 收据保留 · STOP

---

---

## Line W NAIL lifecycle（`post_prove_dual_pass` · 2026-10-06 · additive）

- Lifecycle on this harness/slice/receipt: **`post_prove_dual_pass`**.
- Prove tip NAILED TO: `e8d8a919a4f1a6da8e2879a09d429653fd849705`.
- CODE: `cce33ba9359ee040cf7cffa661cbb2477a1ed694` · REQUEST `43322e5c2686b3daaf1e66a255184ac8ca74c6b9` · CMD `pnpm uc025:nhp-fault-isolated:prove` **EXIT0** · HTTP **409** `missing_quiz_expiry` · F1–F5 PASS · Ban live · Ban buy cloud.
- **Evidence layer**: isolated three-layer shell + real Nest HTTP + real PG `expires_at timestamptz` · **complementary≠substitute** AA in-process · **AA_WASH: no** · 409 `missing_quiz_expiry` not washed · AA nail `15eedd65658c370f91cca5a55a86b76bdaa60a98` / code `a8b98fcaaa8c314fd8e25437ff015f59dce05d93` / prove `3a6ec52195bbde8bd56cae10e48346391cee116d` retained as complementary.
- Attempts honesty: attempts1–4 **EXIT1** retained · Ban retry-to-green wash · **attempt 4b** `e7b9ba2` same-SHA another EXIT1（container `756259` @ 04:32:02Z · privacy OPEN `NOTE-UC025-ATTEMPT-LEDGER-4b`）added to ledger · attempt5 EXIT0 @ `cce33ba` first green.
- OPEN non-blocking disclose: **NOTE-UC025-DEVHEADER-NODEENV-DISCLOSE**（`NODE_ENV` `<unset>` after boot · dual-gate still holds · Ban claim blocker）.
- POST dual BOTH PASS: mw-e2e-ha `c55253bbe5f46fa3475b733d7e5f955b150f1103` + mw-privacy-int `1fc66233b3136d1d0740fd3b9568f67673c1f267`.
- Receipt cross-ref: `receipts/2026-10-06-gap-uc025-fault-isolated-prove.md`.
- **STILL_GAP**: UC-E2E-025 **row** stays **gap** · **FAULT column** stays **gap** · EXIT0≠covered · coveredCount=**8** · canHonestlyFlip=**false** · NEG B'' CLOSED(wired) **frozen** Ban wash · BOUND W nail Ban wash · AA FAULT in-process Ban wash · ADV blind.
- Pins unchanged: NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · canHonestlyFlip=false.
- Keep siblings: Line AA FAULT in-process · Line W BOUND · Line Z/AB/AC/V/Y nails retained · Ban nail other lines this turn.

---

*Harness · GAP-UC025-FAULT-ISOLATED-01 · Line W NAIL · 2026-10-06 · lifecycle post_prove_dual_pass · prove tip e8d8a91 · CODE cce33ba · EXIT0 · 409 missing_quiz_expiry · AA_WASH: no · complementary≠substitute AA · post dual c55253b+1fc6623 PASS · row+FAULT gap · coveredCount=8 · Ban invent covered · Ban HA · Ban live · Ban buy cloud · releaseEvidence=false · STOP*

