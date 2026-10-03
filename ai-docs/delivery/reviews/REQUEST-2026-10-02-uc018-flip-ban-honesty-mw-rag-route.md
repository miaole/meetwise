# REQUEST — **UC-018 flip-ban honesty** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/uc018-flip-ban-honesty.md` · slice `uc018-flip-ban-honesty.slice.md`
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

UC-018 stays **partial**. A flip is still banned. `canHonestlyFlip=false`. This stub does not authorize a flip and does not edit the evaluator. UC-052 stays **partial**.

Dual PASS ≠ coding ≠ flip · No coding is authorized by this stub.

---

*Stub · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · `98b951e` · 2026-10-02 (~22:05 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 只追加 stub · 不改 harness · 不 nail · 本判不授权翻转  
**审的 SHA**: `98b951e` / `98b951e73c564c3b03bc175789cffe0559538186` · L0 docs · `draft:awaiting_pre_exec_dual`  
**分支已前移**: 该 SHA 是 origin 祖先，不是当前 tip。这四份文件自引入后无再改。按这一笔审。

### 禁令（harness / slice）

| 禁令 | 是否守住 | 出处 |
|------|----------|------|
| docs only，不改 `scripts/lib/uc-covered-evaluator.mjs`，不改 flip 逻辑 | 守住 | diff 仅四份 docs；harness `:3`、`:17`、`:26`；slice `:7`、`:11` |
| `canHonestlyFlip` 保持 false | 守住 | harness `:16-17`；slice `:11`；stub `:23` |
| 禁止 flip | 守住 | harness `:1`、`:3`、`:10`、`:25`、`:39`；slice `:7`、`:11` |
| coveredCount 保持 8，不指示改这个数 | 守住 | harness `:4`、`:16`、`:39`；slice `:4`、`:11` |
| UC-018 与 §1.1 保持 partial | 守住 | harness `:8`、`:16` |
| 不把 UC-018 写成 covered | 守住 | harness `:16`、`:28` |
| 不指示把 `canHonestlyFlip` 设成 true | 守住 | 全文只写 `=false`；harness `:17` 的「evaluator that can return true」是引用日后刀的既有条件，不是本 REQUEST 的指令 |
| pins 不改口 | 守住 | harness `:4`、`:39`；slice `:4` |

剩余原因已写明：本地 PERF/LOAD 不能单独覆盖该行（harness `:18`）；waiting_user `evidenceOfRecord=false`（harness `:19`）；历史 UI.json 在 `e88d386` 仍是 exit 1（harness `:20`）；UC-052 保持 partial（harness `:21`）。

### 裁定

**PASS**（条件化）。这是诚实文档。翻转仍被禁止，`canHonestlyFlip` 仍是 false，coveredCount 仍是 8。没有 evaluator 编辑，没有 flip 逻辑。

本 PASS 不是翻转授权。

### Conditions

1. 以后任何翻转刀，没有针对那一刀的新 dual，仍不能 flip。本判不算那次 dual。  
2. 不得把 `canHonestlyFlip` 写成 true，不得改 coveredCount，不得编辑 evaluator 来制造一次翻转。  
3. UC-018 与 §1.1 保持 **partial**。UC-052 保持 **partial**。历史 UI.json exit 1 不得被洗成 0。  
4. pins 保持 NOT_HA、releaseEvidence=false、claimProductionHA=false、gR45Closed=true、coveredCount=8、ms3EqualsR4Closed=false。  
5. Dual PASS ≠ coding ≠ flip ≠ covered。

### signature

**mw-rag-route** · 2026-10-02 (~22:05 PT) · UC-018 flip-ban honesty pre-exec **PASS** @ `98b951e`（条件化 · 不授权翻转 · 不 nail）

Verdict: PASS
