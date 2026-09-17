# REQUEST — NHP-R4-ADV-01 **covered path** **post-prove**（RAG/路由）→ mw-rag-route

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-rag-route`  
**日期**：2026-09-16（~19:52 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered**（matrix 仍 partial）· **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 production closed** · **LIVE_PG dual ≠ covered** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-e2e-ha.md`  
**硬闸**：pre-exec dual PASS · meetwise authorize coding+prove · G-R2-5 retained · ban P-FAKEPLAN · EXIT=0 ≠ covered alone · no self-approve  
**前序 pre-exec dual（已 pass）**：`2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md` · `2026-09-16-nhp-r4-adv-covered-path-mw-e2e-ha.md`  
**本刀**：`pnpm nhp-r4-adv-covered:prove`（真 PG · C1–C4）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/nhp-r4-adv-covered-path.md` | 本刀 harness（`executed:awaiting_post_prove_dual`） |
| `eval/nhp-r4-adv-covered-path.eval.md` | run-status + 假绿标红 |
| `nhp-r4-adv-covered-path.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` §12 | R4 **仍 NOT closed**；awaiting post-prove dual |
| `apps/worker/src/qbank-track-local-retrieve.ts` | wired `retrieveViaDispatchTrackLocal` |
| `apps/worker/test/nhp-r4-adv-covered.proof.ts` | covered prove |
| `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` | LIVE_PG（spawned；**≠** covered alone） |
| `apps/worker/test/r4-wrong-track-adv.proof.ts` | unit ADV（spawned；**≠** covered alone） |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-ADV-01 **仍 partial**/honesty-pin ≠ covered |

---

## 切片立场（RAG 域）

本刀落地 C1–C4：

1. **C1** live wired retrieve wrong_track=0（via LIVE_PG spawn · `retrieveViaDispatchTrackLocal`）  
2. **C2** A3：cache poison · 并发改岗 · metadata 篡改 · 伪造/缺失 · 未知分类 · 旧 checkpoint  
3. **C3** fail-closed；G-R2-5；禁 P-FAKEPLAN；无 sibling/unscoped/legacy_unrouted  
4. **C4** matrix+harness honesty；**仍 partial** until post-prove dual；≠ R4 closed  

**EXIT=0 ≠ matrix covered ≠ R4 closed ≠ 题域已隔离 ≠ HA**。  
**LIVE_PG ADV `post_prove_dual_pass` ≠ this covered path done**。  
本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm nhp-r4-adv-covered:prove`** | **0** | 真 PG · C1–C4 composition；≠ covered；≠ R4 关；await dual |
| **`pnpm nhp-r4-adv-covered:prove:raw`**（no-PG） | **1** | skip≠pass |

**未跑（禁）**：HA 绿关 · flip default / open DELETE · 把本绿写成 R4 关 / matrix covered。  
**Key**：unset（未 invent MODEL_API_KEY）。

---

## 请专家回答

1. 请 **独立复跑** `pnpm nhp-r4-adv-covered:prove`，附 CMD+EXIT。  
2. C1–C4 是否诚实成立（真 PG · composition · fail-closed · C4 partial pin）？  
3. LIVE_PG ADV `post_prove_dual_pass` 是否仍钉 **≠** 本 covered path done？  
4. unit ADV / LIVE_PG honesty ≠ 本刀 covered 是否硬钉？  
5. NHP-R4-ADV-01 是否仍仅可 **partial**/honesty-pin，**不得** covered 直至本 post-prove dual？  
6. EXIT=0 是否仍钉 **≠ R4 closed / ≠ 题域已隔离 / ≠ HA / ≠ production wrong_track=0 closed**？  
7. harness/status/eval/matrix 是否错误把本绿写成 covered / R4 已关？（期望：**否**；matrix **仍 partial**）  
8. C3（G-R2-5 / ban P-FAKEPLAN / ban unscoped）是否保留？

请将结论写入 `reviews/`（例如 `2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 matrix covered / HA / `releaseEvidence=true` / R4 closed / 题域已隔离。  
- **await post-prove dual**。  

---

*REQUEST · mw-rag-route · NHP-R4-ADV covered path post-prove · 2026-09-16 ~19:52 PT · releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · awaiting dual*
