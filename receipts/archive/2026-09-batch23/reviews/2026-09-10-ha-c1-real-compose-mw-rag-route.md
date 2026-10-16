# Review — HA C1 真 compose（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-e2e-ha 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（C1 真 compose 路径诚实；**禁止升阶 HA**）  
**releaseEvidence=false** · **Not HA** · **授权双 livez ≠ 生产 HA** · **C3 shared = GAP**

## 对照

- `harness/ha-track.multi-instance.md`（C1 真 compose）
- `docker/compose.ha-dual.yml` · `scripts/ha/bring-up-dual.mjs` · `probe.multi.mjs`
- 前序：`2026-09-10-ha-multi-instance-mw-rag-route.md`

## 焦点核实

| 焦点 | 结果 |
|------|------|
| 授权双 `/livez` ≠ 生产 HA | **成立**。`MEETWISE_HA_DUAL_AUTHORIZED=1` + 镜像 → `DUAL_COMPOSE_UP`；收据字面 `haStatus: NOT_HA` · `claimProductionHA: false` · C1/C2 local only |
| shared-state（C3）仍 GAP | **成立**。compose placeholder `DATABASE_URL` 明确 ≠ shared prove；probe `sharedOk=false` / `sharedGapMarker=true` |
| `--require-evidence` EXIT=1 | **成立**（双 livez 已绿仍因 shared 不全 fail-closed） |
| 默认未授权诚实 | **成立**。无 `MEETWISE_HA_DUAL_AUTHORIZED` → `PREREQ_GAP` EXIT=0 |
| 静态 prove / 静校 | **成立**。`ha-track:multi:prove`=0；`compose … config`=0 ≠ 实例已起 ≠ HA |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `pnpm ha-track:multi:prove` | **0** |
| `pnpm ha:dual:bring-up`（无授权） | **0**（`PREREQ_GAP`） |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 pnpm ha:dual:compose` | **0**（`DUAL_COMPOSE_UP`；双 livez 200；**NOT_HA**） |
| `pnpm ha:probe:multi -- --require-evidence`（双 livez 已起） | **1**（shared GAP） |
| `docker compose -f docker/compose.ha-dual.yml config` | **0** |
| `pnpm ha:dual:compose-down` | **0** |

## 阶梯诚实结论

- **C1**：真 compose 路径可授权拉起 · **≠** 生产 HA / 阶 C 绿  
- **C2**：本地双 `/livez` 机械 · **≠** failover 已证  
- **C3**：shared **GAP**  
- **D**：未开  

→ **保持 NOT_HA**；**禁止勾 releaseEvidence=true**。

## 非宣称

禁止：升阶 HA、生产 failover、shared 已证、`releaseEvidence=true`、本绿 = HA green。
