# Harness — **MOP03-C · MODEL-OP #102 域 cutover 宣告刀**（REQUEST · docs-only · `draft:awaiting_pre_exec_dual` · 七门合同 **G1–G7 全部行使** · Ban Redis cutover · Ban MODEL-OP fake closed · Ban 洗原钉 · Ban 改共享 SSOT · GAP-MOP-03 **OPEN** · PG LISTEN retained）

**Pins**（文首照抄 · 原值写死 · 本刀 REQUEST 面零翻转）: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs-only REQUEST · 七门行使方案书 · 零 coding · 零 prove 执行（fresh Q4/Q5 属 EXEC 面 · 本面禁跑）· 零 live · 零容器 · 零 SSOT（backlog / matrix / checklist / queue 零 diff）· 零 `:76` 触碰 · Ban self-approve · alone ≠ dual · Ban nail until 全链 + 四专家审 BOTH + 协调方 AUTHORIZE）
**Date**: 2026-10-07（Asia/Shanghai）
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`9265e4d8`** / full `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`（= fetch 后 origin tip · ≥ `9265e4d8` 达标 · 承卷链祖先在位：AN-MOP-Q45 nail `e29d8f93` 之前的 honesty 链 + MOP03 立卷 + MOP03-B 材料包 nail `b2948f20` 已收账 @checklist `:1384` · worktree `/Users/miaole/Desktop/golucky/meetwise-line-mop03decl` · branch `line/mop03-cutover-declare` · 兄弟刀 worktree（mop03-successor @`47f17b83` · mop03-nail @`e29d8f93` · cutover-review @`b2948f20` · cmop03 各刀）零触碰）（Base 行补记沿 MOP03-B rev2 先例 · rev2 · e2e-ha PRE 处方）
**Wave**: Line **MOP03-C**（GAP-MOP-03 后继刀第三刀 · 前刀：①AN-MOP-Q45 honesty nail `post_prove_dual_pass`（Q4/Q5 EXIT 0/0 @`66a77ed`）→ ②MOP03 `:76` successor 立卷刀（六门准入合同 `harness/gap-mop-03-successor.md` §2b）→ ③MOP03-B 独立审材料包刀（七门独立审判据 + 审后残留义务 `harness/mop03-cutover-independent-review.md` §3/§4 · nail @checklist `:1384`）· 本刀 = MOP03-B nail 登记的「未来 cutover REQUEST」本身）
**Experts**: `mw-model-op` + `mw-e2e-ha`（预执行双审 · PRE 待开 · Ban self-approve · alone ≠ dual）；四专家审面（mw-e2e-ha + mw-privacy-int + mw-rag-route + mw-model-op 四席）**在 EXEC 后按合同召集**，本 REQUEST 面不预开
**Authority**: meetwise — 待授权 · 流程：**REQUEST（本 commit）→ 预执行双审（mw-model-op + mw-e2e-ha · BOTH PASS）→ meetwise 授权 → EXEC（fresh Q4/Q5 同列 + value-gate 审前 unset 核验）→ 四专家审（四席 · BOTH PASS）→ meetwise AUTHORIZE → nail（`:76` 行翻转在此 nail 面 · 单独 nail commit）**
**Knife**: **MOP03-C · MODEL-OP #102 域 cutover 宣告刀**（承 MOP03-B 材料包 nail 登记 · 七门合同 G1–G7 全部行使 · 本 REQUEST 面 = 行使方案书 + 审 stub，**不跑 prove、不切流、不翻转 `:76`、不宣称 cutover 成立**）
**Gap id**: **`GAP-MOP-03`**（backlog `gap-bug-backlog.md:76` · P0 · **OPEN** · Ban flip CLOSED 本 REQUEST 面）

## 0. 承卷事实（勿重做 · 只读 cite · 零重跑）

- AN-MOP-Q45 honesty nail **`post_prove_dual_pass`**：Q4/Q5 **同列 EXIT 0/0** @ CODE_SHA `66a77ed`（PROVE `a1f3614` · POST dual `67050c0`+`a41c575` · attempt 1 · 2026-10-06 20:21:35–20:22:00 +08）· Redis unset · PG LISTEN retained。**该 EXIT0 仅背景证据，不可替代本刀 G1 fresh 门**（旧 EXIT ≠ 新证据 · MOP03-B §3 门1 原口径）。
- MOP03 `:76` successor 立卷刀已立**六门准入合同**（`harness/gap-mop-03-successor.md` §2b）；MOP03-B 材料包刀已立**七门独立审判据**（`harness/mop03-cutover-independent-review.md` §3）+ **审后残留义务**（同 §4）。本刀沿两者**不加不减、不降级**；七门 = 六门合同的执行细化（门 2 细化 wakeup 强制周期 reconcile 面；门 5 对应审规格四席具名）。
- 铁律原钉原样有效（Ban 洗）：backlog `:76`「prove EXIT 同列绿 **禁止**宣称 MODEL-OP/SLO/cutover 已关；#102 域 cutover 仍须独立审」· checklist `:1031`「Nail ≠ MODEL-OP domain closed ≠ #102 cutover ≠ SLO closed ≠ Redis cutover ≠ suite green」· checklist `:1132`「立卷 ≠ 关闭 ≠ MODEL-OP domain closed ≠ Redis cutover ≠ #102 cutover ≠ suite green ≠ HA」。
- 锚实测 @ base `9265e4d8`：Q4 CMD `package.json:198` · Q5 CMD `package.json:202` · `worker-wakeup:prove` `package.json:391`（PG-unit 层标注）· `worker-wakeup-redis:prove` `package.json:486`（EXIT0 ≠ cutover 证据）· 双 reconciler wiring `apps/worker/src/main.ts:677/:679-680/:694/:712` · PG LISTEN `main.ts:633/:640-641` + `packages/db/src/worker-job-wakeup.ts:7/:15`（`meetwise_worker_wakeup_v1`）· value-gate `apps/worker/src/worker-job-wakeup-redis.ts:21/:49-52`（`'1'/'true'/'on'` trim+lowercase · default off）· BUG-NOTIFY-REC backlog `:101` · MOP01 立卷 backlog `:84` + `harness/gap-mop-01-wakeup-notify-rec.md` §2a（`:50`）· Line C 口径 backlog `:183-191`。（MOP03-B §2-F 订正锚纪律沿用 · rev1 旧号 `:170-172`/`:93`/`:82` 保留为 provenance 不回改不沿用。）

## 1. 本刀目标（docs REQUEST · 授权后 EXEC 面 = G1 fresh 双 prove + unset 核验 + 收据落账）

为「**MODEL-OP #102 域 cutover**」行使**七门合同 G1–G7 全部门**，交付：

1. **七门逐门行使方案**（§2 · G1–G7 · 全部可核验、可裁决、不降级）；
2. **硬 Ban 清单**（§3 · 四大硬 Ban + 通用 Ban · 全程生效）;
3. **预执行双审 stubs**（mw-model-op + mw-e2e-ha · 随本 REQUEST 落空位）+ 四专家审面召集声明（EXEC 后按合同开 · stub 另落）。

**本 REQUEST ≠ cutover 已执行 ≠ cutover 成立 ≠ `:76` 关闭**：宣告的成立与否由全链裁决（PRE dual → meetwise 授权 → EXEC fresh → 四专家审 BOTH → meetwise AUTHORIZE → nail）；`:76` 行翻转只发生在**本刀全链通过后的单独 nail 面**（协调方 AUTHORIZE 后），本 REQUEST 面零触碰。

## 2. 七门逐门行使方案（G1–G7 · 沿七门合同不加不减 · 任一门未过 → 宣告不成立 · 可部分通过 = 不成立 · Ban「大体通过」措辞）

### G1 · fresh Q4/Q5 同列门（REQUEST 自带新跑 · EXEC 面执行）

- **新跑双 prove**：EXEC 面（meetwise 授权后）在 EXEC commit（同一 CODE_SHA）上新跑 `pnpm model-invocation-reconcile:prove`（Q4 · `package.json:198`）**与** `pnpm model-op00-usage-reconciler:prove`（Q5 · `package.json:202`），要求**同列 EXIT 0/0**。单绿 ≠ 双门关。
- **同一 CODE_SHA**：Q4/Q5 两 attempt 记录的 code SHA 必须等同且 = EXEC 面产物 commit；不同 SHA 视为不同列 → 门不过。
- **预声明 attempt 窗（Asia/Shanghai）**：**EXEC 授权当日 20:00–23:59 +08 单轮窗口**；每 CMD 预声明**单次 attempt**；起止时间逐条入 receipt（attempt 序号 · Asia/Shanghai 起止 · code SHA · EXIT 值）。
- **attempts 全账**：失败与成功同列入账，原样保留（`.exit`/log 零改）；EXIT≠0 → 原样记录 → 判 fail → **Ban retry-to-green**（`harness/gap-mop-03-successor.md` §5 · `:68` flake 先例 · 单次后绿不关因）；如需重跑须**新 REQUEST + 双审**，不得在本刀窗口内重试。
- **承卷 66a77ed EXIT0 仅背景**：AN-MOP-Q45 的 `66a77ed` EXIT0（PROVE `a1f3614`）是背景证据，**不可替代本 fresh 门**；G1 的绿的只认 EXEC 面新 attempt 账。

### G2 · wakeup prove + 强制周期 reconcile（PG/Redis 层诚实标注）

- **wakeup prove**：EXEC 面同窗跑 `pnpm worker-wakeup:prove`（`package.json:391`），**诚实标注 PG-unit 层 only**——≠ Redis 侧证据 · ≠ Q4/Q5 co-gate · 任何结果不得冒充 Redis cutover 证据；`worker-wakeup-redis:prove`（`package.json:486`）任何 EXIT0 **≠ cutover 证据**（C-E2E-3 口径）。
- **强制周期 reconcile**（BUG-NOTIFY-REC backlog `:101` 原文 + MOP01 立卷 backlog `:84` 附录）：切流 hint 的强制周期 reconcile 证据面 = dual reconciler worker loop wiring 在列（`main.ts:677/:679-680` Q4 `FOR UPDATE SKIP LOCKED` @ `apps/worker/src/model-invocation-reconcile.ts:68` · Q5 insert-only `ON CONFLICT DO NOTHING` @ `packages/db/src/usage-calibration.ts:74` · 就绪门 `:694` · SIGTERM 排空 `:712`）+ **「强制周期 reconcile 未在 sole stack 证明」的诚实清单原样携带**（MOP01 §2a `:50`），不因本刀宣告洗白。
- **PG/Redis 两层标注纪律**：PG LISTEN 为生产通道（G4）；Redis 侧（hint 生效/延迟/恢复语义）证据缺位即如实记 **OPEN**，Ban 用 PG 层 EXIT0 顶替 Redis 层读数。

### G3 · value-gate 审前 unset + 开启只在 AUTHORIZE 后

- **value-gate 语义保持**：`MEETWISE_WAKEUP_REDIS_STREAMS` 按 `worker-job-wakeup-redis.ts:21`（env 名）+ `:49-52`（`'1'/'true'/'on'` trim+lowercase · 其余关 · **default off**）逐字保持； Ban 改门、Ban presence-only 化。
- **审前 unset 核验**：PRE dual 开审前 + EXEC 面落 prove 前，核验 `MEETWISE_WAKEUP_REDIS_STREAMS` **unset**（现状 unset · EXEC 面核验值写入 receipt · 根目录 `.env` absent 状态一并记录）；审面全程（PRE dual / EXEC / 四专家审）维持 unset。
- **开启只在 AUTHORIZE 后**：flag 开启动作（若发生）只在 meetwise 最终 AUTHORIZE 之后（nail 面或另行授权步骤），且开启不解除 G4（PG LISTEN retained 不变 · 不删 PG 通道 · 不降 PG 优先）。

### G4 · PG LISTEN retained 至最后（退役另步 + 回滚预案）

- **retained 至最后**：独立审全程 + 本刀落链全程，`meetwise_worker_wakeup_v1`（`worker-job-wakeup.ts:15`）生产通道零摘除、零绕过（`main.ts:633` 生产 wakeup 会话 · `main.ts:640-641` 「never replaces the PG LISTEN session above」· `worker-job-wakeup.ts:7`「Production still uses LISTEN/NOTIFY until an independent cutover is approved」锚原样）。
- **退役另步**：PG LISTEN 的实际退役 = 本刀宣告成立**之后**单独授权的另步（不捆绑本刀 nail · 不搭车）；届时才解除 `worker-job-wakeup.ts:7` 的 until 条款。
- **回滚预案（随退役另步前置必备）**：Redis 侧故障/延迟超界时 **PG fallback 回切**路径须事先写明并演练可行（方案随退役 REQUEST 双审）；无回滚预案 = 退役 REQUEST 不受理。

### G5 · 独立审规格不降级（≥ dual + 四专家审四席 · 换审冻结）

- **预执行双审**：mw-model-op + mw-e2e-ha（stubs 随本 REQUEST 落：`reviews/REQUEST-2026-10-07-mop03-cutover-declare-mw-{model-op,e2e-ha}.md`）· PRE BOTH PASS 方可进 EXEC。
- **四专家审**：EXEC 后按合同召集 **mw-e2e-ha + mw-privacy-int + mw-rag-route + mw-model-op 四席**（stubs 另落于四专家审面 · 本 REQUEST 不预开不代签）· BOTH PASS 方可进 AUTHORIZE；含 BUG-REV-COND 要求的 **ADR 隐私 prove 清单全绿核对**（清单 cite-only 于本 REQUEST · 执行归四专家审面核验 · 本刀零执行零复跑零 receipt）。
- **不降级 + 冻结**：Ban 自批 · alone ≠ dual · 不互相代签 · **换审冻结**（审面一旦开启不得换席/降规格/改判据；确须变更由 meetwise 协调方显式裁定并全链披露，Ban 静默换审）。
- **审席产出语义**：PASS = 「按本 §2 七门核对，当前材料支持进入下一门」；**不是**「cutover 已完成」宣称（G7）。

### G6 · 两本账分离沿 I 线（actualSpendCny 仅 console-cited）

- estimated 与 actual 分离（I 线 `model-op-spend-ledger-offline(-i2)` · nail `e09a39f` 原口径）；`actualSpendCny` **仅 console-cited actual 可写**（今日 **null**）· 费率非承诺。
- 本刀 EXEC 面 prove 均为离线门：零 live / 零 Key 消耗 / 零网络付费 / 零 console spend；若未来出现真实 spend，仅 console-cited actual 可入账，Ban 估算值冒充 actual。

### G7 · 诚实 Non-claims 全程

- 任何 EXIT0 ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite green ≠ coveredCount 扩面（Line C 口径 · backlog `:183-191`：one wiring call ≠ suite close · 收据≠prove SHA · not_run 不计 pass）。
- 无洗前钉（§0 三处原钉逐字保留）· 无 SSOT 静默改 · 无 retry-to-green · 无单次后绿关因 · `:76` 行翻转仅限 nail 面（§3 Ban 4）。
- 宣告成立后的登记措辞 Ban 扩义：宣告 ≠ MODEL-OP 域全部遗留清零（GAP-MOP-01 有界延迟窗清单、GAP-MOP-02 `:75` 独立行照旧 OPEN · MOP03-B §4 残留义务逐条携带）。

## 3. 硬 Ban（四大 + 通用 · 全程）

1. **Ban Redis cutover**（PG LISTEN/NOTIFY 保留 · Redis 只评估不切 · 本刀 EXEC 面不启 flag · 不写 Redis prove 授权 · 不删/绕过 PG LISTEN · **PG LISTEN 退役另步**不捆绑本刀）
2. **Ban MODEL-OP fake closed**（本 REQUEST 不关 GAP-MOP-03 `:76` 行 · Ban SLO forge / fake green / coveredCount 扩面 · Ban 借宣告叙事宣称域内全部 gap 清零）
3. **Ban 洗「prove EXIT 同列绿 禁止宣称 MODEL-OP/SLO/cutover 已关」原钉**（backlog `:76` 原文 · checklist `:1031`/`:1132` · 逐字保留 Ban 改写 Ban 摘引走样）
4. **Ban 改共享 SSOT**（backlog / matrix / checklist / queue 本 REQUEST 零 diff；**:76 行翻转 = 本刀全链（七门 G1–G7 全过）+ 四专家审 BOTH PASS + 单独 nail + meetwise 协调方 AUTHORIZE 后的 nail 面动作 · 缺一不可**；REQUEST / PRE / EXEC / 四专家审面一律零触碰）
5. **Ban secrets**（`.env*` 读改 · Key/凭据入卷）· Ban coding（本 REQUEST 面 docs-only）· Ban prove 执行（fresh Q4/Q5 属 EXEC 面 · 授权前禁跑）· Ban live / 容器 · Ban Meridian · Ban buy cloud · Ban force-push · Ban 碰 sibling 刀文件（PRIV-EXT / PERF-TEAR / RAG-R3 / AO COND body / CMOP03-D markers）· Ban 独立审降级 · Ban self-approve（alone ≠ dual）· Ban 互相代签 · Ban 静默换审

## 4. 流程声明（本刀 lifecycle · `:76` 翻转位置钉死）

**REQUEST（本 commit · docs-only）→ 预执行双审（mw-model-op + mw-e2e-ha · PRE BOTH PASS）→ meetwise 授权 → EXEC（fresh Q4/Q5 同列（G1 预声明窗）+ value-gate 审前 unset 核验（G3）+ wakeup prove/强制周期 reconcile 证据入账（G2）· attempts 全账入 receipt）→ 四专家审（mw-e2e-ha + mw-privacy-int + mw-rag-route + mw-model-op · BOTH PASS）→ meetwise AUTHORIZE → nail（单独 nail commit · **`:76` 行翻转在此 nail 面** · 七门任一未过则不进 nail 且 `:76` 保持 OPEN）。**

EXEC 允许操作面：跑 G1/G2 named proves（预声明窗内 · 单次 attempt）+ `MEETWISE_WAKEUP_REDIS_STREAMS` unset 核验（只读 env）+ receipt 落账；Ban 产品码 / SSOT / flag 开启 / 容器 / live / `.env*` 读改。EXEC 的 rg 复验结果与 prove EXIT 全账写入 exec commit message，四专家审可独立复跑。披露（EXEC/nail 面 · 沿 MOP01 镜像披露先例）：**B 链（MOP03-B 材料包刀）origin 镜像 nail 具名 `6006d2e8`**（origin parent `cde75f3c` · 已在本刀 base `9265e4d8` 祖先 · 本地 nail `b2948f20`）；本刀 EXEC/nail 落账时镜像 SHA 一并具名披露。

## 5. EXIT 契约（预声明 · 适用于授权后 EXEC · 本 REQUEST 零执行）

- **attempts 全记录**：逐条入 receipt（attempt 序号 · Asia/Shanghai 起止 · code SHA · EXIT 值）· 失败与成功同列入账 · `.exit`/log 原样零改。
- **诚实失败路径**：EXIT≠0 → 原样记录 → 判 fail → **Ban retry-to-green**；本刀预声明窗内单次 attempt，重跑须新 REQUEST + 双审。
- **EXIT0 ≠** MODEL-OP closed ≠ SLO ≠ cutover ≠ HA ≠ suite green ≠ coveredCount 扩面（Line C 口径）· 承卷 `66a77ed` 仅背景（G1）。
- 四专家审面可对 EXEC receipt 逐条独立复跑核验（rg / prove 复算 · 只读）。

## 6. Non-claims

docs-only REQUEST 七门行使方案书 · not #102 cutover 成立 · not MODEL-OP closed · not SLO · not Redis cutover · not flag 开启 · not PG LISTEN 退役 · not HA · not suite green · not `releaseEvidence=true` · not coveredCount 扩面 · `actualSpendCny=null` · GAP-MOP-03 **OPEN**（`:76` 零触碰）· alone ≠ dual · PASS ≠ 执行 ≠ AUTHORIZE ≠ nail · 四专家审面未开（EXEC 后按合同召集）

## Review stubs（PRE · 空审位 · 四专家审 stubs 于 EXEC 后另落）

| Expert | Stub |
|--------|------|
| `mw-model-op` | `reviews/REQUEST-2026-10-07-mop03-cutover-declare-mw-model-op.md` |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-mop03-cutover-declare-mw-e2e-ha.md` |

## Pins（尾部复读 · 与文首同值）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · PG LISTEN retained · Ban Redis cutover · Ban MODEL-OP fake closed · backlog `:76` OPEN · alone ≠ dual · STOP（awaiting pre-exec dual）

*Harness · MOP03-C MODEL-OP #102 domain cutover declare · 2026-10-07 · `draft:awaiting_pre_exec_dual` · 七门合同 G1–G7 全部行使方案 · 零 coding · 零 prove 执行（fresh Q4/Q5 属 EXEC 面）· 承卷 AN-MOP-Q45（Q4/Q5 EXIT 0/0 @66a77ed 仅背景不可替代）+ MOP03 立卷六门合同 + MOP03-B 七门判据 勿重做 · Ban Redis cutover · Ban MODEL-OP fake closed · Ban 洗原钉 · Ban 改共享 SSOT（`:76` 翻转 = 全链 + 四专家审 BOTH + 单独 nail + 协调方 AUTHORIZE 后 nail 面）· `:76` OPEN · alone ≠ dual · nail = 协调方授权*
