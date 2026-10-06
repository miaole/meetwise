# Receipt — **C-PERF-TEARDOWN CONDITION residual · container-reachability honest evidence**（Line AE · R-A · CONDITION stays OPEN）

**Date**: 2026-10-06（Asia/Shanghai · pin C7）
**Line**: **AE** · implementer `mw-core`
**Knife**: harness `harness/c-perf-teardown-condition-residual.md` · slice `c-perf-teardown-condition-residual.slice.md`
**REQUEST**: `b4a2a01d225373283c60d773055d360f6a3fc15a`（docs-only pre_dual）
**PRE dual BOTH PASS**: mw-rag-route `9e2f001`（C1–C8）· mw-e2e-ha `f215438`（AD-AH PRE dual half）
**AUTHORIZE**: Line AE · PRE BOTH PASS · coding+prove（coordinator）
**Outcome**: **R-A**（容器可达 → 正式 ×3 复现台账）· **Ban close** · **Ban wash attempt1** · **Ban Branch B** · **Ban invent green** · **Ban self-nail**

---

## Pins（unchanged）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · PERF/LOAD stays **local partial** · capacityRepresentative=**false** · canHonestlyFlip=**false**

**C-PERF-TEARDOWN stays CONDITION OPEN**（backlog `gap-bug-backlog.md:35` · **zero SSOT edit** this receipt）· attempt1 @ `b29c191` **EXIT=1 retained** · **Not a close** · **Not coding** · **Not HA** · **Not capacity** · **POST_DUAL: awaiting**（stubs open · implementer 不自批 · Ban self-nail）

---

## 0. Three-segment history retained（零改写）

| 段 | SHA | 结果 | 读法 |
|----|-----|------|------|
| **原始条件** | attempt1 @ `b29c191` / `b29c191543dfbe7c1afa4278c550340a3339f295` | **EXIT=1** · mid-prove `Unhandled 'error' event` · `Connection terminated unexpectedly` @ `pg/lib/client.js` · run2 后 / run3+SUMMARY 前；attempt2 同 SHA EXIT=0 | 历史真实缺陷证据 · **not flake** · **Ban wash** |
| **Line S Branch A** | prove @ `e8c63a9` · receipt `920666a` · NAIL `54a7437` | **EXIT 0/0/0**（A/B/C · 零 unhandled · 均至 run3+SUMMARY）· POST dual `f4441dd` + `6a79946` | 未复现 ≠ 关闭；backlog `:35` **CONDITION OPEN 保留** |
| **Blocked ledger** | `44154aa` / `44154aa53a8c8508e8e8b1c51333c648187ac360` | 7 attempts：4× env 层 + 3× 正式 EXIT=1 `ECONNREFUSED 127.0.0.1:<port>` @ `assertIsolatedTestTarget` | **新签名 = 容器可达性**（Docker Desktop/macOS · `--network=host` = VM 栈）· **≠** attempt1 签名 · 超出 Branch B 预授权 |

**签名分界保留**: attempt1 = mid-prove pg Client crash · `44154aa` = API 启动期 ECONNREFUSED · **不同 class** · Ban 互「复现/关闭」。

---

## 1. Host-class matrix（C6 · 解释 ≠ 根因证实 ≠ attempt1 根因结论）

| 面 | 本机（Line AE · 2026-10-06） | `44154aa` 台账 class |
|----|------------------------------|----------------------|
| OS | **Linux** `6.12.94+` x86_64 · Debian 13（trixie）· hostname `grok-bot-vm-428703232` | macOS + Docker Desktop 29.1.3 |
| Docker | **Engine**（NOT Desktop）· Client/Server `26.1.5+dfsg1` · ServerOS=linux ServerArch=amd64 | Docker Desktop VM 网络栈 |
| `--network host` 语义 | 容器共享**宿主**网络命名空间 → `127.0.0.1:<published>` 可达（本机 C1 实证） | host = **VM** 网络栈 → 宿主 loopback 发布端口对 API 容器不可达 |
| `id` / groups | uid=1000(box) · docker 组已在 `/etc/group`（`docker:x:102:box`）· session 经 `scripts/with-docker-session.sh`（`sg docker`）激活 · Ban sudo/chmod/usermod/setfacl | （ledger 另记） |
| `docker info` 首行 | `Client:`（Engine · 无 Desktop 插件面） | Desktop |
| 矩阵读法 | 可解释 Line S 0/0/0（Linux 可达）与 `44154aa` 1/1/1（Desktop 不可达）**并存** | 矩阵 = **解释** · **≠** attempt1 根因证明 · **≠** 关闭理由 |

**Host class declaration**: **Linux-native-Docker-Engine**（≠ macOS Docker Desktop / ≠ `44154aa` class）→ R-A 路径合法；若误在 Desktop 上标 R-A 则违规（C6）。

---

## 2. C1 reachability pre-probe（必录 · 先于正式 attempt）

| 项 | 值 |
|----|-----|
| Start / End | `2026-10-06 13:10:08 +0800` → `13:10:19 +0800` |
| PG image | `pgvector/pgvector:pg16`（= `run-e2e-isolated` default）· publish `-p 127.0.0.1::5432` |
| Published port | `127.0.0.1:32834` |
| API probe image | **`node:20-bookworm`**（= capped-child default `UC018_PERF_NODE_IMAGE`）· **`--network host`** |
| Host TCP (`/dev/tcp` + node) | **OK** |
| Host SELECT 1 | **OK** `{"ok":1}` → **HOST_POSITIVE_CONTROL=PASS** |
| Container TCP | **OK** |
| Container SELECT 1 | **OK** `{"ok":1}` → **CONTAINER_REACHABLE=YES** |
| Probe log | `.tmp/lineAE-probe/c1-reachability-final.log`（gitignored） |
| Outcome | **R-A**（可达 → 跑正式 attempts）· Host-side fail 未发生（≠ R-B 误标） |

---

## 3. C2 predeclare N=3 + classification→EXIT（钉死于首个正式 attempt 之前）

Predeclare file: `.tmp/lineAE-formal/N3-class-table-predeclare.md` · **PREDECLARE_TS=`2026-10-06 13:11:15 +0800`**（早于 attempt1 `13:11:19`）

| Class | Signature | Closes CONDITION? |
|-------|-----------|-------------------|
| **(a)** attempt1 mid-prove crash | run≥1 后 `Connection terminated unexpectedly` / `Unhandled 'error' event` | **NO** |
| **(b)** startup ECONNREFUSED @ `assertIsolatedTestTarget` | run1 前 ECONNREFUSED | **NO** |
| **(c)** latency miss orthogonal | SUMMARY 达但阈值 miss · EXIT 1 | **NO** |
| **(d)** new class | 其他 | **NO** |
| EXIT 0 | 无 (a)(b)(c)(d) | **仍 NO**（3×EXIT0 ≠ 关闭） |

**Ban retry-to-green · Ban keep-only-green · Ban wash attempt1**

---

## 4. Formal attempts（R-A · N=3 · Asia/Shanghai）

**Prove base SHA（working tree at prove）**: `350f7a482bd85ccd05c41c62edfd98996f9a9506`（origin tip at fetch · docs tip 含 sibling Line AF；**本刀零触碰 AD/AF/AG/AH 文件**）
**Code-equivalence nearest code commit**: `cce33ba9359ee040cf7cffa661cbb2477a1ed694` · `git diff --stat cce33ba 350f7a4 -- packages/db/src/principal.ts apps/api/test/uc-e2e-018-perf-load.proof.ts scripts/uc018-perf-load-capped-child.mjs scripts/run-e2e-isolated.mjs packages/db/src/isolated-test-target.ts` → **空**
**Ancestors**: `b29c191` / `e8c63a9` / `44154aa` 均为 tip 祖先（`merge-base --is-ancestor` OK）
**CMD**: `pnpm uc018:perf-load:prove` → `run-e2e-isolated.mjs` → `uc018-perf-load-capped-child.mjs` · caps `--cpus=2 --memory=4g` · docker via `scripts/with-docker-session.sh` only
**Env**: `pnpm install --frozen-lockfile` FIRST · `@meetwise/ai-graphs` 已链接于 `apps/api/node_modules` · **无** env-layer 正式 attempt 污染（对照 `44154aa` 4× 陈旧 node_modules）
**C4**: 未设 `E2E_CLOUD_ISOLATED` · 证据层 = 本机 docker 真 PG · `PGHOST=127.0.0.1` loopback 分支

| Attempt | Shell EXIT | Class | Start (+08) | End (+08) | Unhandled | run3+SUMMARY | Isolated PG | Machine receipt (`.tmp/` · gitignored) |
|---------|------------|-------|-------------|-----------|-----------|--------------|-------------|----------------------------------------|
| **1** | **0** | none（非 a/b/c/d） | `2026-10-06T13:11:19+0800` | `2026-10-06T13:11:37+0800` | absent | yes · `SUMMARY allPass=true capsEnforced=true` | `meetwise-e2e-817650-1791263479931` @ `127.0.0.1:32835` | `.tmp/isolated-proof-receipts/2026-10-06T05-11-36-972Z-817650-6efbee9f-f71e-480f-b970-1cda466ba808.json` |
| **2** | **0** | none | `2026-10-06T13:11:42+0800` | `2026-10-06T13:12:00+0800` | absent | yes · 同 | `meetwise-e2e-820711-1791263503119` @ `127.0.0.1:32836` | `.tmp/isolated-proof-receipts/2026-10-06T05-12-00-465Z-820711-4598ab07-a698-48e4-aa76-56f33e88c6e9.json` |
| **3** | **0** | none | `2026-10-06T13:12:04+0800` | `2026-10-06T13:12:21+0800` | absent | yes · 同 | `meetwise-e2e-824027-1791263525539` @ `127.0.0.1:32837` | `.tmp/isolated-proof-receipts/2026-10-06T05-12-21-311Z-824027-bc675f08-ff7b-44bc-9e19-a8cb2d0998cb.json` |

### Per-attempt 摘要（latency 正交 · Ban 外推 SLA/capacity）

- **1**: PERF/LOAD run1–3 `passed=true`（PERF run3 p50=16.8 p95=50.0 p99=70.7；LOAD run3 p50=29.5 p95=96.5 p99=105.8）
- **2**: PERF/LOAD run1–3 `passed=true`（PERF run3 p50=18.5 p95=50.1 p99=69.7；LOAD run3 p50=34.9 p95=106.9 p99=111.8）
- **3**: PERF/LOAD run1–3 `passed=true`（PERF run3 p50=18.0 p95=46.2 p99=71.9；LOAD run3 p50=30.8 p95=105.3 p99=116.1）

非区分性噪声（三 attempt 均出现 · **非** attempt1 签名）：容器内 `fatal: not a git repository: …/worktrees/meetwise-lineAE`（gitdir 在 docker mount 外；proof 仍完成 SUMMARY）。

**分类结论**: 0×(a) · 0×(b) · 0×(c) · 0×(d) · **3× EXIT 0**。attempt1 式 mid-prove crash **未复现**。**3×EXIT0 不关闭 CONDITION**（C2 预声明）。

---

## 5. C3 / C5 / C8 compliance

| ID | 落实 |
|----|------|
| **C3** | **no mutation = design choice**（本 receipt 明文）：Ban Branch B → 零改 `uc018-perf-load-capped-child.mjs` / `run-e2e-isolated.mjs` / `isolated-test-target.ts` / 网络拓扑；负控 = C1 探针二分 only |
| **C5** | ledger 引 `:59` vs tip 实际：`:62` = `PGHOST !== '127.0.0.1'` loopback assert · `:70` = `export async function assertIsolatedTestTarget` · **并列登记** · **不改写** `44154aa` ledger |
| **C7** | 收据日期钉 **2026-10-06** · 单文件台账 · backlog `:35` / checklist / 矩阵 **零触碰** |
| **C8** | **Ban** 互引 Line AH flake ECONNREFUSED 为 repro/rootcause · **Ban** 互借 C-IMAGE-DIGEST |

---

## 6. Verdict（诚实边界）

- Outcome: **R-A** · host class **Linux-native-Docker-Engine** · C1 host+container PASS · formal **EXIT 0/0/0** · class none/none/none
- attempt1 @ `b29c191` **EXIT=1 retained** · **Ban wash**
- **C-PERF-TEARDOWN stays CONDITION OPEN** · PERF/LOAD **local partial** · capacityRepresentative=**false** · coveredCount=**8** · canHonestlyFlip=**false**
- **Not a close** · **Not fixed** · **Not HA** · **Not capacity** · **Not covered flip** · **Not Branch B** · **Not invent green**
- **POST_DUAL: awaiting**（stubs `REQUEST-2026-10-06-c-perf-teardown-condition-residual-post-mw-{e2e-ha,rag-route}.md`）· **NAIL: n/a**（Ban self-nail）· STOP

*Receipt · Line AE · C-PERF-TEARDOWN CONDITION residual · R-A · OPEN · 2026-10-06 · STOP*
