# Slice — **MOP02 · GAP-MOP-02 `:75` claim/lease（PG 侧等价机制盘点 + 「选型后」切片定义）**（docs-only REQUEST · 立卷 executed · **`executed:awaiting_post_prove_dual`**）

**Status**: **`executed:awaiting_post_prove_dual`**（PRE dual BOTH PASS（mw-model-op `bab29111` + mw-e2e-ha `1b85b58a`）+ 协调方 AUTHORIZE 后 exec landed · REQUEST 自身即完整立卷产物 · exec = lifecycle 元行推进 + 双审 Conditions/OB docs-side 落实（行号精度 OB `:55`/`:80`/`:97-98` 漂移/`:6`±1·`0050:401` 移列 + OB-2 选型措辞精确化 · 详见 harness §9 清单）· exec 落 tip `1b85b58a`（同补丁 drop · 零码移 · C-MO-1/C-E2E-1 重验）· **Ban self-write `post_prove_dual_pass`**（POST 双审 + 协调方 nail 专属）· alone ≠ dual · 零 coding · 零 prove 执行 · 零 live · 零 SSOT · **Ban Redis 顶替实现**（`SET NX PX`+fence 属未来六门 REQUEST 自带 · 不命名不授权）· **Ban MySQL 8 同语义 claim 顶替**（PG-retained · GAP-SCH-01）· 现存局部 prove（claim-join / uc002-lease / report / commerce）**≠** `:75` 待建三项的替代 · **PG LISTEN retained** · **Ban Redis cutover** · **Ban MODEL-OP closed** · **GAP-MOP-02 `:75` OPEN** · **Ban 重复立卷**（MOP03 六门 `e29d8f93` + MOP01 wakeup 工作面只读引用不松动））

> **Draft-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 零 coding · 零 prove 执行 · 零 live · 零 SSOT · **Ban Redis 顶替实现**（`SET NX PX`+fence 属未来六门 REQUEST 自带 · 不命名不授权）· **Ban MySQL 8 同语义 claim 顶替**（PG-retained · GAP-SCH-01）· 现存局部 prove（claim-join / uc002-lease / report / commerce）**≠** `:75` 待建三项的替代 · **PG LISTEN retained** · **Ban Redis cutover** · **Ban MODEL-OP closed** · **GAP-MOP-02 `:75` OPEN** · **Ban 重复立卷**（MOP03 六门 `e29d8f93` + MOP01 wakeup 工作面只读引用不松动））
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · public DELETE=503 · **PG LISTEN retained** · `actualSpendCny=null`
**Date**: 2026-10-07（Asia/Shanghai）
**Base**: `origin/feat/mysql-schema-skeleton` · **`2fd78ea1`** / `2fd78ea10cd1a2d47babb79604afc3f62977eebc`（REQUEST 钉定）· exec 落 tip **`1b85b58a`**（同补丁 drop 落位 · `2fd78ea1..1b85b58a` 16 文件全 `ai-docs/` 零码移 · C-MO-1/C-E2E-1 base 重验随 exec 登记 harness §9）
**Authority**: meetwise — docs-only REQUEST · PRE dual BOTH PASS + 协调方 AUTHORIZE · 立卷 exec landed（lifecycle 元行推进 + OB docs-side 落实）· awaiting POST dual（Ban self-write `post_prove_dual_pass`）· Ban coding · Ban prove 执行 · Ban live · **Ban Redis cutover** · **Ban MySQL claim 顶替** · **Ban MODEL-OP closed claim** · **PG LISTEN retained**

## One-line

backlog `:75` **GAP-MOP-02**（缺口：Claim 仍多路径 PG `FOR UPDATE SKIP LOCKED` — Q2 · advisory `pg_advisory_*` — Q3；下一刀原文「M3 claim/lease 实现切片（选型后）」）本刀 docs-only **立卷 claim/lease 工作面**：§2a PG 侧等价机制现状盘点（job 表租约语义完整实存——`claimReport` CAS+`lease_owner`/`lease_expires_at`+`attempts`/`version`+SKIP LOCKED · interview/quiz/diagnosis/route 四路同构 + advisory 多路径 0130/interview/quiz/diagnosis/budget 面 + dual reconciler 以「行锁+幂等」等价体现无显式租约 + `worker-job-wakeup.ts:2-4`「claim leases remain the sole durable source of work」）+ §2b 未来「选型后」切片定义（`:75` 证据列待建三项：claim multi-consumer prove · 锁互斥 prove · 过期/fence prove——**待建不命名不授权**）+ 诚实登记（原文处置两腿属 superseded 栈叙事：MySQL 腿 **Ban** · Redis 腿 **deferred ≠ STOPPED** 须未来六门 REQUEST）· **选型未决前置不满足 → 不实现** · `:75` stays **OPEN**。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-mop-02-claim-lease-pg-equivalent.md` |
| Dual `mw-model-op` | `reviews/REQUEST-2026-10-07-gap-mop-02-claim-lease-pg-equivalent-mw-model-op.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-mop-02-claim-lease-pg-equivalent-mw-e2e-ha.md` |

## 对 `:75` 的解读（一句话 · 双审裁决点）

`:75` 的 claim/lease 缺口现状本身在 **PG 侧**（原文「Claim 仍…」自认），其「实现切片（选型后）」属旧 MySQL+Redis 叙事且「选型后」前置未决（MOP03 六门 + MOP01 立卷钉：Redis cutover 须未来六门 REQUEST）→ 本刀=PG 现状盘点 + 切片定义 + 诚实登记，**零实现**；模糊处（「选型」指 Q1 wakeup 还是 Q2/Q3 claim 选型）留双审裁决（harness §1-D1/D2 · D1 判 Redis 侧重心则收窄为「仅诚实登记+设计文档」逃生门）。

## 与 MOP01/MOP03 立卷的边界（一句话 + 逃生门）

MOP03 nail `e29d8f93` 立准入合同六门、MOP01 `b95313a9` 立 wakeup 工作面（`:74`/BUG-NOTIFY-REC · `:95`@base → `:97`@tip · 行 ID 锚定），本刀立 claim/lease 工作面（`:75`）——三刀互补；六门与 MOP01 面**只读引用不再立法**（checklist `:1134`「GAP-MOP-02 `:75` 独立行本刀不认领」→ 本刀即认领刀）；若双审判实质重叠，收窄为「仅诚实登记」（逃生门 harness §1-D1/§3）。

## Named proves（clarity only · 本 REQUEST 零执行 · I2 先例：named ≠ 授权）

`pnpm runtime:claim-join:prove`（`package.json:81`）· `pnpm uc002:lease:prove`（`:144`）· `pnpm report:prove`（`:211`）/ `pnpm commerce:prove`（`:107`）——均为**局部面证据**，≠ `:75` 待建三项替代；Q4/Q5（`:196`/`:200`）MOP03 域零认领；`worker-wakeup:prove`/`worker-wakeup-redis:prove`（`:381`/`:476`）MOP01 域零认领；`:75` 待建三项（claim multi-consumer / 锁互斥 / 过期-fence）**待建 · 不命名 · 不授权**。本刀不新增脚本、不改 `package.json`。

## EXIT 契约（预声明 · 未来 prove 适用 · 本 REQUEST 零执行）

attempts 全记录（逐条 EXIT · Asia/Shanghai 时间窗 · code SHA）· 诚实失败路径（EXIT≠0 原样入账 → 判 fail）· **Ban retry-to-green**（`:68` 先例）· EXIT0 ≠ 已实现 ≠ 已选型 ≠ cutover ≠ `:75` closed ≠ MODEL-OP closed ≠ SLO ≠ HA ≠ suite ≠ covered。

## Bans

- **Ban coding** / prove 执行 / live（Key · 网络 · 付费 · console spend）
- **Ban Redis 顶替实现**（`SET NX PX`+fence 实现/原型/授权 · Redis claim/wakeup/queue 切流）——MOP03 六门不因本刀松动
- **Ban MySQL 8 同语义 claim 顶替实现**（PG-retained · GAP-SCH-01）
- **Ban MODEL-OP closed claim** / SLO forge / fake green / `:75` flip CLOSED
- **Ban 删 PG LISTEN** without separately authorized cutover REQUEST
- **Ban 重复立卷**（MOP03 六门 + MOP01 工作面只读引用）· Ban 认领 `:74`/BUG-NOTIFY-REC（tip `:97`）/`:76` 面
- Ban self-approve（alone ≠ dual）· Ban 四专家审降级（BUG-REV-COND（`:96`@base→`:98`@tip · 行 ID 锚定）对未来切片 REQUEST 持续绑定）
- Ban SSOT edit（backlog / matrix / checklist / queue 零改）· Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push**

*Slice · MOP02 GAP-MOP-02 :75 claim/lease（PG 等价机制盘点 + 选型后切片定义）· `executed:awaiting_post_prove_dual` · 零 coding · 零 prove 执行 · Ban Redis/MySQL 顶替实现 · Ban MODEL-OP closed · Ban 重复立卷 · PG LISTEN retained · `:75` OPEN · alone ≠ dual · Ban self-write `post_prove_dual_pass` · STOP（awaiting POST dual）*
