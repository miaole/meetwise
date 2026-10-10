# 审查归档 — G7 · **Key×3 FreeTierOnly re-prove** · 执行前文档闸 · mw-e2e-ha

**日期**：2026-09-23 ~20:38 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · **PRE-EXEC docs gate ONLY**；**实现方自批无效 / 拒绝**；本审 **零 coding · 零 prove · 零 model-calling E2E · 零 invent EXIT · 零读 `.env*` · 零授权 spend/coding · 零触 Meridian**）  
**送审 tip**：`d758672`（全长 `d75867272ae8e947c35831219358d185a5f0c7bf` · `docs(delivery): open Line C G7 Key×3 FreeTierOnly re-prove REQUEST (L0)` · **docs-only** · vs parent `3a60a82` 五文件全 `ai-docs/delivery/**`）  
**对照（只读 · `git show d758672:<path>`）**：
- `harness/g7-key-x3-freetieronly-reprove.md`（canonical · §1–§10）
- `g7-key-x3-freetieronly-reprove.slice.md`
- `eval/g7-key-x3-freetieronly-reprove.eval.md`
- `receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md`（EXIT **1/1/1** · 403 FreeTierOnly · tip `5f591ea` / prove `a4e3de5`）
- `harness/g7-key-x3-fix-iso-ui-perf.md`（`post_prove_dual_pass:honesty_red`）
- `harness/g7-key-x3-freetieronly-residual.md`（dual `5897984` · residual OPEN · retained）
- `package.json` @d758672 L239/L240/L243 · `scripts/run-e2e-performance-suite.mjs`（只读）
- `packages/ai-runtime/src/text-endpoint-config.ts` L67（生产缺省 `qwen-plus`）
**配对**：`REQUEST-2026-09-23-g7-key-x3-freetieronly-reprove-mw-model-op.md`（**预算/模型域 · 本审不代签 / 不等待**）  
**结论**：**PASS**（**仅** 执行前文档闸 · **≠** coding authorize · **≠** spend authorize · **≠** fixed · **≠** suite green · **≠** FreeTierOnly 已关 · **≠** Dual 齐 · **alone≠dual**）  
**批准范围**：**仅**同意 Line C L0 REQUEST harness/slice/eval/双 REQUEST 形状够格进入 pre-exec dual；硬钉 residual **OPEN** · EXIT **1/1/1 retained** · Ban假绿 · Dual PASS ≠ coding ≠ authorize prove · `releaseEvidence=false` · ≠HA · zero coding/prove this tip · 下列 **条件** 须在 standing authorize / prove 前满足  
**不批**：suite green · FreeTierOnly fixed · coding/spend authorized · G6/R5/HA 关闭 · `releaseEvidence=true` · claimProductionHA · 把 qwen3.8 绿洗成生产/qwen-plus/perf SLO · invent EXIT · 实现方自批 · 代签 `mw-model-op`

---

## 0. Tip / CMD|EXIT

| 项 | 值 |
|----|-----|
| Tip claimed | `d758672` |
| Tip full | `d75867272ae8e947c35831219358d185a5f0c7bf` |
| On origin | **是**（`origin/feat/mysql-schema-skeleton` contains） |
| Docs-only vs parent | **是** — A×5 全 `ai-docs/delivery/{eval,harness,reviews,slice}` · 零代码 |
| Status left | `draft:awaiting_pre_exec_dual`（本票 **不**翻转 lifecycle · **不**授权 L2） |

### CMD|EXIT（本审记录）

| CMD | EXIT |
|-----|------|
| `git fetch origin` | 0 |
| `git rev-parse d758672` | 0 |
| `git branch -r --contains d758672` | 0 |
| `git log -1 --format=… d758672` | 0 |
| `git show --stat d758672` | 0 |
| `git show --name-status d758672` | 0 |
| `git rev-list --parents -n1 d758672` | 0 |
| `git diff --name-status d758672^..d758672` | 0 |
| `git show d758672:…/harness/g7-key-x3-freetieronly-reprove.md` | 0 |
| `git show d758672:…/g7-key-x3-freetieronly-reprove.slice.md` | 0 |
| `git show d758672:…/eval/g7-key-x3-freetieronly-reprove.eval.md` | 0 |
| `git show d758672:…/REQUEST-…-mw-e2e-ha.md`（stub） | 0 |
| `git show d758672:package.json`（scripts 摘录） | 0 |
| `git log --grep FreeTierOnly/G7/key-x3` | 0 |
| `rg -l FreeTierOnly\|G7\|key-x3 ai-docs/delivery` | 0 |
| `git show a4e3de5:…/receipts/2026-09-17-g7-key-x3-fix-iso-ui-perf.md` | 0 |
| `git show d758672:scripts/run-e2e-performance-suite.mjs` | 0 |
| `git show d758672:packages/ai-runtime/src/text-endpoint-config.ts`（model default） | 0 |
| `rg worktree\|runnerCommitSha\|porcelain` harness/eval @tip | **1**（无匹配 · 见 finding a） |
| `pnpm e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` / 任何 model API | **not_run:docs_gate**（本审禁跑） |

---

## 1. Findings (a)–(f)（E2E 域对抗）

### (a) Fresh EXIT @ committed SHA · 卫生

| 问 | 裁定 | cite |
|----|------|------|
| 计划要求冻结 trio 在 **已提交 SHA** 上新鲜 EXIT？ | **部分有** | harness §4.2 L175–179：先 commit runner/docs → 再跑 → 再 commit receipts；新鲜 EXIT=0/0/0 |
| `runnerCommitSha` 入收据？ | **缺** | harness/eval **无** `runnerCommitSha` 字段钉（rg EXIT=1） |
| clean porcelain / separate worktree / 禁复用旧 `.tmp` logs？ | **缺** | 同上 · 未钉 |

**读法**：L0 已钉 committed SHA + fresh EXIT 意图，但 **prove 卫生不完整**。  
**条件 C-A**：standing authorize / prove 前须补钉 — clean porcelain · 独立 worktree（或等价隔离）· receipt 写 `runnerCommitSha`（= 跑时 HEAD）· **Ban** 复用旧 `.tmp/g7-*` / `.tmp/e2e-receipts` 日志当新证据。

### (b) Model-honesty · 非生产 / 非 perf SLO

| 问 | 裁定 | cite |
|----|------|------|
| 生产主模型已声明？ | **是** | `text-endpoint-config.ts` L64–67 缺省 `qwen-plus`；harness §2.2 L71 |
| 免费/回退绿 ≠ 生产 / ≠ perf SLO？ | **意图有 · 标签弱** | harness §3 L149–158 Ban cross-model cite；**未**强制收据字面标记 `free-tier model; not production-model evidence; not perf SLO evidence` |
| per-call model 记录 + 断言禁 `deepseek-v4-pro` / 未声明模型？ | **今日无 · 列为后续 coding** | §2.4 L142–145「今日 e2e receipt **否**」· `GAP-E2E-RECEIPT-PER-CALL-MODEL` · `GAP-G7-BAN-DEEPSEEK-V4-PRO-TEST` · NHP-G7-FT-07 |

**条件 C-B**：prove 前须落地 per-call `actualModel` + allowlist 断言（禁 `deepseek-v4-pro` 无 flag · 禁 undeclared）；凡 free/fallback 跑必须显式标 **非生产模型证据 · 非 perf SLO 证据**；**Ban** 把 qwen3.8-* EXIT=0 写成 qwen-plus / 生产容量。

### (c) `verify:e2e-performance` 根因分离

| 观察 | cite |
|------|------|
| Prior EXIT=1 停在 migrate PASS 后 **HTTP full E2E**（= `e2e:isolated`） | receipt FIX L30；harness §1 L38 |
| 该步失败与 FreeTierOnly **同链**（iso `failureClass=api`） | receipt FIX L28–36 |
| Suite 脚本 **不止** HTTP E2E：build → migrate → HTTP → UI → web:prove → … → **performance:e2e:isolated** → … → 多条 **R5-MARKED-RED** prove | `scripts/run-e2e-performance-suite.mjs` steps[]（~25 步） |
| Harness 将 trio 全红根因写成 FreeTierOnly，**未**要求配额 vs schema/seed/阈值/timeout/R5/stale DB 分离 | harness §1 L51 · §4.2 · **无** stub/no-LLM 隔离路径 · **无**「换 key 前后 error class」钉 |

**裁定**：**条件 C-C（硬）** — 非本票 docs blocker，但是 **authorize prove / 关 residual 前 blocker-class 条件**：  
1. 不得假设「403 是 `verify:e2e-performance` 唯一可能失败因」而无后续步证据；  
2. 关 `GAP-G7-KEYX3-FREETIERONLY-RESIDUAL` 时须用 **errorClass/step 名** 证明 FreeTierOnly 已消（iso/UI 主证据），**不得**把「全 suite EXIT=0」或「migrate PASS」偷换成配额已修；若 suite 在 HTTP 之后因 R5/阈值/迁移等仍红，须 **分册诚实保留**，禁洗入 FreeTierOnly closed；  
3. 计划应要求：失败步 `failure` 字符串 +（若触 LLM）provider error class 入收据，再归因。

### (d) Non-happy · 断言 vs 散文

| 场景 | 计划内？ | 形态 |
|------|---------|------|
| fallback 触发（free 403/429→paid） | **部分** | NHP-G7-FT-01（额度耗尽）· §2.3；**429 单独退避界** **缺** |
| 403 handling | **有** | NHP-G7-FT-02 |
| 429 retry/backoff bounded | **缺** | 无 NHP ID / 无断言 |
| ¥5 budget cap → hard stop fail-closed + receipt | **散文** | §2.5 L126–127「停跑」· **无** NHP 断言 / fail-closed 收据字段 |
| missing key → fail-closed（禁 silent skip / stub pass） | **缺** | 本刀 NHP 表无（先验 Key×3 knives 有 Bound） |
| banned model guard | **有（散文+gap）** | NHP-G7-FT-07 · GAP-G7-BAN-DEEPSEEK-V4-PRO-TEST · **断言待 coding** |

**条件 C-D**：补 NHP（或 eval case）— **429 有界退避** · **¥5 cap hit fail-closed+receipt** · **missing key fail-closed**；NHP 须在 coding 后变成 **可断言**，不得永久停留散文。

### (e) Receipts

| 字段 / 纪律 | 状态 | cite |
|-------------|------|------|
| 脱敏 · fingerprint only · 禁 keys/DSN/env dump | **有** | harness §1 L53 · §2.3 L136 |
| tracked path | **有意图** | delivery `receipts/` + reviews |
| SHA · CMD · EXIT | **有** | §4.2 |
| per-call model · token/cost totals · timestamps | **部分 / gap** | per-call=`GAP-E2E-RECEIPT-PER-CALL-MODEL`；cost=`GAP-G7-COST-RECEIPT-PRE-POST`；suite JSON 有 startedAt/finishedAt（脚本）但 G7 计划未钉全字段清单 |

**条件 C-E**：prove 收据强制字段清单 — `runnerCommitSha` · CMD · EXIT · per-call `actualModel`（+fallback 事件）· token/cost totals（pre-estimate + post-actual）· timestamps · key fingerprint only · `releaseEvidence=false`。

### (f) Claims scope

| 钉 | 状态 |
|----|------|
| 过 trio ≠ HA ≠ 生产容量 ≠ prod-model perf SLO | **有** · §3 · §10 · pins |
| `releaseEvidence=false` · `haStatus=NOT_HA` · `claimProductionHA=false` | **有** · harness L6–7 · L246 |
| Dual PASS ≠ coding ≠ 已修好 · EXIT 1/1/1 retained · residual OPEN | **有** |
| alone≠dual | **有** · 双专家；本审 **不代签** `mw-model-op` |

**裁定**：(f) **通过**（本域无额外条件）。

---

## 2. REQUEST Q1–Q5（对抗答）

| # | 答 |
|---|-----|
| **Q1** 冻结 trio + EXIT 1/1/1 FreeTierOnly cite？ | **同意** — `package.json` L239/240/243 实存；FIX receipt @`a4e3de5`/`5f591ea` EXIT **1/1/1** · 403 `AllocationQuota.FreeTierOnly` · questions=0 · UI recruiting-bound · perf=`HTTP full E2E:exit=1`。 |
| **Q2** 成功准则 + ¥5 + paid fallback allowlist + 本 tip 不跑？ | **同意意图** + **条件 C-A/B/C/E** — fresh EXIT @ committed SHA · per-call · cost · Ban deepseek-v4-pro 无 OK · **本 tip not_run**。成功准则关 residual 时须遵守 C-C（勿把全 suite 绿/红与配额混洗）。 |
| **Q3** NHP-G7-FT-01..06 先于 happy？ | **同意表内 NHP** + **条件 C-D**（须扩 429 / ¥5 cap / missing key；07 已在 harness）。 |
| **Q4** Dual PASS ≠ coding · Ban假绿 · EXIT retained · standing authorize after dual？ | **同意（硬钉）**。 |
| **Q5** pins · residual OPEN · Ban Line A/B · Ban `.env*`？ | **同意（硬钉）** + **PG-retained**（本审钉）。 |

---

## 3. 阻塞项 / 条件 / Pins

### 阻塞项（本 scope · 执行前文档闸）

**无阻塞**

（采样：tip docs-only · EXIT 1/1/1 FreeTierOnly cite 齐 · capability honesty / Ban cross-model · NHP 骨架 · gaps 已登记 · pins / Non-claims / zero prove 诚实 · 假绿面主要在「未来成功准则外推」而非 L0 宣称已绿。）

### 条件（须在 standing authorize / coding / prove 前满足 · 非本票代办编码）

| ID | 条件 |
|----|------|
| **C-A** | prove 卫生：clean porcelain · 隔离 worktree（或等价）· `runnerCommitSha` · Ban 复用旧 logs |
| **C-B** | per-call model + allowlist 断言 + free/fallback 收据显式「非生产 · 非 perf SLO」 |
| **C-C** | perf 根因分离：按 step/`failure`/errorClass 归因；关 FreeTierOnly residual 不得绑死「全 `verify:e2e-performance` EXIT=0」而无配额证据；正交红（R5/阈值/迁移等）分册保留 |
| **C-D** | NHP 补 429 有界退避 · ¥5 cap fail-closed+receipt · missing key fail-closed；NHP→可断言 |
| **C-E** | 收据强制字段清单（见 §1e） |

### Pins（must survive）

- `haStatus=NOT_HA`
- `releaseEvidence=false`
- `claimProductionHA=false`
- `gR45Closed=true`
- `coveredCount=8`
- `ms3EqualsR4Closed=false`
- **PG-retained**
- EXIT **1/1/1 retained** · residual **OPEN** · Ban假绿 · Dual PASS ≠ coding ≠ 已修好 · **alone≠dual** · Ban secrets / `.env*` · Ban Meridian · Ban Line A/B · Ban 共享 SSOT · Ban cross-model cite · zero coding / zero prove this tip

---

## 4. Verdict

| 项 | 值 |
|----|-----|
| **Verdict** | **PASS**（pre-exec docs gate only） |
| **Blockers** | **无阻塞** |
| **Conditions** | C-A · C-B · C-C · C-D · C-E |
| **Authorize coding/spend/prove?** | **否** |
| **Pair** | `mw-model-op` **独立** · 本审不代签 |
| **Residual** | **STILL OPEN** |

---

## Sign-off

**Signed**: `mw-e2e-ha`  
**Verdict**: **PASS** @ tip `d758672`（`d75867272ae8e947c35831219358d185a5f0c7bf`）  
**Status left**: `draft:awaiting_pre_exec_dual`  
**releaseEvidence=false** · **≠HA** · **claimProductionHA=false** · **EXIT 1/1/1 retained** · **residual OPEN** · **Ban假绿** · **Dual≠coding** · **alone≠dual** · **zero coding · zero prove · zero spend authorize** · await `mw-model-op`

---

*审查 · mw-e2e-ha · G7 Key×3 FreeTierOnly re-prove · PRE-EXEC docs gate · 2026-09-23 ~20:38 PT · PASS · tip d758672 · 无阻塞 · 条件 C-A..C-E · releaseEvidence=false · ≠HA · residual OPEN · EXIT 1/1/1 retained · Ban假绿 · Dual≠coding · alone≠dual · Ban self-approve · pair mw-model-op 独立*
