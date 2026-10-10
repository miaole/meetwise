# REQUEST — R4 **wrong_track=0 ADV** **post-prove**（对抗 / E2E-HA 域）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:15 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **ADV 绿 ≠ R4 closed** · **wire 绿 ≠ ADV closed** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md`（**不替代**本域）  
**硬闸**：ADV pre-exec dual pass · REAL-WIRE-IMPL post-prove dual pass · meetwise authorize coding+prove  
**前序 pre-exec**：`2026-09-16-r4-wrong-track-adv-mw-e2e-ha.md`（pass · 文档闸 only；当时禁 coding）  
**本刀**：ADV 实现 + prove；**不采信**实现方自报 EXIT；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-wrong-track-adv.md` | implemented + 假绿标红 + LIVE_PG_GAP |
| `eval/r4-wrong-track-adv.eval.md` | CMD+EXIT 收据 |
| `r4-wrong-track-adv.slice.md` | 切片 |
| `apps/worker/test/r4-wrong-track-adv.proof.ts` | prove |
| `packages/domain` / `apps/worker/src/qbank-track-local-retrieve.ts` | assert / enforce |
| matrix §1.5 | NHP-R4-ADV-01 **partial**/honesty-pin ≠ covered |
| `scripts/run-e2e-isolated.mjs` SOLE | 期望仍恰 5；本刀不扩 |

---

## 切片立场（对抗域）

成功标准（本 REQUEST）：

1. 独立复跑 `pnpm r4-wrong-track-adv:prove` EXIT=0  
2. A1–A4 对抗面诚实（wired + wrong_track=0 assert + A3 + fail-closed）  
3. LIVE_PG_GAP **不得**被写成 full live ADV 已关  
4. NHP-R4-ADV-01 **仅** partial/honesty-pin；**零 covered**  
5. sole allowlist **未**因本刀扩面  
6. R4 **仍 NOT closed**；ADV prove 绿 **≠** R4 关 / ≠ HA / ≠ covered  

本 REQUEST **不是** pass。

---

## Post-prove CMD+EXIT（实现方 · ~19:15 PT · 待专家复跑）

| CMD | EXIT（实现方） | 诚实读法 |
|-----|----------------|----------|
| **`pnpm r4-wrong-track-adv:prove`** | **0** | CALL_SITES=1；assert；A3 unit+map；LIVE_PG_GAP；≠ covered；≠ R4 关 |

OK 行：`OK  r4-wrong-track-adv prove (wired path CALL_SITES=1; wrong_track assert; A3 surfaces unit+map; fail-closed; LIVE_PG_GAP honesty; ≠ covered; ≠ R4 closed; releaseEvidence=false)`

**未跑（禁）**：HA · flip default · open DELETE · e2e:isolated 当本刀关闸。

---

## 请专家回答（Q1–Q10）

1. 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / full live Worker+PG ADV 已关？  
2. 独立复跑 EXIT 是否为 0，且读法仍 ≠ covered / ≠ R4 关？  
3. A1–A4 是否够格作 ADV 实现刀（非仅文档）且 wire ≠ ADV closed？  
4. LIVE_PG_GAP 是否诚实保留？  
5. NHP-R4-ADV-01 是否仅 partial/honesty-pin（**不得** covered）？  
6. companions NEG/FAULT/BOUND/PERF/LOAD 是否未因本刀升 covered？  
7. sole allowlist 是否仍恰 5、未扩？  
8. G7 draft ≠ success？  
9. 本绿是否不得自动批准 R4 关闭？  
10. 禁 flip default / open DELETE / HA？

请将结论写入 `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md`（或同名）。**禁止**实现方代写 pass。

---

## 非宣称

- 不宣称 covered / HA / R4 closed / 题域已隔离 / full live Worker+PG ADV 已关  
- `releaseEvidence=false`；await post-prove dual  

---

*REQUEST · mw-e2e-ha · R4 wrong_track=0 ADV post-prove · 2026-09-16 ~19:15 PT · releaseEvidence=false · ≠HA · ≠ covered · ≠ R4 closed*
