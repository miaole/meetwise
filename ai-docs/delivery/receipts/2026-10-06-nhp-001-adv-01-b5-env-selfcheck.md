# B5 env self-check — NHP-001-ADV-01 · B-R2-1 verbatim receipt（Line AG · re-PRE3 · docs-gate only）

**Purpose**: Commit **verbatim** neg+bound baseline self-check records that classify EXIT1 as **`docker.sock`** or **`key`** (L0). This is **not** B5 regression green · **not** ADV prove · **not** Y/AB wash · Ban secrets (Key **presence-only** · values never printed).

**Captured**: 2026-10-06 · Asia/Shanghai (+08:00) · worktree `/workspace/meetwise-lineAG` · branch `line/ag-nhp-001-adv-repre3` · base tip `71ad2a7`（includes AE `3409862` · FAIL `a3364b4`/`71ad2a7`）
**Authority**: meetwise-core · Ban coding · Ban ADV prove · Ban live · Ban force-push
**Cites FAIL**: mw-rag-route Re-PRE2 FAIL `a3364b4` B-R2-1 · errata `71ad2a7` · REQUEST superseded `4e9f568` · peer e2e PASS `5875644` alone ≠ dual

## Session baseline（bare · non-docker gid）

```text
CMD: groups; id; ls -l /var/run/docker.sock; getent group docker
start: 2026-10-06T14:17:44+08:00
end:   2026-10-06T14:17:44+08:00
EXIT: 0（probe commands）

box orbitd
uid=1000(box) gid=1000(box) groups=1000(box),997(orbitd)
srw-rw---- 1 root docker 0 Oct  5 23:10 /var/run/docker.sock
docker:x:102:box                       # membership in /etc/group · current session gid=box → sock gap
```

```text
CMD: docker info
start: 2026-10-06T14:17:50+08:00
end:   2026-10-06T14:17:50+08:00
EXIT: 1
first failing / docker error first line:
ERROR: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.45/info": dial unix /var/run/docker.sock: connect: permission denied
reason label: docker.sock
```

```text
CMD: docker run --rm hello-world
  （locus mirror of scripts/run-e2e-isolated.mjs:2124 `docker run` · same sock · Ban product prove）
start: 2026-10-06T14:18:09+08:00
end:   2026-10-06T14:18:09+08:00
EXIT: 126
first failing / docker error first line:
docker: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Head "http://%2Fvar%2Frun%2Fdocker.sock/_ping": dial unix /var/run/docker.sock: connect: permission denied.
reason label: docker.sock
```

Key presence（presence-only · Ban print values · Ban fingerprint）:

| Scope | `MODEL_API_KEY` | `MODEL_BASE_URL` |
|-------|-----------------|------------------|
| Ambient box shell | **present** | **absent** |
| `env -u MODEL_API_KEY -u MODEL_BASE_URL …` | **absent** | **absent** |
| `./scripts/with-docker-session.sh pnpm …`（no `-u` strip · ambient inherited） | **present** | **absent** |

Under `sg docker`（via `with-docker-session.sh` · Ban chmod/sudo/usermod）: `uid=1000(box) gid=102(docker)` · `docker info` EXIT 0 · Server Version 26.1.5+dfsg1（mirror `receipts/g7-key-blocked-residual-honest/P3-gate-probes.md`）。

---

## Record 1 — neg bare · reason `docker.sock`

```text
CMD: env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove
  （cwd=/workspace/meetwise-lineAG · bare session · NO with-docker-session）
start: 2026-10-06T14:18:00+08:00
end:   2026-10-06T14:18:01+08:00
EXIT: 1
first failing assert line OR docker error first line:
  （pnpm/bounded-command thin log — no docker stderr surfaced; companion same-session docker error first line:）
ERROR: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.45/info": dial unix /var/run/docker.sock: connect: permission denied
  （runner locus: scripts/run-e2e-isolated.mjs:2124 `docker run` · :2134 `docker port` — sock connect fails before PG up）
thin log excerpt (verbatim):
> meetwise@0.1.0 uc001:nhp-neg:prove /workspace/meetwise-lineAG
> node scripts/run-e2e-isolated.mjs uc001:nhp-neg:prove:raw
…
BoundedCommandError: bounded_command_exit_nonzero
…
 ELIFECYCLE  Command failed with exit code 1.
isolated receipt: .tmp/isolated-proof-receipts/2026-10-06T06-18-01-273Z-901041-e06b83c4-111c-4326-aa35-a34668758353.json · outcome=failed · exitCode=1 · durationMs≈thin
reason label: docker.sock
```

## Record 2 — bound bare · reason `docker.sock`

```text
CMD: env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-bound:prove
  （cwd=/workspace/meetwise-lineAG · bare session · NO with-docker-session）
start: 2026-10-06T14:18:08+08:00
end:   2026-10-06T14:18:09+08:00
EXIT: 1
first failing assert line OR docker error first line:
ERROR: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.45/info": dial unix /var/run/docker.sock: connect: permission denied
  （same bare-session companion · locus :2124/:2134）
thin log excerpt (verbatim):
> meetwise@0.1.0 uc001:nhp-bound:prove /workspace/meetwise-lineAG
> node scripts/run-e2e-isolated.mjs uc001:nhp-bound:prove:raw
…
BoundedCommandError: bounded_command_exit_nonzero
…
 ELIFECYCLE  Command failed with exit code 1.
isolated receipt: .tmp/isolated-proof-receipts/2026-10-06T06-18-09-209Z-901194-96b24aba-7aa2-4d19-ab90-29ee69384f29.json · outcome=failed · exitCode=1
reason label: docker.sock
```

## Record 3 — neg under with-docker-session · ambient Key · reason `key`

```text
CMD: ./scripts/with-docker-session.sh pnpm uc001:nhp-neg:prove
  （cwd=/workspace/meetwise-lineAG · deliberate ambient-Key scenario · NO env -u strip · Ban print Key value）
start: 2026-10-06T14:18:10+08:00
end:   2026-10-06T14:18:23+08:00
EXIT: 1
first failing assert line:
FAIL  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)
companion evidence line (presence-only):
EVIDENCE L0-ENV {"model_api_key_present_on_entry":true,"model_base_url_present_on_entry":false}
SUMMARY asserts=26 failed=1
session banner (verbatim):
with-docker-session: docker.sock permission gap in session; re-exec via sg docker (membership already in /etc/group; no grant/chmod/sudo)
L0 locus: apps/api/test/uc-e2e-001-nhp-neg.proof.ts:61-65（Key assert only · NOT docker.sock）
isolated receipt: .tmp/isolated-proof-receipts/2026-10-06T06-18-23-645Z-901387-19c9ffaf-9146-460e-bf8d-b61dbb595668.json · outcome=failed · exitCode=1
reason label: key
```

## Record 4 — bound under with-docker-session · ambient Key · reason `key`

```text
CMD: ./scripts/with-docker-session.sh pnpm uc001:nhp-bound:prove
  （cwd=/workspace/meetwise-lineAG · deliberate ambient-Key scenario · NO env -u strip · Ban print Key value）
start: 2026-10-06T14:18:29+08:00
end:   2026-10-06T14:18:42+08:00
EXIT: 1
first failing assert line:
FAIL  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)
companion evidence line (presence-only):
EVIDENCE L0-ENV {"model_api_key_present_on_entry":true,"model_base_url_present_on_entry":false}
SUMMARY asserts=17 failed=1
L0 locus: apps/api/test/uc-e2e-001-nhp-bound.proof.ts:56-60（Key assert only · NOT docker.sock）
isolated receipt: .tmp/isolated-proof-receipts/2026-10-06T06-18-42-078Z-902561-738ebd8c-70e5-4bb4-8a01-a6ebb36424bc.json · outcome=failed · exitCode=1
reason label: key
```

---

## Classification（two independent labels · Ban merge）

| Label | Meaning | Observed in this receipt |
|-------|---------|--------------------------|
| **`env-blocked(docker.sock)`** | Runner cannot talk to docker daemon sock → fail at `run-e2e-isolated.mjs:2124` (`docker run`) / `:2134` (`docker port`) · **not** L0 | Records 1–2 + bare `docker info` / `docker run` |
| **`L0-guard(key)`** | Proof entry assert: `MODEL_API_KEY` must be absent · Key present → EXIT1 · **L0 = Key assert only**（neg `:61-65` / bound `:56-60`） | Records 3–4 |

**Reading**: These EXIT1s are **env-blocked / L0-guard ≠ proof regression evidence**. **B5 未满足 → ADV ≠ EXIT0**. Authorized B5 still requires ENV-capable form:

`./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-{neg,bound}:prove` → EXIT0 · zero proof/receipt edits · Ban wash Y/AB.

Prior thin logs `/tmp/nhp-neg-prove.log` / `/tmp/nhp-bound-prove.log`（~13:12 +08 from `meetwise-lineAG-fix`）and isolated receipts `05-12-57*` / `05-12-58*` lacked docker first line — **superseded by this fresh capture**（honest · no invention）.

## Non-claims

Not B5 green · not ADV prove · not covered · not Y/AB wash · not live · not suite green · Key values never printed · Ban chmod/sudo sock · Ban retry-to-green.

*Receipt · B-R2-1 · NHP-001-ADV-01 · Line AG · 2026-10-06 · reason tags docker.sock + key · STOP*
