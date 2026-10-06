# Docs-only · Line W pre-exec · GAP-UC025-FAULT-ISOLATED-01 · UC-025 FAULT 隔离 PG/HTTP 证据层

主审：`mw-privacy-int`  
日期：2026-10-06（约 12:20 CST / UTC+8）  
审查 tip（origin）：`5aae104` / `5aae10424277e68edb51c314b00e753e08a20d29`  
REQUEST commit（origin）：`43322e5` / `43322e5c2686b3daaf1e66a255184ac8ca74c6b9`（`docs(e2e): REQUEST UC-025 FAULT isolated layer (pre_dual)`）  
父提交：`a864084` / `a86408465c6e428367cc4c629f4ad2cc46b1f40b`  
Harness base 钉：`44154aa5` / `44154aa53a8c8508e8e8b1c51333c648187ac360`（REQUEST 文档内 Parent tip；本审以 origin 上 REQUEST 内容为准）  
Peer e2e PRE：`69be76c` / `69be76c9c3c7eb1ef2cc8ce2bdd4686c750487f2`（mw-e2e-ha PRE-EXEC PASS · **不代签 · 不编辑** · alone ≠ dual）  
**本审未跑任何 prove（含 `uc025:nhp-fault*` / isolated）。未起 Postgres / Docker。未改产品。未读 `.env*`。未触 Meridian。**  
**PASS ≠ coding 授权 ≠ prove ≠ nail ≠ covered ≠ HA。** alone ≠ dual。

SHA 解析：协调方 tip≈`43322e5`/`b0242bf`。本 box `git cat-file -t b0242bf` **不存在**；peer e2e 收据记 `b0242bf`≡origin `43322e5c`（同 patch-id `13fa9475af22405f16803ed42492996eb586a221`）。本审只审 origin 上 REQUEST = `43322e5c`。Mac-local 宣称 privacy-int PASS 的 `bfadcd66`：本 box `git cat-file -t bfadcd66` **missing**——**未** cherry-pick / 未采用；本收据为独立审签。

---

## Diff（docs-only）

`git show --stat 43322e5` / `git diff-tree --name-only -r 43322e5` 恰 **4** 文件，全在 `ai-docs/`：

| Path | Role |
|------|------|
| `delivery/gap-uc025-fault-isolated.slice.md` | slice |
| `delivery/harness/gap-uc025-fault-isolated.md` | harness |
| `delivery/reviews/REQUEST-2026-10-05-gap-uc025-fault-isolated-mw-e2e-ha.md` | peer stub（后由 `69be76c` append 填 PASS · 本审不改） |
| `delivery/reviews/REQUEST-2026-10-05-gap-uc025-fault-isolated-mw-privacy-int.md` | 本 stub→收据 |

无 `apps/` · 无 `packages/` · 无 `package.json` · 无 migration · 无 proof · 无 `.env*` · 无 SSOT 四件翻写。  
`git show --stat 43322e5`：`4 files changed, 244 insertions(+)`。

---

## 逐项 checklist（privacy lens · 审点 1–8）

### C1 · REQUEST docs-only — **PASS**

见 Diff。相对父 `a864084` 零产品 / 测试 / 迁移 / `package.json` 变更。本 turn 本审亦不写产品码、不跑 prove。

### C2 · quiz 新鲜度锚 · privacy 邻接 · 不触 PG-retained / UC-052 — **PASS**（邻接成立 · **不**走 escape hatch）

邻接三条（stub L25–29 · harness L11）与源码对得上：

1. **owner-scoped 工件**：`interview.service.ts:214` / `:232` `SELECT … FROM resume_quiz WHERE id=$1 AND owner_user_id=$2`（`principal`）——begin 路径含 owner 解析。
2. **身份回退面**：隔离壳 `U()` = `x-user-id`（`_neg-harness.ts:29` 注释 · `:134`）；生产硬闸见 C4。
3. **拒绝即无痕邻接**：F1/F2 要求 DB before/after 零副作用（interview 未建 / 额度未扣 / 队列未入）——harness 注入表 L50–51 · stub 审点 4。

**禁碰**：harness 禁碰清单 L79「不碰 UC-E2E-018 / **052** / 004 / 014/026 / 002 / 011」；Pins 保留 **PG-retained** · public DELETE **503**（harness L4 / L98 · slice L4 · stub L14–21）。本 REQUEST 零删除/擦除/checkpoint 物理清除面。SSOT `e2e-requirement-coverage-matrix.md:132` UC-050–052 stays **partial** · externals **`retention_pending`** · DELETE **503**——本 tip 未翻。

**Escape hatch**：邻接成立 → **不**建议改 `mw-rag-route`。纯 E2E 证据诚实已由 peer `mw-e2e-ha` 覆盖；本侧保留 privacy 授权域邻接审签。

### C3 · owner-scope 不 widen — **PASS**

- 产品查询已 owner 限：`interview.service.ts:214-215` / `:232-233` / BOUND pin `:256-257`。
- REQUEST：ADV 跨用户 replay = NHP 序 #4、**非本刀**；owner-scope 仅 disclosed-not-blocking 旁证（harness L57 · stub 审点 2）。Ban widen · Ban 借旁证关 ADV。
- F1–F5 注入表无跨用户断言（harness L48–54）。

### C4 · `x-user-id` 回退不外溢生产 — **PASS**

当前源（本 tip 树；REQUEST **零改** guard）：

| 闸 | file:line | 行为 |
|----|-----------|------|
| 双条件硬闸 | `apps/api/src/platform/principal.guard.ts:62-66` | 仅当 `AUTH_DEV_HEADER==='1'` **且** `NODE_ENV !== 'production'` 才读 `x-user-id`；否则 fail-closed `unauthenticated`（`:68`） |
| 头注释 | `principal.guard.ts:7` | 「x-user-id 头仅在 AUTH_DEV_HEADER=1(开发/测试)时作回退,生产禁用」 |
| CORS | `apps/api/src/main.ts:61-67` | 生产 `allowedHeaders` **不含** `x-user-id`（`isProd ? [] : ['x-user-id']`） |
| 隔离壳注入 | `_neg-harness.ts:44-45` | `AUTH_DEV_HEADER: '1'`；`U()` `:134` 仅组头 |

REQUEST 要求收据披露该回退 ≠ 生产授权面 · Ban 把隔离绿叙事成生产授权证明（stub 审点 3 · harness L11）。**未**拓宽回退条件。

### C5 · 拒绝即无痕快照 — **PASS**

- F1/F2：409 拒绝 + **DB before/after 零副作用**（interview 未建 · 额度未扣 · 队列未入）——harness L50–51 · slice L33 · stub 审点 4。
- 抛点先于 bind / `reserveEntitlement` / `enqueueInterviewJob`——产品注释 `interview.service.ts:228-229`（与 AA 同序）。
- disclosed-not-blocking ≠ 关 gap：观察缺席须如实披露（stub 审点 4）。准则在 REQUEST 内已断言。

### C6 · 判据 = AA 原值（409 `missing_quiz_expiry` · 不洗） — **PASS**

| 断言 | 源 file:line | REQUEST |
|------|--------------|---------|
| NULL → 409 `missing_quiz_expiry` | `interview.service.ts:238-239` | F1 harness L50 |
| NaN → 同口 | `interview.service.ts:241-242` | F2 harness L51 |
| 过去锚 → `stale_quiz`（NEG 冻结） | `interview.service.ts:219-222` | F4 harness L53 |
| 无 quiz-id 整块跳过 | `if (sourceQuizId)` `:212` / `:230` | F5 harness L54 |
| C-1 窄保留 NULL≠`stale_quiz` | 注释 `:210` · NEG 块 NULL 不走 stale | harness L23 · AA harness nail L173 |

AA nail `15eedd6` · code `a8b98fc` · prove tip `3a6ec52` · dual `c674cb5`+`42b9834`——本审 `git rev-parse` 均存在。零洗码/零洗状态。

### C7 · Pins 原值 · Ban covered — **PASS**

| Pin | 值（harness L4/L98 · slice L4/L46 · stub L14–21） |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8**（RAG-FUNNEL-02A…08 only · 见 `rag-funnel-01-08-covered-matrix.md`） |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503**（stays） |

UC-025 行 / FAULT 列 stays **gap**（矩阵 `:125` · AA harness L18/L173）。EXIT0 ≠ covered ≠ nail ≠ 翻行（harness L65 · Ban 列表 L87）。本 tip 未写 gap status 为 covered。UC-052 stays **partial**（矩阵 `:132`）。

### C8 · EXIT 契约 · 互补不互替 · PASS≠coding — **PASS**

EXIT0 当且仅当隔离面全断言；EXIT1 诚实保留；attempts 全记录；Ban retry-to-green / flake（harness L62–66 · stub 审点 8）。与 AA in-process **互补不互替**（harness L16/L29/L86 · Non-claims L94）。  
**本 PASS ≠ coding 授权**（harness L3 · Non-claims L94 · 本收据同声）。Peer alone ≠ dual；本签齐后仍须协调方另授 coding。

---

## Pins（本审保留）

| Pin | 值 |
|-----|-----|
| REQUEST | `43322e5c2686b3daaf1e66a255184ac8ca74c6b9` |
| tip reviewed atop | `5aae10424277e68edb51c314b00e753e08a20d29` |
| peer e2e PRE | `69be76c9c3c7eb1ef2cc8ce2bdd4686c750487f2`（不代签） |
| haStatus | NOT_HA |
| releaseEvidence | false |
| public DELETE | 503 |
| Stack | PG-retained |
| UC-052 | partial · ≠ covered · retention_pending · 本刀不碰 |
| coveredCount | 8（RAG-FUNNEL-02A…08 only） |
| AA criterion | HTTP **409** `missing_quiz_expiry` @ `interview.service.ts:239`/`:242` |
| escape hatch → rag | **否**（privacy 邻接成立） |
| prove this review | **not run** |
| e2e stub edited | **no** |

---

## 非阻塞注记

1. `_neg-harness.ts` boot 设 `AUTH_DEV_HEADER:'1'`（`:45`）但未显式设 `NODE_ENV`；unset 时 `!== 'production'` 为真，回退可生效。授权 coding 后隔离 prove 宜显式打印 `NODE_ENV`/`AUTH_DEV_HEADER` 以防误配 production。非本 REQUEST 缺陷。
2. Peer e2e C-1..C-6（ready 种子 / NaN 真 PG 可达性 / 锚列证据 / F3 sentinel / F5 观察值 / 双审齐）属 evidence-honesty 面，本隐私审不重裁；编码后 post-prove 仍须兑现。
3. `b0242bf` / `bfadcd66` 本 box 均 missing——仅作 SHA 解析披露，非 invent。

---

## 总评

C1–C8 全部成立。REQUEST `43322e5` 为 docs-only（4 md）；quiz 锚点 privacy 邻接成立（owner-scope · `x-user-id` 双闸 · 拒绝即无痕）且 **不**触 PG-retained/UC-052；判据保持 AA 原值 409 `missing_quiz_expiry`；Pins/coveredCount=8 未翻；PASS ≠ coding。**不**走 mw-rag-route escape hatch。未跑 prove · 未代签/编辑 e2e stub。

Verdict: PASS

---

# POST-PROVE dual（append-only · 2026-10-06）· GAP-UC025-FAULT-ISOLATED-01 · mw-privacy-int

主审：`mw-privacy-int`（本段为 post-prove dual 审查段，append-only 追加；上方 pre-exec 段一字未改 · peer 文件零触碰 · **alone ≠ dual：本段只签 mw-privacy-int，不代签 mw-e2e-ha**）
被审包：REQUEST `b0242bf2`（≡origin `43322e5c`，4 文档内容逐字节一致，blob `2d98843b` 实证）+ coding `cce1980b` + receipt `f2ef22f7`（branch `line/w-uc025-fault-isolated`，base `44154aa5`）
本审 tip：origin `3fb7ba50`；独立 worktree `meetwise-rv-wp-privacy-int` @ `rv/wp-privacy-int` = `3fb7ba50` + 被审包 cherry-pick（`023f9c8e` coding / `d9f41c09` receipt；author 原样 mw-core · `-x` 记源）
**包完整性**：coding 恰 4 文件（`apps/api/package.json`+1 script · 新 proof 374 行 · root `package.json`+2 · `run-e2e-isolated.mjs`+14/−2）；receipt 恰 2 文件。范围 `b0242bf2..f2ef22f7` 对 privacy 域（`0045/0047/0048/0058/0064` 迁移、`privacy_authorization` 源码）、`interview-graph-lease.ts`、principal、`_neg-harness.ts`、AA/NEG/BOUND 三 proof、SSOT 四件、`interview.service.ts`/controller：**零 diff**（`git diff --stat 44154aa5 f2ef22f7 -- …` 空输出实证，只读消费）。
Cherry-pick 披露：唯一冲突 = `run-e2e-isolated.mjs` includes 名单（本审 base 因 Line V 已含 `uc011:refund-callback-adv:prove:raw`，包侧新增 `uc025:nhp-fault-isolated:prove:raw`）→ 机械并集解法；proof 文件与 `cce1980b` 逐字节一致；其余 diff 均为 base 既有 Line V 内容，非本手引入。

## 1 · Fresh re-run（恰好一次 · 禁重试已守）

- **CMD**：`pnpm uc025:nhp-fault-isolated:prove`（root，隔离壳）· **EXIT = 0**
- 运行窗口：2026-10-06T04:44:37Z–04:45:04Z（`durationMs=27406`）· 单次 attempt · 无重试
- 容器：`meetwise-e2e-9061-1791261877234`（随机自建 · 用毕即毁，`docker ps -a` 复核 0 残留）· PG `127.0.0.1:50922` · HTTP `app.listen(0)` → `127.0.0.1:50965`
- runner 结构化 receipt：`.tmp/isolated-proof-receipts/2026-10-06T04-45-04-647Z-9061-9afb135e-32b4-42a2-9c83-3cd16d072d2c.json`（`outcome=passed · exitCode=0`）
- **SUMMARY asserts=22 failed=0**；`MIGRATION_LEDGER applied=136`，tail 含 `0135_resume_quiz_freshness_anchor`；`ANCHOR_COLUMN introspected expires_at={"data_type":"timestamp with time zone","udt_name":"timestamptz"}`
- 逐项复现实测（与 receipt `f2ef22f7` 声称零漂移）：F1 NULL→409 `missing_quiz_expiry`+零副作用；F2 `infinity`→同口+零副作用；F3→409 `resume_version_mismatch`（sentinel）+零副作用；F4→409 `stale_quiz`+零副作用；F5a 202+jobId+bind+恰 1 条 consumption `1.00/reserved`+quiz 行零触碰；F5b 409 `interview_not_active`+快照逐字节相同；5 条 `SEED … status=ready` 打印在案；`HTTP_ERROR_PIN status=409 CONFLICT · error=missing_quiz_expiry`；`ROW_STILL_GAP` 打印在案。
- 回归三脚本（NEG/BOUND/AA-FAULT）本审**未重跑**（本审范围=隔离面恰好一次；receipt 台账记录同 tip 三者 EXIT=0）。

## 2 · C-1~C-8 条件裁决（pre-exec @`a58bc58d` 所附 · 逐条）

| # | 条件 | 裁决 | 依据（file:line / 实测输出） |
|---|------|------|------|
| C-1 | 种子显式 `status='ready'`+逐行打印；错守卫=FAIL | **成立** | proof `uc-e2e-025-nhp-fault-isolated.proof.ts:220-231`（5 种子全 `'ready'`+SEED 打印+断言 `every(status==='ready')`）；F1/F2 断言显式 `!== 'stale_quiz'`、F4 `!== 'missing_quiz_expiry'`（`:266-268/:281-283/:314-316`）；fresh re-run 5 条 SEED 行实测 |
| C-2 | owner-scope 不 widen（种子/断言限自有行） | **成立** | 全部种子 `owner_user_id=U`（`:206-225`）；服务查询 `WHERE … owner_user_id=$2`（`interview.service.ts:215/:234`）；零跨用户 replay 断言；ADV（NHP 序 #4）未借道未关 |
| C-3 | `x-user-id` dev 回退披露落 receipt；Ban 叙事成生产授权证明 | **成立** | proof `:141-142` IDENTITY_DISCLOSURE + `:363` C3_IDENTITY；receipt `:51` 显式「dev/test 身份语义 ≠ 生产授权面 · isolated green ≠ production-authz proof（披露，不洗）」；硬闸 `principal.guard.ts:62-66` 未改动 |
| C-4 | NaN 真列可达性诚实（注入原值+解析值打印；不可达=EXIT1） | **成立（含说明）** | 注入 `'infinity'::timestamptz`（真可存值）；`C4_NAN_PROBE injected_raw=infinity parsed=number(Infinity) newDate.getTime()=NaN Number.isNaN=true`（proof `:233-239`）；服务折链 `new Date(Infinity).getTime()=NaN → missing_quiz_expiry`（`interview.service.ts:244-247`）。说明：pre-exec 括注预判「驱动解析为 Infinity 而非 NaN」的歧义——实测驱动解析=`number(Infinity)`、`Date(...).getTime()`=**NaN**，条件核心「经驱动解析后 `Date(...).getTime()` 为 NaN」满足，`'infinity'` 族即条件所举例子；全链打印、无降级、无洗 |
| C-5 | F3 sentinel 钉死（prove 前写死）+ 副作用诚实 | **成立** | sentinel = BOUND `resume_version_mismatch`（Q_F3 pin epoch=2 vs resume epoch=1，seed 于 `:223`，先于运行）；断言 `errIs(r,'resume_version_mismatch')`+双非（`:298-302`）；哨兵抛点先于 bind/reserve/enqueue，零副作用快照 PASS |
| C-6 | F5 before/after 观察值具体化 | **成立** | F5a 202+`accepted:true`+jobId+resume 绑定+恰 1 consumption `1.00/reserved`+恰 1 start job+quiz 行逐字节零触碰（`:326-339`）；F5b 终态面试 409 `interview_not_active`+快照逐字节相同（`:344-351`）；`F5_DISCLOSURE`（`:340`）显式声明 F5a bind/reserve/enqueue 为 pre-wiring 基线行为、**不叙事为零副作用** |
| C-7 | 锚列隔离 schema 内省实证（timestamptz · 非静默假设） | **成立** | `information_schema.columns` 实测 `expires_at` `timestamp with time zone`/`timestamptz`（`:187-195`）；L3 双证：runner ledger `0135` applied + `sql/20_resume_quiz.sql` 镜像正则 PASS（`:177-184`）；fresh re-run 复现 |
| C-8 | 双审齐 + 协调方授权链；post-prove 不覆写 | **成立** | pre-exec 双审在案：`a58bc58d`（privacy，C-1~C-8+Verdict: PASS）+ `afdb67da`（e2e-ha；与 origin `69be76c9` 内容逐字节一致，diff 实证）；链 = REQUEST `b0242bf2` → pre-exec dual PASS → 协调方授权 coding（协调方侧，repo 惯例不入 commit）→ `cce1980b` → `f2ef22f7` → 本 post-prove。Ban self-approve 成立：coding author=mw-core ≠ 两审者。本段按协调方指示 append-only 追加至本文件（pre-exec 段未改写）；peer 文件零触碰 |

## 3 · REWORK privacy 侧裁决（attempt 2 全迁移壳）

**裁决：全迁移壳使 privacy 链真实生效、未被绕过；F5a 副作用如实披露、未被洗。**

1. **privacy 链齐备且在请求路径生效**（非旁路）：runner migrate 名单注册（包 diff `run-e2e-isolated.mjs` include 表 + 映射）→ 隔离壳 applied=136，含 `0045_checkpoint_thread_rls`（FORCE RLS）、`0047/0048` privacy fence/物理擦除、`0058_interview_privacy_queue_fence`、`0064_interview_resume_epoch_reference`。begin 路径实打：`SELECT status,resume_id,resume_privacy_epoch,…`（`interview.service.ts:199`，0064 列在迁移后真列上）；请求经 `this.db.asPrincipal(principal,…)`（`:196`）以 `app.principal_user` GUC 走 RLS。
2. **0058 fence 活体证据（非绕过）**：`interview_job` RLS ENABLE+owner policy 键 `app.principal_user`（`0001_baseline.sql:272-276`）；`enforce_interview_job_privacy_active` BEFORE INSERT 触发器（`0058:88-96`）在 **F5a 的 enqueue 实际 INSERT 时执行并通过**——202+恰 1 start job 即 fence 活体旁证（fence 若失效/被绕过，此 INSERT 面是别样行为面）；`assert_interview_privacy_active` SECURITY DEFINER、EXECUTE 仅授 app_role（`0058:63-76`）。
3. **最小权限请求路径**：`provisionRuntimeLogin`（`packages/db/src/principal.ts:566-`）建 `LOGIN NOINHERIT NOSUPERUSER … NOBYPASSRLS` + `GRANT app_role`，文档注释明示 NOINHERIT 强制经 `asPrincipal()` 取权；proof 于 import `src/main` **前**置 `PGUSER/PGPASSWORD=runtimeRole`（`:154-166`）→ 应用池以该角色发请求；admin 池仅用于 attestation/种子/快照（out-of-band）；`assertIsolatedTestTarget` 防误连开发库（loopback+nonce PASS）。
4. **attempt 1 部分白名单壳为何不可用（如实）**：缺 0064 列 → begin SELECT 42703 500（receipt 引 attempt-1 log 原值）；且该壳 DROP+重放会毁掉迁移链——结构性不可「补跑迁移」修补。换壳修正以 REWORK 块披露（proof 头注 `:16-33` + receipt「Attempt-1 缺陷与修正」）；判据面（F1–F5 断言/快照/EXIT 契约）声称零改动，本审以现行断言逐条对照 harness 注入表与 AA 钉死口径核实为零漂移。
5. **F5a 非零副作用披露（Ban 洗成立）**：F5a 的 bind（resume 绑定+epoch=1）、`1.00 reserved` 消费、1 个 start job 均如实标注为 pre-wiring 基线「行为不变」证据；零副作用主张仅落在 quiz 行零触碰+F5b 拒绝面（proof `F5_DISCLOSURE` `:340` + receipt F5 行同口径）。无「202 洗成零副作用」。
6. **L0/secrets**：`MODEL_API_KEY`/`MODEL_BASE_URL` 进程内删除（entry absent，L0 PASS）；运行时口令/AUTH_SECRET 等 per-run `randomUUID()` 进程环境注入，树/receipt 无 secret（receipt 仅容器名/端口）。

## 4 · Pins 复核（本审保留 · 未翻）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8** · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-E2E-025 row **stays gap** · FAULT 列 **stays gap** · NEG frozen · BOUND gap · ADV blind · AA in-process 收据保留（互补不互替）· EXIT0 ≠ covered ≠ nail ≠ 翻行（nail 须协调方另授）

## 5 · Blockers

无。

## 6 · Conditions（非阻塞 · 如实披露）

1. **attempt-1 证明文件未入库**：前任 coding 半途中断、其 proof 为未跟踪文件——「两 attempt 间 F1–F5 断言文本逐字节未动」为 implementer 自述，git 不可独立复核；本审以现行断言对照 harness/AA 判据核实零漂移替代。
2. **本审 worktree 与 `line/w` tip 的差异**（已披露）：cherry-pick 并集解法 1 行 + base 既有 Line V 内容（`uc011-refund-callback-adv` 注册）；runner 结构化 receipt 已记录 source digests。
3. **NODE_ENV/AUTH_DEV_HEADER**：proof 显式 `NODE_ENV='test'`（`:141`）+ `AUTH_DEV_HEADER='1'`（`:157`）并打印双闸披露语（pre-exec 非阻塞注记 1 以「显式设置+披露」兑现；未逐字打印变量值，实质等价）。
4. **协调方 coding 授权工件**为协调方侧记录（repo 惯例无独立 commit）；本审以「REQUEST→双审→coding→receipt→post-prove」链 + Ban self-approve 身份分离核实链完整性。

## 三行中文摘要

1. 被审包完整（coding 恰 4 文件、receipt 2 文件；privacy 域/lease/principal/SSOT/三 proof/`_neg-harness.ts` 零 diff）；fresh re-run 恰好一次 `pnpm uc025:nhp-fault-isolated:prove` **EXIT=0**（asserts=22 failed=0 · 容器 `meetwise-e2e-9061-…` 用毕即毁 · runner receipt `outcome=passed`），F1–F5 全部复现且 409 `missing_quiz_expiry` 与 AA 钉死口径零漂移。
2. C-1~C-8 逐条成立（种子 ready 显式化、owner-scope 不 widen、`x-user-id` 回退披露入 receipt、NaN 真列 `infinity→number(Infinity)→getTime()=NaN` 全链诚实、F3 sentinel 钉死、F5a/F5b 观察值落地且 F5a 副作用不洗、锚列 `timestamptz` 内省实证、双审齐 `a58bc58d`+`afdb67da` 且链上无 self-approve）；REWORK 全迁移壳（applied=136）使 0058 fence 触发器、0064 epoch 列、NOINHERIT+NOBYPASSRLS 运行登录与 RLS owner 策略在请求路径**真实生效而非绕过**。
3. 无 Blockers；4 条非阻塞 Conditions 如实披露（attempt-1 未跟踪文件不可独立复核、cherry-pick 并集、NODE_ENV 设置式披露、协调方授权工件在协调方侧）；coveredCount=8、row/FAULT 列 stays gap、EXIT0 ≠ covered ≠ nail；alone ≠ dual，不代签 mw-e2e-ha，nail 与翻行留协调方。

Verdict: PASS
