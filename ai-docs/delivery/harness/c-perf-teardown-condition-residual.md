# Harness — **C-PERF-TEARDOWN CONDITION residual · container-reachability honest evidence**（Line AE · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · CONDITION stays OPEN）

**Status**: **`post_prove:awaiting_post_prove_dual`**（R-A executed · receipt `receipts/2026-10-06-c-perf-teardown-condition-residual.md` · formal EXIT 0/0/0 · host class Linux-native-Docker-Engine · **CONDITION stays OPEN** · Ban close · Ban wash attempt1 @ `b29c191` · Ban invent green · Ban Branch B · Ban self-nail · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban self-approve · alone ≠ dual）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`416b6a5`** / full `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8`（wave start · sibling Line AD/AF/AG/AH REQUEST commits may land alongside · Ban touch siblings）
**Knife**: **C-PERF-TEARDOWN CONDITION residual**（Line AE）——在 Line S Branch A nail（CONDITION OPEN 保留）与 `44154aa` container-reachability blocked ledger 之后，开 **可复现证据 / 根因台账** 轨：容器可达 → 诚实复现与根因台账；不可达 → 诚实 blocked 台账。**不是** 关 CONDITION 刀 · **不是** Branch B 基建修复刀
**Gap id**: **`C-PERF-TEARDOWN`**（backlog `gap-bug-backlog.md:35` · P1 · **CONDITION OPEN** · 本刀不改名、不翻行）
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding · Ban self-nail

## 0. 为何新开文件（而非扩写旧 harness）

`harness/gap-perf-teardown-rootcause-fix.md`（Line S）已 **`post_prove_dual_pass`** 封存；`harness/gap-image-digest-perf-teardown-conditions.md` 混 C-IMAGE-DIGEST。为 **Ban 互借 C-IMAGE-DIGEST**、保全 Line S 历史，本刀新开 `harness/c-perf-teardown-condition-residual.md`，旧文件 **只读引用**。

## 1. 现状如实陈述（三段证据 · 零改写）

| 段 | SHA | 结果 | 读法 |
|----|-----|------|------|
| **原始条件** | attempt1 @ `b29c191` / `b29c191543dfbe7c1afa4278c550340a3339f295` | **EXIT=1** · mid-prove `Unhandled 'error' event` · `Connection terminated unexpectedly` @ `pg/lib/client.js` · run2 后 / run3+SUMMARY 前；attempt2 同 SHA EXIT=0 | 历史真实缺陷证据 · **not flake** · **Ban wash** |
| **Line S Branch A** | prove @ `e8c63a9` / `e8c63a913a1e9af285f692bcab16f7593294d144` · receipt `920666a` · NAIL `54a7437` / `54a7437f385fcdaa17b15c934c39f72d47bdfede` | **EXIT 0/0/0**（A/B/C · 零 unhandled · 均至 run3+SUMMARY · 无真实断连故无 `db_pool_error` 样本）· POST dual `f4441dd` + `6a79946` | 未复现 ≠ 关闭；backlog `:35` **CONDITION OPEN 保留** |
| **Blocked ledger** | `44154aa` / `44154aa53a8c8508e8e8b1c51333c648187ac360`（branch `line/s-perf-teardown-rootcause` @ `6b878da` · 协调方代跑） | **7 attempts 全记录**：4× env 层（陈旧 `node_modules` 缺 `@meetwise/ai-graphs` 链接）+ 3× 正式 attempt **EXIT=1** `ECONNREFUSED 127.0.0.1:<published-port>` @ `assertIsolatedTestTarget` | **新签名 = 容器可达性**（Docker Desktop/macOS 29.1.3 · `--network=host` = VM 网络栈 · 宿主 loopback 发布端口对 API 容器不可达）· **≠** attempt1 签名 · 超出预授权 Branch B |

**签名分界（必须保持）**:

- attempt1 签名 = **mid-prove pg Client unhandled crash**（prove 已跑到 run2）
- `44154aa` 签名 = **API 容器启动期 ECONNREFUSED**（prove 尚未开始 · `packages/db/src/isolated-test-target.ts` · ledger 引 `:59`，@ `416b6a5` 函数定义 `:70` · 执行时重核）
- 二者 **不同 class**；Ban 用 `44154aa` 的 EXIT=1 「复现」attempt1 · Ban 用 Line S 0/0/0 「关闭」attempt1

**拓扑事实（read-only @ `416b6a5`）**: `scripts/uc018-perf-load-capped-child.mjs` 双容器（PG + API）均 `'--network', 'host'`（`:111` / `:141`）；`--network=host` 语义在 Linux 原生 docker 与 Docker Desktop VM 不同 —— 这是 host-class 依赖，**不是**本刀修复对象。

## 2. 本刀目标（二选一 · 诚实 · CONDITION 不关）

| Outcome | 判据（授权执行后） | 仍须保留 |
|---------|--------------------|----------|
| **R-A · 容器可达 → 可复现证据 / 根因台账** | 在 **容器可达** 的 host class（先探针证明：API 容器 → PG 发布端口连通）上，`pnpm uc018:perf-load:prove` 一次性 attempts（拟 ×3 · 预先声明 · Ban retry-to-green）全记录；按签名分类：attempt1 式 mid-prove crash（复现/未复现）· `db_pool_error` 观测 · 阈值 miss（正交）· 新 class；并写 **host-class 矩阵**（Linux 原生 vs Docker Desktop）说明 Line S 0/0/0 与 `44154aa` 1/1/1 为何可同时为真 | CONDITION **OPEN** · attempt1 retained · PERF/LOAD local partial · capacityRepresentative=false |
| **R-B · 不可达 → 诚实 blocked 台账** | 本 host/class 在 **Ban buy cloud · Ban Meridian · Ban secrets · Ban 越权提权 · Ban 基建码改** 约束下无法获得 API→PG 可达；钉探针证据链（`docker version`/`uname`/拓扑 · 宿主→端口 OK vs 容器→端口 ECONNREFUSED）· 列可能修复方向 **仅作待裁决清单**（host-gateway / 同网桥 / `host.docker.internal`，须保 `PGHOST=127.0.0.1` fail-closed assert 语义）· **不实现** | 同上 · blocked ≠ 绿 · blocked ≠ 关闭理由 |

**明确非目标（Ban）**:

- **Ban close C-PERF-TEARDOWN**（任何 EXIT=0 组合都 **不** 关 `:35`；关闭须未来独立判据 + 双审 + 协调方授权）
- **Ban wash attempt1 @ `b29c191`**（EXIT=1 历史永久保留）
- **Ban Branch B invention**（本刀不改 `uc018-perf-load-capped-child.mjs` / `run-e2e-isolated.mjs` / `isolated-test-target.ts` · Ban 改网络拓扑 · 修复方向只列不做）
- **Ban invent green** · Ban 把 ECONNREFUSED 写成 flake · Ban 把阈值 EXIT=0 外推为 SLA/capacity
- Ban 互借 C-IMAGE-DIGEST · Ban 互借 GAP-PRIV-AUTHZ-PROVE-FLAKE 的 ECONNREFUSED（不同 gap · Line AH 只读引用）

## 3. 验证契约（仅协调方授权后 · 本 REQUEST 零实跑）

1. **Base**: 执行时 `git fetch` 钉 committed SHA；`b29c191` / `e8c63a9` / `44154aa` 均须为祖先（`git merge-base --is-ancestor`）。
2. **Worktree**: 独立 worktree（拟 `/workspace/meetwise-lineAE` · branch `line/ae-c-perf-teardown-residual`）；`pnpm install --frozen-lockfile`（**先**装依赖 · 吸取 `44154aa` 陈旧 `node_modules` 教训 · env 层失败单独入账，**不**计入正式 attempt 但 **不**删除）。
3. **可达性预探针（必录 · 先于正式 attempt）**: `uname -a` · `docker version`（Server OS/Arch · Desktop vs Engine）· `id`/groups · `docker info` 首行 · throwaway 容器 `--network=host` → 宿主发布端口连通性（成功/ECONNREFUSED 原文）· Ban 打印 Key / `.env*`。docker 组激活仅用 `scripts/with-docker-session.sh`（Line AC 先例 · Ban sudo/chmod/usermod/setfacl）。
4. **分支判定**: 预探针可达 → R-A；不可达 → R-B（**不**跑正式 attempt 冒充复现）。
5. **R-A attempts**: 预声明 N（拟 3）· 每次 fresh 隔离 PG · CMD+EXIT+起止（Asia/Shanghai）+ code SHA + machine receipt 路径 · Ban retry-to-green · Ban 只留绿。
6. **收据落点（拟）**: `ai-docs/delivery/receipts/2026-10-0X-c-perf-teardown-condition-residual.md`（单文件台账）。
7. **SSOT**: 本 REQUEST 零触碰 backlog `:35` / checklist / 矩阵。

## 4. 行语义 / 状态冻结

- backlog `:35` **C-PERF-TEARDOWN stays CONDITION OPEN** · canHonestlyFlip=false · PERF/LOAD stays **local partial** · capacityRepresentative=false · coveredCount=8
- Line S NAIL `54a7437` / receipt `920666a` / ledger `44154aa` **原样保留**
- UC-018 行不动 · Ban 碰 018 行状态（本刀只引用 `uc018:perf-load:prove` 作为 CONDITION 载体）

## 5. Ban 列表

- Ban coding · Ban prove 执行（须 PRE dual BOTH PASS + 协调方授权）· Ban push 冒充执行
- **Ban close C-PERF-TEARDOWN** · **Ban wash attempt1 @ `b29c191`** · **Ban Branch B invention** · **Ban invent green**
- Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban HA claim · Ban covered flip · Ban SSOT 擅自翻行
- Ban 互借 C-IMAGE-DIGEST / GAP-PRIV-AUTHZ-PROVE-FLAKE · Ban 碰 `packages/db/src/principal.ts`
- Ban self-approve（alone ≠ dual）· Ban self-nail · Ban 碰 Line AD/AF/AG/AH 文件 · Ban 代发 agent 消息

## 6. Non-claims

Not a pass · not run · not closed · not fixed · not root-caused（attempt1 根因仍以 Line S 读码判定为准 · 未被新证据证实或证伪）· not HA · not SLO/LOAD · not capacity · not covered · not `releaseEvidence=true` · not nail · not Branch B · CONDITION OPEN · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `:35` CONDITION OPEN · STOP

*Harness · C-PERF-TEARDOWN CONDITION residual · Line AE · 2026-10-06 · post_prove:awaiting_post_prove_dual · R-A · CONDITION OPEN · Ban close · Ban wash attempt1 · Ban Branch B · Ban invent green · Ban self-nail · STOP*
