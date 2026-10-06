# POST-PROVE · **AN-PERF-TEAR · C-PERF-TEARDOWN** · mw-e2e-ha（半签 · Ban nail · alone ≠ dual）

**Verdict**: **PASS**（单方 post-prove · 证据诚实 · **≠** nail · **≠** 关 CONDITION · **≠** covered · **≠** HA）
**时间**: 2026-10-06 22:18 +08:00（Asia/Shanghai）
**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail）
**PROVE_SHA**: `af9664a8910710ed63b396735918c8e1922e2d30`（`af9664a` · docs(receipt) tip · on `origin/feat/mysql-schema-skeleton`）
**CODE_SHA / COND_SHA**: `60de95822d9696576a0d47d13306dae1d1c91cee`（`60de958` · C-a/C-b/C-c 于 prove **前**落地 · **P-HOLD · 无产品码**）
**REQUEST**: `771ca8475cfbcb7efe9ce99137305da76305279b`（`771ca84` rewrite ×5）
**PRE BOTH PASS**: mw-rag-route Re-PRE5 `683d946` · mw-e2e-ha Re-PRE5 `fef9408`（本方）
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-an-perf-tear-c-perf-teardown-prove/`（README + `summary.json` + `margin.json` + `attempts/*`）
**Harness**: `ai-docs/delivery/harness/c-perf-teardown-product-rootcause-fix.md` @`60de958`
**Peer POST**: **尚未落仓**（审时 `ls` 无 `REQUEST-2026-10-06-an-perf-tear-post-*`）· peer PRE `683d946` **仅引用、不代签** · alone ≠ dual
**Tip mapping**: PROVE tip `af9664a` = **docs-only receipt** atop CODE `60de958`（`git diff --stat 60de958 af9664a` = 179 files under `ai-docs/delivery/receipts/...` + harness/slice/stub 触达 · **零** `scripts/`/`packages/`/`apps/`）

## Hard pins（frozen · 本审不改）

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · backlog `gap-bug-backlog.md:35` **C-PERF-TEARDOWN CONDITION OPEN** · Ban covered flip · Ban invent covered from EXIT0 · Ban wash attempt1 @ `b29c191` · HOLD AN-CIMG-EA · NO new knives · QUOTA WIND-DOWN last knife

## 0. SHA / 顺序 / P-HOLD

| Check | Result |
|---|---|
| `git rev-parse` PROVE / CODE / REQUEST / PRE×2 | `af9664a…` / `60de958…` / `771ca84…` / `683d946…`+`fef9408…` 全部可解析 · 均为 tip 祖先 |
| COND **before** prove | `60de958` 21:53:13 +08 → first PC-1 receipt start 21:56:27 +08（README 披露）· tip message 与 AUTHORIZE 段一致 |
| `git diff --quiet ac03f30 60de958 -- scripts packages apps package.json pnpm-lock.yaml` | EXIT **0** |
| `git diff --quiet ac03f30 af9664a -- packages/db/src/principal.ts` | EXIT **0** · **P-HOLD**：`principal.ts` 未触（仍 `f19ecba` 监听） |
| Product on PROVE tip | docs/receipt only · Ban coding 本审遵守 |

## 1. C-a / C-b / C-c（独立核 · 条件已于 `60de958` 落地）

| Cond | 本审 |
|---|---|
| **C-a** | BMUT-1 `unhandled-block.txt`：DatabaseError **own stack 0** `pg/lib/client.js` / `pg-pool` 帧；pg 帧**仅**在 `Emitted 'error' event on BoundPool instance at:`（首帧 `pg-pool/index.js:62` → `client.js:417`/`:428`）。AMUT-1 CTU 路径 Emitted-at 含 `client.js:417`/`:217`。若只扫 `err.stack` → 57P01 MUT 会假 `UNHANDLED_NOT_PG`。**C-a 落地成立**。 |
| **C-b** | 收据 `attempts/*/aux.txt`：**22/22** prove attempts `events_kill_exit=0` · `procs_kill_exit=0` · `events_wait=143` · `procs_wait=143`。本审独立 smoke（`with-docker-session.sh`）：`docker events` + pgrep 循环 · `kill -TERM` → **events_kill_exit=0 events_wait=143 · procs_kill_exit=0 procs_wait=143 · C-b_smoke_ok=1**。 |
| **C-c** | `margin.json`：`Server.Version=26.1.5+dfsg1` · `Client.Version=26.1.5+dfsg1` · `L_cli=18` · `U_B=84` · `BC_MARGIN_INFEASIBLE=false`。本审复算 `min(109,110−ceil(2·18/1.39))=84` ✓。独立 `docker version`：**同串** EXIT 0。 |

## 2. 实现方 EXIT 表 — 对抗核验（摘要）

| Cell | Claim | 本审核 | 读法 |
|---|---|---|---|
| **PC** 0/0/0 PASS | 3×EXIT0 · 0 Unhandled · 0 dpe | `summary.json` PC-1..3 `pass_=true exit=0 unh=0 dpe=0` · PC-1 prove.log `SUMMARY allPass=true` · `CMD=… EXIT=0` | **PASS 诚实** · Ban 借为产品关 |
| **A-MUT** 1/1/1 FAIL×3 `A_FATAL_ON_ACTIVE` | Unhandled+Client+Emitted-at pg · text=CTU · **无 57P01** · C2 race | AMUT-1..3：`fails=[A_FATAL_ON_ACTIVE]` · unh=1 · frames `client.js:417/217` · block **无** 57P01/administrator · text CTU | **钉死期望 FAIL**（harness C2）· **非** wash · **非** 假绿 · **非** 意外块（相对契约） |
| **A-POST** 1/1/1 FAIL×3 同 tag | dpe=1 CTU only · **0 Unhandled** · 同 race | APOST-1..3：unh=0 · dpe=1 · msgs 仅 CTU · **无** 57P01/`administrator command` · F2+`seedAbandonTargets` | **钉死期望 FAIL** · POST 零 Unhandled 与 P-HOLD 一致 |
| **B-MUT** 1/1/1 PASS | Unhandled Client\|BoundPool · dpe=0 · 57P01 文本 | BMUT：pass_=true · unh=1 · dpe=0 · BMUT-1 BoundPool:`pg-pool:62` + 57P01 code · BMUT-2 Client | **PASS 诚实** |
| **B-POST** 1/1/1 PASS · U_B=84 · L_cli=18 · INFEASIBLE=false | dpe≥1 · 0 Unhandled · F2∧无 `^PERF run3:`∧`seedAbandonTargets` | BPOST-1..3：perf3 行数=0 · seedAbandonTargets≥1 · unh=0 · dpe 19/1/12 · ub=84 in marker | **PASS 诚实** |
| **C-MUT** 1/1/1 PASS | Unhandled BoundPool · dpe=0 · state_bytes=29 | CMUT：pass_=true · unh=1 · BoundPool frames · s29=true · dpe=0 | **PASS 诚实**（j2 L3-sim-temporal-mismatch **非** C-MUT 判据 · 只录） |
| **C-POST** 1/1/1 FAIL×3 | EXIT1 · dpe≥1 · 0 Unhandled · s29 · **J-2 L3-sim 时序未满足**（kill 前于 first error · die/destroy 后于） | CPOST-1..3：pass=false · fail `J2_NOT_L3SIM(...)` · exit=1 · dpe 12/14/13 · unh=0 · s29=true · seq kill9 −5/−2/−4 · die137 +175/+213/+209 · destroy +636/+694/+669 | **诚实 FAIL · 无事后重解释** · 产品签名已满但 J-2 字面时序未过 → 计入 FAIL |
| **R1/R2/R3** EXIT0 | R2=**11/11** not 12/12 | R1 exit=0 · R2 receipt `R2_EXIT=0` + 11×`PASS` · proof.ts **11** `A(` · **disclose harness §6「12/12」历史误计** · 本审独立 R2：`pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts` **EXIT=0 · 11 PASS**（隔离 `meetwise-e2e-r2pool-ind-…`）· R3 `R3_EXIT=0` | EXIT0 ≠ covered · Ban invent covered |

**POST injects Unhandled**：APOST+BPOST+CPOST+PC+R1 prove.log **0** 含 `Unhandled 'error' event` · summary POST/PC/R1 unh sum=**0** → **P-HOLD 触发条件未满足（正确）**。

## 3. 本审 CMD+EXIT（独立执行 vs 引用）

### 3a. 本审独立执行

| CMD | EXIT | 笔记 |
|---|---|---|
| `./scripts/with-docker-session.sh docker version --format 'Server.Version={{.Server.Version}} Client.Version={{.Client.Version}}'` | **0** | `26.1.5+dfsg1` ×2 · C-c |
| `./scripts/with-docker-session.sh` · `docker events` + pgrep 循环 · `kill -TERM` ×2 · `wait` | **0** | kill=0/0 · wait=143/143 · C-b smoke |
| `./scripts/with-docker-session.sh` · 隔离 PG + `pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts` | **0** | **11 PASS** · R2 独立 · ≠ 12/12 误计 |

### 3b. 未复跑全矩阵（QUOTA WIND-DOWN · 披露）

**未**独立重跑 22× `pnpm uc018:perf-load:prove` 全格。PC / A-MUT / A-POST / B-MUT / B-POST / C-MUT / C-POST / R1 格结果 = **对抗核验实现方收据工件**（`summary.json` + 各 `prove.log` / `unhandled-block.txt` / `verdict.json` / `aux.txt` / `events.jsonl`），**非**本审 docker 复现。Primary implementer CMD（收据）：`./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` · 窗口 21:56:21→22:08:40 +08。

## 4. 对抗裁决

1. **FAIL 格 vs REQUEST**：A-MUT/A-POST = harness 钉死 `A_FATAL_ON_ACTIVE`（C2 · 无 57P01）· C-POST = 严格 J-2 L3-sim 时序未过 · **诚实 FAIL · 非 wash · 非假绿**。
2. **A_FATAL_ON_ACTIVE + C2**：契约层**期望 FAIL**（计入 3×）· **非**审查阻塞（相对「证明写错/洗绿」）· **仍**阻止「全格达标 / covered / 关 CONDITION」宣称。
3. **C-POST**：产品判据（EXIT1 · dpe≥1 · 0 Unhandled · s29）满足但仍因 J-2 字面 FAIL · **无 reinterpret**。
4. **P-HOLD**：`principal.ts` 未改 · POST 0 Unhandled · **成立**；**不得**宣称全格达标（A/C FAIL 在）。
5. **R2 11/11 vs 12/12**：harness 误计披露 · proof 11 断言 · **不** invent covered。
6. **Ban** 翻 CONDITION `:35` · **Ban** 从 EXIT0 格 invent covered · **Ban** nail（本审半签 · peer POST 未到 · alone ≠ dual）。

## 5. 阻塞项

**无阻塞**（相对本 POST 诚实性审查）。

矩阵 **未**全格达标（A-MUT / A-POST / C-POST FAIL×3）· CONDITION `:35` **仍 OPEN** · coveredCount=**8** · **Ban nail** 直至协调方 + POST BOTH（本审**不** AUTHORIZE nail）。

## 6. 结论

Prove @`af9664a` / CODE `60de958` 与 REQUEST `771ca84` + C-a/b/c 落地一致；实现方 EXIT 表经对抗核验成立；FAIL 格为钉死期望诚实 FAIL；P-HOLD 与 0 POST Unhandled 成立；R2 11/11 误计已披露。本审 **PASS（单方）**。

Peer PRE `683d946` cited not co-signed · peer POST 未到 · alone ≠ dual · Ban nail · Ban invent covered/HA · Ban covered flip · Ban wash · CONDITION `:35` OPEN · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · HOLD AN-CIMG-EA · Never Meridian · QUOTA WIND-DOWN · NO new knives · Ban coding product。

Verdict: PASS
