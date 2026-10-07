# REQUEST — **GAP-MOP-01 `:74` wakeup work face + BUG-NOTIFY-REC `:95`** · pre-exec · `mw-model-op`

**Status**: **PENDING** / `draft:awaiting_re_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-model-op`
**Knife**: `harness/gap-mop-01-wakeup-notify-rec.md` · `gap-mop-01-wakeup-notify-rec.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `4804c3dc` / `4804c3dc54e696b5f7af17574d21e1bbe68482a4`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）

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
| GAP-MOP-01 `:74` | **OPEN** · Ban flip CLOSED |
| BUG-NOTIFY-REC `:95`（本基线行号 · MOP03-era `:93`） | **OPEN** · Ban flip CLOSED |

## Scope（待审）

docs-only REQUEST：按 backlog `:74` 原文把 GAP-MOP-01 wakeup 工作面立卷——(a) §2a wakeup 生产诚实清单（LISTEN/NOTIFY `meetwise_worker_wakeup_v1` lossy hint · additive Redis 旁路 value-gated flag 关 · 既有周期兜底扫描实存（drain-loop 周期 tick + 五 consumer loop `WORKER_JOB_RECONCILE_INTERVAL_MS` 默认 5s 认领 + dual reconciler 30s/60s → 漏唤醒 = 有界延迟窗 · `main.ts:452` 仅字面事实引用）· **强制 periodic reconcile 未在 sole stack 证明** = BUG-NOTIFY-REC `:95` 保持 OPEN 依据（未证明 ≠ 不存在））；(b) §2b M3 切流包 wakeup 侧内容定义（flag 审后开程序 · 保留 reconcile · wakeup prove 不命名不授权 · 本绿≠已迁随包输出）；(c) §2c 旧 `worker-wakeup:prove` 标红/换夹具处置计划。**与 MOP03 立卷边界**：nail `e29d8f93` 六门准入合同**只读引用不再立法**（Ban 重复立卷）——MOP03 立准入门，MOP01 立工作面；未来 wakeup 切流 REQUEST 须同时过六门与切流包内容。本刀零执行；prove 计划 named-not-run（`worker-wakeup:prove` / `worker-wakeup-redis:prove` named for clarity · 未来 cutover Redis wakeup prove 不命名不授权）· EXIT 契约预声明（attempts 全记录 · 诚实失败 · Ban retry-to-green · EXIT0≠已迁≠cutover）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban Redis cutover**（wakeup/queue/claim 切流 · flag 开启 · Redis prove 授权 · MOP03 六门不因本刀松动）· **Ban MODEL-OP closed claim** · Ban SLO forge / fake green · Ban 删 PG LISTEN · Ban `:74`/`:95` flip CLOSED · **Ban 重复立卷**（六门要素 2–5 只读引用）· Ban GAP-MOP-02 `:75` 认领 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级 · Ban SSOT edit · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push

## 裁决点（expert 裁量）

- **D1（生死点）· 与 MOP03 立卷重叠裁决**：本刀「互补不重复」读法是否成立（MOP03 准入合同 vs MOP01 `:74` 工作面）；若判实质重叠 → 本刀显式改写收窄为「仅诚实登记」（逃生门 harness §1-D1/§3 · Ban 重复立卷 · Ban 静默换范围）。
- D2：切流包内容口径（`:74`「M3 切流包（非本选型切片）：flag 默认关→审后开；保留 reconcile」= 未来授权 REQUEST 的 wakeup 侧交付清单定义 · 非本刀执行 · flag 开启动作 Ban）是否如 REQUEST 所述。
- D3：Redis 语义边界（本刀只立卷不切流 · 选型/原型/INFLIGHT:redis-wakeup-wip 只读 cite · Redis wake deferred ≠ STOPPED 沿 W5）。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

---

## RE-PRE dual 审查（mw-model-op · 2026-10-07 Asia/Shanghai · append-only · B-1 重写复核）

**被审对象**：重写 commit `a265d6f8`（`line/mop01-knife` tip · parent=`4804c3dc54e696b5f7af17574d21e1bbe68482a4` 实证 `git rev-parse a265d6f8^` EXIT=0）——上轮 PRE dual FAIL Blocker **B1**（harness §2a 行 5「无周期兜底轮询…仅靠下游下次 wake 兜底」与代码相反）处方兑现专项复审。审阅基树 = 独立 worktree `rv/mop01r-model-op` @ `a265d6f8`（`git worktree add` EXIT=0）。本 commit patch-id = `5ad66dc3c6311bf532b84e9d112ed149aca5f3ba`（`git show a265d6f8 | git patch-id --stable`；与上轮被审 `d0dc312f` 的 `de532136` 不同属预期——内容已按处方改写）。本审看不到 `mw-e2e-ha` 的 RE-PRE 审（peer stub 仍 PENDING），本裁决独立作出，alone ≠ dual。

### B-1 兑现核验表

| # | 处方要素 | 兑现证据（本 worktree 逐条可复现） | 结果 |
|---|----------|-----------------------------------|------|
| 1 | 改写面恰限行 5 + 三处回声 + base 重钉 + Status token | `git diff --numstat 4804c3dc a265d6f8` = 恰 4 文件 `+18/−18` 零增删行（slice 5 / harness 7 / 两 stub 各 3）。逐行核对：harness = §2a 行 5 重写 + Base/Gap ids/§2a 标题三处 base 重钉（`1c4588f9`→`4804c3dc`）+ Status token×3；slice = One-line 回声 + Base 重钉 + Status token×3；两 stub = Scope 回声 + Base 重钉 + Status token×1——全部落在枚举面内，零越面 | PASS |
| 2 | 行 5 新口径 = 既有 bounded scan 实存 | 新行 5「**既有周期兜底扫描实存**…非『无周期兜底』断链」。代码实证：`main.ts:452` setInterval 全文件恰 1 处（`grep -c setInterval` = 1 · Langfuse 5s flush）· `main.ts:458-461` 代码自述 "bounded scan for listener outages" · `drain-loop.ts:14` `runDrainLoop(tick, intervalMs = 5000)` · `:31` `setTimeout(finish, intervalMs)` fallback · 每拍后 `waitForWakeOrInterval()` re-arm | PASS |
| 3 | 窗口由扫描周期上界约束（有界延迟窗） | `main.ts:462` `boundedIntEnv('WORKER_JOB_RECONCILE_INTERVAL_MS', 5_000, 1_000, 60_000)` 默认 5s；五 consumer loop `main.ts:488/:609/:612/:614/:616`（report/interview/quiz/diagnosis/route-classify）全部喂同一 `jobReconcileIntervalMs`；dual reconciler `model-invocation-reconcile.ts:129` `intervalMs = 30_000` + `usage-calibration-reconcile.ts:63` `intervalMs = 60_000`（同构 `runDrainLoop`）；`main.ts:709` 自报 "bounded reconciliation" | PASS |
| 4 | 强制 periodic reconcile 未在 sole stack 证明 → GAP 仍 OPEN | 新行 5「GAP = **强制 periodic reconcile 未在 sole stack 证明**（GAP 仍 OPEN）」+「**未证明 ≠ 不存在**」。backlog `:95` SSOT 原文「reconcile 未在 sole stack 证明 → 漏唤醒窗口」逐字对应、零重译；backlog blob 三点全等（`git rev-parse 4804c3dc:a265d6f8:worktree = 28c7656447762bf1e2740b4ad38433202888d236`）SSOT 零触碰 | PASS |
| 5 | `main.ts:452` 仅字面事实引用 | 新行 5 对 452 表述 = 「worker main 唯一 `setInterval` 字面 = 无关 5s flush timer）仅作字面事实引用」——不再由 452 推断「无周期兜底」；字面复核 `sed -n '452p'` = Langfuse flush timer，唯一性成立 | PASS |
| 6 | Ban 两头漂移 | 新行 5 尾「**Ban 两头漂移**——不许写成『已修复/无窗口』，也不许宣称既有扫描可关闭 `:95` GAP（强制 reconcile 的 sole stack 证明仍缺）」双向锁定；`:74`/`:95` OPEN 在 4 文件全保留 | PASS |
| 7 | 三处回声同步 | slice One-line + 两 stub Scope 新口径逐语义一致（drain-loop 周期 tick + 五 loop 默认 5s 认领 + dual reconciler 30s/60s + 452 仅字面 + 强制 reconcile 未证明 = OPEN 依据 + 未证明≠不存在） | PASS |
| 8 | 其余 byte 保留（D1 逃生门原文） | D1 逃生门三处 byte-intact（均在 diff 面外）：harness §1-D1 `:27` + §3 `:79` + slice `:21-23`；harness §0 backlog 原文引用、§2b/§2c、§8 Non-claims、slice §2b/§2c 与 Ban 全节未触碰；旧措辞「无周期兜底轮询」仅余 harness §2 表 `:35`（见残留裁决）；旧 Status token `awaiting_pre_exec_dual` 在 4 文件 grep = 0 residue | PASS |
| 9 | Status token / stub 不自批 | 新 token `draft:awaiting_re_pre_exec_dual` slice×3 / harness×3 / stub×1；两 stub Status 仍 **PENDING**、零 self-write 任何 PASS；零产品码（diff 全在 `ai-docs/delivery/` 4 md）；Pins 表 byte-intact 原值（NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PG LISTEN retained · actualSpendCny=null · `:74`/`:95` OPEN） | PASS |

上轮 B1 处方各要素（行 5 机制如实改写 + `:95` OPEN 依据改「未证明 ≠ 不存在」+ slice/stub 三处联动短语 + backlog `:95` SSOT 零触碰）**逐项兑现**；C-MOP-1 base 重钉兑现（声明 base `4804c3dc` = 实际 parent，零差）；C-MOP-2 兑现（改写只动该行与联动短语，未扩张范围）。

### 残留披露裁决（harness §2 表 `:35` 第 5 处摘要回声）

实现方披露 `:35`「诚实清单钉（lossy hint · **无周期兜底轮询** · 漏唤醒窗口）」不在处方枚举面内未动。裁决两段：
- **当时不动 = 诚实保留成立**：处方面纪律优先，静默扩面改 `:35` 反违 Ban 静默换范围；如实披露并留 RE-PRE 裁是正确动作，非隐匿。
- **本 RE-PRE 后不得再存 → 须修**：本审既已裁定 §2a 行 5 新口径与代码相符，`:35` 与之同文档自相矛盾，是 B-1 同款失实的最后残体；任何未来切流 REQUEST 引 §2 口径钉表都会再吸入同一谬误。→ 列入 **C-MOP-6：exec/授权前必修**（一行内替换对齐行 5 口径；若修 face 恰限该一行且语义对齐本审裁定内容，不重开 RE-PRE；越面即重开）。

### Blockers

- **0**（上轮唯一 Blocker B1 已兑现关闭）

### Conditions C-*（持续绑定 + 新增）

- **C-MOP-1～C-MOP-5（上轮）全部随卷继续绑定**：C-MOP-1 base 重钉已兑现；C-MOP-3 D1 边界永久锁 / C-MOP-4 §2b 非执行定义·flag 开启=cutover 本体须 MOP03 六门+BUG-REV-COND `:96` 四专家审 / C-MOP-5 pins 全值+PG LISTEN retained+`:74`/`:95` OPEN+actualSpendCny=null 原样保留——本重写全部未触碰，原值复核通过。
- **C-MOP-6（本审新增 · exec/授权前强制）**：harness §2 表 `:35` 摘要回声须一行内替换，对齐 §2a 行 5 新口径（含 Ban 两头漂移语义），修 face 恰限该行，修后 receipt 留痕；越面重开 RE-PRE。

### Peer 边界

alone ≠ dual：`mw-e2e-ha` stub PENDING 原样零触碰，本 PASS 不代签 peer、不约束 peer 独立结论；RE-PRE dual 生效以 peer 独立同判 + 协调方 AUTHORIZE 为准。本审零 coding · 零 prove 执行 · 零 live · 零 SSOT edit · 未读 `.env*` · git 写操作仅独立 worktree `rv/mop01r-model-op` · Ban push。

### 中文三行摘要

1. B-1 兑现成立：行 5 重写 + 三处回声 + base 重钉 + Status token 恰 +18/−18 零增删行零越面，新口径与代码逐锚相符（452 唯一 setInterval 字面 · 462 默认 5s 喂五 loop · drain-loop:14/:31 周期 tick · 双 reconciler 30s/60s · 709 自述 bounded reconciliation），「未证明 ≠ 不存在」作 `:95` OPEN 依据正确，D1 逃生门与 Pins/SSOT byte-intact。
2. 残留裁决：harness `:35` 第 5 处摘要回声当时不动 = 诚实保留成立（处方面纪律 + 如实披露），但 RE-PRE 后不得再存 → C-MOP-6 exec 前必修一行对齐，恰限该行不重开 dual、越面重开。
3. 0 Blocker，Verdict PASS；PENDING 不自批、alone ≠ dual 不代签 mw-e2e-ha，PASS ≠ 授权 coding/prove/live/cutover。

*Reviewed by mw-model-op · RE-PRE dual · append-only · PASS ≠ AUTHORIZE · Ban push*

Verdict: PASS

---

## POST-PROVE dual 审查（mw-model-op · 2026-10-07 Asia/Shanghai · append-only · 立卷 exec 复验）

**被审对象**：exec `fe0c134a` / `fe0c134a1dfc6caf6969af6a6847adfede4fa64d`（origin tip · 含前置 micro-patch `46ad76cd`≡`f202091c`）。审阅基树 = 独立 worktree `rv/mop01p-model-op` @ `origin/feat/mysql-schema-skeleton`（`git worktree add` EXIT=0 · 禁 push）。本审看不到 `mw-e2e-ha` 的 POST 审（并行另派），本裁决独立作出，alone ≠ dual。协调方 AUTHORIZE 属 exec commit 内声明，本审不复查授权行为本身，只审 exec 面与条件兑现。

### 包完整性

- patch-id 等价双向实证：`git show fe0c134a | git patch-id --stable` = `9cb7e1e7bfdf45f38d683d7f1cb1bb38681a0bba` ≡ `b95313a9`；`git show 46ad76cd | git patch-id --stable` = `43a2cdf50f5bd1e20d0000928004ecc62b9dade0` ≡ `f202091c`。
- `git diff --numstat fe0c134a^ fe0c134a` = **恰 2 md**：harness `7+/5−` + slice `6+/4−` = `+13/−9`（派单口径「+22/−9」= 总变更行数 22 = 13+9 的记账口径差，内容零差 · 如实披露非缺陷）。全部落在 lifecycle 元行：头部 token / Status / Draft-era historical blockquote 新增 / Authority / Experts / §8 gate 行 `:141` / 页脚；零其他文件。
- micro-patch `46ad76cd` = 恰 1 文件 1+/1−，恰限 harness `:35`。
- 零产品码：`git diff 4804c3dc fe0c134a -- apps/ packages/db/src packages/db/migrations` = 空。
- SSOT：MOP01 包（`46ad76cd`+`fe0c134a`）对 backlog / coverage-matrix / master-checklist / queue **零触碰**；`46ad76cd^..fe0c134a` 区间内 backlog/matrix/checklist blob 变化全部归属 Line Y NAIL `9b60596e`（backlog `@@ -724,3 +724,16 @@` 尾部 append · diff 内 0 处 MOP01 字样 · `:74`/`:95` 行 verbatim 不动）；queue blob pre↔tip 全等（`87c812d9`）。
- 本审 RE-PRE 段 append-only 保留：review 文件 blob `9efd24360032109f632774173c67b7d25e1040ba` @ `a0ebe08` ≡ @ `a6b5cd94` ≡ @ tip，三点全等零改动。

### C-MOP-1～6 逐条裁决（POST 复验）

| 条件 | 内容 | 裁决证据（本 worktree 可复现） | 结果 |
|------|------|------------------------------|------|
| C-MOP-1 | base 重钉 `4804c3dc`（协调方已集成） | harness/slice Base 行原值 `4804c3dc`/full SHA；代码面 4804c3dc→tip 零 diff；锚点 tip 逐行抽验：`main.ts:452` 全文件唯一 `setInterval` 字面（Langfuse 5s flush）· `:458-461` 自述 "bounded scan for listener outages" · `:462` `boundedIntEnv('WORKER_JOB_RECONCILE_INTERVAL_MS', 5_000, 1_000, 60_000)` · `drain-loop.ts:14/:31` `intervalMs=5000`+`setTimeout` · `model-invocation-reconcile.ts:129` `30_000` · `usage-calibration-reconcile.ts:63` `60_000` · `worker-job-wakeup.ts:7-8/:15-17` · `worker-job-wakeup-redis.ts:50-53` value-gated `'1'/'true'/'on'`——零位移 | 兑现 |
| C-MOP-2 | 改写面纪律 零越面 | exec 恰 2 md 恰 lifecycle 元行；micro-patch 恰 1 行 `:35`；零产品码零 SSOT 零其他线（`--name-status` 全枚举核对） | 兑现 |
| C-MOP-3 | D1 边界永久锁 | harness `:27`/`:79` + slice `:21-23` 区段在 exec 与 micro-patch 全部 diff hunk 面外 byte-intact；§3 MOP03 六门准入×MOP01 工作面互补边界原样 | 兑现 |
| C-MOP-4 | §2b 非执行定义 | §2b 五项原样（flag 开启=cutover 本体 Ban · 保留 reconcile · wakeup prove 不命名不授权 · §2c 旧 prove 处置 · 本绿≠已迁随包输出）；`:75` GAP-MOP-02 未认领 | 兑现 |
| C-MOP-5 | Pins 全值持续 | harness `:116` + slice `:6`：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PG LISTEN retained · actualSpendCny=null 全原值；`:74`/`:95` OPEN verbatim | 兑现 |
| C-MOP-6 | `:35` micro-patch 兑现 | `f202091c`≡`46ad76cd` 恰 1 行：新 `:35` = 「既有周期兜底扫描实存（drain-loop 周期 tick + 五 loop 5s 认领 + dual reconciler 30s/60s）→ 漏唤醒 = 有界延迟窗 · 强制 periodic reconcile 未在 sole stack 证明 GAP 仍 OPEN」对齐 §2a 行 5 口径三要素；右格「BUG-NOTIFY-REC `:95` OPEN · Ban 写成已修复」byte-intact；兑现引用五处落字（slice `:3`/`:9` + harness `:3`/`:141` + exec commit message）；receipt 留痕 = `46ad76cd` commit + exec 引用链；恰限该行未越面 → 按本审 RE-PRE 原条件不重开 RE-PRE | 兑现 |

### 立卷完整性复验（exec 后零弱化）

- 工作面 §2 四 face 全保留：诚实清单钉 `:35`（随 C-MOP-6 对齐 = 强化非弱化）/ 切流包立卷 `:36` / 旧 prove 处置 `:37` / 口径钉 `:38` 后三行 byte-intact；§2a 诚实清单与 §2b/§2c 内容零触碰。
- 旧状态 `draft:awaiting_re_pre_exec_dual` 仅存于标注「Draft-era status（historical · retained）」blockquote（两文件各 `:5`）；live Status token = `executed:awaiting_post_prove_dual`；0 live residue。
- RE-PRE dual BOTH PASS 前置实证：`a6b5cd94`（mw-model-op）+ `07746c3c`（mw-e2e-ha）均为 `fe0c134a` 祖先（`git merge-base --is-ancestor` EXIT=0 双确认）。
- Ban 集持续：Ban Redis cutover / Ban MODEL-OP closed / Ban live / Ban coding / Ban prove execution / PG LISTEN retained / `:74`/`:95` OPEN / Ban 重复立卷（MOP03 六门只读引用不松动）/ Ban self-write `post_prove_dual_pass`——该 token 在两文件仅以 Ban 措辞与 MOP03 历史引用出现（harness `:91` = MOP03 nail `e29d8f93` 链引用），0 self-write。
- alone ≠ dual：本 PASS 不代签 `mw-e2e-ha`；POST dual 生效以 peer 独立 POST 审 + 协调方 nail 为准。

### Blockers

- **0**

### Conditions（POST 阶段持续绑定）

- **C-PD-1** alone≠dual：本审不代签 peer；`post_prove_dual_pass` token 属 POST 双审 BOTH + 协调方 nail 专属，Ban open POST here。
- **C-PD-2** `:74`/`:95` stays OPEN：立卷 lifecycle 推进 ≠ gap close ≠ cutover ≠ covered（coveredCount=8 冻结）≠ HA ≠ releaseEvidence 翻转。
- **C-PD-3** Ban 集持续：Redis cutover / flag 开启 / live / coding / prove execution / 重复立卷；实际切流须未来授权 REQUEST 同时过 MOP03 六门 + §2b 切流包内容。
- **C-PD-4** Pins 原值 + SSOT 零 MOP01 触碰持续；MOP01 状态如需入 backlog 登记属协调方 nail 阶段，本审不代写。
- **C-PD-5** append-only：本段落卷后不改；后续 nail/receipt 沿 git 史留痕；Ban push。

### 中文三行摘要

1. 包完整性成立：exec `fe0c134a`（≡`b95313a9` patch-id `9cb7e1e7`）恰 2 md `+13/−9` 全部为 lifecycle 元行推进（旧状态入 historical blockquote · 0 live residue），前置 micro-patch `f202091c`≡`46ad76cd` 恰 1 行 `:35` 对齐行 5 口径，零产品码零 SSOT（区间 SSOT blob 变化全归 Line Y NAIL `9b60596e` 尾部 append · `:74`/`:95` verbatim 不动），RE-PRE 段 blob `9efd2436` 三点全等 append-only。
2. C-MOP-1～6 逐条复验全部兑现（base 重钉锚点 tip 零位移 · 面纪律零越面 · D1/§2b/§2c byte-intact · Pins 十值原样 · `:35` 三要素对齐+右格 byte-intact+五处兑现落字），立卷四 face 零弱化，Ban 集与 `post_prove_dual_pass` 禁令持续（0 self-write）。
3. 0 Blocker，Verdict PASS；alone ≠ dual 不代签 mw-e2e-ha（其 POST 审并行另派看不到），PASS ≠ `post_prove_dual_pass` ≠ close ≠ cutover ≠ covered，nail 属协调方，Ban push。

*Reviewed by mw-model-op · POST-PROVE dual · append-only · PASS ≠ post_prove_dual_pass ≠ AUTHORIZE · Ban push*

Verdict: PASS
