# REQUEST — **GAP-MOP-03 `:76` successor（cutover / independent review 立卷）** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-mop-03-successor.md` · `gap-mop-03-successor.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `71713718` / `717137180a4cccaa8575acb21c79ccf848973fc2`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）· REQUEST 文件名日期 2026-10-06 按派单原文
**Peer stub**: `reviews/REQUEST-2026-10-06-gap-mop-03-successor-mw-model-op.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

## Pins（原值全抄 · retained 写死）

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503** |
| PG LISTEN | **retained** |
| actualSpendCny | **null**（两本账分离沿 I 线 · 费率非承诺） |
| GAP-MOP-03 | **OPEN** · backlog `:76` · Ban flip CLOSED |
| coveredCount 扩面 | **无**（本刀零 matrix edit · covered 不动） |

## Scope（待审 · e2e/HA 视角）

docs-only REQUEST：backlog `:76` successor（「cutover 另 REQUEST」+「#102 域 cutover 仍须独立审」）docs 立卷。待审要点：Q4/Q5 同列门与 C-E2E-3 口径（`worker-wakeup:prove` PG 层 ≠ Q4/Q5 co-gate）· wakeup 语义沿 W5（prod PG LISTEN/NOTIFY provisional keep · Redis deferred / not STOPPED）· Line C 口径（one wiring call ≠ suite green ≠ G7 green）· EXIT 契约（attempts 全记录 · Ban retry-to-green · `:68` flake 先例）· pins 不动（coveredCount=8 · NOT_HA · releaseEvidence=false · DELETE=503）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban Redis cutover** · **Ban MODEL-OP closed claim** · Ban SLO forge / fake green / suite green claim · Ban 删 PG LISTEN · Ban `:76` flip CLOSED · Ban covered flip · Ban #102 借本刀合入 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级（BUG-REV-COND）· Ban SSOT edit · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push

本 stub 未跑 prove、未起容器、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review — `mw-e2e-ha`（2026-10-07 · append-only · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立审 · 不代签 peer · alone ≠ dual · 本段为唯一新增 · 上方 stub 原文未动）
**Reviewed tree**: mirror `787de124`（与 origin 镜像 `cdde235e` 四文件 byte-identical · `git diff cdde235e 787de124 -- <4 REQUEST files>` 空）· 为 review base `16f2c684`（branch `rv/mop03-e2e-ha` @ `origin/feat/mysql-schema-skeleton`）祖先
**docs-only 实证**: REQUEST commit = 4 新增 md（slice 38 + harness 104 + stub e2e-ha 37 + stub model-op 41 = **+220/−0**）· 零 SSOT（backlog / matrix / checklist 零改）· 零产品码 / migrations / scripts / package.json 改动
**本审未跑 prove · 未起容器 · 未改产品码 · 未读 `.env*` · 0 coding**

### 检查表（六门准入合同可执行性 · e2e/HA 焦点）

| # | 门 | 证据锚（实测） | 判 |
|---|-----|----------------|-----|
| G1 | Q4/Q5 同列门 + 单绿≠双门 | `package.json:194` `model-invocation-reconcile:prove` → raw `pnpm -C apps/worker prove:model-invocation-reconcile` → `tsx test/model-invocation-reconcile.proof.ts`（文件实存）；`package.json:198` `model-op00-usage-reconciler:prove` → raw `pnpm -C packages/ai-runtime prove:usage-calibration-reconciler` → `tsx test/usage-calibration-reconciler.proof.ts`（实存）；harness §2b-1 明写「单绿 ≠ 双门关」沿 AN-MOP-Q45 口径 | ✓ |
| G2 | wakeup prove + 强制周期 reconcile | harness §2b-2 与 BUG-NOTIFY-REC `gap-bug-backlog.md:93` 原文同构（「Redis Streams hint + **强制** periodic reconcile」·「旧 `worker-wakeup:prove` 迁栈后标红」）；GAP-MOP-01 `:74`「切流须 wakeup prove + 周期 reconcile · 本绿 ≠ 已迁」；旧 prove 按 PG 层标注不得冒充 Redis cutover | ✓ |
| G3 | flag 默认关 → 审后开（代码锚） | `apps/worker/src/worker-job-wakeup-redis.ts` `isRedisStreamsWakeupEnabled` 仅 `'1'/'true'/'on'` 开（value-gated · 其余全关）；`packages/db/src/worker-job-wakeup.ts:8` "defaults off (0)"；`apps/worker/src/main.ts:641-648` additive-only · Redis URL 缺失即 skip 且 "PG LISTEN unchanged" | ✓（措辞见 OB-1） |
| G4 | PG LISTEN retained 直至授权 | harness §2b-4 写死 + `packages/db/src/worker-job-wakeup.ts` 头注 "Production still uses LISTEN/NOTIFY until an independent cutover is approved" + `main.ts` "never replaces the PG LISTEN session above" · Ban 静默摘除 | ✓ |
| G5 | 独立审不降级 | harness §2b-5「≥ PRE/POST dual（mw-model-op + mw-e2e-ha）+ BUG-REV-COND 四专家审（D2 · 不降级）」+ §1 D2「不得降为双审即切」· BUG-REV-COND 原样 cite（四专家审 · Ban 自批） | ✓ |
| G6 | 两本账分离沿 I 线 | §2b-6 · nail `e09a39f` 实存（"NAIL MODEL-OP I2 pre_exe…"）· `actualSpendCny=null` · 费率非承诺 · 仅 console-cited actual 可写 | ✓ |

### HA 语义（e2e 视角）

- **H1 · EXIT 契约**：attempts 全记录（逐条 EXIT · Asia/Shanghai · code SHA）· 诚实失败原样入账 · Ban retry-to-green —— 与 `gap-bug-backlog.md:68` GAP-PRIV-AUTHZ-PROVE-FLAKE 原文（"Ban retry-to-green · Record every attempt EXIT"）核对一致 ✓
- **H2 · 口径链**：`EXIT0 ≠ MODEL-OP closed ≠ SLO ≠ cutover ≠ HA ≠ suite green ≠ covered`（§5/§8）· Line C「one wiring call ≠ suite green ≠ G7 green」cite · Ban 假绿 / Ban suite green / Ban HA 叙事在 §7/§8 贯穿 ✓
- **H3 · 未授权前 wakeup = PG LISTEN（Redis 不得顶替）**：代码锚（`main.ts` PG LISTEN 会话无条件启动 · Redis listener additive · 默认 `enabled:false` stub）+ 合同锚（§2b-4 · Ban 删 PG LISTEN）双钉 ✓
- **H4 · named proves ≠ 授权**：slice「named ≠ 授权（I2 先例）」+ harness §4「命名仅为双审 clarity」· 本刀零 prove 执行 ✓
- **H5 · Redis 语义**：本刀不命名不授权 Redis prove；现存 `worker-wakeup-redis:prove`（`package.json:474` → `scripts/mysql-stack.redis-wakeup.proof.mjs` 结构性原型证明）被刻意不命名——与 Ban Redis cutover 一致；未来洗白风险 → C-E2E-3 ✓
- **H6 · C-E2E-3 口径复核**（stub Scope 待审点）：`worker-wakeup:prove`（`apps/worker` `prove:job-wakeup` → `tsx test/job-wakeup-listener.proof.ts` · PG LISTEN 层）确为 PG-unit 层，不在 Q4/Q5 co-gate 内，仅可作可选旁证——harness §4 标注「PG-unit layer ≠ Redis cutover」成立 ✓

### 诚实条款与 Pins

- `actualSpendCny=null` ✓ · 两本账分离 ✓ · Ban live ✓ · SSOT 本刀零碰（commit 仅 4 新 md 实证 · nail 期才碰 SSOT 的路径未被本刀预支）✓
- Pins 核（HEAD matrix 实测计数）：`haStatus=NOT_HA`（×44 · 0 反例）· `releaseEvidence=false`（×63 · 唯一 `releaseEvidence=true` 出现于 Ban 条款内非 live pin）· `claimProductionHA=false`（×55）· `gR45Closed=true`（×52）· `coveredCount=8`（×74 · 0 处 `coveredCount=0`）· `ms3EqualsR4Closed=false`（×52）· PG-retained ✓ · public DELETE=503（Line AR nail 实存）✓ · PG LISTEN retained ✓ · REQUEST commit 零 pin edit ✓

### 裁决点独立复核（D1/D2/D3 · 独立审 · 不代签 peer mw-model-op）

- **D1 不含 GAP-MOP-02**：`gap-bug-backlog.md:75` GAP-MOP-02（claim/lease Q2/Q3）为独立行；`:76` 原文两处后继钩子（「#102 域 cutover 仍须独立审」+「cutover 另 REQUEST」）不含 claim/lease 面 → 排除成立。
- **D2 四专家审不降级**：BUG-REV-COND「ADR 隐私 prove 清单全绿 + 四专家审 · 禁止自批」原样保留于 §2b-5 → 成立。（W5 slice「note `mw-model-op` optional later for domain cutover」为历史弱表述，被 D2 非降级解读覆盖 → 记 OB-3。）
- **D3 Redis 只立卷不授权**：无 flag 开启 · 无 Redis prove 授权 · 选型文档（`m3-queue-wakeup-selection.md` / `harness/redis-streams-wakeup.prototype.md` / INFLIGHT:redis-wakeup-wip）只读 cite → 成立。

### Fail-trigger audit（10 项 · 0 hit）

| FT | 触发条件 | hit? |
|----|----------|------|
| FT-1 | Q4/Q5 prove CMD 不实存（package.json 或 raw target / proof 文件缺） | 0（`:194`/`:198` + 两个 proof 文件实存） |
| FT-2 | 「单绿≠双门」缺写或可洗 | 0（§2b-1 明写） |
| FT-3 | wakeup prove + 周期 reconcile 未锚 BUG-NOTIFY-REC / GAP-MOP-01 | 0（`:93`/`:74` 原文同构） |
| FT-4 | flag 默认关无代码锚 | 0（三处代码锚） |
| FT-5 | PG LISTEN retained 未写死进合同 | 0（§2b-4 + 代码头注双锚） |
| FT-6 | 独立审降级（dual 即切） | 0（D2 非降级 + BUG-REV-COND 原样） |
| FT-7 | Redis 顶替 PG LISTEN 的语义缝隙 | 0（additive-only 代码 + Ban 删 PG LISTEN） |
| FT-8 | named proves 写成 coding/prove 授权 | 0（I2 先例钉死） |
| FT-9 | REQUEST 含 SSOT / 产品码 / 脚本 / package.json 改动 | 0（4 新 md · +220/−0） |
| FT-10 | pins 漂移（NOT_HA/false/false/gR45=true/covered=8/ms3=false/DELETE=503/PG-retained） | 0 |

### Blockers

无（0）。

### Conditions

- **C-E2E-1**（base 重验）：REQUEST 树 `cdde235e` ↔ mirror `787de124` 四文件 byte-identical 已验 · mirror 已为 review base `16f2c684` 祖先；EXEC / prove 前须 fresh `git fetch origin` 并对授权时 tip 重验 docs-only 未漂移（base drift `71713718`→tip 演进沿 peer C-MO-1 方向已在 docs-side 落地）。
- **C-E2E-2**（flag 语义重述 · 沿 OB-1）：未来 cutover REQUEST 须按代码门重述 `MEETWISE_WAKEUP_REDIS_STREAMS` 语义（value-gated `'1'/'true'/'on'` · `=0`/空/unset 均关），不得以 "presence-only" 表述作为开/关判据。
- **C-E2E-3**（Ban 结构性证明洗白 · 沿 OB-2）：现存 `worker-wakeup-redis:prove` EXIT0 ≠ Redis cutover 证据；未来 cutover REQUEST 须显式命名自带的真实数据面 Redis wakeup prove + 强制周期 reconcile 证据。
- **C-E2E-4**（EXIT 契约）：任何授权后 prove 沿 §5 —— attempts 全记录 · 诚实失败原样入账 · Ban retry-to-green（`:68` 先例）· 重跑须新 REQUEST + 双审。
- **C-E2E-5**（PG LISTEN 写死执行）：PG LISTEN retained 直至 cutover REQUEST PRE dual + AUTHORIZE + BUG-REV-COND 四专家审全部落地；期间任何摘除/绕过 PG LISTEN 的改动即违约，Ban。

### Observations（非阻断）

- **OB-1**：harness §2b-3「`MEETWISE_WAKEUP_REDIS_STREAMS` presence-only 语义保持」与代码门（value-gated）存在术语漂移——"presence-only" 在 AN-MOP-Q45 receipt 语境是「只探 presence/absence 不读值」的 env 卫生语义（receipt `2026-10-06-an-mop-q45-…prove.md:34`「unset（presence-only）」），非 flag 开关语义；操作性条款（默认关 · 本刀 unset）无歧义 → 不阻断，转 C-E2E-2。
- **OB-2**：`package.json:474` 已存在 `worker-wakeup-redis:prove`（结构性原型证明）；harness 刻意不命名（正确），但未来 cutover REQUEST 有将其 EXIT0 洗成 cutover 证据的风险 → 转 C-E2E-3。
- **OB-3**：W5 slice「mw-model-op optional later for domain cutover」为历史弱表述；harness D2 非降级解读已覆盖，记录在案防回潮。

### 三行中文摘要

1. REQUEST 立卷合同六门逐项可执行：Q4/Q5 prove CMD 与 raw target/proof 文件实存（`package.json:194/198`）、「单绿≠双门」明写、wakeup prove+强制周期 reconcile 与 BUG-NOTIFY-REC `:93`/GAP-MOP-01 `:74` 原文同构、flag 默认关三处代码锚、PG LISTEN retained 写死、独立审 ≥ dual + 四专家不降级、两本账分离沿 I 线 `e09a39f`。
2. HA 语义贯穿：未授权前 wakeup = PG LISTEN（`main.ts` additive-only · Redis 不得顶替）、EXIT0 ≠ cutover ≠ MODEL-OP closed ≠ HA ≠ suite（Line C）、Ban 假绿 / Ban retry-to-green（`:68` 先例）、named proves ≠ 授权（I2）；Pins 全 held（NOT_HA/false/false/gR45=true/covered=8/ms3=false/DELETE=503/PG-retained 实测零反例）、SSOT 零碰（4 新 md +220/−0）、D1/D2/D3 独立复核全部成立。
3. 零 Blocker · FT 10 项 0 hit；两处非阻断风险（"presence-only" 措辞漂移 · 现存 `worker-wakeup-redis:prove` 结构性证明洗白面）转为未来 cutover REQUEST 的 C-E2E-2/C-E2E-3；本审零 prove 零编码零 SSOT，alone ≠ dual，不代签 peer，PASS ≠ 授权执行。

Verdict: PASS
