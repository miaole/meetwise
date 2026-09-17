# REQUEST — R4 **wrong_track=0 ADV · LIVE_PG** **post-prove**（RAG/路由）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:40 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **unit ADV ≠ LIVE_PG closed** · **LIVE_PG EXIT=0 ≠ R4 closed** · **LIVE_PG_GAP 仍开直至 dual** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md`  
**硬闸**：`north-star-hard-gates.md` 已生效 · LIVE_PG pre-exec dual pass · meetwise authorize coding+prove  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ covered）**：`2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md` · `2026-09-16-r4-wrong-track-adv-live-pg-mw-e2e-ha.md`  
**本刀**：`pnpm r4-wrong-track-adv-live-pg:prove`（真 PG · `retrieveViaDispatchTrackLocal`）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-wrong-track-adv-live-pg.md` | 本刀 harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-wrong-track-adv-live-pg.eval.md` | run-status + 假绿标红 |
| `r4-wrong-track-adv-live-pg.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` §11 | R4 **仍 NOT closed**；LIVE_PG_GAP 仍开直至 dual |
| `apps/worker/src/qbank-track-local-retrieve.ts` | wired `retrieveViaDispatchTrackLocal` |
| `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` | LIVE_PG prove |
| `apps/worker/test/r4-wrong-track-adv.proof.ts` | unit ADV（**≠** 本刀） |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-ADV-01 **partial**/honesty-pin ≠ covered |

---

## 切片立场（RAG 域）

本刀落地 L1–L8：

1. **L1** live wired retrieve（真 PG · `retrieveViaDispatchTrackLocal`）  
2. **L2** wrong_track=0 可观测（零跨叶 served）  
3. **L3** cache poison · 并发改岗 · metadata 篡改 · 伪造/缺失 · 未知分类 · 旧 checkpoint（live）  
4. **L4** fail-closed；G-R2-5；禁 P-FAKEPLAN；无 sibling/unscoped/legacy_unrouted  
5. **L5–L8** 无 rag04 冒充；unit≠LIVE_PG；partial≠covered；LIVE_PG≠R4 closed  

**EXIT=0 ≠ covered ≠ R4 closed ≠ LIVE_PG_GAP dual-closed ≠ 题域已隔离**。  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-wrong-track-adv-live-pg:prove`** | **0** | 真 PG · retrieveVia · L1–L4；LIVE_PG_GAP 仍开直至 dual；≠ covered；≠ R4 关 |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · 把本绿写成 R4 关 / covered / LIVE_PG_GAP dual-closed。  
**Key**：unset（未读 `.env*`）。

---

## 请专家回答

1. 请 **独立复跑** `pnpm r4-wrong-track-adv-live-pg:prove`，附 CMD+EXIT。  
2. L1–L4 是否诚实成立（真 PG · wired retrieveVia · A3 live · fail-closed）？  
3. LIVE_PG_GAP 是否仍钉 **开**直至 dual（EXIT=0 ≠ gap dual-closed）？  
4. unit ADV ≠ 本刀是否硬钉？  
5. NHP-R4-ADV-01 是否仅可 **partial**/honesty-pin，**不得** covered？  
6. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ HA**？  
7. harness/status/eval/matrix 是否错误把本绿写成 covered / R4 已关 / gap dual-closed？（期望：**否**）

请将结论写入 `reviews/`（例如 `2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R4 closed / LIVE_PG_GAP dual-closed。  
- **await post-prove dual**。  

---

*REQUEST · mw-rag-route · R4 wrong_track ADV LIVE_PG post-prove · 2026-09-16 ~19:40 PT · releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · LIVE_PG_GAP open until dual*
