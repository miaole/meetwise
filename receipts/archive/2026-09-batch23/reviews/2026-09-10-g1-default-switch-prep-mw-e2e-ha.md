# 审查归档 — G1 default-switch PREP · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~03:58 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审；**勿与并行 G4 R4 审混淆**）  
**结论**：**pass**（仅 PREP 清单/证明轨登记）  
**批准范围**：**仅** G1 **PREP**（harness 清单/回滚/gates + 静态 prove 轨 + status「prep landed · flip NOT open」）  
**不批**：**翻默认** / flip open / G1 关 / L1 关 / fixtures retired / sole 成默认 / HA / `releaseEvidence=true`  
**硬钉**：`releaseEvidence=false` · **Not HA** · **prep ≠ flip** · **禁止本轮翻默认** · **默认仍 `pgvector-legacy`** · **G1/G2 仍 OPEN**

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| `ai-docs/delivery/harness/g1-default-switch-prep.md` | **存在**；明文钉 PREP only / FORBIDDEN 本轮翻默认 / releaseEvidence=false / Not HA / flip NOT open / G2 仍 OPEN |
| `scripts/g1-default-switch-prep.proof.mjs` | **存在**；只读静态钉；**不**赋值 `E2E_ISOLATION_STACK=mysql-qdrant-redis` |
| status G1 更新（`r5-retirement-sole-stack-status.md`） | **G1 仍 GAP**：prep landed · flip NOT open · 禁止本轮翻默认 · 默认仍 legacy；**G2 仍 GAP** |
| `pnpm g1-default-switch:prep:prove` | 本审独立复跑 **EXIT=0**（见 §2） |

---

## 2. Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm g1-default-switch:prep:prove` | **0** | 全 PASS：harness/status/runner/package/proof 钉齐；LEGACY 默认；allowlist 恰 5；prove 不翻 env；NOTE 仍钉 G1 flip NOT open · G2/G3/G7 |
| `env -u E2E_ISOLATION_STACK node scripts/run-e2e-isolated.mjs isolated-env:prove` | **0** | banner **`[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`**（intended sole=`mysql-qdrant-redis`）；leaf PASS；**证明默认未切 sole** |

### 源码抽查（对抗）

| 检查 | 结果 |
|------|------|
| `LEGACY_STACK = 'pgvector-legacy'` | **是** |
| `isolationStack = rawIsolationStack \|\| LEGACY_STACK` | **是**（unset → legacy） |
| unset 时写入 `E2E_ISOLATION_STACK = LEGACY_STACK` | **是** |
| `rawIsolationStack \|\| SOLE_STACK` / 默认切 sole | **未检出**（FORBIDDEN flip 未发生） |
| `SOLE_WIRING_ALLOWLIST` | **恰 5**：wiring / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant（P13 rag/memory **OFF**） |
| 注释「NOT default switch (G1 still open)」 | **在** |
| proof / package `g1-default-switch:prep:prove` 注入 sole env | **无** |
| harness / status 把 prep 绿写成「默认已切 / G1 关 / fixtures retired / releaseEvidence=true」 | **无**（仅出现在 FORBIDDEN / 否定句） |

---

## 3. 对抗：假绿面

| 风险说法 | 裁定 |
|---------|------|
| prep prove EXIT=0 = **默认已切 sole** / **G1 关** | **否** — EXIT=0 仅=文档+源码静态诚实钉；runner 默认仍 legacy；status G1 **仍 GAP** |
| prep landed = **flip open** / 可合入默认切换 | **否** — harness 明文 **prep landed ≠ flip open**；**禁止本轮翻默认**；本审 **不批 flip** |
| allowlist 恰 5 绿 = L1 关 / fixtures retired | **否** — P8 ≠ disposable；≠ 默认已切；G1 关闭条件仍列 disposable + 双域审 |
| G2 / `vectorstore:prove`·`rag*`·`memory*` 已默认可信 Qdrant | **否** — status **G2 仍 OPEN**；P13/P14 明示 ≠ 默认迁移 |
| 本绿 = HA / `releaseEvidence=true` / cutover / migrated | **否** — 全程钉 **releaseEvidence=false · Not HA** |
| `isolated-env:prove` 绿 = sole-stack 真相 | **否** — banner 自标 **R5-MARKED-RED** + pgvector-legacy fixture ≠ sole |

**假绿风险（残留）**：中低——主要风险在**叙事外推**（把 PREP 绿口头升成 flip/G1 关）。证明轨本身诚实；runner 默认未被动。**只要遵守批准范围（仅 PREP）即可控**。

---

## 4. 阻塞栏（升 flip / 关 G1 前 · 本审不关）

| 阻塞项 | 现状 | 关闭条件（未宣称达成） |
|--------|------|------------------------|
| **翻默认 / flip** | **NOT open**；runner 仍 unset→legacy | 独立 flip 切片 + §4 prove gates 全绿 + **双域审通过**；**禁止借本 PREP 自批** |
| G1 关闭（sole 成默认 + disposable） | GAP；共享 compose ≠ disposable | disposable per-run MySQL+Qdrant+Redis + 宽业务 allowlist 另审 |
| G2 默认向量/RAG/memory | **仍 OPEN** | 默认 prove 打 Qdrant；opt-in ≠ 关 |
| G3 `E2E_PG_IMAGE` 退役 | 仍 GAP | 仅 G1+G2 + 独立审后 |
| G7 HA / releaseEvidence | 未开 L2/L3 | multi-instance + fault-inject；**禁止**本绿勾 true |
| 并行 **G4 R4** | 另轨；本审**不裁定** | 见 R4 status / 另份 review |

**本切片不因上述阻塞而 block PREP 登记**；上述仅 **阻塞翻默认 / 宣称 G1 关 / HA / fixtures retired**。

---

## 5. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA**
- [x] **prep ≠ flip** · **禁止本轮翻默认**
- [x] **默认仍 `pgvector-legacy`**（prove + isolated-env banner 双证）
- [x] **G1 仍 OPEN**（prep landed 仅登记；flip NOT open）
- [x] **G2 仍 OPEN**
- [x] 未宣称默认已切 / fixtures retired / G1 关 / HA / `releaseEvidence=true`
- [x] 批准范围仅 PREP；**不批翻默认**
- [x] 未与 G4 R4 审混写结论

---

## 6. 结论与建议

- **裁定：pass**（G1 **PREP only**）
- **批准范围**：登记 `g1-default-switch-prep` harness（prereq / flip checklist 草稿 / rollback 文档 / prove gates / FORBIDDEN）+ `g1-default-switch:prep:prove` 静态轨 + status「prep landed · flip NOT open · 默认仍 legacy」
- **明确不批**：改 `run-e2e-isolated.mjs` 缺省离 legacy；CI/脚本默认注入 sole；关 G1/G2；标 fixtures retired；勾 HA/`releaseEvidence=true`
- 下一刀（**另切片**）：仅当 §4 gates + G2 叙事仍诚实 + 双域预审后，才可开 **flip** 送审；本 PREP **不得**被引用为 flip 批准

对照：`ai-docs/delivery/harness/g1-default-switch-prep.md` · `scripts/g1-default-switch-prep.proof.mjs` · `ai-docs/delivery/harness/r5-retirement-sole-stack-status.md` §G1 · `scripts/run-e2e-isolated.mjs`（LEGACY/SOLE/allowlist）
