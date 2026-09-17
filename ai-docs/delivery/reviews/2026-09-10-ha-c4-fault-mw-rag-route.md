# Review — HA C4 fault-inject（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-e2e-ha 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（C4 本地 compose kill 路径诚实；**禁止升阶 HA / 生产 failover**）  
**releaseEvidence=false** · **Not HA** · **kill ≠ 生产 HA** · **SHARED_OK_SURVIVOR ≠ Nest session**

## 对照

- `harness/ha-track.multi-instance.md`（C4 本地路径）
- `scripts/ha/fault-inject.mjs` · `fault-inject.stub.mjs` · `probe.multi.mjs`
- 主审：`2026-09-10-ha-c4-fault-mw-e2e-ha.md`
- 前序：`2026-09-10-ha-c3-shared-mw-rag-route.md` · Nest session GAP

## 焦点核实

| 焦点 | 结果 |
|------|------|
| kill ≠ 生产 HA / failover | **成立**。`COMPOSE_FAULT_SHARED_PARTIAL` · `method: docker-stop-api-a` · 恒 `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false`；ladder `≠ production failover; D=not_open` |
| `--require-evidence` EXIT=1 | **成立**。dual+kill+survivor 收据齐套后仍 `result: FAIL` EXIT=1（拒生产拓扑/CI/审） |
| 未授权拒杀 | **成立**。无 `MEETWISE_HA_FAULT_AUTHORIZED` → `PREREQ_GAP` / `REFUSED_NO_AUTH`；`--require-fault` → EXIT=1 |
| survivor ≠ Nest session | **成立**。sole Redis/MySQL survivor；note 钉 ≠ Nest session |
| stub 仍保留 | **成立**。`ha:fault-inject:stub` livez-only · shared=GAP |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT |
|-----|------|
| `node scripts/ha/ha-track.multi.proof.mjs` | **0** |
| `node scripts/ha/fault-inject.mjs`（无授权；dual 已起） | **0**（`PREREQ_GAP` · `REFUSED_NO_AUTH`） |
| `node scripts/ha/fault-inject.mjs --require-fault` | **1** |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 node scripts/ha/bring-up-dual.mjs --compose-shared` | **0**（`DUAL_COMPOSE_SHARED_UP` · `NOT_HA`） |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 node scripts/ha/fault-inject.mjs --kill --with-shared-survivor` | **0**（`COMPOSE_FAULT_SHARED_PARTIAL` · `SHARED_OK_SURVIVOR` · `NOT_HA`） |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 … --network-half --with-shared-survivor` | **0**（`NETWORK_HALF_A_SHARED_BREAK` · `NOT_HA`） |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 node scripts/ha/fault-inject.mjs --restore` | **0**（`RESTORED_A` · `NOT_HA`） |
| `node scripts/ha/probe.multi.mjs --require-evidence` | **1** |
| `node scripts/ha/fault-inject.stub.mjs --allow-gap` | **0**（`STUBBED_GAP` · shared=GAP） |

## 非宣称

禁止：升阶 HA、阶 C/D 绿、生产 failover、Nest session failover、`releaseEvidence=true`、把 compose kill / survivor hostpath 读成 HA green。
