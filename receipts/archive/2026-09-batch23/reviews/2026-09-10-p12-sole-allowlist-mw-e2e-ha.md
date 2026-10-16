# 审查 — Meetwise P12 入 sole allowlist · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场工作臂；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · 初审 ~03:31–03:34；**复审** ~03:38–03:40）  
**切片**：**P12 入 sole allowlist**（`sole-stack:vectorstore-qdrant:prove`）；meetwise-core 送审 · **≠** 翻默认 · **≠** fixtures retired · **≠** G2 关 · **≠** covered · **≠** HA  
**Harness / status**：`ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P8/P12；**G1/G2 仍开**）· `scripts/run-e2e-isolated.mjs` `SOLE_WIRING_ALLOWLIST`  
**Runner / script**：`pnpm e2e-isolation:sole-vectorstore-qdrant:prove` → `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs sole-stack:vectorstore-qdrant:prove` → `pnpm -C packages/qdrant-store prove:vectorstore-qdrant`  
**releaseEvidence=false** · **Not HA** · **≠ default switched** · **≠ fixtures retired** · **≠ cutover** · **≠ disposable isolation** · **≠ covered** · **≠ G2 closed**


> **复审裁定（2026-09-10 PT ~03:38–03:40）**：父代理词汇升 **pass**（B5/B6 已清；live allowlist **恰 5**；`sole-qdrant-backed=0`；P13 **未**回 sole；G1/G2 仍开；仍仅窄批 P12 入名单）。详见文末「复审」节。
对照前次：`reviews/2026-09-10-g2-p12-vectorstore-qdrant-mw-e2e-ha.md`（P12 opt-in prove · **未**入 sole）；`reviews/2026-09-10-sole-allowlist-expand-mw-e2e-ha.md`（P8 四条 · **明确未批** P12 入名单）。本刀 = 把 P12 纳入 sole allowlist。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（复审后：B5/B6 已清；live allowlist **恰 5** 含 P12；五条 sole 均=0；非 allowlist=3；P13 **standalone only / 未回 sole**；仍仅窄批 P12 入名单 · ≠G2关 · ≠翻默认 · ≠HA） |
| 是否批准 **P12 `sole-stack:vectorstore-qdrant:prove` 入 sole allowlist 登记** | **是**（窄批；本审复跑 sole P12 =0；receipt 硬钉齐全） |
| 是否批准送审「名单现 **恰 5 条**」为当前树真相 | **是（复审）**（live `SOLE_WIRING_ALLOWLIST`=5；receipt allowlistLen=5；无 rag/memory-qdrant；初审时并发=7 已回退） |
| 是否批 **P13** `sole-stack:rag-qdrant` / `sole-stack:memory-qdrant` 入名单 | **否**（超出本刀送审面；另审；命名易与默认 rag/memory 混淆） |
| 是否批 isolated **默认已切** sole | **否**（默认仍 `pgvector-legacy`；G1 仍开） |
| 是否批 fixtures retired / `E2E_PG_IMAGE` 退役 | **否** |
| 是否批 G2 关 / `vectorstore:prove`/`rag*`/`memory*` **默认**已迁 | **否**（默认目标 sole 下仍 EXIT=3；G2 仍开） |
| 是否批 retrieval-store 已改 / 生产向量真相已挂 Qdrant | **否**（无 qdrant 字样；`annSearch` intact） |
| 是否批 cutover / migrated / covered / HA / `releaseEvidence=true` | **否**（强制 false；L2/L3 未开） |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿面）** | **G1**：`run-e2e-isolated` **默认仍** `pgvector-legacy`；P12 入 sole allowlist EXIT=0 **≠** 默认已切 sole | **已核验仍开** · 本切片 **不关** G1 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；sole P12 绿 ≠ covered ≠ HA | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（G2）** | P12 入名单 **≠** `vectorstore:prove`/`rag*`/`memory*` 默认已迁；**≠** G2 关；opt-in sole path ≠ 默认迁移 | **已核验仍开** · 本切片 **不关** G2 |
| B4 | **阻塞（E2E 诚实）** | 非 allowlist sole 请求必须 **EXIT=3 + PREREQ**；共享 compose ≠ disposable；禁止把 P12 sole 绿并入全量 E2E/LIVE/perf 绿叙事（G6 仍开） | **本审复现成立**（rag03/memory/`vectorstore:prove:raw` sole→3） |
| B5 | **阻塞（宣称面 · 本刀）→ 复审清除** | 初审 live=7 含 P13 sole；复审 live **恰 5**（无 `rag-qdrant`/`memory-qdrant`）；P13 = standalone `rag:qdrant`/`memory:qdrant` only；sneak sole-stack:*-qdrant → unsupported EXIT=1 | **已清（复审）** |
| B6 | **阻塞（并列诚实 · 条件）→ 复审清除** | 初审 `sole-qdrant-backed` EXIT=1；复审 `pnpm e2e-isolation:sole-qdrant-backed:prove` → **EXIT=0**（inventory 对齐 P13 standalone + allowlist 恰 5；仍钉 G2 开） | **已清（复审）** |
| B7 | **立场钉（非缺陷）** | sole P12 EXIT=0 = **allowlist 可跑 P12 opt-in prove + gate receipt only**；≠ 翻默认 / fixtures retired / G2 关 / HA | **强制遵守** |
| — | — | **P12 入名单代码/行为面（窄）** | **无额外阻塞**（P12 sole=0；默认拒绝=3；r5-mark-red=0；legacy=0；bogus=2；receipt `releaseEvidence=false`/`notHa`/`claimsForbidden` 含 `G2_closed`） |
| O1 | **nit（降级）** | 命名：`sole-vectorstore-qdrant` / `vectorstore:qdrant:prove` 与默认 `vectorstore:prove` 相邻；P13 现为 standalone `rag:qdrant`/`memory:qdrant` （已无 sole-* 命名混淆面） | **降为 nit**；外推仍由 B3 管 |
| O2 | **nit（不降级）** | Set 名仍 `SOLE_WIRING_ALLOWLIST`（历史命名；语义已远超 wiring） | **不降级** |

**冲突取更严**：他域若因 G1/G2/假绿面另升 **block**，以更严为准。本域复审后：**pass**（仅批 P12 入名单登记 + 「恰 5」现树真相；**不**批 P13 入 sole / G2 关 / 翻默认 / fixtures retired / HA）。

---

## 实际 allowlist（独立观测 · 全文）

### A. 送审声称 / 审初快照（首读 + 首张 P12 receipt · ~10:31:53Z）

当时 `SOLE_WIRING_ALLOWLIST` **5** 条：

1. `sole-stack:wiring:prove`
2. `sole-stack:ping:prove`
3. `sole-stack:qdrant-backed:prove`
4. `sole-stack:vectorstore-adapter:prove`
5. `sole-stack:vectorstore-qdrant:prove` ← **P12（本刀）**

**仍不在名单**：`rag03-route:prove:raw` / `memory:prove:raw` / `vectorstore:prove:raw`（及默认业务族）。

### B. 当前工作树 live（复跑结束 · 最新 P12 receipt）

`SOLE_WIRING_ALLOWLIST` **7** 条（并发 P13 已写入 runner）：

1. `sole-stack:wiring:prove`
2. `sole-stack:ping:prove`
3. `sole-stack:qdrant-backed:prove`
4. `sole-stack:vectorstore-adapter:prove`
5. `sole-stack:vectorstore-qdrant:prove` ← P12
6. `sole-stack:rag-qdrant:prove` ← **P13 · 本刀不批**
7. `sole-stack:memory-qdrant:prove` ← **P13 · 本刀不批**

**默认业务目标仍不在名单**（已复跑 sole→3）：`rag03-route:prove:raw`、`memory:prove:raw`、`vectorstore:prove:raw`。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| P12 入 sole allowlist | **成立**。Set / supported-target / command map / `package.json` `e2e-isolation:sole-vectorstore-qdrant:prove` 均含；command → `packages/qdrant-store prove:vectorstore-qdrant` |
| 名单「恰 5 条」 | **审初成立 → 审中失效**。live=**7**；不得再采信「恰 5」为定论 |
| rag/memory/**默认** vectorstore:prove 仍不在名单 | **成立**（默认 raw 目标 sole→3；与 opt-in `*:qdrant` 入名单区分） |
| sole P12 → 0 | **成立**（本审两次复跑） |
| sole + 非 allowlist → 3 | **成立**（rag03 / memory / vectorstore:prove:raw） |
| r5-mark-red → 0；default legacy → 0；bogus → 2 | **成立** |
| receipt 硬钉 | **成立**。`class=local_untrusted_sole_stack_allowlist_receipt`；`releaseEvidence:false`；`notHa:true`；`claimsForbidden` 含 `fixtures_retired` / `isolated_default_switched_to_sole` / `G2_closed` / `vectorstore_prove_default_migrated` / `HA` / `releaseEvidence=true` 等 |
| G2 仍开 / 未翻默认 | **成立**。status G2 字面仍开；默认 isolated-env banner `[R5-MARKED-RED] pgvector-legacy`；prove NOTE `STILL-GAP G2` |
| retrieval-store 未改 | **成立**。无 qdrant；`annSearch` intact |
| 入 sole ≠ G2 关 ≠ 翻默认 ≠ fixtures retired | **成立**（banner + receipt + status 三重钉） |

### 对抗抽查

| 检查 | 结果 |
|------|------|
| 入 sole → 被误写成 G2 关 / 默认已切 / covered / fixtures retired？ | **未发现 P12 路径偷写**；并行 P13 入名单抬高命名混淆面（B5/O1） |
| 默认 `vectorstore:prove` / rag / memory 偷进 allowlist？ | **否**（仍 EXIT=3） |
| `sole-rag-qdrant` / `sole-memory-qdrant` 是否本刀范围？ | **否** · 不批 |
| retrieval-store 被改接线？ | **否** |
| fail-closed：非名单=3、bogus=2 | **成立** |
| 假 HA / `releaseEvidence=true` | **禁止且未出现** |
| 「其他 4 条仍 0」可选抽查 | wiring=0 · ping=0 · adapter=0（末次）· **qdrant-backed=1**（B6） |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm e2e-isolation:sole-vectorstore-qdrant:prove` | **0** | P12 入名单可跑；banner ≠ default/fixtures；receipt `release_evidence=false`；prove 钉 G2/G1 GAP + retrieval-store PREREQ |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs rag03-route:prove:raw` | **3** | 非 allowlist · PREREQ fail-closed |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs memory:prove:raw` | **3** | 同上 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs vectorstore:prove:raw` | **3** | 默认 vectorstore **仍拒** sole（≠ P12 opt-in） |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 标红诚实；钉 allowlist 含 vectorstore-qdrant；≠ 退役 · ≠ HA |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0** | banner **pgvector-legacy** + R5-MARKED-RED → **默认未翻 sole** |
| `E2E_ISOLATION_STACK=bogus node scripts/run-e2e-isolated.mjs isolated-env:prove` | **2** | unknown stack 拒识 |
| `pnpm e2e-isolation:sole-wiring:prove`（可选） | **0** | 仍绿 |
| `pnpm e2e-isolation:sole-ping:prove`（可选） | **0** | 仍绿 |
| `pnpm e2e-isolation:sole-vectorstore-adapter:prove`（可选·末次） | **0** | 末次绿（中途曾因静态钉竞态红，已恢复） |
| `pnpm e2e-isolation:sole-qdrant-backed:prove`（可选） | **1** | deepen harness 未 inventory P13 opt-in → **不全绿**（B6） |

实现方送审 CMD/EXIT 与必做列一致；**仍不采信自报**，以本审复跑为准。送审「恰 5 条」与 live=7 **不一致**（B5）。

---

## 入 sole ≠ 升阶（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| P12 sole EXIT=0 | **仅** `sole-stack:vectorstore-qdrant:prove` allowlist 登记可跑 |
| 名单「恰 5 条」当前树真相 | **否**（live=7） |
| P13 rag/memory-qdrant 入名单 | **不批**（另审） |
| fixtures retired / 默认已切 sole | **否** |
| G2 关 / 默认 vectorstore·rag·memory 已迁 | **否** |
| retrieval-store 已改 | **否** |
| cutover / migrated / covered | **否** |
| HA / releaseEvidence | **false / Not HA** |

---

## 残留 GAP（对齐 status · 未关）

G1 默认仍 legacy · G2 Qdrant-backed 业务 prove 未默认（P10/P11/P12/P13 opt-in ≠ 关）· G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence  
L1–L4：P12 入 sole allowlist ≠ L1 关闭。

---

## 对照

- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P8/P12/P13 · G1/G2）
- `reviews/2026-09-10-g2-p12-vectorstore-qdrant-mw-e2e-ha.md`
- `reviews/2026-09-10-sole-allowlist-expand-mw-e2e-ha.md`
- `scripts/run-e2e-isolated.mjs` `SOLE_WIRING_ALLOWLIST`


---

## 复审（mw-e2e-ha · 清 B5/B6 · 2026-09-10 PT ~03:38–03:40）

**触发**：meetwise-core 送审自报 B5/B6 已修（不采信；独立复跑）。对照初审 conditional（live=7；`sole-qdrant-backed=1`）。  
**范围钉**：本刀只验收 **P12 入 sole allowlist** B5/B6；**不**批 / **不**代审并行 G2 P13 standalone prove。

### 复审结论表（覆盖初审「结论」中相关行）

| 项 | 复审裁定 |
|----|----------|
| 父代理词汇 | **pass** |
| B5（恰 5 / 无 P13 sole） | **已清** |
| B6（`sole-qdrant-backed`） | **已清**（EXIT=0） |
| P12 入名单登记 | **维持批准**（窄） |
| P13 入 sole | **否**（未回名单；standalone only） |
| G2 关 / 翻默认 / fixtures retired / HA / `releaseEvidence=true` | **否**（仍开 / 仍 false） |

### 实际 allowlist（复审 live · 全文）

`SOLE_WIRING_ALLOWLIST` **恰 5**（`scripts/run-e2e-isolated.mjs` + 最新 receipt `allowlistLen=5`）：

1. `sole-stack:wiring:prove`
2. `sole-stack:ping:prove`
3. `sole-stack:qdrant-backed:prove`
4. `sole-stack:vectorstore-adapter:prove`
5. `sole-stack:vectorstore-qdrant:prove` ← **P12**

**确认无**：`sole-stack:rag-qdrant:prove` / `sole-stack:memory-qdrant:prove`。  
**P13**：`pnpm rag:qdrant:prove` / `pnpm memory:qdrant:prove` = standalone package scripts only（`package.json` 无 `e2e-isolation:sole-rag*` / `sole-memory*`）。

### CMD + EXIT（复审独立复跑）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm e2e-isolation:sole-wiring:prove` | **0** | allowlist 仍绿 |
| `pnpm e2e-isolation:sole-ping:prove` | **0** | 仍绿 |
| `pnpm e2e-isolation:sole-qdrant-backed:prove` | **0** | **B6 清**；inventory 钉 allowlist=5 + P13 standalone；STILL-GAP G2 |
| `pnpm e2e-isolation:sole-vectorstore-adapter:prove` | **0** | 仍绿；G1/G2 钉开 |
| `pnpm e2e-isolation:sole-vectorstore-qdrant:prove` | **0** | P12 sole 仍绿；receipt `releaseEvidence=false` / `claimsForbidden` 含 `G2_closed` |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis … rag03-route:prove:raw` | **3** | 非 allowlist fail-closed |
| `… memory:prove:raw` | **3** | 同上 |
| `… vectorstore:prove:raw` | **3** | 默认 vectorstore 仍拒 sole |
| `… sole-stack:rag-qdrant:prove` | **1** | `unsupported_e2e_target`（**未**注册 / **未**回 allowlist） |
| `… sole-stack:memory-qdrant:prove` | **1** | 同上 |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 标红诚实；钉 allowlist 恰 5 · P13 OFF |
| 默认（无 stack）`… isolated-env:prove` | **0** | banner **pgvector-legacy** + R5-MARKED-RED → **默认未翻** |
| `E2E_ISOLATION_STACK=bogus … isolated-env:prove` | **2** | unknown stack 拒识 |

### 对抗抽查（复审）

| 检查 | 结果 |
|------|------|
| 是否又偷偷把 P13 塞回 sole allowlist？ | **否**（Set=5；无 rag/memory-qdrant；sneak target=unsupported） |
| B5 是否真清？ | **是**（源码 + receipt + r5-mark-red + qdrant-backed inventory 四重钉） |
| B6 是否真清？ | **是**（`sole-qdrant-backed` 复跑=0） |
| G2 / 默认是否偷关？ | **否**（status G2 仍开；默认 legacy banner；非 allowlist=3；receipt 禁 `G2_closed`） |
| 假绿风险 | **低（本刀窄面）**：sole 绿 ≠ G2 关 ≠ 翻默认 ≠ HA；并行 P13 standalone 审另刀——勿外推「rag/memory 已迁」 |

### 残留（未因本复审关闭）

B1 G1 默认仍 legacy · B2 禁 HA/`releaseEvidence=true` · B3 G2 仍开 · B4 非 allowlist=3 / 共享≠disposable · B7 立场钉 · O2 Set 名历史包袱。

