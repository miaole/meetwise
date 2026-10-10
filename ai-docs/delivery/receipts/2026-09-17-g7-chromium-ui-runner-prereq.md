# Receipt — G7 chromium / UI runner prereq · install + minimal verify

**Date**: 2026-09-17 ~00:01 PT  
**Authority**: meetwise authorize after pre-exec dual PASS  
  - `reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-e2e-ha.md` (pass · docs gate only)  
  - `reviews/2026-09-16-g7-chromium-ui-runner-prereq-mw-rag-route.md` (pass · docs gate only)  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ UI green** · **Key set ≠ UI green** · **install ≠ UI green** · **R5 SEPARATE** · **no invent Key** · **no Live suite this knife**

## CMD+EXIT

| # | CMD | EXIT | Honest read |
|---|-----|------|-------------|
| 1 | `pnpm -C apps/web exec playwright install chromium` | **0** | Chromium (Playwright v1228 / Chrome for Testing 149.0.7827.55) + ffmpeg + chromium-headless-shell downloaded to `~/.cache/ms-playwright/` · **install ≠ UI green ≠ G6/R5/suite/HA** |
| 2 | `pnpm -C apps/web exec playwright --version` | **0** | `Version 1.61.1` · runner CLI present |
| 3 | `pnpm -C apps/web exec node -e` (chromium.launch headless smoke via `@playwright/test`) | **0** | `chromium_launch_smoke_ok executable_present=1` · **runner can start** · **≠** `e2e:ui:isolated` green · **≠** suite/G6/R5/HA |
| 4 | `pnpm e2e:ui:isolated` | **`not_run:this_knife`** | Full Live UI suite **not** required by authorize · deferred · Key/Live honesty retained from A′ |

## Notes

- Root `pnpm exec playwright …` fails (`Command "playwright" not found`) — Playwright lives under `apps/web` (`@playwright/test@1.61.1`). Sanctioned equivalent: `pnpm -C apps/web exec playwright …`.
- Harness planned string was `pnpm exec playwright install chromium` (or project-sanctioned equivalent) — this receipt used the sanctioned `apps/web` path.
- **Do NOT** rewrite Live honesty_red Key-set to green.
- R5 pgvector-legacy remains **SEPARATE** open.
- G6 still OPEN.

## Artifact paths

- `.tmp/g7-chromium-ui-runner-prereq-20260917/install.log`
- `.tmp/g7-chromium-ui-runner-prereq-20260917/verify-version.log`
- `.tmp/g7-chromium-ui-runner-prereq-20260917/verify-launch.log`
- `.tmp/g7-chromium-ui-runner-prereq-20260917/browser-cache-ls.txt`

---

## Post-prove dual close（2026-09-17 ~00:05 PT）

**Status**: **`post_prove_dual_pass`**（runner-prereq honesty only）  
**Reviews**: `reviews/2026-09-17-g7-chromium-ui-runner-prereq-post-prove-mw-e2e-ha.md` + `…-mw-rag-route.md` · **BOTH PASS**  
**Expert independent**: `--version` EXIT=**0** · launch smoke EXIT=**0** · Live `e2e:ui:isolated` still **`not_run:this_knife`**  
**Pins retained**: install/start ≠ suite/G6/R5/UI green · A′ honesty_red retained · releaseEvidence=false · sole 恰 5 · R5 SEPARATE  
**Next**: `g7-ui-live-rerun-after-chromium.*` · **`REQUEST-ready / not_run:pre_dual`**

*Receipt addendum · CR post_prove_dual_pass · 2026-09-17 ~00:05 PT · ≠ UI green*
