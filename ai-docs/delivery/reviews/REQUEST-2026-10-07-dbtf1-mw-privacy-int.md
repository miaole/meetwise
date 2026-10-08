# REQUEST — **DBTF-1 触发器函数族收敛刀**（公共函数库 + 版本 diff 对齐证明）· pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-privacy-int`
**Knife**: `harness/db-trigfam-unify.md` · slice `db-trigfam-unify.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-trigfam` · docs-only REQUEST）
**Date**: 2026-10-07
**Line**: **DBTF**

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

## 请审什么（mw-privacy-int · 隐私擦除面/RLS/封印保形 · Ban 假绿）

Line DBTF · gap-bug-backlog `GAP-DEBT-DB-TRIGFAM` P0（W2 首刀）。刀面含 `privacy_begin_checkpoint_erasure` 三份重贴收敛与 privacy 封印保形，请重点审：

1. **erasure 族收敛保形**（§1.2-③ · §2.2）：`privacy_begin_checkpoint_erasure(text,text)` 版本链 0048→0058→0096（擦除闭包逐刀扩 sink · 终端 ~500 行）· 0144 薄壳换体后签名/ACL/SECURITY 语义零变 · `checkpoint-privacy.ts:78` 唯一应用调用点保形——擦除闭包（sink 枚举顺序/级联/收据写入）是否可在库内等价承载而不引入隐私面回归。
2. **forbidden 封印保形**（§2.5-封印③）：`principal.ts:1010` `forbidden_worker_function`（`privacy_worker_executor` 禁 EXECUTE `privacy_begin_checkpoint_erasure`）——`tf_` 库成员（public · 非 SD · `REVOKE FROM PUBLIC`）是否**不构成** worker 可达旁路（库函数仅经族终端函数间接到达 · 无新 EXECUTE 受者）。
3. **RLS 零变声明**（§5-3）：收敛不碰任何 policy/schema ACL——`tf_` 库在 public 且 SECURITY INVOKER · 触发器路径仍以原函数属主/原 SD 语义执行——请确认无隐性提权或 RLS 绕行面。
4. **P4 伴族回归**（§4）：erasure 冒烟（请求落账+闭包计数与 0143 基线相等）+ P5 复跑 `prove:uc052-checkpoint-physical` · `privacy-erasure:prove`——隐私行为回归断言是否足量（如需增负例：worker 直调库函数应拒）。
5. **partial_confirmed 张力面**（§4-P2 · D8）：GAP-COMM-PARTIAL-PAIR（在册 P1）张力点 0046:162-166 逐字节保形断言（completed+partial_confirmed ⇒ 同 23514 同消息 · 只保形不裁决）——确认本刀不扩大张力、不预裁语义。
6. **状态机隐私邻接**（§2.3）：0082 终端语义（completed 数值完成禁止 · 历史完成行隔离为 assessment_unavailable/score NULL）在表驱动统一（方案 U）下保形——候选人评分不可用化路径（0051「unresolved 不是捏造零分」语义）无回潮。
7. **硬 Ban 面**（§5）与边界：secrets/真实数据零入树 · Dual PASS ≠ 开工 · 本 turn docs-only · pins 全保留。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D8 中隐私面相关项（D2/D6/D8 重点）意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-privacy-int · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
