# Slice — **RAG04-C** · GAP-RAG-04 台账对齐刀（SSOT 诚实对齐 · docs-only）

**Status**: **`REQUEST`（本卷）· docs-only · nail 待 meetwise 授权**  
**Date**: 2026-10-08  
**Authority**: meetwise 待授权 · 流程：REQUEST → 预执行双审（mw-rag-route + mw-e2e-ha）→ meetwise 授权 → EXEC 面空/仅核对清单 → post 双审 → meetwise 授权 nail（nail=SSOT 行状态对齐落卷）→ STOP  
**releaseEvidence=false** · **haStatus=NOT_HA** · **claimProductionHA=false** · **g7SuiteGreen=false** · **actualSpendCny=null** · **PG-retained** · **公开 DELETE=503**  
**Base**: `eef469d9`（origin tip）· branch `line/rag04-ssot-align`

## Pins（照抄 harness §0）

**haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null**

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/rag04-ssot-align.slice.md` |
| Harness | `ai-docs/delivery/harness/rag04-ssot-align.md` |
| SSOT 目标行（nail 面触碰） | `gap-bug-backlog.md:72`（GAP-RAG-04）· `w0-w8-workflow-status.md:59` / `:151` / `:181` |
| REQUEST stub · rag-route | `reviews/REQUEST-2026-10-08-rag04-align-mw-rag-route.md`（空审 stub） |
| REQUEST stub · e2e-ha | `reviews/REQUEST-2026-10-08-rag04-align-mw-e2e-ha.md`（空审 stub） |
| 聚合证据链 | `harness/g-r4-5-product-close.md`（L0–L5 done · post_prove_dual_pass）· prove `ba1b8aa` · lifecycle nail `6ded5896` |

## One-line scope

nail 时把 backlog **GAP-RAG-04 行状态对齐**为「各 EG 面已闭（逐面 nail/prove tip 列表承卷）· `gR45Closed=true` · coveredCount=8 · `ms3EqualsR4Closed=false` retained · 行 **CLOSED（faces-complete）**」，`w0-w8` `:59`/`:151`/`:181` 状态文本一并对齐（逐处 file:line 前后文见 harness §4）。

**行翻转依据 = 既有各刀已授权 nail 的承卷（EG1 `88277ee`/`4a0877d` · EG2 `a34421a`/`2d3f055` · EG3 `7be1a55`/`5b3c854` · EG4 `ce09850`/`0a34933` · EG5 `33f457b`/`7f59b95` · EG6 `315570d`/`757fbe1` · R4·FUNNEL `2b38e18`/`14e9e2c` · 聚合 `4681b1a`→`c2cc937`→`ba1b8aa`→nail `6ded5896`；18 commit 均 tip 祖先，merge-base 亲证）——非本刀新裁、非新面、零 flag 翻转。**

## Hard Bans

Ban invent 新面 · Ban 洗 prior tips / ARCHIVE non-flip（`da185d9`/`139dac9`/`1c2ed8c`）· Ban 翻 `gR45Closed`/eg3/eg4/eg5/eg6 任一 flag（已 true，零翻转）· Ban 碰 `ms3EqualsR4Closed=false` · Ban coveredCount≠8 · Ban 改其他行 · Ban 碰产品码 · Ban secrets / `.env*` · Ban second knife · Ban假关 · Dual PASS ≠ next knife auto-authorize · G-R4-5 closed ≠ HA/cutover/suite · 公开 DELETE=503 freeze 不变。

## Non-claims

≠HA · ≠cutover · ≠suite green · ≠ `releaseEvidence=true` · ≠ MS3=R4 · 零 flag 翻转 · 零产品码 · 本 REQUEST 卷不改 SSOT 行（对齐只在授权后 nail 卷落）。
