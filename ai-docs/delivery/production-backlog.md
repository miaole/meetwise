---
id: delivery_production_backlog
name: 生产就绪 Master Backlog（自驱目标文档）
description: 北极星 + 按优先级的生产面 backlog + 行走骨架序列 + 刻意不做清单。承重设计从 .tmp/对话决定 land 进 committed 知识层的进度看板。
type: plan
scope: shared
level: guide
status: active
owner: architecture
related:
  - ./roadmap.md
  - ./production-readiness-remediation-register.md
  - ../rules/global/production-invariants.md
---

# 生产就绪 Master Backlog

> **北极星**：100% 生产高可用（= 零业务事实丢失 + 优雅降级 + 快速恢复）/ 一个细节不放过 / agent 架构师水准。它是目标，不是当前已证明的事实；单节点数据库、运行时高权账号和未演练恢复仍是发布阻断。
> **根因诊断**：承重设计曾 70% 烂在 `.tmp`，committed 文档把硬机制「交接给后续任务」却无该任务（handoff 空指针）。修复 = land 孤儿 + 把 handoff 兑现成机制。
> **四个承重原语**（所有「漏钱/泄露/丢失」的塌缩）：CAS 条件更新、幂等键、RLS principal 绑定、持久有序事件日志。见 [生产不变量](../rules/global/production-invariants.md)。

状态：✅已 land committed · 🟡已决定待成文 · 🟠workflow 完成待 land · ❌待写

> **生产等价性纪律**：功能的测试、评测、演示或控制面存在，不等于它已经进入真实生产请求路径。
> 已知差距、关闭条件与勾选状态以
> [`production-readiness-remediation-register.md`](./production-readiness-remediation-register.md) 为准；本页不再用一行 ✅ 掩盖未接线的 serving、云端或浏览器链路。

## 2026-11-11 第二批修复合入（统一授权：对口审查 PASS + CI 绿，按顺序合；2026-11-11 16:15–19:00 Asia/Shanghai）

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
| #262 | fix(token-stream): G5 N-13 业务拒绝发撤回帧（预览开关缺省关） | `f8b8fa092` | 2544 |
| #267 | chore(lint): 清 worker 机械警告并把帽收回实测值（合并树实测重算：root 5431→5378、worker 1007→956） | `d70b75587` | 2544 |

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

1. 上传路由按原始 URL 判定（`main.ts` onRequest），构造路径可让服务先缓冲 15MiB 再拒（#248 审查 P1）。#261 已改为按路由模板判定，待复核后关项。
2. 公网 nginx 未设 `client_max_body_size`（默认 1m），Next serverActions bodySizeLimit 也是默认；**买云前改**（#248 P2-2）。#261 已把 nginx 设为 15m，但与应用上限相等、Server Action 仍是 1MB（见第 27 条）。
3. 音频超限返回码不单调：约 10.02–11.25MiB 返回 400 zod too_big，只有 10MiB 以上约 24KiB 窗口是 413（#248 P2-1）；#261 已统一 413，`contentBase64` too_big 仍不是 413（见第 27 条）。
4. `FST_ERR_CTP_BODY_TOO_LARGE` 映射原是死代码、启动有 FSTWRN004（#248 P2-3）；#261 已补 FST 信封，待复核。
5. 前端 `duplicateFallback` 严格枚举会丢整帧（#245 审查 P2-a）——**已由 #256 修复**（未知 enum 只丢字段）。
6. `int-answer-dual-write-fence:prove` 夹具存量红（`interview_queue_saturated`），需单独修（#249 审查）。
7. `ha6:prove` A1 正则未锚行首（#244 审查）——**已由 #259 修复**；`ha6:prove` 仍未接进 CI，scripts digest 每次改根 scripts 都会漂（本 PR 已重注册到 `d70b75587`）。
8. 已擦除面试的 `interview_job` 明文与投影物理 purge——**已由 #257 修复**（0232）；生产路径仍无人签发 0091 快照，投影行只会计 `skippedUnauthorized`，签发方案见 #264 文档，**待用户拍板**。
9. N-11 深审结论：原缺陷早已修好，「口径冲突」是过时待办，应改为「已修」，**待用户确认关项**。
10. G6-N17 targetRole（#252）P2：①简历歧义时 targetRole 可选简历未命中的叶；②短 targetRole 单叶分支绕过 v4 强证据闸，"rag"→ai_ml、"自动化测试"→qa；③简历只命中 general 时 targetRole 不生效。P3：大小写 digest 不同、`resumeDegradedFrom` 未落库、「targetRole 原文不落库」注释说过头。
11. `tenant-rls-isolation:prove` 在 main 上 EXIT 1：仍引用 `0225_auth_user_session_owner_rls.sql`，已改名 0227（ENOENT）。
12. #246 审查 P2：postcss override 8.4.31→8.5.32 未做 CSS/UI 回归（box 无 Playwright 浏览器）。
13. G5-N14 粘住重试预算失败时报 mismatch 提示不准（#255）——**已由 #269 修复**。
14. #269 跟进：`usageCauseForInvokeError` 用 `startsWith('budget')`，漏掉 `model_context_budget_exceeded`（`apps/worker/src/adaptive-interview-service.ts:242`）。
15. #243 非阻塞：台账门盲区、nightly 4 步缺 `!cancelled()`——**#258 已补**；上云待办只留 `ci-cd.md:249` 一处。
16. #258 P2-a..d、P3-a：删掉 `runCiStepLedgerGate()` 调用后 docs:check 仍 EXIT 0（门本身无自检臂）。
17. #247 非阻塞：无码 PG 断连报文白名单很窄（未知报文直接终态）；新 proof 用假连接池，未接进 CI。42501 晚到不能覆盖已锁存可重试错——**已由 #260 修复**。
18. #260 非阻塞：未知错误会覆盖 connection_lost 窗口；L-sync 只单向。
19. #262（G5 N-13 撤回帧）：`TOKEN_STREAM_WITHDRAW_PREVIEW` 保持 **OFF**（缺省关，只认 `=== '1'`，部署配置未设）。P2 漏 critique 面；P3-c、P3-d；MUT-B 变异臂未补；report / adaptive 两面只有静态断言。
20. #263（0143 SSE trigger readiness）：P1 catch→unknown 无日志/指标；`withShortTimeout` 与 `statement_timeout` 未对齐；M5 health fail-open；P3-b/c/d。
21. #253 P2-R1；#259 P2-b。
22. #264 方案文档 N-A..N-D、L182/L209 措辞；方案**待用户拍板**，未实现。
23. #265 P2：README / CLAUDE 仍写 zod-openapi；已否决方案回归门有绕过口。
24. #266（qbank 门作用域）：已双审 PASS @`0ec17e42b`，base 已改 main，但 head 落后 main，CI parity 报 `baseline_identity_dropped`（bounded-command.proof.mjs，来自 #250 新基线）；要过 CI 必须并 main 改 head，**未合，待用户决定**。其跟进：旧 `git()` 吞错、文件不存在时断言空转、门未进 CI（先问用户）。
25. #267 P3：`ci.yml:121` 注释里的旧帽数字过时。
26. ha2-drain 清单与 interview-event-retention 不一致——**#270 已对齐**（worker ha2-drain 61/0）。#270 审查 P2：清单只查「必须出现」，不是闭集；应加源码检查，`main.ts` 每个启动的 loop/listener 都要出现在 `drainStops` 或在 `shutdownWorker` 显式停止（`jobWakeupListener` / `jobWakeupRedisListener` 现状在 `drainStops` 外，必须允许），反之亦然。回执见 `reviews/REVIEW-PR270-ha2drain-mw-model-op.md`。
27. #261 P2/P3：Server Action 仍 1MB；`contentBase64` too_big 不是 413；nginx 15m 与应用上限相等无余量；`sourceDigests` 只有静态门。
28. db-trigfam P1：SD 计数钉值需修订。
29. #250 残留：P1 脱敏缺口仍有；P2 脱敏耗时随长度平方增长（128KiB 约 10s）。
30. 3 个匿名卷 `97faea65` / `575ef41e76` / `56fcfe95` 来源不明，只登记、不删。
31. 新增 prove 挂 `verify:local` / `ci-cd.md` §8.2.1：`worker-inflight-crash:prove`、`int18:payload-strip:prove`、`body-limit:prove`、`skip-as-clarify:http:prove`、`sse-notify-trigger-health:prove`、`erasure-job-projection:prove`——另开小 PR 送审。
32. 合并过程记录：冻结期间 role-input:prove 起过一次隔离容器；#252/#255 本地检查曾用错依赖（node_modules 是 #246 的），已按锁文件离线重装后复跑。

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
18. `scripts/run-e2e-isolated.mjs` 删一次性 PG 容器时没带 `-v`（pgvector 镜像声明了 VOLUME），每个隔离 target 泄漏 1 个匿名卷；PR243 审查两轮 `verify:local` 留下 94 个卷约 7 GB，inode 59%→70%。改成 `docker rm -f -v` 或 `--rm`。
19. P3：`pnpm verify:local` 是单条 `&&` 链，首错即停、不汇总；后续改成逐条汇总的 runner。
20. 2c4g sizing 结论（2026-11-11，box 模拟 2 vCPU / 4 GiB 应用机 + 外置 PG / Redis，真模型，零思考时间；原始收据在本地 sizing 工作区、未入库；NOT_HA · UNQUOTED · 不买）：5 场并发完全稳（0 错误，题目延迟 p95 约 4.9 s）；10 场可用（全部完成，SSE 代理 10 s TTFB 超时 502 约 0.7–0.9%，可自动重连，首题 p95 11.6–14 s）；20 场起明显变差。瓶颈不是硬件，是 Worker `globalInflight=4` 加模型延迟（N≥10 吞吐停在约 28–31 场/分，应用 CPU 均值 ≤12.4%、内存峰 ≤1.05 GiB）。推荐托管 PG 2c4g + pgvector（实测峰 0.9 vCPU、≤463 MiB，余量大；1c2g 未实测；max_connections 每套应用约 50）；Redis 256 MB 最小规格即可（实测 ≤3.9 MiB）；swap 不必要。未测：2c4g 硬件真实上限（被第 16 条崩溃挡住）、带宽 6M 限速、托管服务网络 RTT、生产 `NODE_ENV=production` 配置、OCR / 语音、UI、数据量增长后的 PG 内存。
21. 上云待办（不改 `deploy.yml`）：单一来源见 `ai-docs/architecture/devops/ci-cd.md` §8.3（约 :249），此处不再复述正文。

Pins 不变：NOT_HA · releaseEvidence=false。

**0091 签发根（方案，2026-11-11）**：PR #257 把投影物理 purge 接进生产 worker 后，生产路径仍无人签发 0091 快照，投影行只会计 `skippedUnauthorized`、不会真删。账户注销只 begin、不签名。方案与选项比较见 [`privacy-0091-signer-who.md`](./privacy-0091-signer-who.md)。推荐：上云前用独立签发器（软件 ECDSA），上云后再接 KMS；签发前须先挂 oss/redis/langfuse，避免 0096 在本地 purge 后把请求标成 `completed`。公开 DELETE 仍 503。审查方 mw-privacy-int。本条只登记方案，不是已实现。


## P0 — 演示关键 / 上线阻塞

| 条目 | 状态 |
|---|---|
| 四原语（CAS/幂等/RLS/事件日志） | ✅ `rules/global/production-invariants.md` |
| RLS 谓词机制（GUC/连接池/fail-closed/越权测试） | 🟡 API/worker Compose 配置已切换到 `APP_RUNTIME_DB_USER`；独立 PostgreSQL 的低权账号 19 项及低权 LangGraph checkpoint 3 项已通过。仍缺完整同构 Compose HTTP+队列压测、checkpoint 每行 owner-RLS 和恢复演练，见 `architecture/backend/rls-isolation.md` §4.1 |
| 5 对象状态机转换表 | ✅ `rules/global/status-machine.md` |
| 模块边界 + 依赖方向 + CI 强约束 | ✅ `architecture/backend/module-boundaries.md` |
| agent-runtime 关口（catalog/router/双校验/压缩/repair/重试） | ✅ `architecture/ai/agent-runtime.md` |
| agent-runtime 8 洞修复（双写/并发 resume/流式↔校验/序列化炸弹/interrupt 重放/token/背压/降级路由） | ✅ `architecture/ai/agent-runtime.md` §15 |
| 多 agent 编排 + 污染防火墙 | ✅ `architecture/ai/multi-agent-orchestration.md` |
| 长会话迁移（pin/drain/lease/安全终止；Phase0 子集） | ✅ `architecture/ai/runtime-migration.md` |
| 多模态摄取清洗 → 结构化 ResumeProfile（地基） | ✅ `architecture/backend/ingestion-pipeline.md` |
| factuality 歪曲门（不止缺失） | ✅ `rules/ai/structured-output-and-safety.md` |
| 对抗 golden 安全套件当 release-gate | ✅ spec 定 `rules/ai/safety-defense-in-depth.md` §4 + `devops/ci-cd.md` §1（实装在 S0+ 代码） |
| 题库 metadata 与分类/路由 tier | 🟠 后端、前端、测试、AI 等层级题域尚未在摄取/切块、generation 或生产 Worker 中出现：当前固定“技术岗”，题库/检索无 track 硬过滤。先交付 `PRD-TEST-016 / RAG-FUNNEL-01…06` 的 metadata taxonomy、question-aware generation projection、**自动**岗位意图分类/immutable snapshot、SQL/evidence/cache 隔离和 clean no-result 的一次同桶 LLM 出题；该 fallback 必须有 QuestionPlan、独立 provenance/rubric/score policy，且在评分校准前 B 端影响=0。再按 `PRD-TEST-017 / RAG-FUNNEL-07…08` 为其他自由文本复用规则→轻量模型→未决补充信息漏斗。不得给每题无条件加模型分类，也不得把 CRAG 或当前 generic fallback 叫意图分类器/同桶生成。 |
| ADR 登记册 | ✅ `architecture/adr/README.md` |
| CI/CD（docs:check+lint+合约+golden gate+demo 黄金路径） | ✅ `architecture/devops/ci-cd.md` |
| 旧 `/interview/:id/answer` 假评分旁路 | ✅ 本地组合根止血已验证：代码/OpenAPI 将遗留入口固定为 `410`，B 端数值投影/排序已暂停；`pnpm scor-00:http:prove` 在完整迁移、独立低权 runtime login 的真实 HTTP 中验证 C/B、重放、并发、跨主体调用及所有受检副作用为 0。`SCOR-00H` 另接线消费面诚实闸（无 identity / 空评估不得伪造 0；域 `refuseMappedBSideScore` 恒失败，worker/`markApplicationNoEligibleScore` 仍读 event hint；`GET` 不重跑闸；`pnpm scor-00-honesty:prove`）。回执均为 `releaseEvidence=false`，只证明旁路止血与消费诚实，不是评分闭环；见 `PRD-TEST-001 / SCOR-00`，评分卡、校准与 B 端用途仍由 `SCOR-01…08` 阻断。 |
| 全仓 strict TypeScript gate | 🟠 `packages/db`、`apps/api` 与 `packages/ai-runtime` 的局部 `tsc --noEmit` 可通过；当前 `apps/worker` 全量检查受 LangGraph 依赖缺失及若干 proof 类型错误阻断。尚未建立“所有 workspace（工作区）+ production image（生产镜像）”的单一 CI（持续集成）强制门，不能把局部通过写成全仓发布保证。 |

## P1 — 重要非演示阻塞

| 条目 | 状态 |
|---|---|
| RAG 语料生命周期（双指针/蓝绿/隔离/被遗忘权） | 🟡 QBank generation serving 已接线；通用/全格式 RAG 仍只有控制面与本地合同、没有 rebuild/outbox worker 或请求热路径。见 `PRD-TEST-005`。 |
| 可观测三账本 + 三支柱 | ✅ 策略成文 `observability/observability-strategy.md`；**成本/token 埋点已接线**（`invoke`→`ai_invocation_trace.service/input_tokens/output_tokens/latency_ms`，migration 0011，自库即成本真相，Langfuse 为分析层）。剩余埋点（OTel metrics 导出/告警下钻）随功能续接 |
| 安全/护栏纵深（输入分类→策略→输出审核→升级→审计；危机/over-refusal/AIGC 备案） | ✅ `rules/ai/safety-defense-in-depth.md` |
| 题库生命周期（org 私有/裸题富化/版本 pin/采纳双签/PII 泛化） | ❌ `product/question-bank-lifecycle.md` |
| 人↔AI 语音管线（ASR/TTS/turn-taking/endpointing/延迟/录音同意/B 端不打分） | 🟡 批量 ASR、普通/流式 TTS 与本地取消合同已接线；流式 ASR、服务端 turn-taking、真实抢话与浏览器→API→供应商 E2E 未验证。生产/默认 fail-closed；预览须精确 `VOICE_STREAM_ASR_ENABLED=1`+`VOICE_STREAM_ASR_PREVIEW=1`，仍不接线 live stream、不编造转写。见 `architecture/ai/voice-capability-boundary.md` 与 `PRD-TEST-006`。 |
| 自主研究 agent（异步/沙箱/有界预算/对抗核实/同意 gate） | ❌ `architecture/ai/research-agent.md` |
| C 端 PI 同意 + 简历静态加密 + 删除级联 + 境外 egress 守卫 | 🟡 部分在 data-model，需机制化 |
| 密钥治理 + 泄露 IR（Langfuse key 待轮换） | ❌ `rules/security/secrets-management.md` |
| API/契约版本化与弃用 | ❌ `architecture/backend/api-versioning.md` |
| 数据演进（embedding 蓝绿/记忆和解/prompt eval-gate，MVP 精简集） | 🟠 `.tmp/versioning` 提升 |

## P2 — 规模化才咬人

威胁建模(STRIDE/DFD) · 授权矩阵(RBAC/ABAC) · 部署加固(ports/IMDS/SSRF/WAF) · 双索引/shadow(50万+) · 代码沙箱(技术岗) · a11y/WCAG · 成长档案/职业路径(Phase4)。

## 行走骨架（第一条端到端可演示窄切片）

链路：**上传简历 → 押题 → 一次模拟面试 → 出报告**（纯文本先行，语音后叠）。每步退出准则=可演示。

| # | 步 | 退出准则 |
|---|---|---|
| S0 | monorepo + compose.dev + Prisma 初始 schema + RLS 原语 + CAS 原语 + 事件日志表 | 🟡 进行中：**四原语已 code-validated**（`packages/db`，`pnpm db:prove` 对真 Postgres 全 PASS：CAS 恰一个赢 / 幂等去重 / RLS 越权=0 fail-closed / 事件 seq 单调）；Prisma schema + monorepo 应用层待续 |
| S1 | zod4 契约 + demo 登录 + principalContext 全路径注入 | 🟡 请求路径 code-validated（`apps/api`，`pnpm api:validate` 7/7：无principal→401、越权→404 不泄露存在性、HTTP 幂等）；zod4 契约 + 真登录待补 |
| S2 | 简历上传 → 摄取清洗 → 结构化 ResumeProfile（PII 闸+加密） | ✅ **code-validated**（`packages/db` + `domain.ingestResume`，2026-08-10 的 `pnpm resume:prove` 在 64 个迁移后的隔离 PostgreSQL（关系型数据库）通过 32/32，`releaseEvidence=false`，**经安全审计修 PII-strip 漏网/裸 sha 预言机/fail-open 密钥/FK 绕 RLS 等 P0-P1**）：原文 `pgp_sym_encrypt` 加密落 blob、结构化 profile 永不含明文 PII（NFKC 归一 + 行内/+86/全角脱敏 + ≥11 位数字 fail-closed 兜底）、注入拦截、状态机 CAS 原子完成、HMAC 去重、复合 FK 强制同 owner、RLS 越权=0、越权解密被拒。PDF/多模态抽取适配器层待补（本期 text；不代表全格式 RAG 或完整删除权）。|
| S3 | ai-runtime invoke 管线（catalog+PII 区域门+双校验+重试封顶+幂等键） | ✅ 内核 code-validated（`pnpm runtime:prove`：schema 失败重试/幻觉拦截/确定性拒绝不重试/幂等 exactly-once）；catalog+PII 区域门待补 |
| S4 | resume-quiz graph（押题）+ factuality 歪曲门 | 基于真简历出押题，无幻觉资历；2026-08-10 在 64 个迁移后的隔离 PostgreSQL（关系型数据库）`pnpm quiz:prove` 25/25，`releaseEvidence=false`。 |
| S5 | mock-interview graph：threadId=resultId + checkpointer + interrupt waiting_user + 事件账本 + lease | ✅ 内核 code-validated（`pnpm runtime:prove`：CAS 迁移/事件 seq/租约拒并发/**进程重启后纯从 DB 恢复 waiting_user，无内存 session**）；**真 LangGraph 图已验证**（`pnpm graph:prove`：interrupt + Postgres checkpointer + 重启续会话） |
| S6 | SSE 业务事件 + 报告子图（舱壁）+ 失败可重试降级态 | ✅ SSE Last-Event-ID 重放 code-validated（`pnpm api:validate`，不丢不重）；**报告子图舱壁**在 64 个迁移后的隔离数据库通过 `pnpm report:prove` 36 断言：报告作后台 job（后台任务）、失败不碰 interview（失败隔离）、3 事务生命周期（模型在事务外跑，不占连接/不持事件流锁）、租约防并发双跑、崩溃重领、stale finalize（过期收口）不发假事件、poison-pill（毒丸）超 MAX_ATTEMPTS（最大尝试次数）隔离 quarantined（隔离态）、ready 才发 report_ready。回执仍为 `releaseEvidence=false`；真长连接续推、真实模型与云端 worker 待验。 |
| S7 | commerce：共享权益池 reserve→confirm→release saga + FIFO + 按比例 + outbox 真实结算 + lease 心跳 | ✅ **code-validated**：2026-08-10 的 `pnpm commerce:prove` 在 64 个迁移后的隔离 PostgreSQL（关系型数据库）通过 50/50，`releaseEvidence=false`。覆盖 FIFO（先到期先扣）/全有全无/降级按比例大余数分账（Σ===settled 无分币泄漏）/幂等不重扣/**并发不超卖（FOR UPDATE+CAS）**/RLS（行级安全）越权=0/**outbox 真实结算入 `settlement_ledger` exactly-once（精确一次）**/**lease（租约）心跳续约 + 原子回收（修 heartbeat-vs-sweep TOCTOU，检查与使用竞争）**/同支付流水全局一次入账/确认与放弃终态配对。真实支付回调、云故障和资金清算仍待验。|

每步必带：四原语落齐、状态机转换、可观测埋点、对应测试（含失败/并发/越权用例）。

**报告 worker 生产部署待办（审计 round4 ops riders,非阻塞,部署清单跟进）**：① BYPASSRLS 的 **dispatcher 最小权限角色**（只 SELECT `ai_report.owner_user_id`,非 superuser 池）；② 枚举器加 `LIMIT`/游标 + 按 owner 并行 drain（高扇出前）；③ quarantined 报告的**运维告警面**（指标/管理员列表）；④ 终态事件可选 `UNIQUE(stream_key,kind)` 或文档化"SSE 消费者必须幂等"。

**commerce 对账已接线（原「built-but-not-called」已消除）**：`runCommerceReconciler`（`apps/worker`，30s 一拍）已在 worker 主循环启动——回收租约过期的孤儿预留（退额度回池、零泄漏）+ 对被弃 `mock_interview` 置终态 `abandoned` + 补发 `interview_unavailable` 终态事件 + `settleOutbox` 真实入结算账本（`SKIP LOCKED` 幂等、多实例安全）。心跳续约由 interview-consumer 每轮 job 调 `renewReservationLease`。此前 sweep/settle/renew 已建但零生产调用方，现为 **WIRED**。同时接线的稳态修复：**job-death/reap 标 `interview.status='failed'`**（消除"可复用尸体"reuse-trap）；**migration 0005 策略 `DROP IF EXISTS` 守卫**（原非幂等 → 脏库重跑崩 worker，已修）。

### 代码验证现状（可复跑 gate）

| gate | 命令 | 验证内容 |
|---|---|---|
| 四原语 | `pnpm db:up && pnpm db:prove` | CAS 恰一个赢 / 幂等去重 / RLS 越权=0 fail-closed / 事件 seq 单调（对真 Postgres） |
| 运行内核 | `pnpm runtime:prove` | invoke 双校验·重试分类·幂等 exactly-once / 状态机 CAS / 租约拒并发 / **进程重启纯从 DB 恢复（无内存 session）**（19/19） |
| 请求路径 + SSE（**真 NestJS**） | `pnpm api:validate` | **Fastify + 类型 DI + SWC**（已 re-home，弃手搓 http 与 @Inject 绕法）；principal 注入 / RLS fail-closed（401/404）/ HTTP 幂等 / SSE Last-Event-ID 重放（面试）+ 押题/诊断非法游标 HTTP 400（`HC-GAP-006`）。must-smoke #1（NestJS×SWC×Fastify×类型DI）已验证 |
| 真 LangGraph 图 | `pnpm graph:prove` | StateGraph + interrupt 等待用户 + **Postgres checkpointer**：换新实例（模拟重启）从 Postgres 续会话、多 thread 隔离（6/6） |
| commerce saga | `pnpm commerce:prove` | 共享池 reserve/confirm/release + FIFO + 降级按比例（大余数分账,Σconsume===settled 无分币泄漏）+ 幂等不重扣 + **并发不超卖** + RLS（行级安全）越权=0 + **outbox 真实结算 exactly-once（精确一次）入账本** + **lease（租约）心跳 + 原子回收（无 TOCTOU，检查与使用竞争）** + 数据库容量 CHECK（检查约束）兜底（64 个迁移下 50 断言，本地 `releaseEvidence=false`）。 |
| 简历摄取 | `pnpm resume:prove` | 原文加密落 blob + 结构化 profile **永不含明文 PII**（NFKC + 行内/+86/全角脱敏 + ≥11 位数字 fail-closed）+ 注入拦截 + 状态机 CAS 原子完成 + HMAC 去重（非裸 sha 预言机）+ 复合 FK 强制同 owner + RLS 越权=0 + 越权解密被拒（64 个迁移、32/32 断言、**经 3 轮安全审计**、本地 `releaseEvidence=false`）；不证明 PDF（可移植文档格式）/音视频/表格解析或完整简历删除。 |
| 报告子图舱壁 | `pnpm report:prove` | 报告作后台 job（后台任务）：**失败隔离（报告失败不碰 interview）** + 3 事务生命周期（模型在事务外）+ 租约防并发双跑 + 崩溃重领 + stale finalize（过期收口）不发假事件 + poison-pill（毒丸）退避 + 超限 quarantined（隔离态）+ **quarantine 发 report_unavailable 终态事件（不静默死胡同）** + **多租户 dispatcher（调度器）真排干队列** + RLS（行级安全）越权=0（64 个迁移下 36 断言，本地 `releaseEvidence=false`）。不把该脚本模型测试当成真实报告质量、云端 worker 或外部通知证据。 |
| 孤儿任务收割 | `pnpm reaper:prove` | 面试与押题 job（后台任务）在 64 个迁移后的隔离 PostgreSQL（关系型数据库）通过 28 断言：心跳—收割竞态、重试边界、失败退款、重复收割幂等、已结算不倒退，以及 v64 failed start（开始）后 answer（回答）任务的数据库拒绝入队；回执为本地 `releaseEvidence=false`，不等于云端多副本崩溃演练。 |
| 契约 must-smoke | `pnpm api:smoke` | NestJS×SWC×Fastify×类型DI + `@meetwise/contracts` zod4 校验（合法 200 / 非法 400） |
| **端到端 agent 主干** | `pnpm interview:prove`（64 个迁移、脚本模型、隔离运行器） | 固定题单 `interview-lifecycle` 已退役并失败关闭；当前唯一主链为 v64 parent（父面试）`(resume_id,resume_privacy_epoch)` → durable job（持久任务）→ adaptive consumer（自适应消费者）→ LangGraph（图编排框架）→ 评分/结算 → 报告舱壁。2026-08-10 本地隔离为 11/11，`releaseEvidence=false`；不再把旧 `flow:prove` 或历史“真模型贯通”写作当前发布证据。 |
| 前端承重逻辑 | `pnpm web:prove` | SSE 业务事件解码(CRLF/心跳/分块) + 契约客户端(HTTP 状态分流 business/transport/drift + 强制幂等键) + 视图归约**无静默死胡同**(report_unavailable→degraded / 流断→reconnecting / 重连耗尽→出口)（27 断言,**经协议/安全审计**） |

> 最难、最差异化的路径已 code-validated；外围按"建完即跑验证"推进。

### 安全加固（本轮已接线）

| 项 | 状态 |
|---|---|
| 会话吊销（`PrincipalGuard` 验签后查 `user_account.status='active'`,60s 缓存 → 禁用/改密即失效） | ✅ 已接线 `apps/api` |
| 语音端点限流 `voiceGate`（防成本 DoS） + 登录/注册限流（爆破/滥注册） | ✅ 已接线 `RateLimitService` |
| CORS 生产 fail-closed（漏配 `WEB_ORIGIN` 拒绝启动,不反射任意 Origin） | ✅ `apps/api/main.ts` |
| 安全响应头（CSP/X-Frame-Options=DENY/HSTS/frame-ancestors none） | ✅ `apps/web/next.config.mjs` |
| RLS（行级安全）`FORCE ROW LEVEL SECURITY` + 越权=0 | 🟡 运行 Compose 已配置低权账号；API 的用户自助订单访问均经 RLS，跨用户账户/支付/队列/费用账本不再裸读。独立库 proof 已通过；仍缺同构 Compose 全链路与 checkpoint 每行 owner-RLS，未达到最小权限最终发布线 |
| migration 幂等（0005 策略 `DROP IF EXISTS` 守卫;0011 加 trace token 列） | ✅ 已修 |

### 🟡 已建未接线 / 待建（诚实剩余，勿当已交付）

区分**已接线运行** vs **已建未接线** vs **纯待建**：

| 项 | 现状 |
|---|---|
| **长期记忆模块** | 🟡 **部分接线**：完成后写系统题面的 `episode`，`wasAsked` 做跨会话 exact 去重；`assessment_report` 的弱项维度只读软偏置能力排序。语义 `user_memory` 向量召回、冻结 snapshot、信念画像和删除/同意闭环仍未接线；登记为 `PRD-TEST-011`（见 `architecture/ai/memory-context-design.md`）。 |
| **上下文记忆 / 语义压缩** | 🟡 **只有有界输入，不是摘要记忆**：当前按服务字符上限截断并加标记，评分只读当前题答；没有 tokenizer 精确预算、版本化摘要、可重放压缩边界或撤回传播。登记为 `PRD-TEST-012`。 |
| **Web 探索（CRAG 联网 fallback）** | 🟢 **机制已接线且默认开启**：`webExplore`(SSRF 安全 fetch:逐跳重定向复核 + 私网/allowlist 复核 + 硬超时 + fail-soft)已建;`DEFAULT_WEB_ALLOWLIST` 含 6 个官方文档源作 CRAG fallback 外呼(env `WEB_ALLOWLIST` 覆盖,显式空串才关)。**真正未建**:策展题库源表 + 审核门 + 扩召回 + 跨租户投毒断言 |
| **跨供应商模型 failover** | 🟡 **机制已接线,backup 未配**：`failoverModel` 链已建并接进默认客户端,但需配 `MODEL_BACKUP_*` 才真有第二供应商;未配等价单端点 |
| **图片简历 OCR（光学字符识别）** | 🟠 **预览版 API+Web 可走通，生产仍 disabled**：`0127` 已在 main。预览双旗 `OCR_ENABLED=1`+`OCR_PREVIEW=1` 时 API 可 bind→`visionOcr`→admit，Web `/resume` 才接受图片；关闭态不接受 `image/*`，失败不编造转写。生产/enforce/公开只读预览或缺旗仍 `422 image_ocr_unavailable`。不是视觉质量 SLO，`releaseEvidence=false`。媒体预算、token ledger、删除合同、浏览器 E2E 质量仍未关。 |
| **起步题库语料** | 🟡 **toy corpus**：仅 ~32 条自撰种子;**真正策展/授权题库 + 离线策展灌入管线未建**(P1「题库生命周期」❌) |
| **容灾备份 / PITR / 只读副本** | ❌ **未配**：模型层 failover 有机制,但 DB 备份/故障转移/演练未落地(部署清单跟进) |
| Next 渲染壳层 + EventSource 重连驱动 · CI eval gate | 🟠 承重逻辑已 code-validated,壳层/门禁续接 |

## 刻意不做 / 暂不做（什么时候不做的判断）

- **swarm**：流程是已知 DAG，去中心化对等交接只丢确定性/可观测/成本控制。
- **AI 给自己报告打分当权威**：考核信度红线，反思只做内部校验。
- **语义缓存 / HyDE / multi-query**：eval 门控，实测差才上；个性化缓存命中 3–5% ROI 低。
- **K8s / IaC**：demo 期单机 compose，规模化再上。
- **双索引/shadow embedding**：50 万向量+才需，MVP 直接全量重嵌。
- **代码沙箱 / 语音**：抬维度非补短板，骨架跑通后评估（语音是产品核心，但排在文本可恢复骨架之后）。

## 自驱执行顺序

1. land 孤儿：可观测 spec（🟠）；提升 versioning（🟠）。
2. 补 P0 从零：ingestion-pipeline、ADR、ci-cd、安全纵深、factuality 歪曲门、agent-runtime 8 洞收口；已识别的多题域面试先按 `PRD-TEST-016` 建 metadata 数据面隔离、**自动**岗位路由快照和 clean no-result 的同桶 LLM fallback，再按 `PRD-TEST-017` 在其他自由文本入口复用分类漏斗，不能为每题无条件堆叠分类模型。
3. 已决未成文：题库生命周期、语音、自主研究、密钥治理、API 版本化。
4. 行走骨架 S0→S6（动代码）。

> 进度看板即本文；每完成一项把状态翻 ✅ 并指向落地文件。
