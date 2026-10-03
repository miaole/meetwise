# REQUEST — **UC-018 UI failure backfill @ e88d386** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）  
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`  
**Knife**: `harness/uc018-ui-failure-backfill.md` · slice `uc018-ui-failure-backfill.slice.md`  
**Parent tip**: `315870e`（series open · not a prove tip）  
**Date**: 2026-10-02 (~21:00 PT)

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

Recorded failure stays EXIT 1 until a real re-run. Ban flip covered. Ban Line A file edits.

Dual PASS ≠ coding ≠ covered ≠ nail · No coding is authorized by this stub.

---

*Stub · awaiting expert pre-exec dual · STOP*


---

## 预执行审 · `2448dfe` · 2026-10-02 (~21:07 PT)

**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 peer · 只追加 · 不改 harness  
**审的 SHA**: `2448dfe`（UI failure backfill @ `e88d386` · L0 docs）· 祖先于 origin  
**分支已前移**: 点名 tip `5cd6cbc` 是祖先，不是当前 tip（`49ef158`）。本文件自 `2448dfe` 后无再改。  
**性质**: pre-exec only · 尚未为本刀跑 prove · 本审先前独立重跑 `uc018:ui:prove` 在无 `.next` 时 **EXIT 1**

### 对照禁令

禁止把这次失败翻成 covered。把 exit 1 当成功，或升级矩阵，则 FAIL。

### 计划是否守禁

- 记录表写明 `UI.json` `exit=1`，类 `E2E_FAILURE` / `web_not_ready`，原因是没有 `.next` 生产构建。与本审重跑一致。  
- Honesty：旧 harness 文字里的 EXIT=0 **不被**本 REQUEST 改写；机器回填不是 0；不翻 covered。  
- 目标是授权后二选一：在 `e88d386` 上真的跑到 EXIT 0，或明确披露「该 SHA 拿不到 0」并改做 tip 重跑。披露必须写出实际 tip SHA，且不得声称历史 exit 曾是 0。  
- 「Ban retune a nonzero historical exit into 0」。NEG：UI.json 为 1 时声称历史 EXIT 0 → fail。ADV：手改 UI.json 为 exit 0 → Ban。  
- Ban 改覆盖矩阵 / gap backlog / checklist，并写明不改 UC-018 或 UC-052 矩阵行。§1.1 保持 **partial**。  
- pins：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false。  
- 计划引用 JSON 字段 `evidenceOfRecord=true` 与 `exit=1` 并存。这是字段摘录，不是把失败计为成功。非 0 仍 fail-closed，不得当成 covered。

未把 exit 1 写成成功，也未升级矩阵。

### 裁定

**PASS**（条件化）。历史失败保持失败。未来的 0 只能来自新跑的新收据。

### Conditions

1. `uc018-receipt-backfill/UI.json` 的 `exit=1` 不得手改成 0。`web_not_ready` 不得记成功。  
2. 本审先前重跑 EXIT 1（无 `.next`）不是本刀绿。  
3. 若在 `e88d386` 再跑得到 0，必须是另一份新收据；旧 exit=1 保留，禁止 retune。  
4. tip 重跑必须写明实际 tip SHA。禁止 silent substitution，禁止声称 `e88d386` 的历史 exit 是 0。  
5. 不改矩阵、不翻 §1.1、不把 UI alone 写成 UC-018 covered。  
6. pins 不改口。EXIT=0 ≠ 产品绿 ≠ HA。Dual PASS ≠ coding ≠ nail ≠ covered。

### signature

**mw-rag-route** · 2026-10-02 (~21:07 PT) · UI failure backfill pre-exec **PASS** @ `2448dfe`（条件化）

Verdict: PASS
