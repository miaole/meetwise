# 审查归档 — G7 MAIN · sole夹具退役 ⋂ scor-00 **post-prove** · mw-e2e-ha

**日期**：2026-09-16 ~19:55–19:56 PT（本审独立复跑）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · post-prove；**不采信**实现方自报 EXIT；**拒绝自批**）  
**送审**：`REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-e2e-ha.md`  
**前序 pre-exec**：`2026-09-16-g7-sole-fixture-retire-scor00-mw-e2e-ha.md`（**pass** · 执行前文档闸 only · `not_run:pre_dual`）  
**配对**：`REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-rag-route.md`（**须独立写**；冲突取更严；**本审不代签**）  
**结论**：**pass**（**仅** sole∩scor-00 授权落地后 post-prove 诚实复跑绿）  
**批准范围**：**仅**「六 CMD 专家独立复跑 EXIT=0 + sole honesty path / legacy 禁升格 / allowlist 恰 5 未扩 / G1 未翻默认 / Nest-on-MySQL GAP 仍开」——**不批** R5 retired · G1 flip · sole cutover complete · suite green · covered · HA · `releaseEvidence=true` · Nest scor-00 on MySQL · R2/R4 closed · 关闸  
**硬钉**：`releaseEvidence=false` · **≠HA** · **≠ covered** · **≠ R5 retired** · **≠ G1 flip** · **≠ R4 closed** · **≠ suite green** · **EXIT=0 ≠ covered ≠ R5 retired ≠ G1 flip ≠ R4 closed ≠ suite green ≠ HA** · **pass ≠ 关闸** · Nest-on-MySQL scor **仍 GAP**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — sole∩scor-00 授权 exec 后六 CMD 独立复跑绿；NOT R5 retired · NOT G1 flip · NOT sole cutover complete · NOT Nest-on-MySQL covered · NOT suite green · NOT HA |
| 实现方自报 EXIT=0 | **不采信**；本审独立复跑为准 |
| 本审 6× CMD+EXIT | 全 **EXIT=0**（~19:55–19:56 PT）— 见 §2 |
| EXIT=0 = R5 retired / G1 flip / R4 closed？ | **否** |
| EXIT=0 = covered / suite green / HA？ | **否** |
| legacy `scor-00:http:prove` EXIT=0 = sole / G7 close alone？ | **否** — R5-MARKED-RED + `[G7-SCOR00-PG-FIXTURE]` |
| sole-fixture EXIT=0 = Nest-on-MySQL？ | **否** — prove 自钉 **PREREQ GAP** |
| `SOLE_WIRING_ALLOWLIST` | **恰 5** · scor **NOT** listed · **本刀未扩** |
| `E2E_ISOLATION_STACK` default | **仍** `pgvector-legacy` · **未 flip** |
| Nest scor-00 on MySQL | **仍 GAP / PREREQ open** |
| `releaseEvidence` | **false** |
| HA | **≠HA** |
| pass = 关闸？ | **否** — **pass ≠ 关闸** |
| 配对 mw-rag-route | **独立待审**；不替代本域 |
| 阻塞（本域 post-prove） | **无**（见 §4；剩余为硬非关闸 / 仍开 GAP） |

---

## 1. 对照（已读 · 本审）

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST post-prove | `reviews/REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-e2e-ha.md` | 预写 · 禁自批 · 待专家复跑 |
| pre-exec | `reviews/2026-09-16-g7-sole-fixture-retire-scor00-mw-e2e-ha.md` | **pass** 文档闸 only |
| Knife harness | `harness/g7-sole-fixture-retire-scor00.md` | `executed:awaiting_post_prove_dual` · T1–T6 · allowlist 恰 5 |
| G1 / R5 pins | `harness/g1-default-switch-prep.md` · `harness/r5-retirement-sole-stack-status.md` | flip NOT open · marked-red ≠ retired |
| Allowlist SSOT | `scripts/run-e2e-isolated.mjs` `SOLE_WIRING_ALLOWLIST` | **恰 5** · scor 未入表 · `[G7-SCOR00-SOLE-PREREQ]` / `[G7-SCOR00-PG-FIXTURE]` |
| Sole prove | `scripts/g7-scor00-sole-fixture.proof.mjs` | standalone · Nest-on-MySQL = GAP note |
| Legacy Nest | `apps/api/test/scor-00-http-db.proof.ts` | PG Client · createJob+classify seed · ≠ sole |
| 本审收据目录 | `.tmp/g7-scor00-post-prove-ha-rerun-20260916/` | 01..06 logs · **本审权威** |

**Repo**：`/workspace/meetwise` only。**未**读 `.env*`。**未** Meridian。**未** flip default / 扩 allowlist / invent Key / 自批 pass。

---

## 2. 独立复跑 CMD+EXIT（权威 · ~19:55–19:56 PT）

| # | CMD | EXIT | 诚实读法（本审强制） |
|---|-----|------|----------------------|
| 1 | **`pnpm scor-00:sole-fixture:prove`** | **0** | sole honesty + compose reachability（MySQL:33069 Redis:63809 Qdrant:6333）；**≠** R5 retired · **≠** Nest-on-MySQL · **≠** suite green · **≠** HA · allowlist 恰 5 · scor NOT listed · `releaseEvidence=false` |
| 2 | **`pnpm scor-00:http:prove`** | **0** | legacy Nest HTTP · **pgvector-legacy** opt-in · 见 `[R5-MARKED-RED]` + `[G7-SCOR00-PG-FIXTURE]`；**≠** sole capacity · **≠** sole cutover · **≠** R5 retired · **≠** G7 scor close alone |
| 3 | **`pnpm scor-00-honesty:prove`** | **0** | domain scoring-honesty（21 scenarios）；**≠** product close · **≠** G7 close alone · `releaseEvidence=false` |
| 4 | **`pnpm g1-default-switch:prep:prove`** | **0** | prep landed · **flip NOT open** · default **仍** `pgvector-legacy` · allowlist **恰 5**；prep ≠ flip |
| 5 | **`pnpm mysql-stack:r5-mark-red:prove`** | **0** | marked-red honesty pins only；**≠** R5 retired · **≠** RAG migrated · **≠** fixtures retired · `releaseEvidence=false` · Not HA |
| 6 | **`pnpm e2e-isolation:sole-wiring:prove`** | **0** | sole allowlist **sample**（wiring）；shared compose ≠ disposable · **≠** default sole · scor **仍** off allowlist · `SOLE_ALLOWLIST_RECEIPT` `release_evidence=false` |

**对照实现方自报**：EXIT 数字一致（全 0）。**仍以本审复跑为准**。

**关键本审 log 摘录**：

- sole-fixture：`PASS  runner: SOLE_WIRING_ALLOWLIST exactly 5 · scor-00 NOT on allowlist` · `NOTE  GAP: Nest scor-00 HTTP prove body still PG Client … MySQL sole Nest port = PREREQ open` · `OK  … ≠ R5 retired ≠ suite green ≠ Nest-on-MySQL ≠ HA`
- http：`[G7-SCOR00-PG-FIXTURE] scor-00:http:prove on pgvector-legacy is R5 green-risk opt-in only — ≠ sole capacity … SOLE_WIRING_ALLOWLIST unchanged (scor NOT listed)` · Nest 410 证明全 PASS
- g1-prep：`PASS  … unset E2E_ISOLATION_STACK → LEGACY_STACK` · `PASS  … sole allowlist exactly 5` · `NOTE  … prep landed != flip · default unchanged=pgvector-legacy`
- sole-wiring：`[R5-SOLE-WIRING] … ≠ default switch · ≠ fixtures retired` · MySQL/Redis/Qdrant ping OK · receipt `release_evidence=false`

**Allowlist 本审核**：

```
size=5
sole-stack:wiring:prove
sole-stack:ping:prove
sole-stack:qdrant-backed:prove
sole-stack:vectorstore-adapter:prove
sole-stack:vectorstore-qdrant:prove
scor_listed=false
```

---

## 3. REQUEST Q1–Q6（对抗答）

| # | 问 | 本审 |
|---|----|------|
| **Q1** | 独立复跑 CMD 表；EXIT + honesty（尤其 sole-fixture vs legacy http）？ | **已复跑。** 六 CMD 全 EXIT=0。sole-fixture = sole honesty/reachability；legacy http = R5-MARKED-RED opt-in **≠** sole。二者 **不得**混读。 |
| **Q2** | T1–T5：plan/reachability ≠ flip；去 legacy 假绿 banner 够？sole path standalone（未静默扩 allowlist）？ | **同意。** T1 reachability 绿 ≠ flip；T2 `[G7-SCOR00-PG-FIXTURE]` / R5-MARKED-RED 在场；T3 sole path = standalone `scor-00:sole-fixture:prove`；allowlist **未扩**（恰 5 · scor 外）；T4/T5 honesty 绿 ≠ product/R5 retired。 |
| **Q3** | `SOLE_WIRING_ALLOWLIST` 恰 5 · scor 未入表 · **未 flip** default？ | **确认。** 源码 Set 恰 5；scor_listed=false；unset → `LEGACY_STACK=pgvector-legacy`；G1 prep prove 钉 flip NOT open。 |
| **Q4** | legacy `scor-00:http:prove` EXIT=0 **不得**升格 sole / R5 retired / G7 close alone？ | **同意（硬）。** banner 明文；本审批准范围排除升格。 |
| **Q5** | Nest-on-MySQL PREREQ GAP 仍开 · R5 not fully retired · R2/R4 still open？ | **确认仍开。** sole-fixture NOTE 钉 Nest PG Client / MySQL Nest port = PREREQ；R5 mark-red ≠ retired；R2/R4 正交仍开（本刀未关）。 |
| **Q6** | 实现方未自批 pass；本 REQUEST ≠ pass？ | **同意。** 本审拒绝自批；REQUEST 为 awaiting；本 **pass** 仅 post-prove honesty 范围 · **pass ≠ 关闸**。 |

---

## 4. 阻塞 / 非阻塞

| 类 | 项 |
|----|-----|
| **阻塞（本域 post-prove）** | **无** |
| **硬非关闸 / 仍开** | Nest scor-00 on **MySQL** = **PREREQ GAP** · R5 **not fully retired** · G1 flip **NOT open** · R2/R4 **still open** · sole allowlist **恰 5**（scor 外）· suite green / HA / `releaseEvidence=true` **未宣称** |
| **假绿禁令** | EXIT=0 ≠ R5 retired ≠ G1 flip ≠ R4 closed ≠ suite green ≠ covered ≠ HA；legacy http 绿 ≠ sole；sole-fixture 绿 ≠ Nest-on-MySQL；`releaseEvidence=false` |
| **配对** | `mw-rag-route` post-prove **独立**；冲突取更严；本审不代签 |

---

## 5. Hard pins（再钉）

- **EXIT=0 ≠ covered ≠ R5 retired ≠ G1 flip ≠ R4 closed ≠ suite green ≠ HA**
- **`SOLE_WIRING_ALLOWLIST` 恰 5 · scor NOT listed · 本刀未扩**
- **Nest-on-MySQL scor 仍 GAP**
- **`releaseEvidence=false` · ≠HA**
- **Reject self-pass** · pair **mw-rag-route** independently
- **pass ≠ 关闸**
- Sign：`mw-e2e-ha`

---

## 6. Sign-off

| 项 | 值 |
|----|-----|
| Expert | `mw-e2e-ha` |
| Verdict | **pass**（post-prove honesty only） |
| releaseEvidence | **false** |
| HA | **≠HA** |
| Nest-on-MySQL scor | **GAP** |
| Allowlist size | **5**（scor 外） |
| Pair | `mw-rag-route` **独立待审** |

*Review · mw-e2e-ha · G7 sole∩scor-00 post-prove · 2026-09-16 ~19:56 PT · releaseEvidence=false · ≠HA · pass≠关闸*
