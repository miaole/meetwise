# REQUEST — **GAP-UC025-NEG-01 product wiring** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc025-neg-product-wiring.md` · slice `gap-uc025-neg-product-wiring.slice.md`
**Parent tip**: `58c0031`（series open · not a prove tip）
**Date**: 2026-10-02 (~22:00 PT)

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

Gap id **`GAP-UC025-NEG-01`** stays **OPEN**. Row **`UC-E2E-025`** stays gap. NEG column only. Do not claim UC-025 closed. Do not flip UC-018. UC-052 stays **partial**.

Dual PASS ≠ coding ≠ nail · No coding is authorized by this stub.

---

*Stub · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · `59bdbdf` · 2026-10-02 (~22:03 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 只追加 stub · 不改 harness · 不 nail · 本判不授权编码  
**审的 SHA**: `59bdbdf` / `59bdbdfa2818017d7e11cfab5773d7e72020c9a8` · L0 docs · `draft:awaiting_pre_exec_dual`  
**分支已前移**: 该 SHA 是 origin 祖先，不是当前 tip。文件自引入后无再改。按这一笔审。  
**上轮**: `04f6d33` 对 `pnpm uc025:nhp-neg:prove` @ `0271ee4` 的 EXIT 1 是诚实钉，不是产品通过。拒绝仍未接线。

### 禁令（harness / slice）

| 禁令 | 是否守住 | 出处 |
|------|----------|------|
| 范围只限 GAP-UC025-NEG-01 | 守住 | harness `:7-9`、`:24-26`；slice `:11` |
| EXIT 1 在接线前是未接线标记，不是 covered | 守住 | harness `:17-19`、`:22`「Do not write covered」；slice `:11` |
| 矩阵行保持 gap | 守住 | harness `:1`、`:9`、`:20`、`:41`；slice `:11` |
| FAULT / BOUND / ADV 不跑、不算过 | 守住 | harness `:20`、`:28`；slice `:11` |
| 禁止洗绿 / 禁止翻 covered | 守住 | harness `:22`；本 commit 不改矩阵 |
| 不扩到 UC-018 / UC-052 | 守住 | harness `:28`「Do not edit the UC-018 row or the UC-052 row」「Do not flip UC-018」；diff 无这两行、无矩阵 |
| 本 commit 不是编码授权 | 守住 | harness `:3`、`:26`；slice `:7` |
| pins 不改口 | 守住 | harness `:4`、`:41`；stub 表 |

diff 四文件：harness、slice、两份 PENDING stub。没有 prove，没有矩阵，没有 018/052。

### 裁定

**PASS**（条件化）。计划没有把 EXIT 1 写成 covered，没有把行抬离 gap，没有把 FAULT/BOUND/ADV 标成已跑或已过，也没有把刀做进 UC-018 / UC-052。

本 PASS 是预执行。它不是编码、不是 nail、不是 covered。harness 写「later dual PASS 之后才可编码」不得被读成「本判已经授权编码或授权跑 prove」。

### Conditions（事后必须看见，否则不算）

1. 在 begin 真正收下 quiz 工件并抛出 stale-quiz HttpException 之前，`pnpm uc025:nhp-neg:prove` 必须仍是 EXIT 1，`GAP-UC025-NEG-01` 保持 OPEN。EXIT 1 不得写成产品拒绝或 covered。  
2. 矩阵 UC-E2E-025 保持 gap（§1.0.1 NEG/FAULT/BOUND gap、ADV blind；§1.1 gap）。禁止洗绿。  
3. FAULT、BOUND、ADV 保持 not_run。即使日后接线使 NEG prove 变成 EXIT 0，那一笔 0 仍 ≠ covered，且不得顺手标这三列已跑。  
4. 不得改 UC-E2E-018 或 UC-E2E-052 的行、harness 或收据。UC-018 与 §1.1 保持 **partial**。  
5. pins 保持 NOT_HA、releaseEvidence=false、claimProductionHA=false、gR45Closed=true、coveredCount=8、ms3EqualsR4Closed=false。  
6. 旧 `pnpm uc025:stale-quiz-expiry:prove` 的 mark-red EXIT 0 不是本缺口通过。  
7. Dual PASS ≠ coding ≠ nail ≠ covered。

### signature

**mw-rag-route** · 2026-10-02 (~22:03 PT) · GAP-UC025-NEG-01 wiring spec pre-exec **PASS** @ `59bdbdf`（条件化 · 不授权编码 · 不 nail）

Verdict: PASS
