# REQUEST — **C-IMAGE-DIGEST live residual** · post-prove · mw-rag-route（stub · `draft:awaiting_post_prove`）

**Status**: **PENDING** / `draft:awaiting_post_prove`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer · Ban self-nail）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/c-image-digest-live-residual.md` · slice `c-image-digest-live-residual.slice.md`
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-c-image-digest-live-residual.md`
**REQUEST pre**: `92420a61c6c815846ed65c224e0eb91a7cdbb6ce` · PRE: mw-rag-route `e66419d`（C1–C4）· mw-e2e-ha `e8b8115`
**Prove base SHA**: `13fc781f82c6394662868ba7d121e082f6d0f181`
**Date**: 2026-10-06
**Line**: **AJ**
**Outcome claimed by implementer**: **E-C** · emitter EXIT **8** · reason **hmac-key-missing** · host class Linux-native-Docker-Engine · **CONDITION stays OPEN** · ≠ E-A · Ban invent liveObservation · Ban covered flip

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| C-IMAGE-DIGEST（backlog `:34`） | **CONDITION OPEN**（Ban fake-close） |
| UC-018 / §1.1 | **partial** · coveredCount=**8** |
| `PERF-LOAD.json:28-29` | prior-docker-inspect / `liveObservation=false` **retained** |
| live digest ≠ stack MET | `facts.mjs:62` |

## 请审什么（mw-rag-route · post-prove）

1. **C1**：exit 8 按 reason 拆分落实 — 本跑 missing-key → E-C；签名失败→E-B / exit5→E-B / prove≠0→读 receipt `proveExit`（本跑 N/A）是否与 Re-PRE `e66419d` §2.1 一致。
2. **C2**：钉参 `--cmd`/`--targetSha`/`PERF-LOAD-LIVE-AJ`/临时 roots · Ban overwrite `PERF-LOAD.json` 实证（sha before=after）。
3. **C3**：串行 vs `emit.mjs:559` docker rm -f · COUNT 0/0 · 无他线环境误杀。
4. **C4**：收据宿主类 + wrapper 首行 + exit+reason · CONDITION OPEN · UC-018 partial。
5. **E-A 门 / stack MET**：E-A 四门未过诚实；live-container-inspect 不计 stack MET；Ban invent liveObservation。
6. **密钥边界**：Ban 读 `.env*` · 协调方未授权密钥来源 ⇒ E-C 合法 · ≠ invent · 若要 E-A 须另授权。
7. **边界**：PASS ≠ E-A ≠ close ≠ covered ≠ nail ≠ HA · Ban 碰 AI/AK/AG · alone ≠ dual · Ban self-nail。

C-IMAGE-DIGEST stays **CONDITION OPEN**. E-C ≠ E-A. Ban invent liveObservation. Ban covered flip.

## Verdict

**PENDING**（awaiting `mw-rag-route` post-prove · implementer 不得填写）

---

*Stub · awaiting expert post-prove dual · Line AJ · E-C · CONDITION OPEN · STOP*

## POST-PROVE @666a3bf · mw-rag-route

**时间**：2026-10-06 19:40 +08:00
**PROVE_TIP**：`666a3bf930299cdde160f68b63b36e2c05fc3f9e`（父 `9244420`；首次 fetch 时不在 `origin/feat/mysql-schema-skeleton`、仅在 `origin/line/aj-image-digest`，本地 `cat-file -e` 存在；稍候 re-fetch 后已为 origin tip `56b77a7` 祖先）
**REQUEST**：`92420a6` · PRE：mw-e2e-ha `e8b8115` · mw-rag-route `e66419d`（PASS · C1–C4）
**审查基**：临时 worktree `/tmp/mwrr-666a3bf` @ origin tip `56b77a7`（detached）· 仅本 box 执行 · 未在用户 Mac / 任何 machineId 上运行 · 未读 `.env*` · 密钥只做存在性检查 · 无 live 模型调用 · 无云采购
**范围**：独立审查，不代签 mw-e2e-ha（其 POST `56b77a7` 未作为本审证据）· alone ≠ dual · 不 nail

### 1. 范围（666a3bf vs 92420a6）

- 本线提交 `666a3bf` 自身只改 5 个 docs 文件：slice 与 harness 状态行（各 +3/-3）、新收据 `receipts/2026-10-06-c-image-digest-live-residual.md`（+166）、两个 post stub（+41 / +42）。零 `apps/` / `packages/` / `scripts/` / `package.json`。
- `92420a6..666a3bf` 区间内的代码改动（`apps/api/test/uc-e2e-001-nhp-adv.proof.ts`、`apps/api/package.json`、`package.json`、`scripts/run-e2e-isolated.mjs`）全部来自 Line AG `7eb1c88`（已另审 POST `2bf22c5`），非本线；matrix / master-checklist 的改动为 AL / AM / AG nail 行，未涉 C-IMAGE-DIGEST / UC-018。
- `PERF-LOAD.json` 区间内零提交；sha256 `c8a0eee7…21fd8b` 与 `92420a6` 相同；`:28-29` 仍为 `source=prior-docker-inspect` / `liveObservation=false`；无 `PERF-LOAD-LIVE-AJ*.json`。
- 发射器与 guard / facts 库在 `92420a6..HEAD` 与 `13fc781..HEAD` 均零 diff，收据行号仍有效。
- `gap-bug-backlog.md:34` 仍为 **OPEN** CONDITION，区间内无 C-IMAGE-DIGEST 行改动；无 SSOT / FUNNEL 文件改动；无 covered 翻转、无 liveObservation 捏造、无 CONDITION 关闭。→ **通过**

### 2. 核心收据内容

- 结论 **E-C**，明确 ≠ E-A、≠ E-B：收据 `:10`、`:98-105`、`:154`。
- exit 8 与 reason：`:86-88`（stderr 原文 `fail closed: MEETWISE_UC018_BACKFILL_HMAC_KEY missing …`；路径 `emit.mjs:74-77`）。
- 宿主类：`:60-67`（Linux-native-Docker-Engine · Engine 26.1.5 · wrapper 首行原文）。
- 钉死命令：`:36-52`（`--key=PERF-LOAD-LIVE-AJ` · `--targetSha=b29c191…` · `--cmd=uc018:perf-load:prove` · 临时 tipRoot `/tmp/mw-aj-digest-tipRoot` / worktreeBase `/tmp/mw-aj-digest-wtBase`）。
- 未声称 prove 已跑：`:54` 无写出、`:91` `proveExit` N/A 且禁止用 emitter EXIT 推断、`:132-135` E-A 四门 not evaluated / fail-closed、`:160-162` Non-claims。
- 密钥边界：`:8`、`:92`（进程环境 ABSENT · 未读 `.env*` · 协调方未授权密钥来源）。→ **通过**

### 3. 源码核对（`scripts/uc018-receipt-backfill-emit.mjs` @ 56b77a7，与 13fc781 相同）

- 缺密钥的真实退出点是顶层启动门 `:74-77`：`resolveHmacKey()` 为空 → `:75` 打印 fail closed → `:76` `process.exit(8)`。`resolveHmacKey` 只读 `process.env[HMAC_KEY_ENV]`（`lib/uc018-receipt-backfill-guard.mjs:26` 常量名、`:79-87` 读取逻辑），无默认值、无 `.env` 读取。
- 该退出在第一次 `git`（`:85`）、`mkdirSync`（`:96`）、`worktreeBase` 创建（`:308`）与 worktree 清理（`:328`）以及 `try`（`:505`）/ `finally`（`:555-560`，含 `:559` `docker rm -f`）之前，因此不可能触发对其他线容器的清理。被导入的 guard / facts 模块顶层只有常量与函数定义，无 docker / 子进程副作用。
- `:206` 的 `hmac-key-missing` 分支位于 `finalizeReceipt`（`:186`）内。由于 `:74-77` 已先行 fail-closed，且 `childEnv` 只删除子进程副本（`:79-82`），缺密钥时 `:206` 实际不可达。我方 PRE C1 引用 `:206` 作为 E-C 位置，应以 `:74-77` 为准；收据 `:88` 已正确说明 `:189-206` 未到达。两者语义一致（均 exit 8 → E-C），不构成阻塞。
- 附带观察：Node 的 `process.exit()` 不会执行 `finally`。因此位于 `try` 内的 `:206` / `:226` / `:248` 退出会跳过 `:556` worktree 移除与 `:559` 容器清理，只有正常完成或抛异常才会走 `finally`。本跑不涉及，但影响将来 E-A 尝试的残留处理（见条件 2）。

### 4. box 复跑（E-C 路径）

- 前提：源码表明退出发生在 `finally` / docker 清理之前，故允许复跑。
- 复跑前：`with-docker-session.sh docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` → 0 个容器；`MEETWISE_UC018_BACKFILL_HMAC_KEY` ABSENT、`MODEL_API_KEY` PRESENT、`MODEL_BASE_URL` ABSENT（仅存在性，未打印值），全部经 `env -u` 剥离；worktree 无 `.env*`。
- 命令：`./scripts/with-docker-session.sh env -u MEETWISE_UC018_BACKFILL_HMAC_KEY -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:receipt-backfill:emit --key=PERF-LOAD-LIVE-AJ-RAGREPRO --targetSha=b29c191543dfbe7c1afa4278c550340a3339f295 --cmd=uc018:perf-load:prove --tipRoot=/tmp/mwrr-aj-repro-tipRoot --worktreeBase=/tmp/mwrr-aj-repro-wtBase`（输出 key 加后缀，不可能覆盖任何已跟踪文件）。
- 窗口：2026-10-06 19:38:04 → 19:38:05 +08:00。
- 实际 **EXIT=8**（pnpm `ELIFECYCLE Command failed with exit code 8`）。stderr 第一行是 wrapper 行 `with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)`；发射器 stderr 第一行是 `fail closed: MEETWISE_UC018_BACKFILL_HMAC_KEY missing (no default key, no .env read)`，与收据 `:65`、`:87` 逐字一致。
- 复跑后：worktree `git status --porcelain` 为空（含 ignored 亦为空）；`/tmp/mwrr-aj-repro-tipRoot`、`/tmp/mwrr-aj-repro-wtBase` 均未被创建；无 `*RAGREPRO*` 文件；`PERF-LOAD.json` sha256 不变。
- 复跑后 13 秒（19:38:17–18 +08:00）出现容器 `meetwise-e2e-1125797-…`，属另一线 `node scripts/run-e2e-isolated.mjs uc001:nhp-bound:prove:raw`（PID 1125797），启动于本跑退出之后，与本跑无关，本审未触碰。这也印证 C3：任何走到 `:559` 的 emit 都会误杀此类容器。

### 5. C1–C4 落实

- **C1** 已落实：收据 `:96-103` 按 reason 拆分 exit 8（缺密钥 → E-C；`:226` 签名失败 → E-B）、exit 5（`:248`）→ E-B、prove≠0 读 receipt `proveExit`（`:91`、`:101`，指出 `:562` 仍可 exit 0）。harness `:94` 将 exit 8 `:74-77` 映射为 E-C，与观测一致。行号修正见 §3。
- **C2** 已落实：收据 `:36-52` 钉参；`:26` 声明 coordinator one-shot（非 natural emit），未将其计为 E-A；`PERF-LOAD.json` 未覆盖（§1 实证）。
- **C3** 已落实：收据 `:75-78` 前后 COUNT=0；源码证实提前退出不经 `:559`；本审复跑同样未触发清理。
- **C4** 已落实：收据 `:60-67` 宿主类 + wrapper 首行，`:86-87` exit + reason，`:148`、`:155` CONDITION OPEN / UC-018 partial。

### 6. 门禁与 pins

- `NORTH-STAR-EXECUTION-LOOP.md:81`（§3③）：harness `:57-66` 给出命令、`:90-97` 给出退出映射；本次观测 exit 8 → E-C 与映射 `:94` 一致，复跑结果相同。
- `north-star-hard-gates.md:46` / `:117`（gap / partial ≠ covered）：收据与 slice / harness 均保持 CONDITION OPEN、UC-018 / §1.1 partial、coveredCount=8。
- Pins 未变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（Postgres / pgvector / PostgresSaver；MySQL runtime / Qdrant / MemorySaver 禁用）· public DELETE=503。

### 7. 条件（非阻塞）

1. 我方 PRE C1 中 E-C 的位置 `:206` 改以 `:74-77` 为准（缺密钥时 `:206` 不可达）；后续文档引用 E-C 时使用 `:74-77`。
2. 将来若协调方另行授权密钥来源走 E-A：由于 `process.exit` 跳过 `finally`，`try` 内 exit 8（`:226`）/ exit 5（`:248`）后须人工检查并清理 worktreeBase 下的 `b29c191` 残留 worktree 与 meetwise-e2e* 容器，且仍须串行（C3）。
3. slice `:24` 仍写 “Ban prove/emit 执行（本 turn）”，属 re-PRE 时的过时文字，应标注已被 AUTHORIZE 取代。
4. 收据 `:36-44` 的 CMD 未显示 `env -u …` 剥离前缀；收据 `:92` 已证明进程环境中密钥 ABSENT，故结论不受影响，但复现命令建议补上 `env -u MEETWISE_UC018_BACKFILL_HMAC_KEY -u MODEL_API_KEY -u MODEL_BASE_URL`。

### 8. 结论

E-C 结果记录诚实，可在本 box 复现（EXIT 8、stderr 逐字一致），并与源码一致（退出在 `:76`，先于 `finally` 与 docker 清理）；C1–C4 已落实；无捏造 liveObservation、无 covered 翻转、无 CONDITION 关闭、无 SSOT / FUNNEL 改动。

本 PASS 仅表示「被阻断的结果被正确记录」：live-observation 残余 **未关闭**，C-IMAGE-DIGEST（backlog `:34`）**CONDITION 仍 OPEN**，UC-018 / §1.1 仍 partial；E-C ≠ E-A ≠ CONDITION close ≠ covered ≠ nail ≠ HA；EXIT0 ≠ covered；alone ≠ dual。本审不代签 mw-e2e-ha，不 nail；nail 需双方独立 PASS 加协调方裁定。

Verdict: PASS
