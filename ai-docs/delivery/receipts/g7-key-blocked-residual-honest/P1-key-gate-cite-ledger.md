# P1 — Key-gate static cite ledger（Line AD · G7 Key-blocked residual honest · read-only cite ≠ execution ≠ pass）

> **Naming**: harness product labels R1–R5 are re-labelled **P1–P5** in all Line AD execution receipts. **P1-product ≠ gate R1**. Gate **R1 stays OPEN** (`r1Closed=false`). "P1 done" ≠ "R1 closed".

**Line**: AD · implementer mw-core / meetwise-core
**Execution tip (cite + re-attest HEAD)**: `880f14408dda9a9cb03737b811b6005d94c3a2dc`（`origin/feat/mysql-schema-skeleton` at fetch 2026-10-06 13:04 CST · porcelain clean）
**Harness base**: `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8` · **Line AC prove tip NAILED TO** `7c818c5fe2249cdac686aa2a0e58748b3c5dea68`（Ban rewrite of AC receipts）
**Code change by Line AD**: **none**（docs-only · Ban editing `run-e2e*.mjs`）

## 1. package.json trio wiring — re-pinned at execution tip `880f144`

| CMD | `package.json` line @ `880f144` | @ `416b6a5` | @ `7c818c5`（AC · historic） | Script body |
|-----|------------------------------|-------------|-----------------------------|-------------|
| `pnpm e2e:isolated` | **:260** | :260 | :251 | `node scripts/run-e2e-isolated.mjs e2e:prove` |
| `pnpm e2e:ui:isolated` | **:261** | :261 | :252 | `node scripts/run-e2e-isolated.mjs e2e:ui` |
| `pnpm verify:e2e-performance` | **:264** | :264 | :255 | `node scripts/run-e2e-performance-suite.mjs` |
| `pnpm e2e:prove`（iso child） | :258 | :258 | — | `node scripts/run-e2e.mjs` |
| `pnpm e2e:ui`（iso child） | :259 | :259 | — | `node scripts/run-e2e-ui.mjs` |

Line-drift note: AC receipts keep `:251/:252/:255`（NAILED TO `7c818c5`）; the `:260/:261/:264` lines are the current-tip pin only. Ban rewriting AC receipts with new line numbers.

## 2. Key gate source points（file:line + blob @ `880f144`）

| # | Point | file:line | Source（verbatim） | blob @ `880f144` | = @ `416b6a5` | = @ `7c818c5` |
|---|-------|-----------|--------------------|------------------|---------------|---------------|
| G1 | HTTP runner Key gate | `scripts/run-e2e.mjs:43` | `if (!String(env.MODEL_API_KEY ?? '').trim()) throw tagE2EFailure('provider', 'live_provider_key_missing');` | `c655235cd3d7` | yes | yes |
| G2 | UI runner Key gate | `scripts/run-e2e-ui.mjs:48` | same statement | `aa86fb3f4219` | yes | yes |
| G3 | Isolated wrapper spawns HTTP child | `scripts/run-e2e-isolated.mjs:2162` | `const result = await runFullE2E('pnpm', [target], env);` | `2e78877ca3f2` | yes | **no**（AC blob `9dcbbda3636f`; drift = target allowlist / receipt-source additions · Key gate path unchanged） |
| G4 | Isolated wrapper **withholds child stderr** | `scripts/run-e2e-isolated.mjs:1916-1917` | `// stderr（标准错误）永不转存或回显…` / `child.stderr.on('data', () => {});` | `2e78877ca3f2` | yes | — |
| G5 | Perf suite delegation | `scripts/run-e2e-performance-suite.mjs:18-20` | steps `web production build` → `schema migration/deploy evolution`（`migrate:prove`）→ `HTTP full E2E`（`pnpm e2e:isolated` → G3 → G1） | `7580fa02740e` | yes | yes |
| G6 | Failure tag formatter | `e2e/helpers/failure-class.mjs:226` | `new Error(formatE2EFailure(record))` → `E2E_FAILURE class=provider code=live_provider_key_missing` | `102d0f3ad34c` | yes | yes |
| G7w | Docker session wrapper（AC code `160c30c`） | `scripts/with-docker-session.sh` | `sg docker` re-exec only when membership pre-exists（Ban self-grant） | `0130fb466e57` | yes | yes |

**Consequence of G4**: `pnpm e2e:isolated` never prints the child's `E2E_FAILURE` line; EXIT alone does not prove class. Direct evidence is therefore supplied in `P3-direct-probe-e2e-isolated.md`（C-MO-AD-3）.

## 3. Guard proofs（static regex + behavior · cite only）

| Proof | file:line | What it pins | blob @ `880f144` |
|-------|-----------|--------------|------------------|
| `g6-e2e-iso-blocked:prove`（`package.json:274`） | `scripts/g6-e2e-iso-blocked.proof.mjs:84`（`KEY_GATE_RE`）· `:87-95` regex vs G1/G2 · `:241-267` behavior probe（Key unset → non-zero + `live_provider_key_missing`） | Key gate present in both runners; blocked ≠ green | `17bdee2aa2aa` |
| `uc001:live-blocked:prove`（`package.json:77`） | `scripts/uc-e2e-001-live-blocked.proof.mjs:55`（`KEY_GATE_RE`）· `:57-66` | same | `91edb1f835a0` |

### CITE prove run（keys stripped · ×1 each · supplemental · ≠ trio）

| CMD | Start (CST) | End (CST) | EXIT | Notes |
|-----|-------------|-----------|------|-------|
| `env -u MODEL_API_KEY -u MODEL_BASE_URL node scripts/g6-e2e-iso-blocked.proof.mjs` | 2026-10-06 13:07:52 | 13:07:53 | **0** | 61 PASS · 0 FAIL · `NOTE STATUS=blocked(无 Key) — LIVE HTTP/UI e2e:isolated family NOT hard-run; honesty pin only` |
| `env -u MODEL_API_KEY -u MODEL_BASE_URL node scripts/uc-e2e-001-live-blocked.proof.mjs` | 2026-10-06 13:07:53 | 13:07:53 | **0** | 22 PASS · 0 FAIL · `NOTE STATUS=blocked(无 Key) — live e2e:isolated / full.e2e NOT run; honesty pin only` |

**CITE_EXIT = 0 / 0** — guard-proof EXIT 0 **documents the gate is present and blocked**; it is **not** an e2e pass, **not** suite green, **not** trio green.

## 4. Blob anchors（`git hash-object` working tree = blob @ `880f144`）

All nine anchored files: working-tree `git hash-object` == `git rev-parse 880f144:<path>`（unchanged before/after Line AD; Line AD commits touch `ai-docs/` only）.

## Non-claims

Static cite ≠ execution ≠ pass · P1-product ≠ gate R1 · `g7SuiteGreen=false` · Key-blocked ≠ pass · Ban live · 0 model calls · `actualSpendCny=null`

*P1 · Line AD · Key-gate static cite ledger · exec tip 880f144 · STOP*
