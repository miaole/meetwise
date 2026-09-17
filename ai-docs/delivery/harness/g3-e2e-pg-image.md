# Harness — G3 `E2E_PG_IMAGE`（retirement path + sole fail-closed · 本轮不翻默认）

**状态**：eval-honesty · **releaseEvidence=false** · **Not HA** · **≠ covered** · **≠ cutover** · **≠ migrated** · **G3 默认镜像值仍 OPEN（未退役）**  
**平行**：`r5-retirement-sole-stack-status.md` **G3** · `r5-pgvector-fixture-mark-red.md` · `g1-default-switch-prep.md` · dual-pass P8–P15 · G1 prep（no flip）· G4 honesty（R4 still open）  
**硬句**：**本切片 = retirement path 钉 + sole fail-closed**；**FORBIDDEN 本轮翻** `E2E_ISOLATION_STACK` 离 `pgvector-legacy`；**FORBIDDEN 本轮删/改** legacy 默认 `E2E_PG_IMAGE=pgvector/pgvector:pg16`；**本绿 ≠ 默认镜像已退役**；**sole 不得用 unmarked pgvector 冒充绿**。

关联：`scripts/run-e2e-isolated.mjs`（`LEGACY_PG_IMAGE_DEFAULT` / `SOLE_APPROVED_FIXTURE_CONFIG`）· `pnpm g3-e2e-pg-image:prove` · BUG-FAKE-R5 · `m5-pgvector-fixture-retirement-plan.md`

---

## 0. 本切片范围（硬边界）

| 做 | 不做（FORBIDDEN 本轮） |
|----|------------------------|
| 库存 `E2E_PG_IMAGE` / pgvector 镜像默认入口 | **改** `E2E_ISOLATION_STACK` 缺省离 `pgvector-legacy` |
| sole 轨 **fail-closed**：显式 `E2E_PG_IMAGE` / 非批准 fixture → EXIT=3 | **改** legacy 默认镜像值离 `pgvector/pgvector:pg16` |
| harness + 静态/轻量 prove + status G3 叙事 | 宣称 G3「默认值已退役」/ fixtures retired / L1 关 |
| 双域送审材料（`mw-e2e-ha` + `mw-rag-route`） | 扩 sole allowlist；切 production retrieval；勾 `releaseEvidence=true` |

---

## 1. Inventory — `E2E_PG_IMAGE` / pgvector 默认面

### 1.1 Isolated runner（根夹具）

| 入口 | 默认 / 行为 | G3 裁定 |
|------|-------------|---------|
| `scripts/run-e2e-isolated.mjs` | `LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16'`；`image = process.env.E2E_PG_IMAGE ?? LEGACY_PG_IMAGE_DEFAULT` | **legacy 默认值仍在**（本切片不退役） |
| unset `E2E_ISOLATION_STACK` | 写入 `pgvector-legacy`；docker-run 上述 image | R5-MARKED-RED；≠ sole |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis` + **显式** `E2E_PG_IMAGE=…` | **EXIT=3** `[G3-E2E-PG-IMAGE]` | **fail-closed** — unmarked pgvector ≠ sole green |
| sole + `E2E_SOLE_APPROVED_FIXTURE` ≠ `compose.mysql-local` | **EXIT=3** | **fail-closed** — without approved fixture config |
| sole allowlist（恰 5）且 **未**设 `E2E_PG_IMAGE` | compose.mysql-local；**不** docker-run PG | 批准 fixture = `compose.mysql-local` only |
| sole 非 allowlist | **EXIT=3** + PREREQ（含 G3 永不 docker-run `E2E_PG_IMAGE`） | 既有 R5 + G3 |
| `scripts/isolated/run-isolated.mjs` | 转发至 `run-e2e-isolated.mjs`；注释钉 R5/G3 | 壳本身 ≠ covered |

### 1.2 Docs / compose（非 isolated runner 默认，但同族假绿面）

| 入口 | 钉 |
|------|----|
| `docker/compose.dev.yml` / `docker/compose.demo.yml` | `image: pgvector/pgvector:pg16`（dev/demo；≠ sole-stack 真相） |
| `ai-docs/delivery/m5-pgvector-fixture-retirement-plan.md` | 库存 `E2E_PG_IMAGE`→pgvector；计划退役 ≠ 本绿已换 |
| `ai-docs/delivery/e2e-case-inventory.md` / matrix / ADR / conventions | 默认 `E2E_PG_IMAGE=pgvector…` = legacy fixture（BUG-FAKE-R5） |
| `packages/db/test/vectorstore.proof.ts` 等 | 经 isolated → 默认 pgvector；R5-MARKED-RED |

**硬读**：库存证明「默认假绿面仍在 legacy」；G3 本轮只 **封死 sole 静默吃 unmarked pgvector**，不假装默认已删。

---

## 2. Retirement path（标记 · 非本轮删默认）

| 步 | 含义 | 本切片 |
|----|------|--------|
| R-path-1 | 文档/runner 明示 `E2E_PG_IMAGE` ≠ sole-stack | **已钉**（R5 + 本 harness） |
| R-path-2 | sole **禁止** docker-run / 显式 `E2E_PG_IMAGE` 假绿 | **本切片落地**（fail-closed） |
| R-path-3 | sole 唯一批准 fixture = `compose.mysql-local`（MySQL+Qdrant+Redis） | **本切片落地** |
| R-path-4 | legacy 默认镜像值删除或改非 pgvector | **仍 GAP** — 仅 G1+G2 + 独立审后 |
| R-path-5 | `E2E_ISOLATION_STACK` 默认切 sole | **仍 GAP / FORBIDDEN 本轮**（G1 flip NOT open） |

---

## 3. Prove gates

| Gate CMD | 期望 | 含义 |
|----------|------|------|
| `pnpm g3-e2e-pg-image:prove` | **0** | inventory + 默认仍 legacy + sole fail-closed 源码钉 + 轻量 EXIT=3 抽检 |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis E2E_PG_IMAGE=pgvector/pgvector:pg16 node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | sole + unmarked image → G3 fail-closed |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis E2E_SOLE_APPROVED_FIXTURE=bogus node scripts/run-e2e-isolated.mjs sole-stack:wiring:prove` | **3** | without approved fixture config |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | 非 allowlist（R5）+ G3 永不 PG-run |
| `env -u E2E_ISOLATION_STACK env -u E2E_PG_IMAGE node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0**（leaf） | 默认仍 **pgvector-legacy** + 默认 image 路径仍在（≠ flip） |
| `pnpm g1-default-switch:prep:prove` | **0** | 交叉钉：isolation 默认未翻 |
| status 人工读 | n/a | G3：**path marked · sole fail-closed** · **默认镜像值仍 OPEN** · releaseEvidence=false |

---

## 4. FORBIDDEN claims（显式）

**禁止**因本 harness / prove EXIT=0 宣称或暗示：

1. **G3 已关闭** / `E2E_PG_IMAGE` **默认值已退役** / 静默路径已从 legacy 删除  
2. **翻默认** `E2E_ISOLATION_STACK` → `mysql-qdrant-redis` / G1 关 / L1 关  
3. fixtures retired / disposable sole isolation 已落地  
4. G2 关 / `vectorstore:prove`·`rag*`·`memory*` 默认已迁 Qdrant  
5. cutover / migrated / covered / HA / `releaseEvidence=true`  
6. sole allowlist 扩面  
7. 本切片修改了 `.env*` 或生产检索默认  

**允许宣称**：G3 **retirement path marked**；**sole fail-closed**（unmarked `E2E_PG_IMAGE` ≠ sole green）；**默认仍** `pgvector/pgvector:pg16`（legacy）+ **`pgvector-legacy` isolation**；**≠ flip**。

---

## 5. 静态 / 轻量 prove CMD

```bash
pnpm g3-e2e-pg-image:prove
# ≡ node scripts/g3-e2e-pg-image.proof.mjs
```

| EXIT | 含义 |
|------|------|
| **0** | harness/status/runner/package 钉齐；默认 image/isolation 未翻；sole+`E2E_PG_IMAGE` 抽检 EXIT=3 |
| **1** | 诚实钉失败 |

**HARD**：prove **不得**把 `E2E_ISOLATION_STACK` 默认改 sole；**不得**改 legacy `LEGACY_PG_IMAGE_DEFAULT`。

---

## 6. Dual-review packet（`mw-e2e-ha` + `mw-rag-route`）

送审对照清单（实现方 **不自批**）：

1. 本 harness §0–§4 范围与 FORBIDDEN  
2. `scripts/run-e2e-isolated.mjs`：`LEGACY_PG_IMAGE_DEFAULT` 仍 `pgvector/pgvector:pg16`；`LEGACY_STACK` 仍默认；`[G3-E2E-PG-IMAGE]` fail-closed 分支  
3. `pnpm g3-e2e-pg-image:prove` 独立复跑 EXIT=0  
4. status G3 行：path marked · sole fail-closed · **默认值仍 OPEN**（不得写成「G3 关=默认已退役」）  
5. 对抗假绿：sole 绿 ≠ `E2E_PG_IMAGE` 退役；prep/G1 未翻  

结论落 `ai-docs/delivery/reviews/`（审稿人写；本切片只备齐材料）。
