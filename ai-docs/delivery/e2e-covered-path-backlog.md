# E2E 抬到 covered 路径 backlog（北星 · 非完成清单）

**日期**：2026-09-10（PT）  
**硬令**：partial / gap / honesty-pin **≠ done**；全量 E2E 零遗漏；生产 100% HA；0 BUG。  
**releaseEvidence=false** 直至多实例 + 故障注入 prove EXIT + CI 收据。  
**sole-stack** MySQL+Qdrant+Redis 未迁完 → **禁止宣称 HA**。R5/pgvector → **green-risk** 必标。

## 2026-11-11 第二批修复合入（统一授权：对口审查 PASS + CI 绿，按顺序合；2026-11-11 16:15–19:13 Asia/Shanghai）

**2026-11-13 收尾同步**（#272 之后合入 #273 / #271 / #237 / #274；跟进条按回执原文校正，5 份进度文档本段逐字相同）：

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
| #272 | docs: 第二批修复合入账本（5 份进度文档同步）+ 入仓 PR270 审查回执 | `9ff50145a` | 2545 |
| #273 | ci: 将 6 条新 prove 挂入 `verify:local`，并第八次重登 ha6 scripts digest | `3da3dae03` | 2545 |
| #271 | fix(worker): 修复 checkpoint PG 连接双 release（跨租户共享连接） | `b0c7ce438` | 2546 |
| #237 | fix(ha/e2e): HA 沙箱语义环境与 V5 零缓冲进 EXIT；空流 attach 隔离 prove:sse-slot | `a74e909cb` | 2546 |
| #274 | fix(ha): HA 沙箱加固（V5 判据合一、V4/V6 fail-closed、告警冒烟 `--metrics-file` 注入缝） | `6e3b1d438` | 2546 |

**#18 只算部分修复**：任务记录写成 done/failed 时明文立即剥离，但排队等处理期间明文仍在库里，`INT-P0-RAW-QUEUE` 仍 **open**，要等 INT-TRANSCRIPT-01。已擦除面试的 `interview_job` 明文由 #257 补上（见跟进第 8 条）。

**lint 警告帽这批被抬高（后续要降回去）**：各 PR 单独都在帽内，合并树叠加后超帽，按合并树实测值恰等改帽，零规则放宽。

| PR | root 帽 | apps/worker 帽 | 说明 |
|----|---------|----------------|------|
| #247 | 5425→5427 | 999→1003 | 与 #249 并线后合并树实测 |
| #245 | 5427→5430 | 1003→1005 | 并线后合并树实测 |
| #252 | 5430→5431 | 1005→1006 | 并线后合并树实测 |
| #262 | 5431（不变） | 1006→1007 | 并线后合并树实测 |
| #267 | 5431→**5378** | 1007→**956** | 清机械警告后按合并树实测收回，零余量 |
| #271 | 5378→**5376** | 956→**954** | 去掉本刀引入及 `connect`/`installReleaseCleanup` 的可避免告警，合并树实测收回，零余量 |

根目录和 apps/worker 的 lint 警告数这批被抬高，后续要降回去：#267 已把两处收回到合并时的实测值（root 5378、worker 956），比本批开始前的 5425 / 999 都低；#271 再收到 root 5376、worker 954。之后新 PR 不应再往上抬。apps/api 帽 1555 本批未动（#254 合并树实测 1545）。

**新增跟进（未关项未标「已修复」的都仍 open）**

1. ~~上传路由按原始 URL 判定（`main.ts` onRequest），构造路径可让服务先缓冲 15MiB 再拒（#248 审查 P1）。~~ **已由 #261 关闭**：#261 审查复核 `POST /auth/login#/resume/file` 一类后缀绕过在本树返回 413，「#248 P1 已关」，反证 A（改回后缀正则）可重开。
2. 公网 nginx 未设 `client_max_body_size`（默认 1m），Next serverActions bodySizeLimit 也是默认；**买云前改**（#248 P2-2）。#261 已把 nginx 设为 15m，但与应用上限相等、Server Action 仍是 1MB（见第 27 条）。
3. 音频超限返回码不单调：约 10.02–11.25MiB 返回 400 zod too_big，只有 10MiB 以上约 24KiB 窗口是 413（#248 P2-1）；#261 已统一 413，`contentBase64` too_big 仍不是 413（见第 27 条）。
4. `FST_ERR_CTP_BODY_TOO_LARGE` 映射原是死代码、启动有 FSTWRN004（#248 P2-3）；#261 已补 FST 信封，待复核。
5. 前端 `duplicateFallback` 严格枚举会丢整帧（#245 审查 P2-a）——**已由 #256 修复**（未知 enum 只丢字段）。
6. `int-answer-dual-write-fence:prove` 夹具存量红（`interview_queue_saturated`），需单独修（#249 审查）。
7. `ha6:prove` A1 正则未锚行首（#244 审查）——**已由 #259 修复**；`ha6:prove` 仍未接进 CI，每次改根 `package.json` scripts 都要人工重登 scripts digest（#272 时第七次登记仍为 `188d121c`@`d70b75587`，因未改 scripts；#273 第八次重登 `711bff22`@`70f9cc144`；#271 第九/十次重登至 `99c190c3964b695099a9981d62f665e1596dc462`，lint 帽 5378→5376；#237/#274 未改 scripts，main `6e3b1d438` 与登记值恒等）。
8. 已擦除面试的 `interview_job` 明文与投影物理 purge——**已由 #257 修复**（0232）；生产路径仍无人签发 0091 快照，投影行只会计 `skippedUnauthorized`，签发方案见 #264 文档，**待用户拍板**。
9. N-11 深审结论：原缺陷早已修好，「口径冲突」是过时待办，应改为「已修」，**待用户确认关项**。
10. G6-N17 targetRole（#252）P2：①简历歧义时 targetRole 可选简历未命中的叶；②短 targetRole 单叶分支绕过 v4 强证据闸，"rag"→ai_ml、"自动化测试"→qa；③简历只命中 general 时 targetRole 不生效。P3：大小写 digest 不同、`resumeDegradedFrom` 未落库、「targetRole 原文不落库」注释说过头。
11. ~~`tenant-rls-isolation:prove` 在 main 上 EXIT 1：引用 `0225_auth_user_session_owner_rls.sql`，已改名 0227（ENOENT）。~~ **已由 #259 修复**：见证改为按后缀 `auth_user_session_owner_rls` 匹配（`readMigrationByNameSuffix`，要求恰好 1 个文件），容器臂已 PASS。P3-b 已关（#259 `5a65f3d7a` 已把注释/变量改成 0227；main 上残留的 0225 都是「historically numbered 0225 / renumbered from 0225」的史注，不是 P3-b 未改）。
12. #246 审查 P2：postcss override 8.4.31→8.5.32 未做 CSS/UI 回归（box 无 Playwright 浏览器）。
13. G5-N14 粘住重试预算失败时报 mismatch 提示不准（#255）——**已由 #269 修复**。
14. #269 跟进：`usageCauseForInvokeError` 用 `startsWith('budget')`，漏掉 `model_context_budget_exceeded`（`apps/worker/src/adaptive-interview-service.ts:242`）。
15. #243 非阻塞：台账门盲区、nightly 4 步缺 `!cancelled()`——**#258 已补**；上云待办只留 `ci-cd.md:249` 一处。
16. #258 P2-a..d、P3-a：删掉 `runCiStepLedgerGate()` 调用后 docs:check 仍 EXIT 0（门本身无自检臂）。
17. #247 非阻塞：无码 PG 断连报文白名单很窄（未知报文直接终态）；新 proof 用假连接池，未接进 CI。42501 晚到不能覆盖已锁存可重试错——**已由 #260 修复**。
18. #260 非阻塞：未知错误会覆盖 connection_lost 窗口；L-sync 只单向。
19. #262（G5 N-13 撤回帧）：`TOKEN_STREAM_WITHDRAW_PREVIEW` 保持 **OFF**（缺省关，只认 `=== '1'`，部署配置未设）。P2 漏 critique 面；report / adaptive 两面只有静态断言（P2 残余：拒绝 → LISTEN 实收 withdrawn 仍无行为臂）。#268（重连漏撤回）已合。开 `TOKEN_STREAM_WITHDRAW_PREVIEW` 之前的前提（#268 mw-e2e-ha §8 :131-135；mw-model-op :72-77,99；#268 的 PASS 不是开 flag 的授权）：① **关闭或显式接受** P3-d（环满时撤回帧可能在未断流窗口被 `sse-pump.ts` `shift()` 挤掉，前端仍可能把 re-roll 拼到拒稿上；本刀只覆盖断流/重连窗）——不是「必须先修」；② 接受「撤回仍不落 `interview_event`、catch-up 不含撤回」的设计（完全依赖客户端断流丢 buffer + 已达水位），或改为服务端持久化撤回；③ P3-c：reason 仍可能带题面片段（只剥控制符），若客户端或未来 UI 会展示 reason，建议在开 flag 前做成机器可读 allowlist（或从客户端载荷去掉 reason）；④ MUT-B 覆盖缺口：**建议补**「撤回已达后断流，迟到旧 seq 仍按保留水位丢弃」——不是「必须」。
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
31. 新增 prove 挂 `verify:local` / `ci-cd.md` §8.2.1：`worker-inflight-crash:prove`、`int18:payload-strip:prove`、`body-limit:prove`、`skip-as-clarify:http:prove`、`sse-notify-trigger-health:prove`、`erasure-job-projection:prove`——**已由 #273 挂入**（merge `3da3dae03`，ha6 第八次重登）。这 6 条此前从未被独立复现（`PR273-verifylocal-mw-e2e-ha.md` Verdict）；独立整跑结果见第 39 条，在那之前不得写「已独立验证」。
32. 合并过程记录：冻结期间 role-input:prove 起过一次隔离容器；#252/#255 本地检查曾用错依赖（node_modules 是 #246 的），已按锁文件离线重装后复跑。
33. #259 A6 **残留 P1**：字符串诱饵（`"INSERT INTO interview_route_snapshot("` / `"FROM …"`）、未使用的模板字面量、以及「改名 + 桩文件」仍可让检查假通过（MUT-A6-STRING / MUT-A6-TEMPLATE 仍 PASS）；原注释类 P1 已关。建议把 INSERT/FROM 钉到实际查询调用，而不是再扩正则。另 #259 P2-b：移走 0219 后计数=226、链头仍 `0230` 两条 PASS，只能靠行为臂变红。
34. #271（pg-pool 双 release）**已合入** `b0c7ce438`（双审 PASS @`e3c92d789`；原 BLOCK：`checkpoint-principal.ts` 中 `await` 优先级高于 `??`，façade.query 在 cleanup + release 之后又用原始 release 释放下一个持有者的 checkout，真实 PG 复现 mismatches=60，已修）。合入后非阻塞（只记录，本 docs PR 不改代码）：mw-privacy-int @e3c92d7：N-1 `getOwnPropertyDescriptor` 回报 `configurable:false` 与 target 不一致，导致 `Object.keys(handle)` 抛 TypeError；N-2/P8 `query` 传入 Submittable 时可拿到 raw Connection（线级 DoS 风险，当前未见跨租户；Saver/仓库调用方不走该 API；建议 query 拒绝非字符串或非纯 config 参数）；P6 `underlyingPool` 仍可拿 raw Client（仅记录）；N-6 事务态。mw-model-op 第5轮 @e3c92d7：`asPool()` 仍 `as unknown as Pool`；打开态访问非白名单成员也抛 `checkpoint_pg_stale_handle`（错误名误导）；`set` / `defineProperty` / `deleteProperty` 返回 false 致 TypeError；`:145` 注释「a proxy」过时（实现是白名单 `Object.create(null)` 再 Proxy）；3 条既有 any/naming 告警（`query(...args: any[])` 与 `__set…ForTest`）。第4轮 @9faf865 中「消 3 条可避免告警并把 cap 回退到 main 值」已在后续轮落地（合入帽 root 5376 / worker 954）。
35. #254 P2-1：H1 不能单独证明 isSkip 分流（isSkip 恒 false 变异下 H1 仍全绿，判别力只来自 H2）；P2-3：收据 sourceDigests 未含 `evaluate-answer.ts`、`adaptive-lifecycle.ts`、`score-writer.ts`、`principal.guard.ts`，这些文件变了收据不会失效。（P2-2 runner 匿名卷泄漏已由 #250 关。）
36. #245 P2-b：旧 checkpoint 回退分支（pending 缺字段、只有 generationProvenance 有值，`adaptive-lifecycle.ts:58` `??` 右侧）没有任何断言覆盖。
37. #257 非阻塞：N-1 列表队头饿死（0096 `ORDER BY created_at LIMIT 32`，无授权 target 永远占住前 32 个名额，**建议在 0091 签发方上线前修**）；N-2 A1 清除与 A2 物理删除都没有持久收据；N-4 两条 policy 删掉 `pt.owner_user_id = interview_job.owner_user_id`（0232:206/:220）后 proof 仍 32/32，缺跨 owner 臂；N-6 清扫每 5 秒扫几乎全部 `interview_job` 行逐行 EXISTS，`privacy_checkpoint_target` 无 (thread_id, owner_user_id) 索引。
38. `ha6:prove` 不在 CI 中：main 上曾因此存量变红（#244 修复前即 3 条红，之后 scripts digest 又多次漂红；每次改根 `package.json` scripts 都会让 scripts digest 漂移，CI 绿兜不住）。mw-e2e-ha 在 #272 增量复审中对 30 个 main 合入点逐点实跑 `ha6:prove`：其中只有 #244 和 #259 两处是绿的（`PR272-batch2docs-mw-e2e-ha.md` §D）；#244 修复前恰 3 条红，其后 26 个合入点因 digest 漂移 EXIT 1。当时 main `3d508f72b` 的 ha6:prove 就是 EXIT 1，#272 合入后转绿；其后 #273/#271 改 scripts 并重登（现登记 `99c190c3964b695099a9981d62f665e1596dc462`，与 main `6e3b1d438` 恒等）。合入改 scripts 的 PR 前须在合并树上跑 `ha6:prove`=0；是否接进 CI 待用户决定。

39. #273 挂进 `verify:local` 的 6 条 prove 独立整跑。先前两次（box `/workspace/mw-verifylocal`，origin/main `6e3b1d438`，2026-11-13 Asia/Shanghai）未跑通：第一次 14:27:02–14:27:14 EXIT 1（12s），`drift:prove` 因默认容器 `meetwise-postgres-dev` 不存在而红；第二次先 `pnpm db:up` 起 `meetwise-postgres-dev`（id `ec547b7a40d8`，pid 2786785，宿主端口 54329）后 14:29:40–14:35:41 EXIT 1（361s），在 `voice:prove` 以 `database_config_invalid:database_target_missing` 红停（裸跑 `tsx test/voice.proof.ts`，未走 isolated runner），#273 的 6 条均未执行到。根因是脚本缺陷不是文档缺口：`verify:local` 不应依赖开发者手工 `db:up`。修脚本后于 2026-11-13 Asia/Shanghai 16:14:45–16:22:30 CST 在独立 worktree `/workspace/mw-vl-fix`（基于 origin/main `c33bd3b21`=#276 合入后）整跑 `pnpm verify:local` 等价 75 步：**75/75 均为 EXIT 0**，总耗时 465458ms，父 PID 3516351，结束无残留 meetwise 容器。本跑 `drift:prove` 自拉一次性容器 `meetwise-postgres-drift-3517682`（结束后 `docker rm -f -v`）；`voice:prove` 走隔离容器 `meetwise-e2e-3564178-1794558046210`；`graph:prove` 走 `meetwise-e2e-3566949-1794558094473`。#273 六条亦绿：`worker-inflight-crash:prove` EXIT 0 4270ms pid=3569471（零 DB）；`int18:payload-strip:prove` EXIT 0 6745ms pid=3569676 容器 `meetwise-e2e-3569700-1794558118420`；`body-limit:prove` EXIT 0 4885ms pid=3570555 容器 `meetwise-e2e-3570573-1794558125199`；`skip-as-clarify:http:prove` EXIT 0 8016ms pid=3571213 容器 `meetwise-e2e-3571231-1794558130113`；`sse-notify-trigger-health:prove` EXIT 0 6910ms pid=3572109 容器 `meetwise-e2e-3572127-1794558138167`；`erasure-job-projection:prove` EXIT 0 5783ms pid=3572965 容器 `meetwise-e2e-3572983-1794558145097`。75 步明细（时间均为 Asia/Shanghai CST，pid 为该步包装子进程，容器若有则步末已拆除）：1. `e2e-ui-stale-build-guard:prove` EXIT 0，16:14:45–16:14:45，497ms，pid=3516371，无容器；2. `-C apps/web prove:public-copy` EXIT 0，16:14:45–16:14:46，343ms，pid=3516493，无容器；3. `migrate-upgrade:prove` EXIT 0，16:14:46–16:14:55，9801ms，pid=3516543，meetwise-e2e-3516561-1794557686358；4. `drift:prove` EXIT 0，16:14:55–16:15:15，20017ms，pid=3517664，meetwise-postgres-drift-3517682；5. `neg:bend` EXIT 0，16:15:16–16:15:21，5811ms，pid=3526608，meetwise-e2e-3526651-1794557716239；6. `neg:auth` EXIT 0，16:15:21–16:15:27，5234ms，pid=3527337，meetwise-e2e-3527355-1794557722080；7. `neg:commerce` EXIT 0，16:15:27–16:15:31，4499ms，pid=3528031，meetwise-e2e-3528052-1794557727334；8. `neg:resume` EXIT 0，16:15:31–16:15:36，4623ms，pid=3528685，meetwise-e2e-3528703-1794557731857；9. `neg:interview` EXIT 0，16:15:36–16:15:41，4744ms，pid=3529335，meetwise-e2e-3529353-1794557736499；10. `neg:input` EXIT 0，16:15:41–16:15:45，4683ms，pid=3529992，meetwise-e2e-3530013-1794557741273；11. `uc033:cross-user-authz:prove` EXIT 0，16:15:45–16:15:50，4549ms，pid=3530670，meetwise-e2e-3530688-1794557745983；12. `dbhy1:prove` EXIT 0，16:15:50–16:15:56，6476ms，pid=3531341，meetwise-e2e-3531359-1794557750560；13. `db-acl2:prove` EXIT 0，16:15:56–16:16:06，9331ms，pid=3532347，meetwise-e2e-3532365-1794557757071；14. `commerce:prove` EXIT 0，16:16:06–16:16:12，5923ms，pid=3533393，meetwise-e2e-3533411-1794557766427；15. `resume:prove` EXIT 0，16:16:12–16:16:17，5622ms，pid=3534254，meetwise-e2e-3534272-1794557772379；16. `report:prove` EXIT 0，16:16:17–16:16:24，6365ms，pid=3535119，meetwise-e2e-3535137-1794557778039；17. `quiz:prove` EXIT 0，16:16:24–16:16:30，6366ms，pid=3535975，meetwise-e2e-3535994-1794557784408；18. `reaper:prove` EXIT 0，16:16:30–16:16:36，6344ms，pid=3536834，meetwise-e2e-3536860-1794557790813；19. `model-op00:prove` EXIT 0，16:16:36–16:16:43，6101ms，pid=3537712，meetwise-e2e-3537730-1794557797182；20. `adaptive:prove` EXIT 0，16:16:43–16:16:43，881ms，pid=3538602，无容器；21. `adaptive-flow:prove` EXIT 0，16:16:43–16:16:50，6257ms，pid=3538713，meetwise-e2e-3538731-1794557804209；22. `adaptive-life:prove` EXIT 0，16:16:50–16:16:57，7518ms，pid=3539587，meetwise-e2e-3539605-1794557810496；23. `adaptive-consumer:prove` EXIT 0，16:16:57–16:17:04，7015ms，pid=3540604，meetwise-e2e-3540622-1794557818042；24. `checkpoint-role:prove` EXIT 0，16:17:04–16:17:10，5870ms，pid=3541487，meetwise-e2e-3541505-1794557825086；25. `privacy-erasure:prove` EXIT 0，16:17:10–16:17:17，6375ms，pid=3542213，meetwise-e2e-3542231-1794557831055；26. `privacy-erasure:http:prove` EXIT 0，16:17:17–16:17:54，37017ms，pid=3543081，meetwise-e2e-3543102-1794557837388；27. `privacy-erasure-preview:prove` EXIT 0，16:17:54–16:17:59，5645ms，pid=3544554，meetwise-e2e-3544572-1794557874426；28. `privacy-erasure:pause-upgrade:prove` EXIT 0，16:17:59–16:18:05，5209ms，pid=3545402，meetwise-e2e-3545421-1794557880154；29. `scor-00:http:prove` EXIT 0，16:18:05–16:18:11，6618ms，pid=3546083，meetwise-e2e-3546101-1794557885330；30. `scor-parity:prove` EXIT 0，16:18:11–16:18:17，6055ms，pid=3546970，meetwise-e2e-3546994-1794557891977；31. `scoring-integrity:prove` EXIT 0，16:18:17–16:18:24，6870ms，pid=3547850，meetwise-e2e-3547869-1794557898086；32. `tokenstream:prove` EXIT 0，16:18:24–16:18:43，19200ms，pid=3548705，meetwise-e2e-3548723-1794557904961；33. `stress:prove` EXIT 0，16:18:43–16:18:51，7089ms，pid=3549805，meetwise-e2e-3549823-1794557924194；34. `uc003:i18n-locale:prove` EXIT 0，16:18:51–16:18:53，2622ms，pid=3550697，meetwise-e2e-3550715-1794557931300；35. `metrics:prove` EXIT 0，16:18:53–16:18:55，1349ms，pid=3551415，无容器；36. `model-output-limit:prove` EXIT 0，16:18:55–16:18:56，1353ms，pid=3551529，无容器；37. `dashscope-native-config:prove` EXIT 0，16:18:56–16:18:57，712ms，pid=3551653，无容器；38. `voice-operation-policy:prove` EXIT 0，16:18:57–16:18:58，1681ms，pid=3551755，无容器；39. `voice-stream-asr-honesty:prove` EXIT 0，16:18:58–16:19:00，1345ms，pid=3551876，无容器；40. `interview-voice-seams:prove` EXIT 0，16:19:00–16:19:01，1390ms，pid=3551992，无容器；41. `ocr-operation-policy:prove` EXIT 0，16:19:01–16:19:02，1263ms，pid=3552112，无容器；42. `voice-adaptive:prove` EXIT 0，16:19:03–16:19:10，7311ms，pid=3552226，meetwise-e2e-3552244-1794557943247；43. `rag-generation:prove` EXIT 0，16:19:10–16:19:16，6558ms，pid=3553106，meetwise-e2e-3553124-1794557950606；44. `qbank-integrity-upgrade:prove` EXIT 0，16:19:16–16:19:21，4308ms，pid=3554012，meetwise-e2e-3554030-1794557957186；45. `qbank-control-role:prove` EXIT 0，16:19:21–16:19:27，6366ms，pid=3554671，meetwise-e2e-3554689-1794557961526；46. `rag-control-runtime:prove` EXIT 0，16:19:27–16:19:28，937ms，pid=3555570，无容器；47. `rag-control-role:prove` EXIT 0，16:19:28–16:19:33，4829ms，pid=3555674，meetwise-e2e-3555692-1794557968865；48. `rag-control-upgrade:prove` EXIT 0，16:19:33–16:19:38，4522ms，pid=3556337，meetwise-e2e-3556358-1794557973738；49. `rag-corpus-version:prove` EXIT 0，16:19:38–16:19:43，4973ms，pid=3557036，meetwise-e2e-3557054-1794557978292；50. `rag-control-dispatch:prove` EXIT 0，16:19:43–16:19:48，4968ms，pid=3557718，meetwise-e2e-3557736-1794557983287；51. `migrate-cli:prove` EXIT 0，16:19:48–16:19:54，6782ms，pid=3558438，meetwise-e2e-3558456-1794557988274；52. `qbank-pipeline:prove` EXIT 0，16:19:54–16:20:00，5980ms，pid=3559338，meetwise-e2e-3559356-1794557995101；53. `adaptive-degrade:prove` EXIT 0，16:20:00–16:20:11，10711ms，pid=3560200，meetwise-e2e-3560218-1794558001092；54. `interview:prove` EXIT 0，16:20:11–16:20:18，7211ms，pid=3561124，meetwise-e2e-3561145-1794558011830；55. `drain:prove` EXIT 0，16:20:18–16:20:34，15684ms，pid=3562025，无容器；56. `worker-wakeup:prove` EXIT 0，16:20:34–16:20:35，1069ms，pid=3562372，无容器；57. `vectorstore:prove` EXIT 0，16:20:35–16:20:39，3489ms，pid=3562474，meetwise-e2e-3562503-1794558035870；58. `memory:prove` EXIT 0，16:20:39–16:20:45，6218ms，pid=3563147，meetwise-e2e-3563165-1794558039391；59. `deploy:check` EXIT 0，16:20:45–16:20:45，542ms，pid=3564050，无容器；60. `voice:prove` EXIT 0，16:20:45–16:20:50，4065ms，pid=3564154，meetwise-e2e-3564178-1794558046210；61. `-C packages/ai-runtime prove:voice-reliability` EXIT 0，16:20:50–16:21:21，31223ms，pid=3564808，无容器；62. `-C apps/web prove:speak-proxy` EXIT 0，16:21:21–16:21:21，472ms，pid=3565555，无容器；63. `-C apps/web prove:transcribe-proxy` EXIT 0，16:21:21–16:21:22，474ms，pid=3565637，无容器；64. `-C apps/api prove:voice-timeout` EXIT 0，16:21:22–16:21:23，1443ms，pid=3565728，无容器；65. `-C apps/api prove:voice-cancel-http` EXIT 0，16:21:23–16:21:25，1270ms，pid=3565807，无容器；66. `runtime:isolated:prove` EXIT 0，16:21:25–16:21:34，9092ms，pid=3565907，meetwise-e2e-3565925-1794558085336；67. `graph:prove` EXIT 0，16:21:34–16:21:38，4131ms，pid=3566924，meetwise-e2e-3566949-1794558094473；68. `api:validate` EXIT 0，16:21:38–16:21:47，9374ms，pid=3567585，meetwise-e2e-3567604-1794558098627；69. `ocr:prove` EXIT 0，16:21:47–16:21:53，6072ms，pid=3568492，meetwise-e2e-3568513-1794558108018；70. `worker-inflight-crash:prove` EXIT 0，16:21:53–16:21:58，4270ms，pid=3569471，无容器；71. `int18:payload-strip:prove` EXIT 0，16:21:58–16:22:04，6745ms，pid=3569676，meetwise-e2e-3569700-1794558118420；72. `body-limit:prove` EXIT 0，16:22:04–16:22:09，4885ms，pid=3570555，meetwise-e2e-3570573-1794558125199；73. `skip-as-clarify:http:prove` EXIT 0，16:22:09–16:22:17，8016ms，pid=3571213，meetwise-e2e-3571231-1794558130113；74. `sse-notify-trigger-health:prove` EXIT 0，16:22:17–16:22:24，6910ms，pid=3572109，meetwise-e2e-3572127-1794558138167；75. `erasure-job-projection:prove` EXIT 0，16:22:24–16:22:30，5783ms，pid=3572965，meetwise-e2e-3572983-1794558145097。
40. #237 / #274 非阻塞脚本项已由 #276 收口：沙箱不再写真实 profile id `dashscope-cn-beijing`，改为授权后才解析的 `sandbox-invalid`（host=`dashscope.invalid`）；告警冒烟 `genEnv` 已补 `MODEL_ENDPOINT_PROFILE` / `MODEL_BACKUP_ENDPOINT_PROFILE`；冒烟注释行号已对齐；冒烟 stdout/顶层收据已点明 metrics 是 `--metrics-file` 注入，步骤标题不再写 live；V5「two SSE clients attached」改为双方 HTTP 200 并纳入 EXIT；`writeReceipt` 的 exitCode 与进程 EXIT 同源。既有仍开：`provider-egress-inventory.mjs` env 行 class 只校验 nonEmptyString（MUT2 改成 production-runtime 仍绿）；qwen 前缀闸不是沙箱白名单；沙箱没有网络 deny-list（阻断外联靠 .invalid 主机 + dummy key + 授权门）。#237 已补空流 attach 立即见 200 的隔离 prove（`prove:sse-slot`）。旧四条 SSE proof 仍不锁 flushHeaders；回归锁在 `prove:sse-slot` + V5，P1 已于 #237 @0c5aa1d28 关闭。
41. P2：`ha6:prove` 未入 CI，每次改根 `package.json` scripts 都要人工重登 scripts digest（当前第十一次 `6c445dd8edac5017730d9c7feea83d0df88785fe`，本 PR 自 `99c190c3964b695099a9981d62f665e1596dc462` 重登：键名纯增 2=`voice:prove:raw` + `graph:prove:raw`，键值改 2=`voice:prove` / `graph:prove` 改配 isolated runner，lint 帽未抬）。
42. verify:local 自包含修复（本 PR）：`drift:prove` 未设 `PGCONTAINER` 时自拉一次性 `pgvector/pgvector:pg16` 容器（名 `meetwise-postgres-drift-<pid>`，结束后只 `docker rm -f -v` 该容器；不复用、不启动 `meetwise-postgres-dev`）；显式 `PGCONTAINER` 未在跑则 fail-closed，不自动 `db:up`。`voice:prove` / `graph:prove` 改配 `node scripts/run-e2e-isolated.mjs …:raw`（并补 isolatedCommand，避免对 `voice:prove` 回退成套娃）。顺手收口 #276 mw-e2e-ha P3 (a)(c)：up 前 `MODEL_ENDPOINT_PROFILE` / `MODEL_BACKUP_ENDPOINT_PROFILE` 必须为 `sandbox-invalid`，否则 fail-closed；`writeReceipt` / `finish` 的 `result` 由 `exitCode` 对齐（非 0 不得写 OK 等成功 token）。Pins：NOT_HA · releaseEvidence=false · claimProductionHA=false。未把 `verify:local` 或全栈 E2E 放入 CI，未加 `MODEL_API_KEY`，未改 `deploy.yml`。

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
