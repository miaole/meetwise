# REQUEST — **F-F · interview_job last_error 甄别刀**（仪器化重跑 + 容器拆除前 DB 只读甄别 · ≠ 修复 ≠ trio 翻绿）· pre-dual · mw-model-op

**Status**: **PENDING** / `draft:awaiting_re_pre_exec_dual`（**RE-PRE round 2** · round-1 本席 verdict=**PASS** 附 C-MO-P1/P2（下附段 append-only 随卷保留零删改；本 PASS 系 round-1 半签，不因 rewrite 延续）· 实现方已按两审处方面 rewrite · 本 stub 重开待本席复审 · Ban 实现方 self-write 任何 PASS · Ban self-approve · alone ≠ dual · 不代签 peer）
**RE-PRE 注记（实现方 mw-core · 2026-10-08）**：rewrite commit 落于 `line/ff-last-error`（base 重钉 `0b18169c`，rebase drop 孪生 `1dd1e630` · OB-MO-2 孪生 provenance 如实继承）。本席 round-1 处方兑现：C-MO-P1（§1.4 新增 embedding 证伪分支行：`last_error`/`error_code` 现 embedding-build/embedding-query/rerank 签名 registry `:148/:153/:158` `wired:false` → 推翻 H0-alt-2 驳回、回协调方，Ban 扫入基建 catch-all + §3.4 显式负检查 + §5.2 例外条款 + 输入事实行交叉引用）· C-MO-P2/OB-MO-1（红① 措辞精确化为「start job 未入队（壳行存在、四道 409 门 `:278-:305` 先于 `:337` 入队）」@harness §1.1 + slice §范围2）。请本席复审。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · trio OPEN · GAP-G7K-API-REDS **P1 OPEN** · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/g7r-ff-last-error-discriminator.md` · slice `g7r-ff-last-error-discriminator.slice.md`
**上游**: G7R post-dual **mw-model-op POST 段 §3.4-C 即本刀母本**（「F-F 诊断 attempt：协调方授权一次仪器化重跑，跑后受权从 DB 读 `last_error`/账本分布并落 name-only 收据——不破 stderr withhold `:2093`」）· G7R post-dual BOTH PASS `bfd868e0` · G7R EXEC 实跑 code SHA `3767f783`（trio EXIT 1/1/1 retained）
**Base tip**: `bfd868e0`（full `bfd868e028821531db0dcb905066730d56f64685` · 本机 origin ref 实测 · **如实登记：本 turn fetch 两次网络失败，以本机 ref 为基线恰满足预期 ≥`bfd868e0`；EXEC 期重 fetch 重钉** · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **F-F**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |
| `actualSpendCny` | **null**（沿 G7R/I 线 · Ban invented spend） |

## 请审什么（mw-model-op · live 调用面 / 模型账本判读 / 预算与 Key 卫生 / 甄别器码面）

Line F-F · **interview_job last_error 甄别刀**（贵席 G7R post-dual §3.4-C 交付的执行化）。请审（model-op 首责面）：

1. **甄别器码面（贵席 POST 段裁决的复验）**：`markJobFailed` 持久化 `error.message.slice(0,500)` → `interview_job.last_error`（`packages/db/src/interview-jobs.ts:214-217` 亲读）；throw 路径签名链 `interview-consumer.ts:93`（`interview_unavailable{reason,kind}`）+ `:162`（`failClaimedInterviewJob`→`terminalizeUnsettledInterview('job_failed', kind)`）+ catch-all `:370-381`；invoke 内部态 throw 值域 `model_invocation_admission_state`/`model_execution_aborted`/`model_invocation_dispatch_state`/`model_cost_unknown_state`（`invoke.ts:494/:524/:562/:601/:662/:683`）；`graph_fence_lost` 走 requeue 不落 failed（`:374-377`）；reaper 写 `last_error='reaped:worker_died'`（`interview-jobs.ts:251`）——判读表 §1.4 逐值域映射与行号是否全中、有无漏域（如 answer 面特有 throw）。
2. **H0-alt-1 出局的引用纪律（贵席 §3.4-B 判读表的下游）**：协调方 Key 直探（F-A-1 配对 200 成功 + 错配 401 复现）作为**输入事实**引用——本 turn 零 Key 值读取零复跑；**401/404 在 invoke 层扁平化为 `provider_rejected`（`model-client.ts:515-516`）的不可分注记是否随 `provider_rejected` 判读行保留**；EXEC 读数若现 `provider_rejected` 行（与直探结论张力）→ 如实登记回协调方的路由是否在案（Ban 就地解读洗掉张力）。
3. **读取窗口机制与 DB 账本面**：sidecar 直读隔离 PG（凭据=runner 自身 `HOST_SQL_PROBE` 同面 `:2298-2300`+`:2119`；`meetwise.e2e_run_token` 系 server GUC 非连接门的判定）——连接面/凭据面/采样时序论证是否成立；SELECT 列白名单（Ban `interview_job.payload`、Ban `ai_invocation_trace.output`——虽然 `markJobFailed`/`markJobDone` 均 `payload=payload-'answer'` 剥除，最小读面纪律）是否守住；`ai_model_invocation` 三态（succeeded/failed/unknown · `completeModelInvocation`/`markModelInvocationUnknown` `packages/db/src/model-invocation.ts:139-158`）+ `ai_invocation_trace` success-only（`invoke.ts:348-352` 注释自证「只在输出校验通过时调用」）的判读语义是否如实。
4. **预算与 live 面**：甄别 run 沿 G7R 授权口径 **≤200 内报备**；诚实结构估——H0-alt-5（pre-model throw）成立则大概率零 live 调用（G7R EXEC 实测 <50 佐证失败未达 provider）；读数反证则与 G7R CMD 同量级；超限即停如实记中止（不洗 not_run）；voice/OCR/ASR/TTS 无 DASHSCOPE key → honest capability skip = 0 调用；**`actualSpendCny=null` 保持**（Ban invented spend）。
5. **Key 卫生（硬 · 沿 C-MO-6/C-K6 全量）**：本刀读数**零模型 Key 依赖**（DB 直读用容器固定测试凭据 `meetwise`/容器口令——测试基建凭据非 secret 面，但 Ban 入收据原文，name-only 纪律同）；EXEC 期模型 Key 仅 name-only 探针（loader 进程环境）；**Ban 写任何 `.env*`**；Ban Key 值/fingerprint 入 receipt/log/commit/截图。
6. **甄别→修复路由边界（C-MO-11 延续）**：读数定谳 H0-alt-5 子面（a 结构门 / a′ start locator / b invoke 内部态 / c 基建）→ 修复走**对应产品刀另 REQUEST**；读数反证 provider/准入面 → 值迭代须协调方**新 EXEC**（C-MO-7 纪律，Ban 就地换值重跑）；**Ban 为绿改产品**（EXEC 期顺手修=违纪）；**Ban 碰 `:68`/`:70`/`:71` 已清面**（registry start-job chat ops `wired:true` 裁决域零触碰零加固）。
7. **定谳措辞（C-MO-2/C-MO-8 延续）**：SUMMARY 根因定谳段按证据强度措辞——「与 H0-alt-5·X 一致」≠「H0-alt-5 已证」；三面读数（last_error + invocation 分布 + trace 计数）**联合判读**，单一读数不定谳；矛盾读数（混合面）合法且如实记。
8. **Ban 清单确认**：Ban coding · Ban prove 执行（本 turn 零实跑零 live 零 Key 加载零 DB 连接）· Ban push · Ban SSOT/backlog 状态翻转（GAP P1 OPEN 不翻）· Ban 洗绿/Ban retry-to-green/Ban flake 记法（备选 iso run 触发条件唯一且登记）· Ban 改 withhold 机制（`run-e2e-isolated.mjs` 零 diff）· Ban 碰 sibling 归档（G7R 收据零改写）· Ban self-approve · alone ≠ dual。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. `actualSpendCny=null`. **甄别器 = last_error 一步定谳工具，非翻绿工具** · 读数 ≠ 修复 · 判读表 ≠ 根因断言 · **Ban 假绿叙事**。

本 stub 不授权 prove 执行 / 甄别 run / DB 连接；pre-dual BOTH PASS 后由协调方授权 EXEC（run 面裁定与机制 B 预批由协调方落字）；implementer 不自批；本 PASS（如落）仅为 mw-model-op 半签，不代签并行 peer mw-e2e-ha。

---

*REQUEST stub · F-F last_error discriminator · Line F-F · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查段 — mw-model-op（append-only · 2026-10-07 · docs gate only）

**审查域**：model-op / 根因域（判读表忠实性 · 甄别器码面 · 红①排除 · live/预算/Key 卫生域）。**边界**：PRE-EXEC dual · Ban prove · Ban coding · Ban product edit · Ban 改共享 SSOT · Ban live（本审零调用零 Key 加载零 DB 连接）· alone ≠ dual（本 PASS 仅为 mw-model-op 半签，不代签并行 peer mw-e2e-ha）· 禁 push。
**被审对象**：REQUEST `1dd1e630`（origin · `docs(e2e): REQUEST F-F last_error discriminator (pre_dual)` · 恰 4 md +255/−0 全 ai-docs）。**本审独立 worktree** `/Users/miaole/Desktop/golucky/meetwise-rv-ff-model-op` · branch `rv/ff-model-op` · 基于 origin/feat/mysql-schema-skeleton tip `0b18169c`。

## A. 对象与机检（全部本机可复现）

- **A1 对象亲缘**：`git merge-base --is-ancestor 1dd1e630 0b18169c` = 否——**`1dd1e630` 与 origin tip `0b18169c` 为同父同树孪生**（parent 均 `bfd868e0` · tree 均 `b910a6da5d78029dbaede8ea91e1511563d6ba10` 机检全等）→ 「tip 含被审 REQUEST」以树全等成立，登记 OB-MO-2（同树重提交 provenance 惯例）。被审 diff 以 `git diff 1dd1e630^..1dd1e630` 为准。
- **A2 docs-only**：diff 文件恰 4 个全 `.md`（slice 25 / harness 132 / 双 stub 各 49）· 非 md 文件机检 = 0 · 禁改路径（`.env*`/`package.json`/SSOT/spec）机检 = 0 · Key 物料扫描（`sk-*`/`Bearer `/key=）机检 = 0 hit。
- **A3 REQUEST 事实自洽**：harness `Status=draft:awaiting_pre_dual` · 零预填 EXIT（§5.4）· 零 prove 执行声明（§0 只读三源披露）——本审独立复核确认本树无任何收据/快照工件入 git（`.tmp/` 在 `.gitignore:15`）。

## B. 判读表忠实性（核心 · 逐值域码面机检 @本树亲读）

**结论：任务单点名的六类结构性 throw 候选全数覆盖且行号全中；一处非点名域（embedding 证伪分支）缺行 → Condition C-MO-P1。**

| 候选域 | harness 判读表行 | 码面机检 | 裁定 |
|---|---|---|---|
| resume-reference 门 | `interview_resume_reference_missing_or_mismatched` → `interview-consumer.ts:200-206` | `:200` `hasCurrentResumeReference` false → `:201-204` `failClaimedInterviewJob(Error('interview_resume_reference_missing_or_mismatched'))` 逐字 | ✅ 忠实 |
| start locator 门（a′） | `interview_resume_reference_missing` → `:313-314` | `:313` resumeId/epoch 标量校验 → `:314` throw 逐字 | ✅ 忠实 |
| invoke 内部态（b） | admission/aborted/dispatch/cost → `invoke.ts:494/:524/:562/:601/:662/:683` | 六处 `throw new Error(...)` 逐字全中（admission ×2 · aborted · dispatch · cost ×2） | ✅ 忠实 |
| checkpoint/fence/投影基建（c） | 原文归 `interview-consumer.ts:294-295` enroll+fence → catch-all `:370-381` | `:294-295` 逐字 · `:370` catch → `:380` failClaimedInterviewJob · `:159` 写入 `(error)?.message ?? 'err'` | ✅ 忠实（catch-all 全捕获 · `:189-193` privacy_fenced 走 requeue 不落 failed 亦核实） |
| trackLocal 穿透 | 无专名行 | 码面证实：`retrieveViaDispatchTrackLocal` 全失败形（recheck_failed/route_snapshot_missing/dispatch_rejected 等）皆 `degradedRetrieval(...)` 返回不抛（qbank-track-local-retrieve.ts :108/:171/:173/:185-186/:193/:432/:437）→ 无特有 throw 值域，逸出基建异常由 c 行 catch-all 承接 | ✅ 忠实（以「无值域」证忠实 · 与 G7R post-dual「检索失败不抛」口径一致） |
| answer 面特有 throw | 无 | 码面无 answer 专属 throw 值（loadClaimedInterviewAnswerPayload=DB 读 · submitAdaptiveAnswer 入图后归 b/c 域） | ✅ 无漏域 |
| legacy 配置面 | `legacy_interview_graph_disabled` → `:176` | `:176` throw 逐字 | ✅ 忠实 |
| reaper 面 | `reaped:worker_died` → `interview-jobs.ts:251` | `:251` 逐字 · 且 `sweepStuckInterviewJobs` requeue 分支 `:254-257` 不落 failed | ✅ 忠实 |
| `graph_fence_lost` 不可能 | → `:374-377` requeue | `:374` code 判等 → `:375` requeueInterviewJob → 无 last_error | ✅ 忠实 |
| NULL/无 failed 行转账本 | → 读 (2) 分布 + `provider_rejected` 401/404 不可分注记 | `model-client.ts:513-515`（401/404→deterministic·known_not_executed）→ `invoke.ts:646`（error='provider_rejected'/'deterministic_refusal' 落库）· `model-invocation.ts:139-150` succeeded/failed + `:152-158` unknown（transient→unknown 语义齐） | ✅ 忠实（注记随行 ✓ · 张力路由 §5.3 在案） |
| **embedding/rerank 证伪分支** | **无此行** | registry `:148/:153/:158` embedding-build/embedding-query/rerank `wired:false` 仅冻结契约；`invoke.ts:317-319` `!resolved.ok → return undefined` 降级不抛——H0-alt-2 驳回成立 ⇒ last_error **不应**现 embedding 签名；**若现 = 「零生产调用点」前提被证伪 = 推翻 H0-alt-2 驳回**。判读表无此显式分支（最近为 c 行 catch-all 与 §5.2「未覆盖值域」兜底，但「推翻 H0-alt-2」语义未落字） | ⚠️ **C-MO-P1** |

**写入方完备性**：`interview_job` 全库 `status='failed'` 写入方机检恰两处——`markJobFailed`（interview-jobs.ts:215）与 reaper（:251），判读表双覆盖 ✅。answer 剥除注记（`:211`/`:215` `payload=payload-'answer'`）+ SELECT 白名单（Ban payload/trace.output）亲读属实 ✅。success-only trace 注记（`invoke.ts:351`「本函数只在输出校验通过(`!error`)时调用」，在 harness 引域 `:348-352` 内）✅。

## C. 红①排除裁决复核（独立版本）

**裁决：成立。** `interview.service.ts` begin 链四道 fail-closed 409 门全部先于入队：`:278-279` binding_conflict / `:284-285` legacy_resume_reference_unavailable / `:304-305` binding_unavailable（bind UPDATE 0 行） / `:323-324` legacy——`enqueueInterviewJob` 在 `:337`。红①面因果链断于 start job 入队之前 ⇒ **`interview_job` 行不存在 ⇒ `last_error` 甄别器在该面无对象**，红①甄别归 route 侧另刀的边界划分正确。uc018-abandon 首选面（apps/web/e2e-ui/uc018-abandon.spec.ts `UC018-UI-abandon` · abandon 409 契约）与 G7R 观测链（begin 202→领 job→抛→markJobFailed→`:93` SSE→abandon 409）互证成立。
- **OB-MO-1（非阻断 · 措辞）**：harness §1.1「interview 从不创建」不精确——`POST /` 的 interview `created` 壳行存在，从未创建的是 **start interview_job 行**；承重结论（甄别器无对象）不受影响。EXEC 收据引用本论证时须用精确表述（C-MO-P2）。

## D. sidecar 读 DB × H0-alt-2 口径一致性

机制 A 为纯 DB SELECT 旁路（`:2119` runner probe 同凭据面 · `meetwise.e2e_run_token` GUC 非连接门判定在案）· wrapper 零 diff（blob `13dbfc43c744511644649ae310696a13ee2f20f7` 本树 `git hash-object` 亲算与 G7R 冻结钉全等 · `:2082/:2088/:2093/:2119/:2296/:2298/:2301/:2310/:2367` 行号逐一亲读全中；先例文档行号偏差已由 harness 如实登记并以 blob 为准）✅。读 DB 面与 H0-alt-2 驳回（code-face 域）无口径冲突；**唯一缺口 = D 节/判读表 embedding 证伪分支缺行 → C-MO-P1**（registry `:148/:153` unwired × `invoke.ts:317-319` 降级不抛为本审独立复算）。

## E. live 面 / 预算 / Key 卫生

- **E1 live 报备**：甄别 run 沿 G7R 授权口径 **≤200 内报备**（harness §3.6）· 诚实结构估两分支（pre-model throw 成立→大概率零 live，G7R 实测 <50 佐证；反证→与 G7R CMD 同量级）· 超限即停不洗 not_run · voice/OCR/ASR/TTS honest skip=0 · 本 turn（REQUEST+本审）零 live 零调用——**合规**。
- **E2 Key 卫生**：REQUEST diff Key 物料机检 0 hit；DB 凭据=容器固定测试基建凭据非模型 Key，收据 name-only 纪律在案（§2 Ban Key 物料行）；Ban 写 `.env*` ✓；`.tmp/` 不入 git（.gitignore:15）✓。
- **E3 预算诚实条款**：`actualSpendCny=null` 保持（Ban invented spend）✓。

## F. Pins / Retained 对表（零漂移）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **DELETE=503** · `actualSpendCny=null` —— harness §4 表+§Pins / slice §Pins / 本 stub §Pins 三处逐值对表**全等** ✅。Retained：`g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN（EXIT 1/1/1）· GAP-G7K-API-REDS P1 OPEN（`0c6c3287` 不翻）——本刀零翻转 ✅。

## G. Fail-trigger audit（F-MO-1~7 · 全未触发）

| # | 触发条件 | 裁定 |
|---|---|---|
| F-MO-1 | 判读表漏点名结构性候选（resume-reference/invoke 内部态/checkpoint/fence/投影基建/trackLocal） | 未触发（B 节全覆盖·行号全中） |
| F-MO-2 | 红①无对象论证不成立（409 后于入队） | 未触发（C 节 :278-:305 先于 :337） |
| F-MO-3 | 判读表/锚点失真（blob 或行号不实） | 未触发（B/D 节逐一亲读全中） |
| F-MO-4 | Pins/Retained 漂移或 SSOT/backlog 翻转 | 未触发（F 节零漂移 · P1 OPEN 保持） |
| F-MO-5 | live 超 G7R 口径 / Key 物料入树 | 未触发（E 节 ≤200 在案 · 0 hit） |
| F-MO-6 | REQUEST 自身违 Ban（改产品/改 wrapper/碰 :68-:71 清面） | 未触发（A2 docs-only · registry `:63-:71` 零触碰） |
| F-MO-7 | retry-to-green 通道（备选 run 洗红/删 attempt） | 未触发（备选触发唯一+attempts 全记录+Ban 只留绿 attempt 在案） |

## H. Blockers / Conditions / OB

- **Blockers：0。**
- **C-MO-P1（embedding 证伪分支 · 随卷约束 EXEC 收据）**：EXEC 期收据须含显式负检查——`interview_job.last_error` 或 `ai_model_invocation.error` 若现 embedding-build/embedding-query/rerank 签名（registry `:148/:153/:158`），一律按**推翻 H0-alt-2 驳回**处置：如实记矛盾 + 回协调方，**Ban 扫入 c 行基建 catch-all、Ban 就地 reinterpret**。harness §5.2「未覆盖值域」兜底部分覆盖，但证伪语义必须显式落收据。
- **C-MO-P2（红①措辞纪律）**：EXEC 收据/后续文档引用红①排除论证须用「start interview_job 未入队（409 门 :278-:305 先于 :337）」精确表述，Ban 沿用「interview 从不创建」简写。
- **OB-MO-1**：红①措辞不精确（C 节）。**OB-MO-2**：`1dd1e630`≡`0b18169c` 同父同树孪生（A1 · provenance 登记 · 被审对象以任务单 `1dd1e630` 为准）。

## I. 裁决边界（硬钉）

本 PASS = PRE-EXEC **docs gate only** 双审之 mw-model-op 半签：仅判「REQUEST 文档面可进入协调方 EXEC 授权队列」，**≠ EXEC 授权 ≠ 甄别 run 结果预判 ≠ H0-alt-5 定谳 ≠ 修复 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**。alone ≠ dual：mw-e2e-ha stub 本机亲读为 PENDING 无 verdict，本审不依赖不代签。本审零 prove run 零 live 零 Key 值读取零 coding 零 SSOT edit。禁 push。C-MO-P1/P2 未兑现不影响本 PASS（docs gate 层面），但 EXEC 收据缺显式负检查 = post 段 Fail-trigger。

**中文三行摘要**：
1. 判读表逐值域机检忠实：点名六候选（resume-reference 门/start locator/invoke 内部态六锚/基建 catch-all/trackLocal 无 throw 证忠实/reaper）行号全中，last_error 全库写入方恰两处双覆盖，红①无对象论证独立复核成立（四道 409 门 :278-:305 先于 :337 入队）。
2. 唯一实质缺口：判读表无 embedding 证伪分支——last_error 若现 embedding/rerank 签名即推翻 H0-alt-2 驳回，落 C-MO-P1 随卷约束（Ban 扫入基建 catch-all）；另红①「interview 从不创建」措辞不精确落 OB-MO-1/C-MO-P2。
3. docs-only 四文件机检全净（零产品码零 Key 物料零禁改路径），REQUEST 与 origin tip 为同父同树孪生如实登记 OB-MO-2；live ≤200 G7R 口径在案、Pins 九值三处全等零漂移、wrapper blob 13dbfc43 全等；0 Blocker · alone≠dual 仅 mw-model-op 半签。

Verdict: PASS
