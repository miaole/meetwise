# P3 — Direct Key-gate probe for `e2e:isolated`（Line AD · C-MO-AD-3 / AUTHORIZE cond. 3 · supplemental · NOT a trio re-run）

**Why**: `pnpm e2e:isolated` withholds the child's stderr（`scripts/run-e2e-isolated.mjs:1916-1917`）, so its EXIT 1 alone cannot prove the FAIL class. This probe runs the wrapper's exact child path directly, keys stripped, under the same session wrapper, so the `E2E_FAILURE` line is visible. **Ban inferring class from EXIT alone.**
**HEAD**: `880f14408dda9a9cb03737b811b6005d94c3a2dc` · keys stripped · no `.env*` on disk · Ban fake `MODEL_API_KEY` · Ban editing `run-e2e*.mjs`
**Scope note**: no isolated PG is started here; the Key gate（`run-e2e.mjs:43`）precedes every DB/stack step（lines 1–42 only build env, optional `.env` load, fake-flag checks）, so the class observed is the class the wrapper's child hits after DB/migrate in the trio run.

## PROBE-A — runner direct（as named in C-MO-AD-3）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL E2E_ISOLATED=1 node scripts/run-e2e.mjs` |
| Start / End | 2026-10-06 13:07:44 CST / 13:07:44 CST |
| EXIT | **1** |

```
E2EFailure: E2E_FAILURE class=provider code=live_provider_key_missing
    at tagE2EFailure (file:///workspace/meetwise-lineAD/e2e/helpers/failure-class.mjs:226:17)
    at file:///workspace/meetwise-lineAD/scripts/run-e2e.mjs:43:52
  e2eFailure: { class: 'provider', code: 'live_provider_key_missing' }
```

## PROBE-B — exact wrapper child command（`runFullE2E('pnpm', ['e2e:prove'])` @ `run-e2e-isolated.mjs:2162`）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL E2E_ISOLATED=1 pnpm e2e:prove` |
| Start / End | 2026-10-06 13:07:44 CST / 13:07:45 CST |
| EXIT | **1** |

```
> meetwise@0.1.0 e2e:prove /workspace/meetwise-lineAD
> node scripts/run-e2e.mjs
E2EFailure: E2E_FAILURE class=provider code=live_provider_key_missing
    at file:///workspace/meetwise-lineAD/scripts/run-e2e.mjs:43:52
  e2eFailure: { class: 'provider', code: 'live_provider_key_missing' }
 ELIFECYCLE  Command failed with exit code 1.
```

## Ruling

Static cite（`run-e2e.mjs:43` · blob `c655235cd3d7`）**+** direct probe stack frame `run-e2e.mjs:43:52` **+** `assertionCount=null` in the trio machine receipt ⇒ `e2e:isolated` FAIL class = **Key-blocked `provider/live_provider_key_missing`**. Business assertions **unreached / unknown（null）**. ≠ pass · ≠ 0 failures. Model calls 0.

*P3 direct probe · Line AD · 2026-10-06 13:07:44 CST · EXIT 1/1 · Key-blocked · STOP*
