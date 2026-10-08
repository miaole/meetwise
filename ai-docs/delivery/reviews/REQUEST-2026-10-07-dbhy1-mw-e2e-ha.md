# REQUEST — **DBHY-1 GAP-DEBT-DB-HYGIENE 卫生刀**（死表/sql/ 退役/分区生命周期/jsonb 路线图）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-e2e-ha`
**Knife**: `harness/dbhy1-db-hygiene.md` · slice `dbhy1-db-hygiene.slice.md`
**Parent tip**: `48dee7a2`（branch `line/db-hygiene` · docs-only REQUEST）
**Date**: 2026-10-07
**Line**: **DBHY**（债行 `gap-bug-backlog.md:878` 首刀 · W1/W1b 预告的 separate retire knife）

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

## 请审什么（mw-e2e-ha · 测试/证明/fresh deploy 证据面 · Ban 假绿）

Line DBHY · 债行在卷。请审 REQUEST（harness §1–§10）：

1. **消费方清单完备性**（§1.2/§3.2）：15 处 sql/ 真加载器（drift 门+validate+ai-runtime×6+api×3+worker×3+vectorstore）与 4 处仅注释文件的分类是否与你对 `48dee7a2` 的认知一致；有无漏网 loader（含 .mjs/CI/compose 面）。
2. **退役后 prove 全绿的真实含义**（§5 P3）：15 处各自原有断言面在迁移前缀下重跑入账——哪些 proof 的断言语义会因换 schema 来源而变（如 01_schema 缺 ai_cost 族表·vectorstore 以目录为工作对象）；attempts 全账口径是否足够防「换源洗绿」。
3. **fresh deploy 重建验证**（§5 P4）：空库→`loadMigrations`→`runMigrations` 真 runner 实测 + `resume_quiz.expires_at` 存在（0007+0135 链·对 sql/20 退役的替代证明）+ 0019 四项回归（admin_audit/question_feedback/learning_progress/user_account.is_admin·对当年炸史的封口断言）——断言集是否足以证明「单真相不缺件」；与 drift:prove 退役后的覆盖差（drift 门曾管列+UNIQUE/PK 全集）是否有缺口（如约束面抽查要不要补）。
4. **死表测试改造的证据语义**（§2.2）：privacy-erasure-http/online-judge-control-plane 的 count 断言改查 `entitlement_consumption` 后，断言原意（逃逸=0/业务隔离）是否保真；runtime-kernel 幂等冒烟换表是否等价；primitives.sql 自建副本豁免是否可接受。
5. **qbank P5 负门**（§5 P5）：释放 retired 代后 active 代 ann_search 结果不变 + 四组负门（active/building/幂等/权限）——是否足以证明 G-R4-5 闭面（`coveredCount=8`·`gR45Closed=true`）零波及；uc-e2e-025-bound 改迁移前缀后其 20_resume_quiz 依赖面（expires_at 语义·0135 注释的 e2e-ha C-1 由来）是否保真。
6. **0135/bb97e837 双写史的封口**：sql/20 删除后「两类库都拿到锚点列」的保证转由 P4 承载——是否认可此迁移面交接。
7. **EXEC 面=纯测试/脚手架/迁移/文档**（§9 A5）：apps/packages 的 src 目录 diff=0（除规范文档）——确认无生产运行时改动被夹带。
8. **边界**：Dual PASS ≠ 开工 · EXEC 须 meetwise 明示授权 · 本 turn docs-only · pins 全保留 · Ban retry-to-green · Ban self-approve。

## 裁定栏（expert 填）

- Verdict: `pass / fail`（pass 亦 ≠ authorize coding）
- 决策点 D1–D5 逐项意见:
- 缺陷（如有）:

---

*REQUEST stub · mw-e2e-ha · 2026-10-07 · PENDING · Ban self-approve · Dual PASS ≠ 开工*
