# Review — HA C3 shared（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-e2e-ha 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（C3 本地 shared 路径诚实；**禁止升阶 HA**）  
**releaseEvidence=false** · **Not HA** · **sharedOk ≠ 生产 HA** · **≠ Nest 业务 session**

## 对照

- `harness/ha-track.multi-instance.md`（C3 本地路径）
- `docker/compose.ha-dual.shared.yml` · `scripts/ha/prove-shared-state.mjs` · `probe.multi.mjs`
- 主审：`2026-09-10-ha-c3-shared-mw-e2e-ha.md`
- 前序：`2026-09-10-ha-c1-real-compose-mw-rag-route.md`

## 焦点核实

| 焦点 | 结果 |
|------|------|
| sharedOk ≠ 生产 HA | **成立**。`SHARED_OK` / `sharedOk: true` 收据恒 `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false`；note 钉 ≠ Nest session / ≠ production HA |
| `--require-evidence` EXIT=1 | **成立**。即便 `sharedOk: true` + dual livez 齐套时仍 `result: FAIL` EXIT=1 |
| hostpath 诚实 | **成立**。in-container Redis TCP timeout → 回落 `sharedPath=shared_backend_hostpath`；sole redis SET/GET + MySQL marker + A/B DNS/env 对等；≠ 冒充 netns 进程内写入 |
| 默认未授权 | **成立**。无授权 → `PREREQ_GAP`；`--require-shared` → EXIT=1 |
| 阶 C/D | **未绿**。ladder 仍 `D=not_open`；C4 stub-only |

## CMD / EXIT（本域独立复跑）

| CMD | EXIT |
|-----|------|
| `node scripts/ha/ha-track.multi.proof.mjs` | **0** |
| `node scripts/ha/prove-shared-state.mjs`（无授权） | **0**（`PREREQ_GAP`） |
| `node scripts/ha/prove-shared-state.mjs --require-shared` | **1** |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 node scripts/ha/bring-up-dual.mjs --compose-shared` | **0**（`DUAL_COMPOSE_SHARED_UP` · `NOT_HA`） |
| `MEETWISE_HA_SHARED_AUTHORIZED=1 node scripts/ha/prove-shared-state.mjs --prove` | **0**（`SHARED_OK` · `shared_backend_hostpath`） |
| `MEETWISE_HA_SHARED_AUTHORIZED=1 node scripts/ha/probe.multi.mjs --with-shared` | **0**（`DUAL_SHARED_PARTIAL` · `sharedOk: true` · `NOT_HA`） |
| `node scripts/ha/probe.multi.mjs --require-evidence`（sharedOk 已真） | **1** |
| `node scripts/ha/bring-up-dual.mjs --compose-down` | **0** |

## 非宣称

禁止：升阶 HA、阶 C/D 绿、生产 failover、Nest session 已证、`releaseEvidence=true`、把 hostpath 读成 in-container netns 已证。
