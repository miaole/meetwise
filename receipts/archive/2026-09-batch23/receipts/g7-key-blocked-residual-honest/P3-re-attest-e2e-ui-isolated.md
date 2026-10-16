# P3 — Re-attest ×1 · `pnpm e2e:ui:isolated`（Line AD · Branch B′ · attempt 1 of 1 · Ban retry-to-green）

**Status**: **honesty_red** · EXIT **1** · FAIL class = **Key-blocked**（`provider` / `live_provider_key_missing`）· chromium present ≠ UI green · Playwright cases **not_run**
**Authority**: Line AD · REQUEST `f32f56d` · PRE dual BOTH PASS（`f215438` + `2d422c1`）· coordinator AUTHORIZE · Ban self-nail
**Code SHA（execution HEAD）**: `880f14408dda9a9cb03737b811b6005d94c3a2dc`（no Line AD code change）
**package.json @ exec tip**: `e2e:ui:isolated` **:261** → `node scripts/run-e2e-isolated.mjs e2e:ui`

## CMD + EXIT（恰一次）

| Field | Value |
|-------|-------|
| CMD | `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm e2e:ui:isolated` |
| Start | **2026-10-06 13:05:53 CST** |
| End | **2026-10-06 13:06:03 CST** |
| Shell EXIT | **1** |
| Attempts | **1** |

## Evidence（stdout/stderr verbatim excerpt — UI path does not withhold stderr）

```
E2E_POSTGRES_READY label=boot consecutive=3 attempt=4
E2E isolated PostgreSQL: meetwise-e2e-800653-1791263154203 on 127.0.0.1:32830
migrations: applied=136 skipped=0 ...
E2E_POSTGRES_READY label=post-migrate consecutive=3 attempt=3
E2E_POSTGRES_READY label=pre-prove consecutive=3 attempt=3
> meetwise@0.1.0 e2e:ui /workspace/meetwise-lineAD
> node scripts/run-e2e-ui.mjs
E2EFailure: E2E_FAILURE class=provider code=live_provider_key_missing
    at tagE2EFailure (file:///workspace/meetwise-lineAD/e2e/helpers/failure-class.mjs:226:17)
    at file:///workspace/meetwise-lineAD/scripts/run-e2e-ui.mjs:48:52
  e2eFailure: { class: 'provider', code: 'live_provider_key_missing' }
ISOLATED_POSTGRES_OUTPUT_WITHHELD container=meetwise-e2e-800653-1791263154203 state_bytes=218 logs_bytes=1659
 ELIFECYCLE  Command failed with exit code 1.
```

Gate source: `scripts/run-e2e-ui.mjs:48`（blob `aa86fb3f4219`）— matches stack frame `run-e2e-ui.mjs:48:52`.

**FAIL class**: **Key-blocked** · env-gap crossed · business assertions **unreached（unknown / null）** · ≠ pass.

Model calls **0** · `actualSpendCny=null` · R5-MARKED-RED pgvector-legacy fixture disclosure retained.

*P3 · Line AD · `pnpm e2e:ui:isolated` · 2026-10-06 13:05:53–13:06:03 CST · EXIT 1 · HEAD 880f144 · Key-blocked · STOP*
