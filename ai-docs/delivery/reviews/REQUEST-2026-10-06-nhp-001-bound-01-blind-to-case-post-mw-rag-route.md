# REQUEST — **NHP-001-BOUND-01 · UC-001 BOUND blind→case** · post-prove · mw-rag-route

**Status**: post-prove · 2026-10-06T00:41:38+0800
**Expert**: `mw-rag-route` · alone ≠ dual · 不代签 mw-e2e-ha · 不 nail
**审查对象**: REQUEST `c6dd1a6` · CODE `6e96cf50a8be410a0d2154761afef88cd2368c7a` · prove tip `f8cdc82748922a15f668993fe742411052cf21fd` · receipt `ai-docs/delivery/receipts/2026-10-06-nhp-001-bound-01-blind-to-case-prove.md`
**PRE**: ours `64252bec74a5cde9aed077869aa86dfcf5d40586`
**NORTH-STAR-EXECUTION-LOOP**: 门 = `north-star-hard-gates.md` + harness/slice。

## 复跑（`/tmp/mwrr-f8cdc82` @ `f8cdc82` · `env -u MODEL_API_KEY` · Docker OK · `pnpm install --frozen-lockfile` 披露）

| CMD | EXIT | 要点 |
|-----|------|------|
| `pnpm uc001:nhp-bound:prove` | **0** | `SUMMARY asserts=17 failed=0` · `ISOLATED_TARGET_ATTESTATION ok` · 隔离 PG 容器 |
| Mutation：禁用 alreadyBegun 短路 + 去掉 `ON CONFLICT DO NOTHING` | **1** | asserts failed=4（ANCHOR-B1 / B1b / B1c） |
| Restore 后再跑 | **0** | — |

B1 证据：首 begin **202** + consumption 恰 1（key=interview id）+ start job 1；重放 **202 alreadyBegun** 同 jobId · ledger 逐字相同 · **无双扣**；第三次同。L0 Ban live；L1 trace 0→0。

## 触碰面核验

- `git show --stat 6e96cf5` = 4 文件：proof + package.json×2 + `run-e2e-isolated.mjs`。**`apps/api/src` diff 空**（刀内零产品改动）。
- 披露：`64252be..f8cdc82` 全树 `apps/api/src` 非空（他刀 AA FAULT / Line Z commerce）——**≠** 本刀 `6e96cf5` 触碰 begin 幂等口。
- FUNNEL / G-R4-5 / matrix SSOT：`6e96cf5`/`f8cdc82` 未改。coveredCount=8 · pins 保留。

## PRE 条件（`64252be`）落地表

| # | 条件 | 落地 | 证据 |
|---|------|------|------|
| 1 | docs-only REQUEST；BOUND=幂等 begin | **落地** | prove-only knife；B1 合同 |
| 2 | 锚点：advisory / alreadyBegun / reserve(interview id) / ON CONFLICT | **落地** | 运行时 ANCHOR 解析；产品未改口 |
| 3 | 与 Y 分离 · Ban wash Y | **落地** | B2 禁 import nhp-neg；未改 Y 收据 |
| 4 | FUNNEL 不触 | **落地** | knife 文件清单无 FUNNEL/r4-funnel |
| 5 | 证据层 = `run-e2e-isolated` 真 PG（非 fake） | **落地** | isolated 容器 + attestation；mut 可红 |
| 6 | 正控可红 · EXIT1 保留 · pins | **落地** | 首 202 + mut EXIT1；pins 未翻 |

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · DELETE=503 · PG-retained。EXIT0≠covered≠nail≠HA。alone≠dual。

Verdict: PASS
