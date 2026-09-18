# 审查 — Meetwise R5 / sole-stack 诚实轨 · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：R5/sole-stack **eval-honesty**（status + mark-red 扩展 + isolated dual-track + fail-closed）  
**Harness / status**：`ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md` · `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`  
**releaseEvidence=false** · **≠ 退役** · **≠ HA** · **≠ cutover** · **≠ sole-stack 已迁生产** · **mark-red ≠ fixtures retired**

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 L0 标红/双轨钉；无偷升退役/HA/cutover/`releaseEvidence=true`） |
| 是否批准 **静态 mark-red + dual-track fail-closed** 登记 | **是** |
| 是否批 fixtures retired / 夹具已退役 | **否** |
| 是否批 isolated 默认已切 sole-stack | **否**（默认仍 `pgvector-legacy`；G1 仍开） |
| 是否批 sole-stack 已迁生产 / cutover | **否** |
| 是否批 HA / `releaseEvidence=true` | **否**（强制 false；L2/L3 未开） |
| BUG-FAKE-R5 | 仍 **INFLIGHT:mark-red**（≠ 关闭） |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/退役/发布）** | 不得把本切片 EXIT=0 / status Proven / dual-track banner 写成 **fixtures retired**、夹具已退役、R5 已关、sole-stack 已默认可信 | **强制遵守** · 本切片 **不关** 退役门 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated-to-prod；local green ≠ HA；need multi-instance + fault-inject | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（假绿面）** | **G1**：`run-e2e-isolated` **默认仍** `E2E_ISOLATION_STACK=pgvector-legacy` + `E2E_PG_IMAGE=pgvector/pgvector:pg16`；sole 请求 fail-closed EXIT=3（wiring GAP）≠ sole 已可跑 | **已核验成立** · 默认未切 |
| B4 | **阻塞（E2E 诚实）** | BUG-E2E-ISO / 宽 `e2e:isolated`·LIVE·performance 整套复跑 **未关**；本 prove **禁止**并入全量 E2E 绿叙事 | **仍开** |
| B5 | **立场钉（非缺陷）** | `mysql-stack:r5-mark-red:prove` / `conn-stack:r5-mark-red:prove` EXIT=0 = **标红诚实钉 only**；marked-red ≠ deleted；本绿 ≠ 已迁 | **强制遵守** |
| O1 | **nit（不降级）** | status/harness CMD 表未显式钉 sole=`EXIT=3`、bogus=`EXIT=2`（仅写「非 0」）；**代码** `process.exit(3|2)` + 本审复跑成立 | **不降级**；建议 status §5 补两行复现 CMD |
| O2 | **nit（不降级）** | 声称短名 `pnpm m5-fixtures:prove` **不存在**；实际 `pnpm mysql-stack:m5-fixtures:prove` / `conn-stack:m5-fixtures:prove`（本审以 node 等价复跑 =0） | **不降级** |

**冲突取更严**：他域若把 O1/O2 升 conditional，以更严为准。本域因运行时 fail-closed 与文档禁令齐全，维持 **pass**（仅 L0 诚实轨）。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| `harness/r5-retirement-sole-stack-status.md` | **成立**。Proven vs GAP；`releaseEvidence=false` · Not HA · ≠ cutover/migrated；G1 钉默认仍 legacy；L0–L4 阶梯诚实 |
| `r5-pgvector-fixture-mark-red.md` 扩展 | **成立**。双轨表 + Proven/GAP 摘要 + local green ≠ HA + sole 未接线 → 非 0 |
| `run-e2e-isolated.mjs` dual-track | **成立**。缺省写入 `pgvector-legacy`；sole=`mysql-qdrant-redis` → `process.exit(3)`；unknown → `process.exit(2)`；banner `R5-MARKED-RED` / `NOT sole-stack truth` |
| `mysql-stack.r5-mark-red.proof.mjs` | **成立**。根路径 forwarder → `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs`（body） |

### 对抗：默认 / fail-closed / 偷写禁区

| 检查 | 结果 |
|------|------|
| 默认是否仍 pgvector / `pgvector-legacy` | **是**。无 env 时 runner 写入 `pgvector-legacy`；默认 banner：`E2E_ISOLATION_STACK=pgvector-legacy` · `E2E_PG_IMAGE=pgvector/pgvector:pg16` · NOT sole-stack |
| sole 是否真 fail-closed | **是**。`E2E_ISOLATION_STACK=mysql-qdrant-redis` → EXIT=**3**，拒绝假绿；文案钉 wiring GAP |
| bogus 是否拒识 | **是**。`E2E_ISOLATION_STACK=bogus` → EXIT=**2** |
| 是否偷偷写 fixtures retired / 夹具已退役 | **未发现**（仅禁令/「≠ 夹具已退役」语境） |
| 是否偷偷写 HA / `releaseEvidence=true` / cutover / sole 已迁生产 | **未发现**；status L4「永远不自勾」；retrieval `annSearch` 仍在（prove 钉未切生产） |
| BUG-FAKE-R5 backlog | 仍 **INFLIGHT:mark-red**（非 closed） |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `node scripts/mysql-stack.r5-mark-red.proof.mjs`（≡ `pnpm mysql-stack:r5-mark-red:prove`） | **0** | 静态标红/双轨/status Proven·GAP 钉；**≠ 退役 · ≠ HA · ≠ releaseEvidence** |
| `node scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs`（≡ `pnpm conn-stack:r5-mark-red:prove`） | **0** | 同上（body）；NOTE 明示 ≠ fixtures retired |
| `node scripts/mysql-stack.m5-fixtures.skeleton.proof.mjs`（≡ `pnpm mysql-stack:m5-fixtures:prove`；**非**裸 `m5-fixtures:prove`） | **0** | M5 计划骨架；doc 钉 ≠ fixture retirement / RAG cutover complete |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | sole fail-closed；wiring GAP；Refuse silent fake-green |
| `E2E_ISOLATION_STACK=bogus node scripts/run-e2e-isolated.mjs isolated-env:prove` | **2** | unknown stack 拒识 |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0**（业务 leaf） | banner 仍 **pgvector-legacy** + R5-MARKED-RED；**证明默认未切 sole**（leaf 绿 ≠ 迁栈） |

Prove 摘要钉（独立观测）：r5-mark-red 全 PASS；`performance suite: 6 LEGACY/R5-MARKED-RED steps`；`sole track request fails closed`；NOTE：`isolated default switch still GAP`。

---

## mark-red ≠ 退役（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| mark-red EXIT=0 | **仅** eval-honesty 静态钉 |
| fixtures retired / 夹具已退役 | **否** |
| sole-stack 已迁生产 / cutover | **否** |
| HA / releaseEvidence | **false / Not HA** |
| 默认 isolation | **仍 pgvector-legacy** |

---

## 残留 GAP（status 对齐 · 未关）

G1 默认仍 legacy · G2 Qdrant-backed 未默认 · G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence

---

## 对照

- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`
- `ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md`
- `ai-docs/delivery/e2e-case-inventory.md` · `gap-bug-backlog.md` BUG-FAKE-R5
- 前次：`reviews/2026-09-10-r5-mark-red-mw-e2e-ha.md` · `…-followup-mw-e2e-ha.md` · `…-mw-rag-route.md`
