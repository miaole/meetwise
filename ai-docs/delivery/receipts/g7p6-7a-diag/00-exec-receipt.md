# G7P-6 · 7a 间歇定靶刀（fail-interview last_error 一次定谳）· EXEC 收据（attempt 1·run 1/3·首红即收）

status: **`exec:awaiting_post_prove_dual`**（EXEC 已落 mw-core · 7a 兜底段插针 +9/−0 · 判别 run 恰 1 次 `pnpm e2e:isolated` EXIT=**1** 原值 class=api 82901ms · **红面 ≠ 补抓面如实登记：红于 bound-loop finalize 面（`postm7_a3_finalize` status=409 · terminal=interview_unavailable · scorelessBound=false），7a 兜底段本 run 绿（failLoop terminal=report_unavailable ×2）⇒ 补抓探针未触发 ⇒ last_error/reason/invoke_error 定谳材料缺席**（REQUEST §2 判读谱分桶不可定谳·禁伪称）· 聚合级交叉证：sidecar dual-count **inv failed=5 vs interview_job failed=0**（done=13 attempts 全 1）——与 rev3 主候选「优雅 fail-closed 写 NO last_error·job=done/NULL」形状一致，唯逐事件材料（reason/invoke_error）随容器用后即焚不可采 · 首红即收兑现：run 预算 1/3 行使·余量弃用 · STOP awaiting post-prove dual · post-prove 双审归协调方派 · Ban self-approve · 定谳结论三向事实附协调方）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null

## 0. Base 与执行地

- 蓝本 = REQUEST rev3（分支 `line/g7-7a-diag` · **rebase 兑现**：EXEC 前 `git rebase a3378de5` 成功零冲突——REQUEST 三 commit 重放为 `de64e65a`→`9b95d1a7`→`c3df249e`，EXEC 工作树 = `c3df249e` + 本刀 9 行未提交改动（sourceDigests 自证）· 主线 tip `a3378de5`（含 G7FIX 系与 egress 系）在基亲证）。
- **行锚亲测重列（rebase 后）**：7a 兜底段锚 `:239`（`if (failLoop.terminal) reviews.recordTerminal(failLoop.terminal);`）/`:240`（`A(failLoop.terminal === 'report_unavailable' …`）在含主线 tip 的树上**原样成立**（EGress/G7FIX 系落点均在 7a 之后 face 或无关文件）——插针落 `:239` 与 `:240` 之间，授权面兑现。
- 执行地：worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7p6`（= meetwise-line-g7p6 分支 `line/g7-7a-diag`）· 依赖预置 `pnpm install --frozen-lockfile` EXIT=0（5.1s · 环境预置非代码改动）。
- 迁移面：receipt `schemaMigrationManifest count=152 latest=0151_pgp_sym_encrypt_grant.sql` + sidecar correlation `match=true` 双证 —— **主线零迁移演进 ⇒ sidecar-v3 correlation 锚 `^0151` 零迁移照用**。

## 1. Coding 面（≤10 行硬门 · diff 亲证）

- `git diff --numstat` = **`9  0  e2e/full.e2e.ts`（+9/−0 ≤ 10 ✓）· 恰 1 文件 · apps/packages src 零 diff（`git diff --stat -- apps packages` 空输出亲证）· helpers/wrapper/解析器/守卫零触碰**。
- 插针（逐字 · `:239` 后 `:240` 前 · 整体 try/catch diag_failed 防自伤 · G7FIX-1 同 `createRequire` pg 契约复用〔`:344` 形态：`createRequire(new URL('../packages/db/package.json', import.meta.url))('pg')` + PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE 隔离 runner env 契约〕）：

```ts
if (failLoop.terminal === 'interview_unavailable') { try { // G7P-6 7a 定靶: 红时 exit 前补抓 last_error/reason/invoke_error 一次定谳(G7FIX-1 同 createRequire pg 契约·零产品码)
  const { createRequire } = await import('node:module');
  const { Client } = createRequire(new URL('../packages/db/package.json', import.meta.url))('pg');
  const pgc = new Client({ host: process.env.PGHOST, port: Number(process.env.PGPORT), user: process.env.PGUSER, password: process.env.PGPASSWORD, database: process.env.PGDATABASE, ssl: false, connectionTimeoutMillis: 2000 });
  await pgc.connect();
  const jobs = await pgc.query(`SELECT status, attempts, last_error FROM interview_job WHERE interview_id=$1 ORDER BY seq DESC`, [failIv]);
  const evs = await pgc.query(`SELECT kind, payload->>'reason' AS reason, payload->'provenance'->>'invokeError' AS invoke_error FROM interview_event WHERE stream_key=$1 ORDER BY seq DESC LIMIT 5`, [failIv]);
  for (const row of [...jobs.rows.map((j: any) => ({ face: 'interview_job', ...j })), ...evs.rows.map((v: any) => ({ face: 'interview_event', ...v }))]) { const line = JSON.stringify({ bootId, step: '7a_diag', terminal: failLoop.terminal, interviewId: failIv, ...row }); fs.appendFileSync('.tmp/e2e-7a-diag.ndjson', line + '\n'); console.log('[7a-diag]', line); }
  await pgc.end().catch(() => {}); } catch (de: any) { const line = JSON.stringify({ bootId, step: '7a_diag', diag_failed: `${de?.name}/${de?.code}/${String(de?.message ?? '').slice(0, 200)}` }); try { fs.appendFileSync('.tmp/e2e-7a-diag.ndjson', line + '\n'); } catch { /* 防自伤: 补抓自身异常不改写红面 class */ } console.error('[7a-diag]', line); } }
```

- 两查询**逐字照抄蓝本**（REQUEST rev2 席1 处方 stream_key/reason 键 + ORDER BY + rev3 provenance.invokeError 通道）· schema 亲证：`interview_job(interview_id,seq,status,attempts,last_error)` 与 `interview_event(stream_key,seq,kind,payload)` 列全在（`packages/db/migrations/0001_baseline.sql:253-267/:38-46`）· `stream_key=interviewId` 惯例亲证（`packages/db/src/recruiter.ts:298` `q.interview_id=e.stream_key`）。
- 语义保真：探针仅在 `terminal === 'interview_unavailable'`（红）时行使；绿 run 零触碰零开销（本 run 实证：`[7a-diag]` 在 wrapper log grep -c=**0**）· catch 面落 `diag_failed` 后**不 rethrow**，落 A() 原断言维持原红面 class（防自伤兑现·未行使）· `fs`/`bootId` 全自 `:35` consent 面复用（零新 import）· NDJSON 常驻面 `.tmp/e2e-7a-diag.ndjson`（`.tmp/` gitignored `:15` · run 前 ENOENT 亲证）+ stdout 双面。
- 预检（run 前 · 零 e2e 执行）：esbuild transformSync EXIT=0 **TRANSFORM OK**（erratum-1 沿 G7P-5：`node --check` 对 .ts 系空转·阴性对照注入 `readJson(r;;` 如期 FAIL——真语法门=esbuild）· `pnpm e2e-static-guards:check` EXIT=0（runners=6 helpers=20 flags=9 aiPaths=6）· `.tmp/e2e-7a-diag.ndjson` run 前 ENOENT 亲证 · sidecar 目录清零。
- 本刀红线亲证：**红未现于 7a ⇒ 探针未触发 ⇒ 本刀 9 行在本 run 为「armed 未行使」态——armed 状态本身即交付（后续任一 run 红于 7a 时自动补抓）**。

## 2. 判别 run（RUN 1 · 首红即收 · attempts=1 · 禁重跑兑现）

| 项 | 读数 |
| --- | --- |
| 命令 | `pnpm e2e:isolated`（worktree 内 · `MODEL_API_KEY` 经授权 loader `~/.meetwise-secrets/load-model-api-key.sh` source 进程注入 · name-only · 值零打印零落盘） |
| EXIT | **1（原值 · retained）** · UTC 窗 start 02:50:00Z → end 02:51:24Z（84s · receipt durationMs=82901） |
| receipt | `02-run1-isolated-receipt.json`：outcome=failed · failureClass=**api** · assertionCount=null（红 run 无成功 summary · 正常形状）· sourceDigests `e2e/full.e2e.ts`=`sha256:ad071f26…`（=本刀树工作区 sha256 亲证同符 · 其余 14 文件 MATCH） |
| 容器 | `meetwise-e2e-72755-1791514201169` on 127.0.0.1:50733（用后即焚 · 收据组立期 `docker ps -a` 零残留亲证） |
| reviewLedger | 19 行（原样在 receipt）· `:2-3` = `report_unavailable` ×2（主 loop + **7a failLoop 双绿**）· 末三位 `interview_unavailable`(worker) → `seg_boundloop_terminal` → **止于此** |
| 失败点 | `:406-408` finalize 断言（默认 class=api · 与 failureClass=api 自洽）——NDJSON `postm7_a3_finalize` 原行亲读：`{"bootId":73304,"step":"postm7_a3_finalize","status":409,"terminal":"interview_unavailable","scorelessBound":false}` |

### NDJSON 截获面（`.tmp/e2e-consent-capture.ndjson` 全量 6 行 · bootId=73304 · G7FIX-2 post-M7 窗既有面）

```json
{"bootId":73304,"step":"consent","status":200,"elapsed_ms":15,"body":"{\"recorded\":true,\"policyVersion\":\"v1\"}"}
{"bootId":73304,"step":"app_start","status":200,"elapsed_ms":38,"body":"…started…interviewId=iv_01a11e9271b471f69e60652ada245f75…"}
{"bootId":73304,"step":"app_start_reid","status":200,"elapsed_ms":7,"body":"…reused 同 interviewId…"}
{"bootId":73304,"step":"postm7_a1_loop","questions":1,"turns":2,"terminal":"interview_unavailable"}
{"bootId":73304,"step":"postm7_a2_provenance","trustedBSideScore":null,"identities":2,"questions":1,"clarifications":1}
{"bootId":73304,"step":"postm7_a3_finalize","status":409,"terminal":"interview_unavailable","scorelessBound":false}
```

（第 2/3 行 body 中段截略仅为本收据排版·全原文在 `06-run1-ndjson-capture.ndjson`）

### 首红即收处置（预注册兑现）

- **RUN 1 = 红 ⇒ 收 · run 预算 1/3 · 余 2 run 弃用**（「至多 3 run 内 1 红即收」字面兑现 · 非红面不符即续跑的自行扩权被禁——续跑 hunting 预注册红面属选择偏差同族）· attempts=1 · 零 retry-to-green · 零第二次 run 通道。
- **红面 ≠ 补抓面如实登记**：授权补抓条件 = 7a 兜底段 `terminal=interview_unavailable`；本 run 7a 双绿（failLoop=report_unavailable）⇒ 探针 armed 未行使 ⇒ **last_error/reason/invoke_error 三通道定谳材料缺席**——REQUEST §2 判读谱分桶（generation_*/resume_reference/fence/role_route/其他）**本 run 不可定谳，禁伪称任一分桶**。
- bound-loop 面证据仅存：terminal 形状（interview_unavailable · 1 题 2 答 1 澄清后）+ 聚合读数（§3）——逐事件材料随容器用后即焚不可补采（单 attempt 纪律禁重跑）。

## 3. sidecar v3 实测臂（`../g7fix2-postm7/sidecar-v3.mjs` 原样复用零改 · 逐 run 目录清零隔离）

| 纪律条 | RUN 1 |
| --- | --- |
| ① post-migrate 锚（Ban container_found 锚） | ✓ 1 锚（02:50:13Z · container `…72755…:50733`） |
| ② 42P01 pending 窗 | 0 tick |
| ③ 停针计数器仅 post-first-ok 武装 | ✓ 持械 · STOP 哨兵先收口（wrapper 退出后 orchestrator 落哨兵 · 非 stop-needle 触发 · 末 tick teardown `container is not running` 1 次后即收） |
| ④ v3 策略落文字 | `g7fix2-postm7/sidecar-v3.mjs` 原样（本刀零副本零改 · provenance 指认） |
| ⑤ 必读面 interview_job + ai_model_invocation | ✓ 逐 ok tick 双读（pollCount=58 · ok 57）· `fallbackUsed=false` · SELECT-only 聚合零行内容零 PII |
| correlation（152 + `/^0151(_|$)/` 剥 `.sql` 归一） | ✓ match=true（`0151_pgp_sym_encrypt_grant`） |

- **双计读数（succeeded+failed · dispatching=1 不计入 · teardown 撕裂下限界沿 G7Y E-2）**：RUN 1 = **19**（14 succeeded + 5 failed · 末 ok tick `02:51:22.616Z` 原行：`dispatching|1, failed|5, succeeded|14`）· interview_job `done|13 max attempts=1 + running|1`（撕裂 ±1）· **est ≤25/run ✓**。
- **聚合级交叉证（rev3 主候选支持·非逐事件证明·如实分级）**：本 run **模型外发 failed=5 而 interview_job failed=0**（done=13 · attempts 全 1）——5 次模型调用失败全部被**吸收为 done 终态**、零 job 写 failed/last_error ⇒ 与 rev3 处方①「主候选优雅 fail-closed：invoke 失败收编为 {error} 结果 → job=done/last_error=NULL，定谳材料只在事件 payload」的**聚合形状一致**；但 reason/invoke_error 逐事件值不可采（探针面未触发 + 容器即焚）⇒ **假设支持级证据，非定谳级**。

## 4. 判读（三向事实 · 附协调方裁决 · Ban self-approve）

1. **REQUEST §2 判读谱**：**不可定谳**（红面≠补抓面 · 三通道材料缺席如实登记 · 禁向任一分桶归属）。谱的适用材料待未来 armed run 红于 7a 时自动补抓兑现。
2. **聚合级（sidecar）**：generation 瞬时错误被优雅 fail-closed 吸收的形状支持（failed inv=5 vs failed jobs=0）——与 rev3 主候选方向一致，唯非逐事件级。
3. **新域读数（升级协调方 · EXEC 不自裁）**：bound-loop 面 `interview_unavailable` 终态后 `finalize → 409`（`scorelessBound` 仅白名单 `assessment_unavailable` · `:404`——driver 对 interview_unavailable 终态期待 200/completed，服务端 409 拒）——**driver-vs-server 终态契约 skew 候选**，与 7a 面（report_unavailable+quarantined 自洽）不同域。G7 车道间歇不稳定面图增量：G7TRIO CMD1（start 面早死）→ 本 run（bound-loop interview_unavailable + finalize 409）→ **均非 7a 面**；7a 探针保持 armed。
4. **transient requeue 评估意见（REQUEST §1 附评估项 · 不落码）**：本 run failed inv=5 全部一击收编 done、attempts 全 1——一击终态结构性放大概率仍在（若逐事件材料日后证实 generation_* 族，job 级有界 requeue+退避可把瞬时模型错转为最终成功或诚实重试；requeue 语义属产品面归协调方另裁）；同时 finalize 409 面提示终态契约需先行定谳（requeue 改变到达终态的分布，不改变终态契约 skew 本身）。
5. **7a 兜底段本 run 绿形亲证**：failLoop=report_unavailable ×2 + quarantined 断言过——G7FIX-1 route-wait 后 7a 面在含主线 tip 树上健康（单 run 限定语沿用 G7TRIO 臂3 教训：单绿不作恒绿宣称）。

## 5. 预算与卫生

- est/链：RUN 1 实测 dual-count 19 ≤ 25 ✓ · **链累计 = 107（G7TRIO 收据口径）+ 19 = 126 ≤ 硬帽 200 ✓**（余量 74 · 本刀弃用不消耗——首红即收）· `actualSpendCny=null`（无计价数据源 · Ban invented spend）。
- Key 卫生：只经授权 loader 进程 env · name-only 记账 · 值零打印零入库零入 log · `.env*` ABSENT。
- 环境注记（如实）：launch 前存在异席并发容器 `meetwise-e2e-godfn1c-35997` Up 9h（命名与 pid 均非本 run · 未触碰未清除·G7P-5 同形披露）；本机无 OCR/VISION 键与 TTS/ASR 键 ⇒ capability 码 `image_ocr_unavailable`+`voice_unavailable` 显式在 ledger（先例 g7-key-x3 同源）。
- Ban 复核：零 retry-to-green（attempts=1）· 零调序 · 零产品码（apps/packages src 零 diff 亲证）· helpers/wrapper/解析器/守卫零触碰 · 零 force-push · sidecar 原样复用零改 · tracked 树变更 = e2e/full.e2e.ts(+9/−0) + 本 harness 注记 + 收据目录（交付文档非产品码）。

## 6. 证据附件（本目录）

- `00-exec-receipt.md`（本文）
- RUN 1：`01-run1-wrapper.log`（19 行原样 · `[7a-diag]` grep -c=0 亲证）· `02-run1-isolated-receipt.json`（runner receipt 原样 · sourceDigests 15 文件）· `03-run1-sidecar-stdout.log` · `04-run1-sidecar-ticks.jsonl`（61 行）· `05-run1-sidecar-final.json`（pollCount=58 · correlationMatch=true）· `06-run1-ndjson-capture.ndjson`（6 行全量）· `07-run1-window.txt`（UTC 窗+EXIT 原值）
- sidecar 脚本原件（零改）：`../g7fix2-postm7/sidecar-v3.mjs`（provenance 指认 · 本目录零副本零改 · trio 同例）

## 7. Non-claims（逐条 · 本收据不宣称）

本收据 **≠ 7a 间歇定谳**（红面≠补抓面 · 判读谱未行使）≠ 任一判读谱分桶归属 ≠ finalize 409 根因定谳（新域读数·裁决归协调方）≠ 修复 ≠ requeue 语义决定（评估意见不落码）≠ 7A-DOWNGRADE 关行 ≠ trio 收官 ≠ 7a 恒绿（单 run 绿形·G7TRIO 臂3 教训沿用）· armed 探针 ≠ 已验证的补抓能力（未行使·零 diag 行·其正确性止于静态门+schema 亲证+绿 run 零扰实证）· not HA · not `releaseEvidence=true` · **Pins 十值零翻转**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **g7SuiteGreen=false** · **actualSpendCny=null** · alone ≠ dual（post-prove 双审归协调方派）· 禁洗红为 flake/env 偶发 · EXEC 不自批收官 · STOP awaiting post-prove dual。
