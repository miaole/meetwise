# Review — CI · **gitleaks FP allowlist + egress env-name register**（**post-prove** · mw-rag-route）

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:22 PT）  
**结论**：**pass**（限：**docs/CI gate honesty** — FP allowlist + provider-egress env ***name*** 登记诚实；**FP fix ≠ suite green ≠ R5/G6/HA** · **Ban treating CI green as product close** · **no real Key committed** · **sole 恰 5** · `releaseEvidence=false`）  
**硬钉**：**≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **≠ HA** · **≠ sole cutover** · **≠ R4 closed** · **≠ 题域已隔离** · **≠ RAG migrated** · **`releaseEvidence=false`** · **mode observe-only** · **Ban CI green as product close** · **omit mw-model-op**  
**配对**：mw-e2e-ha · HEAD `1b0380237f3f891ee3fc1ce6f21daa688d0a79d8` · PR #108

覆盖 REQUEST：`REQUEST-2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-rag-route.md`  
对照：`.gitleaks.toml` · `ai-docs/architecture/ai/provider-egress-inventory.json` · `scripts/provider-egress-inventory.proof.mjs` · `.github/workflows/ci.yml` · R5/sole/G6 = **SEPARATE**

**本审动作**：核对 diff（names-only · 无真密钥形态）· 独立 `gitleaks detect`（PR #108 range）· 独立 `pnpm provider-egress:inventory` + `prove` · docs 假绿扫描 · **零** invent Key · **未读** `.env*` · **零** 自批 suite/G6/R5/HA/product close · **omit** `mw-model-op` 仍正确。

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass**（CI gate honesty only） |
| **批准范围** | FP allowlist 意图诚实（script names / Key-unset honesty docs）· egress 新增 = env **name** + `test-isolation` · inventory/prove EXIT=0 · releaseEvidence=false · observe-only |
| **明确不批** | suite green · G6 closed · R5 closed/retired · sole cutover · R4 closed · 题域已隔离 · RAG migrated · HA · `releaseEvidence=true` · product close · invent Key · CI green = 产品关闸 · allowlist 藏真密钥 |
| Independent EXIT | gitleaks PR-range **0** · inventory **0** · prove **0** |
| `releaseEvidence` | **false** |

---

## 1. 专家问答（REQUEST Q1–Q7）

| # | 问 | 答 |
|---|----|----|
| **1** | 本刀 = CI gate honesty only · ≠ suite/G6/R5/HA/product close？ | **同意。** 三文件 diff 仅 CI/docs 门诚实；**不**关产品面。 |
| **2** | egress 新增 = env name only · test-isolation · no real Key？ | **同意。** MODEL_API_KEY 多源 + DASHSCOPE_API_KEY×1 · 皆 `class=test-isolation` · 源码侧为 `process.env.NAME` / unset 探针 · **无**值入库。 |
| **3** | 省略 `mw-model-op` 仍正确？ | **同意。** 域 = CI secrets-scan FP + egress **name** inventory · **非** classify/route/MODEL-OP。omit **正确**。 |
| **4** | G6 OPEN · R5 OPEN SEPARATE · suite 未绿 · sole 恰 5 · ≠ 全家关？ | **同意（硬钉）。** sole 恰 5 retained · R5 SEPARATE · G6 still OPEN · suite not green。 |
| **5** | releaseEvidence=false · observe-only · Ban CI green = product close？ | **同意。** inventory JSON + proof 均钉 `releaseEvidence=false` · mode observe-only。 |
| **6** | allowlist = FP-only · Ban hide real credentials？ | **同意。** 注释 + 路径/正则均指向 honesty 短语 / pnpm script 后缀。**Ban** 用本文件藏真密钥。 |
| **7** | R5 / sole / RAG migrate 不并入本刀？ | **同意（硬钉）。** register ≠ RAG migrated ≠ R5 retired ≠ sole cutover。 |

---

## 2. CMD / EXIT 核验（RAG / egress 读法）

| CMD | EXIT（本审独立） | RAG / egress 诚实读法 |
|-----|------------------|----------------------|
| `gitleaks detect` PR #108 range + `.gitleaks.toml` | **0** · no leaks | Commit 面干净 · **≠** product close · **≠** RAG migrated |
| `pnpm provider-egress:inventory` | **0** · refs=243 · releaseEvidence=false | observe-only 静态名册 · **≠** enforce · **≠** 云出站证明 · **≠** Key 分发证明 |
| `pnpm provider-egress:prove` | **0** · 7/7 · count=243 | 不可自抬 releaseEvidence · **≠** release evidence |
| Full-history gitleaks（对照） | **1** · 6 residual fixture phrases（`must_not_forward` / `judge-policy-v1`） | **正交** · 不在本 allowlist · **禁**宣称全史 secrets-scan / 产品绿 |

**Egress stance（rag-route）**：

| 点 | 裁定 |
|----|------|
| schema/mode | schemaVersion=1 · **observe-only** · **releaseEvidence=false** |
| 新增引用 | env ***names*** only · `test-isolation` · 证明脚本/worker remaining / uc-e2e proofs |
| 证明计数 | environmentReferenceCount **222 → 243**（+21）与 diff 一致 |
| 非宣称 | ≠ cloud network isolation · ≠ unique egress · ≠ Key material safe · ≠ RAG migrated |

---

## 3. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 post-prove honesty** | **无阻塞**（allowlist+name register 诚实 · inventory/prove 0 · PR-range gitleaks 0 → pass） |
| **suite / G6 / R5 / HA / product** | **仍开** |
| **正交 secrets-scan** | full-history 6 fixture-phrase hits — **另轨** · 本刀不关 |
| **仍开 siblings** | R5 pgvector-legacy · G6 BUG-E2E-ISO · sole ≠ retired · ≠ RAG migrated · ≠ R4 / 题域已隔离 |

---

## 4. 非宣称

禁止：suite green、G6 closed、R5 closed/retired、sole cutover、R4 closed、题域已隔离、RAG migrated、HA、`releaseEvidence=true`、invent Key、把 CI/inventory 绿写成产品关闸、用 allowlist 藏真密钥、把正交 full-history hits 写成「本刀已清全史」、实现方自批。

---

## 5. 收据

- 专家：`mw-rag-route`
- 覆盖：`REQUEST-2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-rag-route.md`
- 结论：`ai-docs/delivery/reviews/2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-rag-route.md`
- HEAD / SHA：`1b0380237f3f891ee3fc1ce6f21daa688d0a79d8`
- 本审：gitleaks PR-range **0** · inventory/prove **0/0** · **pass (CI gate honesty only)** · releaseEvidence=false · ≠HA · ≠ suite/G6/R5 · sole 恰 5 · Ban CI green as product close · no invent Key · omit model-op

---

*Review · mw-rag-route · CI gitleaks+egress FP fix post-prove · 2026-09-17 ~00:22 PT · **pass** (CI gate honesty only) · SHA 1b03802 · gitleaks PR-range 0 · inventory/prove 0/0 · releaseEvidence=false · ≠HA · sole 恰 5 · Ban CI green as product close · omit model-op*
