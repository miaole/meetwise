# REQUEST — **GAP-UC004-FAIL-A3 NHP** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc004-fail-a3-nhp.md` · slice `gap-uc004-fail-a3-nhp.slice.md`
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

Gap id **`GAP-UC004-FAIL-A3`**. Case **`NHP-004-FAULT-01`** stays gap. Row **`UC-E2E-004`** FAULT column stays gap. Do not flip UC-018. UC-052 stays **partial**.

Dual PASS ≠ coding ≠ nail · No coding is authorized by this stub.

---

*Stub · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · `9a644bd` · 2026-10-02 (~22:04 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 只追加 stub · 不改 harness · 不 nail · 本判不授权编码  
**审的 SHA**: `9a644bd` / `9a644bd360c5b78f66240d8524e6502ef178fa80` · L0 docs · `draft:awaiting_pre_exec_dual`  
**分支已前移**: 该 SHA 是 origin 祖先，不是当前 tip。这四份文件自引入后无再改。按这一笔审。

### 禁令（harness / slice）

| 禁令 | 是否守住 | 出处 |
|------|----------|------|
| 范围只限 GAP-UC004-FAIL-A3 + NHP-004-FAULT-01 | 守住 | harness `:7-10`、`:26`；slice `:11` |
| FAULT 列保持 gap，不写成 covered | 守住 | harness `:1`、`:18-20`、`:39`；slice `:11` |
| 不碰 UC-018 / UC-052 | 守住 | harness `:10`、`:28`；slice `:11` |
| 本 commit 没有产品代码、不夹带修复 | 守住 | diff 仅四份 docs；harness `:3`、`:12`、`:26`；slice `:7` |
| 不发明验收标准、不加也不跑命令 | 守住 | harness `:22`、`:26`；slice `:11` |
| pins 不改口 | 守住 | harness `:4`、`:39`；slice `:4` |

`pnpm uc004:career-path:prove` 的 mark-red EXIT 0 不是收口（harness `:22`）。本 REQUEST 不跑它。

### 裁定

**PASS**（条件化）。计划把 FAULT 列留在 gap，没有把行标成 covered，没有改 018/052，也没有把产品修复写进 docs commit。

本 PASS 不是 fail-closed 证明，不是编码，不是 nail，不是 covered。

### Conditions

1. 在真正的 fail-closed prove 出现之前，`UC-E2E-004` FAULT 列与 `NHP-004-FAULT-01` 必须保持 gap。禁止把该行写成 covered。  
2. 不得扩到 `GAP-UC004-E2E-MAIN` / `GRAPH` / `GROWTH-A1A2` / `UNCERTAINTY`，也不得改 UC-018 或 UC-052 的行。UC-018 与 §1.1 保持 **partial**。UC-052 保持 **partial**。  
3. 旧 `pnpm uc004:career-path:prove` 的 EXIT 0 不是本缺口通过。  
4. pins 保持 NOT_HA、releaseEvidence=false、claimProductionHA=false、gR45Closed=true、coveredCount=8、ms3EqualsR4Closed=false。  
5. Dual PASS ≠ coding ≠ nail ≠ covered。本判不授权编码。

### signature

**mw-rag-route** · 2026-10-02 (~22:04 PT) · GAP-UC004-FAIL-A3 NHP pre-exec **PASS** @ `9a644bd`（条件化 · 不授权编码 · 不 nail）

Verdict: PASS
