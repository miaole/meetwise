# Harness — R4 **wrong_track=0 ADV · LIVE_PG**（关 A3 LIVE_PG_GAP · **`post_prove_dual_pass` · honesty only**）

**状态**：**`post_prove_dual_pass`（honesty only）**  
**日期**：2026-09-16（~19:45 PT）  
**releaseEvidence=false** · **Not HA** · **≠ covered** · **pass ≠ R4 已关** · **≠ 题域已隔离** · **unit ADV ≠ LIVE_PG covered** · **LIVE_PG EXIT=0 ≠ R4 closed** · **LIVE_PG_GAP dual receipts landed（honesty）· 仍 ≠ R4 closed ≠ covered ≠ HA** · **sole allowlist 未翻** · **R5 green-risk / pgvector-legacy fixture honesty 保留** · **≠ flip default** · **≠ open DELETE**  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）  
**双审专家**：`mw-rag-route` + `mw-e2e-ha`（**pre-exec dual PASS**；**post-prove dual PASS · honesty only**）  
**父轨**：`harness/r4-domain-isolation.md` **§6g** · `r4-domain-isolation-status.md` §11  
**前序**：ADV **`post_prove_dual_pass`（ADV honesty only）** · LIVE_PG pre-exec dual **PASS** · meetwise authorize LIVE_PG coding+prove · prove EXIT=0 · `:prove:raw` no-PG EXIT=1 · post-prove dual **PASS**

---

## 0. 本刀立场（先读）

| 声明 | 裁定 |
|------|------|
| **本刀是什么** | **实现+prove 刀**：在 **live wired path**（Worker + 真 PG · 经 `retrieveViaDispatchTrackLocal`）上对抗 wrong_track=0（关 A3 LIVE_PG_GAP 的 prove 面） |
| **本刀不是什么** | **不是** R4 关闸；**不是** NHP-R4-ADV-01 covered；**不是** HA；**不是** unit ADV 的重复；**不是** R4 closed / covered（dual honesty ≠ covered） |
| **R4 是否已关？** | **否。题域隔离 NOT closed。禁宣称 R4 closed。** |
| **ADV dual ≠ LIVE_PG** | §6f ADV honesty dual **≠** 本刀 closed；unit+map **≠** full live Worker+PG |
| **LIVE_PG_GAP** | **dual receipts landed（honesty）** — 仍钉 **≠ R4 closed ≠ covered ≠ HA**；sole 未翻；R5/pgvector-legacy fixture honesty 保留 |
| **G-R2-5 / P-FAKEPLAN** | **保留**；禁 unscoped / sibling / legacy_unrouted |
| **证据** | `releaseEvidence=false`；Not HA；禁 flip default / open DELETE / 实现方自批 |

---

## 1. 验收标准（L1–L8）· 实现对照

| ID | 要求 | 本刀实现 |
|----|------|----------|
| **L1** | 在 **live wired** retrieve 上跑对抗（真 PG；经 `retrieveViaDispatchTrackLocal`） | `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` + isolated PG |
| **L2** | 跨域 wrong_track must be 0（live 路径可观测） | happy path via retrieveVia；零 java 出题 |
| **L3** | A3 对抗面 **live**：cache poison · 并发改岗 · metadata 篡改 · 伪造/缺失 metadata · 未知分类 · 旧 checkpoint | prove L3 节；fail-closed degraded |
| **L4** | fail-closed；保留 G-R2-5；禁 P-FAKEPLAN；不回退 unscoped / sibling / legacy_unrouted | prove L4 |
| **L5** | 不得用 pgvector 假绿 / rag04 seam 冒充 Worker+PG live ADV 已关 | 硬钉；本 prove = Worker retrieveVia + PG |
| **L6** | ADV honesty dual / unit+map 绿 ≠ LIVE_PG closed | 硬钉 |
| **L7** | NHP-R4-ADV-01 | 仍 **partial**/honesty-pin；本刀 dual **不**自动升 **covered** |
| **L8** | LIVE_PG dual/prove 绿 ≠ R4 closed | 硬钉；并列 P-R1 / P-R2 / P-META / P-FIX 仍开 |

### 1.2 NEG / FAULT companions（登记 · 不升格）

| Companion | Case ID | 本刀 |
|-----------|---------|------|
| NEG / FAULT / BOUND | NHP-R4-* | **不**因本刀升 covered |
| ADV | **NHP-R4-ADV-01** | 仍 **partial**/honesty-pin；**≠ covered** |
| PERF / LOAD | blind | 本刀不跑 |

---

## 2. 代码 / 旁证锚点

| 路径 | 角色 |
|------|------|
| `apps/worker/src/qbank-track-local-retrieve.ts` | wired `retrieveViaDispatchTrackLocal`（CALL_SITES=1） |
| `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` | **本刀 LIVE_PG prove** |
| `apps/worker/test/r4-wrong-track-adv.proof.ts` | 前序 unit+map prove（**≠** 本刀 live） |
| `packages/domain` / `packages/db` | wrong_track assert + recheck 谓词 |
| rag04 | 合同 seam live 旁证；**≠** 本刀 Worker retrieveVia LIVE_PG closed |

---

## 3. CMD 表（实现方实测 · 专家独立复跑）

| CMD | EXIT | 读法 |
|-----|------|------|
| **`pnpm r4-wrong-track-adv-live-pg:prove`** | **0** | live Worker+PG via retrieveVia；L1–L4；**≠ covered**；**≠ R4 closed**；**LIVE_PG_GAP dual receipts landed（honesty）** |
| **`pnpm r4-wrong-track-adv-live-pg:prove:raw`**（no-PG） | **1** | fail-closed；skip≠pass；禁 in-memory 假绿 |
| `pnpm r4-wrong-track-adv:prove` | 旁证 0 | **≠** LIVE_PG closed；unit+map only |

```bash
pnpm r4-wrong-track-adv-live-pg:prove
```

| 本刀执行旗 | 值 |
|------------|-----|
| run-status | **`post_prove_dual_pass`（honesty only）** |
| Worker / domain 改动 | **有**（prove + CMD wire；无 sole-stack flip；无 DELETE） |
| 实现方自批 | **禁止**（post-prove 须专家独立 reviews） |

---

## 4. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「ADV dual / unit prove 绿 = LIVE_PG / full live ADV 已关」 | **假绿** — unit ≠ LIVE_PG |
| 「本刀 EXIT=0 / dual honesty = R4 关 / covered / HA」 | **假绿** — dual receipts landed ≠ covered ≠ R4 closed ≠ HA |
| 「rag04 绿 = Worker retrieveVia live ADV 全关」 | **旁证 ≠ 本刀 covered** |
| P-FAKEPLAN / 削弱 G-R2-5 / 回退 unscoped | **禁止** |
| flip default / open DELETE / HA / `releaseEvidence=true` | **禁止** |
| 实现方自写 pass review | **禁止** |

---

## 5. Dual-review

| 阶段 | 专家 | 路径 | 状态 |
|------|------|------|------|
| pre-exec | `mw-rag-route` | `2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md` | **pass** |
| pre-exec | `mw-e2e-ha` | `2026-09-16-r4-wrong-track-adv-live-pg-mw-e2e-ha.md` | **pass** |
| post-prove | `mw-rag-route` | `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md` | **pass（honesty only）** |
| post-prove | `mw-e2e-ha` | `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md` | **pass（honesty only）** |

---

## 6. 非目标 / 禁止宣称

- **不**宣称 NHP-R4-ADV-01 covered / R4 closed / 题域已隔离 / HA  
- **LIVE_PG_GAP dual receipts landed（honesty）** ≠ covered ≠ R4 closed ≠ HA  
- `releaseEvidence=false`；sole allowlist **未翻**；R5 green-risk / pgvector-legacy fixture honesty **保留**  
- 实现方 **禁止自批**（本旗依据专家独立 post-prove dual pass）

---

*Harness · R4 wrong_track ADV LIVE_PG · 2026-09-16 ~19:45 PT · post_prove_dual_pass（honesty only）· releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · LIVE_PG_GAP dual receipts landed（honesty）· sole 未翻 · R5/pgvector-legacy honesty retained*
