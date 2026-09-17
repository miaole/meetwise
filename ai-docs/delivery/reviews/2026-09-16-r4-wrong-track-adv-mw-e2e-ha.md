# 审查归档 — R4 **wrong_track=0 ADV**（对抗跨域验收门文档闸 · **不 coding / 不 prove**）· mw-e2e-ha

**日期**：2026-09-16（PT；本审只读 ~19:11 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前第二域；**不采信**实现方自报；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md`  
**harness**：`harness/r4-wrong-track-adv.md`  
**eval / slice**：`eval/r4-wrong-track-adv.eval.md` · `r4-wrong-track-adv.slice.md`  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-mw-rag-route.md` + 已写 `2026-09-16-r4-wrong-track-adv-mw-rag-route.md`（**不替代**本域；双域须各自独立签）  
**前序边界**：
- REAL-WIRE-IMPL = `implemented:awaiting_post_prove_dual`（CALL_SITES≥1；prove EXIT=0 旁证可读；**≠** wrong_track=0；**≠** ADV；post-prove REQUEST 仍待审）
- 父轨 `harness/r4-domain-isolation.md` **§6f** · `r4-domain-isolation-status.md` §10（next=ADV await dual）
- matrix §1.5 **NHP-R4-ADV-01** = **gap**/blocked（零 covered）
**结论**：**pass**（仅 **ADV 验收门文档闸**诚实 + 本刀正确零 coding / 零 prove；**pre-exec**）  
**批准范围**：**仅**同意 harness/eval/slice/双 REQUEST 够格当将来对抗 **wrong_track=0** 验收门（A1–A8 + 假绿标红 + CMD 冻结）；同意 **wire 绿 ≠ ADV ≠ wrong_track=0**；同意 NHP-R4-ADV-01 **仍 gap/blocked**；六列 **不**因本刀升 covered；同意本刀 dual pass **不**自动授权 ADV coding（须 **wire post-prove dual + separate authorize**）；同意 **R4 仍 NOT closed**；`releaseEvidence=false` · **≠HA**  
**不批**：wrong_track=0 已证 · NHP-R4-ADV-01 covered · R4 关闭 · 题域已隔离 · wire 已覆盖 ADV · 本 dual 自动 authorize coding/prove · 完整 E2E · covered · HA · `releaseEvidence=true` · sole cutover · flip default · open DELETE · 升格 NEG/FAULT/BOUND/PERF/LOAD covered · 实现方自批  
**硬钉**：`releaseEvidence=false` · **Not HA** · **≠ covered** · **本审未改仓库实现、未跑任何 prove** · **Worker 本刀应保持零改动** · **sole allowlist 恰 5、未扩** · **ADV 仍 gap** · **R4 仍开** · HEAD `639134f`

---

## 0. 范围与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | harness / eval / slice / 双 REQUEST 齐；状态 `REQUEST-ready` / `not_run:pre_dual` | **成立** |
| S2 | A1–A8 定义：在 **已接线** retrieve 上对抗 wrong_track=0；对抗面登记（伪造/缺失 metadata · 未知分类 · 并发改岗 · 旧 checkpoint · cache 回放） | **成立**（harness §1.1；**登记 ≠ 已证**） |
| S3 | **A6 硬钉：wire 绿 ≠ ADV / ≠ wrong_track=0** | **成立**（全文；假绿表首行） |
| S4 | NEG/FAULT companions **登记不升格 covered**；NHP-R4-ADV-01 **仍 gap/blocked** | **成立**（harness §1.2/§6；matrix §1.5） |
| S5 | CMD **冻结** `not_run:pre_dual`；本刀 **零 coding · 零 prove**；Worker **不因本刀改动** | **成立**（eval §2；静态旁证 §4） |
| S6 | **R4 仍 NOT closed**；将来 ADV dual/prove 绿仍 ≠ R4 全家关（并列 P-R1/P-R2/P-META 等） | **成立**（A8） |
| S7 | 本刀 dual pass **不**自动授权 ADV coding（须 wire post-prove + **separate authorize**） | **成立且本审显式钉** |
| S8 | G7 verification gate draft **≠** success | **成立** |
| S9 | sole allowlist **不**因本切片扩面；禁 flip / open DELETE / HA / `releaseEvidence=true` | **成立**（sole 恰 5） |
| S10 | 实现方禁止自批；须 `mw-rag-route` + `mw-e2e-ha` 独立审 | **成立**（本文件 = 本域独立签；拒自批） |

→ 上述为 **ADV 验收门文档闸** 成功标准；**不是** wrong_track=0 已证，**不是** ADV coding 授权，**更不是** R4 关闭。  
→ **可核验性**：文档存在性 + 禁令完整性 + 旗标不升格 + 静态旁证（Worker 本刀零改 / sole 恰 5 / 零 prove）。将来 ADV 实现须另对照 A1–A8 / 新 prove / 双域 post；**即便将来 ADV 绿仍 ≠ R4 关**。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承：文档+REQUEST 验收门 · 不 coding/prove · 非 covered/HA · await dual | **属实**；本审独立签核，**非**实现方自批 |
| harness 定义 A1–A8 + companions + 冻结 CMD + 假绿标红 | **属实且够格**当 ADV 验收门（非实现刀） |
| 实现方本刀 **未改** Worker；**未跑** `r4-wrong-track-adv:prove` | **属实**（eval `not_run`；本审零 prove；静态 §4） |
| REAL-WIRE-IMPL EXIT=0 / CALL_SITES≥1 **≠** wrong_track=0 | **属实**（A6；wire harness W7；本审硬钉） |
| 父轨 §6f / status §10：next=ADV await dual；REAL-WIRE 仍 await post-prove | **属实** |
| matrix §1.5 NHP-R4-ADV-01 = **gap**/blocked；锚点指向本刀 not_run | **属实**；**零 covered** |
| 配对 mw-rag-route | 已有独立 review **pass**（文档闸）；**不替代**本域；双域齐后才算 dual |
| 「meetwise 授权打开 ADV 文档+REQUEST」 | **读为打开验收门文档**；**≠** 已批 ADV coding/prove |

对照源：REQUEST（本域）· harness/eval/slice · 父轨 §6f · status §10 · `r4-real-wire-impl.md`（wire≠ADV）· `non-happy-path-perf-load-case-matrix.md` §1.5 · `e2e-requirement-coverage-matrix.md` GAP-RAG-04 · `scripts/run-e2e-isolated.mjs` `SOLE_WIRING_ALLOWLIST`（恰 5）· Worker 路径只读旁证 · 配对 rag REQUEST/review · HEAD `639134f`

---

## 2. 对抗：冒充 / 漏禁 / 偷关 / 边界

### 2.1 是否错误冒充完整 E2E / covered / HA / R4 关 / wrong_track=0 已证？

| 检查 | 裁定 |
|------|------|
| 送审材料是否自称完整 E2E / covered / HA / `releaseEvidence=true`？ | **否** — 全文 `releaseEvidence=false` · Not HA · ≠ covered |
| 是否把 REQUEST / not_run 写成 wrong_track=0 已证 / ADV closed？ | **否** — A2/A7 显式未证 / gap |
| 是否把 REAL-WIRE EXIT=0 写成 ADV 已覆盖？ | **否** — A6 硬钉；假绿表首行 |
| 是否把本刀写成 R4 / 题域已隔离已关？ | **否** — A8；父轨仍 NOT closed |

**本审 Q1 答**：本刀 **未**错误冒充上述任一项。

### 2.2 harness 是否够格当 ADV 验收门，且 wire ≠ ADV？

| 检查 | 裁定 |
|------|------|
| 是否实现刀伪装？ | **否** — 明文「文档+REQUEST」；零 coding；CMD 冻结 |
| A1–A8 是否覆盖对抗 wrong_track=0 关闭条件登记？ | **是**（对齐 m4 §R4 / GAP-RAG-04；**登记 ≠ 达成**） |
| wire 绿 ≠ ADV 是否硬钉？ | **是**（A6 + §5 假绿表 + 父轨 §6f） |
| 与 REAL-WIRE-IMPL 边界是否清晰？ | **是** — wire = 接线实现刀；ADV = 跨域对抗验收门；**不可互相覆盖** |

**本审 Q2 答**：**同意**够格；**wire 绿 ≠ ADV** 已硬钉。

### 2.3 偷关 / 假绿外推面（本审重点）

| 风险说法 | 裁定 |
|---------|------|
| 「REAL-WIRE-IMPL prove 绿 / CALL_SITES=1 = wrong_track=0」 | **假绿 / 禁** — wire ≠ ADV |
| 「本 REQUEST dual pass = R4 关 / 题域已隔离 / ADV covered」 | **假绿 / 禁** — 仅文档闸 |
| 「本刀 dual pass = 已授权 ADV coding/prove」 | **假绿 / 禁** — 须 wire post-prove + **separate authorize** |
| 「NEG/FAULT companion partial = ADV 已覆盖」 | **假绿 / 禁** |
| 「G7 verification gate draft = 成功」 | **假绿 / 禁** — draft ≠ success |
| 「rag04 / g4-production-scoped-retrieve 绿 = wrong_track=0」 | **假绿 / 禁** |
| 「将来 ADV 绿 = R4 全家关」 | **假绿 / 禁** — 并列 P-R1/P-R2/P-META/P-FIX 仍开 |
| flip default / open DELETE / HA / `releaseEvidence=true` | **禁止** |
| 实现方自写 pass | **禁止**（本审拒自批） |

### 2.4 与 REAL-WIRE / 父轨边界（硬钉）

| 切片 | 批准了什么 | 未批准什么 |
|------|------------|------------|
| REAL-WIRE-IMPL | 接线实现 + prove 旁证（await post-prove dual） | wrong_track=0 · ADV covered · R4 关 |
| **本刀 ADV** | **验收门文档**诚实 + 零 coding/prove + dual 后才可 **谈** ADV 实现 | **本刀内 coding/prove** · 自动 authorize · wrong_track=0 已证 · R4 关 |

**显式钉（本审强制）**：

1. **wire 绿 ≠ ADV ≠ wrong_track=0。**  
2. **本刀 dual pass ≠ 自动授权 ADV coding。** 须 **REAL-WIRE-IMPL post-prove dual** 先过 + **separate authorize** + 另刀 prove/post。  
3. **R4 仍 NOT closed**；将来 ADV 绿仍 ≠ R4 全家关。  
4. **通过前禁 prove**；本审 **零 prove**；Worker 本刀 **应保持零改动**。

---

## 3. REQUEST Q1–Q10（对抗答）

| # | 问 | 答 |
|---|----|-----|
| 1 | 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / wrong_track=0 已证？ | **否**（未冒充）。 |
| 2 | harness 是否够格当 ADV 验收门（非实现刀），且明确 **wire 绿 ≠ ADV**？ | **是**；够格；A6 硬钉。 |
| 3 | 是否同意：本刀无 coding / 无 prove？ | **同意**。CMD=`not_run:pre_dual`；本审零 prove。 |
| 4 | 是否同意：NEG/FAULT companions **不**因本刀升 covered？ | **同意**。 |
| 5 | 是否同意：NHP-R4-ADV-01 仍 **gap/blocked**？ | **同意**（matrix §1.5 独立核验）。 |
| 6 | 是否同意：R4 仍 NOT closed；将来 ADV 绿仍 ≠ R4 全家关？ | **同意**。 |
| 7 | sole allowlist 是否因本切片扩面？（期望：**否**） | **否**（`SOLE_WIRING_ALLOWLIST` 恰 5；未扩）。 |
| 8 | 是否同意：G7 verification gate draft **≠** success？ | **同意**。 |
| 9 | 是否同意：本刀 dual pass **不**自动授权 ADV coding？ | **同意**（须 wire post-prove + separate authorize）。 |
| 10 | 是否同意：禁 flip default / open DELETE / HA？ | **同意**；且 `releaseEvidence=false`。 |

---

## 4. 静态旁证（只读 · 零 prove）

| 项 | 结果 | 读法 |
|----|------|------|
| Worker 本刀改动 | ADV 产物均为 `ai-docs/delivery/**`（harness/eval/slice/REQUEST）；harness 明示 **不改** `apps/worker/src`；本刀 **应保持零** Worker 改动 | Worker 近时改动属 **REAL-WIRE-IMPL** 前序，**≠** 本 ADV 刀 |
| `pnpm r4-wrong-track-adv:prove` | 本审 **未跑**；eval 记 `not_run:pre_dual`；CMD 冻结 | **零 prove** |
| sole allowlist | `SOLE_WIRING_ALLOWLIST` = wiring / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant（**恰 5**） | **未扩**；R4/ADV 不进 allowlist |
| NHP-R4 六列 | ADV=**gap**/blocked；NEG/FAULT/BOUND 未因本刀升 covered；PERF/LOAD **blind** | **零 covered 升格** |
| HEAD | `639134f` | 旁证钉 |

**nit（非阻塞）**：matrix §1.5 中 NHP-R4-FAULT-01 / BOUND-01 个别「仍不接线 / 主叶 scoped only」措辞相对 REAL-WIRE-IMPL 略旧；**不影响**本刀 ADV 旗（仍 gap/blocked）与「companions 不升 covered」裁定。建议后续矩阵诚实刷新，**不得**借刷新偷升 covered。

---

## 5. Blockers

| ID | 项 | 挡本刀文档闸 pass？ | 挡将来 ADV coding/prove？ |
|----|-----|---------------------|---------------------------|
| — | 本刀文档闸本身 | **无阻塞** | — |
| **B-ADV-DUAL** | 配对域须齐（mw-rag-route + 本域） | 本域可独立 pass；**dual = 两域齐** | 是（文档闸完成条件） |
| **B-WIRE-PP** | REAL-WIRE-IMPL post-prove dual | **否**（不挡文档闸） | **是**（harness B-WIRE-PP） |
| **B-AUTH** | separate authorize ADV coding | **否** | **是**（dual ≠ authorize） |
| **B-WT0** | wrong_track=0 生产读面 | **否** | 本刀将来目标（未证） |
| **P-R1/P-R2/P-META/P-FIX** | R4 关闸并列 | **否** | 挡 **R4 closed**（即使将来 ADV 绿） |

→ **本刀文档闸：无阻塞。**  
→ **ADV coding/prove：仍 blocked**（await 本刀 dual 完成 + wire post-prove + separate authorize）。本审 **不**授权 coding。

---

## 6. 结论摘要

| 项 | 值 |
|----|-----|
| **Verdict** | **pass** |
| **Scope** | **仅** ADV 验收门 **文档闸**（pre-exec REQUEST）；**≠** 实现授权 · **≠** wrong_track=0 已证 · **≠** R4 closed |
| **wire ≠ ADV** | **硬钉** |
| **dual ≠ coding authorize** | **硬钉** |
| **R4** | **仍 NOT closed** |
| **NHP-R4-ADV-01** | **仍 gap/blocked**；六列 **零 covered 升格** |
| **sole allowlist** | **恰 5 · 未扩** |
| **prove** | **本审零 prove**；CMD 仍 `not_run:pre_dual` |
| **Worker** | **本刀应保持零改动**（已核验为 docs-only） |
| **Blockers（文档闸）** | **无阻塞** |
| **Sign** | `mw-e2e-ha` |
| **配对** | `mw-rag-route`（须独立；已有 pass 不替代本域） |

---

## 7. 非宣称（再钉）

- **不**宣称 wrong_track=0 已证 / NHP-R4-ADV-01 covered / R4 closed / 题域已隔离  
- **不**宣称 wire 绿已覆盖 ADV  
- **不**宣称本 dual pass = ADV coding 已批  
- **不**宣称完整 E2E / HA / `releaseEvidence=true` / sole cutover / flip default / open DELETE  
- G7 draft **≠** success  
- 实现方 **禁止自批**；本文件为 `mw-e2e-ha` 独立对抗审

---

*Review · mw-e2e-ha · R4 wrong_track=0 ADV · PRE-EXEC 文档闸 · 2026-09-16 ~19:11 PT · pass（scope=ADV 验收门文档闸 only）· releaseEvidence=false · ≠HA · wire≠ADV · dual≠coding authorize · R4 still open · ADV still gap · sole=5 · zero prove · HEAD `639134f`*
