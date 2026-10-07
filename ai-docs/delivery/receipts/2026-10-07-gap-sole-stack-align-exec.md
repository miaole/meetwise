# Receipt / attempts 台账 — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包**（Line SS2 · EXEC · 方案 (a) 仅限）

**Status**: **`coding_prove_done:awaiting_post_prove_dual`**（STOP · post-prove 双审由协调方另派 · 禁自批 · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Date**: 2026-10-07
**Base**: `origin/feat/mysql-schema-skeleton` **`8c6860e3`** full `8c6860e33d925628771acaaa9de5bc2dbaa72cb6`（本刀 line 分支 rebase 后恰在其上；REQUEST `1688184c` 被识别为上游孪生 `d0754918`（patch-id `cda96d90` 双侧全等）自动跳过——REQUEST 内容已在 origin 链，含双审 PRE PASS `ce6757f0`（mw-e2e-ha）+ `388ce973`（mw-privacy-int）对 stub 的 append）
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-ss2` · `line/ss2-sole-stack`
**授权**: 协调方（meetwise bot）EXEC 授权 · **方案 (a) 纯文案对齐仅限**（双审候选裁决一致：(b) 常量改名不做须另立 REQUEST；先在红默认 documented-red）
**触碰面**: 仅 `scripts/run-e2e-isolated.mjs` header `:5-6` 注释行级替换（2 删 2 增 · 零标识符/值/控制流/exit/env/receipt 变更）

## 1. 改动本体（diff 全文 = 恰 2 行注释替换）

```diff
--- a/scripts/run-e2e-isolated.mjs
+++ b/scripts/run-e2e-isolated.mjs
@@ -2,8 +2,8 @@
  * NOTE (BUG-FAKE-R5): default image is pgvector via E2E_PG_IMAGE — legacy fixture /
  * fake-green risk. E2E_PG_IMAGE ≠ sole-stack truth; local green ≠ RAG migrated.
  * Dual-track: E2E_ISOLATION_STACK defaults to pgvector-legacy (explicit; never silent sole).
- * Intended sole default = mysql-qdrant-redis (MySQL+Qdrant+Redis). Allowlisted sole targets
- * (wiring / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant) may prove against compose MySQL+Qdrant+Redis
+ * Sole-track code-path label: SOLE_STACK='mysql-qdrant-redis' is a dual-track isolation label ≠ product stack truth; product stack pin =
+ * ai-docs/delivery/adr-postgres-retained.md (Postgres · PostgresSaver · pgvector retained; MySQL/Qdrant = historical local prototypes, no cutover authorized). Allowlisted sole targets
  * with receipts; non-allowlisted sole requests EXIT=3 with PREREQ checklist (forbid fake-green).
```

措辞忠实性自证：stale「Intended sole default」移除（ADR `:39` residual 关闭）；code-path label 框定与 post-AL banner（`:1936-1937`）同构；产品栈钉指向 `adr-postgres-retained.md`（Postgres · PostgresSaver · pgvector retained）；MySQL/Qdrant 表述为「historical local prototypes, no cutover authorized」= 历史原型保留态、**零删除/废弃措辞**、零 erasure-sink 越权、零 cutover 暗示。

## 2. attempts 台账（PRE/POST 双侧全录 · 每次运行一行 · 日志 `.tmp/ss2-attempts/`）

| # | 阶段 | CMD | EXIT | 说明 |
|---|------|-----|------|------|
| A1 | PRE-edit @`8c6860e3` | `node --check scripts/run-e2e-isolated.mjs` | **0** | `pre-nodecheck.txt` |
| A2 | PRE-edit | `pnpm g1-default-switch:prep:prove` | **0** | `pre-g1-default-switch--prep--prove.txt` |
| A3 | PRE-edit | `pnpm g3-e2e-pg-image:prove` | **0** | `pre-g3-e2e-pg-image--prove.txt` |
| A4 | PRE-edit | `pnpm conn-stack:r5-mark-red:prove` | **1** | `pre-conn-stack-r5-mark-red-prove.txt` · **documented-pre-existing-red**（见 §3）· 恰 1 FAIL：`run-e2e-isolated.mjs: must emit R5-MARKED-RED banner`（`:182` 门锚 AL 前字面量 `NOT sole-stack truth`） |
| A5 | PRE-edit | `pnpm mysql-stack:r5-mark-red:prove` | **1** | `pre-mysql-stack-r5-mark-red-prove.txt` · 根 forwarder → 同 conn-stack 扫描器，输出与 A4 等价（仅 pnpm 头两行异） |
| B1 | POST-edit（本刀 diff 在树） | `node --check scripts/run-e2e-isolated.mjs` | **0** | `post-nodecheck.txt` · C-HA-1 契约满足 |
| B2 | POST-edit | `pnpm g1-default-switch:prep:prove` | **0** | 与 A2 全等 → 零新增红 |
| B3 | POST-edit | `pnpm g3-e2e-pg-image:prove` | **0** | 与 A3 全等 → 零新增红 |
| B4 | POST-edit | `pnpm conn-stack:r5-mark-red:prove` | **1** | 输出与 A4 **byte-identical**（diff 空）→ 本刀既未修复也未加重先在红 |
| B5 | POST-edit | `pnpm mysql-stack:r5-mark-red:prove` | **1** | 同 B4（forwarder 等价） |
| N1 | named-not-run | `pnpm conn-stack:sole-wiring:prove` / `mysql-stack:sole-wiring:prove` 等 compose 依赖族 | — | 双审未要求（C-HA 授权面为注释级改动，不触 compose/spawn 合同）· 零 e2e 运行 |
| N2 | named-not-run | `packages/qdrant-store` adapter prove | — | 双审未要求 · 该 proof 扫描的双字面量 `/pgvector-legacy/ && /mysql-qdrant-redis/` 在 diff 前后均在场（`:1845-1846` 未动） |

**EXIT 契约核对**：PRE/POST 逐项全等（0,0,0,1,1 → 0,0,0,1,1）——**零新增红**；先在红按授权保持 documented-red，未修复、未 retry-to-green、未洗白、未夹带修复。

## 3. documented-pre-existing-red（C-HA-3 / C-SS2-2 处置）

- `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:182-184` 门 `/R5-MARKED-RED/ && /NOT sole-stack truth/` 在基线 `8c6860e3` 即红（Line AL `c633584` 改串后字面量不存在；A4/B4 实证 EXIT=1、恰 1 FAIL、根 forwarder A5/B5 同红）。
- **修复路径（改 prove 扫描正则以接受 post-AL banner 措辞）须双审 + 协调方显式授权，本刀不做**；该红保持原样入账，非本刀引入、非本刀可修复面。
- 注意：本刀新 header 行不含 `NOT sole-stack truth` 字面量（B4=A4 byte-identical 证明零交互）。

## 4. 零触碰面自证（C-HA-4 / C-SS2-3）

- `git status --porcelain` = 恰 1 文件（`scripts/run-e2e-isolated.mjs`）；diff 内 `E2E_ISO_STACK_NOTE`（`:2313-2314`）/ backlog `:63` / ADR Decision L7-14 / SSOT（matrix/checklist）/ `coveredCount=8` 关键词 **0 命中**。
- fail-closed 构造性保持：`:1854` EXIT=2、`:1881` G3 块、`:1897` fixture gate、`:2202-2220` env 注入、`:2282` defense-in-depth **零 diff**（g3 prove B3 EXIT=0 佐证）。
- 隐私面：公开 DELETE=503 冻结、RLS、0091/0125 主链、UC-052 行零触碰；PG-retained 叙事对齐方向与本刀措辞一致且无删除/废弃语义。

## 5. 状态与后续

- 本 receipt + header diff 组成 EXEC commit；**STOP——post-prove 双审由协调方另派（mw-e2e-ha + mw-privacy-int），禁自批**；backlog `:63` 行状态翻转、nail 均在彼时按彼时授权。
- attempts 原始日志：`.tmp/ss2-attempts/`（pre-*/post-* 共 10 文件 + exits 台账 2 文件，未入 git）。

---

*Receipt · SOLE_STACK align EXEC · coding_prove_done:awaiting_post_prove_dual · ≠ sole cutover · ≠ gap close · 零新增红 · STOP*
