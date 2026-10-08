# REQUEST — **DBID-1 ID 统一优化刀**（UUIDv7 渐进收敛 · A/B/C 级方案）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null  
**Expert**: `mw-model-op`  
**Knife**: `harness/dbid1-id-v7-unify.md` · slice `dbid1-id-v7-unify.slice.md`  
**Parent tip**: `0fe96fca`（branch `line/db-id-v7-unify` · docs-only REQUEST）  
**Date**: 2026-10-08  
**Line**: **DBID**

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

Line DBID · 用户直裁立项（「ID 太混乱…UUID 太 low…一并优化」）。请审 REQUEST（harness §1–§9）：

1. **审计真伪**：55 张 `DEFAULT gen_random_uuid()` 清单（§2.3）与 171/173 表口径差（§1.4）是否与你对 `0fe96fca` 的认知一致；三宗罪表述是否诚实（随机 v4 写放大/无前缀/双纪元）。
2. **`uuidv7()` SQL 函数设计**（§2.1）：48bit unix_ms + ver7 + rand_a12 + var10 + rand_b62 布局 · `clock_timestamp()` 时间源 · pgcrypto ACL 面（0121/0122 已处理）是否与现网兼容；IMMUTABLE `uuidv7_from_parts` 仅供 KAT 是否可接受。
3. **A 级零回填语义**（§2.2）：仅 `SET DEFAULT` · 列类型/FK/RLS 零变化 · 存量 v4 行 append-only 保留 · 表内 v4/v7 并存为预期终态——是否有隐藏破坏（默认值消费者/逻辑复制/备份面）？
4. **D1 范围裁定**：全 55 张一刀切 vs 最小面（核心 6 + checkpoint 族 2 + 高写入运行时）——mw-core 建议全 55（避免第四纪元）；请从 schema 治理角度裁定。
5. **B 级工厂与 18 替换点**（§3.1–§3.3）：`newEntityId` 白名单 fail-closed · `<prefix>_<32hex>`（D4 长度修正：草案 26hex/31 为笔误）· 同 ms 计数器单调 · B2（int-transcript 3 点显式 id）并入是否必要（A 级 DEFAULT 对该路径 no-op）。
6. **排除面**（§3.4）：`qgen-` 格式冻结（SQL CHECK + 2 domain 正则）· 裸 uuid→text 5 点残留 · 非 id token 面全保留——是否同意 D2/D3。
7. **prove 契约**（§5）：P1 位域/单调/碰撞 · P2 RFC 9562 KAT 三方比对 · P3 工厂 10000 次 Spearman≥0.999 · P4 catalog 55 表断言 · P5 INSERT 冒烟 · P6 migration 文本静态门（零 UPDATE/DELETE/TYPE 变更）——断言集是否足以证明「零回填 + 新行时间有序」。
8. **硬 Ban 面**（§6）：idempotency_key / 0020-0046 触发器 / 共享 SSOT / secrets 均不动——确认无越界。
9. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · pins 全保留 · Ban retry-to-green。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D5 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-model-op · 2026-10-08 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
