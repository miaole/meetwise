# REQUEST — **C-PERF-TEARDOWN CONDITION residual · container-reachability honest evidence**（可达 → 复现/根因台账 · 不可达 → blocked 台账 · CONDITION stays OPEN）· pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/c-perf-teardown-condition-residual.md` · slice `c-perf-teardown-condition-residual.slice.md`
**Parent tip**: `416b6a5`（full `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8` · not a prove tip）
**Date**: 2026-10-06
**Line**: **AE**

## Pins（retained · 本 stub 不改）

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
| C-PERF-TEARDOWN（backlog `:35`） | **CONDITION OPEN**（retained · Ban close） |
| PERF/LOAD | **local partial** · capacityRepresentative=**false** |
| canHonestlyFlip | **false** |
| attempt1 @ `b29c191` | **EXIT=1 retained**（Ban wash） |

## 请审什么（mw-rag-route · 账目保全 / host-class 正交性 / 局部性 · Ban 互借）

Line AE · 承接 Line S NAIL `54a7437`（prove `e8c63a9` · EXIT 0/0/0 · CONDITION OPEN）+ blocked ledger `44154aa`（container-reachability · 3× EXIT=1 ECONNREFUSED）。请审：

1. **账目保全**：attempt1@`b29c191` EXIT=1 · Line S `e8c63a9` 0/0/0 · `44154aa` 7 attempts（4 env + 3 正式 EXIT=1）三段是否原样引用、零改写、零删减。
2. **host-class 矩阵**：Linux 原生 docker vs Docker Desktop VM 下 `--network=host` 语义差异（`capped-child :111/:141`）能否解释 Line S 0/0/0 与 `44154aa` 1/1/1 并存；矩阵 = 解释 ≠ 根因证实。
3. **正交性**：阈值 miss / latency EXIT 与 teardown 条件正交；Ban 把阈值 EXIT=0 外推为 SLA / capacity；PERF/LOAD stays local partial · capacityRepresentative=false。
4. **Ban 互借**：C-IMAGE-DIGEST（同族旧 harness）· GAP-PRIV-AUTHZ-PROVE-FLAKE（另一 ECONNREFUSED 族 · Line AH 只读）· GAP-PRINCIPAL-POOL-NO-ERROR-LISTENER（CLOSED-fixed · 同族不同 scope）。
5. **新开 harness 的理由**：旧 `gap-perf-teardown-rootcause-fix.md` 已封存 `post_prove_dual_pass`；新文件避免改写历史与混 C-IMAGE-DIGEST —— 是否成立。
6. **Ban close / Ban invent green / Ban Branch B invention** · UC-018 行不动 · coveredCount=8 · Ban SSOT flip。
7. **边界**：docs-only 本 turn；Dual PASS ≠ coding ≠ prove ≠ nail；Ban self-approve。

C-PERF-TEARDOWN stays **CONDITION OPEN**. attempt1 @ `b29c191` **EXIT=1 retained**. **Ban close** · **Ban wash attempt1** · **Ban Branch B invention** · **Ban invent green** · coveredCount=8.

本 stub 不授权 coding / prove / push / buy cloud；pre-exec dual PASS 后由协调方授权执行；implementer 不自批。

---

*Stub · awaiting expert pre-exec dual · STOP*

## mw-rag-route PRE-EXEC 审查（Line AE · docs gate only · 2026-10-06 13:05 +08:00）

**审查基线**：origin tip `2d422c14e585c544a162f536cc9b3058a7d14e30`（含 meetwise 所称 `b12e20d`）· REQUEST `b4a2a01d225373283c60d773055d360f6a3fc15a`（作者 meetwise-core）。本审 **零实跑 prove**、零产品/脚本改动；只追加本 stub。PASS ≠ coding ≠ prove ≠ close ≠ nail ≠ HA；alone ≠ dual；不代签 mw-e2e-ha。

### 1. Docs-only

`git show --stat b4a2a01d`：仅 4 个 docs 文件（harness 79 行 · slice 36 行 · 两个 dual stub 各 46 行），零 `apps/` `packages/` `scripts/` `package.json`。`git diff --stat 416b6a5 2d422c1 -- apps/api/src packages` 为空。REQUEST 之后无人改动 harness/slice/本 stub。

### 2. 账目保全（三段证据 · 零改写）

- `b29c191` · `e8c63a9` · `54a7437` · `920666a` · `f4441dd` · `6a79946` · `44154aa` 均为 tip 祖先（`git merge-base --is-ancestor` 全过）。
- `receipts/2026-10-05-c-perf-teardown-branch-a-blocked-ledger.md:5-9`：4 次 env 层失败（13:53/13:56/13:59/17:31 · 缺 `@meetwise/ai-graphs` 链接）+ 3 次正式 attempt EXIT=1 `ECONNREFUSED 127.0.0.1:{64244,64565,64603}` @ `assertIsolatedTestTarget` —— 与 harness:22「7 attempts = 4 env + 3 正式」一致。
- `gap-bug-backlog.md:35` 现文：`C-PERF-TEARDOWN | P1 | … disclosed, not washed, not closed · attempt1 EXIT 1 …`，状态 `disclosed OPEN` —— harness:8/:41/:59 均要求不翻行。
- 签名分界（harness:24-28）成立：attempt1 = mid-prove pg Client crash；`44154aa` = API 容器启动期 ECONNREFUSED；不同 class，Ban 互相「复现/关闭」。

### 3. 锚点核验 @ tip

| 引用 | 实况 | 判定 |
|------|------|------|
| `scripts/uc018-perf-load-capped-child.mjs:111` / `:141` `--network host` | `:111` `'--network', 'host',`（run 参数）· `:141` 同（create 参数） | 真 |
| `packages/db/src/isolated-test-target.ts` ledger 引 `:59` / harness 引 `:70` | `:55` `assertIsolatedTestEnvironment` · `:62` `PGHOST !== '127.0.0.1'` → `destructive_proof_loopback_target_required` · `:70` `export async function assertIsolatedTestTarget` | `:70` 真；`:59` 为 ledger 时点漂移，harness:27 已自披「执行时重核」—— 诚实 |
| `package.json:126-127` `uc018:perf-load:prove` | `node scripts/run-e2e-isolated.mjs uc018:perf-load:prove:raw` → `node scripts/uc018-perf-load-capped-child.mjs` | 真 |
| `scripts/with-docker-session.sh` | 存在 · 头注 Ban sudo/setfacl/chmod/usermod · exit 77 = 不可越 env-gap | 真 |

无发明锚点。

### 4. 逐项判定（委派清单）

- **残余 scope 是否明确、可证伪**：基本成立。R-A/R-B 二选一由「可达性预探针」决定（harness:51-52），签名四分类（harness:36）可证伪。不足：探针的「可达」判据与分类判据未写成机读规则 → 条件 C1/C2。
- **不提前关 CONDITION / backlog :35**：成立。harness:41「任何 EXIT=0 组合都不关 `:35`」· :55「本 REQUEST 零触碰 backlog :35」· :59 canHonestlyFlip=false · :73 Non-claims「not closed · not root-caused」。
- **prove 命令 + 预期 EXIT + 变异/负控**：命令具名（`pnpm uc018:perf-load:prove` · harness:36）；但 R-A 预期 EXIT 未按分类钉死、N 仍写「拟 3」→ C2。变异：本刀为台账刀且 Ban Branch B（harness:43 禁改 capped-child / run-e2e-isolated / isolated-test-target），**不允许**脚本变异；负控须由探针「宿主→端口 OK vs 容器→端口」二分承担 → C3。
- **证据层单一**：成立。唯一证据层 = 本机 docker 双容器（PG + API `--network host`）经 `run-e2e-isolated.mjs` 的真 PG；无「隔离壳三层 / 形态对齐 in-process」自相矛盾（grep 0 命中）。云私网分支 `isolated-test-target.ts:24-36` `assertCloudPrivateTestEnvironment` 不得启用 → C4。
- **不买云**：成立。harness:3/:37/:67 Ban buy cloud；修复方向（host-gateway / 同网桥 / `host.docker.internal`）只列不做（harness:37/:43）。
- **不越界**：成立。不碰 UC-018 行（harness:61）、Ban 互借 C-IMAGE-DIGEST / GAP-PRIV-AUTHZ-PROVE-FLAKE（harness:45/:68）、Ban 碰 AD/AF/AG/AH；新开 harness 理由（旧 `gap-perf-teardown-rootcause-fix.md` 已 `post_prove_dual_pass` 封存 · harness:14）成立。
- **host-class 正交性 / 阈值正交**：harness:36 要求 host-class 矩阵解释 Line S 0/0/0 与 `44154aa` 1/1/1 并存；harness:44 Ban 把阈值 EXIT=0 外推为 SLA/capacity。矩阵 = 解释 ≠ 根因证实 → C6。

### 5. 条件（PASS 附带 · 执行前/执行中必须满足）

1. **C1 探针判据机读化**：探针须用与 capped-child `:111/:141` **同镜像、同 `--network host`** 的 throwaway 容器，对**同一**发布 PG 端口先做宿主侧连通（正控），再做容器侧 TCP connect + `SELECT 1`。「可达」= 容器侧两者皆成功；任一 `ECONNREFUSED`/超时 = 不可达 → R-B。宿主侧正控失败 = 探针无效（env 层问题，单独入账），**不得**记为 R-B 证据。原文输出全录、Ban 打印 Key/`.env*`。
2. **C2 预声明 N 与分类→EXIT 对照**：首个正式 attempt 前把「拟 3」钉为固定 N=3 并写入收据；分类表预先写死：(a) attempt1 类 = run≥1 之后 `Connection terminated unexpectedly`/`Unhandled 'error' event`；(b) 启动期类 = run1 前 `ECONNREFUSED` @ `assertIsolatedTestTarget`；(c) 阈值 miss（正交）；(d) 新 class。每次 attempt 记 CMD+EXIT+起止（+08:00）+ code SHA；EXIT 0×N ≠ 关闭、(a) 类复现 ≠ 关闭；Ban retry-to-green、Ban 只留绿。
3. **C3 无变异是设计而非遗漏**：收据须明写「本刀 Ban Branch B → 不做脚本/产品变异；负控 = C1 探针二分」。任何「临时改网络拓扑看能否变绿」都属 Branch B invention，禁止。
4. **C4 证据层单一 + 禁云分支**：收据钉证据层 = 本机 docker 真 PG（loopback 分支 `isolated-test-target.ts:55-62` `PGHOST==='127.0.0.1'`）；Ban 设置 cloud 相关 env 走 `assertCloudPrivateTestEnvironment`（`:24-36`）。
5. **C5 锚点漂移原样登记**：收据并列记录 ledger 引用 `:59` 与 tip 实际 `:62`（loopback assert）/`:70`（`assertIsolatedTestTarget`）；**不**改写 `44154aa` ledger。
6. **C6 host-class 诚实**：执行机须先登记 host class。注：本审时点 desktop 为 macOS Docker Desktop（= `44154aa` 同 class，预期走 R-B）；box 为 Linux 但本审时 box shell 不可用、未核。Ban 在 Docker Desktop 上跑出任何结果后叙述为 R-A；host-class 矩阵 = 解释 ≠ 根因证实 ≠ attempt1 根因结论。
7. **C7 落点与 SSOT**：收据日期占位 `2026-10-0X` 执行时钉实；单文件台账；backlog `:35` / checklist / 矩阵零触碰；C-PERF-TEARDOWN stays CONDITION OPEN；attempt1 @ `b29c191` EXIT=1 永久保留。
8. **C8 Ban 互借**：同波 Line AH（`b12e20d` · GAP-PRIV-AUTHZ-PROVE-FLAKE）亦为 ECONNREFUSED 族；两刀证据不得互引为复现或根因。

### 6. 门禁说明

NORTH-STAR-EXECUTION-LOOP 前次 `git grep` 未见；本审以 `north-star-hard-gates.md` + 本 harness/slice 为门禁。

### Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `:35` CONDITION OPEN

**结论**：计划诚实、有界、锚点真实（`:59` 漂移已自披），不关 CONDITION、不买云、不越界。PASS（附条件 C1–C8）。PASS ≠ coding ≠ prove ≠ close ≠ nail；须 mw-e2e-ha 独立 PASS + 协调方 AUTHORIZE 后方可执行。

Verdict: PASS
