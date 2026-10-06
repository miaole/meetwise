# Receipt — **C-IMAGE-DIGEST live residual · coordinator one-shot emit**（Line AJ · **E-C** · CONDITION stays OPEN）

**Date**: 2026-10-06（Asia/Shanghai · UTC+8）
**Line**: **AJ** · implementer `mw-core` / `meetwise-core`
**Knife**: harness `harness/c-image-digest-live-residual.md` · slice `c-image-digest-live-residual.slice.md`
**REQUEST**: `92420a61c6c815846ed65c224e0eb91a7cdbb6ce`（docs re-PRE rewrite · supersedes `f8f4ab5`）
**PRE dual BOTH PASS**: mw-e2e-ha `e8b8115` · mw-rag-route `e66419d`（C1–C4 carry）
**AUTHORIZE**: Line AJ · PRE BOTH PASS · coding+prove（coordinator）· **Ban** read `.env*` · missing HMAC = honest **E-C** exit 8 · **no** key-source authorization in this AUTHORIZE
**Lifecycle**: **`post_prove:awaiting_post_prove_dual`**（awaiting mw-e2e-ha + mw-rag-route post · **Ban self-nail** · alone ≠ dual）
**Outcome**: **E-C**（env/secret block · `hmac-key-missing`）· **≠ E-A** · **≠ invent** · **Ban** fake-close CONDITION · **Ban** UC-018 covered flip · **Ban** invent `liveObservation=true`

---

## Pins（unchanged）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · public DELETE=**503** · canHonestlyFlip=**false**

**C-IMAGE-DIGEST stays CONDITION OPEN**（backlog `gap-bug-backlog.md:34` · **zero SSOT edit** this receipt）· UC-018 / §1.1 stay **partial** · live digest ≠ stack MET · fix landed (`f856902` / nail `04607c9`) ≠ CONDITION closed · E-C ≠ E-A ≠ CONDITION close · Ban self-nail · Ban HA · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push

---

## 0. Run class（B3 / C2）

| 项 | 值 |
|----|-----|
| Class | **Coordinator one-shot**（非 natural emit · 单次 CMD 窗口） |
| Window | `2026-10-06T19:32:40+0800` → `2026-10-06T19:32:41+0800` |
| Worktree | `/workspace/meetwise-wt-aj-digest` · branch `line/aj-image-digest` @ `13fc781f82c6394662868ba7d121e082f6d0f181`（= `origin/feat/mysql-schema-skeleton` at fetch） |
| Ancestors | REQUEST `92420a6` · PRE `e8b8115`/`e66419d` · fix `f856902` · dual `8c8351b`/`1abfe55` · nail `04607c9` · target `b29c191` — all `merge-base --is-ancestor` OK |
| Ban | overwrite `PERF-LOAD.json` · tipRoot=共享主树 cwd · default `worktreeBase=/workspace/meetwise-lineA-backfill` · `--key=PERF-LOAD` · read `.env*` · invent `liveObservation` · retry-to-green |

---

## 1. C2 pinned CMD（AUTHORIZE 钉死）

```text
bash scripts/with-docker-session.sh \
  pnpm uc018:receipt-backfill:emit \
  --key=PERF-LOAD-LIVE-AJ \
  --targetSha=b29c191543dfbe7c1afa4278c550340a3339f295 \
  --cmd=uc018:perf-load:prove \
  --tipRoot=/tmp/mw-aj-digest-tipRoot \
  --worktreeBase=/tmp/mw-aj-digest-wtBase
```

| Arg | Value | Why |
|-----|-------|-----|
| `--key` | **`PERF-LOAD-LIVE-AJ`** | Ban `--key=PERF-LOAD`（会覆盖 `PERF-LOAD.json:28-29`） |
| `--targetSha` | **`b29c191543dfbe7c1afa4278c550340a3339f295`** | PERF-LOAD 轨祖先（`PERF-LOAD.json:7` / `:11`） |
| `--cmd` | **`uc018:perf-load:prove`** | PERF-LOAD 轨 prove 脚本（package.json） |
| `--tipRoot` | `/tmp/mw-aj-digest-tipRoot` | 临时 tipRoot（detached worktree @ same HEAD · ≠ 共享主树） |
| `--worktreeBase` | `/tmp/mw-aj-digest-wtBase` | 临时 base · Ban 默认 `/workspace/meetwise-lineA-backfill` |

**Writes**: none（early exit 8 before any receipt/log write）· **no** `PERF-LOAD-LIVE-AJ.json` · **PERF-LOAD.json unchanged**（sha256 `c8a0eee71736b85707c2750e8f9e6c4ceedc3b3d960196d355e5a4e07921fd8b` before=after）· `:28-29` still `source=prior-docker-inspect` · `liveObservation=false`.

---

## 2. C4 host class + wrapper first line

| 面 | 本机（Line AJ · 2026-10-06） |
|----|------------------------------|
| OS | **Linux** `6.12.94+` x86_64 · Debian GNU/Linux 13 (trixie) · hostname `grok-bot-vm-428703232` |
| Docker | **Engine**（NOT Desktop）· Client/Server `26.1.5+dfsg1` · ServerOS=linux ServerArch=amd64 |
| `id` / groups | uid=1000(box) · docker 组已在 `/etc/group`（`docker:x:102:box`）· session 经 `scripts/with-docker-session.sh`（`sg docker`）激活 · Ban sudo/chmod/usermod/setfacl |
| **Wrapper first line** | `with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)` |
| `docker info` after wrapper | first content line `Client:`（Engine · 无 Desktop 插件面） |
| Host class declaration | **Linux-native-Docker-Engine**（≠ macOS Docker Desktop · Line AE 先例）· 本观测只代表此类宿主 |

---

## 3. C3 serialize vs emitter `docker rm -f`

| Check | Result |
|-------|--------|
| Before | `docker ps -aq --filter name=meetwise-e2e --filter name=meetwise-uc018` → **COUNT=0** |
| During | early exit 8 at `emit.mjs:74-77` **before** prove / worktree / `finally` `:559` `docker rm -f` |
| After | COUNT=**0** · 无他线容器被杀 |
| Read | one-shot serial · 他线 kill EXIT1=env≠regression **未触发**（无并发隔离 prove） |

---

## 4. C1 exit / reason map（本跑）

| 观测 | 值 |
|------|-----|
| Emitter process EXIT | **8** |
| Stderr reason | `fail closed: MEETWISE_UC018_BACKFILL_HMAC_KEY missing (no default key, no .env read)` |
| Path | `scripts/uc018-receipt-backfill-emit.mjs:74-77`（`resolveHmacKey()` falsy → exit 8）· 同语义 `guard.mjs:26` / `HMAC_KEY_ENV` · finalize 分支 `reason:'hmac-key-missing'` 在 `:189-206`（本跑未达 · 因启动门已 fail-closed） |
| Signature-fail exit 8（`:226`） | **not reached** |
| Exit 5（`validateMachineEmittedReceipt` fail · `:248`） | **not reached** → 若达则归 **E-B** |
| Prove / receipt `proveExit` | **N/A**（prove 未启动；emitter 未写出 receipt；**不得**用 emitter EXIT 推断 proveExit） |
| Env | `MEETWISE_UC018_BACKFILL_HMAC_KEY` **ABSENT** in process env · **Ban** read `.env*`（worktree `.env*` 亦不存在）· 协调方**未**另授权密钥来源 |

### Exit map applied（C1 carry · harness §4.3 + peer C1）

| Emit / prove 结果 | 归类 | 本跑 |
|-------------------|------|------|
| exit 8 + `hmac-key-missing` / missing-key stderr | **E-C** | **YES** |
| exit 8 + signature fail（`attachEmitterHmac` not ok · `:226`） | **E-B** | no |
| exit 5（validate fail · `:248`） | **E-B** | no |
| prove EXIT ≠ 0（读 receipt `proveExit`；emitter `:562` 仍可 exit 0） | **E-B**（或 E-C if env） | N/A |
| `live-container-inspect-failed` 条目 | **E-B** | N/A（无写出） |
| E-A 四门全过 | **E-A** | **NO** |

**Outcome = E-C** · Ban retry-to-green · Ban invent liveObservation · Ban claim E-A.

---

## 5. Tip line numbers（C1 harness / rag C1 · 钉当时 tip `13fc781`）

| Symbol | file:line @ tip |
|--------|-----------------|
| early HMAC fail-closed | `emit.mjs:74-77` |
| `hmac-key-missing` finalize | `emit.mjs:189-206` |
| signature-fail exit 8 | `emit.mjs:226` |
| validate fail exit 5 | `emit.mjs:248` |
| `collectImageDigestsRaw` | `emit.mjs:349` |
| `inspectRunContainerLive` | `emit.mjs:437-482` |
| `finally` `docker rm -f meetwise-e2e*` | `emit.mjs:559` |
| emitter trailing `process.exit(0)` | `emit.mjs:562` |
| `isValidLiveCaptureRecord` | `facts.mjs:126-137` |
| `isLiveImageDigestEntry`（含 `liveObservation===true`） | `facts.mjs:149-155` |
| `live-container-inspect` ∉ `RUNTIME_STACK_SOURCES` | `facts.mjs:62` |
| `HMAC_KEY_ENV` / `resolveHmacKey` | `guard.mjs:26` / `:79` |

---

## 6. E-A gate checklist（本跑全部未满足 · 诚实）

| # | Gate | Result |
|---|------|--------|
| 1 | `isLiveImageDigestEntry(entry)===true`（含 `liveObservation===true` · `source=live-container-inspect` · 非空 `containerId`） | **not evaluated**（无机器写出条目） |
| 2 | `isValidLiveCaptureRecord`（ok / running===true / containerId / imageDigest sha256 / capturedAt ISO） | **not evaluated** |
| 3 | `capturedAt` ∈ run window | **not evaluated** |
| 4 | machine-written + HMAC signature valid · Ban hand-write | **fail-closed**（无 key → 无签名写出） |

**≠ E-A** · **Ban invent** `liveObservation=true` · fixture/FX ≠ live.

---

## 7. C1–C4 compliance summary

| ID | 落实 |
|----|------|
| **C1** | exit 8 按 reason 拆：本跑 = missing-key → **E-C**；签名失败→E-B / exit5→E-B / prove≠0→读 `proveExit` 未触发 |
| **C2** | `--cmd`/`--targetSha`/`--key=PERF-LOAD-LIVE-AJ`/temp tipRoot+worktreeBase 钉死 · Ban overwrite `PERF-LOAD.json`（sha 不变 · `:28-29` 原值） |
| **C3** | 串行 · 前后 COUNT=0 · early exit 未跑 `docker rm -f` · 无他线误杀 |
| **C4** | 本收据记宿主类 + wrapper 首行 + exit+reason · **CONDITION OPEN** · UC-018/§1.1 partial |

---

## 8. Verdict（诚实边界）

- **E-C**（HMAC env/secret block）· emitter EXIT **8** · reason **hmac-key-missing**（启动门 `:74-77`）
- **CONDITION stays OPEN**（backlog `:34` 零触碰）· UC-018 / §1.1 stay **partial** · coveredCount=**8**
- **≠ E-A** · **≠** invent liveObservation · **≠** covered flip · **≠** nail · **≠** HA · **≠** releaseEvidence · fix landed ≠ closed
- 若要走 E-A 路径须协调方**另授权**密钥来源（Ban 读 `.env*`）+ 新 AUTHORIZE
- 本 tip 待 post-prove dual（mw-e2e-ha + mw-rag-route）· Ban self-nail · alone ≠ dual

### Non-claims

Not a pass · not live-observed · not closed · not UC-018 covered · not nail · not HA · not `releaseEvidence=true` · E-C ≠ E-A · EXIT8 ≠ invent · alone ≠ dual · Ban fake-close CONDITION

---


## NAIL（2026-10-06 · Line AJ · `post_prove_dual_pass` · additive · E-C · CONDITION OPEN）

- Lifecycle → **`post_prove_dual_pass`**（AUTHORIZE nail · BOTH POST PASS · E-C outcome record only · implementer does not self-approve beyond this nail）. Body §0–§8 above retained verbatim as the prove-time record.
- POST dual BOTH PASS: mw-e2e-ha `56b77a7`（`56b77a7f61edf2032094e9379b7f70ae61da0ea8`） + mw-rag-route `856680b`（`856680b1e93063653374ede090db985404565a06`） · alone≠dual satisfied by BOTH POST. PROVE_TIP remains **NAILED TO** `666a3bf`（`666a3bf930299cdde160f68b63b36e2c05fc3f9e`）.
- E-C location erratum（carry · non-block）: fail-closed exit 8 = `scripts/uc018-receipt-backfill-emit.mjs:74-77`（`resolveHmacKey()` falsy）; the `:206` `hmac-key-missing` finalize branch is unreachable when the key is missing. Cite `:74-77`, not `:206`.
- Repro CMD form（carry · non-block · preferred prefix）: `bash scripts/with-docker-session.sh env -u MEETWISE_UC018_BACKFILL_HMAC_KEY -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:receipt-backfill:emit --key=PERF-LOAD-LIVE-AJ --targetSha=b29c191543dfbe7c1afa4278c550340a3339f295 --cmd=uc018:perf-load:prove --tipRoot=<temp> --worktreeBase=<temp>`（§1 CMD shown without the prefix; key ABSENT per §4 so the conclusion is unchanged）.
- E-A key source needs a **separate coordinator AUTHORIZE** — not invented here · Ban read `.env*`.
- **HOLD**: **CONDITION stays OPEN**（backlog `gap-bug-backlog.md:34` row untouched · Ban fake-close）· UC-018 / §1.1 stay **partial** · coveredCount=**8** · live residual **NOT closed** · outcome stays honest **E-C**（emitter EXIT 8 · `hmac-key-missing` · fail-closed @ `scripts/uc018-receipt-backfill-emit.mjs:74-77`, not `:206`）≠ **E-A** · EXIT0≠covered · PASS = blocked outcome recorded, not closed · Ban invent `liveObservation` · Ban covered flip · `PERF-LOAD.json:28-29` prior-docker-inspect / liveObservation=false retained.
- Pins unchanged: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false. Ban self-nail beyond this AUTHORIZE · Ban close CONDITION · Ban invent liveObservation · Ban covered flip · Ban product code changes · Ban touch AI/AK coding files · Ban HA · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push.

*Receipt · Line AJ · C-IMAGE-DIGEST live residual · E-C hmac-key-missing · CONDITION OPEN · post_prove_dual_pass · live residual NOT closed · STOP*
