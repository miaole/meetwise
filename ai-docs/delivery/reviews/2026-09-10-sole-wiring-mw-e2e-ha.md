# 审查 — Meetwise sole mysql-qdrant-redis wiring · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗独立审 · 主战场工作臂；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT · ~03:08–03:12）  
**切片**：sole-stack **allowlist wiring**（compose.mysql-local MySQL+Qdrant+Redis 连通 + runner allowlist + receipt）  
**Harness / status**：`ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（Proven **P8** wiring）· `ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md`  
**Prove body**：`scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs`（根 `scripts/mysql-stack.sole-wiring.proof.mjs` = S4 forwarder）  
**Runner**：`scripts/run-e2e-isolated.mjs` · `SOLE_WIRING_ALLOWLIST={sole-stack:wiring:prove}`  
**releaseEvidence=false** · **Not HA** · **≠ default switched** · **≠ fixtures retired** · **≠ cutover** · **≠ disposable isolation** · **≠ covered**

对照前次：`reviews/2026-09-10-r5-sole-stack-mw-e2e-ha.md`（默认仍 legacy；sole 曾永久 EXIT=3）· `reviews/2026-09-10-qdrant-backed-deepen-mw-e2e-ha.md`（第二枚 P8 / G2 仍开）。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（sole allowlist **wiring/工具轨**诚实登记；fail-closed 成立；无偷升 default/fixtures/HA/`releaseEvidence`） |
| 是否批准 **sole wiring / 工具轨** 登记 | **是**（仅 compose 连通 + allowlist 路径 + receipt；P8 wiring） |
| 是否批 isolated **默认已切** sole | **否**（默认仍 `pgvector-legacy`；G1 仍开） |
| 是否批 fixtures retired / `E2E_PG_IMAGE` 退役 | **否** |
| 是否批 disposable per-run sole isolation | **否**（共享 compose.mysql-local ≠ disposable） |
| 是否批业务 prove / 全量 E2E 已迁 sole | **否**（非 allowlist 仍 EXIT=3） |
| 是否批 cutover / migrated / covered | **否** |
| 是否批 HA / `releaseEvidence=true` | **否**（强制 false；L2/L3 未开；本切片无远程回执也不升） |
| BUG-FAKE-R5 | 仍 **INFLIGHT:mark-red**（≠ 关闭）；wiring 绿 ≠ R5 关 |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| B1 | **阻塞（切流/假绿面）** | **G1**：`run-e2e-isolated` **默认仍** `pgvector-legacy`；sole allowlist **仅** `sole-stack:wiring:prove`；wiring EXIT=0 **≠** 默认已切 sole | **已核验仍开** · 本切片 **不关** G1 |
| B2 | **阻塞（切流/发布）** | 不得宣称 **HA**、`releaseEvidence=true`、covered、cutover、migrated、fixtures retired；连通/prove 绿 ≠ covered ≠ HA；need multi-instance + fault-inject | **强制遵守** · L2/L3 **未开** |
| B3 | **阻塞（E2E 诚实）** | 非 allowlist sole 请求必须 **EXIT=3 + PREREQ**（禁假绿）；共享 compose ≠ disposable；禁止把 wiring 绿并入全量 `e2e:isolated`/LIVE/perf 绿叙事（G6 仍开） | **本审复现成立** |
| B4 | **立场钉（非缺陷）** | `mysql-stack:sole-wiring:prove` / `e2e-isolation:sole-wiring:prove` EXIT=0 = **compose 三件套 ping/readyz + env 作证 + receipt only** | **强制遵守** |
| — | — | **本切片代码/行为面无额外阻塞项** | **无阻塞**（已抽查：allowlist 宽度、receipt 硬钉、fail-closed 3/2、默认仍 legacy、禁令叙事） |
| O1 | **nit（不降级）** | status Proven 表 **两枚 P8**（wiring + qdrant-backed deepen）；编号碰撞已知 | **不降级**；建议 deepen 改 P10 或重编号（同 qdrant-backed 审） |
| O2 | **nit（不降级）** | proof 内嵌 compose local-dev 占位口令 `meetwise_dev_password`（注释钉 never `.env*`；本审未读 `.env*`） | **不降级** · 与 compose.mysql-local 占位一致；勿外推为生产密钥 |

**冲突取更严**：他域若把 O1/O2 升 conditional，以更严为准。本域因 fail-closed、硬禁令、默认未切、receipt `releaseEvidence=false` 齐全，维持 **pass**（仅 wiring/工具轨）。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称交付 | 独立结果 |
|----------|----------|
| `run-e2e-isolated.mjs` sole allowlist | **成立**。`SOLE_WIRING_ALLOWLIST = new Set(['sole-stack:wiring:prove'])` **仅 1 项**；非 allowlist → `process.exit(3)` + PREREQ 清单 |
| `mysql-stack.sole-wiring.proof.mjs` | **成立**。根路径 forwarder → `scripts/conn-stack/…` body；MySQL ping / Redis PING / Qdrant `/readyz`；NOTE 钉 ≠ retired/default/cutover/HA |
| status **P8**（wiring） | **成立**。Proven 行明示 allowlist wiring 可绿且 **≠** 默认已切 / disposable / 业务迁 / fixtures retired |
| `r5-mark-red` pins sole-wiring | **成立**。prove 钉 allowlist、EXIT=3 PREREQ、compose.mysql-local、receipt、`releaseEvidence=false` / Not HA |
| package scripts | **成立**。`mysql-stack:sole-wiring:prove` · `conn-stack:sole-wiring:prove` · `e2e-isolation:sole-wiring:prove` |

### 对抗抽查

| 检查 | 结果 |
|------|------|
| allowlist 是否过宽（普通 E2E 偷进 sole） | **否**。仅 `sole-stack:wiring:prove`。抽查 `isolated-env:prove` 与 `migrate:prove` 在 sole 下均 **EXIT=3** |
| receipt/proof 是否硬编码 NOT_HA / `releaseEvidence=false` / 未切 default | **是**。receipt：`releaseEvidence:false` · `notHa:true` · `claimsForbidden` 含 `fixtures_retired` / `isolated_default_switched_to_sole` / `cutover` / `HA` / `releaseEvidence=true`；class=`local_untrusted_sole_stack_wiring_receipt` |
| 「sole wiring 绿」→ default switched / fixtures retired 叙事漏洞 | **未发现偷写**。stdout NOTE + status G1/L1 + banner `[R5-SOLE-WIRING] ≠ default switch · ≠ fixtures retired`；默认路径仍发 `[R5-MARKED-RED] … pgvector-legacy` |
| fail-closed：非 allowlist=3、bogus=2 | **成立**（本审复跑） |
| 默认仍 legacy | **成立**。无 env 时写入 `pgvector-legacy`；`isolated-env:prove` leaf **EXIT=0** 且 banner 钉 NOT sole-stack |
| 连通绿 ≠ covered ≠ HA | **立场钉成立**；本审 **不**批准升阶 |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10）

| CMD | EXIT | 解读 |
|-----|------|------|
| `pnpm mysql-stack:sole-wiring:prove` | **0** | compose MySQL+Qdrant+Redis 连通 + receipt；**≠** default/fixtures/HA |
| `pnpm e2e-isolation:sole-wiring:prove`（≡ `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs sole-stack:wiring:prove`） | **0** | runner allowlist 路径；banner 钉 ≠ default switch / ≠ fixtures retired / `releaseEvidence=false` |
| `pnpm conn-stack:sole-wiring:prove` | **0** | body 直跑；同上 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | 非 allowlist sole → PREREQ fail-closed |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs migrate:prove`（额外抽查） | **3** | 普通 E2E 目标未偷进 allowlist |
| 默认（无 `E2E_ISOLATION_STACK`）`node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0**（leaf） | banner **pgvector-legacy** + R5-MARKED-RED；**证明默认未切 sole** |
| `E2E_ISOLATION_STACK=bogus node scripts/run-e2e-isolated.mjs isolated-env:prove` | **2** | unknown stack 拒识 |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 静态标红 + P8 wiring pins；**≠** 退役 · ≠ HA |
| `pnpm conn-stack:r5-mark-red:prove` | **0** | 同上（body） |

实现方自报 CMD/EXIT 与本表一致（含非 allowlist=3、default=0、bogus=2、r5-mark-red=0）；**仍不采信自报**，以本审复跑为准。

Prove/receipt 摘要钉（独立观测）：`release_evidence=false`；`notHa:true`；NOTE：`≠ fixtures retired · ≠ isolated default switched · ≠ cutover · Not HA`。

---

## wiring 绿 ≠ 升阶（硬钉）

| 命题 | 本审裁定 |
|------|----------|
| sole wiring EXIT=0 | **仅** allowlist compose 连通 + 工具轨登记（P8 wiring） |
| fixtures retired / 夹具已退役 | **否** |
| isolated 默认已切 sole | **否**（仍 `pgvector-legacy`；G1 开） |
| disposable sole isolation | **否**（共享 compose） |
| cutover / migrated / covered | **否** |
| HA / releaseEvidence | **false / Not HA**（无远程回执；禁止升） |

---

## 残留 GAP（对齐 status · 未关）

G1 默认仍 legacy · G2 Qdrant-backed 业务 prove 未默认 · G3 `E2E_PG_IMAGE` 未退役 · G4 R4 · G5 erasure ledger · G6 BUG-E2E-ISO · G7 HA/releaseEvidence  
L1–L4：P8 allowlist wiring ≠ L1 关闭。

---

## 对照

- `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md`（P8 wiring · G1）
- `ai-docs/delivery/harness/r5-pgvector-fixture-mark-red.md`
- `scripts/run-e2e-isolated.mjs` · `scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs`
- 前次：`reviews/2026-09-10-r5-sole-stack-mw-e2e-ha.md` · `reviews/2026-09-10-qdrant-backed-deepen-mw-e2e-ha.md` · `reviews/2026-09-10-r5-mark-red-mw-e2e-ha.md`
