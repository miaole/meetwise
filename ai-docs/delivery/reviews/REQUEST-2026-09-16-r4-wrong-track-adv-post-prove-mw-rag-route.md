# REQUEST — R4 **wrong_track=0 ADV** **post-prove**（RAG/路由）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:15 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **ADV 绿 ≠ R4 closed** · **wire 绿 ≠ ADV closed** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md`  
**硬闸**：`north-star-hard-gates.md` 已生效 · ADV pre-exec dual pass · REAL-WIRE-IMPL post-prove dual pass · meetwise authorize coding+prove  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ covered）**：`2026-09-16-r4-wrong-track-adv-mw-rag-route.md` · `2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md`  
**本刀**：ADV assert hooks + `pnpm r4-wrong-track-adv:prove`；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-wrong-track-adv.md` | 本刀 harness（implemented + CMD+EXIT） |
| `eval/r4-wrong-track-adv.eval.md` | run-status + 假绿标红 |
| `r4-wrong-track-adv.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` §10 | R4 **仍 NOT closed**；ADV await post-prove |
| `packages/domain/src/qbank-track-local-retrieval.ts` | `countWrongTrackHits` / `assertWrongTrackZero` / `R4_WRONG_TRACK_RECHECK_REASONS` |
| `apps/worker/src/qbank-track-local-retrieve.ts` | wired retrieve + `enforceWrongTrackZeroOnServed` / `mapRecheckFailedToRefs` |
| `apps/worker/test/r4-wrong-track-adv.proof.ts` | prove |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-ADV-01 **partial**/honesty-pin ≠ covered |

---

## 切片立场（RAG 域）

本刀落地 A1–A8：

1. **A1** wired retrieve（planner→validate→assemble→dispatch→recheck）对抗面  
2. **A2** wrong_track assert hooks（served annotated hits = 0）  
3. **A3** 伪造/缺失 metadata · 未知分类 · 并发改岗 · 旧 checkpoint · cache 回放（unit+Worker map；**LIVE_PG_GAP** 诚实）  
4. **A4** fail-closed；G-R2-5；禁 P-FAKEPLAN；无 sibling/unscoped/legacy_unrouted  
5. **A5–A8** 无 pgvector 假绿 sole；wire≠ADV；partial≠covered；ADV≠R4 closed  

**EXIT=0 ≠ covered ≠ R4 closed ≠ 题域已隔离**。  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · ~19:15 PT）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-wrong-track-adv:prove`** | **0** | CALL_SITES=1；wrong_track assert；A3 unit+map；LIVE_PG_GAP；≠ covered；≠ R4 关 |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · 把本绿写成 R4 关 / covered。  
**Key**：unset（未读 `.env*`）。

---

## 请专家回答

1. 请 **独立复跑** `pnpm r4-wrong-track-adv:prove`，附 CMD+EXIT。  
2. A1–A4 是否诚实成立（wired path + assert + A3 面 + fail-closed）？  
3. LIVE_PG_GAP 是否诚实（≠ full live Worker+PG ADV 已关；rag04 仅为 seam 旁证）？  
4. NHP-R4-ADV-01 是否仅可 **partial**/honesty-pin，**不得** covered？  
5. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离**？  
6. harness/status/eval/matrix 是否错误把本绿写成 covered / R4 已关？（期望：**否**）  
7. pre-exec dual + 本绿是否 **不得**自动批准 R4 关闭 / ADV covered？（期望：**不得**）

请将结论写入 `reviews/`（例如 `2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R4 closed / full live Worker+PG ADV 已关。  
- **await post-prove dual**。  

---

*REQUEST · mw-rag-route · R4 wrong_track=0 ADV post-prove · 2026-09-16 ~19:15 PT · releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed*
