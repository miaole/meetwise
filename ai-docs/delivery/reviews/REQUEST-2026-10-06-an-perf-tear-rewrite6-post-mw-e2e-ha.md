# POST-PROVE · **AN-PERF-TEAR ×6 · C-PERF-TEARDOWN** · mw-e2e-ha（半签 · Ban nail · alone ≠ dual）

**Verdict**: **PASS**（单方 post-prove · 证据诚实 · ×6 scorer 在 CODE 正确 · 矩阵与 claim 一致 · **≠** nail · **≠** 关 CONDITION · **≠** covered · **≠** HA）
**时间**: 2026-10-06 23:21 +08:00（Asia/Shanghai）
**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · Ban self-nail）
**PROVE_SHA**: `85b92613db75804b2cc4e1b2e8fea7a35786ce17`（`85b9261` · docs(receipt) tip · on `origin/feat/mysql-schema-skeleton`）
**CODE_SHA**: `eae9fed1c81edf9231f7b3372c997f5501871c1c`（`eae9fed` · analyze.py ×6 J-2 + sg docker + foreign_emit · lineage `7059d1f` → `c6b613d` → `eae9fed` · **P-HOLD · 无产品码**）
**REQUEST**: `f76fcff266369cec1f1d808f5be7324fbc4e0c61`（`f76fcff` rewrite ×6）
**PRE BOTH PASS**: mw-e2e-ha Re-PRE6 `bb2e866a4aaaf369f65602de582ce37e61a67a78` · mw-rag-route Re-PRE6 `a752ffcd532e3f1dc653c52163960922826ff409`
**Receipt**: `ai-docs/delivery/receipts/2026-10-06-an-perf-tear-c-perf-teardown-prove/`（README + `summary.json` + `margin.json` + `attempts/*` + `harness-tools/analyze.py`）
**Peer POST @PROVE `85b9261`**: **尚未落仓**（审时无 `REQUEST-2026-10-06-an-perf-tear-rewrite6-post-mw-rag-route.md` / 无 peer POST commit @85b9261）· peer PRE `a752ffc` **仅引用、不代签** · alone ≠ dual
**Own prior**: POST PASS `1d9d3ac` @af9664a · FAIL peer `4803616` —— **history not dual for this prove**（×5 谓词下诚实；本审对 ×6 @85b9261 全新独立复核 · Ban wash af9664a）
**Tip mapping**: PROVE tip `85b9261` = **docs-only receipt** atop CODE `eae9fed`（`git diff --quiet f76fcff 85b9261 -- scripts packages apps package.json pnpm-lock.yaml` EXIT 0 · **零**产品码）

## Hard pins（frozen · 本审不改）

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · backlog `gap-bug-backlog.md:35` **C-PERF-TEARDOWN CONDITION OPEN** · Ban covered flip · Ban invent covered from EXIT0 · Ban wash attempt1 @ `b29c191` · Ban wash `af9664a`（×5 诚实 FAIL 历史）· HOLD AN-CIMG-EA · NO new knives · QUOTA WIND-DOWN

## 0. SHA / 顺序 / P-HOLD

| Check | Result |
|---|---|
| `git rev-parse` PROVE / CODE / REQUEST / PRE×2 | `85b9261…` / `eae9fed…` / `f76fcff…` / `bb2e866…`+`a752ffc…` 全部可解析 · tip 祖先链完整 |
| CODE lineage | `7059d1f`（×6 J-2 scorer）→ `c6b613d`（sg docker）→ `eae9fed`（foreign_emit）→ prove `85b9261` |
| CODE **before** prove | `eae9fed` 23:06:19 +08 → prove window 23:06:19→23:14:37 +08（README）· contaminated @`c6b613d` archived `.tmp/…` **not** evidence |
| `git diff --quiet ac03f30 85b9261 -- packages/db/src/principal.ts` | EXIT **0** · **P-HOLD**：`principal.ts` 未触 |
| `git diff --quiet f76fcff 85b9261 -- packages/db/src/principal.ts` | EXIT **0** |
| Product on PROVE tip | docs/receipt + harness-tools only · Ban coding product 本审遵守 |

## 1. ×6 scorer CODE verify（MUST · 对抗核）

读 `harness-tools/analyze.py` @`7059d1f` diff + tip @`eae9fed`（同文件于 prove tip）。

| 要求 | 结论 | 锚 |
|---|---|---|
| kill(9) BEFORE first error (T-k) | ✓ | `Tk = t_kill is not None and errt is not None and t_kill < errt` · `W_DIE, W_DESTROY = 500, 2000` |
| die≤500ms after kill · destroy≤2000ms after die | ✓ | `Td = … t_kill < t_die <= t_kill + W_DIE` · `Tx = … t_die < t_destroy <= t_die + W_DESTROY` |
| die/destroy **MAY** follow first error | ✓ | 注释明文 · 分类不再要求 die/destroy ∈ `before` · C-POST `J2_old_all_before_error=false` 而仍 L3-sim PASS |
| marks `J2_KILL_NOT_BEFORE_ERROR` / `J2_POSTKILL_WINDOW_EXCEEDED` | ✓ | C-POST gate：`if not Tk → J2_KILL_NOT_BEFORE_ERROR` · `elif not postkill_ok → J2_POSTKILL_WINDOW_EXCEEDED` |
| 旧 all-before-error 谓词 **DELETED** as gate | ✓ | 删除 `L3-sim-temporal-mismatch(die/destroy after first error)` 操作性分支 · 仅留 `obs['J2_old_all_before_error']` **诊断**（非门控） |
| foreign_emit ignores pgrep/C-b smoke | ✓ | @`eae9fed`：跳过含 `pgrep`+pattern / `C-b_smoke` 的 cmdline |
| sg docker session re-exec | ✓ | @`c6b613d`：`attempt.sh`/`cell.sh`/`lcli.sh`/`r2.sh` MW_SG_DOCKER `sg docker` Path A |
| `A_FATAL_ON_ACTIVE` Ban drop | ✓ | analyze.py 仍 append `A_FATAL_ON_ACTIVE` / `NO_UNHANDLED` · 未换签 |

**对抗结论**：scorer **不是**旧 all-before-error；×6 窗口 + 新标记在 CODE 落地；C-POST 在 die/destroy 晚于首错时仍可达 L3-sim（与 mission / REQUEST `f76fcff` 一致）。

## 2. 实现方矩阵 — 对抗核验

| Cell | Claim | 本审核（`summary.json` + `attempts/*/verdict.json`） | 读法 |
|---|---|---|---|
| **PC** 3/3 | EXIT0 · 0 Unhandled · 0 dpe | PC-1..3 `pass_=true exit=0 unh=0 dpe=0` j2=OUT | **PASS 诚实** |
| **A-MUT** FAIL×3 diagnostic | `A_FATAL_ON_ACTIVE` / AMUT-1 `NO_UNHANDLED` · non-gating · path unproven | AMUT-1 `fails=[NO_UNHANDLED]` unh=0 · AMUT-2/3 `fails=[A_FATAL_ON_ACTIVE]` unh=1 · **签名未 drop** | **诚实 diagnostic FAIL** · Ban wash 成绿 · **非** P-HOLD 门控格 |
| **A-POST** FAIL×3 diagnostic | 同 tag · 0 Unhandled · dpe CTU | APOST-1..3 `A_FATAL_ON_ACTIVE` · unh=0 · dpe=1 · msgs CTU | **诚实 diagnostic FAIL** · 0 Unhandled 守 P-HOLD |
| **B-MUT** 3/3 | Unhandled · dpe=0 · B-restart | BMUT pass_=true · unh=1 · dpe=0 · j2=B-restart(inject-initiated) | **PASS 诚实** |
| **B-POST** 3/3 | dpe≥1 · 0 Unhandled · U_B=79 | BPOST pass_=true · unh=0 · dpe 7/17/2 · marker ub=79 · margin `U_B=79` `L_cli=21` | **PASS 诚实** |
| **C-MUT** 3/3 L3-sim | Unhandled BoundPool · s29 · ×6 windows | CMUT pass_=true · j2=L3-sim · Tk/Td/Tx all true · kill→die 243/215/198 ≤500 · die→destroy 543/482/513 ≤2000 | **PASS 诚实** |
| **C-POST** 3/3 L3-sim | kill-before-error · die≤500 · destroy≤2000 · die/destroy after err OK | CPOST-1..3 pass_=true fails=[] j2=L3-sim · Tk=Td=Tx=true · kill→die **185/198/210** ≤500 · die→destroy **465/462/450** ≤2000 · cseq kill9=−4 · die/destroy **after** err · `J2_old_all_before_error=false` · s29 · dpe≥1 · unh=0 | **PASS 诚实 under ×6** · Ban 用 ×5 谓词重判为 FAIL |
| **R1/R2/R3** EXIT0 | R2 **11/11** | R1 exit=0 · R2 `R2_EXIT=0` + 11×PASS · proof.ts **11** `A(` · R3 EXIT0 | EXIT0 ≠ covered |

**POST injects Unhandled**：APOST+BPOST+CPOST+PC `unh` sum=**0** → **P-HOLD 零 Unhandled 成立**（A 诊断 FAIL 不否定）。

**Ban wash `af9664a`**：旧 tip 在 ×5 all-before-error 下 C-POST FAIL×3 为诚实历史；本 prove 在 ×6 下 C-POST 3/3 · **不得**回溯洗绿 `af9664a`。

## 3. 本审 CMD+EXIT（独立执行 vs 引用）

### 3a. 本审独立执行

| CMD | EXIT | 笔记 |
|---|---|---|
| `./scripts/with-docker-session.sh docker version --format '…'` | **0** | `Server.Version=26.1.5+dfsg1 Client.Version=26.1.5+dfsg1` · C-c 与 `margin.json` 同串 |
| `./scripts/with-docker-session.sh` · events + `kill -TERM` + wait ×2 | **0** | `events_kill_exit=0 events_wait=143` · `procs_kill_exit=0 procs_wait=143` · `C-b_smoke_ok=1` |
| 隔离 PG + `pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts` | **0** | **11 PASS** · R2 独立 · ≠ 12/12 |

### 3b. 未复跑全矩阵（QUOTA WIND-DOWN · 披露）

**未**独立重跑 22× `pnpm uc018:perf-load:prove` 全格。PC / A / B / C / R1 格结果 = **对抗核验实现方收据工件**（`summary.json` + 各 `verdict.json` / `events.jsonl` / `prove.log` / `aux.txt`），**非**本审 docker 复现全矩阵。Primary implementer CMD（收据）：`./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove` · 窗口 23:06:19→23:14:37 +08。

## 4. 对抗裁决

1. **×6 scorer in CODE**：正确 · 旧 all-before-error 已删门控 · 新标记落地 · foreign_emit / sg docker 到位。
2. **C-POST 3/3 L3-sim**：时序落在 ×6 窗口内 · die/destroy 晚于首错仍 PASS · 与 claim「185–210 / 450–465」一致 · **非**假绿。
3. **A diagnostic**：FAIL×3 签名保留（含 AMUT-1 `NO_UNHANDLED`）· 非门控 · path unproven 诚实 · **Ban drop signatures**。
4. **P-HOLD**：`principal.ts` 未改 · 全 POST 0 Unhandled · 门控格 PC+B-MUT+B-POST+C-MUT+C-POST 3/3 · **成立**。
5. **Ban wash `af9664a`** · Ban 用本 tip 回溯改判 ×5 历史。
6. **Ban nail**（本审半签 · peer POST @85b9261 未到 · alone ≠ dual）· **Ban** 翻 CONDITION `:35` · **Ban** invent covered/HA。

## 5. 阻塞项

**无阻塞**（相对本 POST 诚实性审查）。

已 spot-check：×6 scorer CODE · C-POST L3-sim 时序 · P-HOLD / principal · A 诊断签名 · R2 独立 11/11 · C-c docker · C-b smoke · peer POST 缺席 · pins / CONDITION `:35` OPEN。

矩阵 A 诊断 FAIL 不构成本审阻塞（契约选 b）· CONDITION `:35` **仍 OPEN** · coveredCount=**8** · **Ban nail** 直至协调方 + POST BOTH（本审**不** AUTHORIZE nail）。

## 6. 结论

Prove @`85b9261` / CODE `eae9fed`（`7059d1f`→`c6b613d`→`eae9fed`）与 REQUEST `f76fcff` + PRE BOTH `bb2e866`/`a752ffc` 一致；×6 scorer 在 CODE 正确；实现方矩阵经对抗核验成立（含 A diagnostic FAIL non-gating + C-POST 3/3 L3-sim under ×6）；P-HOLD 与 principal 未触成立；无 wash / 无假绿 / 无产品码。本审 **PASS（单方）**。

Peer PRE `a752ffc` cited not co-signed · peer POST @85b9261 **not yet on origin** · alone ≠ dual · Ban nail · Ban invent covered/HA · Ban covered flip · Ban wash `af9664a` · CONDITION `:35` OPEN · NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · HOLD AN-CIMG-EA · Never Meridian · QUOTA WIND-DOWN · NO new knives · Ban coding product · cites own prior POST `1d9d3ac` / FAIL `4803616` as history not dual · 本审**不** AUTHORIZE nail。

Verdict: PASS
