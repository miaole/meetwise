# 审查归档 — G3 E2E_PG_IMAGE · P17 · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~04:12 PT）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；实现方不自审；平行 `mw-rag-route` 不采信）  
**结论**：**pass**（仅 path marked + sole fail-closed 钉登记）  
**批准范围**：**仅** G3 **retirement path marked** + **sole fail-closed**（harness / prove / runner `[G3-E2E-PG-IMAGE]` / status P17）  
**不批**：**默认镜像值退役** / **翻默认** `E2E_ISOLATION_STACK` / fixtures retired / G3 关 / G1·G2 关 / HA / `releaseEvidence=true` / covered  
**硬钉**：`releaseEvidence=false` · **Not HA** · **path marked + sole fail-closed** · **≠默认已退役** · **≠翻默认** · **G3 仍 GAP on default image value**

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| `ai-docs/delivery/harness/g3-e2e-pg-image.md` | **存在**；钉 releaseEvidence=false / Not HA / 本绿≠默认镜像已退役 / inventory / FORBIDDEN 翻默认与删改 legacy image / 默认镜像值仍 OPEN / dual-review |
| `scripts/g3-e2e-pg-image.proof.mjs` | **存在**；静态钉 + 轻量 sole fail-closed spawn；HARD NEVER flips / NEVER retires default |
| `scripts/run-e2e-isolated.mjs` G3 pins | **成立**：`LEGACY_PG_IMAGE_DEFAULT='pgvector/pgvector:pg16'`；unset isolation→`pgvector-legacy`；sole+显式 `E2E_PG_IMAGE`→EXIT=3；approved fixture≠`compose.mysql-local`→EXIT=3；defense-in-depth 拒 sole docker-run PG；`delete soleEnv.E2E_PG_IMAGE` |
| status P17 / G3（`r5-retirement-sole-stack-status.md`） | **P17 Proven** = path marked + sole fail-closed；**G3 仍 GAP** = 默认镜像值未退役；L1 仍 GAP；releaseEvidence=false |
| `pnpm g3-e2e-pg-image:prove` 等 CMD | 本审独立复跑见 §2（与送审声称一致） |

**硬读确认**：**marked ≠ retired**；**G3 still GAP on default**（status §2 G3 行 + harness R-path-4/5 仍 GAP）。

---

## 2. Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm g3-e2e-pg-image:prove` | **0** | harness/status/runner/package/compose/M5 钉齐；LEGACY image/isolation 未翻；behavior sole+`E2E_PG_IMAGE`→3；NOTE：STILL-GAP 默认值未退役 |
| `node scripts/g1-default-switch-prep.proof.mjs`（≡ `pnpm g1-default-switch:prep:prove`） | **0** | 交叉钉：isolation 默认仍 legacy；flip NOT open；prep ≠ flip |
| `pnpm mysql-stack:r5-mark-red:prove` | **0** | 标红诚实；默认仍 `E2E_PG_IMAGE`→pgvector；≠ fixtures retired；≠ HA |
| `E2E_ISOLATION_STACK=mysql-qdrant-redis E2E_PG_IMAGE=pgvector/pgvector:pg16 node scripts/run-e2e-isolated.mjs isolated-env:prove` | **3** | `[G3-E2E-PG-IMAGE] … forbids E2E_PG_IMAGE=…`；**sole fail-closed** |
| `env -u E2E_ISOLATION_STACK -u E2E_PG_IMAGE node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0** | banner `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy` + `E2E_PG_IMAGE=pgvector/pgvector:pg16`；**默认仍 legacy（≠ flip）** |

### 源码抽查（对抗）

| 检查 | 结果 |
|------|------|
| `LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16'` | **是**（未改） |
| `image = process.env.E2E_PG_IMAGE ?? LEGACY_PG_IMAGE_DEFAULT` | **是**（默认路径仍在） |
| `isolationStack = raw \|\| LEGACY_STACK`；unset 写回 legacy | **是** |
| `raw \|\| SOLE_STACK` / 默认切 sole | **未检出** |
| sole + `explicitPgImage` → `process.exit(3)` + `[G3-E2E-PG-IMAGE]` | **是** |
| `approvedFixture !== SOLE_APPROVED_FIXTURE_CONFIG` → EXIT=3 | **是** |
| sole allowlist 路径 `delete soleEnv.E2E_PG_IMAGE` | **是** |
| defense-in-depth：sole 分支拒 docker-run PG image | **是** |
| compose.dev / compose.demo 仍 `pgvector/pgvector:pg16` | **是**（库存假绿面仍在） |
| status/harness 把 marked 绿写成「默认已退役 / G3 关 / fixtures retired / 翻默认 / releaseEvidence=true」 | **无**（仅出现在 FORBIDDEN / 否定句 / GAP 表） |
| sole receipt `claimsForbidden` 含 `e2e_pg_image_retired` / `releaseEvidence=true` | **是**（禁宣称列表，非勾 true） |

---

## 3. 对抗：假绿面

| 风险说法 | 裁定 |
|---------|------|
| g3 prove EXIT=0 = **`E2E_PG_IMAGE` 默认值已退役** / **G3 关** | **否** — EXIT=0 仅=path marked + sole fail-closed 诚实钉；`LEGACY_PG_IMAGE_DEFAULT` 仍 pgvector；status **G3 仍 GAP** |
| marked 绿 = **fixtures retired** / L1 关 | **否** — R-path-4/5 仍 GAP；L1 明示 G1–G3；P17 不得外推 fixtures retired |
| sole fail-closed 绿 = **默认已切 sole** / **翻默认** | **否** — unset 仍 `pgvector-legacy`；g1 prep 钉 flip NOT open；本审 **不批翻默认** |
| sole allowlist 绿 + 剥 `E2E_PG_IMAGE` = 镜像默认已删 | **否** — 仅 sole 子进程剥离；legacy 轨默认 image 完整保留 |
| 本绿 = HA / `releaseEvidence=true` / covered / cutover / migrated | **否** — 全程 `releaseEvidence=false` · Not HA · ≠ covered |
| compose.dev/demo 仍 pgvector = 矛盾 / 应已清 | **否** — harness 明示同族假绿面库存；本切片 **禁止**本轮删默认 |

**假绿风险（残留）**：**中**——主要风险在**叙事外推**（把 path-marked / sole fail-closed 口头升成「默认镜像已退役」或「G3 已关」）。证明轨与 runner 默认均诚实未翻；**只要遵守批准范围即可控**。次要风险：sole allowlist receipt 绿被误读为 L1/fixtures retired（status/P8/P17 已钉 ≠）。

---

## 4. 阻塞栏（升「默认退役」/ 关 G3 · 本审不关）

| 阻塞项 | 现状 | 关闭条件（未宣称达成） |
|--------|------|------------------------|
| **G3 默认镜像值退役** | **仍 OPEN/GAP**；`LEGACY_PG_IMAGE_DEFAULT` 仍 `pgvector/pgvector:pg16` | 仅 G1+G2 + 独立审后改/删 legacy 静默默认；**禁止借本绿自批退役** |
| **翻默认** `E2E_ISOLATION_STACK`→sole | **FORBIDDEN 本轮**；g1 flip NOT open | 另切片 flip + dual-review；本 G3 **不批** |
| G1 关（sole 成默认 + disposable） | GAP | disposable per-run + 双域审 |
| G2 默认向量/RAG/memory | 仍 OPEN | 默认 prove 打 Qdrant；opt-in ≠ 关 |
| G7 HA / releaseEvidence | 未开 L2/L3 | multi-instance + fault-inject；**禁止**本绿勾 true |
| compose.dev/demo pgvector 假绿面 | 仍在（库存） | 随退役计划另审；≠ 本切片范围 |

**本切片不因上述阻塞而 block path-marked 登记**；上述仅 **阻塞宣称默认已退役 / 翻默认 / G3 关 / HA / fixtures retired**。

---

## 5. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA**
- [x] **path marked + sole fail-closed**（prove + 行为 EXIT=3 双证）
- [x] **≠默认已退役** · **G3 仍 GAP on default image value**
- [x] **≠翻默认** · isolation 默认仍 `pgvector-legacy`（g1-prep + default legacy=0）
- [x] 未宣称 fixtures retired / G3 关 / G1·G2 关 / covered / HA / `releaseEvidence=true`
- [x] 批准范围仅「G3 path marked + fail-closed 钉登记」；**不批退役/翻默认**
- [x] 未读 `.env*`；未碰 Meridian

---

## 6. 结论与建议

- **裁定：pass**（G3 **path marked + sole fail-closed only**）
- **批准范围**：登记 `g3-e2e-pg-image` harness（inventory / retirement path / FORBIDDEN / dual-review）+ `g3-e2e-pg-image:prove` + runner sole `[G3-E2E-PG-IMAGE]` fail-closed + status **P17**（明示 ≠ 默认已退役）
- **明确不批**：改/删 `LEGACY_PG_IMAGE_DEFAULT`；unset isolation 默认切 sole；宣称 G3 关 / fixtures retired；勾 HA/`releaseEvidence=true`
- **默认 image/legacy 状态**：`E2E_PG_IMAGE` 缺省仍 **`pgvector/pgvector:pg16`**；`E2E_ISOLATION_STACK` 缺省仍 **`pgvector-legacy`**；**G3 默认值仍 OPEN（GAP）**
- 下一刀（**另切片**）：仅当 G1 flip + G2 默认迁栈叙事诚实后，才可开「默认镜像退役」送审；本 P17 **不得**被引用为退役/翻默认批准

对照：`ai-docs/delivery/harness/g3-e2e-pg-image.md` · `scripts/g3-e2e-pg-image.proof.mjs` · `scripts/run-e2e-isolated.mjs`（LEGACY_PG_IMAGE_DEFAULT / G3 fail-closed）· `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md` §P17 / §G3 · `pnpm g1-default-switch:prep:prove` · `pnpm mysql-stack:r5-mark-red:prove`
