# Slice — **P0-CB-01 · GAP-PROD-02 首面：申请↔面试不可替代绑定（REQUEST · docs-only 立卷 · 本卷零执行）**

> **Draft-era status**: **`draft:awaiting_pre_exec_dual`**（empty review stubs · Ban self-approve · alone ≠ dual · 零 coding · 零 prove 执行 · 零 live · 零 SSOT · 预执行双审 PASS 后由 meetwise 授权 coding+prove · coding+prove 再受「SCOR then P0-CB」启动门约束）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · **PG-retained** · **公开 DELETE=503** · g7SuiteGreen=false · actualSpendCny=null · backlog GAP-PROD-02 `:78` **OPEN**（翻转归协调方 nail）
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Base**: `origin/feat/mysql-schema-skeleton` · **`fe218b7a`** / `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`
**Branch**: `line/p0cb01-application-binding`（worktree `meetwise-line-p0cb01`）
**Authority**: 本卷=REQUEST 立卷（docs-only）。coding+prove 须 PRE BOTH PASS + meetwise AUTHORIZE（且 S-SCOR 包启动门已过）方可启动。
**Wave**: Line P0-CB-01（backlog GAP-PROD-02 `:78` 首面 · 内序 01→02→03 写死 · 一刀一行）
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（SCOR §1b 继承 · 不降级不换默认）

## One-line

GAP-PROD-02 首面立卷：**「不可替代绑定」基底在 tip `fe218b7a` 实存**（mig `0028` blob `ef940e26` 双 partial UNIQUE+CHECK+FK+绑定不可变 trigger `:11-142` · `recruiter.ts:354-434` `startApplicationInterview` 行锁同事务+`interview_ineligible_route` fail-closed · `finalizeApplication:182-215` 五向反查+strict 空 DTO `contracts:339`+web 消费者 `InterviewPanel.tsx:103`/同源代理——erratum E-1…E-4 口径继承），**缺口重心=验收证据面**：immutable `CandidateEvaluationSnapshot` 产品码 **0 hit**（rc=1 亲测）· `consent_version` **0 hit**（rc=1 亲测）· 并发 20 绑定与换绑拒**已由底座 named 覆盖**（`recruiter-depth.proof.ts` §① `:60-71`+§② `:73-80` · `neg-bend.proof.ts:251-252/:269-271`），audit 验收表 `:112/:113/:114/:115` 四项作为验收面仍无 named prove 收据，真残差=①reserve 计数断言 ②HTTP 层跨岗位完成会话重放收据 ③快照幂等（依赖 G-1） ④浏览器刷新/双击/断网分支（`recruiting-bound.spec.ts` blob `2b232748` · `:142-255` 单链路无该三分支）。**GAP-PROD-02 `:78` stays OPEN**。

## 设计候选（全文对比见 harness §2）

| 方案 | 一句话 | 判定 |
|------|--------|------|
| **A（推荐）** | additive `candidate_evaluation_snapshot` INSERT-only 表（版本列+evidence_hash+幂等重放）复用 `0028` 基底；带 `owner_user_id`+ENABLE/FORCE RLS+owner policy+REVOKE FROM PUBLIC/app_role·GRANT 收窄（`0028:103/:117` 体系）；`consent_version` 列随绑定面 additive，consent 体系关系**四问**（`consent_record`@`13_privacy.sql:5-16` / `memory_consent`@`0093:102-121` / 第三套 · 版本指向 · 旧行缺省 · 迁移语义）列 C-EH-3 执行期终裁必答；snapshot=**擦除面新 sink 候选**（INSERT-only 与 subject-erase 互斥）→ 转协调方/GAP-PRIV-04 裁决，本刀不裁不碰 erasure 链 | 破坏面最小+不可变性结构化+验收表逐项可 named——**推荐交双审，非终裁** |
| B | 快照 embed `job_application` JSONB 列 | 热表行级 immutability 靠约定，弱一档 |
| C | 中间表重构绑定面 | 重写全部既有绑定链，直接抵触「Ban 动摇 `0028` 语义」 |

## Prove 拟案（本卷零执行 · 终名/落地随 exec 卷）

- NEG（全拒）：N1 跨申请重放（strict DTO+反查 → 4xx/409 · score NULL）· N2 换绑（trigger exception）· N3 无申请上下文（`interview_ineligible_route`/`cannot_finalize` · interview 0 新增）· N4 快照不可变（A 落地后）· N5 异主/异租户 0 行。
- HP（全过）：H1 正常绑定流 scoreless 收口 · H2 并发 20 恰 1 interview/1 reserve/同一 interviewId（`:112` · 恰 1/同一 id 底座已断言，本刀补 reserve 计数）· H3 重放恰 1 快照/分数/确认（`:114` · snapshot 项依赖 G-1）· H4 浏览器全链路 1 条必过含刷新/双击/断网恢复+B 端最小化（`:115` · 既有 spec 只增分支）。
- 底座保持绿：`recruiter:prove`（`package.json:194`）/ `neg:bend`（`:98`）/ `openapi:prove`（`:275`）期望 EXIT 0。
- 纪律：attempts 全账（时间窗/SHA/EXIT）· 一次优先 · **Ban retry-to-green**（`:68` FLK 先例）· EXIT0 ≠ 闭合 ≠ `:78` 翻转 ≠ covered。

## Ban（浓缩 · 全表见 harness §4）

Ban 碰 settlement/early-stop（`adaptive-lifecycle.ts`/`commerce.ts`）· Ban 公开 DELETE=503/privacy 主链/`checkpoint-principal.ts` · Ban SSOT（`:78` 翻转归协调方 nail）· Ban 顺手做 CB-02/03 · Ban secrets（Key name-only）· Ban 动摇 `0028`/`0046`/`0082` 语义 · Ban B 端数值恢复 · Ban retry-to-green · Ban force-push · Ban self-approve · Ban 审降级。

## Products

| Role | Path |
|------|------|
| Harness | `harness/p0cb01-application-binding.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-07-p0cb01-mw-e2e-ha.md` |
| Dual `mw-privacy-int` | `reviews/REQUEST-2026-10-07-p0cb01-mw-privacy-int.md` |

本卷零执行：未改产品码/migrations/scripts/`package.json`、未跑 prove、未起容器、未连远程环境、未读 `.env*`、SSOT 零触碰。执行须 PRE BOTH PASS + meetwise AUTHORIZE + SCOR 启动门。

**Status: `draft:awaiting_pre_exec_dual` — awaiting mw-e2e-ha + mw-privacy-int（alone ≠ dual · 不代签）。**
