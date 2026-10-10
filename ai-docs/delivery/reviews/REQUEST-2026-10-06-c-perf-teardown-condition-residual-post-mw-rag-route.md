# REQUEST — **C-PERF-TEARDOWN CONDITION residual** · post-prove · mw-rag-route（stub · `draft:awaiting_post_prove`）

**Status**: **PENDING** / `draft:awaiting_post_prove`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer · Ban self-nail）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false
**Expert**: `mw-rag-route`
**Knife**: `harness/c-perf-teardown-condition-residual.md` · slice `c-perf-teardown-condition-residual.slice.md`
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-c-perf-teardown-condition-residual.md`
**REQUEST pre**: `b4a2a01` · PRE: mw-rag-route `9e2f001`（C1–C8）· mw-e2e-ha `f215438`
**Prove base SHA**: `350f7a482bd85ccd05c41c62edfd98996f9a9506` · code-eq `cce33ba9359ee040cf7cffa661cbb2477a1ed694`
**Date**: 2026-10-06
**Line**: **AE**
**Outcome claimed by implementer**: **R-A** · host class Linux-native-Docker-Engine · formal EXIT **0/0/0** · **CONDITION stays OPEN**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| C-PERF-TEARDOWN（backlog `:35`） | **CONDITION OPEN**（Ban close） |
| attempt1 @ `b29c191` | **EXIT=1 retained**（Ban wash） |
| PERF/LOAD | **local partial** · capacityRepresentative=**false** |
| coveredCount | **8** |

## 请审什么（mw-rag-route · post-prove · 账目 / host-class / 局部性 / Ban 互借）

1. **三段账目保全**: attempt1@`b29c191` EXIT1 · Line S `e8c63a9` 0/0/0 · `44154aa` blocked · 本机 R-A EXIT 0/0/0 —— 是否零改写、零互洗。
2. **host-class 矩阵**: Linux Engine vs Desktop 解释 Line S 与 `44154aa` 并存；矩阵 ≠ attempt1 根因结论。
3. **正交性**: 本机 latency EXIT0 与 teardown CONDITION 正交；Ban 外推 SLA/capacity；PERF/LOAD stays local partial。
4. **C1–C8 落地**: 探针机读化 · N=3 预声明 · no-mutation 设计选择 · 禁云 · `:59` vs `:62/:70` 漂移诚实登记 · 收据日期钉实 · Ban 互借 AH/C-IMAGE-DIGEST。
5. **Ban Branch B / Ban invent green / Ban close** · UC-018 行不动 · SSOT `:35` 零触碰。
6. **边界**: PASS ≠ close ≠ nail ≠ HA · alone ≠ dual · Ban self-nail · Ban 碰 AD/AF/AG/AH · Ban buy cloud · Ban Meridian · Ban secrets。

C-PERF-TEARDOWN stays **CONDITION OPEN**. attempt1 @ `b29c191` **EXIT=1 retained**.

---

*Stub · awaiting expert post-prove dual · STOP*

## mw-rag-route POST-PROVE 审查（Line AE · 2026-10-06 13:45 +08:00）

**基线**：PROVE_TIP `56dac68ae4ab52babd0282e1fa5ba9ce917c4024`（meetwise-core）为 origin 祖先；REQUEST `b4a2a01` · PRE dual mw-e2e-ha `f215438` + mw-rag-route `9e2f001`（C1–C8）。审查 tip `2fadf2b2`。本审只追加本 stub；不代签 mw-e2e-ha（其 POST `76013c8` 独立）。PASS ≠ close ≠ nail ≠ HA；alone ≠ dual。

### 1. 改动面（Ban Branch B）

- `git show --stat 56dac68a`：5 个 docs 文件 —— receipt `receipts/2026-10-06-c-perf-teardown-condition-residual.md`（+127）· harness / slice 各 ±2（仅 Status 行与页脚：`draft:awaiting_pre_exec_dual` → `post_prove:awaiting_post_prove_dual` · 「CONDITION stays OPEN」）· 两个 POST stub。
- `git diff --stat 9e2f0011 56dac68a -- apps packages scripts package.json` = **空** → 本刀零产品/脚本改动。
- `54a7437..56dac68a` 中 `scripts/run-e2e-isolated.mjs` 的 +60/−2 来自其他 Line（`48c4a8a` W · `40a4f6c` V · `6e96cf5` AB · `bf1fdb2` Z · `3d113c8` V），且早于 REQUEST `b4a2a01`；`uc018-perf-load-capped-child.mjs` / `isolated-test-target.ts` / `principal.ts` 零改动 → **无 Branch B**。
- 云分支：receipt `:88`「未设 `E2E_CLOUD_ISOLATED` · `PGHOST=127.0.0.1` loopback 分支」；predeclare `## C4` 同文 → `isolated-test-target.ts:24-36` 未启用。

### 2. Host-class 裁定（C6 · 关键）

| 证据 | 本刀执行机（box 实物核验） | `44154aa` class | 本审对照机（desktop） |
|------|---------------------------|-----------------|----------------------|
| uname / OS | probe log `HOST_UNAME=Linux grok-bot-vm-428703232 6.12.94+ … x86_64`；本审直接读 box `/etc/hostname` = `grok-bot-vm-428703232`、`/etc/os-release` = Debian 13.7 trixie | macOS | `Darwin miaole.local 27.0.0 … arm64` |
| docker | `ServerOS=linux ServerArch=amd64 ServerVer=26.1.5+dfsg1`（Debian 打包的 Engine）· 非 linuxkit 内核 | Docker Desktop 29.1.3 · `--network=host` = VM 栈（ledger `:11`） | `ServerVer=29.1.3` · `OperatingSystem=Docker Desktop` · `Kernel=6.12.54-linuxkit` |
| 身份 | `uid=1000(box) gid=102(docker)` | — | — |

- 证据是实物而非口头：probe log 与 predeclare 文件实存于 box `/workspace/meetwise-lineAE/.tmp/`，本审逐字读取；machine receipt `…05-11-36-972Z-817650-….json` 实存（`exitCode:0` · `startedAt 05:11:19Z` = 13:11:19 +08 · `releaseEvidence:false`），其 `sourceDigests` 中 `run-e2e-isolated.mjs` `6d5458ed…`、`uc018-perf-load-capped-child.mjs` `4fa41bd8…`、`uc-e2e-018-perf-load.proof.ts` `fadb1cfd…`、`interview.service.ts` `4b5e1be9…`、`commerce.ts` `8c71b620…` 与 `350f7a4` 处 `git show | shasum -a 256` **逐一相同**。
- 弱点（已记，不阻断）：probe 的「docker info 首行 = `Client:`」本身不能区分 Desktop/Engine；真正有区分力的是 `26.1.5+dfsg1` + Linux 宿主 + 非 linuxkit 内核。
- **裁定：执行机 = Linux 原生 Docker Engine（就是本共享 box），`44154aa` = macOS Docker Desktop，二者确属不同 class，R-A 合法。** 措辞须为「**R-A on Linux-native host only**」：它**不**解决 macOS Docker Desktop 的不可达 class（`44154aa` 仍为该 class 的有效记录），**不**证明 attempt1 根因，C-PERF-TEARDOWN 与 backlog `:35` 保持 **OPEN**。receipt `:42`/`:44` 已写「矩阵 = 解释 ≠ attempt1 根因 ≠ 关闭理由」，符合。

### 3. C1 / C2

- **C1 落地**：probe log `:18-23` 先做宿主侧正控（`/dev/tcp` OK · node `SELECT 1` `{"ok":1}` · `HOST_POSITIVE_CONTROL=PASS`），再 `:24-29` 容器侧，`CONTAINER_IMAGE=node:20-bookworm NETWORK=host TARGET=127.0.0.1:32834`（与宿主侧同端口 `32834`）TCP + `SELECT 1` 皆 OK。镜像一致性已核：`capped-child.mjs:23` `NODE_IMAGE = … || 'node:20-bookworm'`；PG `pgvector/pgvector:pg16`（`run-e2e-isolated.mjs:1671-1672`）· 发布 `-p 127.0.0.1::5432`（`:2130`），与 probe 相同。
- **C2 落地**：predeclare 文件 `## N locked` N=3 · 分类→EXIT 表 (a)–(d) 全为「Closes CONDITION? NO」· EXIT 0 也不关闭。时序：receipt `:67` 记 `PREDECLARE_TS 13:11:15` 早于 attempt1 `13:11:19`，attempt1 起点经 machine receipt `startedAt` 独立佐证；predeclare 文件的 mtime 本审因 box shell 不可用而**未能独立核验**（如实记录）。attempt1 @ `b29c191` EXIT=1 在 receipt `:25` 原样保留，三段账目零改写。

### 4. 复跑（任务 4）——如实披露

- **box 复跑：未执行。** 本审时 box shell 无法 spawn（`spawn /usr/bin/bash ENOENT`），故 `/tmp/mwrr-56dac68` 无法建在 box 上；未改任何 box 环境去绕过。
- **desktop 跨 class 对照（非 R-A 证据 · 只作信息）**：temp worktree `/tmp/mwrr-56dac68` @ `56dac68` · `pnpm install --frozen-lockfile` EXIT 0 · `env -u MODEL_API_KEY -u MODEL_BASE_URL -u E2E_CLOUD_ISOLATED pnpm uc018:perf-load:prove` → **EXIT 1**（13:36:41→13:37:13 +08）。失败签名 = env 层：API 容器（linux-arm64）从 bind-mount 的 darwin `node_modules` 找不到 `@oxc-resolver/binding-linux-arm64-gnu`（`Cannot find native binding`）→ `ELIFECYCLE 1`，**未走到** `assertIsolatedTestTarget`。因此它**既不证实也不否定** class (b) ECONNREFUSED；不计入任何 attempt 台账，不作为 R-B 证据。未修依赖（属 Branch B / 越权）。worktree 已删除。
- 结论：本 PASS 以 box 实物产物核验（probe log · predeclare · machine receipt · digest 对齐）为据，**不含**本审独立复跑。若协调方要求独立复跑，应在 box shell 恢复后于 Linux Engine 上补跑。

### 5. C3–C8

| 条件 | 判定 | 证据 |
|------|------|------|
| C3 无变异 = 设计 | **落地** | receipt `:112` · predeclare `## C3` |
| C4 单一证据层 + 禁云 | **落地** | receipt `:88` · 本节 1 |
| C5 `:59` vs `:62`/`:70` | **落地** | receipt `:113` 并列登记；`44154aa` ledger `:7` 仍为 `:59` 原文，未被改写 |
| C6 host class | **落地** | 本节 2 |
| C7 日期钉实 · SSOT 零触碰 | **落地** | receipt `:3` 2026-10-06；`56dac68` 不含 backlog / 矩阵 / checklist；tip 上 backlog `:35` 仍 `disclosed OPEN`；`56dac68..tip` backlog 新增 35 行中 C-PERF-TEARDOWN 命中 0；`:429` 原有「STILL_OPEN」保留 |
| C8 Ban 互借 AH / C-IMAGE-DIGEST | **落地** | receipt `:115`；全文无 AH ECONNREFUSED 引作复现/根因 |

正交性：receipt `:96-100` 的 latency 仅作摘要，`:9`/`:124` Not capacity · PERF/LOAD local partial · capacityRepresentative=false。噪声 `fatal: not a git repository`（`:102`）如实列为非区分性。

### Pins（本审不改）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · gR45Closed=true · ms3EqualsR4Closed=false · DELETE=503 · PG-retained · PERF/LOAD local partial · capacityRepresentative=false · canHonestlyFlip=false · backlog `:35` C-PERF-TEARDOWN CONDITION OPEN · attempt1 @ `b29c191` EXIT=1 retained

**结论**：R-A 在 Linux 原生 Docker Engine（本共享 box）上合法且有实物证据，与 `44154aa` 的 macOS Docker Desktop 属不同 class；C1–C8 全部落地，零 Branch B、零云、零 SSOT 翻转，CONDITION 保持 OPEN。限定：「R-A on Linux-native host only」，不解决 Desktop class，不证明 attempt1 根因；本审独立复跑因 box shell 故障未执行，已如实披露。PASS。

Verdict: PASS
