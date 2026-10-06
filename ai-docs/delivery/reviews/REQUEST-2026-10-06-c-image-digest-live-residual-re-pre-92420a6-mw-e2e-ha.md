# re-PRE — C-IMAGE-DIGEST live residual · REQUEST `92420a6` · mw-e2e-ha（Line AJ · docs gate only）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Review date**: 2026-10-06 ~19:30 CST（Asia/Shanghai · UTC+8）
**Line**: **AJ**
**REQUEST**: `92420a6`（`92420a61c6c815846ed65c224e0eb91a7cdbb6ce`）· meetwise-core · 2026-10-06 14:35:10 +08:00 · **supersedes `f8f4ab5`** · cites FAIL `5be471c` · ancestor of origin ✔
**Coverage note**: 本人 prior PRE-EXEC PASS `899fef2` **只覆盖旧 tip `f8f4ab5`，不覆盖本 tip `92420a6`**。本文件为全新独立审查。
**Peer**: mw-rag-route Re-PRE PASS `e66419d` — **独立核实，不代签** · peer 附条件 C1–C4 **carry** · **CONDITION OPEN**
**Scope**: 只审文档 · Ban coding · Ban emit/prove 执行 · Ban invent `liveObservation` · Ban covered flip · Ban 假关 CONDITION · Ban wash · Ban live · Ban `.env*` · Ban buy cloud · Ban nail · Ban HA

本 PASS = docs gate 半签。**≠** AUTHORIZE · **≠** coding · **≠** E-A · **≠** CONDITION close · alone ≠ dual。

---

## 0. 变更面

- `git show --stat 92420a6` = **4 markdown only**。零代码/script/package。✅
- FAIL `5be471c` 正文在 rag stub **原样保留**。✅
- 未碰 AL/AM/AG · 未改 backlog `:34` · 未改 `PERF-LOAD.json`。✅

## 1. B1–B4（对照 FAIL `5be471c` · 独立核）

| # | 原阻断 | 本稿 | 独立核 |
|---|--------|------|--------|
| **B1** | HMAC 密钥未声明 | E-C：`MEETWISE_UC018_BACKFILL_HMAC_KEY` 缺失 → exit 8；Ban 读 `.env*`；≠ E-A | **解除** · `guard.mjs:26` · `emit.mjs:74-77` |
| **B2** | args 未钉 / 覆盖 `<key>.json` | `--key=PERF-LOAD-LIVE-AJ` · 临时 tipRoot/worktreeBase · Ban overwrite `PERF-LOAD.json` | **解除** · `emit.mjs:63/:68/:93/:229` 行为与钉参一致 |
| **B3** | natural/exit/host 未声明 | natural vs one-shot · exit map · host=Linux-native+`with-docker-session.sh` ≠ macOS Desktop | **解除**（细项见 C1–C4 carry） |
| **B4** | E-A 漏 `liveObservation` | E-A = `isLiveImageDigestEntry`（含 `liveObservation===true`）∧ `isValidLiveCaptureRecord` ∧ capturedAt∈窗口 ∧ machine+HMAC · Ban hand-write | **解除** · `facts.mjs:149-155` / `:126-137` |

**CONDITION**：backlog `:34` 仍 **OPEN** · E-A ≠ 关 CONDITION · UC-018/§1.1 stay **partial** · `PERF-LOAD.json:28-29` 仍 prior-docker-inspect / `liveObservation=false`。✅ · Ban invent liveObservation · Ban covered flip。✅

## 2. C1–C4 carry（peer `e66419d` §2 · 本审独立复核）

| ID | 条件 | 核 |
|----|------|----|
| **C1** | exit 8 须按 `reason` 拆：`hmac-key-missing`（`:206`）→ E-C；签名失败（`:226`）→ E-B；漏 exit 5（`:248`）→ E-B；prove≠0 须读 receipt `proveExit`（emitter `:562` 仍 exit 0） | **carry** · 属实 |
| **C2** | `--cmd`/`--targetSha` 仍占位 · AUTHORIZE 须钉死；natural emit 若覆盖 `PERF-LOAD.json`/共享树 → 不得算 E-A | **carry** |
| **C3** | emitter `finally` `docker rm -f` 全清 `meetwise-e2e*`（`:559`）· one-shot 须串行 · 他线被杀 EXIT1=环境≠回归 | **carry** |
| **C4** | 收据记宿主类 / wrapper 首行 / exit+reason；任何结果 CONDITION 仍 OPEN · UC-018 partial | **carry** |

## 3. Pins / Ban

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · DELETE=**503** · C-IMAGE-DIGEST **OPEN** · Ban invent liveObservation · Ban covered flip · Ban 假关 CONDITION · Ban coding · alone ≠ dual · 不代签 peer

## Blockers

**无**（docs gate）。执行前须落实 C1–C4。

## Non-claims

PASS ≠ AUTHORIZE ≠ emit ≠ E-A ≠ CONDITION close ≠ covered ≠ nail ≠ HA · Ban invent liveObservation · prior `899fef2` ≠ 覆盖本 tip · alone ≠ dual

## 中文摘要

REQUEST `92420a6` docs-only re-PRE（supersedes `f8f4ab5`），B1–B4 相对 FAIL `5be471c` 均已解除；HMAC/E-C、新 key、E-A=`liveObservation===true` 门、CONDITION OPEN 独立抽核属实。peer rag PASS `e66419d` 的 C1–C4（exit8 按 reason 拆分、钉 cmd/targetSha、docker rm 串行、收据披露）**carry**。Ban invent liveObservation · Ban covered flip · Ban 假关 CONDITION。旧 PASS `899fef2` 只覆盖 `f8f4ab5`。本 PASS≠AUTHORIZE≠E-A；alone≠dual；不代签 peer。

Verdict: PASS
