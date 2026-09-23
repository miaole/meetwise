# REQUEST — **HA D2 CI probe:multi workflow** · post-prove dual · `mw-rag-route`

**Verdict**: **PASS**  
**Expert**: `mw-rag-route`（domain: rag-route · **第二对抗域** · **本刀 ≠ RAG 产品面 flip**）  
**Date**: 2026-09-23 (~15:33–15:36 PT)  
**Tip / HEAD before this write（verified）**: `901541059db20ef9adaa2016947925fe254906c5` / tip `9015410` · branch `feat/mysql-schema-skeleton`  
**Prove pin match vs `9015410`**: **MATCH**（`git rev-parse HEAD` = `901541059db20ef9adaa2016947925fe254906c5`）· **未触发 BLOCK**  
**Chain（MUST · `git` verified）**: REQUEST `dad775f` / full `dad775f0261ad35f86dcbdf7affd01c9cb68ad9a` → pre-exec e2e-ha `10d2053` · pre-exec rag-route `4724ce3` → prove land `2186ad7` / full `2186ad7b46f22c06f620bbe0c08499be6392d6bb` → docs pin `984ffc5` / full `984ffc5d7fdc2cb3d260ad529638c4ebeb3f58ce` → pin HEAD record `9015410` · **all ancestors of HEAD** · **MATCH**  
**Pair path（named · ZERO peer · 未写 · 未读正文 · Ban signing for e2e-ha）**: `REQUEST-2026-09-23-ha-d2-ci-probe-multi-workflow-post-prove-mw-e2e-ha.md`  
**Knife**: `harness/ha-d2-ci-probe-multi-workflow.md` + slice + `.github/workflows/ha-probe-multi.yml` + prove `receipts/2026-09-23-ha-d2-ci-probe-multi-workflow-prove.md`  
**Harness status（live · 本专家未改）**: **`executed:awaiting_post_prove_dual`** · **Ban self-nail `post_prove_dual_pass`** · Dual PASS ≠ nail · Dual PASS ≠ HA/阶 D · Dual PASS ≠ next knife · alone≠dual  
**ZERO peer**: **confirmed** · 未写 peer e2e-ha · 未读 peer 正文 · Ban signing for e2e-ha · alone≠dual · Ban自批  
**This write**: **ONLY** this receipt · **未读 `.env*`** · Ban Meridian · Ban Cloud Agent · **未** ping mw-core · **未** authorize nail · **未**翻 harness Status

---

## 0. HEAD / prove pin gate

| Check | Result |
|-------|--------|
| Expected prove HEAD pin `9015410` / full `901541059db20ef9adaa2016947925fe254906c5` | **MATCH** |
| Branch `feat/mysql-schema-skeleton` | **MATCH** |
| Prove land `2186ad7` is ancestor of HEAD | **YES**（`merge-base --is-ancestor` EXIT=0） |
| Docs pin `984ffc5` is ancestor of HEAD | **YES** |
| REQUEST `dad775f` is ancestor of HEAD | **YES** |
| Pre-exec BOTH PASS tips `10d2053` / `4724ce3` | **present on ancestry** · retained |
| Mismatch prove pin → BLOCK | **未触发** |

---

## 1. Independent EXIT re-run（本专家自跑 · shell only · unread `.env*`）

**Authorize**: shell only · **未**读/cat 任何 `.env*` · **未**注入 secrets · 未翻产品面 flags。

### 1.1 CMD + EXIT 表（本机实测）

| # | CMD | EXIT（本机） | Expect | Honest read |
|---|-----|-------------|--------|-------------|
| 1 | `node -e 'require("js-yaml").load(require("fs").readFileSync(".github/workflows/ha-probe-multi.yml","utf8")); …'` | **0** | 0 | YAML_PARSE_OK · workflow 可解析 |
| 2 | `node -e '… scripts["ha:probe:multi"] …'` | **0** | 0 | SCRIPT_OK · `ha:probe:multi= node scripts/ha/probe.multi.mjs` |
| 3 | `actionlint` | **skip** | skip if missing | actionlint **not installed** · Ban invent green from skip |
| 4 | `pnpm ha:probe:multi -- --require-evidence` | **1** | 1 | **honesty SUCCESS** · `result: FAIL` · failReason=`local evidence seen but production topology/CI/review missing — refuse HA` · `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · **Ban wash EXIT=1 into green** |
| 5 | `pnpm ha:probe:multi -- --with-bring-up-stub --with-fault-inject` | **0** | 0（CI 清洁 runner 设计）· 本机可因污染非 0 | **本机 EXIT=0** · **honesty note：local leftover compose dual 污染 stub**（见 §1.2）· **≠** invent clean GHA stub green · **≠** 阶 D · **≠** production HA |
| 6 | live GHA workflow run | **not_run** | not_run | live artifact URL：**none** · harness/prove/`liveGhaRunUrl: null` · **Ban invent URL** |

**Gate**: prove pin MATCH + CMD1=**0** + CMD2=**0** + CMD4=**1**（honesty）+ pins HOLD + no invent GHA URL → **PASS 门**。CMD4 EXIT=**0** → **BLOCK（washed）** · **未触发**。CMD5 本机=**0** 但带 compose 污染诚实注记 · **禁止**洗成 阶 D / production HA。

### 1.2 CMD5 local pollution（诚实 · Ban invent 0 as clean）

本机实测时仍有 leftover compose dual：

- 容器：`meetwise-ha-dual-api-a` · `meetwise-ha-dual-api-b`（+ sole mysql/redis）
- stub bring-up livez A/B **200** · fault-inject：**`MEETWISE_HA_FAULT_AUTHORIZED` unset** → `PREREQ_GAP` / `REFUSED_NO_AUTH`（仍 EXIT=0 于 fault 子进程）
- post-fault：**A 仍 200**（expect down for stub fault）· probe 记 `FAIL livez A-post-fault` / `FAIL post-fault A down / B up`
- 总 EXIT 仍 **0** · result `DUAL_SHARED_PARTIAL` · `sharedOk=true` · `nestSessionOk=true` · **仍** `haStatus=NOT_HA` · `releaseEvidence=false`

**Expert**: 与 implementer「local leftover compose dual polluted stub; GHA clean runner designed」**对齐** · **不** invent EXIT≠0 · **不** invent 清洁 stub 绿 · **仍 Ban** CI stub = 阶 D / production HA · Local D2 workflow land ≠ 阶 D green。

### 1.3 Workflow YAML / honesty job（静态对抗）

| Check | Live | Expert |
|-------|------|--------|
| `on.workflow_dispatch` + `pull_request.paths` filter | **YES**（yml · scripts/ha · package.json） | **PASS** |
| secrets / `.env*` / dotenv load in workflow | **无** `secrets.` 表达式 · 无 env_file · 注释显式 Ban | **PASS** · unread `.env*` |
| Honesty job treats EXIT=1 as expected | `set +e` · `ec=$?` · `[ "$ec" -eq 1 ]` → `exit 0` · else error | **PASS** · EXIT=1 = honesty SUCCESS · Ban wash to pass |
| Artifact upload design | `actions/upload-artifact` name=`ha-probe-multi-receipt` · `liveGhaRunUrl: null` | **PASS** · design only · Ban invent live URL |
| Pins in job summary JSON | `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `ciStubEqualsLadderD=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` | **HOLD** |

---

## 2. Domain adjudication（rag-route · second adversarial）

### 2.1 RAG / product flags（OUT OF SCOPE · 不翻面）

| Flag | This knife | Expert |
|------|------------|--------|
| `gR45Closed` | **`true` retained** | **OUT OF SCOPE** · Ban flip · Ban wash into HA |
| `coveredCount` | **8 retained** | **OUT OF SCOPE** |
| `ms3EqualsR4Closed` | **`false` retained** | **HOLD** |
| eg1–eg6 / r4 / funnel | **retained** · 未触 | **OUT OF SCOPE** |
| route/metadata green from CI stub | **禁止伪造** | **HOLD** · stub CI ≠ metadata/route green |

### 2.2 Ban wash · prior tips → 阶 D / HA

| Wash vector | Live? | Expert |
|-------------|-------|--------|
| D1 `b72c7c4` / `65526ac` / `1f020fd` → 阶 D / production HA / `releaseEvidence=true` | **未出现** | **HOLD** · Local D1 done ≠ 阶 D |
| C3b `beaedc9` / `4da46d5` / `a32c071` → 阶 D | **未出现** | **HOLD** |
| C3+C4 `358a5cf` / `16e8379` → 阶 D | **未出现** | **HOLD** |
| G-R4-5 `6ded589` / `ba1b8aa` / `gR45Closed=true` → HA | **未出现** | **HOLD** · RAG OOS |
| Wash `--require-evidence` EXIT=1 into green | **未出现** · 本机 CMD4 **EXIT=1** | **HOLD** · **若 EXIT=0 → BLOCK** |
| Claim CI stub green / workflow land alone = 阶 D / production HA | **未出现** · harness+workflow+prove 显式 Ban | **HOLD** |
| Invent live GHA artifact URL | **未出现** · `liveGhaRunUrl=null` · not_run | **HOLD** |
| Dual PASS → nail / HA / 阶 D / next knife | **Ban** · 本专家不钉 | **HOLD** · alone≠dual |

### 2.3 Hard pins（must HOLD）

| Pin | Live | Expert |
|-----|------|--------|
| `haStatus=NOT_HA` | **YES**（CMD4/5 收据 + harness + workflow） | **HOLD** |
| `releaseEvidence=false` | **YES** | **HOLD** · Ban flip |
| `claimProductionHA=false` | **YES** | **HOLD** |
| 阶 C/D **STILL NOT GREEN** | **YES** · Local D1 / D2 workflow land ≠ 阶 D green | **HOLD** |
| CI stub ≠ 阶 D ≠ production HA | **YES** | **HOLD** |
| alone≠dual · Dual PASS ≠ nail · Dual PASS ≠ HA/阶 D · Dual PASS ≠ next knife | **pinned** | **HOLD** |
| Ban自批 · Ban Meridian · Ban Cloud Agent · unread `.env*` | **HOLD** | **HOLD** |

---

## 3. Harness / peer / nail discipline

| Check | Result |
|-------|--------|
| Harness Status | **`executed:awaiting_post_prove_dual`**（live 读 · **本专家未改 · 未翻** `post_prove_dual_pass`） |
| Self-nail / authorize nail | **NOT done** · Ban |
| Peer e2e-ha post-prove file | **ZERO authored** · 未写 · 未读正文 · Ban signing for e2e-ha |
| Commit scope | **ONLY** this receipt（见 commit 后确认） |
| mw-core ping | **none** |
| Ban Cloud Agent · Ban Meridian · Ban `.env*` | **HOLD** |

---

## 4. Blockers

**无 hard BLOCKER**（prove pin MATCH · CMD1=0 · CMD2=0 · CMD4=1 honesty · pins HOLD · no invent GHA URL · workflow honesty job OK）。

**备查（非洗红 · 非 BLOCK）**:
- CMD3 actionlint **skip**（未装）· Ban invent green
- CMD5 EXIT=0 **带** local leftover compose dual 污染诚实注记 · GHA 清洁 runner 设计路径仍成立 · **仍 Ban** CI stub = 阶 D
- live GHA **not_run** · artifact URL **none** · Ban invent
- Dual PASS ≠ nail · alone≠dual · harness **仍** `executed:awaiting_post_prove_dual`

---

## 5. Verdict

**PASS**（mw-rag-route · post-prove · 本侧）

- Prove HEAD pin **`9015410` MATCH**
- Independent EXIT：**0 / 0 / skip / 1 / 0(pollution-noted) / not_run**
- Honesty：CMD4 EXIT=**1** = SUCCESS · Ban wash into green
- Pins：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · 阶 C/D STILL NOT GREEN · CI stub ≠ 阶 D ≠ production HA
- Ban wash prior D1/C3b/C3+C4/G-R4-5 tips · Ban invent GHA URL · Ban CI stub = 阶 D
- RAG flags OUT OF SCOPE retained：`gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false`
- alone≠dual · Dual PASS ≠ nail · harness **left** `executed:awaiting_post_prove_dual` · no peer e2e-ha authored · unread `.env*` · Ban Meridian · Ban Cloud Agent

---

*Post-prove · mw-rag-route · HA D2 CI probe:multi workflow · 2026-09-23 (~15:36 PT) · Verdict PASS · tip before `9015410` · prove pin MATCH · EXIT 0/0/skip/1/0(pollution)/not_run · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · 阶 C/D STILL NOT GREEN · CI stub ≠ 阶 D · Ban wash EXIT=1 · Ban invent GHA URL · Ban self-nail · harness left awaiting_post_prove_dual · alone≠dual · STOP*
