# NEGCOMM-1 EXEC 收据 — neg-commerce consume 族夹具修复刀（mw-core）

**蓝图**：REQUEST rev2 @ `9a698e6c` 唯一蓝本（harness `ai-docs/delivery/harness/negcomm-fixture.md` rev2 处方）。
**席位/树**：mw-core · worktree `/Users/miaole/Desktop/golucky/meetwise-line-negc` · 分支 `line/negcomm-fixture` · base = `9a698e6c`（工作树开工时 clean）。
**刀口**：仅 `apps/api/test/neg-commerce.proof.ts` 夹具段 · **零产品码**（git status 全程唯一 tracked 变更 = 该 proof 文件，见 `diff-neg-commerce-proof.patch`）。

## 1. 五件套落刀实录（逐字镜像 neg-interview.proof.ts:26-227 先例 · SCOR ⑥ 段按五件套清单省略）

| # | 件 | 事实根 |
|---|----|--------|
| ① | 0058 fence 函数 stub（`interview_privacy_active` + `assert_interview_privacy_active` + GRANT TO app_role） | `guardInterviewPrivacy`（interview.service.ts）与 `enqueueInterviewJob`（interview-jobs.ts）均调 `assert_interview_privacy_active`；无 stub 即 500 面 |
| ② | `interview.resume_privacy_epoch` 列 ALTER IF NOT EXISTS | begin 绑定 UPDATE 读 `r.privacy_epoch` 写本列；FOR UPDATE SELECT 亦读本列（42703 面） |
| ③ | `interview_job` ADD `resume_privacy_epoch` + DEFAULT 64 + CHECK 放行 49/50/64 | `INTERVIEW_RESUME_REFERENCE_VERSION=64`（packages/db/src/interview-jobs.ts:13）；sql/05 严格体仍钉 `CHECK (reference_schema_version=50)` |
| ④ | `interview.application_attempt` 列 + ck_interview_application_binding_complete 重写 + 0049:51-87 放宽体绑定 trigger 对齐 | sql/22 旧体全禁 resume_id UPDATE + 三列同扎 CHECK → begin 真实 bind（NULL→owned/ingested resume·created 态恰一次）被误拦 |
| ⑤ | 0142 两表 additive 建表（decision + snapshot + GRANT + RLS FORCE + owner policy） | `supplyCandidateProfileRoute` 首查 snapshot 表（缺失即 42P01/409 candidate_route_undecided 面） |

## 2. 种子（防 500/409/假绿三面）

- **resume ×4**（:222 形态·`ingested`·content_sha 64hex·`privacy_epoch=1`·source_kind 'text'·**无需 resume_blob**——snapshot 预种使供给面走幂等复用、不触 decryptResumeBlob）：R_UBC2→userB · R_EXP→negExp · R_OS→negOsell · R_DBL→negDbl（UUID v4 常量，33333333-3333-4333-8333-…31/32/33/34）。
- **五面试 decision→snapshot 预种**（:229-231 形态·FK 先 decision 后 snapshot·owner=对应 principal·事务内 `SET app.principal_user` 对齐 0142 RLS 面）：IV_UBC2/userB · IV_EXP/negExp · IV_OS1+IV_OS2/negOsell · IV_DBL/negDbl。IV_UBC2 的 interview 行在 §5 用例内内联插入（原样保留）；decision/snapshot 对 interview 无 FK，先种无碍。

## 3. consume 族 'r1'→UUID（七用例期望零改动红线 · 达成）

- 8 处 `'r1'` 字面量 → principal 对齐 UUID 常量（缺 resume-id 用例本就无头，零触）；**每条 A() 期望值/错误码零 diff**——attempt1 日志为证：`402×2 / missing_resume_id / 404 / 401 / 超卖×3 / 双击×3` 全部按原文 PASS（见 `run-attempt1.log`）。
- **席1 处方逐条兑现**：402×2=reserveEntitlement 滤过（无桶/过期桶）· 404=RLS FOR UPDATE 0 行 · 超卖=桶行锁恰一 402 且 reserved≤1.0 · 双击=advisory 锁串行+v64 start job 幂等短路（reserved==1.0·consumption 恰 1 行）。

## 4. 新门负断言（'r1' 字面量恰转作其夹具）

`consume/非 UUID resume-id(旧 r1 形态)→ 400 invalid_resume_id`：断言式 `r.status === 400 && r.body?.error === 'invalid_resume_id'`，沿 `resume-reference-http.proof.ts:53` 先例；门位 `interview.service.ts:169`（`if (!UUID_RE.test(resumeId))`，本次 Read 亲证恰在该行）。**PASS 在卷**。文档计数同步 79→80（文件尾 tally + §5 行补"非UUID门"）。

## 5. 如实登记三面

1. **计数漂移面**：文件尾自记 79 在本刀前已与静态位点漂移（开工前静态 `A(` 位点 83；runtime 全执行即 84）。REQUEST 钉死的 79→80 已照抄落在文档 tally；runtime 终态打印 **84 条全绿**（=83+1，其中 1 条为条件式 `if (r.body?.orderId) A(...)` 与 3 处同键多断言型位点）。此为陈年文档漂移，非本刀引入，如实入账。
2. **:390 无鉴权 401 用例核实**：今日即绿、死于 guard 层（PrincipalGuard 先于控制器与 UUID 门拒 401 unauthenticated）——**零改**（仅 resume-id 头值随 ③ 对齐为 UUID 常量，断言/期望原文未动），attempt1 `PASS consume/未鉴权 begin → 401` 在卷。
3. **环境准备**：worktree 无 node_modules → `pnpm install --frozen-lockfile`（3.9s·零 tracked 变更）。

## 6. 恰 1 run 账目（禁重跑至绿 · 达成）

| attempt | 命令 | EXIT | 终态 |
|---------|------|------|------|
| 1（唯一） | `pnpm neg:commerce`（root → `scripts/run-e2e-isolated.mjs neg:commerce`） | **0** | `✓ neg:commerce: 84 条负路径用例全绿` · FAIL=0 |

- 隔离容器 `meetwise-e2e-25866-1791491508219`（127.0.0.1:52762）· 零重跑 · 零重排。
- 静态预检三门：esbuild transform EXIT=0 + `node --check` EXIT=0 + `pnpm e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）。
- skip/marked-red 账：runner 打印 `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy` 横幅 ×1（隔离基建叙述，非栈真相）；本 proof 无 skip 用例。

## 7. Pins 十值（照抄）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（adr-postgres-retained.md）· 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 8. Non-claims 与 STOP

本刀 ≠ CMD3 收官（步 11-27 含 6 LEGACY/R5 步解锁后另评估）≠ 7A 面 ≠ trio。alone≠dual：**单席绿不自批**，`exec:awaiting_post_prove_dual` —— mw-core STOP，待双席 post-prove。
