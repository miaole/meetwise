# 审查 — Meetwise HA C1 真 compose · mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审；实现方不自审；不采信自报；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：HA **C1 真 compose 路径**（meetwise-core 送审；本地 dual Nest `/livez` 可起）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`  
**对照**：`ai-docs/delivery/north-star-ha.md` 证据阶梯 **C/D**（今日 **prove 未绿**；C3 shared=GAP；D 未开）  
**前序**：`reviews/2026-09-10-ha-multi-instance-mw-e2e-ha.md`（stub/工具轨 pass；stub ≠ Nest ≠ 生产 HA）  
**硬钉**：`releaseEvidence=false` · **Not HA** · **C1 path ≠ 阶 C/D 绿** · **C3 shared 仍 GAP** · **禁止升阶 HA / releaseEvidence=true / 生产 failover 已验**  
**禁区**：未碰 Meridian；未读 `.env*`

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 Not HA；无 `releaseEvidence=true`；无阶 C/D 绿 / 生产 HA / failover 已验叙事） |
| 是否批准 **C1 真 compose 路径 / 工具轨登记** | **是**（`compose.ha-dual.yml` + `Dockerfile.ha-dual` + `build-backend-image` + bring-up `--compose/--build` + harness/north-star 更新） |
| 是否批阶 C/D prove 绿 | **否** |
| 是否批生产 HA / 可用性已证 / failover 已验 | **否** |
| 是否批 `releaseEvidence=true` | **否**（强制 false） |
| 是否批 C3 shared-state 已证 | **否**（仍 GAP；placeholder `DATABASE_URL` ≠ A→B 共享证明） |
| 进入 C3 shared + CI 阶 D | **本域不自动开工**；须另开授权 + 真收据 + 独立审 |

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）本切片未发现把授权本地 compose dual `/livez` / `DUAL_COMPOSE_UP` EXIT=0 偷升为阶 C/D 绿、生产 HA、或 `releaseEvidence=true` 的成立阻塞 | **无阻塞** |
| B1 | **立场钉（非缺陷）** | `ha-track:multi:prove` / `build-image` / 默认 bring-up / 授权 `--compose` EXIT=0 **仅**表示 C1 路径可登记与本地机械可跑；**不得**记为阶 C/D 已绿、生产 HA、shared-state 已证、failover 已验 | **强制遵守** |
| B2 | **立场钉（非缺陷）** | `--require-instances`（无真双实例）与 `--require-evidence`（缺 dual+kill+**real shared**）必须 **EXIT=1** fail-closed；即便授权 compose dual livez 全绿，receipt 仍须 `haStatus: NOT_HA` · `releaseEvidence: false` · `sharedOk=false` / C3 GAP | **已核验成立** |
| B3 | **立场钉（非缺陷）** | 本地 `api-a`/`api-b` compose Nest `/livez` **≠** 生产多 AZ / 生产 HA；placeholder DB **≠** C3 shared；C3 今日 **GAP**（`shared-state.GAP.json`） | **强制遵守** |
| O1 | **反对 / nit（不降级）** | `/meta` 仅回 `name/version/revision`，未回显 `INSTANCE_ID`（compose 已注入 env）。身份靠 container_name + 双端口 livez，足够 C1，但易被追问「如何区分 A/B」。 | **不降级**；禁把缺 INSTANCE_ID 回显写成「未起 Nest」——本审已见 `meetwise-api` + healthy containers |
| O2 | **反对 / nit（不降级）** | `result: DUAL_COMPOSE_UP` 命名强；外行易读成「HA 齐套」。harness/receipt note 已钉 C1/C2 only · C3 GAP · Not HA。 | **不降级**；对外摘要须用 `haStatus/releaseEvidence/result/ladder`，勿只报 EXIT=0 |

**冲突取更严**：若他域把 O1/O2 升为 conditional，以更严为准。本域因文档钉、receipt 硬编码 `NOT_HA`/`releaseEvidence: false`、require-* 真 fail-closed、C3 仍 GAP，维持 **pass**。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称 | 独立结果 |
|------|----------|
| `docker/compose.ha-dual.yml` + `Dockerfile.ha-dual` | **成立**。头注释钉 Not HA / `releaseEvidence=false` / placeholder DB ≠ shared；LABEL `haStatus=NOT_HA` |
| `scripts/ha/build-backend-image.mjs` | **成立**。receipt 硬编码 `NOT_HA` / `releaseEvidence: false`；note 钉 C3 GAP |
| bring-up `--compose` / `--build` | **成立**。无授权 → `COMPOSE_REFUSED`/`PREREQ_GAP`；授权+镜像 → `DUAL_COMPOSE_UP` 且仍 Not HA |
| harness / north-star 更新 | **成立**。C1 路径已落；阶 C/D prove 未绿；C3 shared=GAP；禁止勾 `releaseEvidence=true` |
| multi.proof EXIT=0 | **成立**（见 CMD 表） |
| build-image EXIT=0 | **成立**（`IMAGE_BUILT`） |
| 默认 bring-up PREREQ_GAP EXIT=0 | **成立**（镜像已有但仍缺授权） |
| `--require-instances` EXIT=1 | **成立** |
| 无授权 `--compose` EXIT=0 PREREQ | **成立**（`mode: COMPOSE_REFUSED`） |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 --compose` → `DUAL_COMPOSE_UP` EXIT=0 | **成立**；两端口 `/livez` 200；`meetwise-api`；**仍** `haStatus: NOT_HA` · `releaseEvidence: false` · note 钉 C3 GAP |
| `--require-evidence` EXIT=1 | **成立**（含 dual compose 已起后仍 EXIT=1，因 `sharedOk=false`） |
| C3 shared 仍 GAP | **成立**。harness 表；compose placeholder；证据 `shared-state.GAP.json`；probe `sharedOk=false` · `C3_shared=GAP` |

### 头注释 / 文件抽查

| 文件 | 诚实钉 |
|------|--------|
| `compose.ha-dual.yml` | Not HA；placeholder DATABASE_URL；C3 GAP；禁合入 prod |
| `Dockerfile.ha-dual` | LABEL `releaseEvidence=false` / `haStatus=NOT_HA`；bind-mount 壳 ≠ 生产 digest |
| `build-backend-image.mjs` | receipt 硬编码 false/NOT_HA；image ≠ dual ≠ HA |
| `bring-up-dual.mjs` | 默认 PREREQ；未授权拒 compose；`--require-instances` fail-closed；`DUAL_COMPOSE_UP` note 钉 C3 GAP |
| `ha-track.multi.proof.mjs` | 静态；要求 C1 compose + AUTHORIZED 钉；ladder C/D not green |
| `probe.multi.mjs` | ALWAYS NOT_HA；`--require-evidence` fail-closed；ladder `C3_shared=GAP` |
| `north-star-ha.md` | C1 路径登记；C3 GAP；阶 C prove 未绿；本地 dual ≠ 生产 HA |

### 对抗：compose 绿是否偷升 Nest 生产 HA / 阶 C/D；shared 是否仍 GAP；unauthorized / require-* 是否真 fail-closed

| 检查 | 结果 |
|------|------|
| 交付物是否出现 `releaseEvidence=true`（非「禁止勾」语境） | **未发现**；仅禁令语境；receipt / printReceipt / LABEL 硬编码 `false` |
| 是否宣称阶 C/D 绿 / 生产 HA / failover 已验 | **未发现**；反面禁令齐全（harness/north-star/脚本头/receipt note） |
| 授权 compose 是否冒充生产 HA | **否**：`mode: COMPOSE_HA_DUAL` + note「C1/C2 local path only; C3 shared=GAP; ≠ production HA」 |
| 无 `MEETWISE_HA_DUAL_AUTHORIZED` 默认 / `--compose` | **PREREQ_GAP** / `COMPOSE_REFUSED`；EXIT=0（诚实 GAP）；不偷起 |
| `--require-instances` 无真双实例 | **EXIT=1**（`requireInstances: true` · `result: PREREQ_GAP`） |
| `--require-evidence` 无齐套（含 real shared） | **EXIT=1**；**即便** dual Nest livez 已 200 仍 EXIT=1（`sharedOk=false` / `sharedGapMarker=true`） |
| C3 shared | **仍 GAP**；placeholder DB；`shared-state.GAP.json`；ladder 字段诚实 |

---

## CMD + EXIT 全表（本审复跑 · PT 2026-09-10 ≈03:48–03:49）

| CMD | EXIT | 关键 receipt 字段 | 解读 |
|-----|------|----------------|------|
| `node scripts/ha/ha-track.multi.proof.mjs`（≡ `pnpm ha-track:multi:prove`） | **0** | `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` | 交付物+诚实钉+C1 路径；**≠ HA**；**≠ 阶 C/D 绿** |
| `node scripts/ha/build-backend-image.mjs`（≡ `pnpm ha:dual:build-image`） | **0** | `result: IMAGE_BUILT` · `haStatus: NOT_HA` · `releaseEvidence: false` | 本地镜像壳；**≠** 双实例已起；**≠ HA** |
| `node scripts/ha/bring-up-dual.mjs`（≡ `pnpm ha:dual:bring-up`） | **0** | `result: PREREQ_GAP` · `mode: ASSESS` · `haStatus: NOT_HA` · `releaseEvidence: false` · prereq=`MEETWISE_HA_DUAL_AUTHORIZED=1` | 镜像已有仍缺授权；诚实 GAP |
| `node scripts/ha/bring-up-dual.mjs --require-instances` | **1** | 同上 + `requireInstances: true` · CMD `EXIT=1` | **fail-closed** |
| `node scripts/ha/bring-up-dual.mjs --compose`（无授权） | **0** | `result: PREREQ_GAP` · `mode: COMPOSE_REFUSED` · `haStatus: NOT_HA` · `releaseEvidence: false` | 拒真拉起；默认仍 PREREQ |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 node scripts/ha/bring-up-dual.mjs --compose`（≡ 授权 `pnpm ha:dual:compose`） | **0** | `result: DUAL_COMPOSE_UP` · `mode: COMPOSE_HA_DUAL` · `haStatus: NOT_HA` · `releaseEvidence: false` · livez A/B 200 | **C1/C2 本地路径**；独立观测 `meetwise-api` + healthy；**C3 仍 GAP**；**≠ 生产 HA** |
| `node scripts/ha/probe.multi.mjs --require-evidence`（无 dual 时） | **1** | `result: FAIL` · `haStatus: NOT_HA` · `requireEvidence: true` · `releaseEvidence: false` · `C3_shared=GAP` | **fail-closed** |
| `node scripts/ha/probe.multi.mjs --require-evidence`（dual compose 已起后） | **1** | `result: FAIL` · dual livez **PASS** · `sharedOk=false` · `sharedGapMarker=true` · `haStatus: NOT_HA` | compose 绿仍因 shared GAP **fail-closed** |
| `docker compose -f docker/compose.ha-dual.yml config` | **0** | — | 静校；**≠** 已起；**≠ HA** |
| `node scripts/ha/bring-up-dual.mjs --compose-down`（复跑后清理） | **0** | `result: COMPOSE_DOWN` · `haStatus: NOT_HA` | 审后拆除；仍 Not HA |
| 阶 C/D prove 绿 / C3 shared 已证 / 生产 failover / `releaseEvidence=true` | **N/A** | — | **未开**；禁止计入本切片 |

独立观测（授权 compose 期间）：

- `curl :18787/livez` / `:18788/livez` → `{"status":"ok"}`
- `curl :18787/meta` / `:18788/meta` → `{"name":"meetwise-api","version":"dev","revision":"dev"}`（Nest，非 stub）
- `docker ps` → `meetwise-ha-dual-api-a|b` · `meetwise-backend:ha-dual-local` · healthy
- 证据：`.tmp/ha-evidence/shared-state.GAP.json`（`status: GAP` · `haStatus: NOT_HA` · `releaseEvidence: false`）

---

## 非宣称（硬禁）

- **不批** 生产 HA / HA green / 可用性已证 / multi-AZ / 生产 failover 已验  
- **不批** 阶 C/D prove 绿（C1 路径落地 ≠ 阶 C 齐套）  
- **不批** C3 shared-state 已证（placeholder DB / `shared-state.GAP.json`）  
- **不批** `releaseEvidence=true` / controlPlaneClosed  
- **不以** multi.proof / build-image / PREREQ_GAP / `DUAL_COMPOSE_UP` EXIT=0 冒充生产 HA 或阶 C/D 绿  

---

## 批准范围

**批准仅「C1 真 compose 路径 / 工具轨登记」**：允许在北星/harness/目录中登记真本地 dual compose 路径与今日可跑命令（`ha-track:multi:prove` · `ha:dual:build-image` · `ha:dual:bring-up` · `ha:dual:compose` · 授权后 `DUAL_COMPOSE_UP`）；**明确未批准**阶 C/D 绿、C3 shared 已证、生产 HA、或 `releaseEvidence=true`。

**明确 ≠ 阶 C/D 绿 ≠ 生产 HA。**

---

## reviews 路径

`ai-docs/delivery/reviews/2026-09-10-ha-c1-real-compose-mw-e2e-ha.md`
