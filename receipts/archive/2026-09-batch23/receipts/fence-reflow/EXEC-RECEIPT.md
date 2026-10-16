# FENCE-REFLOW — EXEC 收据（续做收口席·quota 中断后接续）

```yaml
knife: FENCE-REFLOW（#241+#238+#253+#243+新-#274 围栏回流刀·审计批 1 P1）
seat: fence-reflow-exec（EXEC 续做收口·接续前席 quota 中断卷）
blueprint: REQUEST rev3 @7202f404（ai-docs/delivery/harness/fence-reflow-REQUEST.md·唯一蓝本）
base: line/fence-reflow @7202f404（工作树 /Users/miaole/Desktop/golucky/meetwise-line-fencereflow）
status: **executed:awaiting_post_prove_dual**（STOP·post-prove 双审归协调方派·Ban self-approve·alone≠dual）
est_live_model_calls: 0（全部 proof 隔离库跑·classifyJobRoute 走 rule-decide（modelClassify 注入抛错）·零外呼零消耗）
```

## 0. 前席中断续做说明（实物盘点→续完→门禁）

前席死于 quota，留下 16 改+4 新（+445/−27）实现卷、**门禁一次未跑**。本席接续动作：

1. **实物盘点（commit 前置·`git diff --stat` 逐条对照 §3 C1-C11）**：
   - 已完（前席落卷·本席核对通过）：C1 create 三过滤（interview.service.ts +注释登记漂移与新-#274）· C2 F2 `reused` 透传+F5 空壳回收（actions.ts `reclaimShellAndRedirect`/`beginErrorCode`/`restartInterviewAction`）· C3 F2 选择面（page.tsx ?reused 门控 banner·BINDING_CONFLICT 家族不新增第三文案）· C4 F3 定谳形 A 五钉+`fencedSkipped`+连续失败计数（commerce-reconcile.ts）· **C5 commerce.ts/index.ts 零改（亲证不在 diff）** · C6 410 行逐字文案 · C7 `InterviewPrivacyFencedError`+`iterateInterviewSseBody`（sseProxyFailureResponse 零改）· C8 驱动 fence 停转不重连+useInterviewStream :19 注释 · C9 view-model 围栏出口+interview-state `privacyFenced` · C10 ops/recovery/fence-reflow-repair.ts（dry-run 默认/--apply 幂等/B 端跳过计数/asPrincipal/导出 dryRun+apply）· C11 五 proof 文件在位。
   - 缺项（本席续完·见 §2 修正清单）：§4-3①②两断言未落 web-logic.proof；三处 proof fixture/断言缺陷（前席未跑门禁故未暴露）；C10 prove 的隔离跑法器 target 注册缺失。
2. **续做原则**：不推倒重写；锚点±3 内按语义定位；小矛盾按任务书修正并逐条注记；无大矛盾（未触发停止条件）。

## 1. 门禁 EXIT 表（§4 矩阵·全原值）

| # | 门禁 | attempts | 终值 EXIT | 备注 |
|---|---|---|---|---|
| 1 | `apps/web pnpm typecheck`（tsc --noEmit） | 2 | **0** | 两轮均 0（§4-3 断言补齐后复跑确认） |
| 2 | `apps/worker tsc --noEmit` | 1 | **2（预存红）** | 41 错·stash 基线逐字一致（41）·**零错触及本刀文件**（grep 证） |
| 3 | `apps/api tsc --noEmit` | 2 | **2（预存红）** | 30 错·stash 基线逐字一致（30）·零错触及本刀文件；fixture 重写后错数不变 |
| 4 | `pnpm web:prove`（F6+F2 section） | 3 | **0** | attempt1=前席断言面 EXIT 0；补 §4-3①②后 attempt2=1（本席断言对象引用比较笔误·同轮修）；attempt3=0 |
| 5 | `pnpm -C apps/web prove:interviews-actions`（F5 具名新 proof） | 1 | **0** | §4-6 ①②③④+401 例外臂+成功主链零改+F2 行为面全 PASS |
| 6 | `pnpm privacy-erasure:http:prove`（create 三过滤 section） | 2 | **0** | attempt1=1（前席 F1④ fixture 裸 INSERT 撞 resume.uuid 型+复合 FK·23 PASS 后 uncaught·fail_count=0）；真 start 链重写后 attempt2=0（pass 25 fail 0） |
| 7 | `pnpm commerce-reconcile:prove`（F3 ⑧ section） | 3 | **0** | attempt1=1（前席 fence fixture resource_hmac 非 64-hex 撞 0047 CHECK）；attempt2=1（前席 `r2.fencedSkipped>=2` 逐拍语义错位）；修正后 attempt3=0（⑧ 全 PASS+既有 ①-⑦ 零回归） |
| 8 | `pnpm fence-reflow-repair:prove`（C10 具名新 proof） | 4 | **0** | attempt1=1（`unsupported_e2e_target`——前席漏注册跑法器）；attempt2=1（proof 缺 `RAG_JOB_ROUTE_INPUT_HASH_KEY`）；attempt3=1（前席桶断言漏计 B 端预留）；修正后 attempt4=0（16 PASS） |
| 9 | `pnpm neg:interview` | 1 | **0** | 97 条负路径全绿（410 语义零回归面） |
| 10 | 冲突标记门（`grep '^<<<<<<< \|^=======$\|^>>>>>>> '` 全仓） | 终检 | **0 行** | ts/tsx/mjs/md/json/sql 全扫 |
| 11 | 邻接既有断言零删改 | — | **核过** | privacy-erasure-http/web-logic/commerce-reconcile 均**纯新增 section**（git diff 逐行核：既有断言行零删改）；unstube-erase.proof 零触（不在 diff） |

**Ban retry-to-green 核注（§5-5·attempts 全账）**：无同码重跑碰运气。attempt 序列每次重跑前均有实质修正：前席缺陷 4 处（F1④ fixture / resource_hmac / fencedSkipped 逐拍语义 / C10 桶断言）+ 本席笔误 1 处（web-logic 断言 `===` 对象引用）+ 基础设施缺位 2 处（跑法器 target 注册 / proof HMAC env）。全数如实入账。

## 2. 本席修正清单（前席卷上的缺与错·逐条注记）

1. **§4-3①② 断言补齐**（apps/web/test/web-logic.proof.ts F6 section 头部 +2 断言）：`actionErrorMessage('interviews',410,'interview_privacy_fenced')` 文案逐字=「该面试已进入数据删除流程，请新建面试」；映射命中≠begin_failed 兜底（`.text` 异于 begin_failed 行且 begin_failed 行自身口径不变）。
2. **F1④ fixture 重写**（apps/api/test/privacy-erasure-http.proof.ts）：裸 INSERT（`b-resume-${pid}` 非 uuid 撞 `resume.id uuid`；interview.owner≠job_posting.owner 撞复合 FK fk_interview_job_binding；0051 状态机触发器管辖区）→ 改真 start 链 `createJob→classifyJobRoute(rule-decide)→inviteCandidate→startApplicationInterview`（同 commerce-reconcile.proof ⑦ 先例·admin 池+asPrincipal）+ `randomUUID()` resume + entitlement_bucket 种子 + test-only HMAC key。隔离口径不变（落 otherBody·其唯一非终态行=B 端绑定行）。
3. **resource_hmac 64-hex**（commerce-reconcile.proof.ts `fenceInterview` + fence-reflow-repair.proof.ts 同款）：0047 `privacy_deletion_target_resource_hmac_chk` 钉 `^[a-f0-9]{64}$` → fixture 改 `createHash('sha256')...digest('hex')`。
4. **fencedSkipped 逐拍语义修正**（commerce-reconcile.proof.ts）：`fencedSkipped` 是**逐拍**计数（ReconcileOutcome 每拍新算）——前席 `r2.fencedSkipped>=2` 错按跨拍累计写；改 `r2>=1 && r+r2>=2`（本拍≥1·两拍合计≥2）并注记。
5. **C10 桶断言修正**（fence-reflow-repair.proof.ts）：fixture 桶上同时挂 C 端 1.0+B 端 1.0 两笔预留——前席 dry-run 断言 `=1.0`、apply 断言 `=0` 漏计 B 端笔；改 dry-run `=2.0`·apply `=1.0`（余下 1.0=B 端预留原样=「B 端同跳零写」正面证据），`bucketReserved()` 改 SUM 口径并注记。
6. **C10 跑法器注册**（scripts/run-e2e-isolated.mjs +2 行·各带注记）：`'fence-reflow-repair:prove:raw'` 入 allowlist 与 migrateWithRecovery 名单（§4-4 具名门禁必须可跑·隔离库口径同 commerce-reconcile）。根 package.json 的 `fence-reflow-repair:prove`/`:prove:raw` 两 script 前席已落（核过）。
7. **C10 proof HMAC env**（fence-reflow-repair.proof.ts +1 行）：`RAG_JOB_ROUTE_INPUT_HASH_KEY ??=` test-only 值（同 commerce-reconcile.proof 先例·B 端真 start 链 rule-classify 前置）。

## 3. diff numstat（终态·基线 7202f404 → 本卷）

```
  7  1  apps/api/src/modules/interview/interview.service.ts        （C1）
 79  2  apps/api/test/privacy-erasure-http.proof.ts                （C11 P1·含 F1④ 重写）
 46  8  apps/web/app/interviews/actions.ts                         （C2·F2+F5）
 42  3  apps/web/app/interviews/page.tsx                           （C3·F2 选择面）
  6  0  apps/web/lib/errors/action-error.ts                        （C6·410 行）
  2  2  apps/web/lib/hooks/useInterviewStream.ts                   （C8）
  3  0  apps/web/lib/stream/interview-state.ts                     （C9）
  9  2  apps/web/lib/stream/interview-stream.ts                    （C8）
 39  0  apps/web/lib/stream/sse-cursor.ts                          （C7）
  9  0  apps/web/lib/view-model.ts                                 （C9）
  1  0  apps/web/package.json                                      （prove:interviews-actions script）
 95  0  apps/web/test/web-logic.proof.ts                           （C11·F6+F2 section·含 §4-3①② 补齐）
  1  0  apps/worker/package.json                                   （prove:fence-reflow-repair script）
 38 10  apps/worker/src/commerce-reconcile.ts                      （C4·F3 形 A）
 89  2  apps/worker/test/commerce-reconcile.proof.ts               （C11·⑧ section·含修正 3/4）
  2  0  package.json                                               （fence-reflow-repair:prove 双 script·前席落）
  3  1  scripts/run-e2e-isolated.mjs                               （本席修正 6·target 注册）
新增：apps/web/test/f5-hooks.mjs(42) · apps/web/test/interviews-actions.proof.ts(184) ·
      apps/worker/test/fence-reflow-repair.proof.ts(154) · ops/recovery/fence-reflow-repair.ts(189)（C10·C11 P2/P3）
```

## 4. 边界核查（全过）

- 零迁移：`packages/db/migrations/` diff=0；围栏立法族 **0058/0059/0062/0076 零字节**（不在 diff·亲证）。
- C5：`packages/db/src/commerce.ts`/`index.ts` **零改**（形 A 五钉(i)兑现）。
- SSOT 零触：CLAUDE.md/backlog/coverage matrix/SOP/NORTH-STAR §1 pins 零改（diff name-only 证）。
- pins 十一值零翻转（照抄 §6）·`actualSpendCny=null`（零外呼零消耗）。
- 零 secrets/.env 入库：test-only HMAC placeholder 沿兄弟 proof 先例；ops 工具走 `resolveDatabaseConnectionString()` env。
- 围栏账本零删（§5-3）：C10 prove 断言 privacy_erasure_request/privacy_checkpoint_target 计数状态不变 PASS。
- 只在本工作树本分支 commit；未 push、未触主线与其他工作树。
- 止损核查：实现与任务书无大矛盾（4 处小缺陷按任务书修正+注记，未触停止条件）。

## 5. Non-claims

create 过滤≠围栏清除/解除；fencedSkipped+error 计数≠告警系统建成（ready() 语义零改）；运维脚本=一次性修复工具≠产品功能（C10 零产品面引用断言 PASS）；dry-run≠已修复；410 文案≠删除流程完成≠信封统一；F5 空壳回收≠begin 失败根因修复；F2 选择面≠并行多开；SSE 410 出口≠quiz/diagnosis 同款（iterateSseBody 他流零改有断言）；est live=0；本收据≠post-prove dual PASS（`executed:awaiting_post_prove_dual`·双审归协调方派）。
