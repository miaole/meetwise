# 审查归档 — G7 · **Key×3 fix** iso/UI/perf · 执行前文档闸 · mw-e2e-ha

**日期**：2026-09-17 ~19:48 PT  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前文档闸；**实现方自批无效 / 拒绝**；本审 **零 coding · 零 prove · 零 invent EXIT · 零读 `.env*` · 零 HA**）  
**送审**：`reviews/REQUEST-2026-09-17-g7-key-x3-fix-iso-ui-perf-mw-e2e-ha.md`  
**对照（全文只读）**：
- `harness/g7-key-x3-fix-iso-ui-perf.md`（canonical · 三红 · lifecycle · pins）
- `g7-key-x3-fix-iso-ui-perf.slice.md`
- `eval/g7-key-x3-fix-iso-ui-perf.eval.md`（`REQUEST-ready / not_run:pre_dual`）
- `harness/g7-key-x3-rerun.md`（A″ · **`post_prove_dual_pass:honesty_red`** · dual on `e697c81` · EXIT **1/1/1** · **retained**）
- `receipts/2026-09-17-g7-key-x3-rerun.md`（fresh EXIT 表 · **≠** suite green）
- `reviews/2026-09-17-g7-key-x3-rerun-post-prove-mw-e2e-ha.md`（先验 honesty pass · **≠** suite green）
- `harness/g6-e2e-iso-blocked.md`（**G6 STILL OPEN**）
**配对**：`REQUEST-2026-09-17-g7-key-x3-fix-iso-ui-perf-mw-rag-route.md`（**须独立签**；冲突取更严；**本审不代签 / 不等待**）  
**结论**：**pass**（**仅** 执行前文档闸 · **≠** coding authorize · **≠** fixed · **≠** suite green）  
**批准范围**：**仅**同意本刀 harness/slice/eval/双 REQUEST 够格打开 **Key×3 fix** 文档轨（三红：iso api/pgvector-legacy · UI ingested timeout · perf HTTP E2E）· 硬钉 **Ban假绿 · Dual PASS ≠ coding · Ban claim fixed without EXIT · Key×3 honesty dual_pass ≠ suite green · `releaseEvidence=false` · ≠HA · R5/G6 open until evidence · zero coding / zero prove this open** · 本审 **≠** standing authorize · **≠** coding/prove · **≠** 本刀 done  
**不批**：suite green · fixed · coding authorized · G6/R5/HA 关闭 · `releaseEvidence=true` · 把 A″ honesty dual_pass 洗成绿 · Dual PASS = coding · 实现方自批 · invent EXIT / 洗 EXIT=1→绿 · secrets / `.env*`  
**SHA**：claimed **`8de362c`**（docs open G7 Key×3 fix REQUEST）· 审查时 HEAD **`42f77c1`**（`8de362c` 为其祖先 · tip 被后续无关 docs nail 推进 · **合理 · 非本闸 blocker**）  
**硬钉**：Ban假绿 · Dual≠coding · honesty≠suite green · `releaseEvidence=false` · ≠HA · zero coding · Ban self-approve · pair `mw-rag-route` 独立

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **执行前文档闸 only** — NOT coding · NOT prove · NOT fixed · NOT suite green · NOT G6/R5/HA close · NOT standing authorize · NOT this knife done |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| Knife / CMD | **`REQUEST-ready / not_run:pre_dual`**；frozen trio prove **`not_run:await_authorize`** · **未跑** |
| Prior A″ | **`post_prove_dual_pass:honesty_red`** · EXIT **1/1/1** on `e697c81` · **≠** suite green · **≠** already fixed · **retained** |
| Coding / prove | **仍 forbidden** — Dual PASS 后仍须 **standing authorize**；本审 **≠** authorize coding |
| Experts | `mw-e2e-ha` + `mw-rag-route` · Ban self-approve |
| G6 / R5 / suite | **仍 OPEN / 未绿** · R5-MARKED-RED · G6 STILL OPEN until evidence |
| `releaseEvidence` | **false** |
| HA | **≠HA** |
| 阻塞（本域文档闸） | **无阻塞**（见 §5；配对域独立；coding/prove 仍 gated） |

---

## 1. 已读 / 对照（只读 · 零 coding · 零 prove）

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST（本域） | `REQUEST-…-fix-iso-ui-perf-mw-e2e-ha.md` | Q1–Q5 清晰；硬钉完整；禁自批；Dual≠coding；honesty≠suite green；`releaseEvidence=false` |
| Harness | `harness/g7-key-x3-fix-iso-ui-perf.md` | §0–§5：三红表 · lifecycle L0–L4 · pins · prove CMD `not_run:await_authorize` · Non-claims |
| Slice | `g7-key-x3-fix-iso-ui-perf.slice.md` | products 齐；one-line scope；硬钉齐；zero coding this open |
| Eval | `eval/g7-key-x3-fix-iso-ui-perf.eval.md` | E1–E6 · fake-green checklist · dual receipts await · Ban invent EXIT |
| A″ harness | `harness/g7-key-x3-rerun.md` | `post_prove_dual_pass:honesty_red` · EXIT 1/1/1 · Dual≠coding · **retained** |
| A″ receipt | `receipts/2026-09-17-g7-key-x3-rerun.md` | EXIT **1/1/1** · iso api/R5 · UI ingested timeout · perf HTTP E2E · **≠** suite green |
| A″ e2e-ha review | `…-rerun-post-prove-mw-e2e-ha.md` | honesty pass only · **≠** suite green · Dual≠coding |
| G6 | `g6-e2e-iso-blocked.md` | **G6 STILL OPEN** |
| Pair REQUEST | `REQUEST-…-mw-rag-route.md` | 已备；本审 **不代签** |

### 1.1 Spot（只读 · 不跑 trio · 不读密钥）

| 点 | 观察 | 读法 |
|----|------|------|
| A″ EXIT | frozen trio **1/1/1** · Key set 仍红 | 三红 scoped **诚实** · honesty≠suite green · ≠ already fixed |
| iso | `failureClass=api` · **R5-MARKED-RED** pgvector-legacy | fix scope = api / pgvector-legacy · **≠** sole cutover · G6 OPEN |
| UI | dominant `getByText(/状态:ingested/)` timeout · chromium **ran** | chromium ran ≠ UI green · Ban假绿 |
| perf | migrate PASS → **HTTP full E2E** exit=1 | ≠SLO ≠LOAD ≠HA · Ban wash migrate PASS |
| Lifecycle | L0 this open · L1 pre-exec dual · L2 standing authorize · L3 coding+prove · L4 post-prove dual | Dual PASS ≠ coding · coding waits L2 |
| Prove CMDs | 三 CMD 全 `not_run:await_authorize` | Ban invent EXIT · zero prove this open |
| SHA | claimed `8de362c` · HEAD `42f77c1`（祖先关系） | tip 推进 **合理** · 非假绿面 |
| Key / env | 本审 **未读** `.env*` · **未** invent Key · **未** 重跑 trio | **属实** |

---

## 2. REQUEST Q1–Q5（对抗答）

| # | 问题 | 本审答 | 对抗要点 |
|---|------|--------|----------|
| **Q1** | Agree three reds scoped honestly from A″ EXIT **1/1/1**（iso api/R5 · UI ingested timeout · perf HTTP E2E）？ | **同意** | 收据 + A″ harness §1 + 先验 e2e-ha post-prove 对账一致：iso=`api`/pgvector-legacy R5 · UI=`状态:ingested` timeout · perf=HTTP full E2E。**禁止**把 scope 扩成 suite/G6/HA 关刀，也**禁止**缩掉 R5 mark。 |
| **Q2** | Agree prior Key×3 honesty dual_pass on `e697c81` **≠** suite green **≠** already fixed？ | **同意（硬钉）** | A″ 状态是 `post_prove_dual_pass:**honesty_red**` · EXIT **1/1/1**。Dual PASS = 红诚实 · **≠** 绿 · **≠** 已修 · **≠** 本 fix 刀已完成。禁洗 honesty_red→green。 |
| **Q3** | Agree Dual PASS ≠ coding · Ban假绿 · Ban claim fixed without EXIT · coding waits **standing authorize after dual**？ | **同意（硬钉）** | 本 pre-exec dual（即便两端 pass）**仅**放行文档闸；**不**授权 coding/prove。L2 standing authorize 另闸。Ban claim fixed without EXIT · Ban假绿。 |
| **Q4** | Agree lifecycle: REQUEST → pre-exec dual → standing authorize → coding+prove → post-prove dual？ | **同意** | harness §2 L0–L4 与 REQUEST stance 一致。**当前 = L0/L1**（本票 = L1 一票）。L3/L4 **forbidden until** L2。禁跳闸 / 禁实现方自翻 `post_prove_dual_pass`。 |
| **Q5** | Agree `releaseEvidence=false` · ≠HA · ≠ suite green · R5/G6 open until evidence · zero coding · Ban self-approve · Ban secrets / `.env*`？ | **同意（硬钉）** | 全 artefacts 钉 `releaseEvidence=false` · ≠HA · R5-MARKED-RED / G6 STILL OPEN until evidence · zero coding this open · Ban self-approve · Ban `.env*` / invent Key / commit secrets。 |

---

## 3. 对抗：假绿 / 偷开 / 冒充

| 风险说法 | 裁定 |
|---------|------|
| 「A″ Key×3 honesty dual_pass = suite green / already fixed」 | **假绿 / 禁** — honesty_red · EXIT 1/1/1 |
| 「本审 pass / Dual PASS = 已授权 coding / prove」 | **禁** — Dual PASS ≠ coding · 须 **standing authorize after dual** |
| 「文档 REQUEST open = fixed / suite green / G6 closed / R5 retired」 | **假绿 / 禁** |
| 「migrate PASS / chromium ran = perf 绿 / UI 绿」 | **假绿 / 禁** — A″ 主导失败仍在 HTTP E2E / ingested timeout |
| 「本刀 alone = sole cutover / G6 close」 | **假绿 / 禁** — G6 STILL OPEN · R5 until evidence |
| 「invent EXIT=0 / 不跑就宣称已修」 | **Ban claim fixed without EXIT · Ban假绿** |
| 「实现方预写 REQUEST = 专家 pass / dual 齐」 | **禁** — 拒绝自批 · 须 `mw-rag-route` 独立 |
| 「本域 pass = dual 齐 / knife done」 | **禁** — 单票 ≠ dual · 文档闸 ≠ done |
| 「读 `.env*` / invent Key 来『证明』可修」 | **禁** |

**本审**：送审 artefacts **未**把 fixed/suite/G6/R5/HA 写成已关；假绿面在 **叙事外推**（把 honesty dual_pass 或本闸 pass 偷读成绿/可 coding）。文档闸诚实即可控。

---

## 4. 边界 vs A″ / G6 / R5 / suite

| 层 | 状态（只读） | 与本刀关系 |
|----|--------------|------------|
| A″ Key×3 re-run | `post_prove_dual_pass:honesty_red` · EXIT **1/1/1** · dual on `e697c81` | **证据源 / 三红来源** · **retained** · **≠** suite green · **≠** already fixed |
| A / A′ 历史 | unset-era + historical Key-set honesty_red **retained** | complementary · **not** rewritten green |
| G6 | **STILL OPEN** | 本 REQUEST **不得**单独宣称关 |
| R5 pgvector-legacy | **MARKED-RED** · open until evidence | iso fix path 相关 · **≠** sole cutover / retirement |
| suite / family / HA | **未绿** · `releaseEvidence=false` · ≠HA | Dual / 本闸 **抬升不得** |
| 本刀 lifecycle | L0 open · L1 dual in flight · L2–L4 not yet | coding/prove **await standing authorize** |

---

## 5. Blockers

**本 scope（执行前文档闸）无 blocker。**

| 非本票 blocker（诚实保留 · 勿洗绿） | 说明 |
|--------------------------------------|------|
| 双域未齐 | `mw-rag-route` pre-exec **须独立**写 pass/block · 本票 **≠** dual 齐 |
| Standing authorize | Dual PASS 后仍须 **另闸** · Dual ≠ coding |
| Coding / prove | **forbidden until L2** · trio 仍 `not_run:await_authorize` |
| G6 / BUG-E2E-ISO | **仍 OPEN** · 文档闸 **≠** 关闭 |
| R5 pgvector-legacy | **MARKED-RED** · ≠ sole / ≠ retirement |
| A″ trio 全红 | 修复轨打开 **≠** 已修 · Ban claim fixed without EXIT |

---

## 6. 硬确认（强制复述）

1. **Ban假绿** · **Ban claim fixed without EXIT**  
2. **Dual PASS ≠ coding** · Dual PASS ≠ suite green ≠ G6/R5/HA close  
3. **Key×3 honesty dual_pass ≠ suite green**（A″ on `e697c81` · EXIT 1/1/1 · honesty_red **retained**）  
4. **`releaseEvidence=false`** · **≠HA** · **≠ suite green**  
5. **R5-MARKED-RED / G6 STILL OPEN** until evidence  
6. **Zero coding · zero prove** this open · prove CMDs `not_run:await_authorize`  
7. **Ban** 实现方自批 · **Pair** `mw-rag-route` **独立** mandatory  
8. **Ban** secrets / `.env*` / invent Key · Meridian banned  

---

## Sign-off

**Signed**: `mw-e2e-ha`  
**Verdict**: **pass**（scope=**执行前文档闸** only）  
**Non-claims**: not coding authorized · not fixed · not suite/family green · not G6 closed · not R5 retired · not HA · not `releaseEvidence=true` · not dual complete · Dual PASS ≠ coding · honesty≠suite green  

*Review · mw-e2e-ha · G7 Key×3 fix iso/UI/perf · 执行前文档闸 · 2026-09-17 ~19:48 PT · claimed SHA 8de362c · HEAD 42f77c1 · Ban假绿 · Dual≠coding · honesty≠suite green · releaseEvidence=false · ≠HA · zero coding · Ban self-approve*
