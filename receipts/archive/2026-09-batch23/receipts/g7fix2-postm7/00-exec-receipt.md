# G7FIX-2 · post-M7 窗截获 + :388 孪生同步复合刀 · EXEC 收据（单 attempt）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落：:388 孪生同步一行 + 五断言逐断言前 NDJSON 截获 6 插 + sidecar v3 correlation 修复版 · 判读 run 恰 1 次 **EXIT=0 全程绿** · 预注册三向判读命中**臂 1（:388 修复后绿全程）** · trio 全景 + `:107` 收口材料候选归协调方裁 · STOP awaiting post-prove dual · Ban self-approve）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 与执行地

- 蓝本 = REQUEST `538b42fe`（worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7fix2` · 分支 `line/g7-postm7`）· harness = `ai-docs/delivery/harness/g7fix2-postm7.md`（draft:awaiting_pre_exec_dual → 本刀推进 exec:awaiting_post_prove_dual）· 双席预审 BOTH PASS 处方并入授权。
- EXEC HEAD = 蓝本 commit（工作树仅本刀 diff · `git status` 亲证：仅 `e2e/full.e2e.ts` M + 新收据目录 `??`）。
- 环境前置（非代码面）：fresh worktree `node_modules` 缺席 → `pnpm install --frozen-lockfile` 补齐（3.9s）。run 前 host 观测：仅长命 `meetwise-e2e-godfn1c-35997`（UI 面 pg）+ `meetwise-postgres-dev`（dev 面）——本 run 容器名 `meetwise-e2e-82186-1791486296707` pid+ts 自证归属 hermetic。

## 1. Coding 面（≤15 行硬门 · 亲证）

- 恰 1 文件 `e2e/full.e2e.ts` · `git diff --numstat` = **+8/−2（churn 合 10 行 · ≤15 达标）**：6 行净插入（1 marker + 5 NDJSON 截获）+ 2 行原位改（:388 断言行 + label 行）· `git status` 仅此一文件（apps/packages 零 diff · helpers/wrapper/解析器/守卫脚本零触碰）。
- ① **:388 孪生同步（席2 新证 · 一行语义）**：`boundLoop.provenance.identities.length === boundLoop.questions` → `=== boundLoop.questions + boundLoop.clarifications`——沿 1789e321 mainLoop :206 已修形态（C-MO-P3 语义纠先例域内 · 非「为绿改断言」：构造级恒等证明=helpers :210-211 `identities.push` 于 `question_ready || clarification_needed` 双 kind · :311 `questions++` / :342 `clarifications++` 同 seq · `boundLoop.clarifications` 在返回面 :376）· **反伪造零弱化**：`trustedBSideScore===null` 结构、`rejectForgedProgressScores`、progress 携 identity 即抛（helpers :207）全部原样。
- ② **post-M7 窗逐断言 NDJSON 截获（席1 勘误坐标 :387-:405 · 五断言每条断言前插记录）**：`postm7_a1_loop`（:387 前）/`postm7_a2_provenance`（:388 前）/`postm7_a3_finalize`（:393 前）/`postm7_a4_cand`（:400 前·置于 `if (scorelessBound)` 之前——守卫 `scoreless_bound_null_score` 钉 `if{` 紧跟 `A(` 形态·守卫零触碰·捕获同值判读力等价且 completed 分支亦留证）/`postm7_a5_retry`（:404 前）·G7P-4/5 常驻 NDJSON 模式 · `fs`/`bootId` 自 :35 复用。
- ③ marker：`[g7fix2] post-M7 window armed` console.log 一行（M7 后窗前）。
- 预检（run 前 · 零 e2e 执行）：esbuild transform EXIT=0 + `node --check`（transformed JS）EXIT=0（**G7P-5 erratum-1 真门兑现**：node --check 对 .ts 空转·先 transform 后 check）· `e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）· `.tmp/e2e-consent-capture.ndjson` + `.tmp/g7fix2-wrapper.log` run 前 ENOENT 亲证。
- 守卫插曲如实登记：首插将 a4 截获行置 `if (scorelessBound) {` 之后 → 守卫 `scoreless_bound_null_score` 红（其 required 正则钉 `if{A(` 相邻形态）——**守卫脚本零触碰**（禁松门兑现）· 修复=截获行移至 `if` 前（语义等价）· 复检三命题（transform/node --check/guards）全 EXIT=0 后方才开跑。

## 2. 判读 run（恰 1 次 · 原值 · Ban retry-to-green 兑现 · 本次为绿无需援引）

| 项 | 读数 |
| --- | --- |
| 命令 | `pnpm e2e:isolated`（worktree 内 · `MODEL_API_KEY` 经授权 loader source 进程注入） |
| EXIT | **0（原值）** · `E2E_ISOLATED_EXIT=0` · WALL=76s |
| receipt | `.tmp/e2e-receipts/2026-10-08T19-06-12-513Z-82186-5a76f1cf-b817-432d-b731-3b71c00c5aad.json`：outcome=**passed** · durationMs=**75804** · assertionCount=**75** |
| 容器 | `meetwise-e2e-82186-1791486296707` on 127.0.0.1:49887（migrations applied=152 skipped=0 · 随 run 拆除 · post-run `docker ps` 零本 run 残留亲证） |
| sourceDigests | `e2e/full.e2e.ts`=`sha256:c74cecd3588cd20f477d36285c9aea28fdcbdd8172111d222b3eb8c083277339`（=工作区 shasum 亲证） |
| reviewLedger | 19 codes 末位 `seg_boundloop_terminal`（M7）· green run 全 ledger 在 stdout 结构化 summary 面（`E2E_REVIEW_CODES`） |

### NDJSON 截获记录（亲读转录 · 全量恰 8 行 · bootId=82676 一致 · run 前 unlink 亲证）

```json
{"bootId":82674,"step":"consent","status":200,"elapsed_ms":12,"body":"{\"recorded\":true,\"policyVersion\":\"v1\"}"}
{"bootId":82674,"step":"app_start","status":200,"elapsed_ms":17,"body":"{\"applicationId\":\"app_01a11ce86e0674cd92169662af3aab92\",\"status\":\"started\",\"interviewId\":\"iv_01a11ce87df573d486e11274541cd6e0\",\"redirectTo\":\"/interview/iv_01a11ce87df573d486e11274541cd6e0?applicationI"}
{"bootId":82674,"step":"app_start_reid","status":200,"elapsed_ms":5,"body":"{\"applicationId\":\"app_01a11ce86e0674cd92169662af3aab92\",\"status\":\"reused\",\"interviewId\":\"iv_01a11ce87df573d486e11274541cd6e0\",\"redirectTo\":\"/interview/iv_01a11ce87df573d486e11274541cd6e0?applicationId"}
{"bootId":82674,"step":"postm7_a1_loop","questions":2,"turns":4,"terminal":"assessment_unavailable"}
{"bootId":82674,"step":"postm7_a2_provenance","trustedBSideScore":null,"identities":4,"questions":2,"clarifications":2}
{"bootId":82674,"step":"postm7_a3_finalize","status":200,"outcome":"assessment_unavailable","terminal":"assessment_unavailable","scorelessBound":true}
{"bootId":82674,"step":"postm7_a4_cand","candStatus":"assessment_unavailable","score":null,"scorelessBound":true}
{"bootId":82674,"step":"postm7_a5_retry","retryStatus":200,"retriedStatus":"started","newInterviewId":true}
```

- **`postm7_a2_provenance` 即席2 算术的在 vivo 定谳**：identities=**4** vs questions=**2** + clarifications=**2** ⇒ 4===2+2 绿；旧形态 `4===questions(2)` **恒 False 构造级证明在卷**——boundLoop 本 run 实发 2 次澄清（无澄清 run 不触此缺陷，恰解释 G7FIX-1 之前历次红的偶发性）。
- 五断言窗逐面读数：:387 loop 面（2 题/4 答/assessment_unavailable）· :388 出处（trustedBSideScore=null·q+c 恒等）· :393 finalize（200·outcome=assessment_unavailable·scorelessBound=true）· :400 可信无分（candStatus=assessment_unavailable·score=null·**零 0 分伪造**）· :404 显式重试（200·started·新 interviewId）——**五断言全绿·无任何窗内红·无窗前红**。
- 无 thrown 行（零 fetch 抛面）· bootId=82674=本 run driver 进程 pid。

### 裸 stdout 死信四证（沿 G7P-4/G7P-5/G7FIX-1）

wrapper run-log 19 行零 `[g7fix2]` marker 行与零 `✓ E2E 全栈跑通` 行（driver 裸 stdout 从不回显；run 绿时 runner 结构化 summary 面 `E2E_FINAL_SUMMARY`/`E2E_REVIEW_CODES` 正常在卷）——NDJSON 面为唯一可靠截获面第四次实证；本刀五断言判别数据全量自 NDJSON 归档，marker 死信无判读损失（如实注记）。

## 3. sidecar v3 实测臂（correlation 修复版 · 双臂俱全 · 与 G7FIX-1 自弃缺陷对照）

- ①post-migrate 锚达成（`E2E_POSTGRES_READY label=post-migrate` 触发·Ban container_found 锚兑现）②容器精确绑定 `meetwise-e2e-82186-1791486296707:49887`（纪律轴零触碰）③零 42P01 tick ④**correlation match=true——家族首次**：`migrations=152` + 实测 `max=0151_pgp_sym_encrypt_grant`（raw 同）对锚定形态 `/^0151(_|$)/` 命中（G7FIX-1 自弃同值 `0151_pgp_sym_encrypt_grant` 修复定谳在卷·剥 `.sql` 归一+锚定前缀·伪靶 `01510_*`/`0142_*`/`none` 拒绝由 run 前 8 案谓词验证背书）⑤58 poll tick 全 class=ok（interview_job/ai_model_invocation 双面逐 tick 投影·fallback 未用·stop-needle post-first-ok 持械未触发·orchestrator STOP sentinel 收口）。
- **live est 实测记账（N 不再为 null）**：窗内 `ai_model_invocation` 终读 failed=5 + succeeded=16 ⇒ **N=21 ≤ 25 达标**（本 run 实测·链账起算 0+0+14+21=**35 ≤ 硬帽 200**）；`interview_job` 终读 done=16 max attempts=1。aggregates-only 零行内容零 PII 兑现。
- g7fix1 收据零改：修复版以新工件 `sidecar-v3.mjs` 落本目录（`git status` g7fix1-route-wait 目录零 diff 亲证）。

## 4. 三向判读（预注册 · 如实）

- **命中臂 1：:388 修复后绿全程**（EXIT=0·75 断言·五断言窗全绿·NDJSON a1-a5 逐面读数无异常）——G7 旅程 CMD1 首绿在望；**trio 全景再跑与 `:107` 收口材料完备性裁权归协调方**（EXEC 不自批收官·Non-claims 全文有效）。
- 臂 2（红于其他候选）未命中——capture 无需甄别异常；臂 3（窗内红且无 capture 异常 / 窗前红具名）未命中——无窗内红·无窗前红。
- 席2 advisory 兑现落字：**else 面 :407-:408 显式分支本 run 未执行**（scorelessBound=true 路径·completed+服务端推导分面本刀零处置·留另刀域）；若未来 completed 分支红，其不在本截获窗（:387-:405）内，a4_cand 行仍会留 cand status/score 读数作甄别材料。

## 5. Key 卫生

`MODEL_API_KEY` 只经授权 loader（`~/.meetwise-secrets/load-model-api-key.sh` source · 进程环境注入 · pre-flight 亲验 present）· 收据/日志/ticks 全 name-only（`MODEL_API_KEY=present(name-only,via-loader)`）· 零键值零 fingerprint 入任何 artifact · `.env*` ABSENT（未创建）。

## 6. 证据附件（本目录）

- `00-exec-receipt.md`（本文）· `01-run-log.txt`（wrapper 日志 19 行原样）· `02-ticks.jsonl`（sidecar 61 行原样：container/anchor/correlation + 58 poll）· `03-isolated-receipt.json`（runner receipt 原样）· `04-consent-capture.ndjson`（NDJSON 8 行原样）· `05-sidecar-stdout.log`（sidecar stdout 6 行原样）· `06-sidecar-final.json`（sidecar 终态 pollCount=58·correlationMatch=true）· `sidecar-v3.mjs`（修复版新工件·correlation 面仅改·容器绑定纪律轴零触碰·provenance 注记在文内）。

## 7. Non-claims

本绿 = 本 run 单次全绿（恰 1 run 纪律·无重跑）· **not trio 全景**（trio 再跑裁权归协调方）· **not G7 收官 ≠ g7SuiteGreen 翻转 ≠ `:107` 关闭**（SSOT 刀归协调方）· :388 坐实材料完备性 = 席2 机制证据 + 本 run 算术在卷，**修复生效定谳 not 自批**（归 post-prove 双审）· est ≤25 = 本 run 实测 21（非外推）· not covered · not HA · not releaseEvidence · else 面 :407-:408 零处置零声称 · alone ≠ dual
