# REQUEST — **GAP-MOP-02 `:75` claim/lease（PG 等价机制盘点 + 「选型后」切片定义）** · pre-exec · `mw-model-op`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-model-op`
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

# PRE-EXEC dual review — `mw-model-op`（append-only · 2026-10-07 · docs gate only）

**Reviewer**: `mw-model-op`（独立 worktree `rv/mop02-model-op` @ origin/feat/mysql-schema-skeleton `14c14a31` · REQUEST 以 `93e0ffaf`（line/mop02-claim-lease · parent=钉定 base `2fd78ea1`）cherry-pick 落本分支为 `a76d6b30`，author 保留 mw-core；与本刀另一副本 `d7029c23`（本地 integration 分支）patch-id **`f100ee66e5ed86d04a8d32585c233fce85b2a055`** 完全等同 · 4 md +280/-0 docs-only 实证）。alone ≠ dual：本 PASS 仅 `mw-model-op` 一票，不代签 peer `mw-e2e-ha`。

## 1. 检查表（实测证据）

| # | 项 | 实测 | 判 |
|---|----|------|----|
| 1 | REQUEST 祖先链 | `2fd78ea1` ∈ ancestry(d7029c23)=YES；两副本 patch-id 等同（见上）；origin tip `14c14a31` 仅领先一个 docs-only NAIL 提交（checklist+backlog 登记，零码移）→ base 码锚在 origin tip 同样有效 | OK |
| 2 | docs-only | `git show --stat d7029c23`：4 md（harness/slice/双 stub）+280/-0；零产品码、零 SSOT（backlog/matrix/checklist/queue 零 diff）、零 `package.json`、零脚本、零 mig | OK |
| 3 | backlog `:75` 原文 | `git show 2fd78ea1:ai-docs/delivery/gap-bug-backlog.md` 行 75 与 harness §0 引文**逐字等同**；该行实辖表头在 `:55`（现状/目标/归属域/拟切片/所需 harness 路径）→ 见 OB-1 | OK（OB-1） |
| 4 | §2a#1 report.ts 锚 | claimReport CAS→running+`lease_owner`/`lease_expires_at`+`attempts+1`+`version+1`+`FOR UPDATE SKIP LOCKED LIMIT 1`（queued 或租约过期 running 且 attempts<max）；`DEFAULT_LEASE_SECONDS=120`（:8）/`MAX_REPORT_ATTEMPTS=3`（:10）；markReportReady/Failed 仅持租约者 CAS；退避 `least(power(2,attempts)::int,300)`=封顶 5min；sweepReports 超限 `quarantined` — 全部实读吻合 | OK |
| 5 | §2a#2 四路同构 | `interview-jobs.ts:143`（seq 序+SKIP LOCKED+租约字段+同面试 running 兄弟守卫）· `quiz-jobs.ts:40` · `diagnosis-jobs.ts:38` · `job-route-decision.ts:393`（route_pending SKIP LOCKED）— 实读吻合，「多路径」逐字成立 | OK |
| 6 | §2a#3 reconcile 面 | `model-invocation-reconcile.ts:64-68` 注释原文「locks candidates with `FOR UPDATE SKIP LOCKED`, so concurrent worker replicas divide the work」；`:127-131` `intervalMs = 30_000`+「below the minimum age」；mig `0088:708` SKIP LOCKED — 实读吻合 | OK |
| 7 | §2a#4 advisory 面 | mig `0130:73-90` `pg_advisory_xact_lock(hashtext('meetwise:model_invocation_claim:'‖owner),hashtext(idempotency_key))`+既有行先取行锁同序防 permit↔invocation 死锁；`interview.service.ts:198/:391/:557/:582/:856`·`quiz.service.ts:29`·`diagnosis.service.ts:30` 逐行实存；`0050:329/:332/:343/:401`·`0076:97`·`0105:391`；`cloud-test-serial.ts:364/:494` `pg_try_advisory_lock`（harness 正确标注**测试基建非产品路径**）| OK |
| 8 | §2a#5 dual reconciler 诚实边界 | `usage-calibration-reconcile.ts:5`「同小时重跑幂等」+`:62-64` `intervalMs = 60_000`；`MODEL_INVOCATION_FINALIZATION_GRACE_MS=30_000`（:21-25）——两 reconciler **无显式租约**如实登记、不冒称已有跨进程租约 | OK |
| 9 | §2a#6 wakeup 边界句 | `worker-job-wakeup.ts:2-4` 原文逐字「queue tables and claim leases remain the sole durable source of work」；`:15-17` 常量——MOP01 面零认领、仅引用 | OK |
| 10 | named proves 行号 | `package.json:81/:144/:211/:107/:196/:200/:381/:476` 八条 CMD 逐一实存；REQUEST 零跑零新增 | OK |
| 11 | MOP03 六门引用 | `e29d8f93` ∈ ancestry(2fd78ea1)=YES（合同在本刀 base 已生效）；checklist `:1134` 引文逐字吻合，含「GAP-MOP-01 `:74` / GAP-MOP-02 `:75` 独立行本刀不认领」→ 本刀即认领刀 | OK |
| 12 | MOP01 立卷边界 | `b95313a9` 实存（MOP01 exec 立卷）；本刀零触碰 `:74`/`:95` 面，仅边界句只读引用 | OK |
| 13 | Pins 原值 | harness §6/slice/stub 三处同值：NOT_HA/false/false/gR45Closed=true/coveredCount=8/ms3EqualsR4Closed=false/PG-retained/DELETE=503/PG LISTEN retained/actualSpendCny=null/`:75` OPEN——与 MOP03 nail `e29d8f93` canonical pin 集逐项等同 | OK |
| 14 | Ban 列完整 | coding/prove 执行/live/Redis 顶替/MySQL 顶替/MODEL-OP closed/删 PG LISTEN/`:75` flip/重复立卷/self-approve/四专家降级/SSOT edit/secrets/force-push/push 全在 | OK |
| 15 | EXIT 契约预声明 | attempts 全记录 · 诚实失败 · Ban retry-to-green（`:68` 先例）· EXIT0≠已实现≠已选型≠cutover≠closed | OK |

## 2. 裁决

- **D1（生死点）— implementer 读法成立，收窄逃生门不触发**。事实基础（全部实读）：(a) `:75` 该行实辖表头（`:55`）将缺口列命名为「**现状**」，其内容即 PG 侧既存事实——「Claim **仍**多路径 PG `FOR UPDATE SKIP LOCKED` — Q2；advisory `pg_advisory_*` — Q3」，「仍」字自认现状，且 §2a 代码锚实证 ≥6 处 SKIP LOCKED claim 面 + advisory 多路径全部 PG 侧；(b) Redis `SET NX PX`+fence 与 MySQL 8 同语义 claim 只出现在「目标」（处置）列，属旧 sole-stack 叙事候选——`adr-postgres-retained` + GAP-SCH-01（backlog `:80` STOPPED·Ban MySQL sole relational cutover）+ `m3-queue-wakeup-selection.md` 头注 2026-09-17（「Former framing … superseded」）三重 superseded；(c) Redis 处置腿另被 MOP03 六门（e29d8f93·base 内已生效）+ MOP01 立卷（backlog 登记「真实 Redis cutover 须未来授权 REQUEST 同过 MOP03 六门 + 本立卷切流包内容」）显式前置门控；(d) 「拟切片」列「M3 claim/lease 实现切片（**选型后**）」自携前置。故本刀=「PG 现状盘点+切片定义+诚实登记、零实现」与原文重心一致。**即便采 Redis 侧重心读法**，本刀产物已是逃生门要求的收窄形态（§2a 诚实登记+§2b 设计文档+零实现零授权），两读法下产物等价 → 无范围风险，不改判。
- **D2 — 「选型」指认：implementer 口径成立（附精确化，见 OB-2）**。`m3-queue-wakeup-selection.md` 实读：其确含 Q2/Q3「主候选」措辞（Q2 MySQL 8 claim 主候选 / Q3 Redis 租约主候选），但均为 (a)「selection **draft**」状态、(b) 以已 superseded 的 MySQL sole-relational 前提行文（「迁 MySQL 后」「迁栈候选」）、(c) MySQL 腿今被 GAP-SCH-01 Ban、(d) Redis 腿须六门 REQUEST——故 claim/lease 机制选型在 PG-retained 世界**无生效终局**；backlog `:74` 唯一被 canonical 钉定的选型是 wakeup 侧「选型已钉 Streams 优选」（Q1）。§2b#2「选型前置显式化」已把残余歧义压给未来切片 REQUEST 自陈依据 → 两读法下本刀均 docs-only，不实现结论不变。**D2 = 维持 REQUEST 读法；未来切片 REQUEST 必须按 §2b#2 写明选型状态，不得引用 draft 主候选充当终局**。
- **D3 — 成立**（核验随 D1/D2）：Redis 腿 deferred ≠ STOPPED（W5 口径如实转述）、MySQL 腿 Ban 非 deferred（GAP-SCH-01 语义方向正确）；两腿均零代码零原型零 flag 零授权。
- **D4 — 互补成立，零重复立卷**。MOP03 六门：门 1-4（Q4/Q5 CMD、wakeup prove、强制周期 reconcile、flag 默认关三代码锚）本刀零触碰零认领；门 5（PG LISTEN retained）与门 6（独立审≥dual/四专家不降级+两本账分离）以**写死引用**入 Pins——引用既有合同非再立法，措辞未放宽未升级。MOP01 `:74`/`:95` 面：仅引 `worker-job-wakeup.ts:2-4` 边界句（该句本身钉 wakeup=hint/claim=真相，是引用支撑而非重复立法）。checklist `:1134` 明写 `:75` 独立行 MOP03 不认领 → 本刀认领权清晰。未来 claim 侧 REQUEST 须同时过 MOP03 准入门+本刀 §2b 内容清单（若涉 wakeup 联动加 MOP01 切流包）——三刀互补结构成立。

## 3. Fail-trigger audit（0 hit）

| FT | 触发条件 | 实测 |
|----|----------|------|
| FT-1 | REQUEST diff 含非 docs（产品码/SSOT/脚本/package.json/mig） | 0 hit（4 md +280/-0） |
| FT-2 | `:75` flip CLOSED 或宣称已选型/已实现/已收敛 | 0 hit（`:75` OPEN 写死；EXIT0≠选型） |
| FT-3 | §2b 借定义走私 Redis/MySQL 实现或 prove 授权 | 0 hit（待建三项不命名不授权；两腿 Ban/deferred 边界写死） |
| FT-4 | 六门稀释/重复立法或 MOP01 面越界认领 | 0 hit（D4 实测） |
| FT-5 | §2a 盘点不诚实（锚不符/冒称租约/混淆测试基建） | 0 hit（表 1 #4-#9 全锚实读吻合；dual reconciler 无显式租约如实登记；cloud-test-serial 正确标注非产品路径） |
| FT-6 | Pins 漂移 | 0 hit（表 1 #13） |
| FT-7 | prove 执行/新增脚本/改 package.json | 0 hit |
| FT-8 | 自批/作者混淆/push | 0 hit（REQUEST author=mw-core 保留；本审 commit author=mw-model-op 于独立分支；零 push） |

## 4. Blockers

**0 Blocker。**

## 5. Observations（非阻断）

- **OB-1 · 表头行号引用漂移**：harness §0 称「表头 `:66`」并按 缺口/处置·验收/下一刀/证据 列名释义；该行实辖表头在 `:55`（`现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径`），缺口/处置 等列名属另一表（`:29`）。引文行本身逐字无误、语义映射成立，且实际表头「现状」命名**强化** D1 读法。处置：exec 立卷登记时顺手更正为 `:55`（docs-side，零 SSOT 行改动）。
- **OB-2 · D2 措辞精确化**：「`m3-queue-wakeup-selection.md` 钉的是 wakeup 侧（Q1）叙事」不应读作该文档无 Q2/Q3 内容——其含 draft「主候选」措辞但前提 superseded、非终局。结论不变（选型未决→不实现）；未来切片 REQUEST 禁引 draft 主候选充当终局（§2b#2 执行）。

## 6. Conditions

- **C-MO-1（base 重验）**：REQUEST 钉定 base `2fd78ea1`，origin tip 已进至 `14c14a31`（领先 1 个 docs-only NAIL 提交，零码移）；两副本均尚未成为 origin 祖先。exec/登记落位时须在 origin-anchored 分支上重验 base 祖先与 patch-id（本次实证 `f100ee66…`）；若落位前再有码移，§2a 代码锚须在新 base 重跑实读。
- **C-MO-2（alone ≠ dual）**：本 Verdict 仅 `mw-model-op` 一票；peer `mw-e2e-ha` 审查并行独立，本审不代签不引用其结论。dual gate 以两 stub 各自 PASS 记录为准，缺一不生效。
- **C-MO-3（未来切片绑定）**：任何 claim/lease 实现/切流 REQUEST 须同时满足 MOP03 六门（准入）+ 本刀 §2b 内容清单（含 #2 选型前置显式化）+（若涉 wakeup 联动）MOP01 切流包 + BUG-REV-COND `:96` 四专家审；本刀 PASS ≠ 上述任何一项的预授。
- **C-MO-4（OB 落实）**：OB-1 表头行号更正、OB-2 措辞精确化在 exec 立卷登记时随包落实（docs-side，零 SSOT 行改动）。

## 7. 摘要（3 行中文）

1. D1 生死点裁 implementer 读法成立：`:75` 缺口列（实辖表头「现状」）自认 PG 侧既存事实，Redis/MySQL 两腿仅处置列候选且被 PG-retained+六门+MOP01 三重门控，收窄逃生门不触发；本刀产物本即「诚实登记+设计文档」零实现形态。
2. §2a 盘点诚实性全锚实读吻合（report CAS+租约字段、四路 SKIP LOCKED、mig 0130 same-key 短锁+锁序、dual reconciler 无显式租约如实登记、wakeup 边界句逐字），docs-only 4 md +280/-0、零 SSOT、Pins 原值零漂移；D2 维持读法附 OB-2 精确化、D4 互补零重复立卷。
3. 0 Blocker；OB-1 表头行号 `:66`→`:55`、C-MO-1 落位重验 base/patch-id、C-MO-2 alone≠dual 不代签 peer；本 PASS ≠ 编码 ≠ prove ≠ 选型 ≠ cutover ≠ `:75` closed。

Verdict: PASS

---

# POST-PROVE dual review — `mw-model-op`（append-only · 2026-10-07 · docs gate only · 立卷 exec 复验）

**Reviewer**: `mw-model-op`（独立 worktree `rv/mop02p-model-op` @ `origin/feat/mysql-schema-skeleton` = `972c6c2f`）。**被审对象 = 立卷 exec `f6e16117f371f588f9a6b1127b887a23cfa51b60`**（branch `line/mop02-claim-lease` · parent=`1b85b58a`（= mw-e2e-ha PRE PASS commit）· author=mw-core · 恰 2 md +57/−26：harness +47/−18 + slice +10/−8 · lifecycle `draft:awaiting_pre_exec_dual` → `executed:awaiting_post_prove_dual` + §9 exec 登记 + OB docs-side 落实）。alone ≠ dual：本 PASS 仅 `mw-model-op` 一票；peer `mw-e2e-ha` 的 POST 审并行独立，本审不代签不引用其结论。本审 0 prove run · 0 coding · 0 SSOT edit · 0 push。

## 1. 包完整性（实测）

| # | 项 | 实测 | 判 |
|---|----|------|----|
| 1 | exec delta 恰 2 md | `git diff --name-only f6e16117^ f6e16117` = 恰 `gap-mop-02-claim-lease-pg-equivalent.slice.md` + `harness/gap-mop-02-claim-lease-pg-equivalent.md`；numstat 10/8 + 47/18 = **+57/−26** 与申报逐字吻合 | OK |
| 2 | SSOT/产品码/package.json 零 diff | 同一 diff 对 backlog/checklist/matrix/queue/src/apps/packages/scripts/migrations/package.json 过滤 = **0 文件**；零新脚本零 receipt | OK |
| 3 | PRE 段 append-only 保留 | 本审查文件 blob @`bab29111`（PRE 整合落位）= @`f6e16117`（exec）= **`420f1190`** 全等；`bab29111` 对本文件为纯 append +70 行（本 PRE-EXEC dual 段），exec 零触碰 | OK |
| 4 | 旧态 blockquote 保留 | 两文件 Draft-era blockquote 与旧 Status 行 **byte-equal**（`diff` 实测 0 差异）· token 级零 live residue | OK |
| 5 | `:75` OPEN 维持 | 两文件新 Status 行均保留 **GAP-MOP-02 `:75` OPEN** 写死；Pins 行零漂移（§6 不在 diff）；Non-claims 实质零改动（仅行 ID 刷新） | OK |

## 2. C-MO-1~4 逐条裁决（本审 PRE Conditions 终局）

| Condition | 裁决 | 实测证据 |
|-----------|------|----------|
| **C-MO-1（base 重验）** | **SATISFIED · CLOSED** | 结构面亲证：`git diff --name-only 2fd78ea1 1b85b58a` = **16 文件全 `ai-docs/`**（非 ai-docs = 0）；`git diff --stat 2fd78ea1 1b85b58a -- src apps packages scripts migrations package.json` = **0 字节**；`f8d9f615`（REQUEST origin 镜像）∈ ancestry(`1b85b58a`) YES；`bab29111`（mw-model-op PRE PASS）∈ ancestry YES；exec base = `1b85b58a` ✓。锚点抽验（本审独立重跑 @`1b85b58a`）：`report.ts:8` DEFAULT_LEASE_SECONDS=120 / `:10` MAX_REPORT_ATTEMPTS=3 / `:23-42` claimReport CAS（`:29` lease_owner+lease_expires_at / `:34` FOR UPDATE SKIP LOCKED LIMIT 1）· 四路 `interview-jobs.ts:143`/`quiz-jobs.ts:40`/`diagnosis-jobs.ts:38`/`job-route-decision.ts:393` 全 SKIP LOCKED · reconcile `:21-25` GRACE=30_000 / `:64-68` 注释+SKIP LOCKED / `:127-131` intervalMs=30_000 · mig `0088:708` SKIP LOCKED · `0130:73-90` pg_advisory_xact_lock+FOR UPDATE 锁序 · `0076:97` · `0105:391` · service advisory interview 5 处/quiz:29/diagnosis:30 · `cloud-test-serial.ts:364/:494` pg_try_advisory_lock · `worker-job-wakeup.ts:2-4` 边界句逐字 · `usage-calibration-reconcile.ts:5-7/:62-64`——全部吻合。SSOT 行号 tip 实测（`1b85b58a` 与现行 origin tip `972c6c2f` 双点）：`:55` 实辖表头 / `:68` / `:74` / **`:75` 无位移** / `:76` / `:80` GAP-SCH-01 / `:97` BUG-NOTIFY-REC / `:98` BUG-REV-COND；checklist `:1134` 六门合同逐字在位；named proves 八条 `package.json:81/:107/:144/:196/:200/:211/:381/:476` 逐行实存 |
| **C-MO-2（alone ≠ dual）** | **HELD · 持续** | 本 POST 段即单独一票；不代签 `mw-e2e-ha`（其审并行，本审不可见）；dual gate 以两审查文件各自 PASS 记录为准 |
| **C-MO-3（未来切片绑定）** | **HELD · 写死复证** | harness §9「C-MO-3/C-E2E-3 · 写死保留」四重要求原样在卷：MOP03 六门（不因本刀松动）+ 本刀 §2b 内容清单（含 #2 选型前置显式化 · 禁引 draft 主候选）+ MOP01 切流包（若涉 wakeup）+ BUG-REV-COND 四专家审；「本刀 PRE PASS/exec ≠ 上述任一项预授」逐字在位；§3 门 5「原样继承写死」/门 6「不降级」零改动；§2b#3 六门+切流包+四专家审链零松动 |
| **C-MO-4（OB 落实）** | **SATISFIED · CLOSED（逐项核对全过）** | 见 §3 OB 表 |

## 3. C-MO-4 · OB 落实清单逐项核对

| OB | exec 落实位置 | 本审独立实测 | 判 |
|----|---------------|--------------|----|
| OB-1/OB-H1 表头 `:66`→`:55` | harness §0 列语义行 | backlog `:55` @`2fd78ea1` 与 @`1b85b58a` **双点实测同位** = `\| ID \| P0/P1 \| 现状 \|…`（现行 tip `972c6c2f` 第三点同位）；「现状」列名确强化 D1 读法；`:66` 旧引已除 | OK |
| OB-H2 GAP-SCH-01 `:78`→`:80` | harness §4 来源表 | `:78` @base 实为 **GAP-PROD-02**、`:80` = **GAP-SCH-01**（base/tip 双点同位）——exec 更正方向正确 | OK |
| OB-H3 `:95/:96`→`:97/:98` 漂移刷新 | §1-D4/§2b#3/§3×2/§4×2/§7/Non-claims | 漂移归因**精确亲证**：backlog diff hunk `@@ -81,6 +81,8 @@` = MOP01 立卷登记 blockquote+空行 +2 行（位于 BUG 行之前）→ BUG-NOTIFY-REC `:95`→`:97`、BUG-REV-COND `:96`→`:98`；RAG02 nail append 在文件尾（`:739+`）不影响该两行编号；`base :93-98` 与 `tip :95-100` 逐行比对行 ID 逐一对应；exec tip 文件内 **零残留裸 `:95`/`:96`/`:66`/`:78` 旧引**（仅 @base 注记与 OB 行自述） | OK |
| OB-H4 `usage-calibration :6` ±1 · `0050:401` 移列 | harness §2a#5 锚更正 · §2a#4 移列 | `:5` = doc-comment 首行、`:6` = 「batch = 小时桶，同小时重跑幂等」括注实位（REQUEST 引 `:5` 同块 ±1 属实）；`0050:401` 实测 = **FOR UPDATE SKIP LOCKED**（Q2 族）、`:329/:332/:343` = **3× pg_advisory_xact_lock**——移列正确，advisory 主张由 `:329/:332/:343`+`0076:97`+`0105:391`+service 5/1/1 面独立支撑，结论不变 | OK |
| OB-2/OB-D2 m3 draft 禁引 | harness §2b#2 落字 | `m3-queue-wakeup-selection.md:10` = 「**状态**：selection draft · releaseEvidence=false」；`:76` = Q2「关系表 job claim 主候选」（前提「迁 MySQL 后」已 superseded）；`:88` = Q3「Redis 租约主候选」——落字「禁引 draft 主候选充当选型终局」事实准确、方向为**收紧**非放松 | OK |

## 4. 立卷完整性复验（三面零弱化 · 六门零松动）

- **盘点面（§2a）**：exec 仅动 row 4/5 锚（OB-H4 精度更正），row 1/2/3/6 byte-untouched（diff 实证）；row 4 移列后 advisory 证据链独立充分、结论句原样；row 5 诚实边界句「不声称二者已有跨进程租约」原样——**零弱化，纯精度提升**。
- **切片定义面（§2b）**：#1/#4/#5/#6 原样；#2 增补 draft 禁引（收紧）；#3 BUG-REV-COND 行 ID 锚定刷新（编号更新非语义改动）——待建三项仍不命名不授权、两腿 Ban/deferred 边界原样。
- **诚实登记面**：lifecycle 推进 = 元行+OB 落实+§9 登记，无范围偷换；旧态 blockquote byte 级保留；「Ban self-write `post_prove_dual_pass`」三处在卷、implementer **未自写任何 POST verdict**；「SSOT 登记属协调方 nail 阶段」如实；§8 Non-claims 实质零改动。
- **六门引用**：门 5/6 写死引用原样（§3 表 77/78 行实测）；§2b#3 与 §9 四重门链零松动；MOP01/MOP03 工件零 diff（exec 恰 2 md 自证）。
- **Pins**：NOT_HA/false/false/gR45Closed=true/coveredCount=8/ms3EqualsR4Closed=false/PG-retained/DELETE=503/PG LISTEN retained/actualSpendCny=null/`:75` OPEN——零漂移。

## 5. Fail-trigger audit（POST 面 · 0 hit）

FT-1 非 docs delta=0（恰 2 md）· FT-2 `:75` flip/选型宣称=0（OPEN held）· FT-3 §2b 走私=0（draft 禁引为收紧）· FT-4 六门稀释/重复立法=0 · FT-5 盘点不诚实=0（OB 更正全验）· FT-6 Pins 漂移=0 · FT-7 prove 执行/新增脚本=0 · FT-8 自批/push=0（exec author=mw-core · 本审 author=mw-model-op · 零 push）。

## 6. Blockers

**0 Blocker。**

## 7. Observations（非阻断）

- **OB-P1 · 任务简报关措辞 vs 拓扑（非 exec 方瑕疵）**：任务简报称「origin tip `972c6c2f` 已含 MOP02 exec」，git 拓扑实况为 `f6e16117` 与 `b5dd9aa3..972c6c2f`（GAP-PRIV-04 线）**同为 `1b85b58a` 的子提交、互为 sibling**（`f6e16117` 现仅存在于 `line/mop02-claim-lease`，尚未合入 origin/feat/mysql-schema-skeleton）。exec §9 自身申报「exec HEAD = tip `1b85b58a`」在其时点准确，无虚报；两 tip 侧提交对被审 2 md 零触碰、无内容冲突。处置：合并/落位时按行 ID 重验 SSOT 锚（本审已在 `972c6c2f` 预验：`:55`/`:75`/`:80`/`:97`/`:98` 零再漂移）。不影响本 Verdict。
- **OB-P2 · 惯例重申**：`f6e16117` 合入主线及后续任何 rebase 后，BUG-NOTIFY-REC/BUG-REV-COND 引用按行 ID 锚定复核（harness 已写死「按 ID 锚定非裸行号」，本审双点预验无再漂移）。

## 8. Conditions（POST 持续绑定）

- **PC-MO-1（C-MO-1 收口）**：base 重验接受——本审已在 exec base `1b85b58a` 独立重跑全部抽验锚；沿 OB-P2，后续合入/rebase 时按行 ID 复核 SSOT 锚即可，无需重跑代码锚（除非再有码移）。
- **PC-MO-2（alone ≠ dual）**：本 PASS 仅 `mw-model-op` 一票，不代签 peer `mw-e2e-ha`；POST dual gate 须两审查文件各自 PASS 记录齐备方生效；本审与其并行审互不可见、互不引用。
- **PC-MO-3（未来切片绑定持续）**：C-MO-3 四重门（MOP03 六门 + 本刀 §2b 含 #2 选型前置显式化/禁引 draft 主候选 + MOP01 切流包 + BUG-REV-COND 四专家审）对未来任何 claim/lease 实现/切流 REQUEST 持续绑定；exec 与本 POST PASS ≠ 上述任一项预授 ≠ 选型终局。
- **PC-MO-4（nail 边界）**：`post_prove_dual_pass` lifecycle 推进与 SSOT（backlog）登记属协调方 nail 专属；Ban self-write 维持；`GAP-MOP-02 :75` stays OPEN；PG LISTEN retained；本 PASS ≠ 编码 ≠ prove ≠ 选型 ≠ cutover ≠ `:75` closed。

## 9. 摘要（3 行中文）

1. 立卷 exec `f6e16117` 复验全过：恰 2 md +57/−26 零 SSOT 零码移、旧态 blockquote byte 级保留、`post_prove_dual_pass` 未自写、`:75` OPEN 与 Pins 原值零漂移；PRE 段 blob `420f1190` append-only 完整保留。
2. C-MO-1 收口（16 文件全 ai-docs 零码移 + 全锚独立重跑吻合 + SSOT 行号 base/tip/现行 tip 三点验证，`:75` 无位移、`:97/:98` 漂移归因 MOP01 +2 精确）；C-MO-4 五项 OB 逐项核对全过且均为收紧方向（表头 `:55`、GAP-SCH-01 `:80`、m3 draft 禁引、`0050:401` 移列证据链独立成立）；三面盘点/切片/诚实登记零弱化、六门零松动。
3. 0 Blocker；PC-MO-2 alone≠dual 不代签 peer mw-e2e-ha；OB-P1 非阻断（exec 与 origin tip 现为 sibling、被审面零冲突、合并时按行 ID 复核）；本 PASS ≠ 编码 ≠ prove ≠ 选型 ≠ cutover ≠ `:75` closed。

Verdict: PASS
