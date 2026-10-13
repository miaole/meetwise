# Review — **R1 real close / SSOT flip** **post-prove** · mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~19:55 PT；对抗独立审 · **不采信**实现方自报 EXIT；实现方禁止自批 · Ban 假关 · Ban 升 EXIT=0→R1 closed）  
**结论**：**pass**（限：post-prove honesty — 专家独立复跑 EXIT **3×0** · knife 仍 **`executed:awaiting_post_prove_dual`** · **SSOT NOT flipped** · **R1 STILL OPEN** · **G-R4-3 STILL OPEN** · **GAP-RAG-01 / m4 §R1 仍开** · **PR1-A true · PR1-B/C false** · Ban flip default · **≠ R1 closed** · **≠ route-effective** · **≠ HA** · **≠ suite** · **≠ FUNNEL/R4/题域 closed** · `releaseEvidence=false` · RAG 正交）  
**硬钉**：**EXIT=0 ≠ R1 closed ≠ G-R4-3 closed ≠ GAP-RAG-01 closed ≠ production no-legacy-default ≠ route-effective ≠ HA ≠ suite green ≠ flip authorized ≠ SSOT flipped** · **Ban 假关** · **Ban 升 EXIT=0→R1 closed** · **Ban self-write `post_prove_dual_pass`**（本审写 pass ≠ 实现方自写 dual_pass）· HEAD **`0deb5fb`** · 未读 `.env*` · 未触 Meridian · 未 force-push · PG+pgvector retained  
**配对**：mw-e2e-ha · 本审不代签 · 不代写对方 pass · 不代改 harness status（coordinator 可在双域齐后推进 · **仍 ≠ R1 closed** · **SSOT flip 仍须 L5 + explicit close authorize**）

覆盖 REQUEST：`REQUEST-2026-09-17-r1-real-close-ssot-flip-post-prove-mw-rag-route.md`  
对照：`receipts/2026-09-17-r1-real-close-ssot-flip-prove.md` · `harness/r1-real-close-ssot-flip.md` · `harness/r1-tech-role-fail-closed.md` · `harness/r4-f4-p-r1-fail-closed.md` · `harness/r4-domain-isolation-status.md` §2 G-R4-3 · `m4-rag-hard-gates.md` §R1 · GAP-RAG-01 · `harness/r1-close-authorize-receipt.md`（≠ this · docs knife）· `docker/env/worker.env.example` · `apps/worker/src/adaptive-role-resolve.ts` · Pre-exec `2026-09-17-r1-real-close-ssot-flip-mw-rag-route.md`（pass on `8912a12` / tip `fbc66a2`）

**本审动作**：读 prove receipt + REQUEST + knife/SSOT 目标 · **独立复跑 3 CMD** · 抽查 SSOT **未**翻成产品关闸声明 · 确认 flag 默认仍 off · **未宣称** R1 / HA / FUNNEL/R4/题域 closed · **未宣称** route-effective · **未翻** SSOT · **未读** `.env*` · **未触** Meridian · 仅写本 review

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass**（post-prove honesty only） |
| **Scope** | 确认 prove 绿 + 诚实钉仍硬 · **NOT** R1 product close · **NOT** SSOT flip · **NOT** flip default |
| Implementer self-approve / self-write `post_prove_dual_pass` | **rejected** · knife 仍 **`executed:awaiting_post_prove_dual`** |
| HEAD / SHA | **`0deb5fb`**（`0deb5fb59c48c1dd56fab2aaa530954958d09b78`）· `feat(r1-ssot): standing prove under authorize (awaiting_post_prove_dual)` |
| Expert re-run | **3×0**（见 §1） |
| SSOT flip | **NOT flipped**（§4 目标仍 plan-only / 产品关闸声明未写） |
| R1 claim | **R1 STILL OPEN** · Ban 升 EXIT=0→closed |
| G-R4-3 / GAP-RAG-01 | **STILL OPEN** · PR1-B/C false |
| Flag default | **仍 OFF** · `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` · `isTechRoleFailClosedEnabled({})===false` |
| `releaseEvidence` | **false** |
| ≠HA / ≠suite / ≠route-effective | **硬钉** |
| ≠ docs knife | **`f9119fe` / `2316bbc`** = checklist only · **≠** 本刀产品关 |
| Blockers（本域 post-prove） | **none**（honesty 门够格）；产品关闸仍挡：**PR1-B/C** · **G-R4-3** · **L5 SSOT flip + explicit close authorize 未到** |

---

## 1. Independent re-run（~19:55 PT · HEAD `0deb5fb`）

日志：`.tmp/r1-real-close-post-prove-mw-rag-route/{r1-tech-role-fail-closed,r4-p-r1-fail-closed,mysql-stack-m4-rag}.{log,exit}`

| # | CMD | EXIT | 诚实读法 |
|---|-----|------|----------|
| 1 | `pnpm r1-tech-role-fail-closed:prove` | **0** | 合同绿（E1–E9）· harness 钉 **R1 是否已关？否** · **≠ R1 closed** · **≠ GAP-RAG-01 closed** · **≠** 生产 fail-closed default-on |
| 2 | `pnpm r4-p-r1-fail-closed:prove` | **0** | F4 honesty · **PR1-A true** · **PR1-B/C false** · **G-R4-3 STILL OPEN** · no flip default · spawn r1 EXIT=0 **≠** R1 closed |
| 3 | `pnpm mysql-stack:m4-rag:prove` | **0** | §R1 doc gate · adaptive-role + legacy default pin · R4 NOT closed 仍在 · **≠ product close** · **≠ route-effective** |

**与实现方 receipt 对齐**：claimed EXIT **3×0** · 专家独立复跑确认 **3×0** · Ban invent EXIT。

**Key 读法（CMD2 honesty summary）**

- PR1-A：default flag OFF · legacy「技术岗」on · `productionDependsOnLegacy=true`
- PR1-B：`flagOnContractUnit=true` · `comboRootFlagOnEvidence=false` · **no flip**
- PR1-C：r1 prove exit=0 **≠** R1 closed
- PR1-D：≠ R1/R4 closed · `releaseEvidence=false` · ≠HA · G-R4-5 parallel open

---

## 2. REQUEST Q1–Q5（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | 抽查/复跑至少 r1 + m4-rag prove，附 CMD+EXIT | **已做（且三 CMD 全复跑）** · 见 §1 · **3×0** |
| **2** | GAP-RAG-01 / m4 §R1 honesty：prove 绿 ≠ R1 closed ≠ production no-legacy-default？ | **同意（硬钉）**。m4 §R1：**R1 未关直至**生产不再依赖 legacy 默认 **且** flag-on 组合根证据；**本绿 ≠ R1 closed**。GAP-RAG-01：**R1 仍未关**。legacy 默认仍开 · flag 默认 off。 |
| **3** | **R1 STILL OPEN** / **G-R4-3 STILL OPEN** / **SSOT NOT flipped** / Ban flip default / ≠ route-effective 是否仍硬钉？ | **同意（硬钉）**。抽查 knife §0/§4 · r1 harness · F4 · status §2 G-R4-3 · m4 §R1 · env.example=`0` · 全部仍钉。 |
| **4** | 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）？ | **同意**。knife 头条仍 **`executed:awaiting_post_prove_dual`** · 实现方 **未** 自写 `post_prove_dual_pass` · 本审 pass ≠ 代写 dual_pass · L5 SSOT flip **仍禁**直至双域齐 + explicit close authorize。 |
| **5** | 是否引入 secrets / Meridian / force-push / HA/suite/`releaseEvidence=true` / 题域假关？ | **否**（期望达成）。本审未读 `.env*` · 未触 Meridian · 未见 force-push · `releaseEvidence=false` · ≠HA/suite · **题域/R4/FUNNEL 仍开** · RAG 正交。 |

---

## 3. SSOT flip 抽查（§4 目标 · **NOT flipped**）

| Target | Observed | Ruling |
|--------|----------|--------|
| `harness/r1-tech-role-fail-closed.md` | **R1 是否已关？否** · flag 默认 off · pass ≠ R1 已关 | **NOT flipped** |
| `harness/r4-f4-p-r1-fail-closed.md` · G-R4-3 | `post_prove_dual_pass`（F4 honesty）· **PR1-B/C false** · **G-R4-3 STILL OPEN** · no flip | **NOT flipped to product closed** |
| `harness/r4-domain-isolation-status.md` §2 G-R4-3 | R1 PREREQ **未关** · **G-R4-3 STILL OPEN** | **NOT flipped** |
| `m4-rag-hard-gates.md` §R1 · GAP-RAG-01 | **R1 未关** · 本绿 ≠ R1 closed · legacy 回退仍开 | **NOT flipped** |
| `harness/r1-close-authorize-receipt.md` | docs knife · **≠ R1 closed** · checklist only | **NOT rewritten as product close** |
| `harness/r1-real-close-ssot-flip.md` | **`executed:awaiting_post_prove_dual`** · **SSOT NOT flipped** · L5 forbidden until L4 | **status honest** |
| `docker/env/worker.env.example` | `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` | **未 flip default** |

---

## 4. Ban elevating EXIT=0 → R1 closed（本审硬拒）

| Claim | Ruling |
|-------|--------|
| prove EXIT=0 ⇒ R1 closed | **Ban** · 合同绿 ≠ 产品关 |
| prove EXIT=0 ⇒ GAP-RAG-01 closed | **Ban** |
| prove EXIT=0 ⇒ G-R4-3 closed / PR1-B/C true | **Ban** · PR1-B/C **仍 false** |
| prove EXIT=0 ⇒ flip default / SSOT flipped | **Ban** · L5 未授权 |
| prove EXIT=0 ⇒ route-effective / HA / suite / FUNNEL/R4/题域 closed | **Ban** |
| docs knife `f9119fe`/`2316bbc` Dual PASS ⇒ R1 closed | **Ban** · ≠ this knife · checklist only |
| 本审 post-prove **pass** ⇒ R1 closed / `post_prove_dual_pass` 已写 | **Ban** · pass = honesty 同意 · knife status 仍 await · 实现方禁自写 dual_pass |

---

## 5. Non-claims / 硬钉保留

- **R1 STILL OPEN** until prove + post-prove dual + **explicit close authorize**
- **G-R4-3 STILL OPEN until evidence** · PR1-A true · **PR1-B/C false**
- **SSOT NOT flipped** · L5 waits dual + close auth
- **≠ route-effective** · **≠ HA** · **≠ suite** · **≠ FUNNEL/R4/题域 closed**
- `releaseEvidence=false` · Ban 假关 · Ban false green · Ban secrets · Ban Meridian · Ban force-push
- PG+pgvector+PostgresSaver retained · RAG 正交（本刀 ≠ retrieve quality green / cutover）
- ≠ docs knife `f9119fe` / `2316bbc`

---

## 6. Blockers

| Blocker | Status |
|---------|--------|
| PR1-B production / combo-root flag-on evidence | **missing · STILL OPEN** |
| PR1-C default-on / no-legacy path | **missing · STILL OPEN** · Ban flip without close authorize |
| L5 SSOT flip + explicit close authorize | **not yet** · waits post-prove dual complete |
| Product R1 / GAP-RAG-01 close claim | **blocked** · Ban 假关 |

本域 post-prove honesty：**无新增 blocker**（prove 可复现 · SSOT 未假翻 · status 诚实）。产品关闸 blockers **仍开**（上表）。

---

*Review · mw-rag-route · R1 real-close SSOT-flip **post-prove** · 2026-09-17 ~19:55 PT · HEAD `0deb5fb` · expert EXIT 3×0 · pass（honesty）· R1 STILL OPEN · G-R4-3 STILL OPEN · SSOT NOT flipped · Ban 假关 · Ban 升 EXIT=0→R1 closed · releaseEvidence=false · ≠HA · ≠suite · ≠route-effective · knife=`executed:awaiting_post_prove_dual`*
