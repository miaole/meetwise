# Slice — **INT01 · INT-TRANSCRIPT-01 生产 cutover 立卷（准入合同 · 沿 MOP03 六门先例）**（docs-only REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（零 coding · 零 prove 执行 · 零 SSOT（backlog / matrix / checklist 零改 · nail 阶段才登记）· **Ban 预授权六门任一** · **Ban cutover-ready claim** · **Ban 把立卷写成授权** · INT-TRANSCRIPT-01 stays blocked · alone ≠ dual · Ban nail until PRE BOTH + 协调方 AUTHORIZE）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · **public DELETE=503** · `:60`/`:64` OPEN · UC-052 partial · `INT-P0-RAW-QUEUE` open · PG LISTEN/Redis unchanged（无关本刀）
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Base**: `origin/feat/mysql-schema-skeleton` · **`313e04a7`** / `313e04a7fc0ca91ef60fb229802dd374f85cc93d`
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove · Ban push · Ban 预授权六门任一 · Ban cutover-ready claim
**Wave**: Line INT01（queue Phase 3 privacy ·「DELETE=503 freeze · INT-TRANSCRIPT-01 · GAP-PRIV-01 tenant≠RLS · GAP-PRIV-04 vector erase」）

## One-line

checklist `:173` 硬钉「这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover」+ `:169`「00 不授权 01 生产写入」；本刀 docs-only 沿 **MOP03 六门先例**把 01 生产 cutover 的授权口径**立卷**为六门准入合同（① 0091 生产级 issuer key 管理与轮换证明 ② 外部 sink 逐个 real-delete 证据（`:64` 关闭前提）③ 向量面 INT sink 作用域键设计（PRIV4 no-target 后续）④ 公开 DELETE 503→真删除开关合同 + 独立审 ⑤ 公平重放/幂等（同 key 同体回放 / 异体冲突 / 双 tab 一 winner）⑥ BUG-REV-COND 四专家审）+ §2b-0 结构前提（00 验证合同 / 同一部署迁移 target resolver+ledger+receipt+read=0 真实组合根 / dual-write 切换图切断明文）· **每门写死可执行判据 · 六门全过才可另立 cutover REQUEST · 不切流 · 不预授权 · 01 stays blocked · `:60`/`:64` stays OPEN · UC-052 stays partial**。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-int-transcript-01-cutover-contract.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-privacy-int.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-int-transcript-01-cutover-contract-mw-e2e-ha.md` |

## 现状诚实清单（浓缩 · 全文见 harness §2c · 逐条引 checklist 原文）

preview（0129 erasure-preview 盘点 + 0096/0125 begin 链接，回执固定未完成、`releaseEvidence=false`，公开预览下仍 503）· preview `/answers`（0092 rehearsal 账本 · `MEETWISE_PUBLIC_PREVIEW=1` 才可写 · 非预览 404 · 不入 apiContract · 不是 01 生产 write）· 公开 DELETE=503 冻结（GAP-PRIV-02 `:58`）· legacy `/turn` plaintext job payload = **`INT-P0-RAW-QUEUE` 不可洗**（checklist `:173` 原文）· 七类 TC 仍 planned/unmapped（`:173`/`:154`）· UC-052 stays partial（≠ covered ≠ 01）· 0091 本地合同已冻结但不做 JWS 验签、worker 走 0077、HTTP 未接线（`:173`）· AR `:64` OPEN（stub≠cloud · `cloudVendorDeleted=false` · NB-3）· PRIV4 `:60` 本地行级证据 ≠ close、INT sink='vector' no-target（`:1181`）· 账本 HTTP 证明须远程 Postgres · **Ban `pnpm db:up`**。

## Named proves（clarity only · 本 REQUEST 零执行 · I2 先例：named ≠ 授权）

`pnpm privacy-erasure:http:prove`（含 DELETE=503 pin）· `pnpm int-answer-dual-write-fence:prove` · `pnpm uc052:internal-erasure:prove` · `pnpm uc052:external-sink-retention:prove` · `pnpm uc052:external-sink-async-purge:prove` · `pnpm vector-plane-erasure:prove` · `pnpm qdrant-store:g5-erasure:prove` · `pnpm mem00-int00:prove-path`（#103）。生产组合根组合证 / issuer 轮换 / INT 向量 sink / DELETE 开关合同 prove **不命名不授权**（属未来 cutover REQUEST）。本刀不新增脚本、不改 `package.json`、不跑任何 prove。

## EXIT 契约（预声明 · 未来 prove 适用）

attempts 全记录（逐条 EXIT · Asia/Shanghai · code SHA · PRIV4 先例 1,0 全录）· 诚实失败原样入账 · **Ban retry-to-green**（`:68` flake 先例）· 单次 attempt 窗口预声明，重跑须新 REQUEST + 双审 · **EXIT0 ≠** cutover ready ≠ 六门任一关 ≠ 01 解禁 ≠ DELETE 开放 ≠ `:60`/`:64` closed ≠ UC-052 covered ≠ HA ≠ `releaseEvidence=true` ≠ suite green。

## Bans

- **Ban coding** / prove execution / live · Ban `pnpm db:up`
- **Ban 预授权六门任一** · **Ban 宣称 cutover ready** · Ban 把立卷写成授权 · Ban INT-TRANSCRIPT-01 flip/blocked 摘除
- Ban 公开 DELETE 开放（503 冻结）· Ban 0129 preview 回执写成完成 · Ban rehearsal purge 称删除闭环
- Ban `:58`/`:60`/`:64` flip · Ban UC-052 covered flip · Ban coveredCount 变动 · Ban SSOT edit（backlog / matrix / checklist 零改 · nail 阶段才登记）
- Ban `INT-P0-RAW-QUEUE` 洗白 · Ban 七类 TC 映射/翻行 · Ban 云 vendor 删除以 stub/`external_confirmed`（NB-3）/docs 自述顶替（D2）· Ban 四专家审降级/代指派（D3）
- Ban PG LISTEN/Redis 改动或引用为切流语义（无关本刀 · MOP03 面）· Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push** · Ban self-approve（alone ≠ dual）

*Slice · INT01 INT-TRANSCRIPT-01 cutover contract · `draft:awaiting_pre_exec_dual` · 零 coding · 零 prove 执行 · Ban 预授权六门任一 · Ban cutover-ready claim · DELETE=503 冻结 · `:60`/`:64` OPEN · UC-052 partial · alone ≠ dual · STOP（awaiting PRE dual）*
