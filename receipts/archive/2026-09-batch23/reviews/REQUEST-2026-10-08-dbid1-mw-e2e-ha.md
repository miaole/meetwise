# REQUEST — **DBID-1 ID 统一优化刀**（UUIDv7 渐进收敛 · A/B/C 级方案）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null  
**Expert**: `mw-e2e-ha`  
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

## 请审什么（mw-e2e-ha · prove 诚实/回归面/隔离纪律 · Ban 假绿）

Line DBID · 请审 REQUEST（harness §1–§9）：

1. **诚实面**：增益 claim 是否克制（仅「新行时间有序」结构事实 · **无 SLO/压测/性能量化声明**）；「A 级对 interview answer 族显式 id 路径是 no-op、须 B2 配套」这类不利事实是否如实入档（§2.2）。
2. **零回填保证的 prove 化**：P6 静态门（migration 文本零 UPDATE/DELETE/DROP COLUMN/TYPE 变更/触发器语句）+ P4 catalog 断言（55 表 DEFAULT=uuidv7() · bigint/boolean 面原样）是否足以证明 append-only；有无漏网 DDL 面。
3. **prove 契约可执行性**（§5）：P1 1000 次位域/单调/同 ms 碰撞 0 · 跨事务单调 · P3 10000 次零碰撞 + Spearman≥0.999 · P5 INSERT 冒烟（前 48bit=当前 ms 窗口）——阈值与样本量是否合理；attempts 全账 + Ban retry-to-green 纪律是否闭环。
4. **回归面清点**：B1 15 点替换（§3.2）波及 recruiter/job route/candidate route/qbank/free-text/commerce/quiz/interview/diagnosis 服务路径——`app_`+32hex=36 字符对 `RECRUITER_APPLICATION_ID` 上限 40 的余量、对外引用面（返回体/URL/日志）是否有 e2e 断言风险；B2 三点对 int-transcript 双写 fence 链路（0126）是否零扰动。
5. **排除面**（§3.4）：`qgen-` 冻结（CHECK+2 正则）· 裸 uuid→text 5 点残留 · token 面不动——是否同意，或要求登记进 gap 清单。
6. **隔离与安全**：prove 走 `assertIsolatedTestTarget` + 增量迁移（不重跑 baseline DROP 面）· Ban secrets · Ban 真实数据；migration 0143 对 0047/0048/0020/0046 已闭面的零触碰是否可验证。
7. **状态冻结**：pins 全保留（coveredCount=8 不变 · g7SuiteGreen=false · DELETE=503）· 本刀不关任何 e2e 门 · 不改共享 SSOT。
8. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · Ban self-approve。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D5 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-e2e-ha · 2026-10-08 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
