# Slice — **DBSB-1** · src 样板收敛刀（runAs / job-claim 泛型 / withSavepoint + r4 退役协同 · REQUEST 阶段）

**Status**: **`draft:awaiting_pre_exec_dual`**（REQUEST 完成 · **未授权 EXEC** · zero coding / zero migration / zero prove）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · Ban self-approve · Dual PASS ≠ 开工 · 须 meetwise 明示授权）
**Parent tip**: `48dee7a2`（branch `line/db-src-boiler`）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/dbsb1-src-boiler-convergence.slice.md` |
| REQUEST（harness） | `ai-docs/delivery/harness/dbsb1-src-boiler-convergence.md` |
| Dual stub · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbsb1-mw-model-op.md` |
| Dual stub · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-07-dbsb1-mw-e2e-ha.md` |

## One-line scope

两债行（GAP-DEBT-DB-SRCBOILER + GAP-DEBT-BE-R4SCRIPTS 退役评估子面）合并一 REQUEST：`runAs(pool,role,fn)` 收敛 11 份 SET LOCAL ROLE 样板（principal.ts 10 + scoring-fact-root 漂移 1 · 薄别名保调用点零改动）· job 队列五件套 TS 泛型工厂（案B 不动表 · 案A 并陈交裁）· `withSavepoint` util 抽 3 处 4 实例 · r4 退役评估+prove 别名保全（物理迁出让位 DIR-1 B3 · 冲突让位五条）· Prove P1–P6 + 族复跑 22 项全绿。

## Hard pins

- pins 全保留：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
- **Ban RLS / 角色供给语义 / 历史迁移（0001–0143） / 擦除链 / secrets**（provision*+assert* 判定逻辑逐字节不动）
- **Ban r4 文件物理位移 + Ban 改 `prove:r4-*` 别名名**（让位 DIR-1 B3 · 见 harness §5）
- **Ban 行为语义漂移**：SQL 文本等价（或语义等价+prove 断言）· 错误码/回滚次序/payload-'answer' 擦除原样
- 本 turn docs-only：写完 REQUEST 即停 · Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权
- prove EXIT=0 · attempts 全账 · Ban retry-to-green

## EXEC checklist（授权后）

1. `principal.ts`：+`runAs`（role 白名单 fail-closed · `opts.principalUser` GUC variant）+ `withSavepoint`（落点 D5）· 9 具名 wrapper 单行委托 · `assertRagControlDefinerOwnership` 壳委托（断言体不动）
2. `scoring-fact-root.ts`：`asScoringWorkerPrincipal` → import 委托 principal.runAs
3. `job-queue.ts` 工厂 + 三队列（interview/quiz/diagnosis-jobs.ts）五件套委托 · 导出面不变
4. `resume.ts` / `payment.ts`×2 / `int-transcript.ts` 4 实例点接 `withSavepoint`
5. `dbsb1-src-boiler.proof.ts`（P1–P6 · harness §6）+ `dbsb1:prove` 别名 + 族复跑 22 项
6. `r4-evidence-retirement-assessment.md`（可退役集/永续集/触发条件 · 零 r4 位移）+ 台账 L876/L879 勘误
7. post-prove 双审 → meetwise 授权 nail

## Decision points（双审裁定）

D1 薄别名 vs 全量替换 263 调用点（建议薄别名）· D2 assertRagControlDefinerOwnership 壳并入（建议并入）· D3 provisionQbankControlDefiner 特判不收敛（建议不动）· D4 job 队列案B 先行 vs 案A 同刀（建议 B · A 后续刀）· D5 withSavepoint 落点 principal.ts（建议是）· D6 r4 协同 §5 让位五条（建议确认）。

## Non-claims

≠HA · ≠suite green · ≠性能/可用性 claim · ≠多态 job 表迁移 · ≠RLS/角色供给/历史迁移/擦除链/secrets 变更 · ≠r4 物理迁出（B3 所有）· ≠worker 生产包瘦身完成 · ≠coding authorized · ≠覆盖任何 e2e 门（coveredCount=8 不变）。
