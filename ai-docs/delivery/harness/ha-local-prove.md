# Harness — **HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀**（本地多实例 + 故障注入 · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · **`haStatus=NOT_HA` 不变**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行（本 turn 零实跑零 live 零 Key 加载）· Ban假绿 · Ban 买云叙事 · Ban `haStatus`/`releaseEvidence` 翻转 · Ban 碰生产部署面 · Ban secrets · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **HALOC-1**（HA 阶 C **本地模拟** prove 全链绿 · 用户直裁「HA 那个可以本地模拟好的」）
**授权链（待走）**：HALOC-1 REQUEST（本 commit）→ pre-exec dual **mw-e2e-ha + mw-model-op BOTH PASS** → 协调方授权 EXEC（**含四枚授权变量显式开闸**，见 §3）→ 才允许在独立 worktree 按 §2 执行序实跑全套 prove。**本 commit 不预claim 任何 post-commit EXIT；双审 PASS 本身 ≠ EXEC 授权。**
**Knife 定位（现状引用）**：`north-star-ha.md:42` 实测——阶 C 骨架已落（`docker/compose.ha-dual.yml` 双实例拓扑 + `compose.ha-dual.shared.yml`（C3 shared · `ha:prove:shared` · 需 `MEETWISE_HA_SHARED_AUTHORIZED`）+ `compose.ha-dual.pg.yml`（C3b nest-pg · `ha:prove:nest-session -- --prove` · 需 `MEETWISE_HA_NEST_PG_AUTHORIZED`）+ `Dockerfile.ha-dual` + build 脚本），**但「阶 C prove 未绿」**——各路径只到「可跑/骨架」态，历史收据（2026-09-23 `ha-local-c3-c4` / `ha-local-c3b` / `ha-local-d1` 三刀）系旧 tip 分刀局部收据，**无单 tip 全链（C3+C3b+C4+probe 级）连续齐套收据**。本刀 = 把本地模拟全链一次跑绿、落**「HA 阶 C 本地证据包」**。
**Pins（十值照抄）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · `g7SuiteGreen=false` · `actualSpendCny=null`
**Base**: `origin/feat/mysql-schema-skeleton` **`9028eb70`** / full `9028eb706da9782e8e78242763a1a534d2462a9a`（2026-10-07 fetch 后实测 tip · docs `NAIL c-b-audit erratum post_prove_dual_pass`）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-halocal` · branch `line/ha-local-prove`
**配套**: slice `../ha-local-prove.slice.md` · 双审 stub `../reviews/REQUEST-2026-10-07-haloc1-ha-local-prove-mw-e2e-ha.md` + `../reviews/REQUEST-2026-10-07-haloc1-ha-local-prove-mw-model-op.md`
**Must cite（HA ladder SSOT）**: `harness/ha-track.multi-instance.md`（C1–C4/D 逐阶口径 + 授权变量 + fail-closed 负检）· `north-star-ha.md` 证据阶梯 · `scripts/ha/README.md`

---

## 0. 本 turn 纪律声明

本 REQUEST **docs-only 一次 commit**：零实跑、零 docker 操作、零 live 调用、零 Key 加载。§2 全部 CMD/EXIT 为**期望契约**（源码 + `ha-track.multi-instance.md` 既有口径 + 2026-09-23 历史收据实测形态），**不是已发生的结果**；一切实际 EXIT 由授权 EXEC 后另行落盘，本文档零预填。历史收据（`receipts/2026-09-23-ha-local-*`）零改写。

## 1. 目标

**本地多实例 + 故障注入 prove 全链绿拿收据**——四面一次齐套、单 tip 连续执行、逐 CMD 收据入**「HA 阶 C 本地证据包」**：

1. **C3 shared prove**：sole-stack Redis A 写 → B 读 + MySQL marker（`ha:prove:shared -- --prove` → `SHARED_OK`）
2. **C3b nest-pg prove**：Nest 业务 session A signup/login token → B `GET /profile`（`ha:prepare:nest-pg` + `ha:prove:nest-session -- --prove` → `NEST_SESSION_LOCAL_OK`）
3. **C4 本地 fault-inject**：compose kill api-a → B `/livez` 仍服务 + shared survivor（`ha:fault-inject -- --kill --with-shared-survivor` → `COMPOSE_FAULT_SHARED_PARTIAL`）
4. **ha:probe 级检查**：`ha:probe:multi`（默认 + `--with-shared`）收据面 `haStatus: NOT_HA` / `releaseEvidence: false` 原样；`--require-evidence` **恒 EXIT=1** = fail-closed 诚实钉（拒生产 HA）

**产物定义（写死）**：本刀产物 = **「HA 阶 C 本地证据包」**（`receipts/2026-10-07-haloc1-stage-c-local-prove/` · 逐 CMD 原文+EXIT+时间戳+实跑 SHA+收据 JSON 摘录 + `SUMMARY.md`）+ **矩阵 HA 行本地子面更新建议**（§6.3 · 建议文 ≥ 0；SSOT 行本身 nail 阶段才由协调方改）。

## 2. 逐路径命令 + 期望 EXIT（执行序 · 授权变量注入见 §3）

**拓扑互斥注意**：C3 shared 与 C3b nest-pg 共用 compose project `meetwise-ha-dual`（同 api-a/api-b 容器名、不同 overlay），**不可同时起**。执行序 = **Phase P（前置）→ Phase A（C3）→ Phase B（C4，依赖 A 的 dual+shared 拓扑）→ teardown → Phase C（C3b）→ Phase D（probe 级汇总）**。全链共用一个 evidence dir（默认 `.tmp/ha-evidence/`，可用 `MEETWISE_HA_PROBE_EVIDENCE_DIR` 重定向；**本地收据面**），committed 副本落 §6.2。

### Phase P — 前置（零授权）

| # | CMD | 期望 EXIT | 期望 result / 说明 |
|---|-----|-----------|--------------------|
| P1 | `pnpm install --frozen-lockfile` | **0** | EXEC 期独立 worktree（committed SHA 重钉后） |
| P2 | `pnpm ha-track:multi:prove` | **0** | 多实例轨静态：交付物 + 诚实钉；≠ HA |
| P3 | `pnpm ha-track:skeleton:prove` | **0** | 骨架不回归 |
| P4 | `docker compose -f docker/compose.ha-dual.yml config` | **0** | 真 compose 静校；≠ 已起；≠ HA |
| P5 | `pnpm ha:dual:build-image` | **0** | `IMAGE_BUILT`（本地镜像标签 `meetwise-backend:ha-dual-local`）；≠ 双实例已起 |
| P6 | `docker compose -f docker/compose.mysql-local.yml up -d mysql redis` | **0** | sole-stack 起 mysql+redis（网络 `meetwise-mysql-local_default`）；等 healthy 后进 Phase A |
| P7 | `.env*` ABSENT presence 记录（worktree 根三文件逐一探针） | n/a | name-only；见 §4 预算 |

### Phase A — C3 shared prove（需 DUAL+SHARED 授权）

| # | CMD | 期望 EXIT | 期望 result / 收据 |
|---|-----|-----------|--------------------|
| A1 | `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:dual:compose-shared` | **0** | `DUAL_COMPOSE_SHARED_UP`（双 Nest /livez + sole-stack 网络接入）；Not HA |
| A2 | `MEETWISE_HA_SHARED_AUTHORIZED=1 pnpm ha:prove:shared -- --prove` | **0** | **`SHARED_OK`** · `sharedOk=true` · `sharedPath=shared_backend_hostpath`（或 in-container，若 TCP 通）· 收据 `shared-state-A-write.json` + `shared-state-B-read.json`；haStatus NOT_HA · releaseEvidence false |
| A3 | `pnpm ha:probe:multi -- --with-shared` | **0** | 收据 `sharedOk=true` · `DUAL_SHARED_PARTIAL`；**仍 NOT_HA** |

### Phase B — C4 本地 fault-inject（需 FAULT 授权 · 依赖 Phase A 拓扑在场）

| # | CMD | 期望 EXIT | 期望 result / 收据 |
|---|-----|-----------|--------------------|
| B1 | `MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --kill --with-shared-survivor` | **0** | **`COMPOSE_FAULT_SHARED_PARTIAL`** · A down + B `/livez` 200 · survivor shared `SHARED_OK_SURVIVOR` · 收据 `kill-A.receipt.json` + `B-still-serving.receipt.json` + `fault-shared-survivor.receipt.json`；≠ 生产 failover |
| B2 | `MEETWISE_HA_FAULT_AUTHORIZED=1 pnpm ha:fault-inject -- --restore` | **0** | `RESTORED_A`（本地重启 api-a · 可选清洁步） |
| B3 | `pnpm ha:dual:compose-down` | **0** | 拆 C3/C4 拓扑（sole-stack 保留亦可全拆；Phase C 自带 PG sidecar） |

### Phase C — C3b nest-pg prove（需 DUAL+NEST_PG 授权 · teardown 后单独起）

| # | CMD | 期望 EXIT | 期望 result / 收据 |
|---|-----|-----------|--------------------|
| C1 | `MEETWISE_HA_NEST_PG_AUTHORIZED=1 pnpm ha:prepare:nest-pg` | **0** | **`NEST_PG_READY`**（PG sidecar 起 + migrate + runtime login provision） |
| C2 | `MEETWISE_HA_DUAL_AUTHORIZED=1 MEETWISE_HA_NEST_PG_AUTHORIZED=1 pnpm ha:dual:compose-pg` | **0** | 双 Nest + PG overlay（host-published PG 54339）；Not HA |
| C3 | `MEETWISE_HA_NEST_PG_AUTHORIZED=1 pnpm ha:prove:nest-session -- --prove` | **0** | **`NEST_SESSION_LOCAL_OK`** · `nestSessionOk=true`（A signup/login token → B `GET /profile`）· 收据 `nest-session.OK.json`（GAP marker 清除）；**本地 OK 仍 NOT_HA · releaseEvidence=false** |
| C4 | `pnpm ha:prove:nest-session -- --probe` | **0** | 可选 dual `/readyz`+`/auth` 收据面 |
| C5 | `pnpm ha:dual:compose-down` | **0** | 拆 C3b 拓扑收尾 |

### Phase D — ha:probe 级检查（汇总面 · 拓扑拆后仍可读磁盘收据）

| # | CMD | 期望 EXIT | 期望 result / 说明 |
|---|-----|-----------|--------------------|
| D1 | `pnpm ha:probe:multi` | **0** | 收据 `haStatus: NOT_HA` · `releaseEvidence: false` · `claimProductionHA: false`；读 Phase A–C 磁盘收据（shared/kill/nest-session） |
| D2 | `pnpm ha:probe:multi -- --with-shared` | **0** | `sharedOk=true` 收据面；**仍 NOT_HA** |
| D3 | `pnpm ha:probe:multi -- --require-evidence` | **1** | **fail-closed 诚实钉**：即便本地收据全在，仍拒生产 HA（缺生产拓扑/CI/独立审）→ **EXIT=1 是期望值 = 该 gate 工作正常**；**Ban 把 D3 红写成失败或绕过** |

### 负检（fail-closed 门演示 · 无授权 · 各面正检前跑 · 全部拒绝变更态）

| # | CMD | 期望 EXIT | 说明 |
|---|-----|-----------|------|
| N1 | `pnpm ha:prove:shared -- --require-shared`（无 `MEETWISE_HA_SHARED_AUTHORIZED`） | **1** | auth gate 拒 · `PREREQ_GAP`→require→1 |
| N2 | `pnpm ha:fault-inject -- --require-fault`（无 `MEETWISE_HA_FAULT_AUTHORIZED`） | **1** | 同上 |
| N3 | `pnpm ha:prove:nest-session -- --require-session`（**须在 C3 正检之前 / 干净 evidence dir**，无 `nest-session.OK.json` 时） | **1** | OK 收据落盘后同 CMD 会复用转 0——故负检必须先行，窗口如实记收据 |

**汇总契约**：正检 EXIT **A1–A3 / B1–B2 / C1–C5 全 0** + 负检 N1–N3 与 D3 **恰 1** = 本刀「本地全链绿」成立口径。任一不符 → EXIT 原值如实入收据 + GAP/FAIL 面如实登记（Ban 重跑冲销 · Ban只留绿 · Ban flake 记法），迭代刀重走 REQUEST。

## 3. 授权变量注入方式（进程 env · 协调方 EXEC 授权时显式开闸）

| 变量 | 开闸面 | 注入方式 |
|------|--------|----------|
| `MEETWISE_HA_DUAL_AUTHORIZED=1` | compose 真拉起（A1/C2） | **仅进程 env 前缀挂具体 CMD**；协调方在 EXEC 授权指令中显式开闸；未设 → 脚本拒真拉起（PREREQ_GAP） |
| `MEETWISE_HA_SHARED_AUTHORIZED=1` | C3 shared prove（A1/A2） | 同上；未设 → refuse mutating prove |
| `MEETWISE_HA_NEST_PG_AUTHORIZED=1` | C3b prepare+prove（C1–C3） | 同上；未设 → refuse PG bring-up |
| `MEETWISE_HA_FAULT_AUTHORIZED=1` | C4 kill/restore（B1/B2） | 同上；未设 → refuse compose kill |

硬规则：**只经进程 env · 逐 CMD 前缀注入 · 不写任何 `.env*` · 不入 git · 不入收据值位**（收据只记 name-only「set/unset」）；负检 CMD（N1–N3/D3）**不带**授权变量。授权链：pre-exec dual BOTH PASS → 协调方 EXEC 指令显式开闸（哪些面开、何时开，由协调方下达；agent 不自开）。compose 内 credentials 均 local-dev placeholder（与 `compose.mysql-local.yml` 同类，源码在案非 secret；**Ban 引为生产凭据叙事**）。

## 4. 预算（est 各 prove 实测口径）

| 面 | est live 模型调用 | est Key 加载 | est 外购 |
|----|------------------|--------------|----------|
| Phase P/A/B/C/D 全部 CMD | **0**（全本地 docker compose + 本地脚本 + 本地 HTTP `/livez`//profile；无 LLM/RAG/嵌入面） | **0**（本刀**全程不加载任何 Key**；Key 存在性 = name-only 探针） | **0** |

- **est 实测口径依据**：2026-09-23 三刀历史收据（`ha-local-c3-c4` / `ha-local-c3b` / `ha-local-d1`）实跑形态均为零 live 模型调用；脚本源码面无模型调用路径。
- **`actualSpendCny=null`**（沿 I 线 · Ban invented spend；est 0 ≠ spend 记录）。
- **Key name-only**：如需探针只记 `set/unset` 名，Ban 值/fingerprint 入树入据。
- **`.env*` ABSENT**：P7 逐相记录 worktree 根 `.env*` 三文件 presence（期望 ABSENT）；EXEC 全程禁读禁写。

## 5. Ban 清单（本 REQUEST turn · EXEC 期延续）

- **Ban 买云叙事**：本刀零云面；D3 prepurchase quote（`harness/ha-d3-prepurchase-quote.md` · `pre_exec_pass` · alone ≠ dual）是另轨，本刀**不推进不引用为已决**；Ban 云价/实例型/采购发明。
- **Ban `haStatus`/`releaseEvidence` 翻转**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` 全程原样；翻转归**生产多实例证据（买云后另刀）**，本刀零权限。
- **Ban 碰生产部署面**：`compose.prod`/生产拓扑零触碰；本地 compose（ha-dual/shared/pg）**禁合入生产**；CI workflow（`ha-probe-multi.yml`）零改零触发（D2b live artifact 维持 2026-09-23 已录 URL，不重跑不引用为阶 D）。
- **Ban secrets**：Ban 读/写 `.env*`；Ban Key 值/fingerprint 入树入据；Ban 把 compose local-dev placeholder 当生产凭据叙事。
- **Ban coding**：prove 脚本/产品码/spec/`package.json` 零改（全部路径已存在）；若 prove 红 = 环境/产品面如实登记，**Ban 就地改脚本追绿**（修复另刀 REQUEST）。
- **Ban假绿 / Ban retry-to-green / Ban flake 记法**：每 CMD 恰一次 attempt（失败诊断复跑须协调方另批独立记账）；EXIT 原值入收据；N1–N3/D3 的 EXIT=1 是**诚实钉**，Ban 绕过 Ban 改语义。
- **Ban SSOT/矩阵行翻转**：`north-star-ha.md` 阶 C 行、`e2e-requirement-coverage-matrix.md:15` HA 行、backlog/checklist 零触碰（nail 阶段才改）；历史收据零改写。
- **Ban self-approve**：pre-exec dual = mw-e2e-ha + mw-model-op 两方独立签署（alone ≠ dual · 不代签 peer）；本 REQUEST 即被审对象。

## 6. 诚实边界（写死 · 不因全链绿而松动）

1. **本地绿 ≠ 阶 C 绿 ≠ 生产 HA**：本地 compose 拓扑 ≠ 同 VPC 生产多实例拓扑；本地 fault-inject ≠ 生产 failover；`nestSessionOk=true`（本地）≠ 阶 C 绿。
2. **`haStatus=NOT_HA` 不变 · `releaseEvidence=false` 不变 · `claimProductionHA=false` 不变**：D3 `--require-evidence` 恒 EXIT=1 即该边界的机器化表达。
3. **`haStatus` 翻转归生产多实例证据（买云后另刀）**：本刀零权限、零预期、零叙事。
4. **本刀产物 = 「HA 阶 C 本地证据包」 + 矩阵 HA 行本地子面更新建议**——上限即此，无升格。
5. 全链绿收据**不**关闭 north-star 阶 C/D 行、**不**改 HA 矩阵行状态（`≠HA` 原样）、**不**构成 G7/covered/0 BUG 任何面证据。

### 6.2 收据与证据包落点（EXEC 期 · 本 REQUEST 零预填）

`ai-docs/delivery/receipts/2026-10-07-haloc1-stage-c-local-prove/`：逐 CMD 收据（CMD 原文 + EXIT 原值 + 起止时间戳 + 实跑 code SHA + worktree/branch + env 探针（授权变量 set/unset name-only + `.env*` ABSENT presence）+ 关键输出摘录）+ `.tmp/ha-evidence/` 收据 JSON 脱敏副本 + `SUMMARY.md`（EXIT 总表 + 「HA 阶 C 本地证据包」声明 + 诚实边界原样 + §6.3 建议 + evidenceOfRecord/SSOT 登记留 nail 阶段）。

### 6.3 矩阵 HA 行本地子面更新建议（nail 阶段由协调方裁量落字）

建议在 `e2e-requirement-coverage-matrix.md` HA 行（`:15`，现「**≠HA** / **非 HA**；云矩阵 `TC-CLOUD-*` 当前多为 `blocked`，不得当发布证据」）**追加本地子面**（不改既有语义）：「阶 C 本地模拟收据在案（C3 shared / C3b nest-session / C4 fault-inject / probe 级 · `receipts/2026-10-07-haloc1-stage-c-local-prove/`）——**仍 ≠HA · releaseEvidence=false · haStatus=NOT_HA**；生产多实例证据另刀」。**本刀不落此行**；建议文本入 SUMMARY 供协调方 nail 裁量。

## 7. Pins（十值照抄 · 原值未动）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false** |
| `actualSpendCny` | **null** |

**Retained**：阶 C/D prove **未绿**（本刀目标为**本地**全链绿，≠ 阶 C 绿）· `g7SuiteGreen=false`（trio OPEN 独立核算）· `r1Closed=false` · D3 生产 probe **OUT OF SCOPE** · 2026-09-23 历史收据 lifecycle 冻结零改写。

## 8. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not 阶 C 绿 · not 阶 D 绿 · not production HA / failover · not 同 VPC 多实例拓扑 · not `releaseEvidence=true` · not `haStatus` 翻转 · not cloud buy / 采购推进 · not covered（=8）· not suite green · not G7 · not 0 BUG · not SSOT/矩阵行翻转 · not CI 触发 · not nail · not live（本 turn）· not coordinator authorize（待 EXEC）· est 0 ≠ 已实测 · alone ≠ dual

## 9. 审查请求（pre-exec dual）

请 **mw-e2e-ha**（主 · prove 全链纪律/EXIT 契约/fail-closed 门/诚实边界）+ **mw-model-op**（次 · 零 live 预算/Key name-only/`.env*` ABSENT/Ban 买云叙事/零模型调用面）对抗审本 REQUEST；双 stub 已预写（`reviews/REQUEST-2026-10-07-haloc1-ha-local-prove-*.md`）；合入权在协调/用户；实现方**禁止自批**。预写仅 stub，PASS 由各域独立落字。

---

*Harness · HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs REQUEST only · 四面（C3 shared / C3b nest-pg / C4 fault-inject / ha:probe 级）+ 负检 fail-closed 钉 · 四授权变量进程 env 由协调方 EXEC 显式开闸 · 本地绿 ≠ 阶 C 绿 ≠ 生产 HA · `haStatus=NOT_HA` · `releaseEvidence=false` 不变 · 产物=本地证据包+矩阵建议 · est 0 live / `actualSpendCny=null` · Ban 买云叙事/翻转/生产面/secrets · STOP（awaiting pre-exec dual + 协调方 EXEC 授权）*
