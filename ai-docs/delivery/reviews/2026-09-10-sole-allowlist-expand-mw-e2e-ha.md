# 审查 — Meetwise sole allowlist 扩量（P8） · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场工作臂；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · ~03:25–03:30）  
**切片**：sole-stack **allowlist 扩量**（wiring → wiring|ping|qdrant-backed|vectorstore-adapter）；**≠** 翻默认 · **≠** fixtures retired · **≠** G2 关 · **≠** P12 入名单  
**Harness / status**：`ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（Proven **P8** allowlist wiring+expand）· `ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md`  
**Runner**：`scripts/run-e2e-isolated.mjs` · `SOLE_WIRING_ALLOWLIST` = 四条（见下）  
**releaseEvidence=false** · **Not HA** · **≠ default switched** · **≠ fixtures retired** · **≠ cutover** · **≠ disposable isolation** · **≠ covered** · **≠ G2 closed**

对照前次：`reviews/2026-09-10-sole-wiring-mw-e2e-ha.md`（仅 wiring）；本刀为 allowlist **扩量**，仍 ≠ 翻默认。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（sole allowlist **扩量登记**诚实；fail-closed 成立；无偷升 default/fixtures/HA/`releaseEvidence`/G2） |
| 是否批准 **allowlist 扩量登记** | **是**（仅四条 `sole-stack:{wiring,ping,qdrant-backed,vectorstore-adapter}:prove` + gate receipt） |
| 是否批 isolated **默认已切** sole | **否**（默认仍 `pgvector-legacy`；G1 仍开） |
| 是否批 fixtures retired / `E2E_PG_IMAGE` 退役 | **否** |
| 是否批 disposable per-run sole isolation | **否**（共享 compose.mysql-local ≠ disposable） |
| 是否批 G2 关 / rag|memory|`vectorstore:prove` 默认已迁 | **否**（G2 仍开；adapter allowlist ≠ 默认迁移） |
| 是否批 P12 `vectorstore:qdrant` 入 sole allowlist | **否**（本刀范围外；**已核验未入**） |
| 是否批 cutover / migrated / covered | **否** |
| 是否批 HA / `releaseEvidence=true` | **否**（强制 false；L2/L3 未开） |
| BUG-FAKE-R5 | 仍 **INFLIGHT:mark-red**（≠ 关闭）；扩量绿 ≠ R5 关 |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿面）** | **G1**：`run-e2e-isolated` **默认仍** `pgvector-legacy`；sole allowlist 虽扩至四条，扩量 EXIT=0 **≠** 默认已切 sole | **已核验仍开** · 本切片 **不关** G1 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；连通/adapter 绿 ≠ covered ≠ HA；need multi-instance + fault-inject | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（E2E 诚实）** | 非 allowlist sole 请求必须 **EXIT=3 + PREREQ**（禁假绿）；共享 compose ≠ disposable；禁止把扩量绿并入全量 `e2e:isolated`/LIVE/perf 绿叙事（G6 仍开） | **本审复现成立** |
| B4 | **阻塞（G2）** | allowlist 含 `vectorstore-adapter` **≠** `vectorstore:prove`/`rag*`/`memory*` 默认已迁；**≠** G2 关；P12 `vectorstore:qdrant` **未**入 sole 名单（另切片） | **已核验仍开** · 本切片 **不关** G2 |
| B5 | **立场钉（非缺陷）** | 四条 sole EXIT=0 = **allowlist 路径可跑 + receipt only**（wiring/ping 连通；qdrant-backed inventory+readyz；adapter real-path）；**≠** 翻默认 / fixtures retired / HA | **强制遵守** |
| — | — | **本切片代码/行为面无额外阻塞项** | **无阻塞**（已抽查：allowlist 恰四条、无 P12、receipt 硬钉、fail-closed 3/2、默认仍 legacy、禁令叙事） |
| O1 | **nit（不降级）** | Set 名仍 `SOLE_WIRING_ALLOWLIST`（历史命名；语义已扩至 ping/qdrant-backed/adapter） | **不降级**；可选后续 rename，非本刀阻塞 |
| O2 | **nit（不降级）** | receipt class=`local_untrusted_sole_stack_allowlist_receipt`（相对前序 wiring_receipt 更名）；硬钉齐全 | **不降级** · 诚实 |

**冲突取更严**：他域若把 O1/O2 升 conditional，以更严为准。本域因 fail-closed、硬禁令、默认未切、P12 未误入、receipt `releaseEvidence=false` 齐全，维持 **pass**（仅 allowlist 扩量登记）。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| `SOLE_WIRING_ALLOWLIST` 恰四条 | **成立**。`new Set(['sole-stack:wiring:prove','sole-stack:ping:prove','sole-stack:qdrant-backed:prove','sole-stack:vectorstore-adapter:prove'])` |
| **无** `vectorstore:qdrant` / P12 入口 | **成立**。`run-e2e-isolated.mjs` 全文 **零** `vectorstore:qdrant`；allowlist / supported-target / command map 均无 P12；P12 仅根 `package.json` `vectorstore:qdrant:prove`（qdrant-native opt-in，本刀范围外） |
| 非 allowlist → EXIT=3 + PREREQ | **成立**（本审复跑 `isolated-env:prove` / `migrate:prove`） |
| 默认仍 legacy | **成立**。无 env → `pgvector-legacy` + `[R5-MARKED-RED]`；leaf EXIT=0 |
| bogus → EXIT=2 | **成立** |
| receipt 硬钉 | **成立**。`releaseEvidence:false` · `notHa:true` · `claimsForbidden` 含 `fixtures_retired` / `isolated_default_switched_to_sole` / `G2_closed` / `vectorstore_prove_default_migrated` / `HA` / `releaseEvidence=true` 等 |
| status P8 expand | **成立**。Proven P8 明示四条 allowlist；G1/G2 仍开；L1 明示 P8≠关闭 |
| `r5-mark-red` pins expand | **成立**。钉 wiring+ping+qdrant-backed+adapter；排除 rag/memory/`vectorstore:prove` 默认 |

### 对抗抽查

| 检查 | 结果 |
|------|------|
| allowlist 是否过宽（普通 E2E / rag / memory / `vectorstore:prove` 偷进 sole） | **否**。恰四条 `sole-stack:*`。抽查 `isolated-env:prove`、`migrate:prove` sole 下均 **EXIT=3**。r5-mark-red 解析 Set 块排除 `rag0|memory:prove|vectorstore:prove|e2e:prove|migrate:prove` |
| P12 是否误入 allowlist | **否**。零命中；status 将 P12 单列为 opt-in bridge，**≠** sole allowlist |
| 「扩量绿」→ default switched / fixtures retired / G2 关 / covered / HA | **未发现偷写**。banner `[R5-SOLE-WIRING] ≠ default switch · ≠ fixtures retired`；receipt `claimsForbidden` 含 `G2_closed`；qdrant-backed/adapter prove NOTE 钉 STILL-GAP G2；默认路径仍 `[R5-MARKED-RED]` |
| adapter 入名单是否等于向量默认已迁 | **否**。command map → `prove:vectorstore-adapter`（P11）；**≠** `vectorstore:prove`；PREREQ 明文「allowlist adapter ≠ default migration」 |
| fail-closed：非 allowlist=3、bogus=2 | **成立**（本审复跑） |
| 默认仍 legacy | **成立** |
| 扩量绿 ≠ covered ≠ HA | **立场钉成立**；本审 **不**批准升阶 |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm e2e-isolation:sole-wiring:prove` | **0** | allowlist wiring；banner + receipt 硬钉 |
| `pnpm e2e-isolation:sole-ping:prove` | **0** | allowlist ping；receipt `release_evidence=false` |
| `pnpm e2e-isolation:sole-qdrant-backed:prove` | **0** | allowlist inventory+readyz；NOTE 钉 G2 仍开；明示 P12 为 qdrant-native **≠** sole-allowlist |
| `pnpm e2e-isolation:sole-vectorstore-adapter:prove` | **0** | allowlist P11 adapter live；NOTE STILL-GAP G2 / G1；≠ vectorstore 默认 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | 非 allowlist sole → PREREQ fail-closed（stderr 打印四条 allowlist） |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs migrate:prove`（额外抽查） | **3** | 普通 E2E 目标未偷进 allowlist |
| `E2E_ISOLATION_STACK=bogus node scripts/run-e2e-isolated.mjs isolated-env:prove` | **2** | unknown stack 拒识 |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0**（leaf） | banner **pgvector-legacy** + R5-MARKED-RED；**证明默认未切 sole** |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 静态标红 + P8 expand pins；**≠** 退役 · ≠ HA |
| `pnpm conn-stack:r5-mark-red:prove` | **0** | 同上（body） |

实现方送审 CMD/EXIT 与本表一致；**仍不采信自报**，以本审复跑为准。

Prove/receipt 摘要钉（独立观测）：gate receipt `class=local_untrusted_sole_stack_allowlist_receipt`；`allowlist` 数组恰四条；`releaseEvidence:false`；`notHa:true`；`claimsForbidden` 含 `G2_closed` / `fixtures_retired` / `isolated_default_switched_to_sole`。

---

## 扩量绿 ≠ 升阶（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| 四条 sole EXIT=0 | **仅** allowlist 扩量可跑 + 工具轨/子切片登记（P8 expand） |
| fixtures retired / 夹具已退役 | **否** |
| isolated 默认已切 sole | **否**（仍 `pgvector-legacy`；G1 开） |
| disposable sole isolation | **否**（共享 compose） |
| G2 关 / rag·memory·`vectorstore:prove` 默认迁 | **否** |
| P12 已入 sole allowlist | **否**（未入；范围外） |
| cutover / migrated / covered | **否** |
| HA / releaseEvidence | **false / Not HA**（禁止升） |

---

## 残留 GAP（对齐 status · 未关）

G1 默认仍 legacy · G2 Qdrant-backed 业务 prove 未默认（P10/P11/P12 ≠ 关）· G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence  
L1–L4：P8 allowlist expand ≠ L1 关闭。

---

## 对照

- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P8 expand · G1/G2）
- `ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md`
- `scripts/run-e2e-isolated.mjs`（`SOLE_WIRING_ALLOWLIST`）
- 前次：`reviews/2026-09-10-sole-wiring-mw-e2e-ha.md` · `reviews/2026-09-10-r5-sole-stack-mw-e2e-ha.md` · `reviews/2026-09-10-g2-qdrant-vectorstore-adapter-mw-e2e-ha.md`
