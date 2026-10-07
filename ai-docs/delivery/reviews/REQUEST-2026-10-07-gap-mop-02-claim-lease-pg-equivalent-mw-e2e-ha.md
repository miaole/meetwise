# REQUEST — **GAP-MOP-02 `:75` claim/lease（PG 等价机制盘点 + 「选型后」切片定义）** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-mop-02-claim-lease-pg-equivalent.md` · `gap-mop-02-claim-lease-pg-equivalent.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `2fd78ea1` / `2fd78ea10cd1a2d47babb79604afc3f62977eebc`
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
| GAP-MOP-02 `:75` | **OPEN** · Ban flip CLOSED |

## Scope（待审）

docs-only REQUEST：按 backlog `:75` 原文把 GAP-MOP-02 claim/lease 工作面立卷——(a) §2a PG 侧 claim/lease 等价机制现状诚实清单（Q2 多路径 `FOR UPDATE SKIP LOCKED`：`report.ts` claimReport CAS+租约字段+attempts/version、interview/quiz/diagnosis/route 四路同构、mig 0088 reconcile 面；Q3 advisory `pg_advisory_xact_lock` 多路径：mig 0130 same-key claim 短锁+锁序防死锁、interview/quiz/diagnosis begin/abandon 面、budget/隐私/记忆面、cloud-test-serial 测试基建标注；dual reconciler 以行锁+幂等等价体现无显式租约；`worker-job-wakeup.ts:2-4`「claim leases remain the sole durable source of work」边界句）；(b) §2b 未来「选型后」claim/lease 实现切片内容定义（`:75` 证据列待建三项 claim multi-consumer / 锁互斥 / 过期-fence prove 不命名不授权 · 选型前置显式化 · Redis 腿须六门+MOP01 切流包+BUG-REV-COND 四专家审 · MySQL 腿 Ban 沿 GAP-SCH-01）；(c) §2c 现存局部 prove（claim-join / uc002-lease / report / commerce）≠ 待建三项替代的处置声明。**与 MOP01/MOP03 立卷边界**：MOP03 nail `e29d8f93` 六门准入合同与 MOP01 wakeup 工作面**只读引用不再立法**（Ban 重复立卷）——checklist `:1134`「GAP-MOP-02 `:75` 独立行本刀不认领」→ 本刀即该独立行认领刀。本刀零执行；prove 计划 named-not-run（`runtime:claim-join:prove` / `uc002:lease:prove` / `report:prove` / `commerce:prove` named for clarity · 待建三项不命名不授权 · Q4/Q5 与 wakeup 双 prove 零认领）· EXIT 契约预声明（attempts 全记录 · 诚实失败 · Ban retry-to-green · EXIT0≠已实现≠已选型≠cutover）。

## Ban（待审确认）

Ban coding · Ban prove 执行 · Ban live · **Ban Redis 顶替实现**（`SET NX PX`+fence 实现/原型/授权 · Redis claim/wakeup/queue 切流 · MOP03 六门不因本刀松动）· **Ban MySQL 8 同语义 claim 顶替实现**（PG-retained · GAP-SCH-01）· **Ban MODEL-OP closed claim** · Ban SLO forge / fake green · Ban 删 PG LISTEN · Ban `:75` flip CLOSED · **Ban 重复立卷**（MOP03 六门门 5/6 写死引用 · MOP01 `:74`/`:95` 面零触碰零认领）· Ban 认领 `:76` 面 · Ban self-approve（alone ≠ dual）· Ban 四专家审降级（BUG-REV-COND `:96` 对未来切片 REQUEST 持续绑定）· Ban SSOT edit · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push

## 裁决点（expert 裁量）

- **D1（生死点）· 原文属向裁决**：`:75` 的 claim/lease 概念是否 Redis 侧概念——implementer 读法「缺口列现状本身在 PG 侧（『Claim 仍…』自认）· Redis `SET NX PX`+fence 仅处置列候选」是否成立；若判 Redis 侧重心的读法成立，本刀显式改写收窄为「仅诚实登记 + 设计文档」（逃生门 harness §1-D1/§3 · Ban 静默换范围 · Ban Redis 顶替实现不因改写解禁）。
- D2：「选型后」前置口径（「选型」指 Q1 wakeup 选型还是 Q2/Q3 claim 机制选型；两读法下本刀均 docs-only，差别仅在 §2b 措辞强度）是否如 REQUEST 所述 · 选型未决 → 不实现。
- D3：Redis/MySQL 语义边界（Redis `SET NX PX`+fence 与 MySQL 8 claim 仅原文转述与候选登记 · Redis deferred ≠ STOPPED 沿 W5 · MySQL 腿 Ban 非 deferred 沿 GAP-SCH-01）。
- D4：与 MOP01/MOP03 重叠裁决（互补不重复读法是否成立；六门门 5/6 继承是否构成重复立法；若判重叠 → 收窄逃生门）。

本 stub 未跑 prove、未改产品码、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual review — `mw-e2e-ha`（append-only · 2026-10-07 · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-mop02-e2e-ha` · branch `rv/mop02-e2e-ha` @ `origin/feat/mysql-schema-skeleton` = `bab29111`）。被审 REQUEST origin 镜像 `f8d9f615`（∈ origin 祖先）；line/mop02-claim-lease 原本 `93e0ffaf` 不在 origin 祖先但 patch-id **`f100ee66e5ed86d04a8d32585c233fce85b2a055`** 两副本实测等同。本审证据全部独立复测（worktree 内实读代码/SSOT/git 实证），不采纳不引用 peer `mw-model-op` 结论；alone ≠ dual，本 PASS 仅一票，不代签 peer。

## 1. 检查表（实测证据）

| # | 项 | 实测（mw-e2e-ha 独立复测） | 判 |
|---|----|------|----|
| 1 | REQUEST 祖先 + docs-only | `f8d9f615` ∈ ancestry(origin tip)=YES（`git merge-base --is-ancestor`）；base `2fd78ea1` ∈ ancestry=YES；`2fd78ea1..origin` 全链 `--name-only` 仅 `ai-docs/`（零码移，码锚在 tip 同有效）；REQUEST diff = 4 新 md（harness/slice/双 stub）+280/-0 · 零产品码 · 零 package.json · 零脚本 · 零 mig · 零 SSOT 文件 | OK |
| 2 | backlog `:75` 原文 | `git show 2fd78ea1:…gap-bug-backlog.md` 行 75 与 harness §0 引文逐字等同；`P0` · OPEN · 缺口列自述「Claim **仍**多路径 PG `FOR UPDATE SKIP LOCKED` — Q2；advisory `pg_advisory_*` — Q3」 | OK |
| 3 | 该行实辖表头 | `:55` = `| ID | P0/P1 | 现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径 |`——缺口列实名「**现状**」；harness §0 误引 `:66`（见 OB-H1）→ 强化 D1 读法 | OK（OB-H1） |
| 4 | §2a#1 report.ts | `DEFAULT_LEASE_SECONDS=120`（:8）· `MAX_REPORT_ATTEMPTS=3`（:10）· claimReport CAS→running+`lease_owner`/`lease_expires_at`+`attempts+1`+`version+1`+子查询 `FOR UPDATE SKIP LOCKED LIMIT 1`（queued 或租约过期 running 且 attempts<max）· markReportReady/Failed 仅持租约者 CAS · sweep 超限 `quarantined` — 全实读吻合 | OK |
| 5 | §2a#2 多路径 SKIP LOCKED | `interview-jobs.ts:143`（seq 序）· `quiz-jobs.ts:40` · `diagnosis-jobs.ts:38` · `job-route-decision.ts:393` + report.ts:34 —— `grep -rn "FOR UPDATE SKIP LOCKED" packages/db/src` 实测 ≥6 处 claim 面，「多路径」逐字成立 | OK |
| 6 | §2a#3 reconcile 面 | `model-invocation-reconcile.ts:64-68` 注释原文「locks candidates with `FOR UPDATE SKIP LOCKED`, so concurrent worker replicas divide the work」· `:127-131` `intervalMs = 30_000`+「below the minimum age」· `MODEL_INVOCATION_FINALIZATION_GRACE_MS = 30_000`（:25）· mig `0088:708` SKIP LOCKED 实存 | OK |
| 7 | §2a#4 advisory 面 | mig `0130:73-90` `pg_advisory_xact_lock(hashtext('meetwise:model_invocation_claim:'‖owner),hashtext(idempotency_key))` 短事务锁+既有行先取行锁同序防 permit↔invocation 死锁 · `interview.service.ts:198/:391/:557/:582/:856` · `quiz.service.ts:29` · `diagnosis.service.ts:30` 逐行实存 · `0050:329/:332/:343` 预算面 · `0076:97` 隐私面 · `0105:391` 记忆面 · `cloud-test-serial.ts:364/:494` `pg_try_advisory_lock`（harness 正确标注**测试基建非产品路径**）；`0050:401` 实为 SKIP LOCKED 非 advisory（见 OB-H4） | OK（OB-H4） |
| 8 | §2a#5 dual reconciler 诚实边界 | `usage-calibration-reconcile.ts` 「batch = 小时桶，同小时重跑幂等」（**:6**，harness 引 :5 ±1 · OB-H4）+ `intervalMs = 60_000`（:62-64）· 两 reconciler **无显式租约**如实登记（代码实况：小时桶幂等+行锁+30s grace，无 lease 字段）——不冒称已有跨进程租约 | OK（OB-H4） |
| 9 | §2a#6 wakeup 边界句 | `worker-job-wakeup.ts:2-4` 逐字「queue tables and claim leases remain the sole durable source of work」· `:15-17` 常量实存 —— MOP01 面零认领仅引用 | OK |
| 10 | named proves 行号 | `package.json:81/:107/:144/:196/:200/:211/:381/:476` 八条 CMD 逐一实测实存；REQUEST 零跑零新增（diff 无 package.json/脚本/receipt） | OK |
| 11 | MOP03 六门引用 | `e29d8f93` ∈ ancestry(`2fd78ea1`)=YES（合同先于本刀生效）；checklist `:1134` 引文 base/tip 双点实测逐字吻合，含「GAP-MOP-01 `:74` / GAP-MOP-02 `:75` 独立行本刀不认领」→ 本刀即认领刀；`:1134` 行号 base/tip 均准确 | OK |
| 12 | MOP01 立卷边界 | MOP01 nail `b95313a9` 实存（origin 镜像 `fe0c134a`）；REQUEST diff 零触碰 MOP01/MOP03 立卷工件；`:74`/`:95` 行号在 base 准确（tip 因 MOP01 nail backlog +2 行漂移 · OB-H3） | OK（OB-H3） |
| 13 | superseded 三重 | `adr-postgres-retained.md`（accepted direction pin · 2026-09-17 · supersedes sole-MySQL/Qdrant · Redis wake deferred pending user hard sentence）+ backlog `:80` GAP-SCH-01（STOPPED · Ban MySQL sole relational cutover；harness 误引 `:78` · OB-H2）+ `m3-queue-wakeup-selection.md` 头注（「Former framing … superseded」· 「selection draft」）— 三重实读吻合 | OK（OB-H2） |
| 14 | Pins 原值 | harness §6/slice/stub 三处同值实测：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · PG LISTEN retained · actualSpendCny=null · `:75` OPEN —— 与 MOP03 nail canonical pin 集（coverage matrix :490 行）逐项等同零漂移 | OK |
| 15 | 零实现边界写死 | 三文档一致：§2b 定义-only（待建三项不命名不授权）· §8 Non-claims · EXIT0≠已实现≠已选型≠cutover≠`:75` closed≠HA · Ban 借盘点宣称 ready/cutover —— Ban Redis cutover/删 PG LISTEN/`actualSpendCny=null` 全在位 | OK |
| 16 | 秘密/live | REQUEST diff 无 secrets/env；无 Key/网络/付费痕迹；author=mw-core 保留，本审 commit author=mw-e2e-ha 于独立 worktree，零 push | OK |

## 2. 裁决

- **D1（生死点）· 原文属向 — implementer 读法成立，收窄逃生门不触发**。独立事实链：(a) `:75` 实辖表头在 `:55`，缺口列实名「**现状**」，其内容「Claim **仍**多路径 PG `FOR UPDATE SKIP LOCKED` — Q2；advisory `pg_advisory_*` — Q3」的「仍」字与内容均自认 PG 侧既存——本审代码抽验证实 ≥6 处 SKIP LOCKED claim 面 + advisory 多路径（0130 同键短锁/interview/quiz/diagnosis/budget/privacy/memory）全部 PG 侧实存；(b) Redis `SET NX PX`+fence 与 MySQL 8 同语义 claim 仅出现于「目标」（处置）列，属旧 sole-stack 叙事候选，被三重 superseded 实证压制（ADR accepted pin + GAP-SCH-01 `:80` Ban + m3 头注「Former framing … superseded」）；(c) Redis 处置腿另被 MOP03 六门（`e29d8f93` ∈ base 祖先，合同先在）+ MOP01 立卷显式前置门控；(d) 拟切片列「M3 claim/lease 实现切片（**选型后**）」自携前置。**即便采对立的「Redis 侧重心」读法**：本刀产物已是逃生门要求的收窄形态（§2a 诚实登记 + §2b 设计文档 + 零实现零授权），两读法产物等价 → 无范围风险，不改判、不改写。
- **D2 — 「选型后」前置：implementer 口径成立（附精确化 OB-D2）**。`m3-queue-wakeup-selection.md` 实读：确含 Q2「关系表 job claim 主候选」（:76）/ Q3「Redis 租约主候选」（:88）**draft 措辞**，但 (a) 文件状态行自钉「**selection draft**」（:10）、(b) 全文以已 superseded 的 MySQL sole-relational 前提行文、(c) MySQL 腿被 GAP-SCH-01 Ban、(d) Redis 腿须六门 REQUEST——claim/lease 机制选型在 PG-retained 世界**无生效终局**；backlog `:74` 唯一 canonical 选型是 wakeup 侧（Q1「选型已钉 Streams 优选」）。选型未决 → §2b 前置不满足 → 零实现；残余歧义由 §2b#2「选型前置显式化」压给未来切片 REQUEST 自陈。**OB-D2 精确化：未来切片 REQUEST 禁引 m3 draft「主候选」充当选型终局**（两读法下本刀均 docs-only，结论不变）。
- **D3 — 成立**（随 D1/D2 复核）：Redis 腿 deferred ≠ STOPPED（W5/ADR「deferred pending a user hard sentence」原读吻合）· MySQL 腿 Ban 非 deferred（GAP-SCH-01 语义方向正确）；两腿零代码零原型零 flag 零授权。
- **D4 — 互补零重复立卷**。门 1-4（Q4/Q5 CMD / wakeup prove / 强制周期 reconcile / flag 默认关三代码锚）本刀零触碰零认领（§2a#5 仅现状登记、§2a#6 仅边界句引用）；门 5（PG LISTEN retained）与门 6（独立审≥dual/四专家不降级+两本账分离）以**写死引用**入 Pins——被引合同（`e29d8f93`）先于 base 生效，引用非再立法，措辞与 checklist `:1134` 逐字比对无放宽无升级。MOP01 `:74`/`:95` 面：仅引 `worker-job-wakeup.ts:2-4`（该句自身钉 wakeup=hint/claim=真相，引证支撑非重复立法）；MOP01/MOP03 立卷工件零 diff。checklist `:1134`「`:75` 独立行本刀不认领」→ 认领权归本刀。三刀互补（MOP03 准入合同 + MOP01 wakeup 面 + MOP02 claim/lease 面）结构成立；未来 claim 侧 REQUEST 缺一不可。

## 3. Fail-trigger audit（e2e/HA 焦点 · 0 hit）

| FT | 触发条件 | 实测 |
|----|----------|------|
| FT-1 | REQUEST diff 含非 docs（产品码/SSOT/脚本/package.json/mig/secrets） | 0 hit（4 md +280/-0 · 秘密扫描干净） |
| FT-2 | `:75` flip CLOSED / 宣称已选型/已实现/已收敛/ready/cutover | 0 hit（OPEN 写死 · Non-claims + EXIT0≠ 实现选型 cutover） |
| FT-3 | §2b 借定义走私 Redis/MySQL 实现或 prove 授权 | 0 hit（待建三项不命名不授权 · 两腿 Ban/deferred 写死） |
| FT-4 | 六门稀释/重复立法/MOP01 面越界认领/MOP01·MOP03 工件被碰 | 0 hit（D4 实测 · diff 零触碰） |
| FT-5 | §2a 盘点不诚实（锚不符/冒称租约/测试基建混淆/盘成 ready） | 0 hit（表 1 #4-#9 全锚独立复测吻合；dual reconciler 无显式租约如实登记；cloud-test-serial 正确标注测试基建） |
| FT-6 | Pins 漂移 / PG LISTEN 被删 / `actualSpendCny` 非 null | 0 hit（表 1 #14/#15） |
| FT-7 | prove 执行/新增脚本/receipt 伪造 | 0 hit（零跑零新增零 receipt） |
| FT-8 | 自批/作者混淆/push/代签 peer | 0 hit（REQUEST author=mw-core · 本审独立 author=mw-e2e-ha · alone≠dual 不代签 · 零 push） |
| FT-9 | HA 语义越权（借盘点宣称 HA/production claim 能力/releaseEvidence） | 0 hit（haStatus=NOT_HA · claimProductionHA=false · releaseEvidence=false 原值 held） |

## 4. Blockers

**0 Blocker。**

## 5. Observations（非阻断 · docs-side · exec 立卷登记时随手落实）

- **OB-H1 · 表头行号误引**：harness §0「列语义（表头 `:66`）」——`:66` 实为 GAP-UC052-POOL-ROLE-LEAK 行；`:75` 实辖表头在 **`:55`**（`现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径`）。引文行本身逐字无误；实际表头「现状」命名**强化** D1 读法。处置：exec 登记更正 `:66`→`:55`。
- **OB-H2 · GAP-SCH-01 行号误引**：harness §4 引「GAP-SCH-01（backlog `:78`）」——`:78` 实为 GAP-PROD-02，GAP-SCH-01 在 **`:80`**（base/tip 同）。内容引用（STOPPED · Ban MySQL sole relational cutover）属实。处置：更正 `:78`→`:80`。
- **OB-H3 · base-relative 行号漂移**：stub/harness 引 MOP01 面「`:95`」与 BUG-REV-COND「`:96`」在钉定 base `2fd78ea1` 准确（BUG-NOTIFY-REC/BUG-REV-COND）；origin tip 因 MOP01 nail（`14c14a31`）backlog +2 行插入漂至 `:97`/`:98`（checklist `:1134` 不受影响、base/tip 均准确）。处置：后续引用按行 ID 锚定非裸行号；exec 登记时同步刷新。
- **OB-H4 · 锚点精度**：(a) usage-calibration「同小时重跑幂等」括注在 **:6** 非 :5（同一 doc-comment 块，±1）；(b) `0050:401` 实为 `FOR UPDATE SKIP LOCKED`（Q2 族）被列入 Q3 advisory 行锚列——advisory 多路径主张由 :329/:332/:343 + 0076:97 + 0105:391 + service 面独立支撑，结论不受影响。处置：exec 时微调。

## 6. Conditions

- **C-E2E-1（落位与 patch-id 重验）**：origin 镜像 `f8d9f615` 已 ∈ origin 祖先（本审实测）；line 分支原本 `93e0ffaf` 仍在 `line/mop02-claim-lease`、非 origin 祖先——两副本以 patch-id `f100ee66e5ed86d04a8d32585c233fce85b2a055` 等同登记为 mirror；exec/登记落位前若再有码移，§2a 全部代码锚须在新 base 重跑实读（本次零码移已证 `2fd78ea1..bab29111` 仅 ai-docs/）。
- **C-E2E-2（alone ≠ dual）**：本 Verdict 仅 `mw-e2e-ha` 一票，不代签不引用 peer `mw-model-op` 结论（其 stub 未采信、其证据未复用为判据）；dual gate 以两 stub 各自 PASS 记录为准，缺一不生效；PRE BOTH PASS 后仍须协调方 AUTHORIZE 方可执行。
- **C-E2E-3（未来切片绑定）**：任何 claim/lease 实现/切流 REQUEST 须同时满足 MOP03 六门（准入 · 不因本刀松动）+ 本刀 §2b 内容清单（含 #2 选型前置显式化 · 禁引 m3 draft 主候选充当终局）+（若涉 wakeup 联动）MOP01 切流包 + BUG-REV-COND 四专家审（backlog 该行，行号随 OB-H3 刷新）；本刀 PASS ≠ 上述任一项预授。
- **C-E2E-4（OB 落实）**：OB-H1/H2/H4 行号更正与 OB-H3 行号刷新在 exec 立卷登记时随包落实（docs-side · 零 SSOT 行改动）。
- **C-E2E-5（EXIT 契约持续绑定）**：未来授权后任何 prove 按 §5 预声明执行——attempts 全记录（序号/Asia/Shanghai 时间窗/code SHA/EXIT）· 诚实失败路径 · Ban retry-to-green · EXIT0 ≠ 已实现 ≠ 已选型 ≠ cutover ≠ `:75` closed ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite ≠ covered。

## 7. 摘要（3 行中文）

1. D1 生死点独立复核裁 implementer 读法成立：`:75` 实辖表头 `:55` 缺口列实名「现状」自认 PG 侧既存（≥6 处 SKIP LOCKED + advisory 多路径全 PG 实证），Redis/MySQL 两腿仅处置列候选且被 ADR+GAP-SCH-01+m3 头注三重 superseded、再被 MOP03 六门（base 内已生效）+MOP01 立卷门控——收窄逃生门不触发，两读法下产物等价（诚实登记+设计文档零实现）。
2. e2e/HA 焦点实测：§2a 全锚独立复测吻合（report CAS+租约字段 120s/3 次、四路 SKIP LOCKED、mig 0130 短锁+锁序、dual reconciler 无显式租约**如实**登记、wakeup 边界句逐字、cloud-test-serial 正确标注测试基建）；docs-only 4 md +280/-0 零 SSOT、Pins 原值零漂移、零实现边界写死、D2 维持读法附 draft≠终局精确化、D4 互补零重复立卷；4 处行号/锚点精度 OB（:55/:80/:97-98 漂移/:6±1·0050:401 族属）非阻断。
3. 0 Blocker；C-E2E-1 落位 patch-id 重验（`f100ee66…` 两副本等同）· C-E2E-2 alone≠dual 不代签 peer mw-model-op · C-E2E-3 未来切片须六门+§2b+MOP01 切流包+四专家审 · C-E2E-5 EXIT 契约；本 PASS ≠ 编码 ≠ prove ≠ 选型 ≠ cutover ≠ `:75` closed ≠ HA。

Verdict: PASS
