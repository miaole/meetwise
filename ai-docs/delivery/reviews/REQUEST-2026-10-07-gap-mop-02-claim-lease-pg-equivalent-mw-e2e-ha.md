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
