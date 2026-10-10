# 审查 — Meetwise HA C3 shared · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审工作臂；实现方不自审；不采信自报/草稿自批；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：HA **C3 本地 shared 路径**（sole-stack Redis/MySQL + dual `--compose-shared`；`sharedOk` / `SHARED_OK` 工具轨）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`  
**对照**：`ai-docs/delivery/north-star-ha.md` 证据阶梯 **C/D**（今日 **prove 未绿**；本地 C3 ≠ 阶 C 齐套；D 未开）  
**前序**：`reviews/2026-09-10-ha-c1-real-compose-mw-e2e-ha.md`（C1 dual Nest `/livez` pass；当时 C3 **仍 GAP**）  
**硬钉**：`releaseEvidence=false` · **Not HA** · **C3 local path 可有 SHARED_OK** · **阶 C/D 仍未绿** · **Nest session 未证** · **`--require-evidence` 仍 EXIT=1**  
**禁区**：未碰 Meridian；未读 `.env*`  
**草稿处理**：忽略并覆盖既有 `reviews/2026-09-10-ha-c3-shared-mw-e2e-ha.md` / 第二域草稿自批结论；本文件为本臂独立审稿。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 Not HA；无 `releaseEvidence=true`；无阶 C/D 绿 / 生产 HA / Nest session 已证叙事） |
| 是否批准 **C3 本地 shared 路径 / SHARED_OK 工具轨登记** | **是**（`compose.ha-dual.shared.yml` + `prove-shared-state.mjs` + bring-up `--compose-shared` + probe `sharedOk` + harness/north-star 诚实钉） |
| 是否批阶 C/D prove 绿 | **否** |
| 是否批生产 HA / 生产 failover 已验 | **否** |
| 是否批 `releaseEvidence=true` | **否**（强制 false） |
| 是否批 Nest 业务 session/job A→B 已证 | **否**（`DATABASE_URL` 仍为 postgres placeholder；C3 仅为 sole-stack Redis/MySQL wiring + marker） |
| in-container Redis A→B netns | 收据 `sharedPath=shared_backend_hostpath`（CC TCP 阻时诚实回落）；**≠** 升阶 |

**批准范围（唯一）**：C3 **本地** shared path / `SHARED_OK` **工具轨登记**。  
**明确 ≠** 阶 C/D 绿 ≠ 生产 HA ≠ Nest session 已证 ≠ `releaseEvidence=true`。

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）未发现把 `SHARED_OK` / `sharedOk=true` / `DUAL_SHARED_PARTIAL` / `DUAL_COMPOSE_SHARED_UP` 偷升为阶 C 绿、生产 HA、Nest session 已证、或 `releaseEvidence=true` | **无阻塞** |
| B1 | **立场钉** | 本地 C3 EXIT=0 / `SHARED_OK` **仅**表示 shared 路径可登记；**不得**记为阶 C/D 已绿或生产 HA | **强制遵守** |
| B2 | **立场钉** | `--require-evidence` 即便 `sharedOk=true`（dual+kill+shared 收据齐）仍须 **EXIT=1**（拒生产拓扑/CI/独立审缺失） | **本臂已核验成立** |
| B3 | **立场钉** | Nest `DATABASE_URL` placeholder ≠ 业务 session；harness/compose/prove note 须持续钉「≠ Nest 业务 session」 | **强制遵守** |
| B4 | **立场钉** | 未授权 `MEETWISE_HA_SHARED_AUTHORIZED` → prove `PREREQ_GAP`；`--require-shared` → EXIT=1 | **本臂已核验成立** |
| O1 | **nit（不降级）** | `probe.multi` 的 `sharedOk` 由证据目录文件名启发式判定；`--with-shared` 本轮 prove 因无授权 `PREREQ_GAP` 时，若磁盘仍留先前 `shared-state-*.json`，receipt 仍可 `sharedOk: true`。易被误读为本轮 prove 成功。 | **不降级**；对外摘要须同时报本轮 prove `result` + `haStatus`/`releaseEvidence`/`ladder`；禁只报 `sharedOk` |
| O2 | **方法注记（非产品缺陷）** | 本臂对 `MEETWISE_HA_SHARED_AUTHORIZED=1 … --prove` 的独立复跑被 Auto-review **拒绝授权**（审批卡否认）。`SHARED_OK` 交叉核验改走：授权 `--compose-shared`（本臂 EXIT=0）+ 磁盘收据 + Redis key 仍在 + A/B sole 网络/`REDIS_URL` 对等 + DNS + 代码诚实钉。 | **不降级**；不据此把草稿自批当本臂复跑 |

**冲突取更严**：若他域把 O1 升为 conditional，以更严为准。本域因 fail-closed、receipt 硬编码 `NOT_HA`/`releaseEvidence: false`、阶梯文档诚实，维持 **pass**。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称 | 独立结果 |
|------|----------|
| `docker/compose.ha-dual.shared.yml` | **成立**。头注释钉 Not HA / `releaseEvidence=false` / ≠ Nest session；external `sole_stack`→`meetwise-mysql-local_default`；A/B `REDIS_URL=redis://redis:6379/0` + MySQL shared env（local-dev placeholder） |
| `scripts/ha/prove-shared-state.mjs` | **成立**。receipt 硬编码 `haStatus: NOT_HA` · `releaseEvidence: false`；`--require-shared` fail-closed；成功写 A-write/B-read；永不写 HA/`releaseEvidence=true` |
| bring-up `--compose-shared` | **成立**。无 `MEETWISE_HA_DUAL_AUTHORIZED` → `COMPOSE_REFUSED`/`PREREQ_GAP`；授权+sole 网络 → `DUAL_COMPOSE_SHARED_UP` 且仍 Not HA |
| probe `--with-shared` / `sharedOk` | **成立（路径）**。receipt 可 `sharedOk: true` · `DUAL_SHARED_PARTIAL` · ladder `C3_shared=local_redis_mysql_prove`；note 钉 Nest session 未证、阶 C/D 未绿 |
| `--require-evidence` 仍 EXIT=1 | **成立**。即便 `sharedOk: true` + dual livez 200 + kill 收据齐，仍 `result: FAIL` · EXIT=1 |
| harness / north-star | **成立**。C3 本地路径已落；**阶 C prove 未绿**；本地 C3 ≠ Nest session ≠ 阶 C 绿；禁止勾 `releaseEvidence=true` |
| Nest session 已证 | **不成立（正确拒绝）**。compose 明确 placeholder DB；prove note ≠ Nest business session |
| 升阶 HA / 阶 C/D 绿 | **未发现偷升** |

### 对抗矩阵

| 检查 | 结果 |
|------|------|
| `SHARED_OK` / `sharedOk=true` 是否偷升阶 C/D 或 HA | **否**。ladder 仍 `D=not_open`；note 钉 Not HA；`--require-evidence` 恒拒 |
| Nest session 是否被宣称已证 | **否**。反面钉齐全（compose/prove/harness/north-star/probe note） |
| `--require-evidence` 是否真仍 1 | **是**（本臂复跑 EXIT=1，`sharedOk: true` 仍 FAIL） |
| 未授权是否 fail-closed | **是**：无 SHARED_AUTH → `PREREQ_GAP`；`--require-shared` → EXIT=1；无 DUAL_AUTH `--compose-shared` → `COMPOSE_REFUSED` |
| `releaseEvidence=true` / `haStatus: HA` | **未发现**（非禁令语境）；receipt/printReceipt 硬编码 false/NOT_HA |

---

## CMD + EXIT 全表（本臂复跑 · PT 2026-09-10 ≈04:23–04:35）

| CMD（≡ package.json） | EXIT | 关键 receipt 字段 | 解读 |
|----------------------|------|----------------|------|
| `node scripts/ha/ha-track.multi.proof.mjs`（≡ `pnpm ha-track:multi:prove`） | **0** | `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` · note ladder C/D not green | 交付物+诚实钉+C3 路径静态登记；**≠ HA** |
| `node scripts/ha/prove-shared-state.mjs`（无授权；≡ `pnpm ha:prove:shared`） | **0** | `result: PREREQ_GAP` · `sharedOk: false` · `ladder: C3_shared=GAP` · `releaseEvidence: false` | 诚实 GAP |
| `node scripts/ha/prove-shared-state.mjs --require-shared`（无授权） | **1** | `requireShared: true` · `PREREQ_GAP` · `sharedOk: false` | **fail-closed** |
| `node scripts/ha/bring-up-dual.mjs --compose-shared`（无 `MEETWISE_HA_DUAL_AUTHORIZED`） | **0** | `result: PREREQ_GAP` · `mode: COMPOSE_REFUSED` · `NOT_HA` · `releaseEvidence: false` | 拒真拉起 |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 node scripts/ha/bring-up-dual.mjs --compose-shared`（≡ 授权 `pnpm ha:dual:compose-shared`） | **0** | `result: DUAL_COMPOSE_SHARED_UP` · `mode: COMPOSE_HA_DUAL_SHARED` · livez A/B 200 · `NOT_HA` · `releaseEvidence: false` | C1/C2 + sole-stack 网络；C3 path ready；**≠ 生产 HA** |
| `MEETWISE_HA_SHARED_AUTHORIZED=1 … --prove`（≡ 授权 `pnpm ha:prove:shared -- --prove`） | **N/A（本臂未获 Auto-review 批准执行）** | 交叉核验见下表 | 不采信草稿自报 EXIT；不把「未能复跑」写成产品 GAP |
| `node scripts/ha/probe.multi.mjs --with-shared`（无 SHARED_AUTH；dual 已起、磁盘已有收据） | **0** | probe `DUAL_SHARED_PARTIAL` · `sharedOk: true` · ladder `C3_shared=local_redis_mysql_prove` · **仍** `NOT_HA`；内嵌 prove `PREREQ_GAP` | 见 O1；**≠** 阶 C 绿 |
| `node scripts/ha/probe.multi.mjs --require-evidence`（sharedOk 已真） | **1** | `result: FAIL` · `sharedOk: true` · `requireEvidence: true` · failReason 拒生产拓扑/CI/审 · `releaseEvidence: false` | **硬钉成立** |
| `docker compose -f docker/compose.ha-dual.yml -f docker/compose.ha-dual.shared.yml config --quiet` | **0** | — | 静校；**≠** 已起；**≠ HA** |
| `node scripts/ha/bring-up-dual.mjs --compose-down` | **0** | `result: COMPOSE_DOWN` · `NOT_HA` | 审后拆除 |
| 阶 C/D prove 绿 / Nest session 已证 / 生产 failover / `releaseEvidence=true` | **N/A** | — | **未开**；禁止计入本切片 |

### `SHARED_OK` 交叉核验（替代本臂被拒的授权 `--prove`）

| 源 | 观察 |
|----|------|
| `.tmp/ha-evidence/shared-state-A-write.json` | `status: OK` · `sharedPath: shared_backend_hostpath` · `haStatus: NOT_HA` · `releaseEvidence: false` · note ≠ Nest session · `at: 2026-09-10T11:24:58.339Z`（≈04:24 PT） |
| `.tmp/ha-evidence/shared-state-B-read.json` | 同上对偶；`valueMatch: true`；无 `shared-state.GAP.json` |
| Redis（sole） | `GET meetwise:ha:c3:shared-probe` → `c3-29c6c118fbf5dea0`（与收据 `tokenPrefix: c3-29c6c` 一致） |
| Dual wiring（compose-shared 期间） | A/B 均在 `meetwise-mysql-local_default`；`REDIS_URL` 对等 `redis://redis:6379/0`；DNS `redis`/`mysql` 可解析；`/livez` 200；`/meta`=`meetwise-api` |
| 代码路径 | prove 成功分支 `result: SHARED_OK` 且硬编码 Not HA；hostpath 回落有 note |

→ **接受「C3 local SHARED_OK 工具轨可登记」**；**拒绝**升阶叙事。

---

## 非宣称（硬禁）

- **不批** 生产 HA / HA green / 可用性已证 / multi-AZ / 生产 failover 已验  
- **不批** 阶 C/D prove 绿（本地 C3 ≠ 阶 C 齐套）  
- **不批** Nest 业务 session/job 跨实例已证  
- **不批** `releaseEvidence=true` / controlPlaneClosed  
- **不以** `SHARED_OK` / `sharedOk=true` / `DUAL_SHARED_PARTIAL` / `DUAL_COMPOSE_SHARED_UP` / multi.proof EXIT=0 冒充生产 HA 或阶 C/D 绿  

---

## shared 状态 vs 阶 C/D · Nest session · 假绿/升阶风险

| 维 | 本审结论 |
|----|----------|
| shared 状态 | **本地路径可 SHARED_OK**（hostpath 回落诚实）；工具轨可登记 |
| 阶 C/D | **仍未绿**（C4 仅 stub；D 未开；`--require-evidence` 恒 1） |
| Nest session | **未证**（placeholder `DATABASE_URL`；prove 非业务 session） |
| 假绿/升阶风险 | **可控**：receipt/文档反面钉齐全；主要风险是外行只报 `sharedOk=true`/EXIT=0（O1）— 对外必须带 `haStatus`/`releaseEvidence`/`ladder`/`--require-evidence=1` |

---

## 批准范围（重申）

**仅批准「C3 本地 shared path / SHARED_OK 工具轨登记」**（含 `shared_backend_hostpath` 诚实回落标注）。  
**未批准**阶 C/D 绿、生产 HA、Nest session 已证、`releaseEvidence=true`。

## reviews 路径

`ai-docs/delivery/reviews/2026-09-10-ha-c3-shared-mw-e2e-ha.md`
