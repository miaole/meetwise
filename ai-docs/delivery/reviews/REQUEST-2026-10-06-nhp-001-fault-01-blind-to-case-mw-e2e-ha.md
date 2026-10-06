# REQUEST — **NHP-001-FAULT-01 · UC-001 FAULT blind→case evidence** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **re-PRE** · awaiting re-PRE · Ban self-approve · alone ≠ dual · 不代签 peer）
**Rewrite**: **supersedes REQUEST `db24fc9`** · cites mw-rag-route PRE-EXEC FAIL **`64fba04`**（`64fba0473955359e244e9c532d45e19cac6c9670`）**B1–B5 addressed** (+ C1–C3）· peer e2e PASS `899fef2` alone ≠ dual · Ban coding
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual）
**Knife**: `harness/nhp-001-fault-01-blind-to-case.md` · slice `nhp-001-fault-01-blind-to-case.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` tip（includes AL/AM/AG ancestors · Ban touch AL/AM/AG files）
**Date**: 2026-10-06
**Line**: **AI**

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

## 请审什么（mw-e2e-ha · re-PRE · B1–B5 + C1–C3）

Line AI · NHP-001-FAULT-01。本 stub 为 **re-PRE rewrite**（**supersedes `db24fc9`** · cites FAIL **`64fba04`** · 解除 B1–B5 + C1–C3；peer PASS `899fef2` **alone ≠ dual**）。请审：

1. **B1 源锚 + 可执行设计**：harness 是否引用 `report-worker.ts:31-58` drain / `:61-70` sweep · `report.ts:7` ReportStatus / `:73-85` sweepReports · controller `:174-191` · service `:661-690`；注入点 = `ReportWorkerDeps.generate` 确定性 throw（不改产品）；CMD 拟 `pnpm uc001:nhp-fault:prove` via `run-e2e-isolated.mjs` · 期望 EXIT 明示。
2. **B2 钉码 + 正控 + mutation**：F1 → GET interview `completed` · GET report **200** `{status:'failed',content:null}`；F2 quarantined + `report_unavailable`；retry **200** `{requeued:true}` · export **404** `report_not_ready`；正控 good generate → **200** ready + `report_ready`；mutation assert id **`MUT-F1-stuck-running`** 真变红。
3. **B3 Ban relabel**：delta = UC-001 主链 begin→`/turn`→complete→report 注入失败后的 **HTTP 读口**；显式 Ban borrow `report:prove` / report-bulkhead / uc011 report-refund / uc019 report-regenerate 绿。
4. **B4 具名回归**：`uc001:nhp-neg:prove` 26 · `uc001:nhp-bound:prove` 17/17 · `report:prove` 须 EXIT0 零 proof 改动；env EXIT1（docker.sock / Key L0）≠ pass ≠ regression · 重跑 `with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL`。
5. **B5 单一证据层**：Nest HTTP + 隔离真 PG via `run-e2e-isolated.mjs`；Ban fake DB for ledger；Ban 矛盾 in-process 措辞。
6. **C1–C3**：驱动 `/turn`（`:30-33`）· Ban `/answer` 410；Y/AB 并列 prove+POST（`ff74522`/`51c0c0b` · `f8cdc82`/`5adb14f`）；attempts=1 · CMD+EXIT+±08:00+SHA · EXIT0≠covered≠FAULT upgrade≠nail≠HA。
7. **列诚实**：FAULT 列 stays **partial** · Ban flip · Ban wash Y/AB/AG · coveredCount=8。

UC-E2E-001 FAULT 列 stays **partial**（逐字）· row stays honest · **EXIT0≠covered** · coveredCount=8 · Ban wash Y NEG `ff74522`/`51c0c0b` / AB BOUND `f8cdc82`/`5adb14f` / AG ADV.

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban SSOT edit of matrix/backlog · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban 碰 AL/AM/AG 禁触文件 · Ban product/infra code · Ban borrow `report:prove` 绿 · Ban fake DB for ledger。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite · supersedes db24fc9 · FAIL 64fba04 B1–B5 · peer PASS 899fef2 alone≠dual · Ban coding · awaiting expert re-PRE dual · STOP*

---

## Historical peer note（alone ≠ dual · do not erase）

- **`899fef2`**（`899fef248d7d247f8425c037109ed4efde008e71`）· mw-e2e-ha PRE-EXEC PASS ×5 on prior wave tip（含 Line AI @`db24fc9`）· **alone ≠ dual**（rag FAIL `64fba04` ⇒ BOTH not PASS）· 历史旁证 · 不代签本 re-PRE。
- **`64fba04`** · mw-rag-route PRE-EXEC FAIL on `db24fc9` · B1–B5 · 正文保留于 rag stub · 本 rewrite 声称已解除 · **不**构成对新稿 PASS。
