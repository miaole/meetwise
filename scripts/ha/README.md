# Meetwise HA scripts

**releaseEvidence=false** · **Not HA** · **禁止宣称生产 HA**

| 脚本 | 用途 |
|------|------|
| `ha-track.skeleton.proof.mjs` | 静态骨架：文件 + 诚实钉 |
| `probe.skeleton.mjs` | 双实例探针骨架；无真实多实例证据 → `haStatus: NOT_HA` / fail-closed |
| `ha-track.multi.proof.mjs` | 多实例轨静态：文件 + 诚实钉 |
| `build-backend-image.mjs` | 构建 `meetwise-backend:ha-dual-local`（C1 真 compose 镜像标签） |
| `bring-up-dual.mjs` | 双实例 bring-up；默认 **PREREQ_GAP**；`--stub`；`--compose`（需授权+镜像） |
| `dual-livez-stub.mjs` | 仅 `/livez` stub（C2 机械；≠ Nest API） |
| `fault-inject.mjs` | **C4** compose kill api-a / network-half + B livez + optional shared survivor；需 `MEETWISE_HA_FAULT_AUTHORIZED`；**≠** 生产 failover |
| `fault-inject.stub.mjs` | A-down / B-up stub；shared-state **GAP**（livez-only） |
| `probe.multi.mjs` | 多实例探针（超骨架）；`--with-shared`；`--require-evidence` → EXIT=1 |
| `prove-shared-state.mjs` | C3：Redis A→B + MySQL sole-stack；`--require-shared` → EXIT=1 |
| `prove-nest-session.mjs` | Nest 业务 session A→B：默认/无 PG → **PREREQ_GAP**；`--compose-pg` + `--prove` 可 LOCAL_OK（仍 Not HA）；`--require-session` fail-closed |
| `prepare-nest-pg.mjs` | 起 Nest PG sidecar + migrate + provision runtime；需 `MEETWISE_HA_NEST_PG_AUTHORIZED`；**≠** 生产 HA |
| `redis-resp-once.mjs` | 容器内 Redis RESP 一次性助手 |

## 命令

```bash
# skeleton (still valid)
pnpm ha-track:skeleton:prove
pnpm ha:probe:skeleton
pnpm ha:probe:skeleton -- --require-evidence   # 无证据 → EXIT=1

# multi-instance track (beyond skeleton; still Not HA)
pnpm ha-track:multi:prove
pnpm ha:dual:build-image                         # 本地镜像标签（≠ HA）
pnpm ha:dual:bring-up                            # PREREQ_GAP（无真 API 镜像/授权）
pnpm ha:dual:bring-up -- --compose               # 无授权/镜像 → PREREQ_GAP（具体 prereq）
MEETWISE_HA_DUAL_AUTHORIZED=1 pnpm ha:dual:compose   # 镜像已有时起双 Nest /livez；仍 Not HA
MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared
MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove   # C3 Redis A→B；仍 Not HA
pnpm ha:prepare:nest-pg                    # 需 MEETWISE_HA_NEST_PG_AUTHORIZED=1；migrate+runtime
pnpm ha:dual:compose-pg                    # 需 DUAL+NEST_PG 授权 + prepare 收据；仍 Not HA
pnpm ha:prove:nest-session                 # 无 OK 收据 → PREREQ_GAP；仍 Not HA
pnpm ha:prove:nest-session -- --prove      # A signup→B /profile；LOCAL_OK 仍 Not HA
pnpm ha:prove:nest-session -- --require-session  # 无 nestSessionOk → EXIT=1
pnpm ha:prove:nest-session -- --probe      # 可选 dual /readyz+/auth 收据
pnpm ha:dual:compose-down
pnpm ha:dual:stub                                # dual /livez stub
pnpm ha:probe:multi
pnpm ha:probe:multi -- --with-shared             # sharedOk path；仍 Not HA
pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject
pnpm ha:probe:multi -- --require-evidence        # fail-closed EXIT=1（即便 sharedOk / C4）
MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor
pnpm ha:fault-inject -- --require-fault          # 无授权 → EXIT=1
pnpm ha:fault-inject:stub                        # stub-only path
pnpm ha:dual:bring-up -- --stop-stub
```

Runbook：

- 骨架：`ai-docs/delivery/harness/ha-track.skeleton.md`
- 多实例轨：`ai-docs/delivery/harness/ha-track.multi-instance.md`
- 北星：`ai-docs/delivery/north-star-ha.md`（阶 C/D **未绿**）
- Compose：`docker/compose.ha-dual.yml`（真双 API；**非**生产）· `compose.ha-dual.shared.yml`（C3 sole-stack overlay）· `compose.ha-dual.pg.yml`（Nest Postgres sidecar；本地 session）· 骨架仍保留 `compose.ha-dual.skeleton.yml`

骨架/stub/本地 compose/本地 C3 shared / 本地 Nest PG session EXIT=0 **≠** HA green **≠** 生产 failover **≠** 阶 C/D 绿（`nestSessionOk` 本地可关但仍 `releaseEvidence=false` · Not HA）。
