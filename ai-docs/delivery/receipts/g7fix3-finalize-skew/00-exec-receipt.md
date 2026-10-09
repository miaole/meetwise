# G7FIX-3 · finalize 409 skew 裁决刀（driver 契约缺口臂）· EXEC 收据（attempt 1 · 判别 run 1 恰 1 次 · 零重跑）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落 mw-core · driver 面恰 3 处 +6/−4 · 恰 1 run `pnpm e2e:isolated` EXIT=**0** 原值（passed · 76905ms · assertions=72）· **四元组判读 =（terminal=interview_unavailable · status=409 · outcome=缺席（409 fail-closed 体）· reason=`generation_duplicate_question`）⇒ 五桶之「臂消化绿」（409 cannot_finalize 双验过 + in_progress 卡死面断言过）⇒ 按蓝本 §2 不得作收口材料完备声称——卡死面在账 · 产品面归协调方** · 归因判别兑现：reason=`generation_duplicate_question` 亲证 **generation 族**（`generation_*` 前缀）非 abandoned sweep（G7P-6 不可定谳谱的 driver 可见级首次落材料）· STOP awaiting post-prove dual · Ban self-approve · 判读结论附协调方）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 与执行地

- 蓝本 = REQUEST rev2 `539393c0`（分支 `line/g7-finalize-skew` · 工作树 HEAD 亲证即 `539393c0`）· 立项依据 = G7P-6 nail（席2 skew 读至代码行级）。
- 执行地：worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7fix3` · 依赖预置 `pnpm install --frozen-lockfile` EXIT=0（环境预置非代码改动）。
- 迁移面：wrapper `migrations: applied=152 skipped=0` + sidecar correlation `match=true`（`0151_pgp_sym_encrypt_grant`）——主线零迁移演进 ⇒ sidecar-v3 correlation 锚 `^0151` 零迁移照用。

## 1. Coding 面（≤12 行硬门 · diff 亲证）

- `git diff --numstat` = **`6  4  e2e/full.e2e.ts`（+6/−4 · added 6 ≤ 12 ✓ · 变更总量 10 ≤ 12 ✓）· 恰 1 文件 · apps/packages src 零 diff（`git diff --stat -- apps packages` 空输出亲证）· helpers/wrapper/解析器/守卫零触碰**。
- 处方① finalize 409 臂（`:406-408` 原三行原位改 ternary · 非 200 通路零弱化——else 面逐字保留 `r.status===200 && applicationId && interviewId && outcome===…`）：

```ts
  A(boundLoop.terminal === 'interview_unavailable' ? r.status === 409 && finalized.error === 'cannot_finalize' // G7FIX-3 409 臂: generation 族 fail-closed 形状双验(禁「非 200 即过」泛容忍·有限恢复现树不存在〔recruiter.ts:385 binding_invalid 亲证〕→ 诚实卡死面·文档化非接纳)
    : r.status === 200 && finalized.applicationId === app1 && finalized.interviewId === boundInterviewId && finalized.outcome === (scorelessBound ? 'assessment_unavailable' : 'completed'),
    `[状态机] 岗位终态后 {} finalize 按族分流: interview_unavailable→409 cannot_finalize·其余→200 服务端仅认已绑定 interview(term=…, outcome=…, status=…, error=…, reason=…)`);
```

- 处方② a4 分支选路同窗覆盖（`} else {` 收窄为 sibling·completed 整数分面零弱化逐字保留）：

```ts
  } else if (boundLoop.terminal === 'interview_unavailable') { // G7FIX-3 a4 选路: generation 族既成事实卡死面(application 停 in_progress+interview failed·文档化非接纳·产品面 finalize 契约归协调方)
    A(cand?.status === 'in_progress' && cand.score === null, `[状态机·卡死] generation 族: application 停 in_progress 且零伪造分数(…)`);
  } else {
```

- 处方③ postm7_a3 NDJSON 行增 `reason`（原行原位 +1 字段·`:405` 常驻面保留）：

```ts
  fs.appendFileSync('.tmp/e2e-consent-capture.ndjson', `${JSON.stringify({ bootId, step: 'postm7_a3_finalize', status: r.status, outcome: finalized.outcome, terminal: boundLoop.terminal, scorelessBound, reason: (boundLoop.terminalPayload as any)?.reason ?? null })}\n`); // G7FIX-3: reason 入账(abandoned sweep vs generation 族归因判别)
```

- ④ armed 延续亲证：7a 探针（`:240-248`）+ post-M7 窗截获（a1/a2/a4 NDJSON 行）+ NDJSON 常驻面**全部原样零触碰**。
- 产品面亲证（蓝本引用复核）：`packages/db/src/recruiter.ts:186-213` finalizeApplication（`in_progress`+`interview_status!=='completed'` → `not_ready`）→ `apps/api/src/modules/jobs/applications.service.ts:77` → 409 `{error:'cannot_finalize'}`；`packages/db/src/recruiter.ts:385` `binding_invalid`（retry 面死路亲证——generation 族后 `i.status` 非 created/active）；`apps/worker/src/adaptive-lifecycle.ts:51-57` generation 族直发 `interview_unavailable`（payload.reason=`generation_*`）不标 application；`apps/worker/src/commerce-reconcile.ts:65` sweep 发 `reason:'abandoned'`——reason 字段归因判别语义成立。
- 预检（run 前 · 零 e2e 执行）：esbuild transformSync EXIT=0 **TRANSFORM OK**（阴性对照注入如如期 FAIL——真语法门=esbuild）· `pnpm e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）· `.tmp/e2e-consent-capture.ndjson`/`.tmp/e2e-7a-diag.ndjson` run 前 ENOENT 亲证 · sidecar 输出目录清零。

## 2. 判别 run（RUN 1 · 恰 1 run · attempts=1 · 零重跑兑现）

| 项 | 读数 |
| --- | --- |
| 命令 | `pnpm e2e:isolated`（worktree 内 · `MODEL_API_KEY` 经授权 loader `~/.meetwise-secrets/load-model-api-key.sh` source 进程注入 · name-only · 值零打印零落盘） |
| EXIT | **0（原值 · passed）** · UTC 窗 `2026-10-09T03:37:43Z → 03:39:01Z`（receipt durationMs=76905 · assertions=72） |
| receipt | `02-run1-isolated-receipt.json`：outcome=passed · exitCode=0 · sourceDigests 15 文件**逐一与本刀工作树 sha256 全 MATCH**（`e2e/full.e2e.ts`=`sha256:e3c75eb5…` 亲证同符——run 执行树=本刀树） |
| 容器 | `meetwise-e2e-81371-1791517064274` on 127.0.0.1:61959（用后即焚 · 收据组立期 `docker ps -a` 零残留亲证） |
| reviewLedger | 19 行（原样在 receipt）· capability ×2（无 VISION/TTS/ASR 键同先例）· `report_unavailable` ×2（主 loop + 7a failLoop）· `quiz_unavailable` · `diagnosis_ready` · 段标全绿 · `interview_unavailable`（boundLoop）→ `seg_boundloop_terminal` → **走完全程** |
| erratum-1（launch abort · 如实登记） | 首次 launch 命令因新 worktree `.tmp/` 目录缺失在 **runner 进程 spawn 前**重定向失败（zsh no such file）——`docker ps -a` 零新容器 + `.tmp/e2e-receipts` ABSENT + wrapper log ABSENT 三证**零 e2e 执行**；修正 launch 脚本（`mkdir -p .tmp`）后 RUN 1 方为首个判别 run。判别 run 预算恰 1 消费 · 零重跑通道 · 零 retry-to-green。 |

### NDJSON 截获面（`.tmp/e2e-consent-capture.ndjson` 全量 7 行 · bootId=81878 · 原文在 `06-run1-ndjson-capture.ndjson`）

```json
{"bootId":81878,"step":"postm7_a1_loop","questions":1,"turns":2,"terminal":"interview_unavailable"}
{"bootId":81878,"step":"postm7_a2_provenance","trustedBSideScore":null,"identities":2,"questions":1,"clarifications":1}
{"bootId":81878,"step":"postm7_a3_finalize","status":409,"terminal":"interview_unavailable","scorelessBound":false,"reason":"generation_duplicate_question"}
{"bootId":81878,"step":"postm7_a4_cand","candStatus":"in_progress","score":null,"scorelessBound":false}
```

## 3. sidecar v3 实测臂（`../g7fix2-postm7/sidecar-v3.mjs` 原样复用零改 · 逐 run 目录清零隔离）

| 纪律条 | RUN 1 |
| --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 锚（03:37:54Z · container `…81371…:61959`） |
| ② 42P01 pending 窗 | 0 tick |
| ③ 停针计数器仅 post-first-ok 武装 | ✓ 持械 · STOP 哨兵先收口（orchestrator 落哨兵 · 非 stop-needle 触发） |
| ④ v3 策略落文字 | `g7fix2-postm7/sidecar-v3.mjs` 原样（本刀零副本零改 · provenance 指认） |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 逐 ok tick 双读（pollCount=55 · `fallbackUsed=false`）· SELECT-only 聚合零行内容零 PII |
| correlation（152 + `/^0151(_|$)/` 剥 `.sql` 归一） | ✓ match=true（`0151_pgp_sym_encrypt_grant`） |

- **双计读数（succeeded+failed · dispatching=1 不计入 · teardown 撕裂下限界沿 G7Y E-2）**：RUN 1 = **19**（14 succeeded + 5 failed · 末 ok tick `03:39:00.088Z` 原行：`dispatching|1, failed|5, succeeded|14`）· interview_job `done|13 max attempts=1 + running|1`（撕裂 ±1）· **est ≤25/run ✓**。
- **聚合级交叉证（与 G7P-6 同形再现）**：**failed inv=5 vs interview_job failed=0**（done=13 · attempts 全 1）——模型外发失败全部被吸收为 done 终态（优雅 fail-closed 形状）；**本 run 增量 = a3 NDJSON reason 通道首次采到逐事件材料**：`generation_duplicate_question`（driver 可见级 · `interview_event` payload.reason 经 SSE terminalPayload 透传）。

## 4. 判读（五桶四元组 · 附协调方 · Ban self-approve）

1. **四元组** =（**terminal=interview_unavailable** · **status=409** · **outcome=缺席**（409 fail-closed 体无 outcome 字段 · JSON.stringify 亲证该键不出现）· **reason=generation_duplicate_question**）。
2. **分桶 = 蓝本 §2 五桶之「臂消化绿」**（409 cannot_finalize 双验过 + in_progress 卡死面断言过·EXIT=0 全程走通）⇒ **不得作收口材料完备声称——卡死面在账**：application 停 `in_progress` + interview failed（`postm7_a4_cand` 原行亲证 `candStatus=in_progress, score=null`）· 用户侧无恢复通路（recruiter.ts:385 binding_invalid 死路）· **产品面（generation 族正向信号/finalize 契约/requeue）归协调方另裁**。本绿 ≠ 收口材料完备 ≠ :107 关闭 ≠ g7SuiteGreen 翻转。
3. **归因落材料（G7P-6 判读谱 driver 可见级首证）**：reason=`generation_duplicate_question` 带 `generation_*` 前缀 ⇒ **generation 族亲证，非 abandoned sweep**（处方③ 归因判别兑现）——G7P-6 三通道定谳谱的 generation 族桶获得逐事件级 driver 可见证据；`invokeError`/`last_error` 仍缺席（7a 面本 run 绿 ⇒ 探针 armed 未行使 · `[7a-diag]` grep=0 · 材料通道保持 armed）。终态语义线索如实登记：重复出题被 adaptive-lifecycle 判死（duplicate question → generation 族不可用终态），根因定谳与是否 requeue 归协调方。
4. **主 loop 面**：本 run 主面试 terminal=`report_unavailable`（×2 含 7a failLoop·quarantined 断言过）——与 G7P-6 run 主 loop 面同形；G7 车道间歇面图增量：CMD1 start 面 → G7P-6 bound-loop 面 → 本 run bound-loop 面（同域再现·臂已消化）。单 run 绿形限定语沿用 G7TRIO 臂3 教训：**不作恒绿宣称**。
5. **修法面自评**：409 消化 + 卡死面文档化均按蓝本处方落 assertion，无一处放宽既有门（else/completed 面、provenance、白名单语义零弱化·diff 亲证）。

## 5. 预算与卫生

- est/链：RUN 1 实测 dual-count 19 ≤ 25 ✓ · **链累计 = 126（G7P-6 收据口径）+ 19 = 145 ≤ 硬帽 200 ✓**（余量 55）· `actualSpendCny=null`（无计价数据源 · Ban invented spend）。
- Key 卫生：只经授权 loader 进程 env · name-only 记账 · 值零打印零入库零入 log · `.env*` ABSENT。
- 环境注记（如实）：launch 前存在异席并发容器 `meetwise-e2e-godfn1c-35997` Up 10h（命名与 pid 均非本 run · 未触碰未清除 · G7P-5/P-6 同形披露）；本机无 OCR/VISION 键与 TTS/ASR 键 ⇒ capability 码 `image_ocr_unavailable`+`voice_unavailable` 显式在 ledger。
- Ban 复核：判别 run attempts=1 · 零调序 · 零产品码（apps/packages src 零 diff 亲证）· helpers/wrapper/解析器/守卫零触碰 · 零 force-push · sidecar 原样复用零改 · tracked 树变更 = `e2e/full.e2e.ts`(+6/−4) + 本 harness 注记 + 收据目录（交付文档非产品码）。

## 6. 证据附件（本目录）

- `00-exec-receipt.md`（本文）
- RUN 1：`01-run1-wrapper.log`（原样 · `[7a-diag]` grep -c=0 亲证）· `02-run1-isolated-receipt.json`（runner receipt 原样 · sourceDigests 15 文件全 MATCH）· `03-run1-sidecar-stdout.log` · `04-run1-sidecar-ticks.jsonl`（58 行）· `05-run1-sidecar-final.json`（pollCount=55 · correlationMatch=true · pending42P01=0）· `06-run1-ndjson-capture.ndjson`（7 行全量）· `07-run1-window.txt`（UTC 窗+EXIT 原值）
- sidecar 脚本原件（零改）：`../g7fix2-postm7/sidecar-v3.mjs`（provenance 指认 · 本目录零副本零改）

## 7. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ 收口材料完备**（臂消化绿桶 · 卡死面在账）≠ G7 收官 ≠ :107 关闭 ≠ g7SuiteGreen 翻转 ≠ 产品面 finalize 契约缺陷定性（driver 契约缺口修复=使 e2e 对 generation 族终态诚实；产品面两 worker 失败族 B 端终态不对称归协调方另裁）≠ `generation_duplicate_question` 根因定谳（driver 可见级材料 · 是否 requeue/正向信号归协调方）≠ 7a 补抓能力已验证（armed 未行使）≠ 恒绿（单 run · G7TRIO 臂3 教训）· **臂回改归属登记（蓝本 §5）：产品面修复（generation 族正向信号/requeue）落地时本臂同步回改归协调方 · 卡死面显式断言=文档化非接纳** · not HA · not `releaseEvidence=true` · **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **g7SuiteGreen=false** · **actualSpendCny=null** · alone ≠ dual（post-prove 双审归协调方派）· 禁洗绿 · EXEC 不自批收官 · STOP `exec:awaiting_post_prove_dual` · 席 mw-core。
