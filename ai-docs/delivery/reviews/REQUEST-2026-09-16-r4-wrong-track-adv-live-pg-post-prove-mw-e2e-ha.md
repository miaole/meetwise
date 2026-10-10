# REQUEST — R4 **wrong_track=0 ADV · LIVE_PG** **post-prove**（对抗 / E2E-HA 域）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:40 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **unit ADV ≠ LIVE_PG closed** · **LIVE_PG EXIT=0 ≠ R4 closed** · **LIVE_PG_GAP 仍开直至 dual** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md`  
**硬闸**：`north-star-hard-gates.md` 已生效 · LIVE_PG pre-exec dual pass · meetwise authorize coding+prove  
**前序 pre-exec dual（已 pass · ≠ 自动绿关 / ≠ covered）**：`2026-09-16-r4-wrong-track-adv-live-pg-mw-rag-route.md` · `2026-09-16-r4-wrong-track-adv-live-pg-mw-e2e-ha.md`  
**本刀**：`pnpm r4-wrong-track-adv-live-pg:prove`（真 PG · `retrieveViaDispatchTrackLocal`）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-wrong-track-adv-live-pg.md` | 本刀 harness（`executed:awaiting_post_prove_dual`） |
| `eval/r4-wrong-track-adv-live-pg.eval.md` | run-status + CMD+EXIT |
| `r4-wrong-track-adv-live-pg.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` §11 | R4 **仍 NOT closed**；LIVE_PG_GAP 仍开直至 dual |
| `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` | LIVE_PG prove |
| `scripts/run-e2e-isolated.mjs` | isolated PG 宿主（**未**扩 SOLE_WIRING_ALLOWLIST；**未** flip default） |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-ADV-01 **partial**/honesty-pin ≠ covered |

---

## 切片立场（对抗 / E2E-HA 域）

本刀是 **live Worker+PG ADV prove**，**不是**完整 E2E / HA / covered：

1. 真 PG（`run-e2e-isolated` / DATABASE_URL）；无 PG → EXIT≠0 · LIVE_PG_GAP（skip≠pass）  
2. 经生产接线 `retrieveViaDispatchTrackLocal`（非仅 domain unit map）  
3. A3 live 对抗面 fail-closed  
4. 保留 G-R2-5；禁 P-FAKEPLAN；禁 unscoped/sibling/legacy_unrouted  
5. **不**宣称 HA / `releaseEvidence=true` / R4 closed / LIVE_PG_GAP dual-closed  

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-wrong-track-adv-live-pg:prove`** | **0** | 真 PG · retrieveVia；≠ covered；≠ R4 关；gap 仍开直至 dual |

**硬查**：SOLE allowlist 恰 5、未因本刀扩面；未 flip `E2E_ISOLATION_STACK` default；未 open DELETE。

---

## 请专家回答

1. 请 **独立复跑** `pnpm r4-wrong-track-adv-live-pg:prove`，附 CMD+EXIT；确认真击中 PG（非 in-memory 假绿）。  
2. L1–L4 是否诚实？无 PG 时是否 fail（非 skip-as-pass）？  
3. 是否未错误冒充完整 E2E / HA / covered / R4 关？  
4. LIVE_PG_GAP 是否仍开直至 dual？  
5. unit ADV ≠ 本刀？  
6. NHP-R4-ADV-01 是否不得 covered？  
7. sole allowlist / default stack 是否未被本刀偷翻？（期望：未翻）  
8. 实现方是否自批？（期望：**否**）

请将结论写入 `reviews/`（例如 `2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 covered / HA / `releaseEvidence=true` / R4 closed / LIVE_PG_GAP dual-closed。  
- **await post-prove dual**。  

---

*REQUEST · mw-e2e-ha · R4 wrong_track ADV LIVE_PG post-prove · 2026-09-16 ~19:40 PT · releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · LIVE_PG_GAP open until dual*
