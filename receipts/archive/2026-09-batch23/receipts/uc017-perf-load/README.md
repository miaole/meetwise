# UC017 PERF/LOAD receipts — label

**implementer pre-commit runs · not evidence of record**

- Tracked JSON under this directory (`uc017-nhp-load-attempt00*.json`) mirror the implementer runs at code SHA `4804c3dc…`（branch `line/y-next-nhp` worktree pre-commit state; prove wiring uncommitted at run time）.
- Command: `MW_GIT_SHA=<sha> env -u MODEL_API_KEY -u DASHSCOPE_API_KEY pnpm uc017:nhp-load:prove` · EXIT=0 both attempts · 45 asserts PASS / 0 FAIL each.
- Attempt ledger: `attempt-ledger.txt`（全录 · attempt#1 receipt-path implementer wiring defect disclosed · attempt#2 = shipped-code run）.
- Knife: **NHP-017-LOAD-w-01** · gap id **GAP-UC017-LOAD-01** · prove receipt: `ai-docs/delivery/receipts/2026-10-07-gap-uc017-load-sweep-nhp-prove.md`.
- **Evidence of record** for this knife = reviewers' independent post-prove dual re-runs（mw-e2e-ha + mw-rag-route，另行另派）· these implementer files are **retained** for audit trail only · **Ban** cite them as evidence of record.
- Non-claims: EXIT0 ≠ covered ≠ suite green ≠ 行升格 ≠ PERF_api/PERF_web ≠ SLO ≠ 容量 ≠ HA · coveredCount=8 不变 · releaseEvidence=false · haStatus=NOT_HA.

See `ai-docs/delivery/harness/gap-uc017-load-sweep-nhp.md` 负载合同 §负载合同（L1–L5 + NEG 硬闸 N1–N4 + PC）· wording follows `ai-docs/delivery/receipts/uc018-perf-load/README.md` precedent.
