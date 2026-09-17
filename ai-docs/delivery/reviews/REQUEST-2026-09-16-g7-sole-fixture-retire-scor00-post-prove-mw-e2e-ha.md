# REQUEST — G7 MAIN · sole夹具退役 ⋂ scor-00 **post-prove** → mw-e2e-ha

**Status**: **REQUEST / awaiting review**（实现方预写；**禁止自批 pass**）  
**Expert**: `mw-e2e-ha`  
**Date**: 2026-09-16 (~19:50 PT · post-prove)  
**Knife status**: **`executed:awaiting_post_prove_dual`**  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R5 retired** · **≠ sole cutover complete** · **≠ suite green** · **≠ 0 BUG** · **R2/R4 still open**  
**Pair**: `REQUEST-2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-rag-route.md`  
**Pre-exec dual（pass · docs gate only）**: `2026-09-16-g7-sole-fixture-retire-scor00-mw-e2e-ha.md` · `…-mw-rag-route.md`  
**Hard**: EXIT=0 ≠ covered ≠ R2/R4 closed ≠ suite green ≠ HA ≠ R5 retired · no self-approve · no silent allowlist expand

---

## Contra

- Harness：`harness/g7-sole-fixture-retire-scor00.md`（`executed:awaiting_post_prove_dual`）
- Status：`harness/r5-retirement-sole-stack-status.md` Main-track pointer
- G1 prep：`harness/g1-default-switch-prep.md`（flip NOT open · **未翻默认**）
- Code：`apps/api/test/scor-00-http-db.proof.ts` · `scripts/g7-scor00-sole-fixture.proof.mjs` · `scripts/run-e2e-isolated.mjs`（G7-SCOR00 banners）
- Allowlist：`SOLE_WIRING_ALLOWLIST` **恰 5** · scor **NOT** listed

---

## Stance（post-prove）

Authorized exec landed **sole honesty path** + **ban legacy-as-sole-green** + legacy Nest fixture seed fix. **Not** global default flip. **Not** allowlist expand. Nest scor-00 on MySQL = **PREREQ GAP**. Await independent post-prove dual.

---

## CMD+EXIT（实现方实测 · 见 harness §4）

| CMD | EXIT | Honest read |
|-----|------|-------------|
| `pnpm scor-00:sole-fixture:prove` | **0** | sole honesty · ≠ R5 retired ≠ Nest-on-MySQL |
| `pnpm scor-00:http:prove` | **0** | legacy Nest HTTP · R5-MARKED-RED · ≠ sole ≠ G7 close alone |
| `pnpm scor-00-honesty:prove` | **0** | ≠ product close |
| `pnpm g1-default-switch:prep:prove` | **0** | prep ≠ flip · allowlist 恰 5 |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | marked-red ≠ retired |
| `pnpm e2e-isolation:sole-wiring:prove` | **0** | allowlist sample ≠ default sole |


## Please answer

1. Independently re-run the CMD table；confirm EXIT + honesty read（尤其 sole-fixture vs legacy http）.  
2. T1–T5：默认真栈 **plan/reachability** ≠ flip done？去 legacy 假绿 banner 是否够？sole path 是否定义为 standalone（未静默扩 allowlist）？  
3. Confirm **SOLE_WIRING_ALLOWLIST 恰 5** · scor 未入表 · **未 flip** `E2E_ISOLATION_STACK` default.  
4. Confirm legacy `scor-00:http:prove` EXIT=0（若绿）**不得**升格 sole / R5 retired / G7 close alone.  
5. Confirm Nest-on-MySQL **PREREQ GAP** 仍开 · **R5 not fully retired** · **R2/R4 still open**.  
6. Confirm 实现方 **未自批** pass；本 REQUEST ≠ pass.

请将结论写入 `reviews/2026-09-16-g7-sole-fixture-retire-scor00-post-prove-mw-e2e-ha.md`。

---

## Non-claims

- Not pass · not R5 retired · not sole cutover complete · not suite green · not HA · not R4 closed

*REQUEST · mw-e2e-ha · sole∩scor-00 post-prove · 2026-09-16 ~19:50 PT · executed:awaiting_post_prove_dual · releaseEvidence=false · ≠HA*
