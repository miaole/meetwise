# Harness — **G7 Path B honesty · trio FAIL 四分类 + Path B 排队清单**（Line G7B · docs REQUEST · **`executed:awaiting_post_prove_dual`** · ≠ suite green）

**Status**: **`executed:awaiting_post_prove_dual`**（G7B exec 落盘 2026-10-07 · PRE dual BOTH PASS：mw-model-op `bbf418ba` + mw-e2e-ha `c79219b6` @REQUEST `017a178d` ≡ mirror `7801750d`（4 文件 blob 级等同）· 分类产物 = REQUEST 自身（harness 未定义额外产物 → 仅推进 lifecycle 标记 · MOP03 `d5e6f7e6` 先例）· 零 coding · 零 prove 执行 · 零 trio 重跑 · 零 SSOT（nail 期才碰）· Q1–Q3 排队 ≠ 授权 · **Ban self-write `post_prove_dual_pass`** · Ban nail until POST BOTH + 协调方 · Ban live · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban fake green · Ban `g7SuiteGreen=true` · Ban washing Key-blocked as pass · Ban self-approve · alone ≠ dual）

> **Pre-exec-era status（historical · retained）**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban trio 重跑 · Ban live · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban fake green · Ban `g7SuiteGreen=true` · Ban washing Key-blocked as pass · Ban self-approve）

**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · **`g7SuiteGreen=false`** · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`d5e6f7e6`** / full `d5e6f7e63aa20ef3a4ec3f168a63c8f7feb4315d`（EXEC rebase 已落：REQUEST `7801750d` 同补丁自动 drop 落 tip · C-HA-1 base 重钉 · gate blob `c655235c`/`aa86fb3f` @tip 复核零漂移 · 被审基点 `4766d4fc` 保留为 review provenance · worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7b` · branch `line/g7b-path-b-honesty`）
**Knife**: **G7 Path B honesty 刀**（Line G7B · 协调方优先级 #4 (a)+(b)）——承接 Line AC `3922b48`（G7 env-gap **Path A** · trio EXIT 1/1/1 Key-blocked 诚实收据）与 Line AD 残余收据轨，把 trio 三条 CMD 的全部 FAIL case 逐个归入四类 **[Key-blocked | 真实产品缺陷 | 夹具/基建缺陷 | 环境缺口]**，把「Key-blocked」与「真实缺陷」两类彻底分开；并对各类开出 Path B 方案（修复排队 / 披露保持 / backlog 登记）。
**Gap / theme**: G7 trio **OPEN 1/1/1** · dominant FAIL = **Key-blocked** `provider/live_provider_key_missing` · business-assert **unreached → UNKNOWN（null）** · 本刀 **docs-only**：分类 + 排队清单，零产品改动，SSOT 留待 nail 期。
**Prior nails（只读 · 不改写）**:
- Line AC NAIL `3922b4859f034f07d43ba9f9b443ac3d29b7687e`（`docs(delivery): NAIL G7 env-gap Path A Line AC post_prove_dual_pass`）· prove tip **NAILED TO** `7c818c5` / `7c818c5fe2249cdac686aa2a0e58748b3c5dea68` · code `160c30c` / `160c30cac7a0a05106120949f337847b782647b7`（`scripts/with-docker-session.sh`）· receipts tip `5481d4d` · **PROVE_EXIT 1/1/1** Key-blocked · POST dual mw-e2e-ha `fdab68f` + mw-model-op `6f0d015` BOTH PASS。
- Line AD（residual receipts）· exec HEAD `880f144` · re-attest ×1 EXIT **1/1/1** Key-blocked · `receipts/g7-key-blocked-residual-honest/P2-residual-classification.md`（class 无漂移 · `assertionCount=null` 显式登记）。
**Experts**: `mw-model-op` + `mw-e2e-ha`（PRE dual BOTH PASS · exec 落盘 awaiting POST dual · Ban self-approve · alone ≠ dual · Ban nail）
**Authority**: meetwise — docs REQUEST only · Ban SSOT flip · Ban invent covered · Ban suite green claim · Ban self-nail

---

## 1. 现状只读陈述（零改写 · 引证附 file:line）

Line AC Path A（`sg docker` / `scripts/with-docker-session.sh` 激活**既有** docker 组 · Ban sudo/chmod/usermod/setfacl）把 Line U env-gap **清除于本 host/session class**（`receipts/g7-env-gap-honest-fix/e2e-isolated.md:27-39`：session 前后 gate 探针 · PG boot · migrate applied=135 · post-migrate/pre-prove 双 ready）；trio 各 ×1 越过 DB/migrate 门后全部撞 **Key-blocked fail-closed**。Line AD B′ re-attest ×1 @`880f144` 确认 class 无漂移（P2 表）。

**Wiring @ 当 tip `4766d4fc`（实测）**：`e2e:isolated` **`:260`** → `run-e2e-isolated.mjs e2e:prove` → `run-e2e.mjs`；`e2e:ui:isolated` **`:261`** → `run-e2e-isolated.mjs e2e:ui` → `run-e2e-ui.mjs`；`verify:e2e-performance` **`:264`** → `run-e2e-performance-suite.mjs`。（Line AC prove tip 钉 `:251/:252/:255`；`416b6a5`/`4766d4fc` 为 `:260/:261/:264` —— 行号漂移如实登记，**Ban** 用新行号改写旧收据。）

**Key gate 源码点 @ `4766d4fc`（read-only · blob 锚）**：
- `scripts/run-e2e.mjs:43` `if (!String(env.MODEL_API_KEY ?? '').trim()) throw tagE2EFailure('provider', 'live_provider_key_missing');`（blob `c655235cd3d747a4237aa137cc74cd4905aa872c`）
- `scripts/run-e2e-ui.mjs:48` 同 code（blob `aa86fb3f421966d75ff73393b8360aa29f4b6c4c`）
- `scripts/run-e2e.mjs:42` `fake_service_mode_forbidden` 守门（Ban 假 provider/假 Key 占位过门的**代码级**依据）
- 守护 proof：`scripts/g6-e2e-iso-blocked.proof.mjs:84` · `scripts/uc-e2e-001-live-blocked.proof.mjs:55`（KEY_GATE_RE 正则钉死 gate 行；AD P1 账 `receipts/g7-key-blocked-residual-honest/P1-key-gate-cite-ledger.md`）

**ERRATUM（retained · 原文措辞）**: FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · **Ban** 写 shorthand `quota-403=82981ff` · **Ban** 写 `b1d7b22` @ 09-23 for that removal。

---

## 2. 分类矩阵（核心产出 · 四类逐 case · 引 Path A 收据原文）

**分类口径**：
- **Key-blocked** = `provider/live_provider_key_missing` 或依赖 live provider 供给（Key / 配额 / capability key）而 fail-closed 的 case/步骤。
- **真实产品缺陷** = 有**已执行业务 case** 的失败证据、且失败根因在产品代码（本刀：**0 确认**——`assertionCount=null`，业务 case 未执行；unknown ≠ 0 · Ban 写「0 失败」或「全绿」）。
- **夹具/基建缺陷** = 测试夹具 / isolation 栈 / runner 基建自身缺口（不依赖 Key 即可定位与修复）。
- **环境缺口** = host/session 环境类（docker.sock、chromium 等）——Line U docker.sock 已 @AC Path A 清除；本刀盘存 **0 open**。

### 2.1 Path A 绑定现状（`receipts/g7-env-gap-honest-fix/` · prove tip `7c818c5` · EXIT 1/1/1）

| # | CMD（@`4766d4fc`） | FAIL case / 步骤 | 分类 | 收据原文引证 | 残余读法 |
|---|--------------------|------------------|------|--------------|----------|
| C1 | `pnpm e2e:isolated`（`:260`） | 顶层 Key gate throw（case ledger 未启动） | **Key-blocked** | `e2e-isolated.md:43`「`E2E_FAILURE class=provider code=live_provider_key_missing` when `MODEL_API_KEY` unset（source `scripts/run-e2e.mjs:43`）」· `:44` machine receipt `outcome=failed` `assertionCount=null` | 业务 case 全部 **not_run** · business-assert **unknown(null)** · ≠ pass |
| C2 | `pnpm e2e:ui:isolated`（`:261`） | 顶层 Key gate throw（Playwright launch **not reached**） | **Key-blocked** | `e2e-ui-isolated.md:36-40` stderr 原文「`E2EFailure: E2E_FAILURE class=provider code=live_provider_key_missing` · at tagE2EFailure (…/failure-class.mjs:226:17) · at …/run-e2e-ui.mjs:48:52」· `:32`「Playwright launch **not reached**（Key-blocked before UI cases）」 | Playwright case 全部 **not_run** · ≠ pass |
| C3 | `pnpm verify:e2e-performance`（`:264`） | step3 HTTP full E2E（级联 CMD1 同 gate） | **Key-blocked（级联）** | `verify-e2e-performance.md:29-31`「web production build **0** · migrate `:prove` **0**（applied=135 all PASS）· HTTP full E2E **1** → Key-blocked `live_provider_key_missing`」· `:33` suite error `e2e_performance_suite_failed:HTTP full E2E:exit=1` — **not** `schema migration:exit=1` | suite steps 4+ / PERF 数据 **not_run** · migrate EXIT0 ≠ suite green |

### 2.2 同轮夹具/环境披露项（Path A 收据内 · 非 Key gate 本体）

| # | 披露项 | 分类 | 收据原文引证 | 状态 |
|---|--------|------|--------------|------|
| C4 | R5-MARKED-RED `E2E_ISOLATION_STACK=pgvector-legacy` isolation 栈（宽 `e2e:isolated`/perf 默认绑同一 pgvector 镜像 · 云 serial runner 拒全套 PRD-TEST-008） | **夹具/基建缺陷** | `e2e-isolated.md:50`「Fixture disclosure retained: **R5-MARKED-RED** `E2E_ISOLATION_STACK=pgvector-legacy` · G6 still OPEN」· backlog `gap-bug-backlog.md:98` @`0345315`（BUG-E2E-ISO · P1） | **OPEN**（G6 still OPEN · R5 退役阶段 3–4）→ 排队 §3.1 Q1/Q2 |
| C5 | Line U docker.sock session env-gap（`id` ∉ docker in session → `docker info` permission denied） | **环境缺口**（已清除） | `e2e-isolated.md:27-29`「Before… permission denied · Membership DB `docker:x:102:box` **pre-existing**」· `:39`「**Not** `database_not_ready` / docker.sock deny（Line U env-gap **cleared** for this CMD）」 | **CLEARED @ AC**（Path A `sg docker` · Ban sudo/chmod/usermod）· class 翻转 env-gap → Key-blocked |
| C6 | chromium prereq（CR install/version/smoke） | **环境缺口**（已闭合 · ≠ UI green） | `e2e-ui-isolated.md:32`「chromium **1.61.1 / v1228** present on host（chromium ≠ UI green）」· L 线 `harness/g7-trio-current-state-alignment.md:31`「CR chromium prereq 关（0/0/0）**≠ UI green**」 | present · 不再排队 |

### 2.3 历史 Key-set era case 级明细（唯一存在的业务 case 级证据 · retained 不重跑）

> 只有 **Key set** 的历史实跑（A″ `e697c81` → FIX `a4e3de5` · 2026-09-17 · L 线 §2 时序更正：**A″ 先于 FIX**）到达过 case ledger。这些明细是本分类矩阵对「业务 case 层」的**唯一**历史输入；全部 retained，本刀零重跑。

| # | case / 症状 | 所在 CMD | 分类 | 引证 | 处置 |
|---|-------------|----------|------|------|------|
| C7 | live text chat `403 AllocationQuota.FreeTierOnly` → `deterministic_refusal` → `questions=0` · `interview_unavailable` / `generation_provider_not_configured` | `e2e:isolated`（iso/perf 同源） | **Key-blocked**（quota-tier · 依赖 live provider 供给） | FIX `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md:21,:28`「live chat **403 `AllocationQuota.FreeTierOnly`** → … questions=0」· `:36` residual #1 | ERRATUM 措辞 §1 · 解锁 = live 刀（§3.2）· **非产品缺陷** |
| C8 | recruiting-bound chromium+mobile `waitForURL(/interview/iv_…)` timeout（interview bind URL 30s 内不出现）×2 failed | `e2e:ui:isolated` | **Key-blocked**（依赖 C7 live 生成路径 · FIX **10 passed / 2 failed / 10 skipped**） | FIX `:29`「recruiting-bound chromium+mobile waitForURL(/interview/iv_…) timeout（live interview start blocked by same provider quota）」· `:37` residual #2 | 随 live 解锁刀复核 · **非独立产品缺陷证据** |
| C9 | voice / OCR / ASR / TTS capability gates（无 DASHSCOPE key → honest capability skip） | iso + UI | **Key-blocked**（capability key 族） | FIX `:18-19`「test.skip unless `DASHSCOPE_TTS_API_KEY` + `DASHSCOPE_ASR_API_KEY` · honest capability skip · **≠** voice green」 | capability key 供给随 live 刀 · Ban wash skip-as-pass |
| C10 | UI ingest 断言标签 `getByText(/状态:ingested/)` timeout（A″ **14 failed / 4 passed / 4 skipped** dominant fail） | `e2e:ui:isolated` | **夹具/断言缺陷**（**已于 FIX 轮修复** · 不排队） | A″ `receipts/2026-09-17-g7-key-x3-rerun.md:17`「dominant fail getByText(/状态:ingested/) timeout」· FIX `:15`「specs assert `解析完成`（was raw `状态:ingested`）→ dominant ingested timeout **removed**」 | **REMEDIATED**（FIX a4e3de5）· 留痕不改写 |
| C11 | `E2E_FAILURE class=frontend code=client_exited`（chromium wrapper 症状） | `e2e:ui:isolated` | **非独立类**（下游症状 · 随 C8/C10） | A″ `:17` · FIX `:29` 同 code | 不单列排队 |

### 2.4 计数（绑定口径 · Ban 洗绿）

| 类 | 计数 | 明细 |
|----|------|------|
| **Key-blocked** | 顶层 FAIL 点 **3**（C1/C2/C3 · 每 CMD 1 个 gate 点）+ 历史 case 级族 **3**（C7/C8/C9） | 当前 Path A 现状下 trio 全部 FAIL 归此类 · 业务 case 全 not_run |
| **真实产品缺陷** | **0 确认**（unknown ≠ 0） | `assertionCount=null`（C1 引 `:44`）→ Ban 写「0 失败」/「全绿」；历史 case 级数据（§2.3）不足以把任何 case 定为独立产品缺陷 |
| **夹具/基建缺陷** | **1 族 OPEN**（C4 · BUG-E2E-ISO）+ **1 已修历史项**（C10 · REMEDIATED） | C4 → §3.1 排队；C10 留痕 |
| **环境缺口** | **0 open**（C5 cleared @ AC · C6 present） | Line U docker.sock env-gap 不再是残余类 |

---

## 3. Path B 方案（分类后的三条处置线）

### 3.1 [夹具/基建缺陷] → 修复刀排队清单（每项一行：缺口 + 拟修 CMD + 优先级）

| Q# | 缺口 | 拟修 CMD / 面 | 优先级 |
|----|------|---------------|--------|
| Q1 | R5-MARKED-RED pgvector-legacy isolation 栈：夹具拆分（关系面 MySQL / 向量面 Qdrant · PRD-TEST-008 · R5 退役阶段 3–4） | `pnpm e2e:isolated` 夹具层（`scripts/run-e2e-isolated.mjs` + isolation stack 选型） | **P1**（BUG-E2E-ISO · `gap-bug-backlog.md:98`） |
| Q2 | 云 serial runner 拒绝 migration/vector 全套 → 云故障证据另轨（cloud profile） | `pnpm verify:e2e-performance` 云 profile | **P2**（同 BUG-E2E-ISO 行 · 云 profile 另 FINDING） |
| Q3 | **Path B 无 Key 替代断言面**：对**不依赖模型**的 UI/HTTP 断言建 fixture-based mock 面（Key gate 之上的独立能力），**必须显式标注「mock ≠ real-model E2E」** · Ban 用 mock 面冒充真模型 E2E · Ban 冲抵 Key-blocked · Ban 借此翻 trio/g7SuiteGreen | `pnpm e2e:ui:isolated`（mock 断言层 · 独立 CMD/收据命名，禁复用 trio 名义） | **P1**（须独立 REQUEST + 双审；本刀只登记不实施） |

> Q1/Q2 修复刀落地**不等于** Key-blocked 消除；trio 的 Key gate（C1–C3）仍须 live 刀解锁。排队 ≠ 授权：每项另走 REQUEST + pre-exec dual + 协调方授权。

### 3.2 [Key-blocked] → 保持 env-gap→Key-blocked 披露（Ban 装 Key 蒙混）

- C1/C2/C3 保持 **Key-blocked FAIL** 披露：`live_provider_key_missing` @ `run-e2e.mjs:43` / `run-e2e-ui.mjs:48`（blob 锚 §1）· **Key-blocked ≠ pass** · ≠ skip · ≠ flake · ≠ not_run-as-pass。
- **Ban 装 Key 蒙混**：Ban 读/引 `.env*` · Ban 设假 `MODEL_API_KEY` 占位串过门 · Ban 开假服务开关（代码级守门 `run-e2e.mjs:42` `fake_service_mode_forbidden`）· Ban 假模型/假 provider 冒充。
- 解锁条件账沿用 AD **P4**（`receipts/g7-key-blocked-residual-honest/P4-unlock-ledger.md`）：live Key 供给 + live 预算 + mw-model-op live 双审 + 协调方显式授权 = **另刀**（Line C live chat-only `7eb1a7e` ≠ trio run）· 列条件 ≠ 授权。
- Disclosure-1 **OPEN** retained（`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` = non-production role path · never counts toward R1 · `techRoleFailClosedOptOutG7Only=true`）。

### 3.3 [真实产品缺陷] → backlog 登记（0 确认 · 不发明）

- 本刀**不新增** backlog 行：Path A 收据无已执行业务 case（`assertionCount=null`），历史 §2.3 明细无一条可定为独立产品缺陷 → **登记为「unknown（null）· 非 0」**。
- 未来任何产品缺陷登记须以**已执行 case** 的失败证据为据（live 刀或 Q3 mock 面产出 · 显式标注证据来源）；Ban 无证据发明缺陷，也 Ban 用 unknown 冒充「无缺陷」。
- 现有 backlog 原行不动（含 BUG-E2E-ISO `:98` · G6/R5 行）。

---

## 4. 诚实条款（本刀纪律）

1. **`g7SuiteGreen=false` 保持** · `r1Closed=false` · trio **OPEN 1/1/1**（EXIT 1/1/1 retained：AC `7c818c5` + AD `880f144`）· Disclosure-1 **OPEN** · coveredCount=**8** · Ban invent covered。
2. **本刀不跑 trio**：Ban 与 AC/AD 收据重复跑（AC `7c818c5` ×1 + AD `880f144` ×1 已各恰一次 · 重复跑 = 无授权浪费 + 漂移混淆面）；分类矩阵全部**引用**既有收据（CITE 口径：引用 EXIT = 被引收据 1/1/1，非本刀新 EXIT）。
3. **mock 断言面条款**：Q3 如获授权实施，产物必须显式标注「**mock ≠ real-model E2E**」——mock 面绿 ≠ trio 绿 ≠ Key-blocked 消除 ≠ suite green；Ban 用 mock 冒充真模型 E2E；mock 收据独立命名独立归档。
4. **Ban 假绿叙事**：禁「已可翻绿 / 距绿一步 / 绿在望」；Key-blocked ≠ pass；env 已清 ≠ suite green；migrate EXIT0 ≠ suite green；classified ≠ fixed。
5. **Ban live**：模型调用 0 · Keys unset · 不读 `.env*` · `actualSpendCny=null` · No invented spend。
6. Ban coding（零产品改动 · 零脚本改动）· Ban retry-to-green · Ban 只留绿 attempt · Ban 把 EXIT=1 洗成 flake/环境偶发 · Ban self-approve / self-nail · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push。

---

## 5. 边界

- **docs-only**：分类矩阵 + Path B 排队清单 + 双审 stub，一次 commit。
- **零产品改动**：不改 `run-e2e*.mjs` / 夹具 / `package.json` / 业务码；SSOT（backlog/checklist/矩阵）**nail 期才碰**，本 REQUEST 零触碰。
- **Ban live**（§4.5）。Ban 碰 sibling 线产物（AC/AD/U/L 归档不改写）。
- 本 commit 不预 claim 任何 post-commit EXIT。

## 6. Non-claims

Not a pass · not run（本刀零实跑）· not suite green · not trio green · not fixed · not classified-as-green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not live · not Key provisioning · not mock-surface implementation · Key-blocked ≠ pass · mock ≠ real-model E2E · env cleared ≠ suite green · `g7SuiteGreen=false` · `r1Closed=false` · trio OPEN 1/1/1 · business-assert unknown(null) · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN 1/1/1 · STOP

---

*Harness · G7 Path B honesty classification · Line G7B · 2026-10-06 · executed:awaiting_post_prove_dual · docs-only · 四分类 C1–C11 · Key-blocked 3+3 · 产品缺陷 0 确认（unknown≠0）· 夹具 1 族 open + 1 已修 · 环境 0 open · 排队 Q1–Q3 · Ban trio 重跑 · Ban 装 Key 蒙混 · Ban 假绿 · Ban live · STOP（awaiting POST dual）*
