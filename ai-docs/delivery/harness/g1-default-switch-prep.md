# Harness — G1 default isolation switch PREP（清单 / 回滚 · 本轮不翻默认）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **vector does NOT migrate to Qdrant** — continue **Postgres pgvector**.  
> Retained truth stack: **Postgres (+pgvector + PostgresSaver)**. Ban replace-pgvector / sole-Qdrant-vector cutover.  
> Prior status preserved below for history; **do not delete**. Further Qdrant-as-required-vector work on this artifact is **banned**.  
> MySQL relational cutover likewise superseded; **Redis wake** remains separately evaluable (not canceled).  
> `releaseEvidence=false` · ≠HA · ≠suite green · Ban implementing vector cutover from this pin · Dual PASS ≠ authorize coding.

**Prior status (historical)**: eval-honesty · G1 OPEN · prep only · default still pgvector-legacy · flip NOT open


**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ migrated** · **G1 仍 OPEN**  
**平行**：`r5-retirement-sole-stack-status.md` **G1** · `r5-pgvector-fixture-mark-red.md` · `retrieval-backend-qdrant.md`（P14）· dual-pass P8–P15  
**硬句**：**本切片 = PREP only**（harness / 清单 / 回滚 / 静态 prove）；**FORBIDDEN 本轮翻默认** — `E2E_ISOLATION_STACK` 缺省仍必须写入 `pgvector-legacy`；**本绿 ≠ 已迁**；**本绿 ≠ 默认已切 sole**；**prep landed ≠ flip open**。

关联：`scripts/run-e2e-isolated.mjs`（`LEGACY_STACK` / `SOLE_WIRING_ALLOWLIST`）· `pnpm g1-default-switch:prep:prove` · BUG-FAKE-R5 · `m5-pgvector-fixture-retirement-plan.md`

---

## 0. 本切片范围（硬边界）

| 做 | 不做（FORBIDDEN 本轮） |
|----|------------------------|
| 写本 harness（prereq / flip checklist / rollback / prove gates） | **改** `run-e2e-isolated.mjs` 缺省离 `pgvector-legacy` |
| 静态 prove 钉「默认仍 legacy + prep 文档存在」 | **设** CI/脚本默认 `E2E_ISOLATION_STACK=mysql-qdrant-redis` |
| status G1 记 **prep landed · flip NOT open** | 宣称 G1 关闭 / L1 关闭 / fixtures retired |
| 可选 package script EXIT=0 | 扩 sole allowlist；切 `E2E_PG_IMAGE`；切 production retrieval |

---

## 1. Prerequisites（未来 flip 前置 · 未宣称已满足关闭）

未来任一「默认切 sole」切片 **之前**，下列必须已绿 / 已审；**本 PREP 不关闭它们**：

| # | 前置 | 现状（诚实） | 证据 |
|---|------|--------------|------|
| A | **P14** product retrieval backend selector | **已钉**（opt-in；默认仍 pgvector） | `retrieval-backend-qdrant.md` · `pnpm retrieval-store:qdrant:prove` |
| B | Sole **allowlist 恰 5**（wiring/ping/qdrant-backed/adapter/vectorstore-qdrant） | **已钉**；共享 compose ≠ disposable | `SOLE_WIRING_ALLOWLIST` · P8 |
| C | Dual-pass **P8–P15**（含 G5 P15 subject erase；HA C1 骨架另轨） | **已 dual-pass**；≠ cutover | status §1 Proven |
| D | **G2 仍 OPEN**（`vectorstore:prove` / `rag*` / `memory*` **默认**仍 pgvector-isolated） | **仍 GAP** — flip 默认 isolation **不得**假装关闭 G2 | status G2 |
| E | 独立双域审（未来 flip 切片） | **未开** — 本 PREP **禁止自批 flip** | `mw-e2e-ha` + `mw-rag-route` |
| F | Disposable per-run MySQL+Qdrant+Redis fixtures（非共享 compose） | **仍 GAP**（allowlist 绿 ≠ disposable） | status G1 关闭条件 |
| G | `E2E_PG_IMAGE` 默认退役（G3） | **仍 GAP** — 仅 G1+G2 + 独立审后 | status G3 |

**硬读**：A–C 是 prep 可依赖的已钉面；**D–G 仍挡 flip**。G2 remaining **明确仍开** → 未来 flip 叙事不得写成「业务 prove 已默认可信于 Qdrant」。

---

## 2. Flip checklist（未来切片执行 · 本轮只列不做）

> **FORBIDDEN 本轮执行下列任一步。** 下列为未来 flip 切片的操作清单草稿。

1. **门禁复核**：`pnpm g1-default-switch:prep:prove` EXIT=0；§4 prove gates 全绿；G2/G3/G5/G7 叙事仍诚实。  
2. **双域预审**：`mw-e2e-ha` + `mw-rag-route` 对照本 harness + status G1；**禁止自批**。  
3. **显式变更面（未来）**：仅在独立审通过后，改 `run-e2e-isolated.mjs` 缺省 `LEGACY_STACK` → sole（或等价：unset → `mysql-qdrant-redis`），并同步 banner / harness / status。  
4. **失败面**：非 allowlist sole 路径仍须 fail-closed 或已有 disposable fixtures；禁止静默假绿。  
5. **回归**：默认路径 banner = sole；显式 `E2E_ISOLATION_STACK=pgvector-legacy` 仍可走 legacy（opt-in legacy，非静默）。  
6. **回滚演练**：按 §3 至少干跑一次（文档级）；真实 revert 在 flip 切片做。  
7. **禁止顺带**：不扩 allowlist；不切 `RETRIEVAL_VECTOR_BACKEND` 默认；不删 `E2E_PG_IMAGE` 路径；不勾 `releaseEvidence=true`。

---

## 3. Rollback steps（若未来已翻默认 · 本轮仅文档）

| 步 | 动作 | 验证 |
|----|------|------|
| R1 | 恢复 `scripts/run-e2e-isolated.mjs`：`rawIsolationStack \|\| LEGACY_STACK` 且 `LEGACY_STACK === 'pgvector-legacy'`；缺省写入 legacy | `rg "LEGACY_STACK = 'pgvector-legacy'" scripts/run-e2e-isolated.mjs` |
| R2 | 恢复 package.json / CI 中任何「默认 sole」注入（若有） | 无 unset→sole 的默认脚本 |
| R3 | status G1：**重新 OPEN**；撤销「默认已切」叙事 | status GAP 表 |
| R4 | 跑 `pnpm g1-default-switch:prep:prove` + `pnpm mysql-stack:r5-mark-red:prove` | 两者 EXIT=0 且钉默认 legacy |
| R5 | 双域告知回滚（`mw-e2e-ha` + `mw-rag-route`） | reviews/ 留痕 |

**本 PREP 切片**：仓库默认 **从未翻过** → 回滚步骤仅为未来保险；执行 prove **不得**先翻再回滚。

---

## 4. Prove gates（未来 flip **之前**必须绿）

| Gate CMD | 期望 | 含义 |
|----------|------|------|
| `pnpm g1-default-switch:prep:prove` | **0** | 本 harness + 默认仍 legacy + 不翻 env |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 标红 + 双轨 + status GAP（含 G1 默认 legacy） |
| `pnpm e2e-isolation:prove`（无 `E2E_ISOLATION_STACK`） | **0**（leaf） | banner / 写入仍 **pgvector-legacy** |
| `pnpm e2e-isolation:sole-wiring:prove`（及 allowlist 另 4） | **0**（compose up） | allowlist 恰 5 可绿 ≠ 默认已切 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | 非 allowlist fail-closed |
| `pnpm retrieval-store:qdrant:prove` | **0**/3 | P14 selector 仍诚实；默认 backend 仍 pgvector |
| status 人工读 | n/a | **G1 OPEN** · **G2 OPEN** · **releaseEvidence=false** · **Not HA** |

缺任一 gate → **禁止**开 flip 切片。

---

## 5. FORBIDDEN claims（显式）

**禁止**因本 PREP / 本 prove EXIT=0 宣称或暗示：

1. **G1 已关闭** / isolated 默认已切 `mysql-qdrant-redis`  
2. **flip open** / 「可以合入默认切换」  
3. L1 关闭 / fixtures retired / disposable sole isolation 已落地  
4. G2 关闭 / `vectorstore:prove`·`rag*`·`memory*` 默认已迁 Qdrant  
5. G3 `E2E_PG_IMAGE` 已退役  
6. cutover / migrated / covered / HA / `releaseEvidence=true`  
7. sole allowlist 扩面或 P13/P14/P15 入 allowlist  
8. 本切片修改了 `.env*` 或生产检索默认  

**允许宣称**：G1 **prep**（清单+回滚+静态钉）已落地；**默认仍 `pgvector-legacy`**；**flip NOT open**。

---

## 6. 静态 prove CMD

```bash
pnpm g1-default-switch:prep:prove
# ≡ node scripts/g1-default-switch-prep.proof.mjs
```

| EXIT | 含义 |
|------|------|
| **0** | prep 文档存在 + runner 默认仍 `pgvector-legacy` + allowlist 恰 5 + status 钉 prep/flip-not-open + **未**翻 env |
| **1** | 诚实钉失败（缺文档 / 默认已被动 / 禁句缺失） |

**HARD**：prove **只读**源码与文档；**不得** `process.env.E2E_ISOLATION_STACK=mysql-qdrant-redis`；**不得**改 runner。

---

## 7. 审查

- 双域：`mw-e2e-ha` + `mw-rag-route` 对照本 harness + status G1  
- 合入权在协调/用户；**禁止自批 flip / cutover / HA**  
- 结论落 `ai-docs/delivery/reviews/`
