# 审查 — Meetwise HA C4 fault-inject · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审工作臂；实现方不自审；不采信自报/草稿自批；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：HA **C4 本地 fault-inject 路径**（compose `docker stop` api-a / `--network-half` + B `/livez` + optional shared survivor）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`  
**对照**：`ai-docs/delivery/north-star-ha.md` 证据阶梯 **C/D**（今日 **prove 未绿**；本地 C4 ≠ 生产 failover ≠ 阶 C 齐套；D 未开）  
**前序**：`reviews/2026-09-10-ha-c3-shared-mw-e2e-ha.md`（C3 本地 SHARED_OK；当时 C4 **仍 stub**）；`reviews/2026-09-10-ha-multi-instance-mw-e2e-ha.md`  
**硬钉**：`releaseEvidence=false` · **Not HA** · **C4 local path 可有 COMPOSE_FAULT_*_PARTIAL** · **阶 C/D 仍未绿** · **≠ 生产 failover** · **`--require-evidence` 仍 EXIT=1**  
**禁区**：未碰 Meridian；未读 `.env*`；未开 DELETE  
**草稿处理**：覆盖既有 `reviews/2026-09-10-ha-c4-fault-mw-e2e-ha.md` / 实现草稿自批；本文件为本臂独立审稿。禁止把本地 C4 EXIT=0 写成生产 HA / 生产 failover / 阶 C/D 绿。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 Not HA；无 `releaseEvidence=true`；无阶 C/D 绿 / 生产 HA / 生产 failover 已验叙事） |
| 是否批准 **C4 本地 fault-inject 路径登记** | **是**（`fault-inject.mjs` + `MEETWISE_HA_FAULT_AUTHORIZED` + kill/network-half + B livez + optional `SHARED_OK_SURVIVOR` + harness/north-star 诚实钉） |
| 是否批阶 C/D prove 绿 | **否** |
| 是否批生产 HA / 生产 failover 已验 | **否** |
| 是否批 `releaseEvidence=true` | **否**（强制 false） |
| 是否批 Nest 业务 session/job failover | **否**（Nest session 仍 GAP；survivor = sole Redis/MySQL hostpath wiring） |

**批准范围（唯一）**：C4 **本地** fault-inject path / `COMPOSE_FAULT_*_PARTIAL` **工具轨登记**。  
**明确 ≠** 阶 C/D 绿 ≠ 生产 HA ≠ 生产 failover ≠ `releaseEvidence=true`。

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）未发现把 `COMPOSE_FAULT_SHARED_PARTIAL` / `SHARED_OK_SURVIVOR` / ladder `C4_fault=local_compose_kill_A+shared_survivor` 偷升为阶 C 绿、生产 HA、生产 failover、或 `releaseEvidence=true` | **无阻塞** |
| B1 | **立场钉** | 本地 C4 EXIT=0 **仅**表示 fault-inject 路径可登记；**不得**记为阶 C/D 已绿或生产 failover | **强制遵守** |
| B2 | **立场钉** | `--require-evidence` 即便 dual+kill+shared 齐仍须 **EXIT=1**（拒生产拓扑/CI/独立审缺失） | **本臂已核验成立** |
| B3 | **立场钉** | 未授权 `MEETWISE_HA_FAULT_AUTHORIZED` → `PREREQ_GAP` / `REFUSED_NO_AUTH`；`--require-fault` → EXIT=1 | **本臂已核验成立** |
| B4 | **立场钉** | survivor shared ≠ Nest session；≠ 全量 A→B 业务 prove（A 已 down / hostpath docker-exec） | **强制遵守** |
| O1 | **nit（不降级）** | `--restore` 仅 `docker start api-a`，**不**把 A 重新 `network connect` 回 sole_stack。前序 `--network-half` 后若只 `--restore`，A 可仍离 sole；本臂首轮 `--network-half` 因此 `NETWORK_HALF_FAILED`（诚实 EXIT=1）。本地恢复后若需再跑 network-half / shared，须显式 reconnect 或 `compose-shared` 重挂。 | **不降级**；工具轨诚实 fail；禁把「restore 绿」写成网络半断已回滚齐套 |
| O2 | **nit（不降级）** | `SHARED_OK_SURVIVOR` 走 sole 容器 `redis-cli`/`mysql` docker-exec（`shared_backend_hostpath_survivor`），**非** Nest 进程内 A→B session/job。外行易把 survivor 绿读成业务 failover。 | **不降级**；收据/note 已反面钉；对外须带 `haStatus`/`releaseEvidence`/`ladder`/`nestSessionOk=false` |
| O3 | **nit（不降级）** | north-star 阶 C 行仍主写 C1/C3/C2 + Nest GAP，**未显式写「C4 本地路径已落」**（C4 出现在 D 行反面钉与硬约束）。属欠文档非升阶。 | **不降级**；harness 已钉 C4 本地已落且 ≠ 生产 failover |

**冲突取更严**：若他域把 O1–O3 升为 conditional，以更严为准。本域因 fail-closed、receipt 硬编码 `NOT_HA`/`releaseEvidence: false`、阶梯文档诚实，维持 **pass**。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称 | 独立结果 |
|------|----------|
| `scripts/ha/fault-inject.mjs` | **成立**。receipt 硬编码 `haStatus: NOT_HA` · `releaseEvidence: false`；compose kill / network-half / restore；`--require-fault` fail-closed；`MEETWISE_HA_FAULT_AUTHORIZED` gate |
| stub 仍保留 | **成立**。`fault-inject.stub.mjs` + `ha:fault-inject:stub`；livez-only shared=GAP |
| harness / north-star | **成立（诚实）**。harness C4 本地路径已落 + ≠ 生产 failover；阶 C/D prove **未绿**；north-star 禁本地 C4 EXIT=0 升阶（O3：C 行欠显式「C4 已落」） |
| `--require-evidence` 仍 EXIT=1 | **成立**。dual+kill+shared 齐时仍 `result: FAIL` · failReason 拒生产拓扑/CI/审 · EXIT=1 |
| 升阶 HA / 阶 C/D 绿 / 生产 failover 已验 | **未发现偷升** |

### 对抗矩阵

| 检查 | 结果 |
|------|------|
| `COMPOSE_FAULT_SHARED_PARTIAL` / `SHARED_OK_SURVIVOR` 是否偷升阶 C/D 或 HA | **否**。ladder 仍 `D=not_open`；note 钉 Not HA / ≠ production failover / ladder C/D not green；`--require-evidence` 恒拒 |
| 生产 failover 是否被宣称已验 | **否**。反面钉齐全（脚本头注释 / receipt / harness / README） |
| 未授权是否 fail-closed | **是**：无 FAULT_AUTH → `PREREQ_GAP`/`REFUSED_NO_AUTH`；`--require-fault` → EXIT=1 |
| `releaseEvidence=true` / `haStatus: HA` | **未发现**（非禁令语境）；printReceipt / evidence JSON 硬编码 false/NOT_HA |
| kill/survivor 绿是否被写成阶 C | **否**。本臂复跑 note 明确 `ladder C/D not green`；harness 勾选阶 C/D 仍未开 |

---

## CMD + EXIT 全表（本臂复跑 · PT 2026-09-10 ≈04:48–04:50）

| CMD（≡ package.json） | EXIT | 关键 receipt 字段 | 解读 |
|----------------------|------|----------------|------|
| `node scripts/ha/ha-track.multi.proof.mjs`（≡ `pnpm ha-track:multi:prove`） | **0** | `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` · note ladder C/D not green | 交付物+诚实钉+C4 路径静态登记；**≠ HA** |
| `node scripts/ha/fault-inject.mjs`（无授权；dual 已起） | **0** | `result: PREREQ_GAP` · `faultInject: REFUSED_NO_AUTH` · `ladder: C4_fault=GAP` | 诚实拒杀 |
| `node scripts/ha/fault-inject.mjs --require-fault`（无授权） | **1** | `requireFault: true` · `REFUSED_NO_AUTH` · `result: FAIL` | **fail-closed** |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 node scripts/ha/fault-inject.mjs --kill --with-shared-survivor` | **0** | `COMPOSE_FAULT_SHARED_PARTIAL` · `COMPOSE_A_DOWN_B_UP` · `sharedState: SHARED_OK_SURVIVOR` · `C4_fault=local_compose_kill_A+shared_survivor` · `NOT_HA` · `releaseEvidence: false` | C4 本地路径；**≠ 生产 failover**；本臂 Auto-review **未拒** kill（独立复跑成功） |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 … --network-half --with-shared-survivor`（A 已在 sole） | **0** | `NETWORK_HALF_A_SHARED_BREAK` · `SHARED_OK_SURVIVOR` · `C4_fault=local_network_half_A` · `NOT_HA` | 网络半断路径可登记 |
| 同上（A **未**在 sole；见 O1） | **1** | `NETWORK_HALF_FAILED` · gap: not connected to sole_stack | 诚实失败；**不**假绿 |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 node scripts/ha/fault-inject.mjs --restore` | **0** | `RESTORED_A` · `NOT_HA` · `local_compose_restore` | 本地恢复；**≠ HA**；**不**保证 sole 重挂（O1） |
| `node scripts/ha/probe.multi.mjs --require-evidence`（dual 齐 + kill/shared 收据齐） | **1** | `result: FAIL` · `sharedOk: true` · ladder `C4_fault=local_compose_kill_A+shared_survivor` · failReason: *local evidence seen but production topology/CI/review missing — refuse HA* · `releaseEvidence: false` | **硬钉成立** |
| 阶 C/D prove 绿 / 生产 failover / `releaseEvidence=true` | **N/A** | — | **未开**；禁止计入本切片 |

### 收据交叉核验（本臂 kill 轮 · ≈11:48–11:50Z / 04:48–04:50 PT）

| 源 | 观察 |
|----|------|
| `.tmp/ha-evidence/kill-A.receipt.json`（kill 后） | `method: docker-stop-api-a` · `aDown: true` · `bStillServing: true` · `haStatus: NOT_HA` · `releaseEvidence: false` · note ≠ production failover |
| `.tmp/ha-evidence/kill-A.receipt.json`（network-half 后覆写） | `method: network-half-disconnect-api-a` · `aNetworkHalf: true` · `bStillServing: true` · `NOT_HA` |
| `.tmp/ha-evidence/B-still-serving.receipt.json` | `ok: true` · port 18788 · `NOT_HA` |
| `.tmp/ha-evidence/fault-shared-survivor.receipt.json` | `status: OK` · `sharedPath: shared_backend_hostpath_survivor` · Redis/MySQL ok · `NOT_HA` · ≠ Nest session |
| livez post-kill | A ECONNREFUSED；B 200 |
| Nest session | `nest-session.GAP.json` 仍在 — **未证** |

→ **接受「C4 local fault-inject 工具轨可登记」**；**拒绝**升阶叙事。

---

## 非宣称（硬禁）

- **不批** 生产 HA / HA green / 生产 failover 已验 / multi-AZ  
- **不批** 阶 C/D prove 绿（本地 C1/C3/C4 ≠ 阶 C 齐套）  
- **不批** Nest 业务 session/job 跨实例 failover 已证  
- **不批** `releaseEvidence=true` / controlPlaneClosed  
- **不以** `COMPOSE_FAULT_SHARED_PARTIAL` / `SHARED_OK_SURVIVOR` / multi.proof EXIT=0 冒充生产 HA 或阶 C/D 绿  

---

## C4 vs 阶 C/D · 假绿/升阶风险

| 维 | 本审结论 |
|----|----------|
| C4 本地路径 | **可登记**（kill / network-half / survivor hostpath / restore）；工具轨 EXIT=0 仅证明本地 compose fault 机械 |
| 阶 C | **仍未绿**（本地 C1+C3+C4 ≠ 同 VPC 生产拓扑齐套；Nest session GAP；无生产级故障注入回执） |
| 阶 D | **未开**（`--require-evidence` 恒 1；无 CI+独立审生产回执） |
| 假绿/升阶风险 | **可控**：receipt/文档反面钉齐全；主要风险：(1) 外行只报 `COMPOSE_FAULT_SHARED_PARTIAL`/EXIT=0；(2) 把 survivor hostpath 读成 Nest failover；(3) 把 `--restore` 当成网络半断全量回滚（O1）。对外必须带 `haStatus`/`releaseEvidence`/`ladder`/`--require-evidence=1` |

---

## 批准范围（重申）

**仅批准「C4 本地 fault-inject path / COMPOSE_FAULT_*_PARTIAL 工具轨登记」**（含 network-half + shared survivor hostpath）。  
**未批准**阶 C/D 绿、生产 HA、生产 failover、Nest session failover、`releaseEvidence=true`。

## reviews 路径

`ai-docs/delivery/reviews/2026-09-10-ha-c4-fault-mw-e2e-ha.md`
