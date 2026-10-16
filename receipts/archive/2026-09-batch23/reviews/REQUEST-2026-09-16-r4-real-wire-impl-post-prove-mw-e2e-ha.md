# REQUEST — R4 **REAL-WIRE-IMPL** **post-prove**（E2E/HA 对抗）→ mw-e2e-ha

**状态**：**REQUEST / 待审**（实现方预写；**禁止自批 pass**）  
**专家**：`mw-e2e-ha`  
**日期**：2026-09-16（~19:05 PT · post-prove）  
**releaseEvidence=false** · **≠HA** · **≠ covered** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ wrong_track=0** · **≠ sole cutover** · **≠ flip default** · **≠ open DELETE**  
**配对**：`REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md`  
**硬闸**：`north-star-hard-gates.md` 已生效 · pre-exec dual pass · meetwise authorize coding+prove  
**前序 pre-exec dual（已 pass）**：`2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` · `2026-09-16-r4-real-wire-impl-mw-rag-route.md`  
**本刀**：REAL-WIRE-IMPL 实现 + prove；**实现方不写** pass review；请专家 **独立复跑**并写入 `reviews/`

---

## 对照（请审）

| 文件 | 角色 |
|------|------|
| `harness/r4-real-wire-impl.md` / `eval/` / `slice` | 本刀文档闸 |
| `harness/r4-domain-isolation-status.md` | R4 **仍 NOT closed** |
| `apps/worker/src/qbank-track-local-retrieve.ts` | dispatch 调用点 |
| `non-happy-path-perf-load-case-matrix.md` §1.5 NHP-R4 | **不升格 covered**；ADV 仍 gap |
| `scripts/run-e2e-isolated.mjs` SOLE | **不因本刀扩面** |

---

## 切片立场（E2E/HA 对抗域）

对抗检查重点：

1. 是否把 prove 绿偷写成 **HA / covered / releaseEvidence=true**？（期望：**否**）  
2. 是否偷关 **R4 / 题域已隔离 / wrong_track=0**？（期望：**否**）  
3. 是否打开 unscoped / 削弱 G-R2-5 / recheck 回退？（期望：**否**）  
4. 是否 P-FAKEPLAN（主叶硬塞缺 generation/recipe）？（期望：**否**）  
5. sole allowlist 是否被本刀扩面？（期望：**否**）  
6. 实现方是否自批 pass？（期望：**否**）

**接线绿 ≠ R4 closed ≠ wrong_track=0**。本 REQUEST **不是** pass。

---

## Post-prove CMD+EXIT（实现方 · ~19:05 PT）

| CMD | EXIT | 诚实读法 |
|-----|------|----------|
| **`pnpm r4-real-wire-impl:prove`** | **0** | ≠ HA；≠ R4 关；CALL_SITES=1 |
| `pnpm r4-p-planner-unit:prove` | **0** | unit 旁证 |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | FLIPPED CALL_SITES=1；≠ R4 关 |

**未跑（禁）**：HA 绿关 · wrong_track=0 ADV · flip default / open DELETE。  
**Key**：unset。

---

## 请专家回答

1. 请 **独立复跑** 主 prove，附 CMD+EXIT。  
2. 是否同意：本绿 **不得**写成 HA / covered / `releaseEvidence=true`？  
3. 是否同意：CALL_SITES≥1 **≠** R4 closed **≠** wrong_track=0？  
4. 是否同意：G-R2-5 + recheck_failed fail-closed + P-FAKEPLAN 禁令仍成立？  
5. NHP-R4 ADV 是否仍 gap/blocked？（期望：**是**）  
6. sole 是否未因本刀扩面？（期望：**未扩**）  
7. 是否拒绝实现方自批？

请将结论写入 `reviews/`（例如 `2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md`）。**禁止**实现方代写 pass。

---

## 非宣称（实现方自认）

- 本 REQUEST **不是** pass。  
- 不宣称 HA / covered / R4 closed / wrong_track=0。  
- **await post-prove dual**。  

---

*REQUEST · mw-e2e-ha · R4 REAL-WIRE-IMPL post-prove · 2026-09-16 ~19:05 PT · releaseEvidence=false · ≠HA · ≠ R4 closed*
