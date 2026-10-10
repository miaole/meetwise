# REQUEST — NHP-R4-ADV-01 **covered path** **post-prove**（对抗 / E2E-HA 域）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:52 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered**（matrix 仍 partial）· **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0 production closed** · **LIVE_PG dual ≠ covered** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-rag-route.md`  
**硬闸**：pre-exec dual PASS · meetwise authorize coding+prove · EXIT=0 ≠ covered alone ≠ R4 closed ≠ HA · no self-approve  
**前序 pre-exec dual（已 pass）**：`2026-09-16-nhp-r4-adv-covered-path-mw-e2e-ha.md` · `2026-09-16-nhp-r4-adv-covered-path-mw-rag-route.md`  
**本刀**：`pnpm nhp-r4-adv-covered:prove`（真 PG · C1–C4 composition）；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/nhp-r4-adv-covered-path.md` | 本刀 harness（`executed:awaiting_post_prove_dual`） |
| `eval/nhp-r4-adv-covered-path.eval.md` | run-status + CMD+EXIT |
| `nhp-r4-adv-covered-path.slice.md` | 切片索引 |
| `harness/r4-domain-isolation-status.md` §12 | R4 **仍 NOT closed**；awaiting post-prove dual |
| `apps/worker/test/nhp-r4-adv-covered.proof.ts` | covered prove（spawn unit ADV + LIVE_PG + C4） |
| `scripts/run-e2e-isolated.mjs` | isolated PG 宿主（**未**扩 SOLE_WIRING_ALLOWLIST；**未** flip default） |
| `non-happy-path-perf-load-case-matrix.md` §1.5 | NHP-R4-ADV-01 **仍 partial**/honesty-pin ≠ covered |

---

## 切片立场（对抗 / E2E-HA 域）

本刀是 **NHP covered-path prove**（beyond honesty/partial），**不是**完整 E2E / HA / matrix covered / R4 关：

1. 真 PG（`run-e2e-isolated`）；无 PG → EXIT≠0（skip≠pass）  
2. C1–C3：spawn LIVE_PG live wired + unit ADV 旁证  
3. C4：covered harness/eval/matrix honesty；**matrix 仍 partial**  
4. **不**宣称 HA / `releaseEvidence=true` / R4 closed / matrix covered  

本 REQUEST **不是** pass；实现方禁止自批。

---

## Post-prove CMD+EXIT（实现方 · 见 eval 实测栏）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm nhp-r4-adv-covered:prove`** | **0** | 真 PG · C1–C4；≠ covered；≠ R4 关；await post-prove dual |
| **`pnpm nhp-r4-adv-covered:prove:raw`**（no-PG） | **1** | fail-closed；skip≠pass |

**硬查**：SOLE allowlist **未**因本刀扩面；未 flip `E2E_ISOLATION_STACK` default；未 open DELETE；未 invent MODEL_API_KEY。

---

## 请专家回答

1. 请 **独立复跑** `pnpm nhp-r4-adv-covered:prove`，附 CMD+EXIT；确认真击中 PG（非 in-memory 假绿）。  
2. C1–C4 是否诚实？无 PG 时是否 fail（非 skip-as-pass）？  
3. 是否未错误冒充完整 E2E / HA / matrix covered / R4 关？  
4. LIVE_PG ADV `post_prove_dual_pass` 是否仍钉 **≠** 本 covered path done？  
5. NHP-R4-ADV-01 是否仍须 **partial** 直至本 post-prove dual？  
6. sole allowlist / default stack 是否未被本刀偷翻？（期望：未翻）  
7. 实现方是否自批？（期望：**否**）

请将结论写入 `reviews/`（例如 `2026-09-16-nhp-r4-adv-covered-path-post-prove-mw-e2e-ha.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 matrix covered / HA / `releaseEvidence=true` / R4 closed / wrong_track=0 production closed。  
- **await post-prove dual**。  

---

*REQUEST · mw-e2e-ha · NHP-R4-ADV covered path post-prove · 2026-09-16 ~19:52 PT · releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed · awaiting dual*
