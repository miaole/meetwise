# 审查 — Meetwise HA Nest Postgres 真会话（C3b close）· mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审工作臂；实现方不自审；不采信自报 / REQUEST 草稿；独立复跑）  
**日期**：2026-09-10（PT ≈05:11–05:13）  
**切片**：HA **C3b Nest 业务 session A→B sticky-truth** via 本地 Postgres sidecar（`compose.ha-dual.pg.yml` + `prepare-nest-pg` + `--compose-pg` + `prove-nest-session --prove`）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`（C3b）  
**对照**：`ai-docs/delivery/north-star-ha.md` 证据阶梯 **C/D**（今日 **prove 仍未绿**；本地 nestSessionOk **≠** 阶 C 绿）  
**前序**：`reviews/2026-09-10-ha-nest-session-mw-e2e-ha.md`（C3b 诚实 GAP：`nestSessionOk=false`；sole 无 Postgres）  
**硬钉**：`releaseEvidence=false` · **Not HA** · 本地 `nestSessionOk=true` **≠** 生产 HA · **host_published_pg / host.docker.internal 诚实** · 默认无 overlay 仍 **PREREQ / nestSessionOk=false** · `--require-evidence` **仍 EXIT=1**  
**禁区**：未碰 Meridian；未读 `.env*`  
**草稿处理**：`REQUEST-2026-09-10-ha-nest-pg-session-mw-e2e-ha.md` **仅作对照**；实现方自报不当自批；本文件为本臂独立审稿。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 Not HA；本地 sticky 路径可登记；无 `releaseEvidence=true`；无生产 HA / 阶 C/D 绿叙事） |
| 是否批准 **本地 Nest session sticky 路径登记** | **是**（PG overlay + prepare + bring-up `--compose-pg` + `--prove` A signup/login → B `/profile`；`nestSessionOk=true` LOCAL · `nest-session.OK.json`） |
| 是否批 Nest 业务 session **生产级已共享 / 生产 HA** | **否** |
| 是否批阶 C/D prove 绿 | **否** |
| 是否批 `releaseEvidence=true` | **否**（强制 false；即便 nestSessionOk=true） |
| 是否把 hostpath / `host.docker.internal` 写成生产多 AZ / 生产共享 PG | **否**（强制禁止；本拓扑名 = `host_published_pg`） |
| 默认无 PG overlay 是否仍 fail-closed | **是**（干净证据目录：`PREREQ_GAP` · `nestSessionOk=false`；`--require-session` → 1） |

**批准范围（唯一）**：C3b **本地 Nest PG session sticky 路径登记**（工具 + overlay + 授权门 + 本地 sticky prove 收据）。  
**明确 ≠** 生产 HA ≠ 阶 C/D 绿 ≠ `releaseEvidence=true` ≠ 生产多 AZ / 生产共享 PG ≠ 仅凭 C3 Redis/MySQL `SHARED_OK` 升格。

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）未发现把本地 `nestSessionOk=true` / hostpath PG / dual `/readyz` 偷写成生产 HA、阶 C/D 绿、或 `releaseEvidence=true` | **无阻塞** |
| B1 | **立场钉** | 本地 `nestSessionOk=true` **≠** 生产 HA / 阶 C 绿 / `releaseEvidence=true`；`--require-evidence` 必须仍 **EXIT=1** | **本臂已核验成立** |
| B2 | **立场钉** | 拓扑诚实：`MEETWISE_HA_NEST_PG_TOPOLOGY=host_published_pg` · `DATABASE_URL=…@host.docker.internal:54339/…` · **不得**称生产多 AZ / 生产共享 PG | **本臂已核验成立**（compose 注释 + 运行时 env + ExtraHosts） |
| B3 | **立场钉** | **默认无 PG overlay / 无授权 / 无 OK 收据** → `nestSessionOk` **必须 false** / `PREREQ_GAP`；`--require-session` → **EXIT=1** | **本臂已核验成立**（干净证据目录） |
| B4 | **立场钉** | 不得批生产 HA / 阶 C/D / `releaseEvidence=true`；实现方 REQUEST **不当自批** | **强制遵守** |
| O1 | **nit（不降级）** | harness `ha-track.multi-instance.md` 收据清单 **2b** / 成功标准仍写「今日 GAP / 仍 GAP」，与同文 C3b「本地路径已落 · nestSessionOk 可 true」不一致。对外应以 **LOCAL_OK · 仍 ≠ 阶 C/D / 生产 HA** 为准 | **不降级**；建议实现方改钉，避免双读 |
| O2 | **nit（不降级）** | `prove-nest-session` 无 `--prove` 时会 **复用** 磁盘 `nest-session.OK.json`（不复验 dual/PG 仍存活）。拆栈后默认可仍报 `nestSessionOk=true`。receipt 仍 `NOT_HA` / `releaseEvidence=false`；`--require-evidence` 仍 1 | **不降级**；CI/门禁应用 `--prove` 或干净证据目录；勿静默当「当前拓扑仍绿」 |
| O3 | **nit（不降级）** | PG `ports: "54339:5432"` 绑 `0.0.0.0`（sandbox host-gateway 可达）。compose 已标 local-dev / Not HA；**≠** 生产暴露声称 | **不降级**；保持反面钉 |

**冲突取更严**：若他域（mw-rag-route）把 O1–O3 升为 conditional，以更严为准。本域因 fail-closed、receipt 硬编码、hostpath 明示、`--require-evidence` 恒拒，维持 **pass**（仅本地 sticky 路径范围）。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称 | 独立结果 |
|------|----------|
| `compose.ha-dual.pg.yml` 诚实 host-published PG | **成立**。注释钉 sandbox container↔container TCP 可能阻；`host.docker.internal:54339` + `extra_hosts host-gateway`；`MEETWISE_HA_NEST_PG_TOPOLOGY=host_published_pg`；`releaseEvidence=false` · Not HA · ≠ ladder C/D · ≠ sole MySQL 替换 |
| `prepare-nest-pg` 无授权拒 | **成立**。未设 `MEETWISE_HA_NEST_PG_AUTHORIZED` → `result: PREREQ_GAP` · `nestPgReady: false` · EXIT=0（诚实记 GAP） |
| `bring-up --compose-pg` 无 NEST_PG 授权拒 | **成立**。即便 `MEETWISE_HA_DUAL_AUTHORIZED=1` → `COMPOSE_PG_REFUSED` / `PREREQ_GAP` |
| `--prove` A→B sticky | **成立（本臂复跑）**。signup@A token → GET `/profile`@B id/email match；login@A → profile@B；`result: NEST_SESSION_LOCAL_OK` · `nestSessionOk: true` · **仍** `haStatus: NOT_HA` · `releaseEvidence: false` |
| 本臂 curl 交叉核验 | **成立**。独立 signup@18787 → Bearer profile@18788 HTTP 200 · id 一致 |
| 运行时拓扑 | **成立**。`docker inspect api-a`：`DATABASE_URL=…@host.docker.internal:54339/…` · `MEETWISE_HA_NEST_PG_TOPOLOGY=host_published_pg` · ExtraHosts `host.docker.internal:host-gateway` |
| 默认无 overlay 仍 PREREQ | **成立**。`MEETWISE_HA_PROBE_EVIDENCE_DIR` 干净目录 → `nestSessionOk: false` · `PREREQ_GAP`；`--require-session` → **EXIT=1** |
| `--require-evidence` 仍 1 | **成立**。即便 `sharedOk: true` + `nestSessionOk: true` + dual livez + kill → `result: FAIL` · EXIT=1 · failReason 拒生产拓扑/CI/审 |
| 无假绿字面量 | **成立**。相关脚本/compose **无** `releaseEvidence: true` / `haStatus: HA` / `claimProductionHA: true` |
| 阶 C/D / 生产 HA | **不成立（正确拒绝）**。north-star / harness / receipt 反面钉齐全 |
| 实现方自批 closed/HA | **未发生**。仅 REQUEST 请求审稿 |

### 对抗矩阵

| 检查 | 结果 |
|------|------|
| `nestSessionOk=true` 是否偷升 HA / `releaseEvidence=true` | **否**。receipt/harness/north-star/probe 均钉 Not HA；`--require-evidence` 恒 FAIL |
| hostpath / host.docker.internal 是否诚实 | **是**。拓扑名 `host_published_pg`；非 DNS `postgres:5432` 生产共享叙事；非多 AZ |
| 无 overlay 是否仍 fail-closed | **是**（干净证据目录）；授权门拒 prepare / `--compose-pg` |
| C3 `SHARED_OK` / shared_backend_hostpath 是否冒充 Nest session | **否**。prove receipt `sharedOkPath: C3_SHARED_OK_present_but_≠_Nest_session` |
| `--require-evidence` 在 nestSessionOk=true 后是否仍 1 | **是** |
| 默认 EXIT=0 是否假绿 | **可控**。无 OK 时 = `PREREQ_GAP`；有本地 OK 时 = `NEST_SESSION_LOCAL_OK` 但仍 Not HA / releaseEvidence=false（见 O2 陈旧收据 nit） |

---

## CMD + EXIT 全表（本臂复跑 · PT 2026-09-10 ≈05:11–05:13）

| CMD（≡ package.json / 等价 node） | EXIT | 关键 receipt 字段 | 解读 |
|----------------------------------|------|----------------|------|
| `MEETWISE_HA_PROBE_EVIDENCE_DIR=/tmp/ha-evidence-clean-review node scripts/ha/prove-nest-session.mjs` | **0** | `result: PREREQ_GAP` · **`nestSessionOk: false`** · `haStatus: NOT_HA` · `releaseEvidence: false` | **默认无 overlay 诚实 GAP** |
| 同上 + `--require-session` | **1** | 同上 + `requireSession: true` | **fail-closed** |
| `env -u MEETWISE_HA_NEST_PG_AUTHORIZED node scripts/ha/prepare-nest-pg.mjs` | **0** | `result: PREREQ_GAP` · `nestPgReady: false` · `authorized: false` | 拒静默起 PG |
| `MEETWISE_HA_DUAL_AUTHORIZED=1 env -u MEETWISE_HA_NEST_PG_AUTHORIZED node scripts/ha/bring-up-dual.mjs --compose-pg` | **0** | `result: PREREQ_GAP` · `mode: COMPOSE_PG_REFUSED` | 拒无授权 PG overlay |
| `node scripts/ha/prove-nest-session.mjs --prove`（PG dual 已起） | **0** | `result: NEST_SESSION_LOCAL_OK` · **`nestSessionOk: true`** · `haStatus: NOT_HA` · `releaseEvidence: false` · ladder `nest_session=LOCAL_CLOSED; D=not_open` | **本地 sticky 成立；仍 Not HA** |
| `node scripts/ha/prove-nest-session.mjs --require-session`（OK 已落盘） | **0** | `nestSessionOk: true` · 复用 OK 收据 | 本地门闩可通过；**≠** 生产 |
| `node scripts/ha/probe.multi.mjs --require-evidence` | **1** | `result: FAIL` · `sharedOk: true` · **`nestSessionOk: true`** · `requireEvidence: true` · `releaseEvidence: false` | **硬钉成立**（nestSessionOk 不升 releaseEvidence） |
| `node scripts/ha/ha-track.multi.proof.mjs` | **0** | `NOT_HA` · `releaseEvidence: false` · note 可 LOCAL_OK 仍 Not HA | 静态交付物+诚实钉 |
| 本臂 curl：POST A `/auth/signup` → GET B `/profile` Bearer | HTTP **200**/ **200** | id/email 一致 | 交叉核验 sticky |
| 阶 C/D 绿 / 生产 HA / `releaseEvidence=true` | **N/A** | — | **未开**；禁止计入本切片 |

### 本臂核验证据（`.tmp/ha-evidence/`）

| 文件 | 观察 |
|------|------|
| `nest-session.OK.json` | `status: OK` · `nestSessionOk: true` · `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false` · path A_signup→B_profile + A_login→B_profile · note LOCAL sticky · ≠ ladder C/D |
| `nest-pg-prepare.json` | `nestPgReady: true` · host `127.0.0.1:54339` · `haStatus: NOT_HA` · `releaseEvidence: false` |
| `nest-session-A-signup.json` / `B-profile.json` | signup/profile sticky OK |
| `shared-state-*.json`（前序 C3） | `sharedPath: shared_backend_hostpath` · **仍 ≠ Nest session** |
| `/tmp/ha-evidence-clean-review/nest-session.GAP.json` | 本臂干净目录写出：`nestSessionOk: false` · `PREREQ_GAP` 语义 |

→ **接受「本地 Nest session sticky 路径可登记」**；**拒绝**「生产 HA / 阶 C/D 绿 / releaseEvidence=true / 生产共享 PG」。

---

## 非宣称（硬禁）

- **不批** 生产 HA / HA green / 可用性已证 / multi-AZ / 生产 failover 已验  
- **不批** 阶 C/D prove 绿（本地 C3b LOCAL_OK ≠ 阶 C 齐套；D 未开）  
- **不批** `releaseEvidence=true` / controlPlaneClosed  
- **不批** 把 `host.docker.internal:54339` / `host_published_pg` / `0.0.0.0:54339` 写成生产共享 Postgres 或多 AZ  
- **不以** `nestSessionOk=true` / prove EXIT=0 / multi.proof EXIT=0 / dual `/readyz` 200 冒充生产 HA  

---

## Nest session 实际状态 · hostpath 诚实性 · 假绿风险

| 维 | 本审结论 |
|----|----------|
| Nest session 实际状态 | **本地 LOCAL_OK**（`nestSessionOk=true`，经本臂 `--prove` + curl）。**仍** `haStatus=NOT_HA` · `releaseEvidence=false` · **≠** 生产 HA · **≠** 阶 C/D 绿 |
| Topology | **`host_published_pg`**：API 经 `host.docker.internal:54339`（host-gateway）达 sidecar PG；**诚实**披露 sandbox container DNS/TCP 限制；**非**生产多 AZ / 非生产共享 PG |
| 默认 / 无 overlay | 干净证据目录仍 **PREREQ_GAP** · `nestSessionOk=false`；prepare / `--compose-pg` 无 `MEETWISE_HA_NEST_PG_AUTHORIZED` 拒 |
| `--require-evidence` | **EXIT=1**（即便 nestSessionOk=true + sharedOk=true） |
| 假绿/升阶风险 | **可控**：receipt/文档反面钉齐全；主风险是外行把「nestSessionOk=true / prove EXIT=0」念成 HA 或阶 C 绿，或把 hostpath 念成生产共享 PG（见 O1/O2）。对外摘要必须带：`LOCAL nestSessionOk=true` · `haStatus=NOT_HA` · `releaseEvidence=false` · `topology=host_published_pg` · `--require-evidence=1` |

---

## 回传摘要（给父代理）

- **结论 / verdict**：pass（仅本地 Nest session sticky 路径登记）  
- **批准范围**：`compose.ha-dual.pg.yml` + `ha:prepare:nest-pg` + `--compose-pg` + `ha:prove:nest-session -- --prove` 本地 sticky；**不批** 生产 HA / 阶 C/D / `releaseEvidence=true`  
- **阻塞栏**：无产品阻塞；B1–B4 立场钉强制；O1–O3 nit 不降级  
- **CMD+EXIT**：干净默认 **0**（PREREQ_GAP · nestSessionOk=**false**）；`--require-session`（无 OK）**1**；`--prove` **0**（nestSessionOk=**true** · NOT_HA）；`--require-evidence` **1**（nestSessionOk=true 仍 FAIL）  
- **review 路径**：`ai-docs/delivery/reviews/2026-09-10-ha-nest-pg-session-mw-e2e-ha.md`  
- **hostpath 诚实性**：成立（`host_published_pg` / `host.docker.internal:54339`；非生产多 AZ）  
- **假绿风险**：可控；禁把本地 nestSessionOk / hostpath PG 念成 HA 或 `releaseEvidence=true`  
