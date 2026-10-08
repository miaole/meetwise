# Slice — **DBFK-1** · interview 复合 FK 渐进补齐（GAP-DEBT-DB-NOFK · W2 二刀 · REQUEST 阶段）

**Status**: **`exec:awaiting_post_prove_dual`**（EXEC 完成：0147+0148 落地 · prove 31/31 EXIT=0 · P7 四项 base-identical red 登记=DBID1-UUIDV7-ACL-E1 既有雷）
**Date**: 2026-10-08（rev2 同日）
**Author**: **`mw-core`**（rev2 小修：协调方 0144 序裁定迁移顺延 0147/0148 · §1.5a 口径勘误 · P7 补 recruiter-depth 复跑）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-e2e-ha`（pre-exec 双审 · Ban self-approve · Dual PASS ≠ 开工 · 须 meetwise 明示授权）
**Parent tip**: `48dee7a2`（branch `line/db-interview-fk` · base `origin/feat/mysql-schema-skeleton`）

---

## Products

| Role | Path |
|------|------|
| This slice | `ai-docs/delivery/db-intfk.slice.md` |
| REQUEST（harness） | `ai-docs/delivery/harness/db-intfk.md` |
| Dual stub · model-op | `ai-docs/delivery/reviews/REQUEST-2026-10-08-dbfk1-mw-model-op.md` |
| Dual stub · e2e-ha | `ai-docs/delivery/reviews/REQUEST-2026-10-08-dbfk1-mw-e2e-ha.md` |

## One-line scope

interview 复合 FK 渐进补齐 REQUEST：父侧 `UNIQUE(id, owner_user_id)`（镜像 resume 模板 0001:180）+ Batch 1 三表（ai_report/assessment_report/question_feedback）复合 FK `ON DELETE CASCADE` · Batch 1b（learning_plan/career_path + 亲核孪生 learning_progress）复核后同刀（D2）· interview_event 两案并陈交双审（D1 · mw-core 建议保持无 FK+登记）· additive 迁移 orphan-check-first（rev2：0147 concurrent-index 父索引 + 0148 NOT VALID+VALIDATE · 协调方序裁定顺延 · PG 无 FK CONCURRENTLY 措辞修正 D4）· 擦除迁移零碰（FK 驱动收缩=未来刀 §4）· Prove P1-P7 + 回归复跑（三表 + rev2 补 recruiter-depth CASCADE 级联面）。

## Hard pins

- pins 全保留：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
- **Ban 碰历史迁移/擦除迁移**（0001-0143 · 0048/0058/0059/0062/0092/0093/0096/0111/0118/0125 点名）
- **Ban 碰 RLS/触发器**（0058/0059/0062 写 guard 面零碰）· **Ban 孤儿>0 时静默回填**（只登记另裁）
- **Ban 本刀内 interview_event 判别列手术**（案 A 裁中也是独立后刀）· **Ban 改共享 SSOT** · **Ban secrets**
- 本 turn docs-only：写完 REQUEST 即停 · Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权
- prove EXIT=0 · attempts 全账 · Ban retry-to-green

## EXEC checklist（授权后）

1. `packages/db/migrations/0147_interview_owner_unique_index.sql`：`-- @migration-mode concurrent-index` + `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_interview_id_owner ON interview (id, owner_user_id);`（恰一条语句合 runner 正则门 · rev2 顺延号——EXEC 期亲核卷首实占号，不符则以实际顺号落地并登记）
2. `packages/db/migrations/0148_interview_composite_fk_batch1.sql`：`ADD CONSTRAINT uq_interview_id_owner UNIQUE USING INDEX` 收编 + 6×FK `(interview_id, owner_user_id)→interview(id, owner_user_id) ON DELETE CASCADE NOT VALID` + 6×`VALIDATE CONSTRAINT`（同事务 · Batch 1 三表 + Batch 1b 三表若 D2 裁同刀）
3. orphan-check-first：ADD 前逐表 LEFT JOIN 查孤儿（§3.4 SQL）· 期望 0 · >0 停+登记
4. `packages/db/test/db-int-fk.proof.ts` + 接线三点（root pkg / db pkg / run-e2e-isolated.mjs）：P1 孤儿+合成孤儿 VALIDATE 拒 · P2 catalog 六点 · P3 双负门（不存在 id / 错 owner → 23503）· P4 正路径 · P5 0096 purge 共存复刻 · P6 静态门（新迁移零 UPDATE/DELETE/DROP/TRIGGER/POLICY + 历史迁移零 diff）· P7 回归复跑（growth / uc019-report-regenerate / int-transcript-remaining-sinks / **recruiter:prove——rev2 补 CASCADE 级联面·cleanup :210 全库唯一根行删点**）
5. 债行 `gap-bug-backlog.md:875` 追加进度注（append-only · 不 CLOSE——event 裁定与后续批在卷）
6. post-prove 双审 → meetwise 授权 nail

## Decision points（双审裁定）

D1 interview_event 案 A（CASCADE+判别列手术·独立后刀）vs 案 B（保持无 FK+登记理由·建议 B）· D2 Batch 1b 同刀 6 FK（learning_plan/career_path/learning_progress · 建议同刀）· D3 FK NOT DEFERRABLE 严于 resume 模板（建议确认）· D4 形态 1 双迁移 + PG 无 FK CONCURRENTLY 措辞修正（建议确认）· D5 CASCADE vs NO ACTION（建议 CASCADE 铺轨）· D6 排除面 §2.4（建议确认登记）。

## Non-claims

≠HA · ≠suite green · ≠擦除机器已减半（只铺轨）· ≠interview_event 判别列/分表 · ≠删除 interview 根行（fence 锚不动）· ≠存量回填 · ≠RLS/触发器变更 · ≠coding authorized · ≠覆盖任何 e2e 门（coveredCount=8 不变）。
