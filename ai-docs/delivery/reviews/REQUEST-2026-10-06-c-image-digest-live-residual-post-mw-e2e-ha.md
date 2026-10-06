# POST-PROVE — C-IMAGE-DIGEST live residual · Outcome E-C · mw-e2e-ha（Line AJ · 半签 · Ban nail · Ban fake-close）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Review date**: 2026-10-06 ~19:36 CST（Asia/Shanghai · UTC+8）
**Line**: **AJ**
**PROVE_TIP**: `666a3bf930299cdde160f68b63b36e2c05fc3f9e`（`docs(receipt): Line AJ C-IMAGE-DIGEST live residual E-C · EXIT 8 hmac-key-missing · awaiting post_prove dual`）
**REQUEST**: `92420a61c6c815846ed65c224e0eb91a7cdbb6ce`（docs re-PRE rewrite · supersedes `f8f4ab5`）
**PRE（本审）**: `e8b81150b905ca7b491e40c5575a5a6a2c4e4ce6`（re-PRE PASS · docs gate · C1–C4 carry · CONDITION OPEN）
**Peer rag PRE**: `e66419da514648fb74956aff9d65d89d8f1d38cc` — **独立核实存在 · 不代签** · C1–C4 carry · CONDITION OPEN
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-c-image-digest-live-residual.md`
**Harness / slice**: `harness/c-image-digest-live-residual.md` · `c-image-digest-live-residual.slice.md`
**Claimed outcome**: **E-C** · emitter EXIT **8** · reason **hmac-key-missing** · `.env*` unread · key **ABSENT** · ≠ E-A · prove not started

本 PASS = post-prove 半签。**≠** nail · **≠** E-A · **≠** CONDITION close · **≠** covered · **≠** HA · alone ≠ dual · EXIT0 ≠ covered · Ban invent liveObservation · Ban covered flip · Ban fake-close CONDITION。

---

## 0. Tip / REQUEST / PRE 核验

- Detach checkout PROVE_TIP = `666a3bf` ✔ · object on `origin/line/aj-image-digest` ✔ · parent `9244420` = then-`origin/feat/mysql-schema-skeleton` tip。
- `git merge-base --is-ancestor`：REQUEST `92420a6` · PRE `e8b8115` · peer PRE `e66419d` · target `b29c191` · fix `f856902` · dual `8c8351b`/`1abfe55` · nail `04607c9` → **全 OK**。
- tip `git show --name-only`：仅 `ai-docs/delivery/**`（slice · harness · receipt · post stub ×2）。零 `apps/`/`packages/`/`scripts/`/`package.json` · 零 `.env*` · 零 backlog/checklist/矩阵翻关。
- tip message 明文：**E-C** · EXIT 8 hmac-key-missing · awaiting post_prove dual · CONDITION OPEN 语境。
- Peer rag PRE `e66419d` **exists** · **not co-signed**（alone ≠ dual）。

---

## 1. Hard pins（restated · unchanged）

| Pin | Value |
|-----|-------|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |
| g7SuiteGreen | **false** |
| C-IMAGE-DIGEST（backlog `:34`） | **CONDITION OPEN** · canHonestlyFlip=false |
| UC-018 / §1.1 | **partial** · Ban covered flip |
| `PERF-LOAD.json:28-29` | `source=prior-docker-inspect` · `liveObservation=false` **retained** |

---

## 2. Independent re-run（mw-e2e-ha · Ban invent liveObservation · Ban inject key）

**CMD**（与 receipt §1 / REQUEST C2 钉参一致 · 本审用 verify tipRoot 以免碰撞）:

```text
env -u MEETWISE_UC018_BACKFILL_HMAC_KEY -u MODEL_API_KEY \
  bash scripts/with-docker-session.sh \
  pnpm uc018:receipt-backfill:emit \
  --key=PERF-LOAD-LIVE-AJ \
  --targetSha=b29c191543dfbe7c1afa4278c550340a3339f295 \
  --cmd=uc018:perf-load:prove \
  --tipRoot=/tmp/mw-aj-digest-tipRoot-verify \
  --worktreeBase=/tmp/mw-aj-digest-wtBase-verify
```

| 观测 | 本审实测（2026-10-06 ~19:35 CST） |
|------|----------------------------------|
| Emitter EXIT | **8** |
| Stderr reason | `fail closed: MEETWISE_UC018_BACKFILL_HMAC_KEY missing (no default key, no .env read)` |
| Wrapper first line | `with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)` |
| `MEETWISE_UC018_BACKFILL_HMAC_KEY` | **ABSENT** in process env · **Ban** read `.env*` · worktree `.env*` **absent** |
| Prove started? | **NO**（early exit at `emit.mjs:74-77` · no receipt write · no `proveExit`） |
| `PERF-LOAD-LIVE-AJ.json` | **not written** |
| `PERF-LOAD.json` sha256 | before=after `c8a0eee71736b85707c2750e8f9e6c4ceedc3b3d960196d355e5a4e07921fd8b` · `:28-29` 原值 |
| docker meetwise-e2e*/uc018 COUNT | before=**0** · after=**0** · early exit **未**触 `emit.mjs:559` `docker rm -f` |

**Host class**: Linux-native-Docker-Engine（Linux `6.12.94+` · Engine `26.1.5+dfsg1` · ≠ macOS Desktop）。

---

## 3. C1–C4 carry（from PRE `e8b8115` · 独立复核 @ tip）

| ID | 条件 | 本审 |
|----|------|------|
| **C1** | exit 8 按 reason 拆：`hmac-key-missing` → **E-C**；签名失败（`:226`）→ E-B；exit 5（`:248`）→ E-B；prove≠0 须读 receipt `proveExit`（emitter `:562` 仍可 0） | **hold** · 本跑 = missing-key stderr @ `:74-77` → **E-C** · 签名失败/exit5/prove **未达** |
| **C2** | `--cmd`/`--targetSha`/`--key=PERF-LOAD-LIVE-AJ`/temp tipRoot+worktreeBase 钉死 · Ban overwrite `PERF-LOAD.json` | **hold** · sha 不变 · `:28-29` retained |
| **C3** | emitter `finally` `docker rm -f` 全清 · one-shot 须串行 · 他线被杀 EXIT1=环境≠回归 | **hold** · COUNT 0/0 · early exit 未跑 finally rm |
| **C4** | 收据记宿主类 / wrapper 首行 / exit+reason；任何结果 CONDITION 仍 OPEN · UC-018 partial | **hold** · receipt §2/§4 与本审复跑一致 · **CONDITION OPEN** |

Code spot-check @ tip：`guard.mjs:26` `HMAC_KEY_ENV=MEETWISE_UC018_BACKFILL_HMAC_KEY` · `emit.mjs:74-77` fail-closed exit 8 · finalize `reason:'hmac-key-missing'` `:189-206`（本跑未达）· `facts.mjs:149-155` `isLiveImageDigestEntry` 含 `liveObservation===true` 门（本跑无写出 · **未** invent）。

---

## 4. Outcome E-C vs E-A / prove-not-started

| Gate | Result |
|------|--------|
| E-C（exit 8 + hmac-key-missing / missing-key stderr · key ABSENT · Ban `.env*`） | **YES** · 本审独立复跑吻合 receipt |
| ≠ E-A（`isLiveImageDigestEntry` ∧ valid capture ∧ capturedAt∈窗口 ∧ machine+HMAC） | **YES ≠ E-A** · 无机器写出 live 条目 · Ban invent `liveObservation=true` |
| Prove not started | **YES** · 无 `proveExit` · Ban 用 emitter EXIT 冒充 proveExit · **EXIT0 ≠ covered**（本跑亦非 EXIT0） |
| CONDITION | **OPEN**（backlog `:34` 逐字 **OPEN** CONDITION · 本审 **零** SSOT 编辑 · Ban fake-close） |

---

## 5. Ban lines（restated）

- Ban invent `liveObservation` / liveObservation=true
- Ban covered flip · Ban UC-018 covered（coveredCount stays **8**）
- Ban fake-close CONDITION · E-C ≠ close · E-A ≠ close · fix landed ≠ closed
- Ban self-nail · Ban self-approve · alone ≠ dual · 不代签 peer
- Ban read `.env*` · Ban inject HMAC key · Ban invent liveObservation path
- Ban buy cloud · Ban Meridian · Ban HA · Ban coding this review · Ban force-push
- EXIT0 ≠ covered · alone ≠ dual

---

## Blockers

**无阻塞**。Spot-checked：PROVE_TIP tip contents · REQUEST `92420a6` · PRE `e8b8115` · peer PRE `e66419d` exists（not co-signed）· receipt CMD+EXIT · independent emitter re-run EXIT **8** · HMAC key ABSENT · PERF-LOAD sha/`liveObservation=false` · backlog `:34` OPEN · C1–C4 hold · E-A gates not met · prove not started。

---

## Non-claims

PASS ≠ nail ≠ E-A ≠ CONDITION close ≠ covered ≠ HA ≠ releaseEvidence · E-C ≠ E-A · EXIT8 ≠ invent · EXIT0 ≠ covered · alone ≠ dual · peer rag PRE `e66419d` **not co-signed** · peer post stub 仍 PENDING（不代签）

---

## 中文摘要

PROVE tip `666a3bf` 收据主张 Outcome **E-C**（emitter EXIT 8 · `MEETWISE_UC018_BACKFILL_HMAC_KEY` missing）。本审按 REQUEST 钉参独立复跑：wrapper 首行一致 · EXIT **8** · stderr `fail closed: …HMAC_KEY missing…` · 密钥 **ABSENT** · 未读 `.env*` · prove **未启动** · 未写 `PERF-LOAD-LIVE-AJ.json` · `PERF-LOAD.json` sha 不变且 `:28-29` 仍 `prior-docker-inspect`/`liveObservation=false` · backlog `:34` **CONDITION OPEN**。C1–C4 自 PRE `e8b8115` carry 成立。**≠ E-A** · Ban invent liveObservation · Ban covered flip · Ban 假关 CONDITION。peer rag PRE `e66419d` 核实存在、**不代签**。alone ≠ dual · EXIT0 ≠ covered。

## Verdict

**PASS**（Outcome E-C evidence matches REQUEST · CONDITION stays OPEN · C1–C4 hold · no covered flip · no fake close · no invent liveObservation）

---

*POST-PROVE · mw-e2e-ha · Line AJ · C-IMAGE-DIGEST live residual · E-C · @666a3bf · CONDITION OPEN · Ban invent liveObservation · Ban covered flip · Ban fake-close · alone ≠ dual · STOP*
