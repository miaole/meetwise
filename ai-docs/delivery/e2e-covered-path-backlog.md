# E2E 抬到 covered 路径 backlog（北星 · 非完成清单）

**日期**：2026-09-10（PT）  
**硬令**：partial / gap / honesty-pin **≠ done**；全量 E2E 零遗漏；生产 100% HA；0 BUG。  
**releaseEvidence=false** 直至多实例 + 故障注入 prove EXIT + CI 收据。  
**sole-stack** MySQL+Qdrant+Redis 未迁完 → **禁止宣称 HA**。R5/pgvector → **green-risk** 必标。

## 2026-11-11 第二批修复合入（统一授权：对口审查 PASS + CI 绿，按顺序合；2026-11-11 16:15–19:13 Asia/Shanghai）

**合入 main（merge commit；每个 PR 只在自己已审 head 上并入当时 main，只改 PTP cap / lint 帽 / 冲突）**

| PR | 内容 | merge sha | 合入后 PTP cap |
|----|------|-----------|----------------|
| #244 | fix(ha6): 修复 main 上 ha6:prove 存量三红 | `f805933bd` | 2536 |
| #248 | fix(api): #70 按路由区分请求体上限并给出明确 413 契约 | `c4b66e355` | 2536 |
| #249 | fix(interview): #18 payload 明文 answer 消费即剥离 | `b8321fa88` | 2537 |
| #247 | fix(worker): 高 inflight 下 checkpoint 写失败不再拖垮 worker 进程（WORKER-INFLIGHT-CRASH-01） | `607f709a0` | 2538 |
| #245 | fix(interview): 将 G2 duplicateFallback 投影到 question_ready 读模型 | `65fdfe463` | 2538 |
| #252 | fix(G6 N-17): targetRole 参与候选人路由裁决 | `60ab09311` | 2538 |
| #255 | fix(model-op): G5 N-14 备用端点接线（claim 前按预绑定对改选备端点） | `80f2c758e` | 2539 |
| #243 | ci: 轻量 verify（核心校验够用） | `87873f50c` | 2539 |
| #258 | ci: 台账门补盲区（env / if / continue-on-error / 非 pnpm 命令）+ nightly !cancelled() | `54716e352` | 2539 |
| #246 | fix(deps): 清 deps-audit 18 个 high，并将门禁升至 high | `91a114f29` | 2539 |
| #261 | fix(api): #248 后续：上传路由按模板判定、音频超限统一 413、FST 信封与 nginx 上限 | `618490e13` | 2539 |
| #251 | docs: #28 ADR 改为 PG-retained 队列；#234 补全 use-cases 索引 | `c9e374944` | 2539 |
| #270 | fix(test): 对齐 ha2-drain 清单与 interview-event-retention | `59baa20b2` | 2539 |
| #265 | docs(deps): 全量对账 footprint 与中间件声明，并加已否决方案回归门 | `343d1503a` | 2539 |
| #269 | fix(model-op): 粘性重试对侧校准预算失败时回传预算错误而非 payload_mismatch | `13e117fd7` | 2539 |
| #250 | fix(e2e): isolated runner 失败 stderr 可见，清理带 -v 防匿名卷泄漏 | `a8f3ba4f9` | 2539 |
| #259 | fix(test): 修复 main 上存量红 prove | `8ad194ae9` | 2539 |
| #257 | fix(privacy): 擦除流覆盖 interview_job 明文 + 投影物理 purge 接入生产 privacy worker（0232） | `3a1d1e931` | 2541 |
| #260 | fix(worker): 锁存不可重试错覆盖更早的可重试错（#247 N-1） | `5f8b3b0e3` | 2541 |
| #256 | fix(web): question_ready 未知 enum 只丢字段不丢整帧 | `a2355638e` | 2541 |
| #253 | fix(db): 0229/0230 DEFINER 头注释勘误钉死 + format %s 白名单 | `b49646860` | 2541 |
| #263 | fix(api): 0143 SSE NOTIFY trigger 缺失或禁用时 readiness fail-closed | `b4de00205` | 2542 |
| #264 | docs(privacy): 0091 授权快照谁来签发（方案，不写实现） | `660671c4f` | 2543 |
| #254 | test(e2e): HTTP 层跳过当澄清 prove（含非 happy-path） | `fbf0afb4e` | 2544 |
| #262 | fix(token-stream): G5 N-13 业务拒绝发撤回帧（预览开关缺省关）；**含 #268**（重连漏撤回，base 为 #262 分支，17:50 以 `a210de9ce` 合入该分支，经 #262 `f8b8fa092` 间接进入 main） | `f8b8fa092` | 2544 |
| #267 | chore(lint): 清 worker 机械警告并把帽收回实测值（合并树实测重算：root 5431→5378、worker 1007→956） | `d70b75587` | 2544 |
| #266 | fix(test): 收窄 qbank-corpus-gates 的 seam 钉与 markers 扫描范围（已审 head `0ec17e42b` 只并入 main，diff 与已审补丁逐字一致） | `3d508f72b` | 2544 |

**#18 只算部分修复**：任务记录写成 done/failed 时明文立即剥离，但排队等处理期间明文仍在库里，`INT-P0-RAW-QUEUE` 仍 **open**，要等 INT-TRANSCRIPT-01。已擦除面试的 `interview_job` 明文由 #257 补上（见跟进第 8 条）。

**lint 警告帽这批被抬高（后续要降回去）**：各 PR 单独都在帽内，合并树叠加后超帽，按合并树实测值恰等改帽，零规则放宽。

| PR | root 帽 | apps/worker 帽 | 说明 |
|----|---------|----------------|------|
| #247 | 5425→5427 | 999→1003 | 与 #249 并线后合并树实测 |
| #245 | 5427→5430 | 1003→1005 | 并线后合并树实测 |
| #252 | 5430→5431 | 1005→1006 | 并线后合并树实测 |
| #262 | 5431（不变） | 1006→1007 | 并线后合并树实测 |
| #267 | 5431→**5378** | 1007→**956** | 清机械警告后按合并树实测收回，零余量 |

根目录和 apps/worker 的 lint 警告数这批被抬高，后续要降回去：#267 已把两处收回到合并时的实测值（root 5378、worker 956），比本批开始前的 5425 / 999 都低；之后新 PR 不应再往上抬。apps/api 帽 1555 本批未动（#254 合并树实测 1545）。

**新增跟进（未关项未标「已修复」的都仍 open）**

1. ~~上传路由按原始 URL 判定（`main.ts` onRequest），构造路径可让服务先缓冲 15MiB 再拒（#248 审查 P1）。~~ **已由 #261 关闭**：#261 审查复核 `POST /auth/login#/resume/file` 一类后缀绕过在本树返回 413，「#248 P1 已关」，反证 A（改回后缀正则）可重开。
2. 公网 nginx 未设 `client_max_body_size`（默认 1m），Next serverActions bodySizeLimit 也是默认；**买云前改**（#248 P2-2）。#261 已把 nginx 设为 15m，但与应用上限相等、Server Action 仍是 1MB（见第 27 条）。
3. 音频超限返回码不单调：约 10.02–11.25MiB 返回 400 zod too_big，只有 10MiB 以上约 24KiB 窗口是 413（#248 P2-1）；#261 已统一 413，`contentBase64` too_big 仍不是 413（见第 27 条）。
4. `FST_ERR_CTP_BODY_TOO_LARGE` 映射原是死代码、启动有 FSTWRN004（#248 P2-3）；#261 已补 FST 信封，待复核。
5. 前端 `duplicateFallback` 严格枚举会丢整帧（#245 审查 P2-a）——**已由 #256 修复**（未知 enum 只丢字段）。
6. `int-answer-dual-write-fence:prove` 夹具存量红（`interview_queue_saturated`），需单独修（#249 审查）。
7. `ha6:prove` A1 正则未锚行首（#244 审查）——**已由 #259 修复**；`ha6:prove` 仍未接进 CI，scripts digest 每次改根 scripts 都会漂（本 PR 已重注册到 `d70b75587`）。
8. 已擦除面试的 `interview_job` 明文与投影物理 purge——**已由 #257 修复**（0232）；生产路径仍无人签发 0091 快照，投影行只会计 `skippedUnauthorized`，签发方案见 #264 文档，**待用户拍板**。
9. N-11 深审结论：原缺陷早已修好，「口径冲突」是过时待办，应改为「已修」，**待用户确认关项**。
10. G6-N17 targetRole（#252）P2：①简历歧义时 targetRole 可选简历未命中的叶；②短 targetRole 单叶分支绕过 v4 强证据闸，"rag"→ai_ml、"自动化测试"→qa；③简历只命中 general 时 targetRole 不生效。P3：大小写 digest 不同、`resumeDegradedFrom` 未落库、「targetRole 原文不落库」注释说过头。
11. ~~`tenant-rls-isolation:prove` 在 main 上 EXIT 1：引用 `0225_auth_user_session_owner_rls.sql`，已改名 0227（ENOENT）。~~ **已由 #259 修复**：见证改为按后缀 `auth_user_session_owner_rls` 匹配（`readMigrationByNameSuffix`，要求恰好 1 个文件），容器臂已 PASS；仅剩 P3-b 注释仍写 0225。
12. #246 审查 P2：postcss override 8.4.31→8.5.32 未做 CSS/UI 回归（box 无 Playwright 浏览器）。
13. G5-N14 粘住重试预算失败时报 mismatch 提示不准（#255）——**已由 #269 修复**。
14. #269 跟进：`usageCauseForInvokeError` 用 `startsWith('budget')`，漏掉 `model_context_budget_exceeded`（`apps/worker/src/adaptive-interview-service.ts:242`）。
15. #243 非阻塞：台账门盲区、nightly 4 步缺 `!cancelled()`——**#258 已补**；上云待办只留 `ci-cd.md:249` 一处。
16. #258 P2-a..d、P3-a：删掉 `runCiStepLedgerGate()` 调用后 docs:check 仍 EXIT 0（门本身无自检臂）。
17. #247 非阻塞：无码 PG 断连报文白名单很窄（未知报文直接终态）；新 proof 用假连接池，未接进 CI。42501 晚到不能覆盖已锁存可重试错——**已由 #260 修复**。
18. #260 非阻塞：未知错误会覆盖 connection_lost 窗口；L-sync 只单向。
19. #262（G5 N-13 撤回帧）：`TOKEN_STREAM_WITHDRAW_PREVIEW` 保持 **OFF**（缺省关，只认 `=== '1'`，部署配置未设）。P2 漏 critique 面；P3-c；P3-d（环满时撤回帧可能在未断流窗口被 `sse-pump.ts` `shift()` 挤掉，前端仍可能把 re-roll 拼到拒稿上）；report / adaptive 两面只有静态断言。#268（重连漏撤回）MUT-B 变异（同时清空 `tokenWithdrawnByKey`）全绿，属覆盖缺口：没有「撤回已达 → 断流 → 迟到旧 seq 仍丢」的臂。**开 `TOKEN_STREAM_WITHDRAW_PREVIEW` 之前必须先修 P3-d、补 MUT-B 臂**（#268 mw-model-op / mw-e2e-ha 审查均列为开 flag 前提；#268 的 PASS 不是开 flag 的授权）。
20. #263（0143 SSE trigger readiness）：P1 catch→unknown 无结构化日志/指标/告警；M5 health fail-open（有意政策变更，未升 BLOCK）；**超时后查询不取消**：`withShortTimeout` 是 Promise 竞速（`health.service.ts:32-55`），不是 `SET statement_timeout`，实证 `pg_sleep(3)` 下 HTTP 约 2007ms 返回，返回后 `pg_stat_activity` 仍见 `pg_sleep`，查询继续占连接直到结束；持续超时会叠加占用。建议对查询 `cancel` 或设更紧的 `statement_timeout`。P3-b/c/d。
21. #253（DEFINER 勘误钉 + format %s 白名单）：**P1-1 仍 OPEN**——DEFINER 钉只覆盖 0229/0230 两个文件内部，新迁移 `ALTER FUNCTION mw_admin_* SECURITY DEFINER`（或 `CREATE OR REPLACE` 时模板不带 %s）可把函数切成 DEFINER 而门禁不拦；建议全目录加拒绝门。**P1-2 仍 OPEN**——`format(%s)` 扫描器可被相邻字面量续接、`E'…'`、位置参数 `%1$s`、宽度 `%-5s` 绕过，变量模板 `format(t, …)` 与 `EXECUTE '…' || x` 不在覆盖范围（存量 21 处无隐藏站点）。P2-1 检测器在 D2/D3/D3b/D4 形态下漏检，只靠 checksum 兜底；P2-2 白名单键是 `file:line:template`、不含实参，非钉死文件（0032/0073/0226）换实参门禁看不出；P2-3 principal.ts 白名单无单测或静态门；P2-R1 `principal-config:prove` 不覆盖调用点是否套上 assert（去掉包装仍 EXIT 0）；P2-R2 0229:89 `%s` 未引号（未改 `%I`）的 SQL 层纵深防御缺口，有意保留，要关须另开迁移。
22. #264 方案文档 N-A..N-D、L182/L209 措辞；方案**待用户拍板**，未实现。
23. #265 P2：README / CLAUDE 仍写 zod-openapi；已否决方案回归门有绕过口。
24. #266（qbank 门作用域）：双审 PASS @`0ec17e42b`；原 head 落后 main 致 CI parity 红，已只并入 main（diff 与已审补丁逐字一致、无 cap 变动），CI 绿后合入 `3d508f72b`。其跟进：旧 `git()` 吞错、文件不存在时断言空转、门未进 CI（先问用户）。
25. #267 P3：`ci.yml:121` 注释里的旧帽数字过时。
26. ha2-drain 清单与 interview-event-retention 不一致——**#270 已对齐**（worker ha2-drain 61/0）。#270 审查 P2：清单只查「必须出现」，不是闭集；应加源码检查，`main.ts` 每个启动的 loop/listener 都要出现在 `drainStops` 或在 `shutdownWorker` 显式停止（`jobWakeupListener` / `jobWakeupRedisListener` 现状在 `drainStops` 外，必须允许），反之亦然。回执见 `reviews/REVIEW-PR270-ha2drain-mw-model-op.md`。
27. #261 P2/P3：Server Action 仍 1MB；`contentBase64` too_big 不是 413；nginx 15m 与应用上限相等无余量；`sourceDigests` 只有静态门。
28. db-trigfam P1：SD 计数钉值需修订。
29. #250 残留：**P1（非阻塞）** 以下 7 种仍可泄漏进 CI 日志（`redactFailureText`，`scripts/bounded-command.mjs`）：①JSON 数组值 `{"password":["s1","s2"]}`；②转义引号 `\"password\":\"…\"`；③Unicode 转义键名 `{"\u0070assword":"…"}`；④键名内侧空格 `{ " password ": "…" }`；⑤多段 base64（密钥拆两段分别编码）；⑥双重 URL 编码（未登记时）；⑦不在已知列表、无键名/URL 形态的裸密钥及其 base64。P2 脱敏正则在病理输入上呈二次方耗时（128KiB 约 10s）。
30. 3 个匿名卷 `97faea65` / `575ef41e76` / `56fcfe95` 来源不明，只登记、不删。
31. 新增 prove 挂 `verify:local` / `ci-cd.md` §8.2.1：`worker-inflight-crash:prove`、`int18:payload-strip:prove`、`body-limit:prove`、`skip-as-clarify:http:prove`、`sse-notify-trigger-health:prove`、`erasure-job-projection:prove`——另开小 PR 送审。
32. 合并过程记录：冻结期间 role-input:prove 起过一次隔离容器；#252/#255 本地检查曾用错依赖（node_modules 是 #246 的），已按锁文件离线重装后复跑。
33. #259 A6 **残留 P1**：字符串诱饵（`"INSERT INTO interview_route_snapshot("` / `"FROM …"`）、未使用的模板字面量、以及「改名 + 桩文件」仍可让检查假通过（MUT-A6-STRING / MUT-A6-TEMPLATE 仍 PASS）；原注释类 P1 已关。建议把 INSERT/FROM 钉到实际查询调用，而不是再扩正则。另 #259 P2-b：移走 0219 后计数=226、链头仍 `0230` 两条 PASS，只能靠行为臂变红。
34. #271（pg-pool 双 release）**BLOCK，未合，另一条线在修**：`checkpoint-principal.ts:227-228` 的 `await (client as …).releaseAsync?.() ?? Promise.resolve(client.release())` 因 `await` 优先级高于 `??`，被解析成 `(await releaseAsync()) ?? …`，façade.query 在 cleanup + release 之后又用原始 release 释放下一个持有者的 checkout，同一连接交给两个租户（跨租户共享连接，真实 PG 复现 mismatches=60），:141-144 又把随之出现的 already-released 静默吞掉。mw-privacy-int 上轮 PASS @842252d4a 已作废。
35. #254 P2-1：H1 不能单独证明 isSkip 分流（isSkip 恒 false 变异下 H1 仍全绿，判别力只来自 H2）；P2-3：收据 sourceDigests 未含 `evaluate-answer.ts`、`adaptive-lifecycle.ts`、`score-writer.ts`、`principal.guard.ts`，这些文件变了收据不会失效。（P2-2 runner 匿名卷泄漏已由 #250 关。）
36. #245 P2-b：旧 checkpoint 回退分支（pending 缺字段、只有 generationProvenance 有值，`adaptive-lifecycle.ts:58` `??` 右侧）没有任何断言覆盖。
37. #257 非阻塞：N-1 列表队头饿死（0096 `ORDER BY created_at LIMIT 32`，无授权 target 永远占住前 32 个名额，**建议在 0091 签发方上线前修**）；N-2 A1 清除与 A2 物理删除都没有持久收据；N-4 两条 policy 删掉 `pt.owner_user_id = interview_job.owner_user_id`（0232:206/:220）后 proof 仍 32/32，缺跨 owner 臂；N-6 清扫每 5 秒扫几乎全部 `interview_job` 行逐行 EXISTS，`privacy_checkpoint_target` 无 (thread_id, owner_user_id) 索引。
38. `ha6:prove` 不在 CI 中：main 上曾因此存量变红（#244 修复前即 3 条红，之后 scripts digest 又多次漂红；每次改根 `package.json` scripts 都会让 scripts digest 漂移，CI 绿兜不住）。合入改 scripts 的 PR 前须在合并树上跑 `ha6:prove`=0；是否接进 CI 待用户决定。

Pins 不变：NOT_HA · releaseEvidence=false · claimProductionHA=false · DELETE=503。

## 2026-11-11 G1–G4 修复合入与用户决定（协调方同步）

**合入 main（merge commit，均经独立领域审查 PASS + PR CI 全绿）**

| 组 | PR | 内容 | merge sha | 合入后 PTP cap |
|----|----|------|-----------|----------------|
| G3 | [#240](https://github.com/miaole/meetwise/pull/240) | SSE 槽 proof 按连接计数 + 轮询下界 + 全仓冲突标记扫描（secrets-scan 内）+ verify `timeout-minutes: 30` | `67a4daeed771785523a1caf869702ec411daae3c` | 2533 |
| G1 | [#239](https://github.com/miaole/meetwise/pull/239) | 迁移账本链首前缀修复（0000→0230 改号）+ 旧库升级 proof | `6212ab8572f4e468ee669aee49d0e6d05c1f9d0e` | 2535 |
| G2 | [#241](https://github.com/miaole/meetwise/pull/241) | 判重出题降级（本场不重复 → 换能力项 → 跨场重复兜底） | `9bc700764482a50c0fdadcaca8e27c9891d24cb4` | 2536 |
| G4 | [#238](https://github.com/miaole/meetwise/pull/238) | 隐私 worker 生产编排与 env 校验 | `2be4e4f29acb9f61594dbd1298a572dc298877e4` | 2536（不增受管件） |

main 上 `ci` 工作流对上述合入提交均 success。`deploy` 工作流报红属**预期内**：云服务器尚未购买，目标 ECS 不存在。`deploy.yml` 保持原样，不改、不禁用。

**用户决定（2026-11-10/11）**

- 跨场重复默认值：本场不重复；本场可换的能力项都换完后，才允许使用别场问过的题（不多调模型、不多扣额度）。如将来要求严格不跨场重复，另开一刀做历史题降权，不靠无上限重摇。
- 全栈 E2E 不进 CI，不配 `MODEL_API_KEY`；在本地手跑 `pnpm e2e:isolated`。
- CI 改为轻量，只保留核心校验（瘦身另走 PR，经 mw-e2e-ha 独立审查后再合）。PR #243 已按 mw-privacy-int + mw-e2e-ha 建议补齐（用户拍板）：PR 加回 E2E 静态守卫 12 条 + 503 无库 pin 2 条；nightly 补 13 条关键隔离 prove、隐私步骤 `if: !cancelled()`、job `timeout-minutes: 60`；`docs:check` 新增步骤台账一致性门；`sse-slot:prove` 自封闭。复审通过后再合。
- 隐私 worker 的生产密钥（`PRIVACY_WORKER_DATABASE_URL` / `PRIVACY_WORKER_DB_USER` / `PRIVACY_WORKER_DB_PASSWORD`）用户确认已配好。
- 上云口径：除「买云 + 部署」这一项以外，上云前的所有工作都要做完。#238 隐私 worker 实际上线排在「买云 + 部署」这一项里，当前**未上线**。

**后续队列（未关）**

1. #18 `interview_job.payload` 明文 answer 需即时剥离。
2. #106 deps-audit 18 个 high 已在 `fix/deps-audit-high` 清零，门禁拟升至 `--audit-level=high`（待合入；翻面权归协调方）。残余 medium 仅 qs@6.15.3 ×3，不挡 high 门。
3. N-11 口径冲突待深审。
4. #28 ADR 仍写 BullMQ/Redis，需与 PG-retained 对齐。
5. #70 bodyLimit 12MiB 低于 base64 上限，413 不可达。
6. #234 use-cases 索引未更新。
7. `ha6:prove` 在 main 上原本即红（3 条），单独跟进。
8. G5（N-13/N-14）、G6（N-17）后置。
9. G2 `duplicateFallback` 标记未投影到 `question_ready` 事件，运营不可见；§4.5 缺 `provenance=cross_session_repeat` 断言。
10. HTTP 层「跳过当澄清」E2E：分支 `test/http-skip-as-clarify-e2e` 的 `pnpm skip-as-clarify:http:prove`（真实 HTTP create/begin/turn + 生产 consumer + 脚本模型，含非 happy-path）已由 mw-e2e-ha 于 2026-11-11 审查 PASS。`score_card=0` 是前提条件（明文 `/turn` 路径不产 `score_request`，0126 双写围栏），不是已证的「跳过不供卡」属性；本绿 ≠ covered。
11. isolated 场景 `runFullE2E` 吞掉 stderr，Key-block 易被误读为 PG 静默失败。
12. 跨场撞题降权（确定性相似度、当场仍硬拒）另开一刀，需 PRE 双审。
13. `sse-slot:prove` 轮询下界只能稳定抓到约 <875ms 的回归（1000ms 的 2 倍退化抓不到）。
14. 0000 ledger 老库需要手动 DELETE 孤儿行；是否自动化由用户决定。
15. 0230 迁移头注释误写为 DEFINER，需要勘误。
16. Worker 高并发崩溃（2c4g sizing 加测，`WORKER_INTERVIEW_GLOBAL_INFLIGHT=16`，默认 4）：N=20 负载开始 +14 s worker 因未捕获的 `checkpoint_privacy_fenced`（42501，`PostgresSaver.put`）退出，20 场全超时；N=40 +28 s 因 `Connection terminated`（`PostgresSaver.putWrites`，同时有 pg「client.query() when the client is already executing a query」告警）退出。两次 CPU / 内存都远低于上限，是稳定性缺陷不是资源问题；默认 4 的各档 0 次退出。调高 inflight 之前必须先修。
17. P3：库里缺 0143 trigger（或空库 `interview_event` 不存在）时，SSE notify 单例降级并退避重连（100 ms 起，上限 5 s），每次掉线都 `wakeAllWaiters`，每个 SSE 连接在 2 s 轮询之外约多 1 次 DB 查询 / 5 s。属设计内降级，记入 SSE 负载评估；生产须确认 0143 trigger 在位。
18. `scripts/run-e2e-isolated.mjs` 删一次性 PG 容器时没带 `-v`（pgvector 镜像声明了 VOLUME），每个隔离 target 泄漏 1 个匿名卷；PR243 审查两轮 `verify:local` 留下 94 个卷约 7 GB，inode 59%→70%。改成 `docker rm -f -v` 或 `--rm`。 **已由 #250 修复**（runner 删容器已带 `-v`）。
19. P3：`pnpm verify:local` 是单条 `&&` 链，首错即停、不汇总；后续改成逐条汇总的 runner。
20. 2c4g sizing 结论（2026-11-11，box 模拟 2 vCPU / 4 GiB 应用机 + 外置 PG / Redis，真模型，零思考时间；原始收据在本地 sizing 工作区、未入库；NOT_HA · UNQUOTED · 不买）：5 场并发完全稳（0 错误，题目延迟 p95 约 4.9 s）；10 场可用（全部完成，SSE 代理 10 s TTFB 超时 502 约 0.7–0.9%，可自动重连，首题 p95 11.6–14 s）；20 场起明显变差。瓶颈不是硬件，是 Worker `globalInflight=4` 加模型延迟（N≥10 吞吐停在约 28–31 场/分，应用 CPU 均值 ≤12.4%、内存峰 ≤1.05 GiB）。推荐托管 PG 2c4g + pgvector（实测峰 0.9 vCPU、≤463 MiB，余量大；1c2g 未实测；max_connections 每套应用约 50）；Redis 256 MB 最小规格即可（实测 ≤3.9 MiB）；swap 不必要。未测：2c4g 硬件真实上限（被第 16 条崩溃挡住）、带宽 6M 限速、托管服务网络 RTT、生产 `NODE_ENV=production` 配置、OCR / 语音、UI、数据量增长后的 PG 内存。
21. 上云待办（不改 `deploy.yml`）：单一来源见 `ai-docs/architecture/devops/ci-cd.md` §8.3（约 :249），此处不再复述正文。

Pins 不变：NOT_HA · releaseEvidence=false。

## 矩阵计数（扫表快照）
| 桶 | 约数 | 说明 |
|----|------|------|
| UC 行 | ~22 | 含合并行 012/024 等 |
| partial | ~17 | 有 prove ≠ covered |
| gap（偏空） | 004（honest pin 已挂）/ 025（honest pin 已挂）/ 028（honest pin 已挂）/ 027 /（040–043 批缺口 honest pin 已挂于 partial 行、031–032 honesty pin 已挂 gap(e2e)/partial(eval)） | |
| blocked | 001-live(无 Key) / 015(无 Key 面) / 027 产品未接 / 050–052 DELETE 冻结 | |

## 下一刀顺序
1. UC-025 押题过期（honest gap prove 已挂）
2. UC-004 career-path（honest gap prove 已挂；抬 covered 见下）
3. UC-028 trace/账本失败不阻塞（honest gap prove 已挂；抬 covered 见下）
4. UC-040–043 批任务/题库/席位 CAS（honest gap prove 已挂；抬 covered 见下）
5. UC-027 人工复核 — 钉 blocked + 抬 covered 前置
6. UC-031/032 — honesty pin 已挂（gap(e2e)/partial(eval)）；抬 covered = **ai-eval suite + gates**（禁 e2e 假模型）

## partial → covered 还缺（摘录）
| UC | 抬 covered 还缺 |
|----|----------------|
| 001 | MODEL_API_KEY 后 live full.e2e；A5 成长档案；sole-stack 夹具 |
| 004 | e2e HTTP 主路径（POST/GET+A1/A2）；AiGraphRun career-path 或 ADR 降级；GrowthTimeline/档案关联；A3 失败降级+额度；不确定性闸；UI 触发；sole-stack 去 R5 |
| 028 | persistTrace 旁路 best-effort（与 settle 分事务）；故障注入→面试 completed+额度 confirmed；missing-trace 重写/对账补写；A3 真相失败阻塞对照 E2E；禁 report-bulkhead 冒充；sole-stack 去 R5 |
| 040–043 | D4 载重 BatchJob/QuestionBankItem/SeatLedger；BatchJob partial_failed HTTP/saga；题库文件导入 partial_failed；双签 CAS；席位 used<total CAS+耗尽/回补；独立 e2e（禁 full.e2e 绑定冒充）；sole-stack 去 R5 |
| 002 | HTTP dual GET+LED prove 已挂（`uc002:http:prove`）；仍缺 **HTTP lease mouth** + snapshot 专用口 + full.e2e 双设备 + Playwright 双 context + sole-stack（harness §1b） |
| 003 | 错误码 en 映射产品接线；热库去硬编码 zh；Playwright locale=en DOM |
| 010 | HTTP R-mid live-tail→LED 已挂（`uc010:sse-resume:prove`）；仍缺 full.e2e mid-interview 断线；A3；UI 重连；0058 去 stub；跨副本槽（harness §1b） |
| 011 | HTTP 额度断言已挂（`uc011:report-refund:http:prove` H1–H5 / `GET /commerce/entitlement`）；H5 钉 refund-callback **产品缺失**+§1b#1 抬 covered 前置；仍缺 refund-callback 产品口；balance-ui；fail HTTP mouth；full.e2e；wallet 契约（harness §1b） |
| 018 | HTTP + **full.e2e abandon** + **graph** + **ttl** + **UI abandon** + **sole PG-retained** prove 已挂（FULL-E2E+GRAPH+TTL+UI+`GAP-UC018-SOLE` CLOSED under PG-retained · `pnpm uc018:sole:prove` · tip **`aa968b1`**）；仍 **partial≠covered** · **#6 alone ≠ covered** · Ban claim UC covered（waiting_user+#1+#2+#3+#5+#6 已关；harness §1b）· covered-lift assessed `harness/uc-e2e-018-covered-lift.md` · tip **`abfbbc0`** · `post_prove_dual_pass` · `GAP-UC018-COVERED-LIFT` CLOSED as honest non-flip assessment only · **≠ UC covered** · `pnpm uc018:covered-lift:prove` · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV was **blind** · Ban假关 · Ban invent covered · Ban wash SOLE alone into covered · **ADV nailed** `harness/uc-e2e-018-adv.md` · tip **`27dd6ae`** · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · §1.0 ADV **partial** · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed · **covered-lift-reassess nailed** `harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` CLOSED as honest non-flip assessment only · `post_prove_dual_pass` · prove tip `5cddb53` · post-prove dual `14a1859`/`7f57243` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban wash ADV alone into covered · Ban假关 · **Ban skip to UC-011** while UC-018 still partial≠covered  · **PERF/LOAD nailed** `harness/uc-e2e-018-perf-load.md` · `GAP-UC018-PERF-LOAD` **CLOSED** · **NHP-018-PERF-01**+**NHP-018-LOAD-01** **partial** · `post_prove_dual_pass` · prove tip `b29c191` · dual `1745bee`/`37c89dc`+`e33dd63` · PERF/LOAD alone ≠ covered · Ban claim production capacity / HA · **Ban skip to UC-011** while UC-018 still partial≠covered · Ban cite canHonestlyFlip@b29c191 as assessed |
| 019 | HTTP regenerate；regenerateAttempt；A3 产品路径 |
| 033 | worker principal；cache/trace；七类高并发；独立 full.e2e |
| 050–052 | DELETE 保持 **503**；**UC-052 deletion → partial**（`uc052:internal-erasure:prove` @`3c4847a` · EOR `08d54f8`/`3e39c1e`）· **≠ covered** · Ban UC-050/051/export elevates · 导出/外部 sink/checkpoint 物理删另包 |
| 031/032 | **ai-eval** jailbreak/造假 golden+阈值 release-gate；结构 e2e escape/biz-reject（禁 fake-model 质量断言）——**UC-031-032-STRUCTURE-01 两臂结构收据已落（2026-11-06 EXEC）**：`pnpm uc031-032:structure:prove` EXIT=0 · 48 断言（Arm-ESC 结构臂+Arm-REJ biz-reject 双腿经隔离 PG 真路径拒·收据 `receipts/uc31-032-structure/`·AUDIT-OBSERVATION: absent）；GuardrailHit 表/API（仍缺·产品裁决前置）；sole-stack 去 R5 |

实现方不自批；每片 harness→prove→≥2 域对抗→reviews/。

## partial→covered 执行序（2026-09-10 协调确认）
1. UC-018 covered-lift / **covered-lift-reassess**（UI + sole PG-retained CLOSED · FULL-E2E+GRAPH+TTL+waiting_user 已关；prior covered-lift tip **`abfbbc0`** · **canHonestlyFlip=false** · refuse：matrix §1.0 ADV was **blind** · 仍 **partial≠covered** · **#6 alone ≠ covered** · Ban假关 · `harness/uc-e2e-018-covered-lift.md` · `post_prove_dual_pass` · `GAP-UC018-COVERED-LIFT` CLOSED as honest non-flip assessment only · **≠ UC covered** · prove tip `86953ca` · post-prove dual `0eb7ac4`/`5e70b55` · `pnpm uc018:covered-lift:prove` · Ban invent covered · Ban wash SOLE alone into covered）· **ADV nailed**（`harness/uc-e2e-018-adv.md` · tip **`27dd6ae`** · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · §1.0 ADV **partial** · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed）· **covered-lift-reassess nailed**（`harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` CLOSED as honest non-flip assessment only · `post_prove_dual_pass` · prove tip `5cddb53` · post-prove dual `14a1859`/`7f57243` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban wash ADV alone into covered · Ban假关 · **Ban skip to UC-011** while UC-018 still partial≠covered） · **PERF/LOAD nailed CLOSED**（`harness/uc-e2e-018-perf-load.md` · `GAP-UC018-PERF-LOAD` **CLOSED** · **NHP-018-PERF-01**+**NHP-018-LOAD-01** **partial** · `post_prove_dual_pass` · prove tip `b29c191` · Ban invent covered · Ban claim production capacity / HA · **Ban skip to UC-011** while UC-018 still partial≠covered · covered-lift = separate later knife · must restore computable six-column evaluator first · Ban cite canHonestlyFlip@b29c191 as assessed）· **COVERED-CRITERION nailed** `harness/uc-e2e-018-covered-criterion.md` · `GAP-UC018-COVERED-CRITERION` **CLOSED** · status `post_prove_dual_pass` · runner `22790a8` · receipts `971bb80` · post-prove dual `fc7dc24`/`6d2841c` BOTH PASS · evaluator `scripts/lib/uc-covered-evaluator.mjs` + gatherer · last-line Verdict · mutation **423/423** · flip⇒empty-reasons · `b29c191` constant-false retired · reassess calls evaluator · real UC-018 `canHonestlyFlip=false` · UC-018/§1.1 stay **partial** · Ban invent covered · D1 **NHP-018-BOUND-01** **partial** · D2 FAULT **case-only** · follow-ups `GAP-UC018-RECEIPT-BACKFILL` · `GAP-EVAL-PARSER-DETAILS-UNCLOSED` · C-WORD-NEG）
2. UC-011 refund-callback 产品口 / balance-ui（HTTP H1–H5 已挂；H5=GAP+PREREQ ≠ 产品口；仍 ≠ covered · **Ban skip here while UC-018 covered-lift-reassess executed / still partial≠covered**（canHonestlyFlip=false · refuse PERF/LOAD blind） · ADV residual CLOSED · ADV alone ≠ covered · **PERF/LOAD nailed** · NHP-018-PERF/LOAD **partial** · `post_prove_dual_pass` · GAP CLOSED · Ban invent covered）
3. UC-002 HTTP 双 session + Last-Event-ID（`uc002:http:prove` 已挂 GET+LED；仍缺 HTTP lease mouth → ≠ covered）
4. UC-010 full.e2e mid-SSE / A3（HTTP R-mid 已挂；仍 ≠ covered）
5. UC-019 regenerate 产品口
6. UC-033 七类/worker 余项
并行：UC-001 live blocked(无 Key) 勿假绿；R5/sole-stack 夹具退役证据；HA `releaseEvidence=false`。


## covered-wave 收口快照（2026-09-10）
018→011→002→010→019→033 HTTP/推进 prove 均过双域或在审；**全部仍 partial≠done/≠covered**。
并行下一候选：R5/sole-stack 夹具退役证据；HA 多实例+故障注入（releaseEvidence=false）。
