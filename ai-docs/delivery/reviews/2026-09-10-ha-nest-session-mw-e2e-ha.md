# 审查 — Meetwise HA Nest session 真共享（C3b）· mw-e2e-ha

**审稿人**：mw-e2e-ha（对抗主审工作臂；实现方不自审；不采信自报 / REQUEST 草稿自批；独立复跑）  
**日期**：2026-09-10（PT）  
**切片**：HA **C3b Nest 业务 session A→B sticky-truth prove**（beyond C3 Redis/MySQL hostpath `SHARED_OK`）  
**Harness**：`ai-docs/delivery/harness/ha-track.multi-instance.md`（C3b）  
**对照**：`ai-docs/delivery/north-star-ha.md` 证据阶梯 **C/D**（今日 **prove 未绿**；Nest session = **GAP**；D 未开）  
**前序**：`reviews/2026-09-10-ha-c3-shared-mw-e2e-ha.md`（C3 本地 `SHARED_OK` 工具轨 pass；**明确 Nest session 未证**；`--require-evidence` 仍 1）  
**硬钉**：`releaseEvidence=false` · **Not HA** · **nestSessionOk=false** · **C3 Redis ≠ Nest session** · **sole 无 Postgres** · `--require-session` / `--require-evidence` fail-closed  
**禁区**：未碰 Meridian；未读 `.env*`  
**草稿处理**：`REQUEST-2026-09-10-ha-nest-session-mw-e2e-ha.md` / rag-route REQUEST **仅作对照**；实现方自报不当自批；本文件为本臂独立审稿。

---

## 结论

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **pass**（诚实 Not HA；`nestSessionOk=false`；无 `releaseEvidence=true`；无「Nest session 已共享」/ 阶 C/D 绿 / 生产 HA 叙事） |
| 是否批准 **C3b Nest session 诚实 GAP / 工具轨登记** | **是**（`prove-nest-session.mjs` + harness C3b + north-star / multi.proof / README 诚实钉 + `nest-session.GAP.json`） |
| 是否批 Nest 业务 session A→B **已证 / 已共享** | **否** |
| 是否批阶 C/D prove 绿 | **否** |
| 是否批生产 HA / 生产 failover 已验 | **否** |
| 是否批 `releaseEvidence=true` | **否**（强制 false） |
| 是否把 C3 `SHARED_OK` 记为 Nest session 关闭 | **否**（强制禁止） |

**批准范围（唯一）**：C3b **Nest session 诚实 GAP / PREREQ 工具轨登记**（prove 脚本 + 收据 + harness/north-star 钉）。  
**明确 ≠** Nest session 已共享 ≠ 阶 C/D 绿 ≠ 生产 HA ≠ `releaseEvidence=true` ≠ C3 Redis/MySQL `SHARED_OK` 升格。

---

## 阻塞栏（必填）

| ID | 级别 | 项 | 裁定 |
|----|------|----|------|
| — | **阻塞** | （无）未发现把 C3 `SHARED_OK` / dual `/livez` / prove 默认 EXIT=0 / `--probe` EXIT=0 偷写成 Nest session 已共享、阶 C 绿、生产 HA、或 `releaseEvidence=true` | **无阻塞** |
| B1 | **立场钉** | **C3 Redis/MySQL `SHARED_OK` ≠ Nest 业务 session**；磁盘可同时存在 `shared-state-*.json`（OK）与 `nest-session.GAP.json` | **强制遵守 · 本臂已核验** |
| B2 | **立场钉** | `nestSessionOk` **必须 false**（本环境）；`--require-session` → **EXIT=1**；`--require-evidence` → **EXIT=1**（即便 `sharedOk=true`） | **本臂已核验成立** |
| B3 | **立场钉** | sole stack = **MySQL+Redis（+qdrant）**；**无** Postgres 业务 session 路径；compose `DATABASE_URL` = placeholder `@127.0.0.1:1` | **本臂已核验成立** |
| B4 | **立场钉** | 不得批 Nest session closed / HA / `releaseEvidence=true` / 阶 C/D 绿；实现方 REQUEST **不当自批** | **强制遵守** |
| O1 | **nit（不降级）** | `prove-nest-session` 对「C3 shared receipts on disk」step 在 C3 OK 时标 **PASS**（含义=评估步找到收据），易被外行误读为 Nest 绿。收据字段仍硬钉 `nestSessionOk: false` / `result: PREREQ_GAP`。 | **不降级**；对外必须报 `nestSessionOk`/`result`/`haStatus`，禁只报 step PASS |
| O2 | **nit（不降级）** | `--allow-gap` 可在 `--require-session` 下仍 EXIT=0；receipt 仍 `nestSessionOk: false`。属显式 opt-in，非静默假绿。 | **不降级**；CI/门禁勿带 `--allow-gap` |

**冲突取更严**：若他域（mw-rag-route）把 O1/O2 升为 conditional，以更严为准。本域因 fail-closed、receipt 硬编码、harness/north-star 反面钉齐全，维持 **pass**（仅 GAP/工具轨范围）。

---

## 声称核验（独立 · 不采信实现方自报）

| 声称 | 独立结果 |
|------|----------|
| `scripts/ha/prove-nest-session.mjs` 诚实 GAP | **成立**。硬编码 `nestSessionOk: false` · `haStatus: NOT_HA` · `releaseEvidence: false`；默认 `result: PREREQ_GAP` EXIT=0；`--require-session` EXIT=1；NEVER 写 nestSessionOk=true |
| C3 `SHARED_OK` ≠ Nest session | **成立**。receipt `sharedOkPath: C3_SHARED_OK_present_but_≠_Nest_session`；step 文案显式「≠ Nest session」；gap 字段含 `C3 SHARED_OK≠Nest session` |
| sole 无 Postgres | **成立**。`compose.mysql-local.yml` 仅 mysql/redis/qdrant；无 postgres 服务 |
| Nest auth/session = Postgres 权威 | **成立**。`packages/db` `resolveDatabaseConnectionString`：`protocol !== 'postgres:' && !== 'postgresql:'` → `database_url_protocol`；`auth.service` 用 `gateway_auth_signup`/`gateway_auth_login`；`PrincipalGuard` 查 `user_account`/`pwd_epoch` |
| compose `DATABASE_URL` placeholder | **成立**。`postgresql://meetwise_ha_dual_placeholder:…@127.0.0.1:1/…`；仅供 `/livez` pool 构造 |
| harness C3b / north-star | **成立**。C3b = **GAP / PREREQ**；阶 C prove 未绿；Nest session 仍 GAP；禁止 `releaseEvidence=true` |
| `--probe` 仍 GAP | **成立**。dual `/livez` 200；`/readyz/api` **503 degraded**；`/auth/login` **未发 token**（500 `internal_error`）；仍 `nestSessionOk: false` |
| `--require-evidence` 仍 1 | **成立**。即便 `sharedOk: true` + dual+kill+shared 齐 + nestSessionGap，仍 `result: FAIL` EXIT=1 |
| Nest session 已共享 / 升阶 HA | **不成立（正确拒绝）**。未发现假绿叙事 |
| 实现方自批 closed | **未发生**。仅 REQUEST 请求审稿；成功标准勾选「工具落盘且诚实 GAP」，未勾「已证」 |

### 对抗矩阵

| 检查 | 结果 |
|------|------|
| C3 `SHARED_OK` 是否被叙事成 Nest session 已共享 | **否**。prove/probe/harness/north-star/compose 反面钉齐全；本臂复跑 `sharedOkPath` 显式 ≠ Nest |
| `--require-session` / `--require-evidence` 是否 fail-closed | **是**（EXIT=1） |
| sole 是否仍无 Postgres 业务 session 路径 | **是**（仅 MySQL+Redis+qdrant；Nest createPool 拒非 postgres） |
| 默认 EXIT=0 是否假绿 | **否**。`result: PREREQ_GAP` + `nestSessionOk: false`；0 = 诚实记 GAP，非 closed |
| `--probe` livez 200 是否偷升 | **否**。note 钉「C2 livez only — still Nest session GAP」；readyz/auth 预期失败 |
| `releaseEvidence=true` / `haStatus: HA` / `nestSessionOk: true` | **未发现**（非禁令/否定语境）；receipt 硬编码 |

---

## CMD + EXIT 全表（本臂复跑 · PT 2026-09-10 ≈04:46–04:48）

| CMD（≡ package.json） | EXIT | 关键 receipt 字段 | 解读 |
|----------------------|------|----------------|------|
| `node scripts/ha/prove-nest-session.mjs`（≡ `pnpm ha:prove:nest-session`） | **0** | `result: PREREQ_GAP` · `haStatus: NOT_HA` · `releaseEvidence: false` · **`nestSessionOk: false`** · `sharedOkPath: C3_SHARED_OK_present_but_≠_Nest_session` · ladder `nest_session=GAP; D=not_open` | 默认诚实 GAP；**≠** session 已证 |
| `node scripts/ha/prove-nest-session.mjs --require-session` | **1** | 同上 + `requireSession: true` · CMD 行 `EXIT=1` | **fail-closed** |
| `node scripts/ha/prove-nest-session.mjs --probe` | **0** | 仍 `PREREQ_GAP` · **`nestSessionOk: false`**；livez A/B 200；readyz A/B 503 degraded；auth/login 未发 token | 仍 GAP；C2 ≠ Nest session |
| `node scripts/ha/probe.multi.mjs --require-evidence`（≡ `pnpm ha:probe:multi -- --require-evidence`） | **1** | `result: FAIL` · `sharedOk: true` · **`nestSessionOk: false`** · `requireEvidence: true` · `releaseEvidence: false` · failReason 拒生产拓扑/CI/审 | **硬钉成立** |
| `node scripts/ha/ha-track.multi.proof.mjs`（≡ `pnpm ha-track:multi:prove`） | **0** | `NOT_HA` · `releaseEvidence: false` · note Nest session GAP | 静态交付物+诚实钉；**≠ HA** |
| Nest session A→B sticky 真证明 / 阶 C/D 绿 / 生产 HA / `releaseEvidence=true` | **N/A** | — | **未开**；禁止计入本切片 |

### 本臂写出/核验证据（`.tmp/ha-evidence/`）

| 文件 | 观察 |
|------|------|
| `nest-session.GAP.json` | `status: GAP` · `nestSessionOk: false` · `haStatus: NOT_HA` · `releaseEvidence: false` · `static.c3SharedOkPresent: true` · `static.placeholderDb/postgresOnlyPool/authNeedsPg/guardNeedsPg: true` · note 禁把 C3/`/livez` 当 session closed · `at: 2026-09-10T11:47:09.281Z`（≈04:47 PT） |
| `nest-session-A-probe.json` / `B` | `status: GAP` · livez 200 · readyz 503 degraded · `issuedToken: false` · `nestSessionOk: false` |
| `shared-state-A-write.json`（前序 C3） | `status: OK` · `sharedPath: shared_backend_hostpath` · note ≠ Nest business session · **仍 Not HA** |

→ **接受「C3b Nest session 诚实 GAP/工具轨可登记」**；**拒绝**「Nest session 已共享 / HA / 升阶」。

---

## 非宣称（硬禁）

- **不批** Nest 业务 session/auth sticky A→B **已证 / 已共享 / closed**  
- **不批** 生产 HA / HA green / 可用性已证 / multi-AZ / 生产 failover 已验  
- **不批** 阶 C/D prove 绿（C3 本地 shared ≠ C3b Nest session ≠ 阶 C 齐套；D 未开）  
- **不批** `releaseEvidence=true` / controlPlaneClosed  
- **不以** C3 `SHARED_OK` / `sharedOk=true` / dual `/livez` 200 / prove 默认 EXIT=0 / multi.proof EXIT=0 冒充 Nest session 已共享或 HA  

---

## Nest session 实际状态 · 假绿风险

| 维 | 本审结论 |
|----|----------|
| Nest session 实际状态 | **GAP / PREREQ**（`nestSessionOk=false`）。缺：真实 Nest-compatible PostgreSQL、`gateway_auth_*`/`user_account` 可达、共享 `AUTH_SECRET`、A 登录→B Bearer 校验 sticky prove |
| C3 vs C3b | C3 本地 Redis/MySQL marker **可 SHARED_OK**；C3b Nest session **仍 GAP**；二者可同盘共存，**不得合并叙事** |
| sole / Postgres | sole **无** Postgres；Nest createPool **仅** postgres(ql)；compose DB = placeholder → `/readyz` degraded、`/auth/login` 无法发 token |
| 假绿/升阶风险 | **可控**：receipt/文档反面钉齐全；`--require-session`/`--require-evidence` 恒拒。主要风险是外行把「prove EXIT=0」或「C3 SHARED_OK + dual livez」念成 Nest 已共享（见 O1）— 对外摘要必须带 `nestSessionOk=false` / `result=PREREQ_GAP` / `haStatus=NOT_HA` / `releaseEvidence=false` |

---

## 回传摘要（给父代理）

- **结论**：pass（仅 C3b 诚实 GAP/工具轨登记）  
- **批准范围**：`ha:prove:nest-session` + harness C3b + 收据 `nest-session.GAP.json` 登记；**不批** Nest session 已共享 / HA / 阶 C/D / `releaseEvidence=true`  
- **阻塞栏**：无产品阻塞；B1–B4 立场钉强制；O1/O2 nit 不降级  
- **CMD+EXIT**：default **0**（PREREQ_GAP · nestSessionOk=false）；`--require-session` **1**；`--probe` **0**（仍 GAP）；`--require-evidence` **1**（sharedOk=true · nestSessionOk=false）  
- **review 路径**：`ai-docs/delivery/reviews/2026-09-10-ha-nest-session-mw-e2e-ha.md`  
- **Nest session 实际状态**：GAP（未证）  
- **假绿风险**：可控；禁把 C3 SHARED_OK / EXIT=0 念成 Nest 已共享  
