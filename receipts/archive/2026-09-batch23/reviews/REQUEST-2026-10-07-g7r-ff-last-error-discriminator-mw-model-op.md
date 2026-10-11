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

---

# RE-PRE dual 审查段 — mw-model-op（append-only · 2026-10-08 · docs gate only · 复审 rewrite `c4ec760b`）

**审查域**：model-op / 根因域（round-1 本席处方 C-MO-P1/P2 兑现核验 + B-FF-1/B-FF-2 修正复核 + 全文复验零弱化）。**边界**：RE-PRE dual · Ban prove · Ban coding · Ban live（本审零调用零 Key 加载零 DB 连接）· alone ≠ dual（本 verdict 仅为 mw-model-op 半签，不代签并行 peer mw-e2e-ha）· 禁 push。
**被审对象**：rewrite commit `c4ec760b`（`line/ff-last-error` tip · `docs(e2e): REQUEST F-F last_error discriminator rewrite (re_pre_dual)` · 恰 4 md +187/−29 全 ai-docs 机检）。**本审独立 worktree** `/Users/miaole/Desktop/golucky/meetwise-rv-ffr-model-op` · branch `rv/ffr-model-op` · 基于 `line/ff-last-error@c4ec760b`。
**append-only 基线**：本 stub 追加前 20510B · md5 `00ac5b3b60cc9f9573c07f099547b55f` · 末行 `Verdict: PASS`（round-1 段）；本段纯追加，前缀字节零改动。

## A. 对象机检（全部本机可复现）

- **A1 docs-only 全距**：`git diff --name-only 0b18169c c4ec760b` 恰 4 个全 `.md`（harness/slice/双 stub）· 非 md 机检 = 0 · 禁改路径（`.env*`/`package.json`/spec/SSOT）机检 = 0 · Key 物料（sk-*/Bearer/key=）rewrite diff 面 0 hit（唯一命中系本席 round-1 段内描述扫描 pattern 的字面文本）· 收据目录零入树 · `.tmp/` 在 `.gitignore:15`。
- **A2 base 重钉孪生机检**：`git rev-parse 1dd1e630^{tree} 0b18169c^{tree}` = `b910a6da5d78029dbaede8ea91e1511563d6ba10` 双全等——round-1 REQUEST 与 rebase 落 tip 确系同父同树孪生，harness Base 注记与 OB-FF-1/OB-MO-2 provenance 继承属实；round-1 全部码面锚在 tip 树重核=同树重核。

## B. C-MO-P1 兑现核验（本席核心 · 逐落点）

| 处方要求 | 落点 | 机检 | 裁定 |
|---|---|---|---|
| §1.4 判读表新增 embedding 证伪分支行：`last_error`/`error_code` 现 embedding-build/embedding-query/rerank 签名 → 推翻 H0-alt-2 驳回、回协调方、Ban 扫入基建 catch-all、Ban 就地 reinterpret | harness §1.4 表行（:86） | 分支行逐字落文，签名三值 `qbank.embedding-build.v1`/`qbank.embedding-query.v1`/`qbank.rerank.v1` 与 registry operationId 逐字全等；锚 `model-operation-registry.ts:148/:153/:158`（三行 `wired: false` 亲读行号精确）+ `invoke.ts:317-318`（`!resolved.ok → return undefined`）全中 | ✅ 兑现 |
| 配套负检查（防「未覆盖值域」兜底） | 四落点 | §1.4 行内括注「与 §5.2『未覆盖值域』兜底不同：此系显式证伪语义，非未覆盖」· §3.4 七字段加「embedding/rerank 签名显式负检查（四查询读数逐条核对无 `qbank.embedding-*`/`qbank.rerank` 签名，有则按 §1.4 证伪分支处置）」· §5.2 例外条款「不属『未覆盖值域』兜底…命中即按『推翻 H0-alt-2 驳回』处置并回协调方」· 输入事实行（:10）「可证伪性随卷（C-MO-P1）」交叉引用 | ✅ 兑现（兜底漏洞四面封口） |
| 判读表其余行不被证伪分支污染（embed 命中不得误归 c 行） | §1.4 行序 | 证伪分支行独立于 c 行基建 catch-all 行，且显式 Ban 扫入 catch-all | ✅ 语义隔离成立 |

**C-MO-P1 裁定：兑现。** round-1 处方全文（H 节）要求的三要素——显式证伪语义落判读表、EXEC 收据显式负检查、Ban 扫入 catch-all/Ban 就地 reinterpret——全部落文且锚精确。

## C. C-MO-P2/OB-MO-1 兑现核验（红①措辞精确化）

- **harness §1.1（:31）**：「**start job 未入队**：`POST /` 的 interview 壳行已创建，四道 fail-closed 409 门 `interview.service.ts:278-279/:284-285/:304-305/:323-324` 全部先于 `:337` `enqueueInterviewJob` 入队（round-1 OB-MO-1/C-MO-P2 措辞精确化：Ban 沿用『interview 从不创建』简写）」——四门 + 入队锚本树逐行亲读全中（binding_conflict :278-279 / legacy :284-285 / binding_unavailable :304-305 / legacy :323-324 / enqueue :337）；「interview 从不创建」旧措辞全树仅存于本 Ban 注记，零残留作主动断言。
- **slice §范围2** + **harness footer（:145）**：同款精确措辞（「红①排除=**start job 未入队**（壳行存在、四道 409 门先于 :337 入队 · C-MO-P2 措辞）」）随卷。
- **C-MO-P2 裁定：兑现。**

## D. B-FF-1/B-FF-2 修正复核（DDL 实读 · e2e-ha 处方面但影响判读表读数面）

| 项 | harness 落点 | DDL/码面实读机检 | 裁定 |
|---|---|---|---|
| B-FF-1 `created_at` | §1.2-A 白名单 + §1.3(1) 排序键 + C-HA-FF-1 语义注记 | `packages/db/sql/05_interview_jobs.sql:20` `created_at timestamptz NOT NULL DEFAULT now()`（:16 `last_error text`）· `0001_baseline.sql:266` 同款 · 全库 `ADD COLUMN updated_at` 宽松 grep 唯一命中 `app_setting@0003` · `0058:227` `updated_at` 目标 privacy_erasure_request · interview_job 面 updated_at 零痕迹（含 sql/ 全树） | ✅ 已修（SQL 列名错误消除） |
| B-FF-2 `error_code` | §1.3(2) 列名 + C-HA-FF-2 值域注记 | `0037_ai_model_invocation_durable_claim.sql:14` `error_code text` · 无裸 `error` 列（0037/0088 全文 grep）· `0088:113` 约束 `^[A-Za-z0-9._:-]{1,120}$` 逐字 · 全库 RENAME 仅 0061 resume_quiz/resume_diagnosis · 后续 ALTER（0057 cost_scope_id/0085 logical_node_key_digest/0119 estimate_input_tokens）均不触 error 面 · 0037:36-37 系 RLS enable/force | ✅ 已修（承重结论成立，见 OB-MO-3 注记措辞） |

## E. 全文复验（零弱化 · tip 重核）

- **E1 判读表忠实性六候选覆盖复验（round-1 B 节全锚 tip 重核全中）**：resume-reference 门 `interview-consumer.ts:200-206` · start locator `:313-314` · invoke 内部态六锚 `invoke.ts:494/:524/:562/:601/:662/:683` · 基建 catch-all `:294-295`→`:370-381`（`:374-377` graph_fence_lost 走 requeue 不落 failed）· 配置面 `:176` · reaper `interview-jobs.ts:251`——全部逐行亲读精确；`markJobFailed` `error.slice(0,500)`（:214-217）+ 调用方 message 抽取（consumer `:159` `(error)?.message ?? 'err'`）链闭合；success-only trace 注记 `invoke.ts:348-352` 亲读在卷；`model-invocation.ts:139-155` succeeded/failed/unknown 三态齐。
- **E2 删除行零弱化审计（−29 行逐条）**：`git diff 0b18169c c4ec760b` 删除行全部为处方面替换——SQL 两列名纠错（B-FF-1/B-FF-2）· 备选触发收紧（查询报错≠空读 C-HA-FF-3）· NULL 行三面全空判读加仪器错误前置门 · 窗口采样「必得数十至数百次」过强断言改「预期…以 sidecar 自身健康为前提，非必然性断言」（诚实性**增强**非弱化）· Base 重钉注记 · 生命周期措辞。round-1 PASS 的判读表/红①/Pins/预算/Key 卫生面零删改。
- **E3 Pins/Retained 原值**：harness §4 表 + harness §Pins（:141）+ slice §Pins 三处逐值对表全等（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · r1Closed=false · techRoleFailClosedOptOutG7Only=true · Disclosure-1 OPEN · trio OPEN · GAP P1 OPEN · actualSpendCny=null）——零漂移。
- **E4 wrapper/withhold**：`git hash-object scripts/run-e2e-isolated.mjs` = `13dbfc43c744511644649ae310696a13ee2f20f7` 与 G7R 冻结钉全等；锚 `:2082`（runFullE2E）/`:2088`（stderr 丢弃）/`:2119`（probe 凭据面）/`:2296`/`:2298-2301`/`:2310`/`:2367` 逐行全中；registry `:63-71` 清面（competency-planning/question-generation `wired:true`）零触碰（docs-only 本身即零触碰）。
- **E5 双 stub append-only 完整性**：mw-model-op stub 与本席 round-1 worktree `rv/ff-model-op@eccfebfd` 副本逐字节 diff = 仅 Status 行生命周期更新 + 新增 RE-PRE 注记行，round-1 PASS 段（含 Pins 表/A-I 节/三行摘要/`Verdict: PASS`）零删改；mw-e2e-ha stub 同面（round-1 FAIL 段原样保留、末行 `Verdict: FAIL` 为其 round-1 记录，重审权在其本席）。
- **E6 处方面恰限**：rewrite 变更面 = B-FF-1/B-FF-2 + C-HA-FF-1~3 注记 + C-MO-P1/P2 + OB 继承 + 生命周期——无静默换范围（E2 删除行审计佐证）。

## F. Blockers / Conditions / OB

- **Blockers：0。**
- **Conditions（round-1 C-MO-P1/P2）**：**均兑现**（B/C 节）——转为已结；EXEC 收据仍须按 §3.4 显式负检查执行（此为收据义务非本审未决条件）。
- **OB-MO-3（非阻断 · §1.3(2) 注记枚举）**：「后续 ALTER 全局 grep 仅 RLS enable/force 无补列」字面枚举不完整——0037 后确有三条 `ALTER TABLE ai_model_invocation ADD COLUMN`（0057 cost_scope_id / 0085 logical_node_key_digest / 0119 estimate_input_tokens），均非 error 面；承重结论（列名=`error_code`、无 error 列、未被 RENAME）经独立机检成立不受影响。EXEC 收据引用本注记时以精确枚举为准。
- **OB-MO-4（非阻断 · commit message 计数）**：commit message prose「恰 4 md +186/−26」与实际 diffstat +187/−29 有 ±出入（文件集「恰 4 md 全 ai-docs」机检正确，仅 prose 计数滑差）。
- **OB-MO-5（非阻断 · §Pins STOP 措辞）**：harness §Pins 行 STOP 仍作「awaiting pre-dual…」未同步 re_pre 生命周期措辞（Status/授权链/footer 均已为 awaiting_re_pre_exec_dual）；门语义（双审 + 协调方 EXEC）不变且实际更严，零削弱。

## G. Fail-trigger audit（F-MO-1~7 复审 · 全未触发）

F-MO-1 判读表漏候选：未触发（E1 六候选+证伪分支全覆盖）· F-MO-2 红①论证不成立：未触发（C 节锚精确）· F-MO-3 锚点/blob 失真：未触发（E1/E4 全中）· F-MO-4 Pins 漂移/SSOT 翻转：未触发（E3 零漂移 · P1 OPEN 保持）· F-MO-5 live 超口径/Key 入树：未触发（≤200 在案 · 0 hit）· F-MO-6 违 Ban 碰清面：未触发（A1 docs-only）· F-MO-7 retry-to-green：未触发（备选触发唯一+红 EXIT 不冲销在案）。

## H. 裁决边界（硬钉）

本 PASS = RE-PRE docs gate only 之 mw-model-op 半签：仅判「rewrite 已兑现 round-1 双审处方面、文档面可进入协调方 EXEC 授权队列」，**≠ EXEC 授权 ≠ 甄别 run 结果预判 ≠ H0-alt-5 定谳 ≠ H0-alt-2 驳回终局（证伪分支在卷可推翻）≠ 修复 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**。alone ≠ dual：mw-e2e-ha RE-PRE verdict 非本席所签，本审不依赖不代签；dual 成立以双方 RE-PRE PASS 各自落卷为准。本审零 prove run 零 live 零 Key 值读取零 coding 零 SSOT edit。禁 push。本 PASS ≠ 上一轮 PASS 的延续——系对 `c4ec760b` 处方兑现与零弱化的独立再裁决。

**中文三行摘要**：
1. C-MO-P1 兑现：判读表新增 embedding 证伪分支行（registry :148/:153/:158 wired:false 三锚+invoke.ts:317-319 亲读精确），兜底漏洞四面封口（行内注记/§3.4 显式负检查/§5.2 例外/输入事实交叉引用）；C-MO-P2 兑现：红①「start job 未入队（壳行存在、四道 409 门 :278-:305 先于 :337）」三处落文，旧措辞仅存 Ban 注记，码面锚逐行全中。
2. B-FF-1/B-FF-2 DDL 实读核验已修（05:20+0001:266 created_at、全库唯一 updated_at 补列仅 app_setting@0003；0037:14 error_code、0088:113 正则逐字、RENAME/ALTER 面 error 零沾）；全文复验零弱化——删除行 29 条全为处方面收紧或纠错，六候选锚 tip 重核全中，wrapper blob 13dbfc43 全等，Pins 三处全等，双 stub round-1 段逐字节保留。
3. 0 Blocker · 三条非阻断 OB（§1.3(2) ALTER 枚举不完整/commit 计数滑差/§Pins STOP 措辞未同步）；alone≠dual 仅 mw-model-op 半签不代签 mw-e2e-ha；本 PASS ≠ EXEC 授权 ≠ trio 翻绿；本审 0 prove run 0 live 0 Key 值读取 0 coding 0 SSOT edit · 禁 push。

Verdict: PASS

---

# POST-PROVE DUAL 审段（mw-model-op · 2026-10-07 · 被审 EXEC receipt commit `3da3f0cb`）

**审查域**：POST-PROVE dual 甄别实验复验 · **model-op/TECH_ROLE 门域焦点 = 根因归类裁决（本席核心产出）** + 包完整性 + 四查询快照复核 + C-MO-P1 复核 + C-MO-1~11 条件裁决。**边界**：Ban coding · Ban prove 执行 · Ban live · Ban Key 值读取 · Ban SSOT edit · alone ≠ dual（本 verdict 仅为 mw-model-op 半签，不代签并行 peer mw-e2e-ha）· 禁 push。本审独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ffp-model-op` · branch `rv/ffp-model-op` @ origin tip `ca2e4ce0`（实跑 code SHA `7ed35f0d` 亲核 = 本树直接父提交，`ca2e4ce0` 恰 +2 收据 md 零码 diff → 码面读数对实跑树全等等价）。append-only：追加前全文 32502B · md5 `65337c1bb1bad718c5cc9f42f04e83f3`，前缀机检见 G 节。

## A. 包完整性机检（全过）

- EXEC receipt commit `3da3f0cb`（mw-core）：`--name-only` 机检**恰 2 md**——`receipts/g7r-ff-last-error-discriminator/SUMMARY.md`（53 行）+ `e2e-ui-isolated.md`（69 行）· +122/−0 · **零产品码/SSOT/Key 物料 diff**。
- sidecar 快照 536 行留 `.tmp/ff-lasterror-snapshots.log` 不入 git——**本席核实确不在 git**（commit 文件清单恰 2）且盘面实物在（292606B · 536 行 · exit 文件=1），披露如实。本席对该实物直接复核（B/D 节）——sidecar 不入 git 不减损其证据力，但产品刀 REQUEST 若需引用须以本审段盘面核验记录为桥。
- wrapper blob：`git hash-object scripts/run-e2e-isolated.mjs` 本审 worktree 亲算 = `13dbfc43c744511644649ae310696a13ee2f20f7`，与执行 worktree `meetwise-line-ff` 亲算全等（binding 条件 1「零 diff」守约）。
- 实跑 SHA `7ed35f0d` = RE-PRE 双 PASS tip（本树 `git log` 直读）；收据 commit ≠ 实跑 SHA 已如实登记（收据 §4 自我声明）。

## B. 四查询快照原文复核（收据 §6 ↔ 盘面最后全 ok 行逐值全等）

最后全 ok 快照 `2026-10-07T17:48:50.659Z`（phase=poll）本席从盘面 536 行 log `tail -1` 提取，与收据 §6 JSON **逐值全等**：

1. Q1 `interview_job_failed_rows` rowCount=2：两行均 kind=start / status=failed / attempts=1 / `last_error='adaptive_role_route_missing'`（created_at `17:47:44.030Z` / `17:48:49.644Z`）✅
2. Q2 分布**仅** `job.route-classify.v1` succeeded ×2 · error_code 全 NULL（零 interview chat op 行 · 零 `provider_rejected`/`deterministic_refusal`/`unknown`）✅
3. Q3 `ai_invocation_trace` count=2 ✅
4. Q4 `interview_status_distribution` failed ×2 ✅

全卷聚合：`"status":"ok"` ×525（=525 轮全 ok）· `does not exist` ×32（=8 轮 migrate 前仪器错误 ×4 查询，与收据 §5 C-HA-FF-3 登记一致，未计入判读、未触发备选）· 无选择性摘录痕迹。**四查询快照原文核验通过。**

## C. 根因归类裁决（本席核心产出 · 三问三答）

### C.1 实现方码面归类是否准确：**准确（逐行亲读 @本树）**

- 门文件 `apps/worker/src/adaptive-role-resolve.ts`：`:35-39` `isTechRoleFailClosedEnabled` unset/blank→**ON**（默认 ON 属实；仅精确 `0|false|off`→OFF）· `:55-62` `fromRoute = roleFromRouteSnapshot ?? roleFromJobRouteMetadata`，flag ON 且双缺 → `throw Object.assign(new Error('adaptive_role_route_missing'), {code:…})`——收据 H0-alt-5·d「role-resolve fail-closed 门」码面成立 · `:23-28` `roleFromDeps` 显式**不**满足门（防借 deps 回潜静默技术岗）亲读在案。
- 传播链全中：`interview-consumer.ts:345-350`（flag ON 下读 `routeSnapForRetrieve?.allocations?.[0]?.leafTrackId`）→ `:351-355` resolver（`:356` `startAdaptiveInterview` **之前**）→ catch-all `:370-381` → `failClaimedInterviewJob :155-168` → `markJobFailed` `packages/db/src/interview-jobs.ts:214-217`（`last_error = message.slice(0,500)`）→ `terminalizeUnsettledInterview :77-96`（`:93` `interview_unavailable{kind:start,reason:job_failed}`）。
- `adaptive_role_route_missing` 判读表 §1.4 未预列属实 → §5.2 处置 + H0-alt-5·d 新子面登记合法，未扫入 c 行 catch-all、未就地 reinterpret。

### C.2 「classify succeeded ×2 而 snapshot 缺叶」：**产品面（接线/范围缺口），非夹具造数缺口——修复刀方向 = 产品刀**

本席独立重建（全码面亲读 + 在案读数交叉）：

1. **全树唯一 snapshot 生产者** = recruiter-flow begin 事务内 `snapshotInterviewRoute`（`recruiter.ts:428`；`apps/api/src/modules/interview/interview.service.ts` 全文 0 笔 snapshotInterviewRoute/interview_route_snapshot 引用）。**通用 begin 面**（`interview.service.ts` `create():587` 裸壳 interview——无 application_id——+ `begin():260-337` 仅绑 resume 后 `:337` 入队）**结构性不写 snapshot**。
2. **route_decided 决策必带 ≥1 有效叶**：`validateModelRouteOutput`（`packages/domain/src/job-route-classifier.ts:115-160`）`allocs.length<1 → invalid_schema`、叶正则 + taxonomy + bps 合计 10000 全校验——凡走完 bind→snapshot 的 interview 门必过。「snapshot 行存在但叶空/缺」在产品链上**不可达**；故 Q1 两行门 throw 只能来自 **snapshot 行不存在** 的 interview。
3. **Q1=2 / Q4=2 的唯一自洽归因**：两条 failed start job = **uc018 ×2（通用面 begin）**。run log 亲读：两 project 的 uc018 均死在 `:139`「abandon 409」——该断言**之前**的 begin 200/202 断言与「额度 -1」断言均已通过 → 两次 uc018 begin 必曾成功入队 = 恰 2 条 start job；recruiting-bound ×2 若曾入队则 Q1=4，实为 2 → 其 begin **未入队**（红① = application-start 层 route binding 缺失 fail-closed `interview_ineligible_route`（`recruiter.ts:399-407`）+ 30s `waitForURL :96` 超时），与 C-MO-P2「start job 未入队」面互证。旁证：uc018 spec 注释自证「赶在 worker fail-closed 把会话打成 failed 之前」——红②面本就是与 fail-closed 竞速的面。
4. **定谳**：甄别读数指向的结构缺口在**产品供给面**——通用 begin 为结构性无 snapshot 的 interview 入队 adaptive start job（门必 throw）；且 `roleFromJobRouteMetadata` 在调用点 `:344` **声明后从未赋值**（死源，全文件仅 :344/:353 两笔）为第二处供给缺口。e2e 全程真 UI、零 route 表 stub——「夹具造数不完整」不成立为该面的修复框架。
5. **保留项（如实）**：classify succeeded ×2（归 recruiting-bound 两 job）与 begin 时序的最终区分需 `job_route`/`route_consumption_event`/`interview_route_snapshot` 表数据——超 §1.3 四查询授权，维持收据「未扩查、回协调方」处置；本席双流归因是与全部在案读数 + 码面结构唯一无矛盾的重构，最终确认归产品刀 REQUEST。

### C.3 修复路线诚实性排序（Disclosure-1 关联 · 沿钉「仅 G7 opt-out · never counts toward R1 · 须持续披露」）

1. **产品刀（最诚实 · 唯一根因修复）**：通用 begin 供给面收口——begin 时显式 route-eligibility 前置（镜像 recruiter 面 `interview_ineligible_route` fail-closed，把 throw 从 worker 异步面提前到 begin 同步面）或显式范围决策（通用面不入 adaptive / 不入队 adaptive start job）；并案处理 `:344` 死源（接线或删除）。门语义零弱化；trio 只能经真实产品修复翻绿。
2. **夹具刀（部分诚实 · 仅限红①时序面）**：recruiting-bound 面「等 route_decided 再 begin」属合法测试稳定性修复或 recruiter happy-path 附加覆盖；对 uc018/通用面**无效**——为通用面 interview 强造 route metadata = 捏造产品不可能状态 = masking，Ban 作为本红的通用修复。
3. **opt-out 翻绿 + 披露（作为修复最不诚实 · 程序上仅可临时）**：`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 以关掉产品刻意开启的门换绿 = 换值形状；仅可作 G7 域临时 opt-out + Disclosure-1 持续披露 + never R1 + 不解除 trio 真实业务红定性（C-MO-11 明文排除其为终局修复）。
- 一律 Ban：产品码内把门弱化回 legacy 技术岗兜底（重新打开 G-R4-3/R1 刻意关闭的静默桶）。

## D. C-MO-P1 复核（本席上轮裁定被证实）

536 行全量扫描（grep 计数法）：`embedding-build`/`embedding-query`/`rerank` 签名 **0 笔**；registry `packages/ai-runtime/src/model-operation-registry.ts:148/:153/:158` wired:false 三锚本树复读在案 → **证伪分支未触发，H0-alt-2 驳回维持**。收据 §7.1 显式负检查义务兑现。

## E. 条件裁决表（C-MO-1~11 · EXEC binding 7 条自评复核通过）

| # | 条件（延续域） | 裁决 |
|---|---|---|
| C-MO-1 | 甄别器码面 / 判读表值域映射 | ✅ 未预列值走 §5.2 + H0-alt-5·d 登记，未扫 catch-all |
| C-MO-2 | 定谳措辞（一致 ≠ 已证 · 联合判读） | ✅ SUMMARY §3 措辞守约；红①张力如实登记未洗 |
| C-MO-3 | 读取窗口 / SELECT 白名单 | ✅ 快照 Q1 行仅 id/kind/status/attempts/last_error/created_at，零 payload/trace.output |
| C-MO-4 | 预算 / live ≤200 | ✅ live=2（恰 classify ×2，本 run 全部 live 面）· actualSpendCny=null · voice/OCR/ASR/TTS=0 skip 如实 |
| C-MO-5/6 | Key 卫生 | ✅ loader name-only · 三 .env ABSENT 在案 · commit 零 Key 物料 · 零 .env 写 |
| C-MO-7 | Ban 就地换值重跑 | ✅ 恰 1 attempt · EXIT=1 原值 · 无 retry-to-green（门默认 ON 自证未偷设 opt-out） |
| C-MO-8 | 矛盾读数如实 | ✅ 红①「classify succeeded ×2 vs 仍红」张力登记回协调方，Ban 就地解读已守 |
| C-MO-9 | withhold / 机制面 | ✅ wrapper blob `13dbfc43` 复算全等 · sidecar exit 1 如实 · 四来源降三来源如实登记 |
| C-MO-10 | sibling 归档 / SSOT / Pins | ✅ G7R 收据零触碰 · Pins 原值零翻转 · GAP P1 OPEN 未翻 · `g7SuiteGreen=false` 保持 |
| C-MO-11 | 产品刀边界 | ✅ **本席域裁定：H0-alt-5 证实为根因类（结构性 pre-model throw）→ 修复 = 产品/夹具刀另 REQUEST + 双审 + 协调方授权，非换值**；EXEC 期「零修复零改产品」守住（commit 恰 2 md） |

## F. Blockers / OB / Conditions

- **Blockers: 0。**
- **OB-MO-P1（非阻断 · 措辞精确化）**：收据「`allocations[0].leafTrackId` 与 job route metadata 双缺」易读作 metadata 有供给而缺值；实况为调用点 `:344` **从未赋值**（死源）。两读皆 throw，不改归类；随产品刀并案。
- **OB-MO-P2（非阻断）**：harness §1.1 红①四 409 门锚定通用 begin 面（`interview.service.ts`）；本席重构将 recruiting-bound 未入队定位于 application-start 层 `interview_ineligible_route`（`recruiter.ts:399-407`）。两读皆「入队前 fail-closed」，本刀承重结论不受影响；route 侧另刀时须以 `job_route` 数据定谳。
- **Conditions（转产品刀 REQUEST 硬义务）**：
  - **C-MO-Q1**：产品刀 REQUEST 须以通用 begin 供给面（`interview.service.ts:587` 裸壳 + `begin():260-337` 零 snapshot 写）为第一承重面，双审随卷；夹具刀仅作 recruiter-flow 覆盖补充；opt-out=0 仅可作披露的 G7 临时措施，Ban 记作修复。
  - **C-MO-Q2**：红①归因（classify succeeded revision vs begin 时序）须以新增授权查询（`job_route`/`route_consumption_event`/`interview_route_snapshot`）定谳，Ban 以本刀四查询读数就地定谳。
  - **C-MO-Q3**：Disclosure-1 保持 OPEN 至供给面实际修复；任何临时 opt-out 持续披露、never counts toward R1、不解除 trio 真实业务红定性。

## G. append-only 机检 + 中文三行摘要

机检：本段追加后前 32502B md5 复算 = `65337c1bb1bad718c5cc9f42f04e83f3`（追加前全等 · 前缀零改写）；本审 0 prove run · 0 live · 0 Key 值读取 · 0 coding · 0 SSOT edit · 唯一 git 写 = 本审段 append + 本 worktree 提交（author mw-model-op）· 禁 push。

1. 包完整性 + 四查询快照盘面复核全过：EXEC receipt `3da3f0cb` 恰 2 md 零产品码/SSOT/Key diff，收据 §6 与 536 行 sidecar 最后全 ok 快照逐值全等（last_error=adaptive_role_route_missing ×2 / classify succeeded ×2 / trace=2 / interview failed=2），wrapper blob `13dbfc43` 复算全等，sidecar 留 `.tmp/` 不入 git 如实。
2. 根因归类裁决（本席核心产出）：H0-alt-5·d role-resolve fail-closed 门码面归类准确；「classify succeeded 而 snapshot 缺叶」定谳为**产品供给面缺口非夹具缺口**（全树唯一 snapshot 生产者=recruiter-flow begin；通用 begin 面结构性零 snapshot 写 · `roleFromJobRouteMetadata` :344 死源 · route_decided 必带有效叶使「有 snapshot 而叶空」不可达 · Q1=2/Q4=2 唯一自洽归因=uc018 通用面 ×2）；修复排序 = 产品刀 ＞ 夹具刀（仅红①时序面）＞ opt-out 披露（仅 G7 临时 · never R1 · 持续披露）。
3. C-MO-P1 复核 0/536 命中 → H0-alt-2 驳回维持（上轮裁定被证实）；C-MO-1~11 全兑现 · 0 Blocker · 2 OB 非阻断 · 3 Conditions 转产品刀 REQUEST；alone ≠ dual 本 PASS 仅为 mw-model-op 半签不代签并行 peer mw-e2e-ha；本 PASS ≠ 修复 ≠ trio 翻绿 ≠ `g7SuiteGreen=true` ≠ H0-alt-5·d 终局定谳（子面归属留产品刀）· 禁 push。

Verdict: PASS
