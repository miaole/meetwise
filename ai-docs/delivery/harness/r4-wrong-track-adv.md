# Harness — R4 **wrong_track=0 ADV**（对抗跨域 · **post_prove_dual_pass · ADV honesty only**）

**状态**：`post_prove_dual_pass`（**ADV honesty only**）  
**日期**：2026-09-16（~19:22 PT）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **wire 绿 ≠ wrong_track=0 closed** · **ADV 绿 ≠ R4 closed** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）  
**双审专家**：`mw-rag-route` + `mw-e2e-ha`（**pre-exec dual PASS**；**post-prove dual PASS · ADV honesty only**）  
**父轨**：`harness/r4-domain-isolation.md` §6c / §6e / **§6f（本刀）** · `r4-domain-isolation-status.md`  
**前序**：REAL-WIRE-IMPL `post_prove_dual_pass`（wire honesty only）· ADV pre-exec dual **PASS** · meetwise authorize coding+prove · ADV prove EXIT=0 · post-prove dual **PASS**  
**next**：**LIVE_PG full-path ADV**（§6g · `post_prove_dual_pass` · honesty only · **LIVE_PG_GAP dual receipts landed（honesty）** · 仍 ≠ covered ≠ R4 closed ≠ HA）

---

## 0. 本刀立场（先读）

| 声明 | 裁定 |
|------|------|
| **本刀是什么** | **实现+prove 刀（已 dual-close）**：在 **已接线** retrieve（planner→validate→assemble→`dispatchTrackLocalRetrieval`→recheck）上对抗 **wrong_track=0**；生产 assert hooks + `pnpm r4-wrong-track-adv:prove` |
| **本刀不是什么** | **不是** R4 关闸；**不是** NHP-R4-ADV-01 covered；**不是** HA；**不是** full live Worker+PG ADV 已关 |
| **R4 是否已关？** | **否。题域隔离 NOT closed。** |
| **wire 绿 ≠ ADV** | REAL-WIRE-IMPL ≠ 本刀；本刀绿 **≠** R4 closed |
| **ADV 绿 ≠ R4 closed** | A8；并列 P-R1 / P-R2 / P-META / P-FIX 仍开 |
| **LIVE_PG_GAP** | **dual receipts landed（honesty · §6g）** — 仍钉 ≠ covered ≠ R4 closed ≠ HA；本刀 = wired Worker + domain asserts + 静态 recheck 谓词（unit+map）；LIVE_PG = `post_prove_dual_pass`（honesty only） |
| **G-R2-5 / P-FAKEPLAN** | **保留**；禁 unscoped / sibling / legacy_unrouted |
| **证据** | `releaseEvidence=false`；Not HA；禁 flip default / open DELETE / 实现方自批 |

---

## 1. 验收标准（A1–A8）· 本刀实现对照

| ID | 要求 | 本刀实现 |
|----|------|----------|
| **A1** | 在 **已接线** retrieve 上跑对抗 | `retrieveViaDispatchTrackLocal` + CALL_SITES=1；prove 静态+unit |
| **A2** | 跨域 wrong_track must be 0 | `countWrongTrackHits` / `assertWrongTrackZero` / `enforceWrongTrackZeroOnServed` |
| **A3** | 伪造/缺失 metadata · 未知分类 · 岗位并发修改 · 旧 checkpoint · cache 回放 | domain validate + Worker `scoredRefsFromDispatch`/`mapRecheckFailedToRefs` 映射全 `R4_WRONG_TRACK_RECHECK_REASONS`；LIVE_PG dual honesty landed（§6g）；unit+map ≠ covered |
| **A4** | fail-closed；不回退兄弟叶 / unscoped / legacy_unrouted；保留 G-R2-5；禁 P-FAKEPLAN | prove A4 + helper/consumer 钉 |
| **A5** | 不得用 pgvector 假绿冒充 sole-stack | 钉；本 prove 无 pgvector 假绿 |
| **A6** | wire 绿 ≠ ADV 关 | 硬钉 |
| **A7** | NHP-R4-ADV-01 | **partial**/honesty-pin（prove 存在）；**≠ covered**；**≠ R4 closed** |
| **A8** | ADV dual/prove 绿 ≠ R4 closed | 钉 |

### 1.2 NEG / FAULT companions（登记 · 不升格）

| Companion | Case ID | 本刀 |
|-----------|---------|------|
| NEG | NHP-R4-NEG-01 | **partial**；不因 ADV 升 covered |
| FAULT | NHP-R4-FAULT-01 | honesty；不升 covered |
| BOUND | NHP-R4-BOUND-01 | honesty；≠ wrong_track=0 covered |
| ADV | **NHP-R4-ADV-01** | **partial**/honesty-pin；**≠ covered** |
| PERF / LOAD | blind | 本刀不跑 |

---

## 2. 代码锚点

| 路径 | 角色 |
|------|------|
| `packages/domain/src/qbank-track-local-retrieval.ts` | `countWrongTrackHits` / `assertWrongTrackZero` / `R4_WRONG_TRACK_RECHECK_REASONS` |
| `apps/worker/src/qbank-track-local-retrieve.ts` | wired retrieve + `enforceWrongTrackZeroOnServed` + `mapRecheckFailedToRefs` |
| `packages/db/src/qbank-track-local-retrieval.ts` | `recheckHitsAtLeaf` 生产谓词（静态旁证） |
| `apps/worker/test/r4-wrong-track-adv.proof.ts` | 本刀 prove |
| rag04（旁证） | 合同 seam live ADV；**≠** 本刀 Worker+PG live 已关 |

---

## 3. CMD 表（实现方实测 · 专家独立复跑）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm r4-wrong-track-adv:prove`** | **0** | wired CALL_SITES=1；wrong_track assert；A3 unit+map；fail-closed；LIVE_PG_GAP honesty；**≠ covered**；**≠ R4 closed** |
| `pnpm r4-real-wire-impl:prove` | 旁证 0 | **≠** ADV covered / **≠** LIVE_PG closed |

```bash
pnpm r4-wrong-track-adv:prove
```

| 本刀执行旗 | 值 |
|------------|-----|
| run-status | **`post_prove_dual_pass`（ADV honesty only）** |
| Worker / domain 改动 | **有**（assert hooks + prove；已 dual-close） |
| 实现方自批 | **禁止**（已由专家独立 reviews） |

---

## 4. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「REAL-WIRE EXIT=0 = wrong_track=0 / ADV covered」 | **假绿** — wire ≠ ADV |
| 「本刀 EXIT=0 / dual pass = R4 关 / 题域已隔离 / covered」 | **假绿** — A7/A8；partial ≠ covered |
| 「LIVE_PG dual honesty = covered / R4 关」 | **假绿** — dual receipts landed ≠ covered ≠ R4 closed ≠ HA |
| 「rag04 绿 = Worker retrieveVia ADV 全关」 | **旁证 ≠ 本刀 covered** |
| P-FAKEPLAN / 削弱 G-R2-5 / 回退 unscoped | **禁止** |
| flip default / open DELETE / HA / `releaseEvidence=true` | **禁止** |
| 实现方自写 pass review | **禁止** |

---

## 5. Dual-review

| 阶段 | 专家 | 路径 | 状态 |
|------|------|------|------|
| pre-exec | `mw-rag-route` | `2026-09-16-r4-wrong-track-adv-mw-rag-route.md` | **pass** |
| pre-exec | `mw-e2e-ha` | `2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md` | **pass** |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md` | **pass（ADV honesty only）** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md` | **pass（ADV honesty only）** |

---

## 6. 非目标 / 禁止宣称

- **不**宣称 NHP-R4-ADV-01 covered / R4 closed / 题域已隔离 / HA  
- **不**宣称 NHP-R4-ADV-01 covered / R4 closed（LIVE_PG dual honesty **≠ covered**）  
- `releaseEvidence=false`；实现方 **禁止自批**  
- **LIVE_PG** = §6g `post_prove_dual_pass`（honesty only）；**LIVE_PG_GAP dual receipts landed（honesty）**

---

*Harness · R4 wrong_track=0 ADV · 2026-09-16 ~19:45 PT · post_prove_dual_pass（ADV honesty only）· releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · LIVE_PG=post_prove_dual_pass（honesty only）· LIVE_PG_GAP dual receipts landed*
