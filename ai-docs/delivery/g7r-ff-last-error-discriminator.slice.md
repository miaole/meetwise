# Slice — F-F · **interview_job last_error 甄别刀**（Line F-F · docs REQUEST · `draft:awaiting_pre_dual`）

**配套**: harness `harness/g7r-ff-last-error-discriminator.md`（SSOT 细节/判读表全文以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-g7r-ff-last-error-discriminator-mw-e2e-ha.md` + `reviews/REQUEST-2026-10-07-g7r-ff-last-error-discriminator-mw-model-op.md`
**上游**: G7R post-dual BOTH PASS `bfd868e0`（origin `REQUEST-2026-10-07-gap-g7k-api-reds-fix-mw-model-op.md` POST 段 §3.4 残余候选排序 + §3.4-C F-F 诊断 attempt 交付）· G7R EXEC 实跑 code SHA `3767f783`（trio EXIT 1/1/1 真实业务红 retained）
**Base**: `origin/feat/mysql-schema-skeleton` `bfd868e0`（full `bfd868e028821531db0dcb905066730d56f64685` · **如实登记：本 turn fetch 两次网络失败，以本机 origin ref 为基线，恰满足预期 ≥`bfd868e0`；EXEC 期重 fetch 重钉**）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-ff` · branch `line/ff-last-error`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban SSOT/backlog 状态翻转 · Ban 碰 sibling 归档 · Ban 改 withhold 机制 · Ban 为绿改产品（甄别=只读诊断，修复另刀）· Ban 碰 `:68`/`:70`/`:71` 已清面 · Ban 洗断言 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点五条）

1. **甄别器（一步定谳）**：`job_failed` 是 throw 路径签名（SSE `interview_unavailable{kind:start,reason:job_failed}` ↔ `interview-consumer.ts:93`/`:162`），provider chat 失败本码基优雅降级不抛 → 残余候选唯一 **H0-alt-5（结构性 pre-model throw）**；真实错误已持久化——`markJobFailed` 把 `error.message.slice(0,500)` 写 `interview_job.last_error`（`packages/db/src/interview-jobs.ts:214-217` 亲读）。**H0-alt-1 已出局（协调方 Key 直探输入事实：F-A-1 配对 200 成功 + 错配 401 复现）**；H0-alt-2 已驳回（code-face，G7R post-dual §3.1）。
2. **甄别实验设计**：仪器化重跑失败路径 ×1——**首选 uc018-abandon UI 面**（`pnpm e2e:ui:isolated`，红② throw 确定性面；红① bind 面 last_error 无对象不入候选）；备选 iso HTTP 面（仅首选未捕获 failed 行时 +1 attempt）。**DB 读取窗口（首选机制 A）= run 内 sidecar 只读直读隔离 PG**：wrapper 于 spawn 前打印动态端口行（`run-e2e-isolated.mjs:2310`），sidecar 监测命中后连 `127.0.0.1:<PGPORT>`（凭据=runner 自身 HOST_SQL_PROBE 同面）300ms 轮询，快照追加 `.tmp/`，**容器拆除（`:2367` `docker rm -f`）前最后一份成功快照即证据**；wrapper 零 diff、withhold 零触碰（读 DB 不读子进程 stderr，G7R post-dual 已确认合法）；SELECT 列白名单（Ban payload/trace.output）。机制 B keep-container 变体仅协调方显式批准兜底（provenance 弱点如实登记）。
3. **读取清单 + 判读表**：四查询全 SELECT-only——`interview_job` kind/status/attempts/last_error + `ai_model_invocation` (service,status,error) 分布 + `ai_invocation_trace` count（success-only，0=零成功完成）+ interview 终态分布（旁证）。判读表逐值域映射：`interview_resume_reference_missing_or_mismatched`/`_missing` → **结构门**（`interview-consumer.ts:200-206`/`:313-314`）；`model_invocation_admission_state`/`_dispatch_state`/`model_cost_unknown_state`/`model_execution_aborted` → **invoke 内部态**（`invoke.ts:494/:562/:601/:524/:662/:683`）；checkpoint/SQL/连接类原文 → **基建 throw**；`legacy_interview_graph_disabled` → 配置面；`reaped:worker_died` → 非 throw 路径（reaper 收割，与秒抛矛盾如实记）；NULL/无 failed 行 → 转读 (2) 分布判读（`provider_rejected` 行=红面在 provider/准入，**401/404 扁平化不可分注记随行**）；`graph_fence_lost` 不可能出现于 last_error（走 requeue）。三面读数联合判读，单一读数不定谳。
4. **prove 方案（CMD+EXIT 契约）**：pre-dual BOTH PASS → 协调方 EXEC 授权（run 面/机制 B/committed SHA 重钉）→ 甄别 run ×1 七字段全记录（CMD 原文/EXIT 原值/起止戳/实跑 SHA/worktree/环境探针含 sidecar 采样统计/读数快照 name-only 摘要+判读归类）。**甄别目的是取 last_error 非翻绿——EXIT 如实，预期 EXIT=1，红 EXIT ≠ 甄别失败；甄别成功判据=快照捕获读数（捕获 ≠ e2e pass ≠ trio 翻绿）**。attempts 全记录（Ban 删改；备选 run 触发条件唯一且如实登记）。预算沿 G7R ≤200 内报备（结构估：pre-model throw 成立则大概率零 live；反证则与 G7R CMD 同量级）；`actualSpendCny=null`。收据落 `receipts/g7r-ff-last-error-discriminator/`（含根因定谳段，按 C-MO-2 措辞纪律）。
5. **边界**：读 DB 不破 stderr withhold（`run-e2e-isolated.mjs` 全文件零 diff，Ban 改 wrapper 输出机制）；**Ban 为绿改产品**——无论读数命中何门，修复一律另刀（沿 C-MO-11 产品刀边界，独立 REQUEST+双审+EXEC）；Ban 碰 registry `:68`/`:70`/`:71` 已清面（start-job chat ops `wired:true` 已裁决域零触碰）；Ban SSOT/backlog 翻转；Ban 洗绿/retry-to-green/flake 记法；Ban Key 物料（本刀读数零模型 Key 依赖）。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not root-cause-proven（H0-alt-5 最强候选非定谳）· not suite green · not trio green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · DB 读数 ≠ 产品修复 · 判读表 ≠ 根因断言 · `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

## Pins（原值 + retained）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false`（retained · 至三绿+post-dual+协调方 nail）· `r1Closed=false`（retained）· `techRoleFailClosedOptOutG7Only=true`（retained · Disclosure-1 OPEN）· trio OPEN（1/1/1 真实业务红）· GAP-G7K-API-REDS P1 OPEN · `actualSpendCny=null` · STOP

---
*Slice · F-F last_error 甄别刀 · 2026-10-07 · draft:awaiting_pre_dual · docs-only · 甄别器=interview_job.last_error 一步定谳 · 重跑面首选 uc018-abandon UI/备选 iso · 读取窗口=run 内 sidecar 直读（容器拆除前）· 判读表逐值域映射 · H0-alt-1 出局/H0-alt-2 驳回 · EXIT 如实 · 预算 ≤200 内报备 · Ban 改 withhold/为绿改产品/碰 :68-71 清面 · STOP*
