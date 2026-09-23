# Harness — Meetwise HA multi-instance track（beyond skeleton）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 生产 HA** · **stub dual /livez ≠ Nest API 双实例已证** · **compose dual /livez ≠ 生产 HA** · **stub fault-inject ≠ 生产 failover**  
**状态**：multi-instance **工具轨已落** · **C1 真 compose 路径已落** · **C3 本地 shared 路径已落**（sole-stack Redis A→B + MySQL marker；需 `--compose-shared` + `MEETWISE_HA_SHARED_AUTHORIZED`）· **C3b Nest session 本地路径已落**（`compose.ha-dual.pg.yml` + `ha:prepare:nest-pg` + `--compose-pg` + `ha:prove:nest-session -- --prove`；需 `MEETWISE_HA_NEST_PG_AUTHORIZED`；**本地 nestSessionOk 可 true 仍 Not HA**）· 阶 **C/D prove 未绿** · **禁止勾 releaseEvidence=true** · **禁止叙事 production HA**

对照：`../north-star-ha.md` 证据阶梯 **C** / **D**；前序骨架：`ha-track.skeleton.md`（已双域审 pass · 仅骨架登记）。

---

## 本切片交付物

| 路径 | 角色 |
|------|------|
| `ai-docs/delivery/harness/ha-track.multi-instance.md` | 本 runbook |
| `docker/compose.ha-dual.yml` | **真**本地双 API compose（超 skeleton）；api-a/api-b；**非**生产拓扑 |
| `docker/Dockerfile.ha-dual` | 本地镜像壳 `meetwise-backend:ha-dual-local`（compose bind-mount 仓库） |
| `scripts/ha/build-backend-image.mjs` | 构建本地 HA dual 镜像标签 |
| `scripts/ha/bring-up-dual.mjs` | 双实例 bring-up：默认 **PREREQ_GAP**；`--stub`；`--compose`（需授权+镜像）；`--build` |
| `scripts/ha/dual-livez-stub.mjs` | 仅 `/livez`+`/meta` 的双端口 stub（C2 探针机械） |
| `scripts/ha/fault-inject.mjs` | **C4** 真路径：compose `docker stop api-a`（或 `--network-half`）+ B `/livez` + optional `--with-shared-survivor`；需 `MEETWISE_HA_FAULT_AUTHORIZED`；**≠** 生产 failover |
| `scripts/ha/fault-inject.stub.mjs` | 故障注入 stub：A down / B up（stub 路径）；**shared-state = GAP**（livez-only） |
| `scripts/ha/probe.multi.mjs` | 多实例探针（超骨架）；默认 `haStatus: NOT_HA`；`--with-shared`；`--require-evidence` **fail-closed EXIT=1** |
| `docker/compose.ha-dual.shared.yml` | C3 overlay：api-a/api-b 接入 sole-stack MySQL/Redis 网络；**非**生产拓扑 |
| `scripts/ha/prove-shared-state.mjs` | C3 prove：Redis SET@A → GET@B + MySQL marker；默认 PREREQ_GAP；`--require-shared` fail-closed |
| `scripts/ha/prove-nest-session.mjs` | Nest 业务 session A→B prove：本环境 **PREREQ_GAP**（Postgres auth/session vs sole MySQL）；`--require-session` fail-closed；可选 `--probe` |
| `scripts/ha/redis-resp-once.mjs` | 容器内无依赖 Redis RESP 一次性 SET/GET |
| `scripts/ha/ha-track.multi.proof.mjs` | 静态：文件 + 诚实钉；**不**起实例、**不** claim HA |
| root `package.json` | `ha-track:multi:prove` · `ha:dual:bring-up` · `ha:dual:stub` · `ha:dual:build-image` · `ha:dual:compose` · `ha:dual:compose-shared` · `ha:probe:multi` · `ha:prove:shared` · `ha:prove:nest-session` · `ha:fault-inject:stub` |

---

## 硬禁

- 禁止把 stub dual `/livez`、compose 本地 dual `/livez`、stub / **本地 compose** fault-inject、本 harness EXIT=0 写成 **生产 HA** / **HA green** / `releaseEvidence=true`
- 禁止把 `PREREQ_GAP` 静默吞掉后宣称 multi-instance 已证
- 禁止自批阶 C/D；须独立审（mw-e2e-ha + 第二域）+ 真实收据
- 可选 compose **不得**合入生产拓扑冒充多副本

---

## 阶梯对照（诚实）

| 阶步 | 本轨状态 | 说明 |
|------|----------|------|
| **C1** 真 compose | **路径已落** · 默认可 **PREREQ** | `docker/compose.ha-dual.yml` + `ha:dual:build-image` + `--compose`；无 `MEETWISE_HA_DUAL_AUTHORIZED` / 无镜像标签 → **PREREQ_GAP**；授权+镜像后可起 api-a/api-b；**仍 ≠ 生产 HA** |
| **C2** 双 `/livez` | **stub 可跑** · **compose 授权后可跑** | stub：`ha:dual:stub`；compose：授权后两端口 200；**≠** 生产多 AZ |
| **C3** 共享态 A 写 B 读 | **本地路径已落** · 默认可 **PREREQ** | `--compose-shared` + `ha:prove:shared -- --prove`：优先 in-container Redis A→B；若环境 container↔container TCP 被阻则 **shared_backend_hostpath**（sole redis/mysql exec + A/B env 对等 + DNS）；收据 `shared-state-A-write.json` / `shared-state-B-read.json`；**≠** Nest 业务 session/job；**≠** 生产 HA |
| **C3b** Nest 业务 session A→B | **本地路径已落** · 默认可 **PREREQ** | `compose.ha-dual.pg.yml` + `ha:prepare:nest-pg` + `--compose-pg` + `ha:prove:nest-session -- --prove`：A signup/login token → B `GET /profile`；成功 → `nestSessionOk=true` + `nest-session.OK.json`；**仍** `haStatus=NOT_HA` · `releaseEvidence=false`；无授权/无 PG → **PREREQ_GAP**；`--require-session` → EXIT=1；**≠** 生产 HA · **≠** 阶 C 绿 |
| **C4** fault-inject | **本地路径已落** · 默认可 **PREREQ** | `ha:fault-inject`（`fault-inject.mjs`）：授权后 `docker stop` api-a、B `/livez`、可选 `--with-shared-survivor`（sole Redis/MySQL）；无 `MEETWISE_HA_FAULT_AUTHORIZED` → **PREREQ_GAP**；`--require-fault` → EXIT=1；stub 仍可用 `ha:fault-inject:stub`；**≠** 生产 failover |
| **D1–D3** `ha:probe`+CI+独立审 | **Local D1 done** · **D2 workflow+static done** · **D2b = live CI artifact (real URL)** · **D3 OUT OF SCOPE** · 阶 C/D **STILL NOT GREEN** | Local D1 nail `b72c7c4` · D2 nail `d79519d` / pin `9015410` · D2b live run **https://github.com/miaole/meetwise/actions/runs/35930389740** · artifact **`ha-probe-multi-receipt`** (API `https://api.github.com/repos/miaole/meetwise/actions/artifacts/10781320550` · Actions download `https://github.com/miaole/meetwise/actions/runs/35930389740/artifacts/10781320550`) · stub EXIT=0 · `--require-evidence` EXIT=1 honesty SUCCESS · **`haStatus=NOT_HA`** · **Ban claim 阶 D from artifact URL alone** · Ban claim production HA · D3 production probe **OUT OF SCOPE** |

**D2b lifecycle sync**: live artifact URL is recorded above; Local D1/D2 are done; D3 is **OUT OF SCOPE**; post-prove dual is **BOTH PASS** (`mw-e2e-ha` `ec75d12`, `mw-rag-route` `24be709`); status **`post_prove_dual_pass`** · nail tip = this commit. These receipts do **not** claim 阶 D/HA; 阶 C/D **STILL NOT GREEN**; artifact URL alone is not 阶 D; retain `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`.

**本地 C3 Redis/MySQL prove ≠ 阶 C 绿。** 本地 Nest PG session LOCAL_OK **≠** 生产 HA **≠** 阶 C/D 绿 **≠** `releaseEvidence=true`。未齐真故障注入生产级 + CI + 独立审生产回执 → 阶 C/D = **未绿**；保持 NOT_HA。  
**C1/C3/C3b 路径落地 ≠ 批准阶 C 绿 ≠ `releaseEvidence=true`。**

---

## PREREQ_GAP（本环境诚实结论）

真 Nest 双实例 compose 需同时：

1. **镜像标签**：`MEETWISE_HA_BACKEND_IMAGE`（默认 `meetwise-backend:ha-dual-local`）本地存在  
   → `pnpm ha:dual:build-image`
2. **授权**：`MEETWISE_HA_DUAL_AUTHORIZED=1`  
   → 未设时 `--compose` **拒绝**真拉起
3. 共享态 prove（C3）：sole-stack MySQL/Redis 已起 + `MEETWISE_HA_SHARED_AUTHORIZED=1` + `--compose-shared`（overlay 用与 `compose.mysql-local.yml` 同类的 **local-dev placeholder**；**不读、不写 `.env*`**）  
   → 缺任一时 `ha:prove:shared` → **PREREQ_GAP**；`--require-shared` → EXIT=1

因此默认：

```bash
pnpm ha:dual:bring-up
# result: PREREQ_GAP · haStatus: NOT_HA · releaseEvidence: false · EXIT=0（诚实记 GAP）
# prereq: MEETWISE_HA_DUAL_AUTHORIZED=1 + image:meetwise-backend:ha-dual-local
# --require-instances → EXIT=1 fail-closed
```

授权 compose 路径（本地 C1/C2；**仍 Not HA**）：

```bash
pnpm ha:dual:build-image
MEETWISE_HA_DUAL_AUTHORIZED=1 pnpm ha:dual:bring-up -- --compose
# 或一次：MEETWISE_HA_DUAL_AUTHORIZED=1 pnpm ha:dual:bring-up -- --compose --build
# 期望：result DUAL_COMPOSE_UP · 两端口 /livez 200 · haStatus NOT_HA · releaseEvidence false
pnpm ha:dual:bring-up -- --compose-down
```

C3 本地 shared（sole-stack；**仍 Not HA**）：

```bash
# sole stack must already expose network meetwise-mysql-local_default
docker compose -f docker/compose.mysql-local.yml up -d mysql redis
MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:bring-up -- --compose-shared
MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove
# 期望：result SHARED_OK · sharedOk: true · haStatus NOT_HA · releaseEvidence false
pnpm ha:probe:multi -- --with-shared   # sharedOk=true on receipt; still NOT_HA
pnpm ha:prove:shared -- --require-shared   # 无齐套时 EXIT=1 fail-closed
```


C4 本地 fault-inject（compose kill；**仍 Not HA**）：

```bash
# dual+shared already up from C3 path
MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor
# 期望：result COMPOSE_FAULT_SHARED_PARTIAL · A down + B livez · sharedState SHARED_OK_SURVIVOR
#        haStatus NOT_HA · releaseEvidence false
pnpm ha:fault-inject -- --require-fault   # 无授权/无 dual → EXIT=1 fail-closed
MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --restore   # 可选：重启 api-a（本地）
# stub-only path（无 compose）：
pnpm ha:dual:stub && pnpm ha:fault-inject:stub
```

C2 探针机械用 stub（显式 opt-in）：

```bash
pnpm ha:dual:stub          # ≡ bring-up --stub
pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject
```

---

## 今日可跑

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm ha-track:multi:prove` | **0** | 交付物 + 诚实钉；**≠ HA** |
| `pnpm ha:dual:build-image` | **0** | 本地镜像标签；**≠** 双实例已起；**≠ HA** |
| `pnpm ha:dual:bring-up` | **0**（PREREQ_GAP）或已有双 livez | 默认评估；不偷起真 API |
| `pnpm ha:dual:bring-up -- --require-instances` | **1**（无真双实例时） | fail-closed |
| `pnpm ha:dual:bring-up -- --compose`（无授权/镜像） | **0** GAP / **1** if `--require-instances` | 具体 prereq 字段 |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 pnpm ha:dual:compose`（镜像已有） | **0** | 双 Nest `/livez`；**Not HA**；无 overlay 时 C3 未跑 |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared` | **0** | 双 Nest + sole-stack 网络；**Not HA**；C3 待 `ha:prove:shared` |
| `MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove` | **0**/PREREQ | `SHARED_OK` + A-write/B-read 收据；**≠** 生产 HA |
| `pnpm ha:prove:shared`（无授权/无 dual） | **0**（PREREQ_GAP） | 诚实 GAP |
| `pnpm ha:prove:shared -- --require-shared` | **1**（无齐套时） | fail-closed |
| `pnpm ha:prepare:nest-pg`（需 NEST_PG 授权） | **0** | PG migrate+runtime；**Not HA** |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_NEST_PG_AUTHORIZED=1 pnpm ha:dual:compose-pg` | **0** | 双 Nest + PG；**Not HA** |
| `pnpm ha:prove:nest-session` | **0**（无 OK 时 PREREQ_GAP） | 默认评估；**Not HA** |
| `pnpm ha:prove:nest-session -- --prove`（PG dual 已起） | **0** | `nestSessionOk: true` LOCAL；**仍 Not HA** |
| `pnpm ha:prove:nest-session -- --require-session` | **0**/ **1** | nestSessionOk 时 0；否则 fail-closed 1 |
| `pnpm ha:prove:nest-session -- --probe` | **0** | 可选 dual `/readyz`+`/auth` 收据 |
| `pnpm ha:dual:stub` | **0** | dual stub `/livez` up；**Not HA** |
| `pnpm ha:probe:multi` | **0** | 收据 `haStatus: NOT_HA`；缺 dual 则 `MULTI_TRACK_GAP` |
| `pnpm ha:probe:multi -- --with-shared`（compose-shared 已起+授权） | **0** | `sharedOk=true`；`DUAL_SHARED_PARTIAL`；**仍 Not HA** |
| `pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject` | **0** | stub C2+C4 部分；**shared=GAP**；**Not HA** |
| `pnpm ha:probe:multi -- --require-evidence` | **1** | 即便 local sharedOk 仍 EXIT=1（拒生产 HA / 缺 CI·审） |
| `MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor` | **0** | A down + B livez + survivor shared；**Not HA** |
| `pnpm ha:fault-inject`（无授权/无 dual） | **0**（PREREQ_GAP） | 诚实 GAP |
| `pnpm ha:fault-inject -- --require-fault` | **1**（无齐套时） | fail-closed |
| `pnpm ha:fault-inject:stub` | **0**/ **1** | stub 路径；需先 dual stub up；否则 FAIL（或 `--allow-gap`） |
| `docker compose -f docker/compose.ha-dual.yml config` | **0** | 真 compose 静校；**≠** 已起；**≠ HA** |
| `pnpm ha-track:skeleton:prove` / `ha:probe:skeleton` | **0** / **0** | 骨架仍有效；不回归 |

等价 node 路径见 `scripts/ha/README.md`。

---

## 收据清单（升阶前必齐；今日不全）

1. 双实例 identity（真 Nest pid/container + 端口）同时健康 — stub **不算**；compose 本地 dual **仅** C1/C2 机械  
2. 共享存储写入 A → 读 B 一致 — **本地 Redis/MySQL 路径可证**（`shared-state-A-write.json` / `shared-state-B-read.json`）；**≠** Nest 业务 session；缺授权/sole-stack/dual → PREREQ_GAP  
2b. Nest 业务 session/auth sticky A→B — **今日 GAP**（`nest-session.GAP.json`；需 Postgres 真库 + AUTH_SECRET 共享；sole MySQL **不够**）  
3. fault-inject：A down 后 B 仍服务 — **本地 compose kill 收据可证**（`kill-A.receipt.json` / `B-still-serving.receipt.json`；可选 `fault-shared-survivor.receipt.json`）；**≠** 生产 failover；stub 收据 **仅**证明探针机械  
4. 探针 RECEIPT 全文（含 `releaseEvidence: false`）  
5. 独立审查 ≥2 域（实现方禁止自审）  
6. （阶 D ladder receipt）CI artifact URL — **D2b live recorded** `https://github.com/miaole/meetwise/actions/runs/35930389740` · artifact `ha-probe-multi-receipt` · **Ban claim 阶 D / production HA from artifact URL alone** · 阶 C/D **STILL NOT GREEN** · D3 **OUT OF SCOPE**  

缺任一 → **NOT_HA** · `releaseEvidence=false`。

---

## 成功标准（本 multi-instance / C1 真 compose 切片）

- [x] bring-up + dual stub + fault-inject stub + probe.multi + static prove 落盘  
- [x] **真** `compose.ha-dual.yml` + `Dockerfile.ha-dual` + `build-backend-image` 落盘  
- [x] 默认 PREREQ_GAP 诚实（钉 `MEETWISE_HA_DUAL_AUTHORIZED` + image tag）；`--require-evidence` fail-closed  
- [x] 所有路径显式 `releaseEvidence=false` / Not HA / `claimProductionHA=false`  
- [x] C3 本地 shared 路径（compose-shared + prove-shared-state + probe sharedOk）落盘；默认可 PREREQ  
- [x] Nest session prove 工具落盘（`ha:prove:nest-session`）且诚实 **GAP/PREREQ**（**≠** closed）  
- [ ] ~~Nest 业务 session A→B 已证~~ → **仍 GAP**（Postgres PREREQ；sole MySQL 不够）  
- [ ] ~~阶 C/D prove 绿~~ → **STILL NOT GREEN**（本地 C3 ≠ 阶 C 齐套；Nest 业务 session LOCAL ≠ 阶 C；D1/D2/D2b live CI artifact recorded ≠ 阶 D green；**Ban claim 阶 D from artifact URL alone**；D3 OUT OF SCOPE；**不自批**）  
- [ ] ~~生产 HA~~ → **禁止宣称**

## 审查

请 **mw-e2e-ha**（主）+ 第二域（**mw-rag-route**）对抗审本切片（Nest session PREREQ/GAP + harness 钉）；合入权在协调/用户；实现方 **禁止自批** HA / Nest session closed / `releaseEvidence=true` / 阶 C/D 绿。预写仅 `reviews/REQUEST-*`。
