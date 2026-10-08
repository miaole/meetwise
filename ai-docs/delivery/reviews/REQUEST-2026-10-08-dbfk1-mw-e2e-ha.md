# REQUEST — **DBFK-1 interview 复合 FK 渐进补齐**（GAP-DEBT-DB-NOFK · W2 二刀）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-e2e-ha`
**Knife**: `harness/db-intfk.md` · slice `db-intfk.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-interview-fk` · docs-only REQUEST）
**Date**: 2026-10-08
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

## 请审什么（mw-e2e-ha · 运行时/回归/擦除链共存面 · Ban 假绿）

Line DBFK · TASK-SOP Wave 2 第 5 行（GAP-DEBT-DB-NOFK P0 债行）。请审 REQUEST（harness §1–§9），重点关注运行时共存与回归面：

1. **现存写路径破坏风险评估（§1.5c）**：ai_report（report.ts:15）/assessment_report（interview.service.ts:796）/question_feedback（:567）/learning_plan（:822）/career_path（:904）全部经 0059 BEFORE INSERT guard（其内部要求 interview 行在+同 owner）→ FK NOT VALID+VALIDATE 后新写入被 FK 再拦一层——是否还有你认知中**绕过 guard** 的写入路径（运维直连/脚本/新 DEFINER 函数）会因 FK 23503 而断？
2. **擦除链共存（§4 + P5）**：0096 report sink purge 走子行直接 DELETE（FK 不拦子侧）+ advisory 锁序不变 + interview 根行保留（fence 锚 §1.5a）——FK 在场是否引入 purge 时序/锁的新交互；P5 复刻链（begin→claim→purge→残留=0→根行仍在）断言是否覆盖你的担忧面。
3. **D5 裁决**：CASCADE vs NO ACTION——父行永不删的现状下等价 inert；CASCADE 为未来 FK 驱动擦除铺轨但语义上「行随父删」；从回归/审计视角是否有反对（例如误删父行会静默级联清证据 vs NO ACTION 先拦人）。
4. **回归 prove 选择（P7）**：三表回归复跑=growth（assessment_report）+ uc019-report-regenerate（ai_report）+ int-transcript-remaining-sinks（question_feedback+purge 闭包）——是否够面；是否需要追加（如 uc011-report-refund）。
5. **D1 interview_event（§2.3）**：案 B 保持无 FK+登记——SSE 回放/diagnosis/quiz 流（0062 scope）在 FK 缺位下由 0059/0062 guard+0096 purge 承重，隐私擦除语义优先——从 e2e/HA 视角是否同意。
6. **锁窗口（§3.2-3.3）**：NOT VALID ADD（短 ACCESS EXCLUSIVE 不扫存量）+VALIDATE（子表 SHARE UPDATE EXCLUSIVE）+0144 concurrent-index 父索引（0055 先例·事务外+独立记账）——部署窗口/长事务/replication 面是否有你认知的风险。
7. **D2 Batch 1b 同刀**：learning_plan/career_path/learning_progress 与 Batch 1 同迁移落 6 FK——回归面是否要求 6 表全负门/正路径断言（P3/P4 现按三表设计，1b 入列则扩六表——EXEC 收据按实际扩）。
8. **prove 接线与纪律（§5 尾）**：四点接线（root pkg/db pkg/run-e2e-isolated.mjs/test）+ attempts 全账 + Ban retry-to-green——对照 dbid1 先例是否齐。
9. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · pins 全保留（NOT_HA/releaseEvidence=false 等无一翻转）· 不覆盖任何 e2e 门（coveredCount=8 不变）。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D6 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-e2e-ha · 2026-10-08 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
