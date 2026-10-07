# Harness — **GAP-PRIV-AUTHZ-PROVE-FLAKE · 根因调查刀**（Line FLK · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · backlog `:68` stays OPEN / mitigated-cause-unknown）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · this commit is not coding authorization, is not a prove, and is not a rerun）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **canHonestlyFlip=false**
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`50423a6f`** / full `50423a6fa6f18d4c9d193611cf84c4702e067208`（fetch 后与本 tip 逐字一致 · 本刀全部 git 写操作仅在独立 worktree `/Users/miaole/Desktop/golucky/meetwise-line-flk` · branch `line/flk-rootcause` · 禁 push）
**Knife**: **GAP-PRIV-AUTHZ-PROVE-FLAKE `:68` 根因调查刀**（Line FLK）——A'' 补齐证据链（teed `PROCESS_EXIT=0` 三角一致）但**根因未钉死**：冷启 `ECONNREFUSED` / warm SQLSTATE `23505` 两类并存未归一；「attempt-2 一次过」**未复现 ≠ 根因消失**。本刀为其求**根因调查设计与授权框架**（两类失败各自可复现实验设计 · 每实验假设+判读标准 pre-registered），**不是 prove 刀、不是 fix 刀、不是关闭刀**
**Gap id**: **`GAP-PRIV-AUTHZ-PROVE-FLAKE`**（backlog `gap-bug-backlog.md:68` · P2 · **OPEN** · **mitigated/cause-unknown** · 本刀不改该行）
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（双 PRE stubs PENDING · Ban self-approve · alone ≠ dual · 不代签 peer）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding · Ban prove
**Prior line receipts（只读引用）**: A'' nail `62b82cc` / `62b82cc02351c31d59055694344d943e3c634220`（仅 +`execution-master-checklist.md` +13 · +`gap-bug-backlog.md` +11 · gap 行原样 OPEN）· receipts `receipts/gap-priv-authz-prove-flake/`（attempt-1 不同意账 · teed attempt-2 `PROCESS_EXIT=0`）· Line X ledger `2026-10-05-rootcause-ledger.md`（L1–L6 · evidence tip `b3e0f41` · nail `40bed97`）· Line AH refresh `2026-10-06-ledger-refresh.md`（F1 9/9 锚 · F4 三族分界 · F5 未来 rerun 门闸）

## 0. REQUEST 范围声明（先读 · 本刀唯一交付物）

**范围 = 根因调查设计**。本 REQUEST 交付的只有：两类失败（cold `ECONNREFUSED` / warm `23505`）各自的**可复现实验设计**——每个实验 pre-registered 假设 + 方法 + 判读标准（含判读反例），外加只读的证据链定位与 S/SS/P 修复签名比对。**本 commit 不跑任何实验、不跑任何 prove、不改任何产品/基建/测试码。** 实验执行须待 PRE dual BOTH PASS 后由协调方另行授权（届时按 §5 执行契约落 receipt）。

- **Ban retry-to-green 式重跑**：任何 prove 执行（若实验含之）的 attempt 全部入账（含红），红账保留不洗；多跑取绿 = FAIL。
- **Ban 把「一次过」当根因结论**：attempt-2 EXIT=0、v2 20/20、`9b39a20` 绿行、SS 后 perf-load EXIT=0 —— 任何单次/多次绿都**不**构成「根因消失」「已修复」「可关闭」的证据；反之实验 0 复现也只入账为「当前树未复现」观察，**≠ 根因排除**。

## 1. 现状如实陈述（证据链全引 · 只读）

### 1.1 Attempt EXIT 账（引自 Line X ledger / AH refresh · 本刀零新跑）

来源：`receipts/uc052-pool-role-leak/privacy-authorization-flake-ledger.jsonl`（blob `272f0314e0eff8a9192c658a6a72584ae70146f4` · 29 行）+ `receipts/gap-priv-authz-prove-flake/`。

| 批次 | tip | n | EXIT=0 | EXIT=1 | class / 备注 |
|------|-----|---|--------|--------|--------------|
| 历史 first-run | `69de818` | 2 | 1 | **1** | cold `ECONNREFUSED 127.0.0.1:33010`（`logs/historical-first-failure-ECONNREFUSED-69de818.log` L16 · blob `db8ade3b…`） |
| cold v1 | `71ec253` | 5 | 4 | **1** | cold `ECONNREFUSED 127.0.0.1:33047`（`logs/cold-5.log` L18 · `state_bytes=29` · blob `d066fcd8…`） |
| warm v1 | `71ec253` | 2 | 1 | **1** | warm SQLSTATE **23505** `interview_pkey`（`logs/warm-2.log` L6/L13/L14 · `Key (id)=(00000000-0000-4000-8000-0000000000a1)` · pgPort 33048 **复用库** · blob `4ce66da1…`） |
| cold_v2 | `3d0c71e` | 10 | 10 | 0 | mitigation only（re-attest + Running check 上树后未复现） |
| warm_v2 | `3d0c71e` | 10 | 10 | 0 | mitigation only · **新容器非复用库**（review `49ef158` §5）→ 23505 类**未被重新覆盖** |
| prove_tip_authz | `9b39a20` | 1 | 1 | 0 | 绿行 · **NOT branch ancestor**（patch-id 等价 `ab96a02`）· note「Ban claim flake fixed」 |
| oneshot attempt-1 | `5b6e693` | 1 | JSON 0 / **log 无退出码** | — | **不同意**（L1 保留 · FAIL `3811cf1`） |
| teed attempt-2 | `6673042`（可达等价 `606677d`） | 1 | 1（`PROCESS_EXIT=0` L74 三角一致） | 0 | 51 PASS · 容器 `meetwise-e2e-41747-1791029257903` @ `127.0.0.1:51568` · receipt `2026-10-03-teed-oneshot-attempt-2-receipt.md` 自述「未复现 attempt-1 时代的 ECONNREFUSED/23505（这不构成根因结论，cause 仍 unknown）」 |

合计已记录 **EXIT=1 ×3**（cold ×2 · warm ×1）· **两类并存未归一** · cause **unknown** · backlog `:68` **OPEN**。

### 1.2 树内现状（`pnpm privacy-authorization:prove` 执行链 · 只读定位成因点）

链路：`package.json:304-305`（`privacy-authorization:prove` → `run-e2e-isolated.mjs privacy-authorization:prove:raw` → `pnpm -C packages/db prove:privacy-authorization`）。

- **容器 boot**：`scripts/run-e2e-isolated.mjs:2295-2303` `docker run --rm -d --name meetwise-e2e-<pid>-<ts> -p 127.0.0.1::5432 pgvector/pgvector:pg16`（动态发布端口）；`:2305-2307` `docker port` 解析。
- **就绪轮询** `waitForPostgres`（`:2146-2173`）：容器内 `psql SELECT 1` + **宿主侧 TCP 真连**（`probeHostSql` · pg Client · `connectionTimeoutMillis=2000`）· **连续 3 次成功**才判 ready · 90 attempt · 1s 退避。注释自引本 gap（`:2152-2156`：historical @`69de818` migrate EXIT=0 后 prove `connect ECONNREFUSED`）。
- **mitigation（`3d0c71e` 上树）**：`migrateWithRecovery`（`:2175-2188`，2 attempt + 失败重探）· post-migrate re-attest（`:2319`）· **pre-prove 容器 `docker inspect .State.Running` 检查（`:2326-2328`）+ pre-prove 再轮询（`:2330`）**。
- **残余窗口（观察 · 非结论）**：pre-prove 三连探针通过 → prove 进程实际建连之间仍是 **check-then-use（TOCTOU）间隙**；`docker port` 返回 → userland 代理实际可连之间亦是历史未测窗口。
- **warm 类 fixture 面**：`packages/db/test/privacy-authorization.proof.ts:57-62` `insertInterview` = **裸 `INSERT INTO interview(id,…)`**（无 `ON CONFLICT`、无预检、跑后**无 cleanup**）；`:125-126` 固定 id `…0000000000a1` / `…a2`。fresh 隔离库 interview 表为空 → 插入成功；**复用库含残留行 → 23505 `interview_pkey`（与 warm-2.log 三点吻合：错误消息 / `code:'23505'` / 键值 `…a1`）**。此为静态成因点定位，**是否即唯一触发条件由 §3 E-WARM 实验判定，本刀不作根因宣告**。

## 2. S / SS / P 已修缺陷签名比对（只读 · Ban 互借关闭 · Ban 互借根因）

依 Line AH F4 三族分界（本刀全盘沿用，仅补 SS 后增量）：

| 族 | 发生点 | 修复 | 与本 gap 冷/暖类的关系 |
|----|--------|------|------------------------|
| **(a) 本 gap cold** | **宿主侧** prove 前/中连隔离 PG **发布端口**被拒 | 无 fix；仅 `3d0c71e` mitigation（轮询加严 + Running check） | 本账冷失败 class（EXIT=1 ×2） |
| **(b) C-PERF-TEARDOWN / SS** | **API 容器内**（`--network=host` = Docker Desktop VM 网络栈）连宿主 loopback 发布端口 @ `assertIsolatedTestTarget`（S 台账 7×EXIT=1 · 根因已由 S 读码+容器实证钉为容器可达性） | Line SS `f59c4d20`：bridge + `host.docker.internal:host-gateway` + 两字面量 assert 白名单；**PGHOST 注入仅 capped-child，宿主 baseEnv 恒 `127.0.0.1`，`run-e2e-isolated.mjs` 零 diff**（SS receipt §6 C-3/C-5） | **不同发生点**（容器→宿主 vs 宿主→发布端口）· Ban 互借关闭/根因 |
| **(c) Line P 池 error 监听** | 运行中断连的**呈现方式**：无监听 → uncaught crash（UC-004 FI-1 实证） | Line P `56fc1ea1`（candidate B）：池级 + per-client 观测 → 结构化 `db_pool_error`，**只防 uncaught crash，不阻止断连本身** | 本 gap 两份冷 log 均为**显式捕获打印**的 `Error: connect ECONNREFUSED`（连接期拒绝，非 uncaught 崩溃帧）→ P 修复**不改变本 gap 证据形态** · Ban 借 P 关本行 |
| F4(c) docker.sock（Line U/AC） | permission denied（非 ECONNREFUSED） | Line AC Path A（`with-docker-session.sh`） | 不同失败 class · N2 限定语照抄：env-gap cleared **only for this host/session class** |

**SS 后 perf-load 多次 EXIT=0 无 ECONNREFUSED 的诚实比对（本刀必答问题：「冷启类或已被 SS 间接修复？」）**：

- 已核实事实：SS 修复后 `pnpm uc018:perf-load:prove` attempts 2/3/4 EXIT=0 零 `ECONNREFUSED`（`receipts/2026-10-07-gap-perf-container-reachability-fix-prove.md` §2/§4）+ 树内 6 组 run 回执（`ce31d7f2`）EXIT=0；其 prove 面为 **capped-child 容器 → `host.docker.internal` → 宿主 loopback 发布端口**，且宿主侧 `baseEnv.PGHOST` 路径零改动。
- 诚实结论（只允许写到这里）：该绿**走的是另一条路径**，对本 gap「宿主 → 发布端口」冷类**既不构成复现也不构成排除**——「冷启类已被 SS 间接修复」**证据不足，既不能肯定也不能否定**；同时须如实登记：`3d0c71e` mitigation 上树后本 gap 冷类**零新记录复现**（attempt-2 绿 + Line X 后新 attempt=0，AH F3）。**判定权归 §3 E-COLD 实验**：若 E-COLD 在当前树复现冷类 → 未被间接修复（实证）；若全部实验判读为「未复现」→ 入账为「当前树未复现」观察，**仍 ≠ 已修复 ≠ 关闭依据**。

## 3. 根因调查实验设计（pre-registered · 每实验 = 假设 + 方法 + 判读标准 + 判读反例）

约定：所有实验用**树内现状码零改动**（Ban 修产品/Ban 修 fixture 迁就实验）；受控注入全部走外部手段（docker 操作 / 预插行）；一次性容器惯例（`--rm -d` · 动态发布端口 · 零共享卷 · 用后即毁）不变；实验日志脱敏沿用 WITHHELD 惯例（Ban 连接串/密码原文入 receipt）。E-WARM-1 含真实 prove 目标执行 → 其 attempt 全部入账（含红）；其余实验不触碰 prove 目标。

### 3.1 冷类（host → published port `ECONNREFUSED`）

- **E-COLD-1 · 发布窗口竞态探针**
  - 假设 **H-COLD-1**：`docker port` 返回映射后、Docker Desktop 代理实际开始接受连接前存在窗口；窗口内宿主连接 → `ECONNREFUSED`，随后同端口自愈。
  - 方法：启动一次性 PG 容器（与 prove 惯例参数一致），`docker port` 返回后以 ≤100ms 间隔对发布端口做「TCP connect + `SELECT 1`」探针 ×100，记录首个成功时延分布与 `ECONNREFUSED` 计数；≥5 个 fresh 容器实例重复（N 总计 ≥500 探针）。同步登记 Docker Desktop 版本。
  - 判读（成立）：任一实例探针观测 `ECONNREFUSED` 且随后同端口**无人工干预自愈** → 窗口存在，冷类受控复现 ≥1 次 → H-COLD-1 成立（证据含时延分布 + 复现率）。
  - 判读反例：0/500 全绿 → 「本机该 Docker 版本 boot 窗口未复现」入账，H-COLD-1 **未证**（不写「排除」，其余时点由 E-COLD-2 覆盖）。
- **E-COLD-2 · check-then-use 间隙容器退场注入**
  - 假设 **H-COLD-2**：pre-prove re-attest 通过后、prove 建连前的间隙内容器退场（stop/crash/清理）→ prove 侧 `connect ECONNREFUSED 127.0.0.1:<port>`；退场时点不同可解释 `state_bytes` 差异（29 vs 226 为**未解释观测**，按字节带分桶登记）。
  - 方法：完整复现冷启序列（boot→ready→migrate→re-attest→pre-probe）后，在 prove spawn 前注入 `docker stop <container>`（对照注入 `docker kill` 与「无注入」×3）。记录 prove 侧错误逐字形态 + `ISOLATED_POSTGRES_OUTPUT_WITHHELD` 的 state/logs 字节带。
  - 判读（成立）：注入 run stderr 逐字出现 `Error: connect ECONNREFUSED 127.0.0.1:<port>` + `code: 'ECONNREFUSED'`（与 cold-5.log L18/L24 同形）且 WITHHELD 字节带与历史观测可比 → 建立注入矩阵「退场时点 × 错误形态 × state_bytes」→ 冷类**机理级**受控复现。
  - 判读反例：注入后形态 ≠ `ECONNREFUSED`（其他错误码/挂死）→ H-COLD-2 不能完全解释历史冷失败，差异如实入账。
- **E-COLD-3 · 资源压力放大（次要）**
  - 假设 **H-COLD-3**：宿主高负载（并行 docker 操作 / CPU 压力）放大 E-COLD-1 窗口或致代理停摆。
  - 方法：E-COLD-1 探针在受控并行负载下重复（如同起 4 个一次性 PG 容器）。
  - 判读：与 E-COLD-1 基线比较 `ECONNREFUSED` 率；只作**放大器**证据，不单独作根因。
- **冷类判定权**：E-COLD-1/2 任一在当前树复现 → 冷类**未被** SS/增量间接修复（实证）；全部判「未复现」→ 入账「当前树未复现」观察（≥N 次实例数如实写），**Ban 升格为「已修复」**。

### 3.2 暖类（SQLSTATE 23505 `interview_pkey`）

- **E-WARM-1 · 同库连跑双跑（确定性复现）**
  - 假设 **H-WARM-1**：fixture 固定 id + 裸 INSERT + 无 cleanup → 同一隔离库第二次 proof 必 23505 `interview_pkey`。
  - 方法：一次 boot 的隔离 PG（migrate 后）**连续跑两遍** raw 目标 `pnpm -C packages/db prove:privacy-authorization`（同一容器不 teardown），每遍独立 teed log + `PROCESS_EXIT` 行（teed 惯例 · `set -o pipefail`）。
  - 判读（成立）：第一遍 EXIT=0（fresh 路径不触发）；第二遍 stderr 三点全等——`duplicate key value violates unique constraint "interview_pkey"` + `code: '23505'` + `Key (id)=(00000000-0000-4000-8000-0000000000a1) already exists`（与 warm-2.log L6/L13/L14 逐字同形）→ 暖类**确定性**复现。
  - 诚实条款：第二遍的**红是设计内预期**（受控复现），入账时标注 `class=warm-23505 (designed-red)`，**不得记为回归、不得 retry 洗绿**。
- **E-WARM-2 · 预置行单跑（变因隔离）**
  - 假设 **H-WARM-2**：触发条件 = 库内已存在同 id 行，与「同进程多轮累积」无关（首跑即触发）。
  - 方法：fresh 容器 migrate 后，先以与 fixture 相同 SQL **预插** `…a1` 行（仅数据面注入，零产品码改动），再跑一遍 proof。
  - 判读（成立）：首跑即 23505 三点全等 → 触发条件钉为「库内残留行」；与 E-WARM-1 第一遍互证 fresh 单跑不触发。
- **E-WARM-3 · 现状边界（零执行 · static only）**
  - 方法：只读登记 §1.2 fixture 面事实（`:57-62` 裸 INSERT 无 `ON CONFLICT` 无 cleanup · `:125-126` 固定 id）+ warm_v2 新容器 ≠ 复用库（review `49ef158` §5）→ v2 20/20 对暖类**零覆盖力**。
  - 判读：产出静态陈述「当前树暖类触发面 = 复用库 / 库内残留行」，供双审独立复核。

### 3.3 两类归一问题（不预设答案）

历史两类（连接期拒绝 vs 约束冲突）**机理上不同源**；本刀不预设「单一根因」。若实验双双成立，结论形态为「冷类根因 = X（时点/机理），暖类根因 = Y（fixture 残留面）」两类分立钉死；Ban 为叙事统一而强行归一。若实验判「未复现」，两类各自保持 **cause-unknown**，`:68` 不动。

## 4. 执行契约（授权后 · 本 REQUEST 只立约不执行）

1. **授权链**：本 REQUEST PRE dual BOTH PASS（mw-privacy-int + mw-e2e-ha）→ 协调方显式授权实验包；E-WARM-1（含 prove 目标执行）在授权书中**单列**。
2. **attempt 纪律**：全部尝试（含探针实例、注入 run、proof 双跑）**全台账入账**：EXIT、UTC 时戳、容器名/端口、machine receipt 哈希、失败类；含 prove 目标的执行 teed `PROCESS_EXIT` 行三角一致（log/JSON/receipt）。**Ban 弃单 · Ban retry-to-green · Ban 洗账 · Ban forge PROCESS_EXIT。**
3. **receipt 落点**：`ai-docs/delivery/receipts/gap-priv-authz-prove-flake/rootcause/`（实验 receipt + 判读表逐实验落盘；`.tmp` gitignored 机器回执哈希入 receipt）。
4. **红账语义**：设计内红（E-WARM-1 第二遍）标 `designed-red`；非预期红如实入账不改语义；任何红都不触发同实验自动重跑（重跑仅在双审同意的修订实验设计下以**新 attempt 段**进行）。
5. **产物升级路径**：实验完成 → 根因报告（每类：成立假设/证据/复现率 或 未复现观察）→ **双审同意钉死** → 协调方 **nail** 阶段方可升级 `:68` 状态（如 `mitigated-cause-unknown` → `cause-pinned`）。

## 5. 诚实条款（binding）

- **`:68` 状态变化只走 nail 阶段**：根因**钉死且双审同意** → 经协调方 nail 方可升级；**Ban 直接关行、Ban flip OPEN、Ban 把本 REQUEST/实验 receipt 当关闭依据。**
- **绿 ≠ 关**：实验/复跑任何 EXIT=0 不关 gap（attempt-2 先例已钉此语义）。
- **一次过 ≠ 根因结论**：单向与双向都禁——「绿了」不能说根因消失，「未复现」不能说根因排除，只能写「当前树/当前方法未复现 + 样本量」。
- **Pins 冻结**：本刀及实验执行全程，下表 Pin 原值不得变动；`canHonestlyFlip=false`。

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8**（构成 = `RAG-FUNNEL-02A..08` only · 不含 UC-052 · 不含本 flake） |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| UC-052 | **partial**（stays） |
| canHonestlyFlip | **false** |
| backlog `:68` | **OPEN** · mitigated/cause-unknown |

## 6. Ban 清单

Ban coding（`apps/` `packages/` `scripts/` `package.json` migrations `.env*` 零触碰 · Ban `principal.ts` / `checkpoint-principal.ts`）· Ban prove 执行（授权前）· Ban retry-to-green · Ban 把一次过/未复现当根因或修复结论 · Ban 关 `:68` / 翻任何 SSOT 行 · Ban 互借 C-PERF-TEARDOWN（`:35`）/ GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER / Line U docker.sock 的关闭或根因 · Ban 从 perf-load 绿外推本 gap · Ban 修产品/fixture 迁就实验 · Ban forge `PROCESS_EXIT` · Ban 洗红账/弃单 · Ban Meridian · Ban buy cloud（local-only）· Ban secrets / `.env*` · Ban force-push · Ban push · Ban self-approve / self-nail / 代签。

## 7. 双审（stubs PENDING · alone ≠ dual）

| Expert | Stub | 视角焦点 |
|--------|------|----------|
| `mw-privacy-int` | `reviews/REQUEST-2026-10-07-gap-flake-rootcause-mw-privacy-int.md` | 授权根/隐私 prove 执行链语义 · 暖类 fixture 面与实验越权边界 · 脱敏 · designed-red 记账 |
| `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-gap-flake-rootcause-mw-e2e-ha.md` | 容器/Docker 层实验有效性 · 注入等价性 · 判读标准可机检性 · S/SS/P 比对诚实性 · attempt 纪律 |

**Dual PASS ≠ 实验执行 ≠ nail ≠ 关闭**；执行授权由协调方另行显式给出。

## 8. 与既有门闸的关系

- Line AH **F5**（未来 teed first-run 前置：`with-docker-session.sh` 先例 · cold/warm 分列预声明 attempt 数 · **warm 须真复用库路径** · teed `PROCESS_EXIT` 三角 · N4 关闭门槛语言）对本刀实验**继续适用**（含 prove 目标的执行按 F5 门闸走）；本 REQUEST 为其**补充**「根因调查实验」层，**不替代、不放宽** F5。
- 关闭门槛维持 AH F5/4 原文：deliberate red + cause-fix + **N≥5 consecutive first-runs no retry**（cite `REQUEST-2026-09-23-uc-e2e-052-pool-role-leak-mw-privacy-int.md:109` C3 / `:83` §3C）——本刀不触碰该门槛。
- Line X L6 / AH F5「重跑须新 REQUEST」：**本刀即该新 REQUEST**（范围限定为根因调查设计）；Ban 盲目重跑（无假设无判读的 retry）不在任何授权范围内。

---

*Harness REQUEST · GAP-PRIV-AUTHZ-PROVE-FLAKE rootcause investigation · Line FLK · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · base 50423a6f · zero prove · zero coding · backlog :68 stays OPEN mitigated/cause-unknown · canHonestlyFlip=false · STOP*
