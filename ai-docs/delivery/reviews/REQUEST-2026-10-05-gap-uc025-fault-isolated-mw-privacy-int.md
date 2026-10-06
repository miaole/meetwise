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
