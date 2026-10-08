# REQUEST — **DBM3-1 钱三轨 + 约束治理刀**（GAP-DEBT-DB-MONEY3 · 正数 CHECK + status 枚举 + 双重唯一索引删一）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-model-op`
**Knife**: `harness/dbm3-money-triple-track.md` · slice `dbm3-money-triple-track.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-money3` · docs-only REQUEST）
**Date**: 2026-10-07
**Line**: **DBM3**（台账 gap-bug-backlog.md:877 · P1）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|---|---|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false** |
| `actualSpendCny` | **null** |

## 请审什么（mw-model-op · schema/migration/SQL 正确性 · Ban 假绿）

Line DBM3 · 技术债台账 MONEY3 行（P1）清偿刀。请审 REQUEST（harness §1–§8）：

1. **审计真伪**：三轨映射表（§1.1：amount_cents int 无正数 CHECK / units 裸 numeric → entitlement_bucket numeric(12,2) 的 22003 落点窄口链 payment.ts:84 / micro_cny 族齐备为参照实现）与你在 `48dee7a2` 的认知是否一致；ai_graph_run 11 值词表（§1.3 逐值 file:line 溯源 · 含 succeeded/completed 双终态并存）有无漏值。
2. **0144 正数 CHECK 语义**（§3.1）：`amount_cents > 0`（严格正）vs `>= 0`（0 元单合法否）——目录价 9900/24900 均正 · 0 元试用单走 gift 桶不经 payment_order（亲核）——请裁定符号边界；前置脏值检测 DO 块 fail-loud（脏行上报不洗）是否与 checksummed 部署链兼容。
3. **D1 两案裁定**（§3.2）：案A `ALTER COLUMN units TYPE numeric(12,2)`（rewrite + ACCESS EXCLUSIVE + **存量 typmod 静默舍入风险**——须 P0 前置证明 scale≤2）vs 案B CHECK-only（`units > 0 AND <= 9999999999.99 AND = round(units,2)` 零触碰）。mw-core 建议案B——从 schema 治理角度裁定（typmod 硬约束 vs 零回填纪律的取舍）。
4. **status 枚举 CHECK**（§3.3）：ai_graph_run 11 值（枚举只增不改 · migrating/paused 无写点词表值收录防未来合法演进被误拒）· consumption_record 镜像孪生 4 值（运行时零写点亲核 · 但 HYGIENE 台账登记死表在产——过渡 CHECK 与死表下线的张力 §1.4 如实入档）。D2/D6 裁定。
5. **双重唯一索引删一**（§1.5/§3.4）：保 0021 partial（ON CONFLICT 带谓词冲突目标只能推断 partial · interview-event.ts:32 亲核全库唯一仲裁引用）删 0027 约束——NULL 语义等价性（partial 不收录 NULL 行 vs 约束 NULLS DISTINCT）与写放大消除方向是否正确；D3。
6. **联动面闭环**（§1.6）：drift:prove 方向约束（sql/ 有迁移缺=红 → sql/01 fixture 须同刀对齐 L1）· migrate.proof:307 既有断言契约更新（L2）· 0143 双文件编号只登记（L3）——有无漏网消费者。
7. **prove 契约**（§4）：P0 脏值检测先行（含负样本注入自证检测器非恒真）· P1 catalog 具名断言 · P2 23514/22003 拒绝 · P3 三表写路径回归（payment_order 全链/entitlement_bucket saga/interview_event appendEvent 幂等）· P6 语句白名单静态门——断言集是否足以证明「约束生效 + 不变量零退化 + 零数据触碰」。
8. **硬 Ban 面**（§5）：历史迁移/业务语义/RLS/secrets/洗数据/共享 SSOT 均不动——确认无越界。
9. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · pins 全保留 · Ban retry-to-green。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D6 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-model-op · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
