# PRE-EXEC · Line AG · NHP-001-ADV-01 blind→case · mw-e2e-ha（docs gate only · Ban coding · Ban 018/052/025 · Ban wash Y/AB · alone ≠ dual）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · 不代签 `mw-rag-route`）
**Review date**: 2026-10-06 ~12:59 CST（Asia/Shanghai · UTC+8）
**Line**: **AG**
**REQUEST tip**: `5eba515`（`5eba515ac638d6c6a2d51c9ff96cfd5d47ba6d22`）
**Parent chain**: `3dca5de` ← … ← `416b6a5` wave start · **match ancestry**
**Wave tip**: `b12e20d`
**Harness**: `ai-docs/delivery/harness/nhp-001-adv-01-blind-to-case.md`
**Slice**: `ai-docs/delivery/nhp-001-adv-01-blind-to-case.slice.md`
**Peer**: `mw-rag-route` stub PENDING · alone ≠ dual · 不代签
**本审未跑**: 零 product coding · 零 prove · 零 live · 零 fake-model · 零 `.env*` · 零 SSOT edit · 零 git config · 零 force-push · 零 wash Y/AB

## Docs-only

`git show --stat 5eba515`：**4 markdown**，零代码 / migration / script / package.json。

| Path |
|------|
| `ai-docs/delivery/harness/nhp-001-adv-01-blind-to-case.md` |
| `ai-docs/delivery/nhp-001-adv-01-blind-to-case.slice.md` |
| `ai-docs/delivery/reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-mw-e2e-ha.md`（stub） |
| `ai-docs/delivery/reviews/REQUEST-2026-10-06-nhp-001-adv-01-blind-to-case-mw-rag-route.md`（stub） |

## Spot-checks

| Check | Result |
|-------|--------|
| NHP `:39` NHP-001-ADV-01 · ADV · case-only · 委派 031/032 | ✓ |
| matrix `:112` UC-E2E-001 ADV=**blind**/`case-only`（无真证据注记） | ✓ |
| Line Y NEG nail 注记保留 · Line AB BOUND nail 注记保留 · **Ban wash** | harness/matrix 明文 ✓ |
| 选刀：ADV blind 优先 · UC-004 FAULT residual fallback **不触发**（gap · 非 blind） | ✓ |
| `rg -il guardrail apps/api/src packages/*/src` = **0** · GuardrailHit absent 披露 | ✓ |
| 注入合同 V1–V5（结构面 · V5 absent · Ban 假称已接） | ✓ |
| 拟 prove Ban live · Ban fake-model · EXIT0≠covered · Ban fake-green suite | ✓ |
| SCOPE UC-001 ADV only · Ban 018/052/025 · Ban 借 UC-004/011 | ✓ |
| Dual 专家对 mw-e2e-ha + mw-rag-route（模型层护栏不在本刀） | ✓ |

## Pins held

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-001 ADV stays **blind/`case-only`**

## Ban mirrored（from harness/REQUEST）

Ban coding · Ban prove 执行 · Ban live · Ban fake-model · Ban fake-green suite · Ban invent covered · Ban covered flip · **Ban wash Y/AB** · Ban wash 031/032 旁证 · Ban 假称 GuardrailHit 已接 · **Ban touching 018/052/025** · Ban 借 UC-004/011 · Ban secrets/`.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban SSOT edit · Ban self-approve · Ban self-nail · Ban 碰 AD/AE/AF/AH

## Conditions

- **C-1**：alone ≠ dual；不代签 peer（`mw-rag-route` PENDING）。
- **C-2**：本 PASS ≠ coding ≠ prove ≠ nail ≠ covered；执行须 PRE dual BOTH PASS + 协调方授权。
- **C-3**：SCOPE = UC-001 ADV only；**Ban 018/052/025 scope creep**；**Ban wash Y NEG / AB BOUND**。
- **C-4**：EXIT0 ≠ covered ≠ 031/032 闭环 ≠ 模型层防注入；GuardrailHit absent 如实。
- **C-5**：pins 冻结 · coveredCount=8 · Ban invent covered · Ban fake-green suite。

## Blockers

无阻塞。

## 中文三行摘要

1. REQUEST `5eba515` docs-only 选 NHP-001-ADV-01（matrix ADV=blind · NHP:39 case-only）；UC-004 FAULT fallback 不触发；V1–V5 结构注入合同 + GuardrailHit absent（rg=0）。
2. Ban live · Ban fake-model · Ban wash Y/AB · Ban 018/052/025 · EXIT0≠covered · coveredCount=8。
3. Blockers 无。本 PASS = docs 半签；alone≠dual（peer=rag PENDING）；≠ coding ≠ prove ≠ nail ≠ covered。

Verdict: PASS
