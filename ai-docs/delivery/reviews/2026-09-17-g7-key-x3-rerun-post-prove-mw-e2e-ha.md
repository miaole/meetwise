# Review — G7 · Key×3 re-run · **post-prove** · mw-e2e-ha

**Verdict**: **`pass`**（范围：**post-prove 诚实性 / EXIT 表核对 only** · **≠ suite green** · **≠ family green** · **≠ HA** · **≠ covered** · **≠ SLO/LOAD**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-17 ~19:40 PT  
**Scope**: 收据诚实性 + EXIT 工件对账 · **禁止**把本 pass 读成 suite/family 绿 · **禁止**自批 `post_prove_dual_pass`  
**Knife status（仍属实现方收据）**: `executed:awaiting_post_prove_dual`（本专家 **一票** honesty pass · **双域未齐** · 禁实现方翻状态）  
**Pair**: `mw-rag-route` 须**独立**写 `reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-rag-route.md`  
**HEAD（审查时）**: `e697c81`（与 claimed 一致；收据 execute start `7f6e3bd` 为其祖先 · tip 在跑中被无关 docs commit 推进 · 合理）  
**releaseEvidence=false** · **≠HA** · **Key set ≠ suite green** · **Ban invent Key** · **Ban false green** · **Ban self-approve dual_pass**

---

## 1. 路径

| 项 | 路径 |
|----|------|
| 本评审 | `ai-docs/delivery/reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md` |
| REQUEST | `ai-docs/delivery/reviews/REQUEST-2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md` |
| 收据 | `ai-docs/delivery/receipts/2026-09-17-g7-key-x3-rerun.md` |
| EXIT/日志工件 | `.tmp/g7-key-x3-rerun-20260917/{EXIT-01,02,03}-*.txt` + `{01,02,03}-*.log` |
| e2e JSON | `.tmp/e2e-receipts/2026-09-18T02-29-59-002Z-…json` · `…02-37-14-146Z-…json` · `…02-35-55-304Z-…json` |
| 先验 harness | `harness/g7-key-live-x3.md`（A′）· `harness/g7-key-blocked-x3-honesty.md`（A）· `harness/g6-e2e-iso-blocked.md`（G6 **仍 OPEN**） |

**纪律**：未读 `.env*` · 未打印 / 未发明 Key · 未重跑 Key×3 suite · 未加载 API key。

---

## 2. Verdict

**`pass`** — 仅对 **post-prove 诚实性 + EXIT 表与工件一致** 放行。

| 允许宣称 | 禁止宣称 |
|----------|----------|
| frozen trio 本跑 EXIT **1/1/1** 与工件一致 | suite / family **green** |
| Key **set**（收据宣称 · authorized loader · name-only）仍 **红** | Key set ⇒ auto green / covered / HA |
| `releaseEvidence=false` · **≠HA** | `releaseEvidence=true` · HA |
| R5-MARKED-RED / G6 **仍 OPEN** 诚实保留 | G6 / R5 / R2/R4 **已关** · sole cutover |
| 状态仍 `awaiting_post_prove_dual` | 实现方自写 `post_prove_dual_pass` · 单专家自批 dual |
| 本票 = e2e-ha honesty pass | 本票 = 双域齐 / knife 关 |

---

## 3. EXIT 核对（工件 · 无 key 材料）

| # | CMD（收据） | 声称 EXIT | 工件 `EXIT-*.txt` | 日志 / JSON 交叉 | 裁定 |
|---|-------------|-----------|-------------------|------------------|------|
| 1 | `pnpm e2e:isolated` | **1** | `EXIT-01-e2e-isolated.txt` = **1** | log：`[R5-MARKED-RED] …pgvector-legacy` · `E2E_FAILURE_CLASS class=api` · ELIFECYCLE exit 1；JSON：`outcome=failed` `failureClass=api` `exitCode=1` `releaseEvidence=false` | **一致 · 红诚实** |
| 2 | `pnpm e2e:ui:isolated` | **1** | `EXIT-02-e2e-ui-isolated.txt` = **1** | log：chromium **ran** · **14 failed / 4 passed / 4 skipped** · 主导 `getByText(/状态:ingested/)` timeout · `E2E_FAILURE class=frontend code=client_exited` · ELIFECYCLE exit 1 · **R5-MARKED-RED** | **一致 · 红诚实** · chromium ran ≠ UI green |
| 3 | `pnpm verify:e2e-performance` | **1** | `EXIT-03-verify-e2e-performance.txt` = **1** | log：迁移 runner PASS → HTTP full E2E → `e2e_performance_suite_failed:HTTP full E2E:exit=1`；wrapper JSON：`outcome=failed` `failure=e2e_performance_suite_failed:HTTP full E2E:exit=1` `releaseEvidence=False`；内嵌 iso JSON 同 `failed/api` | **一致 · ≠SLO ≠LOAD ≠HA** |

**EXIT 表（frozen trio）**: **1 / 1 / 1** — **已核实**。  
**硬钉**：即便将来 EXIT=0，仍 **≠ suite green ≠ HA ≠ releaseEvidence=true**；本跑 EXIT≠0，假绿面不成立。

---

## 4. Q1–Q6 对抗摘要

| Q | 对抗结论 |
|---|----------|
| **Q1** EXIT **1/1/1** 且 EXIT≠0 ≠ suite/family green ≠ covered（即便 Key set）？ | **同意**。三份 EXIT txt + 日志尾 + e2e-receipts JSON 全对上 **1**；收据未宣称 suite/family 绿。 |
| **Q2** `NEW_SHELL_STATUS=set` 仅授权 loader · Key present ≠ auto green ≠ HA · no invent Key？ | **同意（诚实面）**。收据/REQUEST 钉 authorized `source …/load-model-api-key.sh` · name-only · 禁 invent；本审查**未**复探针、**未**读密钥文件、**未**打印值。Key set **不**抬升为 HA/绿。 |
| **Q3** R5-MARKED-RED / pgvector-legacy on iso · G6 still OPEN · ≠ sole cutover？ | **同意**。三份 log 均见 `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`；`harness/g6-e2e-iso-blocked.md` 仍写 **G6 仍 OPEN（BUG-E2E-ISO 未关）**；有 Key 硬跑红 **≠** G6 关 **≠** sole cutover。 |
| **Q4** `verify:e2e-performance` EXIT=1 ≠ SLO ≠ LOAD ≠ HA ≠ suite green？ | **同意**。失败点在 HTTP full E2E（嵌套 iso EXIT=1），迁移段 PASS **不可**洗成 perf/SLO/LOAD 绿。 |
| **Q5** Prior A unset-era + A′ historical honesty_red **retained** · 本行为 **fresh** Key×3 honesty row？ | **同意**。A（`g7-key-blocked-x3-honesty`）与 A′（`g7-key-live-x3` · `honesty_red_key_set`）未被改写为绿；本收据 `2026-09-17-g7-key-x3-rerun.md` 为 **新** Key×3 诚实行（UI 侧 chromium 已跑但仍红 · 相对 A′「缺浏览器」叙事有演进，**仍非绿**）。 |
| **Q6** 未 invent/paste Key · 未读 `.env*` · 未 commit secrets · 未自批 · post-prove dual 必需？ | **同意**。本专家未见密钥材料进收据/日志可读面；状态仍 `executed:awaiting_post_prove_dual`；**禁止**实现方自写 `post_prove_dual_pass`；**须** `mw-rag-route` 独立票。本文件 = e2e-ha 票 · **≠** dual 齐。 |

**NHP（观察）**：BOUND（Key set ≠ auto green）· R5 mark-red · PARTIAL 0/3 CMD 绿 · G6 OPEN · A/A′ 历史诚实保留 · 无 Key 值入文档。

---

## 5. Blockers

**本 scope（honesty/EXIT）无 blocker。**

| 非本票 blocker（诚实保留 · 勿洗绿） | 说明 |
|--------------------------------------|------|
| 双域未齐 | `mw-rag-route` post-prove **尚未**见本刀对应 pass 文件于本审查时点 · 状态必须保持 `awaiting_post_prove_dual` |
| G6 / BUG-E2E-ISO | **仍 OPEN** · Key×3 红诚实 **≠** 关闭 |
| R5 pgvector-legacy | **MARKED-RED** · ≠ sole / ≠ retirement |
| trio 全红 | 修复轨另开 · **禁止**把 honesty pass 读成修复完成 |

---

## 6. 硬确认（强制复述）

1. **Key set ≠ suite green ≠ family green ≠ covered ≠ SLO ≠ LOAD ≠ HA**  
2. **`releaseEvidence=false`**（JSON + 收据 + 日志 `release_evidence=false` 一致）  
3. **≠HA**  
4. 状态 **`executed:awaiting_post_prove_dual`**（本票 **不**翻转）  
5. **Ban** 实现方自批 / 自写 **`post_prove_dual_pass`**  
6. **Ban** false green · **Ban** invent Key · **Ban** 把 EXIT 表 pass 写成 suite 绿  
7. **Pair** `mw-rag-route` **独立** mandatory  

---

## Sign-off

**Signed**: `mw-e2e-ha`  
**Verdict**: **pass**（post-prove honesty / EXIT **1/1/1** 对账 only）  
**Non-claims**: not suite/family green · not G6 closed · not R5 retired · not SLO/LOAD/HA · not sole cutover · not `releaseEvidence=true` · not `post_prove_dual_pass` · not dual complete  

*Review · mw-e2e-ha · G7 Key×3 re-run post-prove · 2026-09-17 ~19:40 PT · HEAD e697c81 · EXIT 1/1/1 verified · NEW_SHELL_STATUS=set（收据）· releaseEvidence=false · ≠HA · awaiting_post_prove_dual · Ban self-approve · Ban suite-green*
