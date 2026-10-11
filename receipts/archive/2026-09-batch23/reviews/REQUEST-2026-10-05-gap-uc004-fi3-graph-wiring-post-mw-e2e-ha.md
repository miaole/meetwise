# Review — mw-e2e-ha — GAP-UC004-FI3-GRAPH-WIRING Candidate A POST-PROVE

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · 不代签 `mw-model-op`）
**Review date**: 2026-10-05
**Receipt tip**: `d9ddb13`（`d9ddb13fa9cc1e505e04d97cde9ad6620dc49b58`）
**Prove-exec SHA**: `ced3691`（`ced3691fb7b269c6b567f9af4510513cb8486c6e`）≡ 链上 prove-tool `b80bf92`（`b80bf92d4b3dc901a63bdcb585df47c5e7a285bb`）
**Code**: `0a3c8a8`（≡ pre-rebase `fc9d807`）
**REQUEST**: `f4b95fe` · PRE dual：mw-e2e-ha `@560a933` + mw-model-op `@3089253`
**Receipt**: `ai-docs/delivery/receipts/2026-10-05-gap-uc004-fi3-graph-wiring-prove.md`
**CMD**: `pnpm uc004:career-path-fault:prove` · **EXIT=0**（one-shot · attempts 4 all 0）
**本审**：未重跑 fault prove（docker 隔离；`ced3691`≡`b80bf92` 映射诚实 · Ban 仅为 rebase 重跑）。独立跑静态 `node apps/api/test/uc-e2e-004-career-path.proof.mjs` **EXIT=1**。Ban live · 零 Key · 零 `.env*` · 零 model API。

本 PASS 只表示接线 + fault prove 红/绿账目诚实。**EXIT0 ≠ A3 closed**。行 stays gap。≠ nail ≠ coding ≠ HA。

---

## 1. CMD | EXIT 与 SHA 映射 — 通过

- Receipt 钉：`CMD=pnpm uc004:career-path-fault:prove EXIT=0` · `ATTEMPTS_LEDGER attempts=4 one_shot=true retry_to_green=false exits=…:0×4`（CONTROL/FI2/FI1/FI3）。
- Appendix 全文含 FI-3 seam `MEETWISE_CAREER_PATH_FAIL_THREAD_ID`、`trace_rows_delta=0`、HTTP 500/`internal_error`、graph_run `failed`、ledger_net=0。
- **映射**：`git show b80bf92|ced3691 | patch-id --stable` 同为 `bdf499e64a3850134b4c6a8cede29f9484f6c40c`；`git diff --stat b80bf92 ced3691` = 仅 4 个 Line U `g7-trio-fresh` receipts；`interview.service.ts` blob `88c85d17…`、fault `proof.ts` blob `c7eeee09…` 两侧相同。prove 跑在 rebase 前 `ced3691`；链上等价 `b80bf92`；receipt tip `d9ddb13` = `b80bf92` + receipt。**不要求**仅为 rebase 重跑 fault。

## 2. EXIT0 ≠ A3 closed · 行 stays gap · pins — 通过

Receipt 明文：`EXIT0 ≠ A3 closed` · `GAP-UC004-FAIL-A3` / `NHP-004-FAULT-01` / `UC-E2E-004` FAULT **stays gap** · SSOT 零 diff（`e8c63a9..d9ddb13` 矩阵/backlog/checklist 空）。Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。未翻 covered / 未关 A3。

## 3. Attention — workspace dep / 静态 EXIT1 / Ban wash — 通过

1. **`@meetwise/ai-graphs` workspace:*** @`0a3c8a8` 入 `apps/api/package.json`；lock 仅 +3 行 importer `link:../../packages/ai-graphs`；零第三方膨胀。接线必需 · **可接受**（C-POST-HA-5）。
2. **静态** `uc004:career-path:prove`：本审独立 `node apps/api/test/uc-e2e-004-career-path.proof.mjs` **EXIT=1**（S2/S3/G-GAP FAIL）。与 receipt §1#3 一致。**预期绊线**，非本刀失败；本刀未改该 proof。不得洗成本刀红。
3. **attempt/ledger**：fault one-shot · `retry_to_green=false` · 未 wash。

## 4. 代码抽查（@`b80bf92`）

- `interview.service.ts:37-39`：`NODE_ENV=production` 恒关 seam；`:804-805` `selectCareerPathDerive` + `runCareerPathGraph`。
- `packages/ai-graphs/src/career-path.ts`：langgraph + domain type-only；fail-only seam。
- fault proof：删 `MODEL_API_KEY`/`MODEL_BASE_URL`；seam=IV_FI3；FI1 per-thread failed+version≥2；零 trace。
- 禁面：`interview-graph-lease.ts` / `career.ts` / `ai-runtime/**` / worker / 静态 mark-red proof / SSOT —— 相对 base 零产品外溢（与 receipt §2 一致）。

## Blockers

无。

## Conditions

- **C-POST-HA-1**：`GAP-UC004-FAIL-A3` / FAULT 行 stays gap；EXIT0 ≠ A3 closed；须 post dual 双方 + 协调方 nail 才可关；Ban 本刀翻 SSOT / covered。
- **C-POST-HA-2**：alone ≠ dual；本 PASS 不代签 `mw-model-op`，不构成 dual，不授权 nail。
- **C-POST-HA-3**：静态 `uc004:career-path:prove` EXIT=1 为接线后预期绊线；另刀处理；Ban 记为本刀失败。
- **C-POST-HA-4**：prove-exec `ced3691` ≡ `b80bf92`；Ban 仅为 rebase 强制重跑 fault。
- **C-POST-HA-5**：`@meetwise/ai-graphs` workspace link 接受；Ban 第三方 lock 膨胀冒充。
- **C-POST-HA-6**：Ban live · seam 默认关 / fail-only / production-off · zero trace · `actualSpend` 不适用且无 invent spend。
- **C-POST-HA-7**：pins 八项原值 · coveredCount=8 · releaseEvidence=false · ≠HA。
- **C-POST-HA-8**：矩阵「FI-3 未接线」类措辞相对产品已接线可能陈旧；**仅 nail 阶段**可改行文；此前 row stays gap，禁用 EXIT0 洗关。

## 中文三行摘要

1. tip `d9ddb13` · prove `ced3691`≡`b80bf92` · `pnpm uc004:career-path-fault:prove` EXIT=0 · attempts 4/4=0 · Ban live · zero trace · seam 属实。
2. EXIT0 ≠ A3 closed · FAULT stays gap · coveredCount=8；workspace `ai-graphs` link 可接受；静态 career-path prove 独立复验 EXIT=1（预期绊线）。
3. Blockers 无。本 PASS = 诚实性半签；alone≠dual；≠ nail ≠ coding ≠ HA。

Verdict: PASS
