# 审查归档 — CI · **gitleaks FP allowlist + egress env-name register** · **post-prove** · mw-e2e-ha

**日期**：2026-09-17 ~00:22 PT  
**审稿人**：`mw-e2e-ha`（对抗独立 post-prove；**拒绝实现方自批**；**零 invent Key**；**未读 `.env*`**；**零 commit secrets**；**未**宣称 suite/G6/R5/HA/product close）  
**送审**：`reviews/REQUEST-2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-e2e-ha.md`  
**配对**：`REQUEST-2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-rag-route.md` / `2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-rag-route.md`（**须独立写**；冲突取更严；**本审不代签**）  
**刀**：PR #108 · `fix(ci): allowlist gitleaks FPs + register MODEL_API_KEY egress refs`  
**结论**：**pass**（**仅** docs/CI gate honesty：FP allowlist + env ***name*** 登记诚实 · **≠** suite/G6/R5/HA · **≠** product close · **Ban treating CI green as product close**）  
**releaseEvidence=false** · **≠HA** · **≠ suite green** · **≠ G6 closed** · **≠ R5 closed** · **sole 恰 5** · **FP fix ≠ suite green ≠ R5/G6/HA** · **no real Key committed**

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **批准范围** | **仅**「CI gate honesty」：`.gitleaks.toml` FP allowlist（4 paths + 3 regexes）意图与路径诚实；egress inventory 登记 env ***name***（MODEL_API_KEY / DASHSCOPE_API_KEY · `test-isolation`）；`pnpm provider-egress:inventory` EXIT=0 · prove EXIT=0 · `releaseEvidence=false`；PR #108 commit 面 gitleaks **no leaks found** |
| **明确不批** | suite green · G6 closed · R5 closed/retired · UI green · HA · `releaseEvidence=true` · product close · full-history secrets-scan CI = product green · invent Key · 实现方自批 · CI green = 产品关闸 · allowlist 扩到藏真密钥 |
| gitleaks（PR #108 range） | 本审独立 **EXIT=0** · no leaks found |
| `provider-egress:inventory` | 本审独立 **EXIT=0** · env_references=243 · releaseEvidence=false |
| `provider-egress:prove` | 本审独立 **EXIT=0** · 7/7 |
| 实现方自批 | **无效 / 拒绝** |
| `releaseEvidence` | **false** |
| 阻塞（本域 post-prove honesty） | **无** |
| 阻塞（suite / G6 / R5 / HA / product） | **仍开** — 本刀 **不**关这些面 |

---

## 1. 已读 / 对照

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST post-prove | `reviews/REQUEST-2026-09-17-ci-gitleaks-egress-fp-fix-post-prove-mw-e2e-ha.md` | 薄预写 · 禁自批 · Q1–Q6 · 硬钉齐 |
| Diff | `.gitleaks.toml` · `provider-egress-inventory.json` · `provider-egress-inventory.proof.mjs` | 3 files · +133/−4 · **无**明显真密钥模式 |
| CI | `.github/workflows/ci.yml` | `secrets-scan`（gitleaks-action · fetch-depth 0）+ `provider-egress:inventory/prove` |
| Allowlist targets | harness r5-sole / uc015 / uc025 · uc015 proof | 文档/脚本名 · `Key-unset e2e` · `prove:uc0xx` — **非**凭证 |
| Egress 新行 | MODEL_API_KEY ×20 sources + DASHSCOPE_API_KEY ×1 | `class=test-isolation` · **name only** |
| G6 / R5 / sole | harness g6-e2e-iso-blocked · r5 / sole docs | **SEPARATE / 仍开** · sole 恰 5 |

**Repo**：`/workspace/meetwise` · HEAD `1b0380237f3f891ee3fc1ce6f21daa688d0a79d8`。**未**读 `.env*`。**未** invent Key。**未** commit secrets。

---

## 2. 收据核验（权威 · 独立 spot · 不采信自批绿）

| # | CMD | 本审独立核验 | 诚实读法 |
|---|-----|--------------|----------|
| 1 | `gitleaks detect --config .gitleaks.toml --log-opts '1b03802^..1b03802'` | **EXIT=0** · `no leaks found` · 1 commit · ~4.3 KB | PR #108 commit 面干净 · **≠** suite/G6/R5/HA · **≠** product close |
| 2 | `pnpm provider-egress:inventory` | **EXIT=0** · `adapters=5; operations=10; … environment_references=243; releaseEvidence=false` | 静态清单合法 · observe-only · **≠** enforce · **≠** 云隔离证明 |
| 3 | `pnpm provider-egress:prove` | **EXIT=0** · 7/7 · `releaseEvidence=false` · count assert 243 | 证明钉死不可自抬 releaseEvidence |
| 4 | Full-history `gitleaks detect`（对照） | **EXIT=1** · 6 residual fixture-phrase hits · files = `ops/ecs/verify-preview-web.sh`（`must_not_forward`）· `langfuse-evaluation-contract.proof.ts`（`judge-policy-v1`） | **正交** · **不在**本刀 allowlist paths · **禁**本刀宣称 full-history secrets-scan / product green |

**Diff 扫描**：PR #108 patch **未见** `sk-` / `ghp_` / `AKIA` / PEM / JWT 类真密钥形态。Allowlist 注释明示 *Do NOT use this file to hide real credentials*。

**未做（禁）**：把 inventory EXIT=0 写成 suite/G6/R5/HA 绿 · 把 secrets-scan 写成产品关闸 · invent Key · 读 `.env*` · 扩 allowlist 掩盖正交 6 条 · 实现方自批。

---

## 3. REQUEST Q1–Q6（对抗答）

| # | 问 | 本审 |
|---|----|------|
| **Q1** | Agree scope = CI gate honesty only · ≠ suite/G6/R5/HA/product close？ | **同意。** 批准面 = FP allowlist + env name register 诚实 only。 |
| **Q2** | Agree allowlist FP-only · no real Key in PR #108？ | **同意。** 4 paths = honesty harness / prove · 3 regexes = `uc0xx` / `Key-unset e2e` / `prove:uc0xx`。Diff 无真密钥。 |
| **Q3** | Agree inventory EXIT=0 + releaseEvidence=false · names-only · ≠ enforce/cloud/product？ | **同意。** 独立 EXIT=0 · mode observe-only · names + `test-isolation`。 |
| **Q4** | Agree FP fix ≠ suite/G6/R5/HA · sole 恰 5 · Ban CI green as product close？ | **同意（硬钉）。** |
| **Q5** | Agree residual full-history hits = orthogonal · must not claim full-history/product green？ | **同意（硬钉）。** 6 条 fixture 短语 · 另刀；本刀 **不**关 full-history secrets-scan 产品面。 |
| **Q6** | Independent spot gitleaks + inventory？ | **已做。** PR range gitleaks **0** · inventory **0** · prove **0**。 |

---

## 4. Hard pins（再钉）

- **FP fix ≠ suite green ≠ R5 closed ≠ G6 closed ≠ HA ≠ product close**
- **Ban treating CI green as product close**
- **no real Key committed** · env register = ***name*** only · never paste Key · never read `.env*`
- **`releaseEvidence=false`** · mode **observe-only**
- **sole 恰 5** retained · R5 / G6 / suite **SEPARATE / 仍开**
- Allowlist **不得**扩到藏真密钥 / 不得默默吞掉正交 residual hits 当「本刀已绿全史」
- **拒绝实现方自批**

---

## 5. 假绿扫描（docs / CI）

| 风险说法 | 裁定 |
|---------|------|
| inventory EXIT=0 / gitleaks PR-range clean = suite green / G6 closed / R5 closed | **假绿 / 禁** — docs/本审 **未**如此宣称 |
| CI secrets-scan / verify 绿 = 产品关闸 / HA / releaseEvidence | **假绿 / 禁** — **Ban treating CI green as product close** |
| env name 登记 = Key 已安全分发 / 云出站已证 | **假绿 / 禁** — observe-only · names only |
| allowlist = 全史 secrets-scan 已彻底干净 | **假绿 / 禁** — residual 6 正交仍在 |
| 实现方预写 REQUEST = 专家 pass | **禁** — 拒绝自批 |

---

## 6. 签名

**Verdict**: **pass**  
**Scope**: **post-prove CI gate honesty only**（FP allowlist + env name register · receipts match · no product-close claim）  
**Expert**: `mw-e2e-ha`  
**Independent EXIT**: gitleaks PR-range **0** · `provider-egress:inventory` **0** · `provider-egress:prove` **0**  
**SHA**: `1b0380237f3f891ee3fc1ce6f21daa688d0a79d8`  
**Confirm**: FP fix ≠ suite/G6/R5/HA · Ban CI green as product close · no real Key committed · releaseEvidence=false · sole 恰 5 · residual full-history FPs orthogonal · 拒绝自批 · 配对 `mw-rag-route` 独立

---

*Review · mw-e2e-ha · CI gitleaks+egress FP fix post-prove · 2026-09-17 ~00:22 PT · **pass** (CI gate honesty only) · SHA 1b03802 · gitleaks PR-range 0 · inventory/prove 0/0 · releaseEvidence=false · ≠HA · ≠ suite green · ≠ G6/R5 · sole 恰 5 · Ban CI green as product close · no invent Key*
