# REQUEST — **DBFK-1 interview 复合 FK 渐进补齐**（GAP-DEBT-DB-NOFK · W2 二刀）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-model-op`
**Knife**: `harness/db-intfk.md` · slice `db-intfk.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-interview-fk` · docs-only REQUEST）
**Date**: 2026-10-08（rev2 · 请审 rev2 卷面：迁移顺延 0147/0148 · §1.5a 口径勘误「生产/迁移面 0 命中+recruiter-depth.proof:210 登记」· P7 补 recruiter-depth · 作者 mw-core）
**Line**: **DBFK**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|---|---|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false** |
| `actualSpendCny` | **null** |

## 请审什么（mw-model-op · schema/migration/SQL 正确性 · Ban 假绿）

Line DBFK · TASK-SOP Wave 2 第 5 行（GAP-DEBT-DB-NOFK P0 债行）。请审 REQUEST（harness §1–§9）：

1. **审计真伪**：「interview 零 FK 被引用」（grep=0）与卫星表全景（§1.2 双列齐备性/唯一键/0059 guard/擦除语义逐列）是否与你对 `48dee7a2` 的认知一致；债行「~10 万字节」vs 亲核 ~226KB 口径差（§1.6）是否接受为量级差。
2. **关键架构事实（§1.5）**：①interview 根行=fence 锚永不删（0058:42-45 行不在→guard 失效）→ CASCADE 在现行擦除路径 inert；②interview_event 多态共享流（0062:4-6 + 0143_sse_push_notify.sql:5 自述 + 五域 writer 亲核）→ stream_key 无法直接 FK；③0059 guard 已要求「行在+同 owner」→ FK 对现存流程破坏风险≈0。三事实是否成立——它们是全部分批裁决的地基。
3. **FK 形态（§3.1-3.2）**：父 `UNIQUE(id, owner_user_id)`（PK 上物理冗余但复合 FK 必需）；子列序 `(interview_id, owner_user_id)`↔`(id, owner_user_id)`；NOT DEFERRABLE 严于 resume 模板 0049 DEFERRABLE（D3）——从 schema 治理角度裁定。
4. **D4 措辞修正**：PG16 无 `ADD CONSTRAINT … FOREIGN KEY … CONCURRENTLY`，在线等价=NOT VALID（短 ACCESS EXCLUSIVE 不扫存量）+VALIDATE（子表 SHARE UPDATE EXCLUSIVE）；形态 1 双迁移（rev2 顺延号 0147 concurrent-index 父索引·0055 先例 + 0148 USING INDEX 收编+FK+VALIDATE 同事务——协调方 0144 序裁定：DBTF-1 占 0144 · DBHY-1 0145+0146 · 本刀 0147+0148 · DBM3-1 0149）vs 形态 2 单事务——请裁。
5. **分批面（§2）**：Batch 1 三表（ai_report/assessment_report/question_feedback）入列三判据；Batch 1b（learning_plan/career_path+新发现孪生 learning_progress）复核后同刀（D2）；排除面（interview_job/interview_question=redact-not-delete 相悖 · consumption_record=B 侧审计 · answer 族=后续批 · user_memory.source_id=弱引用）是否同意。
6. **D1 interview_event 两案**：案 A（判别列+回填+五域 writer 契约·独立后刀）vs 案 B（保持无 FK+登记理由：多态无类型父·0062 scope fence+0096 purge 残留=0 已承重·隐私擦除语义优先）——mw-core 建议 B，请裁。
7. **orphan-check-first（§3.4）与 Ban 静默回填**：ADD 前逐表 LEFT JOIN（期望 0·>0 停+登记另裁）——对照 0049「never guessed」先例是否足够 fail-closed。
8. **与擦除链关系（§4）**：本刀零碰擦除迁移 + FK 驱动收缩=未来刀 + CASCADE inert 不反转 fence 锚——边界是否干净。
9. **prove 契约（§5）**：P1 孤儿+合成孤儿 VALIDATE 拒 · P2 catalog 六点（convalidated/confdeltype='c'/列序）· P3 双负门（不存在 id/错 owner→23503）· P4 正路径 · P5 0096 purge 在 FK 在场复刻+根行仍在 · P6 静态门+历史迁移零 diff · P7 回归复跑（growth/uc019/remaining-sinks + rev2 补 `recruiter:prove`——cleanup :210 全库唯一 `DELETE FROM interview` 根行删点·CASCADE 级联面）——断言集是否足以证明「FK 生效+擦除共存+零回归」。
10. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · pins 全保留 · Ban retry-to-green。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D6 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-model-op · 2026-10-08 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
