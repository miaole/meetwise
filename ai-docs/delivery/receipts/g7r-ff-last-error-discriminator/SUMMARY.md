# SUMMARY — F-F interview_job last_error 甄别 run（executed · 甄别 run ×1 · 根因类锁定 + 判读表未预列门登记）

**Lifecycle**: `executed:awaiting_post_prove_dual`（post-prove 双审 mw-e2e-ha + mw-model-op 由协调方另派 · alone ≠ dual · 禁 push）
**授权**: 协调方 EXEC（RE-PRE BOTH PASS `7ed35f0d` 链后 · binding 条件 7 条随卷自评 §4）
**Base/实跑**: 实跑 code SHA `7ed35f0d05f7d31fcfca24e873664311160d157c`（origin tip · worktree `line/ff-last-error` · rebase 后零产品码 diff）

## 1. attempt 表（甄别 run ×1 · 无备选触发 · 机制 B 未启用）

| # | CMD | EXIT | 时长 | 甄别判据 | 结果 |
|---|-----|------|------|----------|------|
| 1 | `pnpm e2e:ui:isolated`（F-A-1 env · sidecar §1.2-A 随跑） | **1**（预期红 · 如实） | 166s | **达成**：525 轮全 ok · 最后全 ok 快照 @17:48:50.659Z（容器拆除前） | `last_error` 一步定谳读数到手 |

红面明细（4 failed）：`recruiting-bound.spec.ts:56` ×2（34.7s/34.5s）+ `uc018-abandon.spec.ts:68` ×2（1.8s/1.8s）· 10 passed · 10 skipped · `E2E_FAILURE class=frontend code=client_exited`——与 G7R CMD2 逐面同形，复现面成立。备选 iso attempt **未触发**（首选已捕获 failed 行；8 轮早期仪器错误按 C-HA-FF-3 不算空读、不触发备选）。机制 B 未启用（窗口未错失）。

## 2. 四查询读数（最后全 ok 快照 · 逐查询 ok · 原文见 per-run 收据 §6）

1. `interview_job`：**failed start ×2**，`last_error='adaptive_role_route_missing'`（同值 ×2 · attempts=1 · created_at 17:47:44.030Z/17:48:49.644Z = chromium/mobile 两 project 先后）
2. `ai_model_invocation`：**仅** `job.route-classify.v1` `succeeded` ×2（`error_code` 全 NULL）——零 interview chat op 行 · 零 `provider_rejected`/`deterministic_refusal`/`unknown`
3. `ai_invocation_trace`：**count=2**（恰两次 classify 成功完成）
4. `interview`：**failed ×2**（begin 后秒级 fail-closed 实证）

## 3. 根因定谳段（按 C-MO-2 措辞纪律）

- **判读归类：读数与 H0-alt-5（结构性 pre-model throw）一致；具体门 = role-resolve fail-closed 门**——`last_error='adaptive_role_route_missing'` 系判读表 §1.4 **未预列值域**（六域无一命中），码面定位 `apps/worker/src/adaptive-role-resolve.ts:57-62`（`MEETWISE_TECH_ROLE_FAIL_CLOSED` 默认 ON · route snapshot `allocations[0].leafTrackId` 与 job route metadata 双缺 → fail-closed throw · `interview-consumer.ts:345-355` 调用点在 `startAdaptiveInterview` **之前**）→ catch-all `:370-381` → `markJobFailed`（`interview-jobs.ts:214-217`）。本收据登记为 **H0-alt-5·d 新子面**（备判读表增补）。**「与 H0-alt-5 一致」≠「H0-alt-5 已证」**——单一 run 单一面，但三面互证无矛盾：start job 死于一切 interview chat op 之前（Q2 零 chat op 行）、provider 面零涉案（Q2 无拒绝行 + Q3 计数恰为 classify）、协调方 Key 直探（200）外部一致。
- **C-MO-P1 负检查**：536 行快照全量扫描 embedding-build/embedding-query/rerank 签名**全 absent** → **H0-alt-2 驳回维持**（证伪分支未触发）。
- **红①张力如实登记（非定谳 · 回协调方）**：recruiting-bound ×2 仍红而 Q2 现 classify succeeded ×2——归因需 `job_route` 表数据，超出 §1.3 四查询授权清单**未扩查**；红①面 = start job 未入队面（C-MO-P2），留 route 侧另刀。
- **修复路由（§3.8 EXIT 后路由）**：命中门=role-resolve fail-closed 结构门 → **产品刀**（route snapshot/metadata 供给面或门语义），另 REQUEST + 双审 + 协调方授权；本刀零修复零改产品。

## 4. 协调方 binding 条件逐条自评

| # | 条件 | 自评 |
|---|------|------|
| 1 | 首选 ui 面 ×1 · sidecar §1.2-A/§1.3 · `docker rm -f` 前最后快照即证据 · wrapper 零 diff（blob `13dbfc43` 不变）· withhold 零触碰 | **守约**——run ×1；sidecar SELECT-only 白名单（Ban payload/trace.output）；最后全 ok 快照 17:48:50.659Z 在拆除前；`run-e2e-isolated.mjs` 零 diff（**blob hash-object post-run 复算 = `13dbfc43` 全等**） |
| 2 | C-HA-FFR-1 逐查询 ok/error 落快照（仪器错误不触发备选、不记空读） | **守约**——536 行快照逐查询带 status；8 轮 migrate 前 `relation does not exist` 如实记 error、未触发备选、未计入判读 |
| 3 | C-HA-FFR-2 embedding/rerank 签名显式负检查 | **守约**——全 absent，无证伪；H0-alt-2 驳回维持 |
| 4 | 判读表逐值域映射 · 红①排除如实 | **守约**——`adaptive_role_route_missing` 未预列 → 按 §5.2 未覆盖值域处置 + 码面归类 H0-alt-5·d 登记（非基建 catch-all 扫入 · 非 embedding 证伪分支域）；红①「start job 未入队」排除 + classify 张力如实登记回协调方 |
| 5 | 单次 attempt 窗口 · EXIT 如实 | **守约**——恰 1 attempt；EXIT=1 原值（预期红）；备选未触发；无 retry-to-green |
| 6 | Pins 原值 · live ≤200 口径报备 | **守约**——Pins 零翻转（见 §5）；live=2/200；`actualSpendCny=null` |
| 7 | 零产品码/SSOT 零触碰/禁碰 `:68`/:70/:71 | **守约**——本 EXEC 产物仅收据 md（`receipts/g7r-ff-last-error-discriminator/`）；sidecar 落 `.tmp/` 不入 git；registry 清面/SSOT/backlog 零触碰 |

## 5. Pins / Retained（原值 · 零翻转）

haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · **PG-retained** · 公开 DELETE **503** · **`g7SuiteGreen=false`** · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · **trio OPEN**（红 EXIT 1 · 真实业务红 · 甄别 run 不冲销不翻绿）· GAP-G7K-API-REDS **P1 OPEN**（`0c6c3287` · 本刀不翻 backlog 状态）· **`actualSpendCny=null`**

evidenceOfRecord/SSOT 登记**留 nail 阶段**。G7R 收据（`receipts/gap-g7k-api-reds-fix/`）零改写零覆盖。

## 6. Non-claims

Not a pass · not fixed · not root-cause-proven（「与 H0-alt-5 一致」≠「已证」）· not suite green · not trio green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not SSOT flip · not 修复授权（修复=产品刀另 REQUEST）· not H0-alt-2 reopening（负检查全 absent）· `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual · 本收据 ≠ post-prove dual（协调方另派）

---

*SUMMARY · F-F last_error 甄别 run · 2026-10-07 · executed:awaiting_post_prove_dual · CMD1 e2e:ui:isolated ×1 EXIT=1 如实 · 甄别成功=快照捕获 · last_error=adaptive_role_route_missing ×2 → H0-alt-5 族 · role-resolve fail-closed 门（H0-alt-5·d 判读表未预列登记）· classify succeeded ×2/trace=2/零 chat op 三面互证 · C-MO-P1 全 absent · 红①张力如实回协调方 · live=2/200 · Pins 原值 · alone ≠ dual · 禁 push · STOP*
