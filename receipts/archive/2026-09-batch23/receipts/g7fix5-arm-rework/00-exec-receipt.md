# G7FIX-5 · driver 臂回改刀（G7FIX-4 产品面落地后的 e2e 契约对齐）· EXEC 收据（attempt 1 · 判别 run 1 恰 1 次 · 零重跑）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落 mw-core · 收敛式回改恰 3 处 +2/−6 · 恰 1 run `pnpm e2e:isolated` EXIT=**0** 原值（passed · 80706ms · assertionCount=74）· **四元组判读 =（terminal=assessment_unavailable · status=200 · outcome=assessment_unavailable · replayed:false[断言过] · reason=`generation_duplicate_question`）⇒ 蓝本 §2 三向之「绿全程」臂** · G7FIX-4 kind 翻转 driver 可见级亲证：bound loop 终态 `assessment_unavailable`（G7FIX-3 run 同位=`interview_unavailable`）· 统一面 200+`assessment_unavailable`+`replayed:false` 全过 · scorelessBound 统一臂全程兑现（cand `assessment_unavailable`+score NULL+retry 200/started/新 interviewId=mark-then-recover 产品面端到端亲证）· STOP awaiting post-prove dual · Ban self-approve · 判读结论附协调方）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · **r1Closed=false 仍在 SSOT（本刀非翻转·注记兑现）**

## 0. Base 与执行地

- 蓝本 = REQUEST rev2 `f3b28343`（分支 `line/g7fix5-arm-rework` · 工作树 HEAD 亲证即 `f3b28343`·`git status` clean 起刀）· 立项依据 = G7FIX-4 nail + post-dual 席2 trio 就绪度终评（臂回改=唯一 trio 阻塞）。
- 执行地：worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7fix5` · 依赖预置 `pnpm install --frozen-lockfile` EXIT=0（环境预置非代码改动）。
- 迁移面：wrapper `migrations: applied=152 skipped=0` + sidecar correlation `match=true`（`0151_pgp_sym_encrypt_grant`）——主线零迁移演进 ⇒ sidecar-v3 correlation 锚 `^0151` 零迁移照用。

## 1. Coding 面（≤8 行硬门 · diff 亲证 · 零产品码）

- `git diff --numstat` = **`2  6  e2e/full.e2e.ts`（+2/−6 · added 2 ≤ 8 ✓ · deleted 6 ≤ 8 ✓ · 变更总量 8 ≤ 8 ✓）· 恰 1 文件 · apps/packages src 零 diff（`git diff --stat -- apps packages` 空输出亲证）· helpers/wrapper/解析器/守卫零触碰**。全量逐字节见 `08-fixture.diff`。
- 处方① **:404 scorelessBound 并入**（防御性契约钉——残余 unbound 面触发仍走统一臂非落死支）：

```ts
  const scorelessBound = boundLoop.terminal === 'assessment_unavailable' || boundLoop.terminal === 'interview_unavailable'; // G7FIX-5 并入: 残余 unbound 面触发仍走统一臂(防御性契约钉)
```

- 处方② **:406-408 三元 409 臂随收敛消解 + :407 统一面补 `replayed === false`**（三元真支确已消失——`A()` 内零 ternary 零 `409` 零 `cannot_finalize` 残留亲证；replayed:false 钉=G7FIX-4 prove final3:21-22 形状 200+outcome='assessment_unavailable'+replayed:false）：

```ts
  A(r.status === 200 && finalized.applicationId === app1 && finalized.interviewId === boundInterviewId && finalized.replayed === false && finalized.outcome === (scorelessBound ? 'assessment_unavailable' : 'completed'), `[状态机] 岗位终态后 {} finalize 统一面: 200 服务端仅认已绑定 interview+replayed:false(…)`);
```

- 处方③ **原 :421-422 删 interview_unavailable 卡死 else-if 臂**（G7FIX-4 对称标记后 in_progress 卡死面结构性不可达——死支移除非掩盖；`} else {` completed 整数分面逐字保留）：
  - 删除：`} else if (boundLoop.terminal === 'interview_unavailable') { … A(cand?.status === 'in_progress' …) }`（恰 2 行 · `08-fixture.diff` 第二 hunk 亲证）。
- ④ armed 延续亲证：7a 探针 + post-M7 窗截获（a1/a2/a3/a4/a5 NDJSON 行全量在账）+ NDJSON 常驻面**全部零触碰**——`:405`(a3)/`:412`(a4)/`:418`(a5) 三行逐字保留（`08-fixture.diff` 中均为 context 行非 ± 行）。
- 预检（run 前 · 零 e2e 执行）：esbuild transformSync EXIT=0 **TRANSFORM OK**（阴性对照注入如如期 FAIL——真语法门=esbuild）· `pnpm e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6 · releaseEvidence=false）· `.tmp/e2e-consent-capture.ndjson`/`.tmp/e2e-7a-diag.ndjson`/wrapper log/sidecar 目录/receipts 目录 run 前 **ENOENT 亲证**（launch 处方含 `mkdir -p .tmp`——G7FIX-3 erratum-1 不再现）。

## 2. 判别 run（RUN 1 · 恰 1 run · attempts=1 · 零重跑兑现）

| 项 | 读数 |
| --- | --- |
| 命令 | `pnpm e2e:isolated`（worktree 内 · `MODEL_API_KEY` 经授权 loader `~/.meetwise-secrets/load-model-api-key.sh` source 进程注入 · name-only · 值零打印零落盘） |
| EXIT | **0（原值 · passed）** · UTC 窗 `2026-10-09T08:46:52Z → 08:48:14Z`（receipt durationMs=80706 · assertionCount=74） |
| receipt | `02-run1-isolated-receipt.json`：outcome=passed · exitCode=0 · releaseEvidence=false · **sourceDigests 15 文件逐一与本刀工作树 sha256 全 MATCH**（`e2e/full.e2e.ts`=`sha256:7105778e…` 亲证同符——run 执行树=本刀树） |
| 容器 | `meetwise-e2e-37461-1791535614093` on 127.0.0.1:65454（用后即焚 · 收据组立期 `docker ps -a` 零残留亲证） |
| reviewLedger | 19 行（原样在 receipt）· capability ×2（`image_ocr_unavailable`+`voice_unavailable`·无 VISION/TTS/ASR 键同先例）· `report_unavailable` ×2（主 loop + 7a failLoop）· `quiz_unavailable` · `diagnosis_ready` · 段标全绿 · **`assessment_unavailable`（boundLoop terminal）→ `seg_boundloop_terminal` → 走完全程** |
| assertionCount 位移注记（如实） | 74（G7FIX-3 收据口径 72）——运行时臂路由改变（409 臂+卡死面 → 统一面+assessment_unavailable cand 面+retry 面）· 断言面零弱化（diff 亲证）· 不作逐条算术推导宣称 |
| erratum | 无（launch 一次成功 · 零 abort 零重跑） |

### NDJSON 截获面（`.tmp/e2e-consent-capture.ndjson` 全量 8 行 · bootId=38048 · 原文在 `06-run1-ndjson-capture.ndjson`）

```json
{"bootId":38048,"step":"postm7_a1_loop","questions":2,"turns":3,"terminal":"assessment_unavailable"}
{"bootId":38048,"step":"postm7_a2_provenance","trustedBSideScore":null,"identities":3,"questions":2,"clarifications":1}
{"bootId":38048,"step":"postm7_a3_finalize","status":200,"outcome":"assessment_unavailable","terminal":"assessment_unavailable","scorelessBound":true,"reason":"generation_duplicate_question"}
{"bootId":38048,"step":"postm7_a4_cand","candStatus":"assessment_unavailable","score":null,"scorelessBound":true}
{"bootId":38048,"step":"postm7_a5_retry","retryStatus":200,"retriedStatus":"started","newInterviewId":true}
```

- **统一面四元组兑现**：status=200 + outcome=`assessment_unavailable` + `replayed:false`（断言过=EXIT=0 必要条件）+ terminal=`assessment_unavailable`——与 G7FIX-4 prove final3:21-22 钉死形状逐键一致。
- **恢复通路亲证**：a5 retry 200/`started`/新 interviewId（G7FIX-4 mark-then-recover 单触点端到端可达——G7FIX-3 时代 `recruiter.ts:385 binding_invalid` 死路面已消除）。
- **归因通道延续**：reason=`generation_duplicate_question`（`generation_*` 前缀 ⇒ generation 族亲证非 abandoned sweep——与 G7FIX-3 同因同面·根因定谳仍归协调方）。

## 3. sidecar v3 实测臂（`../g7fix2-postm7/sidecar-v3.mjs` 原样复用零改 · 逐 run 目录清零隔离）

| 纪律条 | RUN 1 |
| --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 锚（08:47:02Z · container `…37461…:65454`） |
| ② 42P01 pending 窗 | 0 tick |
| ③ 停针计数器仅 post-first-ok 武装 | ✓ 持械 · STOP 哨兵先收口（orchestrator 落哨兵 · 非 stop-needle 触发） |
| ④ v3 策略落文字 | `g7fix2-postm7/sidecar-v3.mjs` 原样（本刀零副本零改 · provenance 指认） |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 逐 ok tick 双读（pollCount=59 · `fallbackUsed=false`）· SELECT-only 聚合零行内容零 PII |
| correlation（152 + `/^0151(_|$)/` 剥 `.sql` 归一） | ✓ match=true（`0151_pgp_sym_encrypt_grant`） |

- **双计读数（succeeded+failed · dispatching=1 不计入 · teardown 撕裂下限界沿 G7Y E-2）**：RUN 1 = **21**（16 succeeded + 5 failed · 末 ok tick `08:48:14.085Z` 原行：`dispatching|1, failed|5, succeeded|16`）· interview_job `done|14 max attempts=1 + running|1`（撕裂 ±1）· **est ≤25/run ✓ 含 boundLoop 全程**。
- **聚合级交叉证（与 G7P-6/G7FIX-3 同形再现）**：**failed inv=5 vs interview_job failed=0**（done=14 · attempts 全 1）——模型外发失败全部被吸收为 done 终态（优雅 fail-closed 形状不变）。
- **链累计 = 145（G7FIX-3 收据口径）+ 21 = 166 ≤ 硬帽 200 ✓**（余量 34）。

## 4. 判读（蓝本 §2 三向 · 附协调方 · Ban self-approve）

1. **三向落桶 = 「绿全程」**：EXIT=0 · 74 断言全过 · 统一面 200+`assessment_unavailable`+`replayed:false` 兑现 · scorelessBound 臂（cand+retry）全程走通 ⇒ 按蓝本 §2：**CMD1 收口材料完备 + `:107` 材料进一步 + trio 全景重跑就绪**。
2. **G7FIX-4 kind 翻转 driver 可见级亲证**：bound generation 族终态 SSE kind = `assessment_unavailable`（NDJSON a1 原行）· G7FIX-3 run 同位为 `interview_unavailable`（其收据 a1 原行）——REQUEST rev2 席2 臂靶纠正的前提事实获 driver 落材料坐实；防御性 `|| interview_unavailable` 并入本 run 未行使（残余 unbound 面=防御钉保持 armed）。
3. **单 run 绿形限定语沿用 G7TRIO 臂3 教训：不作恒绿宣称**；本绿 ≠ G7 收官 ≠ :107 关闭 ≠ g7SuiteGreen 翻转（=trio 全景后 SSOT 刀归协调方）。
4. **修法面自评**：三处处方均按蓝本 rev2 落地，无一处放宽既有门（provenance 门/`completed` 整数分面/NDJSON 常驻面零触碰·diff 亲证）；409 死支消解=对产品面已落事实的契约对齐非掩盖（死支移除后该面无断言真空——统一臂同窗覆盖）。
5. **armed 延续**：`[7a-diag]` grep -c=0（探针 armed 未行使）· 7a NDJSON ABSENT 亲证 · invokeError/last_error 材料通道保持 armed。

## 5. 预算与卫生

- est/链：RUN 1 实测 dual-count 21 ≤ 25 ✓ · **链累计 = 145 + 21 = 166 ≤ 硬帽 200 ✓**（余量 34）· `actualSpendCny=null`（无计价数据源 · Ban invented spend）。
- Key 卫生：只经授权 loader 进程 env · name-only 记账 · 值零打印零入库零入 log · `.env*` ABSENT。
- 环境注记（如实）：launch 前存在异席历史容器 `meetwise-e2e-62497-cold2-stop-band-1-…`（Exited 43h · 命名与 pid 均非本 run · 未触碰未清除·同先例披露）；本机无 OCR/VISION 键与 TTS/ASR 键 ⇒ capability 码 `image_ocr_unavailable`+`voice_unavailable` 显式在 ledger。
- Ban 复核：判别 run attempts=1 · 零调序 · 零产品码（apps/packages src 零 diff 亲证）· helpers/wrapper/解析器/守卫零触碰 · 零 force-push · sidecar 原样复用零改 · tracked 树变更 = `e2e/full.e2e.ts`(+2/−6) + 本 harness 注记 + 收据目录（交付文档非产品码）。

## 6. 证据附件（本目录）

- `00-exec-receipt.md`（本文）
- RUN 1：`01-run1-wrapper.log`（原样 · `[7a-diag]` grep -c=0 亲证）· `02-run1-isolated-receipt.json`（runner receipt 原样 · sourceDigests 15 文件全 MATCH）· `03-run1-sidecar-stdout.log` · `04-run1-sidecar-ticks.jsonl`（62 行）· `05-run1-sidecar-final.json`（pollCount=59 · correlationMatch=true · pending42P01=0）· `06-run1-ndjson-capture.ndjson`（8 行全量）· `07-run1-window.txt`（UTC 窗+EXIT 原值）· `08-fixture.diff`（e2e/full.e2e.ts 全量 diff +2/−6 亲证）
- sidecar 脚本原件（零改）：`../g7fix2-postm7/sidecar-v3.mjs`（provenance 指认 · 本目录零副本零改）

## 7. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ G7 收官** ≠ `:107` 关闭 ≠ g7SuiteGreen 翻转（g7SuiteGreen=false 零翻转·trio 全景重跑=下一步归协调方）≠ `generation_duplicate_question` 根因定谳（与 G7FIX-3 同因同面再现·是否 requeue/正向信号归协调方）≠ 恒绿（单 run · G7TRIO 臂3 教训）≠ RAG 迁移 ≠ HA ≠ `releaseEvidence=true` ≠ interview_unavailable 残余 unbound 面已验证（防御钉 armed 未行使）· **r1Closed=false 仍在 SSOT（本刀非翻转·仅注记）** · not HA · not `releaseEvidence=true` · **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **g7SuiteGreen=false** · **actualSpendCny=null** · alone ≠ dual（post-prove 双审归协调方派）· 禁洗绿 · EXEC 不自批收官 · STOP `exec:awaiting_post_prove_dual` · 席 mw-core。
